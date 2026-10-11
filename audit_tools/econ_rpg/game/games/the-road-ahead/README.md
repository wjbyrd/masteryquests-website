# The Road Ahead — Mini-game 17

Chapter-based board-game prototype, revised October 11, 2026. Buildless HTML/CSS/JavaScript. Local preview only; no backend or public deployment.

## Play model

Four connected districts: College, Job Market, Working World, Real World. Each chapter gives exactly three activity turns. Roll once to reveal circumstances, then choose where to learn, earn, connect, or recover. The character walks to that physical destination and the visit spends one turn. Repeated visits are allowed; the limited calendar creates the opportunity cost.

Dice change circumstances and payoffs, never movement distance or access to essential events. Six conditions include a bill, extra fatigue, an ordinary week, better-paid work, more available contacts, and better learning/recovery. All immediate activity costs and benefits appear before committing. A chosen activity resolves on arrival; no extra confirmation or card draft is required.

Milestones arrive on the calendar:

| Chapter | Scheduled sequence |
| --- | --- |
| College | One activity → Honors application and effort choice → two more activities → graduation assessment and summer choice |
| Job market | Recruiting-center offer → three activities → employment contract |
| Working world | Effort allocation under that contract → three activities → performance review |
| Real world | Transport purchase and insurance → three activities → precautions, exposure outcome, housing, and final review |

Milestones and follow-up decisions use no activity turns and require no movement roll. Activity benefits, costs, credentials, and real skills carry into subsequent decisions. Major events still have imperfect information, real costs, probabilistic consequences, and coherent fallback paths. Negative finances never block progression.

The opening remains title, Play/Continue, and How to Play. Character selection is separate. Four original native 48×72 sprites retain directional walking, idle, and reaction poses. The map shows 24 named locations with paths connecting each district’s destinations. Three turn markers, money, and well-being replace dice-distance tracking. Detailed attributes and decision history stay in the optional Character dialog.

## Economics behind play

Gameplay uses ordinary offers, prices, promises, costs, and consequences. It does not label active encounters as adverse selection, moral hazard, asymmetric information, or principal–agent problems. The personalized final review names those mechanisms and relates them to the actual history.

- **Screening:** Honors and employers use GPA, recommendations, credentials, internships, and work samples. Their functions never receive hidden aptitude, discipline, or true skill. Character development changes actual outcomes and visible evidence through separate channels.
- **Adverse selection:** the recruiting wage changes which workers remain in the pool. In the car market, a common $3,000 offer drives four sound-car owners out, leaving 2 sound cars among 8 sellers. That remaining composition sets the actual 25% sound-car prior used when generating the budget car. Certification changes participation and pricing. Full insurance attracts the higher-risk half of the comparison population under the modeled premium and deductible.
- **Hidden action and incentives:** an Honors payment precedes a private effort choice and later assessment. A salary or commission agreement precedes the work allocation decision; recorded sales affect pay or promotion while service quality remains imperfectly observed. A later audit catches service quality with 65% probability. Insurance is chosen before precautions; deductibles alter the private benefit of care, which changes loss probability without guaranteeing an accident.
- **Information:** a purchased car inspection is 80% accurate and updates beliefs without redrawing the vehicle’s underlying quality. A former employee’s report is useful but imperfect. Warranties and repair clauses shift costs with limitations.
- **Time and opportunity cost:** only twelve activities fit into a journey. Their history records alternatives passed up, circumstances, exact attribute and signal changes, and delayed consequences. The final review includes actual time use alongside skill, money, reputation, career, well-being, and decision quality versus luck.

Declining Honors or insurance is a valid path. The review does not claim those agreements existed when they did not, or equate uninsured risk-taking with insurance moral hazard. Every run still encounters market participation and workplace incentive mechanisms. Endings follow outcomes, not archetypes.

