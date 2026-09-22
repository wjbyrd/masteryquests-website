import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { MAX_WINDOWS, TOTAL_PRODUCT, productionRows, newRun, canAct, canReview, advance, operationalText } from './game/games/takeout-taco-lunch-rush/engine.js';
import { SCENES, sceneIndex, TWO_TRUCK_SCENE } from './game/games/takeout-taco-lunch-rush/scenes.js';
import { debriefQuestions, currentQuestion, answerDebrief, continueDebrief, debriefMetrics } from './game/games/takeout-taco-lunch-rush/debrief.js';
import { ANALYSIS_QUESTIONS, answerAnalysis, continueAnalysis, analysisMetrics } from './game/games/takeout-taco-lunch-rush/analysis.js';
import { graphPoints, productionGraph } from './game/games/takeout-taco-lunch-rush/graphs.js';
import { allocationResult, chooseAllocation, continueTwoTruck, answerTwoTruck, twoTruckMetrics } from './game/games/takeout-taco-lunch-rush/two-truck.js';
import { STORAGE_PREFIX, createRecorder } from './game/games/takeout-taco-lunch-rush/telemetry.js';

test('opening is not production; supplied schedule and adjacent increments are exact', () => {
  assert.deepEqual(newRun(), { phase:'intro',workers:0,previousWorkers:null,round:0,output:null,addedOutput:null,tested:[],backlog:0,answers:[],questionIndex:0,finalCrew:null,analysisAnswers:{total_graph:null,marginal_graph:null},twoTruck:{attempts:[],current:null,bestAllocationFound:false,capacityAnswer:null,dmrAnswer:null} });
  assert.deepEqual(productionRows().map(r=>r.output),[8,18,31,42,50,53]);
  assert.deepEqual(productionRows().map(r=>r.added),[8,10,13,11,8,3]);
  const gains=productionRows().map(r=>r.added);
  assert.equal(gains.findIndex((n,i)=>i>0 && n<gains[i-1])+1,4);
  assert.equal(advance(newRun(),'call_worker').phase,'intro');
  const first=advance(newRun(),'start_rush');
  assert.equal(first.output,8); assert.equal(first.addedOutput,null); assert.equal(first.round,1);
});
test('every legal management path to the 10-window cap preserves bounds, output, unique evidence and lock gating', t => {
  let visited=0, capped=0;
  function walk(s) {
    visited++;
    assert.ok(s.workers>=1 && s.workers<=6);
    assert.equal(s.output,TOTAL_PRODUCT[s.workers]);
    assert.equal(s.tested.length,new Set(s.tested).size);
    // Adjacent staffing changes ensure all smaller crew levels have actually been tested.
    assert.deepEqual(s.tested,Array.from({length:Math.max(...s.tested)},(_,i)=>i+1));
    assert.equal(sceneIndex(s),s.workers===1 ? (s.backlog>8?1:0) : s.workers);
    assert.equal(canReview(s),s.tested.length>=4 || s.round===MAX_WINDOWS);
    if (canReview(s)) {
      const review=advance(s,'review_record');
      assert.equal(review.finalCrew,s.workers); assert.equal(review.phase,'debrief');
      assert.equal(advance(review,'call_worker'),review);
      assert.equal(continueDebrief(review),review);
    } else assert.equal(advance(s,'review_record'),s);
    if (s.round===MAX_WINDOWS) capped++;
    for(const action of ['call_worker','hold_crew','send_worker_home']) {
      const next=advance(s,action);
      if(!canAct(s,action)) { assert.equal(next,s); continue; }
      assert.equal(next.round,s.round+1);
      assert.equal(next.addedOutput,next.output-s.output);
      assert.equal(next.previousWorkers,s.workers);
      assert.equal(next.workers,s.workers+(action==='call_worker'?1:action==='send_worker_home'?-1:0));
      walk(next);
    }
  }
  walk(advance(newRun(),'start_rush'));
  t.diagnostic(`${visited} legal prefixes checked; ${capped} complete paths reach the cap.`);
});
test('solo backlog is calm through eight, stressed above eight, and returns depend on backlog', () => {
  let s=advance(newRun(),'start_rush');
  assert.equal(s.backlog,4);assert.equal(sceneIndex(s),0);
  for (const backlog of [6,8,10,12,14]) {s=advance(s,'hold_crew');assert.equal(s.backlog,backlog);assert.equal(s.output,8);assert.equal(sceneIndex(s),backlog>8?1:0);}
  s=advance(s,'call_worker');assert.equal(s.backlog,10);assert.equal(sceneIndex(s),2);
  s=advance(s,'send_worker_home');assert.equal(s.backlog,12);assert.equal(sceneIndex(s),1);
  let low=advance(advance(advance(newRun(),'start_rush'),'call_worker'),'send_worker_home');
  assert.equal(low.backlog,6);assert.equal(sceneIndex(low),0);
});
test('conditional debrief depths, every answer branch, calculations and completion guards', () => {
  for(const maximum of [4,5,6]) {
    let s=advance(newRun(),'start_rush');for(let i=1;i<maximum;i++)s=advance(s,'call_worker');
    // Selection uses observed maximum, even after reducing current crew.
    s=advance(s,'send_worker_home');s=advance(s,'review_record');
    const qs=debriefQuestions(s);assert.equal(qs.length,maximum===4?3:maximum===5?5:6);
    assert.equal(qs.some(q=>q.id==='sixth'),maximum===6);
    assert.equal(qs.some(q=>q.id==='comparison'),maximum>=5);
    for(const q of qs){
      assert.doesNotMatch(q.prompt+' '+q.options?.join(' ')+' '+q.explanation,/marginal product|total product/i);
      assert.equal(continueDebrief(s),s);
      assert.equal(answerDebrief(s,-1),s);assert.equal(answerDebrief(s,NaN),s);
      const candidates=q.kind==='calculation'?[0,8,13,31,50]:q.options.map((_,i)=>i);
      for(const value of candidates){const a=answerDebrief(s,value);assert.equal(a.answers.at(-1).correct,value===q.correct);assert.equal(answerDebrief(a,q.correct),a);}
      const a=answerDebrief(s,q.correct);assert.equal(a.phase,'debrief');s=continueDebrief(a);
    }
    assert.equal(s.phase,'total_graph');assert.equal(s.answers.length,qs.length);
    assert.equal(debriefMetrics(s).debriefQuestionsCorrect,qs.length);
    assert.equal(debriefMetrics(s).maximumCrewObserved,maximum);
    assert.equal(debriefMetrics(s).sixthWorkerCorrect,maximum===6?true:null);
    assert.equal(answerDebrief(s,0),s);assert.equal(continueDebrief(s),s);
    assert.equal(qs.find(q=>q.id==='calculation3').correct,31-18);
    if(maximum>=5)assert.equal(qs.find(q=>q.id==='calculation5').correct,50-42);
  }
});
test('all seven scene assets match the original supplied bytes and have meaningful alt text', () => {
  const hashes=['fc185dbaef8eda0e11e541637788be37ddb3f1bc27f71798ec8ee0540c719d4e','79be2bb1b9d1654959260ceecbfbb3a086c0802f3c6dc359cb3ed3c976c21681','0ea2dab55d8c375d95988a4c9cf0f1f441d82acdf82544f2b73272b265d76020','2ff7a7aaf6ece89639d1c5b1df2bb63e6f3e8e419a017f9eccb9aa283225a669','4b2808138408f0ccfc17863e4d300f8b05c29ff8fdad10dfb2121767e9d7bbfe','73172b530d4724a535afa51867155a2bea4d0142c9730d8a8220647cd5862968','2647bfa880ee10555361df1749f751ad76ef212046ebe56c24be64346df0262a'];
  assert.equal(SCENES.length,7);
  SCENES.forEach((s,i)=>{assert.equal(createHash('sha256').update(readFileSync(new URL(s.src))).digest('hex'),hashes[i]);assert.ok(s.alt.length>40);assert.match(s.src,/art\/scenes\/takeout-taco-lunch-rush\//);});
});
test('local telemetry records gameplay fields, tolerates storage failure, bounds history and isolates run IDs', () => {
  const values=new Map([['unrelated','keep']]);
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),key:i=>[...values.keys()][i],get length(){return values.size;}};
  for(let n=0;n<25;n++) createRecorder(storage,()=>{},`run-${n}`).log('start_rush',advance(newRun(),'start_rush'));
  assert.equal(values.size,21);assert.equal(values.get('unrelated'),'keep');
  assert.ok(values.has(STORAGE_PREFIX+'run-24'));
  let warnings=0;
  const recorder=createRecorder({setItem(){throw new Error('blocked');}},()=>warnings++,'blocked');
  recorder.log('start_rush',advance(newRun(),'start_rush'));recorder.log('hold_crew',advance(advance(newRun(),'start_rush'),'hold_crew'));
  assert.equal(warnings,1);assert.equal(recorder.record.events.length,2);
  assert.equal(recorder.record.events[1].addedOutput,0);
  assert.equal(recorder.record.events[1].distinctCrewLevelsTested,1);
  assert.equal(recorder.record.events[1].sequenceNumber,2);
  assert.equal('playerID' in recorder.record.events[0],false);
});
test('operational dialogue separates backlog from congestion at each crew size', () => {
  assert.match(operationalText({workers:1,backlog:8}),/line is moving/);
  assert.match(operationalText({workers:1,backlog:9}),/piling up/);
  const matches=[/divided/,/Specialization/,/tighten/,/crowd/,/fighting for the same space and equipment/];
  for(let workers=2;workers<=6;workers++) {
    assert.match(operationalText({workers,backlog:4}),matches[workers-2]);
    assert.equal(operationalText({workers,backlog:4}),operationalText({workers,backlog:20}));
    assert.doesNotMatch(operationalText({workers,backlog:4}),/manageable/);
  }
});
test('observed graphs and later revealed points retain exact production values and positive MP', () => {
  for(let maximum=1;maximum<=6;maximum++) {
    const tested=Array.from({length:maximum},(_,i)=>i+1);
    assert.deepEqual(graphPoints('total',tested).map(p=>p.workers),tested);
    const full=graphPoints('total',tested,true);
    assert.deepEqual(full.map(p=>p.value),[8,18,31,42,50,53]);
    assert.deepEqual(full.map(p=>p.observed),[1,2,3,4,5,6].map(n=>n<=maximum));
    const mp=graphPoints('marginal',tested,true);
    assert.deepEqual(mp.map(p=>p.value),[8,10,13,11,8,3]);
    assert.ok(mp.every(p=>p.value>0));
    assert.equal(mp.reduce((a,b)=>a.value>b.value?a:b).workers,3);
    assert.equal(mp.find((p,i)=>i>0&&p.value<mp[i-1].value).workers,4);
    assert.match(productionGraph('total',tested),/role="img" aria-labelledby=/);
    assert.match(productionGraph('marginal',tested,true),/Worker 3: peak 13 · Worker 4: first decline 11/);
  }
});
test('all 256 graph and capacity/DMR answer combinations preserve phase order', () => {
  for(let total=0;total<4;total++)for(let marginal=0;marginal<4;marginal++)for(let capacity=0;capacity<4;capacity++)for(let dmr=0;dmr<4;dmr++){
    let s={...newRun(),phase:'total_graph',workers:4,round:4,output:42,tested:[1,2,3,4]};
    for(const [phase,value,next] of [['total_graph',total,'marginal_graph'],['marginal_graph',marginal,'connect_graphs']]){
      assert.equal(s.phase,phase);assert.equal(continueAnalysis(s),s);
      assert.equal(answerAnalysis(s,-1),s);assert.equal(answerAnalysis(s,4),s);
      s=answerAnalysis(s,value);assert.equal(s.analysisAnswers[phase].correct,value===ANALYSIS_QUESTIONS[phase].correct);
      assert.equal(answerAnalysis(s,0),s);s=continueAnalysis(s);assert.equal(s.phase,next);
    }
    s=continueAnalysis(s);assert.equal(s.phase,'reveal');
    assert.equal(chooseAllocation(s,3),s);s=continueAnalysis(s);assert.equal(s.phase,'two_truck');
    assert.equal(continueTwoTruck(s),s);s=chooseAllocation(s,3);s=continueTwoTruck(s);assert.equal(s.phase,'capacity_question');
    assert.equal(continueTwoTruck(s),s);s=answerTwoTruck(s,capacity);assert.equal(s.twoTruck.capacityAnswer.correct,capacity===2);
    assert.equal(answerTwoTruck(s,2),s);s=continueTwoTruck(s);assert.equal(s.phase,'dmr_transfer');
    assert.equal(continueTwoTruck(s),s);s=answerTwoTruck(s,dmr);assert.equal(s.twoTruck.dmrAnswer.correct,dmr===2);
    s=continueTwoTruck(s);assert.equal(s.phase,'complete');assert.equal(continueTwoTruck(s),s);assert.equal(answerTwoTruck(s,2),s);
    assert.equal(s.round,4);assert.equal(s.workers,4);assert.equal(s.output,42);
    assert.equal(twoTruckMetrics(s).capacityQuestionCorrect,capacity===2);
    assert.equal(twoTruckMetrics(s).dmrTransferCorrect,dmr===2);
  }
});
test('allocation arithmetic, every retry prefix through eight attempts, and reset', t => {
  assert.equal(allocationResult(6).combinedOutput,53);
  for(const [a,total] of [[5,58],[4,60],[3,62]]){
    const r=allocationResult(a);assert.equal(r.allocationTruckA+r.allocationTruckB,6);assert.equal(r.combinedOutput,total);
    assert.equal(r.truckAOutput+r.truckBOutput,total);
  }
  let count=0;
  function walk(s,depth){
    assert.equal(chooseAllocation(s,6),s);assert.equal(chooseAllocation(s,2),s);
    for(const a of [5,4,3]){
      const result=chooseAllocation(s,a);count++;
      assert.equal(result.twoTruck.attempts.length,s.twoTruck.attempts.length+1);
      assert.equal(chooseAllocation(result,a),result);
      const next=continueTwoTruck(result);
      assert.equal(next.phase,a===3?'capacity_question':'two_truck');
      assert.equal(result.twoTruck.bestAllocationFound,a===3);
      if(a!==3 && depth<8)walk(next,depth+1);
    }
  }
  walk({...newRun(),phase:'two_truck'},1);t.diagnostic(`${count} allocation attempts across all retry prefixes through eight attempts.`);
  assert.deepEqual(newRun().twoTruck,{attempts:[],current:null,bestAllocationFound:false,capacityAnswer:null,dmrAnswer:null});
  assert.match(TWO_TRUCK_SCENE.src,/takout-taco-worker-7\.webp$/);
  assert.ok(TWO_TRUCK_SCENE.alt.includes('three workers'));
  assert.equal(createHash('sha256').update(readFileSync(new URL(TWO_TRUCK_SCENE.src))).digest('hex'),'4f4851c0a85a3c875b77502613fb4d0de8625a4a78f4072e8e5cbdd3e478f751');
});
