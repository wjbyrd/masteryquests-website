import json,sys,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'tmp/micro_student_wording_review_20261004'
qs=json.loads((W/'current_questions.json').read_text(encoding='utf-8'))
start,end=map(int,sys.argv[1:3]);seen=set();stems={}
norm=lambda s:re.sub(r'\d+(?:[.,]\d+)*','#',s)
for q in qs[:start]:
 seen.update(map(norm,q['choices']));stems.setdefault(norm(q['stem']),q['id'])
chars=0;actual=start
for n,q in enumerate(qs[start:end],start):
 key=norm(q['stem'])
 line=f"{n} {q['id']} | "+(f"same wording as {stems[key]} (numeric variant)" if key in stems else q['stem'])
 stems.setdefault(key,q['id'])
 opts=[]
 for a,c in zip('ABCD',q['choices']):
  if norm(c) not in seen:opts.append(a+':'+c);seen.add(norm(c))
 if opts:line+='\n'+' | '.join(opts)
 if chars+len(line)>29000:break
 print(line);chars+=len(line);actual=n+1
print(f'END {start}:{actual}; previously read wording omitted for identical or numeric-only variants.')
