# Faculty Template Limited-Run Adaptive Update

Date: 2026-08-16

## Mode families

### Full-evidence modes — unchanged adaptive/remediation architecture
- Standard Campaign
- Timed Trial
- Exam Drill
- Unlimited Practice
- Legendary Mode
- Score Attack

These modes continue using the existing adaptive engine and existing repair/bridge routing where allowed.

### Quiz — balanced limited sampling
Quiz is treated as an instructor-usable assessment.

- 1–15 questions
- balanced difficulty progression across Easy / Medium / Hard
- broad concept/skill coverage
- no weakness chasing
- no repair/bridge detours
- sample-aware Mastery Report

### Limited-run adaptive modes
- Trial by Graph
- Fading Fortune
- Risk & Reward

These modes now use:

unknown state -> calibration -> investigation

Calibration length:
- up to 5 questions: first 3
- 6–10 questions: first 4
- 11–15 questions: first 5
- 16–20 questions: first 6

During calibration, the selector prioritizes coverage and avoids repeating the same skill/concept.

After calibration, the selector remains constrained to the mode's eligible question pool but gives more weight to:
- repeated misses
- low observed accuracy
- slow responses
- unsampled areas
- novelty / non-repetition

Repair and bridge detours remain disabled in these modes.

## Mastery Report semantics for limited runs

The four limited-run modes no longer make full-mastery claims from a short sample.

Per-area evidence:
- 1–2 observations: Limited Signal
- 3–4 observations: Emerging Pattern
- 5+ observations: Meaningful Sample

A limited-run area is not treated as a confirmed weakness until it has at least 5 observations plus weak performance/pace evidence.

Overall limited-run reports use:
- Limited Sample
- Developing Sample
- Strong Sample Evidence

They never use "Mastery Demonstrated" for a fixed-length sample.

## Composer

`composer-core.js` is bumped from 4.5s.2m to 4.5s.2n and now emits the limited-run sampling policy in generated composition config.

## Files intentionally unchanged

`composer_library.js` is question/content library data and contains no runtime mode-selection engine.

`composer_library_manifest.json` is the 427-asset manifest and contains no mode-selection engine.

SHA-256 unchanged references:
- composer_library.js: `ac379eec5bc2dd017066591637974aaf48d043b192658ace879c3af30e13cdf3`
- composer_library_manifest.json: `abce7a6affee3936fb9d607b817545f36dfc15c97d2929272f420abbd3229b7e`

## Validation

- Faculty Template inline JavaScript syntax: PASS
- composer-core.js syntax: PASS
- Runtime policy/static checks: 11/11 PASS
