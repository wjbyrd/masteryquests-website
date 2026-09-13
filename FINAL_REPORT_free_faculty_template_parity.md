# Free faculty template and supporting tools parity report

**Status: complete locally. NOT DEPLOYED.**

## 1. Baseline and scope

Authoritative repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
Branch: `main`. Starting HEAD: `8eb437bb47e005d9213ca50fa51b5071e9901d05`. Working tree was clean before this task. No branch, commit, deployment, server change or remote publication was made.

The audit was recorded before production edits in [AUDIT.md](C:/Users/Jennings/Documents/GitHub/masteryquests-website/audit_tools/free_faculty_template/AUDIT.md). Read-only document and workbook extracts preserve the original evidence.

## 2. Sources of truth and public entry points

| Purpose | Repository-relative location |
|---|---|
| Maintained shared Composer game engine | `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html` |
| Maintained question-record schema guard | `build/faculty-build-composer/composer-core.js`, `validateFacultyQuestionRecord` |
| Canonical manual-generation source | `audit_tools/free_faculty_template/build.mjs` |
| Canonical manual package checks | `audit_tools/free_faculty_template/package-validator.js` |
| Public manual blank | `downloads/resources/mastery-quests-faculty-template.html` |
| Public working starter | `downloads/resources/mastery-quests-faculty-starter.html` |
| Public validator UI and generated validation runtime | `tools/question-bank-validator/index.html`, `validator.js` |
| Optional drafting workbook | `downloads/resources/faculty-question-bank-validator.xlsx` |
| Public manual guide | `downloads/resources/manual-faculty-guide.html` |
| Public entry pages | `build/index.html`, `resources/index.html` |
| Controlled publication copies | Corresponding paths beneath `dist/` |

Before this task, both public Blank Faculty Template links pointed directly to the maintained Composer template. That linked engine was current. A separate HTML download under `downloads/resources` was an older independent copy. It is now generated from the shared source, and both public links lead to it. The Composer source itself was not changed.

Regenerate the blank, working starter, question JSON and validator with:

```text
node audit_tools/free_faculty_template/build.mjs
```

## 3. Parity findings and corrections

| Capability | Before | Final outcome |
|---|---|---|
| Room progression, rendering, evaluation, feedback and streaks | MATCHES in the actual linked download | Shared implementation retained; older separate download synchronized. |
| Adaptive selection, concept memory, non-repeat windows, weakness/coverage weighting and rapid guesses | MATCHES | Shared implementation retained. |
| Repair → bridge → retest and checkpoint/boss behavior | MATCHES | Shared implementation retained; explicit skill-routing instructions and working examples added. |
| Save/resume, run identity, completion, verification codes and achievements | MATCHES | Shared implementation retained, including prior save/refresh fixes. |
| Ten mode labels, clocks, sampling and selection | MATCHES | Shared implementation retained. |
| Manual eligibility for Trial by Graph, Fading Fortune and Risk and Reward | MISSING / STALE | Eligibility IDs now derive from the manually supplied main banks. |
| Standalone question validation | MISSING / STALE | Removed the effective no-op by embedding the exact maintained Composer field validator. |
| Faculty configuration | INTENTIONALLY DIFFERENT | Clearly marked manual settings and JSON package replace Composer-specific authoring steps. |
| Curated Concept Review/LO manifest | NOT APPLICABLE to arbitrary manual questions | No invented library membership or review mapping; faculty directed to Composer for curated integration. |
| Telemetry and Download Game Data | MATCHES | Local-only runtime preserved; explicit remote permission false. |
| Accessibility and UI shell | MATCHES | Keyboard, focus, labels, announcements, dialogs, reduced-motion and responsive code preserved. Graph authoring guidance corrected. |
| Input safety and package guidance | MISSING / STALE | JSON parsing, readable diagnostics, safe serialization and current examples added. |
| Older separate public HTML | MISSING / STALE | Replaced through the generator, not maintained as an independent engine. |

The protected implementation and markup match the Composer source outside the two documented configuration/question regions, allowing only whitespace-only line cleanup. The machine-readable [parity matrix](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/free_faculty_template_parity/parity-matrix.json) records **430 named function locations** in both versions, the audit classifications and implementation paths.

## 4. Exact template changes and intentional differences

