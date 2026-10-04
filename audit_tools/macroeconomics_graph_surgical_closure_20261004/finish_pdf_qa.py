from pathlib import Path
import json,hashlib

ROOT=Path(__file__).resolve().parents[2];W=ROOT/'tmp'/Path(__file__).parent.name
p=W/'pdf_visual_qa_pending.json';r=json.loads(p.read_text(encoding='utf-8'))
assert not r['split_question_cores'] and len(r['question_pages'])==3
pdf=ROOT/'faculty_exports/macroeconomics_question_bank.pdf'
assert hashlib.sha256(pdf.read_bytes()).hexdigest()==r['pdf_sha256']
r.update(status='PASS',questions_inspected=3,visual_findings={
 'ECON-SP-ELITE-320':'Inspected pages 577-578. Identification/metadata begins on 577 and continues on 578 in the normal exporter layout. The entire revised stem, unchanged graph, four choices, key and feedback are together on 578, legible and unclipped. AD labels and relative widths are visible.',
 'P62D-ITP-L-095':'Inspected page 1542. Revised four choices, key and complete calculation feedback are legible below the preserved tariff graph. Price and quantity labels are visible; no clipping or overlap.',
 'P62D-ITP-L-098':'Inspected page 1603. Domestic license-holder assumption, revised four choices, key and full calculation feedback are legible with the preserved quota graph. Axes and price lines are visible; no clipping or overlap.'},
 question_cores_kept_together=True,unclipped_text_and_graphs=True)
(W/'pdf_visual_qa.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print('PASS: three revised graph questions visually inspected; all 4745 Macro question cores are unsplit.')
