# Concept Review faculty review summary

## Scope

151 current Concept Review candidates: 26 GEN-ECON, 68 MICRO, 57 MACRO. All 151 received a first-pass review of outcome, core explanation, recognition cues, Watch Out, worked example, self-check, and graph/table utility. Review combined extracted candidate text, current canonical text, semantic descriptions, and visual inspection of existing validation page renders, assembled into contact sheets. Selected concern figures were inspected at full-page resolution. No PDFs were generated or re-rendered. No OCR was used.

PASS means no specific concern found in this first pass, not proof of correctness or owner approval. QUESTION records an ambiguity or issue needing faculty judgment; FAIL records a specific contradiction. Technical acceptance is separate from instructional approval. A key-relationships bullet card is not counted as a table. All 151 existing candidates are one page; this audit does not replace full-size owner reading or human AT testing. Several maintained-layout macro sheets use visibly smaller type than older layouts; owner should judge comfort at normal viewing/print size even where technical evidence passes.

## Candidate Resolution

Selected by active resource ID and accepted SHA-256 using `validation_artifacts/pdf_accessibility/micro49_unique_nash_v2/final_validation.json`, `staged_gate.json`, `installation_preview.json` and `review_receipt.json`. Per-resource source/semantic hashes, raw PDF/UA-1 validator evidence and deterministic-rebuild hashes were checked against current files. This reuses maintained evidence, not a new 151-resource audit or rebuild. Latest applicable report is recorded per manifest row. No timestamp/alphabetical selection or production fallback was used.

151/151 review hashes equal staged source hashes. MICRO-49 is the V2 unique-Nash candidate, SHA-256 `512ee726f9d7f4383f2534f4816b9a8b7276f4b563689a4ed7ba32d53de1cd17`. Visible and semantic matrices show (9,9), (2,3), (3,2), (1,1); prose establishes A and X as strictly dominant and (A,X) unique. The prior (7,7) candidate was not copied.

## Known Owner Findings

- **MICRO-49** — OWNER: original matrix had multiple equilibria, too complex for intended example. Use A/X (9,9), A/Y (2,3), B/X (3,2), B/Y (1,1): A and X strictly dominant; (A,X) unique Nash equilibrium. Correct V2 packaged and verified. **Status:** CORRECTED V2 VERIFIED — OWNER APPROVAL PENDING.
- **MACRO-11** — OWNER: remove production-function graph; worked example should focus directly on productivity measurement. Current candidate has not incorporated this change. **Status:** OWNER-IDENTIFIED FIX PENDING.
- **MACRO-12** — OWNER: KEEP production-function graph here; capital deepening and diminishing returns belong here. Review sequence with 11 and 13. **Status:** OWNER DIRECTION — RETAIN GRAPH; APPROVAL PENDING.
- **MACRO-13** — OWNER: remove production-function graph; worked example should focus on evaluating long-run growth policy. Current candidate has not incorporated this change. **Status:** OWNER-IDENTIFIED FIX PENDING.
- **MACRO-16** — OWNER: graph should show Wage vertical, Quantity of labor horizontal, upward Labor Supply, downward Labor Demand, equilibrium, binding minimum wage above equilibrium, QD=90, QS=120, surplus=30 workers. Not implemented. **Status:** OWNER-IDENTIFIED VISUAL IMPROVEMENT PENDING.
- **MACRO-20** — OWNER: genuine before/after $25 loan-loss balance sheet: reserves 120/120; loans 780/755; securities 100/100; total assets 1000/975; deposits 900/900; borrowing 40/40; total liabilities 940/940; capital 60/35. Reinforce 1000=940+60 and 975=940+35. Not implemented. **Status:** OWNER-IDENTIFIED TABLE IMPROVEMENT PENDING.
- **MICRO-09** — OWNER: DO NOT add another tax-incidence graph. Keep transfer/application role; GEN-ECON-21 and GEN-ECON-22 already provide graphical treatment. **Status:** OWNER-REVIEWED — GRAPH INTENTIONALLY NOT ADDED.
- **GEN-ECON-21** — OWNER: provides graphical tax treatment with GEN-ECON-22; review both with MICRO-09 for redundancy. Do not duplicate graph on MICRO-09. **Status:** OWNER APPROVAL PENDING.
- **GEN-ECON-22** — OWNER: provides graphical tax treatment with GEN-ECON-21; review both with MICRO-09 for redundancy. Do not duplicate graph on MICRO-09. **Status:** OWNER APPROVAL PENDING.

