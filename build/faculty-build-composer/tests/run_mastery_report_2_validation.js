const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const {assertCanonicalCoreVersion,writeTestArtifact}=require('./composer-test-helpers.js');
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`); if(start<0) throw new Error(`missing ${name}`);
  const ps=src.indexOf('(',start); let pd=0,pe=-1;
  for(let i=ps;i<src.length;i++){if(src[i]==='(')pd++;else if(src[i]===')'&&--pd===0){pe=i;break;}}
  const bs=src.indexOf('{',pe); let d=0;
  for(let i=bs;i<src.length;i++){if(src[i]==='{')d++;else if(src[i]==='}'&&--d===0)return src.slice(start,i+1);}
  throw new Error(`unterminated ${name}`);
}
function evidence(input){
  const ctx={Number,String}; vm.createContext(ctx);
  vm.runInContext(extractFunction(template,'getDifficultyExposure')+'\n'+extractFunction(template,'getEvidenceAssessment'),ctx);
  return vm.runInContext(`getEvidenceAssessment(${JSON.stringify(input)})`,ctx);
}
function testBattleMenu(mode){
  const fn=extractFunction(template,'confirmReturnToModeMenu');
  const result={confirmEndPractice:0,showGameModal:0,saved:0,timedEarly:0,returned:0};
  const ctx={gameMode:mode,runEnding:false,confirmEndPractice(){result.confirmEndPractice++;},showGameModal(o){result.showGameModal++; if(o&&o.onConfirm)o.onConfirm();},saveGameState(){result.saved++;},endTimedAttemptEarly(){result.timedEarly++;},returnToModeSelectFromRun(){result.returned++;}};
  vm.createContext(ctx); vm.runInContext(fn+'\nconfirmReturnToModeMenu();',ctx); return result;
}
function simulateManualEnd(mode){
  const fn=extractFunction(template,'handlePracticeModeComplete');
  const elements={}; const el=id=>elements[id]||(elements[id]={style:{},innerText:'',innerHTML:''});
  let marked=0,report=0,telemetry=null;
  const ctx={
    gameMode:mode,runEnding:false,answerSubmissionPending:false,totalAttempts:12,correctAnswers:9,maxStreak:5,streak:2,room:14,username:'Student',runID:'RUN',quizQuestionTarget:10,latestResultsScreenHTML:'',
    FACULTY_COMPOSITION_CONFIG:{title:'Validation Quest'},document:{getElementById:el},
    beginRunSession(){},stopTimedModeClock(){},clearFadingFortuneTimer(){},updateFadingFortuneHud(){},freezeCompletionTime(){return 100000;},formatTime(){return '01:40';},generateCode(){return 'MQB-TEST';},
    markExamDrillCompleted(){marked++;},sendGameData(d){telemetry=d;},closeGraphLightbox(){},getModeDisplayName(){return mode==='exam'?'Exam Drill':'Unlimited Practice';},
    showMasteryReportScreen(opts){report++; resultOpts=opts;},console
  };
  let resultOpts=null; ctx.showMasteryReportScreen=(opts)=>{report++;resultOpts=opts;};
  vm.createContext(ctx); vm.runInContext(fn+`\nhandlePracticeModeComplete({endedByStudent:true, reportDestination:"mastery"});`,ctx);
  return {marked,report,event:telemetry&&telemetry.event,preserveResultsHTML:resultOpts&&resultOpts.preserveResultsHTML===true};
}
(async()=>{
  const issues=[];
  assertCanonicalCoreVersion(core);
  if(library.canonicalQuestionCount!==8163) issues.push(`canonical ${library.canonicalQuestionCount}`);
  const tiny=evidence({attempts:2,accuracy:1,byDifficulty:{easy:{attempts:2}},overall:false});
  const developing=evidence({attempts:7,accuracy:.86,byDifficulty:{easy:{attempts:4},medium:{attempts:3}},recentAccuracy:.86,overall:true});
  const mastered=evidence({attempts:20,accuracy:.90,byDifficulty:{easy:{attempts:6},medium:{attempts:6},hard:{attempts:8}},recentAccuracy:.90,overall:true});
  const weakStrong=evidence({attempts:20,accuracy:.45,byDifficulty:{easy:{attempts:8},medium:{attempts:7},hard:{attempts:5}},recentAccuracy:.45,overall:true});
  if(tiny.label!=='Limited Evidence') issues.push(`tiny ${tiny.label}`);
  if(developing.label!=='Developing Evidence') issues.push(`developing ${developing.label}`);
  if(mastered.label!=='Mastery Demonstrated') issues.push(`mastered ${mastered.label}`);
  if(weakStrong.label!=='Strong Evidence') issues.push(`weak strong ${weakStrong.label}`);
  const examMenu=testBattleMenu('exam'), unlimitedMenu=testBattleMenu('unlimited'), standardMenu=testBattleMenu('standard');
  if(examMenu.confirmEndPractice!==1||examMenu.showGameModal!==0) issues.push(`exam menu ${JSON.stringify(examMenu)}`);
  if(unlimitedMenu.confirmEndPractice!==1||unlimitedMenu.showGameModal!==0) issues.push(`unlimited menu ${JSON.stringify(unlimitedMenu)}`);
  if(standardMenu.showGameModal!==1||standardMenu.saved!==1||standardMenu.returned!==1) issues.push(`standard menu ${JSON.stringify(standardMenu)}`);
  const examEnd=simulateManualEnd('exam'), unlimitedEnd=simulateManualEnd('unlimited');
  if(examEnd.marked!==0||examEnd.report!==1||examEnd.event!=='exam_ended_by_student'||!examEnd.preserveResultsHTML) issues.push(`exam end ${JSON.stringify(examEnd)}`);
  if(unlimitedEnd.report!==1||unlimitedEnd.event!=='unlimited_ended_by_student'||!unlimitedEnd.preserveResultsHTML) issues.push(`unlimited end ${JSON.stringify(unlimitedEnd)}`);
  const sourceChecks={
    evidenceLabels:['Limited Evidence','Developing Evidence','Strong Evidence','Mastery Demonstrated'].every(x=>template.includes(x)),
    difficultyCapture:template.includes('byDifficulty')&&template.includes('__mqDifficulty'),
    battleMenuFunnelsPractice:template.includes('if(gameMode === "exam" || gameMode === "unlimited"){\n        confirmEndPractice();'),
    reportDestination:template.includes('reportDestination:"mastery"'),
    evidenceSection:template.includes('<h3>Evidence Strength</h3>'),
    copyIncludesEvidence:template.includes('`Evidence: ${report.evidence.label}`')
  };
  Object.entries(sourceChecks).forEach(([k,v])=>{if(!v)issues.push(`source ${k}`)});
  const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'MR2 Seven Mode Validation',slug:'mr2-seven-mode',supportedModes:['standard','timed','exam','quiz','unlimited','legendary','score'],selectedConceptIds:['oligopoly'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const comp=core.compose(library,recipe); if(comp.errors.length) issues.push(...comp.errors);
  const result={phase:'mastery-report-2.0',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,evidenceCases:{tiny,developing,mastered,weakStrong},battleMenu:{exam:examMenu,unlimited:unlimitedMenu,standard:standardMenu},manualEnd:{exam:examEnd,unlimited:unlimitedEnd},sourceChecks,sevenModeValidation:comp.validation.modes.map(x=>({mode:x.mode,ok:x.ok})),issues};
  writeTestArtifact('mastery_report_2_validation_results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2)); if(!result.ok)process.exit(1);
})();
