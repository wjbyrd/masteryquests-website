# Quantity Theory / Monetary Neutrality Question Inheritance Audit

Date: September 10, 2026. Repository: `C:/Users/Jennings/Documents/GitHub/masteryquests-website`.

## Executive Summary

**PASS WITH NOTES — no material inherited defects remain in the active sources examined.** The old graph is intentionally retained for valid qualitative and variable-velocity questions; its continued presence is not itself a failure.

| Measure | Result |
|---|---:|
| Initial search-hit records screened (bank-file + ID, aliases deduplicated) | 730 |
| Targeted candidate question variants examined | 292 |
| Question IDs affected | 14 Liquidity Grid IDs |
| Active served variants corrected or clarified | 16: 14 built-in + 2 corresponding Composer variants |
| Built-in graph references corrected | 14: 2 replaced, 12 removed |
| Answer choices / answer hashes changed | 0 / 0 |
| Repository files changed or created | 8 |
| Recovered private-source files synchronized outside repository | 2 |
| Unresolved material cases requiring judgment | 0 |

The scope was the known graph and its mathematical descendants. The search traversed 14 published student-bank JavaScript files, their available repair/bridge pools, and all question-bearing Composer collections (including shared General Economics). It screened 18,630 question occurrences before file/ID deduplication. Incidental matches in Micro/managerial content, such as elasticity 0.67 or a $2,500 cost, were excluded from the targeted review; no broad rewrite followed. The 292 retained variants cover graph dependencies, both named concepts, reciprocal money-value calculations, velocity, money-doubling implications, and equivalent numerical reasoning. Stems, options, keyed answers, feedback, image use, and metadata were inspected together.

## Affected Questions

All built-in IDs below belong to `play/economic-realm/liquidity-grid/liquidity_grid_questions_student.js`. Their recovered plaintext faculty source is `C:/Users/Jennings/Desktop/Mastery Quests/Main Game Principles of Macro/The Liquidity Grid/The Liquidity Grid_legacy.html`. `LG-Q-...` identifies the corresponding independently curated Composer variant in `build/faculty-build-composer/data/composer_library.js`; those variants were already free of the built-in image mismatch except for the two clarifications below. IDs, choices, answer hashes, difficulty, objectives, tags, and pool placement were preserved.

| Built-in / Composer ID | Concept tag / objective | Original defect | Correction | Independently verified correct answer |
|---|---|---|---|---|
| 330 / LG-Q-330 | `value_of_money` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 1/(1/2) = 2 to 1/(1/4) = 4. |
| 336 / LG-Q-336 | `monetary_neutrality` / 31.2 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P doubles in the stated scenario; nominal prices rise without requiring real output to rise. |
| 3002 / LG-Q-3002 | `money_supply_demand` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 2 to 4. |
| 9025 / LG-Q-9025 | `money_supply_demand` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 2 to 4; purchasing power halves. |
| 9028 / LG-Q-9028 | `money_supply_demand` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 4 to 2. |
| 9042 / LG-Q-9042 | `inflation_costs` / 31.4 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. Removed the stale graph claim in feedback. | Repeated changes to posted prices are menu costs. |
| 9049 / LG-Q-9049 | `money_supply_demand` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 4 to 2; each dollar buys more. |
| 9115 / LG-Q-9115 | `nominal_real` / 31.2 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | Real wage: 20/2 = 10 to 30/4 = 7.5 units. |
| 9116 / LG-Q-9116 | `quantity_equation` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | V2/V1 = (P2/P1)/(M2/M1) = 2/2 = 1. |
| 9121 / LG-Q-9121 | `inflation_policy` / 31.5 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 5 to 4, so deflation. |
| 9125 / LG-Q-9125 | `inflation_redistribution` / 31.4 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | Real debt: 10000/2 = 5000 to 10000/5 = 2000 units. |
| 9126 / LG-Q-9126 | `value_of_money` / 31.1 | Attached graph shows different numerical values or no stated demand shift; the self-contained numerical scenario supplies the answer. | Removed the contradictory image and graph instruction; retained the fully stated numerical inputs and key. | P: 1/1 = 1, 1/(1/2) = 2, 1/(1/4) = 4. |
| 335 / LG-Q-335 | `quantity_theory` / 31.1 | Fixed-V/fixed-Y doubling claim contradicted the attached linear graph. | Reused the corrected fixed-V/Y graph; all existing choices and the key retained. | P doubles and 1/P halves with fixed V and Y. |
| 9026 / LG-Q-9026 | `quantity_theory` / 31.1 | Fixed-V/fixed-Y doubling claim contradicted the attached linear graph. | Reused the corrected fixed-V/Y graph; all existing choices and the key retained. | With V and Y fixed, P2/P1 = M2/M1 = 2 and money value halves. |

