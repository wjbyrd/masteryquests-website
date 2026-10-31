'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MQ_PLAYWRIGHT_MODULE||'playwright');
const out=path.resolve(__dirname,'../../../../../tmp/market-shift'),key='mq-market-shift-prototype-v2',checks=[],errors=[];
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const model=await import('./model.js'),{plot}=await import('./graph.js');
  const {previewServer}=await import('../../../serve.mjs'),server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;let browser;
  try{
    browser=await chromium.launch({headless:true,channel:'msedge'});const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
    if(process.env.MQ_AXE_MODULE)await context.route(origin+'/__qa_axe.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(require.resolve(process.env.MQ_AXE_MODULE),'utf8')}));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    const shot=name=>page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
    async function scan(name){if(!process.env.MQ_AXE_MODULE)return;if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({url:origin+'/__qa_axe.js'});const result=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));fs.writeFileSync(path.join(out,name+'-axe.json'),JSON.stringify(result.violations,null,2));assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
    async function enter(id,value){await page.locator('#input-'+id).fill(String(value));await page.locator('#input-'+id).press('Tab');}
    async function range(id,value){const input=page.locator('#input-'+id),min=Number(await input.getAttribute('min')),step=Number(await input.getAttribute('step'));await input.focus();await input.press('Home');for(let i=0;i<Math.round((value-min)/step);i++)await input.press('ArrowRight');}
    async function labelsClear(){const collisions=await page.locator('#graph').evaluate(svg=>{const texts=[...svg.querySelectorAll('text')].map(e=>({text:e.textContent,b:e.getBBox()}));const hits=[];for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){const a=texts[i].b,b=texts[j].b;if(a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height)hits.push([texts[i].text,texts[j].text]);}return hits;});assert.deepEqual(collisions,[]);}
    async function solveCurrent(){const r=await state(),m=model.missions(r)[r.index];if(m.type==='shift'){await range('d',m.d*20);await range('s',m.s*10);const e=model.market(m.d*20,m.s*10);await enter('q',e.q);await enter('p',e.p);}else{const a=model.atPrice(m.price,0,0,m.type);await range('price',m.price);await enter('qs',a.qs);await enter('qd',a.qd);}await page.locator('[data-action=check]').click();assert(await page.locator('.debrief').isVisible(),m.id);await labelsClear();}
    await page.goto(origin+'/games/market-shift/');await page.locator('[data-action=start]').waitFor();await shot('v2-01-landing');await scan('v2-intro');
    await page.locator('[data-action=start]').click();assert.equal(await page.locator('.progress li').count(),5);assert.equal(await page.locator('.graph-card').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    const original=await state(),first=model.missions(original)[0];
    await page.locator('[data-action=check]').click();assert((await page.locator('#feedback').textContent()).includes('event shifts demand'));
    await page.locator('[data-action=hint]').click();
    const svg=await page.locator('#graph').boundingBox(),handle=await page.locator('[data-drag=d] .handle').boundingBox(),dx=first.d*20/100*(plot.right-plot.left)*svg.width/plot.width;
    await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2+dx,handle.y+handle.height/2,{steps:8});await page.mouse.up();assert.equal(await page.locator('#input-d').inputValue(),String(first.d*20));
    const e=model.market(first.d*20,0),eq=await page.locator('[data-drag=e] .handle').boundingBox();
    await page.mouse.move(eq.x+eq.width/2,eq.y+eq.height/2);await page.mouse.down();await page.mouse.move(svg.x+(plot.left+e.q/100*(plot.right-plot.left))*svg.width/plot.width,svg.y+(plot.bottom-e.p/120*(plot.bottom-plot.top))*svg.height/plot.height,{steps:8});
    assert((await page.locator('#liveValues').textContent()).includes('$'+e.p));assert((await page.locator('#liveValues').textContent()).includes(String(e.q)));await page.mouse.up();await labelsClear();await shot('v2-02-live-forecast');await scan('v2-mission');
    await page.reload();await page.locator('[data-action=start]').click();assert.deepEqual((await state()).plan,original.plan);assert.equal(await page.locator('#input-d').inputValue(),String(first.d*20));
    await page.locator('[data-action=check]').click();assert(await page.locator('#input-d').isDisabled());await page.locator('[data-action=next]').click();
    checks.push('five mission route; white graph; mouse curve/E dragging updates live coordinates; draft restores exact scenarios and values');
    for(let i=1;i<4;i++){await solveCurrent();if(i===2)await shot('v2-03-both-curves');await page.locator('[data-action=next]').click();}
    const policy=model.missions(await state())[4],actual=model.atPrice(policy.price,0,0,policy.type);
    await range('price',policy.price);await enter('qs',actual.qd);await enter('qd',actual.qs);await page.locator('[data-action=check]').click();assert((await page.locator('#feedback').textContent()).includes('reversed'));
    await enter('qs',actual.qs);await enter('qd',actual.qd);await page.locator('[data-action=check]').click();assert((await page.locator('#resultStrip').textContent()).includes(policy.type==='ceiling'?'Shortage':'Surplus'));await labelsClear();await scan('v2-policy');await shot('v2-04-policy');await page.locator('[data-action=next]').click();
    checks.push('keyboard controls complete supply and both simultaneous-shift missions; policy distinguishes swapped quantities and explains limited trade');
    let r=await state(),q=model.quizQuestions(r)[0];const order=await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>e.dataset.choice));
    await page.locator(`[data-choice="${(q.correct+1)%4}"]`).click();assert(await page.locator('.quiz-feedback').isVisible());assert.equal(await page.locator('[data-action=quiz-next]').count(),0);await scan('v2-quiz-feedback');await shot('v2-05-quiz');
    await page.reload();await page.locator('[data-action=start]').click();assert.deepEqual(await page.locator('[data-choice]').evaluateAll(es=>es.map(e=>e.dataset.choice)),order);assert.equal((await state()).quiz.answers[0].length,1);
    for(let i=0;i<5;i++){r=await state();q=model.quizQuestions(r)[i];await page.locator(`[data-choice="${q.correct}"]`).click();assert(await page.locator('[data-choice]').first().isDisabled());await page.locator('[data-action=quiz-next]').click();}
    assert.equal(await page.locator('.report-item').count(),5);assert((await page.locator('.recall-summary').textContent()).includes('4 / 5'));assert((await page.locator('.report-item').first().textContent()).includes('2 forecasts · 1 hint'));await scan('v2-report');await shot('v2-06-notebook');
    const pending=page.waitForEvent('download');await page.locator('[data-action=download]').click();await (await pending).saveAs(path.join(out,'v2-notebook.txt'));const notebook=fs.readFileSync(path.join(out,'v2-notebook.txt'),'utf8');assert(notebook.includes('Forecast 1: direction'));assert(notebook.includes('Answer 2:'));
    checks.push('five recall questions match played stories; retry and shuffled options survive reload; notebook separates first responses and exports all evidence');
    const saved=await state();await page.locator('[data-action=explore]').click();
    await page.locator('#policySelect').selectOption('ceiling');await range('price',120);assert((await page.locator('#exploreResult').textContent()).includes('does not force price up'));await range('price',0);assert((await page.locator('#exploreResult').textContent()).includes('At most 0 trade'));await labelsClear();
    await page.locator('#policySelect').selectOption('floor');await range('price',0);assert((await page.locator('#exploreResult').textContent()).includes('does not force price down'));await range('price',120);assert((await page.locator('#graph').textContent()).includes('Qs >100'));await labelsClear();assert.deepEqual(await state(),saved);
    await page.locator('[data-action=return]').click();await page.reload();await page.locator('[data-action=start]').click();assert.equal(await page.locator('.report-item').count(),5);await page.locator('[data-action=replay]').click();const replay=await state();assert(replay.plan.every((id,i)=>id!==original.plan[i]));assert.notEqual(model.missions(replay)[4].type,policy.type);
    checks.push('free exploration handles binding/nonbinding floors and ceilings without changing the notebook; replay changes all five stories and alternates policy');
    await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await labelsClear();await scan('v2-mobile');await shot('v2-07-mobile');
    for(let i=0;i<4;i++){await solveCurrent();await page.locator('[data-action=next]').click();}
    await enter('qs',50);await enter('qd',50);await range('price',120);await labelsClear();await range('price',0);await labelsClear();await shot('v2-08-mobile-labels');await solveCurrent();await scan('v2-mobile-policy');await shot('v2-09-mobile-policy');await page.locator('[data-action=next]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('v2-10-mobile-quiz');
    checks.push('390px layout fits; both policy types complete; equal quantity markers and extreme prices keep graph text separated');
    await context.close();
    const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await touchContext.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());const touch=await touchContext.newPage();touch.on('pageerror',e=>errors.push(e.message));await touch.goto(origin+'/games/market-shift/');await touch.locator('[data-action=start]').tap();await touch.locator('#graph').scrollIntoViewIfNeeded();
    const tsvg=await touch.locator('#graph').boundingBox(),th=await touch.locator('[data-drag=d] .handle').boundingBox(),cdp=await touchContext.newCDPSession(touch),x=th.x+th.width/2,y=th.y+th.height/2;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-20/100*(plot.right-plot.left)*tsvg.width/plot.width,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await touch.locator('#input-d').inputValue(),'-20');
    checks.push('real touch input drags the demand handle on a mobile viewport');await touchContext.close();
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'v2-browser-results.json'),JSON.stringify({passed:checks.length,checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,checks},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
