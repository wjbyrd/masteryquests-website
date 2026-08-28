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
  TAXONOMY_CONCEPTS,
  LEGACY_SUBTOPIC_ASSIGNMENTS,
  OBJECTIVES,
  GRAPH_ASSETS,
  ordinaryQuestions
} from "../build/faculty-build-composer/authoring/externalities_question_pool_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composerRoot = path.join(root, "build", "faculty-build-composer");
const libraryPath = path.join(composerRoot, "data", "composer_library.js");
const registryPath = path.join(composerRoot, "data", "composer_registry.json");
const manifestPath = path.join(composerRoot, "data", "composer_library_manifest.json");
const reviewManifestPath = path.join(composerRoot, "data", "concept-reviews", "manifest.json");
const reviewSourcePath = path.join(composerRoot, "data", "concept-reviews", "full-library-production", "concept_review_source.json");
const incomingDir = path.join(composerRoot, "data", "question-assets", "_incoming-externalities");
const finalDir = path.join(composerRoot, "data", "question-assets", PARENT_CONCEPT_ID);
const COMPOSER_VERSION = "4.5s.3i";
const GENERATED_AT = "2026-08-26T18:00:00.000Z";
const EXPECTED_ASSETS = new Set(Object.keys(GRAPH_ASSETS));
const PHASE_IDS = new Set(Array.from({ length: ID_LAST - ID_FIRST + 1 }, (_, index) => String(ID_FIRST + index)));
const CHILD_CONCEPT_IDS = Object.freeze(Object.keys(TAXONOMY_CONCEPTS));
const CHILD_CONCEPT_SET = new Set(CHILD_CONCEPT_IDS);

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
    for (const key of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
      for (const question of concept[key] || []) entries.push({ conceptId, pool: key, question });
    }
  }
  return entries;
}

function conceptQuestionEntries(concept) {
  const entries = [];
  for (const [pool, questions] of Object.entries(concept.questions || {})) {
    for (const question of questions || []) entries.push({ pool, question });
  }
  for (const key of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) {
    for (const question of concept[key] || []) entries.push({ pool: key, question });
  }
  return entries;
}

function locateAsset(filename) {
  const finalPath = path.join(finalDir, filename);
  const incomingPath = path.join(incomingDir, filename);
  if (fs.existsSync(finalPath)) return finalPath;
  if (fs.existsSync(incomingPath)) return incomingPath;
  throw new Error(`Missing externalities graph asset: ${filename}`);
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

function validateAuthorSource(library) {
  const errors = [];
  if (ordinaryQuestions.length !== 160) errors.push(`Expected 160 questions; found ${ordinaryQuestions.length}`);
  if (ordinaryQuestions.filter(question => question.graphRequired).length !== 104) errors.push("Expected 104 graph questions.");
  const expectedIds = Array.from({ length: 160 }, (_, index) => ID_FIRST + index);
  if (ordinaryQuestions.some((question, index) => question.id !== expectedIds[index])) errors.push("Question IDs are not contiguous.");
  const existing = allQuestionEntries(library).filter(({ question }) => !PHASE_IDS.has(String(question.id)));
  const ids = new Set(existing.map(({ question }) => String(question.id)));
  const stems = new Set(existing.map(({ question }) => normalize(question.q)));
  for (const question of ordinaryQuestions) {
    if (ids.has(String(question.id))) errors.push(`ID collision: ${question.id}`);
    if (stems.has(normalize(question.q))) errors.push(`Exact stem collision: ${question.id}`);
    if (!OBJECTIVES[question.objective]) errors.push(`Unknown objective: ${question.id}`);
    if (!["easy", "medium", "hard", "elite", "legendary"].includes(question.difficulty)) errors.push(`Invalid difficulty: ${question.id}`);
    if (question.distractors.length < 3) errors.push(`Too few distractors: ${question.id}`);
    if (new Set([question.answer, ...question.distractors.slice(0, 3)].map(normalize)).size !== 4) errors.push(`Duplicate answer option: ${question.id}`);
    if (question.graphRequired && !EXPECTED_ASSETS.has(question.asset)) errors.push(`Unknown graph asset: ${question.id}`);
  }
  const available = EXPECTED_ASSETS.size === 13 && [...EXPECTED_ASSETS].every(filename => fs.existsSync(locateAsset(filename)));
  if (!available) errors.push("Expected all 13 graph assets.");
  const hashes = new Map();
  for (const filename of EXPECTED_ASSETS) {
    const bytes = fs.readFileSync(locateAsset(filename));
    const hash = sha256(bytes);
    if (hashes.has(hash)) errors.push(`Accidental duplicate assets: ${hashes.get(hash)} and ${filename}`);
    hashes.set(hash, filename);
    const dimensions = webpDimensions(bytes);
    if (dimensions.width !== 1720 || dimensions.height !== 1200) errors.push(`Unexpected dimensions: ${filename}`);
  }
  const assignedIds = Object.values(LEGACY_SUBTOPIC_ASSIGNMENTS).flat();
  if (new Set(assignedIds).size !== assignedIds.length) errors.push("A legacy Market Failures record is assigned to multiple child concepts.");
  const parent = library.concepts[PARENT_CONCEPT_ID];
  if (!parent) errors.push(`Missing compatibility parent: ${PARENT_CONCEPT_ID}`);
  const existingIds = new Set(conceptQuestionEntries(parent || {}).map(({ question }) => String(question.id)));
  for (const id of assignedIds) if (!existingIds.has(id)) errors.push(`Missing legacy taxonomy record: ${id}`);
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
  const concept = library.concepts[PARENT_CONCEPT_ID];
  for (const [pool, questions] of Object.entries(concept.questions || {})) {
    concept.questions[pool] = questions.filter(question => !PHASE_IDS.has(String(question.id)));
  }
  concept.assetMetadata = (concept.assetMetadata || []).filter(asset => asset.sourceCurationPhase !== PHASE);
  concept.assets = (concept.assets || []).filter(runtimePath => !runtimePath.startsWith(`question-assets/${PARENT_CONCEPT_ID}/EXTERNALITY-`));
  concept.assetPaths = (concept.assetPaths || []).filter(runtimePath => !runtimePath.startsWith(`question-assets/${PARENT_CONCEPT_ID}/EXTERNALITY-`));
  library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== PHASE);
  for (const id of CHILD_CONCEPT_IDS) delete library.concepts[id];
  library.registry.concepts = library.registry.concepts.filter(conceptRecord => !CHILD_CONCEPT_SET.has(conceptRecord.canonicalConceptId));
}

