# Unlimited Practice + Exam Drill Manual Exit Upgrade

## Release

Composer **4.5r.0**

Baseline: Composer 4.5q.0 / Quiz Mode package.

## What changed

### Unlimited Practice

Unlimited Practice is now a seventh faculty-selectable mode.

It inherits the Exam Drill practice architecture:

- no checkpoints/boss encounters
- no artifacts
- no campaign/realm progress
- Easy, Medium, Hard, Repair, and Bridge pools
- adaptive concept/skill/question-form routing remains active

Unlimited Practice does not terminate after the first 30-room practice path. Instead, it rolls into another 30-room adaptive practice cycle while preserving the run's mastery evidence, accuracy, streak, timing, concept memory, and telemetry. The student can continue for as long as desired.

### End Practice control

Exam Drill and Unlimited Practice now display an **End Practice** control during an active run.

Flow:

1. Student selects **End Practice**.
2. Confirmation dialog explains that the practice session will end.
3. Confirm button reads **Generate Mastery Report**.
4. The run is frozen, completion telemetry is written, and the Mastery Report opens immediately.

The control is hidden in Standard Campaign, Timed Trial, Quiz, Legendary Mode, and Score Attack.

### Exam Drill protection

Exam Drill still completes normally if the student reaches the end of its 30-room path.

If the student ends Exam Drill early, the engine generates the Mastery Report but does **not** set the Exam Drill completion achievement/flag. Early exit is evidence, not fake completion.

Manual-exit telemetry events are distinct:

- `exam_ended_by_student`
- `unlimited_ended_by_student`

### Composer and mode availability

The composer now supports seven modes:

1. Standard Campaign
2. Timed Trial
3. Exam Drill
4. Quiz
5. Unlimited Practice
6. Legendary Mode
7. Score Attack

Unlimited Practice uses the same readiness requirements as Exam Drill: Easy, Medium, Hard, Repair, and Bridge. The hard mode-hiding fix remains in place, including an Unlimited-only generated game.

## Regression protection

Quiz Mode remains unchanged:

- 1–15 question selector retained
- 10-question distribution remains 4 Easy / 3 Medium / 3 Hard
- 15-question distribution remains 5 / 5 / 5
- fixed-length quiz behavior retained
- no quiz repair/bridge detours or setbacks

The canonical economics library remains **7,977 questions**. Composer library, registry, manifest, and all 399 question assets are byte-identical to the 4.5q.0 baseline.

## Validation

Passed:

- Unlimited-only composer build and preflight
- Seven-mode availability validation
- Unlimited Easy/Medium/Hard cycle sequence
- practice-control visibility simulation
- Exam Drill manual-exit simulation
- Unlimited Practice manual-exit simulation
- direct Mastery Report generation after manual exit
- Exam Drill early-exit completion-flag guard
- Quiz Mode regression validation
- template inline JavaScript syntax check
- composer JavaScript syntax checks
- protected question-library/source integrity

Interactive Chromium execution was attempted in the build sandbox, but local browser navigation is blocked by the sandbox administrator. Generated-HTML and runtime-function simulations therefore provide the automated validation layer for this release; final browser smoke testing remains the deployment check.
