# Measurement, Growth & Labor assessment audit

Completed 2026-09-07 in the canonical repository. The audit revises **85 existing questions** and retains **859 unchanged**, preserving all 944 IDs, ordered pools, metadata, routes and mode eligibility. No question or asset was added or removed. The current preset has nine ready modes; Trial by Graph was already not ready and remains so. No deployment, commit or push was performed.

## Current architecture and authoritative source

The quick start is **`macro-measurement-growth` — Measurement, Growth & Labor**, defined in the current `build/faculty-build-composer/composer.js` preset list. Its exact selection order is the module order in the table below. All 17 are direct materialized modules: none has `derivedFromConceptId`. The current preset selects individual GDP, price-measurement, growth and labor concepts; it does not import a historical broad family merely because that family appeared in an earlier taxonomy report.

The authoritative live question source is `build/faculty-build-composer/data/composer_library.js`. The current Composer page loads it directly (`index.html`, line 226), and `composer-core.js` resolves the selected modules and constructs gameplay/support pools. The synchronized dependencies modified are `data/composer_registry.json` and `data/composer_library_manifest.json`, whose semantic library hashes must match the library. No separate workbook or original game is loaded as an upstream question source by this runtime. Historical `audit_tools/apply_macro_m2b*.mjs` programs read and mutate a version-guarded live library and preserve historical source provenance; they are migration evidence, not a current regeneration requirement. Their old phase guards do not describe today’s baseline. The historical rewrite workbook and The National Ledger were not treated as the current source of truth or edited.

The baseline already contains the completed Micro Trade & Welfare audit. This macro pass preserves every unrelated Micro/Macro module and all 132 other or derived module definitions exactly. Only question stems, choices, feedback and answer hashes change in the 17 selected direct modules. The Composer controller/core, master template, Concept Review manifest, engine, UI, telemetry, access control, polished games and Managerial content are unchanged.

## Inventory and exact changes

`BEFORE.md`, `AUDIT_FINDINGS_BEFORE.md` and `inventory-before.json` were created before authoring. The inventories include exact full record objects, source module views, ordered source/composed pools, calculation entries, adaptive metadata, mode ID lists, assets, Concept Review routing and protected-file hashes. `changes.json` provides every changed ID with its source pool, difficulty, objective, skill, reason and exact old/new changed fields. `record-actions.json` accounts for all 944 retained or revised records.

| Selected concept in preset order | Objective identities and counts actually present | Before / after unique | Content revised |
|---|---|---:|---:|
| `gdp-measurement` | LO24.1: 29, LO24.2: 44 | 73 | 6 |
| `gdp-components` | LO24.3: 48, MACRO.M2B1: 15 | 63 | 4 |
| `real-versus-nominal-gdp` | LO24.4: 36, MACRO.M2B1: 13 | 49 | 8 |
| `limits-of-gdp` | LO24.5: 23, MACRO.M2B1: 22 | 45 | 3 |
| `cpi-and-inflation-measurement` | LO25.1: 60 | 60 | 8 |
| `cpi-bias` | LO25.2: 35, LO25.3: 12 | 47 | 3 |
| `cpi-versus-gdp-deflator` | LO25.3: 27, LO25.2: 16 | 43 | 5 |
| `indexing-and-real-values` | LO25.4: 49 | 49 | 4 |
| `real-versus-nominal-interest-rates` | LO25.5: 46 | 46 | 6 |
| `living-standards-and-growth` | LO26.1: 56 | 56 | 5 |
| `productivity-measurement` | LO26.2: 53 | 53 | 5 |
| `sources-of-productivity` | LO26.3: 72 | 72 | 4 |
| `economic-growth-policy` | LO26.4: 50 | 50 | 4 |
| `unemployment-measurement` | LO29.1: 47, LO29.2: 31, LO29.1_LO29.2_LO29.5: 1 | 79 | 8 |
| `unemployment-types` | LO29.3: 57 | 57 | 3 |
| `labor-market-institutions` | LO29.4: 58 | 58 | 5 |
| `natural-rate-of-unemployment` | LO29.5: 44 | 44 | 4 |

