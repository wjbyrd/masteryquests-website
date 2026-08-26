import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  graphAssets,
  ordinaryQuestions,
  PHASE2A_SOURCE_VERSION
} from "../../../play/economic-realm/market-gate/authoring/market_gate_phase2a_author.mjs";

const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const composerRoot = path.resolve(testRoot, "..");
const repoRoot = path.resolve(composerRoot, "..", "..");
const manifestPath = path.join(composerRoot, "data/composer_library_manifest.json");
const phaseIds = new Set(ordinaryQuestions.map(question => String(question.id)));

const expectedConcept = new Map([
  ...range(40000, 40005).map(id => [id, "production-possibilities-frontier"]),
  ...range(40006, 40008).map(id => [id, "supply"]),
  ...range(40009, 40011).map(id => [id, "demand"]),
  ...range(40012, 40020).map(id => [id, "market-equilibrium"]),
  ...range(40021, 40026).map(id => [id, "binding-price-ceilings"]),
  ...range(40027, 40032).map(id => [id, "binding-price-floors"]),
  ...[40033, 40034, 40036, 40039, 40040, 40041, 40042, 40045].map(id => [id, "tax-wedges-and-revenue"]),
  ...[40035, 40037, 40038, 40043, 40044, 40047].map(id => [id, "tax-incidence"]),
  [40046, "statutory-versus-economic-tax-incidence"]
]);

const cleanedGraphs = Object.freeze({
  "data/question-assets/aggregate-supply/adas1.webp": "4ef2f60d6b31cff0db2c2722f3e34c21f112df88096b3b36c3a3be215cb5185e",
  "data/question-assets/binding-price-ceilings/ceilingfloor.webp": "f483f0c5fbae3b5793ceea124e10fb4b3de8338f4c0d58cd6ba07d8ac936ae6b",
  "data/question-assets/binding-price-floors/ceilingfloor.webp": "f483f0c5fbae3b5793ceea124e10fb4b3de8338f4c0d58cd6ba07d8ac936ae6b",
  "data/question-assets/fiscal-policy-and-aggregate-demand/moneymultiplier.webp": "b8371794ea980d9cdb463314a72969379fa334ef908ed171035c1b79de0d9830",
  "data/question-assets/fisher-effect/moneys_moneyd.webp": "2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c",
  "data/question-assets/inflation-costs/moneys_moneyd.webp": "2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c",
  "data/question-assets/inflation-tax-and-deflation/moneys_moneyd.webp": "2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c",
  "data/question-assets/liquidity-preference-and-money-market/ad_ms_md.webp": "4749b2c2a013eec8c08b6c7280ef59c9f86aadbe324deff2fe7da3f24f3cb87d",
  "data/question-assets/macroeconomic-equilibrium-and-shocks/ADASLRAS-02.webp": "b1f716072d24c280d368f3e51cc02fde405976a1f103d321768fb65d9763f027",
  "data/question-assets/macroeconomic-equilibrium-and-shocks/LRAS-02.webp": "b1f716072d24c280d368f3e51cc02fde405976a1f103d321768fb65d9763f027",
  "data/question-assets/macroeconomic-equilibrium-and-shocks/adas1.webp": "4ef2f60d6b31cff0db2c2722f3e34c21f112df88096b3b36c3a3be215cb5185e"
});

