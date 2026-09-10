# Faculty-facing Composer content scope controls

## Executive Summary

**Implementation status: PASS WITH NOTES.** Implemented in `C:/Users/Jennings/Documents/GitHub/masteryquests-website`, the repository specified in the request. The other workspace contains historical staging copies and was used only for temporary implementation/QA files.

Faculty can select concepts, choose Exclude / Brief / Standard / Full, optionally refine existing subskills, configure game settings, and download a valid quest. Concepts and scope are now the first Composer step. Question-level editing was not introduced.

The central Composer core owns explicit concept-to-core-skill and concept-to-extension-skill policies. These filter modules before ordinary pools, checkpoint pools, repair/seed/bridge routes, assets, and game-mode eligibility are composed. Difficulty fields and adaptive runtime code remain unchanged. Recipe schema is now 1.5.0.

- Scope regression: **31,269 assertions passed**. All 149 registry concepts have reviewed Brief metadata; 148 composition cases plus the retired Market Failures migration are covered.
- All 13 presets retain their existing full published pools. All ten game modes pass the mixed-depth composition test.
- Browser QA passed at 1440px and 390px, including keyboard controls, recipe download/import, ZIP generation, and exact generated-runtime pool comparison.
- Generated browser runtime: **504 ordinary/checkpoint questions matched the expected scoped banks exactly**; all **103 embedded graph assets** passed SHA-256 checks.
- Library integrity: 149 concepts, 9,779 unique canonical questions, matching library/registry/manifest checksum, all 507 published asset checksums passed.
- Active suite: **18/26 passed**. The same eight remaining failures reproduce using the pre-change core against the unchanged library/template. Their details are below; this is not an all-green repository release certification.
- Changes are limited to Composer implementation, schema-aware tests, this report, and feature validation evidence. No question bank, question text, telemetry, adaptive runtime, resource sheet, or completed Macro QA content was modified.

## Existing Architecture

The following sources were traced before implementation:

| Responsibility | Canonical source / behavior |
| --- | --- |
| Entry page | `build/faculty-build-composer/index.html`; existing site build links route here |
| Faculty concept UI, presets, browser state, downloads | `build/faculty-build-composer/composer.js` |
| Layout and visual language | `build/faculty-build-composer/composer.css` |
| Published concept and question library | `build/faculty-build-composer/data/composer_library.js`, including its embedded registry and canonical question metadata |
| Published registry and integrity metadata | `data/composer_registry.json`, `data/composer_library_manifest.json`; generated publication products, left unchanged |
| Course areas / navigation families | `course-area-model.js`; `create`, `areasFor`, `disciplineFor`, `navigationFamilyFor`, and `navigationFamiliesForArea` govern shared General Economics / Micro / Macro navigation |
| Curricular metadata | Module `objectiveLabels`, question `objective` / `outcomeIds`, `primarySkill`, `secondarySkills`, registry `includedSkills`, family/child membership |
| Child resolution | `composer-core.js: resolveConceptModule`; resolves derived Micro modules and their canonical question membership before scope filtering |
| Recipe migration / composition / game config | `composer-core.js: migrateRecipe`, `compose`, `canonicalRecipe`, `createConfig`, `buildHtml` |
| Generated game runtime | `template/mastery-quests-faculty-template-composer-ready.html`; receives `FACULTY_COMPOSITION_CONFIG` and filtered question banks |
| Presets / themes | Thirteen `PRESETS` in `composer.js`; `data/official_theme_library.js` and `custom-asset-core.js` for appearance |
| Concept Review routing | `data/concept-reviews/manifest.json`, core resolution functions, `concept-review-runtime.js`; central HTTPS review sheets |
| Persistence | In-memory authoring state plus JSON recipe download/import; existing generated-game save namespace derives from recipe fingerprint. No authoring backend or new storage introduced |
| Tests | `tests/run_active_composer_suite.js`, `tests/composer-test-helpers.js`, individual mode/theme/review/runtime tests |

Historical publication scripts, generated sample games, and staging copies are not the Composer implementation source. They were not patched. Current canonical question publication and Macro taxonomy mappings were inspected but not changed.

