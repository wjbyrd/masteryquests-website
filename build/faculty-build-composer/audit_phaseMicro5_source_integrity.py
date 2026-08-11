import json,hashlib,argparse
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--baseline-root',required=True);args=ap.parse_args()
BASE=Path(args.baseline_root).resolve();FINAL=Path(__file__).resolve().parent

def load(root):
 s=(root/'data/composer_library.js').read_text(encoding='utf-8').strip();return json.loads(s[len('window.MQ_COMPOSER_LIBRARY='):-1])
def physical(lib):
 out={}
 for cid,m in lib['concepts'].items():
  if m.get('derivedFromConceptId'):continue
  for arr in m.get('questions',{}).values():
   for q in arr or []:out[q.get('canonicalId') or q.get('id')]=q
  for k in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
   for q in m.get(k,[]) or []:out[q.get('canonicalId') or q.get('id')]=q
 return out
b=load(BASE);f=load(FINAL);bp,fp=physical(b),physical(f);issues=[]
if len(bp)!=7650:issues.append(f'baseline physical {len(bp)}')
if len(fp)!=7761:issues.append(f'final physical {len(fp)}')
missing=set(bp)-set(fp)
if missing:issues.append(f'missing protected IDs {len(missing)}')
allowed={'familyConceptId','subtopicIds'}
def scrub(q):return {k:v for k,v in q.items() if k not in allowed}
changed=[qid for qid in bp if qid in fp and scrub(bp[qid])!=scrub(fp[qid])]
if changed:issues.append(f'protected semantic changes {len(changed)}')
new=set(fp)-set(bp)
if len(new)!=111:issues.append(f'new IDs {len(new)} != 111')
# Exactly original 454 Perfect Competition records may receive taxonomy metadata.
pc_base=set();m=b['concepts']['perfect-competition']
for arr in m.get('questions',{}).values():pc_base.update(q.get('canonicalId') or q.get('id') for q in arr or [])
for k in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):pc_base.update(q.get('canonicalId') or q.get('id') for q in m.get(k,[]) or [])
tax_changed=[]
for qid in bp:
 before,after=bp[qid],fp[qid]
 if before.get('familyConceptId')!=after.get('familyConceptId') or before.get('subtopicIds')!=after.get('subtopicIds'):tax_changed.append(qid)
if set(tax_changed)!=pc_base:issues.append(f'taxonomy metadata changed on {len(tax_changed)} protected records, expected exact PC 454')
def asset_map(lib):return {a['runtimePath']:(a.get('sha256'),a.get('sizeBytes'),a.get('imageAlt'),a.get('graphDescription')) for a in lib.get('assetInventory',[])}
if asset_map(b)!=asset_map(f):issues.append('asset inventory changed')
def filehash(root):
 out={};d=root/'data/question-assets'
 for p in d.rglob('*'):
  if p.is_file():out[str(p.relative_to(d))]=hashlib.sha256(p.read_bytes()).hexdigest()
 return out
bh,fh=filehash(BASE),filehash(FINAL)
if bh!=fh:issues.append('question asset bytes changed')
result={'phase':'phaseMicro5-perfect-competition-source-integrity-v1','ok':not issues,'baselineCanonicalPhysical':len(bp),'finalCanonicalPhysical':len(fp),'protectedSemanticChanges':len(changed),'protectedTaxonomyMetadataChanges':len(tax_changed),'newQuestionIds':len(new),'baselineAssets':len(bh),'finalAssets':len(fh),'assetsByteIdentical':bh==fh,'issues':issues}
(FINAL/'phaseMicro5_perfect_competition_source_integrity_results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));raise SystemExit(0 if result['ok'] else 1)
