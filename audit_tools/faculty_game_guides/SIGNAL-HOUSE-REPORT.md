# Signal House Faculty Guide — completion report

## Editorial restructuring — October 1, 2026

The revised guide is **5 pages**, down from the **6 pages** in the existing local guide. The supplied brief referred to seven pages; the actual source document used for this pass rendered as six. Body text, including headings, captions, and table cells but excluding repeating headers/footers, decreased from approximately **2,312 to 1,758 words**: **554 words, or 24%**.

Files changed in this editorial pass:

- `docs/faculty-guides/signal-house.md`
- `downloads/resources/signal-house-faculty-guide.docx`
- `audit_tools/faculty_game_guides/build-guide.py` — Signal House-specific paragraph pagination adjustments; no font-size changes.
- `audit_tools/faculty_game_guides/render-guide.ps1` — explicitly completes Word pagination before PDF export, resolving a transient numbering error in the rendered list.
- `audit_tools/faculty_game_guides/SIGNAL-HOUSE-REPORT.md` — this revision record.

The opening and **Why This Game Exists** are unchanged. **How the Evidence Works** was merged into **What Students Do**, including local versus national evidence, dependencies, revisiting retained records in the satchel, and correcting unsuccessful arrangements. Increasingly explicit hints remain integrated there, along with untimed play and the absence of a score or mastery penalty.

The technical accessibility and save-support inventory was removed **from the guide only**. **The Broken Signal** standalone section was removed; its distinctive storm/cost context, production and staffing response, and policy tradeoff were consolidated into the conceptual section. **The Second Harvest** remains, including all specified economic values and the need for wider adoption. The comparison table, short educational loop, practical AD–AS procedure, four classroom-use categories, eight questions, and six misconceptions remain. The final guide has ten primary sections in the requested order.

Game mechanics and substantive economics were preserved. Rechecked current `content.js`, `engine.js`, `game.js`, `recovery-state.js`, and `recovery-view.js` for the retained claims: hints, correction, satchel review, Mission 2 unlock, instructional closes, costs, national measures, adoption, unchanged AD, and policy tradeoffs. This was a documentation-only pass; no gameplay files or unrelated guides were edited, and the previously passing gameplay suites were not rerun unnecessarily.

Layout corrections kept the entire student-experience discussion on page 1, retained the environment image and its caption together, and kept each labeled conceptual paragraph intact across page boundaries. No manual page breaks or font reductions were introduced. All five final pages were visually inspected, with no blank interior pages, clipping, orphan headings, or split table rows. Word's final exported procedure runs from 1 through 6; the questions run from 1 through 8.

The structural Word accessibility audit again returned **0 high, 0 medium, 0 low findings**. The opening is text-identical to the previous version. Styles, header, footer, theme, and both embedded images are byte-identical to that version. The Economy’s Edge reference checksum is unchanged. Existing download paths and links remain valid without website edits. Nothing was committed, pushed, deployed, or changed in production configuration.

## Original creation report (historical)

Completed October 1, 2026. Final Word render: **6 pages**. No game code, production configuration, or unrelated guide was changed. Nothing was committed, pushed, or deployed.

## Files

Added for this task:

- `docs/faculty-guides/signal-house.md` — editable guide source.
- `downloads/resources/signal-house-faculty-guide.docx` — finished faculty download.
- `audit_tools/faculty_game_guides/SIGNAL-HOUSE-REPORT.md` — this report.

Updated existing working files:

- `audit_tools/faculty_game_guides/build-guide.py` — accepts `--game signal-house`, derives this guide from the final Economy’s Edge document, and converts the existing WebP environment image in memory for Word. The default Economy’s Edge build remains available.
- `audit_tools/faculty_game_guides/render-guide.ps1` — accepts `-Game signal-house` for a separate Word-rendered QA output.
- `how-to/index.html` — added the download under **Game-specific faculty guides**, directly after **Practical guides for faculty**, at `/how-to/#game-specific-guides`.
- `resources/index.html` — added Signal House to the existing working **Game-specific faculty guides** list at `/resources/#game-specific-guides`.

The Economy’s Edge download, source, resources entry, and guide tooling already existed in the working tree, even where Git still classifies them as untracked. They are not new Signal House deliverables. QA scripts, rendered pages, and accessibility output are in ignored `tmp/econ-rpg/signal-house-guide/` and are not faculty downloads.

## Final section headings

Title: Signal House. Subtitle: A two-case economic escape room built around evidence, causal reasoning, and aggregate supply.

1. Why This Game Exists
2. What Students Do
3. How the Evidence Works
4. What the Game Is Really Teaching
5. The Broken Signal
6. The Second Harvest
7. Comparing the Two Cases
8. The Educational Loop
9. Bringing in the AD–AS Model
10. Using It in Class
11. Questions to Consider
12. Common Misconceptions

The guide includes one unannotated environment image, one two-case comparison table, six practical AD–AS discussion steps, eight optional questions, and six diagnostic misconceptions.

## Economics and evidence

