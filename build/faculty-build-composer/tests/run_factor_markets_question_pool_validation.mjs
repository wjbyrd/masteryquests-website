import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  PHASE, SOURCE_VERSION, ID_FIRST, ID_LAST, CONCEPT_ID, OBJECTIVES, SUBTOPICS,
  GRAPH_ASSETS, productionQuestions
} from "../authoring/factor_markets_question_pool_author.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const libraryRel = "build/faculty-build-composer/data/composer_library.js";
const libraryPath = path.join(root, libraryRel);
const registryPath = path.join(root, "build/faculty-build-composer/data/composer_registry.json");
const manifestPath = path.join(root, "build/faculty-build-composer/data/composer_library_manifest.json");
const reviewManifestPath = path.join(root, "build/faculty-build-composer/data/concept-reviews/manifest.json");
const assetDir = path.join(root, "build/faculty-build-composer/data/question-assets/factor-markets");
const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");

const PINS = Object.freeze({
  ids: "9284953b94d4becb291bf914b9f9fbb1e1b0c07fb98897acac68d3d5cc62fbb3",
  answers: "a0c1d9b190c0f7a730692cc47fa94f5b4f04a1d650a0f50bdb8b838da54ae338",
  skills: "adc44aaba79542538aa589f8d7c3b1d40803840c878c82886c7e15afa032f7d0",
  objectives: "7004bef301aeb29279f2b01b4b20489cc486b92a8ff48ca6632843ec72811931",
  difficulties: "737d6fb9fa93a56d9b5f7404946acc210463ee35fea3e019dc3fffba225934f1",
  pools: "beef4a383a5641a397986517744a236d0304eff6b6df8c13959eb3143e80570d",
  graphs: "7df17116b6456a576b2a7d620ba251e9bd15ac30d28bd284ed86879b601196df",
  stems: "c8529a22fb6332c7ff65c43c7c24a09c93f3f274cfc036cfb30b89a005e3d988"
});

const ASSETS = Object.freeze({
  "LABOR-01.webp": { count: 10, bytes: 61218, width: 1651, height: 1182, sha256: "6ab49624f781b786c338440667347fa79c67a9f471e113c633d25d036b680946" },
  "LABOR-02.webp": { count: 9, bytes: 74204, width: 1720, height: 1200, sha256: "e6ecbe54922ffbe4929e10494e307ae1092461e26896ebd00a3af81b22fbad73" },
  "LABOR-03.webp": { count: 9, bytes: 65808, width: 1720, height: 1200, sha256: "7d7163c3fa8ba6d719c5b15c037c6636aeffae63194e7825ded3eae472d5eeea" },
  "LABOR-04.webp": { count: 8, bytes: 72982, width: 1624, height: 1200, sha256: "7bb0871ba053742da20aa39dee70922a3e24ff0549588186dfcba6fa07317536" },
  "LABOR-05.webp": { count: 8, bytes: 70446, width: 1653, height: 1200, sha256: "b34cf3cf4422b9411e0acb67c965d7950b61a693ef5008d00513b3bc91245aad" },
  "LABOR-06.webp": { count: 7, bytes: 71208, width: 1617, height: 1200, sha256: "e5bebbfd9f2ab8eab68524fa99a689196544d41d4ad35ed110611f67638f2214" },
  "LABOR-07.webp": { count: 4, bytes: 63756, width: 1642, height: 1182, sha256: "f6cc7e4327e537c2cc756453593d5522cdb90a0c0abdcd273ff867a8283e6d6e" },
  "LABOR-08.webp": { count: 4, bytes: 69234, width: 1720, height: 1200, sha256: "d2ec0bd0a1c742236406ab92a73bb57408fd6f19ca5509306ea819b2918f7172" },
  "LABOR-09.webp": { count: 5, bytes: 78764, width: 1624, height: 1200, sha256: "ef7b4edc7407c3be73a64749a0d76f9c5e513e358b9f4cf67fa108220533bd2c" }
});

