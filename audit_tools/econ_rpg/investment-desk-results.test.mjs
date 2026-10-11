import test from 'node:test';
import assert from 'node:assert/strict';
import {workedNPV} from './game/games/the-investment-desk/npv-view.js';
import {resultComparison} from './game/games/the-investment-desk/results-view.js';

test('worked example aggregates chosen projects, handles different durations and actual rate',()=>{
  const html=workedNPV([{name:'Early',cost:100,flows:[112]},{name:'Later',cost:50,flows:[0,62.72]}],.12);
  assert.match(html,/Early \+ Later · 12%/);assert.match(html,/\$112\.00 ÷ 1\.12<sup>1/);assert.match(html,/\$62\.72 ÷ 1\.12<sup>2/);
  assert.match(html,/Future flows today<strong>\$150\.00/);assert.match(html,/Initial investment<strong>\$150\.00/);assert.match(html,/NPV<strong class="positive">\$0\.00/);
});
test('worked example keeps losses signed and empty portfolio separate from fees',()=>{
  const html=workedNPV([{name:'Loss',cost:100,flows:[-11]}],.1);assert.match(html,/−\$11\.00/);assert.match(html,/NPV<strong class="negative">−\$110\.00/);
  const empty=workedNPV([],.1,{note:'Net value after fees: −$2,000.'});assert.match(empty,/Project NPV = \$0/);assert.match(empty,/Net value after fees: −\$2,000/);
});
test('result bars use a shared zero-aware scale for losses, gains and zero',()=>{
  for(const pair of [[10,-30],[-10,-40],[-30,50],[0,0],[10,20]]){
    const html=resultComparison(...pair,String),bars=[...html.matchAll(/<rect[^>]*x="([\d.]+)"[^>]*width="([\d.]+)"/g)];
    assert.equal(bars.length,2);for(const [,x,width] of bars){assert.ok(+x>=36&&+x<=564);assert.ok(+width>=0&&+x + +width<=564.00001);}
    if(pair[0]===0&&pair[1]===0)assert.ok(bars.every(b=>+b[2]===0));
  }
});