function assignLegacySubtopics(library) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  const assignmentById = new Map();
  for (const [conceptId, ids] of Object.entries(LEGACY_SUBTOPIC_ASSIGNMENTS)) {
    for (const id of ids) assignmentById.set(String(id), conceptId);
  }
  const counts = Object.fromEntries(CHILD_CONCEPT_IDS.map(id => [id, 0]));
  for (const { question } of conceptQuestionEntries(parent)) {
    const preserved = (question.subtopicIds || []).filter(id => !CHILD_CONCEPT_SET.has(id));
    const assigned = assignmentById.get(String(question.id));
    question.subtopicIds = assigned ? [...preserved, assigned] : preserved;
    if (assigned) {
      question.familyConceptId = PARENT_CONCEPT_ID;
      counts[assigned] += 1;
    }
  }
  return counts;
}

function rotateOptions(question) {
  const options = [...question.distractors.slice(0, 3)];
  options.splice(question.id % 4, 0, question.answer);
  return options;
}

function publishQuestion(question) {
  const options = rotateOptions(question);
  const runtimePath = question.asset ? `question-assets/${PARENT_CONCEPT_ID}/${question.asset}` : undefined;
  const asset = question.asset ? GRAPH_ASSETS[question.asset] : undefined;
  const safe = {
    id: String(question.id),
    sourceGame: "externalities-authoring",
    q: question.q,
    options,
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
    graphAssetClass: asset.assetClass,
    externalityScenario: asset.scenario
  });
  const sourceHash = sha256(stableStringify(safe));
  return {
    ...safe,
    canonicalId: String(question.id),
    sourceId: question.id,
    sourceChapter: [],
    sourcePool: question.difficulty,
    sourceHash,
    sourceOccurrences: [{
      sourceGame: "externalities-authoring",
      sourceFile: "build/faculty-build-composer/authoring/externalities_question_pool_author.mjs",
      sourceGlobal: "ordinaryQuestions",
      sourcePool: question.difficulty,
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
    instructionalRole: "main",
    canonicalDifficulty: question.difficulty,
    originalSourcePool: question.difficulty,
    originalBossTier: null
  };
}

function registerAsset(library, filename) {
  const concept = library.concepts[PARENT_CONCEPT_ID];
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
  concept.assets ||= [];
  concept.assetPaths ||= [];
  concept.assetMetadata ||= [];
  if (!concept.assets.includes(runtimePath)) concept.assets.push(runtimePath);
  if (!concept.assetPaths.includes(runtimePath)) concept.assetPaths.push(runtimePath);
  concept.assetMetadata.push(metadata);
  library.assetInventory.push(metadata);
}

function countRegistryRecords(entries) {
  const ordinary = entries.filter(({ pool }) => !["repairQuestions", "repairSeedQuestions", "bridgeQuestions"].includes(pool));
  const support = entries.filter(({ pool }) => ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"].includes(pool));
  const difficultyCounts = {};
  for (const { pool, question } of entries) {
    const difficulty = question.canonicalDifficulty || question.difficulty || pool || "unknown";
    difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
  }
  return {
    ordinary,
    support,
    questionCountByRole: {
      boss: entries.filter(({ pool }) => pool === "boss").length,
      bridge: entries.filter(({ pool }) => pool === "bridgeQuestions").length,
      calculation: entries.filter(({ pool }) => pool === "calculation").length,
      elite: entries.filter(({ pool }) => pool === "elite").length,
      integration: entries.filter(({ pool }) => pool === "integration").length,
      legendary: entries.filter(({ pool }) => pool === "legendary").length,
      legendaryBoss: entries.filter(({ pool }) => pool === "legendaryBoss").length,
      main: entries.filter(({ pool }) => ["easy", "medium", "hard"].includes(pool)).length,
      repair: entries.filter(({ pool }) => pool === "repairQuestions").length,
      repairSeed: entries.filter(({ pool }) => pool === "repairSeedQuestions").length
    },
    difficultyCounts
  };
}

function createDerivedConcepts(library) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  for (const [conceptId, definition] of Object.entries(TAXONOMY_CONCEPTS)) {
    library.concepts[conceptId] = {
      schemaVersion: parent.schemaVersion,
      canonicalConceptId: conceptId,
      title: definition.title,
      description: definition.description,
      derivedFromConceptId: PARENT_CONCEPT_ID,
      subtopicFilterId: conceptId,
      familyConceptId: PARENT_CONCEPT_ID,
      assetConceptId: PARENT_CONCEPT_ID,
      standaloneRecommendation: conceptId === CONCEPT_ID ? "standalone-ready" : "supporting-subtopic",
      assets: [],
      assetPaths: [],
      assetMetadata: []
    };
  }
}

function replaceLegacyRelatedIds(ids) {
  const source = Array.isArray(ids) ? ids : [];
  return [...new Set(source.flatMap(id => id === PARENT_CONCEPT_ID ? CHILD_CONCEPT_IDS : [id]))];
}

function childRegistryRecord(library, conceptId) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  const definition = TAXONOMY_CONCEPTS[conceptId];
  const entries = conceptQuestionEntries(parent).filter(({ question }) => (question.subtopicIds || []).includes(conceptId));
  const counts = countRegistryRecords(entries);
  const ordinaryCount = counts.ordinary.length;
  const repairCount = entries.filter(({ pool }) => pool === "repairQuestions").length;
  const bridgeCount = entries.filter(({ pool }) => pool === "bridgeQuestions").length;
  const externalities = conceptId === CONCEPT_ID;
  return {
    canonicalConceptId: conceptId,
    title: definition.title,
    description: definition.description,
    includedSkills: [...new Set(entries.map(({ question }) => question.primarySkill).filter(Boolean))].sort(),
    excludedNeighboringSkills: externalities
      ? ["Public-good, common-resource, and general market-power questions use separate Composer concepts."]
      : ["Detailed externalities and established market-structure families remain in their own concepts."],
    prerequisiteConceptIds: ["competitive-markets", "price-signals"],
    relatedConceptIds: CHILD_CONCEPT_IDS.filter(id => id !== conceptId),
    sourceChapters: [...new Set(entries.flatMap(({ question }) => question.sourceChapter || []))],
    sourceObjectives: [...new Set(entries.map(({ question }) => question.objective).filter(Boolean))],
    sourceGames: [...new Set(entries.map(({ question }) => question.sourceGame).filter(Boolean))],
    questionCountByRole: counts.questionCountByRole,
    questionCountByDifficulty: counts.difficultyCounts,
    repairCoverage: { directSkillMatches: repairCount, mainWithUsableSkill: ordinaryCount },
    bridgeCoverage: { directSkillMatches: bridgeCount, mainWithUsableSkill: ordinaryCount },
    calculationCoverage: counts.ordinary.filter(({ pool, question }) => pool === "calculation" || /calculation/i.test(question.type || "")).length,
    graphCoverage: counts.ordinary.filter(({ question }) => Boolean(question.image)).length,
    status: "active",
    notes: externalities
      ? "Dedicated Externalities selector containing the intact 160-question production pool plus pre-existing externality records."
      : `Dedicated ${definition.title} selector containing only reclassified legacy records; no expansion questions were added.`,
    instructionalClassification: externalities ? "Standalone-ready" : "Supporting / Light-Touch",
    coverageStatus: externalities ? "ready-focused" : "supporting-subtopic",
    coverageStatusLabel: externalities ? "Ready for focused use" : "Best paired with related concepts",
    coverageStatusNote: externalities
      ? "Production externalities bank with graph, policy, calculation, private-solution, and Coase coverage."
      : "Existing records were separated from the legacy Market Failures pool without expanding the bank.",
    coverageFloorVersion: SOURCE_VERSION,
    selectionRole: "standalone"
  };
}

