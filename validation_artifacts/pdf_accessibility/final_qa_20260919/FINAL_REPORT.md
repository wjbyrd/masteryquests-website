# Final comprehensive concept-review QA and alignment report

Audit date: 2026-09-19. Baseline: `9bcbd50fde6e05f15d9ab255d2bac5f5b19db22f`. Scope: **GEN-ECON 26, MACRO 57, MICRO 68 — 151 sheets**.

## 1. Executive summary

All 151 active concept-review sheets were inspected and rebuilt in the established template. Both repository delivery locations now contain the same validated bytes: **151 Composer PDFs and 151 public PDFs**. All **151 pass independent veraPDF PDF/UA-1 validation**, the source/semantic/font/asset gate, and the installed-release gate. All **27 active Composer regression runners pass**. Nothing was deployed or committed by this pass.

Inspection covered every source record and its core, recognition, warning, worked example, check, outcome and difficulty; both PDF copies; all **75 instructional graphs/diagrams and 23 tables**; semantic metadata, manifests, release evidence, renderer, font coverage, runtime paths and existing early template references. MICRO-49's legacy graph flag describes a table; it is counted once among the 23 tables, not as a 76th graph.

**315 correction units** were completed: 178 edited instructional fields across **92 sheets**, 49 changed difficulty labels, 69 regenerated or repaired graph placements, and 19 explicitly flagged template restorations. These are reproducible work units, not a claim of 315 independent economic errors; one faculty finding can affect several fields. Existing sound/accessibly tagged material is recorded as verified, not falsely counted as a new correction. The other **59 sheets retain their instructional fields**. The measured instructional text declined from 33,425 to 31,807 whitespace-delimited words (4.8% shorter); local additions supply missing definitions, assumptions or scaffolding.

Changed paths are enumerated in [changed_files.json](changed_files.json) (1035 paths when this report was generated). Principal changes are the 302 PDFs, live source/semantics/manifest/releases, maintained review-graph assets, the canonical renderer's guarded final-pass path, Unicode font additions, build/economics checks, and this audit evidence. Historical question-bank assets and earlier audit snapshots were preserved. Econ-nections files were not changed.

## 2. Faculty audit corrections

All named items are accounted for below. A tagged, selectable PDF table is the practical semantic equivalent for this library's PDF delivery; replacing those tables with HTML inside the PDFs would not be a valid implementation.

