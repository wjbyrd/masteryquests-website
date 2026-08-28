import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import {
  PHASE, SOURCE_VERSION, ID_FIRST, ID_LAST, CONCEPT_ID,
  OBJECTIVES, SUBTOPICS, GRAPH_ASSETS, productionQuestions
} from "../build/faculty-build-composer/authoring/factor_markets_question_pool_author.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const libraryPath = path.join(root, "build/faculty-build-composer/data/composer_library.js");
const registryPath = path.join(root, "build/faculty-build-composer/data/composer_registry.json");
const manifestPath = path.join(root, "build/faculty-build-composer/data/composer_library_manifest.json");
const reviewManifestPath = path.join(root, "build/faculty-build-composer/data/concept-reviews/manifest.json");
const reviewSourcePath = path.join(root, "build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json");
const incomingDir = path.join(root, "build/faculty-build-composer/data/question-assets/_incoming-factors-of-production");
const finalDir = path.join(root, "build/faculty-build-composer/data/question-assets/factor-markets");
const COMPOSER_VERSION = "4.5s.3j";
const GENERATED_AT = "2026-08-26T22:30:00.000Z";
const EXPECTED_ASSETS = new Set(Object.keys(GRAPH_ASSETS));
const PHASE_IDS = new Set(productionQuestions.map(question => String(question.id)));

const EXPECTED_ASSET_METADATA = Object.freeze({
  "LABOR-01.webp": { bytes: 61218, width: 1651, height: 1182, sha256: "6ab49624f781b786c338440667347fa79c67a9f471e113c633d25d036b680946" },
  "LABOR-02.webp": { bytes: 74204, width: 1720, height: 1200, sha256: "e6ecbe54922ffbe4929e10494e307ae1092461e26896ebd00a3af81b22fbad73" },
  "LABOR-03.webp": { bytes: 65808, width: 1720, height: 1200, sha256: "7d7163c3fa8ba6d719c5b15c037c6636aeffae63194e7825ded3eae472d5eeea" },
  "LABOR-04.webp": { bytes: 72982, width: 1624, height: 1200, sha256: "7bb0871ba053742da20aa39dee70922a3e24ff0549588186dfcba6fa07317536" },
  "LABOR-05.webp": { bytes: 70446, width: 1653, height: 1200, sha256: "b34cf3cf4422b9411e0acb67c965d7950b61a693ef5008d00513b3bc91245aad" },
  "LABOR-06.webp": { bytes: 71208, width: 1617, height: 1200, sha256: "e5bebbfd9f2ab8eab68524fa99a689196544d41d4ad35ed110611f67638f2214" },
  "LABOR-07.webp": { bytes: 63756, width: 1642, height: 1182, sha256: "f6cc7e4327e537c2cc756453593d5522cdb90a0c0abdcd273ff867a8283e6d6e" },
  "LABOR-08.webp": { bytes: 69234, width: 1720, height: 1200, sha256: "d2ec0bd0a1c742236406ab92a73bb57408fd6f19ca5509306ea819b2918f7172" },
  "LABOR-09.webp": { bytes: 78764, width: 1624, height: 1200, sha256: "ef7b4edc7407c3be73a64749a0d76f9c5e513e358b9f4cf67fa108220533bd2c" }
});

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalize(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function readLibrary() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(libraryPath, "utf8"), sandbox, { filename: libraryPath });
  return sandbox.window.MQ_COMPOSER_LIBRARY;
}

function conceptEntries(module, conceptId = CONCEPT_ID) {
  const entries = [];
  for (const [pool, questions] of Object.entries(module?.questions || {})) {
    for (const question of questions || []) entries.push({ conceptId, pool, question });
  }
  for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
    for (const question of module?.[pool] || []) entries.push({ conceptId, pool, question });
  }
  return entries;
}

function allQuestionEntries(library) {
  return Object.entries(library.concepts || {}).flatMap(([conceptId, module]) => conceptEntries(module, conceptId));
}

function locateAsset(filename) {
  const final = path.join(finalDir, filename);
  if (fs.existsSync(final)) return final;
  return path.join(incomingDir, filename);
}

function webpDimensions(bytes) {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("Asset is not a valid WebP container.");
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}

