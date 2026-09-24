# Labor Force Files — implementation and QA

2026-09-23. Private instructor preview. No push or deployment.

## Game and scope

**LABOR FORCE FILES** is available at `/games/labor-force-files/`, served by the existing private loopback preview. `CONFIG.title` in `game/games/labor-force-files/config.js` controls both the game and library-card title. The HTML fallbacks use a generic description rather than duplicating the working title.

The game uses a charcoal/off-white report interface with restrained teal controls, outlines and accents. The supplied noir art provides the visual theme; the writing uses modern, direct language. This is a measurement simulation with nine stages and 17 short checks, including four person classifications. There are no RPG choices, timers, achievements, added macroeconomic topics or additional end-of-game quiz.

Created under `audit_tools/econ_rpg/game/games/labor-force-files/`:

- `config.js`: centralized title, model note, authored pools, person definitions and scene alternatives.
- `engine.js`: derived labor accounts, validated population flows, selection, guarded transitions, parsing, hints and scoring.
- `view.js`: compact artwork, exact population table, calculations, classification, interpretations, headline audit and results.
- `summary-chart.js`: final-report rate snapshots, two-series graphic, equivalent table and run-specific graph takeaway.
- `app.js`: DOM interactions, keyboard focus, progressive hints, safe input handling and persistence integration.
- `storage.js`: current-run/last-selection storage and action-replay validation on resume.
- `telemetry.js`: anonymous, browser-local events with bounded run retention.
- `index.html`, `labor-force-files.css`: semantic shell and responsive noir presentation.
- `card.js`: private-library card configuration binding.

Additional new files: `art/labor-force-files-assets.json`, `labor-force-files.test.mjs`, `labor-force-files.browser.test.mjs`, and this report, all under `audit_tools/econ_rpg/`.

Modified: `game/games/index.html` adds the ninth card/module; `README.md` adds the route/report; the library browser test expects nine cards and respects the previously committed Takeout Taco cover treatment; `publication.test.mjs` adds the new game's identifiers and artwork hashes to the existing public-build exclusion checks. No shared styles, other-game runtime, scenario economics, public navigation or deployment configuration changed.

## Supplied art

All files remain byte-for-byte unchanged in `audit_tools/econ_rpg/game/art/scenes/labor-force-files/`. Each is 1672 × 941. The manifest records the original byte counts and SHA-256 hashes; tests compare every file with that manifest. Visual inspection found no conflicting mapping.

| Asset | Use | Alternative-text meaning |
|---|---|---|
| `labor-1.webp` | Baseline, classification, initial UR/LFPR, library card | Adult population divides into the labor force and those outside it; the labor force divides into employed and unemployed people. |
| `labor-2.webp` | Direct employment increase | Employment grows and unemployment shrinks within the same labor force. |
| `labor-3.webp` | Direct unemployment increase | Unemployment grows and employment shrinks within the same labor force. |
| `labor-4.webp` | Labor-force expansion | The labor force expands and the outside group shrinks; entrants may work or search. |
| `labor-5.webp` | Discouraged-worker case | Unemployment shrinks and the outside group grows as active search stops; employment stays unchanged. |
| `labor-6.webp` | Mixed case and final headline synthesis | Several population groups change; trace their exact flows in the report. |

The scene image is uncropped with `object-fit: contain` and intrinsic dimensions. It is capped at 220px high on desktop, 260px on tablet, and scales naturally at narrow phone widths. Exact counts and rates always exist outside the image in a semantic table. The caption explicitly tells students that groups are illustrative and report counts are exact. No silhouette counting is required. The card uses the existing 4:3 contain treatment to retain all group boundaries.

## Instructional sequence

| Stage | Checks | Cognitive work |
|---|---:|---|
| 1. Build the labor force | 1 | Read exact population counts and combine employed with unemployed. The two accounting identities appear after correction. |
| 2. Who counts where? | 4 | Classify part-time employment, available active job search, retirement without search, and discouragement without search using native buttons. |
| 3. Unemployment rate | 1 | Retrieve the denominator and calculate UR. |
| 4. Labor-force participation | 1 | Calculate LFPR using the adult-population denominator. |
| 5. Direct change | 2 | Predict UR, then calculate it and identify unchanged LFPR using a radio group. |
| 6. New participants | 3 | Predict LFPR, calculate both rates, and transfer the reasoning to employment growth alongside higher UR. |
| 7. Discouraged workers | 2 | Calculate the lower UR/LFPR, then distinguish labor-force exit from job finding. |
| 8. Mixed flows | 2 | Trace concurrent flows; calculate labor force, UR and LFPR; interpret the result. |
| 9. Headline audit | 1 | Evaluate a newspaper headline against before/after employment, unemployment, participation and both rates. |

