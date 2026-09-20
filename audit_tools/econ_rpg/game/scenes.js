import { matches } from './engine.js';

// Presentation only: no mutations, storage fields, events or additional game state.
export function selectScene(sceneSet, run) {
  if (!sceneSet) return null;
  if (!run?.history.length) return sceneSet.variants.find(v => v.id === sceneSet.initial);
  return sceneSet.variants.find(v => (!v.phases || v.phases.includes(run.phase)) && matches(v.when, run));
}

export function renderScene(sceneSet, run) {
  const variant = selectScene(sceneSet, run);
  if (!variant) return null;
  const figure = document.createElement('figure');
  figure.className = 'neighborhood-scene'; figure.dataset.scene = variant.id;
  const img = document.createElement('img');
  img.src = variant.src;
  img.alt = variant.alt; img.width = sceneSet.width; img.height = sceneSet.height;
  img.decoding = 'sync';
  const caption = document.createElement('figcaption');
  const state = document.createElement('strong'); state.textContent = variant.label;
  caption.append(state); figure.append(img, caption);
  return figure;
}
