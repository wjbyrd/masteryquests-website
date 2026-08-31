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
const CONCEPT_REVIEW_MANIFEST_PATH = path.join(COMPOSER, "data", "concept-reviews", "manifest.json");
const MARKET_GATE_AUTHOR_PATH = path.join(ROOT, "play", "economic-realm", "market-gate", "authoring", "market_gate_phase2a_author.mjs");
const CHANGE_PATH = path.join(ROOT, "validation_artifacts", "question_quality", "supply_demand_equilibrium_quality_fixes.json");
const PHASE = "phaseQH3-core-question-quality-gate-v1";
const GENERATED_AT = "2026-08-30T16:00:00.000Z";
const TARGET_CONCEPTS = new Set(["demand", "supply", "market-equilibrium"]);

const FIXES = [
  {
    id: "PG1-DMD-E-001",
    feedback: [
      "Point A is plotted at a price of $10 and a quantity demanded of 100 thousand donuts.",
      "At point A, the demand curve pairs a price of $10 with a quantity demanded of 100 thousand donuts."
    ],
    reason: "Explain the economic price-quantity relationship instead of only describing a plotted point."
  },
  {
    id: "40010",
    q: [
      "If streaming subscriptions substitute for movie tickets, which event could produce the shift?",
      "Refer to the graph. If streaming subscriptions are substitutes for movie tickets, which event could produce the demand shift shown?"
    ],
    reason: "Connect the substitution question explicitly to the displayed demand shift."
  },
  {
    id: "40011",
    q: [
      "Which description separates the demand shift from the market movement?",
      "Refer to the graph. Which description correctly separates the demand shift from the movement along supply?"
    ],
    reason: "Name the visual evidence and distinguish a curve shift from movement along the unchanged curve."
  },
  {
    id: "PG1-SUP-E-001",
    feedback: [
      "Point A is plotted at a price of $6 and a quantity supplied of 100 thousand.",
      "At point A, the supply curve pairs a price of $6 with a quantity supplied of 100 thousand units."
    ],
    reason: "Explain the economic price-quantity relationship and complete the unit."
  },
  {
    id: "40008",
    q: [
      "Why is A to B not merely a decrease in quantity supplied?",
      "Refer to the graph. Why is the move from A to B a decrease in supply rather than merely a decrease in quantity supplied?"
    ],
    reason: "Use natural graph language and state the movement-versus-shift contrast directly."
  },
  {
    id: "PG1-SUP-L-001",
    q: [
      "A producer says the move from A to B proves that supply increased by 125 thousand units. What is the correct diagnosis?",
      "Refer to the graph. A producer says the move from A to B proves that supply increased by 125 thousand units. What is the correct diagnosis?"
    ],
    reason: "Direct the learner to the graph whose movement the claim interprets."
  },
  {
    id: "PG1-EQ-M-002",
    q: [
      "Read the gas market at $4 per gallon. Is the market short, long, or exactly balanced, and by how much?",
      "Refer to the graph. At $4 per gallon, does the gas market have a shortage, a surplus, or equilibrium, and by how much?"
    ],
    reason: "Replace unnatural graph language with standard market terminology."
  },
  {
    id: "40012",
    q: [
      "How does equilibrium change from A to B?",
      "Refer to the graph. How do equilibrium price and quantity change from A to B?"
    ],
    reason: "Identify both equilibrium dimensions and explicitly invoke the graph."
  },
  {
    id: "40013",
    q: [
      "Which statement distinguishes the general prediction from this result?",
      "Refer to the graph. Which statement distinguishes the general prediction for these simultaneous shifts from the particular outcome shown?"
    ],
    reason: "Make the comparison and its visual evidence explicit."
  },
  {
    id: "40016",
    q: [
      "From D to B, demand rises and supply falls. What do the equilibria show?",
      "Refer to the graph. From D to B, demand rises and supply falls. What do the two equilibria show?"
    ],
    reason: "Explicitly connect the simultaneous-shift comparison to the graph."
  },
  {
    id: "40017",
    q: [
      "Whether the market passes through A or C, why is B the same final equilibrium?",
      "Refer to the graph. Why is B the final equilibrium regardless of whether demand or supply shifts first?"
    ],
    feedback: [
      "Final equilibrium depends on final curves, not the order of shifts.",
      "The final equilibrium is the intersection of D1 and S1, so it depends on the final curves rather than the order of the shifts."
    ],
    reason: "Replace the known awkward construction and explain why the shift order does not change the final intersection."
  },
  {
    id: "40019",
    q: [
      "What can be concluded about D to B?",
      "Refer to the graph. What can be concluded about the move from D to B?"
    ],
    feedback: [
      "B is vertically above D at the same quantity.",
      "From D to B, the opposing quantity effects cancel while both shifts raise equilibrium price, so quantity is unchanged and price rises."
    ],
    reason: "Replace marker-only feedback with the comparative-statics explanation."
  },
  {
    id: "40020",
    q: [
      "Because the axes lack numeric ticks, which result remains defensible?",
      "Refer to the graph. Because the axes lack numeric ticks, which result remains defensible?"
    ],
    reason: "Direct the learner to the graph that limits the defensible inference."
  }
];

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function loadLibrary() {
  return parseLibrary(fs.readFileSync(LIBRARY_PATH, "utf8"), LIBRARY_PATH);
}
function parseLibrary(source, filename) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function questionEntries(library) {
  const entries = [];
  for (const [conceptId, module] of Object.entries(library.concepts || {})) {
    for (const [pool, questions] of Object.entries(module.questions || {})) for (const question of questions || []) entries.push({ conceptId, pool, question });
    for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[pool] || []) entries.push({ conceptId, pool, question });
  }
  return entries;
}
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  return sha256(stableStringify(payload));
}
function answerHash(value) {
  return sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
}
function assertAnswer(question) {
  const matches = (question.options || []).filter(option => answerHash(option) === String(question.aHash || "").replace(/^sha256:/, ""));
  if (matches.length !== 1) throw new Error(`${question.id} answer hash resolves to ${matches.length} options.`);
}

