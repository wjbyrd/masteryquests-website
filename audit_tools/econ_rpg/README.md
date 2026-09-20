# Room to Stay — development economics scenario

Local, unlinked Mastery Quests prototype for instructor QA. **Not a production release.** The intended future release window is October 2026; nothing automatically unlocks or publishes on that date.

## Play locally

From the repository root, with Node 22 or newer:

```powershell
node audit_tools/econ_rpg/serve.mjs
```

Open <http://127.0.0.1:4179>. The preview binds only to loopback and serves only `game/`. Set `PORT` if needed. Keep the command running while playing; Ctrl+C stops it. ES modules need an HTTP preview; do not double-click the HTML file. Saves belong to the browser and exact origin, including port.

## Purpose and cognitive demand

The learner is Linden’s housing advisor, making six policy decisions over two years. The experience assesses applied decisions, causal reasoning, distributional tradeoffs, second-order effects and path dependence. It does not grade retrieval, classify concepts or award an answer score. The loop is decision → consequence → visible state changes → next decision → ending → debrief.

Five ordinal indicators separate affordability for current renters, availability for people seeking housing, quality, budget room and construction incentives. These are illustrative 0–8 steps, not estimated policy magnitudes. There is no common welfare score. Budget zero represents exhausted discretion, not a measured debt balance; further commitments displace other services. All effects clamp to the declared bounds, and the UI reports actual, bounded changes.

## Architecture

| File | Responsibility |
|---|---|
| `game/index.html`, `game/icon.svg` | Semantic standalone shell and local favicon |
| `game/rpg.css` | Mastery Quests navy/teal styling, neighborhood scene layout, mobile layout, focus styles |
| `game/scenes.js`, `game/scenarios/housing-scenes.js` | Read-only visual selection and scenario-owned scene descriptions/conditions |
| `game/art/neighborhood.svg`, `art/build-neighborhood.mjs` | Original local SVG diorama with five shared views, and its reproducible authoring source |
| `game/engine.js` | Immutable state transitions, conditions, ordered outcomes, routing, schema validation and event record helper |
| `game/scenarios/housing-crisis.js` | All economics content, state definitions, branches, endings and instructional metadata |
| `game/storage.js` | Versioned local save, strict deterministic replay validation, reset |
| `game/ui.js` | Safe DOM rendering, structured blocks, state summaries, choices and debrief |
| `game/rpg.js` | Controller, focus/live announcements, local persistence, no-op transition hook |
| `qa.mjs`, `engine.test.mjs` | Exhaustive path exploration and engine/storage regression tests |
| `serve.mjs`, `browser.test.mjs` | Loopback preview and Playwright smoke/branch checks |
| `publication.test.mjs` | Real production build exclusion and protected-file checks |
| `QA-PATHS.md` | Every major branch/ending combination to play manually |

No runtime dependencies, downloaded fonts, analytics, framework or third-party assets. The neighborhood is original local SVG artwork, with meaningful alt text and visible scene labels. Economic consequences and indicators remain the source of instructional meaning.

## Visual refinement and reference status

The latest visual-communication pass brightens architectural surfaces, separates them with stronger outlines, replaces the greenish backdrop with pale sky, and clarifies the waterfront with curved ripples, a timber landing and a moored boat. Occupied windows/queues, worn masonry, the open construction frame and completed housing are more distinct. Each image now has one centered, prominent condition label. Indicator help contains five definitions and one short forecast caveat. A rendered comparison retained the right-hand panel on desktop and the panel below actions on phones; putting it above delayed the phone scene without enlarging it. See [VISUAL-CLARITY-REPORT.md](VISUAL-CLARITY-REPORT.md) for measurements and screenshots. Reproduce the layout comparison with `node audit_tools/econ_rpg/layout-review.mjs` using the same Playwright environment as the browser tests; it never adds a layout switch to gameplay.

The visual direction is a pixel-inspired 2D urban diorama: an elevated oblique neighborhood, crisp edges, flat cel shading, ochre/terracotta/teal facades, apartment windows and balconies, local shops and striped awnings, crossings, bus shelter, parked vehicles, trees, people and a waterfront promenade. There is no 3D runtime, animation, city-building mechanic or remotely loaded asset. The old CSS skyline and its markup were removed.

