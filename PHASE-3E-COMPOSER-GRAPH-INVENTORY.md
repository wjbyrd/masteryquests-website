# Phase 3E Composer Graph Inventory

## Faculty-Cleaned Existing Graphs

All 11 files were committed in `bbb5cd9` before Phase 3E began. Browser/Pillow decode and side-by-side review passed: axes, curves, labels, ticks, and markers remain visible and the economic meaning is unchanged.

| Composer path | Dimensions before -> after | SHA-256 before | SHA-256 current | Integrity classification | Accessibility |
|---|---:|---|---|---|---|
| `data/question-assets/aggregate-supply/adas1.webp` | 925x804 -> 925x788 | `3c290b2dbf82d7b042ee913f39efaa935f0740f5b3208ff497b7a7451335475f` | `4ef2f60d6b31cff0db2c2722f3e34c21f112df88096b3b36c3a3be215cb5185e` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/binding-price-ceilings/ceilingfloor.webp` | 2167x1736 -> 2167x1729 | `82553aedd20814e579fb188e6e39cd476f6e47b94586357b2d611a98bb01184e` | `f483f0c5fbae3b5793ceea124e10fb4b3de8338f4c0d58cd6ba07d8ac936ae6b` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/binding-price-floors/ceilingfloor.webp` | 2167x1736 -> 2167x1729 | `82553aedd20814e579fb188e6e39cd476f6e47b94586357b2d611a98bb01184e` | `f483f0c5fbae3b5793ceea124e10fb4b3de8338f4c0d58cd6ba07d8ac936ae6b` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/fiscal-policy-and-aggregate-demand/moneymultiplier.webp` | 1778x1528 -> 1747x1501 | `5eee7a4d83f6869b62b7d878797f4dca4c607f5ee2a53cbca323d01c663fd911` | `b8371794ea980d9cdb463314a72969379fa334ef908ed171035c1b79de0d9830` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/fisher-effect/moneys_moneyd.webp` | 741x678 -> 716x678 | `ea41329741bea54c32cea0b8bac73dafe3faa8b34ef26e3be6bc5891376a00cc` | `2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c` | Explicit pin updated | Pre-existing metadata gap retained |
| `data/question-assets/inflation-costs/moneys_moneyd.webp` | 741x678 -> 716x678 | `ea41329741bea54c32cea0b8bac73dafe3faa8b34ef26e3be6bc5891376a00cc` | `2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c` | Explicit pin updated | Pre-existing metadata gap retained |
| `data/question-assets/inflation-tax-and-deflation/moneys_moneyd.webp` | 741x678 -> 716x678 | `ea41329741bea54c32cea0b8bac73dafe3faa8b34ef26e3be6bc5891376a00cc` | `2f0d942caee226fa9929aaa2b5c7d7bf884c420dbcdc333451a72818f50a5d0c` | Explicit pin updated | Pre-existing metadata gap retained |
| `data/question-assets/liquidity-preference-and-money-market/ad_ms_md.webp` | 2863x1643 -> 2863x1586 | `d70ef13ab6a98967e9695cc8d50b707ac8ccfaf3a913527b04ca1485a8e047a4` | `4749b2c2a013eec8c08b6c7280ef59c9f86aadbe324deff2fe7da3f24f3cb87d` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/macroeconomic-equilibrium-and-shocks/ADASLRAS-02.webp` | 1625x1147 -> 1625x1147 | `6eabd068fa5d3956106182f64e397a543c5bb327871331fed00f8965654d3789` | `b1f716072d24c280d368f3e51cc02fde405976a1f103d321768fb65d9763f027` | No application hash pin | Mirrored registered alias supplies metadata |
| `data/question-assets/macroeconomic-equilibrium-and-shocks/LRAS-02.webp` | 1625x1147 -> 1625x1147 | `6eabd068fa5d3956106182f64e397a543c5bb327871331fed00f8965654d3789` | `b1f716072d24c280d368f3e51cc02fde405976a1f103d321768fb65d9763f027` | Explicit pin updated | Existing alt + description retained |
| `data/question-assets/macroeconomic-equilibrium-and-shocks/adas1.webp` | 925x804 -> 925x788 | `3c290b2dbf82d7b042ee913f39efaa935f0740f5b3208ff497b7a7451335475f` | `4ef2f60d6b31cff0db2c2722f3e34c21f112df88096b3b36c3a3be215cb5185e` | Explicit pin updated | Existing alt + description retained |

The two `ceilingfloor` copies, three cropped `moneys_moneyd` copies, two `adas1` copies, and `ADASLRAS-02`/`LRAS-02` pairs are byte-identical within their intended mirror groups. Same-name files in other concept folders remain independent and were not changed.

## Phase 2A Market Gate Assets

Canonical source is `play/economic-realm/market-gate/`. All 16 binaries already existed at the Composer destinations before Phase 3E and matched byte-for-byte, so no binary was copied. Phase 3E added 21 concept-level metadata registrations because several tax assets are intentionally shared across concept pools.

| Asset | Composer runtime path | Questions | Dimensions | Bytes | SHA-256 |
|---|---|---:|---:|---:|---|
| `PPF-01.webp` | `question-assets/production-possibilities-frontier/PPF-01.webp` | 40000-40002 | 1555x1107 | 40,410 | `db35510e997538217073a76b85ccde397b9c4521336289a003c5464e50ae40eb` |
| `PPF-02.webp` | `question-assets/production-possibilities-frontier/PPF-02.webp` | 40003-40005 | 1600x1200 | 52,892 | `fa8d2d2a3f3cb8f83f83af2a9a2b73dde140e752eecbdeda9baf15a01e4f9b45` |
| `DEMAND-SUPPLY-03.webp` | `question-assets/market-equilibrium/DEMAND-SUPPLY-03.webp` | 40006-40008 | 1600x1200 | 74,022 | `d556ab1e15e8fdd79c3281acd25a66a4afc435e19a3608214ee5f008441b6a55` |
| `DEMAND-SUPPLY-04.webp` | `question-assets/market-equilibrium/DEMAND-SUPPLY-04.webp` | 40009-40011 | 1600x1200 | 73,398 | `43d6e497224a1dc6167fc2fc02f2d2bda20d3a883ca03aaae1af42baf28a05d5` |
| `DEMAND-SUPPLY-05.webp` | `question-assets/market-equilibrium/DEMAND-SUPPLY-05.webp` | 40012-40014 | 1600x1200 | 86,338 | `2e4222f7677fd917073bdf9708649f2f6fde744cbb0480548cefff7ce69afc62` |
| `DEMAND-SUPPLY-06.webp` | `question-assets/market-equilibrium/DEMAND-SUPPLY-06.webp` | 40015-40017 | 1600x1200 | 81,372 | `a400eea75bcff4ed0bd2fa852fd92c584547ff5e823e4c61a09fe5187d629c79` |
| `DEMAND-SUPPLY-07.webp` | `question-assets/market-equilibrium/DEMAND-SUPPLY-07.webp` | 40018-40020 | 1600x1200 | 70,026 | `01f5ab1b9c1bf6aab9d2be05a238802b52416e97c0eabd8de04d2cdb7a8c3b69` |
| `CEILING-02.webp` | `question-assets/binding-price-ceilings/CEILING-02.webp` | 40021-40023 | 1615x1200 | 65,090 | `d5afa73b833037ad4f84e6a481b40125e9bd7e4e6fff08fe555f6f2b3c7767c7` |
| `CEILING-03.webp` | `question-assets/binding-price-ceilings/CEILING-03.webp` | 40024-40026 | 1613x1200 | 66,838 | `394e558d501a6d2f8ddafeec304b9ac8ddc8d2671635c9877594906b7fb3ea83` |
| `FLOOR-02.webp` | `question-assets/binding-price-floors/FLOOR-02.webp` | 40027-40029 | 1614x1200 | 62,700 | `5620349697523a31fe57a39c6472461a67b521bed35ea90f9e5f25f4efc7afdf` |
| `FLOOR-03.webp` | `question-assets/binding-price-floors/FLOOR-03.webp` | 40030-40032 | 1600x1200 | 60,768 | `acdda47d3c35ea4ed3a5f3bbfb741b28fb25d8f6342df2683fc25370f3a751bd` |
| `TAX-02.webp` | `question-assets/tax-wedges-and-revenue/TAX-02.webp` | 40033-40035 | 1600x1200 | 74,886 | `efc993c9eff14b9ee5e96283b09f87382535c23467a0f182ef6ca202294b2590` |
| `TAX-03.webp` | `question-assets/tax-wedges-and-revenue/TAX-03.webp` | 40036-40038 | 1600x1200 | 72,860 | `ef69a4b97e9b0ec232fa6bfa24e1071aecd36f0b1d28e4f92e18fe1e283f4685` |
| `TAX-04.webp` | `question-assets/tax-wedges-and-revenue/TAX-04.webp` | 40039-40041 | 1600x1200 | 75,156 | `c17569c52cb224bc9b1bbbc6a36a0641f8fc470f7547dbda9dd19dee9ceae942` |
| `TAX-05.webp` | `question-assets/tax-wedges-and-revenue/TAX-05.webp` | 40042-40044 | 1600x1200 | 72,438 | `b4652bce273eaa717c4e7e258076a45be48f956d01e3f09fb65fa3c6780ce74d` |
| `TAX-06.webp` | `question-assets/tax-wedges-and-revenue/TAX-06.webp` | 40045-40047 | 1615x1200 | 73,972 | `c8c58a2b9f7182730628d1a78ab12ac00f690568e04ae361132ff4309d50bfda` |

All 16 have canonical Phase 2A descriptions applied as `imageAlt` and `graphDescription`. The same-name `statutory-versus-economic-tax-incidence/TAX-02.webp` has different bytes and remains a separate, intentional asset; no collision was overwritten.
