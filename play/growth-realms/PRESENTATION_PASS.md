# Growth Realms — presentation, identity and onboarding

The game now opens with a strategy invitation, followed by a concise choice of starting challenge. The MQ navy/white/teal theme extends through planning, resolution and the final report. Gameplay, allocation commands, CPU doctrines, six cycles, building progression and animation timing remain intact.

## Files changed

| File | This pass |
| --- | --- |
| `index.html` | Title screen, two-city illustration, How to Play/Field Guide dialogs, compact HUD outside the full header, shorter shell copy |
| `game.js` | Presentation-only opening state, dialog/focus behavior, concise choices and labels, sticky-strip context, parallel resolution columns |
| `config.js` | `GAME_CONFIG.subtitle` wording only; no economic constants changed |
| `debrief.js` | Report heading, small metadata, dominant gap result, optional methodology disclosure and MQ chart colors; calculations unchanged |
| `mq-theme.css` | New centralized MQ color variables and existing-token aliases |
| `presentation.css` | New title, choice, HUD, theme and report hierarchy/responsive rules |
| `styles.css`, `visual.css`, `interaction.css` | Existing UI color literals converted to centralized theme references |
| `map-engine.js` | Canvas backdrop/noise read the MQ navy variables; terrain, buildings, routes, timing and animation hooks unchanged |
| `tests/presentation-browser.test.mjs` | New A–I acceptance checks and screenshot capture |
| `tests/browser-helpers.mjs`, `tests/browser.test.mjs`, `tests/visual-browser.test.mjs`, `tests/interaction-browser.test.mjs` | Existing regressions enter the new title flow; tab selectors scoped to the navigation |
| `tests/model.test.js` | One expected report phrase updated from “You managed:” to “You managed”; economic assertions unchanged |
| `package.json`, `README.md`, `PRESENTATION_PASS.md` | Test command, play instructions and implementation report |

No new raster assets were needed. The opening illustration and choice thumbnails reuse the existing capital atlas, showing the actual advanced and earlier-stage building frames across a stylized river.

## MQ palette implementation

Source: [`assets/css/site.css`](../../assets/css/site.css). The game aliases the site's existing named colors, with exact palette fallbacks for standalone use. This avoids importing unrelated global site layout rules. UI color literals are confined to `mq-theme.css`; existing styles reference these variables. The canvas backdrop uses the same tokens. Grass, water, construction effects and the existing district art retain their scene colors.

| Variable | Value / source |
| --- | --- |
| `--mq-bg` | `--gray-50` / `#f7fafc` |
| `--mq-surface` | `--white` / `#ffffff` |
| `--mq-border` | `--gray-300` / `#cbd5e0` |
| `--mq-text` | `--gray-800` / `#253247` |
| `--mq-muted` | `--gray-600` / `#526277` |
| `--mq-accent` | `--teal-600` / `#009f9a` |
| `--mq-accent-soft` | `#e7f6f5`, a pale companion surface |
| `--mq-highlight` | `--teal-300` / `#77d9d3` |
| `--mq-bg-dark`, `--mq-navy`, `--mq-blue` | Site navy 950/900/800: `#031638`, `#062454`, `#0a3472` |

Additional on-dark, warning and shadow variables keep semantic colors centralized. White/navy combinations carry important text; saturated teal is primarily an accent rather than small body text on white.

## HUD behavior

The full header is non-sticky. Its game title, view tabs and all six stock metrics scroll away normally. A separate **64px desktop / approximately 65px phone** strip remains sticky during play. It contains cycle, selected city (or Both cities), remaining points while planning, and the current Commit Plan / Next Cycle / View final report action. The short planning hint disappears when the full header has scrolled away.

The strip uses **white circular budget dots**, replacing the yellow squares. The action has a 44px minimum touch height. Unspent points are hidden after commitment; cycle and next action remain available. The strip disappears on the final report. Section scroll offsets follow the strip's measured height, rather than pinning the tall dashboard over the town. All six full-HUD metrics remain available at the top.

## Title and onboarding

Initial load shows a real title screen before city choice. It has one dominant Start Game action, with How to Play and Field Guide as secondary controls. Its copy is:

> **Choose a city. Build the stronger growth path.**
>
> Guide one economy through six cycles of investment, skills, and technology as an independent rival develops across the river.

The illustration labels Meridian **Hold the frontier** and Rivermark **Close the gap**. Its replay cue is **A new rival strategy every replay.** That reflects the existing replay doctrine selection; no randomization rule was changed.

How to Play gives three steps: choose a starting challenge, invest 20 points, then commit and compare. Both guides use native modal dialogs with headings, keyboard focus, Escape dismissal and return focus. Field Guide retains the longer economic explanations. No run exists until a city is chosen. Play Again still returns directly to city choice; Back to title is available there.

