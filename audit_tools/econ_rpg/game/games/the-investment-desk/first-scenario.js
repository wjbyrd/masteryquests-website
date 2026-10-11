import {FIRST_LIBRARY,FALLBACKS} from './first-library.js';
import {npv,bestPortfolio,rng} from './finance.js';
export const MAX_ATTEMPTS=60;
const pick=(items,random)=>items[Math.floor(random()*items.length)];
const rounded=(value,step)=>Math.round(value/step)*step;

export function projectValue(project){return npv(project.cost,project.flows,project.rate);}
export function assessScenario(scenario) {
  const items=scenario.projects.map(p=>({...p,value:projectValue(p)}));
  const positive=items.filter(p=>p.value>0),best=bestPortfolio(items,scenario.budget);
  const largest=items.reduce((a,b)=>a.value>b.value?a:b);
  const forced=largest.value+bestPortfolio(items.filter(p=>p.id!==largest.id),scenario.budget-largest.cost).value;
  const meaningful=positive.length>=3 && positive.reduce((s,p)=>s+p.cost,0)>scenario.budget
    && best.ids.length>=2 && items.every(p=>p.cost>0&&p.cost<=scenario.budget)
    && items.filter((p,i)=>items.slice(i+1).some(q=>p.cost+q.cost<=scenario.budget)).length>=2;
  return {valid:meaningful,best,excludesLargest:best.value-forced>500};
}
function materialize(template,rate,costFactor=1,cashFactor=1,schedule=0) {
  const flows=template.generation.schedules[schedule].map(v=>rounded(v*cashFactor,1000));
  return Object.freeze({id:template.id,name:template.name,company:template.company,icon:template.icon,color:template.color,
    description:template.description,cost:rounded(template.cost*costFactor,5000),flows:Object.freeze(flows),duration:flows.length,rate,
    assumptions:`Installation: ${costFactor<1?'streamlined':costFactor>1?'expanded':'standard'} configuration. ${template.generation.driver[0].toUpperCase()+template.generation.driver.slice(1)}: ${cashFactor<1?'lower':cashFactor>1?'higher':'base'} operating assumption. ${flows.length}-year operating schedule; the listed net cash flows are the stated forecast for this run.`});
}
const freeze=s=>Object.freeze({...s,projects:Object.freeze(s.projects)});
export function fallbackScenario(index=0) {
  const source=FALLBACKS[index%FALLBACKS.length];
  return freeze({...source,projects:source.ids.map(id=>materialize(FIRST_LIBRARY.find(p=>p.id===id),source.rate)),fallback:true,attempts:0});
}
export function generateFirst(seed,{maxAttempts=MAX_ATTEMPTS}={}) {
  // Independent stream: First Quest generation can never consume Second Quest draws.
  const random=rng((seed^0x49b7c231)>>>0),requireTradeoff=random()<.5;
  const limit=Math.max(0,Math.min(MAX_ATTEMPTS,Math.trunc(maxAttempts)||0));
  for(let attempt=1;attempt<=limit;attempt++) {
    const pool=[...FIRST_LIBRARY];
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const budget=pick([200000,225000,250000,275000,300000],random),rate=pick([.08,.1,.12],random);
    const projects=pool.slice(0,6).map(p=>materialize(p,rate,pick(p.generation.costFactors,random),pick(p.generation.cashFactors,random),Math.floor(random()*p.generation.schedules.length)));
    const scenario={budget,rate,projects,attempts:attempt,fallback:false},quality=assessScenario(scenario);
    if(quality.valid&&(!requireTradeoff||quality.excludesLargest))return freeze(scenario);
  }
  return freeze({...fallbackScenario((seed>>>0)%FALLBACKS.length),attempts:limit});
}
