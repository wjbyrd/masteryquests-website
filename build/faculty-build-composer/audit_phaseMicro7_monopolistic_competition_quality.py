import json,re,hashlib
from pathlib import Path
from collections import Counter,defaultdict
from rapidfuzz import fuzz, process
ROOT=Path(__file__).resolve().parent
QF=ROOT/'phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1_questions.json'
LIB=ROOT/'data/composer_library.js'
new=json.load(open(QF,encoding='utf-8'))['questions']
raw=LIB.read_text(encoding='utf-8').strip(); lib=json.loads(raw[len('window.MQ_COMPOSER_LIBRARY='):-1])
def norm(s): return re.sub(r'[^a-z0-9%$]+',' ',str(s).lower()).strip()
def answer_hash(s): return hashlib.sha256(re.sub(r'\s+',' ',str(s).strip()).lower().encode()).hexdigest()
def jaccard_text(a,b):
    ta,tb=set(a.split()),set(b.split()); return len(ta&tb)/max(1,len(ta|tb))
issues=[]; ids=set(); stems=set(); correct_lengths=[]; all_lengths=[]; pos=Counter(); skill=Counter(); sub=Counter(); pool=Counter()
for q in new:
    qid=q['id']
    if qid in ids: issues.append(f'duplicate id {qid}')
    ids.add(qid); ns=norm(q['q'])
    if ns in stems: issues.append(f'duplicate stem {qid}')
    stems.add(ns)
    if len(q.get('options',[]))!=4 or len(set(q.get('options',[])))!=4: issues.append(f'bad options {qid}')
    matches=[i for i,o in enumerate(q['options']) if answer_hash(o)==q.get('aHash')]
    if len(matches)!=1: issues.append(f'answer hash {qid} matches {len(matches)}')
    else:
        pos[matches[0]]+=1; ans=q['options'][matches[0]]; correct_lengths.append(len(ans)); all_lengths.extend(len(o) for o in q['options'])
    if q.get('familyConceptId')!='monopolistic-competition' or len(q.get('subtopicIds',[]))!=1: issues.append(f'{qid} family/subtopic metadata')
    skill[q.get('primarySkill')]+=1; sub[q['subtopicIds'][0]]+=1; pool[q['sourcePool']]+=1
    if q['sourcePool'] in ('repair','bridge') and q.get('instructionalRole')!=q['sourcePool']: issues.append(f'{qid} support role mismatch')
    if q['sourcePool'] in ('easy','medium','hard') and q.get('instructionalRole')!='main': issues.append(f'{qid} main role mismatch')
avg_correct=sum(correct_lengths)/len(correct_lengths); avg_all=sum(all_lengths)/len(all_lengths); longest_correct=0
for q in new:
    matches=[i for i,o in enumerate(q['options']) if answer_hash(o)==q.get('aHash')]
    if matches:
        lens=[len(o) for o in q['options']]
        if lens[matches[0]]==max(lens) and lens.count(max(lens))==1: longest_correct+=1
if longest_correct/len(new)>0.60: issues.append(f'correct option uniquely longest too often: {longest_correct}/{len(new)}')
all_existing=[]
for cid,m in lib['concepts'].items():
    if m.get('derivedFromConceptId'): continue
    for arr in m.get('questions',{}).values(): all_existing.extend(arr or [])
    all_existing.extend(m.get('repairQuestions',[]) or []); all_existing.extend(m.get('bridgeQuestions',[]) or []); all_existing.extend(m.get('repairSeedQuestions',[]) or [])
newid=set(q['id'] for q in new); protected=[q for q in all_existing if (q.get('id') or q.get('canonicalId')) not in newid]
flags=[]; new_norm=[norm(q['q']) for q in new]; prot_norm=[norm(q.get('q','')) for q in protected]
for i,stem in enumerate(new_norm):
    for j in range(i+1,len(new_norm)):
        seq=fuzz.ratio(stem,new_norm[j])/100
        if seq>=0.84:
            jac=jaccard_text(stem,new_norm[j])
            if jac>=0.78: flags.append({'a':new[i]['id'],'b':new[j]['id'],'jaccard':round(jac,3),'sequence':round(seq,3),'scope':'new-new'})
    for match,score,idx in process.extract(stem,prot_norm,scorer=fuzz.ratio,score_cutoff=89,limit=8):
        jac=jaccard_text(stem,match)
        if jac>=0.84:
            r=protected[idx]; flags.append({'a':new[i]['id'],'b':r.get('id') or r.get('canonicalId'),'jaccard':round(jac,3),'sequence':round(score/100,3),'scope':'new-protected'})
answer_set=defaultdict(list)
for q in new: answer_set[tuple(sorted(norm(o) for o in q['options']))].append(q['id'])
repeat_sets=[v for v in answer_set.values() if len(v)>1]
if repeat_sets: issues.append(f'repeated option sets: {repeat_sets[:5]}')
result={'phase':'phaseMicro7-monopolistic-competition-quality-audit-v1','ok':not issues and not flags,'questionCount':len(new),'issues':issues,'nearDuplicateFlags':flags,'optionPositionCounts':dict(pos),'uniqueLongestCorrect':longest_correct,'uniqueLongestCorrectShare':round(longest_correct/len(new),3),'averageCorrectOptionLength':round(avg_correct,2),'averageAllOptionLength':round(avg_all,2),'poolCounts':dict(pool),'subtopicCounts':dict(sub),'skillCounts':dict(skill)}
(ROOT/'phaseMicro7_monopolistic_competition_quality_audit_results.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(result,indent=2,ensure_ascii=False)); raise SystemExit(0 if result['ok'] else 1)
