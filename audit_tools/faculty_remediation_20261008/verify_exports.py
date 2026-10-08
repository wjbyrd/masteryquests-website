import csv,json,pathlib,hashlib,re,unicodedata
import pypdfium2 as pdfium
R=pathlib.Path(__file__).resolve().parents[2];D=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
ledger=read(D/'expectations.json');report=read(R/'faculty_exports/validation_summary.json')
assert report['source_sha256']==hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert report['status']=='complete' and report['sources_unchanged']
lib=json.loads((R/'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf8')[len('window.MQ_COMPOSER_LIBRARY='):].strip().removesuffix(';'));now={}
def records(x):
 if isinstance(x,dict):
  if 'q'in x and 'options'in x:now[str(x['id'])]=x
  else:
   for v in x.values():records(v)
 elif isinstance(x,list):
  for v in x:records(v)
records(lib)
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('−','-')
counts={};verified={};samples={'micro':['P62H-MCMP-B3-053','P62F-PC-EL-030','P62B-ELAS-C-026','P62I-OLI-EL-022','42356','P62F-PC-M-044'],'macro':['PG5-PC-L-018','ECON-SP-LEGENDARYBOSS-9102','ECON-NL-MEDIUMBOSS-3012'],'general':['P62D-ITP-L-074']}
(D/'pdf-review').mkdir(exist_ok=True)
previous_renders={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (D/'pdf-review').glob('*.png')}
for area in ['general','micro','macro']:
 info=report['disciplines'][area]
 with (R/'faculty_exports'/info['csv_file']).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 assert len(rows)=={'general':1589,'micro':6297,'macro':4747}[area]
 assert len({r['Question ID'] for r in rows})==len(rows)
 table={r['Question ID']:r for r in rows};counts[area]=len(rows)
 for row in rows:
  q=now[row['Question ID']];assert row['Question']==q['q'];assert [row['Choice '+l] for l in 'ABCD']==q['options'];assert row['Feedback']==q.get('feedback','')
 pdf=pdfium.PdfDocument(R/'faculty_exports'/info['pdf_file']);pages=info['question_pages'];verified[area]=[]
 for c in ledger['changes']:
  if area not in c['areas']:continue
  row=table[c['id']];assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
  start=pages[c['id']]-1;text=''
  for n in range(start,min(start+3,len(pdf))):
   page=pdf[n];tp=page.get_textpage();text+=tp.get_text_range();tp.close();page.close()
  q=c['afterRecord'];hay=norm(text)
  for s in [q['q'],*q['options'],q['feedback']]:assert norm(s) in hay,(area,c['id'],s)
  verified[area].append(c['id'])
 for id in samples[area]:
  page=pdf[pages[id]-1];bitmap=page.render(scale=1.5);bitmap.to_pil().save(D/'pdf-review'/f'{id}.png');bitmap.close();page.close()
 pdf.close()
render_identity={p.name:hashlib.sha256(p.read_bytes()).hexdigest()==previous_renders[p.name] for p in (D/'pdf-review').glob('*.png') if p.name in previous_renders}
result={'status':'PASS','sourceSha256':report['source_sha256'],'csvRecords':counts,'allChangedPdfRecordsVerified':{a:len(ids) for a,ids in verified.items()},'allCorrectLettersVerified':True,'renderedSamples':samples,'renderedPixelsMatchPreviousInspection':render_identity,'pdfPages':{a:report['disciplines'][a]['pdf_pages'] for a in counts}}
(D/'export-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
