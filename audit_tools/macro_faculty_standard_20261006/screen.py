import json,re,collections
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
H=Path(__file__).resolve().parent;R=H.parent.parent
rows=json.loads((H/'macro-records.json').read_text());groups=collections.defaultdict(list);risks=[]
prefix=re.compile(r'^(?:In this setting,? |Evidence indicates that |An economist observes that |A policy analyst notes that |Consider a case in which |A classroom example assumes that |(?:Policy case|Inflation scenario|Banking case|AD-AS design|Scenario|Case) [A-Z0-9]+:\s*)',re.I)
for r in rows:
 q=r['q'];s=q['q'];clean=prefix.sub('',s);norm=re.sub(r'\d+(?:[,.]\d+)*','N',clean.lower());norm=re.sub(r'\s+',' ',norm);groups[(q['primaryConceptId'],norm)].append(r['id'])
 issues=[]
 if clean!=s:issues.append('wrapper')
 if re.search(r'\b(?:jointly correct|observed configuration|causal channel and|plotted quantities and|design [A-Z]:|case [A-Z]:)',s):issues.append('mechanical')
 lens=[len(re.findall(r'\b\w+\b',o)) for o in q['options']];key=lens[r['key']];other=sorted(n for i,n in enumerate(lens) if i!=r['key'])
 if key>=12 and key>=2*max(other) and key-max(other)>=7:issues.append('answer-length')
 if len(set(o.lower().strip() for o in q['options']))!=4:issues.append('duplicate-choice')
 if q.get('canonicalDifficulty') in ['hard','elite','legendary'] and len(s.split())<23 and not q.get('image'):issues.append('tier-review')
 if re.search(r'(?:exchange rate (?:rises|falls|increases|decreases))',s,re.I) and not re.search(r'per |appreciat|depreciat|quote|currency',s,re.I):issues.append('exchange-quotation')
 if issues:risks.append({**r,'issues':issues,'protected':r['marketGateDerived'] or 'micro' in r['areas']})
clusters=[{'topic':t,'normalized':s,'ids':ids} for (t,s),ids in groups.items() if len(ids)>1]
clusters.sort(key=lambda g:-len(g['ids']))
(H/'risk-screen.json').write_text(json.dumps(risks,indent=2)+'\n');(H/'similarity-families.json').write_text(json.dumps(clusters,indent=2)+'\n')
print(json.dumps({'riskRows':len(risks),'editableRiskRows':sum(not r['protected'] for r in risks),'flags':dict(collections.Counter(i for r in risks for i in r['issues'])),'similarityFamilies':len(clusters),'topFamilies':clusters[:18]},indent=2))
selected=[r for r in risks if not r['protected'] and any(i!='tier-review' for i in r['issues'])]
for start in range(0,len(selected),40):
 text=[]
 for r in selected[start:start+40]:
  q=r['q'];text.extend([f"{r['id']} [{q.get('canonicalDifficulty')}/{q.get('instructionalRole')}] {','.join(r['issues'])} {r['provenance']}",q['q'],' | '.join(('✓' if i==r['key'] else '')+o for i,o in enumerate(q['options'])),q.get('feedback',''),''])
 (H/f'risk-{start:03}.txt').write_text('\n'.join(text),encoding='utf-8')
# Contact sheets preserve image geometry, including grayscale copies for all active assets.
O=H/'graph-review';O.mkdir(exist_ok=True);assets=json.loads((H/'macro-assets.json').read_text())
for start in range(0,len(assets),4):
 for gray in [False,True]:
  sheet=Image.new('RGB',(2000,1500),'white');draw=ImageDraw.Draw(sheet)
  for k,a in enumerate(assets[start:start+4]):
   im=Image.open(R/'build/faculty-build-composer/data'/a['path']).convert('RGB')
   if gray:im=ImageOps.grayscale(im).convert('RGB')
   im=ImageOps.contain(im,(980,690));x=(k%2)*1000;y=(k//2)*750;sheet.paste(im,(x+(1000-im.width)//2,y+45));draw.text((x+10,y+10),f"{start+k:03} {a['path'].split('/')[-1]} ({len(a['refs'])} refs)",fill='black')
  sheet.save(O/f"{'gray' if gray else 'color'}-{start:03}.jpg",quality=94)
corpus=json.loads((H/'corpus-inventory.json').read_text())
for c in corpus:
 for start in range(0,len(c['media']),4):
  sheet=Image.new('RGB',(2000,1500),'white');draw=ImageDraw.Draw(sheet)
  for k,n in enumerate(c['media'][start:start+4]):
   im=ImageOps.contain(Image.open(H/'corpus'/c['name']/n).convert('RGB'),(980,690));x=k%2*1000;y=k//2*750;sheet.paste(im,(x,y+40));draw.text((x+10,y+10),c['name']+' '+n,fill='black')
  sheet.save(H/'corpus'/c['name']/f'sheet-{start}.jpg',quality=94)
