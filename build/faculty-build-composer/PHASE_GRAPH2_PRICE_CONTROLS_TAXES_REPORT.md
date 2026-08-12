# Phase Graph 2 — Price Controls and Taxes
## Reliability audit, blueprint, question build, and validation
**Base engine:** Composer 4.5s.2  
**Base content:** Phase Graph 1 / 8,025 canonical questions / 404 assets  
**Content phase:** phaseGraph2-price-controls-taxes-v1  
**Release label:** 4.5s.2e  
**Date:** 2026-08-12

## 1. Graph reliability audit
All four source images are mathematically usable and production-safe with two small visual/readability guardrails noted below. Three files are 1600×1200 RGBA PNGs; TAX-02 is 1555×1175 RGBA. All convert cleanly to canonical WebP assets.

| Asset | Reliability | Verified structure | Guardrail |
|---|---|---|---|
| CEILING-01 | PASS | Apartment-market equilibrium A = $2,000 and Q=150. A $1,000 ceiling gives Qs=50 and Qd=250, so the shortage is 200 apartments. | Use the graph for binding status, shortage, transaction limits, and rationing. Do not imply that quantity demanded equals quantity traded. |
| FLOOR-01 | PASS | Labor-market equilibrium A = $7 and Q=175k workers. A $10 wage floor gives labor demand 100k and labor supply 250k, so the labor surplus is 150k. | There is a duplicated red/black “$7” annotation at equilibrium. It is cosmetic, not mathematical. Questions avoid asking students to identify that printed label. |
| TAX-01 | PASS | Original equilibrium = $12 and 140k movies. Supply shifts upward by $4. New quantity = 100k; buyers pay $14; sellers receive $10; quantity falls 40k; tax revenue = $400,000. | Strong seller-side tax graph. Questions distinguish the statutory supply shift from economic incidence. |
| TAX-02 | PASS | Original equilibrium = $10.50 and 100k movies. Buyer-side tax creates a $6 downward demand shift. New quantity = 60k; sellers receive $7.50; buyers pay $13.50; burden = $3/$3; quantity falls 40k. | The $10.50 original equilibrium price is not numerically printed on the axis. Any question that needs it states $10.50 in the stem rather than forcing pixel-level inference. |

**Reliability verdict:** all four assets are usable. FLOOR-01 has one cosmetic duplicate label; TAX-02 needs the explicit-value guardrail above. Neither issue compromises the economics or answerability of the authored questions.

## 2. Locked Phase Graph 2 blueprint
The phase stays inside **price ceilings → price floors → per-unit taxes → statutory versus economic tax incidence**. It does not wander into elasticity calculations, trade policy, consumer/producer surplus, or tax deadweight-loss geometry.

### Asset jobs
- **CEILING-01:** binding ceiling identification, shortage magnitude, quantity traded versus quantity demanded, decomposition of the shortage, and non-price rationing logic.
- **FLOOR-01:** binding floor identification, labor surplus/unemployment, employment versus labor supplied, decomposition of the surplus, and movement back to equilibrium.
- **TAX-01:** seller-side tax shift, tax wedge, buyer/seller prices, quantity reduction, tax revenue, burden split, and market shrinkage.
- **TAX-02:** buyer-side tax representation, buyer versus seller prices, tax wedge, economic incidence, quantity reduction, and buyer/seller statutory-tax equivalence.

### Question architecture
Each asset receives **6 graph-dependent questions**: 1 easy, 2 medium, 1 hard, 1 elite, and 1 Legendary. Total: **24 new questions**.

| Difficulty | New questions | Purpose |
|---|---:|---|
| Easy | 4 | Direct binding/price reading and tax-graph fundamentals |
| Medium | 8 | Shortage/surplus, transaction quantities, wedges, and direct calculations |
| Hard | 4 | Multi-step decomposition, revenue, and market-size effects |
| Elite | 4 | Misconception detection, incidence, and transaction-limit reasoning |
| Legendary | 4 | Rationing, labor-market adjustment, legal-versus-economic incidence, and tax-equivalence synthesis |

