import { CONFIG, COMPONENTS, ACCOUNTS } from './config.js';
import { SCENARIOS, BY_ID, AUDITS } from './scenarios.js';
export const gdp = a => a.C + a.I + a.G + a.X - a.M;
export const nx = a => a.X - a.M;
export const deltaOf = posts => posts.reduce((sum, p) => sum + (p.account === 'M' ? -p.amount : p.amount), 0);
export function applyPostings(accounts, posts) {
  const next = { ...accounts };
  for (const { account, amount } of posts) {
    if (!COMPONENTS.includes(account) || !Number.isFinite(amount)) throw new Error('Invalid component posting');
    next[account] += amount;
  }
  return next;
}
export const expectedAccounts = posts => posts.length ? [...new Set(posts.map(p => p.account))].sort() : ['NC'];
export const matches = (selection, posts) => JSON.stringify([...selection].sort()) === JSON.stringify(expectedAccounts(posts));
export function random(seed) { let x = seed >>> 0; return () => { x = (Math.imul(1664525, x) + 1013904223) >>> 0; return x / 4294967296; }; }
export function shuffle(items, rng) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function newRun(seed) {
  const rng = random(seed), deck = Object.entries(CONFIG.phaseLengths).flatMap(([phase, length]) => shuffle(SCENARIOS.filter(s => s.phase === phase), rng).slice(0, length).map(s => s.id));
  const audit = AUDITS[Math.floor(rng() * AUDITS.length)];
  return { seed, stage: 'intro', accounts: { ...CONFIG.baseline }, deck, index: 0, selection: [], attempts: 0,
    ledger: [], feedback: '', lastPostings: [], lastDelta: null, firstCorrect: 0, postAttempts: 0,
    auditID: audit.id, auditRows: shuffle(audit.rows, rng).map(r => ({ ...r, posted: r.posted.map(p => ({ ...p })) })),
    auditFindAttempts: 0, auditRepairAttempts: 0, auditIdentified: false, auditCorrected: false,
    shockAttempts: 0, shockCorrected: false };
}
export const currentScenario = state => BY_ID[state.deck[state.index]];
export const currentAudit = state => AUDITS.find(a => a.id === state.auditID);
export function start(state) { return state.stage === 'intro' ? { ...state, stage: 'posting' } : state; }
export function toggleAccount(state, account) {
  if (!['posting', 'audit_repair'].includes(state.stage) || !Object.hasOwn(ACCOUNTS, account)) return state;
  const selection = state.selection.includes(account) ? state.selection.filter(a => a !== account)
    : account === 'NC' ? ['NC'] : [...state.selection.filter(a => a !== 'NC'), account];
  return { ...state, selection };
}
export function postTransaction(state) {
  if (state.stage !== 'posting' || !state.selection.length) return state;
  const scenario = currentScenario(state), correct = matches(state.selection, scenario.postings), attempts = state.attempts + 1;
  if (!correct) return { ...state, attempts, postAttempts: state.postAttempts + 1,
    feedback: `You selected ${state.selection.map(a => ACCOUNTS[a]).join(' + ')}. ${scenario.feedback} Adjust the accounts and post again.` };
  return { ...state, stage: 'posted', attempts, postAttempts: state.postAttempts + 1,
    accounts: applyPostings(state.accounts, scenario.postings), firstCorrect: state.firstCorrect + (attempts === 1 ? 1 : 0),
    ledger: [...state.ledger, { id: scenario.id, prompt: scenario.prompt, postings: scenario.postings, gdpDelta: deltaOf(scenario.postings), firstAttemptCorrect: attempts === 1, attempts }],
    lastPostings: scenario.postings, lastDelta: deltaOf(scenario.postings), feedback: scenario.feedback };
}
export function nextTransaction(state) {
  if (state.stage !== 'posted') return state;
  if (state.index + 1 === state.deck.length) return { ...state, stage: 'identity', selection: [], feedback: '' };
  return { ...state, stage: 'posting', index: state.index + 1, selection: [], attempts: 0, feedback: '' };
}
export function beginAudit(state) {
  if (state.stage !== 'identity') return state;
  const posts = state.auditRows.flatMap(r => r.posted);
  return { ...state, stage: 'audit_find', accounts: applyPostings(state.accounts, posts), lastPostings: posts, lastDelta: deltaOf(posts), feedback: '' };
}
export function identifyAudit(state, id) {
  if (state.stage !== 'audit_find' || !state.auditRows.some(r => r.id === id)) return state;
  const correct = id === currentAudit(state).badID;
  return { ...state, stage: correct ? 'audit_repair' : 'audit_find', auditFindAttempts: state.auditFindAttempts + 1,
    auditIdentified: correct, selection: [], feedback: correct ? 'Entry located. Replace its posting with the correct accounting treatment.' : 'That entry correctly records current domestic final production. Inspect the other postings.' };
}
export function repairAudit(state) {
  if (state.stage !== 'audit_repair' || !state.selection.length) return state;
  const audit = currentAudit(state), row = state.auditRows.find(r => r.id === audit.badID), attempts = state.auditRepairAttempts + 1;
  if (!matches(state.selection, row.correctPostings)) return { ...state, auditRepairAttempts: attempts, feedback: `${audit.explanation} Adjust the accounts and repair again.` };
  const changes = [...row.posted.map(p => ({ ...p, amount: -p.amount })), ...row.correctPostings];
  const rows = state.auditRows.map(r => r.id === row.id ? { ...r, posted: r.correctPostings } : r);
  return { ...state, stage: 'audit_done', auditRepairAttempts: attempts, auditCorrected: true,
    accounts: applyPostings(state.accounts, changes), auditRows: rows, lastPostings: changes, lastDelta: deltaOf(changes), feedback: audit.explanation,
    ledger: [...state.ledger, ...rows.map(r => ({ id: `audit-${r.id}`, prompt: r.prompt, postings: r.posted, gdpDelta: deltaOf(r.posted), source: 'Audited batch' }))] };
}
export function beginShock(state) { return state.stage === 'audit_done' ? { ...state, stage: 'shock', feedback: '', selection: [] } : state; }
export function parseAmount(raw) {
  const match = String(raw).trim().match(/^\$?\s*([+-]?\s*\d+(?:\.\d+)?)\s*(?:b|billion)?$/i);
  return match ? Number(match[1].replace(/\s/g, '')) : null;
}
export function answerShock(state, raw) {
  if (state.stage !== 'shock') return state;
  const value = parseAmount(raw), attempts = state.shockAttempts + 1, posts = COMPONENTS.map(account => ({ account, amount: CONFIG.shock[account] }));
  if (value !== deltaOf(posts)) return { ...state, shockAttempts: attempts, feedback: value === null ? 'Enter a signed amount in billions, such as +12 or $12B.'
    : attempts === 1 ? 'Remember: a rise in imports enters the identity with a minus sign. The investment change is already negative.'
    : 'Group the changes: consumption plus investment plus government purchases; then add exports and subtract the rise in imports.' };
  return { ...state, stage: 'complete', shockAttempts: attempts, shockCorrected: true, accounts: applyPostings(state.accounts, posts),
    lastPostings: posts, lastDelta: deltaOf(posts), feedback: 'The simultaneous changes have been reconciled.',
    ledger: [...state.ledger, { id: 'shock', prompt: 'The economy moves at once', postings: posts, gdpDelta: deltaOf(posts), source: 'Final changes' }] };
}
