import housing from './housing-crisis.js';
import attraction from './main-attraction.js';

export const scenarios = Object.freeze({ [housing.id]: housing, [attraction.id]: attraction });
// Private development routing only. Unknown or absent IDs preserve the existing default.
export const scenarioFor = search => {
  const id = new URLSearchParams(search).get('scenario');
  return Object.hasOwn(scenarios, id) ? scenarios[id] : housing;
};
