import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditAuthoredQuestions,
  auditQuestionRecords,
  collectComposerQuestions,
  loadComposerLibrary,
  renderMarkdownReport
} from "../../../audit_tools/question_quality_auditor.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const library = loadComposerLibrary(path.join(repoRoot, "build", "faculty-build-composer", "data", "composer_library.js"));
const concepts = ["demand", "supply", "market-equilibrium"];
const entries = collectComposerQuestions(library, { concepts });
const assets = new Map();
for (const asset of library.assetInventory || []) {
  for (const key of [asset.runtimePath, asset.sourceAssetPath, asset.sourceUrl, asset.filename]) if (key) assets.set(String(key).replaceAll("\\", "/"), asset);
}
const result = auditQuestionRecords(entries, {
  assetMap: assets,
  composerRoot: path.join(repoRoot, "build", "faculty-build-composer")
});
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const hashableLibrary = structuredClone(library);
delete hashableLibrary.librarySha256;
delete hashableLibrary.registry.librarySha256;
assert.equal(sha256(JSON.stringify(stable(hashableLibrary))), library.librarySha256, "Composer library hash is stale");
const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, "build", "faculty-build-composer", "data", "composer_registry.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "build", "faculty-build-composer", "data", "composer_library_manifest.json"), "utf8"));
const reviewManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "build", "faculty-build-composer", "data", "concept-reviews", "manifest.json"), "utf8"));
assert.deepEqual(registry, library.registry, "Standalone and embedded Composer registries differ");
for (const metadata of [registry, manifest]) {
  assert.equal(metadata.libraryVersion, library.libraryVersion, "Generated metadata library version is stale");
  assert.equal(metadata.librarySha256, library.librarySha256, "Generated metadata library hash is stale");
}
assert.equal(reviewManifest.composerLibraryVersion, library.libraryVersion, "Concept Review manifest library version is stale");
const fixes = JSON.parse(fs.readFileSync(path.join(repoRoot, "validation_artifacts", "question_quality", "supply_demand_equilibrium_quality_fixes.json"), "utf8"));
assert.equal(fixes.changes.length, 13, "Expected 13 conservative content repairs");
for (const change of fixes.changes) {
  const entry = entries.find(candidate => candidate.id === change.id);
  assert(entry, `Missing repaired question ${change.id}`);
  const question = entry.question;
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  assert.equal(question.sourceHash, sha256(JSON.stringify(stable(payload))), `Stale source hash on ${change.id}`);
  assert((question.sourceOccurrences || []).every(occurrence => occurrence.sourceHash === question.sourceHash), `Stale source occurrence hash on ${change.id}`);
  const keyed = question.options.filter(option => sha256(String(option).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()) === question.aHash);
  assert.equal(keyed.length, 1, `Answer key no longer resolves uniquely on ${change.id}`);
}

assert.equal(entries.length, 240, "Supply/Demand/Equilibrium audit scope changed");
assert.equal(result.counts.errors, 0, "Target family has deterministic quality defects");
assert.equal(result.counts.warnings, 0, "Target family retains quality warnings");
assert.equal(result.counts.reviews, 0, "Target family retains REVIEW findings");
for (const repairedRule of ["graph-prompt-missing-cue", "awkward-graph-wording", "awkward-equilibrium-wording", "visual-only-feedback"]) {
  assert.equal(result.findings.filter(finding => finding.rule === repairedRule).length, 0, `${repairedRule} returned after remediation`);
}
assert.equal(collectComposerQuestions(library, { concepts: ["demand"] }).length, 74, "Single-concept selection changed");
assert.equal(collectComposerQuestions(library, { concepts: ["demand"], pools: ["easy"] }).length, 11, "Single-pool selection changed");

