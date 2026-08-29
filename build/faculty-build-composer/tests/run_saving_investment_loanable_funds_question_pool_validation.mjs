import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  PHASE, SOURCE_VERSION, ID_FIRST, ID_LAST, CONCEPT_ID, OBJECTIVES, SUBTOPICS,
  GRAPH_ASSETS, QUARANTINED_ASSETS, productionQuestions
} from "../authoring/saving_investment_loanable_funds_question_pool_author.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const libraryRel = "build/faculty-build-composer/data/composer_library.js";
const libraryPath = path.join(root, libraryRel);
const registryPath = path.join(root, "build/faculty-build-composer/data/composer_registry.json");
const manifestPath = path.join(root, "build/faculty-build-composer/data/composer_library_manifest.json");
const reviewManifestPath = path.join(root, "build/faculty-build-composer/data/concept-reviews/manifest.json");
const assetDir = path.join(root, "build/faculty-build-composer/data/question-assets/saving-investment-and-loanable-funds");
const quarantineDir = path.join(root, "build/faculty-build-composer/data/question-assets/_incoming-loanable-funds");
const require = createRequire(import.meta.url);
const core = require("../composer-core.js");
const helpers = require("./composer-test-helpers.js");

const PINS = Object.freeze({
  ids: "0d59129e6f17c4797c502dd165ce19fce90d04a253cbf292ab183e11de56041e",
  answers: "84ee115b3930a8ce39863bbe05fd43634daa787bbd77add86c579c3128a00e8d",
  skills: "efe3421b8b6dcfaa8f7b0c551b30466b46a506ddadc2cae34c95233b08e4ec04",
  objectives: "2b0fa311eec5602d55cd834ec7fc6e1cf2b51719df1c1701050b43c0a7736462",
  difficulties: "e56d49c807e43df4cff37909c0cc4b45230bbdbb204d2008fde8cc2d31eeb1d6",
  pools: "310f83a5ff27182506e0de005973c02b10423625143f831a983d896bed8bebc7",
  graphs: "269d975adc76dbe126e851fa591e3f1b5472afb6bdd2aa2ced620dbfa3e808ab",
  stems: "03b0225eeb41887fe4f6133866d97b2a5fe23ecb37fe7a69f03b205bc1560e11"
});

const ASSETS = Object.freeze({
  "LOANABLE-01.webp": { count: 10, bytes: 64002, width: 1720, height: 1200, sha256: "ffcf2c288859e6670f30c4692c1d21b312ce00c767b98f64f9e7cd36ca96e172" },
  "LOANABLE-02.webp": { count: 7, bytes: 72358, width: 1623, height: 1161, sha256: "add4e97e9dcc463277b404e69b2d9286c9de10c1a8074affb9b23b208bb3065d" },
  "LOANABLE-03.webp": { count: 7, bytes: 76794, width: 1720, height: 1200, sha256: "1c1aa50c77e4ecb09838dd4b4089d53d4b3fe32277a35b110570a3f760556dcb" },
  "LOANABLE-04.webp": { count: 6, bytes: 79462, width: 1720, height: 1200, sha256: "55e31006196b53b5dccfd2e836f2b2874479d14784682c2f2720bd5a3e3afd8a" },
  "LOANABLE-05.webp": { count: 6, bytes: 71888, width: 1720, height: 1200, sha256: "bc92cb3b9d783df52a0b385d9cb434f0de5fc97f9ffbbcfb380f724d9db4fb4f" },
  "LOANABLE-06.webp": { count: 7, bytes: 73214, width: 1646, height: 1170, sha256: "b8e52bcb99e62e8a531fcf2abe38620dffdedbcdbdd62cb508c9a4948f9c8ec1" },
  "LOANABLE-07.webp": { count: 7, bytes: 74826, width: 1653, height: 1140, sha256: "70d6c2b1b959a05cf5670dca92d9b83abfbf74ffe90f85b87da8078b19633a65" },
  "LOANABLE-08.webp": { count: 10, bytes: 83980, width: 1652, height: 1200, sha256: "722f51bc317e6480b88c30cf29bdbbea8203b7e979ad253034417098d40ae8df" }
});

