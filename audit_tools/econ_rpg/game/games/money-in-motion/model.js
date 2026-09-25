// Dollar amounts are rounded at transaction boundaries; all balance changes live here.
export const roundMoney = n => Math.round((n + Number.EPSILON) * 100) / 100;
export const COMPARISON_RATIO = .2;
export const CAUTIOUS_HOLDING = .2;
const amount = n => { if (!Number.isFinite(n) || n < 0 || roundMoney(n) !== n) throw new Error('Enter a nonnegative amount with at most two decimal places.'); return n; };
const ratio = r => { if (!Number.isFinite(r) || r <= 0 || r > 1) throw new Error('Invalid reserve ratio.'); return r; };
export const requiredReserves = (deposits, r) => roundMoney(amount(deposits) * ratio(r));
export const excessReserves = (reserves, deposits, r) => roundMoney(reserves - requiredReserves(deposits, r));
export const maxLoan = (bank, r) => Math.max(0, excessReserves(bank.reserves, bank.deposits, r));
export const bank = name => ({name, deposits:0, reserves:0, loans:0});
export function assertBalanced(b) {
  ['deposits','reserves','loans'].forEach(k => amount(b[k]));
  if (roundMoney(b.reserves + b.loans) !== b.deposits) throw new Error('Balance sheet does not balance.');
  return b;
}
export function applyDeposit(b, n) {
  amount(n); assertBalanced(b);
  return assertBalanced({...b, deposits:roundMoney(b.deposits+n), reserves:roundMoney(b.reserves+n)});
}
export function applyWithdrawal(b, n) {
  amount(n); assertBalanced(b);
  if (n>b.reserves || n>b.deposits) throw new Error('Insufficient reserves for this withdrawal.');
  return assertBalanced({...b, deposits:roundMoney(b.deposits-n), reserves:roundMoney(b.reserves-n)});
}
export function makeLoanAndClear(b, n, r) {
  amount(n); assertBalanced(b);
  if (n>maxLoan(b,r)) throw new Error('Loan exceeds available excess reserves.');
  return assertBalanced({...b, reserves:roundMoney(b.reserves-n), loans:roundMoney(b.loans+n)});
}
export function transferLoan(banks, from, to, n, r) {
  if (from===to || !banks[from] || !banks[to]) throw new Error('Choose two different banks.');
  return banks.map((b,i)=>i===from?makeLoanAndClear(b,n,r):i===to?applyDeposit(b,n):{...b});
}
export function systemTotals(banks) {
  return banks.reduce((t,b)=>{assertBalanced(b); for(const k of ['deposits','reserves','loans'])t[k]=roundMoney(t[k]+b[k]);return t;},{deposits:0,reserves:0,loans:0});
}
export const theoreticalDepositMaximum = (initial,r) => roundMoney(amount(initial)/ratio(r));
export const maximumLoans = (initial,r) => roundMoney(theoreticalDepositMaximum(initial,r)-initial);
export const sequence = (initial,holding,count=8) => {
  amount(initial); ratio(holding);
  return Array.from({length:count},(_,i)=>roundMoney(initial*(1-holding)**i));
};
export const trainingEvents = [[{type:'deposit',amount:1000}],[{type:'deposit',amount:600}],[{type:'deposit',amount:700},{type:'withdrawal',amount:200}]];
export function postTrainingRound(b,round) {
  return trainingEvents[round].reduce((current,e)=>e.type==='deposit'?applyDeposit(current,e.amount):applyWithdrawal(current,e.amount),b);
}
export const BANK_NAMES = ['Common Ground Bank','First Commerce','Community Trust','River Bank'];
export function initialState() {
  return {gamePhase:1,round:0,reserveRatio:.1,currentBank:bank(BANK_NAMES[0]),posted:false,cleared:false,bankNetwork:[],networkStep:0,initialReserveInjection:1000,pattern:false,comparison:null,cautious:false,transferAnswered:false,studentHistory:[]};
}
