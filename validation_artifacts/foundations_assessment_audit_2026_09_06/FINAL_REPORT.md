# Foundations assessment-alignment audit: implementation report

Completed 2026-09-06 in the canonical repository. No deployment, commit or push.

## Result and exact scope

Audited the current **General economics foundations** quick-start (`general-foundations`) in `build/faculty-build-composer/composer.js`, using the ten modules in its selectedConceptIds. The authoritative live source is `build/faculty-build-composer/data/composer_library.js`. Its embedded registry, external `composer_registry.json` and `composer_library_manifest.json` have synchronized integrity hashes. Generated games consume those modules through `composer-core.js`; a fresh local generated game was validated. Historical authoring scripts, test fixtures and published games were not edited. They are not parallel live sources for this preset.

The old 46-concept `tests/recipes/market-foundations.json` and the broader General Economics navigation area do not define the current Foundations boundary. Competitive markets (27 records) and price signals (27 records) are adjacent modules selected by the separate Demand, Supply & Elasticity quick-start. Selected Q6/Q28/Q33 map there; their absence from this preset is a boundary fact, not an invented in-scope coverage defect. They and preset membership remain unchanged.

**851 unique questions before and after; 723 retained unchanged; 128 revised; 0 added; 0 removed.** Of the 128, **110 received content revisions** and **18 received image-path corrections only**. In total, 23 existing PPF image references were corrected, including five content-revised records. Entire library count remains 9,779; all 139 unselected concept entries are unchanged.

## Changes by difficulty and pool

| Canonical difficulty | All revised records | Content revisions | Image-reference-only revisions |
|---|---:|---:|---:|
| Easy | 0 | 0 | 0 |
| Medium | 9 | 0 | 9 |
| Hard | 12 | 4 | 8 |
| Elite | 4 | 4 | 0 |
| Legendary, including Legendary checkpoints | 103 | 102 | 1 |

The content changes comprise 100 normal Legendary records, two Legendary checkpoint records, four Hard and four Elite. Normal Hard was already substantially exam-calibrated; this finding justified retaining most of it, rather than rewriting it to inflate the change count.

The actual composed build contains easy 92, medium 103, hard 107, elite 46, legendary 191; opening/middle/final checkpoints 38 each; Legendary checkpoints 68; repair 69, repair seeds 10 and bridges 51. These counts are unchanged. Source-pool memberships differ because calculation records are merged by canonical difficulty and deduplicated. The separate before artifact and JSON inventories record both concepts and ordered source memberships.

## Objective findings

| Concept | Exact objective IDs and counts | Before / after | Revised | Retained |
|---|---|---:|---:|---:|
| scarcity-and-tradeoffs | LO1.1: 96 | 96 | 8 | 88 |
| opportunity-cost | LO1.2: 108 | 108 | 14 | 94 |
| marginal-analysis | LO1.3: 108 | 108 | 12 | 96 |
| incentives | LO1.4: 95 | 95 | 3 | 92 |
| gains-from-trade | LO1.5: 106 | 106 | 13 | 93 |
| models-and-assumptions | LO2.1: 66 | 66 | 15 | 51 |
| production-possibilities-frontier | LO2.2: 84, GE.7.7: 6 | 90 | 28 | 62 |
| micro-versus-macro | LO2.3: 21, GE.7.7: 40 | 61 | 11 | 50 |
| positive-versus-normative-analysis | LO2.4: 24, GE.7.7: 36 | 60 | 12 | 48 |
| economist-policy-role | LO2.5: 20, GE.7.7: 41 | 61 | 12 | 49 |

The historical `GE.7.7` identity is preserved exactly; it is not silently relabeled to LO2.x. Across all selected modules the exact canonical difficulty distribution is `{"easy": 130, "medium": 141, "hard": 145, "elite": 46, "legendary": 259, "unknown": 130}`. The 130 `unknown` records are legacy role metadata, chiefly remediation/bridges, rather than a newly introduced difficulty tier. Full type distributions are in both inventories and are unchanged.

