# Faculty Build Composer — Question Quality Remediation

**Date:** 2026-08-14  
**Composer:** 4.5p.0  
**Remediation phase:** `phaseQH2-question-quality-remediation-v1`  
**Canonical question count:** 8,163  
**Final library SHA-256:** `e10f63180aac27208eee3570f7c0051a90dc1ec841ca8de5d1d2ac2297773f02`

## Scope

This pass implements the surgical repairs identified by the full question-quality audit. It deliberately avoids broad rewrites of questions that were only heuristic candidates.

The nested stale `faculty-build-composer/faculty-build-composer` copy was **not removed** in this remediation package because the owner indicated it would be deleted separately.

## Repairs completed

### 1. Confirmed calculation defects

Repaired **14 unique Monopoly / Monopolistic Competition calculation questions** identified by the audit.

Changes include:

- corrected displayed-number arithmetic so keyed answers reproduce exactly from the values shown to students;
- corrected two Monopolistic Competition items that called profitable situations “economic loss”;
- corrected two Monopolistic Competition shutdown items whose displayed ATC was below AVC;
- refreshed answer hashes and provenance hashes for every edited record.

Post-repair targeted validation: **60 checks, 0 findings** across the audited Monopoly / Monopolistic Competition calculation families.

### 2. Additional semantic/key defect found during remediation

While reviewing the repetitive Monopolistic Competition checkpoint family, one additional genuine defect was discovered:

- **P62H-MCMP-B2-019** asked which adjustment pressure follows short-run profit, but its keyed answer was “The firm earns zero economic profit,” while its feedback correctly stated that profit attracts entry.

It now asks the same economic question with a clean standalone scenario and correctly keys **Entry**.

### 3. Mechanical wording defects

Repaired all **13** previously identified wording artifacts:

- `3th` → `3rd`;
- `a art print` → `an art print`;
- `the the displayed graph` → `the displayed graph`.

Post-repair scan finds **0** occurrences of those defects in canonical question stems/feedback.

### 4. Exact duplicates / recycled stems

Diversified **16** exact-stem duplicate presentations, including the six exact full-question duplicate pairs.

Post-repair results:

- exact full-question duplicate groups: **0**;
- exact-stem duplicate groups: **0**.

The underlying concepts and correct answers were preserved; integrated-analysis and boss versions were rewritten so valid broad builds no longer surface verbatim recycled prompts.

### 5. Highest-risk distractor cues

The audit identified **18** questions that simultaneously triggered all three warning signals:

- correct answer substantially and uniquely longest;
- extreme option-length spread;
- multiple simplistic/absolute distractors.

All 18 were manually strengthened. Correct answers were preserved; distractors were rewritten to be plausible, comparable in length, and less susceptible to test-wiseness.

Post-repair triple-hit count: **0**.

The broader heuristic flags remain useful as future review candidates, but they are not treated as confirmed defects. Current counts after the targeted cleanup are:

- strong-correct-length cue candidates: 783;
- extreme option-length spread candidates: 205;
- absolute-distractor-pattern candidates: 789.

Those categories overlap heavily and include many sound questions. They were intentionally **not** mass-rewritten.

### 6. Repetitive Monopolistic Competition clone family

Diversified the specific “firm/case 1–6” conceptual clone family called out by the audit:

- 5 repetitive Legendary fixed-cost/exit prompts;
- 12 repetitive boss/checkpoint entry/exit and long-run-condition prompts, including the corrected B2-019 defect.

Numerical parameterized practice was preserved because repeated computation with different values is pedagogically legitimate.

Near-duplicate counts declined from the original audit:

| Similarity threshold | Before | After |
|---|---:|---:|
| ≥ .99 | 49 | 11 |
| ≥ .97 | 61 | 23 |
| ≥ .95 | 96 | 52 |
| ≥ .90 | 236 | 178 |

Remaining near-duplicates are predominantly legitimate parameterized calculation/practice variants or closely related items rather than exact recycled questions.

## Validation results

Fresh post-remediation validation produced:

- canonical questions: **8,163**;
- question occurrences: **8,184**;
- structural issue count: **0**;
- exact full duplicates: **0**;
- exact stem duplicates: **0**;
- triple-hit distractor candidates: **0**;
- physical asset issues: **0**;
- image-linked questions unchanged: **1,103**;
- graph-required questions unchanged: **602**;
- Monopoly / Monopolistic Competition formula checks: **60/60 clean**;
- broader micro formula checks: **98 checks**, with the same known validator-parser false positive on `P62F-PC-C-013` (`-$100` parsed as `+100`). The question itself is correct;
- Monopolistic Competition granularity/composition validator: **PASS**;
- Oligopoly granularity/composition validator: **PASS**.

## Files changed

Production data:

- `data/composer_library.js`
- `data/composer_registry.json`
- `data/composer_library_manifest.json`

Remediation documentation/reproducibility:

- `apply_question_quality_remediation_2026_08_14.py`
- `question_quality_remediation_2026_08_14.json`
- `QUESTION_QUALITY_REMEDIATION_2026-08-14.md`

No Composer engine, scoring, routing, graph asset, Concept Review, mode, or UI code was altered.
