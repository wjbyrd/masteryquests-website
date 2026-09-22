# Gameday Rivals — QA paths

Private preview: <http://127.0.0.1:4179/?scenario=gameday-rivals>. S = Standard Promotion; A = Aggressive Promotion. Read six letters from left to right. Both buttons have the same visual weight.

Exhaustive player histories: **64**. Seeds: every unsigned integer **0–31**. Total complete seeded seasons: **2048** (64 × 32), with **12,288 round reveals**. Each completed season has six rounds.

## Representative manual seasons

Open the linked seed. If an earlier save exists, choose New Season and confirm; QA replay reuses the URL seed. Ordinary play without a seed generates a fresh seed. Resume keeps the saved seed and moves to the next unresolved round.

| Purpose | Seed | Player S/A | Rival S/A | Classification |
|---|---:|---|---|---|
| Mostly mutual Standard | [1](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=1) | SSSSSS | SASSSS | Stable Competition |
| Mostly mutual Aggressive | [0](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=0) | SASAAA | SAAAAA | Promotion War |
| Player repeatedly exploits restraint | [1](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=1) | SAAAAA | SASSSA | Opportunistic Season |
| Rival repeatedly exploits the player | [12](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=12) | SSSSSS | SASSAA | Opportunistic Season |
| Retaliation cycle | [0](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=0) | SSASAS | SASASA | Retaliation Cycle |
| Mixed / uneasy season | [0](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=0) | SSSASS | SASAAS | Uneasy Restraint |
| Final temptation after restraint | [2](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=2) | SSSSSA | SSSSSS | Stable Competition |
| Final escalation after hostile history | [0](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=0) | SASAAA | SAAAAA | Promotion War |
| Market-Share Chase | [0](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=0) | SSSAAS | SASAAA | Market-Share Chase |

## All player histories

1. `SSSSSS`
2. `SSSSSA`
3. `SSSSAS`
4. `SSSSAA`
5. `SSSASS`
6. `SSSASA`
7. `SSSAAS`
8. `SSSAAA`
9. `SSASSS`
10. `SSASSA`
11. `SSASAS`
12. `SSASAA`
13. `SSAASS`
14. `SSAASA`
15. `SSAAAS`
16. `SSAAAA`
17. `SASSSS`
18. `SASSSA`
19. `SASSAS`
20. `SASSAA`
21. `SASASS`
22. `SASASA`
23. `SASAAS`
24. `SASAAA`
25. `SAASSS`
26. `SAASSA`
27. `SAASAS`
28. `SAASAA`
29. `SAAASS`
30. `SAAASA`
31. `SAAAAS`
32. `SAAAAA`
33. `ASSSSS`
34. `ASSSSA`
35. `ASSSAS`
36. `ASSSAA`
37. `ASSASS`
38. `ASSASA`
39. `ASSAAS`
40. `ASSAAA`
41. `ASASSS`
42. `ASASSA`
43. `ASASAS`
44. `ASASAA`
45. `ASAASS`
46. `ASAASA`
47. `ASAAAS`
48. `ASAAAA`
49. `AASSSS`
50. `AASSSA`
51. `AASSAS`
52. `AASSAA`
53. `AASASS`
54. `AASASA`
55. `AASAAS`
56. `AASAAA`
57. `AAASSS`
58. `AAASSA`
59. `AAASAS`
60. `AAASAA`
61. `AAAASS`
62. `AAAASA`
63. `AAAAAS`
64. `AAAAAA`

## Classification reachability

- Promotion War: 338 seasons
- Retaliation Cycle: 647 seasons
- Opportunistic Season: 535 seasons
- Stable Competition: 161 seasons
- Market-Share Chase: 48 seasons
- Uneasy Restraint: 319 seasons

## Manual checks