function distribution(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] ?? "null";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function validateAuthorSource(library) {
  const errors = [];
  if (productionQuestions.length !== 240) errors.push(`Expected 240 questions; found ${productionQuestions.length}.`);
  if (productionQuestions.filter(question => question.graphRequired).length !== 64) errors.push("Expected 64 graph-dependent questions.");
  if (productionQuestions.some((question, index) => question.id !== ID_FIRST + index)) errors.push("Question IDs are not contiguous.");
  if (productionQuestions.at(-1)?.id !== ID_LAST) errors.push(`Final ID is not ${ID_LAST}.`);
  const existing = allQuestionEntries(library).filter(({ question }) => !PHASE_IDS.has(String(question.id)) && question.sourceCurationPhase !== PHASE);
  const existingIds = new Set(existing.map(({ question }) => String(question.id)));
  const existingStems = new Set(existing.map(({ question }) => normalize(question.q)));
  const legalTypes = new Set(["definition", "application", "interpretation", "calculation", "integration", "bridge", "graph_interpretation", "graph_calculation", "graph_integration", "graph_trap"]);
  const legalPools = new Set(["easy", "medium", "hard", "elite", "legendary", "easyBoss", "mediumBoss", "finalBoss", "legendaryBoss", "repairQuestions", "bridgeQuestions"]);
  for (const question of productionQuestions) {
    if (existingIds.has(String(question.id))) errors.push(`ID collision ${question.id}.`);
    if (existingStems.has(normalize(question.q))) errors.push(`Exact existing-stem collision ${question.id}.`);
    if (!OBJECTIVES[question.objective]) errors.push(`Unknown objective ${question.id}.`);
    if (!Object.values(SUBTOPICS).includes(question.tag)) errors.push(`Unknown subtopic ${question.id}.`);
    if (!legalTypes.has(question.type)) errors.push(`Unsupported type ${question.id}.`);
    if (!legalPools.has(question.pool)) errors.push(`Unsupported pool ${question.id}.`);
    if (!question.answer || question.distractors.length !== 3) errors.push(`Invalid answer set ${question.id}.`);
    if (new Set([question.answer, ...question.distractors].map(normalize)).size !== 4) errors.push(`Duplicate option ${question.id}.`);
    if (!question.feedback || question.feedback.split(/\s+/).length < 10) errors.push(`Underexplained feedback ${question.id}.`);
    if (question.graphRequired && !EXPECTED_ASSETS.has(question.asset)) errors.push(`Unknown graph asset ${question.id}.`);
    if (!question.graphRequired && question.asset) errors.push(`Unexpected graph asset ${question.id}.`);
  }
  const expectedAssets = { "LABOR-01.webp": 10, "LABOR-02.webp": 9, "LABOR-03.webp": 9, "LABOR-04.webp": 8, "LABOR-05.webp": 8, "LABOR-06.webp": 7, "LABOR-07.webp": 4, "LABOR-08.webp": 4, "LABOR-09.webp": 5, null: 176 };
  const actualAssets = distribution(productionQuestions, "asset");
  for (const [asset, count] of Object.entries(expectedAssets)) if (actualAssets[asset] !== count) errors.push(`Asset allocation ${asset}: ${actualAssets[asset]} instead of ${count}.`);
  for (const filename of EXPECTED_ASSETS) {
    const bytes = fs.readFileSync(locateAsset(filename));
    const dimensions = webpDimensions(bytes);
    const expected = EXPECTED_ASSET_METADATA[filename];
    if (bytes.length !== expected.bytes) errors.push(`Asset byte count changed ${filename}.`);
    if (sha256(bytes) !== expected.sha256) errors.push(`Asset hash changed ${filename}.`);
    if (dimensions.width !== expected.width || dimensions.height !== expected.height) errors.push(`Asset dimensions changed ${filename}.`);
  }
  const repairCount = productionQuestions.filter(question => question.pool === "repairQuestions").length;
  const bridgeCount = productionQuestions.filter(question => question.pool === "bridgeQuestions").length;
  if (repairCount !== 6 || bridgeCount !== 6) errors.push(`Support depth is ${repairCount} repair / ${bridgeCount} bridge.`);
  if (errors.length) throw new Error(errors.join("\n"));
}

