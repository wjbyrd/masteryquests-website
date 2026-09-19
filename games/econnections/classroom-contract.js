import { createPuzzle, startRecord, submitGroup, dayNumber } from './engine.js';

export const SCHEMA = 'econnections-classroom/1';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const TOKEN = /^[A-Za-z0-9_-]{43}$/;
export const MAX_EVENTS = 256;
export function requireValue(condition) { if (!condition) throw new Error('Invalid classroom data'); }
export function exactKeys(value, keys) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value));
  requireValue(Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)));
}
export function pinnedPuzzle(session) {
  const match = /^econnections:([0-9]+):(\d{4}-\d{2}-\d{2}):(micro|macro)$/.exec(session.puzzleID);
  requireValue(match && match[1] === session.puzzleVersion);
  return createPuzzle(match[3], match[2], match[1]);
}
export const SESSION_FIELDS = ['sessionID', 'courseLabel', 'sectionLabel', 'sessionDate', 'scheduledClassTime', 'studentWindowStart', 'walkthroughStart', 'sessionClose', 'timeZone', 'puzzleID', 'puzzleVersion', 'status', 'mode', 'createdAt'];
export function validateSession(s) {
  exactKeys(s, SESSION_FIELDS);
  requireValue(typeof s.sessionID === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(s.sessionID));
  for (const key of ['courseLabel', 'sectionLabel']) requireValue(typeof s[key] === 'string' && s[key].length > 0 && s[key].length <= 100 && !/[\x00-\x1f]/.test(s[key]));
  dayNumber(s.sessionDate);
  requireValue(typeof s.timeZone === 'string' && s.timeZone.includes('/') && s.timeZone.length < 80);
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: s.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  for (const key of ['scheduledClassTime', 'studentWindowStart', 'walkthroughStart', 'sessionClose', 'createdAt']) {
    requireValue(typeof s[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s[key]) && new Date(s[key]).toISOString() === s[key]);
  }
  const parts = Object.fromEntries(formatter.formatToParts(new Date(s.scheduledClassTime)).map(p => [p.type, p.value]));
  requireValue(`${parts.year}-${parts.month}-${parts.day}` === s.sessionDate);
  requireValue(s.createdAt < s.sessionClose && s.studentWindowStart <= s.walkthroughStart && s.walkthroughStart < s.sessionClose && s.scheduledClassTime >= s.studentWindowStart && s.scheduledClassTime < s.sessionClose);
  requireValue(['upcoming', 'open', 'closed'].includes(s.status) && s.mode === 'classroom');
  pinnedPuzzle(s);
  return s;
}
export function eventFields(type, record, extra = {}) {
  return { eventType: type, elapsedMs: Math.round(record.elapsedTimeMs), selectedTileIds: [], correct: null, oneAway: false, groupID: null, groupsSolvedCount: record.groupsSolved, ...extra };
}
export function transitionEvents(puzzle, result, selected) {
  if (!['correct', 'incorrect', 'duplicate'].includes(result.kind)) return [];
  const r = result.record;
  const events = [eventFields('group_attempt', r, { selectedTileIds: [...selected].sort(), correct: result.kind === 'correct', oneAway: !!result.nearMiss })];
  if (result.kind === 'correct') events.push(eventFields('group_solved', r, { groupID: r.solvedGroupIds.at(-1), correct: true }));
  if (r.completed) events.push(eventFields('puzzle_complete', r, { correct: r.solved }));
  return events;
}
export const EVENT_FIELDS = ['eventID', 'sessionID', 'runID', 'playerID', 'sequenceNumber', 'schemaVersion', ...Object.keys(eventFields('session_start', { elapsedTimeMs: 0, groupsSolved: 0 }))];
export function validateEvent(e) {
  exactKeys(e, EVENT_FIELDS);
  for (const key of ['eventID', 'runID', 'playerID']) requireValue(typeof e[key] === 'string' && UUID.test(e[key]));
  requireValue(e.schemaVersion === SCHEMA && typeof e.sessionID === 'string');
  requireValue(Number.isSafeInteger(e.sequenceNumber) && e.sequenceNumber > 0 && e.sequenceNumber <= MAX_EVENTS);
  requireValue(Number.isSafeInteger(e.elapsedMs) && e.elapsedMs >= 0 && e.elapsedMs <= 86400000);
  requireValue(Number.isInteger(e.groupsSolvedCount) && e.groupsSolvedCount >= 0 && e.groupsSolvedCount <= 4);
  requireValue(typeof e.oneAway === 'boolean' && (e.correct === null || typeof e.correct === 'boolean'));
  requireValue(e.groupID === null || typeof e.groupID === 'string');
  requireValue(Array.isArray(e.selectedTileIds) && e.selectedTileIds.length <= 4 && e.selectedTileIds.every(id => typeof id === 'string' && id.length < 100));
  return e;
}
// Replay the original engine, including duplicate wrong submissions; no second answer engine.
export function validatePath(session, events) {
  const puzzle = pinnedPuzzle(session);
  let record = startRecord(puzzle), expected = [], elapsed = 0;
  for (const [index, e] of events.entries()) {
    validateEvent(e);
    requireValue(e.sessionID === session.sessionID && e.sequenceNumber === index + 1 && e.runID === events[0].runID && e.playerID === events[0].playerID && e.elapsedMs >= elapsed);
    elapsed = e.elapsedMs; record.elapsedTimeMs = elapsed;
    let wanted;
    if (index === 0) wanted = eventFields('session_start', record);
    else if (expected.length) { wanted = expected.shift(); wanted.elapsedMs = elapsed; }
    else {
      requireValue(e.eventType === 'group_attempt');
      const result = submitGroup(puzzle, record, e.selectedTileIds);
      expected = transitionEvents(puzzle, result, e.selectedTileIds);
      requireValue(expected.length > 0);
      record = result.record; wanted = expected.shift();
    }
    for (const key of Object.keys(wanted)) requireValue(JSON.stringify(wanted[key]) === JSON.stringify(e[key]));
  }
  return record;
}
