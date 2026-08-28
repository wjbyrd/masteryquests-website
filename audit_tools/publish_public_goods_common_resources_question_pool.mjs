import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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
} from "../build/faculty-build-composer/authoring/public_goods_common_resources_question_pool_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composerRoot = path.join(root, "build", "faculty-build-composer");
const libraryPath = path.join(composerRoot, "data", "composer_library.js");
const registryPath = path.join(composerRoot, "data", "composer_registry.json");
const manifestPath = path.join(composerRoot, "data", "composer_library_manifest.json");
const reviewManifestPath = path.join(composerRoot, "data", "concept-reviews", "manifest.json");
const reviewSourcePath = path.join(composerRoot, "data", "concept-reviews", "full-library-production", "concept_review_source.json");
const incomingDir = path.join(composerRoot, "data", "question-assets", "_incoming-public-goods");
const finalDir = path.join(composerRoot, "data", "question-assets", PARENT_CONCEPT_ID);
const COMPOSER_VERSION = "4.5s.3i";
const GENERATED_AT = "2026-08-26T21:00:00.000Z";
const EXTERNALITIES_PHASE = "phase-externalities-question-pool-v1";
const EXPECTED_ASSETS = new Set(Object.keys(GRAPH_ASSETS));
const PHASE_IDS = new Set(Array.from({ length: ID_LAST - ID_FIRST + 1 }, (_, index) => String(ID_FIRST + index)));
const EXPECTED_ASSET_HASHES = Object.freeze({
  "PUBLIC-01.webp": "fb2bc35d6456da6b40bef235909b878467f3172ea5daf1a1a129a1fc3cc399ab",
  "PUBLIC-02.webp": "5e046ff8d1d2833ba1c45bf56733b40f6698a89a8afa6abfd011e56ed0eb0eac",
  "PUBLIC-03.webp": "35ce117935f176216b19c83d18f3b7822245273ba1b90f5981574d55f379e25c",
  "PUBLIC-04.webp": "ade235c1c2ec006e997f95cbaa3e6139ab5be69bb36c029703812eed030f0dfc",
  "PUBLIC-05.webp": "b575b8870460310b96368bef71e4bbcd0ea44a73819fb72f2e7f16a2ae480b6d"
});

function normalize(value) {
  return String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function readLibrary() {
  const source = fs.readFileSync(libraryPath, "utf8");
  return JSON.parse(source.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/, "").replace(/;\s*$/, ""));
}

function allQuestionEntries(library) {
  const entries = [];
  for (const [conceptId, concept] of Object.entries(library.concepts)) {
    for (const [pool, questions] of Object.entries(concept.questions || {})) {
      for (const question of questions || []) entries.push({ conceptId, pool, question });
    }
    for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
      for (const question of concept[pool] || []) entries.push({ conceptId, pool, question });
    }
  }
  return entries;
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

function locateAsset(filename) {
  const finalPath = path.join(finalDir, filename);
  const incomingPath = path.join(incomingDir, filename);
  if (fs.existsSync(finalPath)) return finalPath;
  if (fs.existsSync(incomingPath)) return incomingPath;
  throw new Error(`Missing public-goods graph asset: ${filename}`);
}

