# The Economy’s Edge faculty guide

## Final editorial and layout pass — October 1, 2026

This entry records the latest version; the dated records below describe earlier versions.

### Result

- **Five pages**, down from six in the preceding Word render. Approximately **1,918 words**, down from 2,160: a reduction of 242 words, or **11.2%**. Counts use the same whitespace-based extraction of DOCX body paragraphs and table cells, including headings and captions but excluding repeated headers/footers and image alt text.
- Gameplay now reads **5–10 minutes**, with additional time explicitly separate for optional discussion, questions, or applications. This is the user-directed estimate. The game source still displays 10–15 minutes; the game was left unchanged as instructed.
- **Questions to Consider** replaces **Debrief Questions**, and all four occurrences of “debrief” are removed from the guide source and DOCX. The eight prompts are explicitly optional. Question 8 now asks what evidence students would request about another economy’s reported output increase, distinguishing an evidence-gathering transfer task from Question 3’s classification of their own path. Questions 1–7 remain unchanged in this pass.
- **The Educational Loop** decreased from approximately 202 to 94 words (Markdown section count including the former subheadings). It is now one connected paragraph explaining the actual game features, followed by the retained Experience → Consequence → Economic Explanation → Formalization → Transfer sequence. It covers the six-choice path, economic interpretation, built-in schematic PPF, three applications, targeted feedback, retries, and Application complete without repeating the conceptual section.
- **Common Misconceptions** replaces **What to Watch For** and contains five brief diagnostic entries. Removed the two optional entries about investment always being better and improvements being costless with idle resources. The conceptual center and classroom prompts retain the relevant opportunity-cost reasoning.
- Moved the coordination-failure versus destroyed-assets comparison beside the graph procedure as a brief optional extension. The graph steps refer to the existing four-change table, identify efficient/inefficient/unattainable positions, and distinguish recovery from capacity expansion.
- Retained all four classroom-use categories with shorter suggestions. Replay is explicitly optional and follows recording, deliberate change, prediction, completion, comparison, and explanation. The requested sentence beginning “The students’ earlier choices affect later options” appears verbatim.

### Pagination and design

Removed all four remaining manual page breaks. The builder now keeps the figure introduction with its image and keeps the short Questions to Consider group together through local Keep With Next settings. Headings retain their existing Keep With Next and Keep Lines Together settings; ordinary prose is free to flow. These targeted groups avoid the stranded figure introduction and split question list seen in intermediate renders without forcing fixed page starts.

The final pages contain: (1) introduction and student experience, (2) conceptual explanation and table, (3) imagery and educational loop, (4) graph procedure and classroom use, and (5) questions, misconceptions, and replay. All five final page images were inspected. No blank or nearly blank interior pages, clipping, overflow, stranded headings, broken lists, or awkward paragraph continuations remain. Table rows and the illustration are intact.

Fonts, margins, spacing conventions, table styling, title treatment, numbering, and image proportions were preserved. A byte comparison confirms unchanged DOCX styles, header, footer, logo, and hidden-PPF image. No font size was reduced.

### Validation and scope

Rechecked the current scenario and follow-up implementation and ran the existing 12 PPF/follow-up tests successfully. Coverage includes all 361 six-decision PPF paths, five ending categories, four indicators, six scene variants, recovery/expansion consistency, and outcome-specific formalization/applications. The four-region illustration remains consistent with its existing image and scene mapping. No substantive economics or game mechanics changed. The requested gameplay estimate is the only intentional factual update to the guide.

The final DOCX contains zero occurrences of “debrief,” uses both requested replacement headings, and includes the exact requested subject-continuity sentence. The accessibility audit reports zero high, medium, or low findings. `git diff --check` passed. Game files and unrelated guide files are unchanged; the resources page retains its pre-pass hash.

Files changed in this pass:

- `docs/faculty-guides/the-economys-edge.md` — final editorial source.
- `downloads/resources/the-economys-edge-faculty-guide.docx` — rebuilt five-page guide.
- `audit_tools/faculty_game_guides/build-guide.py` — targeted figure and question-group pagination.
- `audit_tools/faculty_game_guides/REPORT.md` — this completion record.

No commit, push, deployment, or production-configuration change was performed. Baseline copies and QA renders remain only in ignored `tmp/econ-rpg/economys-edge-guide/`.

## Editorial cleanup — October 1, 2026

