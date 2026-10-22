# Accessibility cleanup validation

Evidence-path note (PR cleanup): Generated files referenced under `validation_artifacts/` are retained locally as ignored test outputs and are not included in the current PR tree. The three captured production inputs for the boss comparison remain tracked. See [ACCESSIBILITY_PR_CLEANUP_REPORT.md](../ACCESSIBILITY_PR_CLEANUP_REPORT.md) for retention details. Historical test conclusions below are unchanged.

Date: 22 October 2026. Baseline: `5e1d5644cc4dffcf60a614c7dd12c568238e0e14`, branch `main`. Run from the repository root. All browser sessions used fresh synthetic profiles; external requests were blocked by `support.mjs` or `browser-guard.cjs`. No real saved progress was cleared and no test events reached production collectors.

## Tools and repeatability

Node: v24.14.1. axe-core: 4.11.0. Playwright: 1.62.1, loaded from the bundled Codex runtime (or `PLAYWRIGHT_MODULE`). Edge reported 155.0.4283.62. Chrome 155.0.8059.85 was used by existing simulation suites and the real browser-zoom check. Firefox and WebKit launch probes reported missing executables. No package is added to the production runtime.

PowerShell setup and propagation:

```powershell
npm.cmd install --prefix tmp/accessibility_cleanup --no-audit --no-fund axe-core@4.11.0 acorn@8.15.0
node audit_tools/accessibility_cleanup/sync.mjs
node audit_tools/economic_realm_engine/sync.mjs
node audit_tools/macro_command_engine/sync.mjs
node audit_tools/accessibility_cleanup/legacy.mjs
node audit_tools/accessibility_cleanup/hubs.mjs
node audit_tools/accessibility_cleanup/sync.mjs --check
node audit_tools/accessibility_cleanup/sync-check.mjs
node audit_tools/accessibility_cleanup/protected.mjs
git -c core.safecrlf=false diff --check
```

The Realm/Macro generators use changed-only temporary writes followed by rename. A Windows `EPERM` rename during one synchronization was retried successfully with the same authorized workspace operation. No Git reset or engine replacement was used. Older/manual builds receive the focused legacy transform, not `free_faculty_template/build.mjs` regeneration.

Build the local publication artifact, wait for completion, then scan. Do not rebuild/delete `dist` while a browser suite is reading it:

```powershell
$expected = Join-Path $PWD 'dist'
if ((Resolve-Path dist).Path -ne $expected) { throw 'Unexpected dist target' }
node audit_tools/public_site_publication/build-dist.mjs
$env:MQ_A11Y_OUT='validation_artifacts/accessibility_cleanup/closeout'
node audit_tools/accessibility_cleanup/scan.mjs final
```

`scan.mjs` enumerates every emitted HTML file; records title, detected modes, axe violations/incomplete results, asset failures, blocked requests and console exceptions; and launches standard play in applicable games. It serves axe locally under the existing CSP. It neither disables CSP nor suppresses rules. Canonical/blank templates are inspected without inventing a playable question pool.

Focused suites:

```powershell
$env:MQ_A11Y_OUT='validation_artifacts/accessibility_cleanup/closeout-v2'
node audit_tools/accessibility_cleanup/modes.mjs
node audit_tools/accessibility_cleanup/interactions.mjs
node audit_tools/accessibility_cleanup/contrast.mjs
node audit_tools/accessibility_cleanup/representative.mjs
node audit_tools/accessibility_cleanup/states.mjs
```

Choose a new output folder when preserving another run. Early attempts under the top-level evidence folder and `states-v2` through `final-v4` are retained. Their failures are not silently reclassified as passes.

## Coverage and outcome matrix