Each incorrect response explains the relevant criterion or denominator and permits correction. A part-time worker is employed. Someone without a job counts as unemployed in this simplified model when available and actively searching. A discouraged person wants and is available for work but stops searching because they believe suitable work is unavailable; they are outside the labor force. Duration of unemployment is not used to define discouragement.

UR and LFPR formulas are never automatically supplied before calculation or forced open after a wrong answer. **Need a hint?** reveals denominator guidance. A separate **Show formula** button reveals the formula with a spoken mathematical equivalent. Controls expose expanded state, keep focus on the activated button and preserve typed drafts during toggles. Saved runs retain requested hints; replay resets them.

After the initial calculations, baseline rates remain visible. Each change case supplies before and after counts, withholding the new rate until the student calculates it. Correct responses reveal the rate and explain the population flow. Results show overall first-attempt accuracy, checks including UR, checks including LFPR, classification performance, headline completion and a concise takeaway from the selected headline case. The rate performance counts refer to complete calculation checks, not independently scored fields in a combined form.

## Accounting and authored variants

All counts are integers. The single calculation engine derives labor force = employed + unemployed; not in labor force = adult population − labor force; UR = unemployed / labor force × 100; LFPR = labor force / adult population × 100. Neither scenario prose nor asset labels supply answer rates. Invalid, negative, fractional or impossible populations and flows throw errors. Authored cases have positive labor forces; the engine rejects zero-denominator populations.

| Baseline | Adult population | Employed | Unemployed | Labor force | Outside labor force | UR | LFPR |
|---|---:|---:|---:|---:|---:|---:|---:|
| district-a | 250 | 160 | 10 | 170 | 80 | 5.9% | 68.0% |
| district-b | 300 | 180 | 20 | 200 | 100 | 10.0% | 66.7% |
| district-c | 400 | 228 | 12 | 240 | 160 | 5.0% | 60.0% |
| district-d | 500 | 285 | 15 | 300 | 200 | 5.0% | 60.0% |
| district-e | 200 | 114 | 6 | 120 | 80 | 5.0% | 60.0% |

- **5 baseline packs.**
- **2 employment-increase variants:** 2 or 4 unemployed people find work. With five baselines, ten validated cases.
- **2 unemployment-increase variants:** 4 or 8 employed people lose jobs and actively search. Ten validated cases; LFPR remains unchanged.
- **3 expansion variants:** 20 entrants all find work; 5 find work and 15 search; or entrants match the baseline employed/unemployed proportions. The proportional case uses the smallest integer ratio derived from the authored baseline. Across all 15 cases, LFPR rises; UR respectively falls, rises or stays unchanged.
- **3 discouraged-worker variants:** 2, 3 or 4 unemployed people stop searching. All 15 cases keep employment and adult population fixed while unemployment/labor force fall equally and nonparticipation rises. Both rates fall, without any job finding.
- **3 mixed variants:** unemployed-to-employed / outside-to-employed / outside-to-unemployed counts are 2/8/5, 4/12/2, or 1/6/3. All 15 cases conserve population. The challenge is tracing categories rather than difficult arithmetic.
- **6 headline audits**, each validated against all five baselines: job finding; discouragement; job loss; entry that raises employment and UR; proportional entry with unchanged UR and higher LFPR; and entry directly into jobs with higher employment and LFPR. Two headlines contain a misleading inference; the other four require interpreting an accurate headline. Each offers exactly one intended explanation consistent with the authored case.

These independent pools produce **5 × 4 × 3 × 3 × 3 × 6 = 3,240 combinations**, using 24 authored pool entries. Every new run excludes the most recent ID in each of the six categories. Direct-case IDs rotate, although two different IDs can share the same hiring/loss scene. Both scenes occur across repeated fresh runs.

Counts accept whole-number equivalents such as `170.0` and standard comma grouping, with exact count acceptance. Rates accept `5.9`, `5.9%`, `5.88` and `5.88%` for a 5.882…% target, using a tolerance of 0.05 percentage points. Display rounds to one decimal; subsequent calculations use full precision. Empty, malformed, negative, nonfinite and code-like inputs are rejected. Percent signs on population counts are rejected.

## Saved runs and telemetry