const EXPECTED_OBJECTIVES = Object.freeze({
  "FM.1": 20, "FM.2": 22, "FM.3": 18, "FM.4": 18, "FM.5": 20,
  "FM.6": 20, "FM.7": 16, "FM.8": 18, "FM.9": 18, "FM.10": 18,
  "FM.11": 18, "FM.12": 18, "FM.13": 16
});
const EXPECTED_DIFFICULTY = Object.freeze({ easy: 60, medium: 90, hard: 54, elite: 18, legendary: 18 });
const EXPECTED_POOLS = Object.freeze({ easy: 54, medium: 72, hard: 48, elite: 18, legendary: 12, easyBoss: 6, mediumBoss: 6, finalBoss: 6, legendaryBoss: 6, repairQuestions: 6, bridgeQuestions: 6 });

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function normalize(value) { return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9$%+.-]+/g, " ").trim(); }
function normalizeAnswer(value) { return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase(); }
function digest(values) { return sha256(JSON.stringify(values)); }
function loadLibrary(source) { const sandbox = { window: {} }; vm.runInNewContext(source, sandbox); return sandbox.window.MQ_COMPOSER_LIBRARY; }
function entries(library) {
  const out = [];
  for (const [conceptId, module] of Object.entries(library.concepts || {})) {
    for (const [pool, questions] of Object.entries(module.questions || {})) for (const question of questions || []) out.push({ conceptId, pool, question });
    for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[pool] || []) out.push({ conceptId, pool, question });
  }
  return out;
}
function distribution(items, accessor) { return items.reduce((counts, item) => { const key = accessor(item) ?? "null"; counts[key] = (counts[key] || 0) + 1; return counts; }, {}); }
function sameDistribution(actual, expected) { return stable(actual) === stable(expected); }
function webpDimensions(bytes) {
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  throw new Error(`Unsupported WebP chunk ${chunk}.`);
}
function jaccard(a, b) { let overlap = 0; for (const token of a) if (b.has(token)) overlap += 1; return overlap / (a.size + b.size - overlap); }
function embedQuestionAssets(composition) {
  const embedded = {};
  for (const asset of composition.assets || []) {
    const bytes = fs.readFileSync(path.join(root, "build/faculty-build-composer/data", asset.runtimePath));
    if (sha256(bytes) !== asset.sha256) throw new Error(`Asset hash mismatch ${asset.runtimePath}.`);
    embedded[asset.runtimePath] = `data:image/webp;base64,${bytes.toString("base64")}`;
  }
  composition.embeddedQuestionAssets = embedded;
}

const errors = [];
const checks = [];
const check = (condition, label, detail = "") => { checks.push({ label, pass: Boolean(condition), detail }); if (!condition) errors.push(`${label}${detail ? `: ${detail}` : ""}`); };

const current = loadLibrary(fs.readFileSync(libraryPath, "utf8"));
const head = loadLibrary(childProcess.execFileSync("git", ["show", `HEAD:${libraryRel}`], { cwd: root, encoding: "utf8", maxBuffer: 30_000_000 }));
const currentEntries = entries(current);
const factorModule = current.concepts[CONCEPT_ID];
const factorEntries = currentEntries.filter(entry => entry.conceptId === CONCEPT_ID);
const authoredById = new Map(productionQuestions.map(question => [String(question.id), question]));

check(productionQuestions.length === 240, "author count", String(productionQuestions.length));
check(ID_FIRST === 42320 && ID_LAST === 42559, "ID range", `${ID_FIRST}-${ID_LAST}`);
check(productionQuestions.every((question, index) => question.id === ID_FIRST + index), "contiguous unique IDs");
check(new Set(productionQuestions.map(question => question.id)).size === 240, "unique author IDs");
check(current.canonicalQuestionCount === 9539, "canonical question total", `${current.canonicalQuestionCount}`);
check(current.conceptCount === 135, "concept total", `${current.conceptCount}`);
check(Boolean(factorModule), "factor-markets module registered");
check(factorEntries.length === 240, "published factor-market count", String(factorEntries.length));
check(current.registry.concepts.filter(record => record.canonicalConceptId === CONCEPT_ID).length === 1, "single registry concept registration");

