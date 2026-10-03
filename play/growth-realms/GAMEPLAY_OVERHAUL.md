# Growth Realms — functional gameplay / model overhaul report

## Scope and outcome

The player now selects and controls one city. The computer controls the other through an independent, state-sensitive doctrine. Six cycles use 20 whole development points each, with no sliders. Both city views and Combined Comparison remain available. Existing map geometry, art, cranes, dust, vehicles, and animation timing were preserved. The new UI only supports the changed game logic.

No routine quiz, arbitrary score, automatic Cycle 4 shock, external telemetry, deployment, or major visual overhaul was added.

The complete file inventory is in `README.md`. Added modules are `cpu.js` and `session.js`; the gameplay, model, config, debrief, shell, functional CSS, tests, and documentation were updated. `city-renderer.js`, `tests/serve.mjs`, and the asset replacement instructions were not changed.

## Gameplay and state transitions

`choosing → planning → building → resolved → planning` repeats through six cycles, then `finished → choosing` on replay.

Every new cycle clears the player's allocation to zero and restores 20 available points. Plus is blocked when no points remain; minus is blocked at zero. Commit is blocked unless the four nonnegative integer allocations sum to 20. Controls lock during construction. A duplicate commit or duplicate completion cannot resolve a cycle twice.

At commitment, the rival plan is computed using only its own state and doctrine. Both outcomes use the same pre-cycle regional technology frontier and are computed as a transaction. The existing construction hooks receive each city's actual allocation. Stocks and both histories become visible together after construction. The rival's allocation is revealed only after resolution, while its doctrine name remains hidden until the final report. Reduced-motion mode resolves without the delay.

Replay removes the current run, allocations, pending transactions, histories, bottlenecks, report contents, progress value, selected view, and stage counters. The initial city choice is available again. The previous doctrine ID is retained solely to avoid immediately reselecting the same doctrine; it does not affect economics or city state.

## Exact economic formulas

These formulas describe the implementation, not student-facing material. Unrounded JavaScript numbers are retained internally. Capital, resource services, education, and output use illustrative stock/index units. A cycle is not calibrated to a literal year.

Let `K` = capital, `R` = resources, `E` = completed education, `T` = technology, `L` = labor, `Q` = accumulated research capacity, and `P` = education pending from last cycle. Allocations `aK`, `aR`, `aT`, and `aE` sum to 20.

### Production at any state

```text
k = K / L
u = k / (k + 4)                                      equipment complement
H = 1 + 0.65 × E / (E + 120) × u                      human-capital multiplier
A(E,T) = 0.2 + 0.8 × E / (E + 85 × T^1.2)            technology adoption
T_effective = 1 + (T - 1) × A(E,T) × u
Y_potential = 8 × L × k^0.36 × H × T_effective
C = 26 + 0.24 × R                                    resource/workforce capacity
D = L + 0.018 × K + 0.004 × Y_potential               service demand
resourceUtilization = D / C
z = min(1, C / D)                                    capacity coverage
Y = Y_potential × z^0.8
outputPerWorker = Y / L
```

The concave capital power creates diminishing returns. Equipment also complements skill and technology use, preventing a capital-poor economy from getting full value from trained workers and methods without equipment. Holding other stocks fixed, tests verify falling marginal capital gains for both starts over 15 successive capital-stock levels.

Education's direct bonus saturates; technology can keep improving production methods. As available technology becomes more demanding, inadequate education lowers the usable fraction. Resources have no additional direct production effect once demand is covered, so they are not an indefinite productivity engine.

### Investment, training, and technology

```text
K_candidate = K + 9 × aK
R_candidate = R + 4.25 × aR
E_candidate = E + P + 4.25 × aE × 0.35
P_next = 4.25 × aE × 0.65

researchSkill = 0.2 + 0.8 × E_candidate / (E_candidate + 120)
researchEffort = Q + 0.9 × aT
effectiveResearch = researchEffort / (1 + researchEffort / 200)
innovation = T × 0.0035 × effectiveResearch × researchSkill
frontier = max(pre-cycle technology of both cities)
diffusion = max(0, frontier - T) × aT × 0.0125 × A(E_candidate, T)
T_candidate = T + innovation + diffusion
Q_next = Q + 2.75 × aT
```

