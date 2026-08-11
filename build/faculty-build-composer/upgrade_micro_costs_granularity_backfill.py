import json, hashlib, re
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'; REG=ROOT/'data/composer_registry.json'; MAN=ROOT/'data/composer_library_manifest.json'
QFILE=ROOT/'phaseMicro4-costs-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro4-costs-granularity-adaptive-backfill-v1'; GEN='2026-08-11T03:30:00.000Z'; COMPOSER_VERSION='4.5k.0'
PARENT_ID='costs-of-production'; PARENT_TITLE='Costs of Production'
raw=LIB.read_text(encoding='utf-8').strip(); prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1]); parent=lib['concepts'][PARENT_ID]; before_count=lib['canonicalQuestionCount']
newqs=json.loads(QFILE.read_text(encoding='utf-8'))['questions']

SUBTOPICS={
'economic-costs':{'title':'Economic Costs: Explicit, Implicit & Opportunity Cost','description':'Distinguish explicit and implicit costs and apply opportunity cost to owner-supplied labor, capital, and property.','role':'supporting-subtopic','objectives':['COP.1'],'related':['profit-concepts','opportunity-cost']},
'profit-concepts':{'title':'Accounting, Economic & Normal Profit','description':'Calculate and interpret accounting profit, economic profit, implicit costs, and normal profit.','role':'standalone-ready','objectives':['COP.1'],'related':['economic-costs','opportunity-cost']},
'short-run-production':{'title':'Short-Run Production & Diminishing Marginal Product','description':'Analyze fixed and variable inputs, total product, marginal product, average product, and diminishing marginal product in the short run.','role':'standalone-ready','objectives':['COP.2'],'related':['marginal-cost-production-linkages','short-run-cost-curves']},
'cost-components-schedules':{'title':'Cost Components & Cost Schedules','description':'Work with total fixed cost, total variable cost, total cost, and short-run cost schedules.','role':'standalone-ready','objectives':['COP.3'],'related':['average-costs','marginal-cost-production-linkages']},
'average-costs':{'title':'Average Costs: AFC, AVC & ATC','description':'Calculate and interpret average fixed cost, average variable cost, average total cost, and their arithmetic relationships.','role':'standalone-ready','objectives':['COP.3'],'related':['cost-components-schedules','short-run-cost-curves']},
'marginal-cost-production-linkages':{'title':'Marginal Cost & Production–Cost Linkages','description':'Calculate marginal cost and connect marginal product changes to the short-run marginal-cost curve.','role':'standalone-ready','objectives':['COP.3','COP.4','COP.5'],'related':['short-run-production','average-costs','short-run-cost-curves','marginal-analysis']},
'short-run-cost-curves':{'title':'Short-Run Cost Curves: Relationships & Shifts','description':'Analyze relationships among AFC, AVC, ATC, and MC and distinguish fixed-cost from variable-cost curve shifts.','role':'standalone-ready','objectives':['COP.4','COP.5'],'related':['average-costs','marginal-cost-production-linkages','sunk-avoidable-costs']},
'sunk-avoidable-costs':{'title':'Sunk & Avoidable Costs','description':'Distinguish sunk from avoidable costs and use forward-looking incremental reasoning in current production decisions.','role':'supporting-subtopic','objectives':['COP.5'],'related':['short-run-cost-curves','marginal-analysis']},
'long-run-average-cost-scale':{'title':'LRAC, Economies & Diseconomies of Scale','description':'Interpret long-run average cost, plant choice, economies of scale, diseconomies of scale, and their sources.','role':'standalone-ready','objectives':['COP.6'],'related':['minimum-efficient-scale','short-run-production']},
'minimum-efficient-scale':{'title':'Minimum Efficient Scale & Constant Returns to Scale','description':'Identify minimum efficient scale and interpret flat minimum-LRAC ranges as constant returns to scale.','role':'supporting-subtopic','objectives':['COP.6'],'related':['long-run-average-cost-scale','perfect-competition']},
}

