import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  ID_FIRST,
  ID_LAST,
  PARENT_CONCEPT_ID,
  CONCEPT_ID,
  TAXONOMY_CONCEPTS,
  LEGACY_SUBTOPIC_ASSIGNMENTS,
  GRAPH_ASSETS,
  ordinaryQuestions
} from "../authoring/externalities_question_pool_author.mjs";

const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const composerRoot = path.resolve(testRoot, "..");
const repoRoot = path.resolve(composerRoot, "..", "..");
const parent = PARENT_CONCEPT_ID;
const children = Object.keys(TAXONOMY_CONCEPTS);
const phaseIds = new Set(ordinaryQuestions.map(question => String(question.id)));

const BASELINE = Object.freeze({
  answerKeyDigest: "ec84cde5b7693a194e3985002fb7020b1b8ac0ff7e2c5fd271c31fe4a78d5542",
  idDigest: "95422debb8947db42b154f95fbc7a82273c858ed82014e4b042c25557183fb4f",
  skillDigest: "7b836eff0fa9cb7f0f2e6872959a2f204a3e528172a6a969214047892a5423b1",
  graphDigest: "72c64ec96d5176d307d5c86f2ec2dbe39d0ff240459a0a76f405c004cdd563bb",
  repairedStemDigest: "95b086aaf8b57f71bdf516cdb0fbe20f71b6c5f098dd64350c1f35f46932d434",
  repairedFeedbackDigest: "906651cb1b02b5f34246d1903811586167ef8e6f76023f9bfd24977d1a1f78bd"
});

const ASSET_HASHES = Object.freeze({
  "EXTERNALITY-A-01.webp": "3bf8a3370d25d963013eeb77c52062c00c28d55e45c05cdc8ba320235a170f6a",
  "EXTERNALITY-A-02.webp": "cb78aac33fd7434f0f9e1fb99f187dfb30451a62f15a46d53e73e2208dc7fae8",
  "EXTERNALITY-A-03.webp": "7371c64609bbf73eb251399d97d8bb523758083edeabc1cbf1cf5522e39aa158",
  "EXTERNALITY-A-04.webp": "4c5a75e587ea4bb99fbc952df5c3545035acec148bf4b73be108f5e718a75474",
  "EXTERNALITY-B-01.webp": "080e46bbcd0e26fa0e1f94e85bf8319a2afd1bafe95ec6832e6b86bdbae65aeb",
  "EXTERNALITY-B-02.webp": "2b3898bd5ad7b99585971f6b574f8e588df432e3a7183734aaa1a11d566fca53",
  "EXTERNALITY-B-03.webp": "60a9278c4de61e0a8823ce617c5dbb9e21eb08dc163e5c37ecc28bd1ea62d4a0",
  "EXTERNALITY-B-04.webp": "3506c993b06cc6966a487e31367582eaef0707b70d959dae771394cc441adac4",
  "EXTERNALITY-C-01.webp": "721dd203d052f67ec2a2114cdfc712c6c96b616833f648076b88c27db23f7cd6",
  "EXTERNALITY-C-02.webp": "56a7cfe718e6d03a498b98e3081b8ba79b97bc0287476b2ccca23e903a52a965",
  "EXTERNALITY-C-03.webp": "ade6e10af993fdc1d60d710b9cc4ae5b731614d2db842cdc458db2f886efba94",
  "EXTERNALITY-C-04.webp": "5bce7ff8b406b0f46451e5e2f9fdfb31ef8c610c16e114a07b9cb32dd2c955b1",
  "EXTERNALITY-D-02.webp": "f6891f406f2f05535888f590d531eca47903c7923c4c5750ba1336a181a77cb7"
});

