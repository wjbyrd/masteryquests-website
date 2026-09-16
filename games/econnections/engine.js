import { GROUPS, BOARDS, POOL_VERSION, PUZZLE_POOLS } from './econnections_groups.js';

export const DAY_MS = 86400000;
export const utcDate = (now = new Date()) => now.toISOString().slice(0, 10);
export function dayNumber(date) {
  const value = Date.parse(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(value) || utcDate(new Date(value)) !== date) throw new Error('Invalid puzzle date.');
  return value / DAY_MS;
}
export function hash(value) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}
export function shuffled(items, seed) {
  const result = [...items];
  let state = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export const normalizeLabel = label => label.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/[\s–—-]+/g, ' ');
export function validatePool(groups = GROUPS, boards = BOARDS) {
  const errors = [];
  const ids = new Set();
  for (const group of groups) {
    if (!group.id || ids.has(group.id)) errors.push(`Duplicate/missing ID: ${group.id}`);
    ids.add(group.id);
    if (!['micro', 'macro'].includes(group.domain) || !['concept', 'causal', 'trap'].includes(group.category) || ![1, 2, 3, 4].includes(group.difficulty)) errors.push(`Invalid classification: ${group.id}`);
    if (!group.title || !group.explanation || !group.concepts?.length || !group.tags?.length || !Array.isArray(group.sourceObjectives)) errors.push(`Missing metadata: ${group.id}`);
    if (!Array.isArray(group.tiles) || group.tiles.length !== 4 || group.tiles.some(t => typeof t !== 'string' || !t.trim()) || new Set(group.tiles.map(normalizeLabel)).size !== 4) errors.push(`Invalid tiles: ${group.id}`);
  }
  for (const domain of ['micro', 'macro']) {
    if (!boards[domain]?.length) errors.push(`No boards: ${domain}`);
    for (const [index, board] of (boards[domain] || []).entries()) {
      const selected = board.map(id => groups.find(g => g.id === id));
      const name = `${domain} board ${index + 1}`;
      if (board.length !== 4 || new Set(board).size !== 4 || selected.some(g => !g || g.domain !== domain)) { errors.push(`Invalid groups: ${name}`); continue; }
      if (new Set(selected.map(g => g.difficulty)).size !== 4) errors.push(`Difficulty mix: ${name}`);
      if (new Set(selected.flatMap(g => g.tiles).map(normalizeLabel)).size !== 16) errors.push(`Overlapping labels: ${name}`);
      if (selected.some(g => g.incompatibleWith?.some(id => board.includes(id)))) errors.push(`Incompatible relationships: ${name}`);
    }
  }
  return errors;
}

