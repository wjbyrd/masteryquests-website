export const ANALYSIS_QUESTIONS = {
  total_graph: { prompt: 'What happens to the total-product curve after the third worker?',
    options: ['It begins falling.', 'It becomes vertical.', 'It continues rising, but at a decreasing rate.', 'It stops changing completely.'], correct: 2,
    feedback: 'Total production is still increasing. But each additional worker adds fewer tacos, so the curve begins to flatten.' },
  marginal_graph: { prompt: 'What does the marginal-product graph show beginning with Worker 4?',
    options: ['Total production falls with each new worker.', 'Each additional worker adds fewer tacos than the worker before.', 'Total production becomes negative.', 'Each additional worker becomes more productive than the last.'], correct: 1,
    feedback: 'This is diminishing marginal returns. Total product can still rise while marginal product falls.' },

};
export function answerAnalysis(state, value) {
  const q = ANALYSIS_QUESTIONS[state.phase];
  if (!q || state.analysisAnswers[state.phase] !== null || !Number.isInteger(value) || value < 0 || value >= q.options.length) return state;
  return { ...state, analysisAnswers: { ...state.analysisAnswers, [state.phase]: { value, correct: value === q.correct } } };
}
export function continueAnalysis(state) {
  const next = { total_graph: 'marginal_graph', marginal_graph: 'connect_graphs', connect_graphs: 'reveal', reveal: 'two_truck' }[state.phase];
  if (!next || (ANALYSIS_QUESTIONS[state.phase] && state.analysisAnswers[state.phase] === null)) return state;
  return { ...state, phase: next };
}
export function analysisMetrics(state) {
  return { productionReviewTotal: state.answers.length, productionReviewCorrect: state.answers.filter(a => a.correct).length,
    totalProductGraphCorrect: state.analysisAnswers.total_graph?.correct ?? null,
    marginalProductGraphCorrect: state.analysisAnswers.marginal_graph?.correct ?? null };
}
