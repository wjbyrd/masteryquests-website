# Federal Budgets & Debt — Content and Taxonomy Inventory Audit

**Audit date:** 2026-08-27  
**Scope:** repository-only, read-only audit of the current Composer library and its authoring/validation lineage  
**Published library audited:** Composer 4.5s.3k; 133 concepts; 9,271 canonical questions

## 1. Executive summary

The current taxonomy has **no active, legacy, or dormant concept for Federal Budgets & Debt**, and no suitable dormant concept ID was found. The published library contains **0 questions that directly assess** federal-budget accounting, deficit versus debt, public saving, government debt measures, debt-to-GDP, debt service, or dated fiscal-data interpretation.

It does contain **38 supporting/overlapping records** worth preserving: **31** in `fiscal-multipliers-and-crowding-out` that assess crowding out or its net effect, and **7** in `gdp-components` that distinguish government purchases from transfers. These records provide useful prerequisites and connections, but they do not constitute a Federal Budgets & Debt bank. The existing material is therefore **effectively absent as a standalone concept**, with moderate adjacent support.

Recommendation: create a future standalone concept titled **Federal Budgets & Debt**, ID **`federal-budgets-and-debt`**, organized around FB1–FB9 below. Keep all 38 records in their current concepts; rebuild the necessary shared ideas independently in the new bank. A production target of **108 records** is recommended (minimum 84, useful upper bound 120). No dedicated economics-model graph family is warranted. Real-world items should use explicitly dated CBO, U.S. Treasury Fiscal Data, and—where GDP denominators are needed—BEA releases.

## 2. Existing concept/taxonomy findings

- No registry record has a canonical ID or title matching federal budgets, deficits, public saving, government debt, or loanable funds. Searches of IDs, titles, descriptions, and included skills found only incidental uses of the words *budget*, *debt*, *saving*, or *investment*.
- Closest current homes are:

  | Concept ID | Title | Published records | Current boundary |
  |---|---|---:|---|
  | `gdp-components` | GDP Components | 63 | C + I + G + NX; purchases versus transfers |
  | `fiscal-policy-and-aggregate-demand` | Fiscal Policy and Aggregate Demand | 57 | deliberate G/tax changes and short-run AD |
  | `fiscal-multipliers-and-crowding-out` | Fiscal Multipliers and Crowding Out | 76 | multipliers and the interest-rate/investment offset |
  | `stabilization-policy` | Stabilization Policy | 82 | lags, automatic stabilizers, policy response, coordination |
  | `economic-growth-policy` | Economic Growth Policy | 50 | productivity and long-run growth channels |
  | `integrated-macroeconomic-analysis` | Advanced Macro Checkpoint Supplement | 112 | checkpoint supplement only; not standalone practice |

- The course-area model assigns any non-General/non-Micro active concept to Macro; no separate ordered Macro curriculum structure exists beyond registry order and quick starts.
- Clean pedagogical placement is after GDP/growth foundations and before the later Saving, Investment & Loanable Funds concept. Alphabetical card rendering will place the proposed title naturally among other `federal-...`/fiscal entries; prerequisites and related IDs should express the instructional sequence.
- Suggested prerequisites: `gdp-components` and `gdp-measurement`. Suggested related concepts: `fiscal-policy-and-aggregate-demand`, `fiscal-multipliers-and-crowding-out`, and the future Phase 2 concept.
- Existing quick starts are `macro-measurement-growth`, `money-banking-inflation`, and `stabilization-policy`. Do **not** silently add this bank to the stabilization preset: fiscal position is broader than stabilization. After Phase 2, add it to a new long-run macro-finance/saving quick start; a later broad Macro-core recipe may also include it.

## 3. Current relevant-question inventory

Classification rule: a record is **direct** only if its assessed answer depends on Federal Budgets & Debt content. A record is **supporting/overlapping** when it directly assesses purchases-versus-transfers or crowding out. Incidental wording and distractor-only mentions are not counted.

