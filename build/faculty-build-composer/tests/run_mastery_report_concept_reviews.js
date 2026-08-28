'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Core = require('../composer-core.js');
const Runtime = require('../concept-review-runtime.js');
const {
  assertCanonicalCoreVersion,
  assertGeneratedComposerVersion,
  testArtifactPath
} = require('./composer-test-helpers.js');

const root = path.resolve(__dirname, '..');
const resultsPath = testArtifactPath('tests/mastery_report_concept_review_results.json');

function assert(condition, message){ if(!condition) throw new Error(message); }
function hash(value){ return crypto.createHash('sha256').update(value).digest('hex'); }
function loadLibrary(){
  const source = fs.readFileSync(path.join(root, 'data', 'composer_library.js'), 'utf8').trim();
  return JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length, -1));
}
function recipe(selectedConceptIds, supportedModes = ['quiz']){
  return {schemaVersion:Core.RECIPE_SCHEMA_VERSION,title:'Step 2 QA',slug:'step-2-qa',supportedModes,selectedConceptIds,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
}
function makeRuntime(library, sourceManifest, selectedConceptIds){
  const resolution = Core.resolveConceptReviews(library, sourceManifest, selectedConceptIds);
  assert(!resolution.errors.length, resolution.errors.join('\n'));
  const validation = Runtime.validateManifest(resolution.runtimeIndex);
  assert(validation.ok, validation.errors.join('\n'));
  return {manifest:resolution.runtimeIndex, resolution};
}
function weakAttempt(values = {}){
  return {correct:false,attempts:1,incorrect:1,responseTime:12000,subtopicIds:[],secondarySkills:[],...values};
}

async function run(){
  assertCanonicalCoreVersion(Core);
  const library = loadLibrary();
  const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'concept-reviews', 'manifest.json'), 'utf8'));
  const template = fs.readFileSync(path.join(root, 'template', 'mastery-quests-faculty-template-composer-ready.html'), 'utf8');
  const runtimeSource = fs.readFileSync(path.join(root, 'concept-review-runtime.js'), 'utf8');
  const cases = [];
  const test = async (id, name, fn) => {
    await fn();
    cases.push({id,name,status:'PASS'});
  };

  await test('A','single direct review', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['scarcity-and-tradeoffs']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'scarcity-and-tradeoffs',hasMeaningfulWeakness:true});
    assert(result.kind === 'DIRECT' && result.recommendations.length === 1, 'Direct concept did not resolve to exactly one review.');
  });

  await test('B','multi-review routes to one exact skill', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['demand']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'demand',hasMeaningfulWeakness:true,attemptEvidence:[weakAttempt({repairSkill:'law_of_demand'})]});
    assert(result.recommendations.length === 1 && result.recommendations[0].code === 'GEN-ECON-12', 'Demand law evidence routed incorrectly.');
  });

  await test('C','mixed multi-review evidence is capped at two', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['demand']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'demand',hasMeaningfulWeakness:true,attemptEvidence:[weakAttempt({repairSkill:'law_of_demand'}),weakAttempt({repairSkill:'demand_shifters_income'})]});
    assert(result.recommendations.length === 2, 'Mixed demand evidence did not produce two reviews.');
  });

  const family = makeRuntime(library, sourceManifest, ['costs-of-production']);
  const familyChildren = family.manifest.concepts['costs-of-production'].coveredByConceptIds;
  const routedChild = familyChildren.find(id => family.manifest.reviews[id]);
  assert(routedChild, 'Family fixture lacks a reviewable child.');

  await test('D','family direct child evidence', async () => {
    const result = Runtime.resolveMasteryConceptReviews({manifest:family.manifest,canonicalConceptId:'costs-of-production',hasMeaningfulWeakness:true,attemptEvidence:[weakAttempt({canonicalConceptId:routedChild})]});
    assert(result.kind === 'FAMILY_ROUTED' && result.recommendations.length >= 1, 'Direct family child evidence did not route.');
  });

  for(const [id,name,routeName,field] of [
    ['E','family repair-skill evidence','repairSkillToConceptIds','repairSkill'],
    ['F','family primary-skill evidence','primarySkillToConceptIds','primarySkill'],
    ['G','family objective evidence','objectiveToConceptIds','objective']
  ]){
    await test(id,name, async () => {
      const routes = family.manifest.evidenceRoutes[routeName];
      const key = Object.keys(routes)[0];
      assert(key, `No ${routeName} fixture exists.`);
      const result = Runtime.resolveMasteryConceptReviews({manifest:family.manifest,canonicalConceptId:'costs-of-production',hasMeaningfulWeakness:true,attemptEvidence:[weakAttempt({[field]:key})]});
      assert(result.kind === 'FAMILY_ROUTED' && result.recommendations.length >= 1 && result.recommendations.length <= 3, `${name} failed.`);
    });
  }

  await test('H','family ambiguity uses ordered chooser', async () => {
    const result = Runtime.resolveMasteryConceptReviews({manifest:family.manifest,canonicalConceptId:'costs-of-production',hasMeaningfulWeakness:true,attemptEvidence:[]});
    assert(result.kind === 'FAMILY_CHOOSER' && result.choices.length === familyChildren.length, 'Ambiguous family did not expose its explicit ordered children.');
  });

  await test('I','integration meta concept has no generic review', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['integrated-economic-analysis']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'integrated-economic-analysis',hasMeaningfulWeakness:true,attemptEvidence:[]});
    assert(result.kind === 'NONE', 'Integration meta concept received a generic review.');
  });

  await test('J','hidden supplemental never renders', async () => {
    const hidden = sourceManifest.concepts.find(item => item.disposition === 'HIDDEN_SUPPLEMENTAL').canonicalConceptId;
    const {manifest} = makeRuntime(library, sourceManifest, ['scarcity-and-tradeoffs']);
    manifest.concepts[hidden] = {title:'Hidden',disposition:'HIDDEN_SUPPLEMENTAL'};
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:hidden,hasMeaningfulWeakness:true});
    assert(result.kind === 'NONE', 'Hidden supplemental concept rendered.');
  });

  await test('K','clean run suppresses Concept Review', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['scarcity-and-tradeoffs']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'scarcity-and-tradeoffs',hasMeaningfulWeakness:false});
    assert(result.kind === 'NONE', 'Clean run returned a review.');
  });

  await test('L','missing runtime manifest degrades gracefully', async () => {
    Runtime.resetManifestCache();
    const manifest = await Runtime.loadConceptReviewManifest({fetchImpl:async () => ({ok:false,status:404}),consoleImpl:{warn(){}}});
    assert(manifest === null, 'Missing manifest did not return null.');
  });

  await test('M','malformed runtime manifest degrades gracefully', async () => {
    Runtime.resetManifestCache();
    const manifest = await Runtime.loadConceptReviewManifest({fetchImpl:async () => ({ok:true,json:async () => ({concepts:[]})}),consoleImpl:{warn(){}}});
    assert(manifest === null, 'Malformed manifest did not return null.');
  });

  await test('N','unsafe paths are rejected', async () => {
    assert(Runtime.safeReviewPath('../secret.pdf') === null, 'Traversal path was accepted.');
    assert(Runtime.safeReviewPath('https://example.com/MICRO-01.pdf') === null, 'Remote path was accepted.');
    assert(Runtime.safeReviewPath('concept-reviews/MICRO-01.pdf') !== null, 'Safe review path was rejected.');
  });

  await test('O','canonical GEN-ECON-01 fixture exists and remains visible', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['scarcity-and-tradeoffs']);
    const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:'scarcity-and-tradeoffs',hasMeaningfulWeakness:true});
    const filtered = await Runtime.filterAvailableReviewResult(result);
    assert(filtered.recommendations.length === 1 && filtered.recommendations[0].code === 'GEN-ECON-01', 'GEN-ECON-01 was not retained as a safe mapped recommendation.');
    const sourceReview = sourceManifest.reviews.find(review => review.code === 'GEN-ECON-01');
    assert(sourceReview, 'Source manifest is missing GEN-ECON-01.');
    const pdfPath = path.join(root, 'data', 'concept-reviews', sourceReview.pdfPath);
    assert(fs.existsSync(pdfPath), 'Canonical GEN-ECON-01 PDF fixture is missing.');
    const bytes = fs.readFileSync(pdfPath);
    assert(bytes.length === sourceReview.sizeBytes, 'GEN-ECON-01 fixture size differs from the source manifest.');
    assert(hash(bytes) === sourceReview.sha256, 'GEN-ECON-01 fixture hash differs from the source manifest.');
  });

  await test('P','one generated build supports all ten modes without engine mutation', async () => {
    const input = recipe(['scarcity-and-tradeoffs','demand','costs-of-production'], [...Core.MODE_ORDER]);
    const composition = Core.compose(library, input);
    assert(!composition.errors.length, composition.errors.join('\n'));
    const before = hash(Core.stableStringify({banks:composition.banks,challenge:composition.challengeQuestionBanks,repair:composition.repairQuestions,bridge:composition.bridgeQuestions}));
    const resolution = Core.resolveConceptReviews(library, sourceManifest, input.selectedConceptIds);
    const after = hash(Core.stableStringify({banks:composition.banks,challenge:composition.challengeQuestionBanks,repair:composition.repairQuestions,bridge:composition.bridgeQuestions}));
    assert(before === after, 'Concept Review resolution mutated selection, Repair, or Bridge data.');
    composition.conceptReviewRuntimeSource = runtimeSource;
    composition.conceptReviewRuntimeIndex = resolution.runtimeIndex;
    const config = await Core.createConfig(input, library, hash(template));
    const html = Core.buildHtml(template, composition, config, {composerVersion:Core.COMPOSER_VERSION,conceptReviewManifestPath:'concept-reviews/manifest.json'});
    assertGeneratedComposerVersion(html);
    assert(config.supportedModes.length === 10, 'Generated config does not contain all ten modes.');
    assert(html.includes('function loadConceptReviewManifest') && html.includes('async function showMasteryReportScreen'), 'Generated HTML lacks the runtime loader or async report integration.');
    assert(html.includes('latestConceptReviewTitles') && html.includes('Concept Review:'), 'Copy-report title-only integration is absent.');
    assert(html.includes('${escapeHTML(item.code)} · Open PDF'), 'Generated template does not visibly identify the Concept Review code.');
    assert(!html.includes('data/concept-reviews/manifest.json'), 'Generated game reaches back into Composer source data.');
  });

  await test('Q','new Micro concepts resolve to exact dedicated reviews', async () => {
    const expected = {
      externalities:'MICRO-54',
      'public-goods-and-common-resources':'MICRO-55',
      'market-power':'MICRO-56',
      'factor-markets':'MICRO-57',
      'consumer-choice':'MICRO-58',
      'income-inequality-poverty-and-redistribution':'MICRO-59',
      'information-asymmetry-behavioral-and-political-economy':'MICRO-60'
    };
    for(const [conceptId, code] of Object.entries(expected)){
      const {manifest} = makeRuntime(library, sourceManifest, [conceptId]);
      const result = Runtime.resolveMasteryConceptReviews({manifest,canonicalConceptId:conceptId,hasMeaningfulWeakness:true});
      assert(result.kind === 'DIRECT' && result.recommendations.length === 1, `${conceptId} did not resolve directly.`);
      assert(result.recommendations[0].code === code, `${conceptId} resolved to ${result.recommendations[0]?.code || 'nothing'} instead of ${code}.`);
      assert(!['GEN-ECON-04','MICRO-03'].includes(result.recommendations[0].code), `${conceptId} retained a stale review route.`);
    }
  });

  await test('R','exact diagnostic aliases stay inside their canonical Micro concept', async () => {
    const fixtures = [
      ['externalities','externalities','EXT.1','externality_identification'],
      ['public-goods-and-common-resources','public-goods-and-common-resources','PGCR.1','goods_classification'],
      ['market-power','market-power','GE.7.7','market_power'],
      ['factor-markets','marginal-product-and-value-of-marginal-product','FM.1','calculate_marginal_product_labor'],
      ['consumer-choice','budget-constraints-and-feasible-sets','CC.1','budget_equation'],
      ['income-inequality-poverty-and-redistribution','lorenz-curves','IP.1','read_lorenz_curve'],
      ['information-asymmetry-behavioral-and-political-economy','adverse-selection','IBP.1','analyze_adverse_selection']
    ];
    for(const [conceptId, tag, objective, skill] of fixtures){
      const {manifest} = makeRuntime(library, sourceManifest, [conceptId]);
      for(const [routeName, key] of [
        ['tagToConceptIds',tag],
        ['objectiveToConceptIds',objective],
        ['primarySkillToConceptIds',skill],
        ['repairSkillToConceptIds',skill]
      ]){
        assert((manifest.evidenceRoutes[routeName]?.[key] || []).includes(conceptId), `${routeName} ${key} does not route to ${conceptId}.`);
      }
    }
  });

  await test('S','legacy Public Goods tag repairs a missing canonical signal without broad fallback', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['public-goods-and-common-resources']);
    const result = Runtime.resolveMasteryConceptReviews({
      manifest,
      canonicalConceptId:'',
      hasMeaningfulWeakness:true,
      attemptEvidence:[weakAttempt({tag:'public-goods-and-common-resources',objective:'PGCR.1'})]
    });
    assert(result.kind === 'DIRECT', 'Exact Public Goods tag did not recover the canonical concept.');
    assert(result.recommendations[0]?.code === 'MICRO-55', 'Exact Public Goods tag did not resolve MICRO-55.');
    assert(!result.recommendations.some(item => ['GEN-ECON-04','MICRO-03'].includes(item.code)), 'Legacy Public Goods tag used a stale fallback.');
  });

  await test('T','ambiguous objective alone does not trigger a broad Concept Review fallback', async () => {
    const {manifest} = makeRuntime(library, sourceManifest, ['externalities','public-goods-and-common-resources','market-power']);
    const result = Runtime.resolveMasteryConceptReviews({
      manifest,
      canonicalConceptId:'',
      hasMeaningfulWeakness:true,
      objectiveEvidence:[{id:'LO1.6',attempts:2,incorrect:2}]
    });
    assert(result.kind === 'NONE', 'Ambiguous shared objective produced a broad fallback review.');
  });

  await test('U','legacy Market Failures recipe migration retains compatibility and dedicated children', async () => {
    const migrated = Core.migrateRecipe({schemaVersion:'1.0.0',title:'Legacy',slug:'legacy-market-failures',supportedModes:['standard'],concepts:['market-failures']}, library, {}).recipe;
    for(const id of ['externalities','public-goods-and-common-resources','market-power','market-failures']){
      assert(migrated.selectedConceptIds.includes(id), `Legacy migration omitted ${id}.`);
    }
    const resolution = Core.resolveConceptReviews(library, sourceManifest, migrated.selectedConceptIds);
    assert(!resolution.errors.length, resolution.errors.join('\n'));
    for(const code of ['MICRO-54','MICRO-55','MICRO-56']) assert(resolution.reviewCodes.includes(code), `Legacy migration omitted ${code}.`);
    assert(!resolution.reviewCodes.includes('MICRO-03'), 'Legacy migration exposed MICRO-03 as an active child review.');
    const composition = Core.compose(library, migrated);
    assert(!composition.errors.length && composition.counts.totalCanonical > 0, 'Legacy Market Failures recipe no longer composes.');
  });

  const output = {schemaVersion:'1.0.0',status:'PASS',caseCount:cases.length,cases};
  fs.writeFileSync(resultsPath, JSON.stringify(output,null,2) + '\n');
  console.log(JSON.stringify(output,null,2));
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
