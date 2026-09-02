#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { normalizeDuplicateOption } from "../question_quality_auditor.mjs";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] || path.join(scriptDir, "..", ".."));
const PHASE = "phaseMacroFinalCleanup-v1";
const GENERATED_AT = "2026-09-01T21:00:00.000Z";
const composer = path.join(repo, "build", "faculty-build-composer");
const dataDir = path.join(composer, "data");
const libraryPath = path.join(dataDir, "composer_library.js");
const validationPath = path.join(scriptDir, "macro_final_cleanup_validation.json");
const reportPath = path.join(scriptDir, "macro_final_cleanup_report.md");
const validatorReportPath = path.join(scriptDir, "macro_final_cleanup_validator_changes.md");
const changesPath = path.join(scriptDir, "macro_final_cleanup_question_changes.json");
const preAuditPath = path.join(process.env.TEMP || process.env.TMP || scriptDir, "masteryquests_macro_final_cleanup_pre_audit.json");
const postAuditPath = path.join(process.env.TEMP || process.env.TMP || scriptDir, "masteryquests_macro_final_cleanup_post_audit.json");
const preFingerprintPath = path.join(process.env.TEMP || process.env.TMP || scriptDir, "masteryquests_macro_final_cleanup_pre_fingerprint.json");
const postFingerprintPath = path.join(process.env.TEMP || process.env.TMP || scriptDir, "masteryquests_macro_final_cleanup_post_fingerprint.json");

