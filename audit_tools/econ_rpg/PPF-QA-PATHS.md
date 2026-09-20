# The Economy’s Edge — instructor QA paths

Private preview: <http://127.0.0.1:4179/?scenario=ppf>. Internal ID `ppf`, version 1. Start over between routes.

361 legal paths are tested exhaustively. This 11-run review set covers every node/choice, conditional gate in both states, all five endings and all six scenes. Every completed run has six decisions.

Inspect routes 1–6 first: balanced full utilization; household emphasis; capital emphasis; continued slack; recovery without growth; and an expanded frontier that can supply more of both outputs. The rest complete branch and boundary coverage.

| # | Six choices | Ending | Scenes | Final C / K / U / G |
|---|---|---|---|---|
| 1 | balanced → hold → wait → full → hold → hold | recovered | balanced, slowdown, recovery | 5 / 5 / 8 / 1 |
| 2 | consumption → consumption → wait → phased → restart → hold | consumption | balanced, consumption, slowdown, recovery | 7 / 2 / 8 / 0 |
| 3 | capital → hold → wait → full → hold → hold | capital | balanced, capital, slowdown, recovery | 4 / 6 / 8 / 2 |
| 4 | balanced → hold → wait → phased → continue → prepare | slack | balanced, slowdown, recovery | 4 / 4 / 6 / 4 |
| 5 | balanced → hold → wait → equipment → restart → hold | recovered | balanced, slowdown, recovery | 5 / 5 / 8 / 2 |
| 6 | balanced → hold → wait → full → invest → consumption | growth | balanced, slowdown, recovery, capital, growth | 6 / 6 / 8 / 0 |
| 7 | capital → capital → coordinate → phased → hold → consumption | capital | balanced, capital, slowdown, recovery | 4 / 6 / 8 / 1 |
| 8 | consumption → capital → households → full → consumption → capital | recovered | balanced, consumption, slowdown, recovery | 5 / 5 / 8 / 1 |
| 9 | balanced → capital → wait → full → invest → hold | growth | balanced, capital, slowdown, recovery, growth | 3 / 8 / 8 / 2 |
| 10 | consumption → consumption → wait → phased → continue → restore | consumption | balanced, consumption, slowdown, recovery | 7 / 2 / 8 / 0 |
| 11 | consumption → capital → wait → full → invest → capital | growth | balanced, consumption, slowdown, recovery, capital, growth | 3 / 8 / 8 / 2 |

C = current consumption; K = capital production; U = utilization; G = future-growth preparation. Steps are illustrative conditions, not quantities to add or exchange across categories.

## Choice key

### What should the economy produce? (allocation)

- `consumption`: Lean toward household goods
- `balanced`: Keep a balanced production mix
- `capital`: Lean toward capital goods

### More output from the same resources (pressure)

- `consumption`: Shift more resources to household goods
- `hold`: Keep the existing mix
- `capital`: Shift more resources to capital goods

### Resources fall idle (shock)

- `wait`: Allow local restarts to proceed
- `coordinate`: Coordinate restarts immediately
- `households`: Restore household supply first

### Putting resources back to work (recovery)

- `full`: Complete a coordinated restart
- `phased`: Restart both sectors in stages
- `equipment`: Restart equipment production first

### Production for later growth (investment-ready)

- `invest`: Produce more equipment and training
- `hold`: Keep investment at its existing share
- `consumption`: Shift production toward household goods

### Recovery before new investment (investment-slack)

- `restart`: Finish restarts before adding new projects
- `continue`: Keep teams on their existing projects

### The next production mix (final-current)

- `hold`: Keep the production mix
- `consumption`: Give household goods more of the capacity
- `capital`: Give capital goods more of the capacity

### Using a larger capacity (final-expanded)

- `hold`: Increase both types of output
- `consumption`: Give household goods more of the capacity
- `capital`: Give capital goods more of the capacity

### Unfinished recovery (final-slack)

- `restore`: Complete the remaining restarts
- `prepare`: Continue preparing future improvements

## Focused economic checks

- At full utilization, a shift toward either current output reduces the other. Compare a small shift with a further push toward the same sector: specialized resources make the latter sacrifice larger.
- The shock reduces both current outputs and utilization. It leaves the same productive resources available; no frontier shift has occurred.
- Recovery can raise both outputs using idle resources. A full restart returns to the pre-shock mix, never beyond it.
- Current productive investment uses resources that could supply households. Future growth is preparation, not a third current output or instant capacity.
- In the expanded branch, compare “Increase both types of output” with changing the mix. All final expanded choices lie on the same larger frontier; more of one is still a choice to forgo some of the other.
- A fall in the future-growth indicator on delivery means prepared projects have entered use. It is not a fall in realized productive capacity.
- A high pipeline with slack remaining still uses the slowdown scene and ending. Recovery and project readiness are both required before delivered growth.
- The bottom-left panel means unused labor/equipment. Do not read crates or stored parts as a count of idle resources. The top-right panel shows preparation and productivity; it is not a third current-output sector.
- Reload at a decision, consequence and ending; effects and delivered growth must not apply twice. Switching scenarios and restarting one must preserve the others’ saves.
- Review all six path entries and four economics sections; try keyboard controls, 320px/390px layouts and a screen reader. No graph or formula is required.

## Exhaustive endings

- slack: 42
- growth: 43
- consumption: 94
- capital: 95
- recovered: 87
