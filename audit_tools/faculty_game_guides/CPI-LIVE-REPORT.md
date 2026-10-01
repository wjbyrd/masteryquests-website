# CPI Live Faculty Guide — completion report

Completed October 1, 2026. Final guide: **3 pages**, approximately **1,350 words**, excluding repeating headers/footers. CPI Live and other faculty guides were not modified. Nothing was committed, pushed, deployed, or changed in production configuration.

## Files

Added:

- `docs/faculty-guides/cpi-live.md` — editable guide source.
- `downloads/resources/cpi-live-faculty-guide.docx` — finished faculty download.
- `audit_tools/faculty_game_guides/CPI-LIVE-REPORT.md` — this report.

Changed:

- `audit_tools/faculty_game_guides/build-guide.py` — CPI Live selection, metadata, subtitle, final GDP Live template reference, and intact conceptual paragraphs. Existing guide outputs were not rebuilt.
- `audit_tools/faculty_game_guides/render-guide.ps1` — CPI Live selection and separate render output directory.
- `how-to/index.html` — direct Word download under **Game-specific faculty guides**, at `/how-to/#game-specific-guides`, immediately below GDP Live.
- `resources/index.html` — CPI Live entry in the game-specific guide downloads at `/resources/#game-specific-guides`.

Both pages use `/downloads/resources/cpi-live-faculty-guide.docx`. Local checks verified those links; these edits have not been deployed. Internal reference inventory, PDF/page renders, accessibility results, and temporary validation scripts remain in ignored `tmp/econ-rpg/cpi-live-guide/`.

## Final section headings

Title: CPI Live. Subtitle: A consumer-price measurement game built around a fixed basket, CPI, and inflation.

1. Why This Game Exists
2. What Students Do
3. What the Game Is Really Teaching
4. The Educational Loop
5. Using It in Class
6. Questions to Consider
7. Common Misconceptions

Four short classroom-use subsections, eight optional prompts, and six diagnostic misconceptions follow the GDP Live structure. No separate formula, weighting, or substitution chapter was added. A screenshot was unnecessary for explaining the calculation sequence.

## Instructional characterization

CPI Live is a measurement game. Students use assigned fixed quantities, reprice them, sum item expenditures, express the resulting basket cost relative to the base, and calculate the percentage change in the index. The guide distinguishes dollar cost, index level, index-point difference, and annual percentage change. The base equals 100 because the base cost is divided by itself. The later annual calculation changes the denominator to the preceding year's CPI.

Weighting connects quantity and base price to expenditure, then relates that expenditure to the effect of a percentage price change. The guide explains the prediction/reveal sequence without giving its playable answer. The analyst audit requires identifying a method error; the game then shows the repaired calculation. The guide does not claim that students manually edit or recompute an audit ledger.

**Substitution is absent from the current instructional flow.** No substituted household basket or substitution-bias stage exists, so those concepts were omitted. A hypothetical changed-quantity error in an analyst draft is an audit case, not a substitution activity. No unrelated inflation topics or complete numerical solution were added.

**The full educational loop is present:** pricing supplies experience; the changed basket cost supplies consequence; feedback supplies economic explanation; CPI and inflation calculations supply formalization; weighting, audit, and the separate multi-year example supply transfer. Results provide a short recap, rather than a claimed additional post-results lesson.

## Verified implementation and discrepancies

Inspected the current release source in `audit_tools/econ_rpg/game/games/cpi-live/`: configuration, engine, view, app, storage, telemetry, charts, game card, and relevant unit/browser checks. Also inspected the implementation report and publication mapping. `games-preview.json` and `publish-games-preview.mjs` identify this source as the runtime copied into the unlisted collection, with navigation rebasing. This verifies the local release source and its browser behavior; deployed bytes were not independently fetched. The guide contains no temporary release-status language.

