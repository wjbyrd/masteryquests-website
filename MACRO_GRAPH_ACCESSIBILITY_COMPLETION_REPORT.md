# Macro Graph Accessibility Completion Report

## Result

Completed meaningful alt text and extended descriptions for **351 graph-bearing questions using 33 distinct graph assets** across all four Macro games. Every graph is described through the existing `questionAssetMetadata` mapping, normal Graph description disclosure, and enlarged view. No alternate accessibility component was introduced.

- Worktree: `C:\Users\Jennings\Documents\GitHub\masteryquests-macro`.
- Branch: `macro-managerial-alignment`.
- Starting commit: `c39742ec3501cc72a90f220eeb49c4d1f4837452`.
- Local commit message: `Complete Macro Command graph accessibility metadata`.
- Scope: graph alt text, extended descriptive metadata, and generator-side validation of that metadata. No bank, image, gameplay, theme, shared Composer, other collection, or Cloudflare configuration changes. No push, merge, or deployment.

## Inventory and initial findings

All **2,744 published question records** were inspected across `questionBanks`, `microSkillRepairPools`, and `microSkillBridgePools`, including ordinary, Legendary, checkpoint, repair, and bridge pools. Each graph's image, associated question wording/options, alt text, and extended-description fields were reviewed. Every referenced image exists. Content hashes were computed for all assets; all 33 image files have distinct SHA-256 hashes. Repeated question references are deduplicated by game and exact asset path while retaining every question/pool association.

| Game | All records inspected | Graph-bearing questions | Distinct images | Missing alt text before | Missing descriptions before | Effective missing metadata after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| National Engine | 631 | 46 | 6 | 46 | 46 | 0 |
| Mint, Ash & Gold | 687 | 105 | 10 | 105 | 105 | 0 |
| Command Nexus | 712 | 59 | 6 | 59 | 59 | 0 |
| Exchange Citadel | 714 | 141 | 11 | 141 | 141 | 0 |
| **Total** | **2,744** | **351** | **33** | **351** | **351** | **0** |

The published records had no `imageAlt` or `graphDescription`. The former generator built empty metadata objects from those absent fields, so the renderer fell back to generic alt text and “The graph description metadata is unavailable.” There were no adequate existing descriptions to preserve: all 33 asset descriptions and alt texts were added. There are no missing images or unresolved missing-metadata cases.

The raw bank fields remain untouched. “Effective metadata after” refers to the reviewed authoritative asset map consumed by the existing renderer, not fields injected into question records.

## Implementation and source files

| File | Change |
| --- | --- |
| `audit_tools/macro_command_engine/graph-descriptions.json` | New authoritative per-game/per-asset alt text and extended descriptions, bound to inspected image SHA-256 hashes. |
| `audit_tools/macro_command_engine/graph-metadata.mjs` | Generator-side coverage, required-field, image-hash, and conflicting question-override checks. Returns only `imageAlt` and `graphDescription` for the existing asset map. |
| `audit_tools/macro_command_engine/sync.mjs` | Imports the metadata builder and uses it instead of constructing empty descriptions from banks. |
| `play/macro-command-system/national-engine/index.html` | Regenerated `questionAssetMetadata` only. |
| `play/macro-command-system/mint-ash-gold/index.html` | Regenerated `questionAssetMetadata` only. |
| `play/macro-command-system/command-nexus/index.html` | Regenerated `questionAssetMetadata` only. |
| `play/macro-command-system/exchange-citadel/index.html` | Regenerated `questionAssetMetadata` only. |
| `MACRO_GRAPH_ACCESSIBILITY_COMPLETION_REPORT.md` | This report. |

The Labyrinth graph-accessibility consumer present in this Macro checkout was inspected for compatibility: it already reads `imageAlt` and `graphDescription` from question or asset metadata and passes the same description to the lightbox. Macro uses that established mapping pattern. The separate Labyrinth worktree was not accessed, and no Labyrinth files were modified.

Generation fails if a referenced asset is missing from the catalog, if an obsolete catalog asset remains, if inspected image bytes change, or if later question-level metadata would override the reviewed description with conflicting text. Metadata does not enter question selection: `graphRequired`, bank objects, supported-mode configuration, and graph-eligible IDs are unchanged. Trial by Graph remains unavailable under the existing eligibility rules.

Descriptions transcribe visible axes, labels, curve ordering/shapes, intersections, marked coordinates, and dashed guides. Numeric values are used only where printed. Symbolic labels are explicitly distinguished from numerical scales. The triangle diagram describes its vertices and numbered sides without supplying the economic conclusion. Multi-panel graphs are described panel by panel. Direct point-identification information is retained even where a question asks for that point; this supplies equivalent visual access rather than withholding visible labels. No calculations, policy recommendations, or unshown causal conclusions were added.

## Validation

### Every graph-bearing question

`graph-browser.mjs` rendered **all 351 questions using their actual loaded published records**, including repair/bridge and checkpoint records. Each was tested at 1440px desktop and 390px mobile widths. One representative question for each of the 33 assets was also tested at 320px, giving **735 successful question/viewport combinations**. Viewport height was 1000px.

Every combination verified:

1. The ordinary graph loads and decodes with positive natural dimensions.
2. Its alt text and normal description exactly equal the reviewed asset metadata.
3. No description displays the missing-metadata fallback.
4. Keyboard Enter opens the normal Graph description disclosure.
5. Keyboard Enter on the image opens the existing enlarged view.
6. The enlarged image loads and has identical alt text and description.
7. The enlarged disclosure opens by keyboard.
8. Escape closes the enlarged view and focus returns to the original graph control.
9. The normal page and description text have no unintended horizontal overflow; extended text wraps within its container.
10. The actual loaded question record, including its question/options/key, remains identical before and after rendering and interaction.

An additional **99 representative scrolling checks** cover all 33 assets at 1440, 390, and 320 pixels. At mobile widths, scrolling the enlarged view to the bottom places the end of the description above the existing swipe hint. The image itself intentionally retains the existing horizontal swipe/pan behavior; no CSS was changed. Long multi-panel descriptions were inspected in screenshots at 320px, including Command Nexus's IS-LM/AD diagram. Descriptions remain text, selectable and available to the existing accessibility structure.

The browser harness compares the actual runtime-loaded published records before and after rendering. The machine-readable inventory is read and written explicitly as UTF-8, preserving question text and mathematical symbols on Windows. The raw banks themselves were not edited.

### Content, image, and theme integrity

`graph-integrity.mjs` compared each generated page with the starting commit after replacing only the `questionAssetMetadata` declaration with an identical placeholder. The remaining entire HTML is exactly equal: all layout, CSS, body classes, artwork references, question configuration, gameplay functions, accessibility handlers, and telemetry code are preserved. This protects all four individual themes and the Auditor presentation.

All four external published banks match the starting commit after normalizing Git/Windows checkout line endings for comparison; their content and tracked files are unchanged. All **33 graph images match the baseline byte for byte**, as well as the catalog hashes. Question IDs, wording, options, answer hashes/keys, objectives, difficulty, feedback, adaptive selection, and all remediation data remain unchanged.

