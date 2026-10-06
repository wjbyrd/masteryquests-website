'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {questionRecords} = require('./composer-integrity-contracts.js');
const root = path.resolve(__dirname, '../../..');
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'validation_artifacts/question_quality/microeconomics_consolidated_cleanup_expectations.json'), 'utf8'));
const source = execFileSync('git', ['show', `${ledger.baselineRef}:build/faculty-build-composer/data/composer_library.js`], {cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
assert.equal(crypto.createHash('sha256').update(source).digest('hex'), ledger.baselineSourceSha256, 'Immutable pre-Micro source checksum');
const baselineLibrary = JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/, ''));
const baseline = new Map(questionRecords(baselineLibrary).map(r => [String(r.question.id), r.question]));
const approvedIds = new Set(ledger.changedQuestionIds);
const closure = JSON.parse(fs.readFileSync(path.join(root, 'validation_artifacts/question_quality/microeconomics_exception_closure_expectations.json'), 'utf8'));
const closureSource = execFileSync('git', ['show', `${closure.baselineRef}:build/faculty-build-composer/data/composer_library.js`], {cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
assert.equal(crypto.createHash('sha256').update(closureSource).digest('hex'), closure.baselineSourceSha256, 'Immutable pre-exception source checksum');
const closureBaseline = new Map(questionRecords(JSON.parse(closureSource.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/, ''))).map(r => [String(r.question.id), r.question]));
assert.deepEqual(closure.changedQuestionIds.slice().sort(), ['P62B-ELAS-B3-019', 'P62C-CPS-H-026', 'PM5-PC-BR-088'].sort(), 'Exact instructor exception whitelist');
assert.deepEqual(closure.changes.map(c => c.id).sort(), closure.changedQuestionIds.slice().sort(), 'Each exception appears exactly once');
assert.equal(approvedIds.size, 3052, 'Explicit consolidated-cleanup whitelist size');
assert.deepEqual(ledger.changes.map(r => r.id).sort(), [...approvedIds].sort(), 'Exact whitelist, no duplicate revisions');
const expected = new Map([...baseline].map(([id, q]) => [id, structuredClone(q)]));
for (const change of ledger.changes) {
  const q = expected.get(change.id);
  assert(q, `Existing canonical target ${change.id}`);
  assert.deepEqual(Object.keys(change.before).sort(), change.fields.slice().sort());
  assert.deepEqual(Object.keys(change.after).sort(), change.fields.slice().sort());
  for (const field of change.fields) assert.deepEqual(q[field] ?? null, change.before[field], `Frozen before-state ${change.id}.${field}`);
  Object.assign(q, change.after);
  for (const field of change.removedFields) delete q[field];
}
// Preserve the consolidated ledger, then apply only the three explicitly
// approved closures against their immutable, verified before-state.
for (const change of closure.changes) {
  assert(approvedIds.has(change.id), 'Exception must be an existing approved Micro target');
  const q = expected.get(change.id);
  assert.deepEqual(q, closureBaseline.get(change.id), 'Verified pre-exception state '+change.id);
  assert.deepEqual(q, change.beforeRecord, 'Exact exception before-record '+change.id);
  assert.deepEqual(Object.keys(change.before).sort(), change.fields.slice().sort());
  assert.deepEqual(Object.keys(change.after).sort(), change.fields.slice().sort());
  for (const field of change.fields) assert.deepEqual(q[field] ?? null, change.before[field], 'Exception before field '+change.id+'.'+field);
  Object.assign(q, change.after);
  for (const field of change.removedFields) delete q[field];
  assert.deepEqual(q, change.afterRecord, 'Exact approved exception after-record '+change.id);
}
function beforeApprovedRevisions(id, fallback) {
  return structuredClone(approvedIds.has(String(id)) ? baseline.get(String(id)) : fallback);
}
function applyApprovedRevisions(historical) {
  if (!historical || !approvedIds.has(String(historical.id))) return historical;
  const id = String(historical.id);
  assert.deepEqual(historical, baseline.get(id), `Pre-Micro historical expectation ${id}`);
  return structuredClone(expected.get(id));
}
function approvedQuestion(id) { return approvedIds.has(String(id)) ? structuredClone(expected.get(String(id))) : undefined; }
function assertCurrentLibrary(library) {
  const records = questionRecords(library), actualIds = [...new Set(records.map(r => String(r.question.id)))].sort();
  assert.deepEqual(actualIds, [...baseline.keys()].sort(), 'Every original canonical ID retained');
  for (const {question} of records) assert.deepEqual(question, expected.get(String(question.id)), `Exact current state including untouched fields ${question.id}`);
  const locations = new Map();
  for (const r of questionRecords(baselineLibrary)) {
    const id = String(r.question.id), route = ledger.routing.find(x => x.id === id && x.removeFromMicro);
    const move = ledger.moves.find(x => x.id === id && x.from === r.pool && x.conceptId === r.conceptId);
    const closureMove = closure.moves.find(x => x.id === id && x.fromConcept === (route?.to || r.conceptId) && x.pool === (move?.to || r.pool));
    const key = `${id}|${closureMove?.toConcept || route?.to || r.conceptId}|${move?.to || r.pool}`;
    locations.set(key, (locations.get(key) || 0) + 1);
  }
  for (const r of records) {
    const key = `${r.question.id}|${r.conceptId}|${r.pool}`;
    assert(locations.get(key) > 0, `Approved storage location ${key}`);
    locations.set(key, locations.get(key) - 1);
  }
  assert([...locations.values()].every(n => n === 0), 'All expected aliases and locations retained');
}
module.exports = {approvedIds, approvedQuestion, beforeApprovedRevisions, applyApprovedRevisions, assertCurrentLibrary, ledger, baselineLibrary, closure};
