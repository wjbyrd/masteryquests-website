# Directorate instructional alignment patch

These are replayable instructional corrections. The Cost Directive Standard
content review is complete; the whole-Directorate review and Cost Legendary
review are not complete. Mechanical validation alone is not certification.
The full pre-edit report, source map, item ledger and remaining-work list are
local private faculty materials under the ignored `_private_course_sources`
directory. This tool does not read confidential assessments or publish them.

The canonical faculty question-authoring sources and Gauntlet publisher were
unavailable in the two workspaces. Private assessment and LO documents were
available for the audit. The existing hashed public banks remain runtime artifacts. Following
the prior Cost Directive workflow, this checked manifest preserves revisions
for replay after a faculty publication. It contains no plaintext answer indexes.

Run from any directory with Python:

```text
python audit_tools/directorate_alignment/apply_patch.py --check
python audit_tools/directorate_alignment/apply_patch.py
python audit_tools/directorate_alignment/apply_patch.py --validate
```

`content-patch.json` preserves the first pass. `continuation-patch.json` adds
field changes, tier moves, cross-game relocations and genuinely new questions.
`cost-standard-patch.json` adds Cost-only content/metadata corrections, tier
moves, 78 intentional retirements, and one narrow retest-matching repair.
The tool accepts the original publisher output, the first-pass state, or the
final state. It validates the complete chain, source pools and destination IDs
in memory. Retired records must match an accepted fingerprint and source pool;
their absence is accepted on repeat application. Private history preserves IDs.
`package-patch.json` updates two Market Signal question-package metadata entries,
requires the independent SVG, and retires the superseded numerical PNG by hash.

Review upstream conflicts manually. Every changed record must exactly match an
accepted fingerprint; all files and assets are checked before writing begins.
Repeated application is idempotent. Validation checks unique IDs within each
game, four distinct choices, required metadata and one matching answer hash.
These mechanical checks do not certify every unchanged answer's economics.

No progression, adaptive weights, scoring, telemetry or saves are changed.
Cost's only engine fix lets the existing history-free retest retry run when
recent-history exclusions exhaust the matching skill, objective or tag. This
prevents selection from drifting to an unrelated candidate despite matching
content being available. The full function replacement is conflict-checked in
the Cost manifest. Market Signal's question-package LO label and graph descriptions are
updated. The publisher's normalization and SHA-256 verification are retained.
Private source files and faculty exports are excluded from deployment.

`runtime-check.mjs` uses Playwright (set `PLAYWRIGHT_MODULE` to its package
directory) and a headless Edge session. It blocks external requests, serves only
public asset roots, checks all answer options with the actual browser verifier,
samples repair/bridge/retest routes and boss triples, and verifies the corrected
Strategy Desk stage order. Results contain IDs and counts, not question text,
and are saved in the existing private alignment-audit directory. Cross-objective
remediation selections are logged separately: a returned record is not proof
of misconception-specific repair or appropriate retest demand.

Set `AUDIT_GAME=cost-directive` and optionally `AUDIT_OUTPUT_DIR` to run a scoped
pass. `runtime-check.mjs --standard-only` restricts route/boss sampling to
Standard content; answer hashes still cover the entire loaded bank. Cost also
checks room-appropriate recovery twice per source and exhausts matching-item
history to verify the retest repair. These checks do not semantically certify
the excluded Legendary items.

`campaign-check.mjs` samples 40 seeded 30-room Standard traversals for each of
two response-time profiles in every game. It calls the actual selection and
mastery-recording functions, skips presentation-only boss intros, advances rooms directly, and blocks external
requests. Each traversal contains 27 ordinary questions and nine boss stages.
It does not simulate mistakes, retreats, or student learning. Exposure results
and visual checks stay in the private continuation directory. It is a diagnostic
sample, not a target of uniform learning-objective frequencies.

The independent supply/demand SVG and payoff tables contain new practice
structures. No private source file is required to apply the patches. Run the
patch again after publishing; conflicts require content review, not blind
replacement. Faculty authoring sources remain the preferred long-term home.
