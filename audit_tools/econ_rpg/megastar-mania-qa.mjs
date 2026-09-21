import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import scenario from './game/scenarios/megastar-mania.js';
import { enumerate, summarize } from './qa.mjs';
import { createRun, decide, advance, matches } from './game/engine.js';
import { selectScene } from './game/scenes.js';
import { ticketMarket } from './game/scenarios/megastar-mania-market.js';
export function trace(ids) {
  let run = createRun(scenario, { runID: 'qa', startedAt: 0 });
  const phases = [run], features = new Set(['scene:baseline']), scenes = new Set(['baseline']);
  for (const id of ids) {
    const node = scenario.nodes.find(n => n.id === run.nodeID), choice = node.choices.find(c => c.id === id);
    features.add(`choice:${node.id}.${id}`);
    if (choice.outcomes) features.add(`outcome:${node.id}.${id}:${choice.outcomes.findIndex(o => matches(o.when, run))}`);
    run = decide(scenario, run, id); phases.push(run);
    if (node.id === 'expansion') features.add(`expansion:${id}:${ticketMarket(run).status}`);
    const scene = selectScene(scenario.sceneSet, run).id; scenes.add(scene); features.add(`scene:${scene}`);
    run = advance(scenario, run); phases.push(run);
  }
  if (run.phase === 'ending') features.add(`ending:${run.endingID}`);
  return { run, phases, features: [...features], scenes: [...scenes] };
}
export function coverage() {
  const result = enumerate(scenario), rows = result.complete.map(run => trace(run.history.map(h => h.choiceID)));
  const selected = [
    ['premium','aggressive','dates','cancel','quiet','original'],
    ['moderate','moderate','dates','postpone','acknowledge','experiment'],
    ['introductory','keep','limited','postpone','acknowledge','original'],
    ['moderate','keep','dates','postpone','acknowledge','full'],
    ['premium','aggressive','venues','cancel','acknowledge','original'],
    ['premium','moderate','limited','postpone','acknowledge','original'],
    ['premium','aggressive','limited','cancel','acknowledge','experiment'],
    ['premium','aggressive','limited','postpone','acknowledge','experiment']
  ].map(trace);
  const missing = new Set(rows.flatMap(row => row.features));
  selected.forEach(row => row.features.forEach(f => missing.delete(f)));
  while (missing.size) {
    const best = rows.reduce((a,b) => b.features.filter(f => missing.has(f)).length > a.features.filter(f => missing.has(f)).length ? b : a);
    if (!best.features.some(f => missing.has(f))) throw Error('Coverage stalled');
    selected.push(best); best.features.forEach(f => missing.delete(f));
  }
  return { result, selected, summary: { ...summarize(result, scenario), scenes: [...new Set(rows.flatMap(row => row.scenes))], manualRuns: selected.length } };
}
function guide({summary, selected}) {
  const lines = ['# Megastar Mania — instructor QA paths', '',
    'Private preview: <http://127.0.0.1:4179/?scenario=megastar-mania>. Version 1. Start over between routes. No subtitle.', '',
    `${summary.paths} legal paths each take six decisions. These ${selected.length} routes cover every reachable node, choice and conditional consequence, all seven scenes and all seven endings. Read routes 1–8 first; the remaining rows complete economic boundary coverage.`, '',
    '1. Premium opening leaves empty seats; further increases and an unanswered interview lose listeners.',
    '2. Moderate opening, capacity expansion and cautious crossover bring the remaining seats into balance.',
    '3. Introductory pricing, unchanged prices and limited capacity create shortages and resale pressure.',
    '4. Added dates, recovery and a full crossover show supply expansion, contraction and demand growth.',
    '5. Earlier expansion can still leave surplus capacity after cancellations and a softer audience.',
    '6. A smaller circuit keeps capacity modest; earlier pricing continues to govern attendance.',
    '7. Strong demand and a deliberately limited tour produce Intimate by Choice with purchases matching capacity.',
    '8. The same strong-demand limited-tour strategy still produces Intimate by Choice when the retained price leaves seats open.', '',
    '| # | Six choices | Ending | Scenes encountered | Final D / S / R / G / M |', '|---|---|---|---|---|'];
  selected.forEach((r,i) => lines.push(`| ${i+1} | ${r.run.history.map(h => h.choiceID).join(' → ')} | ${r.run.endingID} | ${r.scenes.join(', ')} | ${Object.values(r.run.state).join(' / ')} |`));
  lines.push('', 'D = preference strength; S = available tickets; R = financial strength from receipts after refunds; G = goodwill; M = career momentum. All are ordinal teaching indicators, not empirical estimates. Do not compare D directly with S to diagnose shortage: the posted price also determines purchases.', '', '## Choice key', '');
  for (const node of scenario.nodes) { lines.push(`### ${node.title} (${node.id})`, ''); node.choices.forEach(c => lines.push(`- \`${c.id}\`: ${c.label}`)); lines.push(''); }
  lines.push('## Focused review', '',
    '- Compare all three opening prices: demand and supply stay fixed, while purchases change. Premium leaves empty seats; moderate clears the illustrative market; introductory pricing creates unfilled requests.',
    '- The breakout raises demand for every pricing response. Price changes affect quantity demanded, not the demand indicator. An aggressive increase after a premium opening can still leave surplus tickets.',
    '- Added dates and bigger venues change supply only. If there are no extra willing buyers at the price, new seats do not raise ticket receipts. Adding dates always shows the expanded-tour map on the immediate consequence, including shortage, balance and surplus. Continue to see market-state art again. Larger venues never trigger the map.',
    '- Intimate by Choice requires a deliberately limited schedule and strong preference demand (at least 6/8), with no shortage at the posted price. A Smaller Circuit is reserved for more modest demand. Existing shortage, crossover and successful-expansion ending priorities remain unchanged; never compare raw Demand directly with Supply to diagnose ticket scarcity.',
    '- Each illness response reduces current supply, with demand unchanged. The closed venue appears on the cancellation consequence only. At the next decision Jules has recovered for the remaining dates, not restored the removed dates.',
    '- Publicity changes demand without changing supply or price. If the remaining capacity is small enough, weaker demand can still leave a shortage. Empty-seat art appears only when purchases fall below capacity.',
    '- Crossover attracts new listeners without adding seats. More demand cannot increase receipts at a fixed price if all available tickets already sell. Look for renewed shortage pressure in that case.',
    '- Resale appears only with actual unfilled requests at the official price. It is not a judgment that the price was wrong. “Sold out” alone is not proof of a shortage; shut-out buyers supply that evidence.',
    '- The four debrief sections and six path entries should match the decisions. Different priorities can favor receipts, goodwill, capacity or career prospects; there is no aggregate score.',
    '- Reload at a decision, consequence and ending. Restart, cancel restart with Escape, and replay. Switch between all four scenarios and confirm their saves remain separate.',
    '- Try keyboard-only play, expand the indicator help, and read the ending at 320px and 390px. Automated checks cover focus, live announcements, button targets and overflow; also review on a real phone and with a screen reader.', '',
    '## Ending counts', '', ...Object.entries(summary.endings).map(([id,n]) => `- ${scenario.endings.find(e => e.id === id).title}: ${n}`), '');
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = coverage(); console.log(JSON.stringify({...data.summary, representatives: undefined}, null, 2));
  if (process.argv.includes('--write')) writeFileSync(new URL('./MEGASTAR-MANIA-QA-PATHS.md', import.meta.url), guide(data));
}
