# Macro Individual Theme Restoration Report

## Result and scope

All four Macro games now use independent historical theme profiles while retaining the approved Managerial-aligned controls and gameplay. National Engine is green charcoal, bronze, and aged gold; Mint, Ash & Gold has its own emerald, ash, and pale-gold lighting; Command Nexus uses steel blue, navy, and gold; Exchange Citadel uses its final historical purple-and-gold treatment with original cyan room-grid accents.

- Worktree: `C:\Users\Jennings\Documents\GitHub\masteryquests-macro`.
- Branch: `macro-managerial-alignment`.
- Starting/functional baseline: `9e17bdbbffb2939e082032749476c69b1af02ebd`.
- Historical visual reference, individually inspected for all four games: `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`.
- Requested local commit: `Restore individual Macro Command game themes`.
- Scope is presentation CSS plus reinstatement of each original body theme class. Every generated script block and all other markup/content are unchanged from the functional baseline. No gameplay definition, bank, artwork, Composer/Managerial implementation, hosting, route, subscription, or secret changes are included. Work remained in the Macro worktree; no Labyrinth worktree access, main modification, push, merge, or deployment was performed.

The two preceding Macro reports were inspected as historical context. Their collection-wide palette conclusion is superseded by this report.

## Root cause and correction

The previous `visual-identity.mjs` applied a single color-token map to every generated stylesheet, regardless of game. For example, `#38bdf8` became `#d6b15c`, `#0ea5e9` became `#b98242`, and `#8bdcff` became `#f4d58d`; matching RGB/RGBA colors were also rewritten. The same approach converted navy backgrounds and teal accents to brown/olive values. Additional universal component overrides supplied gold/bronze buttons, progress, introductions, Daily UI, and report paint. This erased intentional differences between games. It was also not an exact recreation of National Engine's own historical cascade.

The generated body had only `blank-builder-template`, so original game-scoped selectors could not apply. This was especially significant for Exchange Citadel: its late `.exchange-citadel ...` rules override the earlier cool base with purple-and-gold panels and buttons. Looking only at the early base CSS would produce another incorrect restoration.

The replacement emits one explicit game's theme from `themes.json`, including the ordered historical paint rules and applicable media conditions. It does not perform text-based color substitutions. Only paint declarations are accepted; keyframe geometry and opacity are frozen from the approved alignment while historical animation paint is restored. Existing animation timing and reduced-motion behavior remain in place. Each profile is independent, including values genuinely shared by National Engine and Mint; no game inherits another game's profile.

| Category | Treatment |
| --- | --- |
| A: common functional styling | Preserved dimensions, spacing, responsive breakpoints, visibility, control organization, compact clickable Exam grid, selected/locked/disabled geometry, focus width/offset, keyboard behavior, and motion preferences. |
| B: individual presentation | Restored colors, gradients, border colors, glows, shadows, heading accents, buttons, guide/question panels, room-grid paint, progress, feedback, modal, and report paint from each game's own source. |
| C: erroneous collection-wide palette | Removed the universal token map and replaced universal warm overrides with explicit game variables. Launcher paint now uses its current game; its dimensions remain common. |

Narrow `!important` declarations handle existing inline or legacy-important paint on the Game Menu launcher, selected answers, guardian stage colors, hallway text, and completion controls. They do not change universal layout, visibility, disabled opacity, or gameplay. Ordinary warning text is not affected by the boss-message override, which is scoped to `#gameBox.boss-mode #bossMessage`.

## Authoritative files

| File | Purpose |
| --- | --- |
| `audit_tools/macro_command_engine/themes.json` | New independent historical paint inventories, component variables, and approved animation recipes for all four games. |
| `audit_tools/macro_command_engine/visual-identity.mjs` | Validated per-game CSS emission; replaces the universal substitution routine. |
| `audit_tools/macro_command_engine/visual-identity.css` | Theme-variable paint for shared modern components and narrowly scoped inline-paint overrides. |
| `audit_tools/macro_command_engine/alignment.mjs` | Passes the game identity to theme generation and restores its original body theme class. Existing alignment JavaScript is unchanged. |
| `audit_tools/macro_command_engine/alignment.css` | Separates launcher geometry from paint; focus and introduction backing use theme variables. |
| `audit_tools/macro_command_engine/sync.mjs` | Supplies the game identifier to the presentation adapter. |
| `play/macro-command-system/{national-engine,mint-ash-gold,command-nexus,exchange-citadel}/index.html` | Four regenerated outputs. |
| `MACRO_INDIVIDUAL_THEME_RESTORATION_REPORT.md` | This report. |

The full exact selector/property/value inventory is maintained in `themes.json` under each game's `historicalPaint`, including ordered late overrides and media conditions. Source paths are the corresponding four `index.html` files at the historical commit. CSSOM-normalized `rgb()` values are numerically identical to their original hexadecimal values.

## Historical identities and exact key values

