// Small fixed debrief, selected only by observed crew sizes. No adaptive question bank.
const questions = {
  turning: { id: 'turning', prompt: 'When did adding another worker first increase output by less than the worker before?',
    options: ['Second worker', 'Third worker', 'Fourth worker', 'Fifth worker', 'Sixth worker'], correct: 2,
    explanation: 'The fourth worker. The additions rose from 10 to 13 tacos, then fell to 11. Total output still rose from 31 to 42.' },
  calculation3: { id: 'calculation3', prompt: 'Output rose from 18 tacos with two workers to 31 tacos with three workers. How many additional tacos did the third worker add?',
    kind: 'calculation', correct: 13, explanation: '31 − 18 = 13 additional tacos.' },
  calculation5: { id: 'calculation5', prompt: 'Output rose from 42 tacos with four workers to 50 tacos with five workers. How many additional tacos did the fifth worker add?',
    kind: 'calculation', correct: 8, explanation: '50 − 42 = 8 additional tacos.' },
  comparison: { id: 'comparison', prompt: 'Output rose from 42 tacos with four workers to 50 tacos with five workers. What happened to the contribution of the additional worker?',
    options: ['Total output fell.', 'The extra worker’s contribution rose because total output rose.', 'Production became negative.', 'The extra worker’s contribution fell even though total output rose.'], correct: 3,
    explanation: 'The fourth worker added 11 tacos; the fifth added 8. The extra contribution fell while total output rose from 42 to 50.' },
  sixth: { id: 'sixth', prompt: 'The sixth worker increased output from 50 tacos to 53 tacos. What does that tell you?',
    options: ['The sixth worker added fewer tacos, so total output fell.', 'The sixth worker still added tacos, but fewer than the fifth worker.', 'The sixth worker added no tacos because the kitchen was crowded.', 'The sixth worker contributed more because 53 is greater than 50.'], correct: 1,
    explanation: '53 − 50 = 3 additional tacos. That is still positive, but smaller than the fifth worker’s addition of 8.' },
  fixed: { id: 'fixed', prompt: 'Why did the additional output from new workers eventually begin to fall?',
    options: ['Customer demand fell.', 'The new workers became less skilled.', 'Taco prices changed.', 'More workers shared the same fixed truck, grill, prep space, and equipment.'], correct: 3,
    explanation: 'The amount of production space and equipment did not increase. More labor had to share those fixed inputs; demand stayed strong.' },
};
export function debriefQuestions(state) {
  return [questions.turning, questions.calculation3,
    ...(state.tested.includes(5) ? [questions.calculation5, questions.comparison] : []),
    ...(state.tested.includes(6) ? [questions.sixth] : []), questions.fixed];
}
export const currentQuestion = state => debriefQuestions(state)[state.questionIndex];
export function answerDebrief(state, value) {
  if (state.phase !== 'debrief' || state.answers.length !== state.questionIndex) return state;
  const q = currentQuestion(state);
  if (!Number.isInteger(value) || value < 0 || (q.kind === 'calculation' ? value > 1000 : value >= q.options.length)) return state;
  return { ...state, answers: [...state.answers, { id: q.id, value, correct: value === q.correct }] };
}
export function continueDebrief(state) {
  if (state.phase !== 'debrief' || state.answers.length !== state.questionIndex + 1) return state;
  return state.questionIndex + 1 === debriefQuestions(state).length
    ? { ...state, phase: 'total_graph' } : { ...state, questionIndex: state.questionIndex + 1 };
}
export function explorationMessage(state) {
  if (state.tested.length === 6) return 'Full production record observed. You followed the production function from specialization through heavy crowding.';
  if (state.tested.length === 5) return 'You pushed beyond the turning point and saw diminishing marginal returns continue.';
  if (state.tested.length === 4) return 'You found the turning point. Two staffing levels remained untested, so the complete production record is shown below.';
  return `You tested ${state.tested.length} ${state.tested.length === 1 ? 'crew size' : 'crew sizes'}. The complete production record below fills in the untested levels.`;
}
export function debriefMetrics(state) {
  const correct = id => state.answers.find(a => a.id === id)?.correct ?? null;
  const calculations = state.answers.filter(a => a.id.startsWith('calculation'));
  return { maximumCrewObserved: Math.max(0, ...state.tested), turningPointCorrect: correct('turning'),
    marginalCalculationCorrect: calculations.length ? calculations.every(a => a.correct) : null,
    totalVsMarginalCorrect: correct('comparison'), sixthWorkerCorrect: correct('sixth'), fixedInputCorrect: correct('fixed'),
    debriefQuestionsAnswered: state.answers.length, debriefQuestionsCorrect: state.answers.filter(a => a.correct).length };
}
