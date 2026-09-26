import json,re,hashlib,sys,importlib.util,math
from pathlib import Path
from decimal import Decimal,ROUND_HALF_UP
R=Path(__file__).resolve().parents[2]; W=Path(__file__).resolve().parent
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8'))
L=read(R/'faculty_exports/audits/microeconomics_consolidated_cleanup_changes.json')
records=read(W/'current_records.json'); Q={str(r['question']['id']):r['question'] for r in records}
S=read(W/'substantive.json'); checks=[]; errors=[]
def key(q):
 import unicodedata
 return next(o for o in q['options'] if hashlib.sha256(re.sub(r'\s+',' ',unicodedata.normalize('NFKC',o).strip()).lower().encode()).hexdigest()==q['aHash'])
def save(q,kind,result,ok=True):
 d={'id':q['id'],'kind':kind,'result':result,'ok':ok};checks.append(d)
 if not ok: errors.append(d)
def money(x):return f'{Decimal(str(x)).quantize(Decimal(".01"),rounding=ROUND_HALF_UP):.2f}'
for s in S:
 q=s['q'];t=q['q'];a=key(q)
 if 'buyers each want one unit with values [' in t:
  v=sorted(map(int,re.search(r'values \[([^]]+)\]',t)[1].split(',')),reverse=True)
  c=sorted(map(int,re.search(r'resource costs \[([^]]+)\]',t)[1].split(',')))
  g=[x-y for x,y in zip(v,c)]; cum=[sum(g[:i]) for i in range(len(g)+1)]
  best=max(cum);qty=max(i for i,x in enumerate(cum) if x==best)
  if 'handling requirement' in t:
   charge=int(re.search(r'uses \$(\d+)',t)[1]);g=[x-charge for x in g];cum=[sum(g[:i]) for i in range(len(g)+1)];best=max(cum);qty=max(i for i,x in enumerate(cum) if x==best)
   ok=f'{qty} units' in a and f'${best}' in a
  elif 'reallocating that one unit' in t:
   n=int(re.search(r'Exactly (\d+) units',t)[1]);gain=v[n-1]-v[-1];ok=f'Raise total surplus by ${gain}' in a
  elif 'minimum willingness to pay' in t:
   n=int(re.search(r'includes (\d+) trades',t)[1]);ok=f'${c[n]};' in a
  elif 'reassignment' in t.lower():
   n=int(re.search(r'A (\d+)-unit',t)[1]);gain=v[n-1]-v[-1];fee=int(re.search(r'using \$(\d+) of real',t)[1]);net=gain-fee
   ok=f'${gain} before' in a and str(abs(net)) in a and (('so reassign' in a)==(net>0))
  else:ok=f'{qty}' in a and f'${best}' in a
  save(q,'visible surplus schedule exhaustive allocation',{'values':v,'costs':c,'surplusByQuantity':cum,'maximum':best,'largestMaximizer':qty},ok)
 if 'workers each earn $' in t and 'recurring fixed fee adds' in t:
  n,w=map(int,re.search(r'(\d+) workers each earn \$(\d+)',t).groups());fc=int(re.search(r'fixed cost is \$(\d+)',t)[1]);lo,hi=map(int,re.search(r'output from (\d+) to (\d+)',t).groups());fee=int(re.search(r'fee adds \$(\d+)',t)[1]);inc=int(re.search(r'pay rises \$(\d+)',t)[1]);fc+=fee;w+=inc
  values=[Decimal(fc)/hi,Decimal(n*w)/hi,Decimal(fc+n*w)/hi,Decimal(w)/(hi-lo)]
  want=[money(x) for x in values];ok=all(f'{f}=${v}' in a for f,v in zip(['AFC','AVC','ATC','MC'],want))
  save(q,'visible employment/cost counterfactual',want,ok)
 if 'Treat the displayed averages as exact' in t:
  n=int(re.search(r'Q=(\d+)',t)[1]);avc=Decimal(re.search(r'AVC=\$(\d+(?:\.\d+)?)',t)[1]);atc=Decimal(re.search(r'ATC=\$(\d+(?:\.\d+)?)',t)[1]);afc=atc-avc
  save(q,'visible exact averages',[str(afc),str(afc*n)],f'AFC=${money(afc)}' in a and f'TFC=${money(afc*n)}' in a)
 if 'Marginal costs of units 1–7 are [' in t:
  p=int(re.search(r'faces price \$(\d+)',t)[1]);fc=int(re.search(r'Fixed cost is \$(\d+)',t)[1]);mc=list(map(int,re.search(r'1–7 are \[([^]]+)\]',t)[1].split(',')))
  profits=[p*i-sum(mc[:i])-fc for i in range(8)];best=max(profits);qty=max(i for i,v in enumerate(profits) if v==best)
  counter=None
  if 'license fee adds' in t: counter={'output':qty,'profit':best-int(re.search(r'fee adds \$(\d+)',t)[1])}
  if 'price is expected' in t:
   p2=int(re.search(r'price is expected to be \$(\d+)',t)[1]);pfs=[p2*i-sum(mc[:i])-fc for i in range(8)];counter={'output':max(i for i,v in enumerate(pfs) if v==max(pfs)),'profit':max(pfs)}
  if 'lowers every marginal' in t:
   dec=int(re.search(r'unit cost by \$(\d+)',t)[1]);pfs=[p*i-sum(mc[:i])+dec*i-fc for i in range(8)];counter={'output':max(i for i,v in enumerate(pfs) if v==max(pfs)),'profit':max(pfs)}
  save(q,'visible competitive schedule exhaustive profits',{'profits':profits,'output':qty,'profit':best,'counterfactual':counter,'currentKey':a},True)
