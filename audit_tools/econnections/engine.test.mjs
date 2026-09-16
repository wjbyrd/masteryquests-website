import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GROUPS, BOARDS, PUZZLE_POOLS } from '../../games/econnections/econnections_groups.js';
import { createPuzzle, startRecord, submitGroup, restoreRecord, summarize, validatePool, localDate, dayNumber } from '../../games/econnections/engine.js';
import { createStore } from '../../games/econnections/storage.js';

const tilesFor = (puzzle, group) => puzzle.tiles.filter(t => t.groupId === group.id).map(t => t.id);
const solve = (puzzle, mistakes = 0) => {
  let record = startRecord(puzzle);
  for (let i = 0; i < mistakes; i++) record = submitGroup(puzzle, record, puzzle.groups.map(g => tilesFor(puzzle, g)[i])).record;
  for (const group of puzzle.groups) record = submitGroup(puzzle, record, tilesFor(puzzle, group)).record;
  return record;
};
function memoryStorage() {
  const values = new Map();
  return { get length() { return values.size; }, key: i => [...values.keys()][i], getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('96 active relationships, 120 boards, and all canonical concept references validate', () => {
  assert.deepEqual(validatePool(), []);
  const registry = JSON.parse(readFileSync(new URL('../../build/faculty-build-composer/data/composer_registry.json', import.meta.url), 'utf8'));
  const concepts = new Set(registry.concepts.map(c => c.canonicalConceptId));
  for (const domain of ['micro', 'macro']) {
    assert.equal(GROUPS.filter(g => g.domain === domain).length, 48);
    assert.equal(BOARDS[domain].length, 60);
    assert.deepEqual(new Set(GROUPS.filter(g => g.domain === domain).map(g => g.category)), new Set(['concept', 'causal', 'trap']));
  }
  for (const group of GROUPS) for (const concept of group.concepts) assert.ok(concepts.has(concept), concept);
  for (const group of GROUPS) {
    assert.ok(group.explanation.trim() && group.notes.trim());
    assert.deepEqual(group.sourceObjectives, []);
    assert.ok(group.tiles.every(t => t.length <= 40));
    assert.ok(group.incompatibleWith.length > 0);
  }
  const used = new Set(Object.values(BOARDS).flat(2));
  assert.ok(GROUPS.every(g => used.has(g.id)));
});
test('audit rejects duplicate labels and prohibited combinations', () => {
  const badGroups = structuredClone(GROUPS); badGroups[0].tiles[1] = badGroups[0].tiles[0];
  assert.ok(validatePool(badGroups).some(e => e.includes('tiles')));
  const badBoards = structuredClone(BOARDS); badBoards.micro[0] = ['mi-demand-drivers', 'mi-ceiling-chain', 'mi-entry', 'mi-simultaneous'];
  assert.ok(validatePool(GROUPS, badBoards).some(e => e.includes('Incompatible')));
  const repeated = structuredClone(BOARDS); repeated.micro[1] = [...repeated.micro[0]].reverse();
  assert.ok(validatePool(GROUPS, repeated).some(e => e.includes('Repeated board')));
});
test('five years of dates are deterministic, with no board repeat sooner than 60 calendar days', () => {
  for (const domain of ['micro', 'macro']) {
    const seen = new Map(); let previous;
    for (let day = 0; day < 1827; day++) {
      const date = localDate(new Date(2026, 0, 1 + day, 12));
      const puzzle = createPuzzle(domain, date);
      assert.deepEqual(puzzle, createPuzzle(domain, date));
      assert.equal(new Set(puzzle.tiles.map(t => t.label)).size, 16);
      const ids = puzzle.groups.map(g => g.id).sort().join();
      if (seen.has(ids)) assert.equal(day - seen.get(ids), 60);
      seen.set(ids, day);
      assert.notEqual(ids, previous); previous = ids;
      assert.ok(puzzle.groups.every(g => g.domain === domain));
    }
    assert.equal(seen.size, 60);
  }
  assert.throws(() => dayNumber('2026-02-30'));
  assert.throws(() => createPuzzle('general'));
  assert.throws(() => createPuzzle('micro', '2026-09-16', 'unknown'));
});
test('legacy and local pools both remain structurally valid', () => {
  for (const pool of Object.values(PUZZLE_POOLS)) assert.deepEqual(validatePool(pool.groups, pool.boards), []);
});
test('valid groups lock; four groups win even with two strikes; end state is immutable', () => {
  const puzzle = createPuzzle('micro', '2026-09-16');
  let record = startRecord(puzzle);
  assert.equal(submitGroup(puzzle, record, []).kind, 'invalid');
  const ids = tilesFor(puzzle, puzzle.groups[0]);
  assert.equal(submitGroup(puzzle, record, [ids[0], ids[0], ids[1], ids[2]]).kind, 'invalid');
  record = submitGroup(puzzle, record, ids).record;
  assert.equal(record.groupsSolved, 1);
  assert.equal(submitGroup(puzzle, record, ids).kind, 'invalid');
  record = solve(puzzle, 2);
  assert.ok(record.solved && record.completed);
  assert.equal(record.strikesUsed, 2);
  assert.equal(record.groupsSolved, 4);
  assert.equal(submitGroup(puzzle, record, ids).kind, 'finished');
  assert.deepEqual(restoreRecord(puzzle, JSON.parse(JSON.stringify(record))), record);
});
test('three distinct wrong sets lose; repeated wrong sets are free; partial solves survive', () => {
  const puzzle = createPuzzle('macro', '2026-09-16');
  let record = startRecord(puzzle);
  record = submitGroup(puzzle, record, tilesFor(puzzle, puzzle.groups[0])).record;
  const sets = [0, 1, 2].map(i => [tilesFor(puzzle, puzzle.groups[1])[i], tilesFor(puzzle, puzzle.groups[2])[i], ...tilesFor(puzzle, puzzle.groups[3]).slice(0, 2)]);
  record = submitGroup(puzzle, record, sets[0]).record;
  assert.equal(submitGroup(puzzle, record, [...sets[0]].reverse()).kind, 'duplicate');
  for (const set of sets.slice(1)) record = submitGroup(puzzle, record, set).record;
  assert.ok(record.completed && !record.solved);
  assert.equal(record.strikesUsed, 3); assert.equal(record.groupsSolved, 1);
  assert.equal(record.incorrectSubmissions.length, 3);
  assert.deepEqual(restoreRecord(puzzle, record), record);
});
test('progress replay, separate domain records, corrupt saves and unavailable storage', () => {
  const backing = memoryStorage(); let warnings = 0;
  const store = createStore(backing, () => warnings++);
  const micro = createPuzzle('micro', '2026-09-16'), macro = createPuzzle('macro', '2026-09-16');
  const record = solve(micro); record.elapsedTimeMs = 54321;
  store.save(record); store.save(startRecord(macro));
  assert.equal(createStore(backing).get(micro).elapsedTimeMs, 54321);
  assert.equal(store.all().length, 2);
  assert.equal(restoreRecord(micro, { ...record, attempts: [['missing']] }), null);
  assert.equal(restoreRecord(micro, { ...record, strikesUsed: 100 }).strikesUsed, 0);
  backing.setItem('mq.econnections.result.bad', '{');
  assert.equal(store.all().length, 2); assert.equal(warnings, 1);
  const broken = createStore({ getItem() { throw Error(); }, setItem() { throw Error(); }, get length() { throw Error(); } }, () => warnings++);
  broken.save(record); assert.equal(broken.get(micro).solved, true); assert.equal(broken.all().length, 1);
  const quota = createStore({ ...backing, setItem() { throw Error(); } });
  const newer = { ...record, elapsedTimeMs: 67890 }; quota.save(newer);
  assert.equal(quota.get(micro).elapsedTimeMs, 67890);
});
test('played, completed, solved, perfect, daily streaks and per-domain dates stay distinct', () => {
  const records = [solve(createPuzzle('micro', '2026-09-14')), solve(createPuzzle('micro', '2026-09-15'), 1), solve(createPuzzle('macro', '2026-09-15')), startRecord(createPuzzle('macro', '2026-09-16'))];
  let stats = summarize(records, '2026-09-16');
  assert.equal(stats.gamesPlayed, 4); assert.equal(stats.gamesCompleted, 3); assert.equal(stats.gamesSolved, 3);
  assert.equal(stats.perfectSolves, 2); assert.equal(stats.currentStreak, 2); assert.equal(stats.bestStreak, 2);
  assert.equal(stats.microPlayed, 2); assert.equal(stats.macroSolved, 1);
  assert.equal(stats.domains.micro.lastCompletedDate, '2026-09-15');
  assert.equal(stats.domains.macro.lastSolvedDate, '2026-09-15');
  assert.equal(summarize(records, '2026-09-17').currentStreak, 0);
  records.push(solve(createPuzzle('micro', '2026-09-16')));
  stats = summarize(records, '2026-09-16'); assert.equal(stats.currentStreak, 3);
});
