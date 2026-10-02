const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/',key='mastery-quests.shock-house.v1';
const out='tmp/shock-house/inspection-polish';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const [width,height,dpr] of [[1440,900,1],[768,1024,1],[390,844,3],[844,390,2]]){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:width!==1440,reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  const act=(a,id)=>p.locator(`button[data-action="${a}"]${id?'[data-id="'+id+'"]':''}:not([inert] *):visible`).first().click();
  const saved=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  const leave=async()=>{while(await p.locator('[data-action="back"]').count())await act('back');};
  const camera=async room=>{await leave();for(let i=0;i<5&&(await saved()).currentRoom!==room;i++)await act('pan','right');};
  const shot=async name=>{await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode().catch(()=>{}))));assert.equal(await p.locator('[data-failed]').count(),0);await p.screenshot({path:`${out}/${width}-${name}.png`});};
  await p.goto(url);await act('begin');await act('open','exit');
  assert.equal(await p.locator('.door-handle-art [data-asset="door_hardware_close"]').count(),1);await shot('door');
  await leave();await act('search','mail');assert.equal(await p.locator('[data-id="rent"]').count(),0);await shot('mail-closed');
  await act('move','postcard');await shot('mail-revealed');await act('search','rent');await act('discover','rent-read');assert((await saved()).inspectedObjects.includes('rent-read'));
  await camera('residence');await act('search','bag');
  assert(await p.locator('[data-action="move"][data-id="bread"]').isVisible(),'Bread is visible on the first bag click');
  assert(await p.locator('[data-action="move"][data-id="jar"]').isVisible(),'Jar is visible on the first bag click');
  assert.equal(await p.locator('[data-action="search"][data-id="groceries"]').count(),0,'No empty-bag intermediate step');
  await act('back');assert.equal(await p.locator('.inspection-object').count(),0,'One back returns to the room');await act('search','bag');
  assert.equal(await p.locator('.search-groceries .sprite-receipt,.search-groceries [data-action="search"]').count(),0);await shot('groceries-hidden');
  const bread=p.locator('[data-action="move"][data-id="bread"]');await bread.focus();await p.keyboard.press('Enter');
  assert.equal(await p.locator('[data-action="search"][data-id="receipt"]').count(),0,'March still needs the jar moved');assert(await p.locator('[data-id="tags"]').isVisible());
  await act('move','jar');await shot('groceries-revealed');await p.reload();await act('continue');await act('search','bag');
  assert.equal(await p.locator('.set-aside').count(),2);assert(await p.locator('[data-id="receipt"]').isVisible());await act('search','receipt');await act('discover','old-food');
  await leave();await act('search','ledger');assert.equal(await p.locator('[data-asset="study_shelf_close"]').count(),1);await shot('shelf');
  await leave();await act('search','desk');await act('open','budget');assert.equal(await p.locator('.household-balance .calibrated-gauge').count(),0);assert.equal(await p.locator('.desk-balance-indicator').count(),3);await act('household-dial','0');await shot('household');
  await camera('workshop');await act('search','tray');await shot('catalogue-closed');
  if(width===1440)await p.emulateMedia({reducedMotion:'no-preference'});
  await act('move','catalogue');await p.locator('.open-catalogue').waitFor();await p.emulateMedia({reducedMotion:'reduce'});
  assert(await p.locator('.open-catalogue').isVisible());assert((await saved()).inspectedObjects.includes('shipping-date'));assert((await p.locator('.shipping-record').innerText()).includes('MARCH 16'));
  const note=await p.locator('.shipping-record').boundingBox(),book=await p.locator('.open-catalogue').boundingBox();assert(note.x>=book.x&&note.x+note.width<=book.x+book.width+3&&note.y>=book.y&&note.y+note.height<=book.y+book.height+3,'Tag stays inside book');
  assert(await p.locator('.shipping-record').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Tag text fits');await shot('catalogue-open');
  await p.reload();await act('continue');await act('search','tray');assert(await p.locator('.open-catalogue').isVisible());assert.equal(await p.locator('[data-action="move"][data-id="catalogue"]').count(),0);
  // An older save may have moved the cover without taking the former extra click.
  if(width===1440){await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.inspectedObjects=s.inspectedObjects.filter(x=>!['search:files','shipping-date'].includes(x));localStorage.setItem(k,JSON.stringify(s));},key);await p.reload();await act('continue');await act('search','tray');assert((await saved()).inspectedObjects.includes('shipping-date'));}
  await leave();await act('search','bin');await shot('bin-closed');await act('move','bin-lid');assert.equal(await p.locator('.bin-materials .material-token').count(),6);await shot('bin-open');await act('open','stock');await shot('stock');
  await camera('archive');await act('search','television');for(let n=0;n<3;n++){await act('tv-channel','next');assert.equal(await p.locator('.news-broadcast footer').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');}await shot('tv');
  if(dpr>1){await camera('residence');await act('search','ledger');assert(!(await p.locator('.mini-scene>.asset-plate').getAttribute('src')).includes('-768'));}
  assert.deepEqual(errors,[]);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log(JSON.stringify({passed:true,width,height,dpr,checks:['full door hardware','concealed mail','bread and jar gates','moved-state reload','dedicated shelf','domestic catches','one-click open book and discovery','book reload','six steel blanks','TV backing removed','high-density source']}));await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
