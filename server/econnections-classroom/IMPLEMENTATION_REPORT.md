# Econ-nections classroom course-access amendment

Implemented locally before push. **One instructor token → one permanent QR → one active dated occurrence → unchanged telemetry tied to a unique sessionID.** This report supersedes the former per-occurrence student-link description.

## Result

The new activation console is at **/games/econnections-class/**. A private course-scoped instructor token opens its classroom configuration and permanent QR. Micro/Macro, date, timezone and wall times are editable for each activation. The default date uses server time in the classroom's timezone. Every activation creates a fresh session UUID and pins the existing engine's exact puzzle ID and pool version. No weekday, recurrence, roster, faculty-account or topical-puzzle system was added.

The permanent student URL identifies a classroom, never a historical session. No active occurrence means no student run/progress/start event. Explicit no-active/not-open responses cannot resume cached gameplay. A current occurrence uses its own local run key and existing event sequencing. Monday, Wednesday, Friday and two non-overlapping same-day occurrences use the identical QR but remain separate analytical datasets.

## Added files

- games/econnections-class/index.html
- games/econnections-class/classroom.css
- games/econnections-class/classroom.js
- games/econnections-class/vendor/qrcodegen.js
- games/econnections-class/vendor/LICENSE.txt
- games/econnections-class/vendor/README.md
- server/econnections-classroom/migrations/0002_classroom_courses.sql
- server/econnections-classroom/courses.mjs
- server/econnections-classroom/timing.mjs
- server/econnections-classroom/classroom-tools.mjs
- server/econnections-classroom/classroom.example.json
- audit_tools/econnections/classroom-publication.test.mjs
- audit_tools/econnections/classroom-tools.test.mjs

## Modified files

- games/econnections/classroom.js — resolve course → current occurrence; store progress by sessionID and route metadata separately; reject explicit no-active responses.
- games/econnections/README.md — permanent QR workflow and occurrence isolation.
- server/econnections-classroom/worker.mjs — course lookup, scoped instructor routes, owner provisioning/revocation, retirement of session-token creation.
- server/econnections-classroom/session-tools.mjs — retain conversion exports; reject the retired provisioning CLI.
- server/econnections-classroom/session.example.json — now an instructor activation-body example.
- server/econnections-classroom/README.md — current workflow, schema, routes, provisioning, security and commands.
- server/econnections-classroom/IMPLEMENTATION_REPORT.md — this report.
- audit_tools/econnections/classroom-harness.mjs — all ordered migrations and course/activation fixtures.
- audit_tools/econnections/classroom.test.mjs — retained telemetry tests plus course authorization, timing, exclusivity, migration and multi-occurrence tests.
- audit_tools/econnections/classroom-browser.test.mjs — retained browser checks plus instructor/QR and repeated-use flows.
- audit_tools/econnections/classroom-runtime.test.mjs — real local workerd/D1 checks for the course layer and competing activations.

## Database and credentials

Migration 0002 adds **classroom_courses** with classroomID, courseLabel, sectionLabel, timeZone, defaultStudentWindowStart/defaultWalkthroughStart/defaultSessionClose, instructorHash, permanent studentToken, active/disabled status and createdAt. It adds a classroomID foreign key to the existing session table. Historical orphan sessions and raw events are preserved. New sessions always have a classroom parent.

A partial unique index allows only one upcoming/open session row per classroom. Activation transactionally closes expired rows and inserts a new occurrence. Simultaneous activations yield one success and one 409 conflict, including when the current occurrence is upcoming. End Session targets the displayed session ID and cannot accidentally close a newer occurrence. A time-expired occurrence stops resolving immediately; no scheduled job is needed to enforce close.

Global ADMIN_TOKEN, instructor token and student value remain distinct. Instructor tokens are random opaque 256-bit values; only SHA-256 hashes are stored in D1. They authorize their own classroom config, activation and close, with POST, exact-origin checks and no-store responses. They do not authorize global administration, other classrooms or exports. Owner routes can replace an instructor token without changing the QR or disable a classroom.

The independent permanent student value is also random 256-bit. It is intentionally stored recoverably in the classroom row so subsequent instructor logins can regenerate the same URL/QR. It is a projected, shareable access value, not enrollment verification or an instructor credential. The instructor token never appears in the QR/student URL, student API responses, static HTML, telemetry, localStorage/sessionStorage or application logs. The browser holds it only in module memory and clears the password input. The owner CLI saves its once-only output privately and checks the output destination before creating a classroom.

Per-session accessHash is deprecated and ignored for student authorization. New occurrences use an inert marker in the old NOT NULL column for additive compatibility; no session credential is generated. Old per-session links no longer resolve, and POST /admin/sessions is retired with HTTP 410. Historical data remain available to authenticated owner queries. No competing student access systems remain.

## Routes and QR

New owner routes: POST /admin/classrooms, /admin/classrooms/rotate-instructor, /admin/classrooms/status. New instructor routes: POST /instructor/open, /instructor/activate, /instructor/close. All use the existing /api/econnections-classroom prefix. Existing session/run/export admin routes remain. Student /resolve now routes a course value to its current occurrence; /events authorizes the supplied event's actual occurrence through its classroom, preserving accepted-event retries for closed historical occurrences.

The UI generates its QR locally with the MIT-licensed Project Nayuki v1.8.0 implementation. It renders a high-contrast SVG with a four-module quiet zone and an accessible text/copy link. The vendor source and license are documented beside the asset. No CDN or external QR service is called. An independent test-only jsQR decoder verifies the rendered image resolves to the exact permanent student URL.

## Preserved behavior

The **econnections-classroom/1 event contract is unchanged**: session_start, group_attempt, group_solved and puzzle_complete; existing stable tile IDs, sorted attempts, near misses, duplicate wrong-attempt semantics, UUID identities, ordered sequences, active time, solved-versus-loss distinction, receipt timestamps and idempotency remain intact. No engine, public daily UI, ordinary storage, pool/calendar or public test assertions were changed.

Student access still opens exactly at studentWindowStart and closes at sessionClose. walkthroughStart remains analytical only; pre-walkthrough completion means Worker receipt strictly before it, and equality is late. The same IANA/DST conversion was extracted for Worker use without changing its algorithm. America/Chicago is the pilot default, not a hardcoded offset or Monday rule.

Retention remains **730 days after session close**, with unchanged 1–730-day bounds and whole-session/event cascade deletion. The parent classroom and its permanent QR survive occurrence retention. Public Econ-nections remains local-only with zero classroom API requests, unchanged daily Micro/Macro rules, streaks and history. Managerial/Composer telemetry, mq-measurement/1, its database, and the existing root Worker configuration remain untouched.

## Verification

| Check | Result |
| --- | --- |
| Engine/calendar/classroom tests | 35 passed, including all original telemetry assertions adapted only for new provisioning/key/schema shape |
| One-time provisioning CLI test | 1 passed; output private, no credential printed, existing file prevents another provisioning request |
| Existing public browser suite against rebuilt dist | 15 checks passed |
| Classroom/instructor browser suite against rebuilt dist | 19 checks passed |
| Same QR / multiple sessions | Monday → Wednesday → Friday → second Friday, four distinct sessions/runs, one browser ID, ten events per solved occurrence; URL and QR bytes identical |
| Competing activation | SQLite and real workerd/D1 reject a second activation; stale instructor UI displays conflict and the current occurrence |
| QR/privacy | Independent image decode passed; no external instructor-page requests; token absent from rendered page and browser storage |
| Additive migration / legacy access | Existing raw events preserved; orphan session tokens rejected; owner history queries still work |
| Content audit and --review generation | Passed; all 120 boards |
| Public documentation | Passed: 18 pages, 577 links, zero broken links |
| Static build | Passed: 1,814 files, zero forbidden files |
| Publication/protected-source check | Instructor page/QR/license included; Worker/tooling/secrets excluded; protected public engine/event contract/Managerial files unchanged |
| Wrangler 4.135.0 dry-run | Passed: 109.05 KiB, no upload |
| Local persistent D1 migration | 0002 applied: five local commands; existing schema retained |
| Local workerd + D1 + rate bindings | Both migrations, provisioning, no-active/early refusal, simultaneous activation conflict, full solve, retry, summary/CSV, close and same-link reactivation passed |
| git diff --check | Passed |

Tests use Node 24.14.1, local Chrome/Playwright, Wrangler's bundled Miniflare and jsQR 1.4.0 only for test decoding. No existing test was removed. Fixture setup now provisions a course and activates a session; storage-key expectations use sessionID and the schema assertion includes the added course table. Existing event, timing, win/loss, reload, cross-tab, outage, retry, export and retention assertions remain in place.

The full repeatable commands and private local provisioning instructions are in [README.md](README.md). The original engine/calendar/classroom command, both browser runners, content audit with --review, public documentation, static build, runtime runner and diff checks were rerun. New CLI and publication tests were also run. Local screenshots/tooling/generated outputs are under ignored tmp/econnections; local D1 state remains under ignored .wrangler.

## Owner actions and limits

Later, the owner must review the uncommitted changes, apply the additive migration to the dedicated remote classroom database, deploy the revised narrow API Worker and static instructor/game assets, configure the private global admin token, and provision each classroom once. Save its private instructor token, then use the console for future activations. Replace any old occurrence-specific QR with the permanent course QR. The operator guide provides exact commands; none were run remotely here.

Upcoming occurrences reserve the single slot. Windows are same-date, not overnight, and course defaults do not become a scheduling system. A page left open across expiry needs Refresh status. Queued delivery retains the previous bounded-failure policy; old tabs never transfer their events into a new occurrence. Class links may be shared and browser IDs are not verified people. Local data, exports and platform backups are outside the session-retention job. No faculty accounts, roster integration, grades, dashboards, recurrence, PII, new event types or public telemetry were added.

**No remote resources, remote migrations, deployment, account-setting changes, production secrets, commit amendment or Git push occurred.** The one-token/one-QR/multiple-session workflow is implemented and verified locally; the repository remains for owner review.
