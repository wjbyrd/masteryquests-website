const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const act=(a,id)=>page.locator(`button[data-action="${a}"]${id?'[data-id="'+id+'"]':''}:not([inert] *):visible`).first().click();
  await page.goto(url);await act('begin');
  await page.evaluate(()=>{const key='mastery-quests.shock-house.v1',s=JSON.parse(localStorage.getItem(key));Object.assign(s,{currentRoom:'residence',solvedPuzzles:['budget','cost','orders'],evidence:['household','date','costs','staffing'],inventory:[],inspectedObjects:['output-read','work-read','prices-read','moved:gardening'],hintLevels:{indicators:3}});localStorage.setItem(key,JSON.stringify(s));});
  await page.reload();await act('continue');await act('search','ledger');
  assert.equal(await page.locator('[data-id="gardening"]').count(),0,'Old gardening discovery stays inactive in Mission 1');
  await act('hint');assert((await page.locator('.hint-panel').innerText()).includes('tall bookcase immediately to its left'));await act('close-hint');
  await act('back');await act('pan','right');await act('pan','right');await act('search','records');
  const records=await page.locator('.mini-scene').boundingBox();await page.mouse.click(records.x+records.width*.30,records.y+records.height*.37);
  await page.locator('[data-closeup="register"]').waitFor();
  assert(!(await page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')).inspectedObjects.includes('national'))),'Player has only read TV bulletins, not the redundant register summary');
  await act('hint');assert((await page.locator('.hint-panel').innerText()).includes('Click its brass clasp'));await act('close-hint');
  // The corrected book perspective places the painted brass button at 60% x, 49% y.
  await page.screenshot({path:`tmp/shock-house/register-${width}.png`});
  const book=await page.locator('.mini-scene').boundingBox();await page.mouse.click(book.x+book.width*.60,book.y+book.height*.49);
  assert.equal(await page.locator('[data-action="connect"]').count(),3);
  for(const id of ['household','costs','staffing'])await act('connect',id);
  assert.equal(await page.locator('.record-socket.inserted').count(),3);
  await act('solve','indicators');assert((await page.locator('.room-notice').innerText()).includes('direction dials'));
  for(const id of ['indicators:0','indicators:0','indicators:1','indicators:2'])await act('gauge',id);
  await act('solve','indicators');
  assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')).solvedPuzzles.includes('indicators')),'Correct photographed setup must solve without an extra summary-page visit');
  await page.close();
 }
 console.log(JSON.stringify({passed:true,checks:['old gardening discovery inactive','hint identifies television bookcase','visible register position','all bulletins unlock national pages','indicator mechanism accessible','desktop and phone']}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
