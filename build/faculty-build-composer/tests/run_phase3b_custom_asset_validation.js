'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  COMPOSER_ROOT,
  loadComposerLibrary,
  loadCanonicalTemplate,
  attachConceptReviewRuntime,
  createMetadata,
  assertInlineScriptsCompile
} = require('./composer-test-helpers.js');
const core = require('../composer-core.js');
const custom = require('../custom-asset-core.js');
const themes = require('../data/official_theme_library.js');

function sha256(bytes){
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function sourceFile(asset){
  return path.resolve(COMPOSER_ROOT, asset.sourceUrl);
}

function recordFromOfficial(assetId, compatibleSlots){
  const asset = themes.assets.find(candidate => candidate.id === assetId);
  assert(asset, `Missing fixture source ${assetId}`);
  const bytes = fs.readFileSync(sourceFile(asset));
  const hash = sha256(bytes);
  return {
    id:`faculty-${hash.slice(0, 24)}`,
    label:'Custom image',
    originalName:`${assetId}.webp`,
    category:'theme-custom',
    fileType:'image/webp',
    width:asset.width,
    height:asset.height,
    originalWidth:asset.width,
    originalHeight:asset.height,
    originalSizeBytes:bytes.length,
    sizeBytes:bytes.length,
    sha256:hash,
    dataUrl:`data:image/webp;base64,${bytes.toString('base64')}`,
    compatibleSlots,
    normalized:true
  };
}

function embedQuestionAssets(composition){
  composition.embeddedQuestionAssets = {};
  for(const asset of composition.assets || []){
    const bytes = fs.readFileSync(path.join(COMPOSER_ROOT, 'data', asset.runtimePath));
    assert.strictEqual(sha256(bytes), asset.sha256, `Question media changed: ${asset.runtimePath}`);
    composition.embeddedQuestionAssets[asset.runtimePath] = `data:image/webp;base64,${bytes.toString('base64')}`;
  }
}

function embeddedOfficialAssets(assets){
  return Object.fromEntries(assets.map(asset => {
    const bytes = fs.readFileSync(sourceFile(asset));
    assert.strictEqual(sha256(bytes), asset.sha256, `Official artwork changed: ${asset.id}`);
    return [asset.id, `data:${asset.fileType};base64,${bytes.toString('base64')}`];
  }));
}

async function build({library, template, composition, baseRecipe, appearance, customAssets}){
  const recipe = {...baseRecipe, appearance, customAssets};
  const canonical = core.canonicalRecipe(recipe, library, themes);
  const resolved = core.resolveThemeSelection(canonical.appearance, themes, canonical.customAssets);
  const official = core.themeAssetsForSelection(resolved, canonical.supportedModes);
  const selectedCustom = core.customAssetsForSelection(resolved, canonical.supportedModes);
  const embedded = embeddedOfficialAssets(official);
  for(const asset of selectedCustom) embedded[asset.id] = asset.dataUrl;
  const config = await core.createConfig(canonical, library, await core.sha256Hex(template), themes);
  config.visualTheme = core.createRuntimeThemeConfig(resolved, embedded, canonical.supportedModes);
  const metadata = createMetadata(core, composition, config, library, {
    themePreset:resolved.presetId,
    themeLibraryVersion:themes.libraryVersion,
    customThemeAssetCount:selectedCustom.length
  });
  const html = core.buildHtml(template, composition, config, metadata);
  return {canonical, resolved, selectedCustom, config, html, bytes:Buffer.byteLength(html)};
}

(async function run(){
  let checks = 0;
  const pass = (condition, message) => { assert(condition, message); checks++; };
  const throwsCode = (fn, code) => {
    let caught = null;
    try{ fn(); } catch(error){ caught = error; }
    pass(caught?.code === code, `Expected ${code}, received ${caught?.code || 'no error'}`);
  };

  pass(core.COMPOSER_VERSION === '4.5s.3j', 'Unexpected Composer version');
  pass(core.RECIPE_SCHEMA_VERSION === '1.4.0', 'Unexpected recipe schema');
  pass(custom.POLICY === core.CUSTOM_ASSET_POLICY, 'Custom policy is not shared with the Composer core');
  pass(custom.POLICY.allowedSourceTypes.join(',') === 'image/webp,image/png,image/jpeg', 'Supported MIME policy changed');
  pass(!custom.POLICY.allowedSourceTypes.some(type => /svg|gif|avif/.test(type)), 'Rejected MIME policy changed');
  pass(custom.POLICY.maxSourceBytes === 12582912, 'Source-byte limit changed');
  pass(custom.POLICY.maxNormalizedBytes === 6291456, 'Normalized-byte limit changed');
  pass(custom.POLICY.maxTotalBytes === 25165824, 'Total custom budget changed');
  pass(custom.POLICY.maxDimension === 8192 && custom.POLICY.maxPixels === 40000000, 'Decoded image limits changed');

  const png = Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const jpeg = Uint8Array.from([0xff,0xd8,0xff,0xdb]);
  const webp = Uint8Array.from(Buffer.from('RIFF0000WEBP'));
  pass(custom.sniffMime(png) === 'image/png', 'PNG signature was not detected');
  pass(custom.sniffMime(jpeg) === 'image/jpeg', 'JPEG signature was not detected');
  pass(custom.sniffMime(webp) === 'image/webp', 'WebP signature was not detected');
  throwsCode(() => custom.validateSourceBytes(Uint8Array.from(Buffer.from('<html>')), 'image/webp'), 'unsupported-signature');
  throwsCode(() => custom.validateSourceBytes(png, 'image/svg+xml'), 'unsupported-type');
  throwsCode(() => custom.validateSourceBytes(new Uint8Array(), 'image/png'), 'empty-file');
  throwsCode(() => custom.validateSourceBytes(png, 'image/jpeg'), 'type-mismatch');
  throwsCode(() => custom.validateSourceBytes(new Uint8Array(custom.POLICY.maxSourceBytes + 1), 'image/png'), 'source-too-large');
  throwsCode(() => custom.validateDimensions(9000, 100), 'dimension-limit');
  throwsCode(() => custom.validateDimensions(8000, 6000), 'pixel-limit');
  pass(custom.slotFitWarnings(420, 900, themes.slots.startBackground).length >= 2, 'Scene quality warnings were not produced');
  pass(custom.slotFitWarnings(1200, 1200, themes.slots.artifact1).length === 0, 'Suitable square art received a warning');

  const landscape = recordFromOfficial('market-start', ['startBackground','gameplayBackground','hallway1','modeStandard']);
  const portrait = recordFromOfficial('market-boss-1', ['guideImage','boss1','boss2']);
  const square = recordFromOfficial('market-artifact-1', ['artifact1','artifact2']);
  pass((await custom.verifyRecordBytes(landscape)).ok, 'Valid custom record failed byte integrity');
  const corrupt = {...landscape, sha256:'0'.repeat(64)};
  const corruptResult = await custom.verifyRecordBytes(corrupt);
  pass(!corruptResult.ok && corruptResult.code === 'record-hash-mismatch', 'Hash mismatch was not rejected');

  const customAssets = Object.fromEntries([landscape, portrait, square].map(asset => [asset.id, asset]));
  const appearance = {
    presetId:'market-citadel',
    overrides:{boss2:'arcane-boss-2'},
    customOverrides:{startBackground:landscape.id,gameplayBackground:landscape.id,boss1:portrait.id,artifact1:square.id,modeStandard:landscape.id}
  };
  const resolved = core.resolveThemeSelection(appearance, themes, customAssets);
  pass(resolved.slots.boss1.source === 'custom' && resolved.slots.boss1.asset.id === portrait.id, 'Custom precedence failed');
  pass(resolved.slots.boss2.source === 'override' && resolved.slots.boss2.asset.id === 'arcane-boss-2', 'Official override precedence failed');
  pass(resolved.slots.boss3.source === 'preset', 'Preset fallback precedence failed');
  const switched = core.resolveThemeSelection({...appearance,presetId:'arcane-archive'}, themes, customAssets);
  pass(switched.slots.boss1.asset.id === portrait.id && switched.slots.boss3.asset.id === 'arcane-boss-3', 'Preset switching disturbed custom overrides');
  const reset = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{},customOverrides:{}}, themes, customAssets);
  pass(reset.slots.boss1.asset.id === 'arcane-boss-1', 'Reset to theme failed');
  const missing = core.resolveThemeSelection({presetId:'market-citadel',overrides:{},customOverrides:{boss1:'faculty-0000000000000000'}}, themes, customAssets);
  pass(missing.slots.boss1.source === 'preset' && missing.slots.boss1.asset.id === 'market-boss-1', 'Missing custom reference did not fall back safely');
  pass(core.customAssetsForSelection(resolved, core.MODE_ORDER).length === 3, 'Custom binary deduplication failed');

  const library = loadComposerLibrary();
  const oldRecipe = {schemaVersion:'1.3.0',title:'Phase 3A Recipe',slug:'phase-3a-recipe',supportedModes:['standard'],selectedConceptIds:['perfect-competition'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null},appearance:{presetId:'arcane-archive',overrides:{boss1:'market-boss-1'}}};
  const migratedOld = core.migrateRecipe(oldRecipe, library, themes).recipe;
  pass(migratedOld.schemaVersion === '1.4.0' && Object.keys(migratedOld.customAssets).length === 0, 'Phase 3A recipe migration failed');
  pass(migratedOld.appearance.overrides.boss1 === 'market-boss-1', 'Phase 3A official override was lost');

  const baseRecipe = {schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Phase 3B Custom Validation',slug:'phase-3b-custom-validation',supportedModes:[...core.MODE_ORDER],selectedConceptIds:['perfect-competition'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const canonical = core.canonicalRecipe({...baseRecipe,appearance,customAssets}, library, themes);
  const roundTrip = core.migrateRecipe(JSON.parse(core.stableStringify(canonical)), library, themes).recipe;
  pass(core.stableStringify(roundTrip.appearance) === core.stableStringify(canonical.appearance), 'Custom appearance round trip changed');
  pass(Object.keys(roundTrip.customAssets).length === 3, 'Custom recipe round trip lost assets');
  pass(Object.values(roundTrip.customAssets).every(asset => asset.sha256 === customAssets[asset.id].sha256), 'Custom recipe hashes changed');
  const pruned = core.pruneCustomAssets(customAssets, {...appearance,customOverrides:{boss1:portrait.id}}, themes);
  pass(Object.keys(pruned).length === 1 && pruned[portrait.id], 'Orphan cleanup failed');

  const template = loadCanonicalTemplate();
  const composition = core.compose(library, baseRecipe);
  pass(composition.errors.length === 0, 'Representative composition failed');
  embedQuestionAssets(composition);
  attachConceptReviewRuntime(core, composition, library, baseRecipe.selectedConceptIds);
  const officialOnly = await build({library,template,composition,baseRecipe,appearance:{presetId:'arcane-archive',overrides:{},customOverrides:{}},customAssets:{}});
  const light = await build({library,template,composition,baseRecipe,appearance:{presetId:'arcane-archive',overrides:{},customOverrides:{boss1:portrait.id}},customAssets:{[portrait.id]:portrait}});
  const moderate = await build({library,template,composition,baseRecipe,appearance,customAssets});
  const heavyAppearance = {...appearance,customOverrides:{...appearance.customOverrides,hallway1:landscape.id,hallway2:landscape.id,guideImage:portrait.id,boss2:portrait.id,artifact2:square.id}};
  const heavy = await build({library,template,composition,baseRecipe,appearance:heavyAppearance,customAssets});
  const fixtureRoot = process.env.MQ_PHASE3B_FIXTURE_DIR ? path.resolve(process.env.MQ_PHASE3B_FIXTURE_DIR) : '';
  if(fixtureRoot){
    fs.mkdirSync(fixtureRoot, {recursive:true});
    fs.writeFileSync(path.join(fixtureRoot, 'official-only.html'), officialOnly.html);
    fs.writeFileSync(path.join(fixtureRoot, 'custom-moderate.html'), moderate.html);
    fs.writeFileSync(path.join(fixtureRoot, 'custom-heavy.html'), heavy.html);
    fs.writeFileSync(path.join(fixtureRoot, 'custom-recipe.json'), core.stableStringify(canonical, 2) + '\n');
    const corruptRecipe = JSON.parse(core.stableStringify(canonical));
    corruptRecipe.customAssets[landscape.id].sha256 = '0'.repeat(64);
    fs.writeFileSync(path.join(fixtureRoot, 'corrupt-recipe.json'), core.stableStringify(corruptRecipe, 2) + '\n');
    fs.writeFileSync(path.join(fixtureRoot, 'phase3a-recipe.json'), core.stableStringify(oldRecipe, 2) + '\n');
  }
  pass(officialOnly.selectedCustom.length === 0, 'Official-only build gained custom assets');
  pass(light.selectedCustom.length === 1 && moderate.selectedCustom.length === 3 && heavy.selectedCustom.length === 3, 'Selected custom asset counts changed');
  pass(moderate.html.includes('data:image/webp;base64,') && moderate.html.includes(landscape.id), 'Generated output omitted custom image data');
  pass(!/[A-Z]:\\Users\\|file:\/\/|blob:|localhost/i.test(moderate.html), 'Generated output contains a nonportable custom path');
  pass((moderate.html.match(new RegExp(landscape.dataUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length === 1, 'Repeated custom asset binary was embedded more than once');
  pass(!light.html.includes(landscape.id) && !light.html.includes(square.id), 'Orphaned custom asset was embedded');
  pass(moderate.config.visualTheme.slots.boss1.alt === 'Boss 1', 'Semantic custom boss accessibility label is missing');
  assertInlineScriptsCompile(moderate.html, 'phase3b-custom.html');
  checks++;
  for(const presetId of Object.keys(themes.presets)){
    const result = core.resolveThemeSelection({presetId,overrides:{},customOverrides:{}}, themes, {});
    pass(Object.keys(result.slots).length === 22, `${presetId} official-theme regression`);
  }
  pass(template.includes('bonus += 8') && template.includes('bonus += 5') && template.includes('bonus += 4') && template.includes('bonus += 1.5'), 'Targeted-repair weighting changed');
  pass(library.librarySha256 && /^[a-f0-9]{64}$/.test(library.librarySha256), 'Composer question-library integrity metadata is invalid');

  console.log(JSON.stringify({
    ok:true,
    checks,
    composerVersion:core.COMPOSER_VERSION,
    recipeSchemaVersion:core.RECIPE_SCHEMA_VERSION,
    policy:custom.POLICY,
    normalizedCustomBytes:Object.values(customAssets).reduce((sum, asset) => sum + asset.sizeBytes, 0),
    generatedBytes:{officialOnly:officialOnly.bytes,light:light.bytes,moderate:moderate.bytes,heavy:heavy.bytes}
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