The maintained Macro protection suite passed: **22 protected engine functions per game and 159 companion files unchanged**. Synchronization passes its maintained `--check`; two complete generation passes produce identical hashes. Initial raw bank-byte comparison used Git blob bytes against CRLF working-tree text and exhausted the assertion formatter while describing that line-ending difference. The evidence checker now uses the repository's established text normalization for banks, while retaining strict byte comparisons for image files. No product code was changed to address a test-harness issue.

### Gameplay and telemetry regressions

| Suite | Final result |
| --- | --- |
| Existing full gameplay regression | **88/88 passed**: full Standard victories, full Exam runs, boss failures at all three checkpoints and all three miss positions, immediate three-room setbacks/no artifact after failure, save/resume, natural Repair/Bridge/Retest and Recovery Complete, all supported modes, and unchanged Trial by Graph unavailability. |
| Focused baseline comparisons | **20/20 passed**: introduction/replay/keyboard/timing/persistence checks, protected Standard state/event comparisons, and Score Attack, Fading Fortune, and Risk & Reward comparisons against `c39742ec`. |
| Daily Tasks | **104/104 passed**, 26 per game, covering existing selection/tracking/persistence behavior. |
| Exhaustive graph UI checks | **735/735 passed**, covering every graph-bearing question at desktop/mobile and every asset at 320px. |
| Additional readable-end scrolling checks | **99/99 passed**, all assets at three widths. |

The first gameplay run had one 8-second navigation timeout in Mint's room-10 second-answer miss/save-resume case while multiple browser suites were running. The original first-pass result is retained, and the same case passed when rerun in isolation; final coverage is 88/88. No gameplay assertion or production implementation was changed.

Full Standard runs still record 36 correct responses, three completed guardians, and three artifacts. Full Exam runs retain 36 responses, 30 correct, six revisions, three section commitments, nine guardian responses, and no artifacts. Feedback progression, report totals, Daily Tasks, and persistence continue to pass their existing checks.

The CSV schema remains **117 columns with unchanged ordering**. The twelve paired timing cases seed randomness, UUID generation, and clocks and compare the entire exported CSV byte for byte, including every header and value. Protected Standard comparisons also check state, event order/fields, and the header. The page-integrity comparison independently confirms that the export function and all event-generation code are unchanged.

## Review evidence

- [Interactive local graph review gallery](tmp/macro-managerial-alignment/graph-evidence.html): choose a game/asset and 1440, 390, or 320 pixels to compare ordinary and enlarged views.
- [Complete machine-readable inventory](tmp/macro-managerial-alignment/graph-inventory.json): image path/hash/dimensions, all question records and IDs, pool associations, missing metadata before, reviewed descriptions after, and authoring review findings.
- [Original inventory](tmp/macro-managerial-alignment/graph-inventory-before.json).
- [Exact inventory-content verification](tmp/macro-managerial-alignment/graph-inventory-integrity.json): all 351 records match the published banks and every description matches the catalog, including Unicode symbols.
- [Graph UI results](tmp/macro-managerial-alignment/graph-browser-results.json).
- [Scrolling results](tmp/macro-managerial-alignment/graph-scroll-results.json).
- [Content/asset/theme integrity](tmp/macro-managerial-alignment/graph-integrity-results.json).
- [88-case gameplay results](tmp/macro-managerial-alignment/graph-regression-results.json), with [first-pass timeout retained](tmp/macro-managerial-alignment/graph-regression-first-pass.json).
- [20 focused results](tmp/macro-managerial-alignment/graph-focused-results.json).
- Daily JSON logs: `graph-daily-<game>.json`; synthetic CSV exports: `graph-*.csv`; maintained protection output: `graph-source/source-results.json`.

Dedicated normal/enlarged graph screenshots total **198** (33 assets × 3 widths × 2 views). Inspection contact sheets, gallery, machine inventory, browser runners, logs, and synthetic CSVs remain in the existing ignored `tmp/macro-managerial-alignment/` directory and are not committed. The authoritative descriptions and the full inventory/description appendix below are committed with this report.

Reproduction from this Macro worktree:

```powershell
node audit_tools/macro_command_engine/sync.mjs --check
node audit_tools/macro_command_engine/check.mjs
node tmp/macro-managerial-alignment/graph-integrity.mjs
node tmp/macro-managerial-alignment/graph-browser.mjs
node tmp/macro-managerial-alignment/graph-scroll.mjs
node tmp/macro-managerial-alignment/graph-regression.mjs
node tmp/macro-managerial-alignment/graph-focused.mjs
```

For the existing Daily suite, set `MQ_DAILY_GAME` to each of the four slugs and run `node tmp/macro-managerial-alignment/daily-runner.cjs`. The adapter redirects the template read to that published game and normalizes Windows line endings; the shared test suite is unchanged.

## Authoring review items resolved after owner review

The original accessibility-only pass left four content discrepancies unchanged for faculty review. On 2026-10-23, the owner approved correcting all four stems. The subsequent content correction changes four stems, two explanations, and one answer hash across three published banks. Options, IDs, objectives, pool placement, graph assets, and accessibility descriptions are unchanged.

| Game / question | Approved correction | Published key |
| --- | --- | --- |
| National Engine / 9011 | Output now follows the graph: 0, 15, 25, 32, 38, 40, 38, 32 for workers 0 through 7. MPL is 15, 10, 7, 6, 2, -2, -6. With W/P = 9, hire two workers. Explanation and hash updated. | D — 2, changed from A — 3 |
| Mint, Ash & Gold / 9053 | Starts at k3, where depreciation exceeds saving. | A, unchanged |
| Mint, Ash & Gold / 9077 | Describes an aggregate-demand increase from AD1 to AD3 with unchanged LRAS. | A, unchanged |
| Command Nexus / 9081 | Asks for output rising from Y1 to Y2 while the price level falls. Explanation describes the fall to P2 and removes the unprinted P3 label. | D — A to B, unchanged |

The authoritative amendments are in `audit_tools/macro_command_engine/question-corrections.json`; the synchronization workflow applies them through `question-corrections.mjs`. Source protection allows these exact fields and continues to protect the other bank contents. The earlier report sections describe the accessibility-only pass; this section records the later approved content correction. The original review document and inventory remain evidence of the pre-correction questions.

Correction validation: the maintained source and synchronization checks pass, covering 22 engine functions per game and 159 companion files with the approved amendments. The focused browser check exercises all four corrected records at desktop and mobile widths, verifies every option against its hash and after option shuffling, submits the correct answer through actual scoring, checks the published feedback, and opens both graph views. All 33 graph assets retain their inventoried hashes. Evidence is in `tmp/macro-managerial-alignment/question-corrections-results.json` and `question-corrections-source/source-results.json`.

No authoring issues remain from these four findings. No push, merge, or deployment was performed.

## Complete graph inventory and descriptions

Each entry below is one distinct, visually inspected image. Question associations are grouped by their actual published container and pool. All graph filenames are relative to `play/macro-command-system/<game>/`. Short alt text and full extended text are reproduced exactly from the authoritative catalog.

### National Engine

Published bank: `national_engine_question_bank_student.js`.

#### `totalproduct.webp`

- Path: `play/macro-command-system/national-engine/totalproduct.webp`
- Dimensions: 1107 × 814 pixels.
- SHA-256: `1267e1d31fad35ba9c1cd62f152bf33b243e1ccadb1679319a8ec25027ebee9e`
- Graph-bearing questions: 4.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9011 |
| `questionBanks.medium` | 121 |
| `questionBanks.hard` | 226 |
| `questionBanks.elite` | 329 |

