import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  bridgeQuestions,
  ordinaryQuestions,
  PHASE2B_OWNERSHIP,
  PHASE2B_SOURCE_VERSION,
  repairQuestions
} from "../play/economic-realm/national-ledger/authoring/national_ledger_phase2b_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relativeBank = "play/economic-realm/national-ledger/national_ledger_questions_student.js";
const bankPath = path.join(root, relativeBank);
const htmlPath = path.join(root, "play/economic-realm/national-ledger/index.html");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "audit_tools/national_ledger_phase2b_legacy_baseline.json"), "utf8"));
const normalize = value => String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const hashAnswer = value => crypto.createHash("sha256").update(normalize(value)).digest("hex");
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const failures = [];
let passes = 0;
const check = (condition, message) => condition ? passes++ : failures.push(message);

function loadBank(source) {
  const context = { crypto: crypto.webcrypto, TextEncoder };
  vm.createContext(context);
  vm.runInContext(`${source}\n;globalThis.__groups={banks:questionBanks,repair:microSkillRepairPools,bridge:microSkillBridgePools};`, context);
  return context.__groups;
}

function rows(groups) {
  return Object.entries(groups).flatMap(([groupName, group]) =>
    Object.entries(group).flatMap(([poolName, records]) =>
      records.map((record, index) => ({ groupName, poolName, index, record }))
    )
  );
}

function rawRecords(source) {
  const records = [];
  const pattern = /(?:^|\n)(\s*)\{\n\s*"id"\s*:\s*/g;
  let match;
  while ((match = pattern.exec(source))) {
    const start = match.index + (match[0][0] === "\n" ? 1 : 0);
    let depth = 0;
    let string = false;
    let escaped = false;
    let end = -1;
    for (let index = start; index < source.length; index++) {
      const character = source[index];
      if (string) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') string = false;
      } else if (character === '"') string = true;
      else if (character === "{") depth++;
      else if (character === "}" && --depth === 0) { end = index + 1; break; }
    }
    if (end > 0) {
      const raw = source.slice(start, end);
      records.push({ id: String(JSON.parse(raw).id), raw });
      pattern.lastIndex = end;
    }
  }
  return records;
}

function tokenSet(value) {
  return new Set(normalize(value).replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(token => token.length > 2));
}

function similarity(left, right) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  const intersection = [...a].filter(token => b.has(token)).length;
  return intersection / (a.size + b.size - intersection || 1);
}

execFileSync(process.execPath, [path.join(root, "audit_tools/publish_national_ledger_phase2b.mjs")], { cwd: root, stdio: "pipe" });
const source = fs.readFileSync(bankPath, "utf8");
const groups = loadBank(source);
const allRows = rows(groups);
const all = allRows.map(row => row.record);
const phaseIds = new Set([...ordinaryQuestions, ...repairQuestions, ...bridgeQuestions].map(record => String(record.id)));
const legacyRows = allRows.filter(row => !phaseIds.has(String(row.record.id)));
const ordinaryPools = ["easy", "medium", "hard", "elite", "legendary"];
const ordinary = ordinaryPools.flatMap(pool => (groups.banks[pool] || []).map(record => ({ pool, record })));
const phaseOrdinary = ordinary.filter(({ record }) => record.sourceCurationPhase === "phase2b-national-ledger");
const phaseRepair = Object.values(groups.repair).flat().filter(record => record.sourceCurationPhase === "phase2b-national-ledger");
const phaseBridge = Object.values(groups.bridge).flat().filter(record => record.sourceCurationPhase === "phase2b-national-ledger");

check(source.includes(`Source version: ${PHASE2B_SOURCE_VERSION}`), "student bank source version mismatch");
check(all.length === 676, `expected 676 total records, found ${all.length}`);
check(ordinary.length === 422, `expected 422 ordinary records, found ${ordinary.length}`);
check(phaseOrdinary.length === PHASE2B_OWNERSHIP.ordinary.expected, `Phase 2B ordinary count ${phaseOrdinary.length}`);
check(phaseRepair.length === PHASE2B_OWNERSHIP.repair.expected, `Phase 2B Repair count ${phaseRepair.length}`);
check(phaseBridge.length === PHASE2B_OWNERSHIP.bridge.expected, `Phase 2B Bridge count ${phaseBridge.length}`);
const tierCounts = Object.fromEntries(ordinaryPools.map(pool => [pool, phaseOrdinary.filter(row => row.pool === pool).length]));
check(JSON.stringify(tierCounts) === JSON.stringify({ easy: 0, medium: 0, hard: 2, elite: 5, legendary: 5 }), `tier counts ${JSON.stringify(tierCounts)}`);
check(new Set(all.map(record => String(record.id))).size === all.length, "question IDs are not globally unique");
check(all.every(record => !Object.hasOwn(record, "a") && !Object.hasOwn(record, "answer") && !Object.hasOwn(record, "answerIndex")), "student bank exposes a plaintext answer/index field");
for (const record of all) {
  check(Array.isArray(record.options) && record.options.length === 4, `four-choice schema failure ${record.id}`);
  check(new Set((record.options || []).map(normalize)).size === 4, `non-distinct choices ${record.id}`);
  check((record.options || []).filter(option => hashAnswer(option) === record.aHash).length === 1, `answer hash mismatch ${record.id}`);
}
check(new Set(ordinary.map(({ record }) => normalize(record.q))).size === ordinary.length, "duplicate ordinary stems detected");
check(new Set(all.map(record => normalize(record.q))).size === all.length, "duplicate stems detected across the full bank");

