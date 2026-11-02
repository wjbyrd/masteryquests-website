# Accept Repair revisions and restore the CPI question — November 2, 2026

Imported all 22 new passes from `MasteryQuests-review-results(18).csv`. The instructor explicitly requested that `ECON-NL-INFLATION-RATE-5021` return from Bridge to Repair. Review notes in the attachment are treated as review data within that request.

The CPI question retains its wording, four choices, correct answer, explanation, difficulty and provenance. Only its instructional role changes. Its original Repair pool position and inflation-rate skill route are restored, and it is removed from the Bridge pool and route. CPI registry counts and faculty outcome coverage return to four Repair and two Bridge questions. The earlier promotion of all 15 Repair seeds remains intact.

The other 9,801 canonical question records are unchanged. No engine code or ordinary question bank changes. Canonical integrity, exact historical restoration, support routing, comprehensive question-bank checks and faculty-outcome validation cover the change.

## Review handoff

All 22 revisions now have accepted reviews, with their exported notes, answer choices and revision associations preserved. Prior flag history is retained even though CSV exports do not carry nested history. Existing approvals remain intact. The queue has 2,638 passes, zero flags, zero revisions awaiting verification and 4,505 unmarked records. The standalone review page opens the 1,644 remaining Medium questions and shows the CPI item as accepted Repair.

Browser verification uses an isolated temporary Edge profile. It checks all 7,143 question records, merges older browser progress, confirms all 22 approvals, verifies the Bridge-to-Repair notice and checks the Medium handoff.

## Banks and reproducibility

Published PDF/CSV/Excel columns do not expose this role field. The export pipeline reconstructs all published rows and confirms that their content and order still match. Existing PDFs match the preceding visually checked delivery, and independent Excel verification confirms every cell and preserves the manual review workbook's values, dropdowns, hidden sheet and page references. Only export provenance and validation metadata require refresh.

The immutable local baseline is commit `be9aed0d`, library hash `02ecab7d94216f1231f79bb914e5e93a25925aa0a5a5f45395a2a9bc4f4a7d90`. `apply.cjs --write` performs the guarded role correction; `refresh-review.py` imports CSV18 and regenerates the local review page; `refresh-exports.py NODE_PATH` verifies publication parity and refreshes metadata. The ledger retains before/after records, pool placements, routes and policy data. `validate.cjs`, `verify-browser.cjs` and `verify-delivery.cjs` check the final result.

Baselines, screenshots and full test output remain local and ignored. No website update-page entry is added.
