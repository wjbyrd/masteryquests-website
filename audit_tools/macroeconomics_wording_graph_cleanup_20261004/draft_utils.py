import json
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/n).read_text(encoding='utf8'))
original=read('originals.json');scope=read('scope.json');patches=read('patches.json');reviews=read('reviews.json')
keys={s['question_id']:'ABCD'.index(s['correct_answer_letter']) for f in scope['findings'] for s in f['current']}
def draft(i,stem,choices,feedback,decision=None,evidence=None,inference=None,reason=None):
 assert i in original and len(choices)==4 and len(set(choices))==4
 k=keys[i];opts=choices[1:];opts.insert(k,choices[0])
 patches[i]={'q':stem,'options':opts,'feedback':feedback,'correct_index':k}
 rev=reviews.setdefault(i,{})
 if decision:
  rev.update(decision=decision,graph_evidence=evidence,decision_reason=reason)
  if decision=='CONVERT TO TEXT-ONLY':patches[i]['remove_graph']=True
 if inference:rev['advanced_inference']=inference
def text(i,stem,feedback=None,choices=None,reason='The economic task is self-contained; adding graph labels would add a redundant lookup rather than evidence.'):
 q=patches.get(i,original[i]);k=keys[i]
 draft(i,stem,choices or [q['options'][k]]+[s for j,s in enumerate(q['options']) if j!=k],feedback or q['feedback'],'CONVERT TO TEXT-ONLY',reason=reason)
def save():
 for name,v in [('patches.json',patches),('reviews.json',reviews)]: (H/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print('Drafted',len(patches),'of',len(original))
