# The Investment Desk — Mini-game 16

Playable first version, implemented October 10, 2026. Buildless HTML, CSS, and JavaScript; no new dependencies or external services.

## Play and integration

- Source: `audit_tools/econ_rpg/game/games/the-investment-desk/`.
- Start the existing preview server with `node audit_tools/econ_rpg/serve.mjs`; open `/games/the-investment-desk/`. Optional `?seed=42` reproduces a scenario.
- Added to the existing mini-game Games hub and `games-preview.json` publication allowlist, bringing its count to 16.
- The publication pipeline rebases navigation into the existing unlisted beta namespace. No public deployment was performed. Existing game mechanics and the public collections hub were not changed.

## Implemented experience

Quest One draws six proposals from a 20-project library. Each seeded scenario varies the capital budget ($200,000–$300,000), a common discount rate (8%, 10%, or 12%), project costs, cash flows, and two-to-five-year horizons. Scenarios are validated for meaningful capital constraints, with bounded retries and three validated fallback sets. Every best portfolio is calculated dynamically across all 64 subsets. Cards and totals use actual discounted cash flows with full precision. See [the First Quest refinement report](REFINEMENT_REPORT.md) for implementation and the 100-seed validation results: 93 distinct proposal sets and 83 distinct optimal compositions.

The opening and six-card desktop grid fit at 1366 × 768 and 1440 × 900. Mobile provides button-based proposal navigation. A visual report compares portfolio NPVs around a zero baseline and puts extended explanations in accordions. The report remains accessible during Quest Two without changing its state.

The uncertainty desk starts with a fresh $250,000 and five new projects. Investment and rejection are binding. Research is optional and collapsed by default; a $2,000 per-project waiting fee retains the option to invest after the market bulletin. Players can finish with one, several, or zero investments. Finishing confirms that open and held proposals will be passed on, without new information, fees, or a forced bulletin. Reading the bulletin with untouched proposals confirms passing on those proposals while retaining paid holds. Research and waiting fees remain nonrefundable and enter expected and realized totals once.

The packing-line proposal shows uncertain demand against operating breakeven (3,000 cases/year), plus an optional discounted zero-NPV threshold (approximately 4,810 cases/year). Student-facing quest counts and decision-window counters are omitted. Desk-level NPV help is moved to the results. The allocation report's worked NPV calculation uses all selected projects, actual year-end cash flows, and the scenario's discount rate; the final report uses realized cash flows and explains fee deductions. Both handle empty portfolios. The final report summarizes forecasts versus results with a shared-zero chart, a capital-allocation bar, illustrated project summaries, and a short takeaway. Decision quality, research, calculations, passed alternatives, and history remain expandable.

## Probability and financial model

- All cash flows are annual net cash flows, with initial investment at time zero and subsequent flows at year end. Discount rate: 8%, 10%, or 12% in First Quest; 10% in Second Quest. No taxes, borrowing, fractional projects, or salvage beyond stated flows.
- A seeded opening environment assigns a 40%, 55%, or 70% prior probability of a strong economy. One latent shared economy determines each project's conditional success probability.
- Project outcomes are conditionally independent given the economy. Research correctly classifies its project's eventual favorable/adverse state with the accuracy specified in `data.js`; the bulletin identifies the economy with 70% accuracy. Neither is perfect.
- Bayesian forecasts include **all** purchased reports, including evidence about the shared economy conveyed by other projects, and the bulletin when available. Action order does not redraw hidden outcomes or signals.
- Standalone expected value of sample information is the probability-weighted value of optimally accepting/rejecting after the report, less the best accept/reject value before it. Fees are shown separately for comparison. It is explicitly not a portfolio-level optimal information policy.
- At each investment, record its forecast, information window, and the expected-value gap between the best then-affordable allocation and an allocation forced to include that project. Reports do not grade investments against later signals or realized luck. This benchmark compares immediate allocations, not every possible research/wait policy.
- Net expected review value combines forecasts recorded at different commitment times; the interface labels that distinction. Net realized value uses the actual scenario flows. Both deduct all information fees once.
- Research captures the student's tentative plan before purchase and compares it with their eventual choice without claiming that research alone caused a reversal.