**Alt text:** Total product curve TP plotted against labor, with dashed output guides.

**Extended description:** The horizontal axis is Labor, labeled 1 through 7, and the vertical axis is Output. The blue curve TP starts at the origin, rises, flattens near labor 5, and then falls. Dashed guides show labor-output pairs (1, 15), (2, 25), (3, 32), (4, 38), (5, 40), (6, 38), and (7, 32). The highest marked output is 40 at labor 5. No other units or curves are shown.

#### `marginalproduct.webp`

- Path: `play/macro-command-system/national-engine/marginalproduct.webp`
- Dimensions: 1107 × 850 pixels.
- SHA-256: `0543e3c5bba0a33099ac04a5c2761a05de7eacf93a6db51a4bfc3f78acee0cd1`
- Graph-bearing questions: 4.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9013 |
| `questionBanks.medium` | 120 |
| `questionBanks.hard` | 221 |
| `questionBanks.elite` | 324 |

**Alt text:** Marginal product curve MP with labor values and dashed output guides.

**Extended description:** The horizontal axis is Labor, labeled 1 through 7; the vertical axis is labeled Output. The blue line MP rises sharply from the origin to labor 1 and output 15, then slopes downward. Dashed guides mark (1, 15), (2, 10), (3, 8), (4, 6), and (5, 2). The descending line crosses the horizontal axis between labor 5 and 6 and continues below it, ending near labor 6. No exact zero-crossing or negative output value is labeled.

#### `consumptionfunction.webp`

- Path: `play/macro-command-system/national-engine/consumptionfunction.webp`
- Dimensions: 1149 × 835 pixels.
- SHA-256: `46ce8ca852cc90bb832ac2402fbcb0830f95c379852b1d580098748d67b36c6e`
- Graph-bearing questions: 5.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9023 |
| `questionBanks.medium` | 132, 133 |
| `questionBanks.hard` | 238 |
| `questionBanks.elite` | 340 |

**Alt text:** Three upward-sloping consumption lines C1, C2, and C3 against disposable income.

**Extended description:** The vertical axis is Consumption and the horizontal axis is Disposable Income. Three approximately parallel straight lines slope upward. Blue C2 is highest, orange C1 is in the middle, and green C3 is lowest at the same disposable income. All three begin above the horizontal axis. There are no numerical scales, marked points, arrows, or dashed guides.

#### `investmentfunction.webp`

- Path: `play/macro-command-system/national-engine/investmentfunction.webp`
- Dimensions: 965 × 803 pixels.
- SHA-256: `51b18dca0127e65421c2e94d5ee992f87dd43b01fcc9222f8d8791b51b620cd9`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9025, 9027 |
| `questionBanks.medium` | 134, 135 |
| `questionBanks.hard` | 241, 242 |
| `questionBanks.elite` | 343, 344 |

**Alt text:** Two downward-sloping investment curves with points A through D at two interest rates.

**Extended description:** The vertical axis is Interest Rate and the horizontal axis is Investment. Orange I1 slopes downward; blue I2 is parallel and to its right. The upper dashed horizontal guide is r2 and the lower is r1. Investment labels increase from Q1 to Q4. Point A is on I1 at (Q1, r2), C is on I1 at (Q2, r1), B is on I2 at (Q3, r2), and D is on I2 at (Q4, r1). Vertical dashed guides connect each point to its investment label. These are symbolic labels, not numerical values.

#### `loanablefunds.webp`

- Path: `play/macro-command-system/national-engine/loanablefunds.webp`
- Dimensions: 949 × 836 pixels.
- SHA-256: `9669aa017c1144cc0c690a95105541168d684cb76ec53ad962121df410b68d45`
- Graph-bearing questions: 20.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9031, 9032, 9033, 9055, 9063 |
| `questionBanks.legendaryBoss` | 9111 |
| `questionBanks.finalBoss` | 4016, 4017 |
| `questionBanks.medium` | 139, 140, 141 |
| `questionBanks.hard` | 248, 249, 250, 253 |
| `questionBanks.elite` | 353, 354, 355, 356, 363 |

**Alt text:** Loanable-funds diagram with two vertical saving lines, two investment curves, and points A through D.

**Extended description:** The vertical axis is Interest Rate and the horizontal axis is Investment. S1 is a vertical line at Q1; S2 is vertical at the larger quantity Q2. Orange I1 and blue I2 slope downward, with I2 above and to the right of I1. Point A is the intersection of S1 and I2, above r2; its interest-rate level is not labeled. C is at S1 and I1, at (Q1, r2). B is at S2 and I2, at (Q2, r2). D is at S2 and I1, at (Q2, r1). Dashed horizontal guides mark r2 above r1. No numerical scale is given.

#### `minimumwage.webp`

- Path: `play/macro-command-system/national-engine/minimumwage.webp`
- Dimensions: 1030 × 902 pixels.
- SHA-256: `179febd886ebf08f46a8bb112aeb08d7a050aa0d02fa9846679289b6f539aa9c`
- Graph-bearing questions: 5.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9047 |
| `questionBanks.legendaryBoss` | 9120 |
| `questionBanks.mediumBoss` | 3016 |
| `questionBanks.hard` | 273 |
| `questionBanks.elite` | 381 |

**Alt text:** Labor supply and demand with wages from $8 to $20 and worker quantities from 1000 to 3000.

**Extended description:** The vertical axis is Wage and the horizontal axis is Quantity of Workers. Red S_L slopes upward and blue D_L slopes downward. They cross at 2000 workers and $13. Dashed guides mark worker quantities 1000, 1500, 2000, 2500, and 3000, and wages $8, $11, $13, $15, and $20. On S_L, the guides show (1000, $8), (1500, $11), (2000, $13), (2500, $15), and (3000, $20). On D_L, they show (1000, $20), (1500, $15), (2000, $13), (2500, $11), and (3000, $8). No separate wage-floor line is labeled.

### Mint, Ash & Gold

Published bank: `mint_ash_gold_question_bank_student.js`.

#### `solowproductionfunction.webp`

- Path: `play/macro-command-system/mint-ash-gold/solowproductionfunction.webp`
- Dimensions: 956 × 710 pixels.
- SHA-256: `b56a5257a08eabfbef1995f1f04d1f738f9a4ad96fa0fcf608b9d9021a11b56b`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9049 |
| `questionBanks.legendaryBoss` | 9123 |
| `questionBanks.mediumBoss` | 3001 |
| `questionBanks.medium` | 149 |
| `questionBanks.hard` | 249 |
| `questionBanks.elite` | 349 |
| `microSkillRepairPools.solow_model` | 5049 |
| `microSkillBridgePools.solow_to_steady_state` | 6034 |

**Alt text:** Two rising, flattening Solow curves, with points c and d at the same capital coordinate e.

**Extended description:** The vertical axis is labeled y/l and the horizontal axis k/l. Two curves begin at the origin, rise, and become flatter. The upper dark curve is labeled y, f(k); the lower red curve is labeled s, sf(k). At horizontal coordinate e, point c lies on the upper curve at vertical level a, and point d lies on the lower curve at level b. Dashed horizontal guides run from a to c and from b to d; a vertical dashed guide connects both points to e. No numerical scales are printed.