def classify(q):
    o=q.get('objective'); sk=q.get('primarySkill') or q.get('repairSkill')
    if o=='COP.1': return 'economic-costs' if sk in {'explicit_cost','implicit_cost','opportunity_cost_firm'} else 'profit-concepts'
    if o=='COP.2': return 'short-run-production'
    if o=='COP.3':
        if sk in {'average_fixed_cost','average_variable_cost','average_total_cost'}: return 'average-costs'
        if sk=='marginal_cost': return 'marginal-cost-production-linkages'
        return 'cost-components-schedules'
    if o=='COP.4':
        if sk in {'marginal_product_marginal_cost','marginal_cost'}: return 'marginal-cost-production-linkages'
        return 'short-run-cost-curves'
    if o=='COP.5':
        if sk in {'sunk_cost','avoidable_cost'}: return 'sunk-avoidable-costs'
        if sk in {'marginal_product_marginal_cost','marginal_cost'}: return 'marginal-cost-production-linkages'
        return 'short-run-cost-curves'
    if o=='COP.6':
        if sk in {'minimum_efficient_scale','constant_returns_to_scale'}: return 'minimum-efficient-scale'
        return 'long-run-average-cost-scale'
    raise RuntimeError(f"Unclassified {q.get('id')} objective={o} skill={sk}")

def iter_parent_records():
    for pool,arr in parent.get('questions',{}).items():
        for q in arr or []: yield pool,q
    for key,pool in [('repairQuestions','repair'),('bridgeQuestions','bridge'),('repairSeedQuestions','repairSeed')]:
        for q in parent.get(key,[]) or []: yield pool,q

# First classify the protected existing Costs family (442 records).
old_records=list(iter_parent_records())
assert len(old_records)==442
for pool,q in old_records:
    sid=classify(q); q['familyConceptId']=PARENT_ID; q['subtopicIds']=[sid]

# Add the 166 measured adaptive/backfill records.
existing_ids=set()
for cid,module in lib['concepts'].items():
    for arr in module.get('questions',{}).values():
        for q in arr or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
    for key in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
        for q in module.get(key,[]) or []: existing_ids.add(q.get('canonicalId') or q.get('id'))
for q in newqs:
    qid=q.get('canonicalId') or q.get('id')
    if qid in existing_ids: raise RuntimeError('duplicate '+qid)
    sid=(q.get('subtopicIds') or [None])[0]
    assert sid in SUBTOPICS and q.get('familyConceptId')==PARENT_ID
    pool=q['sourcePool']
    if pool in ('easy','medium','hard'):
        parent['questions'][pool].append(q)
    elif pool=='repair':
        parent.setdefault('repairQuestions',[]).append(q)
        parent.setdefault('microSkillRepairPools',{}).setdefault(q['primarySkill'],[]).append(qid)
    elif pool=='bridge':
        parent.setdefault('bridgeQuestions',[]).append(q)
        parent.setdefault('microSkillBridgePools',{}).setdefault(q['primarySkill'],[]).append(qid)
    else: raise RuntimeError(pool)

# Child selector stubs; composer-core derives their banks from parent metadata.
for sid,spec in SUBTOPICS.items():
    lib['concepts'][sid]={
        'schemaVersion':parent.get('schemaVersion','1.2.0'),'canonicalConceptId':sid,'title':spec['title'],'description':spec['description'],
        'derivedFromConceptId':PARENT_ID,'subtopicFilterId':sid,'familyConceptId':PARENT_ID,'assetConceptId':PARENT_ID,
        'standaloneRecommendation':spec['role']
    }

def all_records(): return list(iter_parent_records())
def child_records(sid): return [(p,q) for p,q in iter_parent_records() if sid in (q.get('subtopicIds') or [])]
def role_of(pool,q):
    if pool=='repair': return 'repair'
    if pool=='bridge': return 'bridge'
    if pool=='repairSeed': return 'repairSeed'
    role=q.get('instructionalRole')
    if role: return role
    if pool in ('elite','legendary','calculation','boss','legendaryBoss','integration'): return pool
    return 'main'
