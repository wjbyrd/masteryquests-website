import { minimumPlan, minimumSchedule, marginalSchedule, perService, equipmentLabel } from './engine.js';
import { money } from './content.js';
const SERIES = { FC: ['#77d9d3', 'Fixed cost', ''], VC: ['#efcd87', 'Variable cost', '8 5'], TC: ['#f3f6ff', 'Total cost', '2 5'],
  AFC: ['#77d9d3', 'Average fixed cost', ''], AVC: ['#efcd87', 'Average variable cost', '8 5'], ATC: ['#f3f6ff', 'Average total cost', '2 5'], MC: ['#f3a8c5', 'Marginal cost', '10 3 2 3'] };
export const scenarios = state => [...new Map(state.trials.map(t => [t.key, { key: t.key, plan: t.plan }])).values()];
export function graphData(state, { key = null, reference = false, full = false } = {}) {
  const actual = state.trials.filter(t => !key || t.key === key).map(t => ({ ...perService(t), source: t.source === 'lab' ? `Cost Lab trial ${t.id}` : `Trial ${t.id} · round ${t.round}`, type: 'actual' }));
  const equipment = scenarios(state).filter(s => !key || s.key === key);
  const minimum = [], marginal = [];
  for (const s of equipment) {
    const trials = state.trials.filter(t => t.key === s.key);
    if (reference) {
      const rows = full && state.completed ? minimumSchedule(s.plan) : [...new Set(trials.map(t => t.output))].sort((a, b) => a - b).map(q => minimumPlan(s.plan, q));
      minimum.push(...rows.map(r => ({ ...perService(r), source: `Calculated minimum · ${r.plan.workers.join('+')} workers`, type: 'minimum' })));
    }
    const allMC = marginalSchedule(s.plan);
    let revealed = new Set();
    // Reveal only technology explained in completed rounds, even on sparse paths.
    for (const t of trials.filter(t => t.round >= 4 && t.round <= 7)) {
      for (let n = 1; n < t.round; n++) revealed.add(n);
    }
    if (full && state.completed) revealed = new Set(allMC.map(r => r.workers));
    for (const row of allMC.filter(r => r.MC !== null && revealed.has(r.workers))) {
      marginal.push({ ...perService(row), fromOutput: row.fromQ / (row.Q / row.output), source: `Staffing reference · worker ${row.workers} · MP ${row.MP}`, type: 'marginal' });
    }
  }
  return { actual, minimum, marginal, equipment };
}
function graphTable(rows, fields, id) {
  return `<details class="graph-data"><summary>Graph values · accessible table</summary><div class="table-scroll" tabindex="0" role="region" aria-label="${id} graph values"><table><caption>Same values as the graph. Output is tacos per lunch; total costs are dollars per lunch; averages and MC are dollars per taco.</caption><thead><tr><th scope="col">Source</th><th scope="col">Trucks</th><th scope="col">Tacos / lunch</th>${fields.map(f => `<th scope="col">${f}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><th scope="row">${r.source}</th><td>${r.plan.trucks}</td><td>${r.type === 'marginal' ? `${r.fromOutput} → ${r.output}` : r.output}</td>${fields.map(f => `<td>${money(r[f], ['FC', 'VC', 'TC'].includes(f) ? 0 : 2)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}
export function chart(state, { kind = 'total', id = 'main', compact = false, key = null, reference = false, full = false, complete = false, title: customTitle = null, scale = null } = {}) {
  const data = graphData(state, { key, reference, full });
  const total = kind === 'total';
  const fields = total ? ['FC', 'VC', 'TC'] : (complete ? ['AFC', 'AVC', 'ATC', 'MC'] : ['ATC', 'MC']);
  const actual = data.actual.map(r => ({ ...r, MC: null })); // Staffing MC is never inferred from these points.
  const rows = [...actual, ...data.minimum.map(r => ({ ...r, MC: null })), ...(!total ? data.marginal.map(r => ({ ...r, AFC: null, AVC: null, ATC: null })) : [])];
  if (!rows.length) return '<p class="empty-graph">Your first point appears after a completed decision.</p>';
  const width = compact ? 340 : id.startsWith('round') ? 760 : 520, left = 52, right = width - 23, bottom = 214;
  const maxQ = Math.ceil(Math.max(60, scale?.output || 0, ...rows.map(r => r.output)) / 20) * 20;
  const maxV = Math.max(total ? 80 : 24, scale?.cost || 0, ...rows.flatMap(r => fields.map(f => r[f] ?? 0)));
  const top = Math.ceil(maxV * 1.1 / (total ? 100 : 5)) * (total ? 100 : 5);
  const x = q => left + q / maxQ * (right - left), y = v => bottom - v / top * 184;
  const title = customTitle || (total ? 'The cost of this lunch' : 'When extra tacos get expensive');
  const marker = (r, field) => {
    const v = r[field]; if (v === null || v === undefined) return '';
    const cx = x(r.output), cy = y(v), color = SERIES[field][0];
    const label = `${r.source}; ${r.plan.trucks} truck${r.plan.trucks === 1 ? '' : 's'}; ${r.output} tacos per lunch; ${field} ${money(v, total ? 0 : 2)} ${total ? 'per lunch' : 'per taco'}`;
    const latest = r.type === 'actual' && r.id === state.trials.at(-1)?.id;
    const shape = field === 'TC' || field === 'ATC' ? `<path d="M${cx} ${cy - 5} l5 9 h-10 Z"/>` : field === 'VC' || field === 'AVC' ? `<rect x="${cx - 4}" y="${cy - 4}" width="8" height="8"/>` : `<circle cx="${cx}" cy="${cy}" r="4"/>`;
    return `<g class="chart-point ${latest ? 'new-point' : ''}" tabindex="0" role="img" aria-label="${label}" opacity="${latest ? 1 : 0.5}" fill="${color}" stroke="${color}" stroke-width="${r.type === 'minimum' ? 1 : 2}"><title>${label}</title>${latest ? `<circle cx="${cx}" cy="${cy}" r="8" fill="none"/>` : ''}${shape}</g>`;
  };
  const guides = data.equipment.map(s => {
    const points = data.minimum.filter(r => r.key === s.key).sort((a, b) => a.output - b.output);
    const mc = data.marginal.filter(r => r.key === s.key).sort((a, b) => a.output - b.output);
    const fc = data.actual.find(r => r.key === s.key)?.FC;
    return fields.map(f => {
      if (f === 'FC') return `<path d="M${left} ${y(fc)} H${right}" stroke="${SERIES.FC[0]}" opacity="0.5" stroke-dasharray="5 5" fill="none"/>`;
      if (f === 'MC') return mc.map(r => `<path data-reference="${s.key}" d="M${x(r.fromOutput)} ${y(r.MC)} H${x(r.output)}" stroke="${SERIES.MC[0]}" stroke-width="2" stroke-dasharray="5 4" fill="none"><title>${r.source}: ${money(r.MC, 2)} per taco</title></path>`).join('');
      const source = points;
      // Never connect arbitrary actual trials, nor points from different capital.
      return `<polyline data-reference="${s.key}" points="${source.filter(r => r[f] !== null).map(r => `${x(r.output)},${y(r[f])}`).join(' ')}" stroke="${SERIES[f][0]}" opacity="0.65" stroke-dasharray="5 5" fill="none"/>`;
    }).join('');
  }).join('');
  return `<figure class="cost-chart" data-chart="${kind}"><div class="graph-heading"><h3>${title}</h3><span>${total ? '$ per lunch service' : '$ per taco'}</span></div><svg viewBox="0 0 ${width} 260" role="group" aria-labelledby="${id}-title" aria-describedby="${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${total ? 'Actual FC, VC and TC observations, as introduced by your decisions.' : 'Actual average costs and explicitly calculated full-capacity staffing MC references.'} Equipment configurations are separate. Actual points are never joined into a theoretical cost function. Values are available in the following table.</desc>${Array.from({ length: 5 }, (_, i) => { const v = top * i / 4; return `<path class="grid-line" d="M${left} ${y(v)} H${right}"/><text x="${left - 8}" y="${y(v) + 5}" text-anchor="end">${Number(v.toFixed(1))}</text>`; }).join('')}<path class="axis" d="M${left} 22 V${bottom} H${right}"/>${[0, 1, 2, 3].map(i => { const q = maxQ * i / 3; return `<text x="${x(q)}" y="239" text-anchor="middle">${Number(q.toFixed(1))}</text>`; }).join('')}${guides}${[...new Map(actual.map(r => [`${r.key}:${r.output}:${fields.map(f => r[f]).join(':')}`, r])).values()].map(r => fields.filter(f => !(f === 'FC' && r.FC === r.TC)).map(f => marker(r, f)).join('')).join('')}</svg><p class="axis-label">Tacos produced per lunch service</p><figcaption><div class="legend">${fields.map(f => `<span><svg viewBox="0 0 22 12" aria-hidden="true">${f === 'MC' ? `<path d="M0 6 H22" stroke="${SERIES[f][0]}" stroke-width="2" stroke-dasharray="5 4"/>` : f === 'TC' || f === 'ATC' ? `<path d="M11 1 l5 9 H6 Z" fill="${SERIES[f][0]}"/>` : f === 'VC' || f === 'AVC' ? `<rect x="7" y="2" width="8" height="8" fill="${SERIES[f][0]}"/>` : `<circle cx="11" cy="6" r="4" fill="${SERIES[f][0]}"/>`}</svg>${f}</span>`).join('')}</div></figcaption>${graphTable(rows, fields, id)}</figure>`;
}
export function primaryGraphs(state, { compact = false } = {}) {
  const equipment = scenarios(state);
  const scale = { output: Math.max(0, ...state.trials.map(t => t.output)), cost: Math.max(0, ...state.trials.map(t => perService(t).TC)) };
  return equipment.map((s, i) => chart(state, { kind: 'total', key: s.key, compact, id: `round-${i}`, scale,
    title: equipment.length > 1 ? `${s.plan.trucks === 1 ? 'Original' : 'Expanded'} operation · ${s.plan.trucks} ${s.plan.trucks === 1 ? 'truck' : 'trucks'}` : null })).join('');
}
export function curvesView(state, options = {}) {
  const kind = options.kind || 'total', key = scenarios(state).some(s => s.key === options.key) ? options.key : scenarios(state)[0]?.key;
  return `<div class="curve-controls"><label for="curve-kind">Cost measures<select id="curve-kind"><option value="total" ${kind === 'total' ? 'selected' : ''}>FC, VC and TC</option><option value="unit" ${kind === 'unit' ? 'selected' : ''}>AFC, AVC, ATC and MC</option></select></label><label for="curve-equipment">Equipment<select id="curve-equipment">${scenarios(state).map(s => `<option value="${s.key}" ${s.key === key ? 'selected' : ''}>${equipmentLabel(s.plan)}</option>`).join('')}</select></label></div><label class="check"><input id="curve-reference" type="checkbox" ${options.reference ? 'checked' : ''}> Compare with minimum costs at my outputs</label>${state.completed ? `<label class="check"><input id="curve-full" type="checkbox" ${options.full ? 'checked' : ''}> Reveal untested calculated reference values</label>` : ''}<p class="small">Solid markers show actual decisions; the ring highlights the current trial. Dashed lines show calculated references. Identical observations share a marker, while every trial remains in the accessible table. MC uses comparable full-capacity staffing increments, not arbitrary differences between trials.</p><p class="small">${options.full && state.completed ? 'Untested reference values are now shown explicitly as calculations. They are not student observations.' : 'Only completed decisions and the staffing references introduced in those rounds are shown.'} References use discrete workers and whole-taco output; lines are guides, not smooth textbook curves.</p>${chart(state, { ...options, key, kind, id: 'detail', complete: true, reference: options.reference || options.full })}`;
}
