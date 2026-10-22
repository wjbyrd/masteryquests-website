# Accessibility cleanup handoff

Evidence-path note (PR cleanup): Generated files referenced under `validation_artifacts/` are retained locally as ignored test outputs and are not included in the current PR tree. The three captured production inputs for the boss comparison remain tracked. See [ACCESSIBILITY_PR_CLEANUP_REPORT.md](ACCESSIBILITY_PR_CLEANUP_REPORT.md) for retention details. Historical test conclusions below are unchanged.

Targeted repairs are implemented locally across the site, faculty tools, shared templates, 22 maintained missions, beta Composer game, manual downloads and six collection hubs. No push or deployment was performed. The baseline/rollback reference is `5e1d5644cc4dffcf60a614c7dd12c568238e0e14` on `main`.

The visible changes serve specific access needs: darker teal links; clear focus; readable narrow-screen reports/maze/dialogs; visible graph-description disclosures; a decorative-motion control; and a disclosure for feedback already released during the current run. Existing art, themes, music, routes, question content and the “Turn practice into a path toward mastery.” wording remain.

Keyboard handling now preserves focus across answer rerenders and report replacement. Dialogs isolate their background and restore their own opener, including nested overlays. Routine feedback uses polite status announcements; Exam retains its existing release restrictions. Faculty appearance controls retain focus after updates, upload/CSV errors are associated with their controls, and downloads have status messages. CPI's report definition-list structure was corrected.

## Propagation and preservation

New canonical helpers live beside the Composer template and are embedded into standalone HTML. Existing Realm/Macro generators propagate the shared template. A focused legacy sync carries presentation-only repairs into independent Managerial/Micro/beta/manual builds. Hub sync has its own helper. New exports need no runtime fetch from Masteryquests.org.

Broad regeneration of the frozen manual downloads was deliberately avoided because it would also change existing instructional runtime behavior. New accessibility preference storage is local and additive: `mq:accessibility:decorative-motion`. Existing save keys/run identities, question pools/keys, adaptive selection, scoring, rapid-guess rules, timers, remediation/checkpoints, report calculations, CSV schemas, telemetry defaults and recovery codes were retained. The targeted source comparison found 430 unchanged protected definitions across 26 game files and no bank/model/storage changes.

Affected source groups are `assets/`, the Composer controller/template helpers, `tools/answer-analysis/report.js`, the CPI view, canonical synchronization tooling, maintained game/hub HTML, and focused audit/test tooling. Test-only fixes align old hub-inventory/image expectations with the current repository and make lazy-image checks scroll before decoding. The preview server now resolves the already-published Growth Realms mapping.

## Validation and remaining work

The audit includes an inventory-backed scan of 83 published HTML routes and launched question states for all 24 applicable current game/starter/beta routes; ten-mode focus/release tests; 48 controlled before/after mode cases across five runtime representatives; phone/tablet/text-spacing/200% text/400% Chrome zoom; save/resume, checkpoint, completion, Mastery Report and CSV checks; faculty recipe/custom-image/official and custom export workflows; and reused puzzle/simulation suites. See the validation report for exact results and limitations, including retained failed/interrupted iterations.

Fixed and tested: keyboard focus, modal isolation/restoration, released-feedback access, graph presentation path, scoped contrast/reflow/motion, faculty errors/controls/download statuses, and CPI structure. Already-working independent puzzle/simulation features were retained and regression-tested.

Still needs manual verification: actual screen-reader output, Firefox/WebKit/Safari and physical mobile combinations, every graph's content equivalence, comprehensive media/flashing review, and unexercised current puzzle/classroom branches. Browser trees are not screen-reader tests.

Requires owner decision: accessibility accommodations for protected timing/scoring mechanics, treatment of obsolete but still-published HTML copies, and any future migration of frozen manual/independent engines. No essential-timing exemption was assumed. Existing missing Realm video/Micro sound assets remain documented. Linked PDF/DOCX/slide-library and third-party remediation are outside this task.

The historical Signal House panorama test still targets obsolete controls; its failure is retained alongside passing current-release tests. Other early failures included test-harness lazy-image stalls, stale inventory assertions, local preview mapping and a rebuild/test overlap; the reports distinguish those from product regressions. No failing checker rule was suppressed to manufacture a clean result.

Detailed handoff:

- [Audit, inventory, findings and owner decisions](docs/accessibility-cleanup-audit.md)
- [Commands, coverage, evidence and manual script](docs/accessibility-cleanup-validation.md)
- Evidence: `validation_artifacts/accessibility_cleanup/`; test-only generated exports/profiles: ignored `tmp/accessibility_cleanup/`.

These changes do not establish blanket WCAG conformance, legal compliance or certification. For rollback, review/revert the accessibility diff against the baseline SHA; do not reset unrelated future work or replace the independent engines with a broad generator.
