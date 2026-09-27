// Targeted interaction, saved-world, and reduced-motion checks for the object pass.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
const output='tmp/shock-house/object-pass';fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const act=(action,id)=>page.locator(`button[data-action="${action}"]${id?`[data-id="${id}"]`:''}:not([inert] *):visible`).first().click();
 await page.goto(url);await act('begin');await act('room','residence');await page.screenshot({path:`${output}/residence.png`});
 const region=await page.locator('.environment-object[data-id="pay"]').boundingBox();assert(region.width>=44&&region.height>=44);
 await act('open','pay');assert(await page.locator('.pay-stub').first().evaluate(el=>el.getAnimations().length>0),'Envelope opens and stub lifts');
 await page.screenshot({path:`${output}/pay.png`});await act('back');
 for(const id of ['food','bills','notebook']){await act('open',id);await act('back');}
 await act('open','budget');
 await page.locator('[data-drag="budget"][data-id="march:0"]').dragTo(page.locator('[data-slot="march:0"]'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')).budget.march[0]),3000,'Native dragging places a slip');
 for(const id of ['march:1','march:2','march:3','april:0','april:1','april:2','april:3']){await act('select-slip',id);await act('place-budget',id);}
 await act('solve','budget');await act('back');assert.equal(await page.locator('.drawer-open').count(),1,'Drawer remains open in room');
 await act('open','budget');assert.equal(await page.locator('.drawer-impressions').count(),1,'Collected objects no longer occupy drawer');await act('back');
 await act('satchel');assert.equal(await page.locator('.pocket-object[data-id="badge"]').count(),1);await act('item','badge');assert(await page.locator('.physical-badge').isVisible());await act('back');
 // Create a valid six-puzzle fixture with the same version-1 engine, as an old save.
 const oldSave=await page.evaluate(async()=>{
  const {newState,complete,restore}=await import('./engine.js');const {DOCUMENTS}=await import('./content.js');
  const s=newState();s.inspectedObjects=[...Object.keys(DOCUMENTS),'badge-used'];s.budget={march:[3000,1400,600,200],april:[3200,1500,800,500]};complete(s,'budget');s.invoices=['early','middle','late'];complete(s,'cost');s.jobs=['A','C'];complete(s,'orders');s.connected=['household','costs','staffing'];s.indicators=[-1,1,1];complete(s,'indicators');s.broadcastSequence=['March 14','March 16','March 21'];complete(s,'radio');s.policyTried=['tight','loose'];s.seals=['prices','work'];complete(s,'policy');s.visitedRooms=['hall','residence','workshop','archive','policy'];s.inventory=[];s.hintLevels={budget:2,radio:3};s.hintUses=4;s.finalSequence=['costs','staffing'];if(!restore(s))throw Error('Invalid fixture');return s;
 });
 await page.evaluate(s=>localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s)),oldSave);await page.reload();await act('continue');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')).hintLevels),oldSave.hintLevels);
 for(const room of ['hall','residence','workshop','archive','policy']){
  if(room!=='hall')await act('room',room);
  await page.screenshot({path:`${output}/${room}-solved.png`});
  if(room==='archive'){assert.equal(await page.locator('.radio-body.powered').count(),1);}
  if(room!=='hall')await act('room','hall');
 }
 // Knob drag changes frequency. A transcript cannot be recorded after moving off it.
 await page.evaluate(s=>{s.solvedPuzzles=s.solvedPuzzles.filter(x=>!['radio','policy'].includes(x));s.evidence=s.evidence.filter(x=>!['broadcast','tradeoff'].includes(x));s.visitedRooms=['hall','archive'];s.currentRoom='archive';s.finalSequence=[];s.broadcastSequence=[];localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));},oldSave);
 await page.reload();await act('continue');await act('open','radio');
 const knob=await page.locator('[data-knob]').boundingBox();await page.mouse.move(knob.x+knob.width/2,knob.y+knob.height/2);await page.mouse.down();await page.mouse.move(knob.x+knob.width/2+90,knob.y+knob.height/2,{steps:8});await page.mouse.up();assert.equal(await page.locator('[data-knob]').getAttribute('aria-valuenow'),'270');
 await page.emulateMedia({reducedMotion:'reduce'});await act('back');await act('room','hall');await act('room','residence');await act('open','pay');assert.equal(await page.locator('.pay-stub').first().evaluate(el=>el.getAnimations().length),0,'Reduced motion removes paper movement');
 await act('back');await act('menu');await act('settings');await page.locator('[data-setting="showObjects"]').check();await act('close-dialog');assert.equal(await page.locator('.environment-object').first().evaluate(el=>getComputedStyle(el).borderStyle),'dashed');await page.screenshot({path:`${output}/assisted-objects.png`});
 // The door itself swings open; final instructional content remains gated behind it.
 await page.evaluate(async s=>{const {complete,FINAL_ORDER}=await import('./engine.js');s.finalSequence=[...FINAL_ORDER];complete(s,'exit');localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));},oldSave);await page.reload();await act('continue');assert.equal(await page.locator('.exit-leaf.is-opening').count(),1);assert(await page.getByRole('button',{name:'Step outside'}).isVisible());await page.screenshot({path:`${output}/door-open.png`});
 assert.deepEqual(errors,[]);fs.writeFileSync(`${output}/results.json`,JSON.stringify({passed:true,checks:['direct object regions','object-specific motion','dragging notebook slips','persistent open drawer','collected objects removed','satchel inspection','version-1 saves and hint history','five solved room states','pointer-operated radio','reduced motion','optional outlines','physical exit door'],pageErrors:errors},null,2));console.log('Object interactions, old saves, room changes, and reduced motion passed.');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;process.exit();});
