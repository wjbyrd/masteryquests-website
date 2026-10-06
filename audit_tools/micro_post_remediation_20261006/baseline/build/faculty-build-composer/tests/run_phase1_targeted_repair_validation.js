'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Core = require('../composer-core.js');
const {
  COMPOSER_ROOT,
  CONCEPT_REVIEW_MANIFEST_PATH,
  assertCanonicalCoreVersion,
  assertGeneratedComposerVersion,
  assertInlineScriptsCompile,
  buildFacultyGame,
  loadComposerLibrary,
  loadConceptReviewManifest,
  loadCanonicalTemplate,
  writeTestArtifact
} = require('./composer-test-helpers.js');

function extractFunction(source, name){
  const start = source.indexOf(`function ${name}(`);
  if(start < 0) throw new Error(`Generated output is missing ${name}.`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  for(let index = brace; index < source.length; index++){
    if(source[index] === '{') depth++;
    if(source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Generated function ${name} is unterminated.`);
}

async function run(){
  const canonicalVersion = assertCanonicalCoreVersion(Core);
  const library = loadComposerLibrary();
  const template = loadCanonicalTemplate();
  const manifest = loadConceptReviewManifest();
  const manifestValidation = Core.validateConceptReviewManifest(library, manifest);
  assert(manifestValidation.ok, manifestValidation.errors.join('\n'));

  const invalidManifest = {...manifest, composerLibraryVersion:'intentionally-invalid-library-version'};
  const invalidManifestValidation = Core.validateConceptReviewManifest(library, invalidManifest);
  assert(!invalidManifestValidation.ok, 'Invalid Concept Review manifest was accepted.');

  const invalidQuestion = Core.validateFacultyQuestionRecord({id:'BROKEN'}, 'easy', []);
  assert(invalidQuestion.includes('q') && invalidQuestion.includes('options'), 'Invalid question record was accepted.');

  const invalidRecipe = {
    schemaVersion:Core.RECIPE_SCHEMA_VERSION,
    title:'Invalid Composer Build',
    slug:'invalid-composer-build',
    supportedModes:['unlimited'],
    selectedConceptIds:['not-a-canonical-concept'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  assert(Core.compose(library, invalidRecipe).errors.length > 0, 'Unknown concept did not fail composition.');

  const recipe = {
    schemaVersion:Core.RECIPE_SCHEMA_VERSION,
    title:'Phase 1 Targeted Repair Regression',
    slug:'phase-1-targeted-repair-regression',
    supportedModes:['standard'],
    selectedConceptIds:['scarcity-and-tradeoffs'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };

  const missingRuntimeComposition = Core.compose(library, recipe);
  const missingRuntimeConfig = await Core.createConfig(recipe, library, await Core.sha256Hex(template));
  assert.throws(
    () => Core.buildHtml(template, missingRuntimeComposition, missingRuntimeConfig, {composerVersion:canonicalVersion}),
    /Concept Review runtime manifest is missing/,
    'Missing required Concept Review runtime did not fail generation.'
  );

  const generated = await buildFacultyGame(Core, recipe, {library, template, conceptReviewManifest:manifest});
  const html = generated.html;
  const inlineScriptCount = assertInlineScriptsCompile(html, 'phase-1-targeted-repair-regression.html');
  assertGeneratedComposerVersion(html, canonicalVersion);
  assert(/<html\b/i.test(html) && /<\/html>\s*$/i.test(html), 'Generated HTML shell is malformed.');
  assert(html.includes('const FACULTY_COMPOSITION_CONFIG = '), 'Generated runtime configuration is missing.');
  assert(html.includes('data-mode="standard"') && html.includes('data-mode="unlimited"'), 'Required mode runtime wiring is missing.');

  const structuralChecks = {
    targetedRepairState:html.includes('const targetedRepairState = {'),
    targetDerivation:html.includes('function getRepairTargetsFromReport('),
    weakAreaLaunch:html.includes('function launchTargetedRepair('),
    repairButton:html.includes("button.textContent = 'Repair Weak Areas'"),
    internalUnlimitedLaunch:html.includes("mqRepairBaseStartSelectedMode.call(this, 'unlimited', options)"),
    hiddenUnlimitedEnable:html.includes("FACULTY_COMPOSITION_CONFIG.supportedModes = [...supported, 'unlimited']"),
    endPractice:html.includes('End Practice'),
    freshMasteryReport:html.includes('showMasteryReportScreen') && html.includes('getMasteryReportData()')
  };
  for(const [name, present] of Object.entries(structuralChecks)){
    assert(present, `Generated Phase 1 support is missing ${name}.`);
  }

  const repairContext = {
    String,
    Array,
    Set,
    Number,
    capturedLaunch:null
  };
  repairContext.startSelectedMode = (mode, options) => {
    repairContext.capturedLaunch = {mode, options};
  };
  vm.createContext(repairContext);
  vm.runInContext([
    extractFunction(html, 'normalizeRepairKey'),
    extractFunction(html, 'uniqueRepairKeys'),
    extractFunction(html, 'sanitizeRepairTargets'),
    extractFunction(html, 'actionableRepairEntries'),
    extractFunction(html, 'getRepairTargetsFromReport'),
    extractFunction(html, 'launchTargetedRepair')
  ].join('\n'), repairContext);

  const weakReport = {
    weakestObjectives:[{key:'LO-1',attempts:2,accuracy:0.84}],
    weakestSkills:[{key:'Skill-1',attempts:4,accuracy:0.5}],
    weakestConcepts:[{key:'Tag-1',attempts:3,accuracy:0.8}],
    weakestTypes:[{key:'Application',attempts:2,accuracy:0.2}],
    priorMasteryEvidence:{mustNotCarry:true}
  };
  const strongReport = {
    weakestObjectives:[{key:'LO-2',attempts:8,accuracy:0.85}],
    weakestSkills:[{key:'Skill-2',attempts:1,accuracy:0}],
    weakestConcepts:[],
    weakestTypes:[]
  };
  const weakTargets = vm.runInContext('getRepairTargetsFromReport(report)', vm.createContext({...repairContext, report:weakReport}));
  const strongTargets = vm.runInContext('getRepairTargetsFromReport(report)', vm.createContext({...repairContext, report:strongReport}));
  assert(weakTargets.hasTargets, 'Actionable weak report did not expose repair targets.');
  assert(!strongTargets.hasTargets, 'Strong or insufficient evidence exposed repair targets.');
  assert(!('priorMasteryEvidence' in weakTargets), 'Prior mastery evidence leaked into repair targets.');

  repairContext.targets = {...weakTargets, priorMasteryEvidence:{mustNotCarry:true}};
  vm.runInContext("launchTargetedRepair(targets, 'Exam Drill')", repairContext);
  assert.strictEqual(repairContext.capturedLaunch.mode, 'unlimited', 'Repair did not launch Unlimited Practice internally.');
  assert.strictEqual(repairContext.capturedLaunch.options.targetedRepair, true, 'Repair launch was not marked targeted.');
  assert(!('priorMasteryEvidence' in repairContext.capturedLaunch.options.repairTargets), 'Repair launch carried prior mastery evidence.');

  const bonusContext = {
    targetedRepairState:{active:true,scoredAttempts:0},
    questionMatchesRepairObjective:() => true,
    questionMatchesRepairSkill:() => true,
    questionMatchesRepairTag:() => true,
    questionMatchesRepairType:() => true
  };
  vm.createContext(bonusContext);
  vm.runInContext(extractFunction(html, 'getRepairPriorityBonus'), bonusContext);
  const bonuses = [];
  for(const attempts of [0, 8, 16]){
    bonusContext.targetedRepairState.scoredAttempts = attempts;
    bonuses.push(vm.runInContext('getRepairPriorityBonus({})', bonusContext));
  }
  assert.deepStrictEqual(bonuses, [18.5, 11.1, 5.55], 'Targeted repair weighting or decay changed.');

  const tamperedHtml = html.replaceAll(canonicalVersion, '0.0.0-test-mismatch');
  assert.throws(
    () => assertGeneratedComposerVersion(tamperedHtml, canonicalVersion),
    /version mismatch/,
    'Generated Composer version mismatch was not detected.'
  );

  const genEconReview = manifest.reviews.find(review => review.code === 'GEN-ECON-01');
  assert(genEconReview, 'Canonical manifest is missing GEN-ECON-01.');
  const genEconPath = path.join(path.dirname(CONCEPT_REVIEW_MANIFEST_PATH), genEconReview.pdfPath);
  assert(fs.existsSync(genEconPath), 'Canonical GEN-ECON-01 PDF is missing.');
  assert.strictEqual(fs.statSync(genEconPath).size, genEconReview.sizeBytes, 'GEN-ECON-01 fixture size differs from its manifest.');

  const result = {
    phase:'phase-1-composer-targeted-repair-regression',
    ok:true,
    canonicalVersion,
    canonicalTemplate:path.relative(COMPOSER_ROOT, path.join(COMPOSER_ROOT, 'template', 'mastery-quests-faculty-template-composer-ready.html')).replaceAll('\\', '/'),
    conceptReviewManifest:path.relative(COMPOSER_ROOT, CONCEPT_REVIEW_MANIFEST_PATH).replaceAll('\\', '/'),
    genEcon01:path.relative(COMPOSER_ROOT, genEconPath).replaceAll('\\', '/'),
    inlineScriptCount,
    structuralChecks,
    bonuses,
    generatedHtmlBytes:Buffer.byteLength(html)
  };
  writeTestArtifact('tests/phase1_targeted_repair_validation_results.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
