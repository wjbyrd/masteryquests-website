# Phase Graph 3 — Macro AD/AS Core
## Reliability audit, blueprint, question build, and validation
**Base engine:** Composer 4.5s.2  
**Base content:** Phase Graph 2 / 8,049 canonical questions / 408 assets  
**Content phase:** phaseGraph3-macro-ad-as-core-v1  
**Release label:** 4.5s.2f  
**Date:** 2026-08-12

## 1. Graph reliability audit
All eight source images are mathematically usable and production-safe. Six files are 1600×1200 RGBA PNGs; ADASLRAS-01 is 1614×1130 RGBA and ADASLRAS-02 is 1625×1147 RGBA. All convert cleanly to canonical WebP assets.

| Asset | Reliability | Verified structure | Guardrail |
|---|---|---|---|
| AS-01 | PASS | Parallel AS curves with AS1 above AS0, so aggregate supply decreases. At real GDP 150, price level rises from 150 to 190. | Use for AS-shift direction, stagflation logic, and price/output effects; avoid treating it as an equilibrium graph because AD is not shown. |
| AD-01 | PASS | AD1 is to the right of AD0, so aggregate demand increases. At price level 50, real GDP demanded rises from 100 to 150. | Use for AD-shift direction, shifters, and direct readings; avoid equilibrium claims unless the stem explicitly holds AS fixed. |
| AD-02 | PASS | AD1 is to the left of AD0, so aggregate demand decreases. At price level 45, real GDP demanded falls from 150 to 100. | Use for contractionary-demand logic and direct quantity readings; avoid equilibrium claims unless the stem explicitly holds AS fixed. |
| AS-02 | PASS | AS1 lies below AS0, so aggregate supply increases. At real GDP 150, price level falls from 150 to 110. | Use for favorable-supply-shock logic, price/output effects, and movement-versus-shift reasoning. |
| ADASLRAS-01 | PASS | Original long-run equilibrium is C (100, 125). An AD increase moves the economy to D (125, 150) in the short run and then to B (100, 175) after SRAS shifts left. | Best for short-run versus long-run adjustment after an AD increase. Do not ask students to infer causal timing from labels alone; use the point sequence. |
| ADASLRAS-02 | PASS | Original long-run equilibrium is A (100, 125). A positive supply-side improvement shifts SRAS right and LRAS right to B (115, 110). | LRAS0 and LRAS1 labels sit close together, so questions anchor on points A and B and the stated curve shifts rather than typography placement. |
| ADAS-01 | PASS | A = (150, 125) and B = (175, 137.5). With AS0 fixed, an AD increase raises both output and the price level. | Use for short-run equilibrium and movement along AS. The 137.5 label is reliable and can support direct price-level questions. |
| ADAS-02 | PASS | A = original equilibrium (75, 100). B isolates an AD increase, D isolates a decrease in AS, and C shows both simultaneously at (75, 150). | Strong simultaneous-shifts graph. Use the labeled points to keep the logic explicit and avoid open-ended ambiguity. |

**Reliability verdict:** all eight assets are usable. The only light guardrail is label proximity on ADASLRAS-02, which is handled by point-based stems. No asset has a mathematical defect.

## 2. Locked Phase Graph 3 blueprint
The phase stays inside **aggregate demand → aggregate supply → AD-AS short-run equilibrium → AD-AS-LRAS long-run adjustment**. It does not wander into Phillips-curve questions, money-market graphs, multiplier mechanics, unemployment calculations, or fiscal-policy numerics.

### Asset jobs
- **AS-01:** decrease in aggregate supply, stagflation pattern, input-cost causes, and movement-versus-shift logic.
- **AD-01:** increase in aggregate demand, direct quantity readings, shifters, and AD identification.
- **AD-02:** decrease in aggregate demand, contraction logic, direct quantity readings, and policy interpretation.
- **AS-02:** increase in aggregate supply, favorable supply shocks, price/output effects, and AD-versus-AS distinction.
- **ADASLRAS-01:** short-run and long-run adjustment after an aggregate-demand increase.
- **ADASLRAS-02:** positive supply-side growth that shifts SRAS and LRAS right.
- **ADAS-01:** simple AD increase with fixed AS, including direct changes in output and the price level.
- **ADAS-02:** simultaneous increase in AD and decrease in AS, including decomposition using points A/B/C/D.