### Quality rules applied
- Every question is self-contained. No “same market,” “as before,” or prior-question dependency.
- Every question needs the graph or graph-specific values; no decorative image attachments.
- No axis-identification questions and no stale “refer to the graph” filler.
- Quantity demanded/supplied is kept separate from quantity actually traded under binding controls.
- Statutory tax placement is kept separate from economic incidence.
- Exact units preserve “thousands” where printed on the source graph.
- Correct-answer positions are perfectly balanced: 6 / 6 / 6 / 6.

## 3. Question build results
- **24** new canonical graph questions
- **6 Price Ceiling**, **6 Price Floor**, **6 Tax Wedges & Revenue**, **6 Statutory vs Economic Tax Incidence**
- **4** new canonical graph assets
- Canonical library: **8,025 → 8,049 questions**
- Asset inventory: **404 → 408 assets**
- Price Ceilings graph coverage: **13 → 19**
- Price Floors graph coverage: **10 → 16**
- Tax Wedges & Revenue graph coverage: **15 → 21**
- Statutory vs Economic Tax Incidence graph coverage: **2 → 8**

## 4. Validation
- All four asset files exist and match their registered SHA-256 hashes.
- All 24 answer hashes resolve to exactly one option.
- Correct-answer positions: **6 / 6 / 6 / 6**.
- Source-integrity comparison: **0 existing questions changed, 0 removed; 24 added**.
- Near-duplicate scan against the preexisting ceiling/floor/tax bank: **0 high-similarity flags at ≥0.80**.
- Question-independence / graph-hygiene regression: **PASS** — 0 unsafe context starts, 0 orphan graph references, 0 axis-giveaway images.
- Seven-mode production-family composition: **PASS** for Market Policy Set, Micro Policy Core, and Market Foundations plus Policy. No failed modes, answer-hash issues, or asset-hash issues.
- The four touched child concepts remain intentionally **best-paired/supplemental**, matching their existing registry status. Solo Standard/Score compositions still lack early boss pools; this is pre-existing structure, not a Phase Graph 2 regression.
- Statutory versus Economic Tax Incidence still emits its pre-existing “no direct repair route” warning when used in a family. The family compositions nevertheless pass every mode.

## 5. New-question appendix
### CEILING-01
- **PG2-CEIL-E-001 — Easy**: The apartment market shown has an equilibrium rent of $2,000 per month. How should the legal maximum rent of $1,000 be classified?  
  Correct: A binding price ceiling because it is below the equilibrium rent
- **PG2-CEIL-M-001 — Medium**: At the $1,000 rent ceiling shown, landlords offer 50 apartments while renters demand 250. What shortage does the graph imply?  
  Correct: 200 apartments
- **PG2-CEIL-M-002 — Medium**: At the binding $1,000 rent ceiling, what is the maximum number of apartments that can be rented if transactions cannot exceed the number landlords offer?  
  Correct: 50 apartments
- **PG2-CEIL-H-001 — Hard**: Compare the $2,000 equilibrium with the $1,000 ceiling. Which decomposition correctly explains the 200-apartment shortage?  
  Correct: Quantity demanded rises by 100 and quantity supplied falls by 100, creating a 200-apartment gap
- **PG2-CEIL-EL-001 — Elite**: A student looks at the $1,000 ceiling and says, “Because 250 apartments are demanded, 250 apartments will be rented.” What is the graph-based correction?  
  Correct: Only 50 apartments are supplied, so at most 50 can be rented and 200 apartments of demand go unsatisfied
- **PG2-CEIL-L-001 — Legendary**: The $1,000 ceiling leaves 250 renters seeking apartments but only 50 apartments offered. Which conclusion follows most directly from the graph and the logic of a binding ceiling?  
  Correct: Two hundred apartments of excess demand must be rationed somehow, and the graph alone cannot determine which renters obtain the 50 available units

### FLOOR-01
- **PG2-FLR-E-001 — Easy**: The labor market shown has an equilibrium wage of $7 per hour. How should the $10 legal minimum wage be classified?  
  Correct: A binding price floor because it is above the equilibrium wage
- **PG2-FLR-M-001 — Medium**: At the $10 wage floor shown, 250 thousand workers want jobs while firms demand 100 thousand workers. What labor surplus results?  
  Correct: 150 thousand workers
