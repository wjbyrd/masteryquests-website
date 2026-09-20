import { nodeContent, availableChoices } from './engine.js';
import { renderScene } from './scenes.js';
export function el(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function button(label, action, className = 'primary') {
  const b = el('button', label, className); b.type = 'button'; b.addEventListener('click', action); return b;
}
export function contentBlocks(blocks, parent) {
  for (const block of blocks) {
    if (block.type === 'paragraph') parent.append(el('p', block.text));
    if (block.type === 'table') {
      const wrap = el('div', undefined, 'table-wrap'), table = el('table');
      table.append(el('caption', block.caption));
      const head = el('thead'), row = el('tr');
      block.headers.forEach(text => { const th = el('th', text); th.scope = 'col'; row.append(th); });
      head.append(row); table.append(head);
      const body = el('tbody'); block.rows.forEach(cells => { const tr = el('tr'); cells.forEach(text => tr.append(el('td', text))); body.append(tr); });
      table.append(body); wrap.append(table); parent.append(wrap);
    }
    if (block.type === 'image') {
      const figure = el('figure'), img = el('img'); img.src = block.src; img.alt = block.alt;
      figure.append(img, el('figcaption', block.description)); parent.append(figure);
    }
  }
}
export function changes(s, before, after) {
  const ul = el('ul', undefined, 'changes');
  for (const [id, spec] of Object.entries(s.state)) {
    const delta = after[id] - before[id];
    if (delta) ul.append(el('li', `${spec.label}: ${delta > 0 ? '↑ increased' : '↓ decreased'} ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'step' : 'steps'}`));
  }
  if (!ul.children.length) ul.append(el('li', 'Indicators held steady in this step.'));
  return ul;
}
function heading(view, title, eyebrow) {
  if (eyebrow) view.append(el('p', eyebrow, 'eyebrow'));
  const h = el('h2', title); h.id = 'view-title'; h.tabIndex = -1; view.append(h);
}
export function renderState(s, run) {
  const panel = document.querySelector('#state-panel'); panel.replaceChildren();
  const title = el('h2', s.stateTitle || 'Conditions'); title.id = 'state-title'; panel.append(title);
  const initial = Object.fromEntries(Object.entries(s.state).map(([id, spec]) => [id, spec.initial]));
  const state = run?.state || initial;
  const recent = run?.history.at(-1);
  const list = el('dl', undefined, 'indicator-list');
  for (const [id, spec] of Object.entries(s.state)) {
    const group = el('div', undefined, 'state-item'); group.append(el('dt', spec.label));
    const dd = el('dd');
    const dots = el('span', undefined, 'steps'); dots.setAttribute('aria-hidden', 'true');
    for (let i = spec.min; i < spec.max; i++) dots.append(el('i', '', i < state[id] ? 'filled' : ''));
    const value = el('span', `${state[id]} / ${spec.max}`, 'state-value');
    value.append(el('span', ' steps', 'sr-only'));
    dd.append(dots, value);
    const delta = recent ? recent.after[id] - recent.before[id] : 0;
    if (delta) {
      const movement = el('span', undefined, 'state-change');
      const sign = el('span', `${delta > 0 ? '↑ +' : '↓ '}${delta}`); sign.setAttribute('aria-hidden', 'true');
      movement.append(sign, el('span', `${delta > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'step' : 'steps'} after the latest decision.`, 'sr-only'));
      dd.append(movement);
    }
    group.append(dd); list.append(group);
  }
  panel.append(list);
  const details = el('details'), definitions = el('dl', undefined, 'indicator-definitions');
  for (const spec of Object.values(s.state)) {
    const group = el('div'); group.append(el('dt', spec.label), el('dd', spec.short)); definitions.append(group);
  }
  details.append(el('summary', 'What do these indicators mean?'), definitions, el('p', 'Indicators show simplified scenario conditions, not real-world forecasts.')); panel.append(details);
}
export function render(s, run, saved, actions, focus = true) {
  const view = document.querySelector('#view'); view.replaceChildren();
  document.querySelector('#restart').hidden = !run && !saved;
  renderState(s, run || saved);
  if (!run) {
    heading(view, s.introTitle || 'Your scenario');
    document.querySelector('#view-title').classList.add('sr-only');
    contentBlocks(s.introduction, view);
    if (saved) view.append(button(saved.phase === 'ending' ? 'Review saved outcome' : `Resume decision ${Math.min(saved.history.length + (saved.phase === 'decision' ? 1 : 0), s.decisions)} of ${s.decisions}`, actions.resume));
    else view.append(button('Begin scenario', actions.start));
  } else if (run.phase === 'decision') {
    const node = nodeContent(s, run);
    heading(view, node.title, `Decision ${run.history.length + 1} of ${s.decisions} · ${node.time || ''}`);
    contentBlocks(node.scene, view); view.append(el('h3', node.prompt));
    const cards = el('div', undefined, 'choices');
    availableChoices(s, run).forEach((choice, i) => {
      const card = button('', () => actions.choose(choice.id), 'choice'); card.dataset.choice = choice.id;
      const number = el('span', String(i + 1).padStart(2, '0'), 'choice-number'); number.setAttribute('aria-hidden', 'true');
      const copy = el('span'); copy.append(el('strong', choice.label), el('span', choice.detail)); card.append(number, copy); cards.append(card);
    });
    view.append(cards);
    if (availableChoices(s, run).length < node.choices.length) view.append(el('p', node.unavailableNote || 'Earlier decisions limit the options available here.', 'muted'));
  } else if (run.phase === 'consequence') {
    const entry = run.history.at(-1);
    heading(view, s.consequenceTitle || 'What happened', `After decision ${run.history.length} · ${s.nodes.find(n => n.id === entry.nodeID).time || ''}`);
    view.append(el('p', entry.label, 'selected'), el('p', entry.consequence, 'consequence'), changes(s, entry.before, entry.after));
    const insight = el('div', undefined, 'insight'); insight.append(el('h3', 'The economic tradeoff'), el('p', entry.tradeoff)); view.append(insight);
    view.append(button(entry.next === '$end' ? 'See your outcome & debrief' : 'Continue to next decision', actions.advance));
  } else {
    const ending = s.endings.find(e => e.id === run.endingID);
    heading(view, ending.title, s.endingEyebrow || 'Your outcome');
    view.append(el('p', ending.summary, 'consequence'), el('h3', 'What changed overall'), changes(s, run.history[0].before, run.state));
    view.append(el('h3', 'Your path'));
    const path = el('ol', undefined, 'path');
    run.history.forEach((entry, i) => {
      const item = el('li'); item.append(el('h4', entry.label), el('p', entry.consequence.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || entry.consequence), el('p', entry.mechanism, 'mechanism'));
      const details = el('details'); details.append(el('summary', `Decision ${i + 1}: consequence and tradeoff`), el('p', entry.consequence), changes(s, entry.before, entry.after), el('p', entry.tradeoff));
      item.append(details); path.append(item);
    });
    view.append(path, el('h3', 'Read the economics'));
    s.debrief.forEach(part => { view.append(el('h4', part.title), el('p', part.text)); });
    view.append(el('h3', 'Alternative decisions'));
    const alternatives = el('ul', undefined, 'what-ifs');
    [0, 2, 3].filter(i => i < run.history.length).forEach(i => alternatives.append(el('li', run.history[i].whatIf)));
    view.append(alternatives, button('Replay scenario', actions.replay));
  }
  const scene = renderScene(s.sceneSet, run || saved);
  if (scene) document.querySelector('#view-title').after(scene);
  if (focus) { document.querySelector('#view-title').focus({ preventScroll: true }); view.scrollIntoView({ block: 'start', behavior: 'instant' }); }
}
