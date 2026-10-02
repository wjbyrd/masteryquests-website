const {test}=require('node:test');
const assert=require('node:assert/strict');
const model=require('./seasons.js');
const {calculate}=require('./scenarios.js');
const {graph,graphData}=require('./graphs.js');

test('5,000 seeded seasons: rounded economics, objectives, accounting and graph coordinates stay coherent',()=>{
  const classes=new Set(),variants=model.pools.map(()=>new Set());
  for(let seed=0;seed<5000;seed++){
    const ids=model.drawVariants(null,seed).variants,season=model.generate(seed,ids);
    ids.forEach((v,i)=>variants[i].add(v));
    assert(model.validate(season));
    for(const [i,s] of season.scenarios.entries()){
      const reference=calculate(s.startingState);
      for(const c of s.choices){
        const r=calculate(c.outcome);assert.equal(r.totalRevenue,r.ticketRevenue+r.concessionRevenue);
        assert(Number.isInteger(r.attendance)&&r.attendance>=600&&r.attendance<=1800);
        if(!r.segments)assert.equal(r.ticketRevenue,r.price*r.attendance);
        if(c.points===2){
          if(i===0)assert(r.ticketRevenue>reference.ticketRevenue&&r.attendance>=s.choices[2].outcome.attendance);
          if(i===1||i===3)assert(r.ticketRevenue>=reference.ticketRevenue&&r.attendance>reference.attendance);
          if(i===2)assert.equal(r.ticketRevenue,reference.ticketRevenue);
          if(i===4)assert(r.attendance>reference.attendance&&r.bundlePrice<reference.bundlePrice);
          if(i===5){const gains=s.income.map(t=>t.after/t.before-1);assert.equal(s.choices.indexOf(c),gains.indexOf(Math.max(...gains)));}
        }
        for(const e of c.episodes){
          classes.add(e.label);const coefficient=model.elasticity(e.x1,e.x2,e.q1,e.q2);
          assert.equal(coefficient,e.elasticity);
          if(e.kind==='price'){
            assert(model.validOwn(e.x1,e.q1,e.x2,e.q2,i));
            const product=(e.x2-e.x1)*(e.x2*e.q2-e.x1*e.q1);
            if(i===0)assert(product>0);if(i===1)assert(product<0);if(i===2)assert(product===0);
          }
          if(e.label==='Substitutes')assert(coefficient>0);
          if(e.label==='Complements'||e.label==='Inferior good')assert(coefficient<0);
          if(e.label.includes('income-sensitive'))assert(coefficient>1);
          if(e.label.includes('necessity-like'))assert(coefficient>0&&coefficient<1);
          const d=graphData(e);
          d.positions.forEach(([x,y])=>{assert(Number.isFinite(x)&&Number.isFinite(y));assert(x>=60&&x<=350&&y>=45&&y<=246);});
          if(seed<20){const svg=graph(e,'test');assert(!/NaN|Infinity|undefined/.test(svg));assert(svg.includes('<desc'));assert(svg.includes('observations'));}
        }
      }
    }
  }
  assert.equal(classes.size,8);variants.forEach((set,i)=>assert.equal(set.size,model.pools[i].length));
});
test('bags exhaust every pool and prevent immediate repeats across 60 seasons',()=>{
  let history=null,previous=null;const draws=[];
  for(let seed=1;seed<=60;seed++){
    const next=model.drawVariants(history,seed);history=next.history;draws.push(next.variants);
    if(previous)next.variants.forEach((id,i)=>assert.notEqual(id,previous[i]));previous=next.variants;
  }
  model.pools.forEach((pool,i)=>{for(let start=0;start<60;start+=pool.length)assert.equal(new Set(draws.slice(start,start+pool.length).map(row=>row[i])).size,Math.min(pool.length,60-start));});
});
test('every save point restores identical authored variants, generated values and selected outcomes',()=>{
  const season=model.generate(123456,model.drawVariants(null,123456).variants);
  let state={mode:'decision',round:0,season,history:[]};
  for(let round=0;round<7;round++){
    assert.deepEqual(model.restore(model.pack(state)),state);
    const choice=season.scenarios[round].choices[round%3];state.history.push({choice,result:calculate(choice.outcome)});state.mode='result';
    assert.deepEqual(model.restore(model.pack(state)),state);
    state.round++;state.mode=state.round===7?'debrief':'decision';
  }
  assert.deepEqual(model.restore(model.pack(state)),state);
  const tampered=JSON.parse(model.pack(state));tampered.season.scenarios[0].choices[0].outcome.attendance=-1;
  assert.equal(model.restore(JSON.stringify(tampered)),null);
  for(const value of ['null','{}','garbage','{"version":1,"round":8}'])assert.equal(model.restore(value),null);
  assert.deepEqual(model.generate(season.seed,season.variants),season);
});
