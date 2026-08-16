# The Labyrinth of Choice — Limited-Run Adaptive Upgrade

Date: 2026-08-16

## Files

Changed:
- `index.html`

Validated and intentionally unchanged:
- `labyrinth_of_choice_question_bank_student.js`

The student bank does not need a rewrite for this engine change.

## Bank readiness

Ordinary question inventory:
- Easy: 79
- Medium: 80
- Hard: 83
- Elite: 74
- Legendary: 74
- Total ordinary questions: 390

Metadata coverage:
- tag: 390/390
- objective: 390/390
- primarySkill: 390/390
- type: 390/390
- four-option structure: 390/390
- unique skills: 23
- unique objectives: 11
- graph-required questions: 90

Eligible limited-run inventory:
- Trial by Graph: 90
- Fading Fortune: 115
- Risk & Reward: 115

All three support 10-, 15-, and 20-question runs.

## Mode policy

### Full-evidence modes — unchanged
- Standard Campaign
- Timed Trial
- Exam Drill
- Unlimited Practice
- Legendary Mode
- Score Attack

These retain the existing full adaptive/remediation architecture.

### Quiz
- 1–15 questions
- balanced Easy -> Medium -> Hard structure
- coverage/novelty-based question sampling
- performance does not steer later Quiz questions
- no repair/bridge detours
- sample-aware Mastery Report

### Trial by Graph / Fading Fortune / Risk & Reward

Cold start:
- no assumed mastery state
- first questions maximize coverage

Calibration:
- <=5-question target: first 3 questions
- 6–10: first 4
- 11–15: first 5
- 16–20: first 6

Investigation after calibration:
- preserves mode eligibility constraints
- revisits repeated misses
- considers slow responses
- still rewards coverage and novelty
- prevents immediate skill hammering
- no repair/bridge detours

Trial by Graph remains graph-required only.

## Sample-aware Mastery Report

Limited-run modes use:
- 1–2 observations: Limited Signal
- 3–4 observations: Emerging Pattern
- 5+ observations: Meaningful Sample

A sampled area requires at least five observations before it can be treated as a confirmed weakness.

Overall fixed-length evidence labels:
- Limited Sample
- Developing Sample
- Strong Sample Evidence

Fixed-length modes cannot produce the full-evidence `Mastery Demonstrated` conclusion or the `noMajorWeakness` Legendary recommendation.

Targeted instructional-resource recommendations remain gated behind a confirmed objective weakness, preventing a one- or two-question signal from generating an overconfident remediation prescription.

## Validation

- Inline JavaScript syntax: PASS
- Static engine policy checks: 19/19 PASS
- Student-bank metadata readiness: PASS
- Trial by Graph inventory: PASS
- Fading Fortune inventory: PASS
- Risk & Reward inventory: PASS

Student bank SHA-256:
`78fe0d4fa95249d709a5f19aae6bde2aadbc04cebcd44a0e138470a913e017ec`
