import unittest,uuid
from install_composer_validated import *
class ComposerOnlyInstall(unittest.TestCase):
    def test_scope_excludes_public(self):
        e='validation_artifacts/pdf_accessibility/canonical_completion_v1'
        plan=prepare(read_json(e+'/fixture_validation.json'),e+'/review_receipt.json',scope='composer')
        for r in plan['records']:
            self.assertEqual(len(r['targets']),1)
            self.assertEqual(contained(r['targets'][0]).parent,contained(DEST))
    def test_unknown_scope_rejected(self):
        with self.assertRaises(ValueError):prepare([],MANIFEST,scope='unexpected')
    def test_rollback_restores_existence_and_bytes(self):
        root='tmp/pdf_accessibility/canonical_completion_v1/rollback-test-'+uuid.uuid4().hex
        contained(root).mkdir(parents=True);a=root+'/old.pdf';b=root+'/new.pdf';saved=root+'/saved'
        contained(a).write_bytes(b'old bytes');contained(saved).write_bytes(b'old bytes');h=sha(a)
        write_json(root+'/backup_manifest.json',{'records':[{'path':a,'existed':True,'backup':saved,'oldSHA256':h},{'path':b,'existed':False,'backup':None,'oldSHA256':None}]})
        contained(a).write_bytes(b'changed');contained(b).write_bytes(b'new');restore(root)
        self.assertEqual(sha(a),h);self.assertFalse(contained(b).exists())
if __name__=='__main__':unittest.main()
