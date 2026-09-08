# Market Failures & Public Goods — production assessment-quality audit

The current preset retains **362 questions: 48 content revisions, 102 accessibility-only record revisions and 212 unchanged records**. No questions or images were added or removed. Core coverage is broad; the largest weaknesses were repetitive upper-tier recognition and some shallow Hard applications, not missing chapters. All changes are local; no commit, push, merge or deployment was performed.

## 1. Exact live preset and authority

The quick start in `build/faculty-build-composer/composer.js` is **`micro-market-failures-public-goods` — “Market Failures & Public Goods”**. It selects `externalities`, `public-goods-and-common-resources`, and `market-power`. All are **derived views**, not direct question containers.

`composer-core.js:1048` resolves each view by filtering `MQ_COMPOSER_LIBRARY.concepts["market-failures"]` for the view’s `subtopicFilterId` in each record’s `subtopicIds`. It clones and remaps the primary concept, tag and runtime subtopic, filters route references and used assets, and retains the parent’s authoritative question identity. Only selected records within that parent were edited. Raw view definitions and all 25 excluded parent records are unchanged. The parent has 387 unique records; 362 are selected. All 148 other concept definitions are unchanged.

The BEFORE inventory contains the exact raw parent, raw selected definitions, resolved question objects, ordered ordinary/checkpoint/repair/bridge collections, assets, routes, review mapping and file hashes. It was captured before authoring. Objective findings were documented before revisions. Current runtime membership determines scope; historical filenames and sourceOccurrences remain provenance only.

## 2. Selected objectives and counts

| Derived view | Before / after | Content revised | Metadata only | Unchanged | Objective IDs in actual records |
|---|---:|---:|---:|---:|---|
| externalities | 177 | 25 | 93 | 59 | EXT.1, EXT.2, EXT.3, EXT.4, EXT.5, EXT.6, EXT.9, EXT.7, EXT.8, LO1.6, GE.7.7 |
| public-goods-and-common-resources | 176 | 20 | 9 | 147 | PGCR.7, PGCR.1, PGCR.2, PGCR.6, PGCR.5, PGCR.4, PGCR.3, PGCR.8, PGCR.9, LO1.6, GE.7.7 |
| market-power | 9 | 3 | 0 | 6 | LO1.6, GE.7.7 |

There are 24 objective/view combinations and 20 distinct objective IDs: EXT.1–EXT.9, PGCR.1–PGCR.9, LO1.6 and GE.7.7. The last two are legacy umbrella codes that occur in multiple selected views. The source labels do not provide a descriptive GE.7.7 label; it is reported as its actual ID. Derived concept-title entries in objectiveLabels are not counted as additional zero-question objectives. Module-level sourceChapters are [1, 6]; exact record-level sourceChapter and sourceOccurrences are preserved.

## 3. Curricular boundary

Included: negative production and consumption externalities; positive production and consumption spillovers; private/social marginal curves; taxes, subsidies, regulation, permits and abatement; Coase, enforceability, transaction costs and private solutions; public goods, common resources, club/private goods, rivalry and exclusion; free riding, benefit aggregation, cost-benefit reasoning, commons institutions and property rights; introductory market power, restricted trades, entry, natural-monopoly financing and exclusive-right innovation incentives.

**Scope boundaries, not missing coverage:** asymmetric information, adverse selection, moral hazard, signaling, screening, principal-agent problems, labor discrimination, human capital, compensating differentials, inequality/poverty, behavioral economics and detailed monopoly/oligopoly or legal doctrine. Broad inherited repair-route key names do not establish selected curriculum: their references are filtered to selected support records. `scope-boundary.json` records the actual excluded-parent evidence. No new source assessment accompanied this request, and no prior exam was imported into this audit.

## 4. Exact before/after accounting