### Question architecture
Each asset receives **6 graph-dependent questions**: 1 easy, 2 medium, 1 hard, 1 elite, and 1 Legendary. Total: **48 new questions**.

| Difficulty | New questions | Purpose |
|---|---:|---|
| Easy | 8 | Direct curve/point identification |
| Medium | 16 | Shifter recognition, effect reading, and direct graph calculations |
| Hard | 8 | Multi-step transitions and quantitative comparisons |
| Elite | 8 | Misconception detection and model discrimination |
| Legendary | 8 | Short-run/long-run synthesis and simultaneous-shift reasoning |

### Quality rules applied
- Every question is self-contained. No “same market,” “as before,” or prior-question dependency.
- Every question genuinely needs the graph or graph-specific values; no decorative images.
- No axis-identification filler.
- Curve shifts are kept separate from movements along a fixed curve.
- Short-run equilibrium and long-run adjustment are not blurred together.
- Simultaneous demand/supply shifts are resolved using labeled points, not vague prose.
- Correct-answer positions are perfectly balanced: 12 / 12 / 12 / 12.

## 3. Question build results
- **48** new canonical graph questions
- **12 Aggregate Demand**, **12 Aggregate Supply**, **24 Macroeconomic Equilibrium and Shocks**
- **8** new canonical graph assets
- Canonical library: **8,049 → 8,097 questions**
- Asset inventory: **408 → 416 assets**
- Aggregate Demand graph coverage: **1 → 13**
- Aggregate Supply graph coverage: **1 → 13**
- Macroeconomic Equilibrium and Shocks graph coverage: **20 → 44**

## 4. Validation
- All eight asset files exist and match their registered SHA-256 hashes.
- All 48 answer hashes resolve to exactly one option.
- Correct-answer positions: **12 / 12 / 12 / 12**.
- Source-integrity comparison: **0 existing questions changed, 0 removed; 48 added**.
- Near-duplicate scan against the preexisting AD/AS/macroequilibrium banks: **0 high-similarity flags at ≥0.80**.
- Question-independence / graph-hygiene review: **PASS** — 0 unsafe context starts, 0 decorative images, 0 prior-question dependencies.
- The touched macro concepts remain family-safe and mode-safe; this phase deepens graph coverage rather than papering over structure with junk bosses.

## 5. New-question appendix
### AS-01
- **PG3-AS-E-001 — Easy**: The dashed AS1 curve lies above the original AS0 curve. What change does this graph show?  
  Correct: A decrease in aggregate supply
- **PG3-AS-M-001 — Medium**: If the economy moves from AS0 to AS1 in the graph, what happens to real GDP and the price level?  
  Correct: Real GDP decreases while the price level increases
- **PG3-AS-M-002 — Medium**: Which event best matches the shift from AS0 to AS1?  
  Correct: A rise in input prices that makes production more costly
- **PG3-AS-H-001 — Hard**: At real GDP of 150, the price level on AS0 is 150 and the price level on AS1 is 190. By how much does the price level rise at that output level?  
  Correct: 40
- **PG3-AS-EL-001 — Elite**: A student says the graph shows a recession with inflation pressure occurring at the same time. Which label best fits that combination?  
  Correct: Stagflation caused by a negative aggregate supply shock
- **PG3-AS-L-001 — Legendary**: Which statement best interprets the shift from AS0 to AS1 without confusing it for a movement along a curve?  
  Correct: At every real GDP level, producers now require a higher price level than before, so aggregate supply has decreased

### AD-01
- **PG3-AD-E-001 — Easy**: The dashed AD1 curve lies to the right of AD0. What change does the graph show?  
  Correct: An increase in aggregate demand
- **PG3-AD-M-001 — Medium**: If the economy moves from AD0 to AD1 with aggregate supply held fixed, what happens to real GDP and the price level?  
  Correct: Both real GDP and the price level increase
