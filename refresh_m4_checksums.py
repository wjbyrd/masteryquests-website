from pathlib import Path
import hashlib
root=Path('/mnt/data/phase_M4_work'); comp=root/'faculty-build-composer'
def h(fp): return hashlib.sha256(fp.read_bytes()).hexdigest()
def parse(fp):
    rows=[]
    for line in fp.read_text().splitlines():
        if not line.strip(): continue
        a,p=line.split(None,1);rows.append([a,p.strip()])
    return rows
def write(fp,rows): fp.write_text('\n'.join(f'{a}  {p}' for a,p in rows)+'\n')
# nested: refresh every listed file that exists, then add M4 provenance files.
cf=comp/'SHA256SUMS.txt'; rows=parse(cf); seen={p for _,p in rows}
for r in rows:
    fp=comp/r[1]
    if fp.exists() and fp.is_file(): r[0]=h(fp)
for p in ['phaseM4-final-macro-release-closure-v1.json','phaseM4-final-macro-release-closure-v1_questions.json']:
    if p not in seen: rows.append([h(comp/p),p])
rows.sort(key=lambda x:x[1]);write(cf,rows)
# root: map build/faculty paths to snapshot faculty directory, refresh existing mapped files.
rf=root/'SHA256SUMS.txt'; rows=parse(rf); seen={p for _,p in rows}
for r in rows:
    p=r[1]
    fp=(comp/p[len('build/faculty-build-composer/'):]) if p.startswith('build/faculty-build-composer/') else root/p
    if fp.exists() and fp.is_file(): r[0]=h(fp)
# nested changed after the loop: force its root logical entry.
nested='build/faculty-build-composer/SHA256SUMS.txt'
for r in rows:
    if r[1]==nested: r[0]=h(cf)
for rel in ['phaseM4-final-macro-release-closure-v1.json','phaseM4-final-macro-release-closure-v1_questions.json']:
    p='build/faculty-build-composer/'+rel
    if p not in seen: rows.append([h(comp/rel),p])
rows.sort(key=lambda x:x[1]);write(rf,rows)
print('nested',h(cf));print('root',h(rf))
