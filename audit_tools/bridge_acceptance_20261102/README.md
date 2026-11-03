# Bridge batch acceptance — November 2, 2026

The instructor approved the Bridge revision batch after heavy sampling. This records acceptance of all 336 revised questions from content commit `f6ba68a1`: 309 application rewrites and 27 market-structure clarifications. The preceding audit covered all 564 Bridge questions and retained 228 existing applications.

Only review decisions and the local review handoff change. All question text, options, explanations, answer positions, classifications, routes, and outcome definitions remain as delivered. The canonical library and seven PDF/Excel artifacts retain their verified hashes. No website update-page entry is added.

The review source now has 2,958 passes and 4,261 unmarked records. Its 6,883 records outside the revision batch are unchanged. The review page opens the 1,586 remaining unmarked Medium questions, with no Bridge revisions awaiting approval in the source seed. The full Bridge filter remains available.

Acceptance is tied to exact question revisions and a separate approval timestamp. Individual edit timestamps are preserved so browser-only notes and answers can still win the existing progress merge. After startup or backup restoration, the page applies the batch approval without changing those notes, answers, flag reasons, or earlier history. Later user actions override the batch approval, and a future question revision is not automatically accepted. Browsers with additional local reviews may show different queue totals.

`accept.py` guards the canonical and artifact hashes, records prior review states in `acceptance.json`, captures an immutable ignored local baseline, updates the source/template/builder, and rebuilds the standalone review page. It deliberately refuses a second acceptance. The checked-in template and builder reproduce the UI change. `verify-browser.cjs` uses an isolated Edge profile to check source parity, preservation of fresh sampling notes and selected answers, older backups, later flags, filters, and mobile layout. It does not access the instructor's browser profile.
