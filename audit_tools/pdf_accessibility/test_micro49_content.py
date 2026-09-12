"""MICRO49_UNIQUE_NASH_FIX_V2: economics and visible/semantic agreement."""
import copy,re,unittest
from repo_guard import *
from micro49_matrix import validate
SOURCE='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
SEMANTICS='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'

def check_content(record,meta):
    errors=[];text=re.sub(r'[^a-z0-9]','',record['content']['worked'].lower())
    table=meta['tableSource']
    pairs=[[tuple(map(int,re.findall(r'\d+',cell))) for cell in row] for row in table['cells']]
    if pairs!=[[(9,9),(2,3)],[(3,2),(1,1)]]:errors.append('payoff values')
    equilibria=[(r,c) for r in range(2) for c in range(2)
                if pairs[r][c][0]>=pairs[1-r][c][0] and pairs[r][c][1]>=pairs[r][1-c][1]]
    if equilibria!=[(0,0)]:errors.append('unique equilibrium')
    if not all(pairs[0][c][0]>pairs[1][c][0] for c in range(2)):errors.append('A dominance')
    if not all(pairs[r][0][1]>pairs[r][1][1] for r in range(2)):errors.append('X dominance')
    if table['rowHeaders']!=['A','B'] or table['columnHeaders']!=['X','Y']:errors.append('labels')
    for phrase in ('columnxischosenrowagives9ratherthan3fromrowb',
                   'columnyischosenrowagives2ratherthan1fromrowb',
                   'xgives9ratherthan3whenrowaischosenand2ratherthan1whenrowbischosen',
                   'aistherowplayersstrictlydominantstrategy',
                   'xisthecolumnplayersstrictlydominantstrategy',
                   'axistheuniquenashequilibrium'):
        if phrase not in text:errors.append('missing economic reasoning')
    if any(s in text for s in ('multiple','twoequilibria','twopure','mixedstrategy','byis','probability')):errors.append('advanced/multiple equilibrium prose')
    if re.sub(r'[^a-z]','',record['content']['workedLabel'].lower())!='findinganashequilibrium':errors.append('heading')
    for field in ('imageAlt','graphDescription'):
        values=re.findall(r'\(\s*(\d+)\s*,\s*(\d+)\s*\)',record['content']['assetMetadata'][field])
        if values!=[('9','9'),('2','3'),('3','2'),('1','1')]:errors.append('source matrix')
    try:validate(meta)
    except ValueError as exc:errors.append(str(exc))
    return errors

class Micro49Content(unittest.TestCase):
    def setUp(self):
        root_guard()
        self.record=copy.deepcopy(next(r for r in read_json(SOURCE)['reviews'] if r['code']=='MICRO-49'))
        self.meta=copy.deepcopy(read_json(SEMANTICS)['pilot']['MICRO-49'])
    def test_canonical(self):self.assertEqual(check_content(self.record,self.meta),[])
    def test_wrapping_and_punctuation(self):
        self.record['content']['worked']=self.record['content']['worked'].replace(' ','\n').replace("'",'’').replace('(A,\nX)','(A,X)')
        self.assertEqual(check_content(self.record,self.meta),[])
    def test_old_77_second_equilibrium(self):
        self.meta['tableSource']['cells'][1][1]='(7, 7)'
        self.assertIn('unique equilibrium',check_content(self.record,self.meta))
    def test_each_changed_payoff(self):
        for r in range(2):
            for c in range(2):
                meta=copy.deepcopy(self.meta);meta['tableSource']['cells'][r][c]='(0, 0)'
                self.assertTrue(check_content(self.record,meta))
    def test_multiple_claim(self):
        self.record['content']['worked']+=' There are multiple Nash equilibria.'
        self.assertTrue(check_content(self.record,self.meta))
    def test_wrong_comparison(self):
        self.record['content']['worked']=self.record['content']['worked'].replace('2 rather than 1','1 rather than 2')
        self.assertTrue(check_content(self.record,self.meta))
    def test_visible_fingerprint_disagreement(self):
        self.meta['graphDecodedSha256']=self.meta['matrixCorrection']['originalDecodedSha256']
        self.assertTrue(check_content(self.record,self.meta))
    def test_source_payoff_disagreement(self):
        self.record['content']['assetMetadata']['imageAlt']=self.record['content']['assetMetadata']['imageAlt'].replace('(1, 1)','(7, 7)')
        self.assertTrue(check_content(self.record,self.meta))
    def test_candidate_visible_semantic_agreement(self):
        from pypdf import PdfReader
        checkpoint=read_json('validation_artifacts/pdf_accessibility/micro49_unique_nash_v2/batches/micro49/checkpoint.json')
        path=checkpoint['records'][0]['validation']['output']
        pdf=PdfReader(contained(path))
        image_hashes=[hashlib.sha256(o.get_object().get_data()).hexdigest() for o in pdf.pages[0]['/Resources']['/XObject'].values()]
        self.assertIn(self.meta['graphDecodedSha256'],image_hashes)
        from accessibility_gate import inspect
        self.assertEqual(inspect(path,self.record,metadata=self.meta)['errors'],[])
    def test_extra_content_rejected(self):
        from visual_repairs import approved_text_equal
        e=self.meta['wordingCorrection'];old=e['heading']['oldText']+' '+e['oldText'];new=e['heading']['newText']+' '+e['newText']
        self.assertTrue(approved_text_equal(old,new,self.meta))
        self.assertFalse(approved_text_equal(old,new+' More text.',self.meta))

if __name__=='__main__':unittest.main()
