# Economics RPG implementation report — 19 September 2026

**Development-complete and ready for instructor QA. Not production-ready.**

Room to Stay is a standalone, local-only housing-policy scenario: six consequential decisions, visible consequences, five ordinal conditions, five endings, a causal path debrief and replay. The runtime is isolated under `audit_tools/econ_rpg/game/`. Nothing was added to a public page.

## Files and architecture

Added under `audit_tools/econ_rpg/`:

- Runtime: `game/index.html`, `game/package.json`, `game/icon.svg`, `game/engine.js`, `game/storage.js`, `game/ui.js`, `game/rpg.js`, `game/rpg.css`, `game/scenarios/housing-crisis.js`.
- QA/local tooling: `serve.mjs`, `qa.mjs`, `engine.test.mjs`, `browser.test.mjs`, `publication.test.mjs`.
- Documentation: `README.md`, `QA-PATHS.md`, `IMPLEMENTATION-REPORT.md`.

Modified only `.gitignore` to exclude generated `tmp/econ-rpg/` screenshots and QA output. The publication check rebuilt ignored `dist/` locally; it did not deploy it.

The engine is pure immutable JavaScript with declarative conditions and no eval. Scenario data owns copy, effects, conditional availability, outcome variants, routes, ending eligibility and instructional metadata. Storage reconstructs legal transitions before accepting saves. Rendering and controller code are separate. Structured paragraphs, semantic tables and described local images support future scenarios without adding a framework.

Schema fields and exact ordering rules are documented in [README.md](README.md). Stable scenario identity is `housing-crisis`, version `1`. Conditional outcomes inspect pre-choice state, routing sees post-choice state, and endings use ordered first-match eligibility. Cycles are rejected.

## State and branching

| Indicator | Initial step | Instructional meaning |
|---|---:|---|
| Renter affordability | 2 | Relief for current renters |
| Housing availability | 3 | Access for people looking for housing |
| Housing quality | 5 | Maintenance of existing homes |
| Budget room | 7 | Capacity for additional public commitments |
| Construction incentive | 3 | Willingness to supply new rental homes |

All use 0–8 ordinal steps, with bounds disclosed. These are not estimates or a combined score.

The first intervention branches into vacancy allocation (ceiling) or assistance coverage (other policies), then reconverges at maintenance, supply, next-year funding and two-year review. Early ceilings worsen selected maintenance outcomes; new-lease exemptions alter the later construction response. Budget gates grants and construction subsidies. Permits/subsidies change completion effects at the final decision, rather than instantly adding housing at commitment.

| Ending | Exhaustive paths |
|---|---:|
| Relief with a funding gap | 92 |
| A lease worth holding onto | 8 |
| More homes, a difficult transition | 19 |
| Stability for some, a wait for others | 29 |
| Room to move, work still ahead | 52 |

These counts describe authored branches, not probabilities or policy effectiveness. Fiscal stress takes precedence when conditions overlap. The residual mixed ending is not labeled a win.

## Saves, privacy and accessibility

Automatic localStorage saves after start, each choice and each consequence advance. Reload can resume either a pending decision or a consequence; completed outcomes can be reopened. Strict identity/version/path/state checks reject incompatible or damaged records safely. Restart clears only this scenario; replay creates fresh state and a new local run ID. Blocked storage displays a warning while play continues in memory.

No accounts, identifying inputs, remote logs, analytics or network telemetry. CSP blocks connections and remote assets. The future transition hook is a no-op; event-shaped records never leave the controller or create a separate log.

Semantic HTML, native controls, skip link, visible focus, focus transfer to each new heading, live indicator announcements, textual state directions, reduced-motion handling and 48px minimum actions. A CSS city illustration supplies atmosphere without inaccessible canvas content. Mobile decisions precede a compact state panel; debrief details expand individually.

## Verification results

All checks below passed against the completed build:

