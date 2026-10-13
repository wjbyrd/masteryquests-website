import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {releaseRows} from './release-fixtures.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js');
export function statsRows(){
 const rows=releaseRows(),out=[];
 for(let run=0;run<6;run++){
  let streak=0,best=0;for(const [i,row] of rows.slice(run*8,run*8+8).entries()){streak=row.correct?streak+1:0;best=Math.max(best,streak);out.push({...row,elapsedTimeMs:(i+1)*1000,streak});}
  out.push({event:'quiz_complete',eventID:'end-'+run,runID:'run-'+run,game:'Synthetic Market Practice',mode:run%2?'trialGraph':'quiz',totalTimeMs:(run+1)*60000,elapsedTimeMs:(run+1)*60000,maxStreak:best,streak});
 }
 return out;
}
const rows=statsRows(),result=a.analyze(rows),o=result.overview;
assert.equal(o.recordedTimeMs,1260000);assert.equal(o.medianRunTimeMs,210000);assert.equal(o.timedRuns,6);assert.equal(o.bestStreak,3);assert.equal(o.streakRuns,6);
assert.deepEqual(a.analyze([...rows,...rows]).overview,o,'Overlapping exports must not inflate time or streaks');
assert.equal(a.analyze(rows,{exposure:'first'}).overview.recordedTimeMs,o.recordedTimeMs,'Exposure filters retain whole-run context');
assert.equal(a.analyze(rows,{mode:'quiz'}).overview.recordedTimeMs,540000);assert.equal(a.analyze(rows,{mode:'quiz'}).overview.medianRunTimeMs,180000);
assert.equal(a.analyze(rows,{assistance:'assisted'}).overview.recordedTimeMs,360000);assert.equal(a.analyze(rows,{assistance:'assisted'}).overview.bestStreak,1);
const early=rows.slice(0,8).map(({streak,elapsedTimeMs,...r})=>r);early.push({...rows[8],event:'timed_ended_early',elapsedTimeMs:0});assert.equal(a.analyze(early).overview.recordedTimeMs,60000);assert.equal(a.analyze(early).overview.bestStreak,3);
const partial=a.analyze(rows.filter(r=>r.event==='question'));assert.equal(partial.overview.recordedTimeMs,48000);assert.equal(partial.overview.bestStreak,3);
const missing=a.analyze(releaseRows()).overview;assert.equal(missing.recordedTimeMs,null);assert.equal(missing.bestStreak,null);assert.equal(missing.timedRuns,0);
const mixed=a.analyze([...rows.slice(0,9),...releaseRows().slice(8)]).overview;assert.equal(mixed.runs,6);assert.equal(mixed.timedRuns,1);assert.equal(mixed.streakRuns,1);
const admin=rows.map(({event,eventID,runID,elapsedTimeMs,...r})=>({...r,event_type:event==='question'?'answer_evaluated':'run_completed',event_id:eventID,run_id:runID,elapsed_time_ms:elapsedTimeMs}));assert.equal(a.analyze(admin).overview.recordedTimeMs,o.recordedTimeMs);
assert.equal(a.analyze(rows.map(r=>({...r,runID:''}))).overview.timedRuns,0,'No anonymous run identity may be invented');
assert.equal(a.analyze(rows.map(r=>({...r,elapsedTimeMs:'NaN',totalTimeMs:-1,streak:'invalid',maxStreak:-1}))).overview.recordedTimeMs,null);
assert.equal(a.analyze(rows.map(r=>({...r,streak:0,maxStreak:0}))).overview.bestStreak,0,'Recorded zero differs from missing');
assert.equal(a.duration(0),'0s');assert.equal(a.duration(3600000),'1h');assert.equal(a.duration(90000),'1m 30s');assert.equal(a.duration(null),'Not recorded');
const small=a.analyze(releaseRows().slice(0,2)),one=a.feedbackSummary(small,{fileCount:1,minResponses:1});
assert(one.includes('Review minimum: 1 response'));assert(one.includes('Results meeting the review minimum'));assert(one.includes('limited evidence'));assert(!one.includes('requires at least 5'));
assert(a.feedbackSummary(small,{fileCount:1,minResponses:5}).includes('selected minimum of 5 responses'));
assert(a.feedbackSummary(small,{fileCount:1,minResponses:10}).includes('selected minimum of 10 responses'));
assert(a.feedbackSummary(result,{fileCount:6}).includes('recorded run time 21m; median run time 3m 30s; longest recorded correct-answer streak 3'));
console.log('PASS: time/streak totals, overlapping exports, partial and missing data, zero values, filters, private fields, and shared 1/5/10 response thresholds.');