Only 35% of new education enters the completed stock immediately; 65% completes next cycle. Existing completed education persists. Research generates a small immediate effect, adds to a persistent knowledge stock, and earns most benefits later. Research effectiveness has diminishing returns with research effort, while its effect on technology is multiplicative. Education separately affects worker effectiveness, adoption, and research productivity. Initial research capacity can generate incremental original innovation even without new research points.

The pre-cycle regional frontier is shared knowledge availability, not a CPU counter-strategy. There is no player-allocation parameter in the CPU decision function.

### Workforce and final recomputation

First evaluate the candidate economy using the old `L` and the candidate stocks above. Then:

```text
laborSpace = min(1, C_candidate / (L × 1.015))
growthRoom = (z_candidate × laborSpace)^2
migration = 1 if all three are true:
    C_candidate / D_candidate > 1.12
    candidate outputPerWorker >= 28
    candidate capitalPerWorker >= 6
otherwise migration = 0
L_next = L + L × 0.015 × growthRoom + migration
```

Finally reevaluate the full production equations with the candidate stocks and `L_next`. Labor is never allocated or purchased. Growth is softened under resource pressure; one worker is the maximum migration bonus. Fractional precision is internal only; all worker displays round to whole people.

### Changes and gap accounting

```text
outputGrowthRate = 100 × (Y_end / Y_start - 1)
productivityGrowthRate = 100 × (OPW_end / OPW_start - 1)
averageOutputGrowthPerCycle = 100 × ((Y_final / Y_initial)^(1/6) - 1)
Technology index displayed = round(100 × T)

signedRelativeGap = 1 - OPW_Rivermark / OPW_Meridian
relativeGap = abs(signedRelativeGap)
gapChangePercent = 100 × (relativeGap_final - relativeGap_initial) / relativeGap_initial
absoluteGap = abs(OPW_Meridian - OPW_Rivermark)
```

A negative gapChangePercent means narrowing. If the initial relative gap is zero, percentage change is null/undefined instead of division by zero. The classification is Little change within 0.02 of the starting relative gap, otherwise Gap narrowed or Gap widened. Overtaking is separately identified. Both raw output-per-worker differences and relative gaps appear in the final report, explicitly noting that they can move differently. The denominator is Meridian's contemporaneous output per worker, preserving the original comparison convention.

## Endogenous diagnostics

The production modifiers are continuous (with a coverage cap at adequacy). Thresholds label the resulting state; they do not impose extra discrete penalties.

| Condition | Diagnostic |
| --- | --- |
| Capacity coverage `< 0.98` | Resource shortage |
| Adoption `< 0.55` and research capacity above its starting stock | Technology adoption constraint |
| Education per worker `> 1.6` and capital per worker `< 5` | Skills underused because equipment is scarce |
| Resource utilization `< 0.68` | Excess capacity; weak direct resource payoff |
| Capital per worker `> 30` | Strong capital saturation / diminishing returns |

Cycle names are briefings, not event triggers. An identical economic state and investment plan give the same economic result in Cycle 1 or Cycle 4. There is no late-stage water-demand multiplier.

## CPU doctrine rules

A new rival doctrine is sampled uniformly from the city's valid pool, excluding the previous run's doctrine where possible. Frontier Strategy is allowed only for Meridian. Other doctrines are available to either city. The random selection is the only stochastic part; allocations and economic resolution are deterministic thereafter.

| Doctrine | Base weights K/R/Research/Education | Resource response multiplier | Education response multiplier | Capital maturity shift | Research maturity shift | Education-to-research shift |
| --- | --- | --- | --- | --- | --- | --- |
| Balanced Growth | 5/5/5/5 | 1 | 0.7 | 1 | 1 | 0 |
| Industrial Push | 12/4/2/2 | 1.2 | 0.5 | 7 | 4 | 0 |
| Human Capital | 3/3/3/11 | 0.8 | 0.8 | 1 | 1 | 6 |
| Innovation | 2/3/10/5 | 0.8 | 1.5 | 0.5 | 1 | 0 |
| Resource Security | 4/11/2/3 | 1.5 | 0.5 | 1 | 1 | 0 |
| Frontier Strategy | 1/3/8/8 | 1 | 1 | 0 | 1 | 0 |

