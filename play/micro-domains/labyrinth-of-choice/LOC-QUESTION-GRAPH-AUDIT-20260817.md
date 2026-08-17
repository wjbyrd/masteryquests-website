# Labyrinth of Choice — Question + Graph Integrity Audit

Date: 2026-08-17

## Result

PASS after repair.

The failure caught during Trial by Graph was not an arithmetic-engine problem. The demand graph asset contents no longer matched the production filenames assumed by the student question bank. As a result, valid questions were being paired with the wrong graph images.

Example: question `120019` expected the taco movement graph with A at $12 and B at $6, but `DEMAND-03.png` now contains a different taco graph with A at $8 and B at $4 plus a demand shift. That produced the on-screen situation where the correct visual answer was a $4 decrease but no $4 option existed.

## Demand graph repair

The 12 demand-graph question records were remapped to the graph files that actually contain the data described by their stems, feedback, and alt text:

- hamburger leftward demand shift → `DEMAND-05.png`
- taco movement, A=$10/Q=100 to B=$5/Q=225 → `DEMAND-01.png`
- taco movement, A=$12/Q=50 to B=$6/Q=200 → `DEMAND-02.png`
- taco rightward demand shift → `DEMAND-03.png`
- peanut-butter rightward demand shift → `DEMAND-04.png`

The production asset mapping audit JSON was updated to the same mapping so a future rebuild does not quietly reintroduce the mismatch.

## Additional question defects found and repaired

1. Question `120016` had duplicate `$40` answer choices. The fourth distractor is now `$50`.
2. Bridge question `600035` had duplicate `$55` answer choices. The fourth distractor is now `$65`.
3. Legendary graph question `310058` had an answer hash that matched none of its four displayed options. Its hash was regenerated for the intended correct choice: `Because it stays on the original utility curve U₀ and only isolates the substitution effect`.

## Audit coverage

- 652 total question records checked across primary, boss, repair, and bridge pools
- 468 primary/boss records
- 90 graph-required questions
- 21 production graph assets
- four-option uniqueness checked on every record
- numeric/plain answer indexes checked where used
- SHA-256 published answer hashes checked against every displayed option
- record IDs checked for duplicates
- every graph reference checked for an existing production image
- all 21 graph assets visually reviewed against the question families that reference them

## Post-repair validation

- total structural/key issues: 0
- duplicate record IDs: 0
- duplicate answer choices: 0
- invalid answer hashes: 0
- missing graph assets: 0
- graph-required inventory: 90
- Trial by Graph 10/15/20 inventory remains intact
- student-bank JavaScript syntax: PASS
- inline `index.html` JavaScript syntax: PASS

Student bank SHA-256 after repair:

`62af637a268c4e6a07d59f7c1831bdf21e346fe896278b006afb38df98a58209`
