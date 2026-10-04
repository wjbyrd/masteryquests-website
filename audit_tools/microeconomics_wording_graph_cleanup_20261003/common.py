"""Exact-scope authoring helpers. Files here are proposals until apply.cjs --write."""
from pathlib import Path
import json,copy
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
W=json.loads((HERE/'worklist.json').read_text(encoding='utf8'))
O=json.loads((HERE/'originals.json').read_text(encoding='utf8'))
P=json.loads((HERE/'patches.json').read_text(encoding='utf8')) if (HERE/'patches.json').exists() else {}
R=json.loads((HERE/'acceptance.json').read_text(encoding='utf8')) if (HERE/'acceptance.json').exists() else {}
G={i:g for g in W['graph_findings'] for i in g['ids']}
def draft(i):
 assert i in O
 return copy.deepcopy({**O[i],**P.get(i,{})})
def save():
 for name,data in [('patches.json',P),('acceptance.json',R)]: (HERE/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def edit(i,**fields):
 assert set(fields)<={'q','options','feedback'}
 P.setdefault(i,{'correct_index':'ABCD'.index(W['records'][i]['correct_answer_letter'])}).update(fields)
def paired(i,stem,good,other_reading,wrong_economics,other_wrong,feedback,evidence,reasoning,calculation=None):
 """Two evidence alternatives crossed with two economic interpretations; keep original key slot."""
 assert i in G and len({good,other_reading,wrong_economics,other_wrong})==4
 k='ABCD'.index(W['records'][i]['correct_answer_letter']);slots=[k]+[n for n in range(4) if n!=k]
 opts=['']*4
 for n,s in zip(slots,[good,other_reading,wrong_economics,other_wrong]):opts[n]=s
 edit(i,q=stem,options=opts,feedback=feedback)
 R[i]={'finding_ids':W['records'][i]['finding_ids'],'original_construct':G[i]['construct'],'original_skill':O[i].get('primarySkill'),
       'final_economic_task':reasoning,'graph_evidence_required':evidence,'numerical_reasoning':calculation or evidence,
       'construct_test':{'answer':'NO','status':'PENDING_REVIEW','same_readings_different_economics':['ABCD'[slots[0]],'ABCD'[slots[2]]]},
       'graph_test':{'answer':'NO','status':'PENDING_REVIEW','economically_plausible_without_graph':['ABCD'[slots[0]],'ABCD'[slots[1]]]},
       'four_choice_validation':'PASS','one_answer_validation':'PENDING_REVIEW','numerical_validation':'PENDING_REVIEW','feedback_validation':'PENDING_REVIEW','hash_validation':'PENDING_APPLICATION'}