All amounts and probabilities are fictional teaching parameters. Attributes are bounded 0–100 indices. Money includes liabilities and accumulated net resources; each major work period represents six months, with simplified after-cost savings of 13% of annual salary plus retained commission. Activity shifts are supplemental work and consume a turn and energy. No interest model or outbound telemetry is introduced.

## Files and persistence

| File | Responsibility |
| --- | --- |
| `data.js` | Characters, baselines, districts, 24 physical locations, constants |
| `chapters.js` | Activity choices, three-turn calendars, milestone timing, circumstances, effects |
| `engine.js` | Guarded action sequence, destination walking, activity resolution, history and replay |
| `events.js` | Concise player-facing milestone choices |
| `consequences.js`, `markets.js` | Economic effects, screening, market composition, hidden action, risk |
| `random.js` | Serializable seeded randomness and probability draws |
| `board.js`, `characters.js` | District map, camera, walking and native pixel characters |
| `app.js`, `style.css` | Title, selection, game, dialogs, accessible controls and final review |
| `debrief.js` | Mechanisms explained using actual decisions and outcomes |
| `storage.js` | Versioned save and graceful storage failure |

The chapter rebuild uses version 3 and `mq.road-ahead.save.v3`. It starts a fresh journey. Earlier v1/v2 board saves remain untouched under their original keys and are not replayed under the new calendar rules. The title explains this when an earlier v2 save exists and no v3 run has begun.

The current save includes chapter, used turns, committed destination and pending waypoints, rolled circumstances, milestone/follow-up state, attributes, private circumstances, history, RNG, and action journal. Restore rebuilds the run deterministically and rejects altered or malformed state. Failed storage permits in-memory play. A result reload cannot spend another turn or collect benefits again.

Keyboard and touch controls share the same actions. Native dialogs contain focus and restore it on close. Live announcements provide location, turn count, circumstance and outcome text. Reduced motion preserves results and turn costs. Overview fits all four districts; normal camera mode follows the character. Anonymous events remain in the local save.

## Verification executed

- `node --test audit_tools/econ_rpg/road-ahead.test.mjs`: **20 passing tests**. Calendar budgets; player-chosen destinations; same-location visits; every activity/circumstance effect; no repeated awards; checkpoint order; agreement-before-effort; observable-only screening; market participation; character effects; inspections and policy exposure; hidden terminology during play; all save phases; retained older saves; financial shortfalls.
- **400 completed simulated journeys**, 100 per character: all twelve visits and all scheduled economic sequences completed in every run. All six ending profiles and 52 event/choice combinations occurred, with 5 final shortfalls, 62 rejected Beacon applications, and 59 Honors admissions. Mean final money: Natural $11,279; Grinder $11,153; Connector $10,754; Juggler $10,604. These runs validate coverage and variation, not exhaustive balance or measured human enjoyment.
- Browser checks in installed Chrome: all four characters completed; simple title and selection, keyboard/focus, choice planning, mid-walk reload, circumstance reload without reroll, result reload without duplicate turns, scheduled Honors without a movement roll, export, older-save preservation, blocked storage, corrupt-save recovery, and reduced motion passed. Desktop 1440px, mobile 390px, narrow 320px had no page overflow; inspected screenshots show readable costs and destinations. No browser errors.
- Packaged preview test checks the 17-game hub → game → hub route and runtime files, including `chapters.js`. It does not deploy the site.

Run the existing preview with `node audit_tools/econ_rpg/serve.mjs` and open `http://127.0.0.1:4179/games/the-road-ahead/`. `?seed=42` reproduces circumstances when actions match. Browser tests use `PLAYWRIGHT_MODULE` to access the existing bundled Playwright and installed Chrome. Generated screenshots, statistics, and browser results are under ignored `tmp/econ-rpg/road-ahead/`.

Remaining evaluation: human playtesting of pacing and comprehension, physical-device and screen-reader testing, and further visual polish. Existing game implementations remain unchanged.
