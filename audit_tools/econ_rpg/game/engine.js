// Pure, immutable transitions. Scenario data contains no executable conditions.
export const END = '$end';
const clone = value => JSON.parse(JSON.stringify(value));
export function matches(condition, run) {
  if (!condition) return true;
  if (condition.all) return condition.all.every(c => matches(c, run));
  if (condition.any) return condition.any.some(c => matches(c, run));
  if (condition.not) return !matches(condition.not, run);
  if (condition.chosen) return run.history.some(h => `${h.nodeID}.${h.choiceID}` === condition.chosen);
  const value = run.state[condition.state];
  return ({ gte: () => value >= condition.value, lte: () => value <= condition.value,
    eq: () => value === condition.value })[condition.op]?.() ?? false;
}
export function createRun(scenario, { runID = globalThis.crypto.randomUUID(), startedAt = Date.now() } = {}) {
  return { scenarioID: scenario.id, scenarioVersion: scenario.version, runID, startedAt,
    phase: 'decision', nodeID: scenario.start, endingID: null,
    state: Object.fromEntries(Object.entries(scenario.state).map(([id, spec]) => [id, spec.initial])), history: [] };
}
export const currentNode = (scenario, run) => scenario.nodes.find(n => n.id === run.nodeID);
export const availableChoices = (scenario, run) => currentNode(scenario, run).choices.filter(c => matches(c.when, run));
export function nodeContent(scenario, run) {
  const node = currentNode(scenario, run);
  return { ...node, ...(node.variants?.find(v => matches(v.when, run)) || {}) };
}
export function decide(scenario, run, choiceID) {
  if (run.phase !== 'decision') throw Error('A decision is not open.');
  const choice = availableChoices(scenario, run).find(c => c.id === choiceID);
  if (!choice) throw Error('Choice unavailable.');
  const nextRun = clone(run), before = clone(run.state);
  const outcome = choice.outcomes?.find(o => matches(o.when, run));
  const effects = { ...choice.effects };
  for (const [id, amount] of Object.entries(outcome?.effects || {})) effects[id] = (effects[id] || 0) + amount;
  for (const [id, amount] of Object.entries(effects)) {
    const spec = scenario.state[id];
    nextRun.state[id] = Math.max(spec.min, Math.min(spec.max, before[id] + amount));
  }
  // Routing conditions see the resulting state, including this decision.
  const entry = { nodeID: run.nodeID, choiceID, label: choice.label, before, after: clone(nextRun.state),
    consequence: outcome?.consequence || choice.consequence, mechanism: choice.mechanism,
    tradeoff: choice.tradeoff, whatIf: choice.whatIf };
  nextRun.history.push(entry);
  entry.next = typeof choice.next === 'string' ? choice.next :
    choice.next.find(branch => matches(branch.when, nextRun)).target;
  nextRun.phase = 'consequence';
  return nextRun;
}
export function advance(scenario, run) {
  if (run.phase !== 'consequence') throw Error('No consequence to advance.');
  const result = clone(run), next = result.history.at(-1).next;
  if (next === END) {
    result.phase = 'ending';
    result.endingID = scenario.endings.find(e => matches(e.when, result)).id;
  } else { result.phase = 'decision'; result.nodeID = next; }
  return result;
}
export function transitionEvent(type, run, choiceID, now = Date.now()) {
  return { type, scenarioID: run.scenarioID, scenarioVersion: run.scenarioVersion,
    runID: run.runID, nodeID: run.nodeID, choiceID: choiceID || null,
    state: clone(run.state), elapsedMs: Math.max(0, now - run.startedAt) };
}

