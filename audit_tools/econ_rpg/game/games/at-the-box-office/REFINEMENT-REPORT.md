# At the Box Office — season revision, 2026-10-02

This revision is implemented and verified locally. It has **not** been deployed. The older deployment notes below describe the preceding version only.

## 1. Files changed

Within `audit_tools/econ_rpg/game/games/at-the-box-office/`:

- Modified `game.js`: integrates generated seasons into the existing seven-week render/choice flow; saves and restores progress; adds after-outcome interpretation and the structured season review.
- Modified `styles.css`: MQ palette, shared navigation styling, result hierarchy, responsive economic graphs and review cards.
- Modified `index.html`: MQ header/navigation, theme color, script loading and goal terminology.
- Added `seasons.js`: authored variant pools, seeded market generation, validation, shuffle bags, save serialization and restoration.
- Added `graphs.js`: accessible economic SVGs and visible numerical equivalents.
- Added `season.test.cjs`: generated-market, graph, replay and save tests.
- Updated `browser.test.cjs` and `publication.test.cjs` for generated values, new graphs, replay, storage, layouts and runtime files.
- Updated this report.

The existing `scenarios.js`, accounting/summarization functions, legacy model tests, package configuration and all three WebP assets remain unchanged. The new generator clones and extends the existing authored weeks. No other game's source, faculty guide or resource page was changed in this pass. The ignored local preview was refreshed with the existing publisher.

## 2. MQ colors

Deep navy #04101F, panels #071827/#0B2238/#12304F, separators/hover #1D4D73, interactive cyan #38BDF8, economic labels/results #F7D982, text #EEF6FF and secondary #C7ECFF. Natural theater artwork is untouched.

## 3. Return to Games

Inspected the library plus CPI Live and Labor Force Files. Copied their shared Return control treatment: system font stack, uppercase text, #163b63 background, #91a9c5 border, #204b73 hover, 9px/14px padding, 10px radius, 44px minimum height, visible gold focus outline and right-hand header navigation. Cyan supplies the current MQ hover accent. Mobile retains 44px targets. The original absolute October-hub destination is unchanged, including the ending link.

## 4. Goal terminology

The decision screen's `Your aim` is now `Your goal`; the help dialog's `stated aim` is now `stated goal`. No player-facing Your Aim variant remains. Historical report language and legacy test descriptions are not player-facing.

## 5. Results hierarchy

Larger price, attendance and ticket-revenue values occupy three framed desktop cells and compact stacked mobile rows. Every result provides its reference value, new value and direction of change. Explanations and economic classifications use the adjacent space. Concession receipts remain separately labeled from ticket and combined revenue.

## 6. Terminology during play

Weeks 1–3 name inelastic, elastic and unit-elastic demand only after the decision. Feedback explains the price/revenue consequence. Holding a price cannot identify elasticity: held-price choices explicitly cite a separate completed booking-team or lobby test, and the final graph labels it accordingly.

Week 4 explains positive cross-price elasticity/substitutes and isolates the external related-price shock from the later player response. Week 5 explains negative cross-price elasticity/complements at a fixed ticket price. Week 6 names normal, income-sensitive, necessity-like and inferior responses using pre-promotion observations. Week 7 explicitly reuses the learned first-week inelastic response and the season's income opportunity. Its combined policy result is not falsely presented as an isolated elasticity estimate.

## 7. Economic graphs

Eight responsive SVGs replace the old bar charts: three own-price graphs with vertical ticket price, horizontal attendance and two total-revenue rectangles; two related-price/attendance graphs; and three income-index/attendance graphs. A/B markers use different shapes and colors. Readable rounded tick scales, visible observation lists, SVG titles/descriptions and optional midpoint calculations require no tooltip or pointer interaction. Lines join observations and are not forecasts beyond tested prices.

## 8. Ending review

Each episode shows the actual player decision/outcome, the isolated observations, classification, revenue/demand effect and business interpretation. The closing synthesis distinguishes movement along demand from demand shifts caused by related prices and income. The seven-week ledger and market-reading total remain available.