| Class | Count | Finding |
|---|---:|---|
| A. Direct Federal Budgets & Debt | **0** | No assessed coverage of the proposed concept's core outcomes |
| B. Supporting/overlapping | **38** | 31 crowding-out records; 7 purchases/transfers records |
| C. Adjacent, remains elsewhere | Not included in the 38 | Fiscal-policy AD, stabilization, multiplier-only, monetary, GDP identity, and growth items |
| D. Out of scope | Not included | Household/firm nominal debt, wage surpluses, Micro tax revenue, Keynesian-cross/public-finance material |

Every one of the 38 records should be **KEEP** in its current home. The new concept should **COPY/REBUILD CONCEPTUALLY**, not duplicate IDs or move questions.

## 4. Relevant questions by current concept

All rows below are published canonical records. “Practice” means the normal difficulty pool; “checkpoint,” “adaptive,” and “mastery” describe the pool's runtime role. Special-mode availability is composition-based rather than a per-question taxonomy field.

### 4.1 Fiscal Multipliers and Crowding Out — 31 supporting records

| ID | LO | Skill | Difficulty / pool | Type | Assessed overlap | Disposition |
|---|---|---|---|---|---|---|
| ECON-SP-EASY-54 | LO35.4 | crowding_out_effect | easy / easy | definition | rates displace private investment | KEEP |
| LG-Q-58 | 35.4 | identify_mechanism | easy / easy | definition | crowding-out mechanism | KEEP |
| ECON-SP-MEDIUM-147 | LO35.4 | crowding_out_effect | medium / medium | interpretation | smaller net AD shift | KEEP |
| LG-Q-176 | 35.4 | explain_crowding_out | medium / medium | concept | rates reduce investment | KEEP |
| LG-Q-178 | 35.4 | evaluate_policy_strength | medium / medium | application | conditions weakening stimulus | KEEP |
| ECON-SP-HARD-229 | LO35.4 | crowding_out_effect | hard / hard | graph interpretation | partial AD reversal | KEEP |
| LG-Q-274 | 35.4 | identify_offsetting_effect | hard / hard | identification | investment offset | KEEP |
| ECON-SP-ELITE-319 | LO35.4 | crowding_out_effect | elite / elite | integration | multiplier versus offset | KEEP |
| ECON-SP-ELITE-320 | LO35.4 | crowding_out_effect | elite / elite | graph interpretation | multiplier then offset | KEEP |
| ECON-SP-ELITE-347 | LO35.4 | crowding_out_effect | elite / elite | integration | low MPC/high-rate case | KEEP |
| LG-Q-373 | 35.4 | combine_multiplier_and_crowding_out | elite / elite | graph net calculation | net AD after offset | KEEP |
| LG-Q-374 | 35.4 | evaluate_fiscal_policy_shortfall | elite / elite | graph policy synthesis | stronger-than-expected offset | KEEP |
| LG-Q-376 | 35.4 | calculate_net_fiscal_effect | elite / elite | multistep graph calculation | net AD after offset | KEEP |
| LG-Q-377 | 35.4 | distinguish_fiscal_effects | elite / elite | concept synthesis | multiplier and crowding out | KEEP |
| ECON-SP-LEGENDARY-9023 | LO35.4 | crowding_out_effect | legendary / legendary | misconception trap | AD gain can coexist with investment loss | KEEP |
| ECON-SP-LEGENDARY-9024 | LO35.4 | crowding_out_effect | legendary / legendary | graph integration | staged AD movement | KEEP |
| LG-Q-9073 | 35.4 | trace_initial_multiplier_and_crowding_out | legendary / legendary | graph-order calculation | gross then net effect | KEEP |
| PM2D2-MULT-L-001 | LO35.4 | multiplier_crowding_net_comparison | legendary / legendary | multistep comparison | compare offsets | KEEP |
| PM2D2-MULT-L-002 | LO35.4 | infer_crowding_out_from_net_effect | legendary / legendary | reverse calculation | infer displaced investment | KEEP |
| ECON-SP-HARD-230 | LO35.4 | calculate_spending_multiplier | hard / calculation | calculation | multiplier less offset | KEEP |
| LG-Q-275 | 35.4 | calculate_net_policy_effect | hard / calculation | calculation | gross less offset | KEEP |
| LG-Q-4011 | 35.4 | calculate_multiplier_minus_crowding_out | hard / boss | final-checkpoint synthesis | net AD | KEEP |
| P52B-S4-FMCO-B1-002 | LO35.4 | crowding_out_mechanism | easy / boss | checkpoint | government borrowing/rate channel | KEEP |
| P52B-S4-FMCO-B2-002 | LO35.4 | net_multiplier_after_crowding_out | medium / boss | calculation | net AD | KEEP |
| LG-Q-9133 | 35.4 | trace_multiplier_then_crowding_out | legendary / legendaryBoss | mastery checkpoint | sequence and net effect | KEEP |
| LG-Q-9141 | 35.4 | combine_money_demand_shift_and_crowding_out | legendary / legendaryBoss | mastery checkpoint | two interest-rate channels | KEEP |
| ECON-SP-CROWDING-OUT-EFFECT-5045 | 35.4 | crowding_out_effect | unknown / repair | repair | rates reduce investment | KEEP |
| LG-R-5054 | 35.4 | crowding_out_net_effect | unknown / repair | repair | displaced investment | KEEP |
| LG-R-5055 | 35.4 | crowding_out_net_effect | unknown / repair | repair | gross less offset | KEEP |
| ECON-SP-CROWDING-OUT-EFFECT-6036 | 35.4 | crowding_out_effect | unknown / bridge | bridge | investment is crowded out | KEEP |
| LG-B-6023 | 35.4 | bridge_multiplier_to_stabilization | unknown / bridge | bridge | carry net AD forward | KEEP |