`mq.labor-force-files.active.v1` stores the active report; `mq.labor-force-files.last.v1` stores only the six last-used IDs. Reload preserves the run ID, selections, submitted answers, stage, attempts, score and hints. Saved actions are replayed to verify internal consistency; corrupt state is rejected. Unsubmitted typing is retained through hint toggles but is not itself a saved answer. Play Again creates a new anonymous ID and resets progress with fresh selections. No identity tracking or backend is introduced.

Events use the existing local-only convention with `mq.labor-force-files.run.v1.*` and a 20-run limit. Events cover start, baseline/classification presentation, attempts/completions, rate checks, predictions/calculations, discouraged interpretation, mixed case, headline audit, hints and completion. Fields include run/game/case/pool IDs, stage, attempts, correctness, exact counts, derived rates, parsed answer, hint level and elapsed time. Reload appends to the same record without duplicating start or completion. Storage failure shows a notice while keeping in-memory play available.

## Accessibility and QA

- **98 unit/regression tests pass**, including seven new labor-game suites and the actual public-build exclusion check.
- Every one of the **3,240 full combinations** is played through with a wrong answer and correction at every check, one accepted interpretation, transition/duplicate guards, unchanged baseline, render validity and final score verification.
- Independent reference arithmetic verifies all five baselines. All direct, expansion, discouraged, mixed and headline combinations verify counts, conservation identities, entrant distribution and actual rate directions. Classification definitions and numeric formats/tolerances are tested.
- **10,000 fresh selections** cover every pool entry and avoid consecutive IDs in each category. Twenty-four complete action histories verify saved state across all stages and hints, plus corrupt-state rejection, storage failure and bounded telemetry retention.
- **20 complete keyboard-only browser runs** cover all 24 authored entries, correct and incorrect paths, requested/unused hints, replay, reload/resume and Return to Games. Native Tab/Enter and radio arrow-key navigation work, with visible focus. Hint toggles preserve focus and drafts. Wrong numeric responses focus an invalid field; correct responses focus complete feedback; Continue focuses the next task heading.
- Browser checks cover **1366 × 768, 1280 × 720, 768 × 1024, 390 × 844, 320 × 720 and actual 200% Chrome zoom** (683 × 384 CSS pixels within a 1366 × 768 viewport). No horizontal page overflow. Native input/button and radio-label targets are at least 44px. Normal and reduced-motion runs complete.
- Scene alternatives describe economic structure and changes. Exact figures are in the same accessible table for everyone, with captions and row/column headings. One polite live region announces feedback; the population table is not an animated live region. Selection has a text label and border, so teal is not the sole signal. A screen-reader listening pass was not performed.
- Desktop visual review confirms the uncropped image and current prompt are visible together, with the complete report near the fold. Mobile and zoom stack the report above the task; ordinary vertical scrolling remains for combined calculations and revealed explanations. There are no sticky elements that can overlap content.
- The ninth private card loads the baseline WebP and opens the correct route. **14 existing-game keyboard regression runs** pass, including desktop and 200% zoom and the previously committed Takeout Taco image treatment.
- All six original image hashes match. Existing-game runtime and public paths are unchanged. The public production build excludes the new game and art, including hash-based checks against renamed copies.
- **Zero console errors, page errors, missing assets or external requests** in the new game's browser suite. `git diff --check` passes.

Commands: `node --test` for the non-browser `audit_tools/econ_rpg/*.test.mjs` files; `node audit_tools/econ_rpg/labor-force-files.browser.test.mjs`; `node audit_tools/econ_rpg/mini-game-library.browser.test.mjs`. Tests use the existing external Playwright runtime; no dependencies were installed. Logs, full screenshots and `browser-results.json` are under ignored `tmp/econ-rpg/labor-force-files/`.

## Design clarifications

The nine stages consolidate reading and building the labor force into one task; classification remains four brief examples within one stage. Predictions, calculations and interpretations stay grouped rather than becoming separate top-level stages.

Change cases are explicitly **independent comparisons with the selected baseline**, not cumulative time periods. This matches the supplied art's baseline-relative meanings, keeps the arithmetic controlled, and lets students compare different reasons for a rate change. The mixed case and headline audit supply the transfer practice requested by the instructional-follow-up standard. No additional quiz or giant final debrief is appended.

The model note deliberately limits claims about official measurement. The art is never used as numerical evidence. No other material departures from the requested scope were introduced.


## Final-report graph enhancement

The existing final report remains: performance recap, UR/LFPR calculation checks, classification performance, headline-audit result, concise headline explanation, takeaway and replay/navigation controls. Only the completed report gains **Labor market through the files**, one compact chart panel with two aligned rate plots and a shared file axis. The nine-stage instructional sequence, calculations, selection, saved-run format and telemetry are unchanged.

