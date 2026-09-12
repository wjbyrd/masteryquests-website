"""Final read-only safety/integrity checks for QA v2 and protected production."""
import csv,json,subprocess,ast,re
from html.parser import HTMLParser
import qa_remediation as q
from qa_package import PACKAGE,REPORT
from accessibility_gate import inspect
from test_micro49_content import check_content

def main():
    root=q.root_guard();baseline=q.read_json(q.EVIDENCE+'/baseline.json')
    assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==baseline['head']
    for p,h in baseline['protected'].items():assert q.sha(p)==h,p
    # Git identifies any tracked change outside the source/tool/evidence scope.
    tracked=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()
    assert all(p.startswith('audit_tools/pdf_accessibility/') or p in [q.SOURCE,q.SEMANTICS] for p in tracked),tracked
    assert not any(q.contained('concept-reviews/MICRO-'+str(i)+'.pdf').exists() for i in range(54,69))
    assert q.sha(q.QA+'/candidate_manifest.json')==baseline['qaManifestSha256']
    manifest=q.read_json(PACKAGE+'/candidate_manifest.json');rows=list(csv.DictReader(q.contained(PACKAGE+'/REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig')))
    assert len(rows)==151 and len({r['Resource'] for r in rows})==151
    assert len(list(q.contained(PACKAGE).glob('*/*.pdf')))==151
    current={r['code']:r for r in q.read_json(q.EVIDENCE+'/final_validation.json')}
    for r in manifest['records']:
        assert q.sha(r['reviewCopyPath'])==q.sha(r['sourceStagedCandidatePath'])==current[r['resourceId']]['sha256']==r['reviewCopySHA256']
    for r in rows:
        assert r['WouldGraphOrTableHelp'] and not r['OwnerFinalReview'] and not r['ApprovedForInstall'] and not r['OwnerDecision']
        assert r['RemediationStatus'] in ['FIXED','PRESERVED_BY_OWNER_DECISION','NOT_APPLICABLE']
        if r['OriginalPriority'] in ['HIGH','MEDIUM','LOW']:assert r['RemediationStatus'] in ['FIXED','PRESERVED_BY_OWNER_DECISION']
    known=['MICRO-49','MACRO-11','MACRO-12','MACRO-13','MACRO-16','MACRO-20','MICRO-09','GEN-ECON-21','GEN-ECON-22']
    assert all(next(r for r in rows if r['Resource']==code)['KnownOwnerIssue'] for code in known)
    sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};meta=q.read_json(q.SEMANTICS)['pilot']
    assert not sources['MICRO-09']['content']['graph'] and sources['MACRO-12']['content']['graph']
    assert not sources['MACRO-11']['content']['graph'] and not sources['MACRO-13']['content']['graph']
    assert not check_content(sources['MICRO-49'],meta['MICRO-49'])
    for code in known:
        pdf=PACKAGE+'/'+code.rsplit('-',1)[0]+'/'+code+'.pdf'
        assert not inspect(pdf,sources[code],metadata=meta[code])['errors'],code
    class Links(HTMLParser):
        def __init__(self):super().__init__();self.links=[]
        def handle_starttag(self,tag,attrs):
            for k,v in attrs:
                if k in ['href','src']:self.links.append(v)
    parser=Links();index=q.contained(PACKAGE+'/index.html').read_text(encoding='utf8');parser.feed(index)
    assert len([x for x in parser.links if x.endswith('.pdf')])==151
    for link in parser.links:assert not re.match(r'\w+:|//',link) and q.contained(PACKAGE+'/'+link).exists()
    for p in q.contained('audit_tools/pdf_accessibility').glob('*.py'):ast.parse(p.read_text(encoding='utf-8-sig'))
    reopened={}
    for p in ['README.md','REVIEW_CHECKLIST.csv','REVIEW_SUMMARY.md','CHANGELOG.md','candidate_manifest.json','index.html']:
        value=q.contained(PACKAGE+'/'+p).read_text(encoding='utf-8-sig');assert value.strip();reopened[p]=q.sha(PACKAGE+'/'+p)
    report=q.contained(REPORT).read_text(encoding='utf8');assert 'OWNER-QA REMEDIATION COMPLETE — V2 REVIEW PACKAGE READY' in report
    assert q.read_json(q.EVIDENCE+'/staged_gate.json')['passed']==151
    preview=q.read_json(q.EVIDENCE+'/installation_preview.json');assert len(preview['records'])==151 and sum(len(r['targets']) for r in preview['records'])==302
    assert sum(x is None for r in preview['records'] for x in r['expected'])==15 and preview['installationExecuted'] is False
    diff=subprocess.run(['git','diff','--check'],capture_output=True,text=True);assert diff.returncode==0,diff.stdout
    q.write_json(q.EVIDENCE+'/final_safety.json',{'task':'CONCEPT_REVIEW_QA_REMEDIATION_V1','root':str(root),'head':baseline['head'],
        'protectedHashesUnchanged':len(baseline['protected']),'packagedPdfs':151,'copyEquality':151,'allFindingsHaveDisposition':True,
        'ownerDecisionsRespected':True,'knownOwnerPdfSemanticsReopened':known,'documentsReopened':reopened,'reportSha256':q.sha(REPORT),
        'stagedGate':151,'installationPerformed':False,'deploymentPerformed':False,'humanAT':'PENDING','forbiddenWorkspaceUsed':False,'gitDiffCheck':'PASS'})
    print('Final safety PASS: 151 exact copies;',len(baseline['protected']),'protected hashes unchanged; all findings disposed; owner approvals blank.')

if __name__=='__main__':main()
