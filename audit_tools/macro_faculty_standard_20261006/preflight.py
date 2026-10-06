import json,zipfile,hashlib,shutil,subprocess
from pathlib import Path
from lxml import etree
H=Path(__file__).resolve().parent;R=H.parent.parent;C=R/'build/faculty-build-composer';H.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
tracked=subprocess.check_output(['git','ls-files'],cwd=R,text=True).splitlines()
snapshot=[p for p in tracked if p.startswith(('build/faculty-build-composer/','tools/','validation_artifacts/'))]
snapshot += ['faculty_exports/macroeconomics_question_bank.csv','faculty_exports/macroeconomics_question_bank.pdf','faculty_exports/validation_summary.json']
hashes={}
for rel in snapshot:
 p=R/rel
 if not p.is_file():continue
 hashes[rel]=sha(p);d=H/'baseline'/rel
 if not d.exists():d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d)
# Include the new accepted helpers and graph variants not yet tracked by Git.
for p in list((C/'tests').glob('*approved-revisions*'))+list((C/'data/question-assets').rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(R).as_posix();hashes[rel]=sha(p);d=H/'baseline'/rel
 if not d.exists():d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d)
(H/'baseline_hashes.json').write_text(json.dumps(hashes,indent=2)+'\n')
(H/'starting_git_status.txt').write_text(subprocess.check_output(['git','status','--short'],cwd=R,text=True))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};corpus=[]
for name in ['final-macro','midterm-macro','macro-quiz-1','final-micro','midterm-micro']:
 p=Path('C:/Users/Jennings/Desktop/ECO 2251')/(name+'.docx');dest=H/'corpus'/name;dest.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(p) as z:
  xml=etree.fromstring(z.read('word/document.xml'));blocks=[]
  for el in xml.find('w:body',ns):
   paras=([el] if el.tag.endswith('}p') else el.findall('.//w:p',ns))
   text=' | '.join(''.join(t.itertext()) for q in paras for t in q.findall('.//w:t',ns)) if el.tag.endswith('}tbl') else '\n'.join(''.join(q.itertext()) for q in el.findall('.//w:t',ns))
   if el.tag.endswith('}p'):text=''.join(t.text or '' for t in el.findall('.//w:t',ns))
   if text.strip():blocks.append(text)
  (dest/'text.txt').write_text('\n'.join(blocks),encoding='utf-8')
  media=[]
  for n in z.namelist():
   if n.startswith('word/media/'):
    out=dest/Path(n).name;out.write_bytes(z.read(n));media.append(out.name)
  corpus.append({'name':name,'path':str(p),'sha256':sha(p),'paragraphs':len(xml.findall('.//w:p',ns)),'tables':len(xml.findall('.//w:tbl',ns)),'media':media,'textBlocks':len(blocks)})
(H/'corpus-inventory.json').write_text(json.dumps(corpus,indent=2)+'\n')
print(json.dumps(corpus,indent=2))
