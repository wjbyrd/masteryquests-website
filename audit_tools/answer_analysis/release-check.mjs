import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';import {randomUUID} from 'node:crypto';
import {releaseRows,csv} from './release-fixtures.mjs';import {validateContractField} from '../../server/anonymous-telemetry-poc/measurement-contract.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js'),rows=releaseRows(),collection=a.createCollection();
collection.add('first.csv',csv(rows.slice(0,8)));assert.equal(a.analyze(collection.rows()).stats.included,8);
collection.add('rest.csv',csv(rows.slice(8)));assert.equal(a.analyze(collection.rows()).stats.included,48);assert(!collection.add('same.csv',csv(rows.slice(0,8))));
collection.add('overlap.csv',csv(rows.slice(0,4)));assert.equal(a.analyze(collection.rows()).stats.included,48);
collection.remove(collection.entries()[0].id);assert.equal(a.analyze(collection.rows()).stats.included,44);
const report=a.analyze(rows);assert.equal(report.overview.correct,20);assert.equal(report.overview.knownCorrectness,48);assert.equal(report.overview.runs,6);
for(const list of [report.topics,report.objectives,report.groups]){assert.equal(list.reduce((n,g)=>n+g.count,0),48);assert.equal(list.reduce((n,g)=>n+g.correct,0),20);}
for(const g of report.groups)assert.equal(g.options.reduce((n,o)=>n+o.count,0),g.count);
assert.equal(report.objectives.length,3);assert.equal(report.topics.length,4);assert.equal(report.groups.find(g=>g.questionID==='T2').correct,0);assert.equal(report.groups.find(g=>g.questionID==='T2').options[1].isCorrect,true);assert.equal(report.groups.find(g=>g.questionID==='T2').options[1].count,0);assert.equal(report.groups.find(g=>g.questionID==='S1').correct,12);
for(const [filter,count,correct] of [[{exposure:'first'},24,10],[{exposure:'repeat'},24,10],[{assistance:'assisted'},8,2],[{assistance:'unassisted'},40,18],[{mode:'quiz'},24,12]]){const r=a.analyze(rows,filter);assert.equal(r.stats.included,count);assert.equal(r.overview.correct,correct);assert.equal(r.objectives.reduce((n,g)=>n+g.count,0),count);}
function changed(row,patch={},snapshotPatch={}){return {...row,eventID:randomUUID(),attemptID:randomUUID(),...patch,answerSnapshotJSON:JSON.stringify({...JSON.parse(row.answerSnapshotJSON),...snapshotPatch})};}
assert.equal(a.analyze([rows[0],changed(rows[0],{}, {questionRevision:'c'.repeat(64)})]).groups.length,2);
assert.equal(a.analyze([rows[0],changed(rows[0],{game:'Other game',runID:'other'}, {gameID:'other-game'})]).groups.length,2);
assert.equal(a.analyze([rows[0],{...rows[0],game:'Other game',answerSnapshotJSON:JSON.stringify({...JSON.parse(rows[0].answerSnapshotJSON),gameID:'other-game'})}]).groups.length,2);
for(const acceptedAttempt of [false,'false',0,'0'])assert.equal(a.analyze([{...rows[0],event:'answer_evaluated',acceptedAttempt}]).stats.accepted,0);
const legacy=changed(rows[0],{},{correctOptionIndices:undefined,schema:'mq-answer-snapshot/1',gameID:undefined,objectiveID:undefined,objectiveLabel:undefined});assert.equal(a.analyze([legacy]).groups[0].keyStatus,'unavailable');
assert.equal(a.analyze([{event:'question',correct:1,questionID:1}]).stats.unresolved,1);
assert.equal(a.analyze([changed(rows[0],{objective:''},{objectiveID:'',objectiveLabel:''})]).stats.missingObjectives,1);
const conflicting=changed(rows[0],{}, {correctOptionIndices:[0]});assert.equal(a.analyze([rows[0],conflicting]).stats.keyConflicts,1);
// A conflicting duplicate, even when filtered out, still invalidates that question's key.
assert.equal(a.analyze([rows[0],{...conflicting,eventID:rows[0].eventID,attemptID:rows[0].attemptID,mode:'hidden'}],{mode:'quiz'}).groups[0].keyStatus,'conflict');
assert.equal(a.analyze([changed(rows[0],{objective:'OTHER'},{objectiveID:'OTHER'}),rows[0]]).stats.objectiveConflicts,1);
assert.equal(a.analyze([rows[0],{...rows[0],event:'rapid_guessing',eventID:'rapid'}, {...rows[0],event:'exam_answer_initial',eventID:'draft'}]).stats.included,1);
assert.equal(a.analyze([{...legacy,attemptID:'',eventID:''},{...legacy,attemptID:'',eventID:''}]).stats.included,2);
assert(a.feedbackSummary(a.analyze([rows[0]]),{fileCount:1}).includes('too little evidence'));
assert.equal(a.reviewQuestions(a.analyze([rows[1]]),5).length,0);
assert(a.feedbackSummary(a.analyze(rows,{exposure:'first'}),{fileCount:6}).includes('24 accepted responses'));
assert(a.feedbackSummary(a.analyze(rows,{mode:'quiz'}),{fileCount:6}).includes('mode quiz'));
assert.throws(()=>a.parseCSV('event,event\nquestion,question'));assert.throws(()=>a.parseCSV('event,correct\n"unfinished,1'));
// Runtime key capture uses authored indexes or the exact normalized published hash.
const values={FACULTY_COMPOSITION_CONFIG:{slug:'synthetic'},runID:'run',gameMode:'standard',room:1,objectiveLabels:{LO1:'Canonical description'}},registry=JSON.parse(fs.readFileSync('audit_tools/telemetry_contract/registry.json'));
const ctx=vm.createContext({crypto:{randomUUID},localStorage:{getItem:()=>null,setItem:()=>{}},document:{},window:{},btoa:s=>Buffer.from(s,'binary').toString('base64')});vm.runInContext(fs.readFileSync('audit_tools/telemetry_contract/runtime.js','utf8'),ctx);const c=ctx.createTelemetryContract((k,f)=>values[k]??f,registry);
function stamp(event,q,extra={}){values.currentQuestion=q;const row={runID:'run',mode:values.gameMode,event,questionID:q.id,selectedIndex:0,room:values.room,priorExposureCount:0,objective:'LO1',...extra};c.stamp(row,extra);return row;}
let q={id:'q',q:'Synthetic',options:['wrong','right'],a:1,telemetryOptionIndices:[1,0]};
let s=JSON.parse(stamp('question',q).answerSnapshotJSON);assert.deepEqual(s.correctOptionIndices,[0]);assert.equal(s.objectiveLabel,'Canonical description');validateContractField('answerSnapshotJSON',JSON.stringify(s),{eventType:'answer_evaluated'});
q={...q,a:undefined,aHash:c.hash('right')};assert.deepEqual(JSON.parse(stamp('question',q).answerSnapshotJSON).correctOptionIndices,[0]);
q={...q,aHash:Buffer.from(c.hash('right'),'hex').toString('base64')};assert.deepEqual(JSON.parse(stamp('question',q).answerSnapshotJSON).correctOptionIndices,[0]);
assert.equal(stamp('question_presented',q).answerSnapshotJSON,null);assert.equal(JSON.parse(stamp('rapid_guessing',q).answerSnapshotJSON).correctOptionIndices,null);
values.gameMode='exam';values.room=2;c.show();const draft=stamp('exam_answer_initial',q);assert.equal(JSON.parse(draft.answerSnapshotJSON).correctOptionIndices,null);c.show();
values.getExamRoomState=()=>({question:q});const commit=stamp('question',q,{adaptiveMode:'exam-commit'});assert.deepEqual(JSON.parse(commit.answerSnapshotJSON).correctOptionIndices,[0]);
values.currentQuestion={id:'different-room',q:'Unanswered',options:['different','question'],a:0};
const otherRoom={runID:'run',mode:'exam',event:'question',questionID:q.id,selectedIndex:0,room:2,priorExposureCount:0,objective:'LO1'};
c.stamp(otherRoom,{adaptiveMode:'exam-commit'});assert.equal(JSON.parse(otherRoom.answerSnapshotJSON).prompt,'Synthetic');assert.deepEqual(JSON.parse(otherRoom.answerSnapshotJSON).correctOptionIndices,[0]);
assert.throws(()=>validateContractField('answerSnapshotJSON',JSON.stringify(s),{eventType:'exam_answer_initial'}));
assert.throws(()=>validateContractField('answerSnapshotJSON',JSON.stringify(s),{eventType:'answer_evaluated',acceptedAttempt:false}));
const legacyKey={...s,schema:'mq-answer-snapshot/1'};assert.throws(()=>validateContractField('answerSnapshotJSON',JSON.stringify(legacyKey),{}));
const output=process.env.MQ_EVIDENCE_DIR||'tmp/answer-release';fs.mkdirSync(output,{recursive:true});
const classCollection=a.createCollection();for(let i=0;i<6;i++)classCollection.add('run'+i+'.csv',csv(rows.slice(i*8,i*8+8)));
fs.writeFileSync(output+'/synthetic-feedback.txt',a.feedbackSummary(a.analyze(classCollection.rows()),{fileCount:6,grouping:'objectives'}));
fs.writeFileSync(output+'/synthetic.csv',csv(rows));
console.log('PASS: all 20 requested synthetic scenarios; raw, filtered, topic, objective, question and choice totals; authoritative zero-selected keys; conflict handling; accepted-only runtime capture and exam commits.');