These are owner decisions/findings, not new Codex proposals. No pending fix was applied. MICRO-52 also carries a prior owner-adjudicated graph context in existing evidence; the new visual discrepancy below is recorded for review, not automatically corrected.

## New Codex Findings

### Content and calculation concerns

- **[GEN-ECON-02](GEN-ECON/GEN-ECON-02.pdf)** — Core refers to a fee, higher wage and toll without introducing those examples. The $10 trip conclusion assumes other trip costs do not reverse the decision.
- **[MICRO-02](MICRO/MICRO-02.pdf)** — Worked $6 x 80=$480 is correct. Watch Out abruptly uses $46/$34 and 420 units from an unexplained different case.
- **[MICRO-07](MICRO/MICRO-07.pdf)** — Worked heading says IDENTIFYING SUBSTITUTES, but -0.7 and printers/ink correctly identify complements. Self-check implies a 5% fall.
- **[MICRO-12](MICRO/MICRO-12.pdf)** — CS $64 + PS $32 = $96; trade at value $17/cost $22 should not occur. Watch Out uses unrelated $10/$8 values without a setup.
- **[MICRO-13](MICRO/MICRO-13.pdf)** — Graph cutoff 8 and discrete self-check cutoff 3 units are correct. Watch Out inserts unexplained $23/$29 values; self-check refers to absent statements.
- **[MICRO-15](MICRO/MICRO-15.pdf)** — Worked policy totals $500/$520 are correct. Watch Out reuses Policy A/B with different $150/$140 figures and unexplained external costs.
- **[MICRO-16](MICRO/MICRO-16.pdf)** — Correct exports=250-100=150 thousand, but heading says CALCULATING IMPORTS. Watch Out discusses a tariff and unexplained $144 DWL absent from the graph.
- **[MICRO-22](MICRO/MICRO-22.pdf)** — Worked AFC=$8 is correct; self-check implies FC about $299.86 with rounding. Watch Out combines two different unlabeled cost cases.
- **[MICRO-32](MICRO/MICRO-32.pdf)** — Worked text says point B is about 33 units; graph/accessible description place it near 36. Heading promises a supply shift but only movement along MC is shown.
- **[MICRO-38](MICRO/MICRO-38.pdf)** — Q=40 from MR=MC then P=$40 from demand is correct. General wording unnecessarily requires rising MC, excluding valid constant-MC monopoly cases.
- **[MICRO-48](MICRO/MICRO-48.pdf)** — HHI 2,774 squares the 9% "Other" aggregate as if it were one firm. Without individual fringe shares, exact HHI is not established; 2,774 is an upper bound.
- **[MICRO-51](MICRO/MICRO-51.pdf)** — Backward induction 7>3 and 6>0 is correct. Core inserts unexplained PV 12.50/16.25 and net-gain figures; predation self-check does not retrieve tree reasoning.
- **[MICRO-52](MICRO/MICRO-52.pdf)** — Prior owner-accepted context retained. At Q near 20 the plotted MR branches end near 10 and 32, while MC is near 36, above both. This does not visually support the stated MC-within-gap price-rigidity explanation. Demand is steeper left/flatter right; review kink optimality too.
- **[MACRO-18](MACRO/MACRO-18.pdf)** — 800 + 1200 + 1500 = 3500 under the stated post-2020 definition; older-definition 2000 is clearly distinguished. Watch Out references an unspecified transfer direction.
- **[MACRO-26](MACRO/MACRO-26.pdf)** — 9 - 3 = 6% approximate expected and 9 - 10 = -1% realized real return. Expected return should also be labeled approximate. Menu/shoeleather definitions are repeated several times.
- **[MACRO-38](MACRO/MACRO-38.pdf)** — Prose correctly returns unemployment to 5%, but plotted B is at 6% unemployment and 6% inflation. No labeled endpoint at the new SRPC/LRPC intersection demonstrates the stated return.
- **[MACRO-47](MACRO/MACRO-47.pdf)** — 900 + 120 - 20 = 1000; stock/flow self-check is sound. Watch Out lists interest alongside deficits without clarifying interest already included in total outlays; avoid possible double-counting reading.

