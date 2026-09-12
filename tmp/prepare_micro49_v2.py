import sys,copy,json,subprocess
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from tag_pilot import source_hash
from micro49_matrix import derive,ORIGINAL,BOXES,FONT_SHA
from pypdf import PdfReader
from PIL import Image
root_guard();run='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'
src='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
sem='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
source=read_json(src);meta=read_json(sem);record=next(r for r in source['reviews'] if r['code']=='MICRO-49')
old=copy.deepcopy(record);oldmeta=copy.deepcopy(meta['pilot']['MICRO-49'])
rows=read_json('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/final_validation.json')
write_json(run+'/baseline.json',{'task':'MICRO49_UNIQUE_NASH_FIX_V2','root':str(root_guard()),'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'branch':'main','status':subprocess.check_output(['git','status','--short'],text=True),'writable':True,'source':old,'semantics':oldmeta,'sourceFileSha256':sha(src),'semanticsFileSha256':sha(sem),'candidates':[{'code':r['code'],'path':r['output'],'sha256':sha(r['output']),'mtimeNs':contained(r['output']).stat().st_mtime_ns} for r in rows]})
record['content']['workedLabel']='FINDING A NASH EQUILIBRIUM'
record['content']['worked']="For each rival strategy, identify the action with the larger payoff. If column X is chosen, row A gives 9 rather than 3 from row B. If column Y is chosen, row A gives 2 rather than 1 from row B. Thus, A is the row player's strictly dominant strategy. For the column player, X gives 9 rather than 3 when row A is chosen, and 2 rather than 1 when row B is chosen. Thus, X is the column player's strictly dominant strategy. Because A and X are mutual best responses, (A, X) is the unique Nash equilibrium."
for key in ('imageAlt','graphDescription'):
    record['content']['assetMetadata'][key]=record['content']['assetMetadata'][key].replace('(7, 7)','(1, 1)')
text=contained(src).read_text(encoding='utf-8')
for field in ('worked','workedLabel'):
    before=json.dumps(old['content'][field],ensure_ascii=False);assert text.count(before)==1
    text=text.replace(before,json.dumps(record['content'][field],ensure_ascii=False))
# Restrict alt/description replacement to this exact MICRO-49 record segment.
start=text.index('"code": "MICRO-49"');end=text.index('"code": "MICRO-50"',start)
part=text[start:end];assert part.count('(7, 7)')==2
text=text[:start]+part.replace('(7, 7)','(1, 1)')+text[end:]
contained(src).write_text(text,encoding='utf-8')
m=meta['pilot']['MICRO-49'];m['sourceRecordSha256']=source_hash(record)
m['tableSource']['cells'][1][1]='(1, 1)'
m['tableSourceSha256']=hashlib.sha256(json.dumps(m['tableSource'],sort_keys=True).encode()).hexdigest()
reader=PdfReader(contained(m['visualSourcePath']))
data=next(o.get_object().get_data() for o in reader.pages[0]['/Resources']['/XObject'].values() if hashlib.sha256(o.get_object().get_data()).hexdigest()==ORIGINAL)
derived=derive(data);fingerprint=hashlib.sha256(derived).hexdigest()
m['graphDecodedSha256']=fingerprint
m['matrixCorrection']={'status':'owner_authorized','cell':'B/Y','oldCell':'(7, 7)','newCell':'(1, 1)','sourceRecordSha256':source_hash(record),'originalAssetSha256':m['assetSourceSha256'],'originalDecodedSha256':ORIGINAL,'derivedDecodedSha256':fingerprint,'digitBoxes':BOXES,'glyphFontSha256':FONT_SHA,'glyphPixelSize':32,'reviewEvidence':run+'/visual_review.json'}
w=m['wordingCorrection'];w.update(newText=record['content']['worked'],sourceRecordSha256=source_hash(record),layout='micro49_unique_nash_v2',reviewEvidence=run+'/visual_review.json')
w['heading']['newText']='WORKED EXAMPLE: '+record['content']['workedLabel']
m['reviewEvidence']=run+'/visual_review.json'
write_json(sem,meta)
Image.frombytes('RGB',(728,471),derived).save(contained('tmp/micro49-matrix-v2.png'))
print('Canonical MICRO-49 source updated; derived image hash',fingerprint)
