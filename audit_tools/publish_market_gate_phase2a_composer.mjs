import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  graphAssets,
  ordinaryQuestions,
  PHASE2A_SOURCE_VERSION
} from "../play/economic-realm/market-gate/authoring/market_gate_phase2a_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composerRoot = path.join(root, "build/faculty-build-composer");
const libraryPath = path.join(composerRoot, "data/composer_library.js");
const registryPath = path.join(composerRoot, "data/composer_registry.json");
const manifestPath = path.join(composerRoot, "data/composer_library_manifest.json");
const conceptReviewManifestPath = path.join(composerRoot, "data/concept-reviews/manifest.json");
const marketGateRoot = path.join(root, "play/economic-realm/market-gate");

const PHASE = "phase3e-market-gate-graph-sync-v1";
const COMPOSER_VERSION = "4.5s.3e";
const GENERATED_AT = "2026-08-25T00:00:00.000Z";
const PHASE_IDS = new Set(ordinaryQuestions.map(question => String(question.id)));
const AFFECTED_CONCEPT_IDS = new Set([
  "production-possibilities-frontier",
  "supply",
  "demand",
  "market-equilibrium",
  "binding-price-ceilings",
  "binding-price-floors",
  "tax-wedges-and-revenue",
  "tax-incidence",
  "statutory-versus-economic-tax-incidence"
]);

