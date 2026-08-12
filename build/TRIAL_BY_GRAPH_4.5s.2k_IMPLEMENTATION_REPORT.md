# Mastery Quests Faculty Build Composer 4.5s.2k
## Trial by Graph — Mode 8 Implementation

Base: 4.5s.2j authoritative Faculty Build Composer
Release: 4.5s.2k
Date: 2026-08-12

### Implemented
- Added Mode 8: Trial by Graph to the Composer and generated-game template.
- Added strict `graphRequired: true` eligibility to the audited graph-question inventory.
- 602 audited questions with valid image references are Trial-by-Graph eligible.
- 10 audited records without an image reference remain excluded.
- Trial by Graph supports 10, 15, and 20 question runs when the selected concept set has enough graph-safe ordinary questions.
- Runtime decks are unique, fixed-length, graph-only, and difficulty-aware.
- Boss pools, checkpoints, Repair, Bridge, campaign progress, artifacts, save/resume, and wrong-answer setbacks are excluded.
- Existing graph rendering, lightbox, accessibility metadata, response timing, streaks, telemetry, results, verification, CSV export, and Mastery Report 2.0 are reused.
- Rapid-guess lockouts do not consume a Trial-by-Graph question.
- Generated games run a Trial-by-Graph preflight before launch and refuse unsafe inventory rather than substituting non-graph questions.

### Inventory behavior
- >= 10 graph-safe questions: 10-question run enabled.
- >= 15 graph-safe questions: 15-question run enabled.
- >= 20 graph-safe questions: 20-question run enabled.
- < 10 graph-safe questions: Trial by Graph fails Composer/preflight validation.

### Validation completed
PASS:
- `composer-core.js` syntax
- `composer.js` syntax
- raw generated-game template inline JavaScript syntax
- dedicated Trial-by-Graph validation
- all-eight-mode composition validation
- self-contained generated eight-mode game syntax
- mode-availability regression
- Quiz Mode regression
- Unlimited Practice regression
- Mastery Report 2.0 regression
- full graph-question remediation validation
- question-independence / graph-hygiene validation
- Phase Graph 4 money-market / AD-transmission validation

Dedicated Trial-by-Graph test examples:
- Perfect Competition: 76 graph-safe ordinary questions; 10/15/20 enabled.
- Demand: 18 graph-safe ordinary questions; 10/15 enabled.
- Aggregate Demand: 12 graph-safe ordinary questions; 10 enabled.
- Bank Money Creation: 0 graph-safe ordinary questions; Trial by Graph correctly rejected.

### Legacy-test notes
- `run_micro_graph_audit_remediation_validation.js` cannot rerun from this handoff because it hard-codes an external `/mnt/data/MICRO_GRAPH_QUESTION_AUDIT_2026-08-12.json` fixture that is not present. The self-contained current graph-remediation validation passes.
- `run_phase6_2f_pc_graph_expansion_v2_validation.js` contains historical fixed bank-size expectations from Phase 6.2f (454 Perfect Competition canonical questions). The current 4.5s.2j/2k library correctly contains 565 after later Micro backfills. Its graph counts, answer audit, asset audit, and five modes tested by that historical script remain clean; only obsolete count expectations fail.

### Library
- Canonical questions: 8,163
- Graph/image assets: 427
- Trial-by-Graph eligibility flags: 602
- Internal library SHA-256: `63424e0425bb8d0ab38842d0d7951514d08c64be5f3dd6bb8718f91ada32b66b`