function publishAssets() {
  fs.mkdirSync(finalDir, { recursive: true });
  for (const filename of EXPECTED_ASSETS) {
    const incoming = path.join(incomingDir, filename);
    const final = path.join(finalDir, filename);
    if (fs.existsSync(final)) {
      if (fs.existsSync(incoming) && !fs.readFileSync(incoming).equals(fs.readFileSync(final))) throw new Error(`Filename collision ${filename}.`);
      if (fs.existsSync(incoming)) fs.unlinkSync(incoming);
    } else {
      if (!fs.existsSync(incoming)) throw new Error(`Missing staged asset ${filename}.`);
      fs.renameSync(incoming, final);
    }
  }
  if (fs.existsSync(incomingDir)) {
    const remaining = fs.readdirSync(incomingDir);
    if (remaining.length) throw new Error(`Unexpected staged assets remain: ${remaining.join(", ")}`);
    fs.rmdirSync(incomingDir);
  }
}

function removePriorPhase(library) {
  delete library.concepts[CONCEPT_ID];
  library.registry.concepts = library.registry.concepts.filter(record => record.canonicalConceptId !== CONCEPT_ID);
  library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== PHASE && asset.conceptId !== CONCEPT_ID);
}

function rotateOptions(question) {
  const options = [...question.distractors];
  options.splice(question.id % 4, 0, question.answer);
  return options;
}

function publishQuestion(question) {
  const runtimePath = question.asset ? `question-assets/${CONCEPT_ID}/${question.asset}` : undefined;
  const asset = question.asset ? GRAPH_ASSETS[question.asset] : undefined;
  const safe = {
    id: String(question.id),
    sourceGame: "factor-markets-authoring",
    q: question.q,
    options: rotateOptions(question),
    tag: question.tag,
    type: question.type,
    objective: question.objective,
    difficulty: question.difficulty,
    conceptCluster: question.conceptCluster,
    primarySkill: question.primarySkill,
    secondarySkills: question.secondarySkills,
    repairSkill: question.repairSkill,
    commonError: question.commonError,
    feedback: question.feedback,
    sourceCurationPhase: PHASE,
    aHash: sha256(normalize(question.answer))
  };
  if (runtimePath) Object.assign(safe, {
    image: runtimePath,
    imageAlt: asset.imageAlt,
    graphDescription: asset.graphDescription,
    graphRequired: true,
    laborMarketScenario: asset.scenario
  });
  const sourceHash = sha256(stableStringify(safe));
  const bossTier = ({ easyBoss: "stageOne", mediumBoss: "stageTwo", finalBoss: "stageThree", legendaryBoss: "legendary" })[question.pool] || null;
  const instructionalRole = question.pool === "repairQuestions" ? "repair" : question.pool === "bridgeQuestions" ? "bridge" : "main";
  return {
    ...safe,
    canonicalId: String(question.id),
    sourceId: question.id,
    sourceChapter: [],
    sourcePool: question.pool,
    sourceHash,
    sourceOccurrences: [{
      sourceGame: "factor-markets-authoring",
      sourceFile: "build/faculty-build-composer/authoring/factor_markets_question_pool_author.mjs",
      sourceGlobal: "productionQuestions",
      sourcePool: question.pool,
      routeKey: question.objective,
      sourceRecordOrder: question.id - ID_FIRST,
      sourceId: question.id,
      sourceHash,
      sourceCurationPhase: PHASE
    }],
    primaryConceptId: CONCEPT_ID,
    secondaryConceptIds: [],
    familyConceptId: CONCEPT_ID,
    subtopicIds: [],
    instructionalRole,
    canonicalDifficulty: question.difficulty,
    originalSourcePool: question.pool,
    originalBossTier: bossTier
  };
}

