# Phase 2A Market Gate Graph Question Inventory

## Final Committed Graph Asset Inventory

All files were already committed before Phase 2A. Direct visual inspection and SHA-256 comparison confirmed valid, matching WebP bytes in Composer, Market Gate, and Equilibrium Crisis. No WebP was renamed or modified.

| Final Filename | Family | Composer Present | Market Gate Present | Equilibrium Crisis Present | Alt Text Verified | New Market Gate Questions |
|---|---|---|---|---|---|---|
| PPF-01.webp | PPF | PASS: `build/faculty-build-composer/data/question-assets/production-possibilities-frontier/PPF-01.webp` | PASS | PASS | PASS | 40000, 40001, 40002 |
| PPF-02.webp | PPF | PASS: `build/faculty-build-composer/data/question-assets/production-possibilities-frontier/PPF-02.webp` | PASS | PASS | PASS | 40003, 40004, 40005 |
| DEMAND-SUPPLY-03.webp | Demand / supply | PASS: `build/faculty-build-composer/data/question-assets/market-equilibrium/DEMAND-SUPPLY-03.webp` | PASS | PASS | PASS | 40006, 40007, 40008 |
| DEMAND-SUPPLY-04.webp | Demand / supply | PASS: `build/faculty-build-composer/data/question-assets/market-equilibrium/DEMAND-SUPPLY-04.webp` | PASS | PASS | PASS | 40009, 40010, 40011 |
| DEMAND-SUPPLY-05.webp | Demand / supply | PASS: `build/faculty-build-composer/data/question-assets/market-equilibrium/DEMAND-SUPPLY-05.webp` | PASS | PASS | PASS | 40012, 40013, 40014 |
| DEMAND-SUPPLY-06.webp | Demand / supply | PASS: `build/faculty-build-composer/data/question-assets/market-equilibrium/DEMAND-SUPPLY-06.webp` | PASS | PASS | PASS | 40015, 40016, 40017 |
| DEMAND-SUPPLY-07.webp | Demand / supply | PASS: `build/faculty-build-composer/data/question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp` | PASS | PASS | PASS | 40018, 40019, 40020 |
| CEILING-02.webp | Price ceiling | PASS: `build/faculty-build-composer/data/question-assets/binding-price-ceilings/CEILING-02.webp` | PASS | PASS | PASS | 40021, 40022, 40023 |
| CEILING-03.webp | Price ceiling | PASS: `build/faculty-build-composer/data/question-assets/binding-price-ceilings/CEILING-03.webp` | PASS | PASS | PASS | 40024, 40025, 40026 |
| FLOOR-02.webp | Price floor | PASS: `build/faculty-build-composer/data/question-assets/binding-price-floors/FLOOR-02.webp` | PASS | PASS | PASS | 40027, 40028, 40029 |
| FLOOR-03.webp | Price floor | PASS: `build/faculty-build-composer/data/question-assets/binding-price-floors/FLOOR-03.webp` | PASS | PASS | PASS | 40030, 40031, 40032 |
| TAX-02.webp | Tax | PASS: `build/faculty-build-composer/data/question-assets/tax-wedges-and-revenue/TAX-02.webp` | PASS | PASS | PASS | 40033, 40034, 40035 |
| TAX-03.webp | Tax | PASS: `build/faculty-build-composer/data/question-assets/tax-wedges-and-revenue/TAX-03.webp` | PASS | PASS | PASS | 40036, 40037, 40038 |
| TAX-04.webp | Tax | PASS: `build/faculty-build-composer/data/question-assets/tax-wedges-and-revenue/TAX-04.webp` | PASS | PASS | PASS | 40039, 40040, 40041 |
| TAX-05.webp | Tax | PASS: `build/faculty-build-composer/data/question-assets/tax-wedges-and-revenue/TAX-05.webp` | PASS | PASS | PASS | 40042, 40043, 40044 |
| TAX-06.webp | Tax | PASS: `build/faculty-build-composer/data/question-assets/tax-wedges-and-revenue/TAX-06.webp` | PASS | PASS | PASS | 40045, 40046, 40047 |

## New Graph Questions

