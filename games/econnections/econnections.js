import { createPuzzle, startRecord, submitGroup, summarize, localDate, shuffled, validatePool } from './engine.js';
import { displayDate } from './calendar-date.js';
import { createStore, STORAGE_PREFIX } from './storage.js';

const $ = id => document.getElementById(id);
const domainName = domain => domain === 'micro' ? 'Micro' : 'Macro';
const niceDate = displayDate;
const duration = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
let today = localDate(), puzzle = null, record = null, selection = new Set(), lastTick = null;
let storage;
try { storage = window.localStorage; } catch { /* The store supplies a visible warning and an in-memory fallback. */ }
const store = createStore(storage, message => { $('storage-warning').textContent = message; $('storage-warning').hidden = false; });

function statsMarkup(target, entries) {
  target.replaceChildren(...entries.map(([value, label]) => {
    const item = document.createElement('div'); item.className = 'stat';
    const strong = document.createElement('strong'); strong.textContent = value;
    const caption = document.createElement('span'); caption.textContent = label;
    item.append(strong, caption); return item;
  }));
}
function updateLanding() {
  $('daily-date').textContent = niceDate(today);
  for (const domain of ['micro', 'macro']) {
    const saved = store.get(createPuzzle(domain, today));
    $(`${domain}-status`).textContent = saved?.solved ? '✓ Solved today · View results' : saved?.completed ? 'Completed today · View results' : saved ? 'In progress · Continue' : 'Not played today · Play';
  }
  const stats = summarize(store.all(), today);
  statsMarkup($('landing-stats'), [[stats.currentStreak, 'Current streak'], [stats.bestStreak, 'Best streak'], [stats.gamesPlayed, 'Played'], [stats.gamesCompleted, 'Completed'], [stats.gamesSolved, 'Solved'], [stats.perfectSolves, 'Perfect solves']]);
}
// Pull newer progress before a local write. Storage events handle other tabs too.
function syncRecord() {
  if (!record) return false;
  const fresh = store.get(puzzle);
  if (!fresh) return false;
  const changed = JSON.stringify(fresh.attempts) !== JSON.stringify(record.attempts);
  if (fresh.attempts.length >= record.attempts.length) {
    const elapsed = Math.max(record.elapsedTimeMs, fresh.elapsedTimeMs);
    record = fresh;
    record.elapsedTimeMs = elapsed;
    if (changed) selection.clear();
  }
  return changed;
}
function captureTime() {
  const now = performance.now();
  if (record && !record.completed && !document.hidden && lastTick !== null) record.elapsedTimeMs += Math.max(0, now - lastTick);
  lastTick = record && !record.completed && !document.hidden ? now : null;
}
function saveProgress() {
  if (!record) return;
  const changed = syncRecord();
  captureTime(); store.save(record);
  if (changed) renderGame();
}
function checkDay() {
  const date = localDate();
  if (date === today) return false;
  saveProgress(); today = date; puzzle = null; record = null; selection.clear(); lastTick = null;
  document.body.classList.remove('playing');
  $('game').hidden = true; $('landing').hidden = false;
  $('day-notice').textContent = 'A new day has begun. Today’s Micro and Macro puzzles are ready; earlier progress is kept in your local history.';
  $('day-notice').hidden = false;
  updateLanding(); $('landing-title').focus(); return true;
}
function openDomain(domain) {
  checkDay(); saveProgress();
  puzzle = createPuzzle(domain, today); record = store.get(puzzle) || startRecord(puzzle);
  selection.clear(); lastTick = record.completed || document.hidden ? null : performance.now();
  store.save(record);
  document.body.classList.add('playing');
  $('day-notice').hidden = true;
  $('landing').hidden = true; $('game').hidden = false;
  $('feedback').textContent = ''; $('feedback').className = 'feedback';
  $('share-fallback').hidden = true; $('share-status').textContent = '';
  renderGame(); $('game-title').focus();
}
function updateSelection() {
  for (const tile of $('tile-board').children) tile.setAttribute('aria-pressed', String(selection.has(tile.dataset.tileId)));
  $('selection-count').hidden = record.solved;
  $('selection-count').textContent = record.solved ? '' : record.completed ? 'Puzzle complete' : `${selection.size} / 4 selected`;
  $('submit').disabled = selection.size !== 4 || record.completed;
  $('deselect').disabled = selection.size === 0 || record.completed;
}
function renderGame() {
  $('game-title').textContent = `${domainName(puzzle.domain)} connections`;
  $('domain-label').textContent = puzzle.domain.toUpperCase();
  $('puzzle-date').textContent = niceDate(puzzle.date);
  $('solved-groups').replaceChildren();
  for (const group of puzzle.groups.filter(g => record.completed || record.solvedGroupIds.includes(g.id)).sort((a, b) => a.difficulty - b.difficulty)) {
    const card = document.createElement('article'); card.className = 'connection'; card.dataset.difficulty = group.difficulty;
    const meta = document.createElement('span'); meta.className = 'connection-meta'; meta.textContent = `${record.solvedGroupIds.includes(group.id) ? 'Connected' : 'Revealed'} / Difficulty ${group.difficulty} of 4`;
    const title = document.createElement('h3'); title.textContent = group.title;
    const terms = document.createElement('p'); terms.className = 'connection-terms'; terms.textContent = group.tiles.join(' · ');
    const explanation = document.createElement('p'); explanation.className = 'connection-explanation'; explanation.textContent = group.explanation;
    card.append(meta, title, terms, explanation); $('solved-groups').append(card);
  }
  $('tile-board').replaceChildren();
  if (!record.completed) for (const id of record.tileOrder) {
    const tile = puzzle.tiles.find(t => t.id === id);
    if (record.solvedGroupIds.includes(tile.groupId)) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'tile'; button.textContent = tile.label; button.dataset.tileId = id;
    button.setAttribute('aria-pressed', 'false'); $('tile-board').append(button);
  }
  const dots = document.createElement('span'); dots.className = 'strike-dots'; dots.setAttribute('aria-hidden', 'true'); dots.textContent = '●'.repeat(3 - record.strikesUsed) + '○'.repeat(record.strikesUsed);
  $('attempts').replaceChildren(dots, document.createTextNode(`${3 - record.strikesUsed} strikes remaining`));
  $('group-count').textContent = `${record.groupsSolved} / 4 connected`;
  $('actions').hidden = record.completed; $('results').hidden = !record.completed;
  $('tile-board').hidden = record.completed;
  updateSelection();
  if (record.completed) renderResults();
}
function renderResults() {
  const stats = summarize(store.all(), today);
  $('result-eyebrow').hidden = record.solved;
  $('result-eyebrow').textContent = record.solved ? '' : 'DAILY PUZZLE COMPLETE';
  $('result-title').textContent = record.solved ? 'Four Econ-nections. Nicely done.' : 'Completed, not solved.';
  $('result-description').hidden = record.solved;
  $('result-description').textContent = record.solved ? '' : `You found ${record.groupsSolved} of 4 connections. The remaining groups are revealed above with their explanations.`;
  $('result-return').hidden = record.solved;
  statsMarkup($('result-stats'), [[duration(record.elapsedTimeMs), 'Active time'], [`${record.strikesUsed} / 3`, 'Strikes used'], [stats.currentStreak, 'Current streak'], [stats.bestStreak, 'Best streak']]);
  const other = puzzle.domain === 'micro' ? 'macro' : 'micro';
  $('other-domain').textContent = `${store.get(createPuzzle(other, today))?.completed ? 'View' : 'Play'} today’s ${domainName(other)}`;
}
function announce(message, miss = false) { $('feedback').textContent = message; $('feedback').className = `feedback${miss ? ' miss' : ''}`; }