function renderMarketGateAuthor() {
  let source = fs.readFileSync(MARKET_GATE_AUTHOR_PATH, "utf8");
  for (const spec of FIXES.filter(item => /^400\d+$/.test(item.id))) {
    for (const field of ["q", "feedback"]) {
      if (!spec[field]) continue;
      const [expected, replacement] = spec[field].map(JSON.stringify);
      const expectedCount = source.split(expected).length - 1;
      const replacementCount = source.split(replacement).length - 1;
      if (expectedCount === 1 && replacementCount === 0) source = source.replace(expected, replacement);
      else if (!(expectedCount === 0 && replacementCount === 1)) throw new Error(`${spec.id} ${field} did not resolve uniquely in the Market Gate authoring source.`);
    }
  }
  return source;
}

function render() {
  const library = loadLibrary();
  const entries = questionEntries(library);
  const headLibrary = parseLibrary(childProcess.execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024
  }), "HEAD:composer_library.js");
  const headEntries = questionEntries(headLibrary);
  const existingRecord = fs.existsSync(CHANGE_PATH) ? JSON.parse(fs.readFileSync(CHANGE_PATH, "utf8")) : null;
  const existingChanges = new Map((existingRecord?.changes || []).map(change => [String(change.id), change]));
  const changes = [];
  for (const spec of FIXES) {
    const matches = entries.filter(({ conceptId, question }) => TARGET_CONCEPTS.has(conceptId) && String(question.canonicalId || question.id) === spec.id);
    if (matches.length !== 1) throw new Error(`${spec.id} resolved to ${matches.length} target records; expected one.`);
    const { conceptId, pool, question } = matches[0];
    const headQuestion = headEntries.find(({ conceptId: headConceptId, question: candidate }) => headConceptId === conceptId && String(candidate.canonicalId || candidate.id) === spec.id)?.question;
    const priorChange = existingChanges.get(spec.id);
    const expectedBeforeQ = spec.q?.[0] ?? question.q;
    const expectedBeforeFeedback = spec.feedback?.[0] ?? question.feedback;
    const matchesExpectedBefore = candidate => candidate?.q === expectedBeforeQ && candidate?.feedback === expectedBeforeFeedback;
    const baseline = matchesExpectedBefore(priorChange?.before) ? priorChange.before
      : matchesExpectedBefore(headQuestion) ? headQuestion
        : null;
    if (!baseline) throw new Error(`${spec.id} has no trustworthy pre-curation baseline.`);
    const before = { q: baseline.q, feedback: baseline.feedback, sourceHash: baseline.sourceHash };
    for (const field of ["q", "feedback"]) {
      if (!spec[field]) continue;
      const [expected, replacement] = spec[field];
      if (question[field] === expected) question[field] = replacement;
      else if (question[field] !== replacement) throw new Error(`${spec.id} ${field} did not match the expected current or corrected wording.`);
    }
    assertAnswer(question);
    question.sourceCurationPhase = PHASE;
    question.sourceHash = sourceHash(question);
    for (const occurrence of question.sourceOccurrences || []) {
      occurrence.sourceHash = question.sourceHash;
      occurrence.sourceCurationPhase = PHASE;
    }
    changes.push({ id: spec.id, conceptId, pool, reason: spec.reason, before, after: { q: question.q, feedback: question.feedback, sourceHash: question.sourceHash } });
  }

  library.libraryVersion = String(library.libraryVersion).includes(PHASE) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  Object.assign(library.registry, {
    generatedAt: GENERATED_AT,
    curationPhase: PHASE,
    curationSummary: "Reusable question-quality gate and conservative Supply/Demand/Equilibrium graph-language and feedback remediation.",
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
  const conceptReviewManifest = JSON.parse(fs.readFileSync(CONCEPT_REVIEW_MANIFEST_PATH, "utf8"));
  conceptReviewManifest.generatedAt = GENERATED_AT;
  conceptReviewManifest.composerLibraryVersion = library.libraryVersion;
  const record = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    scope: { concepts: [...TARGET_CONCEPTS], changedQuestionCount: changes.length },
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    changes
  };
  return {
    outputs: [
      [LIBRARY_PATH, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
      [REGISTRY_PATH, `${JSON.stringify(library.registry, null, 2)}\n`],
      [MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
      [CONCEPT_REVIEW_MANIFEST_PATH, `${JSON.stringify(conceptReviewManifest, null, 2)}\n`],
      [MARKET_GATE_AUTHOR_PATH, renderMarketGateAuthor()],
      [CHANGE_PATH, `${JSON.stringify(record, null, 2)}\n`]
    ],
    summary: { phase: PHASE, changedQuestionIds: changes.map(change => change.id), librarySha256: library.librarySha256 }
  };
}

const generated = render();
if (process.argv.includes("--write")) {
  for (const [file, contents] of generated.outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents, "utf8");
  }
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  console.log(JSON.stringify({ status: "DRY_RUN", ...generated.summary }, null, 2));
}
