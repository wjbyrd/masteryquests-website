import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  PHASE,
  SOURCE_VERSION,
  ID_FIRST,
  ID_LAST,
  PARENT_CONCEPT_ID,
  CONCEPT_ID,
  OBJECTIVES,
  SUBTOPICS,
  GRAPH_ASSETS,
  productionQuestions
} from "../authoring/public_goods_common_resources_question_pool_author.mjs";

const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const composerRoot = path.resolve(testRoot, "..");
const repoRoot = path.resolve(composerRoot, "..", "..");
const manifestPath = path.join(composerRoot, "data", "composer_library_manifest.json");
const publisherPath = path.join(repoRoot, "audit_tools", "publish_federal_budgets_debt_question_pool.mjs");
const phaseIds = new Set(productionQuestions.map(question => String(question.id)));
const humanReadCuration = JSON.parse(fs.readFileSync(path.join(repoRoot, "validation_artifacts", "question_quality", "question_rewrite_master_execution_ledger.json"), "utf8"));
const humanReadExpectedById = new Map(humanReadCuration.entries.map(change => [String(change.questionId), change]));

const EXPECTED = Object.freeze({
  objectives: { "PGCR.1": 18, "PGCR.2": 26, "PGCR.3": 14, "PGCR.4": 14, "PGCR.5": 22, "PGCR.6": 16, "PGCR.7": 14, "PGCR.8": 20, "PGCR.9": 16 },
  difficulty: { easy: 44, medium: 60, hard: 32, elite: 12, legendary: 12 },
  ordinaryDifficulty: { easy: 44, medium: 52, hard: 32, elite: 12, legendary: 12 },
  pools: { easy: 40, medium: 48, hard: 28, elite: 12, legendary: 8, easyBoss: 4, mediumBoss: 4, finalBoss: 4, legendaryBoss: 4, repairQuestions: 4, bridgeQuestions: 4 },
  types: { graph_interpretation: 11, graph_calculation: 18, graph_integration: 9, graph_trap: 5, application: 68, bridge: 4, calculation: 1, definition: 4, integration: 14, interpretation: 26 },
  subtopics: {
    "excludability-and-rivalry": 46,
    "four-way-goods-classification": 26,
    "public-goods-and-free-riding": 22,
    "private-provision-and-profitability": 16,
    "public-good-cost-benefit-analysis": 14,
    "common-resources-and-tragedy-of-the-commons": 20,
    "property-rights-and-resource-use-incentives": 16
  },
  assets: { "PUBLIC-01.webp": 9, "PUBLIC-02.webp": 10, "PUBLIC-03.webp": 8, "PUBLIC-04.webp": 8, "PUBLIC-05.webp": 8 },
  assetBytes: { "PUBLIC-01.webp": 56404, "PUBLIC-02.webp": 76154, "PUBLIC-03.webp": 64242, "PUBLIC-04.webp": 78610, "PUBLIC-05.webp": 73882 },
  assetHashes: {
    "PUBLIC-01.webp": "fb2bc35d6456da6b40bef235909b878467f3172ea5daf1a1a129a1fc3cc399ab",
    "PUBLIC-02.webp": "5e046ff8d1d2833ba1c45bf56733b40f6698a89a8afa6abfd011e56ed0eb0eac",
    "PUBLIC-03.webp": "35ce117935f176216b19c83d18f3b7822245273ba1b90f5981574d55f379e25c",
    "PUBLIC-04.webp": "ade235c1c2ec006e997f95cbaa3e6139ab5be69bb36c029703812eed030f0dfc",
    "PUBLIC-05.webp": "b575b8870460310b96368bef71e4bbcd0ea44a73819fb72f2e7f16a2ae480b6d"
  }
});

