# Final Repository Verification Report

Generated: 2026-08-09  
Repository tested: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`  
Git branch/commit: `main` / `95ff5f2401876e1e33f9f2420f6e40262842a4ec`

## Verdict

READY — PRODUCTION AND ACCESSIBILITY VALIDATED

## Source-of-truth finding

Before accessibility changes, the authorized GitHub repository matched the previously validated repaired cumulative library exactly at the logical and physical library levels:

- repaired version: `phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1`;
- repaired logical SHA-256, published and recomputed: `0fbd9a8ce1e1a5b3a0d35ad927b057804137953d552b43ad88f7bd8affdd65b4`;
- repaired physical library SHA-256: `0e880122100373e10346b38ea3d013e16c34a4c5a14aad4de18266a5f33c1d6a`;
- repaired website checksum-manifest SHA-256: `cfb2a725b21b9ed445f62a77f715442bd7fa0cd16e8dd78234fc2c18639cbaa3`;
- exact repaired question content retained: **yes**.

The repository's pre-pass `build.zip` SHA-256 was `247d3cfa186b78bfde47eb4b76fd539c72e9249f5923e4b6ef97c3065638f058`, rather than the previously recorded container SHA `236f8ee872648b1b8da6e7aee76a058b420d2227df8a4938ae3ff24323da1284`. This was a ZIP recompression/container difference only: all 616 archived files matched the 616 authoritative `build/` files byte-for-byte, with zero missing, extra, or different internal files. No mismatch was silently overwritten.

This release adds only canonical graph accessibility metadata and its package/rendering support. Questions, choices, answer hashes, routing, scoring, timers, and graph pixels are unchanged.

## Current identity and hashes

| Item | Value |
|---|---|
| Library version | `phase6.2i-oligopoly-rich-bank-v1-costs-graph-v2-pc-graph-v2-monopoly-graph-v2-mcomp-graph-v2-elasticity-graph-v2-trade-graph-v2-phase6.3-targeted-production-repair-v1-phase6.4-graph-accessibility-v1` |
| Logical library SHA-256 | `f42e9085b04a34af4d24c9d978470d0fb8dccf8dfc5831c8d4a7d6b75e4b5859` |
| Physical library SHA-256 | `df2c9c82ac4d18cab645bbc888d1fe534de2d8f470c3c8834ea4770703e14564` |
| Composer-library manifest SHA-256 | `35083b1866fcef78defb2d76181bc865acde220c548862901e35d3bbc30307ff` |
| Composer core SHA-256 | `86dca21f4d611cedd397ef2138b2ac5252e7932ecb329e6b73fa6d7ffd94f3ab` |
| Generated-game template SHA-256 | `4e5e037bf487fbe2ebb09c518335857f4fbb6bcdb11c3be3fe2ffcbce6425996` |
| Faculty checksum manifest SHA-256 | `3ceb7215922d5d3d8eca838751f36f90415443ea478b809b4dabf6f129688600` |
| Production `build.zip` SHA-256 | `7f70ab659ecf394375fba74bb40ac65e880fc2b558f435c0f9b217f0fdfdf8ce` |
| All-subject canonical questions / concepts | 6352 / 72 |
| Micro canonical questions / concepts | 4145 / 26 |
| Micro graph-linked questions | 765 |
| Used Micro production records / distinct visual hashes | 167 / 161 |
| Full graph asset inventory | 396 |
| Cache/version key | `20260809-graph-accessibility-v1` |

The logical SHA was independently recomputed and equals the published library and manifest value.

## Micro concept-by-concept inventory

Pool abbreviations: E easy, M medium, H hard, EL elite, L legendary, C calculation, B boss, LB legendaryBoss, R repair, BR bridge, RS repairSeed. Difficulty U means runtime-normalized rather than a stored canonical difficulty.

| Concept | Canonical ID | Total | Pools | Difficulty | Graph | Assets | Source phase |
|---|---|---:|---|---|---:|---:|---|
| Marginal Analysis | `marginal-analysis` | 50 | E:6 M:6 H:6 EL:4 L:6 C:2 B:11 LB:3 R:3 BR:2 RS:1 | E:12 M:9 H:10 EL:4 L:9 U:6 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Incentives | `incentives` | 33 | E:4 M:4 H:4 EL:2 L:6 B:6 LB:3 R:2 BR:1 RS:1 | E:7 M:7 H:4 EL:2 L:9 U:4 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Comparative Advantage and Gains from Trade | `gains-from-trade` | 46 | E:6 M:6 H:6 EL:4 L:6 B:9 LB:3 R:3 BR:2 RS:1 | E:9 M:9 H:9 EL:4 L:9 U:6 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Market Failures | `market-failures` | 29 | E:5 M:4 H:4 EL:2 L:3 B:6 R:2 BR:1 RS:2 | E:8 M:7 H:4 EL:2 L:3 U:5 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Production Possibilities Frontier | `production-possibilities-frontier` | 79 | E:8 M:9 H:9 EL:5 L:14 C:11 B:9 LB:3 R:3 BR:8 | E:12 M:16 H:18 EL:5 L:17 U:11 | 23 | 1 | `phase6.4-graph-accessibility-v1` |
| Positive versus Normative Analysis | `positive-versus-normative-analysis` | 24 | E:3 M:2 H:2 EL:1 L:6 B:3 LB:3 R:2 BR:2 | E:6 M:2 H:2 EL:1 L:9 U:4 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Economists and Policy | `economist-policy-role` | 20 | E:4 M:4 H:3 EL:2 L:3 R:2 BR:1 RS:1 | E:4 M:4 H:3 EL:2 L:3 U:4 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Competitive Markets | `competitive-markets` | 27 | E:4 M:4 H:4 EL:2 L:3 B:6 R:2 BR:1 RS:1 | E:7 M:7 H:4 EL:2 L:3 U:4 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Demand | `demand` | 53 | E:8 M:6 H:7 EL:4 L:6 B:9 LB:3 R:4 BR:6 | E:11 M:9 H:10 EL:4 L:9 U:10 | 4 | 1 | `phase6.4-graph-accessibility-v1` |
| Supply | `supply` | 48 | E:6 M:6 H:6 EL:4 L:6 B:9 LB:3 R:4 BR:4 | E:9 M:9 H:9 EL:4 L:9 U:8 | 2 | 1 | `phase6.4-graph-accessibility-v1` |
| Market Equilibrium | `market-equilibrium` | 76 | E:6 M:14 H:11 EL:4 L:15 C:4 B:12 LB:3 R:3 BR:4 | E:9 M:20 H:18 EL:4 L:18 U:7 | 17 | 2 | `phase6.4-graph-accessibility-v1` |
| Price Signals | `price-signals` | 27 | E:4 M:4 H:4 EL:2 L:3 B:6 R:2 BR:1 RS:1 | E:4 M:7 H:7 EL:2 L:3 U:4 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Price Ceilings | `binding-price-ceilings` | 59 | E:6 M:9 H:5 EL:5 L:9 C:6 B:6 LB:3 R:4 BR:6 | E:7 M:11 H:14 EL:5 L:12 U:10 | 13 | 1 | `phase6.4-graph-accessibility-v1` |
| Price Floors | `binding-price-floors` | 49 | E:5 M:6 H:5 EL:3 L:7 C:6 B:6 LB:3 R:4 BR:4 | E:6 M:8 H:14 EL:3 L:10 U:8 | 10 | 1 | `phase6.4-graph-accessibility-v1` |
| Tax Wedges and Revenue | `tax-wedges-and-revenue` | 43 | E:2 M:7 H:4 EL:4 L:8 C:8 B:3 LB:3 R:2 BR:2 | E:4 M:10 H:10 EL:4 L:11 U:4 | 15 | 1 | `phase6.4-graph-accessibility-v1` |
| Statutory versus Economic Tax Incidence | `statutory-versus-economic-tax-incidence` | 19 | E:1 M:1 H:2 EL:2 L:4 B:3 LB:3 BR:2 RS:1 | E:1 M:1 H:5 EL:2 L:7 U:3 | 2 | 1 | `phase6.4-graph-accessibility-v1` |
| Tax Incidence | `tax-incidence` | 47 | E:4 M:4 H:3 EL:8 L:8 C:10 B:3 LB:3 R:2 BR:2 | E:4 M:7 H:13 EL:8 L:11 U:4 | 10 | 1 | `phase6.4-graph-accessibility-v1` |
| Integrated Economic Analysis | `integrated-economic-analysis` | 94 | EL:5 L:7 B:56 LB:24 BR:2 | E:8 M:24 H:24 EL:5 L:31 U:2 | 0 | 0 | `phase6.4-graph-accessibility-v1` |
| Elasticity | `elasticity` | 418 | E:39 M:39 H:39 EL:38 L:97 C:30 B:60 LB:36 R:20 BR:20 | E:59 M:59 H:89 EL:38 L:133 U:40 | 48 | 4 | `phase6.4-graph-accessibility-v1` |
| Consumer and Producer Surplus | `consumer-and-producer-surplus` | 370 | E:30 M:30 H:30 EL:30 L:90 C:30 B:54 LB:36 R:20 BR:20 | E:48 M:48 H:78 EL:30 L:126 U:40 | 64 | 12 | `phase6.4-graph-accessibility-v1` |
| International Trade and Trade Policy | `international-trade-and-trade-policy` | 426 | E:40 M:42 H:42 EL:38 L:100 C:30 B:58 LB:36 R:20 BR:20 | E:60 M:61 H:91 EL:38 L:136 U:40 | 92 | 25 | `phase6.4-graph-accessibility-v1` |
| Costs of Production | `costs-of-production` | 442 | E:44 M:46 H:46 EL:42 L:98 C:30 B:60 LB:36 R:20 BR:20 | E:64 M:66 H:96 EL:42 L:134 U:40 | 95 | 22 | `phase6.4-graph-accessibility-v1` |
| Perfect Competition | `perfect-competition` | 454 | E:46 M:48 H:48 EL:44 L:100 C:30 B:62 LB:36 R:20 BR:20 | E:66 M:68 H:100 EL:44 L:136 U:40 | 120 | 28 | `phase6.4-graph-accessibility-v1` |
| Monopoly | `monopoly` | 430 | E:42 M:44 H:44 EL:40 L:96 C:30 B:58 LB:36 R:20 BR:20 | E:61 M:63 H:94 EL:40 L:132 U:40 | 72 | 16 | `phase6.4-graph-accessibility-v1` |
| Monopolistic Competition | `monopolistic-competition` | 412 | E:39 M:39 H:39 EL:37 L:95 C:30 B:57 LB:36 R:20 BR:20 | E:58 M:58 H:88 EL:37 L:131 U:40 | 55 | 8 | `phase6.4-graph-accessibility-v1` |
| Oligopoly | `oligopoly` | 370 | E:30 M:30 H:30 EL:30 L:90 C:30 B:54 LB:36 R:20 BR:20 | E:48 M:48 H:78 EL:30 L:126 U:40 | 123 | 42 | `phase6.4-graph-accessibility-v1` |

All rows have zero invalid executable metadata and no discrepancy against the repaired cumulative library. Historical absolute paths inside provenance strings are lineage only; production loads no stale external file. Micro has zero duplicate canonical IDs and one executable canonical bank per concept.

### First and last IDs by pool

| Canonical ID | First…last by populated pool |
|---|---|
| `marginal-analysis` | E:ECON-MG-EASY-5…P52A-MARG-E-004; M:ECON-MG-MEDIUM-101…P52A-MARG-M-005; H:P52A-MARG-H-001…P52A-MARG-H-006; EL:ECON-MG-ELITE-332…P52A-MARG-EL-003; L:ECON-MG-LEGENDARY-9012…P52A-MARG-L-005; C:ECON-MG-EASY-7…ECON-MG-HARD-201; B:ECON-EC-EASYBOSS-17006…P52A-MARG-B3-003; LB:ECON-MG-LEGENDARYBOSS-9106…ECON-MG-LEGENDARYBOSS-9108; R:P52A-MARG-R-001…P52A-MARG-R-003; BR:P52A-MARG-BR-001…P52A-MARG-BR-002; RS:ECON-MG-CORE-MARGINAL-30001…ECON-MG-CORE-MARGINAL-30001 |
| `incentives` | E:ECON-MG-EASY-8…P52B-INC-E-002; M:ECON-MG-MEDIUM-102…P52B-INC-M-002; H:ECON-MG-HARD-202…P52B-INC-H-002; EL:P52B-INC-EL-001…P52B-INC-EL-002; L:ECON-MG-LEGENDARY-9043…ECON-MG-LEGENDARY-9088; B:ECON-MG-EASYBOSS-2007…P52B-INC-B2-003; LB:ECON-MG-LEGENDARYBOSS-9109…ECON-MG-LEGENDARYBOSS-9111; R:P52B-INC-R-001…P52B-INC-R-002; BR:P52B-INC-BR-001…P52B-INC-BR-001; RS:ECON-MG-CORE-INCENTIVES-30005…ECON-MG-CORE-INCENTIVES-30005 |
| `gains-from-trade` | E:ECON-MG-EASY-10…P52B-TRADE-E-005; M:P52B-TRADE-M-001…P52B-TRADE-M-006; H:P52B-TRADE-H-001…P52B-TRADE-H-006; EL:P52B-TRADE-EL-001…P52B-TRADE-EL-004; L:P52B-TRADE-L-001…P52B-TRADE-L-006; B:P52B-TRADE-B1-001…P52B-TRADE-B3-003; LB:P52B-TRADE-LB-001…P52B-TRADE-LB-003; R:P52B-TRADE-R-001…P52B-TRADE-R-003; BR:P52B-TRADE-BR-001…P52B-TRADE-BR-002; RS:ECON-MG-CORE-TRADE-30010…ECON-MG-CORE-TRADE-30010 |
| `market-failures` | E:ECON-MG-EASY-11…ECON-MG-EASY-15; M:ECON-MG-MEDIUM-106…P52B-MFAIL-M-002; H:P52B-MFAIL-H-001…P52B-MFAIL-H-004; EL:ECON-MG-ELITE-337…ECON-MG-ELITE-338; L:P52B-MFAIL-L-001…P52B-MFAIL-L-003; B:ECON-MG-EASYBOSS-2016…P52B-MFAIL-B2-003; R:P52B-MFAIL-R-001…P52B-MFAIL-R-002; BR:P52B-MFAIL-BR-001…P52B-MFAIL-BR-001; RS:ECON-MG-CORE-MARKET-FAILURE-30006…ECON-MG-CORE-MARKETS-30011 |
| `production-possibilities-frontier` | E:ECON-MG-EASY-20…ECON-MG-EASY-27; M:ECON-MG-MEDIUM-109…ECON-MG-MEDIUM-158; H:ECON-MG-HARD-206…ECON-MG-HARD-257; EL:ECON-MG-ELITE-327…ECON-MG-ELITE-331; L:ECON-EC-LEGENDARY-14007…ECON-MG-LEGENDARY-9083; C:ECON-MG-EASY-28…ECON-MG-MEDIUM-156; B:ECON-MG-EASYBOSS-2011…P52B-S4-PPF-B3-003; LB:ECON-MG-LEGENDARYBOSS-9115…ECON-MG-LEGENDARYBOSS-9117; R:ECON-MG-PPF-OPPORTUNITY-COST-5010…P52B-S4-PPF-R-001; BR:ECON-MG-INCREASING-OPPORTUNITY-COST-6020…ECON-MG-PPF-OPPORTUNITY-COST-6015 |
| `positive-versus-normative-analysis` | E:ECON-MG-EASY-32…ECON-MG-EASY-34; M:ECON-MG-MEDIUM-113…ECON-MG-MEDIUM-114; H:ECON-MG-HARD-210…ECON-MG-HARD-211; EL:ECON-MG-ELITE-336…ECON-MG-ELITE-336; L:ECON-MG-LEGENDARY-9052…ECON-MG-LEGENDARY-9087; B:ECON-MG-EASYBOSS-2012…ECON-MG-EASYBOSS-2014; LB:ECON-MG-LEGENDARYBOSS-9118…ECON-MG-LEGENDARYBOSS-9120; R:ECON-MG-POSITIVE-VS-NORMATIVE-5012…ECON-MG-POSITIVE-VS-NORMATIVE-5013; BR:ECON-MG-POSITIVE-VS-NORMATIVE-6022…ECON-MG-POSITIVE-VS-NORMATIVE-6023 |
| `economist-policy-role` | E:ECON-MG-EASY-35…P52B-EPOL-E-003; M:P52B-EPOL-M-001…P52B-EPOL-M-004; H:P52B-EPOL-H-001…P52B-EPOL-H-003; EL:P52B-EPOL-EL-001…P52B-EPOL-EL-002; L:P52B-EPOL-L-001…P52B-EPOL-L-003; R:P52B-EPOL-R-001…P52B-EPOL-R-002; BR:P52B-EPOL-BR-001…P52B-EPOL-BR-001; RS:ECON-MG-CORE-POLICY-30013…ECON-MG-CORE-POLICY-30013 |
| `competitive-markets` | E:ECON-MG-EASY-36…P52B-COMP-E-002; M:P52B-COMP-M-001…P52B-COMP-M-004; H:P52B-COMP-H-001…P52B-COMP-H-004; EL:P52B-COMP-EL-001…P52B-COMP-EL-002; L:P52B-COMP-L-001…P52B-COMP-L-003; B:ECON-MG-MEDIUMBOSS-3002…P52B-COMP-B1-003; R:P52B-COMP-R-001…P52B-COMP-R-002; BR:P52B-COMP-BR-001…P52B-COMP-BR-001; RS:ECON-MG-CORE-COMPETITIVE-MARKET-30007…ECON-MG-CORE-COMPETITIVE-MARKET-30007 |
| `demand` | E:ECON-MG-EASY-38…ECON-MG-EASY-45; M:ECON-MG-MEDIUM-117…ECON-MG-MEDIUM-167; H:ECON-MG-HARD-215…ECON-MG-HARD-262; EL:ECON-MG-ELITE-322…P52B-S3-DEM-EL-002; L:ECON-MG-LEGENDARY-9017…P52B-S3-DEM-L-001; B:ECON-MG-MEDIUMBOSS-3004…P52B-S3-DEM-B3-003; LB:ECON-MG-LEGENDARYBOSS-9121…ECON-MG-LEGENDARYBOSS-9123; R:ECON-MG-DEMAND-SHIFTERS-5004…ECON-MG-MOVEMENT-VS-DEMAND-SHIFT-5001; BR:ECON-MG-DEMAND-SHIFTERS-6004…ECON-MG-RELATED-GOODS-DEMAND-6007 |
| `supply` | E:ECON-MG-EASY-46…P52B-S2-SUP-E-001; M:ECON-MG-MEDIUM-122…P52B-S2-SUP-M-001; H:ECON-MG-HARD-220…P52B-S2-SUP-H-001; EL:ECON-MG-ELITE-323…P52B-S2-SUP-EL-003; L:P52B-S2-SUP-L-001…P52B-S2-SUP-L-006; B:ECON-MG-MEDIUMBOSS-3007…P52B-S2-SUP-B3-003; LB:ECON-MG-LEGENDARYBOSS-9124…ECON-MG-LEGENDARYBOSS-9126; R:ECON-MG-MOVEMENT-VS-SUPPLY-SHIFT-5002…ECON-MG-SUPPLY-SHIFTERS-5007; BR:ECON-MG-MOVEMENT-VS-SUPPLY-SHIFT-6002…ECON-MG-SUPPLY-SHIFTERS-6009 |
| `market-equilibrium` | E:ECON-MG-EASY-51…P52B-S3-MEQ-E-001; M:ECON-MG-MEDIUM-126…ECON-MG-MEDIUM-170; H:ECON-MG-HARD-224…ECON-MG-HARD-265; EL:ECON-MG-ELITE-305…P52B-S3-MEQ-EL-001; L:ECON-MG-LEGENDARY-9015…ECON-MG-LEGENDARY-9034; C:ECON-MG-HARD-228…ECON-MG-HARD-231; B:ECON-MG-MEDIUMBOSS-3010…P52B-S3-MEQ-B3-003; LB:ECON-MG-LEGENDARYBOSS-9127…ECON-MG-LEGENDARYBOSS-9129; R:ECON-MG-EQUILIBRIUM-PREDICTION-5008…P52B-S3-MEQ-R-001; BR:ECON-MG-EQUILIBRIUM-PREDICTION-6010…ECON-MG-SURPLUS-SHORTAGE-IDENTIFICATION-6013 |
| `price-signals` | E:ECON-MG-EASY-56…P52B-PSIG-E-001; M:P52B-PSIG-M-001…P52B-PSIG-M-004; H:P52B-PSIG-H-001…P52B-PSIG-H-004; EL:P52B-PSIG-EL-001…P52B-PSIG-EL-002; L:P52B-PSIG-L-001…P52B-PSIG-L-003; B:ECON-MG-MEDIUMBOSS-3016…P52B-PSIG-B3-003; R:P52B-PSIG-R-001…P52B-PSIG-R-002; BR:P52B-PSIG-BR-001…P52B-PSIG-BR-001; RS:ECON-MG-CORE-PRICE-SIGNAL-30008…ECON-MG-CORE-PRICE-SIGNAL-30008 |
| `binding-price-ceilings` | E:ECON-MG-EASY-59…ECON-MG-EASY-79; M:ECON-MG-MEDIUM-132…ECON-MG-MEDIUM-179; H:ECON-MG-HARD-236…ECON-MG-HARD-273; EL:ECON-MG-ELITE-300…ECON-MG-ELITE-324; L:ECON-MG-LEGENDARY-9035…ECON-MG-LEGENDARY-9050; C:ECON-MG-EASY-63…ECON-MG-MEDIUM-174; B:ECON-MG-FINALBOSS-4000…ECON-MG-FINALBOSS-4019; LB:ECON-MG-LEGENDARYBOSS-9130…ECON-MG-LEGENDARYBOSS-9132; R:ECON-MG-BINDING-PRICE-CEILING-5014…ECON-MG-CEILING-SHORTAGE-CALCULATION-5017; BR:ECON-MG-BINDING-PRICE-CEILING-6024…ECON-MG-CEILING-SHORTAGE-CALCULATION-6027 |
| `binding-price-floors` | E:ECON-MG-EASY-64…ECON-MG-EASY-80; M:ECON-MG-MEDIUM-136…ECON-MG-MEDIUM-177; H:ECON-MG-HARD-240…ECON-MG-HARD-272; EL:ECON-MG-ELITE-301…ECON-MG-ELITE-312; L:ECON-MG-LEGENDARY-9036…ECON-MG-LEGENDARY-9053; C:ECON-MG-EASY-68…ECON-MG-MEDIUM-178; B:ECON-MG-FINALBOSS-4004…ECON-MG-FINALBOSS-4003; LB:ECON-MG-LEGENDARYBOSS-9133…ECON-MG-LEGENDARYBOSS-9135; R:ECON-MG-BINDING-PRICE-FLOOR-5018…ECON-MG-FLOOR-SURPLUS-CALCULATION-5021; BR:ECON-MG-BINDING-PRICE-FLOOR-6028…ECON-MG-FLOOR-SURPLUS-CALCULATION-6031 |
| `tax-wedges-and-revenue` | E:ECON-MG-EASY-69…ECON-MG-EASY-70; M:ECON-MG-MEDIUM-139…ECON-MG-MEDIUM-189; H:ECON-MG-HARD-246…ECON-MG-HARD-284; EL:ECON-MG-ELITE-302…ECON-MG-ELITE-326; L:ECON-MG-LEGENDARY-9055…ECON-MG-LEGENDARY-9074; C:ECON-MG-EASY-71…ECON-MG-MEDIUM-187; B:ECON-MG-FINALBOSS-4006…ECON-MG-FINALBOSS-4017; LB:ECON-MG-LEGENDARYBOSS-9136…ECON-MG-LEGENDARYBOSS-9138; R:ECON-MG-TAX-WEDGE-INCIDENCE-5022…ECON-MG-TAX-WEDGE-INCIDENCE-5023; BR:ECON-MG-TAX-WEDGE-INCIDENCE-6034…ECON-MG-TAX-WEDGE-INCIDENCE-6035 |
| `statutory-versus-economic-tax-incidence` | E:ECON-MG-EASY-73…ECON-MG-EASY-73; M:ECON-MG-MEDIUM-143…ECON-MG-MEDIUM-143; H:ECON-MG-HARD-247…ECON-MG-HARD-282; EL:ECON-MG-ELITE-303…ECON-MG-ELITE-320; L:ECON-MG-LEGENDARY-9062…ECON-MG-LEGENDARY-9073; B:ECON-MG-FINALBOSS-4009…ECON-MG-FINALBOSS-4018; LB:ECON-MG-LEGENDARYBOSS-9139…ECON-MG-LEGENDARYBOSS-9141; BR:ECON-MG-TAX-EQUIVALENCE-6036…ECON-MG-TAX-EQUIVALENCE-6037; RS:ECON-MG-CORE-TAX-EQUIVALENCE-30009…ECON-MG-CORE-TAX-EQUIVALENCE-30009 |
| `tax-incidence` | E:ECON-MG-EASY-74…ECON-MG-EASY-77; M:ECON-MG-MEDIUM-144…ECON-MG-MEDIUM-188; H:ECON-MG-HARD-248…ECON-MG-HARD-281; EL:ECON-MG-ELITE-304…ECON-MG-ELITE-325; L:ECON-MG-LEGENDARY-9056…ECON-MG-LEGENDARY-9072; C:ECON-MG-HARD-242…ECON-MG-MEDIUM-185; B:ECON-MG-FINALBOSS-4007…ECON-MG-FINALBOSS-4012; LB:ECON-MG-LEGENDARYBOSS-9142…ECON-MG-LEGENDARYBOSS-9144; R:ECON-MG-TAX-INCIDENCE-LESS-ELASTIC-SIDE-5024…ECON-MG-TAX-INCIDENCE-LESS-ELASTIC-SIDE-5025; BR:ECON-MG-TAX-INCIDENCE-LESS-ELASTIC-SIDE-6038…ECON-MG-TAX-INCIDENCE-LESS-ELASTIC-SIDE-6039 |
| `integrated-economic-analysis` | EL:ECON-EC-ELITE-13011…P52B-S4-IEA-EL-002; L:ECON-EC-LEGENDARY-14050…P52B-S4-IEA-L-002; B:ECON-EC-EASYBOSS-17000…ECON-EC-MEDIUMBOSS-18012; LB:ECON-EC-LEGENDARYBOSS-20000…ECON-EC-LEGENDARYBOSS-20023; BR:P52B-S4-IEA-BR-001…P52B-S4-IEA-BR-002 |
| `elasticity` | E:P62B-ELAS-E-001…P62B-ELAS-E-039; M:P62B-ELAS-M-001…P62B-ELAS-M-039; H:P62B-ELAS-H-001…P62B-ELAS-H-039; EL:P62B-ELAS-EL-001…P62B-ELAS-EL-038; L:P62B-ELAS-L-001…P62B-ELAS-L-097; C:P62B-ELAS-C-001…P62B-ELAS-C-030; B:P62B-ELAS-B1-001…P62B-ELAS-B3-020; LB:P62B-ELAS-LB-001…P62B-ELAS-LB-036; R:P62B-ELAS-R-001…P62B-ELAS-R-020; BR:P62B-ELAS-BR-001…P62B-ELAS-BR-020 |
| `consumer-and-producer-surplus` | E:P62C-CPS-E-001…P62C-CPS-E-030; M:P62C-CPS-M-001…P62C-CPS-M-030; H:P62C-CPS-H-001…P62C-CPS-H-030; EL:P62C-CPS-EL-001…P62C-CPS-EL-030; L:P62C-CPS-L-001…P62C-CPS-L-090; C:P62C-CPS-C-001…P62C-CPS-C-030; B:P62C-CPS-B1-001…P62C-CPS-B3-018; LB:P62C-CPS-LB-001…P62C-CPS-LB-036; R:P62C-CPS-R-001…P62C-CPS-R-020; BR:P62C-CPS-BR-001…P62C-CPS-BR-020 |
| `international-trade-and-trade-policy` | E:P62D-ITP-E-001…P62D-ITP-E-040; M:P62D-ITP-M-001…P62D-ITP-M-042; H:P62D-ITP-H-001…P62D-ITP-H-042; EL:P62D-ITP-EL-001…P62D-ITP-EL-038; L:P62D-ITP-L-001…P62D-ITP-L-100; C:P62D-ITP-C-001…P62D-ITP-C-030; B:P62D-ITP-B1-001…P62D-ITP-B3-055; LB:P62D-ITP-LB-001…P62D-ITP-LB-036; R:P62D-ITP-R-001…P62D-ITP-R-020; BR:P62D-ITP-BR-001…P62D-ITP-BR-020 |
| `costs-of-production` | E:P62E-COP-E-001…P62E-COP-E-044; M:P62E-COP-M-001…P62E-COP-M-046; H:P62E-COP-H-001…P62E-COP-H-046; EL:P62E-COP-EL-001…P62E-COP-EL-042; L:P62E-COP-L-001…P62E-COP-L-098; C:P62E-COP-C-001…P62E-COP-C-030; B:P62E-COP-B1-001…P62E-COP-B3-056; LB:P62E-COP-LB-001…P62E-COP-LB-036; R:P62E-COP-R-001…P62E-COP-R-020; BR:P62E-COP-BR-001…P62E-COP-BR-020 |
| `perfect-competition` | E:P62F-PC-E-001…P62F-PC-E-046; M:P62F-PC-M-001…P62F-PC-M-048; H:P62F-PC-H-001…P62F-PC-H-048; EL:P62F-PC-EL-001…P62F-PC-EL-044; L:P62F-PC-L-001…P62F-PC-L-100; C:P62F-PC-C-001…P62F-PC-C-030; B:P62F-PC-B1-001…P62F-PC-B3-058; LB:P62F-PC-LB-001…P62F-PC-LB-036; R:P62F-PC-R-001…P62F-PC-R-020; BR:P62F-PC-BR-001…P62F-PC-BR-020 |
| `monopoly` | E:P62G-MON-E-001…P62G-MON-E-042; M:P62G-MON-M-001…P62G-MON-M-044; H:P62G-MON-H-001…P62G-MON-H-044; EL:P62G-MON-EL-001…P62G-MON-EL-040; L:P62G-MON-L-001…P62G-MON-L-096; C:P62G-MON-C-001…P62G-MON-C-030; B:P62G-MON-B1-001…P62G-MON-B3-058; LB:P62G-MON-LB-001…P62G-MON-LB-036; R:P62G-MON-R-001…P62G-MON-R-020; BR:P62G-MON-BR-001…P62G-MON-BR-020 |
| `monopolistic-competition` | E:P62H-MCMP-E-001…P62H-MCMP-E-039; M:P62H-MCMP-M-001…P62H-MCMP-M-039; H:P62H-MCMP-H-001…P62H-MCMP-H-039; EL:P62H-MCMP-EL-001…P62H-MCMP-EL-037; L:P62H-MCMP-L-001…P62H-MCMP-L-095; C:P62H-MCMP-C-001…P62H-MCMP-C-030; B:P62H-MCMP-B1-001…P62H-MCMP-B3-055; LB:P62H-MCMP-LB-001…P62H-MCMP-LB-036; R:P62H-MCMP-R-001…P62H-MCMP-R-020; BR:P62H-MCMP-BR-001…P62H-MCMP-BR-020 |
| `oligopoly` | E:P62I-OLI-E-001…P62I-OLI-E-030; M:P62I-OLI-M-001…P62I-OLI-M-030; H:P62I-OLI-H-001…P62I-OLI-H-030; EL:P62I-OLI-EL-001…P62I-OLI-EL-030; L:P62I-OLI-L-001…P62I-OLI-L-090; C:P62I-OLI-C-001…P62I-OLI-C-030; B:P62I-OLI-B1-001…P62I-OLI-B3-054; LB:P62I-OLI-LB-001…P62I-OLI-LB-036; R:P62I-OLI-R-001…P62I-OLI-R-020; BR:P62I-OLI-BR-001…P62I-OLI-BR-020 |

### Source/version provenance

| Canonical ID | Recorded source/version metadata | Source games |
|---|---|---|
| `marginal-analysis` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2a_authoring_questions.json | equilibrium-crisis,market-gate,phase5.2a-concept-expansion |
| `incentives` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json | equilibrium-crisis,market-gate |
| `gains-from-trade` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json; phase6.3-targeted-production-repair-v1.json | equilibrium-crisis,market-gate |
| `market-failures` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json | equilibrium-crisis,market-gate |
| `production-possibilities-frontier` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_stage4_authoring_questions.json | equilibrium-crisis,market-gate |
| `positive-versus-normative-analysis` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `economist-policy-role` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json | equilibrium-crisis,market-gate |
| `competitive-markets` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json | equilibrium-crisis,market-gate |
| `demand` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_stage3_authoring_questions.json | equilibrium-crisis,market-gate |
| `supply` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_stage2_authoring_questions.json | equilibrium-crisis,market-gate |
| `market-equilibrium` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_stage3_authoring_questions.json | equilibrium-crisis,market-gate |
| `price-signals` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_authoring_questions.json | equilibrium-crisis,market-gate |
| `binding-price-ceilings` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `binding-price-floors` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `tax-wedges-and-revenue` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `statutory-versus-economic-tax-incidence` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `tax-incidence` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles | equilibrium-crisis,market-gate |
| `integrated-economic-analysis` | phase4.2 deployment bundles; phase4-production; phase4.2-economic-realm-deployment-bundles; phase5.2b_stage4_authoring_questions.json | equilibrium-crisis |
| `elasticity` | phase6.2b-elasticity-graph-expansion-v2; phase6.2b_elasticity_authoring_questions.json; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `consumer-and-producer-surplus` | phase6.2c-consumer-and-producer-surplus-authoring.json; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `international-trade-and-trade-policy` | phase6.2d-international-trade-and-trade-policy-authoring.json; phase6.2d-international-trade-graph-expansion-v2; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `costs-of-production` | phase6.2e-costs-graph-expansion-v2; phase6.2e-costs-of-production-authoring.json; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `perfect-competition` | phase6.2f-perfect-competition-authoring.json; phase6.2f-perfect-competition-graph-expansion-v2; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `monopoly` | phase6.2g-monopoly-authoring.json; phase6.2g-monopoly-graph-expansion-v2; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `monopolistic-competition` | phase6.2h-monopolistic-competition-authoring.json; phase6.2h-monopolistic-competition-graph-expansion-v2; phase6.3-targeted-production-repair-v1.json | micro-concept-library |
| `oligopoly` | phase6.2i-oligopoly-authoring.json; phase6.3-targeted-production-repair-v1.json | micro-concept-library |

## Graph families and retained repairs

- Elasticity: ELAS-01, ELAS-02, ELAS-03, ELAS-05 present; obsolete Elasticity assets absent/unreferenced.
- Costs: COST-01 through COST-06 present.
- Perfect Competition: PC-01, PC-02, PC-03, PC-04, PC-06, PC-07, PC-08 present.
- Monopoly: MON-01 through MON-04 present.
- Monopolistic Competition: MCOMP-01 through MCOMP-03 present; MCOMP-04 absent and not required.
- Trade: TRD-01 through TRD-04 present.
- Invalid Micro `bossStage`, decorative graphs, graph metadata mismatches, answer-length candidates, and repeated Monopolistic Competition task families: **0 each**.

## Composer/runtime parity

Composer and generated games embed the same shared field-level validator. All 65 cells (13 configurations × 5 modes) passed with zero readiness/preflight disagreement. A deliberately invalid `bossStage` negative control was rejected with the field and question ID in the diagnostic. All 13 generated packages passed answer-hash, asset, shared-validator, and accessibility-metadata inspection.

## Git status

The repository was clean at commit `95ff5f2401876e1e33f9f2420f6e40262842a4ec` before this pass. It is intentionally uncommitted now. No files were staged, committed, pushed, or published.

`git status --short` at report generation:

```text
 M SHA256SUMS.txt
 M build.zip
 M build/faculty-build-composer/SHA256SUMS.txt
 M build/faculty-build-composer/composer-core.js
 M build/faculty-build-composer/data/composer_library.js
 M build/faculty-build-composer/data/composer_library_manifest.json
 M build/faculty-build-composer/index.html
 M build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html
 M build/index.html
?? FINAL_REGRESSION_REPORT.md
?? FINAL_REPOSITORY_VERIFICATION_REPORT.md
?? GRAPH_ACCESSIBILITY_REPORT.md
?? build/faculty-build-composer/phase6.4-graph-accessibility-v1.json
?? graph_accessibility_audit.json
?? validation_artifacts/
?? verification_tools/
```

Task changes comprise the composer library/manifest/core/template, two cache references, checksum manifests, regenerated `build.zip`, one phase provenance file, the audit/reports, verification scripts, and machine-readable structural evidence. Deleted production files: none.
