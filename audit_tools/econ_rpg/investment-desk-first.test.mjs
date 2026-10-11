import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {FIRST_LIBRARY,FALLBACKS} from './game/games/the-investment-desk/first-library.js';
import {generateFirst,assessScenario,fallbackScenario,projectValue,MAX_ATTEMPTS} from './game/games/the-investment-desk/first-scenario.js';
import {npv,bestPortfolio,comparisonScale} from './game/games/the-investment-desk/finance.js';
import {Game,world} from './game/games/the-investment-desk/engine.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const independentlyValue=p=>p.flows.map((c,i)=>c/Math.pow(1+p.rate,i+1)).reduce((a,b)=>a+b,0)-p.cost;
const independentBest=s=>{
  let maximum=0,selected=[];
  function visit(index,cost,value,ids){if(cost>s.budget)return;if(index===s.projects.length){if(value>maximum){maximum=value;selected=ids;}return;}visit(index+1,cost,value,ids);const p=s.projects[index];visit(index+1,cost+p.cost,value+independentlyValue(p),[...ids,p.id]);}
  visit(0,0,0,[]);return {maximum,selected};
};
test('20 distinct templates provide different horizons, identities and schedules',()=>{assert.equal(FIRST_LIBRARY.length,20);assert.equal(new Set(FIRST_LIBRARY.map(p=>p.id)).size,20);assert.equal(new Set(FIRST_LIBRARY.map(p=>p.icon)).size,20);assert.equal(new Set(FIRST_LIBRARY.map(p=>JSON.stringify(p.flows))).size,20);for(const p of FIRST_LIBRARY){assert.equal(p.duration,p.flows.length);assert.ok(p.cost>0);assert.equal(p.rate,.1);assert.ok(p.generation.driver);for(const flows of p.generation.schedules)assert.ok(flows.length>=2&&flows.length<=5);}});
test('NPV discount rates and schedules agree with independent examples',()=>{near(npv(100,[108],.08),0);near(npv(100,[0,125.44],.12),0);near(npv(100,[0,0,0,0,161.051],.1),0);assert.ok(npv(100,[60,60],.08)>npv(100,[60,60],.12));});
test('100 seeded scenarios obey economic constraints and exact independent optimization',async()=>{
  const sets=new Set(),compositions=new Set(),rates=new Set(),budgets=new Set(),durations=new Set(),finances=new Map(),appearances=new Map(),wins=new Map();let smallerBundle=0,fallbacks=0,maxAttempts=0;
  const records=[];
  for(let seed=0;seed<100;seed++){
    const s=generateFirst(seed),g=new Game(seed),quality=assessScenario(s);assert.deepEqual(s,g.first);assert.deepEqual(s,generateFirst(seed));assert.ok(quality.valid);assert.equal(s.projects.length,6);assert.equal(new Set(s.projects.map(p=>p.id)).size,6);assert.ok(s.budget>=200000&&s.budget<=300000);assert.equal(s.budget%25000,0);assert.ok(s.attempts<=MAX_ATTEMPTS);
    rates.add(s.rate);budgets.add(s.budget);sets.add(s.projects.map(p=>p.id).toSorted().join(','));compositions.add(quality.best.ids.toSorted().join(','));smallerBundle+=quality.excludesLargest;fallbacks+=s.fallback;maxAttempts=Math.max(maxAttempts,s.attempts);
    for(const p of s.projects){assert.ok(p.cost>0&&Number.isFinite(p.cost));assert.ok(p.flows.every(Number.isFinite));assert.equal(p.duration,p.flows.length);assert.equal(p.rate,s.rate);near(projectValue(p),independentlyValue(p));durations.add(p.duration);finances.set(p.id,new Set([...(finances.get(p.id)||[]),JSON.stringify([p.cost,p.flows,p.rate])]));appearances.set(p.id,(appearances.get(p.id)||0)+1);if(quality.best.ids.includes(p.id))wins.set(p.id,(wins.get(p.id)||0)+1);}
    near(quality.best.value,independentBest(s).maximum);assert.ok(quality.best.cost<=s.budget);
    g.start();for(const id of quality.best.ids)assert.ok(g.toggle(id));near(g.firstResult().value,quality.best.value);assert.equal(g.remaining(),s.budget-quality.best.cost);assert.ok(g.remaining()>=0);
    const unfundedPositive=s.projects.find(p=>!quality.best.ids.includes(p.id)&&projectValue(p)>0);assert.ok(unfundedPositive);assert.equal(g.toggle(unfundedPositive.id),false);
    records.push({seed,budget:s.budget,rate:s.rate,ids:s.projects.map(p=>p.id),best:quality.best,fallback:s.fallback,attempts:s.attempts,excludesLargest:quality.excludesLargest});
  }
  assert.ok(sets.size>=75);assert.ok(compositions.size>=60);assert.ok(smallerBundle>=30&&smallerBundle<=85);assert.equal(rates.size,3);assert.equal(budgets.size,5);assert.equal(durations.size,4);assert.equal(appearances.size,20);assert.equal(wins.size,20);for(const [id,count] of wins)assert.ok(count<appearances.get(id),`${id} must not always win`);for(const variants of finances.values())assert.ok(variants.size>1);
  const summary={seeds:100,distinctProjectSets:sets.size,distinctOptimalCompositions:compositions.size,optimalExcludesLargest:smallerBundle,fallbacks,maxAttempts,winningProjectIdentities:wins.size,rates:[...rates],budgets:[...budgets],durations:[...durations]};
  await mkdir('tmp/econ-rpg/investment-desk',{recursive:true});await writeFile('tmp/econ-rpg/investment-desk/scenario-validation.json',JSON.stringify({summary,records},null,2));console.log(summary);
});
test('all fallback scenarios are validated and zero-attempt generation terminates safely',()=>{for(let i=0;i<FALLBACKS.length;i++){const s=fallbackScenario(i);assert.ok(assessScenario(s).valid);near(assessScenario(s).best.value,independentBest(s).maximum);assert.deepEqual(generateFirst(i,{maxAttempts:0}),s);}assert.ok(generateFirst(99,{maxAttempts:-1}).fallback);assert.ok(generateFirst(1,{maxAttempts:1}).attempts<=1);});
test('optimizer keeps empty/all-negative portfolios, spare cash, exact ties and sub-cent precision',()=>{assert.deepEqual(bestPortfolio([{id:'bad',cost:1,value:-1}],100),{ids:[],cost:0,value:0});assert.deepEqual(bestPortfolio([{id:'a',cost:5,value:2},{id:'b',cost:6,value:2}],10).ids,['a']);assert.deepEqual(bestPortfolio([{id:'a',cost:5,value:2.000000001},{id:'b',cost:6,value:2.000000002}],10).ids,['b']);assert.equal(bestPortfolio([{id:'a',cost:5,value:1}],100).cost,5);assert.deepEqual(bestPortfolio([{id:'zero',cost:1,value:0}],1).ids,[]);});
test('scenario remains stable during drafting, commitment, and an isolated Second Quest',()=>{const g=new Game(42),snapshot=JSON.stringify(g.first),worldBefore=world(42);g.start();const p=g.first.projects[0];g.toggle(p.id);g.toggle(p.id);g.toggle(p.id);g.commitFirst();const firstResult=g.firstResult();g.unlock();assert.equal(g.remaining(),250000);assert.deepEqual(g.second,{});assert.equal(g.fees,0);g.research('packing');g.act('energy','invest');assert.equal(JSON.stringify(g.first),snapshot);assert.deepEqual(g.firstResult(),firstResult);assert.deepEqual(world(42),worldBefore);assert.equal(g.toggle(p.id),false);});
test('comparison graphic uses a zero baseline for positive, empty and negative portfolios',()=>{let s=comparisonScale(50,100);near((s.player-s.zero)/(s.best-s.zero),.5);assert.equal(s.zero,36);s=comparisonScale(-50,100);assert.ok(s.player<s.zero&&s.best>s.zero);near((s.zero-s.player)/(s.best-s.zero),.5);s=comparisonScale(0,100);assert.equal(s.player,s.zero);s=comparisonScale(0,0);assert.ok(Object.values(s).every(Number.isFinite));assert.equal(s.player,s.best);});
