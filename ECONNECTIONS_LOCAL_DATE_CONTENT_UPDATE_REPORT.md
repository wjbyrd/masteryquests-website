# Econ-nections local-date and content-calendar update

## Result

The existing game now resets at the player's **local midnight** and uses **pool v2**, with **48 active relationships and 60 curated boards per domain**. An exact four-group board repeats every **60 local dates**, versus eight dates in v1. Every board has one group at difficulty 1, 2, 3, and 4. Individual relationships recur in different combinations.

The visual design, colors, tile controls, three-strike rule, solved-group behavior, Games-page branding, quest engine, and Composer runtime are unchanged.

## Dates and migration

`calendar-date.js` creates padded date labels from local year/month/day components. Selection, displayed dates, sharing, statuses, and new streaks use those labels. The existing heartbeat compares local dates rather than scheduling fixed 24-hour intervals. An open tab saves its old record and returns to the landing page at rollover. Gregorian date-only ordinals handle yesterday, consecutive days, leap years, and DST without subtracting local timestamps.

V1's original answer key is retained exactly in `pools/v1.js`. Its existing localStorage records are not rewritten, deleted, relabeled, or copied. New IDs start with `econnections:2:` and cannot collide with v1 IDs. Legacy records still count once in lifetime and domain totals, including perfect solves. All plays remain distinguished from completions and solves.

**Migration consequence:** the displayed current/best local streak and domain last-completed/solved dates begin with local-date records. Old saves lack timestamps/timezones, so guessing their original local dates would fabricate history. Their original dates/results and historical best streak remain available separately through the stored records and `legacyHistory` summary. Finishing a v1 puzzle does not finish today's separate v2 puzzle.

## Content and ambiguity controls

| Active v2 | Micro | Macro |
| --- | ---: | ---: |
| Relationships | 48 | 48 |
| Concept / causal / trap | 21 / 11 / 16 | 19 / 12 / 17 |
| Groups at each difficulty | 12 | 12 |
| Curated boards | 60 | 60 |
| Exact-board repeat cycle | 60 days | 60 days |

V1 additionally preserves 16 archived relationships and eight archived boards per domain. The active library uses canonical Composer concepts; objective mappings remain empty instead of invented. No runtime question-text generation or arbitrary board assembly was added.

Boards are static four-ID entries. Authored ambiguity families produce explicit symmetric `incompatibleWith` lists. Review excluded near-neighbor mechanisms such as supply shifters with scale/cost groups, demand expansion with supply adjustment, monetary transmission with quantity-theory chains, and pricing discrimination with elasticity conditions. Every group has concise tile labels, an instructional explanation, assumptions where needed, and editorial notes.

The content audit verifies all board/group counts, normalized duplicate labels, unique board sets, difficulty coverage, canonical references, objective provenance, category mix, exclusions, shared-concept collisions, and usage of every group. Labels are at most 36 characters. Sixty boards was selected instead of stretching to 90 to retain conservative ambiguity exclusions. Faculty/student playtesting should still calibrate difficulty and identify unexpected alternate interpretations; automated checks cannot prove semantic uniqueness. Printable board review sheets are available via `content-audit.mjs --review`.

## Verification

- **14 engine/date tests passed:** local component generation; six real timezones; month, year, leap/century boundaries; 23/25-hour DST dates; streak continuation/breaks; exact legacy pool hash and save replay; migration totals; unchanged win/loss rules; storage fallback; all content invariants; and 1,827 consecutive dates per domain with no exact-board recurrence before 60 days.
- **13 browser checks passed:** launch, local labels, keyboard controls, shuffle, win, three-strike loss, duplicate-guess protection, reload persistence, both daily statuses, sharing, cross-tab completion, local streak growth, UTC midnight at 8 p.m. Eastern without rollover, local midnight with completed and unfinished history preserved, legacy totals, timezone-emulated DST/year/leap/month transitions, blocked storage, and responsive 320/390/768px layouts.
- Content audit passed for all **120 active boards** and canonical references. The frozen v1 pool also validates.
- Public documentation/link audit passed: **17 pages, 554 links, zero broken links**.
- Production builder passed: **1,806 files**, all 151 Composer review PDFs retained, zero forbidden/incoming assets. Browser regression also checked against the generated bundle.
- `git diff --check` passed. No CSS, Games-page, quest-engine, or Composer-runtime changes.

## Every modified or added source file

Modified:

1. `games/econnections/README.md`
2. `games/econnections/econnections.js`
3. `games/econnections/econnections_groups.js`
4. `games/econnections/engine.js`
5. `games/econnections/index.html`
6. `audit_tools/econnections/engine.test.mjs`
7. `audit_tools/econnections/browser.test.mjs`

Added:

1. `games/econnections/calendar-date.js`
2. `games/econnections/pools/v1.js`
3. `games/econnections/pools/relationship.js`
4. `games/econnections/pools/micro-v2.js`
5. `games/econnections/pools/macro-v2.js`
6. `games/econnections/pools/calendar-v2.js`
7. `audit_tools/econnections/calendar-date.test.mjs`
8. `audit_tools/econnections/content-audit.mjs`
9. `audit_tools/econnections/fixtures/v1-history.json`
10. `ECONNECTIONS_LOCAL_DATE_CONTENT_UPDATE_REPORT.md`

Generated, ignored artifacts: refreshed `dist/` bundle and `tmp/econnections/` browser screenshots/content review sheets. No public deployment was performed.
