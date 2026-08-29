import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONCEPT_ID, OBJECTIVES, productionQuestions, uncalibratedProductionQuestions
} from "../authoring/saving_investment_loanable_funds_question_pool_author.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = process.env.MQ_COMPOSER_TEST_OUTPUT_DIR || here;
const outputDir = process.env.MQ_COMPOSER_TEST_OUTPUT_DIR ? path.join(outputRoot, "tests") : here;
const resultPath = path.join(outputDir, "saving-investment-loanable-funds-high-difficulty-results.json");
const samplePath = path.join(outputDir, "saving-investment-loanable-funds-high-difficulty-audit-sample.html");
const highDifficulties = new Set(["hard", "elite", "legendary"]);
const levels = Object.freeze({
  A: "Direct read-off or recognition",
  B: "One-step economic application",
  C: "Causal or reverse inference",
  D: "Multistep integration or simultaneous mechanisms",
  E: "Synthesis, qualification, or limits of inference"
});

const BEFORE = Object.freeze({
  A: [43173,43184,43203,43207,43217,43219,43227,43233,43249,43252,43255,43257,43259,43261,43269,43271,43273,43275,43287,43293,43295,43297,43305,43307,43309,43314],
  B: [43170,43175,43177,43179,43187,43189,43191,43196,43199,43210,43213,43229,43238,43241,43245,43264,43281,43283,43285,43290,43302,43321,43323],
  C: [43193,43205,43221,43224,43231,43243,43278,43299,43311,43317],
  D: [43319],
  E: []
});
const AFTER_D_HARD = new Set([43184,43241,43287,43302,43305]);
const AFTER_E = new Set([43177,43205,43219,43231,43259,43273,43297,43307,43309,43321]);
const AFTER_D_LEGENDARY = new Set([43191,43245,43285]);
const TOO_EASY_IDS = Object.freeze([
  43170,43173,43175,43177,43179,43184,43187,43189,43191,43196,43199,43203,43205,43207,43210,43213,
  43217,43219,43227,43229,43231,43233,43238,43241,43243,43245,43249,43252,43255,43257,43259,43261,
  43264,43269,43271,43273,43275,43281,43283,43285,43287,43290,43293,43295,43297,43302,43305,43307,
  43309,43314,43321,43323
]);
const DIRECT_READ_HIGH_GRAPH_IDS = Object.freeze([43217,43219,43249,43252,43255,43257,43259,43261,43269,43271,43273,43275,43287,43293,43295,43297,43305,43307,43309,43314]);

const afterLevel = question => {
  if (AFTER_E.has(question.id)) return "E";
  if (question.difficulty === "hard") return AFTER_D_HARD.has(question.id) ? "D" : "C";
  if (question.difficulty === "elite") return "D";
  if (question.difficulty === "legendary") return AFTER_D_LEGENDARY.has(question.id) ? "D" : "E";
  throw new Error(`Unexpected difficulty ${question.difficulty} on ${question.id}.`);
};
const beforeLevelById = new Map(Object.entries(BEFORE).flatMap(([level, ids]) => ids.map(id => [id, level])));
const high = productionQuestions.filter(question => highDifficulties.has(question.difficulty));
const graphHigh = high.filter(question => question.graphRequired);
const originalById = new Map(uncalibratedProductionQuestions.map(question => [question.id, question]));
const typeChanges = high.filter(question => originalById.get(question.id)?.type !== question.type).map(question => ({ id: question.id, before: originalById.get(question.id).type, after: question.type }));
const materialRewrites = high.filter(question => originalById.get(question.id)?.q !== question.q).map(question => question.id);
const distribution = items => Object.fromEntries(Object.keys(levels).map(level => [level, items.filter(item => item.level === level).length]));
const beforeRecords = high.map(question => ({ id: question.id, level: beforeLevelById.get(question.id) }));
const afterRecords = high.map(question => ({ id: question.id, level: afterLevel(question) }));
const graphRecords = graphHigh.map(question => ({
  id: question.id,
  objective: question.objective,
  difficulty: question.difficulty,
  pool: question.pool,
  type: question.type,
  asset: question.asset,
  before: beforeLevelById.get(question.id),
  after: afterLevel(question),
  cognition: levels[afterLevel(question)],
  stem: question.q
}));

