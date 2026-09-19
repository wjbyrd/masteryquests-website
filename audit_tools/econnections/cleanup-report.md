# Econ-nections v2 cleanup implementation report

Completed September 19, 2026. Scope: the existing Econ-nections game, its tests, and documentation.

## Completion UI and footer

- Successful results have one headline: **“Four Econ-nections. Nicely done.”** Removed the success eyebrow, extra live-region victory message, selection-status completion text, explanatory congratulations, and return-tomorrow paragraph from the solved view. Focusing the headline announces success. Loss wording is retained.
- Active time, strikes used, current/best streaks, Copy results, and the other-domain action remain.
- Removed the footer’s reset/play-duration line. The local date and device/privacy link remain.

## Mobile adjustments

Only active tile typography at widths up to 420px changed: 14px → 13px at the default root size, line height 1.3 → 1.25, padding 15px 10px → 13px 8px. The existing two-column grid, 8px gaps and 80px minimum tile height remain. Text wraps at spaces, with an emergency break for an overlong word. Solved cards, colors, focus styling and sticky actions are unchanged.

Browser checks exercise all 384 labels at 320, 390, 420 and 768px. No horizontal/text overflow; tile/action targets meet 44px; controls are visible and uncovered in the emulated visual viewport. Touch interaction, solved-card font sizes/line height, and result actions pass. Screenshots were visually reviewed. Browser testing uses Chromium mobile emulation; physical-device browser chrome was not tested.

## Editorial audit

Reviewed all 96 active relationships (48 Micro, 48 Macro), all 384 labels, their explanations, concept references and editorial exclusions. Reviewed every changed relationship against the other relationships appearing with it in the existing calendar. Changed 29 labels; retained 355. No group membership, tile positions, titles, difficulty, category, explanation, concept/objective references, notes, exclusions or calendars changed.

| Domain | Group ID | Old wording | New wording | Reason |
| --- | --- | --- | --- | --- |
| Micro | mi-public-examples | Open scientific theorem | Open scientific knowledge | Natural description of shared nonrival knowledge; retains open access without adding “public.” |
| Micro | mi-public-examples | Nonexclusive flood barrier | Community flood barrier | Familiar shared flood-protection example instead of an artificial modifier. |
| Micro | mi-public-examples | Free unencrypted broadcast | Free-to-air radio | Familiar term that preserves free, nonexclusive reception. |
| Micro | mi-floor-chain | Fewer units buyers want | Buyers want fewer units | Natural subject–verb order; same quantity-demanded meaning. |
| Micro | mi-floor-chain | More units sellers offer | Sellers offer more units | Natural subject–verb order; same quantity-supplied meaning. |
| Micro | mi-scale-sources | Spread setup costs | Spreading setup costs | Describes a source of scale savings instead of an ambiguous command. |
| Micro | mi-surplus-meaning | Willingness to pay less price | Willingness to pay minus price | Makes subtraction clear; avoids reading “pay less” as willingness to bargain. |
| Micro | mi-incidence | Purchases resist price changes | Quantity barely responds to price | Expresses price responsiveness in natural economic language. |
| Micro | mi-profit-trap | Normal owner return earned | Normal return to owner | Removes awkward noun stacking. |
| Micro | mi-collusion | Secret extra sales tempting | Incentive for secret extra sales | Natural phrase describing the same cartel-cheating incentive. |
| Micro | mi-monopoly-output | Set marginal revenue equal to cost | Marginal revenue = marginal cost | States the canonical condition precisely without unexplained abbreviations. |
| Macro | ma-frictional | Quitter seeking better fit | Job leaver seeking a better fit | Neutral, natural description of voluntary job search. |
| Macro | ma-government-buying | Public teacher salaries | Public school teacher salaries | Identifies the institution naturally. |
| Macro | ma-stocks | Capital installed today | Capital in place today | Refers to holdings at a date, avoiding a flow of installation during that day. |
| Macro | ma-human-capital | Apprenticeship practice | Apprenticeship training | Familiar description of skill formation. |
| Macro | ma-human-capital | Technical certification study | Studying for technical certification | Natural wording for the same educational activity. |
| Macro | ma-cyclical-examples | Demand-collapse construction layoff | Construction layoff in a recession | Removes a contrived compound while retaining the cyclical context. |
| Macro | ma-saving-channels | Equity share markets | Stock markets | Familiar equivalent; removes redundant wording. |
| Macro | ma-reserve-constraints | No public currency leakage | Public holds no additional cash | States the textbook assumption without the obscure leakage shorthand. |
| Macro | ma-reserve-constraints | Fixed required reserve fraction | Fixed required reserve ratio | Uses standard reserve terminology. |
| Macro | ma-labor-denominator | Counted unemployed decreases | Unemployed count falls | Correct, compact noun phrase and verb. |
| Macro | ma-fisher | Purchasing-power yield preserved | Real return preserved | Standard economic wording for the same return. |
| Macro | ma-quantity-growth | Velocity growth stays zero | Velocity stays constant | Natural equivalent of zero velocity growth. |
| Macro | ma-bank-capital | Leverage amplifies equity damage | Leverage magnifies equity losses | Uses conventional financial-loss language. |
| Macro | ma-reserve-vs-capital | Cash alone need not absorb losses | Cash holdings are not capital | States the intended balance-sheet distinction clearly. |
| Macro | ma-multiplier-limits | No induced interest-rate offset | No interest-rate crowding out | Uses the standard mechanism name. |
| Macro | ma-multiplier-limits | Constant spending propensity | Constant marginal propensity to consume | Names the precise textbook assumption. |
| Macro | ma-unemployment-rates | Jobless share of labor force | Unemployed share of labor force | Uses the measured category rather than all people without jobs. |
| Macro | ma-unemployment-rates | Discouraged workers excluded from LF | Discouraged workers outside labor force | Expands an unnecessary abbreviation and uses natural wording. |

