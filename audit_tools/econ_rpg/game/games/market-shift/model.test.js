import test from 'node:test';
import assert from 'node:assert/strict';
import {BANKS,SCENARIOS,initialValues,demand,supply,market,atPrice,check,freshRun,restoreRun,missions,missionText,quizQuestions,answerQuiz,advanceQuiz} from './model.js';
const copy=v=>structuredClone(v);
function solve(m,dSize=20,sSize=20){if(m.type==='shift'){const d=m.d*dSize,s=m.s*sSize;return {...initialValues(),d,s,...market(d,s)};}const a=atPrice(m.price,0,0,m.type);return {...initialValues(),price:m.price,qs:a.qs,qd:a.qd};}
function finishMissions(run){for(let i=0;i<5;i++){run.index=i;run.values=solve(missions(run)[i]);run.attempts=[{...check(missions(run)[i],run.values),values:copy(run.values)}];run.completed=true;if(i<4)run.records.push({id:run.plan[i],values:copy(run.values),attempts:copy(run.attempts),hints:0});}run.stage='quiz';return run;}

test('equilibria satisfy both curves throughout allowed shifts',()=>{
  for(let d=-30;d<=30;d+=5)for(let s=-30;s<=30;s+=5){const e=market(d,s);assert(Math.abs(demand(e.q,d)-e.p)<1e-9);assert(Math.abs(supply(e.q,s)-e.p)<1e-9);assert(e.q>=0&&e.q<=100&&e.p>=0&&e.p<=120);}
});
test('all 22 scenarios accept coherent solutions and reject initial forecasts',()=>{
  assert.equal(Object.keys(SCENARIOS).length,22);
  for(const m of Object.values(SCENARIOS)){assert(check(m,solve(m)).ok,m.id);assert(!check(m,initialValues()).ok,m.id);}
});
test('each shift scenario accepts different plausible magnitudes, not opposite shifts',()=>{
  for(const m of BANKS.flat())for(const ds of [5,15,30])for(const ss of [5,15,30]){const v=solve(m,ds,ss);assert(check(m,v).ok,m.id);const key=m.d?'d':'s';assert.equal(check(m,{...v,[key]:-v[key]}).code,'direction');}
});
test('combined shifts distinguish certain changes from ambiguous ones',()=>{
  for(const m of BANKS[2]){const outcomes=[[5,30],[30,5],[20,20]].map(([d,s])=>market(m.d*d,m.s*s));assert(outcomes.every(e=>Math.sign(e.q-50)===m.d));assert.deepEqual(new Set(outcomes.map(e=>Math.sign(e.p-60))),new Set([-1,1,0]));assert(missionText(m,2).debrief.includes('Price can rise, fall, or stay unchanged'));}
  for(const m of BANKS[3]){const outcomes=[[5,30],[30,5],[20,20]].map(([d,s])=>market(m.d*d,m.s*s));assert(outcomes.every(e=>Math.sign(e.p-60)===m.d));assert.deepEqual(new Set(outcomes.map(e=>Math.sign(e.q-50))),new Set([-1,1,0]));}
});
test('wrong curve, misplaced intersection and small-shift baseline errors receive feedback',()=>{
  const d=BANKS[0][0],s=BANKS[1][0];
  assert.equal(check(d,{...solve(d),s:5}).code,'wrong-curve');assert.equal(check(s,{...solve(s),d:5}).code,'wrong-curve');
  assert.equal(check(d,{...initialValues(),d:5}).code,'intersection');assert.equal(check(s,{...initialValues(),s:-5}).code,'intersection');
  assert(check(d,{...solve(d),q:62,p:70}).ok);assert(!check(d,{...solve(d),q:67}).ok);
  const both=BANKS[2][0];assert(!check(both,{...solve(both),p:62}).ok);
});
test('ceilings and floors yield correct quantities, gaps and trade; swapped quantities fail',()=>{
  assert.deepEqual(atPrice(40),{qs:25,qd:75,binding:true,shortage:50,surplus:0,traded:25});
  assert.deepEqual(atPrice(80,0,0,'floor'),{qs:75,qd:25,binding:true,shortage:0,surplus:50,traded:25});
  for(const m of Object.values(SCENARIOS).filter(m=>m.type!=='shift')){const v=solve(m);assert.equal(check(m,{...v,qs:v.qd,qd:v.qs}).code,'swapped');assert.equal(check(m,{...v,price:60}).code,'price');assert.equal(check(m,{...v,d:5}).code,'wrong-curve');}
});
test('nonbinding policies leave trade at equilibrium; quantities beyond the graph stay truthful',()=>{
  for(const price of [60,80,120])assert.equal(atPrice(price).traded,50);
  for(const price of [0,40,60]){const a=atPrice(price,0,0,'floor');assert(!a.binding);assert.equal(a.traded,50);assert.equal(a.surplus,0);}
  assert.equal(atPrice(0).qd,125);assert.equal(atPrice(120,0,0,'floor').qs,125);
});
test('fresh runs cover every scenario, reproduce by seed, change all stories and alternate policies',()=>{
  const seen=new Set();let previous=null;
  for(let seed=0;seed<200;seed++){const run=freshRun(previous,seed);assert.deepEqual(run,freshRun(previous,seed));assert.equal(run.plan.length,5);run.plan.forEach(id=>seen.add(id));if(previous){assert(run.plan.every((id,i)=>id!==previous.plan[i]));assert.notEqual(missions(run)[4].type,missions(previous)[4].type);}assert.deepEqual(restoreRun(copy(run)),run);previous=run;}
  assert.equal(seen.size,22);
});
test('recall questions follow the run and preserve randomized answer order across reloads',()=>{
  for(let seed=0;seed<40;seed++){const run=finishMissions(freshRun(null,seed)),questions=quizQuestions(run);assert.equal(questions.length,5);assert.equal(questions[0].correct,missions(run)[0].d>0?0:1);assert(questions[4].prompt.includes('$'+missions(run)[4].price));assert.deepEqual(restoreRun(copy(run)).quiz.orders,run.quiz.orders);}
});
test('recall tracks first responses and retries, blocks duplicate answers and premature advancement',()=>{
  const run=finishMissions(freshRun(null,15));assert(!advanceQuiz(run));
  const correct=quizQuestions(run)[0].correct,wrong=(correct+1)%4;
  assert(answerQuiz(run,wrong));assert(!answerQuiz(run,wrong));assert(!advanceQuiz(run));assert.deepEqual(restoreRun(copy(run)),run);
  assert(answerQuiz(run,correct));assert(!answerQuiz(run,correct));assert(!answerQuiz(run,(correct+2)%4));assert(advanceQuiz(run));
  for(let i=1;i<5;i++){assert(answerQuiz(run,quizQuestions(run)[i].correct));assert(advanceQuiz(run));}
  assert.equal(run.stage,'report');assert.equal(run.quiz.answers.filter(a=>a[0].correct).length,4);assert(!answerQuiz(run,0));assert.deepEqual(restoreRun(copy(run)),run);
});
test('save validation rejects incompatible runs, fabricated completion and damaged quiz history',()=>{
  const run=freshRun(null,9);run.attempts=[{...check(missions(run)[0],run.values),values:copy(run.values)}];run.hints=1;assert.deepEqual(restoreRun(copy(run)),run);
  for(const change of [{version:1},{completed:true},{index:1},{stage:'quiz'},{values:{...run.values,p:NaN}},{plan:['missing',...run.plan.slice(1)]}])assert.throws(()=>restoreRun({...copy(run),...change}));
  const done=finishMissions(freshRun(null,4)),bad=copy(done);bad.quiz.orders[0]=[0,0,2,3];assert.throws(()=>restoreRun(bad));
  bad.quiz.orders=copy(done.quiz.orders);bad.quiz.answers[0]=[{choice:quizQuestions(done)[0].correct,correct:false}];assert.throws(()=>restoreRun(bad));
});
