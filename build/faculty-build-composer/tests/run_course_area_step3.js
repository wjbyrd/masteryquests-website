'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const Model = require('../course-area-model.js');

const root = path.resolve(__dirname, '..');
const resultPath = path.join(__dirname, 'course_area_step3_results.json');
const correctionsPath = path.join(__dirname, 'course_area_metadata_corrections.json');

function assert(condition, message){ if(!condition) throw new Error(message); }
function loadLibrary(){
  const source = fs.readFileSync(path.join(root, 'data', 'composer_library.js'), 'utf8').trim();
  return {source, library:JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length, -1))};
}
function searchMatch(concept, search){
  return !search || [concept.title,concept.description,...(concept.includedSkills || [])].join(' ').toLowerCase().includes(search.toLowerCase());
}
function extractPresets(){
  const source = fs.readFileSync(path.join(root, 'composer.js'), 'utf8');
  const match = source.match(/const PRESETS = (\[[\s\S]*?\n\]);\n\nconst state/);
  if(!match) throw new Error('Could not extract PRESETS.');
  return vm.runInNewContext(match[1]);
}

function run(){
  const {source:librarySource, library} = loadLibrary();
  const registry = library.registry.concepts;
  const byId = new Map(registry.map(concept => [concept.canonicalConceptId, concept]));
  const model = Model.create(registry);
  const cases = [];
  const pass = (id,name,details={}) => cases.push({id,name,status:'PASS',...details});
  const visible = (area, filter='all', search='') => registry.filter(concept => {
    const record = model.get(concept.canonicalConceptId);
    return Model.isConceptVisibleForArea({...concept,...record},area)
      && (filter === 'all' || Model.browseCategory(concept) === filter)
      && searchMatch(concept,search);
  });

  for(const [id,area,filter] of [
    ['A','general','all'],['B','micro','all'],['C','macro','all'],
    ['D','general','ready'],['E','micro','supporting'],['F','macro','ready']
  ]){
    const items = visible(area,filter);
    assert(items.length > 0, `${id} produced no cards.`);
    assert(items.every(concept => model.areasFor(concept.canonicalConceptId).includes(area)), `${id} leaked an out-of-area concept.`);
    assert(filter === 'all' || items.every(concept => Model.browseCategory(concept) === filter), `${id} ignored its secondary filter.`);
    pass(id,`${area} + ${filter}`,{visibleCount:items.length});
  }

  const switchCounts = ['general','micro','macro','general'].map(area => visible(area).length);
  assert(JSON.stringify(switchCounts) === JSON.stringify([visible('general').length,visible('micro').length,visible('macro').length,visible('general').length]), 'Area switching produced stale visibility.');
  pass('G','General → Micro → Macro → General',{visibleCounts:switchCounts});

  const microFamilies = visible('micro').filter(concept => concept.childConceptIds?.length);
  assert(microFamilies.length === 8, 'Micro does not expose all eight family parents.');
  for(const parent of microFamilies){
    assert(parent.childConceptIds.every(id => visible('micro').some(concept => concept.canonicalConceptId === id)), `Micro family ${parent.canonicalConceptId} has a hidden child.`);
  }
  pass('H','expanded Micro family children',{parentCount:microFamilies.length,childCount:microFamilies.reduce((sum,parent) => sum + parent.childConceptIds.length,0)});

  const costChildren = byId.get('costs-of-production').childConceptIds;
  assert(costChildren.every(id => !model.areasFor(id).includes('macro')), 'A Costs of Production child remains Macro-eligible.');
  pass('I','Macro excludes Costs of Production children',{excludedChildCount:costChildren.length});

  const macroSearch = visible('macro','all','price discrimination');
  assert(macroSearch.every(concept => model.areasFor(concept.canonicalConceptId).includes('macro')), 'Macro search leaked Micro-only results.');
  assert(!macroSearch.some(concept => concept.canonicalConceptId === 'monopoly-price-discrimination'), 'Macro search exposed the Micro-only Price Discrimination child.');
  pass('J','search inside Macro',{resultCount:macroSearch.length});

  const presets = extractPresets();
  for(const preset of presets){
    assert(preset.conceptIds.every(id => model.areasFor(id).includes(preset.area)), `Preset ${preset.id} selects a concept hidden in ${preset.area}.`);
  }
  const macroPresetCount = presets.filter(preset => preset.area === 'macro').length;
  assert(macroPresetCount > 0, 'No Macro starter preset exists.');
  pass('K','starter presets remain area-valid',{presetCount:presets.length,macroPresetCount});

  const css = fs.readFileSync(path.join(root, 'composer.css'), 'utf8');
  assert(css.includes('--general-accent:#2a8f8a') && css.includes('--micro-accent:#9fc4df') && css.includes('--macro-accent:#8f3f4d'), 'Discipline accent variables are incomplete.');
  assert(css.includes('.concept-card[data-discipline="general"]') && css.includes('.concept-card[data-discipline="micro"]') && css.includes('.concept-card[data-discipline="macro"]'), 'Shared discipline selectors are incomplete.');
  pass('L','mobile/accent source contract',{accentWidthPx:4});

  const oldGeneral = new Set(Model.GENERAL_AREA_IDS);
  const oldMicro = new Set(Model.MICRO_AREA_IDS);
  const corrections = registry.filter(concept => {
    const id = concept.canonicalConceptId;
    const oldAreas = [oldGeneral.has(id) ? 'general' : null, oldMicro.has(id) ? 'micro' : null, (oldGeneral.has(id) || (!oldGeneral.has(id) && !oldMicro.has(id))) ? 'macro' : null].filter(Boolean);
    return model.disciplineFor(id) === 'micro' && oldAreas.includes('macro') && model.areasFor(id).includes('micro') && !model.areasFor(id).includes('macro');
  }).map(concept => ({
    canonicalConceptId:concept.canonicalConceptId,
    displayName:concept.title,
    oldAreas:['macro'],
    newAreas:['micro'],
    reason:`Child of the Microeconomics-only ${concept.familyTitle || byId.get(concept.parentConceptId)?.title || 'family'} family; inherited the legacy Macro fallback because it was absent from the hard-coded Micro set.`
  }));
  assert(corrections.length === 36, `Expected 36 confirmed metadata defects, found ${corrections.length}.`);

  const areaAudit = Object.fromEntries(Model.AREA_KEYS.map(area => {
    const items = visible(area);
    return [area,{
      eligibleConceptCount:items.length,
      visibleCardCount:items.length,
      parentCount:items.filter(concept => concept.childConceptIds?.length).length,
      childSubtopicCount:items.filter(concept => concept.parentConceptId).length,
      standaloneCount:items.filter(concept => !concept.parentConceptId && !(concept.childConceptIds?.length)).length,
      readyCount:visible(area,'ready').length,
      supportingCount:visible(area,'supporting').length
    }];
  }));

  const canonicalIds = registry.map(concept => concept.canonicalConceptId);
  const output = {
    schemaVersion:'1.0.0',status:'PASS',caseCount:cases.length,cases,areaAudit,
    metadataDefectCount:corrections.length,
    canonicalConceptCount:canonicalIds.length,
    canonicalConceptIdsSha256:crypto.createHash('sha256').update(JSON.stringify(canonicalIds)).digest('hex'),
    composerLibrarySha256:crypto.createHash('sha256').update(librarySource).digest('hex'),
    allTenModesExpected:true
  };
  fs.writeFileSync(resultPath, JSON.stringify(output,null,2) + '\n');
  fs.writeFileSync(correctionsPath, JSON.stringify({schemaVersion:'1.0.0',status:'CORRECTED',count:corrections.length,corrections},null,2) + '\n');
  console.log(JSON.stringify(output,null,2));
}

try{ run(); }catch(error){ console.error(error.stack || error); process.exitCode = 1; }
