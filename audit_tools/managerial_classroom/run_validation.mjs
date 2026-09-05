import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import vm from 'node:vm';
import {games,publicRoot,pocRoot,classroomRoot,read,disclosure} from './build.mjs';
import {reconstructRun,validateEnvelope} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const root=path.resolve(process.argv[2]||'.'),out=path.join(root,'validation_artifacts/managerial_classroom'),results=[];
function check(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}}
const hashes=JSON.parse(read(root,'validation_artifacts/managerial_classroom/baseline_hashes.json'));
check('Every pre-existing tracked file is byte-identical, including public games, POC, backend and historical evidence',()=>{for(const [p,hash]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),hash,p);});
for(const game of games){
 const html=read(root,`${classroomRoot}/${game}/index.html`),original=read(root,`${publicRoot}/${game}/index.html`);
 check(game+' current published HTML/engine preserved except exact telemetry hook additions',()=>{
  let reverse=html.replace(/<head><meta name="robots"[\s\S]*?<\/script>/,'<head>');
  reverse=reverse.replace(/<script src="\/play\/managerial-directorate-classroom\/telemetry-client.js"[^>]*><\/script>\n/,'');
  reverse=reverse.replace(/        const artifactAlreadyOwned[^\n]+\n/g,'').replace(/^        recordArtifactAward\([^\n]+\n/gm,'');
  reverse=reverse.replace(/function recordArtifactAward\([\s\S]*?\n}\n\n/,'');
  reverse=reverse.replace(/        if\(storageKey\)\{\n            const alreadyOwned[\s\S]*?\n        }/,'        if(storageKey) localStorage.setItem(storageKey, "true");');
  assert.equal(reverse,original);
 });
 check(game+' validated POC award telemetry source and hook counts retained',()=>{
  const poc=read(root,`${pocRoot}/${game}/index.html`);const hook=s=>s.match(/function recordArtifactAward\([\s\S]*?\n}/)[0].replace('POC gameplay hook:','Gameplay hook:');assert.equal(hook(html),hook(poc));
  assert.equal((html.match(/recordArtifactAward\(/g)||[]).length,(poc.match(/recordArtifactAward\(/g)||[]).length);
 });
 check(game+' noindex, original assets, isolated storage and correct cinematic hook ordering',()=>{
  assert.ok(html.includes('noindex,nofollow,noarchive'));assert.ok(html.includes(`<base href="/${publicRoot}/${game}/">`));assert.ok(html.includes(`/${classroomRoot}/telemetry-storage-isolation.js`));
  assert.ok(html.indexOf('/telemetry-client.js')<html.lastIndexOf('../managerial-parity.js'));
  for(const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 });
}
const client=read(root,`${classroomRoot}/telemetry-client.js`);
check('No classroom debug UI/API, synthetic or endpoint switches exist in executable source',()=>{
 new vm.Script(client);for(const term of ['telemetryDebug','telemetrySynthetic','telemetryEndpoint','window.AnonymousTelemetryPOC','addDebugPanel','updateDebug','requestFreshRun','failureSimulation','Fresh telemetry run','Flush now','URLSearchParams'])assert.ok(!client.includes(term),term);
 assert.ok(client.includes('synthetic: false'));assert.ok(client.includes('const endpoint = DEFAULT_ENDPOINT;'));assert.ok(client.includes(disclosure));
});
check('Storage isolation is exactly the validated implementation with a separate classroom namespace',()=>assert.equal(read(root,`${classroomRoot}/telemetry-storage-isolation.js`),read(root,`${pocRoot}/telemetry-storage-isolation.js`).replace('mq:managerial-directorate-telemetry-poc:','mq:managerial-directorate-classroom:')));
check('Private hub contains four classroom links and neutral disclosure; no public incoming links added',()=>{
 const html=read(root,`${classroomRoot}/index.html`);assert.ok(html.includes(disclosure));assert.ok(html.includes('noindex,nofollow,noarchive'));for(const g of games)assert.ok(html.includes(`href="./${g}/"`));assert.ok(!/research|telemetryDebug|telemetrySynthetic/.test(html));
 for(const p of Object.keys(hashes).filter(p=>p.endsWith('.html')&&!p.startsWith('validation_artifacts/')))assert.ok(!read(root,p).includes('/play/managerial-directorate-classroom/'),p);
});
function harness(storage=new Map(),denied=false){
 const listeners={},timers=[],nodes=[];const context=vm.createContext({crypto:crypto.webcrypto,location:{search:'?telemetryDebug=1&telemetrySynthetic=1&telemetryEndpoint=https://invalid.example'},localStorage:{getItem:k=>{if(denied)throw Error('denied');return storage.get(k)||null;},setItem:(k,v)=>{if(denied)throw Error('denied');storage.set(k,String(v));}},document:{currentScript:{dataset:{gameId:'cost-directive'}},documentElement:{dataset:{}},visibilityState:'visible',createElement:()=>({style:{}}),getElementById:()=>({appendChild:n=>nodes.push(n)}),addEventListener:(name,fn)=>listeners[name]=fn},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{},addEventListener:(name,fn)=>listeners[name]=fn,fetch:async()=>{throw Error('local offline fixture');}});
 vm.runInContext(`window=globalThis;var room=30, currentQuestion={id:4004},streak=24,totalAttempts=80,correctAnswers=50,gameMode='standard',remediationState={},masteryState={},ARTIFACT_STORAGE_KEYS={compass:'vaultCompass'};function sendGameData(){}function displayQuestion(){}function startGame(){sendGameData({event:'start',runID:'source-1'});}function getElapsedTimeMs(){return 5000;}`,context);
 // Test-only closure access is injected in memory and is absent from shipped assets.
 vm.runInContext(client.replace('  installHooks();','  window.testApi={emit,flush,queue:()=>state.queue,run:()=>state.activeRunId};\n  installHooks();'),context);
 return{context,listeners,storage,run:s=>vm.runInContext(s,context),events:()=>JSON.parse(JSON.stringify(context.testApi.queue()))};
}
check('Classroom client starts mapped real schema-v1 runs without stale context and ignores synthetic override',()=>{
 const h=harness();h.run('startGame()');h.context.testApi.emit('question_shown',{}, {synthetic:true});const e=h.events();assert.deepEqual(e.slice(0,2).map(e=>e.eventType),['mode_selected','run_started']);assert.ok(e.every(e=>e.synthetic===false&&e.sourceRunId==='source-1'));assert.equal(e[0].questionId,'');assert.equal(e[0].streak,0);validateEnvelope({phase:'phaseAnonymousTelemetryPOC-v1',events:e});
});
check('Same source/client maps to same telemetry run across reload with no mode re-selection',()=>{
 const h=harness();h.run('startGame()');const id=h.events()[0].runId,client=h.events()[0].anonymousClientId;const next=harness(h.storage);next.run("sendGameData({event:'resume',runID:'source-1'})");const e=next.events();assert.ok(e.every(e=>e.runId===id&&e.anonymousClientId===client));assert.equal(e.at(-1).eventType,'run_resumed');assert.equal(e.filter(e=>e.eventType==='mode_selected').length,1);
});
check('Visibility plus pagehide deduplicates pauses without polluting completion status',()=>{
 const h=harness();h.run('startGame()');h.context.document.visibilityState='hidden';h.listeners.visibilitychange();h.listeners.pagehide();const pauses=h.events().filter(e=>e.eventType==='run_paused');assert.equal(pauses.length,1);assert.equal(pauses[0].completionStatus,'');assert.equal(pauses[0].lifecycleReason,'visibility-hidden');
});
check('Raw versus accepted attempts and artifact ownership retain validated semantics',()=>{
 const h=harness(new Map([['vaultCompass','true']]));h.run("startGame();sendGameData({event:'question',correct:1});sendGameData({event:'rapid_guessing',correct:0});sendGameData({event:'artifact_unlocked',artifact:'compass',artifactAlreadyOwned:true});sendGameData({event:'complete'});");const e=h.events(),r=reconstructRun(e);assert.equal(r.rawAttempts,2);assert.equal(r.acceptedAttempts,1);assert.equal(r.completionStatus,'complete');const a=e.find(e=>e.eventType==='artifact_unlocked');assert.equal(a.artifactOwnedBeforeRun,true);assert.equal(a.artifactNewlyEarned,false);
});
check('Denied storage fails open and retains one random client within the page',()=>{const h=harness(new Map(),true);h.run("startGame();sendGameData({event:'question',correct:1})");assert.ok(h.events().length>2);assert.equal(new Set(h.events().map(e=>e.anonymousClientId)).size,1);});
const failures=results.filter(r=>r.status==='FAIL');const report={generatedAt:new Date().toISOString(),protectedFiles:Object.keys(hashes).length,passed:results.length-failures.length,failed:failures.length,total:results.length,results};fs.writeFileSync(path.join(out,'validation_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
