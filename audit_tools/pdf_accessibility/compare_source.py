from repo_guard import *
from collections import Counter
import re
root=root_guard()
inv=read_json('validation_artifacts/pdf_accessibility/inventory.json')
fields=Counter(k for r in inv['records'] for k in r['sourceContent'])
print('Source content fields',fields)
results=[]
for r in inv['records']:
    text=contained(r['copies'][0]['textPath']).read_text(encoding='utf-8')
    compact=lambda s:re.sub(r'\s+',' ',s).strip()
    findings=[]
    for key in ('outcome','core','recognition','watch','worked','check','workedLabel','time','difficulty'):
        value=r['sourceContent'].get(key)
        for i,part in enumerate(value if isinstance(value,list) else [value]):
            if part and compact(part) not in compact(text):
                findings.append({'field':key,'index':i,'sourceText':part})
    results.append({'code':r['code'],'sourceBlocksNotFound':findings,'status':'MATCH' if not findings else 'REVIEW_REQUIRED'})
print('Source discrepancies',Counter(x['status'] for x in results))
for x in results:
    if x['sourceBlocksNotFound']:
        print(x['code'],[(p['field'],p['sourceText'][:65]) for p in x['sourceBlocksNotFound']])
write_json('validation_artifacts/pdf_accessibility/source_comparison.json',{'method':'Only whitespace collapsed to account for PDF line wrapping. Punctuation, numbers, signs, and letter case preserved. Comparison is a diagnostic, not proof of semantic equivalence.','records':results})
print('Pilot candidates')
for code in ['GEN-ECON-01','GEN-ECON-10','MICRO-01','MICRO-54','MACRO-23','MACRO-24','MACRO-42','MACRO-20']:
    r=next(x for x in inv['records'] if x['code']==code)
    print(code,r['title'],r['sourceContent'])