function range(first, last) {
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

function normalize(value) {
  return String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isWebP(bytes) {
  return bytes.length > 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP";
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

function distribution(records, field) {
  const result = {};
  for (const record of records) {
    const key = record[field];
    result[key] = (result[key] || 0) + 1;
  }
  return result;
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
  const synchronized = ordinary.filter(({ question }) => phaseIds.has(String(question.id)));

  pass(core.COMPOSER_VERSION === "4.5s.3i", `Composer version ${core.COMPOSER_VERSION}`);
  pass(core.RECIPE_SCHEMA_VERSION === "1.4.0", `Recipe schema ${core.RECIPE_SCHEMA_VERSION}`);
  pass(library.composerVersion === "4.5s.3i", `Library Composer version ${library.composerVersion}`);
  pass(library.canonicalQuestionCount === 8531, `Canonical count ${library.canonicalQuestionCount}`);
  pass(manifest.canonicalQuestionCount === 8531, `Manifest canonical count ${manifest.canonicalQuestionCount}`);
  pass(synchronized.length === 48, `Synchronized record count ${synchronized.length}`);
  pass(new Set(synchronized.map(({ question }) => String(question.id))).size === 48, "Phase 3E IDs are not unique");
  pass(JSON.stringify(distribution(ordinaryQuestions, "pool")) === JSON.stringify({ medium: 7, hard: 16, elite: 20, legendary: 5 }), "Source difficulty distribution changed");
  pass(JSON.stringify(distribution(ordinaryQuestions, "type")) === JSON.stringify({ graph_calculation: 11, graph_interpretation: 10, graph_integration: 17, graph_trap: 10 }), "Source type distribution changed");

  const recordsById = new Map(synchronized.map(record => [String(record.question.id), record]));
  for (const author of ordinaryQuestions) {
    const found = recordsById.get(String(author.id));
    if (!found) continue;
    const { conceptId, pool, question } = found;
    pass(conceptId === expectedConcept.get(author.id), `Concept mapping ${author.id}: ${conceptId}`);
    pass(pool === author.pool && question.difficulty === author.pool && question.canonicalDifficulty === author.pool, `Difficulty ${author.id}`);
    pass(question.q === author.q && question.feedback === author.feedback, `Canonical copy changed ${author.id}`);
    pass(question.type === author.type && question.objective === author.objective, `Type/objective ${author.id}`);
    pass(question.primarySkill === author.primarySkill && question.repairSkill === author.repairSkill, `Skill metadata ${author.id}`);
    pass(question.graphRequired === true && Boolean(question.image), `Graph requirement ${author.id}`);
    pass(question.imageAlt === graphAssets[author.asset] && question.graphDescription === graphAssets[author.asset], `Accessibility metadata ${author.id}`);
    pass(!Object.hasOwn(question, "answer") && !Object.hasOwn(question, "correctAnswer") && !Object.hasOwn(question, "correctIndex"), `Plaintext answer field ${author.id}`);
    const correctHashes = question.options.filter(option => sha256(normalize(option)) === question.aHash);
    pass(correctHashes.length === 1 && correctHashes[0] === author.answer, `Answer hash ${author.id}`);
    const metadata = library.concepts[conceptId].assetMetadata.find(asset => asset.runtimePath === question.image);
    pass(Boolean(metadata), `Missing asset metadata ${author.id}`);
    if (metadata) {
      const file = path.join(composerRoot, "data", metadata.runtimePath);
      const bytes = fs.readFileSync(file);
      pass(isWebP(bytes), `Invalid WebP ${metadata.runtimePath}`);
      pass(sha256(bytes) === metadata.sha256 && bytes.length === metadata.sizeBytes, `Asset integrity ${metadata.runtimePath}`);
      const source = fs.readFileSync(path.join(repoRoot, "play/economic-realm/market-gate", author.asset));
      pass(bytes.equals(source), `Market Gate mirror mismatch ${author.asset}`);
    }
  }

  const allIds = ordinary.map(({ question }) => String(question.id));
  pass(new Set(allIds).size === allIds.length - 21, `Unexpected ordinary ID duplication delta ${allIds.length - new Set(allIds).size}`);
  const phaseAssets = library.assetInventory.filter(asset => asset.sourceCurationPhase === "phase3e-market-gate-graph-sync-v1");
  pass(phaseAssets.length === 21, `Phase 3E asset registration count ${phaseAssets.length}`);
  for (const asset of phaseAssets) {
    pass(synchronized.some(({ question }) => question.image === asset.runtimePath), `Orphan Phase 3E asset ${asset.conceptId}/${asset.filename}`);
  }

  for (const [sourceUrl, expectedHash] of Object.entries(cleanedGraphs)) {
    const bytes = fs.readFileSync(path.join(composerRoot, sourceUrl));
    pass(isWebP(bytes), `Cleaned graph decode ${sourceUrl}`);
    pass(sha256(bytes) === expectedHash, `Cleaned graph hash ${sourceUrl}`);
    const pins = library.assetInventory.filter(asset => asset.sourceUrl === sourceUrl);
    if (!sourceUrl.endsWith("/ADASLRAS-02.webp")) {
      pass(pins.length === 1 && pins[0].sha256 === expectedHash && pins[0].sizeBytes === bytes.length, `Cleaned graph pin ${sourceUrl}`);
    } else {
      pass(pins.length === 0, "Unregistered ADASLRAS-02 unexpectedly gained an application hash pin");
    }
  }

  const selectedConceptIds = [...new Set(expectedConcept.values())];
  const recipe = {
    schemaVersion: core.RECIPE_SCHEMA_VERSION,
    title: "Phase 3E Market Graph Validation",
    slug: "phase-3e-market-graph-validation",
    supportedModes: [...core.MODE_ORDER],
    selectedConceptIds,
    checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
  };
  const composition = core.compose(library, recipe);
  pass(composition.errors.length === 0, `Composition errors: ${composition.errors.join(" | ")}`);
  pass(composition.validation.modes.every(mode => mode.ok), "An existing mode failed Phase 3E preflight");
  pass(synchronized.every(({ question }) => composition.trialGraphQuestionIds.includes(String(question.id))), "Trial by Graph omitted a Phase 3E question");
  pass(Object.values(composition.banks).flat().some(question => !question.image), "Non-graph regression fixture is missing");
  embedQuestionAssets(composition);
  const template = helpers.loadCanonicalTemplate();
  helpers.attachConceptReviewRuntime(core, composition, library, selectedConceptIds);
  const config = await core.createConfig(recipe, library, await core.sha256Hex(template));
  const metadata = helpers.createMetadata(core, composition, config, library, { phase: "phase3e" });
  const html = core.buildHtml(template, composition, config, metadata);
  const scripts = helpers.assertInlineScriptsCompile(html, "phase3e-market-gate-sample.html");
  pass(ordinaryQuestions.slice(0, 8).every(question => html.includes(`\"id\": \"${question.id}\"`)), "Generated game omitted representative Phase 3E questions");
  pass(html.includes("questionAssetMetadata") && html.includes("graphDescription"), "Generated graph accessibility runtime is missing");
  pass(!html.includes(PHASE2A_SOURCE_VERSION), "Author-source label leaked into generated game");
  const artifact = helpers.writeTestArtifact("tests/phase3e-market-gate-sample.html", html);

  const result = {
    phase: "phase3e-market-gate-graph-sync-v1",
    ok: issues.length === 0,
    composerVersion: core.COMPOSER_VERSION,
    recipeSchemaVersion: core.RECIPE_SCHEMA_VERSION,
    canonicalQuestionCount: library.canonicalQuestionCount,
    synchronizedQuestions: synchronized.length,
    difficulty: distribution(ordinaryQuestions, "pool"),
    types: distribution(ordinaryQuestions, "type"),
    conceptIds: selectedConceptIds,
    phaseAssetRegistrations: phaseAssets.length,
    physicalAssetsCopied: 0,
    cleanedGraphs: Object.keys(cleanedGraphs).length,
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