const SOURCE_DIGESTS = Object.freeze({
  ids: "46eec2f830f19981f22e7ab916581c5f41c1e48ea2ef02600781da8626b0db67",
  answers: "924c32cd0762810413ff4ff7a132724d64d0b284047fa0c92a2755c4695e99c8",
  skills: "962b5bf7c5d2ef9c711beda8304067be7ad5652a67d4c8418b33d8b6e601ec5d",
  graphs: "5b4dfeeb302dac78ad63b4255b4b63038414361307ce6e43a2fb07280df66a70",
  objectives: "ea76a763ddb0d67e1038c55d910619afe2615d2105d84d8f8f71e1a7d808154a",
  difficulty: "0f419b4faee99189b928dc4d496236f33ebe44fb23726ca8647fdce0d5751921",
  pools: "227d2d43a6338c6e26e03f1364f72487c50fb634eaf5775416dfe68fa944a833",
  stems: "ff5130792c71e6c8c6c6598f5ad8fb1acc807612e9ea22845fa5d16a6370c95e"
});

const LEGACY_DIGESTS = Object.freeze({
  externalities: "3dec0c41b8e5e5e47c5a686e43621864ab1d1e1bca68cb15834fbfc71323d43e",
  "public-goods-and-common-resources": "fc9e6b9e42e7b54ce70d478257bc2862a8e552a2ced185dbe2a0649f545b8467",
  "market-power": "b3774f61955beaf291f5776db28d7353b8fc537a0654a3d1b73b23d37d2195a5"
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

function distribution(records, field) {
  const counts = {};
  for (const record of records) {
    const key = record[field];
    if (key == null) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function sameCounts(actual, expected) {
  return Object.keys({ ...actual, ...expected }).every(key => (actual[key] || 0) === (expected[key] || 0));
}

function conceptEntries(concept) {
  const entries = [];
  for (const [pool, questions] of Object.entries(concept.questions || {})) {
    for (const question of questions || []) entries.push({ pool, question });
  }
  for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
    for (const question of concept[pool] || []) entries.push({ pool, question });
  }
  return entries;
}

function childEntries(library, conceptId, includePhase = true) {
  return conceptEntries(library.concepts[PARENT_CONCEPT_ID])
    .filter(({ question }) => (question.subtopicIds || []).includes(conceptId))
    .filter(({ question }) => includePhase || question.sourceCurationPhase !== PHASE)
    .sort((left, right) => String(left.question.id).localeCompare(String(right.question.id)) || left.pool.localeCompare(right.pool));
}

function tokens(value) {
  return new Set(normalize(value).replace(/[^a-z0-9$%]+/g, " ").split(" ").filter(token => token.length > 2));
}

function jaccard(leftValue, rightValue) {
  const left = tokens(leftValue);
  const right = tokens(rightValue);
  const union = new Set([...left, ...right]);
  return union.size ? [...left].filter(token => right.has(token)).length / union.size : 0;
}

function embedQuestionAssets(composition) {
  const embedded = {};
  for (const asset of composition.assets || []) {
    const bytes = fs.readFileSync(path.join(composerRoot, "data", asset.runtimePath));
    if (sha256(bytes) !== asset.sha256) throw new Error(`Asset hash mismatch: ${asset.runtimePath}`);
    embedded[asset.runtimePath] = `data:image/webp;base64,${bytes.toString("base64")}`;
  }
  composition.embeddedQuestionAssets = embedded;
}

function quickStartConceptIds() {
  const source = fs.readFileSync(path.join(composerRoot, "composer.js"), "utf8");
  const match = source.match(/const PRESETS = (\[[\s\S]*?\]);\s*\n\s*const state/);
  if (!match) throw new Error("Could not parse Composer quick starts.");
  return Function(`"use strict"; return (${match[1]});`)().flatMap(preset => preset.conceptIds || []);
}

async function run() {
  const issues = [];
  const pass = (condition, message) => { if (!condition) issues.push(message); };
  const library = helpers.loadComposerLibrary();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const parentEntries = conceptEntries(library.concepts[PARENT_CONCEPT_ID]);
  const published = parentEntries.filter(({ question }) => phaseIds.has(String(question.id)));
  const authoredGraph = productionQuestions.filter(question => question.graphRequired);
  const authoredNonGraph = productionQuestions.filter(question => !question.graphRequired);
  const authoredOrdinary = productionQuestions.filter(question => !["repairQuestions", "bridgeQuestions"].includes(question.pool));

  pass(core.COMPOSER_VERSION === "4.5s.3k", `Composer version ${core.COMPOSER_VERSION}`);
  pass(core.RECIPE_SCHEMA_VERSION === "1.4.0", `Recipe schema ${core.RECIPE_SCHEMA_VERSION}`);
  pass(library.composerVersion === "4.5s.3k", `Library version ${library.composerVersion}`);
  pass(library.canonicalQuestionCount === 9539 && manifest.canonicalQuestionCount === 9539, "Canonical count mismatch");
  pass(library.conceptCount === 135 && library.registry.concepts.length === 135, "Concept count mismatch");
  pass(library.assetInventory.length === 494 && manifest.assetCount === 494, "Asset inventory count mismatch");
  pass(productionQuestions.length === 160 && published.length === 160, `Question total ${productionQuestions.length}/${published.length}`);
  pass(authoredGraph.length === 43 && authoredNonGraph.length === 117, "Graph/non-graph total mismatch");
  pass(productionQuestions[0].id === ID_FIRST && productionQuestions.at(-1).id === ID_LAST, "ID range mismatch");
  pass(productionQuestions.every((question, index) => question.id === ID_FIRST + index), "IDs are not contiguous");
  pass(new Set(productionQuestions.map(question => question.id)).size === 160, "Author IDs are not unique");
  pass(digest(productionQuestions.map(question => question.id)) === SOURCE_DIGESTS.ids, "Question ID digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.answer])) === SOURCE_DIGESTS.answers, "Answer digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.primarySkill])) === SOURCE_DIGESTS.skills, "Primary-skill digest changed");
  pass(digest(authoredGraph.map(question => [question.id, question.asset])) === SOURCE_DIGESTS.graphs, "Graph-allocation digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.objective])) === SOURCE_DIGESTS.objectives, "Objective digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.difficulty])) === SOURCE_DIGESTS.difficulty, "Difficulty digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.pool])) === SOURCE_DIGESTS.pools, "Pool digest changed");
  pass(digest(productionQuestions.map(question => [question.id, question.q])) === SOURCE_DIGESTS.stems, "Stem digest changed");
  pass(sameCounts(distribution(productionQuestions, "objective"), EXPECTED.objectives), "Learning-objective allocation mismatch");
  pass(sameCounts(distribution(productionQuestions, "difficulty"), EXPECTED.difficulty), "All-record difficulty allocation mismatch");
  pass(sameCounts(distribution(authoredOrdinary, "difficulty"), EXPECTED.ordinaryDifficulty), "Ordinary/challenge difficulty allocation mismatch");
  pass(sameCounts(distribution(productionQuestions, "pool"), EXPECTED.pools), "Pool allocation mismatch");
  pass(sameCounts(distribution(productionQuestions, "type"), EXPECTED.types), "Question-type allocation mismatch");
  pass(sameCounts(distribution(productionQuestions, "tag"), EXPECTED.subtopics), "Subtopic allocation mismatch");
  pass(new Set(productionQuestions.map(question => question.tag)).size === Object.keys(SUBTOPICS).length, "Subtopic cardinality mismatch");
  for (const [filename, count] of Object.entries(EXPECTED.assets)) {
    pass(authoredGraph.filter(question => question.asset === filename).length === count, `Asset allocation ${filename}`);
  }

  const legalTypes = new Set(["definition", "application", "interpretation", "calculation", "integration", "bridge", "graph_interpretation", "graph_calculation", "graph_integration", "graph_trap"]);
  const forbiddenCopy = /\b(?:read the quantity|read the price|the dot shows|according to the dot|correct\. the quantity|correct\. the value|whatever|obviously|always a market failure)\b/i;
  const exactStems = new Set();
  const visibleRecords = new Set();
  let maximumStemSimilarity = 0;
  let closestStemPair = [];
  for (let index = 0; index < productionQuestions.length; index += 1) {
    const question = productionQuestions[index];
    pass(Boolean(question.q && question.answer && question.objective && question.primarySkill && question.repairSkill && question.tag && question.feedback), `Required metadata ${question.id}`);
    pass(question.conceptCluster === CONCEPT_ID && Object.values(SUBTOPICS).includes(question.tag), `Taxonomy ${question.id}`);
    pass(legalTypes.has(question.type), `Unsupported type ${question.id}: ${question.type}`);
    pass(Array.isArray(question.secondarySkills), `Secondary-skill metadata ${question.id}`);
    pass(question.distractors.length === 3 && new Set([question.answer, ...question.distractors].map(normalize)).size === 4, `Option integrity ${question.id}`);
    pass(question.feedback.split(/\s+/).length >= 10, `Underexplained feedback ${question.id}`);
    pass(!forbiddenCopy.test(question.q) && !forbiddenCopy.test(question.feedback), `Mechanical copy ${question.id}`);
    pass(!normalize(question.q).includes(normalize(question.answer)) || question.answer.length < 6, `Answer leakage ${question.id}`);
    pass(!exactStems.has(normalize(question.q)), `Duplicate stem ${question.id}`);
    exactStems.add(normalize(question.q));
    const visibleKey = `${normalize(question.q)}\u0000${[question.answer, ...question.distractors].map(normalize).sort().join("\u0000")}`;
    pass(!visibleRecords.has(visibleKey), `Duplicate visible question ${question.id}`);
    visibleRecords.add(visibleKey);
    if (["Public good", "Private good", "Common resource", "Club good"].includes(question.answer)) {
      pass(/exclud|exclusion/i.test(question.feedback) && /rival/i.test(question.feedback), `Classification feedback omits a dimension ${question.id}`);
    }
    for (let other = index + 1; other < productionQuestions.length; other += 1) {
      const score = jaccard(question.q, productionQuestions[other].q);
      if (score > maximumStemSimilarity) {
        maximumStemSimilarity = score;
        closestStemPair = [question.id, productionQuestions[other].id];
      }
    }
  }
  pass(maximumStemSimilarity < 0.8, `Near-duplicate stems ${closestStemPair.join("/")} at ${maximumStemSimilarity.toFixed(3)}`);

  const byId = new Map(productionQuestions.map(question => [question.id, question]));
  const convertedGraphIds = [42168, 42177, 42180, 42187, 42190];
  pass(convertedGraphIds.every(id => !byId.get(id).graphRequired && !byId.get(id).asset), "Manual graph-audit conversion mismatch");
  const sirenQ = (40 - 20) / 0.5;
  const privateRadioQ = 60 - 20;
  const efficientRadioQ = 100 - 20;
  const coastalQ = (60 - 15) / 1.5;
  const coastalValue = 60 - coastalQ;
  const northAtFour = Math.max(0, 50 - 5 * 4);
  const southAtFour = Math.max(0, 40 - 5 * 4);
  const groupAAtForty = Math.max(0, 50 - 0.5 * 40);
  const groupBAtForty = Math.max(0, 30 - 0.5 * 40);
  pass(sirenQ === 40 && byId.get(42160).answer === `${sirenQ} sirens` && byId.get(42161).answer === "$20,000 per siren", "PUBLIC-01 source math");
  pass(privateRadioQ === 40 && efficientRadioQ === 80 && efficientRadioQ - privateRadioQ === 40, "PUBLIC-02 source intersections");
  pass(byId.get(42170).answer === "40 hours per week" && byId.get(42171).answer === "80 hours per week" && byId.get(42172).answer === "40 hours per week", "PUBLIC-02 keyed math");
  pass(coastalQ === 30 && coastalValue === 30 && byId.get(42182).answer === "30 miles" && byId.get(42183).answer === "$30 million per mile", "PUBLIC-03 source math");
  pass(northAtFour === 30 && southAtFour === 20 && northAtFour + southAtFour === 50 && byId.get(42196).answer === "4 displays", "PUBLIC-04 vertical summation");
  pass(groupAAtForty === 30 && groupBAtForty === 10 && groupAAtForty + groupBAtForty === 40, "PUBLIC-05 vertical summation");
  pass(byId.get(42200).answer === "$3,000 per hour" && byId.get(42201).answer === "$1,000 per hour" && byId.get(42202).answer === "$4,000 per hour", "PUBLIC-05 keyed math");

  const publishedById = new Map(published.map(entry => [Number(entry.question.id), entry]));
  const answerPositions = [0, 0, 0, 0];
  for (const author of productionQuestions) {
    const found = publishedById.get(author.id);
    if (!found) continue;
    const curated = humanReadExpectedById.get(String(author.id))?.after;
    const expectedPool = ["easyBoss", "mediumBoss", "finalBoss"].includes(author.pool) ? "boss" : author.pool;
    pass(found.conceptId === undefined || found.conceptId === PARENT_CONCEPT_ID, `Physical concept ${author.id}`);
    pass(found.pool === expectedPool, `Published pool ${author.id}: ${found.pool}/${expectedPool}`);
    pass(found.question.q === (curated?.q ?? author.q) && found.question.type === (curated?.type ?? author.type) && found.question.objective === author.objective, `Published metadata ${author.id}`);
    pass(found.question.primarySkill === author.primarySkill && found.question.repairSkill === author.repairSkill, `Published skills ${author.id}`);
    pass(found.question.subtopicIds?.length === 1 && found.question.subtopicIds[0] === CONCEPT_ID, `Published subtopic ${author.id}`);
    pass(!["answer", "correctAnswer", "correctIndex", "a"].some(field => Object.hasOwn(found.question, field)), `Plaintext answer field ${author.id}`);
    const correct = found.question.options.filter(option => sha256(normalize(option)) === found.question.aHash);
    const expectedOptions = curated?.options ?? [author.answer, ...author.distractors];
    const expectedHash = curated?.aHash ?? sha256(normalize(author.answer));
    const expectedAnswer = expectedOptions.find(option => sha256(normalize(option)) === expectedHash);
    pass(correct.length === 1 && correct[0] === expectedAnswer, `Answer hash ${author.id}`);
    answerPositions[found.question.options.findIndex(option => option === expectedAnswer)] += 1;
    if (author.graphRequired) {
      pass(found.question.graphRequired === true && found.question.image.endsWith(author.asset), `Graph reference ${author.id}`);
      pass(found.question.imageAlt === GRAPH_ASSETS[author.asset].imageAlt && found.question.graphDescription === GRAPH_ASSETS[author.asset].graphDescription, `Graph accessibility ${author.id}`);
    } else {
      pass(!found.question.image && !found.question.graphRequired, `Non-graph asset pollution ${author.id}`);
    }
  }
  pass(answerPositions.every(count => count === 40), `Answer positions ${answerPositions.join("/")}`);

  pass(childEntries(library, CONCEPT_ID).length === 176, `Resulting concept total ${childEntries(library, CONCEPT_ID).length}`);
  for (const [conceptId, expectedDigest] of Object.entries(LEGACY_DIGESTS)) {
    const entries = conceptEntries(library.concepts[PARENT_CONCEPT_ID])
      .map(entry => ({ ...entry, question: humanReadExpectedById.get(String(entry.question.id))?.before ?? entry.question }))
      .filter(({ question }) => (question.subtopicIds || []).includes(conceptId))
      .filter(({ question }) => question.sourceCurationPhase !== PHASE)
      .sort((left, right) => String(left.question.id).localeCompare(String(right.question.id)) || left.pool.localeCompare(right.pool));
    const expectedCount = conceptId === "externalities" ? 177 : conceptId === "market-power" ? 9 : 16;
    pass(entries.length === expectedCount, `Protected ${conceptId} count ${entries.length}`);
    pass(digest(entries) === expectedDigest, `Protected ${conceptId} records changed`);
  }

  const phaseAssets = library.assetInventory.filter(asset => asset.sourceCurationPhase === PHASE);
  pass(phaseAssets.length === 5 && Object.keys(GRAPH_ASSETS).length === 5, `Phase asset count ${phaseAssets.length}`);
  for (const asset of phaseAssets) {
    const file = path.join(composerRoot, "data", asset.runtimePath);
    const bytes = fs.readFileSync(file);
    pass(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP", `WebP signature ${asset.filename}`);
    pass(asset.width === 1720 && asset.height === 1200, `Dimensions ${asset.filename}`);
    pass(bytes.length === EXPECTED.assetBytes[asset.filename] && asset.sizeBytes === bytes.length, `Byte size ${asset.filename}`);
    pass(asset.sha256 === EXPECTED.assetHashes[asset.filename] && sha256(bytes) === EXPECTED.assetHashes[asset.filename], `Asset hash ${asset.filename}`);
    pass(Boolean(asset.imageAlt) && Boolean(asset.graphDescription), `Asset accessibility ${asset.filename}`);
    pass(published.some(({ question }) => question.image === asset.runtimePath), `Orphan asset ${asset.filename}`);
  }
  pass(!fs.existsSync(path.join(composerRoot, "data", "question-assets", "_incoming-public-goods")), "Incoming asset staging directory remains");
  const physicalWebPs = fs.readdirSync(path.join(composerRoot, "data", "question-assets"), { recursive: true }).filter(file => String(file).toLowerCase().endsWith(".webp"));
  pass(physicalWebPs.length === 496, `Physical WebP count ${physicalWebPs.length}`);

  const childModule = library.concepts[CONCEPT_ID];
  const childRegistry = library.registry.concepts.filter(record => record.canonicalConceptId === CONCEPT_ID);
  const parentRegistry = library.registry.concepts.find(record => record.canonicalConceptId === PARENT_CONCEPT_ID);
  pass(childModule?.derivedFromConceptId === PARENT_CONCEPT_ID && childRegistry.length === 1, "Concept registration mismatch");
  pass(childRegistry[0]?.status === "active" && childRegistry[0]?.selectionRole === "standalone", "Concept is not standalone-active");
  pass(parentRegistry?.status === "legacy" && parentRegistry?.selectionRole === "legacy-parent", "Market Failures parent regression");
  pass(!quickStartConceptIds().includes(PARENT_CONCEPT_ID), "Quick start selects broad Market Failures");
  const reviewManifest = helpers.loadConceptReviewManifest();
  pass(core.validateConceptReviewManifest(library, reviewManifest).ok, "Concept-review manifest invalid");
  pass(reviewManifest.concepts.filter(record => record.canonicalConceptId === CONCEPT_ID && record.diagnosable === true).length === 1, "Concept-review mapping mismatch");
  const legacyRecipe = JSON.parse(fs.readFileSync(path.join(testRoot, "recipes", "market-foundations.json"), "utf8"));
  const migrated = core.migrateRecipe(legacyRecipe, library);
  pass(migrated.recipe.selectedConceptIds.includes(CONCEPT_ID), "Legacy taxonomy migration omitted Public Goods");
  const legacyComposition = core.compose(library, legacyRecipe);
  pass(legacyComposition.errors.length === 0 && legacyComposition.validation.modes.every(mode => mode.ok), "Legacy Market Foundations recipe regression");

  const recipe = {
    schemaVersion: core.RECIPE_SCHEMA_VERSION,
    title: "Public Goods and Common Resources Mastery Quest",
    slug: "public-goods-common-resources-production-validation",
    supportedModes: [...core.MODE_ORDER],
    selectedConceptIds: [CONCEPT_ID],
    checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
  };
  const composition = core.compose(library, recipe);
  pass(composition.errors.length === 0, `Composition errors: ${composition.errors.join(" | ")}`);
  pass(composition.validation.modes.length === 10 && composition.validation.modes.every(mode => mode.ok), "A supported mode failed");
  pass(composition.counts.totalCanonical === 176 && composition.counts.graph === 43 && composition.counts.graphSafe >= 10, "Focused composition counts mismatch");
  pass(composition.counts.repair >= 5 && composition.counts.bridge >= 6, "Adaptive support depth mismatch");
  const generatedQuestions = [...Object.values(composition.banks).flat(), ...composition.repairQuestions, ...composition.bridgeQuestions];
  pass(generatedQuestions.every(question => question.primaryConceptId === CONCEPT_ID), "Focused quest contains another concept");
  pass(Object.keys(EXPECTED.assets).every(filename => composition.trialGraphQuestionIds.some(id => publishedById.get(Number(id))?.question.image?.endsWith(filename))), "Trial by Graph does not cover every Public Goods asset");
  pass((await core.verifyAnswers(composition)).ok, "Focused answer verification failed");
  embedQuestionAssets(composition);
  helpers.attachConceptReviewRuntime(core, composition, library, [CONCEPT_ID]);
  pass(composition.conceptReviewRuntimeIndex.diagnosticConceptIds.includes(CONCEPT_ID), "Mastery Report diagnostic signal missing");
  const template = helpers.loadCanonicalTemplate();
  pass(/feedback:\s*2800/.test(template), "Explanatory feedback duration is not 2800 ms");
  pass(/checkpointTransition:\s*1800/.test(template), "Checkpoint transition duration changed");
  pass(/const presentationDuration = options\.duration \?\? TIMING\.feedback;/.test(template), "Hallway feedback does not default to the shared feedback duration");
  pass(/duration:TIMING\.checkpointTransition/.test(template), "Checkpoint path does not preserve its original transition duration");
  const config = await core.createConfig(recipe, library, await core.sha256Hex(template));
  const metadata = helpers.createMetadata(core, composition, config, library, { phase: PHASE, sourceVersion: SOURCE_VERSION });
  const html = core.buildHtml(template, composition, config, metadata);
  const scripts = helpers.assertInlineScriptsCompile(html, "public-goods-common-resources-production-sample.html");
  pass(Object.keys(EXPECTED.assets).every(filename => html.includes(filename)), "Generated game omitted a graph asset");
  pass(html.includes("graphDescription") && html.includes("openGraphLightbox"), "Graph accessibility/enlargement runtime missing");
  pass(html.includes("Repair") && html.includes("Bridge") && html.includes("Mastery Report"), "Adaptive or Mastery Report runtime missing");
  const artifact = helpers.writeTestArtifact("tests/public-goods-common-resources-production-sample.html", html);

  const publisherResult = JSON.parse(execFileSync(process.execPath, [publisherPath], { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }));
  pass(publisherResult.status === "PASS" && publisherResult.librarySha256 === library.librarySha256, "Deterministic publisher check failed");

  const result = {
    phase: PHASE,
    ok: issues.length === 0,
    composerVersion: core.COMPOSER_VERSION,
    recipeSchemaVersion: core.RECIPE_SCHEMA_VERSION,
    canonicalQuestionCount: library.canonicalQuestionCount,
    newQuestions: productionQuestions.length,
    retainedLegacyQuestions: 16,
    resultingConceptQuestions: childEntries(library, CONCEPT_ID).length,
    graphQuestions: authoredGraph.length,
    nonGraphQuestions: authoredNonGraph.length,
    objectives: distribution(productionQuestions, "objective"),
    subtopics: distribution(productionQuestions, "tag"),
    difficulty: distribution(productionQuestions, "difficulty"),
    pools: distribution(productionQuestions, "pool"),
    types: distribution(productionQuestions, "type"),
    graphAssets: Object.fromEntries(Object.keys(EXPECTED.assets).map(filename => [filename, authoredGraph.filter(question => question.asset === filename).length])),
    answerPositions,
    maximumStemSimilarity: Number(maximumStemSimilarity.toFixed(3)),
    closestStemPair,
    publisherSha256: publisherResult.librarySha256,
    generatedBytes: Buffer.byteLength(html),
    inlineScripts: scripts,
    generatedArtifact: artifact,
    modes: composition.validation.modes.map(mode => ({ mode: mode.mode, ok: mode.ok })),
    issues
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

run().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
