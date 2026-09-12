"""Negative probes on the new 9-row bank table and 7-column cost table."""
import copy,unittest
import qa_remediation as q
from pypdf import PdfWriter
from pypdf.generic import NameObject as N,TextStringObject as T,ArrayObject
from accessibility_gate import inspect

def elements(o):
    o=o.get_object() if hasattr(o,'get_object') else o
    if isinstance(o,list):
        for x in o:yield from elements(x)
    elif hasattr(o,'get'):
        if o.get('/S'):yield o
        yield from elements(o.get('/K',[]))

class NewSemanticTables(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows={r['code']:r for r in q.read_json(q.EVIDENCE+'/final_validation.json')}
        cls.sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};cls.meta=q.read_json(q.SEMANTICS)['pilot']
    def probe(self,name,code,fn):
        writer=PdfWriter(clone_from=q.contained(self.rows[code]['output']));fn(writer)
        out=q.contained('tmp/pdf_accessibility/'+q.RUN+'/table-negative/'+name+'.pdf');out.parent.mkdir(exist_ok=True,parents=True);writer.write(out)
        errors=inspect(out,self.sources[code],metadata=self.meta[code])['errors'];self.assertTrue(errors,name)
    def role(self,w,r):return next(e for e in elements(w._root_object['/StructTreeRoot']) if e['/S']=='/'+r)
    def test_bank_row_removed(self):self.probe('bank_row_removed','MACRO-20',lambda w:self.role(w,'Table')['/K'].pop())
    def test_bank_column_scope_removed(self):self.probe('bank_scope_removed','MACRO-20',lambda w:self.role(w,'TH').pop(N('/A')))
    def test_bank_header_id_removed(self):self.probe('bank_id_removed','MACRO-20',lambda w:self.role(w,'TH').pop(N('/ID')))
    def test_bank_header_association_removed(self):
        self.probe('bank_headers_removed','MACRO-20',lambda w:next(e for e in elements(w._root_object['/StructTreeRoot']) if e.get('/S')=='/TD' and e.get('/A'))['/A'].__setitem__(N('/Headers'),ArrayObject()))
    def test_bank_loss_reverted(self):
        self.probe('bank_loss_reverted','MACRO-20',lambda w:next(e for e in elements(w._root_object['/StructTreeRoot']) if e.get('/ActualText')=='755').__setitem__(N('/ActualText'),T('780')))
    def test_cost_column_removed(self):self.probe('cost_column_removed','MICRO-21',lambda w:self.role(w,'TR')['/K'].pop())
    def test_cost_row_header_changed_to_data(self):
        self.probe('cost_header_as_data','MICRO-21',lambda w:next(e for e in elements(w._root_object['/StructTreeRoot']) if e.get('/ActualText')=='Q = 120').__setitem__(N('/S'),N('/TD')))
    def test_positive_large_tables(self):
        for code in ['MACRO-20','MICRO-21']:
            self.assertEqual(inspect(self.rows[code]['output'],self.sources[code],metadata=self.meta[code])['errors'],[])

if __name__=='__main__':unittest.main(verbosity=2)
