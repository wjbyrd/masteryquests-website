# Econ-nections — local-date release (pool v2)

Standalone game at `/games/econnections/`, linked from `/games/`. The existing game, UI, three strikes, colors, interactions, and quest systems are unchanged in this release. Serve the repository over HTTP; no backend, account, or package install is needed to play.

## Local dates and rollover

`calendar-date.js` centralizes `localDate()`, `displayDate()`, and `dayNumber()`.

- `localDate()` uses the device's `getFullYear()`, `getMonth()`, and `getDate()`, explicitly padded to `YYYY-MM-DD`. It never converts the current clock to UTC.
- Selection, new records, landing statuses, streaks, displayed dates, and share summaries use that local date. Example: 11:30 p.m. Eastern on September 16 is still the September 16 puzzle.
- The existing five-second heartbeat compares local date labels. Interaction and visibility-return checks do the same. No fixed midnight timeout or timezone-offset assumption is used.
- On a date change, the old record is saved, the active puzzle and selection are cleared, and the landing screen shows the new date. Finished records remain finished; unfinished records remain historical played games, not completions.
- The footer keeps the local puzzle date and device/privacy link without reset or play-duration copy. There is no UTC label on the live UI.
- The browser's timezone and clock are authoritative. Changing timezone can change which date is active; a previously played date resumes its same versioned record. The game makes no server-time or anti-cheat claim.

`dayNumber()` is pure Gregorian calendar arithmetic: year/month/day validation, leap-year rules, and an ordinal with 1970-01-01 as zero. It does not subtract local timestamps or divide durations by 86,400,000. A 23-hour or 25-hour DST date is still exactly one calendar day. The epoch also preserves v1's historical board indexes.

## Streaks and historical compatibility

Played means entered. Completed means a win or third-strike loss. Solved means four groups found before the third strike. Solving either domain extends the overall streak; solving both on one local date counts once. Each domain also has its own streak. A loss cannot erase a solve in the other domain. Yesterday's streak remains current while today is still available; a missed date breaks it.

**Migration decision:** v1 saves lack play/completion timestamps and timezone information, so their UTC date labels cannot be reliably converted into the player's original local dates.

- Keep all existing `mq.econnections.result.econnections:1:...` records untouched. There is no destructive migration, copying, relabeling, or replacement of legacy keys.
- Preserve the original content exactly in `pools/v1.js`; the registry still loads it to replay v1 attempts and reconstruct answers.
- New active puzzles use `econnections:2:YYYY-MM-DD:micro` and `...:macro`, with `dateBasis: 'local'`. V1 uses `dateBasis: 'utc'` when reconstructed. The pool's date basis is authoritative, rather than a mutable saved flag.
- Valid legacy games still count once toward lifetime played/completed/solved, perfect solves, and per-domain played/solved totals. A legacy UTC label that is tomorrow locally is still included in lifetime totals. Duplicate puzzle identities are deduplicated.
- **Current/best local streaks and per-domain last completed/solved dates start from local-date records.** Legacy UTC dates do not extend, break, or inflate a local streak. This intentionally resets the displayed streak for existing v1 players on first upgrade; it does not erase their results.
- `summarize().legacyHistory` exposes legacy played/completed/solved totals and the historical UTC best streak separately. Original per-game dates and attempts remain available through `store.all()`.
- Today's v1 result never marks the new v2 daily puzzle complete. They are different games with independent identities; actually entering both counts two games, not a migration duplicate.

Keep published pool versions available indefinitely while their local history is supported. A future answer-key or calendar change should add a new immutable registry entry and version, preferably with an explicit date-based activation schedule. Do not edit an existing published board order or answer key.

**Cleanup compatibility:** v2 display-label corrections keep pool version `2`. Puzzle identity and initial shuffle use the version/domain/date, not display wording. Saved attempts and tile order use stable `groupId:tileIndex` IDs; no group or tile positions changed. Existing records replay with the polished labels and retain their attempts, strikes, elapsed time, completion and streaks. No migration, key rewrite, or progress reset is needed. The frozen pre-cleanup fixture checks all 120 identities and initial orders, unchanged relationship metadata/calendars, and old partial/won/lost records for both domains. Archived v1 wording remains untouched.

## Incorrect guesses and mobile tiles

An incorrect selection of four distinct, unsolved tiles shows **“1 away.”** only when its maximum overlap with a remaining answer group is exactly three. It still uses one strike, including on the third strike. Repeating the same wrong set keeps the duplicate warning and may repeat the hint without another strike. Overlaps of two or fewer give no proximity feedback. The engine returns only a transient boolean; no group or tile is identified and nothing is added to saved records. The existing polite, atomic status region announces the hint; selection and keyboard focus behavior are preserved.

At widths up to 420px, active unsolved tile labels use `.8125rem` text, `1.25` line height, and `13px 8px` padding, retaining the two-column grid, 8px gaps and 80px minimum tile height. Text wraps at spaces, with an emergency wrap for an overlong word. Solved-card typography, colors, touch targets and sticky controls are unchanged.

