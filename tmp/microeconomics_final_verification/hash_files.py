import concurrent.futures, hashlib, json, subprocess, sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
work=Path(__file__).resolve().parent
files=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
files=[f for f in files if f]
files += ['faculty_exports/audits/'+f for f in ['microeconomics_audit.md','microeconomics_audit_findings.json','microeconomics_audit_coverage.json','microeconomics_audit_evidence.json','microeconomics_consolidated_cleanup.md','microeconomics_consolidated_cleanup_changes.json']]
def digest(name):
    try:
        with (root/name).open('rb') as f: value=hashlib.file_digest(f,'sha256').hexdigest()
        return name,value
    except Exception as e: return name,'ERROR: '+str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    hashes=dict(pool.map(digest,files))
name=sys.argv[1] if len(sys.argv)>1 else 'before'
(work/(name+'_hashes.json')).write_text(json.dumps(hashes,indent=2),encoding='utf-8')
print(json.dumps({'phase':name,'files':len(hashes),'errors':{k:v for k,v in hashes.items() if v.startswith('ERROR:')}}))
if name=='after':
    before=json.loads((work/'before_hashes.json').read_text())
    differences=[{'file':k,'before':v,'after':hashes.get(k)} for k,v in before.items() if hashes.get(k)!=v]
    (work/'hash_comparison.json').write_text(json.dumps(differences,indent=2))
    print(json.dumps({'changedFiles':differences}))
