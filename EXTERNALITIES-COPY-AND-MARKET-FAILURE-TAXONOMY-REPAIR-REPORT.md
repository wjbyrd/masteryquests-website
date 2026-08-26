# Externalities Copy and Market-Failure Taxonomy Repair Report

Date: 2026-08-26  
Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`

## Result

PASS, with one documented content-depth limitation for the newly separated Market Power concept.

The existing 160-question externalities pool was patched in its authoritative author source and republished deterministically. No question was regenerated or added. The broad Market Failures pool was separated into three selectable and independently diagnosable concepts without changing the recipe schema or duplicating registrations.

## Production Baseline and Invariants

- Authoritative source: `build/faculty-build-composer/authoring/externalities_question_pool_author.mjs`
- Publisher: `audit_tools/publish_externalities_question_pool.mjs`
- Externalities ID range: `42000` through `42159`
- New externalities questions: 160 before, 160 after
- Graph-dependent externalities questions: 104 before, 104 after
- Canonical question records: 8,371 before, 8,371 after
- Registered graph assets: 461 before, 461 after
- Composer concepts: 126 before, 129 after
- Composer version: `4.5s.3f` before, `4.5s.3g` after
- Recipe schema: `1.4.0` before and after

The targeted validator pins byte-derived digests for question IDs, answer keys, primary skills, and graph allocations. All four digests remain identical to the committed pre-repair pool. Difficulty, objective, type, scenario, and graph-class distributions also remain unchanged.

## Copy Repair

- Stems revised: 104
- Feedback fields revised: 160
- Answer keys changed: 0
- Economic outcomes changed: 0
- Questions added or removed: 0

Representative repairs:

| Before | After |
| --- | --- |
| `Read the unregulated market quantity from the fast-fashion garments graph.` | `Refer to the graph. At what quantity do MPC and MPB intersect in the unregulated market for fast-fashion garments?` |
| `The private curves intersect at 240 million garments.` | `The unregulated market equilibrium occurs where MPC intersects MPB, at 240 million garments and $12.` |
| `A quantity rule replaces a price instrument. What target matches the efficient disposable vapes outcome?` | `Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what disposable vapes quantity would reproduce the efficient outcome?` |
| `The tax helps but leaves 20 thousand vapes of overconsumption.` | `The $2 tax reduces consumption from 180 thousand to 160 thousand, so it improves efficiency. Because MPC and MSB intersect at 140 thousand, 20 thousand vapes of overconsumption and $20 thousand of residual DWL remain.` |

The repair consistently identifies these economic relationships in feedback:

- Market equilibrium: MPC intersects MPB.
- Negative production externality efficiency: MSC intersects MPB.
- Negative consumption externality efficiency: MPC intersects MSB.
- Positive production externality efficiency: MSC intersects MPB.
- Positive consumption externality efficiency: MPC intersects MSB.

No keyed economic result required correction. The substantive work was explanatory precision: feedback now distinguishes private and social intersections, overproduction from underproduction, revenue from deadweight loss, full from partial internalization, and the mechanism used by taxes, subsidies, standards, permits, and bargaining.

Browser QA found and corrected one additional generated-feedback typo: `corrective corrective tax wedge` is now `corrective tax wedge`. The targeted validator now guards against that duplicated wording.

## Taxonomy Repair

Before:

- `market-failures` was the single selectable and diagnostic concept for externalities, public goods/common resources, general market power, and residual market-failure material.

After:

- `externalities`: 177 records (160 new production records plus 17 pre-existing records)
- `public-goods-and-common-resources`: 16 pre-existing records
- `market-power`: 9 pre-existing records
- `market-failures`: 25 residual compatibility records for general/asymmetric-information material

Every reassigned record has exactly one child subtopic. No record is assigned to multiple child concepts, no record was lost, and the physical canonical record remains registered once under the existing family storage model.

The broad `market-failures` registry record is now `legacy` with selection role `legacy-parent`. It is not a competing faculty selection and is non-diagnostic in Mastery Reports. The three child concepts are active selections and have separate concept-review/reporting signals. The existing `MICRO-03` Market Failures review remains the shared organizational review mapped to those child concepts.

## Legacy Recipes

The established `migrateRecipe` path maps a legacy `market-failures` selection to:

1. `externalities`
2. `public-goods-and-common-resources`
3. `market-power`
4. hidden `market-failures` compatibility parent

The parent is placed last so child-tagged records win ID deduplication and retain separate reporting signals, while the hidden parent contributes only the 25 residual records. The validation exception applies only to a registry parent whose status is `legacy`; ordinary faculty-authored parent/child conflicts remain invalid. The recipe schema stays at `1.4.0`.

The existing portable `market-foundations.json` recipe composes after migration with no errors. Standard, Timed, Exam, Legendary, and Score modes all pass their existing floors.

## Publishing

The publisher owns and regenerated these Composer outputs:

- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`
- `build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json`