#### `steadystate.webp`

- Path: `play/macro-command-system/mint-ash-gold/steadystate.webp`
- Dimensions: 2569 × 1839 pixels.
- SHA-256: `d5c10e429956351bca8c36764d5fec8e0eba082694772fe40c1f0bad8881e2dd`
- Graph-bearing questions: 16.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9052, 9053 |
| `questionBanks.legendaryBoss` | 9121 |
| `questionBanks.mediumBoss` | 3006, 3007, 3008 |
| `questionBanks.medium` | 153, 154 |
| `questionBanks.hard` | 253, 254 |
| `questionBanks.elite` | 352, 353 |
| `microSkillRepairPools.steady_state` | 5055, 5056 |
| `microSkillBridgePools.solow_to_steady_state` | 6032 |
| `microSkillBridgePools.graph_policy_bridge` | 6071 |

**Alt text:** Solow investment and depreciation curves with points a, b, c, and d and capital labels k1 through k3.

**Extended description:** The vertical axis is Investment and Depreciation; the horizontal axis is Capital per Worker. A straight rising blue line d(k) and a rising, flattening dark curve sf(k) start at the origin. They intersect at point c, at k2 and dk3. At k1, point a is on sf(k) at dk2, while point b is on d(k) at the lower level dk1. Point d is a separate marked point at (k2, dk1), below both curves there. At k3, an unlabeled red point on d(k) is at dk4, above sf(k). Dashed guides connect marked levels and coordinates. From left to right the capital labels are k1, k2, k3; from bottom to top the vertical labels are dk1, dk2, dk3, dk4. No numerical values are supplied.

#### `steadystatechanges.webp`

- Path: `play/macro-command-system/mint-ash-gold/steadystatechanges.webp`
- Dimensions: 1193 × 847 pixels.
- SHA-256: `033446ce3055df92fb1b75e38e05891d89c48ba23f17f56d1781769ff3d2a126`
- Graph-bearing questions: 14.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9056, 9060 |
| `questionBanks.legendaryBoss` | 9124 |
| `questionBanks.mediumBoss` | 3012, 3013 |
| `questionBanks.medium` | 156, 157 |
| `questionBanks.hard` | 256, 260 |
| `questionBanks.elite` | 356, 360 |
| `microSkillRepairPools.saving_rate` | 5060 |
| `microSkillBridgePools.saving_to_living_standards` | 6037 |
| `microSkillBridgePools.graph_policy_bridge` | 6070 |

**Alt text:** Three Solow saving curves meeting depreciation at A, B, and C.

**Extended description:** The vertical axis is Investment and Depreciation; the horizontal axis is Capital per Worker. Blue d(k) is a straight rising line from the origin. Three rising, flattening curves also start at the origin: red sf(k)1 is lowest, dark sf(k)2 is in the middle, and green sf(k)3 is highest. They intersect d(k) at A = (k1, dk1), B = (k2, dk2), and C = (k3, dk3), respectively. Dashed guides connect each intersection to both axes. Capital increases from k1 to k3 and vertical levels increase from dk1 to dk3. The labels are symbolic; there are no directional arrows or numerical values.

#### `adsras.webp`

- Path: `play/macro-command-system/mint-ash-gold/adsras.webp`
- Dimensions: 2291 × 1812 pixels.
- SHA-256: `8985de05069b23b5cbad7e246fa1609972a4b2283169d51c8c269921d741911f`
- Graph-bearing questions: 10.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9063, 9072 |
| `questionBanks.finalBoss` | 4009, 4023 |
| `questionBanks.medium` | 172 |
| `questionBanks.hard` | 263, 271 |
| `questionBanks.elite` | 363, 372 |
| `microSkillBridgePools.ad_to_business_cycles` | 6043 |

**Alt text:** Three downward AD lines intersecting a horizontal SRAS line at price P1.

**Extended description:** The vertical axis is P and the horizontal axis Y. SRAS is horizontal at P1. Three parallel downward-sloping lines cross it: green AD2 at Y2, black AD1 at Y1, and red AD3 at Y3. The horizontal-axis order is Y2, Y1, Y3 from left to right. Black dots mark the three intersections, with dashed vertical guides to the corresponding Y labels. There are no numerical values or arrows.

#### `adone.webp`

- Path: `play/macro-command-system/mint-ash-gold/adone.webp`
- Dimensions: 935 × 830 pixels.
- SHA-256: `9868722d4675564cf51ec055cc1390ab98ef4fc01e0416c5fa31c940cc4d5b80`
- Graph-bearing questions: 6.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9070 |
| `questionBanks.legendaryBoss` | 9131 |
| `questionBanks.finalBoss` | 4015 |
| `questionBanks.medium` | 170 |
| `questionBanks.elite` | 370 |
| `microSkillRepairPools.aggregate_demand` | 5066 |

**Alt text:** A single downward aggregate-demand curve with points A, B, and C.

**Extended description:** The vertical axis is P and the horizontal axis Y. The downward-sloping blue line AD contains A at (Y1, P1), B at (Y2, P2), and C at (Y3, P3). Dashed guides connect every point to both axes. Y1, Y2, Y3 run left to right, while P1, P2, P3 run top to bottom. No numerical prices or output values are printed.

#### `adtwo.webp`

- Path: `play/macro-command-system/mint-ash-gold/adtwo.webp`
- Dimensions: 2291 × 1927 pixels.
- SHA-256: `7cd12217688d36c4a6309a49af59b4f5a8e7c3803549f24c3d61ea1672ea9eb8`
- Graph-bearing questions: 6.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9071, 9076 |
| `questionBanks.finalBoss` | 4016 |
| `questionBanks.medium` | 171 |
| `questionBanks.hard` | 270 |
| `questionBanks.elite` | 371 |

**Alt text:** Three downward AD curves with six marked points at P1 and P2.

**Extended description:** The vertical axis is P and the horizontal axis Y. Green AD3 is the leftmost downward-sloping line, black AD1 is in the middle, and red AD2 is rightmost. The upper dashed price guide is P1 and the lower is P2. At P1, A lies on AD3 at Y1, B on AD1 at Y2, and C on AD2 at Y3. At P2, D lies on AD3 at Y2, E on AD1 at Y3, and F on AD2 at Y4. Vertical dashed guides mark Y1 through Y4 in increasing order. No numerical scales or direction arrows are shown.

#### `demandshock.webp`

- Path: `play/macro-command-system/mint-ash-gold/demandshock.webp`
- Dimensions: 1087 × 838 pixels.
- SHA-256: `8d614c70ac226c93633a94fc064660973dfc218bd89cd71f110428e40c8cc552`
- Graph-bearing questions: 17.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9073, 9074 |
| `questionBanks.legendaryBoss` | 9130 |
| `questionBanks.finalBoss` | 4012, 4013 |
| `questionBanks.medium` | 174, 175 |
| `questionBanks.hard` | 272, 273 |
| `questionBanks.elite` | 373, 374 |
| `microSkillRepairPools.demand_shocks` | 5069, 5070 |
| `microSkillBridgePools.ad_to_business_cycles` | 6045 |
| `microSkillBridgePools.shocks_to_policy` | 6048, 6049 |
| `microSkillBridgePools.graph_policy_bridge` | 6068 |

