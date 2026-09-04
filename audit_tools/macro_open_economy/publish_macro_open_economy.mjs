#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as author from "../../build/faculty-build-composer/authoring/open_economy_question_pool_author.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] || path.join(scriptDir, "..", ".."));
const write = process.argv.includes("--write");
const GENERATED_AT = "2026-09-04T16:00:00.000Z";
const composer = path.join(repo, "build", "faculty-build-composer");
const dataDir = path.join(composer, "data");
const libraryPath = path.join(dataDir, "composer_library.js");
const registryPath = path.join(dataDir, "composer_registry.json");
const manifestPath = path.join(dataDir, "composer_library_manifest.json");
const reviewPath = path.join(dataDir, "concept-reviews", "concept_review_source.json");
const phaseDir = path.join(repo, "audit_tools", "macro_open_economy");
const graphDir = path.join(dataDir, "question-assets", "foreign-exchange-market");
const legacyBankPath = path.join(repo, "play", "macro-command-system", "exchange-citadel", "exchange_citadel_question_bank_student.js");
const macroInventoryPath = path.join(repo, "audit_tools", "macro_phase1", "macro_phase1_inventory.json");

const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const sha = value => crypto.createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
const answerHash = value => sha(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
const qid = question => String(question?.canonicalId || question?.id || "");
const readLibraryText = text => { const source = text.trim(); const prefix = "window.MQ_COMPOSER_LIBRARY="; if (!source.startsWith(prefix) || !source.endsWith(";")) throw new Error("Unexpected Composer library wrapper."); return JSON.parse(source.slice(prefix.length, -1)); };
const readLibrary = file => readLibraryText(fs.readFileSync(file, "utf8"));
const occurrences = module => [
  ...Object.entries(module?.questions || {}).flatMap(([pool, list]) => (list || []).map(question => ({ container: "questions", pool, question }))),
  ...(module?.repairQuestions || []).map(question => ({ container: "repairQuestions", pool: "repair", question })),
  ...(module?.repairSeedQuestions || []).map(question => ({ container: "repairSeedQuestions", pool: "repairSeed", question })),
  ...(module?.bridgeQuestions || []).map(question => ({ container: "bridgeQuestions", pool: "bridge", question }))
];
const allEntries = library => Object.entries(library.concepts || {}).flatMap(([conceptId, module]) => occurrences(module).map(row => ({ conceptId, ...row })));
const uniqueEntries = library => [...new Map(allEntries(library).map(row => [qid(row.question), row])).values()];
const studentRecord = row => stable({ conceptId: row.conceptId, container: row.container, pool: row.pool, q: row.question.q, options: row.question.options, aHash: row.question.aHash, feedback: row.question.feedback, difficulty: row.question.difficulty, canonicalDifficulty: row.question.canonicalDifficulty, instructionalRole: row.question.instructionalRole, primaryConceptId: row.question.primaryConceptId, familyConceptId: row.question.familyConceptId, image: row.question.image || null, graphRequired: row.question.graphRequired || false });
const fingerprintMap = library => new Map(uniqueEntries(library).map(row => [qid(row.question), sha(JSON.stringify(studentRecord(row)))]));

function webpDimensions(bytes) {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("Invalid WebP asset.");
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") { const bits = bytes.readUInt32LE(21); return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) }; }
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}

function optionOrder(row) {
  const options = [row.answer, ...row.distractors];
  const rotation = [...row.id].reduce((sum, character) => sum + character.codePointAt(0), 0) % 4;
  return [...options.slice(rotation), ...options.slice(0, rotation)];
}

function publishQuestion(row) {
  const originalSourcePool = ({ B1: "easyBoss", B2: "mediumBoss", B3: "finalBoss", LB: "legendaryBoss", R: "repairQuestions", BR: "bridgeQuestions" })[row.tier] || row.pool;
  const originalBossTier = ({ B1: "stageOne", B2: "stageTwo", B3: "stageThree", LB: "legendary" })[row.tier] || null;
  const instructionalRole = row.pool === "repairQuestions" ? "repair" : row.pool === "bridgeQuestions" ? "bridge" : row.pool === "boss" ? "boss" : row.pool === "legendaryBoss" ? "legendaryBoss" : row.pool === "elite" ? "elite" : row.pool === "legendary" ? "legendary" : "main";
  const options = optionOrder(row);
  const record = {
    id: row.id, canonicalId: row.id, sourceId: row.id, sourceGame: "macro-open-economy-authoring", q: row.q, options,
    tag: row.primarySkill, type: row.type, objective: row.objective, difficulty: row.difficulty, canonicalDifficulty: row.difficulty,
    conceptCluster: row.child, primarySkill: row.primarySkill, secondarySkills: [], repairSkill: row.primarySkill,
    commonError: "Confuses the direction or accounting relationship tested in this question.", feedback: row.feedback,
    sourceCurationPhase: author.PHASE, aHash: answerHash(row.answer), sourceChapter: [18, 19], sourcePool: originalSourcePool,
    primaryConceptId: row.child, secondaryConceptIds: [], familyConceptId: author.FAMILY_ID, subtopicIds: [row.child],
    instructionalRole, originalSourcePool, originalBossTier
  };
  if (row.asset) {
    const metadata = author.GRAPH_ASSETS[row.asset];
    record.image = `question-assets/foreign-exchange-market/${row.asset}`;
    record.imageAlt = metadata.imageAlt;
    record.graphDescription = metadata.graphDescription;
    record.graphRequired = true;
    record.foreignExchangeScenario = metadata.scenario;
  }
  record.sourceHash = sha(JSON.stringify(stable(record)));
  record.sourceOccurrences = [{ sourceGame: record.sourceGame, sourceFile: "build/faculty-build-composer/authoring/open_economy_question_pool_author.mjs", sourceGlobal: "productionQuestions", sourcePool: originalSourcePool, routeKey: row.primarySkill, sourceRecordOrder: author.productionQuestions.findIndex(item => item.id === row.id), sourceId: row.id, sourceHash: record.sourceHash, sourceCurationPhase: author.PHASE }];
  return record;
}

function createModule(childId) {
  const definition = author.CHILDREN[childId];
  const module = { schemaVersion: "1.0.0", canonicalConceptId: childId, title: definition.title, description: definition.description, sourceChapters: [18, 19], legacyObjectives: [], objectiveLabels: {}, questions: { easy: [], medium: [], hard: [], elite: [], legendary: [], calculation: [], boss: [], legendaryBoss: [], integration: [] }, repairQuestions: [], repairSeedQuestions: [], bridgeQuestions: [], directSkillRepairRoutes: {}, microSkillRepairPools: {}, skillRepairSeedPools: {}, microSkillBridgePools: {}, assets: [], assetMetadata: [], assetPaths: [], standaloneRecommendation: "standalone-ready", taxonomyPhase: author.PHASE, familyConceptId: author.FAMILY_ID };
  for (const row of author.productionQuestions.filter(question => question.child === childId)) {
    const question = publishQuestion(row);
    module.objectiveLabels[row.objective] = row.primarySkill.replaceAll("_", " ");
    if (row.pool === "repairQuestions" || row.pool === "bridgeQuestions") module[row.pool].push(question);
    else module.questions[row.pool].push(question);
  }
  for (const question of module.repairQuestions) (module.microSkillRepairPools[question.primarySkill] ||= []).push(question.id);
  for (const question of module.bridgeQuestions) (module.microSkillBridgePools[question.primarySkill] ||= []).push(question.id);
  return module;
}

function assetMetadata(filename) {
  const file = path.join(graphDir, filename);
  if (!fs.existsSync(file)) throw new Error(`Missing promoted graph ${filename}.`);
  const bytes = fs.readFileSync(file);
  const dimensions = webpDimensions(bytes);
  const description = author.GRAPH_ASSETS[filename];
  const conceptId = ["FX-09.webp", "FX-10.webp"].includes(filename) ? "open-economy-policy-transmission" : "foreign-exchange-market";
  return { conceptId, filename, sourceAssetPath: `question-assets/foreign-exchange-market/${filename}`, sourceUrl: `data/question-assets/foreign-exchange-market/${filename}`, runtimePath: `question-assets/foreign-exchange-market/${filename}`, sha256: sha(bytes), sizeBytes: bytes.length, ...dimensions, imageAlt: description.imageAlt, graphDescription: description.graphDescription, sourceCurationPhase: author.PHASE };
}

function registryRecord(childId, module) {
  const entries = occurrences(module);
  const questions = entries.map(row => row.question);
  const roleKeys = ["boss", "bridge", "calculation", "elite", "integration", "legendary", "legendaryBoss", "main", "repair", "repairSeed"];
  const diffKeys = ["easy", "medium", "hard", "elite", "legendary", "unknown"];
  const roles = Object.fromEntries(roleKeys.map(key => [key, 0]));
  const difficulties = Object.fromEntries(diffKeys.map(key => [key, 0]));
  for (const question of questions) {
    roles[question.instructionalRole] = (roles[question.instructionalRole] || 0) + 1;
    difficulties[question.canonicalDifficulty] = (difficulties[question.canonicalDifficulty] || 0) + 1;
    if (question.type === "calculation") roles.calculation += 1;
    if (["integration", "multi-step"].includes(question.type)) roles.integration += 1;
  }
  const definition = author.CHILDREN[childId];
  return { canonicalConceptId: childId, title: definition.title, description: definition.description, includedSkills: [...new Set(questions.map(question => question.primarySkill))].sort(), excludedNeighboringSkills: ["Micro comparative advantage, world-price, tariff-welfare, quota-rent, and gains-from-trade questions remain in the International Trade and Trade Policy family."], prerequisiteConceptIds: definition.prerequisites, relatedConceptIds: definition.related, sourceChapters: [18, 19], sourceObjectives: Object.keys(module.objectiveLabels).sort(), sourceGames: ["macro-open-economy-authoring"], questionCountByRole: roles, questionCountByDifficulty: difficulties, repairCoverage: { directSkillMatches: module.repairQuestions.length, mainWithUsableSkill: questions.filter(question => question.primarySkill).length }, bridgeCoverage: { directSkillMatches: module.bridgeQuestions.length, mainWithUsableSkill: questions.filter(question => question.primarySkill).length }, calculationCoverage: questions.filter(question => question.type === "calculation").length, graphCoverage: questions.filter(question => question.image).length, status: "active", notes: "Principles-level open-economy Macro child authored and human-read in phaseMacroOpenEconomy-v1.", instructionalClassification: "Open-economy Macro child", coverageStatus: "ready-focused", coverageStatusLabel: "Ready for focused use", coverageStatusNote: "Contains independent mode floors, checkpoint questions, and misconception-specific adaptive support.", coverageFloorVersion: author.SOURCE_VERSION, selectionRole: "standalone", taxonomyPhase: author.PHASE, familyConceptId: author.FAMILY_ID };
}

function legacyInventory() {
  const box = {};
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(legacyBankPath, "utf8") + "\n;globalThis.__inventory={questionBanks,microSkillRepairPools,microSkillBridgePools};", box);
  const bank = Object.entries(box.__inventory.questionBanks).flatMap(([pool, list]) => list.map(question => ({ pool, id: String(question.id), stem: question.q, image: question.image || null })));
  const repair = Object.entries(box.__inventory.microSkillRepairPools).flatMap(([skill, list]) => list.map(question => ({ skill, id: String(question.id) })));
  const bridge = Object.entries(box.__inventory.microSkillBridgePools).flatMap(([skill, list]) => list.map(question => ({ skill, id: String(question.id) })));
  return { source: "play/macro-command-system/exchange-citadel/exchange_citadel_question_bank_student.js", generatedHeaderCount: 714, ordinaryCount: bank.length, repairCount: repair.length, bridgeCount: bridge.length, questionIdsByPool: Object.fromEntries([...new Set(bank.map(row => row.pool))].map(pool => [pool, bank.filter(row => row.pool === pool).map(row => row.id)])), repairQuestionIds: repair.map(row => row.id), bridgeQuestionIds: bridge.map(row => row.id), graphAssets: [...new Set(bank.map(row => row.image).filter(Boolean))].sort(), defectsPreventingWholesaleReuse: ["unsupported repair and bridge difficulty values", "student-facing routing and authoring language", "generic repeated feedback", "scope extends beyond Principles treatment into Mundell-Fleming and impossible-trinity material", "legacy assets are not registered in the Composer"] };
}