function refreshRegistry(library) {
  const parent = library.concepts[PARENT_CONCEPT_ID];
  const parentIndex = library.registry.concepts.findIndex(concept => concept.canonicalConceptId === PARENT_CONCEPT_ID);
  if (parentIndex < 0) throw new Error(`Missing registry concept: ${PARENT_CONCEPT_ID}`);
  const parentRegistry = library.registry.concepts[parentIndex];
  const parentCounts = countRegistryRecords(conceptQuestionEntries(parent));
  Object.assign(parentRegistry, {
    title: "Market Failures",
    description: "Legacy compatibility parent for migrated Market Failures recipes and the shared organizational review sheet.",
    includedSkills: [...new Set(parentCounts.ordinary.map(({ question }) => question.primarySkill).filter(Boolean))].sort(),
    relatedConceptIds: replaceLegacyRelatedIds(parentRegistry.relatedConceptIds),
    questionCountByRole: parentCounts.questionCountByRole,
    questionCountByDifficulty: parentCounts.difficultyCounts,
    repairCoverage: {
      directSkillMatches: parentCounts.questionCountByRole.repair,
      mainWithUsableSkill: parentCounts.ordinary.length
    },
    bridgeCoverage: {
      directSkillMatches: parentCounts.questionCountByRole.bridge,
      mainWithUsableSkill: parentCounts.ordinary.length
    },
    calculationCoverage: parentCounts.ordinary.filter(({ pool, question }) => pool === "calculation" || /calculation/i.test(question.type || "")).length,
    graphCoverage: parentCounts.ordinary.filter(({ question }) => Boolean(question.image)).length,
    status: "legacy",
    notes: "Nonselectable compatibility parent. Faculty select Externalities, Public Goods and Common Resources, or Market Power; legacy recipes migrate to those concepts.",
    instructionalClassification: "Legacy compatibility parent",
    coverageStatus: "retired-selector",
    coverageStatusLabel: "Replaced by separate concepts",
    coverageStatusNote: "Not shown as a faculty-selectable card.",
    childConceptIds: CHILD_CONCEPT_IDS,
    selectionRole: "legacy-parent"
  });
  const childRecords = CHILD_CONCEPT_IDS.map(id => childRegistryRecord(library, id));
  library.registry.concepts.splice(parentIndex + 1, 0, ...childRecords);
  for (const record of library.registry.concepts) {
    if (record.canonicalConceptId === PARENT_CONCEPT_ID || CHILD_CONCEPT_SET.has(record.canonicalConceptId)) continue;
    record.relatedConceptIds = replaceLegacyRelatedIds(record.relatedConceptIds);
  }
}