## 9. Replay and save

Seven independent authored pools contain 22 variants in total (six pools of three and one income pool of four). They vary release/audience context, streaming/rival-cinema/concert promotions, concession offerings, income growth/bonus/rebate/slowdown, and the finale. Each pool exhausts its bag before repeating and avoids an immediate repeat across bag boundaries. Every replay also uses a fresh numeric seed. The ending's PLAY ANOTHER SEASON offers a non-spoiling teaser.

The local save stores seed, variant IDs, generated baselines, outcomes, revenue, elasticities/classifications, choice indices and screen/progression. Reload reconstructs and verifies the saved observations against the same seeded generator before displaying them. Corrupt saves recover to a new-season start; denied browser storage keeps the game playable with a visible notice. No server-side saving or personal information is involved.

## 10. RNG model and bounds

The generator uses a reproducible 32-bit LCG, with a cryptographic browser seed at season start. For a chosen coefficient E and midpoint change d in the causal variable, attendance is derived as Q2 = Q1 × (2 + E×d) / (2 − E×d), then rounded and checked. Own-price E is negative; the displayed price-elasticity magnitude is positive.

- Own-price starting prices are $10/$12/$14 and tests are ±$2. Baseline attendance is roughly 950–1,200; exact unit-elastic baselines use common multiples. Inelastic draws use magnitude 0.40–0.80; elastic draws 1.30–2.00. Rounded acceptance bands are 0.30–0.85 and 1.20–2.20. Unit-elastic pairs keep price × quantity exactly constant, inside the 0.95–1.05 band.
- Own-price candidates retry up to 200 times if rounding breaks the coefficient, price/quantity bounds or required revenue direction.
- Substitute prices start at $12/$14/$16 and fall $4, with positive midpoint coefficients 0.55–0.80. Theater ticket price is fixed at $12 for the isolated shock.
- Complement bundle prices start at $8/$10 and change ±$2, with negative coefficients of magnitude 0.35–0.70. Theater ticket price remains $12.
- Income shocks are +6%, +8%, +10% or −8%. Premium coefficients are 1.50–2.20, standard 0.35–0.70 and matinee −1.00 to −0.60 before rounding. Actual rounded signs and magnitudes must still support each displayed label. Promotion effects are separate.
- All total-market attendance is an integer between 600 and 1,800; all actual ticket prices are integer dollars between $7 and $18 (generated prices are $8–$18). Smaller income segment counts are positive integers within the total. No independent random revenue is used: revenue always comes from the actual prices and quantities.
- The full generated season must pass finite-value, accounting, bounds and classification checks. A failed season is deterministically regenerated with a new draw stream, up to 50 attempts. Invalid observations are never rendered. Post-rounding validation, rather than the initial coefficient alone, determines acceptability.

## 11. Automated validation

Final logic/publication run: **10 tests passed**. This includes 5,000 seeds × seven weeks = 35,000 generated weeks and 105,000 possible decisions, checking all eight classifications, all authored variants, revenue directions, scoring objectives, integer/bounded attendance, accounting, graph coordinates and finite values. Sixty successive bag draws verify exhaustion and no immediate repetition. Every saved screen restores identical state; tampered/corrupt saves are rejected. The preserved legacy tests still cover all 2,187 authored paths.

Final Chrome browser run: **21 complete seasons, 147 decisions, 21 replays and 168 graph checks passed**, with no page errors or failed responses. Tests cover help-dialog focus, keyboard/mouse/touch score controls, focus after decisions, decision/result/ending reloads, storage-denied play, changed replay numbers and variants, 200% zoom, hub navigation, unchanged destination and exact runtime delivery. Publication tests verify nine runtime files, source-only exclusions and the unchanged 13-card hub.

Commands (from repository root, using the available Node runtime):

```text
node --test audit_tools/econ_rpg/game/games/at-the-box-office/model.test.cjs audit_tools/econ_rpg/game/games/at-the-box-office/season.test.cjs audit_tools/econ_rpg/game/games/at-the-box-office/publication.test.cjs
node audit_tools/econ_rpg/game/games/at-the-box-office/browser.test.cjs
```

