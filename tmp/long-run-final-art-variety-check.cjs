const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),before=await browser.newPage({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4179/games/the-long-run/');await before.goto(pathToFileURL(path.resolve('tmp/the-long-run-pre-final-art.html')).href);
 const cases=[[],['confidence','fiscal-expand','rate-cut'],['energy','fiscal-contract','rate-hike'],['breakthrough','fiscal-hold','rate-hold','infrastructure']];
 for(const ids of cases){const run=p=>p.evaluate(ids=>{economy=initialEconomy();recordYear();ids.forEach(stepEconomy);render();return pixelWorld.inspect().objects;},ids);assert.deepEqual(await run(page),await run(before));}
 const result=await page.evaluate(()=>{
  const failures=[],styles=COMMERCIAL_STYLES.map(style=>({style,width:commercialSprites[style].frames[0][0].length,height:commercialSprites[style].frames[0].length}));
  for(const style of COMMERCIAL_STYLES){const frames=commercialSprites[style].frames,w=frames[0][0].length;for(const f of frames){if(f.length!==31||f.some(row=>row.length!==w))failures.push('Inconsistent '+style);for(const row of f)for(const c of row)if(c!==' '&&!(c in PIXEL_PALETTE))failures.push('Unknown color');if(f[30].trim().length===0)failures.push('Missing road contact');}}
  const choices={};for(const every of [3,5,8])choices[every]=Array.from({length:10},(_,i)=>i).filter(i=>i%every===0).map(i=>commercialVariant(i,every));
  if(new Set(choices[3]).size!==3)failures.push('Busy traffic lacks variety');
  for(const every of [3,5,8])for(let i=0;i<10;i++)if(commercialVariant(i,every)!==commercialVariant(i,every))failures.push('Unstable variant');
  // Render a native-scale standing adult beside each body, with all wheel/foot contacts aligned.
  const c=document.createElement('canvas');c.width=1160;c.height=410;const ctx=c.getContext('2d');ctx.fillStyle='#e8f4fa';ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=false;
  const draw=(frame,x,baseline,scale=4)=>{const y=baseline-(frame.length-1)*scale;frame.forEach((row,yy)=>[...row].forEach((v,xx)=>{if(v!==' '){ctx.fillStyle=PIXEL_PALETTE[v];ctx.fillRect(x+xx*scale,y+yy*scale,scale,scale);}}));};
  const person=sprites.pedestrian.frames[SPRITE_WALK.idleFrame];
  [['compact',sprites.compact.frames[0]],['sedan',sprites.sedan.frames[0]],...COMMERCIAL_STYLES.map(style=>[style,commercialSprites[style].frames[0]])].forEach(([label,frame],i)=>{
    const x=(i%3)*385,y=Math.floor(i/3)*195;ctx.fillStyle='#9eafb8';ctx.fillRect(x+10,y+168,355,2);draw(person,x+5,y+164);draw(frame,x+105,y+164);ctx.fillStyle='#192e40';ctx.font='17px system-ui';ctx.fillText(label,x+110,y+28);
  });
  return {failures,styles,choices,png:c.toDataURL().split(',')[1]};
 });assert.deepEqual(result.failures,[]);fs.writeFileSync('tmp/long-run-final-art-scale-and-variety.png',Buffer.from(result.png,'base64'));delete result.png;console.log('PASS: visual-only commercial selection, unchanged traffic objects in four states, variant geometry and contact:',result);
 // The actual busy scene renders all three commercial styles; repeated render at the same moment is identical.
 await page.evaluate(()=>{economy=initialEconomy();recordYear();['confidence','fiscal-expand','rate-cut'].forEach(stepEconomy);render();});
 const scene1=await page.locator('#pixel-world').evaluate(c=>c.toDataURL());await page.evaluate(()=>renderWorld());assert.equal(await page.locator('#pixel-world').evaluate(c=>c.toDataURL()),scene1);
 await page.locator('.world-window').screenshot({path:'tmp/long-run-final-art-varied-traffic.png'});console.log('PASS: stable repeated actor render.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
