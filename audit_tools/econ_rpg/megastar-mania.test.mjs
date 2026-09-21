import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import scenario from './game/scenarios/megastar-mania.js';
import housing from './game/scenarios/housing-crisis.js';
import attraction from './game/scenarios/main-attraction.js';
import ppf from './game/scenarios/ppf.js';
import { createRun, decide, matches, validateScenario } from './game/engine.js';
import { loadRun, saveRun, clearRun, storageKey } from './game/storage.js';
import { selectScene } from './game/scenes.js';
import { scenarios, scenarioFor } from './game/scenarios/registry.js';
import { ticketMarket } from './game/scenarios/megastar-mania-market.js';
import { marketReading, indicatorValue, announceChanges } from './game/ui.js';
import { enumerate } from './qa.mjs';
import { coverage, trace } from './megastar-mania-qa.mjs';
const data = coverage();
const rows = data.result.complete.map(run => trace(run.history.map(h => h.choiceID)));
const clamp = n => Math.min(8, Math.max(0, n));
// An independent QA oracle: preference strength alone does not diagnose market balance.
function expectedMarket(run) {
  const first = run.history[0]?.choiceID, second = run.history[1]?.choiceID;
  const wanted = clamp(run.state.demand + ({premium:-2,moderate:0,introductory:1}[first] ?? 0) + ({keep:0,moderate:-1,aggressive:-3}[second] ?? 0));
  return { wanted, supply: run.state.supply, sold: Math.min(wanted, run.state.supply), status: wanted > run.state.supply ? 'shortage' : wanted < run.state.supply ? 'surplus' : 'balanced' };
}
const memory = () => { const map = new Map(); return { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,v), removeItem: k => map.delete(k) }; };

test('Megastar schema and all 729 six-decision paths cover every node, choice, conditional outcome, scene and ending', () => {
  assert.equal(validateScenario(scenario), true); assert.equal(scenario.version, 1); assert.equal(scenario.title, 'Megastar Mania'); assert.equal(scenario.subtitle, undefined);
  assert.equal(Object.keys(scenario.state).length, 5); assert.equal(data.result.complete.length, 729);
  assert.deepEqual(data.result.unreachableNodes, []); assert.deepEqual(data.result.unreachableEndings, []);
  assert.equal(data.result.nodes.length, 7); assert.equal(data.result.choices.length, 21);
  assert.deepEqual(data.summary.endings, {reputation:162,'too-big':147,crossover:141,'sold-out':202,built:47,intimate:12,niche:18});
  assert.deepEqual([...data.summary.scenes].sort(), ['baseline','demand-boom','demand-drop','expanded-tour','shortage','supply-shock','surplus']);
  const review = new Set(data.selected.flatMap(row => row.features));
  for (const row of rows) {
    assert.equal(row.run.history.length, 6);
    for (const feature of row.features) assert.ok(review.has(feature), feature);
    for (const phase of row.phases) for (const value of Object.values(phase.state)) assert.ok(Number.isInteger(value) && value >= 0 && value <= 8);
  }
  for (const node of scenario.nodes) assert.ok(node.choices.length >= 2 && node.choices.length <= 3);
});

test('Prices affect quantity demanded; audience shocks affect demand; dates and cancellations affect supply only', () => {
  for (const row of rows) {
    const h = row.run.history;
    assert.equal(h[0].before.demand, h[0].after.demand); assert.equal(h[0].before.supply, h[0].after.supply);
    assert.equal(h[1].after.demand, h[1].before.demand + 3); assert.equal(h[1].after.supply, h[1].before.supply);
    assert.equal(h[2].after.demand, h[2].before.demand);
    assert.equal(h[2].after.supply - h[2].before.supply, {dates:3,venues:2,limited:0}[h[2].choiceID]);
    assert.equal(h[3].after.demand, h[3].before.demand); assert.ok(h[3].after.supply < h[3].before.supply);
    assert.ok(h[3].after.supply > 0); assert.match(h[3].consequence, /closed|dark/); assert.match(h[3].consequence, /no audience|no waiting audience|empty/);
    assert.equal(h[4].after.supply, h[4].before.supply); assert.ok(h[4].after.demand < h[4].before.demand);
    assert.equal(h[5].after.supply, h[5].before.supply);
    assert.equal(h[5].after.demand, clamp(h[5].before.demand + {original:0,experiment:2,full:3}[h[5].choiceID]));
  }
  const openings = ['premium','moderate','introductory'].map(id => expectedMarket(decide(scenario, createRun(scenario), id)).status);
  assert.deepEqual(openings, ['surplus','balanced','shortage']);
});

