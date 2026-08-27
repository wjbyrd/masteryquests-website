import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../../..");
const templateRel="build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html";
const templatePath=path.join(root,templateRel);
const template=fs.readFileSync(templatePath,"utf8");
const headTemplate=childProcess.execFileSync("git",["show",`HEAD:${templateRel}`],{cwd:root,encoding:"utf8",maxBuffer:32*1024*1024});
const errors=[],checks=[];
function check(ok,label,detail=""){checks.push({label,pass:Boolean(ok),detail});if(!ok)errors.push(`${label}${detail?`: ${detail}`:""}`);}

function extractFunction(source,name){
  const start=source.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Missing function ${name}`);
  const brace=source.indexOf("{",start);let depth=0,quote=null,escaped=false;
  for(let index=brace;index<source.length;index+=1){const ch=source[index];if(quote){if(escaped)escaped=false;else if(ch==="\\")escaped=true;else if(ch===quote)quote=null;continue;}if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}if(ch==="{")depth+=1;if(ch==="}"&&--depth===0)return source.slice(start,index+1);}
  throw new Error(`Unterminated function ${name}`);
}

function checkpointContext(room=10){
  return {room,gameMode:"standard",remediationState:{active:false},bossHealth:3,isBossRoomForMode:r=>[10,20,30].includes(r)};
}
const guardSource=["isCheckpointEncounterActive","remediationTransitionAllowed","planRemediation"].map(name=>extractFunction(template,name)).join("\n");
const checkpointSource=extractFunction(template,"advanceCheckpointAttempt");
const guardContext=checkpointContext();
vm.runInNewContext(`${guardSource}\nresult=remediationTransitionAllowed({tag:"budget"});planned=planRemediation({tag:"budget"},5000);`,guardContext);
check(guardContext.result===false,"TEST B: checkpoint transition guard rejects remediation");
check(guardContext.planned===null,"canonical planner cannot create checkpoint remediation");
const ordinaryContext=checkpointContext(9);ordinaryContext.getTypeTargetMs=()=>5000;ordinaryContext.getObjectiveBucket=()=>({attempts:3,correct:0});ordinaryContext.getAccuracy=()=>0;ordinaryContext.getSkillKey=()=>"budget-skill";ordinaryContext.currentQuestion={objective:"CC.1"};
vm.runInNewContext(`${guardSource}\nresult=remediationTransitionAllowed({tag:"budget"});planned=planRemediation({id:101,tag:"budget",type:"application"},5000);`,ordinaryContext);
check(ordinaryContext.result===true&&ordinaryContext.planned?.active===true,"TEST A: eligible ordinary miss still launches remediation");

const progressContext=checkpointContext();
vm.runInNewContext(`${checkpointSource}\nfirst=advanceCheckpointAttempt();second=advanceCheckpointAttempt();third=advanceCheckpointAttempt();remaining=bossHealth;`,progressContext);
check(progressContext.first===false&&progressContext.second===false&&progressContext.third===true&&progressContext.remaining===0,"checkpoint resolves after exactly three scored attempts");

const answerSource=template.slice(template.indexOf("async function answer(choice)"),template.indexOf("// =============================================\n// UI FEEDBACK & REWARD SYSTEM"));
const wrongCheckpointIndex=answerSource.indexOf("const checkpointComplete = advanceCheckpointAttempt();",answerSource.indexOf("// ❌ WRONG ANSWER BLOCK"));
const activeRemediationIndex=answerSource.indexOf("if(remediationState.active)",answerSource.indexOf("// ❌ WRONG ANSWER BLOCK"));
const triggerIndex=answerSource.indexOf("if (remediationTransitionAllowed(currentQuestion) && shouldTriggerDetour(currentQuestion))");
check(wrongCheckpointIndex>=0&&wrongCheckpointIndex<activeRemediationIndex&&activeRemediationIndex<triggerIndex,"checkpoint miss resolves before any remediation path");
check(/if\(isBossRoom\)[\s\S]*?advanceCheckpointAttempt\(\)[\s\S]*?return;[\s\S]*?IF STUDENT MISSES DURING ACTIVE REMEDIATION/.test(answerSource),"checkpoint miss exits before Repair, Bridge, or Retest");
check(answerSource.indexOf("recordAdaptiveAttempt(currentQuestion, isCorrect, responseTime);")<wrongCheckpointIndex,"checkpoint evidence is recorded before transition suppression");
check(/sendGameData\(\{[\s\S]*?event:\s*"question"[\s\S]*?questionId:[\s\S]*?objective:[\s\S]*?adaptiveMode:/.test(answerSource),"checkpoint question telemetry remains intact");
check(/function completeCheckpointEncounter\(\)[\s\S]*?showKnowledgeRoom\(room\);[\s\S]*?bossHealth = 3;/.test(template),"completed checkpoint resolves before state reset");
check(/function remediationTransitionAllowed\(question\)[\s\S]*?!isCheckpointEncounterActive\(\)/.test(template),"single canonical checkpoint remediation guard");
check(/Checkpoint encounters are diagnostic\/assessment sequences\. Remediation[\s\S]*?suppressed until the checkpoint has fully resolved\./.test(template),"runtime design invariant documented");

const currentSelection=extractFunction(template,"buildBossQuestionSet");
const headSelection=extractFunction(headTemplate,"buildBossQuestionSet");
check(currentSelection===headSelection,"checkpoint question selection unchanged");
for(const expression of [/tagWeakness >= 2\.2/,/typeBucket\.attempts >= 2/,/typeAccuracy < 0\.6/,/objectiveAccuracy < 0\.5/,/objectiveAttempts >= 2/,/objectiveAccuracy < 0\.6/])check(expression.test(template),`remediation threshold retained ${expression}`);

function simulate({checkpointAnswers=[],postCheckpointMiss=false,weaknessWouldTrigger=true}){
  const state={room:checkpointAnswers.length?10:9,checkpointActive:checkpointAnswers.length>0,remaining:checkpointAnswers.length?3:0,evidence:[],transitions:[],remediation:null};
  const record=(correct,location)=>state.evidence.push({correct,location,questionId:100+state.evidence.length,concept:"consumer-choice",objective:"CC.1",skill:"construct_budget_constraint"});
  const launch=()=>{state.remediation={returnRoom:state.room,path:["repair","bridge","retest"]};state.transitions.push("repair","bridge","retest");state.room=state.remediation.returnRoom;state.transitions.push(state.room===11?"resume-post-checkpoint":"resume-origin-room");};
  if(!checkpointAnswers.length){record(false,"ordinary");if(weaknessWouldTrigger)launch();return state;}
  checkpointAnswers.forEach((correct,index)=>{record(correct,"checkpoint");state.transitions.push(`checkpoint-q${index+1}`);state.remaining-=1;if(state.remaining===0){state.checkpointActive=false;state.transitions.push("checkpoint-complete");state.room=11;}});
  if(postCheckpointMiss){record(false,"ordinary");if(weaknessWouldTrigger)launch();}
  return state;
}

const oneMiss=simulate({checkpointAnswers:[false,true,true]});
const twoMisses=simulate({checkpointAnswers:[false,false,true]});
const finalMiss=simulate({checkpointAnswers:[true,true,false]});
const clean=simulate({checkpointAnswers:[true,true,true]});
const deferred=simulate({checkpointAnswers:[false,false,true],postCheckpointMiss:true});
const ordinary=simulate({weaknessWouldTrigger:true});
check(!oneMiss.transitions.includes("repair")&&oneMiss.transitions[1]==="checkpoint-q2","TEST B: Q1 miss delivers Q2, not Repair");
check(!twoMisses.transitions.includes("repair")&&twoMisses.transitions[2]==="checkpoint-q3","TEST C: two checkpoint misses still deliver Q3");
check(twoMisses.transitions.filter(step=>step.startsWith("checkpoint-q")).length===3&&twoMisses.transitions.at(-1)==="checkpoint-complete","TEST D: all checkpoint questions are delivered before resolution");
check(twoMisses.evidence.filter(item=>item.location==="checkpoint"&&!item.correct).length===2,"TEST E: checkpoint misses remain in weakness evidence");
check(deferred.transitions.indexOf("checkpoint-complete")<deferred.transitions.indexOf("repair"),"TEST F: eligible remediation can begin only after checkpoint completion");
check(deferred.room===11&&deferred.remediation?.returnRoom===11&&!deferred.transitions.includes("resume-checkpoint"),"TEST G: deferred Repair cannot reopen a completed checkpoint");
check(!clean.transitions.includes("repair")&&clean.room===11,"TEST H: correct checkpoint performance progresses without remediation");
const mastery={attempts:twoMisses.evidence.length,misses:twoMisses.evidence.filter(item=>!item.correct).length,accuracy:twoMisses.evidence.filter(item=>item.correct).length/twoMisses.evidence.length,weakObjective:twoMisses.evidence.find(item=>!item.correct)?.objective};
check(mastery.attempts===3&&mastery.misses===2&&mastery.accuracy===1/3&&mastery.weakObjective==="CC.1","TEST I: Mastery Report inputs include checkpoint misses");
check(ordinary.transitions.join(",")==="repair,bridge,retest,resume-origin-room"&&ordinary.room===9,"TEST J: ordinary Repair → Bridge → Recovery Retest behavior is unchanged");
check(finalMiss.transitions.at(-1)==="checkpoint-complete"&&!finalMiss.transitions.includes("repair"),"final checkpoint question resolves before any remediation transition");

const output={status:errors.length?"FAIL":"PASS",checks:checks.length,errors,simulation:{oneMiss,twoMisses,finalMiss,clean,deferred,ordinary}};
console.log(JSON.stringify(output,null,2));
if(errors.length)process.exit(1);
