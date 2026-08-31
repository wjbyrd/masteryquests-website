#!/usr/bin/env node

import crypto from "node:crypto";
import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSER = path.join(ROOT, "build", "faculty-build-composer");
const LIBRARY_PATH = path.join(COMPOSER, "data", "composer_library.js");
const REGISTRY_PATH = path.join(COMPOSER, "data", "composer_registry.json");
const MANIFEST_PATH = path.join(COMPOSER, "data", "composer_library_manifest.json");
const REVIEW_MANIFEST_PATH = path.join(COMPOSER, "data", "concept-reviews", "manifest.json");
const ARTIFACT_DIR = path.join(ROOT, "validation_artifacts", "question_quality");
const ORIGINAL_AUDIT_PATH = path.join(ARTIFACT_DIR, "foundations_quality_audit.json");
const ORIGINAL_BASELINE_PATH = path.join(ARTIFACT_DIR, "foundations_quality_audit_pre_remediation.json");
const GRAPH_BASELINE_PATH = path.join(ARTIFACT_DIR, "foundations_quality_audit_graph_evidence_pre_remediation.json");
const AUTHORIZATION_PATH = path.join(ARTIFACT_DIR, "foundations_audit_authorization.json");
const CHANGE_PATH = path.join(ARTIFACT_DIR, "foundations_audit_remediation.json");
const PHASE = "phaseQH5-foundations-curation-graph-evidence-v1";
const GENERATED_AT = "2026-08-31T19:00:00.000Z";
const TARGET_CONCEPTS = new Set([
  "scarcity-and-tradeoffs",
  "opportunity-cost",
  "production-possibilities-frontier",
  "marginal-analysis",
  "incentives",
  "models-and-assumptions"
]);

const fixes = new Map();
function authorize(id, rules, patch, reason) {
  const current = fixes.get(id) || { id, rules: [], patch: {}, reasons: [] };
  current.rules = [...new Set([...current.rules, ...rules])];
  Object.assign(current.patch, patch);
  current.reasons.push(reason);
  fixes.set(id, current);
}

// Five stale answer hashes. The economically correct option already exists.
for (const [id, answer] of Object.entries({
  "P74-INC-H-010": "The metric changed behavior but did not capture the department’s full objective",
  "P74-INC-L-015": "It transfers funds but does not change this donor’s marginal giving decision",
  "ECON-MG-MEDIUM-100": "The value of improved exam preparation is part of the shift’s opportunity cost",
  "P72-OPPC-H-009": "The barrier’s opportunity cost is the $34 million water system",
  "P71-SCAR-LB-004": "Real labor and time remain limited despite the country’s financial wealth"
})) authorize(id, ["invalid-answer-key"], { answer }, "Refresh the stale hash to the independently verified existing correct option.");

authorize("ECON-MG-MEDIUM-100", ["weak-absolute-distractors"], {
  options: [
    "The value of improved exam preparation is part of the shift’s opportunity cost",
    "The earned wage offsets the study group’s benefit in the opportunity-cost calculation",
    "Transportation and other out-of-pocket expenses make up the shift’s opportunity cost",
    "The opportunity cost combines the values of several unchosen Saturday activities"
  ],
  answer: "The value of improved exam preparation is part of the shift’s opportunity cost"
}, "Replace newly exposed absolute distractors with plausible opportunity-cost misconceptions after the stale key is repaired.");

const graphRequiredIds = [
  "ECON-MG-MEDIUM-150", "ECON-MG-MEDIUM-151", "ECON-MG-MEDIUM-152", "ECON-MG-MEDIUM-157", "ECON-MG-MEDIUM-158",
  "ECON-MG-HARD-253", "ECON-MG-HARD-254", "ECON-MG-HARD-256", "ECON-MG-HARD-257",
  "ECON-EC-LEGENDARY-14007", "ECON-MG-LEGENDARY-9000", "ECON-MG-LEGENDARY-9001", "ECON-MG-LEGENDARY-9002", "ECON-MG-LEGENDARY-9003", "ECON-MG-LEGENDARY-9004",
  "ECON-MG-HARD-250", "ECON-MG-HARD-251", "ECON-MG-HARD-252", "ECON-MG-HARD-255",
  "ECON-MG-MEDIUM-153", "ECON-MG-MEDIUM-154", "ECON-MG-MEDIUM-155", "ECON-MG-MEDIUM-156"
];
for (const id of graphRequiredIds) authorize(id, ["image-without-graph-required"], { graphRequired: true }, "The attached PPF supplies evidence required by the stem, so graphRequired must be true.");

