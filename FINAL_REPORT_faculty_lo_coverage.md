# Faculty Learning-Outcome Coverage Layer

## Executive Summary

**PASS WITH NOTES.** Implemented in the Faculty Build Composer. Reviewed all 149 canonical registry concepts, including retired and hidden records; created 222 stable faculty outcomes. Forty-seven concepts offer multiple outcomes; 102 retain a single coherent outcome. Hidden compatibility/supplement records are included in those totals, not presented as new faculty selectors. All current faculty-selectable concepts have policy coverage.

Recipe schema is now **1.6.0**. Stable selected outcome IDs compile to the existing canonical-skill filter. Thirteen Composer presets preserve Full published coverage. No question content, difficulty, adaptive logic, telemetry, review resource, runtime template, or graph asset was edited.

Targeted regression: **193,775 assertions**, 536 outcome combinations, all 149 concepts, 13 presets, and ten modes pass. Desktop (1440px) and mobile (390px) browser checks pass. Existing suite: **19/27 pass**, compared with **18/26 before this change**; the same eight unrelated baseline failures remain. Two existing supporting concepts cannot independently support a mode. See Metadata Limitations.

## Architecture

Canonical concept → stable faculty outcome → union of canonical primary/secondary skill IDs → existing scoped module filtering → ordinary/checkpoint/support pools → existing readiness and game generation.

Source tracing identified composer_registry.json and composer_library.js as existing generated curricular data, course-area-model.js as the navigation model, Concept Review manifest/source content as resource evidence, and composer-core.js as the existing scope/composition implementation. These sources remain unchanged. The lower-level Brief and extension policies also remain unchanged and inform preset membership.

The new canonical authoring policy is audit_tools/faculty_lo/outcome-groups.cjs plus approved-merges.json. It contains grouping proposals and reviewed merge decisions, not another concept registry. build-policy.cjs resolves actual canonical modules, assigns every recorded primary/secondary skill to one group, measures coverage using the production composer, and emits data/faculty-outcomes.js. Existing granular concepts without a defensible split inherit their registry instructional description. Faculty labels/mappings are not embedded in UI code. Run node audit_tools/faculty_lo/build-policy.cjs --check to verify deterministic output. Set MQ_LO_OUTPUT_DIR to an output directory when regenerating the policy and full audit.

faculty-outcome-core.js normalizes recipes, recognizes presets, validates selections, and compiles IDs to skills. composer-core.js passes that result to the unchanged ContentScope.filter implementation. Full selections retain the published module exactly. The policy SHA-256 participates in canonical recipes/fingerprints so a mapping change cannot reuse the old save namespace invisibly. Existing generated games remain self-contained and unchanged.

## Faculty Outcome Design

The following deeper review covers all 14 requested representative categories. Counts are distinct ordinary questions after strict all-recorded-skills filtering. Checkpoint/support counts and mode readiness are shown alongside them; complete IDs, difficulty distributions, preset unions, source objectives/review codes, and warnings for every concept are in [the curricular audit](validation_artifacts/faculty_lo_coverage/faculty-outcome-audit.json). Skill IDs here are developer evidence, not faculty controls.

### AD-AS Equilibrium and Output Gaps

Gap classification, unemployment implications, and potential-output interpretation share graph/question metadata. The proposed gap slice was not independently ready, so the static equilibrium/gap area stays coherent.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Read static AD-AS equilibrium and distinguish recessionary and inflationary gaps relative to potential output. | `classify_output_gap`, `connect_output_unemployment`, `identify_lras`, `identify_natural_output`, `lras_shift_vs_gap`, `movement_vs_shift`, `natural_output_determinants`, `read_ad_as_equilibrium` | 20 ordinary; 4 checkpoints; 5/1/0 repair/bridge/seed; 2 modes ready |

Brief / Standard / Full ordinary coverage: **20 / 20 / 20**.

### Capital Flows and Net Capital Outflow

