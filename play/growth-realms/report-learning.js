import {escapeHTML as esc} from './city-renderer.js';

export const CONCEPTS = [
  ['Productivity', 'Output per worker measures how much each worker produces—the productivity measure in this game. Higher productivity raises output without simply adding workers and is central to long-run improvements in living standards, though this game does not model every aspect of well-being.'],
  ['Physical capital and diminishing returns', 'Industry & Infrastructure adds equipment and productive capacity. Holding other inputs constant, additional capital generally brings smaller marginal gains when capital per worker is already high: diminishing returns. This helps explain the different capital-investment opportunities in Meridian and Rivermark.'],
  ['The catch-up effect', 'An economy with little capital per worker may grow faster because early capital investments offer large gains; adopting existing technology can also help. Rivermark starts with this potential, but catch-up is not guaranteed: institutions, skills, technology, resources, investment choices and other conditions matter.'],
  ['Human capital', 'Schools & Training builds human capital: workers’ skills and knowledge. Skills can make other investments more productive and help workers adopt new technologies; in the game, some training takes time to become effective.'],
  ['Technology and innovation', 'Research & Innovation improves methods and access to technology, helping workers and capital produce more. Because physical-capital accumulation alone faces diminishing returns, sustained long-run productivity growth increasingly depends on improved technology, knowledge and methods.'],
  ['Growth depends on more than one input', 'Investments can work better together: research needs skilled workers, and equipment needs adequate food, water and utilities. These are complementary inputs. The game’s bottlenecks illustrate how a missing input can limit the payoff from other investments.'],
];

// Describe observed allocations/conditions, without attributing a measured gain to one input.
export function runConnection(run) {
  const player = run.cities.find(c => c.id === run.playerCity);
  const early = player.history.slice(0, 2);
  const capital = early.reduce((sum, h) => sum + h.allocation.capital, 0);
  const budget = early.reduce((sum, h) => sum + Object.values(h.allocation).reduce((a, b) => a + b, 0), 0);
  if (budget && capital >= budget / 2) return `You put ${capital} of ${budget} early development points into Industry & Infrastructure. That emphasized physical capital, whose payoff depends on the starting equipment base and supporting inputs.`;
  const strained = player.history.filter(h => h.endState.constraints.resourceShortage).length;
  if (strained) return `Your city faced resource constraints in ${strained} of ${player.history.length} rounds. Those bottlenecks illustrate why more equipment needs supporting resource capacity.`;
  const adoption = player.history.filter(h => h.endState.constraints.technologyAdoption).length;
  if (adoption) return `Your city faced limited technology adoption in ${adoption} of ${player.history.length} rounds. That connects the race to human capital: available methods are more useful when workers can use them.`;
  const skills = player.history.reduce((sum, h) => sum + h.allocation.education + h.allocation.research, 0);
  return `You committed ${skills} points to Schools & Training and Research & Innovation across ${player.history.length} rounds. These choices represent investment in human capital and technology alongside the city’s other needs.`;
}

export function synthesisHTML(run) {
  return `<section class="learning-synthesis panel" aria-labelledby="synthesis-title"><p class="eyebrow">WHAT THIS GAME WAS SHOWING YOU</p><h3 id="synthesis-title">The Economics Behind the Race</h3><div class="concept-grid">${CONCEPTS.map(([name, text]) => `<article><h4>${name}</h4><p>${text}</p></article>`).join('')}</div><aside class="growth-level-callout" aria-labelledby="growth-level-title"><h4 id="growth-level-title">Growth Rate ≠ Economic Level</h4><p>A smaller economy can grow by a larger percentage and still have much lower output per worker. For example, 20 growing by 20% becomes <strong>24</strong>; 100 growing by 8% becomes <strong>108</strong>.</p><p>Faster growth does not automatically mean higher productivity. To judge catch-up, examine whether the gap narrows over time, alongside final levels. Here, the relative gap narrows even though the absolute difference grows.</p></aside><p class="run-connection"><strong>In your run:</strong> ${esc(runConnection(run))}</p></section>`;
}

