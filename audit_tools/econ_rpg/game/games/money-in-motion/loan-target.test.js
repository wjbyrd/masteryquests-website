import test from 'node:test';
import assert from 'node:assert/strict';
import {loanTarget} from './loan-target.js';
import {bank,postTrainingRound,makeLoanAndClear,maxLoan,roundMoney,assertBalanced} from './model.js';

test('ending totals produce the original three cleared loans and final balances',()=>{
  let b=bank('Common Ground Bank');
  [900,1440,1890].forEach((target,i)=>{
    b=postTrainingRound(b,i);
    const plan=loanTarget(b,.1,target);
    assert.equal(plan.maximumTotalLoans,target);assert.equal(plan.withinRange,true);
    assert.equal(plan.newLoan,[900,540,450][i]);
    b=makeLoanAndClear(b,plan.newLoan,.1);assertBalanced(b);
    assert.equal(b.loans,target);assert.equal(b.reserves,[100,160,210][i]);
    assert.equal(b.deposits,[1000,1600,2100][i]);
  });
});

test('round 2 rejects lower and excessive totals, and allows unchanged or partial totals',()=>{
  const b={name:'A',deposits:1600,reserves:700,loans:900};
  assert.equal(loanTarget(b,.1,540).withinRange,false);
  assert.equal(loanTarget(b,.1,899.99).withinRange,false);
  assert.equal(loanTarget(b,.1,1440.01).withinRange,false);
  assert.equal(loanTarget(b,.1,900).newLoan,0);
  assert.equal(loanTarget(b,.1,1200).newLoan,300);
  assert.equal(loanTarget(b,.1,1200).withinRange,true);
  assert.deepEqual(b,{name:'A',deposits:1600,reserves:700,loans:900});
});

test('125 total-target paths reproduce the original incremental transactions exactly',()=>{
  const fractions=[0,.25,.5,.75,1];
  for(const a of fractions)for(const b of fractions)for(const c of fractions){
    let old=bank('A'),current=bank('A');
    [a,b,c].forEach((fraction,i)=>{
      old=postTrainingRound(old,i);current=postTrainingRound(current,i);
      const incremental=roundMoney(maxLoan(old,.1)*fraction);
      const target=roundMoney(current.loans+incremental),plan=loanTarget(current,.1,target);
      assert.equal(plan.withinRange,true);
      old=makeLoanAndClear(old,incremental,.1);current=makeLoanAndClear(current,plan.newLoan,.1);
      assert.deepEqual(current,old);assertBalanced(current);
    });
  }
});

test('invalid totals are rejected and cent-valued totals derive exact new loans',()=>{
  const b={name:'A',deposits:1000,reserves:899.99,loans:100.01};
  for(const n of [-1,NaN,Infinity,1.001])assert.throws(()=>loanTarget(b,.1,n));
  assert.equal(loanTarget(b,.1,100.02).newLoan,.01);
  assert.equal(loanTarget(b,.1,900).newLoan,799.99);
});
