import hashlib, json, subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
work = Path(__file__).parent
baseline = json.loads((work / 'baseline.json').read_text(encoding='utf-8'))
# Restore only this task's regenerated tracked bytecode, after confirming HEAD
# is the exact pre-task version. Source files and concurrent edits are untouched.
for name, digest in baseline['protected_files'].items():
    if name.startswith('tools/tests/__pycache__/test_export_faculty_question_bank.'):
        original = subprocess.check_output(['git', 'show', 'HEAD:' + name], cwd=root)
        if hashlib.sha256(original).hexdigest() == digest:
            (root / name).write_bytes(original)
allowed = {'tools/export_faculty_question_bank.py', 'tools/export_faculty_question_bank.md', 'tools/tests/test_export_faculty_question_bank.py'}
changed, checked = [], 0
for name, digest in baseline['protected_files'].items():
    if name in allowed:
        continue
    path = root / name
    checked += 1
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        changed.append(name)
result = {'files_checked': checked, 'changed_outside_exporter': changed,
          'canonical_source_unchanged': 'build/faculty-build-composer/data/composer_library.js' not in changed,
          'composer_files_unchanged': not any(p.startswith('build/faculty-build-composer/') for p in changed)}
(work / 'preservation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, indent=2))