test('Every conditional consequence matches exactly one outcome; receipts follow sales at unchanged prices; resale requires shortage', () => {
  const statusesAfterDrop = new Set();
  for (const row of rows) for (let index = 0; index < 6; index++) {
    const before = row.phases[index*2], after = row.phases[index*2+1], entry = after.history.at(-1);
    const choice = scenario.nodes.find(n => n.id === before.nodeID).choices.find(c => c.id === entry.choiceID);
    if (choice.outcomes) assert.equal(choice.outcomes.filter(o => matches(o.when, before)).length, 1);
    assert.deepEqual(ticketMarket(after), expectedMarket(after));
    const market = expectedMarket(after);
    if (/resale offers|resellers/.test(entry.consequence)) assert.equal(market.status, 'shortage');
    if (/Empty seats|empty seats|rows of empty/.test(entry.consequence)) assert.equal(market.status, 'surplus');
    if (index === 2 || index >= 4) {
      const salesChange = Math.sign(market.sold - expectedMarket(before).sold);
      assert.equal(after.state.revenue, clamp(before.state.revenue + salesChange));
      if (salesChange === 0) assert.match(entry.consequence, /receipts do not rise or fall/);
    }
    if (index === 4) statusesAfterDrop.add(market.status);
  }
  assert.deepEqual([...statusesAfterDrop].sort(), ['balanced','shortage','surplus']);
});

test('Scene sequencing shows added dates immediately in every market, then returns to deterministic market art', () => {
  const expansionMarkets = new Set();
  for (const row of rows) for (const run of row.phases) {
    const snapshot = JSON.stringify(run), scene = selectScene(scenario.sceneSet, run), market = expectedMarket(run);
    assert.equal(JSON.stringify(run), snapshot);
    assert.deepEqual(selectScene(scenario.sceneSet, JSON.parse(snapshot)), scene);
    if (scene.id === 'supply-shock') { assert.equal(run.phase, 'consequence'); assert.equal(run.history.at(-1).nodeID, 'illness'); }
    if (run.phase === 'consequence' && run.history.at(-1).nodeID === 'illness') assert.equal(scene.id, 'supply-shock');
    if (run.phase === 'decision' && run.nodeID === 'publicity') assert.notEqual(scene.id, 'supply-shock');
    if (['surplus','demand-drop'].includes(scene.id)) assert.equal(market.status, 'surplus');
    if (scene.id === 'shortage') assert.equal(market.status, 'shortage');
    if (scene.id === 'demand-boom') { assert.ok(market.wanted >= market.supply); assert.ok(run.state.demand >= 6); assert.ok(['experiment','full'].includes(run.history.at(-1).choiceID)); }
    const addedDates = run.phase === 'consequence' && run.history.at(-1)?.nodeID === 'expansion' && run.history.at(-1).choiceID === 'dates';
    assert.equal(scene.id === 'expanded-tour', addedDates);
    if (addedDates) expansionMarkets.add(market.status);
    if (run.phase === 'decision' && run.nodeID === 'illness') assert.equal(scene.id, market.status === 'balanced' ? 'baseline' : market.status);
    if (scene.id === 'baseline') assert.equal(market.status, 'balanced');
  }
  assert.deepEqual([...expansionMarkets].sort(), ['balanced','shortage','surplus']);
});

