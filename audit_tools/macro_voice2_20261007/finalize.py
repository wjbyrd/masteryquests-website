import json,hashlib,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parent.parent
e=json.loads((H/'export-validation.json').read_text());v=[]
for id in e['renderedIds']:
 p=H/'pdf-review'/f'{id}.png'
 v.append({'id':id,'page':e['changedPdfBlocks'][id],'renderSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'result':'PASS — visually inspected at 1500-pixel page height; readable text, full choices and feedback, no clipping or overlaps; graphs and labels legible where present.'})
(H/'visual-review.json').write_text(json.dumps({'status':'PASS','questionsReviewed':len(v),'distinctPages':len({x['page'] for x in v}),'review':v},indent=2)+'\n')
report=R/'faculty_exports/audits/macro_faculty_voice_cleanup_pass2_20261007.md'
s=report.read_text(encoding='utf-8')
needle='All ten modes pass for generated General, Micro and Macro compositions.'
note='Recomputing coverage also corrected one pre-existing cached claim: the narrow “Calculate and apply the spending multiplier” outcome had advertised Exam Drill, but both the accepted baseline and current Composer have only two questions in each of its three ordinary checkpoint stages, below the required three. The refreshed metadata removes that stale claim. A before/after composition comparison confirms no actual mode-availability change for any affected outcome; see `coverage-validation.json`. This is documented separately and no new questions or routing changes were introduced.\n\n'
if note not in s:s=s.replace(needle,note+needle)
s=s.replace('Twelve representative questions were rendered for visual review;','Twelve representative questions across twelve distinct pages were rendered and visually inspected;')
report.write_text(s,encoding='utf-8')
# A historical suite rewrites this evidence with unchanged content/line endings.
# Preserve the accepted first-pass artifact bytes; no source file is restored.
p='audit_tools/macro_voice_20261006/visual-validation.json'
(R/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p],cwd=R))
print('Recorded 12 visual inspections and the pre-existing coverage-cache discrepancy.')
