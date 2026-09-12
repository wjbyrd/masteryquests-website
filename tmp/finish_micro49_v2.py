import sys
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from install_validated import prepare
from pypdf import PdfReader
from tag_pilot import normalized
root_guard();run='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'
rows=read_json(run+'/final_validation.json');row=next(r for r in rows if r['code']=='MICRO-49')
gate=read_json(run+'/staged_gate.json');assert gate['passed']==151 and gate['blocked']==0
plan=read_json('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/installation_preview.json')
fresh=prepare([row],run+'/review_receipt.json')['records'][0]
plan['records']=[fresh if r['code']=='MICRO-49' else r for r in plan['records']]
assert len(plan['records'])==151 and sum(len(r['targets']) for r in plan['records'])==302
assert [r['code'] for r in plan['records'] if r['expected'][0] is None]==['MICRO-'+str(i) for i in range(54,69)]
write_json(run+'/installation_preview.json',plan)
pack='validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1'
contained(pack+'/pdfs/MICRO-49.pdf').write_bytes(contained(row['output']).read_bytes())
for name in ('manifest.json','results_template.json'):
    value=read_json(pack+'/'+name);entry=next(r for r in value['records'] if r['code']=='MICRO-49');entry['sha256']=row['sha256']
    if name=='results_template.json':entry.update(result='PENDING',procedure='Read payoff table (9,9), (2,3), (3,2), (1,1) with row/column headers; then verify best responses, dominant A/X strategies and unique equilibrium (A, X).',observations='')
    else:entry['pattern']='Semantic payoff matrix, best responses, dominant strategies and unique Nash equilibrium'
    write_json(pack+'/'+name,value)
p=contained(pack+'/README.md');text=p.read_text(encoding='utf-8')
text=text.replace('B/Y (7,7)','B/Y (1,1)')
text='\n'.join(line for line in text.split('\n') if not line.startswith('MICRO-49 updated by MICRO49_PURE_STRATEGY_NASH_FIX_V1.'))
text+='\nMICRO-49 updated by MICRO49_UNIQUE_NASH_FIX_V2. The worked heading is FINDING A NASH EQUILIBRIUM. Read B/Y as (1,1); verify A beats B against both columns and X beats Y against both rows. Confirm A and X are strictly dominant and (A, X) is the unique Nash equilibrium. Current staged evidence and PREVIEW ONLY plan: `../../micro49_unique_nash_v2/`. Human AT remains PENDING; no installation was executed.\n'
p.write_text(text,encoding='utf-8')
assert sha(pack+'/pdfs/MICRO-49.pdf')==row['sha256']
text=normalized(PdfReader(contained(row['output'])).pages[0].extract_text())
assert 'FINDING A NASH EQUILIBRIUM' in text and '(A, X) is the unique Nash equilibrium' in text
assert '(B, Y)' not in text and 'mixed-strategy' not in text
review=read_json(run+'/review_receipt.json')
summary={'task':'MICRO49_UNIQUE_NASH_FIX_V2','accepted':151,'total':151,
 'pdfUaMachine':sum(r['independentPass'] for r in rows),'semanticProject':sum(not r['projectErrors'] for r in rows),
 'preservation':sum(r['geometryEqual'] and r['pageCounts']==[1,1] and (r['textWhitespaceOnlyEqual'] or r.get('ownerApprovedWordingOnly',False)) for r in rows),
 'determinism':sum(r['deterministic'] for r in rows),'contrastVisual':sum(review['records'][r['code']]['contrast'] and review['records'][r['code']]['rendering'] for r in rows),
 'previewLogicalResources':151,'previewDestinationCopies':302,'missingPublicCopiesPlanned':15,'installationExecuted':False,'deployment':False,'humanAT':'PENDING'}
assert all(summary[k]==151 for k in ('pdfUaMachine','semanticProject','preservation','determinism','contrastVisual'))
write_json(run+'/collection_summary.json',summary)
print(summary)
