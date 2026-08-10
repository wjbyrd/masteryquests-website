# M2d-1 Production Handoff — AD-AS and Macroeconomic Equilibrium

Phase: `phaseM2d1-ad-as-macro-equilibrium-family-maturation-v1`

## Result

F8 moved from **191 → 206 canonical questions** with exactly **15 additions**, all concentrated in `long-run-macroeconomic-adjustment`. Aggregate Demand, Aggregate Supply, and Macroeconomic Equilibrium/Shocks retained their canonical counts.

Long-Run Macroeconomic Adjustment moved **34 → 49** and now has:

- Easy 6
- Medium 6
- Hard 6
- Elite 6
- Legendary 6
- Easy Boss 3
- Medium Boss 3
- Final Boss 3
- Legendary Boss 3
- Repair 5
- Bridge 2

F8 family checkpoint geometry is now **12 / 12 / 12 / 12** across Easy Boss, Medium Boss, Final Boss, and Legendary Boss.

## Structural repairs

- Repaired all **9 pre-existing F8 Legendary Boss `bossStage` defects** without changing their question content.
- Rewrote 4 existing Bridges rather than increasing Bridge volume.
- Explicit route chain now includes:
  `F7 Monetary Transmission → Aggregate Demand → Macroeconomic Equilibrium/Shocks → Long-Run Adjustment → F9 Stabilization Policy`.
- Aggregate Supply also bridges directly into Macroeconomic Equilibrium/Shocks.
- All F8 Repair and Bridge records are reachable.

## Graphs and accessibility

No new graph image was added. Five new graph-dependent Long-Run Adjustment questions reuse `adaslras.webp` for distinct tasks. F8 now has **42 graph-linked canonical questions**. Accessibility metadata was added to all **6** existing F8 concept-scoped asset records; image bytes were not changed.

## Validation

- **600 deterministic sessions**: 125 solo Long-Run Adjustment, 375 F8 family, 100 cross-family.
- Completion failures: 0.
- Routing failures: 0.
- Immediate repeats: 0.
- Family Legendary ordinary first reuse occurs at item 25, after all 24 available ordinary Legendary records are consumed; all 9 clean-run Legendary Boss selections remain unique.
- No introduced exact duplicates, material near duplicates, number-swap templates, repeated answer sets, or answer-length giveaways.
- Five new graph tasks passed Cover-the-Graph and Answer-from-the-Graph checks.
- Generated family and Long-Run-only packages passed composition, answer verification, all five mode preflights, asset embedding/accessibility checks, inline-JavaScript syntax, and static markup validation.

Interactive Chromium smoke could not complete in the container because the Chromium process timed out in the host/D-Bus environment. This is the only non-blocking validation limitation.

## Neighboring issue found

Cross-family F8 + F9 regression identified **12 pre-existing F9 Legendary Boss records without valid `bossStage` metadata**. They were excluded in memory only; no F9 source record was modified. M2d-2 should repair them.

## Current library state

Canonical questions: **7,258**

Library SHA-256:
`6600c7f0fbfb5d962bdf124d555b752e2ee27017fc03530c642a34f42a830146`

`composer_library.js`, `composer_registry.json`, and `composer_library_manifest.json` agree on both the count and library SHA.

## Overlay

Copy the package paths over the matching paths in the production repository:

`C:\Users\Jennings\Documents\GitHub\masteryquests-website`

Do not replace the repository-wide `SHA256SUMS.txt` with `M2D1_SHA256SUMS.txt`. Keep the phase checksum file for provenance and refresh the repository master checksum manifest from the post-overlay state.

## Verdict

`MACRO M2d-1 COMPLETE WITH NON-BLOCKING ISSUES`
