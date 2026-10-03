import { iso } from './visual-config.js';

// Segment vectors determine both position and facing, including the loop closure.
// There is no free-angle rotation: two authored front/rear poses mirror into four views.
export function segmentDirection(a, b) {
  const [ax, ay] = iso(...a), [bx, by] = iso(...b);
  const dx = bx - ax, dy = by - ay;
  if (!dx && !dy) throw new Error('Route contains a stationary segment');
  return `${dy < 0 ? 'N' : 'S'}${dx < 0 ? 'W' : 'E'}`;
}
export function routeSample(route, tick) {
  const frame = ((tick % route.period) + route.period) % route.period;
  const t = frame / route.period * route.points.length;
  const segment = Math.floor(t), a = route.points[segment], b = route.points[(segment + 1) % route.points.length], f = t - segment;
  return { point: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], direction: segmentDirection(a, b), segment };
}
