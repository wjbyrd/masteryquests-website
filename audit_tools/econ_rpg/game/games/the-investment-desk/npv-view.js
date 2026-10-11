import {npv} from './finance.js';

const dollars=value=>`${value<0?'−':''}$${Math.abs(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export function workedNPV(projects,rate,{title='Your chosen portfolio',note=''}={}){
  if(!projects.length)return `<div class="worked-npv"><h3>Your choice: keep cash</h3><p>No project investment and no project cash flows: <strong>Project NPV = $0</strong>. Unspent capital is not a loss.</p>${note?`<p>${note}</p>`:''}</div>`;
  const years=Math.max(...projects.map(p=>p.flows.length)),cost=projects.reduce((s,p)=>s+p.cost,0);
  const flows=Array.from({length:years},(_,i)=>projects.reduce((s,p)=>s+(p.flows[i]||0),0));
  const present=flows.reduce((s,flow,i)=>s+flow/(1+rate)**(i+1),0),rawValue=npv(cost,flows,rate),value=Math.abs(rawValue)<1e-7?0:rawValue,factor=(1+rate).toFixed(2);
  return `<section class="worked-npv"><h3>${title}</h3><p>${projects.map(p=>p.name).join(' + ')} · ${Math.round(rate*100)}% discount rate</p>${note?`<p>${note}</p>`:''}<div class="npv-table-wrap" tabindex="0" role="region" aria-label="Worked NPV calculation"><table class="npv-table"><caption>Bring each year's net cash flow back to today's value.</caption><thead><tr><th scope="col">Year</th><th scope="col">Net cash flow</th><th scope="col">Discount calculation</th><th scope="col">Value today</th></tr></thead><tbody>${flows.map((flow,i)=>`<tr><th scope="row">${i+1}</th><td>${dollars(flow)}</td><td>${dollars(flow)} ÷ ${factor}<sup>${i+1}</sup></td><td>${dollars(flow/(1+rate)**(i+1))}</td></tr>`).join('')}</tbody></table></div><div class="npv-equation"><span>Future flows today<strong>${dollars(present)}</strong></span><b aria-label="minus">−</b><span>Initial investment<strong>${dollars(cost)}</strong></span><b aria-label="equals">=</b><span>NPV<strong class="${value<0?'negative':'positive'}">${dollars(value)}</strong></span></div><p class="calculation-note">Cash flows arrive at year end. Totals use unrounded values; displayed cents may differ slightly when added. The discount rate already includes capital’s opportunity cost.</p></section>`;
}

export function npvHelp(projects,rate,options){return `<details class="npv-help"><summary>How does NPV work?</summary><p>NPV is the value of future net cash flows today, minus what you invest now. Positive NPV adds value beyond the required return.</p>${workedNPV(projects,rate,options)}</details>`;}