for (const [id, q] of Object.entries({
  "40000": "Refer to the graph. Moving from A to B, what is the opportunity cost per additional pizza?",
  "40001": "Refer to the graph. As production moves farther right along bowed PPF0, what happens to the opportunity cost of additional pizzas?",
  "40002": "Refer to the graph. Which proposed change would require greater productive capacity rather than reallocation along PPF0?",
  "40003": "Refer to the graph. On PPF0, moving from A to B gains 20 burgers. What is the opportunity cost per additional burger?",
  "40004": "Refer to the graph. Which statement correctly distinguishes moving from A to B from shifting PPF0 to PPF1?",
  "40005": "Refer to the graph. What can the outward shift establish without knowing society’s preferences?"
})) authorize(id, ["graph-prompt-missing-cue"], { q }, "Add a natural direction to inspect the already-required graph.");

for (const [id, q] of Object.entries({
  "ECON-MG-HARD-250": "Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from A to B?",
  "ECON-MG-HARD-251": "Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from B to C?",
  "ECON-MG-HARD-252": "Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from D to E?",
  "ECON-MG-HARD-255": "Refer to the PPF graph. What is the opportunity cost per additional unit of Good Y when production moves from E to D?",
  "ECON-MG-LEGENDARY-9000": "Refer to the PPF graph. Which answer best states the tradeoff when production moves from B to C?",
  "ECON-MG-LEGENDARY-9002": "Refer to the PPF graph. What is the opportunity cost per additional unit of Good X when production moves from C to D?",
  "ECON-EC-LEGENDARY-14007": "Refer to the PPF graph. Compare the opportunity cost per additional unit of Good X from A to B with the cost from D to E. Which interpretation is supported?"
})) authorize(id, ["graph-evidence-redundant-in-stem"], { q }, "Remove graph-derived quantities from the stem so the learner must inspect the labeled points.");
authorize("ECON-EC-LEGENDARY-14007", ["graph-evidence-redundant-in-stem"], {
  feedback: "From A to B, the graph shows 5 units of Y forgone for 8 units of X; from D to E, it shows 20 Y forgone for 4 X. The opportunity cost of X therefore rises along the bowed-out frontier."
}, "Align feedback with the actual attached PPF while preserving accessibility metadata.");

