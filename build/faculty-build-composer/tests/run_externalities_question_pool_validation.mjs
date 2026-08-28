import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  PHASE,
  ID_FIRST,
  ID_LAST,
  PARENT_CONCEPT_ID,
  CONCEPT_ID,
  OBJECTIVES,
  GRAPH_ASSETS,
  ordinaryQuestions
} from "../authoring/externalities_question_pool_author.mjs";

const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const composerRoot = path.resolve(testRoot, "..");
const repoRoot = path.resolve(composerRoot, "..", "..");
const manifestPath = path.join(composerRoot, "data", "composer_library_manifest.json");
const phaseIds = new Set(ordinaryQuestions.map(question => String(question.id)));

const EXPECTED = Object.freeze({
  objectives: { "EXT.1": 14, "EXT.2": 28, "EXT.3": 16, "EXT.4": 26, "EXT.5": 26, "EXT.6": 20, "EXT.7": 12, "EXT.8": 8, "EXT.9": 10 },
  graphObjectives: { "EXT.1": 4, "EXT.2": 24, "EXT.3": 6, "EXT.4": 22, "EXT.5": 24, "EXT.6": 18, "EXT.7": 0, "EXT.8": 0, "EXT.9": 6 },
  difficulty: { easy: 24, medium: 48, hard: 48, elite: 28, legendary: 12 },
  types: { graph_interpretation: 34, graph_trap: 16, graph_calculation: 30, graph_integration: 24, application: 24, interpretation: 14, calculation: 8, integration: 10 },
  assetClass: { A: 20, B: 40, C: 36, D: 8 },
  scenarios: { 1: 24, 2: 32, 3: 24, 4: 24 }
});

const SOURCE_TRUTH = [
  { scenario: 1, b: 42020, c: 42060, market: "240 million garments", price: "$12", efficient: "160 million garments", gap: "80 million garments", effect: "$6 per garment", dwl: "$240 million", fiscal: "$960 million" },
  { scenario: 2, b: 42030, c: 42069, market: "180 thousand vapes", price: "$10", efficient: "140 thousand vapes", gap: "40 thousand vapes", effect: "$4 per vape", dwl: "$80 thousand", fiscal: "$560 thousand" },
  { scenario: 3, b: 42040, c: 42078, market: "100 gardens", price: "$12", efficient: "150 gardens", gap: "50 gardens", effect: "$5 per garden", dwl: "$125", fiscal: "$750" },
  { scenario: 4, b: 42050, c: 42087, market: "150 thousand rides per day", price: "$5", efficient: "200 thousand rides per day", gap: "50 thousand rides per day", effect: "$2 per ride", dwl: "$50 thousand per day", fiscal: "$400 thousand per day" }
];

