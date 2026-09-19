# Econ-nections classroom pilot

One classroom, one private instructor token, one permanent student QR, and separate dated session occurrences. This is a dedicated Worker/D1 service using the unchanged `econnections-classroom/1` event contract. Public Econ-nections stays local-only. Managerial/Composer telemetry, `mq-measurement/1`, and its database are unchanged.

## Instructor workflow

The owner provisions a classroom once. The instructor opens **/games/econnections-class/**, enters the private classroom token, and sees the permanent QR and student URL. The input is cleared immediately, the token remains only in module memory for this page, and Lock classroom/reload discards it. It is never stored in localStorage/sessionStorage, shown after authentication, placed in URLs, included in QR content or telemetry, or logged by this application.

The activation form defaults its date to today in the classroom timezone using server time. Course-specific default wall times and timezone are editable for each activation. Choose Micro or Macro, a date, student window, walkthrough and close; Activate Session creates a fresh UUID sessionID and pins the original engine's exact puzzleID/pool version. The scheduled class time equals that occurrence's walkthrough time. Course defaults remain unchanged by overrides.

Use any calendar date. There is no Monday assumption, recurrence or automatic scheduling. Holidays require no handling: simply do not activate. Wednesday/Friday substitutions, makeup days, multiple sessions per week and multiple sessions on one date all use the **same QR**. Every session retains its own telemetry. Classroom history is not capped by a scheduling limit; individual occurrences remain subject to 730-day retention.

Only one upcoming/open occurrence may reserve a classroom. A second activation returns 409 with the existing session displayed by the console; it cannot silently create a competing occurrence. End Session closes the displayed occurrence explicitly. At its configured close time, it stops resolving even without a background job; the next activation transaction marks expired rows closed before inserting a new one. Use Refresh status to update a page left open across expiry or another instructor tab's actions. A stale End Session action targets its displayed sessionID and cannot close a newer session.

The student URL is always `/games/econnections/?classroom=<opaque course student value>`. It contains no instructor/global credential, database ID, or session-specific access token. Resolution looks up the classroom first and then its one current occurrence. A copied QR can be shared; it is an access link, **not verified student or enrollment identity**.

## Access and timing

- No current session: resolution returns 410, code `no_active_session`, and the student sees “No Econ-nections session is currently active for this class.” No browser/run ID, progress or start event is initialized. Public daily play remains an explicit alternative.
- Before studentWindowStart: resolution and ingestion return 403, code `session_not_open`. No run starts, and a cached run cannot bypass an explicit refusal.
- studentWindowStart <= server time < sessionClose: the current occurrence is playable. Reload uses that occurrence's existing run/progress.
- walkthroughStart is analytical only. A completion qualifies as pre-walkthrough only when `puzzle_complete.serverTimestamp < walkthroughStart`. Equality is late; play continues after walkthrough until close. Client elapsed time never supplies the cutoff clock.
- At/after sessionClose, or after manual close: new events are rejected. Exact retries of events already accepted for that classroom/session return their original receipt; they never become events in a later session.

The intended pilot uses America/Chicago, with classroom defaults 12:40 / 13:00 / 13:30. These are editable values in classroom.example.json, not global hardcoded times. Activation uses the IANA/DST-aware conversion in timing.mjs, extracted without changing the original algorithm. It rejects nonexistent spring-forward and ambiguous fall-back wall times instead of silently picking an offset. Sessions use same-date windows with ordered start <= walkthrough < close; overnight windows are outside this pilot. The conversion supports contemporary IANA offsets in 15-minute increments. No CST offset is hardcoded.

## Credentials and schema

Migration **0002_classroom_courses.sql** is additive. Apply 0001 first, then 0002; do not recreate the database.

| Entity | Contents |
| --- | --- |
| classroom_courses | classroomID; courseLabel; sectionLabel; timeZone; defaultStudentWindowStart/defaultWalkthroughStart/defaultSessionClose (HH:mm); instructorHash; studentToken; active/disabled status; createdAt |
| classroom_sessions | Original session metadata plus nullable classroomID foreign key. New occurrences always have a parent. |
| classroom_runs / classroom_events | Unchanged identity, raw event columns, uniqueness, foreign keys, event sequencing and receipt timestamps. |

A partial unique index on classroom_sessions(classroomID), where status is upcoming/open, is the concurrency guard. Expiry cleanup plus insert run in one D1 transaction. Upcoming occurrences reserve the slot too; this console is not a future-session scheduling system.

Three distinct privileges:

1. Global ADMIN_TOKEN: owner provisioning, instructor-token replacement, classroom disable/enable, authenticated telemetry queries/export and existing owner session close. It is supplied privately to the Worker and CLI, never the instructor screen.
2. Instructor token: a random opaque 256-bit value, returned once at provisioning or replacement. D1 stores only its SHA-256 hash. It can read its own classroom config/student URL, activate that classroom and close its occurrences. It cannot choose another classroomID, export data, change retention or administer the Worker.
3. Student value: an independent random 256-bit value identifying only a classroom. It is stored in plaintext in classroom_courses so the permanent URL can be reconstructed after any instructor login. This is intentional: it is a projected/shareable access value, not an instructor secret. Reading it from a database backup cannot grant instructor/admin privilege, but can permit joining an open classroom. Treat backups and exported records as private operational data.

Global owner routes can replace the instructor token without changing the QR, or disable a classroom to reject both instructor and student access. Re-enabling does not create a session and may expose its previously active occurrence if it has not closed. No plaintext instructor token is persisted by the service. Keep the one-time provisioning output privately; Windows file permissions follow its containing directory ACL.

Legacy per-session access is **retired**, not supported alongside the course QR. POST /admin/sessions now returns 410. Existing session rows/events survive with classroomID null and remain visible through authenticated admin queries. Their old accessHash is ignored by all student routes. New rows use an inert `retired:<sessionID>` marker in that old NOT NULL column, solely to keep the migration additive; no per-session student credential is generated. Legacy local run keys are left untouched. The old session-tools CLI rejects provisioning and directs operators to classroom-tools; its pure conversion helper is retained for compatibility.

## HTTP routes

All routes start **/api/econnections-classroom**. Instructor/student requests use exact allowed Origin, POST JSON, no-store, no cookies and no-referrer. Instructor authorization is a Bearer header, never a query parameter. Error messages are bounded and never echo supplied credentials.