The existing guide received a prose edit and pagination review. All nine primary sections and their subheadings remain, along with the table, hidden-PPF illustration, six graph steps, eight debrief questions, and seven quoted misconceptions. The creation record below describes the preceding task; this pass changed only the guide source, its generated DOCX, and this report.

### Word count and editorial changes

Visible body content, headings, captions, and table cells decreased from approximately **2,411 to 2,160 words: 251 words, or 10.4%**. Counts use the same whitespace-based extraction from both DOCX files and exclude repeated headers/footers and image alt text.

- **What the Game Is Really Teaching** remains the main conceptual explanation. The four-change table anchors reallocation, slack, recovery, and expansion; the following paragraphs explain the preparation indicator and the model’s simplifications.
- **Reading the imagery as a hidden PPF** concentrates on the four regions and asks faculty to connect their changes to the table, avoiding another full explanation of the model.
- **The Educational Loop** now describes the instructional progression. **Bringing in the PPF Graph** supplies the classroom procedure and the built-in diagram’s A/B/C mapping.
- **Using It in Class** focuses on timing, assignment, and evidence of student work. **Replay and Comparison** follows recording, deliberate change, prediction, comparison, and explanation, without repeating the PPF lesson.
- **What to Watch For** retains its direct quoted-misconception format. Corrections are shorter, with the economic qualifications intact.

Representative changes in sentence construction:

| Before | Revised treatment |
| --- | --- |
| “The aim is to explain an economic mechanism, not to identify a winning sequence.” | “Use this guide to help students explain how their choices in Calder produced the outcome they saw.” |
| “The game supports that conversation; it does not replace it.” | The paragraph now develops the teaching moment: “Once they have an outcome in front of them, ask what happened to their economy and work from their account.” |
| “Students must connect earlier decisions to later opportunities, rather than treat each screen as an unrelated question.” | “Earlier choices affect later options, so students have to follow the economic story across the run.” |
| “The purpose is to test an explanation, not to hunt for the ending that sounds most successful.” | The replay section asks for a predicted consequence and sacrifice before the second run, followed by comparison and explanation. |

All eight debrief questions remain. Question 4 now asks students to distinguish Calder’s coordination disruption from the hypothetical destruction of factories, replacing a recovery-versus-growth question that overlapped with Questions 3 and 8. Question 7 emphasizes evaluating the present household sacrifice against delayed benefits. Other changes clarify wording while retaining the questions’ reasoning tasks.

### Pagination and design

The final Word render is **six pages**. The unchanged source DOCX also renders as six pages in the installed Word environment; the reported page-eight issue and short page-two spillover could not be reproduced from this file. The revision therefore makes no claim to have reduced an eight- or nine-page version.

Removed the unnecessary manual break before the main teaching section. An initial fully flowing draft separated the imagery heading from its figure and left a short final page. Four useful breaks remain to keep the imagery, loop/graph, classroom/debrief, and misconceptions/replay groups coherent. Headings retain Keep With Next; ordinary body paragraphs have no forced Keep With Next or Keep Lines Together. Font sizes, margins, and spacing were not reduced.

Rendered and inspected all six final pages. No clipping, stranded heading, broken table, split list item, nearly blank page, or awkward paragraph continuation remains. The image retains its original size and proportions. DOCX comparison confirms unchanged styles, header, footer, logo, and teaching-image bytes. All original heading text is preserved.

### Factual and technical validation

Rechecked the current scenario, scene-selection code, and instructional follow-up. The guide continues to describe Calder, six decisions, five ending categories, four indicators, six scene variants, the educational sequence, the built-in schematic PPF, and three application questions accurately. Preserved the distinctions between feasible inefficient points and currently unattainable points; recovery and capacity expansion; present capital formation and completed improvements; efficient mixes and preferences; preparation and realized growth; and coordination failure and destroyed assets. Similar endings can still reflect different histories and opportunity costs.

No game mechanics, substantive economics, game files, or unrelated faculty guides were changed. The 12 existing PPF/follow-up tests passed, including checks across all 361 six-decision PPF paths and all five endings. The DOCX accessibility audit reported zero high, medium, or low findings. `git diff --check` passed. The existing builder and resources page have the same hashes as at the start of this editorial pass.

Files changed in this pass:

- `docs/faculty-guides/the-economys-edge.md`
- `downloads/resources/the-economys-edge-faculty-guide.docx`
- `audit_tools/faculty_game_guides/REPORT.md`

