// Prior saves, real pointer gestures, and accessibility regressions.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=async(action,id)=>{await page.locator(`button[data-action="${action}"]${id?`[data-id="${id}"]`:''}:not([inert] *):visible`).first().click();if(['search','open','back'].includes(action))await page.waitForFunction(()=>![...document.querySelectorAll('.scene,.mini-scene')].some(el=>el.getAnimations().some(a=>a.playState==='running')));};
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')));
 await page.goto(url);await act('begin');await act('pan','right');
 assert.equal((await saved()).currentRoom,'residence');
 assert.equal(await page.locator('.departing-scene').count(),1,'Camera translates adjacent scenes');
 assert(await page.locator('.scene').first().evaluate(el=>el.getAnimations().length>0));
 assert.equal(await page.locator('.departing-scene').getAttribute('aria-hidden'),'true');
 await page.locator('.departing-scene').waitFor({state:'detached'});
 const oldSave=await page.evaluate(async()=>{
  const {newState,complete,restore}=await import('./engine.js'),{DOCUMENTS}=await import('./content.js');
  const s=newState();s.inspectedObjects=[...Object.keys(DOCUMENTS),'badge-used'];s.budget={march:[3000,1400,600,200],april:[3200,1500,800,500]};complete(s,'budget');s.invoices=['early','middle','late'];complete(s,'cost');s.jobs=['A','C'];complete(s,'orders');s.connected=['household','costs','staffing'];s.indicators=[-1,1,1];complete(s,'indicators');s.broadcastSequence=['March 14','March 16','March 21'];complete(s,'radio');s.policyTried=['tight','loose'];s.seals=['prices','work'];complete(s,'policy');s.visitedRooms=['hall','residence','workshop','archive','policy'];s.inventory=[];s.hintLevels={budget:2,radio:3};s.hintUses=4;s.finalSequence=['costs','staffing'];s.currentRoom='archive';if(!restore(s))throw Error('Invalid fixture');return s;
 });
 await page.evaluate(s=>localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s)),oldSave);await page.reload();await act('continue');
 assert.deepEqual((await saved()).hintLevels,oldSave.hintLevels);assert.deepEqual((await saved()).finalSequence,oldSave.finalSequence);
 await act('search','records');await act('search','register');assert.equal(await page.locator('[data-action="open"][data-id="national"]').count(),1,'Old national discovery does not require rediscovery');
 await page.evaluate(async()=>{const {newState}=await import('./engine.js');const s=newState();s.currentRoom='residence';s.inspectedObjects=['pay','food','bills','notebook'];localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));});await page.reload();await act('continue');await act('search','ledger');await act('search','book');await act('open','notebook');await act('open','budget');
 await page.locator('.open-ledger').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
 await page.locator('[data-drag="budget"][data-id="march:0"]').dragTo(page.locator('[data-slot="march:0"]'));assert.equal((await saved()).budget.march[0],3000);
 await page.evaluate(s=>{s.solvedPuzzles=s.solvedPuzzles.filter(x=>!['radio','policy'].includes(x));s.evidence=s.evidence.filter(x=>!['broadcast','tradeoff'].includes(x));s.visitedRooms=['hall','archive'];s.currentRoom='archive';s.finalSequence=[];s.broadcastSequence=[];localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));},oldSave);await page.reload();await act('continue');await act('search','receiver');await act('open','radio');
 const knob=await page.locator('[data-knob]').boundingBox();await page.mouse.move(knob.x+knob.width/2,knob.y+knob.height/2);await page.mouse.down();await page.mouse.move(knob.x+knob.width/2+90,knob.y+knob.height/2,{steps:8});await page.mouse.up();assert.equal((await saved()).frequency,270);assert.equal((await saved()).tuned,false);
 await page.emulateMedia({reducedMotion:'reduce'});await act('back');await act('back');await act('pan','right');assert.equal(await page.locator('.departing-scene').count(),0,'Reduced motion skips camera slide');
 await act('menu');await act('settings');await page.locator('[data-setting="showObjects"]').check();await act('close-dialog');assert.equal(await page.locator('.environment-object').first().evaluate(e=>getComputedStyle(e).borderStyle),'dashed');
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await touch.goto(url);await touch.locator('[data-action="begin"]').click();
 const cdp=await touch.context().newCDPSession(touch);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:315,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:90,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await touch.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')).currentRoom),'residence');assert.equal(await touch.locator('.inspection-layer').count(),0);await touch.close();
 await page.evaluate(()=>localStorage.setItem('mastery-quests.shock-house.v1','{bad JSON'));await page.reload();assert(await page.getByText('Saved progress is unavailable.',{exact:false}).isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('mastery-quests.shock-house.v1')),'{bad JSON');
 const denied=await browser.newPage();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));await denied.goto(url);await denied.locator('[data-action="begin"]').click();assert.equal(await denied.locator('.scene').count(),1);await denied.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['camera translation','old saves','partial final sequence','dragging','pointer tuning','reduced motion','optional outlines','touch swipe','malformed saves','storage denied']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