test('Ending distinctions fit the market and no route maximizes every indicator', () => {
  const maxima = Object.fromEntries(Object.keys(scenario.state).map(k => [k, Math.max(...rows.map(r => r.run.state[k]))]));
  assert.ok(!rows.some(r => Object.entries(maxima).every(([k,v]) => r.run.state[k] === v)));
  for (const {run} of rows) {
    const market = expectedMarket(run);
    if (run.endingID === 'too-big') { assert.equal(market.status, 'surplus'); assert.ok(['dates','venues'].includes(run.history[2].choiceID)); }
    if (run.endingID === 'built') assert.equal(market.status, 'balanced');
    if (run.endingID === 'sold-out') assert.equal(market.status, 'shortage');
    if (run.endingID === 'reputation') assert.ok(run.state.demand <= 4);
    if (run.endingID === 'crossover') { assert.equal(run.history[5].choiceID, 'full'); assert.ok(run.state.demand >= 7); }
    if (run.endingID === 'intimate') { assert.equal(run.history[2].choiceID, 'limited'); assert.ok(run.state.demand >= 6); assert.notEqual(market.status, 'shortage'); }
    if (run.endingID === 'niche') { assert.equal(run.history[2].choiceID, 'limited'); assert.ok(run.state.demand < 6); assert.notEqual(market.status, 'shortage'); }
  }
});

test('Compared with cc9dd579, only twelve final ending IDs change; all choices, consequences, state and other endings stay identical', async () => {
  const committed = execFileSync('git',['show','cc9dd5791c79655157cc0ea3f47719601244578b:audit_tools/econ_rpg/game/scenarios/megastar-mania.js'],{encoding:'utf8'});
  const source = committed.replace(/from '(\.\/[^']+)'/g, (_, relative) => `from '${new URL(relative, pathToFileURL(`${process.cwd()}/audit_tools/econ_rpg/game/scenarios/megastar-mania.js`)).href}'`);
  const previous = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
  const mechanics = s => ({...s,endings:undefined,marketIndicator:undefined,state:Object.fromEntries(Object.entries(s.state).map(([id,spec]) => [id,{...spec,label:undefined,short:undefined,display:undefined}]))});
  assert.deepEqual(mechanics(scenario), mechanics(previous));
  const oldRuns = enumerate(previous).complete, storage = memory();
  let changed = 0;
  for (const [i, run] of data.result.complete.entries()) {
    const old = oldRuns[i];
    assert.deepEqual({...run,endingID:null}, {...old,endingID:null});
    saveRun(storage,scenario,old);
    if (run.endingID !== old.endingID) {
      changed++; assert.equal(old.endingID,'niche'); assert.equal(run.endingID,'intimate');
      assert.equal(loadRun(storage,scenario).reason,'unavailable');
    } else assert.deepEqual(loadRun(storage,scenario).run,old);
  }
  assert.equal(changed,12);
});

test('All 9,477 phases resume exactly, with four isolated save keys and safe rejection of corrupt saves', () => {
  const storage = memory(), older = [housing, attraction, ppf].map(s => { const r = createRun(s); saveRun(storage,s,r); return [s,r]; });
  for (const row of rows) for (const phase of row.phases) { saveRun(storage,scenario,phase); assert.deepEqual(loadRun(storage,scenario).run,phase); }
  clearRun(storage,scenario); assert.equal(loadRun(storage,scenario).run,null);
  for (const [s,r] of older) assert.deepEqual(loadRun(storage,s).run,r);
  assert.equal(new Set(Object.values(scenarios).map(storageKey)).size,4);
  const fresh = createRun(scenario); assert.notEqual(fresh.runID,createRun(scenario).runID);
  saveRun(storage,scenario,{...fresh,scenarioVersion:2}); assert.equal(loadRun(storage,scenario).reason,'version');
  saveRun(storage,scenario,{...fresh,state:{...fresh.state,supply:8}}); assert.equal(loadRun(storage,scenario).reason,'unavailable');
  for (const s of Object.values(scenarios)) assert.equal(scenarioFor(`?scenario=${s.id}`),s);
  for (const query of ['', '?scenario=unknown','?scenario=constructor']) assert.equal(scenarioFor(query),housing);
});

