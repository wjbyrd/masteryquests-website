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
  img.src = `${sceneSet.asset}#${variant.id}`;
  img.alt = variant.alt; img.width = 1000; img.height = 610;
  img.decoding = 'sync';
  const caption = document.createElement('figcaption');
  const name = document.createElement('span'); name.textContent = sceneSet.label;
  const state = document.createElement('strong'); state.textContent = variant.label;
  caption.append(name, state); figure.append(img, caption);
  return figure;
}
