from pathlib import Path
import json,hashlib,subprocess,sys,shutil,collections,re
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).parent
WORK=ROOT/'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence';WORK.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT/'tools'))
import export_faculty_question_bank as e
read=lambda p:json.loads(p.read_text(encoding='utf8'))
old=read(ROOT/'faculty_exports/audits/microeconomics_wording_graph_cleanup_20261003.json')
graph_changes=[x for x in old['changes'] if any(f.startswith('MIC-G-') for f in x['review']['finding_ids'])]
historical=sorted({x['id'] for x in graph_changes})
seeds=['P75-TRADE-L-027','PG2-STX-M-002','P62B-ELAS-H-034','P62B-ELAS-B1-019','P62B-ELAS-L-093','P62F-PC-H-043','P62F-PC-EL-039','P62F-PC-B1-005','P62F-PC-B3-055','P62G-MON-H-003','P62G-MON-M-037','P62G-MON-H-041']
lib=e.load_library(ROOT/e.SOURCE);records,_=e.collect(lib)
legacy=sorted(i for i,r in records.items() if re.search(r'question-assets/monopoly/mon_core_.*\.webp$',r['q'].get('image','')))
authorized=sorted(set(historical+seeds+legacy));missing=sorted(set(authorized)-set(records))
images={i:r['q'].get('image') for i,r in records.items() if r['q'].get('image')}
refs={p:sorted(i for i,im in images.items() if im==p) for p in set(images.values())}
scope={'historical_claim':356,'historical_recovered':len(historical),'historical_ids':historical,'seed_ids':seeds,'legacy_ids':legacy,'authorized_ids':authorized,'missing_current_ids':missing,
    'discrepancy':None if len(historical)==356 else 'Report-derived MIC-G finding membership differs from claimed 356',
    'asset_references':{p:refs[p] for p in sorted({images[i] for i in authorized if i in images})}}
(HERE/'scope.json').write_text(json.dumps(scope,indent=2)+'\n',encoding='utf8')
if not (WORK/'baseline.json').exists():
    paths=subprocess.check_output(['git','ls-files','build/faculty-build-composer','tools','audit_tools/faculty_lo'],cwd=ROOT,text=True).splitlines()
    baseline={'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'files':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths if (ROOT/p).is_file()}}
    (WORK/'baseline.json').write_text(json.dumps(baseline,indent=2)+'\n',encoding='utf8')
    for n in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:shutil.copy2(ROOT/e.SOURCE.parent/n,WORK/n)
    for area in ['general_economics','microeconomics','macroeconomics']:shutil.copy2(ROOT/'faculty_exports'/f'{area}_question_bank.csv',WORK/f'{area}_question_bank.csv')
(WORK/'all_originals.json').write_text(json.dumps({i:r['q'] for i,r in records.items()},ensure_ascii=False),encoding='utf8')
(HERE/'originals.json').write_text(json.dumps({i:records[i]['q'] for i in authorized if i in records},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
groups=collections.defaultdict(list)
for i in authorized:
    if i in records:groups[records[i]['q'].get('image','NO IMAGE')].append(i)
(HERE/'asset_groups.json').write_text(json.dumps(groups,indent=2)+'\n',encoding='utf8')
for n,(asset,ids) in enumerate(sorted(groups.items())):
    text=[f'ASSET {n:03}: {asset}',f'AUTHORIZED {len(ids)}; ALL SHARED USERS {len(refs.get(asset,[]))}']
    for i in ids:
        q=records[i]['q'];text+=[f"\n{i} | {q.get('canonicalDifficulty',q.get('difficulty'))} | {q.get('type')} | skill={q.get('primarySkill')} | role={q.get('instructionalRole')} | graphRequired={q.get('graphRequired')}",q['q'],*[f'{chr(65+k)}. {o}' for k,o in enumerate(q['options'])],f"Feedback: {q.get('feedback','')}"]
    (WORK/f'review-{n:03}.txt').write_text('\n'.join(text),encoding='utf8')
(WORK/'asset_index.json').write_text(json.dumps([{'index':n,'asset':a,'ids':ids,'all_refs':refs.get(a,[])} for n,(a,ids) in enumerate(sorted(groups.items()))],indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in scope.items() if k not in ('asset_references','authorized_ids','historical_ids')},indent=2));print('Authorized unique',len(authorized),'asset groups',len(groups))
print(json.dumps([{'index':n,'asset':a,'questions':len(ids)} for n,(a,ids) in enumerate(sorted(groups.items()))],indent=2))
