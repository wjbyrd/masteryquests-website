from review_tools import *
data=load(); allq=json.loads((EVIDENCE/'all_originals.json').read_text(encoding='utf8'))
rows=[]
for row in INDEX:
    spec=data['assets'].get(row['asset'],{})
    if not spec.get('repairRequired') or 87<=row['index']<=90:continue
    outsiders=[id for id in row['all_refs'] if id not in ORIGINALS]
    if not outsiders:continue
    rows.append(f"\nASSET {row['index']:03} {row['asset']} — {len(outsiders)} additional users")
    for id in outsiders:
        q=allq[id];rows.append(f"{id}: {q['q']}\n  {' | '.join(q['options'])}\n  {q.get('feedback','')}")
(EVIDENCE/'shared-users.txt').write_text('\n'.join(rows),encoding='utf8')
print(len(rows),'entries')