MICRO-48: the four named firms contribute 2693 HHI points. The aggregate 9% fringe contributes the sum of its individual squared shares, not necessarily 81. Thus 2774 is only the one-firm-fringe upper bound. The printed addition itself is correct; its input aggregation is the problem.

MICRO-52: enlarged visual inspection places the two MR branch endpoints around 10 and 32 at quantity 20, with MC around 36 above both. The displayed geometry does not substantiate the prose's within-gap claim. This is an owner-review question despite previous technical/context acceptance.

### Level and scope concerns

- **[MICRO-46](MICRO/MICRO-46.pdf)** — Informational versus persuasive advertising example is concrete; signaling-model core is extra scope relative to simple self-check.
- **[MICRO-51](MICRO/MICRO-51.pdf)** — Backward induction 7>3 and 6>0 is correct. Core inserts unexplained PV 12.50/16.25 and net-gain figures; predation self-check does not retrieve tree reasoning.
- **[MICRO-52](MICRO/MICRO-52.pdf)** — Prior owner-accepted context retained. At Q near 20 the plotted MR branches end near 10 and 32, while MC is near 36, above both. This does not visually support the stated MC-within-gap price-rigidity explanation. Demand is steeper left/flatter right; review kink optimality too.
- **[MICRO-58](MICRO/MICRO-58.pdf)** — Budget slope -2 and bundle (10,20) are correct; tangency visual is useful. Confirm indifference-curve/MRS coverage in the owner’s Principles syllabus.
- **[MICRO-67](MICRO/MICRO-67.pdf)** — Theorem is carefully qualified, but "treats irrelevant alternatives appropriately" does not explain the condition; confirm syllabus scope.
- **[MACRO-57](MACRO/MACRO-57.pdf)** — NCO 100 to 50 and quote 1.0 to 1.5 agree with vertical supply model. Model change from 56 and fixed price levels are explicit; multi-market chain may exceed a short Principles review without prerequisites.

These are syllabus-fit questions, not recommendations to automatically remove advanced content.

### Worked-example and self-check concerns

Worked-example questions/failures: [GEN-ECON-02](GEN-ECON/GEN-ECON-02.pdf), [GEN-ECON-22](GEN-ECON/GEN-ECON-22.pdf), [MICRO-01](MICRO/MICRO-01.pdf), [MICRO-07](MICRO/MICRO-07.pdf), [MICRO-14](MICRO/MICRO-14.pdf), [MICRO-16](MICRO/MICRO-16.pdf), [MICRO-23](MICRO/MICRO-23.pdf), [MICRO-27](MICRO/MICRO-27.pdf), [MICRO-32](MICRO/MICRO-32.pdf), [MICRO-36](MICRO/MICRO-36.pdf), [MICRO-40](MICRO/MICRO-40.pdf), [MICRO-44](MICRO/MICRO-44.pdf), [MICRO-47](MICRO/MICRO-47.pdf), [MICRO-50](MICRO/MICRO-50.pdf), [MICRO-52](MICRO/MICRO-52.pdf), [MICRO-57](MICRO/MICRO-57.pdf), [MACRO-02](MACRO/MACRO-02.pdf), [MACRO-11](MACRO/MACRO-11.pdf), [MACRO-13](MACRO/MACRO-13.pdf), [MACRO-22](MACRO/MACRO-22.pdf), [MACRO-37](MACRO/MACRO-37.pdf), [MACRO-38](MACRO/MACRO-38.pdf), [MACRO-55](MACRO/MACRO-55.pdf).

