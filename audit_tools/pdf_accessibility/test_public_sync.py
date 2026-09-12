"""Read-only negative cases for public/Composer reconciliation."""
import unittest,copy
from unittest.mock import patch
import public_sync as s
class PublicEquality(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.rows,cls.source=s.source_set()
    def check_bad(self,public):
        with patch.object(s,'source_set',return_value=(self.rows,self.source)),patch.object(s,'inventory',return_value=public):
            with self.assertRaises(AssertionError):s.equality_gate()
    def test_missing_public(self):
        b=copy.deepcopy(self.source);b.pop(next(iter(b)));self.check_bad(b)
    def test_orphan_public(self):
        b=copy.deepcopy(self.source);b['MICRO-99.pdf']=next(iter(b.values()));self.check_bad(b)
    def test_hash_mismatch(self):
        b=copy.deepcopy(self.source);b[next(iter(b))]['sha256']='0'*64;self.check_bad(b)
    def test_size_mismatch(self):
        b=copy.deepcopy(self.source);b[next(iter(b))]['size']+=1;self.check_bad(b)
    def test_missing_composer(self):
        b=copy.deepcopy(self.source);b.pop(next(iter(b)))
        with patch.object(s,'inventory',return_value=b):
            with self.assertRaises(AssertionError):s.source_set()
    def test_stale_manifest(self):
        b=s.read_json(s.MANIFEST);b['reviews'][0]['sha256']='0'*64
        with patch.object(s,'read_json',return_value=b):
            with self.assertRaises(AssertionError):s.source_set()
if __name__=='__main__':
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(PublicEquality);r=unittest.TextTestRunner().run(suite)
    s.write_json(s.OUT+'/equality_negative_tests.json',{'total':r.testsRun,'passed':r.wasSuccessful(),'failures':len(r.failures),'errors':len(r.errors)})
    raise SystemExit(not r.wasSuccessful())
