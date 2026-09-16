# Econ-nections v1

A standalone daily economics classification game at `/games/econnections/`, linked from `/games/`. No account, backend, package install, or build step is required to play. Serve the repository over HTTP; ES modules do not work reliably with `file://`.

## Structure

- `index.html`: accessible landing screen, game, results, and shared site branding.
- `econnections.css`: scoped layout and neutral tiles; solved/revealed groups use difficulty-numbered light teal, teal, blue, and navy cards. Desktop uses four columns; screens at or below 420px use two readable columns. Mobile controls stay visible while scrolling.
- `econnections.js`: DOM rendering, interaction, keyboard support, active-time accounting, rollover, result sharing, and cross-tab refresh.
- `engine.js`: pure daily selection, pool validation, gameplay transitions, progress replay, and aggregate statistics.
- `storage.js`: localStorage adapter with one record per puzzle and a visible warning/in-memory fallback for unavailable, full, or corrupt storage.
- `econnections_groups.js`: 32 curated relationships and 16 curated boards, separate from game logic.
- `package.json`: declares ES modules for Node-based audits; no dependencies.
- `../../audit_tools/econnections/`: engine/content and real-browser regression checks. These stay outside public runtime assets.

## Daily selection and content

Each domain has eight curated boards, each containing four groups (one each at difficulties 1–4). The board index is `(UTC epoch day + hash(domain + ':' + poolVersion)) mod boardCount`. A seeded Fisher–Yates shuffle uses the full puzzle ID for stable initial tile order. Manual shuffling changes presentation only.

The current ID is `econnections:1:YYYY-MM-DD:micro` or `...:macro`. All devices using the same release and UTC date see the same board. Puzzles reset at **00:00 UTC**, not local midnight. An open tab returns to the landing page at rollover; yesterday's unfinished record remains in local history and counts as played, not completed. System clock accuracy is assumed. There is no server clock or anti-cheat enforcement.

**v1 tradeoff:** curated combinations reduce the ambiguity of arbitrary runtime mixing. Each domain's group combinations repeat after eight days, with a date-specific initial tile order. This is a representative starter library, not a long production calendar. Automated validation rejects duplicate IDs/labels, wrong counts, invalid classifications, missing metadata, unknown canonical concept references, prohibited pairings, and missing difficulty levels. Semantic ambiguity still needs editorial review.

The pool contains 16 Micro and 16 Macro groups. Both include concept, causal, and misconception/trap categories. Micro covers demand/supply, price controls, trade, elasticity, costs, taxation, externalities, public goods, monopoly, and strategic games. Macro covers GDP, unemployment, productivity, price measurement, AD–AS, policy transmission, fiscal accounting, banking, and money functions. Explanations state important model assumptions.

Every relationship supports:

```js
{
  id: 'unique-stable-id',
  domain: 'micro',              // micro | macro
  category: 'concept',          // concept | causal | trap
  difficulty: 1,                // 1–4, also determines solved-card color
  title: 'Relationship title',
  tiles: ['A', 'B', 'C', 'D'],
  explanation: 'A short explanation with any necessary assumptions.',
  concepts: ['canonical-concept-id'],
  tags: ['topic'],
  sourceObjectives: [],         // verified canonical objectives only
  notes: 'Optional editorial notes',
  incompatibleWith: ['other-group-id'] // optional board exclusion
}
```

`concepts` reference `build/faculty-build-composer/data/composer_registry.json`. Objective arrays are intentionally empty until exact objective mappings are reviewed; invented objective IDs are not shipped. The game does not load Composer question text or infer relationships at runtime. Future authoring tooling can export editorially approved groups from canonical metadata into this schema.

For a new release, add a new entry to `PUZZLE_POOLS` and update `POOL_VERSION`. **Keep published pool entries and group arrays immutable and available**: saved records use their original version to reconstruct their answer key. Schedule a future pool switch at a UTC day boundary to avoid changing an already-played day's active puzzle. An activation-date selector can be added when the first scheduled content update is introduced. Never delete prior pool versions while their local history must remain readable.

## Rules, persistence, and statistics

- Entering a domain creates a `started` record, counting as **played**.
- Four unique, still-active tiles are required to submit. A correct set locks its group; a wrong set uses one strike. A previously tried wrong set gives feedback without another strike.
- Four correct groups means **solved**; a third wrong set ends the puzzle as **completed, not solved** and reveals the remainder. Both are **completed**. Reveals do not count as solves.
- Records are stored under `mq.econnections.result.<puzzleId>`. They include puzzle/version/date/domain, started/completed/solved, groups solved and IDs, strikes, incorrect submissions, attempt history, elapsed milliseconds, and tile order.
- Attempts, shuffles, domain changes, page hide, and a five-second heartbeat save progress. Selected-but-unsubmitted tiles reset on reopening. The clock counts visible time while inside an unfinished puzzle; it pauses on the landing page, hidden tabs, and completion. It is shown at the end, not as a countdown.
- Restore replays attempts against the versioned answer key, rather than trusting cached counters. Unsupported or malformed records trigger a warning and are left in storage; valid records remain playable. No data is sent off-device.
- Lifetime totals are derived from result records, so reopening a result does not increment totals. Totals include played/completed/solved, perfect solves, Micro/Macro played and solved, overall current/best streak, and per-domain current/best streak and last completed/solved date.
- A streak counts consecutive **UTC dates with at least one solve**. Solving both domains counts as one day. Yesterday's streak remains current while today is still available; a missed date breaks it. A loss does not erase a solve in the other domain that day. Completion alone does not extend a streak.
- Separate keys prevent a Micro write from replacing Macro history. Storage events refresh progress from other tabs; each action reads existing progress before writing. This is local best-effort synchronization, not a transactional multiplayer system. Clearing browser storage clears the history; there is no account sync.
- Result sharing copies a spoiler-free text summary. If clipboard access fails, an accessible selected text box lets the player copy manually.

## Accessibility

Tiles are real buttons with `aria-pressed`; Tab, Space/Enter, arrow keys, and Escape work. Up/down movement follows the current column count. Status feedback is announced through a polite live region. Correct submissions move focus to the remaining board; completion moves it to the result heading. Difficulty and connected/revealed state have text labels as well as color. Controls have visible focus, touch-sized targets, and reduced-motion support.

## Verification

From the repository root:

```text
node --test audit_tools/econnections/engine.test.mjs
node audit_tools/econnections/browser.test.mjs
node audit_tools/public_documentation/check.cjs
```

The browser test requires Playwright and Chrome. Set `PLAYWRIGHT_MODULE` to an absolute Playwright package path if needed; set `BROWSER_CHANNEL` or `BROWSER_EXECUTABLE` for another installed Chromium browser. It serves an ephemeral localhost site and writes screenshots to `tmp/econnections/`. The engine tests need only Node (18+).

The existing publication script `audit_tools/public_site_publication/build-dist.mjs` copies `games/` automatically. Runtime modules deliberately use `.js`; that script excludes `.mjs` audit files. There are no new routes or dependencies to configure. Source implementation does not itself publish the site.

## Future expansion

Add a larger reviewed calendar, Composer-authoring export, objective/skill mappings, and scheduled pool activation while retaining old versions. More editorial playtesting can tune difficulty, ambiguity, and the approximate two-minute target. Account sync, leaderboard, quests, and automatic relationship generation are outside v1.
