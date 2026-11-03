'use strict';
const fs=require('fs'),assert=require('assert/strict'),draft=require('./content-edits.json');
let checks=0;const ids=new Set();
function number(c,x,tol=.016){const a=c.afterRecord.options[c.correctIndex],ns=(a.replaceAll(',','').match(/\d+(?:\.\d+)?/g)||[]).map(Number);assert((x===0&&/^(Shut down|Government purchases stay unchanged)/.test(a))||ns.some(n=>Math.abs(n-Math.abs(x))<=tol),`${c.id}: computed ${x}; answer ${a}`);checks++;ids.add(c.id);}
for(const c of draft.changes){const s=c.beforeRecord.q.replaceAll(',',''),n=s.replace(/\s/g,'').replace(/[−–]/g,'-');let m;
 if(m=s.match(/pays each worker \$(\d+)\. Worker (\d+) raises output from (\d+) to (\d+)/)){const[w,k,a,b]=m.slice(1).map(Number);number(c,b-a);number(c,w/(b-a));}
 if(m=s.match(/Q=(\d+) TFC=\$(\d+) and (\d+) workers each cost \$(\d+)/)){const[q,f,l,w]=m.slice(1).map(Number);number(c,f/q);number(c,l*w/q);number(c,(f+l*w)/q);}
 if(m=s.match(/TC rises from \$(\d+) to \$(\d+) as Q rises from (\d+) to (\d+)/)){const[a,b,x,y]=m.slice(1).map(Number);number(c,(b-a)/(y-x));}
 if(m=s.match(/has TFC \$(\d+) (\d+) workers at \$(\d+) and Q=(\d+)/)){const[f,l,w]=m.slice(1).map(Number);number(c,f+l*w);}
 if(m=c.beforeRecord.q.match(/(?:four-firm concentration ratio|HHI) for (?:shares |(?:this market|market C\d+) with percentage shares )\[([^\]]+)\]/)){const shares=m[1].split(',').map(Number);number(c,/HHI/.test(m[0])?shares.reduce((a,v)=>a+v*v,0):shares.sort((a,b)=>b-a).slice(0,4).reduce((a,v)=>a+v,0));}
 if(m=n.match(/At(?:themonopolyoptimum|theprofit-maximizingoutput),Q=([\d.]+),P=\$([\d.]+),andATC=\$([\d.]+)/)){const[q,p,atc]=m.slice(1).map(Number);number(c,(p-atc)*q);}
 if(m=n.match(/Qm=([\d.]+),Qc=([\d.]+),andthedemand.MCgap(?:atQm)?is\$([\d.]+)/)){const[q,e,g]=m.slice(1).map(Number);number(c,(e-q)*g/2);}
 if(/^P62G-MON-L-/.test(c.id)&&(m=n.match(/demandP=(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)Q\.AtQ=([\d.]+)/))){const[a,b,q]=m.slice(1).map(Number);number(c,a-b*q);number(c,a-2*b*q);}
 if(m=c.beforeRecord.q.match(/price(?:-taking firm facing price| is) \$(\d+).*?fixed cost(?: is)? \$(\d+).*?marginal costs (?:for|of) units 1–6 are ([^.]+)/i)){const p=+m[1],f=+m[2],mc=m[3].split(',').map(v=>+v.replace(/[^\d.]/g,''));if(mc.length===6){let vc=0,profit=-f,output=0;for(let i=0;i<6;i++){vc+=mc[i];const pi=p*(i+1)-vc-f;if(pi>profit){profit=pi;output=i+1;}}number(c,output);number(c,profit);}}
 if(m=c.beforeRecord.q.match(/Cooperating pays (\d+) each period.*Cheating pays (\d+) now, followed by (\d+).*Multiply each future payoff by ([\d.]+)/)){const[a,b,p,d]=m.slice(1).map(Number);number(c,a/(1-d)-(b+d*p/(1-d)));}
}
const explicit={'LG-Q-9073':[100,100/(1-.6),100/(1-.6)-75],'LG-Q-4008':[0,40*.6,40*.6/(1-.6)],'P52A-FISCAD-EL-001':[120-.8*100],'PM2C1-MCL-FB-006':[1040/260],'P52B-S3-MPT-B3-001':[600-.1*3000,600-.15*3000],'P52B-S1-LRPC-L-002':[6.4-5.6,5.6-4.9,5.6],'P52A-OPPC-B3-001':[14+20],'P52A-MARG-H-003':[2],'P73-MARG-H-010':[22000+11000],'42117':[(90-60)*8/2],'42131':[7-4],'42737':[18,.18/.2]};
for(const[id,values]of Object.entries(explicit)){const c=draft.changes.find(c=>c.id===id);assert(c,id);for(const v of values){if(id==='P52A-MARG-H-003'){assert.equal(c.afterRecord.options[c.correctIndex],'Two hours.');checks++;ids.add(id);}else number(c,v);}}
// Confirm the best feasible alternative, not just the sum quoted in the answer.
const projects=[[12,8,24],[5,3,14],[7,5,15],[6,5,20]];let best=0;
for(let mask=1;mask<16;mask++){const total=[0,0,0];projects.forEach((p,i)=>{if(mask&(1<<i))p.forEach((v,j)=>total[j]+=v);});if(total[0]<=12&&total[1]<=8)best=Math.max(best,total[2]);}assert.equal(best,34);checks++;
assert(ids.size>=45,'Expected broad numerical-family coverage');
const result={status:'PASS',independentChecks:checks,questionsWithRecomputedResults:ids.size,ids:[...ids],scope:'Recomputed production costs, marginal products, market concentration, selected monopoly and competitive profits, repeated-game payoffs, fiscal effects, reserves, unemployment gaps, external costs, and feasible project combinations. Graphs and unedited calculations retain their prior validation.'};
fs.writeFileSync(__dirname+'/calculation-validation.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,ids:undefined}));
