# Phase 4.4a Package Handoff

## Verdict

**READY — GLOBAL QUESTION AVAILABILITY PRESERVED; CHECKPOINT BOSS DIFFICULTY ENFORCED**

## What changed

The composer no longer requires every selected concept to occupy exactly one stage. All selected non-checkpoint content remains global. Checkpoint boss pools now populate from the boss questions' published easy, medium, and hard metadata. Faculty may leave each checkpoint on automatic focus or narrow it with optional custom focus.

Legacy schema 1.1 recipes remain importable. Mandatory stage assignments are retired on import and replaced with automatic checkpoint mapping. Exported recipes use schema 1.2 and `checkpointFocus`.

## Open and run

Serve this folder from the website or a local HTTP server, then open `index.html`. Direct `file://` use remains unsupported because the composer must load its template and selected assets.

## Validation commands

```text
node tools/validate_composer.js
node tools/validate_phase4_4a.js
```

Both commands must finish with passing results. Browser UI results are recorded in `phase4_4a_browser_validation_results.json`.

## Protected sources

The curated Phase 4.3a library, registry, manifest, and composer-ready blank template are byte-for-byte unchanged. Their hashes are recorded in `phase4_4a_build_summary.json` and the closure report.

## Uploaded composition regression

The supplied real-world recipe now reports 21 easy checkpoint-boss questions, 12 medium checkpoint-boss questions, and zero hard/final checkpoint-boss questions. Standard Campaign and Score Attack correctly block. Timed Trial, Exam Drill, and Legendary Mode pass.