The panel includes six snapshots from the actual selected run: **Files 1–4: Baseline; File 5: Direct change; File 6: New participants; File 7: Discouraged workers; File 8: Mixed flows; File 9: Headline audit**. The baseline is shown once rather than repeating classification-only or initial calculation steps. Snapshots are derived from the saved run's case IDs through the same calculation model that supplied the completed questions, not sample values or a fresh random selection. Reload produces identical graph data.

UR uses a teal solid line with circles. LFPR uses an off-white dashed line with squares. Direct labels identify both series and percentages. The aligned panels have their own explicitly labeled percentage scales so modest UR changes remain visible alongside much higher participation rates. A visible note states that file order is **not a time series** and each case compares independently with the same baseline. Lines connect the order in which cases were reviewed, not a cumulative monthly trajectory.

A compact six-row table gives both rates to one decimal with file names and semantic row/column headings. The SVG has a meaningful title and a description containing every plotted value; a visible, dynamically generated takeaway explains the selected direct-change and expansion outcomes and contrasts them with lower UR and LFPR under discouragement. It refers to the graph and the baseline, without treating each case as the next time period. Color is supplemented by line styles, point shapes and direct labels. No animation, chart controls, live data or new quiz is added.

The SVG is at most 400px wide, scales within the report, and occupies about 310px of graphic height on desktop. At narrow widths the compact panel, exact-value table and takeaway stack with the existing report. No page-level horizontal scrolling occurs. The graphic adds no keyboard stops or traps; the existing Play Again and Return to Games actions remain available.

Validation for this focused enhancement:

- **All eight labor-game unit suites pass**, including all 3,240 complete authored combinations and a new all-combination check that plotted UR/LFPR values match the run's six calculated snapshots. Chart geometry, dynamic text, original report content, hidden-during-play behavior and identical restored data are verified.
- **19 final-report browser checks pass**, covering all 24 pool entries and 1366 × 768, 1280 × 720, 768 × 1024, 390 × 844, 320 × 720, and actual 200% Chrome zoom. Checks compare every table rate with the run data, verify line/marker semantics and all SVG label bounds, preserve the five performance rows, test reload consistency and keyboard replay, and confirm no page overflow.
- Visual inspection covers desktop, 320px and real 200% zoom. Zero page/console errors or missing resources were recorded. A screen-reader listening pass was not performed.
- `git diff --check` passes. The engine, configuration, app event flow, storage and telemetry have no changes in this pass.

New browser test: `audit_tools/econ_rpg/labor-force-files-summary.browser.test.mjs`. Evidence: `tmp/econ-rpg/labor-force-files/summary/`, with unit/browser logs alongside it. No push or deployment.


## MQ readability and field-feedback cleanup

This pass supersedes the original charcoal-shell styling while retaining the supplied noir artwork, strong serif title, newspaper headline phase, compact image sizing and nine-stage instructional structure. The final report and its run-summary graph are preserved.

### Shell and header

The page now inherits the shared MQ navy, light text, teal primary controls and gold focus/correction accents. Its background uses the familiar navy/blue gradient; the interaction panel has a distinct blue surface. Muddy gray-black form, button and feedback backgrounds were replaced with clearer MQ surfaces. Labels, notes and body text have stronger sizing and spacing; the LFPR direction choices are grouped in a bordered native fieldset. Hover, disabled, selected and focus states remain explicit.

The “POPULATION · EMPLOYMENT · PARTICIPATION” strapline is removed without replacement. The title remains prominent. The model note is shortened to: “A simplified instructional labor-market model. Exact counts appear in the report; silhouettes are illustrative.” No numerical configuration changed.

### Population Report comparison

A matched desktop comparison was captured with the same data and MQ shell using both the prior dark Population Report and the new newspaper-gray surface. The paper treatment was retained because it separates the exact figures from the scene and dark controls, makes the Before/After columns easier to scan, and supports distinct rate rows without muting the interface.

The panel uses clean gray `#e6e9e9`, dark navy text `#172d48`, darker rules, a restrained dark-teal heading/border and a slightly deeper gray-blue background for bold UR/LFPR rows. It has no parchment color, image texture or simulated distress. Tested report headings, table text, muted notes, prompts, labels, controls and field-feedback text all exceed 4.5:1 contrast; the lowest measured ratio in that set is **6.54:1**. The dark comparison also remained readable, but did not provide the same visual separation.