## Presentation, accessibility, and history

Mastery Quests navy, teal, and white styling uses the palette from `assets/css/site.css`, kept local in `mq-theme.css` for standalone packaging. The opening is a centered title, one painted centerpiece, and a start button. Bright capital-summary panels emphasize balances and NPV. The game includes 21 original painted business illustrations, framed cards, visible portfolio slots, responsive cards, native modal dialogs, labeled buttons, focus restoration, keyboard focus containment, live budget announcements, and reduced-motion support. Financial detail and longer instructional explanations are expandable. The illustrations use the supplied reference only for palette and painterly direction; no creature imagery is used. Each First Quest project has its own image, and related Second Quest ventures share sector artwork. Optimized 768 × 512 WebP assets live in `assets/cards/`; `art-prompts.json` records the exact prompts and built-in image-generation provenance. No external image requests are made during play.

Anonymous events are stored under `mq.investment-desk.runs.v1`, retaining five runs. No personal identifiers or network telemetry are collected. Storage failures display a warning and permit play in memory. Reloading starts fresh; saved event histories are not resumable sessions. The current run's history is visible in its committee report.

## Executed verification

1. `node --test audit_tools/econ_rpg/investment-desk.test.mjs audit_tools/econ_rpg/investment-desk-first.test.mjs audit_tools/econ_rpg/investment-desk-results.test.mjs` — **31 passing tests**: NPV/timing, budget enforcement, reversible selection, exact optimum, phase guards, one/zero-investment completion without research, held-project closure, fee preservation, expected value, Bayesian updates, correlated-project calculations, breakeven, seeded generation, 3,000-seed calibration, selected-portfolio worked calculations, and signed result-chart bounds.
2. `node audit_tools/econ_rpg/investment-desk.browser.test.mjs` — **passed** with bundled Playwright and installed Chrome. Both quests, research, wait/invest/reject, insufficient funds, confirmation cancellation, sequential reveals, review completion, local history, both replay modes, navigation, blocked storage, keyboard Enter/Tab/Escape and focus restoration. Captured desktop 1440px, mobile 390px, and narrow 320px layouts; no horizontal overflow and visible buttons at least 44px tall. Reduced-motion emulation included. Representative captures visually inspected.
3. `node audit_tools/econ_rpg/investment-desk.publication.test.mjs` — **passed**: existing preview publisher includes runtime files, brand stylesheet, all 21 paintings, and hub entry; packaged hub → game → hub works without browser or asset errors. Source-only preview has an existing unrelated missing Growth Realms script because that server does not mount the external tree; the packaged route includes it correctly.
4. JavaScript syntax check and `git diff --check` — **passed**.

The additional `investment-desk-first.browser.test.mjs` verifies the refined desktop/mobile layouts, generated card/modal values, charts, and preserved Second Quest state.

`investment-desk-choice.browser.test.mjs` verifies one/zero-project completion without research, cancellation of finish and bulletin confirmations, automatically passing remaining proposals, selected and realized worked NPV examples, removal of visible quest/window counts and desk help, and concise default results on desktop and mobile.

Browser commands accept `PLAYWRIGHT_MODULE` as the absolute path to an installed Playwright module. Captures and results are in ignored `tmp/econ-rpg/investment-desk/`.

## Prototype boundaries

Replay varies market priors, research signals, bulletin direction, and realized outcomes; the five Second Quest project identities remain stable. One public bulletin creates two decision windows. No timers, accounts, saved-session resume, financing simulation, or exhaustive policy optimizer. Client-side hidden outcomes are excluded from the playable interface; this is an instructional simulation, not a tamper-proof assessment. Human screen-reader and physical-device testing remain outstanding.