Two current Composer variants also changed:

- **LG-Q-336**, `monetary-neutrality`, objective 31.2: the graph gives a one-third price rise, but the neutrality comparison did not explicitly distinguish itself from fixed-velocity quantity theory. Added “Velocity is allowed to change” and explained the required velocity decline. The retained answer is a one-third increase in prices and proportional nominal wages with no required real-wage change. Proof: P1 = 1/2, P2 = 2/3; P2/P1 = 4/3; with fixed Y and doubled M, V2/V1 = (4/3)/2 = 2/3. The real-wage ratio is (4/3)/(4/3) = 1.
- **LG-Q-9042**, `inflation-costs`, objective 31.4: no image was served, yet feedback said “The graph shows...”. Feedback now refers to the stated monetary-expansion scenario and menu costs. The menu-cost answer is unchanged.

All 16 served variants still have exactly one valid keyed choice. Existing answer hashes already represented correct answers to their stated numerical scenarios; the defect was contradictory graph evidence or an unstated model distinction, not an incorrect hash. The private faculty source's plaintext index still points to the same answer, and its hash matches the published bank. No new distractors were necessary.

## Graph Usage

The original image has linear downward MD, MS1 = 2,500, MS2 = 5,000, a at money value 2, b at 1.5, and c at 1 and money quantity 7,500. The graph is unsuitable as numerical evidence for fixed-V/fixed-Y doubling. It remains usable for inverse-price arithmetic, qualitative shifts, or an explicit variable-velocity inference.

**Active sources:** Liquidity Grid's `index.html` loads the student bank above and renders `question.image`. Composer reads the live `composer_library.js`, composes selected canonical modules, and packages eligible questions/images into its current template for all supported game modes. Historical `graphImageMetadata.asset` does not itself render an image. This distinction matters: Composer contains 32 references in question metadata, but only three questions actually serve this graph.

Every active question-family reference to the old asset is accounted for below. Before this pass, all 32 built-in variants attached it. Afterward 18 retain it, 2 use the corrected dedicated image, and 12 use self-contained text. Composer retains its three valid active images and 29 provenance-only references.

| Built-in / Composer ID | Built-in disposition | Current Composer disposition |
|---|---|---|
| 127 / LG-Q-127 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 128 / LG-Q-128 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 129 / LG-Q-129 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 228 / LG-Q-228 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 229 / LG-Q-229 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 328 / LG-Q-328 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 329 / LG-Q-329 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 330 / LG-Q-330 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 331 / LG-Q-331 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 332 / LG-Q-332 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 333 / LG-Q-333 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 334 / LG-Q-334 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 335 / LG-Q-335 | Corrected dedicated graph; fixed-V/Y doubling. | Historical metadata only; no rendered image. |
| 336 / LG-Q-336 | Old image removed; independently specified text scenario. | Old graph retained; explicitly variable velocity; +1/3 prices/wages, unchanged real wage. |
| 3002 / LG-Q-3002 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9025 / LG-Q-9025 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9026 / LG-Q-9026 | Corrected dedicated graph; fixed-V/Y doubling. | Historical metadata only; no rendered image. |
| 9027 / LG-Q-9027 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9028 / LG-Q-9028 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9029 / LG-Q-9029 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Old graph retained; inference requires V2/V1 = 2/3 if Y is fixed. |
| 9042 / LG-Q-9042 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9043 / LG-Q-9043 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9047 / LG-Q-9047 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9049 / LG-Q-9049 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9050 / LG-Q-9050 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9115 / LG-Q-9115 | Old image removed; independently specified text scenario. | Old graph retained; reciprocal/real-wage arithmetic, no fixed-V/Y assumption. |
| 9116 / LG-Q-9116 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9117 / LG-Q-9117 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9120 / LG-Q-9120 | Old image retained: qualitative curve/direction/conditional scenario; no fixed-V/Y numerical claim. | Historical metadata only; no rendered image. |
| 9121 / LG-Q-9121 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9125 / LG-Q-9125 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |
| 9126 / LG-Q-9126 | Old image removed; independently specified text scenario. | Historical metadata only; no rendered image. |

