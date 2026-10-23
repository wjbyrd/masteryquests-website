# RPG Exam UI and character introduction audit

Branch: `labyrinth-interface-exam-alignment`. Baseline: `4b6527b41ca3e027322c14eb502c3a18e696c13e`. The working tree was clean. No push, merge, deployment or Cloudflare changes are authorized or performed.

## Stage A: Labyrinth Exam presentation

Actual desktop and mobile browser captures of current Composer-generated output, Economic Realm, Macro Command and Managerial show compact three-row progress displays. Those engines use their compact room controls for section navigation; they do not already contain the requested nine-question review modal. Labyrinth therefore retains their compact visual hierarchy while adopting the owner's explicitly preferred optional review interaction. Reference screenshots are under ignored `tmp/accessibility_cleanup/labyrinth-restoration/reference-*.png` (full page and viewport). Daily announcement toasts were dismissed for the final comparison captures.

The 30-room strip is now a compact, noninteractive status display, with current/saved/locked/committed accessible labels. The oversized Exam-only tiles and persistent section instructions are removed. Review Questions opens a dialog containing only the active section's nine questions, their saved/unanswered/current state, and a guarded Enter Checkpoint control. Selecting a question returns focus to that question. Escape/Return restores the review trigger. A separate Enter Checkpoint action appears beside Review only when all nine responses are saved. There are no permanent bottom navigation buttons. The modal uses the existing navigation and commitment handlers.

Exam alone starts at the top of the viewport, uses a compact Archivist portrait and moves the unchanged artifact vault into a collapsed disclosure below the question. Standard restores the original artifact location and styling. Labyrinth's background, blue/gold palette, artwork and atmospheric effects are retained. At 390 pixels the first question and all four answers fit inside the 900-pixel viewport; prominence is checked by element coordinates and visual inspection, not just absence of overflow.

Protection checks compare all original runtime source preceding the Exam presentation block and the unchanged Daily adapter. The assessment code after navigation is unchanged except removal of two repeated instructional messages. Real-bank regression compares a complete assessment against the baseline across 45 states, including question/option identity, accepted attempts, adaptive/mastery state, scoring, checkpoints, reports, telemetry, artifact state and RNG draw count. Full completion remains 36 accepted responses and 36 Daily-eligible activities. Six focused Exam cases cover draft revision, withheld feedback, audio silence, draft CSV without answer keys, early exit, canonical cross-engine behavior, graphs, keyboard/axe and pending-verification abandonment. Standard natural boss failures/retries/completion, save/resume and first-miss-after-one/two-correct cases also pass. Non-Exam seeded comparisons remain equal to baseline.

The review dialog was checked for keyboard containment, touch, current/saved labels, incomplete commitment rejection, stable answer order, focus return, checkpoint entry and summary at 1440, 820, 390 and 320 pixels. Full-page and viewport evidence includes first question, review, revisited question, checkpoint entry and guardian summary. The final CSS fixes the modal to the viewport so changing underlying graph content cannot move its targets. Review text wraps within narrow cells. Zoom and axe checks supplement visual inspection.

![Before, mobile](tmp/accessibility_cleanup/labyrinth-restoration/before-first-390-viewport.png)

![After, mobile](tmp/accessibility_cleanup/labyrinth-restoration/after-first-390-viewport.png)

![Review questions, mobile](tmp/accessibility_cleanup/labyrinth-restoration/review-390-viewport.png)

![After, desktop](tmp/accessibility_cleanup/labyrinth-restoration/after-first-1440-viewport.png)

## Stage B: Introduction contract and inventory

Stage A passed its acceptance gate and was committed separately as `fa9d8271` (`Refine Labyrinth Exam Drill presentation`) before this audit began. Stage B makes only an accessibility repair to the existing Sovereign introduction. No missing guide or guardian trigger was confirmed to be a formerly working implementation that is now bypassed.

### Authoritative sources and executable contract

- Composer: `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`, `composer-core.js`, `composer.js`, and `data/official_theme_library.js`. The audit builds an isolated portable HTML file with the actual template, composition helper, official Arcane Archive theme, embedded character/graph assets and authored guide configuration. No generated game or download is replaced.
- Economic Realm: `audit_tools/economic_realm_engine/sync.mjs`, `profiles.json`, and the Composer template. Macro: `audit_tools/macro_command_engine/sync.mjs` and its profiles. The resulting public HTML files contain the canonical introduction lifecycle with collection identities and artwork.
- Managerial: the four public HTML engines plus `play/managerial-intelligence-directorate/managerial-parity.js` and `.css`. Classroom output comes from `audit_tools/managerial_classroom/build.mjs` and loads that same parity script through its public base URL. Telemetry-POC HTML is an older independent variant; its telemetry synchronization does not install the introduction layer.
- Labyrinth: `play/micro-domains/labyrinth-of-choice/index.html` is the maintained source for its title replay and Sovereign story. Its active final wrappers were traced, including the separate Exam adapter. No shared source requires propagation for the isolated image repair.