const conceptByQuestionId = new Map([
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

const assetRuntimePath = Object.freeze({
  "PPF-01.webp": "question-assets/production-possibilities-frontier/PPF-01.webp",
  "PPF-02.webp": "question-assets/production-possibilities-frontier/PPF-02.webp",
  "DEMAND-SUPPLY-03.webp": "question-assets/market-equilibrium/DEMAND-SUPPLY-03.webp",
  "DEMAND-SUPPLY-04.webp": "question-assets/market-equilibrium/DEMAND-SUPPLY-04.webp",
  "DEMAND-SUPPLY-05.webp": "question-assets/market-equilibrium/DEMAND-SUPPLY-05.webp",
  "DEMAND-SUPPLY-06.webp": "question-assets/market-equilibrium/DEMAND-SUPPLY-06.webp",
  "DEMAND-SUPPLY-07.webp": "question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp",
  "CEILING-02.webp": "question-assets/binding-price-ceilings/CEILING-02.webp",
  "CEILING-03.webp": "question-assets/binding-price-ceilings/CEILING-03.webp",
  "FLOOR-02.webp": "question-assets/binding-price-floors/FLOOR-02.webp",
  "FLOOR-03.webp": "question-assets/binding-price-floors/FLOOR-03.webp",
  "TAX-02.webp": "question-assets/tax-wedges-and-revenue/TAX-02.webp",
  "TAX-03.webp": "question-assets/tax-wedges-and-revenue/TAX-03.webp",
  "TAX-04.webp": "question-assets/tax-wedges-and-revenue/TAX-04.webp",
  "TAX-05.webp": "question-assets/tax-wedges-and-revenue/TAX-05.webp",
  "TAX-06.webp": "question-assets/tax-wedges-and-revenue/TAX-06.webp"
});

const cleanedGraphUrls = new Set([
  "data/question-assets/aggregate-supply/adas1.webp",
  "data/question-assets/binding-price-ceilings/ceilingfloor.webp",
  "data/question-assets/binding-price-floors/ceilingfloor.webp",
  "data/question-assets/fiscal-policy-and-aggregate-demand/moneymultiplier.webp",
  "data/question-assets/fisher-effect/moneys_moneyd.webp",
  "data/question-assets/inflation-costs/moneys_moneyd.webp",
  "data/question-assets/inflation-tax-and-deflation/moneys_moneyd.webp",
  "data/question-assets/liquidity-preference-and-money-market/ad_ms_md.webp",
  "data/question-assets/macroeconomic-equilibrium-and-shocks/LRAS-02.webp",
  "data/question-assets/macroeconomic-equilibrium-and-shocks/adas1.webp"
]);

function range(first, last) {
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

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

function allQuestionRecords(library) {
  const records = [];
  for (const [conceptId, concept] of Object.entries(library.concepts)) {
    for (const [pool, questions] of Object.entries(concept.questions || {})) {
      for (const question of questions || []) records.push({ conceptId, pool, question });
    }
  }
  return records;
}

function allCanonicalQuestions(library) {
  const records = allQuestionRecords(library).map(({ question }) => question);
  for (const concept of Object.values(library.concepts)) {
    records.push(...(concept.repairQuestions || []));
    records.push(...(concept.repairSeedQuestions || []));
    records.push(...(concept.bridgeQuestions || []));
  }
  return records;
}

function rotateOptions(record) {
  const options = [...record.distractors];
  options.splice(Number(record.id) % 4, 0, record.answer);
  return options;
}

function sourceChapter(objective) {
  const match = String(objective).match(/^LO(\d+)(?:\.(\d+))?/);
  if (!match) return [];
  return match[2] ? [Number(match[1]), Number(match[2])] : [Number(match[1])];
}

function publishQuestion(record, conceptId) {
  const options = rotateOptions(record);
  const image = assetRuntimePath[record.asset];
  const publishedSource = {
    id: record.id,
    sourceGame: "marketGate",
    q: record.q,
    options,
    image: record.asset,
    imageAlt: graphAssets[record.asset],
    graphRequired: true,
    tag: record.tag,
    type: record.type,
    objective: record.objective,
    difficulty: record.pool,
    conceptCluster: record.conceptCluster,
    primarySkill: record.primarySkill,
    secondarySkills: record.secondarySkills,
    repairSkill: record.repairSkill,
    commonError: record.commonError,
    feedback: record.feedback,
    sourceCurationPhase: "phase2a-market-gate",
    aHash: sha256(normalize(record.answer))
  };
  const sourceHash = sha256(stableStringify(publishedSource));
  const canonicalId = String(record.id);
  return {
    ...publishedSource,
    id: canonicalId,
    image,
    graphDescription: graphAssets[record.asset],
    canonicalId,
    sourceId: record.id,
    sourceGame: "market-gate",
    sourceChapter: sourceChapter(record.objective),
    sourcePool: record.pool,
    sourceHash,
    sourceOccurrences: [{
      sourceGame: "market-gate",
      sourceFile: "play/economic-realm/market-gate/market_gate_questions_student.js",
      sourceGlobal: "questionBanks",
      sourcePool: record.pool,
      routeKey: null,
      sourceRecordOrder: ordinaryQuestions.filter(question => question.pool === record.pool).findIndex(question => question.id === record.id),
      sourceId: record.id,
      sourceHash
    }],
    primaryConceptId: conceptId,
    secondaryConceptIds: [],
    instructionalRole: "main",
    canonicalDifficulty: record.pool,
    originalSourcePool: record.pool,
    originalBossTier: null
  };
}

function validateBaseline(library) {
  const errors = [];
  if (ordinaryQuestions.length !== 48) errors.push(`Expected 48 ordinary questions, found ${ordinaryQuestions.length}`);
  if (conceptByQuestionId.size !== 48) errors.push(`Expected 48 concept mappings, found ${conceptByQuestionId.size}`);
  const existing = allCanonicalQuestions(library).filter(question => !PHASE_IDS.has(String(question.id)));
  const ids = new Set(existing.map(question => String(question.id)));
  const stems = new Set(existing.map(question => normalize(question.q)));
  for (const record of ordinaryQuestions) {
    if (ids.has(String(record.id))) errors.push(`Composer ID collision: ${record.id}`);
    if (stems.has(normalize(record.q))) errors.push(`Composer exact-stem duplicate: ${record.id}`);
    if (!conceptByQuestionId.has(record.id)) errors.push(`Missing concept mapping: ${record.id}`);
    if (!assetRuntimePath[record.asset]) errors.push(`Missing asset mapping: ${record.id} ${record.asset}`);
    const composerAsset = path.join(composerRoot, "data", assetRuntimePath[record.asset]);
    const marketGateAsset = path.join(marketGateRoot, record.asset);
    if (!fs.existsSync(composerAsset)) errors.push(`Missing Composer asset: ${assetRuntimePath[record.asset]}`);
    if (!fs.existsSync(marketGateAsset)) errors.push(`Missing Market Gate asset: ${record.asset}`);
    if (fs.existsSync(composerAsset) && fs.existsSync(marketGateAsset) &&
        !fs.readFileSync(composerAsset).equals(fs.readFileSync(marketGateAsset))) {
      errors.push(`Cross-location byte mismatch: ${record.asset}`);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

function removePriorPhase(library) {
  for (const concept of Object.values(library.concepts)) {
    for (const [pool, questions] of Object.entries(concept.questions || {})) {
      concept.questions[pool] = questions.filter(question => !PHASE_IDS.has(String(question.id)));
    }
    const phaseAssetNames = new Set(ordinaryQuestions
      .filter(question => conceptByQuestionId.get(question.id) === concept.canonicalConceptId)
      .map(question => question.asset));
    concept.assetMetadata = (concept.assetMetadata || []).filter(asset =>
      !(phaseAssetNames.has(asset.filename) && asset.sourceCurationPhase === PHASE));
    const phasePaths = new Set([...phaseAssetNames].map(filename => assetRuntimePath[filename]));
    concept.assets = (concept.assets || []).filter(asset => !phasePaths.has(asset));
    concept.assetPaths = (concept.assetPaths || []).filter(asset => !phasePaths.has(asset));
  }
  library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== PHASE);
}

function refreshCleanedAssetPins(library) {
  const refresh = asset => {
    if (!cleanedGraphUrls.has(asset.sourceUrl)) return asset;
    const file = path.join(composerRoot, asset.sourceUrl);
    if (!fs.existsSync(file)) throw new Error(`Missing cleaned graph: ${asset.sourceUrl}`);
    const bytes = fs.readFileSync(file);
    return { ...asset, sha256: sha256(bytes), sizeBytes: bytes.length };
  };
  library.assetInventory = library.assetInventory.map(refresh);
  for (const concept of Object.values(library.concepts)) {
    concept.assetMetadata = (concept.assetMetadata || []).map(refresh);
  }
}

function registerAsset(library, conceptId, filename) {
  const concept = library.concepts[conceptId];
  const runtimePath = assetRuntimePath[filename];
  const sourceUrl = `data/${runtimePath}`;
  const file = path.join(composerRoot, sourceUrl);
  const bytes = fs.readFileSync(file);
  const metadata = {
    conceptId,
    filename,
    sourceAssetPath: runtimePath,
    sourceUrl,
    runtimePath,
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
    imageAlt: graphAssets[filename],
    graphDescription: graphAssets[filename],
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
  for (const registryConcept of library.registry.concepts) {
    if (!AFFECTED_CONCEPT_IDS.has(registryConcept.canonicalConceptId)) continue;
    const concept = library.concepts[registryConcept.canonicalConceptId];
    if (!concept) continue;
    const ordinary = Object.entries(concept.questions || {}).flatMap(([pool, questions]) =>
      questions.map(question => ({ pool, question })));
    const allSupport = [
      ...(concept.repairQuestions || []),
      ...(concept.repairSeedQuestions || []),
      ...(concept.bridgeQuestions || [])
    ];
    const difficultyCounts = {};
    for (const { pool, question } of ordinary) {
      const difficulty = question.canonicalDifficulty || question.difficulty || pool || "unknown";
      difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
    }
    for (const question of allSupport) {
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
    registryConcept.repairCoverage = {
      directSkillMatches: concept.repairQuestions?.length || 0,
      mainWithUsableSkill: ordinary.length
    };
    registryConcept.bridgeCoverage = {
      directSkillMatches: concept.bridgeQuestions?.length || 0,
      mainWithUsableSkill: ordinary.length
    };
    registryConcept.calculationCoverage = ordinary.filter(({ pool, question }) =>
      pool === "calculation" || /calculation/i.test(question.type || "")).length;
    registryConcept.graphCoverage = ordinary.filter(({ question }) => Boolean(question.image)).length;
    const skills = new Set(registryConcept.includedSkills || []);
    for (const { question } of ordinary) {
      if (question.primarySkill) skills.add(question.primarySkill);
      for (const skill of question.secondarySkills || []) skills.add(skill);
    }
    registryConcept.includedSkills = [...skills].sort();
  }
}

function render() {
  const library = readLibrary();
  validateBaseline(library);
  removePriorPhase(library);
  refreshCleanedAssetPins(library);

  for (const record of ordinaryQuestions) {
    const conceptId = conceptByQuestionId.get(record.id);
    library.concepts[conceptId].questions[record.pool].push(publishQuestion(record, conceptId));
  }

  const registrations = new Set();
  for (const record of ordinaryQuestions) {
    const conceptId = conceptByQuestionId.get(record.id);
    const key = `${conceptId}\u0000${record.asset}`;
    if (registrations.has(key)) continue;
    registrations.add(key);
    registerAsset(library, conceptId, record.asset);
  }

  library.composerVersion = COMPOSER_VERSION;
  library.libraryVersion = `${library.libraryVersion.replace(new RegExp(`-${PHASE}$`), "")}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  library.conceptCount = Object.keys(library.concepts).length;
  library.canonicalQuestionCount = new Set(allCanonicalQuestions(library).map(question => String(question.id))).size;
  refreshRegistry(library);
  library.registry.schemaVersion = library.registry.schemaVersion || library.schemaVersion;
  library.registry.generatedAt = GENERATED_AT;
  library.registry.libraryVersion = library.libraryVersion;
  library.registry.composerVersion = COMPOSER_VERSION;
  library.registry.canonicalQuestionCount = library.canonicalQuestionCount;
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stableStringify(library));
  library.registry.librarySha256 = library.librarySha256;

  const conceptReviewManifest = JSON.parse(fs.readFileSync(conceptReviewManifestPath, "utf8"));
  conceptReviewManifest.composerLibraryVersion = library.libraryVersion;

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
    library: `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`,
    registry: `${JSON.stringify(library.registry, null, 2)}\n`,
    manifest: `${JSON.stringify(manifest, null, 2)}\n`,
    conceptReviews: `${JSON.stringify(conceptReviewManifest, null, 2)}\n`,
    summary: {
      sourceVersion: PHASE2A_SOURCE_VERSION,
      questions: ordinaryQuestions.length,
      assetRegistrations: registrations.size,
      physicalAssetsCopied: 0,
      canonicalQuestionCount: library.canonicalQuestionCount,
      assetInventoryCount: library.assetInventory.length,
      librarySha256: library.librarySha256
    }
  };
}

const generated = render();
const outputs = [
  [libraryPath, generated.library],
  [registryPath, generated.registry],
  [manifestPath, generated.manifest],
  [conceptReviewManifestPath, generated.conceptReviews]
];

if (process.argv.includes("--write")) {
  for (const [file, contents] of outputs) fs.writeFileSync(file, contents, "utf8");
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  const stale = outputs.filter(([file, contents]) => fs.readFileSync(file, "utf8") !== contents);
  if (stale.length) {
    console.error(`FAIL: stale Phase 3E outputs: ${stale.map(([file]) => path.relative(root, file)).join(", ")}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "PASS", ...generated.summary }, null, 2));
}
