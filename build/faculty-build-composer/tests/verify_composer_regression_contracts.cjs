'use strict';
// Standalone mutation verification; not an additional active-suite runner.
// All fault injection is confined to cloned objects or child-process reads.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const helpers = require('./composer-test-helpers.js');
const {assertCanonicalIntegrity, assertGraphAssets, assertSourceProvenance, questionRecords} = require('./composer-integrity-contracts.js');
const {historicalQuestion, currentAuditedQuestion, assertAuditedFindings} = require('./composer-audit-contracts.js');
const composerRoot = path.resolve(__dirname, '..');
const library = helpers.loadComposerLibrary();
const registry = JSON.parse(fs.readFileSync(path.join(composerRoot, 'data/composer_registry.json')));
const manifest = JSON.parse(fs.readFileSync(path.join(composerRoot, 'data/composer_library_manifest.json')));
const results = [];
function rejected(name, action, message) {
  assert.throws(action, message, name + ' was not detected');
  results.push({name, status:'PASS'});
}
const integrity = assertCanonicalIntegrity(library);
// Deliberate release integrity sentinels live here, not in every mode test.
assert.deepEqual(integrity, {concepts:149, questions:9779, graphs:1077, assets:507});
rejected('wrong canonical question count', () => assertCanonicalIntegrity({...library, canonicalQuestionCount:1}), /Canonical question count/);
rejected('missing registry concept', () => assertCanonicalIntegrity(library, {registry:{...registry, concepts:registry.concepts.slice(1)}}), /registry agreement/);
rejected('mismatched manifest hash', () => assertCanonicalIntegrity(library, {manifest:{...manifest, librarySha256:'wrong'}}), /Library hash agreement/);
const staleAssets = structuredClone(manifest);
staleAssets.assets[0].graphDescription = 'Unaudited stale description';
rejected('stale manifest accessibility copy', () => assertCanonicalIntegrity(library, {manifest:staleAssets}), /Manifest \/ library assets/);
const records = questionRecords(library);
const graph = structuredClone(records.find(row => row.question.graphRequired));
graph.question.image = 'question-assets/missing.webp';
rejected('graph question with missing asset', () => assertGraphAssets([graph], manifest.assets), /Missing graph asset/);
rejected('corrupt asset bytes', () => assertGraphAssets([], [manifest.assets[0]], () => Buffer.from('corrupt')), /Asset checksum/);
const sourceQuestion = structuredClone(records.find(row => String(row.question.id) === '40010').question);
sourceQuestion.sourceHash = 'wrong';
rejected('incorrect preserved source hash', () => assertSourceProvenance(sourceQuestion, historicalQuestion('40010')), /Source provenance hash/);
const changedCopy = structuredClone(records.find(row => String(row.question.id) === '40010').question);
changedCopy.q = 'Unaudited copy';
rejected('unauthorized graph copy', () => assert.deepEqual(changedCopy, currentAuditedQuestion('40010')), /Expected values to be strictly deep-equal/);
rejected('new unreviewed auditor finding', () => assertAuditedFindings({counts:{errors:0}, findings:[{questionId:'40010', rule:'new-rule', severity:'WARNING'}]}, 'demand_supply_elasticity_assessment_audit_2026_09_06', [{id:'40010'}]), /Unreviewed quality findings/);

const runners = ['run_phase3e_graph_question_sync_validation.mjs', 'run_question_quality_auditor_validation.mjs', 'run_macro_phase2_taxonomy_validation.mjs', 'run_mastery_report_2_validation.js', 'run_unlimited_practice_validation.js', 'run_trial_by_graph_validation.js', 'run_fading_fortune_validation.js', 'run_risk_reward_validation.js'];
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-regression-mutations-'));
try {
  const preload = path.join(scratch, 'inject.cjs');
  fs.writeFileSync(preload, `const fs=require('node:fs');
const original=fs.readFileSync;
fs.readFileSync=function(file,...args){
 const value=original.call(this,file,...args);
 if(typeof value!=='string')return value;
 if(process.env.MQ_TEST_FAULT==='count'&&String(file).endsWith('composer_library.js'))return value.replace(/"canonicalQuestionCount":\\s*9779/, '"canonicalQuestionCount":1');
 if(process.env.MQ_TEST_FAULT==='mode'&&String(file).endsWith('mastery-quests-faculty-template-composer-ready.html')){
  const needle=".filter(question => question?.graphRequired === true && Boolean(question?.image) && allowedIds.has(String(question?.id ?? question?.questionId ?? '')))";
  if(!value.includes(needle))throw new Error('Mode fault injection target missing');
  return value.replace(needle,'.filter(question => true)');
 }
 return value;
};
require('node:module').syncBuiltinESMExports();
`);
  for (const [runner, fault, expected] of [
    ...runners.map(runner => [runner, 'count', /Canonical question count/]),
    ['run_trial_by_graph_validation.js', 'mode', /20 deck contains non-graph-safe question/]
  ]) {
    const child = spawnSync(process.execPath, ['--require', preload, path.join(__dirname, runner)], {
      cwd:path.resolve(composerRoot, '../..'), encoding:'utf8', maxBuffer:32*1024*1024,
      env:{...process.env, MQ_TEST_FAULT:fault, MQ_COMPOSER_TEST_OUTPUT_DIR:scratch}
    });
    assert.notEqual(child.status, 0, runner + ' accepted ' + fault);
    assert.match(child.stdout + child.stderr, expected, runner + ' failed for the wrong reason');
    results.push({name:runner + ': ' + fault, status:'PASS', childExit:child.status});
  }
} finally {
  // mkdtemp returns a direct child of the known temporary root.
  assert.equal(path.dirname(path.resolve(scratch)), path.resolve(os.tmpdir()));
  assert(path.basename(scratch).startsWith('mq-regression-mutations-'));
  fs.rmSync(scratch, {recursive:true, force:true});
}
const result = {status:'PASS', integrity, negativeChecks:results.length, results};
helpers.writeTestArtifact('tests/composer-regression-negative-validation.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
