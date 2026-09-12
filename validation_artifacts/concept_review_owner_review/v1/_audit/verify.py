"""Final read-only checks; writes only package integrity evidence."""
import json,csv,hashlib,subprocess,re
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
from pypdf import PdfReader
OUT=Path(__file__).resolve().parents[1];ROOT=OUT.parents[2]
assert str(ROOT)==r'C:\Users\Jennings\Documents\GitHub\masteryquests-website'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert Path(git('rev-parse','--show-toplevel')).resolve()==ROOT
baseline=json.loads((OUT/'_audit/baseline.json').read_text(encoding='utf-8'))
assert git('rev-parse','HEAD')==baseline['head'] and git('branch','--show-current')==baseline['branch']
for p,h in baseline['protectedHashes'].items():
    path=(ROOT/p).resolve();assert path.is_relative_to(ROOT)
    assert sha(path)==h,p
manifest=json.loads((OUT/'candidate_manifest.json').read_text(encoding='utf-8'))
records=manifest['records'];expected={f'{d}-{n:02d}' for d,c in [('GEN-ECON',26),('MICRO',68),('MACRO',57)] for n in range(1,c+1)}
pdfs=list(OUT.rglob('*.pdf'))
assert len(pdfs)==151 and {p.stem for p in pdfs}==expected
assert len(records)==151 and {r['resourceId'] for r in records}==expected
for r in records:
    src=(ROOT/r['sourceStagedCandidatePath']).resolve();dst=(OUT/r['reviewCopyPath']).resolve()
    assert src.is_relative_to(ROOT) and dst.is_relative_to(OUT)
    assert sha(src)==sha(dst)==r['sourceStagedCandidateSHA256']==r['reviewCopySHA256']
    e=r['validationEvidence'];assert sha(ROOT/e['rawValidatorReport'])==e['rawValidatorReportSHA256']
    assert (ROOT/r['latestApplicableCorrectionReport']).is_file()
    assert len(PdfReader(dst).pages)==1
with (OUT/'REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f);columns=reader.fieldnames;rows=list(reader)
assert len(columns)==28 and len(rows)==151 and {r['Resource'] for r in rows}==expected
byid={r['Resource']:r for r in rows}
for r in rows:
    assert r['WouldGraphOrTableHelp'] in ['NO','GRAPH','TABLE','REVIEW']
    assert r['VisualRecommendation'] and r['CodexFinding'] and r['Outcome']
    assert not r['OwnerDecision'] and not r['ApprovedForInstall'] and not r['OwnerNotes']
    assert sha(OUT/r['CandidatePath'])==r['CandidateSHA256']
    for c,valid in [('ContentCorrectness',['PASS','QUESTION','FAIL']),('CalculationCheck',['PASS','QUESTION','N/A']),('LevelAppropriate',['YES','QUESTION','NO']),('WorkedExampleAlignment',['PASS','QUESTION','FAIL']),('CheckYourselfAlignment',['PASS','QUESTION','FAIL'])]:assert r[c] in valid
for code in ['MICRO-49','MACRO-11','MACRO-12','MACRO-13','MACRO-16','MACRO-20','MICRO-09','GEN-ECON-21','GEN-ECON-22']:assert byid[code]['KnownOwnerIssue']
assert byid['MICRO-09']['WouldGraphOrTableHelp']=='NO'
assert byid['MICRO-09']['OwnerReviewStatus']=='OWNER-REVIEWED — GRAPH INTENTIONALLY NOT ADDED'
assert byid['MACRO-12']['VisualUtility']=='EXISTING GRAPH SHOULD STAY'
p=OUT/'MICRO/MICRO-49.pdf';text=' '.join(PdfReader(p).pages[0].extract_text().split())
assert sha(p)=='512ee726f9d7f4383f2534f4816b9a8b7276f4b563689a4ed7ba32d53de1cd17'
assert 'FINDING A NASH EQUILIBRIUM' in text and 'unique Nash equilibrium' in text
assert text.count('strictly dominant strategy')>=2 and not re.search(r'mixed.strategy',text,re.I)
assert all(t in text for t in ['9 rather than 3','2 rather than 1','(A, X)'])
details=json.loads((OUT/'_audit/details.json').read_text(encoding='utf-8'))
table=next(d['table'] for d in details if d['code']=='MICRO-49')
assert '(1, 1)' in json.dumps(table) and '(7, 7)' not in json.dumps(table)
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,t,a):
        if t=='a':self.links.extend(v for k,v in a if k=='href')
parser=Links();page=(OUT/'index.html').read_text(encoding='utf-8');parser.feed(page)
assert len([l for l in parser.links if l.endswith('.pdf')])==151
assert all((OUT/l).is_file() for l in parser.links)
assert not re.search(r'https?://|fetch\(|XMLHttpRequest|sendBeacon|WebSocket',page)
for name in ['README.md','REVIEW_SUMMARY.md','REVIEW_CHECKLIST.csv','candidate_manifest.json','index.html']:
    assert (OUT/name).read_text(encoding='utf-8-sig').strip()
report=ROOT/'FINAL_REPORT_concept_review_owner_qa.md';assert report.read_text(encoding='utf-8').strip()
status=git('status','--porcelain','--untracked-files=all')
for line in status.splitlines():
    assert line.startswith('?? '),line
    p=line[3:];assert p=='FINAL_REPORT_concept_review_owner_qa.md' or p.startswith('validation_artifacts/concept_review_owner_review/v1/'),line
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
result=dict(task='CONCEPT_REVIEW_OWNER_QA_V1',root=str(ROOT),branch=baseline['branch'],head=baseline['head'],pdfCount=len(pdfs),domainCounts=dict(Counter(r['domain'] for r in records)),exactCopyEquality=151,missingIds=[],duplicateIds=[],protectedHashCount=len(baseline['protectedHashes']),protectedHashesUnchanged=True,rawValidatorHashesVerified=151,pdfPagesOne=151,checklistRows=151,visualQuestionAnswered=151,blankOwnerApprovalFields=151,knownOwnerIssuesPresent=9,micro49CorrectedV2Verified=True,sourceCandidatesUnchanged=True,activeProductionUnchanged=True,sourceAndSemanticsUnchanged=True,activeManifestUnchanged=True,noRegeneration=True,noInstallation=True,noDeployment=True,noCommitOrPush=True,forbiddenWorkspaceUnused=True,gitDiffCheck='PASS',humanAT='PENDING',instructionalApproval='PENDING',reopenedDocuments=['README.md','REVIEW_CHECKLIST.csv','REVIEW_SUMMARY.md','FINAL_REPORT_concept_review_owner_qa.md'])
(OUT/'_audit/integrity.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
