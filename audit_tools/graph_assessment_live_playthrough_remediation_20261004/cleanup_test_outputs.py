"""Restore only generated tracked test artifacts; keep requested output/evidence."""
from review_tools import *
import subprocess
baseline=json.loads((EVIDENCE/'baseline.json').read_text())['head']
paths=[
 'build/faculty-build-composer/tests/phase3e-market-gate-sample.html',
 'tools/tests/__pycache__/test_export_faculty_question_bank.cpython-312.pyc',
 'validation_artifacts/macroeconomics_consolidated_cleanup/legendary-review-index.json',
 'validation_artifacts/macroeconomics_consolidated_cleanup/validation.json']
for relative in paths:
 target=(ROOT/relative).resolve();assert target.is_relative_to(ROOT.resolve())
 content=subprocess.check_output(['git','show',baseline+':'+relative],cwd=ROOT)
 target.write_bytes(content)
for name in ['profit-axis.png','profit-browser.png']:
 source=ROOT/'tmp'/name
 if source.exists():
  target=EVIDENCE/name
  target.write_bytes(source.read_bytes());source.unlink()
print('Restored four generated test outputs; retained diagnostic images in evidence.')
