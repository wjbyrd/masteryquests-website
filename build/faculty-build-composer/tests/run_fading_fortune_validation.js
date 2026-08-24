const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const {assertCanonicalCoreVersion,writeTestArtifact}=require('./composer-test-helpers.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0) throw new Error(`missing ${name}`);
  const brace=src.indexOf('{',start); let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{') depth++;
    else if(src[i]==='}') { depth--; if(depth===0) return src.slice(start,i+1); }
  }
  throw new Error(`unterminated ${name}`);
}
function recipe(id,modes=['fadingFortune']){
  return {schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`Fading Fortune ${id}`,slug:`fading-${id}`,supportedModes:modes,selectedConceptIds:[id],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}
function runtimeDeckCheck(composition,target){
  const funcs=['getFadingFortuneCandidates','getFadingFortuneSupportedTargets','buildFadingFortuneDeck'].map(n=>extractFunction(template,n)).join('\n');
  const ctx={questionBanks:composition.banks,fadingFortuneQuestionIds:composition.fadingFortuneQuestionIds,FADING_FORTUNE_ALLOWED_TARGETS:[10,15,20],shuffle:a=>[...a].reverse(),Array,Object,String,Number,Math,Set,Boolean};
  vm.createContext(ctx); vm.runInContext(funcs,ctx);
  return {supported:Array.from(vm.runInContext('getFadingFortuneSupportedTargets()',ctx)),deck:target?Array.from(vm.runInContext(`buildFadingFortuneDeck(${target})`,ctx)):[]};
}
(async()=>{
  const issues=[];
  assertCanonicalCoreVersion(core);
  if(core.MODE_ORDER.length!==10 || core.MODE_ORDER[8]!=='fadingFortune' || core.MODE_ORDER[9]!=='riskReward') issues.push(`mode order ${JSON.stringify(core.MODE_ORDER)}`);
  if(library.canonicalQuestionCount!==8163) issues.push(`canonical count ${library.canonicalQuestionCount}`);

  const allNine=core.compose(library,recipe('perfect-competition',[...core.MODE_ORDER]));
  if(allNine.errors.length) issues.push(...allNine.errors.map(x=>`all-nine: ${x}`));
  if(allNine.validation.modes.some(m=>!m.ok)) issues.push('all-nine preflight failed');
  if(allNine.counts.fadingFortuneEligible!==383) issues.push(`perfect competition eligible ${allNine.counts.fadingFortuneEligible}`);
  if(allNine.fadingFortuneQuestionIds.length!==383 || new Set(allNine.fadingFortuneQuestionIds).size!==383) issues.push('eligible ID list mismatch/duplicates');
  const allCandidates=['easy','medium','hard','elite','legendary'].flatMap(k=>allNine.banks[k]||[]).filter(q=>allNine.fadingFortuneQuestionIds.includes(String(q.id||q.questionId||'')));
  if(allCandidates.some(q=>!Array.isArray(q.options)||q.options.length!==4)) issues.push('eligible pool contains non-four-choice question');

  const pcRuntime=runtimeDeckCheck(allNine,20);
  if(JSON.stringify(pcRuntime.supported)!==JSON.stringify([10,15,20])) issues.push(`PC supported targets ${JSON.stringify(pcRuntime.supported)}`);
  if(pcRuntime.deck.length!==20) issues.push(`PC 20 deck length ${pcRuntime.deck.length}`);
  const ids=pcRuntime.deck.map(q=>String(q.id||q.questionId||''));
  if(new Set(ids).size!==20) issues.push('20 deck duplicate IDs');
  if(pcRuntime.deck.some(q=>!Array.isArray(q.options)||q.options.length!==4)) issues.push('20 deck includes invalid option count');

  const twelve=core.compose(library,recipe('integrated-economic-analysis'));
  const twelveRun=runtimeDeckCheck(twelve,10);
  if(twelve.counts.fadingFortuneEligible!==12 || JSON.stringify(twelveRun.supported)!==JSON.stringify([10])) issues.push(`12-inventory targets ${twelve.counts.fadingFortuneEligible}/${JSON.stringify(twelveRun.supported)}`);
  const seventeen=core.compose(library,recipe('competitive-markets'));
  const seventeenRun=runtimeDeckCheck(seventeen,15);
  if(seventeen.counts.fadingFortuneEligible!==17 || JSON.stringify(seventeenRun.supported)!==JSON.stringify([10,15])) issues.push(`17-inventory targets ${seventeen.counts.fadingFortuneEligible}/${JSON.stringify(seventeenRun.supported)}`);
  const zero=core.compose(library,recipe('integrated-macroeconomic-analysis'));
  if(zero.validation.modes.find(m=>m.mode==='fadingFortune')?.ok) issues.push('zero-inventory concept incorrectly passes');
  if(!zero.errors.some(e=>String(e).includes('fadingFortuneEligible needs 10'))) issues.push('zero-inventory deficiency not surfaced');

  const config=await core.createConfig(recipe('perfect-competition'),library,await core.sha256Hex(template));
  const expectedIntervals={easy:8000,medium:10000,hard:12000,elite:15000,legendary:18000};
  if(JSON.stringify(config.fadingFortune?.intervals)!==JSON.stringify(expectedIntervals)) issues.push(`config intervals ${JSON.stringify(config.fadingFortune?.intervals)}`);
  if(JSON.stringify(config.fadingFortune?.allowedTargets)!==JSON.stringify([10,15,20])) issues.push('config targets mismatch');

  const sourceChecks={
    card:template.includes('data-mode="fadingFortune"'),
    setup:template.includes('id="fadingFortuneSetupModal"'),
    hud:template.includes('id="fadingFortuneHud"')&&template.includes('id="fadingFortuneValueDisplay"')&&template.includes('id="fadingFortuneScoreDisplay"'),
    decay:template.includes('Math.max(25, 100 - (25 * fadingFortuneFadeCount))'),
    correctProtected:template.includes("filter(index => index !== correctIndex)"),
    answerFreeze:template.includes("freezeFadingFortuneForAnswerCheck();"),
    graphPause:template.includes('pauseFadingFortune("graph-lightbox")')&&template.includes('resumeFadingFortune("graph-lightbox")'),
    visibilityPause:template.includes('pauseFadingFortune("visibility")')&&template.includes('resumeFadingFortune("visibility")'),
    modalPause:template.includes('pauseFadingFortune("game-modal")')&&template.includes('resumeFadingFortune("game-modal")'),
    rapidPause:template.includes('pauseFadingFortune("rapid-guess")')&&template.includes("resumeFadingFortune('rapid-guess')"),
    noRemediation:template.includes('gameMode !== "fadingFortune" && gameMode !== "riskReward" && currentQuestion.tag'),
    fixedCompletion:template.includes('fadingFortuneQuestionsCompleted >= fadingFortuneQuestionTarget'),
    report:template.includes('Independence Under Pressure')&&template.includes('getFadingFortuneAverageValue()'),
    telemetry:template.includes('"fadingFortuneQuestionValue"')&&template.includes('"fadingFortunePausedDurationMs"')&&template.includes('"fadingFortuneDistribution"')
  };
  Object.entries(sourceChecks).forEach(([k,v])=>{if(!v) issues.push(`missing ${k}`);});

  const result={phase:'mode9-fading-fortune-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,perfectCompetitionEligible:allNine.counts.fadingFortuneEligible,byDifficulty:allNine.counts.fadingFortuneByDifficulty,supportedTargets:{perfectCompetition:pcRuntime.supported,integratedEconomicAnalysis:twelveRun.supported,competitiveMarkets:seventeenRun.supported},allNineModes:allNine.validation.modes.map(m=>({mode:m.mode,ok:m.ok})),sourceChecks,issues};
  writeTestArtifact('fading_fortune_validation_results_4.5s.2m.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
