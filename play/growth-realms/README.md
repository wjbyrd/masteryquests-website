# Growth Realms

A six-cycle strategy game in which the player manages **one** economy and an independent computer doctrine manages the other. Its layered 32-bit isometric presentation uses detailed district sprites, staged construction, fixed routes and visible constraints. The economic model is unchanged by the visual pass.

## Run locally

From the repository root:

```sh
node play/growth-realms/tests/serve.mjs
```

Open `http://127.0.0.1:4178/play/growth-realms/`. Any static HTTP server also works. JavaScript modules require HTTP rather than `file://`. The game has no runtime dependencies or build step. The existing site build already includes the `play/` directory; this pass does not publish it or change the public catalog.

## Play

1. Select **Start Game** on the title screen, then Manage Meridian or Manage Rivermark. How to Play and Field Guide explain the controls and growth concepts. The other city gets a valid, randomly selected CPU doctrine.
2. Planning opens your city. Click or tap any district to invest +1. Select a district without spending through the dropdown below the map; its compact −1 / +1 / +5 / Clear controls provide quick allocation and undo. The prominent budget and 20 pips update immediately. Every cycle starts at zero, and commitment requires all 20 points.
3. Commit. The CPU independently plans from its own state and doctrine. Both results are calculated against the same pre-cycle technology frontier.
4. The existing construction transition runs for both cities. Stocks update together when it finishes; reduced motion skips the delay.
5. Compare the cities and revealed allocations. Compare Cities defaults to four strategic measures and the productivity gap; View detailed comparison retains the full economic data.
6. Continue for six cycles, then inspect actual history, relative and absolute productivity gaps, growth policies, the revealed rival doctrine, and one transfer question.
7. Play Again returns to city choice and resets state. The next doctrine is sampled from a valid pool excluding the preceding doctrine when alternatives exist.

Combined Comparison, Meridian, and Rivermark remain available during a run. The full stock HUD scrolls away; a compact sticky cycle/budget strip stays visible during planning and resolution. Inspecting the rival never changes who controls it or exposes editing controls. Future rival allocations are never shown before commitment/resolution.

## Files

| File | Responsibility / change |
| --- | --- |
| `index.html` | Updated choice-screen shell, field guide, cycle wording |
| `styles.css` | Existing style retained; added choice, point controls, rival report, and policy section layouts |
| `config.js` | `GAME_CONFIG`, `GAME_BALANCE`, `CPU_DOCTRINES`, project labels, `CYCLES` |
| `model.js` | Productivity model, delayed education, endogenous constraints, city histories, gap measures |
| `cpu.js` | New independent doctrine selection and integer allocation engine |
| `session.js` | New testable run state machine, scarcity validation, atomic resolution, reset-ready state |
| `game.js` | Player-only controls, city selection, rival reveal, coordinated animation, integer stock displays |
| `debrief.js` | Actual player/rival histories, doctrine reveal, policy connection and transfer question |
| `city-renderer.js` | Renderer facade and shared UI icons |
| `map-engine.js` | Nine canvas layers, cached scenes, one 8 FPS clock, fixed routes and construction |
| `visual-config.js` | Central asset manifest, district levels, routes and visual-state mapping |
| `visual.css` | Strategy-game panels, map sizing, responsive and reduced-motion presentation |
| `interaction.css`, `planning-ui.js` | Readable UI, generous district targets and compact allocation commands |
| `mq-theme.css`, `presentation.css` | Central MQ navy/teal tokens, title/choice flow, compact HUD and report hierarchy |
| `PRESENTATION_PASS.md`, `tests/presentation-browser.test.mjs` | Current presentation report, A–I browser checks and screenshots |
| `unit-routes.js` | Segment-based NE/NW/SE/SW position and facing |
| `assets/README.md`, `assets/sprites/` | Seven temporary RGBA atlases, exact dimensions and generation prompts |
| `tests/visual.test.js`, `tests/visual-economy-lock.json` | Visual acceptance and frozen economics contract |
| `tests/visual-browser.test.mjs` | Animation/lifecycle checks, mobile layouts and screenshots |
| `VISUAL_OVERHAUL.md` | Complete visual report and screenshot index |
| `DIRECT_MANIPULATION.md` | Current interaction, legibility and directional-unit report |
| `tests/interaction.test.js`, `tests/interaction-browser.test.mjs`, `tests/browser-helpers.mjs` | A–L interaction, facing, touch/keyboard and shared browser helpers |
| `package.json` | Test/audit scripts |
| `tests/model.test.js` | Acceptance A–L, scarcity, history, state/ordering checks |
| `tests/browser.test.mjs` | Both player cities, views, point controls, reveal timing, animation, reports, replay, responsive checks |
| `tests/balance-audit.mjs` | Reproducible requested-strategy and 572-run fixed-plan audit |
| `tests/balance-results.json` | Exact numeric audit output and configuration snapshot |
| `tests/serve.mjs` | Existing loopback-only development server, unchanged |
| `GAMEPLAY_OVERHAUL.md` | Exact formulas, all constants, starting states, doctrine rules, A–L evidence, limitations |

## Verification

Use a current Node runtime (Node 24 used here):

```sh
node --test play/growth-realms/tests/model.test.js play/growth-realms/tests/visual.test.js play/growth-realms/tests/interaction.test.js
node play/growth-realms/tests/balance-audit.mjs
```

For browser tests, start the server, then run:

```sh
node play/growth-realms/tests/browser.test.mjs
node play/growth-realms/tests/visual-browser.test.mjs
node play/growth-realms/tests/interaction-browser.test.mjs
node play/growth-realms/tests/presentation-browser.test.mjs
```

Browser tests require Playwright and Microsoft Edge. If Playwright is outside normal module resolution, set `PLAYWRIGHT_MODULE` to its `index.mjs` file URL. Test dependencies are not needed by the game. Screenshots go to the already-ignored `tmp/games-preview/growth-realms/` directory.

The implementation passed all 12 model-test groups, a 572-run sweep, and full browser runs for both city choices. Responsive views were checked at 320, 390, 768, and 1440 pixels, including expanded tables, reports, and active allocation controls, with no page overflow or browser errors.

## Internal state and remaining scope

`session.js` holds serializable run metadata and both city histories; `game.js` exports `exportRun()` for a future local export workflow. No external telemetry, save service, or data transmission is added. The copy returned by `exportRun()` cannot mutate the live run. Reload resets the run.

All major economic parameters are centralized in `GAME_BALANCE`; CPU-specific weights/rules are in `CPU_DOCTRINES`. The model is illustrative, without empirical calibration, depreciation, trade, random shocks, or policy institutions. There is no global score or GDP winner. Relative and absolute productivity gaps are both reported because they can move differently.

See the [gameplay report](GAMEPLAY_OVERHAUL.md), [earlier visual report](VISUAL_OVERHAUL.md), [direct-manipulation report](DIRECT_MANIPULATION.md), and [current presentation report](PRESENTATION_PASS.md). Art remains explicitly temporary pending curated release sprites. Classroom, Firefox/Safari, physical low-end mobile and human assistive-technology testing remain outstanding.
