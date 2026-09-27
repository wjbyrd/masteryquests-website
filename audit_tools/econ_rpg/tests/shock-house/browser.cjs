// Run against a static server rooted at audit_tools/econ_rpg/game.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
const out=process.env.SHOCK_HOUSE_OUTPUT||'tmp/shock-house';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:Number(process.env.SHOCK_HOUSE_WIDTH)||1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const act=(action,id)=>page.locator(`button[data-action="${action}"]${id===undefined?'':`[data-id="${id}"]`}:not([inert] *):visible`).first().click();
  const open=id=>act('open',id);
  const back=()=>act('back');
  const room=async id=>{if(await page.locator('[data-action="back"]').count())await back();if(await page.locator('[data-action="room"][data-id="hall"]').count())await act('room','hall');if(id!=='hall')await act('room',id);};
  const doc=async id=>{await open(id);await back();};
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')));
  const checkSolved=async id=>assert((await saved()).solvedPuzzles.includes(id),`${id} should be solved`);
  async function slider(selector,value){const input=page.locator(selector);const min=Number(await input.getAttribute('min')),step=Number(await input.getAttribute('step'));await input.focus();await input.press('Home');for(let i=min;i<value;i+=step)await input.press('ArrowRight');assert.equal(Number(await input.inputValue()),value);}
  await page.goto(url);assert(!await page.locator('body').innerText().then(t=>t.includes('negative aggregate supply')));
  await act('begin');
  assert.equal(await page.locator('.hotspot,.object-list,.scene-caption,.scene-nav,.progress').count(),0,'No scaffold UI');
  assert.equal((await saved()).settings.showObjects,false,'Assistance outlines default off');
  assert.equal(await page.locator('.environment-object').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
  // Nonlinear exploration: final mechanism, locked room, powered-off radio, and cabinet.
  await open('exit');await act('solve','exit');assert.equal((await saved()).solvedPuzzles.length,0);await back();
  await act('room','policy');assert.equal((await saved()).currentRoom,'hall');
  await room('archive');await open('radio');assert(await page.locator('[data-action="tune"]').isDisabled());await back();
  await open('indicators');await act('solve','indicators');assert.equal((await saved()).solvedPuzzles.length,0);await back();
  await room('workshop');await open('cost');assert(await page.locator('[data-action="solve"]').isDisabled());await back();await doc('invoices');await doc('production');
  await room('residence');
  for(const id of ['pay','food','bills','notebook'])await doc(id);
  await open('budget');await act('hint');await act('more-hint');await act('more-hint');assert.equal((await saved()).hintLevels.budget,3);await act('close-hint');
  await act('solve','budget');assert(!(await saved()).solvedPuzzles.includes('budget'));
  const budgets={march:[3000,1400,600,200],april:[3200,1500,800,500]};
  for(const [month,values]of Object.entries(budgets))for(let i=0;i<values.length;i++){await act('select-slip',`${month}:${i}`);await act('place-budget',`${month}:${i}`);}
  await page.screenshot({path:`${out}/budget.png`,fullPage:true});await act('solve','budget');await checkSolved('budget');
  assert((await saved()).inventory.includes('badge'));
  // Resume from an earned item, preserving hints and discoveries.
  await page.reload();await act('continue');assert.equal((await saved()).hintLevels.budget,3);await room('workshop');await open('cost');await act('use-badge');
  await act('solve','cost');assert(!(await saved()).solvedPuzzles.includes('cost'));
  await act('reorder','invoices:0:1');await act('reorder','invoices:1:1');await page.screenshot({path:`${out}/invoices.png`});await act('solve','cost');await checkSolved('cost');assert(!(await saved()).inventory.includes('badge'));
  await back();await doc('stock');await open('orders');await act('job','B');await act('solve','orders');assert(!(await saved()).solvedPuzzles.includes('orders'));await act('job','B');await act('job','A');await act('job','C');await page.screenshot({path:`${out}/orders.png`});await act('solve','orders');await checkSolved('orders');
  await room('archive');await doc('national');await open('indicators');for(const id of ['household','costs','staffing'])await act('connect',id);
  await act('gauge','indicators:0');await act('solve','indicators');assert(!(await saved()).solvedPuzzles.includes('indicators'));
  await act('gauge','indicators:0');await act('gauge','indicators:1');await act('gauge','indicators:2');await page.screenshot({path:`${out}/indicators.png`});await act('solve','indicators');await checkSolved('indicators');
  await back();await doc('index');await open('radio');await page.locator('[data-knob]').press('Home');await page.locator('[data-knob]').press('ArrowRight');await page.locator('[data-knob]').press('ArrowRight');await page.selectOption('#date','March 14');await act('tune');assert.equal(await page.locator('[data-action="record-dispatch"]').count(),0);
  await page.locator('[data-knob]').press('ArrowRight');assert.equal((await saved()).frequency,270);
  for(const date of ['March 21','March 14','March 16']){await page.selectOption('#date',date);await act('tune');await act('record-dispatch');}
  await act('solve','radio');assert(!(await saved()).solvedPuzzles.includes('radio'));await act('clear-dispatches');
  for(const date of ['March 14','March 16','March 21']){await page.selectOption('#date',date);await act('tune');await act('record-dispatch');}
  await page.screenshot({path:`${out}/radio.png`,fullPage:true});await act('solve','radio');await checkSolved('radio');
  await room('policy');assert(!(await saved()).inventory.includes('access'));await doc('mandate');await doc('memo');await open('policy');
  await act('solve','policy');assert(!(await saved()).solvedPuzzles.includes('policy'));
  await slider('[data-input="policy"]',-3);assert.equal(await page.locator('#inflation-reading').innerText(),'4 / 10');assert.equal(await page.locator('#conditions-reading').innerText(),'0 / 10');
  await slider('[data-input="policy"]',3);assert.equal(await page.locator('#inflation-reading').innerText(),'10 / 10');assert.equal(await page.locator('#conditions-reading').innerText(),'6 / 10');
  await act('seal','prices');await act('seal','work');await page.screenshot({path:`${out}/policy.png`,fullPage:true});await act('solve','policy');await checkSolved('policy');
  // No naming of the mystery before the exit is completed.
  assert(!await page.locator('body').innerText().then(t=>/negative aggregate supply|stagflation|SRAS/.test(t)));
  await room('hall');await open('exit');
  for(const id of ['costs','broadcast','staffing','indicators','tradeoff'])await act('place-final',id);
  await act('solve','exit');assert(!(await saved()).solvedPuzzles.includes('exit'));
  await act('reorder','finalSequence:0:1');
  await page.reload();await act('continue');await open('exit');assert.equal((await saved()).finalSequence.length,5);
  await page.screenshot({path:`${out}/exit.png`,fullPage:true});await act('solve','exit');await checkSolved('exit');assert.equal((await saved()).stage,'escaped');
  await page.reload();await act('continue');assert.equal((await saved()).stage,'escaped');await act('reveal');
  assert(await page.getByRole('heading',{name:'You reconstructed a negative aggregate supply shock.'}).isVisible());
  await act('transfer');assert.equal((await saved()).transferDone,false);
  await act('gauge','transfer:0');await act('gauge','transfer:1');await act('gauge','transfer:2');await act('gauge','transfer:2');await act('transfer');assert.equal((await saved()).transferDone,true);
  await page.screenshot({path:`${out}/reveal.png`,fullPage:true});await act('results');assert.equal((await saved()).stage,'results');
  await page.screenshot({path:`${out}/results.png`,fullPage:true});const finished=await saved();
  await page.reload();await act('continue');assert(await page.getByRole('heading',{name:'ESCAPED',exact:true}).isVisible());
  await act('restart');await page.keyboard.press('Escape');assert.equal((await saved()).solvedPuzzles.length,7);
  await act('settings');await page.locator('[data-setting="showObjects"]').check();await act('close-dialog');assert.equal((await saved()).settings.showObjects,true);
  await act('restart');await act('confirm-new');assert.equal((await saved()).solvedPuzzles.length,0);assert.equal((await saved()).settings.showObjects,true);
  // Phone and narrow embed: all room objects have 44px targets and no horizontal overflow.
  const layouts=[];
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:844});await room('residence');
    const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,targets:[...document.querySelectorAll('.environment-object')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height}))}));
    assert(geometry.scroll<=width,`Horizontal page overflow at ${width}`);assert.equal(geometry.targets.length,5);assert(geometry.targets.every(r=>r.w>=43.9&&r.h>=43.9));layouts.push(geometry);
    if(width===390)await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
  }
  // Keyboard focus enters an object and returns to a room heading without a trap.
  await page.locator('.environment-object').first().focus();await page.keyboard.press('Enter');assert(await page.getByRole('heading',{name:'Two pay envelopes'}).evaluate(el=>el===document.activeElement));await back();assert(await page.getByRole('heading',{name:'The Residence',exact:true}).evaluate(el=>el===document.activeElement));
  // Malformed stored progress is detected rather than crashing or overwriting it.
  await page.evaluate(()=>localStorage.setItem('mastery-quests.shock-house.v1','{bad JSON'));await page.reload();assert(await page.getByText('Saved progress is unavailable.',{exact:false}).isVisible());await act('begin');
  // Storage-denied iframe/private-mode fallback remains playable.
  const denied=await browser.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}})});await denied.goto(url);await denied.getByRole('button',{name:'Begin investigation'}).click();assert(await denied.getByRole('heading',{name:'The Central Hall',exact:true}).isVisible());await denied.close();
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify({passed:true,puzzles:finished.solvedPuzzles,evidence:finished.evidence,hintUses:finished.hintUses,layouts,pageErrors:errors},null,2));
  console.log(JSON.stringify({passed:true,puzzles:finished.solvedPuzzles.length,evidence:finished.evidence.length,viewportWidths:layouts.map(x=>x.width),pageErrors:errors}));await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;process.exit();});
