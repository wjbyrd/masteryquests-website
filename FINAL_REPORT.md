# Principles of Macroeconomics Resource-Sheet QA

Audit date: September 10, 2026. Scope: current local source repository at `C:/Users/Jennings/Documents/GitHub/masteryquests-website`. This is a QA/correction pass, not a rebuild of the resource system.

## Executive Summary

| Measure | Result |
|---|---:|
| Active selectable concepts reviewed through the Macro selector | **79**: 57 Macro-specific + 22 shared General Economics |
| Unique resource sheets reviewed | **83**: 57 MACRO + 26 GEN-ECON |
| Fully clean sheets and source records, unchanged | **47**: 32 Macro + 15 shared |
| Sheets requiring and receiving a correction | **34**: 32 PDF corrections + 2 source-metadata-only corrections |
| PDFs corrected | **32**: 23 Macro + 9 shared |
| Sheets remaining subject to the graph decision | **2**: MACRO-23 and MACRO-24 |
| Concept-to-resource mapping errors | **0** |
| Graph/content/usability findings, grouped by affected PDF | **34**: 32 corrected, 2 pending |
| Stale source graph-hash records | **4**, corrected; two overlap the corrected PDFs |
| Unresolved items requiring human judgment | **2**: one material graph/model decision affecting two sheets; one collection-wide accessibility note |

Counts use one grouped graph/content/usability finding per affected PDF, not one count per sentence. The 47 clean + 34 corrected + 2 pending sheets total 83. If counting PDF content alone, 49 PDFs were clean without changes; two of those needed only source graph-hash corrections. The Macro-specific subset is 57 reviewed: 32 clean, 23 corrected, 2 pending.

**Final verdict: NEEDS FOLLOW-UP.** Routing and regression checks pass. The unresolved numerical quantity-theory illustration prevents an unqualified content pass. No question banks, mechanics, telemetry, Composer behavior, navigation, or website design were changed. Existing filenames and directory structure were retained.

## Corrections Made

Each PDF listed below was corrected in both the public `concept-reviews/` directory and the Composer `build/faculty-build-composer/data/concept-reviews/` directory. Its authoring content was synchronized in `concept_review_source.json`. Each change addresses the stated defect rather than a stylistic preference.

