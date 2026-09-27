import hashlib, json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
work = root / 'tmp/macroeconomics_audit'
before = json.loads((work / 'initial_hashes.json').read_text(encoding='utf8'))
result = {'checked': 0, 'changed': [], 'missing': []}
for name, expected in before.items():
    path = root / name
    if not path.is_file():
        result['missing'].append(name)
    else:
        h = hashlib.sha256()
        with path.open('rb') as f:
            for chunk in iter(lambda: f.read(4 * 1024 * 1024), b''):
                h.update(chunk)
        if h.hexdigest() != expected:
            result['changed'].append(name)
    result['checked'] += 1
(work / 'protection_check.json').write_text(json.dumps(result, indent=2), encoding='utf8')
print(json.dumps(result))
