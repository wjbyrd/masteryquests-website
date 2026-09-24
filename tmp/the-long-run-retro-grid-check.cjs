const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const width of [1440,1366,768,390]){
 const page=await browser.newPage({viewport:{width,height:width<700?844:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4179/games/the-long-run/');
 if(width===1440)await page.screenshot({path:'tmp/the-long-run-retro-full-page.png',fullPage:true});
 await page.locator('[data-choice="confidence"]').click();await page.waitForFunction(()=>economy.phase==='choice');
 const data=await page.evaluate(()=>{
  const palette=new Set(Object.values(TOWN_PALETTE).map(x=>x.toLowerCase()));
  const canvases=[...document.querySelectorAll('.city-surface canvas')];
  const grid=canvases.map(c=>{const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,colors=new Set();let partialAlpha=0;
   for(let i=0;i<d.length;i+=4){if(d[i+3]!==0&&d[i+3]!==255)partialAlpha++;if(d[i+3])colors.add('#'+[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''));}
   return {width:c.width,height:c.height,partialAlpha,offPalette:[...colors].filter(x=>!palette.has(x)),smoothing:g.imageSmoothingEnabled};});
  return {grid,svg:document.querySelectorAll('#world-shell svg').length,overflow:document.documentElement.scrollWidth>innerWidth,
   bodyFont:getComputedStyle(document.body).fontFamily,buttonRadius:getComputedStyle(document.querySelector('.choice')).borderRadius,
   calloutRadius:getComputedStyle(document.querySelector('.callout')).borderRadius,description:document.querySelector('#world-description').textContent,
   messages:[...document.querySelectorAll('.callout')].every(e=>e.scrollWidth<=e.clientWidth&&e.querySelector('p').textContent.length>0)};
 });
 assert.equal(data.svg,0);assert.equal(data.grid.length,2);assert.equal(data.overflow,false);assert.equal(data.calloutRadius,'0px');assert.equal(data.buttonRadius,'10px');assert.equal(data.messages,true);
 for(const c of data.grid){assert.equal(c.width,480);assert.equal(c.height,270);assert.equal(c.partialAlpha,0);assert.deepEqual(c.offPalette,[]);assert.equal(c.smoothing,false);}
 assert.ok(data.description.includes('monthly work income'));assert.deepEqual(errors,[]);
 if(width===1366||width===390)await page.screenshot({path:`tmp/the-long-run-retro-${width}-page.png`,fullPage:true});
 console.log(width,'live preview, shared grid/palette, readable messages, modern shell: PASS');await page.close();
}
}finally{await browser.close();}})();
