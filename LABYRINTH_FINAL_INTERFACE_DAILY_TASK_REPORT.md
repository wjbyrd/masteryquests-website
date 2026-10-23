# Labyrinth final interface and Daily Task alignment

Starting branch: `labyrinth-interface-exam-alignment`. Starting commit: `2c5c2a8a`. Working tree was clean. Work is limited to Labyrinth and its validation/report files; no push, merge, deployment, or Cloudflare changes.

## Stage A — Exam navigation

The final isolated `labyrinth-exam` wrapper remains authoritative after the historical declarations, measurement contract, and accessibility wrappers. The original gameplay functions remain delegated for other modes. Economic Realm's current `updateMazeTrack` uses active-section room buttons and a checkpoint button that invokes `selectExamCheckpoint` only after nine saved answers. Composer, Macro, and Managerial were also exercised by the existing cross-engine reference test.

Removed the bottom navigation panel. The 30-room grid now has explicit Checkpoint I/II/III labels, a concise section status above it, and targets at least 44 pixels wide and 48 pixels high. Mobile uses five columns. All existing draft, revision, scoring, commitment, question association, and checkpoint handlers are retained. Leaving Exam removes its grid styling/status.

Acceptance: four viewport keyboard/touch/layout checks passed at 1440, 820, 390, and 320 pixels. Full Exam comparison passed across 45 states against `2c5c2a8a`: question/option identity, counters, adaptive/mastery state, guardian outcomes, report evidence, artifact state, 70-column schema and event traces matched. Six focused Exam checks passed, including full completion (36 accepted responses, three commits, three summaries), early exit, cross-engine reference, keyboard/graph/axe checks at 390/820, and pending-verification abandonment. Mouse navigation is exercised throughout full runs. Incomplete/locked checkpoint entry remains unavailable and guarded programmatically; commitment cannot repeat.

Evidence (ignored): `tmp/accessibility_cleanup/labyrinth-final/`, including `after-exam-navigation.png`, `exam-grid-{1440,820,390,320}.png`, baseline comparison results and `stage-a/phase2-results.json`. The first layout pass caught a legacy fixed desktop width; the corrected four-viewport rerun passed.

## Stage B — Game Menu and replay

Committed as `caa2abfe`, after Stage A commit `69d83668` passed its acceptance gate.

Renamed the entry and modal to Game Menu and reordered the existing controls. Mode Selection keeps the original warning, save, return, and cancellation handlers. Fullscreen keeps capability detection; sound keeps its original mute handler; motion keeps `mq:accessibility:decorative-motion` and the OS preference fallback. Buttons share widths, typography, borders, focus/hover styling and 10-pixel gaps. Close remains the original modal cancel action. The conditional Timed Trial released-explanation review remains available as an additional existing control; removing that approved learning feature was outside scope.

Labyrinth has no independent opening cinematic: its opening is the title and `start-screen-image.webp`. The Sovereign dialogue is a later final-guardian encounter coupled to gameplay. Replay therefore presents the unchanged opening title/artwork in a native dialog with Skip / Return to Game, Escape, focus containment and restoration. It never invokes startup, question rendering, RNG, save loading, or guardian dialogue. No new narrative or animation was introduced. Existing reduced-motion preferences remain in effect.

Timing policy: the existing Game Menu pauses Fading Fortune; replay closes that menu and resumes its clock. Replay itself pauses nothing. Score Attack response time and Timed Trial continue. Timed expiry closes replay and presents the normal result. An acceptance test caught the legacy graph Escape handler rescheduling a Fading timer; replay now consumes Escape before that handler. Final scoring, response-time and expiry comparisons pass.

Acceptance: ten mode-specific menu/replay tests passed, including keyboard/touch, confirmation cancellation, Exam draft preservation, unchanged state/events, and timer comparisons. The separate response-clock test passed for Score Attack, Fading Fortune and Timed expiry. The 23-case phase2 suite passed: nine baseline mode comparisons, four responsive/axe cases, sound/motion persistence, supported/unsupported fullscreen, Standard save/resume, natural boss failures/retries/completion, and six Exam checks. Replay also passed axe. The Daily control was hidden in the Stage B commit until Stage C supplied its functionality.