- Before choosing, only completed rival actions appear in the ledger. Current strategies and all payoff-matrix/theory terminology remain absent until the appropriate reveal/debrief.
- Click either strategy once. Both actions appear together, both profits post once, shares sum to 100%, and the ledger gains one row. Double-clicks must not award another payoff.
- Reload immediately after a reveal: resume at the next unresolved game with the same totals, shares and seed. After Game 6, resume the full debrief. No previously resolved game pays twice.
- Compare Standard/Standard and Aggressive/Aggressive: the Delivery activity comparison below the image changes from Moderate/Moderate to High/High while joint profit falls. Firm names and labels accompany orange/green segmented bars. Background crowds depend only on the game.
- Inspect every scene: only the supplied raster image appears in the image stage. No P/R markers, SVG vehicles, canvas or dynamically positioned units remain. The activity comparison must stay below the image at all widths.
- Only Game 6 uses the night image. Each earlier game uses its own supplied image; a missing file must show a named asset error, not another scene.
- At 320px and 390px, read both reveal cards, status totals and the stacked ledger. Use Tab, Enter, Space, Escape and the skip link. No color-only result or animation is required.
- At desktop/tablet widths the scene is capped at 520px without cropping; phones retain the wider existing frame. Inspect 1440, 1280, 1024, 920, 900, 768, 540, 390 and 320px. Scroll across the Season History boundary: the non-sticky desk stays in its own row with a clear gap.
- In intro, reveal and debrief, use Enter to open How to read these numbers and Space to close it. The native disclosure starts collapsed and retains a visible state marker; expanded help must not collide with history. The desk has four metrics, progress and help, with no repeated firm identity lines.
- The final page includes all six outcomes in the ledger, both firms’ counts/profits/shares, industry profit, the base matrix, T > R > P > S, one-shot incentives and the independent mutual-Standard comparison.
- New Season resets only this game. Check that all four older RPG saves and their interfaces still work.

## Assets and final status

**Missing reference:** `canonical-day.webp` is not present in the supplied runtime folder. All six required round images exist. No substitute canonical image is generated or silently selected. Canonical-source geometry comparison awaits that file.

## Instructor-play patch: weighted order share

The old ±6 percentage-point accumulation and 25–75% clamp are removed. Centralized round order splits are S/S 50/50, A/S 62/38, S/A 38/62 and A/A 50/50. Weighted orders = round order-share percentage × that game’s existing demand multiplier. Season share = 100 × own weighted-order total / both firms’ weighted-order total. No profit enters this formula.

Reveals distinguish Game-Day Order Share from Season Market Share. The ledger includes each game’s order split and market weight. Display rounds to one decimal; complementary labels sum to 100%. Full precision is retained internally and final shares are recalculated from completed history. Old private saves reconstruct shares from verified choices and weights; incompatible or corrupted non-share data fail visibly.

Direct regression: all rounds symmetric except a player A/S win in the Small-Team Game (0.80) and a rival S/A win in the Biggest Rival game (1.50) produce player 48.8085106383%, rival 51.1914893617% (display 48.8% / 51.2%). Reversing those wins gives 51.2% / 48.8%. Equal win counts therefore do not imply 50/50.

Patch validation: 2,048 complete seeded seasons, 12,288 reveals; all round splits/weights, reproducible complementary season shares, both differently weighted win cases and unchanged profit/rival/classification paths are asserted. September 22 final result: 53/53 unit, regression and publication tests passed, plus 42 complete browser seasons and all nine-width disclosure/scroll-boundary checks. The 27 layout fixtures cover intro, reveal and debrief, with help closed/open/closed again at four scroll positions. Activity bars and image hashes remain intact; no overlap, overflow or runtime error was found. See GAMEDAY-RIVALS-REPORT.md for evidence.

## Late-round rival inspection — September 22

Replay seed 20 or 25 with player SSSSSS: the rival chooses SSSSSA. With the last two player choices Standard, Game 6 aggression probability is 22% (base 22% + final pressure 12% − restraint adjustment 12%). Without that pressure it is 10%; with Game 5 pressure and the same history it is 18%. The final draw for seed 20 is 0.1917954453, so the final pressure changes the action to Aggressive. Its $232,500 payoff comes from 155 × 1.50 thousand dollars against Standard.

Across all 2,048 fixed QA seasons, 1,208 final rival actions are Aggressive. Removing only final pressure for the same prior histories and draws gives 928: 280 additional Aggressive choices. This is deterministic coverage, not an estimate from independent random trials. Current player actions remain excluded from the rival input. No rival algorithm, payoff, weighted-share or classification change was made for the layout pass.

Detailed results, commands and browser evidence are recorded in GAMEDAY-RIVALS-REPORT.md. Assertion scripts exit nonzero on failure; rerun the unit and browser scripts before treating later code changes as validated.