const baselineSource = execFileSync("git", ["show", `${manifest.sourceCommit}:${relativeBank}`], { cwd: root, encoding: "utf8" });
const baselineGroups = loadBank(baselineSource);
const baselineRows = rows(baselineGroups);
const identityDigest = sha256(legacyRows.map(row => `${row.groupName}|${row.poolName}|${row.index}|${row.record.id}`).join("\n"));
const recordDigest = sha256(legacyRows.map(row => JSON.stringify(row.record)).join("\n"));
check(baselineRows.length === manifest.legacyRecordCount && legacyRows.length === manifest.legacyRecordCount, "legacy record count changed");
check(identityDigest === manifest.orderedIdentitySha256, "legacy ID/order digest changed");
check(recordDigest === manifest.serializedRecordSha256, "legacy serialized-record digest changed");
const baselineRaw = rawRecords(baselineSource);
const currentLegacyRaw = rawRecords(source).filter(row => !phaseIds.has(row.id));
check(baselineRaw.length === 651 && currentLegacyRaw.length === 651, "raw legacy object count changed");
for (let index = 0; index < baselineRaw.length; index++) {
  check(baselineRaw[index].id === currentLegacyRaw[index].id, `legacy raw order changed at ${index}`);
  check(baselineRaw[index].raw === currentLegacyRaw[index].raw, `legacy record bytes changed ${baselineRaw[index].id}`);
}
check(baselineRows.every(row => !Object.hasOwn(row.record, "a") && !Object.hasOwn(row.record, "answer")), "baseline contains exposed plaintext answers");
check([...ordinaryQuestions, ...repairQuestions, ...bridgeQuestions].every(record => !baselineRows.some(row => String(row.record.id) === String(record.id))), "author IDs overlap protected legacy IDs");

const authored = [...ordinaryQuestions, ...repairQuestions, ...bridgeQuestions];
for (const record of authored) {
  const averageDistractorLength = record.distractors.reduce((sum, item) => sum + item.length, 0) / 3;
  check(record.answer.length / averageDistractorLength <= 1.45, `correct-answer length cue ${record.id}`);
  check(record.q.trim().split(/\s+/).length <= 70, `stem exceeds 70 words ${record.id}`);
  check(record.distractors.every(option => option.length <= 180) && record.answer.length <= 180, `option exceeds 180 characters ${record.id}`);
  const nearest = legacyRows.reduce((best, row) => Math.max(best, similarity(record.q, row.record.q)), 0);
  check(nearest < 0.82, `new item is too similar to protected content ${record.id} (${nearest.toFixed(2)})`);
}
const positionCounts = records => records.reduce((counts, sourceRecord) => {
  const published = all.find(record => String(record.id) === String(sourceRecord.id));
  counts[published.options.findIndex(option => hashAnswer(option) === published.aHash)]++;
  return counts;
}, [0, 0, 0, 0]);
check(JSON.stringify(positionCounts(ordinaryQuestions)) === JSON.stringify([3, 3, 3, 3]), "ordinary answer positions are not balanced");
check(JSON.stringify(positionCounts(bridgeQuestions)) === JSON.stringify([2, 2, 2, 2]), "Bridge answer positions are not balanced");

const quantitativeAnswers = new Map([
  [42000, "150 million; employed adults plus active job seekers"], [42001, "132 million; 124 million employed plus 8 million unemployed"],
  [42002, "161 million and 64.4%"], [42003, "Technological knowledge improved, raising productivity from 8 to 10 units per hour"],
  [42008, "Natural-resource output rose, but real GDP per person may have fallen"], [42010, "3%"],
  [43000, "85"], [44000, "100"], [44006, "About 4%"]
]);
for (const [id, answer] of quantitativeAnswers) check(authored.find(record => record.id === id)?.answer === answer, `independent quantitative result mismatch ${id}`);

