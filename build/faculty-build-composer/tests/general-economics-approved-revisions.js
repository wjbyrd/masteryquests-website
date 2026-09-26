'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {questionRecords} = require('./composer-integrity-contracts.js');
const root = path.resolve(__dirname, '../../..');
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'validation_artifacts/question_quality/general_economics_exception_closure_expectations.json'), 'utf8'));
const sourcePath = 'build/faculty-build-composer/data/composer_library.js';
const readRevision = ref => execFileSync('git', ['show', `${ref}:${sourcePath}`], {cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
const parse = source => JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/, ''));
const mapQuestions = library => new Map(questionRecords(library).map(({question}) => [String(question.id), question]));
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const same = (a, b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));
const verifiedSource = readRevision(ledger.verifiedRef);
assert.equal(crypto.createHash('sha256').update(verifiedSource).digest('hex'), ledger.verifiedSourceSha256, 'Frozen final-verification source checksum');
const baseline = mapQuestions(parse(readRevision(ledger.baselineRef)));
const verified = mapQuestions(parse(verifiedSource));
assert.deepEqual([...baseline.keys()].sort(), [...verified.keys()].sort(), 'Approved cleanup preserves every canonical ID');
const changed = [...verified].filter(([id, q]) => !same(q, baseline.get(id))).map(([id]) => id).sort();
assert.equal(changed.length, 528, 'Final-verification approved revision count');
assert.deepEqual(changed, ledger.verifiedQuestionIds, 'Exact whitelist of previously verified General revisions');
const approvedIds = new Set([...changed, ...ledger.closureChanges.map(row => row.id)]);
assert.equal(ledger.closureChanges.length, 22, 'Only 21 question exceptions and one tradeMath correction');
assert.equal(new Set(ledger.closureChanges.map(row => row.id)).size, 22, 'Unique closure targets');
const expected = new Map([...approvedIds].map(id => [id, structuredClone(verified.get(id))]));
for (const change of ledger.closureChanges) {
  const question = expected.get(change.id);
  assert(question, `Existing exception target ${change.id}`);
  assert.deepEqual(Object.keys(change.before).sort(), Object.keys(change.after).sort(), `Explicit closure field set ${change.id}`);
  for (const [field, value] of Object.entries(change.before)) assert.deepEqual(question[field], value, `Closure before-state ${change.id}.${field}`);
  Object.assign(question, change.after);
}

// The original source hash describes the pre-cleanup payload, not revised skills.
// Reconstruct that payload from the frozen baseline, never from live edited fields.
function beforeApprovedRevisions(id, fallback) {
  return structuredClone(approvedIds.has(String(id)) ? baseline.get(String(id)) : fallback);
}
function applyApprovedRevisions(historical) {
  if (!historical || !approvedIds.has(String(historical.id))) return historical;
  const id = String(historical.id);
  assert.deepEqual(historical, baseline.get(id), `Pre-cleanup historical expectation ${id}`);
  return structuredClone(expected.get(id));
}
function approvedQuestion(id) { return expected.has(String(id)) ? structuredClone(expected.get(String(id))) : undefined; }
module.exports = {approvedIds, approvedQuestion, beforeApprovedRevisions, applyApprovedRevisions, ledger};
