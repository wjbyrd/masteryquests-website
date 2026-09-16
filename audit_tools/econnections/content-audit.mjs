import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GROUPS, BOARDS, POOL_VERSION, PUZZLE_POOLS } from '../../games/econnections/econnections_groups.js';
import { validatePool, normalizeLabel } from '../../games/econnections/engine.js';

const registry = JSON.parse(readFileSync(new URL('../../build/faculty-build-composer/data/composer_registry.json', import.meta.url), 'utf8'));
const canonical = new Map(registry.concepts.map(c => [c.canonicalConceptId, c]));
const summaries = {};
assert.deepEqual(validatePool(), []);
for (const group of GROUPS) {
  assert.ok(group.notes?.trim(), `Editorial notes: ${group.id}`);
  assert.ok(group.explanation?.trim(), `Explanation: ${group.id}`);
  assert.ok(group.ambiguityFamilies?.length, `Ambiguity families: ${group.id}`);
  for (const concept of group.concepts) assert.ok(canonical.has(concept), `Unknown canonical concept: ${concept}`);
  for (const objective of group.sourceObjectives) assert.ok(group.concepts.some(c => canonical.get(c).sourceObjectives?.includes(objective)), `Unverified objective ${objective} in ${group.id}`);
  assert.ok(group.tiles.every(t => t.length <= 40), `Tile too long: ${group.id}`);
}
for (const domain of ['micro', 'macro']) {
  const groups = GROUPS.filter(g => g.domain === domain);
  assert.ok(BOARDS[domain].length >= 60);
  const uses = new Map(groups.map(g => [g.id, 0]));
  const pairKeys = new Set();
  for (const board of BOARDS[domain]) {
    const selected = board.map(id => GROUPS.find(g => g.id === id));
    assert.deepEqual(selected.map(g => g.difficulty).sort(), [1, 2, 3, 4]);
    assert.equal(new Set(selected.flatMap(g => g.tiles).map(normalizeLabel)).size, 16);
    for (const [i, group] of selected.entries()) {
      uses.set(group.id, uses.get(group.id) + 1);
      for (const other of selected.slice(i + 1)) {
        assert.ok(!group.concepts.some(c => other.concepts.includes(c)), `Shared canonical concept: ${group.id} / ${other.id}`);
        assert.ok(!group.incompatibleWith.includes(other.id));
        assert.ok(!other.incompatibleWith.includes(group.id));
        pairKeys.add([group.id, other.id].sort().join('|'));
      }
    }
  }
  assert.ok([...uses.values()].every(n => n > 0), 'Unused authored relationship');
  summaries[domain] = { relationships: groups.length, boards: BOARDS[domain].length, repeatCycleDays: BOARDS[domain].length,
    relationshipTypes: Object.fromEntries(['concept','causal','trap'].map(type => [type, groups.filter(g => g.category === type).length])),
    difficultyCounts: Object.fromEntries([1,2,3,4].map(d => [d, groups.filter(g => g.difficulty === d).length])),
    distinctReviewedPairings: pairKeys.size, groupUsesPerCycle: { min: Math.min(...uses.values()), max: Math.max(...uses.values()) } };
}
if (process.argv.includes('--review')) {
  console.log('# Econ-nections v2 board review sheets\n\nThese sheets expose every tile, intended relationship, and editorial note for human review. Automated gates do not prove semantic uniqueness.\n');
  for (const domain of ['micro', 'macro']) BOARDS[domain].forEach((board, index) => {
    console.log(`## ${domain} ${index + 1}\n`);
    for (const id of board) {
      const g = GROUPS.find(g => g.id === id);
      console.log(`- **${g.difficulty}. ${g.title}** (${g.category}) — ${g.tiles.join(' / ')}\n  - ${g.explanation}\n  - Review: ${g.notes}`);
    }
    console.log('');
  });
} else console.log(JSON.stringify({ status: 'PASS', poolVersion: POOL_VERSION, activeDateBasis: 'local', archivedVersions: Object.keys(PUZZLE_POOLS).filter(v => v !== POOL_VERSION), ...summaries,
  editorialLimit: 'Difficulty and unexpected alternate interpretations benefit from student/faculty playtesting; semantic uniqueness is not machine-provable.' }, null, 2));