| Evidence / suite | Actual coverage and result |
|---|---|
| Baseline route scan | `baseline-final-scan.json`: 82 HTML routes. Text contrast, missing language/structure, repeated image alt and definition-list findings reproduced. Current Analysis route was tested separately rather than claimed in this baseline scan. |
| Final publication scan | `final-publication/final-scan.json`: 83 HTML routes; 24 successful gameplay question states (22 maintained missions, beta Composer game and starter). Current routes have no runtime exceptions; only the reviewed nested-aside best-practice result remains among their scanned violations. Historical copies remain explicit exceptions. No new route/runtime asset failures attributed to accessibility repairs. |
| `representative.mjs` | All ten modes in the starter; wrong-answer focus, delayed-feedback tree exclusion, graph description and keyboard lightbox, setup cancellation, stored decorative-motion preference, nested graph/confirmation focus restoration and required-graph failure blocking. `representative-final/representative.json`: 13 passes. |
| `states.mjs` | Starter, Market Gate, National Engine, Cost Directive and Labyrinth: 320px + specified text spacing, touch emulation with keyboard, menu trap/return, save/run-ID resume, fixture checkpoint, real one-question Quiz completion, report and CSV download. Four public hubs: splash/inert/menu. Tablet 200% text resizing and actual Chrome 400% zoom (1280 physical viewport → 320 CSS px). `closeout/states.json`: ten passes. |
| `modes.mjs` | Controlled random seed and browser clock, matched wrong/correct/correct sequences against starting Git HTML and current HTML. 48 mode/family combinations. Compare selected question ID, room, attempts, correct count, streak, scores/bankroll and remediation state; separately assert withheld feedback is absent. Final results under `closeout-v2/modes.json`. |
| Protected-source comparison | `protected.json`: 430 AST-indexed checks across 26 changed game HTML files; zero protected-expression/function changes and zero question-bank/model/storage changes. Selected protected functions include answer handling, question selection, scoring, report construction, save state and network sending. This is targeted source evidence, not a formal proof of all behavior. |
| `interactions.mjs` | Synthetic local Realm recovery (invalid then valid), sequential access retained, artifact/achievement nested keyboard dialogs, repeated Enter/held-key protection, background isolation, no positive tabindex. Final result under `closeout-v2/interactions.json`. |
| Rendered contrast | `contrast/contrast.json` retains initial conservative pixel samples over actual gradients/images; `contrast-settled/contrast.json` measures the settled view. Home default and hover/focus passed sampled thresholds. Report heading ≈14.24:1, muted report text ≈6.98:1 or higher in the initial sampled run. Initial checkpoint warnings came from the overlapping temporary Daily notice; settled numerals passed with their original background. Disabled artifact controls and emoji/text-color sampling limits are identified rather than hidden. |
| Composer existing workflow | `existing/faculty/run_content_scope_browser_validation.cjs/output.log`: passed keyboard concept/learning-outcome filters, readiness blocking, recipe round-trip, official generation, ZIP entries/checksums, exact runtime pool and embedded assets. |
| Composer official/custom validators | `final/themes.log`, `final/custom.log`: passed. Official default, Arcane Archive, Market Citadel, Managerial Cost Directive and hybrid fixtures; custom image integrity, portability and recipe checks. |
| Additional faculty browser workflow | `final-v3/faculty.json`: seven passes. Preset/slot/reset focus; invalid/valid upload with associated message; saved/imported custom appearance; five official/hybrid and one custom standalone export opened at 320px, graph description/lightbox/return, no external dependencies or runtime errors. |
| Manual template and validator | `existing/faculty/browser.mjs/output.log`: passed supported modes, graph/failure safeguards, save/repair/completion/CSV and manual question-package validation. Original runtime retained. |
| Class Answer Analysis | `existing/faculty/class-browser.mjs/output.log`: passed synthetic CSV errors, deduplication/batch/filter/summary and downloads. No real student CSV used. |
| Econ-nections | `existing/puzzle/browser.test.mjs/output.log`: passed selection/deselection, submission, misses/one-away, solved groups/results and domain/next behavior, storage failure; 320/390/420/768 layouts and all 384 labels. Classroom route received automated scan, not an instructor-led end-to-end session. |
| Generic economics RPG | `existing/simulations/browser.test.mjs/output.log`: passed scenario choices, feedback, help/restart and ending/debrief checks. |
| CPI/GDP Live | Initial suites reached a stale preview-server Growth Realms card route (404). The preview server now matches publication's external-game mapping. `existing/retry-cpi/results.json`, `existing/retry-gdp/results.json`: passed. |
| Labor Force Files | `existing/labor-fixed/`: 20 full keyboard runs, all 24 variants, desktop/mobile/zoom, perfect and miss paths, resume/replay, event count assertions; passed. `existing/labor-ui-fixed/`: six sizes, associated field feedback/correction, retained partial inputs, measured contrast; passed. `existing/current-labor/` summary suite: passed current charts/tables/report data. |
| Takeout Taco | Lunch Rush passed in `existing/simulations/`. Counting the Cost passed in `existing/current-taco/`, including complete game/lab and blocked storage. |
| Investment Desk / Road Ahead | Both passed in `existing/simulations/`; original calculations, choices, storage and reports retained. |
| The Long Run / Growth Realms | `additional/additional.json`: both passed existing deep suites, including Long Run's 243 outcome paths and graph-state comparisons, Growth Realms playthrough/character/layout/interaction checks. |
| Signal House current release | `additional-current/shock-house-release-browser.cjs.log`: passed desktop/phone/landscape/tablet, swipe and non-drag controls, return navigation, save compatibility and debrief/recovery fixture. Historical panorama suite is not a full current-release pass; see failures below. |
| Money in Motion | `additional-current/money-in-motion-browser.test.cjs.log`: passed keyboard operations and multiple layouts through results; repeated in v2 successfully. |
| At the Box Office | `additional-current-v2/at-the-box-office-browser.test.cjs.log`: passed current full season/results, save/restart, target/layout and zoom tests after its stale inventory count was corrected to the maintained configuration. |

