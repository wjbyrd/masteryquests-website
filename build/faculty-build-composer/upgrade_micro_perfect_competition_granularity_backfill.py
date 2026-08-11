import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'; REG=ROOT/'data/composer_registry.json'; MAN=ROOT/'data/composer_library_manifest.json'
QFILE=ROOT/'phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro5-perfect-competition-granularity-adaptive-backfill-v1'; GEN='2026-08-11T01:50:00.000Z'; COMPOSER_VERSION='4.5l.0'
PARENT_ID='perfect-competition'; PARENT_TITLE='Perfect Competition'

raw=LIB.read_text(encoding='utf-8').strip(); prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1]); parent=lib['concepts'][PARENT_ID]; before_count=lib['canonicalQuestionCount']
newqs=json.loads(QFILE.read_text(encoding='utf-8'))['questions']

SUBTOPICS={
'competitive-market-price-taking-revenue':{'title':'Market Structure, Price Taking & Firm Revenue','description':'Connect competitive-market assumptions to price taking, the horizontal firm demand curve, and P = AR = MR.','role':'standalone-ready','objectives':['PC.1','PC.2'],'related':['market-equilibrium','marginal-analysis']},
'competitive-output-choice':{'title':'Profit-Maximizing Output & the MR = MC Rule','description':'Choose the firm’s profit-maximizing or loss-minimizing output using marginal revenue, marginal cost, and the rising-MC condition.','role':'standalone-ready','objectives':['PC.3'],'related':['marginal-analysis','competitive-market-price-taking-revenue']},
'competitive-profit-loss':{'title':'Profit, Loss & Break-Even','description':'Measure per-unit and total economic profit or loss and interpret break-even and zero economic profit.','role':'standalone-ready','objectives':['PC.4'],'related':['profit-concepts','average-costs','competitive-shutdown']},
'competitive-shutdown':{'title':'Shutdown & Short-Run Loss Minimization','description':'Apply the AVC shutdown rule, explain producing at a loss, and distinguish temporary shutdown from long-run exit.','role':'standalone-ready','objectives':['PC.4'],'related':['sunk-avoidable-costs','competitive-profit-loss','competitive-entry-exit-long-run']},
'competitive-short-run-supply':{'title':'Short-Run Supply & Cost Shifts','description':'Derive the firm’s short-run supply from rising MC above AVC, aggregate firm supply, and distinguish fixed- from variable-cost shifts.','role':'standalone-ready','objectives':['PC.5'],'related':['marginal-cost-production-linkages','market-equilibrium','competitive-output-choice']},
'competitive-entry-exit-long-run':{'title':'Entry, Exit & Long-Run Equilibrium','description':'Trace entry, exit, zero economic profit, normal profit, and long-run competitive adjustment.','role':'standalone-ready','objectives':['PC.6'],'related':['profit-concepts','market-equilibrium','competitive-industry-cost-conditions']},
'competitive-industry-cost-conditions':{'title':'Long-Run Industry Supply & Cost Conditions','description':'Distinguish constant-, increasing-, and decreasing-cost industries and compare short-run and long-run responses to demand changes.','role':'supporting-subtopic','objectives':['PC.6'],'related':['competitive-entry-exit-long-run','long-run-average-cost-scale']},
'competitive-efficiency-limits':{'title':'Competitive Efficiency & Model Limits','description':'Interpret allocative and productive efficiency and evaluate the perfect-competition benchmark and its limitations.','role':'supporting-subtopic','objectives':['PC.6'],'related':['consumer-and-producer-surplus','competitive-entry-exit-long-run']},
}

PROFIT_LOSS={'total_profit','break_even','profit_per_unit','zero_economic_profit','loss_per_unit','total_loss','integrated_competitive_firm_analysis'}
SHUTDOWN={'produce_at_loss','shutdown_rule','shutdown_price','short_run_fixed_cost','shutdown_vs_exit'}
ENTRY_EXIT={'entry','exit','zero_economic_profit','normal_profit','long_run_equilibrium','integrated_competitive_firm_analysis','long_run_adjustment','shutdown_vs_exit','short_run_fixed_cost'}
COST_COND={'constant_cost_industry','increasing_cost_industry','decreasing_cost_industry','demand_change_short_long_run'}
EFF={'productive_efficiency','allocative_efficiency','model_limitations','competitive_welfare'}

def classify(q):
    o=q.get('objective'); sk=q.get('primarySkill') or q.get('repairSkill')
    if o in ('PC.1','PC.2'): return 'competitive-market-price-taking-revenue'
    if o=='PC.3': return 'competitive-output-choice'
    if o=='PC.4':
        if sk in PROFIT_LOSS: return 'competitive-profit-loss'
        if sk in SHUTDOWN: return 'competitive-shutdown'
    if o=='PC.5': return 'competitive-short-run-supply'
    if o=='PC.6':
        if sk in ENTRY_EXIT: return 'competitive-entry-exit-long-run'
        if sk in COST_COND: return 'competitive-industry-cost-conditions'
        if sk in EFF: return 'competitive-efficiency-limits'
    raise RuntimeError(f"Unclassified {q.get('id')} objective={o} skill={sk}")

def iter_parent_records():
    for pool,arr in parent.get('questions',{}).items():
        for q in arr or []: yield pool,q
    for key,pool in [('repairQuestions','repair'),('bridgeQuestions','bridge'),('repairSeedQuestions','repairSeed')]:
        for q in parent.get(key,[]) or []: yield pool,q

