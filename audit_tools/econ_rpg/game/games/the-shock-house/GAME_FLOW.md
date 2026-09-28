# The Shock House — puzzle flow

**Author / instructor spoilers below.** Players see the named economic explanation only after unlocking the exit and stepping outside.

## Continuous interior and discovery

The five legacy room IDs are now camera positions only; no room names or navigation doors appear. Left/right arrows, keyboard arrows, and touch swipes cycle exit → household furniture → workbench → media shelf → utility fittings → exit. All positions are available from the start. The policy dependency locks the cabinet shutter, not camera access. Back goes to the previous close-up.

| Discovery | Physical search | Quiet observation |
|---|---|---|
| Food | Bag → move jar and bread → crumpled receipt → unfold; separately peel newer labels | March $600; same basket in April $800 |
| Income | Desk → top drawer → wallet → open → unfold stubs | Same hours; take-home pay $3,000 / $3,200 |
| Housing and energy | Letter rack → move postcard → unfold notice; meter → lift cover → read | Rent $1,400 / $1,500; same 500 utility units cost $200 / $500 |
| Budget mechanism | Books → pull notebook → open pages | Latch compares the household accounts |
| Firm costs | Filing tray → move catalogue → pull folder → compare dated deliveries | $18 / $27 / $27 unit cost |
| Production | Machine → lift counter cover → inspect memory | 1,200 / 1,200 / 900; orders still available |
| Material | Bin → lift lid → count remaining spools | Six measures; $18 each; two per job |
| National facts | Television → separately select three retained bulletins | Real output 200 / 184; unemployment 5% / 8%; prices 100 / 108 |
| National synthesis | After the work plan, records → pull narrow register → compare bulletins → hidden clasp | Connect existing household, costs, and staffing evidence; set the three directions |
| Cause | Receiver → service flap → inscription; power knob → tune dates | Upstream terminal interruption connects earlier observations |

Raw fragments and moved-object markers persist in `inspectedObjects`. The satchel lets players revisit discovered observations. First-time players cannot access the national comparison until they have examined the separate bulletins and completed the work plan; older saves retain their already discovered register. Clocks, frames, a coat, tools, plants, and ordinary books add a small amount of ambient interaction. Hints first locate unfinished searches, then return to the mechanism’s three-level reasoning hints.

The economic mechanism specifications below retain their historical area names as author references; those names are not player navigation.

```text
Residence documents → BUDGET DRAWER ── badge ──→ INVOICE CABINET
                            │                        │
                 household ledger          cost record / press release
                            │                        │
                            │                WORK-ORDER PRESS
                            │                        │
                            └──────────┬──────── staffing record
                                       ↓
                         NATIONAL INDICATOR WALL
                                       │ power
                                       ↓
dated notice from drawer ─────→ BROADCAST RECEIVER ←──── invoice dates / $27
                                       │ room pass / cause record
                                       ↓
                            POLICY TRADEOFF MACHINE
                                       │ two-seal record
                                       ↓
                             HALL CAUSAL MECHANISM
                                       ↓
                         Escape → reveal → transfer → results
```

| Puzzle | Prerequisites / action | Output and economic fact | Used later |
|---|---|---|---|
| 1. Budget drawer · Residence | Inspect pay envelopes, itemized receipts, mantel bills, and notebook. Drag slips, or select then place, into March entries: pay 3000, rent 1400, food 600, utilities 200; April: 3200, 1500, 800, 500. Release the physical drawer latch. | Remainder falls 800 → 400 although pay rises. Household ledger, employee badge 047, March 14 interruption notice. | Badge → cabinet. Ledger → national wall. Date → radio several puzzles later. |
| 2. Invoice cabinet · Workshop | Insert badge. Read invoices and production log. Move invoices to matching rails: March 12, March 16, March 21. | Unit cost 18 → 27 before production falls 1200 → 900. Cabinet releases press; emergency invoice is evidence. | Cost record → wall and exit. Latest cost 27 × 10 → 270 kHz. Later invoice dates → receiver. |
| 3. Work-order press · Workshop | Cabinet released. Inspect input store. Place two material tokens on each of orders A and C; leave B empty. Pull the press lever. | A earns 80 for 54 additional cost; C earns 72 for 54. B earns only 48 for 54. Store two of six measures. Revised plan reduces staffing 120 → 90 and output 1200 → 900. Past lease is sunk. | Shift sheet → wall and exit. Scarcity, marginal decisions, opportunity cost, and employment response emerge through allocation. |
| 4. National indicator wall · Archive | Connect household, cost, and staffing records. Read national register. Rotate output DOWN, unemployment UP, prices UP. | National real output 200 → 184, unemployment 5% → 8%, price index 100 → 108; monthly inflation 2% previously → 8% now. Indicator plate collected. Receiver powers on. | Plate → exit. National figures substantiate the combined macro pattern rather than relying on local anecdotes. |
| 5. Broadcast receiver · Archive | Wall powered. Index: frequency is ten times latest unit cost. Notice supplies first date; emergency invoices supply next two. Drag/tap the physical knob or turn it with keyboard arrows to 270 kHz. Keep March 14, March 16, March 21 dispatches in order. | Terminal storm disruption → emergency routing costs → manufacturer cuts despite available orders. Cause clipping and Control Room pass. | Pass opens Control Room. Broadcast clippings begin final causal chain. |
| 6. Policy machine · Control Room | Receiver pass. Move lever at least once tighter and once looser. Place living-cost and work/output objective seals; acknowledge tradeoff. | Tighter: inflation pressure down, employment/output conditions worse. Looser: work/output supported, inflation pressure worse. No setting repairs the input network. Two-seal record. | Final artifact → Hall. Both objectives are necessary; no policy is graded as magically correct. |
| 7. Exit mechanism · Hall | All previous mechanisms complete. Place five event tiles; reorder using arrows. Each tile cites its supporting records. | Storm disrupts input deliveries → production costs rise → firms cut production and shifts → national output falls while unemployment and prices rise → policy faces an inflation–employment tradeoff. The door opens. | Reports are retrospective evidence. The puzzle orders economic causes and consequences, not document publication or discovery. Reveals the negative aggregate supply shock and SRAS shifting left with AD unchanged. |