function normalize(value) {
  return String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function digest(value) {
  return sha256(JSON.stringify(value));
}

function conceptEntries(concept) {
  const entries = [];
  for (const [pool, questions] of Object.entries(concept.questions || {})) {
    for (const question of questions || []) entries.push({ pool, question });
  }
  for (const key of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
    for (const question of concept[key] || []) entries.push({ pool: key, question });
  }
  return entries;
}

function selectedEntries(library, conceptId) {
  return conceptEntries(library.concepts[parent]).filter(({ question }) => (question.subtopicIds || []).includes(conceptId));
}

function recipe(conceptId, mode = "unlimited") {
  return {
    schemaVersion: core.RECIPE_SCHEMA_VERSION,
    title: TAXONOMY_CONCEPTS[conceptId].title,
    slug: `${conceptId}-copy-taxonomy-validation`,
    supportedModes: [mode],
    selectedConceptIds: [conceptId],
    checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
  };
}

function embedAssets(composition) {
  const embedded = {};
  for (const asset of composition.assets || []) {
    const bytes = fs.readFileSync(path.join(composerRoot, "data", asset.runtimePath));
    embedded[asset.runtimePath] = `data:image/webp;base64,${bytes.toString("base64")}`;
  }
  composition.embeddedQuestionAssets = embedded;
}

function quickStartConceptIds() {
  const source = fs.readFileSync(path.join(composerRoot, "composer.js"), "utf8");
  const match = source.match(/const PRESETS = (\[[\s\S]*?\]);\s*\n\s*const state/);
  if (!match) throw new Error("Could not parse Composer quick starts.");
  const presets = vm.runInNewContext(match[1], Object.create(null));
  return presets.flatMap(preset => preset.conceptIds || []);
}

async function run() {
  const issues = [];
  const pass = (condition, message) => { if (!condition) issues.push(message); };
  const library = helpers.loadComposerLibrary();
  const manifest = JSON.parse(fs.readFileSync(path.join(composerRoot, "data", "composer_library_manifest.json"), "utf8"));
  const reviews = JSON.parse(fs.readFileSync(path.join(composerRoot, "data", "concept-reviews", "manifest.json"), "utf8"));
  const parentEntries = conceptEntries(library.concepts[parent]);
  const phasePublished = parentEntries.filter(({ question }) => phaseIds.has(String(question.id)));

  pass(core.COMPOSER_VERSION === "4.5s.3g", `Composer version ${core.COMPOSER_VERSION}`);
  pass(core.RECIPE_SCHEMA_VERSION === "1.4.0", `Recipe schema ${core.RECIPE_SCHEMA_VERSION}`);
  pass(library.canonicalQuestionCount === 8371 && manifest.canonicalQuestionCount === 8371, "Canonical question count changed");
  pass(library.conceptCount === 129 && library.registry.concepts.length === 129, "Concept count mismatch");
  pass(ordinaryQuestions.length === 160 && phasePublished.length === 160, "The 160-question pool is not intact");
  pass(ordinaryQuestions.filter(question => question.graphRequired).length === 104, "Graph-question count changed");
  pass(ordinaryQuestions[0].id === ID_FIRST && ordinaryQuestions.at(-1).id === ID_LAST, "ID range changed");
  pass(digest(ordinaryQuestions.map(question => question.id)) === BASELINE.idDigest, "Question IDs changed");
  pass(digest(ordinaryQuestions.map(question => [question.id, normalize(question.answer)])) === BASELINE.answerKeyDigest, "Answer keys changed");
  pass(digest(ordinaryQuestions.map(question => [question.id, question.primarySkill])) === BASELINE.skillDigest, "Primary-skill allocation changed");
  pass(digest(ordinaryQuestions.map(question => [question.id, question.asset])) === BASELINE.graphDigest, "Graph allocation changed");
  pass(digest(ordinaryQuestions.map(question => [question.id, question.q])) === BASELINE.repairedStemDigest, "Repaired stems are stale");
  pass(digest(ordinaryQuestions.map(question => [question.id, question.feedback])) === BASELINE.repairedFeedbackDigest, "Repaired feedback is stale");

  const forbidden = /\b(?:read the quantity|read the price|the dot shows|graph gives|target matches|value shown)\b/i;
  pass(ordinaryQuestions.every(question => !forbidden.test(question.q) && !forbidden.test(question.feedback)), "Mechanical copy phrase remains");
  pass(ordinaryQuestions.every(question => !/\bcorrective\s+corrective\b/i.test(question.feedback)), "Duplicated corrective wording remains");
  pass(ordinaryQuestions.every(question => question.feedback.split(/\s+/).length >= 10), "Underexplained feedback remains");
  const graphCalculations = ordinaryQuestions.filter(question => question.graphRequired && question.type === "graph_calculation");
  pass(graphCalculations.every(question => /MPC|MPB|MSC|MSB|marginal|quantity|deadweight|tax|subsidy|policy/i.test(question.feedback)), "Graph-calculation feedback lacks economic logic");

  const phaseSubtopics = new Set(phasePublished.flatMap(({ question }) => question.subtopicIds || []));
  pass(phaseSubtopics.size === 1 && phaseSubtopics.has(CONCEPT_ID), "A production externalities question remains only in the broad parent");
  const assigned = Object.fromEntries(children.map(id => [id, selectedEntries(library, id)]));
  pass(assigned.externalities.length === 177, `Externalities assignment ${assigned.externalities.length}`);
  pass(assigned["public-goods-and-common-resources"].length === 16, `Public-goods assignment ${assigned["public-goods-and-common-resources"].length}`);
  pass(assigned["market-power"].length === 9, `Market-power assignment ${assigned["market-power"].length}`);
  const assignedIds = Object.values(assigned).flat().map(({ question }) => String(question.id));
  pass(new Set(assignedIds).size === assignedIds.length, "A question is assigned to multiple new concepts");
  pass(parentEntries.filter(({ question }) => !(question.subtopicIds || []).some(id => children.includes(id))).length === 25, "Residual compatibility count changed");

  for (const conceptId of children) {
    const module = library.concepts[conceptId];
    const registry = library.registry.concepts.find(item => item.canonicalConceptId === conceptId);
    pass(module?.derivedFromConceptId === parent && registry?.status === "active", `Missing selectable concept ${conceptId}`);
    pass(assigned[conceptId].every(({ question }) => question.subtopicIds.length === 1 && question.subtopicIds[0] === conceptId), `Mixed taxonomy in ${conceptId}`);
  }
  const parentRegistry = library.registry.concepts.find(item => item.canonicalConceptId === parent);
  pass(parentRegistry?.status === "legacy" && parentRegistry?.selectionRole === "legacy-parent", "Broad Market Failures remains selectable");
  pass(children.every(conceptId => {
    const registry = library.registry.concepts.find(item => item.canonicalConceptId === conceptId);
    return (registry?.relatedConceptIds || []).every(id => Boolean(library.concepts[id]));
  }), "A new taxonomy record references a missing related concept");
  pass(parentEntries.every(({ question }) => [question.primaryConceptId, ...(question.secondaryConceptIds || []), ...(question.subtopicIds || [])]
    .filter(Boolean).every(id => Boolean(library.concepts[id]))), "A Market Failures question references a missing concept");

  const quickIds = quickStartConceptIds();
  pass(quickIds.every(id => Boolean(library.concepts[id])), "Quick start references an invalid concept");
  pass(!quickIds.includes(parent), "Quick start still selects broad Market Failures");
  const legacyRecipe = JSON.parse(fs.readFileSync(path.join(testRoot, "recipes", "market-foundations.json"), "utf8"));
  const migrated = core.migrateRecipe(legacyRecipe, library);
  pass(children.every(id => migrated.recipe.selectedConceptIds.includes(id)) && migrated.recipe.selectedConceptIds.includes(parent), "Legacy recipe taxonomy migration failed");
  const legacyComposition = core.compose(library, legacyRecipe);
  pass(legacyComposition.errors.length === 0 && legacyComposition.validation.modes.every(mode => mode.ok), "Legacy portable recipe no longer composes");

  const reviewConcepts = new Map(reviews.concepts.map(item => [item.canonicalConceptId, item]));
  pass(children.every(id => reviewConcepts.get(id)?.diagnosable === true), "New concept lacks Mastery Report mapping");
  pass(reviewConcepts.get(parent)?.diagnosable === false, "Legacy parent remains a diagnostic signal");

  const builds = {};
  for (const conceptId of children) {
    const mode = conceptId === "public-goods-and-common-resources" ? "fadingFortune" : "unlimited";
    const composition = core.compose(library, recipe(conceptId, mode));
    const expectedThinErrors = conceptId === "market-power";
    if (conceptId === CONCEPT_ID) pass(composition.errors.length === 0, `Externalities composition: ${composition.errors.join(" | ")}`);
    if (conceptId === "public-goods-and-common-resources") pass(composition.validation.modes.every(item => item.ok), "Public-goods focused mode failed");
    if (expectedThinErrors) pass(composition.errors.every(error => /needs \d+, found \d+/.test(error)), "Unexpected Market Power composition error");
    pass((await core.verifyAnswers(composition)).ok, `Answer verification failed for ${conceptId}`);
    pass([...Object.values(composition.banks).flat(), ...composition.repairQuestions, ...composition.bridgeQuestions].every(question => question.primaryConceptId === conceptId), `Generated ${conceptId} quest contains another topic`);
    helpers.attachConceptReviewRuntime(core, composition, library, [conceptId]);
    pass(composition.conceptReviewRuntimeIndex.diagnosticConceptIds.includes(conceptId), `Mastery signal missing for ${conceptId}`);
    embedAssets(composition);
    const template = helpers.loadCanonicalTemplate();
    const config = await core.createConfig(recipe(conceptId, mode), library, await core.sha256Hex(template));
    const metadata = helpers.createMetadata(core, composition, config, library, { phase: "externalities-copy-taxonomy-repair" });
    const html = core.buildHtml(template, composition, config, metadata);
    helpers.assertInlineScriptsCompile(html, `${conceptId}-copy-taxonomy-validation.html`);
    builds[conceptId] = helpers.writeTestArtifact(`tests/${conceptId}-copy-taxonomy-validation.html`, html);
  }
  pass(fs.readFileSync(builds.externalities, "utf8").includes("openGraphLightbox"), "Externalities graph enlargement runtime missing");

  const phaseAssets = library.assetInventory.filter(asset => asset.sourceCurationPhase === "phase-externalities-question-pool-v1");
  pass(phaseAssets.length === 13 && Object.keys(GRAPH_ASSETS).length === 13, "Externalities asset count changed");
  for (const asset of phaseAssets) {
    const bytes = fs.readFileSync(path.join(composerRoot, "data", asset.runtimePath));
    pass(asset.sha256 === ASSET_HASHES[asset.filename] && sha256(bytes) === ASSET_HASHES[asset.filename], `Asset changed: ${asset.filename}`);
    pass(asset.sizeBytes === bytes.length && asset.width === 1720 && asset.height === 1200, `Asset metadata changed: ${asset.filename}`);
  }
  for (const { question } of phasePublished) {
    pass(!["answer", "correctAnswer", "correctIndex", "a"].some(field => Object.hasOwn(question, field)), `Answer leakage ${question.id}`);
  }

  const result = {
    phase: "externalities-copy-taxonomy-repair",
    ok: issues.length === 0,
    composerVersion: core.COMPOSER_VERSION,
    recipeSchemaVersion: core.RECIPE_SCHEMA_VERSION,
    canonicalQuestionCount: library.canonicalQuestionCount,
    productionQuestions: ordinaryQuestions.length,
    graphQuestions: ordinaryQuestions.filter(question => question.graphRequired).length,
    stemsRevised: 104,
    feedbackFieldsRevised: 160,
    assignments: Object.fromEntries(children.map(id => [id, assigned[id].length])),
    residualCompatibilityRecords: 25,
    legacyRecipeModes: legacyComposition.validation.modes.map(mode => ({ mode: mode.mode, ok: mode.ok })),
    thinConceptConstraint: {
      conceptId: "market-power",
      ordinaryQuestions: 8,
      reason: "The existing pool is below every standalone mode floor; no expansion or engine exception was added."
    },
    builds,
    assets: phaseAssets.length,
    issues
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

run().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
