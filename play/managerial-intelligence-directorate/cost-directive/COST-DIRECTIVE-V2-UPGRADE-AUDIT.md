# The Cost Directive — Engine 2.0 Upgrade Audit

Build date: 2026-08-15

## Deployment

Replace the existing Cost Directive `index.html` with `cost-directive-index-upgraded.html` (rename it to `index.html`). Keep these existing sibling files/folders in place:

- `cost_directive_question_bank_student.js`
- `instructional_resources.js`
- `resources/`
- all existing Cost Directive image/audio assets

No question-bank or instructional-resource catalog rewrite is required for this engine upgrade.

## Enabled modes

- Standard Campaign
- Timed Trial
- Exam Drill
- Quiz
- Unlimited Practice
- Legendary Mode
- Score Attack
- Fading Fortune
- Risk & Reward

Trial by Graph is intentionally disabled. The current Cost Directive bank contains no audited `graphRequired` image questions, so the engine correctly refuses to expose a fake graph-only mode.

## Preserved Cost Directive systems

- The Principal
- Analyst of Tradeoffs / Manager of Marginal Decisions / Director of Scale
- Cost Directive artifacts and Directorate progress keys
- Standard Campaign save/resume and campaign ownership
- Published hashed answer verification
- Repair -> bridge -> retest routing
- Course-specific Recommended Review resources
- Cost Directive visual and music assets

## Engine upgrades

- Current run-session invalidation and answer-verification guards
- Nine-mode composition architecture
- Quiz and Unlimited Practice
- Fading Fortune and Risk & Reward
- Current mastery-report evidence logic with objective weakness included in mastery gating
- Local-only telemetry and CSV export
- Risk & Reward telemetry fields
- No email requirement and no network telemetry transmission

## Content compatibility audit

Published bank: 807 records total.

Main pools:
- Easy: 90
- Medium: 90
- Hard: 90
- Elite: 90
- Legendary: 90
- Legendary Boss: 90
- Easy Boss: 18
- Medium Boss: 12
- Final Boss: 21

Remediation:
- Repair: 108
- Bridge: 108

Validation results across all 807 records:
- Bad answer hashes: 0
- Missing objective/primarySkill metadata: 0
- Non-four-choice records: 0
- Duplicate IDs: 0

Mode candidate pools:
- Fading Fortune: 200 explicitly audited/curated IDs
- Risk & Reward: 350 explicitly audited/curated IDs
- Trial by Graph: 0 eligible, intentionally disabled

## Runtime smoke results

Preflight passes:
- Standard
- Timed
- Exam Drill
- Quiz
- Unlimited Practice
- Legendary
- Score Attack
- Fading Fortune
- Risk & Reward

Preflight intentionally fails:
- Trial by Graph

Additional checks passed:
- Fading Fortune setup launches a 10-question deck
- Risk & Reward setup launches a 10-question deck
- 27 instructional-resource objective mappings load
- Recommended Review renders from objective weakness evidence
- 108 repair and 108 bridge items are visible to the engine
- Local Risk & Reward telemetry writes bankroll/wager fields under the Cost Directive telemetry namespace
- Inline JavaScript passes `node --check`

## Still requires live-browser deployment check

After placing the upgraded file in the actual website folder, manually verify visual/audio asset loading, resource PDF links, mobile layout, and a complete Standard run in a real browser. Static and VM runtime tests passed; this environment could not perform a full local-browser render of the user's website directory.