## Instructional close

Completing this first case also unlocks **The Second Harvest**, a separate positive aggregate supply mission. See [MISSION_2.md](MISSION_2.md) for its five-step dependency chain. The coin, photograph, tram ticket, and gardening journal now activate only in that second mission; earlier optional interactions are removed from the first case.

1. **What happened?** Recaps the records the player recovered and the causal chain they assembled.
2. **Why did it happen economically?** Names the negative aggregate supply shock, higher costs, reduced SRAS, falling output, higher prices/inflation, weaker employment, and policy tradeoff. A labeled AD-AS diagram shows the change. Distinguishes nominal income from purchasing power and a price-level change from indefinite inflation acceleration.
3. **Can you use it somewhere else?** One forecast panel: widespread technology improvement lowers costs with AD unchanged. Set SRAS right/increase, output up, price level down. Retry feedback explains the reasoning without punitive scoring.

Then show escaped status, elapsed time, hints opened, seven recovered evidence records, seven solved mechanisms, and optional exploration/first-sequence/no-explicit-hint achievements. Elapsed time includes breaks and is not a mastery score.

## Nonlinear and recovery paths

- The locked Hall mechanism is inspectable immediately; unknown artifacts remain empty.
- Workshop and Archive documents are readable before dependent puzzles unlock. Missing connections point back to meaningful rooms.
- The receiver shows an unpowered state until the wall is complete; irrelevant stations/dates have harmless transcripts.
- Wrong budgets, invoice orders, work plans, indicators, broadcast sequences, and exit sequences remain editable. The receiver’s clear control never deletes its source broadcasts.
- A used badge leaves the Items tray only once the cabinet is solved; the dated notice remains in Evidence. The room pass is consumed on first entry. All evidence remains inspectable.
- Hints follow the current unsolved close-up, then the current room, then the next remaining mechanism. Solving a puzzle closes its hint.
- Saves include partial input values, recorded dispatches, both policy trials, and final artifact positions. Completed games resume into the saved ending stage.
- New Investigation confirms replacement; cancel and Escape retain the existing run. Storage errors show a readable fallback instead of stopping the game.

## Physical interaction pass

The illustrated pass adds five WebP panorama plates and nested miniature image scenes without changing this chain. Search the coat, lift its pocket flap, then collect and flip the exposed ticket. Open the desk drawer, then the wallet, to reach the pay stubs. Move the bag's groceries before inspecting its receipt. Component targets have no visible labels or hover text; camera pushes and reverse moves preserve orientation. See `ASSET_MANIFEST.md` for plate/state bindings and replacement instructions. Legacy room names below are internal save identifiers, not navigation labels shown to players.

Puzzle validation, rewards, prerequisites, final sequence, and the version-1 save format are unchanged. The room artwork now provides the clickable surfaces; region outlines are optional in Accessibility. No numbered hotspot UI, duplicate object list, room counter, or permanent puzzle checklist is shown. The source records have paper-specific layouts, while economic interpretation remains in the ending. Room changes reflect solved state and consumed materials; the satchel carries collected artifacts. Invoice and final-evidence ordering support drag/drop plus arrow-button alternatives, and all controls retain meaningful accessible names.
