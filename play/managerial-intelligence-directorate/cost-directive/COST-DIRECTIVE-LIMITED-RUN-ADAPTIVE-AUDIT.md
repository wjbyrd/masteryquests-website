# The Cost Directive — Limited-Run Adaptive Upgrade

Date: 2026-08-16

## Files

Changed:
- `index.html`

Validated and intentionally unchanged:
- `cost_directive_question_bank_student.js`

## Bank readiness

Ordinary question inventory:
- Easy: 90
- Medium: 90
- Hard: 90
- Elite: 90
- Legendary: 90
- Total: 450

Metadata coverage:
- tag: 450/450
- objective: 450/450
- primarySkill: 450/450
- type: 450/450
- four choices: 450/450
- unique skills: 27
- unique objectives: 27

Mode inventories:
- Fading Fortune: 200 eligible
- Risk & Reward: 350 eligible
- Trial by Graph: 0 eligible

Trial by Graph remains disabled because the current Cost Directive bank has:
- images on ordinary questions: 0
- graphRequired questions: 0

## Mode policy

Full-evidence modes remain unchanged:
- Standard Campaign
- Timed Trial
- Exam Drill
- Unlimited Practice
- Legendary Mode
- Score Attack

Quiz:
- balanced sampling only
- planned Easy -> Medium -> Hard progression
- coverage/novelty sampling
- misses do not steer later Quiz items
- no repair/bridge detours
- sample-aware report

Fading Fortune / Risk & Reward:
- cold start with unknown mastery
- calibration favors breadth
- investigation responds to repeated misses and slow performance
- mode eligibility constraints are preserved
- no repair/bridge detours
- sample-aware report

Calibration:
- target <= 5: first 3
- 6–10: first 4
- 11–15: first 5
- 16–20: first 6

## Sample-aware report

Per-area labels:
- 1–2 observations: Limited Signal
- 3–4 observations: Emerging Pattern
- 5+ observations: Meaningful Sample

A sampled area needs at least five observations before it can be treated as a confirmed weakness.

Overall labels:
- Limited Sample
- Developing Sample
- Strong Sample Evidence

Fixed-length sample modes cannot produce the full-evidence Mastery Demonstrated conclusion or the automatic Legendary recommendation.

## Validation

- Inline JavaScript syntax: PASS
- Engine-policy checks: 20/20 PASS
- Fading Fortune inventory: PASS
- Risk & Reward inventory: PASS
- Trial by Graph correctly remains disabled: PASS
- Bank metadata readiness: PASS

Student bank SHA-256:
`5db770b347661d359e1da0cf35fb49ce62fce66ff61b14f36ab1d02f034f16da`