362 before and after; 0 added; 0 removed; 48 content-revised; 102 asset-metadata-only; 212 wholly unchanged. The 48 content revisions overlap 14 records with accessibility updates. In total, 116 records received synchronized inline accessibility fields. Thus 314 stems/options/keys/feedback objects are unchanged, but only 212 complete question objects are unchanged. Fourteen shared asset contracts were corrected: 13 long descriptions and 14 alt texts. These asset counts are separate from the mutually exclusive question dispositions.

`record-actions.json` has one disposition for every scoped ID. `changes.json` contains exact changed fields before/after, including metadata-only changes. Both inventories preserve the full resolved and authoritative objects. `accounting.json` supplies exact cross-counts.

## 5. Difficulty accounting

| Canonical difficulty | Before / after | Content revised |
|---|---:|---:|
| easy | 75 | 0 |
| medium | 118 | 0 |
| hard | 84 | 15 |
| elite | 43 | 10 |
| legendary | 35 | 23 |
| unknown | 7 | 0 |

The seven unknown canonical difficulties are existing auxiliary records. Source difficulty, canonical difficulty, pool placement and order are all unchanged. Easy and Medium content is retained. Fifteen existing Hard records now offer better decision/graph/calculation reasoning; ten Elite and 23 Legendary records have targeted improvements.

## 6. Type and pool accounting

| Canonical type | Before / after | Content revised |
|---|---:|---:|
| graph_interpretation | 45 | 4 |
| graph_trap | 21 | 4 |
| graph_calculation | 48 | 8 |
| graph_integration | 33 | 3 |
| application | 124 | 19 |
| interpretation | 44 | 3 |
| calculation | 9 | 3 |
| integration | 26 | 3 |
| bridge | 6 | 0 |
| definition | 6 | 1 |

| Composed pool | Before / after |
|---|---:|
| easy | 70 |
| medium | 103 |
| hard | 80 |
| elite | 43 |
| legendary | 29 |
| easyBoss | 5 |
| mediumBoss | 7 |
| finalBoss | 4 |
| legendaryBoss | 6 |
| repair | 8 |
| repairSeed | 0 |
| bridge | 7 |
| calculation | 0 |
| integration | 0 |
| challengeTotal | 0 |

The 325 ordinary records plus 16 regular checkpoints, six Legendary checkpoints, eight repairs and seven bridges total 362. Canonical difficulty counts include auxiliary/checkpoint records, so they differ from ordinary bank counts. Source boss pools are mapped by the existing Composer into easyBoss/mediumBoss/finalBoss. All memberships and ordering match BEFORE.

There is no separate calculation pool and no source-to-Hard calculation merge in this preset. Numerical reasoning is embedded in ordinary/checkpoint records, including nine calculation-type and 48 graph-calculation-type records. There are 26 integration-type and 33 graph-integration-type records, but no separate integration/challenge pool. Empty specialized containers are reported accurately and were not filled to manufacture coverage.

## 7. Objective-by-objective findings and actions

A = coverage; B = robustness; C = calibration; D = calculation/integration; E = graph use; F = upper-tier synthesis; G = no material gap. The table reproduces the pre-authoring assessment and exact revision count for each selected objective/view.

