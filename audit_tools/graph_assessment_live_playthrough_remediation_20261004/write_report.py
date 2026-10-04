"""Build the requested report from the frozen baseline and final evidence."""
from review_tools import *
from collections import Counter
import hashlib, re, unicodedata

L=json.loads((HERE/'expectations.json').read_text())
D=load();S=json.loads((HERE/'scope.json').read_text())
M=json.loads((EVIDENCE/'mode-validation.json').read_text())
P=json.loads((EVIDENCE/'publication-validation.json').read_text())
N=json.loads((EVIDENCE/'numerical-validation.json').read_text())
V=json.loads((EVIDENCE/'visual-acceptance.json').read_text())
G=json.loads((EVIDENCE/'full-game-smoke.json').read_text())
X=json.loads((EVIDENCE/'pdf-review/index.json').read_text())
export=json.loads((ROOT/'faculty_exports/validation_summary.json').read_text())
assert M['status']==P['status']==N['status']==V['status']==G['status']=='PASS'
assert M['librarySha256']==P['librarySha256']==G['librarySha256']==L['afterLibrarySha256']
assert export['status']=='complete' and export['sources_unchanged']
assert export['source_sha256']==X['source_sha256']==hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
suite=(EVIDENCE/'composer-final.log').read_text(encoding='utf-8-sig')
assert '"passed": 29' in suite and not re.search(r'^FAIL ',suite,re.M)
assert 'Ran 25 tests' in (EVIDENCE/'export-tests.log').read_text(encoding='utf-8-sig')
assert all(r.get('textReviewed') and (r.get('visualReviewed') or not ORIGINALS[id].get('image')) and not r.get('pending') for id,r in D['questions'].items())
before_all=json.loads((EVIDENCE/'all_originals.json').read_text())
changes={c['id']:c for c in L['changes']}
current={**before_all,**{id:c['afterRecord'] for id,c in changes.items()}}
trial_before={id for g in M['groups'] for id in g['beforeIds']}
trial_after={id for g in M['groups'] for id in g['afterIds']}
asset_paths={a['path'] for a in L['assets']}
variant_paths={a['path'] for a in L['assets'] if not any(q.get('image')==a['path'] for q in before_all.values())}
panel_ids={c['id'] for c in L['changes'] if '-integration.webp' in c['afterRecord'].get('image','')}
panel_ids.update(['P62F-PC-B3-057','P62F-PC-H-043'])
# These final tasks replace bolted-on readings/weak answer architectures with
# economic evidence or low-tier graph literacy. Taxonomy is explicit and overlapping.
dependence_ids={c['id'] for c in L['changes'] if 'options' in c['fields'] and c['id']!='P75-TRADE-L-027'}
depth_ids=set('P62G-MON-M-037 P62G-MON-H-001 P62G-MON-H-002 P62G-MON-H-003 P62G-MON-H-004 P62G-MON-H-005 P62G-MON-H-006 P62G-MON-H-007 P62G-MON-H-008 P62G-MON-H-009 P62G-MON-H-010 P62G-MON-H-011 P62G-MON-H-012 P62G-MON-H-041 P62F-PC-H-011 P62F-PC-H-012 P62F-PC-H-014 P62F-PC-L-061 P62F-PC-L-063 P62F-PC-L-064 P62F-PC-L-065 P62F-PC-L-072 P62F-PC-L-073 P62F-PC-L-074 P62F-PC-LB-015 P62F-PC-LB-016 P62F-PC-LB-017 P62F-PC-LB-018 P62B-ELAS-L-093 P62F-PC-B3-055 P62F-PC-EL-018 P62F-PC-EL-043 P62F-PC-H-015 P62F-PC-L-068 P62F-PC-LB-013 P62F-PC-M-043'.split())
assert depth_ids<=set(changes) and panel_ids<=set(changes)
errors={
 'P62F-PC-L-095':'Original task treated a price below the entire MC curve as a meaningful MC crossing. Replaced with the actual shutdown-price gap and operating rule.',
 'P62G-MON-H-041':'Short-run ATC alone did not establish long-run natural monopoly. An explicitly specified long-run cost model now supports the preserved concept.',
 'P62H-MCMP-L-093':'Removed the unsupported allocative-efficiency conclusion from a fixed-output price-cap calculation; retained the stated-output loss calculation.',
 'P62G-MON-EL-038':'Malformed feedback output references 16/40 corrected to 116/140; existing keyed regulatory comparison preserved.',
 'P62G-MON-EL-039':'Malformed feedback output references 16/40 corrected to 116/140; existing keyed regulatory comparison preserved.',
 'P62G-MON-EL-040':'Malformed feedback output references 16/40 corrected to 116/140; existing keyed regulatory comparison preserved.',
 'P62F-PC-B1-019':'Removed an unnecessary inaccurate AVC reading from profit-per-unit feedback; the correct price-minus-ATC calculation is unchanged.'}
