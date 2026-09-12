"""Explicit Composer-only transaction, durable backup and verified rollback."""
from install_validated import prepare,MANIFEST,RELEASES
from repo_guard import *
from accessibility_gate import inspect
from pypdf import PdfReader
import uuid,shutil
DEST='build/faculty-build-composer/data/concept-reviews'

def public_state():
    return {str(p.relative_to(EXPECTED_ROOT)):sha(p) for p in contained('concept-reviews').rglob('*') if p.is_file()}

def restore(backup):
    b=read_json(contained(backup)/'backup_manifest.json')
    for r in b['records']:
        p=contained(r['path'])
        if r['existed']:shutil.copyfile(contained(r['backup']),p)
        elif p.exists():p.unlink()
    for r in b['records']:assert (sha(r['path']) if contained(r['path']).exists() else None)==r['oldSHA256']
    write_json(contained(backup)/'rollback.json',{'status':'ROLLED BACK','verified':True})

def verify(records):
    from validate_candidates import SOURCE,SEMANTICS
    source={r['code']:r for r in read_json(SOURCE)['reviews']};sem=read_json(SEMANTICS)['pilot'];rows=[]
    expected={r['code']+'.pdf' for r in records}
    assert {p.name for p in contained(DEST).glob('*.pdf')}==expected
    manifest=read_json(MANIFEST);known={r['code']:r for r in manifest['reviews']}
    for r in records:
        code=r['code'];p=contained(DEST+'/'+code+'.pdf');pdf=PdfReader(p)
        assert sha(p)==r['sha256'] and len(pdf.pages)==1
        assert pdf.trailer['/Root']['/Lang']=='en-US' and pdf.metadata.title
        errors=inspect(p,source[code],metadata=sem[code])['errors'];assert not errors,(code,errors)
        assert known[code]['sha256']==sha(p) and known[code]['sizeBytes']==p.stat().st_size
        rows.append({'code':code,'path':str(p.relative_to(EXPECTED_ROOT)),'candidateSHA256':r['sha256'],'installedSHA256':sha(p),'sizeBytes':p.stat().st_size,'pageCount':1,'title':pdf.metadata.title,'language':'en-US','structure':'PASS'})
    assert manifest['summary']['totalPdfSizeBytes']==sum(r['sizeBytes'] for r in rows)
    return rows

def install(validation,review,package,evidence):
    root_guard();assert len(validation)==151 and len({r['code'] for r in validation})==151
    manifest=read_json(contained(package)/'candidate_manifest.json')
    assert len(manifest['records'])==151
    bycode={r['code']:r for r in validation}
    for r in manifest['records']:assert sha(r['reviewCopyPath'])==r['reviewCopySHA256']==bycode[r['resourceId']]['sha256']
    assert contained(package+'/REVIEW_CHECKLIST.csv').exists()
    from staged_gate import assess
    gate=assess(validation,review,scope='composer');assert gate['passed']==151 and not gate['blocked']
    plan=prepare(validation,review,scope='composer');public=public_state()
    backup='tmp/pdf_accessibility/composer_install_backup/'+uuid.uuid4().hex
    contained(backup).mkdir(parents=True)
    paths=[DEST+'/'+r['code']+'.pdf' for r in validation]+[MANIFEST,RELEASES];originals=[]
    for i,name in enumerate(paths):
        p=contained(name);dest=backup+'/'+str(i)+'-'+p.name;exists=p.exists()
        if exists:shutil.copyfile(p,contained(dest));assert sha(dest)==sha(p)
        originals.append({'path':name,'existed':exists,'oldSHA256':sha(p) if exists else None,'sizeBytes':p.stat().st_size if exists else 0,'backup':dest if exists else None})
    write_json(backup+'/backup_manifest.json',{'records':originals,'scope':'COMPOSER ONLY','public':public})
    write_json(evidence+'/installation_preview.json',{'scope':'COMPOSER ONLY','logicalResources':151,'destinationCopies':151,'plan':plan})
    try:
        fresh=prepare(validation,review,scope='composer');assert fresh==plan
        active=read_json(MANIFEST);releases=read_json(RELEASES) if contained(RELEASES).exists() else {}
        for r in plan['records']:
            assert len(r['targets'])==1 and contained(r['targets'][0]).parent==contained(DEST)
            staged=contained(backup+'/new.pdf');shutil.copyfile(contained(r['candidate']),staged);assert sha(staged)==r['sha256'];os.replace(staged,contained(r['targets'][0]))
            item=next(i for i in active['reviews'] if i['code']==r['code'])
            item.update(sha256=r['sha256'],sizeBytes=r['sizeBytes'],pageCount=1,documentLanguage='en-US',hasSelectableText=True)
            releases[r['code']]={**r['evidence'],'installationScope':'COMPOSER ONLY'}
        active['summary']['totalPdfSizeBytes']=sum(r['sizeBytes'] for r in active['reviews'])
        write_json(MANIFEST,active);write_json(RELEASES,releases)
        rows=verify(validation);assert public_state()==public
        result={'status':'ALL 151 INSTALLED AND VERIFIED','scope':'COMPOSER ONLY','backup':backup,'records':rows,'publicUnchanged':True,'humanAT':'PENDING'}
        write_json(evidence+'/composer_install.json',result);return result
    except BaseException:
        restore(backup);assert public_state()==public
        write_json(evidence+'/composer_install.json',{'status':'ROLLED BACK','backup':backup})
        raise

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--install',action='store_true',required=True);args=p.parse_args()
    evidence='validation_artifacts/pdf_accessibility/canonical_completion_v1'
    print(install(read_json(evidence+'/final_validation.json'),evidence+'/review_receipt.json','validation_artifacts/concept_review_owner_review/v4',evidence)['status'])
