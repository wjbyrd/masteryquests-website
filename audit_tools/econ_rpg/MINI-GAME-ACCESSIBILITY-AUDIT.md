# Private mini-game library: accessibility and navigation audit

September 22, 2026. **Reviewed against WCAG 2.2 AA implementation criteria.** This is an implementation review and browser QA record, not formal certification or a claim of complete WCAG conformance. Reference: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

The user confirmed that this pass covers the **seven private mini-games only**. No public game, question bank, economic model, scoring system, telemetry implementation, asset bytes, or deployment configuration was changed. Nothing was deployed or pushed. The prior GDP compact-dashboard changes were preserved.

## Inventory and previous gaps

The private preview serves `audit_tools/econ_rpg/game/` as its document root. Inventory was checked against the five entries in `scenarios/registry.js` and both standalone game directories.

| Mini-game | Launch route | Previously on private `/games/`? | Previous return navigation |
| --- | --- | --- | --- |
| Room to Stay | `/?scenario=housing-crisis` | No | None |
| The Main Attraction | `/?scenario=main-attraction` | No | None |
| The Economy’s Edge | `/?scenario=ppf` | No | None |
| Megastar Mania | `/?scenario=megastar-mania` | No | None |
| Gameday Rivals | `/?scenario=gameday-rivals` | No | None |
| Takeout Taco: Lunch Rush | `/games/takeout-taco-lunch-rush/` | Yes | Brand link and final-screen RETURN TO GAMES |
| GDP LIVE | `/games/gdp-live/` | Yes | Brand link and final-screen RETURN TO GAMES |

Repository discovery also found the separate public Econ-nections puzzle/classroom variant, the Economic Realm, Managerial Intelligence Directorate, Macro Command System and Micro Domains collections, and faculty/classroom/telemetry variants. They are outside this confirmed private-library scope and were not modified or linked into the private mini-game menu. The public `games/index.html` is a different document from this preview’s `game/games/index.html`.

## Library and routing

All seven games now have cards with titles, concise descriptions, meaningful image alternatives, and PLAY GAME links whose accessible names include the game title. The page reuses the existing Room to Stay stylesheet and Mastery Quests navy/teal/gold tokens. The grid has three desktop columns, two tablet columns, and one column below 621px. Images use a consistent 4:3 box with `object-fit: contain`; Taco’s wider artwork is letterboxed rather than distorted or cropped.

Every game has a visible header navigation landmark containing **RETURN TO GAMES**, available throughout play. The two existing final-screen return links remain. All return controls use `href="/games/"`; there are no hostnames, localhost addresses or preview ports in runtime links. Standalone launch links are relative to `/games/`; RPG links use the existing root query route. This works on any origin serving this private bundle at its document root. It does not publish or merge private routes into the public website.

The preview server needed no changes. Its noindex response and the pages’ noindex metadata remain. The existing production build excludes the entire `audit_tools/` tree, verified again by the publication tests.

### Existing artwork selected

Paths below are relative to `audit_tools/econ_rpg/game/art/scenes/`. No images were generated, edited, duplicated or renamed.

| Game | Card asset |
| --- | --- |
| Takeout Taco: Lunch Rush | `takeout-taco-lunch-rush/takout-taco-worker-3.webp` — three-worker truck scene |
| GDP LIVE | Clearly labeled HTML/CSS placeholder; no suitable existing artwork |
| Room to Stay | `baseline.webp` — Linden neighborhood |
| The Main Attraction | `main-attraction/baseline.webp` — park and rides |
| The Economy’s Edge | `the-economys-edge/balanced.webp` — four production/resource views |
| Megastar Mania | `megastar-mania/baseline.webp` — concert venue |
| Gameday Rivals | `gameday-rivals/round-01-home-opener.webp` — restaurants and stadium |

**GDP LIVE still needs landing-page artwork.** Its placeholder has a descriptive accessible label and a visible “Card artwork coming later” notice. The other six cards use supplied project artwork.

## Findings and fixes

