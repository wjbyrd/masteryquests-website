'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  COMPOSER_ROOT,
  REPO_ROOT,
  loadComposerLibrary,
  loadCanonicalTemplate,
  attachConceptReviewRuntime,
  createMetadata,
  assertInlineScriptsCompile
} = require('./composer-test-helpers.js');
const core = require('../composer-core.js');
const themes = require('../data/official_theme_library.js');

const modeSlotByMode = {
  standard:'modeStandard',timed:'modeTimed',exam:'modeExam',quiz:'modeQuiz',unlimited:'modeUnlimited',
  legendary:'modeLegendary',score:'modeScore',trialGraph:'modeTrialGraph',fadingFortune:'modeFadingFortune',riskReward:'modeRiskReward'
};

function sha256(buffer){
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sourceFile(asset){
  return path.resolve(COMPOSER_ROOT, asset.sourceUrl);
}

function embedThemeAssets(assets){
  const embedded = {};
  for(const asset of assets){
    const bytes = fs.readFileSync(sourceFile(asset));
    embedded[asset.id] = `data:${asset.fileType};base64,${bytes.toString('base64')}`;
  }
  return embedded;
}

function embedQuestionAssets(composition){
  const embedded = {};
  for(const asset of composition.assets || []){
    const file = path.join(COMPOSER_ROOT, 'data', asset.runtimePath);
    const bytes = fs.readFileSync(file);
    assert.strictEqual(sha256(bytes), asset.sha256, `Question asset hash changed: ${asset.runtimePath}`);
    embedded[asset.runtimePath] = `data:image/webp;base64,${bytes.toString('base64')}`;
  }
  composition.embeddedQuestionAssets = embedded;
}

async function buildPreset({library, template, composition, baseRecipe, presetId, overrides = {}}){
  const recipe = {...baseRecipe, appearance:{presetId, overrides}};
  const resolved = core.resolveThemeSelection(recipe.appearance, themes);
  const selectedAssets = core.themeAssetsForSelection(resolved, recipe.supportedModes);
  const config = await core.createConfig(recipe, library, await core.sha256Hex(template), themes);
  config.visualTheme = core.createRuntimeThemeConfig(resolved, embedThemeAssets(selectedAssets), recipe.supportedModes);
  const metadata = createMetadata(core, composition, config, library, {
    themePreset:presetId,
    themeLibraryVersion:themes.libraryVersion
  });
  const html = core.buildHtml(template, composition, config, metadata);
  return {recipe, resolved, selectedAssets, config, html, bytes:Buffer.byteLength(html)};
}

(async function run(){
  let checks = 0;
  const pass = (condition, message) => { assert(condition, message); checks++; };
  const assetIds = new Set();
  const presetIds = new Set(Object.keys(themes.presets));

  pass(core.COMPOSER_VERSION === '4.5s.3k', 'Unexpected Composer version');
  pass(core.RECIPE_SCHEMA_VERSION === '1.4.0', 'Unexpected recipe schema');
  pass(themes.schemaVersion === '1.1.0', 'Unexpected theme schema');
  pass(Object.keys(themes.slots).length === 22, 'Unexpected visual-slot count');
  pass(themes.assets.length === 64, 'Unexpected official-asset count');
  pass(presetIds.has('default'), 'Default theme is missing');
  pass(themes.defaultPresetId === 'default', 'Default Mastery Quest is not the faculty default');
  pass(JSON.stringify(Object.values(themes.presets).filter(preset => preset.id !== 'default' && preset.facultyVisible !== false).map(preset => preset.id)) === JSON.stringify(['arcane-archive','market-citadel','managerial-cost-directive']), 'Faculty-facing official theme list is not the approved three-theme set');
  pass(!presetIds.has('national-ledger'), 'Retired National Ledger preset remains available');
  pass(!themes.assets.some(asset => /national-ledger|^ledger-/i.test(`${asset.id} ${asset.sourceUrl} ${asset.origin} ${asset.themeFamilies}`)), 'Retired National Ledger artwork remains in the faculty asset registry');

  for(const asset of themes.assets){
    pass(Boolean(asset.id && asset.label), 'Theme asset lacks an ID or label');
    pass(!assetIds.has(asset.id), `Duplicate theme asset ID: ${asset.id}`);
    assetIds.add(asset.id);
    pass(asset.category === 'theme', `${asset.id} is not isolated in the theme category`);
    pass(!/question-assets|concept-reviews|TAX-\d|DEMAND-|SUPPLY-/i.test(asset.sourceUrl), `${asset.id} exposes question media`);
    pass(Array.isArray(asset.compatibleSlots) && asset.compatibleSlots.length > 0, `${asset.id} has no slot compatibility`);
    for(const slotId of asset.compatibleSlots){
      pass(Boolean(themes.slots[slotId]), `${asset.id} references unknown slot ${slotId}`);
    }
    const file = sourceFile(asset);
    pass(fs.existsSync(file), `Missing official asset: ${asset.sourceUrl}`);
    const bytes = fs.readFileSync(file);
    pass(bytes.length === asset.sizeBytes, `Size mismatch: ${asset.id}`);
    pass(sha256(bytes) === asset.sha256, `Hash mismatch: ${asset.id}`);
    pass(asset.fileType === 'image/webp', `${asset.id} has an unexpected file type`);
    pass(!/^[A-Z]:\\|^file:/i.test(asset.sourceUrl), `${asset.id} contains a local development path`);
  }

  const productionPathEmbedded = await core.loadEmbeddedThemeAssets(themes.assets, async sourceUrl => {
    const asset = themes.assets.find(candidate => candidate.sourceUrl === sourceUrl);
    const bytes = fs.readFileSync(sourceFile(asset));
    return new Response(bytes, {status:200, headers:{'content-type':asset.fileType}});
  });
  pass(Object.keys(productionPathEmbedded).length === 64, 'Production embed path did not verify all 64 official assets');
  pass(Object.values(productionPathEmbedded).every(value => value.startsWith('data:image/webp;base64,')), 'Production embed path returned a nonportable official asset');

  for(const [presetId, preset] of Object.entries(themes.presets)){
    pass(preset.id === presetId, `Preset key mismatch: ${presetId}`);
    pass(Boolean(preset.label && preset.description), `Preset metadata incomplete: ${presetId}`);
    if(preset.previewAssetId) pass(assetIds.has(preset.previewAssetId), `Broken preview in ${presetId}`);
    for(const [slotId, assetId] of Object.entries(preset.values || {})){
      const asset = themes.assets.find(candidate => candidate.id === assetId);
      pass(Boolean(themes.slots[slotId]), `Unknown slot ${slotId} in ${presetId}`);
      pass(Boolean(asset), `Broken asset ${assetId} in ${presetId}`);
      pass(asset.compatibleSlots.includes(slotId), `${assetId} is incompatible with ${slotId}`);
    }
    const resolved = core.resolveThemeSelection({presetId, overrides:{}}, themes);
    for(const [slotId, definition] of Object.entries(themes.slots)){
      pass(Boolean(resolved.slots[slotId]), `${presetId} did not resolve ${slotId}`);
      if(definition.required) pass(Boolean(resolved.slots[slotId].asset || resolved.slots[slotId].fallback), `${presetId} has no fallback for ${slotId}`);
    }
  }

  const hybridInput = {presetId:'market-citadel',overrides:{boss1:'arcane-boss-1',artifact3:'directive-artifact-3',hallway2:'directive-hall-2'}};
  pass(themes.presets['market-citadel'].label === 'Market Gate', 'Stable market-citadel preset ID must display as Market Gate');
  const hybrid = core.resolveThemeSelection(hybridInput, themes);
  pass(hybrid.slots.boss1.asset.id === 'arcane-boss-1' && hybrid.slots.boss1.source === 'override', 'Boss override precedence failed');
  pass(hybrid.slots.hallway1.asset.id === 'market-hall-1' && hybrid.slots.hallway1.source === 'preset', 'Preset value was disturbed by another override');
  const changedPreset = core.resolveThemeSelection({...hybridInput,presetId:'managerial-cost-directive'}, themes);
  pass(changedPreset.slots.boss1.asset.id === 'arcane-boss-1', 'Explicit override did not survive a preset change');
  const resetBoss = core.resolveThemeSelection({presetId:'managerial-cost-directive',overrides:{artifact3:'directive-artifact-3',hallway2:'directive-hall-2'}}, themes);
  pass(resetBoss.slots.boss1.asset.id === 'directive-boss-1' && resetBoss.slots.boss1.source === 'preset', 'Reset to theme failed');
  const invalidOverride = core.resolveThemeSelection({presetId:'market-citadel',overrides:{boss1:'arcane-start'}}, themes);
  pass(invalidOverride.slots.boss1.asset.id === 'market-boss-1', 'Incompatible override was not rejected');

  const arcaneUnlimited = core.themeAssetsForSelection(core.resolveThemeSelection({presetId:'arcane-archive',overrides:{}}, themes), ['unlimited']);
  pass(arcaneUnlimited.some(asset => asset.id === 'arcane-mode-unlimited'), 'Enabled mode card was omitted');
  pass(!arcaneUnlimited.some(asset => asset.id === 'arcane-mode-standard'), 'Disabled mode card was embedded');
  for(const [mode, slotId] of Object.entries(modeSlotByMode)){
    pass(themes.slots[slotId].mode === mode, `Mode slot mismatch: ${slotId}`);
  }

  const oldRecipe = {
    schemaVersion:'1.2.0',title:'Legacy Faculty Quest',slug:'legacy-faculty-quest',supportedModes:['unlimited'],
    selectedConceptIds:['oligopoly'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  const migrated = core.migrateRecipe(oldRecipe, loadComposerLibrary(), themes).recipe;
  pass(migrated.appearance.presetId === 'default', 'Old recipe did not migrate to the faculty default theme');
  pass(Object.keys(migrated.appearance.overrides).length === 0, 'Old recipe gained unexpected artwork overrides');

  const library = loadComposerLibrary();
  const template = loadCanonicalTemplate();
  const baseRecipe = {
    schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Phase 3A Theme Validation',slug:'phase-3a-theme-validation',
    supportedModes:[...core.MODE_ORDER],selectedConceptIds:['perfect-competition'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  const composition = core.compose(library, baseRecipe);
  pass(composition.errors.length === 0, `Representative composition failed: ${composition.errors.join(' | ')}`);
  embedQuestionAssets(composition);
  attachConceptReviewRuntime(core, composition, library, baseRecipe.selectedConceptIds);

  const builds = {};
  const fixtureRoot = process.env.MQ_PHASE3A_FIXTURE_DIR ? path.resolve(process.env.MQ_PHASE3A_FIXTURE_DIR) : '';
  if(fixtureRoot) fs.mkdirSync(fixtureRoot, {recursive:true});
  for(const presetId of presetIds){
    builds[presetId] = await buildPreset({library,template,composition,baseRecipe,presetId});
    const build = builds[presetId];
    pass(build.html.includes('"visualTheme"'), `${presetId} output lacks visual configuration`);
    pass(!/[A-Z]:\\Users\\|file:\/\/|\.\.\/\.\.\/play\//i.test(build.html), `${presetId} output contains a development path`);
    for(const resolved of Object.values(build.resolved.slots)){
      if(!resolved.asset) continue;
      const mode = themes.slots[resolved.slotId]?.mode;
      if(mode && !baseRecipe.supportedModes.includes(mode)) continue;
      pass(build.config.visualTheme.slots[resolved.slotId].src.startsWith('data:image/webp;base64,'), `${presetId} did not embed ${resolved.slotId}`);
    }
    if(fixtureRoot) fs.writeFileSync(path.join(fixtureRoot, `${presetId}.html`), build.html);
  }
  pass(builds.default.selectedAssets.length === 3, 'Default theme did not embed exactly three checkpoint guardians');
  pass(['boss1','boss2','boss3'].every(slotId => builds.default.config.visualTheme.slots[slotId].src.startsWith('data:image/webp;base64,')), 'Default checkpoint guardians were not embedded');
  pass(builds.default.config.guide.identity === 'guide' && builds.default.config.guide.displayName === 'Guide', 'Default theme forced an official guide identity');
  pass(builds['arcane-archive'].selectedAssets.length === 22, 'Arcane preset coverage changed');
  pass(builds['market-citadel'].config.visualTheme.slots.modeQuiz.source === 'fallback', 'Missing optional mode art did not fall back');
  pass(builds['managerial-cost-directive'].config.visualTheme.slots.modeTrialGraph.source === 'fallback', 'Missing graph-mode art did not fall back');
  assertInlineScriptsCompile(builds['arcane-archive'].html, 'phase3a-arcane.html');
  checks++;

  const hybridBuild = await buildPreset({library,template,composition,baseRecipe,presetId:'market-citadel',overrides:hybridInput.overrides});
  pass(hybridBuild.config.visualTheme.slots.boss1.id === 'arcane-boss-1', 'Hybrid output lost its boss override');
  pass(hybridBuild.config.visualTheme.slots.artifact3.id === 'directive-artifact-3', 'Hybrid output lost its artifact override');
  pass(hybridBuild.config.visualTheme.slots.hallway1.id === 'market-hall-1', 'Hybrid output lost its base preset');
  if(fixtureRoot) fs.writeFileSync(path.join(fixtureRoot, 'hybrid.html'), hybridBuild.html);

  const composerHtml = fs.readFileSync(path.join(COMPOSER_ROOT, 'index.html'), 'utf8');
  const composerJs = fs.readFileSync(path.join(COMPOSER_ROOT, 'composer.js'), 'utf8');
  pass(composerHtml.includes('id="themePresetOptions"') && composerHtml.includes('id="themeSlotGroups"'), 'Composer appearance UI is missing');
  pass(composerJs.includes('faculty slot override') === false, 'Internal precedence terminology leaked into faculty UI');
  pass(composerJs.includes("source:'override'") === false, 'Resolver implementation was duplicated in the UI');

  const changedProductionFiles = require('child_process').execFileSync('git',['diff','--name-only','HEAD','--','play'],{cwd:REPO_ROOT,encoding:'utf8'}).trim();
  pass(changedProductionFiles === '', `Phase 3A changed deployed games or question banks: ${changedProductionFiles}`);

  console.log(JSON.stringify({
    ok:true,
    checks,
    composerVersion:core.COMPOSER_VERSION,
    recipeSchemaVersion:core.RECIPE_SCHEMA_VERSION,
    assetCount:themes.assets.length,
    slotCount:Object.keys(themes.slots).length,
    presets:[...presetIds],
    generatedBytes:Object.fromEntries(Object.entries(builds).map(([id,build]) => [id,build.bytes])),
    hybridBytes:hybridBuild.bytes
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
