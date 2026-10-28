'use strict';
// Real Composer ZIP generation and gameplay in a Chromium browser. No external
// requests, live GitHub writes, Canvas access, or anonymous telemetry activation.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const http = require('node:http'), assert = require('node:assert/strict');
const {chromium} = require(process.env.MQ_PLAYWRIGHT_MODULE || 'playwright');
const Deployment = require('../deployment.js');
const repo = path.resolve(__dirname, '../../..');
// Point at dist to exercise the actual production artifact and its allowlist.
const siteRoot = path.resolve(process.env.MQ_COMPOSER_SITE_ROOT || repo);
const output = process.env.MQ_COMPOSER_TEST_OUTPUT_DIR || fs.mkdtempSync(path.join(os.tmpdir(),'mq-deployment-browser-'));
fs.mkdirSync(output,{recursive:true});
const deployed = new Map(), requests = [], errors = [];
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  res.setHeader('Content-Security-Policy', "connect-src 'self' data: blob:; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; frame-src 'self'");
  const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  requests.push(req.url);
  const lookup = name.endsWith('/') ? name+'index.html' : name;
  if(deployed.has(lookup)){
    res.writeHead(200,{'Content-Type':mime[path.extname(lookup)] || 'text/plain','Cache-Control':'public, max-age=31536000, immutable'});
    res.end(deployed.get(lookup)); return;
  }
  const file = path.resolve(siteRoot,'.'+lookup);
  if(!file.startsWith(siteRoot+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
  });
});
function unzip(bytes){
  const entries = new Map(); let offset = 0;
  while(bytes.readUInt32LE(offset) === 0x04034b50){
    assert.equal(bytes.readUInt16LE(offset+8),0,'Production writer uses stored ZIP entries');
    const size=bytes.readUInt32LE(offset+18), n=bytes.readUInt16LE(offset+26), extra=bytes.readUInt16LE(offset+28);
    const name=bytes.subarray(offset+30,offset+30+n).toString(),start=offset+30+n+extra;
    entries.set(name,bytes.subarray(start,start+size).toString('utf8'));offset=start+size;
  }
  return entries;
}
function deploy(entries, folder='/test/'){
  for(const [name,content] of entries) deployed.set(folder+name,content);
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    browser = await chromium.launch({headless:true,args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],...(process.env.MQ_BROWSER_EXECUTABLE ? {executablePath:process.env.MQ_BROWSER_EXECUTABLE} : {channel:'msedge'})});
    const context = await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:1000}});
    // Browser routing disables its HTTP cache. Use DNS restrictions and local
    // CSP instead, so this test exercises the real cache with no external access.
    const page = await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
    const dialogs=[];page.on('dialog',async dialog=>{dialogs.push(dialog.message());await dialog.dismiss();});
    await page.goto(origin+'/build/faculty-build-composer/');
    await page.waitForFunction(()=>window.MQDeployment && window.MQComposerCore);
    await page.locator('#areaFilter').selectOption('micro');
    await page.locator('[data-concept="demand"]').waitFor({state:'visible'});
    await page.locator('[data-concept="demand"]').check();
    await page.locator('#nextStep').click();
    await page.locator('#gameTitle').waitFor({state:'visible'});
    async function importRecipe(recipe){
      await page.locator('#importRecipe').setInputFiles({name:'recipe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(recipe))});
      await page.waitForFunction(title=>document.getElementById('gameTitle').value===title,recipe.title);
      await page.locator('[data-step="7"]').click();
      await page.waitForFunction(()=>!document.getElementById('downloadPackage').disabled);
    }
    async function generate(label){
      const pending=page.waitForEvent('download',{timeout:90000});
      await page.locator('#downloadPackage').click();
      const download=await pending, destination=path.join(output,label+'.zip');
      await download.saveAs(destination);
      const entries=unzip(fs.readFileSync(destination));
      const manifest=JSON.parse(entries.get('composition_manifest.json'));
      const recipe=JSON.parse(entries.get('composition_recipe.json'));
      assert(entries.has(manifest.generatedFilename));assert(entries.has('index.html'));assert(entries.has('publish.html'));
      assert.equal(manifest.buildId,new RegExp('game-(mqb-[a-f0-9]{32})\\.html').exec(manifest.generatedFilename)[1]);
      assert.equal(recipe.gameId,manifest.gameId);
      assert.notEqual(manifest.generationTimestamp,'1980-01-01T00:00:00.000Z');
      await page.locator('[data-public-url]').fill(origin+'/test/?course=A%26B');
      const embed=Deployment.createEmbed(origin+'/test/?course=A%26B',manifest);
      assert.equal(await page.locator('[data-embed]').inputValue(),embed.html);
      return {entries,manifest,recipe,embed};
    }
    await importRecipe({title:'Cache and save test',slug:'cache-and-save-test',selectedConceptIds:['aggregate-demand'],supportedModes:['standard','quiz','exam','unlimited']});
    const first=await generate('first'); deploy(first.entries);
    const game=await context.newPage(); game.on('pageerror',e=>errors.push(e.message));
    const gameRequests=[];game.on('request',req=>gameRequests.push(req.url()));
    await game.goto(first.embed.gameUrl);
    await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>MQ_BUILD.buildId),first.manifest.buildId);
    await game.locator('#mq-build-info summary').click();
    await game.screenshot({path:path.join(output,'running-build-information.png'),fullPage:true});
    await game.locator('#mq-build-info summary').click();
    assert.equal(await game.evaluate(()=>FACULTY_COMPOSITION_CONFIG.saveKeyNamespace),first.manifest.saveKeyNamespace);
    // Exercise the actual save/restore functions, including Phase 1.5 extension.
    const saved=await game.evaluate(()=>{
      gameMode='standard'; room=7; username='Synthetic'; runID='deployment-synthetic';
      correctAnswers=4; totalAttempts=6; runPhase='transition';
      saveGameState();
      localStorage.setItem(`${STORAGE_PREFIX}:standard:highScores`,JSON.stringify([{score:45}]));
      localStorage.setItem(PLAYER_KEY,'Synthetic');
      localStorage.setItem(GUIDE_INTRO_SEEN_KEY,'true');
      localStorage.setItem(REALM_COMPLETE_KEY,'true');
      localStorage.setItem(`${STORAGE_PREFIX}:quiz:questionCount`,'5');
      localStorage.setItem(TELEMETRY_PREFIX+'synthetic',JSON.stringify([{event:'question'}]));
      localStorage.setItem('intentional-shared-campaign-fixture','retained');
      localStorage.setItem('mq:accessibility:decorative-motion','paused');
      return {key:getSaveKey(),raw:localStorage.getItem(getSaveKey())};
    });
    assert.equal(JSON.parse(saved.raw).room,7);
    // Warm a stable index URL, then replace its server contents with a new build.
    await game.goto(origin+'/test/'); await game.waitForFunction(()=>globalThis.MQ_BUILD);
    const second=await generate('same-game'); deploy(second.entries);
    assert.equal(first.manifest.gameId,second.manifest.gameId);
    assert.notEqual(first.manifest.buildId,second.manifest.buildId);
    assert.equal(first.manifest.saveKeyNamespace,second.manifest.saveKeyNamespace);
    const indexRequests = requests.filter(url=>url==='/test/').length;
    await game.goto(origin+'/test/'); await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(requests.filter(url=>url==='/test/').length,indexRequests,'Stable entry should be served from the browser cache');
    assert.equal(await game.evaluate(()=>MQ_BUILD.buildId),first.manifest.buildId,'An unchanged cached entry still opens the old build');
    await game.goto(second.embed.gameUrl); await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>MQ_BUILD.buildId),second.manifest.buildId);
    const resumed=await game.evaluate(()=>{gameMode='standard'; const loaded=loadSavedGame();return {loaded,room,correctAnswers,key:getSaveKey(),shared:localStorage.getItem('intentional-shared-campaign-fixture'),motion:localStorage.getItem('mq:accessibility:decorative-motion'),player:localStorage.getItem(PLAYER_KEY),achievement:localStorage.getItem(REALM_COMPLETE_KEY),scores:localStorage.getItem(`${STORAGE_PREFIX}:standard:highScores`),guide:localStorage.getItem(GUIDE_INTRO_SEEN_KEY),preference:localStorage.getItem(`${STORAGE_PREFIX}:quiz:questionCount`),telemetry:localStorage.getItem(TELEMETRY_PREFIX+'synthetic')};});
    assert.equal(resumed.loaded,true);assert.equal(resumed.room,7);assert.equal(resumed.correctAnswers,4);assert.equal(resumed.key,saved.key);
    assert.equal(resumed.shared,'retained');assert.equal(resumed.motion,'paused');
    assert.equal(resumed.player,'Synthetic');assert.equal(resumed.achievement,'true');assert.equal(resumed.guide,'true');assert.equal(resumed.preference,'5');assert.equal(JSON.parse(resumed.scores)[0].score,45);assert.equal(JSON.parse(resumed.telemetry)[0].event,'question');
    // A cached launcher can honor an explicit new build version, too.
    const oldIndex=first.entries.get('index.html');deployed.set('/stale/index.html',oldIndex);
    deployed.set('/stale/'+second.manifest.generatedFilename,second.entries.get(second.manifest.generatedFilename));
    await game.goto(origin+'/stale/?v='+second.manifest.buildId); await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>MQ_BUILD.buildId),second.manifest.buildId);
    // Importing the saved recipe preserves identity across Composer reloads.
    await page.reload();await page.waitForFunction(()=>window.MQDeployment);
    await importRecipe({...second.recipe,title:'Same game, revised questions',selectedConceptIds:['supply'],contentScopes:{}});
    const changed=await generate('changed-content');deploy(changed.entries);
    assert.equal(changed.manifest.gameId,first.manifest.gameId);
    assert.notEqual(changed.manifest.saveKeyNamespace,first.manifest.saveKeyNamespace);
    await game.goto(changed.embed.gameUrl);await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>hasSavedGame('standard')),false);
    assert.equal(await game.evaluate(()=>[PLAYER_KEY,GUIDE_INTRO_SEEN_KEY,REALM_COMPLETE_KEY,`${STORAGE_PREFIX}:standard:highScores`,`${STORAGE_PREFIX}:quiz:questionCount`,TELEMETRY_PREFIX+'synthetic'].every(key=>localStorage.getItem(key)===null)),true);
    assert.equal(await game.evaluate(key=>!!localStorage.getItem(key),saved.key),true);
    // Same repo and same settings, explicitly different game.
    await page.locator('[data-step="2"]').click();await page.locator('#startDifferentGame').click();
    await page.locator('[data-step="7"]').click();const different=await generate('different-game');deploy(different.entries);
    assert.notEqual(different.manifest.gameId,changed.manifest.gameId);
    assert.notEqual(different.manifest.saveKeyNamespace,changed.manifest.saveKeyNamespace);
    await game.goto(different.embed.gameUrl);await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>hasSavedGame('standard')),false);
    // Old immutable links retain their intended game even after repo reuse.
    await game.goto(first.embed.gameUrl);await game.waitForFunction(()=>globalThis.MQ_BUILD);
    assert.equal(await game.evaluate(()=>MQ_BUILD.gameId),first.manifest.gameId);
    assert.equal(await game.evaluate(()=>hasSavedGame('standard')),true);
    // Root, nested and percent-encoded folders, plus an iframe on a Canvas-like page.
    for(const folder of ['/', '/test/game-one/', '/test/Unit one & café/']){
      deploy(second.entries,folder);
      const url=Deployment.createEmbed(origin+folder+'?course=42',second.manifest).gameUrl;
      await game.goto(url);await game.waitForFunction(()=>globalThis.MQ_BUILD);
      assert.equal(await game.evaluate(()=>MQ_BUILD.buildId),second.manifest.buildId);
    }
    deployed.set('/canvas.html',second.embed.html);
    await game.goto(origin+'/canvas.html');
    const frame=game.frameLocator('iframe');await frame.locator('#mq-build-info').waitFor();
    assert((await frame.locator('#mq-build-info').textContent()).includes(second.manifest.buildId));
    // Dynamic graph URLs resolve from embedded bytes, including special filenames.
    const runtime=game.frames().find(f=>f.url().includes(second.manifest.generatedFilename));
    const graph=await runtime.evaluate(async()=>{
      const q=Object.values(questionBanks).flat().find(q=>q.image);
      if(!q) throw new Error('Fixture must contain graphs');
      const specialPath='question-assets/Unit 1 & café # ?.webp';
      embeddedQuestionAssets[specialPath]=resolveQuestionImage(q.image);
      renderQuestionMedia({...q,image:specialPath});
      const img=document.querySelector('#questionImage img') || document.querySelector('img[data-graph-description]');
      await img.decode();
      return {src:img.src,loaded:img.naturalWidth>0};
    });
    assert(graph.loaded && graph.src.startsWith('data:image/'));
    assert(!gameRequests.some(url=>/\.(js|css|png|webp|svg)(\?|$)/.test(url) && url.startsWith(origin)),'Game must not request stale external runtime assets');
    // The downloaded helper works with only its own file (including clipboard fallback).
    const helperPage=await context.newPage();helperPage.on('pageerror',e=>errors.push(e.message));
    const offlineHelper=path.join(output,'publish.html');
    fs.writeFileSync(offlineHelper,different.entries.get('publish.html'));
    await helperPage.goto(require('node:url').pathToFileURL(offlineHelper).href);
    await helperPage.locator('[data-public-url]').fill('https://wjbyrd.github.io/test/?course=7#intro');
    assert.equal(await helperPage.locator('[data-embed]').inputValue(),Deployment.createEmbed('https://wjbyrd.github.io/test/?course=7#intro',different.manifest).html);
    await helperPage.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));
    await helperPage.locator('[data-copy]').click();
    assert((await helperPage.locator('[data-embed-status]').textContent()).includes('Code selected'));
    await helperPage.setViewportSize({width:390,height:844});
    assert(await helperPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Publishing helper mobile overflow');
    await helperPage.screenshot({path:path.join(output,'publishing-helper-mobile.png'),fullPage:true});
    await page.locator('[data-public-url]').fill('https://wjbyrd.github.io/test/');
    await page.screenshot({path:path.join(output,'composer-publishing.png'),fullPage:true});
    assert.deepEqual(dialogs,[]);assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({passed:true,builds:4,tests:['first deployment','same-game update','changed-bank save isolation','different game same repo','legacy recipe and recipe import','root/nested/special paths','Canvas-like iframe','graph decoding','shared preferences retained','copy fallback','mobile helper'],requests:requests.length,limitations:'Local simulation only; no live Canvas, GitHub deployment or telemetry transmission tested.'},null,2));
    console.log('PASS browser deployment tests. Artifacts: '+output);
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