| Finding | Implementation |
| --- | --- |
| Five games absent from the menu; five lacked return navigation | Complete seven-card library and a consistent header link on all seven games; existing end links retained |
| Dark control borders blended into their surfaces | Shared accessibility CSS raises enabled secondary-control and input borders to `#91a9c5`; keeps existing primary buttons and brand colors |
| Disabled choices were faded enough to be hard to read | Explicit muted text/dark surfaces replace low-opacity styling; disabled semantics and behavior remain |
| Taco’s chosen answer depended heavily on border treatment | Adds visible “Selected” text to the existing `aria-pressed` selection state |
| Taco active-screen headings skipped from H1 to H3 | Production Log and Manage your next window are now H2, with their previous visual sizing preserved |
| Taco graph numbers were available in SVG descriptions, but difficult to navigate as data | Adds optional native Graph values disclosures with semantic tables, row/column headers, and Observed/Revealed labels. Values come from the same `graphPoints` result as the drawing, so unobserved values are not revealed early. SVG names and descriptions are associated separately |
| GDP component deltas were outside their definition-list values | Moves each delta inside its corresponding `dd`, retaining the compact abbreviations, screen-reader names, numbers and visual highlights |
| GDP numeric feedback was announced but not associated directly with the field | Adds `aria-invalid` on an incorrect response and associates the visible feedback through `aria-describedby`; preserves the existing correction/focus and live-announcement behavior |

Native buttons, links, inputs and disclosures remain throughout. No drag-only interactions were found. Existing scene alternatives, signed/textual result changes, graph marker shapes, reduced-motion handling, save/replay mechanisms and phase focus management were retained. Restart dialogs remain native dialogs: background controls are inert, Escape/cancel close them, and focus returns to the initiating control.

## Per-game review status

**PASS** means the inspected implementation and tested paths passed the listed checks. **FIXED** means this pass corrected or strengthened an identified issue and verified it. **NEEDS REVIEW** identifies a remaining follow-up, not a certification decision.

| Game / page | Keyboard | Focus | Semantics | Images | Contrast |
| --- | --- | --- | --- | --- | --- |
| Games library | PASS | PASS | PASS | FIXED | PASS |
| Room to Stay | PASS | PASS | PASS | PASS | FIXED |
| The Main Attraction | PASS | PASS | PASS | PASS | FIXED |
| The Economy’s Edge | PASS | PASS | PASS | PASS | FIXED |
| Megastar Mania | PASS | PASS | PASS | PASS | FIXED |
| Gameday Rivals | PASS | PASS | PASS | PASS | FIXED |
| Takeout Taco: Lunch Rush | PASS | PASS | FIXED | PASS | FIXED |
| GDP LIVE | PASS | PASS | FIXED | NEEDS REVIEW¹ | FIXED |

| Game / page | Color independence | Dynamic feedback | Reduced motion | Mobile / 200% zoom | Graphs / tables |
| --- | --- | --- | --- | --- | --- |
| Games library | PASS | PASS² | PASS | PASS | PASS² |
| Room to Stay | PASS | PASS | PASS | PASS | PASS³ |
| The Main Attraction | PASS | PASS | PASS | PASS | PASS³ |
| The Economy’s Edge | PASS | PASS | PASS | PASS | PASS³ |
| Megastar Mania | PASS | PASS | PASS | PASS | PASS³ |
| Gameday Rivals | PASS | PASS | PASS | PASS | PASS |
| Takeout Taco: Lunch Rush | FIXED | PASS | PASS | PASS | FIXED |
| GDP LIVE | PASS | FIXED | PASS | PASS | PASS |

¹ GDP has no scene artwork; the accessible card placeholder is intentional. Custom card art remains an instructor/content follow-up.

² Static page; no dynamic feedback, instructional graph or data table is required.

³ RPG conditions and outcomes have textual/numeric equivalents; the shared table renderer already supplies native tables and column headers. Megastar’s market meter includes textual state/value information. PPF scenes are complemented by scenario text and indicators rather than requiring interpretation of artwork alone.

### Contrast evidence

The old secondary border `#3a5277` against `#163b63` measured **1.44:1**. The replacement `#91a9c5` against the lighter hover surface `#204b73` measures **3.75:1**. Existing navy text on teal primary buttons measures **9.11:1**; gold focus against that hover surface measures **5.94:1**. Disabled text now measures **8.43:1** against its explicit surface. Decorative panel borders were not treated as interactive boundaries or globally restyled.

The browser audit sampled rendered text and control boundaries in **97 page/state/viewport checks**, including gradient endpoints. The lowest sampled text ratio was **5.46:1** and the lowest sampled resting control-boundary/fill ratio was **4.76:1**. Graph axes and teal plotted lines exceed 7:1 against the representative panel surface. These checks are source/computed-style measurements, not exhaustive pixel analysis of every possible state or image.

