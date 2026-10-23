# Labyrinth preview refinements

## Scope and baseline

Work remained on `labyrinth-interface-exam-alignment`, starting with a clean tree at `8567ab7a` (the approved Phase 1/2 implementation plus the preview-URL configuration correction). The comparison baseline was this branch state, not the pre-modernization Exam implementation. No push, merge or deployment was performed.

Files changed:

- `play/micro-domains/labyrinth-of-choice/index.html`: local menu styles, local graph-lightbox sizing, Exam navigation presentation and the existing Labyrinth engine fingerprints.
- `play/micro-domains/labyrinth-of-choice/labyrinth_of_choice_question_bank_student.js`: graph alt text and a `questionAssetMetadata` map of extended descriptions, consumed by the existing accessibility helper.
- `audit_tools/labyrinth_alignment/preview-refinements.mjs`: graph inventory, preservation assertions, menu/graph accessibility checks and full Exam comparison.
- `audit_tools/labyrinth_alignment/validate.mjs`: allow an explicit ignored evidence output directory and resolve the generated Composer reference from that directory so this task does not overwrite earlier results.
- `LABYRINTH_PREVIEW_REFINEMENT_REPORT.md`: this report and complete inventory.

## Operation Menu

Economic Realm's one-column Game Menu supplied the structural reference: consistent full-width controls, compact regular gaps, common typography, border and interactive states. Labyrinth retains its dark blue gradient, cyan focus treatment, gold hover accent, rounded borders and existing atmosphere.

Sound, Fullscreen, Decorative Motion, Return to Mode Selection and Close now share the same width, font, padding, border, background and shadow. All controls have a 48-pixel minimum height, wrapping when necessary at narrow widths. Every inter-button gap is 10 pixels, including the gap after Decorative Motion. The empty status paragraph no longer reserves space; it still appears if the fullscreen API reports an error.

The menu script/handlers are byte-identical to baseline. No floating controls returned. Sound/motion persistence, supported/unsupported fullscreen, Tab/Shift+Tab containment, Enter/Space activation, Escape, Close and opener focus restoration passed browser checks. Existing End Practice and Return confirmation behavior remain intact.

Before/after evidence at [1440 before](tmp/accessibility_cleanup/labyrinth-refinements/before-menu-1440.png), [1440 after](tmp/accessibility_cleanup/labyrinth-refinements/after-menu-1440.png), [390 before](tmp/accessibility_cleanup/labyrinth-refinements/before-menu-390.png), [390 after](tmp/accessibility_cleanup/labyrinth-refinements/after-menu-390.png), and [320 after](tmp/accessibility_cleanup/labyrinth-refinements/after-menu-320.png). Equivalent 820-pixel captures are in the same ignored directory.

## Exam navigation

Removed the extra visible instructional paragraph and its bordered/background panel. Previous Question, Next Question and Enter Checkpoint remain immediately beneath the answers, without repeating the revision/commit instructions. Disabled buttons use a muted background, dashed border and native `disabled` state.

A concise section count and checkpoint-availability description remains in the existing `sr-only` style. The navigation region and checkpoint control refer to it with `aria-describedby`. Numbered rooms retain saved/unanswered/locked/current accessible labels; selected answers retain `aria-pressed`; the existing neutral saved/updated announcements remain. No new live region was introduced.

The only Exam JavaScript change is inside `renderNavigation`. Draft verification, stable questions/options, revision handling, commitment, scoring, feedback release, checkpoint outcomes and completion are byte-identical to baseline. The full Exam baseline comparison exercised 45 states and found identical questions/options, counters, adaptive/mastery/remediation state, checkpoint progression, report data and measured event fields.

Evidence: [before Exam navigation](tmp/accessibility_cleanup/labyrinth-refinements/before-exam-navigation.png), [after Exam navigation](tmp/accessibility_cleanup/labyrinth-refinements/after-exam-navigation.png).

## Graph audit and accessibility

Audited the entire playable bank structure, including its repair/bridge collections: **90 graph-bearing questions reference 21 distinct PNGs**. No additional graph references were found in the repair/bridge pools. All 21 images exist and were visually inspected alongside every associated question. Their bytes are identical to baseline.