The manual adapter exposes `MANUAL_QUESTION_PACKAGE` between explicit start/end markers. It consumes main/boss banks, flat repair and bridge arrays, skill-keyed repair/bridge pools, optional seed pools, objective labels, embedded image assets and accessibility metadata. It derives the special-mode ID lists and embeds the maintained validator. The configuration retains current defaults and exposes title, game identity, save namespace, supported modes, guide and appearance settings.

The blank intentionally has no questions and blocks unsupported launches with missing-pool guidance. The separate working starter contains **78 synthetic questions**, including 12 graph items and complete repair/bridge routes. It demonstrates all ten modes; it is not represented as reviewed course assessment content. A standalone SVG and both empty/filled JSON packages support the workbook and manual workflow.

Intentional differences are the manual settings/JSON adapter, a human-chosen save namespace, no curated Concept Review manifest for arbitrary content, and no remote collection adapter. Composer-specific authoring UI was not inserted into the game. Shared completion and verification logic was not customized.

## 5. Question validator findings and changes

The former workbook treated obsolete fields and conventions as requirements, constrained types to a closed list, allowed obsolete boss difficulty, did not consistently require main-question repair skills, lacked answer-hash support, and exported JavaScript without safely handling all escaping or carrying graph accessibility metadata.

The browser validator is now the final authoring check. It uses the exact current Composer record validator plus package-level checks for data shape, pool names, duplicate IDs, conflicting out-of-range numeric answers, image metadata, safe local asset references, skill-route warnings, counts and mode readiness. It warns about repeated wording instead of rejecting legitimate variants. Syntax failures explain double quotes, trailing commas and JavaScript wrappers. It never evaluates pasted JavaScript and displays diagnostics through text nodes.

The workbook preserves the 300-row drafting layout and original input columns, adds AnswerHash/ImageAlt/GraphDescription/BossStage, removes obsolete restrictions, and replaces unsafe executable export formulas with a documented clipboard-to-JSON workflow. Its formula status explicitly says **CHECK ONLINE**, not that a row is certified valid. Optional editorial-only columns are identified in Instructions. Current aliases and richer optional metadata can be authored directly in JSON.

Workbook completeness formulas were recalculated and mutation-tested: removing RepairSkill changes a sample row to INCOMPLETE; restoring it returns CHECK ONLINE. All five workbook sample rows were read back from the exported XLSX, converted through the actual TSV importer and validated successfully. Existing workbook data-validation rules were inspected after export: only current pool, difficulty, A–D answer and TRUE/FALSE graph lists remain.

## 6. Current supported question model

Composer, the manual download and the browser validator share these record rules:

- Unique `id` or `questionId`; string IDs are valid and no numeric range is required.
- Nonempty `q`, exactly four nonempty string `options`, and `feedback`.
- Numeric `a` from 0–3, or a valid published `aHash` representation. Hex, optional `sha256:` prefix and supported base64 formats are recognized.
- Required nonempty `tag`, `type`/`questionType`, `objective`/first `outcomeIds`/`conceptId`, `primarySkill`/`skillId`, and `repairSkill`/`repairSkillId`.
- Main/boss `difficulty` or `canonicalDifficulty`: easy, medium, hard, elite or legendary, matching the pool. Repair/bridge may omit difficulty. Boss difficulty is never “boss.”
- Type is a nonempty text label, not an enumeration. Multi-step teaching questions retain the four-option model.
- Optional bossStage values: 1, 2, 3, opening, middle or final. Pool placement controls boss/adaptive eligibility.
- Optional hints and teaching metadata may remain on records. Composer-only metadata is not required.
- Image references can use local relative paths, embedded asset keys or supported inline image data URLs. The manual workflow adds accessibility checks for `questionAssetMetadata.imageAlt` and `graphDescription`; Trial by Graph also requires `graphRequired: true`.

The manual workflow deliberately rejects remote/unsafe image paths to keep this starter local-only. Missing local files cannot be proven absent from pasted JSON, so the validator requests an actual game asset check. Hash syntax is checked; faculty must still verify the answer key against the choices in the running game. A structural pass does not certify teaching accuracy or distractor quality.

## 7. Supporting materials audit