Transaction classification and net/gross flow calculations form one area; interest rates, risk, and capital-flight transmission form another. Neither area requires a checkbox for every sign convention or calculation variant.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Classify asset transactions and calculate net capital outflow | `calculate_compound_nco`, `calculate_nco`, `calculate_nco_change`, `classify_asset_transaction`, `classify_foreign_direct_investment`, `connect_capital_inflow_investment`, `define_nco`, `diagnose_inflow_outflow_reversal`, `distinguish_gross_net_capital_flows`, `interpret_nco_sign`, `reconcile_saving_and_gross_flows`, `repair_inflow_outflow_sign`, `solve_asset_flows_from_saving`, `solve_gross_asset_flows`, `solve_gross_flow_change` | 15 ordinary; 7 checkpoints; 1/0/0 repair/bridge/seed; 2 modes ready |
| Trace interest rates, risk, and capital flight into investment flows | `analyze_competing_nco_forces`, `analyze_reinforcing_nco_forces`, `bridge_interest_nco_fx_supply`, `calculate_capital_flight_shift`, `connect_interest_rate_asset_demand`, `define_capital_flight`, `evaluate_risk_adjusted_capital_flows`, `explain_interest_rate_nco_slope`, `trace_capital_flight_feedback`, `trace_foreign_rate_to_nco`, `trace_interest_rate_to_nco`, `trace_portfolio_reallocation`, `trace_risk_to_nco` | 11 ordinary; 5 checkpoints; 0/1/0 repair/bridge/seed; 2 modes ready |

Brief / Standard / Full ordinary coverage: **15 / 26 / 26**.

### Consumer Choice

Budget feasibility, preferences, and optimal responses are meaningful curricular areas. The proposed budget-change slice was too thin after secondary-skill filtering, so it is combined with optimal choice instead of offering misleading independent coverage.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Construct budget constraints and identify affordable bundles | `affordable_bundle`, `budget_boundary`, `budget_equation`, `budget_slope`, `budget_vs_demand`, `construct_budget_constraint`, `income_intercept`, `intercept_logic`, `interpret_relative_price`, `new_budget_bundle`, `parallel_budget_lines`, `relative_price`, `unaffordable_bundle` | 29 ordinary; 13 checkpoints; 2/2/0 repair/bridge/seed; 8 modes ready |
| Analyze how changing budgets affect optimal consumer choices | `analyze_budget_change`, `apply_marginal_rate_substitution`, `apply_marginal_utility_per_dollar`, `best_affordable_bundle`, `budget_exhaustion_not_enough`, `equimarginal_rule`, `feasible_set_contraction`, `feasible_set_expansion`, `fixed_intercept`, `highest_attainable_curve`, `identify_consumer_optimum`, `income_change_shift`, `mrs_adjustment`, `mrs_price_ratio`, `mrs_units`, `optimal_bundle_coordinates`, `pivot_vs_shift`, `price_change_pivot`, `price_increase_pivot`, `purchasing_power`, `relative_price_change`, `slope_change`, `tangency_condition` | 42 ordinary; 10 checkpoints; 1/1/0 repair/bridge/seed; 7 modes ready |
| Explain preferences, indifference curves, and ordinal utility | `apply_indifference_curve_properties`, `attainable_indifference_curve`, `convex_preferences`, `distinguish_special_preferences`, `indifference`, `interpret_ordinal_utility`, `noncrossing_curves`, `ordinal_utility`, `preference_and_feasibility`, `preference_ranking`, `rank_preferences`, `unattainable_preference` | 53 ordinary; 1 checkpoints; 3/3/0 repair/bridge/seed; 6 modes ready |

Brief / Standard / Full ordinary coverage: **29 / 124 / 124**.

### Demand

Law/schedule/movement reasoning is distinct from income and related-goods analysis. General shifters and combined market effects stay together: their co-assessed tags made the proposed market-effects slice independently unready. The two existing Demand reviews (GEN-ECON-12/13) support these instructional boundaries.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Explain the law of demand and distinguish movements from shifts | `demand_schedule_interpretation`, `law_of_demand`, `movement_vs_demand_shift`, `movement_vs_shift` | 14 ordinary; 5 checkpoints; 2/2/0 repair/bridge/seed; 2 modes ready |
| Analyze income effects, substitutes, and complements | `complement_demand_shift`, `complement_good_definition`, `demand_shifters_income`, `demand_shifters_related_goods`, `normal_good_income`, `normal_inferior_good_analysis`, `related_goods`, `related_goods_demand`, `related_goods_demand_shift`, `substitute_good_definition`, `substitutes` | 11 ordinary; 2 checkpoints; 0/2/0 repair/bridge/seed; 2 modes ready |
| Analyze demand shifters and combined market effects | `causal_reasoning`, `demand_shift_analysis`, `demand_shift_direction`, `demand_shifters`, `demand_shifters_expectations`, `demand_shifters_tastes`, `equilibrium_comparison`, `equilibrium_effects`, `multiple_demand_shifters`, `price_signal_allocation`, `supply_shift_equilibrium_prediction` | 13 ordinary; 4 checkpoints; 2/2/0 repair/bridge/seed; 2 modes ready |