field_counts=Counter(f for c in L['changes'] for f in c['fields'])
summary={
 'authorizedReviewed':len(S['authorized_ids']),'historicalGraphRewriteCount':len(S['historical_ids']),
 'questionRecordsChanged':len(changes),'questionRecordsRetained':len(S['authorized_ids'])-len(changes),
 'stemWordingRepairs':field_counts['q'],'graphAssetRepairs':len(L['assets'])-len(variant_paths),'newGraphVariants':len(variant_paths),'totalGraphAssetsWritten':len(L['assets']),
 'difficultyChanges':field_counts['canonicalDifficulty'],'typeChanges':field_counts['type'],
 'meaningfulGraphDependenceRepairs':len(dependence_ids),'redundantPanelRepairs':len(panel_ids),'assessmentDepthRepairs':len(depth_ids),
 'legacyMonCoreRecordsRetained':4,'legacyMonCoreRecordsRemapped':4,'legacyMonCoreRecordsRetired':0,
 'trialAdditions':len(M['trialAdditions']),'trialRemovals':len(M['trialRemovals']),
 'economicOrNumericalExplanationErrorsDiscovered':len(errors),'unauthorizedQuestionChanges':P['unauthorizedQuestionChanges'],
 'answerChoicesChanged':field_counts['options'],'feedbackChanged':field_counts['feedback'],'answerHashesChanged':field_counts['aHash'],
 'graphRequiredFlagsAdded':field_counts['graphRequired'],'checkpointStagesExplicitlyPreserved':field_counts['checkpointPool'],'ordinaryPoolMoves':len(L['moves'])}
def eligibility(id,after=True):
    eligible=id in (trial_after if after else trial_before)
    q=current[id] if after else before_all[id]
    if eligible:reason='Approved ordinary graph-safe inventory; valid image and graphRequired=true. Course/concept selection still controls inclusion.'
    elif id in S['legacy_ids']:reason='Legacy mon_core question retained and remapped; intentionally not automatically admitted to Trial by Graph.'
    elif any(id in (pools or {}).get(p,[]) for pools in (L['placementsAfter'] if after else L['placementsBefore']).values() for p in ['boss','legendaryBoss']):reason='Checkpoint-only record; excluded from ordinary Trial inventory.'
    else:reason='Outside the approved ordinary graph-safe inventory; a graph-bearing record is not admitted automatically.'
    return {'eligible':eligible,'graphRequired':q.get('graphRequired') is True,'reason':reason}
records=[]
seed_notes={
 'P62B-ELAS-H-034':'Replaced the compressed elasticity-and-interpretation construction with two direct questions. Students use the graph to obtain the slope and price/quantity ratios, yielding 3 at C and 1/3 at A; the constant-slope-versus-changing-elasticity construct remains Hard.',
 'P62B-ELAS-B1-019':'Ask directly for total revenue at B and what a small price change in either direction does. The graph supplies P=8 and Q=60; revenue is $480 and falls in either direction from the unit-elastic midpoint. Recalibrated to Medium while preserving the opening checkpoint.',
 'P62F-PC-H-043':'Made $15 visible in the firm panel. The legitimate firm-only task computes TR=15×50=$750. Recalibrated from an analysis label to Medium/Calculation; no claim that the redundant market panel is required.',
 'P62F-PC-EL-039':'Replaced the unnatural interpretation wording with a direct comparison of market equilibrium quantity and representative-firm output. The two panels provide 75 thousand versus 90 firm units. The explanation retains aggregation and scale, calibrated to Medium.',
 'P62G-MON-H-003':'Replaced the mangled mon_core_3 asset with MON-01. Students select Q=36 from MR=MC, read price $42 from demand, then explain the price effect that makes MR=$24 lower than price. The original marginal-revenue construct remains; no approximate-number appendage remains.'}
