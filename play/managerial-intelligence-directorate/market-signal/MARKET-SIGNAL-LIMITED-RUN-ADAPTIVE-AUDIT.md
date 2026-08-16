# The Market Signal — Limited-Run Adaptive Upgrade

Date: 2026-08-16

## Files changed

- `index.html`
- `market_signal_question_bank_student.js`

The student bank changed only to restore `graphRequired: true` on the 58 records already curated in `trialGraphQuestionIds`. Question wording, answer choices, hashes, objectives, skills, feedback, and graph filenames were not rewritten.

## Bank readiness

Ordinary inventory:
- Easy: 91
- Medium: 93
- Hard: 93
- Elite: 93
- Legendary: 93
- Total ordinary: 463

Metadata:
- tag: 463/463
- objective: 463/463
- primarySkill: 463/463
- type: 463/463
- four-choice structure: 463/463
- unique skills: 162
- unique objectives: 21

Graph repair:
- Curated graph records flagged across all banks: 58
- Ordinary graph-required records available to Trial by Graph: 39

Limited-run inventories:
- Trial by Graph: 39
- Fading Fortune: 240
- Risk & Reward: 420

All three support 10-, 15-, and 20-question runs.

## Mode policy

Full-evidence modes unchanged:
- Standard Campaign
- Timed Trial
- Exam Drill
- Unlimited Practice
- Legendary Mode
- Score Attack

Quiz:
- balanced sampling only
- planned Easy -> Medium -> Hard progression
- misses do not steer later Quiz questions
- no repair/bridge detours
- sample-aware Mastery Report

Trial by Graph / Fading Fortune / Risk & Reward:
- cold start with unknown mastery
- calibration favors breadth
- investigation responds to repeated misses and slow performance
- stays inside each mode's eligible pool
- no repair/bridge detours
- sample-aware Mastery Report

Calibration:
- <=5 target: first 3
- 6–10: first 4
- 11–15: first 5
- 16–20: first 6

## Sample-aware report

Per-area evidence:
- 1–2 observations: Limited Signal
- 3–4 observations: Emerging Pattern
- 5+ observations: Meaningful Sample

A sampled area requires at least five observations before it can count as a confirmed weakness.

Overall:
- Limited Sample
- Developing Sample
- Strong Sample Evidence

Fixed-length modes cannot produce the full-evidence Mastery Demonstrated conclusion or automatic Legendary recommendation.

## Validation

- Index inline JavaScript syntax: PASS
- Student bank JavaScript syntax: PASS
- Engine/bank policy checks: 22/22 PASS
- Trial by Graph restored: PASS
- Fading Fortune inventory: PASS
- Risk & Reward inventory: PASS
- Ordinary-bank metadata readiness: PASS

Original student bank SHA-256:
`1a30cdfa5a8c22401ab37ac73a8b81d84da62c4da844afde34a602f98613e821`

Updated student bank SHA-256:
`a56957ed64626e18a6116c24ad3660948a9211244b418faf2b8bc4b54b6c7a7a`