Brief / Standard / Full ordinary coverage: **14 / 52 / 52**.

### Long-Run Aggregate Supply and Potential Output

Only identify_lras is recorded. One broad checkbox preserves the published area without fabricating skill distinctions. Its nine ordinary questions do not make any existing mode independently ready; faculty must combine it with suitable companion concepts.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Analyze LRAS, natural or potential output, productive capacity, and long-run aggregate-supply shifts. | `identify_lras` | 9 ordinary; 4 checkpoints; 1/1/0 repair/bridge/seed; 0 modes ready |

Brief / Standard / Full ordinary coverage: **9 / 9 / 9**.

### Market Equilibrium

Equilibrium calculation and shortage/surplus adjustment form one working market-clearing outcome. Single-curve comparative statics and simultaneous shifts remain separate usable bodies of questions.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Determine equilibrium and explain shortage and surplus adjustment | `algebraic_equilibrium_price`, `algebraic_equilibrium_quantity`, `curve_pairing`, `equilibrium_calculation`, `equilibrium_definition`, `equilibrium_identification`, `graph_reading`, `quantity_demanded`, `quantity_supplied`, `shortage_identification`, `shortage_market_adjustment`, `shortage_price_pressure`, `surplus_identification`, `surplus_market_adjustment`, `surplus_price_pressure`, `surplus_shortage_adjustment`, `surplus_shortage_calculation`, `surplus_shortage_identification` | 22 ordinary; 7 checkpoints; 1/2/0 repair/bridge/seed; 4 modes ready |
| Predict equilibrium effects of demand or supply changes | `demand_decrease`, `demand_decrease_market_effect`, `demand_increase`, `demand_increase_market_effect`, `demand_shift_equilibrium_prediction`, `demand_shift_equilibrium_price`, `equilibrium_comparison`, `equilibrium_prediction`, `input_costs`, `market_change_prediction`, `market_shift_analysis`, `normal_good`, `supply_decrease`, `supply_decrease_market_effect`, `supply_increase`, `supply_increase_market_effect`, `supply_shift_analysis`, `supply_shift_equilibrium_prediction`, `supply_shift_equilibrium_price` | 18 ordinary; 2 checkpoints; 2/2/0 repair/bridge/seed; 3 modes ready |
| Analyze simultaneous demand and supply changes | `demand_decrease_supply_increase`, `demand_increase_supply_decrease`, `double_shift_ambiguous_price`, `double_shift_ambiguous_quantity`, `expectations_and_supply_shock`, `multi_shift_sequence`, `simultaneous_shift_comparison`, `simultaneous_shift_sequence`, `simultaneous_shifts` | 16 ordinary; 6 checkpoints; 0/0/0 repair/bridge/seed; 3 modes ready |

Brief / Standard / Full ordinary coverage: **22 / 41 / 75**.

### Monetary-Policy Transmission

The existing questions jointly assess the policy chain, numerical transmission, and limitations. Splitting those areas removed required companion skills and left unready fragments. One coherent outcome preserves the bank’s ten-mode usability.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Trace monetary policy through interest rates, investment, aggregate demand, and output. | `ad_shift`, `ad_target`, `aggregate_demand`, `choose_anti_inflation_policy`, `choose_stabilizing_monetary_policy`, `combine_monetary_policy_and_multiplier`, `contractionary_monetary_policy`, `contractionary_monetary_policy_chain`, `contractionary_transmission_sequence`, `crowding_out`, `demand_shock`, `distinguish_ad_shift_from_movement_along_ad`, `distinguish_money_market_and_ad_model`, `distinguish_standard_liquidity_preference_from_liquidity_trap`, `evaluate_transmission_strength`, `expansionary_monetary_policy`, `expansionary_monetary_policy_chain`, `explain_liquidity_trap`, `explain_policy_limit`, `identify_ad_shift`, `identify_contractionary_policy_from_graph`, `identify_definition`, `identify_direct_effect`, `identify_expansionary_monetary_effect`, `identify_graph_panel`, `identify_liquidity_trap_breakpoint`, `inflation_pressure`, `interest_rate`, `interest_rates`, `interest_rates_investment`, `interest_sensitive_spending_channel`, `interpret_monetary_policy_graph`, `investment`, `investment_expectations_transmission`, `investment_sensitivity`, `monetary_policy_ad_shift`, `monetary_policy_transmission`, `money_market`, `money_supply`, `money_supply_interest_rate`, `money_supply_shift`, `money_supply_shift_interest_rate`, `mpc`, `multiplier`, `omitted_transmission_link`, `open_market_operations`, `open_market_purchase_transmission`, `order_policy_chain`, `output`, `overheating`, `predict_ad_shift`, `predict_direction`, `price_level`, `read_ad_shift`, `read_contractionary_graph_and_calculate_net_ad_effect`, `read_contractionary_graph_and_solve_required_rate_change`, `read_contractionary_graph_then_calculate_ad_change`, `read_contractionary_monetary_policy_graph`, `read_graph_and_evaluate_transmission_size`, `read_graph_direction_and_apply_multiplier`, `read_graph_then_apply_multiplier`, `read_money_market_shift`, `read_output_change_from_ad_shift`, `read_policy_direction_and_solve_required_interest_rate_change`, `recession`, `reserve_hoarding_transmission_limit`, `select_policy_response`, `trace_contractionary_monetary_policy_graph`, `trace_contractionary_money_graph_with_multiplier`, `trace_expansionary_monetary_policy_graph`, `trace_monetary_policy_chain`, `transmission_strength`, `zero_lower_bound` | 63 ordinary; 13 checkpoints; 8/3/0 repair/bridge/seed; 10 modes ready |