| ID | Final Graph | Objective | Primary Skill | Type | Difficulty | Correct-Answer Concept / Feedback | Alt | Standard Eligibility | Trial-by-Graph Eligibility |
|---:|---|---|---|---|---|---|---|---|---|
| 40000 | PPF-01.webp | LO2.2 | ppf_opportunity_cost | graph_calculation | medium | The move gains 40 pizzas and gives up 40 robots, so each pizza costs 1 robot. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40006 | DEMAND-SUPPLY-03.webp | LO4.3 | supply_shifters | graph_interpretation | medium | Supply shifts left; price rises from 10 to 12 and quantity falls from 200 to 150 thousand. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40009 | DEMAND-SUPPLY-04.webp | LO4.2 | demand_shifters | graph_interpretation | medium | Demand shifts right; price rises from 10 to 12 and quantity rises from 200 to 250 thousand. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40021 | CEILING-02.webp | LO6.1 | binding_price_ceiling | graph_interpretation | medium | A legal maximum below equilibrium blocks the clearing price. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40027 | FLOOR-02.webp | LO6.2 | binding_price_floor | graph_interpretation | medium | A legal minimum above equilibrium blocks the clearing wage. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40033 | TAX-02.webp | LO6.3 | tax_wedge_incidence | graph_calculation | medium | Buyers pay 12 and sellers receive 8. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40036 | TAX-03.webp | LO6.3 | tax_quantity_effect | graph_interpretation | medium | Taxed supply intersects demand at 150 thousand. | PASS | PASS: present in `medium` bank | METADATA PASS; standalone mode absent |
| 40001 | PPF-01.webp | LO2.2 | increasing_opportunity_cost | graph_interpretation | hard | The frontier becomes steeper as pizza production rises, showing increasing robot cost per pizza. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40003 | PPF-02.webp | LO2.2 | ppf_opportunity_cost | graph_calculation | hard | The move gives up 40 fries for 20 burgers, or 2 fries per burger. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40007 | DEMAND-SUPPLY-03.webp | LO4.3 | supply_shifters | graph_integration | hard | Higher operating costs reduce supply while demand remains unchanged. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40010 | DEMAND-SUPPLY-04.webp | LO4.2 | related_goods_demand | graph_integration | hard | A higher substitute price increases demand for movie tickets. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40012 | DEMAND-SUPPLY-05.webp | LO4.4 | simultaneous_shifts | graph_calculation | hard | The quantity effects offset while price rises from 10 to 14 dollars. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40015 | DEMAND-SUPPLY-06.webp | LO4.4 | equilibrium_prediction | graph_interpretation | hard | D is D0-S0 and C is D1-S0. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40018 | DEMAND-SUPPLY-07.webp | LO4.4 | equilibrium_prediction | graph_interpretation | hard | A is D0-S1 and B is D1-S1. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40022 | CEILING-02.webp | LO6.1 | ceiling_shortage_calculation | graph_calculation | hard | Quantity demanded 300 minus quantity supplied 100 equals 200 thousand. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40024 | CEILING-03.webp | LO6.1 | binding_price_controls | graph_interpretation | hard | The maximum is above equilibrium. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40028 | FLOOR-02.webp | LO6.2 | floor_surplus_calculation | graph_calculation | hard | Labor supplied 250 minus labor demanded 150 equals 100 thousand. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40030 | FLOOR-03.webp | LO6.2 | binding_price_controls | graph_interpretation | hard | The minimum is below equilibrium. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40034 | TAX-02.webp | LO6.3 | tax_revenue_calculation | graph_calculation | hard | Four dollars times 150 thousand is 600,000; quantity falls by 50 thousand. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40037 | TAX-03.webp | LO6.5 | tax_burden_split | graph_calculation | hard | Buyer price rises 6 dollars; 6 of 8 is 75 percent. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40039 | TAX-04.webp | LO6.3 | tax_revenue_calculation | graph_calculation | hard | The 4 dollar wedge applies to 200 thousand trips. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40042 | TAX-05.webp | LO6.3 | tax_revenue_calculation | graph_calculation | hard | The 8 dollar wedge applies to 150 thousand trips. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40045 | TAX-06.webp | LO6.3 | tax_wedge_incidence | graph_calculation | hard | Buyers pay 16, sellers receive 8, and 150 thousand tickets are taxed. | PASS | PASS: present in `hard` bank | METADATA PASS; standalone mode absent |
| 40002 | PPF-01.webp | LO2.2 | ppf_efficiency_status | graph_integration | elite | Points on PPF0 are attainable now; sustaining a point outside requires an outward capacity shift. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40004 | PPF-02.webp | LO2.2 | ppf_growth | graph_integration | elite | A and B share one frontier; the outward PPF1 expands feasible production. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40008 | DEMAND-SUPPLY-03.webp | LO4.3 | movement_vs_supply_shift | graph_trap | elite | A quantity-supplied change moves along one curve; here the supply curve itself shifts. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40011 | DEMAND-SUPPLY-04.webp | LO4.2 | movement_vs_demand_shift | graph_trap | elite | Demand changes curves; the higher equilibrium is also a movement along unchanged supply. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40013 | DEMAND-SUPPLY-05.webp | LO4.4 | simultaneous_shifts | graph_integration | elite | Demand up and supply down reinforce price but oppose in quantity. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40016 | DEMAND-SUPPLY-06.webp | LO4.4 | simultaneous_shifts | graph_integration | elite | Opposing quantity effects cancel; both shifts raise price. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40017 | DEMAND-SUPPLY-06.webp | LO4.4 | market_shift_analysis | graph_trap | elite | Final equilibrium depends on final curves, not the order of shifts. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40019 | DEMAND-SUPPLY-07.webp | LO4.4 | simultaneous_shifts | graph_integration | elite | B is vertically above D at the same quantity. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40020 | DEMAND-SUPPLY-07.webp | LO4.4 | market_shift_analysis | graph_trap | elite | Labels support relative comparisons, not exact numerical changes. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40023 | CEILING-02.webp | LO6.1 | surplus_shortage_identification | graph_integration | elite | Transactions are limited by the short side, quantity supplied. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40025 | CEILING-03.webp | LO6.1 | binding_price_ceiling | graph_integration | elite | A nonbinding ceiling leaves equilibrium unchanged. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40029 | FLOOR-02.webp | LO6.2 | surplus_shortage_identification | graph_integration | elite | Employment is limited by labor demanded. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40031 | FLOOR-03.webp | LO6.2 | binding_price_floor | graph_integration | elite | A nonbinding floor leaves equilibrium unchanged. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40035 | TAX-02.webp | LO6.5 | tax_burden_split | graph_integration | elite | Buyer price rises to 12 and seller price falls to 8. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40038 | TAX-03.webp | LO6.5 | tax_incidence_less_elastic_side | graph_integration | elite | The steeper demand curve and larger buyer burden agree. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40040 | TAX-04.webp | LO6.3 | tax_wedge_incidence | graph_integration | elite | The market moves from price 12, quantity 250 to buyer 14, seller 10, quantity 200. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40041 | TAX-04.webp | LO6.3 | tax_revenue_calculation | graph_trap | elite | Only post-tax trades are taxed, yielding 800,000 dollars. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40043 | TAX-05.webp | LO6.5 | tax_incidence_less_elastic_side | graph_integration | elite | Seller price falls 6 while buyer price rises 2; steep supply is less elastic. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40044 | TAX-05.webp | LO6.5 | tax_burden_split | graph_trap | elite | Statutory placement does not prevent prices from splitting the burden. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40046 | TAX-06.webp | LO6.4 | tax_equivalence | graph_integration | elite | Equal buyer and seller taxes create the same wedge; elasticities determine burden. | PASS | PASS: present in `elite` bank | METADATA PASS; standalone mode absent |
| 40005 | PPF-02.webp | LO2.2 | ppf_growth | graph_trap | legendary | The shift expands feasible production but does not reveal which combination society prefers. | PASS | PASS: present in `legendary` bank | METADATA PASS; standalone mode absent |
| 40014 | DEMAND-SUPPLY-05.webp | LO4.4 | market_shift_analysis | graph_trap | legendary | The outcome alone is not unique; the displayed curve shifts identify the mechanism. | PASS | PASS: present in `legendary` bank | METADATA PASS; standalone mode absent |
| 40026 | CEILING-03.webp | LO6.1 | binding_price_controls | graph_trap | legendary | A ceiling is a maximum, not a mandated price. | PASS | PASS: present in `legendary` bank | METADATA PASS; standalone mode absent |
| 40032 | FLOOR-03.webp | LO6.2 | binding_price_controls | graph_trap | legendary | A floor is a minimum, not a mandated wage. | PASS | PASS: present in `legendary` bank | METADATA PASS; standalone mode absent |
| 40047 | TAX-06.webp | LO6.5 | tax_incidence_less_elastic_side | graph_integration | legendary | The buyer-side tax is legally assigned to buyers, but prices split burden 6 to buyers and 2 to sellers. | PASS | PASS: present in `legendary` bank | METADATA PASS; standalone mode absent |