| Sheet | Disposition |
| --- | --- |
| GEN-ECON-17 | Reconciled recognition, worked quantities, graph and alternative text: equilibrium $3/150 thousand gallons; at $2, demand 200 and supply 100; shortage 100. Opposite-price surplus also checked. |
| GEN-ECON-22 | Regenerated the tax-incidence diagram from its economic model at native display proportions, with legible line samples and economic alternative text. Beginner → Intermediate reflects two burdens plus elasticity interpretation. |
| MACRO-14 | Preserved the numeric schedule as a tagged PDF table with header associations and selectable cell text; verified employment classifications and rate denominators. |
| MACRO-15 | Removed repeated recession examples; retained three distinct unemployment definitions and recognition cues; normalized spacing. |
| MACRO-18 | Verified the tagged money schedule, cells and reading order. The current M1 definition includes savings deposits; the stated post-May-2020 convention is supported by the Federal Reserve. |
| MACRO-20 | Focused the outcome and check on a single bank's capital absorbing loan losses. Preserved its balance-sheet table. MACRO-49 covers system-wide deposit rounds; no duplicate deposit-expansion companion was added. |
| MACRO-21 | Preserved and retagged the policy-tool table, including the distinction between ample- and limited-reserves implementation. |
| MACRO-23 | Integrated an actual M × V = P × Y calculation and reciprocal 1/P interpretation. At fixed V=2 and Y=10,000, M=2,500 gives P=.50; M=5,000 gives P=1.00. No 23b: the current manifest/runtime architecture recognizes the established numeric IDs and 151-resource collection. |
| MACRO-24 | Consolidated neutrality, nominal/real definitions and the real-wage implication. Preserved the semantic table and exact cells. |
| MACRO-25 | Replaced overlapping cues with expected inflation, contract timing, and realized-return distinctions. |
| MACRO-26 | Added arbitrary redistribution, menu/shoeleather costs, relative-price confusion and conditional tax distortions in a concise paragraph. |
| MACRO-28 | Removed the repeated money-demand sentence from the core. Revised recognition into three distinct mechanisms and regenerated the money-market illustration. |
| MACRO-30 | Used price level 100, Y1=100 and Y2=150 consistently. Clarified that the graph shows output demanded at fixed P, not a supply-determined new equilibrium. |
| MACRO-31 | Consolidated multiplier and crowding-out explanations, defined MPC and stated assumptions; made recognition cues distinct. Preserved the multiplier illustration. |
| MACRO-33 | Separated movement along AD from shifts caused by independent spending changes within the existing sheet. An additional sheet would duplicate the same distinction and disrupt the fixed catalog. |
| MACRO-34 | Verified that the core already separates current-price movement from input-cost shifts. Retained that economics, defined SRAS and regenerated the supporting two-curve diagram; no unnecessary split. |
| MACRO-37 | Removed LRPC from both core and diagram. Focused recognition and warning on movement along SRPC versus changes in expectations/supply conditions. |
| MACRO-38 | Removed the redundant wrap-up and unexplained numeric recognition cues. Explained demand movement, expectations adjustment, and changes in the natural rate separately. |
| MACRO-41 | Preserved the tagged output-gap table and clarified percentage output gaps, cumulative losses and percentage-point inflation reduction. |
| MACRO-42 | Removed course-model language; defined Y, T, C, G, I, S, NCO and NX. Stated the simplified accounting assumptions behind NX=NCO. Preserved the semantic table. |
| MACRO-43 | Restored the canonical template; regenerated the loanable-funds diagram with readable axis labels and consistent A=(140,8). |
| MACRO-44 | Restored the canonical template and clear saving-supply-shift graph. |
| MACRO-45 | Restored the canonical template and graph. Rewrote the deficit → national saving → real rate → investment chain as complete, natural cues. |
| MACRO-46 | Restored the canonical template. Defined net taxes and purchases, distinguished the deficit from public saving, and explained why broader published outlays can differ. |
| MACRO-48 | Preserved the tagged table and exact data; removed the unnecessary 'at a Principles level' qualifier. |
| MACRO-49 | Preserved the semantic multiple-deposit table; defined rr. Kept its system-wide expansion focus distinct from MACRO-20's single-bank capital loss. |
| MACRO-50 | Restored canonical formatting and regenerated the productivity/LRAS/SRAS diagram; defined abbreviations and preserved A=(100,125), B=(115,110). |
| MACRO-51 | Restored canonical formatting and the adjustment graph; defined AD, SRAS and LRAS and distinguished short- and long-run equilibrium. |
| MACRO-52 | Preserved the semantic table, defined NCO and removed course-specific accounting language. Clarified the trade-deficit/negative-NCO relationship under stated assumptions. |
| MACRO-53 | Restored canonical formatting and generic quotation units. Added opposite 10% appreciation and depreciation scenarios, each measured from .90 euros per dollar. |
| MACRO-54 | Restored canonical formatting, actual ε and × glyphs, and accessible formula speech. Added real appreciation/depreciation cases, equivalent-basket definitions and the limits of ε=1 for index-based measures. |
| MACRO-56 | Restored canonical formatting; stated foreign currency per U.S. dollar and gross-flow supply/demand without course-specific language. Regenerated the A-to-B appreciation graph. |
| MACRO-57 | Removed the dependency on MACRO-56. Explained fixed price levels and vertical NCO supply directly, with the loanable-funds rate determined upstream. Graph, labels and alternative text agree. |
| MICRO-06 | Defined an inferior good as negative income elasticity and falling demand when income rises, holding prices fixed. |
| MICRO-07 | Converted the bare Y-price fact into a task distinguishing complements from substitutes using the response of X demand. |
| MICRO-09 | Combined elasticity 2.1 with its percentage interpretation; removed the standalone fact and made the check an explicit tax-incidence question. |
| MICRO-15 | Preserved the comparison schedule as a tagged PDF table with meaningful headers and exact values. |
| MICRO-17 | Added both bases (30−10 and 50−30) and the common height (50−30), showing 2 × (1/2 × 20 × 20)=$400. Regenerated and hatched the two triangles distinctly. |
| MICRO-20 | Preserved and retagged the production schedule, including row/column associations and exact values. |
| MICRO-21 | Preserved and retagged the cost schedule; verified arithmetic and exact cells. |
| MICRO-22 | Rendered AVC thick dashed, ATC dash-dot, MC solid and guides thin dotted. Defined AFC/AVC/ATC/MC and verified Q=400: ATC20, AVC12, AFC8. |
| MICRO-23 | Preserved and retagged the productivity/cost schedule with exact values. |
| MICRO-28 | Preserved and retagged the competitive-revenue schedule with exact values. |
| MICRO-32 | Uses the same regenerated economic graph as MICRO-31. The shutdown/supply interpretation remains correct; no inferior stretched duplicate is retained. |
| MICRO-33 | Removed assessment numbering and awkward parenthetical cues. Explained entry and exit naturally. Rebuilt the paired market/firm graph with complete labeled MC/ATC/AVC/price samples and a correct zero-profit equilibrium, shared with MICRO-35. |
| MICRO-34 | Removed learner/meta and 'Graph analysis 13' language. Defined the three industry-cost cases and aligned the check with constant-cost supply. |
| MICRO-37 | Corrected lowercase mr to MR in the warning and introduced the abbreviation in the core. Regenerated the clean monopoly diagram and checked the distinction between MR and demand. |
| MICRO-38 | Generalized the interior output rule, qualified it with shutdown, and used the cleaner MICRO-37 figure. The relevant condition is MR crossing MC from above. |
| MICRO-39 | Made (P - ATC) × Q explicit, including the previously overlooked Unicode-minus form. Checked quantity36, price42, ATC27 and profit540. |
| MICRO-40 | Regenerated the monopoly/competition graph without stretching; rewrote the warning to distinguish surplus transfer from deadweight loss. |
| MICRO-42 | Normalized WTP and defined willingness to pay; clarified the perfect-information limit of first-degree discrimination. |
| MICRO-44 | Regenerated correct demand/ATC tangency and MR/MC crossing; restored canonical formatting and consistent acronym use. The illustrative point is Q36/P27 with zero economic profit. |
| MICRO-45 | Regenerated the same mathematically consistent long-run model; distinguished zero profit, markup and excess capacity without implying efficiency. |
| MICRO-47 | Consolidated overlap and rewrote the check around the value-of-variety versus cost/markup tradeoff. |
| MICRO-48 | Simplified the example to concentration shares (70% for the largest two, 91% for A–D); explained the 9% 'Other' fringe. Removed the abrupt HHI calculation, which was not needed for this objective. |
| MICRO-49 | Preserved the current unique-equilibrium payoff matrix as a tagged table with player/strategy headers and selectable ordered payoffs. Verified the unique Nash outcome remains A,X with payoffs (9,9). |
| MICRO-50 | Preserved and retagged the payoff table; checked conditional comparisons and the conflict between individual incentives and cooperation. |
| MICRO-52 | Regenerated the kink, two MR branches, discontinuity and MC line at native proportions. Replaced the unsupported parallel-pricing check with a taught cost change inside the MR gap. |
| MICRO-54 | Restored the canonical template; introduced MSC, MPC, MSB and MPB where needed; regenerated the external-cost diagram and aligned private/social quantities. |
| MICRO-55 | Restored the canonical template, defined repeated acronyms, and rendered vertical benefit summation legibly. |
| MICRO-56 | Restored the canonical template and retained the established regulation concepts and example. |
| MICRO-58 | Regenerated the preference/budget diagram. Generalized the best-affordable-bundle statement, explicitly limiting tangency to a smooth interior optimum; unconditional tangency would be incorrect for corner solutions. |
| MICRO-59 | Restored canonical banner corners, icons, time/outcome strip, spacing and compact footer; rebuilt the Lorenz diagram and verified both Gini values. |
| MICRO-60 | Restored the same canonical banner, icons, typography, cards and compact footer. |
| MICRO-61 | Restored the same canonical banner, icons, typography, cards and compact footer. |
| MICRO-62 | Restored the same canonical banner, icons, typography, cards and compact footer. |
| MICRO-63 | Restored the same canonical banner, icons, typography, cards and compact footer. |
| MICRO-64 | Restored the same canonical banner, icons, typography, cards and compact footer. |
| MICRO-65 | Restored the same canonical banner, icons, typography, cards and compact footer; tightened framing to economically equivalent information. |
| MICRO-66 | Preserved and retagged the voting-preference table; verified pairwise comparisons and agenda dependence. |
| MICRO-67 | Preserved and retagged the social-choice criteria table; kept the task conceptual rather than requiring a proof. |

