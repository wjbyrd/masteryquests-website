import sys, copy, json
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from tag_pilot import source_hash, semantic_hash
root_guard()
run='validation_artifacts/pdf_accessibility/micro49_nash_fix_v1'
src='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
sem='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
sources=read_json(src); metadata=read_json(sem)
record=next(r for r in sources['reviews'] if r['code']=='MICRO-49')
old=copy.deepcopy(record); old_meta=copy.deepcopy(metadata['pilot']['MICRO-49'])
rows=read_json('validation_artifacts/pdf_accessibility/blocked_25_v1/final_validation.json')
write_json(run+'/baseline.json',{'task':'MICRO49_PURE_STRATEGY_NASH_FIX_V1','root':str(root_guard()),'branch':'main','head':'f1227000551377087d4f592fe2ea4ee75c60de6c','gitStatus':'clean','writable':True,'source':old,'semantics':old_meta,'candidates':[{'code':r['code'],'path':r['output'],'sha256':sha(r['output']),'mtimeNs':contained(r['output']).stat().st_mtime_ns} for r in rows]})
record['content']['workedLabel']='FINDING PURE-STRATEGY NASH EQUILIBRIA'
record['content']['worked']="For each rival strategy, choose the larger payoff. If column X is chosen, row A gives 9 rather than row B's 3. If row A is chosen, column X gives 9 rather than column Y's 3. Thus, (A, X) is a Nash equilibrium. If column Y is chosen, row B gives 7 rather than row A's 2. If row B is chosen, column Y gives 7 rather than column X's 2. Thus, (B, Y) is also a Nash equilibrium. The matrix has two pure-strategy Nash equilibria: (A, X) and (B, Y)."
# Change just the two maintained instructional fields before any PDF build.
text=contained(src).read_text(encoding='utf-8')
for field in ('worked','workedLabel'):
    before=json.dumps(old['content'][field],ensure_ascii=False)
    after=json.dumps(record['content'][field],ensure_ascii=False)
    assert text.count(before)==1
    text=text.replace(before,after)
contained(src).write_text(text,encoding='utf-8')
meta=metadata['pilot']['MICRO-49'];meta['sourceRecordSha256']=source_hash(record)
meta['wordingCorrection']={'status':'owner_authorized','field':'worked','oldText':old['content']['worked'],'newText':record['content']['worked'],'sourceRecordSha256':source_hash(record),'originalAssetSha256':meta['assetSourceSha256'],'layout':'micro49_pure_strategy_v1','heading':{'oldText':'WORKED EXAMPLE: '+old['content']['workedLabel'],'newText':'WORKED EXAMPLE: '+record['content']['workedLabel']},'reviewEvidence':run+'/visual_review.json'}
write_json(sem,metadata)
print('Canonical MICRO-49 source and resource-specific semantics updated')
