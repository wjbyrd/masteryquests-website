import {RATE} from './data.js';

export const npv = (cost, flows, rate=RATE) => flows.reduce((v,c,i)=>v+c/(1+rate)**(i+1),-cost);

// Full-precision comparisons. Exact ties retain the first subset in proposal order.
// The empty portfolio wins a tie at zero; displaying rounded dollars never changes selection.
export function bestPortfolio(items,budget) {
  let best={ids:[],cost:0,value:0};
  for(let mask=0;mask<2**items.length;mask++) {
    const chosen=items.filter((_,i)=>mask & 2**i);
    const cost=chosen.reduce((s,p)=>s+p.cost,0),value=chosen.reduce((s,p)=>s+p.value,0);
    if(cost<=budget && value>best.value)best={ids:chosen.map(p=>p.id),cost,value};
  }
  return best;
}

export function rng(seed) {let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}

// Shared, untruncated linear axis with a visible zero baseline, including losses.
export function comparisonScale(value,best) {
  const min=Math.min(0,value),max=Math.max(0,best,value),span=max-min||1;
  const position=v=>36+(v-min)/span*528;
  return {zero:position(0),player:position(value),best:position(best),min,max};
}