old_records=list(iter_parent_records())
assert len(old_records)==454,len(old_records)
for pool,q in old_records:
    sid=classify(q); q['familyConceptId']=PARENT_ID; q['subtopicIds']=[sid]

# Global uniqueness check before insertion.
existing_ids=set()
for cid,module in lib['concepts'].items():
    if module.get('derivedFromConceptId'): continue
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

# Child selector stubs; composer-core derives physical banks from parent taxonomy metadata.
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

oldreg=[e for e in lib['registry']['concepts'] if e.get('canonicalConceptId') not in SUBTOPICS]
regmap={e['canonicalConceptId']:e for e in oldreg}; pe=regmap[PARENT_ID]
pe['childConceptIds']=list(SUBTOPICS); pe['selectionRole']='family-parent'
pe['coverageStatusNote']=pe.get('coverageStatusNote','').rstrip()+ ' Perfect Competition now exposes eight granular Micro child selectors and adds only the measured Easy/Medium/Hard, Repair, and Bridge backfill required for healthy adaptive use.'
allqs=[q for _,q in all_records()]; roles=Counter(role_of(p,q) for p,q in all_records()); diffs=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in allqs)
for k in pe.get('questionCountByRole',{}): pe['questionCountByRole'][k]=roles[k]
for k in pe.get('questionCountByDifficulty',{}): pe['questionCountByDifficulty'][k]=diffs[k]
pe['repairCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='repair' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}
pe['bridgeCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='bridge' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}

child_entries=[]
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); qs=[q for _,q in recs]; roles=Counter(role_of(p,q) for p,q in recs); diffs=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in qs); runtime=runtime_counts(sid)
    supporting=spec['role']=='supporting-subtopic'; dfloor=5 if supporting else 10; sfloor=3 if supporting else 6
    repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs); quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    skills=sorted({q.get('primarySkill') or q.get('repairSkill') for q in qs if q.get('primarySkill') or q.get('repairSkill')}); source_games=sorted({q.get('sourceGame') for q in qs if q.get('sourceGame')})
    child_entries.append({
        'canonicalConceptId':sid,'title':spec['title'],'description':spec['description'],'includedSkills':skills,
        'excludedNeighboringSkills':['Other Perfect Competition material remains in the parent family or sibling subtopics.'],
        'prerequisiteConceptIds':['costs-of-production','market-equilibrium','marginal-analysis'],'relatedConceptIds':spec['related'],'sourceChapters':pe.get('sourceChapters',[]),'sourceObjectives':spec['objectives'],'sourceGames':source_games or pe.get('sourceGames',[]),
        'questionCountByRole':{k:roles[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']},
        'questionCountByDifficulty':{k:diffs[k] for k in ['easy','medium','hard','elite','legendary','unknown']},
        'repairCoverage':{'directSkillMatches':repair,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'bridgeCoverage':{'directSkillMatches':bridge,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'calculationCoverage':sum(q.get('type')=='calculation' for q in qs),'graphCoverage':sum(bool(q.get('image')) for q in qs),'status':'active',
        'notes':'Derived Micro granularity slice of Perfect Competition with targeted adaptive-depth/support backfill; protected pre-Phase-Micro5 question wording and answers remain unchanged.',
        'instructionalClassification':'Perfect Competition subtopic','coverageStatus':'supporting-subtopic' if supporting else 'ready-focused-subtopic','coverageStatusLabel':'Best paired with another Perfect Competition topic' if supporting else 'Ready for focused use',
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
lib['registry']['generatedAt']=GEN; lib['registry']['curationPhase']=PHASE; lib['registry']['curationSummary']='Perfect Competition granularity and adaptive maturation: expose eight child selectors and add exactly 111 measured Easy/Medium/Hard, Repair, and Bridge questions. No Legendary, checkpoint, calculation, graph, or protected-question rewriting.'
lib['registry']['libraryVersion']=lib['libraryVersion']; lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']; lib['registry']['composerVersion']=COMPOSER_VERSION
blob=json.dumps({k:v for k,v in lib.items() if k!='librarySha256'},separators=(',',':'),ensure_ascii=False,sort_keys=True).encode(); lib['librarySha256']=hashlib.sha256(blob).hexdigest()
LIB.write_text(prefix+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
standalone=json.loads(json.dumps(lib['registry'])); standalone['librarySha256']=lib['librarySha256']; REG.write_text(json.dumps(standalone,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
MAN.write_text(json.dumps({'assetCount':len(lib.get('assetInventory',[])),'assets':lib.get('assetInventory',[]),'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

summary={'phase':PHASE,'composerVersion':COMPOSER_VERSION,'beforeCanonicalQuestionCount':before_count,'afterCanonicalQuestionCount':lib['canonicalQuestionCount'],'addedQuestions':len(newqs),'parentRecords':len(all_records()),'conceptCount':lib['conceptCount'],'librarySha256':lib['librarySha256'],'subtopics':{}}
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); r=runtime_counts(sid); supporting=spec['role']=='supporting-subtopic'; df=5 if supporting else 10; sf=3 if supporting else 6; repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs); quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    summary['subtopics'][sid]={'title':spec['title'],'role':spec['role'],'canonicalRecords':len(recs),'runtimeAdaptive':{k:r[k] for k in ('easy','medium','hard')},'adaptiveDepthFloor':df,'repair':repair,'bridge':bridge,'adaptiveSupportFloor':sf,'quizEligible':quiz,'pass':all(r[k]>=df for k in ('easy','medium','hard')) and repair>=sf and bridge>=sf and quiz>=15}
(ROOT/'phaseMicro5_perfect_competition_granularity_metadata_results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2,ensure_ascii=False))