| Concept / resource | Problem requiring correction | Correction |
|---|---|---|
| Incentives — [GEN-ECON-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-02.pdf>) | Leftover template text with a subject-verb error interrupted the definition. | Removed the leftover "Incentives shows how to..." template sentence. |
| Marginal Analysis — [GEN-ECON-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-04.pdf>) | The self-check asked students to select a value without supplying any values. | Supplied a cost/quantity setup so the average-versus-marginal self-check can be answered. |
| Microeconomics vs. Macroeconomics — [GEN-ECON-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-05.pdf>) | The self-check referred to a set of outcomes without providing sets. | Converted the missing-choice self-check into an explicit request for three macro outcomes. |
| Positive vs. Normative Analysis — [GEN-ECON-06.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-06.pdf>) | Detached "This is positive" clues had no referent; "should" alone is not a reliable classification rule. | Repaired detached positive-analysis claims and grounded the classification in testability and values. |
| Production Possibilities Frontier (PPF) — [GEN-ECON-08.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-08.pdf>) | A malformed sentence and lowercase acronym remained in the warning. | Corrected the malformed PPF warning sentence. |
| Simultaneous Shifts — [GEN-ECON-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-18.pdf>) | The recognition list gave isolated single-curve changes as clues for simultaneous shifts. | Made the recognition clues describe simultaneous demand and supply changes. |
| Tax Incidence with Elasticity — [GEN-ECON-22.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-22.pdf>) | The warning and recognition text said buyers bear more, contradicting the equal $3 burdens in the worked graph. | Removed the false buyers-bear-more assertion; retained the correctly drawn equal-burden example. |
| International Trade: Quotas — [GEN-ECON-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-25.pdf>) | The warning was copied from the tariff sheet and incorrectly implied quota rents go to government. | Replaced copied tariff text with the correct quota-rent ownership distinction. |
| International Trade: Policy and Distribution — [GEN-ECON-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-26.pdf>) | A condition specific to infant-industry protection was presented as applying to all protection arguments. Identify the specific argument to which the learning condition applies. | Specified that the learning-mechanism condition belongs to the infant-industry argument. |
| GDP Components — [MACRO-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-02.pdf>) | Transfers were said to enter GDP later, conflating the transfer with a subsequent purchase. | Distinguished excluded transfers from separately counted later purchases, including the import offset. |
| Limits of GDP — [MACRO-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-04.pdf>) | The rebuilding example asserted an unconditional net GDP increase despite possible disruption or displaced production. | Qualified the rebuilding GDP increase by holding other domestic production constant. |
| CPI and Inflation Measurement — [MACRO-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-05.pdf>) | Malformed instruction and an unsupported claim that the basket always costs more. | Fixed the malformed CPI instruction and removed the claim that basket costs necessarily rise. |
| Real versus Nominal Interest Rates — [MACRO-09.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-09.pdf>) | The subtraction formula was presented as exact. The numerical answer used the approximation without identifying it. | Marked nominal-minus-inflation as an approximation and showed the exact 3.81% return beside the 4% approximation. |
| Living Standards and Growth — [MACRO-10.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-10.pdf>) | The recognition list ended with the incomplete clue "An economist points to two countries." | Replaced an incomplete recognition clue and made the Rule-of-70 self-check self-contained. |
| Productivity Measurement — [MACRO-11.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-11.pdf>) | Two detached calculations lacked a stated output/labor setup. | Gave the detached productivity calculation its output-and-hours setup. |
| Sources of Productivity — [MACRO-12.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-12.pdf>) | The self-check referred to answer options that were absent. | Replaced a reference to absent options with a physical-versus-human-capital self-check. |
| Unemployment Measurement — [MACRO-14.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-14.pdf>) | Paid-work-only and search-only definitions omitted standard classification exceptions; the promised participation-rate calculation was missing. | Corrected employment/search exceptions and supplied the promised participation-rate formula and 65% example. |
| Types of Unemployment — [MACRO-15.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-15.pdf>) | The warning was grammatically broken and claimed active search alone established official unemployment. | Repaired the malformed warning and separated official status from unemployment type. |
| Labor-Market Institutions — [MACRO-16.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-16.pdf>) | A numerical fragment appeared without its setup in the core definition. The wage-floor example ended with an unrelated job-matching conclusion. | Removed an unintroduced calculation and replaced the unrelated job-matching conclusion in the wage-floor example. |
| Money Functions and Measures — [MACRO-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-18.pdf>) | The unqualified M1 calculation used the pre-May-2020 U.S. definition; the example heading described functions instead of measures. | Distinguished current U.S. M1 from the older textbook definition, corrected the example heading, and supplied an answerable self-check. |
| Central Banking and the Federal Reserve — [MACRO-19.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-19.pdf>) | A recognition bullet stopped at "U.S."; FOMC/structure/independence were promised but unexplained; the reserve-rate example lacked its model qualification. | Completed the truncated FOMC clue, covered the stated structure/independence objective, and qualified reserve-based rate control. |
| Monetary-Policy Tools — [MACRO-21.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-21.pdf>) | Multiplying an 80% lending share by a deposit multiplier of 5 to obtain an "effective multiplier" of 4 is invalid; reserve-rate effects also needed their textbook qualification. | Replaced the invalid 0.80 x 5 effective-multiplier calculation with an explicit 20% reserve-ratio example: 5 x $50m = $250m maximum. Distinguished limited- and ample-reserve rate control. |
| Fisher Effect — [MACRO-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-25.pdf>) | The worked Fisher-equation calculation repeated an approximation as an exact identity. | Distinguished approximate Fisher addition (8%) from exact compounding (8.12%). |
| Costs of Inflation — [MACRO-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-26.pdf>) | The text referred to a graph that is not present on the sheet. | Removed a reference to a graph absent from this sheet. |
| Inflation Tax and Deflation — [MACRO-27.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-27.pdf>) | The sheet titled Inflation Tax and Deflation never explained deflation, disinflation, or the real debt burden. | Added the missing deflation/disinflation and real-debt-burden distinctions already promised by the title/objective; calculated cash purchasing power explicitly. |
| Monetary-Policy Transmission — [MACRO-29.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-29.pdf>) | The warning introduced unprovided numerical assumptions; the graph shows quantity demanded at fixed P, not an AD-AS equilibrium. | Removed unprovided numerical assumptions and identified the AD panel as quantity demanded at fixed P. |
| Fiscal Policy and Aggregate Demand — [MACRO-30.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-30.pdf>) | An AD-only graph was described as establishing equilibrium output. Keep the fixed-price comparison distinct from equilibrium. | Distinguished quantity demanded at fixed P from an AD-AS equilibrium; synchronized the existing graph image with its current repository copy. |
| Fiscal Multipliers and Crowding Out — [MACRO-31.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-31.pdf>) | The calculation objective had no multiplier formula, and the AD-only example described equilibrium output. | Supplied the missing multiplier formulas and a worked $100bn gross expansion; clarified fixed-P demand versus equilibrium output. |
| Aggregate Demand — [MACRO-33.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-33.pdf>) | Recognition labels contradicted the graph; a shift was headed "movement along"; graph readings near 120 and 70 were reported as 120 and 80. | Repaired curve IDs/direction, changed the erroneous movement-along heading, and corrected approximate graph readings to 120 -> 70 (a decline of about 50). Synchronized the current repository graph copy. |
| Short-Run Aggregate Supply — [MACRO-34.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-34.pdf>) | Hand-drawn graph readings were presented as exact coordinates. | Marked the hand-drawn SRAS coordinates as approximate. |
| Short-Run Phillips Curve — [MACRO-37.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-37.pdf>) | The recognition list referenced point B, which is not on the graph. | Removed the reference to nonexistent point B; retained the correct SRPC graphic. |
| Open-Economy Policy and Macroeconomic Transmission — [MACRO-57.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-57.pdf>) | Adjacent FX sheets used different supply models without explaining the change in assumptions. | Explained why the NCO model has vertical FX supply and stated fixed price levels for nominal-rate interpretation. |