export const QUESTIONS = [
  {
    id: 'catch-up', title: 'Faster growth. Higher productivity?',
    prompt: 'A smaller economy begins with much less capital per worker and lower output per worker than a richer economy. Its output per worker grows 12%, while the richer economy’s grows 5%. What can we conclude?',
    answer: 'lower-base',
    options: [
      ['lower-base', 'The smaller economy is catching up in relative terms, but may still have lower output per worker.', 'Exactly. Faster growth from a lower base narrows the relative gap without necessarily eliminating it. Growth rates and productivity levels answer different questions.'],
      ['richer', 'The smaller economy now has higher output per worker because its growth rate was higher.', 'Not quite. A higher percentage growth rate does not establish a higher productivity level. Starting points matter; try again.'],
      ['cannot-grow', 'The smaller economy’s reported growth contradicts diminishing returns to capital.', 'Not quite. Diminishing returns can make additional capital more productive where capital is scarce, helping explain faster growth from a lower base. Try again.'],
      ['same-rate', 'The smaller economy can close the relative gap only if both growth rates become equal.', 'Not quite. Equal proportional growth preserves the relative gap. Faster productivity growth in the lower-level economy can narrow it; try again.'],
    ],
  },
  {
    id: 'capital', title: 'The next unit of equipment',
    prompt: 'Two otherwise similar economies add the same amount of capital per worker. One starts with little capital; the other already has a large stock. Why might the first receive a larger productivity gain?',
    answer: 'marginal',
    options: [
      ['marginal', 'The marginal gain from additional capital tends to be larger when the starting capital stock is low.', 'Exactly. With other inputs held constant, diminishing returns means each additional unit of capital tends to add less output as capital accumulates.'],
      ['harmful', 'Additional capital generally reduces output once an economy has a large capital stock.', 'Not quite. A smaller marginal gain is not the same as a negative gain. More capital can still raise output in a capital-rich economy; try again.'],
      ['technology-falls', 'Accumulating capital automatically reduces the technology available to workers.', 'Not quite. Diminishing returns does not require technology to fall; it describes additional capital’s payoff with other inputs held constant. Try again.'],
      ['proportional', 'Each additional unit of capital raises output by the same amount at every starting level.', 'Not quite. That assumes constant marginal returns. Diminishing returns means the added output generally becomes smaller as capital accumulates; try again.'],
    ],
  },
  {
    id: 'skills', title: 'New technology, limited skills',
    prompt: 'An economy invests heavily in new technology, but workers lack the skills needed to use it effectively. What does this illustrate?',
    answer: 'complements',
    options: [
      ['complements', 'Technology and human capital can complement each other, so weak skills can limit the productivity payoff.', 'Exactly. Human capital helps workers adopt and use new methods. Technology and skills can raise each other’s productivity payoff.'],
      ['automatic', 'Access to new technology raises productivity equally, regardless of workers’ skills.', 'Not quite. Access is not the same as effective use. Skills can limit technology adoption and its payoff; try again.'],
      ['replace', 'Investment in technology generally removes the need for education and training.', 'Not quite. New methods often require new skills. Technology and human capital can complement each other rather than replace one another; try again.'],
      ['always-schools', 'Education must always have the highest return, whatever the economy’s starting conditions.', 'Not quite. This scenario identifies a skills bottleneck, not a universal ranking of policies. Returns depend on starting conditions and other inputs; try again.'],
    ],
  },
  {
    id: 'transfer', title: 'Another economy. A new decision.',
    prompt: 'An economy has little equipment per worker, strong schools, reliable infrastructure, and access to existing world technology. Which development opportunity would you expect to be especially valuable?',
    answer: 'potential',
    options: [
      ['potential', 'Combine additional equipment with adoption of existing production methods.', 'Exactly. Scarce equipment can have high returns, while strong schools make existing technology easier to adopt. Together they offer a productivity opportunity, provided resources keep up with the new activity.'],
      ['resources', 'Prioritize still more basic resource capacity, even though existing infrastructure has ample room.', 'Not quite. Resources matter when they constrain production. With ample infrastructure, extra capacity may contribute less immediately than equipment and better methods that the skilled workforce can use; try again.'],
      ['labor', 'Prioritize increasing the number of workers, while leaving their equipment and methods unchanged.', 'Not quite. More workers can raise total output, but unchanged equipment and methods limit gains per worker. Scarce capital and strong skills create an opportunity to improve productivity; try again.'],
      ['training', 'Prioritize more training while leaving scarce equipment and available production methods unchanged.', 'Not quite. Training can help, but this workforce already has strong skills. Equipment and existing technology offer a way to put those skills to use; try again.'],
    ],
  },
];