## 3. Additional issues found by the systematic review

- **Economic graph consistency:** GEN-ECON-21's rebuilt tax curves now pass through the existing worked values (100/$10.50 before; 60/$13.50 buyer/$7.50 seller after). MICRO-33's old illustration did not consistently put ATC at its claimed zero-profit price; the shared MICRO-35 model does. MICRO-44/45 now use cost functions whose marginal cost is the derivative of total cost, so demand/ATC tangency and MR=MC hold together at Q36. MICRO-59's Lorenz points produce the displayed Gini values .380 and .252. MACRO-12's production-function points match 28.53 and 36.37.
- **Unflagged rendering:** rebuilt additional demand, supply, PPF, trade, cost, welfare, externality, macro and exchange-rate figures whose labels became too small in old placements. The final graph review caught and repaired clipped paired-figure legends, crowded tick values and an overly long exchange-rate axis title. Main kinked-demand/MR branches now retain the same weight across their discontinuity.
- **Notation and definitions:** corrected an additional Unicode-minus profit expression in MICRO-39; defined repeated abbreviations in MACRO-19/32/36/49/50/51/52/55 and MICRO-4/22/28/29/30/32/35/42/44/54/55/57. Mathematical ε and × have real glyphs and Unicode mappings, plus spoken formula alternatives where tagged as Formula.
- **Scope and assumptions:** MACRO-29 specifies the limited-reserves model; MACRO-32 states multiplier assumptions; MACRO-41 separates percentages from percentage points; MACRO-42/46/52/55 state accounting conventions explicitly. MICRO-35 qualifies competitive efficiency, MICRO-38 uses the correct marginal-crossing condition, MICRO-58 allows corner solutions, and MICRO-65 requires equivalent information for framing.
- **Cognitive load:** removed overlapping cues in additional early and middle sheets; clarified GEN-ECON-08's point movement versus frontier shift; aligned MICRO-14 with consumer rather than unsupported total-surplus inference; removed an irrelevant tariff-revenue warning from MICRO-16's free-trade example; clarified MICRO-57's labor-market task. GEN-ECON-25 now supplies the quantities and rent calculation needed for its quota interpretation. Correct worked examples were otherwise retained.

The exact affected fields for every textual revision are recorded below and in [changes.json](changes.json). That JSON also records non-prose source changes such as difficulty and graph paths. [source_before.json](source_before.json) preserves the entire baseline for direct comparison.

| Sheet | Instructional fields revised |
| --- | --- |
| GEN-ECON-02 | recognition |
| GEN-ECON-05 | recognition |
| GEN-ECON-08 | recognition, watch |
| GEN-ECON-12 | watch |
| GEN-ECON-17 | recognition |
| GEN-ECON-25 | recognition, watch, worked |
| MACRO-03 | core |
| MACRO-04 | core, recognition |
| MACRO-06 | recognition |
| MACRO-08 | worked |
| MACRO-09 | recognition |
| MACRO-11 | core |
| MACRO-15 | core, recognition |
| MACRO-16 | recognition, watch |
| MACRO-19 | core, recognition |
| MACRO-20 | check, outcome |
| MACRO-22 | recognition |
| MACRO-23 | core, recognition, worked |
| MACRO-24 | core |
| MACRO-25 | recognition |
| MACRO-26 | core |
| MACRO-28 | core, recognition |
| MACRO-29 | core |
| MACRO-30 | core, recognition, worked |
| MACRO-31 | core, recognition |
| MACRO-32 | worked |
| MACRO-33 | recognition, watch |
| MACRO-34 | core |
| MACRO-36 | core |
| MACRO-37 | core, recognition, watch |
| MACRO-38 | core, recognition |
| MACRO-41 | core, recognition |
| MACRO-42 | core |
| MACRO-45 | core, recognition |
| MACRO-46 | core, watch |
| MACRO-48 | core |
| MACRO-49 | core |
| MACRO-50 | core, worked |
| MACRO-51 | core |
| MACRO-52 | core, watch |
| MACRO-53 | core, worked |
| MACRO-54 | core, recognition, watch, worked, check |
| MACRO-55 | core, watch |
| MACRO-56 | core |
| MACRO-57 | core, recognition, workedLabel |
| MICRO-01 | recognition |
| MICRO-03 | recognition |
| MICRO-04 | core, recognition, watch |
| MICRO-05 | core |
| MICRO-06 | core |
| MICRO-07 | recognition |
| MICRO-09 | core, recognition, check |
| MICRO-11 | core |
| MICRO-12 | check |
| MICRO-13 | recognition |
| MICRO-14 | recognition, workedLabel |
| MICRO-15 | check |
| MICRO-16 | core, recognition, watch |
| MICRO-17 | worked |
| MICRO-22 | core, recognition, watch |
| MICRO-24 | core, recognition |
| MICRO-25 | core, watch |
| MICRO-26 | core, recognition, check |
| MICRO-27 | core, check |
| MICRO-28 | core, worked |
| MICRO-29 | core, watch |
| MICRO-30 | core, recognition |
| MICRO-31 | watch |
| MICRO-32 | core |
| MICRO-33 | core, recognition, watch, worked |
| MICRO-34 | core, recognition, check |
| MICRO-35 | core, recognition, watch, check |
| MICRO-37 | core, watch |
| MICRO-38 | core, watch |
| MICRO-39 | core, recognition, watch |
| MICRO-40 | core, recognition, watch, workedLabel |
| MICRO-42 | core, watch |
| MICRO-43 | core, watch |
| MICRO-44 | core, recognition |
| MICRO-45 | core, watch |
| MICRO-47 | core, recognition, watch, check |
| MICRO-48 | core, worked, check |
| MICRO-49 | watch |
| MICRO-50 | core, recognition, watch |
| MICRO-51 | core |
| MICRO-52 | core, recognition, worked, check, workedLabel |
| MICRO-53 | core, watch, worked, check |
| MICRO-54 | core |
| MICRO-55 | core |
| MICRO-57 | core, recognition, workedLabel |
| MICRO-58 | core, recognition, watch |
| MICRO-65 | core, recognition |

