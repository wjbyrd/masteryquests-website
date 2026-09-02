#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv.find((arg, index) => index > 1 && !arg.startsWith("--")) || path.join(scriptDir, "..", ".."));
const dryRun = process.argv.includes("--dry-run");
const PHASE = "phaseMacroFinalCleanup-v1";
const GENERATED_AT = "2026-09-01T21:00:00.000Z";
const dataDir = path.join(repo, "build", "faculty-build-composer", "data");
const libraryPath = path.join(dataDir, "composer_library.js");
const registryPath = path.join(dataDir, "composer_registry.json");
const manifestPath = path.join(dataDir, "composer_library_manifest.json");
const reviewDir = path.join(dataDir, "concept-reviews");
const reviewSourcePath = path.join(reviewDir, "concept_review_source.json");
const reviewManifestPath = path.join(reviewDir, "manifest.json");
const reviewAuditPath = path.join(reviewDir, "concept_review_integration_audit.json");
const humanReadLedgerPath = path.join(repo, "validation_artifacts", "question_quality", "question_rewrite_master_execution_ledger.json");
const changesPath = path.join(scriptDir, "macro_final_cleanup_question_changes.json");
const phase4AuditPath = path.join(repo, "audit_tools", "macro_phase4", "macro_phase4_quality_audit_post.json");
const preFingerprintPath = path.join(process.env.TEMP || process.env.TMP || scriptDir, "masteryquests_macro_final_cleanup_pre_fingerprint.json");

