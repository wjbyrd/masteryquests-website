'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const core = require('../composer-core.js');
const themes = require('../data/official_theme_library.js');

const composerRoot = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(composerRoot, 'template', 'mastery-quests-faculty-template-composer-ready.html'), 'utf8');
const composerHtml = fs.readFileSync(path.join(composerRoot, 'index.html'), 'utf8');
const composerJs = fs.readFileSync(path.join(composerRoot, 'composer.js'), 'utf8');

let checks = 0;
function test(name, fn){
  fn();
  checks++;
  process.stdout.write(`PASS ${name}\n`);
}

function resolved(presetId, customAssets = {}, customOverrides = {}){
  return core.resolveThemeSelection({presetId, overrides:{}, customOverrides}, themes, customAssets);
}

function functionBody(name){
  const start = template.indexOf(`function ${name}`);
  assert(start >= 0, `Missing ${name}`);
  const next = template.indexOf('\nfunction ', start + 10);
  return template.slice(start, next < 0 ? template.length : next);
}

const expectedGuides = {
  'arcane-archive':['archivist','The Archivist'],
  'market-citadel':['chancellor','The Chancellor'],
  'managerial-cost-directive':['principal','The Principal']
};

test('default plus three official faculty themes remain', () => {
  assert.deepStrictEqual(
    Object.values(themes.presets).filter(preset => preset.facultyVisible !== false).map(preset => preset.id),
    ['default', ...Object.keys(expectedGuides)]
  );
  assert.strictEqual(themes.defaultPresetId, 'default');
  assert(!themes.presets['national-ledger']);
  assert(!themes.assets.some(asset => /national-ledger|^ledger-/i.test(`${asset.id} ${asset.sourceUrl} ${asset.origin} ${asset.themeFamilies}`)));
  const defaultSelection = resolved('default');
  assert(Object.values(defaultSelection.slots).every(slot => slot.source === 'fallback'));
  assert.deepStrictEqual(core.createGuideConfig({guideName:''}, defaultSelection, themes), {
    identity:'guide', displayName:'Guide', imageSlot:'guideImage',
    introLines:["Greetings. I am Guide. I'll be with you as you make your way through this Quest.",'If you are ready, follow me.'],
    custom:false
  });
  assert.strictEqual(core.createGuideConfig({guideName:'Dr. Chen'}, defaultSelection, themes).displayName, 'Dr. Chen');
});

for(const [presetId, [identity, displayName]] of Object.entries(expectedGuides)){
  test(`${presetId} guide identity`, () => {
    const selection = resolved(presetId);
    const guide = core.createGuideConfig({guideName:''}, selection, themes);
    assert.strictEqual(guide.identity, identity);
    assert.strictEqual(guide.displayName, displayName);
    assert.strictEqual(selection.slots.guideImage.asset.displayName, displayName);
    assert.strictEqual(guide.imageSlot, 'guideImage');
    assert.strictEqual(guide.introLines.length, 2);
    if(presetId === 'managerial-cost-directive'){
      assert(selection.slots.guideImage.asset.sourceUrl.endsWith('/principal.webp'));
      assert(selection.slots.boss1.asset.sourceUrl.endsWith('/analyst.webp'));
      assert(selection.slots.boss2.asset.sourceUrl.endsWith('/manager.webp'));
      assert(selection.slots.boss3.asset.sourceUrl.endsWith('/director.webp'));
      assert.strictEqual(selection.slots.modeTrialGraph.source, 'fallback');
    }
  });
}

test('custom guide name is used with custom guide art', () => {
  const id = 'faculty-0000000000000000';
  const custom = {[id]:{id,label:'Faculty guide',compatibleSlots:['guideImage'],dataUrl:'data:image/webp;base64,AA==',fileType:'image/webp',width:800,height:1000,sizeBytes:1,sha256:'0'.repeat(64)}};
  const guide = core.createGuideConfig({guideName:'  Professor Rivera  '}, resolved('default', custom, {guideImage:id}), themes);
  assert.strictEqual(guide.identity, 'custom');
  assert.strictEqual(guide.displayName, 'Professor Rivera');
  assert.strictEqual(guide.custom, true);
  assert(guide.introLines[0].includes('Professor Rivera'));
});

test('blank custom guide name falls back to Guide', () => {
  const id = 'faculty-0000000000000000';
  const custom = {[id]:{id,label:'Faculty guide',compatibleSlots:['guideImage'],dataUrl:'data:image/webp;base64,AA==',fileType:'image/webp',width:800,height:1000,sizeBytes:1,sha256:'0'.repeat(64)}};
  const guide = core.createGuideConfig({guideName:'   '}, resolved('market-citadel', custom, {guideImage:id}), themes);
  assert.strictEqual(guide.displayName, 'Guide');
  assert(guide.introLines[0].includes('Guide'));
});

