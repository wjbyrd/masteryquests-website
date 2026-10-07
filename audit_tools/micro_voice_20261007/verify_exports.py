import csv,json,pathlib,hashlib,re,unicodedata
import pypdfium2 as pdfium
R=pathlib.Path(__file__).resolve().parents[2];D=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(D/'expectations.json'); report=read(R/'faculty_exports/validation_summary.json')
assert report['source_sha256']==hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert report['status']=='complete' and report['sources_unchanged']
def loadlib(p):return json.loads(p.read_text(encoding='utf-8')[len('window.MQ_COMPOSER_LIBRARY='):].strip().removesuffix(';'))
def records(obj,out):
 if isinstance(obj,dict):
  if 'id'in obj and 'q'in obj and 'options'in obj and 'aHash'in obj:
   id=str(obj['id']);assert id not in out or out[id]==obj;out[id]=obj
  else:
   for v in obj.values():records(v,out)
 elif isinstance(obj,list):
  for v in obj:records(v,out)
now={};old={};records(loadlib(R/'build/faculty-build-composer/data/composer_library.js'),now);records(loadlib(D/'baseline/composer_library.js'),old)
tables={};counts={}
for area in ['general','micro','macro']:
 info=report['disciplines'][area]
 with (R/'faculty_exports'/info['csv_file']).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 assert len(rows)=={'general':1589,'micro':6297,'macro':4747}[area]
 assert len({r['Question ID'] for r in rows})==len(rows)
 for row in rows:
  q=now[row['Question ID']]
  assert row['Question']==q['q'],row['Question ID']
  assert [row['Choice '+l] for l in 'ABCD']==q['options']
  assert row['Feedback']==q.get('feedback','')
  if area!='micro':assert q==old[row['Question ID']]
 tables[area]={r['Question ID']:r for r in rows};counts[area]=len(rows)
for c in ledger['changes']:
 row=tables['micro'][c['id']];assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('−','-')
pdf=pdfium.PdfDocument(R/'faculty_exports'/report['disciplines']['micro']['pdf_file'])
pages=report['disciplines']['micro']['question_pages'];verified=[]
for c in ledger['changes']:
 start=pages[c['id']]-1;text=''
 for n in range(start,min(start+3,len(pdf))):
  page=pdf[n];tp=page.get_textpage();text+=tp.get_text_range();tp.close();page.close()
 q=c['afterRecord'];hay=norm(text)
 for s in [q['q'],*q['options'],q['feedback']]:assert norm(s) in hay,(c['id'],s)
 verified.append(c['id'])
sample=['42367','42334','42737','P62F-PC-B3-057','P62F-PC-L-099','P62C-CPS-H-018','P62C-CPS-LB-030','P62C-CPS-B3-011','P62B-ELAS-EL-001','P62G-MON-B2-021','PM5-PC-BR-012','PMC-COP-BR-028']
(D/'pdf-review').mkdir(exist_ok=True)
for id in sample:
 page=pdf[pages[id]-1];bitmap=page.render(scale=1.5);image=bitmap.to_pil();image.save(D/'pdf-review'/f'{id}.png');bitmap.close();page.close()
pdf.close()
result={'status':'PASS','sourceSha256':report['source_sha256'],'csvRecords':counts,'allChangedPdfRecordsVerified':len(verified),'allCorrectLettersVerified':True,'renderedSamples':sample,'pdfPages':{a:report['disciplines'][a]['pdf_pages'] for a in counts}}
(D/'export-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))
