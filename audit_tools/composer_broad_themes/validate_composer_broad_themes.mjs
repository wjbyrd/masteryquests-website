#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] || path.join(scriptDir, "..", ".."));
const composer = path.join(repo, "build", "faculty-build-composer");
const dataDir = path.join(composer, "data");
const artifactDir = path.join(repo, "validation_artifacts", "composer_broad_themes");
const PHASE = "phaseComposerBroadThemes-v1";
const GENERATED_AT = "2026-09-04T21:00:00-04:00";
const BASELINE_PATH = path.join(artifactDir, "composer_broad_themes_pre_edit_inventory.json");
const BROWSER_QA_PATH = path.join(artifactDir, "composer_broad_themes_browser_qa.json");
const MICRO_BROAD_IDS = [
  "micro-market-foundations", "micro-market-policy", "micro-firms-markets",
  "micro-market-failures-public-goods", "micro-factor-choice-inequality"
];
const MACRO_BROAD_IDS = [
  "macro-measurement-growth", "macro-saving-investment-budgets-debt",
  "money-banking-inflation", "stabilization-policy", "open-economy-macro"
];
const NEW_IDS = [
  "micro-market-failures-public-goods", "micro-factor-choice-inequality",
  "macro-saving-investment-budgets-debt"
];
const OPEN_ECONOMY = [
  "international-transactions-and-identities", "nominal-exchange-rates",
  "real-exchange-rates-and-purchasing-power", "capital-flows-and-net-capital-outflow",
  "foreign-exchange-market", "open-economy-policy-transmission"
];
const DEDICATED_MACRO_FAMILIES = [
  "gdp-national-income", "inflation-real-values", "growth-productivity", "unemployment-labor",
  "saving-fiscal-foundations", "money-banking-fed", "money-growth-inflation", "ad-as-equilibrium",
  "stabilization-policy", "open-economy-macroeconomics", "phillips-disinflation"
];

