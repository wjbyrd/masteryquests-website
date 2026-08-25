const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const {attachConceptReviewRuntime,assertCanonicalCoreVersion,assertGeneratedComposerVersion,writeTestArtifact}=require('./composer-test-helpers.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
const composerJs=fs.readFileSync(path.join(root,'composer.js'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0) throw new Error(`missing ${name}`);
  const parenStart=src.indexOf('(',start);
  let parenDepth=0, parenEnd=-1;
  for(let i=parenStart;i<src.length;i++){
    if(src[i]==='(') parenDepth++;
    else if(src[i]===')'){
      parenDepth--;
      if(parenDepth===0){parenEnd=i;break;}
    }
  }
  const brace=src.indexOf('{',parenEnd);
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

function difficultyAt(room){
  const fn=extractFunction(template,'getDifficultyForMode');
  const ctx={gameMode:'unlimited',room,quizQuestionTarget:10,quizQuestionsCompleted:0,QUIZ_MAX_QUESTIONS:15,Math,Number};
  vm.createContext(ctx);
  vm.runInContext(fn,ctx);
  return vm.runInContext('getDifficultyForMode()',ctx);
}

function practiceControlDisplay(mode, runEnding=false){
  const fn=extractFunction(template,'updatePracticeEndControl');
  const controls={style:{display:''}};
  const document={getElementById(id){return id==='practiceModeControls'?controls:null;}};
  const ctx={gameMode:mode,runEnding,document};
  vm.createContext(ctx);
  vm.runInContext(`${fn}\nupdatePracticeEndControl();`,ctx);
  return controls.style.display;
}

function simulateManualPracticeEnd(mode){
  const fn=extractFunction(template,'handlePracticeModeComplete');
  const elements={};
  const getEl=(id)=>elements[id]||(elements[id]={style:{},classList:{add(){},remove(){},toggle(){}},innerText:'',innerHTML:''});
  let examMarked=0, reportShown=0, telemetry=null, sessionBegun=0;
  const ctx={
    gameMode:mode,runEnding:false,answerSubmissionPending:false,totalAttempts:7,correctAnswers:5,maxStreak:3,streak:1,room:8,username:'Test',runID:'RUN',quizQuestionTarget:10,latestResultsScreenHTML:'',
    FACULTY_COMPOSITION_CONFIG:{title:'Test Quest'},
    document:{getElementById:getEl},
    beginRunSession(){sessionBegun++;}, stopTimedModeClock(){}, clearFadingFortuneTimer(){}, updateFadingFortuneHud(){}, freezeCompletionTime(){return 42000;}, formatTime(){return '00:42';}, generateCode(){return 'MQB-TEST';},
    markExamDrillCompleted(){examMarked++;}, sendGameData(data){telemetry=data;}, closeGraphLightbox(){}, getModeDisplayName(){return mode==='exam'?'Exam Drill':'Unlimited Practice';},
    showMasteryReportScreen(){reportShown++;}, console
  };
  vm.createContext(ctx);
  vm.runInContext(`${fn}\nhandlePracticeModeComplete({endedByStudent:true, showReport:true});`,ctx);
  return {examMarked,reportShown,telemetryEvent:telemetry?.event,runEnding:ctx.runEnding,sessionBegun};
}

(async()=>{
  const issues=[];
  assertCanonicalCoreVersion(core);
  if(!core.MODE_ORDER.includes('unlimited')) issues.push('unlimited missing from MODE_ORDER');
  if(core.MODE_ORDER.length!==10) issues.push(`mode count ${core.MODE_ORDER.length}`);
  if(library.canonicalQuestionCount!==8211) issues.push(`canonical question count changed to ${library.canonicalQuestionCount}`);

  const recipe={
    schemaVersion:core.RECIPE_SCHEMA_VERSION,
    title:'Unlimited Practice Validation',
    slug:'unlimited-practice-validation',
    supportedModes:['unlimited'],
    selectedConceptIds:['oligopoly'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  const composition=core.compose(library,recipe);
  if(composition.errors.length) issues.push(...composition.errors);
  const validation=composition.validation.modes.find(m=>m.mode==='unlimited');
  if(!validation?.ok) issues.push('unlimited preflight failed');
  const reqPools=(validation?.requirements||[]).map(r=>r.pool);
  const expected=['easy','medium','hard','repair','bridge'];
  if(JSON.stringify(reqPools)!==JSON.stringify(expected)) issues.push(`requirements ${JSON.stringify(reqPools)}`);

  const config=await core.createConfig(recipe,library,await core.sha256Hex(template));
  const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:composition.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:config.templateSha256};
  attachConceptReviewRuntime(core,composition,library,recipe.selectedConceptIds);
  const html=core.buildHtml(template,composition,config,metadata);
  assertGeneratedComposerVersion(html);
  writeTestArtifact('tests/unlimited-only.html',html);

  const checks={
    unlimitedCard: html.includes('data-mode="unlimited"'),
    endPracticeButton: html.includes('id="endPracticeBtn"'),
    endControlIncludesExam: html.includes('gameMode === "exam" || gameMode === "unlimited"'),
    confirmFlow: html.includes('confirmText: "Generate Mastery Report"'),
    directReport: html.includes('handlePracticeModeComplete({endedByStudent:true, reportDestination:"mastery"})'),
    cycleRollover: html.includes('if(gameMode === "unlimited" && room > 30)') && html.includes('unlimitedPracticeCycle++'),
    noUnlimitedBosses: /function isBossRoomForMode\(r\)\{[^}]*gameMode === "unlimited"[^}]*return false;/.test(html) && html.includes('gameMode !== "unlimited"'),
    examEarlyCompletionGuard: html.includes('if(gameMode === "exam" && !endedByStudent)'),
    manualTelemetry: html.includes('`${gameMode}_ended_by_student`'),
    masteryLabel: html.includes('if(gameMode === "unlimited") return "Unlimited Practice";'),
    composerLabel: composerJs.includes("unlimited: 'Unlimited Practice'"),
    composerDescription: composerJs.includes('repeating 30-room cycles'),
    configOnlyUnlimited: config.supportedModes.length===1 && config.supportedModes[0]==='unlimited'
  };
  Object.entries(checks).forEach(([k,v])=>{if(!v) issues.push(`missing ${k}`);});

  const practiceControlVisibility={
    exam:practiceControlDisplay('exam'),
    unlimited:practiceControlDisplay('unlimited'),
    quiz:practiceControlDisplay('quiz'),
    standard:practiceControlDisplay('standard'),
    endedUnlimited:practiceControlDisplay('unlimited',true)
  };
  const manualEndSimulation={exam:simulateManualPracticeEnd('exam'),unlimited:simulateManualPracticeEnd('unlimited')};
  if(manualEndSimulation.exam.examMarked!==0 || manualEndSimulation.exam.reportShown!==1 || manualEndSimulation.exam.telemetryEvent!=='exam_ended_by_student') issues.push(`exam manual end ${JSON.stringify(manualEndSimulation.exam)}`);
  if(manualEndSimulation.unlimited.reportShown!==1 || manualEndSimulation.unlimited.telemetryEvent!=='unlimited_ended_by_student') issues.push(`unlimited manual end ${JSON.stringify(manualEndSimulation.unlimited)}`);
  if(practiceControlVisibility.exam!=='flex' || practiceControlVisibility.unlimited!=='flex' || practiceControlVisibility.quiz!=='none' || practiceControlVisibility.standard!=='none' || practiceControlVisibility.endedUnlimited!=='none'){
    issues.push(`practice control visibility ${JSON.stringify(practiceControlVisibility)}`);
  }

  const difficultySequence=[1,10,11,20,21,30].map(room=>({room,difficulty:difficultyAt(room)}));
  const expectedDiff=['easy','easy','medium','medium','hard','hard'];
  if(JSON.stringify(difficultySequence.map(x=>x.difficulty))!==JSON.stringify(expectedDiff)){
    issues.push(`difficulty sequence ${JSON.stringify(difficultySequence)}`);
  }

  const result={
    phase:'unlimited-practice-and-exam-manual-exit-v1',
    ok:issues.length===0,
    composerVersion:core.COMPOSER_VERSION,
    canonicalQuestionCount:library.canonicalQuestionCount,
    supportedModes:core.MODE_ORDER,
    unlimitedValidation:validation ? {ok:validation.ok,requirements:validation.requirements}:null,
    difficultySequence,
    practiceControlVisibility,
    manualEndSimulation,
    checks,
    generatedHtmlBytes:Buffer.byteLength(html),
    issues
  };
  writeTestArtifact('unlimited_practice_validation_results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
