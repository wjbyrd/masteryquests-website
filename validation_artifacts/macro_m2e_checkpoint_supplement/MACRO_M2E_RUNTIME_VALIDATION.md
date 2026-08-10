# Macro M2e Runtime Validation

The runtime contract was validated against ten representative configurations, including narrow measurement, growth, monetary, neutrality, fiscal, supply-shock, mixed-policy, labor-policy, stabilization, and broad-Macro selections.

- Supplement-only composition: **correctly rejected with a plain-language error**.
- Normal banks with vs. without supplement: **identical** in every representative configuration.
- Normal Repair and Bridge pools: **identical** with vs. without supplement.
- Challenge failures: **explicitly route toward the challenge's underlying `remediationConceptId`** for Repair, Bridge, and retest; all 25 remediation destinations have mature recovery pools.
- Challenge questions are re-attributed at runtime to the matched checkpoint-focus concept for mastery tracking while retaining their supplement source identity.
- Eligible challenges: filtered by all required selected concepts.
- Checkpoint injection: maximum one challenge and only in question position 3.
- Normal question fallback: retained whenever no focus-compatible challenge is available.
- Legendary: challenge selection prefers matching opening/middle/final challenge stage.
- Timed Trial / Exam Drill: supplement selection path is not invoked.
- Composer UI: supplement is displayed in **Optional challenge supplements** and removed from the Stabilization quick-start preset.

Generated package checks passed for monetary, stabilization, and broad-Macro configurations.

MACRO M2e COMPLETE WITH NON-BLOCKING ISSUES