function webpDimensions(bytes) {
  if (bytes.length < 30 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("Asset is not a valid WebP container.");
  }
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }
  throw new Error(`Unsupported WebP chunk: ${chunk}`);
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
  if (productionQuestions.length !== 160) errors.push(`Expected 160 questions; found ${productionQuestions.length}`);
  if (productionQuestions.filter(question => question.graphRequired).length !== 43) errors.push("Expected 43 graph-dependent questions after manual audit.");
  if (productionQuestions.some((question, index) => question.id !== ID_FIRST + index)) errors.push("Question IDs are not contiguous.");
  const existing = allQuestionEntries(library).filter(({ question }) => !PHASE_IDS.has(String(question.id)));
  const existingIds = new Set(existing.map(({ question }) => String(question.id)));
  const existingStems = new Set(existing.map(({ question }) => normalize(question.q)));
  const legalTypes = new Set(["definition", "application", "interpretation", "calculation", "integration", "bridge", "graph_interpretation", "graph_calculation", "graph_integration", "graph_trap"]);
  for (const question of productionQuestions) {
    if (existingIds.has(String(question.id))) errors.push(`ID collision: ${question.id}`);
    if (existingStems.has(normalize(question.q))) errors.push(`Exact stem collision: ${question.id}`);
    if (!OBJECTIVES[question.objective]) errors.push(`Unknown objective: ${question.id}`);
    if (!Object.values(SUBTOPICS).includes(question.tag)) errors.push(`Unknown subtopic: ${question.id}`);
    if (!legalTypes.has(question.type)) errors.push(`Unsupported type: ${question.id}`);
    if (!question.answer || question.distractors.length !== 3) errors.push(`Invalid answer set: ${question.id}`);
    if (new Set([question.answer, ...question.distractors].map(normalize)).size !== 4) errors.push(`Duplicate answer option: ${question.id}`);
    if (!question.feedback || question.feedback.split(/\s+/).length < 10) errors.push(`Underexplained feedback: ${question.id}`);
    if (question.graphRequired && !EXPECTED_ASSETS.has(question.asset)) errors.push(`Unknown graph asset: ${question.id}`);
    if (!question.graphRequired && question.asset) errors.push(`Unexpected graph asset: ${question.id}`);
  }
  const expectedAssetDistribution = { "PUBLIC-01.webp": 9, "PUBLIC-02.webp": 10, "PUBLIC-03.webp": 8, "PUBLIC-04.webp": 8, "PUBLIC-05.webp": 8, null: 117 };
  const actualAssetDistribution = distribution(productionQuestions, "asset");
  for (const [asset, count] of Object.entries(expectedAssetDistribution)) {
    if (actualAssetDistribution[asset] !== count) errors.push(`Asset allocation ${asset}: ${actualAssetDistribution[asset]} instead of ${count}`);
  }
  for (const filename of EXPECTED_ASSETS) {
    const bytes = fs.readFileSync(locateAsset(filename));
    const dimensions = webpDimensions(bytes);
    if (sha256(bytes) !== EXPECTED_ASSET_HASHES[filename]) errors.push(`Asset hash changed: ${filename}`);
    if (dimensions.width !== 1720 || dimensions.height !== 1200) errors.push(`Asset dimensions changed: ${filename}`);
  }
  const repairCount = productionQuestions.filter(question => question.pool === "repairQuestions").length;
  const bridgeCount = productionQuestions.filter(question => question.pool === "bridgeQuestions").length;
  if (repairCount !== 4 || bridgeCount !== 4) errors.push(`Support depth is ${repairCount} repair / ${bridgeCount} bridge.`);
  if (errors.length) throw new Error(errors.join("\n"));
}

function publishAssets() {
  fs.mkdirSync(finalDir, { recursive: true });
  for (const filename of EXPECTED_ASSETS) {
    const incoming = path.join(incomingDir, filename);
    const final = path.join(finalDir, filename);
    if (fs.existsSync(final)) {
      if (fs.existsSync(incoming) && !fs.readFileSync(incoming).equals(fs.readFileSync(final))) throw new Error(`Filename collision: ${filename}`);
      if (fs.existsSync(incoming)) fs.unlinkSync(incoming);
    } else {
      if (!fs.existsSync(incoming)) throw new Error(`Missing staged asset: ${filename}`);
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
  const parent = library.concepts[PARENT_CONCEPT_ID];
  for (const [pool, questions] of Object.entries(parent.questions || {})) {
    parent.questions[pool] = questions.filter(question => !PHASE_IDS.has(String(question.id)) && question.sourceCurationPhase !== PHASE);
  }
  for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
    parent[pool] = (parent[pool] || []).filter(question => !PHASE_IDS.has(String(question.id)) && question.sourceCurationPhase !== PHASE);
  }
  parent.assetMetadata = (parent.assetMetadata || []).filter(asset => asset.sourceCurationPhase !== PHASE);
  parent.assets = (parent.assets || []).filter(runtimePath => !/\/PUBLIC-0[1-5]\.webp$/.test(runtimePath));
  parent.assetPaths = (parent.assetPaths || []).filter(runtimePath => !/\/PUBLIC-0[1-5]\.webp$/.test(runtimePath));
  library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== PHASE);
}

function rotateOptions(question) {
  const options = [...question.distractors];
  options.splice(question.id % 4, 0, question.answer);
  return options;
}

