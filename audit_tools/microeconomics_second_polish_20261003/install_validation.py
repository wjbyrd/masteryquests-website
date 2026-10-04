"""Add a strict second approval layer; preserve all earlier snapshots."""
from pathlib import Path
import json
H=Path(__file__).resolve().parent;ROOT=H.parents[1];OLD=H.parent/'microeconomics_wording_graph_cleanup_20261003';TEST=ROOT/'build/faculty-build-composer/tests';WORK=ROOT/'tmp'/H.name
(H/'apply.cjs').write_text((OLD/'apply.cjs').read_text(encoding='utf8'),encoding='utf8')
s=(TEST/'microeconomics-editorial-approved-revisions.js').read_text(encoding='utf8')
s=s.replace('Exact 672-item Micro wording and graph repair layer.','Exact bounded Micro second-pass approval layer.').replace("require('./general-economics-construct-approved-revisions.js')","require('./microeconomics-editorial-approved-revisions.js')").replace('audit_tools/microeconomics_wording_graph_cleanup_20261003','audit_tools/microeconomics_second_polish_20261003')
s=s.replace("const worklist=JSON.parse(fs.readFileSync(path.join(dir,'worklist.json'),'utf8'));\nconst ids=new Set(Object.keys(worklist.records));\nassert.equal(ids.size,672,'Exact Micro cleanup worklist');", "const worklist=JSON.parse(fs.readFileSync(path.join(dir,'scope.json'),'utf8'));\nconst ids=new Set(ledger.authorizedIds);\nassert.equal(ids.size,94,'Exact second-pass changes');\nfor(const id of ids)assert(worklist.unique_union.includes(id),'Frozen A/B/C union '+id);")
s=s.replace("assert.equal(ledger.baselineSourceSha256,worklist.preservation_checks.source_sha256_after,'Audit and implementation baseline agree');","assert.equal(ledger.baselineSourceSha256,worklist.baseline.source_sha256,'Frozen second-pass baseline');")
s=s.replace('microEditorialLedger:ledger','microSecondPolishLedger:ledger')
(TEST/'microeconomics-second-polish-approved-revisions.js').write_text(s,encoding='utf8')
names=['composer-audit-contracts.js','run_content_scope_validation.js','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_phase3e_graph_question_sync_validation.mjs','run_question_bank_comprehensive_validation.mjs','run_risk_reward_validation.js','run_trial_by_graph_validation.js']
for name in names:
 p=TEST/name;t=p.read_text(encoding='utf8').replace("require('./microeconomics-editorial-approved-revisions.js')","require('./microeconomics-second-polish-approved-revisions.js')")
 if name=='run_phase3e_graph_question_sync_validation.mjs':t=t.replace('micro.constructLedger, micro.microEditorialLedger]','micro.constructLedger, micro.microEditorialLedger, micro.microSecondPolishLedger]')
 p.write_text(t,encoding='utf8')
s=(OLD/'verify.cjs').read_text(encoding='utf8').replace('microeconomics_wording_graph_cleanup_20261003','microeconomics_second_polish_20261003').replace('microeconomics-editorial-approved-revisions.js','microeconomics-second-polish-approved-revisions.js').replace("['40032','PG1-SUP-L-001']","[]")
(H/'verify.cjs').write_text(s,encoding='utf8')
(WORK/'isolate_outputs.cjs').write_text((ROOT/'tmp/microeconomics_wording_graph_cleanup_20261003/isolate_outputs.cjs').read_text(encoding='utf8'),encoding='utf8')
s=(OLD/'pdf_qa.py').read_text(encoding='utf8').replace('microeconomics_wording_graph_cleanup_20261003','microeconomics_second_polish_20261003').replace("targets=read(HERE/'acceptance.json');", "targets={i:r for i,r in read(HERE/'acceptance.json').items() if 'graph_test' in r};")
(H/'pdf_qa.py').write_text(s,encoding='utf8')
s=(ROOT/'tmp/microeconomics_wording_graph_cleanup_20261003/quality_compare.mjs').read_text(encoding='utf8').replace('microeconomics_wording_graph_cleanup_20261003','microeconomics_second_polish_20261003').replace("JSON.parse(fs.readFileSync('audit_tools/microeconomics_second_polish_20261003/baseline.json')).target_ids","Object.keys(JSON.parse(fs.readFileSync('audit_tools/microeconomics_second_polish_20261003/originals.json'))).filter(i=>{const s=JSON.parse(fs.readFileSync('audit_tools/microeconomics_second_polish_20261003/scope.json'));return i in s.set_A||s.graph_review_population.includes(i);})")
(WORK/'quality_compare.mjs').write_text(s,encoding='utf8')