const synthetic = auditAuthoredQuestions([{
  id: "SYNTHETIC-1",
  q: "Whether the market passes through A or C, why is B the same final equilibrium?",
  answer: "Demand rises",
  distractors: ["Demand rises", "Supply falls", "Nothing changes"],
  objective: "TEST.1",
  primarySkill: "test_skill",
  type: "graph_trap",
  difficulty: "hard",
  feedback: "Correct.",
  graphRequired: true,
  asset: "synthetic.webp"
}], { conceptId: "synthetic", validateAssets: false });
assert(synthetic.findings.some(finding => finding.severity === "ERROR" && finding.rule === "duplicate-options"), "Deterministic defect was not classified as ERROR");
assert(synthetic.findings.some(finding => finding.severity === "WARNING" && finding.rule === "generic-feedback"), "Strong inspection signal was not classified as WARNING");
assert(synthetic.findings.some(finding => finding.severity === "REVIEW" && finding.rule === "awkward-equilibrium-wording"), "Semantic issue was not classified as REVIEW");

const graphNecessity = auditAuthoredQuestions([{
  id: "SYNTHETIC-GRAPH-DEPENDENT",
  q: "Refer to the graph. Which point is productively inefficient?",
  answer: "Point B",
  distractors: ["Point A", "Point C", "Point D"],
  objective: "TEST.2",
  primarySkill: "graph_interpretation",
  type: "graph_interpretation",
  difficulty: "medium",
  feedback: "Point B lies inside the frontier.",
  graphRequired: false,
  asset: "synthetic.webp"
}, {
  id: "SYNTHETIC-GRAPH-DECORATIVE",
  q: "What is scarcity?",
  answer: "Unlimited wants competing for limited resources",
  distractors: ["A temporary shortage", "Only a lack of money", "A surplus of every resource"],
  objective: "TEST.3",
  primarySkill: "scarcity",
  type: "definition",
  difficulty: "easy",
  feedback: "Scarcity arises because resources are limited relative to wants.",
  graphRequired: false,
  asset: "synthetic.webp"
}], { conceptId: "synthetic", validateAssets: false });
assert(graphNecessity.findings.some(finding => finding.questionId === "SYNTHETIC-GRAPH-DEPENDENT" && finding.severity === "WARNING" && finding.rule === "image-without-graph-required"), "Graph-dependent missing metadata was not classified as WARNING");
assert(graphNecessity.findings.some(finding => finding.questionId === "SYNTHETIC-GRAPH-DECORATIVE" && finding.severity === "REVIEW" && finding.rule === "attached-graph-possibly-decorative"), "Possibly decorative graph was not classified as REVIEW");
assert(!graphNecessity.findings.some(finding => finding.questionId === "SYNTHETIC-GRAPH-DECORATIVE" && finding.rule === "image-without-graph-required"), "Decorative graph was incorrectly treated as a deterministic metadata warning");