**Alt text:** Three AD curves crossing horizontal SRAS and vertical LRAS.

**Extended description:** The vertical axis is P and the horizontal axis Y. LRAS is vertical at Y1, and SRAS is horizontal at P1. Black AD1, red AD2, and green AD3 slope downward; AD2 is right of AD1 and AD3 is left of it. AD1 crosses both supply lines at (Y1, P1). AD2 has marked crossings at (Y2, P1) on SRAS and (Y1, P2) on LRAS. AD3 has marked crossings at (Y3, P1) on SRAS and (Y1, P3) on LRAS. Y3 is left of Y1, which is left of Y2; P2 is above P1, which is above P3. Dashed guides connect these symbolic coordinates. The marked dots have no letter labels.

#### `adlras.webp`

- Path: `play/macro-command-system/mint-ash-gold/adlras.webp`
- Dimensions: 911 × 819 pixels.
- SHA-256: `51ae4173d32cf8da93e20939cf0d43adb8ce0f7b3d0ff70a04ede99c69e6202e`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9077 |
| `questionBanks.finalBoss` | 4026 |
| `questionBanks.medium` | 177, 178 |
| `questionBanks.hard` | 277 |
| `questionBanks.elite` | 377 |
| `microSkillBridgePools.long_run_adjustment` | 6056 |
| `microSkillBridgePools.graph_policy_bridge` | 6069 |

**Alt text:** Vertical LRAS intersecting three aggregate-demand lines at A, B, and C.

**Extended description:** The vertical axis is P and the horizontal axis Y. LRAS is a vertical line at Y1. Three parallel downward-sloping curves cross it: red AD3 at A and the highest labeled level P3; blue AD1 at B and middle level P1; green AD2 at C and lowest level P2. Dashed horizontal guides connect the intersections to the price labels. All three points have the same horizontal coordinate Y1. No numerical values or arrows are given.

#### `supplyshock.webp`

- Path: `play/macro-command-system/mint-ash-gold/supplyshock.webp`
- Dimensions: 1091 × 842 pixels.
- SHA-256: `c1429a75f0f28e78c889dd8c2d22585dd9bf1b05c8a3c727a6f587c21e07b299`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9078 |
| `questionBanks.legendaryBoss` | 9133 |
| `questionBanks.finalBoss` | 4027 |
| `questionBanks.medium` | 179 |
| `questionBanks.hard` | 278 |
| `questionBanks.elite` | 378 |
| `microSkillBridgePools.shocks_to_policy` | 6050 |
| `microSkillBridgePools.graph_policy_bridge` | 6067 |

**Alt text:** Three horizontal SRAS lines, vertical LRAS, and one downward AD line with points A through E.

**Extended description:** The vertical axis is P and the horizontal axis Y. LRAS is vertical at Y1. SRAS2 is the upper red horizontal line at P2, SRAS1 the middle black line at P1, and SRAS3 the lower green line at P3. The downward black AD line intersects them at C = (Y2, P2), A = (Y1, P1), and E = (Y3, P3). B marks (Y1, P2) on LRAS and SRAS2; D marks (Y1, P3) on LRAS and SRAS3. Dashed vertical guides mark Y2 to the left of Y1 and Y3 to the right. No numerical values or directional arrows are shown.

#### `shockpluspolicy.webp`