## 4. Complete graph audit

**75 graphs/diagrams inspected; 69 regenerated or repaired placements, 6 sound assets retained.** MICRO-32 shares MICRO-31's clean graph; MICRO-38 shares MICRO-37's; MICRO-33 shares the zero-profit paired recipe with MICRO-35; MACRO-40 shares MACRO-39's clear symbolic diagram. Shared figures count as separate placements, not unique designs.

Poor source/render combinations were regenerated from explicit curve coordinates or economic functions. Native Matplotlib plots are exported at 216 dpi and placed proportionally at 320 points wide (or approximately 479.57 points for paired panels); graph text is 8.8 points at the native intended size. The layout gate rejects reduction below 8.5 points and rejects non-proportional dimensions for these rebuilt plots. Axis titles, ticks, legend samples, model intersections and economically meaningful shading were reviewed. Main curves use labels plus differing line styles where practical; welfare regions use hatching. No browser alt-text overlay was reproduced as graph content. There were no concept-sheet HTML/CSS graph containers to fix: the defects were in PDF graph generation/placement.

Every graph's active PNG path, decoded hash and alternative text are bound to its sheet's source/semantics. Regenerated model recipes are retained alongside the assets or in `final_qa_graphs.py` for shared/paired models. Existing question-bank illustrations were not overwritten. [layouts.json](layouts.json) records final placements; [validation/rendered_after](validation/rendered_after) contains every final page render.

| Sheet | Graph disposition | Alignment checked |
| --- | --- | --- |
| GEN-ECON-08 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-12 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-13 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-14 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-15 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-16 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-17 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-18 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-19 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-20 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-21 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-22 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-23 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-24 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| GEN-ECON-25 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-02 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-04 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-05 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-08 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-10 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-11 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-12 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-13 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-14 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-16 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-17 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-22 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-24 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-26 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-27 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-29 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-30 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-31 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-32 | Shared clean graph from MICRO-31 | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-33 | Shared clean graph from MICRO-35 | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-34 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-35 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-37 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-38 | Shared clean graph from MICRO-37 | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-39 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-40 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-41 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-44 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-45 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-48 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-51 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-52 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-12 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-16 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-23 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-28 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-29 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-30 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-31 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-33 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-34 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-35 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-36 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-37 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-38 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-39 | Retained sound source asset | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-40 | Shared clean graph from MACRO-39 | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-54 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-55 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-57 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-58 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-59 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MICRO-68 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-43 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-44 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-45 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-50 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-51 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-56 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |
| MACRO-57 | Regenerated from explicit model | Axes/curves, worked values, alternative text, proportions and final-page legibility |

## 5. Accessibility audit

- **Semantic HTML tables created: 0.** These resources are downloadable single-page PDFs, not HTML worksheets. **All 23 tables use real PDF Table/TR/TH/TD structure**, row/column header associations and selectable cell text; they are not left as unexplained image-only tables. The visible table artwork is accompanied by semantically ordered text, with duplicate decorative artwork excluded from the reading sequence. Every prior table cell was preserved exactly.
- Tables checked: GEN-ECON-09, MICRO-15, MICRO-20, MICRO-21, MICRO-23, MICRO-28, MICRO-49, MICRO-50, MACRO-03, MACRO-05, MACRO-07, MACRO-14, MACRO-18, MACRO-20, MACRO-21, MACRO-24, MACRO-41, MICRO-66, MICRO-67, MACRO-42, MACRO-48, MACRO-49, MACRO-52.
- **75 meaningful graph/diagram alternatives** checked; regenerated alternatives describe units, relationships and the worked result rather than merely naming an image. Retained alternatives were checked against their figures. The semantic tree exposes the instructional Figure and excludes decorative icons/banner/footer artwork as artifacts.
- MICRO-49's matrix retains both players' strategies and ordered payoffs; the unique Nash result A,X=(9,9) is unchanged. Other game/voting tables retain their exact cells and headers.
- All 151 documents have real structure, document language, headings, paragraph/list order, Unicode text, embedded fonts and source-bound semantic evidence. Formula speech covers notation that would be unclear as unpronounceable glyph sequences. ε and × were checked in extraction, font coverage and visible renders.
- Canonical colors/contrast were retained. Line styles, labeling and hatching supplement color in the rebuilt plots. Every page was rendered and visually reviewed; programmatic layout and reading-sequence checks supplement that review.
- **No human screen-reader or keyboard session was performed.** Independent PDF/UA validation and structural/visual review are strong evidence, but do not substitute for user testing with a particular assistive-technology/viewer combination. This limitation is recorded in the review receipt rather than represented as a completed AT test.

## 6. Difficulty-level audit — all 151 sheets

The existing dominant vocabulary is Beginner / Intermediate / Advanced; two legacy Foundational values were normalized to Beginner. The levels are based on the work demanded by the sheet, including the worked example and check: Beginner is direct recognition or a simple operation; Intermediate involves a structured application or linked distinction; Advanced integrates mechanisms, competing effects, multi-stage welfare or strategic reasoning. Levels are not quotas or topic rankings. Final distribution: {'Beginner': 19, 'Intermediate': 110, 'Advanced': 22}. GEN-ECON-22's applied burden interpretation is Intermediate; MICRO-36's barrier recognition is Beginner.