| View / objective | Count | Before categories | Revised | Finding |
|---|---:|---|---:|---|
| externalities / EXT.1 | 14 | G | 0 | Four sign/channel combinations and private versus third-party effects are already explicit. Retain fast fundamentals. |
| externalities / EXT.2 | 28 | B, C | 2 | Negative production and consumption, private/social intersections and triangular welfare losses are present at Hard. Some Hard records are single lookups and DWL distractors use implausibly different units. |
| externalities / EXT.3 | 16 | B, C, F | 2 | Standards, flexibility, enforcement and imperfect correction are selected. Hard enforcement diagnosis and Elite graph comparison can require more than naming the stated limitation. |
| externalities / EXT.4 | 26 | B, C, F | 3 | Tax wedges, post-policy revenue, DWL and incidence are covered. Preserve strong graph calculation; improve a standalone Hard calculation and selected upper-tier linked welfare/price reasoning. |
| externalities / EXT.5 | 26 | G | 1 | Both production and consumption benefits, underprovision and Hard DWL are present. No missing positive-externality objective; one graph distractor correction is warranted. |
| externalities / EXT.6 | 20 | B, F | 3 | Subsidy direction, wedge, spending and social quantity are covered. Two Hard prompts incorrectly suggest an upper quantity limit will increase underproduction; specify an implementable expansion instrument. Elite can connect receipts to fiscal cost. |
| externalities / EXT.9 | 10 | B, D, F | 4 | Hard graph targets and explicit Coase assumptions exist. Graph Legendary records tagged coase_policy_comparison do not actually compare bargaining with policy. Integrate rights, net gains, distribution and costs. |
| externalities / EXT.7 | 12 | B, C, D, F | 3 | Cap, trades, marginal abatement costs, distribution and monitoring are present. Hard can allocate reductions; Legendary cap subtraction and allocation slogans need constraints and distribution reasoning. |
| externalities / EXT.8 | 8 | B, D, F | 3 | Integration, contracts, norms, capitalization and transaction costs exist. Upper tiers often identify one mechanism or subtract two supplied values. Link capturable benefit, payment feasibility and competing contracts. |
| externalities / LO1.6 | 10 | B, F | 2 | Legacy umbrella objective contains relevant selected fundamentals and support records. Retain simple repair/checkpoints; strengthen selected upper-tier recognition prompts within their existing primary skill. |
| externalities / GE.7.7 | 7 | B, F | 2 | Legacy umbrella objective contains relevant selected fundamentals and support records. Retain simple repair/checkpoints; strengthen selected upper-tier recognition prompts within their existing primary skill. |
| public-goods-and-common-resources / PGCR.7 | 14 | B, C, F | 3 | Cost-benefit, MSB=MC, aggregation and survey limitations exist. Strengthen a Hard policy choice and Legendary overprovision/welfare inference; retain existing marginal comparison Hard records. |
| public-goods-and-common-resources / PGCR.1 | 18 | B, C, F | 2 | Marginal provision and context-dependent rivalry are present. Legendary marginal-cost lookup can become reverse inference from a budget and marginal curves. |
| public-goods-and-common-resources / PGCR.2 | 26 | B, C, F | 3 | All four goods categories and vertical summation are covered. Hard individual-MB lookup and Legendary meal/signal classification are under-demanding. Link multiple dimensions and institutions. |
| public-goods-and-common-resources / PGCR.6 | 16 | B, D, F | 1 | Private provision through donations, sponsorship and procurement is appropriately recognized. Legendary profitability can evaluate alternative funding arrangements without equating revenue and social value. |
| public-goods-and-common-resources / PGCR.5 | 22 | B, C, D, F | 3 | Free riding, strategic reports and graph quantity gaps are covered. Add genuine Hard contribution incentives and selected Legendary financing/benefit aggregation reasoning. |
| public-goods-and-common-resources / PGCR.4 | 14 | B, F | 2 | Rivalry, digital capacity, timber and congestion are covered. An Elite timber definition can connect present extraction, access and future scarcity. |
| public-goods-and-common-resources / PGCR.3 | 14 | B, F | 1 | Access technology and enforcement are covered. Upper-tier login recognition can compare effective exclusion, revenue and lost beneficial access. |
| public-goods-and-common-resources / PGCR.8 | 20 | B, C, D, F | 3 | Commons overuse, groundwater, congestion, race to extract and enforcement are covered. Hard can compare private/social trip margins; Legendary should compare actual access and compliance constraints. |
| public-goods-and-common-resources / PGCR.9 | 16 | G | 0 | Enforceability, dynamic stewardship, community rights, catch shares and practical limits already have appropriate introductory coverage. No numerical or graph expansion is required for its own sake. |
| public-goods-and-common-resources / LO1.6 | 7 | B, F | 0 | Legacy umbrella objective contains relevant selected fundamentals and support records. Retain simple repair/checkpoints; strengthen selected upper-tier recognition prompts within their existing primary skill. |
| public-goods-and-common-resources / GE.7.7 | 9 | B, F | 2 | Legacy umbrella objective contains relevant selected fundamentals and support records. Retain simple repair/checkpoints; strengthen selected upper-tier recognition prompts within their existing primary skill. |
| market-power / LO1.6 | 5 | B, C, F | 2 | Definition, output restriction, entry and natural-monopoly tradeoff exist. Only one ordinary Hard and two Legendary records; revise those to test forgone trades and constrained remedy/incentive comparisons. No full monopoly chapter is imported. |
| market-power / GE.7.7 | 4 | B, C, F | 1 | Definition, output restriction, entry and natural-monopoly tradeoff exist. Only one ordinary Hard and two Legendary records; revise those to test forgone trades and constrained remedy/incentive comparisons. No full monopoly chapter is imported. |