const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const sha = value => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
const answerHash = value => sha(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
const qid = question => String(question?.canonicalId || question?.id || "");
const questionSourceHash = question => sha(JSON.stringify(stable({
  q: question.q,
  options: question.options,
  aHash: question.aHash,
  primaryConceptId: question.primaryConceptId,
  primarySkill: question.primarySkill,
  difficulty: question.difficulty,
  secondaryConceptIds: question.secondaryConceptIds || [],
  bossStage: question.bossStage || null,
  image: question.image || null
})));
const recordFingerprint = question => sha(JSON.stringify(stable({
  q: question.q ?? null,
  options: question.options ?? null,
  aHash: question.aHash ?? null,
  feedback: question.feedback ?? null,
  difficulty: question.difficulty ?? null,
  canonicalDifficulty: question.canonicalDifficulty ?? null,
  instructionalRole: question.instructionalRole ?? null,
  primaryConceptId: question.primaryConceptId ?? null,
  familyConceptId: question.familyConceptId ?? null,
  image: question.image ?? null,
  graphRequired: question.graphRequired ?? null
})));
const loadLibrary = () => {
  const raw = fs.readFileSync(libraryPath, "utf8").trim();
  const prefix = "window.MQ_COMPOSER_LIBRARY=";
  if (!raw.startsWith(prefix) || !raw.endsWith(";")) throw new Error("Unexpected Composer library wrapper.");
  return JSON.parse(raw.slice(prefix.length, -1));
};
const occurrences = module => [
  ...Object.entries(module.questions || {}).flatMap(([pool, list]) => (list || []).map((question, index) => ({ container: "questions", pool, index, question }))),
  ...(module.repairQuestions || []).map((question, index) => ({ container: "repairQuestions", pool: "repair", index, question })),
  ...(module.repairSeedQuestions || []).map((question, index) => ({ container: "repairSeedQuestions", pool: "repairSeed", index, question })),
  ...(module.bridgeQuestions || []).map((question, index) => ({ container: "bridgeQuestions", pool: "bridge", index, question }))
];
const stateMatches = (question, change, state) => change.changedFields.every(field =>
  JSON.stringify(question[field] ?? null) === JSON.stringify(change[state][field] ?? null)
);
const correctIndex = question => {
  const matches = (question.options || []).map((option, index) => answerHash(option) === question.aHash ? index : -1).filter(index => index >= 0);
  return matches.length === 1 ? matches[0] : null;
};

const authorization = JSON.parse(fs.readFileSync(changesPath, "utf8"));
if (authorization.phase !== PHASE || authorization.changes.length !== 9 || new Set(authorization.changes.map(change => change.questionId)).size !== 9) {
  throw new Error("Final-cleanup authorization must contain exactly nine unique question IDs.");
}
const library = loadLibrary();
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const conceptIds = JSON.parse(fs.readFileSync(phase4AuditPath, "utf8")).scope.concepts;
const byId = new Map();
for (const conceptId of conceptIds) {
  const module = library.concepts[conceptId];
  if (!module) throw new Error(`Missing Macro concept ${conceptId}.`);
  for (const occurrence of occurrences(module)) {
    const id = qid(occurrence.question);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push({ conceptId, ...occurrence });
  }
}
if (byId.size !== 2870) throw new Error(`Macro universe drift: ${byId.size}/2870.`);

const initialLibrary = {
  libraryVersion: authorization.baseline?.libraryVersion || library.libraryVersion,
  librarySha256: authorization.baseline?.librarySha256 || library.librarySha256,
  fingerprintDigest: authorization.baseline?.fingerprintDigest || (fs.existsSync(preFingerprintPath) ? JSON.parse(fs.readFileSync(preFingerprintPath, "utf8")).digest : null)
};
const execution = [];
for (const change of authorization.changes) {
  const items = byId.get(change.questionId);
  if (!items?.length) throw new Error(`Missing authorized question ${change.questionId}.`);
  const states = items.map(item => stateMatches(item.question, change, "expectedAfter") ? "AFTER" : stateMatches(item.question, change, "expectedBefore") ? "BEFORE" : "MISMATCH");
  if (states.includes("MISMATCH") || new Set(states).size !== 1) throw new Error(`Baseline mismatch for ${change.questionId}: ${states.join(",")}.`);
  const beforeFingerprint = recordFingerprint({ ...items[0].question, ...change.expectedBefore });
  for (const item of items) {
    if (states[0] === "BEFORE") {
      for (const field of change.changedFields) item.question[field] = structuredClone(change.expectedAfter[field]);
    }
    item.question.sourceHash = questionSourceHash(item.question);
    if (Array.isArray(item.question.sourceOccurrences)) {
      for (const source of item.question.sourceOccurrences) source.sourceHash = item.question.sourceHash;
    }
    const index = correctIndex(item.question);
    if (index !== change.expectedCorrectIndex) throw new Error(`Answer-key mismatch for ${change.questionId}: ${index} != ${change.expectedCorrectIndex}.`);
  }
  execution.push({
    questionId: change.questionId,
    category: change.category,
    changedFields: change.changedFields,
    result: "AFTER_STATE_VERIFIED",
    appliedFromBeforeState: states[0] === "BEFORE",
    occurrenceCount: items.length,
    occurrences: items.map(item => ({ conceptId: item.conceptId, container: item.container, pool: item.pool, index: item.index })),
    correctIndex: correctIndex(items[0].question),
    beforeFingerprint,
    afterFingerprint: recordFingerprint(items[0].question)
  });
}

if (!String(library.libraryVersion).endsWith(PHASE)) library.libraryVersion = `${library.libraryVersion}-${PHASE}`;
library.sourceCurationPhase = PHASE;
library.generatedAt = GENERATED_AT;
Object.assign(library.registry, { libraryVersion: library.libraryVersion, generatedAt: GENERATED_AT, canonicalQuestionCount: library.canonicalQuestionCount });
Object.assign(registry, { libraryVersion: library.libraryVersion, generatedAt: GENERATED_AT, canonicalQuestionCount: library.canonicalQuestionCount });
delete library.librarySha256;
delete library.registry.librarySha256;
library.librarySha256 = sha(JSON.stringify(stable(library)));
library.registry.librarySha256 = library.librarySha256;
registry.librarySha256 = library.librarySha256;
Object.assign(manifest, {
  assetCount: library.assetInventory.length,
  assets: library.assetInventory,
  conceptCount: library.conceptCount,
  canonicalQuestionCount: library.canonicalQuestionCount,
  libraryVersion: library.libraryVersion,
  librarySha256: library.librarySha256,
  generatedAt: GENERATED_AT
});

const reviewSource = JSON.parse(fs.readFileSync(reviewSourcePath, "utf8"));
const reviewManifest = JSON.parse(fs.readFileSync(reviewManifestPath, "utf8"));
const reviewAudit = JSON.parse(fs.readFileSync(reviewAuditPath, "utf8"));
for (const artifact of [reviewSource, reviewManifest, reviewAudit]) {
  artifact.generatedAt = GENERATED_AT;
  artifact.composerLibraryVersion = library.libraryVersion;
}
const humanReadLedger = JSON.parse(fs.readFileSync(humanReadLedgerPath, "utf8"));
Object.assign(humanReadLedger, { generatedAt: GENERATED_AT, libraryVersion: library.libraryVersion, librarySha256: library.librarySha256 });

const changeOutput = {
  ...authorization,
  baseline: initialLibrary,
  after: { libraryVersion: library.libraryVersion, librarySha256: library.librarySha256, macroQuestionCount: byId.size },
  execution: {
    authorized: 9,
    resolved: execution.length,
    answerKeyCorrections: 6,
    optionRewrites: 1,
    difficultyCorrections: 2,
    records: execution.map(({ appliedFromBeforeState, ...record }) => record)
  }
};
const outputs = new Map([
  [libraryPath, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
  [registryPath, `${JSON.stringify(registry, null, 2)}\n`],
  [manifestPath, `${JSON.stringify(manifest, null, 2)}\n`],
  [reviewSourcePath, `${JSON.stringify(reviewSource, null, 2)}\n`],
  [reviewManifestPath, `${JSON.stringify(reviewManifest, null, 2)}\n`],
  [reviewAuditPath, `${JSON.stringify(reviewAudit, null, 2)}\n`],
  [humanReadLedgerPath, `${JSON.stringify(humanReadLedger, null, 2)}\n`],
  [changesPath, `${JSON.stringify(changeOutput, null, 2)}\n`]
]);
const semanticChangedFiles = [...outputs].filter(([file, value]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== value).map(([file]) => path.relative(repo, file).replaceAll("\\", "/"));
if (!dryRun) for (const [file, value] of outputs) fs.writeFileSync(file, value);

console.log(JSON.stringify({
  phase: PHASE,
  dryRun,
  macroQuestionCount: byId.size,
  authorized: authorization.changes.length,
  resolved: execution.length,
  appliedFromBeforeState: execution.filter(row => row.appliedFromBeforeState).length,
  semanticChangedFiles,
  libraryVersion: library.libraryVersion,
  librarySha256: library.librarySha256
}, null, 2));