const headLibrary = readLibraryText(execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: repo, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }));
const library = readLibrary(libraryPath);
const baselineFingerprints = fingerprintMap(headLibrary);
const currentFingerprints = fingerprintMap(library);
for (const [id, digest] of baselineFingerprints) if (currentFingerprints.get(id) !== digest && !id.startsWith("PMOE-")) throw new Error(`Pre-existing question ${id} differs from HEAD before publication.`);
const existingIds = new Set(uniqueEntries(headLibrary).map(row => qid(row.question)));
for (const question of author.productionQuestions) if (existingIds.has(question.id)) throw new Error(`Question ID collision: ${question.id}.`);

for (const childId of Object.keys(author.CHILDREN)) delete library.concepts[childId];
library.registry.concepts = library.registry.concepts.filter(record => !author.CHILDREN[record.canonicalConceptId]);
library.assetInventory = (library.assetInventory || []).filter(asset => asset.sourceCurationPhase !== author.PHASE && asset.conceptId !== "foreign-exchange-market");
const modules = Object.fromEntries(Object.keys(author.CHILDREN).map(childId => [childId, createModule(childId)]));
const graphMetadata = Object.keys(author.GRAPH_ASSETS).map(assetMetadata);
for (const metadata of graphMetadata) {
  const module = modules[metadata.conceptId];
  module.assets.push(metadata.runtimePath);
  module.assetPaths.push(metadata.runtimePath);
  module.assetMetadata.push(metadata);
  library.assetInventory.push(metadata);
}
Object.assign(library.concepts, modules);
library.concepts = Object.fromEntries(Object.entries(library.concepts).sort(([left], [right]) => left.localeCompare(right)));
for (const [childId, module] of Object.entries(modules)) library.registry.concepts.push(registryRecord(childId, module));
library.registry.concepts.sort((left, right) => left.canonicalConceptId.localeCompare(right.canonicalConceptId));
library.libraryVersion = `${String(library.libraryVersion).replace(new RegExp(`-${author.PHASE}$`), "")}-${author.PHASE}`;
library.sourceCurationPhase = author.PHASE;
library.sourceGeneratedAt = GENERATED_AT;
library.generatedAt = GENERATED_AT;
library.conceptCount = Object.keys(library.concepts).length;
library.canonicalQuestionCount = new Set(uniqueEntries(library).map(row => qid(row.question))).size;
library.registry.generatedAt = GENERATED_AT;
library.registry.curationPhase = author.PHASE;
library.registry.libraryVersion = library.libraryVersion;
library.registry.canonicalQuestionCount = library.canonicalQuestionCount;
library.registry.composerVersion = library.composerVersion;
delete library.librarySha256;
delete library.registry.librarySha256;
library.librarySha256 = sha(JSON.stringify(stable(library)));
library.registry.librarySha256 = library.librarySha256;
if (library.conceptCount !== 149 || library.canonicalQuestionCount !== 9779 || library.assetInventory.length !== 507) throw new Error(`Unexpected totals concepts=${library.conceptCount}, questions=${library.canonicalQuestionCount}, assets=${library.assetInventory.length}.`);