The three Composer image paths are:

- `question-assets/quantity-theory-of-money/moneys_moneyd.webp` — LG-Q-9029.
- `question-assets/monetary-neutrality/moneys_moneyd.webp` — LG-Q-336 and LG-Q-9115.

The live library/manifest also preserve asset metadata for copies under `fisher-effect`, `inflation-costs`, and `inflation-tax-and-deflation`; none of the inspected current questions in those modules renders those copies. Existing graph metadata and archive references were not rewritten as if they were active assessment content.

**No original graph bytes were overwritten.** Built-in 335 and 9026 now use `play/economic-realm/liquidity-grid/quantity-theory-fixed-v-y.png`, copied byte-for-byte from the corrected resource-sheet asset. The matching PNG was installed next to the recovered private faculty source. The new graph labels “Value of money (1/P)” and displays 2 → 1 while M rises 2,500 → 5,000. The text distinguishes V as velocity where necessary. No keyed answer confuses velocity with 1/P; appearances of that confusion in explicitly wrong distractors were retained.

**Resource sheets:** MACRO-23 and MACRO-24 still use `build/faculty-build-composer/data/concept-reviews/assets/quantity-theory-fixed-v-y.png`. Both public and Composer PDFs, source records, and resource manifests are unchanged by this question-only pass.

## Numerical Pattern Search

The post-correction search rechecked active question stems, choices, and feedback, separately from historical image metadata. It included comma/no-comma quantities, decimal and fraction forms, one-third/two-thirds wording, percent forms, and conceptual alternatives involving V or Y changes.

- **2,500 → 5,000 and 2 → 1.5 / 0.50 → 2/3 remain only where appropriate:** LG-Q-9029 diagnoses the velocity decline; LG-Q-336 now explicitly permits it; LG-Q-9115 reads the graph for wage arithmetic (24/0.5 = 48, 30/(2/3) = 45, compensating nominal wage = 32). None assumes fixed velocity. Qualitative old-graph questions ask no proportional quantity-theory calculation.
- **Fixed-V/fixed-Y doubling:** built-in 335 and 9026 now show the corrected graph; P rises 0.50 → 1.00, a 100% increase. Other text-only doubling questions already key doubled P / halved money value.
- **33% / one-third:** no retained question keys one-third inflation under fixed V and fixed Y. Remaining unrelated mentions include incorrect sacrifice-ratio distractors and other non-quantity-theory arithmetic; these were not altered.
- **Alternative numbers:** calculations such as 1/2 → 1/4 imply P = 2 → 4 and remain valid once the incompatible image is removed. Explicitly changing velocity/output cases were recomputed under their own assumptions, rather than forced into the clean doubling case.
- **Symbol check:** V in MV = PY is velocity; value of money is 1/P. The retained old graph's V_M label denotes money value, as stated in its question/asset context. The dedicated corrected graph avoids V_M entirely.

## Source of Record and Propagation

The original publisher provenance led to the recovered private faculty HTML, which contains plaintext `a` indexes. Its 14 affected records were synchronized, including the new graph references, and tested against the published variants. The private source remains outside the public repository.

The repository now has a narrowly scoped, reviewable correction source at `play/economic-realm/liquidity-grid/authoring/quantity_theory_corrections.json` and a repeatable publisher at `audit_tools/publish_quantity_theory_repair.mjs`. Run it after legacy publishing/imports; without `--write` it reports drift, and with `--write` it applies only named fields/IDs and synchronizes the graph copy and Composer checksum sidecars. The generated bank header records this requirement. The optional `--private-source` argument also maintains the recovered faculty HTML.

