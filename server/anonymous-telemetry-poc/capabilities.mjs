// Canonical server foundation; HTTP routing and provider verification live in dedicated modules.
import { contractHash, stableContractJSON } from '../../audit_tools/telemetry_contract/hash.mjs';
import { validateManifest } from './measurement-contract.mjs';
import { UUID_PATTERN } from './telemetry-core.mjs';
import { requireMaintenance } from './governance.mjs';

export const CAPABILITY_LIFETIME_SECONDS = 365 * 86400;
export const ACTIVATION_MAX_BYTES = 8192;
export const INGEST_ENDPOINT = 'https://masteryquests.org/api/anonymous-telemetry-poc/v1/events';
const PREFIX = 'mqic1_';
const HEX = /^[a-f0-9]{64}$/;
const ACTIVATION_FIELDS = ['activationVersion', 'issuanceRequestId', 'allowAnonymousDataCollection',
  'gameId', 'buildId', 'buildVersion', 'schemaVersion', 'measurementContract',
  'governanceVersion', 'disclosureVersion', 'turnstileToken'];

export class CapabilityError extends Error {
  constructor(code, status = 400) { super(code); this.name = 'CapabilityError'; this.code = code; this.status = status; }
}
export function reject(code, status = 400) { throw new CapabilityError(code, status); }
export function featureFlags(env = {}) {
  return { issuance: env.CAPABILITY_ISSUANCE_ENABLED === 'true', ingest: env.CAPABILITY_INGEST_ENABLED === 'true' };
}
export function requireFeature(env, kind) {
  if (!featureFlags(env)[kind]) reject('capability_feature_disabled', 404);
}
export function boundedInteger(value, fallback, maximum = 1_000_000_000_000) {
  if (!((typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) || typeof value === 'number')) return fallback;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 && n <= maximum ? n : fallback;
}
// Provisional ceilings from the design. They are not production capacity claims.
export const LIMIT_DEFAULTS = Object.freeze({
  LIVE_PER_TUPLE: 3, ISSUES_BUILD_DAY: 10, ISSUES_GLOBAL_HOUR: 100, ISSUES_GLOBAL_DAY: 500,
  CAP_REQUESTS_MINUTE: 3000, CAP_EVENTS_MINUTE: 60000, BUILD_EVENTS_MINUTE: 90000,
  GLOBAL_REQUESTS_MINUTE: 10000, GLOBAL_EVENTS_MINUTE: 180000,
  CAP_ACCEPTED_EVENTS: 2000000, CAP_ACCEPTED_BYTES: 536870912,
  BUILD_ACCEPTED_EVENTS: 5000000, BUILD_ACCEPTED_BYTES: 1073741824,
  GLOBAL_ACCEPTED_BYTES: 2147483648
});
export function capabilityLimits(env = {}) {
  return Object.fromEntries(Object.entries(LIMIT_DEFAULTS).map(([k, v]) =>
    [k, boundedInteger(env['MQ_CAP_' + k], v, k === 'LIVE_PER_TUPLE' ? 100 : 1_000_000_000_000)]));
}
function encode(bytes) { return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
export function generateCapability(cryptoProvider = globalThis.crypto) {
  try { return PREFIX + encode(cryptoProvider.getRandomValues(new Uint8Array(32))); }
  catch { reject('capability_entropy_unavailable', 503); }
}
export function parseCapability(value) {
  if (typeof value !== 'string' || !/^mqic1_[A-Za-z0-9_-]{43}$/.test(value)) reject('ingest_not_authorized', 403);
  const encoded = value.slice(PREFIX.length);
  try {
    const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/') + '='), c => c.charCodeAt(0));
    if (bytes.length !== 32 || encode(bytes) !== encoded) reject('ingest_not_authorized', 403);
    return value;
  } catch { reject('ingest_not_authorized', 403); }
}
async function sha256(value) {
  try { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch { reject('capability_crypto_unavailable', 503); }
}
export async function hashCapability(value) { return sha256(parseCapability(value)); }
export function validateTuple(value) {
  if (!value || value.gameId !== 'faculty-composer' || typeof value.buildId !== 'string' ||
      !/^composer-[a-f0-9]{64}$/.test(value.buildId) || typeof value.buildVersion !== 'string' ||
      !HEX.test(value.buildVersion) || value.schemaVersion !== 3) reject('ingest_scope_mismatch', 403);
  return { gameId: value.gameId, buildId: value.buildId, buildVersion: value.buildVersion, schemaVersion: 3 };
}
export function matchesTuple(event, capability) {
  return event.gameId === capability.game_id && event.buildId === capability.build_id &&
    event.buildVersion === capability.build_version && event.schemaVersion === capability.schema_version;
}
export function capabilityStatus(record, policy, now) {
  if (!record || !policy || !Number.isSafeInteger(now) || now <= 0 ||
      !Number.isSafeInteger(record.issued_at) || !Number.isSafeInteger(record.expires_at) ||
      record.expires_at <= record.issued_at || now < record.issued_at) return 'invalid';
  if (record.revoked_at !== null) return 'revoked';
  if (now >= record.expires_at) return 'expired';
  if (policy.blocked_at !== null) return 'blocked';
  return 'active';
}
export function validateRuntimeManifest(manifest, manifestId, tuple) {
  validateTuple(tuple);
  try {
    validateManifest(manifest, manifestId);
    const { buildRevision, mode, modeParameters, ...base } = manifest;
    if (buildRevision !== tuple.buildVersion || contractHash(base) !== tuple.buildVersion ||
        !manifest.configuration.supportedModes.includes(mode)) reject('ingest_scope_mismatch', 403);
    return manifest;
  } catch { reject('ingest_scope_mismatch', 403); }
}
export function assertNoCredentials(value, credentials) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (credentials.some(s => typeof s === 'string' && s.length && serialized.includes(s))) reject('credential_in_payload');
}
export function validateActivationRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== ACTIVATION_FIELDS.length || Object.keys(input).some(k => !ACTIVATION_FIELDS.includes(k))) reject('invalid_activation');
  if (input.allowAnonymousDataCollection !== true) reject('collection_not_enabled');
  if (input.activationVersion !== 'mq-build-activation/1' || input.schemaVersion !== 3 ||
      input.measurementContract !== 'mq-measurement/1' || input.governanceVersion !== 'mq-governance/2' ||
      input.disclosureVersion !== 'mq-disclosure/2') reject('unsupported_version', 422);
  if (typeof input.issuanceRequestId !== 'string' || !UUID_PATTERN.test(input.issuanceRequestId) ||
      input.issuanceRequestId !== input.issuanceRequestId.toLowerCase() || typeof input.turnstileToken !== 'string' ||
      input.turnstileToken.length < 1 || input.turnstileToken.length > 2048) reject('invalid_activation');
  try { validateTuple(input); } catch { reject('invalid_activation'); }
  if (new TextEncoder().encode(JSON.stringify(input)).length > ACTIVATION_MAX_BYTES) reject('activation_too_large', 413);
  return Object.fromEntries(ACTIVATION_FIELDS.map(k => [k, input[k]]));
}
export async function readBoundedJSON(request, maximum) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') reject('unsupported_media_type', 415);
  if (request.headers.has('content-encoding')) reject('unsupported_media_type', 415);
  if (Number(request.headers.get('content-length') || 0) > maximum) reject('request_too_large', 413);
  const reader = request.body?.getReader();
  if (!reader) reject('invalid_json');
  let count = 0; const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      count += value.byteLength;
      if (count > maximum) { await reader.cancel(); reject('request_too_large', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(count); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    // Avoid recursive validator work on attacker-controlled deep objects.
    let depth = 0, quoted = false, escaped = false;
    for (const c of text) {
      if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
      else if (c === '"') quoted = true;
      else if (c === '{' || c === '[') { if (++depth > 32) reject('invalid_json'); }
      else if (c === '}' || c === ']') depth--;
    }
    return JSON.parse(text);
  } catch (error) { if (error instanceof CapabilityError) throw error; reject('invalid_json'); }
  finally { reader.releaseLock(); }
}
export async function activationDigest(input) {
  const validated = validateActivationRequest(input);
  const { issuanceRequestId, turnstileToken, ...scope } = validated;
  return sha256(stableContractJSON(scope));
}
export async function verifyActivationChallenge(input, digest, verifier) {
  if (typeof verifier !== 'function') reject('activation_unavailable', 503);
  let result;
  try { result = await verifier({ token: input.turnstileToken, idempotencyKey: input.issuanceRequestId, context: digest }); }
  catch { reject('activation_unavailable', 503); }
  if (result?.success !== true || result.action !== 'mq_build_activate' ||
      !['masteryquests.org', 'www.masteryquests.org'].includes(result.hostname) || result.cdata !== digest) reject('activation_challenge_failed', 403);
}