## Content calendar and determinism

| Active v2 content | Micro | Macro |
| --- | ---: | ---: |
| Relationships | 48 | 48 |
| Groups at each difficulty (1–4) | 12 | 12 |
| Concept relationships | 21 | 19 |
| Causal relationships | 11 | 12 |
| Trap/misconception relationships | 16 | 17 |
| Curated boards | 60 | 60 |
| Exact-board repeat cycle | 60 local dates | 60 local dates |

The archived v1 pool additionally retains its 16 relationships and eight boards per domain. Those archived boards are not selected for new play.

Each v2 board is a literal four-ID row in `pools/calendar-v2.js`, ordered by difficulty. Selection remains `(calendar day ordinal + hash(domain + ':' + poolVersion)) mod boardCount`; the puzzle ID seeds the initial Fisher–Yates tile shuffle. Same release, domain, and local date produce the same answer groups and initial tile order in every timezone. Players in different local dates can appropriately see different puzzles at the same instant.

No complete four-group board repeats within the 60-day cycle. Individual groups deliberately recur in different combinations: Micro groups appear 4–7 times per cycle, Macro groups 2–10 times. Thus 60 boards does **not** mean 240 different groups per domain. The 60-board target was chosen over stretching to 90 to retain conservative separation between closely related macro mechanisms.

Micro spans scarcity, opportunity cost, marginal choices, incentives, trade, PPF, demand/supply, equilibrium, controls, elasticities, taxes/incidence, surplus, externalities, goods classification, costs, market structures, entry, monopoly, and strategy. Macro spans GDP, nominal/real measures, price indexes, inflation, labor markets, productivity/growth, saving/investment, finance, banks/reserves/capital, money, AD–AS, policy, multipliers, debt, Phillips curves, and expectations.

## Relationship schema and editorial controls

Each relationship contains `id`, `domain`, `category`, `difficulty`, `title`, four `tiles`, `explanation`, `concepts`, `tags`, `sourceObjectives`, `notes`, and `incompatibleWith`. V2 adds `ambiguityFamilies`: authored editorial exclusion labels. `relationship.js` is only shorthand for constructing this data shape.

`concepts` are verified against `build/faculty-build-composer/data/composer_registry.json`. `sourceObjectives` remain empty unless an exact mapping is verified. The browser never invents relationships from questions or generates new boards.

`econnections_groups.js` materializes explicit, symmetric `incompatibleWith` IDs from the authored ambiguity families. This is exclusion metadata, not runtime board assembly. The shipped calendar is static. Board curation avoids, for example:

- Demand/supply shifts beside movements or similar equilibrium chains.
- Supply shifters beside cost/scale/capacity groups.
- Explicit costs beside sunk/implicit costs that could contain the same example.
- Price discrimination beside elasticity or related pricing conditions.
- GDP component lists beside GDP investment/exclusion lists.
- Inflation surprises beside expected-inflation mechanisms.
- AD expansions beside supply self-adjustment or money-demand chains.
- Monetary transmission beside quantity-theory or other monetary mechanisms.
- Other labor classifications beside unemployment-denominator traps.

Validation rejects duplicate IDs, invalid domains/types/difficulties, missing metadata/explanations, malformed four-tile groups, normalized duplicate labels, unknown group or exclusion IDs, repeated boards (even reordered), missing difficulties, one-type-only boards, and family/incompatibility collisions. The audit additionally verifies canonical references, objective provenance, group usage, concise labels (maximum 40 characters; current maximum 39), and no repeated canonical concept inside a board. Every active board contains at least two relationship types.

All 120 board combinations were reviewed through their intended meanings and exclusion rules. Further faculty/student playtesting should calibrate difficulty and expose unanticipated alternate readings; automated structural checks cannot prove semantic uniqueness. The notes and printable review sheets make that review concrete.

## Files and responsibilities

- `index.html`, `econnections.css`: UI and responsive layout, including the quieter results/footer and narrow-screen active tile typography.
- `econnections.js`: existing interaction/controller with local-date selection, labels, and rollover.
- `calendar-date.js`: local date helper, display formatting, Gregorian ordinal.
- `engine.js`: selection, pool validation, unchanged game rules, restore, local/legacy statistics.
- `storage.js`: unchanged per-puzzle localStorage adapter and fallback. Saves attempts, tile order, elapsed active time, and status; restores by replay. No account sync or network reporting.
- `econnections_groups.js`: active version, registry, exclusion metadata.
- `pools/v1.js`: exact archived v1 content.
- `pools/micro-v2.js`, `pools/macro-v2.js`: active relationships and editorial notes.
- `pools/calendar-v2.js`: 60 static boards per domain.
- `pools/relationship.js`: data-shape helper.
- `../../audit_tools/econnections/`: regression tests, frozen legacy fixture, and content audit/review tool.