No commit, push, or deployment was performed. Original copies and rendered QA files are retained only in ignored `tmp/econ-rpg/economys-edge-guide/` for comparison.

## Original creation record

## Deliverables and scope

Created only the first game-specific faculty guide. No other game guides, gameplay changes, question-bank changes, global styles, navigation changes, commits, pushes, deployments, or production configuration changes were made.

Added:

- `docs/faculty-guides/the-economys-edge.md` — editable, faculty-facing content source, with page-break comments for reproducible layout.
- `downloads/resources/the-economys-edge-faculty-guide.docx` — six-page downloadable and editable Word guide.
- `audit_tools/faculty_game_guides/build-guide.py` — builds the DOCX from Markdown and the existing Faculty Game Overview document’s page geometry, styles, and branding.
- `audit_tools/faculty_game_guides/render-guide.ps1` — read-only Word export for visual QA when LibreOffice is unavailable.
- `audit_tools/faculty_game_guides/REPORT.md` — this completion report and source verification record.

Changed:

- `resources/index.html` — adds a browse jump link and a separate `#game-specific-guides` section between the existing faculty guides and authoring resources. It contains only The Economy’s Edge Faculty Guide and a descriptively named DOCX download. The existing four general faculty guides remain intact.

The new link is `/downloads/resources/the-economys-edge-faculty-guide.docx`, under `/resources/#game-specific-guides`. This is a local repository change, not a live-site update. On this site, `/resources/` is titled Downloads; the navigation label Faculty Resources points to `/how-to/`. Both pages were inspected; navigation was not changed.

## Final guide headings

Title: **The Economy’s Edge**. Subtitle: **A branching PPF experience built around scarcity, tradeoffs, production, and growth.**

1. Why This Game Exists
2. What Students Do
3. What the Game Is Really Teaching
4. The Educational Loop
5. Bringing in the PPF Graph
6. Using It in Class
7. Debrief Questions
8. What to Watch For
9. Replay and Comparison

The teaching section includes **Four changes to keep separate** and **Reading the imagery as a hidden PPF**. The loop uses the three requested questions. Classroom options cover before, during, and after instruction plus independent/student review. There are eight debrief questions. The guide includes no optimal route, full decision tree, numeric PPF, or ending-unlock instructions.

## Current-game verification

Inspected the live source implementation, not just the older implementation report:

| Source under `audit_tools/econ_rpg/` | Evidence used |
| --- | --- |
| `game/scenarios/ppf.js` | Calder role; six decisions; two or three available choices; allocation, disruption, recovery, investment and conditional final branches; four 0–8 indicators; five endings; four economics explanations. |
| `game/engine.js`, `game/ui.js`, `game/preview.js`, `game/index.html` | Scenario routing, decisions and consequences, saved path presentation, outcome/debrief, alternative decisions and mounted follow-up. |
| `game/scenarios/ppf-scenes.js`, `game/scenes.js`, `game/rpg.css` | Six state/history-selected scenes, descriptive alternative text and captions, full-frame 4:3 image presentation, text/numeric state indicators. |
| All six runtime images in `game/art/scenes/the-economys-edge/` | Visually inspected balanced, consumption, capital, slowdown, recovery and growth. Confirmed the four recurring regions and differences between inactive resources, recovery and completed growth. |
| `game/instructional-followup.js`, `game/instructional-followup-view.js` | Outcome-specific graph introduction; schematic A/B/C mapping; three transfer tasks; corrective feedback, retry and Application complete; practice state is not saved. |
| `game/games/index.html` | Preview card: “Allocate scarce resources between household goods and capital. Respond to disruption and distinguish recovery from growth in productive capacity.” |
| `PPF-REPORT.md`, `PPF-QA-PATHS.md`, `ppf-qa.mjs`, tests | Existing economic-consistency and path documentation, cross-checked against current implementation. QA routes were not copied into the faculty guide. |

The existing Faculty Game Overview DOCX was inspected structurally and rendered across all three pages as a design reference. The new guide retains US Letter, approximately 0.62-inch top/bottom and 0.72-inch side margins, Aptos typography, 27-point title, 18-point primary headings, 13-point subheads, compact header/footer, and the existing logo. It uses genuine Title/Heading/List styles, a marked table header, and page numbers. The single teaching illustration is embedded from the existing balanced PNG, unchanged, with meaningful alt text and a caption. Its purpose is to explain the visual PPF mapping.

