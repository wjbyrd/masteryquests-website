"""Independently reconcile the regenerated faculty files with canonical edits."""
from pathlib import Path
import csv, hashlib, html, json, re, unicodedata, argparse
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(HERE/'expectations.json')
parser=argparse.ArgumentParser()
parser.add_argument('--report-directory',type=Path,default=HERE)
parser.add_argument('--additions',type=Path)
args=parser.parse_args()
REPORT=args.report_directory
if args.additions:
    additions=read(args.additions)['additions']
    ledger['changes'] += [{'id':a['question']['id'],'afterRecord':a['question'],'correctIndex':a['correctIndex']} for a in additions]
report=read(OUT/'validation_summary.json')
assert report['status']=='complete' and report['sources_unchanged']
assert report['source_sha256']==hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
norm=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',html.unescape(re.sub('<[^>]+>','',str(s))))).replace('−','-').replace('\u00ad','')
samples={'general':['P77-MVM-EASYB-023','P62D-ITP-B1-012','PG2-CEIL-E-001'],'micro':['P62H-MCMP-B1-002','P62G-MON-B1-014','PM5-PC-R-043','PM8-OLI-R-073','P62F-PC-E-041','PM8-OLI-E-032'],'macro':['LG-Q-2009','PM2C2-FISH-EB-001','PMOE-RER-B1-002','PG3-AS-E-002','ECON-NL-EASYBOSS-2035']}
if args.additions:samples['macro']=[a['question']['id'] for a in additions]
result={'status':'PASS','sourceSha256':report['source_sha256'],'disciplines':{}}
(REPORT/'qa').mkdir(exist_ok=True,parents=True)
for area,info in report['disciplines'].items():
    with (OUT/info['csv_file']).open(encoding='utf-8-sig',newline='') as f:
        rows=list(csv.DictReader(f))
    by_id={r['Question ID']:r for r in rows}
    assert len(by_id)==len(rows)
    pdf=pdfium.PdfDocument(OUT/info['pdf_file'])
    pages=info['question_pages']
    cache={}
    def text_at(p):
        if p not in cache:
            page=pdf[p]; text=page.get_textpage();cache[p]=text.get_text_range();text.close();page.close()
        return cache[p]
    changed=[]
    for c in ledger['changes']:
        if c['id'] not in by_id:continue
        row=by_id[c['id']];q=c['afterRecord'];assert row['Question']==q['q']
        assert [row['Choice '+x] for x in 'ABCD']==q['options']
        assert row['Feedback']==q.get('feedback','')
        assert row['Difficulty'].lower()==q['canonicalDifficulty']
        assert row['Correct Answer'].startswith('ABCD'[c['correctIndex']]+' ')
        start=pages[c['id']]-1
        hay=norm(''.join(text_at(p) for p in range(start,min(start+3,len(pdf)))))
        for value in [q['q'],*q['options'],q.get('feedback','')]:
            assert norm(value) in hay,(area,c['id'],'PDF content missing',value)
        changed.append(c['id'])
    selected=[q for q in samples[area] if q in pages]
    images=[]
    for identity in selected:
        p=pages[identity]-1;page=pdf[p];bitmap=page.render(scale=1.25);im=bitmap.to_pil().convert('RGB')
        im.save(REPORT/'qa'/f'{area}-{identity}.png');bitmap.close();page.close()
        thumb=im.copy();thumb.thumbnail((510,710));card=Image.new('RGB',(530,745),'#dddddd');card.paste(thumb,((530-thumb.width)//2,25));ImageDraw.Draw(card).text((12,8),f'{identity} / page {p+1}',fill='black');images.append(card)
    if images:
        contact=Image.new('RGB',(530*min(3,len(images)),745*((len(images)+2)//3)),'white')
        for i,im in enumerate(images):contact.paste(im,((i%3)*530,(i//3)*745))
        contact.save(REPORT/'qa'/f'{area}-pdf-contact.png')
    result['disciplines'][area]={'rows':len(rows),'pdfPages':len(pdf),'changedQuestionsVerified':len(changed),'visuallySampledQuestions':selected}
    pdf.close()
(REPORT/'export-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print(json.dumps(result))
