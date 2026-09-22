import { productionRows } from './engine.js';

// Static SVG from the same production schedule as the truck; no network or chart dependency.
export function graphPoints(kind, tested, reveal = false) {
  return productionRows().filter(r => reveal || tested.includes(r.workers)).map(r => ({
    workers: r.workers, value: kind === 'total' ? r.output : r.added, observed: tested.includes(r.workers),
  }));
}
export function productionGraph(kind, tested, reveal = false, id = kind) {
  const points = graphPoints(kind, tested, reveal), total = kind === 'total';
  const title = total ? 'Total Product' : 'Marginal Product';
  const axis = total ? 'Tacos per Production Window' : 'Additional Tacos from One More Worker';
  const maximum = total ? 60 : 15, step = total ? 10 : 3;
  const x = worker => 52 + (worker - 1) * 76, y = value => 254 - value / maximum * 224;
  const coords = points.map(p => `${x(p.workers)},${y(p.value)}`).join(' ');
  const observedCoords = points.filter(p => p.observed).map(p => `${x(p.workers)},${y(p.value)}`).join(' ');
  const description = points.map(p => `Worker ${p.workers}: ${p.value} tacos (${p.observed ? 'observed' : 'revealed from the complete record'})`).join('; ');
  const ticks = Array.from({ length: maximum / step + 1 }, (_, i) => i * step);
  return `<figure class="production-graph" data-graph="${kind}"><h3>${title}</h3><p class="axis-label">${axis}</p>
    <svg viewBox="0 0 480 302" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${title}: workers and tacos</title><desc id="${id}-desc">${description}${total ? '' : '. Worker 3 peaks at 13. Worker 4 is the first decline at 11, still positive.'}</desc>
      ${ticks.map(n => `<line class="graph-grid" x1="52" x2="448" y1="${y(n)}" y2="${y(n)}"/><text class="graph-tick" x="40" y="${y(n) + 6}" text-anchor="end">${n}</text>`).join('')}
      <path class="graph-axis" d="M52 20 V254 H448"/>
      ${[1, 2, 3, 4, 5, 6].map(n => `<text class="graph-tick" x="${x(n)}" y="285" text-anchor="middle">${n}</text>`).join('')}
      <polyline class="graph-line ${points.some(p => !p.observed) ? 'record-line' : ''}" points="${coords}"/>
      ${points.some(p => !p.observed) ? `<polyline class="graph-line" points="${observedCoords}"/>` : ''}
      ${points.map(p => `${!total && [3, 4].includes(p.workers) ? `<circle class="graph-highlight" cx="${x(p.workers)}" cy="${y(p.value)}" r="13"/>` : ''}${p.observed ? `<circle class="graph-point" data-workers="${p.workers}" data-value="${p.value}" data-observed="true" cx="${x(p.workers)}" cy="${y(p.value)}" r="6"/>` : `<path class="revealed-point" data-workers="${p.workers}" data-value="${p.value}" data-observed="false" d="M${x(p.workers)} ${y(p.value) - 7} l7 7 -7 7 -7 -7 Z"/>`}`).join('')}
    </svg><p class="axis-label x-axis">Workers</p>
    <figcaption><span>● Observed</span>${points.some(p => !p.observed) ? '<span>◇ Revealed from complete record</span>' : ''}${!total ? '<span class="graph-key">Worker 3: peak 13 · Worker 4: first decline 11</span>' : ''}</figcaption></figure>`;
}