All 90 references had alt text, but **zero had an extended description**, and there was no asset metadata map supplying one. All 21 images therefore required correction. No graph was already complete. Alt text was standardized to a concise visual identification, moving fuller coordinates and relationships into the extended description. This also removes question-specific economic interpretations from several older alt strings without withholding information actually drawn.

Descriptions identify actual axes/units, curves, directions, labeled points, guides, contacts and intersections. Exact coordinates are used where the image supplies them. Unlabeled intersections and corners are described by visible ranges or relative positions; no exact value is invented. Elasticity plots name no commodity or further units, so the descriptions do not invent them. No elasticity, revenue or welfare calculation is solved, and no correct-choice commentary is added. Visible curve positions and labels remain described even when a question asks students to interpret them.

The current `getQuestionGraphAccessibility` → `renderQuestionGraph` → `openGraphLightbox` infrastructure is unchanged. The new data map supplies its existing metadata lookup. Both views use the same text and `aria-describedby` associations. No alternate description component or shared accessibility modification was introduced.

Browser checks rendered **every one of the 90 real questions** at 1280 and 390 pixels. Each image decoded successfully. The normal disclosure opened with Enter; image enlargement worked by keyboard; the expanded disclosure opened with Space. Browser accessibility-tree descriptions matched the authored text in both views. Normal image/disclosure grouping and enlarged image/disclosure order were checked; Tab/Shift+Tab remained trapped in the enlarged dialog, and Escape returned focus to the invoking graph. All content was reachable without horizontal overflow.

The first mobile run exposed an existing lightbox width exceeding its padded container. Visual review also found vertically centered long content could place the image top outside the scrollable area. The correction is confined to Labyrinth's local style block: constrain image/description width to the container and start the expanded contents at the top. The final graph runs verify that both the top of each image and the end of each description can be reached.

Representative evidence: [normal elasticity graph on mobile](tmp/accessibility_cleanup/labyrinth-refinements/graph-normal-390-ELASTICITY-03.png), [expanded income/substitution graph on mobile](tmp/accessibility_cleanup/labyrinth-refinements/graph-expanded-390-INCOME-SUB-04.png). Each of the 21 graphs has normal and enlarged screenshots at both tested widths (84 graph captures). Full-page screenshots also include the underlying document below the fixed dialog viewport; that is capture behavior, not a second active dialog.

## Regression results and protected boundaries

**PASS: 23 existing focused regression cases**, using baseline `8567ab7a`, in [regression/phase2-results.json](tmp/accessibility_cleanup/labyrinth-refinements/regression/phase2-results.json):

- Nine unaffected modes: seeded question selection/options, difficulty, attempts, correctness, streak, adaptive/mastery state, boss state, scores/bankroll, response times and event traces matched baseline in the exercised paths.
- Four responsive menu/report checks, fullscreen supported/unavailable, text enlargement, sound/motion persistence and End Practice/report behavior passed.
- Standard save/resume passed. Natural Standard failures at rooms 10, 20 and 30 went to 7, 17 and 27 without failed trophy/checkpoint advancement; three-correct retries awarded the three artifacts and completed normally.
- Exam selection/revision/revisit, incomplete-section blocking, exactly-once section commitment, all checkpoint outcomes, full 36-response completion, early exit, committed-only reports, no result-specific audio and pending-answer abandonment passed. Composer, Economic Realm, Macro and Managerial reference checks remained passing.

The reference comparison also passed a focused rerun using the newly generated Composer file in the selected evidence directory: [regression/phase2-focused-results.json](tmp/accessibility_cleanup/labyrinth-refinements/regression/phase2-focused-results.json).

**PASS: seven refinement cases** in [final-results.json](tmp/accessibility_cleanup/labyrinth-refinements/final-results.json): four menu widths, all graphs at two widths, and the full 45-state Exam comparison. The final summary combines the unchanged menu/Exam results from the initial run with the two passing graph reruns after the local lightbox fix. The initial mobile overflow failure is retained in `results.json`; it is not counted as passing. `focused-results.json` records the corrected graph runs.

Source/data preservation assertions also passed:

- Every bank field other than `imageAlt` is deeply equal to baseline, including question IDs, wording, choices, answer keys, explanations, objectives, difficulty and repair/bridge data. Extended descriptions live in the existing helper's asset map.
- Every graph PNG is byte-identical to baseline.
- All original HTML before the local presentation block is byte-identical except the two existing Labyrinth engine hash values. Shared helpers, Standard/other-mode mechanics, timing, save schema, reports, CSV columns and telemetry serialization remain unchanged.
- Menu handlers are unchanged; all Exam code except navigation rendering is unchanged. The engine fingerprint refresh changes provenance metadata only, not the telemetry contract or schema.
- `wrangler.jsonc` is byte-identical to baseline, preserving preview isolation and production routes. Other collections, source artwork and authoring banks are untouched.
- All inline scripts compile; whitespace/diff checks pass.

The real-bank browser tests use isolated synthetic profiles, seeded randomness and local assets; non-local network requests are blocked. Automated accessibility scans on menu, graph and Exam/report states found no violations. Some automated checks remain marked for manual review, including color contrast involving artwork. Actual NVDA, JAWS, VoiceOver and physical touch-device testing were not performed; browser accessibility-tree and keyboard checks are not a claim of complete screen-reader or WCAG conformance.

## Remaining issues and reproduction

No unresolved defect from the three requested refinements remains in the tested scenarios. Owner preview inspection and human assistive-technology review remain appropriate before production approval. This audit concerns the published playable bank; original authoring JSON is intentionally untouched. Future bank regeneration must retain the reviewed published accessibility metadata.

Run `node audit_tools/labyrinth_alignment/preview-refinements.mjs` for preservation, inventory and the seven refinement cases. With Playwright and Edge installed, set `MQ_LABYRINTH_BASELINE=8567ab7a` and `MQ_A11Y_OUT=tmp/accessibility_cleanup/labyrinth-refinements/regression`, then run `node audit_tools/labyrinth_alignment/validate.mjs phase2` for the 23-case suite. The shared runner's full current-bank regression comparisons are supplemented by the refinement runner, which serves both the baseline HTML and baseline bank for its exact Exam comparison. Evidence and generated reference artifacts remain ignored.

## Complete graph inventory

The following entries include every referenced image, all associated question IDs, and the exact final alt/extended description. Every entry had existing alt text but a missing extended description; every entry was corrected. The machine-readable inventory additionally records each question's bank path, wording and image SHA-256 in [graph-inventory.json](tmp/accessibility_cleanup/labyrinth-refinements/graph-inventory.json).

### DEMAND-01.png

Questions: `110023`, `120018`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Taco graph with downward-sloping D0 and labeled points A and B.

**Extended description:** The horizontal axis is Quantity of Tacos (in thousands), marked every 25 up to 350. The vertical axis is Price of Tacos, marked in dollars from $1 to $15. A straight blue line labeled D0 descends from the vertical axis at $14 to the horizontal axis at 350 thousand. Point A is at 100 thousand and $10; point B is farther right and lower, at 225 thousand and $5. Dashed horizontal and vertical guides connect both points to their axis values. No shift arrow or second curve is shown.

### DEMAND-02.png

Questions: `110024`, `120019`, `130023`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Taco graph with downward-sloping D0 and points A at 50 thousand, $12 and B at 200 thousand, $6.

**Extended description:** The horizontal axis is Quantity of Tacos (in thousands), marked every 25 up to 350. The vertical axis is Price of Tacos, marked in dollars from $1 to $15. A straight blue line labeled D0 descends from $14 on the vertical axis to 350 thousand on the horizontal axis. Point A is at 50 thousand and $12. Point B is to its right and below it at 200 thousand and $6. Dashed guides connect each point to both axes. Both points are on the same line; no second curve is shown.

### DEMAND-03.png

Questions: `110025`, `130021`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Taco graph with parallel downward-sloping D0 and D1 and a right-pointing arrow between them.

**Extended description:** The horizontal axis is Quantity of Tacos (in thousands), marked every 25 up to 350; the vertical axis is Price of Tacos, marked in dollars from $1 to $15. The dark-blue straight line D0 reaches the horizontal axis at 300 thousand. Point A on D0 is at 50 thousand and $8; point B is at 175 thousand and $4, with dashed guides to the axes. The light-blue line D1 is parallel, above and to the right of D0, meeting the vertical axis at $12 and still above the horizontal axis at 350 thousand. A horizontal arrow points right from D0 toward D1 near the $7 level.

### DEMAND-04.png

Questions: `120020`, `130022`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Peanut butter graph with parallel downward-sloping D0 and D1; A and B are on D0.

