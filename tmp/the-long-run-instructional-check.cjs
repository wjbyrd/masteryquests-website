const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const old=fs.readFileSync('tmp/the-long-run-pre-instructional-ux.html','utf8').replaceAll('\r\n','\n');
const now=fs.readFileSync('audit_tools/econ_rpg/game/games/the-long-run/index.html','utf8').replaceAll('\r\n','\n');
const segment=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
for(const [a,b] of [['/* 9. GAME DATA','function economicExplanations()'],['function transferQuestion()','function renderFinalReport()'],['function renderGraph(','/* 19. ACCESSIBILITY —']])assert.equal(segment(now,a,b),segment(old,a,b));
assert.equal(segment(now,'<h3>What happened?','<h3>Why did'),segment(old,'<h3>What happened?','<h3>Why did'));
const oldHub=fs.readFileSync('tmp/the-long-run-hub-before.html','utf8').replaceAll('\r\n','\n');
const newHub=fs.readFileSync('audit_tools/econ_rpg/game/games/index.html','utf8').replaceAll('\r\n','\n');
assert.equal(newHub.replace(/      <article class="game-card" data-game="the-long-run"[\s\S]*?<\/article>\n/,''),oldHub);
function api(html){let code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\nrender\(\);\s*$/,'');code=code.slice(0,code.indexOf('/* PIXEL ANIMATION'))+code.slice(code.indexOf('function renderTimeline()'));const c={document:{addEventListener(){}},matchMedia:()=>({matches:true}),structuredClone,setTimeout};vm.createContext(c);vm.runInContext(code+'\nglobalThis.api={run:path=>{economy=initialEconomy();recordYear();path.forEach(stepEconomy);return JSON.stringify({economy,explanations:economicExplanations(),transfer:transferQuestion()})},years:YEARS}',c);return c.api;}
const a=api(old),b=api(now);
const titles={'confidence':'Demand shocks','housing-boom':'Demand shocks',energy:'Short-run aggregate supply',commodities:'Short-run aggregate supply','fiscal-expand':'Fiscal expansion and crowding out','fiscal-contract':'Fiscal contraction','rate-cut':'Monetary policy and lags','rate-hike':'Monetary policy and lags',breakthrough:'Productivity and long-run supply',infrastructure:'Productivity and long-run supply',support:'Stabilization tradeoffs',control:'Stabilization tradeoffs'};
for(let n=0;n<243;n++){
 let k=n;const path=a.years.map(y=>{const id=y.options[k%3].id;k=Math.floor(k/3);return id});
 const before=JSON.parse(a.run(path)),after=JSON.parse(b.run(path));
 assert.deepEqual(after.economy,before.economy);assert.deepEqual(after.transfer,before.transfer);
 const cards=after.explanations;assert.equal(cards.length,path.filter(id=>titles[id]).length+1);
 for(let i=0;i<cards.length;i++){
  const card=cards[i];assert.equal(card.text,before.explanations.find(([title])=>title===card.title)[1]);
  if(i)assert.ok(cards[i-1].yearStart<card.yearStart||(cards[i-1].yearStart===card.yearStart&&cards[i-1].yearEnd<=card.yearEnd));
  if(card.through){assert.equal(card.yearEnd,6);continue;}
  assert.equal(card.title,titles[path[card.yearStart-1]]);
  if(['Monetary policy and lags','Productivity and long-run supply'].includes(card.title)){
   const last=after.economy.history.filter(h=>h.events.some(e=>e.sourceYear===card.yearStart&&e.id===path[card.yearStart-1])).at(-1).year;
   assert.equal(card.yearEnd,last);
  }else assert.equal(card.yearEnd,card.yearStart);
 }
}
console.log('PASS: all 243 histories, explanations, chronology, transfer correctness; protected simulation/world/graph/timeline and existing nine cards unchanged.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4179/games/the-long-run/');
// Capture native, current city layers together, then crop to the hub's 4:3 format without stretching.
const thumbnail=await page.evaluate(()=>{const frame=document.createElement('canvas');frame.width=640;frame.height=360;const ctx=frame.getContext('2d');ctx.drawImage(document.querySelector('#world'),0,0);ctx.drawImage(document.querySelector('#pixel-world'),0,0);const thumb=document.createElement('canvas');thumb.width=960;thumb.height=720;const t=thumb.getContext('2d');t.imageSmoothingEnabled=false;t.drawImage(frame,80,0,480,360,0,0,960,720);return thumb.toDataURL('image/webp',1).split(',')[1];});
fs.mkdirSync('audit_tools/econ_rpg/game/art/scenes/the-long-run',{recursive:true});fs.writeFileSync('audit_tools/econ_rpg/game/art/scenes/the-long-run/the-long-run.webp',Buffer.from(thumbnail,'base64'));
const paths=[['confidence','fiscal-expand','rate-hike','commodities','control'],['breakthrough','fiscal-hold','rate-hold','infrastructure','adjust'],['confidence','fiscal-contract','rate-cut','housing-boom','support'],['confidence','fiscal-hold','rate-hold','housing-boom','adjust']];
for(const [i,path] of paths.entries()){
 await page.setViewportSize({width:i===1?390:1440,height:900});
 for(const [year,id] of path.entries()){await page.locator(`[data-choice="${id}"]`).click();await page.waitForFunction(y=>economy.year===y&&['choice','finished'].includes(economy.phase),year+2);}
 assert.equal(await page.locator('.story li').count(),6);
 assert.equal(await page.locator('#end-actions').isVisible(),false);assert.equal(await page.locator('#model-toggle').isVisible(),false);assert.equal(await page.locator('#restart').isVisible(),false);
 assert.equal(await page.locator('.model-note').count(),0);
 const styles=await page.locator('.callout p').first().evaluate(el=>({size:parseFloat(getComputedStyle(el).fontSize),font:getComputedStyle(el).fontFamily,line:parseFloat(getComputedStyle(el).lineHeight)}));assert.equal(styles.size,15);assert.equal(styles.line,22.5);assert.ok(styles.font.includes('system-ui'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.concepts').screenshot({path:`tmp/long-run-why-${i}.png`});
 await page.locator('.transfer').screenshot({path:`tmp/long-run-transfer-before-${i}.png`});
 if(i===0)await page.locator('#callouts').screenshot({path:'tmp/long-run-callouts.png'});
 const q=await page.evaluate(()=>transferQuestion()),answer=i%2===0?q.target:(q.target+1)%3;
 await page.locator(`[data-transfer="${answer}"]`).focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#transfer-feedback').isVisible(),true);assert.equal(await page.locator('#end-actions').isVisible(),true);assert.equal(await page.evaluate(()=>document.activeElement.id),'transfer-feedback');
 assert.equal(await page.locator('#transfer-feedback').textContent(),(answer===q.target?'That mechanism fits this scenario. ':'Compare the direction of output and prices. ')+q.explanation);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'model-toggle');await page.keyboard.press('Enter');assert.equal(await page.locator('#model').isVisible(),true);
 await page.locator('[data-graph-year="6"]').click();assert.equal(await page.locator('#graph-title').textContent(),'Year 6 AD–AS model');
 await page.locator('#restart').click();assert.equal(await page.locator('#report').isVisible(),false);assert.equal(await page.evaluate(()=>economy.year),1);
}
await page.goto('http://127.0.0.1:4179/games/');
for(const [width,columns] of [[1440,3],[800,2],[390,1]]){await page.setViewportSize({width,height:900});assert.equal(await page.locator('.game-card').count(),10);assert.equal(await page.locator('.game-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),columns);const card=page.locator('.game-card').last();assert.equal(await card.getAttribute('data-game'),'the-long-run');await card.scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const img=document.querySelector('[data-game="the-long-run"] img');return img.complete&&img.naturalWidth===960;});await card.screenshot({path:`tmp/long-run-hub-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
await page.getByRole('link',{name:'PLAY GAME: The Long Run',exact:true}).click();assert.ok(page.url().endsWith('/games/the-long-run/'));assert.deepEqual(errors,[]);
console.log('PASS: four full browser runs, desktop/mobile readability, correct/incorrect keyboard answers, hidden/revealed actions, model and restart, three hub grids, thumbnail and link.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
