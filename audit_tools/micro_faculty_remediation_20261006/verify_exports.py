"""Validate exact exported rows and render actual PDF pages with Poppler."""
import json,csv,hashlib,subprocess,shutil,concurrent.futures
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import pdfplumber
H=Path(__file__).resolve().parent;R=H.parent.parent
S=json.loads((R/'faculty_exports/validation_summary.json').read_text());L=json.loads((H/'expectations.json').read_text());B=json.loads((H/'baseline_records.json').read_text());O=H/'pdf-review';O.mkdir(exist_ok=True)
assert S['status']=='complete' and S['sources_unchanged']
assert S['source_sha256']==hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
result={'source_sha256':S['source_sha256'],'librarySha256':L['afterLibrarySha256'],'disciplines':{},'assets':[],'additionalPages':[]}
transferred={'ECON-EC-LEGENDARYBOSS-20022','ECON-EC-LEGENDARYBOSS-20023'}
for area,d in S['disciplines'].items():
 rows={r['Question ID']:r for r in csv.DictReader((R/'faculty_exports'/d['csv_file']).open(encoding='utf-8-sig',newline=''))};expected={i for i,b in B.items() if area in b['areas']}
 if area=='micro':expected-=transferred
 if area=='macro':expected|=transferred
 assert set(rows)==expected,(area,'exact export ID membership')
 n=0
 for c in L['changes']:
  if c['id'] not in rows:continue
  q=c['afterRecord'];r=rows[c['id']]
  assert r['Question']==q['q'],c['id'];assert r['Feedback']==q['feedback'],c['id']
  assert [r['Choice '+k] for k in 'ABCD']==q['options'],c['id'];assert r['Correct Answer'].startswith('ABCD'[c['correctIndex']]),c['id']
  tiers={'easy','medium','hard','elite','legendary'}
  tier=q.get('canonicalDifficulty') if q.get('canonicalDifficulty') in tiers else q.get('difficulty','')
  assert r['Difficulty']==(tier.title() if tier in tiers else ''),c['id'];n+=1
 result['disciplines'][area]={'exactIds':len(rows),'changedRowsVerified':n,'pdfRoundtripQuestions':d['pdf_questions'],'pdfPages':d['pdf_pages']}
pages={};docs={a:pdfplumber.open(R/'faculty_exports'/d['pdf_file']) for a,d in S['disciplines'].items()}
for i,a in enumerate(L['assets']):
 area,id=next((ar,id) for ar in ['micro','general','macro'] for id in a['referencingIds'] if id in S['disciplines'][ar]['question_pages']);pg=S['disciplines'][area]['question_pages'][id]
 p=docs[area].pages[pg-1]
 if not p.images:pg+=1;p=docs[area].pages[pg-1]
 assert p.images,(a['path'],'PDF graph missing')
 bounds=[(v['x0'],v['top'],v['x1'],v['bottom']) for v in p.images]
 row={'index':i,'asset':a['path'],'area':area,'id':id,'page':pg,'file':f'{area}-{pg:04}.png','imageBounds':bounds,'pageSize':[p.width,p.height]};result['assets'].append(row);pages[(area,pg)]=row
for ar,id in [('micro','PM8-OLI-BR-026'),('micro','P62E-COP-L-060'),('micro','P62C-CPS-L-029'),('macro','ECON-EC-LEGENDARYBOSS-20022'),('macro','ECON-EC-LEGENDARYBOSS-20023')]:
 pg=S['disciplines'][ar]['question_pages'][id];row={'id':id,'area':ar,'page':pg,'file':f'{ar}-{pg:04}.png'};pages[(ar,pg)]=row;result['additionalPages'].append(row)
poppler=shutil.which('pdftoppm');assert poppler

def render(k):
 ar,pg=k;name=f'{ar}-{pg:04}';subprocess.run([poppler,'-f',str(pg),'-l',str(pg),'-scale-to','1600','-png','-singlefile',str(R/'faculty_exports'/S['disciplines'][ar]['pdf_file']),str(O/name)],check=True,capture_output=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(render,pages))
for start in range(0,len(result['assets']),4):
 sheet=Image.new('RGB',(1800,1200),'#ddd');d=ImageDraw.Draw(sheet)
 for k,row in enumerate(result['assets'][start:start+4]):
  im=Image.open(O/row['file']).convert('RGB');sx=im.width/row['pageSize'][0];sy=im.height/row['pageSize'][1];bs=row['imageBounds'];box=(min(v[0] for v in bs)*sx,min(v[1] for v in bs)*sy,max(v[2] for v in bs)*sx,max(v[3] for v in bs)*sy);im=im.crop(box);im=ImageOps.contain(im,(890,560));x=k%2*900;y=k//2*600;sheet.paste(im,(x,y+35));d.text((x+5,y+5),f"{row['index']:02} {row['asset'].split('/')[-1]} / PDF {row['page']}",fill='black')
 sheet.save(O/f'graphs-{start:02}.jpg',quality=95)
for doc in docs.values():doc.close()
result['status']='PASS';(H/'export-validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':'PASS','areas':result['disciplines'],'graphAssetsRendered':len(result['assets']),'actualPagesRendered':len(pages)}))
