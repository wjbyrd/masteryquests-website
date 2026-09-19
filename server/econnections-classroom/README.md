# Econ-nections classroom pilot

Dedicated Worker and D1 database for `econnections-classroom/1`. This directory is source-only and excluded by the existing static publication builder and `.assetsignore`. No deployment, D1 provisioning, account change, production credential, or Managerial/Composer telemetry change is included.

## Local verification

From the repository root, with Node 24+:

```powershell
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs
node audit_tools/econnections/content-audit.mjs
node audit_tools/econnections/browser.test.mjs
node audit_tools/econnections/classroom-browser.test.mjs
node audit_tools/public_documentation/check.cjs
```

The browser runners need Playwright and Chrome (or `BROWSER_CHANNEL`/`BROWSER_EXECUTABLE`). Set `PLAYWRIGHT_MODULE` to an existing Playwright installation, or install it in ignored local tooling. Tests use synthetic sessions, in-memory SQLite with the actual migration, an adapter matching the D1 API, and the real Worker route handlers. They do not contact Cloudflare. See the implementation report for the exact results and additional runtime checks.

## Owner setup commands — not run remotely by this implementation

The root static site and existing Worker configuration are not changed. This service must be deployed separately and attached to the two narrowly scoped API routes in this directory's configuration. Verify these paths do not overlap an existing zone route before activation.

Install Wrangler locally if necessary. The following keeps tooling under an ignored directory:

```powershell
npm.cmd install --prefix tmp/econnections/tools --no-save --package-lock=false wrangler@4
```

For local development, create `server/econnections-classroom/.dev.vars` (already ignored) containing a **local-only** random `ADMIN_TOKEN` of at least 32 characters and `ALLOWED_ORIGINS="http://127.0.0.1:8787"`. Do not commit this file. Then:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 migrations apply econnections-classroom --local --config server/econnections-classroom/wrangler.jsonc
node audit_tools/public_site_publication/build-dist.mjs
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js dev --local --config server/econnections-classroom/wrangler.jsonc --assets (Join-Path $PWD 'dist') --port 8787
```

Keep that terminal running. In another PowerShell terminal, load the same local token privately and create a session:

```powershell
$env:CLASSROOM_API = 'http://127.0.0.1:8787'
$env:CLASSROOM_ADMIN_TOKEN = [Net.NetworkCredential]::new('', (Read-Host 'Local admin token' -AsSecureString)).Password
node server/econnections-classroom/session-tools.mjs server/econnections-classroom/session.example.json tmp/econnections/private-session.json
```

Adjust the example's date, wall times, labels and puzzle ID before use if the sample session has passed. The output's `studentPath` is the private link to open on the local origin. A QR code may encode that exact URL using an instructor's existing QR tool. No QR service or token-bearing external request is needed by this implementation. Keep session output files private and outside source control; `tmp/econnections/` is ignored. Windows file permissions follow the containing directory's ACL; the CLI's `0600` mode is not an independent Windows ACL guarantee.

Later, when the owner elects to provision the pilot:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 create econnections-classroom
```

Replace **only** `REPLACE_WITH_DEDICATED_D1_ID` in this service's configuration with that newly created database's ID. Never reuse the Managerial telemetry database or binding. Then run, deliberately and separately:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 migrations apply econnections-classroom --remote --config server/econnections-classroom/wrangler.jsonc
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js secret put ADMIN_TOKEN --config server/econnections-classroom/wrangler.jsonc
$classroomBundle = Join-Path $PWD 'tmp/econnections/worker-build'
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --dry-run --config server/econnections-classroom/wrangler.jsonc --outdir $classroomBundle
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --config server/econnections-classroom/wrangler.jsonc
```

`secret put` should receive a privately generated production credential, distinct from the local token. No credential belongs in URLs. Set `CLASSROOM_API` to `https://masteryquests.org`, privately load that admin credential, and use the same session-creation command with a fresh output filename. Publish the updated static assets through the repository's existing site process. Confirm the deployed browser/Worker share supported immutable pool versions, origin rules, rate bindings and scheduled retention; perform the win/loss/reload smoke tests before distributing the QR link. Neither the configuration placeholder nor a passing local test means that production is ready.

The dry-run is also safe before provisioning. After it, run `node audit_tools/econnections/classroom-runtime.test.mjs` for an in-memory workerd/D1/rate-binding integration check. It uses the local Miniflare bundled with Wrangler (or `MINIFLARE_MODULE`) and creates no remote database. Wrangler 4.135.0 was used for the implementation verification; rerun the local checks if using a different version.

## Sessions and timing

`session.example.json` uses local wall-clock strings and `America/Chicago`. `session-tools.mjs` converts them with the runtime's IANA timezone database, validates the full schema, and posts canonical UTC instants. It rejects nonexistent spring-forward times and ambiguous fall-back times rather than selecting an offset silently. It supports contemporary IANA offsets in 15-minute increments. Direct API callers must supply canonical `YYYY-MM-DDTHH:mm:ss.sssZ` instants and are responsible for converting intended wall times correctly; `timeZone` must be an IANA region and the scheduled instant must map to `sessionDate` there. No CST offset is hardcoded.

