'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(__dirname,'../../../../../tmp/market-shift'),key='mq-market-shift-prototype-v1',checks=[],errors=[];
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const {previewServer}=await import('../../../serve.mjs'),server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;let browser;
  try{
    browser=await chromium.launch({headless:true,channel:'msedge'});const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
    if(process.env.MQ_AXE_MODULE)await context.route(origin+'/__qa_axe.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(require.resolve(process.env.MQ_AXE_MODULE),'utf8')}));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/games/market-shift/');await page.getByRole('button',{name:'Enter the market'}).waitFor();await page.screenshot({path:path.join(out,'01-landing-desktop.png'),fullPage:true});
    async function scan(name){if(!process.env.MQ_AXE_MODULE)return;if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({url:origin+'/__qa_axe.js'});const result=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));fs.writeFileSync(path.join(out,name+'-axe.json'),JSON.stringify(result.violations,null,2));assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
    await scan('intro');await page.locator('[data-action=start]').click();
    await page.locator('[data-action=check]').click();assert((await page.locator('#feedback').textContent()).includes('Move supply left'));
    await page.locator('[data-action=hint]').click();assert((await page.locator('.controls .hint').textContent()).includes('Keep buyers'));
    const svg=await page.locator('#graph').boundingBox(),handle=await page.locator('[data-drag=s] .handle').boundingBox();
    await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2-20/100*542*svg.width/680,handle.y+handle.height/2,{steps:8});await page.mouse.up();
    assert.equal(await page.locator('#input-s').inputValue(),'-20');assert.equal(await page.locator('#input-d').inputValue(),'0');
    const eq=await page.locator('[data-drag=e] .handle').boundingBox();
    await page.mouse.move(eq.x+eq.width/2,eq.y+eq.height/2);await page.mouse.down();await page.mouse.move(svg.x+(78+40/100*542)*svg.width/680,svg.y+(350-68/120*306)*svg.height/420,{steps:8});await page.mouse.up();
    assert.equal(await page.locator('#input-q').inputValue(),'40');assert.equal(await page.locator('#input-p').inputValue(),'68');
    await page.screenshot({path:path.join(out,'02-forecast-desktop.png'),fullPage:true});await scan('mission');
    await page.reload();await page.locator('[data-action=start]').click();assert.equal(await page.locator('#input-s').inputValue(),'-20');
    await page.locator('[data-action=check]').click();assert(await page.locator('.debrief').isVisible());assert(await page.locator('#input-s').isDisabled());assert((await page.locator('#resultStrip').textContent()).includes('$68'));await page.screenshot({path:path.join(out,'03-harvest-complete.png'),fullPage:true});
    checks.push('direct curve and equilibrium dragging, targeted feedback, hints, save recovery and completed-forecast locking');
    await page.locator('[data-action=next]').click();
    await page.locator('#input-d').focus();await page.keyboard.press('Home');for(let i=0;i<10;i++)await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#input-d').inputValue(),'20');
    async function enter(id,value){await page.locator('#input-'+id).fill(String(value));await page.locator('#input-'+id).press('Tab');}
    await enter('q',60);await enter('p',68);await page.locator('[data-action=check]').click();assert(await page.locator('.debrief').isVisible());
    checks.push('keyboard-only demand shift and numerical equilibrium complete the festival mission');
    await page.locator('[data-action=next]').click();await page.locator('#input-ceiling').focus();await page.keyboard.press('Home');for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');
    await enter('qs',75);await enter('qd',25);await page.locator('[data-action=check]').click();assert((await page.locator('#feedback').textContent()).includes('reversed'));
    await enter('qs',25);await enter('qd',75);await page.locator('[data-action=check]').click();assert((await page.locator('#resultStrip').textContent()).includes('50 crates'));await scan('ceiling-complete');await page.screenshot({path:path.join(out,'04-ceiling-complete.png'),fullPage:true});
    await page.locator('[data-action=next]').click();assert.equal(await page.locator('.report-item').count(),3);assert((await page.locator('.report-item').nth(0).textContent()).includes('2 forecasts · 1 hint'));assert((await page.locator('.report-item').nth(1).textContent()).includes('Correct on your first forecast'));
    const pending=page.waitForEvent('download');await page.locator('[data-action=download]').click();const download=await pending;await download.saveAs(path.join(out,'notebook.txt'));assert(fs.readFileSync(path.join(out,'notebook.txt'),'utf8').includes('Forecast 1: direction'));
    checks.push('price ceiling checks distinguish swapped quantities; final notebook retains first attempts and exports actual evidence');
    const saved=await page.evaluate(key=>localStorage.getItem(key),key);await page.locator('[data-action=explore]').click();await page.locator('#ceilingToggle').check();
    await page.locator('#input-ceiling').focus();await page.keyboard.press('End');assert((await page.locator('#exploreResult').textContent()).includes('does not force price up'));assert((await page.locator('#resultStrip').textContent()).includes('Not binding'));
    await page.locator('#input-ceiling').press('Home');assert((await page.locator('#exploreResult').textContent()).includes('At most 0 trade'));assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),saved);
    await page.locator('[data-action=return]').click();assert.equal(await page.locator('.report-item').count(),3);
    checks.push('Explore distinguishes binding and nonbinding ceilings and leaves the mission notebook unchanged');
    await page.reload();await page.locator('[data-action=start]').click();assert.equal(await page.locator('.report-item').count(),3);
    await page.locator('[data-action=replay]').click();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).attempts.length,key),0);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(out,'05-mission-mobile.png'),fullPage:true});await scan('mobile');
    checks.push('completed notebook survives reload, explicit replay starts fresh, and the mission fits 390px with zero automated accessibility violations');
    await context.close();
    const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await touchContext.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));await touch.goto(origin+'/games/market-shift/');await touch.locator('[data-action=start]').tap();await touch.locator('#graph').scrollIntoViewIfNeeded();
    const tsvg=await touch.locator('#graph').boundingBox(),th=await touch.locator('[data-drag=s] .handle').boundingBox(),cdp=await touchContext.newCDPSession(touch);const x=th.x+th.width/2,y=th.y+th.height/2;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-20/100*542*tsvg.width/680,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await touch.locator('#input-s').inputValue(),'-20');
    checks.push('touch dragging shifts supply on a mobile viewport');await touchContext.close();
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
