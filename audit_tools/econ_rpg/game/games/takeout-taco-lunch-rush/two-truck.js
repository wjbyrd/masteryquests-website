import { TOTAL_PRODUCT } from './engine.js';
export const ALLOCATIONS = Object.freeze([5, 4, 3]);
export function allocationResult(truckA) {
  if (!Number.isInteger(truckA) || truckA < 0 || truckA > 6) return null;
  const truckB = 6 - truckA;
  return { allocationTruckA: truckA, allocationTruckB: truckB, truckAOutput: TOTAL_PRODUCT[truckA],
    truckBOutput: TOTAL_PRODUCT[truckB], combinedOutput: TOTAL_PRODUCT[truckA] + TOTAL_PRODUCT[truckB] };
}
export function chooseAllocation(state, truckA) {
  if (state.phase !== 'two_truck' || !ALLOCATIONS.includes(truckA)) return state;
  return { ...state, phase: 'allocation_result', twoTruck: { ...state.twoTruck,
    attempts: [...state.twoTruck.attempts, truckA], current: allocationResult(truckA),
    bestAllocationFound: state.twoTruck.bestAllocationFound || truckA === 3 } };
}
export const TWO_TRUCK_QUESTIONS = {
  capacity_question: { prompt: 'Why can the same six workers produce more with two trucks?',
    options: ['The workers became more skilled.', 'Customer demand increased.', 'Each group has more fixed production space and equipment to work with.', 'Marginal product no longer applies.'],
    field: 'capacityAnswer', correct: 2,
    feedback: 'The workers did not change. The amount of labor did not change. What changed was the amount of capital available to that labor.' },
  dmr_transfer: { prompt: 'Does the two-truck result contradict diminishing marginal returns?',
    options: ['Yes. More capital should always reduce output.', 'Yes. Six workers must always produce 53 tacos.', 'No. The fixed inputs changed, so the original one-truck production relationship no longer describes the new production setup.', 'No. Diminishing marginal returns only applies when total product falls.'],
    field: 'dmrAnswer', correct: 2,
    feedback: 'Diminishing marginal returns described what happened as more labor was added to one fixed truck. Adding another truck changes the fixed input and therefore changes the production environment.' },
};
export function answerTwoTruck(state, value) {
  const q = TWO_TRUCK_QUESTIONS[state.phase];
  if (!q || state.twoTruck[q.field] !== null || !Number.isInteger(value) || value < 0 || value >= q.options.length) return state;
  return { ...state, twoTruck: { ...state.twoTruck, [q.field]: { value, correct: value === q.correct } } };
}
export function continueTwoTruck(state) {
  if (state.phase === 'allocation_result') return { ...state, phase: state.twoTruck.bestAllocationFound ? 'capacity_question' : 'two_truck' };
  const q = TWO_TRUCK_QUESTIONS[state.phase];
  if (!q || state.twoTruck[q.field] === null) return state;
  return { ...state, phase: state.phase === 'capacity_question' ? 'dmr_transfer' : 'complete' };
}
export function twoTruckMetrics(state) {
  return { allocationTruckA: null, allocationTruckB: null, truckAOutput: null, truckBOutput: null, combinedOutput: null,
    ...state.twoTruck.current, allocationAttemptNumber: state.twoTruck.attempts.length,
    bestAllocationFound: state.twoTruck.bestAllocationFound,
    capacityQuestionCorrect: state.twoTruck.capacityAnswer?.correct ?? null, dmrTransferCorrect: state.twoTruck.dmrAnswer?.correct ?? null };
}