Weights are not allocations. The CPU adjusts them from its own accumulated state:

```text
maturity = capitalPerWorker / (capitalPerWorker + 12)
wK -= doctrine.capitalShift × maturity
wResearch += doctrine.researchShift × maturity
trainingShift = doctrine.educationToResearch × E / (E + 120)
wEducation -= trainingShift
wResearch += trainingShift
wResources += max(0, resourceUtilization - 0.85) × 25 × doctrine.resourceResponse
wEducation += max(0, 0.65 - technologyAdoption) × 12 × doctrine.educationResponse
Each weight is floored at 0.25.
exactShare_i = 20 × weight_i / sum(weights)
```

Floor the four exact shares, then distribute remaining points by largest fractional remainder (ties use category order). This guarantees a valid whole-point budget. CPU history is recorded each cycle; its accumulated stocks carry the consequences of that history into future decisions. Current player plans are never read. Prior player technology can influence the shared adoption frontier and thereby the rival's later economic state, which is an indirect knowledge effect rather than counter-allocation.

## Acceptance evidence

All 12 model-test groups pass, covering every acceptance case A–L plus transaction safety, history/export, and simultaneous resolution. The requested strategy comparisons use the same independent Balanced Growth rival doctrine for each paired run.

| Case | Evidence |
| --- | --- |
| A: Rivermark capital-heavy | Capital-only productivity gains by cycle: 4.005, 1.990, 1.257, 0.849, 0.595, 0.424. Early gains are strong; later gains weaken. |
| B: Meridian capital-heavy | Gains: 2.230, 0.662, 0.548, 0.462, 0.395, 0.342. Smaller from the beginning. Pure capital concavity is also tested with resources held abundant. |
| C: Research with weak education | Rivermark research-only finishes at 12.08 output/worker and 27.8% adoption, despite increasing technology. Meridian's research-only adoption falls to 40.3%. |
| D: Research plus education | Rivermark 0/0/10/10 reaches 15.72 output/worker and 58.3% adoption; Meridian reaches 77.25 versus 71.75 with research only. Both outperform double research spending without added skills. |
| E: Resource neglect | 10/0/5/5 creates shortages by cycle 2 in both cities. Final coverage: Meridian 83.8%, Rivermark 79.0%. Identical-stock cycle-1/cycle-4 checks prove there is no scheduled shock. |
| F: Excess resources | Resource-only gives 100% coverage but only 45.31 and 11.27 output/worker at the finish, below the balanced plans. More resources after adequacy has exactly zero direct production effect. |
| G: Different starts | The five required plans yield different productivity leaders for Meridian and Rivermark; the same plan has different returns and constraints. |
| H: Different doctrines | All valid doctrines generate unique six-cycle allocation paths. CPU final output/worker ranges 57.58–77.71 for Meridian and 19.87–26.46 for Rivermark in the paired balanced-player runs. |
| I: Independence | Changing the player's uncommitted plan from 20 capital to 20 research leaves the same rival's allocation identical. The CPU function has no access to the player plan. |
| J: Path dependence | Prior training increases the next research technology gain; prior capital expansion increases the marginal value of resources; skilled workers gain more from adequate equipment. Training completion persists into the next cycle. |
| K: Replay | State/module and browser tests verify fresh cities, zero allocations, empty histories/transactions/reports, initial counters, cleared progress, alternate player choice and a changed valid doctrine. |
| L: No obvious universal fixed mix | The required five fixed plans have different leaders by starting city. A further 572 runs (286 two-point-grid fixed mixes per city) also produce different leaders. No universal fixed-plan balancing failure was found in this sweep. |

The browser test completes six-cycle runs with each player city. It also checks keyboard choice/allocation, no range inputs, one editable economy, exact remaining pool, all three views, hidden/unrevealed rival allocation, both-city construction, delayed stock publication, integer labor/technology displays, reduced motion, comparison, final policy section, transfer feedback, and replay. At widths 320/390/768/1440, no horizontal page overflow or page-level errors occurred. Screenshots of choice, controls, both-city construction, phone layout, and final report were inspected.

