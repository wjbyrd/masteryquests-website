import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'.');
const games=['cost-directive','market-signal','strategy-desk','agency-protocol'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const results=[];
function check(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}}
const hashes=JSON.parse(read('validation_artifacts/managerial_ui_parity/baseline_hashes.json'));
const changed=new Set(games.map(g=>`play/managerial-intelligence-directorate/${g}/index.html`));
const externalHotfix = {path:'play/economic-realm/index.html',commit:'a564e61',reason:'Separate committed Hot fix arrived while this task was paused; preserve it.'};
check('Protected files match baseline, with separately committed Principles hotfix preserved',()=>{
 for(const [p,hash] of Object.entries(hashes))if(!changed.has(p)){if(p===externalHotfix.path){for(const ref of [externalHotfix.commit,'HEAD'])assert.equal(read(p),execFileSync('git',['show',ref+':'+p],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),p);continue;}assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),hash,p);}
});
const inline=s=>[...s.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const normalizeWarnings=s=>s.replace(/bossMsg\.innerText\s*=\s*[\s\S]*?;/g,'bossMsg.innerText = "";');
for(const game of games){
 const p=`play/managerial-intelligence-directorate/${game}/index.html`,html=read(p);
 check(game+' existing engine scripts unchanged except warning presentation',()=>{
  const before=execFileSync('git',['show','HEAD:'+p],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')===hashes[p],false);
  assert.deepEqual(inline(html).map(normalizeWarnings),inline(before).map(normalizeWarnings));
 });
 check(game+' inline JavaScript syntax valid',()=>inline(html).forEach(s=>new vm.Script(s)));
 check(game+' one existing menu, no separate Fullscreen, both template cinematics present',()=>{
  for(const id of ['returnMenuBtn','gameMenuOptions','gameMenuFullscreen','gameMenuDaily','gameModalActions','guideIntroScreen','bossRevealScreen','dailyTaskDock'])assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,id);
  assert.ok(!html.includes('class="fullscreenBtn"'));assert.ok(!/DANGER: BOSS DETECTED|LEGENDARY BOSS DETECTED IN NEXT ROOM/.test(html));
  assert.ok(html.includes('../managerial-parity.js')&&html.includes('../managerial-parity.css'));
 });
}
const source=read('play/managerial-intelligence-directorate/managerial-parity.js');
const template=read('build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html');
function core(s){const start=s.indexOf('const DailyChallengesCore = (() => {'),end=s.indexOf('globalThis.MQDailyChallengesCore = DailyChallengesCore;',start);return s.slice(start,end+'globalThis.MQDailyChallengesCore = DailyChallengesCore;'.length);}
check('Daily deterministic core copied verbatim from current Principles/faculty template',()=>assert.equal(core(source),core(template)));
check('Shared Managerial adapter syntax valid and no new telemetry dispatch',()=>{new vm.Script(source);assert.ok(!/sendGameData\(\{/.test(source));assert.ok(!source.includes('anonymousTelemetry'));});
const context=vm.createContext({Date,Math,JSON,Set});vm.runInContext(core(source),context);const daily=context.MQDailyChallengesCore;
check('All proven challenge families retained without boss/currency additions',()=>assert.deepEqual(Array.from(daily.FAMILY_ORDER),['correct_answers','streak','accuracy_window','perfect_stretch','graph_questions','concept_variety']));
check('Deterministic local calendar scheduling independent of browser history',()=>{
 const args={identity:'cost-directive',date:'2026-09-05',eligibleFamilies:Array.from(daily.FAMILY_ORDER).filter(f=>f!=='graph_questions'),context:{accessibleQuestionCount:40,graphQuestionCount:0,conceptCount:4}};
 assert.deepEqual(daily.resolveDaily(args),daily.resolveDaily({...args,history:[{date:'2026-09-04',family:'streak'}]}));
 assert.notEqual(daily.resolveDaily(args).id,daily.resolveDaily({...args,date:'2026-09-06'}).id);
});
check('Graph family disabled without sufficient accessible graph questions',()=>{assert.ok(!daily.getEligibleFamilies({graphQuestionCount:0,conceptCount:4}).includes('graph_questions'));assert.ok(daily.getEligibleFamilies({graphQuestionCount:4,conceptCount:4}).includes('graph_questions'));});
for(const family of ['correct_answers','streak','accuracy_window','perfect_stretch','concept_variety'])check(family+' progress completes once and retains post-completion attempts',()=>{
 const task={family,target:3,windowSize:3};let progress=daily.createProgress();
 for(let i=1;i<=3;i++)progress=daily.applyProgress(task,progress,{correct:true,streak:i,concept:'concept-'+i}).progress;
 assert.equal(progress.completed,true);const next=daily.applyProgress(task,progress,{correct:true,streak:4,concept:'extra'});assert.equal(next.completedNow,false);assert.equal(next.progress.postCompletionQuestions,1);
});
check('Accuracy completes only at fixed-window end; a failed window restarts',()=>{
 const task={family:'accuracy_window',target:2,windowSize:3};let p=daily.createProgress();
 p=daily.applyProgress(task,p,{correct:true}).progress;p=daily.applyProgress(task,p,{correct:true}).progress;assert.equal(p.completed,false);assert.equal(daily.applyProgress(task,p,{correct:false}).progress.completed,true);
 p=daily.createProgress();for(let i=0;i<3;i++)p=daily.applyProgress(task,p,{correct:false}).progress;assert.equal(p.windowAttempts,0);assert.equal(p.windowNumber,2);
});
const failed=results.filter(r=>r.status==='FAIL');const report={generatedAt:new Date().toISOString(),passed:results.length-failed.length,failed:failed.length,total:results.length,protectedFiles:Object.keys(hashes).length-changed.size,externalHotfix,results};
fs.writeFileSync(path.join(root,'validation_artifacts/managerial_ui_parity/validation_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
