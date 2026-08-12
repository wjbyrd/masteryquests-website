Mastery Quests Faculty Concept Composer — Micro Granularity Working Release

Public deployment folder. Replace the contents of build/faculty-build-composer with these files.
The public route remains /build/faculty-build-composer/.

Current composer version: 4.5s.2m
Canonical questions: 8,163
Selectable concepts/family slices: 126
Question assets: 427



Latest upgrade — Mode 10: Risk & Reward
- Adds Risk & Reward as the tenth game mode.
- Every run starts with a 1,000-point bankroll. Learners wager 10%, 25%, 50%, or ALL IN before the next question is revealed.
- Questions, graphs, hints, answer choices, and difficulty information remain hidden until the wager is locked.
- Payout is deliberately simple: correct answers add the wager 1:1; incorrect answers subtract it 1:1. Wagers use integer points with a one-point minimum.
- An ALL IN loss to zero ends the run immediately as a legitimate bust outcome; accumulated mastery evidence remains available in Mastery Report 2.0.
- Learners can choose 10, 15, or 20 questions when the selected concept mix has enough unique ordinary practice inventory.
- Mastery Report 2.0 adds a Risk & Confidence section showing wager distribution, wager-tier accuracy, peak/final bankroll, largest wager, and All-In attempts while keeping mastery judgments separate from risk behavior.
- Telemetry records bankroll before/after, wager amount/ratio/tier, All-In status, run outcome, peak bankroll, and wager distribution.
- No bosses, artifacts, checkpoints, Repair/Bridge detours, setbacks, realm progress, or save/resume are used in this mode.
- The Composer now exposes and validates all ten game modes.

Latest upgrade — Mode 9: Fading Fortune
- Adds Fading Fortune as the ninth game mode.
- Every question begins worth 100 points; incorrect choices fade one at a time and reduce the live value to 75, 50, then 25 points. The correct answer never fades.
- Difficulty-based fade intervals are centralized at Easy 8s, Medium 10s, Hard 12s, Elite 15s, and Legendary 18s.
- Learners can choose 10, 15, or 20 questions when the selected concept mix has enough unique four-choice practice inventory.
- Graph lightbox, browser visibility, game modal, rapid-guess lockout, and answer verification pause the fade clock without resetting the current interval.
- Correct answers earn the frozen live question value; incorrect answers earn zero. Accuracy and mastery remain separate from the Fading Fortune score.
- Mastery Report 2.0 adds an Independence Under Pressure section showing the 100/75/50/25 answer distribution and average question value.
- Telemetry records question value, fade count, interval, paused duration, run score, maximum score, average value, and fade distribution.
- No bosses, artifacts, checkpoints, Repair/Bridge detours, setbacks, realm progress, or save/resume are used in this mode.
- Existing eight modes remain available for regression validation.

Latest upgrade — Mode 8: Trial by Graph
- Adds Trial by Graph as the eighth game mode.
- Uses only audited questions explicitly marked graphRequired and backed by a real graph asset.
- 602 audited records carry the graphRequired flag; 10 audited records without an image reference are deliberately excluded.
- Composer readiness requires at least 10 graph-safe ordinary questions.
- Learners can choose 10, 15, or 20 questions only when the selected concept mix has enough unique graph-safe inventory.
- Trial by Graph uses a prebuilt unique deck, difficulty-aware progression, existing graph rendering/lightbox/accessibility metadata, normal telemetry, results, and Mastery Report 2.0.
- No checkpoints, artifacts, campaign progress, setbacks, save/resume, Repair detours, or Bridge detours are used in this mode.
- Existing seven modes remain available and were regression-validated.

Latest upgrade — Mastery Report 2.0 + practice early-end report fix
- Adds evidence-strength labels: Limited Evidence, Developing Evidence, Strong Evidence, and Mastery Demonstrated.
- Evidence strength now considers scored-attempt volume and recorded difficulty exposure; accuracy alone cannot produce a mastery claim.
- Mastery rows show their own evidence label and hardest recorded evidence level.
- Exam Drill and Unlimited Practice now route both End Practice and the Battle Menu exit through Confirm → Mastery Report.
- Early Exam Drill exits still do not award the Exam Drill completion flag.
- Canonical questions and question assets are unchanged.

Latest upgrade — Phase Micro8: Oligopoly granularity + adaptive maturation
- Oligopoly now exposes six instructor-facing child selectors while preserving the full parent family.
- Added exactly 75 measured adaptive questions: 20 Easy, 21 Medium, 13 Hard, 10 Repair, and 11 Bridge.
- Parent family: 445 canonical questions after backfill.
- The higher-end repeated-game / credibility / entry-deterrence material is isolated in an optional supporting/advanced child; it is not required for a conventional Principles Oligopoly build.
- All six child selectors meet their assigned adaptive-depth/support floors and clear the planned 15-question Quiz threshold.
- Existing 123 graph-linked questions across 42 Oligopoly assets are unchanged.
- Elasticity, Surplus, Trade, Costs, Perfect Competition, Monopoly, and Monopolistic Competition granular families remain intact.