// Shared window SQL. Numeric limits are bound, never interpolated as SQL.
export function scopeWindow(type, key, seconds, now, increments, limits) {
  return { type, key, seconds, start: seconds ? Math.floor(now / seconds) * seconds : 0,
    ...increments, limits };
}
export function windowPredicate(w) {
  const where = 'scope_type=? AND scope_key=? AND window_seconds=? AND window_start=?';
  const key = [w.type, w.key, w.seconds, w.start];
  const clauses = [], values = [];
  for (const [column, increment, limit] of [['request_count', w.requests, w.limits.requests], ['event_count', w.events, w.limits.events], ['byte_count', w.bytes, w.limits.bytes]]) {
    if (limit === undefined) continue;
    clauses.push(`COALESCE((SELECT ${column} FROM telemetry_scope_windows WHERE ${where}),0)+?<=?`);
    values.push(...key, increment, limit);
  }
  // Window clock is part of the admission snapshot; crossing a boundary retries.
  if (w.seconds) { clauses.push(`CAST(unixepoch() / ? AS INTEGER)*?=?`); values.push(w.seconds, w.seconds, w.start); }
  return { sql: clauses.join(' AND ') || '1', values };
}
export function windowUpsert(db, w) {
  return db.prepare(`INSERT INTO telemetry_scope_windows
    (scope_type,scope_key,window_seconds,window_start,request_count,event_count,byte_count,expires_at)
    VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(scope_type,scope_key,window_seconds,window_start)
    DO UPDATE SET request_count=request_count+excluded.request_count,
      event_count=event_count+excluded.event_count,byte_count=byte_count+excluded.byte_count`)
    .bind(w.type, w.key, w.seconds, w.start, w.requests, w.events, w.bytes, w.seconds ? w.start + w.seconds * 2 : null);
}
export async function checkWindows(db, windows) {
  for (const w of windows) { const p = windowPredicate(w); if (!(await db.prepare(`SELECT (${p.sql}) AS allowed`).bind(...p.values).first()).allowed) reject('capability_rate_limited', 429); }
}
export function buildScopeKey(tuple) { return contractHash([tuple.gameId, tuple.buildId]); }
export async function databaseTime(db) {
  const now = (await db.prepare('SELECT unixepoch() AS now').first()).now;
  if (!Number.isSafeInteger(now) || now <= 0) reject('capability_clock_unavailable', 503);
  return now;
}
export function safeDatabaseError(error) {
  if (error instanceof CapabilityError) return error;
  return new CapabilityError('capability_storage_unavailable', 503);
}
export function isAdmissionRace(error) {
  return /mq_ingest_admission|expires_at > issued_at|telemetry_build_capabilities.issuance_request_id/.test(String(error?.message));
}