const pinValues = {
  ids: productionQuestions.map(question => question.id), answers: productionQuestions.map(question => question.answer),
  skills: productionQuestions.map(question => question.primarySkill), objectives: productionQuestions.map(question => question.objective),
  difficulties: productionQuestions.map(question => question.difficulty), pools: productionQuestions.map(question => question.pool),
  graphs: productionQuestions.map(question => question.asset), stems: productionQuestions.map(question => question.q)
};
for (const [key, values] of Object.entries(pinValues)) check(digest(values) === PINS[key], `pinned ${key} digest`, digest(values));

check(sameDistribution(distribution(productionQuestions, question => question.objective), EXPECTED_OBJECTIVES), "objective distribution", stable(distribution(productionQuestions, question => question.objective)));
check(sameDistribution(distribution(productionQuestions, question => question.difficulty), EXPECTED_DIFFICULTY), "difficulty distribution", stable(distribution(productionQuestions, question => question.difficulty)));
check(sameDistribution(distribution(productionQuestions, question => question.pool), EXPECTED_POOLS), "pool distribution", stable(distribution(productionQuestions, question => question.pool)));
check(new Set(productionQuestions.map(question => normalize(question.q))).size === 240, "visible-stem uniqueness");
check(productionQuestions.every(question => OBJECTIVES[question.objective] && Object.values(SUBTOPICS).includes(question.tag)), "required objective/subtopic metadata");
check(productionQuestions.every(question => question.feedback.split(/\s+/).length >= 10), "explanatory feedback floor");

const answerPositions = [0, 0, 0, 0];
for (const { question } of factorEntries) {
  const authored = authoredById.get(String(question.id));
  const matching = question.options.map(option => sha256(normalizeAnswer(option)) === question.aHash);
  check(matching.filter(Boolean).length === 1, `option hash ${question.id}`);
  const index = matching.indexOf(true);
  if (index >= 0) answerPositions[index] += 1;
  check(index === Number(question.id) % 4, `answer rotation ${question.id}`, String(index));
  check(!("answer" in question) && !("correctAnswer" in question) && !("correctIndex" in question) && !("a" in question), `no answer leakage ${question.id}`);
  check(question.tag === authored.tag && question.objective === authored.objective && question.primarySkill === authored.primarySkill, `published metadata ${question.id}`);
}
check(answerPositions.every(count => count === 60), "balanced answer positions", answerPositions.join(","));

const graphQuestions = productionQuestions.filter(question => question.graphRequired);
check(graphQuestions.length === 64, "graph-dependent count", String(graphQuestions.length));
for (const [filename, expected] of Object.entries(ASSETS)) {
  const assetPath = path.join(assetDir, filename);
  check(fs.existsSync(assetPath), `asset exists ${filename}`);
  if (!fs.existsSync(assetPath)) continue;
  const bytes = fs.readFileSync(assetPath);
  const size = webpDimensions(bytes);
  check(bytes.length === expected.bytes && sha256(bytes) === expected.sha256 && size.width === expected.width && size.height === expected.height, `asset pin ${filename}`);
  check(graphQuestions.filter(question => question.asset === filename).length === expected.count, `asset allocation ${filename}`);
  const inventory = current.assetInventory.filter(asset => asset.conceptId === CONCEPT_ID && asset.filename === filename);
  check(inventory.length === 1, `single asset registration ${filename}`);
  check(Boolean(GRAPH_ASSETS[filename].imageAlt && GRAPH_ASSETS[filename].graphDescription), `asset accessibility ${filename}`);
}
check(fs.readdirSync(assetDir).filter(filename => /\.webp$/i.test(filename)).length === 9, "no orphan LABOR assets");
check(productionQuestions.every(question => !/\.webp\b/i.test(question.q)), "no filename leakage");
check(productionQuestions.every(question => { const first = question.q.match(/\p{L}/u)?.[0]; return !first || first === first.toUpperCase(); }), "stem capitalization");
check(graphQuestions.every(question => /^LABOR-0[1-9]\.webp$/.test(question.asset) && /^Refer to the graph above\.\s+\S/i.test(question.q)), "graph-dependency surface audit");