| Game | Historical text / heading | Historical question-panel atmosphere | Historical button / hover | Historical progress gradient, restored exactly |
| --- | --- | --- | --- | --- |
| National Engine | `#f3ead2` / `#f4d58d` | `rgba(42,74,64,.34)` -> `rgba(18,24,24,.92)` -> `rgba(4,5,5,.98)` | `#5b3a1f` -> `#1b1711`; hover `#7a4a25` -> `#2a1b12` | `#2f4f43` -> `#d6b15c` -> `#8a3a24` |
| Mint, Ash & Gold | `#f3ead2` / `#f4d58d` | `rgba(52,211,153,.10)` -> `rgba(245,214,130,.12)` -> `rgba(24,18,12,.92)` -> `rgba(3,5,12,.99)` | Independently verified original bronze button/hover values match National Engine | `#2f4f43` -> `#d6b15c` -> `#8a3a24` |
| Command Nexus | `#e6ecf5` / `#f0c86a` | `rgba(80,140,220,.18)` -> `rgba(25,70,120,.42)` -> `rgba(8,16,32,.94)` -> `rgba(2,4,10,.99)` | `#12345a` -> `#07111f`; hover `#1b4f86` -> `#0b1f38` | `#123a66` -> `#4f9fe8` -> `#f0c86a` |
| Exchange Citadel | `#f5f3ff` / `#fff7d6` | `rgba(196,181,253,.18)` -> `rgba(109,40,217,.16)` -> `rgba(20,10,38,.94)` -> `rgba(5,3,18,.98)` | `rgba(76,29,149,.96)` -> `rgba(18,8,32,.98)`; hover `rgba(109,40,217,.98)` -> `rgba(46,16,101,.98)` | `#4c1d95` -> `#c4b5fd` -> `#f0c86a` |

Primary selectors: `body`, `.title`, `#gameBox`, `#gameShell`, `#wizardBox`, `#question`, `button`, `button:hover`, `#progressFill`, `.maze-box`, `.maze-box.active`, `.maze-box.visited`, `.boss10/.boss20/.boss30 .boss-icon`, `.game-modal-card`, and `.mastery-*`. Exchange Citadel's final scoped selectors include `.exchange-citadel .title, .exchange-citadel .top-title, .exchange-citadel .boss-title, .exchange-citadel #artifactVault h3`; `.exchange-citadel #gameBox, ... #gameShell, ... #wizardBox, ... #artifactVault, ... .mode-select-panel, ... .game-modal-card`; and `.exchange-citadel button` with related control selectors. Its guide-name gold is `#f0c86a` and panel border is `rgba(240,200,106,.44)`.

National Engine's guide gradient is `rgba(42,55,49,.94)` -> `rgba(8,10,10,.98)`, with green charcoal shell `rgba(18,24,24,.96)` -> `rgba(4,5,5,.98)`. Command Nexus's guide gradient is `rgba(18,54,92,.92)` -> `rgba(4,10,20,.98)`, with shell `rgba(6,14,28,.96)` -> `rgba(2,5,12,.98)`. Mint's emerald accent `52,211,153` and pale gold `245,214,130` remain independent from National Engine's `214,177,92` / `138,58,36` lighting. The appendix records exact restored component paints and computed historical selector values.

### Surfaces added by the alignment

The historical UI did not contain today's unified Game Menu, Daily Tasks, or guide/guardian introductions. National Engine also lacked Exam Drill at that reference. Those components use each game's own historical panel/button/progress recipes plus explicit per-game variables; no claim is made that a historically nonexistent screen was recovered pixel for pixel. National Engine's historical `.national-mode-*` paint is explicitly mapped to modern mode selectors.

The restored modern selectors include `#gameMenuOptions`, `#returnMenuBtn`, `.daily-*`, `.guide-intro-*`, `.boss-reveal-*`, `.mastery-evidence-*`, `.exam-nav-room`, and the timing-mode HUDs. Original correct/error treatments, labels, saved-answer neutrality, locked/disabled opacity, and Exam privacy are preserved. Completion and hallway markup retain their original JavaScript and content; scoped CSS handles their inline paint. Fullscreen and utility controls draw from the same game-specific button variables as the menu.

Historical inline guardian stage colors are retained as glow accents: National/Mint `#a78bfa`, `#7c3aed`, `#991b1b`; Nexus `#f0c86a`, `#6eb4ff`, `#991b1b`; Citadel `#38bdf8`, `#f8d981`, `#fff8e7`. Dark purple and crimson text use accessible variants `#c4b5fd` and `#fca5a5` respectively. Stage selection reads existing active room-grid state through CSS; no gameplay state or script is changed.

## Rendered visual evidence

Open [the local comparison gallery](tmp/macro-managerial-alignment/individual-evidence.html). It offers game, viewport width, and screen selectors, with historical / incorrect baseline / restored columns and full-resolution image links.

- [Four games at 1440px, Exam room 1](tmp/macro-managerial-alignment/individual-four-games-1440.png).
- [Four games at 820px](tmp/macro-managerial-alignment/individual-four-games-820.png).
- [Four games at 390px](tmp/macro-managerial-alignment/individual-four-games-390.png).
- [Four games at 320px](tmp/macro-managerial-alignment/individual-four-games-320.png).

Captures use Edge/Chromium, widths **1440, 820, 390, and 320**, and height 1000. There are **104 historical, 208 incorrect-baseline, and 256 restored screenshots**. The matched modern set covers mode selection, guide introduction, Standard, Game Menu, Daily, remediation, recovery, Exam, answered Exam grid, guardian introduction, checkpoint, checkpoint summary, and Mastery Report. Supplementary restored captures cover correct-answer Continue, Wrong Turn, and victory at every width. Mode and Standard screenshots were reframed after toast dismissal so the controls/question panel can be reviewed clearly.

Historical captures show the original mode selection, Standard, guardian encounter, feedback, and report; the other three games also have historical Exam and modal-component captures. The gallery explicitly labels unavailable historical screens. The historical `menu` image is an original modal component with capture-only return-menu text, not an original unified Game Menu. The historical `guardian` image is the encounter, not the modern introduction. Original and current question banks differ, particularly National Engine, so historical screenshots establish appearance rather than content equivalence. Restored content is compared only with the approved functional baseline.

