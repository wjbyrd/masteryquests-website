'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const composerRoot = path.resolve(__dirname, '..');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const questionId = q => String(q.canonicalId || q.id || q.questionId || '');

// Enumerate the stored corpus independently of compose(), count metadata and
// runtime pool builders. Aliases may repeat IDs; derived views store no copies.
function questionRecords(library) {
  return Object.entries(library.concepts).flatMap(([conceptId, module]) => [
    ...Object.entries(module.questions || {}).flatMap(([pool, questions]) => questions.map(question => ({conceptId, pool, question}))),
    ...['repairQuestions', 'repairSeedQuestions', 'bridgeQuestions'].flatMap(pool => (module[pool] || []).map(question => ({conceptId, pool, question})))
  ]);
}

function assertGraphAssets(records, assets, readBytes = asset => fs.readFileSync(path.join(composerRoot, 'data', asset.runtimePath))) {
  const byPath = new Map(assets.map(asset => [asset.runtimePath, asset]));
  // Different concepts can intentionally register the same physical graph.
  for (const asset of assets) {
    assert.equal(asset.sha256, byPath.get(asset.runtimePath).sha256, `Shared asset checksum: ${asset.runtimePath}`);
  }
  for (const {question} of records.filter(row => row.question.graphRequired === true)) {
    assert(question.image && byPath.has(question.image), `Missing graph asset: ${questionId(question)}`);
  }
  for (const asset of assets) {
    const bytes = readBytes(asset);
    assert.equal(sha256(bytes), asset.sha256, `Asset checksum: ${asset.runtimePath}`);
    assert.equal(bytes.length, asset.sizeBytes, `Asset size: ${asset.runtimePath}`);
  }
}

function assertCanonicalIntegrity(library, {
  registry = readJson(path.join(composerRoot, 'data/composer_registry.json')),
  manifest = readJson(path.join(composerRoot, 'data/composer_library_manifest.json')),
  readBytes
} = {}) {
  const concepts = Object.keys(library.concepts).sort();
  const records = questionRecords(library);
  assert(records.every(row => questionId(row.question)), 'Question without canonical ID');
  const ids = new Set(records.map(row => questionId(row.question)));
  for (const metadata of [library, manifest]) {
    assert.equal(metadata.conceptCount, concepts.length, 'Canonical concept count');
    assert.equal(metadata.canonicalQuestionCount, ids.size, 'Canonical question count');
  }
  assert.deepEqual(registry, library.registry, 'Standalone / embedded registry agreement');
  assert.deepEqual(registry.concepts.map(row => row.canonicalConceptId).sort(), concepts, 'Registry concept membership');
  for (const metadata of [registry, manifest]) {
    assert.equal(metadata.libraryVersion, library.libraryVersion, 'Library version agreement');
    assert.equal(metadata.librarySha256, library.librarySha256, 'Library hash agreement');
  }
  const payload = structuredClone(library);
  delete payload.librarySha256;
  delete payload.registry.librarySha256;
  assert.equal(sha256(JSON.stringify(stable(payload))), library.librarySha256, 'Library semantic checksum');
  assert.equal(manifest.assetCount, manifest.assets.length, 'Manifest asset count');
  assert.deepEqual(manifest.assets, library.assetInventory, 'Manifest / library assets');
  for (const module of Object.values(library.concepts)) {
    for (const asset of module.assetMetadata || []) {
      const registered = library.assetInventory.find(row => row.runtimePath === asset.runtimePath && row.conceptId === asset.conceptId);
      assert(registered, `Concept asset registration: ${asset.runtimePath}`);
      // Module accessibility descriptions may be contextual. File identity and
      // bytes must agree; the focused graph runner checks its audited wording.
      for (const field of ['runtimePath', 'sha256', 'sizeBytes']) assert.equal(asset[field], registered[field], `Concept asset ${field}: ${asset.runtimePath}`);
    }
  }
  assertGraphAssets(records, manifest.assets, readBytes);
  return {concepts: concepts.length, questions: ids.size, graphs: new Set(records.filter(row => row.question.graphRequired === true).map(row => questionId(row.question))).size, assets: manifest.assets.length};
}

function assertSourceProvenance(question, historicalQuestion) {
  assert(historicalQuestion, `Missing historical provenance snapshot: ${questionId(question)}`);
  const payload = Object.fromEntries(['id', 'q', 'options', 'image', 'primarySkill', 'primaryConceptId', 'difficulty', 'objective'].map(key => [key, historicalQuestion[key] ?? null]));
  assert.equal(historicalQuestion.sourceHash, sha256(JSON.stringify(stable(payload))), `Historical source payload hash: ${questionId(question)}`);
  assert.equal(question.sourceHash, historicalQuestion.sourceHash, `Source provenance hash: ${questionId(question)}`);
  assert.deepEqual(question.sourceOccurrences, historicalQuestion.sourceOccurrences, `Source occurrences: ${questionId(question)}`);
  assert(question.sourceOccurrences?.length > 0, `Missing source occurrences: ${questionId(question)}`);
  assert(question.sourceOccurrences.every(row => row.sourceHash === question.sourceHash), `Source occurrence hash: ${questionId(question)}`);
}

module.exports = {assertCanonicalIntegrity, assertGraphAssets, assertSourceProvenance, questionRecords, questionId};