| Material | Finding | Action |
|---|---|---|
| `faculty-question-bank-helper.docx` | STALE | Replaced inaccurate required-field guidance with a concise complete manual workflow. |
| `example-question-architecture.docx` | BROKEN / STALE | Replaced poorly presented fragments with a current valid example and package/asset instructions. |
| `example-question-generation-prompt.docx` | STALE | Updated fields, pool counts, images, skill routing, privacy and review steps. |
| `faculty-composer-quick-start-guide.docx` | STALE telemetry wording | Preserved teaching/build flow; corrected optional operational telemetry and linked manual guidance. |
| `faculty-game-overview-guide.docx` | STALE telemetry wording | Corrected categorical no-transmission statements and research-default language. |
| `faculty-implementation-guide.docx` | STALE telemetry wording | Updated the same governance distinction and manual reference. |
| `student-instructions-and-faculty-customization-checklist.docx` | STALE telemetry wording | Updated the same distinction and current guidance link. |
| Build and Resources pages | STALE manual entry/validator descriptions | Linked the generated blank, working starter, manual guide and canonical validator; labeled the workbook as a drafting aid. |
| `README.txt` | STALE | Replaced the obsolete file-drop instructions with the current workflow and source-generation command. |
| `RESOURCE-CLEANUP.txt` | STALE historical maintenance note | Retained as historical source, excluded from public dist; current instructions live in README and the manual guide. |
| `mastery-quests-faculty-template-old.html` | REDUNDANT | Retained in source, excluded from public dist. |
| `using-external-javascript-question-pools.docx`, `javascript-question-pool-code.txt` | REDUNDANT retired workflow | Retained in source, excluded from public dist; current README directs users to JSON packages. |
| `mastery-quests-multi-game-hub-template.html` | CURRENT | Preserved independent hub and intentional faculty placeholders. |
| Canvas converter v1.1/v1.2 HTML and instruction variants | NOT APPLICABLE | Separate legitimate LMS utilities; preserved, including historical filename variants. |
| How-to, Composer, learning-outcomes, telemetry dictionary, privacy and faculty-template overview pages | CURRENT for their purposes | Reviewed through the existing public documentation inventory; preserved current engine/governance guidance. |

The new guide answers where to start, what to edit, fields, images, modes, validation, data storage, network behavior, pre-release tests and protected areas. Terminology uses “LMS account identifiers” and “university identifiers.” No institution-specific telemetry language was introduced.

Seven DOCX files were rendered through installed Word after the standard renderer reported that LibreOffice was unavailable. All **19 final pages** were visually reviewed. Title rules were removed, titles made black, and an unnecessary fourth student-checklist page was eliminated. Workbook input, validation, summary, lists and instruction ranges were rendered and inspected. Evidence is retained under the task's documents/workbook directories.

## 8. Accessibility and telemetry

The shared accessible game shell was preserved. Browser checks exercised keyboard launch, answer controls, graph alt text and full description, graph dialog Escape behavior, announcements/status feedback and a 390-pixel viewport without horizontal overflow. The validator adds labeled inputs, semantic buttons, visible focus, a polite live status region and readable errors. These checks do not claim formal assistive-technology certification.

**Remote anonymous telemetry remains OFF by default.** The free blank and working starter have `allowAnonymousDataCollection: false`, no remote collection adapter and no unnecessary collection endpoint. The downloaded starter worked directly from a file URL with no server dependency. Tested runs generated no remote telemetry requests. Download Game Data produced a local CSV.

Public polished games remain local-only; their existing browser suite passed all 103 checks with no telemetry network requests. No files under the shared Composer implementation, published/private games, server or telemetry-contract directories were modified. Frozen **mq-measurement/1**, **mq-governance/2**, **mq-disclosure/2**, anonymous envelope **3**, and **730-day operational retention** remain unchanged. Operational telemetry is not research by default. Faculty/build OFF remains authoritative.

## 9. Regression and browser results

| Check | Result |
|---|---|
| Active Composer regression suite | 27/27 runners PASS |
| Governance | 14 PASS |
| Operational readiness/remediation | 27 PASS |
| Scheduled retention | 11 PASS |
| Telemetry contract | 16 PASS |
| Contract browser | 17 PASS |
| Governance browser | 8 checks and no-JavaScript path PASS |
| Managerial deterministic telemetry parity | 16 PASS |
| Managerial telemetry browser | 29 PASS |
| Published Managerial/local-only browser | 103 PASS |
| Private active-run refresh regression | 33 cases PASS |
| Classroom access | 27 PASS |
| Public documentation/link checks | 17 pages, 556 links, zero broken links; negative controls PASS |
| Downloadable teaching-guide guards | 4/4 PASS |
| New manual/schema/validator checks | 18 PASS |
| New manual browser checks | 18 PASS |
| Exported workbook sample conversion | 5/5 sample rows PASS |
| Git whitespace check | PASS |

