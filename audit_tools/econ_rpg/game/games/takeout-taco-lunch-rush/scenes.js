import { STRESS_THRESHOLD } from './engine.js';
// Preserve the supplied filenames, including the intentional mapping of "takout" spellings.
const files = ['takout-taco-worker-0', 'takout-taco-worker-1', 'takeout-taco-worker-2', 'takout-taco-worker-3', 'takeout-taco-worker-4', 'takeout-taco-worker-5', 'takout-taco-worker-6'];
const descriptions = [
  'One worker calmly serves a customer at the green Takeout Taco truck; waiting orders are manageable.',
  'One worker handles a growing stack of orders alone inside the taco truck.',
  'Two workers share serving and food preparation in the same taco truck.',
  'Three workers divide preparation and serving tasks along the truck counter.',
  'Four workers share the same counter, grill and preparation space.',
  'Five workers prepare tacos in an increasingly crowded truck kitchen.',
  'Six workers crowd the same small kitchen while customers continue waiting outside.',
];
export const SCENES = Object.freeze(files.map((file, workers) => Object.freeze({
  src: new URL(`../../art/scenes/takeout-taco-lunch-rush/${file}.webp`, import.meta.url).href,
  alt: descriptions[workers],
})));
export const sceneIndex = state => state.workers <= 1 ? (state.backlog > STRESS_THRESHOLD ? 1 : 0) : state.workers;
export const TWO_TRUCK_SCENE = Object.freeze({
  src: new URL('../../art/scenes/takeout-taco-lunch-rush/takout-taco-worker-7.webp', import.meta.url).href,
  alt: 'Two Takeout Taco trucks operate side by side, each staffed by three workers, with customers lined up at both trucks.',
});
