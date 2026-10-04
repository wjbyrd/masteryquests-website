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
test('Race uses percentage productivity improvement, including losses and rounded ties, never raw size',()=>{
  const run=createRun('rivermark');const player=run.cities[1],rival=run.cities[0];
  const set=(p,r)=>{player.outputPerWorker=run.initialCities[1].outputPerWorker*(1+p/100);rival.outputPerWorker=run.initialCities[0].outputPerWorker*(1+r/100);return raceResult(run);};
  assert.equal(set(20,5).outcome,'win');assert.ok(player.outputPerWorker<rival.outputPerWorker);
  assert.equal(set(5,20).outcome,'loss');assert.equal(set(20.01,20.02).outcome,'draw');
  assert.equal(set(-5,-20).outcome,'win');assert.equal(set(-20,-5).outcome,'loss');
  assert.equal(set(0,0).outcome,'draw');assert.equal(set(-.001,.001).player.score,0);
});
