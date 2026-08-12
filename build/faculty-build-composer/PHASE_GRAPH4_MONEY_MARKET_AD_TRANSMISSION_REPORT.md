# Phase Graph 4 — Money Market and Aggregate Demand
## Reliability audit, blueprint, question build, and validation
**Base engine:** Composer 4.5s.2  
**Base content:** Phase Graph 3 / 8,097 canonical questions / 416 assets  
**Content phase:** phaseGraph4-money-market-ad-transmission-v1  
**Release label:** 4.5s.2g  
**Date:** 2026-08-12

## 1. Graph reliability audit
All seven source images are usable and economically coherent. They range from 1564×1118 to 1638×881 pixels and convert cleanly to canonical WebP assets. The single-panel money-market graphs are especially clean. The paired money-market/AD panels are schematic transmission diagrams with explicit guide values; questions use those labeled values and directions rather than reverse-engineering hidden line equations.

| Asset | Reliability | Verified structure | Guardrail |
|---|---|---|---|
| MONEY-01 | PASS | Baseline money-market equilibrium at quantity of money 100 and nominal interest rate 6%. | Use for equilibrium, vertical money supply, money-demand slope, movement versus shift, and disequilibrium logic. |
| MONEY-02 | PASS | Money supply increases from 100 to 125 and the equilibrium nominal interest rate falls from 4% to 2%. | Clean expansionary money-supply shift. Keep money demand fixed when interpreting the rate change. |
| MONEY-03 | PASS | Money supply decreases from 100 to 75 and the equilibrium nominal interest rate rises from 4% to 6%. | Clean contractionary money-supply shift. Keep money demand fixed when interpreting the rate change. |
| MONEY-04 | PASS | Original equilibrium B=(75,3). MD increase alone gives A=(75,6); MS increase alone gives D=(100,1); both shifts give C=(100,4). | Excellent simultaneous-shifts asset. Point labels remove ambiguity about separate versus combined effects. |
| MONEY-AD-03 | PASS | With MS fixed at 75, MD rises and the interest rate rises from 2% to 4%; AD then shifts left, moving real GDP from 150 to 105 and price level from 55 to 45. | Treat the guide labels as authoritative; do not infer exact AD slope coefficients from the artwork. |
| MONEY-AD-01 | PASS | Expansionary policy: MS rises 100→150, interest rate falls 6%→4%, AD shifts right, real GDP rises 100→125, and price level rises 50→56.25. | Strong transmission graph. Use the explicit point values rather than deriving hidden equations from panel geometry. |
| MONEY-AD-02 | PASS | Contractionary policy: MS falls 125→100, interest rate rises 2.75%→4%, AD shifts left, real GDP falls 125→100, and price level falls 50→45. | Strong contractionary counterpart. Use explicit guides and labels for numeric questions. |

**Reliability verdict:** all seven assets pass. No economic or mathematical defect blocks production use. The only standing rule is that the paired panels are teaching diagrams, so exact calculations use their printed guide values—not pixel-derived line equations.

## 2. Locked Phase Graph 4 blueprint
The phase stays inside **money-market equilibrium → money-supply shifts → simultaneous money-market shifts → liquidity-preference transmission → expansionary/contractionary monetary-policy transmission to AD**. It does not drift into money creation, reserve-ratio arithmetic, Phillips curves, fiscal multipliers, or LRAS adjustment.

### Asset jobs
- **MONEY-01:** baseline equilibrium, vertical money supply, downward-sloping money demand, movement versus shift, and disequilibrium adjustment.
- **MONEY-02:** expansionary money-supply shift and lower equilibrium interest rate.
- **MONEY-03:** contractionary money-supply shift and higher equilibrium interest rate.
- **MONEY-04:** separate and simultaneous changes in money demand and money supply, including partial policy offsets.
- **MONEY-AD-03:** money-demand increase at fixed money supply → higher rate → lower interest-sensitive spending → leftward AD shift.
- **MONEY-AD-01:** expansionary monetary policy from money supply through interest rates to AD, real GDP, and price level.
- **MONEY-AD-02:** contractionary monetary policy through the same chain in reverse.