- **Scarcity / LO1.1:** No material coverage or ordinary Hard calibration gap. Retained existing constrained-choice applications. Revised eight upper-tier items to diagnose complementary resource limits, current/future sacrifices and efficiency/distribution claims.
- **Opportunity cost / LO1.2:** No material coverage or ordinary Hard calibration gap. Retained sunk-cost, owned-resource and next-best-alternative Hard work. Revised fourteen upper-tier records with feasible combinations, net alternatives, recoverable resale value and reverse thresholds.
- **Marginal analysis / LO1.3:** No material coverage gap; ordinary Hard already uses sunk costs and incremental comparisons. Corrected two actual numerical defects and strengthened twelve records with complementary steps, opportunity costs, totals-to-margins and reverse break-even reasoning. P52A-MARG-L-002 formerly understated the disadvantage of completion relative to resale; P73-MARG-L-013 formerly selected the wrong number of grants.
- **Incentives / LO1.4:** Mostly strong enough to retain: changed behavior, heterogeneous constraints, competing incentives and metric gaming were already present. Three targeted revisions improve compensation-margin evaluation, additional versus relabeled activity and conservation evidence.
- **Gains from trade / LO1.5:** No missing selected skill; Hard already derives comparative advantage. Thirteen upper-tier revisions add shipping-adjusted trading bounds, reciprocal units, changing productivity, feasible consumption bundles and distribution of net gains. No new graph or table architecture was introduced.
- **Models / LO2.1:** Ceteris paribus was present, including Easy and bridges; this was not a missing concept. Two Hard revisions improve application of conditional assumptions and sensitivity. One Elite and twelve Legendary revisions strengthen mechanism discrimination, transfer limits and decision-specific model evaluation. This addresses the clearest local calibration/robustness issue.
- **PPF / LO2.2 and GE.7.7:** Interior-point meaning, efficiency and opportunity cost already meet ordinary-play demand. Ten content revisions add constrained choices, net-benefit comparisons and efficiency-versus-growth inference. Twenty-three image references now use the approved runtime path. No graph assets, eligibility or sequence changed.
- **Micro/macro / LO2.3 and GE.7.7:** Contextual classification is already covered. One Elite and ten Legendary revisions distinguish aggregate change from local reallocation, sample composition from individual changes, and nationwide micro data from a macro question.
- **Positive/normative / LO2.4 and GE.7.7:** No missing distinction. One Hard, one Elite and ten Legendary revisions expose implicit value criteria, separate forecasts from recommendations, and identify what evidence can and cannot resolve.
- **Economist policy role / LO2.5 and GE.7.7:** Agreement about predictions versus disagreement over values was already covered. One Hard, one Elite and ten Legendary revisions make that distinction concrete and improve advice about selection, uncertain compliance, distribution and unmeasured opportunity costs.

**True coverage gaps:** none within the selected objective set. **Robustness gaps:** concentrated in repetitive upper-tier recognition, generic feedback and several weak alternatives. **Calibration gaps:** local to model-assumption application and thin versions of realistic positive/normative and policy disagreement; the claim that students previously needed Legendary for all exam-like work is not supported by this bank.

## Exam calibration and originality

Only Q1/Q3/Q6/Q8/Q11/Q15/Q22/Q25/Q28/Q30/Q33/Q36 supplied content calibration. They guided concise settings, constrained decisions, assumptions, marginal versus sunk reasoning, behavioral incentives, scope, specialization, price coordination and fact/value distinctions. Q6/Q28/Q33 were mapped to adjacent modules rather than used to expand this preset. Unlisted exam questions supplied no Foundations coverage requirements.

The revised content uses new settings and structures rather than exam copies with changed names or numbers. A separate overlap check found **zero exact twelve-token stem phrases** against the entire midterm; manual review also considered distinctive settings, values and answer structures. That screening test supports, but does not by itself prove, originality. No exam stems or answer key are reproduced in these audit artifacts.