# Independent matrix game enumeration, including all ties.
matrices=[]
for d in L['decisions']['graphEligibility']:
 cells=d['matrix'];labels=list(cells);br1={};br2={}
 for col in ['X','Y']:
  m=max(cells[r+'/'+col][0] for r in ['A','B']);br1[col]=[r for r in ['A','B'] if cells[r+'/'+col][0]==m]
 for row in ['A','B']:
  m=max(cells[row+'/'+c][1] for c in ['X','Y']);br2[row]=[c for c in ['X','Y'] if cells[row+'/'+c][1]==m]
 ne=[p for p in labels if p[0] in br1[p[2]] and p[2] in br2[p[0]]];total=max(sum(v) for v in cells.values());joint=[p for p in labels if sum(cells[p])==total]
 matrices.append({'id':d['id'],'asset':d['asset'],'cells':cells,'rowBestResponses':br1,'columnBestResponses':br2,'allPureNash':ne,'jointMaxima':joint,'ok':sorted(ne)==sorted(d['pureNash']) and sorted(joint)==sorted(d['jointMaxima']) and Q[d['id']].get('graphRequired') is True})
# Bind stored numeric formulas to their actual visible inputs, retaining misses for manual review.
bindings=[]
for filename in ['numeric_specs.json','manual_numeric_specs.json']:
 for s in read(R/'audit_tools/microeconomics_cleanup/inputs'/filename):
  q=Q[s['questionID']];nums=set(re.findall(r'\d+(?:\.\d+)?',q['q'].replace(',','')));literals=set(re.findall(r'\d+(?:\.\d+)?',s['formula']));missing=sorted(literals-nums-{'0','1','2','0.5','100'})
  bindings.append({'id':s['questionID'],'formula':s['formula'],'literalsNotInStem':missing,'image':q.get('image')})
(W/'independent_checks.json').write_text(json.dumps({'checks':checks,'errors':errors,'matrices':matrices,'numericInputBindings':bindings},indent=2),encoding='utf-8')
print(json.dumps({'visibleInputChecks':len(checks),'errors':errors,'matrixChecks':len(matrices),'matrixFailures':[x for x in matrices if not x['ok']],'numericFormulas':len(bindings),'formulasWithUnboundLiterals':sum(bool(x['literalsNotInStem']) for x in bindings)}))