### Question architecture
Each asset receives **6 graph-dependent questions**: 1 easy, 2 medium, 1 hard, 1 elite, and 1 Legendary. Total: **42 new questions**.

| Difficulty | New questions | Purpose |
|---|---:|---|
| Easy | 7 | Direct equilibrium and policy-direction reading |
| Medium | 14 | Shift interpretation, linked-panel reading, and direct calculations |
| Hard | 7 | Rate/output changes and transmission sequences |
| Elite | 7 | Movement-versus-shift and model-link misconceptions |
| Legendary | 7 | Full causal chains, simultaneous shifts, and evidence-limited synthesis |

### Quality rules applied
- Every item is self-contained; no previous-question scaffolding.
- Every attached graph supplies necessary evidence or point values.
- No axis-identification filler and no decorative graph attachments.
- Money demand is not confused with aggregate demand.
- A movement along money demand is kept separate from a shift in money demand.
- Statutory central-bank action is kept distinct from the downstream spending and AD response.
- Paired-panel questions trace the causal link explicitly rather than pretending the central bank directly sets GDP.
- Correct-answer positions are as balanced as mathematically possible for 42 questions: **11 / 11 / 10 / 10**.

## 3. Question build results
- **42** new canonical graph questions
- **30 Liquidity Preference and Money Market**, **12 Monetary-Policy Transmission**
- **7** new canonical graph assets
- Canonical library: **8,097 → 8,139 questions**
- Asset inventory: **416 → 423 assets**
- Liquidity Preference & Money Market graph coverage: **13 → 43**
- Monetary-Policy Transmission graph coverage: **22 → 34**

## 4. Validation
- All seven asset files exist and match their registered SHA-256 hashes.
- All 42 answer hashes resolve to exactly one option.
- Correct-answer positions: **11 / 11 / 10 / 10**.
- Source-integrity comparison: **0 existing questions changed, 0 removed; 42 added**.
- Near-duplicate scan against the preexisting money-market/transmission banks: **0 high-similarity flags at ≥0.80**.
- Question-independence / graph-hygiene regression: **PASS** — 0 unsafe context starts, 0 axis-giveaway items, 0 stale “refer to the graph” stems.
- Seven-mode composition: **PASS** for Liquidity Preference and Money Market, Monetary-Policy Transmission, the combined Money Market + Transmission family, Monetary Transmission with AD-AS, and the broader Macro Stabilization Core.
- No composition errors, no failed modes, no answer-hash failures, and no asset-hash failures.

## 5. New-question appendix
### MONEY-01
- **PG4-MM-E-001 — Easy**: At point A in the money market, what is the equilibrium nominal interest rate?  
  Correct: 6 percent
- **PG4-MM-M-001 — Medium**: At point A, what quantity of money clears the market?  
  Correct: 100
- **PG4-MM-M-002 — Medium**: Why is MS0 drawn as a vertical line in this standard money-market graph?  
  Correct: The model treats the nominal money supply as fixed by the central bank at that moment
- **PG4-MM-H-001 — Hard**: The downward slope of MD0 means that, other things equal, a lower nominal interest rate is associated with what?  
  Correct: A larger quantity of money demanded
- **PG4-MM-EL-001 — Elite**: A student says a fall in the interest rate from 8 percent to 6 percent would shift MD0 to the right. What is the best correction?  
  Correct: A change in the interest rate causes a movement along MD0; it does not by itself shift the money-demand curve
- **PG4-MM-L-001 — Legendary**: Suppose the nominal interest rate were temporarily above the 6-percent equilibrium while MS0 remained fixed. What adjustment pressure would the model predict?  
  Correct: An excess supply of money would push the interest rate downward toward 6 percent

