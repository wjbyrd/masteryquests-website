#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { normalizeDuplicateOption, renderMarkdownReport } from "../question_quality_auditor.mjs";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] || path.join(scriptDir, "..", ".."));
const composer = path.join(repo, "build", "faculty-build-composer");
const dataDir = path.join(composer, "data");
const PHASE = "phaseMacroOpenEconomy-v1";
const GENERATED_AT = "2026-09-04T18:00:00.000Z";
const CHILDREN = [
  "international-transactions-and-identities", "nominal-exchange-rates",
  "real-exchange-rates-and-purchasing-power", "capital-flows-and-net-capital-outflow",
  "foreign-exchange-market", "open-economy-policy-transmission"
];
const FAMILY = "open-economy-macroeconomics";
const EXPECTED_NEW = 240;
const sha = value => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const answerHash = value => sha(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
const qid = question => String(question?.canonicalId || question?.id || "");
const loadWrapped = raw => JSON.parse(raw.trim().slice("window.MQ_COMPOSER_LIBRARY=".length, -1));
const occurrences = module => [
  ...Object.entries(module?.questions || {}).flatMap(([pool, list]) => (list || []).map(question => ({ pool, container: "questions", question }))),
  ...(module?.repairQuestions || []).map(question => ({ pool: "repair", container: "repairQuestions", question })),
  ...(module?.repairSeedQuestions || []).map(question => ({ pool: "repairSeed", container: "repairSeedQuestions", question })),
  ...(module?.bridgeQuestions || []).map(question => ({ pool: "bridge", container: "bridgeQuestions", question }))
];
const flatten = library => {
  const out = new Map();
  for (const [conceptId, module] of Object.entries(library.concepts || {})) for (const row of occurrences(module)) {
    const id = qid(row.question);
    if (!out.has(id)) out.set(id, []);
    out.get(id).push({ conceptId, pool: row.pool, container: row.container, question: stable(row.question) });
  }
  return out;
};
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const library = loadWrapped(fs.readFileSync(path.join(dataDir, "composer_library.js"), "utf8"));
const headLibrary = loadWrapped(execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: repo, encoding: "utf8", maxBuffer: 96 * 1024 * 1024 }));
const baselineAudit = readJson(path.join(repo, "audit_tools", "macro_phase4", "macro_phase4_quality_audit_post.json"));
const newAudit = readJson(path.join(scriptDir, "macro_open_economy_quality_audit.json"));
const fullAudit = readJson(path.join(scriptDir, "macro_open_economy_full_macro_quality_audit.json"));
const qManifest = readJson(path.join(scriptDir, "macro_open_economy_question_manifest.json"));
const graphManifest = readJson(path.join(scriptDir, "macro_open_economy_graph_manifest.json"));
const humanRead = readJson(path.join(scriptDir, "macro_open_economy_human_read_progress.json"));
const resourceGaps = readJson(path.join(scriptDir, "macro_open_economy_resource_gaps.json"));
const before = flatten(headLibrary), after = flatten(library);
const added = [...after.keys()].filter(id => !before.has(id)).sort();
const lost = [...before.keys()].filter(id => !after.has(id)).sort();
const changed = [...before.keys()].filter(id => after.has(id) && JSON.stringify(before.get(id)) !== JSON.stringify(after.get(id))).sort();
const newIds = added.filter(id => id.startsWith("PMOE-"));
const duplicateIds = [...after.entries()].filter(([, rows]) => rows.length !== 1).map(([id, rows]) => ({ id, occurrences: rows.length }));
const newRows = newIds.map(id => after.get(id)[0]);
const oldSupplement = occurrences(headLibrary.concepts["integrated-macroeconomic-analysis"]);
const newSupplement = occurrences(library.concepts["integrated-macroeconomic-analysis"]);
const checks = [];
const check = (name, pass, detail = "") => checks.push({ name, status: pass ? "PASS" : "FAIL", detail });

