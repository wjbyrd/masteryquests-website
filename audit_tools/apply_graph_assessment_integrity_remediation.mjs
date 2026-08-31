#!/usr/bin/env node

import crypto from "node:crypto";
import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSER = path.join(ROOT, "build", "faculty-build-composer");
const LIBRARY_PATH = path.join(COMPOSER, "data", "composer_library.js");
const REGISTRY_PATH = path.join(COMPOSER, "data", "composer_registry.json");
const MANIFEST_PATH = path.join(COMPOSER, "data", "composer_library_manifest.json");
const REVIEW_MANIFEST_PATH = path.join(COMPOSER, "data", "concept-reviews", "manifest.json");
const ARTIFACT_DIR = path.join(ROOT, "validation_artifacts", "question_quality");
const BASELINE_PATH = path.join(ARTIFACT_DIR, "graph_assessment_integrity_pre_remediation.json");
const AUTHORIZATION_PATH = path.join(ARTIFACT_DIR, "graph_assessment_integrity_authorization.json");
const CHANGE_PATH = path.join(ARTIFACT_DIR, "graph_assessment_integrity_remediation.json");
const PHASE = "phaseQH6-graph-assessment-integrity-v1";
const GENERATED_AT = "2026-08-31T22:00:00.000Z";
const TARGET_CONCEPTS = new Set(["demand", "supply", "market-equilibrium", "production-possibilities-frontier"]);

const SUPPLY_ACCESSIBILITY = "The movie-ticket market has price in dollars on the vertical axis and quantity in thousands on the horizontal axis. D0 is a downward-sloping demand curve. S0 and S1 are upward-sloping supply curves, with S1 lying to the left of S0 at each displayed price. Point A is the D0-S0 intersection at quantity 200 and price $10. Point B is the D0-S1 intersection at quantity 150 and price $12.";
const DEMAND_ACCESSIBILITY = "The movie-ticket market has price in dollars on the vertical axis and quantity in thousands on the horizontal axis. S0 is an upward-sloping supply curve. D0 and D1 are downward-sloping demand curves, with D1 lying to the right of D0 at each displayed price. Point A is the D0-S0 intersection at quantity 200 and price $10. Point B is the D1-S0 intersection at quantity 250 and price $12.";
const FOUR_INTERSECTION_ACCESSIBILITY = "The taco market has price on the vertical axis and quantity on the horizontal axis. D0 and D1 slope downward, with D1 to the right of D0. S0 and S1 slope upward, with S1 to the left of S0. Point D is the D0-S0 intersection, A is D0-S1, C is D1-S0, and B is D1-S1.";

const fixes = new Map();
function authorize(id, rules, patch, reason) {
  fixes.set(String(id), { id: String(id), rules: [...rules], patch: { ...patch }, reason });
}

authorize("40006", ["accessibility-answer-leak", "graph-prompt-cue"], {
  q: "Refer to the graph. What market change is shown from A to B?",
  imageAlt: SUPPLY_ACCESSIBILITY,
  graphDescription: SUPPLY_ACCESSIBILITY
}, "Add a natural graph cue and replace answer-bearing shift language with equivalent structural evidence.");
for (const id of ["40007", "40008"]) authorize(id, ["accessibility-answer-leak"], {
  imageAlt: SUPPLY_ACCESSIBILITY,
  graphDescription: SUPPLY_ACCESSIBILITY
}, "Replace answer-bearing shift language on the shared movie-ticket supply graph with equivalent structural evidence.");

for (const id of ["40009", "40010", "40011"]) authorize(id, ["accessibility-answer-leak", "shared-graph-accessibility-consistency"], {
  imageAlt: DEMAND_ACCESSIBILITY,
  graphDescription: DEMAND_ACCESSIBILITY
}, "Use one non-leaking structural description for every question linked to the shared movie-ticket demand graph.");

authorize("PG1-DMD-L-002", ["graph-question-evidence-mismatch"], {
  q: "Refer to the graph. First compare D0 with D1 at a price of $10. Then follow D1 as price falls from $10 to $6. Which option correctly decomposes the two quantity changes into a demand shift and a movement along D1?"
}, "Identify the two graph-reading stages before the answer choices without reproducing the graph-derived quantities.");

