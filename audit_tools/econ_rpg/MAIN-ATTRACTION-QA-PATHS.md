# The Main Attraction — instructor QA paths

Private preview: <http://127.0.0.1:4179/?scenario=main-attraction>. Generated with `node audit_tools/econ_rpg/main-attraction-qa.mjs --write`.

665 legal runs are tested exhaustively; each has six decisions. These 9 playthroughs cover all seven authored nodes, 21 node/choice pairs, five endings, six art states, every funding gate both open and closed, and both membership/maintenance consequence branches. They are a review set, not ranked answers.

Inspect rows 1–6 first: premium operation; broad access/crowding; funded expansion; deferred upkeep; incremental investment under competition; and depleted funds. Each row uses the six choice IDs below. Start over between rows.

| # | Six choices | Ending | Scenes encountered |
|---|---|---|---|
| 1 | raise → reserve → single → overhaul → hold → differentiate | premium | baseline, premium |
| 2 | lower → open → members → partial → hold → broaden | crowded | baseline, crowded |
| 3 | raise → priority → dates → partial → expand → broaden | built | baseline, premium, construction, upgraded |
| 4 | lower → open → members → defer → expand → course | reputation | baseline, crowded, maintenance |
| 5 | hold → reserve → single → partial → throughput → course | mixed | baseline |
| 6 | lower → reserve → single → overhaul → throughput → broaden | mixed | baseline, crowded |
| 7 | raise → open → members → defer → expand → broaden | reputation | baseline, premium, maintenance |
| 8 | lower → reserve → dates → defer → expand → broaden | reputation | baseline, crowded, construction, maintenance |
| 9 | lower → priority → single → overhaul → expand → broaden | crowded | baseline, crowded, construction, upgraded |

## Choice key

### The price of a day out

- `raise`: Raise the admission price
- `hold`: Keep the current admission price
- `lower`: Lower the admission price

### Queue management (both branches)

- `reserve`: Limit daily admissions with reservations
- `priority`: Offer a paid priority-access pass
- `open`: Keep general queues and walk-up admission

### Different guests, different dates

- `single`: Keep one admission price
- `dates`: Use peak and off-peak prices
- `members`: Offer off-peak memberships to local residents

### The signature ride

- `overhaul`: Close now for a full overhaul
- `defer`: Defer the major overhaul
- `partial`: Make partial repairs during short closures

### Investing in capacity

- `expand`: Build a major new attraction
- `throughput`: Improve loading and ride throughput
- `hold`: Keep existing capacity and save the funds

### A new competitor

- `broaden`: Broaden access with lower-priced packages
- `differentiate`: Strengthen the premium experience
- `course`: Keep existing prices and services

## Focused checks

- Pricing: compare raise/hold/lower. Market power still faces a downward-sloping demand curve; the initial inelastic response is a scenario assumption, not a universal law.
- Segmentation: compare members after raise with members after hold/lower. New business versus discounted existing sales changes the earnings effect. Dates trades retained surplus for access and smoother demand; one price retains more surplus with less targeting.
- Gates: lower → reserve → members leaves only partial/defer maintenance; lower → reserve → single → overhaul blocks expansion; add throughput and premium programming is unavailable. Confirm no gate can be bypassed after reload.
- Delivery: expand spends earnings without adding capacity at decision 5. Construction may be masked by maintenance; decision 6 delivers capacity once. Reload at both phases to verify no double delivery.
- Maintenance: compare defer after lower versus raise. Deferred deterioration persists into the next season even after expansion. Throughput and expansion do not erase the old ride’s problem.
- Competition: try all three final responses. The rival affects willingness to pay without instantly removing all market power. No response is labeled correct.
- Read all six path entries and their expandable details. Review marginal revenue versus price, price-discrimination assumptions, financing/ordinal simplifications and the ordering of overlapping endings.
- Resume a consequence, a decision and an ending. Switch to Room to Stay, then back; both saves must persist independently. Restart or replay one and confirm the other is unchanged.
- At 320px/390px, check all six images, the complete debrief and optional indicator help. Play with Tab/Enter/Space; test a real phone and screen reader during instructor review.

## Exhaustive outcome counts

- reputation: 150
- crowded: 84
- built: 123
- premium: 50
- mixed: 258
