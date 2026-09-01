#!/usr/bin/env node

import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import {
  auditQuestionRecords,
  collectComposerQuestions,
  loadComposerLibrary,
} from "./question_quality_auditor.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIBRARY_REL = "build/faculty-build-composer/data/composer_library.js";
const LIBRARY_PATH = path.join(ROOT, LIBRARY_REL);
const COMPOSER_ROOT = path.join(ROOT, "build", "faculty-build-composer");
const LEDGER_PATH = path.join(ROOT, "validation_artifacts", "question_quality", "question_rewrite_master_execution_ledger.json");
const OUTPUT_PATH = path.join(ROOT, "validation_artifacts", "question_quality", "question_rewrite_master_validation.json");

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const answerHash = (value) => sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function parseLibrary(source, filename) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map((key) => [key, question[key] ?? null]));
  return sha256(stable(payload));
}
function entryId(entry) { return String(entry.question.canonicalId ?? entry.question.id); }
function correctIndex(question) {
  const expected = String(question.aHash ?? "").replace(/^sha256:/, "");
  const matches = (question.options ?? []).map((option, index) => answerHash(option) === expected ? index : -1).filter((index) => index >= 0);
  return matches.length === 1 ? matches[0] : -1;
}
function inventoryMap(library) {
  const assets = new Map();
  for (const asset of library.assetInventory ?? []) {
    for (const value of [asset.runtimePath, asset.sourceAssetPath, asset.sourceUrl, asset.filename]) if (value) assets.set(String(value).replaceAll("\\", "/"), asset);
  }
  return assets;
}
function findingKey(finding) { return `${finding.severity}:${finding.questionId}:${finding.rule}`; }

const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
const library = loadComposerLibrary(LIBRARY_PATH);
const headLibrary = parseLibrary(childProcess.execFileSync("git", ["show", `HEAD:${LIBRARY_REL}`], {
  cwd: ROOT,
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
}), `HEAD:${LIBRARY_REL}`);
const currentEntries = collectComposerQuestions(library);
const headEntries = collectComposerQuestions(headLibrary);
const currentById = new Map(currentEntries.map((entry) => [entryId(entry), entry]));
const headById = new Map(headEntries.map((entry) => [entryId(entry), entry]));
const ledgerById = new Map(ledger.entries.map((entry) => [String(entry.questionId), entry]));
const issues = [];
const check = (condition, message) => { if (!condition) issues.push(message); };

check(ledger.entries.length === 1915, `Authorized ledger count is ${ledger.entries.length}.`);
check(ledger.counts.authorized === 1915, `Authorized workbook count is ${ledger.counts.authorized}.`);
check(ledger.librarySha256 === library.librarySha256, "Ledger and Composer library hashes differ.");
check(library.canonicalQuestionCount === headLibrary.canonicalQuestionCount, "Canonical question count changed.");
check(currentEntries.length === headEntries.length, "Physical question-record count changed.");

const verifiedEntries = [];
for (const record of ledger.entries) {
  const current = currentById.get(String(record.questionId));
  const before = headById.get(String(record.questionId));
  check(Boolean(current), `Missing current record ${record.questionId}.`);
  check(Boolean(before), `Missing HEAD record ${record.questionId}.`);
  if (!current || !before) continue;
  check(stable(current.question) === stable(record.after), `Final state mismatch ${record.questionId}.`);
  check(stable(before.question) === stable(record.before), `Immutable before-state mismatch ${record.questionId}.`);
  check(correctIndex(current.question) === record.answerKeyIndex, `Answer-key index changed ${record.questionId}.`);
  check(current.question.sourceHash === sourceHash(current.question), `Source hash mismatch ${record.questionId}.`);
  check((current.question.sourceOccurrences ?? []).every((occurrence) => occurrence.sourceHash === current.question.sourceHash && occurrence.sourceCurationPhase === ledger.phase), `Source occurrence mismatch ${record.questionId}.`);
  verifiedEntries.push(current);
}

const changedRecords = [];
for (const [recordId, current] of currentById) {
  const before = headById.get(recordId);
  if (!before || stable(before.question) !== stable(current.question)) changedRecords.push(current);
}
const unauthorizedChanged = changedRecords.filter((entry) => !ledgerById.has(String(entry.question.id)));
check(unauthorizedChanged.length === 0, `Unauthorized question changes: ${unauthorizedChanged.map((entry) => entry.question.id).join(", ")}`);
check(changedRecords.length === 1915, `Expected 1915 authorized changed records; found ${changedRecords.length}.`);

const assets = inventoryMap(library);
const headAssets = inventoryMap(headLibrary);
const beforeAudit = auditQuestionRecords(headEntries, { assetMap: headAssets, composerRoot: COMPOSER_ROOT });
const afterAudit = auditQuestionRecords(currentEntries, { assetMap: assets, composerRoot: COMPOSER_ROOT });
const beforeErrors = new Set(beforeAudit.findings.filter((finding) => finding.severity === "ERROR").map(findingKey));
const newErrors = afterAudit.findings.filter((finding) => finding.severity === "ERROR" && !beforeErrors.has(findingKey(finding)));
const beforeGraphMismatch = new Set(beforeAudit.findings.filter((finding) => finding.rule === "graph-question-evidence-mismatch").map(findingKey));
const newGraphMismatch = afterAudit.findings.filter((finding) => finding.rule === "graph-question-evidence-mismatch" && !beforeGraphMismatch.has(findingKey(finding)));
check(newErrors.length === 0, `New question-quality errors: ${newErrors.map((finding) => finding.questionId).join(", ")}`);
check(newGraphMismatch.length === 0, `New graph-evidence mismatches: ${newGraphMismatch.map((finding) => finding.questionId).join(", ")}`);

for (const restoration of ledger.specialEvidenceRestorations ?? []) {
  const asset = assets.get(restoration.image);
  const file = path.join(COMPOSER_ROOT, "data", restoration.image);
  check(Boolean(asset), `Unregistered restored asset ${restoration.image}.`);
  check(fs.existsSync(file), `Missing restored asset ${restoration.image}.`);
  if (asset && fs.existsSync(file)) {
    const bytes = fs.readFileSync(file);
    check(bytes.length === asset.sizeBytes && sha256(bytes) === asset.sha256, `Integrity mismatch ${restoration.image}.`);
  }
}

const result = {
  phase: ledger.phase,
  status: issues.length ? "FAIL" : "PASS",
  counts: {
    authorized: 1915,
    applied: ledger.counts.applied,
    alreadyMatched: ledger.counts.alreadyMatched,
    blocked: ledger.counts.blocked,
    failedVerification: issues.length,
    verified: verifiedEntries.length,
    changedQuestionRecords: changedRecords.length,
    unauthorizedChangedQuestionRecords: unauthorizedChanged.length,
  },
  answerKeyPositionsPreserved: issues.every((issue) => !issue.startsWith("Answer-key index changed")),
  audit: {
    before: beforeAudit.counts,
    after: afterAudit.counts,
    newErrors: newErrors.map((finding) => ({ questionId: finding.questionId, rule: finding.rule })),
    newGraphEvidenceMismatches: newGraphMismatch.map((finding) => ({ questionId: finding.questionId, rule: finding.rule })),
  },
  evidenceRestorationsVerified: ledger.specialEvidenceRestorations?.length ?? 0,
  libraryVersion: library.libraryVersion,
  librarySha256: library.librarySha256,
  issues,
};

if (process.argv.includes("--write")) fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exit(1);
