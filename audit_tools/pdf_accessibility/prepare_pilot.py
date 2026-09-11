from repo_guard import *
import shutil
from PIL import Image,ImageOps,ImageDraw
root=root_guard()
codes=['GEN-ECON-01','MICRO-04','MICRO-49','MICRO-54','MACRO-23','MACRO-24','MACRO-29','MACRO-42']
base=contained('tmp/pdf_accessibility/repo_lock_v1/pilot')
for sub in ('before','rendered_before'):(base/sub).mkdir(parents=True,exist_ok=True)
exe=Path(r'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
for code in codes:
    path=contained(f'build/faculty-build-composer/data/concept-reviews/{code}.pdf')
    snapshot=contained(base/'before'/(code+'.pdf'))
    if snapshot.exists() and sha(snapshot)!=sha(path):raise ValueError('Baseline snapshot differs; refusing to overwrite')
    if not snapshot.exists():shutil.copy2(path,snapshot)
    subprocess.run([str(exe),'-scale-to','1400','-png','-singlefile',str(path),str(base/'rendered_before'/code)],cwd=root,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
images=[]
for code in codes:
    im=Image.open(base/'rendered_before'/(code+'.png')).convert('RGB')
    im.thumbnail((612,792))
    images.append((code,im))
contact=Image.new('RGB',(612*4,822*2),'#dddddd')
draw=ImageDraw.Draw(contact)
for i,(code,im) in enumerate(images):
    x=(i%4)*612;y=(i//4)*822
    draw.text((x+10,y+8),code,fill='black')
    contact.paste(im,(x,y+30))
contact.save(base/'contact_before.png')
write_json('validation_artifacts/pdf_accessibility/pilot_selection.json',{'codes':codes,'status':'BASELINE_REVIEW','paths':{'before':str((base/'before').relative_to(root)),'renders':str((base/'rendered_before').relative_to(root))}})