const graphEvidence = auditAuthoredQuestions([{
  id: "SYNTHETIC-GRAPH-EVIDENCE-LEAK",
  q: "Refer to the graph. Moving from D to E increases X by 4 and reduces Y by 20. What is the opportunity cost per unit of X?",
  answer: "5 units of Y",
  distractors: ["0.2 units of Y", "4 units of Y", "20 units of Y"],
  objective: "TEST.4",
  primarySkill: "graph_calculation",
  type: "graph_calculation",
  difficulty: "hard",
  feedback: "The graph shows that the move gives up 20 Y to gain 4 X, so the cost is 5 Y per X.",
  graphRequired: true,
  asset: "synthetic.webp"
}, {
  id: "SYNTHETIC-GRAPH-EVIDENCE-REQUIRED",
  q: "Refer to the graph. What is the opportunity cost per unit of X when moving from D to E?",
  answer: "5 units of Y",
  distractors: ["0.2 units of Y", "4 units of Y", "20 units of Y"],
  objective: "TEST.4",
  primarySkill: "graph_calculation",
  type: "graph_calculation",
  difficulty: "hard",
  feedback: "The graph shows that the move gives up 20 Y to gain 4 X, so the cost is 5 Y per X.",
  graphRequired: true,
  asset: "synthetic.webp"
}, {
  id: "SYNTHETIC-GRAPH-EXTERNAL-TECHNOLOGY",
  q: "Refer to the graph. A new technology improves production of Good X. Which frontier represents the new production possibilities?",
  answer: "The frontier that extends farther along the Good X axis",
  distractors: ["The unchanged frontier", "The frontier entirely inside the original", "The point inside the original frontier"],
  objective: "TEST.5",
  primarySkill: "ppf_shift",
  type: "graph_interpretation",
  difficulty: "medium",
  feedback: "Good-X-specific technology expands the attainable maximum of Good X.",
  graphRequired: true,
  asset: "synthetic.webp"
}, {
  id: "SYNTHETIC-GRAPH-EXTERNAL-TAX",
  q: "Refer to the graph. A $5 tax is imposed. What price do buyers pay after the tax?",
  answer: "$12",
  distractors: ["$5", "$7", "$17"],
  objective: "TEST.6",
  primarySkill: "tax_graph_reading",
  type: "graph_calculation",
  difficulty: "medium",
  feedback: "The tax is external scenario information; the buyer price must be read from the graph.",
  graphRequired: true,
  asset: "synthetic.webp"
}], { conceptId: "synthetic", validateAssets: false });
assert(graphEvidence.findings.some(finding => finding.questionId === "SYNTHETIC-GRAPH-EVIDENCE-LEAK" && finding.severity === "REVIEW" && finding.rule === "graph-evidence-redundant-in-stem"), "Graph-derived values reproduced in the stem were not flagged");
for (const id of ["SYNTHETIC-GRAPH-EVIDENCE-REQUIRED", "SYNTHETIC-GRAPH-EXTERNAL-TECHNOLOGY", "SYNTHETIC-GRAPH-EXTERNAL-TAX"]) {
  assert(!graphEvidence.findings.some(finding => finding.questionId === id && finding.rule === "graph-evidence-redundant-in-stem"), `${id} was incorrectly classified as graph-evidence leakage`);
}

const foundationsConcepts = [
  "scarcity-and-tradeoffs",
  "opportunity-cost",
  "production-possibilities-frontier",
  "marginal-analysis",
  "incentives",
  "models-and-assumptions"
];
const foundationsEntries = collectComposerQuestions(library, { concepts: foundationsConcepts });
const foundationsResult = auditQuestionRecords(foundationsEntries, {
  assetMap: assets,
  composerRoot: path.join(repoRoot, "build", "faculty-build-composer")
});
assert.equal(foundationsEntries.length, 563, "Foundations audit scope changed");
assert.deepEqual(foundationsResult.counts, { errors: 0, warnings: 0, reviews: 68 }, "Foundations post-remediation audit totals changed");
assert.equal(foundationsResult.findings.filter(finding => finding.rule === "near-duplicate-stem").length, 4, "Foundations retained near-duplicate judgment count changed");
assert.equal(foundationsResult.findings.filter(finding => finding.rule === "weak-absolute-distractors").length, 64, "Foundations retained weak-absolute judgment count changed");
assert(foundationsResult.findings.every(finding => ["near-duplicate-stem", "weak-absolute-distractors"].includes(finding.rule)), "Foundations has an unreviewed post-remediation rule");
for (const repairedRule of [
  "invalid-answer-key",
  "image-without-graph-required",
  "graph-prompt-missing-cue",
  "graph-evidence-redundant-in-stem",
  "repeated-feedback",
  "answer-length-outlier",
  "stem-answer-redundancy",
  "possible-difficulty-overstatement"
]) assert.equal(foundationsResult.findings.filter(finding => finding.rule === repairedRule).length, 0, `Foundations rule ${repairedRule} returned after remediation`);