For historical National Engine capture only, stale `.png` image requests were resolved to the corresponding existing same-name `.webp` artwork. No production asset path or artwork file was altered. Supplementary victory screenshots use a presentation fixture; actual full victories are separately verified through the 88-scenario gameplay suite. During visual review, the fixture was corrected to clear a previous Wrong Turn modal before capture; this changed the harness only.

Rendered review confirms distinct desktop/mobile themes, intact character/scene artwork, readable controls, and retained compact clickable Exam navigation. Overflow assertions pass across the matched modern screenshots and supplementary restored states at all four widths. Historical layout differences remain visible by design. The gallery and generated evidence are local, ignored, and not committed.

## Accessibility and computed-style checks

Six stable selectors (`#gameBox`, `#gameShell`, `#wizardBox`, `#question`, `#progressFill`, `.maze-box:nth-child(2)`) were compared with each game's own historical page for text color, background image/color, border-top color, and shadow: **120 comparisons, zero differences**. An inactive tile avoids comparing historical animation against the current reduced-motion preference. Current reduced-motion behavior is intentionally retained.

Measured variable contrast against each profile's opaque surface is below. These are token checks, supplemented by rendered inspection; they are not a full accessibility certification across every translucent layer or assistive technology.

| Game | Text | Muted | Heading | Focus | Lowest guardian text |
| --- | ---: | ---: | ---: | ---: | ---: |
| National Engine | 15.76:1 | 9.27:1 | 13.28:1 | 11.73:1 | 6.95:1 |
| Mint, Ash & Gold | 15.49:1 | 9.11:1 | 13.04:1 | 11.53:1 | 6.82:1 |
| Command Nexus | 16.26:1 | 11:1 | 12.12:1 | 8.99:1 | 8.86:1 |
| Exchange Citadel | 17.39:1 | 17.39:1 | 17.73:1 | 10.33:1 | 8.9:1 |

The lowest checked text token is 6.82:1 and the lowest focus token is 8.99:1. Keyboard focus dimensions, accessible names, graph descriptions, Escape behavior, and motion controls remain unchanged. No game adopts another game's palette to resolve contrast.

## Gameplay and telemetry regression results

| Suite | Result and coverage |
| --- | --- |
| `individual-regression.mjs` | **88/88 passed**: four complete 30-room Standard runs, four complete Exam runs, 36 boss-failure scenarios (rooms 10/20/30, miss at each answer position), four natural repair/retest scenarios, 36 supported-mode launch/answer cases, and four unavailable graph-mode cases. |
| Full Standard outcomes | Each run records 36 correct responses, three completed guardians and exactly three artifacts. Every failed encounter immediately moves back three rooms, awards no artifact, and preserves save/resume expectations. |
| Full Exam outcomes | Each run records 36 responses, 30 correct, six revisions, three section commits, nine guardian responses, and no artifacts. Direct room navigation, drafts, revisions, commitment, and delayed feedback remain functional. |
| `individual-focused.mjs` | **20/20 passed**: four keyboard/introduction/replay/persistence/graph/Timed Trial checks, four exact baseline-vs-current protected Standard comparisons, and twelve controlled timing comparisons across Score Attack, Fading Fortune, and Risk & Reward. |
| Daily suite via `daily-runner.cjs` | **104/104 passed**, 26 for each Macro game. Selection, tracking, completion, persistence, and adapters retain the existing behavior. The runner adapts Windows line endings/template selection only; shared tests are unchanged. |
| `individual-browser.mjs incorrect/restored` | All four games pass in both phases: actual remediation/recovery, Exam room navigation and checkpoint responses, report rendering, CSV download, page-error and overflow checks, plus screenshots. |
| `individual-extra-surfaces.mjs` | All four pass actual correct-answer Continue and Wrong Turn interactions, plus checked completion presentation fixtures at all widths. |
| `individual-compare.mjs` | All four baseline/current state and report comparisons pass, including full event sequence and 117-column CSV comparisons. |
| Source protection and generation | All four pass, 22 engine functions per game and 159 protected companion files unchanged; two synchronization passes are hash-stable. All five script blocks in each generated page are identical to the approved baseline. |

The regression suite ran during the presentation implementation; subsequent changes were restricted to theme CSS and restored body classes. Final focused, state/telemetry, source-preservation, and synchronization checks cover the final generated output. Gameplay definitions were never edited to make a visual test pass.

CSV validation checks all **117 column names, their ordering, and every row value**, not just the width of the header. The longer Standard/recovery/Exam captures use seeded Math.random and controlled clocks; independently generated UUIDs are canonically mapped bijectively for comparison, preserving all identifier linkage and leaving every other field untouched. Event counts are 81 for National Engine and 80 for each other game. No columns are dropped. The twelve timing comparisons also seed `crypto.randomUUID`, so their baseline/restored CSV files compare byte for byte with no normalization. An initial test mismatch was limited to unseeded random UUIDs; the test harness was corrected, with no product change.

Evidence files include `individual-regression-results.json`, `individual-focused-results.json`, `individual-daily-<game>.json`, `individual-{incorrect,restored}-results.json`, `individual-extra-surfaces.json`, `individual-state-comparison.json`, `individual-style-comparison.json`, `individual-source-results.json`, and the synthetic `individual-*.csv` exports. All remain under `tmp/macro-managerial-alignment/`.

Reproduction from this Macro worktree uses the ignored evidence runners plus the maintained checks:

```powershell
node audit_tools/macro_command_engine/sync.mjs --check
node audit_tools/macro_command_engine/check.mjs
node tmp/macro-managerial-alignment/individual-source.mjs
node tmp/macro-managerial-alignment/individual-regression.mjs
node tmp/macro-managerial-alignment/individual-focused.mjs
node tmp/macro-managerial-alignment/individual-browser.mjs incorrect
node tmp/macro-managerial-alignment/individual-browser.mjs restored
node tmp/macro-managerial-alignment/individual-compare.mjs
node tmp/macro-managerial-alignment/individual-style-check.mjs
node tmp/macro-managerial-alignment/individual-extra-surfaces.mjs
```

## Remaining limitations

No unresolved visual defect was identified in the inspected states. National Engine and Mint legitimately share some historical bronze buttons and green panels; those values were independently verified and were not made artificially different. Mint remains distinct through its own panel lighting, emerald/pale-gold accents, original artwork, and environment. Citadel retains historical cyan grid/report accents alongside its purple-and-gold late overrides.

Modern surfaces without a historical equivalent are documented adaptations of each game's own palette. Browser testing was local Edge/Chromium with controlled clocks, seeded cases, and reduced motion; this is not an exhaustive browser/device or screen-reader certification. Screenshot evidence is intentionally ignored and will not accompany the commit when cloned. No deployment was attempted; the owner can review the local gallery before separately updating the Macro preview.

## Exact component paint appendix

The tables below record the actual restored variables. Panel, button, hover, tile, progress, and modal recipes originate from each game's ordered historical rules. Surface/focus tokens and the modern-component application are explicit per-game adaptations where required. The full historical selector inventories are in the committed `themes.json`; the computed-selector tables show exact historical and restored equality for representative core surfaces.

### National Engine

Source: `play/macro-command-system/national-engine/index.html` at `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`. Profile: Green charcoal, bronze and aged gold. 77 ordered historical paint rules.

| Variable | Restored value |
| --- | --- |
| `--mq-text` | `rgb(243, 234, 210)` |
| `--mq-muted` | `rgb(214, 177, 92)` |
| `--mq-heading` | `#f4d58d` |
| `--mq-focus` | `#f0c75e` |
| `--mq-dark` | `#040505` |
| `--mq-surface` | `#0c1212` |
| `--mq-accent` | `214,177,92` |
| `--mq-secondary` | `138,58,36` |
| `--mq-panel-paint` | `radial-gradient(circle, rgba(42, 74, 64, 0.34) 0%, rgba(18, 24, 24, 0.92) 52%, rgba(4, 5, 5, 0.98) 100%)` |
| `--mq-panel-shadow` | `rgba(214, 177, 92, 0.24) 0px 0px 24px, rgba(88, 28, 24, 0.28) 0px 0px 70px, rgba(0, 0, 0, 0.72) 0px 0px 38px inset` |
| `--mq-panel-border` | `rgba(214, 177, 92, 0.34)` |
| `--mq-button-paint` | `linear-gradient(rgb(91, 58, 31), rgb(27, 23, 17))` |
| `--mq-button-shadow` | `rgba(214, 177, 92, 0.24) 0px 0px 12px, rgba(88, 28, 24, 0.18) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 10px inset` |
| `--mq-button-border` | `rgba(214, 177, 92, 0.42)` |
| `--mq-hover-paint` | `linear-gradient(rgb(122, 74, 37), rgb(42, 27, 18))` |
| `--mq-hover-shadow` | `rgba(240, 199, 94, 0.48) 0px 0px 18px, rgba(127, 29, 29, 0.28) 0px 0px 34px, rgba(0, 0, 0, 0.68) 0px 0px 12px inset` |
| `--mq-hover-border` | `rgba(240, 199, 94, 0.7)` |
| `--mq-tile-paint` | `linear-gradient(rgba(22, 30, 28, 0.72), rgba(7, 9, 9, 0.86))` |
| `--mq-tile-border` | `rgba(214, 177, 92, 0.18)` |
| `--mq-active-paint` | `radial-gradient(circle, rgba(214, 177, 92, 0.48), rgba(65, 95, 78, 0.36), rgba(12, 18, 18, 0.92))` |
| `--mq-active-shadow` | `rgba(240, 199, 94, 0.78) 0px 0px 12px, rgba(214, 177, 92, 0.48) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 12px inset` |
| `--mq-saved-paint` | `linear-gradient(rgba(65, 95, 78, 0.62), rgba(20, 31, 28, 0.88))` |
| `--mq-progress-paint` | `linear-gradient(90deg, rgb(47, 79, 67), rgb(214, 177, 92), rgb(138, 58, 36))` |
| `--mq-modal-paint` | `radial-gradient(circle, rgba(65, 95, 78, 0.3), rgba(12, 18, 18, 0.82) 58%, rgba(4, 5, 5, 0.92))` |
| `--mq-modal-shadow` | `rgba(0, 0, 0, 0.82) 0px 0px 24px, rgba(214, 177, 92, 0.18) 0px 0px 28px, rgba(0, 0, 0, 0.72) 0px 0px 26px inset` |
| `--mq-boss-1` | `#a78bfa` |
| `--mq-boss-text-1` | `#a78bfa` |
| `--mq-boss-2` | `#7c3aed` |
| `--mq-boss-text-2` | `#c4b5fd` |
| `--mq-boss-3` | `#991b1b` |
| `--mq-boss-text-3` | `#fca5a5` |