## Strategy strengths and limitations before art work

The strongest **requested** repeated mix for Meridian is 2/3/8/7; Rivermark prefers 10/4/3/3. In the wider two-point grid, the strongest fixed mixes for final output per worker are Meridian 0/2/12/6 (81.38) and Rivermark 8/2/4/6 (28.42). These are tendencies for these starting stocks and this six-cycle horizon, not proof of global optimality across arbitrary sequences.

Meridian's large initial capital stock makes low-capital, research-and-training plans especially strong. That is the intended frontier-growth problem, but the relative research/education returns still warrant classroom playtesting. Several high-productivity mixes accept mild resource shortages; the comparison explicitly retains resource security rather than folding it into a hidden score. Heavy resource protection sacrifices output per worker, as intended.

An example sequence also matters: research-oriented investment in cycles 1–2 followed by more capital reaches 76.96 / 28.31 output per worker for Meridian / Rivermark; the reverse timing reaches 72.24 / 24.88. Deferred research/training and starting equipment change the timing tradeoff. Neither sequence wins every comparison.

No known functional blocker remains in the tested Chromium/Edge flows. Limits and decisions for the next pass:

- These are teaching indices, not calibrated annual growth forecasts. Coefficients need classroom playtesting rather than claims of empirical realism.
- Terminal productivity alone undervalues training still pending after Cycle 6. The final report now discloses pending training. Settle whether a later version should add a post-run projection; no extra cycle or arbitrary terminal bonus was added here.
- Fix the intended art contract: four district categories, cumulative investment thresholds, completed/upgraded levels, and one construction hook per funded category. Tiny investments may prepare a site rather than complete a new building. The current renderer and thresholds remain synchronized.
- Confirm how to visualize state-based bottlenecks and player/rival ownership during the upcoming 32-bit pass. No art was created in this pass.
- The model omits depreciation, prices, institutions as controls, trade, random shocks, and a save system. None is necessary to start the planned art pass, but adding any later would require rebalancing.
- CPU independence is structural, not cryptographic secrecy: the client must store its doctrine internally. The UI hides unrevealed plans and doctrine names, but a developer inspecting JavaScript state can see them.
- Firefox, Safari, screen-reader testing with a human, and classroom balance testing remain unverified. No deployment was performed.

## Telemetry-ready internal contract

`exportRun()` returns a deep copy of run state: playerCity, rivalCity, rivalDoctrine, currentCycle, phase, cities, initialCities, allocation, committedAllocations, pendingCities, productivityGapStart, productivityGapEnd, and gapChangePercent.

Each city records output, capital, resources, technology, education, pendingEducation, researchCapacity, labor, laborCapacity, outputPerWorker, growthRate, productivityGrowthRate, developmentPoints, currentCycle, constraints, buildings, invested totals, and history. Each cycle history stores cycle, doctrine (null for the player), allocation, startState, endState, outputChange, outputPerWorkerChange, capitalPerWorker, growthRate, productivityGrowthRate, bottlenecks, technologyGain, educationGain, majorMechanisms, completedProjects, innovation, diffusion, and migration. No external telemetry is implemented.

The following numeric appendices are generated from `tests/balance-results.json`, which includes all exact audit results and the full CPU doctrine configuration.


## Starting-state appendix

| Measure | Meridian | Rivermark |
| --- | ---: | ---: |
| Capital | 1400.000000 | 135.000000 |
| Resources | 350.000000 | 155.000000 |
| Technology (internal) | 1.850000 | 1.120000 |
| Education | 225.000000 | 26.000000 |
| Labor (internal) | 68.000000 | 56.000000 |
| Research capacity | 5.000000 | 2.000000 |
| Pending education | 0.000000 | 0.000000 |
| Output | 3198.057521 | 652.407143 |
| Output per worker | 47.030258 | 11.650128 |
| Capital per worker | 20.588235 | 2.410714 |
| Labor / resource capacity | 110.000000 | 63.200000 |
| Technology adoption fraction | 0.646830 | 0.368582 |
| Resource utilization fraction | 0.963566 | 0.965817 |