The example Monday September 21, 2026 session has intended warmup at 12:40, walkthrough/scheduled start at 13:00, and close at 13:30 Chicago time, within the proposed 13:00–14:00 class meeting. The session pins `econnections:2:2026-09-21:micro`; it need not match a student's local date. Both broad Micro and Macro puzzles and retained pool versions are supported through the original engine.

- Before `studentWindowStart`, status is upcoming/not open. Even a valid private link returns HTTP 403 with code `session_not_open` and a generic not-open message from resolution and ingestion. No run, start event or classroom progress is initialized. At exactly `studentWindowStart`, access opens; it remains open while server time is earlier than `sessionClose`. An authoritative early refusal cannot fall back to cached progress. An open run can reload/resume during that window.
- `walkthroughStart` is the analytical cutoff. A completion qualifies only when its Worker-generated receipt is **strictly earlier**. Equality is late. The walkthrough is analytical only and does not close access. `elapsedMs` is active client time and never determines eligibility.
- New events and resolution are rejected at or after `sessionClose`, or immediately after an authenticated manual close. There is no backdating or grace period. An exact retry of an existing event can still retrieve its original acknowledgment; no additional row is written.
- Session metadata and puzzle identity are immutable after creation, except status can be closed. Create a new session for a correction. Readable IDs are unique; each session gets a separate cryptographically random 256-bit access token, stored only as SHA-256 in D1 and returned once. An accidentally lost token requires a replacement session.

## HTTP routes

All routes start `/api/econnections-classroom`. Student routes require a configured exact `Origin`; they use POST JSON, `credentials: omit`, no-store, and no-referrer. No third-party API host is configurable in the student client.

| Method/path | Input | Output |
| --- | --- | --- |
| POST `/resolve` | `{accessToken}` | Validated session metadata, effective status and server timestamp |
| POST `/events` | `{accessToken,event}` | `{ok,eventID,serverTimestamp}`; same acknowledgment for exact retries |
| POST `/admin/sessions` | All session fields except server-assigned `createdAt` | Session plus once-only private `studentPath` |
| POST `/admin/close` | `{sessionID}` | Closed status |
| GET `/admin/session?sessionID=...` | Optional `afterRun` cursor | Metadata, whole-session counts, mean elapsed completion time, up to 100 run IDs/browser IDs and their ordered group solves; `nextRunCursor` |
| GET `/admin/run?runID=...` | Run ID | Session metadata plus all events in sequence order |
| GET `/admin/export?sessionID=...` | Optional numeric `after` row cursor | Spreadsheet-safe CSV, up to 1000 rows; `X-Next-Cursor` is empty on the final page |

Admin routes require `Authorization: Bearer <ADMIN_TOKEN>` and send no-store on success and failure. An unset/short token fails closed. Use headers in a local script/client, never credentials in query strings. Admin routes do not allow browser CORS. For example, with the private environment variables above:

```powershell
$classroomHeaders = @{ Authorization = "Bearer $env:CLASSROOM_ADMIN_TOKEN" }
Invoke-RestMethod "$env:CLASSROOM_API/api/econnections-classroom/admin/session?sessionID=econ-monday-2026-09-21-section-a" -Headers $classroomHeaders
Invoke-WebRequest "$env:CLASSROOM_API/api/econnections-classroom/admin/export?sessionID=econ-monday-2026-09-21-section-a" -Headers $classroomHeaders -OutFile tmp/econnections/events-page1.csv
```

Follow `X-Next-Cursor` to export additional CSV pages; each page includes a header. The mean includes both solved and unsolved terminal runs and is `null` without completions. Counts are global to the session, independent of the run page. No median or student participation percentage is claimed. The solve path includes sequence numbers, stable group IDs, active times and receipt times; complete raw paths come from `/admin/run` or the CSV.

## Contract and database

`games/econnections/classroom-contract.js` is the shared versioned validator, with no dependency on the other telemetry POC. Each event has exactly:

`eventID`, `sessionID`, `runID`, `playerID`, `eventType`, `sequenceNumber`, `elapsedMs`, `selectedTileIds`, `correct`, `oneAway`, `groupID`, `groupsSolvedCount`, `schemaVersion`.

The Worker adds `serverTimestamp`; a client-supplied value is rejected. Relational session metadata supplies `puzzleID` and `puzzleVersion`. CSV includes both. UUIDs are random v4; sequences start at one. Non-attempt tile arrays are empty, non-solve group IDs are null, and non-attempt `oneAway` is false. `correct` is null on start, attempt success on `group_attempt`, true on `group_solved`, and **fully solved** on terminal `puzzle_complete`. A terminal loss therefore has `correct:false` and fewer than four solved groups. `groupsSolvedCount` is the resulting count (unchanged on a wrong/duplicate attempt).

