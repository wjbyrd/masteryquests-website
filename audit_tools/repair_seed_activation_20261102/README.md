# Promote Repair seeds — November 2, 2026

The instructor requested that Repair seeds become regular Repair questions. All 15 seed questions across 12 stored concepts were promoted, including the eight newly approved in `MasteryQuests-review-results(17).csv` and seven with earlier reviews outside the current queue.

The only change to each question record is `instructionalRole: repairSeed → repair`. Stems, alternatives, correct answers, explanations, difficulty and source provenance remain unchanged. Each record moves from `repairSeedQuestions` into `repairQuestions`, and its existing skill route moves from `skillRepairSeedPools` into `microSkillRepairPools`. Existing Repair routes are retained and deduplicated. Registry counts and 13 affected outcome coverage entries reflect the promotion. There are no remaining seed-role records.

Seeds were already exposed through optional seed routes in the engine. This change makes them ordinary Repair records and makes them count toward regular Repair coverage; it does not introduce new questions or alter the engine.

## Review reconciliation

The latest export adds eight passes and no flags. All eight remain accepted after the role change. The review source and standalone HTML retain prior notes, selected answers, approvals and the 22 pending revisions from the previous pass. The review queue now contains 2,616 passes, 22 flags and 4,505 unmarked questions. Its remaining unmarked Repair items are 22 Medium questions.

## Exports

The existing PDF, CSV and Excel banks already include all 15 questions. The export pipeline independently reconstructs every published column and row order from the new bank and proves that all 12,686 exported rows are unchanged. PDF hashes match the preceding fully verified delivery. Excel cells match the reconstructed CSV content; manual reviewer entries, dropdowns, hidden sheets and page references are preserved. Only export provenance, route counts and validation metadata need refreshing. PDF/Excel files are not rewritten for a role field they do not display.

## Validation and reproduction

`apply.cjs --write` performs the guarded promotion using the immutable local baseline from commit `78550b4f`, library hash `270770556299da4a5fa9695f7d818af4c090f67b1feed67e970fea54de9a4c01`. `expectations.json` contains before/after records, pool placements, routing and policy metadata.

`validate.cjs` checks the complete canonical bank, exact historical restoration, all 15 active Repair skill routes and flat pools, unchanged ordinary question banks, and no lost supported mode. The historical adapter lets the comprehensive question-bank and faculty-outcome regression checks verify the promoted bank against previous approved revisions.

`refresh-review.py` reconciles CSV17 and regenerates the existing local review page. `verify-browser.cjs` verifies all 7,143 review records, old browser-progress merging, accepted Repair badges, absence of seed-role items and preservation of the prior revision queue in an isolated browser profile.

`refresh-exports.py NODE_PATH` verifies unchanged publication content and updates export validation metadata. It deliberately fails if published fields, ordering or existing verified PDFs differ. Run the shared `verify_excel.py` against this directory's baseline for independent workbook parity and manual review preservation checks.

Raw baselines, screenshots and full test output remain local and ignored. No website update-page entry is added.
