# GDP Live Faculty Guide — completion report

Completed October 1, 2026. Final guide: **3 pages**, approximately **1,310 words** including headings and lists, excluding repeating headers/footers. GDP Live, other faculty guides, and production configuration were not modified. Nothing was committed, pushed, or deployed.

## Files

Added:

- `docs/faculty-guides/gdp-live.md` — editable teaching-guide source.
- `downloads/resources/gdp-live-faculty-guide.docx` — finished faculty download.
- `audit_tools/faculty_game_guides/GDP-LIVE-REPORT.md` — this report.

Changed:

- `audit_tools/faculty_game_guides/build-guide.py` — adds `--game gdp-live`, the Signal House template reference, GDP-specific metadata/subtitle, and intact conceptual paragraphs. Existing guide branches remain available; their DOCX files were not rebuilt.
- `audit_tools/faculty_game_guides/render-guide.ps1` — adds `-Game gdp-live` and its separate QA directory.
- `how-to/index.html` — direct GDP Live Word download under **Game-specific faculty guides**, at `/how-to/#game-specific-guides`, below the Signal House paragraph.
- `resources/index.html` — GDP Live entry in the game-specific guides download list at `/resources/#game-specific-guides`.

The same download path is used on both pages: `/downloads/resources/gdp-live-faculty-guide.docx`. Existing entries remain intact. Rendered PDFs/PNGs, reference inventory, and validation helpers are internal QA in ignored `tmp/econ-rpg/gdp-live-guide/`.

## Final section headings

Title: GDP Live. Subtitle: A GDP accounting game built around classification, component ledgers, and the expenditure identity.

1. Why This Game Exists
2. What Students Do
3. What the Game Is Really Teaching
4. The Educational Loop
5. Using It in Class
6. Questions to Consider
7. Common Misconceptions

The guide has four short classroom-use subsections, eight optional questions, and six diagnostic misconceptions. No additional ledger, imports, or formula section was added. A screenshot was unnecessary for explaining the posting model and would add a small interface image without improving the concise guide.

## Instructional characterization

GDP Live is an active classification and ledger exercise. Students select an accounting treatment, observe accepted entries and component changes, use explanatory feedback to correct errors, consolidate the completed accounts through the expenditure identity, and apply it to an audit and simultaneous changes. The rationale is presented as a teaching problem, without inventing a personal design-history quotation.

Imports receive a specific explanation using the game's own consumer-purchase example: C rises by $5 billion and M rises by $5 billion, producing zero net GDP change. The text explains that M is a positive balance subtracted in the identity to remove foreign production already included in spending. Separate domestic services are excluded in that scenario. The guide also identifies the analogous paired treatment for business and government imports, without listing all playable amounts or transactions.

Nominal GDP, real GDP, the deflator, inflation adjustment, base-year prices, and growth rates are absent from both the inspected GDP Live instructional flow and the guide. The guide stays within expenditure classification and accounting. No full audit solution, full transaction deck, final set of changes, or final numeric answer is given.

## Verified flow and findings

Inspected `config.js`, `scenarios.js`, `engine.js`, `view.js`, `app.js`, `telemetry.js`, the HTML shell, game card, implementation report, tests, and publication source mapping.

- Runs select 4 basic transactions, 4 accounting traps, and all 3 import transactions from an 18-scenario bank. There is no fixed complete transaction order. The guide describes 11 transactions with varying examples/order.
- Categories are Consumption, Investment, Government Purchases, Exports, Imports, and Not Counted. Multiple accounts can be selected; Not Counted is exclusive.
- Students select accounts; the game supplies posting amounts. Only accepted ordinary postings change balances and enter the ledger. Feedback explains both correct classifications and unsuccessful attempts.
- Exclusions represented in the bank are transfers, existing-share transactions without fees, used principal without current services, and intermediate inputs already embodied in separately accounted final goods. The used-car-service variant counts only newly supplied services.
- GDP is derived from C + I + G + X − M; NX is derived from X − M. Paired imports increase M and the expenditure account, leaving GDP unchanged while component totals move.
- The identity appears after all 11 transactions, **before** the audit. The guide follows this exact sequence.
- The audit adds a new three-entry draft batch already reflected in the displayed accounts. One row is wrong. Students identify it and repair its classification; the game reverses the wrong posting and applies the correction once. Corrected rows then enter the accepted ledger.
- The audit headline says “THE COUNTER IS OFF.” A housing-category error can leave GDP unchanged, and the supporting screen copy explicitly acknowledges this. The guide therefore describes a component error that can require correction even with an unchanged headline total. No game change was made.
- The final component changes and result still match the numerical structure in the user's brief. Verified the signs and arithmetic in configuration and tests; omitted the numbers and solution from the faculty guide.
- Results retain the counter, component board, accepted ledger, first-attempt accuracy, extra posting attempts, audit attempts, and final-challenge result. Feedback and retries are built into the activity. Reload/replay begins a new run; no automatic faculty report is sent.
- The opening explicitly says “No timer.” No numerical play-time estimate is stated; none was invented.

**The full educational loop is present.** Transaction classification supplies the experience, posted accounts and counter supply consequences, transaction feedback supplies explanation, the identity reveal supplies formalization, and the audit plus combined-change calculation supply transfer. A separate long post-results lesson is not claimed.

The Games card describes posting activity to a live counter, auditing bad entries, and building the expenditure approach. `games-preview.json` and `publish-games-preview.mjs` identify `audit_tools/econ_rpg/game/games/gdp-live/` as the runtime source copied into the unlisted collection, with navigation rebasing. This task verified that local release source and its browser behavior, not the bytes of a newly fetched live deployment. No temporary release-status wording appears in the faculty guide.

## Validation and design

- All **8 GDP unit tests passed**, including exhaustive account selection for all 18 scenarios and **1,000 seeded full runs** covering every scenario and audit variant. Verified balance/ledger reconciliation, import offsets, correction, final arithmetic, and replay reset.
- **Five complete Chrome browser runs passed**, at 1920×1080, 1366×768, 900×900, 390×844, and 320×740. All five audit variants, transaction retries, paired imports, counter/ledger reconciliation, final challenge, and replay were exercised. The suite reported no console/page/resource errors and no external requests.
- Final DOCX rendered in Microsoft Word and rasterized with PDFium; all **three final pages visually inspected**. No font shrinking or manual page breaks. Conceptual paragraphs and headings remain intact. The four classroom-use subsections flow naturally across pages 2–3, avoiding a nearly empty fourth page. Questions are numbered 1–8, and all six misconceptions fit together.
- Structural DOCX accessibility audit: **0 high, 0 medium, 0 low findings**. Native headings/lists, English-language styles, branded logo alternative text, and PAGE field preserved. No claim of formal accessibility certification or manual screen-reader testing.
- Template checks passed: styles, header, theme, logo, page size, margins, and header/footer distances match the final Signal House reference. Footer carries GDP Live with the same numbering treatment. The unused reference environment image was removed; only the logo remains embedded.
- Both reference guide checksums remain unchanged: Signal House `c9df7957a75013b58d8de310e49598c5b01b51651f46979a56f9dc17223b61b0`; Economy’s Edge `a23552f46ddf3de9b85b18ebada51aa37f3d573d332e9062470707ff653f4acc`.
- Both local download links passed at 320, 390, and 1440 pixels: visible, keyboard-focusable, descriptive labels, and no horizontal page overflow. Download returned HTTP 200 and matched the generated DOCX bytes.
- Source checks confirmed seven requested primary sections and no excluded nominal/real topics, temporary status language, or final challenge solution. `git diff --check` passed.
