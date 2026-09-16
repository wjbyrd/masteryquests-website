# Econ-nections v1 implementation report

Implemented a standalone daily game at `/games/econnections/`, integrated into the Games page with a quick-play card and hero link. This is a lightweight static-browser feature, independent of the quest engine.

## Delivered

- Separate daily Micro and Macro puzzles, 16 tiles and four hidden groups each.
- Four-tile selection, submit, shuffle, deselect, locked correct groups, three strikes, complete loss reveal, and win/loss results with time and explanations.
- Neutral active tiles and a numbered light-teal → teal → blue → navy progression for resolved groups.
- Landing statuses for unplayed, in-progress, completed, and solved puzzles; current/best streaks and cumulative statistics.
- Local progress recovery, cross-tab refresh, storage-failure fallback, UTC rollover, and spoiler-free result copying.
- Semantic buttons, pressed states, live feedback, keyboard navigation, focus management, reduced motion, and responsive layouts. The desktop board is 4×4; narrow phones use two columns and sticky actions for readable economics phrases.

## Files

New runtime and documentation live in `games/econnections/`: `index.html`, `econnections.css`, `econnections.js`, `engine.js`, `storage.js`, `econnections_groups.js`, `package.json`, and `README.md`.

Changed `games/index.html` for Games integration and `.gitignore` for local browser screenshots. Added regression checks in `audit_tools/econnections/engine.test.mjs` and `browser.test.mjs`. No dependency or quest-engine changes.

## Selection and content

The library contains **16 Micro and 16 Macro groups**, covering concept, causal, and misconception relationships. Each references real concept IDs from the canonical Composer registry. Objective arrays remain empty pending verified objective-level mapping. Runtime relationships are curated, never inferred from raw question text.

Each domain has **eight curated boards**, with one group at each difficulty level. UTC epoch day plus a hash of domain and pool version determines the board; the puzzle ID seeds the initial tile shuffle. Every device on the same release/date receives the same board. Validation checks counts, classifications, metadata, duplicate labels, prohibited combinations, and canonical concept references.

**Tradeoff:** board combinations repeat every eight days per domain, with date-specific tile order. Curated combinations reduce ambiguity; this intentionally small library is infrastructure and representative content, not a production-length calendar. Further editorial playtesting remains useful.

## Persistence and streaks

Each puzzle has a versioned localStorage record containing identity, status, attempts, solved groups, incorrect submissions, strikes, tile order, and active elapsed time. Restore replays attempts against the original pool. Aggregate statistics derive from records so reopening a finished puzzle does not count again.

Played means entered; completed means win or loss; solved means all four groups found before the third strike. Overall streaks count consecutive UTC days with at least one solve, with both domains on one date counting once. Per-domain totals, streaks, last completion dates, and last solve dates are also calculated. No results leave the browser. Hidden-tab time is paused.

Published pool versions must remain in `PUZZLE_POOLS` to preserve old history. The README explains the next content-version and activation-date workflow.

## Verification performed

- **7 engine/content test suites passed**, including 366 daily selections for each domain, all canonical references, duplicate/incompatible-content rejection, win/loss transitions, persistence recovery, blocked/corrupt storage, and statistics/streak boundaries.
- **10 real Chromium browser checks passed**, including launch from Games, keyboard controls, selection limit, shuffle, correct locking, reload, complete solve, repeated-miss protection, three-strike loss, revealed explanations, sharing, local stats, UTC rollover, cross-tab completion, and blocked storage.
- Responsive checks passed at **320, 390, and 768 pixels**, with no horizontal overflow and tile targets at least 44px. Desktop, mobile, and result screenshots were visually reviewed.
- Existing public documentation/link audit passed: **17 pages, 554 links, zero broken links**.
- The existing publication builder produced **1,800 files**, retained all 151 Composer review PDFs, and reported zero forbidden/incoming assets. The entire browser walkthrough also passed against this generated `dist/` bundle. Runtime modules use `.js` because the existing builder excludes `.mjs`.
- No JavaScript runtime errors in the browser walkthrough; `git diff --check` passed.

## Next expansion

Expand and editorially review the board calendar, add exact objective/skill mappings and an approved Composer export, and introduce scheduled pool activation while retaining prior versions. Account synchronization and leaderboards remain outside v1.

The source and local production bundle are ready. No public deployment was performed.
