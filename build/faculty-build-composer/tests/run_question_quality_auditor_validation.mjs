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

// Focused graph-assessment contract tests 3-18. Generated-path tests 1-2 live in
// run_trial_by_graph_validation.js, where real build output is available.
const graphContractQuestion = (id, q, imageAlt, overrides = {}) => ({
  id,
  q,
  options: overrides.options || ["Option A", "Option B", "Option C", "Option D"],
  answer: (overrides.options || ["Option A"])[0],
  objective: "TEST.GRAPH",
  primarySkill: "graph_reasoning",
  type: "graph_interpretation",
  difficulty: overrides.difficulty || "medium",
  feedback: overrides.feedback || "The graph evidence and economic reasoning support the keyed option.",
  graphRequired: true,
  asset: "synthetic.webp",
  imageAlt,
  graphDescription: imageAlt
});
const contractCases = [
  graphContractQuestion("GRAPH-TEST-3", "What market change is shown from A to B?", "Demand stays fixed while supply shifts left from S0 to S1. Point A is the first equilibrium and point B is the second."),
  graphContractQuestion("GRAPH-TEST-4", "What market change is shown from A to B?", "Supply-and-demand graph showing demand D0, supply curves S0 and S1, and equilibrium points A and B."),
  graphContractQuestion("GRAPH-TEST-5", "What market change is shown from A to B?", "D0 intersects S0 at point A, quantity 200 and price $10. D0 intersects S1 at point B, quantity 150 and price $12. S1 lies left of S0 at every displayed price."),
  graphContractQuestion("GRAPH-TEST-6", "Which point is inefficient?", "Point F is inside the PPF and inefficient; points A through E lie on the frontier."),
  graphContractQuestion("GRAPH-TEST-7", "Which point is inefficient?", "Points A through E lie on the frontier. Point F lies inside the frontier, and point G lies outside it."),
  graphContractQuestion("GRAPH-TEST-9", "Refer to the graph. Compare point A with point B and then point C.", "The graph labels point A at the initial observation, point B at the intermediate observation, and point C at the final observation, with guides to both axes."),
  graphContractQuestion("GRAPH-TEST-10", "Refer to the graph. What changes at point A?", "The graph labels points B and C with guides to both axes."),
  graphContractQuestion("GRAPH-TEST-11", "Refer to the graph. Compare the two stages from the initial point on D0 to the final point on D1.", "The graph contains only the two curves D0 and D1 without identified stage observations."),
  graphContractQuestion("GRAPH-TEST-12", "Refer to the graph. Compare the two stages from the initial point on D0 to the final point on D1.", "The graph contains only the two curves D0 and D1 without identified stage observations.", { options: ["50→125, then 125→225", "50→150, then 150→225", "50→25, then 25→225", "125→50, then 50→225"] }),
  graphContractQuestion("GRAPH-TEST-13", "Refer to the graph. Income rises and input costs increase. Which point is the new equilibrium?", "A demand graph with curves D0 and D1 and labeled points A and B."),
  graphContractQuestion("GRAPH-TEST-14", "Refer to the graph. A $5 tax is imposed. What price do buyers pay after the tax?", "Supply and demand curves with buyer and seller prices labeled at the tax quantity."),
  graphContractQuestion("GRAPH-TEST-15", "Refer to the graph. Because the axes lack numerical ticks, which information can still be determined?", "The graph contains D0, D1, S0, S1, and four labeled equilibrium points."),
  graphContractQuestion("GRAPH-TEST-16", "Refer to the graph. The market begins at D. The good is normal. Consumer income increases while input costs rise. Compare both effects and infer which point is the new equilibrium.", "D0 and D1 slope downward; S0 and S1 slope upward. D is D0-S0, A is D0-S1, C is D1-S0, and B is D1-S1."),
  graphContractQuestion("GRAPH-TEST-17", "Refer to the graph. Which point is productively inefficient?", "Points A through E lie on the PPF, point F lies inside the frontier, and point G lies outside."),
  graphContractQuestion("GRAPH-TEST-18", "Refer to the graph. Because this four-intersection graph has no numeric ticks, can exact magnitudes be read?", "The graph contains D0, D1, S0, S1, and four labeled equilibrium points.", { difficulty: "elite" })
];
const graphContract = auditAuthoredQuestions(contractCases, { conceptId: "market-equilibrium", validateAssets: false });
const hasRule = (id, rule) => graphContract.findings.some(finding => finding.questionId === id && finding.rule === rule);
for (const id of ["GRAPH-TEST-3", "GRAPH-TEST-6"]) assert(hasRule(id, "accessibility-answer-leak"), `${id} accessibility leak was not detected`);
for (const id of ["GRAPH-TEST-4", "GRAPH-TEST-5", "GRAPH-TEST-7"]) assert(!hasRule(id, "accessibility-answer-leak"), `${id} safe accessibility was incorrectly flagged`);
assert(!hasRule("GRAPH-TEST-9", "graph-question-evidence-mismatch"), "Complete A/B/C graph contract was incorrectly flagged");
for (const id of ["GRAPH-TEST-10", "GRAPH-TEST-11", "GRAPH-TEST-12", "GRAPH-TEST-13"]) assert(hasRule(id, "graph-question-evidence-mismatch"), `${id} insufficient graph evidence was not detected`);
assert(!hasRule("GRAPH-TEST-14", "graph-evidence-redundant-in-stem"), "External scenario input was incorrectly treated as graph-evidence redundancy");
for (const id of ["GRAPH-TEST-15", "GRAPH-TEST-18"]) assert(hasRule(id, "graph-task-low-economic-value"), `${id} low-value graph-meta task was not detected`);
for (const id of ["GRAPH-TEST-16", "GRAPH-TEST-17"]) assert(!hasRule(id, "graph-task-low-economic-value"), `${id} legitimate economics graph task was incorrectly flagged`);

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
assert.deepEqual(foundationsResult.counts, { errors: 0, warnings: 0, reviews: 67 }, "Foundations post-remediation audit totals changed");
assert.equal(foundationsResult.findings.filter(finding => finding.rule === "near-duplicate-stem").length, 4, "Foundations retained near-duplicate judgment count changed");
assert.equal(foundationsResult.findings.filter(finding => finding.rule === "weak-absolute-distractors").length, 62, "Foundations retained weak-absolute judgment count changed");
assert.equal(foundationsResult.findings.filter(finding => finding.rule === "answer-length-outlier" && finding.questionId === "P52A-MARG-R-003").length, 1, "Workbook-authorized Foundations answer-length review changed");
assert(foundationsResult.findings.every(finding => ["near-duplicate-stem", "weak-absolute-distractors", "answer-length-outlier"].includes(finding.rule)), "Foundations has an unreviewed post-remediation rule");
for (const repairedRule of [
  "invalid-answer-key",
  "image-without-graph-required",
  "graph-prompt-missing-cue",
  "graph-evidence-redundant-in-stem",
  "repeated-feedback",
  "stem-answer-redundancy",
  "possible-difficulty-overstatement"
]) assert.equal(foundationsResult.findings.filter(finding => finding.rule === repairedRule).length, 0, `Foundations rule ${repairedRule} returned after remediation`);