const EXPECTED_OBJECTIVES = Object.freeze({
  SLF1: 16, SLF2: 19, SLF3: 14, SLF4: 19, SLF5: 13,
  SLF6: 19, SLF7: 18, SLF8: 19, SLF9: 15, SLF10: 8
});
const EXPECTED_DIFFICULTY = Object.freeze({ easy: 40, medium: 60, hard: 36, elite: 12, legendary: 12 });
const EXPECTED_POOLS = Object.freeze({ easy: 34, medium: 42, hard: 30, elite: 12, legendary: 6, easyBoss: 6, mediumBoss: 6, finalBoss: 6, legendaryBoss: 6, repairQuestions: 6, bridgeQuestions: 6 });

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
const slfModule = current.concepts[CONCEPT_ID];
const slfEntries = currentEntries.filter(entry => entry.conceptId === CONCEPT_ID);
const authoredById = new Map(productionQuestions.map(question => [String(question.id), question]));

check(productionQuestions.length === 160, "author count", String(productionQuestions.length));
check(ID_FIRST === 43168 && ID_LAST === 43327, "ID range", `${ID_FIRST}-${ID_LAST}`);
check(productionQuestions.every((question, index) => question.id === ID_FIRST + index), "contiguous unique IDs");
check(new Set(productionQuestions.map(question => question.id)).size === 160, "unique author IDs");
check(current.canonicalQuestionCount === 9539, "canonical question total", `${current.canonicalQuestionCount}`);
check(current.conceptCount === 135, "concept total", `${current.conceptCount}`);
check(Boolean(slfModule), "saving-investment-loanable-funds module registered");
check(slfEntries.length === 160, "published saving-investment-loanable-funds count", String(slfEntries.length));
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
check(new Set(productionQuestions.map(question => normalize(question.q))).size === 160, "visible-stem uniqueness");
check(productionQuestions.every(question => OBJECTIVES[question.objective] && Object.values(SUBTOPICS).includes(question.tag)), "required objective/subtopic metadata");
check(productionQuestions.every(question => question.feedback.split(/\s+/).length >= 10), "explanatory feedback floor");

const answerPositions = [0, 0, 0, 0];
for (const { question } of slfEntries) {
  const authored = authoredById.get(String(question.id));
  const matching = question.options.map(option => sha256(normalizeAnswer(option)) === question.aHash);
  check(matching.filter(Boolean).length === 1, `option hash ${question.id}`);
  const index = matching.indexOf(true);
  if (index >= 0) answerPositions[index] += 1;
  check(index === Number(question.id) % 4, `answer rotation ${question.id}`, String(index));
  check(!("answer" in question) && !("correctAnswer" in question) && !("correctIndex" in question) && !("a" in question), `no answer leakage ${question.id}`);
  check(question.tag === authored.tag && question.objective === authored.objective && question.primarySkill === authored.primarySkill, `published metadata ${question.id}`);
}
check(answerPositions.every(count => count === 40), "balanced answer positions", answerPositions.join(","));

const graphQuestions = productionQuestions.filter(question => question.graphRequired);
check(graphQuestions.length === 60, "graph-dependent count", String(graphQuestions.length));
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
check(fs.readdirSync(assetDir).filter(filename => /\.webp$/i.test(filename)).length === 8, "no orphan LOANABLE assets");
check(productionQuestions.every(question => !/\.webp\b/i.test(question.q)), "no filename leakage");
check(productionQuestions.every(question => { const first = question.q.match(/\p{L}/u)?.[0]; return !first || first === first.toUpperCase(); }), "stem capitalization");
check(graphQuestions.every(question => /^LOANABLE-0[1-8]\.webp$/.test(question.asset) && /^Refer to the graph above\.\s+\S/i.test(question.q)), "graph-dependency surface audit");
check(Object.keys(QUARANTINED_ASSETS).every(filename=>fs.existsSync(path.join(quarantineDir,filename))), "quarantined assets retained");
check(Object.keys(QUARANTINED_ASSETS).every(filename=>!graphQuestions.some(question=>question.asset===filename)), "quarantined assets excluded from questions");
check(Object.keys(QUARANTINED_ASSETS).every(filename=>!current.assetInventory.some(asset=>asset.filename===filename&&asset.conceptId===CONCEPT_ID)), "quarantined assets excluded from inventory");