### MONEY-02
- **PG4-MM-E-002 — Easy**: The money-supply curve moves from MS0 at 100 to MS1 at 125. What happens to the equilibrium nominal interest rate?  
  Correct: It falls from 4 percent to 2 percent
- **PG4-MM-M-003 — Medium**: By how much does the quantity of money supplied increase when MS0 shifts to MS1?  
  Correct: 25
- **PG4-MM-M-004 — Medium**: Which central-bank action is most consistent with the shift from MS0 to MS1?  
  Correct: An expansionary action that increases the money supply
- **PG4-MM-H-002 — Hard**: What is the change in the equilibrium nominal interest rate when money supply rises from 100 to 125?  
  Correct: A decrease of 2 percentage points
- **PG4-MM-EL-002 — Elite**: A student says the fall in the interest rate from 4 percent to 2 percent proves money demand shifted left. What does the graph actually show?  
  Correct: Money demand stays at MD0; the economy moves along MD0 because money supply shifts right
- **PG4-MM-L-002 — Legendary**: If this money-market shift were the first step of expansionary monetary policy, which downstream effect would normally come next?  
  Correct: Lower interest rates would tend to increase interest-sensitive spending and push aggregate demand to the right

### MONEY-03
- **PG4-MM-E-003 — Easy**: The money-supply curve moves from MS0 at 100 to MS1 at 75. What happens to the equilibrium nominal interest rate?  
  Correct: It rises from 4 percent to 6 percent
- **PG4-MM-M-005 — Medium**: By how much does the quantity of money supplied decrease when MS0 shifts to MS1?  
  Correct: 25
- **PG4-MM-M-006 — Medium**: Which central-bank action is most consistent with the shift from MS0 to MS1?  
  Correct: A contractionary action that decreases the money supply
- **PG4-MM-H-003 — Hard**: What is the change in the equilibrium nominal interest rate when money supply falls from 100 to 75?  
  Correct: An increase of 2 percentage points
- **PG4-MM-EL-003 — Elite**: A student says the rise in the interest rate from 4 percent to 6 percent proves money demand shifted right. What does the graph actually show?  
  Correct: Money demand stays at MD0; the economy moves along MD0 because money supply shifts left
- **PG4-MM-L-003 — Legendary**: If this money-market shift were the first step of contractionary monetary policy, which downstream effect would normally follow?  
  Correct: Higher interest rates would tend to reduce interest-sensitive spending and push aggregate demand to the left

### MONEY-04
- **PG4-MM-E-004 — Easy**: Which labeled point is the original equilibrium where MD0 intersects MS0?  
  Correct: Point B
- **PG4-MM-M-007 — Medium**: If only money demand increases from MD0 to MD1 while MS0 stays fixed, which point becomes the new equilibrium?  
  Correct: Point A
- **PG4-MM-M-008 — Medium**: If only money supply increases from MS0 to MS1 while MD0 stays fixed, which point becomes the new equilibrium?  
  Correct: Point D
- **PG4-MM-H-004 — Hard**: If money demand increases from MD0 to MD1 at the same time money supply increases from MS0 to MS1, which point is the resulting equilibrium?  
  Correct: Point C
- **PG4-MM-EL-004 — Elite**: Compare original point B with simultaneous-shift point C. What happens to quantity of money and the nominal interest rate?  
  Correct: Quantity rises from 75 to 100 while the interest rate rises from 3 percent to 4 percent
- **PG4-MM-L-004 — Legendary**: Money demand rises from MD0 to MD1. Which central-bank response shown partially offsets the interest-rate increase without restoring the original 3-percent rate?  
  Correct: Increase money supply from MS0 to MS1, moving the outcome from A at 6 percent to C at 4 percent

### MONEY-AD-03
- **PG4-MM-E-005 — Easy**: In the left panel, money demand rises from MD0 to MD1 while MS0 stays fixed. What happens to the nominal interest rate?  
  Correct: It rises from 2 percent to 4 percent
