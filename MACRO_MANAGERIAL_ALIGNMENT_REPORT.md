# Macro Command — Managerial alignment report

## Gate 1: parity inventory (recorded before implementation)

- Worktree: `C:/Users/Jennings/Documents/GitHub/masteryquests-macro`.
- Branch: `macro-managerial-alignment`.
- Starting commit: `47485dd34788de6f23d0db325801aa7dd4640317`.
- Remote `refs/heads/main` checked with `git ls-remote`: same SHA. Starting status clean; no unrelated modifications or untracked files.
- Original worktree is on `labyrinth-interface-exam-alignment` with an existing local change. It is excluded from this work.
- Maintained source: `audit_tools/macro_command_engine/sync.mjs`, `profiles.json`, `active-profile.mjs`; generated targets are exactly four Macro `index.html` files. Composer template and Economic Realm source utilities are read-only dependencies.
- Executed all eight Macro/Managerial pages in isolated Edge contexts. Baseline browser facts and matching-size screenshots: `tmp/macro-managerial-alignment/baseline-browser.json`, `before-*.png`.
- Baseline `sync.mjs --check` fails; generated preview captured separately for diagnosis, without rewriting game pages.

A = already aligned; B = visual gap; C = outdated behavior; D = missing supported integration; E = intentional collection difference; F = owner decision. A source finding does not substitute for the final regression scenarios below.

| Area | National Engine | Mint, Ash & Gold | Command Nexus | Exchange Citadel | Evidence / planned action |
|---|---|---|---|---|---|
| Mode selection / initialization | A | A | A | A | Nine supported modes validate through Composer preflight; run lifecycle already integrated. |
| Ten-mode availability | E | E | E | E | Trial by Graph not enabled: actual banks lack sufficient explicitly eligible graph records. Preserve banks and mode eligibility. |
| Game Menu hierarchy | B | B | B | B | Runtime order puts Sound after Motion; Cost Directive puts Sound before Motion. |
| Sound / fullscreen | A/B | A/B | A/B | A/B | Existing actions work; Sound styling overrides menu width and typography. |
| Decorative Motion | A | A | A | A | Canonical persisted preference and reduced-motion CSS already embedded. |
| Daily Tasks | A/C | A/C | A/C | A/C | Canonical selection/progress/persistence present; correctness-dependent progress can be displayed during Exam commitment/checkpoints. Audit and isolate presentation. |
| Replay Introduction | A | A | A | A | Existing authored configuration and actual guide/artwork; replay does not start a run. Verify state and timers. |
| First-time guide policy | A/E | A/E | A/E | A/E | Per-game persistent seen key; new mode launch opens intro only if unseen, resume bypasses it. Preserve policy. |
| Boss introductions | A/C | A/C | A/C | A/C | Existing portraits/selection lifecycle; performance-dependent challenge lines leak Exam section results before summary. Neutralize Exam presentation only. |
| Standard Campaign checkpoints | A | A | A | A | Current engine contains immediate-failure three-room setback and three-correct victory guards. Historical browser suite still expects obsolete three-miss behavior; do not use that expectation. |
| Exam 30-room navigation | A | A | A | A | Actual grid has 30 tiles, three rows of ten, nine clickable active ordinary rooms, checkpoint readiness and saved-answer states. No replacement dashboard needed. |
| Exam instructional sentence | B | B | B | B | Correct wording and placement already present; Composer feedback override is heavier than Cost Directive. |
| Exam assessment mechanics | A | A | A | A | Existing revisable drafts, stable questions/options and once-only commits; preserve engine. |
| Exam feedback privacy | C | C | C | C | Guardian dialogue, Daily UI, and pre-completion export access require focused verification. Draft answer snapshots already omit answer keys; revision-direction fields require export gating without changing records. |
| Correct-answer explanation / Continue | A | A | A | A | Existing held feedback adapter, timed released-only review. |
| Wrong Turn / Repair → Bridge → Retest | A | A | A | A | Existing narrative transition and remediation state machine. |
| Recovery Complete | A | A | A | A | Existing adapter displays missed question plus authored explanation. |
| Keyboard / screen reader / focus | A/B | A/B | A/B | A/B | Shared embedded helper already handles dialogs, focus, live announcements; menu launcher needs reference touch-target sizing. |
| Graph descriptions / enlargement | A/E | A/E | A/E | A/E | Existing media metadata adapter and accessible lightbox. Content remains bank-specific. |
| Desktop / mobile layout | A/B | A/B | A/B | A/B | Real screenshots at 1440/820/390/320; preserve themed layout, refine confirmed menu/instruction differences. |
| Mastery Reports | A/E | A/E | A/E | A/E | Current Composer report calculations and downloads, preserved game-specific resource routing. No invented resources. |
| Save / resume | A/E | A/E | A/E | A/E | Existing saved-state lifecycle; National Engine intentionally isolates obsolete microeconomics saves. |
| Local telemetry / CSV | A/C | A/C | A/C | A/C | Existing 117-column contract remains authoritative; active Exam export presentation must not reveal draft revision correctness. No schema/event changes. |

