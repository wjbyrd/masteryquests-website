const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
fs.mkdirSync('tmp/shock-house/illustrated',{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'no-preference'}),errors=[],requests=new Set();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('.webp'))requests.add(r.url());});
 await page.addInitScript(()=>{window.motionTrace=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){window.motionTrace.push({className:this.className,frames});return animate.call(this,frames,options);};});
 const act=(a,id)=>page.locator(`button[data-action="${a}"]${id?'[data-id="'+id+'"]':''}:not([inert] *):visible`).first().click();
 await page.goto(url);await act('begin');await page.locator('.scene .asset-plate').evaluate(e=>e.decode());
 assert(requests.size<=4,'Initial view does not load every large asset');
 assert.equal(await page.locator('[data-id="coat"],[data-id="frame"]').count(),0,'Second-mission objects are scenery during the first case');
 await act('pan','right');await page.locator('.departing-scene').waitFor({state:'detached'});await page.locator('[data-id="desk"]').hover();assert.equal(await page.locator('[title],[role="tooltip"],.search-note,.search-prop').count(),0);
 await act('search','desk');await page.locator('[data-closeup="desk"]').waitFor();assert(await page.evaluate(()=>motionTrace.some(t=>t.className==='scene'&&t.frames.some(f=>f.transform?.includes('scale(')))),'Camera pushes toward the desk');
 assert.equal((await page.locator('.mini-scene').innerText()).trim(),'','Discovery has no visible action labels or prose');
 // Mobile scene targets, real art variants, and paper reading area.
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.reload();await act('continue');await act('search','desk');
 for(const rect of await page.locator('.component-target').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))))assert(rect.w>=44&&rect.h>=44);
 assert((await page.locator('.mini-scene .asset-plate').getAttribute('src')).includes('-768.webp'));
 await page.screenshot({path:'tmp/shock-house/illustrated/desk-phone.png'});await act('back');await act('search','bag');await act('search','groceries');await act('move','jar');await act('move','bread');await act('search','receipt');await act('discover','old-food');await page.screenshot({path:'tmp/shock-house/illustrated/receipt-phone.png'});
 assert.equal(await page.locator('.physical-print').evaluate(e=>getComputedStyle(e).fontSize),'12px');
 // A missing plate falls back without losing targets or economic progress.
 const fallback=await browser.newPage({reducedMotion:'reduce'});await fallback.route('**/drawer_close*.webp',route=>route.abort());await fallback.goto(url);await fallback.locator('[data-action="begin"]').click();await fallback.locator('[data-action="pan"][data-id="right"]').click();await fallback.locator('[data-action="search"][data-id="desk"]').click();await fallback.locator('[data-action="search"][data-id="drawer"]').click();await fallback.locator('.mini-scene img[data-failed="true"]').waitFor();assert.equal(await fallback.locator('.mini-scene .component-target').count(),1);await fallback.locator('[data-action="search"][data-id="wallet"]').click();await fallback.locator('[data-action="move"][data-id="wallet"]').click();assert.equal(await fallback.locator('[data-action="open"][data-id="pay"]').count(),1);await fallback.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['real image plates','bounded preloading','no hover labels','camera push','first-case cleanup','mobile hit regions','small art variants','readable paper','missing image fallback']}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