The approved reference is now available as the attached `codex-clipboard-0b5009a6-5235-44d7-aaed-14bbb1fb83ec.png` and was visually inspected for the latest art pass. Its crisp architectural definition, controlled color, lived-in detail and close framing informed original Linden illustrations. No individual reference building, layout, sign, character or distinctive feature was copied. The reference is not a shipped asset. See [ART-QA-REPORT.md](ART-QA-REPORT.md) for an explicit comparison and [Mastery Quests RPG Art Bible — v1](art/README.md#mastery-quests-rpg-art-bible--v1) for the reusable visual standard.

The SVG contains shared neighborhood groups in `<defs>` and five named `<view>` fragments. `scenes.js` selects a fragment and description from `housing-scenes.js` using the engine's existing declarative conditions. The illustration sits after the current screen heading, so advancing to a new decision keeps both the scene and its associated content in reading order. Nothing is written into a run, and the scene selector cannot change effects, routing or ending eligibility. Version-1 saves remain compatible.

| Scene | Trigger and visual change |
|---|---|
| Existing neighborhood | Initial/default scene; apartments, shops and a small service yard |
| Limited vacancies | Availability ≤3 after at least one choice; applicants outside a lettings office |
| Deferred maintenance | Quality ≤3; scaffolding, boarded windows, worn plaster and repair materials |
| Housing under construction | Earlier permit reform or co-funding, before the final review; crane, unfinished frame and fencing |
| New homes completed | Final review has delivered housing and availability ≥5; apartments replace the service yard |

Selection priority is maintenance → completed homes → construction → limited vacancies → baseline. Maintenance can remain the visible condition even when other construction is occurring; the text and all indicators still describe the whole outcome. A completed-homes image is **not** a balanced-ending or success badge: a fiscal-stress outcome can also have new homes. Construction appears only after an enabling decision; new homes appear only at the review when the model delivers them.

The opening now shows the scenario title, neighborhood and brief housing setup followed by Begin (or the existing resume/review control). Development labels, subtitle, duration/decision-count metadata, no-score and replay explanations, and the repeated privacy footer are absent. Decision progress, save warnings and all substantive economic content remain. See [UI-CLEANUP-REPORT.md](UI-CLEANUP-REPORT.md) for this focused cleanup and its screenshots.

Rebuild the original artwork with `node audit_tools/econ_rpg/art/build-neighborhood.mjs`. The generated SVG is checked in; no generator runs in the browser. Its shared layers now distinguish rear buildings, road traffic, foreground buildings, street furniture and the service yard; this keeps occlusion correct across all five views. Tightened framing and local architectural detail replace empty background space without changing gameplay. The illustration height stays between 200 and 240px at narrow phone widths. See [art/README.md](art/README.md) for provenance/editing notes and [ART-QA-REPORT.md](ART-QA-REPORT.md) for current results; [REFINEMENT-REPORT.md](REFINEMENT-REPORT.md) records the earlier copy/scene-system pass.

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

To add a scenario, author another data module, validate and enumerate it, then change the controller’s scenario import and page title. No engine changes are required. This prototype loads one scenario at a time; no catalog or public entry point is added. Version changes intentionally invalidate old saves; bump the version for changes to effects, routing, wording stored in history or ending rules.

## Branches and endings

Six decisions use seven authored nodes. The initial ceiling route goes to a vacancy lottery/new-lease exemption decision. Assistance and emergency grants go to a coverage decision. Both reconverge at maintenance → supply → next budget → two-year review. Ceiling history changes maintenance prose/severity. Budget gates repair grants and construction subsidies. Supply policy and new-lease exemptions change later completions. Every displayed option is consequential in context, even when an indicator holds steady.

Five endings, in priority order: fiscal stress, shortage/quality deterioration, supply expansion with limited current relief, protected renters with constrained access, and a mixed residual outcome. Priorities are instructional authoring rules, not welfare rankings; overlapping problems appear in the indicators and path debrief. The mixed ending is deliberately not an automatic “win.”

Current exhaustive QA: 200 paths, six decisions each, seven nodes, 17 authored choices, five reachable endings, no dead ends, no orphans and no cycles. See [QA-PATHS.md](QA-PATHS.md) for all 52 combinations of initial policy × allocation/support rule × supply policy × ending. The shorter default CLI report covers all 13 opening-policy/ending combinations.

## Local saves and privacy

Key: `mq.econ-rpg.housing-crisis`. A save includes scenario ID/version, a random local run ID, local start time, phase, current node, final ending if any, indicator state and the decision history. The random run ID identifies only this local run; it is not a fingerprint or stable user identifier. There is no personal data input.

Save on start, after each decision and after each consequence is advanced. The landing page offers resume or outcome review. Reloading a consequence returns to that consequence without applying effects twice. Storage replays every decision and compares the entire reconstructed save before accepting it. A version mismatch or corrupt/illegal save fails safely and offers a fresh start. Storage denial/quota failure leaves the current session playable with a visible warning.

Start over requires an in-game confirmation and replaces only this scenario’s saved run. Replay starts a new ID and pristine state immediately from the ending. Completed debriefs remain reviewable until restart/replay. No cross-device/cloud resume or cross-tab merge; use one tab for a run. Two tabs can overwrite the same local save.

The page loads only its own local files. CSP disallows connections, third-party scripts, forms and remote assets. No fetch, beacon, WebSocket, analytics, worker, cookies or gameplay transmission is implemented. Hosting the whole repository with an unrelated server is outside the publication workflow; keep the prototype local.

## Future event integration

`transitionEvent()` returns a detached plain record with event type, scenario ID/version, run ID, node ID, choice ID, state snapshot and elapsed milliseconds. The controller calls a **no-op** hook for `scenario_start`, `decision_presented`, `decision_selected`, `consequence_viewed`, and `scenario_complete`. There are no subscribers, network requests or separate event logs. Resume may present/view the same node again; a future integration would need its own event identity/deduplication contract. Elapsed time is wall time including time away, not measured active engagement.

## Accessibility and mobile

Semantic headings, native buttons/dialog/details, logical DOM order, skip link, visible gold focus outlines, focus moved to the new heading after each transition, textual arrow/direction labels and a polite live region for indicator changes. Each neighborhood view has descriptive alternative text and a visible condition caption; no economic information is conveyed only by the scene. Minimum 48px action targets, no canvas, no animations, reduced-motion rules and system fonts. State follows decisions in mobile reading order and uses five compact rows, with equal-width bars, numeric levels and signed movement from the latest decision. Movement uses actual bounded changes, survives resume, and clears on restart. One native details control, “What do these indicators mean?”, starts collapsed and contains the five definitions and model caveat. The debrief shows causal summaries and expandable details instead of requiring one long explanation per step.

Playwright checks 320px, 390px and 1280px through all 13 opening/ending combinations, plus a 640px layout check. Each of the five scene images is decoded and captured at the same viewport sizes, with additional caption-free captures. Scene reload/resume and bounded phone framing are checked. Screenshot review covers intro, choices, consequences and debrief. Native Tab/Enter/Space, focus, Escape dismissal and unavailable storage are exercised. Automated browser checks do not replace a screen-reader audit or real-device instructor review.

## Tests and QA tools

```powershell
node --test audit_tools/econ_rpg/engine.test.mjs
node --test audit_tools/econ_rpg/scenes.test.mjs
node --test audit_tools/econ_rpg/publication.test.mjs
node audit_tools/econ_rpg/qa.mjs
node audit_tools/econ_rpg/qa.mjs --all
node audit_tools/econ_rpg/qa.mjs --write tmp/econ-rpg/all-paths.json
node audit_tools/econ_rpg/qa.mjs --manual audit_tools/econ_rpg/QA-PATHS.md

# Follow existing repo convention: set this to your installed Playwright package.
$env:PLAYWRIGHT_MODULE='C:\path\to\node_modules\playwright'
node audit_tools/econ_rpg/browser.test.mjs
```

Chrome is the default browser channel; `BROWSER_CHANNEL` or `BROWSER_EXECUTABLE` can override it. The browser test creates `tmp/econ-rpg/` and stores screenshots plus a results JSON there. That directory is git-ignored and excluded from publication. Create it before using `--write` if the browser test has not run.

The engine suite checks invalid schema mutations, all reachable paths, all phases of exact save/resume, reset/isolation, mismatches, corruption, conditional branches and immutable transitions. The scene suite checks state/path selection, unique SVG/scene IDs, local fragment targets, all five views, delayed construction and byte-equivalence with pre-refinement version-1 saves. Its frozen SHA-256 covers all 200 serialized completed paths; an intentional future content revision requires reviewing that invariant and scenario version. The browser suite exercises 41 complete runs plus focused edge cases; it fails on external requests, CSP violations, page or console errors. All five scene states are decoded, reloaded and captured at 1280px, 390px and 320px, with alt text, image size and distinct-render checks that exclude caption text.

Publication tests rebuild local `dist` using the existing production builder (no deploy). They verify the prototype is absent by path and content and use `git diff` to check protected tracked files. The protected-file assertion assumes a clean baseline; unrelated work in protected paths will cause it to fail until reviewed. Existing site tests can be run with the commands in [IMPLEMENTATION-REPORT.md](IMPLEMENTATION-REPORT.md).

## Publication guard

The whole feature lives under `audit_tools/econ_rpg/`, outside public trees. The existing `audit_tools/public_site_publication/build-dist.mjs` uses an allowlist that omits `audit_tools` and a final explicit prohibition on any `audit_tools/` output. The existing `.assetsignore` also excludes `/audit_tools/**` and `/tmp/**`. These guards were reused without modifying Cloudflare configuration or the publication builder. The regression test runs the real builder and scans the result; it is not merely checking for an unlinked URL. Nothing links this prototype from Games, navigation, the homepage or update history.

Intentional release requires moving reviewed runtime files into an approved public location, explicitly adding a public entry point and updating the staging test/documentation. There is no date switch. Do not publish the source repository directly.

## Content audit and limitations

Reviewed every choice, conditional consequence and ending for consistent direction of effects, natural instructional language, cost-bearing groups, plausible alternatives, nonpartisan framing and absence of moralized grading. Consequences are three concise sentences. No real locality, politicians, empirical estimates or claims of an optimal policy appear. Five indicators cannot represent the full market: migration, credit, land costs, differing rent-control designs, funding sources and heterogeneous owner responses are simplified. Chosen assumptions include a binding ceiling covering future projects, persistent scarce vacancies, rising repair costs and a two-year construction horizon.

200 authored legal paths are mechanically verified, not evidence of predictive validity. Instructor review should focus on assumptions, proportionality of illustrative steps, ceiling/exemption interactions, subsidy targeting, fiscal-ending precedence and whether students infer the distinction between rents and access. This is development work; no deployment, push, remote resource creation or production telemetry integration is part of it.
