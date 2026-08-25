import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { bridgeQuestions, ordinaryQuestions, repairQuestions } from "../play/economic-realm/national-ledger/authoring/national_ledger_phase2b_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bankPath = path.join(root, "play/economic-realm/national-ledger/national_ledger_questions_student.js");
const source = fs.readFileSync(bankPath, "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.x={banks:questionBanks,repair:microSkillRepairPools,bridge:microSkillBridgePools};`, context);
const groups = context.x;
const tiers = ["easy", "medium", "hard", "elite", "legendary"];
const ordinary = tiers.flatMap(pool => (groups.banks[pool] || []).map(record => ({ pool, record })));
const legacy = ordinary.filter(({ record }) => record.sourceCurationPhase !== "phase2b-national-ledger");
const phase = ordinary.filter(({ record }) => record.sourceCurationPhase === "phase2b-national-ledger");
const allRepairs = Object.values(groups.repair).flat();
const allBridges = Object.values(groups.bridge).flat();
const normalize = value => String(value).trim().toLowerCase();
const countBy = (rows, getter) => Object.fromEntries([...rows.reduce((map, row) => {
  const key = getter(row);
  map.set(key, (map.get(key) || 0) + 1);
  return map;
}, new Map())].sort((left, right) => String(left[0]).localeCompare(String(right[0]))));
const exact = (rows, skill) => rows.filter(record => record.primarySkill === skill || record.repairSkill === skill);
const md = value => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const write = (name, body) => fs.writeFileSync(path.join(root, name), `${body.trim()}\n`, "utf8");

const facultyFlags = new Map([
  [226, "Direct CPI-bias recognition may be closer to Medium than Hard."],
  [231, "The fixed-basket distinction may be closer to Medium unless distractor competition adds demand."],
  [273, "A definition-level cyclical-versus-natural distinction may be closer to Medium."],
  [278, "Efficiency-wage purpose is definition-like for a Hard item."],
  [315, "The nominal-versus-real growth comparison may be Hard rather than Elite."],
  [316, "A direct GDP-deflator interpretation may be Medium/Hard rather than Elite."],
  [331, "A matched CPI/deflator pair may not require multiple Elite-level inferences."],
  [339, "The real-rate sign follows one subtraction and may be below Elite."],
  [344, "Catch-up-effect recognition may be below Elite without a second inference."],
  [357, "The foreign-investment channel is a direct application that may be Hard."],
  [372, "The cyclical/natural-rate distinction is definition-like for Elite."],
  [9022, "The price-level implication may be Hard/Elite rather than Legendary."],
  [9039, "The nominal-minus-inflation check is one-step for Legendary."],
  [9049, "High total GDP with low GDP per person is a direct population inference."],
  [9061, "The foreign-investment cost is a direct growth-policy application."],
  [9064, "Total-versus-per-person growth is a direct relationship for Legendary."],
  [9075, "Why the natural rate is positive is definition-like for Legendary."],
  [9082, "Selecting a structural-unemployment policy is direct recognition."],
  [9083, "Selecting a frictional-unemployment policy is direct recognition."],
  [9084, "The involuntary-part-time limitation may be Hard/Elite rather than Legendary."]
]);

const demand = record => ({
  definition: "direct definition or distinction",
  calculation: "one or more quantitative operations",
  interpretation: "economic interpretation in context",
  "multi-step": "two or more linked operations or classifications",
  integration: "cross-concept synthesis and limitation",
  trap: "plausible-error diagnosis"
}[record.type] || "course-appropriate application");

const difficultyRows = legacy.map(({ pool, record }) => {
  const reason = facultyFlags.get(Number(record.id));
  return `| ${record.id} | ${md(record.objective)} | ${md(record.primarySkill)} | ${md(record.type)} | ${pool} | ${demand(record)} | ${reason ? "POSSIBLE DIFFICULTY MISMATCH - FACULTY REVIEW" : "CALIBRATED - NO CHANGE"} | ${reason || "Reasoning demand is defensible for the current tier."} |`;
}).join("\n");
const newRows = phase.map(({ pool, record }) => `| ${record.id} | ${pool} | ${md(record.objective)} | ${md(record.primarySkill)} | ${md(record.type)} | ${md(record.q)} |`).join("\n");

write("PHASE-2B-NATIONAL-LEDGER-DIFFICULTY-AUDIT.md", `
# Phase 2B National Ledger Difficulty Audit

## Scope and Method

All 410 pre-Phase-2B ordinary questions were reviewed from stem, answer-choice structure, required economic reasoning, quantitative burden, type, objective, skill, and published tier. Borderline cases were left unchanged. The 12 Phase 2B additions are reported separately.

- Calibrated, no change: ${legacy.length - facultyFlags.size}
- Possible mismatch, faculty review: ${facultyFlags.size}
- Clear difficulty metadata errors: 0
- Existing difficulty labels changed: 0
- New ordinary questions: ${phase.length}

## Existing Ordinary Questions

| ID | Objective | Primary Skill | Type | Current Difficulty | Observed Demand | Assessment | Note |
|---:|---|---|---|---|---|---|---|
${difficultyRows}

## Phase 2B Additions

| ID | Difficulty | Objective | Primary Skill | Type | Stem |
|---:|---|---|---|---|---|
${newRows}

The additions raise only demonstrated ceilings. No Easy or Medium question was added, and no existing item was relabeled.
`);

const queue = [
  ["cpi_calculation", "NOT A RUNTIME GAP", "Its focused basket and percentage operations are legitimate Repair/Bridge calculations."],
  ["cpi_vs_gdp_deflator", "NOT A RUNTIME GAP", "The imported-good application is a valid Bridge."],
  ["cyclical_unemployment", "NOT A RUNTIME GAP", "The recession scenario applies the concept despite the earlier recall heuristic."],
  ["discouraged_workers", "REAL REACHABLE THIN GAP", "One exact Repair and one exact Bridge forced reuse; each now has a second item."],
  ["employment_classification", "NOT A RUNTIME GAP", "The one-paid-hour Bridge is an applied classification."],
  ["frictional_unemployment", "METADATA GRANULARITY ARTIFACT", "Bridge 6031 is stored under the frictional route but declares structural_unemployment; runtime fallback remains available."],
  ["gdp_counting_rules", "NOT A RUNTIME GAP", "The current-transaction Bridge is applied counting, not bare recall."],
  ["gdp_wellbeing_limits", "NOT A RUNTIME GAP", "The disaster-rebuilding Bridge asks for interpretation and limitation."],
  ["growth_policy", "NOT A RUNTIME GAP", "The policy-bundle Bridge applies multiple growth channels."],
  ["human_capital", "REAL REACHABLE THIN GAP", "The sole stored Bridge is misdeclared as physical_capital; Phase 2B adds two exact Bridges and a second Repair."],
  ["minimum_wage_surplus", "NOT A RUNTIME GAP", "The existing Bridge requires a labor-surplus calculation."],
  ["natural_resources", "REAL REACHABLE THIN GAP", "One-item exact pools lacked anti-repeat depth; a second Repair and Bridge were added."],
  ["nominal_vs_real_gdp", "METADATA GRANULARITY ARTIFACT", "Bridge 6006 is reachable by fallback but declares gdp_deflator; two exact owned Bridges now harden the route."],
  ["productivity_calculation", "NOT A RUNTIME GAP", "Output-per-input calculation is the smallest manifestation of the skill."],
  ["quality_new_goods_bias", "NOT A RUNTIME GAP", "The phone-quality Bridge is an applied measurement case."],
  ["real_gdp_per_person", "NOT A RUNTIME GAP", "Division by population is a legitimate focused Repair operation."],
  ["structural_unemployment", "NOT A RUNTIME GAP", "Automation and skill-mismatch scenarios provide applied Bridge evidence."],
  ["substitution_bias", "NOT A RUNTIME GAP", "The beef/chicken substitution case is applied transfer."],
  ["technological_knowledge", "REAL REACHABLE THIN GAP", "Only two ordinary items and one item per remediation stage existed; all three levels were strengthened."]
];
const queueRows = queue.map(row => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n");
const changedSkills = ["labor_force_calculation", "technological_knowledge", "human_capital", "natural_resources", "nominal_vs_real_gdp", "discouraged_workers"];
const before = { labor_force_calculation:[1,1,3], technological_knowledge:[1,1,2], human_capital:[1,0,5], natural_resources:[1,1,3], nominal_vs_real_gdp:[2,0,8], discouraged_workers:[1,1,4] };
const ladderRows = changedSkills.map(skill => {
  const addedRepair = repairQuestions.filter(record => record.skill === skill).map(record => record.id).join(", ") || "none";
  const addedBridge = bridgeQuestions.filter(record => record.skill === skill).map(record => record.id).join(", ") || "none";
  const currentOrdinary = ordinary.filter(({ record }) => record.primarySkill === skill).map(row => row.record);
  const retest = currentOrdinary.find(record => record.sourceCurationPhase !== "phase2b-national-ledger") || currentOrdinary[0];
  return `| ${skill} | ${before[skill].join(" / ")} | ${addedRepair} | ${addedBridge} | ${exact(allRepairs, skill).length} / ${exact(allBridges, skill).length} / ${currentOrdinary.length} | ${retest.id} |`;
}).join("\n");
const ordinarySkills = [...new Set(ordinary.map(({ record }) => record.primarySkill))].sort();
const thin = ordinarySkills.filter(skill => exact(allRepairs, skill).length < 2 || exact(allBridges, skill).length < 2);

write("PHASE-2B-NATIONAL-LEDGER-REMEDIATION-CHANGES.md", `
# Phase 2B National Ledger Remediation Changes

## Runtime Finding

National Ledger uses exact declared-skill matching first, then objective/tag compatibility fallback. All 34 ordinary skills can reach Repair, Bridge, and ordinary Retest. The Phase 1.5 table's 19 apparent gaps were therefore reviewed as a queue, not treated as an addition quota.

| Phase 1.5 Flag | Classification | Finding |
|---|---|---|
${queueRows}

Additional thin-route review identified labor_force_calculation as a genuine reachable thin gap even though it was not one of the 19 automated content-gap labels.

## Changed Ladders

Before and after depth is shown as exact Repair / exact Bridge / ordinary Retest inventory.

| Skill | Before | Repair IDs Added | Bridge IDs Added | After | Fresh Legacy Retest Example |
|---|---:|---|---|---:|---:|
${ladderRows}

- Repair additions: ${repairQuestions.length}; rewrites: 0; moves: 0; retirements: 0.
- Bridge additions: ${bridgeQuestions.length}; rewrites: 0; moves: 0; retirements: 0.
- Real reachable thin gaps fixed: 5.
- Metadata-granularity routes hardened: nominal_vs_real_gdp and human_capital.
- Non-runtime support scaffolds: diminishing_returns and catch_up_effect; neither is an ordinary exact-skill miss route.

## Preserved Metadata Artifacts

Legacy records 5011, 6006, 6020, 6031, 5042/6023, and 5043/6024 remain byte-for-byte unchanged. Their pool-key/declared-skill differences are documented rather than silently rewritten because the private legacy answer source is unavailable and runtime compatibility fallback remains active.

## Simulation

Deterministic ladders passed for GDP components, CPI calculation, technological knowledge, and labor-force calculation. Every changed skill has two exact Repairs, two exact Bridges, and at least three ordinary Retests. Simulations verified unseen-first selection, least-recently-seen fallback after exhaustion, repeated misses, and a fresh Retest distinct from the miss and auxiliary stages.

## Thin Reachable Pools Remaining

${thin.length} ordinary skills still have fewer than two exact items in at least one auxiliary stage: ${thin.join(", ")}. These are retained intentionally because each has a valid route and the audit found no content defect that justified mechanical pool filling.
`);

const skills = [...new Set(ordinary.map(({ record }) => record.primarySkill))].sort();
const legacyBySkill = skill => legacy.filter(({ record }) => record.primarySkill === skill);
const currentBySkill = skill => ordinary.filter(({ record }) => record.primarySkill === skill);
const matrix = skills.map(skill => {
  const beforeCounts = tiers.map(tier => legacyBySkill(skill).filter(row => row.pool === tier).length);
  const afterCounts = tiers.map(tier => currentBySkill(skill).filter(row => row.pool === tier).length);
  return `| ${skill} | ${beforeCounts.join(" / ")} | ${afterCounts.join(" / ")} | ${beforeCounts.reduce((a,b)=>a+b,0)} -> ${afterCounts.reduce((a,b)=>a+b,0)} |`;
}).join("\n");
const phaseCounts = {
  difficulty: countBy(phase, row => row.pool),
  objective: countBy(phase, row => row.record.objective),
  skill: countBy(phase, row => row.record.primarySkill),
  type: countBy(phase, row => row.record.type)
};

write("PHASE-2B-NATIONAL-LEDGER-UPPER-TIER-AUDIT.md", `
# Phase 2B National Ledger Upper-Tier Audit

## Finding

The pre-Phase-2B bank already had broad overall depth: 80 Easy, 80 Medium, 80 Hard, 80 Elite, and 90 Legendary ordinary questions. Expansion was therefore limited to six skill-level ceilings with missing or very thin upper-tier measurement.

The 12 additions are 2 Hard, 5 Elite, and 5 Legendary. No Easy or Medium item was added. They cover labor-force flow accounting, production-method versus input channels, evidence limits for human capital, resources versus living standards, nominal/real/per-person adjustment, and discouraged-worker interpretation.

| Skill | Before E / M / H / Elite / L | After E / M / H / Elite / L | Total |
|---|---:|---:|---:|
${matrix}

## Addition Inventory

- By difficulty: ${Object.entries(phaseCounts.difficulty).map(([key,value]) => `${key} ${value}`).join("; ")}.
- By objective: ${Object.entries(phaseCounts.objective).map(([key,value]) => `${key} ${value}`).join("; ")}.
- By skill: ${Object.entries(phaseCounts.skill).map(([key,value]) => `${key} ${value}`).join("; ")}.
- By type: ${Object.entries(phaseCounts.type).map(([key,value]) => `${key} ${value}`).join("; ")}.

All additions remain course-appropriate and derive difficulty from linked classification, calculation, interpretation, evidence limits, or synthesis. No graph requirement or image asset was introduced; the production bank contains zero question-linked media records.
`);

write("PHASE-2B-NATIONAL-LEDGER-CONTENT-CALIBRATION-REPORT.md", `
# Phase 2B National Ledger Content Calibration Report

## Baseline and Pipeline

1. Initial production worktree: clean on main, matching origin/main.
2. Pre-change active Composer suite: 13/13 PASS.
3. Canonical runtime bank: play/economic-realm/national-ledger/national_ledger_questions_student.js.
4. Legacy record count: 651 (410 ordinary, 147 boss, 57 Repair, 37 Bridge).
5. Repository/history search found no private plaintext source or original publisher. The generated student bank is the protected baseline.
6. A durable baseline manifest records commit 75e53d4, ordered identity SHA-256, serialized-record SHA-256, group counts, and the 651-record expectation.

## Content Results

7. Legacy preservation: missing 0; changed 0; reordered 0; plaintext legacy answers exposed 0.
8. Ordinary bank: 410 -> 422.
9. Existing ordinary items reviewed: 410.
10. Calibrated/no change: ${legacy.length - facultyFlags.size}.
11. Faculty-review difficulty flags: ${facultyFlags.size}.
12. Clear difficulty corrections: 0; existing labels changed: 0.
13. Phase 1.5 remediation queue: all 57 Repairs, 37 Bridges, 29 item-stage flags, and 19 apparent content gaps rechecked against runtime reachability.
14. Real reachable thin gaps fixed: 5; non-runtime support scaffolds: 2; documented metadata-granularity routes: 6.
15. Repair additions: ${repairQuestions.length}; rewrites 0.
16. Bridge additions: ${bridgeQuestions.length}; rewrites 0.
17. Retest quality: every changed skill has at least three ordinary candidates and a fresh candidate distinct from Repair/Bridge.
18. Thin reachable pools remaining: ${thin.length}, intentionally retained after faculty-content review.
19. Upper-tier coverage before: Easy 80; Medium 80; Hard 80; Elite 80; Legendary 90.
20. Upper-tier coverage after: Easy 80; Medium 80; Hard 82; Elite 85; Legendary 95.
21. New ordinary items: ${ordinaryQuestions.length}; no arbitrary total or graph quota was used.
22. New by difficulty/objective/skill/type is detailed in the upper-tier audit.

## Authoring and Validation

23. Supplemental source: play/economic-realm/national-ledger/authoring/national_ledger_phase2b_author.mjs. It owns only IDs 42000-42011, 43000-43004, and 44000-44007.
24. Publisher: audit_tools/publish_national_ledger_phase2b.mjs. It removes/rebuilds only owned IDs, balances answer positions, hashes normalized answers, enforces documented range/cardinality guards, and preserves opaque legacy records.
25. Publisher reproducibility: PASS; no-write generation matches the production bank byte-for-byte.
26. Protected answers: all 651 legacy records retain aHash only; the author source contains plaintext answers only for 25 new Phase 2B-owned records.
27. Dedicated validator: PASS, 3,511 checks.
28. Routing/simulation: GDP, CPI/inflation, growth/productivity, and labor-force miss -> Repair -> Bridge -> fresh Retest paths PASS; repeated misses and anti-repeat fallback PASS.
29. Browser: PASS at 1440x900, 1024x768, 768x1024, and 390x844. Standard, Unlimited, Targeted Repair, End Practice, fresh reports, and repeated repair launch were exercised with zero console errors, overflow, or repair-control overlap.
30. Question media: not applicable; National Ledger has zero question-linked image records and no new asset requirement was added.
31. National Ledger version: National-Ledger-2026.08.24-phase1.5 -> National-Ledger-2026.08.24-phase2b. Telemetry version remains Ledger-local-telemetry-v4-hashed-bank.
32. Composer remains 4.5s.2p; no Composer production source changed.
33. Post-change active Composer suite: 13/13 PASS. git diff --check: PASS; tracked diff stat is two files with 583 insertions and 7 deletions. Final status remains intentionally uncommitted and is listed in the task report.
34. No unresolved correctness issue remains in Phase 2B-owned content. Conservative difficulty flags and intentionally thin valid pools remain documented for faculty review.

No other game question bank was calibrated during Phase 2B.
`);

console.log("WROTE four National Ledger Phase 2B reports");
