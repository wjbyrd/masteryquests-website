import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fn,templatePath} from '../../../audit_tools/economic_realm_engine/source.mjs';
const source=fs.readFileSync(templatePath,'utf8');
const functions=['getCheckpointOutcome','recordCheckpointAttempt','finalizeCheckpointOutcome','advanceCheckpointAttempt','completeCheckpointEncounter','failStandardCheckpoint','showKnowledgeRoom'];
let checks=0;
function context(room=10,mode='standard'){
 const elements=new Map();
 const c={room,gameMode:mode,bossCheckpoint:room-9,bossHealth:3,bossPool:[1,2,3],checkpointAttemptState:null,lastCheckpointOutcome:null,activeBossEncounter:null,bossRevealShownKeys:new Set(),runSessionId:1,runID:'test',username:'test',currentQuestion:{id:1},FACULTY_COMPOSITION_CONFIG:{title:'Test'},ROOM_KEY:'room',TIMING:{checkpointTransition:0},rewards:[],events:[],defeats:0,loads:0,transitions:[],Math,Number,
  getBossEncounterKey(){return `${c.gameMode}:${c.room}`;},humanizeBossObjective:x=>x,
  sendGameData:e=>c.events.push(e),recordBossDefeatForAchievements:()=>c.defeats++,earnArtifact:k=>c.rewards.push(k),updateMissionArtifactCountFromVault(){},modeAllowsRealmProgress:()=>mode==='standard',
  window:{MQFeedbackProgression:{cancel(){},wrongTurn:x=>x}},localStorage:{setItem(){}},showGameModal:m=>c.modal=m,loadQuestion:()=>c.loads++,saveGameState(){},playExplorationMusic(){},facultyEscapeAttribute:x=>x,
  getCheckpointOutcomePresentation:()=>({title:'summary',summary:'summary',transition:'transition',lead:'lead'}),scheduleForCurrentRun:f=>f(),showHallwayTransition:(text,options)=>c.transitions.push(options),
  document:{getElementById(id){if(!elements.has(id))elements.set(id,{innerHTML:'',innerText:'',className:'',disabled:false,classList:{remove(){}}});return elements.get(id);}}
 };
 vm.createContext(c);vm.runInContext(functions.map(n=>fn(source,n)).join('\n'),c);return c;
}
for(const room of [10,20,30])for(const precedingCorrect of [0,1,2]){
 const c=context(room);
 for(let i=0;i<precedingCorrect;i++){c.recordCheckpointAttempt(true);c.advanceCheckpointAttempt();}
 c.recordCheckpointAttempt(false);c.failStandardCheckpoint();
 assert.equal(c.room,room-3);assert.equal(c.bossCheckpoint,room-9);assert.equal(c.bossHealth,3);assert.equal(c.bossPool.length,0);
 assert.equal(c.lastCheckpointOutcome.outcome,'not-secured');assert.equal(c.lastCheckpointOutcome.correct,precedingCorrect);assert.equal(c.lastCheckpointOutcome.total,precedingCorrect+1);
 assert.equal(c.defeats,0);assert.equal(c.rewards.length,0);assert.equal(c.events.filter(e=>e.event==='boss_defeated').length,0);
 c.modal.onConfirm();c.modal.onConfirm();assert.equal(c.loads,1);checks++;
}
for(const correct of [0,1,2]){
 const c=context();c.checkpointAttemptState={total:3,correct,incorrect:3-correct};c.completeCheckpointEncounter();
 assert.equal(c.room,7);assert.equal(c.rewards.length,0);assert.equal(c.defeats,0);checks++;
}
for(const room of [10,20,30]){
 const c=context(room);c.checkpointAttemptState={total:3,correct:3,incorrect:0};c.completeCheckpointEncounter();
 assert.equal(c.defeats,1);assert.equal(c.rewards.length,1);assert.equal(c.bossCheckpoint,room+1);
 const button=c.document.getElementById('continueBtn'),callback=button.onclick;callback();callback();
 assert.equal(c.transitions.length,1);assert.equal(c.room,room===30?30:room+1);assert(button.disabled);checks++;
 const stale=context(room);stale.checkpointAttemptState={total:3,correct:3};stale.completeCheckpointEncounter();const old=stale.document.getElementById('continueBtn').onclick;stale.runSessionId++;old();assert.equal(stale.transitions.length,0);checks++;
}
for(const mode of ['exam','timed','unlimited','legendary','score'])for(const correct of [0,1,2,3]){
 const c=context(10,mode);c.checkpointAttemptState={total:3,correct};c.completeCheckpointEncounter();
 assert.equal(c.lastCheckpointOutcome.outcome,correct===3?'secured':correct===2?'cleared':'not-secured');assert.equal(c.bossCheckpoint,11);checks++;
}
{
 const c=context();c.showKnowledgeRoom(10);const stale=c.document.getElementById('continueBtn').onclick;
 c.bossCheckpoint=1;c.checkpointAttemptState={total:1,correct:0,incorrect:1};c.failStandardCheckpoint();stale();
 assert.equal(c.room,7);assert.equal(c.transitions.length,0);checks++;
 const old=c.modal.onConfirm;c.runSessionId++;old();assert.equal(c.loads,0);checks++;
}
const wrong=fn(source,'answer').split('// ❌ WRONG ANSWER BLOCK')[1];
assert(wrong.indexOf('failStandardCheckpoint();')>=0 && wrong.indexOf('failStandardCheckpoint();')<wrong.indexOf('advanceCheckpointAttempt();'),'A Standard boss miss must exit before consuming another checkpoint question');checks++;
assert(source.includes('isBossRoomForMode(room) && Number(checkpointAttemptState?.incorrect || 0) > 0'),'Historical partial saves must not bypass the first-miss rule');checks++;
console.log(`PASS Standard boss progression: ${checks} cases; first miss, no rewards, completion guard, one-shot/stale callbacks, other modes.`);