- Path: `play/macro-command-system/mint-ash-gold/shockpluspolicy.webp`
- Dimensions: 1122 × 868 pixels.
- SHA-256: `3508c7abe40b83bb721b85441f285d9929fc2b74d19010d54d09127f1aac6d8f`
- Graph-bearing questions: 12.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.legendary` | 9079, 9083 |
| `questionBanks.legendaryBoss` | 9134 |
| `questionBanks.finalBoss` | 4018, 4030, 4031 |
| `questionBanks.medium` | 183 |
| `questionBanks.hard` | 281 |
| `questionBanks.elite` | 380 |
| `microSkillBridgePools.shocks_to_policy` | 6052, 6053 |
| `microSkillBridgePools.graph_policy_bridge` | 6066 |

**Alt text:** Two AD lines and two horizontal SRAS lines with vertical LRAS and points A through D.

**Extended description:** The vertical axis is P and the horizontal axis Y. LRAS is vertical at Y1. Black SRAS1 is horizontal at P1; red SRAS2 is horizontal at the higher level P2. Black AD1 slopes downward; red AD2 is parallel and to its right. A = (Y1, P1) is on AD1 and SRAS1. B = (Y3, P1) is on AD2 and SRAS1. C = (Y2, P2) is on AD1 and SRAS2. D = (Y1, P2) is on AD2, SRAS2, and LRAS. Dashed vertical guides mark Y2 left of Y1 and Y3 right of Y1. No numerical values, arrows, or timeline are shown.

### Command Nexus

Published bank: `command_nexus_question_bank_student.js`.

#### `is_curves.webp`

- Path: `play/macro-command-system/command-nexus/is_curves.webp`
- Dimensions: 2102 × 1919 pixels.
- SHA-256: `a96520b6d398047a2e370be1f9f7ef0bc0012d5457019bb97d3ccdd4fe151c68`
- Graph-bearing questions: 7.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 6 |
| `questionBanks.medium` | 105 |
| `questionBanks.hard` | 204 |
| `questionBanks.elite` | 304 |
| `questionBanks.mediumBoss` | 3001 |
| `microSkillRepairPools.is_curve_goods_market` | 5008 |
| `microSkillBridgePools.is_curve_goods_market` | 6003 |

**Alt text:** Three downward IS curves with points A through G on labeled income and interest-rate guides.

**Extended description:** The vertical axis is r and the horizontal axis Y. Three parallel downward lines are black IS1 on the left, red IS2 in the middle, and blue IS3 on the right. Dashed guides mark r1 above r2 above r3 and Y1 through Y4 from left to right. On IS1, A = (Y1, r1), D = (Y2, r2), and G = (Y3, r3). On IS2, B = (Y2, r1) and E = (Y3, r2). On IS3, C = (Y3, r1) and F = (Y4, r2). Coordinates are symbolic, with no numerical scale or arrows.

#### `lm_curves.webp`

- Path: `play/macro-command-system/command-nexus/lm_curves.webp`
- Dimensions: 2069 × 1908 pixels.
- SHA-256: `14f33a6dd4fdf932f26581a245527c917a875ace665cdec9854ea3961493c085`
- Graph-bearing questions: 7.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 17 |
| `questionBanks.medium` | 116 |
| `questionBanks.hard` | 215 |
| `questionBanks.elite` | 315 |
| `questionBanks.mediumBoss` | 3004 |
| `microSkillRepairPools.lm_curve_money_market` | 5019 |
| `microSkillBridgePools.lm_curve_money_market` | 6014 |

**Alt text:** Three upward LM curves with points A through F.

**Extended description:** The vertical axis is r and the horizontal axis Y. Three parallel upward lines are black LM1 on the left, red LM2 in the middle, and blue LM3 on the right. At the same Y, LM1 is above LM2, which is above LM3. Dashed guides mark r1 above r2 above r3 and Y1 through Y4 from left to right. A = (Y1, r2) and B = (Y2, r1) lie on LM1. E = (Y2, r3), D = (Y3, r2), and C = (Y4, r1) lie on LM2. F = (Y4, r3) lies on LM3. No numerical values or arrows are given.

#### `is_lm_curves.webp`

- Path: `play/macro-command-system/command-nexus/is_lm_curves.webp`
- Dimensions: 2127 × 1926 pixels.
- SHA-256: `b8f17059cb4dca41a7868afc9a2f09e85f5ec326a15f655d3bd0751e33632df3`
- Graph-bearing questions: 29.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 28, 39, 50, 61 |
| `questionBanks.medium` | 126, 136, 148, 159 |
| `questionBanks.hard` | 226, 235, 249, 259 |
| `questionBanks.elite` | 326, 335, 348, 359 |
| `questionBanks.legendary` | 9026, 9035, 9048, 9059 |
| `questionBanks.mediumBoss` | 3007 |
| `microSkillRepairPools.is_lm_equilibrium` | 5030 |
| `microSkillRepairPools.shock_transmission` | 5041 |
| `microSkillRepairPools.fiscal_policy_is_shift` | 5052 |
| `microSkillRepairPools.monetary_policy_lm_shift` | 5063 |
| `microSkillBridgePools.is_lm_equilibrium` | 6025 |
| `microSkillBridgePools.shock_transmission` | 6038 |
| `microSkillBridgePools.fiscal_policy_is_shift` | 6048 |
| `microSkillBridgePools.monetary_policy_lm_shift` | 6058 |

**Alt text:** IS-LM grid with three IS lines, three LM lines, and eight labeled intersections.

**Extended description:** The vertical axis is r and the horizontal axis Y. Downward lines IS1, IS2, IS3 are black, red, and blue, respectively, ordered left to right. Upward lines LM1, LM2, LM3 use the same color order and are also ordered left to right. Dashed guides mark r1, r2, r3, r4 from top to bottom and Y1 through Y5 from left to right. Marked intersections are A = (Y1, r2), IS1 with LM1; B = (Y2, r1), IS2 with LM1; C = (Y4, r1), IS3 with LM2; D = (Y3, r2), IS2 with LM2; E = (Y5, r2), IS3 with LM3; F = (Y2, r3), IS1 with LM2; G = (Y4, r3), IS2 with LM3; and H = (Y3, r4), IS1 with LM3. There are no numerical values or arrows.

#### `is_lm_ad.webp`

- Path: `play/macro-command-system/command-nexus/is_lm_ad.webp`
- Dimensions: 4265 × 1990 pixels.
- SHA-256: `275b028f880f50b648dd82a9e0ea24f66c0170dde7d10db3dd3deacc6854c5a0`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 72 |
| `questionBanks.medium` | 170 |
| `questionBanks.hard` | 270 |
| `questionBanks.elite` | 370 |
| `questionBanks.legendary` | 9070 |
| `questionBanks.mediumBoss` | 3020 |
| `microSkillRepairPools.aggregate_demand_from_islm` | 5074 |
| `microSkillBridgePools.aggregate_demand_from_islm` | 6069 |

**Alt text:** Two panels showing an IS-LM intersection grid and three AD curves with numbered points.

**Extended description:** Left panel: The vertical axis is r and the horizontal axis Y. Downward lines IS1, IS2, IS3 are black, red, and blue, respectively, ordered left to right. Upward lines LM1, LM2, LM3 use the same color order and are also ordered left to right. Dashed guides mark r1, r2, r3, r4 from top to bottom and Y1 through Y5 from left to right. Marked intersections are A = (Y1, r2), IS1 with LM1; B = (Y2, r1), IS2 with LM1; C = (Y4, r1), IS3 with LM2; D = (Y3, r2), IS2 with LM2; E = (Y5, r2), IS3 with LM3; F = (Y2, r3), IS1 with LM2; G = (Y4, r3), IS2 with LM3; and H = (Y3, r4), IS1 with LM3. Right panel: the vertical axis is P and the horizontal axis Y. Three parallel downward lines are black AD1 on the left, red AD2 in the middle, and blue AD3 on the right. Dashed guides mark P1 above P2 above P3 and Y1 through Y4 from left to right. AD1 contains point 1 at (Y1, P1), point 4 at (Y2, P2), and point 7 at (Y3, P3). AD2 contains point 2 at (Y2, P1) and point 5 at (Y3, P2). AD3 contains point 3 at (Y3, P1) and point 6 at (Y4, P2). Both panels use symbolic labels without numerical units or arrows.

#### `is_lm_lras.webp`

- Path: `play/macro-command-system/command-nexus/is_lm_lras.webp`
- Dimensions: 4024 × 1860 pixels.
- SHA-256: `add4f9644f9e4ae81c330cba8612aaa2457c8379c2cc328fdc62f3886f35bcfb`
- Graph-bearing questions: 7.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 83 |
| `questionBanks.medium` | 181 |
| `questionBanks.hard` | 281 |
| `questionBanks.elite` | 381 |
| `questionBanks.legendary` | 9081 |
| `microSkillRepairPools.depression_crisis_mechanisms` | 5085 |
| `microSkillBridgePools.depression_crisis_mechanisms` | 6081 |

**Alt text:** Two panels showing IS-LM with LRAS and AD with three horizontal SRAS lines.

**Extended description:** Left panel: the vertical axis is r and the horizontal axis Y. Black IS1 and red IS2 slope downward, with IS2 to the right. Black LM1 and red LM2 slope upward, with LM2 to the right. LRAS is vertical at Y2. A = (Y2, r1) is IS1 with LM2; B = (Y1, r2) is IS1 with LM1; C = (Y3, r2) is IS2 with LM2; D = (Y2, r3) is IS2 with LM1. Dashed guides mark r3 above r2 above r1 and Y1 left of Y2 left of Y3. Right panel: the vertical axis is P and the horizontal axis Y. A downward AD line crosses upper purple SRAS3 at A with output Y1, middle black SRAS2 at B = (Y2, P2), and lower red SRAS1 at C = (Y3, P1). LRAS is vertical through B at Y2. The price level at A is not labeled on the axis. Vertical dashed guides mark Y1 and Y3. There are no numerical values or arrows.

#### `pe_ae.webp`

- Path: `play/macro-command-system/command-nexus/pe_ae.webp`
- Dimensions: 2606 × 1887 pixels.
- SHA-256: `478e080e3a8eaec32fe45f7c6d324ce1ef39bed064c06760ffeabc06f505b56c`
- Graph-bearing questions: 1.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.medium` | 109 |

**Alt text:** Expenditure diagram with lines AE, PE1, and PE2 and points A through E.

**Extended description:** The vertical axis is PE and the horizontal axis Y. Blue AE is a steep upward line through the origin. Black PE1 and red PE2 are shallower parallel upward lines, with PE2 above PE1. Points A, B, C, D, and E all lie on AE: A = (Y1, PE1), B = (Y2, PE2), C = (Y3, PE3), D = (Y4, PE4), and E = (Y5, PE5), where PE1 through PE5 here denote the vertical-axis levels. B is also the intersection with the black PE1 line; D is also the intersection with the red PE2 line. Dashed guides connect the five points to the axes. Both axis levels and curve names use PE labels; no numerical values are printed.

### Exchange Citadel

Published bank: `exchange_citadel_question_bank_student.js`.

