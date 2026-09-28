const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
const key='mastery-quests.shock-house.v1';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width===390}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.locator('[data-action="begin"]').click();
   // Resume a legacy save whose player has already found only two bulletins.
   await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.currentRoom='archive';s.inspectedObjects.push('output-read','work-read');localStorage.setItem(key,JSON.stringify(s));},key);
   const enter=async()=>{await page.reload();await page.locator('[data-action="continue"]').click();await page.locator('[data-action="search"][data-id="television"]').click();};
   await enter();
   assert.equal(await page.locator('.mini-scene .component-target').count(),2);
   // Click the actual illustrated knob positions, not a hidden third target.
   const turn=async y=>{const b=await page.locator('.mini-scene').boundingBox();const x=b.x+b.width*.81,top=b.y+b.height*y;if(width===390)await page.touchscreen.tap(x,top);else await page.mouse.click(x,top);};
   const channel=async(n,text)=>{assert.match(await page.locator('.television-glass').innerText(),new RegExp(`CHANNEL ${n} / 3`));assert((await page.locator('.television-glass').innerText()).includes(text));};
   await channel(2,'5% → 8%');await turn(.28);await channel(3,'100 → 108');
   await turn(.28);await channel(1,'200 → 184');await turn(.44);await channel(3,'100 → 108');
   await enter();await channel(3,'100 → 108');
   const markers=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).inspectedObjects,key);
   for(const id of ['output-read','work-read','prices-read'])assert.equal(markers.filter(x=>x===id).length,1);
   const knob=page.getByRole('button',{name:'Upper tuning knob: next channel'});await knob.focus();await page.keyboard.press('Enter');await channel(1,'200 → 184');
   assert.equal(await page.locator('.mini-scene [title]').count(),0);
   await page.locator('.mini-scene .asset-plate').evaluate(img=>img.decode());
   fs.mkdirSync('tmp/shock-house/television',{recursive:true});await page.screenshot({path:`tmp/shock-house/television/${width}.png`});
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log(JSON.stringify({passed:true,checks:['visible knob pointer alignment','phone touch controls','all three channels','forward and reverse wrap','legacy save and reload','keyboard controls','no hover labels']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
