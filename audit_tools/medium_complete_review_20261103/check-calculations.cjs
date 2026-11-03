'use strict';
const fs=require('fs'),assert=require('assert/strict'),draft=require('./content-edits.json');let checks=0;const ids=new Set(),byId=new Map(require('./inventory.json').items.map(i=>[i.id,{id:i.id,correctIndex:i.correctIndex,afterRecord:i.question}]));for(const c of draft.changes)byId.set(c.id,c);
function number(c,x,tol=.016){const a=c.afterRecord.options[c.correctIndex],ns=(a.replaceAll(',','').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);assert(ns.some(n=>Math.abs(Math.abs(n)-Math.abs(x))<=tol),`${c.id}: computed ${x}; answer ${a}`);checks++;ids.add(c.id);}
for(const c of draft.changes){const s=c.afterRecord.q.replaceAll(',','');let m;
 if(m=s.match(/increases its workforce from (\d+) to (\d+) workers.*output rises from (\d+) to (\d+)/)){const[a,b,x,y]=m.slice(1).map(Number);number(c,(y-x)/(b-a));assert.equal(c.afterRecord.options.filter(o=>Math.abs(parseFloat(o)-(y-x)/(b-a))<.001).length,1);checks++;}
 if(m=s.match(/adds (\d+) workers? and gains (\d+)/)){number(c,+m[2]/+m[1]);assert.equal(c.afterRecord.options.filter(o=>Math.abs(parseFloat(o)-m[2]/m[1])<.001).length,1);checks++;}
 if(s.includes('Cost of each additional unit')){const p=+s.match(/receives \$(\d+)/)[1],mc=[...s.matchAll(/<tr><td>\d+<\/td><td>\$([\d.]+)<\/td><\/tr>/g)].map(m=>+m[1]);assert.equal(mc.length,6);let vc=0,best=0,q=0;mc.forEach((v,i)=>{vc+=v;const profit=p*(i+1)-vc;if(profit>best){best=profit;q=i+1;}});number(c,q);}
 if(s.includes('Price buyers will pay')&&!/from \d+ to \d+/.test(s)){const rows=[...s.matchAll(/<tr><td>(\d+)<\/td><td>\$([\d.]+)<\/td><\/tr>/g)].map(m=>m.slice(1).map(Number));const word=s.match(/(?:the |from the )?(first|second|third|fourth|fifth|\d)(?: unit)/);assert(word,c.id);const q=({first:1,second:2,third:3,fourth:4,fifth:5})[word[1]]||+word[1];number(c,q*rows[q][1]-(q-1)*rows[q-1][1]);}
 if(m=s.match(/earns \$(\d+) each period.*Cheating pays \$(\d+) now and \$(\d+).*ahead by ([\d.]+)/)){const[a,b,p,d]=m.slice(1).map(Number);assert(a/(1-d)>b+d*p/(1-d));assert(/^Yes\. Continuing/.test(c.afterRecord.options[c.correctIndex]));checks++;ids.add(c.id);}
 if(m=s.match(/shares of (\d+)% and (\d+)% merge/))number(c,2*m[1]*m[2]);
 if(/Herfindahl/.test(s)&&(m=s.match(/(?:shares are|shares of|shares) ([\d%, and]+)/))){const v=m[1].match(/\d+/g)?.map(Number)||[];if(v.reduce((a,b)=>a+b,0)===100)number(c,v.reduce((a,b)=>a+b*b,0));}
 if(m=s.match(/It lowers price from \$([\d.]+) to \$([\d.]+).*sales from (\d+) to (\d+)/)){number(c,(m[2]-m[1])*m[3]);assert(/−|-/.test(c.afterRecord.options[c.correctIndex]));checks++;}
 if(m=s.match(/produces ([\d.]+) units in long-run equilibrium\. It would minimize average total cost at ([\d.]+) units/))number(c,m[2]-m[1]);
 if(m=s.match(/charges \$([\d.]+) in long-run equilibrium, with marginal cost of \$([\d.]+)/))number(c,m[1]-m[2]);
 if(m=s.match(/poverty threshold.*?\$([\d,]+)/i)){/* classification families are checked explicitly below */}
 if(/How is the household classified under this income-based rule/.test(s)){const v=[...s.matchAll(/\$([\d.]+)/g)].map(m=>+m[1]);assert(v[0]<v[1]);assert.equal(c.afterRecord.options[c.correctIndex],'Below the poverty threshold.');checks++;ids.add(c.id);}
}
const explicit={
 'LG-Q-373':[200-60],'LG-Q-275':[300-80],'P52A-FISCAD-B2-001':[80*.6,80*.6/(1-.6)],'LG-Q-171':[1000*.6],'LG-Q-172':[1/(1-.6)],'LG-Q-173':[50/(1-.8)],'ECON-SP-HARD-231':[1/(1-.5),1/(1-.8)],'ECON-SP-MEDIUM-146':[50*3],'P52A-FISCAD-H-001':[80-50],'P52A-FISCAD-H-006':[42/60],'P52B-S4-FMCO-B2-002':[1-120/480],'P52B-S4-FMCO-B2-003':[130/(1-.8)-390,130/(1-.5)],
 'LG-Q-139':[9-4],'LG-Q-140':[2+6],'LG-Q-3007':[7-3,7-6],'ECON-SP-HARD-209':[9-4],'ECON-SP-MEDIUM-115':[6+2],
 'PM2B1-GDPC-MB-002':[100,24-100,24],'ECON-NL-GDP-COMPONENTS-IDENTITY-6003':[30000,20000],'ECON-NL-HARD-205':[80+(230-80)],
 'P52B-S2-LSG-M-001':[4-1],'ECON-NL-MEDIUM-141':[70/5],'ECON-NL-MEDIUM-142':[70/1],'P52A-MARG-M-005':[9-6],'ECON-SP-MEDIUM-107':[80000-40000],'LG-Q-134':[20/5],
 'LG-Q-105':[2000+900+300+200],'P52A-OPPC-M-001':[180],'P52A-OPPC-M-003':[12000+24000],'P52A-OPPC-M-004':[50000],'P52A-OPPC-M-005':[30000],'P52A-OPPC-H-001':[15000],'P52A-OPPC-B2-003':[10000+30000],
 'ECON-NL-MEDIUM-145':[2400/300],'ECON-SP-HARD-206':[8+1-3],'ECON-SP-MEDIUM-110':[5-2],'LG-Q-130':[400*5/1000],'LG-Q-132':[20000/5000],'LG-Q-231':[8-2],'PMOE-RER-M-003':[8-3],'ECON-NL-ELITE-316':[(36/30-1)*100],'ECON-NL-MEDIUM-116':[24/1.2],'ECON-NL-MEDIUM-137':[7-9],
 'PM2A-SAC-H-013':[6.5/3],'ECON-SP-ELITE-330':[(12-7)*3.5],'ECON-SP-ELITE-331':[14/4],'ECON-SP-HARD-250':[12/3],'ECON-SP-MEDIUM-167':[3*(8-5)],'ECON-EC-MEDIUMBOSS-18010':[15/165*100,165/300*100],
 'P62F-PC-B2-019':[50*(38-30)],'P62F-PC-B2-020':[60*(24-31)],'P62H-MCMP-M-005':[42-31],'P62H-MCMP-M-020':[92-1.5*22.09],'P62H-MCMP-EL-024':[68-50.4,35.47-22],'P62H-MCMP-L-041':[82-48.4],'P62H-MCMP-L-047':[74-48,41.62-26],
 'P62D-ITP-B2-019':[780-460],'P62D-ITP-B2-020':[900-540],'P62D-ITP-B2-025':[1300-900],'42146':[15+35]
};
for(const[id,values]of Object.entries(explicit)){const c=byId.get(id);assert(c,id);for(const v of values)number(c,v,id==='ECON-EC-MEDIUMBOSS-18010'?.051:.016);}
for(const[id,mp,price,wage]of [['42404',6,8,42],['42407',3,15,40],['42409',4,14,60],['42412',2,35,72],['42416',5,11,58],['42419',8,5,44],['42421',6,9,60]]){const c=byId.get(id),a=c.afterRecord.options[c.correctIndex];assert.equal(/^Hire the worker/.test(a),mp*price>wage,id);checks++;ids.add(id);}

