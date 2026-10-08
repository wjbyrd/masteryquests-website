import pathlib,json,hashlib,shutil,re,base64
from html.parser import HTMLParser
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1]
P=R/'faculty_exports/audits/micro_faculty_voice_pass3_review_20261007.html'
class Node:
 def __init__(self,tag='',attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
 def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children if isinstance(x,str) or x.attrs.get('class')!='keylabel').strip()
 def find(self,tag=None,cls=None):
  out=[]
  for n in self.children:
   if isinstance(n,Node):
    if (tag is None or n.tag==tag) and (cls is None or cls in n.attrs.get('class','').split()):out.append(n)
    out+=n.find(tag,cls)
  return out
class Parse(HTMLParser):
 def __init__(self):super().__init__();self.root=Node();self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs);self.stack[-1].children.append(n)
  if tag not in ['meta','link','img','input','br','hr']:self.stack.append(n)
 def handle_endtag(self,tag):
  assert self.stack[-1].tag==tag,(tag,self.stack[-1].tag)
  self.stack.pop()
 def handle_data(self,s):self.stack[-1].children.append(s)
p=Parse();p.feed(P.read_text(encoding='utf-8'))
cards=p.root.find('article');ids=[c.find('h3')[0].text() for c in cards]
assert len(ids)==len(set(ids))==94,'STOP: expected exactly 94 unique candidate cards'
out=[]
for id,c in zip(ids,cards):
 sections=c.find('div','comparison')[0].find('section');assert len(sections)==2
 def side(n):
  opts=n.find('li');assert len(opts)==4
  keys=[i for i,o in enumerate(opts) if 'key' in o.attrs.get('class','').split()];assert len(keys)==1
  return {'q':n.find('p','stem')[0].text(),'options':[o.text() for o in opts],'key':keys[0]}
 b,a=map(side,sections);assert b['key']==a['key']
 f=c.find('details')[0];paragraphs=f.find('p');old=next(x.text().removeprefix('Current feedback:').strip() for x in paragraphs if x.text().startswith('Current feedback:'))
 new=next((x.text().removeprefix('Suggested feedback:').strip() for x in paragraphs if x.text().startswith('Suggested feedback:')),old)
 b['feedback']=old;a['feedback']=new
 override={'42705':'No. At an interior optimum, MRS must also equal the price ratio.','P62C-CPS-H-019':'Consumer and producer surplus both fall; total surplus falls to $36.','P62C-CPS-L-074':'Measured willingness to pay reflects both willingness and ability to pay.'}.get(id)
 if override:a['options'][a['key']]=override
 graph=None
 if c.find('img'):
  graph={'sha256':hashlib.sha256(base64.b64decode(c.find('img')[0].attrs['src'].split(',',1)[1])).hexdigest(),'imageAlt':c.find('img')[0].attrs['alt'],'graphDescription':c.find('details')[-1].find('p')[-1].text()}
 out.append({'id':id,'before':b,'final':a,'facultyOverride':bool(override),'page':int(re.search(r'PDF p\. (\d+)',c.text()).group(1)),'patterns':[x.text() for x in c.find('span','tag')],'rationale':c.find('p','reason')[0].text(),'reviewGraph':graph})
(D/'manifest.json').write_text(json.dumps({'reviewFile':str(P.relative_to(R)),'reviewSha256':hashlib.sha256(P.read_bytes()).hexdigest(),'candidates':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
B=D/'baseline';B.mkdir(exist_ok=True)
for name in ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']:
 s=R/'build/faculty-build-composer/data'/name;t=B/name
 if t.exists():assert t.read_bytes()==s.read_bytes(),'Baseline already exists and differs'
 else:shutil.copyfile(s,t)
for name in ['validation_summary.json','general_economics_question_bank.csv','microeconomics_question_bank.csv','macroeconomics_question_bank.csv']:
 shutil.copyfile(R/'faculty_exports'/name,B/name)
print(json.dumps({'parsedCandidateCards':len(cards),'uniqueIds':len(set(ids)),'facultyOverrides':3,'manifest':str(D/'manifest.json')}))
