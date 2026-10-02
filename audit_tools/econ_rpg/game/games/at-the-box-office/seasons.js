/* Seeded extensions to the seven authored weeks. Relationships are chosen first;
   rounded observations must pass validation before a season can be played. */
(() => {
  'use strict';
  const base = typeof module !== 'undefined' && module.exports ? require('./scenarios.js') : window.BoxOffice;
  const VERSION = 1, SAVE_KEY = 'mq-box-office-season-v1', BAG_KEY = 'mq-box-office-variants-v1';
  const pools = [
    [
      ['The Premiere','Midnight City','Fans want opening-weekend seats, and few nearby theaters have this release.'],
      ['The Cult Rerelease','Orbit 9','Collectors are traveling for a rare restored print and a single weekend engagement.'],
      ['The Franchise Opening','Silver Horizon II','Advance interest is strong: returning fans have waited all year for this sequel.']
    ],
    [
      ['A Tougher Sell','The Last Postcard','Similar films are playing nearby. Undecided viewers are comparing prices.'],
      ['The Family Matinee','The Little Voyager','Families can choose several inexpensive weekend activities and are watching the outing budget.'],
      ['The Weekday Showing','After the Rain','An ordinary weekday screening competes with many easy ways to spend an evening.']
    ],
    [
      ['The Revenue Test','City Lights','The film is late in its run. Use the booking forecasts below to reach more viewers without sacrificing ticket revenue.'],
      ['The Encore','River of Stars','An encore run has spare seats. The booking team has tested three price points for the same audience.'],
      ['The Archive Weekend','Yesterday Again','The archive program wants a wider audience. Compare the booking forecasts for the same restored film.']
    ],
    [
      ['Streaming Special','Streamline weekend rental','A streaming platform announces a rental-price cut.'],
      ['Across the Street','Rival cinema ticket','The nearby cinema starts a ticket promotion.'],
      ['The Local Stage','Community concert ticket','A local concert series lowers admission for its next show.']
    ],
    [
      ['The Popcorn Problem','Popcorn + drink bundle','Families compare the complete cost of a movie outing.'],
      ['The Snack Counter','Nachos + drink bundle','Evening guests often buy a snack with their tickets.'],
      ['The Weekend Combo','Family snack bundle','Weekend visitors budget for tickets and a shared snack together.']
    ],
    [
      ['Rebate Weekend','A household rebate',10],
      ['Local Pay Growth','A regional pay increase',6],
      ['Bonus Season','A temporary household bonus',8],
      ['A Regional Slowdown','A temporary reduction in household income',-8]
    ],
    [
      ['Opening Night','The Silver Horizon'],['The Festival Finale','Harbor Lights'],['The Gala Release','Beyond the City']
    ]
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const money = n => '$' + n.toLocaleString('en-US');
  const num = n => n.toLocaleString('en-US');
  const round = n => Math.round(n / 10) * 10;
  const midpoint = (a,b) => (b-a) / ((a+b)/2);
  const elasticity = (x1,x2,q1,q2) => midpoint(q1,q2) / midpoint(x1,x2);
  function rng(seed) { let x=seed>>>0; return () => ((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296); }
  function derive(q,x1,x2,e) { const d=e*midpoint(x1,x2);return round(q*(2+d)/(2-d)); }
  const ownClass = e => Math.abs(e)<.95?'Inelastic demand':Math.abs(e)>1.05?'Elastic demand':'Unit-elastic demand';
  const ranges = [[.3,.85],[1.2,2.2],[.95,1.05]];
  function validOwn(p,q,p2,q2,type) {
    const e=Math.abs(elasticity(p,p2,q,q2)),[lo,hi]=ranges[type],dr=p2*q2-p*q;
    return Number.isFinite(e)&&p2>=7&&p2<=18&&q2>=600&&q2<=1800&&e>=lo-1e-9&&e<=hi+1e-9&&
      (type===2?Math.abs(dr)<=1e-8:type===0?(p2-p)*dr>0:(p2-p)*dr<0);
  }
  const gcd = (a,b) => b?gcd(b,a%b):a;
  function priceMarket(random,type) {
    for(let attempt=0;attempt<200;attempt++) {
      const p=[10,12,14][Math.floor(random()*3)],lo=p-2,hi=p+2;
      const e=type===0?.4+random()*.4:type===1?1.3+random()*.7:1;
      let q=round(950+random()*250);
      if(type===2) {const lcm=lo*hi/gcd(lo,hi),step=lcm/gcd(lcm,p)*10;q=Math.round(q/step)*step;}
      const quantities=[lo,p,hi].map(x=>type===2?p*q/x:derive(q,p,x,-e));
      if([0,2].every(i=>validOwn(p,q,[lo,p,hi][i],quantities[i],type)))return {p,q,prices:[lo,p,hi],quantities};
    }
    throw new Error('Could not generate a validated price market');
  }
  function episode(kind,title,xLabel,x1,x2,q1,q2,label,interpretation,ticketPrice) {
    return {kind,title,xLabel,x1,x2,q1,q2,elasticity:elasticity(x1,x2,q1,q2),label,interpretation,ticketPrice};
  }
  function ownExplanation(p,q,p2,q2,type) {
    if(type===2)return 'The attendance response exactly offset the ticket-price change, leaving total ticket revenue unchanged. Lower prices can widen access without sacrificing ticket revenue in this comparison.';
    const up=p2>p,more=p2*q2>p*q;
    return `The ${up?'higher':'lower'} ticket price ${more?'increased':'reduced'} total ticket revenue. Attendance changed proportionally ${type===0?'less':'more'} than price, so price and revenue moved ${type===0?'in the same':'in opposite'} directions.`;
  }
  function choice(title,detail,outcome,points,feedback,episodes) {return {title,detail,outcome:base.calculate(outcome),points,feedback,episodes};}
  function generate(seed,variants,attempt=0) {
    if(!Number.isInteger(seed)||seed<0||seed>4294967295||!Array.isArray(variants)||variants.length!==7||variants.some((v,i)=>!Number.isInteger(v)||!pools[i][v]))throw new Error('Invalid season identity');
    const random=rng((seed+Math.imul(attempt,0x9e3779b9))>>>0),pick=(lo,hi)=>Math.floor(random()*(hi-lo+1))+lo;
    const scenarios=clone(base.scenarios);
    for(let i=0;i<3;i++) {
      const s=scenarios[i],v=pools[i][variants[i]],m=priceMarket(random,i);
      s.title=v[0];s.film=v[1]+' · '+v[0];s.briefing=v[2];s.startingState=base.calculate({price:m.p,attendance:m.q});
      if(i===2)s.briefing+=` Forecasts: ${m.prices.map((p,j)=>`${money(p)} tickets → ${num(m.quantities[j])} admissions`).join('; ')}.`;
      s.mission=i===0?`Increase ticket revenue while retaining at least ${num(m.quantities[2])} admissions.`:i===1?`Increase attendance above ${num(m.q)} without reducing ticket revenue.`:'Reach the largest audience without reducing reference ticket revenue.';
      s.choices=m.prices.map((p,j)=>{
        const q=m.quantities[j],held=j===1,observed=held?2:j,p2=m.prices[observed],q2=m.quantities[observed];
        const explanation=ownExplanation(m.p,m.q,p2,q2,i);
        const feedback=held?`You held price, attendance and revenue steady. Holding alone cannot measure elasticity. A separate completed booking-team price test observed ${money(m.p)} → ${money(p2)} and ${num(m.q)} → ${num(q2)} admissions. ${explanation}`:explanation;
        const e=episode('price',held?'Booking-team price test (you held price)':v[0],'Ticket price',m.p,p2,m.q,q2,ownClass(elasticity(m.p,p2,m.q,q2)),explanation);
        return choice(`${j===0?'Offer':j===1?'Hold':'Set'} ${money(p)} tickets`,j===0?'Invite a wider audience.':j===1?'Keep the reference ticket price.':'Earn more from each admission.',{price:p,attendance:q},j===(i===0?2:0)?2:j===1?1:0,feedback,[e]);
      });
    }
    {
      const s=scenarios[3],v=pools[3][variants[3]],x1=pick(6,8)*2,x2=x1-4,p=12,q1=round(1100+random()*100),q2=derive(q1,x1,x2,.55+random()*.25);
      s.title=v[0];s.film=v[1];s.relatedGood=v[1];s.startingState=base.calculate({price:p,attendance:q2});
      s.briefing=`${v[2]} Its price falls from ${money(x1)} to ${money(x2)}. With your tickets fixed at ${money(p)}, theater attendance falls from ${num(q1)} to ${num(q2)} before you act.`;
      const lowQ=derive(q2,p,10,-1.5),eventQ=round(q2*1.12);
      s.mission=`Recover attendance above ${num(q2)} without reducing current ticket revenue of ${money(p*q2)}.`;
      const interpretation=`The related price and ticket demand fell together: positive cross-price elasticity identifies substitutes. A cheaper alternative shifts theater demand down at an unchanged ticket price; the theater can respond through price or a distinctive experience.`;
      const e=episode('cross',v[1]+' price shock','Related-good price',x1,x2,q1,q2,'Substitutes',interpretation,p);
      s.choices=[
        choice(`Hold ${money(p)} tickets`,'Wait out the promotion.',{price:p,attendance:q2},0,'You held ticket revenue steady after the external demand loss.',[e]),
        choice('Offer $10 tickets','Compete on the price of a night out.',{price:10,attendance:lowQ},2,`Your ticket-price cut then lifted attendance to ${num(lowQ)} and ticket revenue to ${money(10*lowQ)}. This is a movement along the new demand curve, separate from the earlier related-price shock.`,[e]),
        choice(`Keep ${money(p)}; host a cast discussion`,'Add an exclusive recorded Q&A.',{price:p,attendance:eventQ},2,`Your added experience then lifted attendance to ${num(eventQ)} and ticket revenue to ${money(p*eventQ)}. That promotion is a separate demand shift; event costs are not modeled.`,[e])
      ];
    }
    {
      const s=scenarios[4],v=pools[4][variants[4]],x1=pick(4,5)*2,p=12,q1=round(900+random()*180),coefficient=-.35-random()*.35;
      const prices=[x1-2,x1,x1+2],quantities=prices.map(x=>x===x1?q1:derive(q1,x1,x,coefficient));
      s.title=v[0];s.film=v[1];s.bundleLabel=v[1];s.startingState=base.calculate({price:p,attendance:q1,bundlePrice:x1,bundles:Math.round(q1*.6)});
      s.briefing=`${v[2]} Tickets stay at ${money(p)}. A lobby pilot forecasts ${prices.map((x,i)=>`${money(x)} bundles → ${num(quantities[i])} admissions`).join('; ')}.`;
      s.mission=`Make the complete outing more accessible and attract at least ${num(quantities[0])} admissions.`;
      s.choices=prices.map((x,j)=>{
        const k=j===1?0:j,q=quantities[j],interpretation=`With ticket prices fixed, ${prices[k]<x1?'cheaper':'more expensive'} concessions ${prices[k]<x1?'increased':'reduced'} ticket demand. Negative cross-price elasticity identifies complements. Bundle pricing affects ticket demand as well as concession receipts.`;
        const e=episode('cross',j===1?'Completed lobby pilot (you held the bundle)':v[1],'Bundle price',x1,prices[k],q1,quantities[k],'Complements',interpretation,p);
        return choice(`${j===0?'Offer':j===1?'Keep':'Raise'} the bundle at ${money(x)}`,'Ticket prices stay unchanged.',{price:p,attendance:q,bundlePrice:x,bundles:Math.round(q*(j===0?.65:j===1?.6:.5))},j===0?2:j===1?1:0,j===1?'You held attendance and receipts steady. The separate completed lobby pilot below identifies the relationship.':`Your bundle decision ${q>q1?'increased':'reduced'} ticket revenue from ${money(p*q1)} to ${money(p*q)}. Check concession and combined receipts separately; ticket revenue is not total outing revenue.`,[e]);
      });
    }
    {
      const s=scenarios[5],v=pools[5][variants[5]],x1=100,x2=100+v[2];
      const coefficients=[1.5+random()*.7,.35+random()*.35,-.6-random()*.4],names=['Premium','Standard','Matinee'],prices=[16,12,8];
      const quantities=[round(250+random()*100),round(450+random()*100),round(250+random()*100)];
      const after=quantities.map((q,i)=>derive(q,x1,x2,coefficients[i]));
      s.title=v[0];s.film=v[1];s.incomeIndex=[x1,x2];
      s.income=names.map((name,i)=>({name:name+' · '+money(prices[i]),before:quantities[i],after:after[i]}));
      s.briefing=`${v[1]} ${v[2]>0?'raises':'reduces'} disposable income by ${Math.abs(v[2])}%. At unchanged ticket prices, bookings shift as shown below, before your promotion.`;
      s.mission='Promote the offering with the largest percentage increase in income-driven bookings.';
      const segments=names.map((name,i)=>({name,price:prices[i],attendance:after[i]}));s.startingState=base.calculate({price:0,segments});
      const best=v[2]>0?0:2;
      const episodes=names.map((name,i)=>{
        const e=elasticity(x1,x2,quantities[i],after[i]);
        const label=i===0?'Normal good · income-sensitive':i===1?'Normal good · necessity-like':'Inferior good';
        const interpretation=`${name} bookings ${after[i]>quantities[i]?'rose':'fell'} as income ${x2>x1?'rose':'fell'}. ${i===2?'Negative income elasticity identifies an inferior-good response in this market; this budget option can gain demand when incomes fall.':i===0?'Positive income elasticity above one identifies an income-sensitive response: premium demand benefits more from income growth and is more exposed to a slowdown.':'Positive income elasticity between zero and one identifies a necessity-like response: standard demand changes less than proportionally with income.'} This is a market response, not a judgment about quality.`;
        return {...episode('income',name,'Income index',x1,x2,quantities[i],after[i],label,interpretation,prices[i]),elasticity:e};
      });
      s.choices=names.map((name,i)=>{
        const updated=clone(segments),extra=i===best?40:20;updated[i].attendance+=extra;
        return choice(`Spotlight ${name.toLowerCase()} screenings`,'Add a focused promotion after the income change.',{price:0,segments:updated},i===best?2:i===1?1:0,`Your ${name.toLowerCase()} promotion separately added ${extra} admissions and ${money(extra*prices[i])} ticket revenue. ${names[best]} had the largest percentage booking increase from income alone. The income comparisons below exclude your promotion.`,episodes);
      });
    }
    {
      const s=scenarios[6],v=pools[6][variants[6]],m=scenarios[0].startingState,p=m.price,q=round(m.attendance*1.15),bundle=scenarios[4].startingState.bundlePrice;
      s.title=v[0];s.film=v[1]+' · Final challenge';s.startingState=base.calculate({price:p,attendance:m.attendance,bundlePrice:bundle,bundles:Math.round(m.attendance*.6)});
      s.briefing=`This opening targets the audience whose first-week price test showed inelastic demand. Interest has grown, and the competing promotion has ended. The income report also showed an opportunity for ${variants[5]===3?'budget matinees':'premium screenings'}. Use those learned signals together.`;
      const focus=variants[5]===3?'matinee':'premium',target=(p+2)*q;
      s.mission=`Support ${focus} interest, keep the bundle at ${money(bundle)} or less, and reach ${money(target)} in ticket revenue.`;
      s.choices=[
        choice(`${money(p+2)} tickets · ${money(bundle)} bundle · ${focus} focus`,'Use the earlier price test and income evidence.',{price:p+2,attendance:q,bundlePrice:bundle,bundles:Math.round(q*.6)},2,'The price increase and renewed interest together increased ticket revenue. You applied the earlier inelastic-demand evidence and avoided an extra complementary-price drag. Several forces changed together; this final outcome cannot isolate a single elasticity.',[]),
        choice(`${money(p-2)} tickets · ${money(bundle-2)} bundle · broad focus`,'Make the opening especially accessible.',{price:p-2,attendance:round(q*1.2),bundlePrice:bundle-2,bundles:Math.round(q*1.2*.65)},1,'Lower ticket and bundle prices widened access. The strategy did not focus on the income-driven opportunity. Multiple changes mean this outcome alone cannot identify price, cross-price or income elasticity.',[]),
        choice(`${money(p+4)} tickets · ${money(bundle+2)} bundle · ${focus} focus`,'Seek more revenue per visitor.',{price:p+4,attendance:round(m.attendance*.8),bundlePrice:bundle+2,bundles:Math.round(m.attendance*.8*.5)},0,'Higher prices for both tickets and concessions limited attendance and missed the ticket-revenue target. Earlier inelastic demand did not justify raising every price indefinitely; the complementary-price increase also worked against ticket demand.',[])
      ];
    }
    const season={version:VERSION,seed,variants:variants.slice(),scenarios};
    if(!validate(season)) {
      if(attempt>=49)throw new Error('Could not generate a validated season');
      return generate(seed,variants,attempt+1);
    }
    return season;
  }
  function validate(season) {
    return season.scenarios.length===7 && season.scenarios.every((s,i)=>{
      return [s.startingState,...s.choices.map(c=>c.outcome)].every(o=>{
        const r=base.calculate(o);
        return r.attendance>=600&&r.attendance<=1800&&r.ticketRevenue>0&&Number.isFinite(r.totalRevenue)&&
          (r.segments?r.segments.every(t=>t.price>=7&&t.price<=18&&Number.isInteger(t.attendance)&&t.attendance>0):r.price>=7&&r.price<=18&&Number.isInteger(r.attendance));
      })&&s.choices.every(c=>c.episodes.every(e=>{
        if(![e.x1,e.x2,e.q1,e.q2,e.elasticity].every(Number.isFinite)||e.x1===e.x2||Math.min(e.x1,e.x2,e.q1,e.q2)<=0)return false;
        if(e.kind==='price')return validOwn(e.x1,e.q1,e.x2,e.q2,i);
        if(e.kind==='cross')return e.label==='Substitutes'?e.elasticity>0:e.elasticity<0;
        return e.label==='Inferior good'?e.elasticity<0:e.label.includes('necessity')?e.elasticity>0&&e.elasticity<1:e.elasticity>1;
      }));
    });
  }
  // One shuffle bag per authored pool; an exhausted bag cannot start with its last draw.
  function drawVariants(previous,seed) {
    const random=rng(seed),bags=[],last=[],variants=[];
    pools.forEach((pool,i)=>{
      const prior=previous&&previous.bags&&previous.bags[i];
      let bag=Array.isArray(prior)&&new Set(prior).size===prior.length&&prior.every(v=>Number.isInteger(v)&&v>=0&&v<pool.length)?prior.slice():[];
      if(!bag.length) {
        bag=pool.map((_,j)=>j);
        for(let j=bag.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[bag[j],bag[k]]=[bag[k],bag[j]];}
        if(previous&&previous.last&&bag[bag.length-1]===previous.last[i])[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
      }
      const v=bag.pop();variants.push(v);last.push(v);bags.push(bag);
    });
    return {variants,history:{version:VERSION,bags,last}};
  }
  function pack(state) {return JSON.stringify({version:VERSION,mode:state.mode,round:state.round,season:state.season,selections:state.history.map((r,i)=>state.season.scenarios[i].choices.indexOf(r.choice))});}
  function restore(raw) {
    try {
      const saved=JSON.parse(raw);
      if(saved.version!==VERSION||!['decision','result','debrief'].includes(saved.mode)||!Number.isInteger(saved.round)||saved.round<0||saved.round>7||!Array.isArray(saved.selections))return null;
      const count=saved.mode==='result'?saved.round+1:saved.round;
      if(saved.selections.length!==count||(saved.mode==='debrief')!==(saved.round===7)||saved.selections.some(i=>!Number.isInteger(i)||i<0||i>2))return null;
      // Verify stored values against the seed and authored version before rendering any saved text.
      const season=generate(saved.season.seed,saved.season.variants);
      if(JSON.stringify(season)!==JSON.stringify(saved.season))return null;
      const history=saved.selections.map((j,i)=>{const choice=season.scenarios[i].choices[j];return {choice,result:base.calculate(choice.outcome)};});
      return {mode:saved.mode,round:saved.round,season,history};
    } catch {return null;}
  }
  const api={generate,validate,drawVariants,pack,restore,pools,midpoint,elasticity,validOwn,SAVE_KEY,BAG_KEY};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(window.BoxOffice,api);
})();