### 4.2 GDP Components — 7 supporting records

| ID | LO | Skill | Difficulty / pool | Type | Assessed overlap | Disposition |
|---|---|---|---|---|---|---|
| PM2B1-GDPC-M-001 | MACRO.M2B1 | transfer_vs_purchase | medium / medium | application | pension transfer versus rescue-vehicle purchase | KEEP |
| ECON-NL-HARD-210 | LO24.3 | gdp_components_identity | hard / hard | trap | unemployment transfer and later consumption | KEEP |
| ECON-NL-ELITE-309 | LO24.3 | gdp_components_identity | elite / elite | multistep | bridge purchase versus Social Security transfer | KEEP |
| ECON-NL-LEGENDARY-9004 | LO24.3 | gdp_components_identity | legendary / legendary | multistep | road purchase, benefit, saving | KEEP |
| PM2B1-GDPC-FB-006 | MACRO.M2B1 | imports_accounting | hard / boss | calculation | domestic/foreign purchase and transfer | KEEP |
| PM2B1-GDPC-MB-001 | MACRO.M2B1 | transfer_vs_purchase | medium / boss | application | snowplow purchase versus assistance check | KEEP |
| ECON-NL-INVENTORY-INVESTMENT-5011 | LO24.3 | transfer_vs_purchase | unknown / repair | repair | transfer excluded from G when sent | KEEP |

## 5. Learning-objective coverage

The 38 records map only to existing objectives: **31** to 35.4/LO35.4 (crowding out), **4** to LO24.3, and **3** to MACRO.M2B1 (GDP components). There is no objective for federal budget accounting or debt. None tests FB1, FB2, FB3, FB5, FB6, FB7, or FB9. FB4 has narrow prerequisite support from the seven GDP records; FB8 has an indirect bridge through the 31 crowding-out records.

## 6. Difficulty, pool, and type distribution

### Difficulty

| Easy | Medium | Hard | Elite | Legendary | Unknown/adaptive |
|---:|---:|---:|---:|---:|---:|
| 3 | 6 | 7 | 8 | 8 | 6 |

