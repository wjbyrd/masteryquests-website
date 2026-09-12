"""Persist instructional and new-table regression results in this QA run."""
import unittest,io
import qa_remediation as q
def main():
    allrows=[]
    for module in ['test_micro49_content','test_qa_instruction','test_qa_tables']:
        suite=unittest.defaultTestLoader.loadTestsFromName(module);stream=io.StringIO()
        result=unittest.TextTestRunner(stream=stream,verbosity=2).run(suite)
        q.contained(q.EVIDENCE+'/'+module+'.log').write_text(stream.getvalue(),encoding='utf8')
        allrows.append({'module':module,'tests':result.testsRun,'passed':result.wasSuccessful(),'failures':len(result.failures),'errors':len(result.errors)})
        print(module,result.testsRun,result.wasSuccessful())
    q.write_json(q.EVIDENCE+'/instructional_regressions.json',{'results':allrows,'passed':all(r['passed'] for r in allrows)})
    if not all(r['passed'] for r in allrows):raise SystemExit(1)
if __name__=='__main__':main()
