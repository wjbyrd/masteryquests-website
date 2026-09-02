# Duplicate-Option Validator Change

## Root cause

The prior `duplicate-options` rule reused `normalizeComparable`, which removes every character outside a restricted letter/number/sign set. Unicode minus (`−`) and graph arrows (`↑ ↓ ← →`) were deleted. As a result, `−$0.8 trillion` collapsed onto `$0.8 trillion`, and economically distinct money-market/AD sequences collapsed after their directional arrows were erased.

## Narrow fix

The rule now calls `normalizeDuplicateOption`, a dedicated option-equivalence normalizer. It normalizes capitalization, whitespace, terminal punctuation, typographic quotes, equivalent dash/minus glyphs, and equivalent arrow glyphs. It does not remove mathematical signs, arrows, directional words, graph labels, or token order.

## Verification

- 43065: no duplicate finding; content unchanged.
- PG4-MM-L-005: no duplicate finding; content and graph metadata unchanged.
- PG4-MPT-H-001: no duplicate finding; content and graph metadata unchanged.
- PG4-MPT-H-002: no duplicate finding; content and graph metadata unchanged.
- Synthetic true duplicate `Demand rises.` / `demand rises`: still detected by the existing auditor validation suite.
- Explicit sign, A→B/B→A, and up/down/left/right distinction assertions: PASS.
