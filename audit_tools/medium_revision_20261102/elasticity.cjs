module.exports=({edit,choices,items})=>{
const fs=require('fs'),path=require('path');
const cases=[
['P62B-ELAS-B2-001',10,12,1000,800,'demand'],['P62B-ELAS-B2-002',30,27,500,620,'demand'],
['P62B-ELAS-B2-003',60,72,2000,1700,'demand'],['P62B-ELAS-B2-004',20,24,1500,1200,'demand'],
['P62B-ELAS-EL-001',80,92,5000,4100,'demand'],['P62B-ELAS-EL-002',300,345,900,720,'demand'],
['P62B-ELAS-EL-003',5000,5400,1200,1140,'demand'],['P62B-ELAS-EL-005',45,51,1600,1360,'demand'],
['P62B-ELAS-EL-007',3.2,3.8,8000,7400,'demand'],['P62B-ELAS-EL-008',900,810,450,585,'demand'],
['P62B-ELAS-EL-009',12,15,10000,7600,'demand'],['P62B-ELAS-EL-010',200,230,700,560,'demand'],
['P62B-ELAS-L-017',250,300,1200,1260,'supply'],['P62B-ELAS-L-018',80,96,10000,13000,'supply'],
['P62B-ELAS-L-019',30,36,5000,5450,'supply'],['P62B-ELAS-L-020',2,2.4,80000,100000,'supply'],
['P62B-ELAS-L-021',40,48,200000,245000,'supply'],['P62B-ELAS-L-022',15000,16500,800,880,'supply'],
['P62B-ELAS-L-023',50,65,9000,9300,'supply']
];
const f=n=>Number(n.toFixed(2)).toLocaleString('en-US',{maximumFractionDigits:2}),numerical=[];
for(const [id,p0,p1,q0,q1,kind]of cases){const avgp=(p0+p1)/2,avgq=(q0+q1)/2,dp=Math.abs(p1-p0),dq=Math.abs(q1-q0),pp=dp/avgp*100,qp=dq/avgq*100,e=qp/pp,unit=Math.abs(e-1)<1e-10,classification=unit?'unit elastic':e>1?'elastic':'inelastic';
 const feedback=`Use the average of the two quantities and the average of the two prices as the midpoint denominators. The quantity change has magnitude ${f(dq)} ÷ ${f(avgq)} × 100 = ${f(qp)}%. The price change has magnitude ${f(dp)} ÷ ${f(avgp)} × 100 = ${f(pp)}%. Divide the unrounded percentage changes: elasticity ≈ ${f(e)}. ${kind==='demand'?'Reporting price elasticity of demand as a positive magnitude, demand':'Supply'} is ${classification}: quantity responds ${unit?'in the same proportion as':e>1?'proportionally more than':'proportionally less than'} price.`;
 edit(id,{feedback},'Show midpoint denominators, percentage changes, coefficient, and economic interpretation.');numerical.push({id,p0,p1,q0,q1,kind,elasticity:e,classification});
}
fs.writeFileSync(path.join(__dirname,'numerical-cases.json'),JSON.stringify(numerical,null,2)+'\n');
choices('P62B-ELAS-L-020','About 1.22; quantity responds proportionally more than price.',['About 0.82; quantity responds proportionally less than price.','About 0.61; quantity responds proportionally less than price.','About 1.00; quantity and price change in the same proportion.']);
choices('P62B-ELAS-L-023','About 0.13; quantity responds proportionally less than price.',['About 7.96; quantity responds proportionally more than price.','About 0.13; quantity responds proportionally more than price.','About 0.00; quantity does not respond to the price change.']);
for(const id of ['P62B-ELAS-B2-020','P62B-ELAS-EL-038']){
 edit(id,{q:'Refer to the graph. Initially, price is $4 and quantity supplied is 60 in both time periods. Price then rises to $8. Point A shows the short-run outcome and point B the long-run outcome for that same price increase. How much does quantity supplied rise in each period, and why are the responses different?',feedback:'Both comparisons begin at price $4 and quantity 60. At $8, short-run quantity is 70 at A and long-run quantity is 100 at B. The increases are 70 − 60 = 10 and 100 − 60 = 40 units. More time to adjust inputs and capacity allows a larger long-run response. A and B are alternative outcomes of the same price change, not the starting and ending points of that change.'},'State the common starting point and distinguish alternative time-horizon outcomes; apply the cross-referenced Hard placement.');
 choices(id,'10 units in the short run and 40 in the long run; more adjustment time permits a larger response.',[
 '20 units in the short run and 60 in the long run; more adjustment time permits a larger response.',
 '10 units in the short run and 40 in the long run; the longer horizon limits capacity adjustment.',
 '70 units in the short run and 100 in the long run; the final quantities measure the increases.'
 ]);
}
edit('P62B-ELAS-L-065',{q:'A tariff raises the price of imports by exactly the amount forecast. Income and other prices are unchanged, but import quantity falls more than forecast. Which responsiveness was probably underestimated?',feedback:'The observed price change is already accounted for. A larger quantity response to that same own-price change indicates that import demand is more price elastic than assumed. Income and other-price effects are held constant.'},'Use relevant elasticity alternatives and hold other forecast drivers constant.');
choices('P62B-ELAS-L-065','The price elasticity of import demand.',['The income elasticity of import demand.','The cross-price elasticity of imports with respect to domestic goods.','The price elasticity of demand for the country’s exports.']);
edit('P62B-ELAS-L-074',{feedback:'For point elasticity, use the local demand slope: |dQ/dP| × P/Q. Demand Q = 100 − 2P has dQ/dP = −2. At P = 20 and Q = 60, the magnitude is 2 × 20/60 = 2/3 ≈ 0.67. This is point elasticity, not a midpoint calculation over two observations.'},'Make the point-elasticity method explicit and retain the instructor’s Legendary placement.');
edit('P62B-ELAS-L-075',{feedback:'Point price elasticity uses the magnitude of the demand slope multiplied by P/Q. For Q = 100 − 2P, the slope magnitude is 2. At P = 40 and Q = 20, elasticity is 2 × 40/20 = 4. Demand is elastic at that point. This is a point-elasticity calculation, not the midpoint method.'},'Identify the advanced point-elasticity method and retain the instructor’s separate Elite placement.');
const destinations={
'P62B-ELAS-H-023':['tax-incidence','tax_incidence_elasticity'],
'P62B-ELAS-H-024':['tax-incidence','tax_incidence_elasticity'],
'P62B-ELAS-L-054':['tax-incidence','tax_incidence_elasticity'],
'P62B-ELAS-L-055':['tax-incidence','tax_incidence_elasticity'],
'P62B-ELAS-M-021':['tax-incidence','tax_incidence_elasticity'],
'P62B-ELAS-M-023':['tax-wedges-and-revenue','tax_quantity_effect'],
'P62B-ELAS-M-026':['tax-wedges-and-revenue','tax_revenue_quantity_base'],
'PMA-ELAS-M-042':['tax-wedges-and-revenue','tax_quantity_effect'],
'P62B-ELAS-L-064':['international-trade-and-trade-policy','tariff_price_effect','tariffs-revenue-deadweight-loss'],
'P62B-ELAS-M-034':['demand','demand_schedule_interpretation'],
'P62B-ELAS-M-035':['demand','demand_schedule_interpretation'],
'P62B-ELAS-M-038':['supply','graph_reading']
};
for(const [id,[cid,skill,subtopic]]of Object.entries(destinations)){
 const old=items.get(id).question;
 edit(id,{primaryConceptId:cid,familyConceptId:cid,subtopicIds:subtopic?[subtopic]:[],primarySkill:skill,secondaryConceptIds:[...new Set(['elasticity',...(old.secondaryConceptIds||[])])].filter(x=>x!==cid)},'Move the primary placement to the concept actually assessed; keep the current difficulty and source provenance. Tax-burden questions go to Tax Incidence, quantity/revenue questions to Tax Wedges and Revenue, and the tariff question to the tariff subtopic.');
}
};
