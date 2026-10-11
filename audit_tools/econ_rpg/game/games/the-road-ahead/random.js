export function hashSeed(value) { let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0; }
export function random(s) { s.rng=(s.rng+0x6D2B79F5)>>>0;let t=s.rng;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296; }
export function chance(s,probability,label) {const draw=random(s);s.draws.push({label,probability,draw,success:draw<probability});return draw<probability;}
export const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