test('All fourteen approved art files retain supplied bytes and dimensions in the canonical private folders', () => {
  const assets = JSON.parse(readFileSync(new URL('./art/megastar-mania-assets.json',import.meta.url),'utf8'));
  assert.equal(assets.length,14);
  for (const item of assets) {
    const bytes = readFileSync(new URL(item.path,import.meta.url));
    assert.equal(bytes.length,item.bytes); assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.equal(item.width,1448); assert.equal(item.height,1086);
    assert.ok(item.path.startsWith(item.path.endsWith('.png') ? 'art/source/megastar-mania/' : 'game/art/scenes/megastar-mania/'));
  }
  for (const scene of scenario.sceneSet.variants) { assert.equal(scene.src,`./art/scenes/megastar-mania/${scene.id}.webp`); assert.ok(scene.alt.length > 100); }
});

test('All four scenarios preserve their entire frozen path behavior; engine, storage and earlier scenario data stay unchanged', () => {
  const hash = s => createHash('sha256').update(JSON.stringify(enumerate(s).complete)).digest('hex');
  assert.equal(hash(housing),'f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e');
  assert.equal(hash(attraction),'e9bb3c77ba9f57acc27b1d49a442e911526a761a70fe1bc51b072e40122561ad');
  assert.equal(hash(ppf),'3fd6ef7143484f891e64470ef384a8dde4174408426cd39f692fa1f45b550b3a');
  assert.equal(hash(scenario),'159c41396c164eb675935898b4e944fbc340c35dc6e07e1ce0f5329974d70532');
  execFileSync('git',['diff','--exit-code','HEAD','--',...['engine.js','storage.js','scenes.js','scenarios/housing-crisis.js','scenarios/housing-scenes.js','scenarios/main-attraction.js','scenarios/main-attraction-scenes.js','scenarios/ppf.js','scenarios/ppf-scenes.js'].map(f => `audit_tools/econ_rpg/game/${f}`)],{stdio:'pipe'});
});

test('The qualitative panel and derived gauge are deterministic across all phases without suggesting raw interest minus capacity', () => {
  assert.equal(scenario.state.demand.label,'Fan Interest');
  assert.equal(marketReading(scenario,createRun(scenario)),null);
  for (const row of rows) for (const run of row.phases) {
    const snapshot = JSON.stringify(run), reading = marketReading(scenario,run);
    assert.deepEqual(marketReading(scenario,JSON.parse(snapshot)),reading);
    if (run.history.length) {
      assert.equal(reading.id,expectedMarket(run).status);
      assert.equal(reading.position,{shortage:-1,balanced:0,surplus:1}[reading.id]);
      assert.equal(scenario.marketIndicator.variants.filter(v => matches(v.when,run)).length,1);
      const announcement = announceChanges(scenario,run);
      assert.doesNotMatch(announcement,/\.\./);
      assert.ok(announcement.includes(`Ticket Market: ${reading.label} at the posted price`));
      assert.doesNotMatch(announcement, /(?:Fan Interest|Ticket Supply) (?:increased|decreased) to \d/);
    }
    for (const id of ['demand','supply']) {
      assert.ok(indicatorValue(scenario.state[id],run.state[id]).length);
      assert.doesNotMatch(indicatorValue(scenario.state[id],run.state[id]),/\d/);
    }
    assert.equal(JSON.stringify(run),snapshot);
  }
  const identicalRaw = [['premium','aggressive'],['moderate','keep'],['introductory','keep']].map(prices => trace([...prices,'dates']).run);
  for (const run of identicalRaw) assert.deepEqual([run.state.demand,run.state.supply],[7,7]);
  assert.deepEqual(identicalRaw.map(run => marketReading(scenario,run).id),['surplus','balanced','shortage']);
  for (const s of [housing,attraction,ppf]) {
    assert.equal(s.marketIndicator,undefined);
    assert.ok(Object.values(s.state).every(spec => spec.display === undefined));
    const run = decide(s,createRun(s),s.nodes.find(n => n.id === s.start).choices[0].id), entry=run.history.at(-1);
    const previousAnnouncement = Object.keys(s.state).filter(k => entry.before[k] !== entry.after[k]).map(k => `${s.state[k].label} ${entry.after[k] > entry.before[k] ? 'increased' : 'decreased'} to ${entry.after[k]} of ${s.state[k].max}`).join('. ') || 'Indicators held steady.';
    assert.equal(announceChanges(s,run),previousAnnouncement);
  }
});