$('tile-board').addEventListener('click', event => {
  const tile = event.target.closest('.tile');
  if (!tile || checkDay()) return;
  if (syncRecord()) { renderGame(); announce('Progress updated from another tab.'); return; }
  const id = tile.dataset.tileId;
  if (selection.has(id)) selection.delete(id);
  else if (selection.size < 4) selection.add(id);
  else { announce('Four selected. Deselect a tile to choose another.'); return; }
  updateSelection();
});
$('tile-board').addEventListener('keydown', event => {
  const buttons = [...$('tile-board').children], index = buttons.indexOf(event.target);
  if (index < 0) return;
  const columns = getComputedStyle($('tile-board')).gridTemplateColumns.split(' ').length;
  const movements = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
  if (event.key in movements) { event.preventDefault(); buttons[(index + movements[event.key] + buttons.length) % buttons.length].focus(); }
  if (event.key === 'Escape') { selection.clear(); updateSelection(); announce('Selection cleared.'); }
});
$('deselect').addEventListener('click', () => { if (checkDay()) return; selection.clear(); updateSelection(); $('tile-board').firstElementChild?.focus(); announce('Selection cleared.'); });
$('shuffle').addEventListener('click', () => {
  if (checkDay()) return;
  saveProgress(); if (record.completed) return;
  const oldOrder = [...record.tileOrder];
  const seed = globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? Date.now();
  record.tileOrder = shuffled(oldOrder, seed);
  store.save(record); renderGame(); announce('Tiles shuffled. Your selection is kept.');
});
$('submit').addEventListener('click', () => {
  if (checkDay()) return;
  if (syncRecord()) { renderGame(); announce('Progress updated from another tab. Select your next group.'); return; }
  captureTime();
  const result = submitGroup(puzzle, record, [...selection]);
  const hint = result.nearMiss ? ' 1 away.' : '';
  if (result.kind === 'duplicate') { announce(`You already tried this set. No extra strike; try a different connection.${hint}`); return; }
  if (result.kind === 'invalid' || result.kind === 'finished') return;
  record = result.record;
  if (result.kind === 'correct') selection.clear();
  if (record.completed) { selection.clear(); lastTick = null; }
  store.save(record); renderGame();
  if (record.completed) {
    // Focusing the single result heading announces success without a second message.
    announce(record.solved ? '' : `Third strike. Remaining connections revealed.${hint}`);
    $('result-title').focus();
  } else if (result.kind === 'correct') {
    const group = puzzle.groups.find(g => g.id === record.solvedGroupIds.at(-1));
    announce(`Connected: ${group.title}. ${group.explanation}`); $('tile-board').firstElementChild?.focus();
  } else {
    announce(`That set does not form a connection.${hint} ${3 - record.strikesUsed} strikes remaining. Change your selection to try again.`, true);
    $('tile-board').classList.remove('miss'); void $('tile-board').offsetWidth; $('tile-board').classList.add('miss');
  }
});
$('choose-domain').addEventListener('click', () => {
  saveProgress(); record = null; puzzle = null; selection.clear(); lastTick = null;
  document.body.classList.remove('playing');
  checkDay(); $('game').hidden = true; $('landing').hidden = false; updateLanding(); $('landing-title').focus();
});
document.querySelectorAll('[data-domain]').forEach(button => button.addEventListener('click', () => openDomain(button.dataset.domain)));
$('other-domain').addEventListener('click', () => openDomain(puzzle.domain === 'micro' ? 'macro' : 'micro'));
$('share').addEventListener('click', async () => {
  const summary = `Econ-nections · ${domainName(puzzle.domain)} · ${puzzle.date}\n${record.solved ? 'Solved' : 'Completed, not solved'} · ${record.groupsSolved}/4 connections\n${record.strikesUsed}/3 strikes · ${duration(record.elapsedTimeMs)}\n${new URL('/games/econnections/', location.origin).href}`;
  try { await navigator.clipboard.writeText(summary); $('share-status').textContent = 'Spoiler-free results copied.'; }
  catch { $('share-fallback').hidden = false; $('share-text').value = summary; $('share-text').focus(); $('share-text').select(); $('share-status').textContent = 'Select and copy the summary below.'; }
});
document.addEventListener('visibilitychange', () => {
  // Account for the final visible interval before suspending the active timer.
  if (document.hidden) {
    if (record && !record.completed && lastTick !== null) record.elapsedTimeMs += Math.max(0, performance.now() - lastTick);
    lastTick = null; saveProgress();
  } else { checkDay(); if (record) { syncRecord(); renderGame(); lastTick = record.completed ? null : performance.now(); } else updateLanding(); }
});
window.addEventListener('pagehide', saveProgress);
window.addEventListener('storage', event => {
  if (event.key !== null && !event.key.startsWith(STORAGE_PREFIX)) return;
  if (checkDay()) return;
  if (record) { if (syncRecord()) { renderGame(); if (record.completed) lastTick = null; announce('Progress updated from another tab.'); } }
  else updateLanding();
});
const poolErrors = validatePool();
if (poolErrors.length) {
  $('landing').hidden = true; $('storage-warning').hidden = false;
  $('storage-warning').textContent = 'The puzzle library could not be loaded. Please try again later.';
  console.error(poolErrors);
} else {
  updateLanding();
  setInterval(() => { if (!checkDay()) saveProgress(); }, 5000);
}
