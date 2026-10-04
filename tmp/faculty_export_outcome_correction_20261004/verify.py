import csv,hashlib,json,re,subprocess,sys
from pathlib import Path
import pypdfium2 as pdfium
root=Path(__file__).resolve().parents[2];work=Path(__file__).parent
sys.path.insert(0,str(root/'tools'))
import export_faculty_question_bank as e
baseline=json.loads((work/'baseline.json').read_text(encoding='utf-8'))
summary=json.loads((root/'faculty_exports/validation_summary.json').read_text(encoding='utf-8'))
trace=json.loads((root/'faculty_exports/faculty_outcome_resolution.json').read_text(encoding='utf-8'))
policy=json.loads(subprocess.check_output(['node','-e',"process.stdout.write(JSON.stringify(require('./build/faculty-build-composer/data/faculty-outcomes.js')))"],cwd=root,text=True,encoding='utf-8'))
library=e.load_library(root/e.SOURCE);records,_=e.collect(library)
assert set(records)==set(trace['questions'])
assert policy['policySha256']==trace['policySha256']==summary['faculty_outcome_policy_sha256']
for qid,res in trace['questions'].items():
    q=records[qid]['q']
    skills=list(dict.fromkeys(x for x in [q.get('primarySkill'),*q.get('secondarySkills',[])] if isinstance(x,str) and x))
    assert res['skills']==skills
    expected=[]
    assert all(policy['concepts'][cid].get('hidden') for cid in res['excludedConceptIds'])
    for cid in res['conceptIds']:
        assert not policy['concepts'].get(cid,{}).get('hidden')
        for outcome in policy['concepts'].get(cid,{}).get('outcomes',[]):
            matched=[skill for skill in skills if skill in outcome['skillIds']]
            if matched:expected.append(dict(id=outcome['id'],conceptId=cid,label=outcome['label'],matchedSkills=matched))
    assert res['outcomes']==expected,(qid,'outcome trace')
    labels=list(dict.fromkeys(o['label'] for o in expected))
    assert res['labels']==labels
    assert res['unresolvedSkills']==[skill for skill in skills if not any(skill in o['matchedSkills'] for o in expected)]
changed=[p for p,h in baseline['protected_files'].items() if hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
assert not changed, changed
result={'policy_sha256':policy['policySha256'],'protected_files_unchanged':len(baseline['protected_files']),
        'global':summary['faculty_outcome_resolution'],'courses':{},'visual_samples':[]}
for area,info in summary['disciplines'].items():
    csvpath=root/'faculty_exports'/info['csv_file']
    with csvpath.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
    old={r['Question ID']:r for r in baseline['courses'][area]}
    assert {r['Question ID'] for r in rows}==set(old)
    assert len(rows)==len(old)
    for row in rows:
        qid=row['Question ID'];res=trace['questions'][qid]
        assert row['Learning Objective']==' | '.join(res['labels'])
        assert {k:v for k,v in row.items() if k!='Learning Objective'}=={k:v for k,v in old[qid].items() if k!='Learning Objective'},qid
    csvcodes=e.LEGACY_OBJECTIVE_PATTERN.findall(csvpath.read_text(encoding='utf-8-sig'));assert not csvcodes
    pdfcodes=[];outside=[];images=0
    with pdfium.PdfDocument(str(root/'faculty_exports'/info['pdf_file'])) as doc:
        for i in range(len(doc)):
            page=doc[i];text=page.get_textpage()
            pdfcodes+=e.LEGACY_OBJECTIVE_PATTERN.findall(text.get_text_bounded());text.close()
            width,height=page.get_size()
            for obj in page.get_objects():
                l,b,r,t=obj.get_bounds()
                if l<-.5 or b<-.5 or r>width+.5 or t>height+.5:outside.append(i+1)
                if obj.type==pdfium.raw.FPDF_PAGEOBJ_IMAGE:images+=1
            page.close()
    assert not pdfcodes and not outside,(area,pdfcodes,outside)
    assert images==info['questions_with_images']
    result['courses'][area]={'question_count':len(rows),'pdf_pages':info['pdf_pages'],
        'resolution':info['faculty_outcome_resolution'],'legacy_codes_pdf':len(pdfcodes),'legacy_codes_csv':len(csvcodes),
        'non_objective_csv_fields_unchanged':True,'ids_unchanged':True,'objects_outside_pdf_page':len(outside),'graphs':images}
    ids=[row['Question ID'] for row in rows]
    samples=[('single outcome',next(i for i in ids if len(trace['questions'][i]['labels'])==1)),
        ('multiple outcomes',next(i for i in ids if len(trace['questions'][i]['labels'])>1)),
        ('largest outcome header',max(ids,key=lambda i:sum(map(len,trace['questions'][i]['labels'])))),
        ('graph','40020')]
    if area=='micro':samples.append(('42941','42941'))
    unresolved=next((i for i in ids if not trace['questions'][i]['labels']),None)
    if unresolved:samples.append(('unresolved: no fallback',unresolved))
    demand=next((i for i in ids if 'demand' in trace['questions'][i]['conceptIds'] and len(trace['questions'][i]['labels'])>1),None)
    if demand:samples.append(('Demand multiple outcomes',demand))
    for category,qid in samples:
        page=info['question_pages'][qid];prefix=work/f'{area}-{page}'
        subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-r','110','-singlefile','-png',str(root/'faculty_exports'/info['pdf_file']),str(prefix)],check=True,capture_output=True)
        result['visual_samples'].append({'course':area,'category':category,'id':qid,'page':page,'image':str(prefix.with_suffix('.png'))})
    print(area,result['courses'][area],flush=True)
(work/'verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
