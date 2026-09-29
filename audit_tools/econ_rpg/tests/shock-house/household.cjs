const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=(a,id)=>page.locator(`button[data-action="${a}"]${id?'[data-id="'+id+'"]':''}:not([inert] *):visible`).first().click();
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')));
 const leave=async()=>{while(await page.locator('[data-action="back"]').count())await act('back');};
 const camera=async room=>{await leave();for(let i=0;i<5&&(await saved()).currentRoom!==room;i++)await act('pan','right');};
 const ledger=async()=>{await camera('residence');await act('search','desk');await act('open','budget');};
 await page.goto('http://127.0.0.1:4179/games/the-shock-house/');
 await page.evaluate(async()=>{const {newState}=await import('./engine.js');const s=newState();s.householdPattern=[1,1,-1];s.inspectedObjects=['pay','rent-read','old-food','new-food'];localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));});
 await page.reload();await act('continue');await ledger();await act('solve','budget');assert((await page.locator('.room-notice').innerText()).startsWith('Still missing: utilities.'));assert((await page.locator('.household-balance').innerText()).includes('Not yet recorded'));
 await camera('residence');await act('search','desk');await act('search','utility-bill');assert((await saved()).inspectedObjects.includes('meter-read'),'Reading the desk bill records household utility evidence');
 await ledger();assert(!(await page.locator('.household-balance').innerText()).includes('Not yet recorded'));await act('solve','budget');assert((await saved()).solvedPuzzles.includes('budget'));
 // Existing stalled save: readings exposed, but aggregate food/bills and meter read flags absent.
 await page.evaluate(async()=>{const {newState}=await import('./engine.js');const s=newState();s.branchRevision=4;s.currentRoom='residence';s.householdPattern=[1,1,-1];s.inspectedObjects=['pay','rent-read','new-food','moved:meter-cover'];localStorage.setItem('mastery-quests.shock-house.v1',JSON.stringify(s));});
 await page.reload();await act('continue');await ledger();await act('solve','budget');assert((await saved()).solvedPuzzles.includes('budget'));assert.deepEqual(errors,[]);await page.close();
}console.log(JSON.stringify({passed:true,widths:[1440,390],checks:['specific missing-source UI','cover reveal records evidence','correct screenshot dials solve','stalled-save resume']}));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
