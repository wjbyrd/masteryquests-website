import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
QFILE=ROOT/'phaseMicro3b-adaptive-support-backfill-v1_questions.json'
PHASE='phaseMicro3b-adaptive-support-backfill-v1'
GEN='2026-08-11T02:05:00.000Z'
COMPOSER_VERSION='4.5j.0'
PARENTS=('elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy')

raw=LIB.read_text(encoding='utf-8').strip(); prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1])
assert lib['canonicalQuestionCount']==7404, f"unexpected starting count {lib['canonicalQuestionCount']}"
newqs=json.loads(QFILE.read_text(encoding='utf-8'))['questions']
assert len(newqs)==80

# Guard against ID collisions across physical parent modules.
existing_ids=set()
for module in lib['concepts'].values():
    if not isinstance(module,dict) or 'questions' not in module: continue
    for arr in module.get('questions',{}).values():
        for q in arr or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
    for k in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
        for q in module.get(k,[]) or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
for q in newqs:
    qid=q.get('canonicalId') or q.get('id')
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')

by_parent=Counter(); by_role=Counter()
for q in newqs:
    pid=q['familyConceptId']; role=q['instructionalRole']; skill=q['primarySkill']; qid=q['canonicalId']
    assert pid in PARENTS
    assert role in ('repair','bridge')
    parent=lib['concepts'][pid]
    if role=='repair':
        parent['repairQuestions'].append(q)
        parent.setdefault('microSkillRepairPools',{}).setdefault(skill,[]).append(qid)
    else:
        parent['bridgeQuestions'].append(q)
        parent.setdefault('microSkillBridgePools',{}).setdefault(skill,[]).append(qid)
    by_parent[pid]+=1; by_role[role]+=1

regmap={e['canonicalConceptId']:e for e in lib['registry']['concepts']}

def all_parent_records(parent):
    out=[]
    for arr in parent.get('questions',{}).values(): out.extend(arr or [])
    out.extend(parent.get('repairQuestions',[]) or [])
    out.extend(parent.get('bridgeQuestions',[]) or [])
    out.extend(parent.get('repairSeedQuestions',[]) or [])
    return out

def child_records(parent,sid):
    return [q for q in all_parent_records(parent) if sid in (q.get('subtopicIds') or [])]

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

def role_counts(records):
    c=Counter()
    for q in records:
        role=q.get('instructionalRole') or 'main'
        c[role]+=1
    return c

