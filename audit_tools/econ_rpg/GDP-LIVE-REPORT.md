# GDP LIVE — implementation and QA

Private instructor preview, September 22, 2026. No deployment or push. No custom imagery, new backend, identity collection, or public navigation changes.

## Launch and integration

Run `node audit_tools/econ_rpg/serve.mjs` from the repository root, then open **http://127.0.0.1:4179/games/gdp-live/**. The existing private mini-game menu at `/games/` now includes a GDP LIVE card. The existing directory-based preview server handles the route without changes.

All runtime files stay under the excluded `audit_tools/` tree. The production-build exclusion test passed; the local build was a verification step, not a deployment. The existing public games, RPG engines, scenarios, artwork, telemetry and deployment configuration remain untouched.

## Files

Created under `audit_tools/econ_rpg/game/games/gdp-live/`:

| File | Responsibility |
| --- | --- |
| `config.js` | Working title, fictional baseline, phase lengths, counter duration, final simultaneous changes, account labels |
| `scenarios.js` | 18 transaction scenarios and five audit cases; no UI code |
| `engine.js` | Seeded selection, immutable posting/retry transitions, derived GDP/NX, audit repair, numeric final challenge |
| `app.js` | Single delegated click/submit listeners, focus, announcements, rendering and per-run telemetry |
| `view.js` | Account controls, posting receipts, expandable ledger, audit table and concise results |
| `counter.js` | Directional counter animation and reduced-motion handling |
| `telemetry.js` | Anonymous browser-local records with isolated run IDs and bounded retention |
| `index.html` | Semantic shell, restrictive CSP, noindex metadata, persistent counter and live region |
| `gdp-live.css` | GDP-specific layout over Room to Stay's existing stylesheet |

Other new files: `audit_tools/econ_rpg/gdp-live.test.mjs`, `audit_tools/econ_rpg/gdp-live.browser.test.mjs`, and this report.

Modified only `audit_tools/econ_rpg/game/games/index.html` (private launch card) and `audit_tools/econ_rpg/README.md` (launch/report link).

## Accounts and content

`CONFIG.baseline` contains C 17,000; I 4,000; G 4,500; X 3,000; M 3,500. Derived GDP is 25,000 and NX is −500. Values are explicitly labeled as a simulated economy in billions, not current national statistics. GDP and NX are always computed from component accounts; neither has an independent editable balance.

| Phase | Bank | Per run |
| --- | ---: | ---: |
| Basic posting | 7 | 4 |
| Accounting traps | 8 | 4 |
| Multi-account imports | 3 | 3 |
| Audit cases | 5 | 1 |

Each run uses a fresh random seed, samples without replacement within each phase, and shuffles audit rows. The basic and trap pools are not exhausted every run. The optional used-car-service case is in the trap pool and posts only C +1; the used principal of 10 is excluded. Scenario feedback explains the classification rather than merely naming the answer.

Account selection uses native toggle buttons with full names and `aria-pressed`. Not Counted clears the other accounts, and selecting an account clears Not Counted. The engine requires exactly the correct account set. Incorrect attempts change no balances or accepted ledger entries, provide an explanation, and preserve the first-attempt result after correction. The player explicitly advances after reviewing the receipt.

Imports are paired postings: C +5 / M +5, I +4 / M +4, or G +3 / M +3. The imports balance rises positively; the receipt shows both additions and **net GDP change $0B**. The component highlights and NX change remain visible while headline GDP stays still. There is no ordinary import scenario that posts M alone. The M-only audit entry is explicitly erroneous and must be repaired.

The formal identity is withheld until all 11 transaction postings are complete. The reveal explains why foreign production is removed and revisits the offsetting consumer-import example.

## Ledger, audit and final challenge

The expandable national ledger lists accepted activity, each component/amount and net GDP effect. Failed guesses never enter it. It sits beneath the counter on wide desktop and after the controls on narrower screens. Opening it is optional; the counter and posting receipt carry the immediate feedback.

The audit loads a **new draft batch** of three transactions, already reflected in the displayed accounts and labeled as under review. Exactly one row is wrong. This is additional activity, not a second posting of earlier transactions. The player first identifies a row, then replaces its accounting treatment. Correct repair reverses the erroneous posting and applies the correct one exactly once; the three corrected rows then enter the accepted ledger. Reconciled balances equal baseline plus all accepted ledger postings.

Audit coverage: transfer incorrectly in G; imported consumer purchase recorded only in M; omitted inventory investment; new residential construction incorrectly in C; used-car principal incorrectly in C. Housing repair moves C to I with **zero GDP change**, which the explanation calls out. Other repairs exercise positive and negative counter movement.

The final challenge uses `CONFIG.shock`: C +40, I −25, G +10, X +8, M +13. The correct net change is +20. The parser accepts `20`, `+20`, `20B`, `$20B`, decimals and optional whitespace/“billion.” An incorrect entry leaves balances unchanged and gives a sign/grouping hint without revealing 20. A correct answer posts all changes once and produces the final upward counter movement.

The concise result screen retains final GDP and all six displayed component/NX totals, transaction count, first-attempt accuracy, additional posting attempts, audit attempts and final-challenge result. Replay creates new accounts, deck, ledger, phase, attempts, feedback, recorder and run ID. Previous anonymous run records remain separate in bounded history; there is no save/resume feature, and the footer explains that reload starts a new run.