The per-module objective entries deliberately show historical labels rather than silently correcting them. `MACRO.M2B1` remains on some GDP-family records; CPI Bias and CPI-versus-Deflator each include records bearing the other legacy LO25.2/LO25.3 label. The unemployment module contains one integrated LO29.1_LO29.2_LO29.5 record. These are routing/taxonomy anomalies to report, not permission to renumber objectives.

| Canonical difficulty | Before | After | Revised |
|---|---:|---:|---:|
| Easy | 195 | 195 | 0 |
| Medium | 204 | 204 | 2 |
| Hard | 207 | 207 | 7 |
| Elite | 80 | 80 | 11 |
| Legendary | 159 | 159 | 65 |
| `unknown` support classification | 99 | 99 | 0 |

The difficulty totals include checkpoints and support. Ordinary composed banks are Easy 122, Medium 129, Hard 126, Elite 80 and Legendary 108 (565 total), all unchanged. Checkpoints are easyBoss 73, mediumBoss 75, finalBoss 81 and legendaryBoss 51 (280 total). Support remains 60 repair, zero repair seeds and 39 bridge records. There are no dedicated challenge or integration pools, although 24 records have the historical `integration` type.

The calculation collection has **67 records**: 10 also appear in the five source ordinary banks, while 57 are calculation-only source entries merged into their canonical runtime difficulties. These are not 67 additional records beyond the 944 inventory. Source ordinary pools total 508; after merging the 57 calculation-only records, ordinary runtime eligibility totals 565. Every calculation membership and alias is preserved.

Exact unchanged type counts are: definition 89; interpretation 240; trap 43; multi-step 68; calculation 169; checkpoint 11; integration 24; repair 57; bridge 39; application 192; graph 12. Types are not relabeled to advertise richer cognitive demand.

There are **zero** question path-only fixes, zero asset metadata corrections, zero asset additions/removals, and zero question additions/removals. Three production data files change; the validation artifacts are additional documentation only.

## Findings and substantive decisions

Classification is A true coverage gap, B robustness gap, C calibration gap, D numerical/integration gap, E graph/image-use gap, F no material gap. The pre-authoring table in `AUDIT_FINDINGS_BEFORE.md` classifies every selected module and every objective identity. No legitimate selected skill was absent enough to require a new question ID, concept or pool. The principal gaps were selected logical defects, repetitive upper-tier tasks and insufficient calculation-to-interpretation links. Substantial ordinary Hard was already exam-calibrated and remains.

