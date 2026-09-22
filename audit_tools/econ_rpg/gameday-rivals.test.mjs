import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import scenario from './game/scenarios/gameday-rivals.js';
import { scenarios,scenarioFor } from './game/scenarios/registry.js';
import { createSeason,commitRival,revealRound,nextRound } from './game/gameday-rivals-engine.js';
import { SAVE_KEY,saveSeason,loadSeason,clearSeason } from './game/gameday-rivals-storage.js';
import { ACTIONS,BASE_PAYOFFS,roundPayoff,nextShares,classifySeason,CLASSIFICATIONS,mutualStandardCounterfactual } from './game/scenarios/gameday-rivals-market.js';
import { chooseRivalAction,aggressionProbability,seededRandom } from './game/scenarios/gameday-rivals-rival.js';
import { slots,roadZones,crosswalks,footprint,pointInPolygon,activityFor,sceneFor } from './game/scenarios/gameday-rivals-scenes.js';
import { audit,simulate } from './gameday-rivals-qa.mjs';
import { enumerate } from './qa.mjs';
const data=audit();
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};

test('all 64 player histories × 32 seeds produce exactly 2,048 reproducible six-round seasons',()=>{
  assert.equal(scenario.rounds.length,6);assert.deepEqual(scenario.actions.map(a=>a.id),ACTIONS);
  assert.equal(data.seasons.length,2048);assert.equal(new Set(scenario.rounds.map(r=>r.key)).size,6);
  for(const row of data.seasons) {
    assert.deepEqual(simulate(row.run.seed,row.sequence),row);
    assert.equal(row.run.history.length,6);assert.equal(row.run.phase,'debrief');assert.equal(row.run.completed,true);
    for(const [index,h] of row.run.history.entries()){assert.equal(h.roundIndex,index);assert.equal(h.roundKey,scenario.rounds[index].key);}
    assert.throws(()=>revealRound(row.run,'standard',{}));
  }
});
test('simultaneity: pre-round commitment receives only completed history and safe context; current actions cannot influence it',()=>{
  for(const {phases} of data.seasons) for(const before of phases.filter(r=>r.phase==='observe')) {
    const snapshot=JSON.stringify(before);
    const commitment=commitRival(before,(history,context,rng)=>{
      assert.equal(history.length,before.roundIndex);
      assert.deepEqual(Object.keys(context).sort(),['key','pressure','roundIndex']);
      for(const h of history)assert.deepEqual(Object.keys(h).sort(),['playerAction','rivalAction']);
      assert.ok(Object.isFrozen(history)&&Object.isFrozen(context));
      return chooseRivalAction(history,context,rng);
    });
    const standard=revealRound(before,'standard',commitment),aggressive=revealRound(before,'aggressive',commitment);
    assert.equal(standard.rivalCurrentChoice,aggressive.rivalCurrentChoice);assert.equal(standard.rivalCurrentChoice,commitment.action);
    assert.equal(JSON.stringify(before),snapshot);assert.equal(before.rivalCurrentChoice,null);
    assert.equal(standard.history.length,before.history.length+1);assert.throws(()=>revealRound(standard,'standard',commitment));
  }
  const rivalSource=readFileSync(new URL('./game/scenarios/gameday-rivals-rival.js',import.meta.url),'utf8');
  assert.doesNotMatch(rivalSource,/Math\.random|document\.|window\.|currentChoice|currentPayoff/);
});
test('rival probability responds to past behavior, forgives restraint and remains uncertain; PRNG has a stable sequence',()=>{
  const round=scenario.rounds[0];
  assert.equal(aggressionProbability([],round),.26);
  assert.ok(aggressionProbability([{playerAction:'aggressive'}],round)>.26);
  assert.ok(aggressionProbability([{playerAction:'standard'},{playerAction:'standard'}],round)<.26);
  for(const {run} of data.seasons)for(let i=0;i<6;i++){const p=aggressionProbability(run.history.slice(0,i),scenario.rounds[i]);assert.ok(p>=.10&&p<=.85);}
  const a=seededRandom(42),b=seededRandom(42);for(let i=0;i<50;i++){const x=a();assert.equal(x,b());assert.ok(x>=0&&x<1);}
  assert.notEqual(seededRandom(42)(),seededRandom(43)());
  const initial=new Set(data.seasons.filter(r=>r.sequence.every(a=>a==='standard')).map(r=>r.run.history[0].rivalAction));assert.equal(initial.size,2);
});
test('one canonical matrix preserves T > R > P > S each round with exact dollar math and the largest final stakes',()=>{
  assert.deepEqual(BASE_PAYOFFS,{'standard/standard':[100000,100000],'aggressive/standard':[155000,45000],'standard/aggressive':[45000,155000],'aggressive/aggressive':[70000,70000]});
  assert.deepEqual(scenario.rounds.map(r=>r.multiplier),[1.15,.80,1,1.25,1.35,1.50]);
  for(const r of scenario.rounds){const T=roundPayoff('aggressive','standard',r.multiplier).player,R=roundPayoff('standard','standard',r.multiplier).player,P=roundPayoff('aggressive','aggressive',r.multiplier).player,S=roundPayoff('standard','aggressive',r.multiplier).player;assert.ok(T>R&&R>P&&P>S);}
  assert.equal(roundPayoff('aggressive','standard',1.5).player,232500);
  for(const {run} of data.seasons) {
    let player=0,rival=0;
    for(const h of run.history){const base=BASE_PAYOFFS[`${h.playerAction}/${h.rivalAction}`],factor=Math.round(scenario.rounds[h.roundIndex].multiplier*100);
      assert.equal(h.playerProfit,base[0]*factor/100);assert.equal(h.rivalProfit,base[1]*factor/100);assert.equal(h.industryProfit,h.playerProfit+h.rivalProfit);player+=h.playerProfit;rival+=h.rivalProfit;}
    assert.equal(run.playerSeasonProfit,player);assert.equal(run.rivalSeasonProfit,rival);assert.equal(run.industrySeasonProfit,player+rival);
    assert.ok(player+rival<=mutualStandardCounterfactual(scenario.rounds));
  }
  assert.equal(mutualStandardCounterfactual(scenario.rounds),1410000);
});
test('share begins 50/50, stays bounded and complementary, and never changes the profit payoff',()=>{
  assert.deepEqual([createSeason().playerShare,createSeason().rivalShare],[50,50]);
  for(const {run} of data.seasons)for(const h of run.history){assert.equal(h.playerShare+h.rivalShare,100);assert.ok(h.playerShare>=25&&h.playerShare<=75);const movement=h.playerAction===h.rivalAction?0:h.playerAction==='aggressive'?6:-6;assert.equal(h.playerShare,Math.max(25,Math.min(75,h.playerShareBefore+movement)));assert.equal(h.playerShareChange,h.playerShare-h.playerShareBefore);assert.equal(h.rivalShareChange+h.playerShareChange,0);}
  assert.equal(nextShares(74,'aggressive','standard').playerChange,1);assert.equal(nextShares(26,'standard','aggressive').playerChange,-1);
});
test('completed reveal saves replay exactly; resume advances once; reset clears only this versioned key',()=>{
  const storage=memory();for(const s of Object.values(scenarios).filter(s=>s.id!==scenario.id))storage.setItem(`mq.econ-rpg.${s.id}`,`preserve-${s.id}`);
  assert.equal(saveSeason(storage,createSeason()),false);
  for(const {phases} of data.seasons)for(const run of phases.filter(r=>r.phase==='reveal')) {assert.equal(saveSeason(storage,run),true);const restored=loadSeason(storage);assert.equal(restored.reason,null);assert.deepEqual(restored.run,nextRound(run));assert.equal(restored.run.playerSeasonProfit,run.playerSeasonProfit);assert.equal(restored.run.seed,run.seed);}
  const good=simulate(0,Array(6).fill('standard')).phases.find(r=>r.phase==='reveal');
  saveSeason(storage,{...good,playerSeasonProfit:999});assert.equal(loadSeason(storage).reason,'unavailable');
  saveSeason(storage,{...good,scenarioVersion:2});assert.equal(loadSeason(storage).reason,'version');
  clearSeason(storage);assert.equal(storage.getItem(SAVE_KEY),null);
  for(const s of Object.values(scenarios).filter(s=>s.id!==scenario.id))assert.equal(storage.getItem(`mq.econ-rpg.${s.id}`),`preserve-${s.id}`);
  const fresh=createSeason();assert.notEqual(fresh.runID,good.runID);assert.equal(fresh.history.length,0);assert.equal(fresh.playerSeasonProfit,0);assert.equal(fresh.playerCurrentChoice,null);assert.equal(fresh.classification,null);
});
test('all six classifications are deterministic with explicit precedence and reachable witnesses',()=>{
  assert.deepEqual(data.summary.classifications,{'promotion-war':338,'retaliation-cycle':647,'opportunistic-season':535,'stable-competition':161,'market-share-chase':48,'uneasy-restraint':319});
  for(const {run} of data.seasons){assert.equal(classifySeason(run.history),run.classification);assert.equal(CLASSIFICATIONS.filter(c=>c.id===run.classification).length,1);}
  assert.equal(data.representatives.length>=8,true);
});
test('all six distinct round images exist unchanged; only Game 6 is night, with no fallback for a missing scene',()=>{
  const assets=JSON.parse(readFileSync(new URL('./art/gameday-rivals-assets.json',import.meta.url),'utf8'));assert.equal(assets.length,12);
  for(const a of assets){const bytes=readFileSync(new URL(a.path,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.equal(a.width,1448);assert.equal(a.height,1086);}
  for(let i=0;i<6;i++){const scene=sceneFor(scenario,i);assert.equal(scene.night,i===5);assert.equal(/night/.test(scene.src),i===5);assert.ok(existsSync(new URL(`./game/${scene.src.slice(2)}`,import.meta.url)));}
  assert.throws(()=>sceneFor(scenario,6));
  // Absence is surfaced explicitly in the QA report, not hidden by substituting a round image.
  for(const missing of data.summary.missingReference)assert.equal(existsSync(new URL(missing,import.meta.url)),false);
});
test('all four activity states use fixed safe road footprints, consistent colors/marks and opposing lane orientations',()=>{
  const road=[[0,490],[1025,804],[658,1018],[0,710]];
  for(const slot of slots){const zone=roadZones[slot.lane];assert.equal(slot.direction,zone.direction);assert.equal(slot.rotation,zone.rotation);assert.ok(['car','moped'].includes(slot.type));
    for(const point of footprint(slot)){assert.ok(pointInPolygon(point,zone.polygon),`slot ${slot.id} within lane`);assert.ok(pointInPolygon(point,road),`slot ${slot.id} on road`);for(const crossing of crosswalks)assert.equal(pointInPolygon(point,crossing),false);}}
  assert.equal(Math.abs(roadZones.northwest.rotation-roadZones.southeast.rotation),180);
  const ids=new Set();
  for(const player of ACTIONS)for(const rival of ACTIONS){const activity=activityFor(player,rival);ids.add(activity.id);assert.deepEqual(activityFor(player,rival),activity);assert.equal(activity.player,player==='aggressive'?4:2);assert.equal(activity.rival,rival==='aggressive'?4:2);assert.equal(new Set(activity.units.map(u=>u.id)).size,activity.units.length);for(const unit of activity.units){assert.ok(slots.some(s=>s.id===unit.id&&s.x===unit.x&&s.y===unit.y));assert.equal(scenario.firms[unit.firm].mark,unit.firm==='player'?'P':'R');}}
  assert.equal(ids.size,4);assert.equal(activityFor(null,null).units.length,0);
});
test('private registry routes the fifth game while all earlier scenarios preserve full frozen behavior',()=>{
  assert.equal(scenarioFor('?scenario=gameday-rivals'),scenario);assert.equal(scenarioFor(''),scenarios['housing-crisis']);assert.equal(scenarioFor('?scenario=constructor'),scenarios['housing-crisis']);
  const hashes={'housing-crisis':'f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e','main-attraction':'e9bb3c77ba9f57acc27b1d49a442e911526a761a70fe1bc51b072e40122561ad',ppf:'3fd6ef7143484f891e64470ef384a8dde4174408426cd39f692fa1f45b550b3a','megastar-mania':'159c41396c164eb675935898b4e944fbc340c35dc6e07e1ce0f5329974d70532'};
  for(const [id,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(enumerate(scenarios[id]).complete)).digest('hex'),hash);
  execFileSync('git',['diff','--exit-code','HEAD','--',...['engine.js','storage.js','rpg.js','rpg.css','ui.js','scenes.js','scenarios/housing-crisis.js','scenarios/main-attraction.js','scenarios/ppf.js','scenarios/megastar-mania.js'].map(f=>`audit_tools/econ_rpg/game/${f}`)],{stdio:'pipe'});
});