Brief / Standard / Full ordinary coverage: **63 / 63 / 63**.

### Monopoly

Five assessable areas remain: sources of power; demand/revenue/output choice; policy and discrimination; welfare; and profit/loss/shutdown. Regulatory tradeoffs and discrimination are grouped as policy applications. Each has independent readiness; no individual calculation tag becomes a checkbox.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Explain monopoly power and barriers to entry | `barriers_to_entry`, `legal_barrier`, `market_power`, `monopoly_definition`, `natural_monopoly`, `natural_monopoly_cost`, `network_effects`, `resource_control` | 20 ordinary; 0 checkpoints; 4/0/0 repair/bridge/seed; 3 modes ready |
| Use demand and revenue to choose output and price | `average_revenue_monopoly`, `continuous_monopoly_choice`, `discrete_monopoly_choice`, `economies_of_scale`, `elasticity_and_mr`, `entry`, `integrated_monopoly_analysis`, `marginal_revenue_monopoly`, `monopoly_demand`, `monopoly_price`, `perfect-competition`, `price_effect_output_effect`, `price_elasticity_of_demand`, `profit_maximizing_output`, `total_revenue_monopoly` | 111 ordinary; 31 checkpoints; 12/10/0 repair/bridge/seed; 8 modes ready |
| Evaluate monopoly regulation and price discrimination | `average_cost_regulation`, `first_degree_price_discrimination`, `marginal_cost_regulation`, `monopoly_policy_evaluation`, `price_cap_regulation`, `price_discrimination_conditions`, `price_discrimination_welfare`, `regulatory_tradeoff`, `rent_seeking`, `resale_prevention`, `third_degree_price_discrimination` | 115 ordinary; 13 checkpoints; 12/6/0 repair/bridge/seed; 7 modes ready |
| Compare monopoly and competitive welfare | `allocative_inefficiency`, `competitive_monopoly_comparison`, `consumer_surplus_monopoly`, `monopoly_deadweight_loss` | 52 ordinary; 18 checkpoints; 5/6/0 repair/bridge/seed; 8 modes ready |
| Analyze monopoly profit, loss, and shutdown | `monopoly_loss`, `monopoly_profit`, `monopoly_shutdown`, `persistent_economic_profit` | 54 ordinary; 32 checkpoints; 6/5/0 repair/bridge/seed; 8 modes ready |

Brief / Standard / Full ordinary coverage: **131 / 352 / 352**.

### Quantity Theory of Money

