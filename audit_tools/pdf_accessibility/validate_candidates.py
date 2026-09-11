"""Independent UA-1 validation plus source/semantic/render evidence for staged PDFs."""
from repo_guard import *
from accessibility_gate import inspect
from tag_pilot import normalized, source_hash
from pypdf import PdfReader
from PIL import Image,ImageChops

SEMANTICS='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
SOURCE='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'

def validate(rows, output):
    root=root_guard();output=contained(output)
    if not any(output.is_relative_to(contained(p)) for p in ('tmp/pdf_accessibility','validation_artifacts/pdf_accessibility')):
        raise ValueError('Evidence destination must be non-public')
    output.mkdir(parents=True,exist_ok=True)
    paths=[contained(r['output']) for r in rows]
    if any(not p.is_relative_to(contained('tmp/pdf_accessibility')) for p in paths):raise ValueError('Only staged candidates can be validated')
    tools=contained('tmp/pdf_accessibility/repo_lock_v1/tools')
    java=tools/'java/jdk-17.0.16+8-jre/bin/java.exe';jar=tools/'verapdf/bin/greenfield-apps-1.28.2.jar'
    scratch=contained('tmp/pdf_accessibility/pilot_blockers_v1/validator');scratch.mkdir(parents=True,exist_ok=True)
    command=[str(java),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={scratch}',f'-Dapp.home={tools / "verapdf"}',
             '-cp',str(jar),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json',*[str(p) for p in paths]]
    result=subprocess.run(command,cwd=root,capture_output=True,text=True,encoding='utf-8')
    report=output/'verapdf.json';report.write_text(result.stdout,encoding='utf-8')
    (output/'verapdf.stderr.log').write_text(result.stderr,encoding='utf-8')
    jobs=json.loads(result.stdout)['report']['jobs']
    by_path={str(Path(j['itemDetails']['name']).resolve()):j for j in jobs}
    metadata=read_json(SEMANTICS);sources={r['code']:r for r in read_json(SOURCE)['reviews']}
    poppler=Path(r'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
    records=[]
    for row,path in zip(rows,paths):
        code=row['code'];meta=metadata['pilot'][code];source=sources[code]
        baseline=contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf')
        checked=inspect(path,source,baseline,meta)
        job=by_path.get(str(path));validations=job.get('validationResult',[]) if job else []
        compliant=len(validations)==1 and validations[0].get('compliant') is True and 'PDF/UA-1' in validations[0].get('profileName','')
        for name,pdf in (('before',baseline),('after',path)):
            directory=output/('rendered_'+name);directory.mkdir(exist_ok=True)
            subprocess.run([str(poppler),'-scale-to','1400','-png','-singlefile',str(pdf),str(directory/code)],cwd=root,check=True,capture_output=True)
        a=Image.open(output/'rendered_before'/(code+'.png')).convert('RGB');b=Image.open(output/'rendered_after'/(code+'.png')).convert('RGB')
        diff=ImageChops.difference(a,b);changed=sum(pixel!=(0,0,0) for pixel in diff.get_flattened_data())
        old=PdfReader(baseline);new=PdfReader(path)
        record={**row,'passed':compliant and not checked['errors'],'independentProfile':'ISO 14289-1:2014',
                'validator':'veraPDF 1.28.2 --flavour ua1','independentPass':compliant,'projectErrors':checked['errors'],
                'sourceRecordSha256':source_hash(source),'semanticsSha256':sha(SEMANTICS),'baselineSha256':sha(baseline),
                'validatorReport':str(report.relative_to(root)),'validatorReportSha256':sha(report),'sha256':sha(path),
                'pageCounts':[len(old.pages),len(new.pages)],'geometryEqual':list(old.pages[0].mediabox)==list(new.pages[0].mediabox),
                'textExact':old.pages[0].extract_text()==new.pages[0].extract_text(),
                'textWhitespaceOnlyEqual':normalized(old.pages[0].extract_text())==normalized(new.pages[0].extract_text()),
                'changedPixels':changed,'differenceBounds':diff.getbbox(),'renderReview':'PENDING','assistiveTechnology':'PENDING'}
        write_json(output/'transcripts'/(code+'.json'),checked)
        records.append(record);print(code,'PASS' if record['passed'] else 'FAIL',checked['errors'],flush=True)
    write_json(output/'validation.json',records)
    return records

if __name__=='__main__':
    rows=read_json('validation_artifacts/pdf_accessibility/pilot_blockers_v1/pilot_results.json')['results']
    if any(r['status']=='REJECTED' for r in rows):raise SystemExit('Rejected pilot candidate')
    result=validate(rows,'validation_artifacts/pdf_accessibility/pilot_blockers_v1')
    raise SystemExit(0 if all(r['passed'] for r in result) else 1)
