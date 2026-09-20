import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import scenario from './game/scenarios/main-attraction.js';
import { enumerate, summarize } from './qa.mjs';
import { createRun, availableChoices, decide, advance, matches } from './game/engine.js';
import { selectScene } from './game/scenes.js';

export function trace(ids) {
  let run = createRun(scenario, { runID: 'qa', startedAt: 0 });
  const features = new Set(['scene:baseline']), scenes = new Set(['baseline']), phases = [run];
  for (const id of ids) {
    const node = scenario.nodes.find(n => n.id === run.nodeID);
    for (const c of node.choices.filter(c => c.when)) features.add(`gate:${node.id}.${c.id}:${matches(c.when, run) ? 'open' : 'closed'}`);
    const c = availableChoices(scenario, run).find(c => c.id === id);
    if (!c) throw Error(`Unavailable QA choice ${run.nodeID}.${id}`);
    features.add(`choice:${run.nodeID}.${id}`);
    if (run.nodeID === 'segments' && id === 'members') features.add(`membership:${run.history[0].choiceID === 'raise' ? 'higher-price' : 'ordinary-price'}`);
    if (run.nodeID === 'maintenance' && id === 'defer') features.add(`defer:${run.history[0].choiceID === 'lower' ? 'heavy-use' : 'ordinary-use'}`);
    run = decide(scenario, run, id); phases.push(run);
    const scene = selectScene(scenario.sceneSet, run).id; scenes.add(scene); features.add(`scene:${scene}`);
    run = advance(scenario, run); phases.push(run);
  }
  if (run.phase === 'ending') features.add(`ending:${run.endingID}`);
  return { run, scenes: [...scenes], features: [...features], phases };
}

export function coverage() {
  const result = enumerate(scenario);
  const rows = result.complete.map(run => trace(run.history.map(h => h.choiceID)));
  // Begin with recognizable strategies, then greedily add the fewest useful coverage rows.
  const seeds = [
    ['raise','reserve','single','overhaul','hold','differentiate'],
    ['lower','open','members','partial','hold','broaden'],
    ['raise','priority','dates','partial','expand','broaden'],
    ['lower','open','members','defer','expand','course'],
    ['hold','reserve','single','partial','throughput','course'],
    ['lower','reserve','single','overhaul','throughput','broaden']
  ];
  const selected = seeds.map(trace), uncovered = new Set(rows.flatMap(row => row.features));
  for (const row of selected) row.features.forEach(f => uncovered.delete(f));
  while (uncovered.size) {
    const best = rows.reduce((a, b) => b.features.filter(f => uncovered.has(f)).length > a.features.filter(f => uncovered.has(f)).length ? b : a);
    if (!best.features.some(f => uncovered.has(f))) throw Error('Coverage cannot progress');
    selected.push(best); best.features.forEach(f => uncovered.delete(f));
  }
  return { result, summary: { ...summarize(result, scenario), scenes: [...new Set(rows.flatMap(row => row.scenes))], manualRuns: selected.length }, selected };
}

function guide({ summary, selected }) {
  const lines = ['# The Main Attraction — instructor QA paths', '',
    'Private preview: <http://127.0.0.1:4179/?scenario=main-attraction>. Generated with `node audit_tools/econ_rpg/main-attraction-qa.mjs --write`.', '',
    `${summary.paths} legal runs are tested exhaustively; each has six decisions. These ${selected.length} playthroughs cover all seven authored nodes, 21 node/choice pairs, five endings, six art states, every funding gate both open and closed, and both membership/maintenance consequence branches. They are a review set, not ranked answers.`, '',
    'Inspect rows 1–6 first: premium operation; broad access/crowding; funded expansion; deferred upkeep; incremental investment under competition; and depleted funds. Each row uses the six choice IDs below. Start over between rows.', '',
    '| # | Six choices | Ending | Scenes encountered |', '|---|---|---|---|'];
  selected.forEach((row, i) => lines.push(`| ${i+1} | ${row.run.history.map(h => h.choiceID).join(' → ')} | ${row.run.endingID} | ${row.scenes.join(', ')} |`));
  lines.push('', '## Choice key', '');
  for (const node of scenario.nodes.filter(n => n.id !== 'busy-midway')) {
    lines.push(`### ${node.id === 'steady-midway' ? 'Queue management (both branches)' : node.title}`, '');
    node.choices.forEach(c => lines.push(`- \`${c.id}\`: ${c.label}`)); lines.push('');
  }
  lines.push('## Focused checks', '',
    '- Pricing: compare raise/hold/lower. Market power still faces a downward-sloping demand curve; the initial inelastic response is a scenario assumption, not a universal law.',
    '- Segmentation: compare members after raise with members after hold/lower. New business versus discounted existing sales changes the earnings effect. Dates trades retained surplus for access and smoother demand; one price retains more surplus with less targeting.',
    '- Gates: lower → reserve → members leaves only partial/defer maintenance; lower → reserve → single → overhaul blocks expansion; add throughput and premium programming is unavailable. Confirm no gate can be bypassed after reload.',
    '- Delivery: expand spends earnings without adding capacity at decision 5. Construction may be masked by maintenance; decision 6 delivers capacity once. Reload at both phases to verify no double delivery.',
    '- Maintenance: compare defer after lower versus raise. Deferred deterioration persists into the next season even after expansion. Throughput and expansion do not erase the old ride’s problem.',
    '- Competition: try all three final responses. The rival affects willingness to pay without instantly removing all market power. No response is labeled correct.',
    '- Read all six path entries and their expandable details. Review marginal revenue versus price, price-discrimination assumptions, financing/ordinal simplifications and the ordering of overlapping endings.',
    '- Resume a consequence, a decision and an ending. Switch to Room to Stay, then back; both saves must persist independently. Restart or replay one and confirm the other is unchanged.',
    '- At 320px/390px, check all six images, the complete debrief and optional indicator help. Play with Tab/Enter/Space; test a real phone and screen reader during instructor review.', '',
    '## Exhaustive outcome counts', '', ...Object.entries(summary.endings).map(([id, count]) => `- ${id}: ${count}`), '');
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = coverage(); console.log(JSON.stringify(data.summary, null, 2));
  if (process.argv.includes('--write')) writeFileSync(new URL('./MAIN-ATTRACTION-QA-PATHS.md', import.meta.url), guide(data));
}
