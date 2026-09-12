"""Installed-path checks, independent representative validation and Composer tests."""
from install_composer_validated import *
from staged_gate import assess
OUT='validation_artifacts/pdf_accessibility/canonical_completion_v1'
def main():
    installed=read_json(OUT+'/composer_install.json');assert installed['status']=='ALL 151 INSTALLED AND VERIFIED'
    rows=read_json(OUT+'/final_validation.json');backup=installed['backup'];public=public_state()
    try:
        verify(rows)
        tools=contained('tmp/pdf_accessibility/repo_lock_v1/tools');scratch=contained('tmp/pdf_accessibility/canonical_completion_v1/postinstall-validator');scratch.mkdir(parents=True,exist_ok=True)
        codes=['GEN-ECON-01','GEN-ECON-09','MICRO-49','MICRO-52','MACRO-11','MACRO-16','MACRO-20','MACRO-38']
        cmd=[str(tools/'java/jdk-17.0.16+8-jre/bin/java.exe'),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={scratch}',f'-Dapp.home={tools / "verapdf"}','-cp',str(tools/'verapdf/bin/greenfield-apps-1.28.2.jar'),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json']+[str(contained(DEST+'/'+c+'.pdf')) for c in codes]
        result=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8');report=OUT+'/installed_verapdf.json';contained(report).write_text(result.stdout,encoding='utf-8')
        jobs=json.loads(result.stdout)['report']['jobs'];assert len(jobs)==8
        for j in jobs:
            assert Path(j['itemDetails']['name']).parent==contained(DEST)
            assert len(j['validationResult'])==1 and j['validationResult'][0]['compliant'] and 'PDF/UA-1' in j['validationResult'][0]['profileName']
        print('Installed veraPDF: 8/8 PASS',flush=True)
        gate=assess(rows,OUT+'/review_receipt.json',scope='composer');write_json(OUT+'/installed_staged_gate.json',gate);assert gate['passed']==151 and not gate['blocked']
        print('Installed project gate: 151/151 PASS',flush=True)
        reg=contained(OUT+'/regression');pre=contained(OUT+'/regression_preinstall')
        if not pre.exists():shutil.copytree(reg,pre)
        result=subprocess.run([sys.executable,'-B','audit_tools/pdf_accessibility/run_regression.py','canonical_completion_v1'])
        tests=read_json(OUT+'/regression/results.json');assert result.returncode==0 and tests['passed']==tests['total']
        assert public_state()==public;verify(rows)
        write_json(OUT+'/postinstall_result.json',{'status':'PASS','structuralResources':151,'independentPDFUA':8,'composerPassed':tests['passed'],'composerTotal':tests['total'],'publicUnchanged':True,'humanAT':'PENDING','runtimeDelivery':'Existing Composer uses public URLs; local source resolution and runtime hash metadata use installed PDFs. No public deployment performed.'})
    except BaseException:
        restore(backup);write_json(OUT+'/composer_install.json',{'status':'ROLLED BACK','backup':backup});raise
if __name__=='__main__':
    import sys
    main()