Some inherited objective labels are broader or differently organized than individual graph skills: for example 42192 has objective PGCR.4 (Rivalry) and primarySkill individual_mb_calculation. Those existing labels and commonError fields were preserved as requested; the question still uses shared-quantity benefit evidence. The findings use actual records and skills rather than treating each objective title as an exhaustive content dictionary.

## 8. True coverage gaps

No whole selected objective is absent. The bank already contains all four externality sign/channel combinations, private/social intersections, tax/subsidy logic, cap/trade distinctions, ideal Coase assumptions, public-good aggregation and context-sensitive goods classification. No new question or image was necessary. Absent advanced topics listed in section 3 are scope boundaries. Market Power is intentionally a small supporting view, not a complete market-structure course.

## 9. Robustness findings

Many variants share “identify the curve / read the quantity / state the rule” grammar. The revisions add mechanisms, feasible alternatives and independent constraints: pivotal contributions, payment intervals, enforcement probability, limited low-cost abatement, sponsorship versus exclusion, and alternative real transaction costs. Three sound Hard welfare items (42026, 42036, 42056) retain their stems and keys but replace implausibly different-unit distractors with genuine rectangle/revenue misconceptions.

## 10. Hard calibration

Hard was uneven rather than empty of exam reasoning. Existing graph loss calculations and context-dependent incentives were worth retaining. Revised P52B-MFAIL-H-001 computes private and social gains from a proposed trade; 42122 tests expected enforcement; 42130 selects the actual tax base; 42140 allocates abatement; 42256 tests a pivotal funding decision; 42288 distinguishes private and social congestion costs; P52B-MFAIL-H-003 identifies forgone mutually beneficial trade under market power. None was moved between tiers.

## 11. Graph and integration findings

Graph coverage is already substantial: 147 linked records and 18 approved assets. No missing graph family was established. Selected single-lookups now become policy choices, counterfactual intersections, surplus comparisons and fiscal accounts. The revised 42100 distinguishes the $20 thousand additional welfare gain from the $240 thousand increase in tax revenue. The revised public-good checkpoints distinguish summed willingness to pay, real funding costs and welfare areas. No graph is required for the new institutional prose cases. Existing graph references and eligibility are preserved.

## 12. Upper-tier synthesis

Elite now includes buyer/seller burden versus statutory payment (42066), subsidy budget and prices (42084), a partially corrected private intersection (42096), permit opportunity cost (42141), a contract payment interval (42149), changed cost/beneficiary information (42186/42196), and crowding/internal access institutions (42217/42249).

Legendary now compares common targets under subsidies versus bargains (42086/42095), endogenous revenue and remaining loss (42100), scarce abatement opportunities (42147), benefit capture and costly coordination (42151), alternative contract surpluses (42153), feasible regulation versus bargaining (42159), funding institutions, capacity limits and current access versus future innovation. These are linked choices and inferences, not merely larger arithmetic. The bank still contains some direct high-tier items; this audit is targeted rather than an assertion of uniform mastery-level demand.

