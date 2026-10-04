from pathlib import Path
H=Path(__file__).parent;ROOT=H.parent.parent
old='macroeconomics_wording_graph_cleanup_20261004';new=H.name
source=(ROOT/'audit_tools'/old/'apply.cjs').read_text(encoding='utf-8').replace(old,new)
source=source.replace("['q','options','feedback','aHash','image','imageAlt','graphDescription','graphImageMetadata','graphRequired']","['q','options','feedback','aHash']")
source=source.replace("const q=structuredClone(before.get(id)),patch=patches[id],key=patch.correct_index;","const q=structuredClone(before.get(id)),patch=patches[id],key=patch.correct_index;assert(!patch.remove_graph);")
(H/'apply.cjs').write_text(source,encoding='utf-8')
tests=ROOT/'build/faculty-build-composer/tests'
helper=(tests/'macroeconomics-editorial-approved-revisions.js').read_text(encoding='utf-8')
helper=helper.replace("require('./microeconomics-deletions-approved-revisions.js')","require('./macroeconomics-editorial-approved-revisions.js')").replace(old,new).replace('ids.size,341','ids.size,128')
helper=helper.replace("['q','options','feedback','aHash','image','imageAlt','graphDescription','graphRequired','graphImageMetadata']","['q','options','feedback','aHash']")
helper=helper.replace('macroEditorialLedger:ledger','macroStudentWordingLedger:ledger')
helper=helper.replace('// Bounded Macro editorial approval. Reconstruct the exact pre-cleanup library','// Bounded 128-ID student wording approval. Reconstruct the exact pre-cleanup library')
(tests/'macroeconomics-student-wording-approved-revisions.js').write_text(helper,encoding='utf-8')
names=['composer-audit-contracts.js','run_macro_phase2_taxonomy_validation.mjs','run_fading_fortune_validation.js','run_content_scope_validation.js','run_phase3e_graph_question_sync_validation.mjs','run_risk_reward_validation.js','run_question_bank_comprehensive_validation.mjs','run_trial_by_graph_validation.js']
for name in names:
 p=tests/name;s=p.read_text(encoding='utf-8');s=s.replace('macroeconomics-editorial-approved-revisions.js','macroeconomics-student-wording-approved-revisions.js');p.write_text(s,encoding='utf-8')
print('Prepared bounded approval chain; all earlier approvals remain checked')