Composer runs mode preflight before the first-time guide gate. `startSelectedMode` opens the guide and delays game initialization until Proceed calls back with the same selected mode. `GUIDE_INTRO_SEEN_KEY` is namespaced and persistent: an already-seen guide does not automatically repeat for every new run. This is intentional current behavior, not a broken trigger. Managerial performs the equivalent gate in the final `startGame` wrapper. Resume bypasses the guide; all 23 ordinary saved-game cases preserved question/options, attempts, mastery, streak, checkpoint and artifacts.

Guide identity/text come from the normalized guide configuration. Its portrait uses the same theme slot as the in-game guide, including custom-art handling and a textual fallback. The official Arcane Archive config contains existing Archivist dialogue and uses Labyrinth artwork. That content is functional in generated Composer games, but has never been connected to Labyrinth's independent opening lifecycle.

Composer-derived checkpoint entry prepares the existing boss question pool once, opens the authored guardian portrait/name and existing challenge line, then continues loading that encounter on Enter the Checkpoint. Reveals occur in the existing Standard, Exam, Legendary and Score checkpoint modes; they do not create encounters in Timed, Quiz, Unlimited, Graph, Fading or Risk modes. Reveal keys are held in memory per mode/room and cleared for new runs and failed retries. Their storage is not a persistent cross-reload cinematic history. Managerial instead observes the already-selected encounter in its display wrapper and stores bounded run/mode/room reveal keys; Proceed renders the selected question without calling selection again.

Market Signal, Strategy Desk and Agency Protocol retain their older five-second final reveal, then two student-paced story pages with Skip/Continue, followed by the newer checkpoint reveal. The same older final story remains in their telemetry-POC variants. Cost Directive goes straight to its Director of Scale checkpoint reveal. Labyrinth's Sovereign follows its existing suspense and two-page story; the isolated Exam adapter deliberately uses assessment presentation without that combat story. Room 10/20 portraits in Labyrinth and older POC engines are question presentation, not proof of a missing cinematic trigger.

### Introduction status matrix

A = existing and functioning; B = implemented but bypassed; C = existing defect; D = content/assets exist without integration; E = no separate authored content found. A records functioning lifecycle, not a claim that every legacy accessibility/design detail meets every new preference.

| Game / maintained variant | Guide | Boss introductions | Replay / classification |
| --- | --- | --- | --- |
| Economic / market-gate | A: The Custodian | A: The Frontier Keeper; The Signal Broker; The Price Magistrate | A: authored guide |
| Economic / national-ledger | A: The Custodian | A: The Registrar Of False Measures; The Warden Of Growth; The Comptroller Of Labor Records | A: authored guide |
| Economic / equilibrium-crisis | A: The Custodian | A: The Signal Breaker; The Measure Warden; The Marshal Of Equilibrium | A: authored guide |
| Economic / liquidity-grid | A: The Custodian | A: The Deposit Warden; The Vault Wraith; The Central Banker | A: authored guide |
| Economic / stabilization-protocol | A: The Custodian | A: The Policy Sentinel; The Stabilization Regent; The Custodian | A: authored guide |
| Macro / national-engine | A: The Auditor | A: The Registrar Of False Measures; The Warden Of Labor Flows; The Comptroller Of Equilibrium | A: authored guide |
| Macro / mint-ash-gold | A: The Custodian | A: The Lord Of Liquidity; The Keeper Of The Steady State; The Sovereign Of Shocks | A: authored guide |
| Macro / command-nexus | A: The Custodian | A: The Demand Cartographer; The Rate Engineer; The Shock Forecaster | A: authored guide |
| Macro / exchange-citadel | A: The Custodian | A: The Keeper; The Chancellor; The Custodian | A: authored guide |
| Managerial / cost-directive | A: The Principal | A: The Analyst Of Tradeoffs; The Manager Of Marginal Decisions; The Director Of Scale | A: authored guide |
| Managerial / market-signal | A: The Principal | A: The Capital Arbiter; The Risk Oracle; The Signal Architect | A: authored guide |
| Managerial / strategy-desk | A: The Principal | A: The Capital Arbiter; The Risk Oracle; The Game Architect | A: authored guide |
| Managerial / agency-protocol | A: The Principal | A: The Underwriter Of Hidden Risk; The Auditor Of Moral Hazard; The Principal | A: authored guide |
| Micro Domains / Labyrinth of Choice | D: Archivist content exists in Composer; no local guide gate | Room 10/20: D art / E separate narrative; Sovereign: C image alternatives repaired, story A | A: title artwork only |
| Classroom / cost-directive | A: The Principal | A: The Analyst Of Tradeoffs; The Manager Of Marginal Decisions; The Director Of Scale | A: authored guide |
| Classroom / market-signal | A: The Principal | A: The Capital Arbiter; The Risk Oracle; The Signal Architect | A: authored guide |
| Classroom / strategy-desk | A: The Principal | A: The Capital Arbiter; The Risk Oracle; The Game Architect | A: authored guide |
| Classroom / agency-protocol | A: The Principal | A: The Underwriter Of Hidden Risk; The Auditor Of Moral Hazard; The Principal | A: authored guide |
| Managerial telemetry-POC / cost-directive | D: Principal assets/content in maintained public counterpart | D: room 10/20 reveal integration absent; D: final portrait, no separate reveal | D: newer replay layer absent |
| Managerial telemetry-POC / market-signal | D: Principal assets/content in maintained public counterpart | D: room 10/20 reveal integration absent; A: existing final story | D: newer replay layer absent |
| Managerial telemetry-POC / strategy-desk | D: Principal assets/content in maintained public counterpart | D: room 10/20 reveal integration absent; A: existing final story | D: newer replay layer absent |
| Managerial telemetry-POC / agency-protocol | D: Principal assets/content in maintained public counterpart | D: room 10/20 reveal integration absent; A: existing final story | D: newer replay layer absent |
| Composer / generated | A: The Archivist | A: The Warden; The Decomposer; The Sovereign | A: authored guide |

