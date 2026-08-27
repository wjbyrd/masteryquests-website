import crypto from "node:crypto";

export const CONTEXTS = Object.freeze([
  "a campus dining plan", "a neighborhood grocery", "a commuter's weekly budget", "a public library program",
  "a regional health market", "a city housing survey", "a small-business loan market", "an online resale platform",
  "a retirement workshop", "a community-college class", "a local election", "a household energy plan",
  "a farmers' cooperative", "a mobile-phone contract", "a job-training program", "a used-car marketplace",
  "a school district", "a food-delivery service", "a rural clinic", "a streaming subscription market",
  "a municipal budget hearing", "a charitable foundation", "a labor contract", "a consumer-credit market",
  "an insurance exchange", "a product-warranty market", "a neighborhood association", "a university bookstore",
  "a public-transit system", "a tax-policy forum", "a workplace benefits plan", "a state ballot campaign",
  "a household survey", "a financial-literacy seminar", "a retail loyalty program", "a public-policy workshop"
]);

export function authoredRow(q, answer, distractors, objective, type, primarySkill, feedback, tag, extra = {}) {
  return { q, answer, distractors, objective, type, primarySkill, feedback, tag, ...extra };
}

function difficultyPlan(total, quotas, supportCount) {
  const remaining = { ...quotas, medium: quotas.medium - supportCount };
  if (remaining.medium < 0) throw new Error("Medium quota is smaller than support depth.");
  const cycle = ["easy", "medium", "hard", "medium", "easy", "hard", "medium", "elite", "easy", "legendary", "medium", "hard"];
  const plan = [];
  for (let cursor = 0; plan.length < total - supportCount; cursor += 1) {
    const candidate = cycle[cursor % cycle.length];
    if (remaining[candidate] > 0) {
      plan.push(candidate);
      remaining[candidate] -= 1;
    }
  }
  if (Object.values(remaining).some(Boolean)) throw new Error(`Difficulty quotas remain: ${JSON.stringify(remaining)}`);
  return plan;
}

function poolFor(difficulty, seen) {
  seen[difficulty] = (seen[difficulty] || 0) + 1;
  if (seen[difficulty] <= 6) {
    if (difficulty === "easy") return "easyBoss";
    if (difficulty === "medium") return "mediumBoss";
    if (difficulty === "hard") return "finalBoss";
    if (difficulty === "legendary") return "legendaryBoss";
  }
  return difficulty;
}

function capitalizeFirstAlphabetic(value) {
  return String(value).replace(/\p{L}/u, letter => letter.toUpperCase());
}

export function finalizeQuestions(rows, config) {
  const { idFirst, idLast, conceptId, objectives, objectiveCounts, difficultyQuotas, phase, graphAssets } = config;
  const byObjective = new Map();
  for (const row of rows) {
    if (!objectives[row.objective]) throw new Error(`Unknown objective ${row.objective}.`);
    if (!byObjective.has(row.objective)) byObjective.set(row.objective, []);
    byObjective.get(row.objective).push(row);
  }
  for (const [objective, expected] of Object.entries(objectiveCounts)) {
    const actual = byObjective.get(objective)?.length || 0;
    if (actual !== expected) throw new Error(`${objective} expected ${expected}; found ${actual}.`);
  }
  const supportRows = new Map();
  Object.keys(objectiveCounts).slice(0, 6).forEach(objective => {
    const group = byObjective.get(objective);
    supportRows.set(group.at(-1), "repairQuestions");
    supportRows.set(group.at(-2), "bridgeQuestions");
  });
  const plan = difficultyPlan(rows.length, difficultyQuotas, supportRows.size);
  const poolSeen = {};
  let ordinaryIndex = 0;
  const questions = rows.map((row, index) => {
    const supportPool = supportRows.get(row);
    const difficulty = supportPool ? "medium" : plan[ordinaryIndex++];
    const pool = supportPool || poolFor(difficulty, poolSeen);
    return {
      id: idFirst + index,
      q: capitalizeFirstAlphabetic(row.q),
      answer: row.answer,
      distractors: row.distractors,
      objective: row.objective,
      objectiveLabel: objectives[row.objective],
      primarySkill: row.primarySkill,
      secondarySkills: [],
      repairSkill: row.primarySkill,
      difficulty,
      pool,
      type: supportPool === "bridgeQuestions" ? "bridge" : row.type,
      tag: row.tag,
      conceptCluster: conceptId,
      commonError: row.commonError || `Uses a neighboring rule instead of the evidence required by ${objectives[row.objective]}.`,
      feedback: row.feedback,
      graphRequired: Boolean(row.asset),
      asset: row.asset || null,
      scenario: row.asset ? graphAssets[row.asset].scenario : null,
      sourceCurationPhase: phase
    };
  });
  if (questions.length !== idLast - idFirst + 1 || questions.at(-1)?.id !== idLast) throw new Error("Question count does not match the pinned ID range.");
  if (new Set(questions.map(question => question.q.trim().toLowerCase())).size !== questions.length) throw new Error("Duplicate authored stems detected.");
  const difficulty = questions.reduce((acc, question) => (acc[question.difficulty] = (acc[question.difficulty] || 0) + 1, acc), {});
  for (const [level, expected] of Object.entries(difficultyQuotas)) if (difficulty[level] !== expected) throw new Error(`${level} expected ${expected}; found ${difficulty[level]}.`);
  return questions;
}

export function stableHash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
