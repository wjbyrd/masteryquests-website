# Labyrinth final alignment

Branch: `labyrinth-interface-exam-alignment`. Starting commit: `0ff47257` (clean working tree). Work is limited to Labyrinth and focused validation/report files. No push, merge, deployment, Cloudflare or other-collection changes.

## Stage 1 — Canonical Exam navigation

Cost Directive's actual rendered Exam and its Managerial parity wrapper are the interaction reference. The compact 30-position grid uses three rows of ten; eligible ordinary rooms are buttons, inactive/committed rooms remain labeled status cells, and the section checkpoint becomes a button after nine saved responses. Labyrinth now uses that same interaction with its existing blue/gold styling, images and section commitment functions. No alternative navigation widget remains.

Removed the Review Questions trigger/dialog, separate Enter Checkpoint control, and their dead CSS/handlers. The small question-area instruction exactly reads: “Select any room in this section. Responses remain revisable until you enter the checkpoint.” The existing mobile compact Archivist and collapsed secondary artifact disclosure remain Exam-only. The original Standard artifact presentation is unchanged.

The reference uses roughly 36-pixel desktop room cells and smaller responsive cells. Labyrinth uses 36-pixel desktop cell height (120-pixel three-row grid) and 28-pixel mobile cell height (90-pixel grid), with zero button margin so all ten columns align. Room labels state current/saved/unanswered/locked/committed without correctness. Keyboard focus is visibly outlined. The mobile first question remains around 397 pixels from the top, above the answers, rather than below a navigation dashboard.

Matching 1440, 820, 390 and 320 pixel captures are in ignored `tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/`. The reference capture dismisses the existing Daily toast and allows its exit animation to finish; gameplay content is otherwise unmodified. Captures include Cost Directive, prior Labyrinth, current Labyrinth, revisited answers, checkpoint-ready grid, guardian question and summary. Visual review is separate from the functional gate.

![Cost Directive mobile](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/cost-directive-first-390-viewport.png)

![Labyrinth before](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/before-first-390-viewport.png)

![Labyrinth after](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/after-first-390-viewport.png)

![Cost Directive desktop](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/cost-directive-first-1440-viewport.png)

![Labyrinth desktop](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/after-first-1440-viewport.png)

Stage 1 validation: four viewport grid cases pass pointer, touch, Enter/Space, saved-answer restoration, revision without accepted attempts, incomplete checkpoint rejection, checkpoint unlocking, exactly-once commitment, locked sections, neutral labels, visible focus, axe and text enlargement checks. A full real-bank assessment compares 45 protected state snapshots against `0ff47257`: question/options, RNG, scoring, mastery/memory, reports, local events, checkpoint/artifact state all match, ending with 36 accepted responses and 36 Daily-eligible activities. Six additional Exam regressions cover audio silence, withheld correctness/live regions, draft export privacy, early exit, graphs, keyboard, and pending-verification abandonment. The protected source comparison excludes only the intentional presentation region and its neutral instruction; the assessment logic and Daily adapter remain unchanged. Standard second/third-answer failure cases also pass before Stage 2.

## Stage 2 — Authored Archivist introduction

Pending Stage 1 visual acceptance and separate commit.
