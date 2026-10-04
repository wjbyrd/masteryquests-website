import sys,json,importlib.util,hashlib,collections,re
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path.cwd(); out=root/'tmp/macroeconomics_wording_graph_audit_20261003';out.mkdir(exist_ok=True)
spec=importlib.util.spec_from_file_location('exporter',root/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
lib=e.load_library(root/e.SOURCE);records,_=e.collect(lib);e.audit_answers_and_routes(lib,records,root,sys.argv[1]);groups=e.partition_disciplines(records,e.course_area_memberships(lib,root,sys.argv[1]))
serial=lambda r:{k:sorted(v) if isinstance(v,set) else v for k,v in r.items()}
micro={k:serial(v) for k,v in groups['macro'].items()};shared=set(micro)&(set(groups['general'])|set(groups['micro']))
(out/'records.json').write_text(json.dumps(micro,ensure_ascii=False),encoding='utf8')
(out/'shared.json').write_text(json.dumps(sorted(shared)),encoding='utf8')
hashes={str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for base in ['build','faculty_exports','tools'] for p in (root/base).rglob('*') if p.is_file() and '__pycache__' not in str(p)}
(out/'baseline_hashes.json').write_text(json.dumps(hashes),encoding='utf8')
assets={}
for i,r in micro.items():
 q=r['q']; image=q.get('image')
 if image:assets.setdefault(image,[]).append(i)
images=[]
for n,(ref,ids) in enumerate(sorted(assets.items()),1):
 p,resolution=e.resolve_image(micro[ids[0]]['q'],root/'build/faculty-build-composer/data',lib)
 assert p,ref
 images.append({'number':n,'reference':ref,'path':str(p),'ids':ids,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'images.json').write_text(json.dumps(images,indent=2),encoding='utf8')
for start in range(0,len(images),6):
 canvas=Image.new('RGB',(1600,1560),'white');d=ImageDraw.Draw(canvas)
 for j,asset in enumerate(images[start:start+6]):
  x=j%2*800;y=j//2*520;im=Image.open(asset['path']).convert('RGB');im.thumbnail((780,475));canvas.paste(im,(x+(800-im.width)//2,y+40+(475-im.height)//2))
  d.text((x+8,y+5),str(asset['number'])+' '+Path(asset['reference']).name,fill='black');d.text((x+8,y+22),asset['ids'][0]+f" ({len(asset['ids'])} records)",fill='black')
 canvas.save(out/f'images-{start//6+1:02}.png')
def fmt(i,r):
 q=r['q'];return f"{i}{' [SHARED]' if i in shared else ''} | {q.get('primaryConceptId',q.get('tag'))} | {q['q']}\n"+'\n'.join(f"{'ABCD'[k]}{'*' if k==r['answer'] else ''}: {s}" for k,s in enumerate(q['options']))
graphtext=[]
for im in images:
 graphtext.append(f"\nIMAGE {im['number']} {im['reference']}\n"+'\n\n'.join(fmt(i,micro[i]) for i in im['ids']))
for j in range(0,len(graphtext),15):(out/f'graphs-{j//15+1:02}.txt').write_text('\n'.join(graphtext[j:j+15]),encoding='utf8')
byconcept=collections.defaultdict(list)
for i,r in micro.items():byconcept[r['q'].get('primaryConceptId',r['q'].get('tag','unknown'))].append((i,r))
families=[]
for concept,items in sorted(byconcept.items()):
 fam={}
 for i,r in items:
  q=r['q'];normalized=re.sub(r'\d[\d,.]*','#',q['q'])
  fam.setdefault(normalized,[]).append(i)
 lines=[]
 for text,ids in fam.items():
  key=len(families)+1;families.append({'number':key,'concept':concept,'ids':ids,'stem':text})
  lines.append(f"F{key} [{len(ids)}; {'SHARED' if all(i in shared for i in ids) else 'MACRO'}] {ids[0]}: {text}")
 (out/(concept+'.txt')).write_text('\n'.join(lines),encoding='utf8')
(out/'families.json').write_text(json.dumps(families,ensure_ascii=False),encoding='utf8')
print(json.dumps({'counts':{k:len(v) for k,v in groups.items()},'shared':len(shared),'image_records':sum(len(x['ids']) for x in images),'assets':len(images),'stem_families':len(families),'concepts':{k:len(v) for k,v in byconcept.items()},'source_sha256':hashes[str(e.SOURCE).replace('\\','/')]},indent=2))