### Pool

| Pool | Count | Mode relevance |
|---|---:|---|
| easy | 2 | ordinary practice |
| medium | 4 | ordinary practice |
| hard | 3 | ordinary practice |
| elite | 8 | challenge practice |
| legendary | 6 | mastery practice |
| calculation | 2 | calculation inventory; composed into eligible practice |
| boss | 5 | standard/score checkpoints |
| legendaryBoss | 2 | Legendary mastery checkpoints |
| repair | 4 | adaptive remediation |
| bridge | 2 | adaptive concept transition |

Type distribution is fragmented: application 3; bridge 2; calculation 4; checkpoint 1; definition 2; graph interpretation/integration/net/policy types 6; integration 2; repair 4; multistep/reverse/comparison/synthesis and other singleton types 14. This is supporting evidence, not a coherent standalone progression.

## 7. Direct vs. overlapping vs. adjacent content

- **Direct (0):** no budget-balance, deficit/debt, public-saving, debt-measure, debt-ratio, debt-service, or fiscal-data assessment.
- **Supporting (38):** the tables above.
- **Adjacent:** the remaining 45 records in `fiscal-multipliers-and-crowding-out` are multiplier-first or fiscal-AD items; all 57 `fiscal-policy-and-aggregate-demand` records remain short-run policy/AD; `stabilization-policy` remains lags, automatic stabilizers, and gap response; other GDP records remain national-accounting questions.
- **Incidental/distractor-only:** `P52B-S1-FED-L-002`, `LG-B-6006`, `LG-B-6007`, and `ECON-NL-EASYBOSS-2018` mention a budget deficit/surplus or government debt only as wrong answers. They provide no instructional coverage.
- **Adjacent specialist records:** `P52B-S1-FED-EL-001` tests fiscal dominance; `LG-Q-268` uses deficit reduction as context for a monetary-policy offset; several inflation-tax records use money-financed deficits. Keep all outside the new bank unless a later author writes a deliberate cross-concept bridge.

## 8. Fiscal Policy overlap

The current taxonomy mostly preserves the correct boundary. Fiscal Policy and Aggregate Demand owns action-to-AD questions; its 57 records should not be counted as Federal Budgets & Debt merely because they mention government purchases or taxes. The blur occurs in the crowding-out family: several records jump from “higher government spending” to higher rates without explicitly naming the budget position, public saving, or borrowing. That is pedagogically acceptable in LO35.4, but the future bank should supply the missing accounting chain: **deficit → lower public saving / more government borrowing → possible longer-run effects**. No existing fiscal-policy question is clearly misclassified.

## 9. Loanable Funds / Phase 2 boundary

Reserve for Phase 2:

- definitions and identities for private, public, and national saving beyond the minimal public-saving bridge;
- supply and demand for loanable funds, equilibrium real interest rate, and market-clearing logic;
- graphical deficit shifts, comparative statics, and full crowding-out mechanism;
- investment-demand shifts, saving shifts, and quantitative equilibrium;
- capital formation effects and integration with international capital flows.

Federal Budgets & Debt should calculate public saving and explain that a deficit reduces it; it may state that sustained borrowing can put upward pressure on rates and investment. It should stop before the loanable-funds graph and equilibrium analysis. The 31 current crowding-out records therefore remain where they are and become prerequisite/related evidence, not migration material.

## 10. Deficit-versus-debt coverage

**Absent.** No published record tests flow versus stock, how annual deficits add to accumulated debt, why a smaller deficit can still increase debt, or why a surplus can reduce debt. This is the clearest conceptual gap and should receive repeated, varied treatment from easy through hard.

## 11. Public-saving coverage

**Absent.** Exact searches found zero uses of “public saving,” “government saving,” or “national saving” in the published assessment content. A future bank should explicitly define the project's convention and use it consistently. If transfers are included in outlays, questions must not silently switch between `T − G` shorthand and a broader revenues-minus-outlays measure.

