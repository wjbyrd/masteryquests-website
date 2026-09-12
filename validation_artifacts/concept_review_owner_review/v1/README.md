# Concept Review owner review package

Open [index.html](index.html) to browse 151 sheets. Record decisions in [REVIEW_CHECKLIST.csv](REVIEW_CHECKLIST.csv). Read [REVIEW_SUMMARY.md](REVIEW_SUMMARY.md) for known owner findings and new first-pass concerns.

These are REVIEW COPIES of current accepted staged candidates, not the active production PDFs. Every copy is byte-identical to its selected staged candidate. Technical acceptance does not imply instructional approval. Nothing is pre-approved for installation.

Do not use PDFs in `concept-reviews/` or `build/faculty-build-composer/data/concept-reviews/` as evidence of current staged content unless hash-based candidate resolution explicitly establishes a match. Production still includes older bytes. The review package includes the corrected MICRO-49 with B/Y = (1,1).

Review order: GEN-ECON-01 → GEN-ECON-26; MICRO-01 → MICRO-68; MACRO-01 → MACRO-57. Also use the sequence comparisons in the summary, especially GEN-ECON-21/22 with MICRO-09 and MACRO-11/12/13.

For each sheet consider:

1. Is the economics correct?
2. Is the level appropriate?
3. Does the worked example match the outcome?
4. Does the self-check make sense?
5. Is the visual useful?
6. Would a graph or table materially improve this?
7. Is the same graph or example already used elsewhere?
8. Does anything feel wrong or unnecessarily complicated?

## Recording decisions

Filter the CSV by Priority, KnownOwnerIssue, ContentCorrectness or WouldGraphOrTableHelp. Each of 151 rows answers the visual-utility question and contains a specific first-pass observation. PASS means no issue found in that pass; it is not owner approval. QUESTION invites faculty judgment; FAIL identifies a specific contradiction. CalculationCheck QUESTION also covers unsupported inputs/graph readings even where arithmetic is correct. Blank OwnerNotes, OwnerDecision and ApprovedForInstall are for the owner. OwnerReviewStatus can carry an existing design decision without approving the whole sheet.

The local HTML only filters and links to PDFs; it does not save approval. Use your spreadsheet application to edit the CSV and preserve all resource IDs and candidate hashes. Review at comfortable full-size zoom or print size; contact sheets are audit aids, not substitutes for owner inspection.

OWNER approval must precede installation. Pending changes to MACRO-11/13/16/20 were deliberately not made. MICRO-09's no-additional-graph decision and MACRO-12's retained-graph decision remain in force. Human AT is PENDING.

## Provenance and safety

`candidate_manifest.json` records every source candidate, copy, SHA-256, raw validation evidence and applicable report. Review paths are relative to this folder; source/evidence/report paths are relative to repository root `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. `_audit/` contains read-only inspection scripts, per-sheet transcripts/observations, existing-render contact sheets and integrity evidence; it contains no additional review PDFs.

Selection authority: `validation_artifacts/pdf_accessibility/micro49_unique_nash_v2`. No production fallback, source editing, semantic alteration, PDF regeneration/re-tagging, installation, deployment, commit or push occurred. The forbidden workspace was not used.
