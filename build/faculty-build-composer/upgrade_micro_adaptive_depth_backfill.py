import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
QFILE=ROOT/'phaseMicro3a-adaptive-depth-backfill-v1_questions.json'
PHASE='phaseMicro3a-adaptive-depth-backfill-v1'
GEN='2026-08-11T01:20:00.000Z'
COMPOSER_VERSION='4.5i.0'

raw=LIB.read_text(encoding='utf-8').strip(); prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1])
newqs=json.loads(QFILE.read_text(encoding='utf-8'))['questions']
old_count=lib['canonicalQuestionCount']
existing_ids=set()
for cid,module in lib['concepts'].items():
    for arr in module.get('questions',{}).values():
        for q in arr or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
    for k in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
        for q in module.get(k,[]) or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
for q in newqs:
    qid=q.get('canonicalId') or q.get('id')
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')

by_parent=Counter()
for q in newqs:
    pid=q['familyConceptId']; pool=q['canonicalDifficulty']
    assert pid in ('elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy')
    assert pool in ('easy','medium','hard')
    lib['concepts'][pid]['questions'][pool].append(q)
    by_parent[pid]+=1

# Update registry entries for the affected parent and child selectors.
regmap={e['canonicalConceptId']:e for e in lib['registry']['concepts']}

def role_counts_for_parent(parent):
    c=Counter()
    for pool,arr in parent.get('questions',{}).items():
        for q in arr or []:
            role=q.get('instructionalRole')
            if role: c[role]+=1
            elif pool=='elite': c['elite']+=1
            elif pool=='legendary': c['legendary']+=1
            elif pool=='calculation': c['calculation']+=1
            elif pool=='boss': c['boss']+=1
            elif pool=='legendaryBoss': c['legendaryBoss']+=1
            elif pool=='integration': c['integration']+=1
            else: c['main']+=1
    c['repair']+=len(parent.get('repairQuestions',[]) or [])
    c['bridge']+=len(parent.get('bridgeQuestions',[]) or [])
    c['repairSeed']+=len(parent.get('repairSeedQuestions',[]) or [])
    return c