const feedbackPatches = {
  "ECON-MG-EASY-18": "Brand colors and store music can be omitted when the model’s purpose is to isolate how purchase quantity responds to price.",
  "ECON-MG-EASY-19": "Holding gasoline prices fixed isolates the relationship between the other modeled factors and commute time.",
  "ECON-MG-LEGENDARY-9080": "Exchange rates and global shipping are unlikely to be central mechanisms in a local haircut market, so omitting them can improve focus without invalidating the model.",
  "P52B-MODL-BR-001": "The demand model makes a testable positive prediction, but its conclusion should be limited to settings where its assumptions describe the relevant buying decision.",
  "P52B-MODL-E-001": "The manager simplifies to two influential sales drivers so the model remains usable for the decision it is meant to inform.",
  "P52B-MODL-E-002": "Holding income constant isolates the effect of price instead of mixing a price response with an income-driven demand shift.",
  "P52B-MODL-EL-001": "A simplifying assumption need not be literally realistic if the model predicts well for the narrow question and setting in which it is used.",
  "P52B-MODL-R-001": "An assumption states a condition held fixed or treated as given so the model can trace a particular relationship.",
  "P52B-MODL-R-002": "Simplification is a design feature; rejection is warranted only when omitted details undermine the model’s purpose or performance.",
  "P76-MODL-BR-002": "Holding buyer income fixed is the ceteris-paribus condition that lets the model isolate movement caused by price.",
  "P76-MODL-BR-003": "The emissions prediction is positive analysis; policy evaluation still requires evidence that the fee changes the modeled behavioral margin.",
  "P76-MODL-E-005": "Omitting wall color is useful when it does not materially affect the price-and-traffic relationship the restaurant wants to study.",
  "P76-MODL-E-006": "An economic model is a purposeful simplification used to explain or predict selected relationships, not a complete copy of reality.",
  "P76-MODL-E-007": "The scenario holds bus service unchanged so any predicted ridership response can be attributed to the fare change.",
  "P76-MODL-E-008": "A basic supply-and-demand model is designed to analyze how market conditions determine equilibrium price and quantity.",
  "P76-MODL-EB-001": "Like a map, a model omits details that do not help answer its chosen question while retaining the relationships that do.",
  "P76-MODL-EB-002": "Population is held constant so the study can isolate how income relates to sales rather than combining both influences.",
  "P76-MODL-EB-003": "Reality contains many interacting details; a model selectively represents the mechanisms relevant to a defined purpose.",
  "P76-MODL-EL-003": "Forecast accuracy favors the complex model for prediction, while the simpler model may be better for identifying and communicating the price mechanism.",
  "P76-MODL-EL-004": "Accurate city-level predictions support usefulness, but unmeasured mechanism evidence does not establish why the model succeeds.",
  "P76-MODL-FB-001": "The new fee creates an out-of-sample case where the models disagree, so observed post-fee behavior can distinguish them.",
  "P76-MODL-FB-002": "A conclusion that disappears under one plausible assumption is fragile and should be reported with that sensitivity clearly stated.",
  "P76-MODL-FB-003": "Better historical fit paired with worse new-data prediction is evidence of overfitting rather than a general gain from complexity.",
  "P76-MODL-H-005": "Strict zoning violates the flexible-construction condition, so transferring the housing estimate may produce poor predictions.",
  "P76-MODL-H-006": "Evidence from a wage-rule change targets the models’ conflicting employment predictions and is more informative than another shared-fit observation.",
  "P76-MODL-H-007": "The added variables improve fit but reduce interpretability, creating a prediction-versus-mechanism tradeoff.",
  "P76-MODL-H-008": "Remote work changed the commuting relationship, so the model’s stability and workplace-attendance assumptions need reassessment.",
  "P76-MODL-L-005": "Pandemic workplace closures broke the stable-commuting assumption, explaining why the old travel-demand relationship failed.",
  "P76-MODL-L-006": "App alerts introduced a new purchase mechanism, so the model should incorporate or re-estimate behavior in the smartphone setting.",
  "P76-MODL-L-007": "Long permit delays violate rapid supply adjustment, limiting the rent model’s predictions for that city.",
  "P76-MODL-L-008": "The pipeline disruption is a discriminating test because only the storage-aware model predicts the resulting price spike.",
  "P76-MODL-L-009": "Search costs and long contracts weaken rapid convergence, so the classroom result may not transfer directly to the real market.",
  "P76-MODL-L-010": "Good default prediction does not validate the claimed borrower mechanism when the proxy lacks a demonstrated connection to it.",
  "P76-MODL-L-011": "The policy result is sensitive to a plausible behavioral assumption, so the reversal and the relevant range should be disclosed.",
  "P76-MODL-L-012": "The simpler model may be preferable when the detailed model’s small forecast gain does not justify unavailable and costly data.",
  "P76-MODL-L-013": "A changed policy rule can alter private behavior, making relationships estimated under the old regime unstable.",
  "P76-MODL-LB-004": "Union prevalence changes wage bargaining and labor adjustment, so the transfer depends on whether the original model allows those institutions.",
  "P76-MODL-LB-005": "Historical recession fit supports forecasting performance but cannot establish an unsupported credit mechanism.",
  "P76-MODL-LB-006": "Slight predictive improvement may not justify a model whose conclusions swing with poorly known behavioral parameters.",
  "P76-MODL-M-005": "Licensing blocks the assumed job mobility, so the analyst should revise the assumption or limit the model’s application.",
  "P76-MODL-M-006": "New credit limits add a binding constraint, so income alone no longer predicts the household’s feasible spending response.",
  "P76-MODL-M-007": "An energy shock operates through supply costs, making the supply-disruption model the more relevant mechanism.",
  "P76-MODL-M-008": "One missed month need not invalidate a model that explains the broader pattern; the miss should be tested for noise or structural change.",
  "P76-MODL-MB-001": "Competitor closures violate the forecast’s fixed-competition assumption and may shift demand toward the restaurant.",
  "P76-MODL-MB-002": "The firm should match model horizon to its decision: the layoff model for short-run adjustment and the hiring model for long-run planning.",
  "P76-MODL-MB-003": "The first review is whether density changes a key mechanism or assumption that held in rural markets.",
  "P76-MODL-R-003": "More detail helps only when it improves relevant explanation or prediction enough to justify added complexity and fragility.",
  "P76-MODL-R-004": "If income changes, the fixed-income prediction no longer isolates price and must be adjusted for an income-driven demand shift.",
  "P76-MODL-R-005": "Past fit shows descriptive performance, but competing-mechanism evidence is needed to establish the model’s causal explanation.",
  "P76-MODL-R-006": "A model should transfer only when its important assumptions and mechanisms remain plausible in the new setting.",
  "ECON-MG-PPF-OPPORTUNITY-COST-5011": "Moving from inside the PPF to its frontier uses idle or misallocated resources more fully; productive capacity and the frontier remain unchanged.",
  "P77-PPF-LB-006": "Medical-specific technology pivots the frontier outward toward greater medical output rather than shifting every intercept equally.",
  "P77-PPF-LB-007": "Removing unemployment first moves production to the existing frontier; new machinery then shifts the frontier outward.",
  "P77-PPF-R-002": "A point inside the PPF is attainable with current resources but productively inefficient because some capacity is unused.",
  "P77-PPF-R-003": "Movement along one PPF reallocates production between goods; economic growth requires an outward shift of the frontier.",
  "P77-PPF-R-004": "More resources, improved technology, or better institutions can expand productive capacity and shift the PPF outward.",
  "P77-PPF-R-005": "Specialized resources are less adaptable as production shifts toward one good, so each additional unit can require a larger sacrifice."
};
for (const [id, feedback] of Object.entries(feedbackPatches)) authorize(id, ["repeated-feedback"], { feedback }, "Replace reused boilerplate with scenario-specific explanatory feedback.");

