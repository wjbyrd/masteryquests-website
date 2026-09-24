import {model, direction} from './engine.js';

const percent=value=>`${value.toFixed(1)}%`;
// Derive the completed files from this saved run's selected cases, using the same
// calculation engine as the questions and report. No new selection or sample data.
export function summaryData(run) {
  const m=model(run);
  return [
    {file:'1–4',name:'Baseline',...m.base},
    {file:'5',name:'Direct change',...m.direct},
    {file:'6',name:'New participants',...m.expansion},
    {file:'7',name:'Discouraged workers',...m.discouraged},
    {file:'8',name:'Mixed flows',...m.mixed},
    {file:'9',name:'Headline audit',...m.headline},
  ];
}
export function summaryText(run) {
  const [base,direct,expansion,discouraged]=summaryData(run);
  const verb=(a,b)=>direction(a,b)==='unchanged'?'stays unchanged':direction(a,b);
  return `Compare each case with the baseline in the graph. In Direct change, employment ${verb(base.employed,direct.employed)} and UR ${verb(base.ur,direct.ur)} to ${percent(direct.ur)}, while LFPR stays ${percent(direct.lfpr)}. With New participants, LFPR rises to ${percent(expansion.lfpr)} and UR ${verb(base.ur,expansion.ur)} at ${percent(expansion.ur)}. In Discouraged workers, UR falls to ${percent(discouraged.ur)} and LFPR falls to ${percent(discouraged.lfpr)} without an employment gain. The reason for a lower UR matters.`;
}
export function seriesGeometry(rows,key,top,bottom) {
  const values=rows.map(r=>r[key]);
  const min=key==='ur'?0:Math.max(0,Math.floor(Math.min(...values)/5)*5-5);
  const max=Math.min(100,Math.ceil(Math.max(...values)/5)*5+5);
  const y=value=>bottom-(value-min)/(max-min)*(bottom-top);
  return {min,max,points:values.map((value,i)=>({x:56+i*60,y:y(value),value})),ticks:[min,(min+max)/2,max].map(value=>({value,y:y(value)}))};
}
export function summaryChart(run) {
  const rows=summaryData(run);
  const description=rows.map(r=>`Files ${r.file}, ${r.name}: UR ${percent(r.ur)}, LFPR ${percent(r.lfpr)}.`).join(' ');
  const plot=(key,top,bottom,label)=>{
    const g=seriesGeometry(rows,key,top,bottom);
    return `<g class="summary-series ${key}" aria-hidden="true"><text class="series-name" x="56" y="${top-20}">${label} (%)</text>${g.ticks.map(t=>`<path class="summary-grid" d="M56 ${t.y}H356"/><text x="44" y="${t.y+6}" text-anchor="end">${Number(t.value.toFixed(1))}</text>`).join('')}<path class="summary-axis" d="M56 ${top}V${bottom}H356"/><polyline class="summary-line" points="${g.points.map(p=>`${p.x},${p.y}`).join(' ')}"/>${g.points.map(p=>key==='ur'?`<circle class="summary-point" cx="${p.x}" cy="${p.y}" r="4"/>`:`<rect class="summary-point" x="${p.x-4}" y="${p.y-4}" width="8" height="8"/>`).join('')}</g>`;
  };
  return `<section class="run-summary" aria-labelledby="run-summary-title"><h3 id="run-summary-title">Labor market through the files</h3><p class="summary-note">File order, not a time series. Each case compares independently with the same baseline. Panels use different percentage scales.</p><figure class="summary-figure"><svg viewBox="0 0 400 310" role="img" aria-labelledby="summary-chart-title summary-chart-desc"><title id="summary-chart-title">Unemployment rate and labor-force participation across this run’s files</title><desc id="summary-chart-desc">UR is the upper solid line with circles; LFPR is the lower dashed line with squares. Each panel has its own labeled percentage scale. ${description}</desc>${plot('ur',50,120,'UR · solid / circles')}${plot('lfpr',185,255,'LFPR · dashed / squares')}<g class="summary-x" aria-hidden="true">${rows.map((r,i)=>`<text x="${56+i*60}" y="280" text-anchor="middle">${r.file}</text>`).join('')}<text x="206" y="304" text-anchor="middle">File / case</text></g></svg><figcaption class="sr-only">Both rates are provided in the table below. File 1–4 is the baseline used for the first calculations.</figcaption></figure><table class="summary-table"><caption class="sr-only">Run summary rates, rounded to one decimal place.</caption><thead><tr><th scope="col">File / case</th><th scope="col">UR</th><th scope="col">LFPR</th></tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r.file} · ${r.name}</th><td>${percent(r.ur)}</td><td>${percent(r.lfpr)}</td></tr>`).join('')}</tbody></table><p class="graph-takeaway">${summaryText(run)}</p></section>`;
}
