# Question-bank audit and targeted update — 19 September 2026

## Executive summary and coverage limit

The canonical faculty corpus contains **9,779 distinct questions**, with 149 concept definitions. The full corpus received deterministic structural and construction screening. **273 questions were revised; 9,506 were left unchanged.** The published IDs and historical source hashes are preserved. Generated Composer banks were checked across all 13 Quick Build presets and their supported-mode reports.

The bank remains generally strong. Confirmed problems cluster around answer construction, missing context, overclassified recognition tasks, and a few substantive economic inconsistencies. The Legendary final-checkpoint completion defect is fixed and reproduced in regression coverage.

**This is not a claim that a fresh manual economic review of every Legendary question has been completed.** All 2120 originally Legendary-tagged records are indexed and screened; targeted editorial/economic review produced the changes below. **291 Legendary length flags remain for faculty review.** They are candidates rather than established defects, and were not suppressed to manufacture a clean result. The requested exhaustive item-by-item manual Legendary sign-off therefore remains outstanding. See legendary-review-index.json and construction-after.json.

## Source-of-truth map

- Canonical current faculty content: build/faculty-build-composer/data/composer_library.js, especially concepts, questions, repairQuestions, repairSeedQuestions, and bridgeQuestions. Earlier assessment reports explicitly identify these as the live authoring records.
- Metadata: embedded registry plus data/composer_registry.json; data/composer_library_manifest.json; data/faculty-outcomes.js and course-area-model.js. Objective, skill, family, role, difficulty and subtopic fields live on the canonical records. Faculty outcome validation checks the current skill partition across all 149 concepts.
- Generation: composer-core.js composes selected canonical modules and derived views into ordinary/challenge/checkpoint/support banks. buildHtml embeds them into the composer-ready template. Student-safe options retain a single SHA-256 answer hash; no plaintext answer field was introduced.
- Assets: data/question-assets, concept assetMetadata, and the library/manifest asset inventory. All registered asset bytes/checksums remain unchanged.
- Quick Builds: PRESETS in composer.js. Legendary, Exam Drill and Trial by Graph use the existing composition/mode eligibility rules; they are not independent editable canonical banks.
- Runtime: template/mastery-quests-faculty-template-composer-ready.html contains boss selection, checkpoint progress, completion, and local telemetry persistence.
- Historical phase authoring snapshots, standalone game banks and private-source paths recorded in sourceOccurrences are provenance for this faculty corpus, not derivatives to overwrite with the present faculty edits. They were not republished. Concept-review PDFs and Econ-nections were not modified.

Baseline: Git c171eca5645e27baef4e36a4eb990bb0b07f61c7; baseline library byte SHA-256 e7c83aff3f0d08252c253b5cec08552ee6f8ac5868a2861c801f9ae2761f9241. The comprehensive regression independently reads this Git object and verifies every recorded before-state, every final record, all unchanged fields, aliases, ID membership, hashes and generated options. revisions.json is the full before/after ledger. The authoring script regenerates the live library and both hash-bearing sidecars from this immutable baseline; its write guard refuses an unrecognized newer library. applied-library-sha256.txt binds the resulting publication.

## Counts

### Changes by original concept

| Category | Questions |
|---|---:|
| aggregate-demand | 3 |
| bank-balance-sheets-reserves-and-capital | 1 |
| binding-price-ceilings | 8 |
| binding-price-floors | 5 |
| capital-flows-and-net-capital-outflow | 1 |
| competitive-markets | 1 |
| consumer-and-producer-surplus | 22 |
| consumer-choice | 1 |
| costs-of-production | 14 |
| demand | 2 |
| elasticity | 8 |
| information-asymmetry-behavioral-and-political-economy | 4 |
| international-trade-and-trade-policy | 12 |
| long-run-aggregate-supply-and-potential-output | 1 |
| market-equilibrium | 1 |
| monopolistic-competition | 64 |
| monopoly | 37 |
| oligopoly | 28 |
| opportunity-cost | 9 |
| perfect-competition | 42 |
| production-possibilities-frontier | 1 |
| short-run-aggregate-supply | 1 |
| stabilization-policy | 1 |
| statutory-versus-economic-tax-incidence | 2 |
| tax-incidence | 4 |

### Changes by original difficulty

| Category | Questions |
|---|---:|
| elite | 5 |
| hard | 31 |
| legendary | 232 |
| medium | 5 |