## 12. Debt-measure coverage

**Absent.** No record distinguishes debt held by the public from gross federal debt or introduces intragovernmental holdings at a Principles level. The future bank should emphasize why a stated debt measure must be identified, without turning the topic into Treasury-account trivia.

## 13. Debt-to-GDP coverage

**Absent.** There are no debt/GDP calculations, comparisons, denominator-effect questions, or percent-versus-percentage-point applications. This gap can support genuine medium-to-hard progression.

## 14. Interest/debt-service coverage

**Absent.** Existing interest-rate questions concern monetary transmission or crowding out, not federal interest outlays. Future coverage should distinguish the debt stock, effective interest cost, annual net interest outlays, and the way higher interest costs feed future budgets, using only simple Principles-level arithmetic.

## 15. Existing numerical coverage

Among the 38 overlaps, **16 stems contain numerical data**: 12 crowding-out/multiplier scenarios and 4 GDP purchase/transfer scenarios. None calculates a budget balance, public saving, change in debt, debt-to-GDP, relative debt/GDP growth, or debt-service cost.

Recommended numerical tasks:

- revenue minus outlays and sign interpretation;
- public saving under a clearly stated convention;
- annual deficit and the direction/change in debt;
- debt/GDP × 100 and percent versus percentage-point changes;
- compare debt growth with nominal-GDP growth;
- simple interest-cost interpretation.

Prioritize reasoning such as “debt grows 4% while nominal GDP grows 7%” over repeated arithmetic. Eight current crowding-out records are essentially gross-minus-offset drills; that repetition should not be copied into the new bank.

## 16. Real-world-data opportunities

Repository searches found **no current CBO, Treasury Fiscal Data, BEA federal-budget table, debt table, baseline projection, debt-to-GDP series, or dated fiscal-year assessment**. “CBO”/“Congressional Budget Office” appears only as a distractor for Federal Reserve institutional questions. A Treasury reference distinguishes the Fed from the Treasury but supplies no fiscal data.

For production, use explicitly dated and locally captured source notes from:

- Congressional Budget Office for historical budget results and baseline projections;
- U.S. Treasury Fiscal Data for receipts, outlays, deficits, debt measures, and interest costs;
- BEA for GDP denominators where needed.

Every real-data prompt should identify the source, release/baseline, year, unit, and whether the period is fiscal or calendar. Avoid “current debt” questions and avoid requiring live updates.

## 17. Graph-need assessment

**No dedicated economics-model graph family is needed.** Existing related assets are AD-multiplier, AD–AS, money-market, and growth production-function graphs. Ten of the 38 overlap records reference an existing graph/image, but all visualize multiplier/crowding-out or money-market mechanisms—not federal budget accounting or debt measurement.

Historical deficit/debt plots are **data charts**, not economics-model graphs; budget tables are **data displays**, not graphs. Either can support FB9 without manufacturing Trial by Graph eligibility. A standalone zero-graph concept would have zero graph-safe inventory and therefore would not qualify for Trial by Graph by itself (the mode requires at least 10 graph-required, imaged questions). That is an acceptable outcome.

## 18. Professor-voice / assessment-quality findings

- The strongest existing material uses clean conditional reasoning and multistep comparison, especially PM2D2-MULT-L-001/002 and the purchase-versus-transfer GDP cases.
- The main weakness is template repetition: easy/repair/bridge crowding-out prompts repeatedly ask which spending component falls, and several numerical items merely subtract an announced offset from a gross AD change.
- No relevant record conflates the annual deficit with accumulated federal debt, but only because the distinction is not assessed at all.
- No dated statistic is presented without a date; there are no real fiscal statistics.
- No percent/percentage-point errors were found in the 38 records.
- Feedback generally explains the channel, but the repeated “private investment” items offer little diagnostic variety.
- Genuine elite/legendary potential exists for the new concept—multi-measure comparison, debt/GDP denominator reasoning, projections versus outcomes, and multistep accounting—but should be used selectively. Obscure terminology and long prose should not create artificial difficulty.

