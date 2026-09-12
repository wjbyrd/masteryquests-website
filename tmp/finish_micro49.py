import sys
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from install_validated import prepare
from pypdf import PdfReader
from tag_pilot import normalized
root_guard()
run='validation_artifacts/pdf_accessibility/micro49_nash_fix_v1'
rows=read_json(run+'/final_validation.json');row=next(r for r in rows if r['code']=='MICRO-49')
gate=read_json(run+'/staged_gate.json');assert gate['passed']==151 and gate['blocked']==0
plan=read_json('validation_artifacts/pdf_accessibility/blocked_25_v1/installation_preview.json')
fresh=prepare([row],run+'/review_receipt.json')['records'][0]
plan['records']=[fresh if r['code']=='MICRO-49' else r for r in plan['records']]
assert len(plan['records'])==151
assert sum(len(r['targets']) for r in plan['records'])==302
assert [r['code'] for r in plan['records'] if r['expected'][0] is None]==['MICRO-'+str(i) for i in range(54,69)]
write_json(run+'/installation_preview.json',plan)
pack='validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1'
contained(pack+'/pdfs/MICRO-49.pdf').write_bytes(contained(row['output']).read_bytes())
for name in ('manifest.json','results_template.json'):
    value=read_json(pack+'/'+name)
    entry=next(r for r in value['records'] if r['code']=='MICRO-49');entry['sha256']=row['sha256']
    if name=='results_template.json':
        entry.update(result='PENDING',procedure='Navigate payoff table with row/column headers; read worked heading, table, then both pure-strategy equilibrium comparisons.',observations='')
    write_json(pack+'/'+name,value)
readme=contained(pack+'/README.md');text=readme.read_text(encoding='utf-8')
text+='\nMICRO-49 updated by MICRO49_PURE_STRATEGY_NASH_FIX_V1. After table navigation, confirm the worked heading says FINDING PURE-STRATEGY NASH EQUILIBRIA and the explanation identifies both (A, X) and (B, Y), with 9 versus 3 and 7 versus 2 comparisons for each player. Human AT remains PENDING. The current complete staged gate and installation preview are in `../../micro49_nash_fix_v1/`; no installation was executed.\n'
readme.write_text(text,encoding='utf-8')
assert sha(pack+'/pdfs/MICRO-49.pdf')==row['sha256']
final=normalized(PdfReader(contained(pack+'/pdfs/MICRO-49.pdf')).pages[0].extract_text())
assert 'FINDING PURE-STRATEGY NASH EQUILIBRIA' in final and '(A, X)' in final and '(B, Y)' in final
summary={'task':'MICRO49_PURE_STRATEGY_NASH_FIX_V1','accepted':gate['passed'],'total':151,
 'pdfUaMachine':sum(r['independentPass'] for r in rows),'semanticProject':sum(not r['projectErrors'] for r in rows),
 'preservation':sum(r['geometryEqual'] and r['pageCounts']==[1,1] and (r['textWhitespaceOnlyEqual'] or r.get('ownerApprovedWordingOnly',False)) for r in rows),
 'determinism':sum(r['deterministic'] for r in rows),'contrastVisual':sum(read_json(run+'/review_receipt.json')['records'][r['code']]['contrast'] and read_json(run+'/review_receipt.json')['records'][r['code']]['rendering'] for r in rows),
 'previewLogicalResources':151,'previewDestinationCopies':302,'missingPublicCopiesPlanned':15,'installationExecuted':False,'deployment':False,'humanAT':'PENDING'}
assert all(summary[k]==151 for k in ('pdfUaMachine','semanticProject','preservation','determinism','contrastVisual'))
write_json(run+'/collection_summary.json',summary)
print(summary)