| Selector | Historical value = restored value |
| --- | --- |
| `#gameBox` | `color: rgb(243, 234, 210)`<br>`backgroundImage: radial-gradient(circle, rgba(42, 74, 64, 0.34) 0%, rgba(18, 24, 24, 0.92) 52%, rgba(4, 5, 5, 0.98) 100%)`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.34)`<br>`boxShadow: rgba(214, 177, 92, 0.24) 0px 0px 24px 0px, rgba(88, 28, 24, 0.28) 0px 0px 70px 0px, rgba(0, 0, 0, 0.72) 0px 0px 38px 0px inset` |
| `#gameShell` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(18, 24, 24, 0.96), rgba(4, 5, 5, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.28)`<br>`boxShadow: rgba(0, 0, 0, 0.92) 0px 0px 30px 0px, rgba(214, 177, 92, 0.16) 0px 0px 58px 0px, rgba(88, 28, 24, 0.16) 0px 0px 76px 0px, rgba(0, 0, 0, 0.74) 0px 0px 42px 0px inset` |
| `#wizardBox` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(42, 55, 49, 0.94), rgba(8, 10, 10, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.26)`<br>`boxShadow: rgba(0, 0, 0, 0.78) 0px 0px 26px 0px inset, rgba(214, 177, 92, 0.12) 0px 0px 18px 0px` |
| `#question` | `color: rgb(243, 234, 210)`<br>`backgroundImage: none`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(243, 234, 210)`<br>`boxShadow: none` |
| `#progressFill` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(90deg, rgb(47, 79, 67), rgb(214, 177, 92), rgb(138, 58, 36))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(243, 234, 210)`<br>`boxShadow: rgba(214, 177, 92, 0.45) 0px 0px 12px 0px, rgba(127, 29, 29, 0.25) 0px 0px 22px 0px` |
| `.maze-box:nth-child(2)` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(22, 30, 28, 0.72), rgba(7, 9, 9, 0.86))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.18)`<br>`boxShadow: rgba(0, 0, 0, 0.72) 0px 0px 10px 0px inset, rgba(214, 177, 92, 0.08) 0px 0px 5px 0px` |

### Mint, Ash & Gold

Source: `play/macro-command-system/mint-ash-gold/index.html` at `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`. Profile: Emerald, ash and pale gold. 134 ordered historical paint rules.

| Variable | Restored value |
| --- | --- |
| `--mq-text` | `rgb(243, 234, 210)` |
| `--mq-muted` | `rgb(214, 177, 92)` |
| `--mq-heading` | `#f4d58d` |
| `--mq-focus` | `#f0c75e` |
| `--mq-dark` | `#03050c` |
| `--mq-surface` | `#18120c` |
| `--mq-accent` | `52,211,153` |
| `--mq-secondary` | `245,214,130` |
| `--mq-panel-paint` | `radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, rgba(245, 214, 130, 0.12) 36%, rgba(24, 18, 12, 0.92) 72%, rgba(3, 5, 12, 0.99) 100%)` |
| `--mq-panel-shadow` | `rgba(52, 211, 153, 0.14) 0px 0px 22px, rgba(245, 214, 130, 0.13) 0px 0px 58px, rgba(3, 5, 12, 0.72) 0px 0px 72px, rgba(0, 0, 0, 0.78) 0px 0px 42px inset` |
| `--mq-panel-border` | `rgba(245, 214, 130, 0.36)` |
| `--mq-button-paint` | `linear-gradient(rgb(91, 58, 31), rgb(27, 23, 17))` |
| `--mq-button-shadow` | `rgba(214, 177, 92, 0.24) 0px 0px 12px, rgba(88, 28, 24, 0.18) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 10px inset` |
| `--mq-button-border` | `rgba(214, 177, 92, 0.42)` |
| `--mq-hover-paint` | `linear-gradient(rgb(122, 74, 37), rgb(42, 27, 18))` |
| `--mq-hover-shadow` | `rgba(240, 199, 94, 0.48) 0px 0px 18px, rgba(127, 29, 29, 0.28) 0px 0px 34px, rgba(0, 0, 0, 0.68) 0px 0px 12px inset` |
| `--mq-hover-border` | `rgba(240, 199, 94, 0.7)` |
| `--mq-tile-paint` | `linear-gradient(rgba(22, 30, 28, 0.72), rgba(7, 9, 9, 0.86))` |
| `--mq-tile-border` | `rgba(214, 177, 92, 0.18)` |
| `--mq-active-paint` | `radial-gradient(circle, rgba(214, 177, 92, 0.48), rgba(65, 95, 78, 0.36), rgba(12, 18, 18, 0.92))` |
| `--mq-active-shadow` | `rgba(240, 199, 94, 0.78) 0px 0px 12px, rgba(214, 177, 92, 0.48) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 12px inset` |
| `--mq-saved-paint` | `linear-gradient(rgba(65, 95, 78, 0.62), rgba(20, 31, 28, 0.88))` |
| `--mq-progress-paint` | `linear-gradient(90deg, rgb(47, 79, 67), rgb(214, 177, 92), rgb(138, 58, 36))` |
| `--mq-modal-paint` | `radial-gradient(circle at center top, rgba(65, 95, 78, 0.26), rgba(12, 18, 18, 0.9) 48%, rgba(4, 5, 5, 0.98))` |
| `--mq-modal-shadow` | `rgba(0, 0, 0, 0.88) 0px 0px 34px, rgba(214, 177, 92, 0.18) 0px 0px 38px, rgba(127, 29, 29, 0.12) 0px 0px 46px, rgba(0, 0, 0, 0.72) 0px 0px 30px inset` |
| `--mq-boss-1` | `#a78bfa` |
| `--mq-boss-text-1` | `#a78bfa` |
| `--mq-boss-2` | `#7c3aed` |
| `--mq-boss-text-2` | `#c4b5fd` |
| `--mq-boss-3` | `#991b1b` |
| `--mq-boss-text-3` | `#fca5a5` |

