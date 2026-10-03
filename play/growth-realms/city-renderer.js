export { renderCityMap, syncCityMaps, setConstructionProgress, updateMapSelection, rendererStats, assetsReady } from './map-engine.js';
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function icon(name) {
  const paths = {
    factory: '<path d="M3 20V10l6 3V8l6 4V4h5v16H3Z"/><path d="M7 17h1m4 0h1m4 0h1"/>',
    leaf: '<path d="M20 4C9 2 2 6 5 15s15 6 15-11Z"/><path d="m4 21 12-13M8 16v-5m4 1h5"/>',
    flask: '<path d="M9 3h6m-5 0v7L4 20h16l-6-10V3M7 15h10"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>',
    output: '<path d="M3 20h18M6 16v-5m6 5V7m6 9V3M3 8l6-4 5 1 6-4"/>',
    labor: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-5a6 6 0 0 1 12 0v5M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.factory}</svg>`;
}

