const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const config=JSON.parse(fs.readFileSync('audit_tools/econ_rpg/games-preview.json','utf8'));
const origin=process.env.GAMES_PREVIEW_ORIGIN||'http://127.0.0.1:4180',hub=origin+config.previewRoot+config.hubPath;
const out='tmp/games-preview/'+(origin.startsWith('https:')?'live':'local');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const results=[];
 for(const width of [1440,390]){
  const p=await browser.newPage({viewport:{width,height:960},hasTouch:true,reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const response=await p.goto(hub);assert.equal(response.status(),200);
  if(origin.startsWith('https:'))assert.match(response.headers()['x-robots-tag'],/noindex/);
  await p.locator('[data-game="cpi-live"] h2').filter({hasText:'CPI Live'}).waitFor();
  const cards=await p.locator('.game-card').evaluateAll(xs=>xs.map(e=>({id:e.dataset.game,title:e.querySelector('h2').textContent,href:e.querySelector('a').href})));
  assert.equal(cards.length,config.gameCount);assert.equal(new Set(cards.map(c=>c.href)).size,config.gameCount);
  for(const card of cards){await p.locator(`[data-game="${card.id}"]`).scrollIntoViewIfNeeded();if(card.id==='growth-realms')await p.waitForFunction(()=>document.querySelector('#growth-realms-art').dataset.ready);else await p.locator(`[data-game="${card.id}"] img`).evaluate(i=>i.decode());assert(card.href.startsWith(origin+config.previewRoot));}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`${out}/hub-${width}.png`,fullPage:true});
  for(const card of cards){
   await p.locator(`[data-game="${card.id}"] a`).click();await p.waitForURL(card.href);
   assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow');
   await p.waitForFunction(title=>document.title.includes(title),card.title);
   const action=async name=>p.locator(`[data-action="${name}"]:visible`).first().click();
   if(['housing-crisis','main-attraction','ppf','megastar-mania'].includes(card.id)){
    await p.getByRole('button',{name:'Begin scenario',exact:true}).click();await p.locator('[data-choice]').first().click();await p.locator('.consequence').waitFor();
   }else if(card.id==='gameday-rivals'){
    await p.getByRole('button',{name:'Start Season',exact:true}).click();await p.locator('[data-strategy]').first().click();await p.getByText('Both offers revealed',{exact:false}).first().waitFor();
   }else if(card.id==='at-the-box-office'){
    await p.getByRole('button',{name:'ENTER THE THEATER',exact:true}).click();await p.locator('[data-choice]').first().click();await p.locator('.result').waitFor();
   }else if(card.id==='growth-realms'){
    await p.locator('#start-game').click();await p.locator('[data-choose="rivermark"]').click();await p.locator('[data-map-district="capital"]').click();assert.match(await p.locator('#points-remaining').innerText(),/19/);
   }else if(card.id==='takeout-taco-lunch-rush'){
    await action('start_rush');await action('call_worker');assert.match(await p.locator('#crew').innerText(),/2 workers/);
   }else if(card.id==='gdp-live'){
    await action('start');await p.locator('[data-account]').first().click();await action('post');assert(await p.locator('#work').innerText());
   }else if(card.id==='cpi-live'){
    await action('start');await p.locator('#work input').first().fill('0');await p.locator('#work button[type=submit]').click();
   }else if(card.id==='labor-force-files'){
    await action('start');await p.locator('#work input').first().fill('0');await p.locator('#work button[type=submit]').click();await p.locator('#feedback.shown').waitFor();
   }else if(card.id==='the-long-run'){
    await p.locator('[data-choice]').first().click();await p.waitForFunction(()=>economy.year===2&&economy.phase==='choice');
   }else if(card.id==='money-in-motion'){
    await action('post');await p.locator('#loan-form').waitFor();
   }else if(card.id==='signal-house'){
    await action('begin');await action('pan');await action('menu');
   }
   await p.locator('img:not([loading=lazy])').evaluateAll(xs=>Promise.all(xs.map(i=>i.decode())));
   await p.screenshot({path:`${out}/${card.id}-${width}.png`,fullPage:card.id!=='signal-house'});
   const back=p.getByRole('link',{name:/return to games/i}).filter({visible:true}).first();const destination=new URL(await back.getAttribute('href'),p.url());assert.equal(destination.pathname,new URL(hub).pathname);if(!origin.startsWith('https:')&&destination.origin!==origin)await p.route(destination.href,route=>route.fulfill({status:302,headers:{location:hub}}));
   await back.click();await p.waitForURL(hub);await p.locator('[data-game="cpi-live"] h2').filter({hasText:'CPI Live'}).waitFor();
   results.push({width,game:card.title,launch:true,interaction:true,returnToHub:true});
  }
  assert.deepEqual(errors,[]);await p.close();
 }
 const assets=[],base=path.join('dist',config.previewRoot.slice(1));function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);e.isDirectory()?scan(f):assets.push(path.relative(base,f).replaceAll('\\','/'));}}scan(base);
 const ctx=await browser.newContext();for(let i=0;i<assets.length;i+=8)await Promise.all(assets.slice(i,i+8).map(async file=>{const r=await ctx.request.get(origin+config.previewRoot+file);assert.equal(r.status(),200,file);}));
 const publicHub=await ctx.request.get(origin+'/games/');assert(!(await publicHub.text()).includes(config.previewRoot));await ctx.close();
 fs.writeFileSync(out+'/results.json',JSON.stringify({hub,results,assets:assets.length},null,2));console.log(JSON.stringify({passed:true,hub,gameLaunches:results.length,assets:assets.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