Self-check questions/failures: [GEN-ECON-05](GEN-ECON/GEN-ECON-05.pdf), [GEN-ECON-10](GEN-ECON/GEN-ECON-10.pdf), [GEN-ECON-17](GEN-ECON/GEN-ECON-17.pdf), [GEN-ECON-25](GEN-ECON/GEN-ECON-25.pdf), [MICRO-08](MICRO/MICRO-08.pdf), [MICRO-13](MICRO/MICRO-13.pdf), [MICRO-24](MICRO/MICRO-24.pdf), [MICRO-42](MICRO/MICRO-42.pdf), [MICRO-51](MICRO/MICRO-51.pdf), [MACRO-04](MACRO/MACRO-04.pdf), [MACRO-10](MACRO/MACRO-10.pdf), [MACRO-15](MACRO/MACRO-15.pdf), [MACRO-23](MACRO/MACRO-23.pdf), [MACRO-39](MACRO/MACRO-39.pdf).

Specific examples include complements under a substitutes heading (MICRO-07), exports under an imports heading (MICRO-16), movement under a shifting-supply heading (MICRO-32), one-point reading under movement-along-SRPC (MACRO-37), unchanged self-check calculation on MACRO-10, and option-like prompts without options on MICRO-08/13. The CSV supplies the row-specific reason for every flag.

## Visual Opportunity Summary

The following mutually exclusive primary recommendations sum to 151:

- NO — current prose/calculation is appropriate: **49**
- EXISTING GRAPH SHOULD STAY: **65**
- TABLE — table would materially improve understanding: **22**
- EXISTING VISUAL SHOULD BE REPLACED: **7**
- EXISTING VISUAL IS REDUNDANT: **4**
- EXISTING TABLE SHOULD STAY: **1**
- REVIEW NEEDED: **1**
- GRAPH — graph would materially improve understanding: **2**

GRAPH recommended (new graph): [MICRO-68](MICRO/MICRO-68.pdf), [MACRO-16](MACRO/MACRO-16.pdf).

TABLE recommended: [GEN-ECON-09](GEN-ECON/GEN-ECON-09.pdf), [MICRO-15](MICRO/MICRO-15.pdf), [MICRO-20](MICRO/MICRO-20.pdf), [MICRO-21](MICRO/MICRO-21.pdf), [MICRO-23](MICRO/MICRO-23.pdf), [MICRO-28](MICRO/MICRO-28.pdf), [MICRO-50](MICRO/MICRO-50.pdf), [MICRO-66](MICRO/MICRO-66.pdf), [MICRO-67](MICRO/MICRO-67.pdf), [MACRO-03](MACRO/MACRO-03.pdf), [MACRO-05](MACRO/MACRO-05.pdf), [MACRO-07](MACRO/MACRO-07.pdf), [MACRO-14](MACRO/MACRO-14.pdf), [MACRO-18](MACRO/MACRO-18.pdf), [MACRO-20](MACRO/MACRO-20.pdf), [MACRO-21](MACRO/MACRO-21.pdf), [MACRO-24](MACRO/MACRO-24.pdf), [MACRO-41](MACRO/MACRO-41.pdf), [MACRO-42](MACRO/MACRO-42.pdf), [MACRO-48](MACRO/MACRO-48.pdf), [MACRO-49](MACRO/MACRO-49.pdf), [MACRO-52](MACRO/MACRO-52.pdf).

Existing visual replacement: [GEN-ECON-16](GEN-ECON/GEN-ECON-16.pdf), [GEN-ECON-22](GEN-ECON/GEN-ECON-22.pdf), [MICRO-14](MICRO/MICRO-14.pdf), [MICRO-24](MICRO/MICRO-24.pdf), [MICRO-27](MICRO/MICRO-27.pdf), [MACRO-30](MACRO/MACRO-30.pdf), [MACRO-38](MACRO/MACRO-38.pdf).

Existing visual redundant: [MICRO-36](MICRO/MICRO-36.pdf), [MICRO-47](MICRO/MICRO-47.pdf), [MACRO-11](MACRO/MACRO-11.pdf), [MACRO-13](MACRO/MACRO-13.pdf).

Review needed: [MICRO-52](MICRO/MICRO-52.pdf).

Graph/table recommendations are justified by comparison, accounting, causal reasoning or spatial intuition, not decoration. Retention is not endorsement of every label: content/graph concerns remain visible in the same row. MICRO-09 remains NO for another graphic. MACRO-12 is explicitly retained.

## Redundancy / Sequence Findings

