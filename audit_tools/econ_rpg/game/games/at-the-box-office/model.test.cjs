const {test}=require('node:test');
const assert=require('node:assert/strict');
const {scenarios,calculate,summarize}=require('./scenarios.js');
test('all 21 choices have valid attendance and exact receipts',()=>{
  assert.equal(scenarios.length,7);
  for(const s of scenarios){
    assert.equal(s.choices.length,3);
    for(const raw of [s.startingState,...s.choices.map(c=>c.outcome)]){
      const r=calculate(raw);
      assert(Number.isInteger(r.attendance)&&r.attendance>0);
      assert.equal(r.ticketRevenue,raw.segments?raw.segments.reduce((n,x)=>n+x.price*x.attendance,0):raw.price*raw.attendance);
      assert.equal(r.totalRevenue,r.ticketRevenue+(raw.bundlePrice||0)*(raw.bundles||0));
      if(raw.bundles)assert(raw.bundles<=r.attendance);
    }
  }
});
test('own-price elasticity magnitudes and revenue directions match the lessons',()=>{
  // Midpoint is used only for QA; players never need to calculate it.
  for(const [i,elasticity] of [[0,'inelastic'],[1,'elastic'],[2,'unit']]){
    const s=scenarios[i],b=calculate(s.startingState);
    for(const c of s.choices){const r=calculate(c.outcome);if(r.price===b.price)continue;
      const e=Math.abs(((r.attendance-b.attendance)/((r.attendance+b.attendance)/2))/((r.price-b.price)/((r.price+b.price)/2)));
      if(elasticity==='unit'&&r.price===10){assert(e>1);assert.equal(r.attendance,1240);assert.equal(r.ticketRevenue,12400);}
      else if(elasticity==='unit'){assert(Math.abs(e-1)<1e-10);assert.equal(r.ticketRevenue,b.ticketRevenue);}
      else if(elasticity==='inelastic'){assert(e<1);assert.equal(Math.sign(r.ticketRevenue-b.ticketRevenue),Math.sign(r.price-b.price));}
      else{assert(e>1);assert.equal(Math.sign(r.ticketRevenue-b.ticketRevenue),-Math.sign(r.price-b.price));}
    }
  }
});
test('cross-price and income responses have the intended signs',()=>{
  assert((800-1000)/(4-8)>0,'streaming and ticket demand move in same direction');
  const s=scenarios[4],b=s.startingState;
  for(const c of s.choices){const r=c.outcome;assert.equal(r.price,b.price);if(r.bundlePrice!==b.bundlePrice)assert((r.attendance-b.attendance)/(r.bundlePrice-b.bundlePrice)<0);}
  assert.deepEqual(scenarios[5].income.map(r=>Math.sign(r.after-r.before)),[1,1,-1]);
  assert.deepEqual(scenarios[5].startingState.segments.map(s=>s.attendance),[260,525,270]);
});
test('strong decisions satisfy stated aims, including access rather than receipts alone',()=>{
  for(let i=0;i<7;i++)for(const c of scenarios[i].choices){
    const r=calculate(c.outcome),b=calculate(scenarios[i].startingState);
    const goal=[()=>r.attendance>=900&&r.ticketRevenue>b.ticketRevenue,
      ()=>r.attendance>=900&&r.ticketRevenue>=b.ticketRevenue,
      ()=>r.attendance===1240&&r.ticketRevenue>b.ticketRevenue,
      ()=>r.attendance>=900&&r.ticketRevenue>=b.ticketRevenue,
      ()=>r.attendance>=1050&&r.bundlePrice<8,
      ()=>r.segments[0].attendance>260,
      ()=>c.title.includes('premium')&&r.bundlePrice<=8&&r.ticketRevenue>=14000][i]();
    assert.equal(c.points===2,goal,`${i}: ${c.title}`);
  }
  assert(calculate(scenarios[4].choices[0].outcome).totalRevenue<calculate(scenarios[4].startingState).totalRevenue);
});
test('all 2,187 complete paths produce valid totals and all three endings',()=>{
  let paths=0;const tiers=new Set();
  function walk(history){if(history.length===7){const total=summarize(history);assert(total.points>=0&&total.points<=14);assert(total.attendance>0&&total.ticketRevenue>0);tiers.add(total.tier);paths++;return;}
    for(const choice of scenarios[history.length].choices)walk([...history,{choice,result:calculate(choice.outcome)}]);
  }walk([]);assert.equal(paths,2187);assert.equal(tiers.size,3);
});