| Route | Authorization / input | Result |
| --- | --- | --- |
| POST /admin/classrooms | Global admin; classroom.example.json fields | Config, permanent studentPath, once-only instructorToken |
| POST /admin/classrooms/rotate-instructor | Global admin; {classroomID} | Replacement token once; same student link |
| POST /admin/classrooms/status | Global admin; {classroomID,status} | active or disabled |
| POST /instructor/open | Instructor Bearer; {} | Only its classroom config, studentPath, current occurrence and server time |
| POST /instructor/activate | Instructor Bearer; session.example.json fields | New pinned occurrence, or 409 active_session_exists |
| POST /instructor/close | Instructor Bearer; {sessionID} | Closes only an occurrence belonging to that classroom |
| POST /resolve | {accessToken} (permanent student value) | Current session metadata and authoritative server timestamp |
| POST /events | {accessToken,event} | Original event acknowledgment; same receipt for exact retries |
| POST /admin/close | Global admin; {sessionID} | Existing owner close route |
| GET /admin/session?sessionID=... | Global admin; optional afterRun | Metadata, counts, mean completion time, up to 100 runs with solve order and nextRunCursor |
| GET /admin/run?runID=... | Global admin | Session metadata and ordered raw events |
| GET /admin/export?sessionID=... | Global admin; optional after | Spreadsheet-safe CSV up to 1000 rows; X-Next-Cursor for more |

The instructor API has no global admin privilege. Admin responses are also no-store on errors, do not permit browser CORS, and fail closed without a sufficiently long configured secret. Cross-classroom session submissions and instructor close attempts are rejected. After rotation, the old token fails on the next request. A request already authorized before revocation may finish; this is not a full account/session platform.