## 19. Political-neutrality findings

No supporting record praises or condemns an administration, names a political party, asserts that deficits are always harmful/harmless, or converts a normative fiscal position into positive economics. Generic references to Congress or government are instructionally necessary and neutral. Future prompts should preserve this stance: analyze accounting identities, empirical measures, conditional mechanisms, and tradeoffs without prescribing a fiscal philosophy.

## 20. Duplicate/template findings

- **Exact normalized stem duplicates:** 0 among the 38 unique records.
- **Near-template pairs:** 3 clear pairs/families:
  - ECON-SP-EASY-54 / LG-Q-58 (same crowding-out definition);
  - LG-Q-376 / LG-Q-4011 (same MPC/net-AD template with changed numbers);
  - LG-Q-9073 / LG-Q-9133 (same shift-order template with changed numbers).
- **Repeated exact correct-answer language:** “private investment” appears as the complete correct answer in 5 records; “$220 billion” appears in 2.
- The broader crowding-out set contains multiple paraphrases of the same rate-investment channel. Reuse the concept, not these templates, when authoring the new bank.

## 21. Recommended final learning-objective framework

All nine proposed outcomes deserve inclusion, with a small boundary adjustment to FB8:

| LO | Recommended outcome | Priority / boundary |
|---|---|---|
| FB1 | Compute and interpret revenues, outlays, deficits, surpluses, and balance | Core; high volume |
| FB2 | Distinguish annual deficit/surplus flows from the debt stock and trace accumulation | Core; high volume |
| FB3 | Calculate and interpret public saving and connect it briefly to national saving | Core; stop before full saving-investment model |
| FB4 | Classify purchases, transfers, and introductory mandatory/discretionary categories | Core; reuse GDP distinction conceptually |
| FB5 | Distinguish debt held by the public, gross debt, and nominal debt at Principles level | Core; avoid Treasury trivia |
| FB6 | Calculate and interpret debt-to-GDP across time/economies, including denominator effects | Core; strong medium/hard path |
| FB7 | Interpret interest outlays/debt service and their budget opportunity cost | Core; simple calculations only |
| FB8 | Explain persistent deficits, debt accumulation, borrowing, and the basic saving/investment connection | Core bridge; no loanable-funds graph/equilibrium |
| FB9 | Interpret explicitly dated fiscal tables/charts and distinguish projection from realized data | Core authenticity layer |

Suggested weighting: FB1 14%, FB2 16%, FB3 10%, FB4 10%, FB5 10%, FB6 14%, FB7 9%, FB8 10%, FB9 7%. FB2 and FB6 deserve the greatest repetition because they carry the most common misconceptions.

## 22. Recommended concept title and ID

- **Title:** Federal Budgets & Debt
- **Canonical ID:** `federal-budgets-and-debt`

The candidate follows the repository's lowercase kebab-case convention, is specific, and avoids collision with Fiscal Policy. No existing convention justifies a different ID.

## 23. Recommended production size

| Level | Total | Rationale |
|---|---:|---|
| Minimum defensible | **84** | Six or more ordinary records per major band, all nine LOs represented, three checkpoint stages, mastery checkpoint, and basic Repair/Bridge support |
| Recommended | **108** | Enough variation for nine LOs, meaningful easy-to-legendary progression, 72–78 ordinary/challenge records, 18–21 checkpoint records, and 12–15 adaptive support records without padding |
| Upper useful bound | **120** | Additional real-data variants and carefully distinct high-difficulty items; beyond this, template and arithmetic repetition are likely |

This topic does not justify 160 records. A strong 108-record bank is preferable to padding, especially with no graph family. Elite/Legendary records are warranted, but a small minority should be genuinely integrative rather than verbose.

## 24. Questions that should remain in existing concepts

All **38** supporting records should remain. In particular:

