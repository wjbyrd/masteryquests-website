import json
from collections import Counter,defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
OUT=ROOT/'costs_granularity_adaptive_audit_results.json'
raw=LIB.read_text(encoding='utf-8').strip();p='window.MQ_COMPOSER_LIBRARY='
lib=json.loads(raw[len(p):].rstrip().rstrip(';'))
m=lib['concepts']['costs-of-production']

SUBS={
 'economic-costs':{'title':'Economic Costs: Explicit, Implicit & Opportunity Cost','role':'supporting','pair':'profit-concepts'},
 'profit-concepts':{'title':'Accounting, Economic & Normal Profit','role':'standalone/focused'},
 'short-run-production':{'title':'Short-Run Production & Diminishing Marginal Product','role':'standalone/focused'},
 'cost-components-schedules':{'title':'Cost Components & Cost Schedules','role':'standalone/focused'},
 'average-costs':{'title':'Average Costs: AFC, AVC & ATC','role':'standalone/focused'},
 'marginal-cost-production-linkages':{'title':'Marginal Cost & Production–Cost Linkages','role':'standalone/focused'},
 'short-run-cost-curves':{'title':'Short-Run Cost Curves: Relationships & Shifts','role':'standalone/focused'},
 'sunk-avoidable-costs':{'title':'Sunk & Avoidable Costs','role':'supporting','pair':'short-run-cost-curves'},
 'long-run-average-cost-scale':{'title':'LRAC, Economies & Diseconomies of Scale','role':'standalone/focused'},
 'minimum-efficient-scale':{'title':'Minimum Efficient Scale & Constant Returns to Scale','role':'supporting','pair':'long-run-average-cost-scale'},
}

def classify(q,pool):
    o=q.get('objective');sk=q.get('primarySkill')
    if o=='COP.1':
        return 'economic-costs' if sk in {'explicit_cost','implicit_cost','opportunity_cost_firm'} else 'profit-concepts'
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
        if sk=='marginal_product_marginal_cost': return 'marginal-cost-production-linkages'
        return 'short-run-cost-curves'
    if o=='COP.6':
        if sk in {'minimum_efficient_scale','constant_returns_to_scale'}: return 'minimum-efficient-scale'
        return 'long-run-average-cost-scale'
    raise RuntimeError(f"Unclassified {q.get('id')} objective={o} skill={sk}")

rows=[]
for pool,arr in m.get('questions',{}).items():
    for q in arr or []: rows.append((pool,q))
for q in m.get('repairQuestions',[]) or []: rows.append(('repair',q))
for q in m.get('bridgeQuestions',[]) or []: rows.append(('bridge',q))
for q in m.get('repairSeedQuestions',[]) or []: rows.append(('repairSeed',q))

by=defaultdict(list)
for pool,q in rows: by[classify(q,pool)].append((pool,q))
assert sum(len(v) for v in by.values())==len(rows)==442
ids=[]
for sid,items in by.items(): ids.extend(q.get('canonicalId') or q.get('id') for _,q in items)
assert len(ids)==len(set(ids))==442

result={'phase':'costs-of-production-granularity-adaptive-audit-v1','parentConceptId':'costs-of-production','parentCanonicalRecords':len(rows),'proposedSubtopicCount':len(SUBS),'subtopics':{},'estimatedBackfill':{'ordinaryAdaptiveDepth':0,'adaptiveSupport':0,'total':0}}
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
    result['subtopics'][sid]={**meta,'canonicalRecords':len(items),'poolCounts':dict(pools),'runtimeAdaptive':runtime,'adaptiveDepthFloor':depthfloor,'adaptiveDepthDeficit':depthDef,'adaptiveSupport':support,'adaptiveSupportFloor':supportfloor,'adaptiveSupportDeficit':supportDef,'quizEligibleNonLegendary':quiz,'quiz15ReadyNow':quiz>=15,'graphQuestions':sum(bool(q.get('image')) for _,q in items),'skills':dict(skills),'objectives':sorted({q.get('objective') for _,q in items if q.get('objective')})}
result['estimatedBackfill']['total']=result['estimatedBackfill']['ordinaryAdaptiveDepth']+result['estimatedBackfill']['adaptiveSupport']
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2,ensure_ascii=False))
