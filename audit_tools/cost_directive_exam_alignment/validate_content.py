"""Validate the final published bank against the content manifest and baseline routing.
Usage: python validate_content.py PATH_TO_BANK
"""
import pathlib,json,hashlib,unicodedata,re,math,sys
P=pathlib.Path(__file__).parent;s=pathlib.Path(sys.argv[1]).read_text(encoding='utf-8-sig')
b={n:json.JSONDecoder().raw_decode(s.split('const '+n+' = ',1)[1])[0] for n in ['questionBanks','microSkillRepairPools','microSkillBridgePools']}
meta=json.loads((P/'baseline-integrity.json').read_text());patch=json.loads((P/'content-patch.json').read_text(encoding='utf-8'))
hashobj=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
rows=[q for pools in b.values() for qs in pools.values() for q in qs];byid={q['id']:q for q in rows};assert len(rows)==len(byid)==807
routing={name:{pool:[{k:v for k,v in q.items() if k not in ['q','options','feedback','aHash']} for q in qs] for pool,qs in pools.items()} for name,pools in b.items()}
assert hashobj(routing)==meta['routingSha256'];assert hashobj(b['microSkillRepairPools'])==meta['repairSha256'];assert hashobj(b['microSkillBridgePools'])==meta['bridgeSha256']
norm=lambda x:re.sub(r'\s+',' ',unicodedata.normalize('NFKC',x).strip()).lower()
for q in rows:
 assert len(q['options'])==len(set(map(norm,q['options'])))==4
 assert sum(hashlib.sha256(norm(o).encode()).hexdigest()==q['aHash'] for o in q['options'])==1,q['id']
for c in patch['changes']:
 assert hashobj(byid[c['id']])==c['after'],c['id']
 for expr,expected in c['numericChecks']:
  assert re.fullmatch(r'[0-9\s.+*/(),\-round]+',expr),expr
  assert math.isclose(eval(expr,{'__builtins__':{}},{'round':round}),expected,rel_tol=1e-10,abs_tol=1e-8),(c['id'],expr)
print(json.dumps({'pass':True,'records':len(rows),'revised':len(patch['changes']),'numericChecks':sum(len(c['numericChecks']) for c in patch['changes']),'routingAndRemediationUnchanged':True}))