### Images without added black bands

All six supplied scene files remain byte-for-byte unchanged. On the game page, the image element now sizes to its intrinsic aspect ratio within the existing 220px desktop / 260px tablet height caps, rather than occupying a wider black frame. Phones scale the complete image to the available width. On the Games hub, only the Labor Force Files card media uses the artwork's native **1672:941** aspect ratio instead of a 4:3 letterbox. No group boundaries are cropped and no source image is stretched, edited or recompressed. Automated checks compare displayed image-box ratios with natural dimensions at every requested size; both locations have no added letterboxing.

### Field-specific correction

New `field-feedback.js` derives a result for each submitted part using the engine's existing acceptance rules and selected case. Numeric inputs and the LFPR direction group get their own text, `aria-invalid` state and `aria-describedby` association. The summary identifies only the fields needing correction. Accepted entries retain their values and visible success status; students can correct the other part without retyping them.

Example verified in the browser with adult population 200, employment falling from 114 to 106, unemployment rising from 6 to 14, and labor force fixed at 120:

- **UR: Correct — 11.7%.**
- **LFPR: Recheck. The labor force and adult population are unchanged, so LFPR stays the same.**

The top feedback reads “1 of 2 answers correct. Update LFPR.” Keyboard focus goes to the invalid LFPR radio group, not back to the correct UR field. The single polite live region announces both field results. When both are wrong, both receive corrective messages. Three-field mixed cases separately identify the labor-force count, UR and LFPR results. Text labels and borders supplement color.

This validation is presentation-only. Economic calculations, tolerance, scoring, authored variants, classification, headline logic, telemetry schema and saved-run transitions are unchanged. Status is re-derived from saved submitted answers, so existing partial saves resume consistently. Field messages guide denominators without automatically opening formulas; requested hint behavior remains intact.

### Validation

- All **nine Labor Force Files unit suites** pass, including all **3,240 complete combinations**, source-image hashes, final-chart checks and new correct/incorrect masks for each numeric field across the authored baselines/direct/expansion/mixed pools.
- The broader non-browser regression run passes **100 tests with zero failures**, covering the existing private game library.
- **20 full keyboard-only game runs** pass across every pool entry, normal/reduced motion, replay, reload and hint flows.
- **Six focused UI browser checks** cover 1366 × 768, 1280 × 720, 768 × 1024, 390 × 844, 320 × 720 and actual 200% browser zoom. Each tests four partial-answer patterns, appropriate focus, correction without touching a correct UR value, resume, contrast and hub/game image proportions. No horizontal page scrolling occurs.
- **19 final-report browser checks** pass after the restyling, preserving its graph, exact-value table, performance rows and keyboard actions.
- Zero page/console errors or missing resources in the passing browser suites. Engine, storage and telemetry source guards pass; `git diff --check` passes. A screen-reader listening pass was not performed.

New focused test: `audit_tools/econ_rpg/labor-force-files-ui.browser.test.mjs`. Evidence, including before/dark-comparison/paper screenshots, partial-feedback examples and contrast results, is under `tmp/econ-rpg/labor-force-files/ui-cleanup/`.

No unrelated game changes, push or deployment.

### Hub card alignment follow-up

The native-ratio hub exception made the Labor Force Files image shorter than adjacent cards. The hub now uses the shared 4:3 frame with `object-fit:fill` for this card only. This intentionally stretches the illustration vertically, preserving its complete contents without added bands and aligning image bottoms and heading starts with the other cards. The actual game page keeps its natural image proportions. Browser measurements at 1366px, 768px and 390px confirm matching image heights and heading offsets across cards; the desktop screenshot was visually inspected. Evidence: `tmp/econ-rpg/labor-force-files/ui-cleanup/hub-aligned.png`. No gameplay or source-art changes, push or deployment.

### Title case and full-width scene follow-up

Hub and game titles now read GDP Live, CPI Live and Labor Force Files. The Labor Force Files header model-note subtitle and scene caption are removed. All in-game scene images now fill the Population Report width, stretching horizontally within the compact desktop/tablet height; phones retain automatic height. The full illustration stays visible without added bands. This supersedes the earlier natural-width game-page sizing. Browser checks at 1366, 1280, 768, 390 and 320px confirm equal image/report widths and left edges, no horizontal overflow, correct hub/page titles, and no page errors. Desktop appearance was visually inspected; evidence: `tmp/econ-rpg/labor-force-files/ui-cleanup/full-width-1366.png` and `full-width-390.png`. Gameplay remains unchanged. No push or deployment.
