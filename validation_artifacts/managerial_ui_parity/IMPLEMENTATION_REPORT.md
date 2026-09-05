# Managerial UI/gameplay parity implementation

Implemented in `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. No commit or deployment was performed.

## Exact implementation files

Modified:
- `play/managerial-intelligence-directorate/cost-directive/index.html`
- `play/managerial-intelligence-directorate/market-signal/index.html`
- `play/managerial-intelligence-directorate/strategy-desk/index.html`
- `play/managerial-intelligence-directorate/agency-protocol/index.html`

Added:
- `play/managerial-intelligence-directorate/managerial-parity.js`
- `play/managerial-intelligence-directorate/managerial-parity.css`
- `audit_tools/managerial_ui_parity/run_validation.mjs`
- `audit_tools/managerial_ui_parity/run_browser.mjs`
- This report and evidence files in `validation_artifacts/managerial_ui_parity/`: `baseline_hashes.json`, `validation_results.json`, `browser_results.json`, and the 24 screenshots listed below.

## Reference implementation

The current polished implementation is in `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`, which generates Principles/faculty builds. The older published `play/economic-realm` pages do not contain the complete requested feature set. Reference components were the template's Game Menu markup/functions, Fullscreen menu action, Daily markup/adapter and `DailyChallengesCore`, guide introduction, and boss presentation-state/curated dialogue grammar. The deterministic Daily core is copied verbatim and checked against the template. The adapter removes template-specific telemetry additions and connects to the existing Managerial engine. Neither the template nor Composer was edited.

There was no existing shared runtime component providing this feature set to both published families. The two new sibling assets share the port across the four Managerial titles; the existing modal and engine callbacks are reused.

## Implemented behavior

All four titles now have one primary Game Menu containing Fullscreen, Daily Challenge, Sound, replay introduction, and existing navigation options. The separate floating Fullscreen button is removed; Daily has no floating gameplay button. The existing modal is reused.

Daily uses the proven local-calendar deterministic schedule and progress rules: correct-answer volume, streak, fixed-window accuracy, perfect stretch, concept variety, and graph questions where a genuine supported pool exists. It includes a brief announcement and compact menu detail. Progress observes accepted question events after forwarding the original gameplay hook unchanged. Rejected rapid guesses do not advance it. Existing mode restrictions remain authoritative. There are no currency rewards, new boss challenge families, tracking identities, runtime AI calls, or new telemetry events.

The existing Principal portrait introduces the first new run with one title-specific sentence and a keyboard-accessible Proceed action. Guide replay is available through the menu. Resume bypasses the first-run introduction. The seen preference persists independently of the engine save; an in-memory fallback prevents repeated prompts when storage writes are unavailable.

Checkpoint cinematics use the already-selected encounter's portrait, identity and objective. They precede question display and continue through the original display callback without selecting questions again. Curated dialogue reads the existing diagnosed target/presentation state; unavailable targets use a concise fallback. The source targeting logic is unchanged. Reveal history is keyed by source run ID, mode and room independently of engine saves, preventing repeat reveals during checkpoint resume. No artifact is awarded by presentation code. Legacy pre-question warning text is suppressed.

Human portraits retain their artwork, size and placement, with colored glow removed and a subtle structural shadow retained. Unrelated button/artifact effects remain. Cinematics use opaque dark backgrounds, visible focus, keyboard proceed/escape handling, background inertness while open, and restored focus. Reduced motion is retained. Mobile menu reachability is restored; Strategy Desk and Agency Protocol required bounded box sizing to eliminate horizontal overflow at 390px.

## Per-title details and exceptions

| Title | Guide | Existing checkpoint identities | Graph Daily |
| --- | --- | --- | --- |
| Cost Directive | The Principal | Analyst of Tradeoffs; Manager of Marginal Decisions; Director of Scale | Disabled: no supported graph-safe pool |
| Market Signal | The Principal | Capital Arbiter; Risk Oracle; Signal Architect | Eligible only when the existing accessible graph pool satisfies the requirement |
| Strategy Desk | The Principal | Capital Arbiter; Risk Oracle; Game Architect | Eligible only when the existing accessible graph pool satisfies the requirement |
| Agency Protocol | The Principal | Underwriter of Hidden Risk; Auditor of Moral Hazard; The Principal | Disabled: no supported graph-safe pool |

Agency Protocol's existing guide image lacks an alt identity, so its cinematic supplies The Principal. Agency also uses its existing custom mode-validation pool requirements through a small adapter because it lacks the shared requirements constant used by the other titles. No question pool or mode eligibility was expanded. Strategy's existing strategist/broker/architect artwork and rendered checkpoint names are preserved.

## Validation

Commands run from the canonical repository:

```powershell
node build/faculty-build-composer/tests/run_daily_challenges_v1_validation.js
node build/faculty-build-composer/tests/run_guide_intro_validation.js
node build/faculty-build-composer/tests/run_exam_navigation_boss_reveal_validation.js
node audit_tools/managerial_ui_parity/run_validation.mjs .
$env:PLAYWRIGHT_MODULE='C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node audit_tools/managerial_ui_parity/run_browser.mjs .
git diff --check
```

| Suite | Passed | Failed |
| --- | ---: | ---: |
| Existing Daily validation | 26 | 0 |
| Existing guide validation | 19 | 0 |
| Existing exam/navigation/boss validation | 59 | 0 |
| Managerial static/core/preservation regression | 24 | 0 |
| Managerial Edge browser regression | 57 | 0 |
| Total | 185 | 0 |

`git diff --check` passes. Browser runs use a localhost server, headless Microsoft Edge, blocked external origins, desktop and 390x844 mobile viewports, and fresh contexts. They cover every title: first guide/start once, consolidated working menu, Fullscreen and Sound, Daily progress/persistence, checkpoint selection and artifact timing, refresh/resume, curated/fallback dialogue, Standard, Exam, Score Attack, Risk & Reward, Timed, Legendary, Fading Fortune, Legendary rapid-guess suppression, keyboard access, reduced motion and overflow. No browser page exceptions were recorded.

Browser fixtures accelerate rooms and clocks for bounded regression checks; they are not complete unaided playthroughs or production-browser certification. The final viewport captures show guide, menu and checkpoint presentation on every title.

Preservation evidence checks 684 protected files: 683 match their original hashes. The remaining file, `play/economic-realm/index.html`, received a separate committed `a564e61` (Hot fix) while this task was paused. That external change is preserved and checked against both that commit and HEAD; it is not part of this patch. The original baseline remains intact in the evidence. Existing inline engine scripts in all four Managerial pages match HEAD after normalizing only removed warning-text assignments. This guards question content, IDs, answer correctness, routing, repair/bridge/retest logic, scoring, timing, checkpoints, artifacts, save format and telemetry hooks. The existing unrelated untracked `server/anonymous-telemetry-poc/.wrangler/` directory is left alone.

## Screenshots

All paths below are under `validation_artifacts/managerial_ui_parity/`:

- `cost-directive-guide-desktop.png`
- `cost-directive-guide-mobile.png`
- `cost-directive-menu-desktop.png`
- `cost-directive-menu-mobile.png`
- `cost-directive-boss-desktop.png`
- `cost-directive-boss-mobile.png`
- `market-signal-guide-desktop.png`
- `market-signal-guide-mobile.png`
- `market-signal-menu-desktop.png`
- `market-signal-menu-mobile.png`
- `market-signal-boss-desktop.png`
- `market-signal-boss-mobile.png`
- `strategy-desk-guide-desktop.png`
- `strategy-desk-guide-mobile.png`
- `strategy-desk-menu-desktop.png`
- `strategy-desk-menu-mobile.png`
- `strategy-desk-boss-desktop.png`
- `strategy-desk-boss-mobile.png`
- `agency-protocol-guide-desktop.png`
- `agency-protocol-guide-mobile.png`
- `agency-protocol-menu-desktop.png`
- `agency-protocol-menu-mobile.png`
- `agency-protocol-boss-desktop.png`
- `agency-protocol-boss-mobile.png`

## Deployment and intentionally unchanged scope

- Static Pages redeployment: **required to publish these changes**; deploy the four pages together with both shared assets.
- Worker redeployment: **not required**.
- D1 migration: **not required**.
- Nothing deployed or committed automatically.

Question banks, artwork, scoring/adaptive mechanics, artifact rules, existing telemetry semantics, the private anonymous telemetry POC, Worker/D1 code, Composer and Principles behavior are outside this patch. No classroom telemetry link, Access policy, privacy-language change or debug UI was added.

## Manual QA checklist

Repeat across Cost Directive, Market Signal, Strategy Desk and Agency Protocol:

1. In a fresh browser profile, choose Standard. Check the correct Principal portrait, concise introduction and keyboard Proceed. Confirm one run starts; refresh/continue and confirm the intro does not replay. Test Replay Introduction in Game Menu.
2. Open Game Menu on desktop and phone width. Test Fullscreen enter/exit, Sound, Daily detail, menu close and mode selection. Confirm there is no floating Fullscreen or Daily control.
3. Answer questions and inspect Daily progress; refresh and continue. Confirm progress persists and ordinary scoring is unchanged. Cost Directive and Agency Protocol must not offer graph Dailies.
4. Complete ordinary rooms before checkpoints 10, 20 and 30. Check portrait/name, concise dialogue, no human glow or old warning banner, and keyboard Proceed into the encounter. Confirm artifacts arrive only after victory.
5. Refresh during a checkpoint and continue. Confirm the boss intro and completion/artifact award do not duplicate. Check the artifact vault after reload.
6. Smoke-test Exam, Score Attack, Risk & Reward, Timed, Legendary and Fading Fortune. Check timers, scores and normal progression; Legendary should retain remediation suppression.
7. At phone width and with reduced motion enabled, inspect menu and both cinematics for readable text, visible keyboard focus, reachable controls, uncropped portraits and no horizontal scrolling.
