import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js');
export function fixture(run,count,correctCount){
 return Array.from({length:count},(_,i)=>({event:'question',attemptID:`${run}-${i}`,eventID:`${run}-event-${i}`,runID:run,mode:i%2?'quiz':'trialGraph',game:'Classroom Quest',tag:i%2?'demand':'supply',correct:i<correctCount?1:0,supportJSON:JSON.stringify({artifactApplied:false}),answerSnapshotJSON:JSON.stringify({schema:'mq-answer-snapshot/1',questionID:'q'+i%5,questionRevision:String(i%5+1).repeat(64),prompt:'Question '+i%5,options:['Increase','Decrease'],optionOrder:'canonical',selectedIndex:0,selectedAnswer:'Increase',priorExposureCount:0})}));
}
export function csv(rows){const keys=Object.keys(rows[0]);return [keys,...rows.map(r=>keys.map(k=>r[k]))].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');}
const first=csv(fixture('run1',15,12)),second=csv(fixture('run2',10,4)),c=a.createCollection();
assert(c.add('class.csv',first));assert.equal(a.analyze(c.rows()).stats.included,15);
assert(c.add('class.csv',second));let report=a.analyze(c.rows());assert.equal(report.stats.included,25);assert.equal(report.overview.runs,2);assert.equal(report.overview.correct,16);assert.equal(report.overview.knownCorrectness,25);assert.equal(report.overview.questions,5);
assert.equal(report.topics.reduce((n,t)=>n+t.count,0),25);assert.equal(report.topics.reduce((n,t)=>n+t.correct,0),16);
assert(!c.add('renamed.csv',first));assert.equal(c.entries().length,2);
assert(c.add('overlap.csv',csv(fixture('run1',10,10))));assert.equal(a.analyze(c.rows()).stats.included,25);
assert.throws(()=>c.add('broken.csv','not a CSV'));assert.equal(c.entries().length,3);
c.remove(c.entries()[0].id);assert.equal(a.analyze(c.rows()).stats.included,20);c.clear();assert.equal(c.rows().length,0);
for(let i=0;i<30;i++)c.add('student-'+i+'.csv',csv(fixture('class-'+i,15,10)));
report=a.analyze(c.rows());assert.equal(report.stats.included,450);assert.equal(report.overview.correct,300);assert.equal(report.overview.runs,30);
const filtered=a.analyze(c.rows(),{mode:'quiz'});assert.equal(filtered.stats.included,210);assert.equal(filtered.overview.correct,150);
console.log('PASS: cumulative imports, same filenames, duplicate/overlap protection, removal, bad files, 30-run class totals, weighted accuracy, topics and filters.');
