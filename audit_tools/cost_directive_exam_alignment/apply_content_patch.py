"""Replay the Cost Directive content upgrade after publishing a faculty bank.

Usage: python apply_content_patch.py PATH_TO_BANK [--check]
Only the four content fields may change. Any upstream-edited record causes a
conflict before writing. Already-patched records are accepted idempotently.
"""
import json,hashlib,pathlib,sys
bank=pathlib.Path(sys.argv[1])
patch=json.loads((pathlib.Path(__file__).parent/'content-patch.json').read_text(encoding='utf-8'))
source=bank.read_text(encoding='utf-8-sig')
start=source.index('const questionBanks = ')+len('const questionBanks = ')
pools,length=json.JSONDecoder().raw_decode(source[start:])
records={q['id']:q for qs in pools.values() for q in qs}
def fingerprint(q):return hashlib.sha256(json.dumps(q,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
conflicts=[]; pending=[]
for change in patch['changes']:
    q=records.get(change['id'])
    if q is None or fingerprint(q) not in [change['before'],change['after']]:conflicts.append(change['id'])
    elif fingerprint(q)==change['before']:pending.append((q,change))
if conflicts:raise SystemExit('Upstream content conflicts; review before applying: '+str(conflicts))
for q,change in pending:
    assert set(change['fields'])=={'q','options','feedback','aHash'}
    q.update(change['fields']);assert fingerprint(q)==change['after']
if '--check' not in sys.argv and pending:
    updated=source[:start]+json.dumps(pools,ensure_ascii=False,indent=2)+source[start+length:]
    bank.write_text(updated,encoding='utf-8',newline='\n')
print(json.dumps({'compatible':True,'pending':len(pending),'alreadyApplied':len(patch['changes'])-len(pending),'checkOnly':'--check' in sys.argv}))
