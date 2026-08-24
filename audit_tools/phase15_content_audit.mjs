import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const games = [
  ["The Market Gate", "Economic Realm", "play/economic-realm/market-gate/index.html"],
  ["The National Ledger", "Economic Realm", "play/economic-realm/national-ledger/index.html"],
  ["The Equilibrium Crisis", "Economic Realm", "play/economic-realm/equilibrium-crisis/index.html"],
  ["The Liquidity Grid", "Economic Realm", "play/economic-realm/liquidity-grid/index.html"],
  ["The Stabilization Protocol", "Economic Realm", "play/economic-realm/stabilization-protocol/index.html"],
  ["The National Engine", "Macro Command System", "play/macro-command-system/national-engine/index.html"],
  ["Mint, Ash & Gold", "Macro Command System", "play/macro-command-system/mint-ash-gold/index.html"],
  ["The Command Nexus", "Macro Command System", "play/macro-command-system/command-nexus/index.html"],
  ["The Exchange Citadel", "Macro Command System", "play/macro-command-system/exchange-citadel/index.html"],
  ["The Cost Directive", "Managerial Intelligence Directorate", "play/managerial-intelligence-directorate/cost-directive/index.html"],
  ["The Market Signal", "Managerial Intelligence Directorate", "play/managerial-intelligence-directorate/market-signal/index.html"],
  ["The Strategy Desk", "Managerial Intelligence Directorate", "play/managerial-intelligence-directorate/strategy-desk/index.html"],
  ["The Agency Protocol", "Managerial Intelligence Directorate", "play/managerial-intelligence-directorate/agency-protocol/index.html"],
  ["The Labyrinth of Choice", "Micro Domains", "play/micro-domains/labyrinth-of-choice/index.html"]
].map(([name, family, html]) => ({name, family, html}));

function read(relative){ return fs.readFileSync(path.join(root, relative), "utf8"); }
function write(relative, text){ fs.writeFileSync(path.join(root, relative), text, "utf8"); }
function cleanCell(value){ return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim(); }
function normalize(value){ return String(value ?? "").trim().toLowerCase(); }
function questionId(question, index){ return question.id ?? question.questionId ?? `unidentified-${index + 1}`; }

