import { autoIngredients, operatingChange, marginalSchedule } from './engine.js';
import { COSTS } from './config.js';

export const ROUND_TITLES = ['Open for Business', 'First Customers', 'The Line Gets Longer', 'Finding Our Rhythm', 'The Rush Intensifies', 'Pushing Capacity', 'The Marginal Squeeze', 'Expand or Stay Put?'];
export const TARGETS = [0, 0, 8, 18, 31, 42, 50, 53];
export const newRun = () => ({ phase: 'intro', round: 1, step: 'decision', selected: null, target: 0, experiment: false,
  plan: { trucks: 1, grills: [true, false], workers: [0, 0], target: 0, kits: 0 },
  trials: [], completed: false, opening: null, lab: null });
const choice = (id, title, text, value) => ({ id, title, text, value });
export function choices(state) {
  if (state.phase !== 'choice') return [];
  const crew = state.plan.workers[0];
  if (state.round === 1) return [choice('open', 'Open for orders', 'Get ready for customers.', 'open'), choice('delay', 'Keep the shutters down', 'Wait before producing. The equipment is already committed.', 'delay')];
  if (state.round < 8) {
    const original = state.trials.filter(t => t.round === state.round - 1).at(-1)?.workers ?? crew;
    const levels = state.experiment ? [...new Set([original, state.round - 1, Math.min(6, state.round)])] : [...new Set([crew, state.round - 1])];
    return levels.map(n => choice(`crew-${n}`, n === crew ? `Keep ${n} worker${n === 1 ? '' : 's'}` : `${n > crew ? 'Hire up to' : 'Use'} ${n} worker${n === 1 ? '' : 's'}`, `${n * COSTS.wage} dollars in wages per lunch.`, n));
  }
  if (state.step === 'commitment') return [choice('target-40', '40 tacos', 'Keep a smaller lunch commitment.', 40), choice('target-62', '62 tacos', 'Accept the larger campus order.', 62), choice('target-80', '80 tacos', 'Promise a stretch order. Capacity may fall short.', 80)];
  if (state.step === 'equipment') return [choice('stay', 'Stay with one truck', `Keep your ${state.trials.filter(t => t.round === 7).at(-1).workers}-person crew in the existing kitchen.`, 'stay'), choice('expand', 'Add a truck and grill', 'Schedule six workers across two kitchens; choose their allocation next.', 'expand')];
  if (state.step === 'allocation') return [6, 5, 4, 3].map(a => choice(`allocation-${a}`, `${a} on A · ${6 - a} on B`, a === 6 ? 'Keep the crew together.' : a === 3 ? 'Split the crew evenly.' : 'Shift part of the crew to the new truck.', a));
  return [];
}
function commitService(state, plan, choiceID) {
  const result = autoIngredients(plan), previous = state.trials.at(-1);
  const staffingReference = state.round >= 4 && result.plan.trucks === 1
    ? marginalSchedule(result.plan).find(row => row.workers === state.round - 1 && row.MC !== null) : null;
  const trial = { ...result, id: state.trials.length + 1, round: state.round, source: 'story', experiment: state.experiment, choiceID,
    change: operatingChange(previous, result), staffingReference };
  return { ...state, phase: 'result', selected: null, plan: result.plan, trials: [...state.trials, trial] };
}
// Selection and configuration never record production. Only completed services do.
export function transition(state, action, value) {
  if (action === 'lab-start' && state.completed && state.phase === 'review') return { ...state, phase: 'lab', lab: state.lab || { plan: state.plan, trials: [] } };
  if (action === 'lab-exit' && state.phase === 'lab') return { ...state, phase: 'review' };
  if (action === 'lab-run' && state.phase === 'lab' && state.completed) {
    const result = autoIngredients(value), previous = state.lab.trials.at(-1);
    const trial = { ...result, id: state.lab.trials.length + 1, round: null, source: 'lab', change: operatingChange(previous, result) };
    return { ...state, lab: { plan: result.plan, trials: [...state.lab.trials, trial] } };
  }
  if (action === 'start' && state.phase === 'intro') return { ...state, phase: 'choice' };
  if (action === 'select' && choices(state).some(c => c.id === value)) return { ...state, selected: value };
  if (action === 'commit' && state.phase === 'choice') {
    const selected = choices(state).find(c => c.id === state.selected);
    if (!selected) return state;
    if (state.round === 1) return commitService({ ...state, opening: selected.value }, state.plan, selected.id);
    if (state.round < 8) return commitService(state, { ...state.plan, workers: [selected.value, 0], target: TARGETS[state.round] }, selected.id);
    if (state.step === 'commitment') return { ...state, target: selected.value, step: 'equipment', selected: null };
    if (state.step === 'equipment' && selected.value === 'expand') return { ...state, step: 'allocation', selected: null };
    const expanded = state.step === 'allocation';
    return commitService(state, { trucks: expanded ? 2 : 1, grills: [true, expanded],
      workers: expanded ? [selected.value, 6 - selected.value] : [state.trials.filter(t => t.round === 7).at(-1).workers, 0], target: state.target }, selected.id);
  }
  if (action === 'revise' && state.phase === 'result' && state.round > 1) return { ...state, phase: 'choice', experiment: true, step: state.round === 8 ? 'commitment' : 'decision', selected: null };
  if (action === 'back' && state.phase === 'choice' && state.round === 8 && state.step !== 'commitment') return { ...state, step: state.step === 'allocation' ? 'equipment' : 'commitment', selected: null };
  if (action === 'continue' && state.phase === 'result') {
    if (state.round === 8) return { ...state, phase: 'review', completed: true };
    const round = state.round + 1;
    return { ...state, phase: 'choice', round, experiment: false, step: round === 8 ? 'commitment' : 'decision', selected: null };
  }
  return state;
}
export const acceptedTrials = state => ROUND_TITLES.map((_, i) => state.trials.filter(t => t.round === i + 1).at(-1)).filter(Boolean);
export const labGraphState = state => ({ trials: state.lab?.trials || [], completed: true });
