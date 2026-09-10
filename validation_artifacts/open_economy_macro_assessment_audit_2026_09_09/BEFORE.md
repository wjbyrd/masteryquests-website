# Open-Economy Macro & Exchange Rates — BEFORE

Captured from the current Composer quick start before authoring changes.

```json
{
  "preset": {
    "id": "open-economy-macro",
    "title": "Open-Economy Macro & Exchange Rates",
    "selectedConceptIds": [
      "international-transactions-and-identities",
      "nominal-exchange-rates",
      "real-exchange-rates-and-purchasing-power",
      "capital-flows-and-net-capital-outflow",
      "foreign-exchange-market",
      "open-economy-policy-transmission"
    ]
  },
  "unique": 240,
  "byConcept": {
    "international-transactions-and-identities": {
      "unique": 40,
      "objectives": {
        "TX.calculate_net_exports": 3,
        "TX.classify_trade_balance": 1,
        "TX.classify_international_transaction": 1,
        "TX.apply_nx_nco_identity": 3,
        "TX.interpret_nco_sign": 2,
        "TX.explain_import_adjustment": 2,
        "TX.calculate_nco_from_saving_investment": 1,
        "TX.calculate_nco_transactions": 1,
        "TX.connect_saving_investment_trade_balance": 1,
        "TX.solve_open_economy_identity": 2,
        "TX.solve_saving_nco_chain": 2,
        "TX.diagnose_import_misconception": 1,
        "TX.calculate_trade_change": 1,
        "TX.solve_saving_from_trade_balance": 1,
        "TX.trace_asset_purchase_identity": 1,
        "TX.reason_about_indeterminate_balances": 1,
        "TX.reconcile_open_economy_accounts": 2,
        "TX.synthesize_gdp_import_accounting": 3,
        "TX.compare_external_balances": 1,
        "TX.reconcile_asset_and_trade_flows": 1,
        "TX.evaluate_trade_balance_claim": 1,
        "TX.trace_saving_investment_external_balance": 1,
        "TX.audit_open_economy_data": 2,
        "TX.apply_saving_identity": 1,
        "TX.classify_imported_investment": 1,
        "TX.solve_full_external_accounts": 1,
        "TX.repair_nx_sign": 1,
        "TX.bridge_nco_to_fx_supply": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 10,
        "elite": 2,
        "legendary": 9
      },
      "types": {
        "definition": 6,
        "application": 8,
        "calculation": 20,
        "diagnosis": 5,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 0,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    },
    "nominal-exchange-rates": {
      "unique": 40,
      "objectives": {
        "NER.interpret_exchange_rate_quote": 1,
        "NER.classify_appreciation_depreciation": 3,
        "NER.connect_currency_value_purchasing_power": 1,
        "NER.calculate_reciprocal_rate": 3,
        "NER.interpret_stronger_currency": 1,
        "NER.apply_appreciation_to_buyers": 3,
        "NER.convert_currency": 2,
        "NER.convert_foreign_price": 1,
        "NER.calculate_currency_percentage_change": 4,
        "NER.compare_reciprocal_percentage_changes": 3,
        "NER.trace_export_price_conversion": 1,
        "NER.diagnose_quote_direction": 2,
        "NER.convert_export_revenue": 1,
        "NER.connect_depreciation_to_foreign_price": 1,
        "NER.compare_bilateral_currency_changes": 1,
        "NER.calculate_appreciation_purchasing_power": 1,
        "NER.combine_asset_and_currency_returns": 2,
        "NER.combine_price_and_exchange_changes": 2,
        "NER.evaluate_price_exchange_interaction": 1,
        "NER.compare_conversion_costs": 1,
        "NER.apply_exchange_rate_to_asset_value": 1,
        "NER.infer_currency_change_from_prices": 1,
        "NER.compound_currency_changes": 1,
        "NER.repair_quote_direction": 1,
        "NER.bridge_nominal_to_real_rate": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 10,
        "elite": 2,
        "legendary": 9
      },
      "types": {
        "definition": 4,
        "application": 9,
        "calculation": 22,
        "diagnosis": 3,
        "analysis": 1,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 0,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    },
    "real-exchange-rates-and-purchasing-power": {
      "unique": 40,
      "objectives": {
        "RER.define_real_exchange_rate": 1,
        "RER.apply_real_exchange_rate_formula": 2,
        "RER.classify_real_appreciation": 2,
        "RER.explain_ppp": 1,
        "RER.trace_price_level_to_real_rate": 1,
        "RER.identify_ppp_limitation": 4,
        "RER.calculate_real_exchange_rate": 4,
        "RER.approximate_real_rate_change": 5,
        "RER.apply_relative_ppp": 3,
        "RER.separate_nominal_real_changes": 1,
        "RER.test_absolute_ppp": 1,
        "RER.calculate_real_rate_change": 1,
        "RER.diagnose_nominal_real_confusion": 1,
        "RER.compare_traded_nontraded_goods": 1,
        "RER.infer_nominal_change_from_real_stability": 1,
        "RER.evaluate_ppp_evidence": 1,
        "RER.calculate_compound_real_rate_change": 2,
        "RER.calculate_real_rate_from_inflation": 1,
        "RER.compare_price_indexes_ppp": 1,
        "RER.reason_about_offsetting_real_rate_forces": 1,
        "RER.evaluate_relative_ppp_prediction": 1,
        "RER.interpret_real_rate_goods_prices": 1,
        "RER.reason_about_reinforcing_real_rate_forces": 1,
        "RER.repair_real_rate_formula": 1,
        "RER.bridge_real_rate_to_net_exports": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 10,
        "elite": 2,
        "legendary": 9
      },
      "types": {
        "definition": 6,
        "application": 16,
        "calculation": 15,
        "diagnosis": 2,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 0,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    },
    "capital-flows-and-net-capital-outflow": {
      "unique": 40,
      "objectives": {
        "NCO.define_nco": 1,
        "NCO.classify_asset_transaction": 2,
        "NCO.interpret_nco_sign": 1,
        "NCO.connect_interest_rate_asset_demand": 1,
        "NCO.define_capital_flight": 1,
        "NCO.calculate_nco": 4,
        "NCO.trace_interest_rate_to_nco": 2,
        "NCO.trace_foreign_rate_to_nco": 1,
        "NCO.classify_foreign_direct_investment": 2,
        "NCO.trace_risk_to_nco": 1,
        "NCO.calculate_nco_change": 1,
        "NCO.analyze_competing_nco_forces": 2,
        "NCO.diagnose_inflow_outflow_reversal": 1,
        "NCO.solve_asset_flows_from_saving": 1,
        "NCO.trace_portfolio_reallocation": 3,
        "NCO.explain_interest_rate_nco_slope": 1,
        "NCO.evaluate_risk_adjusted_capital_flows": 1,
        "NCO.distinguish_gross_net_capital_flows": 3,
        "NCO.calculate_compound_nco": 2,
        "NCO.solve_gross_flow_change": 1,
        "NCO.trace_capital_flight_feedback": 1,
        "NCO.connect_capital_inflow_investment": 1,
        "NCO.solve_gross_asset_flows": 1,
        "NCO.analyze_reinforcing_nco_forces": 1,
        "NCO.calculate_capital_flight_shift": 1,
        "NCO.reconcile_saving_and_gross_flows": 1,
        "NCO.repair_inflow_outflow_sign": 1,
        "NCO.bridge_interest_nco_fx_supply": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 10,
        "elite": 2,
        "legendary": 9
      },
      "types": {
        "definition": 4,
        "application": 22,
        "calculation": 11,
        "diagnosis": 2,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 0,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    },
    "foreign-exchange-market": {
      "unique": 40,
      "objectives": {
        "FX.identify_fx_demand": 1,
        "FX.identify_fx_supply": 1,
        "FX.read_fx_equilibrium": 2,
        "FX.interpret_fx_axis": 2,
        "FX.predict_fx_demand_shift": 1,
        "FX.read_fx_demand_shift": 2,
        "FX.calculate_fx_quantity_change": 2,
        "FX.read_fx_supply_shift": 1,
        "FX.map_trade_shock_to_fx_demand": 2,
        "FX.map_nco_to_fx_supply": 3,
        "FX.identify_fx_equilibrium": 2,
        "FX.calculate_fx_rate_change": 2,
        "FX.infer_fx_demand_shifter": 1,
        "FX.infer_fx_supply_shifter": 1,
        "FX.analyze_simultaneous_fx_shifts": 2,
        "FX.analyze_reinforcing_fx_shifts": 2,
        "FX.interpret_offsetting_fx_shifts": 1,
        "FX.integrate_trade_and_nco_shifts": 1,
        "FX.trace_fx_feedback_to_nx": 1,
        "FX.trace_interest_nco_fx_nx_chain": 1,
        "FX.diagnose_vertical_supply_misconception": 1,
        "FX.calculate_simultaneous_fx_change": 1,
        "FX.read_simultaneous_fx_outcome": 1,
        "FX.explain_fx_indeterminacy": 1,
        "FX.infer_simultaneous_fx_shifters": 1,
        "FX.analyze_magnitude_bounded_fx_shifts": 1,
        "FX.reason_about_shift_order": 1,
        "FX.repair_movement_shift_confusion": 1,
        "FX.bridge_fx_nx_ad": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 10,
        "elite": 2,
        "legendary": 9
      },
      "types": {
        "definition": 4,
        "graph": 14,
        "application": 13,
        "calculation": 6,
        "diagnosis": 2,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 8,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    },
    "open-economy-policy-transmission": {
      "unique": 40,
      "objectives": {
        "POL.start_budget_deficit_chain": 2,
        "POL.trace_saving_to_interest_rate": 1,
        "POL.trace_interest_rate_to_nco": 1,
        "POL.trace_nco_to_fx_supply": 1,
        "POL.trace_exchange_rate_to_nx": 1,
        "POL.start_capital_flight_chain": 2,
        "POL.trace_budget_deficit_chain": 2,
        "POL.trace_deficit_to_fx_supply": 2,
        "POL.trace_deficit_to_exchange_rate": 1,
        "POL.connect_exchange_rate_to_ad": 1,
        "POL.analyze_trade_policy_offset": 3,
        "POL.trace_capital_flight_to_fx": 1,
        "POL.connect_capital_flight_loanable_funds": 1,
        "POL.trace_capital_flight_two_markets": 2,
        "POL.trace_monetary_open_economy_channel": 1,
        "POL.analyze_competing_policy_channels": 3,
        "POL.integrate_trade_fiscal_policy": 1,
        "POL.qualify_budget_deficit_chain": 1,
        "POL.calculate_capital_flight_feedback": 1,
        "POL.calculate_trade_policy_offset": 1,
        "POL.integrate_identity_and_fx_shifts": 2,
        "POL.trace_capital_flight_feedback": 1,
        "POL.trace_nco_to_exchange_rate": 1,
        "POL.trace_foreign_demand_shock": 1,
        "POL.test_budget_chain_assumption": 1,
        "POL.integrate_monetary_foreign_demand": 1,
        "POL.calculate_budget_external_effect": 1,
        "POL.integrate_trade_policy_capital_flight": 1,
        "POL.repair_deficit_nco_direction": 1,
        "POL.bridge_budget_fx_nx_ad": 1
      },
      "difficulty": {
        "easy": 9,
        "medium": 10,
        "hard": 9,
        "elite": 2,
        "legendary": 10
      },
      "types": {
        "definition": 2,
        "application": 29,
        "graph": 2,
        "multi-step": 1,
        "analysis": 1,
        "calculation": 3,
        "diagnosis": 1,
        "bridge": 1
      },
      "poolCounts": {
        "easy": 6,
        "medium": 6,
        "hard": 6,
        "elite": 2,
        "legendary": 6,
        "boss": 9,
        "legendaryBoss": 3,
        "repairQuestions": 1,
        "bridgeQuestions": 1
      },
      "assets": 2,
      "keys": [
        "schemaVersion",
        "canonicalConceptId",
        "title",
        "description",
        "sourceChapters",
        "legacyObjectives",
        "objectiveLabels",
        "questions",
        "repairQuestions",
        "repairSeedQuestions",
        "bridgeQuestions",
        "directSkillRepairRoutes",
        "microSkillRepairPools",
        "skillRepairSeedPools",
        "microSkillBridgePools",
        "assets",
        "assetMetadata",
        "assetPaths",
        "standaloneRecommendation",
        "taxonomyPhase",
        "familyConceptId"
      ]
    }
  },
  "difficulty": {
    "easy": 54,
    "medium": 60,
    "hard": 59,
    "elite": 12,
    "legendary": 55
  },
  "types": {
    "definition": 26,
    "application": 97,
    "calculation": 77,
    "diagnosis": 15,
    "bridge": 6,
    "analysis": 2,
    "graph": 16,
    "multi-step": 1
  },
  "graphLinked": 22,
  "composedCounts": {
    "easy": 36,
    "medium": 36,
    "hard": 36,
    "elite": 12,
    "legendary": 36,
    "easyBoss": 18,
    "mediumBoss": 18,
    "finalBoss": 18,
    "legendaryBoss": 18,
    "repair": 6,
    "repairSeed": 0,
    "bridge": 6,
    "calculation": 0,
    "integration": 0,
    "challengeOpening": 0,
    "challengeMiddle": 0,
    "challengeFinal": 0,
    "challengeLegendary": 0,
    "challengeTotal": 0,
    "graph": 22,
    "graphSafe": 15,
    "graphSafeByDifficulty": {
      "easy": 2,
      "medium": 5,
      "hard": 4,
      "elite": 1,
      "legendary": 3
    },
    "fadingFortuneEligible": 156,
    "fadingFortuneByDifficulty": {
      "easy": 36,
      "medium": 36,
      "hard": 36,
      "elite": 12,
      "legendary": 36
    },
    "riskRewardEligible": 156,
    "riskRewardByDifficulty": {
      "easy": 36,
      "medium": 36,
      "hard": 36,
      "elite": 12,
      "legendary": 36
    },
    "assets": 10,
    "totalCanonical": 240
  },
  "modes": {
    "modes": [
      {
        "mode": "standard",
        "label": "Standard Campaign",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "easyBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "mediumBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "finalBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "repair",
            "minimum": 1,
            "count": 6
          },
          {
            "pool": "bridge",
            "minimum": 1,
            "count": 6
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "timed",
        "label": "Timed Trial",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "repair",
            "minimum": 1,
            "count": 6
          },
          {
            "pool": "bridge",
            "minimum": 1,
            "count": 6
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "exam",
        "label": "Exam Drill",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "repair",
            "minimum": 1,
            "count": 6
          },
          {
            "pool": "bridge",
            "minimum": 1,
            "count": 6
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "quiz",
        "label": "Quiz",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 5,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 5,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 5,
            "count": 36
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "unlimited",
        "label": "Unlimited Practice",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "repair",
            "minimum": 1,
            "count": 6
          },
          {
            "pool": "bridge",
            "minimum": 1,
            "count": 6
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "legendary",
        "label": "Legendary Mode",
        "requirements": [
          {
            "pool": "legendary",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "legendaryBoss",
            "minimum": 3,
            "count": 18
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "score",
        "label": "Score Attack",
        "requirements": [
          {
            "pool": "easy",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "medium",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "hard",
            "minimum": 6,
            "count": 36
          },
          {
            "pool": "easyBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "mediumBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "finalBoss",
            "minimum": 3,
            "count": 18
          },
          {
            "pool": "repair",
            "minimum": 1,
            "count": 6
          },
          {
            "pool": "bridge",
            "minimum": 1,
            "count": 6
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "trialGraph",
        "label": "Trial by Graph",
        "requirements": [
          {
            "pool": "graphSafe",
            "minimum": 10,
            "count": 15
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "fadingFortune",
        "label": "Fading Fortune",
        "requirements": [
          {
            "pool": "fadingFortuneEligible",
            "minimum": 10,
            "count": 156
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      },
      {
        "mode": "riskReward",
        "label": "Risk & Reward",
        "requirements": [
          {
            "pool": "riskRewardEligible",
            "minimum": 10,
            "count": 156
          }
        ],
        "deficiencies": [],
        "issues": [],
        "ok": true
      }
    ]
  },
  "errors": []
}
```

The exact record objects, ordered pools, metadata, approved asset registrations, composition routes, mode eligibility and Concept Review routing are in inventory-before.json. The complete source library is preserved privately in the working baseline.

The selected current concepts, source records and derived views define scope. The current preset defines the boundary. The ECO 2251 Final Exam is used only for cognitive calibration; current selected concepts define scope.