def runtime_counts(sid):
    c=Counter()
    for pool,q in child_records(sid):
        if pool in ('easy','medium','hard','elite','legendary'): c[pool]+=1
        elif pool in ('calculation','integration'):
            d=q.get('canonicalDifficulty') or q.get('difficulty') or 'hard'
            if d not in ('easy','medium','hard','elite','legendary'): d='hard'
            c[d]+=1
    return c

# Refresh parent registry + insert child entries.
oldreg=[e for e in lib['registry']['concepts'] if e.get('canonicalConceptId') not in SUBTOPICS]
regmap={e['canonicalConceptId']:e for e in oldreg}
pe=regmap[PARENT_ID]
pe['childConceptIds']=list(SUBTOPICS); pe['selectionRole']='family-parent'
pe['coverageStatusNote']=pe.get('coverageStatusNote','').rstrip()+ ' Costs now exposes ten granular Micro child selectors and adds only the measured Easy/Medium/Hard, Repair, and Bridge backfill needed for healthy adaptive use.'
# Parent counts after insertion
allqs=[q for _,q in all_records()]
roles=Counter(role_of(p,q) for p,q in all_records()); diffs=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in allqs)
for k in pe.get('questionCountByRole',{}): pe['questionCountByRole'][k]=roles[k]
for k in pe.get('questionCountByDifficulty',{}): pe['questionCountByDifficulty'][k]=diffs[k]
pe['repairCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='repair' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}
pe['bridgeCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='bridge' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}

child_entries=[]
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); qs=[q for _,q in recs]; roles=Counter(role_of(p,q) for p,q in recs); diffs=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in qs); runtime=runtime_counts(sid)
    supporting=spec['role']=='supporting-subtopic'; dfloor=5 if supporting else 10; sfloor=3 if supporting else 6
    repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs)
    quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    skills=sorted({q.get('primarySkill') or q.get('repairSkill') for q in qs if q.get('primarySkill') or q.get('repairSkill')})
    source_games=sorted({q.get('sourceGame') for q in qs if q.get('sourceGame')})
    child_entries.append({
        'canonicalConceptId':sid,'title':spec['title'],'description':spec['description'],'includedSkills':skills,
        'excludedNeighboringSkills':['Other Costs of Production material remains in the parent family or sibling subtopics.'],
        'prerequisiteConceptIds':['opportunity-cost','marginal-analysis'],'relatedConceptIds':spec['related'],'sourceChapters':pe.get('sourceChapters',[]),'sourceObjectives':spec['objectives'],'sourceGames':source_games or pe.get('sourceGames',[]),
        'questionCountByRole':{k:roles[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']},
        'questionCountByDifficulty':{k:diffs[k] for k in ['easy','medium','hard','elite','legendary','unknown']},
        'repairCoverage':{'directSkillMatches':repair,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'bridgeCoverage':{'directSkillMatches':bridge,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'calculationCoverage':sum(q.get('type')=='calculation' for q in qs),'graphCoverage':sum(bool(q.get('image')) for q in qs),'status':'active',
        'notes':'Derived Micro granularity slice of Costs of Production with targeted adaptive-depth/support backfill; protected pre-Phase-Micro4 question wording and answers remain unchanged.',
        'instructionalClassification':'Costs of Production subtopic','coverageStatus':'supporting-subtopic' if supporting else 'ready-focused-subtopic','coverageStatusLabel':'Best paired with another Costs topic' if supporting else 'Ready for focused use',
        'coverageStatusNote':f"Runtime adaptive depth: {runtime['easy']} Easy / {runtime['medium']} Medium / {runtime['hard']} Hard; floor {dfloor}/{dfloor}/{dfloor}. Adaptive support: {repair} Repair / {bridge} Bridge; floor {sfloor}/{sfloor}. Quiz-eligible ordinary/non-Legendary pool: {quiz}.",
        'coverageFloorVersion':PHASE,'parentConceptId':PARENT_ID,'selectionRole':'family-child','familyTitle':PARENT_TITLE,'standaloneRecommendation':spec['role'],
        'adaptiveDepthFloor':{'easy':dfloor,'medium':dfloor,'hard':dfloor},'runtimeAdaptiveCounts':{'easy':runtime['easy'],'medium':runtime['medium'],'hard':runtime['hard']},'adaptiveDepthStatus':'ready' if all(runtime[k]>=dfloor for k in ('easy','medium','hard')) else 'insufficient',
        'adaptiveSupportFloor':{'repair':sfloor,'bridge':sfloor},'adaptiveSupportCounts':{'repair':repair,'bridge':bridge},'adaptiveSupportStatus':'ready' if repair>=sfloor and bridge>=sfloor else 'insufficient','quizEligibleNonLegendary':quiz,'quiz15Status':'ready' if quiz>=15 else 'insufficient'
    })
out=[]
for e in oldreg:
    out.append(e)
    if e.get('canonicalConceptId')==PARENT_ID: out.extend(child_entries)
lib['registry']['concepts']=out

lib['composerVersion']=COMPOSER_VERSION
if not lib['libraryVersion'].endswith('-'+PHASE): lib['libraryVersion']+='-'+PHASE
lib['sourceCurationPhase']=PHASE; lib['sourceGeneratedAt']=GEN; lib['conceptCount']=len(lib['concepts']); lib['canonicalQuestionCount']=before_count+len(newqs)
lib['registry']['generatedAt']=GEN; lib['registry']['curationPhase']=PHASE; lib['registry']['curationSummary']='Costs of Production granularity and adaptive maturation: expose ten child selectors and add exactly 166 measured Easy/Medium/Hard, Repair, and Bridge questions. No Legendary, checkpoint, calculation, graph, or protected-question rewriting.'
lib['registry']['libraryVersion']=lib['libraryVersion']; lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']; lib['registry']['composerVersion']=COMPOSER_VERSION
blob=json.dumps({k:v for k,v in lib.items() if k!='librarySha256'},separators=(',',':'),ensure_ascii=False,sort_keys=True).encode(); lib['librarySha256']=hashlib.sha256(blob).hexdigest()
LIB.write_text(prefix+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
standalone=json.loads(json.dumps(lib['registry'])); standalone['librarySha256']=lib['librarySha256']; REG.write_text(json.dumps(standalone,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
MAN.write_text(json.dumps({'assetCount':len(lib.get('assetInventory',[])),'assets':lib.get('assetInventory',[]),'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

summary={'phase':PHASE,'composerVersion':COMPOSER_VERSION,'beforeCanonicalQuestionCount':before_count,'afterCanonicalQuestionCount':lib['canonicalQuestionCount'],'addedQuestions':len(newqs),'parentRecords':len(all_records()),'conceptCount':lib['conceptCount'],'librarySha256':lib['librarySha256'],'subtopics':{}}
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); r=runtime_counts(sid); supporting=spec['role']=='supporting-subtopic'; df=5 if supporting else 10; sf=3 if supporting else 6; repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs); quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    summary['subtopics'][sid]={'title':spec['title'],'role':spec['role'],'canonicalRecords':len(recs),'runtimeAdaptive':{k:r[k] for k in ('easy','medium','hard')},'adaptiveDepthFloor':df,'repair':repair,'bridge':bridge,'adaptiveSupportFloor':sf,'quizEligible':quiz,'pass':all(r[k]>=df for k in ('easy','medium','hard')) and repair>=sf and bridge>=sf and quiz>=15}
(ROOT/'phaseMicro4_costs_granularity_metadata_results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2,ensure_ascii=False))
