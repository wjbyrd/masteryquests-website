# Firms, Costs & Market Structure assessment audit

Completed for the current Composer preset `micro-firms-markets` — **Firms, Costs & Market Structure**. The final bank retains 2,601 unique records: **90 content revisions, 2,511 unchanged question records, no additions or removals**. Accessibility metadata for 116 used approved assets was corrected; graph bytes and routing remain unchanged.

## 1–6. Current selection, authority and boundary

The live quick start in `build/faculty-build-composer/composer.js` selects exactly the five modules below. `index.html:226` loads `data/composer_library.js`; the authoritative records are its `MQ_COMPOSER_LIBRARY.concepts` objects. `composer-core.js:1048` returns each selected direct module: none of these five has `derivedFromConceptId`. Legacy authoring names in `sourceOccurrences` are provenance, not the runtime editing target. Existing child views can naturally read revised parent records; their definitions and filters were not edited. All 144 other concept definitions are byte-for-byte equivalent as parsed objects.

| Selected concept | Unique before/after | Revised | Unchanged | Objectives |
|---|---:|---:|---:|---|
| costs-of-production | 608 | 8 | 600 | COP.1, COP.2, COP.3, COP.4, COP.5, COP.6 |
| perfect-competition | 565 | 6 | 559 | PC.1, PC.2, PC.3, PC.4, PC.5, PC.6 |
| monopoly | 524 | 20 | 504 | MON.1, MON.2, MON.3, MON.4, MON.5, MON.6 |
| monopolistic-competition | 459 | 37 | 422 | MCMP.1, MCMP.2, MCMP.3, MCMP.4, MCMP.5, MCMP.6 |
| oligopoly | 445 | 19 | 426 | OLI.1, OLI.2, OLI.3, OLI.4, OLI.5, OLI.6 |

The exact 30 objective labels, source identities, skill fields, subtopic IDs and record counts are in `inventory-before.json`, `inventory-after.json` and `objective-findings-before.json`. Module-level `sourceChapters` arrays are empty; record-level sourceChapter/sourceOccurrences identify provenance. No chapter membership was invented.

Natural monopoly, its regulation, first/third-degree discrimination, variety/welfare, dominant strategies, Nash equilibrium and collusion are selected. Tying, resale-price maintenance, second-degree taxonomy, named entry-externality taxonomy and statute-specific antitrust/private-suit doctrine are absent. They were not imported. Incumbent-demand loss and benefits of variety are already selected economic mechanisms and were retained. `scope-boundary.json` maps each requested family to current evidence.

## 7–12. Record, difficulty and pool accounting

| Canonical difficulty | Unique before/after | Content revised |
|---|---:|---:|
| easy | 485 | 0 |
| medium | 490 | 0 |
| hard | 510 | 32 |
| elite | 193 | 6 |
| legendary | 659 | 52 |
| unknown | 264 | 0 |

`unknown` is the existing canonical difficulty of 264 auxiliary records, not newly missing metadata. Easy and Medium are unchanged. All 90 changed question records are content revisions; none is path-only or record-level asset-only. The 116 asset registrations are a separate accessibility-only change category and must not be added to unique-question totals. No asset bytes were added, removed or edited.

Canonical type counts remain: concept 238, application 451, analysis 240, elite 193, legendary 479, calculation 150, checkpoint 291, legendaryBoss 180, repair 188, bridge 191.

| Composed ordinary pool | Count before/after |
|---|---:|
| easy | 332 |
| medium | 336 |
| hard | 411 |
| elite | 193 |
| legendary | 479 |

The source ordinary Hard pools contain 261 records; 150 separate calculation records are merged into composed Hard, yielding 411. Each selected module has 30 calculation records and **zero source-ID overlap** with its ordinary pools; these are not duplicate aliases counted twice. All calculation memberships and composed placements are preserved.

Checkpoints: 96 easyBoss + 96 mediumBoss + 99 finalBoss = 291; Legendary checkpoints = 180. Repairs = 188, repair seeds = 0, bridges = 191. There are 1,751 ordinary records, 471 checkpoint records and 379 repair/bridge records, totaling 2,601. Separate challenge/integration pools are empty in this preset. Ordered memberships and complete route objects are captured in both inventories.

## 13–17. Objective findings and calibration

No entire selected objective required a new pool or record. The important gaps were incomplete standalone records, calculation/graph integration and fragmented upper-tier reasoning. The before-authoring classification for every objective is in `AUDIT_FINDINGS_BEFORE.md` and `objective-findings-before.json`; A–G categories distinguish real gaps from adequate coverage.

| Finding | Action |
|---|---|
| True selected coverage gaps | No whole objective absent; no count growth. Excluded exam topics are boundary differences, not permission to add coverage. |
| Robustness | Removed missing-input dependencies, specified both opponent contingencies and fringe/individual-firm assumptions. |
| Hard calibration | Added realistic classification of receipts/explicit/implicit costs, complete profit applications, market-to-firm transmission and graph chains. Retained strong production, cost and game-matrix reasoning. |
| Upper-tier synthesis | Added competitive entry/exit chains, plant choice, three-way natural-monopoly comparisons and welfare/game-theory inference. |

