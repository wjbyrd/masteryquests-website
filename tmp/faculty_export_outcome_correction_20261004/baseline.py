import csv,hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2];work=Path(__file__).parent
files=subprocess.check_output(['git','ls-files','build/faculty-build-composer','audit_tools/faculty_lo'],cwd=root,text=True).splitlines()
out={'protected_files':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in files},'courses':{}}
for area,stem in [('general','general_economics'),('micro','microeconomics'),('macro','macroeconomics')]:
    with (root/f'faculty_exports/{stem}_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:
        out['courses'][area]=list(csv.DictReader(f))
(work/'baseline.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('Preservation baseline:',len(files),'files;',[len(r) for r in out['courses'].values()])
