"""Read active manifest/PDFs once and retain per-copy baseline evidence."""
from repo_guard import *
from pypdf import PdfReader
import collections, importlib.metadata, re, sys

ROOT = root_guard()
OUT = contained('validation_artifacts/pdf_accessibility')
if (OUT/'baseline_hashes.json').exists():
    raise RuntimeError('Baseline already exists; retain it and resume the saved inventory rather than overwrite evidence')
COMPOSER = contained('build/faculty-build-composer')
SOURCE_REL = 'build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
MANIFEST_REL = 'build/faculty-build-composer/data/concept-reviews/manifest.json'
manifest = read_json(MANIFEST_REL)
source = read_json(SOURCE_REL)
print('Manifest keys:', list(manifest))
print('Review fields:', list(manifest['reviews'][0]))
print('Source keys:', list(source))
print('Public folder uses links rather than a root manifest; trace routing separately.')
tracked = subprocess.check_output(['git','-C',str(ROOT),'ls-files','-z']).decode().split('\0')
hashes = {}
for relative in tracked:
    if relative and contained(relative).is_file():
        hashes[relative] = sha(relative)
write_json(OUT/'baseline_hashes.json', {'task':TASK,'root':str(ROOT),'commit':subprocess.check_output(['git','-C',str(ROOT),'rev-parse','HEAD'],text=True).strip(),'files':hashes})
source_by_code = {r['code']:r for r in source['reviews']}
records = []
for review in manifest['reviews']:
    code = review['code']
    current = source_by_code.get(code)
    copies = []
    for rel in [f"build/faculty-build-composer/data/concept-reviews/{review['pdfPath']}", f"concept-reviews/{review['pdfPath']}"]:
        path = contained(rel)
        if not path.is_file():
            copies.append({'path':rel, 'missing':True}); continue
        reader = PdfReader(path, strict=True)
        catalog = reader.trailer['/Root']
        texts = [p.extract_text() or '' for p in reader.pages]
        fonts, links, images = [], [], []
        for i,page in enumerate(reader.pages):
            resources = page.get('/Resources',{})
            for name, obj in resources.get('/Font',{}).items():
                f = obj.get_object()
                desc = f.get('/FontDescriptor')
                desc = desc.get_object() if desc else {}
                fonts.append({'page':i+1,'name':str(name),'baseFont':str(f.get('/BaseFont')),'subtype':str(f.get('/Subtype')),'toUnicode':bool(f.get('/ToUnicode')),'encoding':str(f.get('/Encoding')),'embedded':any(k in desc for k in ('/FontFile','/FontFile2','/FontFile3'))})
            for obj in page.get('/Annots',[]):
                ann = obj.get_object()
                links.append({'page':i+1,'type':str(ann.get('/Subtype')),'target':str(ann.get('/A') or ann.get('/Dest')),'structParent':ann.get('/StructParent')})
            for name,obj in resources.get('/XObject',{}).items():
                x = obj.get_object()
                if x.get('/Subtype') == '/Image':
                    images.append({'page':i+1,'name':str(name),'width':x.get('/Width'),'height':x.get('/Height'),'decodedStreamSha256':hashlib.sha256(x.get_data()).hexdigest()})
        textpath = OUT/'baseline_text'/('composer' if rel.startswith('build/') else 'public')/(code+'.txt')
        textpath.parent.mkdir(parents=True,exist_ok=True)
        textpath.write_text('\n\f\n'.join(texts),encoding='utf-8')
        copies.append({'path':rel,'sha256':sha(path),'size':path.stat().st_size,'pdfVersion':reader.pdf_header,'pages':len(reader.pages),'mediaBoxes':[list(p.mediabox) for p in reader.pages],'structTreeRoot':bool(catalog.get('/StructTreeRoot')),'marked':str(catalog.get('/MarkInfo')),'language':str(catalog.get('/Lang')),'title':reader.metadata.title,'producer':reader.metadata.producer,'fonts':fonts,'annotations':links,'images':images,'textPath':str(textpath.relative_to(ROOT)),'replacementCharacters':sum(t.count('\ufffd') for t in texts)})
    records.append({'code':code,'title':review['title'],'concepts':review.get('canonicalConceptIds'),'manifest':review,'source':SOURCE_REL,'sourceRecordPresent':current is not None,'sourceContent':current.get('content') if current else None,'copies':copies,'copiesEqual':len(copies)==2 and copies[0].get('sha256')==copies[1].get('sha256'),'status':'BASELINE_UNREMEDIATED'})
write_json(OUT/'inventory.json',{'task':TASK,'root':str(ROOT),'records':records,'summary':{'logical':len(records),'copies':sum(len(r['copies']) for r in records),'logicalPages':sum(r['copies'][0].get('pages',0) for r in records),'copyPages':sum(c.get('pages',0) for r in records for c in r['copies']),'taggedCopies':sum(c.get('structTreeRoot',False) for r in records for c in r['copies']),'unequalCopies':[r['code'] for r in records if not r['copiesEqual']]}})
versions = {d.metadata['Name']:d.version for d in importlib.metadata.distributions() if any(k in d.metadata['Name'].lower() for k in ['pdf','reportlab','pillow','weasy','font','cairo'])}
write_json(OUT/'installed_tools.json',{'python':sys.version,'packages':versions})
print(json.dumps(read_json(OUT/'inventory.json')['summary'],indent=2))