Levels/quantity-equation calculations and the money-value graph are combined because graph interpretation co-assesses equation skills. Growth-rate/inflation reasoning still supports an independent second outcome with ten ordinary questions.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Apply the quantity equation and interpret money-market adjustment | `analyze_contractionary_money_graph`, `analyze_md_shift_and_convert_to_price_level`, `analyze_money_demand_shift`, `apply_quantity_theory`, `calculate_price_level`, `calculate_value_of_money`, `calculate_velocity`, `compare_price_levels`, `connect_graph_result_to_quantity_equation`, `connect_graph_to_quantity_equation`, `connect_graph_to_quantity_theory`, `connect_money_graph_to_quantity_equation`, `connect_price_level_money_value`, `convert_money_value_to_price_level`, `convert_multiple_value_of_money_points_to_price_level`, `convert_value_of_money_to_price_level`, `correct_axis_and_curve_misreading`, `correct_graph_misinterpretation`, `diagnose_money_market_adjustment`, `distinguish_ms_shift_from_md_shift`, `excess_money_supply`, `explain_adjustment_process`, `explain_curve_slope`, `explain_graph_disequilibrium_adjustment`, `identify_core_prediction`, `identify_curve`, `identify_formula`, `identify_formula_component`, `identify_quantity_equation`, `identify_shift_result`, `infer_inverse_relationship`, `interpret_graph_shift`, `inverse_relationship`, `money_demand`, `money_supply`, `money_supply_decrease`, `money_supply_fixed`, `money_supply_increase`, `money_supply_shift`, `nominal_gdp`, `output`, `predict_direction`, `price_adjustment`, `price_level`, `purchasing_power`, `quantity_equation`, `quantity_equation_output_price_tradeoff`, `read_axis`, `read_graph_and_convert_value_to_price`, `read_graph_convert_value_to_price_and_interpret`, `reverse_graph_shift`, `scarcity`, `solve_quantity_equation`, `solve_quantity_equation_for_p`, `solve_velocity_formula`, `spending`, `trace_monetary_injection_graph`, `use_quantity_equation`, `value_of_money`, `value_of_money_formula`, `velocity`, `velocity_definition` | 37 ordinary; 7 checkpoints; 5/3/0 repair/bridge/seed; 6 modes ready |
| Connect money growth, output growth, velocity, and inflation | `advanced_quantity_growth_calculation`, `apply_quantity_equation_growth_form`, `apply_quantity_equation_growth_rates`, `apply_quantity_equation_with_velocity_change`, `basic_quantity_growth_calculation`, `calculate_inflation_from_quantity_equation`, `compare_price_levels_across_years`, `inflation`, `monetary_neutrality`, `money_growth`, `money_growth_inflation_link`, `money_growth_to_inflation`, `nominal_gdp_growth_from_mv`, `output_growth`, `predict_long_run_result`, `price_level_change_vs_inflation`, `quantity_equation_with_velocity_change`, `quantity_theory_growth_rates`, `quantity_theory_long_run_neutrality`, `solve_price_level_across_multiple_changes`, `solve_quantity_equation_across_changes`, `synthesize_long_run_money_logic`, `velocity_growth` | 10 ordinary; 5 checkpoints; 3/2/0 repair/bridge/seed; 2 modes ready |

Brief / Standard / Full ordinary coverage: **37 / 55 / 55**.

### Real versus Nominal GDP

Nominal/real measurement and the deflator are retained as one outcome. The proposed deflator split shares recorded skills with 27 questions in the measurement group. The MACRO-03 review also treats these calculations together.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Distinguish nominal and real GDP and calculate the GDP deflator. | `gdp_deflator`, `gdp_deflator_growth`, `gdp_welfare_scope`, `nominal_vs_real_gdp`, `price_output_decomposition`, `real_gdp_calculation`, `real_growth_rate` | 31 ordinary; 12 checkpoints; 4/2/0 repair/bridge/seed; 9 modes ready |

Brief / Standard / Full ordinary coverage: **31 / 31 / 31**.

### Scarcity and Tradeoffs

Scarcity, choice, and opportunity cost provide the foundation. Efficiency/equity and policy applications form a second meaningful coverage decision; the latter includes existing minimum-wage examples rather than introducing new content.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Explain scarcity, tradeoffs, and opportunity cost | `core_scarcity`, `core_tradeoffs`, `opportunity_cost`, `scarcity`, `scarcity_definition`, `tradeoff_identification` | 36 ordinary; 10 checkpoints; 5/4/2 repair/bridge/seed; 4 modes ready |
| Evaluate efficiency, equity, and policy tradeoffs | `core_policy_tradeoffs`, `efficiency_definition`, `efficiency_equity_policy_tradeoff`, `efficiency_equity_tradeoff`, `efficiency_vs_equality`, `equality_definition`, `equality_vs_efficiency`, `labor_surplus`, `minimum_wage`, `policy_tradeoff_analysis`, `positive_vs_normative` | 23 ordinary; 11 checkpoints; 2/0/1 repair/bridge/seed; 3 modes ready |

Brief / Standard / Full ordinary coverage: **36 / 61 / 61**.

### Supply

