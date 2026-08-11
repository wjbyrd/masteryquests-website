import json,zipfile,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
BASEZIP=Path('/mnt/data/phase_micro3_trade_granularity.zip')
CUR=ROOT/'data/composer_library.js'
OUT=ROOT/'phaseMicro3b_source_integrity_results.json'

def parse_js(txt):
    p='window.MQ_COMPOSER_LIBRARY='
    txt=txt.strip(); assert txt.startswith(p)
    return json.loads(txt[len(p):].rstrip().rstrip(';'))

def records(lib):
    out={}; duplicates=[]
    for cid,m in lib['concepts'].items():
        if not isinstance(m,dict) or 'questions' not in m: continue
        seq=[]
        for arr in (m.get('questions') or {}).values(): seq.extend(arr or [])
        seq.extend(m.get('repairQuestions') or []);seq.extend(m.get('bridgeQuestions') or []);seq.extend(m.get('repairSeedQuestions') or [])
        for q in seq:
            qid=q.get('canonicalId') or q.get('id')
            if qid in out and out[qid]!=q: duplicates.append(qid)
            out[qid]=q
    return out,duplicates

with zipfile.ZipFile(BASEZIP) as z:
    btxt=z.read('build/faculty-build-composer/data/composer_library.js').decode('utf-8')
base=parse_js(btxt); cur=parse_js(CUR.read_text(encoding='utf-8'))
br,bdups=records(base); cr,cdups=records(cur)
missing=sorted(set(br)-set(cr)); added=sorted(set(cr)-set(br)); changed=[]
for qid in sorted(set(br)&set(cr)):
    if br[qid]!=cr[qid]: changed.append(qid)
assets_equal=base.get('assetInventory')==cur.get('assetInventory')
asset_disk_issues=[]
for a in cur.get('assetInventory',[]):
    p=ROOT/'data'/a['runtimePath']
    if not p.exists(): asset_disk_issues.append({'path':a['runtimePath'],'issue':'missing'}); continue
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=a['sha256']: asset_disk_issues.append({'path':a['runtimePath'],'issue':'hash mismatch','expected':a['sha256'],'actual':h})
res={
 'phase':'phaseMicro3b-adaptive-support-backfill-v1',
 'ok':not missing and not changed and not bdups and not cdups and len(added)==210 and assets_equal and not asset_disk_issues,
 'baselineCanonicalRecords':len(br),'currentCanonicalRecords':len(cr),'expectedAdded':210,'actualAdded':len(added),
 'missingBaselineIds':missing,'changedBaselineIds':changed,'baselineDuplicateIds':bdups,'currentDuplicateIds':cdups,
 'newIdPrefixes':{p:sum(q.startswith(p) for q in added) for p in ['PMA-ELAS-','PMA-CPS-','PMA-ITP-','PMS-ELAS-','PMS-CPS-','PMS-ITP-']},
 'assetInventoryEqualToPhaseMicro3':assets_equal,'assetCount':len(cur.get('assetInventory',[])),'assetDiskIssues':asset_disk_issues
}
OUT.write_text(json.dumps(res,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(res,indent=2,ensure_ascii=False))
if not res['ok']: raise SystemExit(1)