const banned = [
  /\bRead the\b/i, /The dot shows/i, /According to the dot/i, /Which statement best/i,
  /Which of the following best/i, /most accurately/i, /\bhundred workers\b/i,
  /\bhundreds workers\b/i, /\$20 dollars/i, /Correct\. The answer/i,
  /Correct\. The wage/i, /Correct\. Employment/i, /\bobviously\b/i, /\balways\b/i
];
for (const pattern of banned) {
  const hits = productionQuestions.filter(question => pattern.test([question.q, question.answer, ...question.distractors, question.feedback].join(" ")));
  check(hits.length === 0, `copy audit ${pattern}`, hits.map(question => question.id).join(","));
}
const visibleStem = question => question.q.replace(/^Refer to the graph above\.\s*/i, "");
const openingCounts = distribution(productionQuestions, question => visibleStem(question).split(/\s+/).slice(0, 4).join(" "));
check(Math.max(...Object.values(openingCounts)) <= 12, "repeated opening cap", String(Math.max(...Object.values(openingCounts))));

const tokenized = productionQuestions.map(question => ({ id: question.id, tokens: new Set(normalize(visibleStem(question)).split(/\s+/)) }));
const nearDuplicates = [];
for (let left = 0; left < tokenized.length; left += 1) {
  for (let right = left + 1; right < tokenized.length; right += 1) {
    if (jaccard(tokenized[left].tokens, tokenized[right].tokens) >= 0.78) nearDuplicates.push([tokenized[left].id, tokenized[right].id]);
  }
}
check(nearDuplicates.length === 0, "near-duplicate stem audit", JSON.stringify(nearDuplicates.slice(0, 10)));

const headById = new Map(entries(head).map(entry => [String(entry.question.id), stable(entry.question)]));
const currentById = new Map(currentEntries.map(entry => [String(entry.question.id), stable(entry.question)]));
const auditScopeIds=new Set(Array.from({length:43059-42320+1},(_,index)=>String(42320+index)));
const activeRepairIds=new Set(Array.from({length:43327-43060+1},(_,index)=>String(43060+index)));
const changedBaseline = [...headById].filter(([id, record]) => !auditScopeIds.has(id) && !activeRepairIds.has(id) && currentById.get(id) !== record).map(([id]) => id);
check(changedBaseline.length === 0, "protected records outside active repair scope unchanged", changedBaseline.slice(0, 20).join(","));
check(current.assetInventory.length === 494, "asset inventory total", String(current.assetInventory.length));

const protectedPaths = [
  "build/faculty-build-composer/authoring/externalities_question_pool_author.mjs",
  "build/faculty-build-composer/authoring/public_goods_common_resources_question_pool_author.mjs"
];
const protectedDiff = childProcess.execFileSync("git", ["diff", "--name-only", "--", ...protectedPaths], { cwd: root, encoding: "utf8" }).trim();
check(!protectedDiff, "protected production sources unchanged", protectedDiff);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const reviewManifest = JSON.parse(fs.readFileSync(reviewManifestPath, "utf8"));
check(registry.canonicalQuestionCount === 9539 && manifest.canonicalQuestionCount === 9539, "registry/manifest question totals");
check(manifest.assetCount === 494 && manifest.conceptCount === 135, "manifest totals");
const reviewMapping = reviewManifest.concepts.find(item => item.canonicalConceptId === CONCEPT_ID);
check(reviewMapping?.diagnosable === true && reviewMapping?.disposition === "REVIEW_SHEET" && reviewMapping?.primaryReviewCode === "MICRO-57", "concept-review/report integration");

