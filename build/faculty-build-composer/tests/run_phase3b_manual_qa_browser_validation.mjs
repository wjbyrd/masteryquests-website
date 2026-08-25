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
const sharp = require('sharp');
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
    supportedModes:['standard','exam','trialGraph'],
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

function backgroundRecipe(label, presetId, customSourceId = ''){
  const recipe = mixedRecipe();
  recipe.title = `Manual QA ${label} Background`;
  recipe.slug = `manual-qa-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-background`;
  recipe.supportedModes = ['standard'];
  recipe.appearance = {presetId, overrides:{}, customOverrides:{}};
  recipe.customAssets = {};
  if(customSourceId){
    const record = customRecord(customSourceId, 'gameplayBackground');
    recipe.customAssets[record.id] = record;
    recipe.appearance.customOverrides.gameplayBackground = record.id;
  }
  return recipe;
}

async function largeCustomRecord(seed, slotId){
  const width = 2560;
  const height = 1440;
  const pixels = Buffer.allocUnsafe(width * height * 3);
  let value = seed >>> 0;
  for(let index = 0; index < pixels.length; index++){
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    pixels[index] = value & 255;
  }
  const bytes = await sharp(pixels, {raw:{width,height,channels:3}}).webp({quality:99,effort:1}).toBuffer();
  assert(bytes.length < 6 * 1024 * 1024, `Near-limit fixture exceeded the per-image limit: ${bytes.length}`);
  const digest = sha256(bytes);
  return {
    id:`faculty-${digest.slice(0, 24)}`,
    label:`Near-limit ${themes.slots[slotId].label}`,
    originalName:`near-limit-${slotId}.webp`,
    category:'theme-custom',
    fileType:'image/webp',
    width,
    height,
    originalWidth:width,
    originalHeight:height,
    originalSizeBytes:bytes.length,
    sizeBytes:bytes.length,
    sha256:digest,
    dataUrl:`data:image/webp;base64,${bytes.toString('base64')}`,
    compatibleSlots:[slotId],
    normalized:true
  };
}