An engine transition writes the raw attempt first, then a solve event when applicable, then terminal completion. Repeating a wrong set still creates a raw attempt while leaving engine strikes/attempt history unchanged. Stable IDs are lexically sorted as a set of four; no click order is retained. Group mixtures, difficulty order and confusion pairs are analytical products, never stored as extra behavioral fields.

Migration `0001_classroom.sql` creates:

- `classroom_sessions`: all 14 session fields and a unique access-token hash.
- `classroom_runs`: minimal run/session/browser identity relation, one run per browser ID per session. No duplicated summary totals.
- `classroom_events`: indexed typed columns and a canonical payload for exact-content retry comparison/replay. The payload deliberately repeats only the small event contract, not session metadata. Unique event IDs, unique `(runID,sequenceNumber)`, one start/terminal per run, foreign keys, and a contiguous-sequence trigger protect identity/order. Indexes cover session/type/time, run sequence, player/time, overall time and event type.

The service validates paths by replaying the original `submitGroup()` engine and expecting its exact attempt/solve/terminal sequence. SQL transactional batches prevent orphan starts and protect concurrent writes. Exact duplicate retries return HTTP 200; conflicting IDs/sequence/content return 409. Invalid shape is 400, not-open/origin/auth 403/403/401, oversize body 413, rate limit 429, closed new traffic 410, missing access 404, unavailable bindings 503. Other errors are generic and do not echo sensitive inputs. Unknown contract fields/versions are rejected; a future schema needs explicit client/server compatibility work. Published pool definitions must remain available to interpret old paths.

Example read-only SQL analyses:

```sql
SELECT runID FROM classroom_events WHERE sessionID = ? AND eventType = 'session_start';
SELECT e.* FROM classroom_events e JOIN classroom_sessions s USING(sessionID)
 WHERE e.sessionID = ? AND eventType = 'puzzle_complete' AND serverTimestamp < s.walkthroughStart;
SELECT * FROM classroom_events WHERE runID = ? ORDER BY sequenceNumber;
SELECT groupID, sequenceNumber FROM classroom_events
 WHERE runID = ? AND eventType = 'group_solved' ORDER BY sequenceNumber;
SELECT selectedTileIds, COUNT(*) AS attempts FROM classroom_events
 WHERE sessionID = ? AND eventType = 'group_attempt' GROUP BY selectedTileIds ORDER BY attempts DESC;
```

## Bounds, privacy and failure policy

Bodies are streamed with an 8192-byte limit; one event per request, no batching. A run has at most 256 events and each active elapsed value is an integer from zero to 24 hours. Cloudflare rate bindings apply 120 requests/minute per browser ID (resolution uses the access-token hash), plus 3000 requests/minute for the service per Cloudflare location. Missing limiters fail closed. These are operational limits, not a verified-student or bot-proof admission system. A holder can share a session link or clear storage; browser IDs are pseudonymous, not authenticated people. Engine-valid submissions are not proof of learning or honest active time.

The browser holds one Web Lock per session across its lifetime, persists progress and queued events in one localStorage write, and retains event UUIDs, sequence and retry counts on reload. Only the first tab can participate; a second tab must wait by closing/reloading manually. bfcache return reloads and reacquires ownership. Without Web Locks, corrupted state or usable local saving, reporting fails closed and the validated puzzle remains playable in memory. Storage cleared during play stops the old run's reporting; a later fresh load creates new identifiers.

Transmission starts only after metadata validation. At most three tries per queued event are permitted across reloads, with an eight-second timeout and short bounded retry delays. Events are sent in order; an exhausted/rejected head stops later reporting rather than creating a misleading partial sequence. Accepted events cannot be recalled by clearing local storage. Delivery success is displayed only after a server acknowledgment with the matching event ID. An outage after initialization preserves local play; metadata previously validated as open permits local-only continuation during an outage, but an explicit `session_not_open` refusal prevents starting or resuming even a cached run. Legacy upcoming metadata does not enable offline continuation. A first-time visitor without validated metadata gets a public-play link. No telemetry failure is used to prevent access to the ordinary game.

The implementation does not persist names, email, institutional IDs, IP identity, raw user agents, fingerprints, cookies, clipboard contents, keystrokes, tile click order, screen contents or unrelated URLs. Student fetches omit credentials and referrers; the game page's referrer policy also prevents its token-bearing URL from being forwarded in link/resource referrers. Hosting platforms may still process transport metadata and the initial private URL; the Worker has application observability disabled and never logs request bodies or tokens. Treat links, browser IDs, event exports and raw decision paths as private pilot data, not a guarantee of anonymity or legal/research compliance.

CSV formula prefixes (including leading whitespace/control characters) are escaped only in exports; raw JSON and D1 values remain unchanged. Daily scheduled retention deletes sessions 730 days after close by default and cascades all associated runs/events. Retention must be an integer 1–730 days or the job fails; monitor scheduled-run failures using platform operations. Whole-session deletion preserves complete paths while data exists. Cloudflare's independent backups/log retention and local browser/export retention are outside this job; local progress persists until cleared.

Cloudflare references: [D1 transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [rate limiter scope and bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).