Publisher result after the final copy fix:

- Source version: `Externalities-2026.08.26-copy-taxonomy-repair-v2`
- Library SHA-256: `7ad1dbf3a3a5b0f546da28203dafb4fe8b20a50639e1b2e50fd279f377c8e57d`
- A second publisher run reported `PASS` and the same SHA-256; the generated outputs were byte-identical.

All 13 externality WebPs retain their committed sizes, `1720x1200` dimensions, and pinned SHA-256 hashes. No binary asset was modified.

## Validation

Commands run:

```text
node --check build/faculty-build-composer/authoring/externalities_question_pool_author.mjs
node --check audit_tools/publish_externalities_question_pool.mjs
node --check build/faculty-build-composer/composer-core.js
node --check build/faculty-build-composer/course-area-model.js
node --check build/faculty-build-composer/tests/run_externalities_copy_taxonomy_repair_validation.mjs
node audit_tools/publish_externalities_question_pool.mjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
git diff --check
```

Results:

- Syntax checks: PASS
- Deterministic publisher check: PASS
- Existing externalities production validator: PASS
- New copy/taxonomy validator: PASS
- Active Composer suite: 18/18 PASS
- Inline-script compilation for all three focused builds: PASS
- Answer verification: PASS
- Missing/duplicate concept and question checks: PASS
- Quick-start concept reference check: PASS
- Legacy portable recipe migration and composition: PASS
- `git diff --check`: PASS (Git emitted only existing LF-to-CRLF working-copy notices)

## Browser QA

Browser-level QA used generated focused builds on desktop (`1280x720`) and mobile (`390x844`). No horizontal overflow or console warnings/errors were observed.

Externalities:

- Independent title, mode menu, question bank, and Mastery Report signal: PASS
- Negative production, negative consumption, positive production, and positive consumption: PASS
- Graph classes A, B, C, and D: PASS
- Market-outcome and efficient-outcome intersections: PASS
- Quantity gaps, corrective tax, producer subsidy, price wedge, tax revenue, and Coase bargaining: PASS
- Imperfect $2 vaping tax, residual overconsumption, and residual DWL: PASS
- Rendered explanatory feedback: PASS
- Correct-answer and wrong-answer flows: PASS
- Adaptive next step after a miss: PASS
- Graph enlargement and accessible graph description: PASS
- End Practice and fresh Mastery Report: PASS
- Desktop/mobile overflow: PASS

Public Goods and Common Resources:

- Independent selection and title: PASS
- Focused Fading Fortune build launched with 10 eligible questions: PASS
- Rendered public-good content contained no Externalities or Market Power leakage: PASS
- Mobile overflow and console: PASS

Market Power:

- Independent selection, title, and isolated generated bank: PASS
- The existing pool is too thin for a valid standalone mode: EXPECTED LIMITATION
- Browser result for Unlimited Practice: mode unavailable (`easy 2/6`, `medium 2/6`, `hard 1/6`, `bridge 0/1`)

## Unresolved Faculty Decision

Market Power has nine existing assigned records, eight of which count as ordinary evidence in the targeted depth audit. It is below every standalone mode floor and lacks bridge depth. This repair was explicitly prohibited from adding questions, remediation, or engine exceptions, so no content was fabricated and no floor was weakened.

A future authorized content phase must either expand general Market Power to engine-safe depth or decide that the concept should remain separately reportable but not exposed for standalone quest generation. Legacy broad Market Failures recipes remain fully usable in the meantime.

## Files Changed

- `EXTERNALITIES-COPY-AND-MARKET-FAILURE-TAXONOMY-REPAIR-REPORT.md`
- `audit_tools/publish_externalities_question_pool.mjs`
- `build/faculty-build-composer/authoring/externalities_question_pool_author.mjs`
- `build/faculty-build-composer/composer-core.js`
- `build/faculty-build-composer/course-area-model.js`
- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`
- `build/faculty-build-composer/data/concept-reviews/full-library-production/concept_review_source.json`
- `build/faculty-build-composer/data/concept-reviews/manifest.json`
- `build/faculty-build-composer/tests/run_active_composer_suite.js`
- `build/faculty-build-composer/tests/run_externalities_copy_taxonomy_repair_validation.mjs`
- `build/faculty-build-composer/tests/run_externalities_question_pool_validation.mjs`
- `build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js`
- `build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js`
- `build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs`

## Intentionally Unchanged

- All 13 externality WebP files
- Runtime Market Gate question banks
- Existing answer keys and question IDs
- Question difficulty, objective, type, primary-skill, graph, and scenario allocations
- Adaptive/remediation engine rules and mode floors
- Quick starts (none referenced `market-failures`)
- Recipe schema files
- Unrelated questions, runtime games, and website pages

No commit was created.
