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

- `faculty_exports/mastery_quests_composer_question_bank.pdf`
- `faculty_exports/mastery_quests_composer_question_bank.csv`
- `faculty_exports/validation_summary.json` (counts, warning IDs, source checksum,
  and question-to-PDF-page index for review)

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
stored field blocks the entire export. Repeated pool-path prefixes are grouped
for PDF readability; full paths remain in CSV. Object property order does not matter;
choice and array order do matter.

Polished game banks, authoring snapshots, legacy folders, tests, examples, and
historical files named in question provenance are not inputs. The `game` column
is `Mastery Quests Composer`, representing this one consolidated library. The
original `sourceGame` is retained verbatim in `source_game`; many such values
identify authoring batches rather than separate games. PDF ordering is by the
canonical raw tag, natural objective order, difficulty, and ID. Unknown explicit
difficulties sort after known difficulties. No question is reclassified.

## Answers and fidelity

A valid numeric `a` is canonical when available. Otherwise Node calls the actual
exported `normalizeAnswerText` from `composer-core.js`, then computes SHA-256 for
every option. Exactly one matching option is required. Zero or multiple matches
block publication and list the affected IDs. No answer is inferred.

UTF-8 CSV includes a BOM for Excel, quoted multiline cells, all choices (including
extra option columns if needed), and complete original strings. Additional
metadata is flattened into `metadata.*` columns. Arrays use semicolons; nested
provenance records are rendered as readable key/value text, not raw JS objects.
The CSV is data, with no formulas added. Open it through Excel's Text/CSV importer
and choose Text column types if exact type preservation is needed.

The PDF retains the original question wording, options, feedback, and hints.
Stored HTML payoff tables are rendered as tables. Graphs are loaded only from
the composer data directory, embedded without cropping, and captioned. Missing
graphs remain explicit warnings. If a literal image path is absent, a graph may
be resolved through that question's own concept asset registration only when its
filename and SHA-256 identify an unambiguous file. The original `image` string is
preserved, and `image_resolution` / `resolved_image_file` document the fallback.
Pedagogical metadata is displayed; long
historical source paths and hashes are available in the CSV.

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
correct answers, feedback, and hints against source data. It checks the source
checksum again before publishing. Failed validation leaves existing exports
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
