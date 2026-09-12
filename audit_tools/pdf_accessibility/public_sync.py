"""Manifest-bound public synchronization: byte copies, durable rollback, no rendering."""
from repo_guard import *
from pypdf import PdfReader
from accessibility_gate import inspect
import shutil,uuid,sys,collections
TASK='CONCEPT_REVIEW_PUBLIC_SYNC_V1'
SOURCE_DIR='build/faculty-build-composer/data/concept-reviews'
PUBLIC='concept-reviews'
OUT='validation_artifacts/pdf_accessibility/public_sync_v1'
MANIFEST=SOURCE_DIR+'/manifest.json'

def inventory(directory):
    return {p.name:{'path':str(p.relative_to(EXPECTED_ROOT)),'sha256':sha(p),'size':p.stat().st_size} for p in contained(directory).iterdir() if p.is_file() and p.suffix.lower()=='.pdf'}

def source_set():
    manifest=read_json(MANIFEST);rows=manifest['reviews'];expected={r['code']+'.pdf' for r in rows}
    assert len(rows)==len(expected)==151,'Manifest resource count'
    assert collections.Counter(r['code'].rsplit('-',1)[0] for r in rows)=={'GEN-ECON':26,'MICRO':68,'MACRO':57}
    actual=inventory(SOURCE_DIR);assert set(actual)==expected,'Composer set differs from active manifest'
    for r in rows:
        assert r['pdfPath']==r['code']+'.pdf'
        p=contained(SOURCE_DIR+'/'+r['pdfPath']);v=actual[r['pdfPath']]
        assert v['sha256']==r['sha256'] and v['size']==r['sizeBytes'],('STALE_MANIFEST',r['code'])
        pdf=PdfReader(p);assert len(pdf.pages)==r['pageCount']==1
        assert pdf.metadata.title and pdf.trailer['/Root']['/Lang']==r['documentLanguage']=='en-US'
        assert pdf.pages[0].extract_text().strip() and r['hasSelectableText']
    assert manifest['summary']['totalPdfSizeBytes']==sum(v['size'] for v in actual.values())
    return rows,actual

def equality_gate():
    rows,source=source_set();public=inventory(PUBLIC)
    assert set(public)==set(source),'Missing or orphan public PDF'
    result=[]
    for r in rows:
        name=r['pdfPath'];a=source[name];b=public[name]
        assert a['sha256']==b['sha256'] and a['size']==b['size'],('COPY_MISMATCH',name)
        result.append({'ResourceID':r['code'],'title':r['title'],'ComposerPath':a['path'],'PublicPath':b['path'],'ComposerSHA256':a['sha256'],'PublicSHA256':b['sha256'],'ComposerSize':a['size'],'PublicSize':b['size'],'HashMatch':True,'pageCount':1,'URL':'https://masteryquests.org/concept-reviews/'+name,'equality':'PASS'})
    return result

def rollback(backup):
    state=read_json(backup+'/backup_manifest.json');before={r['filename']:r for r in state['records'] if r['existence']}
    for name in set(inventory(PUBLIC))-set(before):
        p=contained(PUBLIC+'/'+name);assert p.parent==contained(PUBLIC) and p.suffix.lower()=='.pdf';p.unlink()
    for name,r in before.items():shutil.copyfile(contained(r['backupPath']),contained(r['path']))
    assert {n:v['sha256'] for n,v in inventory(PUBLIC).items()}=={n:r['SHA256'] for n,r in before.items()}
    write_json(backup+'/rollback.json',{'status':'PUBLIC PDF STATE ROLLED BACK','hashesVerified':True})