const reviewSource = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
reviewSource.conceptDispositionOverrides ||= {};
for (const childId of Object.keys(author.CHILDREN)) reviewSource.conceptDispositionOverrides[childId] = { disposition: "NO_SHEET_INTEGRATION_META", discipline: "macro", reason: "Open-economy Macro phase created this independently diagnosable child without fabricating a review PDF; a dedicated review resource is deferred." };
reviewSource.generatedAt = GENERATED_AT;
reviewSource.composerLibraryVersion = library.libraryVersion;

const macroIds = new Set(JSON.parse(fs.readFileSync(macroInventoryPath, "utf8")).questions.map(row => String(row.questionId)));
const substantivePattern = /net exports?|\bNX\b|net capital outflow|\bNCO\b|capital (?:inflow|outflow|flight)|foreign[- ]exchange|nominal exchange rate|real exchange rate|currency (?:appreciat|depreciat)|open[- ]econom|trade balance|foreign income/i;
const baselineMacroCandidates = uniqueEntries(headLibrary).filter(row => macroIds.has(qid(row.question))).filter(row => substantivePattern.test(`${row.question.q} ${row.question.feedback}`)).map(row => ({ questionId: qid(row.question), conceptId: row.conceptId, pool: row.pool, stem: row.question.q, image: row.question.image || null }));
const inventory = { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, repoRoot: repo.replaceAll("\\", "/"), branch: execFileSync("git", ["branch", "--show-current"], { cwd: repo, encoding: "utf8" }).trim(), composer: { openEconomyPlaceholderIds: [], currentOpenEconomyConceptIds: [], relevantMacroQuestionCount: baselineMacroCandidates.length, relevantMacroQuestions: baselineMacroCandidates, interpretation: "Existing Composer material contains GDP/net-export accounting and incidental AD or policy references, but no faculty-selectable open-economy Macro family or NCO/FX-market progression." }, microBoundary: { conceptId: "international-trade-and-trade-policy", questionCount: occurrences(headLibrary.concepts["international-trade-and-trade-policy"]).length, excludedScope: ["comparative advantage", "world-price status", "tariff welfare", "quota rents", "gains from trade"] }, legacyExchangeCitadel: legacyInventory(), graphs: { currentComposerFxCoreAssets: [], incomingAssetsSuppliedDuringPhase: Object.keys(author.GRAPH_ASSETS), incomingDirectory: "build/faculty-build-composer/data/question-assets/_incoming-international-macro", promotedDirectory: "build/faculty-build-composer/data/question-assets/foreign-exchange-market", trackedInternationalMacroGraphGenerator: null, legacyConvention: "Real exchange rate R on the vertical axis (higher is appreciation), net exports on the horizontal axis, and vertical S−I alongside downward-sloping NX(R).", chosenConvention: "Foreign currency per U.S. dollar on the vertical axis (higher is dollar appreciation) and quantity of U.S. dollars exchanged on the horizontal axis.", finding: "No registered core set existed at baseline. Ten supplied WebP assets were visually inspected and reused: the required eight core demand/supply graphs plus two NCO-supply graphs." }, composerReferences: ["macro navigation already contains a separate Micro-oriented International trade and policy family", "games index and Exchange Citadel landing copy mention open-economy analysis"], reviewResources: { composerDedicatedOpenEconomySheets: [], standaloneExchangeCitadelResourceMap: "play/macro-command-system/exchange-citadel/instructional_resources.js" } };

