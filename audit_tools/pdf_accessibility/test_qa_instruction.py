"""Instructional invariants and mutation probes for owner-authorized QA repairs."""
import copy,re,unittest,hashlib
from unittest.mock import patch
import qa_remediation as q
from qa_renderer import graph_image,table_image
from qa_plot import Plot
from test_micro49_content import check_content

def words(s):return re.sub(r'[^a-z0-9]+',' ',s.lower()).split()
def graph(kind):
    with patch.object(Plot,'render',lambda self:self):return graph_image(kind)[0]
def series(g,label):return next(s[0] for s in g.series if s[3]==label)
def interpolate(points,x):
    for (a,b),(c,d) in zip(points,points[1:]):
        if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
    raise ValueError('Outside curve')
def content_errors(code,c):
    errors=[];label=words(c['workedLabel']);worked=' '.join(words(c['worked']))
    if code=='MICRO-07':
        if 'complements' not in label or 'substitutes' in label:errors.append('complements heading')
        if not re.search(r'-0\.7',c['check']) or not re.search(r'falls\s+5\s*%',c['check']):errors.append('cross-price inputs')
    if code=='MICRO-16' and ('exports' not in label or 'imports' in label):errors.append('exports heading')
    if code=='MICRO-32' and ('36' not in worked or '33' in worked or 'shift' in label):errors.append('movement and point B')
    if code=='MICRO-48' and ('upper bound' not in worked or '2693' not in worked.replace('2 693','2693') or re.search(r'is (?:the )?exact',worked)):errors.append('HHI fringe uncertainty')
    if code=='MACRO-38' and not re.search(r'5\s*%',c['worked']):errors.append('natural rate endpoint')
    if code in ('MACRO-11','MACRO-13','MICRO-09') and c.get('graph'):errors.append('unapproved graph')
    if code=='MACRO-12' and not c.get('graph'):errors.append('retained production function')
    return errors

class InstructionalQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};cls.meta=q.read_json(q.SEMANTICS)['pilot']
    def test_all_current_content_invariants(self):
        for code,r in self.sources.items():self.assertEqual(content_errors(code,r['content']),[],code)
    def test_nash_preserved(self):self.assertEqual(check_content(self.sources['MICRO-49'],self.meta['MICRO-49']),[])
    def test_complements_response(self):self.assertAlmostEqual(-.7*-5,3.5)
    def test_negative_wrong_headings(self):
        for code,label in [('MICRO-07','Identifying substitutes'),('MICRO-16','Calculating imports'),('MICRO-32','A supply shift')]:
            c=copy.deepcopy(self.sources[code]['content']);c['workedLabel']=label;self.assertTrue(content_errors(code,c))
    def test_negative_hhi_exact(self):
        c=copy.deepcopy(self.sources['MICRO-48']['content']);c['worked']='The HHI is exactly 2,774.';self.assertTrue(content_errors('MICRO-48',c))
    def test_hhi_named_shares_and_fringe(self):
        c=self.sources['MICRO-48']['content']['worked']
        shares=list(map(int,re.findall(r'(\d+)\s*\^\s*2',c)))
        self.assertEqual(shares[:4],[38,32,12,9]);self.assertEqual(sum(x*x for x in shares[:4]),2693)
        self.assertEqual(2693+9**2,2774);self.assertLess(2693+5**2+4**2,2774)
        self.assertIn('upper bound',' '.join(words(self.sources['MICRO-48']['content']['worked'])))
    def test_minimum_wage_actual_curves(self):
        g=graph('minimum_wage');d=series(g,'Labor Demand');s=series(g,'Labor Supply')
        self.assertAlmostEqual(interpolate(d,90),15);self.assertAlmostEqual(interpolate(s,120),15)
        self.assertAlmostEqual(interpolate(d,105),12);self.assertAlmostEqual(interpolate(s,105),12)
        self.assertEqual(120-90,30);self.assertEqual(series(g,'Binding minimum wage')[0][1],15)
    def test_kink_marginal_revenue_actual_geometry(self):
        g=graph('kinked_demand');gap=series(g,'MR gap');mc=series(g,'MC = 36')[0][1]
        self.assertEqual(gap,[(20.,20.),(20.,40.)]);self.assertTrue(20<mc<40)
        self.assertEqual(series(g,'Demand')[-1],(20.,50.));self.assertEqual(series(g,'MR')[-1],(20.,40.))
        # Finite differences of total revenue across each branch validate the MR jump.
        rev=lambda x:x*(60-.5*x if x<=20 else 80-1.5*x)
        self.assertAlmostEqual((rev(20)-rev(19.999))/.001,40,places=2)
        self.assertAlmostEqual((rev(20.001)-rev(20))/.001,20,places=2)
        for x in [19,19.9,20.1,21]:self.assertLess(rev(x)-mc*x,rev(20)-mc*20)
    def test_phillips_endpoint_on_both_curves(self):
        g=graph('phillips_return');self.assertEqual(series(g,'LRPC')[0][0],5)
        self.assertEqual(interpolate(series(g,'SRPC1'),5),5)
        self.assertTrue(any(n[1]==(5,5) and n[0].startswith('C') for n in g.notes))
    def test_fixed_cost_changes_only_atc(self):
        g=graph('fixed_cost')
        for x in [20,40,60]:
            low=interpolate(series(g,'ATC: original'),x);high=interpolate(series(g,'ATC: higher fixed cost'),x)
            self.assertAlmostEqual(high-low,250/x,places=2)
    def test_all_tables_match_visible_source(self):
        tables=[r for r in self.sources.values() if r['content'].get('table')];self.assertEqual(len(tables),22)
        for r in tables:
            t=r['content']['table'];m=self.meta[r['code']]
            if m.get('canonicalTemplate'):
                from canonical_components.pilot_renderer import canonical_table
                im,regions=canonical_table(t,dense=bool(m.get('canonicalDense')))
            else:im,regions=table_image(t,styled=bool(m.get('styleRestoration')))
            self.assertEqual(t,m['tableSource']);self.assertEqual(regions,m['tableRegions'])
            self.assertEqual(hashlib.sha256(im.tobytes()).hexdigest(),m['graphDecodedSha256'])
    def test_bank_identity(self):
        t=self.sources['MACRO-20']['content']['table'];d=dict(zip(t['rowHeaders'],t['cells']))
        nums=lambda k:[int(re.sub(r'[^0-9]','',x)) for x in d[k]]
        self.assertEqual(nums('Capital'),[60,35]);self.assertEqual(nums('Loans'),[780,755])
        for col in [0,1]:
            self.assertEqual(sum(nums(k)[col] for k in ['Reserves','Loans','Securities']),nums('Total assets')[col])
            self.assertEqual(sum(nums(k)[col] for k in ['Deposits','Borrowing']),nums('Total liabilities')[col])
            self.assertEqual(nums('Total assets')[col],nums('Total liabilities')[col]+nums('Capital')[col])
    def test_negative_source_table_cell(self):
        r=copy.deepcopy(self.sources['MACRO-20']);r['content']['table']['cells'][1][1]='780'
        self.assertIn('QA_TABLE_SOURCE_MISMATCH',q.validate_source_binding(r,self.meta['MACRO-20']))
    def test_negative_graph_asset_binding(self):
        for code in ['MICRO-52','MACRO-16','MACRO-38']:
            m=copy.deepcopy(self.meta[code]);m['graphDecodedSha256']='0'*64
            self.assertIn('QA_GRAPH_SOURCE_MISMATCH',q.validate_source_binding(self.sources[code],m))
    def test_negative_removed_graph_reintroduced(self):
        for code in ['MACRO-11','MACRO-13','MICRO-09']:
            c=copy.deepcopy(self.sources[code]['content']);c['graph']=True;self.assertTrue(content_errors(code,c))
    def test_punctuation_and_wrapping(self):
        for code in ['MICRO-07','MICRO-16','MICRO-32','MICRO-48']:
            c=copy.deepcopy(self.sources[code]['content']);c['worked']=c['worked'].replace(' ','\n');c['workedLabel']=c['workedLabel'].replace(' ','  ')
            self.assertEqual(content_errors(code,c),[])

if __name__=='__main__':unittest.main(verbosity=2)
