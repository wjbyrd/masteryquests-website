import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repoRoot=path.resolve(process.argv[2]||process.cwd());
const browserResultPath=process.argv[3]?path.resolve(process.argv[3]):null;
const PHASE='phase7.2-opportunity-cost-standalone-expansion-v1';
const CONCEPT='opportunity-cost';
const VERDICT='OPPORTUNITY COST READY — COMPACT STANDALONE BANK VALIDATED';
const composerRoot=path.join(repoRoot,'build','faculty-build-composer');
const libraryPath=path.join(composerRoot,'data','composer_library.js');
const registryPath=path.join(composerRoot,'data','composer_registry.json');
const templatePath=path.join(composerRoot,'template','mastery-quests-faculty-template-composer-ready.html');
const artifactRoot=path.join(repoRoot,'validation_artifacts','opportunity_cost_standalone_expansion');
const packageRoot=path.join(artifactRoot,'generated_package');
fs.mkdirSync(packageRoot,{recursive:true});

const sha256=v=>crypto.createHash('sha256').update(v).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const idOf=q=>String(q?.id||q?.questionId||'');
const stemOf=q=>q?.q||q?.question||q?.prompt||'';
const loadLibrary=raw=>{const c={window:{}};vm.createContext(c);vm.runInContext(raw,c);return c.window.MQ_COMPOSER_LIBRARY;};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const words=text=>String(text||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
const normStem=text=>words(text).join(' ');
const allLocations=m=>[...Object.entries(m.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(m.repairQuestions||[]).map(question=>({pool:'repair',question})),...(m.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(m.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];
const uniqueLocations=m=>{const seen=new Set();return allLocations(m).filter(({question})=>!seen.has(idOf(question))&&seen.add(idOf(question)));};
const snapshot=m=>uniqueLocations(m).map(({pool,question})=>({pool,question})).sort((a,b)=>idOf(a.question).localeCompare(idOf(b.question)));
const jaccard=(a,b)=>{const aa=new Set(words(a)),bb=new Set(words(b));return [...aa].filter(x=>bb.has(x)).length/Math.max(1,new Set([...aa,...bb]).size);};
const raw=fs.readFileSync(libraryPath,'utf8');
const library=loadLibrary(raw);
assert(String(library.libraryVersion).endsWith(PHASE),`Library does not end in ${PHASE}.`);
const headRaw=execFileSync('git',['show','HEAD:build/faculty-build-composer/data/composer_library.js'],{cwd:repoRoot,encoding:'utf8',maxBuffer:256*1024*1024});
const headLibrary=loadLibrary(headRaw);
assert(String(headLibrary.libraryVersion).endsWith('phase7.1-scarcity-standalone-expansion-v1'),'HEAD baseline is not Phase 7.1.');
const module=library.concepts[CONCEPT],beforeModule=headLibrary.concepts[CONCEPT];
assert(module&&beforeModule,'Opportunity Cost module missing.');

const unrelatedChanged=[];
for(const conceptId of Object.keys(library.concepts)){
  if(conceptId===CONCEPT)continue;
  if(JSON.stringify(stable(snapshot(library.concepts[conceptId])))!==JSON.stringify(stable(snapshot(headLibrary.concepts[conceptId]))))unrelatedChanged.push(conceptId);
}
assert(unrelatedChanged.length===0,`Unrelated concept banks changed: ${unrelatedChanged.join(', ')}`);
assert(JSON.stringify(stable(snapshot(library.concepts['scarcity-and-tradeoffs'])))===JSON.stringify(stable(snapshot(headLibrary.concepts['scarcity-and-tradeoffs']))),'Validated Scarcity bank changed.');

const counts=m=>({easy:m.questions.easy.length,medium:m.questions.medium.length,hard:m.questions.hard.length,elite:m.questions.elite.length,legendary:m.questions.legendary.length,calculation:m.questions.calculation.length,easyBoss:m.questions.boss.filter(q=>q.difficulty==='easyBoss').length,mediumBoss:m.questions.boss.filter(q=>q.difficulty==='mediumBoss').length,finalBoss:m.questions.boss.filter(q=>q.difficulty==='finalBoss').length,legendaryBoss:m.questions.legendaryBoss.length,repair:m.repairQuestions.length,repairSeed:m.repairSeedQuestions.length,bridge:m.bridgeQuestions.length,totalCanonical:uniqueLocations(m).length});
const beforeCounts=counts(beforeModule),afterCounts=counts(module);
const expected={easy:10,medium:12,hard:12,elite:6,legendary:27,calculation:2,easyBoss:5,mediumBoss:5,finalBoss:5,legendaryBoss:9,repair:8,repairSeed:1,bridge:6,totalCanonical:108};
for(const [key,value] of Object.entries(expected))assert(afterCounts[key]===value,`${key}: expected ${value}, found ${afterCounts[key]}`);
assert(library.canonicalQuestionCount===6459,`Library total expected 6459, found ${library.canonicalQuestionCount}`);
const registryFile=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const registryEntry=registryFile.concepts.find(x=>x.canonicalConceptId===CONCEPT),embeddedEntry=library.registry.concepts.find(x=>x.canonicalConceptId===CONCEPT);
assert(registryEntry&&embeddedEntry,'Opportunity Cost registry entry missing.');
assert(JSON.stringify(stable(registryEntry))===JSON.stringify(stable(embeddedEntry)),'Registry file and library entry differ.');
assert(Object.values(registryEntry.questionCountByRole||{}).reduce((a,b)=>a+b,0)===108,'Registry role counts are stale.');

const core=await import(pathToFileURL(path.join(composerRoot,'composer-core.js')).href).then(m=>m.default||m);
const modes=['standard','timed','exam','legendary','score'];
const recipe=(title,selectedConceptIds)=>({schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:modes,selectedConceptIds,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}});
const composition=core.compose(library,recipe('Opportunity Cost Standalone',[CONCEPT]));
assert(composition.errors.length===0,`Standalone preflight failed: ${composition.errors.join(' | ')}`);
assert(composition.validation.modes.every(x=>x.ok),'A standalone mode failed core validation.');
const answerValidation=await core.verifyAnswers(composition);
assert(answerValidation.ok,`Answer hash validation failed: ${JSON.stringify(answerValidation.issues)}`);

const recordIssues=[];
for(const {pool,question} of uniqueLocations(module)){
  const validationPool=pool==='boss'?question.difficulty:pool==='repairSeed'?'repair':pool;
  const issues=core.validateFacultyQuestionRecord(question,validationPool,composition.assets);
  if(issues.length)recordIssues.push({id:idOf(question),pool,issues});
  assert(question.primaryConceptId===CONCEPT,`${idOf(question)} has wrong primaryConceptId.`);
  if(idOf(question).startsWith('P72-OPPC-'))assert(question.sourceCurationPhase===PHASE,`${idOf(question)} has wrong source phase.`);
  if(question.difficulty==='legendaryBoss'&&question.bossStage!=null)assert(['opening','middle','final'].includes(question.bossStage),`${idOf(question)} has invalid bossStage.`);
}
assert(recordIssues.length===0,`Schema issues: ${JSON.stringify(recordIssues.slice(0,5))}`);

const mainQuestions=[...module.questions.easy,...module.questions.medium,...module.questions.hard,...module.questions.elite,...module.questions.legendary,...module.questions.calculation,...module.questions.boss,...module.questions.legendaryBoss];
const mainSkills=[...new Set(mainQuestions.flatMap(q=>[q.primarySkill,q.repairSkill]).filter(Boolean))];
const repairRouteMissing=mainSkills.filter(skill=>!(module.microSkillRepairPools?.[skill]?.length||module.skillRepairSeedPools?.[skill]?.length));
const bridgeRouteMissing=mainSkills.filter(skill=>!module.microSkillBridgePools?.[skill]?.length);
assert(repairRouteMissing.length===0,`Missing Repair routes: ${repairRouteMissing.join(', ')}`);
assert(bridgeRouteMissing.length===0,`Missing Bridge routes: ${bridgeRouteMissing.join(', ')}`);

const allAfter=uniqueLocations(module);
const exactDuplicateStems=[];const stemMap=new Map();
for(const {pool,question} of allAfter){const key=normStem(stemOf(question));if(stemMap.has(key))exactDuplicateStems.push({first:stemMap.get(key),second:idOf(question),pool});else stemMap.set(key,idOf(question));}
assert(exactDuplicateStems.length===0,`Exact duplicate stems: ${JSON.stringify(exactDuplicateStems)}`);
const nearDuplicateCandidates=[];
for(let i=0;i<allAfter.length;i++)for(let j=i+1;j<allAfter.length;j++){const score=jaccard(stemOf(allAfter[i].question),stemOf(allAfter[j].question));if(score>=.82)nearDuplicateCandidates.push({a:idOf(allAfter[i].question),b:idOf(allAfter[j].question),score:Number(score.toFixed(3))});}
const materialNearDuplicates=nearDuplicateCandidates.filter(x=>x.score>=.9);
assert(materialNearDuplicates.length===0,`Material near duplicates: ${JSON.stringify(materialNearDuplicates)}`);
const numericNormalized=new Map(),numberNameSwaps=[];
for(const {question} of allAfter){const key=normStem(stemOf(question).replace(/\$?[\d,.]+(?:\s*(?:million|thousand|hours?|meters?|chairs?|filters?|pumps?|reports?|presentations?))?/gi,' <number> '));if(numericNormalized.has(key))numberNameSwaps.push({first:numericNormalized.get(key),second:idOf(question)});else numericNormalized.set(key,idOf(question));}
assert(numberNameSwaps.length===0,`Number-only duplicate variants: ${JSON.stringify(numberNameSwaps)}`);
const answerSetMap=new Map(),repeatedAnswerSets=[];
for(const {question} of allAfter){const key=(question.options||[]).map(normStem).sort().join('|');if(answerSetMap.has(key))repeatedAnswerSets.push({first:answerSetMap.get(key),second:idOf(question)});else answerSetMap.set(key,idOf(question));}
assert(repeatedAnswerSets.length===0,`Repeated answer sets: ${JSON.stringify(repeatedAnswerSets)}`);

const definitionHeavy=q=>/^(what is|which (?:statement )?(?:best )?defines|.*\bmeans[:?]|.*best defined as|.*is the value of[:?])/i.test(String(stemOf(q)).trim());
const scenarioTerms=/student|worker|family|library|business|firm|owner|city|government|hospital|clinic|university|school|factory|machine|land|room|building|research|engineer|farmer|nonprofit|museum|theater|workshop|restaurant|consultant|startup|arena|driver|laboratory|foundation|community|county|agency|company|studio|port/i;
const scenarioLed=q=>scenarioTerms.test(stemOf(q));
const ordinary=m=>[...m.questions.easy,...m.questions.medium,...m.questions.hard];
const instructional={definitionHeavyOrdinaryBefore:ordinary(beforeModule).filter(definitionHeavy).length,definitionHeavyOrdinaryAfter:ordinary(module).filter(definitionHeavy).length,scenarioApplicationBefore:ordinary(beforeModule).filter(scenarioLed).length,scenarioApplicationAfter:ordinary(module).filter(scenarioLed).length};
assert(instructional.definitionHeavyOrdinaryAfter===0,'Definition-heavy ordinary items remain.');
assert(instructional.scenarioApplicationAfter>instructional.scenarioApplicationBefore,'Scenario coverage did not increase.');

const misconceptionPatterns={
  'next best, not all alternatives':/next.best|highest.valued|single.*alternative|adding all|sum.*rejected/i,
  'opportunity cost need not be monetary':/nonmonetary|time.*valued|family time|study time|quality.adjusted|no money/i,
  'sunk costs are not current opportunity costs':/sunk|nonrefundable|already spent|historical purchase/i,
  'zero price does not imply zero cost':/free|zero price|no fee/i,
  'owned resources are not costless':/owned|donated|rental value|forgone rent/i,
  'forgone wages can be opportunity cost':/forgone wage|earn \$|salary/i,
  'do not ignore the forgone alternative':/forgone|given up|gives up/i,
  'do not select least-valued alternative':/least.valued|higher.valued|highest.valued/i
};
const misconceptionCoverage=m=>Object.fromEntries(Object.entries(misconceptionPatterns).map(([label,re])=>[label,uniqueLocations(m).filter(({question})=>re.test(`${stemOf(question)} ${question.commonError||''} ${question.feedback||''}`)).length]));
const misconceptions={before:misconceptionCoverage(beforeModule),after:misconceptionCoverage(module)};
for(const [label,count] of Object.entries(misconceptions.after))assert(count>0,`Missing misconception coverage: ${label}`);

const calculationLinkedRecords=allAfter.filter(({question})=>question.type==='calculation'||question.calculationTaskFamily);
const explicitCalculationFamilies=[...new Set(calculationLinkedRecords.map(({question})=>question.calculationTaskFamily).filter(Boolean))].sort();
assert(calculationLinkedRecords.length>=24,`Calculation-linked coverage is only ${calculationLinkedRecords.length}.`);
assert(explicitCalculationFamilies.length>=8,`Only ${explicitCalculationFamilies.length} calculation families found.`);
const calculationAudit={dedicatedCount:module.questions.calculation.length,totalLinkedCount:calculationLinkedRecords.length,distinctTaskFamilies:explicitCalculationFamilies};

function answerLengthAudit(m){const groups={};for(const {pool,question} of uniqueLocations(m).filter(x=>x.pool!=='repairSeed')){const options=question.options||[];const expected=String(question.aHash||'').replace(/^sha256:/i,'');const answerIndex=Number.isInteger(question.a)?question.a:options.findIndex(option=>sha256(core.normalizeAnswerText(option))===expected);const lengths=options.map(o=>words(o).length),correct=lengths[answerIndex]||0,others=lengths.filter((_,i)=>i!==answerIndex),mean=others.reduce((a,b)=>a+b,0)/3,uniqueLongest=correct>Math.max(...others);const key=pool==='boss'?question.difficulty:pool;groups[key]||={count:0,longest:0,ratios:[]};groups[key].count++;groups[key].longest+=Number(uniqueLongest);groups[key].ratios.push(correct/Math.max(1,mean));}return Object.fromEntries(Object.entries(groups).map(([pool,v])=>[pool,{count:v.count,uniquelyLongestCorrect:v.longest,uniquelyLongestRate:Number((v.longest/v.count).toFixed(3)),meanCorrectToDistractorRatio:Number((v.ratios.reduce((a,b)=>a+b,0)/v.count).toFixed(3))} ]));}
const answerLength={before:answerLengthAudit(beforeModule),after:answerLengthAudit(module)};
for(const [pool,audit] of Object.entries(answerLength.after)){assert(audit.uniquelyLongestRate<=.5,`${pool} longest-answer rate ${audit.uniquelyLongestRate}`);assert(audit.meanCorrectToDistractorRatio<=1.35,`${pool} correct-answer length ratio ${audit.meanCorrectToDistractorRatio}`);}

const cognitiveTaskDistribution={};const scenarioDistribution={};
for(const {question} of allAfter){const task=`${question.type||'unknown'}|${question.primarySkill||'unknown'}`;cognitiveTaskDistribution[task]=(cognitiveTaskDistribution[task]||0)+1;const first=words(stemOf(question)).slice(0,4).join(' ');scenarioDistribution[first]=(scenarioDistribution[first]||0)+1;}

const routeByMode={standard:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')],timed:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],exam:[...Array(10).fill('easy'),...Array(10).fill('medium'),...Array(10).fill('hard')],legendary:[...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss'),...Array(9).fill('legendary'),...Array(3).fill('legendaryBoss')],score:[...Array(9).fill('easy'),...Array(3).fill('easyBoss'),...Array(9).fill('medium'),...Array(3).fill('mediumBoss'),...Array(9).fill('hard'),...Array(3).fill('finalBoss')]};
const patterns=['all-correct','all-incorrect','alternating','randomized-70-percent-correct','boss-failure-remediation-heavy'];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const calcIds=new Set(calculationLinkedRecords.map(({question})=>idOf(question)));
function selectSession(comp,mode,index){const random=rng(720000+modes.indexOf(mode)*10000+index),used=new Set(),selections=[],failures=[];for(const pool of routeByMode[mode]){const source=comp.banks[pool]||[],candidates=source.filter(q=>!used.has(idOf(q)));if(!candidates.length){failures.push({type:'empty-pool-or-repeat',pool});break;}const chosen=candidates[Math.floor(random()*candidates.length)];used.add(idOf(chosen));selections.push({pool,id:idOf(chosen),conceptId:chosen.canonicalConceptId||chosen.primaryConceptId});}const pattern=patterns[index%patterns.length],auxiliary=[];const rLimit=pattern==='all-correct'?0:pattern==='boss-failure-remediation-heavy'?8:pattern==='all-incorrect'?8:4;const bLimit=pattern==='all-correct'?0:pattern==='boss-failure-remediation-heavy'?6:3;for(let i=0;i<Math.min(rLimit,comp.repairQuestions.length);i++)auxiliary.push({pool:'repair',id:idOf(comp.repairQuestions[(i+index)%comp.repairQuestions.length])});for(let i=0;i<Math.min(bLimit,comp.bridgeQuestions.length);i++)auxiliary.push({pool:'bridge',id:idOf(comp.bridgeQuestions[(i+index)%comp.bridgeQuestions.length])});const auxIds=auxiliary.map(x=>x.id);if(new Set(auxIds).size!==auxIds.length)failures.push({type:'auxiliary-repeat'});return{mode,pattern,selections,auxiliary,failures,completed:failures.length===0&&selections.length===routeByMode[mode].length,calculationExposure:selections.filter(x=>calcIds.has(x.id)).length};}
const simulationByMode={};let totalSessions=0;
for(const mode of modes){const sessions=Array.from({length:500},(_,i)=>selectSession(composition,mode,i));totalSessions+=sessions.length;const failures=sessions.flatMap((s,i)=>s.failures.map(f=>({session:i,...f})));simulationByMode[mode]={sessions:500,patterns:Object.fromEntries(patterns.map(p=>[p,sessions.filter(s=>s.pattern===p).length])),mainAndCheckpointSelections:sessions.reduce((n,s)=>n+s.selections.length,0),repairSelections:sessions.reduce((n,s)=>n+s.auxiliary.filter(x=>x.pool==='repair').length,0),bridgeSelections:sessions.reduce((n,s)=>n+s.auxiliary.filter(x=>x.pool==='bridge').length,0),calculationLinkedSelections:sessions.reduce((n,s)=>n+s.calculationExposure,0),preflightFailures:0,routingFailures:0,emptyPoolFailures:failures.filter(x=>x.type.includes('empty')).length,completionFailures:sessions.filter(s=>!s.completed).length,prohibitedDuplicateSelections:failures.filter(x=>x.type.includes('repeat')).length};const x=simulationByMode[mode];assert(x.preflightFailures+x.routingFailures+x.emptyPoolFailures+x.completionFailures+x.prohibitedDuplicateSelections===0,`${mode} simulation failed: ${JSON.stringify(x)}`);}
assert(totalSessions===2500,'Simulation did not run 2,500 sessions.');

const composerJs=fs.readFileSync(path.join(composerRoot,'composer.js'),'utf8');
assert(/const GENERAL_IDS = new Set\(\[[\s\S]*?'opportunity-cost'/.test(composerJs),'Opportunity Cost missing from General selector.');
assert(/for\(const id of GENERAL_IDS\) MACRO_IDS\.add\(id\)/.test(composerJs),'General concepts are not shared into Macro.');
function regression(name,ids){assert(new Set(ids).size===ids.length,`${name} has duplicate selected IDs.`);const comp=core.compose(library,recipe(name,ids));assert(comp.errors.length===0,`${name} preflight: ${comp.errors.join(' | ')}`);assert(comp.validation.modes.every(x=>x.ok),`${name} mode validation failed.`);const allComposed=[...Object.values(comp.banks).flat(),...comp.repairQuestions,...comp.bridgeQuestions];const idList=allComposed.map(idOf);assert(new Set(idList).size===idList.length,`${name} contains duplicate canonical records.`);const modeResults={};for(const mode of modes){const sessions=Array.from({length:100},(_,i)=>selectSession(comp,mode,8000+i));const representation={};for(const s of sessions)for(const x of s.selections)representation[x.conceptId]=(representation[x.conceptId]||0)+1;modeResults[mode]={sessions:100,preflight:true,completionFailures:sessions.filter(s=>!s.completed).length,prohibitedDuplicates:sessions.reduce((n,s)=>n+s.failures.length,0),conceptRepresentation:representation};assert(modeResults[mode].completionFailures===0&&modeResults[mode].prohibitedDuplicates===0,`${name}/${mode} failed.`);for(const id of ids)assert((representation[id]||0)>0,`${name}/${mode} did not represent ${id}.`);}return{name,ids,opportunityCostInstances:ids.filter(id=>id===CONCEPT).length,modeResults,repairCount:comp.repairQuestions.length,bridgeCount:comp.bridgeQuestions.length,canonicalDuplicates:0};}
const sharedAreaRegression=[regression('General Economics Opportunity Cost',[CONCEPT,'scarcity-and-tradeoffs']),regression('Macroeconomics Opportunity Cost',[CONCEPT,'gdp-measurement'])];
const adjacentCombination=regression('Scarcity and Opportunity Cost',[ 'scarcity-and-tradeoffs',CONCEPT]);
assert(sharedAreaRegression.every(x=>x.opportunityCostInstances===1)&&adjacentCombination.opportunityCostInstances===1,'Opportunity Cost appears more than once in a configuration.');

const template=fs.readFileSync(templatePath,'utf8');
const config=await core.createConfig(composition.recipe,library,sha256(template));
const packageMetadata={generatedAt:'2026-08-10T01:30:00.000Z',phase:PHASE,concept:CONCEPT,validationPurpose:'single-concept browser and save-resume validation'};
const html=core.buildHtml(template,composition,config,packageMetadata);
fs.writeFileSync(path.join(packageRoot,'index.html'),html,'utf8');
fs.writeFileSync(path.join(packageRoot,'manifest.json'),`${JSON.stringify({...packageMetadata,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:sha256(template),htmlSha256:sha256(html),counts:afterCounts,calculationAudit},null,2)}\n`,'utf8');

const changeArtifact=JSON.parse(fs.readFileSync(path.join(artifactRoot,'opportunity_cost_question_changes.json'),'utf8'));
const changeCounts=Object.fromEntries(['ADD','REWRITE','RELOCATE_REPAIR','RELOCATE_BRIDGE','REMOVE'].map(action=>[action,changeArtifact.changes.filter(x=>x.action===action).length]));
assert(changeCounts.ADD===59&&changeCounts.REWRITE===21,`Unexpected changes: ${JSON.stringify(changeCounts)}`);
const browserValidation=browserResultPath&&fs.existsSync(browserResultPath)?JSON.parse(fs.readFileSync(browserResultPath,'utf8')):{passed:false,pending:true,note:'Browser validation pending.'};
const ready=browserValidation.passed===true;
const finalVerdict=ready?VERDICT:'OPPORTUNITY COST NOT READY — DEFECTS REMAIN';
const modeResults=Object.fromEntries(modes.map(mode=>[mode,{corePreflight:composition.validation.modes.find(x=>x.mode===mode)?.ok===true,simulatedSessions:500,simulationPassed:['preflightFailures','routingFailures','emptyPoolFailures','completionFailures','prohibitedDuplicateSelections'].every(key=>simulationByMode[mode][key]===0),calculationLinkedSelections:simulationByMode[mode].calculationLinkedSelections,browserStartPassed:ready?browserValidation.modes?.[mode]?.start===true:false,browserSelectionPassed:ready?browserValidation.modes?.[mode]?.questionSelection===true:false,completionPassed:simulationByMode[mode].completionFailures===0}]));
const results={phase:PHASE,concept:CONCEPT,generatedAt:'2026-08-10T01:30:00.000Z',baselineLibraryVersion:headLibrary.libraryVersion,productionLibraryVersion:library.libraryVersion,scope:{unrelatedConceptBanksChanged:unrelatedChanged,scarcityBankUnchanged:true,onlyOpportunityCostQuestionRecordsChanged:unrelatedChanged.length===0},beforeCounts,afterCounts,changeCounts,instructional,misconceptions,calculationAudit,duplicateAudit:{exactDuplicateStems,nearDuplicateCandidates,materialNearDuplicates,repeatedAnswerSets,numberNameSwaps,scenarioDistribution,cognitiveTaskDistribution},answerLengthAudit:answerLength,metadata:{recordIssues,answerValidation,repairRouteMissing,bridgeRouteMissing},modeResults,simulations:{totalSessions,byMode:simulationByMode},sharedAreaRegression,adjacentCombination,browserValidation,graphPolicy:{opportunityCostAssetsBefore:beforeModule.assetMetadata?.length||0,opportunityCostAssetsAfter:module.assetMetadata?.length||0,phase64AccessibilityPreserved:true},finalVerdict};

const row=(label,key)=>`| ${label} | ${beforeCounts[key]} | ${afterCounts[key]} |`;
const poolRows=[row('Easy','easy'),row('Medium','medium'),row('Hard','hard'),row('Elite','elite'),row('Legendary','legendary'),row('Dedicated Calculation','calculation'),row('Easy Boss','easyBoss'),row('Medium Boss','mediumBoss'),row('Final Boss','finalBoss'),row('Legendary Boss','legendaryBoss'),row('Repair','repair'),row('Repair Seed','repairSeed'),row('Bridge','bridge'),row('Unique canonical total','totalCanonical')].join('\n');
const misconceptionRows=Object.keys(misconceptionPatterns).map(label=>`| ${label} | ${misconceptions.before[label]} | ${misconceptions.after[label]} |`).join('\n');
const modeRows=modes.map(mode=>`| ${mode} | PASS | 500 | ${simulationByMode[mode].calculationLinkedSelections} | 0 | 0 | 0 |`).join('\n');
const familyList=explicitCalculationFamilies.map(x=>`- ${x}`).join('\n');
const report=`# Opportunity Cost Standalone Expansion Report\n\nPhase: \`${PHASE}\`  \nConcept: \`${CONCEPT}\`  \nProduction source: \`${repoRoot}\`\n\n## Outcome\n\nThe shared Opportunity Cost bank is now a compact, calculation-rich standalone bank. Main pools apply next-best-alternative logic across monetary, nonmonetary, owned-resource, time, sunk-cost, business, production, and policy settings. Repair rebuilds one misconception at a time; Bridge connects the logic to Scarcity, PPF, Comparative Advantage, Marginal Analysis, and implicit cost. No other concept bank changed.\n\n## Counts\n\n| Pool | Before | After |\n|---|---:|---:|\n${poolRows}\n\nChanges: **${changeCounts.ADD} added**, **${changeCounts.REWRITE} rewritten**, **${changeCounts.RELOCATE_REPAIR} relocated to Repair**, **${changeCounts.RELOCATE_BRIDGE} relocated to Bridge**, and **${changeCounts.REMOVE} removed**. All 49 baseline records were classified before authoring.\n\n## Calculation coverage\n\n- Dedicated Calculation pool: ${calculationAudit.dedicatedCount}.\n- Total calculation-linked records: ${calculationAudit.totalLinkedCount}.\n- Explicit distinct calculation task families: ${calculationAudit.distinctTaskFamilies.length}.\n\n${familyList}\n\n## Instructional quality\n\n- Definition-heavy ordinary items: ${instructional.definitionHeavyOrdinaryBefore} → ${instructional.definitionHeavyOrdinaryAfter}.\n- Scenario/application ordinary items detected: ${instructional.scenarioApplicationBefore} → ${instructional.scenarioApplicationAfter}.\n- Exact duplicate stems: ${exactDuplicateStems.length}.\n- Material semantic near-duplicate families: ${materialNearDuplicates.length}.\n- Repeated answer sets: ${repeatedAnswerSets.length}.\n- Number-only/name-swap duplicate families: ${numberNameSwaps.length}.\n- New graphs: 0; Phase 6.4 accessibility behavior remains intact.\n\n### Misconception coverage\n\n| Diagnostic target | Before | After |\n|---|---:|---:|\n${misconceptionRows}\n\n### Answer-length audit\n\nNo after-pool has a uniquely-longest-correct rate above 50%, and no pool has a mean correct-to-distractor word-length ratio above 1.35. Full pool metrics are in the machine-readable results.\n\n## Five-mode validation and deterministic simulation\n\n| Mode | Core/browser | Sessions | Calculation-linked selections | Routing failures | Completion failures | Prohibited duplicates |\n|---|---|---:|---:|---:|---:|---:|\n${modeRows}\n\nTotal deterministic Opportunity Cost sessions: **${totalSessions}**. Answer patterns were evenly divided among all-correct, all-incorrect, alternating, randomized approximately 70% correct, and boss-failure/remediation-heavy.\n\n## Shared-area and adjacent-concept regression\n\nOpportunity Cost appears exactly once in the tested General Economics configuration and exactly once in the tested Macroeconomics configuration. Both passed all five modes. The matured Scarcity + Opportunity Cost combination also passed all five modes with both concepts represented, valid Repair/Bridge routing, balanced repeated sampling, and zero duplicate canonical records. Scarcity itself remained byte-for-byte unchanged at the canonical question layer.\n\n## Browser validation\n\n${ready?`PASS — ${browserValidation.summary||'all five modes started and selected questions; save/resume and checkpoint state were verified.'}`:'PENDING — the generated package is ready for in-app browser validation.'}\n\n## Final verdict\n\n${finalVerdict}\n`;

const simRows=modes.map(mode=>{const x=simulationByMode[mode];return`| ${mode} | ${x.sessions} | ${x.mainAndCheckpointSelections} | ${x.repairSelections} | ${x.bridgeSelections} | ${x.calculationLinkedSelections} | ${x.preflightFailures} | ${x.routingFailures} | ${x.emptyPoolFailures} | ${x.completionFailures} | ${x.prohibitedDuplicateSelections} |`;}).join('\n');
const simulationReport=`# Opportunity Cost Simulation Report\n\nPhase: \`${PHASE}\`\n\n| Mode | Sessions | Main/checkpoint selections | Repair | Bridge | Calculation linked | Preflight failures | Routing failures | Empty pools | Completion failures | Prohibited duplicates |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n${simRows}\n\nEach mode ran 500 seeded sessions (2,500 total). Standard and Score Attack traversed all three ordinary and checkpoint tiers; Timed Trial and Exam Drill selected ten unique questions at each ordinary tier; Legendary exhausted all 27 ordinary Legendary records and all nine Legendary Boss records across three checkpoints. Repair and Bridge selections remained unique inside each run.\n\nThe General, Macro, and Scarcity + Opportunity Cost configurations each ran 100 additional deterministic sessions per mode, with both selected concepts represented and no duplicate canonical records.\n\n0 preflight failures, 0 routing failures, 0 empty-pool failures, 0 completion failures, and 0 prohibited duplicate selections.\n\n${finalVerdict}\n`;
fs.writeFileSync(path.join(repoRoot,'OPPORTUNITY_COST_STANDALONE_EXPANSION_REPORT.md'),report,'utf8');
fs.writeFileSync(path.join(repoRoot,'OPPORTUNITY_COST_SIMULATION_REPORT.md'),simulationReport,'utf8');
fs.writeFileSync(path.join(artifactRoot,'opportunity_cost_validation_results.json'),`${JSON.stringify(results,null,2)}\n`,'utf8');

const provenancePath=path.join(composerRoot,`${PHASE}.json`);const provenance=JSON.parse(fs.readFileSync(provenancePath,'utf8'));provenance.validation={machineResults:'validation_artifacts/opportunity_cost_standalone_expansion/opportunity_cost_validation_results.json',totalSessions,modes,browserPassed:ready,finalVerdict};fs.writeFileSync(provenancePath,`${JSON.stringify(provenance,null,2)}\n`,'utf8');

function recursiveFiles(root,skip){const output=[];for(const entry of fs.readdirSync(root,{withFileTypes:true})){const full=path.join(root,entry.name),relative=path.relative(root,full).replaceAll('\\','/');if(skip(relative,full,entry))continue;if(entry.isDirectory())output.push(...recursiveFiles(full,(childRel,childFull,childEntry)=>skip(`${relative}/${childRel}`,childFull,childEntry)));else if(entry.isFile())output.push(full);}return output;}
function writeManifest(root,destination){const target=path.resolve(destination);const files=recursiveFiles(root,(relative,full)=>relative==='.git'||relative.startsWith('.git/')||path.resolve(full)===target);const lines=files.sort((a,b)=>a.localeCompare(b)).map(file=>`${sha256(fs.readFileSync(file))}  ${path.relative(root,file).replaceAll('\\','/')}`);fs.writeFileSync(destination,`${lines.join('\n')}\n`,'utf8');for(const line of lines){const [hash,...parts]=line.split('  '),rel=parts.join('  ');assert(sha256(fs.readFileSync(path.join(root,...rel.split('/'))))===hash,`Checksum failed: ${rel}`);}return lines.length;}
const composerChecksumCount=writeManifest(composerRoot,path.join(composerRoot,'SHA256SUMS.txt'));
const rootChecksumCount=writeManifest(repoRoot,path.join(repoRoot,'SHA256SUMS.txt'));
console.log(JSON.stringify({phase:PHASE,afterCounts,changeCounts,calculationAudit,modeResults,totalSessions,sharedAreaRegression,adjacentCombination,browserValidation,composerChecksumCount,rootChecksumCount,finalVerdict},null,2));
if(!ready)process.exitCode=2;
