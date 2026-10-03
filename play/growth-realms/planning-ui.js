// UI commands delegate every individual point to the existing session contract.
import { GAME_BALANCE as B } from './config.js';
import { allocationTotal } from './model.js';
import { allocatePoint } from './session.js';

export function adjustDevelopment(run, category, action) {
  if (!run || run.phase !== 'planning' || !Object.hasOwn(run.allocation, category)) return 0;
  const remaining = B.developmentPointsPerCycle - allocationTotal(run.allocation);
  const amount = action === 'clear' ? -run.allocation[category] : action > 0 ? Math.min(Number(action), remaining) : -Math.min(1, run.allocation[category]);
  if (!Number.isInteger(amount) || !['clear', 1, -1, 5].includes(action)) return 0;
  let applied = 0;
  for (let n = 0; n < Math.abs(amount); n++) if (allocatePoint(run, category, Math.sign(amount))) applied += Math.sign(amount);
  return applied;
}
