# The Agency Protocol — Limited-Run Adaptive Upgrade

Date: 2026-08-16

## Files

Changed:
- `index.html`

Validated and intentionally unchanged:
- `agency_protocol_question_bank_student.js`

## Bank readiness

Ordinary inventory:
- Easy: 38
- Medium: 37
- Hard: 84
- Elite: 36
- Legendary: 74
- Total: 269

Metadata coverage:
- tag: 269/269
- objective: 269/269
- primarySkill: 269/269
- repairSkill: 269/269
- type: 269/269
- four choices: 269/269

Limited-run inventory:
- Fading Fortune: 269
- Risk & Reward: 269
- Trial by Graph: 0

Trial by Graph remains disabled because the published ordinary bank has:
- image questions: 0
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
- performance does not steer later Quiz questions
- no repair/bridge detours
- sample-aware report

Fading Fortune / Risk & Reward:
- cold start with unknown mastery
- calibration favors breadth
- investigation responds to repeated misses and slow performance
- mode eligibility is preserved
- no repair/bridge detours
- sample-aware report

Calibration:
- target <= 5: first 3
- 6–10: first 4
- 11–15: first 5
- 16–20: first 6

## Sample-aware report

Per sampled area:
- 1–2 observations: Limited Signal
- 3–4 observations: Emerging Pattern
- 5+ observations: Meaningful Sample

A sampled area needs at least five observations before it can be treated as a confirmed weakness.

Overall:
- Limited Sample
- Developing Sample
- Strong Sample Evidence

Fixed-length sample modes cannot produce a full-evidence mastery conclusion or automatic Legendary recommendation.

## Validation

- Index inline JavaScript syntax: PASS
- Student bank JavaScript syntax: PASS
- Policy checks: 20/20 PASS
- Fading Fortune inventory: PASS
- Risk & Reward inventory: PASS
- Trial by Graph correctly remains disabled: PASS
- Student bank metadata readiness: PASS

Student bank SHA-256:
`1fb9615e8f2b5d9e0c275a91299a93e27a662fa7fb9202006fb57e684c2a900d`