## 13. Intentionally unchanged

Retained Easy/Medium stems, keys and feedback; EXT.1 foundational distinctions; strong existing welfare and marginal comparisons; repair/bridge content and routes; PGCR.9 introductory rights/enforcement breadth; 25 unselected parent records; all 148 other concept definitions; every graph’s bytes; source aliases and occurrences; engine/UI, telemetry, classroom access and Worker code. Correct detailed PUBLIC-01/03/04/05 metadata was retained. PUBLIC-02’s detailed description was retained while its alt text was corrected. No external legal doctrine or publisher question was added.

## 14. Existing Hard examples retained

- 42046: derive the $125 omitted-surplus triangle from the gardens graph.
- 42116: distinguish MPB from MSB when consumption harms outsiders.
- 42063/42072/42081/42090: connect corrective wedges with post-policy quantity to calculate revenue or expenditure.
- 42162: evaluate an additional siren from the graph’s marginal benefit and cost.
- 42197/42207: interpret common quantity and vertical benefit summation.
- 42245/42250: distinguish congestion-dependent rivalry from nonrival streaming and scarce physical uses.
- 42304/42306: apply enforceable rights to future stock incentives and groundwater access.

These retain useful ordinary exam mechanisms; they are not all equally demanding. Some remaining Hard recognition records still merit future calibration review.

## 15. Specific revisions and economics

42047 and 42057 correct the idea that a maximum quantity alone induces underprovided output. 42149 and 42153 separate the polluter’s reservation payment from victims’ payment ceiling after real contract costs. 42095 and 42159 compare feasible institutions rather than assuming private bargaining or government policy is universally best. 42274 separates a provider’s financial viability from social benefit; 42285 distinguishes commons overuse from public-good underfunding. The two Market Power Legendary items preserve the selected introductory natural-monopoly and innovation examples while evaluating financing or future incentives. Every exact change and reason is recorded in `changes.json`.

## 16. Numerical, logical and answer-key findings

No incorrect baseline numerical key was established in the reviewed selected graph calculations. The concrete economic defect was the positive-externality quantity-limit wording in two Hard records. Existing DWL distractors in three records had implausible units. Revised permit-cap calculation 42147 explicitly states unregulated emissions and available abatement capacity, removing reliance on an unstated baseline.

All 36 revised numerical or quantitatively evidenced items were independently recomputed from final inputs and visually reconstructed graph endpoints with exact Fraction arithmetic. This includes graph quantities/prices, welfare integrals, tax/subsidy totals, enforcement thresholds, feasible permit allocation, contract intervals, public-good aggregation and funding choices. Final rounding does not rely on hidden source precision. All 48 final option sets were reviewed for one economically correct response; all 362 records pass the separate hash/choice structural check. `numerical-validation.json` and `logical-validation.json` explain the results.

## 17. Accessibility findings

All 18 images were visually inspected and decoded. EXTERNALITY-A descriptions omitted horizontal endpoint coordinates needed to reconstruct the plotted lines. EXTERNALITY-B/D text revealed “socially efficient” outcomes even though the dots carried no such labels. C alt text named optimal policy and its description assigned buyer/seller roles to an unlabeled bracket. PUBLIC-02 alt text named efficient provision.

Corrected descriptions retain visible MPB/MPC/MSB/MSC labels, line geometry, exact coordinates, colored dots, dashed guides and bracket endpoints. They leave the economic inference to the learner. No visually unlabeled curve was renamed by inference; no image bytes changed. Fourteen asset registrations, global/manifest counterparts and 116 question-level copies were synchronized. Thirteen long descriptions and 14 alt texts changed. The 102 metadata-only question records are counted separately from content revisions. Runtime tests verify the new descriptions are actually displayed.

## 18. Mode readiness and review routes

