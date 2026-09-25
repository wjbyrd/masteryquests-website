// UI adapter: ending loan totals become the same cleared-loan transactions as before.
import {maxLoan, roundMoney} from './model.js';
export function loanTarget(bank, reserveRatio, target) {
  if (!Number.isFinite(target) || target < 0 || roundMoney(target)!==target) throw new Error('Invalid ending loan total.');
  const maximumNewLoan=maxLoan(bank,reserveRatio);
  return {existingLoans:bank.loans,maximumNewLoan,maximumTotalLoans:roundMoney(bank.loans+maximumNewLoan),newLoan:roundMoney(target-bank.loans),withinRange:target>=bank.loans && target<=roundMoney(bank.loans+maximumNewLoan)};
}
