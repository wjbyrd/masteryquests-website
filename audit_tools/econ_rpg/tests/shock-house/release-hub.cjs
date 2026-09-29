const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='tmp/signal-house-release/hub';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const [width,height] of [[1440,1000],[390,844],[844,390],[768,1024]]){
  const p=await browser.newPage({viewport:{width,height}});
  await p.goto('http://127.0.0.1:4178/games/');assert.equal(await p.locator('.game-card').count(),12);
  for(const game of ['signal-house','the-long-run']){
   const card=p.locator(`[data-game="${game}"]`),img=card.locator('img');await card.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
   assert(await img.evaluate(i=>i.naturalWidth>0));assert(await card.evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
   if(game==='the-long-run'){assert.equal(await img.evaluate(i=>i.naturalWidth),480);assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'contain');}
   await card.screenshot({path:`${out}/${game}-${width}.png`});
  }
  await p.locator('[data-game=signal-house] a').click();await p.waitForURL('**/games/signal-house/');assert.equal(await p.title(),'Signal House · Mastery Quests');
  // Render the exact enabled public build without enabling it for visitors.
  await p.route('http://127.0.0.1:4180/games/',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync('tmp/signal-house-release/enabled/games/index.html','utf8')}));
  await p.goto('http://127.0.0.1:4180/games/');const staged=p.locator('[data-game=signal-house]');
  assert.equal(await staged.getAttribute('data-game-number'),'12');assert.equal(await staged.locator('a').getAttribute('href'),'/games/signal-house/');
  await staged.scrollIntoViewIfNeeded();await staged.locator('img').evaluate(i=>i.decode());await staged.screenshot({path:`${out}/public-enabled-${width}.png`});await p.close();
 }
 console.log('Private 12-card hub, updated Long Run art, canonical local link, and enabled public card render passed at all four sizes.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
