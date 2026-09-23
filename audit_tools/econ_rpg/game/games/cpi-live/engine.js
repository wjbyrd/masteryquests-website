import { CONFIG } from './config.js';
export const PHASES = Object.freeze(['base', 'reprice', 'cpi', 'inflation', 'meaning', 'weight', 'audit', 'timeline_rate', 'timeline_compare', 'deflation']);
export function basket(items, prices = items.map(item=>item.price)) {
  if (!Array.isArray(prices) || prices.length !== items.length || prices.some(p => !Number.isSafeInteger(p) || p <= 0)) throw Error('Invalid basket prices');
  const rows = items.map((item, i) => ({ ...item, basePrice:item.price, price: prices[i], cost: item.quantity * prices[i], contribution: item.quantity * (prices[i] - item.price) }));
  return { rows, cost: rows.reduce((sum, item) => sum + item.cost, 0) };
}
export const cpi = (cost, baseCost) => cost / baseCost * 100;
export const inflation = (previous, current) => (current - previous) / previous * 100;
export function classification(previousRate, rate) {
  if (rate < 0) return 'deflation';
  if (rate === 0) return 'stable';
  return rate < previousRate ? 'slowing' : rate > previousRate ? 'accelerating' : 'steady';
}
export function parseNumber(raw, kind = 'currency') {
  let text = String(raw ?? '').trim().replace(/−/g, '-');
  if (kind === 'currency') text = text.replace(/^\$\s*/, '');
  if (kind === 'rate') text = text.replace(/\s*%$/, '');
  if (!/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(text)) return null;
  const value = Number(text.replaceAll(',', ''));
  return Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER ? value : null;
}
export function accepts(raw, expected, kind) {
  const value = parseNumber(raw, kind);
  if (value === null) return false;
  // CPI alone also accepts the correctly rounded whole-number index (103 for 103.32).
  if (kind === 'index' && Number.isInteger(value)) return value === Math.round(expected);
  return Math.abs(value - expected) <= CONFIG.tolerance[kind] + 1e-9;
}
export const POOLS = Object.freeze({basketID:CONFIG.baskets,shockID:CONFIG.shocks,comparisonID:CONFIG.comparisons,auditID:CONFIG.audits,timelineID:CONFIG.timelines});
export function selections(seed, previous = {}) {
  let x = seed >>> 0;
  return Object.fromEntries(Object.entries(POOLS).map(([key,pool])=>{
    const candidates=pool.filter(item=>item.id!==previous[key]);
    x=(Math.imul(1664525,x)+1013904223)>>>0;
    return [key,candidates[Math.floor(x/2**32*candidates.length)].id];
  }));
}
export function newRun(seed, runID = globalThis.crypto.randomUUID(), now = Date.now(), previous = {}) {
  const prior=Object.fromEntries(Object.keys(POOLS).filter(k=>POOLS[k].some(p=>p.id===previous[k])).map(k=>[k,previous[k]]));
  return { version:2,runID, startedAt: now, seed: seed >>> 0, previous:prior,...selections(seed,prior), phase: 'intro', solved: false, attempts: {}, firstCorrect: 0, feedback: '', selected: null, weightRevealed: false,hints:{},history:[],lastAnswer:null };
}
const record=(before,after,action,value=null)=>({...after,history:[...before.history,{action,value}]});
export const start = run => run.phase === 'intro' ? record(run,{ ...run, phase: PHASES[0] },'start') : run;
export function toggleHint(run, part='concept'){
  if(!['cpi','inflation','timeline_rate'].includes(run.phase)||run.solved||!['concept','formula'].includes(part))return run;
  const hint=run.hints[run.phase]||{concept:false,formula:false};
  if(part==='formula'&&!hint.concept)return run;
  return record(run,{...run,hints:{...run.hints,[run.phase]:{...hint,[part]:!hint[part]}}},'hint',part);
}
export function model(run) {
  const shock = CONFIG.shocks.find(s => s.id === run.shockID), comparison = CONFIG.comparisons.find(s => s.id === run.comparisonID);
  const items=CONFIG.baskets.find(b=>b.id===run.basketID).items, base=basket(items);
  const prices=items.map((item,i)=>Math.round(item.price*(100+shock.changes[i])/100));
  const current = basket(items,prices), index = cpi(current.cost,base.cost);
  const cases = comparison.cases.map(c => { const item = base.rows.find(i => i.id === c.item), contribution = Math.round(item.cost * c.percent / 100); return { ...c, item, contribution, cost: base.cost + contribution, index: cpi(base.cost + contribution,base.cost) }; });
  const values = CONFIG.timelines.find(t => t.id === run.timelineID).values;
  const rates = values.map((value, i) => i ? inflation(values[i - 1], value) : null);
  return { base,shock, current, index, rate: inflation(100, index), cases, winner: cases[0].contribution > cases[1].contribution ? 'a' : 'b',
    audit: CONFIG.audits.find(a => a.id === run.auditID), values, rates, kind: classification(rates[1], rates[2]),
    pressures: current.rows.filter(r => r.contribution > 0).sort((a, b) => b.contribution - a.contribution) };
}
export function expected(run) {
  const m = model(run);
  return { base: { component: m.base.rows.find(r => r.id === 'groceries').cost / 100, total: m.base.cost / 100 },
    reprice: { total: m.current.cost / 100 }, cpi: { value: m.index }, inflation: { value: m.rate },
    meaning: 'basket', weight: m.winner, audit: m.audit.id, timeline_rate: { value: m.rates[2] }, timeline_compare: m.kind, deflation: 'above' }[run.phase];
}
export function submit(run, answer) {
  if (!PHASES.includes(run.phase) || run.solved) return run;
  const target = expected(run), numeric = typeof target === 'object';
  if (!numeric && typeof answer !== 'string') return run;
  const allowed = { meaning: ['level','rate','basket','annual'], weight: ['a','b'], audit: CONFIG.audits.map(a => a.id), timeline_compare: ['slowing','accelerating','stable','deflation'], deflation: ['above','below','slower'] };
  if (!numeric && !allowed[run.phase].includes(answer)) return run;
  const kind = ['base','reprice'].includes(run.phase) ? 'currency' : run.phase === 'cpi' ? 'index' : 'rate';
  const correct = numeric ? Object.entries(target).every(([key, value]) => accepts(answer?.[key], value, kind)) : target === answer;
  const count = (run.attempts[run.phase] || 0) + 1;
  const m = model(run);
  const guidance = {
    base: 'Multiply the grocery quantity by its price, then add all five expenditures. Quantities and prices have different jobs.',
    reprice: 'Use every original quantity with its new price. Add expenditures, not unit prices; keep price decreases in the calculation.',
    cpi: 'Use the current cost of the same fixed basket and compare it with the base-year basket cost. The dollar cost itself is not the index.',
    inflation: 'Inflation compares this year’s CPI with the previous year’s CPI, not automatically with 100.',
    meaning: { level: 'An index of 108 includes the base 100. It does not mean a 108% increase.', rate: '108 is an index level. Inflation needs a comparison with an earlier period.', annual: 'The base year may be more than one year ago. CPI alone cannot tell you this year’s inflation.' }[answer],
    weight: 'Compare the dollars added to the whole fixed basket. The larger percentage change need not have the larger effect.',
    audit: m.audit.wrong,
    timeline_rate: 'Year 3 inflation compares Year 3 CPI with Year 2 CPI. Use the previous year as your reference, and a minus sign if prices fell.',
    timeline_compare: 'Compare the two annual rates. Positive but smaller is disinflation; zero is stable prices; a negative rate is deflation.',
    deflation: { below: 'A falling CPI can still be above 100. Compare Year 4 both with Year 3 and with the base year.', slower: 'Slower inflation still means a rising CPI. Here the index itself falls, so the price level declines.' }[answer],
  };
  const malformed = numeric && Object.keys(target).some(k => parseNumber(answer?.[k], kind) === null);
  const normalized=numeric?Object.fromEntries(Object.keys(target).map(key=>[key,parseNumber(answer?.[key],kind)])):answer;
  return record(run,{ ...run, solved: correct, selected: numeric ? null : answer,lastAnswer:normalized, attempts: { ...run.attempts, [run.phase]: count },
    firstCorrect: run.firstCorrect + (correct && count === 1 ? 1 : 0), weightRevealed: run.weightRevealed || run.phase === 'weight',
    feedback: correct ? 'Correct.' : malformed ? 'Enter a number in each field. Use standard comma grouping; currency may begin with $, and a rate may end with %.' : guidance[run.phase] },'answer',normalized);
}
export function next(run) {
  if (!run.solved) return run;
  const index = PHASES.indexOf(run.phase);
  if (index < 0) return run;
  return record(run,{ ...run, phase: PHASES[index + 1] || 'complete', solved: false, selected: null,lastAnswer:null, feedback: '' },'next');
}
export const isRepriced = run => PHASES.indexOf(run.phase) > 1 || run.phase === 'complete' || run.phase === 'reprice' && run.solved;
export const indexKnown = run => PHASES.indexOf(run.phase) > 2 || run.phase === 'complete' || run.phase === 'cpi' && run.solved;
export const rateKnown = run => PHASES.indexOf(run.phase) > 3 || run.phase === 'complete' || run.phase === 'inflation' && run.solved;
