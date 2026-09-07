# Market Policy, Surplus & Welfare — before authoring

Date: 2026-09-07. Canonical repository: `C:/Users/Jennings/Documents/GitHub/masteryquests-website`.

The current quick-start is **Market Policy, Surplus & Welfare**, ID **micro-market-policy**, in `build/faculty-build-composer/composer.js`, lines 73–83. It selects, in order: consumer-surplus; producer-surplus; total-surplus-gains-from-exchange; efficient-quantity-allocation; surplus-changes-policy-effects; efficiency-equity-surplus-limits; binding-price-ceilings; binding-price-floors; tax-wedges-and-revenue; statutory-versus-economic-tax-incidence; tax-incidence.

The first six are derived views of `concepts.consumer-and-producer-surplus`; the other five are direct modules. `composer-core.js::resolveConceptModule` filters the shared surplus source using subtopic IDs; `compose` assembles ordinary, checkpoint, calculation and remediation records. The authoritative source is `build/faculty-build-composer/data/composer_library.js`, with its embedded registry and synchronized `composer_registry.json` and `composer_library_manifest.json`. Historical recipes and published/generated games do not define the current scope.

Baseline library SHA-256: `b071adea394fbb8d33322bf5c0ca9fc3af3faf6af2dacd03508fa2976e683b9c`. This includes the completed, uncommitted Demand/Supply audit. Those existing changes must be preserved.

The exact union of selected views equals the six physical source modules: **710 unique records**. Physical counts: surplus 442; ceilings 71; floors 61; tax wedges/revenue 57; statutory/economic incidence 26; tax incidence 53. Resolved surplus-view counts: consumer surplus 61; producer surplus 62; total surplus 90; efficient quantity/allocation 119; surplus changes 70; efficiency/equity limits 40. Counts by view and pool must not be added without deduplicating aliases.

Source memberships: Easy 74; Medium 89; Hard 64; Elite 67; Legendary 133; calculation 60; boss 75; Legendary boss 51; repair 42; repair seed 1; bridge 54. Graph questions: **165**. `inventory-before.json` stores exact IDs in pool order, graph assets, objective/difficulty/type distributions, module routing, repair/bridge/seed maps and every record's non-content metadata.

Canonical difficulty: Easy 96; Medium 117; Hard 149; Elite 67; Legendary 184; unknown 97. Objectives: CPS.1 44; CPS.2 109; CPS.3 121; CPS.4 67; CPS.5 51; CPS.6 50; LO6.1 71; LO6.2 61; LO6.3 57; LO6.4 26; LO6.5 53. Type counts are preserved exactly in the inventory rather than collapsed into an invented taxonomy.

## Initial diagnosis by selected concept

Classification: A true coverage gap; B robustness gap; C calibration gap; D graph-use gap; E no material gap.

| Selected concept | Initial diagnosis |
|---|---|
| Consumer surplus | E for core coverage; B/D for selected upper-tier/graph items. Discrete and triangular area practice exists. Check whether balanced-area distractors accidentally produce the same numeric answer; improve comparative interpretation where warranted. |
| Producer surplus | E for core coverage; B/D locally. Graph and discrete cost applications exist. Preserve distinction between producer surplus and profit; make price/quantity changes support distributional reasoning. |
| Total surplus/gains from exchange | B/D. Gains from exchange and CS+PS are present, but one Hard graph item asks only for equilibrium coordinates despite its total-surplus skill. Strengthen that item and selected comparative welfare work. |
| Efficient quantity/allocation | E for ordinary Hard; localized B at upper tiers. Ranked buyer/seller schedules, marginal gains and misallocation are already covered. Preserve strong efficient-trade calculations. |
| Surplus changes/policy effects | B, with local C/D review needed. Hard already has demand/supply-shift welfare comparisons; no true absent-topic gap. Some Elite questions are one-step accounting, and effects for successful buyers must not be confused with changes for all consumers. |
| Efficiency/equity limits | E for legitimate concepts. Existing questions distinguish measured surplus, ability to pay, external costs and fairness. Do not expand adjacent topics based on excluded exam questions. |
| Binding ceilings | E for Hard binding/shortage practice; B/D for repetitive upper-tier recognition. Check maximum possible trades versus asserted actual trades, allocation assumptions, and unwarranted universal claims about hidden costs/misallocation. |
| Binding floors | E for ordinary Hard; B/D for upper-tier repetition. Quantities supplied/demanded, employment and nonbinding controls are present. Strengthen a few comparison/reverse-inference tasks and keep government purchases explicit. |
| Tax wedges and revenue | E for routine graph calculation; B/D and localized C for interpretation. Hard already computes wedges/revenue, but some graph questions ask only a formula or state the needed values. Upper tiers often repeat basic arithmetic. |
| Statutory versus economic incidence | B/D. Core equivalence is covered, but several higher-tier items repeat the verbal rule and do not require the attached graph. Use graph prices and quantities to evaluate an equivalent tax or diagnose legal-incidence errors. |
| Tax incidence | E for core direction; B/D for several high-tier items. Hard has only four ordinary source records plus calculations. One graph prompt supplies both equal burdens and then asks whether burdens are equal. Replace answer-revealing prompts with inference using graphical prices. |

No new topic or new graph is currently justified. Read the entire previously attached `micro_midterm.docx` for style; inspected the graphs for Q16–Q21/Q28/Q30. Only those eight questions govern content alignment. Q1–Q15, Q22–Q27, Q29 and Q31 do not create coverage requirements. Do not reproduce exam stems, distinctive numerical combinations, tables, or an answer key in delivered artifacts.

## Defects and validation priorities

The baseline quality auditor, correctly run on the six physical sources, examined 710 questions: **0 ERROR, 90 WARNING, 158 REVIEW**. Warnings include 50 graph-eligibility metadata signals, 27 repeated-feedback records, 11 missing graph cues, and 2 generic-feedback records. Reviews include 21 near-duplicate stems, 27 difficulty signals, 31 answer-length cues, 75 absolute-distractor signals, 3 accessibility-answer leaks, and 1 stem-answer redundancy. All findings require semantic disposition; counts are not an automatic rewrite quota.

Several surplus asset descriptions list detected numbers without connecting them to axes/points, which is insufficient equivalent evidence for welfare geometry. Some control/tax descriptions precompute shortage, wedge, burden or quantity changes. Verify graph bytes visually, replace inaccurate/incomplete descriptions with coordinates, and remove inferred conclusions. Check legacy generic image paths separately. Do not change graphRequired or mode membership just to silence an auditor warning.

Preserve IDs, objectives, concepts/tags, type/difficulty, pool order/membership, skills, all remediation and checkpoint maps, retest/mode eligibility and Concept Review routing. Validate every revised calculation and option, all generated graph paths and a focused browser render/enlarge smoke test. Compare before/after structural snapshots and synchronize integrity hashes. No deployment, commit or push.
