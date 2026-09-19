# Econ-nections classroom telemetry implementation

Completed locally September 19, 2026. No remote deployment, remote migration, production secret, commit, or push was performed.

## Result and scope

The pilot chain is implemented: a private opaque session link resolves an exact existing puzzle; a persistent pseudonymous browser ID and independent session run produce ordered grouping attempts, group solves, and one solved/unsolved terminal event; a dedicated Worker assigns receipt timestamps and exposes authenticated reconstruction, session summaries and spreadsheet-safe CSV.

The existing engine, storage adapter, pool definitions, calendar behavior, CSS, existing tests, root deployment configuration and `server/anonymous-telemetry-poc/` are unchanged. Public daily play makes no classroom API requests and preserves daily Micro/Macro records and streaks. The new service never uses `mq-measurement/1` or the Managerial database.

## Files

Modified:

- `games/econnections/econnections.js`: explicit session bootstrap, pinned puzzle/storage adapter, transition hook and classroom-only result/navigation adjustments.
- `games/econnections/index.html`: classroom delivery notice, public-play link, no-referrer policy.
- `games/econnections/README.md`: separate classroom behavior/privacy/testing section.

Added:

- `games/econnections/classroom.js`: isolated run/progress/queue, persistent browser UUID, writer Web Lock, bounded delivery and fail-closed fallback.
- `games/econnections/classroom-contract.js`: `econnections-classroom/1`, exact field validation, session/puzzle validation and original-engine path replay.
- `server/econnections-classroom/worker.mjs`, `wrangler.jsonc`, `migrations/0001_classroom.sql`: separate service, bindings, migration and retention.
- `server/econnections-classroom/session-tools.mjs`, `session.example.json`: DST-aware wall-time conversion and private session creation CLI/sample.
- `server/econnections-classroom/README.md`, this report: operator setup, API, schema, policy and verification record.
- `audit_tools/econnections/classroom.test.mjs`, `classroom-harness.mjs`, `classroom-browser.test.mjs`, `classroom-runtime.test.mjs`: SQL/Worker, browser and real local workerd/D1 coverage.

## Storage, hooks and routes

The D1 binding is `CLASSROOM_DB`, database name `econnections-classroom`, with an intentional unprovisioned ID placeholder. Tables are `classroom_sessions` (locked metadata plus hashed random access token), `classroom_runs` (run/session/browser relation), and `classroom_events` (typed raw events and canonical retry payload). Foreign keys, event/run-sequence uniqueness, single start/completion indexes and a contiguous-sequence trigger enforce relational integrity. Session/type/time, run sequence, player/time, timestamp and event-type indexes support reconstruction. Scheduled deletion cascades whole sessions 730 days after close by default.

Hooks in `econnections.js`:

1. The classroom-only bootstrap validates `/resolve`, initializes/reuses the session run, and queues `session_start` only on fresh run creation.
2. Immediately after the existing `submitGroup(puzzle, record, [...selection])` call, `recordTransition()` saves the resulting progress and events atomically. It records every meaningful attempt, including duplicate wrong sets, before the existing duplicate early-return branch.
3. The original engine's `correct` result queues `group_solved` with its existing solved-group ID and resulting count.
4. The same engine result's terminal flag queues one `puzzle_complete`, with `correct` identifying four-group solve versus third-strike completion. No result-render or reload hook emits completion.

URLs use `/games/econnections/?classroom=<43-character random token>`. No admin credential or database identifier appears there. Public `mq.econnections.result.*` records remain separate from `mq.econnections.classroom.v1.run.<token>`. Stable tile IDs and pool versions are unchanged; submitted sets are sorted, and no click order or derived mixture classification is stored.

Routes under `/api/econnections-classroom`: `POST /resolve`, `POST /events`, authenticated `POST /admin/sessions`, `POST /admin/close`, `GET /admin/session?sessionID=...`, `GET /admin/run?runID=...`, and `GET /admin/export?sessionID=...`. Session summaries include counts and paginated per-run solve order; CSV has a continuation header. Admin responses are no-store, including errors.

