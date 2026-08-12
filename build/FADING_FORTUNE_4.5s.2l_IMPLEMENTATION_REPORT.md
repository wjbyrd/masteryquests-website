# Mastery Quests Faculty Build Composer 4.5s.2l
## Fading Fortune — Mode 9 Implementation

Base: 4.5s.2k (Trial by Graph intact)  
Release: 4.5s.2l  
Date: 2026-08-12

### Implemented
- Added Mode 9: Fading Fortune to the Composer and generated-game template.
- Fixed run lengths: 10, 15, and 20, exposed only when the selected concept mix contains enough unique eligible questions.
- Eligibility uses ordinary Easy/Medium/Hard/Elite/Legendary questions with exactly four answer choices; boss, Repair, and Bridge pools are excluded.
- Every question begins at 100 points. Incorrect choices fade in randomized order and live value drops 100 → 75 → 50 → 25. The correct answer is never eligible to fade.
- Wrong answers earn 0; correct answers earn the frozen live value at submission.
- Fade intervals are centralized: Easy 8s, Medium 10s, Hard 12s, Elite 15s, Legendary 18s.
- Fade timer starts after the question is rendered and secure correct-answer resolution completes.
- Graph lightbox, browser/tab visibility, game modal, rapid-guess lockout, and answer verification pause the fade timer without resetting the current interval.
- Pause reasons stack; clearing one pause cannot restart the timer while another pause remains active.
- Fading Fortune uses a fixed unique deck and does not use bosses, checkpoints, Repair/Bridge detours, room setbacks, artifacts, realm progress, or save/resume.
- Existing accuracy, mastery, response timing, streaks, local telemetry, verification code, CSV export, results, and Mastery Report 2.0 remain active.
- Mastery Report 2.0 adds “Independence Under Pressure,” including 100/75/50/25 answer distribution and average question value.
- Telemetry v2 includes Fading Fortune score/value/fade/timing fields and completion distribution.

### Inventory behavior
- >= 10 eligible questions: 10-question run enabled.
- >= 15 eligible questions: 15-question run enabled.
- >= 20 eligible questions: 20-question run enabled.
- < 10 eligible questions: Fading Fortune fails Composer/runtime preflight rather than padding with unsuitable questions.

### Representative validation
- Perfect Competition: 383 eligible questions; 10/15/20 available.
  - Easy 76
  - Medium 78
  - Hard 85
  - Elite 44
  - Legendary 100
- Integrated Economic Analysis: 12 eligible; 10 only.
- Competitive Markets: 17 eligible; 10/15.
- Integrated Macroeconomic Analysis: 0 eligible; correctly rejected.
- Canonical question count remains 8,163.

### Regression validation
PASS:
- Composer-core syntax
- Composer UI JavaScript syntax
- generated-game inline JavaScript syntax
- nine-mode composition/preflight
- mode-availability filtering
- Quiz Mode
- Unlimited Practice
- Trial by Graph
- Mastery Report 2.0
- Mastery Report results-state-leak hotfix
- dedicated Fading Fortune static validation

### Browser-state validation
PASS:
- unique 10-question launch deck
- 100 → 75 → 50 → 25 decay
- exactly three incorrect choices removed
- correct answer never removed
- pause preserves live value
- 25-point and 100-point scoring
- next question resets to 100
- answer/fade race freezes submitted value
- graph-lightbox pause/resume
- stacked graph + modal pause behavior
- browser visibility pause/resume
- no timer leak when returning to the mode menu

The container browser test document has an opaque origin, so the browser harness uses a localStorage shim and deterministic answer-verification stub. The generated production game retains the existing secure SHA-based answer verifier; that engine path was not replaced.
