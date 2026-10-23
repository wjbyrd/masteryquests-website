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

Pending subsequent gates. All generated evidence stays under `tmp/macro-managerial-alignment/` and is excluded from commits.

### Gate 2 — interface and menu

Confirmed fixes: Sound precedes Decorative Motion; every utility has the same width, spacing and stable hover geometry; Game Menu launcher matches the reference 44px minimum height. Existing Sound, Motion, Escape and conditional Timed review controls retained. All four games pass `gate2.mjs` at 1440/820/390/320 (`gate2-results.json`), with real after screenshots. Visually inspected desktop and narrow mobile captures.

The baseline synchronization failure was exclusively mixed CRLF/LF in imported resource fragments (97 CR bytes in National Engine's otherwise LF-generated output). Normalized current/generated documents were identical. The generator now normalizes its complete output; `sync.mjs --check` passes. No gameplay correction was bundled into that fix.

### Gate 3 — Exam and introductions

All four games pass `gate3.mjs` (`gate3-results.json`). Fresh Standard starts show the authored guide; returning starts and saved-run resume suppress it as designed. Replay preserves question/options, mode, room, attempts, score/streak, adaptive memory, artifacts, telemetry count and Exam drafts/revisions. Nine saved responses enable the existing checkpoint tile; commitment counts nine attempts exactly once.

Macro-only presentation changes: neutral guardian dialogue in Exam; understated instructional sentence; removal of inherited button margins so the existing grid tiles align in exactly three rows. The grid itself and assessment engine were retained. Guardian images/names and non-Exam authored challenge lines are unchanged.

Daily computations, persistence and event records continue normally. While Exam is active, its menu uses a neutral Daily Task label/details and suppresses progress/completion toasts. Progress is available after ending Exam. Active-run CSV download is deferred until Exam ends because retained draft revision-direction fields could reveal correctness; completed-run CSV rows and headers remain unchanged. This addresses shared Composer presentation dependencies locally, without editing shared sources.