## Scope-Control Model

Recipes, generated game configuration, and the production package manifest carry `contentScopes`, keyed by canonical concept ID:

```json
{
  "schemaVersion": "1.5.0",
  "selectedConceptIds": ["demand", "monopoly"],
  "contentScopes": {
    "demand": {
      "depth": "brief",
      "skillIds": ["law_of_demand", "movement_vs_demand_shift"]
    },
    "monopoly": {"depth": "full"},
    "supply": {"depth": "exclude"}
  }
}
```

- **Exclude:** removes the concept from normalized selected IDs and every composed pool. Explicit exclusion remains in the recipe. Excluding a retired parent propagates to its migrated children.
- **Brief:** selects the explicit essential-skill set for that concept. It does not examine question difficulty, role, count, or ordering to decide curricular membership.
- **Standard:** selects the available skill set minus explicitly recorded broader extensions. This is the default when faculty select a new concept.
- **Full:** includes the full current curated module. With no manual refinement it preserves legacy question coverage, including records without usable skill metadata.
- **Optional refinement:** `skillIds` is omitted for depth defaults and present for a deliberate faculty selection. Faculty may add or remove any subskill actually associated with the concept, including broadening a Brief default. Changing depth or using Reset removes the manual override. An empty manual set blocks generation; it is never treated as “all.”
- **Backward compatibility:** recipes with no scope entry resolve to Full, preserving their prior exact published scope. Existing presets also explicitly use Full. This is a deliberate compatibility exception to the new-selection Standard default. Already generated games are untouched and do not need new fields.
- **Validation:** unknown concept/skill IDs, invalid depths, malformed refinements, and empty eligible selections are rejected. Scope-bearing JSON imports are validated before migration. Canonical serialization preserves IDs, sorts manual skill IDs, and includes scope in the recipe fingerprint/save namespace.

Filtering resolves child membership first. Every recorded primary **and secondary** skill on a question must be allowed. A match on one skill cannot admit a question whose other recorded skill is excluded. Filtered question IDs also prune repair/seed/bridge references; a repair fallback cannot resurrect an excluded question. Only eligible objective labels remain in narrowed modules.

Scope inference is limited by published metadata. Records without usable skill metadata are omitted from manual refinement and Brief. They remain in unrefined Full; Standard retains them only where Standard has no extension distinction. The customization panel explicitly reports unmapped records. No fabricated objective-to-question mapping was added.

## Coverage Semantics

`ContentScope.BRIEF` and `ContentScope.EXTENSIONS` in `composer-core.js` are the reviewable curricular policy tables. Supported refinement options come from the resolved module's actual question skills, including secondary skills. Labels only replace underscores/hyphens with spaces in those existing IDs; they are not invented learning outcomes. Existing objective labels often contain codes such as `LO4.2`, so they were not presented as descriptive faculty objectives.

Representative scope differences:

| Concept | Brief content | Standard content | Full adds |
| --- | --- | --- | --- |
| Demand | Law of demand, demand schedule interpretation, movement versus shift | Adds demand shifters, income/related-goods/tastes/expectations, substitutes/complements and normal/inferior goods | Multiple demand shifters, equilibrium comparisons/effects, supply-shift equilibrium prediction, price-signal allocation |
| Monopoly | Definition/barriers, demand and marginal revenue, output choice and price | Adds revenue/output analysis, profit/loss/shutdown, natural monopoly and standard welfare comparisons | First-/third-degree discrimination, discrimination conditions/welfare/resale prevention, price-cap and marginal-/average-cost regulation, regulatory tradeoffs, rent seeking |
| Real versus Nominal GDP | Nominal-versus-real distinction and real-GDP calculation | Adds GDP deflator, deflator growth, real growth | Price/output decomposition and GDP welfare scope |
| Scarcity and Tradeoffs | Scarcity and identifying tradeoffs | Adds efficiency, equality, their distinctions and ordinary applications | Efficiency/equity policy tradeoffs and broader policy-tradeoff analysis |
| Capital Flows and Net Capital Outflow | NCO definition/calculation, asset-transaction classification, interpreting NCO sign | Adds capital-flow mechanisms, foreign investment, interest/risk channels and ordinary flow calculations | Capital-flight feedback, risk-adjusted flows, competing/reinforcing forces and reconciling saving with gross flows |
| Quantity Theory of Money | Quantity equation, velocity definition/calculation, solving the price level, core prediction | Adds ordinary growth/graph/adjustment applications | Explicit velocity-change and multi-change equation applications and long-run synthesis |