## 12. Layout results

Browser checks and captured screens cover 390×844 portrait, 844×390 phone landscape, 768×1024 tablet, 1024×768, 1440×960, 1920×1080, plus 320×740. No horizontal page overflow was detected on any decision, result or ending. Phone results, price/cross/income graphs, landscape decisions, tablet income results, desktop results and the full desktop review were visually inspected. The review uses a full-width responsive card grid instead of a narrow side panel.

QA evidence and final JSON: `tmp/econ-rpg/at-the-box-office/refinement-qa/`.

## 13. Remaining human playtesting

Confirm instructional pacing and replay interest with actual students, particularly whether the explicitly separate price test on a held-price choice is clear. Physical iOS/Safari, Android and assistive-technology checks remain human/device validation; the automated browser run used Chrome with touch emulation. Local checks do not constitute a live deployment or a full accessibility certification.

---

# Historical refinement report (preceding version)

# At the Box Office — refinement

## Changed files

- `index.html`: accessible, compact How to Play dialog with the six requested explanations.
- `game.js`: removes start-screen filler, redundant subtitles, gameplay footers, and qualitative score labels; adds standardized week headers, the interactive score explanation, explicit live bundle pricing, actual-run charts, and shorter personalized closing sections.
- `styles.css`: styles the help dialog, score popover, condensed headers, bundle information, and responsive charts within the existing Art Deco layout.
- `scenarios.js`: Week 3 now has 1,240 admissions at $10; receipts are calculated as $12,400, $12,000, and $12,000. The revised aim emphasizes fit for an established film late in its run. Feedback differentiates the elastic $10 response from the unit-elastic $12/$15 comparison.
- `model.test.cjs`, `browser.test.cjs`, and `publication.test.cjs`: updated arithmetic, asset, chart, navigation, reset, and interaction checks.
- `package.json`: marks this self-contained game's source as CommonJS so its existing data module can also be tested directly inside the repository's surrounding ES-module project. This file does not ship.

## Imagery

The newly supplied `scenes/manager-office.webp` and `scenes/concessions-lobby.webp` are used directly from the canonical game directory. Neither has been edited. The office no longer contains fixed outcome graphics, and the lobby no longer contains conflicting menu prices. The exterior and hub artwork remain unchanged. There are no remaining image-asset conflicts identified in this pass.

## Behavior and accessibility

The score control appears after the weekly choice and shows that week's actual points. Mouse hover, keyboard focus, Enter/Space, and tap/click expose the explanation. Escape and an outside click dismiss it; hovering over the explanation itself keeps it open. The help dialog supports keyboard activation, focus containment, Escape/Close, and focus restoration.

Both final graphs use the seven stored player outcomes. Admissions count visits; the receipts graph consistently uses **ticket revenue only**, excluding concessions. All values and week labels have accessible text equivalents. The charts use zero-based bars, exact displayed values, and separate scales. Restart clears the run, its scores, and its chart data.

## Validation

The model tests verify every choice, revenue calculation, response sign, and all 2,187 possible paths. Browser checks complete nine runs at 1440px, 390px, and 320px (63 choice outcomes), verify the two charts against the actual chosen outcomes and bar widths, exercise help and score controls with mouse/keyboard/touch, and check reset, overflow, images, and hub navigation. Desktop/mobile screenshots and 200% zoom were inspected. Publication checks confirm only the seven intended runtime files ship; the complete site build reports no forbidden files.

QA output: `tmp/econ-rpg/at-the-box-office/refinement-qa/`.

Published to the existing October hub as Cloudflare Worker version f49868e2-b08f-4645-810d-dfc0df3c7828. The deployment uploaded only the four revised runtime text files and two supplied replacement WebPs.

Live verification passed: 63 choice outcomes, nine restarts, both actual-run charts, help and score interactions, and six byte-for-byte runtime/asset comparisons. No page errors or failed responses were captured. The new office and lobby WebPs served by the website match the supplied source files exactly.