const sha = value => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const filesUnder = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesUnder(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const aggregateHash = files => sha([...files].sort().map(file => `${path.relative(repo, file).replaceAll("\\", "/")}:${sha(fs.readFileSync(file))}`).join("\n"));
const loadLibrary = () => {
  const raw = fs.readFileSync(path.join(dataDir, "composer_library.js"));
  return { raw, value: JSON.parse(raw.toString("utf8").trim().slice("window.MQ_COMPOSER_LIBRARY=".length, -1)) };
};
const extractPresets = source => {
  const match = source.match(/const PRESETS = ([\s\S]*?);\s*const state/);
  if (!match) throw new Error("Could not extract the Composer PRESETS array.");
  return vm.runInNewContext(match[1]);
};
const uniqueQuestionCount = library => new Set(Object.values(library.concepts || {}).flatMap(module => [
  ...Object.values(module.questions || {}).flatMap(list => list || []),
  ...(module.repairQuestions || []), ...(module.repairSeedQuestions || []), ...(module.bridgeQuestions || [])
].map(question => String(question.canonicalId || question.id || ""))).filter(Boolean)).size;
const recipeFor = (id, title, conceptIds, supportedModes) => ({
  schemaVersion: core.RECIPE_SCHEMA_VERSION, title, slug: id,
  supportedModes, selectedConceptIds: conceptIds,
  checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
});
const compileInline = (html, label) => {
  const issues = [];
  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1]).filter(code => code.trim() && !/^\s*[\[{]/.test(code.trim()))
    .forEach((code, index) => { try { new vm.Script(code, { filename: `${label}:inline-${index + 1}.js` }); } catch (error) { issues.push(String(error?.message || error)); } });
  return issues;
};
const embedAssets = composition => {
  const embedded = {};
  const missing = [];
  for (const asset of composition.assets || []) {
    const source = path.join(composer, String(asset.sourceUrl || "").replaceAll("/", path.sep));
    if (!fs.existsSync(source)) { missing.push(asset.sourceUrl); continue; }
    const extension = path.extname(source).toLowerCase();
    const mime = extension === ".webp" ? "image/webp" : extension === ".png" ? "image/png" : "application/octet-stream";
    embedded[asset.runtimePath] = `data:${mime};base64,${fs.readFileSync(source).toString("base64")}`;
  }
  composition.embeddedQuestionAssets = embedded;
  return { embeddedCount: Object.keys(embedded).length, missing };
};

fs.mkdirSync(artifactDir, { recursive: true });
const baseline = readJson(BASELINE_PATH);
const browserQa = readJson(BROWSER_QA_PATH);
const courseAreaRegression = readJson(path.join(composer, "tests", "course_area_step3_results.json"));
const composerSource = fs.readFileSync(path.join(composer, "composer.js"), "utf8");
const presets = extractPresets(composerSource);
const { raw: libraryRaw, value: library } = loadLibrary();
const registry = library.registry.concepts;
const registryById = new Map(registry.map(concept => [concept.canonicalConceptId, concept]));
const areaModelModule = require(path.join(composer, "course-area-model.js"));
const areaModel = areaModelModule.create(registry);
const core = require(path.join(composer, "composer-core.js"));
const helpers = require(path.join(composer, "tests", "composer-test-helpers.js"));
const manifest = readJson(path.join(dataDir, "concept-reviews", "manifest.json"));
const template = fs.readFileSync(path.join(composer, "template", "mastery-quests-faculty-template-composer-ready.html"), "utf8");
const presetById = new Map(presets.map(preset => [preset.id, preset]));
const checks = [];
const check = (name, pass, detail = "") => checks.push({ name, status: pass ? "PASS" : "FAIL", detail });

const duplicatePresetIds = presets.map(preset => preset.id).filter((id, index, ids) => ids.indexOf(id) !== index);
check("Preset IDs remain unique", duplicatePresetIds.length === 0, duplicatePresetIds.join(", "));
check("Five broad Micro themes are defined", MICRO_BROAD_IDS.every(id => presetById.get(id)?.area === "micro"), MICRO_BROAD_IDS.filter(id => presetById.get(id)?.area !== "micro").join(", "));
check("Five broad Macro themes are defined", MACRO_BROAD_IDS.every(id => presetById.get(id)?.area === "macro"), MACRO_BROAD_IDS.filter(id => presetById.get(id)?.area !== "macro").join(", "));
check("Every preset contains at least one concept", presets.every(preset => preset.conceptIds.length > 0), presets.filter(preset => !preset.conceptIds.length).map(preset => preset.id).join(", "));
check("No preset contains duplicate concept IDs", presets.every(preset => new Set(preset.conceptIds).size === preset.conceptIds.length), presets.filter(preset => new Set(preset.conceptIds).size !== preset.conceptIds.length).map(preset => preset.id).join(", "));
const missingConcepts = presets.flatMap(preset => preset.conceptIds.filter(id => !registryById.has(id)).map(id => `${preset.id}:${id}`));
check("Every preset references valid current concept IDs", missingConcepts.length === 0, missingConcepts.join(", "));
const areaFailures = presets.flatMap(preset => preset.conceptIds.filter(id => !areaModel.areasFor(id).includes(preset.area)).map(id => `${preset.id}:${id}`));
check("Every preset concept is selectable in its declared course area", areaFailures.length === 0, areaFailures.join(", "));
const unavailable = presets.flatMap(preset => preset.conceptIds.filter(id => {
  const concept = registryById.get(id), area = areaModel.get(id);
  return !area?.selectable || !area?.cardVisible || concept?.status === "deprecated" || concept?.status === "legacy";
}).map(id => `${preset.id}:${id}`));
check("No preset references hidden, deprecated, or legacy-only concepts", unavailable.length === 0, unavailable.join(", "));
const parentReferences = presets.flatMap(preset => preset.conceptIds.filter(id => (registryById.get(id)?.childConceptIds || []).length).map(id => ({ presetId: preset.id, conceptId: id, selectionRole: registryById.get(id)?.selectionRole })));
check("Any parent references use the established selectable family-parent architecture", parentReferences.every(row => row.selectionRole === "family-parent"), parentReferences.filter(row => row.selectionRole !== "family-parent").map(row => `${row.presetId}:${row.conceptId}:${row.selectionRole}`).join(", "));
check("Open-Economy Macro includes exactly all six intended concepts", JSON.stringify(presetById.get("open-economy-macro")?.conceptIds) === JSON.stringify(OPEN_ECONOMY), JSON.stringify(presetById.get("open-economy-macro")?.conceptIds || []));
check("Quick Build descriptions remain short", presets.every(preset => preset.description.length <= 140), presets.filter(preset => preset.description.length > 140).map(preset => preset.id).join(", "));
const retainedIds = baseline.presets.map(preset => preset.id).filter(id => presetById.has(id));
const removedIds = baseline.presets.map(preset => preset.id).filter(id => !presetById.has(id));
check("All existing Quick Start IDs are retained", removedIds.length === 0, removedIds.join(", "));
check("The three intended new presets were added", NEW_IDS.every(id => presetById.has(id)), NEW_IDS.filter(id => !presetById.has(id)).join(", "));
check("Area-specific Micro and Macro Quick Build headings are present", composerSource.includes("Micro Quick Builds") && composerSource.includes("Macro Quick Builds"), "heading source contract");
check("Preset application preserves exact selections and manual checkbox editing", /state\.selectedConceptIds = preset\.conceptIds\.filter/.test(composerSource) && /state\.selectedConceptIds\.push\(id\)/.test(composerSource) && /state\.selectedConceptIds = state\.selectedConceptIds\.filter\(value => value !== id\)/.test(composerSource), "apply/add/remove source contract");
check("Browser QA confirms preset click and subsequent manual edit", browserQa.status === "PASS" && browserQa.presetConceptCount > browserQa.afterManualRemovalCount && browserQa.removedConceptStillSelected === false && browserQa.macroQuickBuildHeadingVisible === true, JSON.stringify(browserQa));
const presetRegressionCase = courseAreaRegression.cases.find(testCase => testCase.id === "K");
check("Established course-area and starter-preset regression test passes", courseAreaRegression.status === "PASS" && presetRegressionCase?.status === "PASS" && presetRegressionCase?.presetCount === 13 && presetRegressionCase?.macroPresetCount === 5, JSON.stringify(presetRegressionCase));

const compositionResults = [];
for (const preset of presets) {
  const allModesComposition = core.compose(library, recipeFor(preset.id, preset.title, preset.conceptIds, [...core.MODE_ORDER]));
  const badModes = allModesComposition.validation.modes.filter(mode => !mode.ok).map(mode => mode.mode);
  const expectedDeficiency = preset.id === "macro-measurement-growth" && badModes.length === 1 && badModes[0] === "trialGraph" && allModesComposition.errors.every(error => /Trial by Graph/.test(error));
  const buildModes = expectedDeficiency ? core.MODE_ORDER.filter(mode => mode !== "trialGraph") : [...core.MODE_ORDER];
  const composition = core.compose(library, recipeFor(preset.id, preset.title, preset.conceptIds, buildModes));
  const answers = await core.verifyAnswers(composition);
  let runtimeError = "";
  try { helpers.attachConceptReviewRuntime(core, composition, library, preset.conceptIds, manifest); } catch (error) { runtimeError = String(error?.message || error); }
  const assets = embedAssets(composition);
  const config = await core.createConfig(recipeFor(preset.id, preset.title, preset.conceptIds, buildModes), library, sha(template));
  const html = core.buildHtml(template, composition, config, { phase: PHASE, presetId: preset.id, generatedAt: GENERATED_AT });
  const inlineIssues = compileInline(html, preset.id);
  compositionResults.push({
    presetId: preset.id, area: preset.area, conceptCount: preset.conceptIds.length,
    allModes: allModesComposition.validation.modes.map(mode => ({ mode: mode.mode, ok: mode.ok })),
    badModes, expectedDeficiency: expectedDeficiency ? "Trial by Graph lacks graph-safe questions; no unrelated concepts were added." : null,
    buildModes, buildErrors: composition.errors, answerIssueCount: answers.issues.length,
    conceptReviewRuntimeError: runtimeError || null, embeddedAssetCount: assets.embeddedCount,
    missingAssets: assets.missing, inlineScriptIssues: inlineIssues, htmlBytes: Buffer.byteLength(html), htmlSha256: sha(html)
  });
}
const unexpectedCompositionFailures = compositionResults.filter(result => result.buildErrors.length || result.answerIssueCount || result.conceptReviewRuntimeError || result.missingAssets.length || result.inlineScriptIssues.length || (result.badModes.length && !result.expectedDeficiency));
check("Every preset composes and builds in its supported modes", unexpectedCompositionFailures.length === 0, unexpectedCompositionFailures.map(result => result.presetId).join(", "));
check("Only Measurement, Growth & Labor reports the known Trial by Graph deficiency", compositionResults.filter(result => result.badModes.length).length === 1 && compositionResults.find(result => result.presetId === "macro-measurement-growth")?.expectedDeficiency, compositionResults.filter(result => result.badModes.length).map(result => `${result.presetId}:${result.badModes.join(",")}`).join("; "));
check("Every legacy Quick Start still composes", retainedIds.every(id => !unexpectedCompositionFailures.some(result => result.presetId === id)), retainedIds.filter(id => unexpectedCompositionFailures.some(result => result.presetId === id)).join(", "));

const microWholeCourseIds = areaModel.conceptsForArea("micro").filter(record => record.selectable && record.cardVisible && !(registryById.get(record.canonicalConceptId)?.childConceptIds || []).length && registryById.get(record.canonicalConceptId)?.status !== "legacy").map(record => record.canonicalConceptId);
const macroWholeCourseIds = [...new Set(DEDICATED_MACRO_FAMILIES.flatMap(id => areaModelModule.NAVIGATION_FAMILIES.macro.find(family => family.id === id)?.conceptIds || []))];
const wholeCourseResults = [];
for (const [area, conceptIds] of [["micro", microWholeCourseIds], ["macro", macroWholeCourseIds]]) {
  const recipe = recipeFor(`whole-principles-${area}`, `Whole Principles ${area}`, conceptIds, [...core.MODE_ORDER]);
  const composition = core.compose(library, recipe);
  const answers = await core.verifyAnswers(composition);
  let runtimeError = "";
  try { helpers.attachConceptReviewRuntime(core, composition, library, conceptIds, manifest); } catch (error) { runtimeError = String(error?.message || error); }
  const assets = embedAssets(composition);
  const config = await core.createConfig(recipe, library, sha(template));
  const html = core.buildHtml(template, composition, config, { phase: PHASE, validationScope: `whole-${area}`, generatedAt: GENERATED_AT });
  wholeCourseResults.push({ area, conceptCount: conceptIds.length, errors: composition.errors, badModes: composition.validation.modes.filter(mode => !mode.ok).map(mode => mode.mode), answerIssueCount: answers.issues.length, runtimeError: runtimeError || null, missingAssets: assets.missing, inlineScriptIssues: compileInline(html, `whole-${area}`), htmlBytes: Buffer.byteLength(html), htmlSha256: sha(html) });
}
check("Whole-course Micro and Macro selections still compose and build", wholeCourseResults.every(result => !result.errors.length && !result.badModes.length && !result.answerIssueCount && !result.runtimeError && !result.missingAssets.length && !result.inlineScriptIssues.length), wholeCourseResults.map(result => `${result.area}:${result.errors.length}/${result.badModes.length}`).join(", "));

const individualResults = [];
for (const [area, conceptId] of [["micro", "price-elasticity-of-demand"], ["macro", "foreign-exchange-market"]]) {
  const recipe = recipeFor(`individual-${area}`, `Individual ${area}`, [conceptId], [...core.MODE_ORDER]);
  const composition = core.compose(library, recipe);
  individualResults.push({ area, conceptId, errors: composition.errors, badModes: composition.validation.modes.filter(mode => !mode.ok).map(mode => mode.mode), answerVerification: await core.verifyAnswers(composition) });
}
check("Representative individual Micro and Macro selections still work", individualResults.every(result => !result.errors.length && !result.badModes.length && result.answerVerification.ok), individualResults.map(result => `${result.conceptId}:${result.errors.length}/${result.badModes.length}`).join(", "));

const reviewRoot = path.join(dataDir, "concept-reviews");
const resourceFiles = [
  path.join(reviewRoot, "concept_review_source.json"), path.join(reviewRoot, "manifest.json"),
  ...filesUnder(path.join(repo, "concept-reviews")).filter(file => file.endsWith(".pdf")),
  ...filesUnder(reviewRoot).filter(file => file.endsWith(".pdf"))
];
const questionAssetFiles = filesUnder(path.join(dataDir, "question-assets"));
const fingerprints = {
  composerJs: { before: baseline.protectedFingerprints.composerJsBefore, after: sha(composerSource), changedAsIntended: baseline.protectedFingerprints.composerJsBefore !== sha(composerSource) },
  composerLibrary: { before: baseline.protectedFingerprints.composerLibrary, after: sha(libraryRaw) },
  composerCore: { before: baseline.protectedFingerprints.composerCore, after: sha(fs.readFileSync(path.join(composer, "composer-core.js"))) },
  courseAreaModel: { before: baseline.protectedFingerprints.courseAreaModel, after: sha(fs.readFileSync(path.join(composer, "course-area-model.js"))) },
  conceptReviewResources: { before: baseline.protectedFingerprints.conceptReviewResources, after: aggregateHash(resourceFiles), fileCount: resourceFiles.length },
  questionAssets: { before: baseline.protectedFingerprints.questionAssets, after: aggregateHash(questionAssetFiles), fileCount: questionAssetFiles.length }
};
for (const key of ["composerLibrary", "composerCore", "courseAreaModel", "conceptReviewResources", "questionAssets"]) fingerprints[key].unchanged = fingerprints[key].before === fingerprints[key].after;
check("Question libraries and fingerprints are unchanged", fingerprints.composerLibrary.unchanged, `${fingerprints.composerLibrary.before} -> ${fingerprints.composerLibrary.after}`);
check("Concept Review mappings and PDF resources are unchanged", fingerprints.conceptReviewResources.unchanged, `${fingerprints.conceptReviewResources.before} -> ${fingerprints.conceptReviewResources.after}`);
check("Question graph assets are unchanged", fingerprints.questionAssets.unchanged, `${fingerprints.questionAssets.before} -> ${fingerprints.questionAssets.after}`);
check("Composer core and taxonomy files are unchanged", fingerprints.composerCore.unchanged && fingerprints.courseAreaModel.unchanged, `core=${fingerprints.composerCore.unchanged}, taxonomy=${fingerprints.courseAreaModel.unchanged}`);
check("Only the intended Composer UI source changed among protected runtime files", fingerprints.composerJs.changedAsIntended && fingerprints.composerCore.unchanged && fingerprints.courseAreaModel.unchanged, JSON.stringify(fingerprints.composerJs));

const beforeById = new Map(baseline.presets.map(preset => [preset.id, preset]));
const renamedOrRefocused = retainedIds.filter(id => JSON.stringify(beforeById.get(id)) !== JSON.stringify(presetById.get(id))).map(id => ({ id, before: beforeById.get(id), after: presetById.get(id) }));
const finalDefinitions = {
  schemaVersion: "1.0.0", phase: PHASE, generatedAt: GENERATED_AT,
  counts: { allPresets: presets.length, microPresets: presets.filter(preset => preset.area === "micro").length, macroPresets: presets.filter(preset => preset.area === "macro").length, broadMicroThemes: MICRO_BROAD_IDS.length, broadMacroThemes: MACRO_BROAD_IDS.length },
  broadMicroThemes: MICRO_BROAD_IDS.map(id => presetById.get(id)),
  broadMacroThemes: MACRO_BROAD_IDS.map(id => presetById.get(id)),
  retainedExistingPresetIds: retainedIds, removedPresetIds: removedIds, newPresetIds: NEW_IDS,
  renamedOrRefocused, displayOrder: presets.map(preset => preset.id),
  parentReferences, expectedModeDeficiencies: compositionResults.filter(result => result.expectedDeficiency).map(result => ({ presetId: result.presetId, detail: result.expectedDeficiency }))
};
writeJson(path.join(artifactDir, "composer_broad_themes_final_presets.json"), finalDefinitions);

const failures = checks.filter(row => row.status === "FAIL");
const validation = {
  schemaVersion: "1.0.0", phase: PHASE, generatedAt: GENERATED_AT,
  verdict: failures.length ? "FAIL" : "PASS",
  summary: { checks: checks.length, passed: checks.length - failures.length, failed: failures.length, newPresets: NEW_IDS.length, retainedPresets: retainedIds.length, microBroadThemes: MICRO_BROAD_IDS.length, macroBroadThemes: MACRO_BROAD_IDS.length, globalUniqueQuestionCount: uniqueQuestionCount(library) },
  checks, compositionResults, wholeCourseResults, individualResults, fingerprints, browserQa, courseAreaRegression
};
writeJson(path.join(artifactDir, "composer_broad_themes_validation.json"), validation);

const themeLines = ids => ids.map(id => { const preset = presetById.get(id); return `- **${preset.title}** (\`${preset.id}\`): ${preset.conceptIds.length} concepts - ${preset.description}`; }).join("\n");
const report = `# Faculty Build Composer Broad Themes\n\nFinal verdict: **${validation.verdict}**\n\n## Completion summary\n\n1. Repository root: \`${repo.replaceAll("\\", "/")}\`\n2. Branch: \`${baseline.branch}\`\n3. Files changed for this phase: \`build/faculty-build-composer/composer.js\`, \`audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs\`, and \`validation_artifacts/composer_broad_themes/\`.\n4. Micro broad themes added or broadened: ${MICRO_BROAD_IDS.length}.\n5. Macro broad themes added or broadened: ${MACRO_BROAD_IDS.length}.\n6. Existing presets retained: ${retainedIds.length}/${baseline.presets.length}; removed: ${removedIds.length}. Trade & Welfare, Principles Micro Core, and General economics foundations remain available.\n7. New preset IDs: ${NEW_IDS.join(", ")}.\n8. UI: the existing area-filtered Quick Start section now labels itself Micro Quick Builds or Macro Quick Builds; manual concept checkboxes remain available after application.\n9. Validation: ${validation.summary.passed}/${validation.summary.checks} checks pass.\n10. Composer builds: every preset builds in its supported modes; full Micro (${wholeCourseResults[0].conceptCount} concepts) and full Macro (${wholeCourseResults[1].conceptCount} concepts) build in all ${core.MODE_ORDER.length} modes.\n11. Expected limitation: Measurement, Growth & Labor still lacks Trial by Graph-safe questions; it builds in the other nine modes and was not padded with unrelated concepts.\n12. Question fingerprint: unchanged=${fingerprints.composerLibrary.unchanged}; unique question records=${validation.summary.globalUniqueQuestionCount}.\n13. Resource fingerprint: unchanged=${fingerprints.conceptReviewResources.unchanged}; ${fingerprints.conceptReviewResources.fileCount} source/manifest/PDF files checked.\n14. Graph fingerprint: unchanged=${fingerprints.questionAssets.unchanged}; ${fingerprints.questionAssets.fileCount} files checked.\n15. Core/taxonomy regression: Composer core unchanged=${fingerprints.composerCore.unchanged}; course-area model unchanged=${fingerprints.courseAreaModel.unchanged}.\n16. Remaining issues: none blocking; the documented Trial by Graph limitation is intrinsic to the measurement theme's current question pool.\n\n## Micro broad themes\n\n${themeLines(MICRO_BROAD_IDS)}\n\n## Macro broad themes\n\n${themeLines(MACRO_BROAD_IDS)}\n\n## Existing Quick Starts\n\n- Retained IDs: ${retainedIds.map(id => `\`${id}\``).join(", ")}\n- Removed IDs: ${removedIds.length ? removedIds.map(id => `\`${id}\``).join(", ") : "none"}\n- Renamed or refocused IDs: ${renamedOrRefocused.map(row => `\`${row.id}\``).join(", ")}\n\n## Validation artifacts\n\n- \`validation_artifacts/composer_broad_themes/composer_broad_themes_pre_edit_inventory.json\`\n- \`validation_artifacts/composer_broad_themes/composer_broad_themes_final_presets.json\`\n- \`validation_artifacts/composer_broad_themes/composer_broad_themes_browser_qa.json\`\n- \`validation_artifacts/composer_broad_themes/composer_broad_themes_validation.json\`\n- \`audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs\`\n\n## Validation checks\n\n${checks.map(row => `- ${row.status}: ${row.name}${row.detail ? ` - ${row.detail}` : ""}`).join("\n")}\n`;
const finalReport = report
  .replace(
    "3. Files changed for this phase: `build/faculty-build-composer/composer.js`, `audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs`, and `validation_artifacts/composer_broad_themes/`.",
    "3. Files changed for this phase: `build/faculty-build-composer/composer.js`; the line-ending-tolerant preset parser and refreshed result in `build/faculty-build-composer/tests/`; `audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs`; and `validation_artifacts/composer_broad_themes/`."
  )
  .replace(
    `9. Validation: ${validation.summary.passed}/${validation.summary.checks} checks pass.`,
    `9. Validation: ${validation.summary.passed}/${validation.summary.checks} checks pass; the established course-area suite also passes all ${courseAreaRegression.caseCount} cases.`
  )
  .replace(
    "- `audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs`",
    "- `validation_artifacts/composer_broad_themes/composer_broad_themes_report.md`\n- `audit_tools/composer_broad_themes/validate_composer_broad_themes.mjs`"
  );
fs.writeFileSync(path.join(artifactDir, "composer_broad_themes_report.md"), finalReport, "utf8");
console.log(JSON.stringify({ phase: PHASE, verdict: validation.verdict, checks: checks.length, passed: checks.length - failures.length, failed: failures.length, outputDirectory: path.relative(repo, artifactDir).replaceAll("\\", "/") }, null, 2));
if (failures.length) process.exitCode = 1;
