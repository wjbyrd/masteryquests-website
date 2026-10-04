import test from 'node:test';
import assert from 'node:assert/strict';
import {GAME_CONFIG as G,CYCLES,GAME_BALANCE as B} from '../config.js';
import {createAssignedRun,visibleCities,rivalRevealed,raceResult} from '../rivalry.js';
import {createRun,commitRun,finishRunCycle,nextRunCycle} from '../session.js';
import {reportHTML} from '../debrief.js';

test('Assignment covers both cities evenly and preserves legal independent doctrines',()=>{
  const counts={meridian:0,rivermark:0};
  for(let i=0;i<100;i++){const run=createAssignedRun({random:()=>i/100});counts[run.playerCity]++;assert.notEqual(run.playerCity,run.rivalCity);}
  assert.deepEqual(counts,{meridian:50,rivermark:50});
});
test('Ten rounds resolve both cities from the start; only player is visible before Round 3',()=>{
  assert.equal(G.totalRounds,10);assert.equal(CYCLES.length,G.totalRounds);
  for(const id of ['meridian','rivermark']){
    const run=createRun(id,{doctrine:'balanced'});
    for(let round=1;round<=G.totalRounds;round++){
      assert.equal(run.currentCycle,round);assert.equal(run.phase,'planning');
      assert.equal(rivalRevealed(run),round>=G.rivalRevealRound);
      assert.equal(visibleCities(run).length,round<G.rivalRevealRound?1:2);
      if(round<G.rivalRevealRound)assert.equal(visibleCities(run)[0].id,id);
      run.allocation={capital:5,resources:5,research:5,education:5};assert.equal(commitRun(run),true);
      assert.ok(run.pendingCities.every(c=>c.history.length===round));
      assert.equal(finishRunCycle(run),true);assert.equal(nextRunCycle(run),true);
    }
    assert.equal(run.phase,'finished');assert.ok(run.cities.every(c=>c.history.length===G.totalRounds));assert.equal(commitRun(run),false);
    const html=reportHTML(run);assert.ok(html.indexOf('race-result-title')<html.indexOf('report-title'));
    assert.match(html,/rounds 3–10/);assert.match(html,/across 10 rounds/);assert.doesNotMatch(html,/six cycles|3–6/);
    assert.equal(run.cities.find(c=>c.id===id).invested.capital,G.totalRounds*B.developmentPointsPerCycle/4);
  }
});
test('Role-aware outcomes combine lead, gap closure and own growth instead of ranking percentages',()=>{
  const fixture=(id,m,r)=>{const run=createRun(id);run.initialCities[0].outputPerWorker=100;run.initialCities[1].outputPerWorker=20;run.cities[0].outputPerWorker=m;run.cities[1].outputPerWorker=r;return raceResult(run);};
  assert.equal(fixture('meridian',120,25).outcome,'held-growing');
  assert.equal(fixture('meridian',102,21).outcome,'held-limited');
  assert.equal(fixture('meridian',120,60).outcome,'closing');
  assert.equal(fixture('meridian',100,95).outcome,'closing');
  assert.equal(fixture('meridian',90,100).outcome,'overtaken');
  assert.equal(fixture('rivermark',120,30).outcome,'modest');
  assert.equal(fixture('rivermark',120,60).outcome,'narrowed');
  assert.equal(fixture('rivermark',120,115).outcome,'near');
  assert.equal(fixture('rivermark',120,130).outcome,'overtook');
  assert.equal(fixture('rivermark',120,20).outcome,'trailing');
  for(const role of ['meridian','rivermark'])assert.equal(fixture(role,120,120.01).outcome,'level');
  // Higher percentage growth cannot automatically defeat the city still leading.
  const leader=fixture('meridian',120,50);assert.ok(leader.rival.score>leader.player.score);assert.match(leader.headline,/held the lead/);
  // Relative narrowing during contraction is explicitly qualified.
  assert.match(fixture('rivermark',40,15).explanation,/own output per worker fell/);
  assert.match(fixture('meridian',90,15).explanation,/own output per worker fell/);
  assert.equal(fixture('meridian',99.999,20).player.score,0);
});