// REVIEW items changed only where the signal represents a genuine cue or calibration problem.
authorize("ECON-MG-EASY-9", ["weak-absolute-distractors"], {
  options: [
    "People respond to incentives",
    "Consumers view fuel economy as unrelated to driving cost",
    "Car buyers respond only after gasoline becomes unavailable",
    "Higher gas prices directly increase the supply of every car"
  ], answer: "People respond to incentives"
}, "Replace unrelated absolutes with plausible response and market-side misconceptions.");
authorize("ECON-MG-EASY-20", ["weak-absolute-distractors"], {
  options: ["Households and firms", "Banks and foreign governments", "Workers and tax agencies", "Retailers and central banks"], answer: "Households and firms"
}, "Remove repeated 'only' cues from a foundational definition item.");
authorize("ECON-MG-EASY-22", ["weak-absolute-distractors"], {
  options: ["Labor services to households", "Household income to product markets", "Goods and services", "Tax revenue to resource markets"], answer: "Goods and services"
}, "Use circular-flow role confusions instead of repeated absolute wording.");
authorize("ECON-MG-EASY-23", ["weak-absolute-distractors"], {
  options: ["The exact market price of each good", "Government’s preferred production mix", "The economy’s current unemployment rate", "Currently feasible combinations of two goods"], answer: "Currently feasible combinations of two goods"
}, "Use neighboring PPF misconceptions without 'only' cues.");
authorize("ECON-MG-CORE-SCARCITY-30003", ["weak-absolute-distractors"], {
  options: ["Resources are limited while wants are unlimited", "Market prices sometimes rise", "Some goods are provided publicly", "Production adjusts slowly to demand"], answer: "Resources are limited while wants are unlimited"
}, "Replace categorical distractors with plausible but insufficient explanations.");
authorize("ECON-MG-MEDIUM-150", ["weak-absolute-distractors"], {
  options: ["A, B, C, D, and E", "F, because it is attainable inside the frontier", "G, because it represents greater output", "B, C, and D, because endpoints use too few goods"], answer: "A, B, C, D, and E"
}, "Use diagnostic inside/outside/endpoint misconceptions without absolute cues.");
authorize("ECON-MG-MEDIUM-157", ["weak-absolute-distractors"], {
  options: ["Opportunity cost remains constant along the frontier", "Opportunity cost falls as more Good X is produced", "The economy has idle resources at each frontier point", "Opportunity cost rises as more Good X is produced"], answer: "Opportunity cost rises as more Good X is produced"
}, "Replace implausible absolutes with PPF-shape misconceptions.");
authorize("P52A-OPPC-M-005", ["weak-absolute-distractors"], {
  options: ["The building’s recorded depreciation expense.", "$0 because ownership avoids a rental payment.", "The difference between neighborhood property values.", "$30,000 per year."], answer: "$30,000 per year."
}, "Use accounting-cost and ownership misconceptions instead of repeated absolute cues.");