Evidence: `tmp/accessibility_cleanup/labyrinth-final/game-menu-mobile.png`, `introduction-replay.png`, and `stage-b/phase2-results.json`.

## Stage C — Daily Tasks

The `labyrinth-daily` adapter runs after the final Exam wrapper. Its `DailyChallengesCore` is byte-identical to the current Composer template, Economic Realm, Macro Command, and Managerial parity script. The canonical browser functions for identity, eligibility, normalization, persistence, progress text, completion credit, milestones, diagnostic snapshots and accepted-event processing are reused. All changes remain local to Labyrinth; none of the four reference implementations was edited.

The core selects a task deterministically from quest identity and the browser's local calendar date, with the canonical two-day family cooldown and quick/standard/stretch parameter rotation. It never draws gameplay randomness. Labyrinth's existing composition fingerprint remains its Daily identity. Eligible pools follow its actual ten modes, including the existing graph, Fading Fortune and Risk & Reward candidate filters. The published bank supplies 408 unique accessible questions, 90 graph-bearing questions and 11 concept identities. All six canonical families are eligible: correct answers, streak, accuracy window, perfect stretch, graph questions and concept variety. No category needs to be invented or excluded; no artifact-use objectives or new game mechanics are added. Repair/bridge pools are excluded from eligibility counting by the canonical core, while accepted recovery responses use the same canonical accepted-event rule as other responses.

Progress consumes only the existing accepted `question` event, using the resolved question and current streak. Exam's scoring wrapper temporarily restores the original committed question before this event, preserving question/concept association. Provisional selections, revisions, navigation, rejected rapid guesses and blocked duplicate submissions do not count. Repeated exposure counts when a new answer is accepted, as in the canonical system; concept variety counts each distinct concept once. Progress spans modes and playthroughs. Completion is credited once per date; subsequent accepted responses increment the canonical post-completion count.

### Storage and reset

Local state uses `labyrinthChoice:daily:v1`, separate from existing Standard saves, profiles, artifact keys and telemetry. Its version-1 object contains today's task/progress, credited dates, lifetime completion count and the last eight family-history entries. Same-day reloads preserve progress. Missing older-profile state initializes safely; duplicate credited dates normalize without reducing a larger lifetime total. The next local midnight resets today's task, preserving completion history. The canonical scheduler uses midnight plus 100 milliseconds and a minimum 1-second timeout; visibility restoration and menu opening also reconcile the date. Failed storage writes do not prevent gameplay; in-memory state remains available for that page.

### Interface and assessment privacy

The final menu order is Mode Selection, Fullscreen, Daily Task, Replay Introduction, Sound, Decorative Motion, Close. The Daily button uses canonical `Daily Task · value/target` and `Daily Task ✓` labels. Its details reuse the existing modal, showing the canonical task description, progress/window state, completion total and next milestone, with Back to Game Menu and Close. Nothing is inserted beneath questions. Updates remain inside the menu rather than displaying toasts over gameplay.

During an active Exam the button shows only `Daily Task`; details show the task description and “Progress is available after this assessment ends.” Progress numbers, completion status, lifetime totals, milestones and notifications are withheld throughout all sections/checkpoints. Accepted responses still update local progress; normal display returns when the assessment ends. This deliberately closes a correctness side channel rather than exposing intermediate checkpoint progress.

### Telemetry boundary

The existing 70-column header, serializer, accepted-question events, measurement contract, privacy defaults and retention remain unchanged. The integration follows Managerial's existing accepted-event wrapper. It creates no extra event IDs or RNG calls and does not emit an incomplete `daily_complete` row with unsupported data. No backend collection is added; Daily Tasks work entirely locally with external requests blocked.

Internal diagnostic snapshots retain the canonical Daily ID/date/family/target/window, eligible families, progress before/after, window number/failure, concept, completion/already-complete/credited-now flags, completion timestamp, qualifying and post-completion counts, elapsed time to completion and time since completion. These Daily-specific metrics are not exported through the 70-column schema. No unrelated fields are repurposed and no historical values are fabricated. The separately approved telemetry migration must add a supported export contract before these metrics can be exported.