authorize("40020", ["graph-task-low-economic-value"], {
  q: "Refer to the graph. The taco market begins at point D. Tacos are a normal good. Consumer income rises while the cost of an important production input increases. Compare the two determinant effects and infer which labeled point becomes the new equilibrium.",
  options: [
    "B — the intersection of D1 and S1",
    "C — the intersection of D1 and S0",
    "A — the intersection of D0 and S1",
    "D — the intersection of D0 and S0"
  ],
  answer: "B — the intersection of D1 and S1",
  feedback: "Because tacos are a normal good, higher consumer income shifts demand from D0 to D1. The higher input cost shifts supply from S0 to S1. The new D1-S1 equilibrium is point B.",
  type: "multi-step",
  imageAlt: FOUR_INTERSECTION_ACCESSIBILITY,
  graphDescription: FOUR_INTERSECTION_ACCESSIBILITY
}, "Replace a graph-meta question with an Elite two-shift market-equilibrium application using the same rich graph.");

const assetPatches = new Map([
  ["question-assets/market-equilibrium/DEMAND-SUPPLY-03.webp", { imageAlt: SUPPLY_ACCESSIBILITY, graphDescription: SUPPLY_ACCESSIBILITY }],
  ["question-assets/market-equilibrium/DEMAND-SUPPLY-04.webp", { imageAlt: DEMAND_ACCESSIBILITY, graphDescription: DEMAND_ACCESSIBILITY }],
  ["question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp", { imageAlt: FOUR_INTERSECTION_ACCESSIBILITY, graphDescription: FOUR_INTERSECTION_ACCESSIBILITY }]
]);

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const answerHash = value => sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function snapshot(value) { return JSON.parse(JSON.stringify(value)); }
function parseLibrary(source, filename) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function loadLibrary() { return parseLibrary(fs.readFileSync(LIBRARY_PATH, "utf8"), LIBRARY_PATH); }
function questionId(question) { return String(question.canonicalId || question.id); }
function questionEntries(library) {
  const entries = [];
  for (const [conceptId, module] of Object.entries(library.concepts || {})) {
    for (const [pool, questions] of Object.entries(module.questions || {})) for (const question of questions || []) entries.push({ conceptId, pool, question });
    for (const key of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[key] || []) entries.push({ conceptId, pool: key.replace("Questions", ""), question });
  }
  return entries;
}
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  return sha256(stable(payload));
}
function assertAnswer(question) {
  const matches = (question.options || []).filter(option => answerHash(option) === String(question.aHash || "").replace(/^sha256:/, ""));
  if (matches.length !== 1) throw new Error(`${questionId(question)} answer hash resolves to ${matches.length} options.`);
}
function applyQuestionPatch(question, patch) {
  const allowed = new Set(["q", "options", "answer", "feedback", "type", "imageAlt", "graphDescription"]);
  for (const key of Object.keys(patch)) if (!allowed.has(key)) throw new Error(`Unauthorized patch field ${key} on ${questionId(question)}.`);
  for (const [key, value] of Object.entries(patch)) if (key !== "answer") question[key] = Array.isArray(value) ? [...value] : value;
  if (patch.answer != null) question.aHash = answerHash(patch.answer);
  assertAnswer(question);
}