Additional source corrections: refreshed stale graph SHA-256 values for **GEN-ECON-19, GEN-ECON-20, MACRO-30, and MACRO-33** in `concept_review_source.json`. The two price-control PDFs were already correct and were left byte-for-byte unchanged. No repository graph asset was edited. The staged renderer used the established repository assets; MACRO-30 and MACRO-33 now embed their current source copies.

`manifest.json` and `concept_review_integration_audit.json` were refreshed only for changed PDF checksums/sizes and aggregate size. Every concept record, review ID, filename, title mapping, and disposition remained unchanged. The existing completion generator was synchronized only for the revised text in MACRO-34 and MACRO-57 so a later targeted build will not restore those defects.

Reference checks used for substantive corrections: current versus historical M1 follows the [Federal Reserve H.6 explanation](https://www.federalreserve.gov/feeds/h6.html); limited- versus ample-reserves implementation follows the [Federal Reserve primer for educators](https://www.federalreserve.gov/econres/notes/feds-notes/closing-the-monetary-policy-curriculum-gap-20201023.html); employment and unemployment classification follows [BLS measurement guidance](https://www.bls.gov/cps/cps_htgm.htm). These sources support the corrections; the sheets preserve their Principles-level scope.

## Verified Clean

All 83 active PDFs were text-extracted and visually inspected as rendered pages. All 39 graph instances were inspected against the underlying repository assets for axes, curves, shifts, coordinates, and accompanying calculations. Formula cards in the newer sheets were also checked. Every changed sheet was re-rendered and inspected after correction.

The set retains one-page layouts, meaningful PDF titles, selectable text, and readable headings. No missing pages, missing printed concept IDs, broken embedded images, page-boundary text overflow, or missing revised text was found. Internal PDF annotations do not supply the game return action; “Return to the game” is instructional text, not a promised embedded hyperlink. Accessibility tagging remains a separate limitation below.

Fully unchanged sheets/source records: GEN-ECON-01, GEN-ECON-03, GEN-ECON-07, GEN-ECON-09, GEN-ECON-10, GEN-ECON-11, GEN-ECON-12, GEN-ECON-13, GEN-ECON-14, GEN-ECON-15, GEN-ECON-16, GEN-ECON-17, GEN-ECON-21, GEN-ECON-23, GEN-ECON-24, MACRO-01, MACRO-03, MACRO-06, MACRO-07, MACRO-08, MACRO-13, MACRO-17, MACRO-20, MACRO-22, MACRO-28, MACRO-32, MACRO-35, MACRO-36, MACRO-38, MACRO-39, MACRO-40, MACRO-41, MACRO-42, MACRO-43, MACRO-44, MACRO-45, MACRO-46, MACRO-47, MACRO-48, MACRO-49, MACRO-50, MACRO-51, MACRO-52, MACRO-53, MACRO-54, MACRO-55, MACRO-56.

This clean group includes the dedicated saving/investment, loanable-funds, budget/debt, deposit-creation, output-gap, and exchange-rate sheets except the specific corrections identified above. Worked calculations for saving signs, debt ratios, currency conversion, real exchange rates, loanable-funds equilibria, and output gaps were coherent.

## Mapping Audit

The actual routing chain was traced as follows:

1. `build/faculty-build-composer/course-area-model.js`, `NAVIGATION_FAMILIES.macro`, supplies 79 distinct selectable IDs, including shared foundations/markets/trade concepts.
2. `data/composer_library.js` and `data/composer_registry.json` supply the canonical concept records. All selected IDs exist in the library.
3. `data/concept-reviews/concept_review_source.json` supplies authoring IDs/titles; `data/concept-reviews/manifest.json` supplies the active concept `reviewCodes` and review filenames.
4. `composer.js` fetches that manifest; `composer-core.js::resolveConceptReviews` resolves IDs, diagnostic evidence, and review assets into the embedded runtime index.
5. `concept-review-runtime.js` validates the embedded mapping and its approved public URLs. Composer-generated HTML uses `https://masteryquests.org/concept-reviews/<code>.pdf`.
6. Each public repository PDF was checked against its Composer counterpart and manifest SHA-256. All 83 pairs match after installation.

The final canonical mappings are below. Every row uses `REVIEW_SHEET`; the source mapping/configuration for every row is the source JSON plus active manifest in step 3, with selection from step 1. All referenced files exist.

| Concept | Canonical ID | Final resource | QA status |
|---|---|---|---|
| Scarcity and Tradeoffs | `scarcity-and-tradeoffs` | [GEN-ECON-01.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-01.pdf>) | Clean |
| Opportunity Cost | `opportunity-cost` | [GEN-ECON-03.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-03.pdf>) | Clean |
| Marginal Analysis | `marginal-analysis` | [GEN-ECON-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-04.pdf>) | Corrected |
| Incentives | `incentives` | [GEN-ECON-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-02.pdf>) | Corrected |
| Models and Assumptions | `models-and-assumptions` | [GEN-ECON-07.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-07.pdf>) | Clean |
| Microeconomics versus Macroeconomics | `micro-versus-macro` | [GEN-ECON-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-05.pdf>) | Corrected |
| Positive versus Normative Analysis | `positive-versus-normative-analysis` | [GEN-ECON-06.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-06.pdf>) | Corrected |
| Economists and Policy | `economist-policy-role` | [GEN-ECON-10.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-10.pdf>) | Clean |
| Production Possibilities Frontier | `production-possibilities-frontier` | [GEN-ECON-08.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-08.pdf>) | Corrected |
| Comparative Advantage and Gains from Trade | `gains-from-trade` | [GEN-ECON-09.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-09.pdf>) | Clean |
| Competitive Markets | `competitive-markets` | [GEN-ECON-11.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-11.pdf>) | Clean |
| Demand | `demand` | [GEN-ECON-12.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-12.pdf>), [GEN-ECON-13.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-13.pdf>) | Clean |
| Supply | `supply` | [GEN-ECON-14.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-14.pdf>), [GEN-ECON-15.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-15.pdf>) | Clean |
| Market Equilibrium | `market-equilibrium` | [GEN-ECON-16.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-16.pdf>), [GEN-ECON-17.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-17.pdf>), [GEN-ECON-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-18.pdf>) | Clean; Corrected |
| Price Ceilings | `binding-price-ceilings` | [GEN-ECON-19.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-19.pdf>) | Source hash corrected |
| Price Floors | `binding-price-floors` | [GEN-ECON-20.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-20.pdf>) | Source hash corrected |
| Statutory versus Economic Tax Incidence | `statutory-versus-economic-tax-incidence` | [GEN-ECON-21.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-21.pdf>) | Clean |
| Tax Incidence | `tax-incidence` | [GEN-ECON-22.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-22.pdf>) | Corrected |
| World Prices & Importer/Exporter Status | `trade-world-price-status` | [GEN-ECON-23.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-23.pdf>) | Clean |
| Tariffs, Revenue & Deadweight Loss | `tariffs-revenue-deadweight-loss` | [GEN-ECON-24.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-24.pdf>) | Clean |
| Import Quotas, Quota Rents & Tariffâ€“Quota Comparison | `import-quotas-quota-rents` | [GEN-ECON-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-25.pdf>) | Corrected |
| Trade-Policy Arguments, Efficiency & Distribution | `trade-policy-efficiency-distribution` | [GEN-ECON-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-26.pdf>) | Corrected |
| GDP Measurement | `gdp-measurement` | [MACRO-01.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-01.pdf>) | Clean |
| GDP Components | `gdp-components` | [MACRO-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-02.pdf>) | Corrected |
| Real versus Nominal GDP | `real-versus-nominal-gdp` | [MACRO-03.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-03.pdf>) | Clean |
| Limits of GDP | `limits-of-gdp` | [MACRO-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-04.pdf>) | Corrected |
| CPI and Inflation Measurement | `cpi-and-inflation-measurement` | [MACRO-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-05.pdf>) | Corrected |
| CPI Bias | `cpi-bias` | [MACRO-06.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-06.pdf>) | Clean |
| CPI versus GDP Deflator | `cpi-versus-gdp-deflator` | [MACRO-07.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-07.pdf>) | Clean |
| Indexing and Real Values | `indexing-and-real-values` | [MACRO-08.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-08.pdf>) | Clean |
| Real versus Nominal Interest Rates | `real-versus-nominal-interest-rates` | [MACRO-09.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-09.pdf>) | Corrected |
| Costs of Inflation | `inflation-costs` | [MACRO-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-26.pdf>) | Corrected |
| Living Standards and Growth | `living-standards-and-growth` | [MACRO-10.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-10.pdf>) | Corrected |
| Productivity Measurement | `productivity-measurement` | [MACRO-11.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-11.pdf>) | Corrected |
| Sources of Productivity | `sources-of-productivity` | [MACRO-12.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-12.pdf>) | Corrected |
| Economic Growth Policy | `economic-growth-policy` | [MACRO-13.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-13.pdf>) | Clean |
| Unemployment Measurement | `unemployment-measurement` | [MACRO-14.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-14.pdf>) | Corrected |
| Types of Unemployment | `unemployment-types` | [MACRO-15.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-15.pdf>) | Corrected |
| Labor-Market Institutions | `labor-market-institutions` | [MACRO-16.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-16.pdf>) | Corrected |
| Natural Rate of Unemployment | `natural-rate-of-unemployment` | [MACRO-17.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-17.pdf>) | Clean |
| Saving, Investment, and National-Saving Identities | `saving-and-investment-identities` | [MACRO-42.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-42.pdf>) | Clean |
| Loanable-Funds Equilibrium | `loanable-funds-equilibrium` | [MACRO-43.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-43.pdf>) | Clean |
| Loanable-Funds Shifts | `loanable-funds-shifts` | [MACRO-44.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-44.pdf>) | Clean |
| Crowding Out and Capital Formation | `crowding-out-and-capital-formation` | [MACRO-45.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-45.pdf>) | Clean |
| Budget Accounting and Public Saving | `budget-accounting-and-public-saving` | [MACRO-46.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-46.pdf>) | Clean |
| Deficits, Debt, and Government Borrowing | `deficits-debt-and-government-borrowing` | [MACRO-47.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-47.pdf>) | Clean |
| Debt Measures, Debt Burden, and Fiscal Data | `debt-measures-burden-and-fiscal-data` | [MACRO-48.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-48.pdf>) | Clean |
| Money Functions and Measures | `money-functions-and-measures` | [MACRO-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-18.pdf>) | Corrected |
| Central Banking and the Federal Reserve | `central-bank-and-federal-reserve` | [MACRO-19.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-19.pdf>) | Corrected |
| Bank Balance Sheets, Reserves, and Capital | `bank-balance-sheets-reserves-and-capital` | [MACRO-20.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-20.pdf>) | Clean |
| Deposit Creation and the Money Multiplier | `deposit-creation-and-money-multiplier` | [MACRO-49.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-49.pdf>) | Clean |
| Monetary-Policy Tools | `monetary-policy-tools` | [MACRO-21.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-21.pdf>) | Corrected |
| Limits of Monetary Control | `monetary-control-limits` | [MACRO-22.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-22.pdf>) | Clean |
| Quantity Theory of Money | `quantity-theory-of-money` | [MACRO-23.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-23.pdf>) | Graph decision pending |
| Monetary Neutrality | `monetary-neutrality` | [MACRO-24.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-24.pdf>) | Graph decision pending |
| Fisher Effect | `fisher-effect` | [MACRO-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-25.pdf>) | Corrected |
| Inflation Tax and Deflation | `inflation-tax-and-deflation` | [MACRO-27.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-27.pdf>) | Corrected |
| Aggregate Demand | `aggregate-demand` | [MACRO-33.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-33.pdf>) | Corrected |
| Short-Run Aggregate Supply | `short-run-aggregate-supply` | [MACRO-34.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-34.pdf>) | Corrected |
| Long-Run Aggregate Supply and Potential Output | `long-run-aggregate-supply-and-potential-output` | [MACRO-50.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-50.pdf>) | Clean |
| AD-AS Equilibrium and Output Gaps | `ad-as-equilibrium-and-output-gaps` | [MACRO-51.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-51.pdf>) | Clean |
| Demand and Supply Shocks | `demand-and-supply-shocks` | [MACRO-35.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-35.pdf>) | Clean |
| Long-Run Macroeconomic Self-Adjustment | `long-run-macroeconomic-self-adjustment` | [MACRO-36.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-36.pdf>) | Clean |
| Liquidity Preference and the Money Market | `liquidity-preference-and-money-market` | [MACRO-28.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-28.pdf>) | Clean |
| Monetary-Policy Transmission | `monetary-policy-transmission` | [MACRO-29.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-29.pdf>) | Corrected |
| Fiscal Policy and Aggregate Demand | `fiscal-policy-and-aggregate-demand` | [MACRO-30.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-30.pdf>) | Corrected |
| Fiscal Multipliers and Crowding Out | `fiscal-multipliers-and-crowding-out` | [MACRO-31.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-31.pdf>) | Corrected |
| Stabilization Policy | `stabilization-policy` | [MACRO-32.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-32.pdf>) | Clean |
| International Transactions and Open-Economy Identities | `international-transactions-and-identities` | [MACRO-52.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-52.pdf>) | Clean |
| Nominal Exchange Rates and Currency Values | `nominal-exchange-rates` | [MACRO-53.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-53.pdf>) | Clean |
| Real Exchange Rates and Purchasing Power | `real-exchange-rates-and-purchasing-power` | [MACRO-54.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-54.pdf>) | Clean |
| Capital Flows and Net Capital Outflow | `capital-flows-and-net-capital-outflow` | [MACRO-55.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-55.pdf>) | Clean |
| Foreign-Exchange Market Equilibrium | `foreign-exchange-market` | [MACRO-56.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-56.pdf>) | Clean |
| Open-Economy Policy and Macroeconomic Transmission | `open-economy-policy-transmission` | [MACRO-57.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-57.pdf>) | Corrected |
| Short-Run Phillips Curve | `short-run-phillips-curve` | [MACRO-37.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-37.pdf>) | Corrected |
| Long-Run Phillips Curve | `long-run-phillips-curve` | [MACRO-38.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-38.pdf>) | Clean |
| Phillips-Curve Expectations | `phillips-curve-expectations` | [MACRO-39.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-39.pdf>) | Clean |
| Disinflation and Policy | `disinflation-and-policy` | [MACRO-40.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-40.pdf>) | Clean |
| Sacrifice Ratio | `sacrifice-ratio` | [MACRO-41.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-41.pdf>) | Clean |

Unusual cases are intentional: `demand` maps to GEN-ECON-12/13, `supply` to GEN-ECON-14/15, and `market-equilibrium` to GEN-ECON-16/17/18. These explain why 22 shared concepts use 26 shared sheets. All 57 Macro-specific concepts have exactly one distinct dedicated MACRO PDF. There are no missing dedicated Macro sheets and no shared/neighboring Macro PDF assignments.

`integrated-macroeconomic-analysis` is an additional canonical **HIDDEN_SUPPLEMENTAL** record, not a selectable Macro concept. It deliberately has no dedicated sheet. The full-library builder retains four existing warnings concerning MICRO-03, general integration metadata, and Micro family-parent coverage; none is an active Macro-specific mapping error.

Inventory of inactive material: the source repository contains exactly 114 MACRO PDF files—57 public copies plus their 57 Composer copies—and no additional orphan MACRO PDFs. The working/audit workspace contains older 41-sheet output and install-stage sets under `output/pdf/concept-reviews/` (including final-library, final-editorial-library, final-pedagogy-spacing-library, and final-production-cleanup). Those are historical staging outputs, not files served by the traced Composer routing. They were left untouched. Chapter slide PDFs under built-in games are separate chapter resources, not substitutes in the dedicated Concept Review mapping; their slide-deck content is outside this sheet audit.

## Graph Audit

| Sheet(s) | Finding and action |
|---|---|
| MACRO-23, MACRO-24 | Shared linear value-of-money diagram gives a 33.3% price increase for a doubling of money. Its assumptions are not reconciled with the constant-velocity quantity-theory discussion. Kept unchanged pending the decision below. |
| MACRO-33 | Fixed wrong AD labels/direction, shift-versus-movement heading, and approximate 120-to-70 quantity reading. Existing correct curve geometry retained. |
| MACRO-34 | Changed exact-sounding 150/190 readings to rough estimates appropriate to the hand-drawn asset. |
| MACRO-37 | Removed nonexistent point B from recognition text. Point A at 5% unemployment and 2.5% inflation was verified. |
| MACRO-29, MACRO-30, MACRO-31 | Corrected descriptions of fixed-price AD comparisons so they do not claim to determine AD-AS equilibrium output. |
| MACRO-26 | Removed a reference to an absent graph; no unnecessary graph was added. |
| MACRO-57 | Distinguished the vertical NCO supply assumption from the preceding gross-flow FX supply model; retained both correct model diagrams. |
| GEN-ECON-22 | Removed text claiming buyers bear more when the visible example splits the tax equally. Graph and calculation retained. |
| Other graph instances | PPF, demand/supply, trade, productivity, money-market, AD-AS/LRAS, loanable-funds, and Phillips-curve labels and calculations passed. No graph asset file was replaced or edited. |

## Regression Check

- Complete selection-to-source-to-manifest-to-runtime check: **79 concepts / 83 required sheets, zero failures**.
- Public and Composer PDF existence/checksum checks: **83 of 83 matching pairs**.
- Full manifest builder: **151 library PDFs, zero hard failures**, unchanged canonical mappings.
- Existing `run_concept_review_integration.js`: **12 scenarios passed** after installation, including generated package/runtime integration.
- Existing `run_mastery_report_concept_reviews.js`: **26 cases passed** after installation.
- Revised-text extraction, title/ID checks, one-page checks, and page-boundary checks passed for all revised sheets; final rendered pages inspected.
- Repository diff matched exactly the 68 planned resource/metadata/generator edits before adding this report. `git diff --check` passed. No unrelated tracked changes were present at the initial source-repository check.

These checks establish the local repository state and the generated routing contract. No deployment was performed, and the currently deployed website/CDN copies were not byte-verified.

## Remaining Issues

### 1. Material: reconcile the quantity-theory illustration (MACRO-23 and MACRO-24)

The shared `moneys_moneyd.webp` asset labels money quantities 2,500 and 5,000 and values of money 2 and 1.5. The sheets correctly take reciprocals, giving price levels 0.50 and about 0.667. That is a 33.3% price rise with a 100% money increase. With **V and Y fixed**, `MV = PY` instead requires P to double (0.50 to 1.00); equivalently 1/P must halve (2 to 1). Holding Y fixed, the displayed numbers imply V falls by one-third. No such change is stated. The distinction between the graph label “value of money” and equation symbol V for velocity also needs to be explicit. The [OpenStax quantity-equation discussion](https://openstax.org/books/principles-economics-3e/pages/28-5-pitfalls-for-monetary-policy) supports the conditional proportionality check.

The graph can serve as a qualitative money-demand sketch if its quantitative limits and changing-velocity assumption are explained, or the resource-only illustration can be corrected to a constant-V/Y schedule. The shared image is also used by question banks, which this task expressly forbids changing. No validated alternative quantity-theory asset was found in the canonical graph directories. Choosing the instructional treatment requires editorial judgment, so neither PDF nor the shared asset was silently changed. The monotonic directions alone are not the defect; the unexplained numerical model assumptions are.

### 2. Nonblocking structural accessibility note: PDF tagging

All 83 reviewed PDFs lack a `/StructTreeRoot` tagged-document structure. They have selectable text and meaningful titles, and graph explanations provide surrounding context, but structured reading order and programmatically associated image alternatives are not established by those properties. Full tagging/remediation would require a separate structural pass; no accessibility redesign was undertaken.

## Files Changed

The following is the complete source-repository list: **64 existing PDF files** (32 sheets in two locations), **4 existing source/manifest/generator files**, and **1 new report**. Paths are relative to the source repository named at the start; each link resolves to the actual file.

- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-02.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-04.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-05.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-06.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-06.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-08.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-08.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-18.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-22.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-22.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-25.pdf>)
- [build/faculty-build-composer/data/concept-reviews/GEN-ECON-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/GEN-ECON-26.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-02.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-04.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-05.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-09.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-09.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-10.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-10.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-11.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-11.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-12.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-12.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-14.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-14.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-15.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-15.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-16.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-16.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-18.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-19.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-19.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-21.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-21.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-25.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-26.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-27.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-27.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-29.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-29.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-30.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-30.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-31.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-31.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-33.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-33.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-34.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-34.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-37.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-37.pdf>)
- [build/faculty-build-composer/data/concept-reviews/MACRO-57.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/MACRO-57.pdf>)
- [build/faculty-build-composer/data/concept-reviews/concept_review_integration_audit.json](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/concept_review_integration_audit.json>)
- [build/faculty-build-composer/data/concept-reviews/concept_review_source.json](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/concept_review_source.json>)
- [build/faculty-build-composer/data/concept-reviews/manifest.json](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/data/concept-reviews/manifest.json>)
- [build/faculty-build-composer/tools/complete_macro_concept_reviews.py](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer/tools/complete_macro_concept_reviews.py>)
- [concept-reviews/GEN-ECON-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-02.pdf>)
- [concept-reviews/GEN-ECON-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-04.pdf>)
- [concept-reviews/GEN-ECON-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-05.pdf>)
- [concept-reviews/GEN-ECON-06.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-06.pdf>)
- [concept-reviews/GEN-ECON-08.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-08.pdf>)
- [concept-reviews/GEN-ECON-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-18.pdf>)
- [concept-reviews/GEN-ECON-22.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-22.pdf>)
- [concept-reviews/GEN-ECON-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-25.pdf>)
- [concept-reviews/GEN-ECON-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/GEN-ECON-26.pdf>)
- [concept-reviews/MACRO-02.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-02.pdf>)
- [concept-reviews/MACRO-04.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-04.pdf>)
- [concept-reviews/MACRO-05.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-05.pdf>)
- [concept-reviews/MACRO-09.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-09.pdf>)
- [concept-reviews/MACRO-10.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-10.pdf>)
- [concept-reviews/MACRO-11.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-11.pdf>)
- [concept-reviews/MACRO-12.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-12.pdf>)
- [concept-reviews/MACRO-14.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-14.pdf>)
- [concept-reviews/MACRO-15.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-15.pdf>)
- [concept-reviews/MACRO-16.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-16.pdf>)
- [concept-reviews/MACRO-18.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-18.pdf>)
- [concept-reviews/MACRO-19.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-19.pdf>)
- [concept-reviews/MACRO-21.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-21.pdf>)
- [concept-reviews/MACRO-25.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-25.pdf>)
- [concept-reviews/MACRO-26.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-26.pdf>)
- [concept-reviews/MACRO-27.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-27.pdf>)
- [concept-reviews/MACRO-29.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-29.pdf>)
- [concept-reviews/MACRO-30.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-30.pdf>)
- [concept-reviews/MACRO-31.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-31.pdf>)
- [concept-reviews/MACRO-33.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-33.pdf>)
- [concept-reviews/MACRO-34.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-34.pdf>)
- [concept-reviews/MACRO-37.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-37.pdf>)
- [concept-reviews/MACRO-57.pdf](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/concept-reviews/MACRO-57.pdf>)
- [FINAL_REPORT.md](<C:/Users/Jennings/Documents/GitHub/masteryquests-website/FINAL_REPORT.md>)

A matching report is also saved at [the audit workspace FINAL_REPORT.md](<C:/Users/Jennings/Documents/Mastery Quests Website/FINAL_REPORT.md>). Temporary renderings, before/after text, correction records, installation hashes, backups, and test outputs are retained under the workspace `tmp/macro_resource_qa/`; they are audit working files, not active website resources.

## Final Verdict

**NEEDS FOLLOW-UP** — mappings are correct, 32 PDFs and four stale graph-hash records were corrected, and all regression checks pass. One material editorial decision remains for the two quantity-theory/neutrality illustrations. PDF tagging is a separate nonblocking structural note.