- Ten checks run in order: base, repricing, CPI, inflation, index meaning, weighting, audit, Year 3 rate, annual-rate comparison, and Year 4 interpretation.
- The game supplies a basket; students do not choose its quantities. The five categories remain rent, groceries, gas, streaming, and haircuts. Five authored baskets use different quantities and base prices. The earlier $1,400 basket is one valid variant, not a universal total. The guide omits exact basket prices and totals.
- Verified each configured quantity and price, stored in cents, against the quantity-times-price calculation. Quantities remain fixed within a run. Year 1 is the base; students calculate groceries expenditure and the basket total while the other four expenditures are supplied. Year 2 changes prices, including a mixed-change variant, then asks for the total, CPI, and first annual inflation.
- CPI uses current cost divided by base cost times 100. Inflation uses the CPI difference divided by the preceding CPI times 100. The first preceding CPI is 100; the separate later example requires a different denominator. The guide preserves editable multiplication, division, and minus symbols.
- Weighting explicitly compares isolated price changes with all other prices held at base values. Students predict, then see dollar and CPI effects. All authored pairs distinguish percentage size from dollar contribution.
- Five audit variants represent changed quantities, equal averaging of percentage changes, reversed CPI ratio, index level confused with inflation, and the wrong annual comparison period. Correct identification reveals the repair automatically.
- A separate four-year timeline leaves the household basket unchanged. Students calculate Year 3 annual inflation, interpret its relation to the previous rate, and interpret Year 4. Five paths represent slowing inflation, faster inflation, stable prices, and falling prices. Where needed, feedback adds a disinflation example. Every final year falls from the previous year but remains above the base. The guide explains the distinction without reproducing the series.
- The final challenge is interpretation, not an additional basket calculation. CPI line, inflation bars, and equivalent table separate levels from rates; rates are progressively revealed through the relevant checks.
- Incorrect answers permit retries. CPI and inflation calculations have optional conceptual hints followed by a separate formula reveal. Results include the household measures, largest dollar contribution, first-attempt accuracy, audit attempts, multi-year performance, and a short CPI/inflation/disinflation/deflation recap.
- Replay changes the selected basket, price variant, weighting pair, audit, and timeline, excluding each immediately preceding selection. Saved state can resume in the same browser when local storage is available. No automatic faculty report is sent.
- The opening states that the activity is untimed. No numerical estimated duration was found or invented.
- The current runtime Games card describes repricing a fixed household basket, building CPI, calculating inflation, auditing bad calculations, and understanding why some price changes matter more. Runtime card data overrides the older static fallback description.

These findings resolve the brief's conditional assumptions: substitution is absent, the basket is assigned, $1,400 is only one variant, the audit is diagnosis followed by a displayed repair, and the final timeline is separate from the student's basket.

## Validation and design

- All **12 CPI unit/state tests passed**, including all five base baskets, 25 repricing combinations, 20 weighting pairs, all timeline variants, 125 audit combinations, and **2,500 complete pool combinations**, plus hint, save/restore, selection-history, chart, and telemetry checks.
- The repository browser suite first stopped on a mojibake expectation for the multiplication symbol: the game correctly showed `×`. A temporary copy corrected only malformed multiplication, division, and em-dash strings and rebased imports to the same release source. The repository test and game were not edited. The corrected copy passed **21 complete browser runs**, covering every authored variant, desktop/tablet/mobile viewports down to 320 pixels, actual 200% zoom, keyboard operation, retries, replay, saved-state return, and normal/reduced motion. It reported zero page, console, or network errors.
- Final DOCX rendered with Microsoft Word and rasterized with PDFium. **All three final pages visually inspected**: readable formulas and symbols; clean headings, lists, logo, headers, footer, page numbers, and page breaks; no clipping, overlap, blank pages, or nearly blank pages. No manual page breaks or font shrinking were needed. Classroom-use subsections flow naturally across pages 2–3.
- Structural DOCX accessibility audit: **0 high, 0 medium, 0 low findings**. Native headings/lists, document language, logo alternative text, and PAGE field preserved. This is not a claim of formal certification or manual screen-reader testing.
- Template verification passed for styles, header, theme, logo, page geometry, margins, and header/footer distances. Footer title reads CPI Live. Seven primary headings and editable formulas verified in DOCX; multiplication, division, minus, and arrow glyphs also verified in extracted rendered text.
- Existing guides remain byte-identical: GDP Live `db9a52b44ec0c48fba4624b9a1e39347603eb3c64753a65f968da36997d29030`; Signal House `c9df7957a75013b58d8de310e49598c5b01b51651f46979a56f9dc17223b61b0`; Economy's Edge `a23552f46ddf3de9b85b18ebada51aa37f3d573d332e9062470707ff653f4acc`.
- Both local resource links passed at 320, 390, and 1440 pixels: visible, keyboard-focusable, descriptive, with no horizontal page overflow. The download returned HTTP 200 and matched the generated DOCX bytes.
- Final source/scope check and `git diff --check` passed. CPI Live, unrelated guides, and production configuration were left intact.
