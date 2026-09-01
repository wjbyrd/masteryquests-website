const fs=require('fs');
const path=require('path');
const vm=require('vm');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const {attachConceptReviewRuntime,assertCanonicalCoreVersion,assertGeneratedComposerVersion,writeTestArtifact}=require('./composer-test-helpers.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0) throw new Error(`missing ${name}`);
  const brace=src.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{') depth++;
    else if(src[i]==='}'){
      depth--;
      if(depth===0) return src.slice(start,i+1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

function recipe(id,modes=['trialGraph']){
  const ids=Array.isArray(id)?id:[id];
  return {schemaVersion:core.RECIPE_SCHEMA_VERSION,title:`Trial Graph ${ids.join(' ')}`,slug:`trial-graph-${ids.join('-')}`,supportedModes:modes,selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}

function exactCasePathExists(rootPath,relativePath){
  let current=rootPath;
  for(const segment of String(relativePath||'').replaceAll('\\','/').split('/').filter(Boolean)){
    if(!fs.existsSync(current)) return false;
    const exact=fs.readdirSync(current).find(name=>name===segment);
    if(!exact) return false;
    current=path.join(current,exact);
  }
  return true;
}

function embedQuestionAssets(composition,{omitRuntimePath=''}={}){
  const embedded={};
  const issues=[];
  for(const asset of composition.assets||[]){
    const runtimePath=String(asset.runtimePath||'');
    const filePath=path.join(root,'data',runtimePath);
    if(!runtimePath||!exactCasePathExists(path.join(root,'data'),runtimePath)){
      issues.push(`${runtimePath||'(missing path)'} has missing or case-mismatched source`);
      continue;
    }
    const bytes=fs.readFileSync(filePath);
    const actual=crypto.createHash('sha256').update(bytes).digest('hex');
    if(actual!==asset.sha256) issues.push(`${runtimePath} hash mismatch`);
    if(bytes.length!==asset.sizeBytes) issues.push(`${runtimePath} size mismatch`);
    if(runtimePath!==omitRuntimePath) embedded[runtimePath]=`data:image/webp;base64,${bytes.toString('base64')}`;
  }
  if(issues.length) throw new Error(issues.join(' | '));
  composition.embeddedQuestionAssets=embedded;
  return embedded;
}

function runtimeDeckCheck(composition,target){
  const funcs=['getTrialGraphCandidates','getTrialGraphSupportedTargets','buildTrialGraphDeck'].map(n=>extractFunction(template,n)).join('\n');
  const ctx={
    questionBanks:composition.banks,
    trialGraphQuestionIds:composition.trialGraphQuestionIds,
    TRIAL_GRAPH_ALLOWED_TARGETS:[10,15,20],
    shuffle(arr){return [...arr].reverse();},
    Array,Object,String,Number,Math,Set,Boolean
  };
  vm.createContext(ctx);
  vm.runInContext(funcs,ctx);
  const supported=vm.runInContext('getTrialGraphSupportedTargets()',ctx);
  const deck=target ? vm.runInContext(`buildTrialGraphDeck(${target})`,ctx) : [];
  return {supported:Array.from(supported),deck:Array.from(deck)};
}

(async()=>{
  const issues=[];
  assertCanonicalCoreVersion(core);
  if(core.MODE_ORDER.length!==10 || core.MODE_ORDER[7]!=='trialGraph' || core.MODE_ORDER[8]!=='fadingFortune' || core.MODE_ORDER[9]!=='riskReward') issues.push(`mode order ${JSON.stringify(core.MODE_ORDER)}`);
  if(library.canonicalQuestionCount!==9539) issues.push(`canonical count ${library.canonicalQuestionCount}`);

  const auditIds=new Set();
  for(const fn of ['MICRO_GRAPH_QUESTIONS_AUDIT_CORRECTED.json','TODAYS_GRAPH_QUESTIONS_AUDIT_CORRECTED_V2.json']){
    for(const r of JSON.parse(fs.readFileSync(path.join(root,fn),'utf8'))) auditIds.add(String(r.id));
  }
  const phase3eIds=new Set(Array.from({length:48},(_,index)=>String(40000+index)));
  const externalitiesIds=new Set(Array.from({length:104},(_,index)=>String(42000+index)));
  const publicGoodsIds=new Set(Array.from({length:48},(_,index)=>String(42160+index)));
  const factorMarketIds=new Set(Array.from({length:64},(_,index)=>String(42320+index)));
  const consumerChoiceIds=new Set(Array.from({length:46},(_,index)=>String(42560+index)));
  const inequalityIds=new Set(Array.from({length:42},(_,index)=>String(42720+index)));
  const savingInvestmentIds=new Set([
    'saving-and-investment-identities',
    'loanable-funds-equilibrium',
    'loanable-funds-shifts',
    'crowding-out-and-capital-formation'
  ].flatMap(conceptId=>Object.values(library.concepts[conceptId]?.questions||{}).flat()).map(q=>String(q.canonicalId||q.id)));
  const qualityAuthorization=JSON.parse(fs.readFileSync(path.resolve(root,'..','..','validation_artifacts','question_quality','supply_demand_equilibrium_audit_authorization.json'),'utf8'));
  const qualityGraphIds=new Set(qualityAuthorization.changes.filter(change=>change.rules.includes('image-without-graph-required')).map(change=>String(change.id)));
  const foundationsAuthorization=JSON.parse(fs.readFileSync(path.resolve(root,'..','..','validation_artifacts','question_quality','foundations_audit_authorization.json'),'utf8'));
  const foundationsGraphIds=new Set(foundationsAuthorization.changes.filter(change=>change.rules.includes('image-without-graph-required')).map(change=>String(change.id)));
  let flagged=0, flaggedOutsideAudit=0, flaggedWithoutImage=0;
  for(const module of Object.values(library.concepts)){
    for(const items of Object.values(module.questions||{})){
      if(!Array.isArray(items)) continue;
      for(const q of items){
        if(q.graphRequired===true){
          flagged++;
          const id=String(q.canonicalId||q.id||q.questionId||'');
          if(!auditIds.has(id) && !phase3eIds.has(id) && !externalitiesIds.has(id) && !publicGoodsIds.has(id) && !factorMarketIds.has(id) && !consumerChoiceIds.has(id) && !inequalityIds.has(id) && !savingInvestmentIds.has(id) && !qualityGraphIds.has(id) && !foundationsGraphIds.has(id)) flaggedOutsideAudit++;
          if(!q.image) flaggedWithoutImage++;
        }
      }
    }
  }
  if(auditIds.size!==612) issues.push(`audit id count ${auditIds.size}`);
  if(qualityGraphIds.size!==23) issues.push(`quality remediation graph id count ${qualityGraphIds.size}`);
  if(foundationsGraphIds.size!==23) issues.push(`foundations remediation graph id count ${foundationsGraphIds.size}`);
  if(flagged!==1055) issues.push(`graphRequired count ${flagged}`);
  if(flaggedOutsideAudit) issues.push(`flags outside audited set ${flaggedOutsideAudit}`);
  if(flaggedWithoutImage) issues.push(`flags without image ${flaggedWithoutImage}`);

  const allEight=core.compose(library,recipe('perfect-competition',[...core.MODE_ORDER]));
  if(allEight.errors.length) issues.push(...allEight.errors.map(x=>`all-eight: ${x}`));
  if(allEight.validation.modes.some(m=>!m.ok)) issues.push('all-eight preflight failed');
  if(allEight.counts.graphSafe!==76) issues.push(`perfect competition graphSafe ${allEight.counts.graphSafe}`);
  const trialValidation=allEight.validation.modes.find(m=>m.mode==='trialGraph');
  if(!trialValidation?.ok) issues.push('trialGraph validation failed');
  if(trialValidation?.requirements?.length!==1 || trialValidation.requirements[0].pool!=='graphSafe' || trialValidation.requirements[0].minimum!==10) issues.push('trialGraph requirement mismatch');
  if(allEight.trialGraphQuestionIds.length!==allEight.counts.graphSafe) issues.push('trialGraph ID count mismatch');

  const deck20=runtimeDeckCheck(allEight,20);
  if(JSON.stringify(deck20.supported)!==JSON.stringify([10,15,20])) issues.push(`20-capable targets ${JSON.stringify(deck20.supported)}`);
  if(deck20.deck.length!==20) issues.push(`20 deck length ${deck20.deck.length}`);
  const deckIds=deck20.deck.map(q=>String(q.id||q.questionId||''));
  if(new Set(deckIds).size!==20) issues.push('20 deck duplicate IDs');
  if(deck20.deck.some(q=>q.graphRequired!==true || !q.image)) issues.push('20 deck contains non-graph-safe question');
  const difficultyOrder={easy:0,medium:1,hard:2,elite:3,legendary:4};
  for(let i=1;i<deck20.deck.length;i++){
    if(difficultyOrder[deck20.deck[i-1].__mqDifficulty]>difficultyOrder[deck20.deck[i].__mqDifficulty]) issues.push('deck difficulty order regressed');
  }

  const demand=core.compose(library,recipe('demand'));
  const demandRuntime=runtimeDeckCheck(demand,15);
  if(demand.counts.graphSafe!==25) issues.push(`demand graphSafe ${demand.counts.graphSafe}`);
  if(JSON.stringify(demandRuntime.supported)!==JSON.stringify([10,15,20])) issues.push(`25-inventory targets ${JSON.stringify(demandRuntime.supported)}`);
  if(demandRuntime.deck.length!==15) issues.push('15 deck failed');

  const ad=core.compose(library,recipe('aggregate-demand'));
  const adRuntime=runtimeDeckCheck(ad,10);
  if(ad.counts.graphSafe!==12) issues.push(`aggregate demand graphSafe ${ad.counts.graphSafe}`);
  if(JSON.stringify(adRuntime.supported)!==JSON.stringify([10])) issues.push(`12-inventory targets ${JSON.stringify(adRuntime.supported)}`);

  const noGraph=core.compose(library,recipe('bank-money-creation'));
  const noGraphValidation=noGraph.validation.modes.find(m=>m.mode==='trialGraph');
  if(noGraphValidation?.ok) issues.push('zero-graph concept incorrectly passes');
  if(!noGraph.errors.some(e=>String(e).includes('graphSafe needs 10'))) issues.push('zero-graph deficiency not surfaced');

  const representativeConcepts=['demand','supply','market-equilibrium','production-possibilities-frontier'];
  const representativeRecipe=recipe(representativeConcepts);
  const trialOnly=core.compose(library,representativeRecipe);
  const config=await core.createConfig(representativeRecipe,library,await core.sha256Hex(template));
  const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:trialOnly.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:config.templateSha256};
  const brokenGeneratedValidation=core.validateGeneratedGraphAssets(trialOnly);
  if(brokenGeneratedValidation.ok||!brokenGeneratedValidation.issues.some(issue=>issue.issue.includes('not embedded'))) issues.push('broken generated graph was not rejected');
  const omittedPath='question-assets/market-equilibrium/DEMAND-SUPPLY-03.webp';
  embedQuestionAssets(trialOnly,{omitRuntimePath:omittedPath});
  const omittedGeneratedValidation=core.validateGeneratedGraphAssets(trialOnly);
  if(omittedGeneratedValidation.ok||!omittedGeneratedValidation.issues.some(issue=>issue.image===omittedPath)) issues.push('selectively omitted generated graph was not rejected');
  const embeddedAssets=embedQuestionAssets(trialOnly);
  const validGeneratedValidation=core.validateGeneratedGraphAssets(trialOnly);
  if(!validGeneratedValidation.ok) issues.push(...validGeneratedValidation.issues.map(issue=>`generated graph: ${issue.id} ${issue.issue}`));
  for(const id of ['40006','PG1-DMD-L-002','40020']) if(!trialOnly.trialGraphQuestionIds.map(String).includes(id)) issues.push(`representative Trial output omitted ${id}`);
  attachConceptReviewRuntime(core,trialOnly,library,config.selectedConceptIds);
  const html=core.buildHtml(template,trialOnly,config,metadata);
  assertGeneratedComposerVersion(html);
  writeTestArtifact('tests/trial-by-graph-only.html',html);
  const smokeIds=['40006','PG1-DMD-L-002','40020','40000','PG1-DMD-E-001','PG1-SUP-E-001','PG1-EQ-E-001','40003','40009','40018'];
  const smoke=structuredClone(trialOnly);
  for(const [pool,questions] of Object.entries(smoke.banks||{})) smoke.banks[pool]=(questions||[]).filter(question=>smokeIds.includes(String(question.id||question.canonicalId)));
  smoke.challengeQuestionBanks={easyBoss:[],mediumBoss:[],finalBoss:[],legendaryBoss:[]};
  smoke.repairQuestions=[];
  smoke.bridgeQuestions=[];
  smoke.skillRepairSeedPools={};
  smoke.trialGraphQuestionIds=[...smokeIds];
  const usedSmokePaths=new Set(Object.values(smoke.banks).flat().map(question=>question.image).filter(Boolean));
  smoke.assets=smoke.assets.filter(asset=>usedSmokePaths.has(asset.runtimePath));
  smoke.embeddedQuestionAssets=Object.fromEntries(Object.entries(smoke.embeddedQuestionAssets).filter(([runtimePath])=>usedSmokePaths.has(runtimePath)));
  const smokeGeneratedValidation=core.validateGeneratedGraphAssets(smoke);
  if(!smokeGeneratedValidation.ok) issues.push(...smokeGeneratedValidation.issues.map(issue=>`smoke graph: ${issue.id} ${issue.issue}`));
  const smokeHtml=core.buildHtml(template,smoke,config,{...metadata,phase:'graph-assessment-integrity-smoke'});
  assertGeneratedComposerVersion(smokeHtml);
  writeTestArtifact('tests/graph-assessment-integrity-smoke.html',smokeHtml);
  const checks={
    card:html.includes('data-mode="trialGraph"'),
    setup:html.includes('id="trialGraphSetupModal"'),
    targets:html.includes('data-trial-graph-count="10"')&&html.includes('data-trial-graph-count="15"')&&html.includes('data-trial-graph-count="20"'),
    injectedIds:html.includes(`const trialGraphQuestionIds = ${JSON.stringify(trialOnly.trialGraphQuestionIds,null,2)}`),
    fixedCompletion:html.includes('trialGraphQuestionsCompleted >= trialGraphQuestionTarget'),
    noRemediation:/function remediationTransitionAllowed\(question\)[\s\S]*?gameMode !== "trialGraph"/.test(html)&&html.includes('if (remediationTransitionAllowed(currentQuestion) && shouldTriggerDetour(currentQuestion))'),
    noBosses:html.includes('gameMode === "timed" || gameMode === "quiz" || gameMode === "trialGraph" || gameMode === "fadingFortune" || gameMode === "riskReward" || gameMode === "unlimited"'),
    resultCount:html.includes('Graph Questions: ${trialGraphQuestionTarget}'),
    mastery:html.includes('if(gameMode === "trialGraph") return "Trial by Graph";'),
    configOnly:config.supportedModes.length===1&&config.supportedModes[0]==='trialGraph',
    embeddedMovieTicket:Boolean(embeddedAssets[omittedPath])&&html.includes(`"${omittedPath}": "data:image/webp;base64,`),
    embeddedTwoStage:Boolean(embeddedAssets['question-assets/demand/DEMAND-02.webp'])&&html.includes('"question-assets/demand/DEMAND-02.webp": "data:image/webp;base64,'),
    embeddedFourIntersection:Boolean(embeddedAssets['question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp'])&&html.includes('"question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp": "data:image/webp;base64,'),
    runtimeGraphFailureDefense:html.includes('Required graph failed to load.')&&html.includes('questionGraphLoadFailed')&&html.includes('setAnswerButtonsDisabled(true)')
  };
  Object.entries(checks).forEach(([k,v])=>{if(!v)issues.push(`missing ${k}`);});

  const result={
    phase:'mode8-trial-by-graph-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,
    canonicalQuestionCount:library.canonicalQuestionCount,auditedIds:auditIds.size,graphRequiredFlagged:flagged,
    examples:{perfectCompetition:allEight.counts.graphSafe,demand:demand.counts.graphSafe,aggregateDemand:ad.counts.graphSafe,bankMoneyCreation:noGraph.counts.graphSafe},
    generatedGraphIntegrity:{brokenRejected:!brokenGeneratedValidation.ok,omittedRejected:!omittedGeneratedValidation.ok,validAccepted:validGeneratedValidation.ok,representativeConcepts,graphQuestions:validGeneratedValidation.questionCount,assets:validGeneratedValidation.assetCount,smokeQuestions:smokeGeneratedValidation.questionCount,smokeAssets:smokeGeneratedValidation.assetCount,smokeIds},
    supportedTargets:{perfectCompetition:deck20.supported,demand:demandRuntime.supported,aggregateDemand:adRuntime.supported},
    allEightModes:allEight.validation.modes.map(m=>({mode:m.mode,ok:m.ok})),issues
  };
  writeTestArtifact('trial_by_graph_validation_results_4.5s.2m.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
