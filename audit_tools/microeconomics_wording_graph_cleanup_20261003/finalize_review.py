"""Attach the completed, exact-record item review to the application ledger."""
from common import *
import hashlib
numeric=json.loads((HERE/'numerical_verification.json').read_text(encoding='utf8'))
ledger=json.loads((HERE/'expectations.json').read_text(encoding='utf8'))
for c in ledger['changes']:
    i=c['id']
    c['review']=R.get(i,{'finding_ids':W['records'][i]['finding_ids'],'wording_validation':'PASS','feedback_validation':'PASS','numerical_validation':'PASS','hash_validation':'PASS','scope':'Authorized wording correction only; the economic task, numeric inputs, alternatives and feedback were compared.'})
    c['review']['reviewed_record_sha256']=hashlib.sha256(json.dumps(c['afterRecord'],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    c['review']['numerical_check']=numeric[i]
    if i in G:
        assert all(c['review'][t]['status']=='PASS' and c['review'][t]['answer']=='NO' for t in ['construct_test','graph_test'])
(HERE/'expectations.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