export function validateScenario(s) {
  const fail = message => { throw Error(`Invalid scenario: ${message}`); };
  const nonempty = value => typeof value === 'string' && value.trim().length;
  if (!nonempty(s.id) || !Number.isInteger(s.version) || s.version < 1) fail('identity/version');
  if (!s.state || !Object.keys(s.state).length || !s.nodes?.length || !s.endings?.length) fail('missing structure');
  const ids = s.nodes.map(n => n.id);
  if (ids.some(id => !nonempty(id) || id === END) || new Set(ids).size !== ids.length) fail('duplicate/invalid node ID');
  if (!ids.includes(s.start)) fail('start target');
  const decisions = new Set(s.nodes.flatMap(n => n.choices.map(c => `${n.id}.${c.id}`)));
  for (const [id, spec] of Object.entries(s.state)) {
    if (![spec.min, spec.max, spec.initial].every(Number.isInteger) || spec.min >= spec.max || spec.initial < spec.min || spec.initial > spec.max || !nonempty(spec.label)) fail(`state ${id}`);
  }
  function condition(c) {
    if (c === undefined) return;
    if (!c || typeof c !== 'object' || Array.isArray(c)) fail('condition');
    const keys = Object.keys(c);
    if (keys.length === 1 && (c.all || c.any)) {
      const list = c.all || c.any;
      if (!Array.isArray(list) || !list.length) fail('condition group');
      list.forEach(condition); return;
    }
    if (keys.length === 1 && c.not) return condition(c.not);
    if (keys.length === 1 && decisions.has(c.chosen)) return;
    if (keys.length === 3 && c.state in s.state && ['gte', 'lte', 'eq'].includes(c.op) && Number.isFinite(c.value)) return;
    fail('unknown condition or decision reference');
  }
  function effects(e) {
    if (!e || typeof e !== 'object' || Array.isArray(e)) fail('effects');
    for (const [id, value] of Object.entries(e)) if (!(id in s.state) || !Number.isInteger(value)) fail(`effect ${id}`);
  }
  function blocks(content) {
    if (!Array.isArray(content)) fail('content blocks');
    for (const b of content) {
      if (b.type === 'paragraph' && nonempty(b.text)) continue;
      if (b.type === 'table' && nonempty(b.caption) && b.headers?.length && b.rows?.every(r => r.length === b.headers.length)) continue;
      if (b.type === 'image' && nonempty(b.alt) && nonempty(b.description) && /^\.\/[^:]+$/.test(b.src) && !b.src.includes('..')) continue;
      fail('content block');
    }
  }
  blocks(s.introduction);
  const edges = new Map();
  for (const n of s.nodes) {
    if (!nonempty(n.title) || !nonempty(n.prompt) || !n.choices.length) fail(`node ${n.id}`);
    blocks(n.scene); n.variants?.forEach(v => { condition(v.when); if (v.scene) blocks(v.scene); });
    if (new Set(n.choices.map(c => c.id)).size !== n.choices.length) fail(`duplicate choice ${n.id}`);
    edges.set(n.id, []);
    for (const c of n.choices) {
      if (![c.id, c.label, c.consequence, c.mechanism, c.tradeoff, c.whatIf].every(nonempty)) fail(`choice content ${n.id}`);
      condition(c.when); effects(c.effects);
      c.outcomes?.forEach(o => { condition(o.when); effects(o.effects); if (!nonempty(o.consequence)) fail('outcome consequence'); });
      const targets = typeof c.next === 'string' ? [c.next] : c.next?.map(b => { condition(b.when); return b.target; });
      if (!targets?.length || (Array.isArray(c.next) && c.next.at(-1).when !== undefined)) fail('branch needs fallback');
      for (const target of targets) {
        if (target !== END && !ids.includes(target)) fail(`next target ${target}`);
        edges.get(n.id).push(target);
      }
    }
  }
  if (new Set(s.endings.map(e => e.id)).size !== s.endings.length) fail('duplicate ending');
  s.endings.forEach(e => { condition(e.when); if (![e.id, e.title, e.summary].every(nonempty)) fail('ending content'); });
  if (s.endings.at(-1).when !== undefined) fail('ending needs fallback');
  const visited = new Set(), active = new Set();
  function walk(id) {
    if (id === END) return;
    if (active.has(id)) fail('cycle');
    if (visited.has(id)) return;
    active.add(id); edges.get(id).forEach(walk); active.delete(id); visited.add(id);
  }
  walk(s.start);
  if (visited.size !== ids.length) fail('orphan node');
  return true;
}
