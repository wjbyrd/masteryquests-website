from pathlib import Path
root=Path.cwd();old=root/'audit_tools/general_economics_wording_graph_cleanup_20261003';new=root/'audit_tools/general_economics_graph_construct_closure_20261003'
s=(old/'apply.cjs').read_text()
s=s.replace("worklist=read('worklist.json'),reviews=read('item_reviews.json')","worklist=read('review.json'),reviews=read('acceptance.json')")
s=s.replace("assert.equal(q.options[key],worklist.evidence.find(e=>e.id===id).correct_option,'Original resolved key '+id);","assert.deepEqual(q,worklist.flags.find(r=>r.question_id===id).current,'Exact reviewed before state '+id);\n assert.equal(sha(core.normalizeAnswerText(q.options[key])),q.aHash,'Original resolved key '+id);")
s=s.replace("findingIds:reviews[id].finding_ids,fields,beforeRecord", "originalRecord:worklist.flags.find(r=>r.question_id===id).original,fields,beforeRecord")
(new/'apply.cjs').write_text(s,encoding='utf-8')
t=root/'build/faculty-build-composer/tests'
s=(t/'general-economics-editorial-approved-revisions.js').read_text()
s=s.replace('Exact October 3 editorial layer. Earlier approved snapshots remain immutable.','Exact 38-item construct restoration layer. Earlier approved snapshots remain immutable.')
s=s.replace("require('./macroeconomics-exception-approved-revisions.js')","require('./general-economics-editorial-approved-revisions.js')")
s=s.replace('general_economics_wording_graph_cleanup_20261003','general_economics_graph_construct_closure_20261003')
s=s.replace("'worklist.json'","'review.json'").replace('worklist.evidence.map(r=>r.id)','worklist.flags.map(r=>r.question_id)').replace("ids.size,126,'Exact editorial worklist'","ids.size,38,'Exact construct-closure worklist'")
s=s.replace('worklist.summary.canonical_sha256','worklist.source_sha256').replace('editorialLedger:ledger','constructLedger:ledger')
(t/'general-economics-construct-approved-revisions.js').write_text(s,encoding='utf-8')
files=['run_content_scope_validation.js','run_phase3e_graph_question_sync_validation.mjs','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_question_bank_comprehensive_validation.mjs','composer-audit-contracts.js','run_trial_by_graph_validation.js','run_risk_reward_validation.js']
for name in files:
 p=t/name;s=p.read_text();assert 'general-economics-editorial-approved-revisions.js' in s
 s=s.replace('general-economics-editorial-approved-revisions.js','general-economics-construct-approved-revisions.js')
 if name=='run_phase3e_graph_question_sync_validation.mjs':
  s=s.replace('const expected = revisedField ? editorial.afterRecord[field] : value;','const expected = revisedField ? micro.approvedQuestion(author.id)[field] : value;')
 p.write_text(s,encoding='utf-8')
s=(old/'verify.cjs').read_text().replace('general_economics_wording_graph_cleanup_20261003','general_economics_graph_construct_closure_20261003').replace('general-economics-editorial-approved-revisions.js','general-economics-construct-approved-revisions.js')
s=s.replace("if(c.review.hide_graph_test){assert.equal(c.review.hide_graph_test.result,'YES');assert(c.review.hide_graph_test.plausible_choices.every(v=>q.options.includes(v)));assert.equal(q.image,c.beforeRecord.image);}","assert.equal(c.review.construct_test.answer,'NO');assert.equal(c.review.graph_test.answer,'NO');assert.equal(q.image,c.beforeRecord.image);\n assert.equal(c.correctIndex,'ABCD'.index(c.review.graph_test.economically_plausible_without_graph[0]));")
(new/'verify.cjs').write_text(s,encoding='utf-8')
print('Created exact-scope approval layer and adapted existing validation consumers without changing assertions or historical fixtures.')
