import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {dashboardRows,referenceShapeRows} from './dashboard-fixtures.mjs';
import {csv} from './release-fixtures.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js');
const rows=dashboardRows(),result=a.analyze(rows),p=result.progression;
assert.equal(result.stats.included,48);assert.equal(result.overview.correct,20);assert.equal(result.overview.runs,6);
assert.deepEqual([p.successful,p.early,p.unsuccessful,p.unknown],[3,1,1,1]);assert.equal(p.successfulRate,.5);
assert.equal(p.medianSuccessfulTimeMs,660000);assert.equal(p.medianAnswersPerSuccess,8);assert.equal(result.overview.averageCompletionTimeMs,720000);
assert.deepEqual(result.difficulties.filter(g=>g.count).map(g=>[g.label,g.count]),[['Easy',12],['Medium',12],['Hard',12],['Legendary',12]],'Local difficulty must populate the main breakdown');
assert.equal(result.difficulties.reduce((n,g)=>n+g.count,0),48);
assert.equal(result.difficulties.find(g=>g.label==='Easy').correct,12);
assert.equal(result.difficulties.find(g=>g.label==='Easy').medianResponseTimeMs,34500);
assert(a.feedbackSummary(result).includes('Difficulty observations:'));
assert.deepEqual(a.analyze(rows.map(r=>({...r,mode:'legendary'}))).difficulties,result.difficulties,'Mode must not override recorded difficulty');
assert.equal(a.analyze(rows.map(r=>({...r,difficulty:'',mode:'hard'}))).difficulties.find(g=>g.label==='Unknown').count,48,'Missing difficulty must not be inferred from mode');
const localConflict=structuredClone(rows);localConflict.find(r=>r.event==='question').difficulty='hard';
assert.equal(a.analyze(localConflict).difficulties.find(g=>g.label==='Unknown').count,12,'Conflicting labels remain visible as Unknown');
assert.deepEqual(result.encounters.question.map(g=>g.count),[24,24,0]);assert.equal(result.encounters.skill,null);
assert.deepEqual(result.remediation.roles.map(g=>g.count),[6,6,6]);assert.equal(result.remediation.linkedRetests.count,6);assert.equal(result.remediation.linkedRetests.correct,1);
assert.equal(result.remediation.completed,null);assert.equal(result.coverage.atLeastFive,4);assert.equal(result.coverage.atLeastTen,4);assert.equal(result.coverage.bankTotal,null);
assert.equal(result.distribution.reduce((n,b)=>n+b.count,0),48);
assert.deepEqual(a.analyze([...rows,...rows]).progression,p);assert.deepEqual(a.analyze([...rows,...rows]).encounters,result.encounters);
assert.equal(a.analyze(rows,{exposure:'repeat'}).progression.medianSuccessfulTimeMs,660000,'Run duration is whole-run context');
assert.equal(a.analyze(rows,{exposure:'repeat'}).remediation.linkedRetests.count,6,'Linkage retains original evidence outside response filter');
const one=a.analyze(rows,{run:JSON.stringify(['synthetic-market','run-1'])});assert.equal(one.overview.runs,1);assert.equal(one.stats.included,8);assert.equal(one.progression.successfulRate,1);
assert.equal(a.analyze(rows,{game:'does-not-exist'}).overview.runs,0);assert.equal(a.analyze(rows,{game:'does-not-exist'}).progression.successfulRate,null);
const partial=a.analyze(rows.filter(r=>r.event==='question'));assert.equal(partial.progression.successfulRate,null);assert.equal(partial.progression.unknown,6);assert.equal(partial.progression.medianSuccessfulTimeMs,null);
const conflict=a.analyze([...rows,{...rows.find(r=>r.event==='complete'),event:'timed_ended_early',eventID:'conflicting-end'}]);assert.equal(conflict.progression.successful,2);assert.equal(conflict.quality.outcomeConflicts,1);
const duplicateConflict=a.analyze([...rows,{...rows.find(r=>r.event==='complete'),event:'timed_ended_early'}]);assert.equal(duplicateConflict.quality.outcomeConflicts,1,'Conflicting endings cannot hide behind a duplicate event ID');
const generic=a.analyze(rows.map(r=>r.event.endsWith('complete')?{...r,event:'run_completed'}:r));assert.equal(generic.progression.successful,0,'Generic end markers do not establish success');
const invalid=a.analyze(rows.map(r=>({...r,totalTimeMs:-1,elapsedTimeMs:'NaN',timestamp:'invalid'})));assert.equal(invalid.progression.medianSuccessfulTimeMs,null);assert.equal(invalid.progression.successful,3);
assert.equal(a.analyze(rows.map(({localSequence,...r})=>r)).remediation.linkedRetests.count,0);
assert.deepEqual(a.analyze(rows.map(({localSequence,...r})=>r)).encounters.question.map(g=>g.count),[24,0,24]);
assert.equal(a.analyze(rows.map(r=>({...r,localSequence:1}))).remediation.linkedRetests.count,0,'Conflicting order cannot support retest linkage');
assert.equal(a.analyze(rows.map(r=>({...r,localSequence:r.localSequence+.5}))).remediation.linkedRetests.count,0,'Sequence counters must be positive integers');
assert.equal(a.analyze(rows.map(r=>({...r,originAttemptID:'unobserved'}))).remediation.linkedRetests.count,0);
assert.equal(a.analyze(rows.map(r=>({...r,runID:''}))).encounters.question.find(g=>g.label==='Unavailable').count,48);
const privateRows=rows.map(({event,eventID,runID,game,answerSnapshotJSON,localSequence,remediationStage,originAttemptID,...r})=>({
  ...r,event_type:event==='question'?'answer_evaluated':event==='start'?'run_started':'run_completed',event_id:eventID,run_id:runID,game_id:game,
  completion_status:event==='question'||event==='start'?'':event,remediation_stage:remediationStage==='repair'?'repair':'',bridge_stage:remediationStage==='bridge'?'bridge':'',retest_stage:remediationStage==='retest'?'retest':'',
  extras_json:JSON.stringify({answerSnapshotJSON,localSequence,originAttemptID,sourceEvent:event,contractID:'mq-measurement/1'})
}));
const privateResult=a.analyze(a.parseCSV(csv(privateRows)));assert.equal(privateResult.progression.successful,3);assert.equal(privateResult.remediation.linkedRetests.count,6);
assert.equal(privateResult.difficulties.find(g=>g.label==='Legendary').count,12,'Authored private difficulty is independent of quiz mode');
assert.equal(privateResult.difficulties.find(g=>g.label==='Easy').count,12);
const difficultyConflict=structuredClone(privateRows);difficultyConflict.find(r=>r.event_type==='answer_evaluated').difficulty='hard';
assert(a.analyze(difficultyConflict,{exposure:'repeat'}).quality.difficultyConflicts>0,'Filtering must not hide metadata contradictions');
const rare=privateRows.map(r=>({...r,difficulty:r.difficulty==='legendary'?'Checkpoint extension':r.difficulty}));assert.equal(a.analyze(rare).difficulties.find(g=>g.label==='Checkpoint extension').count,12);
assert.equal(a.analyze(privateRows.map(r=>({...r,difficulty:r.difficulty?.toUpperCase()}))).difficulties.find(g=>g.label==='Easy').count,12);
assert.equal(a.analyze(privateRows.map(r=>({...r,difficulty:'undefined'}))).difficulties.find(g=>g.label==='Unknown').count,48);
const firstEight=rows.filter(r=>r.event==='question').slice(0,8);
const boundaries=[14999,15000,29999,30000,59999,60000,120000,120000.5];
assert.deepEqual(a.analyze(firstEight.map((r,i)=>({...r,responseTimeMs:boundaries[i]}))).distribution.map(b=>b.count),[1,2,2,2,1]);
const sparse=a.analyze(firstEight.map((r,i)=>({...r,responseTimeMs:[1000,2000,0,null,'',-1,'NaN',600000][i]})));
assert.equal(sparse.overview.medianResponseTimeMs,2000);assert.equal(sparse.overview.averageResponseTimeMs,201000);
const revised=structuredClone(firstEight);for(let i=4;i<8;i++){const s=JSON.parse(revised[i].answerSnapshotJSON);s.questionRevision='f'.repeat(64);revised[i].answerSnapshotJSON=JSON.stringify(s);}
assert.deepEqual(a.analyze(revised).encounters.question.map(g=>g.count),[8,0,0],'New version is a distinct first encounter when preceding ID history is fully accounted for');
const missingPrefix=revised.slice(4);assert.equal(a.analyze(missingPrefix).encounters.question.find(g=>g.label==='Unavailable').count,4);
const missingTopic=structuredClone(firstEight);missingTopic[0].tag='';assert(a.analyze(missingTopic).groups.find(g=>g.questionID==='S1').topics.includes('Topic unavailable'));
for(const game of ['Cost Directive','National Engine','Labyrinth of Choice','Market Gate','Faculty Composer']){
  const result=a.analyze(a.parseCSV(csv(rows.map(r=>({...r,game})))));assert.equal(result.stats.included,48);assert.equal(result.overview.correct,20);
  assert.equal(result.difficulties.find(g=>g.label==='Legendary').count,12,game+' local CSV difficulty');
  assert.equal(result.groups.find(g=>g.questionID==='S1').difficulty,'Easy',game+' question card difficulty');
}
const schemas=JSON.parse(fs.readFileSync(new URL('../telemetry_contract/schema.json',import.meta.url),'utf8')).schemas;
for(const schema of schemas){
  const privateFormat=schema.id.includes('anonymous'),hasSnapshots=schema.columns.includes('answerSnapshotJSON');
  const records=(privateFormat?privateRows:rows).map(row=>{
    const normalized=privateFormat?a.normalizeRow(row):row;
    // Historical schemas did not carry snapshots inside extras either.
    const extras=privateFormat?JSON.parse(row.extras_json):{};if(!hasSnapshots)delete extras.answerSnapshotJSON;
    return Object.fromEntries(schema.columns.map(column=>[column,column==='extras_json'?JSON.stringify(extras):normalized[column]??'']));
  });
  const parsed=a.analyze(a.parseCSV(csv(records)));
  assert.equal(parsed.stats.accepted,48,schema.id);assert.equal(parsed.stats.included,hasSnapshots?48:0,schema.id);
  assert.equal(parsed.stats.unresolved,hasSnapshots?0:48,schema.id);
  if(hasSnapshots){assert.equal(parsed.overview.correct,20,schema.id);assert.equal(parsed.difficulties.find(g=>g.label==='Easy').count,12,schema.id+' difficulty');}
}
const reference=a.analyze(referenceShapeRows());
assert.deepEqual([reference.overview.runs,reference.stats.included,reference.groups.length,reference.overview.correct,reference.overview.medianResponseTimeMs,reference.overview.averageResponseTimeMs],[18,881,354,787,33000,94000]);
assert.equal(Math.round(reference.overview.correct/reference.overview.knownCorrectness*100),89);
assert.equal(reference.coverage.atLeastFive,0,'Broad synthetic coverage is not deep evidence');
console.log('PASS: dashboard outcomes and denominators, difficulty provenance, private aliases, exact-version encounters, explicit remediation links, conflicts, time boundaries, missing data, duplicate imports, filters, all 11 registered CSV schemas and synthetic reference arithmetic.');
