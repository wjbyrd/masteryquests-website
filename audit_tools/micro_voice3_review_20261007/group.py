import pathlib,json,re,collections
D=pathlib.Path(__file__).resolve().parent
rows=json.loads((D/'candidates.json').read_text(encoding='utf-8'));groups=collections.defaultdict(list)
def norm(q):
 s=re.sub(r'\d[\d,.]*','#',q)
 s=re.sub(r'\b(?:Harbor Roasters|Riverbend Textiles|Maple Street Media|Prairie Solar|Flint Apparel)\b','FIRM',s)
 return s
for r in rows:groups[norm(r['q']['q'])].append(r)
out=[]
for i,(pattern,rs) in enumerate(groups.items(),1):
 r=rs[0];out.append({'group':i,'count':len(rs),'ids':[x['id'] for x in rs],'flags':sorted(set(f for x in rs for f in x['flags'])),'areas':r['areas'],'mg':r['marketGateDerived'],'q':r['q']['q'],'o':r['q']['options'],'key':r['key'],'feedback':r['q'].get('feedback'),'image':r['q'].get('image'),'members':rs})
(D/'groups.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'groups':len(out),'records':len(rows),'largest':[(r['group'],r['count']) for r in sorted(out,key=lambda r:-r['count'])[:15]]}))