const foundationsArtifactDir = path.join(repoRoot, "validation_artifacts", "question_quality");
const humanReadCuration = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "question_rewrite_master_execution_ledger.json"), "utf8"));
const humanReadExpectedById = new Map(humanReadCuration.entries.map(change => [String(change.questionId), change.after]));
const humanReadById = new Map(humanReadCuration.entries.map(change => [String(change.questionId), change]));
assert.equal(humanReadCuration.entries.length, 1915, "Human-read curation ledger count changed");
assert.equal(humanReadCuration.librarySha256, library.librarySha256, "Human-read curation library hash is stale");
const foundationsAuthorization = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "foundations_audit_authorization.json"), "utf8"));
const foundationsRemediation = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "foundations_audit_remediation.json"), "utf8"));
assert.equal(foundationsAuthorization.phase, "phaseQH5-foundations-curation-graph-evidence-v1", "Foundations authorization phase changed");
assert.equal(foundationsAuthorization.changes.length, 99, "Foundations authorization count changed");
assert.equal(foundationsAuthorization.retainedReviews.length, 66, "Foundations baseline retained-review judgment count changed");
assert.equal(foundationsAuthorization.anticipatedPostRemediationReviews.length, 4, "Foundations anticipated near-duplicate judgment count changed");
assert.equal(foundationsRemediation.changes.length, 99, "Foundations remediation count changed");
assert(library.libraryVersion.includes(foundationsRemediation.phase), "Foundations curation phase disappeared from the current library lineage");
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
  const expected = humanReadExpectedById.get(String(change.id)) || change.after;
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  assert.equal(question.sourceHash, sha256(JSON.stringify(stable(payload))), `Stale Foundations source hash on ${change.id}`);
  assert((question.sourceOccurrences || []).every(occurrence => occurrence.sourceHash === question.sourceHash && occurrence.sourceCurationPhase === question.sourceCurationPhase), `Stale Foundations source occurrence on ${change.id}`);
  assert.equal(question.options.filter(option => answerHash(option) === question.aHash).length, 1, `Foundations answer key no longer resolves uniquely on ${change.id}`);
  assert.deepEqual(question, expected, `Foundations remediation lineage is stale for ${change.id}`);
}
assert.equal(foundationsRemediation.changes.filter(change => change.rules.includes("image-without-graph-required")).length, 23, "Expected 23 graphRequired repairs");
assert.equal(foundationsRemediation.changes.filter(change => change.rules.includes("repeated-feedback")).length, 57, "Expected 57 scenario-specific feedback repairs");

