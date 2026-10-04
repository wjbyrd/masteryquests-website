# Composer faculty question-bank export

Run from any working directory with Python 3.10 or later:

```powershell
python tools/export_faculty_question_bank.py
```

Dependencies: ReportLab, Pillow, and pypdfium2 (or pypdf), for example
`python -m pip install reportlab Pillow pypdfium2`, plus Node.js. Node must be on
PATH, or supplied with `--node PATH`. Fonts default to Windows Arial; use
`--font-dir PATH` for a directory containing `arial.ttf`, `arialbd.ttf`,
`ariali.ttf`, and `seguisym.ttf`. The symbol fallback preserves mathematical
characters missing from Arial. The runtime does not use a network service.

Outputs are local only:

- `faculty_exports/general_economics_question_bank.pdf` and `.csv`
- `faculty_exports/microeconomics_question_bank.pdf` and `.csv`
- `faculty_exports/macroeconomics_question_bank.pdf` and `.csv`
- `faculty_exports/validation_summary.json` (counts, warning IDs, source checksum,
  and question-to-PDF-page index for review)
- `faculty_exports/validation_report.md` (per-discipline comparison)

No combined PDF or CSV is generated. The previous consolidated files are removed
only after all six replacement files pass validation.

## Exact scope

The sole question-content source is
`build/faculty-build-composer/data/composer_library.js`. Its JSON wrapper is
parsed without executing the library. Every object containing a stem (`q`) and
choices (`options`) is discovered recursively, including additional pools added
later. The current corpus is stored in concept `questions` pools,
`repairQuestions`, `repairSeedQuestions`, and `bridgeQuestions`.

ID references from `directSkillRepairRoutes`, `microSkillRepairPools`,
`skillRepairSeedPools`, and `microSkillBridgePools` are resolved and preserved as
memberships. Derived concept views use the repository's `resolveConceptModule`
to identify memberships only. Its runtime modifications of tags and concept
fields are **not** applied to canonical content. The same ID with any conflicting
stored field blocks the entire export. Pool paths remain internal to classification
and validation. Object property order does not matter;
choice and array order do matter.

Polished game banks, authoring snapshots, legacy folders, tests, examples, and
historical files named in question provenance are not inputs. Provenance is retained
in canonical data and validation evidence, not in faculty PDFs or CSVs. PDF ordering is by the
canonical raw tag, natural objective order, difficulty, and ID. Unknown explicit
difficulties sort after known difficulties. Stored topics and difficulty are unchanged.

## Discipline membership

The authoritative mapping is `build/faculty-build-composer/course-area-model.js`.
The exporter calls `create(library.registry.concepts)`, as `composer.js` does,
and uses each concept's `areas` memberships, not its single display badge.
General, Micro, and Macro memberships include shared foundational concepts.
The macro supplement is included even though its normal composer card is hidden.

Each stored, routed, or derived pool contributes only its actual question IDs to
its owner's course areas. A derived child does not pull in its entire parent bank.
Questions reused across areas appear in each relevant export, with IDs deduplicated
within each discipline and pool lists scoped to that discipline. Canonical content
and provenance remain unchanged. Conflicting canonical versions still block export.
Unknown or unmapped memberships are reported as errors; wording is never used to
guess a discipline.

All three CSVs share the same faculty-facing column schema. Classification source
and internal memberships remain in the validation report rather than the question exports. The report
distinguishes the sum across exports from the globally distinct ID count, so
documented reuse is visible.

## Answers and fidelity

A valid numeric `a` is canonical when available. Otherwise Node calls the actual
exported `normalizeAnswerText` from `composer-core.js`, then computes SHA-256 for
every option. Exactly one matching option is required. Zero or multiple matches
block publication and list the affected IDs. No answer is inferred.

UTF-8 CSV includes a BOM for Excel, quoted multiline cells, all choices (including
extra choice columns if needed), and complete original question-content strings.
Unknown metadata is ignored by default; no `metadata.*` fields are exported.
The CSV is data, with no formulas added. Open it through Excel's Text/CSV importer
and choose Text column types if exact type preservation is needed.

The PDF retains the original question wording, options, feedback, and hints.
Stored HTML payoff tables are rendered as tables. Graphs are loaded only from
the composer data directory and embedded without cropping or internal filename captions. Temporary
in-memory copies are resized to 150 DPI at their rendered size; wide graphs
(aspect ratio at least 1.6) use 180 DPI to retain detail in smaller labels.
Images are never upscaled. Copies are composited on white and use an adaptive
256-color PNG palette, reducing surplus antialiasing color variations without
JPEG artifacts or reducing resolution further. Original image files are never modified. Embedded dimensions and
target DPI are recorded in the validation summary. The practical size target is
below 20 MB per PDF, preferably 5–15 MB, while preserving readable graphs. Missing
graphs remain explicit warnings. If a literal image path is absent, a graph may
be resolved through that question's own concept asset registration only when its
filename and SHA-256 identify an unambiguous file. The original `image` string is
preserved internally, and the validation summary documents resolution. CSV's
Graph/Image field directs instructors to the graph in that question's faculty PDF
entry; it contains no repository path.

## Faculty metadata allowlist

`FACULTY_METADATA` is the sole header schema shared by PDF and CSV:

