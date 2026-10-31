# Price Points

A complete Mastery Quests elasticity game in the unlisted beta collection, built in the visual and interaction family of Market Shift. It has a full-story entry and independent chapter entries. Its Microeconomics card uses the high-street cover artwork.

Play at <https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/price-points/>. Return to Games leads to the same beta collection. The normal public Games page remains unchanged.

Open <http://127.0.0.1:4179/games/price-points/> while the existing preview server is running. To start the preview from the repository root:

```powershell
node audit_tools/econ_rpg/serve.mjs
```

## The learning sequence

The player advises businesses in Linden. An illustrated brief supplies a situation, relevant observations, and one task. The player records a prediction, manipulates the graph, checks the result, and reads a short explanation. A contextual question set follows each chapter. The full story ends with three new transfer cases.

There are nine missions, divided into 16 graph cases where comparisons need separate interactions:

| Chapter | Mission | Cases |
| --- | --- | --- |
| Price & the customer | A weekend offer | Relatively elastic demand; price and revenue |
| | A different kind of customer | Relatively inelastic demand; price and revenue |
| | Same takings, different crowd | Constant unit-elastic demand |
| | Find the turning point | Linear demand, varying point elasticity, linked total revenue |
| | Push it to the limits | Perfectly inelastic demand; perfectly elastic demand facing a seller |
| A connected marketplace | Nearby businesses | Positive and negative cross-price responses |
| | Household choices | Normal necessity-like, normal luxury-like, and inferior responses |
| Can producers respond? | Time at the workshop | Short-run and long-run supply at the same starting price/output |
| | Production at the limits | Unit-elastic supply; perfectly inelastic and perfectly elastic supply |

Each chapter has four follow-up questions with its scenario and graph supplied. Full-story play adds three transfer questions, for 15 questions in total. Students do not need to remember prior scenario facts. Answer order is seeded and stable across reloads; wrong answers receive explanations and allow retries. First answers remain separate from completion after feedback.

The graph studio contains all 16 relationships without changing the saved mission evidence. For income and cross-price exploration, an external-condition slider shifts the illustrated demand curve while the product's own price stays fixed. Price/quantity sliders, numeric fields, pointer dragging, and touch dragging offer equivalent mission controls.

## Economic specification

- Constant-elasticity demand: `Q = Q₀(P/P₀)^(-e)`. The initial elastic, inelastic, and unit cases use `e = 1.6, 0.45, 1`. Narrative groups and observed responses distinguish the markets. Forecasted daily quantities are averages, not claims about fractional individual customers.
- Straight demand: `Q = 2Q* − (Q*/P*)P`. Its revenue maximum is `(P*, Q*)`, where **point** elasticity is one. The current point elasticity appears with the linked revenue graph. The expandable calculation separately labels midpoint elasticity between the start and current observation. At the target, those two measures deliberately differ: one and 5/3.
- Unit-elastic demand is curved with constant receipts; it is not drawn as a 45-degree line. Unit-elastic supply is a straight line through the origin.
- Supply: `Q = Q₀(P/P₀)^e`. Short- and long-run exponents are 0.35 and 1.5, with the same baseline and price change; unit supply uses one. Price is taken as given in these supply exercises. Revenue optimization is not a supply objective.
- Vertical cases keep quantity fixed. The fixed-supply case uses workshop spaces, with matching quantity units.
- Horizontal demand is the idealized demand facing a price-taking seller. Above the going price, quantity demanded is zero. At or below it the simulation does not invent a unique finite quantity or revenue. Horizontal supply receives a specified order quantity; its curve alone does not determine trade.
- Cross-price and income observations use a target signed midpoint coefficient to generate an after quantity, rounded to whole orders. Displayed coefficients are recalculated from those actual observations. Rounded observations retain the correct sign and category across the tested seeds.
- Cross-price/income graphs show a demand shift at a held own price. A parallel downward-sloping scaffold illustrates the rest of the curve; the observations alone establish only the two quantities at the held price. The app explicitly states that distinction in Graph help. Cross-price/income coefficients are never reused as own-price slopes or exponents.
- Elasticity comparisons use the midpoint method. Own-price demand is shown as an absolute magnitude; income and cross-price elasticity retain their signs. No-change comparisons have no measured coefficient, and a nonzero quantity change at zero price change displays infinity.
- Gross receipts are not profit or welfare. There are no cost, market-clearing, or real-estimation claims. Story and numeric variants are fictional teaching models.