def difficulty_counts(records):
    c=Counter()
    for q in records:
        c[q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown']+=1
    return c

def support_counts(parent,sid):
    return {
        'repair':sum(1 for q in parent.get('repairQuestions',[]) if sid in (q.get('subtopicIds') or [])),
        'bridge':sum(1 for q in parent.get('bridgeQuestions',[]) if sid in (q.get('subtopicIds') or []))
    }

def routed_ids(route_map):
    out=set()
    for refs in (route_map or {}).values():
        for ref in refs or []:
            out.add(ref if isinstance(ref,str) else (ref.get('canonicalId') or ref.get('id')))
    return out

for pid in PARENTS:
    parent=lib['concepts'][pid]
    parent_records=all_parent_records(parent)
    pe=regmap[pid]
    roles=role_counts(parent_records); diffs=difficulty_counts(parent_records)
    # Parent registry remains exact after additions.
    for k in set(pe.get('questionCountByRole',{})) | set(roles): pe.setdefault('questionCountByRole',{})[k]=roles[k]
    for k in set(pe.get('questionCountByDifficulty',{})) | set(diffs): pe.setdefault('questionCountByDifficulty',{})[k]=diffs[k]
    pe['repairCoverage']={
        'directSkillMatches':len(routed_ids(parent.get('directSkillRepairRoutes')) | routed_ids(parent.get('microSkillRepairPools'))),
        'mainWithUsableSkill':sum(1 for q in parent_records if q.get('primarySkill'))
    }
    pe['bridgeCoverage']={
        'directSkillMatches':len(routed_ids(parent.get('microSkillBridgePools'))),
        'mainWithUsableSkill':sum(1 for q in parent_records if q.get('primarySkill'))
    }
    note=pe.get('coverageStatusNote','').rstrip()
    add=' Adaptive-support backfill now provides multiple targeted Repair and Bridge routes for each granular child selector while preserving the family scope.'
    if add.strip() not in note: pe['coverageStatusNote']=note+add
    pe['coverageFloorVersion']=PHASE

    for sid,meta in lib['concepts'].items():
        if not isinstance(meta,dict) or meta.get('derivedFromConceptId')!=pid: continue
        ce=regmap[sid]; recs=child_records(parent,sid); roles=role_counts(recs); diffs=difficulty_counts(recs); rt=runtime_counts(parent,sid); sup=support_counts(parent,sid)
        ce['questionCountByRole']={k:roles[k] for k in ('main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed')}
        ce['questionCountByDifficulty']={k:diffs[k] for k in ('easy','medium','hard','elite','legendary','unknown')}
        supporting=meta.get('standaloneRecommendation')=='supporting-subtopic'
        depth_floor=5 if supporting else 10
        support_floor=3 if supporting else 6
        ce['adaptiveDepthFloor']={'easy':depth_floor,'medium':depth_floor,'hard':depth_floor}
        ce['runtimeAdaptiveCounts']={'easy':rt['easy'],'medium':rt['medium'],'hard':rt['hard']}
        ce['adaptiveDepthStatus']='ready' if all(rt[k]>=depth_floor for k in ('easy','medium','hard')) else 'insufficient'
        ce['adaptiveSupportFloor']={'repair':support_floor,'bridge':support_floor}
        ce['adaptiveSupportCounts']=sup
        ce['adaptiveSupportStatus']='ready' if sup['repair']>=support_floor and sup['bridge']>=support_floor else 'insufficient'
        child_ids={q.get('canonicalId') or q.get('id') for q in recs}
        repair_route_ids=routed_ids(parent.get('directSkillRepairRoutes')) | routed_ids(parent.get('microSkillRepairPools'))
        bridge_route_ids=routed_ids(parent.get('microSkillBridgePools'))
        ce['repairCoverage']={'directSkillMatches':len(child_ids & repair_route_ids),'mainWithUsableSkill':sum(1 for q in recs if q.get('primarySkill'))}
        ce['bridgeCoverage']={'directSkillMatches':len(child_ids & bridge_route_ids),'mainWithUsableSkill':sum(1 for q in recs if q.get('primarySkill'))}
        ce['coverageFloorVersion']=PHASE
        # Replace old appended runtime line if present, then append current support line once.
        base=ce.get('coverageStatusNote','')
        marker=' Adaptive support:'
        if marker in base: base=base.split(marker)[0].rstrip()
        ce['coverageStatusNote']=base+f" Adaptive support: {sup['repair']} Repair / {sup['bridge']} Bridge; floor {support_floor}/{support_floor}."

lib['composerVersion']=COMPOSER_VERSION
if not lib['libraryVersion'].endswith('-'+PHASE): lib['libraryVersion'] += '-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['canonicalQuestionCount'] += len(newqs)
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Micro adaptive retrofit: complete targeted Repair/Bridge coverage for Elasticity, Surplus, and Trade granular child selectors after the ordinary Easy/Medium/Hard depth backfill. Adds only measured support gaps; no Legendary, checkpoint, graph, or calculation expansion.'
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

summary={'phase':PHASE,'composerVersion':COMPOSER_VERSION,'beforeCanonicalQuestionCount':7404,'afterCanonicalQuestionCount':lib['canonicalQuestionCount'],'added':len(newqs),'byFamily':dict(by_parent),'byRole':dict(by_role),'librarySha256':lib['librarySha256'],'children':{}}
for pid in PARENTS:
    p=lib['concepts'][pid]
    for sid,m in lib['concepts'].items():
        if isinstance(m,dict) and m.get('derivedFromConceptId')==pid:
            rt=runtime_counts(p,sid); sup=support_counts(p,sid); supporting=m.get('standaloneRecommendation')=='supporting-subtopic'; df=5 if supporting else 10; sf=3 if supporting else 6
            summary['children'][sid]={'title':m['title'],'role':'supporting' if supporting else 'standalone/focused','adaptiveDepthFloor':df,'runtimeAdaptive':{k:rt[k] for k in ('easy','medium','hard')},'adaptiveDepthPass':all(rt[k]>=df for k in ('easy','medium','hard')),'adaptiveSupportFloor':sf,'adaptiveSupport':sup,'adaptiveSupportPass':sup['repair']>=sf and sup['bridge']>=sf}
(ROOT/'phaseMicro3b_adaptive_support_metadata_results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2,ensure_ascii=False))