- Topic: readable words, with normal economics acronyms preserved.
- Learning Objective: the exact reviewed labels from Composer's existing
  `FacultyOutcomes` policy. The exporter calls `ContentScope.skills(question)`
  for the canonical primary/secondary skills, then `FacultyOutcomes.describe()`
  and `FacultyOutcomes.skills()` within the question's actual stored, routed,
  and derived concept memberships. It collects every supported outcome and
  deduplicates repeated labels. It does not search unrelated concepts for a
  matching skill, rewrite labels, or use the legacy question `objective` field.
  Policy entries marked `hidden` by Composer are excluded; those labels describe
  internal compatibility or checkpoint modules rather than faculty outcomes.
  No independent label map is maintained in the exporter. Approved merges and overrides are consumed from
  generated `data/faculty-outcomes.js`, exactly as in Composer.
- Difficulty: the existing approved Easy, Medium, Hard, Elite or Legendary level.
  When no approved level is available, omit it rather than expose a pool or role
  as a difficulty or invent a new assignment.
- Question Type: readable capitalization and word spacing.
- Common Misconception: existing authored explanatory prose or a deliberately
  mapped readable label. Unrecognized machine identifiers are omitted.

One outcome appears as `Learning Objective: [label]`. Multiple outcomes appear
as a bulleted `Learning Objectives:` header in PDF, and use ` | ` between labels
inside the single CSV `Learning Objective` column. No framework code is prepended;
codes appear only if already part of the policy's reviewed label. An unresolved
question has no displayed outcome and is listed in validation evidence, with no
chapter-derived fallback. Partial skill-resolution gaps are also reported.

The 132 previously unresolved compatibility questions listed in
`tools/faculty_export_outcome_closure_scope_20261004.json` have a narrowly scoped
metadata-only fallback. Integrated Macro questions use recorded required,
challenge-focus, and secondary concept IDs, migrated through Composer's existing
`migrateRecipe` logic to bound the eligible current visible policy concepts.
Within that boundary, actual recorded primary/secondary skills select outcomes
through `FacultyOutcomes.skills()`. Every distinct skill-supported outcome is
retained; a required or secondary concept never selects an outcome by itself.
A repair/bridge question without these concept lists can use an
explicit skill route only when the linked challenge questions unanimously record
the same challenge-focus concepts; differing required concepts are not inherited.
That routed focus establishes eligibility only. Challenge-focus concepts are
checked for narrower recorded skill matches, never expanded automatically, even
when a concept has just one outcome. If no narrower skill evidence exists, the
concept remains unresolved; if no outcome is supported, the objective is omitted.
The trace preserves eligible concepts, focus-resolution results, unmatched
concepts, and matched skills for every retained outcome. Route peers' unrelated
skills are not inherited.
Market Failures questions use exact recorded skill matches within Composer's
migrated visible compatibility family and explicit concept/subtopic memberships.
An ambiguous skill match leaves the item unresolved. The scope file contains IDs
only, not a second mapping or any outcome wording. This fallback never reads
question prose and never changes canonical records.

`faculty_exports/faculty_outcome_resolution.json` records the policy fingerprint
and, for every question, the recorded skills, concept scopes, matched outcome IDs,
verbatim labels, supporting skills, and unresolved skills. This trace
also preserves recorded concept evidence and explicit route evidence for the
scoped closure. A skill lacking a direct skill-to-outcome match is a separate
diagnostic from an omitted Learning Objective: a question can retain supported
outcomes while other recorded skills or eligible concepts remain unresolved. The summary
reports single-outcome, multiple-outcome, and unresolved counts globally and by
course. Standalone legacy `LO#.#` codes are rejected in emitted CSV/PDF text.

The PDF also retains Question ID, stem, every choice, correct answer, feedback,
any existing hint, and the graph/image. It has no generic metadata block.
Question content is unchanged; only display labels are formatted.

CSV columns, in order: Question ID, Topic, Learning Objective, Difficulty,
Question Type, Common Misconception, Question, Choice A, Choice B, Choice C,
Choice D, Correct Answer, Feedback, Graph/Image. Correct Answer contains both
the letter and exact answer text. If future questions have more than four choices
or authored hints, explicit content rules add Choice E onward and/or Hint to the
shared schema; arbitrary metadata never adds columns.

Source chapters, games, pools, files, hashes, phases, roles, skills, canonical
concept IDs and other build/provenance details are not faculty display fields.
The output schema is an allowlist, not a denylist of known internals. Additional
absence checks fail publication if known provenance leaks into an export.

The current Composer library is JSON containing fixed questions, including
already-enumerated calculation questions. There are no executable numeric
question generators in this source. Runtime code was inspected: composition
selects, copies, and routes stored records; randomization selects questions or
shuffles options. Numeric generators in polished games are outside this export.
If generator definitions are introduced into the library, the exporter stops
and requires an explicit adapter; it never samples arbitrary variants or claims
they are the whole bank.

## Validation and privacy

The exporter validates duplicates, references, answer keys, complete content,
and image existence before publication. It round-trips the CSV and uses PDFium
(or pypdf when PDFium is unavailable)
to extract **every** PDF question, checking IDs, order, complete stems, choices,
correct answer letters/text, feedback, hints and approved header labels against
source data. Header-only question pages, blank pages and orphan topic headings
are rejected. It checks the source
checksums of the library, answer core, course-area model, and every original image
again before publishing. Failed validation leaves existing exports
untouched and reports that they are stale. Error details are written to
`faculty_exports/last_export_error.txt`.

The output folder is gitignored and is outside the existing public deployment
allowlist in `audit_tools/public_site_publication/build-dist.mjs`. That build
excludes `.py`/`.mjs`/`.md` source tools and test directories. No source questions,
student files, game logic, or deployment configuration are modified. Do not
manually copy faculty exports into `dist`, `downloads`, or any public directory.

Focused regression tests:

```powershell
python tools/tests/test_export_faculty_question_bank.py
```

After future exports, visually inspect representative graph pages, long question
blocks, and any stored HTML tables in addition to the automated checks.
