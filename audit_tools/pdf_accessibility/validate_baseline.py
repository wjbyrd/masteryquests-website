from repo_guard import *
root=root_guard()
base=contained('tmp/pdf_accessibility/repo_lock_v1/tools')
java=contained(base/'java/jdk-17.0.16+8-jre/bin/java.exe')
jar=contained(base/'verapdf/bin/greenfield-apps-1.28.2.jar')
paths=[contained('build/faculty-build-composer/data/concept-reviews/'+r['pdfPath']) for r in read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')['reviews']]
command=[str(java),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={base}',f'-Dapp.home={base / "verapdf"}', '-cp',str(jar),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json']+[str(p) for p in paths]
result=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/baseline_verapdf.json').write_text(result.stdout,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/baseline_verapdf.stderr.log').write_text(result.stderr,encoding='utf-8')
print('veraPDF exit',result.returncode,'report bytes',len(result.stdout))