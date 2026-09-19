import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GROUPS, BOARDS, PUZZLE_POOLS } from '../../games/econnections/econnections_groups.js';
import { createPuzzle, startRecord, submitGroup, restoreRecord, summarize, validatePool, localDate, dayNumber, isNearMiss } from '../../games/econnections/engine.js';
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

test('near miss reports only an exact maximum overlap of three', () => {
  const groups = [['a', 'b', 'c', 'd'], ['e', 'f', 'g', 'h']];
  for (const [selection, expected] of [
    [['a', 'b', 'c', 'e'], true],
    [['a', 'b', 'e', 'f'], false],
    [['a', 'x', 'y', 'z'], false],
    [['w', 'x', 'y', 'z'], false],
    [['a', 'b', 'c', 'd'], false],
  ]) assert.equal(isNearMiss(selection, groups), expected, selection.join(','));
  assert.equal(isNearMiss(['a', 'a', 'b', 'c'], groups), false);
  assert.equal(isNearMiss(['a', 'b', 'c'], groups), false);
  assert.equal(isNearMiss(['a', 'b', 'c', 'e'], []), false);
  // Synthetic overlapping answers exercise the generic helper; published boards
  // have disjoint tile IDs, so two 3/4 overlaps (and max 0/4) cannot occur in play.
  assert.equal(isNearMiss(['a', 'b', 'c', 'e'], [groups[0], ['a', 'b', 'e', 'f']]), true);
  assert.equal(isNearMiss(['a', 'b', 'c', 'e'], [groups[0], ['a', 'b', 'c', 'e']]), false);
});

test('3/4 misses cost one strike, duplicates remain free after replay, and return no answer details', () => {
  const puzzle = createPuzzle('micro', '2026-09-16');
  const groups = puzzle.groups.map(g => tilesFor(puzzle, g));
  const miss = [...groups[0].slice(0, 3), groups[1][0]];
  const original = startRecord(puzzle);
  const result = submitGroup(puzzle, original, miss);
  assert.equal(result.kind, 'incorrect'); assert.equal(result.nearMiss, true);
  assert.equal(result.record.strikesUsed, 1); assert.equal(original.strikesUsed, 0);
  assert.deepEqual(Object.keys(result).sort(), ['kind', 'nearMiss', 'record']);
  assert.equal('nearMiss' in result.record, false); // Transient feedback, no save schema change.
  const restored = restoreRecord(puzzle, JSON.parse(JSON.stringify(result.record)));
  const repeated = submitGroup(puzzle, restored, [...miss].reverse());
  assert.equal(repeated.kind, 'duplicate'); assert.equal(repeated.nearMiss, true);
  assert.equal(repeated.record, restored); assert.equal(repeated.record.strikesUsed, 1);
  assert.equal(repeated.record.attempts.length, 1);
  for (const ids of [[...groups[0].slice(0, 2), ...groups[1].slice(0, 2)], groups.map(g => g[0])]) {
    const ordinary = submitGroup(puzzle, startRecord(puzzle), ids);
    assert.equal(ordinary.kind, 'incorrect'); assert.equal(ordinary.nearMiss, false);
    assert.equal(submitGroup(puzzle, ordinary.record, ids).nearMiss, false);
  }
});

test('solved groups cannot qualify and near misses preserve win and third-strike loss', () => {
  const puzzle = createPuzzle('macro', '2026-09-16');
  const groups = puzzle.groups.map(g => tilesFor(puzzle, g));
  let record = submitGroup(puzzle, startRecord(puzzle), groups[0]).record;
  const stale = submitGroup(puzzle, record, [...groups[0].slice(0, 3), groups[1][0]]);
  assert.equal(stale.kind, 'invalid'); assert.ok(!stale.nearMiss);
  assert.equal(stale.record.strikesUsed, 0);
  assert.equal(isNearMiss([...groups[0].slice(0, 3), groups[1][0]], groups.slice(1)), false);
  for (let i = 0; i < 2; i++) {
    const result = submitGroup(puzzle, record, [...groups[1].slice(0, 3), groups[2][i]]);
    assert.equal(result.nearMiss, true); record = result.record;
    assert.equal(record.strikesUsed, i + 1); assert.equal(record.completed, false);
  }
  let win = record;
  for (const ids of groups.slice(1)) {
    const result = submitGroup(puzzle, win, ids);
    assert.equal(result.nearMiss, false); win = result.record;
  }
  assert.ok(win.solved && win.completed); assert.equal(win.strikesUsed, 2);
  const loss = submitGroup(puzzle, record, [...groups[1].slice(0, 3), groups[2][2]]);
  assert.equal(loss.nearMiss, true); assert.equal(loss.record.strikesUsed, 3);
  assert.ok(loss.record.completed && !loss.record.solved); assert.equal(loss.record.groupsSolved, 1);
  assert.equal(submitGroup(puzzle, loss.record, groups[1]).kind, 'finished');
  assert.deepEqual(restoreRecord(puzzle, loss.record), loss.record);
});

test('pre-cleanup v2 identities, calendars, metadata and saved progress remain compatible', () => {
  const frozen = JSON.parse(readFileSync(new URL('./fixtures/v2-pre-cleanup.json', import.meta.url), 'utf8'));
  const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const identities = [];
  for (const domain of ['micro', 'macro']) for (let day = 0; day < 60; day++) {
    const date = localDate(new Date(2026, 8, 1 + day, 12));
    const puzzle = createPuzzle(domain, date);
    assert.equal(puzzle.poolVersion, '2');
    identities.push([puzzle.puzzleId, puzzle.groups.map(g => g.id), puzzle.tiles.map(t => [t.id, t.groupId])]);
  }
  assert.equal(digest(identities), frozen.identityHash);
  assert.equal(digest(GROUPS.map(({ tiles, ...metadata }) => metadata)), frozen.metadataHash);
  assert.equal(digest(BOARDS), frozen.calendarHash);
  const backing = memoryStorage();
  for (const record of frozen.records) backing.setItem(`mq.econnections.result.${record.puzzleId}`, JSON.stringify(record));
  const store = createStore(backing, () => assert.fail('Historical v2 save did not decode'));
  for (const record of frozen.records) {
    const puzzle = createPuzzle(record.domain, record.date, record.poolVersion);
    assert.deepEqual(store.get(puzzle), record);
    assert.equal(backing.getItem(`mq.econnections.result.${record.puzzleId}`), JSON.stringify(record));
  }
  assert.equal(store.all().length, frozen.records.length);
});
