import housing from './housing-crisis.js';
import attraction from './main-attraction.js';
import ppf from './ppf.js';
import megastar from './megastar-mania.js';
import gameday from './gameday-rivals.js';

export const scenarios = Object.freeze({ [housing.id]: housing, [attraction.id]: attraction, [ppf.id]: ppf, [megastar.id]: megastar, [gameday.id]: gameday });
// Private development routing only. Unknown or absent IDs preserve the existing default.
export const scenarioFor = search => {
  const id = new URLSearchParams(search).get('scenario');
  return Object.hasOwn(scenarios, id) ? scenarios[id] : housing;
};
