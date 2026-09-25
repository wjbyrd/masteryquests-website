# Money in Motion

Private, standalone prototype: `/games/money-in-motion/` when serving `audit_tools/econ_rpg/game`. It is intentionally absent from the Games hub.

## Implementation

- `model.js`: pure accounting functions, scripted transactions, reserve policy settings, and initial state.
- `app.js`: four-act flow, operating controls, actual-work history, and gated instructional close.
- `index.html` and `money-in-motion.css`: established Mastery Quests shell, labeled account graphics, responsive layouts, and reduced motion.
- `model.test.js`: accounting and reserve-constraint tests.
- `browser.test.cjs`: complete keyboard-driven browser walkthroughs at five viewport sizes.

Act 1 permits partial or zero loans; later balances carry those choices forward. Full lending reproduces the brief’s $900, $540, and $450 training capacities. Act 2 is explicitly a separate clean example and requires full lending for its three guided transfers. Act 4 summarizes a fresh chain with 20% voluntary holding and an unchanged 10% requirement. Conceptual sequence entries are rounded for display; the infinite-sequence limits are not represented as finite-chain balances.

Amounts are dollars, rounded to cents at transaction boundaries. A cleared outgoing loan replaces reserve assets with loan assets; a receiving bank gains reserves and a matching deposit liability. Required and excess reserves are derived measures of one reserve account. No equity is needed for these scripted transactions. Histories remain in memory; reloading starts fresh. There is no telemetry, persistence, imagery, sound, or global score.

## Verification

From the repository root:

```sh
node --test audit_tools/econ_rpg/game/games/money-in-motion/model.test.js
node --check audit_tools/econ_rpg/game/games/money-in-motion/app.js
node audit_tools/econ_rpg/game/games/money-in-motion/browser.test.cjs
```

The browser check needs Playwright and installed Chrome, plus the private server at `http://127.0.0.1:4179`. Set `BASE_URL` to use another origin. Set `PLAYWRIGHT_MODULE_PATH` if Playwright is outside ordinary Node module resolution. Optional `QA_SCREENSHOTS` writes full-page captures to the specified directory.

Verified: nine accounting tests (including 125 sampled partial-loan training paths); complete walkthroughs at 1440×900, 1280×720, 820×1180, 390×844, and 320×740; keyboard form order and activation; correction/retry; 44px controls; reduced motion; no page overflow or browser errors; formula revealed after the manual chain; transfer response required before the deeper explanation; restart and return navigation. Desktop, tablet, and mobile screenshots were visually inspected.

Existing games, shared styles, and the Games hub are unchanged by this prototype.
