const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`); if(start<0) throw new Error(`missing ${name}`);
  const brace=src.indexOf('{',start); let depth=0;
  for(let i=brace;i<src.length;i++){ if(src[i]==='{') depth++; else if(src[i]==='}') {depth--; if(depth===0) return src.slice(start,i+1);} }
  throw new Error(`unterminated ${name}`);
}
function recipe(id,modes=['riskReward']){return {schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`Risk Reward ${id}`,slug:`risk-${id}`,supportedModes:modes,selectedConceptIds:[id],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
function runtimeDeckCheck(composition,target){
  const funcs=['getRiskRewardCandidates','getRiskRewardSupportedTargets','buildRiskRewardDeck'].map(n=>extractFunction(template,n)).join('\n');
  const ctx={questionBanks:composition.banks,riskRewardQuestionIds:composition.riskRewardQuestionIds,RISK_REWARD_ALLOWED_TARGETS:[10,15,20],shuffle:a=>[...a].reverse(),Array,Object,String,Number,Math,Set,Boolean};
  vm.createContext(ctx); vm.runInContext(funcs,ctx);
  return {supported:Array.from(vm.runInContext('getRiskRewardSupportedTargets()',ctx)),deck:target?Array.from(vm.runInContext(`buildRiskRewardDeck(${target})`,ctx)):[]};
}
(async()=>{
 const issues=[];
 if(core.COMPOSER_VERSION!=='4.5s.2m') issues.push(`composer version ${core.COMPOSER_VERSION}`);
 if(core.MODE_ORDER.length!==10 || core.MODE_ORDER[9]!=='riskReward') issues.push(`mode order ${JSON.stringify(core.MODE_ORDER)}`);
 if(library.canonicalQuestionCount!==8163) issues.push(`canonical count ${library.canonicalQuestionCount}`);
 const allTen=core.compose(library,recipe('perfect-competition',[...core.MODE_ORDER]));
 if(allTen.errors.length) issues.push(...allTen.errors.map(x=>`all-ten: ${x}`));
 if(allTen.validation.modes.some(m=>!m.ok)) issues.push('all-ten preflight failed');
 if(allTen.counts.riskRewardEligible!==383) issues.push(`perfect competition eligible ${allTen.counts.riskRewardEligible}`);
 if(allTen.riskRewardQuestionIds.length!==383 || new Set(allTen.riskRewardQuestionIds).size!==383) issues.push('eligible ID list mismatch/duplicates');
 const pcRuntime=runtimeDeckCheck(allTen,20);
 if(JSON.stringify(pcRuntime.supported)!==JSON.stringify([10,15,20])) issues.push(`PC supported targets ${JSON.stringify(pcRuntime.supported)}`);
 if(pcRuntime.deck.length!==20) issues.push(`PC 20 deck length ${pcRuntime.deck.length}`);
 if(new Set(pcRuntime.deck.map(q=>String(q.id||q.questionId||''))).size!==20) issues.push('20 deck duplicate IDs');
 const twelve=core.compose(library,recipe('integrated-economic-analysis'));
 const twelveRun=runtimeDeckCheck(twelve,10);
 if(twelve.counts.riskRewardEligible!==12 || JSON.stringify(twelveRun.supported)!==JSON.stringify([10])) issues.push(`12-inventory targets ${twelve.counts.riskRewardEligible}/${JSON.stringify(twelveRun.supported)}`);
 const seventeen=core.compose(library,recipe('competitive-markets'));
 const seventeenRun=runtimeDeckCheck(seventeen,15);
 if(seventeen.counts.riskRewardEligible!==17 || JSON.stringify(seventeenRun.supported)!==JSON.stringify([10,15])) issues.push(`17-inventory targets ${seventeen.counts.riskRewardEligible}/${JSON.stringify(seventeenRun.supported)}`);
 const zero=core.compose(library,recipe('integrated-macroeconomic-analysis'));
 if(zero.validation.modes.find(m=>m.mode==='riskReward')?.ok) issues.push('zero-inventory concept incorrectly passes');
 const config=await core.createConfig(recipe('perfect-competition'),library,await core.sha256Hex(template));
 if(config.riskReward?.startingBankroll!==1000) issues.push(`starting bankroll ${config.riskReward?.startingBankroll}`);
 const options=config.riskReward?.wagerOptions||[];
 if(JSON.stringify(options.map(o=>o.ratio))!==JSON.stringify([0.10,0.25,0.50,1.00])) issues.push(`wager ratios ${JSON.stringify(options)}`);
 if(JSON.stringify(config.riskReward?.allowedTargets)!==JSON.stringify([10,15,20])) issues.push('config targets mismatch');
 const sourceChecks={
   card:template.includes('data-mode="riskReward"'),
   setup:template.includes('id="riskRewardSetupModal"'),
   hud:template.includes('id="riskRewardHud"')&&template.includes('id="riskRewardBankrollDisplay"')&&template.includes('id="riskRewardWagerDisplay"'),
   hiddenUntilWager:template.includes('showRiskRewardWagerPrompt();')&&template.includes('renderRiskRewardQuestion();'),
   settlementGuard:template.includes('riskRewardWagerSettled = true;')&&template.includes('if(!modeUsesRiskReward() || !riskRewardWagerLocked || riskRewardWagerSettled) return null;'),
   allInBust:template.includes('riskRewardBankroll = Math.max(0, riskRewardBankroll - wager);')&&template.includes('riskRewardBusted = riskRewardBankroll <= 0;'),
   noRemediation:template.includes('gameMode !== "riskReward" && currentQuestion.tag'),
   fixedCompletion:template.includes('riskRewardQuestionsCompleted >= riskRewardQuestionTarget'),
   mastery:template.includes('Risk & Confidence')&&template.includes('getRiskRewardReportData()'),
   telemetry:template.includes('riskRewardWagerAmount')&&template.includes('riskRewardBankrollAfter')&&template.includes('riskRewardWagerDistribution'),
   bustedResult:template.includes('BANKROLL LOST'),
   replay:template.includes('Play Risk & Reward Again')
 };
 Object.entries(sourceChecks).forEach(([k,v])=>{if(!v) issues.push(`missing ${k}`);});
 const result={phase:'mode10-risk-reward-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,perfectCompetitionEligible:allTen.counts.riskRewardEligible,byDifficulty:allTen.counts.riskRewardByDifficulty,supportedTargets:{perfectCompetition:pcRuntime.supported,integratedEconomicAnalysis:twelveRun.supported,competitiveMarkets:seventeenRun.supported},allTenModes:allTen.validation.modes.map(m=>({mode:m.mode,ok:m.ok})),configRiskReward:config.riskReward,sourceChecks,issues};
 fs.writeFileSync(path.join(root,'risk_reward_validation_results_4.5s.2m.json'),JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2)); if(!result.ok) process.exit(1);
})();
