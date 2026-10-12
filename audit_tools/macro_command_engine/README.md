# Macro Command System engine alignment — 2026-10-11

## National Engine bank correction

After the engine-only pass, the owner confirmed that National Engine should not contain the discovered microeconomic questions. The active page now loads the existing `national_engine_question_bank_student.js` unchanged: **474 main/checkpoint questions, 73 repair questions and 84 bridge questions (631 total)**. It covers national accounts, inflation measurement, production/factor income, saving/investment, loanable funds and unemployment. All six referenced graph files exist and decode. Legendary is now available, making nine supported modes.

`active-profile.mjs` records this explicit correction separately from the historical captured profiles. The old embedded main, repair and bridge definitions are no longer executable content in the active page. Their historical source remains in Git and the captured profiles. None of the four external bank files was edited or replaced with Composer content.

New National Engine runs use `nationalEngineMacroSave_v1`, `nationalEngineMacroRoom`, and the `national-engine-macro-v1` engine namespace. They cannot resume old embedded micro questions, boss queues, repair state or mastery records, even where question IDs overlap. Both older save formats and room-only state are left untouched in local storage; they are no longer offered as resumable macro runs. New macro saves resume normally. Existing artifact ownership is retained, while new inventory and high scores use the macro namespace.

The focused bank-correction browser suite verifies exact equality of all active main/repair/bridge records with the existing macro file, all nine modes, all graph assets, scoring/report behavior, three actual old-engine save fixtures remaining isolated, the previous Composer save format remaining isolated, and a new macro run resuming with the same question/options. The source checker protects all 159 companion files and requires each page to load its intended external bank. The shared hardening suite checks the new save isolation contract across 16 HTML targets.

The following sections document the **historical engine-only pass**, before this correction. National Engine's eight-mode limit, embedded-bank preservation, missing-image exceptions and legacy save-import behavior below have been superseded. Current evidence is in `browser-focused-results.json` and `source-results.json`; `browser-results.json` records the earlier four-game run. Changes remain local and are not deployed.

## Original engine-only pass

The four live game-directory `index.html` files now use the current Faculty Concept Composer engine. The frozen engines lacked newer exam navigation and section commits, checkpoint attempt outcomes, remediation safeguards, consumable artifacts, daily challenges, additional practice modes, and current mastery/timing/CSV behavior.

This is an engine-only update. No Composer questions were imported. No question wording, IDs, options, answers, feedback, topics, pool assignments, repair questions or bridge questions were edited. All 159 tracked companion files remain unchanged, including external banks, historical HTML, resources and media.

| Game | Original main/checkpoint questions | Enabled modes |
| --- | ---: | ---: |
| National Engine | 249 | 8 |
| Mint of Ash and Gold | 516 | 9 |
| Command Nexus | 536 | 9 |
| Exchange Citadel | 534 | 9 |

The common modes are Standard, Timed, Exam, Quiz, Unlimited, Score Attack, Fading Fortune, and Risk & Reward. The latter three games also support Legendary. National Engine's active bank has no Legendary pools. None of these banks has the explicit graph-required/accessibility metadata needed for Trial by Graph, so that mode is not enabled. This does not imply the banks contain no graphs.

## National Engine's existing content discrepancy

The active `national-engine/index.html` used an embedded bank covering microeconomic subjects (LO11–13), plus `easyConceptPools` and `mediumConceptPools`. The separate `national_engine_question_bank_student.js` contains different content and was not loaded by that page. This update preserves all three active embedded definitions exactly and leaves that unused external file untouched. Substituting it would violate the requested question freeze.

The active bank already references six absent graph files: `Edgeworth11.4.png`, `edgeworth11.2.png`, `trade11.2.png`, `monopoly12.2.png`, `monopoly12.5.png`, and `moncomp13.4.png`. Those questions remain unchanged; affected graphs still require a separate content/asset decision. The browser asset check explicitly records these six pre-existing exceptions. It does not claim that those images work.

## Compatibility

- `sync.mjs` derives the engines from the maintained Composer template and reinstalls the frozen banks. Legacy metadata is adapted only in the validator's temporary view, without modifying question records. National Engine's original repair and bridge maps are exposed through the current engine's adapters.
- Original game titles, guides, bosses, artifact names/artwork, area labels, streak imagery, audio, high scores and existing instructional-resource routing are retained. The current Composer interface supplies mode selection, reports, checkpoint presentation and game controls. National Engine's obsolete presentation PNG paths now use the already-present WebP assets.
- The three existing modern save namespaces and all original artifact/achievement keys remain compatible. National Engine's `NationalEngine:standard:save:phase1.5` format is imported once into `nationalEngineComposerSave_v1_standard`; the original save remains available for recovery. Room-only legacy saves are also supported. An import marker prevents old progress from resurrecting after completion.
- The current question and answer order, run ID, elapsed time, room, checkpoint hits and remediation state survive conversion. Artifact fields are translated by position before loading, including old names whose meanings collide with Composer's names. New consumable inventory uses separate per-game keys.
- Local telemetry and CSV exports use current Composer behavior. Anonymous collection remains disabled. No deployment was performed.

## Verification

- **80 browser checks passed** in the complete initial regression run, with zero page exceptions: all 35 configured mode launches/answers, validation, assets against the frozen baseline, reports/CSV, mobile layout, checkpoint scoring, exam draft/revision commits, hub state and sound-menu visibility.
- **22 focused browser checks passed** after the final artifact migration fix: all 12 actual legacy-engine save fixtures (ordinary, checkpoint and remediation), ownership of each artifact in isolation across reloads, sound toggles/streak milestones, and National Engine room-only migration without save resurrection. Original saves are created with HTML and banks served from the pinned baseline commit.
- Source verification compares **22 complete engine functions per game** to Composer, checks all **159 companion files** against Git, protects the exact National Engine main/repair/bridge definitions, and verifies deterministic regeneration.
- The shared Phase 1.5 hardening suite passes across **16 HTML targets**. Its National Engine-specific test now executes and verifies the new migration, including preservation of the original save and elapsed time; National Engine also participates in the common current-engine checks.
- `git diff --check` passes. Browser testing is bounded regression coverage, not a full playthrough of every question. Evidence and screenshots are in `validation_artifacts/macro_command_engine/`.

## Maintenance

Run from the repository root:

```powershell
node audit_tools/macro_command_engine/sync.mjs
node audit_tools/macro_command_engine/check.mjs
node audit_tools/macro_command_engine/browser.mjs
node build/faculty-build-composer/tests/run_phase15_production_hardening_validation.js
```

`sync.mjs --check` verifies generated files without changing them. Browser tests require Playwright and Edge; set `NODE_PATH` or `PLAYWRIGHT_MODULE` to the installed module path. They use disposable contexts, serve local files, and block external requests. `MQ_TEST_FILTER` selects focused checks and writes a separate result file.

`capture.mjs` is pinned to pre-update commit `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`. The captured profiles are integration contracts, not a new question bank. Preserve the content assertions during future engine maintenance. Historical alternate HTML pages and the Macro Command hub were not changed.
