import json
from collections import Counter,defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
OUT=Path('/mnt/data/phaseMicro6_monopoly_granularity_audit_results.json')
raw=LIB.read_text(encoding='utf-8').strip(); p='window.MQ_COMPOSER_LIBRARY='
lib=json.loads(raw[len(p):].rstrip().rstrip(';'))
m=lib['concepts']['monopoly']

SUBS={
 'monopoly-power-barriers':{'title':'Monopoly Power, Barriers to Entry & Sources of Monopoly','role':'supporting','pair':'monopoly-demand-revenue'},
 'monopoly-demand-revenue':{'title':'Monopoly Demand, Revenue & Marginal Revenue','role':'standalone/focused'},
 'monopoly-output-price':{'title':'Profit-Maximizing Output & Monopoly Price','role':'standalone/focused'},
 'monopoly-profit-loss-shutdown':{'title':'Monopoly Profit, Loss & Shutdown','role':'standalone/focused'},
 'monopoly-welfare-efficiency':{'title':'Monopoly Welfare, Efficiency & Competitive Comparison','role':'standalone/focused'},
 'natural-monopoly-regulation':{'title':'Natural Monopoly & Regulation','role':'standalone/focused'},
 'monopoly-price-discrimination':{'title':'Price Discrimination','role':'standalone/focused'},
}
REG={'marginal_cost_regulation','average_cost_regulation','regulatory_tradeoff','price_cap_regulation','natural_monopoly_cost','monopoly_policy_evaluation'}
PD={'third_degree_price_discrimination','first_degree_price_discrimination','price_discrimination_welfare','price_discrimination_conditions','resale_prevention'}

def classify(q,pool):
    o=q.get('objective'); sk=q.get('primarySkill')
    if o=='MON.1': return 'monopoly-power-barriers'
    if o=='MON.2': return 'monopoly-demand-revenue'
    if o=='MON.3': return 'monopoly-output-price'
    if o=='MON.4': return 'monopoly-profit-loss-shutdown'
    if o=='MON.5': return 'monopoly-welfare-efficiency'
    if o=='MON.6':
        if sk in REG: return 'natural-monopoly-regulation'
        if sk in PD: return 'monopoly-price-discrimination'
    raise RuntimeError(f"Unclassified {q.get('id')} objective={o} skill={sk}")

rows=[]
for pool,arr in m.get('questions',{}).items():
    for q in arr or []: rows.append((pool,q))
for q in m.get('repairQuestions',[]) or []: rows.append(('repair',q))
for q in m.get('bridgeQuestions',[]) or []: rows.append(('bridge',q))
for q in m.get('repairSeedQuestions',[]) or []: rows.append(('repairSeed',q))
by=defaultdict(list)
for pool,q in rows: by[classify(q,pool)].append((pool,q))
assert sum(len(v) for v in by.values())==len(rows)==430
ids=[]
for items in by.values(): ids.extend(q.get('canonicalId') or q.get('id') for _,q in items)
assert len(ids)==len(set(ids))==430

result={
 'phase':'monopoly-granularity-adaptive-audit-v1',
 'parentConceptId':'monopoly',
 'composerVersion':lib.get('composerVersion'),
 'globalCanonicalQuestions':lib.get('canonicalQuestionCount'),
 'parentCanonicalRecords':len(rows),
 'parentGraphQuestions':sum(bool(q.get('image')) for _,q in rows),
 'proposedSubtopicCount':len(SUBS),
 'subtopics':{},
 'estimatedBackfill':{'ordinaryAdaptiveDepth':0,'adaptiveSupport':0,'total':0},
}
for sid,meta in SUBS.items():
    items=by[sid]; pools=Counter(pool for pool,_ in items); skills=Counter(q.get('primarySkill') for _,q in items)
    runtime={k:pools[k] for k in ('easy','medium','hard')}
    for pool,q in items:
        if pool in ('calculation','integration'):
            d=q.get('canonicalDifficulty') or q.get('difficulty') or 'hard'
            if d in runtime: runtime[d]+=1
    support={'repair':pools['repair'],'bridge':pools['bridge']}
    quiz=sum(pools[k] for k in ('easy','medium','hard','elite','calculation'))
    supporting=meta['role']=='supporting'; depthfloor=5 if supporting else 10; supportfloor=3 if supporting else 6
    depthDef={k:max(0,depthfloor-runtime[k]) for k in ('easy','medium','hard')}
    supportDef={k:max(0,supportfloor-support[k]) for k in ('repair','bridge')}
    result['estimatedBackfill']['ordinaryAdaptiveDepth']+=sum(depthDef.values())
    result['estimatedBackfill']['adaptiveSupport']+=sum(supportDef.values())
    result['subtopics'][sid]={**meta,'canonicalRecords':len(items),'poolCounts':dict(pools),'runtimeAdaptive':runtime,'adaptiveDepthFloor':depthfloor,'adaptiveDepthDeficit':depthDef,'adaptiveSupport':support,'adaptiveSupportFloor':supportfloor,'adaptiveSupportDeficit':supportDef,'quizEligibleNonLegendary':quiz,'quiz15ReadyNow':quiz>=15,'projectedQuizEligibleAfterFill':quiz+sum(depthDef.values()),'graphQuestions':sum(bool(q.get('image')) for _,q in items),'skills':dict(skills),'objectives':sorted({q.get('objective') for _,q in items if q.get('objective')})}
result['estimatedBackfill']['total']=result['estimatedBackfill']['ordinaryAdaptiveDepth']+result['estimatedBackfill']['adaptiveSupport']
result['projectedParentRecordsAfterFill']=len(rows)+result['estimatedBackfill']['total']
result['projectedGlobalCanonicalQuestionsAfterFill']=lib.get('canonicalQuestionCount')+result['estimatedBackfill']['total']
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2,ensure_ascii=False))
