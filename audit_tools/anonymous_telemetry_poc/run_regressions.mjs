import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { PHASE, reconstructRun, validateEnvelope } from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
import worker from '../../server/anonymous-telemetry-poc/worker.mjs';
const repo = path.resolve(process.argv[2] || '.');
const read = p => fs.readFileSync(path.join(repo,p),'utf8');
const results = [];
async function check(name, fn) { try { await fn(); results.push({name,status:'PASS'}); } catch(e) { results.push({name,status:'FAIL',detail:e.stack}); } }
function client(storage = new Map()) {
  const listeners = {}, timers = new Map(), nodes = new Map(); let timer = 0;
  const node = () => ({style:{},open:false,addEventListener(type,fn){this[type]=fn;},querySelector(key){return this[key] ||= {textContent:''};}});
  const context = vm.createContext({crypto:webcrypto, URLSearchParams, location:{search:'?telemetryDebug=1&telemetrySynthetic=1'},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
    document:{currentScript:{dataset:{gameId:'cost-directive'}},documentElement:{dataset:{}},visibilityState:'visible',
      querySelector:()=>null,getElementById:id=>nodes.get(id),createElement:node,body:{appendChild(n){nodes.set(n.id,n);}},
      addEventListener(type,fn){listeners[type]=fn;}},
    setTimeout:(fn,delay)=>{timers.set(++timer,{fn,delay});return timer;},clearTimeout:id=>timers.delete(id),
    addEventListener:(type,fn)=>listeners[type]=fn,
    fetch:async (_url,options)=>({ok:true,status:202,json:async()=>{const events=JSON.parse(options.body).events;return {accepted:events.length,acknowledgedEventIds:events.map(e=>e.eventId)};}})
  });
  vm.runInContext(`window=globalThis; var room=30, currentQuestion={id:4004,type:'application',tag:'old',difficulty:'hard'}, streak=24, totalAttempts=90, correctAnswers=70, scoreAttackScore=500, gameMode='standard', remediationState={active:true,stage:'retest'}, masteryState={};
    var ARTIFACT_STORAGE_KEYS={compass:'vaultCompass'};
    function getElapsedTimeMs(){return 50000;}
    function sendGameData(){} function displayQuestion(){} function showMasteryReportScreen(){}
    function startGame(){sendGameData({event:'start',runID:'new-source'});}
    function startNewRun(){startGame();}`,context);
  vm.runInContext(read('play/managerial-directorate-telemetry-poc/telemetry-client.js'),context);
  return {context,storage,listeners,nodes,api:context.AnonymousTelemetryPOC,
    run:code=>vm.runInContext(code,context),
    tick(){for(const [id,t] of [...timers]) if(t.delay===0){timers.delete(id);t.fn();}},
    events(){return JSON.parse(JSON.stringify(context.AnonymousTelemetryPOC.getQueue()));}};
}
let c;
await check('A stale question/room and streak cannot enter fresh Standard lifecycle events',()=>{
  c=client(); c.run(`startNewRun()`);
  const events=c.events(); assert.equal(events.length,2);
  for(const event of events){assert.equal(event.position,0);assert.equal(event.questionId,'');assert.equal(event.streak,0);assert.equal(event.masteryAttempts,0);assert.equal(event.score,0);assert.equal(event.retestStage,'');assert.equal(event.elapsedTimeMs,0);}
  assert.equal(reconstructRun(events).maxStreak,0);
  c.run(`room=1; streak=0; totalAttempts=0; correctAnswers=0; remediationState={active:false}; currentQuestion={id:9017}; displayQuestion()`);c.tick();
  assert.equal(c.events().find(e=>e.eventType==='question_shown').questionId,'9017');
});
await check('B same source resumes with same UUID/sequence/streak and no mode_selected',()=>{
  const originalId=c.api.getRunId(), prior=c.events().at(-1).sequenceNumber;
  const resumed=client(c.storage); resumed.run(`streak=7; sendGameData({event:'resume',runID:'new-source'})`);
  const event=resumed.events().at(-1);assert.equal(event.eventType,'run_resumed');assert.equal(event.runId,originalId);assert.equal(event.sequenceNumber,prior+1);assert.equal(event.streak,7);
  assert.equal(resumed.events().filter(e=>e.eventType==='mode_selected').length,1);
});
for(const order of [['pagehide','hidden'],['hidden','pagehide']]) await check('B pause deduplication '+order.join(' then '),()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'pauses'})`);
  for(const event of order){if(event==='hidden'){h.context.document.visibilityState='hidden';h.listeners.visibilitychange();}else h.listeners.pagehide();}
  assert.equal(h.events().filter(e=>e.eventType==='run_paused').length,1);
  h.context.document.visibilityState='visible';h.listeners.visibilitychange();
  h.context.document.visibilityState='hidden';h.listeners.visibilitychange();
  assert.equal(h.events().filter(e=>e.eventType==='run_paused').length,2);
  assert.ok(h.events().filter(e=>e.eventType==='run_paused').every(e=>e.completionStatus===''&&e.lifecycleReason));
});
await check('B BFCache restore allows a subsequent legitimate pagehide pause',()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'bfcache'})`);h.listeners.pagehide();h.listeners.pageshow({persisted:true});h.listeners.pagehide();
  assert.equal(h.events().filter(e=>e.eventType==='run_paused').length,2);
});
await check('C adapter records exactly one repair/bridge/retest trigger for stage transitions',()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'adaptive'}); room=1; streak=0;`);
  for(const stage of ['repair','repair','bridge','retest']){h.run(`remediationState={active:true,stage:'${stage}'};displayQuestion()`);h.tick();}
  const r=reconstructRun(h.events());assert.deepEqual([r.remediationDetours,r.bridgeTriggers,r.retestTriggers],[1,1,1]);
});
await check('D artifact awards distinguish new ownership, repeat grants and prior-run vault state',()=>{
  const h=client();h.storage.set('vaultCompass','true');h.run(`startNewRun();sendGameData({event:'artifact_unlocked',artifact:'compass',artifactName:'Compass',artifactSource:'checkpoint',artifactAlreadyOwned:true,room:10});`);
  let r=reconstructRun(h.events());assert.deepEqual(r.artifacts,['compass']);assert.equal(r.artifactAwards[0].ownedBeforeRun,true);assert.equal(r.artifactAwards[0].newlyEarned,false);
  h.storage.delete('vaultCompass');h.run(`startGame();sendGameData({event:'artifact_unlocked',artifact:'compass',artifactName:'Compass',artifactSource:'checkpoint',artifactAlreadyOwned:false,room:10});`);
  r=reconstructRun(h.events().filter(e=>e.runId===h.api.getRunId()));assert.deepEqual(r.newlyEarnedArtifacts,['compass']);assert.equal(r.artifactAwards[0].ownedBeforeRun,false);
});
await check('E raw and accepted attempts use engine branch, not response-time thresholds',()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'rapid'});remediationState={active:false};sendGameData({event:'question',correct:1,responseTime:100});sendGameData({event:'rapid_guessing',correct:1,responseTime:700});sendGameData({event:'question',correct:0,responseTime:2000});`);
  const r=reconstructRun(h.events());assert.deepEqual([r.rawAttempts,r.rawCorrect,r.acceptedAttempts,r.acceptedCorrect,r.rapidGuessCount],[3,2,2,1,1]);assert.equal(r.rawAccuracy,2/3);assert.equal(r.acceptedAccuracy,0.5);assert.equal(r.answerCount,r.rawAttempts);
  assert.equal(h.events().find(e=>e.eventType==='answer_evaluated'&&e.sourceEvent==='rapid_guessing').rapidGuess,true);
});
await check('E historical sourceEvent classifies lockouts even when v1 rapid_guess was false',()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'legacy'});sendGameData({event:'question',correct:1});sendGameData({event:'rapid_guessing',correct:0});`);
  const legacy=h.events().map(({acceptedAttempt,...e})=>({...e,rapidGuess:false}));const r=reconstructRun(legacy);assert.equal(r.acceptedAttempts,1);assert.equal(r.rawAttempts,2);
  const unknown=legacy.filter(e=>e.eventType==='answer_evaluated').map(({sourceEvent,...e})=>e);assert.equal(reconstructRun(unknown).unclassifiedAttempts,2);
});
await check('H real client failure, retry, multi-batch flush and queue recovery',async()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'queue'})`);for(let i=0;i<60;i++)h.api.emit('question_shown');
  const before=h.events();h.context.fetch=async()=>{throw Error('offline');};assert.equal((await h.api.flush()).ok,false);assert.deepEqual(h.events(),before);
  const resumed=client(h.storage);assert.deepEqual(resumed.events(),before);const batches=[];
  resumed.context.fetch=async(_url,options)=>{const events=JSON.parse(options.body).events;batches.push(events);return {ok:true,status:202,json:async()=>({acknowledgedEventIds:events.map(e=>e.eventId)})};};
  while(resumed.events().length)await resumed.api.flush();assert.deepEqual(batches.map(b=>b.length),[25,25,12]);assert.deepEqual(batches.flat().map(e=>e.eventId),before.map(e=>e.eventId));
});
await check('H simulated failure preserves exact event IDs before recovery',async()=>{
  const h=client(new Map([['anonymousTelemetry:debugFailure:v1','1']]));h.run(`sendGameData({event:'start',runID:'sim'})`);const before=h.events();assert.equal((await h.api.flush()).simulated,true);assert.deepEqual(h.events(),before);
  await h.nodes.get('anonymousTelemetryDebug').click({target:{dataset:{action:'failure'}}});assert.equal((await h.api.flush()).ok,true);assert.equal(h.events().length,0);
});
await check('debug Close collapses and Fresh cannot create a throwaway or split mapped run',async()=>{
  const h=client();const panel=h.nodes.get('anonymousTelemetryDebug');panel.open=true;await panel.click({target:{dataset:{action:'close'}}});assert.equal(panel.open,false);assert.ok(h.nodes.has('anonymousTelemetryDebug'));
  assert.equal(h.api.forceNewRun(),null);assert.equal(h.api.getRunId(),'');h.run(`sendGameData({event:'start',runID:'debug'})`);const id=h.api.getRunId();h.api.forceNewRun();assert.equal(h.api.getRunId(),id);
});
await check('mastery report emits only when viewed',()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'mastery'});sendGameData({event:'complete'})`);assert.ok(!h.events().some(e=>e.eventType==='mastery_report_summary_emitted'));
  h.run('showMasteryReportScreen()');h.tick();assert.equal(h.events().filter(e=>e.eventType==='mastery_report_summary_emitted').length,1);
});
const db=new DatabaseSync(':memory:');db.exec(read('server/anonymous-telemetry-poc/migrations/0001_initial.sql'));
class Statement{constructor(sql){this.sql=sql;this.values=[];}bind(...v){this.values=v;return this;}async all(){return {results:db.prepare(this.sql).all(...this.values)};}async first(){return db.prepare(this.sql).get(...this.values);}async run(){return {meta:{changes:Number(db.prepare(this.sql).run(...this.values).changes)}};}}
const env={TELEMETRY_DB:{prepare:sql=>new Statement(sql),async batch(statements){db.exec('BEGIN');try{const rows=[];for(const s of statements)rows.push(await s.run());db.exec('COMMIT');return rows;}catch(e){db.exec('ROLLBACK');throw e;}}},ADMIN_TOKEN:'local-test',MAX_EVENTS_PER_CLIENT_MINUTE:10000};
async function call(route,events){return worker.fetch(new Request('https://local.test/v1/'+route,{method:events?'POST':'GET',headers:{authorization:'Bearer local-test','content-type':'application/json'},body:events?JSON.stringify({phase:PHASE,events}):undefined}),env);}
for(const status of ['complete','timed_complete','timed_ended_early','riskReward_bust','exam_ended_by_student'])await check('F durable terminal status '+status+' survives lifecycle and delayed adaptive events',async()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'terminal-${status}'});sendGameData({event:'${status}',totalTime:600000});`);
  for(const reason of ['visibility-visible','visibility-hidden','pagehide','repair','bridge','retest'])h.api.emit('run_paused',{completionStatus:reason});
  // Simulate old queued clients that still put lifecycle reasons in completionStatus.
  let events=h.events().map(e=>e.eventType==='run_paused'?{...e,completionStatus:e.lifecycleReason,lifecycleReason:''}:e);
  assert.equal((await call('events',events)).status,202);const id=h.api.getRunId();
  let row=db.prepare('SELECT * FROM telemetry_runs WHERE run_id=?').get(id);assert.equal(row.completion_status,status);assert.equal(row.completed,1);
  const summary=await (await call('admin/summary')).json();assert.equal(summary.recentRuns.find(r=>r.run_id===id).completion_status,status);
  const r=(await(await call('admin/runs/'+id+'/reconstruct')).json()).reconstruction;assert.equal(r.completionStatus,status);assert.equal(r.activeGameplayElapsedMs,600000);assert.ok(r.wallClockDurationMs>=0);
  const retry=await(await call('events',events)).json();assert.equal(retry.accepted,0);assert.equal(retry.duplicates,events.length);
  row=db.prepare('SELECT * FROM telemetry_runs WHERE run_id=?').get(id);assert.equal(row.event_count,events.length);
});
await check('F data migration repairs old summaries and retains lifecycle reasons without rewriting attempts',()=>{
  const id=db.prepare('SELECT run_id FROM telemetry_runs LIMIT 1').get().run_id;
  db.prepare("UPDATE telemetry_runs SET completion_status='visibility-visible' WHERE run_id=?").run(id);
  db.prepare("UPDATE telemetry_events SET completion_status='pagehide' WHERE run_id=? AND event_type='run_paused'").run(id);
  const count=db.prepare('SELECT COUNT(*) n FROM telemetry_events').get().n;db.exec(read('server/anonymous-telemetry-poc/migrations/0002_completion_semantics.sql'));db.exec(read('server/anonymous-telemetry-poc/migrations/0002_completion_semantics.sql'));
  assert.notEqual(db.prepare('SELECT completion_status FROM telemetry_runs WHERE run_id=?').get(id).completion_status,'visibility-visible');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM telemetry_events').get().n,count);
  const e=db.prepare("SELECT * FROM telemetry_events WHERE run_id=? AND event_type='run_paused'").get(id);assert.equal(e.completion_status,'');assert.ok(JSON.parse(e.extras_json).lifecycleReason);
});
await check('G CSV preserves filtering, ordering, uniqueness and exposes artifact/accepted fields',async()=>{
  const h=client();h.run(`sendGameData({event:'start',runID:'csv'});sendGameData({event:'artifact_unlocked',artifact:'compass',artifactName:'Compass',artifactSource:'checkpoint',artifactAlreadyOwned:false});sendGameData({event:'rapid_guessing',correct:0});sendGameData({event:'complete'});`);
  const events=h.events().map(e=>({...e,synthetic:false}));assert.equal((await call('events',events)).status,202);
  const csv=await(await call('admin/export.csv')).text();const all=await(await call('admin/export.csv?includeSynthetic=1')).text();assert.equal(csv.split('\r\n').length,events.length+1);assert.ok(all.length>csv.length);
  assert.ok(csv.includes('artifactName')&&csv.includes('Compass')&&csv.includes('acceptedAttempt')&&csv.includes('sourceRunId'));
  const stored=(await(await call('admin/runs/'+h.api.getRunId())).json()).events;assert.deepEqual(stored.map(e=>e.sequence_number),events.map(e=>e.sequenceNumber));assert.equal(new Set(stored.map(e=>e.event_id)).size,events.length);
  const collision={...events[0],eventId:webcrypto.randomUUID()};assert.equal((await(await call('events',[collision])).json()).accepted,0);
  assert.equal((await(await call('admin/runs/'+h.api.getRunId()+'/reconstruct')).json()).reconstruction.sequence.contiguous,true);
});
await check('privacy allowlist still rejects identifiers, arbitrary text and mistyped new extras',()=>{
  const e=c.events()[0];for(const extra of [{email:'x'},{freeResponse:'x'},{studentId:'x'},{anything:'x'},{artifactAlreadyOwned:'yes'}])assert.throws(()=>validateEnvelope({phase:PHASE,events:[{...e,...extra}]}));
});
const failed=results.filter(r=>r.status==='FAIL');const report={phase:PHASE,generatedAt:new Date().toISOString(),passed:results.length-failed.length,failed:failed.length,total:results.length,results};
fs.writeFileSync(path.join(repo,'validation_artifacts/anonymous_telemetry_poc/regression_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