Mission 1 is characterized as a negative short-run aggregate supply shock. Input disruption and expensive replacement routes raise costs, leading to reduced production and staffing; broader reporting and national indicators support the aggregate interpretation. The final model holds AD initially unchanged. Demand-side policy demonstrates competing price and employment/output objectives without repairing the disrupted input network.

Mission 2 is a separate resource-saving improvement, with the same harvest, quality, land, and other inputs. Pump-hours fall from six to three, and the cost of the same batch falls from $21 to $15. The guide distinguishes the local trial from subsequent adoption across producer groups. National real output rises from 200 to 216 and the price index falls from 100 to 96, alongside separate evidence of unchanged demand. It neither invents an employment effect nor treats a lower comparison price level as perpetual deflation.

Evidence categories, dependencies, correction, retention, and hints explain the learning design. The guide omits object locations, hotspot instructions, codes, dial settings, ticket dates, and ordered puzzle-solving steps. The economic chains are explanations for faculty, not interaction instructions. The environment image contains no added labels or solution markings.

## Educational loop and implementation findings

**The game provides all three parts of the educational loop through Mission 1:** what happened, why it happened economically, and application to another supply-side case. Its close contains the evidence recap, economic explanation, a labeled AD–AS diagram, and an editable transfer forecast with feedback. A successful forecast opens the investigation-results screen.

Important distinctions verified in the implementation:

- Mission 2 unlocks when the first exit is solved, independently of the transfer forecast. Therefore completion of both investigations does not prove that the student completed the forecast. The independent-review paragraph makes this explicit.
- Mission 2 closes with its economic explanation and comparison of both cases. It has no separate AD–AS diagram or new transfer exercise; the guide does not claim otherwise.
- The current game does not send a faculty completion report. Faculty may request a reflection or screenshot through their own course workflow. Recorded elapsed time includes breaks between visits; hint use is not a mastery grade.
- No numeric play-time estimate is presented in the inspected current game. The guide describes the cases as untimed and does not reuse an older documentation estimate.
- Some supporting flow documentation retains older national-register descriptions. The current engine requires the national observations for a new unsolved investigation; the register is not an alternate source of the national answers. Implementation and regression tests took precedence over stale narrative descriptions.

Release configuration identifies `audit_tools/econ_rpg/game/games/the-shock-house/` as the authoritative runtime source copied by the Signal House publisher. It still marks the public release as false and specifies an unlisted route; the public Games page contains staging markers. The inspected card describes two opposing supply-side mysteries. This task verified the local release source, publisher/configuration, and card, not the bytes of a fresh live deployment. No publication-status language or private URL appears in the faculty document.

## Sources inspected

- Runtime: `content.js`, `engine.js`, `game.js`, `recovery-state.js`, `recovery-view.js`, `discovery.js`, and `objects.js` under the authoritative game directory.
- Supporting game documentation: `GAME_FLOW.md`, `MISSION_2.md`, and `README.md`.
- Release source mapping, publisher, card, public Games page, and collection hub.
- Final Economy’s Edge Markdown, DOCX, rendered pages, and document-building conventions.

These inspections covered both missions, puzzle gates, current results and instructional closes, AD–AS and transfer screens, evidence/satchel behavior, hints, correction, saves/recovery, accessibility, and every economic figure used in the guide.

## Validation

- Logic suites passed: `engine.mjs` (54 assertions), `branching.mjs`, `cost-rails.mjs`, and `recovery.mjs`.
- Browser suites passed: `panorama.cjs`, `recovery.cjs`, and `interaction.cjs`. Coverage includes wrong-answer correction, partial/completed reloads, older and malformed saves, storage denial, Mission 2 unlock and preservation of Mission 1, adoption/demand gates, dragging, pointer tuning, keyboard operation, optional outlines, touch swipe, reduced motion, and responsive game layouts.
- Exported the final DOCX using installed Microsoft Word and rasterized its PDF with PDFium. LibreOffice is unavailable on this host; Word supplied the native document render. Visually inspected all six final page images: no clipping, overlap, missing glyphs, orphan headings, blank interior pages, split table rows, or broken page numbering.
- DOCX accessibility audit: **0 high, 0 medium, 0 low findings**. Checked semantic headings, genuine numbered/bulleted lists, image alternative text, repeated table header, English language, and page-number field. This is a structural audit, not a claim of certification or screen-reader testing.
- Template comparison: styles, header, theme, and logo are byte-identical to the final Economy’s Edge reference; page size and margins match. Footer uses Signal House with the same PAGE field treatment. Only the logo and new environment image are embedded.
- Economy’s Edge DOCX remained unchanged: SHA-256 `a23552f46ddf3de9b85b18ebada51aa37f3d573d332e9062470707ff653f4acc`.
- Local Faculty Resources and Resources download links passed at 320, 390, and 1440 pixel widths: visible, keyboard-focusable, no horizontal overflow, and descriptive accessible labels. The DOCX URL returned HTTP 200 with bytes matching the final file.
- Reviewed source for prohibited transitional/marketing language and walkthrough details. Final guide remains evergreen and faculty-facing.
- `git diff --check` passed. No Signal House gameplay files are in the changed-file set.