| Selector | Historical value = restored value |
| --- | --- |
| `#gameBox` | `color: rgb(243, 234, 210)`<br>`backgroundImage: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, rgba(245, 214, 130, 0.12) 36%, rgba(24, 18, 12, 0.92) 72%, rgba(3, 5, 12, 0.99) 100%)`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(245, 214, 130, 0.36)`<br>`boxShadow: rgba(52, 211, 153, 0.14) 0px 0px 22px 0px, rgba(245, 214, 130, 0.13) 0px 0px 58px 0px, rgba(3, 5, 12, 0.72) 0px 0px 72px 0px, rgba(0, 0, 0, 0.78) 0px 0px 42px 0px inset` |
| `#gameShell` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(18, 24, 24, 0.96), rgba(4, 5, 5, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.28)`<br>`boxShadow: rgba(0, 0, 0, 0.92) 0px 0px 30px 0px, rgba(214, 177, 92, 0.16) 0px 0px 58px 0px, rgba(88, 28, 24, 0.16) 0px 0px 76px 0px, rgba(0, 0, 0, 0.74) 0px 0px 42px 0px inset` |
| `#wizardBox` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(42, 55, 49, 0.94), rgba(8, 10, 10, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.26)`<br>`boxShadow: rgba(0, 0, 0, 0.78) 0px 0px 26px 0px inset, rgba(214, 177, 92, 0.12) 0px 0px 18px 0px` |
| `#question` | `color: rgb(243, 234, 210)`<br>`backgroundImage: none`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(243, 234, 210)`<br>`boxShadow: none` |
| `#progressFill` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(90deg, rgb(47, 79, 67), rgb(214, 177, 92), rgb(138, 58, 36))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(243, 234, 210)`<br>`boxShadow: rgba(214, 177, 92, 0.45) 0px 0px 12px 0px, rgba(127, 29, 29, 0.25) 0px 0px 22px 0px` |
| `.maze-box:nth-child(2)` | `color: rgb(243, 234, 210)`<br>`backgroundImage: linear-gradient(rgba(22, 30, 28, 0.72), rgba(7, 9, 9, 0.86))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(214, 177, 92, 0.18)`<br>`boxShadow: rgba(0, 0, 0, 0.72) 0px 0px 10px 0px inset, rgba(214, 177, 92, 0.08) 0px 0px 5px 0px` |

### Command Nexus

Source: `play/macro-command-system/command-nexus/index.html` at `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`. Profile: Steel blue, navy and gold. 127 ordered historical paint rules.

| Variable | Restored value |
| --- | --- |
| `--mq-text` | `rgb(230, 236, 245)` |
| `--mq-muted` | `rgb(159, 199, 245)` |
| `--mq-heading` | `#f0c86a` |
| `--mq-focus` | `#78b4ff` |
| `--mq-dark` | `#02050c` |
| `--mq-surface` | `#060e1c` |
| `--mq-accent` | `80,140,220` |
| `--mq-secondary` | `240,200,106` |
| `--mq-panel-paint` | `radial-gradient(circle, rgba(80, 140, 220, 0.18) 0%, rgba(25, 70, 120, 0.42) 46%, rgba(8, 16, 32, 0.94) 74%, rgba(2, 4, 10, 0.99) 100%)` |
| `--mq-panel-shadow` | `rgba(80, 140, 220, 0.22) 0px 0px 22px, rgba(240, 200, 106, 0.1) 0px 0px 58px, rgba(10, 45, 95, 0.46) 0px 0px 72px, rgba(0, 0, 0, 0.78) 0px 0px 42px inset` |
| `--mq-panel-border` | `rgba(240, 200, 106, 0.34)` |
| `--mq-button-paint` | `linear-gradient(rgb(18, 52, 90), rgb(7, 17, 31))` |
| `--mq-button-shadow` | `rgba(80, 140, 220, 0.28) 0px 0px 12px, rgba(10, 45, 95, 0.22) 0px 0px 24px, rgba(0, 0, 0, 0.68) 0px 0px 10px inset` |
| `--mq-button-border` | `rgba(240, 200, 106, 0.38)` |
| `--mq-hover-paint` | `linear-gradient(rgb(27, 79, 134), rgb(11, 31, 56))` |
| `--mq-hover-shadow` | `rgba(100, 170, 255, 0.5) 0px 0px 18px, rgba(240, 200, 106, 0.22) 0px 0px 34px, rgba(0, 0, 0, 0.7) 0px 0px 12px inset` |
| `--mq-hover-border` | `rgba(240, 200, 106, 0.72)` |
| `--mq-tile-paint` | `linear-gradient(rgba(10, 24, 46, 0.76), rgba(3, 8, 18, 0.9))` |
| `--mq-tile-border` | `rgba(120, 180, 255, 0.18)` |
| `--mq-active-paint` | `radial-gradient(circle, rgba(100, 170, 255, 0.48), rgba(18, 58, 102, 0.42), rgba(3, 8, 18, 0.94))` |
| `--mq-active-shadow` | `rgba(100, 170, 255, 0.78) 0px 0px 12px, rgba(240, 200, 106, 0.36) 0px 0px 24px, rgba(0, 0, 0, 0.66) 0px 0px 12px inset` |
| `--mq-saved-paint` | `linear-gradient(rgba(24, 82, 135, 0.62), rgba(8, 24, 44, 0.9))` |
| `--mq-progress-paint` | `linear-gradient(90deg, rgb(18, 58, 102), rgb(79, 159, 232), rgb(240, 200, 106))` |
| `--mq-modal-paint` | `radial-gradient(circle at center top, rgba(24, 82, 135, 0.28), rgba(6, 14, 28, 0.92) 48%, rgba(2, 5, 12, 0.98))` |
| `--mq-modal-shadow` | `rgba(0, 0, 0, 0.88) 0px 0px 34px, rgba(80, 140, 220, 0.2) 0px 0px 38px, rgba(240, 200, 106, 0.12) 0px 0px 46px, rgba(0, 0, 0, 0.74) 0px 0px 30px inset` |
| `--mq-boss-1` | `#f0c86a` |
| `--mq-boss-text-1` | `#f0c86a` |
| `--mq-boss-2` | `#6eb4ff` |
| `--mq-boss-text-2` | `#6eb4ff` |
| `--mq-boss-3` | `#991b1b` |
| `--mq-boss-text-3` | `#fca5a5` |