Hard remains short applied reasoning. Elite combines related judgments. The revised Legendary items add reverse inference, conditional recommendations, complementary choices or multiple economic comparisons; their extra demand comes from those operations, not just length or large numbers.

## Graph and adaptive integrity

All three approved PPF images were visually inspected. All 29 graph-linked questions and their eligibility are preserved. Graph asset bytes/checksums, alt text and descriptions are unchanged. No later market, price-control, tax-incidence or macro graph was added.

The generated browser check found that 23 legacy records requested `question-assets/ppf.webp`, while the generated asset inventory embeds `question-assets/production-possibilities-frontier/ppf.webp`. Correcting the source record's image field fixed the displayed graph without changing the engine. Both revised graph families now decode successfully in the generated game.

All IDs, objective/tag/concept identities, difficulties, types, pool order/membership, direct skill routes, repair/seed/bridge content and routes, checkpoint targeting, retest-related metadata, graph eligibility, Fading Fortune and Risk & Reward eligibility, and Concept Review evidence routes were compared before/after. They are unchanged. Existing calculation aliases were synchronized.

Metadata exceptions are explicit: the 23 image path corrections above, plus `commonError` prose for P73-MARG-L-013. Its old diagnostic described crossing the negative intermediate increment as an error, but the corrected feasible-package calculation makes crossing it optimal. Skill and route IDs remain unchanged. `changes.json` and `validation.json` enumerate these exceptions.

## Verification

- Every selected record has four distinct normalized choices and exactly one matching answer hash: **851/851 pass**. Every revised stem and feedback is nonempty. No revised stem duplicates another library record.
- Independent numerical recomputation: **45 content-revised quantitative items, 75 passing arithmetic/feasibility checks**. Units, reciprocal directions, net versus gross values, strict versus boundary gains and plausible distractor derivations were reviewed. Hash correctness was verified separately from economics.
- Core composition: no errors or warnings; **all ten modes pass readiness requirements**. No source schema or composition errors. Generated graph validation: **29 questions / 3 assets pass**.
- Generated HTML: Microsoft Edge loads without script errors; all **128 revised record payloads match** the source; both revised PPF image families load. This was a content smoke check, not a claim of a full playthrough of every mode. External requests were blocked in this local test.
- Quality auditor: before **0 errors / 190 warnings / 120 reviews**; after **0 errors / 156 warnings / 107 reviews**. The remaining warnings are repeated-feedback findings. Detailed dispositions are in `quality-dispositions.json`; no error-level finding remains.
- Synchronized library hash: `098bf47591ab9b39091130336b8c2ab368716407ea215257c1ae374684bd6c85`. Baseline hash and complete change ledger are retained for reproducibility. Historical provenance hashes remain historical; no source-occurrence history was fabricated.

## Remaining thin or uneven areas

The selected preset has ample overall counts, but micro/macro, positive/normative and policy each have only three Elite records; models has four. Some retained legacy Legendary/checkpoint questions remain more direct than the rewritten synthesis items. Repeated general feedback and comparatively obvious absolute distractors remain in parts of the retained bank. These are disclosed limitations of this targeted pass, not new content gaps or hidden zero-warning claims. Direct Easy and repair practice remains intentionally accessible.

Two pre-existing PPF-module records, ECON-MG-HARD-213 and ECON-MG-LEGENDARY-9083, teach circular-flow roles under PPF metadata. They are documented routing/content-boundary anomalies, left intact because casually moving or relabeling them would alter the adaptive architecture. The separate adjacent competitive-market and price-signal pools also remain outside this ten-concept implementation.

## Artifacts

`BEFORE.md` preserves the pre-edit diagnosis. `inventory-before.json` and `inventory-after.json` provide exact distributions and metadata. `changes.json` records each change; `record-actions.json` accounts for all 851 IDs. `numerical-validation.json`, `originality-validation.json`, `validation.json`, `browser-validation.json`, the two quality reports and `quality-dispositions.json` document verification and remaining exceptions.