Pre-walkthrough means **server receipt of `puzzle_complete` is strictly before `walkthroughStart`**. Equality is late. Active elapsed time never supplies a completion timestamp. Before `studentWindowStart`, resolution and events return HTTP 403 (`session_not_open`), with no run/progress initialization or cache bypass. Access opens exactly at `studentWindowStart`; `walkthroughStart` is analytical only. At or after `sessionClose`, resolution and new events are rejected; exact accepted-event retries retain their original receipt. IANA `America/Chicago` conversion follows seasonal offsets and rejects DST gaps/ambiguities.

## Initial verification results (before amendment)

| Check | Result |
| --- | --- |
| Existing engine/calendar plus classroom unit/integration tests | 28 passed: 18 existing, 10 new |
| Existing browser runner, source and built `dist/` | 15 checks passed on each |
| Final classroom browser runner against built `dist/` | 15 checks passed |
| Original content audit and generated `--review` sheets | Passed; all 120 boards checked |
| Public documentation check | Passed: 18 pages, 577 links, no broken links |
| Static publication build | Passed: 1,809 files, zero forbidden files |
| Wrangler 4.135.0 local dry-run bundle | Passed; 99.48 KiB uncompressed, no upload |
| Wrangler local D1 migration | Passed: 12 SQL commands, local resource only |
| Local workerd + D1 + real rate bindings | Passed: create/resolve/full solve/idempotent retry/summary/solve order/CSV/close |
| `git diff --check` | Passed |

The new checks exercise exact pinning, persistent browser UUID versus independent run UUID, one initial start, sorted stable IDs, near misses, duplicate attempts without extra strikes, correct solve order/counts, both terminal conditions, reload continuity, simultaneous conflicting/exact retries, tab ownership, public-record byte equality, server cutoff boundaries, Chicago DST, closed/invalid sessions, strict no-PII allowlists, oversized bodies, unavailable limiters, export pagination across 1,010 events, and retention cascades. Browser failures cover outages, three-attempt exhaustion across reloads, lost acknowledgments, missing Web Locks, blocked storage, storage clearing and corrupt queues. Existing assertions were not weakened.

Commands run from the repository root included:

```powershell
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs
node audit_tools/econnections/content-audit.mjs
node audit_tools/econnections/content-audit.mjs --review > tmp/econnections/content-review.md
node audit_tools/public_documentation/check.cjs
node audit_tools/public_site_publication/build-dist.mjs
$env:PLAYWRIGHT_MODULE = 'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:ECON_SITE_ROOT = 'dist'
node audit_tools/econnections/browser.test.mjs
node audit_tools/econnections/classroom-browser.test.mjs
node audit_tools/econnections/classroom-runtime.test.mjs
git diff --check
```

Playwright used local Chrome; Worker checks used Node 24.14.1, Wrangler 4.135.0 and its bundled Miniflare/workerd. The Node SQLite adapter supplements, rather than replaces, the real local D1 check. Ignored local tooling, database state, screenshots, review sheets and bundles remain outside tracked source. The initial sandboxed npm download/esbuild parent-directory probe required sandbox escalation for local tool setup; neither operation deployed anything.

## Limitations and remaining owner actions

Only one classroom tab can write per session. Other classroom tabs display a notice; closing the active tab and reloading transfers ownership. No verified student identity, roster linkage, cross-device identity, cheating detection, legal compliance certification, or research authorization is claimed. Browser storage clearing creates another browser ID; shared profiles can share an ID. Hosting infrastructure can process ordinary request metadata and the initial private URL even though this Worker stores no IP/user-agent fields and application logging is disabled.

Delivery has a persisted three-attempt limit per event, eight-second timeout, 256-event run cap and ordered queue. An exhausted/rejected event stops reporting visibly, while local gameplay continues. Without usable storage/Web Locks, reporting is disabled. Fresh visitors need valid metadata to enter the pinned classroom puzzle; public play remains available. Runs previously validated as open can continue offline without transmission; an explicit not-open refusal blocks cached resumption. Longitudinal linkage depends on local browser storage, and active elapsed time remains client-derived.