| Selector | Historical value = restored value |
| --- | --- |
| `#gameBox` | `color: rgb(230, 236, 245)`<br>`backgroundImage: radial-gradient(circle, rgba(80, 140, 220, 0.18) 0%, rgba(25, 70, 120, 0.42) 46%, rgba(8, 16, 32, 0.94) 74%, rgba(2, 4, 10, 0.99) 100%)`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(240, 200, 106, 0.34)`<br>`boxShadow: rgba(80, 140, 220, 0.22) 0px 0px 22px 0px, rgba(240, 200, 106, 0.1) 0px 0px 58px 0px, rgba(10, 45, 95, 0.46) 0px 0px 72px 0px, rgba(0, 0, 0, 0.78) 0px 0px 42px 0px inset` |
| `#gameShell` | `color: rgb(230, 236, 245)`<br>`backgroundImage: linear-gradient(rgba(6, 14, 28, 0.96), rgba(2, 5, 12, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(120, 180, 255, 0.26)`<br>`boxShadow: rgba(0, 0, 0, 0.92) 0px 0px 30px 0px, rgba(80, 140, 220, 0.18) 0px 0px 58px 0px, rgba(240, 200, 106, 0.1) 0px 0px 76px 0px, rgba(0, 0, 0, 0.76) 0px 0px 42px 0px inset` |
| `#wizardBox` | `color: rgb(230, 236, 245)`<br>`backgroundImage: linear-gradient(rgba(18, 54, 92, 0.92), rgba(4, 10, 20, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(120, 180, 255, 0.28)`<br>`boxShadow: rgba(0, 0, 0, 0.8) 0px 0px 26px 0px inset, rgba(80, 140, 220, 0.16) 0px 0px 18px 0px, rgba(240, 200, 106, 0.08) 0px 0px 30px 0px` |
| `#question` | `color: rgb(230, 236, 245)`<br>`backgroundImage: none`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(230, 236, 245)`<br>`boxShadow: none` |
| `#progressFill` | `color: rgb(230, 236, 245)`<br>`backgroundImage: linear-gradient(90deg, rgb(18, 58, 102), rgb(79, 159, 232), rgb(240, 200, 106))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(230, 236, 245)`<br>`boxShadow: rgba(100, 170, 255, 0.46) 0px 0px 12px 0px, rgba(240, 200, 106, 0.26) 0px 0px 22px 0px` |
| `.maze-box:nth-child(2)` | `color: rgb(230, 236, 245)`<br>`backgroundImage: linear-gradient(rgba(10, 24, 46, 0.76), rgba(3, 8, 18, 0.9))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(120, 180, 255, 0.18)`<br>`boxShadow: rgba(0, 0, 0, 0.76) 0px 0px 10px 0px inset, rgba(80, 140, 220, 0.1) 0px 0px 5px 0px` |

### Exchange Citadel

Source: `play/macro-command-system/exchange-citadel/index.html` at `a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5`. Profile: Amethyst, lavender and gold, with cyan room accents. 148 ordered historical paint rules.