Browser QA covered the blank's intended launch block; direct offline HTML launch; all ten modes; actual correct/incorrect answer controls; feedback; the complete repair → bridge → retest sequence; Standard save/refresh/resume with retained room, answers and run identity; embedded graph rendering and Escape; narrow layout; one-question Quiz completion; local CSV download; and validator UI trials for valid JSON, malformed JSON, missing graph descriptions, duplicate IDs and bad answer indexes. There were no runtime exceptions, broken requested assets or unintended remote requests in the final run.

Initial new-harness failures came from skipping the name/start step, expecting Exam answers to score before checkpoint commitment, and not pressing the wrong-turn Continue control. The harness was corrected to follow actual UI behavior; existing product assertions were not weakened. The documentation guard's obsolete “classroom research” expectation was replaced by explicit OFF-by-default and operational-not-research assertions while retaining its checkpoint, learning-outcome and Composer step-order checks.

Full logs, fixtures, screenshots, exports and results are in [task evidence](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/free_faculty_template_parity). Historical evidence from prior tasks was not overwritten.

## 10. Controlled dist and preservation

`node audit_tools/public_site_publication/build-dist.mjs .` completed successfully:

- Published artifact files: **1,796**.
- Composer Concept Review PDFs: **151**.
- Forbidden files: **0**.
- Incoming question assets: **0**.
- Current blank, starter, validator, JSON and seven updated guides match their source copies.
- Retired manual/external-JavaScript workflow files and the historical cleanup note are excluded.
- No audit, tests, server code or authoring builders enter dist.

[Publication and protected-path evidence](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/free_faculty_template_parity/publication-preservation.json) records the checks. Dist is a local ignored build artifact. **NOT DEPLOYED.**

## 11. Exact changed files

All paths below are relative to the authoritative root stated above.

Modified production/support files:

```text
audit_tools/public_documentation/check-downloads.py
audit_tools/public_site_publication/build-dist.mjs
build/index.html
resources/index.html
downloads/resources/README.txt
downloads/resources/mastery-quests-faculty-template.html
downloads/resources/faculty-question-bank-validator.xlsx
downloads/resources/faculty-question-bank-helper.docx
downloads/resources/example-question-architecture.docx
downloads/resources/example-question-generation-prompt.docx
downloads/resources/faculty-composer-quick-start-guide.docx
downloads/resources/faculty-game-overview-guide.docx
downloads/resources/faculty-implementation-guide.docx
downloads/resources/student-instructions-and-faculty-customization-checklist.docx
```

New public files:

```text
downloads/resources/faculty-question-package-blank.json
downloads/resources/faculty-question-package-example.json
downloads/resources/manual-faculty-guide.html
downloads/resources/mastery-quests-faculty-starter.html
downloads/resources/sample-bars.svg
tools/question-bank-validator/index.html
tools/question-bank-validator/validator.js
```

New maintenance/test/report sources:

```text
audit_tools/free_faculty_template/.gitignore
audit_tools/free_faculty_template/AUDIT.md
audit_tools/free_faculty_template/build.mjs
audit_tools/free_faculty_template/package-validator.js
audit_tools/free_faculty_template/check.mjs
audit_tools/free_faculty_template/browser.mjs
audit_tools/free_faculty_template/workbook.mjs
audit_tools/free_faculty_template/documents.py
audit_tools/free_faculty_template/render-documents.ps1
audit_tools/free_faculty_template/raster-documents.py
audit_tools/free_faculty_template/regressions.mjs
audit_tools/free_faculty_template/evidence-redirect.cjs
audit_tools/free_faculty_template/report-evidence.mjs
FINAL_REPORT_free_faculty_template_parity.md
```

The exact expanded list, including every new evidence file, is in [changed-files.json](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/free_faculty_template_parity/changed-files.json). A local ignored node_modules junction references the already installed artifact runtime; no new dependency was installed or added to the public application.

## 12. Remaining limitations

No unresolved regression remains within this task. The blank intentionally requires faculty content. The workbook intentionally provides drafting and basic completeness, with full structural validation in the browser tool. Faculty still verify factual accuracy, answer keys, local asset existence and sufficient bank depth beyond launch minimums. Custom manual objectives do not automatically acquire curated Concept Review PDFs. Changes remain local and uncommitted. **NOT DEPLOYED.**
