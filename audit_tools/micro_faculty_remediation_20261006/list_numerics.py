import json,re
from pathlib import Path
h=Path('audit_tools/micro_faculty_remediation_20261006');l=json.loads((h/'expectations.json').read_text());rows=[]
for c in l['changes']:
 q=c['afterRecord'];f=set(c['fields'])
 if f&{'q','options','feedback','aHash'} and (q.get('type')=='calculation' or re.search(r'\d',q['q']) or re.search(r'\d',q['options'][c['correctIndex']])):
  rows.append({'id':c['id'],'q':q['q'],'answer':q['options'][c['correctIndex']],'feedback':q['feedback'],'image':q.get('image')})
(h/'numeric-review-items.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print(len(rows))
for n,r in enumerate(rows):print(n,r['id'],r['q'], 'KEY:',r['answer'])