def diff_counts_for_records(records):
    c=Counter()
    for q in records:
        c[q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown']+=1
    return c

def all_parent_records(parent):
    out=[]
    for arr in parent.get('questions',{}).values(): out.extend(arr or [])
    out.extend(parent.get('repairQuestions',[]) or [])
    out.extend(parent.get('bridgeQuestions',[]) or [])
    out.extend(parent.get('repairSeedQuestions',[]) or [])
    return out

def child_records(parent,sid): return [q for q in all_parent_records(parent) if sid in (q.get('subtopicIds') or [])]

def runtime_counts(parent,sid):
    c=Counter()
    for pool,arr in parent.get('questions',{}).items():
        for q in arr or []:
            if sid not in (q.get('subtopicIds') or []): continue
            if pool in ('easy','medium','hard','elite','legendary'): c[pool]+=1
            elif pool in ('calculation','integration'):
                target=q.get('canonicalDifficulty') or q.get('difficulty') or 'hard'
                if target not in ('easy','medium','hard','elite','legendary'): target='hard'
                c[target]+=1
    return c

for pid in by_parent:
    parent=lib['concepts'][pid]
    pe=regmap[pid]
    roles=role_counts_for_parent(parent)
    diffs=diff_counts_for_records(all_parent_records(parent))
    for k in list(pe.get('questionCountByRole',{})):
        pe['questionCountByRole'][k]=roles[k]
    for k in list(pe.get('questionCountByDifficulty',{})):
        pe['questionCountByDifficulty'][k]=diffs[k]
    note=pe.get('coverageStatusNote','').rstrip()
    add=' Adaptive-depth backfill now enforces runtime Easy/Medium/Hard floors for granular Micro selectors without changing Legendary, checkpoint, repair, bridge, graph, or calculation scope.'
    if add.strip() not in note: pe['coverageStatusNote']=note+add

    for sid,meta in lib['concepts'].items():
        if meta.get('derivedFromConceptId')!=pid: continue
        ce=regmap[sid]; recs=child_records(parent,sid); d=diff_counts_for_records(recs); r=runtime_counts(parent,sid)
        # Update role/difficulty counts using the same schema keys already present.
        role=Counter()
        for q in recs:
            role[q.get('instructionalRole') or 'main']+=1
        # Preserve specialized pool counts from existing entry; incrementing main is sufficient for newly added records.
        old_roles=ce.get('questionCountByRole',{})
        added_to_child=sum(1 for q in newqs if sid in (q.get('subtopicIds') or []))
        if 'main' in old_roles: old_roles['main']=old_roles.get('main',0)+added_to_child
        for k in ('easy','medium','hard','elite','legendary','unknown'):
            if k in ce.get('questionCountByDifficulty',{}): ce['questionCountByDifficulty'][k]=d[k]
        supporting=meta.get('standaloneRecommendation')=='supporting-subtopic'
        floor=5 if supporting else 10
        ce['adaptiveDepthFloor']={'easy':floor,'medium':floor,'hard':floor}
        ce['runtimeAdaptiveCounts']={'easy':r['easy'],'medium':r['medium'],'hard':r['hard']}
        ce['adaptiveDepthStatus']='ready' if all(r[k]>=floor for k in ('easy','medium','hard')) else 'insufficient'
        ce['coverageFloorVersion']=PHASE
        note=ce.get('coverageStatusNote','').rstrip()
        add=f" Runtime adaptive depth: {r['easy']} Easy / {r['medium']} Medium / {r['hard']} Hard; floor {floor}/{floor}/{floor}."
        ce['coverageStatusNote']=note+add

lib['composerVersion']=COMPOSER_VERSION
if not lib['libraryVersion'].endswith('-'+PHASE): lib['libraryVersion'] += '-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['canonicalQuestionCount']=old_count+len(newqs)
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Micro adaptive-depth backfill: add only the ordinary Easy/Medium/Hard questions required for already-granularized Elasticity, Surplus, and Trade child selectors to meet engine-driven adaptive floors. No Legendary, checkpoint, repair, bridge, calculation, or graph expansion.'
lib['registry']['libraryVersion']=lib['libraryVersion']
lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']
lib['registry']['composerVersion']=COMPOSER_VERSION
lib['conceptCount']=len(lib['concepts'])

lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
blob=json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True).encode()
lib['librarySha256']=hashlib.sha256(blob).hexdigest()
LIB.write_text('window.MQ_COMPOSER_LIBRARY='+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
standalone=json.loads(json.dumps(lib['registry'])); standalone['librarySha256']=lib['librarySha256']
REG.write_text(json.dumps(standalone,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
MAN.write_text(json.dumps({'assetCount':len(lib.get('assetInventory',[])),'assets':lib.get('assetInventory',[]),'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Machine summary
summary={'phase':PHASE,'composerVersion':COMPOSER_VERSION,'beforeCanonicalQuestionCount':old_count,'afterCanonicalQuestionCount':lib['canonicalQuestionCount'],'added':len(newqs),'byFamily':dict(by_parent),'librarySha256':lib['librarySha256'],'children':{}}
for pid in by_parent:
    p=lib['concepts'][pid]
    for sid,m in lib['concepts'].items():
        if m.get('derivedFromConceptId')!=pid: continue
        r=runtime_counts(p,sid); floor=5 if m.get('standaloneRecommendation')=='supporting-subtopic' else 10
        summary['children'][sid]={'title':m['title'],'floor':floor,'runtimeAdaptive':{k:r[k] for k in ('easy','medium','hard')},'pass':all(r[k]>=floor for k in ('easy','medium','hard'))}
(ROOT/'phaseMicro3a_adaptive_backfill_metadata_results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2,ensure_ascii=False))
