/* Fictional, deterministic market experiments. Each week starts from its own
   reference market; only the player's season totals carry between releases. */
(() => {
  const state = (price, attendance, extra = {}) => ({price, attendance, ...extra});
  const choice = (title, detail, outcome, points, feedback) => ({title, detail, outcome, points, feedback});
  const scenarios = [
    {id:'premiere', title:'The Premiere', film:'Midnight City · Opening weekend', concept:'Price elasticity of demand', background:'manager-office',
      briefing:'Advance interest is strong. Fans want to see this release on its first weekend, and few nearby theaters have it.',
      mission:'Strengthen ticket revenue while keeping at least 900 admissions.', startingState:state(12,1000),
      choices:[
        choice('Offer a $10 opening price','Make the premiere more accessible.',state(10,1080),1,'The lower price drew 80 extra admissions, but ticket revenue fell. Quantity demanded rose proportionally less than price fell: this audience was relatively inelastic.'),
        choice('Hold tickets at $12','Keep the established opening price.',state(12,1000),1,'You kept attendance and ticket revenue steady. The release’s price tests show that $14 retains 940 admissions and earns more revenue: quantity demanded is relatively unresponsive to price.'),
        choice('Set tickets at $14','Charge more for a much-anticipated release.',state(14,940),2,'Price rose 16.7%, while quantity demanded fell only 6%. Demand was relatively inelastic, so ticket revenue increased while attendance stayed above your target.')
      ]},
    {id:'tougher-sell', title:'A Tougher Sell', film:'The Last Postcard · A quieter release', concept:'Elastic demand', background:'manager-office',
      briefing:'This week’s film has modest reviews. Several similar films are available nearby, and customers are comparing prices.',
      mission:'Bring in at least 900 admissions without reducing reference ticket revenue.', startingState:state(12,800),
      choices:[
        choice('Offer a $10 promotional price','Give undecided viewers a reason to visit.',state(10,1040),2,'Price fell 16.7%, while quantity demanded rose 30%. This audience was relatively elastic, so the larger audience more than offset the discount and ticket revenue rose.'),
        choice('Hold tickets at $12','Protect the price, accepting a smaller audience.',state(12,800),1,'You preserved reference ticket revenue, but did not reach the attendance target. A $10 price test brings in 1,040 admissions and more revenue: these viewers are relatively price-sensitive.'),
        choice('Set tickets at $14','Try to earn more from each visitor.',state(14,560),0,'Price rose 16.7%, while quantity demanded fell 30%. Relatively elastic demand meant the lost admissions outweighed the higher price, reducing ticket revenue.')
      ]},
    {id:'revenue-test', title:'The Revenue Test', film:'City Lights · Extended run', concept:'Unit elasticity and total revenue', background:'manager-office',
      briefing:'City Lights is late in its run, with room for more viewers. The booking team forecasts 1,240 admissions at $10, 1,000 at $12, and 800 at $15.',
      mission:'Choose the pricing strategy that best fits an established film late in its run.', startingState:state(12,1000),
      choices:[
        choice('Offer a $10 encore price','Open the doors to a larger audience.',state(10,1240),2,'The lower price increased quantity demanded by 240 admissions and ticket receipts by $400. The response between $12 and $10 was elastic: the extra admissions more than offset the discount, a useful fit for a film late in its run.'),
        choice('Keep tickets at $12','Maintain the established audience size.',state(12,1000),1,'You held ticket receipts at $12,000. The $15 forecast also earns $12,000 with fewer admissions, illustrating a unit-elastic comparison; the $10 forecast instead earns $12,400 by attracting more late-run viewers.'),
        choice('Set tickets at $15','Serve fewer viewers at a higher price.',state(15,800),0,'You admitted 200 fewer viewers and earned the same $12,000 as the $12 reference. That pair illustrates unit elasticity: the higher price is exactly offset in receipts by lower quantity demanded, leaving an opportunity to attract more late-run viewers.')
      ]},
    {id:'streaming', title:'Streaming Special', film:'A cheaper night at home', concept:'Cross-price elasticity · substitutes', background:'manager-office',
      briefing:'Streamline cut its weekend rental price from $8 to $4. With your tickets still $12, theater attendance fell from 1,000 to 800 before you acted.',
      mission:'Recover at least 900 admissions without dropping below the current $9,600 ticket revenue.', startingState:state(12,800),
      choices:[
        choice('Hold tickets at $12','Wait out the streaming promotion.',state(12,800),0,'Your ticket price stayed fixed, yet cheaper streaming had reduced demand for theater tickets. Streaming and theater visits behaved as substitutes here: their cross-price elasticity was positive.'),
        choice('Offer $10 weekend tickets','Compete on the price of a night out.',state(10,1000),2,'Your discount recovered attendance and lifted ticket revenue from $9,600 to $10,000. Cheaper streaming first shifted theater demand down, showing substitutes; your own price cut then increased quantity demanded along the new demand curve.'),
        choice('Keep $12; host a cast discussion','Add an exclusive recorded Q&A at no extra ticket charge.',state(12,920),2,'The theater-only event recovered some attendance and increased ticket revenue; event costs are not modeled. Cheaper streaming had shifted theater demand down, showing substitutes in this market, while your added experience attracted viewers back.')
      ]},
    {id:'popcorn', title:'The Popcorn Problem', film:'The whole cost of a night out', concept:'Cross-price elasticity · complements', background:'concessions-lobby',
      briefing:'Tickets stay at $12. A lobby pilot found that a $6 popcorn-and-drink bundle attracts 1,050 admissions, compared with 1,000 at $8 and 900 at $10.',
      mission:'Make the whole outing more accessible and attract at least 1,050 admissions.', startingState:state(12,1000,{bundlePrice:8,bundles:600}),
      choices:[
        choice('Offer the bundle for $6','Reduce the cost of the complete outing.',state(12,1050,{bundlePrice:6,bundles:650}),2,'Cheaper concessions increased demand for tickets even though the ticket price stayed $12. The negative cross-price response makes these goods complements in this market; ticket revenue rose, while combined revenue fell slightly.'),
        choice('Keep the bundle at $8','Preserve the current mix of admissions and receipts.',state(12,1000,{bundlePrice:8,bundles:600}),1,'You maintained attendance and combined revenue. The pilot’s cheaper bundle drew more theater visits at an unchanged ticket price, revealing complements with negative cross-price elasticity; holding steady missed your access target.'),
        choice('Raise the bundle to $10','Seek more concession revenue per purchase.',state(12,900,{bundlePrice:10,bundles:450}),0,'More expensive concessions reduced demand for tickets at the unchanged $12 ticket price. The negative cross-price response shows complements here, and both ticket revenue and combined revenue fell.')
      ]},
    {id:'rebate', title:'Rebate Weekend', film:'More room in the household budget', concept:'Income elasticity', background:'manager-office',
      briefing:'A one-time household rebate raises disposable income by 10%. At unchanged prices, advance bookings shift as shown below; now choose where to focus your promotion.',
      mission:'Promote the offering with the strongest positive response to income.', startingState:state(0,0,{segments:[{name:'Premium',price:16,attendance:260},{name:'Standard',price:12,attendance:525},{name:'Matinee',price:8,attendance:270}]}),
      income:[{name:'Premium · $16',before:200,after:260},{name:'Standard · $12',before:500,after:525},{name:'Matinee · $8',before:300,after:270}],
      choices:[
        choice('Spotlight premium evenings','Promote the offering with the largest booking increase.',state(0,0,{segments:[{name:'Premium',price:16,attendance:300},{name:'Standard',price:12,attendance:525},{name:'Matinee',price:8,attendance:270}]}),2,'Before promotion, the income rise lifted premium bookings 30% and standard bookings 5%: both behaved as normal goods. Matinee bookings fell 10%, an inferior-good response in this market; your premium campaign then added 40 more admissions.'),
        choice('Spotlight standard screenings','Build on the smaller increase in standard bookings.',state(0,0,{segments:[{name:'Premium',price:16,attendance:260},{name:'Standard',price:12,attendance:550},{name:'Matinee',price:8,attendance:270}]}),1,'Standard bookings rose with income, so this was a normal-good response, though premium’s response was stronger. Matinees behaved as an inferior option here because bookings fell as income rose; your standard promotion separately added 25 admissions.'),
        choice('Spotlight discount matinees','Keep a budget option visible to the community.',state(0,0,{segments:[{name:'Premium',price:16,attendance:260},{name:'Standard',price:12,attendance:525},{name:'Matinee',price:8,attendance:285}]}),0,'The rebate had reduced matinee bookings, an inferior-good response in this fictional market, while premium and standard behaved as normal goods. Your campaign added 15 matinee admissions, supporting access but missing the strongest income-driven opportunity.')
      ]},
    {id:'opening-night', title:'Opening Night', film:'The Silver Horizon · Final challenge', concept:'Read the market', background:'theater-exterior',
      briefing:'Advance interest is as strong as your first premiere. Streaming’s discount has ended. Rebate households favor premium experiences, while concession costs have risen.',
      mission:'Support premium interest, keep the bundle at $8 or less, and earn at least $14,000 in ticket revenue.', startingState:state(12,1000,{bundlePrice:8,bundles:600}),
      choices:[
        choice('$14 tickets · $8 bundle · premium focus','Use strong opening interest while containing the whole outing’s price.',state(14,1050,{bundlePrice:8,bundles:630}),2,'Compared with the $12 reference, your higher price restrained quantity demanded, but renewed theater interest and the premium campaign more than offset it. The $8 bundle avoided an extra complementary-demand drag; several forces moved together, so this outcome alone cannot measure price elasticity.'),
        choice('$10 tickets · $6 bundle · standard focus','Make the opening weekend especially accessible.',state(10,1400,{bundlePrice:6,bundles:980}),1,'Affordable tickets and concessions brought the largest audience, and ticket revenue reached $14,000. You supported access but did not target the strongest premium-income response; combined changes mean this result cannot isolate any single elasticity.'),
        choice('$16 tickets · $10 bundle · premium focus','Seek higher receipts per visitor to meet rising costs.',state(16,850,{bundlePrice:10,bundles:425}),0,'Premium interest could not fully offset the expensive outing: admissions fell below the reference and ticket revenue missed the target. The higher concession price worked against ticket demand, illustrating why relatively inelastic demand is not permission to raise every price indefinitely.')
      ]}
  ];
  function calculate(raw) {
    const attendance = raw.segments ? raw.segments.reduce((n,s)=>n+s.attendance,0) : raw.attendance;
    const ticketRevenue = raw.segments ? raw.segments.reduce((n,s)=>n+s.price*s.attendance,0) : raw.price*attendance;
    const concessionRevenue = (raw.bundlePrice || 0)*(raw.bundles || 0);
    return {...raw, attendance, ticketRevenue, concessionRevenue, totalRevenue:ticketRevenue+concessionRevenue};
  }
  function summarize(history) {
    const points = history.reduce((n,r)=>n+r.choice.points,0);
    return {points,strong:history.filter(r=>r.choice.points===2).length,
      attendance:history.reduce((n,r)=>n+r.result.attendance,0),
      ticketRevenue:history.reduce((n,r)=>n+r.result.ticketRevenue,0),
      tier:points>=11?'Full House':points>=6?'Steady Show':'Empty Seats'};
  }
  const api = {scenarios, calculate, summarize};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.BoxOffice = api;
})();