export function shuffledOptions(question, random = Math.random) {
  const options = [...question.options];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export const conceptCheckHTML = () => `<section class="concept-check panel" aria-labelledby="check-title"><p class="eyebrow">CAN YOU EXPLAIN THE ECONOMICS BEHIND THE RACE?</p><h3 id="check-title">Quick Concept Check</h3><p id="check-progress" role="status" aria-atomic="true">0 / 4 understood</p><div id="check-content"></div></section>`;

// Learning interactions are local presentation state, separate from the economic run.
export function mountConceptCheck(report, random = Math.random) {
  const host = report.querySelector('#check-content');
  const progress = report.querySelector('#check-progress');
  const orders = QUESTIONS.map(q => shuffledOptions(q, random));
  let current = 0;
  const understood = new Set();
  function showQuestion(focus = false) {
    const q = QUESTIONS[current];
    host.innerHTML = `<p class="question-step">Question ${current + 1} of 4</p><h4 id="question-title" tabindex="-1">${q.title}</h4><p id="question-prompt">${q.prompt}</p><div class="concept-options" role="group" aria-labelledby="question-title" aria-describedby="question-prompt">${orders[current].map(([id, text]) => `<button type="button" data-concept-answer="${id}" aria-pressed="false">${text}</button>`).join('')}</div><p id="concept-feedback" role="status" aria-atomic="true"></p><button type="button" class="primary-button" id="check-next" hidden>${current === 3 ? 'Finish concept check' : 'Next question'} <span aria-hidden="true">→</span></button>`;
    if (focus) host.querySelector('#question-title').focus();
  }
  showQuestion();
  host.onclick = e => {
    const button = e.target.closest('button');
    if (!button || !host.contains(button)) return;
    if (button.dataset.conceptAnswer && !understood.has(current)) {
      const q = QUESTIONS[current], option = q.options.find(o => o[0] === button.dataset.conceptAnswer);
      if (!option) return;
      const correct = option[0] === q.answer;
      host.querySelectorAll('[data-concept-answer]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const feedback = host.querySelector('#concept-feedback');
      feedback.dataset.correct = String(correct);
      feedback.textContent = option[2];
      if (correct) {
        understood.add(current);
        progress.textContent = `${understood.size} / 4 understood`;
        // Keep the selected answer focusable for keyboard and screen-reader review.
        host.querySelectorAll('[data-concept-answer]').forEach(b => b.setAttribute('aria-disabled', 'true'));
        host.querySelector('#check-next').hidden = false;
      }
    }
    if (button.id === 'check-next' && understood.has(current)) {
      if (++current < QUESTIONS.length) showQuestion(true);
      else {
        progress.textContent = '4 / 4 complete';
        host.innerHTML = `<div class="check-complete"><h4 tabindex="-1">You connected the race to the economics.</h4><p>Keep these ideas for the next economy you encounter.</p><ul>${QUESTIONS.map(q => `<li><strong>${q.title}</strong><p>${q.options.find(o => o[0] === q.answer)[2].replace(/^Exactly\. /, '')}</p></li>`).join('')}</ul></div>`;
        host.querySelector('h4').focus();
      }
    }
  };
}