const allCopy=productionQuestions.map(question=>[question.q,question.answer,...question.distractors,question.feedback].join(" "));
const formulaCopy=allCopy.map(copy=>copy.replace(/[−–—]/g,"-"));
check(formulaCopy.some(copy=>/private saving.*Y\s*-\s*T\s*-\s*C|Y\s*-\s*T\s*-\s*C.*private saving/i.test(copy)), "private-saving identity pin");
check(formulaCopy.some(copy=>/public saving.*T\s*-\s*G|T\s*-\s*G.*public saving/i.test(copy)), "public-saving identity pin");
check(formulaCopy.some(copy=>/national saving.*Y\s*-\s*C\s*-\s*G|Y\s*-\s*C\s*-\s*G.*national saving/i.test(copy)), "national-saving identity pin");
check(allCopy.some(copy=>/closed economy/i.test(copy)&&/S\s*=\s*I/i.test(copy)), "closed-economy S = I pin");
check(productionQuestions.filter(question=>/S\s*=\s*I/i.test(allCopy[productionQuestions.indexOf(question)])).every(question=>/closed[- ]econom/i.test(allCopy[productionQuestions.indexOf(question)])), "S = I statements are closed-economy qualified");
check(allCopy.some(copy=>/supply shifts right/i.test(copy)&&/rate falls/i.test(copy)&&/(quantity|funds).*(rise|increase)/i.test(copy)), "saving-increase shift chain pin");
check(allCopy.some(copy=>/demand shifts right/i.test(copy)&&/rate rises/i.test(copy)&&/(quantity|funds).*(rise|increase)/i.test(copy)), "investment-demand increase chain pin");
check(allCopy.some(copy=>/deficit/i.test(copy)&&/public saving falls/i.test(copy)&&/supply shifts left/i.test(copy)&&/rate rises/i.test(copy)), "deficit crowding-out chain pin");
const movementShiftViolations=productionQuestions.filter(question=>{const copy=[question.q,question.answer,question.feedback].join(" ");return /(?:higher|rise|increase in the) real interest rate.{0,45}shift(?:s|ed)? (?:the )?(?:saving|investment)/i.test(copy)&&!/error|does not|not a change|rather than|instead of/i.test(copy);});
check(movementShiftViolations.length===0,"movement-versus-shift regression",movementShiftViolations.map(question=>question.id).join(","));

