'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const themes = require('../data/official_theme_library.js');

const ROOT = path.resolve(__dirname, '..');
const ASSET_ROOT = path.join(ROOT, 'data', 'default-theme-assets');
const template = fs.readFileSync(path.join(ROOT, 'template', 'mastery-quests-faculty-template-composer-ready.html'), 'utf8');
const composer = fs.readFileSync(path.join(ROOT, 'composer.js'), 'utf8');
let checks = 0;

function check(condition, message){
  assert.ok(condition, message);
  checks++;
}

function sha256(bytes){
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function webpChunks(bytes){
  check(bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP', 'Character asset is not a WebP RIFF container');
  const chunks = [];
  for(let offset = 12; offset + 8 <= bytes.length;){
    const type = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    chunks.push(type);
    offset += 8 + size + (size & 1);
  }
  return chunks;
}

const expected = [
  {id:'default-guide',slot:'guideImage',file:'default-guide.webp',displayName:'The Guide',width:916,height:1717,sizeBytes:60956,sha256:'07543456aee95178002b8d9ef09bac1bd5f4c9897f30dea0bb45287d82256854'},
  {id:'default-boss-1',slot:'boss1',file:'default-boss-challenger.webp',displayName:'The Challenger',width:916,height:1717,sizeBytes:80474,sha256:'b7ffb0c8b3482abc3e2d46e81c46d1b6d333dbc392cd012fae2ae24e2d5805e1'},
  {id:'default-boss-2',slot:'boss2',file:'default-boss-enforcer.webp',displayName:'The Enforcer',width:916,height:1717,sizeBytes:89176,sha256:'c755306fb2b1b5cf5b0a7c42436127251ad2a60802010e320f5d73db39a3799a'},
  {id:'default-boss-3',slot:'boss3',file:'default-boss-warden.webp',displayName:'The Warden',width:916,height:1717,sizeBytes:98080,sha256:'9c846508a91c58e2ffc99efc211117297dd9033025ae968f720c21314acb088c'}
];

function run(){
  check(themes.libraryVersion === 'default-character-refresh-2026-08-30', 'Default character library version is stale');
  check(themes.presets.default.values.guideImage === 'default-guide', 'Default preset does not register the real Guide');
  check(themes.presets.default.previewAssetId === 'default-guide', 'Default preset card does not preview the Guide');

  for(const item of expected){
    const asset = themes.assets.find(candidate => candidate.id === item.id);
    const file = path.join(ASSET_ROOT, item.file);
    check(Boolean(asset), `Missing registry record: ${item.id}`);
    check(fs.existsSync(file), `Missing canonical asset: ${item.file}`);
    const bytes = fs.readFileSync(file);
    check(bytes.length === item.sizeBytes && sha256(bytes) === item.sha256, `Asset integrity mismatch: ${item.file}`);
    check(asset.sourceUrl === `./data/default-theme-assets/${item.file}`, `Registry path mismatch: ${item.id}`);
    check(asset.width === item.width && asset.height === item.height, `Registry dimensions mismatch: ${item.id}`);
    check(asset.displayName === item.displayName && asset.compatibleSlots.includes(item.slot), `Character identity/slot mismatch: ${item.id}`);
    check(asset.presentationMode === 'transparent-character', `Built-in character is not direct-composition art: ${item.id}`);
    const chunks = webpChunks(bytes);
    check(chunks.includes('VP8X') && chunks.includes('ALPH'), `WebP has no genuine alpha channel: ${item.file}`);
  }

  const defaults = core.resolveThemeSelection({presetId:'default',overrides:{},customOverrides:{}}, themes, {});
  for(const item of expected){
    check(defaults.slots[item.slot].source === 'preset' && defaults.slots[item.slot].asset.id === item.id, `Default resolver missed ${item.slot}`);
  }
  check(defaults.slots.guideImage.asset.previewUrl === defaults.slots.guideImage.asset.sourceUrl, 'Composer and runtime do not share the Guide asset');
  check(/themeThumbnail\(current\.asset/.test(composer), 'Composer slot thumbnails do not use resolved assets');
  check(composer.includes("current.source === 'default' ? 'Default Mastery Quest' : 'Emergency fallback'"), 'Composer does not distinguish default art from the emergency fallback');

  const embedded = Object.fromEntries(expected.map(item => {
    const bytes = fs.readFileSync(path.join(ASSET_ROOT, item.file));
    return [item.id, `data:image/webp;base64,${bytes.toString('base64')}`];
  }));
  const runtime = core.createRuntimeThemeConfig(defaults, embedded, ['standard','exam','quiz']);
  for(const item of expected){
    check(runtime.slots[item.slot].id === item.id && runtime.slots[item.slot].src.startsWith('data:image/webp;base64,'), `Runtime did not embed ${item.slot}`);
    check(runtime.slots[item.slot].presentationMode === 'transparent-character', `Runtime lost direct-composition metadata for ${item.slot}`);
  }
  const defaultGuide = core.createGuideConfig({guideName:''}, defaults, themes);
  check(defaultGuide.displayName === 'The Guide', 'Default Guide title is not neutral');
  check(defaultGuide.introLines[0] === 'Greetings. I’ll be with you as you make your way through this Quest.', 'Default Guide intro is redundant or stale');
  check(!/\bI am\b/i.test(defaultGuide.introLines.join(' ')), 'Default Guide body copy repeats the displayed title');

  check(/const guide = getFacultyVisualSlot\("guideImage"\)/.test(template), 'Guide presentations do not share the Guide slot');
  check(/guide-intro-kicker">Your Guide<\/p>[\s\S]*guide-intro-name">The Guide<\/h1>/.test(template), 'Default Guide heading hierarchy is not preserved');
  check(/wizard\.appendChild\(image\)/.test(template), 'Gameplay does not render the resolved Guide image');
  check(/introImage\.src = guide\.src \|\| ""/.test(template), 'Guide Introduction does not render the resolved Guide image');
  check(/if\(introFallback\) introFallback\.hidden = Boolean\(guide\.src\)/.test(template), 'MQ icon is not limited to missing Guide art');
  check(/function replayGuideIntroduction\(\)[\s\S]*openGuideIntroduction\(\{replay:true\}\)/.test(template), 'Replay Introduction no longer reuses the Guide cutscene');
  check(/roomNumber === 10 \? "boss1" : roomNumber === 20 \? "boss2" : "boss3"/.test(template), 'Boss reveals do not map to the three default slots');
  check(/function openBossReveal\(encounter\)/.test(template), 'Adaptive boss reveal entry point is missing');
  check(/applyCharacterPresentationMode\(introImage, guide\)/.test(template) && /applyCharacterPresentationMode\(image, visual\)/.test(template), 'Transparent presentation mode is not applied to Guide and bosses');

  const arcane = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{},customOverrides:{}}, themes, {});
  check(arcane.slots.guideImage.asset.id === 'arcane-guide' && arcane.slots.boss1.asset.id === 'arcane-boss-1', 'Official theme does not override defaults');
  check(core.createGuideConfig({guideName:''}, arcane, themes).displayName === 'The Archivist', 'Official Guide identity was replaced by the generic Guide');

  const guideId = 'faculty-1111111111111111';
  const bossId = 'faculty-2222222222222222';
  const customAssets = {
    [guideId]:{id:guideId,label:'Faculty Guide',category:'theme-custom',compatibleSlots:['guideImage'],dataUrl:'data:image/jpeg;base64,AA==',fileType:'image/jpeg',width:900,height:1200,sizeBytes:1,sha256:'1'.repeat(64)},
    [bossId]:{id:bossId,label:'Faculty Boss',category:'theme-custom',compatibleSlots:['boss2'],dataUrl:'data:image/png;base64,AA==',fileType:'image/png',width:900,height:1200,sizeBytes:1,sha256:'2'.repeat(64)}
  };
  const custom = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{},customOverrides:{guideImage:guideId,boss2:bossId}}, themes, customAssets);
  check(custom.slots.guideImage.source === 'custom' && custom.slots.boss2.source === 'custom', 'Faculty art does not override theme/default art');
  check(core.createGuideConfig({guideName:'Professor Rivera'}, custom, themes).displayName === 'Professor Rivera', 'Custom Guide name no longer works');
  const customRuntime = core.createRuntimeThemeConfig(custom, {[guideId]:'data:image/jpeg;base64,AA==',[bossId]:'data:image/png;base64,AA=='}, ['standard']);
  check(customRuntime.slots.guideImage.presentationMode === 'custom-image' && customRuntime.slots.boss2.presentationMode === 'custom-image', 'Rectangular faculty images no longer use framed presentation');

  check(/event:"checkpoint_outcome"/.test(template), 'Checkpoint outcome system was damaged');
  check(/modeAllowsArtifactPowers/.test(template) && /activateArtifactPower/.test(template), 'Artifact powers were damaged');
  check(/recordExamDraftAnswer\(choice, isCorrect, responseTime\);\s*return;/.test(template), 'Exam Drill correctness suppression was damaged');
  check(/function navigateExamRoom\(targetRoom\)/.test(template), 'Exam Drill navigation was damaged');
  check(/getWeakestBossObjective/.test(template) && /getFacultyBossLine/.test(template), 'Adaptive boss dialogue was damaged');
  check(/function initializeDailyChallenges/.test(template) && /recordDailyGameplayEvent/.test(template), 'Daily Challenges were damaged');
  check(/id="returnMenuBtn"/.test(template) && /function toggleGameMenuFullscreen/.test(template), 'Game Menu/fullscreen was damaged');

  console.log(JSON.stringify({ok:true, checks, assets:expected.map(item => item.file)}, null, 2));
}

run();
