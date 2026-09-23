import { CONFIG } from './config.js';
import { PHASES, cpi, inflation, model, isRepriced, indexKnown, rateKnown } from './engine.js';
import { timelineCharts } from './charts.js';
export const money = cents => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents % 100 ? CONFIG.decimals.currency : 0, maximumFractionDigits: CONFIG.decimals.currency });
export const indexText = n => n.toFixed(CONFIG.decimals.index);
export const rateText = n => `${n.toFixed(CONFIG.decimals.rate)}%`;
export const signedMoney = cents => `${cents > 0 ? '+' : cents < 0 ? '−' : ''}${money(Math.abs(cents))}`;
const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (action, label) => `<button class="primary" type="button" data-action="${action}">${label}</button>`;
const formula = (label, text, spoken) => `<div class="cpi-formula"><strong>${label}</strong><span aria-hidden="true">${text}</span><span class="sr-only">${spoken}</span></div>`;
const cpiFormula = () => formula('CPI', '(Current basket cost ÷ base basket cost) × 100', 'CPI equals current basket cost divided by base basket cost, multiplied by one hundred.');
const rateFormula = () => formula('Inflation rate', '((New CPI − previous CPI) ÷ previous CPI) × 100', 'Inflation rate equals new CPI minus previous CPI, divided by previous CPI, multiplied by one hundred.');
function hints(run){
  if(run.solved)return '';
  const hint=run.hints[run.phase]||{concept:false,formula:false};
  const concept=run.phase==='cpi'?'Compare the current cost of the fixed basket with the base-year cost. The base year is indexed to 100.':'Inflation measures the percentage change in CPI from the previous period.';
  return `<div class="cpi-hints"><button type="button" data-hint="concept" aria-expanded="${hint.concept}" aria-controls="concept-hint">${hint.concept?'HIDE HINTS':'NEED A HINT?'}</button><div id="concept-hint" ${hint.concept?'':'hidden'}>${hint.concept?`<p>${concept}</p><button type="button" data-hint="formula" aria-expanded="${hint.formula}" aria-controls="formula-hint">${hint.formula?'HIDE FORMULA':'SHOW FORMULA'}</button><div id="formula-hint" ${hint.formula?'':'hidden'}>${hint.formula?(run.phase==='cpi'?cpiFormula():rateFormula()):''}</div>`:''}</div></div>`;
}
export function receipt(run) {
  const m = model(run), updated = !['intro','base'].includes(run.phase), priced = isRepriced(run);
  const baseDone = run.phase === 'base' && run.solved || updated;
  const rows = updated ? m.current.rows : m.base.rows;
  return `<section class="cpi-receipt" aria-labelledby="receipt-title"><div class="receipt-heading"><div><h2 id="receipt-title">Fixed market basket</h2></div><span class="locked">Quantities fixed</span></div>
    <p class="receipt-period">${updated ? 'Year 2 · '+m.shock.name : 'Year 1 · Base year'}</p>
    <table><caption class="sr-only">Fixed quantities, unit prices and item expenditures for ${updated ? 'Year 2' : 'the base year'}.</caption><thead><tr><th scope="col">Item / quantity</th><th scope="col">Unit price</th><th scope="col">Expenditure</th></tr></thead><tbody>${rows.map(r => `<tr ${priced && r.contribution ? 'class="price-changed"' : ''}><th scope="row">${r.name}<small>${r.quantity} × <span class="fixed-word">fixed</span></small></th><td>${updated && r.price !== m.base.rows.find(i=>i.id===r.id).price ? `<span class="old-price">${money(m.base.rows.find(i=>i.id===r.id).price)} →</span>` : ''}${money(r.price)}</td><td>${priced || !updated && (r.id !== 'groceries' || baseDone) ? `<strong>${money(r.cost)}</strong>` : '<span class="pending">Calculate</span>'}${priced ? `<small>${signedMoney(r.contribution)} vs base</small>` : ''}</td></tr>`).join('')}</tbody></table>
    <div class="receipt-total"><span>Basket cost</span><strong id="basket-total">${priced ? money(m.current.cost) : !updated && baseDone ? money(m.base.cost) : 'To calculate'}</strong></div>
    ${baseDone ? `<p class="base-reference">Base basket reference <strong>${money(m.base.cost)}</strong></p>` : '<p class="base-reference">Quantity × unit price = item expenditure</p>'}
    <dl class="index-monitor"><div><dt>CPI <small>${indexKnown(run) ? 'Year 2 index' : baseDone ? 'Base-year index' : 'Build the base first'}</small></dt><dd id="cpi-value">${indexKnown(run) ? indexText(m.index) : baseDone ? indexText(100) : '—'}</dd></div><div><dt>Inflation <small>${rateKnown(run) ? 'Year 1 → Year 2' : 'Period-to-period change'}</small></dt><dd id="inflation-value">${rateKnown(run) ? rateText(m.rate) : updated ? 'To calculate' : 'Base year'}</dd></div></dl>
    <p class="receipt-foot">Basket cost is a dollar amount. CPI measures the price level as an index.</p></section>`;
}
const input = (name, label, hint, disabled) => `<div class="entry-field"><label for="answer-${name}">${label}</label><input id="answer-${name}" name="${name}" type="text" inputmode="${hint === 'rate' ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false" required ${disabled ? 'disabled' : ''} aria-describedby="number-help feedback"><span class="entry-unit">${hint === 'currency' ? 'Dollars' : hint === 'rate' ? 'Percent' : 'Index points'}</span></div>`;
function numeric(run, fields, kind) {
  return `<form id="answer-form">${fields.map(([name,label])=>input(name,label,kind,run.solved)).join('')}<p id="number-help" class="cpi-help">${kind === 'currency' ? 'Commas and a leading $ are optional. Include cents when needed.' : kind === 'index' ? 'Use one decimal place. A correctly rounded whole-number CPI is also accepted; the monitor will show the calculated index.' : 'Use one decimal place. A trailing % is optional; use a minus sign for a decline.'}</p><button type="submit" class="primary" ${run.solved ? 'disabled' : ''}>CHECK CALCULATION</button></form>`;
}
function choices(run, options) {
  return `<div class="cpi-options" role="group" aria-label="Your interpretation">${options.map(([id,label])=>`<button type="button" data-answer="${id}" aria-pressed="${run.selected === id}" ${run.solved ? 'disabled' : ''}>${esc(label)}${run.selected === id ? '<span class="choice-mark">Selected</span>' : ''}</button>`).join('')}</div>`;
}
function comparisons(m, revealed) {
  return `<div class="comparison-grid">${m.cases.map((c,i)=>`<section><h3>Case ${i ? 'B' : 'A'}</h3><p><strong>${c.item.name} +${c.percent}%</strong></p>${revealed ? `<p>${money(c.item.cost)} base expenditure × ${c.percent}% = <strong>${money(c.contribution)} added</strong></p><p>Basket ${money(c.cost)}<br>CPI ${indexText(c.index)}</p>` : '<p class="cpi-help">All other prices stay at base-year levels.</p>'}</section>`).join('')}</div>`;
}
export function auditWork(run) {
  const m = model(run), current = money(m.current.cost), base = money(m.base.cost), correct = indexText(m.index);
  switch (m.audit.id) {
    case 'quantities': {
      // The sole deliberate quantity error is isolated to this analyst's draft, never the live basket.
      const badQuantity = m.base.rows.find(r=>r.id==='groceries').quantity - 2;
      const badCost = m.current.cost - 2 * m.current.rows.find(r=>r.id==='groceries').price;
      return { draft: `The analyst buys ${badQuantity} grocery units instead of the fixed ${m.base.rows.find(r=>r.id==='groceries').quantity}; every other quantity and all Year 2 prices match your basket. Draft cost: ${money(badCost)}. Draft CPI: ${money(badCost)} ÷ ${base} × 100 = ${indexText(cpi(badCost,m.base.cost))}.`, repair: `Restore the original grocery quantity. Correct basket: ${current}; CPI: ${correct}.` };
    }
    case 'average': {
      const changes=m.current.rows.map((r,i)=>(r.price / m.base.rows[i].price - 1)*100), average=changes.reduce((a,b)=>a+b,0)/changes.length;
      return { draft: `The analyst averages these item price changes: ${changes.map((v,i)=>`${m.base.rows[i].name} ${rateText(v)}`).join('; ')}. Each item gets one equal share. Reported inflation: ${rateText(average)}.`, repair: `Using full-precision price changes, repricing gives ${current}, CPI ${correct}, and inflation ${rateText(m.rate)}. The simple average ignores spending shares.` };
    }
    case 'reverse': return { draft: `The analyst uses your fixed quantities and correct costs, but writes CPI = ${base} ÷ ${current} × 100 = ${indexText(m.base.cost/m.current.cost*100)}.`, repair: `Reverse the ratio: ${current} ÷ ${base} × 100 = ${correct}.` };
    case 'level': return { draft: `A separate index report lists CPI ${CONFIG.auditExample[2]}. The analyst announces: “Inflation is ${CONFIG.auditExample[2]}%.” No previous-year CPI is provided.`, repair: `CPI ${CONFIG.auditExample[2]} means the fixed basket costs ${CONFIG.auditExample[2]-100}% more than in the base year. Annual inflation cannot be recovered without the previous-year index.` };
    case 'period': { const [a,b,c]=CONFIG.auditExample; return { draft: `A separate report has Year 1 CPI ${a}, Year 2 CPI ${b}, and Year 3 CPI ${c}. The analyst reports Year 3 annual inflation as (${c} − ${a}) ÷ ${a} × 100 = ${rateText(inflation(a,c))}.`, repair: `Use Year 2: (${c} − ${b}) ÷ ${b} × 100 = ${rateText(inflation(b,c))}.` }; }
  }
}
function timeline(m, revealRates, includeFinal) {
  return `<table class="timeline-table"><caption>Separate CPI example · same base year = 100</caption><thead><tr><th scope="col">Year</th><th scope="col">CPI level</th>${revealRates?'<th scope="col">Annual inflation</th>':''}</tr></thead><tbody>${m.values.slice(0,includeFinal?4:3).map((v,i)=>`<tr><th scope="row">${i+1}${i===0?' · base':''}</th><td>${indexText(v)}</td>${revealRates?`<td>${i ? rateText(m.rates[i]) : 'Base year'}</td>`:''}</tr>`).join('')}</tbody></table>`;
}
function explanation(run) {
  const m=model(run);
  switch(run.phase){
    case 'base':return `<p>The base basket costs ${money(m.base.cost)}. The base year is indexed to <strong>100</strong>.</p>`;
    case 'reprice':return `<p>Basket cost increased from ${money(m.base.cost)} to ${money(m.current.cost)}. Quantities stayed fixed; the basket panel now shows each item's dollar contribution.</p>`;
    case 'cpi':return `<p>CPI is now ${indexText(m.index)}. The basket costs ${rateText(m.rate)} more than in the base year. CPI is an index, not dollars or an inflation rate.</p>`;
    case 'inflation':return `<p>Year 1 → Year 2 inflation is ${rateText(m.rate)}. Subtracting 100 works here only because the previous CPI is 100. Later comparisons require the previous year's index.</p>`;
    case 'meaning':return '<p>CPI 108 means the fixed basket costs 8% more than in the base year. Annual inflation is the percentage change from the previous year’s CPI.</p>';
    case 'weight':return `<p>The ${m.cases[m.winner==='a'?0:1].item.name.toLowerCase()} change adds more dollars to the same basket, so it moves CPI more. Items with a larger share of base spending have more influence on the overall index.</p>`;
    case 'audit':return `<p>${m.audit.feedback}</p><p><strong>Corrected calculation:</strong> ${auditWork(run).repair}</p>`;
    case 'timeline_rate':return `<p>Year 3 inflation is <strong>${rateText(m.rates[2])}</strong>. This compares Year 3 CPI ${m.values[2]} with the previous year's CPI ${m.values[1]}, not automatically with 100.</p>`;
    case 'timeline_compare':{
      const labels={slowing:'Prices are still rising, but inflation has slowed. This is disinflation.',accelerating:'Prices are rising faster. Inflation has accelerated.',stable:'CPI is unchanged. Annual inflation is zero: the price level is stable.',deflation:'CPI fell. Annual inflation is negative: this is deflation.'};
      const [a,b,c]=CONFIG.disinflationExample;
      return `<p>Year 2: ${rateText(m.rates[1])}. Year 3: ${rateText(m.rates[2])}. ${labels[m.kind]}</p>${m.kind!=='slowing'?`<p>For comparison, CPI ${a} → ${b} → ${c} gives inflation ${rateText(inflation(a,b))} → ${rateText(inflation(b,c))}. Prices still rise, but more slowly: <strong>disinflation</strong>.</p>`:''}`;
    }
    case 'deflation':return `<p>CPI falls from ${m.values[2]} to ${m.values[3]}: <strong>${rateText(m.rates[3])} inflation, or deflation</strong>. But CPI ${m.values[3]} is still above 100, so the basket remains ${rateText(inflation(100,m.values[3]))} more expensive than in the base year.</p>`;
  }
}
export function work(run) {
  const m=model(run);
  if(run.phase==='intro')return `<p class="eyebrow">Household price monitor</p><h2 id="stage-title" tabindex="-1">SAME BASKET. NEW PRICES.</h2><p>Calculate the base-year basket cost, then track how changing prices affect the CPI and inflation rate.</p><p>No timer. Every answer can be corrected.</p>${button('start','BUILD THE BASE BASKET')}`;
  if(run.phase==='complete')return `<p class="eyebrow">Price check complete</p><h2 id="stage-title" tabindex="-1">The numbers tell different stories.</h2><p class="cpi-help">Your repriced household basket · Year 2</p><dl class="cpi-results"><div><dt>Base basket</dt><dd>${money(m.base.cost)}</dd></div><div><dt>Final basket</dt><dd>${money(m.current.cost)}</dd></div><div><dt>Final CPI</dt><dd>${indexText(m.index)}</dd></div><div><dt>Basket inflation · Year 1 → 2</dt><dd>${rateText(m.rate)}</dd></div></dl><h3>Biggest price pressure</h3><p><strong>${m.pressures[0].name}: ${signedMoney(m.pressures[0].contribution)}</strong> added to basket cost. This is the dollar effect of its price change, not simply the largest percentage rise.</p><p>CPI indexes the price level relative to the base year. Inflation measures its percentage change from the previous period. Disinflation means prices still rise, but more slowly. Deflation means the price level falls.</p><dl class="cpi-results"><div><dt>First-attempt accuracy</dt><dd>${Math.round(run.firstCorrect/PHASES.length*100)}% <small>(${run.firstCorrect}/${PHASES.length})</small></dd></div><div><dt>Audit</dt><dd>Repaired · ${run.attempts.audit} attempt(s)</dd></div><div><dt>Multi-year interpretation</dt><dd>Complete · Year 3 ${rateText(m.rates[2])}; Year 4 ${rateText(m.rates[3])}</dd></div></dl><div class="actions">${button('replay','PLAY AGAIN')}<a class="button" href="/games/">RETURN TO GAMES</a></div>`;
  const content={
    base:['Build the base-year basket','Calculate the groceries expenditure, then add all five item expenditures. The basket panel gives the other four to keep the arithmetic brief.'],
    reprice:['Reprice the same basket',`Year 2: ${m.shock.name}. The unit prices have changed. Use the original basket quantities to calculate the new basket cost.`],
    cpi:['Turn the basket cost into an index',`The same basket cost ${money(m.base.cost)} in Year 1 and ${money(m.current.cost)} in Year 2. What is the new CPI?`],
    inflation:['How fast did the price level change?',`Previous CPI: ${indexText(100)}. Current CPI: ${indexText(m.index)}. Calculate Year 1 → Year 2 inflation.`],
    meaning:['An index is not a rate','A separate report says CPI = 108. Which statement can you conclude from that alone?'],
    weight:['Which price matters more?','Two isolated changes to the same base basket. Predict which moves CPI more, then compare the dollars added.'],
    audit:['The index is wrong. Find the mistake.','A hypothetical analyst has made exactly one major error. Identify it to repair the report.'],
    timeline_rate:['A high CPI. But how much inflation?','This separate economy has its own CPI path; it does not replace your household basket. Calculate Year 3 annual inflation.'],
    timeline_compare:['What happened to inflation?','Compare Year 3 with Year 2. Choose the description that matches both the price level and the annual rates.'],
    deflation:['Prices fell. Back to the base year?','Year 4 has arrived in the example. Which statement describes the change from Year 3 to Year 4?'],
  }[run.phase];
  let body='';

  if(run.phase==='weight')body+=comparisons(m,run.weightRevealed);
  if(run.phase==='audit')body+=`<blockquote class="analyst"><p class="eyebrow">Analyst’s draft · not verified</p><p>${auditWork(run).draft}</p></blockquote>`;
  if(['timeline_rate','timeline_compare','deflation'].includes(run.phase)){const rates=run.phase!=='timeline_rate'&&!!run.attempts[run.phase];body+=timelineCharts(m,run.phase==='deflation',rates)+timeline(m,rates,run.phase==='deflation');}
  body+=`<div id="feedback" class="cpi-feedback ${run.feedback?'has-feedback':''}" tabindex="-1">${run.feedback ? `<strong>${run.solved?'Verified':'Try again'}</strong>${run.solved?explanation(run):`<p>${esc(run.feedback)}</p>`}` : ''}</div>`;
  if(run.phase==='base')body+=numeric(run,[['component','Groceries expenditure'],['total','Total base basket cost']],'currency');
  if(run.phase==='reprice')body+=numeric(run,[['total','New basket cost']],'currency');
  if(run.phase==='cpi')body+=numeric(run,[['value','Year 2 CPI']],'index');
  if(['inflation','timeline_rate'].includes(run.phase))body+=numeric(run,[['value',run.phase==='inflation'?'Year 2 inflation':'Year 3 inflation']],'rate');
  if(run.phase==='meaning')body+=choices(run,[['level','Prices are 108% higher than in the base year.'],['rate','Inflation is always 108%.'],['basket','The fixed basket costs 8% more than in the base year.'],['annual','Prices must have risen 8% this year.']]);
  if(run.phase==='weight')body+=choices(run,[['a',`Case A: ${m.cases[0].item.name}`],['b',`Case B: ${m.cases[1].item.name}`]]);
  if(run.phase==='audit')body+=choices(run,CONFIG.audits.map(a=>[a.id,a.label]));
  if(run.phase==='timeline_compare')body+=choices(run,[['slowing','Prices still rise, but inflation is lower: disinflation.'],['accelerating','Prices rise faster: inflation is higher.'],['stable','The price level is stable: inflation is zero.'],['deflation','The price level falls: inflation is negative.']]);
  if(run.phase==='deflation')body+=choices(run,[['above','Deflation: prices fell, but the basket still costs more than in the base year.'],['below','Deflation: prices are now below the base-year level.'],['slower','Disinflation: prices are still rising, just more slowly.']]);
  if(['cpi','inflation','timeline_rate'].includes(run.phase))body+=hints(run);
  if(run.solved)body+=button('next',run.phase==='deflation'?'SEE YOUR PRICE CHECK':run.phase==='base'?'OPEN YEAR 2 PRICES':'CONTINUE');
  return `<p class="eyebrow">Price check ${PHASES.indexOf(run.phase)+1} / ${PHASES.length}</p><h2 id="stage-title" tabindex="-1">${content[0]}</h2><p>${content[1]}</p>${body}`;
}