- **PG2-FLR-M-002 — Medium**: At the binding $10 minimum wage, how many workers can be employed if employment cannot exceed firms’ quantity of labor demanded?  
  Correct: 100 thousand workers
- **PG2-FLR-H-001 — Hard**: Compare the $7 labor-market equilibrium with the $10 wage floor. Which decomposition correctly explains the 150-thousand-worker labor surplus?  
  Correct: Labor supplied rises by 75 thousand while labor demanded falls by 75 thousand, creating a 150-thousand-worker gap
- **PG2-FLR-EL-001 — Elite**: A student says the $10 minimum wage raises employment to 250 thousand because 250 thousand workers are willing to work. What is the strongest correction using the graph?  
  Correct: Firms demand only 100 thousand workers at $10, so employment is limited to 100 thousand and 150 thousand workers are left in surplus
- **PG2-FLR-L-001 — Legendary**: Using the graph, compare the $10 binding minimum wage with the $7 competitive equilibrium. Which transition is correct if the floor is reduced from $10 to $7?  
  Correct: Employment rises from 100 thousand to 175 thousand and the 150-thousand-worker labor surplus disappears

### TAX-01
- **PG2-TAX-E-001 — Easy**: In the displayed movie market, how large is the vertical gap between S0 and the parallel “Supply with tax” curve at a given quantity?  
  Correct: $4 per movie
- **PG2-TAX-M-001 — Medium**: After the seller-side tax shown, quantity falls to 100 thousand movies. What prices do buyers pay and sellers receive?  
  Correct: Buyers pay $14 and sellers receive $10
- **PG2-TAX-M-002 — Medium**: The graph shows quantity falling from 140 thousand movies before the tax to 100 thousand after the tax. By how much does market quantity fall?  
  Correct: 40 thousand movies
- **PG2-TAX-H-001 — Hard**: The graph implies a $4 tax per movie and a post-tax quantity of 100 thousand movies. How much tax revenue is collected?  
  Correct: $400,000
- **PG2-TAX-EL-001 — Elite**: Before the tax, the movie market is at $12. After the tax, buyers pay $14 and sellers receive $10. Which burden calculation matches the graph?  
  Correct: Buyers bear $2 per movie and sellers bear $2 per movie
- **PG2-TAX-L-001 — Legendary**: The tax is drawn as an upward shift of supply, yet the graph shows buyers paying $2 more, sellers receiving $2 less, and quantity falling by 40 thousand. What is the best synthesis?  
  Correct: Legal placement on sellers does not force sellers to bear the entire economic burden; the tax creates a $4 wedge shared by both sides and reduces trade

### TAX-02
- **PG2-STX-E-001 — Easy**: At the post-tax quantity of 60 thousand movies, what price do sellers receive according to the supply curve?  
  Correct: $7.50 per movie
- **PG2-STX-M-001 — Medium**: At 60 thousand movies, buyers pay $13.50 while sellers receive $7.50. What per-unit tax wedge separates those prices?  
  Correct: $6 per movie
- **PG2-STX-M-002 — Medium**: The original equilibrium price is $10.50. After the buyer-side tax, buyers pay $13.50 and sellers receive $7.50. How is the $6 economic burden split?  
  Correct: $3 on buyers and $3 on sellers
- **PG2-STX-H-001 — Hard**: The graph shows the original quantity at 100 thousand movies and the post-tax quantity at 60 thousand. What market effect accompanies the buyer-side tax?  
  Correct: Quantity traded falls by 40 thousand movies
- **PG2-STX-EL-001 — Elite**: Suppose the same $6 per-movie tax were legally collected from sellers instead of buyers, with the same supply and demand curves. What standard supply-and-demand result should be expected?  
  Correct: The same 60-thousand quantity, $13.50 buyer price, and $7.50 seller receipt
- **PG2-STX-L-001 — Legendary**: A student sees “Demand with tax” and concludes, “Buyers must bear the full $6 because the tax is legally placed on them.” Which graph-based accounting defeats that claim?  
  Correct: Buyers pay $3 more than the original price, sellers receive $3 less, and the $6 wedge is therefore shared equally in this market