authorize("ECON-MG-CORE-INCENTIVES-30005", ["answer-length-outlier"], {
  options: [
    "Something that changes the costs or benefits of an action",
    "A rule that removes meaningful choice from an action",
    "The behavior observed after a policy is introduced",
    "A market price recorded before a decision is made"
  ], answer: "Something that changes the costs or benefits of an action"
}, "Make the repair-seed distractors comparable in specificity without weakening the definition.");
authorize("P52A-OPPC-H-005", ["stem-answer-redundancy"], {
  q: "A worker’s hourly wage rises from $20 to $32. Holding preferences constant, how does this change the opportunity cost of taking an unpaid hour off?",
  options: [
    "Stays at zero because no payment is made.",
    "Equals the combined value of every alternative activity.",
    "Rises by $12 because the forgone hourly wage is higher.",
    "Falls because leisure is now more valuable."
  ],
  answer: "Rises by $12 because the forgone hourly wage is higher."
}, "Ask for the implication without embedding the complete keyed response in the stem.");
authorize("ECON-MG-HARD-254", ["possible-difficulty-overstatement"], {
  q: "Refer to the PPF graph. Compare the opportunity cost per additional unit of Good X from A to B with the cost from D to E. Which calculation and conclusion are supported?",
  options: [
    "A to B costs 0.625 Y per X, while D to E costs 5 Y per X; opportunity cost rises",
    "A to B costs 5 Y per X, while D to E costs 0.625 Y per X; opportunity cost falls",
    "Both moves cost 1 Y per X; opportunity cost remains constant",
    "A to B costs 8 Y per X, while D to E costs 4 Y per X; opportunity cost falls"
  ],
  answer: "A to B costs 0.625 Y per X, while D to E costs 5 Y per X; opportunity cost rises",
  feedback: "The graph shows A to B gives up 5 Y for 8 X, or 0.625 Y per X. D to E gives up 20 Y for 4 X, or 5 Y per X, demonstrating increasing opportunity cost."
}, "Require two graph readings, two ratios, and an interpretation so the Hard assignment reflects actual cognitive work.");

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const answerHash = value => sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function parseLibrary(source, filename) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function loadLibrary() { return parseLibrary(fs.readFileSync(LIBRARY_PATH, "utf8"), LIBRARY_PATH); }
function questionEntries(library) {
  const entries = [];
  for (const [conceptId, module] of Object.entries(library.concepts || {})) {
    for (const [pool, questions] of Object.entries(module.questions || {})) for (const question of questions || []) entries.push({ conceptId, pool, question });
    for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[pool] || []) entries.push({ conceptId, pool: pool.replace("Questions", ""), question });
  }
  return entries;
}
function questionId(question) { return String(question.canonicalId || question.id); }
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  return sha256(stableStringify(payload));
}
function snapshot(value) { return JSON.parse(JSON.stringify(value)); }
function assertAnswer(question) {
  const matches = (question.options || []).filter(option => answerHash(option) === String(question.aHash || "").replace(/^sha256:/, ""));
  if (matches.length !== 1) throw new Error(`${questionId(question)} answer hash resolves to ${matches.length} options.`);
}
function applyPatch(question, patch) {
  const allowed = new Set(["q", "options", "answer", "feedback", "difficulty", "canonicalDifficulty", "graphRequired", "type", "primarySkill", "objective"]);
  for (const key of Object.keys(patch)) if (!allowed.has(key)) throw new Error(`Unauthorized patch field ${key} on ${questionId(question)}.`);
  for (const [key, value] of Object.entries(patch)) if (key !== "answer") question[key] = Array.isArray(value) ? [...value] : value;
  if (patch.answer != null) question.aHash = answerHash(patch.answer);
  assertAnswer(question);
}

