# Market Shift — private graph-game prototype

A local, unlinked Mastery Quests mini-game. The public game library, beta hub, preview allowlist, Composer, existing games, and manuscript are unchanged. Nothing in this update was published.

## Open

From the repository root:

```powershell
node audit_tools/econ_rpg/serve.mjs
```

Open <http://127.0.0.1:4179/games/market-shift/>. Keep the server running while playing; Ctrl+C stops it. The development server binds to loopback. Use HTTP, not a file URL, because the game uses ES modules. Refresh an already-open prototype to load the update.

## Enter Linden, forecast, then explain

The illustrated splash shows the game title and entry choices once, without a repeated mission list. Enter Linden opens a standalone **Linden Bulletin** with the event and its illustration. **Make your forecast** then opens the graph. The player is the market analyst in Linden; each run follows the same progression with different news:

1. **Demand:** an increase or decrease in demand, with supply unchanged.
2. **Supply:** an increase or decrease in supply, with demand unchanged.
3. **Both together:** demand and supply shift in the same direction. Quantity has a predictable direction; price depends on relative shift sizes.
4. **Opposing shifts:** demand and supply shift in opposite directions. Price has a predictable direction; quantity depends on relative shift sizes.
5. **Price control:** a binding ceiling or floor, with an explicit legal price and no government purchases.

There are four authored stories per shift family and three numerical variants per policy type: **16 shift stories plus 6 price-control variants**. The first policy type is randomly selected. Play new scenarios excludes each immediately preceding shift story and alternates ceiling/floor. A saved seed, scenario IDs, and quiz answer order keep the same run stable across reloads. Each mission starts with the original market.

The mission strip uses short story titles, such as **Festival day** and **Storm watch**, instead of announcing the curve type. Each new mission opens its bulletin before the forecast board. The board keeps a short headline, the changing market illustration, graph, and compact controls. **Read bulletin** reopens the event without changing attempts or hints. Optional operating instructions and click-placement tools live inside **Graph help**. Economic hints remain a separate, recorded action.

Drag a curve or its D/S handle horizontally. Drag E₁ to place the forecast equilibrium, the purple label to change the legal price, or Qs/Qd to read quantities. Native range and number controls offer the same actions with a keyboard. Sliders show a signed displacement, without repeated left/right labels; screen readers receive explicit direction descriptions. Picking up an offset label does not jump its value. A selected click-placement tool can place a marker directly on a curve intersection.

The white graph has crisp vector lines, separate curve-name gutters, and staggered quantity labels. One set of editable fields above the graph doubles as the live price/quantity readout, including changes from the original equilibrium. There is no second set of coordinate fields in the side panel. In missions these values describe the student's forecast; free exploration calculates the actual intersection automatically. Price-control missions put offered/wanted quantities above the graph and the legal-price slider in the side panel.

Each submitted forecast gets targeted feedback. Hints, retries, and reset preserve attempt history. Completed missions lock and show a short economic debrief. Simultaneous-shift debriefs distinguish a plausible drawn case from what the news alone establishes.

After all five missions, a **five-question debrief quiz** presents the relevant bulletin title and event facts alongside every question. Students reason from those facts rather than having to remember which story involved a particular shift. The question header does not reveal the curve category or solution; explanations appear after an answer. The quiz covers curve shifts versus movements along a curve, ambiguous outcomes with simultaneous shifts, and shortages or surpluses. Answer order is shuffled once per run. Incorrect answers receive explanations and allow another choice; a correct answer unlocks the next question. First responses remain separate from retries. Quiz progress survives reloads.

The notebook records all forecasts, hints, explanations, and quiz responses. Its text download is practice evidence, not an authenticated grade or a Class Answer Analysis import.

**Explore freely** supports both ceilings and floors, alongside demand/supply shifts. It never modifies the mission notebook. Nonbinding policies leave equilibrium trade unchanged. Quantities above 100 are labeled as outside the graph, without plotting a false intersection at 100.

## Model and interpretation

Price is dollars per crate; quantity is crates per market day. The illustrative competitive model is:

- Inverse demand: `P = 100 + 0.8d - 0.8Q`.
- Inverse supply: `P = 20 - 0.8s + 0.8Q`.
- Positive `d` or `s` means a horizontal shift right, in quantity units.
- Original equilibrium: `Q = 50`, `P = 60`.
- Shifted equilibrium: `Q = 50 + (d+s)/2`, `P = 60 + 0.4(d-s)`.
- A $40 ceiling yields `Qs = 25`, `Qd = 75`, shortage `50`; at most `25` crates trade.
- An $80 floor yields `Qs = 75`, `Qd = 25`, surplus `50`; without government purchases, at most `25` crates trade.

Qualitative missions accept any correctly directed shift, including unequal simultaneous shifts. The student's chosen magnitudes determine the illustrated intersection. Checks use a 2.5-unit tolerance on each coordinate and require consistent directions of change from the baseline. When an equilibrium coordinate is unchanged, it must remain within 0.5 units of that baseline coordinate. Price-control missions require the specified legal price and check quantities with a 2.5-unit tolerance. Scoring does not depend on screen pixels.

The simulation does not model rationing rules, black markets, product-quality changes, welfare maximization, or policy desirability. Street illustrations provide context, not numerical measures of supply or demand.

## Save and privacy

The `mq-market-shift-prototype-v2` localStorage key retains the exact scenario plan, current graph, forecasts, hints, and quiz history on the same origin. The earlier three-mission v1 save is left untouched. Reload opens the splash with Continue. The saved `bulletinRead` flag resumes an unopened bulletin or the forecast board as appropriate. Earlier v2 saves migrate in memory to keep their existing place; no attempts or quiz history are discarded. Play new scenarios explicitly replaces the v2 run. Corrupt or incompatible saves produce a message and a fresh run. Storage errors leave the in-memory game playable.

No personal identity, network API, analytics, account, or LMS connection is used. Download the notebook for a durable copy.

## Verification

```powershell
node --test audit_tools/econ_rpg/game/games/market-shift/model.test.js
node audit_tools/econ_rpg/game/games/market-shift/browser.test.cjs
```

The browser test uses Edge via Playwright. Set `MQ_PLAYWRIGHT_MODULE` to an installed Playwright package if needed, and optionally `MQ_AXE_MODULE` to `axe-core/axe.min.js`. It starts and closes its own temporary server and blocks external requests. The accessibility scanner is served through an intercepted same-origin test URL; runtime CSP remains intact.

Verification includes **12 model tests and 7 end-to-end browser scenarios**. Coverage includes all 22 scenario variants; unequal simultaneous shifts and ambiguous outcomes; policy quantities and nonbinding rules; repeat avoidance and alternating policies; corrupt saves; bulletin state and compatibility with earlier v2 saves; splash-to-bulletin-to-forecast progression; reopening the bulletin without changing evidence; mouse dragging and live fields before pointer release; keyboard graph controls; both full five-mission routes; quiz context matching every played event; retries, reload, and randomized answer order; evidence export; exploration isolation; 390px layout; coincident quantity labels and extreme prices; and mobile touch dragging. No browser runtime errors occurred. Axe WCAG 2 A/AA and 2.1 AA checks found zero violations across ten views. Desktop and mobile screenshots were visually inspected. Local artifacts are in ignored `tmp/market-shift/` (latest screenshots use the `entry-` prefix).

Remaining: faculty/student playtesting, screen-reader task testing, physical phones, and other browsers. Existing games' suites were not rerun because their source and shared files were not modified. Technical verification does not establish learning effectiveness.

## Files and release boundary

- `model.js`: market equations, scenario bank, seeded run generation, forecast checks, quiz, bulletin state, save validation.
- `graph.js`: graph geometry, label layout, vector rendering.
- `scene.js`: illustrated market scene and contextual variants.
- `app.js`: interactions, progression, feedback, notebook and export.
- `styles.css`: MQ navy/teal presentation, white graph, responsive workbench and quiz.
- `index.html`: isolated shell without remote dependencies.

The prototype remains under the excluded `audit_tools/` tree and is not in the beta-game manifest or hub. Release or beta inclusion requires a later explicit decision.