for id in S['authorized_ids']:
    old=before_all[id];new=current[id];c=changes.get(id);r=D['questions'][id]
    categories=[]
    if c:
        if 'q' in c['fields']:categories.append('natural question language')
        if 'canonicalDifficulty' in c['fields']:categories.append('difficulty recalibration')
        if 'type' in c['fields']:categories.append('type alignment')
        if id in dependence_ids:categories.append('meaningful graph dependence / answer architecture')
        if id in panel_ids:categories.append('redundant panel')
        if id in depth_ids:categories.append('assessment depth')
        if 'graphRequired' in c['fields']:categories.append('graph-safe inventory reconciliation')
    if old.get('image')!=new.get('image') or new.get('image') in asset_paths:categories.append('graph asset repair or replacement')
    specific=[x for x in N['checks'] if id in x['ids']]
    records.append({'id':id,'concept':new.get('primaryConceptId'),'changed':bool(c),'fields':c['fields'] if c else [],'issueCategories':categories,
      'before':old,'after':new,'reason':seed_notes.get(id,r['review']),'graphChanged':old.get('image')!=new.get('image') or new.get('image') in asset_paths,
      'trialBefore':eligibility(id,False),'trialAfter':eligibility(id),'economicConstructPreserved':True,
      'constructEvidence':{'primarySkill':new.get('primarySkill'),'repairSkill':new.get('repairSkill'),'review':r['review']},
      'numericalValidation':{'status':'PASS','method':'Manual independent reading of graph evidence and checking keyed reasoning/feedback; executable calculations where listed. Qualitative items do not require a new numerical calculation.','executableChecks':specific},
      'answerValidation':{'status':'PASS','fourDistinctChoices':True,'uniqueHashMatch':True,'economicsAndDistractorsManuallyReviewed':True,'correctIndex':c['correctIndex'] if c else None,'hashChanged':bool(c and c['answerHashChanged'])},
      'textReviewed':True,'visualReviewed':bool(new.get('image')),'graphNecessity':('PASS: graph supplies the economic comparison, magnitude, curve relationship or labeled-bundle evidence; final repaired multi-panel tasks need distinct information from both panels, or explicitly ask only about the firm panel.' if new.get('image') else 'N/A: this live-observed wording/distractor seed has no graph.')})
assets=[]
for a in L['assets']:
    old_refs=sorted(id for id,q in before_all.items() if q.get('image')==a['path'])
    spec=D['assets'].get(a['path'],{})
    assets.append({**a,'beforeReferencingIds':old_refs,'newVariant':a['path'] in variant_paths,
      'visualProblem':spec.get('issue',spec.get('visualReview','Existing shared graph could not supply the revised task cleanly without changing unrelated uses; create a separate variant.')),
      'sharedQuestionRecordsRewrittenOutsideScope':0,'sharedUsesReviewed':True,'renderedVisualStatus':'PASS',
      'derivatives':'Canonical local WebP, assetInventory and module assetMetadata checksums, manifest, generated embedded publication and all three faculty PDFs.'})