There are **73 difficulty changes**, listed individually in validation.json. Legendary-tagged records change from 2120 to 2048. Lowering a difficulty was based on direct recognition or ordinary application, not on answer length alone. The 15 competitive-firm cost-shift applications move to Hard; advertising classifications move to Medium, and their qualitative follow-ups to Hard. Strong numerical and multi-stage questions retain their demands.

### Cueing

The dedicated heuristic uses a key of at least eight words and a key/mean-distractor ratio of at least 1.45, plus separate qualification, reasoning-clause and absolute-distractor signals. It does not automatically rewrite options.

- Originally Legendary length flags: 457.
- Remaining Legendary length flags: 291.
- Original length flags cleared by content changes, irrespective of final difficulty: 150.
- Original flags removed from the Legendary count through reclassification only: 16.

Counts distinguish actual construction repairs from tier changes. A longer correct option can be justified; numerical ranges and multi-judgment answers must not be padded or shortened merely to satisfy a ratio. Remaining flags retain their IDs for further review.

## Known playtest cases and economics

- Nine economic-profit calculations move from Opportunity Cost / LO1.2 to Costs of Production / COP.1 / economic_profit. Opportunity cost remains a secondary connection. The bridge question explaining the link between implicit costs and economic profit stays under Opportunity Cost. No skill or concept IDs were invented.
- Marginal comparison remains in Marginal Analysis. The current station-six problem also includes a displaced activity; its multi-stage reasoning is retained. The precise reported before/after revenue item could not be uniquely identified from the playtest description alone.
- PPF C-to-D wording now states the 3-Y benefit assumption naturally, retaining the 18 − 15 = 3 Y calculation.
- The General foundations preset currently selects and exports exactly ten IDs. No current eleven-versus-ten discrepancy was reproduced. The broader General Economics navigation contains additional concepts and is not the same selection as that preset.
- Production/consumption-side deadweight loss replaces distortion-triangle/loss wording. Price-control and tax graph cues are simplified. The exact unlabeled semicolon-coordinate production schedules were not found in the current canonical bank; no artificial table conversions were made.
- Tax/consumer-surplus wording explicitly asks students to derive buyer and seller prices from the original curves; answers distinguish the $9 surplus loss from the $8 buyer tax burden. Producer surplus is asked for as an economic quantity.
- The MC/MP item loses its unnecessary image and asks for maximum marginal product under a constant wage. The MES item correctly describes the single minimum at Q = 60 and moves to Medium. The $28/$17 break-even/shutdown recognition item also moves to Medium.
- Twenty advertising follow-ups regain the concrete action previously present only in a different question. Six cost questions now ask for changes derivable from their stated data instead of unknowable new levels.
- Two competitive-firm boss records had TFC inconsistent with Q × (ATC − AVC): $720 becomes $540, and $770 becomes $440. At P = AVC, the firm is indifferent between operating and shutting down; both lose fixed cost. Supplied output is explicitly identified as the P = rising-MC candidate.
- The claimed combination P = minimum ATC > MC is replaced with a question diagnosing its inconsistency for smooth cost curves.
- The bank-capital item states unchanged liabilities and calculates an 80% capital loss. The multiplier item presents the full decomposition in every alternative: direct $50 billion, multiplied $200 billion, net $160 billion, remaining gap $90 billion.
- Trial by Graph fixed-cost wording now specifies profit-maximizing output. Two new payoff tables replace boss images, and one unnecessary production image is removed. No shared image bytes were changed. The MES record is explicitly marked graph-required; graph eligibility regression uses the exact recorded deltas.
- Exam Drill question number 27 cannot identify a stable record because selection varies by run. The precise item remains unverified without a question ID or run export; no arbitrary record was labelled as that playtest item.


### Legacy objective declarations

The final reference check found 366 records across 18 concepts using retained legacy objective IDs absent from both their module objective lists and labels. The module/registry declarations now include those existing IDs. No question-level code was renamed in this reconciliation, and no new learning-outcome meaning was invented: these declarations retain the legacy code as its label. objective-declarations.json lists each affected concept, code, and record. The comprehensive regression now checks every question’s objective against its current module declarations. This is reference integrity, not a faculty judgment that every historical LO code is an ideal pedagogical label.

## Warden and payoff matrices

The registered pre-audit matrix inventory contains 20 matrices: B/Y is an equilibrium in 18, A/X in four, none have an off-diagonal equilibrium, two have no pure equilibrium, and four have multiple equilibria. These counts overlap. boss-matrix-analysis.json records computed best responses and joint maxima from the registered payoff descriptions.

