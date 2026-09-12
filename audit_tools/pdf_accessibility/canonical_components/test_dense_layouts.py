"""Negative tests enforce dense-mode limits, not just successful file creation."""
import sys,copy,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from repo_guard import read_json,sha
from canonical_components.dense_modes import validate_layout,graph_model,graph_image_dense

class DenseLayouts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result=read_json('validation_artifacts/pdf_accessibility/canonical_dense_v1/pilot_results.json')
        cls.rows={r['code']:r for r in cls.result['records']}
    def test_entire_eight_resource_pilot(self):
        self.assertEqual(set(self.rows),{'GEN-ECON-01','MACRO-11','MACRO-13','MACRO-16','MACRO-20','MICRO-49','MICRO-52','GEN-ECON-09'})
        for r in self.rows.values():
            with self.subTest(code=r['code']):
                self.assertTrue(r['pdfUaPass']);self.assertTrue(r['deterministic']);self.assertEqual(r['semanticCheck']['errors'],[]);self.assertEqual(r['fidelityErrors'],[]);self.assertEqual(r['layoutErrors'],[])
    def mutated(self,code='MACRO-16'):return copy.deepcopy(self.rows[code]['layout'])
    def test_small_graph_labels_fail(self):
        l=self.mutated();l['denseEvidence']['minimumLabelPt']=8.49;self.assertIn('GRAPH_LABEL_FLOOR',validate_layout(l))
    def test_small_table_text_fails(self):
        l=self.mutated('MACRO-20');l['tableTextPt']=9.49;self.assertIn('TABLE_FLOOR',validate_layout(l))
    def test_body_shrink_fails(self):
        l=self.mutated();l['bodyFontSize']=9.49;self.assertIn('BODY_FLOOR',validate_layout(l))
    def component(self,l,name):return next(c for c in l['components'] if c['name']==name)
    def test_long_title_overflow_fails(self):
        l=self.mutated('MICRO-52');self.component(l,'title')['bounds'][3]=646;self.assertIn('LONG_TITLE_OVERFLOW',validate_layout(l))
    def test_long_title_cannot_change_frame(self):
        for name in ['header','metadata','footer']:
            l=self.mutated('MICRO-52');self.component(l,name)['bounds'][0]+=1;self.assertIn('CANONICAL_'+name.upper(),validate_layout(l))
    def test_card_geometry_fails(self):
        l=self.mutated();self.component(l,'worked')['bounds'][0]+=1;self.assertIn('CARD_GEOMETRY',validate_layout(l))
    def test_clipped_graph_or_table_fails(self):
        for code,name in [('MACRO-16','figure'),('MACRO-20','table')]:
            l=self.mutated(code);self.component(l,name)['bounds'][1]=0;self.assertIn('VISUAL_CLIPPED',validate_layout(l))
    def test_text_outside_panel_fails(self):
        l=self.mutated();l['panelTextBounds'][0]['bounds'][1]=0;self.assertIn('PANEL_TEXT_OVERFLOW',validate_layout(l))
    def test_footer_collision_fails(self):
        l=self.mutated();self.component(l,'check')['bounds'][1]=55;self.assertIn('CHECK_FOOTER_COLLISION',validate_layout(l))
    def test_frozen_tokens_and_content(self):
        b=read_json('validation_artifacts/pdf_accessibility/canonical_dense_v1/baseline.json')
        from repo_guard import contained
        install_path='validation_artifacts/pdf_accessibility/canonical_completion_v1/composer_install.json'
        install=read_json(install_path) if contained(install_path).exists() else {}
        installed={r['path'].replace('\\','/'):r for r in install.get('records',[])} if install.get('status')=='ALL 151 INSTALLED AND VERIFIED' else {}
        for path,h in b['protected'].items():
            if path.endswith('accessibility_semantics.json'):continue
            if path in installed:
                self.assertEqual(sha(path),installed[path]['candidateSHA256']);continue
            if installed and path=='build/faculty-build-composer/data/concept-reviews/manifest.json':
                manifest=read_json(path)
                self.assertEqual(len(manifest['reviews']),151)
                for r in manifest['reviews']:
                    current=installed['build/faculty-build-composer/data/concept-reviews/'+r['code']+'.pdf']
                    self.assertEqual(r['sha256'],current['candidateSHA256']);self.assertEqual(r['sizeBytes'],current['sizeBytes'])
                continue
            self.assertEqual(h,sha(path),path)
        before=read_json('validation_artifacts/pdf_accessibility/canonical_dense_v1/semantics_before_promotion.json');after=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')
        allowed={'canonicalTemplate','canonicalDense','canonicalFlow','assetSourcePath','assetSourceSha256','graphDecodedSha256','tableRegions','decorativeImageDecodedSha256'}
        affected={r['code'] for r in read_json('validation_artifacts/pdf_accessibility/canonical_dense_v1/batch_dispositions.json')}
        for code in before['pilot']:
            a=copy.deepcopy(before['pilot'][code]);b=copy.deepcopy(after['pilot'][code])
            if code in affected:
                a={k:v for k,v in a.items() if k not in allowed};b={k:v for k,v in b.items() if k not in allowed}
            self.assertEqual(a,b,code)
    def test_graph_display_scale_cannot_hide_small_labels(self):
        l=self.mutated();self.component(l,'figure')['bounds'][2]-=50;self.assertIn('GRAPH_LABEL_FLOOR',validate_layout(l))
    def test_text_cannot_overlap_graph(self):
        l=self.mutated();b=self.component(l,'figure')['bounds'];entry=next(e for e in l['panelTextBounds'] if e['panel']=='worked');entry['bounds']=[b[0]+1,b[1]+1,b[2]-1,b[3]-1];self.assertIn('TEXT_VISUAL_OVERLAP',validate_layout(l))
    def test_graph_source_models_preserved(self):
        for kind in ['minimum_wage','kinked_demand']:
            _,_,h=graph_model(kind);im,alt,e=graph_image_dense(kind);self.assertEqual(h,e['modelSha256'])
            texts={l['text'] for l in e['labels']}
            self.assertTrue(({'QD = 90','QS = 120','Surplus = 30 workers','Equilibrium'} if kind=='minimum_wage' else {'MC = 36','MR gap','Kink (20, 50)'})<=texts)
            self.assertTrue(all(l['fontSize']>=8.5 for l in e['labels']))
            self.assertTrue(all(l['bounds'][0]>=0 and l['bounds'][1]>=0 and l['bounds'][2]<=im.width and l['bounds'][3]<=im.height for l in e['labels']))

if __name__=='__main__':unittest.main()
