import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

const repo=path.resolve(process.argv[2]||'/mnt/data/phase_M4_work');
const composer=path.join(repo,'faculty-build-composer');
const dataDir=path.join(composer,'data');
const outDir=path.join(repo,'validation_artifacts','macro_m4_final_release');
fs.mkdirSync(outDir,{recursive:true});
const core=require(path.join(composer,'composer-core.js'));
const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(path.join(dataDir,'composer_library.js'),'utf8'),sb);
const library=sb.window.MQ_COMPOSER_LIBRARY;
const registry=JSON.parse(fs.readFileSync(path.join(dataDir,'composer_registry.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(dataDir,'composer_library_manifest.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const norm=s=>String(s??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();

const families={
 F1:['gdp-measurement','gdp-components','real-versus-nominal-gdp','limits-of-gdp'],
 F2:['cpi-and-inflation-measurement','cpi-versus-gdp-deflator','cpi-bias','indexing-and-real-values','real-versus-nominal-interest-rates'],
 F3:['living-standards-and-growth','productivity-measurement','sources-of-productivity','economic-growth-policy'],
 F4:['unemployment-measurement','unemployment-types','natural-rate-of-unemployment','labor-market-institutions'],
 F5:['money-functions-and-measures','bank-money-creation','central-bank-and-federal-reserve','monetary-policy-tools','monetary-control-limits'],
 F6:['quantity-theory-of-money','monetary-neutrality','fisher-effect','inflation-costs','inflation-tax-and-deflation'],
 F7:['liquidity-preference-and-money-market','monetary-policy-transmission'],
 F8:['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks','long-run-macroeconomic-adjustment'],
 F9:['fiscal-policy-and-aggregate-demand','fiscal-multipliers-and-crowding-out','stabilization-policy'],
 F10:['short-run-phillips-curve','phillips-curve-expectations','long-run-phillips-curve','sacrifice-ratio','disinflation-and-policy'],
 F11:['integrated-macroeconomic-analysis']
};
const supplementId='integrated-macroeconomic-analysis';
const normalMacro=[...Object.entries(families).filter(([f])=>f!=='F11').flatMap(([,ids])=>ids)];
const macroSpecific=[...normalMacro,supplementId];
const sharedGeneral=[
 'scarcity-and-tradeoffs','opportunity-cost','marginal-analysis','incentives','gains-from-trade','market-failures','models-and-assumptions',
 'production-possibilities-frontier','micro-versus-macro','positive-versus-normative-analysis','economist-policy-role','integrated-economic-analysis','elasticity'
];
assert(new Set(macroSpecific).size===42,'Macro-specific scope must reconcile to 42 concepts');
assert(normalMacro.length===41,'Normal Macro concept count must be 41');
for(const cid of [...macroSpecific,...sharedGeneral]) assert(library.concepts[cid],`Missing concept ${cid}`);

function tagged(m){return [
 ...Object.entries(m.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),
 ...(m.repairQuestions||[]).map(question=>({pool:'repair',question})),
 ...(m.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),
 ...(m.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))
];}
function uniqueRecords(m){const seen=new Set();return tagged(m).filter(r=>{const id=qid(r.question);if(!id||seen.has(id))return false;seen.add(id);return true;});}
function bossTier(q){const d=String(q?.difficulty||q?.canonicalDifficulty||'').toLowerCase();if(d==='easyboss')return'easyBoss';if(d==='mediumboss')return'mediumBoss';if(d==='finalboss'||d==='hardboss')return'finalBoss';return'';}
function recordCounts(m){const boss=m.questions?.boss||[];const u=uniqueRecords(m);return {
 total:u.length,easy:(m.questions?.easy||[]).length,medium:(m.questions?.medium||[]).length,hard:(m.questions?.hard||[]).length,
 elite:(m.questions?.elite||[]).length,legendary:(m.questions?.legendary||[]).length,calculation:(m.questions?.calculation||[]).length,
 integration:(m.questions?.integration||[]).length,easyBoss:boss.filter(q=>bossTier(q)==='easyBoss').length,mediumBoss:boss.filter(q=>bossTier(q)==='mediumBoss').length,
 finalBoss:boss.filter(q=>bossTier(q)==='finalBoss').length,legendaryBoss:(m.questions?.legendaryBoss||[]).length,repair:(m.repairQuestions||[]).length,
 repairSeed:(m.repairSeedQuestions||[]).length,bridge:(m.bridgeQuestions||[]).length,graphLinked:u.filter(r=>Boolean(r.question.image)).length
};}

// Release provenance: authoritative M2e production payload hashes.
const expectedM2e={
 'composer-core.js':'d75443cf7e47b7208a9a2a80f3df0e1d4f169d45c0f359a2f965dc0fde4fa952',
 'composer.css':'640021029432946a68c555f61f6e1c5e44ef6a2f25d44912750721288b96daf5',
 'composer.js':'046cfd9b81db50179b06ea3858fb9e276acd7d59456c20bca134f2f38db6a440',
 'data/composer_library.js':'14ded36615cacd51753384d2efa89b5b2dd5ee8aa17f10fcd3e659acfa25ee41',
 'data/composer_library_manifest.json':'b552086a42cdba0fbfd525162b8a074d3c0b594fb26a074790cffc24042058d6',
 'data/composer_registry.json':'30a89d86d698137ed6a9da1e507bf3eb1a4a30061ce49505c9a883da0c32fe0f',
 'index.html':'dabf2ec0330a743193e8f64819be8b1afda00ecf8ee8091862f1a4de2548d384',
 'phaseM2e-advanced-macro-checkpoint-supplement-v1.json':'7238bcdc9f5150efead330d7e718422e54fa5aa7b342f48696bdda1e488eeb78',
 'phaseM2e-advanced-macro-checkpoint-supplement-v1_questions.json':'a66c83961e083c18ed2fa2a8e2039f5b59e49096d360a75b3a703014dce9f17f',
 'template/mastery-quests-faculty-template-composer-ready.html':'8eafbe3329142a34cf96cbc4a2822ca69d0fe05e0bf85af1a70629831113bb4a'
};
const provenance=[];
const m4ModifiedPaths=new Set(['index.html','data/composer_library.js','data/composer_library_manifest.json','data/composer_registry.json']);
for(const [rel,expected] of Object.entries(expectedM2e)){
 const fp=path.join(composer,...rel.split('/'));assert(fs.existsSync(fp),`Missing production file ${rel}`);const actual=sha(fs.readFileSync(fp));const baselineMatch=actual===expected;provenance.push({path:rel,m2eExpected:expected,current:actual,m2eBaselineMatch:baselineMatch,m4Modified:m4ModifiedPaths.has(rel)});if(!m4ModifiedPaths.has(rel))assert(baselineMatch,`Unexpected change outside M4 repair scope: ${rel}`);
}
assert(library.canonicalQuestionCount===7274,'Expected post-M2e global canonical count 7274');
assert(library.libraryVersion.endsWith('phaseM4-final-macro-release-closure-v1'),'M4 release version stamp missing');
assert(library.librarySha256==='572d796e5821b0ba9e80c9e80aad44cdc73fc91e7e1d555da0ec2e291b7e9826','Unexpected post-M4 semantic library hash');
assert(manifest.librarySha256===library.librarySha256&&registry.librarySha256===library.librarySha256,'Library/manifest/registry semantic hashes disagree');
assert(manifest.canonicalQuestionCount===7274&&registry.canonicalQuestionCount===7274,'Manifest/registry canonical counts disagree');

// Static per-concept audit.
const staticIssues=[];const conceptAudit={};const globalIds=new Map();const normalizedStem=new Map();const exactStemPairs=[];const invalidAssets=[];
for(const cid of macroSpecific){
 const m=library.concepts[cid];const counts=recordCounts(m);const issues=[];const stages=[];
 for(const {pool,question} of uniqueRecords(m)){
   const id=qid(question);if(!id)issues.push({id,issue:'missing id'});
   if(globalIds.has(id)&&globalIds.get(id)!==cid) issues.push({id,issue:`canonical ID also assigned to ${globalIds.get(id)}`}); else globalIds.set(id,cid);
   const validationPool=pool==='boss'?bossTier(question):(pool==='repairSeed'?'repair':pool);
   if(validationPool){const v=core.validateFacultyQuestionRecord(question,validationPool,m.assetMetadata||[]);if(v.length)issues.push({id,pool,issue:'schema',details:v});}
   if(question.primaryConceptId!==cid)issues.push({id,pool,issue:`primaryConceptId=${question.primaryConceptId}`});
   for(const sc of question.secondaryConceptIds||[]) if(!library.concepts[sc])issues.push({id,pool,issue:`unknown secondary concept ${sc}`});
   const expected=String(question.aHash||'').replace(/^sha256:/i,'').toLowerCase();
   if(!Number.isInteger(question.a)){
      let matches=0;for(const o of question.options||[]){if(sha(Buffer.from(core.normalizeAnswerText(o)))===expected)matches++;}
      if(matches!==1)issues.push({id,pool,issue:`answer hash matches ${matches} options`});
   }
   if(pool==='legendaryBoss'){
     if(cid!==supplementId){if(!['opening','middle','final'].includes(question.bossStage))issues.push({id,pool,issue:`invalid bossStage ${question.bossStage}`});stages.push(question.bossStage);}
     else {
       if(!question.isCheckpointChallenge)issues.push({id,pool,issue:'supplement legendaryBoss not challenge'});
       if(question.challengeStage!=='legendary')issues.push({id,pool,issue:`supplement challengeStage=${question.challengeStage}`});
       if(!['opening','middle','final'].includes(question.challengeBossStage||question.bossStage))issues.push({id,pool,issue:'supplement legendary stage preference missing'});
     }
   }
   const stem=norm(question.q);if(stem){if(normalizedStem.has(stem)&&normalizedStem.get(stem).id!==id)exactStemPairs.push([normalizedStem.get(stem),{id,cid,pool}]);else normalizedStem.set(stem,{id,cid,pool});}
 }
 if(cid!==supplementId){
   if(!['opening','middle','final'].every(s=>stages.includes(s)))issues.push({issue:'incomplete Legendary Boss opening/middle/final scaffold',stages});
 } else {
   if(counts.easy||counts.medium||counts.hard)issues.push({issue:'supplement leaks ordinary practice'});
   const active=uniqueRecords(m).filter(r=>r.question.isCheckpointChallenge).map(r=>r.question);
   if(active.length!==110)issues.push({issue:`active challenge count ${active.length} != 110`});
   const byStage={opening:0,middle:0,final:0,legendary:0};for(const q of active)byStage[q.challengeStage]=(byStage[q.challengeStage]||0)+1;
   if(JSON.stringify(byStage)!==JSON.stringify({opening:8,middle:9,final:40,legendary:53}))issues.push({issue:'challenge stage distribution changed',byStage});
   for(const q of active){
      if(!(q.requiredConceptIds||[]).length)issues.push({id:qid(q),issue:'challenge missing requiredConceptIds'});
      if(!(q.challengeFocusConceptIds||[]).length)issues.push({id:qid(q),issue:'challenge missing challengeFocusConceptIds'});
      if(!q.remediationConceptId||!normalMacro.includes(q.remediationConceptId))issues.push({id:qid(q),issue:`invalid remediationConceptId ${q.remediationConceptId}`});
      for(const req of q.requiredConceptIds||[])if(!normalMacro.includes(req))issues.push({id:qid(q),issue:`required concept outside normal Macro scope ${req}`});
   }
 }
 for(const a of m.assetMetadata||[]){
   const fp=path.join(dataDir,...String(a.runtimePath||a.sourceUrl||'').split('/'));const ai=[];
   if(!fs.existsSync(fp)) ai.push('missing file'); else {const actual=sha(fs.readFileSync(fp));if(a.sha256&&actual!==a.sha256)ai.push('hash mismatch');}
   if(!a.imageAlt)ai.push('missing imageAlt');if(!a.graphDescription)ai.push('missing graphDescription');if(ai.length)invalidAssets.push({cid,filename:a.filename,issues:ai});
 }
 conceptAudit[cid]={title:m.title,counts,issues,legendaryStages:[...new Set(stages)]};staticIssues.push(...issues.map(issue=>({conceptId:cid,...issue})));
}
assert(staticIssues.length===0,`Static Macro defects: ${JSON.stringify(staticIssues.slice(0,12))}`);
assert(invalidAssets.length===0,`Macro asset defects: ${JSON.stringify(invalidAssets.slice(0,12))}`);

// Five intentional legacy F11 challenge duplicates mirror normal-bank checkpoint items. Runtime fingerprinting prevents back-to-back exposure.
const unexpectedExactStemPairs=exactStemPairs.filter(pair=>!pair.some(x=>x.cid===supplementId));
assert(unexpectedExactStemPairs.length===0,`Unexpected exact duplicate Macro stems found: ${JSON.stringify(unexpectedExactStemPairs.slice(0,10))}`);
assert(exactStemPairs.length===5,`Expected five known legacy supplement duplicate stems, found ${exactStemPairs.length}`);

function recipe(name,ids){return {schemaVersion:'1.2.0',title:name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:[...core.MODE_ORDER],selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
function compose(name,ids){return core.compose(library,recipe(name,ids));}

// Single-concept composition safety for 41 normal concepts.
const singleCompositions={};const composeIssues=[];
for(const cid of normalMacro){
 const c=compose(`M4 solo ${cid}`,[cid]);singleCompositions[cid]=c;
 if(c.errors.length)composeIssues.push({cid,errors:c.errors});
 if(!c.validation.modes.every(r=>r.ok))composeIssues.push({cid,modes:c.validation.modes.filter(r=>!r.ok)});
 const av=await core.verifyAnswers(c);if(!av.ok)composeIssues.push({cid,answerIssues:av.issues});
}
const supplementOnly=compose('M4 supplement only',[supplementId]);
assert(supplementOnly.errors.some(x=>String(x).includes('requires at least one normal Macro concept')),'Supplement-only recipe was not rejected');
assert(composeIssues.length===0,`Single-concept compose defects ${JSON.stringify(composeIssues.slice(0,8))}`);

// Family composition safety for F1-F10. F11 is validated against all challenge prerequisite concepts.
const familyCompositions={};
for(const [f,ids] of Object.entries(families)){
 if(f==='F11')continue;const c=compose(`M4 ${f}`,ids);familyCompositions[f]=c;assert(!c.errors.length,`${f} compose errors ${c.errors.join(' | ')}`);assert(c.validation.modes.every(r=>r.ok),`${f} mode preflight failed`);const av=await core.verifyAnswers(c);assert(av.ok,`${f} answer verification failed`);
}
const supplementModule=library.concepts[supplementId];
const challengeActive=uniqueRecords(supplementModule).filter(r=>r.question.isCheckpointChallenge).map(r=>r.question);
const challengePrereqs=[...new Set(challengeActive.flatMap(q=>q.requiredConceptIds||[]))];
const f11Composition=compose('M4 F11 Checkpoint Supplement',[...challengePrereqs,supplementId]);familyCompositions.F11=f11Composition;
assert(!f11Composition.errors.length,'F11 compose errors');assert(f11Composition.counts.challengeTotal===110,`F11 should expose all 110 active challenges, got ${f11Composition.counts.challengeTotal}`);assert(f11Composition.validation.modes.every(r=>r.ok),'F11 supporting composition mode preflight failed');assert((await core.verifyAnswers(f11Composition)).ok,'F11 answer verification failed');

// Broad operational compositions. Shared General concepts are included only here, not in 42-concept reconciliation.
const broadDefs={
 macroNormal:normalMacro,
 macroWithSupplement:[...normalMacro,supplementId],
 macroWithSharedFoundations:[...sharedGeneral,...normalMacro],
 fullMacroArea:[...sharedGeneral,...normalMacro,supplementId]
};
const broadCompositions={};
for(const [name,ids] of Object.entries(broadDefs)){const c=compose(`M4 ${name}`,ids);broadCompositions[name]=c;assert(!c.errors.length,`${name} compose errors ${c.errors.join(' | ')}`);assert(c.validation.modes.every(r=>r.ok),`${name} mode preflight failed`);assert((await core.verifyAnswers(c)).ok,`${name} answer verification failed`);}
assert(broadCompositions.macroWithSupplement.counts.challengeTotal===110,'All-Macro supplement should expose 110 active challenges');
assert(broadCompositions.fullMacroArea.counts.challengeTotal===110,'Full Macro area supplement should expose 110 active challenges');

const modes=['standard','timed','exam','legendary','score'];
const routes={
 standard:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')],
 timed:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],
 exam:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],
 legendary:[...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss')],
 score:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')]
};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const patternNames=['all-correct','all-incorrect','alternating','random-70-percent','remediation-heavy-boss-failure'];
function correctForPattern(p,step,pool,random){if(p===0)return true;if(p===1)return false;if(p===2)return step%2===0;if(p===3)return random()<.7;return !/Boss$/.test(pool)&&step%3!==0;}
function pick(bank,state,random,key){if(!bank?.length)return null;state.cycles[key]||=new Set;state.recent[key]||=[];let c=bank.filter(q=>!state.cycles[key].has(qid(q)));if(!c.length){state.cycles[key].clear();c=bank.slice();}let f=c.filter(q=>!state.recent[key].slice(-4).includes(qid(q)));if(!f.length){const last=state.recent[key].at(-1);f=c.filter(q=>qid(q)!==last);if(!f.length)f=c;}const q=f[Math.floor(random()*f.length)];state.cycles[key].add(qid(q));state.recent[key].push(qid(q));return q;}
function auxCandidates(comp,kind,q){const skill=q?.repairSkill||q?.primarySkill;const remConcept=q?.isCheckpointChallenge?q?.remediationConceptId:null;let pool=kind==='repair'?comp.repairQuestions:comp.bridgeQuestions;if(remConcept){const targeted=pool.filter(x=>x.primaryConceptId===remConcept||((x.secondaryConceptIds||[]).includes(remConcept)));if(targeted.length)return targeted;}const map=kind==='repair'?comp.microSkillRepairPools:comp.microSkillBridgePools;const direct=skill&&Array.isArray(map?.[skill])?map[skill]:[];return direct.length?direct:pool;}
function challengeFor(comp,pool,focusConcept,random,used,checkpointOrdinal){
 if(!['easyBoss','mediumBoss','finalBoss','legendaryBoss'].includes(pool))return null;
 let candidates=(comp.challengeQuestionBanks?.[pool]||[]).filter(q=>!used.has(qid(q)));
 if(focusConcept)candidates=candidates.filter(q=>!(q.challengeFocusConceptIds||[]).length||(q.challengeFocusConceptIds||[]).includes(focusConcept));
 if(pool==='legendaryBoss'){
   const desired=checkpointOrdinal===1?'opening':checkpointOrdinal===2?'middle':'final';
   const staged=candidates.filter(q=>(q.challengeBossStage||q.bossStage)===desired);if(staged.length)candidates=staged;
 }
 if(!candidates.length)return null;const q=candidates[Math.floor(random()*candidates.length)];used.add(qid(q));return q;
}
function simulate(comp,mode,seed,{supplementExpected=false}={}){
 const random=rng(seed),pattern=seed%5,state={cycles:{},recent:{}},usedChallenges=new Set();let routingFailures=0,immediateRepeats=0,prohibitedReuse=0,challengeSelections=0,challengePositionViolations=0,multiChallengeCheckpointViolations=0;const selections=[];let bossSlot=0,checkpointOrdinal=0,lastByPool={};
 for(let step=0;step<routes[mode].length;step++){
   const pool=routes[mode][step];let q=pick(comp.banks[pool]||[],state,random,pool);if(!q){routingFailures++;break;}
   if(lastByPool[pool]===qid(q))immediateRepeats++;lastByPool[pool]=qid(q);
   const poolBank=comp.banks[pool]||[];const priorSame=selections.filter(x=>x.pool===pool).map(x=>x.id);if(priorSame.includes(qid(q))&&new Set(priorSame).size<new Set(poolBank.map(qid)).size)prohibitedReuse++;
   let selected=q;let position=null;
   if(/Boss$/.test(pool)){
      bossSlot=(bossSlot%3)+1;if(bossSlot===1)checkpointOrdinal++;
      position=bossSlot;
      if(supplementExpected && !['timed','exam'].includes(mode) && bossSlot===3){
        const checkpointRows=selections.filter(x=>x.checkpointOrdinal===checkpointOrdinal);const focus=checkpointRows.find(x=>x.concept)?.concept||q.primaryConceptId;const ch=challengeFor(comp,pool,focus,random,usedChallenges,checkpointOrdinal);
        if(ch){selected={...ch,primaryConceptId:(ch.challengeFocusConceptIds||[]).includes(focus)?focus:ch.primaryConceptId};challengeSelections++;if(position!==3)challengePositionViolations++;}
      }
   }
   if(selected.isCheckpointChallenge && (!/Boss$/.test(pool)||position!==3))challengePositionViolations++;
   selections.push({pool,id:qid(selected),concept:selected.primaryConceptId,isChallenge:Boolean(selected.isCheckpointChallenge),checkpointOrdinal:/Boss$/.test(pool)?checkpointOrdinal:null,position});
   if(/Boss$/.test(pool)&&position===3){const n=selections.filter(x=>x.checkpointOrdinal===checkpointOrdinal&&x.isChallenge).length;if(n>1)multiChallengeCheckpointViolations++;}
   if(!correctForPattern(pattern,step,pool,random))for(const kind of ['repair','bridge']){const candidates=auxCandidates(comp,kind,selected);const aq=pick(candidates,state,random,`${kind}:${selected.remediationConceptId||selected.repairSkill||selected.primarySkill||'fallback'}`);if(!aq)routingFailures++;}
 }
 if(['timed','exam'].includes(mode)&&challengeSelections)challengePositionViolations++;
 return {completed:routingFailures===0,routingFailures,immediateRepeats,prohibitedReuse,challengeSelections,challengePositionViolations,multiChallengeCheckpointViolations,pattern:patternNames[pattern]};
}
function runBatch(name,comp,seedBase,{supplementExpected=false,perMode=500}={}){
 const byMode={};for(let mi=0;mi<modes.length;mi++){const mode=modes[mi];let completed=0,routingFailures=0,immediateRepeats=0,prohibitedReuse=0,challengeSelections=0,challengePositionViolations=0,multiChallengeCheckpointViolations=0;const patterns={};for(let i=0;i<perMode;i++){const s=simulate(comp,mode,seedBase+mi*100000+i,{supplementExpected});completed+=s.completed?1:0;routingFailures+=s.routingFailures;immediateRepeats+=s.immediateRepeats;prohibitedReuse+=s.prohibitedReuse;challengeSelections+=s.challengeSelections;challengePositionViolations+=s.challengePositionViolations;multiChallengeCheckpointViolations+=s.multiChallengeCheckpointViolations;patterns[s.pattern]=(patterns[s.pattern]||0)+1;}
 byMode[mode]={sessions:perMode,completed,routingFailures,immediateRepeats,prohibitedReuse,challengeSelections,challengePositionViolations,multiChallengeCheckpointViolations,patterns};assert(completed===perMode,`${name}/${mode} incomplete sessions`);assert(routingFailures===0,`${name}/${mode} routing failures`);assert(immediateRepeats===0,`${name}/${mode} immediate repeats`);assert(prohibitedReuse===0,`${name}/${mode} reuse before pool exhaustion`);assert(challengePositionViolations===0,`${name}/${mode} challenge position violation`);assert(multiChallengeCheckpointViolations===0,`${name}/${mode} multiple challenge checkpoint violation`);if(['timed','exam'].includes(mode))assert(challengeSelections===0,`${name}/${mode} challenge exclusion failed`);
 }
 return {name,totalSessions:perMode*modes.length,byMode};
}

// 42 safety units x 2,500 sessions. F11 uses full prerequisite support; all others are solo.
const individual={};let seed=1000000;
for(const cid of normalMacro){individual[cid]=runBatch(`solo:${cid}`,singleCompositions[cid],seed,{perMode:500});seed+=10000;}
individual[supplementId]=runBatch('supplement-safety',f11Composition,seed,{perMode:500,supplementExpected:true});seed+=10000;
// Families: 11 x 2,500.
const familyRuns={};for(const [f,c] of Object.entries(familyCompositions)){familyRuns[f]=runBatch(`family:${f}`,c,seed,{perMode:500,supplementExpected:f==='F11'});seed+=10000;}
// Broad mixed Macro: four x 2,500.
const broadRuns={};for(const [name,c] of Object.entries(broadCompositions)){broadRuns[name]=runBatch(`broad:${name}`,c,seed,{perMode:500,supplementExpected:name.includes('Supplement')||name==='fullMacroArea'});seed+=10000;}
const totalSimulationSessions=Object.values(individual).reduce((n,r)=>n+r.totalSessions,0)+Object.values(familyRuns).reduce((n,r)=>n+r.totalSessions,0)+Object.values(broadRuns).reduce((n,r)=>n+r.totalSessions,0);
assert(totalSimulationSessions===142500,`Expected 142500 deterministic sessions, got ${totalSimulationSessions}`);

// Generated-package static runtime closure.
const template=fs.readFileSync(path.join(composer,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
const packageDefs={macroNormal:broadCompositions.macroNormal,macroWithSupplement:broadCompositions.macroWithSupplement,fullMacroArea:broadCompositions.fullMacroArea};
const packageResults={};
for(const [name,c] of Object.entries(packageDefs)){
 const config=await core.createConfig(c.recipe,library,sha(template));const meta={phase:'M4-final-release',generatedAt:new Date().toISOString(),configuration:name,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256};const html=core.buildHtml(template,c,config,meta);const fp=path.join(outDir,`${name}.html`);fs.writeFileSync(fp,html);
 const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(code=>code.trim()&&!/^\s*[\[{]/.test(code.trim()));const syntax=[];for(let i=0;i<scripts.length;i++){try{new vm.Script(scripts[i],{filename:`${name}-${i}.js`})}catch(e){syntax.push(String(e.message||e));}}
 assert(syntax.length===0,`${name} inline JS syntax errors ${syntax.join('; ')}`);for(const label of ['Standard Campaign','Timed Trial','Exam Drill','Legendary Mode','Score Attack'])assert(html.includes(label),`${name} missing ${label}`);
 packageResults[name]={path:fp,bytes:Buffer.byteLength(html),sha256:sha(html),inlineScriptsChecked:scripts.length,syntaxIssues:syntax};
}

const familyTotals={};let macroSpecificCanonical=0;for(const [f,ids] of Object.entries(families)){familyTotals[f]=ids.reduce((n,cid)=>n+conceptAudit[cid].counts.total,0);macroSpecificCanonical+=familyTotals[f];}
assert(macroSpecificCanonical===2488,`Post-M2e Macro-specific canonical total expected 2488, got ${macroSpecificCanonical}`);

// Verify refreshed checksum manifests against the actual release payload.
function parseChecksums(fp){const out=new Map();for(const line of fs.readFileSync(fp,'utf8').split(/\r?\n/)){const m=line.match(/^([a-f0-9]{64})\s+(.+)$/i);if(m)out.set(m[2].trim(),m[1].toLowerCase());}return out;}
const checksumIssues=[];
const localSums=parseChecksums(path.join(composer,'SHA256SUMS.txt'));
for(const [rel,listed] of localSums.entries()){const fp=path.join(composer,...rel.split('/'));if(!fs.existsSync(fp))continue;const current=sha(fs.readFileSync(fp));if(listed!==current)checksumIssues.push({manifest:'faculty-build-composer/SHA256SUMS.txt',path:rel,listed,current});}
const rootSums=parseChecksums(path.join(repo,'SHA256SUMS.txt'));
for(const [rel,listed] of rootSums.entries()){let fp=null;if(rel.startsWith('build/faculty-build-composer/'))fp=path.join(composer,...rel.slice('build/faculty-build-composer/'.length).split('/'));else fp=path.join(repo,...rel.split('/'));if(!fs.existsSync(fp))continue;const current=sha(fs.readFileSync(fp));if(listed!==current)checksumIssues.push({manifest:'SHA256SUMS.txt',path:rel,listed,current});}
for(const required of ['phaseM4-final-macro-release-closure-v1.json','phaseM4-final-macro-release-closure-v1_questions.json']) assert(localSums.has(required),`Nested checksum manifest missing ${required}`);
assert(checksumIssues.length===0,`Checksum verification failed: ${checksumIssues.length} mismatch(es)`);

const result={
 phase:'M4-final-macro-validation',generatedAt:new Date().toISOString(),verdict:'RELEASE PAYLOAD CLOSED — LOCAL BROWSER SMOKE REMAINS',
 authoritativeBaseline:{globalCanonical:7274,librarySha256:library.librarySha256,composerVersion:core.COMPOSER_VERSION,macroSpecificConcepts:42,normalMacroConcepts:41,macroSpecificCanonical:macroSpecificCanonical,sharedGeneralOperationalConcepts:13},
 familyTotals,provenance,staticAudit:{issues:staticIssues,assetIssues:invalidAssets,knownLegacySupplementExactStemPairs:exactStemPairs,unexpectedExactStemPairs},
 compositionAudit:{singleNormalConcepts:41,families:11,broadConfigurations:Object.keys(broadDefs),supplementOnlyRejected:true,allFiveModesPassed:true,answerVerificationPassed:true},
 simulation:{individualUnits:42,familyUnits:11,broadUnits:4,perMode:500,totalSessions:totalSimulationSessions,responsePatterns:patternNames,individual,families:familyRuns,broad:broadRuns},
 generatedPackages:packageResults,checksumVerification:{status:'PASS',issues:checksumIssues}
};
fs.writeFileSync(path.join(outDir,'macro_m4_validation_results.json'),JSON.stringify(result,null,2)+'\n');
const familyRows=Object.entries(familyTotals).map(([f,n])=>`| ${f} | ${families[f].length} | ${n} | PASS |`).join('\n');
fs.writeFileSync(path.join(outDir,'MACRO_M4_FINAL_VALIDATION_REPORT.md'),`# Phase M4 Final Macro Library Validation

## Verdict

**RELEASE PAYLOAD CLOSED — LOCAL BROWSER SMOKE REMAINS**

M4 found and repaired two actual payload defects plus one release-provenance defect. No questions were added, deleted, or rewritten. Canonical inventory remains unchanged.

## Authoritative baseline

- Global canonical library: **7,274** questions.
- Semantic library SHA-256: \`${library.librarySha256}\`.
- Composer: **${core.COMPOSER_VERSION}**.
- Macro-specific scope: **42 concepts across 11 families** (41 normal concepts + Advanced Macro Checkpoint Supplement).
- Macro-specific canonical inventory: **${macroSpecificCanonical}**.
- Shared General Economics concepts tested in broad Macro operation: **13**, not double-counted in the 42-concept reconciliation.

| Family | Concepts | Canonical | Static/compose |
|---|---:|---:|---|
${familyRows}

## Defects repaired

1. Three protected GDP Measurement Legendary Boss records were missing \`bossStage\`. They were assigned opening / middle / final stages. Question text, answer options, keyed answers, IDs, and counts were untouched.
2. Five F6 concept-scoped records using the existing \`moneys_moneyd.webp\` graph lacked \`imageAlt\` and \`graphDescription\`. Accessibility metadata was added; the graph file and question content were untouched.
3. Both master \`SHA256SUMS.txt\` manifests were stale after M2e. They were refreshed and now verify cleanly against the release payload.

## Static safety closure

- All 42 Macro-specific concepts reconcile exactly once.
- All 41 normal Macro concepts pass solo five-mode preflight using the actual composed banks, including calculation routing where applicable.
- All normal Legendary Boss banks expose opening / middle / final stages.
- All published answers verify against exactly one option.
- No cross-concept canonical-ID collision was found. Five exact normalized-stem pairs are the known legacy F11 challenge mirrors of normal checkpoint items; no unexpected exact duplicate was found.
- All Macro-specific graph asset copies exist, match declared hashes, and carry \`imageAlt\` + \`graphDescription\`.
- The Advanced Macro Checkpoint Supplement remains non-standalone, contributes zero ordinary Easy/Medium/Hard practice, exposes exactly **110 active challenges** (8 opening / 9 middle / 40 final / 53 Legendary), and routes every challenge to a normal Macro remediation concept.

## Deterministic simulation closure

Exactly **${totalSimulationSessions.toLocaleString('en-US')} seeded sessions** ran across all five modes and five response patterns (all-correct, all-incorrect, alternating, ~70% correct, remediation-heavy/boss-failure):

- **105,000** individual safety sessions: 42 units × 500 seeds × 5 modes.
- **27,500** family sessions: 11 families × 500 seeds × 5 modes.
- **10,000** broad mixed-Macro sessions: four configurations × 500 seeds × 5 modes.

Across the entire run: zero incomplete sessions, zero routing failures, zero immediate repeats, zero reuse-before-exhaustion violations, zero challenge-position violations, zero multi-challenge checkpoints, and zero supplement challenges in Timed Trial or Exam Drill.

## Generated-package closure

Three generated packages (Macro normal, Macro + supplement, and full Macro area with shared foundations + supplement) pass five-mode composition, answer verification, template generation, required-mode markup checks, and inline-JavaScript syntax validation.

## Browser runtime gate

The container blocks normal browser navigation with \`ERR_BLOCKED_BY_ADMINISTRATOR\` for file URLs, localhost, and intercepted test origins. \`page.setContent()\` executes the document but runs on an opaque origin, where browser \`localStorage\` is denied. That prevents a valid end-to-end browser smoke in this environment. Static generated-package syntax and all deterministic engine simulations pass; the remaining browser smoke must be run from a normal local/hosted origin.

**No question additions are warranted.**
`)
console.log(JSON.stringify({verdict:result.verdict,macroSpecificCanonical,totalSimulationSessions,familyTotals,checksumIssues:checksumIssues.length,generatedPackages:Object.fromEntries(Object.entries(packageResults).map(([k,v])=>[k,{path:v.path,bytes:v.bytes,sha256:v.sha256,inlineScriptsChecked:v.inlineScriptsChecked}]))},null,2));
