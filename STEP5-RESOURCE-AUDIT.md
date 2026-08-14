# Mastery Quests Step 5 Resource Audit

Status: **ready for promotion; authoritative-repository write blocked by desktop approval quota**  
Audit date: 2026-08-13

The staged release classifies 169 resource records: 4 current resources updated, 7 current resources retained unchanged, 4 deprecated resources removed from intended public navigation, 6 archive/internal records, and 148 locked generated product assets.

The complete per-file inventory, hashes, link locations, actions, canonical fact sheet, stale-content counts, and Cases A–L are in `deliverables/assets/data/resource-audit-step5.json`.

## Resource inventory

### Current — updated

| Resource | Format | Audience | Final staged pages | Action |
|---|---:|---|---:|---|
| Faculty Composer + Canvas Quick Start Guide | DOCX | Faculty | 2 | Complete package, ten modes, course areas, Mastery Report 2.0, Concept Reviews |
| Faculty Game Overview Guide | DOCX | Faculty | 3 | Ten-mode architecture, reporting/review workflow, save behavior, build-selection guidance |
| Faculty Implementation Guide | DOCX | Faculty | 3 | Build, test, host, evidence, review follow-up, accessibility, launch checklist |
| Student Instructions and Faculty Customization Checklist | DOCX | Faculty and student | 3 | Student directions, ten modes, report/review follow-up, local saves, faculty checks |

No UI screenshots were present or added. Each updated document retains the branded logo, now with alt text.

### Current — reviewed and unchanged

- Example Question Generation Prompt (DOCX)
- Example Question Architecture (DOCX)
- Faculty Question Bank Helper (DOCX)
- Faculty Question Bank Validator (XLSX)
- Mastery Quests Multi-Game Hub Template (HTML)
- Canvas Quiz Converter Instructions v1.2 (DOCX)
- Canvas Quiz Converter v1.2 (HTML, direct/archive copy; the live tool remains the public converter)

### Deprecated — intended public links removed, files preserved

- Mastery Quests Faculty Template (HTML): retired five-mode engine.
- Using External JavaScript Question Pools (DOCX): retired Version 4/five-mode workflow.
- JavaScript Question Pool Starter (TXT): tied to the retired external-pool workflow.
- Customize the Manual Game presentation (PPTX): obsolete five-mode/report/contact content.

### Archive/internal

- Faculty Template Old (HTML)
- Canvas Quiz Converter Instructions v1.1, both filename variants (DOCX)
- Canvas Quiz Converter v1.1, both filename variants (HTML)
- Downloads README (TXT)

### Locked generated product assets

- 144 PDFs: 120 Concept Reviews plus course-slide PDFs.
- 4 generated-product metadata Markdown files.

These 148 assets were inventoried and hashed but not modified.

## Intended website changes

- `resources/index.html`: current authoring references only; retired template/external-pool downloads removed; Canvas instructions v1.2.
- `how-to/index.html`: ten-mode/current-report copy; complete-package hosting; retired deck link removed.
- `build/index.html`: retired template link removed; current authoring references and Canvas instructions v1.2.
- `games/faculty-template/index.html`: converted to a retirement notice with current Composer/resource routes.

## Stale-content audit

| Check | Before | Staged result |
|---|---:|---:|
| Stale mode-count references | 4 | 0 |
| Obsolete mode names | 0 | 0 |
| Stale Mastery Report descriptions | 7 | 0 |
| Missing relevant Concept Review references | 4 | 0 |
| Stale Composer screenshots | 0 | 0 |
| Stale game screenshots | 0 | 0 |
| Broken intended public download links | 0 | 0 |
| Stale/deprecated public links | 6 | 0 |

## Verified product fact sheet

- Modes: Standard Campaign, Timed Trial, Exam Drill, Legendary Mode, Score Attack, Quiz, Unlimited Practice, Trial by Graph, Fading Fortune, Risk & Reward.
- Standard Campaign: 30 rooms, checkpoints, browser-local save/resume.
- Timed Trial: 10 minutes; no checkpoints.
- Quiz: every integer from 1 through 15.
- Trial by Graph: 10, 15, or 20 questions, constrained by audited graph-required inventory.
- Fading Fortune: 10/15/20 questions; 100 → 75 → 50 → 25 points; incorrect choices fade in random order; intervals are 8/10/12/15/18 seconds for easy/medium/hard/elite/legendary and pause for hidden-tab or modal/lightbox/answer-check states.
- Risk & Reward: 10/15/20 questions; 1,000 starting bankroll; wagers of 10%, 25%, 50%, or ALL IN; correct adds the wager, wrong subtracts it, and zero/all-in loss ends the run.
- Concept Reviews: 120 total — 26 General Economics, 53 Microeconomics, 41 Macroeconomics.
- Mastery Report 2.0 may recommend a mapped one-page Concept Review only when meaningful weakness evidence warrants it; students then return to targeted practice, Repair, or Bridge.
- Composer course areas: General Economics, Microeconomics, Macroeconomics.

## QA and automated matrix

- All Cases A–L pass for the staged release.
- Static public-download crawl: 10 current download targets, 0 broken.
- Updated DOCX source checks: all ten modes present; Mastery Report 2.0 and Concept Reviews present; en-US styles; logo alt text; no external hyperlinks; zero high-severity accessibility findings.
- Internal render QA: 4 DOCX files, 11 pages, selectable text PASS, PDF language `en` PASS, visual rendering PASS, no link annotations (N/A).
- Spreadsheet QA: 5 sheets, 646 formulas, no stale mode/version claims; unchanged.
- Locked-system regression: authoritative repository was clean before promotion and the staged file set contains no engine, scoring, threshold, question-pool, Repair, Bridge, Concept Review, Mastery Report resolver, packaging, or Composer filtering/accent files.

## Intended file diff

Modified (8): four DOCX guides plus `resources/index.html`, `how-to/index.html`, `build/index.html`, and `games/faculty-template/index.html`.

Added (1): `assets/data/resource-audit-step5.json`.

Removed: none. Deprecated files remain preserved but are absent from intended public navigation.

## Promotion blocker

The exact nine-file copy into `C:\Users\Jennings\Documents\GitHub\masteryquests-website` could not run because the desktop approval service reported that its usage limit is exhausted until 2026-08-20 08:56 America/New_York. No workaround was attempted. The authoritative repository therefore remains unchanged.