The protected (11,7), (1,1), (2,2), (7,12) coordination matrix is unchanged and visually checked. Its actual current item is P62I-OLI-LB-002, rather than the farm-equipment item. The revised answer identifies B/Y as the joint maximum, both diagonal equilibria, and the firms’ different preferences. The farm-equipment item currently attaches the no-pure-equilibrium matrix; that question is corrected against its own unchanged asset. The (10,10), (5,14), (14,5), (7,7) matrix was also visually checked and retains its unique B/Y equilibrium.

Two other boss items now contain accessible, fully labelled payoff tables with unique A/Y and B/X equilibria. Each also asks for the distinct joint-payoff maximum. boss-payoff-table-proof.json recomputes their answers from the table cells. Correct-option positions are preserved; answers differ because the new games differ economically.

The selector previously bypassed its diversity scoring when three or more questions matched the diagnosed objective. It now applies that existing scoring within the objective. A regression with three initial Nash candidates plus cooperative/noncooperative alternatives requires three different skills while preserving the objective. This is a soft variety preference, not a guarantee when the available bank lacks variety.

## Final-checkpoint diagnosis

The general victory wrapper acquired phase15CompletionLocked before delegating to handleLegendaryVictory. The Legendary wrapper checked the same lock and returned immediately. Thus the completion action could be reached without displaying Legendary results. It was a double-lock defect, not bank exhaustion or font parsing.

The fix delegates Legendary completion before the general wrapper acquires the lock. run_legendary_final_checkpoint_validation.mjs reproduces the baseline failure and executes the actual checkpoint progress, summary-button and completion-wrapper path: three attempts at room 30 must reach results once. Standard completion and repeated completion calls are also checked. This is a focused VM/runtime regression, not a new end-to-end human browser playthrough. It proves the identified defect but cannot establish that it was the only cause of every reported symptom.

## Storage boundary

Local telemetry is capped at 1,500 records per run, and the anonymous transport queue is capped at 2,000 events. However, different run IDs retain separate localStorage keys, so repeated faculty testing can still accumulate data across runs. No cross-run deletion policy was added: deleting completed-run downloads is a consequential retention change. Cross-run retention/pruning remains a separate maintenance issue.

## Validation

- Whole-corpus quality auditor: 0 → 0 deterministic errors; warnings 2613 → 2596; review signals 1998 → 1927. Warning/review totals are not counts of confirmed defects.
- Structural/answer/provenance checks cover all 9,779 records and all retained aliases. No duplicate IDs within a stored question pool, blank keys, lost IDs, or newly broken generated options were found.
- All asset files are checked against registered hashes, sizes and paths. Preset references and generated-bank parity are checked across 13 presets; faculty outcome coverage checks all 149 concepts and 222 outcomes.
- Known awkward graph-reference, welfare-terminology, decorative-example and short-option/multi-part-stem patterns are absent from the final construction findings.
- Current active suite: **29/29 runners pass**; see active-suite.log. Byte-identical regeneration also passes for the canonical library and both sidecars; see regeneration.json. Historical release validators pinned to superseded 135-concept snapshots were preserved as historical evidence, rather than rewritten or treated as current release tests.
- New coverage: final Legendary checkpoint, within-objective skill variety, payoff-table economic answers, immutable before/after ledger, full-corpus preservation, current student-safe generation, and threshold-specific cueing evidence.

Re-run the active suite with node build/faculty-build-composer/tests/run_active_composer_suite.js. Re-run full screening with node audit_tools/question_quality_auditor.mjs --all --json PATH. The authoring pass is audit_tools/question_bank_review_20260919.mjs; --write regenerates its recorded output only if the live library is still the recognized baseline or this pass’s publication.

## Representative before/after changes

### P62C-CPS-L-025

Before: Refer to the compact-market graph. A $4 tax reduces trade to four units. Using the original curves to find the two tax prices, how much consumer surplus is lost, and how much of that loss is the buyer-burden rectangle on continuing trades?

After: Refer to the graph. A $4 per-unit tax reduces trade to four units. Use the original demand and supply curves to determine the prices paid by buyers and received by sellers. How much consumer surplus is lost, and how much of that loss is buyers’ tax burden on the units still traded?

