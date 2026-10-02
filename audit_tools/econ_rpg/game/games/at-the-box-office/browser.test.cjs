const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {scenarios,calculate}=require('./scenarios.js');
const root=path.resolve('dist');
const prefix='/beta-testing/october-games-b9021b0dcb5f/games/';
const out=path.resolve('tmp/econ-rpg/at-the-box-office/refinement-qa');fs.mkdirSync(out,{recursive:true});
const remote=process.env.BOX_OFFICE_ORIGIN;
const server=http.createServer((req,res)=>{
  try {let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));assert(file.startsWith(root+path.sep));if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
  if(!remote)await new Promise(resolve=>server.listen(4187,'127.0.0.1',resolve));
  const origin=remote||'http://127.0.0.1:4187',url=origin+prefix+'at-the-box-office/';
  const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];let outcomes=0;
  const sizes=[[390,844],[844,390],[768,1024],[1024,768],[1440,960],[1920,1080],[320,740]];
  const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem(window.BoxOffice.SAVE_KEY)));
  const fits=async(page,where)=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),where);
  try{
    for(const [width,height] of sizes){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<1024});
      page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
      await page.goto(url);await page.locator('#scene-image').evaluate(i=>i.decode());
      await page.screenshot({path:path.join(out,`start-${width}.png`),fullPage:true});
      await page.keyboard.press('Tab');assert(await page.locator('.skip').evaluate(e=>e===document.activeElement));
      const home=page.locator('.masthead .return-games');assert.equal(await home.getAttribute('href'),'https://masteryquests.org'+prefix);
      assert((await home.boundingBox()).height>=44);
      const helpButton=page.getByRole('button',{name:'HOW TO PLAY'});
      await helpButton.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();
      assert.equal(await page.locator('dialog li').count(),6);await page.keyboard.press('Tab');assert(await page.locator('dialog button').evaluate(e=>e===document.activeElement));
      await page.keyboard.press('Escape');assert(!(await page.getByRole('dialog').isVisible()));assert(await helpButton.evaluate(e=>e===document.activeElement));
      await helpButton.click();await page.getByRole('button',{name:'CLOSE',exact:true}).click();
      await page.getByRole('button',{name:'ENTER THE THEATER'}).click();
      for(let variant=0;variant<3;variant++){
        const initial=await saved(page),season=initial.season;
        assert.equal(initial.mode,'decision');
        assert(!/elastic|substitute|complement|normal good|inferior good/i.test(await page.locator('#view').innerText()));
        for(let round=0;round<7;round++){
          const s=season.scenarios[round];assert.equal(await page.locator('#view-title').innerText(),s.title);
          assert((await page.locator('.mission').innerText()).includes('Your goal'));
          if(round===6)assert((await page.locator('.brief').innerText()).includes('inelastic demand'));
          await fits(page,`decision ${width} ${round}`);
          if(variant===0){await page.locator('#scene-image').evaluate(i=>i.decode());await page.screenshot({path:path.join(out,`round-${round+1}-${width}.png`),fullPage:true});}
          const chosen=s.choices[variant],expected=calculate(chosen.outcome);
          await page.locator(`[data-choice="${variant}"]`).click();
          assert((await page.locator('.result').innerText()).includes(chosen.feedback));
          assert((await page.locator('.metrics').innerText()).includes('$'+expected.ticketRevenue.toLocaleString('en-US')));
          assert.equal(await page.locator('[data-choice]').count(),0);
          for(const e of chosen.episodes)assert((await page.locator('.result-copy').innerText()).includes(e.label));
          assert(await page.locator('#view').evaluate(e=>e===document.activeElement));
          await fits(page,`result ${width} ${round}`);
          if(round===0&&variant===0){
            const score=page.getByRole('button',{name:`Market reading: ${chosen.points} of 2 points`});
            if(width===1440){await score.hover();assert(await page.locator('.score-popover').isVisible());await page.locator('.score-popover').hover();assert(await page.locator('.score-popover').isVisible());await page.mouse.move(1,1);assert(!(await page.locator('.score-popover').isVisible()));}
            await page.keyboard.press('Tab');assert(await score.evaluate(e=>e===document.activeElement));assert(await page.locator('.score-popover').isVisible());
            await page.keyboard.press('Escape');assert(!(await page.locator('.score-popover').isVisible()));
            await page.keyboard.press('Enter');assert(await page.locator('.score-popover').isVisible());await page.keyboard.press('Enter');assert(!(await page.locator('.score-popover').isVisible()));
            if(width<1024)await score.tap();else await score.click();assert(await page.locator('.score-popover').isVisible());
            await page.locator('.result-copy>p').click();assert(!(await page.locator('.score-popover').isVisible()));
          }
          if(variant===0)await page.screenshot({path:path.join(out,`result-${round+1}-${width}.png`),fullPage:true});
          if(round===0||round===5){const before=await saved(page),text=await page.locator('#view').innerText();await page.reload();assert.deepEqual(await saved(page),before);assert.equal(await page.locator('#view').innerText(),text);}
          outcomes++;await page.locator('[data-action="continue"]').click();
          if(round===2){const before=await saved(page);await page.reload();assert.deepEqual(await saved(page),before);}
        }
        assert.equal(await page.locator('.economic-graph').count(),8);assert.equal(await page.locator('.history-chart,.bar-fill').count(),0);
        for(const [kind,count] of [['price',3],['cross',2],['income',3]])assert.equal(await page.locator(`[data-kind="${kind}"]`).count(),count);
        const episodes=season.scenarios.flatMap(s=>s.choices[variant].episodes);
        for(let i=0;i<episodes.length;i++){
          const e=episodes[i],figure=page.locator('.economic-graph').nth(i),content=await figure.innerText();
          assert(content.includes(e.label));assert(content.includes(e.q1.toLocaleString('en-US')));assert(content.includes(e.q2.toLocaleString('en-US')));
          assert.equal(await figure.locator('svg title').count(),1);assert.equal(await figure.locator('svg desc').count(),1);
          assert(!(await figure.innerHTML()).match(/NaN|Infinity|undefined/));
        }
        await page.getByText('Your seven-week ledger',{exact:true}).click();assert.equal(await page.locator('.ledger li').count(),7);
        await fits(page,`debrief ${width}`);
        if(variant===0){
          await page.screenshot({path:path.join(out,`debrief-${width}.png`),fullPage:true});
          for(const kind of ['price','cross','income'])await page.locator(`[data-kind="${kind}"]`).first().screenshot({path:path.join(out,`graph-${kind}-${width}.png`)});
        }
        const before=await saved(page);await page.reload();assert.deepEqual(await saved(page),before);assert.equal(await page.locator('.economic-graph').count(),8);
        await page.getByRole('button',{name:'PLAY ANOTHER SEASON'}).click();const next=await saved(page);
        assert.notEqual(next.season.seed,season.seed);next.season.variants.forEach((v,i)=>assert.notEqual(v,season.variants[i]));
        assert.notDeepEqual(next.season.scenarios.map(s=>s.startingState),season.scenarios.map(s=>s.startingState));assert.equal(next.selections.length,0);
      }
      await page.goto(origin+prefix);assert.equal(await page.locator('.game-card').count(),13);
      const card=page.locator('[data-game="at-the-box-office"]');await card.locator('img').evaluate(i=>i.decode());
      const box=await card.locator('img').boundingBox();assert(Math.abs(box.width/box.height-4/3)<.02);
      await card.locator('a').click();await page.waitForURL(url);await page.close();
    }
    const p=await browser.newPage({viewport:{width:1280,height:800}});await p.goto(url);await p.getByRole('button',{name:'ENTER THE THEATER'}).click();
    await p.evaluate(()=>document.documentElement.style.zoom='2');await fits(p,'200% zoom');await p.screenshot({path:path.join(out,'zoom-200.png'),fullPage:true});await p.close();
    const blocked=await browser.newPage();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('Storage denied');};Storage.prototype.getItem=function(){throw new Error('Storage denied');};});
    await blocked.goto(url);await blocked.getByRole('button',{name:'ENTER THE THEATER'}).click();await blocked.locator('[data-choice="0"]').click();assert(await blocked.locator('.save-notice').isVisible());await blocked.close();
    const assets=await browser.newContext();for(const file of ['game.js','scenarios.js','seasons.js','graphs.js','styles.css','scenes/manager-office.webp','scenes/concessions-lobby.webp','scenes/theater-exterior.webp']){
      const response=await assets.request.get(url+file);assert.equal(response.status(),200);assert.deepEqual(await response.body(),fs.readFileSync(path.join(__dirname,file)),file+' matches source');
    }await assets.close();
    assert.deepEqual(errors,[]);const result={passed:true,origin,outcomes,sizes,seasons:21,replays:21,graphsVerified:168,saveReload:true,storageDenied:true,helpAndScoreControls:true,errors};
    fs.writeFileSync(path.join(out,remote?'live-results.json':'local-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