- **PG4-MM-M-009 — Medium**: Which change in the right panel accompanies the higher interest rate shown in the money market?  
  Correct: Aggregate demand shifts left from AD0 to AD1
- **PG4-MM-M-010 — Medium**: What transmission link connects the left-panel rise in the interest rate to the right-panel fall in aggregate demand?  
  Correct: Higher interest rates reduce interest-sensitive spending such as investment
- **PG4-MM-H-005 — Hard**: Across the two panels, real GDP falls from 150 to 105. By how much does real GDP decrease?  
  Correct: 45
- **PG4-MM-EL-005 — Elite**: A student says the money-demand increase should shift aggregate demand right because people want to hold more money. What is the strongest correction using the graph?  
  Correct: With money supply fixed, greater money demand raises the interest rate; the higher rate discourages interest-sensitive spending, so AD shifts left
- **PG4-MM-L-005 — Legendary**: Which complete chain is consistent with the two-panel graph?  
  Correct: MD rises with MS fixed → interest rate rises from 2% to 4% → interest-sensitive spending falls → AD shifts left → real GDP and price level fall

### MONEY-AD-01
- **PG4-MPT-E-001 — Easy**: The left panel shows money supply increasing from MS0 to MS1. What happens to the nominal interest rate?  
  Correct: It falls from 6 percent to 4 percent
- **PG4-MPT-M-001 — Medium**: Which aggregate-demand change accompanies the lower interest rate in the right panel?  
  Correct: AD shifts right from AD0 to AD1
- **PG4-MPT-M-002 — Medium**: Real GDP rises from 100 at point A to 125 at point B. By how much does real GDP increase?  
  Correct: 25
- **PG4-MPT-H-001 — Hard**: Which sequence correctly describes the expansionary policy shown?  
  Correct: Money supply rises → interest rate falls → interest-sensitive spending rises → AD shifts right → output and price level rise
- **PG4-MPT-EL-001 — Elite**: Which statement correctly distinguishes what changes in the two panels?  
  Correct: The left panel shows a shift of money supply and a movement along money demand; the right panel shows a shift of aggregate demand along a fixed SRAS
- **PG4-MPT-L-001 — Legendary**: The policy lowers the interest rate by 2 percentage points and moves real GDP from 100 to 125. What does the graph establish without claiming more than it shows?  
  Correct: In this illustrated transmission, expansionary monetary policy is associated with a 25-unit rise in real GDP and a higher price level

### MONEY-AD-02
- **PG4-MPT-E-002 — Easy**: The left panel shows money supply decreasing from MS0 to MS1. What happens to the nominal interest rate?  
  Correct: It rises from 2.75 percent to 4 percent
- **PG4-MPT-M-003 — Medium**: Which aggregate-demand change accompanies the higher interest rate in the right panel?  
  Correct: AD shifts left from AD0 to AD1
- **PG4-MPT-M-004 — Medium**: Real GDP falls from 125 at point A to 100 at point B. By how much does real GDP decrease?  
  Correct: 25
- **PG4-MPT-H-002 — Hard**: Which sequence correctly describes the contractionary policy shown?  
  Correct: Money supply falls → interest rate rises → interest-sensitive spending falls → AD shifts left → output and price level fall
- **PG4-MPT-EL-002 — Elite**: A student says AD1 is lower because the central bank directly reduced real GDP. What is the better interpretation?  
  Correct: The central bank reduces money supply, the interest rate rises, interest-sensitive spending falls, and that spending change shifts AD left
- **PG4-MPT-L-002 — Legendary**: The policy raises the interest rate from 2.75 percent to 4 percent and moves real GDP from 125 to 100. What is the strongest conclusion supported by the graph?  
  Correct: In this illustrated contractionary transmission, higher interest rates are associated with a 25-unit fall in real GDP and a lower price level

