"""Update the pending editorial batch after final visual proofreading."""
from pathlib import Path
import json,hashlib,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
source=PROJECT/'source/personal-review-list-data.json';raw=source.read_bytes();data=read(source);baseline=read(HERE/'baseline/personal-review-list-data.json');prior=read(HERE/'qa/pre-proofread-expectations.json');ledger=read(HERE/'expectations.json')
assert data['librarySha256']==prior['afterLibrarySha256'];assert data['reviewSeed']==baseline['reviewSeed'];assert data['currentRevisionBatch']['accepted'] is False
old={c['id']:c for c in prior['changes']};new={c['id']:c for c in ledger['changes']};assert old.keys()==new.keys()
rows={r['id']:r for r in data['questions']};changed=[]
for identity,c in new.items():
    row=rows[identity];assert row['q']==old[identity]['afterRecord']
    if row['q']!=c['afterRecord']:changed.append(identity)
    row['q']=c['afterRecord'];row['revision']='medium-editorial-20261102-'+hashlib.sha256(json.dumps(row['q'],sort_keys=True).encode()).hexdigest()[:12];row['revision_reason']=c['reason']
assert changed==['P52A-FISCAD-B2-003'],changed
for row in baseline['questions']:
    if row['id'] not in new:assert rows[row['id']]==row
data['librarySha256']=ledger['afterLibrarySha256'];data['source_sha256']=hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert source.read_bytes()==raw
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
result=read(HERE/'review-import.json');result['librarySha256']=data['librarySha256'];(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True);print('Updated proofread sentence and preserved the pending review history.')
