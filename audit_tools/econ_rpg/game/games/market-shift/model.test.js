import test from 'node:test';
import assert from 'node:assert/strict';
import {initialValues,demand,supply,market,atPrice,check,freshRun,restoreRun} from './model.js';
test('equilibria satisfy both curves throughout allowed shifts',()=>{
  for(let d=-30;d<=30;d+=5)for(let s=-30;s<=30;s+=5){const e=market(d,s);assert(Math.abs(demand(e.q,d)-e.p)<1e-9);assert(Math.abs(supply(e.q,s)-e.p)<1e-9);assert(e.q>=0&&e.q<=100&&e.p>=0&&e.p<=120);}
});
test('supply loss raises price and reduces quantity without changing demand',()=>{
  for(const s of [-1,-5,-15,-30]){const e=market(0,s),v={...initialValues(),s,...e};assert(e.q<50&&e.p>60);assert(check(0,v).ok);}
});
test('new buyers raise price and quantity without shifting supply',()=>{
  for(const d of [1,5,15,30]){const e=market(d,0),v={...initialValues(),d,...e};assert(e.q>50&&e.p>60);assert(check(1,v).ok);}
});
test('feedback distinguishes wrong curve, direction and inconsistent equilibrium',()=>{
  assert.equal(check(0,{...initialValues(),d:-10,s:-20}).code,'wrong-curve');
  assert.equal(check(0,{...initialValues(),s:20}).code,'direction');
  assert.equal(check(0,{...initialValues(),s:-20}).code,'intersection');
  assert.equal(check(1,{...initialValues(),d:20,s:5}).code,'wrong-curve');
  assert.equal(check(1,{...initialValues(),d:-10}).code,'direction');
});
test('quantitative ceiling yields 25 supplied, 75 demanded and shortage 50',()=>{
  assert.deepEqual(atPrice(40),{qs:25,qd:75,shortage:50,traded:25,binding:true});
  assert(check(2,{...initialValues(),ceiling:40,qs:25,qd:75}).ok);
  assert.equal(check(2,{...initialValues(),ceiling:40,qs:75,qd:25}).code,'swapped');
  assert.equal(check(2,{...initialValues(),ceiling:60,qs:25,qd:75}).code,'ceiling');
});
test('nonbinding maximum does not force the market price up or reduce trade',()=>{
  for(const price of [60,80,120]){const result=atPrice(price);assert.equal(result.binding,false);assert.equal(result.shortage,0);assert.equal(result.traded,50);}
});
test('plot tolerance is in economic units and does not accept a different intersection',()=>{
  const v={...initialValues(),s:-20,q:42,p:70};assert(check(0,v).ok);assert(!check(0,{...v,q:47}).ok);
});
test('a small correct shift still requires moving equilibrium in the correct directions',()=>{
  assert.equal(check(0,{...initialValues(),s:-5}).code,'intersection');
  assert.equal(check(1,{...initialValues(),d:5}).code,'intersection');
  assert(check(0,{...initialValues(),s:-5,q:48,p:62}).ok);
  assert(check(1,{...initialValues(),d:5,q:53,p:62}).ok);
});
test('save restores draft, attempts and hints, rejecting damaged or false completion',()=>{
  const run=freshRun();run.values.s=-20;run.attempts.push({...check(0,run.values),values:{...run.values}});run.hints=1;
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(run))),run);
  assert.throws(()=>restoreRun({...run,completed:true}));assert.throws(()=>restoreRun({...run,index:1}));assert.throws(()=>restoreRun({...run,values:{...run.values,p:NaN}}));assert.throws(()=>restoreRun({...run,version:999}));
});