- **PG3-AD-M-002 — Medium**: Which event is most consistent with the shift from AD0 to AD1?  
  Correct: An increase in consumer, investment, government, or net-export spending
- **PG3-AD-H-001 — Hard**: At a price level of 50, the graph shows real GDP of 100 on AD0 and 150 on AD1. By how much does quantity of real GDP demanded increase?  
  Correct: 50
- **PG3-AD-EL-001 — Elite**: A student says AD1 must represent aggregate supply because real GDP is larger. What is the best correction?  
  Correct: AD is the downward-sloping spending curve, so a rightward shift from AD0 to AD1 still represents aggregate demand, not aggregate supply
- **PG3-AD-L-001 — Legendary**: Which statement correctly interprets the move from AD0 to AD1?  
  Correct: At each price level, households, firms, government, and foreigners together demand more real output than before

### AD-02
- **PG3-AD-E-002 — Easy**: The dashed AD1 curve lies to the left of AD0. What change does the graph show?  
  Correct: A decrease in aggregate demand
- **PG3-AD-M-003 — Medium**: If the economy moves from AD0 to AD1 with aggregate supply held fixed, what happens to real GDP and the price level?  
  Correct: Both real GDP and the price level decrease
- **PG3-AD-M-004 — Medium**: Which event best matches the shift from AD0 to AD1?  
  Correct: A fall in planned spending such as lower consumption or investment
- **PG3-AD-H-002 — Hard**: At a price level of 45, the graph shows real GDP of 150 on AD0 and 100 on AD1. By how much does quantity of real GDP demanded fall?  
  Correct: 50
- **PG3-AD-EL-002 — Elite**: A policymaker wants to reverse the move from AD0 to AD1. Which macro pattern is the policymaker trying to avoid?  
  Correct: A drop in output accompanied by downward pressure on the price level
- **PG3-AD-L-002 — Legendary**: Which statement best captures the meaning of the shift from AD0 to AD1?  
  Correct: At every price level, the total quantity of real output demanded is lower than before, so aggregate demand has decreased

### AS-02
- **PG3-AS-E-002 — Easy**: The dashed AS1 curve lies below the original AS0 curve. What change does this graph show?  
  Correct: An increase in aggregate supply
- **PG3-AS-M-003 — Medium**: If the economy moves from AS0 to AS1 with aggregate demand held fixed, what happens to real GDP and the price level?  
  Correct: Real GDP increases while the price level decreases
- **PG3-AS-M-004 — Medium**: Which event best matches the shift from AS0 to AS1?  
  Correct: A fall in input costs or an improvement in productivity
- **PG3-AS-H-002 — Hard**: At real GDP of 150, the price level on AS0 is 150 and the price level on AS1 is 110. By how much does the price level fall at that output level?  
  Correct: 40
- **PG3-AS-EL-002 — Elite**: A student claims the graph shows demand-pull growth. What is the strongest correction?  
  Correct: The graph shows a rightward shift of aggregate supply, which lowers the price level while raising output
- **PG3-AS-L-002 — Legendary**: Which statement best interprets the move from AS0 to AS1?  
  Correct: At every real GDP level, producers are willing to supply output at a lower price level than before, so aggregate supply has increased

### ADASLRAS-01
- **PG3-MEQ-E-001 — Easy**: In the AD-AS-LRAS graph, which labeled point represents the original long-run equilibrium before aggregate demand increases?  
  Correct: Point C
- **PG3-MEQ-M-001 — Medium**: If aggregate demand increases from AD0 to AD1 while SRAS0 is still fixed in the short run, which point shows the short-run equilibrium?  
  Correct: Point D
- **PG3-MEQ-M-002 — Medium**: After wages and expectations adjust, SRAS shifts from SRAS0 to SRAS1. Which point shows the new long-run equilibrium?  
  Correct: Point B
- **PG3-MEQ-H-001 — Hard**: Which sequence correctly traces the economy after an increase in aggregate demand starting from the original long-run equilibrium?  
  Correct: C to D to B