function render() {
  const originalAudit = fs.existsSync(ORIGINAL_BASELINE_PATH)
    ? JSON.parse(fs.readFileSync(ORIGINAL_BASELINE_PATH, "utf8"))
    : JSON.parse(fs.readFileSync(ORIGINAL_AUDIT_PATH, "utf8"));
  const graphAudit = JSON.parse(fs.readFileSync(GRAPH_BASELINE_PATH, "utf8"));
  if (originalAudit.counts.errors !== 5 || originalAudit.counts.warnings !== 86 || originalAudit.counts.reviews !== 77) throw new Error(`Unexpected original baseline counts: ${JSON.stringify(originalAudit.counts)}.`);
  if (graphAudit.counts.errors !== 5 || graphAudit.counts.warnings !== 86 || graphAudit.counts.reviews !== 84) throw new Error(`Unexpected improved baseline counts: ${JSON.stringify(graphAudit.counts)}.`);
  const findingIds = new Set(graphAudit.findings.map(finding => String(finding.questionId)));
  for (const id of fixes.keys()) if (!findingIds.has(id)) throw new Error(`${id} is outside the authoritative audit findings.`);

  const library = loadLibrary();
  const entries = questionEntries(library);
  const beforeLibrary = new Map(entries.map(entry => [`${entry.conceptId}:${questionId(entry.question)}`, stableStringify(entry.question)]));
  const headLibrary = parseLibrary(childProcess.execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }), "HEAD:composer_library.js");
  const headEntries = questionEntries(headLibrary);
  const previous = fs.existsSync(CHANGE_PATH) ? JSON.parse(fs.readFileSync(CHANGE_PATH, "utf8")) : null;
  const previousChanges = new Map((previous?.changes || []).map(change => [String(change.id), change]));
  const changes = [];

  for (const spec of fixes.values()) {
    const matches = entries.filter(entry => TARGET_CONCEPTS.has(entry.conceptId) && questionId(entry.question) === spec.id);
    if (matches.length !== 1) throw new Error(`${spec.id} resolved to ${matches.length} target records; expected one.`);
    const entry = matches[0];
    const headQuestion = headEntries.find(candidate => candidate.conceptId === entry.conceptId && questionId(candidate.question) === spec.id)?.question;
    const baseline = previousChanges.get(spec.id)?.before || (headQuestion ? snapshot(headQuestion) : null);
    if (!baseline) throw new Error(`${spec.id} has no trustworthy pre-curation baseline.`);
    applyPatch(entry.question, spec.patch);
    entry.question.sourceCurationPhase = PHASE;
    entry.question.sourceHash = sourceHash(entry.question);
    for (const occurrence of entry.question.sourceOccurrences || []) {
      occurrence.sourceHash = entry.question.sourceHash;
      occurrence.sourceCurationPhase = PHASE;
    }
    changes.push({
      id: spec.id,
      conceptId: entry.conceptId,
      pool: entry.pool,
      rules: [...spec.rules].sort(),
      reason: spec.reasons.join(" "),
      authorizedFields: [...new Set([...Object.keys(spec.patch).filter(key => key !== "answer"), ...(spec.patch.answer != null ? ["aHash"] : [])])].sort(),
      before: snapshot(baseline),
      after: snapshot(entry.question)
    });
  }

  const changedIds = [];
  for (const entry of questionEntries(library)) {
    const key = `${entry.conceptId}:${questionId(entry.question)}`;
    if (stableStringify(entry.question) !== beforeLibrary.get(key)) changedIds.push(questionId(entry.question));
  }
  const unexpected = changedIds.filter(id => !fixes.has(id));
  if (unexpected.length) throw new Error(`Questions changed outside authorization: ${unexpected.join(", ")}`);

  const changedReviewKeys = new Set(changes.flatMap(change => change.rules.map(rule => `${change.id}:${rule}`)));
  const retainedReviews = graphAudit.findings.filter(finding => finding.severity === "REVIEW" && !changedReviewKeys.has(`${finding.questionId}:${finding.rule}`)).map(finding => ({
    id: String(finding.questionId),
    conceptId: finding.concept,
    pools: finding.pools,
    rule: finding.rule,
    judgment: finding.rule === "near-duplicate-stem"
      ? "Retained: adjacent PPF intervals provide meaningful repeated graph practice with different points and opportunity-cost magnitudes."
      : "Retained: the absolute language expresses a diagnostic categorical misconception or certainty trap; the item remains economically sound and the wording is not being treated as automatic proof of weakness."
  }));

  library.libraryVersion = String(library.libraryVersion).includes(PHASE) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  Object.assign(library.registry, {
    generatedAt: GENERATED_AT,
    curationPhase: PHASE,
    curationSummary: "Authorized Foundations remediation: answer hashes, graph necessity and evidence integrity, graph cues, contextual feedback, selected distractors, and difficulty calibration.",
    libraryVersion: library.libraryVersion,
    canonicalQuestionCount: library.canonicalQuestionCount
  });
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stableStringify(library));
  library.registry.librarySha256 = library.librarySha256;
  const manifest = {
    assetCount: library.assetInventory.length,
    assets: library.assetInventory,
    conceptCount: library.conceptCount,
    canonicalQuestionCount: library.canonicalQuestionCount,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    generatedAt: GENERATED_AT
  };
  const reviewManifest = JSON.parse(fs.readFileSync(REVIEW_MANIFEST_PATH, "utf8"));
  reviewManifest.generatedAt = GENERATED_AT;
  reviewManifest.composerLibraryVersion = library.libraryVersion;
  const authorization = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    sourceAudits: [
      path.relative(ROOT, ORIGINAL_BASELINE_PATH).replaceAll("\\", "/"),
      path.relative(ROOT, GRAPH_BASELINE_PATH).replaceAll("\\", "/")
    ],
    scope: {
      concepts: [...TARGET_CONCEPTS],
      originalFindingCounts: originalAudit.counts,
      improvedFindingCounts: graphAudit.counts,
      authorizedQuestionCount: fixes.size,
      authorizedQuestionIds: [...fixes.keys()].sort(),
      retainedReviewFindingCount: retainedReviews.length,
      protectedOutOfScopeQuestionIds: ["43192"]
    },
    controls: {
      onlyAuditFindingIdsAuthorized: true,
      onlyListedFieldsAuthorized: true,
      answerKeyChangesRequireExplicitPatchAnswer: true,
      baselineEvidenceIsImmutableAcrossReruns: true,
      graphAssetsAndAccessibilityMetadataMayNotChange: true,
      unrelatedDifficultyConceptObjectiveAndSkillMetadataMayNotChange: true
    },
    retainedReviews,
    anticipatedPostRemediationReviews: [
      "ECON-MG-HARD-250",
      "ECON-MG-HARD-251",
      "ECON-MG-HARD-252",
      "ECON-MG-LEGENDARY-9002"
    ].map(id => ({
      id,
      rule: "near-duplicate-stem",
      judgment: "Retained intentionally after graph-evidence removal: the shared prompt form is appropriate, while the labeled interval, computed ratio, and in one case pedagogical tier differ. Wording is not being varied merely to evade similarity detection."
    })),
    changes: changes.map(change => ({ id: change.id, conceptId: change.conceptId, pool: change.pool, rules: change.rules, reason: change.reason, authorizedFields: change.authorizedFields, before: change.before, intendedAfter: change.after }))
  };
  const record = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    scope: { concepts: [...TARGET_CONCEPTS], changedQuestionCount: changes.length },
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    originalBaselineAuditSha256: sha256(`${JSON.stringify(originalAudit, null, 2)}\n`),
    graphBaselineAuditSha256: sha256(`${JSON.stringify(graphAudit, null, 2)}\n`),
    authorizationSha256: sha256(`${JSON.stringify(authorization, null, 2)}\n`),
    changes
  };
  return {
    originalAudit,
    outputs: [
      [LIBRARY_PATH, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
      [REGISTRY_PATH, `${JSON.stringify(library.registry, null, 2)}\n`],
      [MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
      [REVIEW_MANIFEST_PATH, `${JSON.stringify(reviewManifest, null, 2)}\n`],
      [AUTHORIZATION_PATH, `${JSON.stringify(authorization, null, 2)}\n`],
      [CHANGE_PATH, `${JSON.stringify(record, null, 2)}\n`]
    ],
    summary: {
      phase: PHASE,
      changedQuestionCount: changes.length,
      graphRequiredCount: graphRequiredIds.length,
      feedbackChangeCount: Object.keys(feedbackPatches).length,
      retainedReviewFindingCount: retainedReviews.length,
      librarySha256: library.librarySha256
    }
  };
}

const generated = render();
if (process.argv.includes("--write")) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  if (!fs.existsSync(ORIGINAL_BASELINE_PATH)) fs.writeFileSync(ORIGINAL_BASELINE_PATH, `${JSON.stringify(generated.originalAudit, null, 2)}\n`, "utf8");
  for (const [file, contents] of generated.outputs) fs.writeFileSync(file, contents, "utf8");
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  console.log(JSON.stringify({ status: "DRY_RUN", ...generated.summary }, null, 2));
}
