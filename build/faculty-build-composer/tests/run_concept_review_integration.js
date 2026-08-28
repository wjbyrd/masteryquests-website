'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const Core = require('../composer-core.js');
const {
  assertCanonicalCoreVersion,
  assertGeneratedComposerVersion,
  testArtifactPath
} = require('./composer-test-helpers.js');

const composerRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(composerRoot, 'data', 'concept-reviews', 'manifest.json');
const outputPath = testArtifactPath('tests/concept_review_integration_results.json');
const runtimeSamplePath = testArtifactPath('tests/concept_review_runtime_manifest_sample.json');

function loadLibrary(){
  const source = fs.readFileSync(path.join(composerRoot, 'data', 'composer_library.js'), 'utf8').trim();
  const prefix = 'window.MQ_COMPOSER_LIBRARY=';
  if(!source.startsWith(prefix) || !source.endsWith(';')) throw new Error('Unexpected Composer library wrapper.');
  return JSON.parse(source.slice(prefix.length, -1));
}

function hashBuffer(buffer){
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function assert(condition, message){
  if(!condition) throw new Error(message);
}

function emptyFocus(){
  return {checkpointOne:null, checkpointTwo:null, finalCheckpoint:null};
}

function allCompositionQuestions(composition){
  return Core.uniqueById([
    ...Object.values(composition.banks).flat(),
    ...Object.values(composition.challengeQuestionBanks || {}).flat(),
    ...composition.repairQuestions,
    ...Object.values(composition.skillRepairSeedPools).flat(),
    ...composition.bridgeQuestions
  ]);
}

function validateConceptReviewRuntimePackage(caseDirectory, resolution){
  const reviewDirectory = path.join(caseDirectory, 'concept-reviews');
  fs.mkdirSync(reviewDirectory, {recursive:true});
  let referencedPdfBytes = 0;

  for(const asset of resolution.assets){
    const sourcePath = path.join(composerRoot, ...asset.sourcePath.split('/'));
    assert(fs.existsSync(sourcePath), `Missing required source PDF ${asset.code}.`);
    const sourceBytes = fs.readFileSync(sourcePath);
    assert(sourceBytes.length === asset.sizeBytes, `Source size differs for ${asset.code}.`);
    assert(hashBuffer(sourceBytes) === asset.sha256, `Source hash differs for ${asset.code}.`);
    assert(
      asset.publicUrl === `https://masteryquests.org/concept-reviews/${asset.code}.pdf`,
      `Unexpected public Concept Review URL for ${asset.code}.`
    );
    referencedPdfBytes += sourceBytes.length;
  }

  const runtimeText = Core.stableStringify(resolution.runtimeIndex, 2) + '\n';
  const runtimePath = path.join(reviewDirectory, 'manifest.json');
  fs.writeFileSync(runtimePath, runtimeText, 'utf8');
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
  for(const asset of runtime.assetInventory){
    const sourceAsset = resolution.assets.find(candidate => candidate.code === asset.code);
    assert(sourceAsset, `Runtime manifest references unknown asset ${asset.code}.`);
    assert(asset.path === sourceAsset.publicUrl, `Runtime URL differs for ${asset.code}.`);
    assert(asset.sha256 === sourceAsset.sha256, `Runtime asset hash differs for ${asset.code}.`);
  }
  assert(runtime.assetInventory.length === resolution.assets.length, 'Runtime asset inventory count differs from resolved assets.');
  const runtimeManifestBytes = Buffer.byteLength(runtimeText, 'utf8');
  return {referencedPdfBytes, runtimeManifestBytes, generatedPackageBytes:runtimeManifestBytes};
}

async function run(){
  assertCanonicalCoreVersion(Core);
  const library = loadLibrary();
  const manifestText = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  const template = fs.readFileSync(
    path.join(composerRoot, 'template', 'mastery-quests-faculty-template-composer-ready.html'),
    'utf8'
  );
  const conceptReviewRuntimeSource = fs.readFileSync(path.join(composerRoot, 'concept-review-runtime.js'), 'utf8');
  const templateSha256 = hashBuffer(Buffer.from(template, 'utf8'));
  const validation = Core.validateConceptReviewManifest(library, manifest);
  assert(validation.ok, validation.errors.join('\n'));

  const dedicatedRouting = {
    externalities:['MICRO-54'],
    'public-goods-and-common-resources':['MICRO-55'],
    'market-power':['MICRO-56'],
    'factor-markets':['MICRO-57'],
    'consumer-choice':['MICRO-58'],
    'income-inequality-poverty-and-redistribution':['MICRO-59'],
    'information-asymmetry-behavioral-and-political-economy':['MICRO-60','MICRO-61','MICRO-62','MICRO-63','MICRO-64','MICRO-65','MICRO-66','MICRO-67','MICRO-68']
  };
  for(const [conceptId, expectedCodes] of Object.entries(dedicatedRouting)){
    const resolution = Core.resolveConceptReviews(library, manifest, [conceptId]);
    assert(resolution.errors.length === 0, `${conceptId} resolver failed: ${resolution.errors.join('; ')}`);
    assert(
      JSON.stringify(resolution.reviewCodes) === JSON.stringify(expectedCodes),
      `${conceptId} did not resolve exclusively to ${expectedCodes.join(', ')}: ${resolution.reviewCodes.join(', ')}`
    );
    assert(!resolution.reviewCodes.includes('GEN-ECON-04'), `${conceptId} resolved to unrelated Marginal Analysis review.`);
    if(['externalities','public-goods-and-common-resources','market-power'].includes(conceptId)){
      assert(!resolution.reviewCodes.includes('MICRO-03'), `${conceptId} retained the legacy Market Failures review.`);
    }
  }

  const sourceAssets = manifest.reviews.map(review => {
    const sourcePath = path.join(composerRoot, 'data', 'concept-reviews', review.pdfPath);
    assert(fs.existsSync(sourcePath), `Manifest PDF is missing: ${review.code}.`);
    const bytes = fs.readFileSync(sourcePath);
    assert(bytes.length === review.sizeBytes, `Manifest PDF size mismatch: ${review.code}.`);
    assert(hashBuffer(bytes) === review.sha256, `Manifest PDF hash mismatch: ${review.code}.`);
    return {code:review.code, sizeBytes:bytes.length, sha256:review.sha256};
  });
  assert(new Set(sourceAssets.map(asset => asset.code)).size === sourceAssets.length, 'Duplicate review code in source inventory.');
  const splitTitles = {
    'MICRO-60':'Adverse Selection',
    'MICRO-61':'Moral Hazard',
    'MICRO-62':'Signaling & Screening',
    'MICRO-63':'Present Bias',
    'MICRO-64':'Loss Aversion',
    'MICRO-65':'Framing Effects',
    'MICRO-66':'Condorcet Paradox & Voting Cycles',
    'MICRO-67':"Arrow's Impossibility Theorem",
    'MICRO-68':'Median Voter Theorem'
  };
  const reviewSource = JSON.parse(fs.readFileSync(path.join(composerRoot, 'data', 'concept-reviews', 'concept_review_source.json'), 'utf8'));
  const splitSource = reviewSource.reviews.filter(review => splitTitles[review.code]);
  assert(splitSource.length === 9, `Expected nine MICRO-60 through MICRO-68 source records, found ${splitSource.length}.`);
  assert(!reviewSource.reviews.some(review => review.title === 'Information, Behavior & Public Choice'), 'Retired broad MICRO-60 title remains active.');
  for(const review of splitSource){
    assert(review.title === splitTitles[review.code], `${review.code} title does not match its focused concept.`);
    assert(JSON.stringify(review.canonicalConceptIds) === JSON.stringify(['information-asymmetry-behavioral-and-political-economy']), `${review.code} canonical mapping is incorrect.`);
    for(const section of ['outcome','core','recognition','watch','worked','check']) assert(review.content?.[section], `${review.code} is missing ${section}.`);
    assert(typeof review.content.worked === 'string' && review.content.worked.trim().length > 100, `${review.code} lacks one substantive worked example.`);
    assert(typeof review.content.check === 'string' && review.content.check.trim().length > 20, `${review.code} lacks one Check Yourself item.`);
    const manifestRecord = manifest.reviews.find(item => item.code === review.code);
    assert(manifestRecord?.title === splitTitles[review.code], `${review.code} manifest title is incorrect.`);
    assert(manifestRecord?.pdfPath === `${review.code}.pdf`, `${review.code} filename is not canonical.`);
  }
  const unreachableCodes = new Set(validation.warnings.filter(item => item.type === 'unreachable-review').map(item => item.reviewCode));
  const reachableSourceReviewCount = sourceAssets.filter(asset => !unreachableCodes.has(asset.code)).length;

  const macroStabilizationStarter = [
    'liquidity-preference-and-money-market',
    'monetary-policy-transmission',
    'fiscal-policy-and-aggregate-demand',
    'fiscal-multipliers-and-crowding-out',
    'stabilization-policy',
    'aggregate-demand',
    'aggregate-supply',
    'macroeconomic-equilibrium-and-shocks',
    'long-run-macroeconomic-adjustment',
    'short-run-phillips-curve',
    'long-run-phillips-curve',
    'phillips-curve-expectations',
    'disinflation-and-policy',
    'sacrifice-ratio'
  ];
  const largeBuildIds = library.registry.concepts
    .filter(concept => !concept.parentConceptId && !concept.supplementType)
    .map(concept => concept.canonicalConceptId)
    .sort();

  const cases = [
    {
      id:'A',
      name:'one-general-concept',
      selectedConceptIds:['scarcity-and-tradeoffs'],
      supportedModes:['quiz'],
      expectedCodes:['GEN-ECON-01']
    },
    {
      id:'B',
      name:'general-graph-concept',
      selectedConceptIds:['production-possibilities-frontier'],
      supportedModes:['quiz'],
      expectedCodes:['GEN-ECON-08']
    },
    {
      id:'C',
      name:'micro-granular-subtopic',
      selectedConceptIds:['price-elasticity-of-demand'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-04']
    },
    {
      id:'G',
      name:'externalities-dedicated-review',
      selectedConceptIds:['externalities'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-54']
    },
    {
      id:'H',
      name:'public-goods-dedicated-review',
      selectedConceptIds:['public-goods-and-common-resources'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-55']
    },
    {
      id:'I',
      name:'factor-markets-dedicated-review',
      selectedConceptIds:['factor-markets'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-57']
    },
    {
      id:'J',
      name:'consumer-choice-dedicated-review',
      selectedConceptIds:['consumer-choice'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-58']
    },
    {
      id:'K',
      name:'income-inequality-dedicated-review',
      selectedConceptIds:['income-inequality-poverty-and-redistribution'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-59']
    },
    {
      id:'L',
      name:'information-behavior-public-choice-dedicated-review',
      selectedConceptIds:['information-asymmetry-behavioral-and-political-economy'],
      supportedModes:['quiz'],
      expectedCodes:['MICRO-60','MICRO-61','MICRO-62','MICRO-63','MICRO-64','MICRO-65','MICRO-66','MICRO-67','MICRO-68']
    },
    {
      id:'D',
      name:'micro-costs-family-parent',
      selectedConceptIds:['costs-of-production'],
      supportedModes:['standard'],
      expectedCodes:['MICRO-18','MICRO-19','MICRO-20','MICRO-21','MICRO-22','MICRO-23','MICRO-24','MICRO-25','MICRO-26','MICRO-27']
    },
    {
      id:'E',
      name:'macro-stabilization-starter',
      selectedConceptIds:macroStabilizationStarter,
      supportedModes:[...Core.MODE_ORDER]
    },
    {
      id:'F',
      name:'large-all-top-level-concepts',
      selectedConceptIds:largeBuildIds,
      supportedModes:[...Core.MODE_ORDER],
      expectedReviewCount:reachableSourceReviewCount
    }
  ];

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-concept-review-step1-'));
  const results = [];
  try{
    for(const testCase of cases){
      const recipe = {
        schemaVersion:Core.RECIPE_SCHEMA_VERSION,
        title:`Concept Review Test ${testCase.id}`,
        slug:`concept-review-test-${testCase.id.toLowerCase()}`,
        supportedModes:testCase.supportedModes,
        selectedConceptIds:testCase.selectedConceptIds,
        checkpointFocus:emptyFocus()
      };
      const composition = Core.compose(library, recipe);
      assert(composition.errors.length === 0, `${testCase.id} composition failed: ${composition.errors.join('; ')}`);
      const compositionFingerprintBeforeResolve = hashBuffer(Buffer.from(Core.stableStringify({
        banks:composition.banks,
        challengeQuestionBanks:composition.challengeQuestionBanks,
        repairQuestions:composition.repairQuestions,
        bridgeQuestions:composition.bridgeQuestions,
        counts:composition.counts
      })));
      const answerVerification = await Core.verifyAnswers(composition);
      assert(answerVerification.ok, `${testCase.id} answer verification failed.`);
      const resolution = Core.resolveConceptReviews(library, manifest, testCase.selectedConceptIds);
      assert(resolution.errors.length === 0, `${testCase.id} resolver failed: ${resolution.errors.join('; ')}`);
      const compositionFingerprintAfterResolve = hashBuffer(Buffer.from(Core.stableStringify({
        banks:composition.banks,
        challengeQuestionBanks:composition.challengeQuestionBanks,
        repairQuestions:composition.repairQuestions,
        bridgeQuestions:composition.bridgeQuestions,
        counts:composition.counts
      })));
      assert(
        compositionFingerprintAfterResolve === compositionFingerprintBeforeResolve,
        `${testCase.id} resolver mutated question selection or composition.`
      );
      if(testCase.expectedCodes){
        assert(
          JSON.stringify(resolution.reviewCodes) === JSON.stringify(testCase.expectedCodes),
          `${testCase.id} packaged unexpected reviews: ${resolution.reviewCodes.join(', ')}.`
        );
      }
      if(testCase.expectedReviewCount !== undefined){
        assert(resolution.reviewCodes.length === testCase.expectedReviewCount, `${testCase.id} did not cover the full required library.`);
      }
      if(testCase.id !== 'F'){
        assert(resolution.reviewCodes.length < sourceAssets.length, `${testCase.id} incorrectly packaged the full library.`);
      }
      if(testCase.id === 'E'){
        assert(resolution.reviewCodes.every(code => code.startsWith('MACRO-')), 'Macro starter packaged a non-Macro review.');
      }

      const caseDirectory = path.join(tempRoot, testCase.id);
      fs.mkdirSync(caseDirectory, {recursive:true});
      const config = await Core.createConfig(recipe, library, templateSha256);
      composition.conceptReviewRuntimeSource = conceptReviewRuntimeSource;
      composition.conceptReviewRuntimeIndex = resolution.runtimeIndex;
      const html = Core.buildHtml(template, composition, config, {
        schemaVersion:Core.RECIPE_SCHEMA_VERSION,
        composerVersion:Core.COMPOSER_VERSION,
        selectedConceptIds:testCase.selectedConceptIds,
        conceptReviewManifestPath:'concept-reviews/manifest.json'
      });
      assertGeneratedComposerVersion(html);
      fs.writeFileSync(path.join(caseDirectory, `${config.slug}.html`), html, 'utf8');
      assert(html.includes('function loadConceptReviewManifest'), `${testCase.id} generated HTML lacks the Concept Review runtime.`);
      const size = validateConceptReviewRuntimePackage(caseDirectory, resolution);

      if(testCase.id === 'D'){
        fs.writeFileSync(runtimeSamplePath, Core.stableStringify(resolution.runtimeIndex, 2) + '\n', 'utf8');
      }
      results.push({
        case:testCase.id,
        name:testCase.name,
        status:'PASS',
        supportedModes:testCase.supportedModes,
        selectedConceptIds:testCase.selectedConceptIds,
        selectedConceptCount:testCase.selectedConceptIds.length,
        diagnosticConceptIds:resolution.diagnosticConceptIds,
        diagnosticClosureSize:resolution.diagnosticConceptIds.length,
        reviewPdfCount:resolution.reviewCodes.length,
        reviewCodes:resolution.reviewCodes,
        questionCount:composition.counts.totalCanonical,
        answerVerification,
        referencedPdfBytes:size.referencedPdfBytes,
        runtimeManifestBytes:size.runtimeManifestBytes,
        generatedPackageBytes:size.generatedPackageBytes
      });
    }
  } finally {
    fs.rmSync(tempRoot, {recursive:true, force:true});
  }

  const output = {
    schemaVersion:'1.0.0',
    generatedAt:manifest.generatedAt,
    status:'PASS',
    sourceLibrary:{
      pdfCount:sourceAssets.length,
      totalPdfBytes:sourceAssets.reduce((total, asset) => total + asset.sizeBytes, 0),
      countByDiscipline:Object.fromEntries(['general','micro','macro'].map(discipline => [
        discipline,
        manifest.reviews.filter(review => review.discipline === discipline).length
      ])),
      manifestSha256:hashBuffer(Buffer.from(manifestText, 'utf8'))
    },
    validation:{
      manifest:validation,
      dedicatedRouting,
      missingRequiredReviewPdfs:[],
      duplicateConflictingMappings:[],
      brokenRuntimePaths:[],
      sourceHashMismatches:[],
      runtimeUrlIssues:[],
      fullLibraryPackagedOnlyWhenRequired:true
    },
    testCases:results
  };
  fs.writeFileSync(outputPath, Core.stableStringify(output, 2) + '\n', 'utf8');
  console.log(JSON.stringify({status:output.status, sourceLibrary:output.sourceLibrary, testCases:results.map(item => ({
    case:item.case,
    selected:item.selectedConceptCount,
    closure:item.diagnosticClosureSize,
    reviews:item.reviewPdfCount,
    generatedPackageBytes:item.generatedPackageBytes,
    status:item.status
  }))}, null, 2));
}

run().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