function extractObjectLiteral(source, declaration){
  const declarationIndex = source.indexOf(declaration);
  if(declarationIndex < 0) throw new Error(`Missing ${declaration}`);
  const start = source.indexOf("{", declarationIndex);
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for(let index = start; index < source.length; index++){
    const char = source[index];
    const next = source[index + 1];
    if(lineComment){ if(char === "\n") lineComment = false; continue; }
    if(blockComment){ if(char === "*" && next === "/"){ blockComment = false; index++; } continue; }
    if(quote){
      if(escaped){ escaped = false; continue; }
      if(char === "\\"){ escaped = true; continue; }
      if(char === quote) quote = "";
      continue;
    }
    if(char === "/" && next === "/"){ lineComment = true; index++; continue; }
    if(char === "/" && next === "*"){ blockComment = true; index++; continue; }
    if(char === '"' || char === "'" || char === "`"){ quote = char; continue; }
    if(char === "{") depth++;
    if(char === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unclosed ${declaration}`);
}

function loadQuestionBanks(game){
  const htmlSource = read(game.html);
  const sourceMatch = [...htmlSource.matchAll(/<script[^>]+src=["']([^"']*question[^"']*\.js)(?:\?[^"']*)?["']/gi)][0];
  let bankSource;
  let bankFile;
  if(sourceMatch){
    bankFile = path.posix.join(path.posix.dirname(game.html), sourceMatch[1]);
    bankSource = read(bankFile);
  } else {
    bankFile = game.html + "#inline-questionBanks";
    bankSource = `const questionBanks = ${extractObjectLiteral(htmlSource, "const questionBanks")};`;
  }
  const context = {TextEncoder, crypto: globalThis.crypto};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(bankSource + `
;globalThis.__questionBanks = typeof questionBanks !== 'undefined' ? questionBanks : window.questionBanks;
globalThis.__repairPools = typeof microSkillRepairPools !== 'undefined' ? microSkillRepairPools
  : typeof repairPoolGroups !== 'undefined' ? repairPoolGroups
  : window.microSkillRepairPools || window.repairPoolGroups || {};
globalThis.__repairSeedPools = typeof skillRepairSeedPools !== 'undefined' ? skillRepairSeedPools
  : typeof stabilizationDirectSkillRepairs !== 'undefined' ? stabilizationDirectSkillRepairs
  : {};
globalThis.__bridgePools = typeof microSkillBridgePools !== 'undefined' ? microSkillBridgePools
  : typeof bridgePoolGroups !== 'undefined' ? bridgePoolGroups
  : window.microSkillBridgePools || window.bridgePoolGroups || {};
`, context, {filename: bankFile});

  if(!sourceMatch){
    context.__repairPools = vm.runInContext(`(${extractObjectLiteral(htmlSource, "easyConceptPools =")})`, context);
    context.__bridgePools = vm.runInContext(`(${extractObjectLiteral(htmlSource, "const mediumConceptPools")})`, context);
  }
  return {bankFile, banks: context.__questionBanks, repairPools:[context.__repairPools, context.__repairSeedPools], bridgePools:[context.__bridgePools]};
}

function flattenPoolRecords(poolRoot, trail = []){
  if(Array.isArray(poolRoot)){
    if(poolRoot.every(value => value && typeof value === "object" && ("q" in value || "question" in value))) return poolRoot.map(question => ({question, pool:trail.join("/")}));
    return poolRoot.flatMap((value, index) => flattenPoolRecords(value, [...trail, String(index)]));
  }
  if(!poolRoot || typeof poolRoot !== "object") return [];
  return Object.entries(poolRoot).flatMap(([key, value]) => flattenPoolRecords(value, [...trail, key]));
}

function stageOf(question){
  const difficulty = normalize(question.difficulty);
  const type = normalize(question.type);
  const cluster = normalize(question.conceptCluster);
  if(difficulty.includes("bridge") || type === "bridge" || cluster.startsWith("bridge_")) return "Bridge";
  if(difficulty.includes("repair") || type === "repair" || cluster.startsWith("repair_")) return "Repair";
  return "Ordinary";
}

function cognitiveSignals(question){
  const text = String(question.q || "");
  const lower = text.toLowerCase();
  const graph = !!question.image || question.graphRequired === true || /refer to (?:the )?graph|shown in the graph|graph above/.test(lower);
  const calculation = /calculate|compute|how many|how much|what is the (?:value|amount|size)|\$\d|\b\d+(?:\.\d+)?%/.test(lower)
    || /calculation|numeric|quantitative/.test(normalize(question.type));
  const trap = /\bexcept\b|\bnot\b.*\?|least likely|which statement is false/.test(lower)
    || /trap/.test(normalize(question.type));
  const transfer = /suppose|scenario|given|if |when |a firm|a market|a manager|an economy|a student|policy/.test(lower);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const multiConcept = Array.isArray(question.secondarySkills) && question.secondarySkills.length >= 2;
  let burden = 0;
  if(graph) burden += 3;
  if(calculation) burden += 2;
  if(trap) burden += 2;
  if(words > 42) burden += 1;
  if(multiConcept) burden += 1;
  const parts = [];
  if(graph) parts.push("graph interpretation");
  if(calculation) parts.push("calculation");
  if(trap) parts.push("trap/negation reasoning");
  if(multiConcept) parts.push("multiple listed skills");
  if(transfer) parts.push("scenario/application");
  if(words > 42) parts.push("high reading load");
  if(parts.length === 0) parts.push("focused recall or one-step concept recognition");
  return {graph, calculation, trap, transfer, words, multiConcept, burden, description: parts.join(", ")};
}

function skillOf(question){ return question.repairSkill || question.primarySkill || question.skill || question.tag || "UNMAPPED"; }
function objectiveOf(question){ return question.objective || "UNMAPPED"; }

function assess(question, stage){
  const signals = cognitiveSignals(question);
  if(stage === "Repair"){
    if(signals.burden >= 4){
      return {signals, fit:"Potentially mis-staged: application-level burden", action:"MOVE REPAIR -> BRIDGE", issue:true, simple:false, application:true};
    }
    if(signals.burden >= 2){
      return {signals, fit:"Borderline Repair: inspect ladder context", action:"REPLACE / ADD SIMPLER REPAIR ITEM", issue:true, simple:false, application:signals.transfer || signals.calculation || signals.graph};
    }
    return {signals, fit:"Concept-focused Repair fit", action:"KEEP AS REPAIR", issue:false, simple:true, application:false};
  }
  const application = signals.graph || signals.calculation || signals.transfer || signals.multiConcept || signals.words > 24;
  if(!application){
    return {signals, fit:"Bridge appears recall-level", action:"MOVE BRIDGE -> REPAIR", issue:true, simple:true, application:false};
  }
  if(signals.burden >= 7){
    return {signals, fit:"Bridge may exceed ordinary retest demand", action:"REWRITE RECOMMENDED", issue:true, simple:false, application:true};
  }
  return {signals, fit:"Application/transfer Bridge fit", action:"KEEP AS BRIDGE", issue:false, simple:false, application:true};
}

const loadedGames = games.map(game => ({...game, ...loadQuestionBanks(game)}));
const auditRows = [];
const summaries = [];
const coverageRows = [];
const ladderRows = [];

for(const game of loadedGames){
  const ordinaryItems = Object.entries(game.banks).flatMap(([bank, records]) =>
    records.map((question, index) => ({question, index, bank, stage:stageOf(question)}))
  );
  const repairItems = game.repairPools.flatMap(root => flattenPoolRecords(root)).map((item, index) => ({...item, index, bank:item.pool || "repair", stage:"Repair"}));
  const bridgeItems = game.bridgePools.flatMap(root => flattenPoolRecords(root)).map((item, index) => ({...item, index, bank:item.pool || "bridge", stage:"Bridge"}));
  const seen = new Set();
  const all = [...ordinaryItems, ...repairItems, ...bridgeItems].filter(item => {
    const key = `${item.stage}|${skillOf(item.question)}|${questionId(item.question, item.index)}|${item.question.q || ""}`;
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const remediation = all.filter(item => item.stage !== "Ordinary");
  for(const item of remediation){
    const assessment = assess(item.question, item.stage);
    const skill = skillOf(item.question);
    const objective = objectiveOf(item.question);
    const notes = [];
    if(skill === "UNMAPPED") notes.push("METADATA / SKILL MISMATCH: no target skill");
    if(objective === "UNMAPPED") notes.push("METADATA / SKILL MISMATCH: no objective");
    if(item.question.image && !fs.existsSync(path.join(root, path.dirname(game.html), item.question.image))) notes.push("Referenced image is missing");
    auditRows.push({game:game.name, id:questionId(item.question, item.index), skill, objective, stage:item.stage,
      type:item.question.type || "unspecified", demand:assessment.signals.description, fit:assessment.fit,
      action:assessment.action, notes:notes.join("; ") || "-", issue:assessment.issue});
  }

  const bySkill = new Map();
  for(const item of all){
    const skill = skillOf(item.question);
    if(!bySkill.has(skill)) bySkill.set(skill, {repair:[], bridge:[], ordinary:[]});
    bySkill.get(skill)[item.stage.toLowerCase()].push(item);
  }
  for(const [skill, pools] of [...bySkill].sort(([a],[b]) => a.localeCompare(b))){
    if(!pools.repair.length && !pools.bridge.length) continue;
    const simpleRepair = pools.repair.filter(item => assess(item.question, "Repair").simple).length;
    const applicationBridge = pools.bridge.filter(item => assess(item.question, "Bridge").application).length;
    const flags = [];
    if(!simpleRepair) flags.push("REMEDIATION CONTENT GAP - NEW REPAIR ITEM NEEDED");
    if(!applicationBridge) flags.push("BRIDGE APPLICATION GAP");
    if(pools.repair.length <= 1) flags.push("THIN REPAIR POOL");
    if(pools.bridge.length <= 1) flags.push("THIN BRIDGE POOL");
    if(!pools.ordinary.length) flags.push("NO SAME-SKILL ORDINARY RETEST CANDIDATE");
    coverageRows.push({game:game.name, skill, repair:pools.repair.length, bridge:pools.bridge.length,
      ordinary:pools.ordinary.length, simpleRepair, applicationBridge, flags:flags.join("; ") || "Adequate by automated screen"});
  }
  const representative = [...bySkill.entries()]
    .filter(([, pools]) => pools.repair.length && pools.bridge.length && pools.ordinary.length)
    .sort(([skillA, poolsA], [skillB, poolsB]) => {
      const fitA = Number(poolsA.repair.some(item => assess(item.question, "Repair").simple))
        + Number(poolsA.bridge.some(item => assess(item.question, "Bridge").application));
      const fitB = Number(poolsB.repair.some(item => assess(item.question, "Repair").simple))
        + Number(poolsB.bridge.some(item => assess(item.question, "Bridge").application));
      return fitB - fitA || skillA.localeCompare(skillB);
    })[0];
  if(representative){
    const [skill, pools] = representative;
    const repair = pools.repair.find(item => assess(item.question, "Repair").simple) || pools.repair[0];
    const bridge = pools.bridge.find(item => assess(item.question, "Bridge").application) || pools.bridge[0];
    const bankRank = {legendary:5, elite:4, hard:3, medium:2, easy:1};
    const ordinaryRanked = [...pools.ordinary].sort((a, b) => (bankRank[normalize(b.bank)] || 0) - (bankRank[normalize(a.bank)] || 0));
    const original = ordinaryRanked[0];
    const retest = ordinaryRanked[1] || ordinaryRanked[0];
    const repairFit = assess(repair.question, "Repair");
    const bridgeFit = assess(bridge.question, "Bridge");
    const originalSignals = cognitiveSignals(original.question);
    const retestSignals = cognitiveSignals(retest.question);
    const demandScore = signals => signals.burden + Number(signals.transfer);
    const ladderFlags = [];
    if(!repairFit.simple) ladderFlags.push("Repair does not isolate the concept cleanly");
    if(!bridgeFit.application) ladderFlags.push("Bridge lacks an application step");
    if(demandScore(bridgeFit.signals) < demandScore(repairFit.signals)) ladderFlags.push("Repair may exceed Bridge demand");
    if(demandScore(retestSignals) < demandScore(bridgeFit.signals)) ladderFlags.push("ordinary Retest may be easier than Bridge");
    if(questionId(original.question, original.index) === questionId(retest.question, retest.index)) ladderFlags.push("no second same-skill ordinary item for a fresh Retest");
    ladderRows.push({
      family:game.family, game:game.name, skill,
      original:`${questionId(original.question, original.index)} [${original.bank}] (${originalSignals.description})`,
      repair:`${questionId(repair.question, repair.index)} (${repairFit.signals.description})`,
      bridge:`${questionId(bridge.question, bridge.index)} (${bridgeFit.signals.description})`,
      retest:`${questionId(retest.question, retest.index)} [${retest.bank}] (${cognitiveSignals(retest.question).description})`,
      assessment:ladderFlags.length
        ? `FACULTY REVIEW: ${ladderFlags.join("; ")}.`
        : "Repair is concept-focused; Bridge adds application; fresh ordinary Retest restores equal or greater demand."
    });
  }
  const gameRows = auditRows.filter(row => row.game === game.name);
  summaries.push({game:game.name, repair:gameRows.filter(row => row.stage === "Repair").length,
    bridge:gameRows.filter(row => row.stage === "Bridge").length,
    staged:gameRows.filter(row => !row.issue).length, issues:gameRows.filter(row => row.issue).length,
    gaps:coverageRows.filter(row => row.game === game.name && row.flags.includes("GAP")).length,
    thin:coverageRows.filter(row => row.game === game.name && row.flags.includes("THIN")).length,
    mismatches:gameRows.filter(row => row.notes.includes("MISMATCH")).length});
}

const remediationReport = [
  "# Phase 1.5 Remediation Stage-Fit Audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "This is a read-only audit of published student-facing question banks. No wording, choices, answer hashes, or bank metadata were changed. Automated flags identify items requiring faculty review; they are recommendations, not silent content edits.",
  "",
  "## Summary By Game",
  "",
  "| Game | Repair Reviewed | Bridge Reviewed | Correctly Staged | Potentially Mis-staged | Content Gaps | Thin Pools | Skill/Objective Mismatches |",
  "|---|---:|---:|---:|---:|---:|---:|---:|",
  ...summaries.map(row => `| ${cleanCell(row.game)} | ${row.repair} | ${row.bridge} | ${row.staged} | ${row.issues} | ${row.gaps} | ${row.thin} | ${row.mismatches} |`),
  "",
  "## Representative Repair -> Bridge -> Fresh Retest Ladders",
  "",
  "At least one same-skill ladder is shown for every upgraded game, covering all four active engine families. IDs refer to the current published banks; this section records the audit evidence without changing student-facing content.",
  "",
  "| Family | Game | Skill | Original Miss Candidate | Repair Evidence | Bridge Evidence | Fresh Ordinary Retest | Stage-Fit Assessment |",
  "|---|---|---|---|---|---|---|---|",
  ...ladderRows.map(row => `| ${cleanCell(row.family)} | ${cleanCell(row.game)} | ${cleanCell(row.skill)} | ${cleanCell(row.original)} | ${cleanCell(row.repair)} | ${cleanCell(row.bridge)} | ${cleanCell(row.retest)} | ${cleanCell(row.assessment)} |`),
  "",
  "## Pool Coverage By Skill",
  "",
  "| Game | Skill | Repair Items | Bridge Items | Ordinary Retest Candidates | Concept-focused Repair | Application Bridge | Coverage Assessment |",
  "|---|---|---:|---:|---:|---:|---:|---|",
  ...coverageRows.map(row => `| ${cleanCell(row.game)} | ${cleanCell(row.skill)} | ${row.repair} | ${row.bridge} | ${row.ordinary} | ${row.simpleRepair} | ${row.applicationBridge} | ${cleanCell(row.flags)} |`),
  "",
  "## Item-Level Audit",
  "",
  "| Game | Question ID | Skill | Objective | Current Stage | Question Type | Observed Cognitive Demand | Stage-Fit Assessment | Recommended Action | Notes |",
  "|---|---|---|---|---|---|---|---|---|---|",
  ...auditRows.map(row => `| ${cleanCell(row.game)} | ${cleanCell(row.id)} | ${cleanCell(row.skill)} | ${cleanCell(row.objective)} | ${row.stage} | ${cleanCell(row.type)} | ${cleanCell(row.demand)} | ${cleanCell(row.fit)} | ${cleanCell(row.action)} | ${cleanCell(row.notes)} |`),
  "",
  "## Interpretation",
  "",
  "- Repair flags are driven by graph burden, calculation, traps, multi-skill integration, and unusually high reading load.",
  "- Bridge flags identify recall-level items or items whose burden may exceed a normal retest.",
  "- Thin-pool flags report actual pool depth; no arbitrary minimum was used beyond identifying one-item pools that must immediately reuse after exhaustion.",
  "- Faculty review should compare each flagged row with its actual Repair -> Bridge -> ordinary Retest ladder before any later content rewrite."
].join("\n");
write("PHASE-1.5-REMEDIATION-AUDIT.md", remediationReport + "\n");

const market = loadedGames.find(game => game.name === "The Market Gate");
const marketAll = Object.entries(market.banks).flatMap(([bank, records]) => records.map((question, index) => ({bank, question, index, stage:stageOf(question)})));
const chapterItems = marketAll.filter(item => /^LO(?:4|6)\./i.test(String(item.question.objective || "")));
const graphGroups = new Map();
for(const item of chapterItems){
  const key = `${item.question.objective || "UNMAPPED"}||${skillOf(item.question)}`;
  if(!graphGroups.has(key)) graphGroups.set(key, []);
  graphGroups.get(key).push(item);
}
const graphRows = [];
for(const [key, items] of [...graphGroups].sort(([a],[b]) => a.localeCompare(b))){
  const [objective, skill] = key.split("||");
  const ordinary = items.filter(item => item.stage === "Ordinary");
  const graphs = ordinary.filter(item => !!item.question.image || item.question.graphRequired === true);
  const byDifficulty = Object.entries(Object.groupBy(graphs, item => item.bank)).map(([name, values]) => `${name}:${values.length}`).join(", ") || "none";
  const byType = Object.entries(Object.groupBy(graphs, item => item.question.type || "unspecified")).map(([name, values]) => `${name}:${values.length}`).join(", ") || "none";
  const repairGraphs = items.filter(item => item.stage === "Repair" && (!!item.question.image || item.question.graphRequired === true)).length;
  const bridgeGraphs = items.filter(item => item.stage === "Bridge" && (!!item.question.image || item.question.graphRequired === true)).length;
  const eligible = graphs.filter(item => item.question.graphRequired === true && !!item.question.image).length;
  const assets = [...new Set(graphs.map(item => item.question.image).filter(Boolean))];
  const flags = [];
  if(!graphs.length) flags.push("GRAPH COVERAGE GAP");
  if(!graphs.some(item => ["hard","elite","legendary"].includes(normalize(item.bank)))) flags.push("GRAPH DIFFICULTY GAP");
  if(!graphs.some(item => /interpret|analysis|application/.test(normalize(item.question.type)))) flags.push("GRAPH INTERPRETATION GAP");
  if(!graphs.some(item => cognitiveSignals(item.question).calculation)) flags.push("GRAPH CALCULATION GAP");
  if(!repairGraphs && !bridgeGraphs) flags.push("GRAPH REMEDIATION GAP");
  graphRows.push({objective, skill, ordinary:ordinary.length, graphs:graphs.length, byDifficulty, byType, eligible,
    retests:ordinary.length, repairGraphs, bridgeGraphs, assets:assets.join(", ") || "none", flags:flags.join("; ") || "No automated gap"});
}
const assetUse = new Map();
for(const item of chapterItems.filter(item => item.question.image)){
  const asset = item.question.image;
  assetUse.set(asset, (assetUse.get(asset) || 0) + 1);
}
const assetRows = [...assetUse].sort(([a],[b]) => a.localeCompare(b)).map(([asset, uses]) => {
  const exists = fs.existsSync(path.join(root, path.dirname(market.html), asset));
  return {asset, uses, exists, reuse:uses >= 5 ? "HEAVILY REUSED" : uses > 1 ? "REUSED" : "UNIQUE"};
});
const hardEliteGraphs = chapterItems.filter(item => item.stage === "Ordinary" && ["hard","elite","legendary"].includes(normalize(item.bank)) && (!!item.question.image || item.question.graphRequired === true));
const graphReport = [
  "# Phase 1.5 Market Gate Chapter 4 / 6 Graph Coverage Audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Read-only inventory. No questions, difficulty labels, answer hashes, or graph assets were changed.",
  "",
  `Hard/Elite/Legendary ordinary graph questions: ${hardEliteGraphs.length}.`,
  "",
  "| Objective | Skill | Ordinary Questions | Graph-dependent | Graphs By Difficulty | Graphs By Type | Graph-mode Eligible | Normal Retest Candidates | Repair Graphs | Bridge Graphs | Assets | Gap Flags |",
  "|---|---|---:|---:|---|---|---:|---:|---:|---:|---|---|",
  ...graphRows.map(row => `| ${cleanCell(row.objective)} | ${cleanCell(row.skill)} | ${row.ordinary} | ${row.graphs} | ${cleanCell(row.byDifficulty)} | ${cleanCell(row.byType)} | ${row.eligible} | ${row.retests} | ${row.repairGraphs} | ${row.bridgeGraphs} | ${cleanCell(row.assets)} | ${cleanCell(row.flags)} |`),
  "",
  "## Graph Asset Use",
  "",
  "| Asset | References | File Present | Reuse Assessment |",
  "|---|---:|---|---|",
  ...assetRows.map(row => `| ${cleanCell(row.asset)} | ${row.uses} | ${row.exists ? "Yes" : "NO - GRAPH ASSET GAP"} | ${row.reuse} |`),
  "",
  "## Recommendations For The Later Calibration Phase",
  "",
  "- Prioritize objectives carrying GRAPH COVERAGE GAP or GRAPH DIFFICULTY GAP before adding more graph variants to already dense objectives.",
  "- Add interpretation and calculation forms separately where the corresponding gap is flagged.",
  "- Use the remediation audit to decide whether a concept-focused text Repair plus graph/application Bridge is preferable to adding graph burden at both stages.",
  "- Preserve the current answer hashes and ordinary-bank difficulty labels until the dedicated calibration phase."
].join("\n");
write("PHASE-1.5-MARKET-GATE-CH4-CH6-GRAPH-AUDIT.md", graphReport + "\n");

const inventory = [
  "# Phase 1.5 Production Engine Inventory",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Current Templates",
  "",
  "- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html` - canonical Composer template.",
  "- `downloads/resources/mastery-quests-faculty-template.html` - current downloadable/manual template.",
  "",
  "## Playable Games",
  "",
  "| Game | Family | Classification | Question Bank | Standard Save | Media Renderer | Mastery Report | Unlimited | Targeted Repair |",
  "|---|---|---|---|---|---|---|---|---|",
  ...loadedGames.map(game => `| ${cleanCell(game.name)} | ${cleanCell(game.family)} | A - current/upgraded engine | ${cleanCell(game.bankFile)} | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |`),
  "",
  "## Intentionally Excluded Micro Games",
  "",
  "- The Strategic Vault - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.",
  "- The Foundry - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.",
  "- Dominion of Power - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.",
  "",
  "Only inactive hub placeholders for those titles are present under `play/micro-domains/index.html`; no playable production directories exist for them.",
  "",
  "## Hubs / Menus",
  "",
  "- `play/economic-realm/index.html` - active Realm hub; included only for the generic restored-card re-entry layout fix.",
  "- `play/macro-command-system/index.html` - hub/menu only; excluded.",
  "- `play/managerial-intelligence-directorate/index.html` - hub/menu only; excluded.",
  "- `play/micro-domains/index.html` - hub/menu only; excluded from engine changes.",
  "- `games/*/index.html` - public catalog/menu pages; excluded.",
  "",
  "## Archives / Snapshots / Backups",
  "",
  "- `legacy/**`, `validation_artifacts/**`, `previews/**`, dated/fixed root copies under `play/economic-realm/*_index_fixed.html`, and `play/macro-command-system/national-engine/nationalengine.html` are excluded.",
  "- Historical `run_phase5*`, `run_phase6*`, `run_phaseGraph*`, and `run_phaseMicro*` validators remain historical evidence and are not part of this change."
].join("\n");
write("PHASE-1.5-PRODUCTION-INVENTORY.md", inventory + "\n");

console.log(JSON.stringify({games:loadedGames.length, remediationItems:auditRows.length, coverageSkills:coverageRows.length,
  graphGroups:graphRows.length, reports:["PHASE-1.5-REMEDIATION-AUDIT.md","PHASE-1.5-MARKET-GATE-CH4-CH6-GRAPH-AUDIT.md","PHASE-1.5-PRODUCTION-INVENTORY.md"]}, null, 2));