| Comparison group | First-pass sequence finding |
| --- | --- |
| GEN-ECON-21 / GEN-ECON-22 / MICRO-09 (also MICRO-02) | Preserve graphical tax treatment on GEN sheets and transfer/application on MICRO-09. GEN-22 equal-split example does not demonstrate unequal elasticity; its graph also repeats MICRO-02. Owner decision against another MICRO-09 graph remains in force. |
| MACRO-11 / MACRO-12 / MACRO-13 | Owner-directed differentiation remains pending: measurement / retained capital-deepening graph / growth-policy evaluation. All three currently share the same K=20 to K=40 example. |
| GEN-ECON-12–18 / MICRO-01 | Separate curve shifts, movements and equilibrium; GEN-16 uses the same simultaneous-shift visual as GEN-18 before that complexity is needed. |
| GEN-ECON-19–25 / MICRO-02–16 | Distinguish controls, elasticity, welfare and trade. Review inconsistent Watch Out numbers on MICRO-02/12/13/15/16 and worked headings on 07/14/16. |
| MICRO-19–28 | Production schedules, marginal/average costs and scale deserve distinct tasks. Tables help 20–23; 22/23 and 26/27 currently repeat visual/example roles. |
| MICRO-29–35 | Supply, shutdown, entry/exit and efficiency are distinct. Resolve MICRO-32 coordinate reading and heading that promises a shift while showing a movement. |
| MICRO-36–43 | Separate entry barriers, revenue, output choice, welfare, natural-monopoly regulation and discrimination. MICRO-36 imports the natural-monopoly funding example used later; 40 does not actually measure DWL despite its heading. |
| MICRO-44 / MICRO-45 / MICRO-47 | Same Q=36, P=27 zero-profit graphic is reused for differentiation, equilibrium and variety. Retain the equilibrium role; owner should consider a distinct example for variety benefits. |
| MICRO-48–53 | Concentration, mutual best responses, cartel incentives, sequential credibility and nonprice competition should be distinct. MICRO-49 is corrected. MICRO-48 HHI aggregation, 51 unexplained PV figures and 52 MC/MR geometry require review. |
| MICRO-54–56 / GEN-ECON-23–24 | Public-good demand aggregation and externality diagrams serve different economic operations; vertical summation on MICRO-55 is useful, not automatically redundant. |
| MICRO-57–62 / MACRO-14–17 | Firm labor demand, leisure choice, inequality and labor-force measurement differ. Retain the labor-demand graph; owner graph for MACRO-16 should teach a wage floor, not repeat a firm demand reading. |
| MICRO-63–68 | Behavioral comparisons and collective choice have distinct roles. Voting rankings and median-policy position merit table/axis support; Arrow and indifference-curve material require syllabus-level judgment. |
| MACRO-01–09 / MACRO-25–27 | Separate national accounting, price-index construction, purchasing-power conversion and expected/realized interest. Tables are useful where students must reconstruct multiple basket/year categories. |
| MACRO-18–22 / MACRO-49 | Separate money measures, institutions, bank balance sheets, policy tools, leakage and deposit rounds. Keep owner balance-sheet table proposal on 20; tools table on 21 and rounds table on 49 serve different tasks. |
| MACRO-23 / MACRO-24 | Same 2500-to-5000 money graph and price doubling. Keep graphical quantity theory on 23; nominal-versus-real before/after table could make 24 distinctive. |
| MACRO-28–32 / MACRO-43–45 | Money-market transmission, fiscal shifts and loanable-funds crowding out are distinct. Three-AD-curve graph on 30/31 repeats; it does more work on 31. |
| MACRO-33–36 / MACRO-50–51 | AD-only and SRAS-only shifts lead into joint shocks, self-adjustment and capacity/output-gap analysis. Shared model family is purposeful; active curves and path labels generally agree. |
| MACRO-37–41 | Movement, long-run return, expectations shift, disinflation path and sacrifice ratio form a useful sequence. 37 only reads one point; 38 lacks a labeled final natural-rate point. Shared 39/40 graph supports different paths. |
| MACRO-42–49 | Saving identities, equilibrium, fiscal stocks/flows and banking are distinguishable. Component tables on 42 and before/after ratios on 48 would improve comparison; no extra graph on simple budget-sign or debt arithmetic. |
| MACRO-52–57 | Keep transaction accounting, currency quotation, real purchasing power, asset flows, basic FX and multi-market policy distinct. 55 repeats some 52 accounting. 56/57 explicitly change gross-flow versus NCO supply assumptions; advanced chain on 57 needs prerequisite review. |


