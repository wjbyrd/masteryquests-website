# Directorate instructional alignment patch

This is a narrow correction pass, not a completed instructional certification.
The full pre-edit report, source map, item ledger and remaining-work list are
local private faculty materials under the ignored `_private_course_sources`
directory. This tool does not read confidential assessments or publish them.

The private faculty sources and Gauntlet publisher were unavailable in the two
workspaces. The existing hashed public banks remain runtime artifacts. Following
the prior Cost Directive workflow, this checked manifest preserves revisions
for replay after a faculty publication. It contains no plaintext answer indexes.

Run from any directory with Python:

```text
python audit_tools/directorate_alignment/apply_patch.py --check
python audit_tools/directorate_alignment/apply_patch.py
python audit_tools/directorate_alignment/apply_patch.py --validate
```

Review upstream conflicts manually. Every changed record must exactly match its
before or after fingerprint; all files are checked before writing begins.
Repeated application is idempotent. Validation checks unique IDs within each
game, four distinct choices, required metadata and one matching answer hash.
These mechanical checks do not certify every unchanged answer's economics.

No progression, adaptive weights, scoring, telemetry, saves, UI or engine logic
is changed. The publisher's normalization and SHA-256 verification are retained.
Private source files and faculty exports are excluded from deployment.

`runtime-check.mjs` uses Playwright (set `PLAYWRIGHT_MODULE` to its package
directory) and a headless Edge session. It blocks external requests, serves only
public asset roots, checks all answer options with the actual browser verifier,
samples repair/bridge/retest routes and boss triples, and verifies the corrected
Strategy Desk stage order. Results contain IDs and counts, not question text,
and are saved in the existing private alignment-audit directory.