test('Guide Name is a faculty-facing optional field', () => {
  assert(composerHtml.includes('id="guideName"'));
  assert(/Guide Name[\s\S]{0,160}optional/i.test(composerHtml));
  assert(/guideName:\s*''/.test(composerJs));
});

test('guide name survives recipe migration', () => {
  const migrated = core.migrateRecipe({title:'Guide Test',slug:'guide-test',supportedModes:['standard'],selectedConceptIds:[],guideName:'Dr. Chen'}, {}, themes).recipe;
  assert.strictEqual(migrated.guideName, 'Dr. Chen');
});

test('legacy National Ledger recipes migrate to Cost Directive', () => {
  const result = core.migrateRecipe({appearance:{presetId:'national-ledger'}}, {}, themes);
  assert.strictEqual(result.recipe.appearance.presetId, 'managerial-cost-directive');
  assert(result.migrationWarnings.some(item => item.type === 'theme-preset-migration'));
});

test('generated config contains the normalized shared guide config', () => {
  const guide = core.createGuideConfig({guideName:''}, resolved('managerial-cost-directive'), themes);
  assert.deepStrictEqual(guide, {
    identity:'principal', displayName:'The Principal', imageSlot:'guideImage',
    introLines:[
      'Welcome. I am the Principal. I will guide you through this directive and see that your decisions hold up under pressure.',
      'If you are ready, follow me.'
    ], custom:false
  });
});

test('cutscene markup is full-screen and accessible', () => {
  assert(template.includes('id="guideIntroScreen"'));
  assert(template.includes('aria-modal="true"'));
  assert(template.includes('class="guide-intro-screen"'));
  assert(template.includes('id="guideIntroProceed"'));
});

test('cutscene uses the same guide slot as gameplay', () => {
  assert(template.includes('const guide = getFacultyVisualSlot("guideImage")'));
  assert(template.includes('guideIntroImage'));
  assert(template.includes('wizardImage'));
  assert(template.includes('guideConfig.displayName'));
});

test('first-time state is namespaced and persistent', () => {
  assert(template.includes('const GUIDE_INTRO_SEEN_KEY = `${STORAGE_PREFIX}:guideIntroSeen`'));
  assert(functionBody('hasSeenGuideIntroduction').includes('localStorage.getItem(GUIDE_INTRO_SEEN_KEY)'));
  assert(functionBody('setGuideIntroductionSeen').includes('localStorage.setItem(GUIDE_INTRO_SEEN_KEY, "true")'));
});

test('mode preflight runs before the first-time guide gate', () => {
  const body = functionBody('startSelectedMode');
  assert(body.indexOf('validateFacultyMode(requestedMode)') < body.indexOf('!hasSeenGuideIntroduction()'));
});

test('gameplay initialization waits until after the guide gate', () => {
  const body = functionBody('startSelectedMode');
  assert(body.indexOf('!hasSeenGuideIntroduction()') < body.indexOf('beginRunSession()'));
  assert(body.indexOf('!hasSeenGuideIntroduction()') < body.indexOf('gameMode = requestedMode'));
});

test('Proceed starts the exact selected mode once', () => {
  const body = functionBody('startSelectedMode');
  assert(body.includes('startSelectedMode(requestedMode, {...options, guideIntroConfirmed:true})'));
  assert(body.includes('return;'));
});

test('seen players bypass the introduction', () => {
  const body = functionBody('startSelectedMode');
  assert(body.includes('!options.guideIntroConfirmed && !hasSeenGuideIntroduction()'));
});

test('Game Menu exposes replay', () => {
  assert(template.includes('id="gameMenuGuideIntro"'));
  assert(template.includes('onclick="replayGuideIntroduction()"'));
});

test('replay does not initialize or reset a mode', () => {
  const body = functionBody('replayGuideIntroduction');
  assert(body.includes('openGuideIntroduction({replay:true})'));
  assert(!/startSelectedMode|startGame|resetRunState|beginRunSession/.test(body));
  assert(functionBody('openGuideIntroduction').includes('pauseFadingFortune("guide-intro")'));
  assert(functionBody('closeGuideIntroduction').includes('resumeFadingFortune("guide-intro")'));
});

assert.strictEqual(checks, 19);
console.log(JSON.stringify({ok:true, checks, facultyThemes:Object.keys(expectedGuides)}, null, 2));