| Check | Result |
|---|---|
| New engine/storage/schema suite | 8 tests passed |
| Publication/frozen-file suite | 2 tests passed; real `dist` excludes prototype |
| Exhaustive branch QA | 200 complete legal paths; exactly 6 decisions each |
| Coverage | 7/7 nodes, 17/17 authored choices, 5/5 endings; no dead ends, orphan nodes or loops |
| Save/resume | Exact reconstruction in every phase on all 200 paths |
| New browser suite | 7 check groups passed; 28 complete UI runs plus focused edge cases |
| Main viewport coverage | All 13 opening-policy/ending pairs at 1280px and 320px |
| Additional viewport checks | 390px and 640px; no horizontal overflow |
| Browser integrity/privacy | No external requests, CSP violations, console errors or page errors |
| Existing Econ-nections unit/server/tool regressions | 36 tests passed |
| Existing Econ-nections browser regression | 15 checks passed |
| Existing classroom publication test | Passed |
| Diff hygiene | `git diff --check` passed |

Browser tests cover keyboard Tab/Enter/Space, visible outline, focus placement, consequence/decision resume, live status, restart cancel/confirm, replay identity reset, subsidy availability and delayed effects, version mismatch and storage denial. Screenshots were visually reviewed for desktop intro/debrief and narrow-mobile choice/consequence/debrief views.

Existing regression commands used:

```powershell
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs audit_tools/econnections/classroom-tools.test.mjs
node audit_tools/econnections/browser.test.mjs
node audit_tools/econnections/classroom-publication.test.mjs
```

The repository has no single root test command; these existing suites cover the nearby public game, classroom behavior and publication invariants. No claim is made that every unrelated repository audit script was run.

## Publication protection

The existing build allowlist does not copy `audit_tools`; the builder additionally rejects any output with that prefix. `.assetsignore` already excludes the entire tooling tree. The new test rebuilds production output and scans paths and runtime content for leaks. No publication/configuration changes were needed, and no date-based release toggle exists. The October target requires a separate deliberate release.

Verified unchanged: Economic Realm, Macro Command System, Managerial Intelligence Directorate, Econ-nections public behavior and classroom telemetry, Composer banks, site navigation, production telemetry, server files and Cloudflare configuration. **No deployment, Git push, commit, or remote resource creation occurred.**

## Every major path / ending combination for manual QA

The complete explicit checklist is [QA-PATHS.md](QA-PATHS.md): **52 six-choice routes**, covering every reachable combination of opening intervention × allocation/support rule × supply policy × ending. It includes exact button labels and expected endings. It is a development artifact, not an in-game branching-tree reveal.

For a shorter first pass, these are all 13 opening-policy/ending combinations. IDs map to the button labels in the linked guide:

| Six choices in order | Ending ID |
|---|---|
| ceiling → registry → inspect → reform → renew → access | protected |
| ceiling → registry → inspect → reform → renew → protect | fiscal |
| ceiling → registry → inspect → reform → taper → access | mixed |
| ceiling → registry → phase → reform → renew → protect | shortage |
| ceiling → exempt → inspect → reform → taper → access | supply |
| assistance → expand → inspect → reform → renew → access | fiscal |
| assistance → expand → inspect → reform → taper → access | mixed |
| assistance → expand → inspect → retain → taper → access | protected |
| assistance → target → inspect → reform → taper → access | supply |
| bridge → expand → inspect → reform → renew → access | fiscal |
| bridge → expand → inspect → reform → taper → access | supply |
| bridge → expand → inspect → reform → taper → protect | mixed |
| bridge → expand → inspect → retain → taper → protect | protected |

## Concerns and instructor inspection

- A favicon initially conflicted with CSP; it was replaced with a local SVG and the browser suite passed on rerun.
- Effects and ending cutoffs are authored simplifications. Review magnitudes, fiscal-ending priority and ceiling/new-lease assumptions before classroom use. No empirical or welfare claim is implied.
- Verify that learners distinguish incumbent relief from newcomer access, understand supply lags and can identify costs borne by excluded households and other public services.
- Use a real phone and screen reader to review the long debrief and focus announcements. Automated Chromium checks and screenshots are not a full assistive-technology certification.
- Use one browser tab per run. Saves are origin-specific, and multiple tabs can overwrite each other. There is no cloud sync or save migration.

No remaining automated test failures. Stop at instructor QA; do not treat this as approval to release.