## One-time provisioning and local testing

From the repository root, install local tooling if not already present:

```powershell
npm.cmd install --prefix tmp/econnections/tools --no-save --package-lock=false wrangler@4
npm.cmd install --prefix tmp/econnections/qr-test --no-save --package-lock=false jsqr@1.4.0
```

Wrangler/Miniflare and the independent QR decoder are local test tools in an ignored directory. Neither is shipped to student/instructor browsers. The UI's vendored Project Nayuki v1.8.0 QR generator is MIT licensed; vendor/LICENSE.txt and vendor/README.md document its source and transformation. QR rendering occurs entirely in the browser with no service or CDN.

Create a local-only server/econnections-classroom/.dev.vars (ignored) containing a privately generated random ADMIN_TOKEN of at least 32 characters and ALLOWED_ORIGINS="http://127.0.0.1:8787". Then:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 migrations apply econnections-classroom --local --config server/econnections-classroom/wrangler.jsonc
node audit_tools/public_site_publication/build-dist.mjs
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js dev --local --config server/econnections-classroom/wrangler.jsonc --assets (Join-Path $PWD 'dist') --port 8787
```

In another terminal, provision once using the same private local admin token:

```powershell
$env:CLASSROOM_API = 'http://127.0.0.1:8787'
$env:CLASSROOM_ADMIN_TOKEN = [Net.NetworkCredential]::new('', (Read-Host 'Local admin token' -AsSecureString)).Password
node server/econnections-classroom/classroom-tools.mjs server/econnections-classroom/classroom.example.json tmp/econnections/private-classroom.json
```

The new output file contains the once-only instructorToken and permanent studentURL/studentPath. It is never printed to the terminal or overwritten. Keep it private; tmp/econnections is ignored. Open /games/econnections-class/ on the local origin, enter that instructor token, and activate occurrences through the page. Do not run the provisioning CLI for every session. session.example.json is now an example instructor activation body, not a provisioning request; replace its date before use.

For telemetry administration, use the global token in request headers rather than URLs:

```powershell
$classroomHeaders = @{ Authorization = "Bearer $env:CLASSROOM_ADMIN_TOKEN" }
# Substitute a real occurrence ID obtained from the instructor activation response.
Invoke-RestMethod "$env:CLASSROOM_API/api/econnections-classroom/admin/session?sessionID=SESSION_ID" -Headers $classroomHeaders
Invoke-WebRequest "$env:CLASSROOM_API/api/econnections-classroom/admin/export?sessionID=SESSION_ID" -Headers $classroomHeaders -OutFile tmp/econnections/events-page1.csv
```

Follow X-Next-Cursor for further CSV pages; each page includes a header. Summary means include solved and unsolved terminal runs and are null without completions. Counts are whole-session, independent of the run page. No median, verified-student denominator or research statistical analysis is claimed.

## Verification commands

Use Node 24+, Playwright and local Chrome (or BROWSER_CHANNEL/BROWSER_EXECUTABLE). PLAYWRIGHT_MODULE and MINIFLARE_MODULE can point to existing installations. JSQR_MODULE can override the test decoder path.

```powershell
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs audit_tools/econnections/classroom-tools.test.mjs
node audit_tools/econnections/content-audit.mjs
node audit_tools/econnections/content-audit.mjs --review > tmp/econnections/content-review.md
node audit_tools/public_documentation/check.cjs
node audit_tools/public_site_publication/build-dist.mjs
$env:ECON_SITE_ROOT = 'dist'
node audit_tools/econnections/browser.test.mjs
node audit_tools/econnections/classroom-browser.test.mjs
node audit_tools/econnections/classroom-publication.test.mjs
$env:WRANGLER_SEND_METRICS = 'false'
$classroomBundle = Join-Path $PWD 'tmp/econnections/worker-build'
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --dry-run --config server/econnections-classroom/wrangler.jsonc --outdir $classroomBundle
node audit_tools/econnections/classroom-runtime.test.mjs
git diff --check
```

The SQLite harness runs all migrations and the actual Worker. The workerd test uses actual local D1 and rate bindings and tests simultaneous activation conflicts. Browser tests independently decode the rendered QR, exercise the same QR through Monday/Wednesday/Friday/two same-day occurrences, and reject external requests from the instructor context. The publication check verifies the instructor/local QR assets and license are included while server source, tests, local tooling and secrets are excluded, and checks protected public/Managerial files against HEAD.

## Unchanged event, privacy and failure policies

The raw event allowlist, UUID semantics, 256-event run bound, 8192-byte body limit, three-try persisted retry budget, eight-second timeout, engine replay, ordered attempts and single terminal event remain unchanged. Types remain session_start, group_attempt, group_solved and puzzle_complete. Attempts contain four sorted stable IDs; duplicate wrong sets create raw attempts without another strike. correct on completion distinguishes four-group solve from third-strike loss. Mixture classifications, difficulty order and confusion pairs are derived later, not additional raw fields.

Each resolved occurrence uses `mq.econnections.classroom.v1.run.<sessionID>`; the course routing cache contains only the last successfully validated session metadata. Reloads keep that occurrence's runID/sequence; a later occurrence gets a new runID while playerID stays the persistent browser UUID. Public `mq.econnections.result.*` history/streaks remain separate. One writer Web Lock per occurrence protects tabs. Old tabs never relabel their events into a new session. Existing accepted-event retries can acknowledge a closed occurrence through its parent course while that course remains enabled.

Network failure never blocks the ordinary game. A previously validated open run may continue locally during an outage with reporting disabled. Explicit no-active/not-open/invalid-course responses cannot fall back to cached gameplay. Missing Web Locks, blocked saving or damaged state disable reporting and permit in-memory play after valid resolution. Clearing storage creates a new browser ID; shared browsers can share it. None of this proves unique students, enrollment, honest elapsed time or cross-device identity.

No names, email, institutional IDs, IP-derived identity, user-agent fingerprints, cookies, individual tile-click order, keystrokes, clipboard contents, screenshots or unrelated URLs are collected by the telemetry service. The application never logs tokens or event bodies. Application observability remains disabled. Hosting infrastructure can process ordinary transport metadata and the initial student URL. The projected QR is shareable by design; no anonymity, legal compliance or research authorization guarantee is added.

CSV formula prefixes, including leading whitespace/control characters, are escaped only on export. Raw D1/JSON values remain unchanged. Default retention remains **730 days after sessionClose**, with allowed bounds 1–730. The scheduled job deletes whole expired session occurrences and cascades their runs/events; it does not delete their parent classroom or permanent QR. Local browser records, provisioning files, exports and Cloudflare's independent backup/log policies are outside that retention job.

## Later owner actions — not performed by this implementation

Provision a dedicated classroom database only if none exists; never use the Managerial database. For an existing local/remote classroom database, retain it and apply both ordered migrations (already-applied migrations are skipped). The database ID placeholder must be replaced only with that dedicated database's ID before remote activation. Example owner commands, deliberately not executed here:

```powershell
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 create econnections-classroom
# Set this service's database_id to that dedicated database ID.
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js d1 migrations apply econnections-classroom --remote --config server/econnections-classroom/wrangler.jsonc
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js secret put ADMIN_TOKEN --config server/econnections-classroom/wrangler.jsonc
node tmp/econnections/tools/node_modules/wrangler/bin/wrangler.js deploy --config server/econnections-classroom/wrangler.jsonc
```

Review the two narrow API routes and exact origins, publish the updated static site through its existing process, then provision each classroom once using CLASSROOM_API=https://masteryquests.org and a privately loaded owner token. Keep instructor credentials distinct from local test values. Replace old per-session QR codes with the new permanent classroom QR. Legacy data stay queryable; there is no automatic course assignment to historical orphan sessions. Smoke-test activation, scan, submit, close and reactivation before classroom use. No remote resources, migration, deployment, account settings, production secrets or Git push were performed for this amendment.

References: [Project Nayuki QR generator](https://www.nayuki.io/page/qr-code-generator-library), [D1 transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Cloudflare rate bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
