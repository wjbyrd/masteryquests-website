# Faculty Composition Contract — Phase 4.4a

Version 1.2.0

## Global concept availability

Selecting a concept makes all of its eligible non-checkpoint content globally available to the generated game. Checkpoint focus never removes or relocates ordinary, elite, legendary, calculation, integration, repair, repair-seed, bridge, or legendary-boss questions.

Calculation and integration questions continue to enter the ordinary bank identified by their published canonical difficulty. Direct repair routes retain precedence over general repair routes.

## Checkpoint boss mapping

Checkpoint boss questions are placed from their published metadata:

- `canonicalDifficulty: easy` → `easyBoss` → Checkpoint One
- `canonicalDifficulty: medium` → `mediumBoss` → Checkpoint Two
- `canonicalDifficulty: hard` → `finalBoss` → Final Checkpoint

A checkpoint focus may be automatic or custom.

- `null` means automatic: every selected concept with eligible boss questions at that checkpoint difficulty contributes.
- An array means custom: only the listed selected concepts contribute, and only their boss questions matching that checkpoint difficulty are used.
- The same concept may appear in multiple custom focus arrays when it contains distinct boss questions at multiple published difficulties.
- A concept may appear in no custom focus array without affecting its globally available non-checkpoint questions.

Checkpoint focus never changes a question's difficulty.

## Recipe compatibility

Current recipes use schema `1.2.0` and the `checkpointFocus` object:

```json
{
  "checkpointFocus": {
    "checkpointOne": null,
    "checkpointTwo": null,
    "finalCheckpoint": null
  }
}
```

Legacy schema `1.1.0` recipes containing mandatory `stages` remain importable. Their stage assignments are retired because they were compulsory and therefore cannot be treated as intentional custom focus. Imported legacy recipes reopen with automatic checkpoint mapping and receive migration notes when old assignments lacked matching boss difficulty.

## Mode-aware blocking minimums

Only enabled modes impose blocking minimums.

- Standard Campaign and Score Attack require ordinary easy, medium, and hard coverage; all three checkpoint boss pools; repair; and bridge coverage.
- Timed Trial and Exam Drill require ordinary easy, medium, and hard coverage plus repair and bridge coverage.
- Legendary Mode requires legendary and legendary-boss coverage.

## Integrity rules

Question objects, option order, numeric answers, published hashes, routing metadata, and instructional roles are preserved. Duplicate canonical IDs across generated main pools, conflicting objective labels, invalid focus references, invalid slugs, and enabled-mode coverage failures block generation.
