import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createWorker } from '../../server/econnections-classroom/worker.mjs';
import { prepareSession } from '../../server/econnections-classroom/session-tools.mjs';
export const ORIGIN = 'https://classroom.test';
export function harness() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../../server/econnections-classroom/migrations/0001_classroom.sql', import.meta.url), 'utf8'));
  function prepare(sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { return sqlite.prepare(sql).get(...values) || null; },
      async all() { return { results: sqlite.prepare(sql).all(...values) }; },
      async run() { return sqlite.prepare(sql).run(...values); },
      runSync() { return sqlite.prepare(sql).run(...values); },
    };
  }
  const db = { prepare, async batch(statements) {
    sqlite.exec('BEGIN');
    try { const results = statements.map(s => s.runSync()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  } };
  let time = '2026-09-21T17:40:00.000Z';
  const worker = createWorker({ now: () => time });
  const env = { CLASSROOM_DB: db, ADMIN_TOKEN: 'local-test-only-credential-not-a-production-secret', ALLOWED_ORIGINS: ORIGIN, RETENTION_DAYS: '730', CLASSROOM_RATE: { limit: async () => ({ success: true }) }, CLASSROOM_GLOBAL_RATE: { limit: async () => ({ success: true }) } };
  const call = (path, input, options = {}) => worker.fetch(new Request(ORIGIN + '/api/econnections-classroom' + path, { method: input === undefined ? 'GET' : 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...(options.admin ? { Authorization: 'Bearer ' + env.ADMIN_TOKEN } : {}), ...options.headers }, ...(input === undefined ? {} : { body: typeof input === 'string' ? input : JSON.stringify(input) }) }), env);
  return { sqlite, db, env, worker, call, setTime: value => { time = value; }, async session(overrides = {}) {
    const wall = JSON.parse(readFileSync(new URL('../../server/econnections-classroom/session.example.json', import.meta.url), 'utf8'));
    const input = { ...prepareSession(wall, time), ...overrides };
    const response = await call('/admin/sessions', input, { admin: true });
    if (response.status !== 201) throw new Error('Fixture session failed: ' + await response.text());
    const data = await response.json();
    return { ...data, accessToken: new URL(data.studentPath, ORIGIN).searchParams.get('classroom') };
  } };
}
