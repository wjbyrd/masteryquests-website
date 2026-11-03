from pathlib import Path
import csv,json,shutil,hashlib
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation');BASE=HERE/'baseline'
assert not BASE.exists();BASE.mkdir();(HERE/'qa').mkdir()
for n in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:shutil.copy2(ROOT/'build/faculty-build-composer/data'/n,BASE/n)
for n in ['personal-review-list-data.json','review-template.html','build-review-html.py']:shutil.copy2(PROJECT/'source'/n,BASE/n)
for n in ['general_economics_question_bank.xlsx','microeconomics_question_bank.xlsx','macroeconomics_question_bank.xlsx','microeconomics_manual_review.xlsx','microeconomics_manual_review.csv','validation_summary.json']:shutil.copy2(ROOT/'faculty_exports'/n,BASE/n)
shutil.copy2(Path('C:/Users/Jennings/Downloads/MasteryQuests-review-results(20).csv'),BASE/'reviews.csv')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
prior=read(ROOT/'audit_tools/review_navigation_20261103/baseline/personal-review-list-data.json')['reviewSeed'];current=read(BASE/'personal-review-list-data.json');qm={r['id']:r for r in current['questions']}
with (BASE/'reviews.csv').open(encoding='utf-8-sig',newline='') as f:reviews=list(csv.DictReader(f))
items=[];historical=[]
for r in reviews:
    identity=r['Question ID'];fresh_note=r['Notes'].strip() and r['Notes']!=prior[identity].get('notes','')
    if r['Review status']=='Reviewed — flag' or fresh_note:
        row=qm[identity];items.append({'id':identity,'topic':row['topic'],'review':r,'question':row['q'],'correctIndex':row['answer_index'],'graph':row['graph_url']})
    elif r['Notes'].strip():historical.append({'id':identity,'note':r['Notes'],'reviewStatus':r['Review status'],'reason':'Previously recorded note retained with the earlier accepted review; not a new unresolved request in export (20).'})
assert len(items)==63 and len(historical)==388
inv={'beforeLibrarySha256':current['librarySha256'],'sourceCsvSha256':hashlib.sha256((BASE/'reviews.csv').read_bytes()).hexdigest(),'items':items,'historicalNotes':historical}
(HERE/'inventory.json').write_text(json.dumps(inv,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'remainingItems':len(items),'flagged':sum(i['review']['Review status']=='Reviewed — flag' for i in items),'passedWithNotes':sum(i['review']['Review status']=='Reviewed — pass' for i in items),'historicalNotes':len(historical)}))