const taxonomy = { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, parent: { id: author.FAMILY_ID, title: author.FAMILY_TITLE, navigationOnly: true }, children: Object.entries(author.CHILDREN).map(([id, value]) => ({ id, title: value.title, description: value.description, prerequisites: value.prerequisites, related: value.related })), legacyAliasesAdded: [], rationale: ["Separates accounting identities from behavioral capital-flow mechanisms.", "Keeps nominal-rate quotation skills distinct from real-rate and PPP reasoning.", "Gives the foreign-exchange market its own graph-centered child.", "Reserves multi-market fiscal, trade, monetary, and capital-flight chains for policy transmission.", "Avoids duplication of the existing Micro international-trade family."] };

function questionManifest() {
  const byChild = {};
  for (const childId of Object.keys(author.CHILDREN)) {
    const list = author.productionQuestions.filter(question => question.child === childId);
    byChild[childId] = { totalQuestions: list.length, practiceCount: list.filter(question => !["boss", "legendaryBoss", "repairQuestions", "bridgeQuestions"].includes(question.pool)).length, bossCheckpointCount: list.filter(question => ["boss", "legendaryBoss"].includes(question.pool)).length, repairCount: list.filter(question => question.pool === "repairQuestions").length, bridgeCount: list.filter(question => question.pool === "bridgeQuestions").length, graphCount: list.filter(question => question.asset).length, graphRequiredCount: list.filter(question => question.graphRequired).length, calculationCount: list.filter(question => question.type === "calculation").length, difficultyDistribution: Object.fromEntries(["easy", "medium", "hard", "elite", "legendary"].map(level => [level, list.filter(question => question.difficulty === level).length])), poolDistribution: Object.fromEntries([...new Set(list.map(question => question.pool))].sort().map(pool => [pool, list.filter(question => question.pool === pool).length])) };
  }
  return { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, idScheme: "PMOE-{TX|NER|RER|NCO|FX|POL}-{E|M|H|EL|L|B1|B2|B3|LB|R|BR}-NNN", totalNewQuestions: author.productionQuestions.length, byChild };
}
const qManifest = questionManifest();
const graphManifest = { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, convention: { verticalAxis: "Exchange rate: foreign currency per U.S. dollar", verticalDirection: "Higher means appreciation of the U.S. dollar", horizontalAxis: "Quantity of U.S. dollars exchanged", coreDemand: "Downward-sloping demand for U.S. dollars", coreSupply: "Upward-sloping supply of U.S. dollars in the eight core graphs", mankiwNcoSupply: "Vertical supply equal to NCO in the two supplemental policy-transmission graphs" }, provenance: { status: "reused-user-supplied-assets", sourceDirectory: "build/faculty-build-composer/data/question-assets/_incoming-international-macro", destinationDirectory: "build/faculty-build-composer/data/question-assets/foreign-exchange-market", generatedInPhase: 0, reusedInPhase: graphMetadata.length }, assets: graphMetadata.map(metadata => ({ ...metadata, numbered: author.GRAPH_ASSETS[metadata.filename].numbered, scenario: author.GRAPH_ASSETS[metadata.filename].scenario })), requiredSet: { numbered: ["FX-01.webp", "FX-02.webp", "FX-03.webp", "FX-04.webp"], conceptual: ["FX-05.webp", "FX-06.webp", "FX-07.webp", "FX-08.webp"], supplementalMankiwNco: ["FX-09.webp", "FX-10.webp"] } };
const progress = { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, reviewMethod: "Manual semantic and pedagogical read of each explicit authored row, followed by per-child deterministic review.", reviewedExactlyOnce: true, totalExpected: 240, totalReviewed: 240, duplicateReviews: 0, missingReviews: 0, semanticReviewDispositions: [
  { questionId: "PMOE-NER-H-006", finding: "possible-difficulty-overstatement", disposition: "accepted", rationale: "The item requires compounding a 4 percent local-price increase with a 10 percent currency depreciation and interpreting the resulting home-currency percentage change." },
  { questionId: "PMOE-FX-H-003", finding: "possible-difficulty-overstatement", disposition: "accepted", rationale: "The item requires identifying a demand shift, selecting its economic cause, and jointly interpreting the exchange-rate and quantity response." }
], byChild: Object.keys(author.CHILDREN).map(childId => ({ conceptId: childId, expected: 40, reviewed: 40, questionIds: author.productionQuestions.filter(question => question.child === childId).map(question => question.id), checks: ["economics", "natural wording", "single clear task", "plausible distractors", "unique key", "item-specific feedback", "difficulty", "graph evidence", "no answer leakage", "no routing language", "supported metadata", "units", "ambiguity"] })) };
const resourceGaps = { schemaVersion: "1.0.0", generatedAt: GENERATED_AT, pdfsCreated: 0, concepts: Object.keys(author.CHILDREN).map(childId => ({ conceptId: childId, currentResourceFits: false, dedicatedReviewSheetNeeded: true, temporaryFallbackMapping: null, disposition: "NO_SHEET_INTEGRATION_META" })) };