No B case was found. No character identity, artwork or narrative was invented or substituted. All authored public guide portraits loaded in the browser. Each public game and all eight Managerial variants were inspected independently, including their final function wrappers.

### Replay, timing, audio and telemetry

Replay closes Game Menu and opens presentation without initializing a run. Five representative engines (Market Gate, National Engine, Cost Directive, Labyrinth and generated Composer) were tested in Standard, Exam, Timed, Score and Fading. First launch with/without the seen flag selects identical question/options and consumes the same RNG draws. Replay preserves question, mode/room, accepted attempts, mastery, memory, streak, checkpoint, artifacts and recorded event stream. Exam replay follows a saved draft without accepting it; Stage A additionally validates draft identity/revision and complete delayed scoring.

The existing timing policy differs by engine. Timed Trial continues counting during replay; Score Attack retains its original question-start timestamp. Composer/Economic/Macro/Managerial pause Fading Fortune during their guide presentation. Labyrinth title replay continues its established Fading decay. Those policies are unchanged. No new audio is started by the guide presentation; existing mute/preferences and shared motion suppression remain in force. Standard baseline tests also cover persisted sound and decorative-motion controls.

Canonical boss reveal emits its existing `boss_reveal` event when first displayed for the encounter; guide replay emits no extra answer/completion events. Managerial's parity reveal is presentation-only and does not add that canonical event. This audit does not normalize these telemetry differences. Opening/dismissing introductions does not score an answer or award an artifact.

### Verified repair and accessibility evidence

Axe found a critical `image-alt` defect in the existing Labyrinth Sovereign story. Three existing portrait nodes (suspense and both dialogue pages) now have `alt="The Sovereign"`. The existing name and image are unchanged. This is the only Stage B production behavior change. The local release fingerprint was refreshed by the existing fingerprint tool; telemetry fields, tracking implementation and all other registry entries are unchanged.

The isolated browser suite checks guide/replay keyboard containment, logical focus progression, ordinary save/resume, all three encounter boundaries, reduced-motion profiles, and representative guide/boss axe scans. The final guardian Skip and Continue paths were compared in all four public engines with a two-page story; both paths select identical questions with identical RNG/state. Dialogue remains available after 20 seconds on each page. At 320 pixels with 200% root text sizing, controls remain keyboard reachable and the page can scroll to the full dialogue. This is text enlargement testing, not a claim of operating-system magnifier or manual screen-reader certification.

Representative 390-pixel portraits/dialogue were visually inspected. Canonical introductions are dialogs; the older Sovereign narrative is ordinary content in the question region with Skip/Continue buttons. It should not be described as a newly created modal. Axe checks now pass for the five representative engines, including Labyrinth's repaired portrait. A screen reader was not run manually.

