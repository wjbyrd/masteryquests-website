"""Content freeze and readable canonical interior regressions."""
import copy,unittest,hashlib
import qa_remediation as q
from canonical_components.dense_modes import graph_image_dense,graph_model,validate_layout
from canonical_components.retained_models import CODES
from canonical_components.retained_diagrams import DATA,render

class CanonicalCompletion(unittest.TestCase):
    def test_all_80_have_fitted_layout_or_prior_acceptance(self):
        rows=q.read_json('validation_artifacts/pdf_accessibility/canonical_completion_v1/dispositions.json')
        self.assertEqual(len(rows),80)
        for r in rows:
            self.assertIn(r['status'],['FIT_REVIEW_PENDING','PRIOR_ACCEPTED'])
            if 'layout' in r:self.assertEqual(validate_layout(r['layout']),[],r['code'])
    def test_frozen_instruction_and_specification(self):
        baseline={p.replace('\\','/'):h for p,h in q.read_json('validation_artifacts/pdf_accessibility/canonical_completion_v1/baseline.json')['hashes'].items()}
        for path in [q.SOURCE,'audit_tools/pdf_accessibility/canonical_components/specification.json']:
            self.assertEqual(q.sha(path),baseline[path])
    def test_label_aware_diagrams_preserve_payoffs_and_shares(self):
        self.assertEqual(DATA['MICRO-48']['values'],[38,32,12,9,9])
        self.assertEqual(DATA['MICRO-51']['payoffs'],['(0, 12)','(6, 7)','(-3, 3)'])
        self.assertEqual(DATA['MACRO-23']['points'],[[2500,2],[5000,1]])
        self.assertEqual(DATA['MICRO-33']['firm'],[50,25,17])
    def test_every_model_label_has_readable_size_and_bounds(self):
        for code in [c for c in CODES if c not in DATA]:
            im,alt,e=graph_image_dense(code)
            self.assertEqual(e['modelSha256'],graph_model(code)[2]);self.assertTrue(alt)
            for label in e['labels']:
                self.assertGreaterEqual(label['fontSize'],8.5)
                x0,y0,x1,y1=label['bounds'];self.assertTrue(0<=x0<x1<=im.width and 0<=y0<y1<=im.height,(code,label))
        for code in DATA:
            im,e=render(code)
            self.assertGreaterEqual(e['minimumLabelPt'],8.5)
    def test_dense_diagram_scale_reduction_rejected(self):
        rows=q.read_json('validation_artifacts/pdf_accessibility/canonical_completion_v1/dispositions.json')
        for code in DATA:
            l=copy.deepcopy(next(r['layout'] for r in rows if r['code']==code))
            figure=next(c for c in l['components'] if c['name']=='figure');figure['bounds'][2]-=25
            self.assertIn('GRAPH_LABEL_FLOOR',validate_layout(l))
    def test_export_and_quota_coordinates(self):
        p,_,_=graph_model('MICRO-16')
        self.assertIn('Pw=$10',[s[3] for s in p.series])
        self.assertEqual(p.limits['yticks'],list(range(1,17)))
        self.assertEqual(p.limits['xticks'],list(range(25,351,25)))
    def test_full_width_pair_remains_full_width_semantic_figure(self):
        im,e=render('MICRO-33');self.assertTrue(e['stacked']);self.assertEqual(im.width,1440)
        self.assertAlmostEqual(e['width'],479.573)
    def test_compact_flow_has_explicit_floor(self):
        for r in q.read_json('validation_artifacts/pdf_accessibility/canonical_completion_v1/dispositions.json'):
            if 'layout' in r:
                self.assertGreaterEqual(r['layout']['bodyFontSize'],9.5)
                if r.get('mode')=='TIGHT':self.assertGreaterEqual(r['layout']['budget']['gaps'],30)

if __name__=='__main__':unittest.main()