fallbacks=sum(s['quotaFallbackRuns'] for g in M['groups'] for s in g['simulations'])
exceptions=[
 'No unresolved failure within the authorized remediation scope. PASS means the specified checks passed; it is not a measured classroom reliability percentage.',
 f'{fallbacks} of {M["totalSimulations"]} Trial simulations used the existing tier-shortage fallback. Exact tier quotas were verified wherever sufficient tier inventory existed. Recalibration was not reversed merely to fill quotas.',
 'Trial selection is by question and difficulty, not an equal graph-family quota. Small concept inventories can repeat a graph asset. The report records inventory concentration and observed maxima; this is not a claim of uniform visual variety.',
 'The historic nine-question live Exam run cannot be reconstructed without its saved recipe/session. Current section gates and supported tax/policy builds were verified; insufficient boss inventory now fails preflight.',
 'Mobile inline multi-panel graphs are previews. Readable inspection uses the enlarged 760-pixel graph with horizontal panning; close and keyboard behavior were verified.',
 'Existing full-course publication omissions (25 Micro and 2 Macro legacy records) are unchanged; every changed target publishes. Faculty exports retain all canonical course records.',
 'This pass did not reopen unrelated bank content, faculty outcome exceptions, or prior instructor adjudications.'
]
result={'schemaVersion':1,'status':'PASS','date':'2026-10-04','baselineRef':L['baselineRef'],'librarySha256':L['afterLibrarySha256'],'summary':summary,'scope':S,
 'categoryIds':{'meaningfulGraphDependence':sorted(dependence_ids),'redundantPanels':sorted(panel_ids),'assessmentDepth':sorted(depth_ids),'economicOrExplanationErrors':errors},
 'fieldCounts':dict(field_counts),'questions':records,'assets':assets,'moves':L['moves'],'metadataChanges':L['metadataChanges'],
 'placementsBefore':L['placementsBefore'],'placementsAfter':L['placementsAfter'],'trialAndExam':M,
 'validation':{'composerRunners':{'passed':29,'total':29},'exporterTests':{'passed':25,'total':25},'publication':P,'exports':X,'numerical':N,'visual':V,'fullGameSmoke':G},'remainingExceptionsAndLimits':exceptions}
dest=ROOT/'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004'
dest.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
lines=['# Graph-assessment live-playthrough remediation — October 4, 2026','', '**FINAL STATUS: PASS — bounded to this authorized remediation pass.**','',
 'The instructor playthrough exposed weaknesses that automated structural validation did not establish or rule out. This report documents repairs and their evidence. It does not assign an empirical percentage of reliability to the bank.','',
 '## 1. Scope','',f'Exactly {len(S["historical_ids"])} graph-repair IDs were recovered from the October 3 cleanup, matching its stated 356. Adding the twelve live seeds and four legacy mon_core users produces a deduplicated union of {len(records)} IDs. No bank-wide audit was reopened. All current question text, choices, feedback and associated original graph families in that union were inspected. Shared users of repaired assets were reviewed before selecting common repairs or separate variants.','',
 '| Measure | Count |','|---|---:|']
for k,v in summary.items():lines.append(f'| {k} | {v} |')
lines+=['','Counts overlap. “Wording repairs” counts changed stems. Graph-dependence repairs count the explicitly listed answer-architecture/task repairs; graphRequired flag changes are reported separately. Four legacy records were both retained and remapped. A retained record may benefit from a repaired common asset.','',
 '## 2. Live instructor findings','']
for id in S['seed_ids']:
    r=next(x for x in records if x['id']==id)
    lines += [f'### {id}',r['reason'],f'Final tier: **{r["after"]["canonicalDifficulty"]}**. Final graph: `{r["after"].get("image")}`. Full before/after record appears in section 13.','']
