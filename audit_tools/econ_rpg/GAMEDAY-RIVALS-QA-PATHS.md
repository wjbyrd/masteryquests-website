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
- Compare Standard/Standard and Aggressive/Aggressive: outlined P/R delivery units become busier in the latter, but joint profit falls. Background crowds depend on the game, not the chosen strategy.
- Inspect the eight fixed road slots at full scene size. P/orange and R/green each retain their own vehicle/box colors. Opposing lanes have opposite orientations. Overlays must stay off sidewalks and crosswalks.
- Only Game 6 uses the night image. Each earlier game uses its own supplied image; a missing file must show a named asset error, not another scene.
- At 320px and 390px, read both reveal cards, status totals and the stacked ledger. Use Tab, Enter, Space, Escape and the skip link. No color-only result or animation is required.
- The final page includes all six outcomes in the ledger, both firms’ counts/profits/shares, industry profit, the base matrix, T > R > P > S, one-shot incentives and the independent mutual-Standard comparison.
- New Season resets only this game. Check that all four older RPG saves and their interfaces still work.

## Assets and final status

**Missing reference:** `canonical-day.webp` is not present in the supplied runtime folder. All six required round images exist. No substitute canonical image is generated or silently selected. Canonical-source geometry comparison awaits that file.

**Verified September 21, 2026:** 49/49 unit, regression and publication tests passed. Gameday browser QA passed 42 complete seasons (14 coverage paths × 3 widths), all six classifications, 72 round/activity/width screenshots, reload/reset/keyboard checks and explicit failure handling. All four older browser suites also passed (152 complete regression runs). No unresolved runtime test failure remains. The missing canonical reference above is still a limitation, not a passed reference comparison.

Initial QA found two test-harness issues: JavaScript strict equality distinguishes negative zero in a complementary-share assertion, and a notice assertion ran before the dynamically loaded controller mounted. Both assertions were corrected and rerun successfully; neither required a gameplay rule change. Vehicle indicators were enlarged within their verified road footprints after visual inspection.

Detailed results, commands and browser evidence are recorded in GAMEDAY-RIVALS-REPORT.md. Assertion scripts exit nonzero on failure; rerun the unit and browser scripts before treating later code changes as validated.
