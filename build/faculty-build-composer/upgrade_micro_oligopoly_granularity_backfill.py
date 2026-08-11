import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'; REG=ROOT/'data/composer_registry.json'; MAN=ROOT/'data/composer_library_manifest.json'
QFILE=ROOT/'phaseMicro8-oligopoly-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro8-oligopoly-granularity-adaptive-backfill-v1'; GEN='2026-08-11T03:40:00.000Z'; COMPOSER_VERSION='4.5o.0'
PARENT_ID='oligopoly'; PARENT_TITLE='Oligopoly'

raw=LIB.read_text(encoding='utf-8').strip(); prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1]); parent=lib['concepts'][PARENT_ID]; before_count=lib['canonicalQuestionCount']
newqs=json.loads(QFILE.read_text(encoding='utf-8'))['questions']

SUBTOPICS={
'oligopoly-structure-concentration':{
 'title':'Oligopoly Structure, Strategic Interdependence & Concentration',
 'description':'Identify oligopoly, strategic interdependence, barriers to entry, relevant-market definition, concentration ratios, HHI, and what concentration measures do and do not establish.',
 'role':'standalone-ready','objectives':['OLI.1'],
 'related':['perfect-competition','monopoly','monopolistic-competition','oligopoly-welfare-policy']},
'oligopoly-game-theory-foundations':{
 'title':'Game Theory Foundations: Payoff Matrices, Best Responses & Nash Equilibrium',
 'description':'Read payoff matrices and analyze players, strategies, payoffs, conditional best responses, dominant strategies, pure-strategy Nash equilibrium, and cooperative versus noncooperative outcomes.',
 'role':'standalone-ready','objectives':['OLI.2'],
 'related':['oligopoly-collusion-cartels','oligopoly-dynamic-strategy','strategic-interdependence']},
'oligopoly-collusion-cartels':{
 'title':'Collusion, Cartels & Prisoner’s-Dilemma Incentives',
 'description':'Analyze collusion, cartel output and price, joint-profit maximization, incentives to cheat, monitoring, cartel instability, prisoner’s-dilemma logic, and cartel welfare.',
 'role':'standalone-ready','objectives':['OLI.3'],
 'related':['oligopoly-game-theory-foundations','oligopoly-welfare-policy','consumer-and-producer-surplus']},
'oligopoly-dynamic-strategy':{
 'title':'Dynamic Strategy: Repeated Games, Credibility & Entry Deterrence',
 'description':'Optional advanced Oligopoly material on repeated interaction, credibility, commitments, limit pricing, entry deterrence, continuation incentives, and sequential strategic reasoning.',
 'role':'supporting-advanced','objectives':['OLI.4','OLI.5'],
 'related':['oligopoly-game-theory-foundations','oligopoly-rivalry-coordination','barriers-to-entry-oligopoly']},
'oligopoly-rivalry-coordination':{
 'title':'Tacit Coordination, Price Leadership & Nonprice Competition',
 'description':'Analyze tacit coordination, price leadership, price wars, nonprice competition, kinked-demand reasoning, and why parallel behavior does not by itself prove explicit collusion.',
 'role':'supporting-subtopic','objectives':['OLI.4','OLI.5'],
 'related':['oligopoly-structure-concentration','oligopoly-collusion-cartels','monopolistic-competition']},
'oligopoly-welfare-policy':{
 'title':'Oligopoly Welfare, Mergers & Antitrust Tradeoffs',
 'description':'Evaluate cartel welfare, concentration limits, merger concentration, efficiencies, innovation tradeoffs, entry constraints, model limitations, and stable Principles-level antitrust reasoning.',
 'role':'standalone-ready','objectives':['OLI.6'],
 'related':['consumer-and-producer-surplus','oligopoly-structure-concentration','oligopoly-collusion-cartels']},
}
DYNAMIC={'repeated_games','credible_threat','credible_commitment','entry_deterrence','limit_pricing'}
RIVALRY={'tacit_coordination','price_leadership','price_war','explicit_collusion','nonprice_competition','kinked_demand'}

def classify(q):
    o=q.get('objective'); sk=q.get('primarySkill') or q.get('repairSkill')
    if o=='OLI.1': return 'oligopoly-structure-concentration'
    if o=='OLI.2': return 'oligopoly-game-theory-foundations'
    if o=='OLI.3': return 'oligopoly-collusion-cartels'
    if o in ('OLI.4','OLI.5'):
        if sk in DYNAMIC: return 'oligopoly-dynamic-strategy'
        if sk in RIVALRY: return 'oligopoly-rivalry-coordination'
    if o=='OLI.6': return 'oligopoly-welfare-policy'
    raise RuntimeError(f"Unclassified {q.get('id')} objective={o} skill={sk}")

