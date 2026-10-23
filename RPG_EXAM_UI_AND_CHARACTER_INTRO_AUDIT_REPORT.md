# RPG Exam UI and character introduction audit

Branch: `labyrinth-interface-exam-alignment`. Baseline: `4b6527b41ca3e027322c14eb502c3a18e696c13e`. The working tree was clean. No push, merge, deployment or Cloudflare changes are authorized or performed.

## Stage A: Labyrinth Exam presentation

Actual desktop and mobile browser captures of current Composer-generated output, Economic Realm, Macro Command and Managerial show compact three-row progress displays. Those engines use their compact room controls for section navigation; they do not already contain the requested nine-question review modal. Labyrinth therefore retains their compact visual hierarchy while adopting the owner's explicitly preferred optional review interaction. Reference screenshots are under ignored `tmp/accessibility_cleanup/labyrinth-restoration/reference-*.png` (full page and viewport). Daily announcement toasts were dismissed for the final comparison captures.

The 30-room strip is now a compact, noninteractive status display, with current/saved/locked/committed accessible labels. The oversized Exam-only tiles and persistent section instructions are removed. Review Questions opens a dialog containing only the active section's nine questions, their saved/unanswered/current state, and a guarded Enter Checkpoint control. Selecting a question returns focus to that question. Escape/Return restores the review trigger. A separate Enter Checkpoint action appears beside Review only when all nine responses are saved. There are no permanent bottom navigation buttons. The modal uses the existing navigation and commitment handlers.

Exam alone starts at the top of the viewport, uses a compact Archivist portrait and moves the unchanged artifact vault into a collapsed disclosure below the question. Standard restores the original artifact location and styling. Labyrinth's background, blue/gold palette, artwork and atmospheric effects are retained. At 390 pixels the first question and all four answers fit inside the 900-pixel viewport; prominence is checked by element coordinates and visual inspection, not just absence of overflow.

Protection checks compare all original runtime source preceding the Exam presentation block and the unchanged Daily adapter. The assessment code after navigation is unchanged except removal of two repeated instructional messages. Real-bank regression compares a complete assessment against the baseline across 45 states, including question/option identity, accepted attempts, adaptive/mastery state, scoring, checkpoints, reports, telemetry, artifact state and RNG draw count. Full completion remains 36 accepted responses and 36 Daily-eligible activities. Six focused Exam cases cover draft revision, withheld feedback, audio silence, draft CSV without answer keys, early exit, canonical cross-engine behavior, graphs, keyboard/axe and pending-verification abandonment. Standard natural boss failures/retries/completion, save/resume and first-miss-after-one/two-correct cases also pass. Non-Exam seeded comparisons remain equal to baseline.

The review dialog was checked for keyboard containment, touch, current/saved labels, incomplete commitment rejection, stable answer order, focus return, checkpoint entry and summary at 1440, 820, 390 and 320 pixels. Full-page and viewport evidence includes first question, review, revisited question, checkpoint entry and guardian summary. The final CSS fixes the modal to the viewport so changing underlying graph content cannot move its targets. Review text wraps within narrow cells. Zoom and axe checks supplement visual inspection.

![Before, mobile](tmp/accessibility_cleanup/labyrinth-restoration/before-first-390-viewport.png)

![After, mobile](tmp/accessibility_cleanup/labyrinth-restoration/after-first-390-viewport.png)

![Review questions, mobile](tmp/accessibility_cleanup/labyrinth-restoration/review-390-viewport.png)

![After, desktop](tmp/accessibility_cleanup/labyrinth-restoration/after-first-1440-viewport.png)

## Stage B: Introduction contract and inventory

Pending Stage A acceptance and separate commit.