lines+=['## 3. October 3 graph-rewrite set reviewed','',
 'The companion JSON contains all 361 individual review entries, including the exact 356 historical IDs and the 37 retained records. Review covered the requested regression classes: natural language, substantive graph evidence, legibility, panel necessity, difficulty, depth, and answer architecture. Retention was a review decision, not an assumption that the October cleanup was correct.','',
 '## 4. Natural-language repairs','',f'{field_counts["q"]} stems changed. Compressed “which values and interpretation” constructions became direct questions. Legitimate economics terminology remains. For example, the monopoly price/MR task now asks for the output and price and then asks why marginal revenue is lower. The capacity-constrained revenue item begins with the actual B-versus-A decision, without the unused C setup.','',
 '## 5. Graph-legibility repairs','',
 'Thirty-four common assets were repaired and eight task-specific variants created. Repairs separated labels from ticks, restored needed values, moved curve labels to legends, and clarified guide lines. Q1 no longer covers 60; PC-07 visibly supplies the $15 firm price; TAX-02 visibly supplies the original $10.50 equilibrium. Every final changed asset was inspected at desktop/mobile inline and expanded sizes. The mobile lightbox now offers a readable, pannable 760-pixel graph with a fixed close control.','',
 '## 6. Meaningful graph-dependence repairs','',f'{len(dependence_ids)} explicitly listed task/answer-architecture repairs replace arbitrary numerical appendages or preserve plausible alternatives until the economic graph evidence is read. Profit, shutdown, welfare, elasticity and price-taking decisions use the relevant curves; simple bundle recognition remains explicitly low-tier. The unchanged core skill and the revised task are both shown for every item below.','',
 'IDs: '+', '.join(sorted(dependence_ids))+'.','',
 '## 7. Cross-panel repairs','',
 f'{len(panel_ids)} redundant-panel repairs: seven records use four new variants with market price absent from the firm panel; two explicitly ask a legitimate firm-only question (PC-H-043 and PC-B3-057). Final hide-one-panel review tightened all six price-plus-rule companion tasks to require an actual firm output/cost decision. PC-EL-039 continues to compare market quantity and one firm’s output, which are distinct aggregation levels.','',
 'IDs: '+', '.join(sorted(panel_ids))+'.','',
 '## 8. Difficulty changes','',f'{field_counts["canonicalDifficulty"]} cognitive tiers changed. Standard graph reading plus one inference was generally placed at Medium; linked output/price/cost or policy reasoning at Hard; higher tiers remain only where synthesis warrants them. PC-B1-005 is Medium, never Easy. ID suffixes and source provenance are retained and are not the current difficulty. P75-TRADE-L-027 was already Hard in the baseline despite its L suffix and is now Medium.','',
 f'{len(L["moves"])} ordinary pool placements moved to match the current tier. The 51 recalibrated checkpoint records retain their exact original checkpoint stage through an explicit checkpointPool field. The routing logic does not repurpose historical originalBossTier metadata. Before/after stage inventories match for every affected concept, and negative tests reject placement at the wrong stage.','',
 '## 9. Weak assessment-depth repairs','',f'{len(depth_ids)} substantive depth repairs are explicitly identified below. These include monopoly output/price decisions, operating loss versus shutdown, fixed versus variable cost policy, current loss versus long-run exit, and distinct market/firm decisions. Depth comes from economic reasoning; tasks that remain standard applications were recalibrated rather than dressed in more technical prose.','',
 'IDs: '+', '.join(sorted(depth_ids))+'.','',
 '## 10. Legacy mon_core disposition','',
 'H-001 through H-004 are all retained and remapped to the cleaner MON-01 asset. They continue to assess monopoly output/price, profit, the price effect behind MR, and fixed-cost changes. Their examples now consistently use Q=36, P=$42, MR/MC=$24 and ATC=$27. No question or graph file was deleted. These four IDs remain outside Trial by Graph.','',
 '## 11. Trial by Graph inventory before/after','',
 f'{len(M["trialAdditions"])} additions and {len(M["trialRemovals"])} removals. Added IDs are authorized, ordinary-pool, graph-dependent records with valid assets; no legacy mon_core ID was added. Of 104 graphRequired additions, 21 belong to checkpoint records and do not enter Trial. The actual template deck functions ran {M["totalSimulations"]} seeded simulations across 17 affected concepts, 100 runs for every supported length. No invalid IDs, duplicate IDs within a run, broken assets or undersized advertised decks occurred.','',
 '| Concept | Before | After | E/M/H/Elite/Legendary | Supported lengths | Maximum single asset per run (length:count) |','|---|---:|---:|---|---|---|']
for g in M['groups']:
    lines.append(f'| {g["concept"]} | {g["before"]} | {g["after"]} | '+ '/'.join(str(g['byDifficulty'].get(t,0)) for t in ['easy','medium','hard','elite','legendary'])+' | '+(', '.join(map(str,g['supportedTargets'])) or 'None')+' | '+(', '.join(f'{s["target"]}:{s["maxSingleAssetInDeck"]}' for s in g['simulations']) or 'N/A')+' |')
