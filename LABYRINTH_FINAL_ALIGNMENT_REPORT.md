# Labyrinth final alignment

Branch: `labyrinth-interface-exam-alignment`. Starting commit: `0ff47257` (clean working tree). Work is limited to Labyrinth and focused validation/report files. No push, merge, deployment, Cloudflare or other-collection changes.

## Stage 1 — Canonical Exam navigation

Cost Directive's actual rendered Exam and its Managerial parity wrapper are the interaction reference. The compact 30-position grid uses three rows of ten; eligible ordinary rooms are buttons, inactive/committed rooms remain labeled status cells, and the section checkpoint becomes a button after nine saved responses. Labyrinth now uses that same interaction with its existing blue/gold styling, images and section commitment functions. No alternative navigation widget remains.

Removed the Review Questions trigger/dialog, separate Enter Checkpoint control, and their dead CSS/handlers. The small question-area instruction exactly reads: “Select any room in this section. Responses remain revisable until you enter the checkpoint.” The existing mobile compact Archivist remains Exam-only. Following owner review, the irrelevant Exam artifact disclosure and its forced-visibility/reparenting code were removed entirely. Exam explicitly overrides the legacy vault CSS to keep artifacts hidden through assessment and results; starting Standard restores its original display and location.

The reference uses roughly 36-pixel desktop room cells and smaller responsive cells. Labyrinth uses 36-pixel desktop cell height (120-pixel three-row grid) and 28-pixel mobile cell height (90-pixel grid), with zero button margin so all ten columns align. Room labels state current/saved/unanswered/locked/committed without correctness. Keyboard focus is visibly outlined. The mobile first question remains around 397 pixels from the top, above the answers, rather than below a navigation dashboard.

Matching 1440, 820, 390 and 320 pixel captures are in ignored `tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/`. The reference capture dismisses the existing Daily toast and allows its exit animation to finish; gameplay content is otherwise unmodified. Captures include Cost Directive, prior Labyrinth, current Labyrinth, revisited answers, checkpoint-ready grid, guardian question and summary. Visual review is separate from the functional gate.

![Cost Directive mobile](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/cost-directive-first-390-viewport.png)

![Labyrinth before](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/before-first-390-viewport.png)

![Labyrinth after](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/after-first-390-viewport.png)

![Cost Directive desktop](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/cost-directive-first-1440-viewport.png)

![Labyrinth desktop](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-1/after-first-1440-viewport.png)

Stage 1 validation: four viewport grid cases pass pointer, touch, Enter/Space, saved-answer restoration, revision without accepted attempts, incomplete checkpoint rejection, checkpoint unlocking, exactly-once commitment, locked sections, neutral labels, visible focus, axe and text enlargement checks. A full real-bank assessment compares 45 protected state snapshots against `0ff47257`: question/options, RNG, scoring, mastery/memory, reports, local events, checkpoint/artifact state all match, ending with 36 accepted responses and 36 Daily-eligible activities. Six additional Exam regressions cover audio silence, withheld correctness/live regions, draft export privacy, early exit, graphs, keyboard, and pending-verification abandonment. The protected source comparison excludes only the intentional presentation region and its neutral instruction; the assessment logic and Daily adapter remain unchanged. Standard second/third-answer failure cases also pass before Stage 2.

## Stage 2 — Authored Archivist introduction

Stage 1 passed and was committed as `a9caa700` (`Align Labyrinth Exam grid with canonical RPG navigation`) before Stage 2 implementation began.

The standalone Labyrinth now uses the authored Arcane Archive guide in its existing native introduction dialog. The authoritative text is `BUILT_IN_GUIDE_INTROS.archivist` in `build/faculty-build-composer/composer-core.js`:

> Greetings. I am the Archivist. It is my responsibility to guide you through these halls and ensure you know your economics.
>
> If you are ready, follow me.

The portrait is the existing `play/micro-domains/labyrinth-of-choice/wizard.webp`, selected by the official Composer `arcane-guide` asset in `build/faculty-build-composer/data/official_theme_library.js`. The validation compares the local file byte-for-byte with the official theme's source image. Its existing alternative is “The Archivist, an arcane guide.” No text or artwork was invented, and no Composer code or generated output was edited.

### Lifecycle and preserved timing

A namespaced `labyrinthChoice:guideIntroSeen` flag uses Composer's once-per-browser/game convention. The normal mode-selection gate runs after supported-mode checks, setup choices and preflight, before `beginRunSession`, RNG-consuming initialization, or question selection. Small fallback gates cover direct new-run/start calls; resume explicitly bypasses them. Proceed, Skip and Escape dismiss the introduction, mark it seen, and call the pending launch once. A memory fallback handles unavailable seen-state storage. Returning players do not see it automatically on each new run.

Game Menu's existing Replay Introduction action now shows the authored Archivist portrait and dialogue. The menu organization is unchanged. Replay only opens/closes presentation; it never calls initialization, question selection or scoring. The dialog retains focus, provides Proceed and Skip, and restores Game Menu focus after replay. The first launch proceeds to the question. The pre-game screen temporarily releases its focus/inert ownership to the native dialog and is restored before the selected launch continues. Native modality keeps background controls unavailable while reading.