export async function issueBuildCapability(input, env, { verifyChallenge, afterRead } = {}) {
  requireFeature(env, 'issuance');
  const request = validateActivationRequest(input);
  const digest = await activationDigest(request);
  await verifyActivationChallenge(request, digest, verifyChallenge);
  const db = env.TELEMETRY_DB;
  if (!db) reject('activation_unavailable', 503);
  const limits = capabilityLimits(env);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      requireFeature(env, 'issuance');
      const previous = await db.prepare('SELECT activation_digest FROM telemetry_build_capabilities WHERE issuance_request_id=?').bind(request.issuanceRequestId).first();
      if (previous) reject(previous.activation_digest === digest ? 'activation_already_issued' : 'activation_conflict', 409);
      const now = await databaseTime(db);
      const policy = await db.prepare('SELECT blocked_at FROM telemetry_build_policies WHERE game_id=? AND build_id=?').bind(request.gameId, request.buildId).first();
      if (policy && policy.blocked_at !== null) reject('activation_unavailable', 403);
      const liveSQL = 'SELECT COUNT(*) AS n FROM telemetry_build_capabilities WHERE game_id=? AND build_id=? AND build_version=? AND revoked_at IS NULL AND expires_at>unixepoch()';
      if ((await db.prepare(liveSQL).bind(request.gameId, request.buildId, request.buildVersion).first()).n >= limits.LIVE_PER_TUPLE) reject('activation_rate_limited', 429);
      const windows = [scopeWindow('activation-build', buildScopeKey(request), 86400, now, { requests: 1, events: 0, bytes: 0 }, { requests: limits.ISSUES_BUILD_DAY }),
        scopeWindow('activation-global', 'global', 3600, now, { requests: 1, events: 0, bytes: 0 }, { requests: limits.ISSUES_GLOBAL_HOUR }),
        scopeWindow('activation-global', 'global', 86400, now, { requests: 1, events: 0, bytes: 0 }, { requests: limits.ISSUES_GLOBAL_DAY })];
      await checkWindows(db, windows);
      const raw = generateCapability(), hash = await hashCapability(raw), id = crypto.randomUUID();
      const predicates = windows.map(windowPredicate);
      const guard = `NOT EXISTS(SELECT 1 FROM telemetry_build_policies WHERE game_id=? AND build_id=? AND blocked_at IS NOT NULL)
        AND (${liveSQL.replace(' AS n', '')})<? AND ${predicates.map(p => '(' + p.sql + ')').join(' AND ')}`;
      const statements = [db.prepare(`INSERT INTO telemetry_build_policies(game_id,build_id,created_at) VALUES(?,?,unixepoch()) ON CONFLICT(game_id,build_id) DO NOTHING`).bind(request.gameId, request.buildId),
        db.prepare(`INSERT INTO telemetry_build_capabilities
          (capability_id,capability_hash,game_id,build_id,build_version,schema_version,issued_at,expires_at,issuance_request_id,activation_digest)
          VALUES(?,?,?,?,?,3,unixepoch(),CASE WHEN ${guard} THEN unixepoch()+? ELSE 0 END,?,?)`)
          .bind(id, hash, request.gameId, request.buildId, request.buildVersion,
            request.gameId, request.buildId, request.gameId, request.buildId, request.buildVersion, limits.LIVE_PER_TUPLE,
            ...predicates.flatMap(p => p.values), CAPABILITY_LIFETIME_SECONDS, request.issuanceRequestId, digest),
        ...windows.map(w => windowUpsert(db, w)),
        db.prepare('SELECT capability_id,issued_at,expires_at FROM telemetry_build_capabilities WHERE capability_id=?').bind(id)];
      if (afterRead) await afterRead({ attempt }); // Test scheduling only; never supplied by HTTP input.
      requireFeature(env, 'issuance');
      try {
        const results = await db.batch(statements), row = results.at(-1).results[0];
        return { ok: true, activationVersion: request.activationVersion, capability: raw, capabilityId: row.capability_id,
          issuedAt: new Date(row.issued_at * 1000).toISOString(), expiresAt: new Date(row.expires_at * 1000).toISOString(),
          endpoint: INGEST_ENDPOINT, ...validateTuple(request), governanceVersion: request.governanceVersion };
      } catch (error) { if (!isAdmissionRace(error)) throw error; if (attempt === 2) reject('activation_conflict', 409); }
    }
  } catch (error) { throw safeDatabaseError(error); }
}