Independent validation found additional concrete errors after the initial findings: two CR4 answer keys did not sum the displayed bars, and one Legendary checkpoint incorrectly claimed that equilibrium differs from the joint optimum in a matrix where one of two equilibria is the joint maximum. These are recorded as defects in `changes.json`, not retroactively presented as known before authoring.

## 18–25. Economic findings by family

**Production and costs.** COP-H-023 and PMC-COP-H-019 now require classification before computing both profits. COP-EL-002 corrects the sign error: higher accounting profit and lower opportunity cost reinforce, rather than offset, each other. Hard production schedules already require deriving MP; retain them. Cost identities, sunk/avoidable distinctions, LRAC/MES schedules and diminishing returns versus scale are strong. Selected upper tiers now compare actual plant choices and future avoidability.

**Perfect competition.** Retain the existing discrete-output calculations, rising-MC rule, shutdown threshold and loss-but-produce coverage. PC-H-035 links graph output, loss and AVC. PC-H-015 and PM5-PC-H-065 connect market demand/cost shifts to the representative firm. Cost-shock profit effects use explicit magnitudes; they are not claimed universally from the supply shift alone. PC-EL-038, PC-L-056 and PC-L-065 reconstruct the market-supply/price/firm-MR/output/zero-profit adjustment, including reverse inference and exit.

**Monopoly.** MON-H-013 and MON-H-035 perform Q → demand price → ATC → profit/loss. Twelve monopoly Legendary-boss questions had omitted P/Q evidence; their demand and total costs now appear in each independently drawn record, with full-precision calculation. Welfare and barrier questions were retained. MON-H-040 corrects “regulated” to the unregulated outcome actually used. MON-H-005 now distinguishes the plotted positive-profit position from its hypothetical fixed-cost change to zero profit.

**Natural monopoly and regulation.** Selected MON.6 skills legitimately include MC pricing, AC pricing, price caps and regulatory tradeoffs. MON-L-063 compares monopoly, P = MC with financing, and the explicitly higher-output P = ATC solution. MON-L-066 evaluates financial viability and reimbursement incentives; MON-L-096 uses the approved graph to choose a cost-covering rule and infer the support required at the efficient output. No new regulatory doctrine or graph was added.

**Price discrimination.** First and third degrees are present. A revised Hard ticket scenario requires identifiable-group classification, equal marginal cost and enforceable separation. Existing two-market calculations, first-degree welfare and resale prevention remain. No second-degree curriculum or legal discrimination test was imported.

**Monopolistic competition.** Corrected six Hard, ten Legendary and twelve Legendary-boss profit records with missing standalone inputs, plus seven calculation keys that relied on hidden precision. Profit values now use the stated functions or displayed decimals. Hard graph profit, close substitutes, tangency and excess-capacity items are retained. MCMP-L-095 and MCMP-EL-037 connect zero profit, markup, excess capacity, variety and the limits of welfare inference. Excess capacity is not unsold inventory; markup is not profit.

**Oligopoly/game theory.** Hard already includes genuine matrices, no dominant strategy, multiple equilibria and no pure equilibrium. Corrected six unspecified-opponent Legendary prompts. Three ordinary Legendary, two Elite and one Legendary-boss item integrate incentives with joint totals. The independent matrix report includes all pure and interior mixed equilibria for all 20 approved matrices; questions explicitly asking pure equilibria do not omit a required pure solution. No question equates firm profit totals with social welfare.

