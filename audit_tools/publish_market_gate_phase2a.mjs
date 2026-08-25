import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { graphAssets, ordinaryQuestions, remediationQuestions, PHASE2A_SOURCE_VERSION } from "../play/economic-realm/market-gate/authoring/market_gate_phase2a_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "play/economic-realm/market-gate/market_gate_questions_student.js");
const phaseIds = new Set([...ordinaryQuestions, ...remediationQuestions].map(q => String(q.id)));
const normalize = value => String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const answerHash = value => crypto.createHash("sha256").update(normalize(value)).digest("hex");

function readCurrent() {
  const source = fs.readFileSync(target, "utf8");
  const context = { crypto: crypto.webcrypto, TextEncoder };
  vm.createContext(context);
  vm.runInContext(`${source}\n;globalThis.__banks=questionBanks;globalThis.__repair=microSkillRepairPools;globalThis.__seed=skillRepairSeedPools;globalThis.__bridge=microSkillBridgePools;`, context);
  const clean = object => Object.fromEntries(Object.entries(object).map(([key, rows]) => [key, rows.filter(row => !phaseIds.has(String(row.id)))]));
  return { banks: clean(context.__banks), repair: clean(context.__repair), seed: clean(context.__seed), bridge: clean(context.__bridge) };
}

function rotateOptions(record) {
  const options = [...record.distractors];
  options.splice(Number(record.id) % 4, 0, record.answer);
  return options;
}

function publishOrdinary(record) {
  const options = rotateOptions(record);
  return {
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
    aHash: answerHash(record.answer)
  };
}

function publishRepair(record) {
  const options = rotateOptions(record);
  return {
    id: record.id,
    q: record.q,
    options,
    tag: record.tag,
    type: record.type,
    objective: record.objective,
    difficulty: "microRepair",
    conceptCluster: record.conceptCluster,
    primarySkill: record.primarySkill,
    repairSkill: record.repairSkill,
    commonError: record.commonError,
    feedback: record.feedback,
    sourceCurationPhase: "phase2a-market-gate",
    aHash: answerHash(record.answer)
  };
}

function validateAuthoring() {
  const errors = [];
  const all = [...ordinaryQuestions, ...remediationQuestions];
  const ids = new Set();
  for (const record of all) {
    if (ids.has(String(record.id))) errors.push(`duplicate author ID ${record.id}`);
    ids.add(String(record.id));
    if (!record.q || !record.answer || record.distractors?.length !== 3) errors.push(`invalid author schema ${record.id}`);
    const options = [record.answer, ...(record.distractors || [])];
    if (new Set(options.map(normalize)).size !== 4) errors.push(`non-distinct options ${record.id}`);
  }
  for (const record of ordinaryQuestions) {
    if (!graphAssets[record.asset]) errors.push(`missing alt map ${record.id}: ${record.asset}`);
    if (!fs.existsSync(path.join(path.dirname(target), record.asset))) errors.push(`missing Market Gate asset ${record.asset}`);
  }
  if (ordinaryQuestions.length !== 48) errors.push(`expected 48 ordinary questions, found ${ordinaryQuestions.length}`);
  if (errors.length) throw new Error(errors.join("\n"));
}

function render() {
  validateAuthoring();
  const { banks, repair, seed, bridge } = readCurrent();
  for (const record of ordinaryQuestions) (banks[record.pool] ||= []).push(publishOrdinary(record));
  for (const record of remediationQuestions) (repair[record.skill] ||= []).push(publishRepair(record));
  const count = [banks, repair, seed, bridge].reduce((sum, group) => sum + Object.values(group).flat().length, 0);
  const helper = `/** Normalize answer text exactly as the publisher did. */\nfunction normalizePublishedAnswer(value) {\n  return String(value)\n    .normalize("NFKC")\n    .trim()\n    .replace(/\\s+/g, " ")\n    .toLowerCase();\n}\n\n/** Return the lowercase SHA-256 hex digest used by aHash. */\nasync function hashPublishedAnswer(value) {\n  const bytes = new TextEncoder().encode(normalizePublishedAnswer(value));\n  const digest = await crypto.subtle.digest("SHA-256", bytes);\n  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");\n}\n\n/** Check selected option text against a published question record. */\nasync function isPublishedAnswerCorrect(question, selectedOptionText) {\n  if (!question || typeof question.aHash !== "string") return false;\n  return (await hashPublishedAnswer(selectedOptionText)) === question.aHash;\n}`;
  return `/*\n * STUDENT-FACING QUESTION BANK\n * Generated by audit_tools/publish_market_gate_phase2a.mjs\n * Source version: ${PHASE2A_SOURCE_VERSION}\n * Questions converted: ${count}\n *\n * DO NOT EDIT THIS FILE DIRECTLY.\n * Edit the Market Gate authoring source and run the publisher again.\n * Plaintext answers have been removed and replaced with SHA-256 hashes.\n */\n\n"use strict";\n\n${helper}\n\nconst questionBanks = ${JSON.stringify(banks, null, 2)};\n\nconst microSkillRepairPools = ${JSON.stringify(repair, null, 2)};\n\nconst skillRepairSeedPools = ${JSON.stringify(seed, null, 2)};\n\nconst microSkillBridgePools = ${JSON.stringify(bridge, null, 2)};\n`;
}

const generated = render();
if (process.argv.includes("--write")) {
  fs.writeFileSync(target, generated, "utf8");
  console.log(`WROTE ${path.relative(root, target)} (${ordinaryQuestions.length} ordinary, ${remediationQuestions.length} repair)`);
} else {
  const current = fs.readFileSync(target, "utf8");
  if (current !== generated) {
    console.error("FAIL: generated Market Gate student bank is stale; run with --write");
    process.exit(1);
  }
  console.log("PASS: generated Market Gate student bank matches the authoring source");
}
