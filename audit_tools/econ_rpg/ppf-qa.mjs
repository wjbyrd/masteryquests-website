import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import scenario from './game/scenarios/ppf.js';
import { enumerate, summarize } from './qa.mjs';
import { createRun, decide, advance, matches } from './game/engine.js';
import { selectScene } from './game/scenes.js';
export function trace(ids) {
  let run=createRun(scenario,{runID:'qa',startedAt:0});
  const phases=[run], features=new Set(['scene:balanced']), scenes=new Set(['balanced']);
  for(const id of ids) {
    const node=scenario.nodes.find(n=>n.id===run.nodeID);
    node.choices.filter(c=>c.when).forEach(c=>features.add(`gate:${node.id}.${c.id}:${matches(c.when,run) ? 'open':'closed'}`));
    features.add(`choice:${node.id}.${id}`);
    run=decide(scenario,run,id);phases.push(run);
    const scene=selectScene(scenario.sceneSet,run).id;scenes.add(scene);features.add(`scene:${scene}`);
    run=advance(scenario,run);phases.push(run);
  }
  if(run.phase==='ending') features.add(`ending:${run.endingID}`);
  return {run,phases,features:[...features],scenes:[...scenes]};
}
export function coverage() {
  const result=enumerate(scenario), rows=result.complete.map(run=>trace(run.history.map(h=>h.choiceID)));
  const selected=[
    ['balanced','hold','wait','full','hold','hold'],
    ['consumption','consumption','wait','phased','restart','hold'],
    ['capital','hold','wait','full','hold','hold'],
    ['balanced','hold','wait','phased','continue','prepare'],
    ['balanced','hold','wait','equipment','restart','hold'],
    ['balanced','hold','wait','full','invest','consumption']
  ].map(trace);
  const missing=new Set(rows.flatMap(row=>row.features));
  selected.forEach(row=>row.features.forEach(f=>missing.delete(f)));
  while(missing.size) {
    const best=rows.reduce((a,b)=>b.features.filter(f=>missing.has(f)).length>a.features.filter(f=>missing.has(f)).length?b:a);
    if(!best.features.some(f=>missing.has(f))) throw Error('Coverage stalled');
    selected.push(best);best.features.forEach(f=>missing.delete(f));
  }
  return {result,selected,summary:{...summarize(result,scenario),scenes:[...new Set(rows.flatMap(row=>row.scenes))],manualRuns:selected.length}};
}
function guide({summary,selected}) {
  const lines=['# The Economy’s Edge — instructor QA paths','',
    'Private preview: <http://127.0.0.1:4179/?scenario=ppf>. Internal ID `ppf`, version 1. Start over between routes.','',
    `${summary.paths} legal paths are tested exhaustively. This ${selected.length}-run review set covers every node/choice, conditional gate in both states, all five endings and all six scenes. Every completed run has six decisions.`, '',
    'Inspect routes 1–6 first: balanced full utilization; household emphasis; capital emphasis; continued slack; recovery without growth; and an expanded frontier that can supply more of both outputs. The rest complete branch and boundary coverage.','',
    '| # | Six choices | Ending | Scenes | Final C / K / U / G |','|---|---|---|---|---|'];
  selected.forEach((r,i)=>lines.push(`| ${i+1} | ${r.run.history.map(h=>h.choiceID).join(' → ')} | ${r.run.endingID} | ${r.scenes.join(', ')} | ${Object.values(r.run.state).join(' / ')} |`));
  lines.push('','C = current consumption; K = capital production; U = utilization; G = future-growth preparation. Steps are illustrative conditions, not quantities to add or exchange across categories.','','## Choice key','');
  for(const node of scenario.nodes) { lines.push(`### ${node.title} (${node.id})`,'');node.choices.forEach(c=>lines.push(`- \`${c.id}\`: ${c.label}`));lines.push(''); }
  lines.push('## Focused economic checks','',
    '- At full utilization, a shift toward either current output reduces the other. Compare a small shift with a further push toward the same sector: specialized resources make the latter sacrifice larger.',
    '- The shock reduces both current outputs and utilization. It leaves the same productive resources available; no frontier shift has occurred.',
    '- Recovery can raise both outputs using idle resources. A full restart returns to the pre-shock mix, never beyond it.',
    '- Current productive investment uses resources that could supply households. Future growth is preparation, not a third current output or instant capacity.',
    '- In the expanded branch, compare “Increase both types of output” with changing the mix. All final expanded choices lie on the same larger frontier; more of one is still a choice to forgo some of the other.',
    '- A fall in the future-growth indicator on delivery means prepared projects have entered use. It is not a fall in realized productive capacity.',
    '- A high pipeline with slack remaining still uses the slowdown scene and ending. Recovery and project readiness are both required before delivered growth.',
    '- The bottom-left panel means unused labor/equipment. Do not read crates or stored parts as a count of idle resources. The top-right panel shows preparation and productivity; it is not a third current-output sector.',
    '- Reload at a decision, consequence and ending; effects and delivered growth must not apply twice. Switching scenarios and restarting one must preserve the others’ saves.',
    '- Review all six path entries and four economics sections; try keyboard controls, 320px/390px layouts and a screen reader. No graph or formula is required.','',
    '## Exhaustive endings','',...Object.entries(summary.endings).map(([id,n])=>`- ${id}: ${n}`),'');
  return lines.join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const data=coverage();console.log(JSON.stringify({...data.summary,representatives:undefined},null,2));
  if(process.argv.includes('--write')) writeFileSync(new URL('./PPF-QA-PATHS.md',import.meta.url),guide(data));
}