### Validation and protected behavior

Validation uses isolated synthetic browser profiles, real published questions, a controlled browser clock and blocked external requests. The six families are each completed through the real answer handler with wrong and correct responses; the accuracy test also fails and resets a window. Every accepted transition is checked against the canonical core. Tests cover post-completion activity, repeated exposure, cross-mode play, reload, partial progress, completed-day rollover, scheduled midnight reset, older profiles, Standard save/resume, rapid-guess rejection and Exam withholding. Four desktop/tablet/mobile Daily menu/detail cases check touch, keyboard, focus, equal button metrics, 10-pixel gaps, overflow and axe.

The final 23-case phase2 regression suite and nine deep gameplay cases passed. Standard natural runs exercise failure/retry at rooms 10/20/30 and eventual three-response victories. Separate tests confirm a first miss after one or two correct guardian answers still ends the encounter immediately with the three-room setback, unchanged checkpoint and no artifact. Recovery stages/closure, older saves, full Quiz selection/report behavior, Timed expiry/released-only review, Score Attack, Fading Fortune and Risk & Reward bust match the baseline. Additional seeded comparisons track exact RNG draw counts in all ten modes.

Graph banks, descriptions, alt text and artwork are unchanged. The existing graph/lightbox handlers remain intact. The final graph checks traverse all 90 graph-bearing questions at desktop and mobile widths, verifying normal/enlarged descriptions, accessibility-tree associations, keyboard disclosure/enlargement, focus restoration and reachable lightbox content. All 21 image files are compared byte-for-byte with the starting commit.

Final result counts: 18/18 interface, replay, graph and full-Exam cases; 15/15 Daily cases; 23/23 phase2 regressions; 9/9 deep regressions. The nine non-Exam seeded comparisons were additionally rerun with exact RNG counters, all passing. The full Exam comparison includes RNG counts and exactly 36 Daily-eligible responses. A final static boundary check confirms that all original runtime code before the local presentation block is identical apart from three menu-label changes and the two artifact fingerprints; the Exam implementation is identical apart from navigation rendering/cleanup. Inline scripts compile, the fingerprint check passes, and `git diff --check` is clean.

## Evidence and remaining limits

All generated screenshots, browser logs, synthetic CSVs and reference fixtures stay under ignored `tmp/accessibility_cleanup/labyrinth-final/`. Reproducible test entry points are `audit_tools/labyrinth_alignment/final-alignment.mjs`, `daily-validation.mjs`, and `validate.mjs` (phase2/deep, baseline environment variable `MQ_LABYRINTH_BASELINE=2c5c2a8a`). The artifact's two existing registry aliases receive the updated engine fingerprint; no measurement release or schema changes.

Local screenshots include `exam-grid-390.png`, `after-exam-navigation.png`, `introduction-replay.png`, `daily/menu-390.png`, `daily/daily-390.png`, and the desktop/mobile graph images. Daily and seven-control menu screenshots are in `daily/`; earlier Stage B screenshots precede Daily activation.

![Revised Exam grid and question, mobile](tmp/accessibility_cleanup/labyrinth-final/exam-grid-390.png)

![Final seven-control Game Menu, mobile](tmp/accessibility_cleanup/labyrinth-final/daily/menu-390.png)

![Daily Task details, mobile](tmp/accessibility_cleanup/labyrinth-final/daily/daily-390.png)

Physical-device and assistive-technology testing beyond Edge/Chromium, touch emulation, keyboard, axe and the browser accessibility tree remains for owner preview inspection. Replay intentionally shows the existing title-screen presentation, because there is no separate opening cinematic. The preserved optional Timed explanation-review action is the only existing conditional addition to the seven-item menu. Daily-specific CSV export remains deferred. No production or preview deployment, push, merge, Cloudflare setting, subscription, secret, route, other collection, or question-bank change was made.