def run():
    root=root_guard();assert contained(SOURCE_DIR).is_dir() and contained(PUBLIC).is_dir()
    probe=contained('tmp/pdf_accessibility/public-sync-write-probe');probe.parent.mkdir(parents=True,exist_ok=True);probe.write_bytes(b'public-sync');assert probe.read_bytes()==b'public-sync';probe.unlink()
    rows,source=source_set();before=inventory(PUBLIC);expected=set(source)
    metadata={str(p.relative_to(root)):sha(p) for p in contained(SOURCE_DIR).glob('*.json')}
    nonpdf={str(p.relative_to(root)):sha(p) for p in contained(PUBLIC).iterdir() if p.is_file() and p.suffix.lower()!='.pdf'}
    missing=sorted(expected-set(before));stale=sorted(set(before)-expected);mismatch=sorted(n for n in expected&set(before) if source[n]['sha256']!=before[n]['sha256'])
    baseline={'task':TASK,'root':str(root),'branch':subprocess.check_output(['git','branch','--show-current'],text=True).strip(),'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'gitStatus':subprocess.check_output(['git','status','--short'],text=True),'writeProbe':'PASS','source':source,'public':before,'missing':missing,'stale':stale,'mismatches':mismatch,'metadata':metadata,'nonPDF':nonpdf}
    write_json(OUT+'/preflight.json',baseline)
    print(f'Source {len(source)}; public {len(before)}; missing {len(missing)}; orphan {len(stale)}; mismatched {len(mismatch)}',flush=True)
    backup='tmp/pdf_accessibility/public_concept_review_backup/'+uuid.uuid4().hex;contained(backup).mkdir(parents=True)
    records=[]
    for name in sorted(expected|set(before)):
        exists=name in before;dest=backup+'/'+name
        if exists:shutil.copyfile(contained(PUBLIC+'/'+name),contained(dest));assert sha(dest)==before[name]['sha256']
        records.append({'filename':name,'path':PUBLIC+'/'+name,'existence':exists,'SHA256':before[name]['sha256'] if exists else None,'size':before[name]['size'] if exists else 0,'expectedActive':name in expected,'backupPath':dest if exists else None})
    write_json(backup+'/backup_manifest.json',{'task':TASK,'records':records,'metadataModified':[]})
    try:
        assert inventory(SOURCE_DIR)==source and inventory(PUBLIC)==before
        for r in rows:
            name=r['pdfPath'];temp=contained(backup+'/copy.tmp');shutil.copyfile(contained(SOURCE_DIR+'/'+name),temp)
            assert sha(temp)==source[name]['sha256'];os.replace(temp,contained(PUBLIC+'/'+name))
        for name in stale:
            assert name not in expected
            p=contained(PUBLIC+'/'+name);assert p.parent==contained(PUBLIC) and p.suffix.lower()=='.pdf';p.unlink()
        equal=equality_gate();print('151/151 public == Composer',flush=True)
        sources={r['code']:r for r in read_json(SOURCE_DIR+'/concept_review_source.json')['reviews']};sem=read_json(SOURCE_DIR+'/accessibility_semantics.json')['pilot']
        checks=[]
        for r in equal:
            code=r['ResourceID'];p=contained(r['PublicPath']);errors=inspect(p,sources[code],metadata=sem[code])['errors'];assert not errors,(code,errors)
            checks.append({'code':code,'path':r['PublicPath'],'opened':True,'structure':'PASS'})
        write_json(OUT+'/structural_checks.json',checks);print('151 installed-path structural checks PASS',flush=True)
        spot=['GEN-ECON-01','GEN-ECON-09','MICRO-49','MICRO-52','MICRO-54','MACRO-11','MACRO-16','MACRO-20','MACRO-38']
        tools=contained('tmp/pdf_accessibility/repo_lock_v1/tools');scratch=contained('tmp/pdf_accessibility/public_sync_v1/validator');scratch.mkdir(parents=True,exist_ok=True)
        cmd=[str(tools/'java/jdk-17.0.16+8-jre/bin/java.exe'),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={scratch}',f'-Dapp.home={tools / "verapdf"}','-cp',str(tools/'verapdf/bin/greenfield-apps-1.28.2.jar'),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json']+[str(contained(PUBLIC+'/'+c+'.pdf')) for c in spot]
        result=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8');contained(OUT+'/public_verapdf.json').write_text(result.stdout,encoding='utf-8');contained(OUT+'/public_verapdf.stderr.log').write_text(result.stderr,encoding='utf-8')
        jobs=json.loads(result.stdout)['report']['jobs'];assert len(jobs)==9
        for j in jobs:
            assert Path(j['itemDetails']['name']).parent==contained(PUBLIC)
            assert len(j['validationResult'])==1 and j['validationResult'][0]['compliant'] and 'PDF/UA-1' in j['validationResult'][0]['profileName']
        print('Public veraPDF PDF/UA-1 9/9 PASS',flush=True)
        subprocess.run([sys.executable,'-B','audit_tools/pdf_accessibility/run_regression.py','public_sync_v1'],check=True)
        reg=read_json(OUT+'/regression/results.json');assert reg['passed']==reg['total']
        subprocess.run([r'C:\Program Files\nodejs\node.exe','audit_tools/pdf_accessibility/public_routing_check.js'],check=True)
        equal=equality_gate();assert inventory(SOURCE_DIR)==source
        assert all(sha(p)==h for p,h in {**metadata,**nonpdf}.items())
        write_json(OUT+'/public_inventory.json',{'task':TASK,'activeCount':151,'composerCount':151,'publicCount':151,'hashMatches':151,'records':equal,'removedOrphans':stale})
        write_json(OUT+'/result.json',{'status':'ALL 151 PUBLIC PDFS INSTALLED AND VERIFIED','backup':backup,'replaced':len(expected&set(before)),'created':len(missing),'removed':stale,'hashMatches':151,'sourceUnchanged':True,'metadataChanged':[],'structuralPass':151,'pdfUaPass':9,'composerPassed':reg['passed'],'composerTotal':reg['total'],'rollbackNeeded':False,'deployed':False,'humanAT':'PENDING'})
        print('ALL 151 PUBLIC PDFS INSTALLED AND VERIFIED',flush=True)
    except BaseException:
        rollback(backup);write_json(OUT+'/result.json',{'status':'PUBLIC PDF STATE ROLLED BACK','backup':backup});raise

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--install',action='store_true');args=p.parse_args()
    if args.install:run()
    else:root_guard();print('PASS',len(equality_gate()))
