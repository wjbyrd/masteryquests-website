import { followupFor, evaluateAnswer } from './instructional-followup.js';

const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function tableFor({ caption, headers, rows }) {
  const table = el('table'), head = el('thead'), tr = el('tr'), body = el('tbody');
  table.append(el('caption', caption));
  for (const label of headers) { const th = el('th', label); th.scope = 'col'; tr.append(th); }
  head.append(tr);
  for (const row of rows) {
    const tr = el('tr');
    row.forEach((value, i) => { const cell = el(i ? 'td' : 'th', value); if (!i) cell.scope = 'row'; tr.append(cell); });
    body.append(tr);
  }
  table.append(head, body); return table;
}
function graphFor(model) {
  const figure = el('figure', undefined, 'followup-graph');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 520 340'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', 'followup-graph-title followup-graph-desc');
  function draw(tag, attrs, text) {
    const node = document.createElementNS(svg.namespaceURI, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    svg.append(node); return node;
  }
  const line = (x1, y1, x2, y2, cls = '') => draw('line', { x1, y1, x2, y2, class: cls });
  const text = (x, y, label, attrs = {}) => draw('text', { x, y, ...attrs }, label);
  draw('title', { id: 'followup-graph-title' }, model.kind === 'ppf' ? 'Production possibilities: recovery and growth' : `Your final ticket market: ${model.status}`);
  draw('desc', { id: 'followup-graph-desc' }, model.description);
  line(80, 35, 80, 275); line(80, 275, 490, 275);
  if (model.kind === 'ppf') {
    text(12, 22, 'Capital goods'); text(200, 325, 'Household goods');
    draw('path', { d: 'M80 80 Q360 80 420 275', class: 'model-curve' });
    draw('path', { d: 'M80 50 Q440 50 475 275', class: 'model-expanded' });
    for (const [id, x, y] of [['A', 305, 128.75], ['B', 190, 200], ['C', 358.75, 106.25]]) {
      draw('circle', { cx: x, cy: y, r: model.point === id ? 8 : 5 }); text(x + 12, y - 8, id);
    }
    figure.append(svg, el('figcaption', 'Solid: original frontier. Dashed: expanded capacity. Household consumer goods on the horizontal axis; capital goods on the vertical axis. Schematic, not numerical indicator values.'));
    if (!model.expanded) figure.append(el('p', 'The dashed frontier is a possibility your run did not reach.'));
    figure.append(tableFor({ caption: 'Read the diagram in words', headers: ['Point', 'Economic meaning'], rows: [
      ['A', 'On the original frontier: resources efficiently used; a different mix has an opportunity cost.'],
      ['B', 'Inside the original frontier: idle resources; recovery can raise both outputs.'],
      ['C', 'On a larger frontier: feasible only after productive capacity expands.']
    ] }));
  } else {
    const qs = 270, qd = model.status === 'shortage' ? 350 : model.status === 'surplus' ? 190 : 270;
    text(12, 22, 'Ticket price'); text(210, 325, 'Ticket quantity');
    line(qs, 55, qs, 275, 'model-expanded'); text(qs + 10, 55, 'S');
    line(qd - 110, 70, qd + 90, 270, 'model-curve'); text(qd - 130, 63, 'D');
    line(80, 180, 470, 180, 'model-price'); text(88, 165, 'Posted P');
    line(qd, 180, qd, 275, 'model-guide');
    draw('rect', { x: qs - 5, y: 175, width: 10, height: 10 });
    draw('circle', { cx: qd, cy: 180, r: 6 });
    if (qd === qs) text(qs, 302, 'Qd = Qs', { 'text-anchor': 'middle' });
    else { text(qs, 302, 'Qs', { 'text-anchor': 'middle' }); text(qd, 302, 'Qd', { 'text-anchor': 'middle' }); }
    figure.append(svg, el('figcaption', 'D: demand. S: fixed remaining supply. Qd: quantity demanded at the posted price. Qs: tickets available.'));
  }
  if (model.kind === 'market') figure.append(el('p', model.description));
  return figure;
}

// Each mount owns only its practice state. Reset/replay destroys the old DOM and
// listeners; no extra storage key or telemetry system is introduced.
export function renderFollowup(id, run) {
  const model = followupFor(id, run);
  if (!model) return null;
  if (!document.querySelector('#instructional-followup-style')) {
    const link = el('link'); link.id = 'instructional-followup-style'; link.rel = 'stylesheet';
    link.href = new URL('./instructional-followup.css', import.meta.url).href; document.head.append(link);
  }
  const section = el('section', undefined, 'instructional-followup');
  section.setAttribute('aria-labelledby', 'followup-title');
  const heading = el('h3', model.title); heading.id = 'followup-title';
  section.append(heading, el('p', model.intro));
  if (model.graph) section.append(graphFor(model.graph));
  if (model.table) section.append(tableFor(model.table));
  const stage = el('div', undefined, 'followup-stage'); section.append(stage);
  let index = 0;
  function paint(focus = false) {
    stage.replaceChildren();
    if (index === model.questions.length) {
      const complete = el('h4', 'Application complete'); complete.tabIndex = -1;
      stage.append(complete, el('p', `You applied the economics in ${index} ${index === 1 ? 'task' : 'tasks'}. Your original outcome and path remain above.`));
      section.dataset.complete = 'true'; if (focus) complete.focus(); return;
    }
    const task = model.questions[index]; let solved = false;
    stage.dataset.question = task.id;
    const prompt = el('h4', task.prompt); prompt.id = 'followup-prompt'; prompt.tabIndex = -1;
    const options = el('div', undefined, 'followup-options'); options.setAttribute('role', 'group'); options.setAttribute('aria-labelledby', prompt.id);
    const feedback = el('p', undefined, 'followup-feedback'); feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-atomic', 'true');
    const next = el('button', index === model.questions.length - 1 ? 'Finish application' : 'Next application', 'primary'); next.type = 'button'; next.hidden = true;
    next.addEventListener('click', () => { index++; paint(true); });
    task.options.forEach((option, i) => {
      const button = el('button', option.text); button.type = 'button'; button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (solved) return;
        const answer = evaluateAnswer(task, i);
        for (const sibling of options.children) sibling.setAttribute('aria-pressed', String(sibling === button));
        feedback.textContent = `${answer.correct ? 'Correct.' : 'Reconsider.'} ${answer.feedback}${answer.correct ? '' : ' Choose again.'}`;
        solved = answer.correct; next.hidden = !solved;
        if (solved) for (const sibling of options.children) sibling.setAttribute('aria-disabled', 'true');
      }); options.append(button);
    });
    stage.append(el('p', `Application ${index + 1} of ${model.questions.length}`, 'eyebrow'), prompt, options, feedback, next);
    if (focus) prompt.focus();
  }
  paint(); return section;
}
