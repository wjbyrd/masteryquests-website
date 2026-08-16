# The Labyrinth of Choice — Engine 2.0 Non-Graph Rebuild Audit

Build date: 2026-08-16

## Result

The Labyrinth of Choice has been rebuilt into the current Mastery Quests game architecture without waiting for the new graph set.

This is more than an engine transplant. The old embedded-bank design, forced RNG calculation hall, external telemetry endpoint, thin difficulty structure, and tag-only remediation architecture were replaced.

Trial by Graph is deliberately held back until the new graph assets and graph-dependent questions are authored and audited.

## What changed

### Question architecture

The old production HTML contained the question bank directly in the page and forced generated calculation questions into Rooms 26–29.

The rebuilt game now loads an external hashed student bank:

`labyrinth_of_choice_question_bank_student.js`

A separate authoring JSON is included for future maintenance:

`labyrinth_of_choice_question_bank_author.json`

The RNG hall is gone. Rooms 26–29 now use the normal adaptive upper-tier bank instead of four hard-coded runtime generators.

### Bank expansion

Old embedded primary/boss inventory: 166 questions.

New primary/boss inventory: **378 questions**.

Ordinary difficulty pools:

- Easy: 60
- Medium: 60
- Hard: 60
- Elite: 60
- Legendary: 60

Boss pools:

- Easy Boss: 15
- Medium Boss: 15
- Final Boss: 15
- Legendary Boss: 33

Remediation:

- 23 granular skills
- 92 repair questions
- 92 bridge questions

Total authored records in the rebuilt package: **562**.

The old questions were retained as seed material where appropriate, enriched with explicit difficulty/objective/skill/remediation metadata, and supplemented with new non-graph questions across all five ordinary difficulty tiers.

### Granular diagnostic skills

The new bank separates broad old tags into 23 diagnosable skills, including:

- theory of choice
- completeness and transitivity
- indifference-curve properties
- marginal rate of substitution
- budget intercepts and slope
- budget-line shifts and rotations
- utility maximization
- marginal utility per dollar
- individual demand derivation
- income and related-price demand responses
- normal vs. inferior goods
- substitution effect
- income effect
- Giffen-good logic
- demand-curve shifts
- consumer surplus
- market-demand aggregation
- price-elasticity fundamentals
- midpoint elasticity
- elasticity and total revenue
- cross-price elasticity
- income elasticity
- elasticity determinants

Every main question now carries explicit `objective`, `primarySkill`, `repairSkill`, `commonError`, `difficulty`, and hashed answer metadata.

## Modes

Nine modes are active now:

1. Standard Campaign
2. Timed Trial
3. Exam Drill
4. Quiz
5. Unlimited Practice
6. Legendary Mode
7. Score Attack
8. Fading Fortune
9. Risk & Reward

All nine pass engine preflight.

Fading Fortune and Risk & Reward each have 115 / 115 curated eligible questions respectively, and 10-, 15-, and 20-question deck generation passed.

Trial by Graph is not exposed yet. The bank intentionally contains zero image-bearing questions in this phase.

## Resources

The supplied resource package already contained **18 instructor-recorded videos** covering Chapters 3 and 4.

A new student-facing `instructional_resources.js` was generated directly from the supplied catalog and official learning-objective document.

Coverage:

- Chapter 3: LO3.1–LO3.4
- Chapter 4: LO4.1–LO4.7
- Official objectives mapped: 11/11
- Slide decks required: no

The Mastery Report can therefore route students directly to the existing video library now. New slide decks are not required for this rebuild.

## Telemetry and privacy

The old Power Automate `fetch()` telemetry path has been removed.

The rebuilt game uses the current local telemetry/CSV architecture and pseudonymous run identity used by the modern game family.

No student email is required to start the game.

## Campaign preservation

Preserved:

- The Archivist
- The Warden
- The Decomposer
- The Sovereign
- Seal of Preferences
- Prism of Tradeoffs
- Scepter of Elasticity
- the three hallway environments
- the existing start/game backgrounds
- the original Labyrinth tone and visual palette

Standard Campaign remains the only mode allowed to write campaign completion/artifact progress.

## Validation

Passed:

- upgraded inline JavaScript syntax
- student-bank JavaScript syntax
- instructional-resource JavaScript syntax
- all nine enabled mode preflights
- Fading Fortune 10/15/20 deck generation
- Risk & Reward 10/15/20 deck generation
- 562 unique record IDs
- zero duplicate published question texts
- four answer choices on every record
- exactly one valid hashed answer on every published record
- 11/11 official LO resource mappings
- zero graph/image records in the current phase
- RNG Hall removed
- Power Automate endpoint removed

## Deployment files

For the non-graph rebuild, the game folder needs:

- `index.html` — use the upgraded HTML supplied in this package
- `labyrinth_of_choice_question_bank_student.js`
- `instructional_resources.js`
- existing Labyrinth production assets
- shared mode images `mode_quiz.webp`, `mode_unlimited.webp`, `mode_fading.webp`, `mode_risk.webp`

The graph phase can be added later without reopening the rest of this migration.