## Does the game close the instructional loop?

**Yes, all three pieces are present.**

- **What happened?** The ending summary, overall indicator changes and all six actual choices show the student’s result and path. Each choice includes an economic mechanism and expandable consequence/tradeoff details.
- **Why did it happen economically?** Four debrief explanations cover scarcity/opportunity cost, frontier allocation, idle resources/recovery and investment/outward shifts. Counterfactual alternatives accompany the path.
- **Can you use the idea somewhere else?** Read the frontier ties the player’s actual disruption choice and final allocation to a schematic PPF. Three application questions address a neighboring economy’s recovery, usable productivity improvements and forgone consumption. Incorrect choices receive targeted feedback and retries; correct choices receive explanations.

No genuinely absent component was found. A practical limitation is that application attempts/completion are not saved or automatically reported to an instructor. The guide recommends an optional reflection or screenshot and accurately separates this from the saved economic path.

## Discrepancies and qualifications

- The public root `/games/` page currently has no Economy’s Edge listing. The title and description occur in the unlisted standalone hub. The guide does not invent a public game URL or expose the unlisted preview address; it tells faculty to use their supplied course link. Public release status was left unchanged.
- The opening game text explicitly identifies all four image regions, and consequences name economic tradeoffs. The PPF can be formalized after play, but the mapping is not completely undisclosed. The guide explains that distinction.
- The upper-right region shows preparation even before capacity expands. Completed improvements—not simply visible construction or a high Future growth indicator—activate the growth scene. The guide preserves that distinction.
- Older PPF documentation predates the current built-in graph and transfer follow-up. The guide describes the current code. It does not claim the whole game remains graph-free.
- The disruption leaves resources intact but underused; it is not a destructive disaster. A disaster that destroys assets is identified only as a possible instructional extension.
- Game readiness thresholds and indicator steps are authored simplifications, not numerical output data or empirical growth forecasts. The guide avoids presenting them as such.

## Validation

- `node --test audit_tools/econ_rpg/ppf.test.mjs audit_tools/econ_rpg/instructional-followup.test.mjs`: all 12 tests passed, including all 361 six-decision PPF paths, six scenes, five endings, PPF economic consistency and outcome-specific follow-up. These were read-only verification runs; no game fixes were made.
- DOCX was rendered in installed Microsoft Word and rasterized with the bundled PDFium package. All six final page images were visually inspected after correcting list-numbering behavior. No overflow, clipping, split heading/body pairs, missing glyphs or broken tables remained.
- The packaged `render_docx.py` was attempted first; it could not run because LibreOffice is absent. Word export supplied the actual layout rendering. The helper opens only this task’s document read-only and closes its own Word instance.
- Packaged DOCX accessibility audit: 0 high, 0 medium and 0 low findings. Confirmed genuine heading styles, native list numbering, an explicit repeating table-header row, instructional image alt text, meaningful hyperlink text and English document language. This is not a claim of screen-reader certification.
- In-app browser checks at 1440, 390 and 320 CSS pixels: the new section and button fit without horizontal overflow. Narrow layouts stack the download below the text using existing site CSS.
- Keyboard checks: Tab reaches the new section jump link with visible focus; Enter navigates to its target; Tab reaches the DOCX link with its descriptive accessible name; Enter initiates the download. A 3px focus outline remains visible. Temporary viewport overrides were reset.
- Local download returned HTTP 200 and byte-for-byte matched the generated DOCX. The new jump target is unique. All nine primary section headings match the editable source; the existing four general-guide entries remain. No unlisted URL appears in the guide or its external relationships.
- `git diff --check` passed. Scope checks confirm no changes to the game runtime, existing downloads, public Games page, global styles, navigation or production configuration.

QA intermediates are local and ignored under `tmp/econ-rpg/economys-edge-guide/`; they are not downloadable deliverables. The pre-existing untracked question-bank history documents in `docs/` were left alone.

## Rebuilding

Run `build-guide.py` using the workspace dependency loader’s Python executable with `python-docx`. Run `render-guide.ps1` in a Windows session with Word, then rasterize its PDF for page review. The reference `downloads/resources/faculty-game-overview-guide.docx` must remain available; the builder does not modify it. Future game-specific guides should reuse the instructional sequence and section roles only after their own current-game inspection.