function countRecords(entries) {
  const ordinary = entries.filter(({ pool }) => !["repairQuestions", "repairSeedQuestions", "bridgeQuestions"].includes(pool));
  const difficulty = entries.reduce((counts, { question }) => {
    const key = question.canonicalDifficulty || question.difficulty || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  return {
    ordinary,
    difficulty,
    role: {
      boss: entries.filter(({ pool }) => pool === "boss").length,
      bridge: entries.filter(({ pool }) => pool === "bridgeQuestions").length,
      calculation: ordinary.filter(({ question }) => /calculation/i.test(question.type || "")).length,
      elite: entries.filter(({ pool }) => pool === "elite").length,
      integration: ordinary.filter(({ question }) => /integration/i.test(question.type || "")).length,
      legendary: entries.filter(({ pool }) => pool === "legendary").length,
      legendaryBoss: entries.filter(({ pool }) => pool === "legendaryBoss").length,
      main: entries.filter(({ pool }) => ["easy", "medium", "hard"].includes(pool)).length,
      repair: entries.filter(({ pool }) => pool === "repairQuestions").length,
      repairSeed: entries.filter(({ pool }) => pool === "repairSeedQuestions").length
    }
  };
}

function createConceptModule() {
  const module = {
    schemaVersion: "1.0.0",
    canonicalConceptId: CONCEPT_ID,
    title: "Factor Markets",
    description: "Analyze marginal product and value of marginal product, firm hiring, derived labor demand, labor supply, competitive factor-market equilibrium, and relationships among productive inputs.",
    sourceChapters: [],
    legacyObjectives: [],
    objectiveLabels: { ...OBJECTIVES },
    questions: { easy: [], medium: [], hard: [], elite: [], legendary: [], calculation: [], boss: [], legendaryBoss: [] },
    repairQuestions: [], repairSeedQuestions: [], bridgeQuestions: [],
    directSkillRepairRoutes: {}, microSkillRepairPools: {}, skillRepairSeedPools: {}, microSkillBridgePools: {},
    assets: [], assetMetadata: [], assetPaths: [],
    standaloneRecommendation: "standalone-ready"
  };
  for (const authored of productionQuestions) {
    const published = publishQuestion(authored);
    if (authored.pool === "repairQuestions" || authored.pool === "bridgeQuestions") module[authored.pool].push(published);
    else {
      const targetPool = ["easyBoss", "mediumBoss", "finalBoss"].includes(authored.pool) ? "boss" : authored.pool;
      module.questions[targetPool].push(published);
    }
  }
  for (const question of module.repairQuestions) {
    module.microSkillRepairPools[question.primarySkill] ||= [];
    module.microSkillRepairPools[question.primarySkill].push(question.id);
  }
  for (const question of module.bridgeQuestions) {
    module.microSkillBridgePools[question.primarySkill] ||= [];
    module.microSkillBridgePools[question.primarySkill].push(question.id);
  }
  return module;
}

function registerAsset(library, module, filename) {
  const runtimePath = `question-assets/${CONCEPT_ID}/${filename}`;
  const sourceUrl = `data/${runtimePath}`;
  const bytes = fs.readFileSync(locateAsset(filename));
  const dimensions = webpDimensions(bytes);
  const authored = GRAPH_ASSETS[filename];
  const metadata = {
    conceptId: CONCEPT_ID, filename, sourceAssetPath: runtimePath, sourceUrl, runtimePath,
    sha256: sha256(bytes), sizeBytes: bytes.length, width: dimensions.width, height: dimensions.height,
    imageAlt: authored.imageAlt, graphDescription: authored.graphDescription, sourceCurationPhase: PHASE
  };
  module.assets.push(runtimePath);
  module.assetPaths.push(runtimePath);
  module.assetMetadata.push(metadata);
  library.assetInventory.push(metadata);
}

function createRegistryRecord(module) {
  const entries = conceptEntries(module);
  const counts = countRecords(entries);
  return {
    canonicalConceptId: CONCEPT_ID,
    title: "Factor Markets",
    description: module.description,
    includedSkills: [...new Set(entries.map(({ question }) => question.primarySkill).filter(Boolean))].sort(),
    excludedNeighboringSkills: [
      "Generic minimum-wage doctrine remains canonically housed in binding-price-floors; this bank uses the supplied labor graphs only for factor-market application.",
      "Unions, job search, efficiency wages, and unemployment institutions remain in labor-market-institutions.",
      "Short-run production and cost-curve construction remain in costs-of-production unless the question connects MPL to factor demand or hiring.",
      "Monopsony is limited to interpretation of the supplied graph and is not a central objective."
    ],
    prerequisiteConceptIds: ["market-equilibrium", "short-run-production"],
    relatedConceptIds: ["costs-of-production", "perfect-competition", "market-equilibrium", "binding-price-floors", "labor-market-institutions", "applications-of-elasticity"],
    sourceChapters: [], sourceObjectives: Object.keys(OBJECTIVES), sourceGames: ["factor-markets-authoring"],
    questionCountByRole: counts.role, questionCountByDifficulty: counts.difficulty,
    repairCoverage: { directSkillMatches: counts.role.repair, mainWithUsableSkill: counts.ordinary.length },
    bridgeCoverage: { directSkillMatches: counts.role.bridge, mainWithUsableSkill: counts.ordinary.length },
    calculationCoverage: counts.role.calculation,
    graphCoverage: counts.ordinary.filter(({ question }) => Boolean(question.image)).length,
    status: "active",
    notes: "Standalone 240-record production bank with nine LABOR assets. Existing minimum-wage, labor-institutions, costs, and elasticity records remain in their canonical concepts.",
    instructionalClassification: "Standalone-ready",
    coverageStatus: "ready-focused",
    coverageStatusLabel: "Ready for focused use",
    coverageStatusNote: "Production-depth factor-market bank with MPL, VMP, hiring, derived demand, labor supply, equilibrium, comparative statics, cross-factor links, repair, bridge, checkpoints, and limited applications.",
    coverageFloorVersion: SOURCE_VERSION,
    selectionRole: "standalone"
  };
}

function updateLibraryVersion(version) {
  const clean = version.replace(new RegExp(`-${PHASE}`, "g"), "");
  return `${clean}-${PHASE}`;
}

function refreshConceptReviews(reviewManifest, reviewSource, library) {
  const mapping = reviewManifest.concepts.find(item => item.canonicalConceptId === CONCEPT_ID);
  if (mapping?.diagnosable !== true || mapping?.primaryReviewCode !== "MICRO-57") throw new Error("Factor Markets lacks its dedicated Concept Review mapping.");
  if (!reviewSource.reviews.some(item => item.code === "MICRO-57" && item.canonicalConceptIds?.includes(CONCEPT_ID))) throw new Error("Missing MICRO-57 Concept Review source.");
}

function render() {
  const library = readLibrary();
  validateAuthorSource(library);
  removePriorPhase(library);
  const module = createConceptModule();
  library.concepts[CONCEPT_ID] = module;
  for (const filename of EXPECTED_ASSETS) registerAsset(library, module, filename);
  library.registry.concepts.push(createRegistryRecord(module));
  library.composerVersion = COMPOSER_VERSION;
  library.libraryVersion = updateLibraryVersion(library.libraryVersion);
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  library.conceptCount = Object.keys(library.concepts).length;
  library.canonicalQuestionCount = new Set(allQuestionEntries(library).map(({ question }) => String(question.id))).size;
  library.registry.generatedAt = GENERATED_AT;
  library.registry.libraryVersion = library.libraryVersion;
  library.registry.composerVersion = COMPOSER_VERSION;
  library.registry.canonicalQuestionCount = library.canonicalQuestionCount;
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stableStringify(library));
  library.registry.librarySha256 = library.librarySha256;
  const reviewManifest = JSON.parse(fs.readFileSync(reviewManifestPath, "utf8"));
  const reviewSource = JSON.parse(fs.readFileSync(reviewSourcePath, "utf8"));
  refreshConceptReviews(reviewManifest, reviewSource, library);
  const manifest = {
    assetCount: library.assetInventory.length,
    assets: library.assetInventory,
    conceptCount: library.conceptCount,
    canonicalQuestionCount: library.canonicalQuestionCount,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    generatedAt: GENERATED_AT
  };
  return {
    outputs: [
      [libraryPath, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
      [registryPath, `${JSON.stringify(library.registry, null, 2)}\n`],
      [manifestPath, `${JSON.stringify(manifest, null, 2)}\n`],
      [reviewManifestPath, `${JSON.stringify(reviewManifest, null, 2)}\n`],
      [reviewSourcePath, `${JSON.stringify(reviewSource, null, 2)}\n`]
    ],
    summary: {
      sourceVersion: SOURCE_VERSION,
      questions: productionQuestions.length,
      graphQuestions: productionQuestions.filter(question => question.graphRequired).length,
      assets: EXPECTED_ASSETS.size,
      canonicalQuestionCount: library.canonicalQuestionCount,
      assetInventoryCount: library.assetInventory.length,
      conceptQuestionCount: conceptEntries(module).length,
      conceptCount: library.conceptCount,
      librarySha256: library.librarySha256
    }
  };
}

validateAuthorSource(readLibrary());
if (process.argv.includes("--write")) publishAssets();
const generated = render();
if (process.argv.includes("--write")) {
  for (const [file, contents] of generated.outputs) fs.writeFileSync(file, contents, "utf8");
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  const stale = generated.outputs.filter(([file, contents]) => fs.readFileSync(file, "utf8") !== contents);
  if (stale.length) {
    console.error(`FAIL: stale factor-market outputs: ${stale.map(([file]) => path.relative(root, file)).join(", ")}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "PASS", ...generated.summary }, null, 2));
}
