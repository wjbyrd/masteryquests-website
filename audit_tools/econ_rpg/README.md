# Mastery Quests — private economics games

Local, unlinked Mastery Quests prototype for instructor QA. **Not a production release.** The intended future release window is October 2026; nothing automatically unlocks or publishes on that date.

## Play locally

From the repository root, with Node 22 or newer:

```powershell
node audit_tools/econ_rpg/serve.mjs
```

Open <http://127.0.0.1:4179>. The preview binds only to loopback and serves only `game/`. Set `PORT` if needed. Keep the command running while playing; Ctrl+C stops it. ES modules need an HTTP preview; do not double-click the HTML file. Saves belong to the browser and exact origin, including port.

- [Room to Stay](http://127.0.0.1:4179/?scenario=housing-crisis): housing policy; the unchanged default.
- [The Main Attraction](http://127.0.0.1:4179/?scenario=main-attraction): monopoly and market power; development-complete and ready for instructor QA.
- [The Economy’s Edge](http://127.0.0.1:4179/?scenario=ppf): scarcity, production possibilities, recovery and growth; private instructor QA.
- [Megastar Mania](http://127.0.0.1:4179/?scenario=megastar-mania): concert ticket supply and demand; private instructor QA.
- [Gameday Rivals](http://127.0.0.1:4179/?scenario=gameday-rivals): six simultaneous promotion rounds against a seeded, history-dependent delivery rival; private instructor QA.

The four branching RPGs use one engine, controller, renderer, scene selector, storage implementation and debrief framework. Gameday Rivals has its own repeated-strategy engine, controller, view, styles and versioned save. The small `preview.js` entry dispatches to that mode or the unchanged RPG controller. There is no public picker. See [Main Attraction report](MAIN-ATTRACTION-REPORT.md), [its instructor playthroughs](MAIN-ATTRACTION-QA-PATHS.md), [The Economy’s Edge report](PPF-REPORT.md) and [playthroughs](PPF-QA-PATHS.md), [Megastar Mania report](MEGASTAR-MANIA-REPORT.md) and [playthroughs](MEGASTAR-MANIA-QA-PATHS.md), and [Gameday Rivals report](GAMEDAY-RIVALS-REPORT.md) and [seeded seasons](GAMEDAY-RIVALS-QA-PATHS.md).

## Room to Stay purpose and cognitive demand

The learner is Linden’s housing advisor, making six policy decisions over two years. The experience assesses applied decisions, causal reasoning, distributional tradeoffs, second-order effects and path dependence. It does not grade retrieval, classify concepts or award an answer score. The loop is decision → consequence → visible state changes → next decision → ending → debrief.

Five ordinal indicators separate affordability for current renters, availability for people seeking housing, quality, budget room and construction incentives. These are illustrative 0–8 steps, not estimated policy magnitudes. There is no common welfare score. Budget zero represents exhausted discretion, not a measured debt balance; further commitments displace other services. All effects clamp to the declared bounds, and the UI reports actual, bounded changes.

## Architecture

| File | Responsibility |
|---|---|
| `game/index.html`, `game/icon.svg` | Semantic standalone shell and local favicon |
| `game/rpg.css` | Mastery Quests navy/teal styling, neighborhood scene layout, mobile layout, focus styles |
| `game/scenes.js`, `game/scenarios/housing-scenes.js` | Read-only visual selection and scenario-owned scene descriptions/conditions |
| `art/source/`, `game/art/scenes/`, `art/approved-assets.json` | Approved PNG masters, unchanged runtime WebPs and supplied-file checksums |
| `game/engine.js` | Immutable state transitions, conditions, ordered outcomes, routing, schema validation and event record helper |
| `game/scenarios/housing-crisis.js` | All economics content, state definitions, branches, endings and instructional metadata |
| `game/scenarios/registry.js` | Private query routing; missing/unknown IDs fall back to Room to Stay |
| `game/scenarios/main-attraction.js`, `game/scenarios/main-attraction-scenes.js` | Park economics, metadata, branches, endings and six read-only scene conditions |
| `art/main-attraction-assets.json` | Checksums of the twelve supplied park source/runtime files |
| `game/scenarios/ppf.js`, `game/scenarios/ppf-scenes.js` | The Economy’s Edge content, authored production mixes, delayed delivery and four-panel scene conditions |
| `art/ppf-assets.json` | Original paths, hashes and dimensions of twelve supplied economy assets |
| `game/storage.js` | Versioned local save, strict deterministic replay validation, reset |
| `game/ui.js` | Safe DOM rendering, structured blocks, state summaries, choices and debrief |
| `game/rpg.js` | Controller, focus/live announcements, local persistence, no-op transition hook |
| `qa.mjs`, `engine.test.mjs` | Exhaustive path exploration and engine/storage regression tests |
| `serve.mjs`, `browser.test.mjs` | Loopback preview and Playwright smoke/branch checks |
| `publication.test.mjs` | Real production build exclusion and protected-file checks |
| `QA-PATHS.md` | Every major branch/ending combination to play manually |
| `main-attraction-qa.mjs`, `main-attraction.test.mjs`, `main-attraction.browser.test.mjs` | Exhaustive park coverage, save/asset/routing checks and browser QA |
| `MAIN-ATTRACTION-QA-PATHS.md`, `MAIN-ATTRACTION-REPORT.md` | Compact park review set and implementation/validation report |
| `ppf-qa.mjs`, `ppf.test.mjs`, `ppf.browser.test.mjs` | Exhaustive PPF rules, complete branch/scene coverage and browser checks |
| `PPF-QA-PATHS.md`, `PPF-REPORT.md` | Economy playthroughs, modeling assumptions and validation report |
| `game/scenarios/megastar-mania.js`, `megastar-mania-scenes.js`, `megastar-mania-market.js` | Tour content, seven scene conditions and scenario authoring helpers for price-sensitive market comparisons |
| `art/megastar-mania-assets.json` | Original paths, dimensions and hashes of fourteen supplied tour images |
| `megastar-mania-qa.mjs`, `megastar-mania.test.mjs`, `megastar-mania.browser.test.mjs` | Exhaustive tour economics, persistence, scene coverage and browser checks |
| `MEGASTAR-MANIA-QA-PATHS.md`, `MEGASTAR-MANIA-REPORT.md` | Seventeen review routes, model limitations and validation report |

No runtime dependencies, downloaded fonts, analytics, framework or third-party assets. The neighborhood uses five supplied, approved local WebPs; the park uses six in its own namespace. Both have meaningful alt text and visible HTML scene labels. PNG masters stay outside the runtime root. Economic consequences and indicators remain the source of instructional meaning.

## Room to Stay artwork and scene selection

The active artwork consists of five approved 1448 × 1086 WebPs under `game/art/scenes/`. Their canonical full-quality PNG masters remain under `art/source/`. The files were supplied already complete: no generation, conversion, recompression, resizing or pixel editing was performed during integration. SHA-256 checksums recorded before integration are in `art/approved-assets.json` and enforced by the scene tests. The WebPs were found in `art/scenes/` and moved unchanged into the required runtime folder. No file was renamed.

| Scene ID | Runtime file | Existing selection trigger |
|---|---|---|
| baseline | `game/art/scenes/baseline.webp` | Initial/default neighborhood |
| pressure | `game/art/scenes/pressure.webp` | Availability ≤3 after at least one choice |
| maintenance | `game/art/scenes/maintenance.webp` | Quality ≤3 |
| construction | `game/art/scenes/construction.webp` | Prior permit reform/co-funding before final delivery |
| homes | `game/art/scenes/homes.webp` | Final review has delivered housing and availability ≥5 |

Priority remains maintenance → homes → construction → pressure → baseline. Scene IDs, thresholds, history checks and phases are unchanged. `scenes.js` selects the existing variant and renders its direct `src`, description and prominent condition caption. It never mutates a run or save. New housing can coexist with fiscal stress; the artwork is not an economic score.

Images appear after the current heading, at full available card width with automatic height and `object-fit: contain`. Intrinsic width/height attributes match the approved 4:3 files. No crop, filter, maximum-height clamp or mobile minimum-height stretch remains. Display sizes are about 748 × 561px on desktop, 334 × 251px at 390px, and 264 × 198px at 320px. The compact conditions panel remains right on desktop and below actions on phones; short optional help is unchanged. No preload or new asset infrastructure is needed for the measured local switching behavior.

The retired generated SVG and generator have been removed. Historical reports retain their descriptions of previous implementations; they are not the active art workflow. See [APPROVED-ART-INTEGRATION-REPORT.md](APPROVED-ART-INTEGRATION-REPORT.md) for current verification and screenshots, and [Mastery Quests RPG Art Bible — v1](art/README.md#mastery-quests-rpg-art-bible--v1) for the asset workflow. A repository style-reference file was not present during integration; any future `art/reference/neighborhood-style-reference.png` belongs only in development material, never gameplay.

## Scenario schema

The scenario exports a plain data object. Helper functions in the first scenario only construct data; the engine never evaluates string code.

```javascript
{
  id: 'stable-id', version: 1, title: 'Title', subtitle: 'Subtitle',
  role: 'Learner role', duration: 'About 10 minutes', decisions: 6,
  introTitle: 'Your brief', stateTitle: 'Conditions', consequenceTitle: 'What happened',
  endingEyebrow: 'Your outcome',
  introduction: [{ type: 'paragraph', text: 'Introduction' }],
  modelNote: 'What the indicators represent',
  metadata: { concept: '...', learningObjective: '...', misconception: '...' },
  state: {
    budget: { label: 'Budget room', short: 'Meaning', min: 0, max: 8, initial: 5 }
  },
  start: 'first-node',
  nodes: [{
    id: 'first-node', title: 'Decision title', time: 'Month 1',
    scene: [{ type: 'paragraph', text: 'Situation' }], prompt: 'Your decision?',
    variants: [{ when: { chosen: 'earlier.choice' }, scene: [/* blocks */] }],
    unavailableNote: 'Why a conditional option may be absent',
    choices: [{
      id: 'choice', label: 'Button label', detail: 'Short description',
      when: { state: 'budget', op: 'gte', value: 2 }, // optional
      effects: { budget: -2 }, consequence: '2–4 concise sentences.',
      outcomes: [{ when: { chosen: 'earlier.choice' }, effects: { budget: -1 },
                   consequence: 'A replacement consequence.' }],
      next: 'next-node', // or '$end', or an ordered branch array
      mechanism: 'Economic mechanism', tradeoff: 'Who benefits and bears costs',
      whatIf: 'How a different choice could have changed the path'
    }]
  }],
  endings: [{ id: 'ending', title: 'Title', when: {/* condition */}, summary: 'Explanation' },
            { id: 'fallback', title: 'Remaining case', summary: 'Explanation' }],
  debrief: [{ title: 'Instructional lens', text: 'Explanation' }]
}
```

Supported conditions: `{state, op: 'gte'|'lte'|'eq', value}`, `{chosen: 'node.choice'}`, `{all: [...]}`, `{any: [...]}`, `{not: condition}`. Omit `when` for an unconditional choice/outcome/branch. Empty groups and invalid references are rejected.

Choice availability, the first matching node variant and the first matching outcome use **pre-decision** state/history. An outcome adds its effects to the choice’s base effects and replaces its consequence. `next: [{when, target}, {target: 'fallback'}]` uses **post-decision** state/history. Ending conditions use final state; the first match wins. The last ending and last conditional route must be unconditional. `$end` is reserved. Cycles and unreachable structural nodes are rejected; exhaustive QA checks actual state-dependent reachability too.

Content blocks support `paragraph {text}`, `table {caption, headers, rows}` and `image {src, alt, description}`. Image sources must be relative local paths beginning `./` without parent traversal. Tables have semantic captions and column headers. No arbitrary HTML is inserted. Future graphs can be local images with text equivalents or semantic tables, without changing transitions. The current UI’s condition descriptors and step bars are designed for ordinal 0–8 indicators; keep that scale for new scenarios or extend the renderer deliberately.

To add a scenario, author another data module and scene configuration, validate and enumerate it, then register its stable ID in `game/scenarios/registry.js`. The controller resolves `?scenario=…` once on page load; the shared renderer supplies the title and content. Missing or unknown IDs retain the housing default. No engine changes are required, and no catalog or public entry point is added. Version changes intentionally invalidate old saves; bump the version for changes to effects, routing, wording stored in history or ending rules.

## Room to Stay branches and endings

Six decisions use seven authored nodes. The initial ceiling route goes to a vacancy lottery/new-lease exemption decision. Assistance and emergency grants go to a coverage decision. Both reconverge at maintenance → supply → next budget → two-year review. Ceiling history changes maintenance prose/severity. Budget gates repair grants and construction subsidies. Supply policy and new-lease exemptions change later completions. Every displayed option is consequential in context, even when an indicator holds steady.

Five endings, in priority order: fiscal stress, shortage/quality deterioration, supply expansion with limited current relief, protected renters with constrained access, and a mixed residual outcome. Priorities are instructional authoring rules, not welfare rankings; overlapping problems appear in the indicators and path debrief. The mixed ending is deliberately not an automatic “win.”

Current exhaustive QA: 200 paths, six decisions each, seven nodes, 17 authored choices, five reachable endings, no dead ends, no orphans and no cycles. See [QA-PATHS.md](QA-PATHS.md) for all 52 combinations of initial policy × allocation/support rule × supply policy × ending. The shorter default CLI report covers all 13 opening-policy/ending combinations.

## The Main Attraction

The learner is general manager of Starhaven Park, a dominant regional attraction whose land, rides, reputation and large capital requirements limit entry. Families still have other entertainment options. The learning objective is to evaluate monopoly pricing, capacity, investment and segmentation by tracing firm outcomes and consumer access. Choices apply elasticity, marginal revenue versus marginal cost, congestion, screening, resale restrictions, delayed investment and substitute competition.

| Indicator | Initial (0–8) | Meaning |
|---|---|---|
| Park earnings | 5 | Retained operating strength after commitments |
| Guest access | 4 | Ability to afford admission and use the park |
| Guest experience | 5 | Waiting, service and visit quality |
| Park capacity | 4 | Ability to serve guests without congestion |
| Market power | 6 | Pricing strength from differentiation and limited substitutes |

Six decisions cover admission, queues, segmentation, maintenance, investment and competition. Lower admission opens a busy-midway branch; raise/hold opens the steady-midway branch. Both reconverge at segmentation. Prior pricing changes membership receipts and deferred-upkeep losses; retained earnings gate overhaul, expansion and final premium programming. Major construction spends funds at decision 5 and delivers capacity only at decision 6. Maintenance consequences also carry into the next season.

Exhaustive QA covers **665 legal paths**, exactly six decisions per path, seven nodes and 21 node/choice pairs. Five endings are reachable: Running on Reputation (150), Lines Around the Midway (84), Built for the Next Season (123), A Park Worth the Premium (50), and Still the Main Attraction (258). Their first-match precedence selects the headline; it is not a ranking. There is no answer score or designated correct route.

The six approved 1448 × 1086 park WebPs live under `game/art/scenes/main-attraction/`; masters live under `art/source/main-attraction/`. `art/main-attraction-assets.json` records pre-move byte counts and SHA-256 hashes. Ambiguous shared files were moved into this namespace without renaming or changing image bytes. Selection priority is deferred maintenance → delivered expansion → construction → crowding → premium operation → baseline. Access/capacity thresholds are qualitative crowd-pressure proxies, not attendance forecasts. Maintenance can remain visible despite investment; a premium scene does not imply a preferred ending. Full mapping and limitations are in the [report](MAIN-ATTRACTION-REPORT.md).

The nine [manual routes](MAIN-ATTRACTION-QA-PATHS.md) cover all choices, funding gates in both states, conditional consequences, endings and scenes. Park browser QA runs them at 1280px, 390px and 320px, captures intro/decision/consequence/debrief and all six scenes, and checks keyboard/focus, indicators, exact resume, separate saves, errors and requests.

## The Economy’s Edge

The third scenario is economy-driven: a national economic planning director in fictional Calder chooses between household output and capital production. Room to Stay is policy-driven and The Main Attraction is firm-driven. The Economy’s Edge teaches scarcity, increasing opportunity cost, unused resources, recovery and productive investment through six choices, without graphs, formulas or calculation exercises.

Four compact 0–8 indicators replace the other scenarios' five rows automatically through the unchanged shared renderer:

| Indicator | Initial | Interpretation |
|---|---:|---|
| Current consumption | 5 | Current household output and living standards |
| Capital production | 5 | Current equipment, infrastructure and productive investment |
| Resource utilization | 8 | Use of available labor and capital |
| Future growth | 2 | Productive improvements still in preparation |

The six stages are initial allocation, reallocation under pressure, disruption, recovery, investment and final production. Nine nodes allow separate investment choices when slack remains and separate final choices for an unchanged frontier, completed expansion or unfinished recovery. Exhaustive checks cover **361 paths**, six decisions each, 25 node/choice pairs and all five endings. Eleven [manual routes](PPF-QA-PATHS.md) cover every branch, conditional gate and scene.

The PPF consistency rules are explicit: full-utilization reallocation increases one output only by reducing the other; a disruption lowers both through idle resources without destroying capacity; restarts can increase both but never exceed the earlier mix; investment sacrifices household output now for preparation; only completed improvements allow production on a larger frontier. Future growth is a pipeline, not a third output. When completed projects enter use, the pipeline indicator falls even though realized capacity has increased. Recovery alone never triggers the growth scene.

The same supplied four-panel composition persists across balanced, consumption, capital, slowdown, recovery and growth scenes: top left capital goods, top right future improvements, bottom left idle labor/equipment, bottom right household goods. Panels are related economic conditions, not independent sliders. Runtime files remain unchanged at `game/art/scenes/the-economys-edge/`; canonical masters moved outside the served root to `art/source/ppf/`. The [Art Bible](art/README.md) and [report](PPF-REPORT.md) explain selection, asset provenance and limits of the ordinal model.

PPF-specific tests check every reachable phase against the original or expanded production boundary, output tradeoffs, increasing opportunity cost, shock/recovery differences, delayed delivery, exact saves and all three scenario keys. Both earlier scenarios retain frozen full-path outcomes. Browser QA uses 1280px, 390px and 320px and exercises four-row help, keyboard/focus, every scene/ending and separate saves.

## Local saves and privacy

Independent keys: `mq.econ-rpg.housing-crisis`, `mq.econ-rpg.main-attraction` and `mq.econ-rpg.ppf`; all three scenarios currently use version 1. Routing between them preserves their separate saves. A save includes scenario ID/version, a random local run ID, local start time, phase, current node, final ending if any, indicator state and the decision history. The random run ID identifies only this local run; it is not a fingerprint or stable user identifier. There is no personal data input.

Save on start, after each decision and after each consequence is advanced. The landing page offers resume or outcome review. Reloading a consequence returns to that consequence without applying effects twice. Storage replays every decision and compares the entire reconstructed save before accepting it. A version mismatch or corrupt/illegal save fails safely and offers a fresh start. Storage denial/quota failure leaves the current session playable with a visible warning.

Start over requires an in-game confirmation and replaces only this scenario’s saved run. Replay starts a new ID and pristine state immediately from the ending. Completed debriefs remain reviewable until restart/replay. No cross-device/cloud resume or cross-tab merge; use one tab for a run. Two tabs can overwrite the same local save.

The page loads only its own local files. CSP disallows connections, third-party scripts, forms and remote assets. No fetch, beacon, WebSocket, analytics, worker, cookies or gameplay transmission is implemented. Hosting the whole repository with an unrelated server is outside the publication workflow; keep the prototype local.

## Future event integration

`transitionEvent()` returns a detached plain record with event type, scenario ID/version, run ID, node ID, choice ID, state snapshot and elapsed milliseconds. The controller calls a **no-op** hook for `scenario_start`, `decision_presented`, `decision_selected`, `consequence_viewed`, and `scenario_complete`. There are no subscribers, network requests or separate event logs. Resume may present/view the same node again; a future integration would need its own event identity/deduplication contract. Elapsed time is wall time including time away, not measured active engagement.

## Accessibility and mobile

Semantic headings, native buttons/dialog/details, logical DOM order, skip link, visible gold focus outlines, focus moved to the new heading after each transition, textual arrow/direction labels and a polite live region for indicator changes. Each neighborhood view has descriptive alternative text and a visible condition caption; no economic information is conveyed only by the scene. Minimum 48px action targets, no canvas, no animations, reduced-motion rules and system fonts. State follows decisions in mobile reading order and uses five compact rows, with equal-width bars, numeric levels and signed movement from the latest decision. Movement uses actual bounded changes, survives resume, and clears on restart. One native details control, “What do these indicators mean?”, starts collapsed and contains the five definitions and model caveat. The debrief shows causal summaries and expandable details instead of requiring one long explanation per step.

Playwright checks 320px, 390px and 1280px through all 13 opening/ending combinations, plus a 640px layout check. Each of the five scene images is decoded and captured at the same viewport sizes, with additional caption-free captures. Scene reload/resume, intrinsic dimensions, uncropped aspect ratio and compact phone display are checked. Screenshot review covers intro, choices, consequences and debrief. Native Tab/Enter/Space, focus, Escape dismissal and unavailable storage are exercised. Automated browser checks do not replace a screen-reader audit or real-device instructor review.

## Tests and QA tools

```powershell
node --test audit_tools/econ_rpg/engine.test.mjs
node --test audit_tools/econ_rpg/scenes.test.mjs
node --test audit_tools/econ_rpg/main-attraction.test.mjs
node --test audit_tools/econ_rpg/ppf.test.mjs
node --test audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/qa.mjs
node audit_tools/econ_rpg/qa.mjs --all
node audit_tools/econ_rpg/qa.mjs --write tmp/econ-rpg/all-paths.json
node audit_tools/econ_rpg/qa.mjs --manual audit_tools/econ_rpg/QA-PATHS.md
node audit_tools/econ_rpg/main-attraction-qa.mjs
node audit_tools/econ_rpg/main-attraction-qa.mjs --write
node audit_tools/econ_rpg/ppf-qa.mjs --write

# Follow existing repo convention: set this to your installed Playwright package.
$env:PLAYWRIGHT_MODULE='C:\path\to\node_modules\playwright'
node audit_tools/econ_rpg/browser.test.mjs
node audit_tools/econ_rpg/main-attraction.browser.test.mjs
node audit_tools/econ_rpg/ppf.browser.test.mjs
```

Chrome is the default browser channel; `BROWSER_CHANNEL` or `BROWSER_EXECUTABLE` can override it. The browser test creates `tmp/econ-rpg/` and stores screenshots plus a results JSON there. That directory is git-ignored and excluded from publication. Create it before using `--write` if the browser test has not run.

The engine suite checks invalid schema mutations, all reachable paths, all phases of exact save/resume, reset/isolation, mismatches, corruption, conditional branches and immutable transitions. The scene suite checks state/path selection, five unique IDs and exact WebP mappings, file signatures, unchanged PNG/WebP checksums, absence of obsolete runtime URLs, delayed construction and byte-equivalence with pre-refinement version-1 saves. Its frozen SHA-256 covers all 200 serialized completed paths; an intentional future content revision requires reviewing that invariant and scenario version. The browser suite exercises 41 complete runs plus focused edge cases; it fails on external requests, CSP violations, page or console errors. All five scene states are decoded, reloaded and captured at 1280px, 390px and 320px, with alt text, image size and distinct-render checks that exclude caption text.

Publication tests rebuild local `dist` using the existing production builder (no deploy). They verify the prototype is absent by path and content and use `git diff` to check protected tracked files. The protected-file assertion assumes a clean baseline; unrelated work in protected paths will cause it to fail until reviewed. Existing site tests can be run with the commands in [IMPLEMENTATION-REPORT.md](IMPLEMENTATION-REPORT.md).

## Publication guard

The whole feature lives under `audit_tools/econ_rpg/`, outside public trees. The existing `audit_tools/public_site_publication/build-dist.mjs` uses an allowlist that omits `audit_tools` and a final explicit prohibition on any `audit_tools/` output. The existing `.assetsignore` also excludes `/audit_tools/**` and `/tmp/**`. These guards were reused without modifying Cloudflare configuration or the publication builder. The regression test runs the real builder and scans the result; it is not merely checking for an unlinked URL. Nothing links this prototype from Games, navigation, the homepage or update history.

Intentional release requires moving reviewed runtime files into an approved public location, explicitly adding a public entry point and updating the staging test/documentation. There is no date switch. Do not publish the source repository directly.

## Room to Stay content audit and limitations

Reviewed every choice, conditional consequence and ending for consistent direction of effects, natural instructional language, cost-bearing groups, plausible alternatives, nonpartisan framing and absence of moralized grading. Consequences are three concise sentences. No real locality, politicians, empirical estimates or claims of an optimal policy appear. Five indicators cannot represent the full market: migration, credit, land costs, differing rent-control designs, funding sources and heterogeneous owner responses are simplified. Chosen assumptions include a binding ceiling covering future projects, persistent scarce vacancies, rising repair costs and a two-year construction horizon.

200 authored legal paths are mechanically verified, not evidence of predictive validity. Instructor review should focus on assumptions, proportionality of illustrative steps, ceiling/exemption interactions, subsidy targeting, fiscal-ending precedence and whether students infer the distinction between rents and access. This is development work; no deployment, push, remote resource creation or production telemetry integration is part of it.

## Megastar Mania model and QA

`megastar-mania`, version 1, has six decisions over seven reachable nodes: opening price; breakout pricing (with an alternate opening after a surplus); supply expansion; illness; interview response; crossover. Its five underlying 0–8 states are displayed as Fan Interest, Ticket Supply, Tour Revenue, Fan Goodwill and Career Momentum. Fan Interest and Ticket Supply use qualitative labels, without comparable numeric totals; a separate Ticket Market gauge shows the price-sensitive result. It is a derived display, not a sixth saved state. The title has no subtitle.

Demand records preference strength, not attendance. The earlier price choices persist in history. A small scenario authoring helper combines that price history with demand and available capacity to build ordinary engine conditions for surplus, balance and shortage. This introduces neither a sixth saved indicator nor a separate transition engine. It keeps price changes distinct from demand shifts, and capacity changes distinct from audience growth. No model formulas, graphs, definitions quiz or answer grades appear during play.

Revenue is an ordinal indicator of financial strength from ticket receipts after refunds, not profit or a currency estimate. At fixed prices, later demand/capacity changes affect receipts only when actual ticket sales change; more willing buyers cannot raise receipts if all available seats already sell. Price-setting outcomes are authored illustrations, not elasticity estimates. Logistics and the artist’s recovery have tradeoffs beyond receipts. Every path remains illustrative rather than predictive.

The final outcomes are Reputation on the Ropes, Too Big, Too Fast, Crossover Superstar, Sold Out Everywhere, Built for the Crowd, Intimate by Choice and A Smaller Circuit. Intimate by Choice recognizes a deliberately limited tour with strong preference demand and no shortage at the posted price; A Smaller Circuit retains more modest-demand paths. Outcomes are not ranked. All 729 legal paths have six decisions. The generated 17-route guide covers every reachable conditional consequence, all choices, seven scenes and seven endings.

```powershell
node audit_tools/econ_rpg/megastar-mania-qa.mjs --write
node --test audit_tools/econ_rpg/megastar-mania.test.mjs
node --test audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/main-attraction.test.mjs audit_tools/econ_rpg/ppf.test.mjs audit_tools/econ_rpg/megastar-mania.test.mjs audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/megastar-mania.browser.test.mjs
```

The browser script uses the same Playwright installation configuration as the earlier browser suites (`PLAYWRIGHT_MODULE` when not installed locally). It writes ignored screenshots and results to `tmp/econ-rpg/megastar-mania/`; it does not deploy. The publication test rebuilds local generated `dist/` and checks exclusion of all four scenarios and all 48 approved asset hashes. See the [report](MEGASTAR-MANIA-REPORT.md) for results and [manual paths](MEGASTAR-MANIA-QA-PATHS.md) for instructor review.
