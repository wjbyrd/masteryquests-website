import test from 'node:test';
import assert from 'node:assert/strict';
import {curriculum,limits,check,observation,elasticity,category,quantity,freshRun,current,chapterRounds,predict,submit,nextRound,questions,answerQuiz,nextQuestion,nextChapter,restoreRun,initialValue} from './model.js';
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
test('all 16 cases preserve their economic relationships across 1000 seeds',()=>{
 for(let seed=0;seed<1000;seed++){
  const rounds=curriculum(seed);assert.equal(rounds.length,16);assert.equal(new Set(rounds.map(r=>r.id)).size,16);
  for(const r of rounds){const l=limits(r);assert(r.target>=l.min&&r.target<=l.max);assert(check(r,r.target).ok);assert(!check(r,NaN).ok);const o=observation(r,r.target);
   if(r.model==='demand'){const d=o.revenue-r.p0*r.q0;assert.equal(r.prediction.correct,Math.abs(d)<.001?2:d>0?0:1);if(r.e===1)near(o.e,1);}
   if(r.model==='shift'){assert.equal(Math.sign(o.e),Math.sign(r.e));assert.equal(Math.abs(o.e)>1,Math.abs(r.e)>1);assert.equal(o.p,r.p0);assert.equal(o.point,null);assert.equal(quantity(r,r.p0),null);}
   if(r.model==='supply'){assert.equal(o.e>1+1e-6,r.e>1);if(r.e===1)near(o.e,1);}
   if(r.model.startsWith('vertical')){near(o.e,0);near(o.q,r.q0);}
  }
 }
});
test('midpoint calculation is symmetric and preserves signed relationships',()=>{
 near(elasticity(10,100,12,90),elasticity(12,90,10,100));near(elasticity(10,100,12,90),11/19);
 assert(elasticity(10,100,12,90,true)<0);assert.equal(elasticity(10,100,10,120),Infinity);assert.equal(elasticity(10,100,10,100),null);
});
test('unit demand keeps revenue constant; linear demand has one revenue maximum',()=>{
 const rounds=curriculum(83),unit=rounds.find(r=>r.id==='unit-demand'),linear=rounds.find(r=>r.id==='linear');
 for(const factor of [.5,.75,1,1.25,1.5])near(observation(unit,unit.p0*factor).revenue,unit.p0*unit.q0);
 const peak=observation(linear,linear.target);near(peak.point,1);near(peak.e,5/3);assert.equal(category(peak.point),'Unit elastic');
 for(const factor of [.9,1.1])assert(observation(linear,linear.target*factor).revenue<peak.revenue);
});
test('horizontal demand does not invent a unique finite quantity or receipts',()=>{
 const r=curriculum(3).find(r=>r.id==='open-demand');assert.equal(observation(r,r.p0).q,null);assert.equal(observation(r,r.p0*.9).revenue,null);assert.equal(observation(r,r.p0*1.1).q,0);
 const s=curriculum(3).find(r=>r.id==='open-supply'),o=observation(s,s.target);near(o.p,s.p0);assert.equal(o.e,Infinity);near(o.q,s.target);
});
test('full story and chapter entries complete with recorded retries and stable restore',()=>{
 for(const scope of ['all','demand','related','supply']){
  let run=freshRun(scope,489);let steps=0;
  while(!run.complete&&steps++<200){
   if(run.stage==='brief'){const r=current(run);assert(!predict(run,99));assert(predict(run,(r.prediction.correct+1)%r.prediction.options.length));run.hints++;run.value=limits(r).min;submit(run);run.value=r.target;assert(submit(run).ok);assert.equal(submit(run),false);assert(nextRound(run));}
   else if(['quiz','final'].includes(run.stage)){const q=questions(run,run.stage==='final'?'final':run.chapter)[run.quizIndex];assert(answerQuiz(run,(q.correct+1)%q.options.length));assert(!nextQuestion(run));assert(answerQuiz(run,q.correct));assert(nextQuestion(run));}
   else if(run.stage==='chapterDone')assert(nextChapter(run));
   else throw Error(run.stage);
   run=restoreRun(JSON.parse(JSON.stringify(run)));
  }
  assert(run.complete);assert.equal(run.records.length,scope==='all'?16:scope==='demand'?6:5);assert.equal(run.stage,'report');assert(run.records.every(r=>r.hints===1&&!r.predictionCorrect));
  assert.equal(Object.keys(run.quizzes).length,scope==='all'?4:1);
 }
});
test('saved work rejects corruption without accepting invalid controls',()=>{
 const run=freshRun('all',6);assert(predict(run,0));assert.equal(run.value,initialValue(current(run)));assert.equal(restoreRun(run).value,run.value);
 for(const change of [{value:Infinity},{index:500},{scope:'unknown'},{seed:-1},{stage:'bad'},{prediction:999},{quizAnswers:[[{answer:99,correct:true}]]},{records:[null]}])assert.throws(()=>restoreRun({...run,...change}));
 assert(!check(current(run),-100).ok);assert(!check(current(run),1e9).ok);
});
test('every question has a unique correct option and scenario evidence',()=>{
 const run=freshRun('all',55);for(const ch of ['demand','related','supply','final'])for(const q of questions(run,ch)){assert(q.context.length>30);assert(q.options[q.correct]);assert.equal(new Set(q.options).size,q.options.length);}
 const c=curriculum(55);assert(c.find(r=>r.id==='fixed-supply').unit.includes('spaces'));assert.notEqual(c.find(r=>r.id==='responsive').story,c.find(r=>r.id==='loyal').story);
});
