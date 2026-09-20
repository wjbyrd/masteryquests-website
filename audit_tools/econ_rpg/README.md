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
| `game/rpg.css` | Mastery Quests navy/teal styling, CSS city illustration, mobile layout, focus styles |
| `game/engine.js` | Immutable state transitions, conditions, ordered outcomes, routing, schema validation and event record helper |
| `game/scenarios/housing-crisis.js` | All economics content, state definitions, branches, endings and instructional metadata |
| `game/storage.js` | Versioned local save, strict deterministic replay validation, reset |
| `game/ui.js` | Safe DOM rendering, structured blocks, state summaries, choices and debrief |
| `game/rpg.js` | Controller, focus/live announcements, local persistence, no-op transition hook |
| `qa.mjs`, `engine.test.mjs` | Exhaustive path exploration and engine/storage regression tests |
| `serve.mjs`, `browser.test.mjs` | Loopback preview and Playwright smoke/branch checks |
| `publication.test.mjs` | Real production build exclusion and protected-file checks |
| `QA-PATHS.md` | Every major branch/ending combination to play manually |

No runtime dependencies, fonts, analytics, framework or third-party assets. City art is decorative CSS. Future meaningful figures use structured image blocks with alt text and descriptions.

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

Semantic headings, native buttons/dialog/details, logical DOM order, skip link, visible gold focus outlines, focus moved to the new heading after each transition, textual arrow/direction labels and a polite live region for indicator changes. Decorative city art is hidden from assistive technology. Minimum 48px action targets, no canvas, no animations, reduced-motion rules, self-hosted system fonts. State follows decisions in mobile reading order and uses two compact columns. The debrief shows causal summaries and expandable details instead of requiring one long explanation per step.

Playwright checks 320px and 1280px through all 13 opening/ending combinations plus 390px/640px layout checks. Screenshot review covers intro, choices, consequences and debrief. Native Tab/Enter/Space, focus, Escape dismissal and unavailable storage are exercised. Automated browser checks do not replace a screen-reader audit or real-device instructor review.

## Tests and QA tools

```powershell
node --test audit_tools/econ_rpg/engine.test.mjs
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

The engine suite checks invalid schema mutations, all reachable paths, all phases of exact save/resume, reset/isolation, mismatches, corruption, conditional branches and immutable transitions. The browser suite exercises 28 complete runs plus focused edge cases; it fails on external requests, CSP violations, page or console errors.

Publication tests rebuild local `dist` using the existing production builder (no deploy). They verify the prototype is absent by path and content and use `git diff` to check protected tracked files. The protected-file assertion assumes a clean baseline; unrelated work in protected paths will cause it to fail until reviewed. Existing site tests can be run with the commands in [IMPLEMENTATION-REPORT.md](IMPLEMENTATION-REPORT.md).

## Publication guard

The whole feature lives under `audit_tools/econ_rpg/`, outside public trees. The existing `audit_tools/public_site_publication/build-dist.mjs` uses an allowlist that omits `audit_tools` and a final explicit prohibition on any `audit_tools/` output. The existing `.assetsignore` also excludes `/audit_tools/**` and `/tmp/**`. These guards were reused without modifying Cloudflare configuration or the publication builder. The regression test runs the real builder and scans the result; it is not merely checking for an unlinked URL. Nothing links this prototype from Games, navigation, the homepage or update history.

Intentional release requires moving reviewed runtime files into an approved public location, explicitly adding a public entry point and updating the staging test/documentation. There is no date switch. Do not publish the source repository directly.

## Content audit and limitations

Reviewed every choice, conditional consequence and ending for consistent direction of effects, natural instructional language, cost-bearing groups, plausible alternatives, nonpartisan framing and absence of moralized grading. Consequences are three concise sentences. No real locality, politicians, empirical estimates or claims of an optimal policy appear. Five indicators cannot represent the full market: migration, credit, land costs, differing rent-control designs, funding sources and heterogeneous owner responses are simplified. Chosen assumptions include a binding ceiling covering future projects, persistent scarce vacancies, rising repair costs and a two-year construction horizon.

200 authored legal paths are mechanically verified, not evidence of predictive validity. Instructor review should focus on assumptions, proportionality of illustrative steps, ceiling/exemption interactions, subsidy targeting, fiscal-ending precedence and whether students infer the distinction between rents and access. This is development work; no deployment, push, remote resource creation or production telemetry integration is part of it.