**Extended description:** The horizontal axis is Quantity of Peanut Butter (in thousands), marked every 25 up to 350. The vertical axis is Price of Peanut Butter, marked in dollars from $1 to $15. Dark-blue D0 is a straight line from $12 on the vertical axis to 300 thousand on the horizontal axis. A is at 50 thousand and $10; B is at 175 thousand and $5. Dashed guides connect A and B to their axis values. Light-blue D1 is parallel and above/right of D0, running from $15 on the vertical axis to $1 at 350 thousand. No shift arrow is drawn.

### DEMAND-05.png

Questions: `110022`, `120017`, `130020`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Hamburger graph with two parallel downward-sloping lines; D1 lies below and left of D0.

**Extended description:** The horizontal axis is Quantity of Hamburgers (in thousands), marked every 25 up to 350. The vertical axis is Price of Hamburgers, marked in dollars from $1 to $15. Dark-blue D0 runs straight from $14 on the vertical axis to 350 thousand on the horizontal axis. Light-blue D1 runs parallel below and to its left, from $10 on the vertical axis to 250 thousand on the horizontal axis. At the $5 gridline, D0 crosses at 225 thousand and D1 at 125 thousand. The two lines do not intersect. There are no labeled points or arrows.

### ELASTICITY-01.png

Questions: `110026`, `120021`, `130024`, `140060`, `150060`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Straight downward-sloping Demand line with labeled points C, B and A.

**Extended description:** The horizontal axis is Quantity, from 0 to 150 in steps of 15; the vertical axis is Price, from 0 to 18 in steps of 2. No commodity or further unit is named. The blue straight line labeled Demand runs from quantity 0, price 16 to quantity 120, price 0. In quantity-price order, C is (30, 12), B is (45, 10), and A is (75, 6). Dashed horizontal and vertical guides connect all three points to their axis values. C is highest and leftmost, B is between C and A, and A is lowest and rightmost.

### ELASTICITY-02.png

Questions: `110027`, `120022`, `130025`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Vertical Demand line at quantity 70 with A at price 6 and B at price 10.

**Extended description:** The horizontal axis is Quantity, displayed from 40 to 100 in steps of 10; the vertical axis is Price, from 0 to 18 in steps of 2. No commodity or further unit is named. A blue vertical line labeled Demand stands at quantity 70. A is on this line at price 6 and B is directly above it at price 10. Dashed horizontal guides run from those points to the price axis, and the vertical guide coincides with the demand line down to quantity 70.

### ELASTICITY-03.png

Questions: `110028`, `120023`, `130026`, `140061`, `150061`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Two intersecting downward-sloping lines, flatter blue D1 and steeper red D2, with four labeled points.

**Extended description:** The horizontal axis is Quantity, from 0 to 100; the vertical axis is Price, from 0 to 20. No commodity or further unit is named. Blue D1 slopes gently downward and red D2 slopes more steeply downward. Dashed horizontal guides mark prices 5 and 3. On D1, B is at quantity 35, price 5, and A is at quantity 75, price 3. On D2, D is at quantity 47, price 5, and C is at quantity 55, price 3. Dashed vertical guides identify quantities 35, 47, 55 and 75. D2 crosses D1 between quantities 47 and 55 and between prices 3 and 5; the crossing has no point label or exact coordinates.

### ELASTICITY-04.png

Questions: `120024`, `130027`, `140062`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Downward-curving Demand line with B at quantity 20, price 7 and A at quantity 70, price 2.

**Extended description:** The horizontal axis is Quantity, from 0 to 120 in steps of 10; the vertical axis is Price, from 0 to 10 in steps of 1. No commodity or further unit is named. A blue curve labeled Demand descends steeply on the left and becomes progressively flatter toward the right. B is at quantity 20 and price 7; A is to its right and below it at quantity 70 and price 2. Dashed guides connect both points to the axes. The curve enters from above the displayed price range and remains above the horizontal axis at quantity 120.

### ELASTICITY-05.png

Questions: `110029`, `120025`, `130028`, `150062`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Horizontal Demand line at price 10 with A at quantity 50 and B at quantity 100.

