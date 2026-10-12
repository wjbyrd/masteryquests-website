# Quality-audit disposition for the Composer synchronization

The authoritative assessment text, choices, key and feedback are copied exactly from the selected Composer records. This pass aligns the games with that reviewed source; it does not claim to independently re-author or resolve every editorial heuristic still reported against Composer. Raw findings are retained in `validation_artifacts/economic_realm_questions/*-quality.json`. The per-game checker blocks unreviewed structural errors.

## Structural and matching checks

Every runtime question passes Composer's field-level validator and has four distinct choices with exactly one matching answer hash. All copied images match the registered Composer hashes. All old IDs remain present. The 39 supplements without corresponding canonical records retain all fields exactly. The source library is unchanged.

The auditor uses `repair`, `repairSeed` and `bridge` as role names. The adapter passes those names instead of JS global names such as `repairQuestions`; otherwise support questions are incorrectly treated as ordinary questions requiring cognitive difficulty. For retained legacy support records, the audit view treats `microRepair`/`bridge` as role labels and leaves cognitive difficulty optional, matching the Composer runtime contract. Published records are not rewritten for this accommodation.

## Reviewed error exception

In Equilibrium Crisis, canonical IDs `ECON-MG-EASY-34` (local 10033) and `ECON-EC-EASYBOSS-17015` (local 17015) both ask “Which statement is positive?” The options constitute the task: the first distinguishes a rent-control prediction from normative housing claims; the second distinguishes a GDP/investment claim from normative macro claims. Their option sets and correct answers differ. Both were existing questions. These two `duplicate-stem` reports are an intentional cross-context identification exercise, not duplicate assessment content. The exception is restricted to those two IDs and that rule. No other per-game ERROR is accepted.

The combined cross-game source report also finds “Which question is macroeconomic?” under two IDs. Those records do not coexist as duplicates in any individual final bank; each game's addition filter rejects an existing normalized stem.

## Inherited nonblocking findings

- **Graph eligibility/cue flags:** legacy Composer records sometimes attach an image without `graphRequired`, or use an implicit visual cue. The asset remains attached and is served correctly. Graph-only mode eligibility retains Composer's explicit flag; no mass inference changes assessed tasks. Inventory accessibility evidence is supplied when missing from the record. These flags are not represented as fixed.
- **Graph-evidence mismatch:** `ECON-SP-ELITE-316` and `317` use the registered two-MD/two-MS graph. Its description explicitly identifies MD1, MD2, MS1 and MS2 and intersections d/e; the heuristic does not recognize those money-market curve families. `ECON-SP-LEGENDARY-9024` explicitly anchors the two expansion stages to AD1→AD2→AD3; the subsequent interest-rate offset is scenario information. The inventory describes the three curves and their order, sufficient for the qualitative direct/induced/offset distinction.
- **Curve-label mismatch:** `LG-Q-9052` uses MPC to mean marginal propensity to consume, supplied numerically in the scenario. It is not a missing marginal-private-cost curve label. The graph supplies the leftward money-supply movement; the scenario supplies the investment amount and MPC for the multiplier calculation.
- **Missing terminal punctuation:** many inherited Liquidity Grid stems are sentence fragments completed by the choices. Text stays identical to Composer.
- **Repeated feedback, weak absolute distractors, answer-length outliers, possible difficulty overstatement and near-duplicate wording:** preserved Composer editorial flags remain visible in the raw reports. Canonical difficulty controls ordinary placement. No newly authored distractors or feedback were introduced to silence a heuristic.
- **Existing consolidated copies:** the same canonical record may correspond to multiple old local IDs. Keeping those IDs preserves save/report identity. Additions cannot introduce another instance of an already selected canonical ID or normalized stem.

The few per-game findings not present under the same ID/rule in the combined source report were checked separately:

- Retained Market Gate 41010 and National Ledger 42009 contain absolute distractors. Their correct claims are tax-remittance equivalence and resources being neither necessary nor sufficient for high productivity. These are unchanged, targeted phase-2 supplements with valid, distinct keys.
- Equilibrium Crisis 18011/19023 repeat labor-force-entry reasoning with different quantities in different checkpoint stages. Both existing IDs are preserved.
- Liquidity Grid 73/139, 9019/314 and 9038/343 are existing numerical variants of real-rate, deposit-multiplier and unexpected-inflation calculations. They remain canonical and retain their original local IDs.
- Liquidity Grid 74 versus added `ECON-SP-EASY-21` separates calculating the percentage-point adjustment from recognizing its direction. This is complementary Fisher-effect practice, within the existing topic.

All per-game findings are either inherited unchanged from canonical content, the explicitly preserved supplements above, or these reviewed composition-dependent comparisons. The raw warnings/reviews are not relabeled as a clean independent content audit.
