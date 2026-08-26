# Externalities Graph Asset Inventory

Production date: 2026-08-26  
Composer concept: `market-failures`  
Canonical asset directory: `build/faculty-build-composer/data/question-assets/market-failures/`

## Validation Result

All 13 staged WebPs passed filename, decode, dimension, size, SHA-256, axis, unit, curve-label, outcome-marker, projection-guide, policy-wedge, economic-meaning, accessibility, duplicate-hash, and filename-collision checks. Every image is `1720x1200`. The files were moved into the canonical concept directory and the empty `_incoming-externalities/` staging directory was removed.

Visual inspection confirmed:

- Scenario 1: MPB `(0,$21)` to `(320,$9)`, MPC `(0,$3)` to `(320,$15)`, MSC `$6` above MPC; market `240/$12`; efficient `160/$15`; corrected buyer/seller prices `$15/$9`.
- Scenario 2: MPB `(0,$19)` to `(240,$7)`, MPC `(0,$1)` to `(240,$13)`, MSB `$4` below MPB; market `180/$10`; efficient `140/$8`; corrected buyer/seller prices `$12/$8`.
- Scenario 3: MPB `(0,$16)` to `(200,$8)`, MPC `(0,$6)` to `(200,$18)`, MSC `$5` below MPC; market `100/$12`; efficient `150/$10`; corrected buyer/producer prices `$10/$15`.
- Scenario 4: MPB `(0,$8)` to `(250,$3)`, MPC `(0,$2)` to `(250,$7)`, MSB `$2` above MPB; market `150/$5`; efficient `200/$6`; corrected rider/provider prices `$4/$6`.
- Imperfect vaping policy: policy-adjusted MPB is `$2` below MPB, intersects MPC at `160/$9`, consumers pay `$11`, efficient quantity remains `140`, and remaining overconsumption is `20 thousand`.

## Inventory

| Asset | Class | Scenario | Questions | Bytes | SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| `EXTERNALITY-A-01.webp` | A | 1 | 5 | 67,590 | `3bf8a3370d25d963013eeb77c52062c00c28d55e45c05cdc8ba320235a170f6a` |
| `EXTERNALITY-A-02.webp` | A | 2 | 5 | 73,116 | `cb78aac33fd7434f0f9e1fb99f187dfb30451a62f15a46d53e73e2208dc7fae8` |
| `EXTERNALITY-A-03.webp` | A | 3 | 5 | 75,328 | `7371c64609bbf73eb251399d97d8bb523758083edeabc1cbf1cf5522e39aa158` |
| `EXTERNALITY-A-04.webp` | A | 4 | 5 | 70,480 | `4c5a75e587ea4bb99fbc952df5c3545035acec148bf4b73be108f5e718a75474` |
| `EXTERNALITY-B-01.webp` | B | 1 | 10 | 72,450 | `080e46bbcd0e26fa0e1f94e85bf8319a2afd1bafe95ec6832e6b86bdbae65aeb` |
| `EXTERNALITY-B-02.webp` | B | 2 | 10 | 78,182 | `2b3898bd5ad7b99585971f6b574f8e588df432e3a7183734aaa1a11d566fca53` |
| `EXTERNALITY-B-03.webp` | B | 3 | 10 | 80,214 | `60a9278c4de61e0a8823ce617c5dbb9e21eb08dc163e5c37ecc28bd1ea62d4a0` |
| `EXTERNALITY-B-04.webp` | B | 4 | 10 | 73,642 | `3506c993b06cc6966a487e31367582eaef0707b70d959dae771394cc441adac4` |
| `EXTERNALITY-C-01.webp` | C | 1 | 9 | 72,604 | `721dd203d052f67ec2a2114cdfc712c6c96b616833f648076b88c27db23f7cd6` |
| `EXTERNALITY-C-02.webp` | C | 2 | 9 | 78,326 | `56a7cfe718e6d03a498b98e3081b8ba79b97bc0287476b2ccca23e903a52a965` |
| `EXTERNALITY-C-03.webp` | C | 3 | 9 | 80,298 | `ade6e10af993fdc1d60d710b9cc4ae5b731614d2db842cdc458db2f886efba94` |
| `EXTERNALITY-C-04.webp` | C | 4 | 9 | 72,988 | `5bce7ff8b406b0f46451e5e2f9fdfb31ef8c610c16e114a07b9cb32dd2c955b1` |
| `EXTERNALITY-D-02.webp` | D | 2 | 8 | 101,090 | `f6891f406f2f05535888f590d531eca47903c7923c4c5750ba1336a181a77cb7` |

## Accessibility And Collisions

Each asset has a registered `imageAlt` and `graphDescription` that names the axes, units, curves, and visible outcome or policy evidence without exposing a correct-answer index. No two incoming files have the same SHA-256. No canonical `EXTERNALITY-*` filename existed before publication, and no existing asset was overwritten.