**Antitrust/business practices.** A concrete common-minimum-bid agreement illustrates the selected antitrust rationale. Similar independent price changes following a common cost shock remain distinguishable from coordinated pricing. Existing predatory-pricing evidence is retained. These distinctions were checked against [FTC price-fixing guidance](https://www.ftc.gov/advice-guidance/competition-guidance/guide-antitrust-laws/dealings-competitors/price-fixing) and [FTC predatory-pricing guidance](https://www.ftc.gov/advice-guidance/competition-guidance/guide-antitrust-laws/single-firm-conduct/predatory-or-below-cost-pricing). HHI uses individual firm shares, consistent with the [FTC/DOJ Merger Guidelines](https://www.ftc.gov/system/files/ftc_gov/pdf/2023_merger_guidelines_final_12.18.2023.pdf). No concentration thresholds or statute-specific claims were added.

## 26–29. Graph use and assessment calibration

All 116 used approved images were visually inspected; all 284 registered dependencies passed byte-hash and decode checks. There are 481 graph-linked question records. Corrected accessibility contracts replace OCR fragments, identify actual curve/point coordinates, separate market-thousands from individual-firm units, and give exact matrix cells. PC-04 now identifies A/B/C/D; COST-03 identifies its total-cost points; cop_average_costs no longer claims an absent MC curve. The 168 unused registered assets were retained and technically validated, not claimed to have received a question-by-question visual review.

Strong existing Hard examples retained include COP-H-003/H-006 production schedules; COP-H-031 and H-036 curve/cost relationships; PMC-COP-H-159/H-161 MES; PC-H-001 through H-010 marginal output and loss; MON-H-034 monopoly/benchmark comparison; MCMP-H-031/H-038 graph profit and excess capacity; OLI-H-009/H-012/H-018 matrices. Easy/Medium fundamentals and short applications were not made into case studies.

The complete final was read, including all tables and eight embedded images. **Q1–25** calibrated Hard classification, marginal changes, cost/firm decisions, graph Q/P/profit and actual payoff-matrix reasoning. **Q26–30** calibrated Elite/Legendary fixed-versus-variable input planning, complete competitive adjustment, regulatory dilemma, variety/welfare tradeoffs and individual-versus-joint incentives. The final’s distinctive firms, values, tables and matrices were not reproduced. A fixed-input production schedule alone was not treated as proof of long-run MES, and a profit-only matrix was not treated as a complete social-welfare measure.

## 30–35. Validation and architecture integrity

- Structural/answer validation: all 2,601 scoped records pass four normalized distinct choices, exactly one hash match, and nonempty content; all revised stems are unique across the complete library.
- Independent numerical validation: 66 revised numerical items pass. Final-stem rational calculations and profit maximization from TR minus TC are independent of authoring functions and source answer hashes.
- Payoff validation: 20 approved matrices and 12 revised matrix items pass best-response, dominance, all-equilibria and joint-total checks.
- Twelve qualitative revisions were reviewed against their explicit assumptions, misconception options and feedback.
- Graph validation: all asset hashes unchanged, all embeddings resolve, graph observations independently checked. No unsupported AVC inference from monopoly plots lacking AVC.
- Originality: no 10-token exam-stem overlap in any revised item; manual context/data review and whole-library exact-stem checks pass. Exam source text/images and answer keys are not delivered.
- Focused Edge browser smoke: all 90 revised payloads match; all 481 graph questions decode, display their description and open the enlarged image. No JavaScript page errors. The screenshot uses the real renderer with a selected revised Legendary item; this is not an all-mode playthrough.
- All IDs, canonical/source difficulties, objectives, tags, primary/secondary/repair skills, common-error metadata, source occurrences, aliases, memberships and order remain unchanged.
- Retest uses easy through room 9, medium through 19, hard through 29, then elite. Existing remediation prioritizes target concept where available, then skill/objective/tag and history-aware fallback. Source template and its routing implementation are unchanged.
- Repair/seed/bridge maps, boss coverage, special-mode memberships and Concept Review runtime routes match the baseline exactly. All 36 selected review codes MICRO-18 through MICRO-53 remain available through existing child coverage. Existing global review diagnostics (including unrelated orphan MICRO-03 and integrated-economic-analysis missing sheet metadata) persist unchanged; selected resolution has zero errors.
- All ten modes pass readiness: Standard, Timed, Exam, Quiz, Unlimited, Legendary, Score, Trial by Graph, Fading Fortune and Risk & Reward. Trial by Graph has 233 eligible records (51 easy, 55 medium, 56 hard, 43 elite, 28 legendary). Fading Fortune and Risk & Reward each retain 1,751 eligible records.
- Only composer_library.js, composer_registry.json and composer_library_manifest.json are synchronized production edits. Their library hashes agree. Engine, UI, telemetry, access control, Managerial, Macro and unrelated Micro definitions are preserved.

## 36. Residual limitations and delivery

Quality-auditor results: **0 → 0 errors; 1251 → 1177 warnings; 582 → 587 review flags**. This is not a zero-warning bank. Every original and new question/rule finding has a disposition in `quality-dispositions.json`. Repeated feedback, template variants, some direct high-tier calculations and some weak distractors remain; their presence is disclosed rather than silently reclassifying difficulty or expanding routing. Many retained graph-linked items remain outside Trial by Graph because eligibility was preserved.

Upper tiers are still uneven: some retained Legendary items ask only a single stage, and the source’s numerical families remain repetitive. The revised full chains establish stronger examples without manufacturing a large rewrite. No selected objective has a zero-count pool, but no claim is made that every skill is equally frequent in every difficulty. Named excluded exam topics remain excluded.

Applied deliverables belong in `validation_artifacts/firms_costs_market_structure_assessment_audit_2026_09_08`. `changes.json` holds exact before/after content; `record-actions.json` accounts for every unique record. Both inventories preserve exact before/after question objects, ordered pools, asset registrations and routes. Validator/authoring scripts accompany the audit for inspection; the private exam extraction and generated HTML are excluded.

No commit, push or deployment was performed.

Final semantic library SHA-256: `0cb44b95ad1e064babf5a3df750864c7dcdbbe9d03c177be31a3671383bc62d4`.