// No control routes are exposed in Stage 1. Even direct helper calls require both authorities.
export async function controlCapability(request, env, action, target) {
  const supplied = String(request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || supplied !== String(env.ADMIN_TOKEN)) reject('admin_authorization_required', 401);
  requireMaintenance(request, env);
  if (!env.TELEMETRY_DB) reject('capability_storage_unavailable', 503);
  const db = env.TELEMETRY_DB;
  try {
    if (action === 'revoke') {
      if (typeof target?.capabilityId !== 'string' || !UUID_PATTERN.test(target.capabilityId)) reject('invalid_control');
      await db.batch([db.prepare('UPDATE telemetry_build_capabilities SET revoked_at=COALESCE(revoked_at,unixepoch()) WHERE capability_id=?').bind(target.capabilityId)]);
    } else if (action === 'block' || action === 'unblock') {
      if (target?.gameId !== 'faculty-composer' || !/^composer-[a-f0-9]{64}$/.test(target?.buildId || '')) reject('invalid_control');
      if (action === 'block') await db.batch([
        db.prepare('INSERT INTO telemetry_build_policies(game_id,build_id,created_at,blocked_at) VALUES(?,?,unixepoch(),unixepoch()) ON CONFLICT(game_id,build_id) DO UPDATE SET blocked_at=COALESCE(blocked_at,excluded.blocked_at)').bind(target.gameId, target.buildId),
        db.prepare('UPDATE telemetry_build_capabilities SET revoked_at=COALESCE(revoked_at,unixepoch()) WHERE game_id=? AND build_id=?').bind(target.gameId, target.buildId)]);
      else await db.batch([db.prepare('UPDATE telemetry_build_policies SET blocked_at=NULL WHERE game_id=? AND build_id=?').bind(target.gameId, target.buildId)]);
    } else reject('invalid_control');
    return { ok: true, action }; // No hashes, raw tokens, or telemetry readback.
  } catch (error) { throw safeDatabaseError(error); }
}