Existing design limitations are recorded rather than silently presented as repaired triggers:

- Composer/Economic/Macro use one Proceed action to dismiss a guide/replay; Escape does not close it. Managerial supports Escape and Proceed. Labyrinth title replay supports Close/Escape. Separate Skip/Close controls in the canonical layer would be a presentation enhancement, not a restoration of absent code.
- Canonical boss reveal writes its dialogue into `srAnnouncements` while also exposing the focused dialog; duplicate announcement risk remains. No claim of verified single utterance is made.
- Canonical Composer-derived Exam guardian dialogue is selected from recent mastery after section commitment. Its existing praise/weakness wording can disclose aggregate performance before the guardian summary, even though it does not expose an answer key. This is a pre-existing canonical feedback-policy issue, distinct from Labyrinth's protected Exam adapter. No such wording was imported into Labyrinth. A future canonical correction should suppress performance-dependent Exam introduction text without changing question selection, scoring or the Standard story.

### Validation and protected scope

Evidence is under ignored `tmp/accessibility_cleanup/rpg-introductions/` and `tmp/accessibility_cleanup/labyrinth-restoration/`. The introduction suite uses seeded isolated Edge profiles and blocks external requests. It exercises published files, eight maintained variants and a portable generated game; checkpoint fixtures enter the real load/display paths but are not claims of completing every collection's full campaign. The complete real-bank Exam and natural Standard completion regressions apply to Labyrinth.

- Stage A: four viewport presentation cases, six Exam cases, full 36-response baseline comparison across 45 states, all non-Exam baseline mode comparisons, save/resume, natural three-boss failure/retry/completion and first-miss-after-one/two-correct regressions passed before Stage B.
- Stage B: 23 inventory cases, five representative axe cases, five mode lifecycle cases (five modes each), five real section-commit/checkpoint cases, and four Skip/Continue equivalence cases. Labyrinth enters its checkpoint directly; the other four representative engines show their existing reveal, with exactly nine committed attempts and no extra scoring on dismissal.
- Composer's existing `run_guide_intro_validation.js`: 19 source/configuration checks passed, including authored/custom guide identity, theme configuration, persistent seen state and replay isolation.
- Final post-repair Labyrinth full Exam baseline comparison and natural Standard failure/retry/completion both passed. The prefix protection assertion permits only the three exact Sovereign image alternatives in addition to the existing registry normalization; it still compares the remaining original runtime byte-for-byte. Daily adapter, assessment scoring tail, question bank, 90 graph references and 21 graph assets remain protected by existing source comparisons.
- `update-fingerprint.mjs --check` passed. No Composer source, synchronization output, question bank, Cloudflare configuration, Worker route, secret, subscription, gameplay rule, data retention or telemetry schema changed. No push, merge or deployment occurred.

Reproduction commands (browser execution requires the local Edge test permission):

```powershell
node audit_tools/labyrinth_alignment/intro-audit.mjs
node build/faculty-build-composer/tests/run_guide_intro_validation.js
node audit_tools/labyrinth_alignment/exam-restoration.mjs 'full Exam'
$env:MQ_LABYRINTH_BASELINE='4b6527b4'
node audit_tools/labyrinth_alignment/validate.mjs phase2 'Standard natural'
node audit_tools/labyrinth_alignment/update-fingerprint.mjs --check
```

### Content/integration decisions left to the owner

1. Whether Labyrinth should adopt the already-authored Composer Archivist opening. It would require a new local lifecycle connection and deliberate once-seen/replay policy; there is no broken former connection to restore.
2. Whether older telemetry-POC games should acquire the public Managerial guide/replay layer. That is a separate compatibility integration, not a reason to replace independent engines wholesale.
3. Whether to author distinct Warden/Decomposer opening dialogue in Labyrinth; portrait assets alone do not establish such a script.
4. Whether to expand canonical introduction dismissal controls, remove duplicate live announcements, and standardize neutral Exam introduction wording. These are documented canonical design/feedback gaps; this task does not claim they are already resolved.

![Before, desktop](tmp/accessibility_cleanup/labyrinth-restoration/before-first-1440-viewport.png)

![Custodian introduction](tmp/accessibility_cleanup/rpg-introductions/economic-market-gate-guide.png)

![Generated Archivist introduction](tmp/accessibility_cleanup/rpg-introductions/composer-generated-guide.png)

![Sovereign dialogue at narrow width with enlarged text](tmp/accessibility_cleanup/rpg-introductions/labyrinth-labyrinth-of-choice-final-dialogue-320-zoom.png)