const quickStartDir = path.join(root, "build/faculty-build-composer/tests/recipes");
const knownConcepts = new Set(Object.keys(current.concepts));
const brokenRecipes = [];
for (const filename of fs.readdirSync(quickStartDir).filter(name => name.endsWith(".json"))) {
  const recipe = JSON.parse(fs.readFileSync(path.join(quickStartDir, filename), "utf8"));
  for (const id of recipe.selectedConceptIds || recipe.concepts || []) if (!knownConcepts.has(id)) brokenRecipes.push(`${filename}:${id}`);
}
check(brokenRecipes.length === 0, "quick-start concept references", brokenRecipes.join(","));

const focusedRecipe = {
  schemaVersion: core.RECIPE_SCHEMA_VERSION,
  title: "Factor Markets Mastery Quest",
  slug: "factor-markets-production-validation",
  supportedModes: [...core.MODE_ORDER],
  selectedConceptIds: [CONCEPT_ID],
  checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
};
const focused = core.compose(current, focusedRecipe);
check(focused.errors.length === 0, "focused composition", focused.errors.join(" | "));
check(focused.validation.modes.length === 10 && focused.validation.modes.every(mode => mode.ok), "all focused modes pass", JSON.stringify(focused.validation.modes));
check(focused.counts.totalCanonical === 240 && focused.counts.graph === 64 && focused.counts.graphSafe >= 10, "focused composition counts", stable(focused.counts));
check(focused.counts.repair === 6 && focused.counts.bridge === 6, "focused adaptive support depth", `${focused.counts.repair}/${focused.counts.bridge}`);
check((await core.verifyAnswers(focused)).ok, "focused answer verification");
embedQuestionAssets(focused);
helpers.attachConceptReviewRuntime(core, focused, current, [CONCEPT_ID]);
check(focused.conceptReviewRuntimeIndex.diagnosticConceptIds.includes(CONCEPT_ID), "focused Mastery Report diagnostic signal");
const template = helpers.loadCanonicalTemplate();
check(/feedback:\s*2800/.test(template), "ordinary feedback timing remains 2800 ms");
const config = await core.createConfig(focusedRecipe, current, await core.sha256Hex(template));
const metadata = helpers.createMetadata(core, focused, config, current, { phase: PHASE, sourceVersion: SOURCE_VERSION });
const focusedHtml = core.buildHtml(template, focused, config, metadata);
const inlineScripts = helpers.assertInlineScriptsCompile(focusedHtml, "factor-markets-production-sample.html");
check(Object.keys(ASSETS).every(filename => focusedHtml.includes(filename)), "focused build includes all LABOR assets");
check(focusedHtml.includes("graphDescription") && focusedHtml.includes("openGraphLightbox"), "focused graph accessibility/enlargement runtime");
check(focusedHtml.includes("Repair") && focusedHtml.includes("Bridge") && focusedHtml.includes("Mastery Report"), "focused adaptive/report runtime");
const artifact = helpers.writeTestArtifact("tests/factor-markets-production-sample.html", focusedHtml);

const result = { status: errors.length ? "FAIL" : "PASS", checks: checks.length, errors, summary: {
  newQuestions: 240, retainedExistingRecords: 0, resultingConceptRecords: factorEntries.length,
  idRange: `${ID_FIRST}-${ID_LAST}`, graphQuestions: graphQuestions.length,
  objectiveDistribution: distribution(productionQuestions, question => question.objective),
  difficultyDistribution: distribution(productionQuestions, question => question.difficulty),
  poolDistribution: distribution(productionQuestions, question => question.pool),
  graphDistribution: distribution(productionQuestions, question => question.asset),
  answerPositions, librarySha256: current.librarySha256,
  focusedModes: focused.validation.modes.map(mode => ({ mode: mode.mode, ok: mode.ok })),
  inlineScripts, artifact
} };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
