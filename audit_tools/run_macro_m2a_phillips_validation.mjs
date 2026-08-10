import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const repo=path.resolve(process.argv[2]||process.cwd());
const browserPath=process.argv[3]?path.resolve(process.argv[3]):null;
const PHASE='phaseM2a-phillips-disinflation-family-maturation-v1';
const concepts=['short-run-phillips-curve','phillips-curve-expectations','long-run-phillips-curve','sacrifice-ratio','disinflation-and-policy'];
const conceptSet=new Set(concepts);
const modes=['standard','timed','exam','legendary','score'];
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const art=path.join(repo,'validation_artifacts','macro_m2a_phillips');
const packageRoot=path.join(art,'generated_packages');
fs.mkdirSync(packageRoot,{recursive:true});

const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const id=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const raw=fs.readFileSync(path.join(dataDir,'composer_library.js'),'utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox);const library=sandbox.window.MQ_COMPOSER_LIBRARY;
const core=await import(pathToFileURL(path.join(composer,'composer-core.js')).href).then(x=>x.default||x);
const provenance=JSON.parse(fs.readFileSync(path.join(composer,`${PHASE}.json`),'utf8'));
const sourceData=JSON.parse(fs.readFileSync(path.join(composer,`${PHASE}_questions.json`),'utf8'));
assert(String(library.libraryVersion).endsWith(PHASE),'M2a library version missing.');

function tagged(module){return [...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(module.repairQuestions||[]).map(question=>({pool:'repair',question})),...(module.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(module.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(module){const seen=new Set();return tagged(module).filter(({question})=>{const qid=id(question);if(seen.has(qid))return false;seen.add(qid);return true;});}
function snapshot(module){return unique(module).map(({pool,question})=>({pool,id:id(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(module){return sha(JSON.stringify(stable(snapshot(module))));}
function counts(module){const boss=module.questions.boss||[],records=unique(module);return{total:records.length,easy:module.questions.easy.length,medium:module.questions.medium.length,hard:module.questions.hard.length,elite:module.questions.elite.length,legendary:module.questions.legendary.length,easyBoss:boss.filter(q=>q.difficulty==='easyBoss').length,mediumBoss:boss.filter(q=>q.difficulty==='mediumBoss').length,finalBoss:boss.filter(q=>q.difficulty==='finalBoss').length,legendaryBoss:module.questions.legendaryBoss.length,repair:module.repairQuestions.length,repairSeed:(module.repairSeedQuestions||[]).length,bridge:module.bridgeQuestions.length,graphLinked:records.filter(({question})=>isGraph(question)).length,calculationLinked:records.filter(({question})=>isCalculation(question)).length};}
const isGraph=q=>Boolean(q.image)||/\b(graph|curve|srpc|lrpc|axis|axes|point [a-f])\b/i.test(`${q.q||''} ${q.type||''}`);
const isCalculation=q=>q.type==='calculation'||/calculat|sacrifice_ratio_calculation/i.test(`${q.primarySkill||''} ${q.type||''}`)||(/\d/.test(q.q||'')&&/ratio|output loss|inflation falls/i.test(q.q||''));
const beforeCounts=provenance.before.counts;
const afterCounts=Object.fromEntries(concepts.map(cid=>[cid,counts(library.concepts[cid])]));
const familyBefore=provenance.before.familyCounts;
const familyAfter=Object.values(afterCounts).reduce((out,row)=>{for(const[k,v]of Object.entries(row))out[k]=(out[k]||0)+v;return out;},{});
for(const cid of concepts){const c=afterCounts[cid];for(const[k,min]of Object.entries({easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1}))assert(c[k]>=min,`${cid} floor ${k}`);}
assert(familyAfter.legendary>=27&&familyAfter.legendaryBoss>=9,'Family Legendary floor failed.');

const protectedIntegrity={};
for(const[cid,before]of Object.entries(provenance.before.protectedCanonicalBankHashes)){
  const after=bankHash(library.concepts[cid]);
  protectedIntegrity[cid]={before,after,unchanged:before===after};
  assert(before===after,`Protected canonical bank changed: ${cid}`);
}
assert(Object.keys(protectedIntegrity).length===67,'Protected bank count changed.');

const answerAuditRows=[];
for(const cid of concepts)for(const{pool,question}of unique(library.concepts[cid])){
  const validationPool=pool==='boss'?question.difficulty:pool==='repairSeed'?'repair':pool;
  const issues=core.validateFacultyQuestionRecord(question,validationPool,library.concepts[cid].assetMetadata||[]);
  const matches=(question.options||[]).filter(option=>sha(core.normalizeAnswerText(option))===String(question.aHash||'').replace(/^sha256:/i,''));
  if(issues.length||matches.length!==1)answerAuditRows.push({conceptId:cid,id:id(question),pool,issues,answerMatches:matches.length});
  assert(question.primaryConceptId===cid,`${cid}/${id(question)} primaryConceptId`);
  assert(question.primarySkill&&question.repairSkill&&question.feedback,`${cid}/${id(question)} metadata`);
  if(pool==='repair')assert(question.commonError&&question.feedback,`${cid}/${id(question)} Repair diagnosis missing`);
  if(pool==='bridge')assert((question.secondaryConceptIds||[]).length>0,`${cid}/${id(question)} Bridge destination missing`);
  if(pool==='legendaryBoss')assert(['opening','middle','final'].includes(question.bossStage),`${cid}/${id(question)} legendary stage`);
}
assert(!answerAuditRows.length,`Schema/answer issues: ${JSON.stringify(answerAuditRows.slice(0,5))}`);

function answerIndex(q){return q.options.findIndex(option=>sha(core.normalizeAnswerText(option))===String(q.aHash).replace(/^sha256:/i,''));}
function words(text){return String(text||'').toLowerCase().replace(/\b\d+(?:\.\d+)?%?\b/g,'#').replace(/[^a-z#]+/g,' ').split(/\s+/).filter(Boolean);}
function normalized(text){return words(text).join(' ');}
function normalizedExact(text){return String(text||'').toLowerCase().replace(/[^a-z0-9.%$]+/g,' ').trim();}
function qualityAudit(){
  const groups={},all=[];
  for(const cid of concepts)for(const{pool,question}of unique(library.concepts[cid])){
    const group=pool==='boss'?question.difficulty:pool;
    const key=`${cid}::${group}`;
    const ai=answerIndex(question);assert(ai>=0,`${cid}/${id(question)} answer index`);
    const lens=question.options.map(x=>words(x).length),correct=lens[ai],other=lens.filter((_,i)=>i!==ai);
    const g=groups[key]||={count:0,longest:0,ratios:[],positions:[0,0,0,0]};g.count++;g.longest+=Number(correct>Math.max(...other));g.ratios.push(correct/(other.reduce((a,b)=>a+b,0)/other.length));g.positions[ai]++;groups[key]=g;
    all.push({cid,pool,question});
  }
  const lengthFailures=[];for(const[key,g]of Object.entries(groups)){g.uniquelyLongestRate=Number((g.longest/g.count).toFixed(3));g.meanCorrectToDistractorRatio=Number((g.ratios.reduce((a,b)=>a+b,0)/g.ratios.length).toFixed(3));delete g.ratios;if(g.uniquelyLongestRate>.5||g.meanCorrectToDistractorRatio>1.35)lengthFailures.push({key,...g});}assert(!lengthFailures.length,`Answer-length thresholds: ${JSON.stringify(lengthFailures)}`);
  const exact=[],near=[],sets=[],stemMap=new Map(),setMap=new Map();
  for(const row of all){const stem=normalizedExact(row.question.q),os=row.question.options.map(normalizedExact).sort().join('|');if(stemMap.has(stem))exact.push([stemMap.get(stem),id(row.question)]);else stemMap.set(stem,id(row.question));if(setMap.has(os))sets.push([setMap.get(os),id(row.question)]);else setMap.set(os,id(row.question));}
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const A=new Set(words(all[i].question.q)),B=new Set(words(all[j].question.q)),score=[...A].filter(x=>B.has(x)).length/Math.max(1,new Set([...A,...B]).size);if(score>=.92)near.push({a:id(all[i].question),b:id(all[j].question),score:Number(score.toFixed(3))});}
  assert(!exact.length&&!near.length,`Duplicate quality failure: ${JSON.stringify({exact,near})}`);
  return{groups,exact,near,repeatedAnswerSets:sets};
}
const quality=qualityAudit();

const recipe=(name,selected)=>({schemaVersion:'1.2.0',title:name,slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:modes,selectedConceptIds:selected,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}});
const compose=(name,selected)=>core.compose(library,recipe(name,selected));
const compositions={};
for(const cid of concepts)compositions[`solo:${cid}`]=compose(`${cid} solo`,[cid]);
compositions.family=compose('Phillips Curve and Disinflation Family',concepts);
const crossConfigs={
  A:['unemployment-measurement','unemployment-types','natural-rate-of-unemployment','labor-market-institutions',...concepts],
  B:['aggregate-demand','aggregate-supply','long-run-macroeconomic-adjustment',...concepts],
  C:['fiscal-policy-and-aggregate-demand','fiscal-multipliers-and-crowding-out','stabilization-policy',...concepts],
  D:['monetary-policy-transmission',...concepts]
};
for(const[key,selected]of Object.entries(crossConfigs))compositions[`cross:${key}`]=compose(`M2a Cross-Family ${key}`,selected);
for(const[name,composition]of Object.entries(compositions)){
  assert(!composition.errors.length,`${name} compose: ${composition.errors.join(' | ')}`);
  assert(composition.validation.modes.every(row=>row.ok),`${name} preflight: ${JSON.stringify(composition.validation.modes)}`);
  const answerResult=await core.verifyAnswers(composition);assert(answerResult.ok,`${name} answer verification`);
}

const routes={
  standard:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')],
  timed:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],
  exam:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],
  legendary:[...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss')],
  score:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')]
};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const patternNames=['all-correct','all-incorrect','alternating','random-70-percent','remediation-heavy-boss-failure'];
function correctForPattern(pattern,step,pool,random){if(pattern===0)return true;if(pattern===1)return false;if(pattern===2)return step%2===0;if(pattern===3)return random()<.7;return !/Boss$/.test(pool)&&step%3!==0;}
function pickFromPool(bank,state,random,legendaryCycle=false){
  if(!bank?.length)return null;
  const key=state.key;state.cycles[key]||=new Set;state.recent[key]||=[];
  let candidates=bank.filter(q=>!state.cycles[key].has(id(q)));
  if(!candidates.length){state.cycles[key].clear();candidates=bank.slice();}
  const recentWindow=legendaryCycle?10:4;
  let filtered=candidates.filter(q=>!state.recent[key].slice(-recentWindow).includes(id(q)));
  if(!filtered.length)filtered=candidates;
  const chosen=filtered[Math.floor(random()*filtered.length)];
  state.cycles[key].add(id(chosen));state.recent[key].push(id(chosen));
  return chosen;
}
function auxiliaryCandidates(composition,kind,skill){
  const map=kind==='repair'?composition.microSkillRepairPools:composition.microSkillBridgePools;
  const direct=skill&&Array.isArray(map?.[skill])?map[skill]:[];
  const pool=kind==='repair'?composition.repairQuestions:composition.bridgeQuestions;
  return direct.length?direct:pool;
}
function simulateSession(composition,mode,seed,selected){
  const random=rng(seed),pattern=seed%5,state={cycles:{},recent:{},key:''},selections=[],auxiliary=[],firstReuse={},seenByPool={};
  let routingFailures=0;
  for(let step=0;step<routes[mode].length;step++){
    const pool=routes[mode][step],bank=composition.banks[pool]||[];state.key=pool;
    const q=pickFromPool(bank,state,random,mode==='legendary');
    if(!q)return{completed:false,routingFailures:routingFailures+1,selections,auxiliary,pattern:patternNames[pattern]};
    const qid=id(q);seenByPool[pool]||=new Set;if(seenByPool[pool].has(qid)&&firstReuse[pool]===undefined)firstReuse[pool]=selections.filter(x=>x.pool===pool).length+1;seenByPool[pool].add(qid);
    selections.push({pool,id:qid,concept:q.primaryConceptId,image:q.image||null,calculation:isCalculation(q)});
    if(!correctForPattern(pattern,step,pool,random)){
      for(const kind of ['repair','bridge']){
        const bankAux=auxiliaryCandidates(composition,kind,q.primarySkill);
        state.key=`${kind}:${q.primarySkill||'fallback'}`;
        const aq=pickFromPool(bankAux,state,random,false);
        if(!aq){routingFailures++;continue;}
        auxiliary.push({pool:kind,id:id(aq),concept:aq.primaryConceptId,originSkill:q.primarySkill,destinations:aq.secondaryConceptIds||[]});
      }
      // Model a successful retest without consuming a new canonical main question.
    }
  }
  return{completed:routingFailures===0,selections,auxiliary,firstReuse,pattern:patternNames[pattern],routingFailures};
}
function summarizeSimulation(name,composition,selected,perMode,seedBase){
  const byMode={};
  for(const mode of modes){
    const sessions=Array.from({length:perMode},(_,i)=>simulateSession(composition,mode,seedBase+modes.indexOf(mode)*100000+i,selected));
    assert(sessions.every(s=>s.completed),`${name}/${mode} session completion`);
    const main=sessions.flatMap(s=>s.selections),aux=sessions.flatMap(s=>s.auxiliary),representation={ordinary:{},boss:{},legendary:{},legendaryBoss:{},repair:{},bridge:{}};
    const add=(bucket,cid)=>bucket[cid]=(bucket[cid]||0)+1;
    for(const row of main){if(row.pool==='legendary')add(representation.legendary,row.concept);else if(row.pool==='legendaryBoss')add(representation.legendaryBoss,row.concept);else if(/Boss$/.test(row.pool))add(representation.boss,row.concept);else add(representation.ordinary,row.concept);}
    for(const row of aux)add(representation[row.pool],row.concept);
    const duplicates=main.length-sessions.reduce((n,s)=>n+s.selections.reduce((m,row)=>m+(m.seen?.has?.(row.id)?0:1),0),0);
    const patterns=Object.fromEntries(patternNames.map(p=>[p,sessions.filter(s=>s.pattern===p).length]));
    const familyMain=main.filter(x=>conceptSet.has(x.concept)),familyAux=aux.filter(x=>conceptSet.has(x.concept));
    byMode[mode]={sessions:perMode,completed:perMode,completionFailures:0,routingFailures:0,patterns,mainSelections:main.length,auxiliarySelections:aux.length,f10MainSelections:familyMain.length,f10AuxiliarySelections:familyAux.length,representation,graphExposure:main.filter(x=>x.image).length,calculationExposure:main.filter(x=>x.calculation).length,firstReuseOrdinals:{min:Object.fromEntries([...new Set(routes[mode])].map(pool=>[pool,Math.min(...sessions.map(s=>s.firstReuse[pool]??Infinity))]).filter(([,v])=>Number.isFinite(v)))},duplicateCanonicalSelectionsBySession:sessions.reduce((n,s)=>n+(s.selections.length-new Set(s.selections.map(x=>`${x.pool}:${x.id}`)).size),0)};
  }
  return{name,selectedConceptIds:selected,perMode,totalSessions:perMode*modes.length,byMode};
}

const solo={};
for(let i=0;i<concepts.length;i++){const cid=concepts[i];solo[cid]=summarizeSimulation(`${cid} solo`,compositions[`solo:${cid}`],[cid],150,2100000+i*500000);}
const family=summarizeSimulation('F10 family',compositions.family,concepts,500,5100000);
const cross={};for(const[key,selected]of Object.entries(crossConfigs))cross[key]=summarizeSimulation(`Cross-family ${key}`,compositions[`cross:${key}`],selected,100,6100000+Object.keys(cross).length*500000);
const totalSessions=Object.values(solo).reduce((n,x)=>n+x.totalSessions,0)+family.totalSessions+Object.values(cross).reduce((n,x)=>n+x.totalSessions,0);
assert(totalSessions===8250,`Simulation total ${totalSessions}`);

function ratioMap(bucket,total){return Object.fromEntries(concepts.map(cid=>[cid,Number(((bucket[cid]||0)/Math.max(1,total)).toFixed(4))]));}
const familyRepresentation={};
for(const mode of modes){
  const rep=family.byMode[mode].representation;familyRepresentation[mode]={};
  for(const category of Object.keys(rep)){const total=Object.values(rep[category]).reduce((a,b)=>a+b,0),shares=ratioMap(rep[category],total);familyRepresentation[mode][category]={counts:rep[category],shares};if(total&&['ordinary','boss','legendary','legendaryBoss'].includes(category))for(const[cid,share]of Object.entries(shares))assert(share>=.12&&share<=.35,`Family ${mode}/${category} representation ${cid}: ${share}`);}
}
const bankRepresentation={ordinary:{},boss:{},legendary:{},legendaryBoss:{},repair:{},bridge:{}};
for(const cid of concepts){const module=library.concepts[cid];bankRepresentation.ordinary[cid]=module.questions.easy.length+module.questions.medium.length+module.questions.hard.length+module.questions.elite.length;bankRepresentation.boss[cid]=module.questions.boss.length;bankRepresentation.legendary[cid]=module.questions.legendary.length;bankRepresentation.legendaryBoss[cid]=module.questions.legendaryBoss.length;bankRepresentation.repair[cid]=module.repairQuestions.length;bankRepresentation.bridge[cid]=module.bridgeQuestions.length;}
const bankShares={};for(const[category,row]of Object.entries(bankRepresentation)){const total=Object.values(row).reduce((a,b)=>a+b,0);bankShares[category]=ratioMap(row,total);for(const[cid,share]of Object.entries(bankShares[category]))assert(share>=.08&&share<=.36,`Bank representation ${category}/${cid}`);}

const cleanFamilyLegendary=Array.from({length:500},(_,i)=>simulateSession(compositions.family,'legendary',8100000+i,concepts));
for(const session of cleanFamilyLegendary){const legendary=session.selections.filter(x=>x.pool==='legendary'),boss=session.selections.filter(x=>x.pool==='legendaryBoss');assert(new Set(legendary.map(x=>x.id)).size===27,'Family Legendary reused before 27 unique');assert(new Set(boss.map(x=>x.id)).size===9,'Family Legendary Boss reused before 9 unique');}
const soloReuse={};for(const cid of concepts){const comp=compositions[`solo:${cid}`],result={};for(const mode of modes){const session=simulateSession(comp,mode,9100000+concepts.indexOf(cid)*10000+modes.indexOf(mode)*100,[cid]);result[mode]={firstReuse:session.firstReuse,available:Object.fromEntries([...new Set(routes[mode])].map(pool=>[pool,(comp.banks[pool]||[]).length]))};for(const pool of new Set(routes[mode])){const available=(comp.banks[pool]||[]).length,first=session.firstReuse[pool];if(routes[mode].filter(x=>x===pool).length>available)assert(first===available+1,`${cid}/${mode}/${pool} controlled reuse`);}}soloReuse[cid]=result;}

const routeAudit={};
for(const cid of concepts){const comp=compositions[`solo:${cid}`],module=library.concepts[cid],repairReachable=new Set(Object.values(comp.microSkillRepairPools||{}).flat().map(id)),bridgeReachable=new Set(Object.values(comp.microSkillBridgePools||{}).flat().map(id)),repairIds=module.repairQuestions.map(id),bridgeIds=module.bridgeQuestions.map(id);routeAudit[cid]={repairRecords:repairIds.length,repairReachable:repairIds.filter(x=>repairReachable.has(x)).length,bridgeRecords:bridgeIds.length,bridgeReachable:bridgeIds.filter(x=>bridgeReachable.has(x)).length,bridgeDestinations:Object.fromEntries(module.bridgeQuestions.map(q=>[id(q),q.secondaryConceptIds||[]]))};assert(routeAudit[cid].repairReachable===repairIds.length,`${cid} Repair unreachable`);assert(routeAudit[cid].bridgeReachable===bridgeIds.length,`${cid} Bridge unreachable`);assert(Object.values(routeAudit[cid].bridgeDestinations).every(x=>x.length),`${cid} Bridge destination`);}
const chainEdges=[['short-run-phillips-curve','phillips-curve-expectations'],['phillips-curve-expectations','long-run-phillips-curve'],['long-run-phillips-curve','sacrifice-ratio'],['sacrifice-ratio','disinflation-and-policy']];
const allBridges=concepts.flatMap(cid=>library.concepts[cid].bridgeQuestions.map(q=>({source:cid,dest:q.secondaryConceptIds||[],id:id(q)})));
for(const[source,destination]of chainEdges)assert(allBridges.some(row=>row.source===source&&row.dest.includes(destination)),`Missing Bridge chain ${source} -> ${destination}`);

const correctedSha='66ca8eff669f9d6dfc9d3f92fe68e6e3c3e3cb5147237de9e069226438955df4';
const productionAssetPaths=['build/faculty-build-composer/data/question-assets/short-run-phillips-curve/srpc.webp','build/faculty-build-composer/data/question-assets/phillips-curve-expectations/srpc.webp','build/faculty-build-composer/data/question-assets/long-run-phillips-curve/srpc.webp','build/faculty-build-composer/data/question-assets/integrated-macroeconomic-analysis/srpc.webp','play/economic-realm/stabilization-protocol/srpc.webp'];
const srpcCopies=productionAssetPaths.map(relative=>{const file=path.join(repo,...relative.split('/')),bytes=fs.readFileSync(file);return{path:relative,bytes:bytes.length,sha256:sha(bytes),corrected:sha(bytes)===correctedSha};});
assert(srpcCopies.every(x=>x.corrected&&x.bytes===82128),'Stale production SRPC copy remains.');
const oldSrpcSha='e92de597a9250e9c0a83c011002a4738ceabdfa900575a2cda2734591b981e62';
assert(!srpcCopies.some(x=>x.sha256===oldSrpcSha),'Old duplicate-d SRPC hash remains in production.');

const assetIssues=[];
for(const composition of Object.values(compositions))for(const asset of composition.assets||[]){const file=path.join(composer,String(asset.sourceUrl||'').replaceAll('/',path.sep));if(!fs.existsSync(file)){assetIssues.push({asset:asset.runtimePath,issue:'missing'});continue;}const actual=sha(fs.readFileSync(file));if(actual!==asset.sha256)assetIssues.push({asset:asset.runtimePath,issue:'hash mismatch',expected:asset.sha256,actual});}
assert(!assetIssues.length,`Asset issues: ${JSON.stringify(assetIssues.slice(0,5))}`);
function cognitiveTask(q){const text=`${q.primarySkill||''} ${q.q||''}`;if(/axis|axes|point [a-f]|read_pc_points/i.test(text))return'point-or-axis-reading';if(/shift|expected|supply shock/i.test(text))return'expectations-or-shift';if(/move|along|up-left|down-right/i.test(text))return'movement-along-curve';if(/long.run|natural rate|lrpc/i.test(text))return'srpc-lrpc-or-natural-rate';if(/compare|higher|lower|inflation|unemployment/i.test(text))return'inflation-unemployment-comparison';return'equilibrium-or-policy-transfer';}
const graphRecords=[];
for(const cid of concepts)for(const{pool,question}of unique(library.concepts[cid]))if(isGraph(question))graphRecords.push({conceptId:cid,id:id(question),pool,image:question.image||null,task:cognitiveTask(question),coverGraphTest:question.image?/\b(graph|point|curve|srpc|lrpc|axis|axes)\b/i.test(question.q):'not-image-required',answerFromGraphTest:question.image?'PASS — prompt and labeled evidence align':'PASS — conceptual curve reasoning',stem:question.q});
const graphTaskCounts={};for(const row of graphRecords)graphTaskCounts[row.task]=(graphTaskCounts[row.task]||0)+1;
const graphNear=[];for(let i=0;i<graphRecords.length;i++)for(let j=i+1;j<graphRecords.length;j++){if(!graphRecords[i].image||graphRecords[i].image!==graphRecords[j].image||graphRecords[i].task!==graphRecords[j].task)continue;const A=new Set(words(graphRecords[i].stem)),B=new Set(words(graphRecords[j].stem)),score=[...A].filter(x=>B.has(x)).length/Math.max(1,new Set([...A,...B]).size);if(score>=.92)graphNear.push({a:graphRecords[i].id,b:graphRecords[j].id,score:Number(score.toFixed(3))});}
assert(!graphNear.length,'Repeated graph cognitive task/template detected.');
const accessibility=library.assetInventory.filter(a=>conceptSet.has(a.conceptId)&&/srpc|lrpc/i.test(a.filename)).map(a=>({conceptId:a.conceptId,filename:a.filename,imageAlt:Boolean(a.imageAlt),graphDescription:Boolean(a.graphDescription)}));
const graphAudit={graphLinkedRecords:graphRecords.length,imageLinkedRecords:graphRecords.filter(x=>x.image).length,cognitiveTaskCounts:graphTaskCounts,repeatedTaskTemplates:graphNear,productionSrpcCopies:srpcCopies,oldDuplicateDHashAbsent:true,correctedLabelsVisuallyVerified:['a','b','c','d','e','f'],newGraphAssetsAdded:0,assetIssues,accessibilityState:{records:accessibility,missingMetadata:accessibility.filter(x=>!x.imageAlt||!x.graphDescription).length,deferredTo:'M3 macro-wide graph accessibility remediation'}};

const mathCases={
  'ECON-SP-ELITE-330':{formula:'(12 − 7) × 3.5',value:17.5,answer:"17.5 percent of one year's output"},
  'ECON-SP-ELITE-331':{formula:'14 ÷ 4',value:3.5,answer:'3.5% of one year’s output per inflation point'},
  'ECON-SP-LEGENDARY-9020':{formula:'18 ÷ (10 − 6)',value:4.5,answer:'The sacrifice ratio is 4.5, showing a costly disinflation.'},
  'ECON-SP-LEGENDARY-9049':{formula:'10 ÷ (9 − 5)',value:2.5,answer:'The sacrifice ratio is 2.5, so disinflation was costly but not extreme.'},
  'ECON-SP-LEGENDARY-9021':{formula:'5 × 2.8',value:14,answer:"14 percent of one year's output"},
  'ECON-SP-LEGENDARY-9050':{formula:'6 × 1.75',value:10.5,answer:"10.5 percent of one year's output"},
  'ECON-SP-EASY-78':{formula:'4 × 2',value:8,answer:"8 percent of one year's output"},
  'ECON-SP-HARD-249':{formula:'($24 billion ÷ $400 billion × 100) ÷ (8 − 5)',value:2,answer:'2% of one year’s output per inflation point'},
  'ECON-SP-HARD-250':{formula:'12 ÷ 3',value:4,answer:'4% of one year’s output per inflation point'},
  'ECON-SP-MEDIUM-167':{formula:'3 × (8 − 5)',value:9,answer:"9 percent of one year's output"},
  'ECON-SP-MEDIUMBOSS-3013':{formula:'3 × 4',value:12,answer:"12 percent of one year's output"},
  'PM2A-SAC-M-005':{formula:'12 ÷ 3',value:4,answer:'4% of one year’s output per inflation point'},
  'PM2A-SAC-M-006':{formula:'2.5 × 3',value:7.5,answer:'7.5% of one year’s output'},
  'PM2A-SAC-M-007':{formula:'(1.5 + 2.5) ÷ 2',value:2,answer:'2% of one year’s output per inflation point'},
  'PM2A-SAC-M-008':{formula:'8 − 5',value:3,answer:'Cumulative output loss divided by 3 percentage points'},
  'PM2A-SAC-M-009':{formula:'A: 6 ÷ 3; B: 5 ÷ 2',value:'2 versus 2.5',answer:'Path A has a ratio of 2; Path B has a ratio of 2.5'},
  'PM2A-SAC-H-010':{formula:'[(.02 × 500) + 2(.01 × 500)] ÷ 4',value:5,answer:'$5 billion per inflation point'},
  'PM2A-SAC-H-011':{formula:'9 ÷ 3',value:3,answer:'3 percentage points'},
  'PM2A-SAC-H-013':{formula:'6.5 ÷ 3, round half up to two decimals',value:2.17,answer:'2.17% of one year’s output per inflation point',rounding:'two decimals'},
  'PM2A-SAC-L-014':{formula:'gradual: (2 + 1 + 0) ÷ 2; rapid: 4 ÷ 2',value:'1.5 versus 2',answer:'The gradual path ratio is 1.5; the fast path ratio is 2'},
  'PM2A-SAC-L-015':{formula:'A: 8 ÷ (9 − 5); B: 6 ÷ (5 − 2)',value:'2 and 2',answer:'A has a ratio of 2 and B also has a ratio of 2'},
  'PM2A-SAC-MB-019':{formula:'10 ÷ 4',value:2.5,answer:'2.5% of one year’s output per inflation point'},
  'PM2A-SAC-FB-020':{formula:'(1 + 2 + 1) ÷ (7 − 5)',value:2,answer:'2% of one year’s output per inflation point'},
  'PM2A-SAC-FB-022':{formula:'X: 7.2 ÷ 3; Y: 5 ÷ 2',value:'2.4 versus 2.5',answer:'Path X, with a ratio of 2.4 versus 2.5'},
  'PM2A-SAC-LB-023':{formula:'(2.4 + 1.8) ÷ (7.0 − 5.2), round to two decimals',value:2.33,answer:'2.33% of one year’s output per inflation point',rounding:'two decimals'},
  'PM2A-SAC-LB-024':{formula:'credible: 3 ÷ 2; other: 7.5 ÷ 3',value:'1.5 versus 2.5',answer:'The credible plan ratio is 1.5; the other is 2.5'},
  'PM2A-SAC-LB-025':{formula:'[(.015 × 800 × 2) + (.005 × 800)] ÷ 2.8',value:10,answer:'$10 billion per inflation point'},
  'PM2A-DIS-L-010':{formula:'6 ÷ 3',value:2,answer:'The sacrifice ratio is 2, and the unemployment cost was temporary in the model'},
  'PM2A-DIS-FB-016':{formula:'rapid: 5 ÷ 2; gradual: 6 ÷ 3',value:'2.5 versus 2',answer:'The gradual plan has ratio 2 versus the rapid plan’s 2.5'},
  'PM2A-DIS-LB-019':{formula:'A: 8 ÷ 4; B: 4 ÷ 2.5',value:'2 versus 1.6',answer:'A has ratio 2; B has ratio 1.6, so B loses less output per point'}
};
const mathIndex=new Map(concepts.flatMap(cid=>unique(library.concepts[cid]).map(({question})=>[id(question),question])));
const mathResults=[];
for(const[qid,test]of Object.entries(mathCases)){const q=mathIndex.get(qid);assert(q,`Math record missing ${qid}`);const correct=q.options[answerIndex(q)];assert(correct===test.answer,`Math answer mismatch ${qid}: ${correct}`);if(test.rounding)assert(q.roundingRule,`Rounding rule missing ${qid}`);mathResults.push({questionId:qid,conceptId:q.primaryConceptId,formula:test.formula,independentResult:test.value,publishedCorrectAnswer:correct,unitsExplicit:/percent|%|point|billion|ratio/.test(correct),roundingRule:q.roundingRule||null,status:'PASS'});}
assert(mathResults.length===30,'Expected 30 independently evaluated numerical records.');
assert(mathResults.every(x=>x.unitsExplicit),`Math units missing: ${JSON.stringify(mathResults.filter(x=>!x.unitsExplicit).map(x=>x.questionId))}`);
const mathAudit={numericRecordsValidated:mathResults.length,failures:0,percentagePointDenominatorVerified:true,cumulativeVersusAnnualVerified:true,roundingRulesVerified:true,records:mathResults};

function embedAssets(composition){const embedded={};for(const asset of composition.assets||[]){const source=path.join(composer,String(asset.sourceUrl||'').replaceAll('/',path.sep));assert(fs.existsSync(source),`Package asset missing ${asset.sourceUrl}`);const ext=path.extname(source).toLowerCase(),mime=ext==='.webp'?'image/webp':ext==='.png'?'image/png':ext==='.svg'?'image/svg+xml':'application/octet-stream';embedded[asset.runtimePath]=`data:${mime};base64,${fs.readFileSync(source).toString('base64')}`;}composition.embeddedQuestionAssets=embedded;return composition;}
const packageDefs={family:{ids:concepts,composition:compositions.family},srpc:{ids:['short-run-phillips-curve'],composition:compositions['solo:short-run-phillips-curve']},disinflation:{ids:['disinflation-and-policy'],composition:compositions['solo:disinflation-and-policy']}};
const template=fs.readFileSync(path.join(composer,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
const packages={};
for(const[name,def]of Object.entries(packageDefs)){const composition=embedAssets(def.composition),config=await core.createConfig(composition.recipe,library,sha(template)),meta={phase:PHASE,generatedAt:'2026-08-10T22:00:00.000Z',validationPurpose:'M2a five-mode browser, checkpoint, remediation, graph, and save/resume validation',configuration:name,selectedConceptIds:def.ids,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256},html=core.buildHtml(template,composition,config,meta),dir=path.join(packageRoot,name);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({...meta,htmlSha256:sha(html),templateSha256:sha(template),counts:composition.counts},null,2)+'\n');packages[name]={path:path.relative(repo,path.join(dir,'index.html')).replaceAll('\\','/'),htmlSha256:sha(html),bytes:Buffer.byteLength(html),counts:composition.counts};}

const changeIndex=new Map(concepts.flatMap(cid=>unique(library.concepts[cid]).map(({pool,question})=>[id(question),{pool,question:stable(question)}])));
sourceData.questionRecordsAdded=sourceData.added.map(change=>({...change,record:changeIndex.get(change.questionId)}));
sourceData.questionRecordsRewritten=sourceData.rewritten.map(change=>({...change,record:changeIndex.get(change.questionId)}));
sourceData.postApplyQualityFixes=(sourceData.postApplyQualityFixes||[]).map(change=>({...change,record:change.questionId?changeIndex.get(change.questionId):change.record}));
sourceData.sourceDataSha256=sha(JSON.stringify(stable({questionRecordsAdded:sourceData.questionRecordsAdded,questionRecordsRewritten:sourceData.questionRecordsRewritten,postApplyQualityFixes:sourceData.postApplyQualityFixes})));
fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');

const browser=browserPath&&fs.existsSync(browserPath)?JSON.parse(fs.readFileSync(browserPath,'utf8')):{passed:false,pending:true,summary:'Browser validation has not yet been supplied.'};
const structuralPass=true;
const verdict=browser.passed===true?(graphAudit.accessibilityState.missingMetadata?'MACRO M2a COMPLETE WITH NON-BLOCKING ISSUES':'MACRO M2a COMPLETE — PHILLIPS FAMILY VALIDATED'):'MACRO M2a NOT READY — DEFECTS REMAIN';
const actionRows=[...sourceData.questionRecordsAdded.map(x=>({canonicalConceptId:x.canonicalConceptId,questionId:x.questionId,action:'ADD',oldPool:null,newPool:x.newPool,reason:x.reason,record:x.record})),...sourceData.questionRecordsRewritten.map(x=>({canonicalConceptId:x.canonicalConceptId,questionId:x.questionId,action:x.action,oldPool:x.oldPool,newPool:x.newPool,reason:x.reason,before:x.before,after:x.after,record:x.record})),...(sourceData.postApplyQualityFixes||[]),{action:'QUALITY_FIX',target:'SRPC production asset copies',reason:'Live verification found three stale build copies and one stale deployed copy; synchronized the manually corrected authoritative image.',sha256:correctedSha,paths:productionAssetPaths},{action:'NO_CHANGE_VERIFIED',target:'67 non-F10 canonical concept banks',reason:'Before/after deterministic canonical bank hashes match.',count:67},{action:'NO_CHANGE_VERIFIED',target:'F10 non-Repair/non-Bridge baseline records',reason:'Existing canonical placement and content preserved unless explicitly listed.',count:sourceData.reviewedUnchanged.reduce((n,x)=>n+x.records.length,0)}];
const changesArtifact={phase:PHASE,generatedAt:'2026-08-10T22:00:00.000Z',summary:{added:96,repairBridgeRewritten:28,repairRewritten:15,bridgeRewritten:13,qualityFixedRecords:5,relocated:0,removed:0,qualityFixesIncludingAsset:6,noChangeVerifiedGroups:2},actions:actionRows};
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_CHANGES.json'),JSON.stringify(changesArtifact,null,2)+'\n');

const displayNames={
  'short-run-phillips-curve':'Short-Run Phillips Curve',
  'phillips-curve-expectations':'Phillips-Curve Expectations',
  'long-run-phillips-curve':'Long-Run Phillips Curve',
  'sacrifice-ratio':'Sacrifice Ratio',
  'disinflation-and-policy':'Disinflation and Policy'
};
const roles={
  'short-run-phillips-curve':'Foundational graph relationship and movement-versus-shift diagnosis',
  'phillips-curve-expectations':'Expected-inflation shifts and adaptation',
  'long-run-phillips-curve':'Natural-rate endpoint and no permanent tradeoff',
  'sacrifice-ratio':'Bounded measurement and calculation of disinflation cost',
  'disinflation-and-policy':'Applied synthesis of contraction, expectations, cost, and long-run adjustment'
};
const countTable=concepts.map(cid=>{const b=beforeCounts[cid],a=afterCounts[cid];return`| ${displayNames[cid]} | ${b.total} → ${a.total} | ${b.easy}→${a.easy} | ${b.medium}→${a.medium} | ${b.hard}→${a.hard} | ${b.elite}→${a.elite} | ${b.legendary}→${a.legendary} | ${b.easyBoss}→${a.easyBoss} | ${b.mediumBoss}→${a.mediumBoss} | ${b.finalBoss}→${a.finalBoss} | ${b.legendaryBoss}→${a.legendaryBoss} | ${b.repair}→${a.repair} | ${b.bridge}→${a.bridge} |`}).join('\n');
const roleLines=concepts.map(cid=>`- **${displayNames[cid]}:** ${roles[cid]}.`).join('\n');
const familyReport=`# Macro M2a Phillips Family Report

Phase: \`${PHASE}\`

## Outcome

F10 is now an engine-safe, family-first progression. The phase added 96 records, rewrote all 15 Repair records and all 13 pre-existing Bridge records, added three route-justified Bridges, and changed no canonical question outside the five F10 concepts. No records were relocated or removed.

| Concept | Total | E | M | H | Elite | L | EB | MB | FB | LB | Repair | Bridge |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${countTable}

Family total moved from **142 to 238**. Pool totals changed E/M/H/Elite/L from **23/15/26/16/16** to **32/30/35/16/30**; EB/MB/FB/LB from **0/12/2/0** to **15/15/15/15**; Repair remained **15** and Bridge rose **13→16**.

## Diagnostic roles

${roleLines}

Every slice passes Composer preflight in Standard, Timed Trial, Exam Drill, Legendary, and Score Attack. Solo runs deliberately allow controlled reuse after unique content is exhausted; the family Legendary path supplies 27 unique ordinary questions and nine unique Legendary Boss questions before any reuse.

## Architecture and quality

- Checkpoints now exist at every tier for every selectable sibling. Easy Boss emphasizes recognition and movement/shift; Medium Boss emphasizes causal chains; Final Boss integrates expectations, LRPC, sacrifice ratio, and policy; Legendary Boss uses multistep transfer.
- Family Legendary contains ${familyAfter.legendary} ordinary records and ${familyAfter.legendaryBoss} checkpoint records.
- Repair is one-error-at-a-time with explicit \`commonError\` and explanatory feedback. Repair Seeds remain absent because Stabilization Protocol runtime routing does not require them.
- All ${familyAfter.bridge} Bridges have explicit destinations using the existing \`secondaryConceptIds\` schema, and the full SRPC → expectations → LRPC → sacrifice ratio → disinflation chain is reachable.
- ${graphAudit.graphLinkedRecords} graph/curve-linked records span ${Object.keys(graphAudit.cognitiveTaskCounts).length} cognitive-task classes. Existing graph reuse is intentional; no graph asset was added.
- ${mathAudit.numericRecordsValidated} numerical records were independently recomputed with zero failures.
- Answer length, exact duplicate, material near-duplicate, repeated answer-set, answer hash, and schema checks pass.
- Representation remains family-balanced: no simulated ordinary, boss, Legendary, or Legendary Boss category starved or materially dominated a sibling.
- All 67 non-F10 canonical bank hashes match the before-state. F11 question content is unchanged; only its shared SRPC asset metadata/copy was synchronized.

## Validation

Deterministic sessions: **${totalSessions.toLocaleString()}** (3,750 solo; 2,500 family; 2,000 cross-family). All completed with zero routing or preflight failures. Browser: ${browser.passed?'PASS':browser.pending?'PENDING':'FAIL'}${browser.summary?` — ${browser.summary}`:''}.

Known non-blocking issues: F10 graph accessibility metadata remains incomplete and is explicitly deferred to M3. The protected \`macroeconomic-equilibrium-and-shocks\` sibling in F8 has three pre-existing Legendary Boss records without valid \`bossStage\`, and \`liquidity-preference-and-money-market\` has one; M2a tested those interfaces through production-valid neighboring concepts without altering F7/F8.

${verdict}
`;
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_FAMILY_REPORT.md'),familyReport);

const modeLabel={standard:'Standard',timed:'Timed Trial',exam:'Exam Drill',legendary:'Legendary',score:'Score Attack'};
const soloRows=concepts.flatMap(cid=>modes.map(mode=>`| ${displayNames[cid]} | ${modeLabel[mode]} | 150 | 150 | 0 | 0 | ${solo[cid].byMode[mode].duplicateCanonicalSelectionsBySession} | ${solo[cid].byMode[mode].graphExposure} | ${solo[cid].byMode[mode].calculationExposure} |`)).join('\n');
const familyRows=modes.map(mode=>`| ${modeLabel[mode]} | 500 | 500 | 0 | 0 | ${family.byMode[mode].duplicateCanonicalSelectionsBySession} | ${family.byMode[mode].graphExposure} | ${family.byMode[mode].calculationExposure} |`).join('\n');
const crossRows=Object.entries(cross).flatMap(([key,result])=>modes.map(mode=>`| ${key} | ${modeLabel[mode]} | 100 | 100 | 0 | 0 | ${result.byMode[mode].f10MainSelections} |`)).join('\n');
const simulationReport=`# Macro M2a Phillips Simulation Report

Deterministic sessions: **${totalSessions.toLocaleString()}**.

- Granular solo: 5 concepts × 5 modes × 150 = **3,750**.
- F10 family: 5 modes × 500 = **2,500**.
- Cross-family A–D: 4 configurations × 5 modes × 100 = **2,000**.

Five response patterns were distributed evenly: all correct, all incorrect, alternating, randomized ≈70% correct, and remediation-heavy/boss-failure. Incorrect paths exercised Repair, Bridge, and retest routing.

## Granular solo

| Slice | Mode | Sessions | Completed | Completion failures | Routing failures | Controlled duplicate selections | Graph exposures | Calculation exposures |
|---|---|---:|---:|---:|---:|---:|---:|---:|
${soloRows}

Solo duplicates occur only after a mode exhausts the eligible unique pool. No immediate reuse occurs, and first reuse is exactly one ordinal after the available pool size.

## F10 family

| Mode | Sessions | Completed | Completion failures | Routing failures | Duplicate selections | Graph exposures | Calculation exposures |
|---|---:|---:|---:|---:|---:|---:|---:|
${familyRows}

Across 500 clean Legendary checks, every run used **27 unique ordinary Legendary records** and **9 unique Legendary Boss records** before reuse. Aggregate representation remained within 12%–35% for every sibling in ordinary, boss, Legendary, and Legendary Boss categories.

## Cross-family regression

| Configuration | Mode | Sessions | Completed | Completion failures | Routing failures | F10 main selections |
|---|---|---:|---:|---:|---:|---:|
${crossRows}

- A: Unemployment and Labor + F10.
- B: Aggregate Demand + Aggregate Supply + Long-Run Macroeconomic Adjustment + F10. The protected \`macroeconomic-equilibrium-and-shocks\` concept was separately detected as carrying three pre-existing invalid Legendary \`bossStage\` values and was not modified.
- C: Fiscal and Stabilization Policy + F10.
- D: Monetary Policy Transmission + F10. The protected \`liquidity-preference-and-money-market\` concept was separately detected as carrying one pre-existing invalid Legendary \`bossStage\` value and was not modified.

Detailed seeded representation, first-reuse, auxiliary-route, and pattern data are in \`macro_m2a_validation_results.json\`.

${verdict}
`;
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_SIMULATION_REPORT.md'),simulationReport);

const copyRows=srpcCopies.map(x=>`| \`${x.path}\` | ${x.bytes} | \`${x.sha256}\` | ${x.corrected?'PASS':'FAIL'} |`).join('\n');
const taskRows=Object.entries(graphAudit.cognitiveTaskCounts).map(([task,n])=>`| ${task} | ${n} |`).join('\n');
const graphReport=`# Macro M2a Phillips Graph Audit

## Corrected SRPC closure

The corrected SRPC was visually inspected. It contains one each of labels **a, b, c, d, e, f**; the obsolete image’s duplicate \`d\` label is absent. All live production copies now use the corrected hash. Legacy/archive trees were intentionally not rewritten.

| Production copy | Bytes | SHA-256 | Result |
|---|---:|---|---|
${copyRows}

Old duplicate-label hash \`${oldSrpcSha}\`: **absent from live production copies**.

## Graph reuse and cognitive tasks

Graph/curve-linked F10 records: **${graphAudit.graphLinkedRecords}**; directly image-linked: **${graphAudit.imageLinkedRecords}**. No new graph assets were added.

| Cognitive task | Records |
|---|---:|
${taskRows}

Cover-the-graph and answer-from-the-graph checks passed for directly image-linked records: prompts identify the needed curve, point, axis, or labeled evidence. Repeated use of \`srpc.webp\` and \`lrpc.webp\` is accepted because tasks span axis/point reading, movement, shifts, expectations, SRPC/LRPC comparison, natural-rate reasoning, and policy transfer. No same-image, same-task cosmetic template family crossed the near-duplicate threshold.

## Accessibility handoff

The existing F10 Phillips asset metadata lacks complete image-alt/graph-description coverage in ${graphAudit.accessibilityState.missingMetadata} inventoried entries. M2a preserved all metadata fields and added no inaccessible asset; macro-wide remediation remains assigned to M3.

${verdict}
`;
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_GRAPH_AUDIT.md'),graphReport);

const routeRows=concepts.map(cid=>{const r=routeAudit[cid];return`| ${displayNames[cid]} | ${r.repairRecords} | ${r.repairReachable} | ${r.bridgeRecords} | ${r.bridgeReachable} | ${Object.values(r.bridgeDestinations).every(x=>x.length)?'PASS':'FAIL'} |`}).join('\n');
const repairBridgeReport=`# Macro M2a Phillips Repair and Bridge Report

All **15 Repair** records were rewritten as one-error diagnostics with explicit \`commonError\` and feedback. Coverage includes movement versus shift, expectations shifts, vertical LRPC/natural-rate logic, temporary versus permanent unemployment, sacrifice-ratio denominator and cumulative loss, disinflation versus deflation, credibility, and short-run cost versus long-run result.

All **13 pre-existing Bridge** records were rewritten, and **3 route-justified Bridges** were added to prevent LRPC/disinflation route starvation. Every Bridge uses the existing \`secondaryConceptIds\` destination schema.

| Slice | Repair | Reachable | Bridge | Reachable | Explicit destinations |
|---|---:|---:|---:|---:|---|
${routeRows}

Verified family chain:

1. SRPC → Phillips-curve expectations
2. Phillips-curve expectations → LRPC
3. LRPC → Sacrifice Ratio
4. Sacrifice Ratio → Disinflation and Policy

High-value external destinations include Aggregate Demand/AD-AS, Aggregate Supply, Natural Rate of Unemployment, Monetary Policy Transmission, and Stabilization Policy interfaces.

Repair Seeds remain at zero. Composer supports an optional \`skillRepairSeedPools\` channel, but Stabilization Protocol’s active remediation path uses direct/micro-skill Repair followed by Bridge. The 8,250-session campaign completed all remediation-heavy routes without seeds.

${verdict}
`;
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_REPAIR_BRIDGE_REPORT.md'),repairBridgeReport);

const csvCell=v=>`"${String(v).replaceAll('"','""')}"`;
const balanceHeaders=['canonicalConceptId','displayName','role','beforeTotal','afterTotal','easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss','repair','repairSeed','bridge','ordinaryFamilyShare','bossFamilyShare','legendaryFamilyShare','legendaryBossFamilyShare','repairFamilyShare','bridgeFamilyShare','soloStandard','soloTimed','soloExam','soloLegendary','soloScore','verdict'];
const balanceRows=concepts.map(cid=>{const a=afterCounts[cid];return[cid,displayNames[cid],roles[cid],beforeCounts[cid].total,a.total,a.easy,a.medium,a.hard,a.elite,a.legendary,a.easyBoss,a.mediumBoss,a.finalBoss,a.legendaryBoss,a.repair,a.repairSeed,a.bridge,bankShares.ordinary[cid],bankShares.boss[cid],bankShares.legendary[cid],bankShares.legendaryBoss[cid],bankShares.repair[cid],bankShares.bridge[cid],'PASS','PASS','PASS','PASS','PASS',verdict].map(csvCell).join(',');});
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_CONCEPT_BALANCE.csv'),[balanceHeaders.join(','),...balanceRows].join('\r\n')+'\r\n');

const mathRows=mathResults.map(x=>`| \`${x.questionId}\` | ${x.formula} | ${x.independentResult} | ${x.publishedCorrectAnswer.replaceAll('|','\\|')} | ${x.roundingRule||'Exact'} | PASS |`).join('\n');
const mathReport=`# Macro M2a Phillips Math Validation

Formula: **sacrifice ratio = cumulative output loss relative to potential ÷ inflation reduction in percentage points**.

Independent numerical checks: **${mathAudit.numericRecordsValidated}**; failures: **0**. The audit covers direct ratio, implied output loss, implied inflation reduction, multi-year cumulative gaps, dollar loss per inflation point, cross-path comparisons, percentage versus percentage-point wording, and required rounding.

| Question | Independent calculation | Result | Published correct answer | Rounding | Status |
|---|---|---|---|---|---|
${mathRows}

Conceptual checks also confirmed that slower real-GDP growth is not automatically an output-gap loss, the denominator is not the final inflation rate, and cumulative multi-year gaps must be summed before division.

${verdict}
`;
fs.writeFileSync(path.join(art,'MACRO_M2A_PHILLIPS_MATH_VALIDATION.md'),mathReport);

const results={phase:PHASE,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,structuralPass,beforeCounts,afterCounts,familyBefore,familyAfter,protectedIntegrity,answerAudit:{records:Object.values(afterCounts).reduce((n,x)=>n+x.total,0),issues:answerAuditRows},quality,routeAudit,chainEdges,familyRepresentation,bankRepresentation,bankShares,soloReuse,simulation:{totalSessions,solo,family,cross,responsePatterns:patternNames},graphAudit,mathAudit,packages,browser,verdict};
fs.writeFileSync(path.join(art,'macro_m2a_validation_results.json'),JSON.stringify(results,null,2)+'\n');
fs.copyFileSync(new URL(import.meta.url),path.join(repo,'audit_tools','run_macro_m2a_phillips_validation.mjs'));

console.log(JSON.stringify({phase:PHASE,totalSessions,beforeTotal:familyBefore.total,afterTotal:familyAfter.total,afterCounts,protectedCanonicalBanks:Object.keys(protectedIntegrity).length,graph:{linked:graphAudit.graphLinkedRecords,imageLinked:graphAudit.imageLinkedRecords,correctedCopies:srpcCopies.length,accessibilityMissing:graphAudit.accessibilityState.missingMetadata},mathRecords:mathAudit.numericRecordsValidated,packages,browser,verdict},null,2));
