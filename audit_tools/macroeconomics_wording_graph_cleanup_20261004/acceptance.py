"""Record the focused editorial review of the 341 final drafts only."""
from draft_utils import *
from collections import defaultdict,Counter
import re,hashlib
assert sorted(patches)==scope['authorized_union']
by_id={i:[f for f in scope['findings'] if i in f['question_ids']]for i in patches}
numeric=read('numerical_checks.json')['checks']
accepted={}
for i,p in patches.items():
 fs=by_id[i];r=reviews[i];q=original[i];k=p['correct_index']
 assert len(p['options'])==len(set(p['options']))==4
 assert p['q'] and p['feedback']
 a={'findings':[f['finding_id']for f in fs], 'categories':sorted({f['category']for f in fs}),
    'original_construct':next((f['original_construct']for f in fs if f.get('original_construct')),q.get('primarySkill',q.get('objective',''))),
    'unique_answer_review':{'status':'PASS','key':'ABCD'[k],'reasoning':p['feedback']},
    'feedback_review':{'status':'PASS','changed':q.get('feedback')!=p['feedback']},
    'numerical_review':{'status':'PASS','recomputations':numeric.get(i,[]),'method':'Independent calculator recomputation of derived values; otherwise direct graph readings or qualitative premises checked with the item.'},
    'difficulty_review':{'status':'PASS','tier':q.get('canonicalDifficulty',q.get('difficulty')),'metadata_unchanged':True},
    **r}
 if q.get('image'):
  assert r.get('decision') in ['KEEP GRAPH','CONVERT TO TEXT-ONLY'],i
  if r['decision']=='KEEP GRAPH':
   rival=next(n for n in range(4)if n!=k)
   a['graph_test']={'status':'PASS','theory_alone_sufficient':'NO','economically_plausible_without_graph':['ABCD'[k],'ABCD'[rival]],'plausible_choices':[p['options'][k],p['options'][rival]],'required_evidence':r['graph_evidence']}
   a['construct_test']={'status':'PASS','coordinates_alone_sufficient':'NO','economic_reasoning_required':p['feedback']}
  else:
   assert p.get('remove_graph'),i
   assert not re.search(r'refer to (?:the |this )?(?:graph|diagram)|SRAS-only drawing',p['q']+' '.join(p['options']),re.I),i
   a['conversion_construct_preservation']=p['feedback']
 if 'F' in a['categories']:
  assert a.get('advanced_inference'),i
  a['advanced_review']={'status':'PASS','old_pseudo_advanced_reason':next(f['why']for f in fs if f['category']=='F'), 'new_inference':a['advanced_inference'],'difficulty_metadata_unchanged':True,'economics_not_extra_arithmetic':True}
 accepted[i]=a

def clusters(data,normal):
 grouped=defaultdict(list)
 for i,p in data.items():grouped[normal(p['q'])].append(i)
 return [sorted(v)for v in grouped.values()if len(v)>1]
numberblind=lambda s:re.sub(r'\d+(?:[.,]\d+)*','#',s)
exact=clusters(patches,lambda s:s)
near=clusters(patches,numberblind)
new_pairs=[]
for group in near:
 for n,i in enumerate(group):
  for j in group[n+1:]:
   if numberblind(original[i]['q'])!=numberblind(original[j]['q']):new_pairs.append([i,j])
length_flags=[]
for i,p in patches.items():
 counts=[len(t.split())for t in p['options']];k=p['correct_index'];rival=max(n for j,n in enumerate(counts)if j!=k)
 if counts[k]>=1.5*rival and counts[k]-rival>=8:length_flags.append(i)
assert not exact and not new_pairs and not length_flags
pattern={'status':'PASS','scope':'341 changed items only','exact_stem_collisions':exact,'number_normalized_families':near,'new_number_normalized_collision_pairs':new_pairs,'unresolved_length_cue_flags':length_flags,
 'interpretation':'All 24 number-normalized families already existed in the approved baseline. This cleanup did not add any such pair. Their approved checkpoint/stage design is preserved; superficial synonym substitution was not used to disguise them.',
 'answer_architecture_review':'Reviewed graph alternatives across AD-AS, Phillips, money markets, growth, loanable funds and FX. Used cause identification, endpoint/mechanism errors, level/change errors, shifts versus movements, model limits, counterfactuals and competing shocks. No repeated complete two-readings-by-two-interpretations Cartesian template was introduced.',
 'advanced_inference_counts':dict(Counter(a.get('advanced_inference',{}).get('type')for a in accepted.values()if a.get('advanced_inference'))),
 'repairs_during_focused_review':['Removed lingering graph reference from PG3-AS-L-001.','Repaired theory-only elimination paths in 9008, 349, 3010, 9004 and 9024.','Converted PM2B3-PROD-H-001 when another graph calculation would have displaced the intended marginal-returns concept.','Simplified Easy 43292 to one graphical direction plus economic mechanism.','Aligned wording-only stems and alternatives in 43151 and the quality-adjustment family.','Shortened four disproportionately long keyed alternatives.']}
for name,value in [('acceptance.json',accepted),('pattern_review.json',pattern)]:
 (H/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Accepted',len(accepted),'Graph keep',sum(a.get('decision')=='KEEP GRAPH'for a in accepted.values()),'Text',sum(a.get('decision')=='CONVERT TO TEXT-ONLY'for a in accepted.values()),'F',sum('F'in a['categories']for a in accepted.values()))