The public-goods replacements were checked against every co-occurring group; goods-classification and spillover exclusions remain intact. The other edits retain the same economic relationships and existing cross-category ambiguity. No newly introduced alternate full grouping was identified. Remaining editorial concern: faculty/student playtesting can still expose alternate interpretations; structural validation cannot establish semantic uniqueness. Conditional textbook language and legitimate ambiguity were intentionally retained.

## “1 away” and compatibility

The engine computes set intersections with remaining unsolved answer sets and returns only `nearMiss: true` when the maximum overlap is exactly three. The controller appends exactly **“1 away.”** beside incorrect feedback in the existing polite, atomic live region. It reveals no group, correct subset, wrong tile or other proximity value. New misses still cost one strike; repeats retain the duplicate warning and cost none. Third-strike losses still reveal the board, with the hint when applicable. Selection and focus behavior are preserved.

Maximum-zero and multiple-three-overlap cases use synthetic sets in engine tests: neither is possible for a legal four-tile submission on the published disjoint boards. Solved tiles are rejected and only remaining groups are passed to the overlap helper.

Pool version remains **2**. Identity and shuffle depend on version/domain/date, not labels. Saves contain stable `groupId:tileIndex` IDs; positions are unchanged. Old records replay with the new display text while keeping attempts, strikes, tile order, elapsed time, solved/completed status and streaks. No migration, storage-schema change, progress wipe or compatibility shim is needed. The transient hint is not saved. Frozen pre-cleanup checks verify all 120 puzzle identities/orders, complete non-label relationship metadata, calendars and six historical partial/won/lost records across both domains. V1 remains unchanged.

## Regression results

- `node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs` — **18 passed**. Includes exact overlap 0/1/2/3/4, multiple qualifying synthetic groups, duplicate/reload protection, solved-group exclusion, third-strike loss, wins with two strikes, v1/v2 compatibility, local dates, DST, streaks, and five years of deterministic selection per domain.
- `node audit_tools/econnections/content-audit.mjs` — **PASS**, all 120 boards and 96 relationships; normalized labels, references, explanations, exclusions, canonical concepts, objectives and difficulty mix validate. Maximum label length is 39, under the existing 40-character limit.
- `node audit_tools/econnections/browser.test.mjs` — **15 passed** with installed Chrome and bundled Playwright. Includes exact success/footer copy, local dates, real clipboard copying and denied-permission fallback, both other-domain action variants, keyboard/live-region behavior, near misses, repeat protection after reload, mobile/touch layouts, local rollover, multi-tab synchronization, history and unavailable storage. No runtime errors.
- `node audit_tools/public_documentation/check.cjs` — **PASS**, 17 pages / 554 links, zero broken links.
- Screenshots: ignored `tmp/econnections/cleanup-board-*.png`, `cleanup-controls-*.png`, `cleanup-solved-*.png`, plus the existing desktop captures.

## Modified files

1. `games/econnections/econnections.js`
2. `games/econnections/engine.js`
3. `games/econnections/index.html`
4. `games/econnections/econnections.css`
5. `games/econnections/pools/micro-v2.js`
6. `games/econnections/pools/macro-v2.js`
7. `games/econnections/README.md`
8. `audit_tools/econnections/engine.test.mjs`
9. `audit_tools/econnections/calendar-date.test.mjs`
10. `audit_tools/econnections/browser.test.mjs`
11. `audit_tools/econnections/fixtures/v2-pre-cleanup.json` (new)
12. `audit_tools/econnections/cleanup-report.md` (new)

The Games page, Composer, quest engines, date arithmetic, local-midnight architecture, streak rules, three-strike maximum, board selection/calendars, privacy model, localStorage architecture and unrelated systems are unchanged.
