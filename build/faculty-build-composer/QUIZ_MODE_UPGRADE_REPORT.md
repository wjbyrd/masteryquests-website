# Quiz Mode Upgrade — 4.5q.0

## Release decision
Quiz Mode is enabled as a fixed-length classroom assessment/practice mode. Faculty choose the content in the composer. Learners choose only the number of questions, from 1 through 15.

## Student flow
1. Open the generated game.
2. Choose **Quiz** if the instructor enabled it.
3. Select a quiz length from 1–15 questions. Quick buttons are provided for 5, 10, and 15.
4. Launch the quiz.
5. Complete exactly the selected number of scored questions.
6. View the normal completion screen and Mastery Report.

## Quiz behavior
- No concept selector is exposed to learners.
- No checkpoints, artifacts, campaign progress, save/resume, or setbacks.
- No Repair/Bridge detours are inserted during the quiz; the selected quiz length remains fixed.
- Wrong answers are recorded and the quiz advances to the next item.
- Rapid-guess lockouts do not consume a quiz question; the active question must be answered normally.
- Quiz questions are balanced across the base adaptive tiers:
  - 10 questions: 4 Easy / 3 Medium / 3 Hard
  - 15 questions: 5 Easy / 5 Medium / 5 Hard
  - other lengths are divided as evenly as possible across Easy, Medium, and Hard.
- The composer requires at least 5 valid Easy, 5 Medium, and 5 Hard questions for Quiz Mode. This intentionally matches the minimum needed to support a 15-question quiz.

## Mode availability
Quiz participates in the existing faculty mode-availability system. If Quiz is the only enabled mode, it is the only mode card learners see. Existing one-mode/two-mode/all-mode hiding behavior remains intact.

## Validation
- Composer version: 4.5q.0
- Canonical questions: 7,977 unchanged
- Quiz-only generated build: PASS
- Exact-floor 5 Easy / 5 Medium / 5 Hard concept: PASS
- 10-question difficulty distribution: 4 / 3 / 3 PASS
- 15-question difficulty distribution: 5 / 5 / 5 PASS
- Quiz mode no-checkpoint/no-remediation/no-setback guards: PASS
- Mode availability regression including six modes: PASS
- Oligopoly parent validation: PASS
- Legacy composer recipes: 8/8 PASS
- Generated inline JavaScript syntax: PASS
- Composer library byte identity versus 4.5p.0: PASS
- 399 question assets byte-identical: PASS