PHASE MICRO1 — ELASTICITY GRANULARITY PILOT
-------------------------------------------
The full Elasticity family remains selectable. Microeconomics now also exposes six child selectors: Price Elasticity of Demand, Price Elasticity of Supply, Income Elasticity of Demand, Cross-Price Elasticity of Demand, Elasticity and Total Revenue, and Applications of Elasticity.

The child selectors filter the same canonical Elasticity bank; they do not duplicate question records. Parent and child Elasticity selectors are mutually exclusive. Income and Cross-Price Elasticity are intentionally treated as supporting subtopics and are best combined with related Elasticity selections rather than padded to artificial standalone depth.

PHASE MICRO2 — CONSUMER & PRODUCER SURPLUS GRANULARITY
-----------------------------------------------------
The full Consumer and Producer Surplus family remains selectable. Microeconomics now also exposes six child selectors: Consumer Surplus & Willingness to Pay, Producer Surplus & Willingness to Accept, Total Surplus & Gains from Exchange, Efficient Quantity & Allocation, Changes in Surplus & Policy Effects, and Efficiency, Equity & Limits of Surplus Analysis.

The child selectors filter the same canonical 370-record Surplus bank; they do not duplicate question records. Parent and child Surplus selectors are mutually exclusive. Changes/Policy Effects and Efficiency/Equity/Limits are intentionally treated as supporting subtopics rather than padded to artificial standalone depth.

PHASE MICRO3 — INTERNATIONAL TRADE GRANULARITY
----------------------------------------------
The full International Trade and Trade Policy family remains selectable. Microeconomics now also exposes six child selectors: World Prices & Importer/Exporter Status; Domestic Production, Consumption & Trade Quantities; Gains from Trade, Surplus & Winners/Losers; Tariffs, Revenue & Deadweight Loss; Import Quotas, Quota Rents & Tariff–Quota Comparison; and Trade-Policy Arguments, Efficiency & Distribution.

The child selectors filter the same canonical 426-record Trade bank using the published ITP.1–ITP.6 objective metadata; they do not duplicate question records. Parent and child Trade selectors are mutually exclusive. World-price/status and trade-policy arguments are intentionally treated as supporting/targeted subtopics rather than padded to artificial full-campaign depth. All six already exceed the planned 15-question Quiz ceiling using non-Legendary practice/calculation material.

PHASE MICRO4 — COSTS OF PRODUCTION GRANULARITY + ADAPTIVE MATURATION
------------------------------------------------------------------
Ten Costs subtopics are exposed. The family contains 608 canonical records after the measured adaptive retrofit.

PHASE MICRO5 — PERFECT COMPETITION GRANULARITY + ADAPTIVE MATURATION
--------------------------------------------------------------------
Eight Perfect Competition subtopics are exposed. The family contains 565 canonical records after the measured adaptive retrofit.

PHASE MICRO6 — MONOPOLY GRANULARITY + ADAPTIVE MATURATION
---------------------------------------------------------
Seven Monopoly subtopics are exposed. The family contains 524 canonical records after the measured adaptive retrofit.

PHASE MICRO7 — MONOPOLISTIC COMPETITION GRANULARITY + ADAPTIVE MATURATION
--------------------------------------------------------------------------
Five Monopolistic Competition subtopics are exposed: Market Structure & Product Differentiation; Short-Run Firm Choice, Profit/Loss & Shutdown; Entry, Exit & Long-Run Equilibrium; Advertising, Branding & Nonprice Competition; and Product Variety, Efficiency & Model Limits.

The family contains 459 canonical records after exactly 47 targeted adaptive additions. Parent/child selection remains hierarchical, all children clear the planned 15-question Quiz threshold, and the existing graph inventory is preserved.
PHASE MICRO8 — OLIGOPOLY GRANULARITY + ADAPTIVE MATURATION
-----------------------------------------------------------
Six Oligopoly subtopics are exposed: Oligopoly Structure, Strategic Interdependence & Concentration; Game Theory Foundations: Payoff Matrices, Best Responses & Nash Equilibrium; Collusion, Cartels & Prisoner’s-Dilemma Incentives; Dynamic Strategy: Repeated Games, Credibility & Entry Deterrence; Tacit Coordination, Price Leadership & Nonprice Competition; and Oligopoly Welfare, Mergers & Antitrust Tradeoffs.

The family contains 445 canonical records after exactly 75 targeted adaptive additions. Dynamic Strategy is intentionally marked optional supporting/advanced so instructors can select ordinary Principles game theory without importing infinite-horizon repeated-game or backward-induction material. All six children clear the planned 15-question Quiz threshold, the five-child Oligopoly core passes the established mode set without Dynamic Strategy, and the existing graph inventory is preserved.


Quiz Mode: fixed-length 1–15 question classroom mode. Faculty selects concepts in the composer; learners select only quiz length. Quiz uses Easy/Medium/Hard adaptive selection without checkpoints, campaign progress, setbacks, or remediation detours.