function publishQuestion(question) {
  const runtimePath = question.asset ? `question-assets/${PARENT_CONCEPT_ID}/${question.asset}` : undefined;
  const asset = question.asset ? GRAPH_ASSETS[question.asset] : undefined;
  const safe = {
    id: String(question.id),
    sourceGame: "public-goods-common-resources-authoring",
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
    publicGoodsScenario: asset.scenario
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
      sourceGame: "public-goods-common-resources-authoring",
      sourceFile: "build/faculty-build-composer/authoring/public_goods_common_resources_question_pool_author.mjs",
      sourceGlobal: "productionQuestions",
      sourcePool: question.pool,
      routeKey: question.objective,
      sourceRecordOrder: question.id - ID_FIRST,
      sourceId: question.id,
      sourceHash,
      sourceCurationPhase: PHASE
    }],
    primaryConceptId: PARENT_CONCEPT_ID,
    secondaryConceptIds: [],
    familyConceptId: PARENT_CONCEPT_ID,
    subtopicIds: [CONCEPT_ID],
    instructionalRole,
    canonicalDifficulty: question.difficulty,
    originalSourcePool: question.pool,
    originalBossTier: bossTier
  };
}

function registerAsset(library, filename) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  const runtimePath = `question-assets/${PARENT_CONCEPT_ID}/${filename}`;
  const sourceUrl = `data/${runtimePath}`;
  const bytes = fs.readFileSync(locateAsset(filename));
  const dimensions = webpDimensions(bytes);
  const authored = GRAPH_ASSETS[filename];
  const metadata = {
    conceptId: PARENT_CONCEPT_ID,
    filename,
    sourceAssetPath: runtimePath,
    sourceUrl,
    runtimePath,
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
    width: dimensions.width,
    height: dimensions.height,
    imageAlt: authored.imageAlt,
    graphDescription: authored.graphDescription,
    sourceCurationPhase: PHASE
  };
  parent.assets ||= [];
  parent.assetPaths ||= [];
  parent.assetMetadata ||= [];
  if (!parent.assets.includes(runtimePath)) parent.assets.push(runtimePath);
  if (!parent.assetPaths.includes(runtimePath)) parent.assetPaths.push(runtimePath);
  parent.assetMetadata.push(metadata);
  library.assetInventory.push(metadata);
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
      boss: entries.filter(({ pool }) => ["boss", "easyBoss", "mediumBoss", "finalBoss"].includes(pool)).length,
      bridge: entries.filter(({ pool }) => pool === "bridgeQuestions").length,
      calculation: ordinary.filter(({ pool, question }) => pool === "calculation" || /calculation/i.test(question.type || "")).length,
      elite: entries.filter(({ pool }) => pool === "elite").length,
      integration: ordinary.filter(({ pool, question }) => pool === "integration" || /integration/i.test(question.type || "")).length,
      legendary: entries.filter(({ pool }) => pool === "legendary").length,
      legendaryBoss: entries.filter(({ pool }) => pool === "legendaryBoss").length,
      main: entries.filter(({ pool }) => ["easy", "medium", "hard"].includes(pool)).length,
      repair: entries.filter(({ pool }) => pool === "repairQuestions").length,
      repairSeed: entries.filter(({ pool }) => pool === "repairSeedQuestions").length
    }
  };
}