## Graph Counts Before and After

| Difficulty | Before | After |
|---|---:|---:|
| medium | 38 | 45 |
| hard | 35 | 51 |
| elite | 0 | 20 |
| legendary | 20 | 25 |

### New Questions by Objective

| Objective | Count |
|---|---:|
| LO2.2 | 6 |
| LO4.2 | 3 |
| LO4.3 | 3 |
| LO4.4 | 9 |
| LO6.1 | 6 |
| LO6.2 | 6 |
| LO6.3 | 8 |
| LO6.4 | 1 |
| LO6.5 | 6 |

### New Questions by Skill

| Skill | Count |
|---|---:|
| binding_price_ceiling | 2 |
| binding_price_controls | 4 |
| binding_price_floor | 2 |
| ceiling_shortage_calculation | 1 |
| demand_shifters | 1 |
| equilibrium_prediction | 2 |
| floor_surplus_calculation | 1 |
| increasing_opportunity_cost | 1 |
| market_shift_analysis | 3 |
| movement_vs_demand_shift | 1 |
| movement_vs_supply_shift | 1 |
| ppf_efficiency_status | 1 |
| ppf_growth | 2 |
| ppf_opportunity_cost | 2 |
| related_goods_demand | 1 |
| simultaneous_shifts | 4 |
| supply_shifters | 2 |
| surplus_shortage_identification | 2 |
| tax_burden_split | 3 |
| tax_equivalence | 1 |
| tax_incidence_less_elastic_side | 3 |
| tax_quantity_effect | 1 |
| tax_revenue_calculation | 4 |
| tax_wedge_incidence | 3 |

