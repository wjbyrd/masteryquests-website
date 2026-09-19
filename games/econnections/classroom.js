import { restoreRecord, startRecord } from './engine.js';
import { SCHEMA, UUID, TOKEN, MAX_EVENTS, validateSession, validateEvent, pinnedPuzzle, eventFields, transitionEvents } from './classroom-contract.js';

export const CLASSROOM_PREFIX = 'mq.econnections.classroom.v1.';
const PLAYER_KEY = CLASSROOM_PREFIX + 'player';
const API = '/api/econnections-classroom';
const request = (path, body) => fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(8000) });

// One writer per session for the lifetime of this document. Public tabs retain
// their existing storage-event behavior. No localStorage lock emulation/races.
async function claim(name) {
  if (!navigator.locks) return null;
  return new Promise((resolve, reject) => {
    navigator.locks.request(name, { ifAvailable: true }, lock => {
      if (!lock) { resolve(null); return; }
      return new Promise(release => resolve(release));
    }).catch(reject);
  });
}

export async function initializeClassroom(token, storage, notice) {
  if (!TOKEN.test(token)) throw new Error('This classroom link is invalid. No classroom data was sent.');
  const routeKey = CLASSROOM_PREFIX + 'route.' + token;
  let key, session, notOpen = false, unavailable = false;
  try {
    const response = await request('/resolve', { accessToken: token });
    if (response.status === 403) notOpen = (await response.json()).code === 'session_not_open';
    unavailable = [400, 403, 404, 410].includes(response.status);
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    session = validateSession(data.session);
    if (session.status === 'upcoming') { notOpen = true; throw new Error('not open'); }
    if (session.status === 'closed') throw new Error('closed');
    key = CLASSROOM_PREFIX + 'run.' + session.sessionID;
    try { storage?.setItem(routeKey, JSON.stringify(session)); } catch { /* The run's saving check fails closed if needed. */ }
  } catch {
    if (notOpen) throw new Error('Classroom session is not open yet. Reload when the student window opens, or open public daily play.');
    if (unavailable) throw new Error('No Econ-nections session is currently active for this class. Classroom play is unavailable or closed; open public daily play instead.');
    // Only previously validated metadata may support offline continuation.
    // Remote telemetry stays disabled until a future reload validates it again.
    session = null;
    try {
      const cached = validateSession(JSON.parse(storage.getItem(routeKey)));
      if (cached.status === 'open') session = cached;
    } catch { /* fail closed */ }
    if (!session) throw new Error('Classroom session unavailable or closed. Reload to try again, or open public daily play. No classroom events were sent.');
    key = CLASSROOM_PREFIX + 'run.' + session.sessionID;
    return openRun(false);
  }
  return openRun(true);

  async function openRun(remote) {
    const puzzle = pinnedPuzzle(session);
    const release = await claim(key);
    if (!release && navigator.locks) throw new Error('This classroom session is already open in another tab. Continue there, or close it and reload here.');
    let active = true, sending = false, state, durable = !!release;
    const stop = message => { remote = false; notice(message); };
    window.addEventListener('pagehide', () => { active = false; release?.(); }, { once: true });
    // A bfcache document no longer owns its writer lock.
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    try {
      if (!durable) throw new Error('No browser locks');
      const saved = storage.getItem(key);
      if (saved) {
        state = JSON.parse(saved);
        if (state.session.sessionID !== session.sessionID || state.session.puzzleID !== session.puzzleID || state.session.puzzleVersion !== session.puzzleVersion || !UUID.test(state.runID) || !UUID.test(state.playerID) || storage.getItem(PLAYER_KEY) !== state.playerID || !Array.isArray(state.queue) || !Number.isInteger(state.sequence) || state.sequence < 1 || state.sequence > MAX_EVENTS || !restoreRecord(puzzle, state.record)) throw new Error('Invalid saved classroom run');
        for (const [index, item] of state.queue.entries()) {
          validateEvent(item?.event);
          if (!Number.isInteger(item.tries) || item.tries < 0 || item.tries > 3 || item.event.sessionID !== session.sessionID || item.event.runID !== state.runID || item.event.playerID !== state.playerID || item.event.sequenceNumber !== state.sequence - state.queue.length + index + 1) throw new Error('Invalid pending classroom event');
        }
        state.record = restoreRecord(puzzle, state.record);
        state.session = session;
      } else {
        const playerID = await navigator.locks.request(PLAYER_KEY, () => {
          let id = storage.getItem(PLAYER_KEY);
          if (!UUID.test(id || '')) { id = crypto.randomUUID(); storage.setItem(PLAYER_KEY, id); }
          return id;
        });
        state = { session, playerID, runID: crypto.randomUUID(), sequence: 0, record: startRecord(puzzle), queue: [] };
        append([eventFields('session_start', state.record)]);
      }
      persist();
    } catch {
      durable = false;
      state = { session, record: startRecord(puzzle), queue: [], sequence: 0 };
      stop('Classroom saving is unavailable or damaged. You can play in this tab, but classroom reporting is disabled.');
    }
    if (state.stopped) stop('Classroom reporting was stopped for this run. You can continue the pinned puzzle locally.');
    else if (!remote) notice('Classroom reporting is unavailable. You can continue the pinned puzzle locally; no delivery is confirmed.');
    else notice('Classroom session: anonymous browser/run IDs, submitted groups, results and active time are recorded. No individual tile clicks. Delivery is pending.');

    function persist() {
      if (!durable || !active) return;
      try {
        if (storage.getItem(PLAYER_KEY) !== state.playerID) throw new Error('Browser identity was cleared');
        storage.setItem(key, JSON.stringify(state));
      }
      catch { durable = false; stop('Classroom saving failed. Gameplay continues in this tab; reporting has stopped.'); }
    }
    function append(events) {
      if (!durable || !active) return;
      if (state.sequence + events.length > MAX_EVENTS) { state.stopped = true; stop('Classroom event limit reached. Gameplay continues locally; reporting has stopped.'); return; }
      for (const fields of events) state.queue.push({ tries: 0, event: { eventID: crypto.randomUUID(), sessionID: session.sessionID, runID: state.runID, playerID: state.playerID, sequenceNumber: ++state.sequence, schemaVersion: SCHEMA, ...fields } });
    }
    async function flush() {
      if (sending || !remote || !durable || !active || state.stopped) return;
      sending = true;
      try {
        while (active && remote && durable && state.queue.length) {
          const head = state.queue[0];
          if (head.tries >= 3) { stop('Classroom delivery could not be confirmed after three attempts. Your progress remains on this browser.'); break; }
          head.tries++; persist();
          if (!durable) break;
          try {
            const response = await request('/events', { accessToken: token, event: head.event });
            const data = await response.json();
            if (!response.ok || data.eventID !== head.event.eventID || !data.serverTimestamp) {
              if (response.status >= 400 && response.status < 500 && response.status !== 429) { state.stopped = true; persist(); stop('Classroom reporting stopped: session closed or event rejected. Gameplay continues locally.'); break; }
              throw new Error('unconfirmed');
            }
            state.queue.shift(); persist();
          } catch {
            notice('Classroom delivery is pending. Gameplay continues; retries are limited.');
            if (active && remote) setTimeout(flush, head.tries * 1500);
            break;
          }
        }
        if (!state.queue.length && remote && durable) notice('Classroom events received by the server. Anonymous grouping decisions and active time only.');
      } finally { sending = false; }
    }
    const controller = {
      session, puzzle, key,
      store: {
        get: () => structuredClone(state.record),
        save(record) { if (!active) return; state.record = structuredClone(record); persist(); },
        all: () => [],
      },
      recordTransition(result, ids) {
        if (!active) return;
        state.record = structuredClone(result.record);
        append(transitionEvents(puzzle, result, ids));
        persist(); void flush();
      },
    };
    void flush();
    return controller;
  }
}