function refreshRegistry(library) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  const parentEntries = conceptEntries(parent);
  const parentCounts = countRecords(parentEntries);
  const parentRecord = library.registry.concepts.find(record => record.canonicalConceptId === PARENT_CONCEPT_ID);
  if (!parentRecord) throw new Error(`Missing registry parent ${PARENT_CONCEPT_ID}`);
  Object.assign(parentRecord, {
    questionCountByRole: parentCounts.role,
    questionCountByDifficulty: parentCounts.difficulty,
    repairCoverage: { directSkillMatches: parentCounts.role.repair, mainWithUsableSkill: parentCounts.ordinary.length },
    bridgeCoverage: { directSkillMatches: parentCounts.role.bridge, mainWithUsableSkill: parentCounts.ordinary.length },
    calculationCoverage: parentCounts.role.calculation,
    graphCoverage: parentCounts.ordinary.filter(({ question }) => Boolean(question.image)).length
  });

  const entries = parentEntries.filter(({ question }) => (question.subtopicIds || []).includes(CONCEPT_ID));
  const counts = countRecords(entries);
  const record = library.registry.concepts.find(item => item.canonicalConceptId === CONCEPT_ID);
  if (!record) throw new Error(`Missing registry concept ${CONCEPT_ID}`);
  Object.assign(record, {
    title: "Public Goods and Common Resources",
    description: "Analyze excludability, rivalry, goods classification, free riding, private and efficient public-good provision, common-resource overuse, and property-rights incentives.",
    includedSkills: [...new Set(entries.map(({ question }) => question.primarySkill).filter(Boolean))].sort(),
    sourceObjectives: [...new Set(entries.map(({ question }) => question.objective).filter(Boolean))],
    sourceGames: [...new Set(entries.map(({ question }) => question.sourceGame).filter(Boolean))],
    questionCountByRole: counts.role,
    questionCountByDifficulty: counts.difficulty,
    repairCoverage: { directSkillMatches: counts.role.repair, mainWithUsableSkill: counts.ordinary.length },
    bridgeCoverage: { directSkillMatches: counts.role.bridge, mainWithUsableSkill: counts.ordinary.length },
    calculationCoverage: counts.role.calculation,
    graphCoverage: counts.ordinary.filter(({ question }) => Boolean(question.image)).length,
    status: "active",
    notes: "Dedicated Public Goods and Common Resources selector containing the retained 16-record legacy slice plus a 160-record production bank and five public-good graph assets.",
    instructionalClassification: "Standalone-ready",
    coverageStatus: "ready-focused",
    coverageStatusLabel: "Ready for focused use",
    coverageStatusNote: "Production bank with classification, free-rider, private-provision, cost-benefit, common-resource, property-rights, graph, repair, bridge, and checkpoint depth.",
    coverageFloorVersion: SOURCE_VERSION,
    selectionRole: "standalone"
  });
  const module = library.concepts[CONCEPT_ID];
  module.standaloneRecommendation = "standalone-ready";
}

function updateLibraryVersion(version) {
  const withoutPhase = version.replace(new RegExp(`-${PHASE}`, "g"), "");
  const suffix = `-${EXTERNALITIES_PHASE}`;
  return withoutPhase.endsWith(suffix)
    ? `${withoutPhase.slice(0, -suffix.length)}-${PHASE}${suffix}`
    : `${withoutPhase}-${PHASE}`;
}

function refreshConceptReviews(reviewManifest, reviewSource, library) {
  const mapping = reviewManifest.concepts.find(item => item.canonicalConceptId === CONCEPT_ID);
  if (mapping?.diagnosable !== true || mapping?.primaryReviewCode !== "MICRO-55") throw new Error("Public Goods and Common Resources lacks its dedicated Concept Review mapping.");
  if (!reviewSource.reviews.some(item => item.code === "MICRO-55" && item.canonicalConceptIds?.includes(CONCEPT_ID))) throw new Error("Missing MICRO-55 Concept Review source.");
}

function render() {
  const library = readLibrary();
  validateAuthorSource(library);
  removePriorPhase(library);
  const parent = library.concepts[PARENT_CONCEPT_ID];
  parent.objectiveLabels = { ...(parent.objectiveLabels || {}), ...OBJECTIVES };
  for (const authored of productionQuestions) {
    const published = publishQuestion(authored);
    if (authored.pool === "repairQuestions" || authored.pool === "bridgeQuestions") parent[authored.pool].push(published);
    else {
      const targetPool = ["easyBoss", "mediumBoss", "finalBoss"].includes(authored.pool) ? "boss" : authored.pool;
      parent.questions[targetPool] ||= [];
      parent.questions[targetPool].push(published);
    }
  }
  for (const filename of EXPECTED_ASSETS) registerAsset(library, filename);
  library.composerVersion = COMPOSER_VERSION;
  library.libraryVersion = updateLibraryVersion(library.libraryVersion);
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  library.conceptCount = Object.keys(library.concepts).length;
  library.canonicalQuestionCount = new Set(allQuestionEntries(library).map(({ question }) => String(question.id))).size;
  refreshRegistry(library);
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
      conceptQuestionCount: conceptEntries(parent).filter(({ question }) => (question.subtopicIds || []).includes(CONCEPT_ID)).length,
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
    console.error(`FAIL: stale public-goods outputs: ${stale.map(([file]) => path.relative(root, file)).join(", ")}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "PASS", ...generated.summary }, null, 2));
}
