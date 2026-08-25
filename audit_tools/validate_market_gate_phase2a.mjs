import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { graphAssets, ordinaryQuestions, remediationQuestions, PHASE2A_SOURCE_VERSION } from "../play/economic-realm/market-gate/authoring/market_gate_phase2a_author.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameDir = path.join(root, "play/economic-realm/market-gate");
const bankPath = path.join(gameDir, "market_gate_questions_student.js");
const htmlPath = path.join(gameDir, "index.html");
const expectedHashes = {
  "PPF-01.webp":"db35510e997538217073a76b85ccde397b9c4521336289a003c5464e50ae40eb",
  "PPF-02.webp":"fa8d2d2a3f3cb8f83f83af2a9a2b73dde140e752eecbdeda9baf15a01e4f9b45",
  "DEMAND-SUPPLY-03.webp":"d556ab1e15e8fdd79c3281acd25a66a4afc435e19a3608214ee5f008441b6a55",
  "DEMAND-SUPPLY-04.webp":"43d6e497224a1dc6167fc2fc02f2d2bda20d3a883ca03aaae1af42baf28a05d5",
  "DEMAND-SUPPLY-05.webp":"2e4222f7677fd917073bdf9708649f2f6fde744cbb0480548cefff7ce69afc62",
  "DEMAND-SUPPLY-06.webp":"a400eea75bcff4ed0bd2fa852fd92c584547ff5e823e4c61a09fe5187d629c79",
  "DEMAND-SUPPLY-07.webp":"01f5ab1b9c1bf6aab9d2be05a238802b52416e97c0eabd8de04d2cdb7a8c3b69",
  "CEILING-02.webp":"d5afa73b833037ad4f84e6a481b40125e9bd7e4e6fff08fe555f6f2b3c7767c7",
  "CEILING-03.webp":"394e558d501a6d2f8ddafeec304b9ac8ddc8d2671635c9877594906b7fb3ea83",
  "FLOOR-02.webp":"5620349697523a31fe57a39c6472461a67b521bed35ea90f9e5f25f4efc7afdf",
  "FLOOR-03.webp":"acdda47d3c35ea4ed3a5f3bbfb741b28fb25d8f6342df2683fc25370f3a751bd",
  "TAX-02.webp":"efc993c9eff14b9ee5e96283b09f87382535c23467a0f182ef6ca202294b2590",
  "TAX-03.webp":"ef69a4b97e9b0ec232fa6bfa24e1071aecd36f0b1d28e4f92e18fe1e283f4685",
  "TAX-04.webp":"c17569c52cb224bc9b1bbbc6a36a0641f8fc470f7547dbda9dd19dee9ceae942",
  "TAX-05.webp":"b4652bce273eaa717c4e7e258076a45be48f956d01e3f09fb65fa3c6780ce74d",
  "TAX-06.webp":"c8c58a2b9f7182730628d1a78ab12ac00f690568e04ae361132ff4309d50bfda"
};
const composerFolders = {"PPF-01.webp":"production-possibilities-frontier","PPF-02.webp":"production-possibilities-frontier","DEMAND-SUPPLY-03.webp":"market-equilibrium","DEMAND-SUPPLY-04.webp":"market-equilibrium","DEMAND-SUPPLY-05.webp":"market-equilibrium","DEMAND-SUPPLY-06.webp":"market-equilibrium","DEMAND-SUPPLY-07.webp":"market-equilibrium","CEILING-02.webp":"binding-price-ceilings","CEILING-03.webp":"binding-price-ceilings","FLOOR-02.webp":"binding-price-floors","FLOOR-03.webp":"binding-price-floors","TAX-02.webp":"tax-wedges-and-revenue","TAX-03.webp":"tax-wedges-and-revenue","TAX-04.webp":"tax-wedges-and-revenue","TAX-05.webp":"tax-wedges-and-revenue","TAX-06.webp":"tax-wedges-and-revenue"};
const normalize = value => String(value).normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
const hashAnswer = value => crypto.createHash("sha256").update(normalize(value)).digest("hex");
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const failures=[]; let passes=0;
const check=(condition,message)=>{if(condition){passes++;}else failures.push(message);};