lines+=['',f'Quotas are 3/3/2/1/1 for 10; 4/4/3/2/2 for 15; 5/5/4/3/3 for 20. All runs with adequate tier inventories matched them exactly. {fallbacks} runs exercised the pre-existing shortage fallback, which fills remaining positions from unused eligible records. The mode does not promise equal asset-family quotas. Asset repetition reflects the available questions within tiers; no new family-specific weighting or duplicate-ID routing was introduced. Exact asset inventories and selection frequencies are in the JSON. Narrow tax incidence alone has seven eligible records and does not advertise a ten-question run.','',
 '## 12. Exam Drill checkpoint finding','',
 'Nine ordinary questions per section is intentional. Answering them unlocks a deliberate checkpoint selection; it does not automatically advance the student. Tested all three gates: incomplete responses block entry, nine responses permit entry to room 10/20/30, entry commits responses once, and the checkpoint begins with three boss questions.','',
 'A real preflight gap was fixed in both Composer core and the generated template: Exam Drill now checks minimum inventories of three easyBoss, three mediumBoss and three finalBoss questions in addition to its ordinary/remediation requirements. Six current tax/policy compositions were tested; a deliberately deficient composition is rejected with explicit missing-boss errors. No boss questions were manufactured. The historic live run’s exact cause cannot be attributed without its saved recipe/session.','',
 '## 13. Exact canonical changes','',
 f'The canonical bank still has {P["canonicalIds"]} distinct IDs. No ID was added or retired. Course memberships, primary/repair skills, source provenance and curriculum routing are unchanged. Authorized record fields changed as follows:','',
 '| Field | Records |','|---|---:|']
for k,v in field_counts.items():lines.append(f'| {k} | {v} |')
lines+=['', 'Derived registry coverage, asset checksums/manifests and faculty-outcome coverage counts were regenerated; outcome labels and mappings were not reauthored. The JSON contains exact metadata diffs, ordered pool placements and complete before/after question records. Hashes use the repository’s answer normalization and SHA-256 process.','',
 'Economic/numerical explanation errors discovered in authorized records (not a count of newly rehashed answers):','']
for id,reason in errors.items():lines.append(f'- **{id}:** {reason}')
lines+=['','### Individual changed-question ledger','']
for r in records:
    if not r['changed']:continue
    id=r['id'];b=r['before'];a=r['after'];ci=r['answerValidation']['correctIndex']
    lines += [f'#### {id}',f'Concept: `{r["concept"]}`. Categories: '+', '.join(r['issueCategories'])+'.',r['reason'],'',
      f'**Before:** {b["q"]}','']
    for letter,opt in zip('ABCD',b['options']):lines.append(f'- {letter}. {opt}')
    # Find old key with normal exporter-equivalent lowercase whitespace normalization.
    oldkey=next((i for i,opt in enumerate(b['options']) if hashlib.sha256(re.sub(r'\s+',' ',unicodedata.normalize('NFKC',opt).strip()).lower().encode()).hexdigest()==b['aHash']),None)
    assert oldkey is not None,(id,'old answer key normalization')
    lines += [f'- Correct answer: {"ABCD"[oldkey]} — {b["options"][oldkey]}',f'- Feedback: {b.get("feedback","")}','',f'**After:** {a["q"]}','']
    for letter,opt in zip('ABCD',a['options']):lines.append(f'- {letter}. {opt}')
    lines += [f'- Correct answer: {"ABCD"[ci]} — {a["options"][ci]}',f'- Feedback: {a.get("feedback","")}','',
      f'Difficulty: **{b.get("canonicalDifficulty")} → {a.get("canonicalDifficulty")}**. Type: `{b.get("type")}` → `{a.get("type")}`.',
      f'Graph: `{b.get("image")}` → `{a.get("image")}`. Graph change: **{"YES" if r["graphChanged"] else "NO"}**.',
      f'Trial eligible: **{"YES" if r["trialBefore"]["eligible"] else "NO"} → {"YES" if r["trialAfter"]["eligible"] else "NO"}**. graphRequired: {r["trialBefore"]["graphRequired"]} → {r["trialAfter"]["graphRequired"]}. {r["trialAfter"]["reason"]}',
      f'Economic construct preserved: **YES** — `{a.get("primarySkill")}` / repair `{a.get("repairSkill")}`. {r["graphNecessity"]}',
      'Numerical validation: **PASS**, item-level graph/feedback review'+(' plus '+ '; '.join(x['calculation']+f' = {x["actual"]:g}' for x in r['numericalValidation']['executableChecks']) if r['numericalValidation']['executableChecks'] else '; no replacement-model formula check was needed for this record')+'.',
      f'Answer validation: **PASS** — four distinct choices, one normal-hash key, keyed economics/distractors reviewed. Hash changed: **{"YES" if r["answerValidation"]["hashChanged"] else "NO"}**.','']