- purchases-versus-transfers questions remain in `gdp-components` because their assessed outcome is GDP inclusion/classification;
- all crowding-out questions remain in `fiscal-multipliers-and-crowding-out` because they assess multiplier/AD and the interest-rate/investment offset;
- short-run tax/G-to-AD questions remain in `fiscal-policy-and-aggregate-demand`;
- automatic stabilizers, lags, and policy-mix questions remain in `stabilization-policy`;
- fiscal dominance and money-financed deficit questions remain in central-bank/inflation concepts.

The future bank should rebuild only the shared prerequisite ideas with a budget/debt assessment target.

## 25. Questions that may warrant later migration

**None identified.** No existing record is clearly misclassified under the proposed boundary. A future author may add secondary concept links or purpose-built Bridges, but moving current IDs would weaken polished banks and would not fill the direct-content gap.

## 26. Recommended next production step

Create a scoped Phase 1 authoring specification before writing questions:

1. lock FB1–FB9 definitions, especially public-saving and outlay conventions;
2. define a 108-record pool blueprint by LO, difficulty, and runtime role;
3. capture dated CBO/Treasury/BEA source tables with provenance notes;
4. write an original bank, using the 38 overlaps only as boundary/prerequisite evidence;
5. validate terminology, calculations, neutrality, uniqueness, adaptive routes, checkpoints, and non-graph mode expectations;
6. only then add taxonomy/Composer metadata in a separately authorized production task.

## 27. Exact files inspected

- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/concept-reviews/concept_review_source.json`
- `build/faculty-build-composer/course-area-model.js`
- `build/faculty-build-composer/composer.js`
- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/phase5.2b-stage1-authoring/phase5.2b_stage1_authoring_questions.json`
- `build/faculty-build-composer/phase5.2b-stage4-authoring/phase5.2b_stage4_authoring_questions.json`
- `build/faculty-build-composer/phaseM2b1-gdp-national-output-family-maturation-v1_questions.json`
- `build/faculty-build-composer/phaseM2b1-gdp-national-output-family-maturation-v1.json`
- `build/faculty-build-composer/phaseM2d2-fiscal-stabilization-family-maturation-v1_questions.json`
- `build/faculty-build-composer/phaseM2d2-fiscal-stabilization-family-maturation-v1.json`
- `build/faculty-build-composer/phaseM2d3-stabilization-block-closure-v1_questions.json`
- `build/faculty-build-composer/phaseM2d3-stabilization-block-closure-v1.json`
- `build/faculty-build-composer/phaseM2e-advanced-macro-checkpoint-supplement-v1_questions.json`
- `build/faculty-build-composer/phaseM2e-advanced-macro-checkpoint-supplement-v1.json`
- `play/economic-realm/stabilization-protocol/stabilization_protocol_questions_student.js`
- Relevant question assets and metadata under `build/faculty-build-composer/data/question-assets/`

Repository-wide text searches also covered current `.js`, `.json`, `.mjs`, `.py`, and `.md` sources for the fiscal terms listed in the mission; generated production samples and legacy publisher copies were excluded from evidentiary counts.

## 28. Uncertainties and unresolved issues

- The project must choose and document one public-saving notation convention before authoring; textbook conventions vary in whether shorthand `T − G` abstracts from transfers.
- Debt-measure terminology should be aligned to the dated source table used; “federal debt” is not sufficiently precise by itself.
- The exact checkpoint allocation and adaptive minimums should be confirmed against the then-current Composer validation rules during production; this audit did not run or change publishers/validators.
- A future Phase 2 canonical ID and prerequisite edge do not yet exist, so the cross-phase relationship can only be recommended, not registered.
- Real-world numeric values were intentionally not researched or invented. Source selection and data snapshots remain production work.

---

**Audit conclusion:** direct standalone coverage is absent; 38 records provide useful overlap but should remain in their existing concepts. Proceed with a focused, original 108-record `federal-budgets-and-debt` bank, no dedicated graph family, and explicitly dated fiscal data.
