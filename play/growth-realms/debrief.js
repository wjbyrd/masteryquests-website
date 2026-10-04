import { GAME_CONFIG as G, GAME_BALANCE as B, CATEGORIES, CPU_DOCTRINES, CYCLES } from './config.js';
import {raceResult} from './rivalry.js';
import { gapReport, bottlenecks } from './model.js';
import { escapeHTML as esc } from './city-renderer.js';

const fmt = (v, digits = 0) => v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const averageGrowth = city => (Math.pow(city.output / city.history[0].startState.output, 1 / city.history.length) - 1) * 100;
export function describePath(city, isPlayer) {
  const early = city.history.slice(0, 2), later = city.history.slice(2);
  const mean = (records, key) => records.reduce((sum, h) => sum + h.allocation[key], 0) / records.length;
  const describe = records => {
    const ordered = [...CATEGORIES].sort((a, b) => mean(records, b.id) - mean(records, a.id));
    if (mean(records, ordered[0].id) - mean(records, ordered.at(-1).id) < B.pathShiftPoints) return 'spread funding broadly across the four categories';
    const highest = mean(records, ordered[0].id);
    const leaders = ordered.filter(c => mean(records, c.id) === highest).map(c => c.short.toLowerCase()).join(' and ');
    return `emphasized ${leaders} (${fmt(highest, 1)} points per round${leaders.includes(' and ') ? ' each' : ''})`;
  };
  const strained = city.history.filter(h => h.endState.constraints.resourceShortage).length;
  const limited = city.history.filter(h => h.endState.constraints.technologyAdoption).length;
  return `${isPlayer ? 'You' : esc(city.name)} ${describe(early)} in rounds 1–2 and ${describe(later)} in rounds 3–${city.history.length}. Resource constraints affected ${strained} rounds; limited technology adoption affected ${limited}.`;
}
function whyThisPath(city, initial) {
  const total = key => city.history.reduce((sum, h) => sum + h.allocation[key], 0);
  const messages = [];
  if (total('capital')) {
    messages.push(`${esc(city.name)} added ${fmt(city.capital - initial.capital)} units of physical capital. ${initial.capitalPerWorker < B.skillUnderuseCapitalPerWorker ? 'Its low starting capital per worker created high-return investment opportunities.' : 'Its already large equipment base limited the marginal payoff of further capital.'}`);
    const capitalRounds = city.history.filter(h => h.allocation.capital >= B.feedbackCapitalPoints);
    if (capitalRounds.length > 1 && capitalRounds.at(-1).outputPerWorkerChange < capitalRounds[0].outputPerWorkerChange) messages.push(`The first capital-heavy round added ${fmt(capitalRounds[0].outputPerWorkerChange, 1)} output per worker; the last added ${fmt(capitalRounds.at(-1).outputPerWorkerChange, 1)}. Diminishing capital returns and any capacity pressure contributed to that slowdown.`);
  }
  if (total('education')) messages.push(`Completed education rose by ${fmt(city.education - initial.education)}. Training raises human capital, research effectiveness, and technology adoption; ${fmt(city.pendingEducation)} education points are still in training beyond this run.`);
  if (total('research')) messages.push(`Research raised available methods to a technology index of ${fmt(city.technology * B.technologyDisplayScale)}. Workforce skills allow ${fmt(city.technologyAdoption * 100)}% adoption before accounting for equipment. ${city.history.some(h => h.diffusion > 0) ? 'Adopting existing technology contributed alongside original research.' : 'Technology gains came from original research near the regional frontier.'}`);
  if (city.history.some(h => h.endState.constraints.resourceShortage)) messages.push('Capital, workers, and production demand outgrew resource services in some rounds, reducing output below potential and slowing labor growth. This emerged from economic state, not a scheduled crisis.');
  else messages.push('Food, water, and utilities kept up with production. Spare capacity prevented shortages, but was not itself an ongoing productivity engine.');
  if (city.history.some(h => h.endState.constraints.skillsUnderused)) messages.push('At times, trained workers lacked enough equipment to use their skills fully. Human capital and physical capital complement each other.');
  return messages.map(m => `<p>${m}</p>`).join('');
}
function trendChart(cities, initial) {
  const values = cities.map((c, i) => [initial[i].outputPerWorker, ...c.history.map(h => h.endState.outputPerWorker)]);
  const max = Math.max(...values.flat()) * 1.15;
  const x = i => 50 + i * (580 / G.totalRounds), y = v => 188 - v / max * 150;
  let svg = `<svg viewBox="0 0 670 228" role="img" aria-label="Output per worker across ${G.totalRounds} rounds. Exact values are available in the round ledger below.">`;
  for (let i = 0; i <= 3; i++) {
    const val = max * i / 3;
    svg += `<path d="M50 ${y(val)}H630" stroke="var(--mq-border)"/><text x="38" y="${y(val) + 4}" text-anchor="end">${fmt(val)}</text>`;
  }
  values.forEach((series, index) => {
    const color = index ? 'var(--mq-accent)' : 'var(--mq-navy)';
    svg += `<polyline points="${series.map((v, i) => `${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="3" ${index ? 'stroke-dasharray="6 4"' : ''}/>`;
    series.forEach((v, i) => { svg += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${color}"/>`; });
  });
  for (let i = 0; i <= CYCLES.length; i++) svg += `<text x="${x(i)}" y="214" text-anchor="middle">${i === 0 ? 'Start' : i}</text>`;
  return svg + '</svg>';
}
export function reportHTML(run) {
  const { cities, initialCities: initial, playerCity, rivalDoctrine } = run;
  const player = cities.find(c => c.id === playerCity);
  const gap = gapReport(initial, cities);
  const metrics = [
    ['Output', 'output', 0], ['Output / worker', 'outputPerWorker', 1], ['Capital / worker', 'capitalPerWorker', 1],
    ['Technology index', 'technology', 0, B.technologyDisplayScale], ['Education', 'education', 0], ['Labor', 'labor', 0],
    ['Resource stock', 'resources', 0], ['Resource capacity', 'laborCapacity', 0], ['Capacity coverage (%)', 'resourceAdequacy', 0, 100],
  ];
  const cards = cities.map((c, index) => `<article class="report-city panel"><p class="eyebrow">${esc(c.name)}</p><h3>Start → Finish</h3><table><thead><tr><th scope="col">Measure</th><th scope="col">Start</th><th scope="col">Finish</th></tr></thead><tbody>${metrics.map(([label, key, digits, scale = 1]) => `<tr><th scope="row">${label}</th><td>${fmt(initial[index][key] * scale, digits)}</td><td>${fmt(c[key] * scale, digits)}</td></tr>`).join('')}<tr><th scope="row">Average output growth / round</th><td>—</td><td>${fmt(averageGrowth(c), 1)}%</td></tr></tbody></table><p><strong>What happened?</strong> ${describePath(c, c.id === playerCity)}</p><p><strong>Unresolved conditions:</strong> ${bottlenecks(c).map(esc).join(' ') || 'No active bottlenecks.'}</p><p>Training still in progress: ${fmt(c.pendingEducation)} education points.</p></article>`).join('');
  const changes = cities.map((c, i) => (c.outputPerWorker / initial[i].outputPerWorker - 1) * 100);
  const gapSentence = gap.gapChangePercent === null ? 'The cities began with equal productivity; a percentage change in that zero gap is undefined.' : `The relative productivity gap ${gap.gapChangePercent <= 0 ? 'narrowed' : 'widened'} by ${fmt(Math.abs(gap.gapChangePercent), 1)}%.`;
  const race = raceResult(run);
  const leader=race.levelTied?'Level at displayed precision':race.overtaken?'Rivermark leads · starting lead overturned':'Meridian leads · starting lead maintained';
  return `<section class="race-result panel" aria-labelledby="race-result-title"><p class="eyebrow">${G.totalRounds} ROUNDS · ${playerCity==='meridian'?'HOLD THE LEAD & KEEP GROWING':'CLOSE THE GAP'}</p><h2 id="race-result-title">${race.headline}</h2><p class="outcome-explanation">${esc(race.explanation)}</p><div class="outcome-levels">${[race.player,race.rival].map(c=>`<div><span>${esc(c.name)} · ${c.id===playerCity?'Your city':'Rival'}</span><strong>${fmt(c.level,1)}</strong><span>Final output / worker</span><b>${c.score>=0?'+':''}${fmt(c.score,1)}% productivity growth</b></div>`).join('')}</div><div class="outcome-gap"><strong>${leader}</strong><p>Relative gap: ${fmt(Math.abs(gap.start)*100,1)}% → ${fmt(Math.abs(gap.finish)*100,1)}%. ${gapSentence}</p></div><p>Growth is measured from each city’s own starting point. A smaller starting base can produce a larger percentage gain while still trailing in output per worker.</p><details class="outcome-method"><summary>How this result is framed</summary><p>Lead and parity use final output per worker rounded to one decimal. A catch-up city within 10% of Meridian is nearly level; closing at least 10 percentage points is substantial narrowing. Meridian’s meaningful own growth means at least 5% over the run. These are game framing thresholds, not economic laws or a combined score. The gap uses Meridian’s productivity as its reference; after an overtake, the lead direction is reported separately.</p></details><p class="result-bridge">Here’s how your decisions shaped that result.</p></section><div class="report-heading"><p class="eyebrow">FINAL REPORT</p><h2 id="report-title">The economy you built</h2><p class="report-meta">You managed ${esc(player.name)}.<span>Rival strategy: ${CPU_DOCTRINES[rivalDoctrine].name}.</span></p></div>
    <section class="gap-panel panel" aria-labelledby="gap-result"><p class="eyebrow">RELATIVE PRODUCTIVITY GAP</p><h3 id="gap-result">${esc(gap.label)}</h3><div class="gap-numbers"><span><small>START</small><strong>${fmt(Math.abs(gap.start) * 100, 1)}%</strong></span><b aria-hidden="true">→</b><span><small>FINISH</small><strong>${fmt(Math.abs(gap.finish) * 100, 1)}%</strong></span></div><p class="gap-explanation">${gapSentence} ${esc(cities[0].name)}’s output per worker grew ${fmt(changes[0], 1)}%; ${esc(cities[1].name)}’s grew ${fmt(changes[1], 1)}%. ${gap.overtook ? `${esc(cities[1].name)} moved ahead in output per worker.` : 'A smaller economy can make substantial progress while still finishing below its rival.'}</p></section><details class="gap-method"><summary>How the gap is measured</summary><p class="gap-note">Relative gap = absolute output-per-worker difference divided by ${esc(cities[0].name)}’s output per worker at each date. Changes within ${fmt(B.gapTolerance * 100)} percentage points are classified as little change. Absolute output-per-worker difference: ${fmt(gap.absoluteGapStart, 1)} → ${fmt(gap.absoluteGapEnd, 1)}. Relative and absolute gaps can move differently.</p></details>
    <div class="report-cities">${cards}</div>
    <div class="report-analysis"><section class="panel chart-panel"><p class="eyebrow">WHAT HAPPENED?</p><h3>Two productivity paths</h3><div class="chart-legend">${cities.map((c, i) => `<span><i style="background:${i?'var(--mq-accent)':'var(--mq-navy)'}"></i>${esc(c.name)} ${i ? '(dashed)' : '(solid)'}</span>`).join('')}</div>${trendChart(cities, initial)}<p>More workers can raise total output. Sustained improvements in living standards depend on output per worker. Equipment has diminishing returns; skills help make continuing technological progress useful.</p></section>
    <section class="panel economics"><p class="eyebrow">WHY DID IT HAPPEN?</p><h3>Your decisions, economically</h3>${whyThisPath(player, initial.find(c => c.id === playerCity))}<p>${esc(cities[1].name)} began with catch-up potential through capital investment and technology adoption. ${esc(cities[0].name)} began nearer the frontier, where additional equipment had a smaller payoff. The investment paths determined what each opportunity became.</p></section></div>
    <section class="panel policy-connection"><p class="eyebrow">POLICY CONNECTION</p><h3>You were making growth policy.</h3><p>Your allocations represented real categories of growth policy: infrastructure and investment, resource development, education and workforce training, and support for research and technology adoption. Your total commitments were ${CATEGORIES.map(c => `${c.short.toLowerCase()}: ${player.invested[c.id]} points`).join('; ')}.</p><p>The opportunity cost was the development you could not fund at the same time. Starting conditions and earlier investments changed which policies were most valuable. This simplified model shows those tradeoffs; it does not prescribe one policy mix for every economy.</p></section>
    <details class="panel ledger"><summary>Open your round ledger</summary><div class="ledger-cities">${cities.map(c => `<div><h3>${esc(c.name)} · ${c.id === playerCity ? 'You' : 'Rival'}</h3><div class="table-scroll"><table><thead><tr><th scope="col">Round</th><th scope="col">Capital</th><th scope="col">Resources</th><th scope="col">Research</th><th scope="col">Education</th><th scope="col">Output / worker</th></tr></thead><tbody>${c.history.map(h => `<tr><th scope="row">${h.cycle}</th>${CATEGORIES.map(cat => `<td>${h.allocation[cat.id]}</td>`).join('')}<td>${fmt(h.endState.outputPerWorker, 1)}</td></tr>`).join('')}</tbody></table></div></div>`).join('')}</div></details>
    <section class="transfer panel"><p class="eyebrow">TRANSFER QUESTION</p><h3>Another economy. A new decision.</h3><p>An economy has little equipment per worker, strong schools, reliable infrastructure, and access to existing world technology. Which development opportunity would you expect to be especially valuable?</p><div class="transfer-options"><button data-answer="potential">Combine additional equipment with adoption of existing production methods.</button><button data-answer="resources">Prioritize still more basic resource capacity, even though existing infrastructure has ample room.</button><button data-answer="labor">Prioritize increasing the number of workers, while leaving their equipment and methods unchanged.</button></div><p id="transfer-feedback" role="status" hidden></p></section>
    <div class="replay-bar"><div><h3>Try again</h3><p>Start with a freshly assigned city and face a different development strategy.</p></div><button id="replay" class="primary-button">Play Again <span aria-hidden="true">↻</span></button></div>`;
}
export const TRANSFER_FEEDBACK = {
  potential: 'Scarce equipment can have high returns, while strong schools make existing technology easier to adopt. Together they offer a productivity opportunity, provided resources keep up with the new activity.',
  resources: 'Resources matter when they constrain production. With ample infrastructure, extra capacity may contribute less immediately than equipment and better methods that the skilled workforce can use.',
  labor: 'More workers can raise total output, but unchanged equipment and methods limit gains per worker. The combination of scarce capital and strong skills creates an opportunity to improve productivity instead.',
};
