export const GAME_ID = 'takeout-taco-lunch-rush';
export const MAX_WINDOWS = 10;
export const TOTAL_PRODUCT = Object.freeze([0, 8, 18, 31, 42, 50, 53]);
export const productionRows = () => TOTAL_PRODUCT.slice(1).map((output, index) => ({ workers: index + 1, output, added: output - TOTAL_PRODUCT[index] }));
export const STRESS_THRESHOLD = 8;
export const newRun = () => ({ phase: 'intro', workers: 0, previousWorkers: null, round: 0, output: null, addedOutput: null, tested: [], backlog: 0, answers: [], questionIndex: 0, finalCrew: null, analysisAnswers: { total_graph: null, marginal_graph: null, what_if: null } });
export const canReview = state => state.phase === 'active' && (state.tested.length >= 4 || state.round === MAX_WINDOWS);
// A small illustrative waiting-order state, not a demand or production model.
// First window starts manageable; sustained solo service builds pressure gradually.
export const nextBacklog = (backlog, workers) => workers === 1 ? backlog + 2 : Math.max(4, backlog - 4);
export function operationalText(state) {
  if (state.workers === 1) return state.backlog > STRESS_THRESHOLD ? 'Orders are piling up. One worker cannot keep pace.' : 'The line is moving, but one worker is handling everything.';
  return {
    2: 'Tasks are being divided. The crew is moving faster.',
    3: 'Specialization is paying off. The kitchen is running smoothly.',
    4: 'Output is still rising, but the workspace is starting to tighten.',
    5: 'Orders are moving, but workers are beginning to crowd one another.',
    6: 'The line is under control. The kitchen isn’t. Six workers are fighting for the same space and equipment.',
  }[state.workers];
}
export function canAct(state, action) {
  if (action === 'start_rush') return state.phase === 'intro';
  if (action === 'review_record') return canReview(state);
  if (state.phase !== 'active' || state.round >= MAX_WINDOWS) return false;
  return action === 'hold_crew' || (action === 'call_worker' && state.workers < 6) || (action === 'send_worker_home' && state.workers > 1);
}
export function advance(state, action) {
  if (!canAct(state, action)) return state;
  if (action === 'review_record') return { ...state, phase: 'debrief', finalCrew: state.workers };
  const workers = action === 'start_rush' ? 1 : state.workers + (action === 'call_worker' ? 1 : action === 'send_worker_home' ? -1 : 0);
  return { ...state, phase: 'active', workers, previousWorkers: state.workers || null,
    round: state.round + 1, output: TOTAL_PRODUCT[workers], backlog: action === 'start_rush' ? 4 : nextBacklog(state.backlog, workers),
    addedOutput: state.output === null ? null : TOTAL_PRODUCT[workers] - state.output,
    tested: [...new Set([...state.tested, workers])].sort((a, b) => a - b) };
}
export function resultText(state) {
  if (state.round === 1) return 'One worker completes 8 tacos in the first service window.';
  if (state.workers === state.previousWorkers) return `Another service window passes. Same crew. Same truck. Output remains ${state.output} tacos.`;
  return `${state.workers} workers complete ${state.output} tacos this window: ${Math.abs(state.addedOutput)} ${state.addedOutput > 0 ? 'more' : 'fewer'} than with ${state.previousWorkers} ${state.previousWorkers === 1 ? 'worker' : 'workers'}. Orders are still waiting.`;
}