Mode names actually present: Standard Campaign, Timed Trial, Exam Drill, Quiz, Unlimited Practice, Legendary, Score Attack, Trial by Graph, Fading Fortune, and Risk and Reward. The five matched representatives expose 10 + 10 + 9 + 9 + 10 modes. Trial by Graph is not offered in National Engine or Cost Directive; no absent mode was added. Route inventory records per-build availability, including missions that do offer graph mode.

## Reusing existing suites without touching historical evidence

```powershell
node audit_tools/accessibility_cleanup/existing.mjs faculty
node audit_tools/accessibility_cleanup/existing.mjs puzzle
node audit_tools/accessibility_cleanup/existing.mjs simulations
$env:MQ_TEST_CHANNEL='msedge'
node audit_tools/accessibility_cleanup/existing.mjs current current-labor
# Optional third argument selects a new result directory; fourth filters filenames.
node audit_tools/accessibility_cleanup/existing.mjs simulations labor-fixed labor-force
$env:MQ_A11Y_OUT='validation_artifacts/accessibility_cleanup/additional-current'
node audit_tools/accessibility_cleanup/additional.mjs current
```

The runner creates temporary sibling test files only to redirect output destinations and install external-network blocking; it removes them afterwards. Some suites use stronger-than-AA target-size assertions. Core assertions were not removed. Existing tests were repaired where their setup assumed offscreen lazy images would decode before scrolling, where their image-fit expectation predated an already-shipped UI update, and where literal hub inventories omitted already-maintained games. The original failures remain recorded.

Official/custom fixtures:

```powershell
$env:MQ_PHASE3A_FIXTURE_DIR='tmp/accessibility_cleanup/theme-fixtures'
$env:MQ_PHASE3B_FIXTURE_DIR='tmp/accessibility_cleanup/custom-fixtures'
node build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js
node build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js
node audit_tools/accessibility_cleanup/faculty.mjs
```

## Failures, retries and interpretation