Runtime `.js` modules are included automatically by the existing publication builder. The engine uses the same progress, neutral tiles, solved-card colors, keyboard controls, active timer, result sharing, and mobile layout as v1.

## Verification

From the repository root:

```text
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs
node audit_tools/econnections/content-audit.mjs
node audit_tools/econnections/content-audit.mjs --review
node audit_tools/econnections/browser.test.mjs
node audit_tools/public_documentation/check.cjs
```

The 18 engine/date tests include exact near-miss boundaries, duplicate protection, solved-group exclusion, pre-cleanup v2 compatibility, six real timezones, month/year/leap/century boundaries, DST, legacy snapshots and hash parity, all content constraints, and 1,827 successive dates per domain with no repeat sooner than 60 days. Browser coverage includes completion/footer copy, clipboard and fallback, other-domain actions, near-miss live-region/keyboard behavior, all 384 active labels at 320/390/420/768px, solved typography and sticky controls, plus the existing win/loss/persistence checks, Eastern 8 p.m. non-rollover, local midnight, preserved completed/unfinished history, migration totals, and timezone-emulated DST/calendar transitions with streak display.

The browser runner requires Playwright and an installed Chromium browser. Set `PLAYWRIGHT_MODULE` if needed, and `BROWSER_CHANNEL` or `BROWSER_EXECUTABLE` for the browser. Set `ECON_SITE_ROOT` to a generated `dist/` directory to test the production bundle. Screenshots go to ignored `tmp/econnections/`. The audit and legacy fixture remain outside public runtime assets.

## Optional classroom sessions

Normal `/games/econnections/` play remains local-only: no classroom API requests, account, session, or browser identifier is required. Daily Micro/Macro selection, local history, streaks, rules, and public cross-tab synchronization remain unchanged.

An instructor-created link has the form `/games/econnections/?classroom=<opaque random access token>`. It resolves through the separate `/api/econnections-classroom/` service to one immutable puzzle ID and pool version. The device's date/timezone cannot roll that puzzle over. A malformed link, unavailable metadata, or a closed session does not enable reporting. If a previously validated classroom run is cached, the same pinned puzzle can continue locally during an outage, with reporting disabled until metadata can be validated on a later reload. Otherwise the page offers public daily play.

Classroom progress is stored separately under `mq.econnections.classroom.v1.run.<token>`; public `mq.econnections.result.*` records are neither inherited nor overwritten. Classroom results do not change public streaks. A browser can have one run per session. A Web Lock permits one active classroom tab per session: a second tab shows a notice to continue in the first tab or close it and reload. Public tabs keep their existing synchronization. Browsers without Web Locks or usable storage can play the validated puzzle in memory with reporting disabled.

Classroom events collect a pseudonymous persistent browser UUID (`playerID`), independent run/event UUIDs, session ID, event sequence, submitted four-tile sets sorted by stable ID, grouping outcomes, near misses, solved group IDs/counts, and active elapsed time. The service assigns receipt timestamps. It collects no names, email, institutional IDs, fingerprints, individual tile-click order, keystrokes, or unrelated browsing data. A browser ID is not verified student identity: shared browsers may share it, clearing browser storage creates a new ID, and there is no cross-device identity claim. Hosting infrastructure may process ordinary request metadata; this layer does not store IP addresses or user-agent fields.

Only `session_start`, `group_attempt`, `group_solved`, and `puzzle_complete` are emitted. Repeated wrong sets each produce an attempt event but still cost no additional strike. A terminal event records whether four groups were solved; a third-strike loss is completed, not solved. No separate `one_away` event or individual clickstream is collected.

**Pre-walkthrough completion means `puzzle_complete.serverTimestamp < walkthroughStart`.** Equality and later receipt count as walkthrough-period activity, even if the device claims an earlier time. Delayed/retried delivery is never backdated. `studentWindowStart` describes the intended warmup window; pre-created sessions may be opened earlier. `sessionClose` ends new event acceptance and is not the walkthrough cutoff. Exact retries of already accepted events return their original receipt, including after close.

Progress and the pending event queue are saved together. Each event gets at most three transmission attempts across reloads; failures do not block solving or claim successful delivery. At the 256-event run limit, reporting stops visibly and play continues. Local records/queues persist until browser storage is cleared; the server's default retention is 90 days after session close.

This is the separate `econnections-classroom/1` contract and a dedicated D1 service. It does not modify `mq-measurement/1`. See [service setup, routes, schema and policies](../../server/econnections-classroom/README.md) and [implementation report](../../server/econnections-classroom/IMPLEMENTATION_REPORT.md). No remote resources are provisioned by this change.

Additional local checks (Node 24+ for the SQLite test harness):

```text
node --test audit_tools/econnections/classroom.test.mjs
node audit_tools/econnections/classroom-browser.test.mjs
```
