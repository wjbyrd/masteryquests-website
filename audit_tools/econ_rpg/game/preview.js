import { scenarioFor } from './scenarios/registry.js';
const scenario = scenarioFor(window.location.search);
if (scenario.kind === 'repeated-strategy') {
  const { mount } = await import('./gameday-rivals-app.js');
  mount(scenario);
} else {
  await import('./rpg.js');
}
