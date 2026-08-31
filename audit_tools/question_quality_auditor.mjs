#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LIBRARY = path.join(REPO_ROOT, "build", "faculty-build-composer", "data", "composer_library.js");
const DEFAULT_COMPOSER_ROOT = path.join(REPO_ROOT, "build", "faculty-build-composer");
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard", "elite", "legendary"]);
const DIFFICULTY_POOLS = new Set(VALID_DIFFICULTIES);
const GRAPH_CUE = /\b(graph|figure|diagram|chart|table|matrix|curve|frontier|schedule|displayed|shown|point\s+[A-Z]|D\d|S\d|AD\d|AS\d|SRAS\d|LRAS\d|MP[BC]|MS[BC])\b/i;
const REASONING_CUE = /\b(why|explain|compare|infer|evaluate|reason|because|therefore|simultaneous|both\s+.*shift|conclusion|chain|mechanism|tradeoff)\b/i;
const SIMPLE_READING = /\b(what|which)\b.{0,45}\b(shown|displayed|point|curve|price|quantity|intersection)\b/i;
const ABSOLUTE_DISTRACTOR = /\b(always|never|only|all|none|must|entirely|automatically)\b/i;
const CURVE_LABEL = /\b(?:D\d|S\d|AD\d|AS\d|SRAS\d|LRAS\d|MD\d|MS\d|MPB|MPC|MSB|MSC|MEB|MR|MC|ATC|AVC)\b/g;
const GRAPH_RESULT_QUESTION = /\b(opportunity cost|tradeoff|slope|change|difference|pattern|interpretation|how many|how much|size|amount|price and quantity|quantity and price)\b/i;
const GRAPH_POINT_MOVEMENT = /\b(?:move|moves|moving|production moves|changes? production)\s+from\s+(?:point\s+)?[A-Z0-9]+\s+to\s+(?:point\s+)?[A-Z0-9]+\b/i;
const GRAPH_QUANTIFIED_RESULT = /\b(?:increase|increases|increased|increasing|gain|gains|gained|gaining|rise|rises|rose|reduce|reduces|reduced|reducing|decrease|decreases|decreased|decreasing|fall|falls|fell|falling|drop|drops|dropped|dropping|sacrifice|sacrifices|sacrificed|sacrificing|give up|gives up|gave up|giving up|cost|costs|costing)\b[^?.;]{0,55}?(?:\$\s*)?\d+(?:\.\d+)?%?/gi;
const GRAPH_COORDINATE_TRANSITION = /\b(?:move|moves|moving|changes? production)\s+from\s+(?:about\s+)?(?:\$\s*)?\d+(?:\.\d+)?[^?.;]{0,45}?(?:\$\s*)?\d+(?:\.\d+)?[^?.;]{0,20}?\bto\s+(?:\$\s*)?\d+(?:\.\d+)?[^?.;]{0,45}?(?:\$\s*)?\d+(?:\.\d+)?/i;
const GRAPH_COORDINATE_PAIR = /\b(?:point\s+)?[A-Z]\s+(?:is|lies|starts?|ends?|at)\s+(?:about\s+)?\(?\s*(?:\$\s*)?\d+(?:\.\d+)?[^?.;]{0,45}(?:\$\s*)?\d+(?:\.\d+)?/gi;

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeComparable(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%$+-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function answerHash(value) {
  return sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
}

function words(value) {
  return normalizeText(value).match(/[\p{L}\p{N}%$+-]+/gu) || [];
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  if (!ordered.length) return 0;
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

function questionId(question, fallback) {
  return String(question.canonicalId || question.id || fallback || "unknown-question");
}

function optionState(question) {
  const options = Array.isArray(question.options)
    ? question.options.map(String)
    : [question.answer, ...(Array.isArray(question.distractors) ? question.distractors : [])].filter(value => value != null).map(String);
  let correctIndex = -1;
  if (question.aHash) {
    const matches = options.map((option, index) => answerHash(option) === question.aHash ? index : -1).filter(index => index >= 0);
    correctIndex = matches.length === 1 ? matches[0] : -1;
    return { options, correctIndex, hashMatchCount: matches.length };
  }
  if (question.answer != null) {
    const target = normalizeComparable(question.answer);
    const matches = options.map((option, index) => normalizeComparable(option) === target ? index : -1).filter(index => index >= 0);
    correctIndex = matches.length === 1 ? matches[0] : -1;
    return { options, correctIndex, hashMatchCount: matches.length };
  }
  return { options, correctIndex, hashMatchCount: null };
}

function tokenSet(value) {
  const stop = new Set(["a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "what", "which", "with"]);
  return new Set(normalizeComparable(value).split(" ").filter(token => token.length > 2 && !stop.has(token)));
}

function jaccard(left, right) {
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union ? intersection / union : 0;
}

function differenceSummary(left, right) {
  const leftStem = normalizeText(left.question.q);
  const rightStem = normalizeText(right.question.q);
  const differences = [];
  const numericPattern = /(?<![\p{L}])[-+]?[$]?[\d,.]+%?/gu;
  const pointPattern = /\b(?:point\s+)?[A-Z](?=\b|\s+to\s+[A-Z])/g;
  const leftNumbers = leftStem.match(numericPattern) || [];
  const rightNumbers = rightStem.match(numericPattern) || [];
  if (leftNumbers.join("|") !== rightNumbers.join("|")) differences.push("numerical values");
  const leftPoints = leftStem.match(pointPattern) || [];
  const rightPoints = rightStem.match(pointPattern) || [];
  if (leftPoints.join("|") !== rightPoints.join("|")) differences.push("graph point");
  const directionPattern = /\b(?:increase|decrease|rise|fall|expand|contract|outward|inward|inside|outside|attainable|unattainable|efficient|inefficient|left|right|up|down)(?:s|d|ing)?\b/gi;
  const leftDirections = (leftStem.match(directionPattern) || []).map(value => value.toLowerCase());
  const rightDirections = (rightStem.match(directionPattern) || []).map(value => value.toLowerCase());
  if (leftDirections.join("|") !== rightDirections.join("|")) differences.push("direction of reasoning or curve/shift direction");
  const leftPools = [...left.pools].sort().join(", ");
  const rightPools = [...right.pools].sort().join(", ");
  if (leftPools !== rightPools) differences.push(`pedagogical role/pool (${leftPools} vs ${rightPools})`);

  const structuralNormalize = value => normalizeComparable(value)
    .replace(numericPattern, " number ")
    .replace(/\bpoint\s+[a-z]\b|\b[a-z]\s+to\s+[a-z]\b/g, " graphpoint ")
    .replace(/\s+/g, " ")
    .trim();
  if (!differences.length || structuralNormalize(leftStem) !== structuralNormalize(rightStem)) differences.push("scenario or wording");
  return differences;
}

function addFinding(findings, entry, severity, rule, message, suggestion = "") {
  findings.push({
    severity,
    rule,
    questionId: entry.id,
    concept: entry.conceptId,
    pools: [...entry.pools].sort(),
    message,
    suggestion,
    wording: normalizeText(entry.question.q)
  });
}

function inventoryMap(library) {
  const map = new Map();
  for (const asset of library.assetInventory || []) {
    for (const key of [asset.runtimePath, asset.sourceAssetPath, asset.sourceUrl, asset.filename]) {
      if (key) map.set(String(key).replaceAll("\\", "/"), asset);
    }
  }
  return map;
}

function resolveAsset(assetMap, image) {
  const normalized = String(image || "").replaceAll("\\", "/");
  return assetMap.get(normalized) || assetMap.get(path.posix.basename(normalized));
}

function graphEvidenceRedundantInStem(stem) {
  if (!GRAPH_CUE.test(stem) || !GRAPH_RESULT_QUESTION.test(stem)) return false;
  const quantifiedResults = stem.match(GRAPH_QUANTIFIED_RESULT) || [];
  const coordinatePairs = stem.match(GRAPH_COORDINATE_PAIR) || [];
  const repeatsReportedResult = /\b(shortage|surplus)\s+(?:is|equals|of)\s+(?:\$\s*)?\d/i.test(stem)
    && /\b(?:what|which)\b[^?]{0,80}\b(size|amount|shortage|surplus)\b/i.test(stem);
  const givesBothMovementChanges = GRAPH_POINT_MOVEMENT.test(stem) && quantifiedResults.length >= 2;
  const givesBothCoordinates = coordinatePairs.length >= 2 || GRAPH_COORDINATE_TRANSITION.test(stem);
  const givesTwoPointTradeoffs = (stem.match(/\b(?:move|moving)\s+from\s+(?:point\s+)?[A-Z]\s+to\s+(?:point\s+)?[A-Z]\b/gi) || []).length >= 2
    && (stem.match(/\bcosts?\b[^?.;]{0,45}\d/gi) || []).length >= 2;
  return repeatsReportedResult || givesBothMovementChanges || givesBothCoordinates || givesTwoPointTradeoffs;
}

export function auditQuestionRecords(entries, options = {}) {
  const findings = [];
  const assetMap = options.assetMap || new Map();
  const composerRoot = options.composerRoot || DEFAULT_COMPOSER_ROOT;
  const validateAssets = options.validateAssets !== false;
  const normalizedStemGroups = new Map();
  const normalizedFeedbackGroups = new Map();

  for (const entry of entries) {
    const question = entry.question;
    const stem = normalizeText(question.q);
    const feedback = normalizeText(question.feedback);
    const { options: answerOptions, correctIndex, hashMatchCount } = optionState(question);
    const normalizedOptions = answerOptions.map(normalizeComparable);
    const difficulty = normalizeComparable(question.canonicalDifficulty || question.difficulty);
    const supportOnly = [...entry.pools].every(pool => ["repair", "repairSeed", "bridge"].includes(pool));
    const graphLinked = Boolean(question.image || question.asset || question.graphRequired || /graph/i.test(question.type || ""));
    const image = String(question.image || question.asset || "").replaceAll("\\", "/");

    if (!stem) addFinding(findings, entry, "ERROR", "missing-stem", "Question stem is missing.");
    if (answerOptions.length < 2) addFinding(findings, entry, "ERROR", "missing-options", `Expected answer options; found ${answerOptions.length}.`);
    if (normalizedOptions.some(option => !option)) addFinding(findings, entry, "ERROR", "blank-option", "At least one answer option is blank.");
    if (new Set(normalizedOptions).size !== normalizedOptions.length) addFinding(findings, entry, "ERROR", "duplicate-options", "Two or more answer options are equivalent after normalization.");
    if (hashMatchCount != null && hashMatchCount !== 1) addFinding(findings, entry, "ERROR", "invalid-answer-key", `The keyed answer matches ${hashMatchCount} options; exactly one is required.`);
    if (!feedback) addFinding(findings, entry, "ERROR", "missing-feedback", "Feedback is missing.");
    if (!question.objective) addFinding(findings, entry, "ERROR", "missing-objective", "Objective/LO metadata is missing.");
    if (!question.primarySkill) addFinding(findings, entry, "ERROR", "missing-primary-skill", "Primary-skill metadata is missing.");
    if (!question.type) addFinding(findings, entry, "ERROR", "missing-type", "Question type metadata is missing.");
    else if (!/^[a-z][a-z0-9_-]*$/i.test(String(question.type))) addFinding(findings, entry, "ERROR", "invalid-type", `Question type '${question.type}' is not a supported identifier format.`);
    if (difficulty && difficulty !== "unknown" && !VALID_DIFFICULTIES.has(difficulty)) addFinding(findings, entry, "ERROR", "invalid-difficulty", `Unsupported difficulty '${difficulty}'.`);
    if (!supportOnly && (!difficulty || difficulty === "unknown")) addFinding(findings, entry, "ERROR", "missing-difficulty", "Ordinary/checkpoint question difficulty is missing or unknown.");

    const rawTexts = [question.q, question.feedback, ...(Array.isArray(question.options) ? question.options : [question.answer, ...(question.distractors || [])])]
      .filter(value => value != null)
      .map(String);
    if (rawTexts.some(text => /\s{2,}/.test(text))) addFinding(findings, entry, "ERROR", "doubled-whitespace", "Question text contains doubled whitespace.");
    for (const text of [stem, feedback, ...answerOptions]) {
      if (/\uFFFD|Ã.|Â.|â(?:€|€™|€œ|€)/.test(text)) addFinding(findings, entry, "ERROR", "broken-unicode", "Question text contains a likely encoding artifact.");
      if (/\$\s*\d+(?:\.\d+)?\s+hundred\b/i.test(text)) addFinding(findings, entry, "ERROR", "malformed-currency", "Currency uses a malformed construction such as '$40 hundred'.");
      if (/\b\d+(?:\.\d+)?\s*%%\b/.test(text)) addFinding(findings, entry, "ERROR", "malformed-percentage", "Question text contains a doubled percent sign.");
    }

    if (stem && !/[?.:;)]$/.test(stem)) addFinding(findings, entry, "WARNING", "missing-terminal-punctuation", "Stem has no terminal punctuation.");
    if (/^[a-z]/.test(stem)) addFinding(findings, entry, "WARNING", "lowercase-stem", "Stem begins with a lowercase letter.");
    if (feedback && (/^(correct|incorrect|yes|no)[.!]?$/i.test(feedback) || words(feedback).length < 4)) {
      addFinding(findings, entry, "WARNING", "generic-feedback", "Feedback is too short or generic to explain the economics.", "Explain the relationship or reasoning that makes the keyed answer correct.");
    }

    if (question.graphRequired && !image) addFinding(findings, entry, "ERROR", "graph-required-without-image", "graphRequired is true but no graph asset is attached.");
    if (image) {
      const asset = resolveAsset(assetMap, image);
      if (validateAssets && !asset) {
        addFinding(findings, entry, "ERROR", "unregistered-graph-asset", `Attached image '${image}' is not registered in the Composer asset inventory.`);
      } else if (validateAssets) {
        const diskPath = path.join(composerRoot, "data", String(asset.runtimePath || image));
        if (!fs.existsSync(diskPath)) addFinding(findings, entry, "ERROR", "missing-graph-file", `Registered graph file does not exist: ${asset.runtimePath || image}.`);
        const labels = [...new Set(`${stem} ${feedback}`.match(CURVE_LABEL) || [])];
        const assetDescription = `${asset.imageAlt || ""} ${asset.graphDescription || ""}`;
        const missingLabels = labels.filter(label => !new RegExp(`\\b${label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`).test(assetDescription));
        if (missingLabels.length) addFinding(findings, entry, "REVIEW", "curve-label-metadata-mismatch", `Curve labels ${missingLabels.join(", ")} do not appear in the registered graph description.`, "Confirm that the wording, feedback, and displayed graph use the same labels.");
      }
      const stemUsesGraph = GRAPH_CUE.test(stem);
      if (stemUsesGraph && graphEvidenceRedundantInStem(stem)) {
        addFinding(findings, entry, "REVIEW", "graph-evidence-redundant-in-stem", "The stem appears to reproduce graph-derived values needed for the requested result, allowing the learner to bypass meaningful graph inspection.", "Keep external scenario information in the stem, but remove coordinates, changes, or relationships the learner should extract from the attached graph.");
      }
      if (!question.graphRequired && stemUsesGraph) {
        addFinding(findings, entry, "WARNING", "image-without-graph-required", "The stem directs the learner to visual evidence, but graphRequired is not true.", "Set graphRequired to true after confirming the attached graph is the intended asset.");
      } else if (!question.graphRequired) {
        addFinding(findings, entry, "REVIEW", "attached-graph-possibly-decorative", "A graph is attached, but the stem neither marks it as required nor clearly directs the learner to use it.", "Decide whether the graph is instructionally necessary; require and cue it if necessary, or remove it only if it is genuinely decorative.");
      }
      if (question.graphRequired && !stemUsesGraph) addFinding(findings, entry, "WARNING", "graph-prompt-missing-cue", "The graph is required, but the stem does not clearly direct the learner to visual evidence.", "Use a natural cue such as 'Refer to the graph...' when the graph is required.");
    }

    if (/\bread the quantity\b/i.test(stem)) addFinding(findings, entry, "REVIEW", "awkward-graph-wording", "The phrase 'Read the quantity' is unnatural graph-prompt language.", "State what relationship or value the learner should infer from the graph.");
    if (/whether\b.{0,100}\bpasses through\b.{0,100}\bwhy is\b/i.test(stem) || /why is\s+[A-Z]\s+the same final equilibrium/i.test(stem)) {
      addFinding(findings, entry, "REVIEW", "awkward-equilibrium-wording", "The simultaneous-shift wording is difficult to parse.", "Clarify that the market may pass through an intermediate equilibrium but reaches the same final intersection regardless of shift order.");
    }
    if (/\b(the dot shows|the point shows)\b/i.test(feedback) || (/^Point\s+[A-Z]\s+is plotted\b/i.test(feedback) && !/\b(intersect|equilibrium|demand|supply|because|therefore|indicates)\b/i.test(feedback))) {
      addFinding(findings, entry, "REVIEW", "visual-only-feedback", "Feedback mainly identifies a visual marker instead of explaining the economic relationship.", "Explain why the relevant curves, schedules, or incentives produce the answer.");
    }

    if (["hard", "elite", "legendary"].includes(difficulty) && SIMPLE_READING.test(stem) && !REASONING_CUE.test(stem)) {
      addFinding(findings, entry, "REVIEW", "possible-difficulty-overstatement", `${difficulty} metadata may overstate a direct recognition or graph-reading task.`, "Confirm that the item requires work appropriate to its assigned difficulty.");
    }
    if (difficulty === "easy" && /\b(simultaneous|both\s+.*shift|first\b.{0,80}\bthen|multi-step|after\b.{0,80}\bthen)\b/i.test(stem)) {
      addFinding(findings, entry, "REVIEW", "possible-difficulty-understatement", "Easy metadata may understate a multi-step or simultaneous-change task.");
    }

    if (correctIndex >= 0) {
      const correct = answerOptions[correctIndex];
      const distractors = answerOptions.filter((_, index) => index !== correctIndex);
      const correctWords = words(correct).length;
      const distractorMedian = median(distractors.map(option => words(option).length));
      if (correctWords >= 9 && correctWords >= distractorMedian * 2.5 && correctWords - distractorMedian >= 6) {
        addFinding(findings, entry, "REVIEW", "answer-length-outlier", "The correct answer is an extreme length outlier and may cue test-wise learners.", "Make distractors comparably specific without adding ambiguity.");
      }
      const absoluteDistractors = distractors.filter(option => ABSOLUTE_DISTRACTOR.test(option)).length;
      if (absoluteDistractors >= 2 && !ABSOLUTE_DISTRACTOR.test(correct)) {
        addFinding(findings, entry, "REVIEW", "weak-absolute-distractors", `${absoluteDistractors} distractors rely on absolute wording while the correct answer does not.`);
      }
      const stemNorm = normalizeComparable(stem);
      const correctNorm = normalizeComparable(correct);
      if (correctNorm.length >= 20 && stemNorm.includes(correctNorm)) addFinding(findings, entry, "REVIEW", "stem-answer-redundancy", "The stem contains the complete correct-answer wording.");
      const feedbackNorm = normalizeComparable(feedback);
      if (feedbackNorm && (feedbackNorm === correctNorm || (feedbackNorm.startsWith(correctNorm) && words(feedback).length <= correctWords + 3))) {
        addFinding(findings, entry, "REVIEW", "feedback-repeats-answer", "Feedback mostly repeats the correct option without explaining why it is correct.");
      }
    }

    for (const pool of entry.pools) {
      if (DIFFICULTY_POOLS.has(pool) && difficulty && pool !== difficulty) addFinding(findings, entry, "WARNING", "pool-difficulty-mismatch", `Question appears in the ${pool} pool but carries ${difficulty} difficulty metadata.`);
    }

    const stemKey = normalizeComparable(stem);
    if (stemKey) {
      if (!normalizedStemGroups.has(stemKey)) normalizedStemGroups.set(stemKey, []);
      normalizedStemGroups.get(stemKey).push(entry);
    }
    const feedbackKey = normalizeComparable(feedback);
    if (feedbackKey) {
      if (!normalizedFeedbackGroups.has(feedbackKey)) normalizedFeedbackGroups.set(feedbackKey, []);
      normalizedFeedbackGroups.get(feedbackKey).push(entry);
    }
  }

  for (const group of normalizedStemGroups.values()) {
    if (group.length < 2) continue;
    const ids = [...new Set(group.map(entry => entry.id))];
    if (ids.length < 2) continue;
    for (const entry of group) addFinding(findings, entry, "ERROR", "duplicate-stem", `Stem duplicates question(s): ${ids.filter(id => id !== entry.id).join(", ")}.`);
  }

  for (const group of normalizedFeedbackGroups.values()) {
    const ids = [...new Set(group.map(entry => entry.id))];
    if (ids.length < 3) continue;
    for (const entry of group) addFinding(findings, entry, "WARNING", "repeated-feedback", `Identical feedback is reused across ${ids.length} distinct questions.`);
  }

  const tokenized = entries.map(entry => ({ entry, tokens: tokenSet(entry.question.q) })).filter(item => item.tokens.size >= 7);
  for (let leftIndex = 0; leftIndex < tokenized.length; leftIndex += 1) {
    const left = tokenized[leftIndex];
    let best = null;
    for (let rightIndex = leftIndex + 1; rightIndex < tokenized.length; rightIndex += 1) {
      const right = tokenized[rightIndex];
      if (left.entry.id === right.entry.id) continue;
      const score = jaccard(left.tokens, right.tokens);
      if (score >= 0.88 && (!best || score > best.score)) best = { right, score };
    }
    if (best) {
      const differences = differenceSummary(left.entry, best.right.entry);
      addFinding(findings, left.entry, "REVIEW", "near-duplicate-stem", `Stem is ${(best.score * 100).toFixed(0)}% token-similar to ${best.right.entry.id}. Automated comparison indicates differences in: ${differences.join(", ")}.`, "Confirm that the pair tests meaningfully different reasoning rather than a trivial wording variant; the listed differences are heuristic review aids, not a redundancy verdict.");
    }
  }

  findings.sort((left, right) => {
    const rank = { ERROR: 0, WARNING: 1, REVIEW: 2 };
    return rank[left.severity] - rank[right.severity] || left.concept.localeCompare(right.concept) || left.questionId.localeCompare(right.questionId) || left.rule.localeCompare(right.rule);
  });
  const counts = { errors: 0, warnings: 0, reviews: 0 };
  for (const finding of findings) counts[finding.severity === "ERROR" ? "errors" : finding.severity === "WARNING" ? "warnings" : "reviews"] += 1;
  return { counts, findings };
}

export function loadComposerLibrary(libraryPath = DEFAULT_LIBRARY) {
  const source = fs.readFileSync(libraryPath, "utf8").trim();
  const prefix = "window.MQ_COMPOSER_LIBRARY=";
  if (!source.startsWith(prefix) || !source.endsWith(";")) throw new Error(`Unexpected Composer library wrapper: ${libraryPath}`);
  return JSON.parse(source.slice(prefix.length, -1));
}

export function collectComposerQuestions(library, config = {}) {
  const selected = config.concepts?.length ? config.concepts : Object.keys(library.concepts || {});
  const selectedPools = config.pools?.length ? new Set(config.pools) : null;
  const byKey = new Map();
  for (const conceptId of selected) {
    const concept = library.concepts?.[conceptId];
    if (!concept) throw new Error(`Unknown concept: ${conceptId}`);
    const sources = [
      ...Object.entries(concept.questions || {}),
      ["repair", concept.repairQuestions || []],
      ["repairSeed", concept.repairSeedQuestions || []],
      ["bridge", concept.bridgeQuestions || []]
    ];
    for (const [pool, questions] of sources) {
      if (selectedPools && !selectedPools.has(pool)) continue;
      for (const question of questions || []) {
        const id = questionId(question, `${conceptId}:${pool}:${byKey.size}`);
        const key = `${conceptId}:${id}`;
        if (!byKey.has(key)) byKey.set(key, { id, conceptId, pools: new Set(), question });
        byKey.get(key).pools.add(pool);
      }
    }
  }
  return [...byKey.values()];
}

export function auditAuthoredQuestions(questions, config = {}) {
  const entries = questions.map((question, index) => ({
    id: questionId(question, `${config.conceptId || "authored"}:${index + 1}`),
    conceptId: config.conceptId || question.conceptCluster || question.primaryConceptId || "authored",
    pools: new Set([question.pool || question.difficulty || "authored"]),
    question
  }));
  return auditQuestionRecords(entries, {
    assetMap: config.assetMap || new Map(),
    composerRoot: config.composerRoot || DEFAULT_COMPOSER_ROOT,
    validateAssets: config.validateAssets ?? Boolean(config.assetMap)
  });
}

export function renderMarkdownReport(result) {
  const lines = [
    "# Question Quality Audit",
    "",
    `Generated: ${result.generatedAt}`,
    "",
    "## Scope",
    "",
    `- Concepts: ${result.scope.concepts.join(", ")}`,
    `- Pools: ${result.scope.pools.length ? result.scope.pools.join(", ") : "all pools"}`,
    ...(result.scope.poolInventory?.length ? [`- Pool inventory: ${result.scope.poolInventory.join(", ")}`] : []),
    `- Unique questions inspected: ${result.scope.questionCount}`,
    `- Library: ${result.libraryVersion}`,
    ...(result.librarySha256 ? [`- Library SHA-256: ${result.librarySha256}`] : []),
    "",
    "## Summary",
    "",
    `- ERROR: ${result.counts.errors}`,
    `- WARNING: ${result.counts.warnings}`,
    `- REVIEW: ${result.counts.reviews}`,
    ...(result.findingSummary ? [
      `- Total findings: ${result.findingSummary.totalFindings}`,
      `- Unique questions affected: ${result.findingSummary.uniqueQuestionsAffected}`,
      `- Questions with multiple findings: ${result.findingSummary.questionsWithMultipleFindings.length}`
    ] : []),
    "",
    "ERROR means a deterministic defect. WARNING means a strong machine-detectable reason to inspect. REVIEW requires semantic or pedagogical judgment.",
    "",
    "## Rule counts",
    "",
    "| Severity | Rule | Count |",
    "|---|---|---:|"
  ];
  for (const row of result.ruleCounts) lines.push(`| ${row.severity} | ${row.rule} | ${row.count} |`);
  if (result.conceptFindingCounts?.length) {
    lines.push("", "## Findings by concept", "", "| Concept | Findings |", "|---|---:|");
    for (const row of result.conceptFindingCounts) lines.push(`| ${row.concept} | ${row.count} |`);
  }
  if (result.poolFindingCounts?.length) {
    lines.push("", "## Findings by pool", "", "| Pool | Findings |", "|---|---:|");
    for (const row of result.poolFindingCounts) lines.push(`| ${row.pool} | ${row.count} |`);
  }
  if (result.findingSummary?.questionsWithMultipleFindings.length) {
    lines.push("", "## Questions with multiple findings", "", "| Question | Concept | Pools | Findings | Rules |", "|---|---|---|---:|---|");
    for (const row of result.findingSummary.questionsWithMultipleFindings) lines.push(`| ${row.questionId} | ${row.concept} | ${row.pools.join(", ")} | ${row.count} | ${row.rules.join(", ")} |`);
  }
  lines.push("", "## Findings", "");
  if (!result.findings.length) lines.push("No findings.");
  for (const finding of result.findings) {
    lines.push(
      `### ${finding.severity} — ${finding.questionId} — ${finding.rule}`,
      "",
      `- Concept: ${finding.concept}`,
      `- Pools: ${finding.pools.join(", ")}`,
      `- Current wording: ${finding.wording || "(missing)"}`,
      `- Reason: ${finding.message}`
    );
    if (finding.suggestion) lines.push(`- Suggested direction: ${finding.suggestion}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function parseArgs(argv) {
  const config = { concepts: [], pools: [], failOn: "error" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      const value = argv[++index];
      if (!value) throw new Error(`${arg} requires a value.`);
      return value;
    };
    if (arg === "--concept") config.concepts.push(next());
    else if (arg === "--concepts") config.concepts.push(...next().split(",").map(value => value.trim()).filter(Boolean));
    else if (arg === "--pool") config.pools.push(next());
    else if (arg === "--pools") config.pools.push(...next().split(",").map(value => value.trim()).filter(Boolean));
    else if (arg === "--library") config.libraryPath = path.resolve(next());
    else if (arg === "--json") config.jsonPath = path.resolve(next());
    else if (arg === "--report") config.reportPath = path.resolve(next());
    else if (arg === "--fail-on") config.failOn = next().toLowerCase();
    else if (arg === "--all") config.all = true;
    else if (arg === "--help" || arg === "-h") config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

function help() {
  return `Question Quality Auditor\n\nUsage:\n  node audit_tools/question_quality_auditor.mjs --concepts demand,supply,market-equilibrium [options]\n\nOptions:\n  --concept ID       Audit one concept; repeat as needed.\n  --concepts A,B     Audit a comma-separated concept list.\n  --pool NAME        Limit to one pool; repeat as needed.\n  --pools A,B        Limit to comma-separated pools.\n  --all              Audit the whole Composer corpus.\n  --json PATH        Write the machine-readable report.\n  --report PATH      Write the Markdown report.\n  --fail-on LEVEL    error (default), warning, review, or none.\n  --library PATH     Override composer_library.js.\n`;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (config.help) {
    process.stdout.write(help());
    return;
  }
  if (!config.all && !config.concepts.length) throw new Error("Choose --concept/--concepts or --all.");
  if (!new Set(["error", "warning", "review", "none"]).has(config.failOn)) throw new Error("--fail-on must be error, warning, review, or none.");
  const library = loadComposerLibrary(config.libraryPath || DEFAULT_LIBRARY);
  const concepts = config.all ? Object.keys(library.concepts || {}).sort() : [...new Set(config.concepts)];
  const entries = collectComposerQuestions(library, { concepts, pools: [...new Set(config.pools)] });
  const audit = auditQuestionRecords(entries, { assetMap: inventoryMap(library), composerRoot: DEFAULT_COMPOSER_ROOT });
  const grouped = new Map();
  for (const finding of audit.findings) {
    const key = `${finding.severity}:${finding.rule}`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  const conceptQuestionCounts = concepts.map(concept => ({ concept, count: entries.filter(entry => entry.conceptId === concept).length }));
  const poolInventory = [...new Set(entries.flatMap(entry => [...entry.pools]))].sort();
  const questionCountsByPool = poolInventory.map(pool => ({ pool, count: entries.filter(entry => entry.pools.has(pool)).length }));
  const conceptFindingCounts = concepts.map(concept => ({ concept, count: audit.findings.filter(finding => finding.concept === concept).length })).sort((left, right) => right.count - left.count || left.concept.localeCompare(right.concept));
  const poolFindingCounts = poolInventory.map(pool => ({ pool, count: audit.findings.filter(finding => finding.pools.includes(pool)).length })).sort((left, right) => right.count - left.count || left.pool.localeCompare(right.pool));
  const findingsByQuestion = new Map();
  for (const finding of audit.findings) {
    if (!findingsByQuestion.has(finding.questionId)) findingsByQuestion.set(finding.questionId, []);
    findingsByQuestion.get(finding.questionId).push(finding);
  }
  const questionsWithMultipleFindings = [...findingsByQuestion.entries()].filter(([, findings]) => findings.length > 1).map(([questionId, findings]) => ({
    questionId,
    concept: findings[0].concept,
    pools: findings[0].pools,
    count: findings.length,
    rules: [...new Set(findings.map(finding => finding.rule))].sort()
  })).sort((left, right) => right.count - left.count || left.questionId.localeCompare(right.questionId));
  const result = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    scope: { concepts, pools: [...new Set(config.pools)], poolInventory, questionCount: entries.length, conceptQuestionCounts, questionCountsByPool },
    counts: audit.counts,
    ruleCounts: [...grouped.entries()].map(([key, count]) => {
      const [severity, ...rule] = key.split(":");
      return { severity, rule: rule.join(":"), count };
    }).sort((left, right) => left.severity.localeCompare(right.severity) || left.rule.localeCompare(right.rule)),
    conceptFindingCounts,
    poolFindingCounts,
    findingSummary: {
      totalFindings: audit.findings.length,
      uniqueQuestionsAffected: findingsByQuestion.size,
      questionsWithMultipleFindings
    },
    findings: audit.findings
  };
  if (config.jsonPath) {
    fs.mkdirSync(path.dirname(config.jsonPath), { recursive: true });
    fs.writeFileSync(config.jsonPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  if (config.reportPath) {
    fs.mkdirSync(path.dirname(config.reportPath), { recursive: true });
    fs.writeFileSync(config.reportPath, renderMarkdownReport(result));
  }
  console.log(JSON.stringify({ scope: result.scope, counts: result.counts, ruleCounts: result.ruleCounts, json: config.jsonPath || null, report: config.reportPath || null }, null, 2));
  const fail = config.failOn === "error" ? result.counts.errors > 0
    : config.failOn === "warning" ? result.counts.errors + result.counts.warnings > 0
      : config.failOn === "review" ? result.counts.errors + result.counts.warnings + result.counts.reviews > 0
        : false;
  if (fail) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.stack || error.message || String(error));
    process.exit(2);
  });
}