async function nearPayloadLimitRecipe(){
  const recipe = backgroundRecipe('Near Payload Limit', 'default');
  const slots = ['startBackground','gameplayBackground','hallway1','hallway2','hallway3','modeStandard'];
  for(let index = 0; index < slots.length; index++){
    const record = await largeCustomRecord(0x13579bdf + index * 7919, slots[index]);
    recipe.customAssets[record.id] = record;
    recipe.appearance.customOverrides[slots[index]] = record.id;
  }
  const total = Object.values(recipe.customAssets).reduce((sum, record) => sum + record.sizeBytes, 0);
  assert(total > 20 * 1024 * 1024 && total <= 24 * 1024 * 1024, `Near-limit fixture total was ${total}`);
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

  await page.locator('.step-nav [data-step="5"]').click();
  const appearanceGroups = ['Progression','Characters','Rewards','Mode Cards'];
  const appearanceStateChecks = [];
  for(const groupName of appearanceGroups){
    let group = page.locator(`[data-theme-group="${groupName}"]`);
    if(!await group.evaluate(element => element.open)) await group.locator('summary').click();
    const slotId = await group.locator('[data-theme-slot]').first().getAttribute('data-theme-slot');
    const select = group.locator(`[data-theme-slot-select="${slotId}"]`);
    const officialOption = await select.locator('option:not([value=""])').first().getAttribute('value');
    await select.selectOption(officialOption);
    group = page.locator(`[data-theme-group="${groupName}"]`);
    assert(await group.evaluate(element => element.open), `${groupName} closed after official selection`);

    const fixture = themes.assets.find(asset => asset.compatibleSlots.includes(slotId));
    assert(fixture, `No upload fixture supports ${slotId}`);
    const inputSelector = `[data-custom-upload-input="${slotId}"]`;
    await group.locator(inputSelector).setInputFiles(sourceFile(fixture));
    await page.waitForFunction(({groupName,slotId}) => {
      const group = document.querySelector(`[data-theme-group="${groupName}"]`);
      return group?.open && group.querySelector(`[data-theme-slot="${slotId}"]`)?.textContent.includes('Custom image ready.');
    }, {groupName,slotId});
    group = page.locator(`[data-theme-group="${groupName}"]`);
    await group.locator(inputSelector).setInputFiles(sourceFile(fixture));
    await page.waitForFunction(({groupName,slotId}) => {
      const group = document.querySelector(`[data-theme-group="${groupName}"]`);
      return group?.open && group.querySelector(`[data-theme-slot="${slotId}"]`)?.textContent.includes('Custom image ready.');
    }, {groupName,slotId});
    group = page.locator(`[data-theme-group="${groupName}"]`);
    await group.locator(`[data-theme-reset="${slotId}"]`).click();
    assert(await page.locator(`[data-theme-group="${groupName}"]`).evaluate(element => element.open), `${groupName} closed after reset`);
    appearanceStateChecks.push({group:groupName,official:true,upload:true,replacement:true,reset:true});
  }

  const desiredGroupState = {Progression:true,Characters:false,Rewards:true,'Mode Cards':false};
  await page.evaluate(desired => {
    document.querySelectorAll('[data-theme-group]').forEach(group => { group.open = desired[group.dataset.themeGroup] ?? group.open; });
  }, desiredGroupState);
  await page.locator('[data-theme-preset="arcane-archive"]').click();
  await page.waitForFunction(() => document.querySelector('[data-theme-preset="arcane-archive"]')?.classList.contains('selected'));
  const preservedPresetState = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('[data-theme-group]')]
      .filter(group => ['Progression','Characters','Rewards','Mode Cards'].includes(group.dataset.themeGroup))
      .map(group => [group.dataset.themeGroup, group.open])
  ));
  assert.deepEqual(preservedPresetState, desiredGroupState, 'Preset change did not preserve Appearance group state');

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
    await page.waitForFunction(() => {
      const details = JSON.parse(document.querySelector('#technicalDetails')?.textContent || '{}');
      return details.generatedHtmlSize?.totalBytes > 0;
    }, null, {timeout:120000});
    const sizeEstimate = await page.evaluate(() => JSON.parse(document.querySelector('#technicalDetails').textContent).generatedHtmlSize);
    const downloadPromise = page.waitForEvent('download', {timeout:120000});
    await page.locator('#downloadPackage').click();
    const download = await downloadPromise;
    const downloadPath = path.join(artifactRoot, `${recipe.slug}.zip`);
    await download.saveAs(downloadPath);
    const entries = openStoredZip(fs.readFileSync(downloadPath));
    const html = entries.get(`${recipe.slug}.html`)?.toString('utf8') || '';
    assert(html, `Generated ${recipe.slug} HTML is missing from the ZIP`);
    assertInlineScriptsCompile(html, `${recipe.slug}.html`);
    assert.equal(Buffer.byteLength(html), sizeEstimate.totalBytes, `${recipe.slug} readiness estimate did not match generated HTML bytes`);
    assert.equal(dialogs.length, dialogCount, `Composer displayed an error: ${dialogs.slice(dialogCount).join(' | ')}`);
    return {html,sizeEstimate};
  }

  const recipe = mixedRecipe();
  const mixedBuild = await generateRecipe(recipe);
  generatedHtml = mixedBuild.html;

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

  async function openRuntime(html, mode = 'standard'){
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
    await targetPage.locator(`.mode-card[data-mode="${mode}"]`).click();
    if(mode === 'trialGraph'){
      await targetPage.waitForSelector('#trialGraphSetupModal', {state:'visible'});
      await targetPage.locator('[data-trial-graph-count="10"]').click();
      await targetPage.locator('#trialGraphLaunchButton').click();
    }
    await targetPage.waitForSelector('#gameBox', {state:'visible'});
    return targetPage;
  }

  async function answerCurrentQuestionCorrectly(targetPage){
    const correctIndex = await targetPage.evaluate(async () => {
      for(let index = 0; index < currentQuestion.options.length; index++){
        if(await isQuestionAnswerCorrect(currentQuestion, index)) return index;
      }
      return -1;
    });
    assert(Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4, `Invalid runtime answer index ${correctIndex}`);
    await targetPage.locator(`#answers button[data-answer-index="${correctIndex}"]`).click();
  }

  async function completeCheckpointLifecycle(targetPage, bossRoom, expected, prefix, viewport, verifyResume = false){
    const slotId = bossRoom === 10 ? 'hallway1' : bossRoom === 20 ? 'hallway2' : 'hallway3';
    await targetPage.setViewportSize(viewport);
    await targetPage.evaluate(targetRoom => {
      room = targetRoom;
      bossHealth = 3;
      bossPool = [];
      resetRemediationState();
      loadQuestion();
      bossHealth = 1;
    }, bossRoom);
    await targetPage.waitForSelector('#answers button[data-answer-index]', {state:'visible'});
    await answerCurrentQuestionCorrectly(targetPage);
    await targetPage.waitForTimeout(1200);
    const checkpointState = await targetPage.evaluate(() => ({
      room,
      bossHealth,
      answerSubmissionPending,
      continueVisible:Boolean(document.querySelector('#continueBtn')?.getBoundingClientRect().height),
      question:document.querySelector('#question')?.textContent.trim(),
      message:document.querySelector('#message')?.textContent.trim(),
      modal:document.querySelector('#gameModalText')?.textContent.trim(),
      answers:document.querySelector('#answers')?.textContent.trim()
    }));
    assert(checkpointState.continueVisible, `${prefix} did not reach checkpoint completion: ${JSON.stringify(checkpointState)}`);
    assert((await targetPage.locator('#question').innerText()).includes('CHECKPOINT'), `${prefix} checkpoint completion screen was not reached`);

    if(verifyResume){
      await targetPage.reload({waitUntil:'load'});
      await targetPage.waitForSelector('#continueRunBtn', {state:'visible'});
      await targetPage.locator('#continueRunBtn').click();
      await targetPage.waitForSelector('#continueBtn', {state:'visible'});
      assert.equal(await targetPage.evaluate(() => room), bossRoom, 'Resume did not restore the cleared checkpoint presentation state');
    }

    await targetPage.evaluate(() => {
      const overlay = document.querySelector('#hallwayTransition');
      window.__mqHallwayLifecycle = [];
      window.__mqHallwayObserver?.disconnect();
      window.__mqHallwayObserver = new MutationObserver(() => {
        window.__mqHallwayLifecycle.push({active:overlay.classList.contains('active'),time:performance.now()});
      });
      window.__mqHallwayObserver.observe(overlay, {attributes:true,attributeFilter:['class']});
    });
    await targetPage.locator('#continueBtn').click();
    await targetPage.waitForFunction(() => window.__mqHallwayLifecycle?.some(event => event.active));
    await targetPage.screenshot({path:path.join(artifactRoot, `hallway-${prefix}-${slotId}-${viewport.width}x${viewport.height}.png`)});
    const result = await targetPage.evaluate(slotId => {
      const overlay = document.querySelector('#hallwayTransition');
      const text = document.querySelector('#hallwayText');
      const slot = getFacultyVisualSlot(slotId);
      const style = getComputedStyle(overlay);
      const overlayRect = overlay.getBoundingClientRect();
      const textRect = text.getBoundingClientRect();
      return {
        slotId,
        assetId:slot.id,
        source:slot.source,
        inlineMatches:overlay.style.backgroundImage.includes(slot.src),
        computedMatches:style.backgroundImage.includes(slot.src),
        backgroundSize:style.backgroundSize,
        observedActive:window.__mqHallwayLifecycle.some(event => event.active),
        textVisible:textRect.width > 0 && textRect.height > 0 && textRect.left >= overlayRect.left - 1 && textRect.right <= overlayRect.right + 1,
        noHorizontalOverflow:document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
      };
    }, slotId);
    assert.equal(result.assetId, expected.id, `${prefix} ${slotId} resolved the wrong asset`);
    assert.equal(result.source, expected.source, `${prefix} ${slotId} used the wrong precedence source`);
    assert(result.inlineMatches && result.computedMatches, `${prefix} ${slotId} did not render its resolved image`);
    assert(result.backgroundSize.split(',').every(value => value.trim() === 'cover'), `${prefix} ${slotId} did not preserve aspect ratio`);
    assert(result.observedActive && result.textVisible && result.noHorizontalOverflow, `${prefix} ${slotId} transition layout failed: ${JSON.stringify(result)}`);
    await targetPage.waitForFunction(() => window.__mqHallwayLifecycle?.some(event => !event.active), null, {timeout:5000});
    const visibleMs = await targetPage.evaluate(() => {
      const shown = window.__mqHallwayLifecycle.find(event => event.active);
      const hidden = window.__mqHallwayLifecycle.find(event => !event.active && event.time > shown.time);
      window.__mqHallwayObserver?.disconnect();
      return hidden.time - shown.time;
    });
    assert(visibleMs >= 1600, `${prefix} ${slotId} was visible for only ${visibleMs} ms`);
    if(bossRoom < 30){
      assert.equal(await targetPage.evaluate(() => room), bossRoom + 1, `${prefix} did not advance after ${slotId}`);
      await targetPage.waitForTimeout(500);
      const nextState = await targetPage.evaluate(() => ({
        room,
        gameMode,
        runEnding,
        timedTerminal:isTimedModeTerminal(),
        answerButtons:document.querySelectorAll('#answers button[data-answer-index]').length,
        question:document.querySelector('#question')?.textContent.trim(),
        message:document.querySelector('#message')?.textContent.trim(),
        modal:document.querySelector('#gameModalText')?.textContent.trim()
      }));
      assert(nextState.answerButtons > 0, `${prefix} did not render the next question after ${slotId}: ${JSON.stringify(nextState)} runtimeErrors=${runtimeErrors.join(' | ')}`);
      if(verifyResume){
        const savedState = await targetPage.evaluate(() => {
          const saved = JSON.parse(localStorage.getItem(getSaveKey()) || '{}');
          return {room:saved.room,runPhase:saved.runPhase};
        });
        assert.deepEqual(savedState, {room:bossRoom + 1,runPhase:'question'}, 'Post-hallway Standard state was not saved at the next question');
      }
    } else {
      await targetPage.waitForFunction(() => document.querySelector('#gameBox')?.textContent.includes('RUN COMPLETE'));
      const finalState = await targetPage.evaluate(() => ({runEnding,hasSave:hasSavedGame('standard')}));
      assert.deepEqual(finalState, {runEnding:true,hasSave:false}, `${prefix} final checkpoint did not reach a clean completed state`);
    }
    return {...result,viewport,visibleMs,resume:verifyResume};
  }

  const officialExpectations = {
    hallway1:{id:'ledger-hall-1',source:'override'},
    hallway2:{id:'arcane-hall-2',source:'override'},
    hallway3:{id:'market-hall-3',source:'override'}
  };
  const officialHallways = [];
  for(const [viewportIndex, viewport] of viewports.entries()){
    const targetPage = viewportIndex === 0 ? runtimePage : await openRuntime(mixedBuild.html);
    for(const bossRoom of [10,20,30]){
      const slotId = bossRoom === 10 ? 'hallway1' : bossRoom === 20 ? 'hallway2' : 'hallway3';
      officialHallways.push(await completeCheckpointLifecycle(targetPage, bossRoom, officialExpectations[slotId], 'official', viewport, viewportIndex === 0 && bossRoom === 10));
    }
    if(targetPage !== runtimePage) await targetPage.close();
  }

  const trialPage = await openRuntime(mixedBuild.html, 'trialGraph');
  await answerCurrentQuestionCorrectly(trialPage);
  await trialPage.waitForFunction(() => document.querySelector('#hallwayTransition')?.classList.contains('active'));
  const trialGraphHallway = await trialPage.evaluate(() => ({
    mode:gameMode,
    active:document.querySelector('#hallwayTransition').classList.contains('active'),
    assetId:getFacultyVisualSlot('hallway1').id,
    room
  }));
  assert.deepEqual(trialGraphHallway, {mode:'trialGraph',active:true,assetId:'ledger-hall-1',room:2}, 'Trial by Graph working hallway comparison path changed');
  await trialPage.close();

  const assetPage = await openRuntime(mixedBuild.html);
  await assetPage.evaluate(() => { room = 20; bossHealth = 3; bossPool = []; loadQuestion(); });
  await assetPage.waitForSelector('.generic-boss-image');
  assert((await assetPage.locator('.generic-boss-image').getAttribute('src'))?.startsWith('data:image/webp;base64,'), 'Custom Boss 2 did not render');
  await assetPage.evaluate(() => showArtifact(artifacts.lens.img, artifacts.lens.title, artifacts.lens.text));
  assert((await assetPage.locator('#artifactImage').getAttribute('src'))?.startsWith('data:image/webp;base64,'), 'Custom Artifact 2 did not render');
  await assetPage.close();

  const customRecipe = customHallwayRecipe();
  const customBuild = await generateRecipe(customRecipe);
  const customPage = await openRuntime(customBuild.html);
  const customExpectations = {
    hallway1:{id:customRecipe.appearance.customOverrides.hallway1,source:'custom'},
    hallway2:{id:customRecipe.appearance.customOverrides.hallway2,source:'custom'},
    hallway3:{id:customRecipe.appearance.customOverrides.hallway3,source:'custom'}
  };
  const customHallways = [];
  for(const bossRoom of [10,20,30]){
    const slotId = bossRoom === 10 ? 'hallway1' : bossRoom === 20 ? 'hallway2' : 'hallway3';
    customHallways.push(await completeCheckpointLifecycle(customPage, bossRoom, customExpectations[slotId], 'custom', viewports[0]));
  }
  await customPage.close();

  const hybridRecipe = hybridHallwayRecipe();
  const hybridBuild = await generateRecipe(hybridRecipe);
  const hybridPage = await openRuntime(hybridBuild.html);
  const hybridExpectations = {
    hallway1:{id:'ledger-hall-1',source:'override'},
    hallway2:{id:hybridRecipe.appearance.customOverrides.hallway2,source:'custom'},
    hallway3:{id:'market-hall-3',source:'preset'}
  };
  const hybridHallways = [];
  for(const bossRoom of [10,20,30]){
    const slotId = bossRoom === 10 ? 'hallway1' : bossRoom === 20 ? 'hallway2' : 'hallway3';
    hybridHallways.push(await completeCheckpointLifecycle(hybridPage, bossRoom, hybridExpectations[slotId], 'hybrid', viewports[0]));
  }
  await hybridPage.close();

  const backgroundDefinitions = [
    {label:'default',recipe:backgroundRecipe('Default', 'default'),themed:false},
    {label:'market',recipe:backgroundRecipe('Market Gate', 'market-citadel'),themed:true},
    {label:'ledger',recipe:backgroundRecipe('National Ledger', 'national-ledger'),themed:true},
    {label:'arcane',recipe:backgroundRecipe('Arcane', 'arcane-archive'),themed:true},
    {label:'custom-light',recipe:backgroundRecipe('Custom Light', 'default', 'market-start'),themed:true},
    {label:'custom-dark',recipe:backgroundRecipe('Custom Dark', 'default', 'arcane-gameplay'),themed:true},
    {label:'custom-busy',recipe:backgroundRecipe('Custom Busy', 'default', 'ledger-start'),themed:true}
  ];
  const backgroundBuilds = new Map();
  for(const definition of backgroundDefinitions){
    backgroundBuilds.set(definition.label, await generateRecipe(definition.recipe));
  }

  async function screenshotMean(pathname, crop){
    const pipeline = sharp(pathname);
    if(crop) pipeline.extract(crop);
    const stats = await pipeline.stats();
    return stats.channels.slice(0, 3).reduce((sum, channel) => sum + channel.mean, 0) / 3;
  }

  async function screenshotDelta(firstPath, secondPath){
    const first = await sharp(firstPath).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const second = await sharp(secondPath).removeAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(first.data.length, second.data.length, 'Screenshot dimensions differ');
    let total = 0;
    for(let index = 0; index < first.data.length; index++) total += Math.abs(first.data[index] - second.data[index]);
    return total / first.data.length;
  }

  const backgroundResults = [];
  const backgroundScreenshots = new Map();
  let beforeAfter = null;
  for(const definition of backgroundDefinitions){
    const build = backgroundBuilds.get(definition.label);
    const targetPage = await openRuntime(build.html);
    for(const viewport of viewports){
      await targetPage.setViewportSize(viewport);
      await targetPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const presentation = await targetPage.evaluate(() => {
        const visible = element => {
          const rect = element?.getBoundingClientRect();
          const style = element ? getComputedStyle(element) : null;
          return Boolean(rect && rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity) > 0);
        };
        const opaqueSurface = element => {
          const style = getComputedStyle(element);
          return style.backgroundImage !== 'none' || !['rgba(0, 0, 0, 0)','transparent'].includes(style.backgroundColor);
        };
        const answerButtons = [...document.querySelectorAll('#answers button')];
        return {
          themed:document.body.classList.contains('mq-themed'),
          backgroundImage:getComputedStyle(document.body).backgroundImage,
          overlayVariable:getComputedStyle(document.body).getPropertyValue('--mq-gameplay-scene-overlay').trim(),
          questionVisible:visible(document.querySelector('#question')),
          answersVisible:answerButtons.length === 4 && answerButtons.every(visible),
          statusVisible:visible(document.querySelector('#areaDisplay')) && visible(document.querySelector('#progressBar')),
          guideVisible:visible(document.querySelector('#wizardBox')) && visible(document.querySelector('#wizardName')),
          readableSurfaces:['#gameShell','#gameBox','#wizardBox'].every(selector => opaqueSurface(document.querySelector(selector))) && answerButtons.every(opaqueSurface),
          noHorizontalOverflow:document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        };
      });
      assert.equal(presentation.themed, definition.themed, `${definition.label} theme activation mismatch`);
      if(definition.themed){
        assert(presentation.backgroundImage.includes('data:image/webp;base64,'), `${definition.label} artwork was not present in the outer scene`);
        assert(presentation.overlayVariable.includes('rgba(2,6,23,.30)') && presentation.overlayVariable.includes('rgba(2,6,23,.48)'), `${definition.label} did not use the shared scene overlay contract`);
      }
      assert(presentation.questionVisible && presentation.answersVisible && presentation.statusVisible && presentation.guideVisible, `${definition.label} content was unreadable at ${viewport.width}x${viewport.height}: ${JSON.stringify(presentation)}`);
      assert(presentation.readableSurfaces, `${definition.label} lost an opaque content surface at ${viewport.width}x${viewport.height}`);
      assert(presentation.noHorizontalOverflow, `${definition.label} overflowed horizontally at ${viewport.width}x${viewport.height}`);

      if(definition.label === 'market' && viewport.width === 1440){
        await targetPage.addStyleTag({content:'body.blank-builder-template.mq-themed{background-image:linear-gradient(rgba(2,6,23,.70),rgba(2,6,23,.82)),var(--mq-gameplay-image)!important}'});
        const beforePath = path.join(artifactRoot, 'gameplay-before-market-1440x900.png');
        await targetPage.screenshot({path:beforePath});
        await targetPage.locator('style').last().evaluate(element => element.remove());
        await targetPage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const afterPath = path.join(artifactRoot, 'gameplay-after-market-1440x900.png');
        await targetPage.screenshot({path:afterPath});
        const crop = {left:0,top:0,width:200,height:900};
        const beforeMean = await screenshotMean(beforePath, crop);
        const afterMean = await screenshotMean(afterPath, crop);
        const delta = await screenshotDelta(beforePath, afterPath);
        assert(afterMean > beforeMean + 5, `Repaired Market scene did not become visibly clearer (${beforeMean.toFixed(1)} -> ${afterMean.toFixed(1)})`);
        assert(delta > 4, `Before/after screenshots were not meaningfully different (${delta.toFixed(1)})`);
        beforeAfter = {beforePath,afterPath,beforeMean,afterMean,delta};
      }

      const screenshotPath = path.join(artifactRoot, `gameplay-${definition.label}-${viewport.width}x${viewport.height}.png`);
      await targetPage.screenshot({path:screenshotPath});
      backgroundScreenshots.set(`${definition.label}:${viewport.width}x${viewport.height}`, screenshotPath);
      backgroundResults.push({label:definition.label,viewport,presentation});
    }
    await targetPage.close();
  }

  for(const viewport of viewports){
    const fallback = backgroundScreenshots.get(`default:${viewport.width}x${viewport.height}`);
    for(const definition of backgroundDefinitions.filter(item => item.themed)){
      const candidate = backgroundScreenshots.get(`${definition.label}:${viewport.width}x${viewport.height}`);
      const delta = await screenshotDelta(fallback, candidate);
      assert(delta > 4, `${definition.label} did not make a meaningful visual difference at ${viewport.width}x${viewport.height}: ${delta.toFixed(1)}`);
    }
  }

  const nearLimitRecipe = await nearPayloadLimitRecipe();
  const nearLimitBuild = await generateRecipe(nearLimitRecipe);
  const sizeBuilds = {
    default:backgroundBuilds.get('default').sizeEstimate,
    market:backgroundBuilds.get('market').sizeEstimate,
    nationalLedger:backgroundBuilds.get('ledger').sizeEstimate,
    arcane:backgroundBuilds.get('arcane').sizeEstimate,
    lightCustom:backgroundBuilds.get('custom-light').sizeEstimate,
    moderateCustom:mixedBuild.sizeEstimate,
    nearCustomPayloadLimit:nearLimitBuild.sizeEstimate
  };
  for(const [label, breakdown] of Object.entries(sizeBuilds)){
    assert.equal(
      breakdown.totalBytes,
      breakdown.baseTemplateCodeQuestionBytes + breakdown.officialArtworkBytes + breakdown.customArtworkBytes + breakdown.questionGraphMediaBytes,
      `${label} size components did not sum to the generated HTML total`
    );
  }
  assert(sizeBuilds.default.questionGraphMediaBytes > 0, 'Question graph media contribution was not measured');
  assert(sizeBuilds.market.officialArtworkBytes > 0 && sizeBuilds.nationalLedger.officialArtworkBytes > 0 && sizeBuilds.arcane.officialArtworkBytes > 0, 'Official artwork contribution was not measured');
  assert(sizeBuilds.lightCustom.customArtworkBytes > 0 && sizeBuilds.moderateCustom.customArtworkBytes > sizeBuilds.lightCustom.customArtworkBytes, 'Custom artwork contribution was not measured');
  assert(sizeBuilds.nearCustomPayloadLimit.customArtworkBytes > 25 * 1024 * 1024, 'Near-limit build did not exercise a near-policy-limit embedded payload');
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
    appearanceGroupState:appearanceStateChecks,
    modeRatios:['wide','square','portrait'],
    boss2:true,
    artifact2:true,
    hallwayTransitions:{official:officialHallways.length,custom:customHallways.length,hybrid:hybridHallways.length,resume:officialHallways.filter(result => result.resume).length,trialGraph:trialGraphHallway},
    backgrounds:{checks:backgroundResults.length,beforeAfter},
    generatedSizes:sizeBuilds,
    presetSwitch:officialResult.presetSwitch,
    consoleErrors:0,
    artifactRoot
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