For exact membership, the table IDs in core are authoritative. For example, Demand's Full-only extensions are `multiple_demand_shifters`, `equilibrium_comparison`, `equilibrium_effects`, `supply_shift_equilibrium_prediction`, and `price_signal_allocation`. Demand's Brief IDs are `law_of_demand`, `movement_vs_demand_shift`, `movement_vs_shift`, and `demand_schedule_interpretation`.

The regression confirms three different pools for Demand (23 / 64 / 74 unique eligible IDs), Monopoly (88 / 375 / 524), Real versus Nominal GDP (10 / 43 / 49), and Scarcity (57 / 68 / 96). These counts include eligible support questions. The same tests verify that Brief retains hard/elite/legendary questions and that Full adds easy/medium questions. Thus the distinction is curricular rather than a renamed difficulty selector.

**Existing scope limits:** nine concepts have a distinct Standard/Full extension policy: Demand, Supply, Market Equilibrium, Monopoly, Consumer Choice, Scarcity and Tradeoffs, Real versus Nominal GDP, Capital Flows and Net Capital Outflow, and Quantity Theory of Money. The other 139 independently tested entries currently have the same Standard and Full pool. Their current published coverage already serves as normal coverage; no artificial extension split was invented. This is explicitly explained on their cards. Long-Run Aggregate Supply and Potential Output has only one recorded skill (`identify_lras`); all three depths cover the same recorded scope. Other single-skill concepts can differ in counts only because Full preserves unmapped legacy records, not because their sole skill was subdivided.

The Advanced Macro Checkpoint Supplement remains an optional challenge layer, not an ordinary standalone instructional concept. It requires its prerequisite concept combination. Its questions lack reliable cross-concept scope mappings, so any narrowed instructional selection conservatively suppresses these optional integrated challenges and uses the existing ordinary checkpoint fallback. The adaptive engine is not changed. Reliable cross-concept metadata is required before these challenges can safely operate within narrowed scopes.

## UI Changes

1. Composer opens on **Concepts & scope**. Choose a course area and select concepts or a preserved starter combination.
2. Selecting a normal concept reveals a compact native depth select, defaulting to Standard.
3. **Customize subskills** is collapsed by default. Its scrollable list contains only that concept's supported IDs, displayed as readable words. Counts update immediately; native checkboxes retain keyboard focus during edits. Reset restores depth defaults.
4. Continue to game details, modes, checkpoints, appearance, readiness, and generation. Faculty can generate without opening customization.

Selected card totals now show **eligible** practice/checkpoint/support counts. The separate collapsed **Published library coverage** section retains clearly named whole-library coverage information. Checkpoint focus eligibility uses the filtered module. Existing readiness validation explains when a narrow pool cannot support a chosen mode; it never silently broadens scope to meet a minimum.

Desktop and 390px mobile screenshots were visually inspected. Controls fit within the existing cards, long Macro titles wrap, objective/subskill lists remain readable, there is no horizontal page overflow, and no duplicate DOM IDs were found. Native select, checkbox Space/Tab, details toggling, Exclude/reselect, JSON import/export, and ZIP generation passed browser automation.

Evidence: `validation_artifacts/composer_scope_controls/desktop-demand.png`, `mobile-demand.png`, and `mobile-long-concept.png`.

## Preset Compatibility

All thirteen concept presets keep their names, IDs, concepts, settings, and full published pools. Applying a preset writes explicit Full scopes, avoiding a silent coverage reduction in a previously working build path. Faculty can then narrow individual concepts. Theme and custom-image behavior remains intact; both existing schema-aware theme validators pass after updating their expected recipe schema from 1.4.0 to 1.5.0.