| Sheet ID | Original Difficulty | Final Difficulty | Changed? | Rationale |
| --- | --- | --- | --- | --- |
| GEN-ECON-01 | Beginner | Beginner | No | Identify a scarce resource and the resulting choice. |
| GEN-ECON-02 | Beginner | Beginner | No | Recognize the behavior encouraged by a changed incentive. |
| GEN-ECON-03 | Beginner | Beginner | No | Identify the next-best forgone alternative. |
| GEN-ECON-04 | Beginner | Beginner | No | Compare one marginal benefit with one marginal cost. |
| GEN-ECON-05 | Beginner | Beginner | No | Classify a question by individual-market or economy-wide scope. |
| GEN-ECON-06 | Beginner | Beginner | No | Distinguish a testable claim from a value judgment. |
| GEN-ECON-07 | Beginner | Beginner | No | Recognize why a simplifying assumption is used. |
| GEN-ECON-08 | Beginner | Intermediate | Yes | Read frontier points, calculate opportunity cost, and distinguish efficiency from attainability. |
| GEN-ECON-09 | Beginner | Intermediate | Yes | Compute relative opportunity costs and identify mutually beneficial trade terms. |
| GEN-ECON-10 | Beginner | Intermediate | Yes | Separate evidence, assumptions, and values in a policy recommendation. |
| GEN-ECON-11 | Beginner | Intermediate | Yes | Apply price-taking conditions and assess how changed competition affects them. |
| GEN-ECON-12 | Beginner | Intermediate | Yes | Read a demand curve and distinguish own-price movement from a demand shift. |
| GEN-ECON-13 | Beginner | Intermediate | Yes | Identify a non-price determinant and infer a demand shift. |
| GEN-ECON-14 | Beginner | Intermediate | Yes | Read a supply curve and distinguish own-price movement from a supply shift. |
| GEN-ECON-15 | Beginner | Intermediate | Yes | Identify a cost determinant and infer the supply response. |
| GEN-ECON-16 | Beginner | Intermediate | Yes | Locate equilibrium and explain adjustment away from it. |
| GEN-ECON-17 | Beginner | Intermediate | Yes | Read two quantities at one price, calculate the imbalance, and infer adjustment. |
| GEN-ECON-18 | Beginner | Intermediate | Yes | Combine two shifts and identify the outcome that depends on relative magnitudes. |
| GEN-ECON-19 | Beginner | Intermediate | Yes | Test whether a ceiling binds, then infer quantities and shortage. |
| GEN-ECON-20 | Beginner | Intermediate | Yes | Test whether a floor binds, then infer quantities and surplus. |
| GEN-ECON-21 | Beginner | Intermediate | Yes | Distinguish statutory liability from the division of a tax wedge. |
| GEN-ECON-22 | Beginner | Intermediate | Yes | Calculate buyer and seller burdens and relate their division to elasticity. |
| GEN-ECON-23 | Beginner | Intermediate | Yes | Compare world and domestic prices and calculate trade quantities. |
| GEN-ECON-24 | Beginner | Advanced | Yes | Combine tariff effects on price, quantities, revenue, and surplus. |
| GEN-ECON-25 | Beginner | Advanced | Yes | Combine quota quantities with rent allocation and national-welfare effects. |
| GEN-ECON-26 | Beginner | Advanced | Yes | Weigh distributional effects and policy claims against aggregate gains. |
| MACRO-01 | Intermediate | Intermediate | No | Apply the production boundary and avoid double counting. |
| MACRO-02 | Intermediate | Intermediate | No | Classify expenditures while accounting for imports and inventories. |
| MACRO-03 | Intermediate | Intermediate | No | Calculate nominal and constant-price output from a price-and-quantity schedule. |
| MACRO-04 | Intermediate | Beginner | Yes | Recognize why measured output is not a complete welfare measure. |
| MACRO-05 | Intermediate | Intermediate | No | Price a fixed basket and calculate an index and inflation rate. |
| MACRO-06 | Intermediate | Intermediate | No | Distinguish substitution, new-goods, and quality-measurement biases. |
| MACRO-07 | Intermediate | Intermediate | No | Compare coverage and weighting of two price indexes. |
| MACRO-08 | Intermediate | Intermediate | No | Use an index ratio to preserve purchasing power. |
| MACRO-09 | Intermediate | Intermediate | No | Separate nominal, expected real, and realized real returns. |
| MACRO-10 | Intermediate | Intermediate | No | Distinguish aggregate growth from real output per person. |
| MACRO-11 | Intermediate | Beginner | Yes | Calculate output per hour using one ratio. |
| MACRO-12 | Intermediate | Intermediate | No | Distinguish capital deepening from technology and diminishing returns. |
| MACRO-13 | Intermediate | Intermediate | No | Connect a growth policy to productivity while considering its costs. |
| MACRO-14 | Intermediate | Intermediate | No | Classify labor-force status and calculate two differently denominated rates. |
| MACRO-15 | Intermediate | Beginner | Yes | Classify the cause of unemployment using three explicit definitions. |
| MACRO-16 | Intermediate | Intermediate | No | Connect institutions to incentives, wages, and labor-market quantities. |
| MACRO-17 | Intermediate | Intermediate | No | Separate cyclical from natural unemployment and assess structural changes. |
| MACRO-18 | Intermediate | Intermediate | No | Distinguish functions of money and classify assets using stated monetary definitions. |
| MACRO-19 | Intermediate | Beginner | Yes | Identify central-bank functions and distinguish the Treasury and commercial banks. |
| MACRO-20 | Intermediate | Intermediate | No | Apply the balance-sheet identity and trace a loss through capital and reserves. |
| MACRO-21 | Intermediate | Intermediate | No | Distinguish immediate tool effects from transmission in different reserve regimes. |
| MACRO-22 | Intermediate | Intermediate | No | Trace reserve holding and currency drain through deposit expansion. |
| MACRO-23 | Intermediate | Intermediate | No | Solve the quantity equation under stated assumptions and invert the price level. |
| MACRO-24 | Intermediate | Intermediate | No | Compare nominal changes with unchanged real purchasing power. |
| MACRO-25 | Intermediate | Intermediate | No | Separate expected inflation from realized inflation and calculate the nominal rate. |
| MACRO-26 | Intermediate | Intermediate | No | Compute realized returns and classify distributional and resource costs. |
| MACRO-27 | Intermediate | Intermediate | No | Calculate purchasing-power changes and distinguish deflation from disinflation. |
| MACRO-28 | Intermediate | Intermediate | No | Identify money-market equilibrium, shifts, and interest-rate adjustment. |
| MACRO-29 | Intermediate | Advanced | Yes | Trace reserve changes through interest rates, spending, and aggregate demand across panels. |
| MACRO-30 | Intermediate | Intermediate | No | Connect fiscal action to spending and a fixed-price demand shift. |
| MACRO-31 | Intermediate | Advanced | Yes | Combine multiplier rounds, tax timing, crowding out, and equilibrium qualifications. |
| MACRO-32 | Intermediate | Advanced | Yes | Evaluate policy timing and a supply-shock stabilization tradeoff. |
| MACRO-33 | Intermediate | Intermediate | No | Separate price-level movements from independent spending shifts. |
| MACRO-34 | Intermediate | Intermediate | No | Separate a current-price movement from input-cost or expectation shifts. |
| MACRO-35 | Intermediate | Intermediate | No | Compare demand and supply shocks using output and price responses. |
| MACRO-36 | Intermediate | Advanced | Yes | Trace an output gap through wage adjustment and the return to potential. |
| MACRO-37 | Intermediate | Intermediate | No | Map a demand change to movement along a curve with expectations fixed. |
| MACRO-38 | Intermediate | Advanced | Yes | Trace the short-run expansion, expectations shift, and return to natural unemployment. |
| MACRO-39 | Intermediate | Intermediate | No | Distinguish an expectations shift from movement along the short-run curve. |
| MACRO-40 | Intermediate | Advanced | Yes | Trace disinflation through temporary unemployment and expectations adjustment. |
| MACRO-41 | Intermediate | Intermediate | No | Convert annual losses to gaps, sum them, and divide by an inflation change. |
| MACRO-42 | Intermediate | Intermediate | No | Calculate private and public saving and reconcile closed/open-economy identities. |
| MACRO-43 | Intermediate | Intermediate | No | Read equilibrium and distinguish excess planned saving from excess investment. |
| MACRO-44 | Intermediate | Intermediate | No | Identify a saving or investment shift and trace interest-rate and quantity effects. |
| MACRO-45 | Intermediate | Advanced | Yes | Trace deficits through national saving, interest rates, investment, and capital formation. |
| MACRO-46 | Foundational | Beginner | Yes | Subtract stated net taxes and purchases and interpret the sign. |
| MACRO-47 | Intermediate | Intermediate | No | Reconcile annual budget flows with an accumulated debt stock. |
| MACRO-48 | Intermediate | Intermediate | No | Compare levels with ratios and avoid treating one ratio as a sustainability verdict. |
| MACRO-49 | Intermediate | Intermediate | No | Trace repeated deposit rounds and calculate the multiplier under explicit restrictions. |
| MACRO-50 | Intermediate | Intermediate | No | Distinguish productive-capacity shifts from temporary changes in actual output. |
| MACRO-51 | Intermediate | Advanced | Yes | Trace demand expansion and subsequent supply adjustment across three equilibria. |
| MACRO-52 | Intermediate | Intermediate | No | Classify trade and asset transactions and reconcile saving/investment identities. |
| MACRO-53 | Intermediate | Intermediate | No | Convert currencies and calculate appreciation and depreciation with explicit units. |
| MACRO-54 | Intermediate | Intermediate | No | Combine exchange quotations with basket prices and interpret real currency changes. |
| MACRO-55 | Intermediate | Intermediate | No | Calculate net capital outflow and infer the response to relative returns. |
| MACRO-56 | Intermediate | Intermediate | No | Read currency-market shifts using the stated exchange-rate quotation. |
| MACRO-57 | Advanced | Advanced | No | Trace policy or capital flight through saving, rates, capital flows, currency, and net exports. |
| MICRO-01 | Intermediate | Intermediate | No | Connect a changed price signal to the allocation of scarce resources. |
| MICRO-02 | Intermediate | Intermediate | No | Read buyer/seller prices, calculate a tax wedge, and calculate revenue. |
| MICRO-03 | Intermediate | Intermediate | No | Compare private and social margins and calculate the surplus effect of an externality. |
| MICRO-04 | Intermediate | Intermediate | No | Calculate midpoint percentage changes and interpret price elasticity. |
| MICRO-05 | Intermediate | Intermediate | No | Compare short-run and long-run supply responsiveness using proportional changes. |
| MICRO-06 | Intermediate | Intermediate | No | Calculate an income elasticity and classify normal/inferior and luxury/necessity goods. |
| MICRO-07 | Intermediate | Intermediate | No | Calculate cross-price elasticity and interpret its sign with the other good's price. |
| MICRO-08 | Intermediate | Intermediate | No | Combine price and quantity changes to infer revenue and elasticity. |
| MICRO-09 | Intermediate | Intermediate | No | Apply responsiveness to revenue and tax-burden comparisons. |
| MICRO-10 | Intermediate | Intermediate | No | Read willingness to pay and calculate consumer surplus. |
| MICRO-11 | Intermediate | Intermediate | No | Read willingness to accept and calculate producer surplus. |
| MICRO-12 | Intermediate | Intermediate | No | Combine buyer and seller gains and distinguish transfers from total surplus. |
| MICRO-13 | Intermediate | Intermediate | No | Compare marginal benefit and cost to identify efficient quantity. |
| MICRO-14 | Intermediate | Intermediate | No | Calculate and compare surplus before and after a price change. |
| MICRO-15 | Intermediate | Intermediate | No | Compare total surplus and its distribution without equating efficiency with equity. |
| MICRO-16 | Intermediate | Intermediate | No | Read domestic production and consumption and calculate imports or exports. |
| MICRO-17 | Intermediate | Advanced | Yes | Compare autarky with trade and calculate two welfare triangles and distributional effects. |
| MICRO-18 | Intermediate | Intermediate | No | Separate explicit expenditure from forgone opportunity costs. |
| MICRO-19 | Intermediate | Intermediate | No | Calculate accounting and economic profit and interpret a normal return. |
| MICRO-20 | Intermediate | Intermediate | No | Calculate marginal product from a schedule and identify diminishing returns. |
| MICRO-21 | Intermediate | Intermediate | No | Reconstruct fixed, variable, total, average, and marginal costs from a schedule. |
| MICRO-22 | Intermediate | Intermediate | No | Relate three average costs to marginal cost and identify the fixed-cost gap. |
| MICRO-23 | Intermediate | Intermediate | No | Link changes in productivity with marginal cost using schedule differences. |
| MICRO-24 | Intermediate | Intermediate | No | Distinguish fixed-cost shifts from variable-cost and marginal-cost changes. |
| MICRO-25 | Intermediate | Beginner | Yes | Exclude an unrecoverable payment when comparing remaining alternatives. |
| MICRO-26 | Intermediate | Intermediate | No | Interpret scale economies and diseconomies along long-run average cost. |
| MICRO-27 | Intermediate | Intermediate | No | Identify the start of a minimum-cost range and distinguish it from the entire flat range. |
| MICRO-28 | Intermediate | Intermediate | No | Relate a price-taking firm's price to average and marginal revenue. |
| MICRO-29 | Intermediate | Intermediate | No | Find the relevant marginal crossing and check the operating condition. |
| MICRO-30 | Intermediate | Intermediate | No | Separate output choice from per-unit profit and calculate total profit or loss. |
| MICRO-31 | Intermediate | Intermediate | No | Compare price with variable and total costs to choose operation or shutdown. |
| MICRO-32 | Intermediate | Intermediate | No | Identify the supply segment and distinguish fixed from variable cost shifts. |
| MICRO-33 | Intermediate | Advanced | Yes | Trace profit incentives through market entry, price adjustment, and firm equilibrium. |
| MICRO-34 | Intermediate | Intermediate | No | Distinguish three industry cost conditions and their long-run supply implications. |
| MICRO-35 | Intermediate | Advanced | Yes | Connect firm and market outcomes to two efficiency concepts and model limits. |
| MICRO-36 | Intermediate | Beginner | Yes | Recognize a barrier to entry and a source of monopoly power. |
| MICRO-37 | Intermediate | Intermediate | No | Distinguish demand from marginal revenue when a price cut applies to all units. |
| MICRO-38 | Intermediate | Intermediate | No | Choose quantity at the marginal crossing and read monopoly price from demand. |
| MICRO-39 | Intermediate | Intermediate | No | Combine monopoly output choice, average cost, profit, and shutdown conditions. |
| MICRO-40 | Intermediate | Advanced | Yes | Compare monopoly and competitive quantities and separate transfers from deadweight loss. |
| MICRO-41 | Intermediate | Advanced | Yes | Weigh efficient pricing, cost recovery, and subsidy incentives for a natural monopoly. |
| MICRO-42 | Intermediate | Intermediate | No | Distinguish price discrimination from cost differences and its perfect-information limit. |
| MICRO-43 | Intermediate | Beginner | Yes | Recognize differentiated products and the resulting downward-sloping firm demand. |
| MICRO-44 | Intermediate | Intermediate | No | Apply quantity choice, demand pricing, profit, and the shutdown comparison. |
| MICRO-45 | Intermediate | Advanced | Yes | Trace entry to tangency while distinguishing zero profit, markup, and excess capacity. |
| MICRO-46 | Intermediate | Intermediate | No | Distinguish informational and persuasive effects of nonprice competition. |
| MICRO-47 | Intermediate | Advanced | Yes | Weigh consumers' value of variety against unit cost and markup effects. |
| MICRO-48 | Intermediate | Intermediate | No | Calculate concentration shares and explain strategic interdependence and fringe aggregation. |
| MICRO-49 | Intermediate | Intermediate | No | Compare payoffs conditional on each rival action to find dominant strategies and equilibrium. |
| MICRO-50 | Intermediate | Intermediate | No | Identify dominant undercutting and explain why cooperation is jointly better but unstable. |
| MICRO-51 | Advanced | Advanced | No | Use backward induction and credible responses to predict sequential entry decisions. |
| MICRO-52 | Intermediate | Intermediate | No | Connect rival responses to a kink and test a cost change within the marginal-revenue gap. |
| MICRO-53 | Intermediate | Advanced | Yes | Weigh merger rivalry, efficiency, entry, and consumer effects without a single-statistic verdict. |
| MICRO-54 | Intermediate | Intermediate | No | Separate private from social margins and infer overproduction or underproduction. |
| MICRO-55 | Intermediate | Intermediate | No | Classify rivalry/excludability and vertically sum benefits for efficient provision. |
| MICRO-56 | Foundational | Intermediate | Yes | Connect market power to output restrictions and evaluate a regulatory response. |
| MICRO-57 | Intermediate | Intermediate | No | Link marginal product, product price, labor demand, and the wage-taking hiring rule. |
| MICRO-58 | Intermediate | Intermediate | No | Compare affordability and preferences and recognize the scope of an interior tangency. |
| MICRO-59 | Intermediate | Intermediate | No | Read cumulative shares and compare inequality measures before and after transfers. |
| MICRO-60 | Intermediate | Intermediate | No | Trace hidden risk before contracting into selection and changes in the insurance pool. |
| MICRO-61 | Intermediate | Beginner | Yes | Identify changed incentives and hidden action after a contract. |
| MICRO-62 | Intermediate | Intermediate | No | Distinguish informed-party signaling from uninformed-party screening and credibility. |
| MICRO-63 | Intermediate | Intermediate | No | Distinguish preference reversal from ordinary discounting and evaluate a commitment device. |
| MICRO-64 | Intermediate | Beginner | Yes | Recognize asymmetric reactions to equivalent gains and losses. |
| MICRO-65 | Intermediate | Beginner | Yes | Recognize changed choices under equivalent presentations. |
| MICRO-66 | Intermediate | Advanced | Yes | Aggregate three pairwise comparisons into a cycle and infer agenda dependence. |
| MICRO-67 | Intermediate | Beginner | Yes | Identify which unrestricted collective-choice guarantees cannot all be met; no proof is required. |
| MICRO-68 | Intermediate | Intermediate | No | Locate the median and test majority coalitions under single-peaked one-dimensional preferences. |