The exact raw starting stocks are in GAME_BALANCE.initial below. Derived values above are shown to six decimals only for engineering review; the player sees whole workers and whole technology-index values.

## Final output per worker by repeated or timed plan

Each row faces an independent Balanced Growth CPU. Tuple order is Capital / Resources / Research / Education.

| Player plan | Meridian | Rivermark |
| --- | ---: | ---: |
| 5/5/5/5 | 71.75 | 24.74 |
| 10/4/3/3 | 68.39 | 27.50 |
| 3/3/7/7 | 77.94 | 23.41 |
| 8/6/3/3 | 64.96 | 25.41 |
| 2/3/8/7 | 79.01 | 21.33 |
| Capital only | 51.67 | 20.77 |
| Research only | 71.75 | 12.08 |
| Research + education | 77.25 | 15.72 |
| Resources only | 45.31 | 11.27 |
| Resource neglect | 67.70 | 26.63 |
| Capital early, research late | 72.24 | 24.88 |
| Research early, capital late | 76.96 | 28.31 |

## Full GAME_BALANCE snapshot

```json
{
  "developmentPointsPerCycle": 20,
  "initial": {
    "meridian": {
      "capital": 1400,
      "resources": 350,
      "technology": 1.85,
      "education": 225,
      "labor": 68,
      "researchCapacity": 5,
      "pendingEducation": 0
    },
    "rivermark": {
      "capital": 135,
      "resources": 155,
      "technology": 1.12,
      "education": 26,
      "labor": 56,
      "researchCapacity": 2,
      "pendingEducation": 0
    }
  },
  "outputScale": 8,
  "capitalExponent": 0.36,
  "capitalPerPoint": 9,
  "resourcesPerPoint": 4.25,
  "educationPerPoint": 4.25,
  "educationImmediateShare": 0.35,
  "humanCapitalMaximumBonus": 0.65,
  "humanCapitalHalfSaturation": 120,
  "equipmentComplementScale": 4,
  "adoptionFloor": 0.2,
  "adoptionEducationScale": 85,
  "adoptionTechnologyExponent": 1.2,
  "researchSkillFloor": 0.2,
  "researchEducationScale": 120,
  "knowledgePerPoint": 2.75,
  "immediateResearchKnowledge": 0.9,
  "researchSaturationScale": 200,
  "innovationRate": 0.0035,
  "diffusionRate": 0.0125,
  "technologyProductivityWeight": 1,
  "laborGrowthRate": 0.015,
  "migrationBonusMax": 1,
  "capacityBase": 26,
  "capacityPerResource": 0.24,
  "capitalResourceDemand": 0.018,
  "outputResourceDemand": 0.004,
  "resourcePenaltyExponent": 0.8,
  "laborCrowdingPower": 2,
  "migrationMinOutputPerWorker": 28,
  "migrationMinCapitalPerWorker": 6,
  "migrationHeadroom": 1.12,
  "resourceConstraintThreshold": 0.98,
  "adoptionConstraintThreshold": 0.55,
  "skillUnderuseEducationPerWorker": 1.6,
  "skillUnderuseCapitalPerWorker": 5,
  "excessResourceUtilization": 0.68,
  "capitalSaturationPerWorker": 30,
  "buildingPointThresholds": [
    4,
    15,
    30,
    50,
    80,
    120
  ],
  "initialBuildings": {
    "meridian": {
      "capital": 3,
      "resources": 2,
      "research": 2,
      "education": 3
    },
    "rivermark": {
      "capital": 1,
      "resources": 1,
      "research": 0,
      "education": 1
    }
  },
  "technologyDisplayScale": 100,
  "gapTolerance": 0.02,
  "pathShiftPoints": 3,
  "feedbackCapitalPoints": 10,
  "feedbackResearchPoints": 7,
  "feedbackEducationPoints": 5,
  "cpu": {
    "resourceTargetUtilization": 0.85,
    "resourceResponse": 25,
    "adoptionTarget": 0.65,
    "educationResponse": 12,
    "capitalMaturityScale": 12,
    "educationReadinessScale": 120,
    "minimumWeight": 0.25
  }
}
```