Owner work still required: create a **dedicated** D1 database; replace the placeholder ID; choose retention/origins; supply a private admin secret; deploy this separate service and its narrow routes; publish the updated static game; pre-create sessions; distribute their URLs/QRs and perform a production smoke test. Monitor retention and service failures. No scheduling dashboard or QR generator was built.

Exact provisioning/testing commands, private token handling and local asset serving are in the [operator guide](README.md). The later remote operations are deliberately separate:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 create econnections-classroom
# Replace this service's database ID with the new dedicated ID before continuing.
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 migrations apply econnections-classroom --remote --config server/econnections-classroom/wrangler.jsonc
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js secret put ADMIN_TOKEN --config server/econnections-classroom/wrangler.jsonc
$classroomBundle = Join-Path $PWD 'tmp/econnections/worker-build'
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --dry-run --config server/econnections-classroom/wrangler.jsonc --outdir $classroomBundle
node audit_tools/econnections/classroom-runtime.test.mjs
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --config server/econnections-classroom/wrangler.jsonc
```

Use the existing website publication process for static assets. These remote commands are instructions for the owner; they were not executed during implementation.

## Targeted amendment: retention and student access window

Default classroom retention changed from **90 to 730 days after session close**. The allowed 1–730-day bounds, scheduled whole-session deletion and cascading removal of runs/events are unchanged. The configuration remains independent of Managerial/Composer telemetry.

Before `studentWindowStart`, the Worker now rejects both resolution and event ingestion with HTTP **403**, code `session_not_open`, and a generic not-open message. No run, `session_start`, browser identifier or classroom progress is created. The client cannot bypass that refusal by resuming cached progress; legacy upcoming metadata also cannot enable offline continuation. At exactly `studentWindowStart`, access opens and an existing open run may reload normally.

`walkthroughStart` remains analytical only: completion receipt strictly before it is pre-walkthrough; equality is late. Access continues until the hard `sessionClose` boundary. Existing closed-session rejection and exact accepted-event retry acknowledgments are preserved. Time conversion remains IANA/DST-aware (`America/Chicago` for the pilot), including rejection of ambiguous/nonexistent local times; no hardcoded offset was introduced.

Exactly these 10 tracked files changed in the amendment:

- `games/econnections/classroom.js`
- `games/econnections/README.md`
- `server/econnections-classroom/worker.mjs`
- `server/econnections-classroom/wrangler.jsonc`
- `server/econnections-classroom/README.md`
- `server/econnections-classroom/IMPLEMENTATION_REPORT.md`
- `audit_tools/econnections/classroom.test.mjs`
- `audit_tools/econnections/classroom-harness.mjs`
- `audit_tools/econnections/classroom-browser.test.mjs`
- `audit_tools/econnections/classroom-runtime.test.mjs`

Amendment verification: the engine/calendar/classroom command above passed **29 tests**; public and classroom browser runners against rebuilt `dist/` passed **15 and 17 checks**, respectively. Both content-audit commands, public documentation checks, static build (1,809 files; zero forbidden files), rebuilt Worker dry-run (Wrangler 4.135.0; 99.70 KiB), local workerd/D1 runtime check and `git diff --check` passed. The same local Playwright/Chrome configuration was used. New boundary coverage includes one millisecond before opening, exact opening, both sides of walkthrough, one millisecond before close, exact close and after close, plus cached-run refusal. Retention tests verify survival beyond a semester and through 730 days, then complete cascade deletion after that horizon; invalid bounds still fail.

Public Econ-nections runtime files, engine, ordinary storage and existing tests were not changed; public play remains local-only. Existing Managerial/Composer telemetry files and behavior remain untouched. No schema changes, remote migration, remote deployment, new remote resources, commit amendment or push occurred. The revisions are left uncommitted for the repository owner's review.