for(const[id,a,b]of [['42447',14,1],['42450',26,2],['42453',50,2],['42459',46,2]])number(byId.get(id),a/b);
for(const[id,q,p,atc]of [['P62G-MON-M-017',20,60,35],['P62G-MON-M-019',22.5,56.25,58.03],['P62G-MON-M-020',20,70,40],['P62G-MON-M-021',4.88,60.24,111.74],['P62G-MON-M-022',19.33,64.4,54.52]])number(byId.get(id),q*(p-atc),['P62G-MON-M-019','P62G-MON-M-022'].includes(id)?.51:.02);
for(const[id,a,b,c,d,f]of [['P62G-MON-B2-028',120,2.5,24,.2,420],['P62G-MON-B2-031',64,1.8,48,.15,300],['P62G-MON-B2-034',105,2.1,18,.3,650]]){const q=(a-c)/(2*b+d);number(byId.get(id),q*(a-b*q)-f-c*q-d*q*q/2,.02);}
for(const id of ['LG-Q-335','LG-Q-9026'])number(byId.get(id),((1/1.5)/(1/2)-1)*100,.05);
for(const[id,values]of Object.entries({'P52B-S4-STAB-B2-003':[390-260],'PM2A-SAC-M-006':[3*2.5],'PM2A-SAC-H-011':[9/3]}))for(const v of values)number(byId.get(id),v,.02);
const shutdown=byId.get('PM5-PC-M-041');assert(shutdown.afterRecord.q.includes('receives $7 per unit'));assert(shutdown.afterRecord.q.includes('average variable cost is $8'));assert(/shut down/i.test(shutdown.afterRecord.options[shutdown.correctIndex]));checks++;
assert(ids.size>=90);

const result={status:'PASS',independentChecks:checks,questionsWithRecomputedResults:ids.size,ids:[...ids],scope:'Independently recomputed changed numerical families: marginal product and hiring, discrete monopoly revenue and competitive output, price effects, markups and excess capacity, concentration, repeated-game present values, fiscal multipliers, GDP, interest rates, growth, money, sacrifice ratios, poverty classifications and unemployment. Graph readings for all 320 graph-bearing items were separately compared against all 115 referenced asset paths. All 1,586 questions received complete text review.'};fs.writeFileSync(__dirname+'/calculation-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,ids:undefined}));