function normalize(value) {
  return String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
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

function allOrdinary(library) {
  const records = [];
  for (const [conceptId, concept] of Object.entries(library.concepts)) {
    for (const [pool, questions] of Object.entries(concept.questions || {})) {
      for (const question of questions || []) records.push({ conceptId, pool, question });
    }
  }
  return records;
}

function tokens(value) {
  return new Set(normalize(value).replace(/[^a-z0-9$%]+/g, " ").split(" ").filter(token => token.length > 2));
}

function jaccard(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  const intersection = [...left].filter(token => right.has(token)).length;
  return intersection / new Set([...left, ...right]).size;
}

function answerSetKey(question) {
  return [question.answer, ...question.distractors].map(normalize).sort().join("\u0000");
}

function embedQuestionAssets(composition) {
  const embedded = {};
  for (const asset of composition.assets || []) {
    const file = path.join(composerRoot, "data", asset.runtimePath);
    const bytes = fs.readFileSync(file);
    if (sha256(bytes) !== asset.sha256) throw new Error(`Asset hash mismatch: ${asset.runtimePath}`);
    embedded[asset.runtimePath] = `data:image/webp;base64,${bytes.toString("base64")}`;
  }
  composition.embeddedQuestionAssets = embedded;
}

async function run() {
  const issues = [];
  const pass = (condition, message) => { if (!condition) issues.push(message); };
  const library = helpers.loadComposerLibrary();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const ordinary = allOrdinary(library);
  const published = ordinary.filter(({ question }) => phaseIds.has(String(question.id)));
  const authoredGraph = ordinaryQuestions.filter(question => question.graphRequired);
  const authoredNonGraph = ordinaryQuestions.filter(question => !question.graphRequired);

  pass(core.COMPOSER_VERSION === "4.5s.3k", `Composer version ${core.COMPOSER_VERSION}`);
  pass(core.RECIPE_SCHEMA_VERSION === "1.4.0", `Recipe schema ${core.RECIPE_SCHEMA_VERSION}`);
  pass(library.composerVersion === "4.5s.3k", `Library version ${library.composerVersion}`);
  pass(library.conceptCount === 134, `Concept count ${library.conceptCount}`);
  pass(library.canonicalQuestionCount === 9379 && manifest.canonicalQuestionCount === 9379, "Canonical count mismatch");
  pass(library.assetInventory.length === 486 && manifest.assetCount === 486, "Registered asset count mismatch");
  pass(ordinaryQuestions.length === 160 && published.length === 160, `Question total ${ordinaryQuestions.length}/${published.length}`);
  pass(authoredGraph.length === 104 && authoredNonGraph.length === 56, "Graph/non-graph total mismatch");
  pass(ordinaryQuestions[0].id === ID_FIRST && ordinaryQuestions.at(-1).id === ID_LAST, "ID range mismatch");
  pass(new Set(ordinaryQuestions.map(question => question.id)).size === 160, "Author IDs are not unique");
  pass(sameCounts(distribution(ordinaryQuestions, "objective"), EXPECTED.objectives), "Objective allocation mismatch");
  pass(sameCounts(distribution(authoredGraph, "objective"), EXPECTED.graphObjectives), "Graph objective allocation mismatch");
  pass(sameCounts(distribution(ordinaryQuestions, "difficulty"), EXPECTED.difficulty), "Difficulty allocation mismatch");
  pass(sameCounts(distribution(ordinaryQuestions, "type"), EXPECTED.types), "Question-type allocation mismatch");
  pass(sameCounts(distribution(authoredGraph, "assetClass"), EXPECTED.assetClass), "Asset-class allocation mismatch");
  pass(sameCounts(distribution(authoredGraph, "scenario"), EXPECTED.scenarios), "Scenario allocation mismatch");
  pass(Object.keys(GRAPH_ASSETS).length === 13, "Asset source count mismatch");
  for (const [filename, expectedCount] of Object.entries({
    "EXTERNALITY-A-01.webp": 5, "EXTERNALITY-A-02.webp": 5, "EXTERNALITY-A-03.webp": 5, "EXTERNALITY-A-04.webp": 5,
    "EXTERNALITY-B-01.webp": 10, "EXTERNALITY-B-02.webp": 10, "EXTERNALITY-B-03.webp": 10, "EXTERNALITY-B-04.webp": 10,
    "EXTERNALITY-C-01.webp": 9, "EXTERNALITY-C-02.webp": 9, "EXTERNALITY-C-03.webp": 9, "EXTERNALITY-C-04.webp": 9,
    "EXTERNALITY-D-02.webp": 8
  })) pass(authoredGraph.filter(question => question.asset === filename).length === expectedCount, `Asset allocation ${filename}`);

  const byId = new Map(ordinaryQuestions.map(question => [question.id, question]));
  for (const truth of SOURCE_TRUTH) {
    const b = truth.b;
    const c = truth.c;
    pass(byId.get(b).answer === truth.market, `Scenario ${truth.scenario} market quantity`);
    pass(byId.get(b + 1).answer === truth.price, `Scenario ${truth.scenario} market price`);
    pass(byId.get(b + 2).answer === truth.efficient, `Scenario ${truth.scenario} efficient quantity`);
    pass(byId.get(b + 4).answer === truth.gap, `Scenario ${truth.scenario} quantity gap`);
    pass(byId.get(b + 5).answer === truth.effect, `Scenario ${truth.scenario} external effect`);
    pass(byId.get(b + 6).answer === truth.dwl, `Scenario ${truth.scenario} DWL`);
    pass(byId.get(c).answer === truth.gap && byId.get(c + 1).answer === truth.effect, `Scenario ${truth.scenario} policy inputs`);
    pass(byId.get(c + 3).answer === truth.fiscal, `Scenario ${truth.scenario} fiscal calculation`);
  }
  const dAnswers = ["$2 per vape", "160 thousand vapes", "20 thousand vapes", "Consumers pay $11; sellers receive $9", "$20 thousand", "75%", "$320 thousand"];
  dAnswers.forEach((answer, index) => pass(byId.get(42096 + index).answer === answer, `Imperfect-policy answer ${42096 + index}`));

  const stemSet = new Set();
  const answerSets = new Set();
  let maxSimilarity = 0;
  let nearPair = [];
  for (let index = 0; index < ordinaryQuestions.length; index += 1) {
    const question = ordinaryQuestions[index];
    pass(!stemSet.has(normalize(question.q)), `Duplicate stem ${question.id}`);
    stemSet.add(normalize(question.q));
    const optionSet = answerSetKey(question);
    pass(!answerSets.has(optionSet), `Duplicate answer set ${question.id}`);
    answerSets.add(optionSet);
    pass(question.distractors.length === 3 && new Set([question.answer, ...question.distractors].map(normalize)).size === 4, `Option integrity ${question.id}`);
    for (let other = index + 1; other < ordinaryQuestions.length; other += 1) {
      const score = jaccard(question.q, ordinaryQuestions[other].q);
      if (score > maxSimilarity) { maxSimilarity = score; nearPair = [question.id, ordinaryQuestions[other].id]; }
    }
  }
  pass(maxSimilarity < 0.8, `Near-duplicate stems ${nearPair.join("/")} at ${maxSimilarity.toFixed(3)}`);

  const publishedById = new Map(published.map(record => [Number(record.question.id), record]));
  const answerPositions = [0, 0, 0, 0];
  for (const author of ordinaryQuestions) {
    const found = publishedById.get(author.id);
    if (!found) continue;
    const { conceptId, pool, question } = found;
    pass(conceptId === PARENT_CONCEPT_ID && pool === author.difficulty && question.subtopicIds?.includes(CONCEPT_ID), `Concept/pool ${author.id}`);
    pass(question.q === author.q && question.type === author.type && question.objective === author.objective, `Published metadata ${author.id}`);
    pass(question.primarySkill === author.primarySkill && question.repairSkill === author.repairSkill, `Skill metadata ${author.id}`);
    pass(!["answer", "correctAnswer", "correctIndex", "a"].some(field => Object.hasOwn(question, field)), `Plaintext answer field ${author.id}`);
    const matching = question.options.filter(option => sha256(normalize(option)) === question.aHash);
    pass(matching.length === 1 && matching[0] === author.answer, `Answer hash ${author.id}`);
    answerPositions[question.options.findIndex(option => option === author.answer)] += 1;
    if (author.graphRequired) {
      pass(question.graphRequired === true && question.image.endsWith(author.asset), `Graph reference ${author.id}`);
      pass(question.imageAlt === GRAPH_ASSETS[author.asset].imageAlt && question.graphDescription === GRAPH_ASSETS[author.asset].graphDescription, `Accessibility ${author.id}`);
    } else {
      pass(!question.image && !question.graphRequired, `Non-graph pollution ${author.id}`);
    }
  }
  pass(answerPositions.every(count => count === 40), `Answer positions ${answerPositions.join("/")}`);

  const phaseAssets = library.assetInventory.filter(asset => asset.sourceCurationPhase === PHASE);
  pass(phaseAssets.length === 13, `Phase asset registrations ${phaseAssets.length}`);
  for (const asset of phaseAssets) {
    const file = path.join(composerRoot, "data", asset.runtimePath);
    const bytes = fs.readFileSync(file);
    pass(bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP", `WebP decode signature ${asset.filename}`);
    pass(asset.width === 1720 && asset.height === 1200, `Dimensions ${asset.filename}`);
    pass(asset.sizeBytes === bytes.length && asset.sha256 === sha256(bytes), `Asset pin ${asset.filename}`);
    pass(Boolean(asset.imageAlt) && Boolean(asset.graphDescription), `Asset accessibility ${asset.filename}`);
  }
  pass(!fs.existsSync(path.join(composerRoot, "data", "question-assets", "_incoming-externalities")), "Incoming staging directory remains");
  const physicalWebPs = fs.readdirSync(path.join(composerRoot, "data", "question-assets"), { recursive: true }).filter(file => String(file).toLowerCase().endsWith(".webp"));
  pass(physicalWebPs.length === 486, `Physical WebP count ${physicalWebPs.length}`);
  const concept = library.concepts[PARENT_CONCEPT_ID];
  for (const [objective, label] of Object.entries(OBJECTIVES)) pass(concept.objectiveLabels[objective] === label, `Objective label ${objective}`);
  pass((concept.repairQuestions || []).filter(question => question.sourceCurationPhase === PHASE).length === 0, "Unexpected Repair additions");
  pass((concept.bridgeQuestions || []).filter(question => question.sourceCurationPhase === PHASE).length === 0, "Unexpected Bridge additions");

  const recipe = {
    schemaVersion: core.RECIPE_SCHEMA_VERSION,
    title: "Externalities Production Validation",
    slug: "externalities-production-validation",
    supportedModes: ["timed", "exam", "quiz", "unlimited", "trialGraph", "fadingFortune", "riskReward"],
    selectedConceptIds: [CONCEPT_ID],
    checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
  };
  const composition = core.compose(library, recipe);
  pass(composition.errors.length === 0, `Composition errors: ${composition.errors.join(" | ")}`);
  pass(composition.validation.modes.every(mode => mode.ok), "A Composer mode failed");
  pass(authoredGraph.every(question => composition.trialGraphQuestionIds.includes(String(question.id))), "Trial by Graph omitted an externalities graph question");
  pass(Object.keys(OBJECTIVES).every(objective => composition.objectiveLabels[objective] === OBJECTIVES[objective]), "Mastery objective labels missing");
  embedQuestionAssets(composition);
  helpers.attachConceptReviewRuntime(core, composition, library, [CONCEPT_ID]);
  const template = helpers.loadCanonicalTemplate();
  const config = await core.createConfig(recipe, library, await core.sha256Hex(template));
  const metadata = helpers.createMetadata(core, composition, config, library, { phase: PHASE });
  const html = core.buildHtml(template, composition, config, metadata);
  const scripts = helpers.assertInlineScriptsCompile(html, "externalities-production-sample.html");
  pass(Object.keys(GRAPH_ASSETS).every(filename => html.includes(filename)), "Generated game omitted an asset class/scenario");
  pass(html.includes("graphDescription") && html.includes("openGraphLightbox"), "Graph enlargement/accessibility runtime missing");
  pass(html.includes("Repair") && html.includes("Bridge"), "Adaptive support runtime missing");
  const artifact = helpers.writeTestArtifact("tests/externalities-production-sample.html", html);

  const result = {
    phase: PHASE,
    ok: issues.length === 0,
    composerVersion: core.COMPOSER_VERSION,
    recipeSchemaVersion: core.RECIPE_SCHEMA_VERSION,
    canonicalQuestionCount: library.canonicalQuestionCount,
    questions: ordinaryQuestions.length,
    graphQuestions: authoredGraph.length,
    objective: distribution(ordinaryQuestions, "objective"),
    difficulty: distribution(ordinaryQuestions, "difficulty"),
    types: distribution(ordinaryQuestions, "type"),
    assetClass: distribution(authoredGraph, "assetClass"),
    scenarios: distribution(authoredGraph, "scenario"),
    primarySkills: Object.keys(distribution(ordinaryQuestions, "primarySkill")).length,
    assets: phaseAssets.length,
    answerPositions,
    maximumStemSimilarity: Number(maxSimilarity.toFixed(3)),
    closestStemPair: nearPair,
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