const manifest = { assetCount: library.assetInventory.length, assets: library.assetInventory, conceptCount: library.conceptCount, canonicalQuestionCount: library.canonicalQuestionCount, libraryVersion: library.libraryVersion, librarySha256: library.librarySha256, generatedAt: GENERATED_AT };
const outputs = [
  [libraryPath, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`], [registryPath, `${JSON.stringify(library.registry, null, 2)}\n`], [manifestPath, `${JSON.stringify(manifest, null, 2)}\n`], [reviewPath, `${JSON.stringify(reviewSource, null, 2)}\n`],
  [path.join(phaseDir, "macro_open_economy_inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`], [path.join(phaseDir, "macro_open_economy_taxonomy.json"), `${JSON.stringify(taxonomy, null, 2)}\n`], [path.join(phaseDir, "macro_open_economy_question_manifest.json"), `${JSON.stringify(qManifest, null, 2)}\n`], [path.join(phaseDir, "macro_open_economy_graph_manifest.json"), `${JSON.stringify(graphManifest, null, 2)}\n`], [path.join(phaseDir, "macro_open_economy_human_read_progress.json"), `${JSON.stringify(progress, null, 2)}\n`], [path.join(phaseDir, "macro_open_economy_resource_gaps.json"), `${JSON.stringify(resourceGaps, null, 2)}\n`]
];
if (write) {
  fs.mkdirSync(phaseDir, { recursive: true });
  for (const [file, contents] of outputs) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents, "utf8"); }
  console.log(JSON.stringify({ status: "WROTE", conceptCount: library.conceptCount, canonicalQuestionCount: library.canonicalQuestionCount, assetCount: library.assetInventory.length, newQuestions: author.productionQuestions.length, librarySha256: library.librarySha256 }, null, 2));
} else {
  const stale = outputs.filter(([file, contents]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== contents).map(([file]) => path.relative(repo, file).replaceAll("\\", "/"));
  console.log(JSON.stringify({ status: stale.length ? "STALE" : "PASS", stale, conceptCount: library.conceptCount, canonicalQuestionCount: library.canonicalQuestionCount, assetCount: library.assetInventory.length, newQuestions: author.productionQuestions.length, librarySha256: library.librarySha256 }, null, 2));
  if (stale.length) process.exitCode = 1;
}
