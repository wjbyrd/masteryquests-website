"""Review helpers; decisions and replacements are authored explicitly, never inferred."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
EVIDENCE=ROOT/'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence'
ORIGINALS=json.loads((HERE/'originals.json').read_text(encoding='utf8'))
INDEX=json.loads((EVIDENCE/'asset_index.json').read_text(encoding='utf8'))
def load():
    p=HERE/'authored.json'
    return json.loads(p.read_text(encoding='utf8')) if p.exists() else {'questions':{},'assets':{}}
def save(data):
    (HERE/'authored.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def review(data, group, note):
    for id in INDEX[group]['ids']:
        data['questions'].setdefault(id,{'patch':{},'review':note,'textReviewed':True,'visualReviewed':False})
def patch(data,id,stem=None,tier=None,options=None,feedback=None,reason=None,**fields):
    d=data['questions'].setdefault(id,{'patch':{},'textReviewed':True,'visualReviewed':False})
    if stem is not None: fields['q']=stem
    if tier is not None:
        fields['canonicalDifficulty']=tier
        # Historical sourcePool/originalBossTier remain provenance, never rewritten.
        fields['difficulty']=tier
    if options is not None: fields['options']=options
    if feedback is not None: fields['feedback']=feedback
    d['patch'].update({k:v for k,v in fields.items() if ORIGINALS[id].get(k)!=v})
    if reason:d['review']=reason
def visual(data,groups,note):
    for g in groups:
        data['assets'][INDEX[g]['asset']]={'visualReview':note,'repairRequired':False}
        for id in INDEX[g]['ids']:
            data['questions'].setdefault(id,{'patch':{},'textReviewed':False})['visualReviewed']=True
def sheets():
    from PIL import Image,ImageOps,ImageDraw
    for start in range(1,len(INDEX),6):
        sheet=Image.new('RGB',(1440,1320),'#dddddd'); draw=ImageDraw.Draw(sheet)
        for offset,row in enumerate(INDEX[start:start+6]):
            im=Image.open(ROOT/'build/faculty-build-composer/data'/row['asset']).convert('RGB')
            im=ImageOps.contain(im,(700,400))
            x=(offset%2)*720;y=(offset//2)*440
            draw.text((x+8,y+5),f"{row['index']:03} {row['asset'].split('/')[-1]}",fill='black')
            sheet.paste(im,(x+(720-im.width)//2,y+28))
        sheet.save(EVIDENCE/f'sheet-{start:03}.png')
if __name__=='__main__':sheets()