export function createPuzzle(domain, date = utcDate(), version = POOL_VERSION) {
  const pool = PUZZLE_POOLS[version];
  if (!['micro', 'macro'].includes(domain) || !pool?.boards?.[domain]) throw new Error('Unknown puzzle domain or pool version.');
  const day = dayNumber(date);
  const index = ((day + hash(`${domain}:${version}`)) % pool.boards[domain].length + pool.boards[domain].length) % pool.boards[domain].length;
  const groups = pool.boards[domain][index].map(id => pool.groups.find(g => g.id === id));
  const puzzleId = `econnections:${version}:${date}:${domain}`;
  const tiles = shuffled(groups.flatMap(g => g.tiles.map((label, i) => ({ id: `${g.id}:${i}`, label, groupId: g.id }))), hash(puzzleId));
  return { puzzleId, date, domain, poolVersion: version, groups, tiles };
}
export function startRecord(puzzle) {
  return { puzzleId: puzzle.puzzleId, date: puzzle.date, domain: puzzle.domain, poolVersion: puzzle.poolVersion,
    started: true, completed: false, solved: false, groupsSolved: 0, solvedGroupIds: [], strikesUsed: 0,
    incorrectSubmissions: [], attempts: [], elapsedTimeMs: 0, tileOrder: puzzle.tiles.map(t => t.id) };
}
export function submitGroup(puzzle, record, tileIds) {
  if (record.completed) return { record, kind: 'finished' };
  const tiles = tileIds.map(id => puzzle.tiles.find(t => t.id === id));
  if (tileIds.length !== 4 || new Set(tileIds).size !== 4 || tiles.some(t => !t || record.solvedGroupIds.includes(t.groupId))) return { record, kind: 'invalid' };
  const signature = [...tileIds].sort().join('|');
  if (record.incorrectSubmissions.some(ids => [...ids].sort().join('|') === signature)) return { record, kind: 'duplicate' };
  const correct = tiles.every(t => t.groupId === tiles[0].groupId);
  const next = { ...record, attempts: [...record.attempts, [...tileIds]],
    solvedGroupIds: correct ? [...record.solvedGroupIds, tiles[0].groupId] : [...record.solvedGroupIds],
    incorrectSubmissions: correct ? [...record.incorrectSubmissions] : [...record.incorrectSubmissions, [...tileIds]],
    strikesUsed: record.strikesUsed + (correct ? 0 : 1) };
  next.groupsSolved = next.solvedGroupIds.length;
  next.solved = next.groupsSolved === 4;
  next.completed = next.solved || next.strikesUsed === 3;
  return { record: next, kind: correct ? 'correct' : 'incorrect' };
}

// Restore progress by replaying legal attempts instead of trusting cached totals.
export function restoreRecord(puzzle, saved) {
  if (!saved || saved.puzzleId !== puzzle.puzzleId || !Array.isArray(saved.attempts) || saved.attempts.length > 6) return null;
  let record = startRecord(puzzle);
  for (const attempt of saved.attempts) {
    if (!Array.isArray(attempt)) return null;
    const result = submitGroup(puzzle, record, attempt);
    if (!['correct', 'incorrect'].includes(result.kind)) return null;
    record = result.record;
  }
  record.elapsedTimeMs = Number.isFinite(saved.elapsedTimeMs) ? Math.max(0, saved.elapsedTimeMs) : 0;
  if (Array.isArray(saved.tileOrder) && saved.tileOrder.length === 16 && new Set(saved.tileOrder).size === 16 && saved.tileOrder.every(id => puzzle.tiles.some(t => t.id === id))) record.tileOrder = saved.tileOrder;
  return record;
}

export function streakFor(dates, today) {
  const days = [...new Set(dates.map(dayNumber))].sort((a, b) => a - b);
  let bestStreak = 0, run = 0;
  days.forEach((day, i) => { run = i && day === days[i - 1] + 1 ? run + 1 : 1; bestStreak = Math.max(bestStreak, run); });
  const last = days.at(-1);
  const currentStreak = last === dayNumber(today) || last === dayNumber(today) - 1 ? run : 0;
  return { currentStreak, bestStreak };
}
export function summarize(records, today = utcDate()) {
  const eligible = records.filter(r => r.started && r.date <= today);
  const stats = { gamesPlayed: eligible.length, gamesCompleted: eligible.filter(r => r.completed).length,
    gamesSolved: eligible.filter(r => r.solved).length, perfectSolves: eligible.filter(r => r.solved && r.strikesUsed === 0).length,
    ...streakFor(eligible.filter(r => r.solved).map(r => r.date), today), domains: {} };
  for (const domain of ['micro', 'macro']) {
    const subset = eligible.filter(r => r.domain === domain);
    stats[`${domain}Played`] = subset.length;
    stats[`${domain}Solved`] = subset.filter(r => r.solved).length;
    stats.domains[domain] = { lastCompletedDate: subset.filter(r => r.completed).map(r => r.date).sort().at(-1) || null,
      lastSolvedDate: subset.filter(r => r.solved).map(r => r.date).sort().at(-1) || null,
      ...streakFor(subset.filter(r => r.solved).map(r => r.date), today) };
  }
  return stats;
}