## High-Priority Review List

Only HIGH/CRITICAL rows follow; no CRITICAL issues were assigned. HIGH means resolve before instructional approval, not that every row contains a proven arithmetic error.

- **[MICRO-02](MICRO/MICRO-02.pdf)** — Worked $6 x 80=$480 is correct. Watch Out abruptly uses $46/$34 and 420 units from an unexplained different case.
- **[MICRO-07](MICRO/MICRO-07.pdf)** — Worked heading says IDENTIFYING SUBSTITUTES, but -0.7 and printers/ink correctly identify complements. Self-check implies a 5% fall.
- **[MICRO-14](MICRO/MICRO-14.pdf)** — CS rises $32 to $72, but worked heading asks transfer or deadweight loss and the demand-only example cannot calculate either.
- **[MICRO-15](MICRO/MICRO-15.pdf)** — Worked policy totals $500/$520 are correct. Watch Out reuses Policy A/B with different $150/$140 figures and unexplained external costs.
- **[MICRO-16](MICRO/MICRO-16.pdf)** — Correct exports=250-100=150 thousand, but heading says CALCULATING IMPORTS. Watch Out discusses a tariff and unexplained $144 DWL absent from the graph.
- **[MICRO-22](MICRO/MICRO-22.pdf)** — Worked AFC=$8 is correct; self-check implies FC about $299.86 with rounding. Watch Out combines two different unlabeled cost cases.
- **[MICRO-32](MICRO/MICRO-32.pdf)** — Worked text says point B is about 33 units; graph/accessible description place it near 36. Heading promises a supply shift but only movement along MC is shown.
- **[MICRO-48](MICRO/MICRO-48.pdf)** — HHI 2,774 squares the 9% "Other" aggregate as if it were one firm. Without individual fringe shares, exact HHI is not established; 2,774 is an upper bound.
- **[MICRO-51](MICRO/MICRO-51.pdf)** — Backward induction 7>3 and 6>0 is correct. Core inserts unexplained PV 12.50/16.25 and net-gain figures; predation self-check does not retrieve tree reasoning.
- **[MICRO-52](MICRO/MICRO-52.pdf)** — Prior owner-accepted context retained. At Q near 20 the plotted MR branches end near 10 and 32, while MC is near 36, above both. This does not visually support the stated MC-within-gap price-rigidity explanation. Demand is steeper left/flatter right; review kink optimality too.
- **[MACRO-11](MACRO/MACRO-11.pdf)** — Owner finding confirmed: worked example still reads the same capital-deepening graph as 12 and 13. 36.37 - 28.53 = 7.84; core productivity calculation 2400/300 = 8 is correct.
- **[MACRO-13](MACRO/MACRO-13.pdf)** — Owner finding confirmed: worked example repeats the same 20-to-40 capital change rather than evaluating a concrete growth policy.
- **[MACRO-16](MACRO/MACRO-16.pdf)** — Owner finding confirmed: 120 - 90 = 30 workers is correct, but no labor-market graph is present. Insurance self-check addresses a separate institution within the outcome.
- **[MACRO-20](MACRO/MACRO-20.pdf)** — Owner finding confirmed: assets 1000, liabilities 940, capital 60; after loss assets 975, capital 35. Key-relationships card is not a balance-sheet table.
- **[MACRO-38](MACRO/MACRO-38.pdf)** — Prose correctly returns unemployment to 5%, but plotted B is at 6% unemployment and 6% inflation. No labeled endpoint at the new SRPC/LRPC intersection demonstrates the stated return.

Priority totals: NONE 68, MEDIUM 49, LOW 19, HIGH 15.

## Installation Readiness

Owner content/visual approval is PENDING for the collection. Technical 151/151 acceptance does not establish instructional approval. All OwnerDecision and ApprovedForInstall cells are blank. Human AT remains PENDING. Review all 151 sheets, decide targeted corrections, then perform a human AT sample, then seek separate installation authorization. No installation, content correction, deployment, commit or push occurred.
