# Risk & Reward — Mode 10 Implementation Report

**Release:** 4.5s.2m  
**Base:** 4.5s.2l (Fading Fortune)  
**Faculty Build Composer:** ten-mode engine

## Implemented behavior

Risk & Reward is a fixed-length practice mode using the existing Mastery Quests question, graph, telemetry, results, and Mastery Report infrastructure.

- Starting bankroll: **1,000 points**
- Run lengths: **10, 15, or 20 questions**, exposed only when sufficient eligible inventory exists
- Wager choices: **10%, 25%, 50%, ALL IN**
- Wager is locked **before** the question, answers, graph, hint, or difficulty information is revealed
- Payout: **1:1**
  - correct answer adds the wager
  - incorrect answer subtracts the wager
- Percentage wagers are rounded to integer points with a minimum wager of 1 point
- ALL IN uses the entire current bankroll
- A bankroll of zero ends the run immediately as a legitimate **bust** outcome
- Bust retains accumulated mastery evidence and allows Mastery Report viewing
- Abandonment remains distinct from bust

## Engine reuse

The implementation reuses the existing fixed-length mode seams rather than creating a separate question engine.

Reused systems include:
- ordinary question banks and concept composition
- option shuffling and answer verification
- graph rendering, lightbox, and accessibility metadata
- rapid-guess protection
- response timing and mastery-attempt recording
- telemetry/download infrastructure
- results screen and verification code
- Mastery Report 2.0
- mode availability and generated-game preflight

Risk & Reward does not use bosses, artifacts, checkpoints, Repair/Bridge detours, room setbacks, realm progress, or save/resume.

## Risk-specific reporting

Mastery Report 2.0 adds **Risk & Confidence**, including:
- starting/final/peak bankroll
- largest wager
- average wager share
- 10% / 25% / 50% / ALL IN distribution
- accuracy by wager tier
- All-In attempts
- bust/survival outcome

The report explicitly keeps wagering behavior separate from mastery judgments.

## Validation results

All checks below passed on 4.5s.2m:

- `composer-core.js` syntax
- `composer.js` syntax
- generated template inline JavaScript syntax
- Risk & Reward static/source validation
- Risk & Reward bankroll/state validation
- generated all-ten-mode embedded faculty game validation
- mode availability regression through ten modes
- Quiz regression
- Unlimited Practice regression
- Trial by Graph regression
- Fading Fortune regression
- Mastery Report 2.0 regression
- Mastery Report results-state-leak regression

### Perfect Competition all-ten validation build

- canonical library: **8,163 questions**
- Risk & Reward eligible ordinary questions: **383**
- eligible by difficulty:
  - Easy: 76
  - Medium: 78
  - Hard: 85
  - Elite: 44
  - Legendary: 100
- Risk & Reward ID uniqueness: **383 / 383**
- embedded assets: **41**, all hash-verified
- answer audit: **565 questions checked, 0 failures**
- all ten selected modes passed preflight

### Inventory threshold checks

- 12 eligible questions -> 10-question run only
- 17 eligible questions -> 10- and 15-question runs
- 383 eligible questions -> 10-, 15-, and 20-question runs

### Wager-state checks

Passed:
- 1,000 bankroll -> 100 / 250 / 500 / 1,000 wagers
- 37 bankroll -> 4 / 9 / 19 / 37 wagers
- correct answer adds exactly the wager
- incorrect answer subtracts exactly the wager
- settlement guard prevents duplicate settlement
- ALL IN loss reaches exactly zero
- zero bankroll sets bust state
- risk-report data remains separate from mastery evidence

## Release status

**4.5s.2m is the authoritative ten-mode Faculty Build Composer release candidate.**