**Extended description:** The horizontal axis is Quantity with labeled ticks 50, 100 and 150. The vertical axis is Price with labeled ticks 5, 10, 15 and 20. No commodity or further unit is named. A blue horizontal line labeled Demand lies at price 10. Point A is at quantity 50 and point B at quantity 100, both on that same line. B is directly to the right of A at the same height. No other curve, arrow or shaded area is drawn.

### IC-01.png

Questions: `310001`, `310036`, `310002`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Three downward-curving indifference curves, IC1 lowest, IC2 in the middle and IC3 highest.

**Extended description:** Good X is on the horizontal axis and Good Y on the vertical axis; both run from 0 to 25 in steps of 5, with no further units named. Three purple curves slope downward and flatten as X increases, bending toward the origin. Dashed IC1 is lowest and closest to the origin; solid IC2 is above/right of IC1; dashed IC3 is above/right of IC2. The curves do not intersect. Their labels appear at their right ends. There are no marked bundles, budget lines or arrows.

### IC-02.png

Questions: `310033`, `310003`, `310038`, `310004`, `310043`, `310005`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Budget line and three indifference curves with A, B and a tangency at C.

**Extended description:** Good X is horizontal and Good Y vertical, each from 0 to 25 in steps of 5. A blue straight budget line joins (X 0, Y 20) and (X 20, Y 0). A is on the line at (5, 15), B at (15, 5), and C at (10, 10). Dashed guides mark each bundle on both axes. Solid purple IC2 slopes downward, flattens to the right, and touches the budget line at C. A and B lie below IC2. Dashed IC1 is below IC2 and crosses the budget line nearer its ends; dashed IC3 is above IC2 and does not meet the budget line. No additional units or utility values are printed.

### IC-03.png

Questions: `310034`, `310006`, `310039`, `310007`, `310044`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Budget line touching the middle indifference curve IC2 at A, with IC1 below and IC3 above.

**Extended description:** The horizontal Good X axis runs from 0 to 25 in steps of 5. The vertical Good Y axis runs from 0 to 50 in steps of 10. A blue straight budget line connects (X 0, Y 40) and (X 20, Y 0). Point A is at (10, 20), with dashed guides to the axes. The solid purple downward-curving IC2 touches the budget line at A. Dashed IC1 lies below/left of IC2 and crosses the budget line nearer its ends. Dashed IC3 lies above/right of IC2 and does not meet the budget line. No further units or utility values are printed.

### IC-04.png

Questions: `310035`, `310008`, `310009`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Budget line and downward-curving IC2 touching at point A, Good X 15 and Good Y 10.

**Extended description:** Good X is horizontal, from 0 to 25 in steps of 5; Good Y is vertical, from 0 to 50 in steps of 10. A blue straight budget line runs from (X 0, Y 40) to (X 20, Y 0). Purple IC2 slopes downward, becoming flatter toward the right, and touches the budget line at A. Dashed guides locate A at (X 15, Y 10). IC2 lies above the line on either side of this contact. No other indifference curve, labeled point, additional unit or utility value appears.

### IC-05.png

Questions: `310010`, `310011`, `310040`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Three parallel downward-sloping straight indifference curves labeled IC1, IC2 and IC3.

**Extended description:** Good X is horizontal and Good Y vertical, both from 0 to 25 in steps of 5, with no further units named. Three straight purple lines slope downward at the same angle and never intersect. Dashed IC1 is lowest and leftmost, solid IC2 is in the middle, and dashed IC3 is highest and rightmost. Each line meets both axes, with IC1's intercepts closest to the origin and IC3's farthest away. Their exact intercepts are not labeled. There are no marked bundles, budget line, arrows or numerical utility labels.

### IC-06.png

Questions: `310012`, `310013`, `310041`, `310053`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Three right-angle indifference curves with corners progressing upward and right from IC1 to IC3.

**Extended description:** Good X is horizontal and Good Y vertical, each from 0 to 25 in steps of 5, with no further units named. Each purple curve has a vertical arm extending up from a dotted corner and a horizontal arm extending right. Dashed IC1 has its corner just above/right of (5, 5); solid IC2 has its corner near (10, 10); dashed IC3 has its corner just below/left of (15, 15). Exact corner coordinates are not printed. The curves do not intersect. Their horizontal arms retain the same Y level as X increases. No budget line or other marked bundles appear.

### IC-07.png

Questions: `310014`, `310045`, `310015`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Three parallel upward-sloping lines labeled IC1, IC2 and IC3.