**GDP / national income — F core coverage; B/C/D targeted repairs and integration.** Hard already includes final/intermediate and domestic/foreign boundaries, spending/income reconciliation, transfers, imports and inventories. The 6 GDP Measurement and 4 GDP Components changes concentrate on upper tiers: infer residual profit, reconcile domestic value added across stages, distinguish current brokerage from a used asset, separate inventory stocks from inventory changes, and account for transfer-financed consumption with imports. Imports remove foreign production already included in spending; they are not subtracted because purchasing them is inherently harmful. This treatment was cross-checked against [BEA’s expenditure explanation](https://www.bea.gov/index.php/news/blog/2025-06-03/bea-blog-expenditures-approach-measuring-gdp).

**Nominal/real GDP — F ordinary methods; B/C/D upper-tier reconstruction.** Existing Hard base-price calculations and ratio growth remain. One Hard item now diagnoses dividing by a deflator of 120 instead of 1.20, then derives output growth. The old Legendary checkpoint 9103 literally contained a pasted `Options:` list in its stem; that defect is removed. Elite/Legendary revisions infer missing quantities, reconstruct a later deflator from a real-output target, compare opposite nominal/real movements, and separate a price index’s base-year level from its cumulative period change. GDP ratio calculations use the stated fixed-base classroom model, not an unstated change to official chain-weighted methodology.

**Limits of GDP — F ordinary applied coverage; C/D evidence limits.** Existing ordinary pollution, leisure, distribution, unpaid production and safety items are retained. Three Legendary revisions distinguish hourly productivity from per-person output, current rebuilding flows from destroyed wealth, and a free service’s consumer benefit from changes in paid market output. Calculated GDP changes do not establish a numerical welfare gain or loss.

**CPI/inflation — F strong Hard; B actual weighting defect; C/D upper-tier chains.** The existing Hard bank already calculates CPI plus inflation in one question, weighted baskets, missing base cost and successive price changes. P52A-CPI-M005 wrongly inferred expenditure weights from the number of units; its revised basket supplies prices and teaches the correct spending weight. [BLS explains that index weights come from expenditure data](https://www.bls.gov/cpi/tables/relative-importance/). A pre-existing Medium stem exactly matching the exam’s simple CPI change was changed into denominator-error diagnosis. Upper tiers now infer missing basket quantities/prices, rebase an index without erasing inflation, compound price changes, and track real wages across a price reversal. The simplified fixed-basket formula remains explicit.

**CPI bias and index coverage — F ordinary topics; B/C/D precision and inference.** Existing substitution, quality and new-goods coverage is substantial. Revisions evaluate whether a cheaper bundle preserves the same service, whether a controlled durability gain offsets a product-price rise, and what evidence is needed before quantifying substitution bias. These are classroom fixed-basket examples, not claims that current official CPI makes no adjustments; [BLS describes adjustments and remaining measurement challenges](https://www.bls.gov/opub/mlr/2024/article/assessing-and-improving-the-accuracy-of-the-cpi.htm). A composition prompt now specifies prices relative to their base-year prices rather than merely “higher relative prices.” Other revisions compute consumer and domestic-output indexes separately or state why domestic weights are needed to calculate a deflator change. Imported consumer goods and domestic investment/export goods are treated according to the appropriate index scope.

**Indexing / purchasing power — F ordinary adjustment; C/D chained/reverse cases.** Ordinary salary conversion, CPI bias, differing household baskets and lagged indexation remain. Revisions compare partial adjustment with the amount required to restore purchasing power, infer a missing index, and evaluate a frozen or delayed payment across multiple price changes. Transfers are not confused with changes in real resources.

**Real interest — F approximate method; B internal taxonomy prompts; C/D linked measurement.** Two Hard prompts asked students to distinguish internal “F2/F6” families. They now distinguish observed realized returns from unobserved expected returns or unsupported predictions about future nominal rates, preserving the existing boundary skill. Elite/Legendary items infer expected inflation from a target return, measure actual inflation from CPI/basket costs, and assess realized purchasing-power returns. Every revised item uses approximate real interest = nominal interest minus inflation. The pre-existing PM2B2-RNI-FB005 explicitly requests the exact Fisher relation and is retained as a documented exception; that method was not silently introduced elsewhere.

**Growth / living standards — F core coverage; C/D selected synthesis.** Rule of 70 is genuinely selected. Ordinary Hard already compares GDP/population growth, output per person and distribution limits. Upper-tier revisions compare several doublings with a moving rival, deflate national totals before per-person comparisons, distinguish hours from residents, and reconstruct how productivity, hours/worker and employment shares jointly affect average output. Higher productivity does not guarantee zero unemployment, equal distribution or improvement in every welfare dimension.

**Productivity and its sources — F ordinary units/input distinctions; B/C/D controlled inference; E one graph item.** Existing Hard already calculates output per worker/hour and cases where total output and productivity move differently. Revisions reconstruct total labor hours, distinguish falling output/worker from rising output/hour, derive productivity required by an output target, and infer employment shares. One prior Legendary answer loosely connected declining worker productivity with weakened living-standard gains; the revision explicitly shows how GDP/person can rise with population fixed. Source questions now test complementary capital/training and controlled diminishing returns. A changed technology is not evidence against diminishing capital returns with other inputs held fixed. In graph checkpoint PM2B3-PROD-FB004, the coordinates are now required from the approved figure rather than supplied in the stem; students calculate about 27.5% and interpret diminishing marginal gains.

**Growth policy — F ordinary packages; C conditional recommendations.** Existing ordinary questions already cover institutions, investment, education, research, health, trade and complementary inputs. Revisions evaluate enforcement risk, barriers to adopting methods, lagged research outcomes and diminishing returns behind a proposed strategy. The study guide confirms the saving-to-productive-investment growth channel; no loanable-funds equilibrium, banking or government-budget identity was added.

**Labor measurement — F strong Hard; C/D selected checkpoints and upper tiers.** Existing Hard already constructs the labor force, calculates unemployment and participation, and handles discouragement and part-time work. Revisions solve several simultaneous transitions, reconstruct starting employment from rates, infer hiring versus search exits, and show why a stable unemployment rate need not imply stable employment. Two simple final-checkpoint definitions become applied measurement/transition questions. All revised seekers are stated available when needed, and part-time paid workers remain employed. The concepts were checked against [BLS labor-force definitions](https://www.bls.gov/cps/definitions.htm).

**Unemployment types, institutions and natural rate — F core coverage; B/C/D distinctions.** The study guide confirms minimum wages, unions and efficiency wages as well as unemployment insurance and job search. Strong ordinary classification, cyclical-to-structural transition, and opposing benefit/matching channels remain. Revised upper tiers identify evidence that distinguishes mismatch from weak demand, choose remedies based on cause, distinguish a wage-floor labor surplus from the number of jobs lost, calculate a wage bill without assuming every worker gains, and assess a conditional efficiency-wage cost forecast. Natural-rate revisions decompose changed frictional/structural components and compare actual unemployment with a moving natural benchmark. More generous benefits can reduce the cost of search; combined policy outcomes do not identify that channel’s isolated effect.

## How the documents calibrated the work

The actual 40-question macro midterm was read completely for voice, including all three embedded figures. Its selected questions alone supplied substantive calibration: Q2/17 for GDP spending/income and counting; Q10/31 for nominal-real-deflator chains; Q5/38 for CPI and inflation; Q14/21 for bias and coverage; Q29 for purchasing power; Q35 for approximate real interest; Q7/16/24/32/40 for productivity units, compounding, catch-up, policy and living standards; Q9/18/26/34 for labor counts, cyclical classification, search incentives and natural unemployment; Q23 for GDP’s limits. Their values, distinctive contexts and answer patterns were not republished as practice items.

The attached ECO 2251 study guide was secondary evidence for intended coverage and formulas. Its Chapters 24–26/29 confirm the relevant boundaries, including LFPR, the four productivity inputs and labor institutions. It did not prescribe which difficulty each skill deserves, and an exam omission did not justify deleting established content. Neither the guide’s earlier Micro chapters nor excluded exam questions created new coverage requirements.

Costs of Inflation is **not** in the actual selected preset. Established neighboring language remains in some records: expected versus realized inflation, below-natural unemployment/inflation pressure, hysteresis, and cyclical changes described using aggregate demand. These were not expanded into Fisher-effect adjustment, Phillips curves, AD-AS, stabilization policy, money/banking, foreign exchange, loanable funds or budgets/debt. Their presence is reported rather than silently normalizing the taxonomy.

## Validation, graph evidence and routing

All **944** question records pass answer-hash validation, four-distinct-option checks and nonempty content checks. Every revised answer has one defensible keyed alternative under its assumptions, an independently reviewed explanation and no new duplicate stem against the full library. The original correct option position is preserved while the answer hash is updated. An independent review caught and clarified the starting cyclical component in a drafted natural-rate case before application.

`numerical-validation.json` recomputes **all 66 revised numerical items** in a verifier that does not import the authoring program. Independent final-stem calculations are compared with displayed keyed results and their stated rounding; an additional **138** arithmetic assertions cross-check intermediate values. The other **19** revisions receive conceptual alternative/assumption review. GDP, CPI, indexing, real interest, growth, productivity and labor quantities/units all pass. Unchanged existing numerical items were reviewed for coverage and obvious defects; this is not a claim to have independently re-solved every untouched record.

`originality-validation.json` records a full private-midterm ten-word-overlap screen plus manual scenario, number-pattern and answer-pattern review. No revised stem has a ten-word match. The screen is supporting evidence, not a substitute for judging near-copies. Two pre-existing arithmetic parallels were replaced with different reasoning structures. The audit artifacts contain the game bank’s exact records, as required, but no separate exam answer key, exam transcription or exam images.

The 12 image-linked records use three namespaced registrations of the same approved GROWTH-01 image. All three were inspected: A=(20,28.53), B=(40,36.37), axes capital/worker and output/worker, increasing concave curve. Existing alt text and descriptions accurately supply evidence and do not give the computed percentage change. All paths resolve; all image bytes and metadata are unchanged. No new graph is required. No AD-AS, money-market, loanable-funds, Phillips or foreign-exchange figure was introduced.

The final generated game was loaded in Microsoft Edge. All 85 revised payloads match, all 12 graph records decode and open in the enlargement view with nonempty descriptions, and there are no page errors. The smoke test starts a game and directly exercises record rendering; `browser-smoke.png` shows the revised Hard graph checkpoint through the loaded renderer, not evidence that Legendary selection now includes Hard records. The build enables the nine ready modes. This is a focused content smoke check, not a broad engine or all-mode gameplay certification.

Ordinary pools, checkpoint stages/coverage, support lists, direct/micro-skill repair maps, seed maps, bridge maps, skill/common-error tags, concept/LO/type/difficulty fields, graph flags and all ordered memberships are exact before/after matches. Retests use the unchanged engine’s room-based ordinary bank: easy through room 9, medium through 19, hard through 29, then elite, with its existing skill/objective/tag and concept fallback targeting. Remediation transitions remain suppressed during active checkpoints and in Legendary, Quiz, Trial by Graph, Fading Fortune and Risk & Reward. No route was changed because an item became cognitively richer.

Concept Review still resolves MACRO-01 through MACRO-17 with identical central-HTTPS runtime routes, registered assets and zero errors. Existing library-wide warnings about unrelated parents/child reviews and orphan MICRO-03 are unchanged. The selected concepts’ exact review map is recorded in both inventories.

**Mode readiness is unchanged:** Standard, Timed, Exam Drill, Quiz, Unlimited, Legendary, Score Attack, Fading Fortune and Risk & Reward are ready. Fading Fortune and Risk & Reward each retain exactly 565 eligible ordinary IDs. Trial by Graph has zero graph-safe IDs against its minimum of 10; its baseline readiness error remains `Trial by Graph: graphSafe needs 10, found 0`. Twelve image-linked questions do not imply 12 Trial by Graph-eligible questions. Preserving image/eligibility architecture is the reason this content audit does not turn that mode on.

## Quality dispositions and remaining unevenness

The existing quality auditor reports zero errors before and after. Warnings decline from **148 to 137**, and review notices from **219 to 212**. Remaining warnings are 129 repeated-feedback notices and 8 image-without-graph-required notices; the latter increases by one because the revised graph checkpoint now explicitly asks for visual evidence while its approved eligibility flags remain unchanged. Review counts are 189 absolute-distractor notices, 9 length outliers, 4 possibly decorative graphs, 3 near-duplicates and 7 possible difficulty overstatements. Every before/after finding has a disposition in `quality-dispositions.json`.

Heuristic scores do not override manual economic reasoning. For example, the auditor flags the revised missing basket-price, multi-period real-wage and output-mix tasks as potentially overleveled despite their linked calculations. Conversely, PM2B2-DEF-LB001 remains a short index-coverage checkpoint and is a real remaining calibration pocket. Short upper-tier items and repeated basic feedback remain elsewhere; this pass deliberately prioritized documented defects and representative synthesis rather than rewriting the whole bank. Some strong items are repeated across ordinary and checkpoint roles. Easy is fully retained.

Natural Rate has only two Elite source records; many modules have three or four. There are no repair seeds and no dedicated challenge/integration pools, but the established nine-mode architecture is ready with 60 repairs, 39 bridges and 280 checkpoints. The 12 image-linked records share one image, and Trial by Graph remains unavailable. These are reported limitations, not newly invented content requirements.

## Artifact use

Required deliverables are `BEFORE.md`, `inventory-before.json`, `inventory-after.json`, `changes.json`, `record-actions.json`, `numerical-validation.json`, `originality-validation.json`, `graph-validation.json`, `quality-before.json`/`.md`, `quality-after.json`/`.md`, `quality-dispositions.json` and this report. Additional structural/browser evidence, source snapshots and scripts are included. To reproduce on this host, copy the artifact folder to a writable `.macro-measure-work` directory and run the authoring/staging/verifier scripts from its parent using the bundled runtimes; `stage.mjs` generates local smoke HTML from the current unchanged Composer engine/template. The supplied exam/guide paths remain private verifier inputs. No historical migration script needs to be replayed.

Final semantic library SHA-256: `15576883e5f7ba86b51490c0fa4fb09d5dde147c292093fe33f7a079ec1a863f`.
