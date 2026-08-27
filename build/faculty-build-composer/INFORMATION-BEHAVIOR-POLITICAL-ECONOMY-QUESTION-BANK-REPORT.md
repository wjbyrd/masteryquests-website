# Information Asymmetry, Behavioral Economics, and Political Economy Question Bank Production Report

## Production result

- Baseline Composer inventory: 8,771 questions, 130 independently selectable concepts, and 475 registered graph assets.
- Inventory audit: no active standalone concept or canonical record slice covered this combined Principles family. Narrow related legacy records remained in place and were not retagged.
- Taxonomy decision: added `information-asymmetry-behavioral-and-political-economy` as its own faculty-selectable concept, separate from Consumer Choice and Inequality.
- Retained existing records in this concept: 0.
- New and resulting concept count: 180 questions.
- Deterministic ID range: 42880–43059, contiguous with no collisions.
- Resulting full library: 9,271 questions, 133 concepts, and 486 registered assets.

## Coverage

| Objective | Questions | Canonical subtopic |
|---|---:|---|
| IBP.1 Information asymmetry fundamentals | 18 | `information-asymmetry-fundamentals` |
| IBP.2 Adverse selection | 24 | `adverse-selection` |
| IBP.3 Moral hazard | 24 | `moral-hazard` |
| IBP.4 Signaling and screening | 24 | `signaling-and-screening` |
| IBP.5 Behavioral economics fundamentals | 26 | `behavioral-economics-fundamentals` |
| IBP.6 Behavioral biases and applications | 24 | `behavioral-biases-and-applications` |
| IBP.7 Arrow impossibility theorem | 14 | `arrow-impossibility-theorem` |
| IBP.8 Condorcet cycles | 12 | `condorcet-cycles` |
| IBP.9 Median voter theorem | 14 | `median-voter-theorem` |

The bank distinguishes hidden information before contracting from hidden action after contracting; informed-party signaling from less-informed-party screening; and Condorcet cycles from ties. Median-voter questions state or imply the one-dimensional and single-peaked assumptions. Voting examples remain hypothetical and nonpartisan.

## Difficulty, pools, and question forms

- Difficulty: easy 44; medium 68; hard 40; elite 14; legendary 14.
- Pools: easy 38; easyBoss 6; medium 50; mediumBoss 6; hard 34; finalBoss 6; elite 14; legendary 8; legendaryBoss 6; repairQuestions 6; bridgeQuestions 6.
- Question types: application 90; interpretation 39; integration 45; bridge 6.
- Balanced answer positions: 45 / 45 / 45 / 45.

## Graph policy and dependency

Graph-dependent count: 0. Inspection of every supplied incoming asset found only Consumer Choice and Lorenz material. No asset genuinely supported information asymmetry, behavioral economics, Arrow, Condorcet, or median-voter reasoning, so the bank intentionally registers no graph allocation. This is the required graph-dependency result, not a mode-depth defect.

Standalone Trial by Graph is therefore correctly unavailable with `graphSafe: Needs 10; found 0`. The other nine standalone modes pass. When the three new concepts are selected together, Trial by Graph is supported by the 88 graph questions in the Consumer Choice and Inequality banks.

## Publishing and validation

- Author source: `authoring/information_behavioral_political_economy_question_pool_author.mjs`.
- Coordinated publisher: `audit_tools/publish_remaining_principles_micro_question_pools.mjs`.
- Publisher was run twice with identical canonical output; the final no-write run passed with library SHA-256 `7d3856431775c72d86443c7a2358eccb976f2988a34003cfe3c6df3164603218`.
- Targeted validation passed within the coordinated 2,144-check run. It pins the record range and digests; checks answer integrity, objective/subtopic depth, difficulty/pools, reviews, quick starts, uniqueness, copy quality, and zero graph claims; and confirms the expected standalone Trial by Graph rejection.
- Nine applicable standalone mode floors pass, and the coordinated three-concept selection passes all ten modes.
- The active Composer suite passes 21/21.

## Browser QA

The focused build was exercised at 390×844. The mode screen fit without horizontal overflow. Trial by Graph correctly displayed “This game does not contain enough valid questions for Trial by Graph” and reported 0 graph-safe records. Unlimited Practice launched; a nudge item rendered correct explanatory feedback; the next item sampled agenda-setting under a Condorcet cycle. End Practice generated a responsive Mastery Report with accuracy, evidence strength, difficulty counts, concept/question-form/skill/behavior signals, and next moves. The console contained informational diagnostics only, with no warnings or errors.

Complete topical coverage—adverse selection, moral hazard, signaling, screening, behavioral biases, Arrow, Condorcet, and median voter—is pinned by objective counts and validator checks rather than relying on random browser selection alone.

## Representative questions

- 42880: a seller knows quality that a buyer cannot verify before purchase; the answer identifies information asymmetry.
- 42898: people expecting high medical costs select generous insurance before coverage; the answer is adverse selection.
- 42922: insured drivers become less careful after coverage; the answer is moral hazard.
- 42946: an informed high-quality seller voluntarily buys a credible warranty; the answer is signaling.
- 42970 and 42996 apply behavioral economics and the endowment effect without claiming universal irrationality.
- 43020 supplies Arrow's four named conditions and asks for the theorem's constraint.
- 43034 supplies A>B>C, B>C>A, and C>A>B rankings and derives the majority cycle.
- 43046 states single-peaked preferences on one tax-rate line and identifies the median voter's ideal point.

## Files changed and protections

Concept-specific additions are the author source, focused production sample, and this report. No concept-specific graph directory was created. Shared changes are the deterministic library/registry/manifest/review outputs, coordinated publisher/helper, validator, active-suite registration, template mode-label correction for accurate preflight copy, and current release pins in historical validators.

Protected Externalities, Public Goods/Common Resources, Factors of Production/Labor, Market Power, Market Gate, existing graph assets, unrelated website content, recipe schema, existing IDs/answers/taxonomy, adaptive/remediation mechanics, mode floors, and 2,800 ms ordinary feedback timing remain intact. Historical protected-record tests pass.

## Unresolved limitations

No blocking issue remains. This concept intentionally cannot run standalone Trial by Graph because zero relevant assets were supplied; assigning unrelated graphs would violate the production policy. Interactive browser QA sampled representative content, while deterministic validation covered the full 180-record bank.