**Extended description:** Good X is horizontal and Good Y vertical, each from 0 to 25 in steps of 5, with no further units named. Three purple straight lines rise from left to right at the same angle. At a given X where all three are visible, dashed IC1 is highest, solid IC2 is in the middle, and dashed IC3 is lowest. IC1 meets the horizontal axis farthest left, IC2 farther right and IC3 at the 10 tick. The lines do not cross. There are no marked bundles, budget lines or utility values.

### INCOME-SUB-01.png

Questions: `310016`, `310037`, `310017`, `310018`, `310046`, `310019`, `310049`, `310032`, `310054`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Two budget lines sharing a Y intercept, curves U0 and U1, and points A, B and C.

**Extended description:** Good X is horizontal and Good Y vertical, each displayed from 0 to 50, with no further units named. Blue Budget0 joins (0, 40) to (10, 0); green Budget1 joins (0, 40) to (40, 0), sharing the vertical intercept and extending farther right. Purple U0 and dark-green U1 slope downward and flatten to the right; U1 lies above U0. In X-Y order, A is (5, 20), B is (10, 10), and C is (20, 20), with dashed guides to the axes. Budget0 touches U0 at A; Budget1 touches U1 at C. An unlabeled dashed orange line joins (0, 20) to (20, 0), runs parallel to Budget1 and touches U0 at B. No arrows or named effect labels are drawn.

### INCOME-SUB-02.png

Questions: `310020`, `310021`, `310048`, `310022`, `310051`, `310030`, `310056`, `310057`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Two budget lines sharing a Y intercept, curves U0 and U1, and points A, B and C; Budget1 is steeper.

**Extended description:** The title is Indifference Curves. Good X is horizontal and Good Y vertical, each displayed from 0 to 50, with no further units named. Blue Budget0 joins (0, 40) to (40, 0). Green Budget1 shares the vertical intercept at 40 but meets the horizontal axis at 10. Purple U0 lies above dark-green U1; both slope downward and flatten to the right. In X-Y order, A is (20, 20), B is (10, 40), and C is (5, 20), with dashed guides to the axes. Budget0 touches U0 at A and Budget1 touches U1 at C. An unlabeled dashed orange line, parallel to Budget1, touches U0 at B and reaches the horizontal axis at 20; its vertical intercept is outside the displayed range. No arrows or named effect labels appear.

### INCOME-SUB-03.png

Questions: `310023`, `310042`, `310024`, `310047`, `310025`, `310050`, `310031`, `310055`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Two budget lines sharing an X intercept, curves U0 and U1, and points A, B and C; Budget1 reaches higher on Y.

**Extended description:** Good X is horizontal and Good Y vertical, each from 0 to 50 in steps of 5, with no further units named. Blue Budget0 joins (0, 10) to (40, 0). Green Budget1 joins (0, 40) to (40, 0), sharing the horizontal intercept and reaching higher on the vertical axis. Purple U0 and dark-green U1 slope downward and flatten to the right; U1 lies above U0. In X-Y order, A is (20, 5), B is (10, 10), and C is (20, 20), with dashed guides to the axes. Budget0 touches U0 at A; Budget1 touches U1 at C. An unlabeled dashed orange line joins (0, 20) to (20, 0), runs parallel to Budget1 and touches U0 at B. No arrows or named effect labels appear.

### INCOME-SUB-04.png

Questions: `310026`, `310027`, `310052`, `310028`, `310029`, `310058`.

Status: corrected — extended description added; alt text standardized after image/question review.

**Alt text:** Two budget lines sharing a Y intercept, curves U0 and U1, and labeled bundles A, B and C.

**Extended description:** Good X is horizontal and Good Y vertical, each from 0 to 50 in steps of 5, with no further units named. Blue Budget0 joins (0, 40) to (20, 0); green Budget1 joins (0, 40) to (40, 0), sharing the vertical intercept and extending farther right. In X-Y order, A is (10, 20), B is (20, 10), and C is (15, 25), with dashed guides to the axes. Purple U0 slopes downward through A and B, while dark-green U1 lies above it and touches Budget1 at C. Budget0 touches U0 at A. An unlabeled dashed orange line joins (0, 30) to (30, 0), runs parallel to Budget1, passes through A and touches U0 at B. No arrows or named effect labels are drawn.
