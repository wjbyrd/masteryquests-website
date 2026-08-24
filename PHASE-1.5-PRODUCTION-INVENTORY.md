# Phase 1.5 Production Engine Inventory

Generated: 2026-08-24T20:13:31.871Z

## Current Templates

- `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html` - canonical Composer template.
- `downloads/resources/mastery-quests-faculty-template.html` - current downloadable/manual template.

## Playable Games

| Game | Family | Classification | Question Bank | Standard Save | Media Renderer | Mastery Report | Unlimited | Targeted Repair |
|---|---|---|---|---|---|---|---|---|
| The Market Gate | Economic Realm | A - current/upgraded engine | play/economic-realm/market-gate/market_gate_questions_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The National Ledger | Economic Realm | A - current/upgraded engine | play/economic-realm/national-ledger/national_ledger_questions_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Equilibrium Crisis | Economic Realm | A - current/upgraded engine | play/economic-realm/equilibrium-crisis/equilibrium_crisis_questions_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Liquidity Grid | Economic Realm | A - current/upgraded engine | play/economic-realm/liquidity-grid/liquidity_grid_questions_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Stabilization Protocol | Economic Realm | A - current/upgraded engine | play/economic-realm/stabilization-protocol/stabilization_protocol_questions_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The National Engine | Macro Command System | A - current/upgraded engine | play/macro-command-system/national-engine/index.html#inline-questionBanks | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| Mint, Ash & Gold | Macro Command System | A - current/upgraded engine | play/macro-command-system/mint-ash-gold/mint_ash_gold_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Command Nexus | Macro Command System | A - current/upgraded engine | play/macro-command-system/command-nexus/command_nexus_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Exchange Citadel | Macro Command System | A - current/upgraded engine | play/macro-command-system/exchange-citadel/exchange_citadel_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Cost Directive | Managerial Intelligence Directorate | A - current/upgraded engine | play/managerial-intelligence-directorate/cost-directive/cost_directive_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Market Signal | Managerial Intelligence Directorate | A - current/upgraded engine | play/managerial-intelligence-directorate/market-signal/market_signal_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Strategy Desk | Managerial Intelligence Directorate | A - current/upgraded engine | play/managerial-intelligence-directorate/strategy-desk/strategy_desk_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Agency Protocol | Managerial Intelligence Directorate | A - current/upgraded engine | play/managerial-intelligence-directorate/agency-protocol/agency_protocol_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |
| The Labyrinth of Choice | Micro Domains | A - current/upgraded engine | play/micro-domains/labyrinth-of-choice/labyrinth_of_choice_question_bank_student.js | Phase 1.5 Standard-only save schema | Shared renderQuestionMedia | Current Mastery Report | Yes | Yes |

## Intentionally Excluded Micro Games

- The Strategic Vault - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.
- The Foundry - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.
- Dominion of Power - INTENTIONALLY DEFERRED UNTIL ENGINE UPGRADE.

Only inactive hub placeholders for those titles are present under `play/micro-domains/index.html`; no playable production directories exist for them.

## Hubs / Menus

- `play/economic-realm/index.html` - active Realm hub; included only for the generic restored-card re-entry layout fix.
- `play/macro-command-system/index.html` - hub/menu only; excluded.
- `play/managerial-intelligence-directorate/index.html` - hub/menu only; excluded.
- `play/micro-domains/index.html` - hub/menu only; excluded from engine changes.
- `games/*/index.html` - public catalog/menu pages; excluded.

## Archives / Snapshots / Backups

- `legacy/**`, `validation_artifacts/**`, `previews/**`, dated/fixed root copies under `play/economic-realm/*_index_fixed.html`, and `play/macro-command-system/national-engine/nationalengine.html` are excluded.
- Historical `run_phase5*`, `run_phase6*`, `run_phaseGraph*`, and `run_phaseMicro*` validators remain historical evidence and are not part of this change.
