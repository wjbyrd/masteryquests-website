# Full Graph Question Audit Remediation — 4.5s.2i

**Date:** 2026-08-12  
**Base build:** Phase 4 / 8,139 canonical questions / 423 assets  
**Scope:** all 186 questions built in Graph Phases 1–5  
**Corrected build:** 8,163 canonical questions / 427 assets

## Why this pass was necessary
The full audit identified 113 questions with at least one concrete defect: graph-value leakage, answer-length cueing, renamed asset identities, or Phillips-curve ambiguity. The remediation pass uses the audit as the governing specification rather than patching only the sampled questions.

## Corrections completed
- **48 graph-use flags corrected.** Stems no longer hand students the values they are supposed to read. Tax revenue, tax wedges, quantities, GDP changes, and policy effects now require the graph where appropriate.
- **Answer-length cueing removed across all 186 questions.** The original set had 67 questions where the correct answer was uniquely longest; the corrected set has **0**.
- **Asset identity restored.** `LRAS-01`, `LRAS-02`, and `SRPC-01` through `SRPC-04` now retain the user-supplied base filenames. The aliases `ADASLRAS-*` and `PHILLIPS-*` are gone from the audited question paths.
- **Phillips-curve bank rebuilt against the correct assets.** The ambiguous A→B shift item was replaced with a direct SRPC0-versus-SRPC1 comparison. The expected-inflation item now supplies the causal condition rather than pretending an upward SRPC shift has only one possible cause.
- **Tax items repaired.** The revenue item now asks for tax revenue after the tax; students must read the wedge and post-tax quantity from the graph. The incidence questions likewise require reading buyer/seller prices rather than receiving them in the stem.
- **Near-duplicate cleanup completed.** Mirrored stems that were mechanically identical across increase/decrease assets were rewritten. Jaccard >= 0.80 flags now equal **0** across the 186-question set.
- **Canonical-count regression fixed.** The count is recomputed across main, repair, bridge, and repair-seed records. Correct total: **8,163**, not 7,054.

## Source integrity
- Existing Phase 1–4 graph questions intentionally modified: **105**
- New corrected Phase 5 questions added: **24**
- Existing non-graph questions changed or removed: **0**
- No pre-existing non-graph question content was altered.

## Static validation
- Audited questions: **186**
- Answer-hash failures: **0**
- Unique-longest correct answers: **0**
- Severe answer-length cues: **0**
- Renamed asset aliases remaining: **0**
- Unsafe context starts: **0**
- Stale “refer to the graph” wording: **0**
- Missing question assets: **0**
- Near-duplicate flags >= 0.80: **0**
- Correct-answer positions: **{2: 46, 0: 47, 3: 46, 1: 47}**
- Canonical count recomputation: **8163**

## Composition and mode validation
The corrected build was composed through all seven supported modes — Standard, Timed, Exam, Quiz, Unlimited, Legendary, and Score Attack — using these production configurations:
- Demand / Supply / Market Equilibrium
- Market Policy Set
- AD / AS / Macroeconomic Equilibrium
- Money Market / Monetary Transmission
- Phillips Curve family
- Broad Macro Graph Core

All production configurations pass answer verification, asset-hash verification, and seven-mode validation. The intentionally supplemental price-control/tax child concepts remain family-oriented; the production **Market Policy Set** is the gating configuration, matching the existing Composer classification.

## Release label
**4.5s.2i — Full Graph Question Audit Remediation**

## Deliverables
- Corrected full build archive
- Full 186-question corrected authoring JSON
- Corrected per-phase authoring JSONs
- Static validation results
- Composition/all-mode validation results
- Source-integrity comparison