Law and movement reasoning can stand alone. Determinants, aggregation, and combined changes are kept together because the proposed market-aggregation and market-effects slices did not independently meet existing mode readiness.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Explain the law of supply and distinguish movements from shifts | `law_of_supply`, `movement_vs_supply_shift`, `supply_shift_and_movement` | 12 ordinary; 3 checkpoints; 2/2/0 repair/bridge/seed; 2 modes ready |
| Analyze supply shifters, aggregation, and combined market effects | `demand_shift_equilibrium_prediction`, `equilibrium_comparison`, `equilibrium_prediction`, `market_supply_aggregation`, `market_supply_multiple_shifters`, `multiple_supply_shifters`, `net_marginal_cost_supply_shift`, `number_of_sellers_calculation`, `short_run_long_run_supply_response`, `subsidy_as_supply_shifter`, `supply_expectations_timing`, `supply_shift_analysis`, `supply_shift_direction`, `supply_shift_equilibrium_prediction`, `supply_shifters`, `supply_shifters_expectations`, `supply_shifters_input_costs`, `supply_shifters_number_of_sellers`, `supply_shifters_technology`, `tax_as_supply_shifter` | 31 ordinary; 8 checkpoints; 2/2/0 repair/bridge/seed; 7 modes ready |

Brief / Standard / Full ordinary coverage: **12 / 49 / 49**.

### Tariffs, Revenue & Deadweight Loss

Price/quantity effects and revenue/surplus/deadweight-loss analysis are distinct usable teaching areas. Welfare components remain together, including production and consumption distortions.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Analyze tariff revenue, surplus, and deadweight loss | `consumer_surplus_trade`, `consumption_distortion`, `producer_surplus_trade`, `production_distortion`, `tariff_revenue`, `tariff_welfare_effect`, `trade_policy_evaluation` | 46 ordinary; 6 checkpoints; 4/4/0 repair/bridge/seed; 2 modes ready |
| Trace tariffs into domestic prices and traded quantities | `import_quantity`, `integrated_trade_analysis`, `tariff_price_effect`, `tariff_quantity_effect` | 16 ordinary; 2 checkpoints; 2/2/0 repair/bridge/seed; 2 modes ready |

Brief / Standard / Full ordinary coverage: **72 / 72 / 72**.

### Unemployment Measurement

Labor-force classification, unemployment rates, and participation measures stay together. Proposed participation/classification fragments failed independent readiness, and multi-measure questions require their combined skills.

| Faculty outcome | Mapped canonical skills | Eligible coverage |
| --- | --- | --- |
| Classify labor-force status and calculate unemployment and participation rates. | `active_search_requirement`, `combined_unemployment_participation_calculation`, `discouraged_worker_rate_effect`, `discouraged_workers`, `employment_classification`, `employment_to_unemployment_flow`, `frictional_unemployment`, `labor_force_calculation`, `labor_force_definition`, `labor_force_participation`, `natural_rate`, `structural_unemployment`, `underemployment_classification`, `unemployment_rate` | 49 ordinary; 20 checkpoints; 5/5/0 repair/bridge/seed; 9 modes ready |

Brief / Standard / Full ordinary coverage: **49 / 49 / 49**.

## Preset Semantics

- **Brief:** select the smallest union of broad outcomes containing the existing essential-skill policy. A meaningful group may include companion skills beyond the former raw-skill Brief slice.
- **Standard:** select the smallest union containing the existing normal policy, excluding extension-only groups where independently defensible. New concept selection defaults to Standard.
- **Full:** select all outcomes and preserve the exact published module. All 13 existing Composer presets explicitly use this state. Missing scopes in older recipes also default to Full.
- **Custom:** preserve the exact manually checked outcome IDs. If the selection exactly matches a preset again, it can display that preset. Where presets coincide, explicit selection retains its chosen name; manual recognition prefers Full, then Standard, then Brief.

Presets are derived checkbox selections. They do not control difficulty and are not a parallel filter. All boxes unchecked produces a validation error and blocks download; deselecting the concept is the explicit exclusion workflow.

## Coverage Safeguards

Every proposed independent group was composed against all ten existing mode requirements. No new universal minimum was introduced. A multi-outcome concept exposes a group only when at least one existing mode accepts that group independently. This does **not** promise every mode works for every checkbox: campaign/checkpoint modes can still need companion concepts.

Forty-four thin proposed groups were merged into reviewed adjacent curricular areas. The complete decisions are explicit in approved-merges.json and the audit’s merges array. Co-assessed question links informed the review; the generator will fail on a newly thin split unless a target is explicitly approved. Examples include Demand market effects into shifters, Supply aggregation/effects into shifters, Consumer Choice budget changes into optimal choice, GDP deflator into measurement, QTM graph interpretation into equation/levels, and AD-AS gaps into equilibrium.

