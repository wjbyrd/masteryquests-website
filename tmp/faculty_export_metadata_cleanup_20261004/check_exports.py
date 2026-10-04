import csv, hashlib, json, shutil, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'tools'))
import export_faculty_question_bank as e
work = Path(__file__).parent
baseline = json.loads((work / 'baseline.json').read_text(encoding='utf-8'))
summary = json.loads((root / 'faculty_exports/validation_summary.json').read_text(encoding='utf-8'))
lib = e.load_library(root / e.SOURCE)
records, _ = e.collect(lib)
e.audit_answers_and_routes(lib, records, root, shutil.which('node'))
result = {'distinct_ids':len(records), 'courses':{}, 'visual_samples':[]}
assert len(records) == 9777
expected_columns = ['Question ID','Topic','Learning Objective','Difficulty','Question Type','Common Misconception','Question','Choice A','Choice B','Choice C','Choice D','Correct Answer','Feedback','Graph/Image']
for area, info in summary['disciplines'].items():
    with (root / 'faculty_exports' / info['csv_file']).open(encoding='utf-8-sig', newline='') as handle:
        reader=csv.DictReader(handle); assert reader.fieldnames==expected_columns
        rows=list(reader)
    ids=[r['Question ID'] for r in rows]
    assert len(ids)==len(set(ids))==len(baseline['courses'][area]['ids'])
    assert set(ids)==set(baseline['courses'][area]['ids'])
    for row in rows:
        entry=records[row['Question ID']];q=entry['q']
        assert row['Question']==q['q']
        assert [row['Choice '+letter] for letter in 'ABCD']==q['options']
        assert row['Feedback']==q.get('feedback','')
        index=entry['answer']
        assert row['Correct Answer']==f'{e.letter(index)} — {q["options"][index]}'
        assert row['Graph/Image']==('See graph in faculty PDF' if q.get('image') else '')
    e.assert_faculty_presentation((root/'faculty_exports'/info['csv_file']).read_text(encoding='utf-8-sig'))
    before=baseline['courses'][area]
    result['courses'][area]={'questions':len(ids),'ids_unchanged':True,'csv_content_exact':True,
        'pages_before':before['pdf_pages'],'pages_after':info['pdf_pages'],
        'pages_removed':before['pdf_pages']-info['pdf_pages'],
        'columns_before':before['column_count'],'columns_after':14,'columns_removed':before['column_count']-14,
        'graphs':info['questions_with_images'],'missing_graphs':info['missing_images']}
    pages=info['question_pages']
    simple=next(i for i in pages if records[i]['q'].get('difficulty')=='easy')
    boss=next(i for i in pages if records[i]['q'].get('difficulty')=='legendaryBoss')
    # Pick the record with the largest serialized non-body metadata. This is a
    # presentation sample, not an editorial or correctness review.
    huge=max(pages,key=lambda i:len(json.dumps({k:v for k,v in records[i]['q'].items() if k not in {'q','options','feedback','hint','image'}})))
    samples=[('simple',simple),('graph','40020'),('Legendary/Boss',boss),('large previous metadata',huge)]+([('explicit 42941','42941')] if area=='micro' else [])
    if 'P77-IEA-R-001' in pages:
        samples.append(('large Additional Metadata / repair','P77-IEA-R-001'))
    for category,qid in samples:
        page=pages[qid]
        prefix=work/f'{area}-{page}'
        previous = hashlib.sha256(prefix.with_suffix('.png').read_bytes()).hexdigest() if prefix.with_suffix('.png').exists() else None
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r','110','-singlefile','-png',str(root/'faculty_exports'/info['pdf_file']),str(prefix)],check=True,capture_output=True)
        unchanged = previous == hashlib.sha256(prefix.with_suffix('.png').read_bytes()).hexdigest()
        result['visual_samples'].append({'course':area,'category':category,'id':qid,'page':page,'image':str(prefix.with_suffix('.png')),'unchanged_from_visual_review':unchanged})
    for page in [1,2]:
        prefix=work/f'{area}-{page}'
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r','90','-singlefile','-png',str(root/'faculty_exports'/info['pdf_file']),str(prefix)],check=True,capture_output=True)
        result['visual_samples'].append({'course':area,'category':'cover/index','page':page,'image':str(prefix.with_suffix('.png'))})
(work/'verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