## Validation performed

- New `mini-game-library.browser.test.mjs`: exact card inventory, titles/descriptions/media, all seven launch and return routes, image decoding/contain treatment, semantic elements, labels, focus outlines, native controls, target sizes, live feedback, dialogs, graph data and contrast checks.
- **14 complete keyboard-only runs:** every game at normal size and genuine Chrome **200% browser zoom**, using Tab, Enter and Space rather than pointer clicks or programmatic control focus. Included question/decision flows, Taco’s graphs and two-truck challenge, GDP’s audit and wrong/correct numeric responses, results, replay and return navigation.
- Zoom was set through Chrome’s own settings in an isolated QA profile. The 1366×768 viewport reported **683×384 CSS pixels and devicePixelRatio 2**. This was browser zoom, not a CSS transform or screenshot enlargement.
- Reflow inspected at **1366, 900, 390 and 320px** on the library, decisions and completed views, with additional game-specific reveal/graph/audit states. No horizontal page overflow, clipped controls or missing text was found. Touch controls were at least 44px tall in the checked views. Normal, phone and zoom screenshots were inspected visually.
- Existing GDP browser suite: five complete runs covering all audit types, import offsets, exact balances/events, reduced/normal motion, storage failure and replay. Existing Taco browser suite: six viewport sizes, variable debrief depths, graph/reveal and allocation paths, reset, telemetry and blocked storage. Both passed with no browser errors.
- **72 existing unit/regression/publication tests passed**, including all earlier RPG path fingerprints, unchanged asset hashes, 1,000 GDP seeded runs, Taco production/allocation checks, and exclusion of private files from the local production build.
- Final library audit recorded **zero console/page/resource errors and zero external network requests**. Runtime route scan found no hard-coded preview hosts or ports. No new runtime or testing dependencies were installed.

Reproduce the new audit with the repository’s existing Playwright installation (`PLAYWRIGHT_MODULE` may point to its installed package):

```powershell
node audit_tools/econ_rpg/mini-game-library.browser.test.mjs
node audit_tools/econ_rpg/gdp-live.browser.test.mjs
node audit_tools/econ_rpg/takeout-taco.browser.test.mjs
```

Generated screenshots/results are in ignored `tmp/econ-rpg/library-accessibility/`, `tmp/econ-rpg/gdp-live/` and `tmp/econ-rpg/takeout-taco/`. Tests use isolated browser storage; the user’s in-app saved games are not cleared.

## Files changed

All paths below are relative to `audit_tools/econ_rpg/`.

**Created:** `game/mini-game-accessibility.css`, `game/games/library.css`, `mini-game-library.browser.test.mjs`, and this report.

**Modified:**

- `game/games/index.html` — complete private card library.
- `game/index.html` — navigation/shared accessibility stylesheet for all five RPG-style games.
- `game/games/takeout-taco-lunch-rush/index.html` and `game/games/gdp-live/index.html` — consistent header navigation/shared accessibility stylesheet.
- `game/games/takeout-taco-lunch-rush/app.js` — heading levels only.
- `game/games/takeout-taco-lunch-rush/graphs.js` — accessible descriptions and equivalent data tables.
- `game/games/takeout-taco-lunch-rush/two-truck-view.js` — root-relative final return link.
- `game/games/gdp-live/view.js` — definition-list structure, numeric feedback association and final return link.
- `gdp-live.browser.test.mjs`, `takeout-taco.browser.test.mjs` — route/label selectors and GDP value selector adjusted to the semantic markup.
- `README.md` — library and audit links.

The existing uncommitted `gdp-live.css` compact-dashboard cleanup predates this pass and was left intact. No engine, scenario bank, payoff, classification, result calculation, or telemetry module was edited.

## Remaining manual review

- **NEEDS REVIEW:** NVDA/JAWS/VoiceOver sessions for announcement timing, graph descriptions/tables, and dialog behavior. Browser accessibility attributes and keyboard behavior were checked; these assistive technologies were not run.
- **NEEDS REVIEW:** Safari/Firefox, real touch devices, forced-colors/high-contrast mode, and user-custom text-spacing settings. Chrome desktop/mobile viewport/reduced-motion/200% zoom coverage does not substitute for these checks.
- **NEEDS REVIEW:** instructor approval of card descriptions and selected existing artwork, and eventual GDP card artwork.

No known blocking keyboard, navigation, accounting or responsive defect remains in the tested paths.
