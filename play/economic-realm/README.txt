Economic Realm — Remediation Anti-Repetition Patch
Date: 2026-08-19

Patched missions:
- The Market Gate
- The National Ledger
- The Equilibrium Crisis
- The Liquidity Grid
- The Stabilization Protocol

Change:
Repair and bridge questions now exhaust eligible alternatives within the active
recovery episode before reuse. After all eligible items have appeared, the
least-recently-seen eligible item is preferred. A one-item pool can repeat.

Unchanged:
Question banks, answer keys/hashes, boss logic, progression, telemetry,
mastery calculations, visuals, assets, and ordinary/retest question selection.

Validation:
All five inline JavaScript engines pass `node --check`.
