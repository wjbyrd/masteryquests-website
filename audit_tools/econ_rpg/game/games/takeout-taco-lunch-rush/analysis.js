export const ANALYSIS_QUESTIONS = {
  total_graph: { prompt: 'What happens to the total-product curve after the third worker?',
    options: ['It begins falling.', 'It becomes vertical.', 'It continues rising, but at a decreasing rate.', 'It stops changing completely.'], correct: 2,
    feedback: 'Total production is still increasing. But each additional worker adds fewer tacos, so the curve begins to flatten.' },
  marginal_graph: { prompt: 'What does the marginal-product graph show beginning with Worker 4?',
    options: ['Total production falls with each new worker.', 'Each additional worker adds fewer tacos than the worker before.', 'Total production becomes negative.', 'Each additional worker becomes more productive than the last.'], correct: 1,
    feedback: 'This is diminishing marginal returns. Total product can still rise while marginal product falls.' },
  what_if: { prompt: 'Suppose Takeout Taco installs a second grill and adds more prep space before tomorrow’s rush. What would you expect?',
    options: ['Diminishing marginal returns would likely begin with fewer workers.', 'Diminishing marginal returns would likely begin with more workers.', 'Total product would automatically fall.', 'Labor would no longer have a marginal product.'], correct: 1,
    feedback: 'The fixed production constraint has been relaxed. More workers can now be added before crowding the available capital becomes as severe.' },
};
export function answerAnalysis(state, value) {
  const q = ANALYSIS_QUESTIONS[state.phase];
  if (!q || state.analysisAnswers[state.phase] !== null || !Number.isInteger(value) || value < 0 || value >= q.options.length) return state;
  return { ...state, analysisAnswers: { ...state.analysisAnswers, [state.phase]: { value, correct: value === q.correct } } };
}
export function continueAnalysis(state) {
  const next = { total_graph: 'marginal_graph', marginal_graph: 'connect_graphs', connect_graphs: 'reveal', reveal: 'what_if', what_if: 'complete' }[state.phase];
  if (!next || (ANALYSIS_QUESTIONS[state.phase] && state.analysisAnswers[state.phase] === null)) return state;
  return { ...state, phase: next };
}
export function analysisMetrics(state) {
  return { productionReviewTotal: state.answers.length, productionReviewCorrect: state.answers.filter(a => a.correct).length,
    totalProductGraphCorrect: state.analysisAnswers.total_graph?.correct ?? null,
    marginalProductGraphCorrect: state.analysisAnswers.marginal_graph?.correct ?? null,
    whatIfCorrect: state.analysisAnswers.what_if?.correct ?? null };
}