Before the first run, reading time consumes no Timed Trial allowance and selects no question. During replay, Labyrinth's existing policy is preserved: Timed Trial's deadline keeps running; Score Attack keeps its original question start time; Fading Fortune continues removing distractors and reducing value. Opening Game Menu still applies its existing Fading pause; choosing Replay closes the menu and resumes that clock exactly as the old title replay did. No timing policy was copied from another collection. If the active run ends while replay is open, the dialog closes without starting a new run.

No new music, spoken dialogue, live-region announcements or decorative animation was added. The dialog uses the existing blue/gold menu language and the original sound/motion preferences. Its heading receives initial focus; the dialogue remains readable until the student dismisses it. Tab/Shift+Tab cycle through the two actions; Enter/Space and touch work; Escape is contained so the legacy graph closer cannot alter a timer.

![Archivist desktop](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-2/archivist-1440-viewport.png)

![Archivist mobile](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-2/archivist-390-viewport.png)

![Archivist narrow mobile](tmp/accessibility_cleanup/labyrinth-final-alignment/stage-2/archivist-320-viewport.png)

### Final validation

`archivist-integration.mjs` compares the current HTML with Stage 1 byte-for-byte outside the reviewed introduction CSS/lifecycle, the three launch gates, and the local artifact fingerprint. Thus the Exam adapter, Daily core/adapter, feedback/repair/retest code, Sovereign pages and guardian mechanics remain unchanged by Stage 2. The Stage 1 comparison separately protects the earlier assessment engine and all 90 graph-bearing question references, 21 extended-description records and their unchanged artwork. The bank was not regenerated.

The introduction suite compares initial launch, replay and an accepted answer against Stage 1 in all ten modes. It asserts equal question identity/order, RNG counts, score/streak, mastery/adaptive memory, remediation state, checkpoint/artifacts, Daily state, local events and timestamps. Exam replay also compares all saved draft records. Replay preserves stored run data except the explicitly authorized guide-seen flag. First-launch Skip and Proceed produce identical state. Saved Standard games resume correctly even when the guide-seen flag is absent; replay then marks it seen, and a reload/new Exam bypasses the introduction. Quiz setup precedes the guide gate; direct Standard restart is also gated.

Four viewport cases (1440/820/390/320) pass keyboard containment, focus visibility, image decoding, axe, persistent seen-state and mobile/text-enlargement checks. Twenty seconds of first-launch reading draws no RNG and records no attempt; the authored dialogue has no auto-dismiss deadline. Screenshots were visually inspected at desktop and mobile widths. These are browser/DOM accessibility checks, not a manual NVDA or VoiceOver certification.

The final complete Exam matches the pre-task approved baseline across 45 protected states, ends with 36 accepted responses, preserves 70 CSV columns, and records exactly the original telemetry semantics. The complete `validate.mjs phase2` suite covers all nine non-Exam mode comparisons plus Exam, responsive Game Menu, sound/motion persistence, fullscreen availability, reporting, save/resume, graphs, delayed correctness, audio silence, draft-export privacy, commitment, and abandoned asynchronous verification.

Guardian validation uses real Standard progression. Each of rooms 10, 20 and 30 is tested with a miss on answer one, two and three: immediate encounter failure, exactly three-room setback, unchanged artifact ownership/checkpoint, and no remediation. The natural campaign regression separately fails/retries all three guardians and then completes, checking awards and final completion events. No new boss introduction or modification to the existing Sovereign story is included.

Local evidence is ignored under `tmp/accessibility_cleanup/labyrinth-final-alignment/`; screenshots and telemetry fixtures are not committed. All browser profiles are synthetic and external requests are blocked. Other collections, Composer generation, Cloudflare, routes, secrets, subscriptions, retention, anonymous collection and telemetry serialization remain unchanged. Only the existing local artifact fingerprint is refreshed to identify the edited HTML.

Final results: all 23 main regression cases, nine guardian failure scenarios, 17 initial introduction cases plus the timer-expiry case (18 total), and the final full Exam comparison passed. The natural Standard completion evidence contains all three artifact flags set to true and exactly one completion event. The timer-expiry case confirms a 30-second first-time reading period leaves the full ten-minute allowance available, while active replay allows the deadline to expire and records exactly one timed completion. Additional focused checks passed for Repair → Bridge → Retest with readable Recovery Complete, loading a pre-task Standard save unchanged, and graph descriptions/enlargement/focus restoration. The fingerprint check passes.

### Reproduction and remaining limitations

```powershell
node audit_tools/labyrinth_alignment/canonical-alignment.mjs
node audit_tools/labyrinth_alignment/archivist-integration.mjs
$env:MQ_LABYRINTH_BASELINE='a9caa700'
$env:MQ_A11Y_OUT='tmp/accessibility_cleanup/labyrinth-final-alignment/recheck'
node audit_tools/labyrinth_alignment/validate.mjs phase2
node audit_tools/labyrinth_alignment/validate.mjs deep 'Standard first miss'
node audit_tools/labyrinth_alignment/update-fingerprint.mjs --check
```

The two requested integrations are confined to Labyrinth. Earlier audit findings in Composer/Economic/Macro and older telemetry variants remain outside this task; they were not silently propagated into Labyrinth. The guide seen flag follows browser storage, so another device/profile (or cleared storage) shows the introduction again. Manual screen-reader certification and the owner's Cloudflare preview inspection remain external follow-ups. No push, merge or deployment was performed; production release remains the owner's decision.
