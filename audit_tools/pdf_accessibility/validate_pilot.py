from repo_guard import *
from pypdf import PdfReader
from PIL import Image,ImageChops
root=root_guard()
base=contained('tmp/pdf_accessibility/repo_lock_v1')
results=read_json('validation_artifacts/pdf_accessibility/pilot_results.json')['results']
paths=[contained(r['output']) for r in results if r.get('output')]
java=contained(base/'tools/java/jdk-17.0.16+8-jre/bin/java.exe')
jar=contained(base/'tools/verapdf/bin/greenfield-apps-1.28.2.jar')
command=[str(java),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={base}',f'-Dapp.home={base / "tools/verapdf"}', '-cp',str(jar),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json']+[str(p) for p in paths]
result=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/pilot_verapdf.json').write_text(result.stdout,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/pilot_verapdf.stderr.log').write_text(result.stderr,encoding='utf-8')
exe=Path(r'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
renders=contained(base/'pilot/rendered_after');renders.mkdir(parents=True,exist_ok=True)
comparisons=[]
for path in paths:
    code=path.stem
    subprocess.run([str(exe),'-scale-to','1400','-png','-singlefile',str(path),str(renders/code)],cwd=root,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    before=contained(base/'pilot/before'/(code+'.pdf'))
    old=PdfReader(before);new=PdfReader(path)
    before_image=Image.open(base/'pilot/rendered_before'/(code+'.png')).convert('RGB')
    after_image=Image.open(renders/(code+'.png')).convert('RGB')
    comparison={'code':code,'textExactlyEqual':old.pages[0].extract_text()==new.pages[0].extract_text(),'pageGeometryEqual':list(old.pages[0].mediabox)==list(new.pages[0].mediabox),'pixelsExactlyEqual':before_image.size==after_image.size and ImageChops.difference(before_image,after_image).getbbox() is None}
    comparisons.append(comparison)
    print(comparison,flush=True)
write_json('validation_artifacts/pdf_accessibility/pilot_preservation.json',comparisons)
data=json.loads(result.stdout)
for job in data['report']['jobs']:
    v=job['validationResult'][0]
    print(Path(job['itemDetails']['name']).name,'compliant',v.get('compliant'),[(r['clause'],r['testNumber'],r['failedChecks'],r['description']) for r in v['details'].get('ruleSummaries',[])])