execFileSync(process.execPath,[path.join(root,"audit_tools/publish_market_gate_phase2a.mjs")],{cwd:root,stdio:"pipe"});
const source=fs.readFileSync(bankPath,"utf8"), context={crypto:crypto.webcrypto,TextEncoder};
vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.banks=questionBanks;globalThis.repair=microSkillRepairPools;globalThis.seed=skillRepairSeedPools;globalThis.bridge=microSkillBridgePools;`,context);
const allGroups=[context.banks,context.repair,context.seed,context.bridge];
const all=allGroups.flatMap(group=>Object.values(group).flat());
const ordinary=["easy","medium","hard","elite","legendary"].flatMap(pool=>(context.banks[pool]||[]).map(question=>({pool,question})));
const phaseOrdinary=ordinary.filter(({question})=>question.sourceCurationPhase==="phase2a-market-gate");
const phaseRepair=Object.entries(context.repair).flatMap(([skill,rows])=>rows.map(question=>({skill,question}))).filter(({question})=>question.sourceCurationPhase==="phase2a-market-gate");

check(source.includes(`Source version: ${PHASE2A_SOURCE_VERSION}`),"student bank source version mismatch");
check(phaseOrdinary.length===48,`expected 48 Phase 2A ordinary items, found ${phaseOrdinary.length}`);
check(phaseRepair.length===14,`expected 14 Phase 2A Repair items, found ${phaseRepair.length}`);
const tierCounts=Object.fromEntries(["medium","hard","elite","legendary"].map(pool=>[pool,phaseOrdinary.filter(row=>row.pool===pool).length]));
check(JSON.stringify(tierCounts)===JSON.stringify({medium:7,hard:16,elite:20,legendary:5}),`tier counts ${JSON.stringify(tierCounts)}`);
check(new Set(all.map(q=>String(q.id))).size===all.length,"question IDs are not globally unique");
check(all.every(q=>!Object.hasOwn(q,"a")),"student bank exposes a numeric answer index");
for(const question of all) check(question.options.filter(option=>hashAnswer(option)===question.aHash).length===1,`answer hash mismatch ${question.id}`);
check(new Set(ordinary.map(({question})=>normalize(question.q))).size===ordinary.length,"duplicate ordinary stems detected");
const correctPositions=[0,0,0,0];
for(const {question} of phaseOrdinary){
  check(Boolean(question.q&&question.objective&&question.primarySkill&&question.repairSkill&&question.type&&question.difficulty&&question.feedback),`missing metadata ${question.id}`);
  check(question.graphRequired===true&&Boolean(question.image),`Trial selector metadata invalid ${question.id}`);
  check(typeof question.imageAlt==="string"&&question.imageAlt.length>=80&&!/^(question graph|graph for|supply and demand graph)$/i.test(question.imageAlt),`generic/missing alt ${question.id}`);
  check(fs.existsSync(path.join(gameDir,question.image)),`missing referenced asset ${question.id}: ${question.image}`);
  check(question.q.trim().split(/\s+/).length<=60,`question length exceeds 60 words ${question.id}`);
  check(question.options.every(option=>option.length<=180),`option length exceeds 180 characters ${question.id}`);
  correctPositions[question.options.findIndex(option=>hashAnswer(option)===question.aHash)]++;
}
check(correctPositions.every(count=>count===12),`answer positions are not balanced ${correctPositions.join(",")}`);
for(const record of ordinaryQuestions){const average=record.distractors.reduce((sum,item)=>sum+item.length,0)/3;check(record.answer.length/average<=1.45,`correct-answer length cue ${record.id}`);}
check(new Set(phaseOrdinary.map(row=>row.question.image)).size===16,"not all 16 new graphs are used");
for(const [name,expected] of Object.entries(expectedHashes)){
  const locations=[path.join(gameDir,name),path.join(root,"play/economic-realm/equilibrium-crisis",name),path.join(root,"build/faculty-build-composer/data/question-assets",composerFolders[name],name)];
  for(const file of locations){check(fs.existsSync(file),`missing baseline graph ${path.relative(root,file)}`);if(fs.existsSync(file)){check(sha(file)===expected,`graph bytes changed ${path.relative(root,file)}`);const data=fs.readFileSync(file);check(data.subarray(0,4).toString()==="RIFF"&&data.subarray(8,12).toString()==="WEBP",`invalid WebP ${path.relative(root,file)}`);}}
}
for(const record of remediationQuestions){
  check((context.repair[record.skill]||[]).filter(q=>q.sourceCurationPhase==="phase2a-market-gate").length===2,`Repair depth missing for ${record.skill}`);
  check((context.bridge[record.skill]||[]).length>=2,`Bridge depth missing for ${record.skill}`);
  check(ordinary.filter(({question})=>question.primarySkill===record.skill||question.repairSkill===record.skill).length>=2,`Retest depth missing for ${record.skill}`);
}
for(const skill of new Set(remediationQuestions.map(record=>record.skill))){
  const repairPool=context.repair[skill], bridgePool=context.bridge[skill];
  const chooseUnseen=(pool,history)=>pool.find(question=>!history.includes(String(question.id)))||pool.slice().sort((a,b)=>history.indexOf(String(a.id))-history.indexOf(String(b.id)))[0];
  const repairHistory=[],bridgeHistory=[];
  const r1=chooseUnseen(repairPool,repairHistory);repairHistory.push(String(r1.id));
  const r2=chooseUnseen(repairPool,repairHistory);repairHistory.push(String(r2.id));
  const r3=chooseUnseen(repairPool,repairHistory);
  const b1=chooseUnseen(bridgePool,bridgeHistory);bridgeHistory.push(String(b1.id));
  const b2=chooseUnseen(bridgePool,bridgeHistory);bridgeHistory.push(String(b2.id));
  check(r1.id!==r2.id&&String(r3.id)===repairHistory[0],`Repair anti-repeat simulation failed ${skill}`);
  check(b1.id!==b2.id,`Bridge anti-repeat simulation failed ${skill}`);
  const retests=ordinary.filter(({question})=>(question.primarySkill===skill||question.repairSkill===skill)&&![r1.id,r2.id,b1.id,b2.id].includes(question.id));
  check(retests.length>=2,`fresh Recovery Retest simulation failed ${skill}`);
}
check(phaseOrdinary.filter(row=>row.pool==="hard").length>0&&phaseOrdinary.filter(row=>row.pool==="elite").length>0,"high-performing Standard route lacks Phase 2A challenge items");
check((context.banks.medium||[]).some(q=>q.sourceCurationPhase!=="phase2a-market-gate")&&(context.banks.hard||[]).some(q=>!q.image),"normal Standard route lost non-graph inventory");
const html=fs.readFileSync(htmlPath,"utf8");
check(html.includes('const GAME_VERSION = "Market-Gate-2026.08.24-phase2a"'),"Market Gate version not bumped");
check(html.includes('const TELEMETRY_VERSION = "Gate-local-telemetry-v4-hashed-bank"'),"telemetryVersion changed");
check(/openGraphLightbox\(graphImg\.src, graphImg\.alt\)/.test(html)&&/lightboxImg\.alt = altText/.test(html),"lightbox does not preserve image alt");
check(/imageAlt \|\| question\.alt/.test(html),"shared media renderer does not consume imageAlt");
check(/eliteReady:[\s\S]{0,250}accuracy >= 0\.92/.test(html)&&/if\(profile\.eliteReady\) return "stretch"/.test(html),"standard Elite routing signature changed");
check(/getRemediationSelectionPool/.test(html)&&/leastRecentlySeen/.test(html),"Phase 1.5 anti-repeat architecture missing");
check(/modeAllowsSave\(\)[^{]*\{ return gameMode === "standard" \|\| gameMode === "legendary"; \}/.test(html),"standard save boundary changed");
check(!/gameMode === "trialGraph"/.test(html),"unexpected Trial by Graph mode-rule change");

if(failures.length){console.error(`FAIL: ${failures.length} issue(s), ${passes} checks passed`);for(const failure of failures)console.error(`- ${failure}`);process.exit(1);}
console.log(`PASS: Market Gate Phase 2A validator (${passes} checks)`);
console.log(`Ordinary ${ordinary.length}; Phase 2A tiers ${JSON.stringify(tierCounts)}; Repair additions ${phaseRepair.length}`);
console.log("Trial by Graph: all new items satisfy the canonical graphRequired+image selector; standalone Market Gate exposes no Trial mode.");