const foundationsArtifactDir = path.join(repoRoot, "validation_artifacts", "question_quality");
const foundationsAuthorization = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "foundations_audit_authorization.json"), "utf8"));
const foundationsRemediation = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "foundations_audit_remediation.json"), "utf8"));
assert.equal(foundationsAuthorization.phase, "phaseQH5-foundations-curation-graph-evidence-v1", "Foundations authorization phase changed");
assert.equal(foundationsAuthorization.changes.length, 99, "Foundations authorization count changed");
assert.equal(foundationsAuthorization.retainedReviews.length, 66, "Foundations baseline retained-review judgment count changed");
assert.equal(foundationsAuthorization.anticipatedPostRemediationReviews.length, 4, "Foundations anticipated near-duplicate judgment count changed");
assert.equal(foundationsRemediation.changes.length, 99, "Foundations remediation count changed");
assert.equal(foundationsRemediation.librarySha256, library.librarySha256, "Foundations remediation library hash is stale");
assert.equal(
  sha256(fs.readFileSync(path.join(foundationsArtifactDir, "foundations_quality_audit_pre_remediation.json"))),
  foundationsRemediation.originalBaselineAuditSha256,
  "Immutable Foundations baseline audit changed"
);
const foundationsById = new Map(foundationsEntries.map(entry => [String(entry.id), entry.question]));
const answerHash = value => sha256(String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
for (const change of foundationsRemediation.changes) {
  const question = foundationsById.get(String(change.id));
  assert(question, `Missing Foundations-remediated question ${change.id}`);
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  assert.equal(question.sourceHash, sha256(JSON.stringify(stable(payload))), `Stale Foundations source hash on ${change.id}`);
  assert((question.sourceOccurrences || []).every(occurrence => occurrence.sourceHash === question.sourceHash && occurrence.sourceCurationPhase === foundationsAuthorization.phase), `Stale Foundations source occurrence on ${change.id}`);
  assert.equal(question.options.filter(option => answerHash(option) === question.aHash).length, 1, `Foundations answer key no longer resolves uniquely on ${change.id}`);
  assert.deepEqual(question, change.after, `Foundations remediation record is stale for ${change.id}`);
}
assert.equal(foundationsRemediation.changes.filter(change => change.rules.includes("image-without-graph-required")).length, 23, "Expected 23 graphRequired repairs");
assert.equal(foundationsRemediation.changes.filter(change => change.rules.includes("repeated-feedback")).length, 57, "Expected 57 scenario-specific feedback repairs");

const report = renderMarkdownReport({
  generatedAt: "validation",
  libraryVersion: library.libraryVersion,
  scope: { concepts, pools: [], questionCount: entries.length },
  counts: result.counts,
  ruleCounts: [],
  findings: synthetic.findings.slice(0, 1)
});
assert(report.includes("# Question Quality Audit") && report.includes("Current wording"), "Human-readable report contract changed");

const summarizedReport = renderMarkdownReport({
  generatedAt: "validation",
  libraryVersion: library.libraryVersion,
  scope: { concepts, pools: [], poolInventory: ["easy", "hard"], questionCount: entries.length },
  counts: result.counts,
  ruleCounts: [],
  conceptFindingCounts: [{ concept: "demand", count: 1 }],
  poolFindingCounts: [{ pool: "hard", count: 1 }],
  findingSummary: { totalFindings: 1, uniqueQuestionsAffected: 1, questionsWithMultipleFindings: [] },
  findings: synthetic.findings.slice(0, 1)
});
assert(summarizedReport.includes("Unique questions affected: 1") && summarizedReport.includes("Findings by concept") && summarizedReport.includes("Findings by pool"), "Audit summary sections were not rendered");

console.log(JSON.stringify({
  status: "PASS",
  targetQuestions: entries.length,
  counts: result.counts,
  supportedScopes: ["single concept", "concept list", "single pool", "pool list", "full corpus"],
  classifications: ["ERROR", "WARNING", "REVIEW"]
}, null, 2));
