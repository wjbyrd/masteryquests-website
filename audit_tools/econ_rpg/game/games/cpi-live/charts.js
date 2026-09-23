import { CONFIG } from './config.js';
// Two independently scaled charts; numeric labels and the adjacent table carry the meaning.
const fmt=(value,rate=false)=>value.toFixed(rate?CONFIG.decimals.rate:CONFIG.decimals.index)+(rate?'%':'');
const round=n=>Number(n.toFixed(2));
const left=62,right=334,top=64,bottom=184;
export function chartGeometry(values,rate=false){
  const min=rate?Math.min(0,Math.floor(Math.min(...values)/5)*5):Math.floor(Math.min(...values)/5)*5-5;
  const max=Math.max(min+5,Math.ceil(Math.max(...values)/5)*5+(rate?0:5));
  const y=value=>round(bottom-(value-min)/(max-min)*(bottom-top));
  const xs=values.map((_,i)=>round(left+(right-left)*(rate?(i+.5)/values.length:i/(values.length-1))));
  return {min,max,zero:y(0),points:values.map((value,i)=>({x:xs[i],y:y(value),value})),ticks:[min,(min+max)/2,max].map(value=>({value,y:y(value)}))};
}
function chart(values,rate){
  const id=rate?'inflation-path':'cpi-path',title=rate?'INFLATION RATE':'PRICE LEVEL — CPI',g=chartGeometry(values,rate);
  const data=values.map((v,i)=>`Year ${i+(rate?2:1)}: ${fmt(v,rate)}`).join('; ');
  const desc=rate?`Annual percentage change from the previous year. ${data}. Bars below zero show deflation.`:`CPI index relative to the base year, which equals 100. ${data}. The line shows the price level, not the inflation rate.`;
  const axes=`<path class="chart-axis" d="M${left} ${top}V${bottom}H${right}"/><text x="${left}" y="25">${rate?'Annual change (%)':'CPI index'}</text><text x="${(left+right)/2}" y="239" text-anchor="middle">Year</text>`;
  const ticks=g.ticks.map(t=>`<path class="chart-guide" d="M${left} ${t.y}H${right}"/><text x="${left-9}" y="${t.y+6}" text-anchor="end">${round(t.value)}</text>`).join('');
  const labels=g.points.map((p,i)=>`<text x="${p.x}" y="214" text-anchor="middle">${i+(rate?2:1)}</text>`).join('');
  const marks=rate?`<path class="chart-zero" d="M${left} ${g.zero}H${right}"/>${g.points.map(p=>`<rect class="chart-bar" x="${p.x-18}" y="${Math.min(p.y,g.zero)}" width="36" height="${round(Math.max(0.8,Math.abs(p.y-g.zero)))}"/><text class="chart-value" x="${p.x}" y="${round(Math.min(p.y,g.zero)-9)}" text-anchor="middle">${fmt(p.value,true)}</text>`).join('')}`:
    `<polyline class="chart-line" points="${g.points.map(p=>`${p.x},${p.y}`).join(' ')}"/>${g.points.map(p=>`<circle class="chart-point" cx="${p.x}" cy="${p.y}" r="4"/><text class="chart-value" x="${p.x}" y="${p.y-12}" text-anchor="middle">${fmt(p.value)}</text>`).join('')}`;
  return `<figure class="cpi-chart" data-chart="${rate?'inflation':'cpi'}"><h3>${title}</h3><svg viewBox="0 0 380 250" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}</desc><g aria-hidden="true">${axes}${ticks}${marks}${labels}</g></svg></figure>`;
}
export function timelineCharts(model,includeFinal,revealRates){
  const count=includeFinal?4:3;
  return `<div class="timeline-charts">${chart(model.values.slice(0,count),false)}${revealRates?chart(model.rates.slice(1,count),true):''}</div>`;
}
