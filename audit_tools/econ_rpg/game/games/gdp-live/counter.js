import { CONFIG } from './config.js';
import { number } from './view.js';
export function createCounter(element, motion = matchMedia('(prefers-reduced-motion: reduce)')) {
  let frame = 0, displayed = 0, target = 0, effect;
  const paint = value => { displayed = value; element.textContent = `$${number(Math.round(value))}`; };
  const finish = () => { cancelAnimationFrame(frame); effect?.cancel(); paint(target); element.dataset.animating = 'false'; };
  motion.addEventListener('change', () => { if (motion.matches) finish(); });
  return { update(value, animate = true) {
    cancelAnimationFrame(frame); effect?.cancel();
    const unchanged = value === target;
    target = value; element.dataset.target = String(value);
    element.parentElement.setAttribute('aria-label', `Simulated GDP: ${number(value)} billion`);
    if (!animate || motion.matches || unchanged) { finish(); return; }
    const from = displayed, start = performance.now(), direction = value > from ? 1 : -1;
    element.dataset.direction = direction > 0 ? 'up' : 'down'; element.dataset.animating = 'true';
    effect = element.animate([{ transform: `translateY(${direction * 9}px)`, opacity: .6 }, { transform: 'translateY(0)', opacity: 1 }], { duration: CONFIG.animationMs });
    const tick = now => { const progress = Math.min(1, (now - start) / CONFIG.animationMs); paint(from + (value - from) * (1 - (1 - progress) ** 3)); if (progress < 1) frame = requestAnimationFrame(tick); else finish(); };
    frame = requestAnimationFrame(tick);
  } };
}
