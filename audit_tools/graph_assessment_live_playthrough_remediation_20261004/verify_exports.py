from review_tools import *
import csv,hashlib,subprocess,concurrent.futures,shutil
from PIL import Image,ImageOps,ImageDraw
S=json.loads((ROOT/'faculty_exports/validation_summary.json').read_text())
L=json.loads((HERE/'expectations.json').read_text())
assert S['status']=='complete' and S['sources_unchanged']
assert S['source_sha256']==hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
OUT=EVIDENCE/'pdf-review';OUT.mkdir(exist_ok=True)
changes={c['id']:c for c in L['changes']};result={'source_sha256':S['source_sha256'],'disciplines':{},'renderedPages':[]}
for area,d in S['disciplines'].items():
 file=ROOT/'faculty_exports'/d['pdf_file'].replace('.pdf','.csv')
 rows={r['Question ID']:r for r in csv.DictReader(file.open(encoding='utf-8-sig',newline=''))}
 old={r['Question ID']:r for r in csv.DictReader((EVIDENCE/file.name).open(encoding='utf-8-sig',newline=''))}
 assert set(rows)==set(old)
 matched=0
 for id,c in changes.items():
  if id not in rows:continue
  q=c['afterRecord'];r=rows[id];assert r['Question']==q['q'];assert r['Feedback']==q['feedback']
  assert [r['Choice '+letter] for letter in 'ABCD']==q['options']
  assert r['Correct Answer'].startswith('ABCD'[c['correctIndex']])
  assert q['canonicalDifficulty'].lower() in r['Difficulty'].lower()
  matched+=1
 result['disciplines'][area]={'idsUnchanged':len(rows),'changedRecordsVerified':matched,'pdfRoundtripQuestions':d['pdf_questions'],'pdfPages':d['pdf_pages']}
# One actual exported page per changed graph, plus every live seed and a Macro
# control page. Poppler, rather than source image inspection, verifies embedding.
pages={}
for asset in L['assets']:
 ids=[i for i in asset['referencingIds'] if i in changes]
 if not ids:ids=asset['referencingIds']
 id=next(i for i in ids if i in S['disciplines']['micro']['question_pages'])
 page=S['disciplines']['micro']['question_pages'][id]
 pages.setdefault(('micro',page),[]).append({'id':id,'asset':asset['path']})
scope=json.loads((HERE/'scope.json').read_text())
for id in scope['seed_ids']:
 area='general' if id in S['disciplines']['general']['question_pages'] else 'micro'
 pages.setdefault((area,S['disciplines'][area]['question_pages'][id]),[]).append({'id':id,'liveSeed':True})
pages[('macro',6)]=[{'control':'Unchanged Macro export'}]
for id in ['P62F-PC-EL-018','P62F-PC-EL-043','P62F-PC-H-015','P62F-PC-L-068','P62F-PC-LB-013','P62F-PC-M-043']:
 pages.setdefault(('micro',S['disciplines']['micro']['question_pages'][id]),[]).append({'id':id,'finalTwoPanelCheck':True})
for id in changes:
 if id in S['disciplines']['macro']['question_pages']:
  pages.setdefault(('macro',S['disciplines']['macro']['question_pages'][id]),[]).append({'id':id,'sharedMacroRecord':True})
  break
poppler=shutil.which('pdftoppm');assert poppler
def render(row):
 (area,page),refs=row
 name=f'{area}-{page:04}'
 subprocess.run([poppler,'-f',str(page),'-l',str(page),'-scale-to','1300','-png','-singlefile',str(ROOT/'faculty_exports'/S['disciplines'][area]['pdf_file']),str(OUT/name)],check=True,capture_output=True)
 return {'area':area,'page':page,'references':refs,'file':name+'.png'}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:result['renderedPages']=list(pool.map(render,sorted(pages.items())))
for start in range(0,len(result['renderedPages']),2):
 sheet=Image.new('RGB',(2020,1340),'#ddd');draw=ImageDraw.Draw(sheet)
 for k,row in enumerate(result['renderedPages'][start:start+2]):
  im=Image.open(OUT/row['file']);im=ImageOps.contain(im,(1000,1300));sheet.paste(im,(k*1010,30));draw.text((k*1010+5,5),row['file'],fill='black')
 sheet.save(OUT/f'sheet-{start:02}.png')
(OUT/'index.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'disciplines':result['disciplines'],'renderedPages':len(pages)}))