All primary and secondary skills must be inside the selected union. The existing filter runs before bank assembly and prunes checkpoints, repair/bridge/seed routes, and assets. Integrated Macro supplements remain subject to existing prerequisites and are suppressed for narrowed curricular selections. No runtime recovery path silently selects another outcome.

Readiness remains authoritative, explains missing pools, and blocks unsupported generation. Faculty guidance now suggests selecting more outcomes if they fit the course, adding related content, or disabling an unsupported mode. Recommendations require an explicit faculty action.

### Question-pool proof

[Executable proof results](validation_artifacts/faculty_lo_coverage/faculty-lo-results.json) include exact selected outcome IDs, compiled canonical skills, eligible IDs, excluded IDs, and difficulty distributions for all 14 representatives. Tests exhaust every nonempty selection combination across the policy and verify support pruning and unchanged question difficulty.

For example, Demand’s core outcome compiles to demand_schedule_interpretation, law_of_demand, movement_vs_demand_shift, and movement_vs_shift. It yields 14 ordinary questions, five checkpoints, two repair questions, and two bridge questions. Ordinary difficulties remain easy 3, medium 3, hard 2, elite 3, legendary 3. Checking income/related goods adds a different curricular group; unchecking general shifters excludes those questions rather than converting difficulty. Mixed-concept unions may admit additional questions that jointly assess multiple checked groups, which is intentional.

## Backward Compatibility

Schema 1.5.0 depth-only Full, Standard, and Brief map to the corresponding outcome presets; Exclude remains excluded. Retired parent selections propagate to current children, while explicit child scopes take precedence.

Manual skillIds map to outcome IDs only if the selected broad groups reproduce the exact skill union. Otherwise an internal legacySkillIds field retains the exact manual slice with Custom state. It never rounds up to a broader outcome silently. The UI explains the imported legacy selection and requires choosing a preset to adopt the new outcome controls. Empty/unknown IDs are rejected, and cross-concept IDs cannot be selected. Mixed legacy/manual exclusions and JSON round trips are tested.

Full with all tagged skills is not substituted for legacy manual coverage if that would introduce untagged questions. Already generated games need no migration.

## UI

Select concepts, use Brief/Standard/Full, optionally expand **Learning outcomes — N of M selected**, adjust broad checkboxes, then configure normal game settings and check Readiness. Exclude was removed from the redundant faculty preset selector; concept deselection performs that action. Keyboard Space/Tab works, and checkbox changes retain focus.

Cards show one compact eligible-practice count and a Readiness prompt. Detailed published library information stays collapsed. Custom state and readable labels are visible without internal skill IDs. Screenshots were visually inspected at desktop and 390px: labels wrap, groups fit, and no horizontal overflow or duplicate IDs occur. Long Capital Flows labels and one-outcome LRAS were exercised.

[Desktop card](validation_artifacts/faculty_lo_coverage/desktop-demand.png) · [390px Demand](validation_artifacts/faculty_lo_coverage/mobile-demand.png) · [390px long concept](validation_artifacts/faculty_lo_coverage/mobile-long-concept.png).

## Preset Compatibility

All 13 current presets resolve through Full outcome selections and reproduce their previous bank contents. Full keeps canonical modules intact; no intentional preset was reduced. Generated recipe/configuration carries outcome IDs and the policy hash. Concept Review routing is unchanged. Shared General Economics, Micro, Macro, migrated parents, exclusions, and optional integrated checkpoints are covered by regressions.

## Regression Results

| Validation | Result |
| --- | --- |
| Faculty outcome regression | PASS: 193,775 assertions; 536 combinations; 149 concepts; 222 outcomes; 13 presets; ten modes |
| Existing raw-skill scope regression | PASS, preserved to test the underlying engine explicitly |
| Browser integration | PASS at 1440px and 390px; imports, Custom, empty state, keyboard, legacy slice, long labels, generation |
| Generated package | PASS: 103 embedded assets and 508 exact runtime questions verified; all ten modes |
| Policy generation check | PASS, deterministic checked-in output |
| Canonical integrity | PASS: 149 concepts, 9779 questions, 507 source asset hashes |
| Existing suite baseline | 18 PASS / 8 FAIL, 26 runners |
| Existing suite with new runner | 19 PASS / same 8 FAIL, 27 runners |
| Git diff whitespace | PASS |

The eight unchanged baseline failures are:

- run_phase3e_graph_question_sync_validation.mjs
- run_question_quality_auditor_validation.mjs
- run_macro_phase2_taxonomy_validation.mjs
- run_mastery_report_2_validation.js
- run_unlimited_practice_validation.js
- run_trial_by_graph_validation.js
- run_fading_fortune_validation.js
- run_risk_reward_validation.js

