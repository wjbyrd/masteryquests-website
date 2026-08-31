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

const report = renderMarkdownReport({
  generatedAt: "validation",
  libraryVersion: library.libraryVersion,
  scope: { concepts, pools: [], questionCount: entries.length },
  counts: result.counts,
  ruleCounts: [],
  findings: result.findings.slice(0, 1)
});
assert(report.includes("# Question Quality Audit") && report.includes("Current wording"), "Human-readable report contract changed");

console.log(JSON.stringify({
  status: "PASS",
  targetQuestions: entries.length,
  counts: result.counts,
  supportedScopes: ["single concept", "concept list", "single pool", "pool list", "full corpus"],
  classifications: ["ERROR", "WARNING", "REVIEW"]
}, null, 2));
