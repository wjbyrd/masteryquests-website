import test from 'node:test';
import assert from 'node:assert/strict';
import {roundMoney,requiredReserves,excessReserves,maxLoan,bank,assertBalanced,applyDeposit,applyWithdrawal,makeLoanAndClear,transferLoan,systemTotals,theoreticalDepositMaximum,maximumLoans,sequence,postTrainingRound,BANK_NAMES,initialState} from './model.js';

test('training: every posted and cleared balance matches the three canonical rounds',()=>{
  let b=bank(BANK_NAMES[0]);
  const expected=[{deposits:1000,reserves:1000,loans:0,required:100,excess:900},{deposits:1600,reserves:700,loans:900,required:160,excess:540},{deposits:2100,reserves:660,loans:1440,required:210,excess:450}];
  expected.forEach((e,i)=>{
    b=postTrainingRound(b,i);assertBalanced(b);
    for(const k of ['deposits','reserves','loans'])assert.equal(b[k],e[k]);
    assert.equal(requiredReserves(b.deposits,.1),e.required);
    assert.equal(excessReserves(b.reserves,b.deposits,.1),e.excess);
    assert.equal(maxLoan(b,.1),e.excess);
    b=makeLoanAndClear(b,e.excess,.1);assertBalanced(b);
    assert.equal(b.reserves,e.required);
  });
  assert.deepEqual(b,{name:BANK_NAMES[0],deposits:2100,reserves:210,loans:1890});
});

test('round 3 deposit and withdrawal each preserve the accounting identity',()=>{
  const start={...bank('A'),deposits:1600,reserves:160,loans:1440};
  const deposited=applyDeposit(start,700);
  assert.deepEqual(deposited,{name:'A',deposits:2300,reserves:860,loans:1440});
  assert.deepEqual(applyWithdrawal(deposited,200),{name:'A',deposits:2100,reserves:660,loans:1440});
  assert.equal(start.reserves,160,'transactions do not mutate their input');
});

test('all 125 sampled training paths carry retained reserves forward without unbalancing',()=>{
  const fractions=[0,.25,.5,.75,1];
  for(const a of fractions)for(const b of fractions)for(const c of fractions){
    let current=bank('A');
    [a,b,c].forEach((fraction,i)=>{
      current=postTrainingRound(current,i);assertBalanced(current);
      current=makeLoanAndClear(current,roundMoney(maxLoan(current,.1)*fraction),.1);
      assertBalanced(current);assert.ok(current.reserves>=requiredReserves(current.deposits,.1));
    });
    assert.equal(current.deposits,2100);
    assert.equal(roundMoney(current.reserves+current.loans),2100);
  }
});

test('manual network grows deposits and loans but conserves all initial reserves',()=>{
  let banks=BANK_NAMES.map(bank);banks[0]=applyDeposit(banks[0],1000);
  const expected=[{deposits:1900,loans:900,reserves:1000},{deposits:2710,loans:1710,reserves:1000},{deposits:3439,loans:2439,reserves:1000}];
  [900,810,729].forEach((loan,i)=>{
    assert.equal(maxLoan(banks[i],.1),loan);
    const before=banks;banks=transferLoan(banks,i,i+1,loan,.1);
    assert.equal(before[i+1].deposits,0,'source snapshot is unchanged');
    banks.forEach(assertBalanced);assert.deepEqual(systemTotals(banks),expected[i]);
  });
  assert.deepEqual(banks.map(b=>b.deposits),[1000,900,810,729]);
  assert.deepEqual(banks.map(b=>b.reserves),[100,90,81,729]);
});

test('theoretical limits distinguish initial deposit, additional deposits, and loans',()=>{
  assert.equal(theoreticalDepositMaximum(1000,.1),10000);
  assert.equal(maximumLoans(1000,.1),9000);
  assert.equal(theoreticalDepositMaximum(1000,.2),5000);
  assert.deepEqual(sequence(1000,.1,4),[1000,900,810,729]);
});

test('20% actual holding satisfies the unchanged 10% minimum and reduces expansion',()=>{
  const first=applyDeposit(bank('A'),1000);
  const cautious=makeLoanAndClear(first,maxLoan(first,.2),.1);
  assert.equal(cautious.reserves,200);assert.equal(cautious.loans,800);
  assert.equal(requiredReserves(cautious.deposits,.1),100);
  assert.equal(excessReserves(cautious.reserves,cautious.deposits,.1),100);
  assert.deepEqual(sequence(1000,.2,4),[1000,800,640,512]);
  assert.equal(theoreticalDepositMaximum(1000,.2),5000);
  assert.ok(theoreticalDepositMaximum(1000,.2)<theoreticalDepositMaximum(1000,.1));
  // Long conceptual chains approach (rather than instantly reach) the limits.
  for(const holding of [.1,.2]){
    const sum=Array.from({length:100},(_,i)=>1000*(1-holding)**i).reduce((a,b)=>a+b,0);
    const limit=theoreticalDepositMaximum(1000,holding);
    assert.ok(sum<limit);assert.ok(limit-sum<1);
  }
});

test('invalid amounts and over-lending fail atomically, with immediate valid retry',()=>{
  const b=applyDeposit(bank('A'),1000);
  for(const invalid of [-1,NaN,Infinity,1.001]){
    assert.throws(()=>makeLoanAndClear(b,invalid,.1));
    assert.throws(()=>applyDeposit(b,invalid));
    assert.throws(()=>applyWithdrawal(b,invalid));
  }
  assert.throws(()=>makeLoanAndClear(b,900.01,.1));
  assert.throws(()=>applyWithdrawal(b,1001));
  assert.throws(()=>transferLoan([b],0,0,900,.1));
  assert.throws(()=>assertBalanced({...b,loans:1}));
  for(const r of [0,-.1,1.1,NaN])assert.throws(()=>requiredReserves(1000,r));
  assert.deepEqual(b,{name:'A',deposits:1000,reserves:1000,loans:0});
  assert.equal(makeLoanAndClear(b,900,.1).reserves,100);
});

test('cent-valued transactions remain balanced and cannot lend a cent over capacity',()=>{
  let b=applyDeposit(bank('A'),1000.01);
  for(let i=0;i<40;i++){
    b=applyDeposit(b,12.34);b=applyWithdrawal(b,1.01);
    const cap=maxLoan(b,.1);assert.throws(()=>makeLoanAndClear(b,roundMoney(cap+.01),.1));
    b=makeLoanAndClear(b,cap,.1);assertBalanced(b);
  }
});

test('fresh runs have no history, no revealed formula state, and independent objects',()=>{
  const first=initialState();first.studentHistory.push({type:'deposit'});first.currentBank.deposits=100;
  const second=initialState();assert.equal(second.gamePhase,1);assert.equal(second.currentBank.deposits,0);
  assert.equal(second.studentHistory.length,0);assert.equal(second.transferAnswered,false);
});