#### `loanablefunds.png`

- Path: `play/macro-command-system/exchange-citadel/loanablefunds.png`
- Dimensions: 2793 × 1875 pixels.
- SHA-256: `a0abb04774c930b633253fabc8f99e4ba16c00a45ac6cf6cd455d3d4cc78c07d`
- Graph-bearing questions: 14.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 54, 55, 56, 87 |
| `questionBanks.medium` | 100, 101, 127, 128 |
| `questionBanks.hard` | 222, 226, 260, 261 |
| `questionBanks.easyBoss` | 2007, 2008 |

**Alt text:** Open-economy saving and investment graph with seven points at three world interest-rate levels.

**Extended description:** The vertical axis is real interest rate, r, and the horizontal axis is Investment, Saving (I, S). A gray line I(r) slopes downward. A vertical line S stands at I2. Dashed guides mark r_w1 above r_w2 above r_w3 and I1, I2, I3 from left to right. Points are A = (I1, r_w1), B = (I2, r_w1), C = (I1, r_w2), D = (I2, r_w2), E = (I1, r_w3), F = (I2, r_w3), and G = (I3, r_w3). A, D, and G lie on I(r); B, D, and F lie on S. No numerical values are given.

#### `realexchangerates.png`

- Path: `play/macro-command-system/exchange-citadel/realexchangerates.png`
- Dimensions: 2632 × 1789 pixels.
- SHA-256: `a8b9f6ec8064dc4361dec1d6c477da803bea3cd8718ccc3de0dedde675d7759c`
- Graph-bearing questions: 8.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 57, 58, 59, 88 |
| `questionBanks.medium` | 179, 180 |
| `questionBanks.hard` | 225 |
| `questionBanks.easyBoss` | 2010 |

**Alt text:** Real-exchange-rate graph with a downward line, vertical S minus I, and points A through G.

**Extended description:** The vertical axis is real exchange rate, R, and the horizontal axis is Net Exports. An unlabeled gray line slopes downward; a vertical line labeled S - I stands at NX2. Dashed guides mark R1 above R2 above R3 and NX1, NX2, NX3 from left to right. Points are A = (NX1, R1), B = (NX2, R1), C = (NX1, R2), D = (NX2, R2), E = (NX1, R3), F = (NX2, R3), and G = (NX3, R3). A, D, and G lie on the downward line; B, D, and F lie on S - I. No numerical values or arrows are shown.

#### `impossibletrinity.png`

- Path: `play/macro-command-system/exchange-citadel/impossibletrinity.png`
- Dimensions: 2979 × 1826 pixels.
- SHA-256: `7758a7d859e69b5e7de1da61ed294d511de575ff1b06a792ae855839370135cf`
- Graph-bearing questions: 24.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 60, 61, 89, 90 |
| `questionBanks.medium` | 151 |
| `questionBanks.hard` | 215, 229, 246, 247, 248, 285, 286 |
| `questionBanks.elite` | 372, 373, 374 |
| `questionBanks.legendary` | 9009, 9029, 9040, 9084 |
| `questionBanks.easyBoss` | 2015 |
| `questionBanks.mediumBoss` | 3012, 3013 |
| `questionBanks.finalBoss` | 4013 |
| `questionBanks.legendaryBoss` | 9113 |

**Alt text:** Triangle with three policy-goal labels and sides numbered 1, 2, and 3.

**Extended description:** A purple triangle has Independent monetary policy above its top vertex, Fixed exchange rate beside its bottom-left vertex, and Free capital mobility beside its bottom-right vertex. Side 1 is the left sloping edge connecting Fixed exchange rate and Independent monetary policy. Side 2 is the right sloping edge connecting Independent monetary policy and Free capital mobility. Side 3 is the horizontal bottom edge connecting Fixed exchange rate and Free capital mobility. There are no axes, marked interior points, directional arrows, or additional written claims.

#### `mundell_ad.png`

- Path: `play/macro-command-system/exchange-citadel/mundell_ad.png`
- Dimensions: 3724 × 1878 pixels.
- SHA-256: `ccab25a0032a6e339cd089c99bc6b9d2cc0ca06cad4c8d4cdfb84ed7b5095797`
- Graph-bearing questions: 5.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 62, 63 |
| `questionBanks.medium` | 138 |
| `questionBanks.hard` | 210 |
| `questionBanks.mediumBoss` | 3016 |

**Alt text:** Paired exchange-rate and aggregate-demand panels with points A, B, and C.

**Extended description:** Left panel: the vertical axis is epsilon (ε) and the horizontal axis Y. A downward gray line labeled IS crosses three vertical lines: gray LM*(P1) at Y1, red LM*(P2) at Y2, and blue LM*(P3) at Y3. The intersections are A = (Y1, ε1), B = (Y2, ε2), and C = (Y3, ε3). Dashed horizontal guides show ε1 above ε2 above ε3; Y1, Y2, Y3 increase left to right. Right panel: the vertical axis is P and the horizontal axis Y. A downward line AD contains A = (Y1, P1), B = (Y2, P2), and C = (Y3, P3). Dashed horizontal and vertical guides connect these points to the axes. P1 is above P2 above P3. There are no numerical scales or arrows.

#### `islm_exchangerates.png`

- Path: `play/macro-command-system/exchange-citadel/islm_exchangerates.png`
- Dimensions: 2170 × 1669 pixels.
- SHA-256: `6eb6a6629c39aa80aaf37928d38496af3a402b1b44fca370377337fd0ec32048`
- Graph-bearing questions: 13.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 64 |
| `questionBanks.medium` | 108, 109, 136 |
| `questionBanks.hard` | 208 |
| `questionBanks.elite` | 308, 326, 341, 385 |
| `questionBanks.legendary` | 9043, 9059 |
| `questionBanks.mediumBoss` | 3004 |
| `questionBanks.legendaryBoss` | 9111 |

**Alt text:** Three downward IS curves intersecting one vertical LM line at exchange-rate points A, B, and C.

**Extended description:** The vertical axis is Exchange rate, e, and the horizontal axis Y. LM is vertical at Y*. Three parallel downward lines are red IS1 at the upper/right position, gray IS2 in the middle, and blue IS3 at the lower/left position. Their intersections with LM are A = (Y*, e1), B = (Y*, e2), and C = (Y*, e3), respectively. Dashed horizontal guides show e1 above e2 above e3. All three marked points share Y*. There are no numerical values or arrows.

#### `islm_er_change.png`

- Path: `play/macro-command-system/exchange-citadel/islm_er_change.png`
- Dimensions: 2268 × 1673 pixels.
- SHA-256: `b5b534fee5af74c06b338ae6a45115587746e105452c484f57fc4c888dc275ba`
- Graph-bearing questions: 14.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.easy` | 65 |
| `questionBanks.medium` | 110, 111, 137 |
| `questionBanks.hard` | 209, 228 |
| `questionBanks.elite` | 307, 327, 340, 386 |
| `questionBanks.legendary` | 9044, 9058 |
| `questionBanks.mediumBoss` | 3007 |
| `questionBanks.legendaryBoss` | 9110 |

**Alt text:** One downward IS curve intersecting three vertical LM lines at A, B, and C.

**Extended description:** The vertical axis is Exchange rate, e, and the horizontal axis Y. Gray IS slopes downward. Three vertical lines are blue LM1 at Y1, gray LM2 at Y2, and red LM3 at Y3, ordered left to right. Their intersections with IS are A = (Y1, e1), B = (Y2, e2), and C = (Y3, e3). Dashed horizontal guides show e1 above e2 above e3. No numerical values or arrows are shown.

#### `loanablefunds_changes.png`

- Path: `play/macro-command-system/exchange-citadel/loanablefunds_changes.png`
- Dimensions: 2759 × 1868 pixels.
- SHA-256: `acda23b382d6c71ca5fc1118afb20ebb08868edc4a44be0f00b5ed7bfdfffc04`
- Graph-bearing questions: 7.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.medium` | 102, 129, 130, 177, 178 |
| `questionBanks.hard` | 262, 263 |