Reason: Use standard welfare terminology or remove a noninformative graph/scenario label. Explicitly require price derivation and distinguish tax burden from lost surplus. Replace geometry labels with the economic quantities.

### P62E-COP-L-056

Before: A firm’s MC minimum aligns with the maximum slope of which production measure under a constant wage?

After: With a constant wage, marginal cost reaches its minimum when which production measure reaches its maximum?

Reason: Remove an unnecessary graph and correct the marginal-product relationship. Use production and cost concepts as plausible distractors. Reclassify direct recognition or a single area calculation to Medium.

### P62I-OLI-LB-002

Before: Wireless-carrier managers evaluate a rival response. Refer to the payoff matrix. Determine the joint-payoff-maximizing cell, then interpret the individual-versus-joint incentive conflict.

After: Refer to the payoff matrix. Which outcome maximizes total payoff, which outcomes are Nash equilibria, and why might the firms prefer different equilibria?

Reason: Use standard welfare terminology or remove a noninformative graph/scenario label. Keep the (11,7)/(1,1)/(2,2)/(7,12) matrix and test its actual coordination conflict. Make every option answer all three judgments.

### P62E-COP-L-029

Before: Harbor Roasters TFC rises by $120 while Q=47 and variable spending are unchanged. Which result is correct?

After: Harbor Roasters TFC rises by $120 while Q=47 and variable spending are unchanged. How do average costs and marginal cost change? Round per-unit changes to cents.

Reason: Ask for changes that can actually be derived from the stated data; the original new cost levels required missing initial costs. Use calculable cost changes and meaningful fixed-versus-variable errors.

### P62F-PC-LB-012

Before: A competitive firm has P = $24, ATC = $32, AVC = $24, Q = 55, and TFC = $770. Which answer correctly covers the short-run outcome and long-run pressure?

After: A competitive firm has P = $24, ATC = $32, AVC = $24, Q = 55, and TFC = $440. Q is the output where price equals rising marginal cost. Which answer correctly covers the short-run outcome and long-run pressure?

Reason: Give all options comparable economic judgments, including plausible sign, horizon, and cost errors. Correct inconsistent fixed-cost data and recognize indifference at the shutdown price. State why the supplied output is the operating candidate.

### P62H-MCMP-L-062

Before: What is the most defensible immediate implication of the Atlas Coffee action?

After: Atlas Coffee publishes verified wait times and prices. What is the most defensible immediate implication of the Atlas Coffee action?

Reason: Restore the missing case action so a randomly selected item is independently answerable; place the qualitative application at Hard.

## Files inspected and modified

Inspected the canonical library, registry, manifest, asset metadata, selected payoff images, composer.js, composer-core.js, course-area-model.js, faculty-outcomes.js, composer template, anonymous telemetry source, question auditor, active-suite runner, integrity/audit contracts, focused checkpoint/Trial by Graph/outcome validators, and earlier family-assessment reports/staging scripts.

Modified tracked implementation/data files:

- audit_tools/question_quality_auditor.mjs
- build/faculty-build-composer/data/composer_library.js
- build/faculty-build-composer/data/composer_library_manifest.json
- build/faculty-build-composer/data/composer_registry.json
- build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
- build/faculty-build-composer/tests/composer-audit-contracts.js
- build/faculty-build-composer/tests/run_active_composer_suite.js
- build/faculty-build-composer/tests/run_checkpoint_remediation_design_change_validation.mjs
- build/faculty-build-composer/tests/run_question_quality_auditor_validation.mjs
- build/faculty-build-composer/tests/run_trial_by_graph_validation.js

Added audit_tools/question_bank_review_20260919.mjs, the two new test runners, and this validation_artifacts/question_bank_audit_20260919 directory. Generated test smoke files produced during diagnosis were restored; historical fixtures are not newly published builds.

## What was not changed, and remaining work

No wholesale rewrite, arbitrary answer-position balancing, shared graph modification, concept-review PDF edit, telemetry schema change, broad progression rewrite, storage retention rewrite, deployment, or Git commit occurred. Historical source hashes continue to describe historical inputs; the new library checksum describes current content.

The 9,506 unchanged questions were preserved. Full deterministic screening is complete; a fresh manual sign-off on every Legendary record is not. The remaining 291 Legendary length flags, additional qualification/absolute-option signals, and the unidentified playtest record should be reviewed using their stable IDs. These are explicitly retained review work, not hidden passes. Earlier family audit evidence is useful context but does not substitute for a new manual review of every item requested here.