const changedSkills = ["labor_force_calculation", "technological_knowledge", "human_capital", "natural_resources", "nominal_vs_real_gdp", "discouraged_workers"];
const exact = (group, skill) => Object.values(group).flat().filter(record => record.primarySkill === skill || record.repairSkill === skill);
const choose = (pool, history) => pool.find(record => !history.includes(String(record.id))) || pool.slice().sort((a, b) => history.indexOf(String(a.id)) - history.indexOf(String(b.id)))[0];
for (const skill of changedSkills) {
  const repair = exact(groups.repair, skill);
  const bridge = exact(groups.bridge, skill);
  const retest = ordinary.filter(({ record }) => record.primarySkill === skill || record.repairSkill === skill).map(row => row.record);
  check(repair.length >= 2, `changed skill lacks two exact Repairs: ${skill}`);
  check(bridge.length >= 2, `changed skill lacks two exact Bridges: ${skill}`);
  check(retest.length >= 3, `changed skill lacks fresh Retests: ${skill}`);
  const repairHistory = [];
  const r1 = choose(repair, repairHistory); repairHistory.push(String(r1.id));
  const r2 = choose(repair, repairHistory); repairHistory.push(String(r2.id));
  const r3 = choose(repair, repairHistory);
  const bridgeHistory = [];
  const b1 = choose(bridge, bridgeHistory); bridgeHistory.push(String(b1.id));
  const b2 = choose(bridge, bridgeHistory);
  check(r1.id !== r2.id && String(r3.id) === repairHistory[0], `Repair unseen/LRS simulation failed ${skill}`);
  check(b1.id !== b2.id, `Bridge unseen-first simulation failed ${skill}`);
  check(retest.some(record => ![r1.id, r2.id, b1.id, b2.id].includes(record.id)), `fresh Retest simulation failed ${skill}`);
}

for (const skill of ["gdp_components_identity", "cpi_calculation", "technological_knowledge", "labor_force_calculation"]) {
  const miss = ordinary.find(({ record }) => record.primarySkill === skill)?.record;
  const repair = exact(groups.repair, skill)[0];
  const bridge = exact(groups.bridge, skill)[0];
  const retest = ordinary.find(({ record }) => record.primarySkill === skill && record.id !== miss?.id)?.record;
  check(Boolean(miss && repair && bridge && retest), `representative miss -> Repair -> Bridge -> Retest path missing ${skill}`);
  check(new Set([miss?.id, repair?.id, bridge?.id, retest?.id]).size === 4, `representative path is not fresh ${skill}`);
}

const html = fs.readFileSync(htmlPath, "utf8");
check(html.includes('const GAME_VERSION = "National-Ledger-2026.08.24-phase2b"'), "National Ledger version not bumped");
check(html.includes('const TELEMETRY_VERSION = "Ledger-local-telemetry-v4-hashed-bank"'), "telemetry schema/version changed");
check(html.includes('national_ledger_questions_student.js?v=phase2b'), "Phase 2B bank cache key missing");
check(/eliteReady:[\s\S]{0,250}accuracy >= 0\.92/.test(html) && /if\(profile\.eliteReady\) return "stretch"/.test(html), "Standard challenge/stretch routing changed");
check(/getRemediationSelectionPool/.test(html) && /leastRecentlySeen/.test(html), "anti-repeat runtime architecture missing");
check(/modeAllowsSave\(\)[^{]*\{ return gameMode === "standard" \|\| gameMode === "legendary"; \}/.test(html), "Standard save boundary changed");
check(/Repair Weak Areas/.test(html) && /End Practice/.test(html) && /Unlimited Practice/.test(html), "practice/report controls missing");
check(phaseOrdinary.some(row => row.pool === "hard") && phaseOrdinary.some(row => row.pool === "elite"), "new upper-tier items are unavailable to Standard challenge/stretch");
check(phaseOrdinary.every(({ record }) => !record.image && !record.graphRequired), "Phase 2B introduced an unsupported graph requirement");

if (failures.length) {
  console.error(`FAIL: ${failures.length} issue(s), ${passes} checks passed`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS: National Ledger Phase 2B validator (${passes} checks)`);
console.log(`Legacy 651 unchanged; ordinary 410 -> 422; Phase 2B tiers ${JSON.stringify(tierCounts)}; Repair +${phaseRepair.length}; Bridge +${phaseBridge.length}`);
console.log("Representative GDP, CPI, growth/productivity, and labor-force remediation paths: PASS");