const graphIntegrityAuthorization = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "graph_assessment_integrity_authorization.json"), "utf8"));
const graphIntegrityRemediation = JSON.parse(fs.readFileSync(path.join(foundationsArtifactDir, "graph_assessment_integrity_remediation.json"), "utf8"));
assert.equal(graphIntegrityAuthorization.phase, "phaseQH6-graph-assessment-integrity-v1", "Graph integrity authorization phase changed");
assert.equal(graphIntegrityRemediation.changes.length, 8, "Graph integrity remediation question count changed");
assert.equal(graphIntegrityRemediation.assetChanges.length, 3, "Graph integrity remediation asset-metadata count changed");
for (const change of graphIntegrityRemediation.changes) {
  const laterCuration = humanReadById.get(String(change.id));
  const graphPostState = laterCuration?.before || collectComposerQuestions(library).find(entry => String(entry.id) === String(change.id))?.question;
  assert.deepEqual(graphPostState, change.after, `Graph integrity remediation state changed outside the authorized human-read ledger for ${change.id}`);
}
assert.equal(sha256(fs.readFileSync(path.join(foundationsArtifactDir, "graph_assessment_integrity_pre_remediation.json"))), graphIntegrityRemediation.baselineAuditSha256, "Immutable graph integrity baseline changed");
const scopedGraphEntries = collectComposerQuestions(library, { concepts: ["demand", "supply", "market-equilibrium", "production-possibilities-frontier"] })
  .filter(entry => entry.question.image || entry.question.asset || entry.question.graphRequired || /graph/i.test(entry.question.type || ""));
assert.equal(scopedGraphEntries.length, 115, "Scoped graph inventory changed");
const scopedGraphResult = auditQuestionRecords(scopedGraphEntries, { assetMap: assets, composerRoot: path.join(repoRoot, "build", "faculty-build-composer") });
for (const rule of ["accessibility-answer-leak", "graph-question-evidence-mismatch", "graph-task-low-economic-value", "graph-evidence-redundant-in-stem"]) {
  assert.equal(scopedGraphResult.findings.filter(finding => finding.rule === rule).length, 0, `Scoped graph rule ${rule} returned after remediation`);
}

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
