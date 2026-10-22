import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
process.env.MQ_A11Y_OUT ||= 'validation_artifacts/final_feedback_refinement';
const {pw,serve,isolated,start,save,out}=await import('./support.mjs');
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
const profiles=JSON.parse(fs.readFileSync('audit_tools/economic_realm_engine/profiles.json','utf8'));
async function test(name,fn){try{results.push({name,status:'PASS',detail:await fn()});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}console.log(name,results.at(-1).status);}
async function open(file,old=false){const x=await isolated(browser,origin,{reducedMotion:'reduce'});if(old)await x.context.route(origin+'/'+file,r=>r.fulfill({contentType:'text/html',body:execFileSync('git',['show','90f12687:'+file],{encoding:'utf8',maxBuffer:20e6})}));await x.page.addInitScript(()=>{let seed=16427;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};});await x.page.clock.install({time:new Date('2026-10-22T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-22T16:00:01Z'));await x.page.goto(origin+'/'+file);return x;}
async function answer(p,want){await p.clock.runFor(6500);const i=await p.evaluate(async want=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;},want);await p.locator('#answers button').nth(i).click();await p.waitForTimeout(25);await p.clock.runFor(1000);}
async function next(p){if(await p.locator('#mqFeedbackContinue').isVisible())await p.locator('#mqFeedbackContinue').click();else if(await p.locator('#gameModalConfirm').isVisible())await p.locator('#gameModalConfirm').click();await p.clock.runFor(100);}
async function styles(p){return p.evaluate(()=>{
 const css=(selector,pseudo)=>{const e=document.querySelector(selector);if(!e)return null;const s=getComputedStyle(e,pseudo);return {filter:s.filter,background:s.backgroundImage,shadow:s.boxShadow,textShadow:s.textShadow,animation:s.animationName,width:s.width,height:s.height,transform:s.transform};};
 return {wizard:css('#wizardImage'),guideImage:css('#wizardImage img'),guidePanel:css('#wizardBox'),guideName:css('#wizardName'),boss:css('.generic-boss-image'),bossName:css('.boss-title'),intro:css('#bossRevealScreen .guide-intro-image'),frame:css('#bossRevealScreen .guide-intro-portrait-frame'),aura:css('#bossRevealScreen','::before'),panel:css('#gameBox'),button:css('#bossRevealProceed')};
 });}
try{
 await test('Inspect original Economic Realm character asset contact sheet',async()=>{
  const rows=[];for(const [game,p]of Object.entries(profiles))for(const asset of [p.guideImage,...p.bossImages]){const file=`play/economic-realm/${game}/${asset}`;rows.push({game,asset,file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}
  const {page:p,context}=await isolated(browser,origin,{viewport:{width:1120,height:1800}});try{
   await p.goto(origin+'/');await p.setContent('<style>body{margin:0;background:#17212b;color:white;font:13px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}figure{margin:0;padding:8px;background:#26333f}img{width:100%;height:290px;object-fit:contain}figcaption{min-height:36px}</style>'+rows.map(r=>`<figure><img src="${origin}/${r.file}"><figcaption>${r.game}<br>${r.asset}</figcaption></figure>`).join(''));
   await p.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode())));await p.screenshot({path:path.join(out,'economic-original-assets.png'),fullPage:true});save('character-assets.json',rows);return {assets:rows.length};
  }finally{await context.close();}
 });
 for(const game of Object.keys(profiles))await test('Economic Realm natural first boss, character styles and visual evidence: '+game,async()=>{
  const runs=[];for(const old of [true,false]){const {page:p,context}=await open(`play/economic-realm/${game}/index.html`,old);const suffix=old?'before':'after',shots=[];const snap=async label=>{const filename=`${game}-${label}-${suffix}.png`;await p.screenshot({path:path.join(out,filename)});shots.push(filename);};try{
   await start(p);await p.locator('#wizardImage').scrollIntoViewIfNeeded();await snap('custodian');const beforeStyles=await styles(p);if(!old){assert.equal(beforeStyles.wizard.filter,'none');assert.equal(beforeStyles.guideImage.filter,'drop-shadow(rgba(0, 0, 0, 0.55) 0px 8px 16px)');assert(!beforeStyles.guidePanel.shadow.includes('56, 189, 248'));assert(!beforeStyles.guideName.textShadow.includes('56, 189, 248'));}
   if(game==='market-gate'){await answer(p,false);await snap('wrong-turn');await next(p);}
   for(let i=0;i<9;i++){await answer(p,true);if(i===0 && game==='market-gate')await snap('hallway');await next(p);}
   assert(await p.locator('#bossRevealProceed').isVisible());await snap('boss-intro');const introStyles=await styles(p);
   if(!old){assert(!introStyles.intro.filter.includes('0px 0px'));assert(!introStyles.frame.background.includes('radial'));assert(!introStyles.aura.background.includes('radial'));assert.notEqual(introStyles.button.shadow,'none');}
   await p.locator('#bossRevealProceed').focus();await p.keyboard.press('Tab');await p.locator('#bossRevealProceed').focus();assert(await p.locator('#bossRevealProceed').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));await p.keyboard.press('Enter');await p.clock.runFor(50);
   await snap('boss-encounter');const encounterStyles=await styles(p);if(!old)assert.equal(encounterStyles.boss.filter,'drop-shadow(rgba(0, 0, 0, 0.55) 0px 8px 16px)');
   for(let i=0;i<3;i++){await answer(p,true);await p.clock.runFor(3500);}
   assert(await p.locator('#continueBtn').isVisible());if(game==='market-gate')await snap('checkpoint-victory');
   const state=await p.evaluate(()=>({room,attempts:totalAttempts,correct:correctAnswers,streak,bossHealth,bossCheckpoint}));
   if(game==='market-gate'){await p.setViewportSize({width:390,height:844});await snap('mobile-victory');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
   runs.push({state,beforeStyles,introStyles,encounterStyles,shots});
  }finally{await context.close();}}
  assert.deepEqual(runs[1].state,runs[0].state);
  for(const point of ['beforeStyles','introStyles','encounterStyles'])for(const item of ['wizard','guideImage','boss','intro'])if(runs[0][point][item])for(const prop of ['width','height','animation','transform'])assert.equal(runs[1][point][item][prop],runs[0][point][item][prop],`${point} ${item} ${prop}`);
  assert.deepEqual(runs[1].encounterStyles.panel,runs[0].encounterStyles.panel);assert.deepEqual(runs[1].introStyles.button,runs[0].introStyles.button);
  return {before:runs[0],after:runs[1]};
 });
 await test('Other collections retain character effects; hub character presentation inventory',async()=>{
  const files=['play/micro-domains/labyrinth-of-choice/index.html','play/macro-command-system/national-engine/index.html','play/managerial-intelligence-directorate/cost-directive/index.html'];const rows=[];
  for(const file of files){const views=[];for(const old of [true,false]){const {page:p,context}=await open(file,old);try{await start(p);views.push(await styles(p));}finally{await context.close();}}assert.deepEqual(views[1],views[0]);rows.push({file,unchanged:true});}
  const hub=fs.readFileSync('play/economic-realm/index.html','utf8');assert(!hub.includes('MQ ECONOMIC CHARACTER STYLE'));return {rows,hub:'No Custodian/boss portrait presentation; artifact/achievement/scene effects retained.'};
 });
}finally{await browser.close();server.close();save('visual.json',results);}
