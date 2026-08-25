import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const themes = require('../data/official_theme_library.js');
const {assertInlineScriptsCompile} = require('./composer-test-helpers.js');
const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
const COMPOSER_ROOT = path.resolve(TEST_ROOT, '..');
const REPO_ROOT = path.resolve(COMPOSER_ROOT, '..', '..');
const viewports = [
  {width:1440,height:900},
  {width:1024,height:768},
  {width:768,height:1024},
  {width:390,height:844}
];

function sha256(bytes){
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function sourceFile(asset){
  return path.resolve(COMPOSER_ROOT, asset.sourceUrl);
}

function customRecord(sourceAssetId, slotId){
  const source = themes.assets.find(asset => asset.id === sourceAssetId);
  assert(source, `Missing custom fixture source ${sourceAssetId}`);
  const bytes = fs.readFileSync(sourceFile(source));
  const digest = sha256(bytes);
  assert.equal(digest, source.sha256, `Custom fixture source changed: ${sourceAssetId}`);
  return {
    id:`faculty-${digest.slice(0, 24)}`,
    label:`Custom ${themes.slots[slotId].label} image`,
    originalName:`${sourceAssetId}.webp`,
    category:'theme-custom',
    fileType:'image/webp',
    width:source.width,
    height:source.height,
    originalWidth:source.width,
    originalHeight:source.height,
    originalSizeBytes:bytes.length,
    sizeBytes:bytes.length,
    sha256:digest,
    dataUrl:`data:image/webp;base64,${bytes.toString('base64')}`,
    compatibleSlots:[slotId],
    normalized:true
  };
}

function mixedRecipe(){
  const slotSources = {
    startBackground:'market-start',
    guideImage:'arcane-guide',
    boss2:'market-boss-2',
    artifact2:'market-artifact-2',
    modeExam:'economic-guide'
  };
  const records = Object.fromEntries(Object.entries(slotSources).map(([slotId, sourceId]) => {
    const record = customRecord(sourceId, slotId);
    return [record.id, record];
  }));
  const customOverrides = Object.fromEntries(Object.entries(slotSources).map(([slotId, sourceId]) => {
    const source = themes.assets.find(asset => asset.id === sourceId);
    return [slotId, `faculty-${source.sha256.slice(0, 24)}`];
  }));
  return {
    schemaVersion:'1.4.0',
    title:'Manual QA Mixed Build',
    slug:'manual-qa-mixed-build',
    supportedModes:['standard','exam'],
    selectedConceptIds:['perfect-competition'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null},
    appearance:{
      presetId:'market-citadel',
      overrides:{hallway1:'ledger-hall-1',hallway2:'arcane-hall-2',hallway3:'market-hall-3'},
      customOverrides
    },
    customAssets:records
  };
}

function customHallwayRecipe(){
  const recipe = mixedRecipe();
  recipe.title = 'Manual QA Custom Hallways';
  recipe.slug = 'manual-qa-custom-hallways';
  recipe.appearance.overrides = {};
  for(const [slotId, sourceId] of Object.entries({hallway1:'ledger-hall-1',hallway2:'arcane-hall-2',hallway3:'market-hall-3'})){
    const record = customRecord(sourceId, slotId);
    recipe.customAssets[record.id] = record;
    recipe.appearance.customOverrides[slotId] = record.id;
  }
  return recipe;
}

function hybridHallwayRecipe(){
  const recipe = mixedRecipe();
  recipe.title = 'Manual QA Hybrid Hallways';
  recipe.slug = 'manual-qa-hybrid-hallways';
  recipe.appearance.overrides = {hallway1:'ledger-hall-1'};
  const hallway2 = customRecord('arcane-hall-2', 'hallway2');
  recipe.customAssets[hallway2.id] = hallway2;
  recipe.appearance.customOverrides.hallway2 = hallway2.id;
  delete recipe.appearance.customOverrides.hallway3;
  return recipe;
}

function mimeType(filePath){
  const extension = path.extname(filePath).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'})[extension] || 'application/octet-stream';
}

function openStoredZip(buffer){
  const entries = new Map();
  let offset = 0;
  while(offset + 30 <= buffer.length && buffer.readUInt32LE(offset) === 0x04034b50){
    const method = buffer.readUInt16LE(offset + 8);
    const size = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    assert.equal(method, 0, 'Generated ZIP unexpectedly uses compression');
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString('utf8');
    entries.set(name, buffer.subarray(dataStart, dataStart + size));
    offset = dataStart + size;
  }
  return entries;
}

function chromeExecutable(){
  const candidates = [
    process.env.MQ_BROWSER_EXECUTABLE,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  const executable = candidates.find(candidate => fs.existsSync(candidate));
  assert(executable, 'Set MQ_BROWSER_EXECUTABLE to a Chromium-family browser executable');
  return executable;
}

function noOverlap(first, second){
  return first.right <= second.left || second.right <= first.left || first.bottom <= second.top || second.bottom <= first.top;
}

let generatedHtml = '';
const server = http.createServer((request, response) => {
  try{
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if(pathname === '/favicon.ico'){
      response.writeHead(204, {'cache-control':'no-store'});
      response.end();
      return;
    }
    if(pathname === '/__generated__/mixed.html'){
      response.writeHead(200, {'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
      response.end(generatedHtml);
      return;
    }
    let relative = pathname.replace(/^\/+/, '') || 'index.html';
    if(relative.endsWith('/')) relative += 'index.html';
    const file = path.resolve(REPO_ROOT, relative);
    if(file !== REPO_ROOT && !file.startsWith(REPO_ROOT + path.sep)) throw new Error('Path outside repository');
    const bytes = fs.readFileSync(file);
    response.writeHead(200, {'content-type':mimeType(file),'cache-control':'no-store'});
    response.end(bytes);
  } catch(error){
    response.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({headless:true, executablePath:chromeExecutable()});
const context = await browser.newContext({acceptDownloads:true});
const page = await context.newPage();
const artifactRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-phase3b-manual-qa-'));
const consoleErrors = [];
const pageErrors = [];
const dialogs = [];
page.on('console', message => { if(message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));
page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });

try{
  await page.goto(`${baseUrl}/build/faculty-build-composer/`, {waitUntil:'networkidle'});
  await page.waitForFunction(() => window.MQComposerCore?.loadEmbeddedThemeAssets && window.MQOfficialThemeLibrary?.assets?.length === 51);

  const officialResult = await page.evaluate(async () => {
    const core = window.MQComposerCore;
    const library = window.MQOfficialThemeLibrary;
    const requested = [];
    const embedded = await core.loadEmbeddedThemeAssets(library.assets, sourceUrl => {
      requested.push(sourceUrl);
      return fetch(sourceUrl, {cache:'no-store'});
    });
    const required = {};
    for(const id of ['market-start','market-gameplay','ledger-hall-1']){
      const asset = library.assets.find(candidate => candidate.id === id);
      const response = await fetch(asset.sourceUrl, {cache:'no-store'});
      const bytes = new Uint8Array(await response.arrayBuffer());
      required[id] = {manifest:asset.sha256,runtime:await core.sha256BytesHex(bytes),size:bytes.length,sourceUrl:asset.sourceUrl};
    }
    const mixed = core.resolveThemeSelection({presetId:'market-citadel',overrides:{hallway1:'ledger-hall-1',hallway2:'arcane-hall-2',hallway3:'market-hall-3'}}, library);
    const mixedAssets = core.themeAssetsForSelection(mixed, ['standard','exam']);
    const mixedEmbedded = await core.loadEmbeddedThemeAssets(mixedAssets, sourceUrl => fetch(sourceUrl, {cache:'no-store'}));
    const marketOverride = {presetId:'market-citadel',overrides:{hallway1:'ledger-hall-1'}};
    const switched = core.resolveThemeSelection({...marketOverride,presetId:'arcane-archive'}, library);
    const reset = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{}}, library);
    return {
      assetCount:Object.keys(embedded).length,
      allPortable:Object.values(embedded).every(value => value.startsWith('data:image/webp;base64,')),
      authoritativeUrls:requested.every((value, index) => value === library.assets[index].sourceUrl),
      marketLabel:library.presets['market-citadel'].label,
      mixedOfficialCount:Object.keys(mixedEmbedded).length,
      mixedIds:mixedAssets.map(asset => asset.id),
      presetSwitch:{
        overriddenHallway1:switched.slots.hallway1.asset.id,
        presetHallway2:switched.slots.hallway2.asset.id,
        presetHallway3:switched.slots.hallway3.asset.id,
        resetHallway1:reset.slots.hallway1.asset.id
      },
      required
    };
  });
  assert.equal(officialResult.assetCount, 51, 'Browser production path did not embed all 51 official assets');
  assert(officialResult.allPortable, 'Browser production path returned a nonportable official asset');
  assert(officialResult.authoritativeUrls, 'Browser production path did not fetch authoritative manifest sourceUrl values');
  assert.equal(officialResult.marketLabel, 'Market Gate');
  assert(officialResult.mixedIds.includes('ledger-hall-1') && officialResult.mixedIds.includes('arcane-hall-2') && officialResult.mixedIds.includes('market-hall-3'), 'Mixed official selection was not preserved');
  assert.deepEqual(officialResult.presetSwitch, {overriddenHallway1:'ledger-hall-1',presetHallway2:'arcane-hall-2',presetHallway3:'arcane-hall-3',resetHallway1:'arcane-hall-1'}, 'Preset switch/reset hallway precedence failed');
  for(const value of Object.values(officialResult.required)) assert.equal(value.runtime, value.manifest, `Runtime SHA mismatch for ${value.sourceUrl}`);

  async function generateRecipe(recipe){
    const dialogCount = dialogs.length;
    await page.locator('#importRecipe').setInputFiles({
      name:`${recipe.slug}-recipe.json`,
      mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify(recipe))
    });
    await page.waitForFunction(expected => document.querySelector('#gameTitle')?.value === expected, recipe.title);
    await page.locator('.step-nav [data-step="7"]').click();
    await page.waitForFunction(() => !document.querySelector('#downloadPackage')?.disabled);
    const downloadPromise = page.waitForEvent('download', {timeout:120000});
    await page.locator('#downloadPackage').click();
    const download = await downloadPromise;
    const downloadPath = path.join(artifactRoot, `${recipe.slug}.zip`);
    await download.saveAs(downloadPath);
    const entries = openStoredZip(fs.readFileSync(downloadPath));
    const html = entries.get(`${recipe.slug}.html`)?.toString('utf8') || '';
    assert(html, `Generated ${recipe.slug} HTML is missing from the ZIP`);
    assertInlineScriptsCompile(html, `${recipe.slug}.html`);
    assert.equal(dialogs.length, dialogCount, `Composer displayed an error: ${dialogs.slice(dialogCount).join(' | ')}`);
    return html;
  }

  const recipe = mixedRecipe();
  generatedHtml = await generateRecipe(recipe);

  const runtimePage = await context.newPage();
  const runtimeErrors = [];
  runtimePage.on('console', message => { if(message.type() === 'error') runtimeErrors.push(message.text()); });
  runtimePage.on('pageerror', error => runtimeErrors.push(error.message));
  await runtimePage.addInitScript(() => {
    if(sessionStorage.getItem('mq-manual-qa-initialized')) return;
    localStorage.clear();
    sessionStorage.setItem('mq-manual-qa-initialized', 'true');
  });
  await runtimePage.goto(`${baseUrl}/__generated__/mixed.html`, {waitUntil:'load'});
  await runtimePage.fill('#playerNameInput', 'Faculty QA');
  await runtimePage.locator('#startScreen .start-btn').first().click();
  await runtimePage.waitForSelector('#modeSelectScreen', {state:'visible'});

  const customIds = recipe.appearance.customOverrides;
  async function assertModeMedia(mode, sourceId){
    return runtimePage.evaluate(async ({mode, sourceId}) => {
      const card = document.querySelector(`.mode-card[data-mode="${mode}"]`);
      const media = card?.querySelector('.mode-card-media');
      const image = media?.querySelector('img');
      const title = card?.querySelector('.mode-card-title');
      if(sourceId && image){
        image.src = FACULTY_COMPOSITION_CONFIG.visualTheme.customAssetData[sourceId];
        await image.decode();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      const mediaRect = media?.getBoundingClientRect();
      const imageRect = image?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const style = media ? getComputedStyle(media) : null;
      return {
        hasMedia:Boolean(media && image && title),
        overflow:style?.overflow,
        objectFit:image ? getComputedStyle(image).objectFit : '',
        contained:Boolean(mediaRect && imageRect && imageRect.left >= mediaRect.left - 1 && imageRect.right <= mediaRect.right + 1 && imageRect.top >= mediaRect.top - 1 && imageRect.bottom <= mediaRect.bottom + 1),
        titleClear:Boolean(mediaRect && titleRect && mediaRect.bottom <= titleRect.top + 1),
        mediaBottom:mediaRect?.bottom,
        titleTop:titleRect?.top,
        noHorizontalOverflow:document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      };
    }, {mode,sourceId});
  }

  for(const viewport of viewports){
    await runtimePage.setViewportSize(viewport);
    await runtimePage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for(const [label, sourceId] of [['wide',customIds.startBackground],['square',customIds.guideImage],['portrait',customIds.modeExam]]){
      const result = await assertModeMedia('exam', sourceId);
      assert(result.hasMedia && result.contained && result.titleClear, `${label} custom mode image escaped at ${viewport.width}x${viewport.height}`);
      assert.equal(result.overflow, 'hidden');
      assert.equal(result.objectFit, 'cover');
      assert(result.noHorizontalOverflow, `Mode screen overflowed at ${viewport.width}x${viewport.height}`);
    }
    const official = await assertModeMedia('standard');
    assert(official.hasMedia && official.contained && official.titleClear, `Official mode image escaped at ${viewport.width}x${viewport.height}: ${JSON.stringify(official)}`);
    await runtimePage.screenshot({path:path.join(artifactRoot, `mode-${viewport.width}x${viewport.height}.png`)});
  }

  await runtimePage.setViewportSize(viewports[0]);
  await runtimePage.locator('.mode-card[data-mode="standard"]').click();
  await runtimePage.waitForSelector('#gameBox', {state:'visible'});
  for(const viewport of viewports){
    await runtimePage.setViewportSize(viewport);
    const guide = await runtimePage.evaluate(() => {
      const box = document.querySelector('#wizardBox');
      const image = box?.querySelector('img');
      const question = document.querySelector('#questionContainer');
      const answers = document.querySelector('#answers');
      const rect = element => element?.getBoundingClientRect();
      return {
        visible:Boolean(box && image && getComputedStyle(box).display !== 'none' && rect(box).width > 0 && rect(box).height > 0),
        box:rect(box),image:rect(image),question:rect(question),answers:rect(answers),
        imageSource:image?.src || '',
        noHorizontalOverflow:document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      };
    });
    assert(guide.visible, `Guide was hidden at ${viewport.width}x${viewport.height}`);
    assert(guide.imageSource.startsWith('data:image/webp;base64,'), 'Custom guide was not embedded');
    assert(guide.image.left >= guide.box.left - 1 && guide.image.right <= guide.box.right + 1 && guide.image.top >= guide.box.top - 1 && guide.image.bottom <= guide.box.bottom + 1, `Guide escaped its container at ${viewport.width}x${viewport.height}`);
    assert(noOverlap(guide.box, guide.question) && noOverlap(guide.box, guide.answers), `Guide covered gameplay controls at ${viewport.width}x${viewport.height}`);
    assert(guide.noHorizontalOverflow, `Gameplay overflowed at ${viewport.width}x${viewport.height}`);
    await runtimePage.screenshot({path:path.join(artifactRoot, `guide-${viewport.width}x${viewport.height}.png`)});
  }

  async function assertRenderedHallways(targetPage, expectations, testedViewports, prefix, stages = [
    {roomValue:2,slotId:'hallway1'},
    {roomValue:12,slotId:'hallway2'},
    {roomValue:22,slotId:'hallway3'}
  ]){
    const results = [];
    for(const viewport of testedViewports){
      await targetPage.setViewportSize(viewport);
      for(const stage of stages){
        const result = await targetPage.evaluate(async ({roomValue,slotId}) => {
          room = roomValue;
          const overlay = document.querySelector('#hallwayTransition');
          overlay.classList.remove('active');
          void overlay.offsetWidth;
          showHallwayTransition(`Manual QA ${slotId}`);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          await new Promise(resolve => setTimeout(resolve, 500));
          const text = document.querySelector('#hallwayText');
          const slot = getFacultyVisualSlot(slotId);
          const style = getComputedStyle(overlay);
          const overlayRect = overlay.getBoundingClientRect();
          const textRect = text.getBoundingClientRect();
          const output = {
            slotId,
            assetId:slot.id,
            source:slot.source,
            inlineMatches:overlay.style.backgroundImage.includes(slot.src),
            computedMatches:style.backgroundImage.includes(slot.src),
            backgroundSize:style.backgroundSize,
            backgroundPosition:style.backgroundPosition,
            active:overlay.classList.contains('active') && Number.parseFloat(style.opacity) > 0,
            activeClass:overlay.classList.contains('active'),
            opacity:style.opacity,
            textVisible:textRect.width > 0 && textRect.height > 0 && textRect.left >= overlayRect.left - 1 && textRect.right <= overlayRect.right + 1,
            noHorizontalOverflow:document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
          };
          return output;
        }, stage);
        const expected = expectations[stage.slotId];
        assert.equal(result.assetId, expected.id, `${prefix} ${stage.slotId} resolved the wrong asset`);
        assert.equal(result.source, expected.source, `${prefix} ${stage.slotId} used the wrong precedence source`);
        assert(result.inlineMatches && result.computedMatches, `${prefix} ${stage.slotId} did not render its resolved image at ${viewport.width}x${viewport.height}`);
        assert(result.backgroundSize.split(',').every(value => value.trim() === 'cover'), `${prefix} ${stage.slotId} did not preserve aspect ratio`);
        assert(result.active && result.textVisible && result.noHorizontalOverflow, `${prefix} ${stage.slotId} transition layout failed at ${viewport.width}x${viewport.height}: ${JSON.stringify(result)}`);
        await targetPage.screenshot({path:path.join(artifactRoot, `hallway-${prefix}-${stage.slotId}-${viewport.width}x${viewport.height}.png`)});
        await targetPage.evaluate(() => {
          document.querySelector('#hallwayTransition').classList.remove('active');
          runSessionId++;
        });
        results.push({...result,viewport});
      }
    }
    return results;
  }

  const officialHallways = await assertRenderedHallways(runtimePage, {
    hallway1:{id:'ledger-hall-1',source:'override'},
    hallway2:{id:'arcane-hall-2',source:'override'},
    hallway3:{id:'market-hall-3',source:'override'}
  }, viewports, 'official');

  await runtimePage.evaluate(() => { room = 11; saveGameState(); });
  await runtimePage.reload({waitUntil:'load'});
  await runtimePage.waitForSelector('#continueRunBtn', {state:'visible'});
  await runtimePage.locator('#continueRunBtn').click();
  await runtimePage.waitForSelector('#gameBox', {state:'visible'});
  assert.equal(await runtimePage.evaluate(() => room), 11, 'Standard Campaign did not resume at the saved room');
  const resumedHallway = await assertRenderedHallways(runtimePage, {
    hallway2:{id:'arcane-hall-2',source:'override'}
  }, [viewports[1]], 'resume', [{roomValue:11,slotId:'hallway2'}]);

  await runtimePage.evaluate(() => { room = 20; bossHealth = 3; loadQuestion(); });
  await runtimePage.waitForSelector('.generic-boss-image');
  assert((await runtimePage.locator('.generic-boss-image').getAttribute('src'))?.startsWith('data:image/webp;base64,'), 'Custom Boss 2 did not render');
  await runtimePage.evaluate(() => showArtifact(artifacts.lens.img, artifacts.lens.title, artifacts.lens.text));
  assert((await runtimePage.locator('#artifactImage').getAttribute('src'))?.startsWith('data:image/webp;base64,'), 'Custom Artifact 2 did not render');

  async function openStandardRuntime(html){
    generatedHtml = html;
    const targetPage = await context.newPage();
    targetPage.on('console', message => { if(message.type() === 'error') runtimeErrors.push(message.text()); });
    targetPage.on('pageerror', error => runtimeErrors.push(error.message));
    await targetPage.addInitScript(() => {
      if(sessionStorage.getItem('mq-manual-qa-initialized')) return;
      localStorage.clear();
      sessionStorage.setItem('mq-manual-qa-initialized', 'true');
    });
    await targetPage.goto(`${baseUrl}/__generated__/mixed.html`, {waitUntil:'load'});
    await targetPage.fill('#playerNameInput', 'Faculty QA');
    await targetPage.locator('#startScreen .start-btn').first().click();
    await targetPage.waitForSelector('#modeSelectScreen', {state:'visible'});
    await targetPage.locator('.mode-card[data-mode="standard"]').click();
    await targetPage.waitForSelector('#gameBox', {state:'visible'});
    return targetPage;
  }

  const customRecipe = customHallwayRecipe();
  const customPage = await openStandardRuntime(await generateRecipe(customRecipe));
  const customHallways = await assertRenderedHallways(customPage, {
    hallway1:{id:customRecipe.appearance.customOverrides.hallway1,source:'custom'},
    hallway2:{id:customRecipe.appearance.customOverrides.hallway2,source:'custom'},
    hallway3:{id:customRecipe.appearance.customOverrides.hallway3,source:'custom'}
  }, [viewports[0]], 'custom');
  await customPage.close();

  const hybridRecipe = hybridHallwayRecipe();
  const hybridPage = await openStandardRuntime(await generateRecipe(hybridRecipe));
  const hybridHallways = await assertRenderedHallways(hybridPage, {
    hallway1:{id:'ledger-hall-1',source:'override'},
    hallway2:{id:hybridRecipe.appearance.customOverrides.hallway2,source:'custom'},
    hallway3:{id:'market-hall-3',source:'preset'}
  }, [viewports[0]], 'hybrid');
  await hybridPage.close();
  assert.equal(consoleErrors.length, 0, `Composer console errors: ${consoleErrors.join(' | ')}`);
  assert.equal(pageErrors.length, 0, `Composer page errors: ${pageErrors.join(' | ')}`);
  assert.equal(runtimeErrors.length, 0, `Generated game errors: ${runtimeErrors.join(' | ')}`);

  console.log(JSON.stringify({
    ok:true,
    officialAssets:'51/51',
    marketLabel:officialResult.marketLabel,
    requiredSha:officialResult.required,
    mixedOfficialCount:officialResult.mixedOfficialCount,
    mixedCustomCount:Object.keys(recipe.customAssets).length,
    viewports,
    modeRatios:['wide','square','portrait'],
    boss2:true,
    artifact2:true,
    hallwayTransitions:{official:officialHallways.length,custom:customHallways.length,hybrid:hybridHallways.length,resume:resumedHallway.length},
    presetSwitch:officialResult.presetSwitch,
    consoleErrors:0,
    artifactRoot
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