- **PG3-MEQ-EL-001 — Elite**: Comparing the original long-run equilibrium C with the new long-run equilibrium B, what is true?  
  Correct: Real GDP returns to 100 while the price level rises from 125 to 175
- **PG3-MEQ-L-001 — Legendary**: A student says an aggregate-demand increase permanently raises real GDP above potential in this graph. Which correction is best?  
  Correct: It raises real GDP above potential only in the short run at D; after SRAS shifts left, the economy returns to potential output at B with a higher price level

### ADASLRAS-02
- **PG3-MEQ-E-002 — Easy**: Which labeled point is the original long-run equilibrium in the graph with LRAS0 and LRAS1?  
  Correct: Point A
- **PG3-MEQ-M-003 — Medium**: Which labeled point is the new long-run equilibrium after the supply-side improvement?  
  Correct: Point B
- **PG3-MEQ-M-004 — Medium**: From point A to point B, what happens to real GDP and the price level?  
  Correct: Real GDP rises from 100 to 115 while the price level falls from 125 to 110
- **PG3-MEQ-H-002 — Hard**: Which event best matches the joint shift from SRAS0/LRAS0 to SRAS1/LRAS1?  
  Correct: A productivity improvement that raises potential output and lowers production costs
- **PG3-MEQ-EL-002 — Elite**: Which statement best describes the macro outcome shown by the move from A to B?  
  Correct: The economy experiences long-run growth with disinflationary pressure
- **PG3-MEQ-L-002 — Legendary**: A student says point B can only be explained by higher aggregate demand because real GDP is larger there. Which correction best fits the graph?  
  Correct: Point B is created by rightward shifts of both SRAS and LRAS while AD stays at AD0, so higher output comes from stronger supply, not stronger demand

### ADAS-01
- **PG3-MEQ-E-003 — Easy**: In the AD-AS graph, which point shows the original equilibrium before aggregate demand rises?  
  Correct: Point A
- **PG3-MEQ-M-005 — Medium**: After aggregate demand shifts from AD0 to AD1 while AS0 is fixed, which point shows the new short-run equilibrium?  
  Correct: Point B
- **PG3-MEQ-M-006 — Medium**: From point A to point B, by how much does real GDP increase?  
  Correct: 25
- **PG3-MEQ-H-003 — Hard**: From point A to point B, by how much does the price level increase?  
  Correct: 12.5
- **PG3-MEQ-EL-003 — Elite**: Which description best matches the move from A to B?  
  Correct: The economy moves upward along a fixed AS0 curve because aggregate demand increases
- **PG3-MEQ-L-003 — Legendary**: A student sees higher output and a higher price level at point B and concludes the graph must show an aggregate-supply increase. What is the best correction?  
  Correct: An aggregate-supply increase would raise output but lower the price level; this graph shows both rising, which is the short-run signature of an aggregate-demand increase

### ADAS-02
- **PG3-MEQ-E-004 — Easy**: Which point marks the original equilibrium where AD0 and AS0 intersect?  
  Correct: Point A
- **PG3-MEQ-M-007 — Medium**: If only aggregate demand increases from AD0 to AD1 while AS0 stays in place, which point shows the new equilibrium?  
  Correct: Point B
- **PG3-MEQ-M-008 — Medium**: If only aggregate supply decreases from AS0 to AS1 while AD0 stays in place, which point shows the new equilibrium?  
  Correct: Point D
- **PG3-MEQ-H-004 — Hard**: If aggregate demand increases from AD0 to AD1 at the same time aggregate supply decreases from AS0 to AS1, which point shows the resulting equilibrium?  
  Correct: Point C
- **PG3-MEQ-EL-004 — Elite**: Compare point A with point C. Which statement is correct?  
  Correct: Real GDP is unchanged at 75, but the price level rises from 100 to 150
- **PG3-MEQ-L-004 — Legendary**: A student says the graph proves output must rise whenever aggregate demand increases. Which graph-based rebuttal is strongest?  
  Correct: Not if aggregate supply falls at the same time: moving from A to C leaves real GDP unchanged at 75 while the price level rises sharply to 150

