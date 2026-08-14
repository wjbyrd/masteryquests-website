'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const Core = require('../composer-core.js');

const composerRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(composerRoot, 'data', 'concept-reviews', 'manifest.json');
const outputPath = path.join(__dirname, 'concept_review_integration_results.json');
const runtimeSamplePath = path.join(__dirname, 'concept_review_runtime_manifest_sample.json');

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

function validateAndCopyConceptReviewPackage(caseDirectory, resolution){
  const reviewDirectory = path.join(caseDirectory, 'concept-reviews');
  fs.mkdirSync(reviewDirectory, {recursive:true});
  const destinationPaths = new Set();
  let pdfBytes = 0;

  for(const asset of resolution.assets){
    const sourcePath = path.join(composerRoot, ...asset.sourcePath.split('/'));
    assert(fs.existsSync(sourcePath), `Missing required source PDF ${asset.code}.`);
    const sourceBytes = fs.readFileSync(sourcePath);
    assert(sourceBytes.length === asset.sizeBytes, `Source size differs for ${asset.code}.`);
    assert(hashBuffer(sourceBytes) === asset.sha256, `Source hash differs for ${asset.code}.`);
    assert(!destinationPaths.has(asset.destinationPath.toLowerCase()), `Duplicate destination ${asset.destinationPath}.`);
    destinationPaths.add(asset.destinationPath.toLowerCase());
    const destinationPath = path.join(caseDirectory, ...asset.destinationPath.split('/'));
    fs.writeFileSync(destinationPath, sourceBytes);
    const copiedBytes = fs.readFileSync(destinationPath);
    assert(hashBuffer(copiedBytes) === asset.sha256, `Copied hash differs for ${asset.code}.`);
    pdfBytes += copiedBytes.length;
  }

  const runtimeText = Core.stableStringify(resolution.runtimeIndex, 2) + '\n';
  const runtimePath = path.join(reviewDirectory, 'manifest.json');
  fs.writeFileSync(runtimePath, runtimeText, 'utf8');
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
  for(const asset of runtime.assetInventory){
    const packagedPath = path.join(caseDirectory, ...asset.path.split('/'));
    assert(fs.existsSync(packagedPath), `Runtime manifest points to missing asset ${asset.path}.`);
    assert(hashBuffer(fs.readFileSync(packagedPath)) === asset.sha256, `Runtime asset hash differs for ${asset.code}.`);
  }
  assert(runtime.assetInventory.length === resolution.assets.length, 'Runtime asset inventory count differs from copied assets.');
  const runtimeManifestBytes = Buffer.byteLength(runtimeText, 'utf8');
  return {pdfBytes, runtimeManifestBytes, totalAddedBytes:pdfBytes + runtimeManifestBytes};
}

async function run(){
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

  const sourceAssets = manifest.reviews.map(review => {
    const sourcePath = path.join(composerRoot, 'data', 'concept-reviews', review.pdfPath);
    assert(fs.existsSync(sourcePath), `Manifest PDF is missing: ${review.code}.`);
    const bytes = fs.readFileSync(sourcePath);
    assert(bytes.length === review.sizeBytes, `Manifest PDF size mismatch: ${review.code}.`);
    assert(hashBuffer(bytes) === review.sha256, `Manifest PDF hash mismatch: ${review.code}.`);
    return {code:review.code, sizeBytes:bytes.length, sha256:review.sha256};
  });
  assert(new Set(sourceAssets.map(asset => asset.code)).size === sourceAssets.length, 'Duplicate review code in source inventory.');

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
      expectedReviewCount:sourceAssets.length
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
      const html = Core.buildHtml(template, composition, config, {
        schemaVersion:Core.RECIPE_SCHEMA_VERSION,
        composerVersion:Core.COMPOSER_VERSION,
        selectedConceptIds:testCase.selectedConceptIds,
        conceptReviewManifestPath:'concept-reviews/manifest.json'
      });
      fs.writeFileSync(path.join(caseDirectory, `${config.slug}.html`), html, 'utf8');
      assert(html.includes('function loadConceptReviewManifest'), `${testCase.id} generated HTML lacks the Concept Review runtime.`);
      const size = validateAndCopyConceptReviewPackage(caseDirectory, resolution);

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
        pdfBytes:size.pdfBytes,
        runtimeManifestBytes:size.runtimeManifestBytes,
        totalAddedBytes:size.totalAddedBytes
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
      missingRequiredReviewPdfs:[],
      duplicateConflictingMappings:[],
      brokenRuntimePaths:[],
      copiedHashMismatches:[],
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
    addedBytes:item.totalAddedBytes,
    status:item.status
  }))}, null, 2));
}

run().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
