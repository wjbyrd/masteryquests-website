import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {dashboardRows} from './dashboard-fixtures.mjs';
import {releaseRows} from './release-fixtures.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js');
const rows=dashboardRows(),result=a.analyze(rows);
assert.equal(result.overview.medianBestStreak,3);
assert.equal(a.analyze(rows.map(({streak,maxStreak,...r})=>r)).overview.medianBestStreak,null);
assert.equal(a.analyze(rows.map(r=>({...r,streak:0,maxStreak:0}))).overview.medianBestStreak,0);
const varied=rows.map(r=>({...r,streak:Number(r.runID.split('-')[1]),maxStreak:Number(r.runID.split('-')[1])}));
assert.equal(a.analyze([...varied,...varied]).overview.medianBestStreak,2.5,'One peak per run, not one per answer');
assert.equal(a.analyze(varied,{run:JSON.stringify(['synthetic-market','run-4'])}).overview.medianBestStreak,4);
assert.equal(a.analyze(varied,{exposure:'first'}).overview.medianBestStreak,2.5,'Answer filters retain whole-run context');
assert.equal(a.analyze(varied,{game:'missing'}).overview.medianBestStreak,null);

const focus=a.teachingGuidance(result);
assert.equal(focus.focus.topic,'tax_incidence_less_elastic_side');assert.equal(focus.question.questionID,'T2');
assert(focus.action.includes(focus.question.prompt));assert(focus.pattern.includes('lower accuracy'));
assert.equal(focus.state(result.topics.find(g=>g.topic==='equilibrium')),'Some errors observed');
assert.equal(focus.state(result.topics.find(g=>g.topic==='supply')),'No recorded errors');
assert.equal(a.teachingGuidance(result,20).focus,null);
const oneRun=a.analyze(rows,{run:JSON.stringify(['synthetic-market','run-0'])});
assert(a.teachingGuidance(oneRun,1).priorities.length===0,'A single run cannot establish a topic priority');
assert.equal(a.teachingGuidance(result,5,'objectives').focus.objective,'LO3');

function topicRows(game,tag,total,correct){
  const base=releaseRows()[0],snapshot=JSON.parse(base.answerSnapshotJSON);
  return Array.from({length:total},(_,i)=>({...base,game,tag,runID:'r-'+i%3,eventID:game+tag+i,attemptID:game+tag+i,correct:Number(i<correct),
    answerSnapshotJSON:JSON.stringify({...snapshot,gameID:game,questionID:tag,selectedIndex:i<correct?1:0,selectedAnswer:snapshot.options[i<correct?1:0]})}));
}
const weighted=a.analyze([...topicRows('a','large',100,90),...topicRows('a','small',10,8),...topicRows('a','perfect',10,10),...topicRows('b','alone',20,1)]);
const w=a.teachingGuidance(weighted);assert.equal(w.baselines.get('a'),108/120);
assert.deepEqual(w.priorities.map(g=>g.topic),['small'],'Compare within a game; large topics are response-weighted');
assert.equal(w.state(weighted.topics.find(g=>g.topic==='alone')),'Some errors observed','A low rate without a comparison is not a relative priority');
const tied=a.analyze([...topicRows('a','one',10,5),...topicRows('a','two',10,5)]);
assert.equal(a.teachingGuidance(tied).priorities.length,0);
const many=a.analyze(Array.from({length:8},(_,i)=>topicRows('a','topic-'+i,10,i)).flat());
assert.equal(a.teachingGuidance(many).priorities.length,3);
const conflict=structuredClone(result);conflict.stats.keyConflicts=1;
assert.equal(a.teachingGuidance(conflict).priorities.length,0);assert.equal(a.teachingGuidance(conflict).question,null);

const missed=result.remediation.incorrectLinkedRetests;
assert.equal(missed.reduce((n,g)=>n+g.count,0),5);assert.equal(JSON.parse(missed[0].key)[1],'T1');
assert.equal(a.analyze([...rows,...rows]).remediation.incorrectLinkedRetests[0].count,5);
assert.equal(a.analyze(rows,{exposure:'first'}).remediation.incorrectLinkedRetests.length,0);
assert.equal(a.analyze(rows.map(r=>({...r,originAttemptID:''}))).remediation.incorrectLinkedRetests.length,0);

const original=rows.map(r=>({...r,__sourceFile:1})),overlap=rows.map(r=>({...r,__sourceFile:2}));
const invalid={...rows.find(r=>r.event==='question'),attemptID:'invalid',eventID:'invalid',answerSnapshotJSON:'',__sourceFile:3};
const eventOnly={event:'start',runID:'empty',eventID:'event-only',__sourceFile:4};
const files=a.analyze([...original,...overlap,invalid,eventOnly]);
assert.equal(files.overview.files,1);assert.equal(files.fileContributions.find(f=>f.id===2).duplicates,rows.length);
assert.equal(files.fileContributions.find(f=>f.id===3).unresolved,1);assert.equal(files.fileContributions.find(f=>f.id===4).otherRows,1);
assert.equal(files.fileContributions.reduce((n,g)=>n+g.included,0),files.stats.included);
const filtered=a.analyze([...original,...overlap],{mode:'quiz'});
assert.equal(filtered.fileContributions[0].included,24);assert.equal(filtered.fileContributions[0].filtered,24);
const collection=a.createCollection();collection.addRows('first',original);collection.addRows('overlap',overlap.map(r=>({...r,note:'different container'})));
assert.equal(a.analyze(collection.rows()).overview.files,1);collection.remove(collection.entries()[0].id);
assert.equal(a.analyze(collection.rows()).fileContributions[0].included,48,'Removing the earlier source makes overlapping answers contribute');
console.log('PASS: within-game weighted priorities, evidence minimums, ties/conflicts, linked retest misses, median run peaks, file contribution reasons and overlap ownership.');
