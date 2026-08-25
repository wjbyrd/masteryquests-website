import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  bridgeQuestions,
  ordinaryQuestions,
  PHASE2B_OWNERSHIP,
  PHASE2B_SOURCE_VERSION,
  repairQuestions
} from "../play/economic-realm/national-ledger/authoring/national_ledger_phase2b_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "play/economic-realm/national-ledger/national_ledger_questions_student.js");
const baselinePath = path.join(root, "audit_tools/national_ledger_phase2b_legacy_baseline.json");
const sourceGroups = { ordinary: ordinaryQuestions, repair: repairQuestions, bridge: bridgeQuestions };
const phaseIds = new Set(Object.values(sourceGroups).flat().map(record => String(record.id)));
const normalize = value => String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const answerHash = value => crypto.createHash("sha256").update(normalize(value)).digest("hex");
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");

function cleanGroup(group) {
  return Object.fromEntries(Object.entries(group).map(([key, rows]) => [
    key,
    rows.filter(record => !phaseIds.has(String(record.id)))
  ]));
}

function readCurrent() {
  const source = fs.readFileSync(target, "utf8");
  const context = { crypto: crypto.webcrypto, TextEncoder };
  vm.createContext(context);
  vm.runInContext(`${source}\n;globalThis.__banks=questionBanks;globalThis.__repair=microSkillRepairPools;globalThis.__bridge=microSkillBridgePools;`, context);
  return {
    banks: cleanGroup(context.__banks),
    repair: cleanGroup(context.__repair),
    bridge: cleanGroup(context.__bridge)
  };
}

function orderedRows(groups) {
  return Object.entries(groups).flatMap(([groupName, group]) =>
    Object.entries(group).flatMap(([poolName, rows]) =>
      rows.map((record, index) => ({ groupName, poolName, index, record }))
    )
  );
}

function legacyManifest(groups) {
  const rows = orderedRows(groups);
  return {
    schemaVersion: "1.0.0",
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    bankPath: path.relative(root, target).replaceAll("\\", "/"),
    legacyRecordCount: rows.length,
    orderedIdentitySha256: sha256(rows.map(row => `${row.groupName}|${row.poolName}|${row.index}|${row.record.id}`).join("\n")),
    serializedRecordSha256: sha256(rows.map(row => JSON.stringify(row.record)).join("\n")),
    groupCounts: Object.fromEntries(Object.entries(groups).map(([groupName, group]) => [
      groupName,
      Object.fromEntries(Object.entries(group).map(([poolName, records]) => [poolName, records.length]))
    ]))
  };
}

function rotateOptions(record) {
  const options = [...record.distractors];
  options.splice(Number(record.id) % 4, 0, record.answer);
  return options;
}

function publish(record, role) {
  return {
    id: record.id,
    sourceGame: "nationalLedger",
    difficulty: role === "ordinary" ? record.pool : role,
    conceptCluster: record.conceptCluster,
    primarySkill: record.skill,
    secondarySkills: record.secondarySkills,
    repairSkill: record.skill,
    commonError: record.commonError,
    q: record.q,
    options: rotateOptions(record),
    tag: record.tag,
    type: record.type,
    objective: record.objective,
    feedback: record.feedback,
    sourceCurationPhase: "phase2b-national-ledger",
    aHash: answerHash(record.answer)
  };
}

