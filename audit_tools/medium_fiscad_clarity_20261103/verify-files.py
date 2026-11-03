"""Verify the delivered item and preserve all unrelated workbook content."""
from pathlib import Path
import csv,hashlib,json,re,subprocess
import pypdfium2 as pdfium
from openpyxl import load_workbook
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports';read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
ledger=read(HERE/'expectations.json');c=ledger['changes'][0];identity=c['id'];q=c['afterRecord'];report=read(OUT/'validation_summary.json');info=report['disciplines']['macro']
source_hash=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest();assert report['source_sha256']==source_hash
with (OUT/info['csv_file']).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
with (HERE/'baseline/macroeconomics_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:prior=list(csv.DictReader(f))
assert len(rows)==len(prior)==4775
for b,a in zip(prior,rows):
    if a['Question ID']!=identity:assert a==b
row=next(r for r in rows if r['Question ID']==identity)
assert row['Question']==q['q'] and row['Feedback']==q['feedback'] and [row['Choice '+v] for v in 'ABCD']==q['options']
assert row['Correct Answer']=='C — $120'
page_number=info['question_pages'][identity];pdf=pdfium.PdfDocument(OUT/info['pdf_file']);page=pdf[page_number-1];tp=page.get_textpage();text=tp.get_text_bounded();norm=lambda s:re.sub(r'\s+','',s).replace('−','-')
for value in [q['q'],*q['options'],q['feedback']]:assert norm(value) in norm(text),value
tp.close();page.close();pdf.close()
poppler=Path('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1026-487-0_26.1026.487.0_x64__3k8sg7r9htsxt/dependencies/native/poppler/Library/bin/pdftoppm.exe')
subprocess.run([str(poppler),'-f',str(page_number),'-l',str(page_number),'-singlefile','-scale-to','1500','-png',str(OUT/info['pdf_file']),str(HERE/'qa/question-pdf')],check=True,capture_output=True)
old=load_workbook(HERE/'baseline/macroeconomics_question_bank.xlsx');new=load_workbook(OUT/'macroeconomics_question_bank.xlsx');assert old.sheetnames==new.sheetnames
b,a=old.active,new.active;assert b.max_row==a.max_row and b.max_column==a.max_column;assert b.freeze_panes==a.freeze_panes and b.data_validations==a.data_validations and list(b.tables)==list(a.tables)
scanned=0;target=None
for br,ar in zip(b.iter_rows(),a.iter_rows()):
    changed=ar[0].value==identity
    if changed:target=ar
    for bc,ac in zip(br,ar):
        assert ac.data_type!='e'
        if not (changed and 7<=ac.column<=13):assert bc.value==ac.value,(ac.coordinate,'Unrelated cell changed')
        scanned+=1
assert target and target[6].value==q['q'] and [x.value for x in target[7:11]]==q['options'] and target[11].value=='C — $120' and target[12].value==q['feedback']
old.close();new.close()
assert abs(.6*80/(1-.6)-120)<1e-9
review=read(HERE/'review-validation.json');assert review['status']=='PASS'
outcomes=read(HERE/'test-output/faculty-lo-results.json');assert outcomes['ok']
result={'status':'PASS','id':identity,'librarySha256':ledger['afterLibrarySha256'],'sourceSha256':source_hash,'questionAnswerExplanationAgree':True,'unchangedOtherMacroRows':4774,'workbookCellsScanned':scanned,'reviewHistoryPreserved':True,'pendingInstructorReview':True,'pdfPage':page_number,'facultyOutcomeAssertions':outcomes['assertions'],'artifacts':[{ 'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [OUT/info['pdf_file'],OUT/'macroeconomics_question_bank.xlsx']]}
(HERE/'validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
