import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
import { scenarios } from './game/scenarios/registry.js';
import { followupFor } from './game/instructional-followup.js';
import * as gdp from './game/games/gdp-live/engine.js';
import { CONFIG } from './game/games/gdp-live/config.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../tmp/econ-rpg/library-accessibility/',import.meta.url));
await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],external=[],checks=[],contrast=[];
const inventory=[...Object.keys(scenarios),'takeout-taco-lunch-rush','gdp-live'];
function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});p.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!r.url().startsWith('chrome:'))external.push(r.url());});}
// Deliberately use Tab/Shift+Tab, Enter and Space: never click or programmatically focus controls.
async function reach(p,loc){
  await loc.waitFor();assert.equal(await loc.isEnabled(),true);
  for(let n=0;n<200;n++){
    if(await loc.evaluate(el=>el===document.activeElement)){
      const focus=await loc.evaluate(el=>({width:parseFloat(getComputedStyle(el).outlineWidth),style:getComputedStyle(el).outlineStyle}));
      assert.ok(focus.width>=3&&focus.style==='solid','visible keyboard focus');return;
    }
    await p.keyboard.press('Tab');
  }
  throw new Error('Keyboard target unreachable: '+await loc.textContent());
}
async function activate(p,loc,key='Enter'){await reach(p,typeof loc==='string'?p.locator(loc):loc);await p.keyboard.press(key);}
async function type(p,selector,value){await reach(p,p.locator(selector));await p.keyboard.press('Control+A');await p.keyboard.type(String(value));}
async function contrastAudit(p,label){
  const result=await p.evaluate(()=>{
    const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
    const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    const backgrounds=el=>{
      for(let a=el;a;a=a.parentElement){
        const s=getComputedStyle(a);
        if(s.backgroundImage.includes('gradient')){
          // Include both endpoints, with the base navy under the body's transparent radial endpoint.
          return [...(s.backgroundImage.match(/rgb\([^)]+\)/g)||[]).map(rgb),...(a===document.body?[[3,22,56]]:[])];
        }
        if(s.backgroundColor!=='rgba(0, 0, 0, 0)'&&s.backgroundColor!=='transparent')return [rgb(s.backgroundColor)];
      }
      return [[3,22,56]];
    };
    let minText=Infinity,minBoundary=Infinity,checked=0;const failures=[];
    for(const el of document.querySelectorAll('p,h1,h2,h3,h4,dt,dd,span,b,strong,button,a,label,summary,legend,th,td,input')){
      const box=el.getBoundingClientRect(),s=getComputedStyle(el);
      if(box.width<=1||box.height<=1||s.visibility==='hidden'||el.closest('svg'))continue;
      if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&el.tagName!=='INPUT')continue;
      const value=Math.min(...backgrounds(el).map(bg=>ratio(rgb(s.color),bg))),size=parseFloat(s.fontSize),large=size>=24||(size>=18.66&&Number(s.fontWeight)>=700);
      minText=Math.min(minText,value);checked++;
      if(value<(large?3:4.5))failures.push({text:el.textContent.trim().slice(0,70),ratio:value,color:s.color});
    }
    for(const el of document.querySelectorAll('button:not(:disabled),input,a.return-games,.game-card a,a.button')){
      if(!el.getBoundingClientRect().height)continue;
      const s=getComputedStyle(el),backs=backgrounds(el.parentElement);
      const border=Math.min(...backs.map(bg=>ratio(rgb(s.borderTopColor),bg)));
      const fill=s.backgroundColor==='rgba(0, 0, 0, 0)'?0:Math.min(...backs.map(bg=>ratio(rgb(s.backgroundColor),bg)));
      const value=Math.max(border,fill);minBoundary=Math.min(minBoundary,value);
      if(value<3)failures.push({control:el.textContent.trim().slice(0,70),boundary:value});
    }
    return {minText,minBoundary,checked,failures};
  });
  assert.deepEqual(result.failures,[],label+' contrast');contrast.push({label,...result});
}
async function inspect(p,label){
  assert.equal(await p.locator('h1').count(),1,label+' h1');assert.equal(await p.locator('main').count(),1,label+' main');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,label+' overflow');
  for(const img of await p.locator('img').all()){assert.ok((await img.getAttribute('alt'))?.length>10,label+' image alt');}
  for(const input of await p.locator('input').all())assert.ok(await input.evaluate(e=>e.labels.length>0),label+' input label');
  for(const table of await p.locator('table').all())assert.ok(await table.locator('thead th').count()>0,label+' table headers');
  for(const control of await p.locator('button,a.return-games,a.button,.game-card a,summary,input').all()){
    const b=await control.boundingBox();if(b)assert.ok(b.height>=44&&b.width>=24,`${label}: target ${await control.textContent()}`);
  }
  assert.equal(await p.locator('[onclick]:not(button):not(a),div[role=button]').count(),0,label+' native controls');
  await contrastAudit(p,label);
}
async function reflow(p,label){
  const previous=p.viewportSize();
  for(const width of [1366,900,390,320]){await p.setViewportSize({width,height:900});await inspect(p,`${label}-${width}`);if(width===1366||width===390)await p.screenshot({path:out+`${label}-${width}.png`,fullPage:true});}
  await p.setViewportSize(previous);
}
async function dialog(p){
  await activate(p,'#restart');assert.equal(await p.locator('dialog').isVisible(),true);
  for(let i=0;i<6;i++){
    await p.keyboard.press('Tab');
    // Native dialog traversal may pass through browser chrome (body as activeElement).
    if(await p.evaluate(()=>document.activeElement===document.body))await p.keyboard.press('Tab');
    assert.ok(await p.evaluate(()=>!!document.activeElement.closest('dialog')),'no background control receives modal focus');
  }
  await p.keyboard.press('Escape');assert.equal(await p.locator('dialog').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.id),'restart');
  await activate(p,'#restart');await activate(p,'#cancel-restart');assert.equal(await p.evaluate(()=>document.activeElement.id),'restart');
}
async function completeApplications(p,id){
  const run=await p.evaluate(id=>JSON.parse(localStorage.getItem(id==='gameday-rivals'?'gamedayRivalsSave_v1':`mq.econ-rpg.${id}`)),id);
  if(id==='gameday-rivals')run.phase='debrief';
  const model=followupFor(id,run);
  for(const task of model.questions){
    assert.equal(await p.locator('.followup-stage').getAttribute('data-question'),task.id);
    const options=p.locator('.followup-options button');
    for(let i=0;i<task.options.length;i++)if(i!==task.correct){
      await activate(p,options.nth(i),'Space');
      assert.match(await p.locator('.followup-feedback').textContent(),/Reconsider.*Choose again\./);
      assert.equal(await p.locator('.followup-stage .primary').isVisible(),false);
    }
    await activate(p,options.nth(task.correct));
    assert.match(await p.locator('.followup-feedback').textContent(),/^Correct\./);
    assert.equal(await p.locator('.followup-options button:disabled').count(),3);
    assert.equal(await p.evaluate(()=>document.activeElement.className),'followup-feedback');
    await p.keyboard.press('Tab');
    assert.equal(await p.locator('.followup-stage .primary').evaluate(el=>el===document.activeElement),true);
    await activate(p,p.locator('.followup-stage .primary'));
  }
  assert.equal(await p.locator('.instructional-followup').getAttribute('data-complete'),'true');
}
async function playRpg(p,id,mode){
  await activate(p,p.getByRole('button',{name:'Begin scenario',exact:true}));
  await dialog(p);if(mode==='desktop')await reflow(p,id+'-decision');
  for(let i=0;i<6;i++){
    await activate(p,p.locator('[data-choice]').first(),i%2?'Space':'Enter');
    assert.equal(await p.evaluate(()=>document.activeElement.id),'view-title');
    assert.ok((await p.locator('#announcement').textContent()).length>5);
    await activate(p,p.getByRole('button',{name:/Continue to next decision|See your outcome/}));
  }
  await inspect(p,id+'-complete');if(mode==='desktop')await reflow(p,id+'-complete');
  await completeApplications(p,id);
  await activate(p,p.getByRole('button',{name:'Replay scenario',exact:true}));assert.ok(await p.locator('[data-choice]').count()>0);
  assert.equal(await p.locator('.instructional-followup').count(),0);
}
async function playGameday(p,mode){
  await activate(p,p.getByRole('button',{name:'Start Season',exact:true}));await dialog(p);
  if(mode==='desktop')await reflow(p,'gameday-decision');
  for(let i=0;i<6;i++){
    await activate(p,`[data-strategy="${i%2?'aggressive':'standard'}"]`,'Space');
    assert.match(await p.locator('#announcement').textContent(),/Both offers revealed/);
    if(i===0&&mode==='desktop')await reflow(p,'gameday-reveal');
    await activate(p,p.locator('#view .gr-continue'));
  }
  if(mode==='desktop')await reflow(p,'gameday-complete');else await inspect(p,'gameday-complete-zoom');
  await completeApplications(p,'gameday-rivals');
  await activate(p,p.getByRole('button',{name:'Play Another Season',exact:true}));assert.equal(await p.locator('[data-strategy]').count(),2);
  assert.equal(await p.locator('.instructional-followup').count(),0);
}
async function graphTable(p,kind,values){
  const graph=p.locator(`[data-graph="${kind}"]`);
  await activate(p,graph.locator('summary'));
  assert.deepEqual(await graph.locator('tbody tr td:first-of-type').allTextContents(),values.map(String));
  assert.ok((await graph.locator('svg').getAttribute('aria-describedby')).endsWith('-desc'));
  await activate(p,graph.locator('summary'));
}
async function playTaco(p,mode){
  await activate(p,'[data-action="start_rush"]');for(let i=0;i<5;i++)await activate(p,'[data-action="call_worker"]','Space');
  assert.match(await p.locator('#announcement').textContent(),/Window 6/);if(mode==='desktop')await reflow(p,'taco-active');
  await activate(p,'[data-action="review_record"]');
  for(const value of [2,13,8,3,1,3]){
    if(await p.locator('#extra-tacos').count()){await type(p,'#extra-tacos',value);await p.keyboard.press('Enter');}
    else await activate(p,`[data-answer="${value}"]`,'Space');
    assert.equal(await p.evaluate(()=>document.activeElement.classList.contains('question-feedback')),true);
    await activate(p,'[data-action="continue_debrief"]');
  }
  await graphTable(p,'total',[8,18,31,42,50,53]);
  await activate(p,'[data-analysis-answer="2"]');await activate(p,'[data-action="continue_analysis"]');
  await graphTable(p,'marginal',[8,10,13,11,8,3]);if(mode==='desktop')await reflow(p,'taco-graph');
  await activate(p,'[data-analysis-answer="1"]');
  for(let i=0;i<3;i++)await activate(p,'[data-action="continue_analysis"]');
  await activate(p,'[data-allocation="5"]');await activate(p,'[data-action="continue_two_truck"]');
  await activate(p,'[data-allocation="3"]');await activate(p,'[data-action="continue_two_truck"]');
  for(let i=0;i<2;i++){await activate(p,'[data-truck-answer="2"]');await activate(p,'[data-action="continue_two_truck"]');}
  if(mode==='desktop')await reflow(p,'taco-complete');else await inspect(p,'taco-complete-zoom');
  await activate(p,'[data-action="replay"]');assert.equal(await p.locator('[data-action="start_rush"]').count(),1);
}
async function select(p,posts){
  while(await p.locator('[data-account][aria-pressed=true]').count())await activate(p,p.locator('[data-account][aria-pressed=true]').first(),'Space');
  for(const a of gdp.expectedAccounts(posts))await activate(p,`[data-account="${a}"]`,'Space');
}
async function playGdp(p,mode){
  let s=gdp.start(gdp.newRun(1));await activate(p,'[data-action="start"]');
  if(mode==='desktop')await reflow(p,'gdp-posting');
  for(let i=0;i<s.deck.length;i++){
    const scenario=gdp.currentScenario(s);await select(p,scenario.postings);await activate(p,'[data-action="post"]');
    s=gdp.postTransaction({...s,selection:gdp.expectedAccounts(scenario.postings)});
    assert.equal(Number(await p.locator('#gdp-number').getAttribute('data-target')),gdp.gdp(s.accounts));
    await activate(p,'[data-action="next"]');s=gdp.nextTransaction(s);
  }
  await activate(p,'[data-action="audit"]');s=gdp.beginAudit(s);
  await activate(p,'[data-audit="bad"]');s=gdp.identifyAudit(s,'bad');
  const posts=s.auditRows.find(r=>r.id==='bad').correctPostings;
  await select(p,posts);await activate(p,'[data-action="repair"]');
  if(mode==='desktop')await reflow(p,'gdp-audit');
  await activate(p,'[data-action="shock"]');await type(p,'#shock-value','46');await p.keyboard.press('Enter');
  assert.equal(await p.locator('#shock-value').getAttribute('aria-invalid'),'true');assert.match(await p.locator('#shock-value').getAttribute('aria-describedby'),/shock-feedback/);
  await type(p,'#shock-value','$20B');await p.keyboard.press('Enter');
  assert.match(await p.locator('#stage-title').innerText(),/THE ACCOUNTS BALANCE/);
  await activate(p,'#ledger summary');assert.equal(await p.locator('#ledger tbody tr').count(),15);
  if(mode==='desktop')await reflow(p,'gdp-complete');else await inspect(p,'gdp-complete-zoom');
  await activate(p,'[data-action="replay"]');assert.equal(Number(await p.locator('#gdp-number').getAttribute('data-target')),gdp.gdp(CONFIG.baseline));
}
async function seeded(p){await p.addInitScript(()=>{const original=crypto.getRandomValues.bind(crypto);Object.defineProperty(crypto,'getRandomValues',{value(a){if(a instanceof Uint32Array&&a.length===1){a[0]=1;return a;}return original(a);}});});}
let zoomContext;
try{
  const landing=await browser.newPage({viewport:{width:1366,height:900}});watch(landing);await landing.goto(origin+'/games/');
  // New measurement games have their own exhaustive keyboard/zoom suites; inspect their cards here too.
  assert.deepEqual((await landing.locator('[data-game]').evaluateAll(es=>es.map(e=>e.dataset.game))).sort(),[...inventory,'cpi-live','labor-force-files'].sort());
  for(const card of await landing.locator('.game-card').all()){
    assert.ok((await card.locator('h2').innerText()).length>3);assert.ok((await card.locator('p').innerText()).length>30);
    assert.equal(await card.locator('img,[role=img]').count(),1);
    if(await card.locator('img').count()){await card.locator('img').evaluate(i=>i.decode());assert.equal(await card.locator('img').evaluate(i=>getComputedStyle(i).objectFit),(await card.getAttribute('data-game'))==='takeout-taco-lunch-rush'?'cover':'contain');}
  }
  await reflow(landing,'library');await landing.close();
  for(const mode of ['desktop','zoom200']){
    if(mode==='zoom200'){
      zoomContext=await chromium.launchPersistentContext(out+'zoom-profile',{channel:'chrome',headless:true,viewport:{width:1366,height:768},reducedMotion:'reduce'});
      const settings=zoomContext.pages()[0];await settings.goto('chrome://settings/appearance');
      await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();
    }
    for(const id of inventory){
      const p=mode==='desktop'?await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}):await zoomContext.newPage();watch(p);await seeded(p);
      await p.goto(origin+'/games/');if(mode==='zoom200'){assert.equal(await p.evaluate(()=>innerWidth),683);assert.equal(await p.evaluate(()=>devicePixelRatio),2);}
      await activate(p,`[data-game="${id}"] a`);
      await p.waitForURL(url=>url.pathname!=='/games/');
      assert.equal(new URL(p.url()).searchParams.get('scenario')||new URL(p.url()).pathname.split('/').filter(Boolean).at(-1),id);
      await inspect(p,id+'-'+mode+'-intro');
      if(id==='gameday-rivals')await playGameday(p,mode);
      else if(id==='takeout-taco-lunch-rush')await playTaco(p,mode);
      else if(id==='gdp-live')await playGdp(p,mode);
      else await playRpg(p,id,mode);
      await activate(p,'nav .return-games');await p.waitForURL('**/games/');assert.equal(new URL(p.url()).pathname,'/games/');
      // Full-page capture in headless Chrome mis-scales its clip at browser zoom; use the visible viewport.
      if(mode==='zoom200')await p.screenshot({path:out+'library-zoom200.png'});
      checks.push(`${id}: ${mode} complete keyboard run, replay and return`);console.log(checks.at(-1));await p.close();
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  await writeFile(out+'results.json',JSON.stringify({checks,contrast,errors,external},null,2));
}finally{await zoomContext?.close();await browser.close();await new Promise(r=>server.close(r));}
