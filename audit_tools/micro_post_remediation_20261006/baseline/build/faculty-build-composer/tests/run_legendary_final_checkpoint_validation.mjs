import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const relative='build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html';
const source=fs.readFileSync(relative,'utf8');
function declaration(text,name,next){return text.slice(text.indexOf(`function ${name}(`),text.indexOf(`function ${next}(`)).trim();}
function exercise(text,mode){
 const elements=new Map();const element=()=>({innerHTML:'',innerText:'',className:'',classList:{remove(){}}});
 const context={room:30,bossHealth:3,bossPool:[{},{},{}],gameMode:mode,phase15CompletionLocked:false,runPhase:'question',lastCheckpointOutcome:{room:30,outcome:'secured'},bossCheckpoint:21,TIMING:{checkpointTransition:0},results:0,standardResults:0,freezeCompletionTime(){},clearSavedGame(){},saveGameState(){},playExplorationMusic(){},facultyEscapeAttribute:s=>s,getCheckpointOutcomePresentation:()=>({title:'Complete',summary:'Done',transition:'Done',lead:''}),document:{getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);}},scheduleForCurrentRun:fn=>fn(),modeAllowsRealmProgress:()=>mode==='standard',handlePracticeModeComplete(){},handleScoreAttackVictory(){},finalizeCheckpointOutcome:()=>({outcome:'secured',correct:3,total:3}),recordBossDefeatForAchievements(){},sendGameData(){},FACULTY_COMPOSITION_CONFIG:{title:'Test'},runID:'test',username:'test',earnArtifact(){},updateMissionArtifactCountFromVault(){}};
 vm.createContext(context);
 // Use exact bounded declarations, avoiding unrelated intervening runtime code.
 const complete=text.slice(text.indexOf('function completeCheckpointEncounter(){'),text.indexOf('// =============================================\n// PLAYER NAME RESTORE')).trim();
 const knowledge=declaration(text,'showKnowledgeRoom','handleLegendaryVictory');
 const wrappers=text.slice(text.indexOf('const phase15BaseHandleVictory ='),text.indexOf('const phase15BaseHandlePracticeModeComplete ='));
 vm.runInContext(`function handleLegendaryVictory(){results++;} function handleVictory(){if(gameMode==='legendary')return handleLegendaryVictory();standardResults++;} function showHallwayTransition(message,options){if(options.nextAction==='victory')handleVictory();} ${declaration(text,'advanceCheckpointAttempt','completeCheckpointEncounter')} ${complete} ${knowledge} ${wrappers}`,context);
 vm.runInContext('first=advanceCheckpointAttempt();second=advanceCheckpointAttempt();third=advanceCheckpointAttempt();if(third)completeCheckpointEncounter();document.getElementById("continueBtn").onclick();',context);
 assert.equal(context.first,false);assert.equal(context.second,false);assert.equal(context.third,true);assert.equal(context.bossCheckpoint,31);
 const expected=mode==='legendary'?'results':'standardResults';assert.equal(context[expected],1,`${mode}: checkpoint 30 must reach results`);
 vm.runInContext('handleVictory();',context);assert.equal(context[expected],1,'Completion is idempotent');
}
// Prove that the reported double-lock regression is observable on the baseline.
const baseline=execFileSync('git',['show',`HEAD:${relative}`],{encoding:'utf8',maxBuffer:4*1024*1024});
if(!baseline.includes('Legendary completion owns the same lock'))assert.throws(()=>exercise(baseline,'legendary'),/must reach results/);
exercise(source,'legendary');exercise(source,'standard');
console.log('PASS: baseline double-lock reproduced; three final-checkpoint attempts reach Legendary and standard results exactly once.');
