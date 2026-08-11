# Mode Availability Fix — Composer 4.5p.0

## Purpose

Generated faculty games must expose only the modes selected in the Faculty Concept Composer.

## Defect

The template already set unselected mode cards to the HTML `hidden` state, but a later faculty-template CSS rule declared `.mode-card { display:grid; }`. That author-level display rule overrode the browser's hidden presentation, so all five cards could remain visible even when the composition configuration contained only one or two supported modes.

The engine already blocked launching unsupported modes. The defect was therefore primarily a mode-menu presentation failure, but it made faculty mode selection appear broken.

## Fix

1. Added a hard presentation guard:
   - `.mode-card[hidden] { display:none !important; }`
   - disabled cards also receive `.faculty-mode-disabled` as a defensive class.
2. Strengthened `applyFacultyCompositionConfig()` so each card receives:
   - `hidden`
   - `disabled`
   - `aria-hidden`
   - `tabIndex=-1` when disabled
   - `.faculty-mode-disabled`
3. Added `data-enabled-count` to the mode grid.
4. Added centered layouts for one- and two-mode compositions.
5. Reapply the faculty mode configuration every time the mode screen opens:
   - title screen → mode screen
   - active run → mode screen
6. Kept the existing hard runtime guard in `startSelectedMode()` so an unsupported mode cannot be started programmatically.

## Validation

Three generated Oligopoly builds were produced from the current 7,977-question library.

### Timed Trial only

- Requested: `timed`
- Visible: `timed`
- Hidden/disabled: `standard`, `exam`, `legendary`, `score`
- Enabled-card count: 1
- Timed preflight: PASS

### Timed Trial + Exam Drill

- Requested: `timed`, `exam`
- Visible: `timed`, `exam`
- Hidden/disabled: `standard`, `legendary`, `score`
- Enabled-card count: 2
- Timed preflight: PASS
- Exam preflight: PASS

### All five modes

- Requested: `standard`, `timed`, `exam`, `legendary`, `score`
- Visible: all five
- Hidden: none
- Enabled-card count: 5
- All selected mode preflights: PASS

## Regression / integrity

- Composer version: 4.5p.0
- Canonical questions: 7,977
- Question semantic SHA-256 before: `39d66cddfc78c4115dfb459e7a959396c115259d15ac85ed80503f4e9f0c32b7`
- Question semantic SHA-256 after: `39d66cddfc78c4115dfb459e7a959396c115259d15ac85ed80503f4e9f0c32b7`
- Question-content changes: 0
- Current Oligopoly parent validation: PASS
- `composer-core.js` syntax: PASS
- `composer.js` syntax: PASS

## Verdict

**PASS — mode availability now matches faculty selection in the generated game.**

This also establishes the correct behavior before Quiz and Unlimited Practice are added: only instructor-enabled modes will appear in the learner-facing mode menu.
