"""Meaningful economics, accessibility binding and layout regressions."""
import unittest,copy,json,re
import numpy as np
from repo_guard import read_json,contained,sha
from final_qa_build import SOURCE,SEMANTICS,EVIDENCE,validate_binding
from final_qa_content import difficulty_rows
from final_qa_graphs import model_for,original_model
from canonical_components.dense_modes import validate_layout
from formula_coverage import check

def value(p,label,x):
    pts=next(s[0] for s in p.series if s[3]==label)
    return float(np.interp(x,[a for a,b in pts],[b for a,b in pts]))

class FinalQA(unittest.TestCase):
    def test_library_and_all_difficulty_decisions(self):
        rows=read_json(SOURCE)['reviews'];d=read_json(EVIDENCE+'/decisions.json')
        self.assertEqual(len(rows),151);self.assertEqual(len({r['code'] for r in rows}),151)
        for prefix,count in [('GEN-ECON',26),('MACRO',57),('MICRO',68)]:self.assertEqual(sum(r['code'].startswith(prefix) for r in rows),count)
        self.assertEqual({r['code'] for r in rows},{r['code'] for r in d})
        for r in d:self.assertIn(r['after'],['Beginner','Intermediate','Advanced']);self.assertGreater(len(r['rationale']),25)

    def test_gas_shortage_and_surplus_match_equilibrium(self):
        p,_=model_for('GEN-ECON-17','GEN-ECON-17')
        for x,d,s in [(100,4,2),(150,3,3),(200,2,4)]:
            self.assertAlmostEqual(value(p,'D0',x),d);self.assertAlmostEqual(value(p,'S0',x),s)

    def test_tax_prices_and_revenue(self):
        p=original_model('GEN-ECON-21')
        self.assertAlmostEqual(value(p,'D0',100),10.5);self.assertAlmostEqual(value(p,'S0',100),10.5)
        self.assertAlmostEqual(value(p,'D0',60),13.5);self.assertAlmostEqual(value(p,'S0',60),7.5)
        p,_=model_for('MICRO-02','MICRO-02')
        self.assertAlmostEqual(value(p,'Demand',80),18);self.assertAlmostEqual(value(p,'Supply',80),12)
        self.assertEqual((18-12)*80,480)

    def test_trade_triangle_geometry(self):
        p=original_model('MICRO-17')
        self.assertEqual(value(p,'Demand',30),50);self.assertEqual(value(p,'Supply',30),50)
        self.assertEqual(value(p,'Demand',50),30);self.assertEqual(value(p,'Supply',10),30)
        def area(pts):return abs(sum(x*y2-y*x2 for (x,y),(x2,y2) in zip(pts,pts[1:]+pts[:1])))/2
        self.assertEqual(sum(area(pts) for pts,_,_ in p.fills),400)

    def test_monopolistic_tangency_profit_and_cost_derivative(self):
        p,_=model_for('MICRO-44','MICRO-44')
        for label,expected in [('D = AR',27),('ATC',27),('MR',15),('MC',15)]:self.assertAlmostEqual(value(p,label,36),expected,places=3)
        def TC(q):return .004*q**3-.2*q**2+13.848*q+546.048
        def profit(q):return (39-q/3)*q-TC(q)
        self.assertAlmostEqual(profit(36),0);self.assertLess(profit(35),0);self.assertLess(profit(37),0)
        self.assertAlmostEqual((TC(36.0001)-TC(35.9999))/.0002,15,places=4)

    def test_average_cost_relationships(self):
        p,_=model_for('MICRO-22','MICRO-22')
        self.assertAlmostEqual(value(p,'ATC',400)-value(p,'AVC',400),8,places=3)
        self.assertAlmostEqual(value(p,'MC',400),20,places=3)
        self.assertAlmostEqual(value(p,'MC',200),value(p,'AVC',200),places=3)

    def test_monopoly_profit_and_quantity_rule(self):
        p=original_model('MICRO-39')
        self.assertAlmostEqual(value(p,'MR',36),value(p,'MC',36),places=4)
        self.assertAlmostEqual(value(p,'Demand',36),42)
        self.assertAlmostEqual((value(p,'Demand',36)-value(p,'ATC',36))*36,540,places=1)

    def test_lorenz_ginis_and_growth_anchors(self):
        p=original_model('MICRO-59')
        for label,expected in [('Before: Gini 0.380',.380),('After: Gini 0.252',.252)]:
            pts=next(s[0] for s in p.series if s[3]==label)
            area=sum((b+d)*(c-a)/2 for (a,b),(c,d) in zip(pts,pts[1:]))/10000
            self.assertAlmostEqual(1-2*area,expected)
        self.assertAlmostEqual(10*20**.35,28.53,places=2);self.assertAlmostEqual(10*40**.35,36.37,places=2)

    def test_currency_examples(self):
        self.assertAlmostEqual((.99-.90)/.90,.1);self.assertAlmostEqual((.81-.90)/.90,-.1)
        self.assertAlmostEqual(.8*55/40,1.1);self.assertAlmostEqual(.8*45/40,.9)
        self.assertEqual(2500*2/10000,.5);self.assertEqual(5000*2/10000,1)

    def test_table_cells_preserved_and_matrix_equilibrium(self):
        before=read_json('tmp/pdf_accessibility/final_qa_20260919/baseline/accessibility_semantics.json')['pilot'];after=read_json(SEMANTICS)['pilot']
        tables=[k for k,v in before.items() if v.get('tableRequired')];self.assertEqual(len(tables),23)
        for code in tables:self.assertEqual(before[code]['tableSource'],after[code]['tableSource'],code)
        cells=after['MICRO-49']['tableSource']['cells'];self.assertEqual(cells,[['(9, 9)','(2, 3)'],['(3, 2)','(1, 1)']])
        payoffs=[[(9,9),(2,3)],[(3,2),(1,1)]]
        equilibria=[(i,j) for i in range(2) for j in range(2) if all(payoffs[i][j][0]>=payoffs[k][j][0] for k in range(2)) and all(payoffs[i][j][1]>=payoffs[i][k][1] for k in range(2))]
        self.assertEqual(equilibria,[(0,0)])

    def test_all_source_semantics_and_formula_coverage(self):
        sem=read_json(SEMANTICS)['pilot']
        for r in read_json(SOURCE)['reviews']:
            self.assertEqual(validate_binding(r,sem[r['code']]),[],r['code'])
            self.assertEqual(check(r,sem[r['code']]),[],r['code'])
        source=next(r for r in read_json(SOURCE)['reviews'] if r['code']=='MACRO-54')
        self.assertIn('ε',source['content']['core']);self.assertIn('×',source['content']['core'])
        modified=copy.deepcopy(source);modified['content']['worked']='Incorrect replacement'
        self.assertIn('STALE_FINAL_QA_SOURCE',validate_binding(modified,sem['MACRO-54']))

    def test_layouts_reject_distortion_and_small_labels(self):
        layouts=read_json(EVIDENCE+'/layouts.json');self.assertEqual(len(layouts),151)
        for row in layouts:self.assertEqual(validate_layout(row),[],row['code'])
        row=copy.deepcopy(next(r for r in layouts if r['code']=='GEN-ECON-22'))
        figure=next(c for c in row['components'] if c['name']=='figure');figure['bounds'][2]-=60
        self.assertIn('GRAPH_LABEL_FLOOR',validate_layout(row));self.assertIn('GRAPH_ASPECT_DISTORTION',validate_layout(row))

    def test_no_production_debris_or_implicit_profit_multiplication(self):
        pattern=r'this course|course model|course convention|course graphs|a learner|graph analysis|assessment 10|assessment 11|course formula|core graph family'
        for r in read_json(SOURCE)['reviews']:
            c=r['content'];text=' '.join(c[k] if isinstance(c[k],str) else ' '.join(c[k]) for k in ['core','recognition','watch','worked','check','workedLabel'])
            self.assertIsNone(re.search(pattern,text,re.I),r['code'])
        r=next(r for r in read_json(SOURCE)['reviews'] if r['code']=='MICRO-39')
        self.assertIn('(P - ATC) × Q',r['content']['core']);self.assertIn('(P - ATC) × Q',r['content']['watch'])
        all_rows={r['code']:r['content'] for r in read_json(SOURCE)['reviews']}
        self.assertNotIn('equate mr',all_rows['MICRO-37']['watch'])
        self.assertNotIn('Higher money demand with fixed money supply raises interest rates.',all_rows['MACRO-28']['core'])

if __name__=='__main__':unittest.main()
