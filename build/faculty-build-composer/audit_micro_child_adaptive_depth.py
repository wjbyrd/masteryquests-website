import json, hashlib
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
raw=LIB.read_text(encoding='utf-8').strip()
prefix='window.MQ_COMPOSER_LIBRARY='
assert raw.startswith(prefix) and raw.endswith(';')
lib=json.loads(raw[len(prefix):-1])
PARENTS=['elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy']
CORE_FLOOR=10
SUPPORT_FLOOR=5
rows=[]
for parent_id in PARENTS:
    parent=lib['concepts'][parent_id]
    children=[(cid,m) for cid,m in lib['concepts'].items() if m.get('derivedFromConceptId')==parent_id]
    for cid,meta in children:
        runtime=Counter()
        rawp=Counter()
        total=0
        for pool,arr in parent.get('questions',{}).items():
            for q in arr or []:
                if cid not in (q.get('subtopicIds') or []): continue
                rawp[pool]+=1; total+=1
                if pool in ('easy','medium','hard','elite','legendary'):
                    runtime[pool]+=1
                elif pool in ('calculation','integration'):
                    target=q.get('canonicalDifficulty') or q.get('difficulty') or 'hard'
                    if target not in ('easy','medium','hard','elite','legendary'): target='hard'
                    runtime[target]+=1
        for poolkey,poolname in [('repairQuestions','repair'),('bridgeQuestions','bridge'),('repairSeedQuestions','repairSeed')]:
            for q in parent.get(poolkey,[]) or []:
                if cid in (q.get('subtopicIds') or []): rawp[poolname]+=1; total+=1
        supporting=meta.get('standaloneRecommendation')=='supporting-subtopic'
        floor=SUPPORT_FLOOR if supporting else CORE_FLOOR
        gaps={d:max(0,floor-runtime[d]) for d in ('easy','medium','hard')}
        rows.append({
            'parentConceptId':parent_id,'parentTitle':parent.get('title',parent_id),
            'subtopicId':cid,'title':meta.get('title',cid),
            'classification':'supporting' if supporting else 'standalone/focused',
            'floorPerAdaptiveTier':floor,
            'runtimeAdaptiveCounts':{d:runtime[d] for d in ('easy','medium','hard')},
            'elite':runtime['elite'],'legendary':runtime['legendary'],
            'rawCalculation':rawp['calculation'],'repair':rawp['repair'],'bridge':rawp['bridge'],
            'totalRecords':total,'gaps':gaps,'questionsToAdd':sum(gaps.values())
        })

out={'phase':'micro-child-adaptive-depth-audit-v1','composerVersion':lib['composerVersion'],
     'canonicalQuestionCountBefore':lib['canonicalQuestionCount'],
     'rule':{
       'standaloneOrFocusedFloor':'10 runtime Easy + 10 Medium + 10 Hard',
       'supportingFloor':'5 runtime Easy + 5 Medium + 5 Hard',
       'rationale':'Exam/Timed allocate approximately ten base rooms per difficulty tier and getAdaptiveQuestion suppresses the last ten IDs. Supporting selectors are intended to be combined, so a 5-per-tier floor lets two paired supporting topics contribute at least ten per tier.'
     },
     'rows':rows,
     'familyGapTotals':{},'totalQuestionsToAdd':sum(r['questionsToAdd'] for r in rows)}
for p in PARENTS:
    out['familyGapTotals'][p]=sum(r['questionsToAdd'] for r in rows if r['parentConceptId']==p)
(ROOT/'micro_child_adaptive_depth_audit_results.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

lines=[]
lines += ['# Micro Child-Concept Adaptive Depth Audit','',
          '## New adaptive-depth rule','',
          '- **Standalone/focused child concepts:** minimum **10 runtime Easy + 10 Medium + 10 Hard** questions.',
          '- **Supporting child concepts:** minimum **5 runtime Easy + 5 Medium + 5 runtime Hard** questions.',
          '- Runtime counts include `calculation`/`integration` records after Composer routes them into their canonical difficulty pools.',
          '- The 10-question core floor is engine-driven: Exam/Timed use roughly ten base rooms per tier and `getAdaptiveQuestion()` suppresses the last ten IDs. A pool below ten forces early reuse.',
          '- Supporting selectors are intentionally paired; a 5-per-tier floor allows two supporting topics to contribute at least ten adaptive questions per tier together.','',
          '## Retrospective results','']
for p in PARENTS:
    fam=[r for r in rows if r['parentConceptId']==p]
    lines += [f"### {fam[0]['parentTitle']}",'', '| Child concept | Role | Runtime E | Runtime M | Runtime H | Backfill E | Backfill M | Backfill H | Add |',
              '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
    for r in fam:
        c=r['runtimeAdaptiveCounts']; g=r['gaps']
        lines.append(f"| {r['title']} | {r['classification']} | {c['easy']} | {c['medium']} | {c['hard']} | {g['easy']} | {g['medium']} | {g['hard']} | **{r['questionsToAdd']}** |")
    lines += ['',f"**Family adaptive backfill: {sum(r['questionsToAdd'] for r in fam)} questions.**",'']
lines += ['## Backfill scope','',
          f"The three already-granularized families need **{out['totalQuestionsToAdd']}** targeted adaptive questions under this rule:",
          f"- Elasticity: **{out['familyGapTotals']['elasticity']}**",
          f"- Consumer and Producer Surplus: **{out['familyGapTotals']['consumer-and-producer-surplus']}**",
          f"- International Trade and Trade Policy: **{out['familyGapTotals']['international-trade-and-trade-policy']}**",'',
          'No Legendary, checkpoint, repair, bridge, calculation, or graph expansion is justified by this audit. The deficit is specifically in the ordinary adaptive Easy/Medium/Hard spine.','',
          '## Rule for Costs of Production and remaining Micro families','',
          'Every future granularity audit must report both total child-bank depth and **runtime adaptive depth after calculation/integration routing**. Taxonomy wiring is not closed until each child either meets its applicable adaptive floor or is explicitly classified as supporting and paired.','']
(ROOT/'MICRO_ADAPTIVE_DEPTH_BACKFILL_AUDIT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'familyGapTotals':out['familyGapTotals'],'totalQuestionsToAdd':out['totalQuestionsToAdd']},indent=2))
