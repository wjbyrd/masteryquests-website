from author import *
import re, math, collections
library=json.loads((WORK/'baseline_library.json').read_text(encoding='utf8'))
checkpoint_demand=load('checkpoint_stage_contract.json',{})
for id in TARGETS['F']:
    old=RECORDS[id]['q'];current=q(id)
    if old.get('instructionalRole') in ['boss','legendaryBoss'] and old['primaryConceptId']!='integrated-macroeconomic-analysis':
        checkpoint_demand.setdefault(id,{'reviewedTaskDemand':current.get('canonicalDifficulty'),'runtimeCheckpointTier':old.get('canonicalDifficulty'),'basis':'Existing Composer uses canonicalDifficulty to select the checkpoint encounter; preserve that routing convention independently of the Class-D ordinary-item review.'})
        patch(id,canonicalDifficulty=old['canonicalDifficulty'],difficulty=old['difficulty'])
for id in ['ECON-SP-EASYBOSS-2002','ECON-SP-EASYBOSS-2005','ECON-SP-EASYBOSS-2008','ECON-SP-EASYBOSS-2011','ECON-SP-EASYBOSS-2014']:
    old=RECORDS[id]['q'];patch(id,canonicalDifficulty=old['canonicalDifficulty'],difficulty=old['difficulty'])
(INPUTS/'checkpoint_stage_contract.json').write_text(json.dumps(checkpoint_demand,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
routes=load('routing_decisions.json',[])
for r in routes:
    dest=library['concepts'][r['to']]
    example=next((x for rows in dest['questions'].values() for x in rows if x.get('familyConceptId')),None)
    if example:patch(r['id'],familyConceptId=example['familyConceptId'],subtopicIds=[r['to']])
def clean(s):
    s=re.sub(r'(?<=[a-z])(?=\d)', ' ',s)
    s=re.sub(r'(?<=[A-Za-z%])(?=\$)', ' ',s)
    s=re.sub(r'(?<=\d)(?=[A-Za-z])',' ',s)
    s=re.sub(r'(?<=[;:])(?=\d|\$)',' ',s)
    s=re.sub(r'(?<=\d),\s+(?=\d{3}(?:\D|$))',',',s)
    s=re.sub(r'\br ([1-4])\b',r'r\1',s)
    return s
for id,p in PATCHES.items():
    for k in ['q','feedback']:
        if k in p:p[k]=clean(p[k])
    if 'options' in p:
        p['options']=[clean(o) for o in p['options']]
        p['$correct']=clean(p['$correct'])
    if 'commonError' in p:p['commonError']=clean(p['commonError'])
for id,p in PROOFS.items():
    for expression,expected in p.get('expressions',[]):
        assert re.fullmatch(r'[0-9eE+*/().\s−-]+',expression),(id,expression)
        actual=eval(expression,{'__builtins__':{}},{})
        assert math.isclose(actual,expected,rel_tol=1e-7,abs_tol=1e-7),(id,expression,expected,actual)
duplicates=collections.defaultdict(list)
for id in TARGETS['F']:
    if 'q' in PATCHES.get(id,{}):duplicates[q(id)['q']].append(id)
assert not [v for v in duplicates.values() if len(v)>1], 'No exact revised checkpoint repetitions'
for id in PATCHES:NOTES[id]=list(dict.fromkeys(NOTES.get(id,[])))
save()
print(json.dumps({'stagedIDs':len(PATCHES),'numericalChecks':len(PROOFS),'numericExpressions':sum(len(p.get('expressions',[])) for p in PROOFS.values()),'duplicateRevisedCheckpointStems':0}))
