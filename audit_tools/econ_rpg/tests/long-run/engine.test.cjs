const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../game/games/the-long-run');
const fixture = path.join(__dirname, 'economic-baseline.json');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const html = fs.readFileSync(process.argv[2] || path.join(root, 'index.html'), 'utf8').replaceAll('\r\n', '\n');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const prefix = source.slice(0, source.indexOf('/* 16. WORLD RENDERING'));
const suffix = source.slice(source.indexOf('function renderTimeline()')).replace(/\nrender\(\);\s*$/, '');
const context = { document: { addEventListener() {} }, matchMedia: () => ({ matches: true }), structuredClone, setTimeout };
vm.createContext(context);
vm.runInContext(prefix + suffix + '\nglobalThis.api = { years:YEARS, run:ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);return structuredClone(economy)}, profile:endingProfile, explanations:economicExplanations, transfer:transferQuestion };', context);
const api = context.api, results = {}, profiles = {};
for (let code = 0; code < 243; code++) {
  let n = code;
  const choices = api.years.map(year => { const id = year.options[n % 3].id; n = Math.floor(n / 3); return id; });
  const run = api.run(choices);
  assert.equal(run.year, 6); assert.equal(run.history.length, 6); assert.equal(run.activeEffects.length, 0);
  for (const { state: s } of run.history) {
    for (const key of ['realGDP', 'potentialGDP', 'inflation', 'unemployment', 'interestRate', 'priceLevel']) assert.ok(Number.isFinite(s[key]));
    assert.ok(Math.abs((s.adIntercept - s.srasIntercept) / 2 - s.realGDP) < 1e-8);
    assert.ok(Math.abs(s.adIntercept - s.realGDP - s.priceLevel) < 1e-8);
  }
  const profile = api.profile().name;
  profiles[profile] = (profiles[profile] || 0) + 1;
  results[choices.join('/')] = hash(JSON.stringify({ run, profile, explanations: api.explanations(), transfer: api.transfer() }));
}
const actual = { engineSource: hash(prefix), interfaceAndTimingSource: hash(suffix), paths: results, profiles };
if (process.argv[2]) { fs.writeFileSync(fixture, JSON.stringify(actual, null, 2) + '\n'); console.log('Recorded original economic baseline.'); }
else {
  assert.deepEqual(actual, JSON.parse(fs.readFileSync(fixture, 'utf8')));
  // Pure adapter: freeze the input recursively, then drive presentation for hours.
  context.window = context;
  for (const name of ['visual-state', 'sprites', 'entities']) vm.runInContext(fs.readFileSync(path.join(root, `city/${name}.js`), 'utf8'), context);
  const { adapt, VisualController, World, TUNING } = context.LongRunCity;
  const freeze = value => { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } return value; };
  const baseline = adapt(freeze(api.run([])));
  const demand = adapt(freeze(api.run(['confidence']))), supply = adapt(freeze(api.run(['energy']))), productivity = adapt(freeze(api.run(['breakthrough'])));
  assert.equal(demand.mechanism, 'demand'); assert.equal(supply.mechanism, 'supply'); assert.equal(productivity.mechanism, 'productivity');
  assert.ok(demand.current.retail > productivity.current.retail);
  assert.ok(productivity.current.factoryEfficiency > demand.current.factoryEfficiency);
  assert.ok(supply.current.freight < baseline.current.freight);
  for (const next of [demand, supply, productivity]) {
    const c = new VisualController(); c.sync(baseline, true); c.sync(next, false); c.update(.3);
    if (next === demand) { assert.ok(c.value.retail > baseline.current.retail); assert.equal(c.value.factoryOutput, baseline.current.factoryOutput); }
    if (next === supply) { assert.ok(c.value.freight < baseline.current.freight); assert.equal(c.value.retail, baseline.current.retail); }
    if (next === productivity) { assert.ok(c.value.factoryEfficiency > baseline.current.factoryEfficiency); assert.equal(c.value.labor, baseline.current.labor); }
    c.update(2); assert.deepEqual(JSON.parse(JSON.stringify(c.value)), JSON.parse(JSON.stringify(next.current)));
  }
  const w = new World(); let maxPeople = 0, maxVehicles = 0; const vehicleTypes = new Set();
  // One simulated hour, varying the actual economic mechanism every ten minutes.
  const scenes = [baseline, demand, supply, productivity];
  for (let i = 0; i < 60 * 3600; i++) {
    w.update(1 / 60, scenes[Math.floor(i / 36000) % scenes.length].current);
    maxPeople = Math.max(maxPeople, w.people.length); maxVehicles = Math.max(maxVehicles, w.vehicles.length);
    assert.ok(w.people.length <= TUNING.maxPeople); assert.ok(w.vehicles.length <= TUNING.maxVehicles);
    for (const v of w.vehicles) {
      vehicleTypes.add(v.type);
      assert.equal(v.y, TUNING.laneY[v.lane]); assert.equal(v.direction, v.lane ? -1 : 1);
      for (const b of w.vehicles) if (v.id < b.id && v.lane === b.lane) assert.ok(Math.abs(v.x - b.x) >= (v.width + b.width) / 2 + TUNING.vehicleGap - .001);
    }
  }
  assert.equal(vehicleTypes.size, 5);
  // Completed assets survive a subsequent contraction; replay produces identical memory.
  const longPath = ['breakthrough', 'fiscal-expand', 'rate-cut', 'housing-boom', 'control'];
  const before = adapt(api.run(longPath.slice(0, 4))).assets, after = adapt(api.run(longPath)).assets;
  assert.ok(after.privateWork >= before.privateWork); assert.ok(after.publicWork >= before.publicWork); assert.ok(after.capacity >= before.capacity);
  assert.deepEqual(after, adapt(api.run(longPath)).assets);
  // Motion is elapsed-time based at both display refresh rates.
  const a = new World(), b = new World(); a.staticState(baseline.current); b.staticState(baseline.current);
  for (let i = 0; i < 120; i++) a.update(1 / 60, baseline.current);
  for (let i = 0; i < 60; i++) b.update(1 / 30, baseline.current);
  assert.ok(Math.abs(a.vehicles[0].x - b.vehicles[0].x) < .001);
  console.log(JSON.stringify({ paths: 243, profiles, protectedEconomicsAndInterface: 'identical', mechanisms: 'distinct and sequenced', simulatedHours: 1, maxPeople, maxVehicles, vehicleTypes: [...vehicleTypes], memory: 'persistent', frameRateIndependence: 'passed' }, null, 2));
}