function validateAuthoring() {
  const errors = [];
  const ids = new Set();
  for (const [role, records] of Object.entries(sourceGroups)) {
    const ownership = PHASE2B_OWNERSHIP[role];
    if (records.length !== ownership.expected) {
      errors.push(`${role}: expected ${ownership.expected} records, found ${records.length}; update the documented cardinality when expanding this batch`);
    }
    for (const record of records) {
      if (ids.has(String(record.id))) errors.push(`duplicate author ID ${record.id}`);
      ids.add(String(record.id));
      if (record.id < ownership.start || record.id > ownership.end) errors.push(`${role}: ID ${record.id} is outside ${ownership.start}-${ownership.end}`);
      if (!record.q || !record.answer || record.distractors?.length !== 3) errors.push(`invalid author schema ${record.id}`);
      if (new Set([record.answer, ...(record.distractors || [])].map(normalize)).size !== 4) errors.push(`non-distinct options ${record.id}`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

function render() {
  validateAuthoring();
  const groups = readCurrent();
  const baseline = legacyManifest(groups);
  if (baseline.legacyRecordCount !== 651) throw new Error(`expected 651 protected legacy records, found ${baseline.legacyRecordCount}`);
  if (fs.existsSync(baselinePath)) {
    const expected = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    for (const key of ["legacyRecordCount", "orderedIdentitySha256", "serializedRecordSha256"]) {
      if (baseline[key] !== expected[key]) throw new Error(`legacy baseline mismatch: ${key}`);
    }
  }
  for (const record of ordinaryQuestions) (groups.banks[record.pool] ||= []).push(publish(record, "ordinary"));
  for (const record of repairQuestions) (groups.repair[record.skill] ||= []).push(publish(record, "repair"));
  for (const record of bridgeQuestions) (groups.bridge[record.skill] ||= []).push(publish(record, "bridge"));
  const count = orderedRows(groups).length;
  const helper = `/** Normalize answer text exactly as the publisher did. */\nfunction normalizePublishedAnswer(value) {\n  return String(value)\n    .normalize("NFKC")\n    .trim()\n    .replace(/\\s+/g, " ")\n    .toLowerCase();\n}\n\n/** Return the lowercase SHA-256 hex digest used by aHash. */\nasync function hashPublishedAnswer(value) {\n  const bytes = new TextEncoder().encode(normalizePublishedAnswer(value));\n  const digest = await crypto.subtle.digest("SHA-256", bytes);\n  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");\n}\n\n/** Check selected option text against a published question record. */\nasync function isPublishedAnswerCorrect(question, selectedOptionText) {\n  if (!question || typeof question.aHash !== "string") return false;\n  return (await hashPublishedAnswer(selectedOptionText)) === question.aHash;\n}`;
  return `/*\n * STUDENT-FACING QUESTION BANK\n * Generated by audit_tools/publish_national_ledger_phase2b.mjs\n * Source version: ${PHASE2B_SOURCE_VERSION}\n * Questions converted: ${count}\n *\n * DO NOT EDIT THIS FILE DIRECTLY.\n * Edit the scoped Phase 2B author source and run the publisher again.\n * The unavailable private source for the protected legacy bank was not reconstructed.\n * Plaintext answers have been removed and replaced with SHA-256 hashes.\n */\n\n"use strict";\n\n${helper}\n\nconst questionBanks = ${JSON.stringify(groups.banks, null, 2)};\n\nconst microSkillRepairPools = ${JSON.stringify(groups.repair, null, 2)};\n\nconst microSkillBridgePools = ${JSON.stringify(groups.bridge, null, 2)};\n`;
}

if (process.argv.includes("--write-baseline")) {
  const manifest = legacyManifest(readCurrent());
  if (manifest.legacyRecordCount !== 651) throw new Error(`expected 651 protected legacy records, found ${manifest.legacyRecordCount}`);
  fs.writeFileSync(baselinePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`WROTE ${path.relative(root, baselinePath)} (${manifest.legacyRecordCount} protected records)`);
  process.exit(0);
}

const generated = render();
if (process.argv.includes("--write")) {
  fs.writeFileSync(target, generated, "utf8");
  console.log(`WROTE ${path.relative(root, target)} (${ordinaryQuestions.length} ordinary, ${repairQuestions.length} Repair, ${bridgeQuestions.length} Bridge)`);
} else {
  const current = fs.readFileSync(target, "utf8");
  if (current !== generated) {
    console.error("FAIL: generated National Ledger student bank is stale; run with --write");
    process.exit(1);
  }
  console.log("PASS: generated National Ledger student bank matches the Phase 2B authoring source");
}