function refreshConceptReviews(reviewManifest, reviewSource, libraryVersion) {
  const expected = new Map([["externalities", "MICRO-54"], ["public-goods-and-common-resources", "MICRO-55"], ["market-power", "MICRO-56"]]);
  for (const [conceptId, code] of expected) {
    const mapping = reviewManifest.concepts.find(item => item.canonicalConceptId === conceptId);
    if (mapping?.primaryReviewCode !== code) throw new Error(`Concept Review source is stale for ${conceptId}.`);
    if (!reviewSource.reviews.some(item => item.code === code && item.canonicalConceptIds?.includes(conceptId))) throw new Error(`Missing dedicated Concept Review source ${code}.`);
  }
  const legacy = reviewManifest.reviews.find(item => item.code === "MICRO-03");
  if (!legacy || (legacy.canonicalConceptIds || []).length) throw new Error("MICRO-03 must remain preserved and unreachable from active children.");
}

function render() {
  const library = readLibrary();
  validateAuthorSource(library);
  removePriorPhase(library);
  assignLegacySubtopics(library);
  const concept = library.concepts[PARENT_CONCEPT_ID];
  concept.objectiveLabels = { ...(concept.objectiveLabels || {}), ...OBJECTIVES };
  for (const question of ordinaryQuestions) concept.questions[question.difficulty].push(publishQuestion(question));
  for (const filename of EXPECTED_ASSETS) registerAsset(library, filename);
  createDerivedConcepts(library);
  library.composerVersion = COMPOSER_VERSION;
  library.libraryVersion = `${library.libraryVersion.replace(new RegExp(`-${PHASE}$`), "")}-${PHASE}`;
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
  refreshConceptReviews(reviewManifest, reviewSource, library.libraryVersion);
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
      questions: ordinaryQuestions.length,
      graphQuestions: ordinaryQuestions.filter(question => question.graphRequired).length,
      assets: EXPECTED_ASSETS.size,
      canonicalQuestionCount: library.canonicalQuestionCount,
      assetInventoryCount: library.assetInventory.length,
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
    console.error(`FAIL: stale externalities outputs: ${stale.map(([file]) => path.relative(root, file)).join(", ")}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "PASS", ...generated.summary }, null, 2));
}
