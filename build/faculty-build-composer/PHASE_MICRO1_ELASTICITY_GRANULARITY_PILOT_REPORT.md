# Phase Micro1 — Elasticity Granularity Pilot

## Decision

The existing `elasticity` concept remains the full-family selector. Six Micro-only child selectors are added without splitting the source bank or duplicating canonical questions:

1. Price Elasticity of Demand
2. Price Elasticity of Supply
3. Income Elasticity of Demand
4. Cross-Price Elasticity of Demand
5. Elasticity and Total Revenue
6. Applications of Elasticity

Income Elasticity and Cross-Price Elasticity are intentionally marked as supporting subtopics. They remain selectable so faculty can combine them with each other or with PED, but the composer does not pretend they have enough breadth to justify artificial standalone campaign-scale expansion.

## Implementation

- No question IDs changed.
- No question stems, options, answers, feedback, difficulty, graphs, or remediation content changed.
- No questions were added or deleted.
- The global canonical question count remains **7,274**.
- The parent Elasticity family remains **418 canonical records**.
- Each Elasticity record now carries `familyConceptId: "elasticity"` and exactly one `subtopicIds` assignment.
- Child selectors are lightweight derived modules. They filter the parent family at composition time rather than copying question banks.
- Runtime questions selected through a child are remapped to that child for concept targeting/mastery while retaining `familyConceptId: "elasticity"` and the original source identity.
- Graph assets continue to resolve from `question-assets/elasticity/`; no duplicate asset directories were created.
- Parent/child simultaneous selection is rejected by the core and prevented in the composer UI. Selecting a child removes the full Elasticity family; selecting the full family removes selected Elasticity children.
- The full Elasticity selector remains available to General Economics and Microeconomics. The six child selectors are Micro-only.

## Final partition

| Child selector | Canonical records | Instructional use |
|---|---:|---|
| Price Elasticity of Demand | 171 | Standalone-ready |
| Price Elasticity of Supply | 54 | Focused assessment |
| Income Elasticity of Demand | 27 | Supporting; pair with related Elasticity topics |
| Cross-Price Elasticity of Demand | 33 | Supporting; pair with related Elasticity topics |
| Elasticity and Total Revenue | 53 | Focused assessment |
| Applications of Elasticity | 80 | Focused assessment |
| **Total** | **418** | Exact parent-family reconstruction |

## Validation

The Phase Micro1 validation checks passed:

- Parent source record count: **418**.
- Every parent record receives exactly one recognized child assignment.
- Child record totals sum to **418**.
- Pairwise overlap across child selectors: **0 canonical IDs**.
- Recombining all six children produces the exact same canonical-ID set as selecting the parent Elasticity family.
- Recombined pool counts match the parent for Easy, Medium, Hard, Elite, Legendary, all checkpoint tiers, Repair, Bridge, Calculation, graph count, asset count, and total canonical count.
- Runtime child identity remapping: PASS.
- Family identity preservation: PASS.
- Child graph path resolution to the parent Elasticity asset folder: PASS.
- Asset existence/hash checks: PASS.
- Answer-hash verification: PASS.
- Parent + child conflict rejection: PASS.
- Price Elasticity of Demand alone: all five current modes PASS.
- Price Elasticity of Demand + Income Elasticity + Cross-Price Elasticity: all five current modes PASS.
- Existing legacy composer recipes: **8/8 PASS**.
- Non-Elasticity concept modules are byte-semantically unchanged from the authoritative input library.
- Elasticity question records are unchanged except for the two added taxonomy fields (`familyConceptId`, `subtopicIds`).
- Asset inventory is unchanged.

## Expected current-mode limitations

The pilot deliberately does **not** manufacture filler to make every narrow child support every legacy game mode by itself. The current Exam Drill minimums therefore reject some narrow standalone selections:

- Price Elasticity of Supply: short only at Medium under current legacy minimums.
- Income Elasticity: intentionally too narrow for standalone Exam Drill and has no Bridge record.
- Cross-Price Elasticity: intentionally too narrow for standalone Exam Drill and has no Bridge record.
- Elasticity and Total Revenue: short at Easy and has no Bridge record.
- Applications of Elasticity: short at Easy.

These are not question defects. They are expected consequences of exposing a more granular taxonomy while retaining legacy five-mode minimums. Quiz and Unlimited mode design should handle narrow/supporting subtopics according to their own pedagogical rules rather than forcing campaign-scale filler into them.

## Verdict

**Elasticity granularity pilot: PASS.**

The taxonomy defect is corrected without inflating the bank. This architecture is suitable to reuse on the remaining seven Micro family banks.