Legacy stage and taxonomy migrations remain. They were not removed as “dead” code because existing compatibility tests still exercise them. JSON round-trip tests cover mixed depths, explicit exclusions, manual skill IDs, and runtime configuration.

## Navigation / Index Cleanup

- Moved concept/scope selection ahead of game settings in the existing step navigation, with matching panel IDs and startup state.
- Replaced the duplicated “Macro minus General minus Micro” supplement eligibility reconstruction with the canonical course-area model's discipline lookup.
- Area changes and parent/child exclusion now keep scope state and checkpoint focus synchronized, avoiding stale active-scope entries.
- Family index links still derive from `course-area-model.js`; canonical-ID integrity and browser duplicate-ID checks pass. No second family registry was introduced.
- Refreshed stale cache-version references for the Composer scripts/styles, course-area model, and published library in the entry page.
- Renamed coverage details to distinguish the published library from the faculty's scoped pool.

No general navigation refactor or removal of tested legacy migrations was performed.

## Regression Results

Run the core suite with `node build/faculty-build-composer/tests/run_active_composer_suite.js`. The new scope validator is part of that suite. The optional browser runner is `tests/run_content_scope_browser_validation.cjs`; it requires Playwright and installed Microsoft Edge. Set `MQ_PLAYWRIGHT_MODULE` if Playwright is supplied by an external runtime, and `MQ_COMPOSER_TEST_OUTPUT_DIR` to retain screenshots, recipes, generated ZIP, and results.

The active suite before the feature has 25 runners and passes 17. The implemented suite has 26 runners and passes 18, including the new scope test. A Node preload compiled the core from `git show HEAD:build/faculty-build-composer/composer-core.js` for the baseline run without reverting or editing live files. The library and template are unchanged from HEAD. `regression-comparison.json` records both outcomes.

| Test | Result |
| --- | --- |
| `run_content_scope_validation.js` | PASS; latest targeted rerun: 31,269 assertions |
| `run_content_scope_browser_validation.cjs` | PASS; desktop/mobile, keyboard, save/import, generated ZIP/runtime |
| `run_default_character_set_validation.js` | PASS |
| `run_exam_navigation_boss_reveal_validation.js` | PASS |
| `run_checkpoint_artifact_exam_integrity_validation.js` | PASS |
| `run_guide_intro_validation.js` | PASS |
| `run_phase1_targeted_repair_validation.js` | PASS |
| `run_phase15_production_hardening_validation.js` | PASS |
| `run_visibility_aware_telemetry_validation.js` | PASS; telemetry unchanged |
| `run_generated_telemetry_smoke.js` | PASS |
| `run_phase3a_official_theme_validation.js` | PASS; schema expectation updated |
| `run_phase3b_custom_asset_validation.js` | PASS; schema expectations updated |
| `run_phase3e_graph_question_sync_validation.mjs` | Pre-existing FAIL; historical count/copy/answer expectations no longer match current bank. Only its schema expectation was updated |
| `run_question_quality_auditor_validation.mjs` | Pre-existing FAIL; stale source hash on question `40010` |
| `run_macro_phase2_taxonomy_validation.mjs` | Pre-existing FAIL; hardcoded global synchronized totals do not match 149 concepts / 9,779 questions |
| `run_checkpoint_remediation_design_change_validation.mjs` | PASS |
| `run_concept_review_integration.js` | PASS |
| `run_mastery_report_concept_reviews.js` | PASS |
| `run_mastery_report_2_validation.js` | Pre-existing FAIL; historical canonical-question total |
| `run_mastery_report_state_leak_hotfix.js` | PASS |
| `run_mode_availability_fix.js` | PASS |
| `run_quiz_mode_validation.js` | PASS |
| `run_unlimited_practice_validation.js` | Pre-existing FAIL; historical canonical-question total; mode/runtime assertions pass |
| `run_trial_by_graph_validation.js` | Pre-existing FAIL; historical canonical/graph totals and graph-audit membership |
| `run_fading_fortune_validation.js` | Pre-existing FAIL; historical canonical-question total; mode/runtime assertions pass |
| `run_risk_reward_validation.js` | Pre-existing FAIL; historical canonical-question total; mode/runtime assertions pass |
| `run_risk_reward_state_validation.js` | PASS |
| Library/registry/manifest integrity | PASS; synchronized 149 concepts / 9,779 unique questions |
| Library and asset checksums | PASS; library SHA-256 `530ce41689bf83126ccde2d7d0fd236ca0c34761042455323ce7d3f99e97bbab`; 507 asset hashes |
| Generated package / browser runtime | PASS; four ZIP entries; manifest preflight all ten modes; 103 embedded asset hashes; exact 504-question runtime bank |
| JavaScript syntax / generated inline scripts | PASS |
| DOM duplicate IDs / narrow-width overflow | PASS |
| Final Git diff / whitespace check | PASS; changes limited to the listed feature files |