Choice cards use short starting descriptions and one challenge each:

- **Meridian:** Advanced, productive, and established. Challenge: sustain growth near the frontier.
- **Rivermark:** Smaller, earlier-stage, and full of catch-up potential. Challenge: build fast without creating bottlenecks.

## Wording and layout cleanup

- Removed “A new regional rivalry,” “Computer rival,” and the repeated “Your economy. An independent rival…” subtitle.
- Tabs read **Combined Comparison / Meridian / Rivermark**, with no role suffixes. Small city-heading context identifies control ownership.
- Resolution labels read **Meridian allocation / Rivermark allocation**. Their left/right order matches the city maps.
- Removed the redundant rival-status strip after resolution. Actual allocations and consequences remain visible.
- Shortened actions to **Start Game**, **Commit Plan**, **Next Cycle**, and **Play again**. The compact final action remains **View final report**.
- The title and choice screens hide the economic dashboard and live map controls; in-game direct district allocation remains unchanged.

## Final report hierarchy

The report begins with FINAL REPORT, **The economy you built**, and two small metadata lines naming the managed city and revealed doctrine. A full-width navy card then presents the authoritative gap label at **46px desktop**, start/finish percentages at **72px**, and a **17px** interpretation paragraph. Phone sizes remain responsive, with a 30px result heading and 34–54px numbers.

The original gap formula, tolerance, absolute-gap figures and caveat remain available under **How the gap is measured**, in 15px text. The two Start → Finish tables follow the result; their headers are now 14px. The history-based “What happened?” / “Why did it happen?” sections, policy connection, transfer question, ledger and replay remain intact. Important report prose is 16px or larger. The report continues to use the existing `gapReport()` result and makes no new winner declaration.

## Verification

- **24 pure tests passed**, including the frozen economic contract: `model.js`, `cpu.js` and `session.js` hashes and the balance/doctrine/cycle snapshots still match.
- **Gameplay browser suite passed:** both complete six-cycle city paths, CPU secrecy/reveal, construction, reports, transfer feedback, replay and responsive tables.
- **Visual browser suite passed:** all 12 existing visual cases, real construction frame changes, seven atlases, singleton 8 FPS clock, hidden-page pause/resume and reduced motion.
- **Interaction browser suite passed:** direct clicks, keyboard, actual emulated touch taps, undo/Clear, +5 clamping, budget gating, unchanged pre-commit stocks/buildings and all route directions.
- **Presentation A–I passed:** initial title flow, guides and keyboard focus, MQ variables, 64px sticky state, white round dots, concise labels, authoritative report values, typography and replay.
- Checked 320, 390, 768 and 1440px layouts with no page overflow or browser errors; the visual suite also covers 1600px.

Run `npm run test:presentation` from this directory with the development server running and Playwright available. See README for the other commands. Screenshot measurements and resolved theme values are in `tmp/games-preview/growth-realms/presentation-pass/audit.json`.

## Screenshots

Saved locally under the ignored `tmp/games-preview/growth-realms/presentation-pass/` directory:

1. [Title screen](../../tmp/games-preview/growth-realms/presentation-pass/01-title.png)
2. [Choose an economy](../../tmp/games-preview/growth-realms/presentation-pass/02-choice.png)
3. [Planning screen](../../tmp/games-preview/growth-realms/presentation-pass/03-planning.png)
4. [Compact sticky HUD](../../tmp/games-preview/growth-realms/presentation-pass/04-compact-hud.png)
5. [Cycle resolution](../../tmp/games-preview/growth-realms/presentation-pass/05-resolution.png)
6. [Final report top](../../tmp/games-preview/growth-realms/presentation-pass/06-final-report.png)
7. [Phone title](../../tmp/games-preview/growth-realms/presentation-pass/07-phone-title.png), [phone compact HUD](../../tmp/games-preview/growth-realms/presentation-pass/08-phone-compact.png), [phone report](../../tmp/games-preview/growth-realms/presentation-pass/09-phone-report.png)
8. [Live in-app title preview](../../tmp/games-preview/growth-realms/presentation-pass/10-live-title.jpg)

## Remaining presentation scope

No known blocking presentation issue remains. The desktop and phone captures have been visually inspected. The opening uses two representative district clusters rather than an animated whole-city preview; this keeps the invitation focused and adds no animation system. All existing sprite art remains temporary.

A later polish pass could replace the temporary sprites with curated MQ art and refine micro-interactions after classroom testing. Physical phone performance, Firefox/Safari and human screen-reader usability still need device/user validation. No new save, scoring, economic, audio or deployment behavior was added.
