# Cost Directive assessment audit before revision

Audit date: 2026-09-06. Scope: the canonical repository's Cost Directive only. Source assessment: Exam 1.docx, 25 questions, 4 points each. No exam answer key or verbatim question content is included here.

## Assessment blueprint

Questions 1–5 emphasize rational choice, measurable incentives, organizational information and decision rights, and diagnosis of a poor business outcome. Demand ranges from recognition to selecting a useful investigation. Questions 6–10 address transactions, buyer/seller gains, controls and taxation through stated values and quantities. They require distinguishing transfers from gains, calculating a numerical quantity gap, attributing a price change, and evaluating whether exchange remains attractive. Graphs are not prerequisites.

Questions 11–17 shift toward reconstructing cost information, selecting explicit versus implicit costs, classifying scenario expenses, identifying overlooked costs, and recovering incremental cost from a schedule. Three actual Word tables occur in the exam (questions 11, 17 and 18). Question 18 uses an activity schedule for an extent decision; questions 19–20 integrate compensation or incremental production with the relevant marginal rule. Questions 21–25 distinguish experience, joint production, all-input scale changes, fixed-input congestion, and sources of scale economies.

The characteristic calculation is usually short once the student has selected the right inputs or rule. Cognitive demand is mostly recall/understand and apply, with some analyze-level diagnosis and multistep schedule interpretation. It is not uniformly a high-difficulty exam: later conceptual questions return to recognition. Hard should contain ordinary exam-style application regularly; Elite should add reconstruction and linked decisions; Legendary should require synthesis or reverse reasoning beyond the usual item.

Distractor models include omitted implicit costs, total versus marginal cost, fixed costs inside AVC, sunk spending, average-cost decision rules, reversed quantity gaps, full tax versus buyer burden, and confusing experience, scope, scale and fixed-input returns. Some source distractors are weak. Several source items also have underspecified assumptions (labor commitments, tax bases/indifference, a tied activity optimum, and learning-rate terminology). These are limitations to correct, not conventions to reproduce. New content must specify those assumptions.

## Baseline inventory and architecture

807 records: 591 main/boss records and 216 remediation records. Main tiers: Easy 90, Medium 90, Hard 90, Elite 90, Legendary 90, Legendary Boss 90, Easy Boss 18, Medium Boss 12, Final Boss 21. All 27 objectives have 4 repair and 4 bridge records. Objective coverage is already broad; no new objective is warranted.

The live page loads cost_directive_question_bank_student.js. Three declarations hold the main, repair and bridge maps. Answers use normalized SHA-256 option hashes. The file warns that it was generated from a private faculty source. Repository and nearby filename searches did not locate that source or its publisher. A reproducible patch must therefore accompany changes to the published bank, with original-record fingerprints so changed upstream records cause an explicit conflict.

## Coverage gaps versus robustness gaps

True skill coverage gaps: numerical price floors with explicit quantities (LO2.2); consumer/seller tax burden and government revenue (LO2.2); reconstructing missing cost-table cells and then deriving marginal costs (LO3.3, LO4.2). Numerical ceilings are materially underrepresented: one item in Legendary Boss, none in the ordinary main tiers. Taxes eliminating positive private gains have one Legendary Boss item, with an ambiguous threshold. These fit existing trade/barrier objectives and do not require new tags or graphs.

Robustness gaps: all five LO1 objectives rely heavily on clearly signposted diagnoses and implausible policies. LO2.1 and LO2.3–LO2.5 repeatedly ask for a direct value-minus-cost calculation or recognition of higher-valued use. LO3.1–LO3.6 broadly cover opportunity, relevance, fixed/variable costs, profit and fallacies, but upper tiers repeatedly name the operation and provide pre-totaled costs. LO4.1–LO4.4 cover averages, marginal calculations, extent and pay incentives, but supply too many direct MR/MC inputs, isolated two-row changes, or generic compensation recognition. LO7.1–LO7.7 cover the correct distinctions, yet upper-tier work often remains a single label, subtraction, or ratio.

Hard already has useful relevant-cost and opportunity-cost applications (for example IDs 230, 237, 250), AC/MC comparisons (256, 262), and interval decisions (264, 270). Retain strong examples selectively. Easy and Medium mostly suit their intended roles. A few hidden-cost scenarios closely resemble the assessment context and should be replaced with different mechanisms, not renamed businesses. The inaccurate premise in Legendary 9051 also requires repair.

## Difficulty and question-type findings

Recorded types, not an independent cognitive-demand measure: Hard has 29 application, 29 calculation, 14 trap, 13 identification, 4 interpretation, 1 multi-step. Elite has 21 application, 19 calculation, 17 trap, 15 integration, 10 interpretation, 7 identification, 1 multi-step. Legendary has 24 trap, 18 calculation, 16 application, 14 integration, 9 interpretation, 6 multi-step, 3 identification. These labels overstate the actual progression: an integration tag often accompanies a one-concept recognition item.

Current tables are generally described as totals in a sentence; there are no incomplete tables to reconstruct. Calculations become somewhat more contextual in Hard, but Elite and Legendary frequently return to direct formula substitution. Cross-concept work exists, especially sunk costs plus opportunity cost and incentive effects, but is not consistently harder. Legendary Boss also contains elementary definitions/calculations and needs selective synthesis upgrades. Boss pools remain separately identified rather than being counted as additional ordinary Legendary items.

## Implementation decisions

Revise existing records rather than inflate counts. Preserve exact property sets, IDs, objective/tag/skill identities, types, difficulty and all other selection metadata. Change only stem, options, answer hash and feedback. Preserve all repair and bridge records. Use compact semantic HTML tables inside the existing question string. No supply/demand graphs, new graph eligibility, UI, engine, access-control, telemetry, other-game or course-sequence changes.

Numeric verification will include independent arithmetic expressions with expected results for every revised numerical item; option hashes must match exactly one distinct choice. Qualitative review must assess the full stem, alternatives and explanation, and guard against evidence being treated as proof of causation. Validate identity/routing preservation and actual engine loading/retest compatibility separately from content quality. Empirical difficulty remains a judgment until student performance data are available.