## Visual and accessibility implementation

The game loads the actual unchanged Room to Stay `rpg.css`, reusing its navy/teal/gold variables, radial page background, gradient panels, button surfaces, type family and gold focus outlines. Local CSS adds the large tabular-number counter, component board and ledger layout. No scene artwork or image generation was used.

At 1100px and wider, the counter and components sit beside the transaction controls; the ledger is below the counter. This keeps the initial counter and posting controls visible together at 1366×768 and 1920×1080. Tablet/mobile stack counter, scenario/controls, then ledger. Longer audit and expanded-ledger content scrolls vertically. No horizontal scrolling was found down to 320px.

The counter interpolates to the derived total with a short upward/downward roll over `CONFIG.animationMs` (650ms). Component highlights and signed amounts also communicate every change. Zero-GDP updates remain still, including when a player posts before a preceding animation has finished. Reduced motion updates instantly, including if the preference changes during an animation.

Controls work with keyboard Enter/Space, selection remains focused through rendering, transitions focus the stage heading, and a single polite live region announces attempts, explanations and GDP changes. Repeated wrong attempts receive distinct announcements. The numeric field has a visible label and format help. Tables have captions, headers and row headers. Buttons, disclosure summaries and game-return links have at least 44px target height. Manual screen-reader testing has not been performed.

## Local telemetry

Follows the existing mini-game browser-local convention with `mq.gdp-live.run.v1.<runID>` records, a maximum of 20 runs, and in-memory continuation with a visible notice if storage is blocked. No fetches or external requests occur; CSP disables network connections. No typed free-text response is retained: the final answer is parsed to a number or null.

Events: `run_start`, `scenario_presented`, `post_attempt`, `transaction_posted`, `phase_complete`, `identity_reveal`, `audit_presented`, `audit_attempt`, `audit_corrected`, `shock_presented`, `shock_attempt`, `run_complete`.

Records include anonymous run/game IDs, seed on run start, sequence/timing, phase, scenario, selected accounts, attempts/correctness, posted amounts where applicable, actual component and GDP changes, audit ID and completion results. A run with one transaction retry, one inspection retry, one repair retry and one final-challenge retry generates 49 events. Replay starts a new sequence and does not duplicate listeners or completion events.

## Validation

- **8 GDP unit tests passed.** Every one of 18 scenarios was checked against all 64 possible account subsets, including empty and invalid mixed Not Counted selections (1,152 classifications). Exactly one set is accepted per scenario; all wrong selections preserve balances, and corrections preserve first-attempt performance.
- **1,000 seeded full runs passed.** All 18 scenarios and five audit cases were reached, with reproducible phase ordering, unique transactions, wrong-answer correction, exact audit reconciliation, correct final shock and reset. Every final balance matches the sum of the ledger and baseline.
- Arithmetic checks cover C/I/G/X, positive M and import offsets, transfers, stock trades, used principal/current services, intermediate inputs, housing, inventories and NX. Counter tests cover both directions, exact settling, interrupted zero-change updates and reduced motion. Telemetry tests cover retention, isolation and blocked storage.
- **Five complete browser runs passed** using real Chrome/Playwright at the viewports below. Checks include keyboard actions, exclusive/multiple selection, retries, all audit types, final numeric entry, ledger rows, all component totals, exact event counts, replay, 44px controls, no horizontal overflow, and normal/reduced animation. Additional checks exercise blocked localStorage, changing motion preference during a roll, and the private launch card.
- Browser results: **zero console/page/resource errors and zero external requests**. Screenshots and machine-readable results are generated in ignored `tmp/econ-rpg/gdp-live/`. Representative wide desktop, laptop, tablet, mobile audit/import and final views were visually inspected.
- **64 existing regression tests passed**, covering Room to Stay, The Main Attraction, The Economy’s Edge, Megastar Mania, Gameday Rivals, Takeout Taco and production exclusion/protected public files. No prior game implementation was changed.

| Viewport | Seed | Audit | Motion | Final GDP after successful correction |
| --- | ---: | --- | --- | ---: |
| 1920×1080 | 10 | Transfer | Normal | 25,071 |
| 1366×768 | 4 | Import | Normal | 25,086 |
| 900×900 | 2 | Inventory | Normal | 25,069 |
| 390×844 | 7 | Housing | Reduced | 25,090 |
| 320×740 | 1 | Used goods | Reduced | 25,078 |

Reproduce the new checks:

```powershell
node --test audit_tools/econ_rpg/gdp-live.test.mjs
# Point PLAYWRIGHT_MODULE to the installed Playwright package if not locally resolvable.
node audit_tools/econ_rpg/gdp-live.browser.test.mjs
```

## Instructor review

Ready for private instructor playtesting. Review the 11-transaction pacing, feedback detail, draft-batch audit framing and optional used-good-service example. Values are simplified illustrative flows, with explicit domestic/current-production assumptions and no separate distribution services on import examples. The housing audit deliberately repairs classification without moving GDP; its shared “THE COUNTER IS OFF” heading is qualified by the explanation that component errors can leave headline GDP unchanged. No known accounting discrepancy remains in the tested cases. Browser coverage is Chrome; Safari, Firefox and assistive-technology sessions remain instructor/accessibility follow-up checks.
