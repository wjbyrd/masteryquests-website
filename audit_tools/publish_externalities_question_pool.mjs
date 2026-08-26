import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  PHASE,
  SOURCE_VERSION,
  ID_FIRST,
  ID_LAST,
  CONCEPT_ID,
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
const incomingDir = path.join(composerRoot, "data", "question-assets", "_incoming-externalities");
const finalDir = path.join(composerRoot, "data", "question-assets", CONCEPT_ID);
const COMPOSER_VERSION = "4.5s.3f";
const GENERATED_AT = "2026-08-26T12:00:00.000Z";
const EXPECTED_ASSETS = new Set(Object.keys(GRAPH_ASSETS));
const PHASE_IDS = new Set(Array.from({ length: ID_LAST - ID_FIRST + 1 }, (_, index) => String(ID_FIRST + index)));

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
  const concept = library.concepts[CONCEPT_ID];
  for (const [pool, questions] of Object.entries(concept.questions || {})) {
    concept.questions[pool] = questions.filter(question => !PHASE_IDS.has(String(question.id)));
  }
  concept.assetMetadata = (concept.assetMetadata || []).filter(asset => asset.sourceCurationPhase !== PHASE);
  concept.assets = (concept.assets || []).filter(runtimePath => !runtimePath.startsWith(`question-assets/${CONCEPT_ID}/EXTERNALITY-`));
  concept.assetPaths = (concept.assetPaths || []).filter(runtimePath => !runtimePath.startsWith(`question-assets/${CONCEPT_ID}/EXTERNALITY-`));
  library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== PHASE);
}

function rotateOptions(question) {
  const options = [...question.distractors.slice(0, 3)];
  options.splice(question.id % 4, 0, question.answer);
  return options;
}

function publishQuestion(question) {
  const options = rotateOptions(question);
  const runtimePath = question.asset ? `question-assets/${CONCEPT_ID}/${question.asset}` : undefined;
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
    primaryConceptId: CONCEPT_ID,
    secondaryConceptIds: [],
    instructionalRole: "main",
    canonicalDifficulty: question.difficulty,
    originalSourcePool: question.difficulty,
    originalBossTier: null
  };
}

function registerAsset(library, filename) {
  const concept = library.concepts[CONCEPT_ID];
  const runtimePath = `question-assets/${CONCEPT_ID}/${filename}`;
  const sourceUrl = `data/${runtimePath}`;
  const bytes = fs.readFileSync(locateAsset(filename));
  const dimensions = webpDimensions(bytes);
  const authored = GRAPH_ASSETS[filename];
  const metadata = {
    conceptId: CONCEPT_ID,
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

function refreshRegistry(library) {
  const registryConcept = library.registry.concepts.find(concept => concept.canonicalConceptId === CONCEPT_ID);
  const concept = library.concepts[CONCEPT_ID];
  const ordinary = Object.entries(concept.questions || {}).flatMap(([pool, questions]) => questions.map(question => ({ pool, question })));
  const support = [...(concept.repairQuestions || []), ...(concept.repairSeedQuestions || []), ...(concept.bridgeQuestions || [])];
  const difficultyCounts = {};
  for (const { pool, question } of ordinary) {
    const difficulty = question.canonicalDifficulty || question.difficulty || pool || "unknown";
    difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
  }
  for (const question of support) {
    const difficulty = question.canonicalDifficulty || "unknown";
    difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
  }
  registryConcept.questionCountByRole = {
    boss: concept.questions?.boss?.length || 0,
    bridge: concept.bridgeQuestions?.length || 0,
    calculation: concept.questions?.calculation?.length || 0,
    elite: concept.questions?.elite?.length || 0,
    integration: concept.questions?.integration?.length || 0,
    legendary: concept.questions?.legendary?.length || 0,
    legendaryBoss: concept.questions?.legendaryBoss?.length || 0,
    main: ["easy", "medium", "hard"].reduce((sum, pool) => sum + (concept.questions?.[pool]?.length || 0), 0),
    repair: concept.repairQuestions?.length || 0,
    repairSeed: concept.repairSeedQuestions?.length || 0
  };
  registryConcept.questionCountByDifficulty = difficultyCounts;
  registryConcept.repairCoverage = { directSkillMatches: concept.repairQuestions?.length || 0, mainWithUsableSkill: ordinary.length };
  registryConcept.bridgeCoverage = { directSkillMatches: concept.bridgeQuestions?.length || 0, mainWithUsableSkill: ordinary.length };
  registryConcept.calculationCoverage = ordinary.filter(({ pool, question }) => pool === "calculation" || /calculation/i.test(question.type || "")).length;
  registryConcept.graphCoverage = ordinary.filter(({ question }) => Boolean(question.image)).length;
  registryConcept.includedSkills = [...new Set([...registryConcept.includedSkills, ...ordinary.map(({ question }) => question.primarySkill).filter(Boolean)])].sort();
  registryConcept.sourceObjectives = [...new Set([...(registryConcept.sourceObjectives || []), ...Object.keys(OBJECTIVES)])];
  registryConcept.notes = "Externalities production pool adds 160 ordinary Principles of Microeconomics questions, including 104 graph-dependent questions across four externality scenarios. Existing remediation remains unchanged.";
}

function render() {
  const library = readLibrary();
  validateAuthorSource(library);
  removePriorPhase(library);
  const concept = library.concepts[CONCEPT_ID];
  concept.objectiveLabels = { ...(concept.objectiveLabels || {}), ...OBJECTIVES };
  for (const question of ordinaryQuestions) concept.questions[question.difficulty].push(publishQuestion(question));
  for (const filename of EXPECTED_ASSETS) registerAsset(library, filename);
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
  reviewManifest.composerLibraryVersion = library.libraryVersion;
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
      [reviewManifestPath, `${JSON.stringify(reviewManifest, null, 2)}\n`]
    ],
    summary: {
      sourceVersion: SOURCE_VERSION,
      questions: ordinaryQuestions.length,
      graphQuestions: ordinaryQuestions.filter(question => question.graphRequired).length,
      assets: EXPECTED_ASSETS.size,
      canonicalQuestionCount: library.canonicalQuestionCount,
      assetInventoryCount: library.assetInventory.length,
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