check("Authoritative baseline has 2,870 Macro questions", baselineAudit.scope.questionCount === 2870, String(baselineAudit.scope.questionCount));
check("Exactly 240 new question IDs were added", newIds.length === EXPECTED_NEW && added.length === EXPECTED_NEW, `new=${newIds.length}, globalAdded=${added.length}`);
check("Every new question exists exactly once", duplicateIds.filter(row => newIds.includes(row.id)).length === 0, JSON.stringify(duplicateIds.filter(row => newIds.includes(row.id))));
check("No existing question record changed", changed.length === 0, changed.join(", "));
check("No existing question was lost", lost.length === 0, lost.join(", "));
check("No Micro question changed", changed.length === 0 && added.every(id => id.startsWith("PMOE-")), `changed=${changed.length}, non-PMOE additions=${added.filter(id => !id.startsWith("PMOE-")).length}`);
check("Supplement remains exactly intact", oldSupplement.length === 112 && newSupplement.length === 112 && JSON.stringify(stable(oldSupplement)) === JSON.stringify(stable(newSupplement)), `${oldSupplement.length}/${newSupplement.length}`);
check("Macro totals are 3,110 total and 2,998 ordinary", 2870 + newIds.length === 3110 && 2758 + newIds.length === 2998, `${2870 + newIds.length}/${2758 + newIds.length}`);
check("All six new concepts exist with 40 records", CHILDREN.every(id => occurrences(library.concepts[id]).length === 40), CHILDREN.map(id => `${id}:${occurrences(library.concepts[id]).length}`).join(", "));
check("Question manifest totals agree", qManifest.totalNewQuestions === EXPECTED_NEW && Object.values(qManifest.byChild).every(row => row.totalQuestions === 40), String(qManifest.totalNewQuestions));
const exactKeys = newRows.map(({ question }) => question.options.filter(option => answerHash(option) === question.aHash).length);
check("Every new answer hash resolves exactly once", exactKeys.every(count => count === 1), `${exactKeys.filter(count => count !== 1).length} failures`);
const duplicateOptionQuestions = newRows.filter(({ question }) => new Set(question.options.map(normalizeDuplicateOption)).size !== question.options.length).map(row => qid(row.question));
check("Every new question has distinct options", duplicateOptionQuestions.length === 0, duplicateOptionQuestions.join(", "));
check("New-family deterministic auditor errors are zero", newAudit.counts.errors === 0, JSON.stringify(newAudit.counts));
check("Full-Macro deterministic auditor errors remain zero", fullAudit.counts.errors === 0, JSON.stringify(fullAudit.counts));
check("Every new question was human-read exactly once", humanRead.reviewedExactlyOnce === true && humanRead.totalExpected === EXPECTED_NEW && humanRead.totalReviewed === EXPECTED_NEW && humanRead.duplicateReviews === 0 && humanRead.missingReviews === 0, JSON.stringify({ reviewed: humanRead.totalReviewed, duplicate: humanRead.duplicateReviews, missing: humanRead.missingReviews }));
const auditReviews = newAudit.findings.filter(finding => finding.severity === "REVIEW").map(finding => `${finding.questionId}:${finding.rule}`).sort();
const reviewDispositions = (humanRead.semanticReviewDispositions || []).map(row => `${row.questionId}:${row.finding}`).sort();
check("Every semantic REVIEW finding has an explicit human disposition", JSON.stringify(auditReviews) === JSON.stringify(reviewDispositions) && humanRead.semanticReviewDispositions.every(row => row.disposition === "accepted" && row.rationale), `${reviewDispositions.length}/${auditReviews.length} dispositions`);

