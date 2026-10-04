import json,re
from pathlib import Path
p=Path(__file__).parent;r=json.loads((p/'records.json').read_text());s=set(json.loads((p/'shared.json').read_text()));families=json.loads((p/'families.json').read_text())
notes=json.loads((p/'review_notes.json').read_text());packets=[];buf=[];chars=0;ids=[]
for f in families:
 for i in f['ids']:
  q=r[i]['q'];adv=q.get('difficulty') in ['elite','legendary'] or q.get('difficultyTier') in ['elite','legendary'] or q.get('instructionalRole') in ['boss','legendaryBoss']
  # Actual field is verified below; include options for every record to avoid a field-name omission.
  if q.get('image'):continue
  t=f"{i} {'SHARED' if i in s else 'MACRO'} {q.get('difficulty',q.get('difficultyTier'))} | {q['q']}\n"+' / '.join(f"{'ABCD'[j]}{'*' if j==r[i]['answer'] else ''} {v}" for j,v in enumerate(q['options']))+'\n'
  if chars+len(t)>34000:
   packets.append((buf,ids));buf=[];ids=[];chars=0
  buf.append(t);ids.append(i);chars+=len(t)
if buf:packets.append((buf,ids))
for j,(buf,ids) in enumerate(packets,1):(p/f'remaining-{j:02}.txt').write_text('\n'.join(buf),encoding='utf8')
(p/'remaining_packets.json').write_text(json.dumps({j:ids for j,(_,ids) in enumerate(packets,1)}),encoding='utf8')
print('packets',len(packets),'records',sum(len(ids) for _,ids in packets));print(next(iter(r.values()))['q'].keys())