All ten modes retain readiness: Standard Campaign, Timed Trial, Exam Drill, Quiz, Unlimited Practice, Legendary Mode, Score Attack, Trial by Graph, Fading Fortune and Risk & Reward. Trial by Graph has 133 eligible questions: 18 Easy, 45 Medium, 45 Hard, 21 Elite and four Legendary. Fading Fortune and Risk & Reward each retain 325. Readiness and eligibility match BEFORE exactly.

Selected Concept Review routes remain Externalities → MICRO-54, Public Goods and Common Resources → MICRO-55, Market Power → MICRO-56. Their local PDF bytes match registered hashes. The runtime index and evidence/bundle routes are unchanged, with zero selected-resolution errors. Existing global review diagnostics (including unrelated MICRO-03 and integrated-economic-analysis metadata warnings) persist unchanged. Retest/checkpoint behavior uses the unchanged engine/template; content-level repair/bridge maps and boss coverage are exact matches.

## 19. Structural and runtime integrity

Every scoped record has four normalized distinct options, exactly one answer-hash match, a nonempty stem and feedback, and valid asset references/descriptions where applicable. Revised stems are unique across the entire current library. IDs, aliases, source hashes/occurrences, difficulties, objectives, tags, skills, commonError metadata, pool memberships and order remain unchanged apart from allowed content/accessibility fields. The 25 unselected parent records are exact matches.

The focused Microsoft Edge smoke test verifies all 150 changed record payloads, including metadata-only updates, and all 147 graph displays and click-to-enlarge views. The real question renderer shows revised Legendary question 42100 in `browser-smoke.png`. No JavaScript page errors occurred. External requests were blocked. This is a content/runtime smoke test, not an all-mode playthrough or a new production deployment.

Only three production files need synchronization: `data/composer_library.js`, `data/composer_registry.json`, and `data/composer_library_manifest.json`. Shared semantic hashes agree; registry/manifest changes are limited to that hash and relevant asset metadata. `architecture-validation.json` records protected-file and review checks.

## 20. Remaining limitations and quality warnings

The existing quality auditor reports **0 → 0 errors, 59 → 52 warnings, and 64 → 62 review flags**. Both runs cover all 362 resolved questions. Running against raw derived definitions returns zero records, so an explicitly documented audit-only projection uses the current resolver’s selected question objects. It is not a production change or a claim that zero raw findings demonstrate quality.

Remaining final rules: answer-length-outlier (16), possible-difficulty-overstatement (21), possible-difficulty-understatement (1), weak-absolute-distractors (24), graph-prompt-missing-cue (46), repeated-feedback (6). Each baseline and newly appearing question/rule pair has a disposition in `quality-dispositions.json`. Weak-absolute flags increased because some revised alternatives explicitly express the relevant “only,” “all” or “must” misconceptions; this is reported rather than hidden. Some retained feedback repeats, some correct options are longer, graph cue wording is inconsistent, and direct high-tier questions remain.

No claim is made of equal skill frequency in every tier, exhaustive web-wide originality comparison, all-mode gameplay, screen-reader user testing or empirical item-difficulty validation. Source type/objective/skill labels remain historically uneven; they were not silently normalized. Broad inherited fallback route keys and the small market-power pool remain deliberate architecture boundaries. The audit improves representative weak areas while preserving the mature bank’s functioning parts.

## 21. Final semantic library hash and deliverables

Final semantic SHA-256: `72d8c80a2030480938603227f28c90f73788e7b7f3b624d0861aa5e54f0ec370`.

Artifacts are saved under `validation_artifacts/market_failures_advanced_micro_assessment_audit_2026_09_08/`. `inventory-before.json`, `inventory-after.json`, `objective-findings-before.json`, `scope-boundary.json`, `changes.json`, `record-actions.json`, `accounting.json`, and the independent validators provide the complete audit trail. The full private working library copies and generated executable HTML are excluded from delivery. Production edits remain local for inspection.