| Variable | Restored value |
| --- | --- |
| `--mq-text` | `rgb(245, 243, 255)` |
| `--mq-muted` | `rgb(245, 243, 255)` |
| `--mq-heading` | `#fff7d6` |
| `--mq-focus` | `#c4b5fd` |
| `--mq-dark` | `#050312` |
| `--mq-surface` | `#140a26` |
| `--mq-accent` | `196,181,253` |
| `--mq-secondary` | `240,200,106` |
| `--mq-panel-paint` | `radial-gradient(circle at center top, rgba(196, 181, 253, 0.18), rgba(109, 40, 217, 0.16) 34%, rgba(20, 10, 38, 0.94) 72%, rgba(5, 3, 18, 0.98))` |
| `--mq-panel-shadow` | `rgba(196, 181, 253, 0.2) 0px 0px 24px, rgba(109, 40, 217, 0.18) 0px 0px 62px, rgba(0, 0, 0, 0.72) 0px 0px 36px inset` |
| `--mq-panel-border` | `rgba(240, 200, 106, 0.44)` |
| `--mq-button-paint` | `linear-gradient(rgba(76, 29, 149, 0.96), rgba(18, 8, 32, 0.98))` |
| `--mq-button-shadow` | `rgba(56, 189, 248, 0.24) 0px 0px 12px, rgba(8, 47, 73, 0.18) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 10px inset` |
| `--mq-button-border` | `rgba(240, 200, 106, 0.48)` |
| `--mq-hover-paint` | `linear-gradient(rgba(109, 40, 217, 0.98), rgba(46, 16, 101, 0.98))` |
| `--mq-hover-shadow` | `rgba(196, 181, 253, 0.46) 0px 0px 20px, rgba(240, 200, 106, 0.18) 0px 0px 36px, rgba(0, 0, 0, 0.66) 0px 0px 12px inset` |
| `--mq-hover-border` | `rgba(255, 247, 214, 0.72)` |
| `--mq-tile-paint` | `linear-gradient(rgba(11, 34, 56, 0.72), rgba(2, 6, 23, 0.86))` |
| `--mq-tile-border` | `rgba(56, 189, 248, 0.18)` |
| `--mq-active-paint` | `radial-gradient(circle, rgba(56, 189, 248, 0.48), rgba(37, 99, 235, 0.36), rgba(3, 10, 24, 0.92))` |
| `--mq-active-shadow` | `rgba(248, 217, 129, 0.78) 0px 0px 12px, rgba(56, 189, 248, 0.48) 0px 0px 24px, rgba(0, 0, 0, 0.62) 0px 0px 12px inset` |
| `--mq-saved-paint` | `linear-gradient(rgba(37, 99, 235, 0.62), rgba(3, 10, 24, 0.88))` |
| `--mq-progress-paint` | `linear-gradient(90deg, rgb(76, 29, 149), rgb(196, 181, 253), rgb(240, 200, 106))` |
| `--mq-modal-paint` | `radial-gradient(circle at center top, rgba(196, 181, 253, 0.18), rgba(109, 40, 217, 0.16) 34%, rgba(20, 10, 38, 0.94) 72%, rgba(5, 3, 18, 0.98))` |
| `--mq-modal-shadow` | `rgba(196, 181, 253, 0.2) 0px 0px 24px, rgba(109, 40, 217, 0.18) 0px 0px 62px, rgba(0, 0, 0, 0.72) 0px 0px 36px inset` |
| `--mq-boss-1` | `#38bdf8` |
| `--mq-boss-text-1` | `#38bdf8` |
| `--mq-boss-2` | `#f8d981` |
| `--mq-boss-text-2` | `#f8d981` |
| `--mq-boss-3` | `#fff8e7` |
| `--mq-boss-text-3` | `#fff8e7` |

| Selector | Historical value = restored value |
| --- | --- |
| `#gameBox` | `color: rgb(245, 243, 255)`<br>`backgroundImage: radial-gradient(circle at 50% 0%, rgba(196, 181, 253, 0.18), rgba(109, 40, 217, 0.16) 34%, rgba(20, 10, 38, 0.94) 72%, rgba(5, 3, 18, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(240, 200, 106, 0.44)`<br>`boxShadow: rgba(196, 181, 253, 0.2) 0px 0px 24px 0px, rgba(109, 40, 217, 0.18) 0px 0px 62px 0px, rgba(0, 0, 0, 0.72) 0px 0px 36px 0px inset` |
| `#gameShell` | `color: rgb(245, 243, 255)`<br>`backgroundImage: radial-gradient(circle at 50% 0%, rgba(196, 181, 253, 0.18), rgba(109, 40, 217, 0.16) 34%, rgba(20, 10, 38, 0.94) 72%, rgba(5, 3, 18, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(240, 200, 106, 0.44)`<br>`boxShadow: rgba(196, 181, 253, 0.2) 0px 0px 24px 0px, rgba(109, 40, 217, 0.18) 0px 0px 62px 0px, rgba(0, 0, 0, 0.72) 0px 0px 36px 0px inset` |
| `#wizardBox` | `color: rgb(245, 243, 255)`<br>`backgroundImage: radial-gradient(circle at 50% 0%, rgba(196, 181, 253, 0.18), rgba(109, 40, 217, 0.16) 34%, rgba(20, 10, 38, 0.94) 72%, rgba(5, 3, 18, 0.98))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(240, 200, 106, 0.44)`<br>`boxShadow: rgba(196, 181, 253, 0.2) 0px 0px 24px 0px, rgba(109, 40, 217, 0.18) 0px 0px 62px 0px, rgba(0, 0, 0, 0.72) 0px 0px 36px 0px inset` |
| `#question` | `color: rgb(245, 243, 255)`<br>`backgroundImage: none`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(245, 243, 255)`<br>`boxShadow: none` |
| `#progressFill` | `color: rgb(245, 243, 255)`<br>`backgroundImage: linear-gradient(90deg, rgb(76, 29, 149), rgb(196, 181, 253), rgb(240, 200, 106))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgb(245, 243, 255)`<br>`boxShadow: rgba(56, 189, 248, 0.45) 0px 0px 12px 0px, rgba(14, 165, 233, 0.25) 0px 0px 22px 0px` |
| `.maze-box:nth-child(2)` | `color: rgb(245, 243, 255)`<br>`backgroundImage: linear-gradient(rgba(11, 34, 56, 0.72), rgba(2, 6, 23, 0.86))`<br>`backgroundColor: rgba(0, 0, 0, 0)`<br>`borderTopColor: rgba(56, 189, 248, 0.18)`<br>`boxShadow: rgba(0, 0, 0, 0.72) 0px 0px 10px 0px inset, rgba(56, 189, 248, 0.08) 0px 0px 5px 0px` |