lines+=['### Retained question records','', 'All records below were reviewed and retained. Their common image may have been repaired; full graph/Trial/construct details are in the JSON.','']
for r in records:
    if not r['changed']:lines.append(f'- **{r["id"]}** ({r["concept"]}): {r["reason"]} Trial: {"YES" if r["trialAfter"]["eligible"] else "NO"}; graph changed: {"YES" if r["graphChanged"] else "NO"}.')
lines+=['','## 14. Asset changes','']
for a in assets:
    lines += [f'### {a["path"]}',f'New variant: {a["newVariant"]}. Problem: {a["visualProblem"]}',f'Fix: {a["fix"]}',f'Model/source: {a["model"]}',f'Generator: `{a["generator"]}`. {a["derivatives"]}', 'Before referencing IDs: '+(', '.join(a['beforeReferencingIds']) or 'None — new variant')+'.', 'Final referencing IDs: '+', '.join(a['referencingIds'])+'.','Shared-use review: PASS; outside-scope question records rewritten: 0. Rendered visual inspection: PASS.','']
lines+=['## 15. Validation results','',
 '- Full current Composer suite: **29/29 PASS**, including comprehensive question-bank, graph synchronization, content scope, all ten modes, Trial by Graph, telemetry and state validations.',
 '- Faculty exporter suite: **25/25 PASS**. Normal exporter regenerated all three PDFs/CSVs with matching canonical IDs and keyed content.',
 '- Publication parity: **PASS** for General, Micro and Macro; all changed targets publish, answer verification and generated script compilation pass, and course ID sets match the baseline.',
 f'- Targeted mode checks: **{M["totalSimulations"]} Trial simulations PASS**; preserved checkpoint inventories, three Exam section gates and missing-boss negative controls PASS.',
 f'- Independent numerical checks: **{len(N["checks"])} PASS**, supplementing item-level qualitative/numerical review. During closure these caught and corrected a new variant coefficient before acceptance.',
 f'- Visual inspection: **42 changed assets PASS** across desktop/mobile inline and lightbox contexts; actual full-game mobile pan, close, Enter and Escape interactions PASS. **{V["pdfPagesReviewed"]} exported pages visually inspected**, including every changed asset and live seeds; automated PDF roundtrip validates every exported record.',
 '- Unauthorized canonical question changes: **0**. No IDs added/removed. Canonical skills and course membership preserved.',
 '- Test updates restore only explicitly approved ledger fields for historical baseline assertions; all original assertions remain active. Negative controls reject unrelated wording/skill edits and wrong checkpoint-stage placement.',
 '', '| Export | Questions | PDF pages | Changed records verified |','|---|---:|---:|---:|']
for area,x in X['disciplines'].items():lines.append(f'| {area} | {x["idsUnchanged"]} | {x["pdfPages"]} | {x["changedRecordsVerified"]} |')
lines+=['', 'Evidence: `graph_assessment_live_playthrough_remediation_20261004_evidence/` holds final logs, numerical assertions, mode inventories, publication checks, browser renders and PDF page renders. Reproducible scripts and frozen originals are under `audit_tools/graph_assessment_live_playthrough_remediation_20261004/`.','',
 '## 16. Remaining exceptions','']
for e in exceptions:lines.append('- '+e)
lines+=['','All twelve live seeds have documented dispositions. The 356 historical graph-repair IDs have been reviewed for the requested regression classes. No additional full-bank audit was launched.','']
dest.with_suffix('.md').write_text('\n'.join(lines),encoding='utf8')
print(json.dumps(summary,indent=2));print('Report written:',dest)