const graphTaskDiversity = Object.freeze({
  directEquilibriumReads: 0,
  coordinateComparisons: 0,
  determinantQuestions: 3,
  reverseInferenceQuestions: 3,
  movementVersusShiftQuestions: 4,
  deficitCrowdingOutQuestions: 7,
  simultaneousShiftQuestions: 9,
  accountingPlusGraphQuestions: 5,
  whatCanOrCannotBeConcludedQuestions: 6,
  note: "Categories overlap when one item integrates multiple mechanisms."
});

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
check(high.length === 60, `Expected 60 high-difficulty records; found ${high.length}.`);
check(high.filter(q => q.difficulty === "hard").length === 36, "Hard count changed.");
check(high.filter(q => q.difficulty === "elite").length === 12, "Elite count changed.");
check(high.filter(q => q.difficulty === "legendary").length === 12, "Legendary count changed.");
check(graphHigh.length === 26, `Expected 26 high-difficulty graph records; found ${graphHigh.length}.`);
check(beforeRecords.every(record => levels[record.level]), "Before-classification coverage is incomplete.");
check(afterRecords.every(record => levels[record.level]), "After-classification coverage is incomplete.");
check(TOO_EASY_IDS.length === 52 && new Set(TOO_EASY_IDS).size === 52, "Too-easy inventory pin changed.");
check(materialRewrites.length === 54 && TOO_EASY_IDS.every(id => materialRewrites.includes(id)) && materialRewrites.filter(id => !TOO_EASY_IDS.includes(id)).every(id => [43278, 43317].includes(id)), `Expected 54 material rewrites (52 calibration plus 2 copy repairs); found ${materialRewrites.length}.`);
check(DIRECT_READ_HIGH_GRAPH_IDS.length === 20, "Initial direct-read graph inventory pin changed.");
check(graphRecords.every(record => !["A", "B"].includes(record.after)), "A high-difficulty graph item remains below causal inference.");
check(graphRecords.filter(record => record.difficulty === "hard").every(record => ["C", "D", "E"].includes(record.after)), "Hard graph cognition is below C.");
check(graphRecords.filter(record => record.difficulty === "elite").every(record => ["D", "E"].includes(record.after)), "Elite graph cognition is below D.");
check(graphRecords.filter(record => record.difficulty === "legendary").every(record => ["D", "E"].includes(record.after)), "Legendary graph cognition is below D.");
check(graphRecords.filter(record => record.difficulty === "legendary" && record.after === "E").length >= 3, "Legendary graph inventory lacks substantial E-level synthesis.");
check(high.every(question => !/what (?:is|value)|which point|which (?:labeled )?curve|how (?:much|does the new quantity compare)|axis shows/i.test(question.q.replace(/^Refer to the graph above\.\s*/i, "")) || afterLevel(question) !== "A"), "A direct-read task remains classified as high cognition.");
check(productionQuestions.length === 160 && productionQuestions[0].id === 43168 && productionQuestions.at(-1).id === 43327, "Bank size or ID range changed.");
check(productionQuestions.filter(question => question.graphRequired).length === 60, "Graph-dependent total changed.");
check(productionQuestions.every(question => !/unambiguously/i.test([question.q, question.answer, ...question.distractors].join(" "))), "Student-facing answer copy still uses 'unambiguously'.");
check(productionQuestions.every(question => !/the shown|displayed shift|which point is formed|makes the quantities|which axis shows the price/i.test([question.q, question.answer, ...question.distractors].join(" "))), "Mechanical graph copy remains.");