function render() {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  if (baseline.scope.questionCount !== 115 || baseline.counts.errors !== 0 || baseline.counts.warnings !== 1 || baseline.counts.reviews !== 11) {
    throw new Error(`Unexpected graph-assessment baseline: ${JSON.stringify(baseline.counts)} across ${baseline.scope.questionCount} questions.`);
  }
  const baselineFindingKeys = new Set(baseline.findings.map(finding => `${finding.questionId}:${finding.rule}`));
  for (const spec of fixes.values()) {
    const auditBacked = spec.rules.some(rule => baselineFindingKeys.has(`${spec.id}:${rule}`));
    const sharedMetadataOnly = spec.rules.includes("shared-graph-accessibility-consistency");
    if (!auditBacked && !sharedMetadataOnly) throw new Error(`${spec.id} is not backed by the immutable audit.`);
  }

  const library = loadLibrary();
  const entries = questionEntries(library);
  const beforeByKey = new Map(entries.map(entry => [`${entry.conceptId}:${questionId(entry.question)}`, stable(entry.question)]));
  const headLibrary = parseLibrary(childProcess.execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }), "HEAD:composer_library.js");
  const headEntries = questionEntries(headLibrary);
  const previous = fs.existsSync(CHANGE_PATH) ? JSON.parse(fs.readFileSync(CHANGE_PATH, "utf8")) : null;
  const previousChanges = new Map((previous?.changes || []).map(change => [String(change.id), change]));
  const changes = [];

  for (const spec of fixes.values()) {
    const matches = entries.filter(entry => TARGET_CONCEPTS.has(entry.conceptId) && questionId(entry.question) === spec.id);
    if (matches.length !== 1) throw new Error(`${spec.id} resolved to ${matches.length} target records; expected one.`);
    const entry = matches[0];
    const headQuestion = headEntries.find(candidate => candidate.conceptId === entry.conceptId && questionId(candidate.question) === spec.id)?.question;
    const before = previousChanges.get(spec.id)?.before || snapshot(headQuestion);
    if (!before) throw new Error(`${spec.id} has no trustworthy pre-curation baseline.`);
    applyQuestionPatch(entry.question, spec.patch);
    entry.question.sourceCurationPhase = PHASE;
    entry.question.sourceHash = sourceHash(entry.question);
    for (const occurrence of entry.question.sourceOccurrences || []) {
      occurrence.sourceHash = entry.question.sourceHash;
      occurrence.sourceCurationPhase = PHASE;
    }
    changes.push({
      id: spec.id,
      conceptId: entry.conceptId,
      pool: entry.pool,
      rules: [...spec.rules].sort(),
      reason: spec.reason,
      authorizedFields: [...new Set([...Object.keys(spec.patch).filter(key => key !== "answer"), ...(spec.patch.answer != null ? ["aHash"] : []), "sourceHash", "sourceCurationPhase", "sourceOccurrences"])].sort(),
      before: snapshot(before),
      after: snapshot(entry.question)
    });
  }

  const unexpected = questionEntries(library)
    .filter(entry => stable(entry.question) !== beforeByKey.get(`${entry.conceptId}:${questionId(entry.question)}`) && !fixes.has(questionId(entry.question)))
    .map(entry => questionId(entry.question));
  if (unexpected.length) throw new Error(`Questions changed outside authorization: ${unexpected.join(", ")}`);

  const previousAssets = new Map((previous?.assetChanges || []).map(change => [change.runtimePath, change]));
  const headAssetMap = new Map((headLibrary.assetInventory || []).map(asset => [asset.runtimePath, asset]));
  const assetChanges = [];
  for (const [runtimePath, patch] of assetPatches) {
    const asset = library.assetInventory.find(candidate => candidate.runtimePath === runtimePath);
    if (!asset) throw new Error(`Missing registered asset ${runtimePath}.`);
    const before = previousAssets.get(runtimePath)?.before || snapshot(headAssetMap.get(runtimePath));
    Object.assign(asset, patch, { sourceCurationPhase: PHASE });
    const moduleCopies = [];
    for (const [conceptId, module] of Object.entries(library.concepts || {})) {
      for (const metadata of module.assetMetadata || []) {
        if (metadata.runtimePath !== runtimePath) continue;
        const headMetadata = headLibrary.concepts?.[conceptId]?.assetMetadata?.find(candidate => candidate.runtimePath === runtimePath);
        const previousCopy = previousAssets.get(runtimePath)?.moduleCopies?.find(candidate => candidate.conceptId === conceptId);
        const copyBefore = previousCopy?.before || snapshot(headMetadata);
        Object.assign(metadata, patch, { sourceCurationPhase: PHASE });
        moduleCopies.push({ conceptId, before: copyBefore, after: snapshot(metadata) });
      }
    }
    if (!moduleCopies.length) throw new Error(`Registered asset ${runtimePath} has no concept-module metadata copy.`);
    assetChanges.push({ runtimePath, authorizedFields: ["graphDescription", "imageAlt", "sourceCurationPhase"], before, after: snapshot(asset), moduleCopies });
  }

  library.libraryVersion = String(library.libraryVersion).includes(PHASE) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  Object.assign(library.registry, {
    generatedAt: GENERATED_AT,
    curationPhase: PHASE,
    curationSummary: "Authorized graph-assessment integrity remediation for demand, supply, market equilibrium, and PPF.",
    libraryVersion: library.libraryVersion,
    canonicalQuestionCount: library.canonicalQuestionCount
  });
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stable(library));
  library.registry.librarySha256 = library.librarySha256;
  const manifest = {
    assetCount: library.assetInventory.length,
    assets: library.assetInventory,
    conceptCount: library.conceptCount,
    canonicalQuestionCount: library.canonicalQuestionCount,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    generatedAt: GENERATED_AT
  };
  const reviewManifest = JSON.parse(fs.readFileSync(REVIEW_MANIFEST_PATH, "utf8"));
  reviewManifest.generatedAt = GENERATED_AT;
  reviewManifest.composerLibraryVersion = library.libraryVersion;
  const retainedReviews = baseline.findings.filter(finding => !fixes.has(String(finding.questionId))).map(finding => ({
    id: String(finding.questionId),
    rule: finding.rule,
    judgment: finding.rule === "near-duplicate-stem"
      ? "Retained: adjacent PPF intervals intentionally repeat a calculation form with different labeled evidence and values."
      : "Retained: the diagnostic absolute wording is not, by itself, a verified graph-assessment defect."
  }));
  const authorization = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    sourceAudit: path.relative(ROOT, BASELINE_PATH).replaceAll("\\", "/"),
    scope: {
      concepts: [...TARGET_CONCEPTS],
      graphLinkedQuestionCount: baseline.scope.questionCount,
      baselineCounts: baseline.counts,
      authorizedQuestionIds: [...fixes.keys()].sort(),
      authorizedAssetPaths: [...assetPatches.keys()].sort(),
      protectedOutOfScopeQuestionIds: ["43192"]
    },
    controls: {
      onlyListedQuestionsAndAssetsAuthorized: true,
      onlyListedFieldsAuthorized: true,
      answerKeyChangesRequireExplicitPatchAnswer: true,
      baselineEvidenceIsImmutableAcrossReruns: true,
      binaryGraphAssetsMayNotChange: true,
      unrelatedConceptDifficultyObjectiveAndSkillMetadataMayNotChange: true
    },
    retainedReviews,
    changes: changes.map(change => ({ id: change.id, conceptId: change.conceptId, pool: change.pool, rules: change.rules, reason: change.reason, authorizedFields: change.authorizedFields, before: change.before, intendedAfter: change.after })),
    assetChanges: assetChanges.map(change => ({ runtimePath: change.runtimePath, authorizedFields: change.authorizedFields, before: change.before, intendedAfter: change.after, moduleCopies: change.moduleCopies.map(copy => ({ conceptId: copy.conceptId, before: copy.before, intendedAfter: copy.after })) }))
  };
  const record = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    scope: { concepts: [...TARGET_CONCEPTS], changedQuestionCount: changes.length, changedAssetMetadataCount: assetChanges.length },
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    baselineAuditSha256: sha256(`${JSON.stringify(baseline, null, 2)}\n`),
    authorizationSha256: sha256(`${JSON.stringify(authorization, null, 2)}\n`),
    changes,
    assetChanges
  };
  return {
    outputs: [
      [LIBRARY_PATH, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
      [REGISTRY_PATH, `${JSON.stringify(library.registry, null, 2)}\n`],
      [MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
      [REVIEW_MANIFEST_PATH, `${JSON.stringify(reviewManifest, null, 2)}\n`],
      [AUTHORIZATION_PATH, `${JSON.stringify(authorization, null, 2)}\n`],
      [CHANGE_PATH, `${JSON.stringify(record, null, 2)}\n`]
    ],
    summary: { phase: PHASE, changedQuestionCount: changes.length, changedAssetMetadataCount: assetChanges.length, librarySha256: library.librarySha256 }
  };
}

const generated = render();
if (process.argv.includes("--write")) {
  for (const [file, contents] of generated.outputs) fs.writeFileSync(file, contents, "utf8");
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  console.log(JSON.stringify({ status: "DRY_RUN", ...generated.summary }, null, 2));
}