**Alt text:** Three vertical saving lines and one downward investment line with points A through G.

**Extended description:** The vertical axis is real interest rate, r, and the horizontal axis Investment, Saving (I, S). Red S1, gray S2, and blue S3 are vertical at I1, I2, and I3, respectively, from left to right. A gray I(r) line slopes downward. Horizontal dashed guides mark r_w1 above r_w2 above r_w3. The marked points are A = (I1, r_w1), B = (I2, r_w1), C = (I1, r_w2), D = (I2, r_w2), E = (I3, r_w2), F = (I2, r_w3), and G = (I3, r_w3). A, D, and G lie on I(r). The other dots lie on the saving lines at the indicated levels. No numerical values or arrows are given.

#### `loanablefunds_changes_investment.png`

- Path: `play/macro-command-system/exchange-citadel/loanablefunds_changes_investment.png`
- Dimensions: 2856 × 1878 pixels.
- SHA-256: `407fc5de01173f41f794f3461a61b1c92cc8fc1ec20aa9aec4e0b640443ce1cd`
- Graph-bearing questions: 6.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.medium` | 103, 131 |
| `questionBanks.hard` | 264 |
| `questionBanks.elite` | 309, 344 |
| `questionBanks.legendary` | 9062 |

**Alt text:** Three investment-demand lines and one vertical saving line with points A through H.

**Extended description:** The vertical axis is real interest rate, r, and the horizontal axis Investment, Saving (I, S). Three parallel downward curves are blue I(r)1 at the lower/left position, gray I(r)2 in the middle, and red I(r)3 at the upper/right position. S1 is vertical at I2. Dashed guides mark r_w1 above r_w2 above r_w3 and I1, I2, I3 from left to right. Points are A = (I1, r_w1), B = (I2, r_w1), C = (I1, r_w2), D = (I2, r_w2), E = (I3, r_w2), F = (I1, r_w3), G = (I2, r_w3), and H = (I3, r_w3). C and G lie on I(r)1; A and D lie on I(r)2; B and E lie on I(r)3. B, D, and G lie on S1. F and H are marked guide points off the three investment curves. No numerical values are supplied.

#### `rer_changes.png`

- Path: `play/macro-command-system/exchange-citadel/rer_changes.png`
- Dimensions: 2537 × 1789 pixels.
- SHA-256: `b3aaf9c72cad26be421715e194739417cba4212386265b45804f2c250dba77e9`
- Graph-bearing questions: 16.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.medium` | 104, 105, 132, 133 |
| `questionBanks.hard` | 205, 206, 265, 266, 271, 272 |
| `questionBanks.elite` | 343 |
| `questionBanks.legendary` | 9006, 9026, 9061 |
| `questionBanks.finalBoss` | 4004 |
| `questionBanks.legendaryBoss` | 9104 |

**Alt text:** Three vertical saving-minus-investment lines and a downward curve with a nine-point grid.

**Extended description:** The vertical axis is real exchange rate, R, and the horizontal axis Net Exports. Three vertical lines stand at NX1, NX2, and NX3: red S1 - I1, gray S2 - I2, and blue S3 - I3, respectively. An unlabeled gray line slopes downward. Dashed horizontal guides mark R1 above R2 above R3. Across NX1, NX2, NX3, the top row is A, B, C at R1; the middle row is D, E, F at R2; the bottom row is G, H, I at R3. The downward line passes through A = (NX1, R1), E = (NX2, R2), and I = (NX3, R3). The other six dots lie off that line. No numerical scales or arrows are shown.

#### `tradepolicies.png`

- Path: `play/macro-command-system/exchange-citadel/tradepolicies.png`
- Dimensions: 2739 × 1807 pixels.
- SHA-256: `814021d0bd05bba0cc4719d540a12d80e417c7d6aa05569107512d9c9ad2b0b3`
- Graph-bearing questions: 15.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.medium` | 106, 107, 134, 135 |
| `questionBanks.hard` | 207, 267, 268, 273, 274 |
| `questionBanks.elite` | 342 |
| `questionBanks.legendary` | 9007, 9027, 9060 |
| `questionBanks.finalBoss` | 4007 |
| `questionBanks.legendaryBoss` | 9107 |

**Alt text:** Three downward net-export curves crossing a fixed vertical S-minus-I line.

**Extended description:** The vertical axis is real exchange rate, R, and the horizontal axis Net Exports. A vertical line S - I is at the horizontal-axis label NX. Three parallel downward lines are red NX(R)1 at the upper/right position, gray NX(R)2 in the middle, and blue NX(R)3 at the lower/left position. Their intersections with S - I are A at (NX, R1), B at (NX, R2), and C at (NX, R3), respectively. Dashed horizontal guides show R1 above R2 above R3. All three points have the same NX coordinate. No numerical values or arrows are shown.

#### `mundell_adas.png`

- Path: `play/macro-command-system/exchange-citadel/mundell_adas.png`
- Dimensions: 3844 × 1875 pixels.
- SHA-256: `6bf5d2bd833d5579751b6ce277a3a2d781360be7b539fdccbbab07c053bcf8a7`
- Graph-bearing questions: 19.

| Published pool | Question IDs |
| --- | --- |
| `questionBanks.hard` | 244, 245, 279, 280 |
| `questionBanks.elite` | 306, 324, 325, 339, 370, 371, 384 |
| `questionBanks.legendary` | 9008, 9028, 9041, 9057, 9082, 9083 |
| `questionBanks.finalBoss` | 4016 |
| `questionBanks.legendaryBoss` | 9116 |

**Alt text:** Exchange-rate panel beside an AD-SRAS-LRAS panel, both with points A, B, and C.

**Extended description:** Left panel: the vertical axis is epsilon (ε) and the horizontal axis Y. A downward gray line labeled IS crosses three vertical lines: gray LM*(P1) at Y1, red LM*(P2) at Y2, and blue LM*(P3) at Y3. The intersections are A = (Y1, ε1), B = (Y2, ε2), and C = (Y3, ε3). Dashed horizontal guides show ε1 above ε2 above ε3; Y1, Y2, Y3 increase left to right. Right panel: the vertical axis is P and the horizontal axis Y. A downward gray AD line crosses horizontal SRAS1 at A = (Y1, P1), horizontal red SRAS2 at B = (Y2, P2), and horizontal blue SRAS3 at C = (Y3, P3). P1 is above P2 above P3. A vertical LRAS line passes through B at Y2; vertical dashed guides mark Y1 and Y3. There are no numerical scales or directional arrows.