- Initial shared-helper iterations exposed a Micro-only missing image-resolver function and narrow report layout. These were repaired; later Micro state/mode runs passed. No broken interim output was deployed.
- Nested modal testing initially used the opposite order from actual visual stacking, then exposed stale opener tracking. The fixture was corrected, opener tracking repaired and the nested path passed.
- A final mode rerun found legacy Exam histories retaining generic “response saved” text because older runtimes lacked the new capability helper. Question correctness/feedback exclusion still passed, but the archive should not appear in Exam. The helper now explicitly follows the old engines' Exam restriction, and the 48-case comparison was rerun. No gameplay timing/rules changed.
- CPI/GDP initial failures were a local preview route mismatch, repaired in `serve.mjs`. Their retry suites passed.
- Labor tests initially stalled awaiting `decode()` on lazy-loaded offscreen hub artwork. Interrupted runs are recorded with nonzero termination codes. Scrolling into view repaired the harness; complete reruns passed. These were not product/browser-startup failures, despite the initial diagnostic suspicion.
- Taco Cost's expected eight Micro cards omitted Investment Desk and Road Ahead. Box Office expected 13 preview games where current configuration has 17. Expectations were brought into line with the current maintained inventory, without removing gameplay or accessibility assertions; both reran successfully.
- Historical Signal House `panorama.cjs` still fails at the superseded `groceries` action. No test was deleted or private puzzle answer rewritten to bypass it. Current release tests passed, but this does not establish complete current puzzle-branch coverage.
- One redundant Signal House rerun overlapped a local `dist` rebuild and received a local 404. Its failure remains under `additional-current-v2`; the earlier stable-publication run passed. The final scan runs after publication completion.
- Six archived HTML copies retain their baseline failures; the native instructional aside retains its reviewed axe best-practice result. All axe `incomplete` records are retained. Neither a zero-violation page nor a sampled contrast pass establishes overall conformance.

## Screenshots and manual gaps

Before: `baseline-final-market-gate.png`, `baseline-final-faculty-build-composer.png`, `baseline-final-econnections.png` in the main evidence folder. After: final scan counterparts; `closeout/state-*-320.png`, `closeout/completion-*.png`, `closeout/chrome-400-percent.png`, `final-v4/after-graph-320.png`, `final-v3/faculty-custom-390.png`, plus simulation screenshots under ignored `tmp/accessibility_cleanup/`. Temporary profiles, dependencies and generated exports are deliberately ignored by Git. Audit evidence is not public content.

**Actual screen-reader testing: NOT PERFORMED.** No NVDA, VoiceOver or other reader was exercised. Firefox/WebKit automation, physical iPhone/Safari, real Android/TalkBack, audio listening/caption verification, and full-frame flashing measurement were not performed. Browser accessibility trees and device emulation are explicitly narrower evidence.

Manual script for NVDA + Firefox/Chrome and VoiceOver + Safari, using a fresh synthetic profile:

1. Navigate site headings/landmarks and skip link; operate the mobile menu and close it. Check visible focus at 200% text, 320 CSS px and 400% zoom, including text-spacing overrides.
2. Enter a hub, pause motion, open menu/recovery; hear the invalid-code error once and its association. Restore a test mission, open artifact and achievement detail, then close each nested overlay. Confirm focus and virtual cursor return correctly, with background unavailable only while modal.
3. Start a game through normal controls. Hear the question/options, choose wrong/correct answers, access already-released feedback history, and open/read/close graph details and enlargement. Confirm the graph description matches visible information without answer-key additions.
4. In Exam, select/revise answers and use the actual section-commit path. Confirm no correctness, rationale or future solution appears or is spoken before the normal release point. Compare with immediate modes. Listen for duplicate statuses and unwanted per-second announcements.
5. Play a checkpoint, save/reload/continue, cancel exit, finish, read Mastery Report headings/tables and copy/download. Check focus is useful after replacement and ordinary statuses do not steal it.
6. Operate Econ-nections tiles and miss/one-away/solved/results controls; play current RPG/Signal House and simulations to endings/debriefs using keyboard and equivalent non-drag controls.
7. In Composer, change presets/slots, upload a bad then valid synthetic image, resolve validation, round-trip a recipe and open the exported game offline. Import bad then valid synthetic CSVs in Analysis; check errors, filters, summary and download announcements.

Record browser/reader versions, spoken wording, focus location, expected/observed result and route/state for each failure. Do not enter production student data or submit real request/subscription forms.