def iter_parent_records():
    for pool,arr in parent.get('questions',{}).items():
        for q in arr or []: yield pool,q
    for key,pool in [('repairQuestions','repair'),('bridgeQuestions','bridge'),('repairSeedQuestions','repairSeed')]:
        for q in parent.get(key,[]) or []: yield pool,q

old_records=list(iter_parent_records())
assert len(old_records)==370,len(old_records)
for pool,q in old_records:
    sid=classify(q); q['familyConceptId']=PARENT_ID; q['subtopicIds']=[sid]

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

def is_supporting(spec): return str(spec['role']).startswith('supporting')

oldreg=[e for e in lib['registry']['concepts'] if e.get('canonicalConceptId') not in SUBTOPICS]
regmap={e['canonicalConceptId']:e for e in oldreg}; pe=regmap[PARENT_ID]
pe['childConceptIds']=list(SUBTOPICS); pe['selectionRole']='family-parent'
pe['coverageStatusNote']=pe.get('coverageStatusNote','').rstrip()+ ' Oligopoly now exposes six granular Micro child selectors; higher-end repeated-game and sequential-strategy material is isolated in an optional supporting/advanced child. Exactly the measured Easy/Medium/Hard, Repair, and Bridge backfill was added for healthy adaptive use.'
allqs=[q for _,q in all_records()]; roles=Counter(role_of(p,q) for p,q in all_records()); diffs=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in allqs)
for k in pe.get('questionCountByRole',{}): pe['questionCountByRole'][k]=roles[k]
for k in pe.get('questionCountByDifficulty',{}): pe['questionCountByDifficulty'][k]=diffs[k]
pe['repairCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='repair' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}
pe['bridgeCoverage']={'directSkillMatches':sum(1 for p,q in all_records() if p=='bridge' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for p,q in all_records() if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))}