## 7. Formatting alignment

Canonical references were the clean early GEN-ECON-01, MACRO-01 and MICRO-03 sheets, with GEN-ECON-01 as the renderer reference. The restored design retains the navy hero, established rounded top treatment, title typography, time/hourglass and outcome/target icons, difficulty dots, teal section rules, section icons, rounded cards and compact footer. It does not introduce a new visual identity. The actual established reading order is Core Idea → How to Recognize It → Watch Out → Worked Example → Check Yourself.

Explicit faculty template restorations: **MACRO-43, MACRO-44, MACRO-45, MACRO-46, MACRO-50, MACRO-51, MACRO-53, MACRO-54, MACRO-56, MICRO-54, MICRO-55, MICRO-56, MICRO-59, MICRO-60, MICRO-61, MICRO-62, MICRO-63, MICRO-64, MICRO-65**. All other sheets were checked and rendered using the same component family; MICRO-44/45 also received consistent canonical treatment. MICRO-59–65 now use the same icons, hero corners, spacing and footer as the early sheets.

Body text remains 10.45 points on 129 sheets, with controlled fitting on the remainder and a 9.5-point floor. Tables retain a 9.5-point floor. Slightly tighter internal title/body gaps support the one-page design; graph geometry is never stretched. All 151 final outputs remain one Letter-size page. The extra DIAGNOSE cards on MICRO-56/60–65 repeated concepts already taught in the canonical sections, so they were removed. The extra KEY RELATIONSHIPS cards on MACRO-46/53 repeated accounting and conversion rules retained in the main sections. MACRO-54's old card also included an approximate percentage-growth decomposition; that optional extension was deliberately omitted to keep the sheet focused on the level equation, basket comparison and opposite-direction applications requested by faculty. Its directional implications remain in recognition, and no current check requires that approximation. These are explicit scope/template choices, not silent deletions after a fit failure. No table cells or required instructional source fields were dropped to make a page fit.

