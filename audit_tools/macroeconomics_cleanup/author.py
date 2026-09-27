"""Exact-ID authoring support. This stages patches; it never writes canonical data."""
import copy, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'tmp/macroeconomics_cleanup'
INPUTS=Path(__file__).parent/'inputs'
RECORDS=json.loads((WORK/'baseline_records.json').read_text(encoding='utf8'))
AUDIT=json.loads((ROOT/'faculty_exports/audits/macroeconomics_audit_findings.json').read_text(encoding='utf8'))['findings']
TARGETS={c:sorted({i for f in AUDIT if f['category']==c for i in f['affectedQuestionIDs']}) for c in 'ABCDEFGHIJKL'}
ALLOWED=set().union(*map(set,TARGETS.values()))
def load(name, default):
    p=INPUTS/name
    return json.loads(p.read_text(encoding='utf8')) if p.exists() else copy.deepcopy(default)
PATCHES=load('question_patches.json',{})
NOTES=load('decisions.json',{})
PROOFS=load('economic_checks.json',{})
def q(id):
    out=copy.deepcopy(RECORDS[id]['q']);out.update(PATCHES.get(id,{}))
    for k in out.pop('$unset',[]):out.pop(k,None)
    return out
def patch(id, note=None, **fields):
    assert id in ALLOWED,id
    PATCHES.setdefault(id,{}).update(fields)
    if note:NOTES.setdefault(id,[]).append(note)
def task(id, stem, answers, feedback, operation='analysis', error=None, proof=None, keep_image=False):
    assert len(answers)==4 and len(set(answers))==4,id
    # First answer is correct before deterministic positional rotation.
    shift=sum(map(ord,id))%4; options=answers[shift:]+answers[:shift]
    values={'q':stem,'options':options,'$correct':answers[0],'feedback':feedback,'type':operation}
    if error:values['commonError']=error
    old=q(id)
    if old.get('image') and not keep_image:
        values['$unset']=list(set(PATCHES.get(id,{}).get('$unset',[]))|{'image','imageAlt','graphDescription','graphRequired'})
    patch(id,'Coherent targeted task revision; preserve canonical identity, source provenance and instructional role.',**values)
    if proof:PROOFS[id]=proof
def save():
    for name,data in [('question_patches.json',PATCHES),('decisions.json',NOTES),('economic_checks.json',PROOFS)]:
        (INPUTS/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
