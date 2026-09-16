import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { localDate, dayNumber, displayDate } from '../../games/econnections/calendar-date.js';
import { createPuzzle, startRecord, submitGroup, summarize, streakFor } from '../../games/econnections/engine.js';
import { PUZZLE_POOLS } from '../../games/econnections/econnections_groups.js';
import { createStore, STORAGE_PREFIX } from '../../games/econnections/storage.js';

test('localDate uses local components, padded, without converting to an instant', () => {
  const parts = { getFullYear: () => 2026, getMonth: () => 0, getDate: () => 2,
    toISOString() { throw Error('No UTC conversion allowed'); }, getTime() { throw Error('No duration arithmetic'); } };
  assert.equal(localDate(parts), '2026-01-02');
  assert.equal(displayDate('2026-09-16'), 'Sep 16, 2026');
});
test('actual local clocks in western, eastern, and fractional-offset zones', () => {
  const module = new URL('../../games/econnections/calendar-date.js', import.meta.url).href;
  for (const [zone, instant, expected] of [
    ['America/New_York', '2026-09-17T03:30:00Z', '2026-09-16'],
    ['America/New_York', '2026-09-17T04:01:00Z', '2026-09-17'],
    ['America/Los_Angeles', '2026-09-17T01:00:00Z', '2026-09-16'],
    ['Asia/Tokyo', '2026-09-16T15:01:00Z', '2026-09-17'],
    ['Asia/Kathmandu', '2026-09-16T18:16:00Z', '2026-09-17'],
    ['Pacific/Kiritimati', '2026-09-16T10:01:00Z', '2026-09-17'],
  ]) {
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', `import {localDate} from '${module}'; console.log(localDate(new Date('${instant}')));`], { env: { ...process.env, TZ: zone }, encoding: 'utf8' });
    assert.equal(output.trim(), expected, zone);
  }
});
test('Gregorian day-only arithmetic: months, years, leap years and century rules', () => {
  assert.equal(dayNumber('1970-01-01'), 0);
  for (const [a, b] of [['2026-01-31','2026-02-01'], ['2026-12-31','2027-01-01'], ['2028-02-28','2028-02-29'], ['2028-02-29','2028-03-01'], ['2026-02-28','2026-03-01'], ['2000-02-28','2000-02-29'], ['2100-02-28','2100-03-01']]) assert.equal(dayNumber(b) - dayNumber(a), 1, `${a} → ${b}`);
  for (const bad of ['2026-02-29','2100-02-29','2026-13-01','2026-01-32','2026-1-1','not-a-date']) assert.throws(() => dayNumber(bad));
});
test('23-hour and 25-hour days are each one streak day', () => {
  // These instants intentionally demonstrate why elapsed-millisecond division
  // would be wrong; the implementation operates only on date labels.
  assert.equal((Date.parse('2026-03-09T00:00:00-04:00') - Date.parse('2026-03-08T00:00:00-05:00')) / 3600000, 23);
  assert.equal((Date.parse('2026-11-02T00:00:00-05:00') - Date.parse('2026-11-01T00:00:00-04:00')) / 3600000, 25);
  for (const dates of [['2026-03-07','2026-03-08','2026-03-09'], ['2026-10-31','2026-11-01','2026-11-02'], ['2028-02-28','2028-02-29','2028-03-01'], ['2026-12-30','2026-12-31','2027-01-01']]) {
    assert.deepEqual(streakFor(dates, dates[2]), { currentStreak: 3, bestStreak: 3 });
    assert.equal(dayNumber(dates[2]) - dayNumber(dates[0]), 2);
  }
  assert.deepEqual(streakFor(['2026-03-07','2026-03-08'], '2026-03-10'), { currentStreak: 0, bestStreak: 2 });
  const source = readFileSync(new URL('../../games/econnections/calendar-date.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /86400000|Date\.parse|Date\.UTC|getTime\(|toISOString\(/);
});
test('frozen v1 saves reconstruct exact answers; migration never rewrites or double-counts them', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/v1-history.json', import.meta.url)));
  const legacy = PUZZLE_POOLS['1'];
  assert.equal(createHash('sha256').update(JSON.stringify({ groups: legacy.groups, boards: legacy.boards })).digest('hex'), fixture.poolHash);
  const values = new Map(fixture.records.map(record => [STORAGE_PREFIX + record.puzzleId, JSON.stringify(record)]));
  const original = [...values];
  const store = createStore({ get length() { return values.size; }, key: i => [...values.keys()][i], getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) }, message => assert.fail(message));
  for (const old of fixture.records) {
    const restored = store.get(createPuzzle(old.domain, old.date, '1'));
    const { dateBasis, ...compatible } = restored;
    assert.equal(dateBasis, 'utc'); assert.deepEqual(compatible, old);
  }
  let stats = summarize(store.all(), '2026-09-16');
  assert.deepEqual([stats.gamesPlayed, stats.gamesCompleted, stats.gamesSolved], [3, 2, 1]);
  assert.equal(stats.currentStreak, 0); assert.equal(stats.bestStreak, 0);
  assert.equal(stats.legacyHistory.bestStreak, 1);
  const puzzle = createPuzzle('micro', '2026-09-16');
  let record = startRecord(puzzle);
  for (const group of puzzle.groups) record = submitGroup(puzzle, record, puzzle.tiles.filter(t => t.groupId === group.id).map(t => t.id)).record;
  store.save(record); store.save(record);
  stats = summarize([...store.all(), record], '2026-09-16');
  assert.equal(stats.gamesPlayed, 4); assert.equal(stats.gamesCompleted, 3); assert.equal(stats.gamesSolved, 2);
  assert.equal(stats.currentStreak, 1); assert.equal(stats.domains.micro.lastSolvedDate, '2026-09-16');
  for (const [key, raw] of original) assert.equal(values.get(key), raw);
  assert.equal(puzzle.poolVersion, '2'); assert.equal(puzzle.dateBasis, 'local');
});
test('active UI has local-midnight wording and no UTC date or share labels', () => {
  const html = readFileSync(new URL('../../games/econnections/index.html', import.meta.url), 'utf8');
  const controller = readFileSync(new URL('../../games/econnections/econnections.js', import.meta.url), 'utf8');
  assert.match(html, /local midnight/); assert.doesNotMatch(html, /UTC/);
  assert.doesNotMatch(controller, /utcDate|UTC|toISOString/);
});