Reference checks used the existing At the Box Office faculty guide and OpenStax's [elasticity definitions](https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply), [polar and constant cases](https://openstax.org/books/principles-economics-3e/pages/5-2-polar-cases-of-elasticity-and-constant-elasticity), and [pricing relationship](https://openstax.org/books/principles-economics-3e/pages/5-3-elasticity-and-pricing). All game copy, illustrations, and questions are newly authored.

## Presentation and evidence

The cover introduces the game once, followed by three chapter cards. Briefs use large centered paper panels. Work screens keep one price/quantity/revenue readout, a white SVG graph, one objective, and concise controls. Explanations appear once after submission; calculations and operating help are optional. Story titles do not announce elasticity categories. No countdown or cumulative sales target substitutes for economic reasoning.

Four new local illustrations show the high street, café, neighborhood, and workshop. They follow Linden's civic brick/stone setting and include varied ages and skin tones. Built-in image generation produced the assets; full prompts and provenance are in [assets/ART_DIRECTION.md](assets/ART_DIRECTION.md). The images establish setting; numerical evidence comes from the graph and brief.

## Progress and privacy

`mq-price-points-v1` stores the seeded visit, current stage, input values, first predictions, graph attempts, hints, question attempts, and completed records in localStorage. Reload returns to the cover with Continue. Full-story and individual chapter paths resume at their exact stage. New visits confirm replacement of unfinished work; a plain-text notebook can be downloaded first. Invalid saves fall back to a new visit with a visible notice. If storage is unavailable, the in-memory visit remains playable.

Graph-studio exploration stays separate from saved work. Resetting a graph does not erase attempt or hint history. Completed graphs lock. A completed notebook reports first predictions, first graph attempts without hints, and first quiz answers independently; completion is practice evidence, not a mastery certificate.

There are no remote data calls, accounts, telemetry, analytics, or LMS integration. Images and code load locally. The runtime uses a restrictive same-origin CSP.

## Verification

```powershell
node --test audit_tools/econ_rpg/game/games/price-points/model.test.js
node audit_tools/econ_rpg/game/games/price-points/browser.test.cjs
node audit_tools/econ_rpg/game/games/price-points/edge.test.cjs
node audit_tools/econ_rpg/game/games/price-points/accessibility.test.cjs
```

The browser runner requires Playwright (or `MQ_PLAYWRIGHT_MODULE`) and Edge; `MQ_AXE_MODULE` optionally supplies an existing axe-core script. It starts its own temporary local server, excludes external requests, and does not change the user's preview save. Generated evidence stays in ignored `tmp/price-points/`.

The model suite checks 1,000 scenario seeds, all 16 targets, midpoint symmetry/signs, constant-revenue and revenue-maximum distinctions, horizontal limits, full-story/chapter state transitions, retries, restored progress, malformed saves, and question integrity. Browser checks cover the full desktop story, all three complete phone chapter paths, keyboard/mouse/touch controls, brief reopening, quizzes with retries, free exploration, downloads, reload, corrupted saves, and 320px layout. Accessibility scans use WCAG 2 A/AA and 2.1 AA tags.

The edge suite checks 48 mobile graph positions across every studio model for overlapping text, aligned demand/revenue quantity axes, a 320px graph layout, and playability when storage writes are blocked. Point labels move below high-price points to keep the price heading clear; nearby before/after labels combine without implying the points are identical.

The MQ navy background matches Market Shift. Additional accessibility checks cover a keyboard-only chapter, focus moving to the result after graph submission, descriptive graph values in the browser accessibility tree, announced hints, graph/control contrast, 200% HTML text enlargement with added spacing, 320px reflow, and forced-color graph rendering. These checks are evidence, not a declaration of complete WCAG conformance.

Remaining validation: student/faculty playtesting, physical phones, screen-reader task testing, and browsers beyond Edge. Automated checks do not establish learning effectiveness.

## Release boundary

All source lives under excluded `audit_tools/`. Price Points is explicitly allowed by `games-preview.json`; the beta publisher copies only five HTML/JS/CSS runtime files and four illustrations. Tests, reports, README, and art prompts stay out of the release. The published Market Shift, other games, Composer, main website, and Worker configuration are preserved. The local preview server remains available. See [verification](VERIFICATION.md) and the [collection release report](../../GAMES-PREVIEW-REPORT.md).
