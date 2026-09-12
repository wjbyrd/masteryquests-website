# Concept Review visual restoration

## Root Cause
The owner-QA renderer used a simple text flow with a header and footer. It did not reuse the established metadata card, icon rail, teal rules or Watch Out, Worked Example and Check Yourself panels. Short examples left much of the lower page empty.

## Renderer Changes
qa_template.py centralizes the established letter-page frame, navy/teal palette, metadata strip, rounded cards, vector icons, heading hierarchy and spacing. qa_renderer.py selects these components through the sole canonical semantics record's styleRestoration flag. The legacy route remains available for historical reconstruction. Only the 80 authorized records select the restored template. Table painting now uses navy headers, light row-header treatment, restrained rules and emphasized totals; the real semantic table remains intact.

## Pilot
Seven restored resources: MACRO-11, MACRO-13, MACRO-16, MACRO-20, GEN-ECON-09, MICRO-52, MICRO-51. MICRO-49 was the eighth, unchanged control, preserving its accepted payoff table. V1/v2/restored comparisons were rendered and inspected. The pilot passed exact v2 text preservation, explicit PDF/UA-1, structure, table/Figure/Formula checks, deterministic rebuild and visual review before proceeding. Table-to-prose spacing and metadata icon placement were refined during the pilot.

## Resources Restored
80: GEN-ECON-02, GEN-ECON-05, GEN-ECON-08, GEN-ECON-09, GEN-ECON-10, GEN-ECON-16, GEN-ECON-17, GEN-ECON-22, GEN-ECON-25, MACRO-02, MACRO-03, MACRO-04, MACRO-05, MACRO-06, MACRO-07, MACRO-08, MACRO-10, MACRO-11, MACRO-13, MACRO-14, MACRO-15, MACRO-16, MACRO-18, MACRO-19, MACRO-20, MACRO-21, MACRO-22, MACRO-23, MACRO-24, MACRO-26, MACRO-30, MACRO-37, MACRO-38, MACRO-39, MACRO-41, MACRO-42, MACRO-47, MACRO-48, MACRO-49, MACRO-52, MACRO-55, MACRO-57, MICRO-01, MICRO-02, MICRO-03, MICRO-07, MICRO-08, MICRO-09, MICRO-11, MICRO-12, MICRO-13, MICRO-14, MICRO-15, MICRO-16, MICRO-20, MICRO-21, MICRO-22, MICRO-23, MICRO-24, MICRO-27, MICRO-28, MICRO-32, MICRO-33, MICRO-36, MICRO-38, MICRO-40, MICRO-42, MICRO-44, MICRO-45, MICRO-46, MICRO-47, MICRO-48, MICRO-50, MICRO-51, MICRO-52, MICRO-57, MICRO-58, MICRO-66, MICRO-67, MICRO-68.
71 current candidates were reused without regeneration.

## Layout Modes
{'text / calculation': 24, 'graph + text': 34, 'full-width table': 22}. Text/calculation and text/policy examples occupy fitted worked cards. Retained tall figures use graph + text columns. Wide corrected graphs use full-width graph + explanation. All 22 new/reworked tables use full-width table + explanation. No decorative data was added to fill space.

## Design Components Restored
Navy branded header and resource-code card; divided metadata strip with decorative vector markers; centered title; circular section icons; teal rules; pale teal Watch Out with border; navy Worked Example border; pale teal Check Yourself; navy Ready footer with arrow; consistent margins and balanced vertical spacing. No removed graph was restored.

Body fonts range from 8.5 to 11 points, selected by measured content fit, with the compact setting used on dense sheets. This is within the established family's small worksheet typography, rather than forcing all pages into one fixed text size. Table text is at least 9.18 points. Font-size distribution: {8.5: 1, 9.0: 1, 9.25: 4, 9.5: 38, 9.75: 3, 10.0: 3, 10.25: 7, 10.5: 2, 10.75: 5, 11: 16}. Pages remain 612 by 792 points and one page. Final render inspection found no clipping or overflow; the Check Yourself card ends at y=77, 19 points above the footer. Human visual approval remains separate from these measurements.

## Content Preservation
The complete canonical instructional source file is byte-identical to the v2 baseline. Every restored visual source has the exact normalized v2 text hash. Graph pixels, alternatives, formulas, table values, labels, header scopes/IDs/associations and reading sequence remain unchanged. Authorized differences are styling and dependent image/candidate fingerprints only.

## Accessibility Preservation
151/151 accepted: 80 independently validated restored candidates plus 71 hash-verified reused records. PDF 1.7, PDF/UA-1, language/title, headings, paragraphs/lists, Formula runs, informative Figures, real Table/TR/TH/TD, embedded fonts, contrast and content associations remain. Tables were not converted into Figures: the established source-generated visible cells retain their semantic table tree.

## Human Review
Owner visual review is still required. Human screen-reader/PDF-reader testing is PENDING. No installation approval is inferred.