The live Composer library is the current curated source of record for generated Composer games. Its two revised variants, aliases, and library/registry/manifest fingerprints are synchronized. The current Composer build uses these live records, not the obsolete `sourceOccurrences` paths or historical phase snapshots. The reusable correction source keeps the two clarifications available after future legacy imports without replacing the curated bank wholesale.

Legacy directories, validation snapshots, earlier generated packages, deployment ZIPs, and historical migration scripts contain older copies. They are provenance/test artifacts, not inputs to the current Composer runtime or Liquidity Grid page, and were not mass-patched. Freshly generated output was tested. Previously downloaded/offline packages must be rebuilt if they are to receive this repair; no live deployment is claimed.

## Regression Results

- **PASS:** staged comparison protected all unrelated fields, questions, IDs/order, pools, and complete repair/bridge suffixes.
- **PASS:** all 591 built-in records have unique IDs, four distinct choices, exactly one matching answer hash, and resolvable images.
- **PASS:** all 9,779 unique Composer IDs retained; repeated pool aliases agree. The modified variants preserve choices, hashes and metadata.
- **PASS:** independent numerical calculations in `validation.json`, including reciprocal prices, wage purchasing power, real debt, fixed-velocity doubling, and V2/V1 = 2/3 for the retained old graph.
- **PASS:** all 10 Composer modes remain ready for the 13-concept monetary-family fixture; generated answer verification, 16 graph assets/checksums, embedding, and generated inline JavaScript syntax pass.
- **PASS:** Microsoft Edge browser smoke test loads the actual built-in page and a newly generated Composer game; 18 served variants pass rendering, image decode/absence, and browser answer-hash checks. Zero page errors. This is a targeted content test, not an all-mode playthrough.
- **PASS:** existing concept-review integration tests, 12/12; mastery-report concept-review regressions, 26/26. All 79 active Macro-selector concepts still resolve to the same 83 sheets, zero mapping failures.
- **PASS:** publisher idempotence, including private-source synchronization: no stale outputs on a second run.
- **PASS:** repository-wide tracked-file hash comparison against the start-of-task baseline: only the four intended existing bank/checksum files changed. All unrelated tracked files, old graph bytes, and corrected resource PDFs are unchanged. Git diff whitespace check passes.

## Files Changed

Repository files (four existing files plus four new files, including this report):

- `build/faculty-build-composer/data/composer_library.js`
- `build/faculty-build-composer/data/composer_library_manifest.json`
- `build/faculty-build-composer/data/composer_registry.json`
- `play/economic-realm/liquidity-grid/liquidity_grid_questions_student.js`
- `play/economic-realm/liquidity-grid/quantity-theory-fixed-v-y.png`
- `play/economic-realm/liquidity-grid/authoring/quantity_theory_corrections.json`
- `audit_tools/publish_quantity_theory_repair.mjs`
- `FINAL_REPORT_quantity_theory_question_audit.md`

Recovered authoring source outside the repository:

- `C:/Users/Jennings/Desktop/Mastery Quests/Main Game Principles of Macro/The Liquidity Grid/The Liquidity Grid_legacy.html`
- `C:/Users/Jennings/Desktop/Mastery Quests/Main Game Principles of Macro/The Liquidity Grid/quantity-theory-fixed-v-y.png`

Audit working evidence is retained at `C:/Users/Jennings/Documents/Mastery Quests Website/tmp/quantity_question_audit`: candidate records, graph-use inventory, remaining pattern matches, source/install hashes, independent calculations, generated fixture, regression results, and browser results. The complete repository reference search is at `C:/Users/Jennings/Documents/Mastery Quests Website/tmp/quantity-refs.txt`. These are working artifacts, not additional active website files.

## Final Verdict

**PASS WITH NOTES — corrected, with only nonblocking notes.** No inherited numerical/graph defect remains in the audited active variants. Valid variable-velocity and qualitative uses of the original image remain deliberately intact. Historical/generated/offline artifacts are not retroactively republished.
