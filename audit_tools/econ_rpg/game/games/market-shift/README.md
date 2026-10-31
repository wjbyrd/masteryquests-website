# Market Shift — private graph-game prototype

A local, unlinked Mastery Quests mini-game. No public or beta publication was performed. The public game library, beta hub, preview allowlist, Composer, existing games, and manuscript are unchanged.

## Open

From the repository root:

```powershell
node audit_tools/econ_rpg/serve.mjs
```

Open <http://127.0.0.1:4179/games/market-shift/>. Keep the server terminal running while playing; Ctrl+C stops it. This development server binds to loopback. Use HTTP, not a file URL, because the game uses ES modules.

## Play

The player is the new market analyst in Linden. Three market bulletins lead to graph construction and feedback:

1. **The harvest:** a crop loss shifts supply left. Move the appropriate curve and place the forecast equilibrium.
2. **The festival:** more buyers shift demand right. Keep supply fixed and construct the new equilibrium.
3. **The price promise:** an explicit $40 price ceiling in the original market. Position the ceiling, then read quantities supplied and demanded.

Drag the labeled handles or the curve itself, use the range controls with arrow keys, or enter marker coordinates. Curve handles move horizontally. The equilibrium marker moves in two dimensions; the price line moves vertically and quantity markers move horizontally. Graph-tool buttons let students place an equilibrium, price line, or quantity marker by clicking the graph. All actions have ordinary labeled controls.

Students submit a forecast before receiving correctness feedback. Known error patterns receive different explanations: wrong curve, wrong direction, inconsistent intersection, incorrect legal maximum, and reversed supplied/demanded quantities. A hint is available without a timer or point penalty. Retry and reset preserve attempt history. Completed missions lock their graph and show an economic debrief.

**Explore freely** gives immediate model results with optional price ceilings. Exploration does not modify the mission notebook. A nonbinding ceiling leaves the market-clearing price and quantity unchanged. Quantities outside the displayed 0–100 range are identified rather than plotted as false intersections at the edge.

The final notebook distinguishes a correct first forecast without hints from completion after practice. Its text download includes each submitted graph state, feedback code, hints used, and debrief. It is not an authenticated assessment or a file supported by Class Answer Analysis.

## Model and interpretation

Price is dollars per crate; quantity is crates per market day. The illustrative competitive model is:

- Inverse demand: `P = 100 + 0.8d - 0.8Q`.
- Inverse supply: `P = 20 - 0.8s + 0.8Q`.
- Positive `d` or `s` is a rightward horizontal shift, in quantity units.
- Original equilibrium: `Q = 50`, `P = 60`.
- Shifted equilibrium: `Q = 50 + (d+s)/2`, `P = 60 + 0.4(d-s)`.
- At a $40 ceiling with original curves: `Qs = 25`, `Qd = 75`, shortage `50`; at most `25` crates trade without another intervention.

The qualitative missions accept any shift in the correct direction with the other curve unchanged. They do not pretend the news establishes an exact shift magnitude. A student's chosen shift determines the illustrated intersection, checked with a 2.5-unit tolerance on each coordinate. The price-ceiling mission requires the specified price and checks quantities with the same tolerance. Coordinates are never scored by screen pixels.

Curves are a forecast representation. The council's ceiling is a policy intervention. The simulation does not model rationing rules, black markets, changes in product quality, policy desirability, or welfare maximization. The small street illustrations provide context, not numerical measures of demand or supply.

## Save and privacy

The versioned `mq-market-shift-prototype-v1` localStorage key retains submitted forecasts, current graph, hints, and completed missions on the same origin. Reload returns to the landing screen with Continue. Play again explicitly replaces that browser run. Corrupt/incompatible saves produce a message and a fresh run. Storage errors leave the current in-memory game playable. No personal identity, network API, analytics, account, or LMS connection is used. Keep a downloaded notebook if durable evidence is needed.

## Verification

```powershell
node --test audit_tools/econ_rpg/game/games/market-shift/model.test.js
node audit_tools/econ_rpg/game/games/market-shift/browser.test.cjs
```

The browser test uses Edge via Playwright. Set `MQ_PLAYWRIGHT_MODULE` to the installed Playwright package if needed, and optionally `MQ_AXE_MODULE` to `axe-core/axe.min.js`. It starts and closes its own temporary server and blocks external requests. The accessibility scanner is served through an intercepted same-origin test URL; the production content security policy remains intact.

Completed: **9 model tests and 6 browser scenarios**. Covered all three missions; incorrect answers and hints; mouse dragging of supply and equilibrium; keyboard range and numeric controls; price-ceiling quantities; saved progress and notebook download; Explore preserving graded attempts; nonbinding and binding ceiling behavior; replay; 390px layout; mobile touch dragging. Small shifts still require a correctly directed change in the student's equilibrium marker. Axe WCAG 2 A/AA and 2.1 AA checks found zero violations on the landing, mission, completed ceiling, and mobile mission views. Screenshots were visually inspected. Local artifacts are in ignored `tmp/market-shift/`.

Remaining: faculty/student playtesting, screen-reader task testing, physical phones, other browsers, and a broader set of missions. Existing games' suites were not rerun because their source and shared files were not modified. Technical verification does not establish learning effectiveness.

## Files and next integration point

- `model.js`: equations, mission definitions, checking and save validation; independently testable.
- `app.js`: scene rendering, graph interactions, progression, feedback and notebook.
- `styles.css`: MQ navy/teal palette, responsive workbench and illustrated market presentation.
- `index.html`: isolated shell with no remote dependencies.

The shared economics functions can support later graph missions in other mini-games. This prototype deliberately does not change the Composer's multiple-choice content contract or the beta collection's declared game count. Release or beta-hub inclusion requires a later explicit decision.