No shared template, shared accessibility helper, Managerial, Economic Realm, Labyrinth, answer-analysis, hosting or backend changes are authorized or planned. Any inherited shared defect is addressed only through a narrow Macro generation adapter when feasible; otherwise it is reported.

## Implementation and final evidence

All implementation gates are complete (details below). All generated evidence stays under `tmp/macro-managerial-alignment/` and is excluded from commits.

### Gate 2 — interface and menu

Confirmed fixes: Sound precedes Decorative Motion; every utility has the same width, spacing and stable hover geometry; Game Menu launcher matches the reference 44px minimum height. Existing Sound, Motion, Escape and conditional Timed review controls retained. All four games pass `gate2.mjs` at 1440/820/390/320 (`gate2-results.json`), with real after screenshots. Visually inspected desktop and narrow mobile captures.

The baseline synchronization failure was exclusively mixed CRLF/LF in imported resource fragments (97 CR bytes in National Engine's otherwise LF-generated output). Normalized current/generated documents were identical. The generator now normalizes its complete output; `sync.mjs --check` passes. No gameplay correction was bundled into that fix.

### Gate 3 — Exam and introductions

All four games pass `gate3.mjs` (`gate3-results.json`). Fresh Standard starts show the authored guide; returning starts and saved-run resume suppress it as designed. Replay preserves question/options, mode, room, attempts, score/streak, adaptive memory, artifacts, telemetry count and Exam drafts/revisions. Nine saved responses enable the existing checkpoint tile; commitment counts nine attempts exactly once.

Macro-only presentation changes: neutral guardian dialogue in Exam; understated instructional sentence; removal of inherited button margins so the existing grid tiles align in exactly three rows. The grid itself and assessment engine were retained. Guardian images/names and non-Exam authored challenge lines are unchanged.

Daily computations, persistence and event records continue normally. While Exam is active, its menu uses a neutral Daily Task label/details and suppresses progress/completion toasts. Progress is available after ending Exam. Active-run CSV download is deferred until Exam ends because retained draft revision-direction fields could reveal correctness; completed-run CSV rows and headers remain unchanged. This addresses shared Composer presentation dependencies locally, without editing shared sources.

### Gate 4 — feedback, reporting, protection and final acceptance

**Complete.** No feedback engine or report calculations needed replacement. The existing correct-answer Continue, narrative Wrong Turn, uninterrupted Repair → Bridge → Retest, original-question Recovery Complete, and Timed Trial released-only review all pass. Final presentation corrections add Escape-to-proceed for guide/guardian introductions, opaque backing beneath their existing scene layers, wrapping for long authored guardian names at 320px, reserved space for the Game Menu launcher, and wider report summary cards.

The original parity inventory remains above as the pre-edit record. All B/C findings listed there are resolved in the Macro adapter. No missing Daily algorithm or replacement Exam engine was needed. Final visual inspection additionally confirmed long-name clipping and translucent introduction backgrounds; those are resolved without changing portraits, names, dialogue outside Exam, or gameplay backgrounds.

## Four-game acceptance evidence

| Scenario | National Engine | Mint, Ash & Gold | Command Nexus | Exchange Citadel |
|---|---|---|---|---|
| Full Standard Campaign | PASS: 30 rooms / 36 correct responses | PASS: 30 / 36 | PASS: 30 / 36 | PASS: 30 / 36 |
| Full Exam Drill | PASS: 36 responses / 30 correct | PASS: 36 / 30 | PASS: 36 / 30 | PASS: 36 / 30 |
| Exam revisions / commitments | 6 revisions / 3 commits | 6 / 3 | 6 / 3 | 6 / 3 |
| Boss failure at response 1, 2, 3 in Rooms 10, 20, 30 | All 9 pass | All 9 pass | All 9 pass | All 9 pass |
| Natural Repair → Bridge → Retest / Recovery Complete | PASS | PASS | PASS | PASS |
| Guide fresh / returning / replay / mission isolation | PASS | PASS | PASS | PASS |
| Standard save/resume, including active checkpoint | PASS | PASS | PASS | PASS |
| Daily persistence / date rollover / canonical core | PASS | PASS | PASS | PASS |
| Mastery Report accuracy, counts and CSV download | PASS | PASS | PASS | PASS |
| Fullscreen, sound, motion, keyboard introductions, graph enlargement | PASS | PASS | PASS | PASS |
| Baseline/current protected Campaign state and telemetry event sequence | Exact match | Exact match | Exact match | Exact match |

Every Standard miss ends the encounter on that response, returns to Room 7/17/27, preserves the prior checkpoint floor, grants no artifact and offers the normal retry. Successful runs require three correct responses per guardian and award exactly one of each artifact. Double activation of Continue never skips another room. Exam ordinary drafts remain unscored until commitment; each section scores once, and incorrect ordinary/checkpoint responses produce no remediation or setback. The full Exam scenarios contain nine checkpoint responses and show the expected 30/36 score in reports.

## Ten-mode regression

| Mode | All four Macro games | Evidence |
|---|---|---|
| Standard Campaign | PASS | Full run, all three guardians, failure matrix, saves, artifacts and report |
| Timed Trial | PASS | Launch/answer; replay leaves deadline unchanged and clock running; released-only explanation review |
| Exam Drill | PASS | Full run, navigation, revision, commitment, neutral introductions, privacy and export release |
| Quiz | PASS | Existing setup, valid bank, normal answer control and scoring |
| Unlimited Practice | PASS | Initialization, normal answer, existing completion/report paths |
| Legendary | PASS | Existing bank eligibility, initialization and accepted answer |
| Score Attack | PASS | Initialization and accepted answer; formula preserved |
| Trial by Graph | Intentionally unavailable | Zero explicitly eligible graph candidates in each current bank; ordinary graph questions and enlargement still work |
| Fading Fortune | PASS | Existing setup, initialization and accepted answer; timing/scoring code unchanged |
| Risk & Reward | PASS | Existing setup, wager selection and accepted answer; scoring code unchanged |

Full-length playthroughs were performed for Standard and Exam. The other supported modes received launch/answer regression coverage plus focused timing/review checks; this is not a claim of full-length completion in every mode.

## Test results and reproduction

Evidence directory: `tmp/macro-managerial-alignment/` (ignored by Git).

| Evidence file / runner | Result |
|---|---|
| `baseline-browser.json`, `baseline.mjs` | All eight Macro/Managerial implementations inspected live |
| `gate2-results.json`, `gate2.mjs` | 4/4 menu gates at four widths |
| `gate3-results.json`, `gate3.mjs` | 4/4 Exam, introduction and replay gates |
| `regression-results.json`, `regression.mjs` | 88/88 comprehensive scenarios |
| `maintained-browser/browser-focused-results.json` | 34/34 maintained legacy/content/storage checks; no browser exceptions |
| `daily-<game>.json`, `daily-runner.cjs` | 26 canonical Daily tests per game (104 total) |
| `final-focused-results.json`, `final-focused.mjs` | 8/8 keyboard, graph, timing, checkpoint-resume and baseline comparison cases |
| `final-presentation-results.json`, `final-presentation.mjs` | 4/4 refreshed visual, Daily persistence/rollover and review cases |
| `utility-results.json`, `utilities.mjs` | 4/4 real fullscreen and shared-profile mission-intro isolation cases |
| `source-results.json`, `source-check-final.log` | 22 complete engine functions per game and 159 companion files preserved |
| `final-source-scope.json`, `final-source.mjs` | Two successive synchronizations byte-identical; all changes within authorized scope |
| `evidence-index.json` | Machine-readable summary |

The custom runners use local Edge, real published banks, isolated synthetic profiles, seeded randomness, controlled clocks and ordinary mouse/keyboard answer controls. External network requests are blocked. Synthetic answers and CSVs remain in the ignored evidence directory.

One Exchange Citadel Campaign pointer action timed out on Playwright's stability check under the controlled clock. The complete scenario was rerun successfully with keyboard activation through the same answer buttons; no engine workaround was added. Some test harness assertions were corrected to follow actual asynchronous fullscreen updates and CSS-transformed text. The shared Daily suite assumes LF input; a temporary read adapter normalized Windows line endings and ran that unchanged canonical suite against each Macro page. Shared tests were not edited.

Maintained checks can be rerun from the Macro worktree:

```powershell
$env:MQ_MACRO_OUT='tmp/macro-managerial-alignment'
node audit_tools/macro_command_engine/sync.mjs --check
node audit_tools/macro_command_engine/check.mjs
$env:PLAYWRIGHT_MODULE='C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:MQ_TEST_FILTER='initialized|every active question|legacy|older save|first checkpoint miss|original Realm'
node audit_tools/macro_command_engine/browser.mjs
```

The temporary runners are retained locally for review/reproduction and deliberately not committed.

## Visual inspection and before/after evidence

Real captures cover 1440, 820, 390 and 320 CSS pixels, including ordinary gameplay, Game Menu, Exam, saved-answer navigation, guardian introductions, Recovery Complete and Mastery Reports. Cost Directive captures at matching widths supply the primary visual reference; Market Gate supplies an additional Economic Realm runtime/reference capture. Other Managerial games were inspected for executable behavior and mode availability.

[Open the local screenshot comparison gallery](tmp/macro-managerial-alignment/screenshots.html). Choose a game, width and screen to compare baseline Macro, aligned Macro and Cost Directive. Screens added specifically for final verification may have no baseline counterpart. The complete PNGs use `before-<game>-<width>-<screen>.png` and `after-<game>-<width>-<screen>.png`. Final Exam guardian captures use `exam-guardian`; `guardian` preserves the Standard authored dialogue. Report viewport/control captures show actual scrolled views; Edge full-page captures can leave fixed-background areas outside the capture viewport white.

Representative review links:

| Screen | Before | After | Managerial reference |
|---|---|---|---|
| 320px menu | [Macro](tmp/macro-managerial-alignment/before-national-engine-320-menu.png) | [Macro](tmp/macro-managerial-alignment/after-national-engine-320-menu.png) | [Cost Directive](tmp/macro-managerial-alignment/before-cost-directive-320-menu.png) |
| 390px Exam | [Macro](tmp/macro-managerial-alignment/before-national-engine-390-exam.png) | [Macro](tmp/macro-managerial-alignment/after-national-engine-390-exam.png) | [Cost Directive](tmp/macro-managerial-alignment/before-cost-directive-390-exam.png) |
| 320px guardian | [Command Nexus](tmp/macro-managerial-alignment/before-command-nexus-320-guardian.png) | [Command Nexus](tmp/macro-managerial-alignment/after-command-nexus-320-exam-guardian.png) | [Cost Directive](tmp/macro-managerial-alignment/before-cost-directive-320-guardian.png) |
| 390px recovery | [Macro](tmp/macro-managerial-alignment/before-national-engine-390-recovery.png) | [Macro](tmp/macro-managerial-alignment/after-national-engine-390-recovery.png) | [Cost Directive](tmp/macro-managerial-alignment/before-cost-directive-390-recovery.png) |
| 1440px report | [Macro](tmp/macro-managerial-alignment/before-national-engine-1440-report.png) | [Macro viewport](tmp/macro-managerial-alignment/after-national-engine-1440-report-viewport.png) | [Cost Directive](tmp/macro-managerial-alignment/before-cost-directive-1440-report.png) |

Visual review confirmed compact navigation rather than a dashboard, consistent menu controls, readable mobile recovery text, complete guardian names, retained themed artwork and readable report cards. No permanent Previous/Next/Enter Checkpoint row or Review Questions modal was introduced.

## Telemetry and protected-source preservation

All eight completed full-run CSV downloads contain exactly 117 headers. Baseline/current comparisons assert identical header ordering, response timing, selected answers, question identities, adaptive memory, Daily state, scores, checkpoint state and telemetry event sequences for a representative protected Standard encounter in each game. Full Standard and Exam runs each emit exactly 36 scored question events; Exam emits exactly three section commits and six deliberate revision events. Local retention, answer snapshots, field definitions, Class Answer Analysis and backend behavior are untouched.

The new privacy boundary changes only when current active Exam data may be downloaded. Completed-run export uses the original CSV writer and contract unchanged; stored draft/revision records retain their existing semantics. Daily selection/progress/completion/persistence calculations are unchanged, including exactly-once lifetime credit and date rollover. All question files, answer keys, explanations, difficulty metadata, art, resources and audio remain protected.

## Files changed

- `audit_tools/macro_command_engine/alignment.mjs`: embeds the Macro-only presentation adapter.
- `audit_tools/macro_command_engine/alignment.css`: bounded menu, Exam, introduction and report layout changes.
- `audit_tools/macro_command_engine/alignment.js`: utility order, neutral Exam presentation/privacy boundaries and keyboard introduction skip.
- `audit_tools/macro_command_engine/sync.mjs`: applies that adapter and normalizes complete generated output.
- `audit_tools/macro_command_engine/check.mjs`: Windows-compatible bank comparison and configurable evidence output.
- `audit_tools/macro_command_engine/browser.mjs`: configurable evidence output; replaces stale three-miss Standard expectation with the approved immediate-failure contract.
- Four generated `play/macro-command-system/<game>/index.html` files.
- `.gitignore`: excludes only this task's local evidence directory.
- `MACRO_MANAGERIAL_ALIGNMENT_REPORT.md`: inventory and implementation evidence.

No shared Composer/accessibility source, Faculty Composer output, Managerial, Economic Realm, Labyrinth, Cloudflare configuration, routes, secrets or subscription files changed. The Macro generator's only publication targets remain the same four Macro pages. `git diff --check` passes.

## Local commits and remaining decisions

1. `5341a2e9` — Align Macro Command menus and interface.
2. `941ea1d0` — Align Macro Command Exam UI and introductions.
3. Final local commit — Complete Macro Command functional parity (contains this final report and Gate 4 refinements).

No implementation-blocking owner decisions remain. Trial by Graph remains intentionally unavailable until a separately authorized content/metadata project supplies enough eligible questions. Consider a separate shared Composer follow-up for the inherited Exam guardian/Daily/export presentation gaps and introduction keyboard/layout issues; this task makes no competing shared-source edits.

Verification is local Edge/browser automation plus visual inspection, not a manual NVDA/VoiceOver audit or cross-browser certification. The shared helper's existing accessibility behavior is retained; keyboard focus, reduced motion, introductions, graph enlargement, live-region privacy and responsive layouts received focused checks. Only the requested full Standard/Exam flows were completed end-to-end in every game.

Work stops after local commits and this report. Nothing has been pushed, merged or deployed. The owner's separate Cloudflare preview review remains the next step.