### New Questions by Type

| Type | Count |
|---|---:|
| graph_calculation | 11 |
| graph_integration | 17 |
| graph_interpretation | 10 |
| graph_trap | 10 |

### New Questions by Graph Family

| Family | Count |
|---|---:|
| Demand / supply | 15 |
| PPF | 6 |
| Price ceiling | 6 |
| Price floor | 6 |
| Tax | 15 |

## Canonical Alt Text Inventory

| Final Asset Filename | Canonical Alt Text | Questions Using It | Normal Renderer | Lightbox |
|---|---|---|---|---|
| PPF-01.webp | A bowed PPF0 has pizzas on the horizontal axis and robots on the vertical axis. Point A is at 20 pizzas and 120 robots; point B is at 60 pizzas and 80 robots. The frontier reaches about 125 robots at zero pizzas and 100 pizzas at zero robots. | 40000, 40001, 40002 | PASS | PASS |
| PPF-02.webp | Burgers are on the horizontal axis and fries on the vertical axis. Bowed PPF0 includes A at 10 burgers and 120 fries and B at 30 burgers and 80 fries. Dashed PPF1 lies outside PPF0, reaching about 150 fries at zero burgers and 60 burgers at zero fries. | 40003, 40004, 40005 | PASS | PASS |
| DEMAND-SUPPLY-03.webp | The movie-ticket market has price in dollars vertically and quantity in thousands horizontally. Demand D0 is unchanged while supply shifts left from S0 to S1. Equilibrium moves from A at quantity 200 and price 10 dollars to B at quantity 150 and price 12 dollars. | 40006, 40007, 40008 | PASS | PASS |
| DEMAND-SUPPLY-04.webp | The movie-ticket market has price in dollars vertically and quantity in thousands horizontally. Supply S0 is unchanged while demand shifts right from D0 to D1. Equilibrium moves from A at quantity 200 and price 10 dollars to B at quantity 250 and price 12 dollars. | 40009, 40010, 40011 | PASS | PASS |
| DEMAND-SUPPLY-05.webp | The movie-ticket market has price in dollars vertically and quantity in thousands horizontally. Demand shifts right from D0 to D1 while supply shifts left from S0 to S1. Equilibrium moves from A at quantity 200 and price 10 dollars to B at quantity 200 and price 14 dollars. | 40012, 40013, 40014 | PASS | PASS |
| DEMAND-SUPPLY-06.webp | The gasoline market has price in dollars vertically and quantity in thousands of gallons per day horizontally. D1 is right of D0 and S1 is left of S0. Intersections are A at D0-S1, quantity 150 and price 5; B at D1-S1, quantity 200 and price 6; C at D1-S0, quantity 250 and price 5; and D at D0-S0, quantity 200 and price 4. | 40015, 40016, 40017 | PASS | PASS |
| DEMAND-SUPPLY-07.webp | The taco market has price vertically and quantity horizontally, without numeric tick labels. D1 is right of D0 and S1 is left of S0. A is D0-S1, B is D1-S1, C is D1-S0, and D is D0-S0. A is left of D, C is right of D, and B is vertically above D at the same quantity. | 40018, 40019, 40020 | PASS | PASS |
| CEILING-02.webp | The apartment market has monthly price vertically and quantity in thousands horizontally. D0 and S0 intersect at 200 thousand apartments and 1,500 dollars. A ceiling at 1,000 dollars intersects supply at 100 thousand and demand at 300 thousand. | 40021, 40022, 40023 | PASS | PASS |
| CEILING-03.webp | The apartment market has monthly price vertically and quantity in thousands horizontally. D0 and S0 intersect at 200 thousand apartments and 1,500 dollars. A ceiling at 2,000 dollars intersects demand at 100 thousand and supply at 300 thousand. | 40024, 40025, 40026 | PASS | PASS |
| FLOOR-02.webp | The labor market has wage vertically and quantity in thousands of workers horizontally. D0 and S0 intersect at 200 thousand workers and 12 dollars. A wage floor at 15 dollars intersects demand at 150 thousand and supply at 250 thousand. | 40027, 40028, 40029 | PASS | PASS |
| FLOOR-03.webp | The labor market has wage vertically and quantity in thousands of workers horizontally. D0 and S0 intersect at 200 thousand workers and 12 dollars. A wage floor at 6 dollars intersects demand at 300 thousand and supply at 100 thousand. | 40030, 40031, 40032 | PASS | PASS |
| TAX-02.webp | The rideshare market has price per trip vertically and quantity in thousands per day horizontally. D0 and S0 intersect at A, quantity 200 and price 10 dollars. Supply with tax intersects demand at quantity 150 and buyer price 12; original supply there gives seller price 8. | 40033, 40034, 40035 | PASS | PASS |
| TAX-03.webp | The concert-ticket market has price vertically and quantity in thousands horizontally. D0 and S0 intersect at A, quantity 200 and price 10 dollars. Supply with tax intersects demand at quantity 150 and buyer price 16; original supply there gives seller price 8. | 40036, 40037, 40038 | PASS | PASS |
| TAX-04.webp | The rideshare market has price per trip vertically and quantity in thousands per day horizontally. D0 and S0 intersect at A, quantity 250 and price 12 dollars. Supply with tax intersects demand at quantity 200 and buyer price 14; original supply there gives seller price 10. | 40039, 40040, 40041 | PASS | PASS |
| TAX-05.webp | The rideshare market has price per trip vertically and quantity in thousands per day horizontally. D0 and steep S0 intersect at A, quantity 200 and price 10 dollars. Supply with tax intersects demand at quantity 150 and buyer price 12; original supply there gives seller price 4. | 40042, 40043, 40044 | PASS | PASS |
| TAX-06.webp | The concert-ticket market has price vertically and quantity in thousands horizontally. D0 and S0 intersect at A, quantity 200 and price 10 dollars. Demand with tax intersects supply at quantity 150 and seller price 8; original demand there gives buyer price 16. | 40045, 40046, 40047 | PASS | PASS |

The normal renderer reads `imageAlt`. The lightbox is opened with the rendered image's `alt` and assigns that same text to the enlarged image. Generic fallback text remains only for legacy questions without descriptive metadata.