## 8. Pedagogical and editorial alignment

The faculty table and field inventory document the specific edits. Redundancy was removed selectively rather than by a generic rewrite. Numeric recognition cues now require interpretation; checks use concepts taught by the sheet. Added prose supplies missing triangle dimensions, equation assumptions, acronym definitions, quotation units or the opposite direction of a change. MACRO-20/49 remain complementary, and MACRO-23 includes application without adding a catalog entry. Simplified open-economy relationships state their assumptions instead of invoking an unnamed course model.

All active source fields and extracted PDF text were scanned for course-specific/internal authoring debris, including 'this course', 'course model', 'course convention', 'course graphs', 'A learner', 'Graph analysis' and assessment numbering. The recursive directory scan found four source-file paths: three historical production snapshots, plus one non-rendered MACRO-55 instructionalEvidence.observedMisconceptions entry in the live source. The active rendered content and graph alternatives contain no such strings. See directory_language_scan.json and student_language_scan.json. Earlier immutable authoring/audit snapshots can still contain old strings; they are historical inputs, not active student content. Their preservation supports provenance and does not reintroduce those strings into delivered PDFs.

Institutional details checked against primary sources: employment status and the four-week search/temporary-layoff rules follow [BLS definitions](https://www.bls.gov/cps/definitions.htm); the May-2020 savings-deposit reclassification follows [Federal Reserve H.6 technical notes](https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm); ample-reserves implementation follows the [Federal Reserve's implementation explanation](https://www.federalreserve.gov/econres/notes/feds-notes/implementing-monetary-policy-in-an-ample-reserves-regime-the-basics-note-1-of-3-20200701.html). These checks supported retaining correct current material rather than inventing changes.

## 9. Validation results and reproducibility

| Check | Result | Evidence |
| --- | --- | --- |
| Catalog count, distinct IDs and collection partitions | 151; 26/57/68; no new or duplicate IDs | tests.log; source and manifest |
| Independent PDF/UA-1, ISO 14289-1:2014 | 151/151 PASS, veraPDF 1.28.2 | validation/verapdf.json; final_recheck/verapdf.json; symbolic_recheck/verapdf.json; validation/validation.json |
| Source text, semantic reading order, formulas, fonts, graph identity | 151/151 PASS; no project errors | validation/transcripts/ |
| One-page dimensions, content regions and placement | 151/151 PASS | layouts.json; validation/validation.json |
| Final page renders and graph review | All 151 pages and 75 graphics reviewed, including repaired versions | review.json; validation/rendered_after/ |
| Economics and negative guard tests | 13/13 PASS | tests.log |
| Installed copies and evidence binding | 151/151 PASS; 302 synchronized PDFs | active_gate.json; installation.json |
| Local public routing/assets and unsafe-path rejection | 151/151 PASS | routing.json |
| Active Composer regression runners | 27/27 PASS | regression/results.json and individual logs |

No broken local PDF routes, missing active images, duplicate IDs, missing graph associations, overflowing document regions, missing required alternatives, or unresolved PDF/UA failures were found in the final outputs. No HTML worksheet files were changed. Existing Composer web behavior is covered by its active regression suite. These fixed-page PDFs preserve their proportions under viewer zoom; this audit does **not** claim that Letter-size PDFs reflow like responsive HTML. No live-site deployment or network link crawl was performed.

The install was transactional and required exact candidate hashes, current source/semantic hashes, the independent report and a byte-bound visual/semantic review receipt before either copy was replaced. The release field `contentPreservationPassed` means that content matches the explicitly authorized final-pass changes and preserved tables; it does not claim every word is unchanged from the old PDFs. The aggregate validation file references the original full-batch report plus targeted final rechecks for changed candidates; each installed release points to its own exact report and hash. A rationale-only metadata correction for MACRO-03 was followed by a fresh semantic inspection of all 151 unchanged candidate bytes (rationale_metadata_refresh.json). The raw validation records' PENDING review placeholders are superseded by the hash-bound `review.json` receipt referenced by installed release evidence; assistive-technology testing remains not performed.

Rebuild from the repository root with the existing bundled Python, Pillow, ReportLab, pypdf and NumPy, plus **matplotlib 3.11.2 and fonttools 4.65.0**. `final_qa_build.py` restores immutable baseline inputs from the commit named above if scratch inputs are absent, applies explicit guarded edits, regenerates assets, writes staged PDFs and validates source/layout/tag coverage. `final_qa_fonts.py` builds the small missing-symbol extension using the retained font license and canonical font metrics. `test_final_qa.py` verifies the economic models and rejects stale source, stale assets, graph shrinkage and stretching. The independent validation is `validate_candidates.validate(staged_rows, evidence_directory)`. Installation remains `install_validated.prepare(..., scope='both')` followed by `materialize(...)`, with a freshly completed byte-bound review required after any rebuild. Do not reuse a review receipt for changed PDF bytes.

The new economics tests include the gas imbalance, tax wedge, both trade triangles, average/marginal-cost identities, monopoly profit, tangency/total-cost derivative consistency, Lorenz/Gini calculations, quantity-equation and exchange-rate arithmetic, exact table preservation, unique Nash outcome, notation/portability scans and negative source/layout guards. Historical tests pinned to earlier immutable content snapshots were not rewritten to bless the new content; the forward active suite and final-pass checks were used.

## 10. Remaining concerns

No unresolved economics, graph or formatting defect is known from this pass. The difficulty labels remain pedagogical judgments: the report supplies a task-specific rationale for every sheet so faculty can adjust intended transfer demands explicitly. The meaningful implementation differences from the faculty wording are documented: semantic PDF tables instead of HTML, no added/split IDs, a single-bank capital focus for MACRO-20, conditional interior tangency in MICRO-58, and retention of the already-correct AS distinction.

Human assistive-technology testing and live deployment verification remain outside the completed checks. Native-page and enlarged-view PDF inspection passed; a particular screen-reader/browser/mobile PDF viewer can still merit user testing. No unresolved ambiguity was concealed by inventing a new instructional objective.