They reference historical totals, graph flags/copy, or old source hashes. They were reproduced before implementation. Unrelated fixtures were not rewritten. Only recipe-schema expectations in three existing test files were updated to 1.6.0; the graph-sync runner retains its pre-existing failure. The older scope test explicitly exercises raw-skill policies through the compatibility adapter, while the new test covers faculty preset semantics. [Comparison evidence](validation_artifacts/faculty_lo_coverage/regression-comparison.json) separates these results.

Tests can be rerun with node build/faculty-build-composer/tests/run_faculty_outcome_validation.js and node build/faculty-build-composer/tests/run_active_composer_suite.js. Browser runner: run_content_scope_browser_validation.cjs; set MQ_PLAYWRIGHT_MODULE to the installed Playwright module and MQ_COMPOSER_TEST_OUTPUT_DIR to a writable evidence directory.

## Metadata Limitations

102 records retain one outcome; many are already granular child concepts. This is intentional, not a quota shortfall. The complete per-concept warnings and source mappings are in the audit. All exposed outcomes contain actual assessable questions. Of the non-hidden records, Market Power and Long-run Aggregate Supply/Potential Output still cannot independently support any mode at Full; they remain supporting coverage and the existing readiness gate blocks unsupported standalone generation.

Standard and Full sometimes coincide; no artificial advanced outcome was introduced. Monetary transmission, unemployment measurement, GDP real/nominal calculations, and AD-AS gaps demonstrate why large tag inventories do not necessarily support independent faculty controls.

No untagged questions were found in the current canonical modules. Compatibility logic nevertheless retains untagged legacy questions only for all-outcome Full-equivalent coverage and omits them from narrowed selections. The hidden Market Failures compatibility parent and integrated Macro checkpoint supplement retain existing migration/prerequisite behavior rather than becoming independent outcome selectors.

Some existing tags span concept boundaries (for example supply-shift reasoning in Demand’s market-effect applications, or minimum-wage tags in scarcity policy questions). They are grouped with their existing assessable applications and recorded in the audit for future curation. No metadata or question text was rewritten to force cleaner labels.

## Files Changed

- FINAL_REPORT_faculty_lo_coverage.md
- audit_tools/faculty_lo/approved-merges.json
- audit_tools/faculty_lo/build-policy.cjs
- audit_tools/faculty_lo/outcome-groups.cjs
- build/faculty-build-composer/composer-core.js
- build/faculty-build-composer/composer.css
- build/faculty-build-composer/composer.js
- build/faculty-build-composer/data/faculty-outcomes.js
- build/faculty-build-composer/faculty-outcome-core.js
- build/faculty-build-composer/index.html
- build/faculty-build-composer/tests/run_active_composer_suite.js
- build/faculty-build-composer/tests/run_content_scope_browser_validation.cjs
- build/faculty-build-composer/tests/run_content_scope_validation.js
- build/faculty-build-composer/tests/run_faculty_outcome_validation.js
- build/faculty-build-composer/tests/run_phase3a_official_theme_validation.js
- build/faculty-build-composer/tests/run_phase3b_custom_asset_validation.js
- build/faculty-build-composer/tests/run_phase3e_graph_question_sync_validation.mjs
- validation_artifacts/faculty_lo_coverage/desktop-demand.png
- validation_artifacts/faculty_lo_coverage/faculty-lo-results.json
- validation_artifacts/faculty_lo_coverage/faculty-outcome-audit.json
- validation_artifacts/faculty_lo_coverage/integrity-results.json
- validation_artifacts/faculty_lo_coverage/mobile-demand.png
- validation_artifacts/faculty_lo_coverage/mobile-long-concept.png
- validation_artifacts/faculty_lo_coverage/regression-comparison.json
- validation_artifacts/faculty_lo_coverage/ui-results.json

The policy output is generated; the three files under audit_tools/faculty_lo are its maintained authoring/generation source. Validation artifacts contain reports/screenshots only. Git diff inspection confirms no question bank, telemetry, adaptive runtime, resource sheet, unrelated game, or asset changes. Library SHA-256: 530ce41689bf83126ccde2d7d0fd236ca0c34761042455323ce7d3f99e97bbab.

## Final Verdict

**PASS WITH NOTES.** Faculty can select broad curricular outcomes and generate supported quests without handling skill IDs. The strict existing scope engine remains authoritative. Remaining notes are the eight pre-existing suite failures and documented source-bank granularity/readiness limits.
