"""Real rendered component checks, frozen text checks and negative probes."""
import unittest,copy,hashlib
from PIL import Image,ImageColor
from pypdf import PdfReader
import style_restoration as s
from tag_pilot import normalized
q=s.q

def check(layout,render=None):
    errors=[];parts={p['name']:p for p in layout.get('components',[])}
    required=['header','metadata','title','core','recognition','watch','worked','check','footer']
    required+=['icon-'+n for n in ['core','recognition','watch','worked','check']]
    for name in required:
        if name not in parts:errors.append('MISSING_'+name)
    if errors:return errors
    if layout.get('template')!='established-concept-review-v1':errors.append('TEMPLATE_NOT_USED')
    if not 8.5<=layout['bodyFontSize']<=11:errors.append('BODY_READABILITY')
    if not 65<=layout['contentBottom']<=95:errors.append('BOTTOM_VOID')
    for name in ['watch','check']:
        if parts[name].get('fill')!='#EFF8F8' or parts[name].get('stroke')!='#007C82':errors.append('CARD_STYLE_'+name)
    if parts['worked'].get('stroke')!='#102E55':errors.append('WORKED_BORDER')
    sequence=[parts[n]['bounds'] for n in ['core','recognition','watch','worked','check']]
    if any(sequence[i][1]<sequence[i+1][3] for i in range(4)):errors.append('PANEL_OVERLAP')
    if render:
        im=Image.open(render).convert('RGB');sx=im.width/612;sy=im.height/792
        def count(rect,color):
            x0,y0,x1,y1=rect;crop=im.crop((int(x0*sx),int((792-y1)*sy),int(x1*sx)+1,int((792-y0)*sy)+1))
            rgb=ImageColor.getrgb(color)
            return sum(max(abs(a-b) for a,b in zip(px,rgb))<20 for px in crop.getdata())
        for name,color in [('header','#102E55'),('metadata','#F3F7FA'),('watch','#EFF8F8'),('check','#EFF8F8'),('footer','#102E55')]:
            if count(parts[name]['bounds'],color)<200:errors.append('RENDER_MISSING_'+name)
        for name in ['watch','worked','check']:
            x0,y0,x1,y1=parts[name]['bounds']
            if count([x0-1,y0+9,x0+1,y1-9],parts[name]['stroke'])<8:errors.append('RENDER_BORDER_'+name)
        for name in required[9:]:
            if count(parts[name]['bounds'],'#102E55' if name=='icon-worked' else '#007C82')<40:errors.append('RENDER_ICON_'+name)
    return errors

class StyleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for p in q.contained(s.EVIDENCE+'/batches').glob('*/checkpoint.json'):
            cls.rows+=q.read_json(p)['records']
        cls.old=q.read_json(s.EVIDENCE+'/semantics_v2.json')
    def test_actual_components_and_balance(self):
        for r in self.rows:
            with self.subTest(code=r['code']):
                v=r['validation'];render=q.contained(v['validatorReport']).parent/'rendered_after'/(r['code']+'.png')
                self.assertEqual(check(v['layoutEvidence'],render),[])
    def test_frozen_v2_content(self):
        self.assertEqual(q.sha(q.SOURCE),q.read_json(s.EVIDENCE+'/baseline.json')['protected'][q.SOURCE])
        for r in self.rows:
            text=normalized(PdfReader(q.contained(r['generation']['visualSource'])).pages[0].extract_text()) if 'visualSource' in r['generation'] else normalized(PdfReader(q.contained(f'tmp/pdf_accessibility/{s.RUN}/prepared/'+r['code']+'.pdf')).pages[0].extract_text())
            self.assertEqual(hashlib.sha256(text.encode()).hexdigest(),self.old['pilot'][r['code']]['qaRemediation']['authorizedTextSha256'])
    def test_missing_components_rejected(self):
        original=self.rows[0]['validation']['layoutEvidence']
        for name in ['metadata','worked','watch','check','icon-core','footer']:
            bad=copy.deepcopy(original);bad['components']=[p for p in bad['components'] if p['name']!=name]
            self.assertTrue(check(bad))
    def test_empty_bottom_rejected(self):
        bad=copy.deepcopy(self.rows[0]['validation']['layoutEvidence']);bad['contentBottom']=300
        self.assertIn('BOTTOM_VOID',check(bad))
    def test_missing_fill_and_border_rejected(self):
        for name,field in [('watch','fill'),('check','fill'),('worked','stroke')]:
            bad=copy.deepcopy(self.rows[0]['validation']['layoutEvidence'])
            next(p for p in bad['components'] if p['name']==name)[field]=None
            self.assertTrue(check(bad))
    def test_blank_render_rejected(self):
        path=q.contained(f'tmp/pdf_accessibility/{s.RUN}/blank-probe.png');Image.new('RGB',(612,792),'white').save(path)
        self.assertTrue(check(self.rows[0]['validation']['layoutEvidence'],path));path.unlink()

if __name__=='__main__':unittest.main()