const model = require(path.join(composer, "course-area-model.js"));
const macroFamilies = model.NAVIGATION_FAMILIES.macro;
const family = macroFamilies.find(row => row.id === FAMILY);
const oldParents = ["gdp-national-income", "inflation-real-values", "growth-productivity", "unemployment-labor", "saving-fiscal-foundations", "money-banking-fed", "money-growth-inflation", "ad-as-equilibrium", "stabilization-policy", "phillips-disinflation"];
check("Open-economy parent and children resolve in navigation", family && JSON.stringify(family.conceptIds) === JSON.stringify(CHILDREN), family ? family.conceptIds.join(", ") : "missing");
check("All ten prior dedicated Macro parents remain", oldParents.every(id => macroFamilies.some(row => row.id === id)), oldParents.filter(id => !macroFamilies.some(row => row.id === id)).join(", "));
check("Dedicated Macro parent count advances 10 to 11", oldParents.filter(id => macroFamilies.some(row => row.id === id)).length === 10 && Boolean(family), "10 prior + 1 new");
check("Selectable ordinary Macro child count advances 51 to 57", baselineAudit.scope.concepts.length === 52 && baselineAudit.scope.concepts.filter(id => id !== "integrated-macroeconomic-analysis").length + CHILDREN.length === 57, "51 + 6");

const assetByName = new Map((library.assetInventory || []).map(asset => [asset.filename, asset]));
const graphQuestions = newRows.filter(({ question }) => question.graphRequired);
const graphFailures = [];
for (const definition of graphManifest.assets) {
  const asset = assetByName.get(definition.filename);
  const diskPath = path.join(composer, String(definition.sourceUrl).replaceAll("/", path.sep));
  if (!asset || !fs.existsSync(diskPath)) graphFailures.push(`${definition.filename}:missing`);
  else if (sha(fs.readFileSync(diskPath)) !== asset.sha256) graphFailures.push(`${definition.filename}:hash`);
}
for (const { question } of graphQuestions) {
  if (!question.image || !question.imageAlt || !question.graphDescription || !/\b(?:graph|figure|diagram)\b/i.test(question.q) || /FX-0\d|\.webp/i.test(question.q)) graphFailures.push(`${qid(question)}:contract`);
}
const coreGraphSet = [...graphManifest.requiredSet.numbered, ...graphManifest.requiredSet.conceptual];
check("Eight core FX assets plus two NCO supplements exist, register, and hash correctly", coreGraphSet.length === 8 && graphManifest.assets.length === 10 && graphFailures.length === 0, graphFailures.join(", "));
check("All graph-required questions satisfy cue/accessibility/non-leaking checks", graphQuestions.length > 0 && graphFailures.length === 0, `${graphQuestions.length} graph-required questions`);
check("Six review-resource gaps are explicit and create no PDFs", resourceGaps.pdfsCreated === 0 && resourceGaps.concepts.length === 6 && resourceGaps.concepts.every(row => row.disposition === "NO_SHEET_INTEGRATION_META"), `${resourceGaps.concepts.length} gaps`);

const core = require(path.join(composer, "composer-core.js"));
const helpers = require(path.join(composer, "tests", "composer-test-helpers.js"));
const macroConceptIds = [...baselineAudit.scope.concepts, ...CHILDREN];
const modes = ["standard", "timed", "exam", "legendary", "score"];
const composeResult = ids => core.compose(library, { schemaVersion: "1.2.0", title: "Open-Economy Macro Validation", slug: "open-economy-macro-validation", supportedModes: modes, selectedConceptIds: ids, checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null } });
const childCompositions = CHILDREN.map(id => ({ id, composition: composeResult([id]) }));
const familyComposition = composeResult(CHILDREN);
const fullComposition = composeResult(macroConceptIds);
check("Each selected child composes in all modes", childCompositions.every(row => !row.composition.errors.length && row.composition.validation?.modes?.every(mode => mode.ok)), childCompositions.filter(row => row.composition.errors.length || !row.composition.validation?.modes?.every(mode => mode.ok)).map(row => row.id).join(", "));
check("New family composes in all modes", !familyComposition.errors.length && familyComposition.validation?.modes?.every(mode => mode.ok), familyComposition.errors.join(" | "));
check("Full 58-concept Macro selection composes in all modes", !fullComposition.errors.length && fullComposition.validation?.modes?.every(mode => mode.ok), fullComposition.errors.join(" | "));
const familyAnswers = await core.verifyAnswers(familyComposition);
const fullAnswers = await core.verifyAnswers(fullComposition);
check("Composer answer verification passes", familyAnswers.ok && fullAnswers.ok, `family=${familyAnswers.issues.length}, full=${fullAnswers.issues.length}`);
let conceptReviewError = "";
try { helpers.attachConceptReviewRuntime(core, fullComposition, library, macroConceptIds); } catch (error) { conceptReviewError = String(error?.message || error); }
check("Concept Review runtime resolves", !conceptReviewError, conceptReviewError);

