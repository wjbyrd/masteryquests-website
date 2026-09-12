"""Object-measured canonical pilot checks; not a collection approval gate."""
import copy, hashlib, unittest
import pdfplumber
from pypdf import PdfReader
from repo_guard import contained,read_json,sha,write_json
from canonical_extract import REFERENCE,HASH,DEST

def observe(path):
    reader=PdfReader(contained(path));page=reader.pages[0]
    with pdfplumber.open(contained(path)) as pdf:
        p=pdf.pages[0]
        curves=[{k:v[k] for k in ['x0','y0','x1','y1','linewidth','stroking_color','non_stroking_color','path']} for v in p.curves]
        images=[]
        for im in p.images:
            image=page.images['/'+im['name']].image.convert('RGBA')
            images.append({'bounds':[im[k] for k in ['x0','y0','x1','y1']], 'pixels':hashlib.sha256(image.tobytes()).hexdigest()})
        return {'page':[p.width,p.height],'curves':curves,'images':images,
                'chars':[{k:c[k] for k in ['text','fontname','size','x0','y0','y1','non_stroking_color']} for c in p.chars]}

def near(a,b,tol=.002):
    if isinstance(a,str):return a==b
    if isinstance(a,(list,tuple)):return len(a)==len(b) and all(near(x,y,tol) for x,y in zip(a,b))
    return abs(a-b)<=tol

def check(actual,reference):
    errors=[]
    if actual['page']!=[612,792]:errors.append('page')
    for index,name in [(0,'header'),(1,'logo-card'),(2,'code-card'),(3,'metadata'),(10,'footer'),(11,'footer-arrow-circle')]:
        expected=reference['curves'][index]
        matches=[v for v in actual['curves'] if all(near(v[k],expected[k]) for k in ['x0','y0','x1','y1','linewidth','non_stroking_color','path'])]
        if name not in ['header','logo-card','footer']:matches=[v for v in matches if near(v['stroking_color'],expected['stroking_color'])]
        if not matches:errors.append(name)
    for index,name in enumerate(['logo','hourglass','target','core','recognition','watch','worked','check']):
        expected=reference['images'][index]
        matches=[v for v in actual['images'] if v['pixels']==expected['pixels'] and near(v['bounds'][0],expected['bounds'][0]) and near(v['bounds'][2]-v['bounds'][0],expected['bounds'][2]-expected['bounds'][0]) and near(v['bounds'][3]-v['bounds'][1],expected['bounds'][3]-expected['bounds'][1])]
        if index<3:matches=[v for v in matches if near(v['bounds'],expected['bounds'])]
        if not matches:errors.append('icon-'+name)
    dots=[v for v in actual['curves'] if near(v['y0'],660.55) and near(v['y1'],666.65) and near(v['x1']-v['x0'],6.1)]
    if len(dots)!=3:errors.append('difficulty-dots')
    for name,color in [('watch',[.071,.686,.663]),('worked',[.031,.157,.373]),('check',[.071,.686,.663])]:
        fill=[1,1,1] if name=='worked' else [.918,.973,.973]
        matches=[v for v in actual['curves'] if near(v['x0'],79.92) and near(v['x1'],583.2) and near(v['linewidth'],1.05) and near(v['stroking_color'],color) and near(v['non_stroking_color'],fill) and near(v['path'][0][1][0]-v['x0'],8)]
        if len(matches)<(1 if name=='worked' else 2):errors.append('panel-'+name)
    visible=[c for c in actual['chars'] if c['text'].strip()]
    if any('Arimo' not in c['fontname'] for c in visible):errors.append('font-family')
    footer=[c for c in visible if 15<c['y0']<56]
    if not any(near(c['size'],16) and near(c['non_stroking_color'],[.094,.816,.78]) for c in footer):errors.append('READY-treatment')
    if not any(near(c['size'],11.5) and near(c['non_stroking_color'],[1,1,1]) for c in footer):errors.append('return-treatment')
    # Metadata label emphasis is measured independently of string presence.
    for x,size in [(64.47,10.3995),(202.02,8.55),(405.42,9.89925)]:
        if not any(near(c['x0'],x) and near(c['size'],size) and 'bold' in c['fontname'].lower() and 650<c['y0']<675 for c in visible):errors.append('metadata-label-'+str(x))
    return errors

class CanonicalPilot(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        assert sha(REFERENCE)==HASH
        cls.reference=observe(REFERENCE)
        cls.pilots={code:observe('tmp/pdf_accessibility/canonical_template_v1/tagged/'+code+'.pdf') for code in ['MACRO-11','MACRO-13','GEN-ECON-09']}
    def test_measured_components(self):
        for code,p in self.pilots.items():
            with self.subTest(code=code):self.assertEqual([],check(p,self.reference))
    def test_generic_metadata_icons_fail(self):
        p=copy.deepcopy(self.pilots['MACRO-11']);p['images'][2]['pixels']=p['images'][1]['pixels'];self.assertIn('icon-target',check(p,self.reference))
    def test_missing_dots_fail(self):
        p=copy.deepcopy(self.pilots['MACRO-11']);p['curves']=[v for v in p['curves'] if not near(v['y0'],660.55)];self.assertIn('difficulty-dots',check(p,self.reference))
    def test_footer_variant_fails(self):
        p=copy.deepcopy(self.pilots['MACRO-11'])
        for v in p['curves']:
            if near(v['y0'],15):v['non_stroking_color']=[.06,.18,.33]
        self.assertIn('footer',check(p,self.reference))
    def test_plain_panels_fail(self):
        p=copy.deepcopy(self.pilots['MACRO-11']);p['curves']=[v for v in p['curves'] if not near(v['x0'],79.92)]
        self.assertIn('panel-worked',check(p,self.reference))
    def test_metadata_geometry_fails(self):
        p=copy.deepcopy(self.pilots['MACRO-11'])
        for v in p['curves']:
            if near(v['y0'],642.24):v['x0']+=2
        self.assertIn('metadata',check(p,self.reference))

if __name__=='__main__':unittest.main()
