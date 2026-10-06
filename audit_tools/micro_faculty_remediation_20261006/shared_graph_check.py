import json
from pathlib import Path
h=Path('audit_tools/micro_faculty_remediation_20261006');l=json.loads((h/'expectations.json').read_text());b=json.loads((h/'baseline_records.json').read_text());changes={c['id']:c['afterRecord'] for c in l['changes']};r={i:changes.get(i,v['q']) for i,v in b.items()}
for a in l['assets']:
 if '/perfect-competition/' in a['path'] and 'pc_' in a['path']:
  print('\nASSET',a['path'],a['model'])
  for id in a['referencingIds']:
   q=r[id]; print(id,q['q'],' | ',q['feedback'])