Required feature cases are covered explicitly: legacy/default construction, all four depths, manual refinement, mixed depths, Macro/Micro/shared General Economics, all presets, JSON serialization, exclusion across ordinary/checkpoint/repair/seed/bridge pools, difficulty invariance, all game modes, and Concept Review routing. A synthetic two-skill question verifies that a selected primary skill cannot leak an excluded secondary skill. An untagged synthetic question is also excluded from narrowed scope.

No content or historical QA fixtures were rewritten to make the eight pre-existing failures pass. A separate bank/test-maintenance task should reconcile those expectations and the stale source hash.

## Files Changed

Implementation and tests:

1. `build/faculty-build-composer/composer-core.js`
2. `build/faculty-build-composer/composer.js`
3. `build/faculty-build-composer/composer.css`
4. `build/faculty-build-composer/index.html`
5. `build/faculty-build-composer/tests/run_active_composer_suite.js`
6. `build/faculty-build-composer/tests/run_content_scope_validation.js`
7. `build/faculty-build-composer/tests/run_content_scope_browser_validation.cjs`
8. `build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js`
9. `build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js`
10. `build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs`

Report and validation evidence:

11. `FINAL_REPORT_composer_scope_controls.md`
12. `validation_artifacts/composer_scope_controls/content-scope-results.json`
13. `validation_artifacts/composer_scope_controls/ui-results.json`
14. `validation_artifacts/composer_scope_controls/integrity-results.json`
15. `validation_artifacts/composer_scope_controls/regression-comparison.json`
16. `validation_artifacts/composer_scope_controls/desktop-demand.png`
17. `validation_artifacts/composer_scope_controls/mobile-demand.png`
18. `validation_artifacts/composer_scope_controls/mobile-long-concept.png`

Generated test games/ZIPs and temporary scripts were kept outside tracked production files. No deployment or commit was performed.

## Remaining Issues

### Real blockers

No blocker remains for the implemented faculty workflow or tested generated quest. However, the repository's active suite is not completely green: eight baseline failures remain. Treat those as blockers to claiming a clean whole-repository release; their bank/QA maintenance is outside this feature's permitted scope.

### Metadata limits and optional future improvements

- Standard and Full intentionally coincide where no broader extension distinction is justified by the current policy. Expanding the explicit extension table is a curricular review decision, not an automatic difficulty heuristic.
- A concept with one recorded skill cannot truthfully provide three distinct curricular breadths without richer canonical metadata. The UI states this limitation.
- Human-authored subskill labels could improve acronym/casing polish. Current labels are mechanically rendered canonical IDs, avoiding fabricated objectives.
- Unmapped questions cannot safely participate in manual or Brief refinements. Improve their source metadata in a separate curation task.
- Optional integrated Macro checkpoint challenges need cross-concept skill mappings before safely supporting narrowed scopes. Existing normal checkpoint fallback remains available.
- Some Brief/manual pools are too small for particular game modes. Existing readiness checks report this and block unsupported builds rather than expanding content without faculty consent.

## Final Verdict

**PASS WITH NOTES**

Faculty can configure curricular scope and generate a valid quest without reviewing individual questions. Verified content changes follow canonical subskills, preserve question difficulty, and reach the generated browser runtime. Presets, normal game settings, resource routing, and adaptive mechanics remain compatible. Metadata limitations and unrelated baseline regression failures are documented above.