const banned = [
  /\bRead the\b/i, /The dot shows/i, /According to the dot/i, /Which statement best/i,
  /Which of the following best/i, /most accurately/i, /\bhundred workers\b/i,
  /\bhundreds workers\b/i, /\$20 dollars/i, /Correct\. The answer/i,
  /Correct\. The wage/i, /Correct\. Employment/i, /\bobviously\b/i
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
check(nearDuplicates.length <= 12, "near-duplicate stem audit", JSON.stringify(nearDuplicates.slice(0, 12)));
const distractorSetCounts=distribution(productionQuestions,question=>question.distractors.map(normalize).sort().join(" | "));
const maximumRepeatedDistractorSet=Math.max(...Object.values(distractorSetCounts));
check(maximumRepeatedDistractorSet<=4,"repeated distractor-set cap",String(maximumRepeatedDistractorSet));

const headById = new Map(entries(head).map(entry => [String(entry.question.id), stable(entry.question)]));
const currentById = new Map(currentEntries.map(entry => [String(entry.question.id), stable(entry.question)]));
const phaseIds=new Set(productionQuestions.map(question=>String(question.id)));
const changedBaseline = [...headById].filter(([id, record]) => !phaseIds.has(id) && currentById.get(id) !== record).map(([id]) => id);
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
check(reviewMapping?.diagnosable === true && reviewMapping?.disposition === "NO_SHEET_INTEGRATION_META" && reviewMapping?.primaryReviewCode == null, "concept-review/report integration");

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
  title: "Saving, Investment & Loanable Funds Mastery Quest",
  slug: "saving-investment-loanable-funds-production-validation",
  supportedModes: [...core.MODE_ORDER],
  selectedConceptIds: [CONCEPT_ID],
  checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
};
const focused = core.compose(current, focusedRecipe);
check(focused.errors.length === 0, "focused composition", focused.errors.join(" | "));
check(focused.validation.modes.length === 10 && focused.validation.modes.every(mode => mode.ok), "all focused modes pass", JSON.stringify(focused.validation.modes));
check(focused.counts.totalCanonical === 160 && focused.counts.graph === 60 && focused.counts.graphSafe >= 10, "focused composition counts", stable(focused.counts));
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
const inlineScripts = helpers.assertInlineScriptsCompile(focusedHtml, "saving-investment-loanable-funds-production-sample.html");
check(Object.keys(ASSETS).every(filename => focusedHtml.includes(filename)), "focused build includes all LOANABLE assets");
check(focusedHtml.includes("graphDescription") && focusedHtml.includes("openGraphLightbox"), "focused graph accessibility/enlargement runtime");
check(focusedHtml.includes("Repair") && focusedHtml.includes("Bridge") && focusedHtml.includes("Mastery Report"), "focused adaptive/report runtime");
const artifact = helpers.writeTestArtifact("tests/saving-investment-loanable-funds-production-sample.html", focusedHtml);
const facultySelection=[];
const addFaculty=q=>{if(q&&!facultySelection.includes(q))facultySelection.push(q);};
for(const objective of Object.keys(OBJECTIVES))addFaculty(productionQuestions.find(q=>q.objective===objective));
for(const difficulty of Object.keys(EXPECTED_DIFFICULTY))addFaculty(productionQuestions.find(q=>q.difficulty===difficulty));
for(const asset of Object.keys(ASSETS))addFaculty(productionQuestions.find(q=>q.asset===asset));
for(const pool of ["repairQuestions","bridgeQuestions","finalBoss","legendaryBoss","elite"])addFaculty(productionQuestions.find(q=>q.pool===pool));
const esc=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const facultyCards=facultySelection.map(q=>`<article><h2>${esc(q.objective)} · ${esc(q.difficulty)} · ${esc(q.pool)}</h2><p><strong>${esc(q.q)}</strong></p><ol>${[q.answer,...q.distractors].map(option=>`<li>${esc(option)}${option===q.answer?" <b>(key)</b>":""}</li>`).join("")}</ol><p>Feedback: ${esc(q.feedback)}</p><p>Asset: ${esc(q.asset||"none")}</p></article>`).join("");
const facultyHtml=`<!doctype html><meta charset="utf-8"><title>Saving, Investment & Loanable Funds — Faculty Sample</title><style>body{font:16px/1.5 system-ui;max-width:980px;margin:2rem auto;padding:0 1rem}article{border:1px solid #bbb;border-radius:10px;padding:1rem;margin:1rem 0}h2{font-size:1rem;color:#315}b{color:#075}</style><h1>Saving, Investment & Loanable Funds — Faculty Sample</h1><p>${facultySelection.length} records spanning all objectives, difficulty bands, published graph assets, Repair, Bridge, checkpoint pools, elite, and legendary.</p>${facultyCards}`;
const facultyArtifact=helpers.writeTestArtifact("tests/saving-investment-loanable-funds-faculty-sample.html",facultyHtml);

const result = { status: errors.length ? "FAIL" : "PASS", checks: checks.length, errors, summary: {
  newQuestions: 160, retainedExistingRecords: 0, resultingConceptRecords: slfEntries.length,
  idRange: `${ID_FIRST}-${ID_LAST}`, graphQuestions: graphQuestions.length,
  objectiveDistribution: distribution(productionQuestions, question => question.objective),
  difficultyDistribution: distribution(productionQuestions, question => question.difficulty),
  poolDistribution: distribution(productionQuestions, question => question.pool),
  graphDistribution: distribution(productionQuestions, question => question.asset),
  answerPositions, librarySha256: current.librarySha256,
  focusedModes: focused.validation.modes.map(mode => ({ mode: mode.mode, ok: mode.ok })),
  inlineScripts, artifact, facultyArtifact, nearDuplicatePairs:nearDuplicates.length, maximumRepeatedDistractorSet
} };
result.summary.validationArtifact=helpers.writeTestArtifact("tests/saving-investment-loanable-funds-validation-results.json",`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
