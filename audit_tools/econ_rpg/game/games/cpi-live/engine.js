import { CONFIG } from './config.js';
export const PHASES = Object.freeze(['base', 'reprice', 'cpi', 'inflation', 'meaning', 'weight', 'audit', 'timeline_rate', 'timeline_compare', 'deflation']);
export const basePrices = Object.freeze(CONFIG.basket.map(item => item.price));
export function basket(prices = basePrices) {
  if (!Array.isArray(prices) || prices.length !== CONFIG.basket.length || prices.some(p => !Number.isSafeInteger(p) || p <= 0)) throw Error('Invalid basket prices');
  const rows = CONFIG.basket.map((item, i) => ({ ...item, price: prices[i], cost: item.quantity * prices[i], contribution: item.quantity * (prices[i] - item.price) }));
  return { rows, cost: rows.reduce((sum, item) => sum + item.cost, 0) };
}
export const BASE = basket();
export const cpi = cost => cost / BASE.cost * 100;
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
export function selections(seed) {
  let x = seed >>> 0;
  const pick = pool => { x = (Math.imul(1664525, x) + 1013904223) >>> 0; return pool[Math.floor(x / 2 ** 32 * pool.length)].id; };
  return { shockID: pick(CONFIG.shocks), comparisonID: pick(CONFIG.comparisons), auditID: pick(CONFIG.audits), timelineID: pick(CONFIG.timelines) };
}
export function newRun(seed, runID = globalThis.crypto.randomUUID(), now = Date.now()) {
  return { runID, startedAt: now, seed: seed >>> 0, ...selections(seed), phase: 'intro', solved: false, attempts: {}, firstCorrect: 0, feedback: '', selected: null, weightRevealed: false };
}
export const start = run => run.phase === 'intro' ? { ...run, phase: PHASES[0] } : run;
export function model(run) {
  const shock = CONFIG.shocks.find(s => s.id === run.shockID), comparison = CONFIG.comparisons.find(s => s.id === run.comparisonID);
  const current = basket(shock.prices), index = cpi(current.cost);
  const cases = comparison.cases.map(c => { const item = BASE.rows.find(i => i.id === c.item), contribution = Math.round(item.cost * c.percent / 100); return { ...c, item, contribution, cost: BASE.cost + contribution, index: cpi(BASE.cost + contribution) }; });
  const values = CONFIG.timelines.find(t => t.id === run.timelineID).values;
  const rates = values.map((value, i) => i ? inflation(values[i - 1], value) : null);
  return { shock, current, index, rate: inflation(100, index), cases, winner: cases[0].contribution > cases[1].contribution ? 'a' : 'b',
    audit: CONFIG.audits.find(a => a.id === run.auditID), values, rates, kind: classification(rates[1], rates[2]),
    pressures: current.rows.filter(r => r.contribution > 0).sort((a, b) => b.contribution - a.contribution) };
}
export function expected(run) {
  const m = model(run);
  return { base: { component: BASE.rows.find(r => r.id === 'groceries').cost / 100, total: BASE.cost / 100 },
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
    cpi: 'Divide the new basket cost by the base basket cost and multiply by 100. The dollar cost itself is not the index.',
    inflation: 'Use the percentage change in CPI, not the CPI level. Here the previous CPI is 100.',
    meaning: { level: 'An index of 108 includes the base 100. It does not mean a 108% increase.', rate: '108 is an index level. Inflation needs a comparison with an earlier period.', annual: 'The base year may be more than one year ago. CPI alone cannot tell you this year’s inflation.' }[answer],
    weight: 'Compare the dollars added to the whole fixed basket. The larger percentage change need not have the larger effect.',
    audit: m.audit.wrong,
    timeline_rate: 'For Year 3, subtract Year 2 CPI from Year 3 CPI, divide by Year 2 CPI, then multiply by 100. Use a minus sign if prices fell.',
    timeline_compare: 'Compare the two annual rates. Positive but smaller is disinflation; zero is stable prices; a negative rate is deflation.',
    deflation: { below: 'A falling CPI can still be above 100. Compare Year 4 both with Year 3 and with the base year.', slower: 'Slower inflation still means a rising CPI. Here the index itself falls, so the price level declines.' }[answer],
  };
  const malformed = numeric && Object.keys(target).some(k => parseNumber(answer?.[k], kind) === null);
  return { ...run, solved: correct, selected: numeric ? null : answer, attempts: { ...run.attempts, [run.phase]: count },
    firstCorrect: run.firstCorrect + (correct && count === 1 ? 1 : 0), weightRevealed: run.weightRevealed || run.phase === 'weight',
    feedback: correct ? 'Correct.' : malformed ? 'Enter a number in each field. Use standard comma grouping; currency may begin with $, and a rate may end with %.' : guidance[run.phase] };
}
export function next(run) {
  if (!run.solved) return run;
  const index = PHASES.indexOf(run.phase);
  if (index < 0) return run;
  return { ...run, phase: PHASES[index + 1] || 'complete', solved: false, selected: null, feedback: '' };
}
export const isRepriced = run => PHASES.indexOf(run.phase) > 1 || run.phase === 'complete' || run.phase === 'reprice' && run.solved;
export const indexKnown = run => PHASES.indexOf(run.phase) > 2 || run.phase === 'complete' || run.phase === 'cpi' && run.solved;
export const rateKnown = run => PHASES.indexOf(run.phase) > 3 || run.phase === 'complete' || run.phase === 'inflation' && run.solved;