child_entries=[]
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); qs2=[q for _,q in recs]; roles2=Counter(role_of(p,q) for p,q in recs); diffs2=Counter(q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown' for q in qs2); runtime=runtime_counts(sid)
    supporting=is_supporting(spec); dfloor=5 if supporting else 10; sfloor=3 if supporting else 6
    repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs); quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    skills=sorted({q.get('primarySkill') or q.get('repairSkill') for q in qs2 if q.get('primarySkill') or q.get('repairSkill')}); source_games=sorted({q.get('sourceGame') for q in qs2 if q.get('sourceGame')})
    advanced=sid=='oligopoly-dynamic-strategy'
    child_entries.append({
        'canonicalConceptId':sid,'title':spec['title'],'description':spec['description'],'includedSkills':skills,
        'excludedNeighboringSkills':['Other Oligopoly material remains in the parent family or sibling subtopics.'] + ([
            'Formal Cournot, Bertrand, Stackelberg, mixed-strategy, Bayesian, and advanced repeated-game proofs remain outside this Principles bank.'
        ] if advanced else []),
        'prerequisiteConceptIds':['perfect-competition','monopoly','monopolistic-competition','costs-of-production','elasticity'],'relatedConceptIds':spec['related'],'sourceChapters':pe.get('sourceChapters',[]),'sourceObjectives':spec['objectives'],'sourceGames':source_games or pe.get('sourceGames',[]),
        'questionCountByRole':{k:roles2[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']},
        'questionCountByDifficulty':{k:diffs2[k] for k in ['easy','medium','hard','elite','legendary','unknown']},
        'repairCoverage':{'directSkillMatches':repair,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'bridgeCoverage':{'directSkillMatches':bridge,'mainWithUsableSkill':sum(1 for p,q in recs if p not in ('repair','bridge','repairSeed') and q.get('primarySkill'))},
        'calculationCoverage':sum(q.get('type')=='calculation' for q in qs2),'graphCoverage':sum(bool(q.get('image')) for q in qs2),'status':'active',
        'notes':'Derived Micro granularity slice of Oligopoly with targeted adaptive-depth/support backfill; protected pre-Phase-Micro8 question wording and answers remain unchanged.' + (' This child intentionally isolates optional higher-end dynamic game theory from core Principles Oligopoly.' if advanced else ''),
        'instructionalClassification':'Oligopoly subtopic' + (' · optional advanced' if advanced else ''),
        'coverageStatus':'supporting-advanced' if advanced else ('supporting-subtopic' if supporting else 'ready-focused-subtopic'),
        'coverageStatusLabel':'Optional advanced / best paired' if advanced else ('Best paired with another Oligopoly topic' if supporting else 'Ready for focused use'),
        'coverageStatusNote':f"Runtime adaptive depth: {runtime['easy']} Easy / {runtime['medium']} Medium / {runtime['hard']} Hard; floor {dfloor}/{dfloor}/{dfloor}. Adaptive support: {repair} Repair / {bridge} Bridge; floor {sfloor}/{sfloor}. Quiz-eligible ordinary/non-Legendary pool: {quiz}." + (' Advanced child contains optional repeated-game/sequential-strategy material and is excluded from future Oligopoly Core presets unless explicitly selected.' if advanced else ''),
        'coverageFloorVersion':PHASE,'parentConceptId':PARENT_ID,'selectionRole':'family-child','familyTitle':PARENT_TITLE,'standaloneRecommendation':spec['role'],'advancedOptional':advanced,
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
lib['registry']['generatedAt']=GEN; lib['registry']['curationPhase']=PHASE; lib['registry']['curationSummary']='Oligopoly granularity and adaptive maturation: expose six child selectors, isolate optional higher-end dynamic game theory, and add exactly 75 measured Easy/Medium/Hard, Repair, and Bridge questions. No Elite, Legendary, checkpoint, calculation, graph, or protected-question rewriting.'
lib['registry']['libraryVersion']=lib['libraryVersion']; lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']; lib['registry']['composerVersion']=COMPOSER_VERSION
blob=json.dumps({k:v for k,v in lib.items() if k!='librarySha256'},separators=(',',':'),ensure_ascii=False,sort_keys=True).encode(); lib['librarySha256']=hashlib.sha256(blob).hexdigest()
LIB.write_text(prefix+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
standalone=json.loads(json.dumps(lib['registry'])); standalone['librarySha256']=lib['librarySha256']; REG.write_text(json.dumps(standalone,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
MAN.write_text(json.dumps({'assetCount':len(lib.get('assetInventory',[])),'assets':lib.get('assetInventory',[]),'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
core=ROOT/'composer-core.js'; txt=core.read_text(encoding='utf-8'); txt=txt.replace("const COMPOSER_VERSION = '4.5n.0';", "const COMPOSER_VERSION = '4.5o.0';"); core.write_text(txt,encoding='utf-8')
# Generalize supporting-child explanatory copy so supporting/advanced gets the same warning.
ui=ROOT/'composer.js'; utxt=ui.read_text(encoding='utf-8'); utxt=utxt.replace("concept.standaloneRecommendation === 'supporting-subtopic'", "String(concept.standaloneRecommendation || '').startsWith('supporting')"); ui.write_text(utxt,encoding='utf-8')

summary={'phase':PHASE,'composerVersion':COMPOSER_VERSION,'beforeCanonicalQuestionCount':before_count,'afterCanonicalQuestionCount':lib['canonicalQuestionCount'],'addedQuestions':len(newqs),'parentRecords':len(all_records()),'conceptCount':lib['conceptCount'],'librarySha256':lib['librarySha256'],'subtopics':{}}
for sid,spec in SUBTOPICS.items():
    recs=child_records(sid); r=runtime_counts(sid); supporting=is_supporting(spec); df=5 if supporting else 10; sf=3 if supporting else 6; repair=sum(p=='repair' for p,q in recs); bridge=sum(p=='bridge' for p,q in recs); quiz=sum(p in ('easy','medium','hard','elite','calculation') for p,q in recs)
    summary['subtopics'][sid]={'title':spec['title'],'role':spec['role'],'canonicalRecords':len(recs),'runtimeAdaptive':{k:r[k] for k in ('easy','medium','hard')},'adaptiveDepthFloor':df,'repair':repair,'bridge':bridge,'adaptiveSupportFloor':sf,'quizEligible':quiz,'advancedOptional':sid=='oligopoly-dynamic-strategy','pass':all(r[k]>=df for k in ('easy','medium','hard')) and repair>=sf and bridge>=sf and quiz>=15}
(ROOT/'phaseMicro8_oligopoly_granularity_metadata_results.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2,ensure_ascii=False))