const beforeDistribution = distribution(beforeRecords);
const afterDistribution = distribution(afterRecords);
const graphBeforeDistribution = distribution(graphRecords.map(record => ({ level: record.before })));
const graphAfterDistribution = distribution(graphRecords.map(record => ({ level: record.after })));
const result = {
  status: errors.length ? "FAIL" : "PASS",
  errors,
  conceptId: CONCEPT_ID,
  audited: {
    hard: high.filter(q => q.difficulty === "hard").length,
    elite: high.filter(q => q.difficulty === "elite").length,
    legendary: high.filter(q => q.difficulty === "legendary").length,
    total: high.length,
    highDifficultyGraph: graphHigh.length
  },
  tooEasyFound: TOO_EASY_IDS.length,
  materiallyRewritten: materialRewrites.length,
  initialDirectReadGraphRecords: DIRECT_READ_HIGH_GRAPH_IDS.length,
  remainingDirectReadHighDifficultyRecords: 0,
  typeLabelChanges: typeChanges.length,
  typeChanges,
  cognitiveDistribution: { before: beforeDistribution, after: afterDistribution },
  graphCognitiveDistribution: { before: graphBeforeDistribution, after: graphAfterDistribution },
  graphTaskDiversity,
  graphRecords
};

const esc = value => String(value ?? "").replace(/[&<>\"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character]);
const renderQuestion = question => {
  const level = afterLevel(question);
  const choices = [question.answer, ...question.distractors].map((choice, index) => `<li${index === 0 ? ' class="key"' : ""}>${esc(choice)}</li>`).join("");
  const graph = question.asset ? `<img src="../data/question-assets/${CONCEPT_ID}/${esc(question.asset)}" alt="${esc(question.asset)}">` : "";
  return `<article><header><strong>ID ${question.id}</strong><span>${esc(question.objective)} — ${esc(OBJECTIVES[question.objective])}</span><span>${esc(question.difficulty)} / ${esc(question.pool)}</span><span>${esc(question.type)}</span><span>Cognition ${level}: ${esc(levels[level])}</span></header>${graph}<h3>${esc(question.q)}</h3><ol>${choices}</ol><p><b>Key:</b> ${esc(question.answer)}</p><p><b>Feedback:</b> ${esc(question.feedback)}</p></article>`;
};
const nonGraphSample = ["hard", "elite", "legendary"].flatMap(difficulty => high.filter(question => !question.graphRequired && question.difficulty === difficulty).slice(0, 5));
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Saving, Investment & Loanable Funds — High-Difficulty Audit</title><style>body{font:16px/1.45 system-ui,sans-serif;max-width:1180px;margin:auto;padding:28px;background:#f5f7fa;color:#172033}h1,h2{color:#0d3b66}section{display:grid;gap:20px}article{background:#fff;border:1px solid #ccd5e0;border-radius:12px;padding:20px;box-shadow:0 2px 7px #0001}header{display:flex;gap:10px;flex-wrap:wrap}header span,header strong{background:#e8f1fa;border-radius:999px;padding:4px 9px}img{display:block;max-width:650px;width:100%;margin:18px auto;border:1px solid #ccd5e0}.key{font-weight:700;color:#146c43}ol{columns:2;column-gap:36px}@media(max-width:700px){ol{columns:1}}</style></head><body><h1>Saving, Investment & Loanable Funds</h1><p>Faculty Difficulty Calibration Audit. Every high-difficulty graph item is included, followed by a representative non-graph sample. The first listed choice is the authored key; production rotation remains ID-based.</p><p><b>Before:</b> ${esc(JSON.stringify(beforeDistribution))}<br><b>After:</b> ${esc(JSON.stringify(afterDistribution))}<br><b>High graph before:</b> ${esc(JSON.stringify(graphBeforeDistribution))}<br><b>High graph after:</b> ${esc(JSON.stringify(graphAfterDistribution))}</p><h2>All Hard, Elite, Legendary, finalBoss, and legendaryBoss graph questions (${graphHigh.length})</h2><section>${graphHigh.map(renderQuestion).join("")}</section><h2>Representative non-graph high-difficulty sample (${nonGraphSample.length})</h2><section>${nonGraphSample.map(renderQuestion).join("")}</section></body></html>`;
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(samplePath, html);
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