const embedded = {}, embedFailures = [];
for (const asset of fullComposition.assets || []) {
  const source = path.join(composer, String(asset.sourceUrl || "").replaceAll("/", path.sep));
  if (!fs.existsSync(source)) { embedFailures.push(asset.sourceUrl); continue; }
  const mime = path.extname(source).toLowerCase() === ".webp" ? "image/webp" : path.extname(source).toLowerCase() === ".png" ? "image/png" : "application/octet-stream";
  embedded[asset.runtimePath] = `data:${mime};base64,${fs.readFileSync(source).toString("base64")}`;
}
fullComposition.embeddedQuestionAssets = embedded;
check("All full-Macro graph assets embed", embedFailures.length === 0 && graphManifest.assets.every(asset => Object.keys(embedded).some(runtime => runtime.endsWith(asset.filename))), embedFailures.join(", "));
const template = fs.readFileSync(path.join(composer, "template", "mastery-quests-faculty-template-composer-ready.html"), "utf8");
const recipe = fullComposition.recipe;
const config = await core.createConfig(recipe, library, sha(template));
const metadata = { phase: PHASE, generatedAt: GENERATED_AT, validationPurpose: "Full Principles Macro open-economy expansion", selectedConceptIds: macroConceptIds, libraryVersion: library.libraryVersion, librarySha256: library.librarySha256 };
const html = core.buildHtml(template, fullComposition, config, metadata);
const inlineIssues = [];
[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]).filter(code => code.trim() && !/^\s*[\[{]/.test(code.trim())).forEach((code, index) => { try { new vm.Script(code, { filename: `macro-open-economy:inline-${index + 1}.js` }); } catch (error) { inlineIssues.push(String(error.message || error)); } });
const packageDir = path.join(repo, "validation_artifacts", "macro_open_economy", "generated_packages", "principles-macro");
fs.mkdirSync(packageDir, { recursive: true });
const packageManifest = { ...metadata, htmlSha256: sha(html), templateSha256: sha(template), macroQuestionCount: 3110, assetsEmbedded: Object.keys(embedded).length };
fs.writeFileSync(path.join(packageDir, "index.html"), html);
fs.writeFileSync(path.join(packageDir, "manifest.json"), `${JSON.stringify(packageManifest, null, 2)}\n`);
let JSZip;
try { JSZip = require("jszip"); } catch { JSZip = require(path.join(process.env.USERPROFILE, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules", "jszip")); }
const zip = new JSZip(), zipDate = new Date(GENERATED_AT);
zip.file("index.html", html, { date: zipDate });
zip.file("manifest.json", `${JSON.stringify(packageManifest, null, 2)}\n`, { date: zipDate });
const zipBytes = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
const zipPath = path.join(packageDir, "principles-macro-open-economy.zip");
fs.writeFileSync(zipPath, zipBytes);
check("Full-Macro HTML and ZIP build", fs.existsSync(path.join(packageDir, "index.html")) && fs.existsSync(zipPath) && inlineIssues.length === 0, inlineIssues.join(" | "));

const publisherDryRun = JSON.parse(execFileSync(process.execPath, [path.join(scriptDir, "publish_macro_open_economy.mjs"), repo], { cwd: repo, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
check("Publisher is idempotent", publisherDryRun.status === "PASS" && publisherDryRun.stale.length === 0, JSON.stringify(publisherDryRun.stale));
const failures = checks.filter(row => row.status === "FAIL");
const roleTotals = Object.values(qManifest.byChild).reduce((sum, row) => ({ practice: sum.practice + row.practiceCount, boss: sum.boss + row.bossCheckpointCount, repair: sum.repair + row.repairCount, bridge: sum.bridge + row.bridgeCount, graph: sum.graph + row.graphCount, calculation: sum.calculation + row.calculationCount }), { practice: 0, boss: 0, repair: 0, bridge: 0, graph: 0, calculation: 0 });
const difficultyTotals = Object.values(qManifest.byChild).reduce((sum, row) => { for (const [level, count] of Object.entries(row.difficultyDistribution)) sum[level] = (sum[level] || 0) + count; return sum; }, {});
const validation = { schemaVersion: "1.0.0", phase: PHASE, generatedAt: GENERATED_AT, verdict: failures.length ? "FAIL" : "PASS", summary: { checks: checks.length, passed: checks.length - failures.length, failed: failures.length, beforeMacroQuestions: 2870, afterMacroQuestions: 3110, newQuestions: newIds.length, oldChanged: changed.length, microChanged: changed.length, newAudit: newAudit.counts, fullAudit: fullAudit.counts }, checks, details: { newIds, changedExistingIds: changed, lostIds: lost, duplicateIds, roleTotals, difficultyTotals, graphQuestions: graphQuestions.length, familyAnswers, fullAnswers, packages: { html: path.relative(repo, path.join(packageDir, "index.html")).replaceAll("\\", "/"), zip: path.relative(repo, zipPath).replaceAll("\\", "/"), zipBytes: zipBytes.length, zipSha256: sha(zipBytes), embeddedAssets: Object.keys(embedded).length } } };
const childCounts = CHILDREN.map(id => `${id}=40`).join(", ");
const childTitles = CHILDREN.map(id => `${id} (${library.concepts[id].title})`).join("; ");
const reviewLines = humanRead.semanticReviewDispositions.map(row => `- ${row.questionId} / ${row.finding}: **${row.disposition}** — ${row.rationale}`).join("\n");
const qualityReport = `${renderMarkdownReport(newAudit)}\n## Human semantic dispositions\n\n${reviewLines}\n`;
const report = `# Principles Macro Open-Economy Expansion\n\nVerdict: **${validation.verdict}**\n\n## Final report\n\n1. **Repository root:** \`${repo.replaceAll("\\", "/")}\`\n2. **Branch:** \`${execFileSync("git", ["branch", "--show-current"], { cwd: repo, encoding: "utf8" }).trim()}\`\n3. **Pre-existing inventory:** no faculty-selectable open-economy Macro family or registered core FX graph set; 36 incidental Macro references; the separate Micro international-trade family has 487 questions; the legacy Exchange Citadel has 714 records and was not imported wholesale.\n4. **Parent family:** \`${FAMILY}\` (Open-Economy Macroeconomics), navigation-only.\n5. **Child concepts:** ${childTitles}.\n6. **Taxonomy rationale:** separates accounting, nominal-rate skills, real-rate/PPP reasoning, capital-flow mechanisms, FX graph analysis, and multi-market policy transmission while preserving the Micro trade boundary.\n7. **Total new questions:** ${newIds.length}.\n8. **Counts by child:** ${childCounts}.\n9. **Counts by role/pool:** ${Object.entries(roleTotals).map(([key, value]) => `${key}=${value}`).join(", ")}; canonical pools per child are easy=6, medium=6, hard=6, elite=2, legendary=6, boss=9, legendaryBoss=3, repairQuestions=1, bridgeQuestions=1.\n10. **Counts by difficulty:** ${Object.entries(difficultyTotals).map(([key, value]) => `${key}=${value}`).join(", ")}.\n11. **Graph assets:** reused all 10 user-supplied WebPs (FX-01 through FX-10); eight are the required core set and two are supplemental NCO-policy graphs; none were generated.\n12. **FX convention:** vertical axis is foreign currency per U.S. dollar, where higher means U.S.-dollar appreciation; horizontal axis is quantity of U.S. dollars exchanged. Core graphs use downward demand and upward supply; supplemental graphs use D=NX and vertical S=NCO.\n13. **Calculation count:** ${roleTotals.calculation}.\n14. **Repair/Bridge count:** ${roleTotals.repair} repair and ${roleTotals.bridge} bridge.\n15. **Human-read coverage:** ${humanRead.totalReviewed}/${humanRead.totalExpected}, exactly once, with ${humanRead.semanticReviewDispositions.length} explicit semantic dispositions.\n16. **Quality auditor:** new family errors=${newAudit.counts.errors}, warnings=${newAudit.counts.warnings}, reviews=${newAudit.counts.reviews}; full Macro errors=${fullAudit.counts.errors}, warnings=${fullAudit.counts.warnings}, reviews=${fullAudit.counts.reviews}.\n17. **Answer-key verification:** every new aHash resolves to exactly one option; Composer verification reports family=${familyAnswers.issues.length} and full=${fullAnswers.issues.length} issues.\n18. **Graph validation:** ${graphQuestions.length} graph-required questions pass cue, accessibility, non-leakage, file, registry, and SHA-256 checks; all 10 assets embed.\n19. **Composer integration:** all six children, the family, and the full 58-concept Macro selection compose in every supported mode; Concept Review runtime resolves.\n20. **Macro taxonomy:** dedicated parents 10 → 11; selectable ordinary children 51 → 57 (58 selections including the hidden supplement).\n21. **Macro questions:** total 2,870 → 3,110; ordinary 2,758 → 2,998; hidden supplement remains 112.\n22. **Existing-question fingerprints:** changed=${changed.length}, lost=${lost.length}.\n23. **Micro regression:** changed=${changed.length}; non-PMOE additions=${added.filter(id => !id.startsWith("PMOE-")).length}.\n24. **Resource sheets:** no PDFs were created; six \`NO_SHEET_INTEGRATION_META\` gaps are recorded.\n25. **Build/preflight:** ${checks.length - failures.length}/${checks.length} phase checks pass; fresh full-Macro HTML and ZIP built; inline JavaScript validates; publisher is idempotent.\n26. **Artifacts:** \`${path.relative(repo, scriptDir).replaceAll("\\", "/")}\`; \`${validation.details.packages.html}\`; \`${validation.details.packages.zip}\`. ZIP bytes=${validation.details.packages.zipBytes}; SHA-256=${validation.details.packages.zipSha256}.\n27. **Git status:** intentionally uncommitted; use \`git status --short\` for the live file list.\n\n## Semantic review dispositions\n\n${reviewLines}\n\n## Validation checks\n\n${checks.map(row => `- ${row.status}: ${row.name}${row.detail ? ` — ${row.detail}` : ""}`).join("\n")}\n`;
fs.writeFileSync(path.join(scriptDir, "macro_open_economy_validation.json"), `${JSON.stringify(validation, null, 2)}\n`);
fs.writeFileSync(path.join(scriptDir, "macro_open_economy_quality_audit.md"), qualityReport);
fs.writeFileSync(path.join(scriptDir, "macro_open_economy_report.md"), report);
console.log(JSON.stringify({ phase: PHASE, verdict: validation.verdict, checks: checks.length, passed: checks.length - failures.length, failed: failures.length, outputs: ["macro_open_economy_validation.json", "macro_open_economy_report.md"], package: validation.details.packages }, null, 2));
if (failures.length) process.exitCode = 1;