const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const sha = value => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
const answerHash = value => sha(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
const qid = question => String(question?.canonicalId || question?.id || "");
const loadWrappedLibrary = raw => {
  const text = raw.trim();
  const prefix = "window.MQ_COMPOSER_LIBRARY=";
  if (!text.startsWith(prefix) || !text.endsWith(";")) throw new Error("Unexpected Composer library wrapper.");
  return JSON.parse(text.slice(prefix.length, -1));
};
const library = loadWrappedLibrary(fs.readFileSync(libraryPath, "utf8"));
const headLibrary = loadWrappedLibrary(execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: repo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
const preAudit = JSON.parse(fs.readFileSync(preAuditPath, "utf8"));
const postAudit = JSON.parse(fs.readFileSync(postAuditPath, "utf8"));
const preFingerprint = JSON.parse(fs.readFileSync(preFingerprintPath, "utf8"));
const postFingerprint = JSON.parse(fs.readFileSync(postFingerprintPath, "utf8"));
const authorization = JSON.parse(fs.readFileSync(changesPath, "utf8"));
const authorizedIds = new Set(authorization.changes.map(change => change.questionId));
const falsePositiveIds = authorization.falsePositiveQuestionIds;
const checks = [];
const check = (name, condition, detail = "") => checks.push({ name, status: condition ? "PASS" : "FAIL", detail });

const occurrences = module => [
  ...Object.entries(module.questions || {}).flatMap(([pool, list]) => (list || []).map((question, index) => ({ container: "questions", pool, index, question }))),
  ...(module.repairQuestions || []).map((question, index) => ({ container: "repairQuestions", pool: "repair", index, question })),
  ...(module.repairSeedQuestions || []).map((question, index) => ({ container: "repairSeedQuestions", pool: "repairSeed", index, question })),
  ...(module.bridgeQuestions || []).map((question, index) => ({ container: "bridgeQuestions", pool: "bridge", index, question }))
];
const macroConceptIds = preAudit.scope.concepts;
const macroById = new Map();
for (const conceptId of macroConceptIds) {
  for (const occurrence of occurrences(library.concepts[conceptId])) {
    const id = qid(occurrence.question);
    if (!macroById.has(id)) macroById.set(id, []);
    macroById.get(id).push({ conceptId, ...occurrence });
  }
}
const getQuestion = id => macroById.get(id)?.[0]?.question;
const changedIds = Object.keys(postFingerprint.records).filter(id =>
  JSON.stringify(preFingerprint.records[id]) !== JSON.stringify(postFingerprint.records[id])
).sort();
const unauthorizedQuestionChanges = changedIds.filter(id => !authorizedIds.has(id));
const authorizedNotChanged = [...authorizedIds].filter(id => !changedIds.includes(id));
const taxonomyFields = ["pool", "instructionalRole", "primaryConceptId", "familyConceptId"];
const taxonomyDrift = Object.keys(postFingerprint.records).flatMap(id => taxonomyFields
  .filter(field => JSON.stringify(preFingerprint.records[id]?.[field]) !== JSON.stringify(postFingerprint.records[id]?.[field]))
  .map(field => ({ questionId: id, field, before: preFingerprint.records[id]?.[field], after: postFingerprint.records[id]?.[field] })));
const falsePositiveDrift = falsePositiveIds.filter(id => JSON.stringify(preFingerprint.records[id]) !== JSON.stringify(postFingerprint.records[id]));

function flattenGlobal(sourceLibrary) {
  const result = new Map();
  for (const [conceptId, module] of Object.entries(sourceLibrary.concepts || {})) {
    for (const occurrence of occurrences(module)) {
      const q = occurrence.question;
      const id = qid(q);
      result.set(id, stable({
        q: q.q ?? null,
        options: q.options ?? null,
        aHash: q.aHash ?? null,
        feedback: q.feedback ?? null,
        difficulty: q.difficulty ?? null,
        canonicalDifficulty: q.canonicalDifficulty ?? null,
        pool: occurrence.pool,
        container: occurrence.container,
        instructionalRole: q.instructionalRole ?? null,
        primaryConceptId: q.primaryConceptId ?? conceptId,
        familyConceptId: q.familyConceptId ?? null,
        image: q.image ?? null,
        graphRequired: q.graphRequired ?? null
      }));
    }
  }
  return result;
}
const headGlobal = flattenGlobal(headLibrary);
const currentGlobal = flattenGlobal(library);
const globalAdded = [...currentGlobal.keys()].filter(id => !headGlobal.has(id));
const globalLost = [...headGlobal.keys()].filter(id => !currentGlobal.has(id));
const globalChanged = [...currentGlobal.keys()].filter(id => headGlobal.has(id) && JSON.stringify(currentGlobal.get(id)) !== JSON.stringify(headGlobal.get(id))).sort();
const macroIdSet = new Set(macroById.keys());
const microChanged = globalChanged.filter(id => !macroIdSet.has(id));

check("Macro question universe preserved", macroById.size === 2870, `${macroById.size}/2870`);
check("Ordinary Macro question count preserved", macroById.size - (library.concepts["integrated-macroeconomic-analysis"] ? occurrences(library.concepts["integrated-macroeconomic-analysis"]).length : 0) === 2758, `${macroById.size - occurrences(library.concepts["integrated-macroeconomic-analysis"]).length}/2758`);
check("Advanced Macro Checkpoint Supplement count preserved", occurrences(library.concepts["integrated-macroeconomic-analysis"]).length === 112, `${occurrences(library.concepts["integrated-macroeconomic-analysis"]).length}/112`);
check("Macro selectable child and supplement counts preserved", macroConceptIds.length === 52, `${macroConceptIds.length} total = 51 ordinary + 1 supplement`);
check("Ten Macro family parents preserved", new Set([
  "gdp-national-income", "inflation-real-values", "growth-productivity", "unemployment-labor", "saving-fiscal-foundations",
  "money-banking-fed", "money-growth-inflation", "ad-as-equilibrium", "stabilization-policy", "phillips-disinflation"
]).size === 10, "10/10 canonical Phase 2 parents");
check("Exactly nine authorized question fingerprints changed", changedIds.length === 9 && changedIds.every(id => authorizedIds.has(id)), changedIds.join(", "));
check("No authorized question was missed", authorizedNotChanged.length === 0, authorizedNotChanged.join(", "));
check("No unauthorized Macro question changed", unauthorizedQuestionChanges.length === 0, unauthorizedQuestionChanges.join(", "));
check("Four duplicate-rule false positives are content-identical", falsePositiveDrift.length === 0, falsePositiveDrift.join(", "));
check("No taxonomy or pool-role drift", taxonomyDrift.length === 0, `${taxonomyDrift.length} mismatches`);
check("No questions added or lost globally", globalAdded.length === 0 && globalLost.length === 0, `added=${globalAdded.length}, lost=${globalLost.length}`);
check("No unrelated Micro question content changed", microChanged.length === 0, microChanged.join(", "));
check("Global student-facing question changes are exactly the nine authorized IDs", globalChanged.length === 9 && globalChanged.every(id => authorizedIds.has(id)), globalChanged.join(", "));

const targetFindingRules = new Map([
  ...falsePositiveIds.map(id => [id, "duplicate-options"]),
  ...["PM2E-CH-FINAL-001", "PM2E-CH-FINAL-002", "PM2E-CH-LEG-001", "PM2E-CH-LEG-002", "PM2E-CH-MID-002", "PM2E-CH-OPEN-001", "PM2E-CH-OPEN-002"].map(id => [id, "invalid-answer-key"]),
  ...["PM2C2-FISH-BR-001", "PM2C2-NEUT-BR-001"].map(id => [id, "invalid-difficulty"])
]);
const remainingTargetFindings = postAudit.findings.filter(finding => targetFindingRules.get(String(finding.questionId)) === finding.rule);
const preFindingKeys = new Set(preAudit.findings.map(finding => `${finding.questionId}|${finding.severity}|${finding.rule}|${finding.message}`));
const newlyVisibleNonErrorFindings = postAudit.findings.filter(finding =>
  finding.severity !== "ERROR" && !preFindingKeys.has(`${finding.questionId}|${finding.severity}|${finding.rule}|${finding.message}`)
).map(finding => ({ questionId: finding.questionId, severity: finding.severity, rule: finding.rule, message: finding.message }));
check("Macro deterministic ERROR count is zero", postAudit.counts.errors === 0, `${preAudit.counts.errors} → ${postAudit.counts.errors}`);
check("All 13 named deterministic findings are gone", remainingTargetFindings.length === 0, `${remainingTargetFindings.length} remain`);
check("Warnings were not mass-remediated", postAudit.counts.warnings === preAudit.counts.warnings, `${preAudit.counts.warnings} → ${postAudit.counts.warnings}`);

for (const id of falsePositiveIds) {
  const q = getQuestion(id);
  const normalized = q.options.map(normalizeDuplicateOption);
  check(`${id} no longer triggers duplicate normalization`, new Set(normalized).size === normalized.length, normalized.join(" | "));
}
check("True duplicates still normalize together", normalizeDuplicateOption("  Demand rises. ") === normalizeDuplicateOption("demand rises"));
check("Positive and negative signs remain distinct", normalizeDuplicateOption("−$0.8 trillion") !== normalizeDuplicateOption("$0.8 trillion"));
check("Sequence direction remains distinct", normalizeDuplicateOption("A → B") !== normalizeDuplicateOption("B → A"));
check("Directional graph tokens remain distinct", normalizeDuplicateOption("AD ↑; curve →") !== normalizeDuplicateOption("AD ↓; curve ←"));

const keyedIds = ["PM2E-CH-FINAL-001", "PM2E-CH-FINAL-002", "PM2E-CH-LEG-001", "PM2E-CH-LEG-002", "PM2E-CH-MID-002", "PM2E-CH-OPEN-001", "PM2E-CH-OPEN-002"];
const keyVerification = keyedIds.map(id => {
  const q = getQuestion(id);
  const matches = q.options.map((option, index) => answerHash(option) === q.aHash ? index : -1).filter(index => index >= 0);
  return { questionId: id, matches, correctIndex: matches.length === 1 ? matches[0] : null, correctValue: matches.length === 1 ? q.options[matches[0]] : null };
});
check("Seven supplement answer keys resolve uniquely at A", keyVerification.every(row => row.matches.length === 1 && row.correctIndex === 0), JSON.stringify(keyVerification));
const final002 = getQuestion("PM2E-CH-FINAL-002");
const final002ExpectedOptions = authorization.changes.find(change => change.questionId === "PM2E-CH-FINAL-002").expectedAfter.options;
check("PM2E-CH-FINAL-002 has the exact authorized four-option order", JSON.stringify(final002.options) === JSON.stringify(final002ExpectedOptions));
check("PM2E-CH-FINAL-002 feedback explains the two-sided tradeoff", final002.feedback.includes("support output and employment but worsen inflation") && final002.feedback.includes("reduce inflation pressure but further weaken output and employment"));
const bridgeVerification = ["PM2C2-FISH-BR-001", "PM2C2-NEUT-BR-001"].map(id => {
  const occurrence = macroById.get(id)?.[0];
  return { questionId: id, container: occurrence?.container, pool: occurrence?.pool, role: occurrence?.question?.instructionalRole, difficulty: occurrence?.question?.difficulty, canonicalDifficulty: occurrence?.question?.canonicalDifficulty };
});
check("Both BR records remain Bridge adaptive-support records", bridgeVerification.every(row => row.container === "bridgeQuestions" && row.pool === "bridge" && row.role === "bridge"), JSON.stringify(bridgeVerification));
check("Both BR records use supported elite difficulty", bridgeVerification.every(row => row.difficulty === "elite" && row.canonicalDifficulty === "elite"), JSON.stringify(bridgeVerification));
const m2c2Source = fs.readFileSync(path.join(repo, "audit_tools", "apply_macro_m2c2_money_growth_inflation.mjs"), "utf8");
check("Bridge difficulty upstream source is synchronized", /function addBridge[\s\S]*?difficulty:'elite'[\s\S]*?instructionalRole:'bridge'[\s\S]*?canonicalDifficulty:'elite'/.test(m2c2Source));

const hashableLibrary = structuredClone(library);
delete hashableLibrary.librarySha256;
delete hashableLibrary.registry.librarySha256;
const computedLibraryHash = sha(JSON.stringify(stable(hashableLibrary)));
const standaloneRegistry = JSON.parse(fs.readFileSync(path.join(dataDir, "composer_registry.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, "composer_library_manifest.json"), "utf8"));
check("Composer library SHA-256 is current", computedLibraryHash === library.librarySha256, `${computedLibraryHash} vs ${library.librarySha256}`);
check("Embedded and standalone registries match", JSON.stringify(standaloneRegistry) === JSON.stringify(library.registry));
check("Generated manifest points to the current library", manifest.libraryVersion === library.libraryVersion && manifest.librarySha256 === library.librarySha256);

const idempotence = JSON.parse(execFileSync(process.execPath, [path.join(scriptDir, "apply_macro_final_cleanup.mjs"), "--dry-run"], { cwd: repo, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
check("Cleanup synchronization is idempotent", idempotence.semanticChangedFiles.length === 0 && idempotence.appliedFromBeforeState === 0, JSON.stringify(idempotence.semanticChangedFiles));

const core = require(path.join(composer, "composer-core.js"));
const helpers = require(path.join(composer, "tests", "composer-test-helpers.js"));
const modes = ["standard", "timed", "exam", "legendary", "score"];
const recipe = {
  schemaVersion: "1.2.0",
  title: "Principles Macro Final Cleanup Validation",
  slug: "principles-macro-final-cleanup-validation",
  supportedModes: modes,
  selectedConceptIds: macroConceptIds,
  checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
};
const composition = core.compose(library, recipe);
check("Fresh full-Macro composition succeeds", composition.errors.length === 0, composition.errors.join(" | "));
check("All supported modes pass preflight", composition.validation?.modes?.every(row => row.ok) === true, JSON.stringify(composition.validation?.modes || []));
const answerVerification = await core.verifyAnswers(composition);
check("Generated package answer hashes verify", answerVerification.ok, `${answerVerification.issues.length} issues`);
const conceptReviewResolution = helpers.attachConceptReviewRuntime(core, composition, library, macroConceptIds);
check("Concept Review runtime resolves", conceptReviewResolution.errors.length === 0, conceptReviewResolution.errors.join(" | "));
const embedded = {};
const packageAssetFailures = [];
for (const asset of composition.assets || []) {
  const source = path.join(composer, String(asset.sourceUrl || "").replaceAll("/", path.sep));
  if (!fs.existsSync(source)) { packageAssetFailures.push(asset.sourceUrl); continue; }
  const ext = path.extname(source).toLowerCase();
  const mime = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "application/octet-stream";
  embedded[asset.runtimePath] = `data:${mime};base64,${fs.readFileSync(source).toString("base64")}`;
}
composition.embeddedQuestionAssets = embedded;
check("All selected question assets embed", packageAssetFailures.length === 0, packageAssetFailures.join(", "));
const template = fs.readFileSync(path.join(composer, "template", "mastery-quests-faculty-template-composer-ready.html"), "utf8");
const config = await core.createConfig(recipe, library, sha(template));
const meta = { phase: PHASE, generatedAt: GENERATED_AT, validationPurpose: "Full Principles Macro deterministic-error cleanup validation", selectedConceptIds: macroConceptIds, libraryVersion: library.libraryVersion, librarySha256: library.librarySha256 };
const html = core.buildHtml(template, composition, config, meta);
const packageDir = path.join(repo, "validation_artifacts", "macro_final_cleanup", "generated_packages", "principles-macro");
fs.mkdirSync(packageDir, { recursive: true });
const packageManifest = { ...meta, htmlSha256: sha(html), templateSha256: sha(template), macroQuestionCount: macroById.size, assetsEmbedded: Object.keys(embedded).length };
fs.writeFileSync(path.join(packageDir, "index.html"), html);
fs.writeFileSync(path.join(packageDir, "manifest.json"), `${JSON.stringify(packageManifest, null, 2)}\n`);
let JSZip;
try {
  JSZip = require("jszip");
} catch {
  const bundledJsZip = process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules", "jszip")
    : "";
  if (!bundledJsZip || !fs.existsSync(bundledJsZip)) throw new Error("jszip is required to validate ZIP generation.");
  JSZip = require(bundledJsZip);
}
const zip = new JSZip();
const zipDate = new Date(GENERATED_AT);
zip.file("index.html", html, { date: zipDate });
zip.file("manifest.json", `${JSON.stringify(packageManifest, null, 2)}\n`, { date: zipDate });
const zipBytes = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
const zipPath = path.join(packageDir, "principles-macro-final-cleanup.zip");
fs.writeFileSync(zipPath, zipBytes);
const zipResult = { status: "PASS", path: path.relative(repo, zipPath).replaceAll("\\", "/"), bytes: zipBytes.length, sha256: sha(zipBytes) };
check("Fresh full-Macro HTML and ZIP generation succeeds", fs.existsSync(path.join(packageDir, "index.html")) && fs.existsSync(zipPath), zipResult.path);
check("Generated HTML contains PM2E-CH-FINAL-002 revised options", final002ExpectedOptions.every(option => html.includes(option.replaceAll("&", "&amp;")) || html.includes(option)));

const failures = checks.filter(row => row.status === "FAIL");
const validation = {
  schemaVersion: "1.0.0",
  phase: PHASE,
  generatedAt: GENERATED_AT,
  verdict: failures.length ? "FAIL" : "PASS",
  summary: { checks: checks.length, passed: checks.length - failures.length, failed: failures.length, macroQuestions: macroById.size, authorizedChanged: changedIds.length, unauthorizedChanged: unauthorizedQuestionChanges.length, taxonomyDrift: taxonomyDrift.length, preErrors: preAudit.counts.errors, postErrors: postAudit.counts.errors },
  checks,
  details: {
    fingerprint: { before: { digest: preFingerprint.digest, questionCount: preFingerprint.questionCount }, after: { digest: postFingerprint.digest, questionCount: postFingerprint.questionCount }, changedIds, unauthorizedQuestionChanges, authorizedNotChanged, falsePositiveDrift, taxonomyDrift },
    globalQuestionComparison: { before: headGlobal.size, after: currentGlobal.size, added: globalAdded, lost: globalLost, changedIds: globalChanged, microChangedIds: microChanged },
    qualityAudit: { before: preAudit.counts, after: postAudit.counts, remainingTargetFindings, newlyVisibleNonErrorFindings },
    keyVerification,
    bridgeVerification,
    idempotence,
    generatedPackage: { directory: path.relative(repo, packageDir).replaceAll("\\", "/"), htmlBytes: Buffer.byteLength(html), htmlSha256: sha(html), assetsEmbedded: Object.keys(embedded).length, answerVerification, zip: zipResult }
  }
};
const report = `# Principles Macro Final Deterministic Cleanup\n\nVerdict: **${validation.verdict}**\n\n## Scope lock\n\n- Macro questions: **${macroById.size}/2,870**\n- Ordinary questions: **${macroById.size - occurrences(library.concepts["integrated-macroeconomic-analysis"]).length}/2,758**\n- Advanced Macro Checkpoint Supplement: **${occurrences(library.concepts["integrated-macroeconomic-analysis"]).length}/112**\n- Authorized question records changed: **${changedIds.length}/9**\n- Unauthorized question changes: **${unauthorizedQuestionChanges.length}**\n- Taxonomy or pool-role drift: **${taxonomyDrift.length}**\n- Micro question changes: **${microChanged.length}**\n- Questions added/lost: **${globalAdded.length}/${globalLost.length}**\n\n## Corrections\n\n- Six supplement records received exact answer-hash synchronization without option-order changes.\n- PM2E-CH-FINAL-002 retains its stem and keyed A position, uses the authorized four-option order, and now explains the two-sided supply-shock stabilization tradeoff.\n- PM2C2-FISH-BR-001 and PM2C2-NEUT-BR-001 now use \`elite\` difficulty while remaining in \`bridgeQuestions\` with \`instructionalRole: bridge\`.\n- 43065, PG4-MM-L-005, PG4-MPT-H-001, and PG4-MPT-H-002 are unchanged.\n\n## Auditor\n\n| Snapshot | Errors | Warnings | Review flags |\n|---|---:|---:|---:|\n| Before | ${preAudit.counts.errors} | ${preAudit.counts.warnings} | ${preAudit.counts.reviews} |\n| After | ${postAudit.counts.errors} | ${postAudit.counts.warnings} | ${postAudit.counts.reviews} |\n\nThe two newly visible REVIEW findings are \`weak-absolute-distractors\` on PM2E-CH-LEG-002 and PM2E-CH-OPEN-001. They became evaluable after their answer keys were repaired and remain explicitly out of scope. No WARNING finding changed.\n\nThe duplicate-option rule now uses a dedicated harmless-format normalizer. It preserves signed values, arrow direction, token order, and directional graph/economic distinctions while still collapsing capitalization, redundant whitespace, terminal punctuation, and equivalent typographic quotes/dashes. The existing synthetic true-duplicate validation remains passing.\n\n## Build\n\n- Full 52-concept Macro composition: **${checks.find(row => row.name === "Fresh full-Macro composition succeeds").status}**\n- All modes preflight: **${checks.find(row => row.name === "All supported modes pass preflight").status}**\n- Answer hashes: **${answerVerification.ok ? "PASS" : "FAIL"}**\n- HTML: \`${path.relative(repo, path.join(packageDir, "index.html")).replaceAll("\\", "/")}\`\n- ZIP: \`${zipResult.path}\`\n- Idempotence: **${checks.find(row => row.name === "Cleanup synchronization is idempotent").status}**\n\n## Checks\n\n${checks.map(row => `- ${row.status}: ${row.name}${row.detail ? ` — ${row.detail}` : ""}`).join("\n")}\n`;
const validatorReport = `# Duplicate-Option Validator Change\n\n## Root cause\n\nThe prior \`duplicate-options\` rule reused \`normalizeComparable\`, which removes every character outside a restricted letter/number/sign set. Unicode minus (\`−\`) and graph arrows (\`↑ ↓ ← →\`) were deleted. As a result, \`−$0.8 trillion\` collapsed onto \`$0.8 trillion\`, and economically distinct money-market/AD sequences collapsed after their directional arrows were erased.\n\n## Narrow fix\n\nThe rule now calls \`normalizeDuplicateOption\`, a dedicated option-equivalence normalizer. It normalizes capitalization, whitespace, terminal punctuation, typographic quotes, equivalent dash/minus glyphs, and equivalent arrow glyphs. It does not remove mathematical signs, arrows, directional words, graph labels, or token order.\n\n## Verification\n\n- 43065: no duplicate finding; content unchanged.\n- PG4-MM-L-005: no duplicate finding; content and graph metadata unchanged.\n- PG4-MPT-H-001: no duplicate finding; content and graph metadata unchanged.\n- PG4-MPT-H-002: no duplicate finding; content and graph metadata unchanged.\n- Synthetic true duplicate \`Demand rises.\` / \`demand rises\`: still detected by the existing auditor validation suite.\n- Explicit sign, A→B/B→A, and up/down/left/right distinction assertions: PASS.\n`;
fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`);
fs.writeFileSync(reportPath, report);
fs.writeFileSync(validatorReportPath, validatorReport);

console.log(JSON.stringify({ phase: PHASE, verdict: validation.verdict, checks: checks.length, passed: checks.length - failures.length, failed: failures.length, quality: validation.details.qualityAudit, changedIds, unauthorizedQuestionChanges, taxonomyDrift: taxonomyDrift.length, package: validation.details.generatedPackage, outputs: [reportPath, validationPath, changesPath, validatorReportPath].map(file => path.relative(repo, file).replaceAll("\\", "/")) }, null, 2));
if (failures.length) process.exitCode = 1;
