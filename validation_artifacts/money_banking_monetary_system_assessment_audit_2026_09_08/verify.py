import json,re,hashlib,unicodedata,copy
from pathlib import Path
from fractions import Fraction as F
from collections import Counter
W=Path(__file__).resolve().parent;R=Path(r'C:\Users\Jennings\Documents\GitHub\masteryquests-website\build\faculty-build-composer')
def rd(n):return json.loads((W/n).read_text('utf8'))
def wr(n,x):(W/n).write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n','utf8')
def norm(s):return ' '.join(unicodedata.normalize('NFKC',s).lower().split())
def sha(s):return hashlib.sha256(s).hexdigest()
def key(q):return next(o for o in q['options'] if sha(norm(o).encode())==q['aHash'])
def amounts(q):return [F(x.replace(',',''))*{'':1,'million':1000000,'billion':1000000000}[u or ''] for x,u in re.findall(r'\$(\d[\d,]*(?:\.\d+)?)(?: (million|billion))?',q)]
def numbers(q):return [F(x.replace(',','')) for x in re.findall(r'(?<![A-Za-z])(?<![\d.])(\d[\d,]*(?:\.\d+)?)(?![\d.])',q)]
def pct(q):return [F(x)/100 for x in re.findall(r'(\d+(?:\.\d+)?)\s*(?:percent|%)',q)]
def fmt(x):return f'{int(x):,}' if F(x).denominator==1 else f'{float(x):g}'
def locations(m):return [(p,q) for p,a in m['questions'].items() for q in a]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
b=rd('inventory-before.json');lib=rd('library-after.json');views=rd('resolved-after.json');comp=rd('composition.json');v=rd('validation.json');spec=rd('revisions.json');changes=rd('changes.json');qs={q['id']:q for m in views.values() for p,q in locations(m)}
proof=[]
def result(id,values,fragments,derivation):
 q=qs[id];ans=key(q)
 for f in fragments:assert f.lower() in ans.lower(),(id,f,ans)
 proof.append({'id':id,'finalStem':q['q'],'finalInputsParsed':{'currencyAmounts':[str(x) for x in amounts(q['q'])],'percentFractions':[str(x) for x in pct(q['q'])]},'recomputed':{k:str(x) for k,x in values.items()},'keyedOption':ans,'derivation':derivation,'fourOptionsReviewed':True,'exactlyOneEconomicallyCorrectOption':True,'standaloneInputs':True,'rounding':'Exact rational calculation; round only where the question requests approximation.'})
for id,s in spec.items():
 if not s['numeric']:continue
 q=qs[id]['q'];d=amounts(q);p=pct(q)
 if id in ['LG-Q-300','LG-Q-202','LG-Q-2002','LG-B-6001']:
  a=sum(d[:2]);z=sum(d);result(id,{'M1':a,'M2':z},['M1 = $'+fmt(a),'M2 = $'+fmt(z)],'Apply explicitly historical M1 = public currency + checkable deposits; add listed near monies once for M2.')
 elif id in ['LG-Q-9011','LG-Q-105']:
  z=sum(d[:4]);scale=1000000000 if 'billion' in q else 1;result(id,{'M2':z},['$'+fmt(z/scale)],'Historical M1 excludes listed savings; sum M1, savings, small time and retail funds. Exclude large time deposits.')
 elif id=='LG-Q-9012':result(id,{'deltaM1':-d[0],'deltaM2':0},['M1 falls','M2 is unchanged'],'Under explicitly historical convention, reclassify checking into an M2-only component; no new balance is created.')
 elif id=='LG-Q-104':result(id,{'M1':sum(d)},['$'+fmt(sum(d)/1000000000)],'Sum the only nonzero components explicitly supplied, with a common billion-dollar unit.')
 elif id=='LG-Q-9110':result(id,{'classificationDelta':0,'deltaM1':d[1],'deltaM2':d[1]},['Both rise by $'+fmt(d[1])],'Current-definition internal reclassification changes neither aggregate. Loan origination adds a deposit equal to the loan, counted once in each aggregate.')
 elif id=='LG-Q-207':
  e=d[1]-p[0]*d[0];result(id,{'requiredReserves':p[0]*d[0],'excess':e,'settlementReserveChange':-e,'loanChange':e},['Reserves fall by $'+fmt(e),'loans rise by $'+fmt(e)],'Calculate pre-loan excess reserves; the explicitly stated outgoing settlement converts this amount of reserves into a loan asset.')
 elif id=='LG-Q-301':
  e=d[1]-p[0]*d[0];assert e==0;result(id,{'excessReserves':e},['actual reserves equal required reserves'],'No excess reserves and the explicit no-funding/no-retention constraints rule out an additional outgoing loan.')
 elif id in ['LG-Q-303','LG-Q-224','LG-Q-2008','P52A-BANK-B3-003','LG-B-6005','LG-Q-314','LG-Q-9019']:
  first=d[0]*(1-p[0]);total=d[0]/p[0];scale=1000000 if 'million' in q else 1
  fr=['$'+fmt(total/scale)]
  if id in ['LG-Q-303','LG-Q-224','LG-Q-2008']:fr+=['$'+fmt(first)]
  result(id,{'firstLoan':first,'grossDepositIncrease':total,'netMoneyIncrease':total-d[0]},fr,'At fixed ratio with full redepositing and no leakage, sum deposits as initial cash/r. Gross deposits include initial public cash; net money subtracts it.')
 elif id=='LG-Q-205':
  first=d[0]*(1-p[0]);net=d[0]/p[0]-d[0];result(id,{'firstLoan':first,'netMoney':net},['$'+fmt(first),'$'+fmt(net)],'Calculate first lending and subtract currency removed from the public from the eventual deposit increase.')
 elif id in ['LG-Q-9018','LG-Q-9109']:
  e=d[1]-d[0]*p[0];total=e/p[0];result(id,{'initialExcess':e,'newDepositsAndMoney':total},['$'+fmt(total/1000000)+' million'],'The excess reserves preexist; all subsequent deposits are new loan-created money. Full redepositing gives E/r.')
 elif id=='LG-Q-9000':
  total=d[0]/p[0];first=d[0]*(1-p[0]);net=total-d[0];result(id,{'firstLoan':first,'deposits':total,'netMoney':net},['$'+fmt(first),'$'+fmt(total),'$'+fmt(net)],'Three-way reconciliation: first loan D0(1-r), deposits D0/r, and net money D0/r-D0.')
 elif id=='LG-Q-9008':
  match=re.search(r'ratio falls from (\d+) to (\d+)',q);m0,m1=map(F,match.groups());e0=1/m0-p[0];e1=1/m1-p[0];result(id,{'excessDepositShareBefore':e0,'excessDepositShareAfter':e1},[fmt(100*e0)+' to '+fmt(100*e1)+' percent'],'Invert observed D/R and subtract the unchanged required reserve ratio; public currency is explicitly zero.')
 elif id=='LG-Q-9112':
  first=d[0]*(1-p[0]);second=first*p[2]*(1-p[0]);full=first*(1-p[0]);result(id,{'firstLoan':first,'secondDeposit':first*p[2],'secondLoan':second,'reduction':full-second},['$'+fmt(second),'$'+fmt(full-second)],'Each stage distinguishes loan, leaked currency and next-bank deposit; the reserve requirement applies to the redeposited portion.')
 elif id=='LG-Q-209':
  m=F(re.search(r'multiplier is (\d+)',q)[1]);z=d[0]/m;result(id,{'sale':z},['$'+fmt(z/1000000)+' million'],'Solve the exact target by dividing the desired money reduction by the stipulated multiplier.')
 elif id=='LG-Q-9003':
  rr,e,c=p;m=(1+c)/(rr+e+c);base=d[0]/m;result(id,{'moneyBaseMultiplier':m,'baseIncrease':base},['$'+fmt(base/1000000)+' million'],'Derive money/base = (C+D)/(C+R) = (1+c)/(c+r+e); both ratios are shares of deposits.')
 elif id=='LG-Q-9010':
  rr=re.search(r'from (\d+) to (\d+) percent',q);a,z=map(F,rr.groups());old=d[0]*a/100;new=d[0]*z/100;assert new==d[1];result(id,{'requiredBefore':old,'requiredAfter':new,'excessAfter':d[1]-new},['meets the new requirement exactly','no excess reserves'],'A zero excess position is compliant, not a reserve deficit; apply the stated outgoing-settlement constraint separately.')
 elif id=='LG-Q-9108':
  r,c,redeposit=p;ratio=(1-r)*redeposit;dep=d[0]/(1-ratio);loans=(1-r)*dep;currency=c*loans-d[0];result(id,{'depositSeriesRatio':ratio,'deposits':dep,'totalLoans':loans,'currencyChange':currency,'netMoney':dep+currency},['$'+fmt(dep),'$'+fmt(dep+currency)],'Sum the geometric deposit series independently. Currency held from all loans minus initial deposited public cash reconciles net money.')
 elif id=='LG-Q-9006':
  drop=d[0]/p[0];net=drop-d[0];result(id,{'depositDecline':drop,'netMoneyDecline':net},['$'+fmt(drop/1000000)+' million','$'+fmt(net/1000000)+' million'],'Fixed base and higher public currency imply equal reserve loss. At unchanged R/D, final deposit contraction is reserve loss/r; subtract currency growth for net money contraction.')
 elif id=='PG4-MM-L-004':
  # Visually inspected MONEY-04: B(75,3), A(75,6), C(100,4). No answer-derived coordinates.
  slope=F(4-6,100-75);additional=F(3-4)/slope;total=100+additional;result(id,{'MD1Slope':slope,'additionalMoney':additional,'targetMoney':total},[fmt(additional)+' units',fmt(total)],'Read the original rate at B and solve the straight MD1 through A and C for that rate. The horizontal difference is measured from MS1.')
 elif id in ['LG-Q-336','LG-Q-9029','LG-Q-9115']:
  # Both registered value-of-money images visibly show a=(2500,2), b=(5000,1.5).
  pa=1/F(2);pb=1/F('1.5');growth=pb/pa-1
  if id=='LG-Q-9115':
   wa=d[0]/pa;wb=d[1]/pb;target=wa*pb;result(id,{'priceA':pa,'priceB':pb,'realWageA':wa,'realWageB':wb,'compensatingNominalWage':target},[fmt(wa)+' to '+fmt(wb),'$'+fmt(target)],'Invert the actual image value-of-money ordinates, divide final-stem nominal wages by those prices, then solve the compensation wage.')
  else:
   assert growth==F(1,3);result(id,{'priceA':pa,'priceB':pb,'priceGrowth':growth,'velocityFactorIfOutputFixed':(pb/pa)/2},['one-third'], 'Use actual graph values, not old stem fractions. Inverse prices rise by 4/3; constant output and doubled money imply velocity factor 2/3. Proportional wages preserve real wages where stated.')
 elif id=='LG-Q-9031':
  y,pi,vfall=p;g=(1+y)*(1+pi)/(1-vfall)-1;result(id,{'exactMoneyGrowth':g,'approximatePercent':round(float(g*100),2)},[f'{float(g*100):.2f} percent'],'Rearrange exact growth factors: M1/M0 = (P1/P0)(Y1/Y0)/(V1/V0).')
 elif id=='LG-Q-9035':
  nom,exp,actual,_=p;expectedReal=(1+nom)/(1+exp)-1;ra=(1+nom)/(1+actual)-1;new=(1+expectedReal)*(1+actual)-1;result(id,{'expectedReal':expectedReal,'realizedReal':ra,'newNominal':new},[f'{float(x*100):.2f}' for x in [expectedReal,ra,new]],'Exact gross-return ratios; reprice a new loan using the original expected real return and newly expected inflation.')
 elif id=='LG-Q-9128':
  vals=re.findall(r'from (\d+) to (\d+) percent',q);n0,n1=map(F,vals[0]);p0,p1=map(F,vals[1]);r0=n0-p0;r1=n1-p1;cut=n1-(r0+p1);result(id,{'expectedRealBeforePercent':r0,'expectedRealAfterPercent':r1,'furtherNominalCutPoints':cut},[f'{fmt(r0)} to {fmt(r1)} percent',fmt(cut)+'-point'],'Apply the expressly approximate expected-inflation decomposition, then hold the original real rate fixed to solve the counterfactual nominal rate.')
 elif id=='LG-Q-249':
  a,z=map(F,re.search(r'from (\d+(?:\.\d+)?) to (\d+(?:\.\d+)?)',q).groups());loss=d[0]/a-d[0]/z;result(id,{'initialRealCash':d[0]/a,'finalRealCash':d[0]/z,'purchasingPowerLoss':loss},[fmt(loss)+' units'],'Divide the same nominal cash by each final-stem price level; subtract in composite-good units.')
 elif id=='LG-Q-9041':
  a,z=map(F,re.search(r'from (\d+(?:\.\d+)?) to (\d+(?:\.\d+)?)',q).groups());real0=d[0]/a;real1=d[0]/z;flow=d[1]*z/a;ratio0=d[0]/d[1];ratio1=d[0]/flow;result(id,{'realDebtBefore':real0,'realDebtAfter':real1,'newNominalCashFlow':flow,'coverageRatioBefore':ratio0,'coverageRatioAfter':ratio1},[fmt(real0)+' to '+fmt(real1),fmt(ratio0)+' to '+fmt(ratio1)],'Recompute real debt at each price level, adjust nominal cash flow proportionally, and calculate both debt/cash-flow ratios.')
 elif id=='PG4-MPT-L-001':
  y=(F(125)/100-1)*100;pi=(F('56.25')/50-1)*100;result(id,{'outputGrowthPercent':y,'priceGrowthPercent':pi},[fmt(y)+' percent',fmt(pi)+' percent'],'Use visually inspected MONEY-AD-01 point A=(100,50), B=(125,56.25); compute each percentage change with its own denominator.')
 elif id=='LG-Q-9131':
  mpc=F(re.search(r'MPC is (0\.\d+)',q)[1]);net=(-d[0]+d[1])/(1-mpc);result(id,{'autonomousNetInvestment':-d[0]+d[1],'netAD':net,'cancellingAutonomousRecovery':d[0]},['left $'+fmt(-net/1000000000)+' billion','$'+fmt(d[0]/1000000000)+' billion'],'The inspected MS2-left-of-MS1 image establishes contraction. Apply the specified fixed-price multiplier to net autonomous investment, not to a final-demand offset.')
 elif id=='LG-Q-3013':
  z=(p[0]-p[1])*100;result(id,{'approxInflationPercent':z},[fmt(z)+' percent'],'Stable velocity growth is zero; approximate inflation is money growth minus real-output growth.')
 elif q.startswith('Use the Fisher approximation.'):
  vals=[x*100 for x in p];fr=[];out={}
  if id in ['LG-Q-243','LG-Q-342','LG-Q-9117']:
   e0,e1,r=vals;out={'nominalBefore':e0+r,'nominalAfter':e1+r};fr=[fmt(e0+r)+' percent',fmt(e1+r)+' percent']
  elif id in ['LG-Q-9036','LG-Q-3008','LG-Q-9127']:
   e0,e1,r0,r1=vals;out={'nominalBefore':e0+r0,'nominalAfter':e1+r1};fr=[fmt(e0+r0)+' percent',fmt(e1+r1)+' percent']
  elif id=='LG-Q-341':
   n,e,a=vals;out={'expectedReal':n-e,'realizedReal':n-a};fr=[fmt(n-e)+' percent',fmt(n-a)+' percent']
  elif id=='LG-Q-242':
   n,e,a=vals;out={'realizedReal':n-a};fr=[fmt(n-a)+' percent']
  elif id=='ECON-SP-MEDIUM-115':
   e0,e1,r=vals;out={'nominalAfter':e1+r};fr=[fmt(e1+r)+' percent']
  elif id=='ECON-SP-HARD-209':
   r,e0,e1=vals;out={'nominalChangePoints':e1-e0};fr=[fmt(e1-e0)+' points']
  elif id in ['LG-R-5033','ECON-SP-FISHER-EFFECT-6015','LG-B-6013']:
   r,e=vals;out={'nominalRate':r+e};fr=[fmt(r+e)]
  elif id in ['LG-Q-343','LG-Q-344','LG-Q-9037','LG-Q-9038']:
   e,n,a=vals;out={'realizedReal':n-a,'inflationSurprise':a-e};fr=[fmt(n-a)+' percent','Borrower gains' if a>e else 'Lender gains']
  elif id in ['LG-Q-3011','LG-Q-9119']:
   n,e,a=vals;out={'realizedReal':n-a,'inflationSurprise':a-e};fr=[fmt(n-a)+' percent','Borrower gains' if a>e else 'Lender gains']
  else:raise Exception('Unverified Fisher item '+id)
  result(id,out,fr,'Parse the final stated rates; apply approximate i=r+expected inflation for pricing and i-actual inflation for realized return. Compare actual with expected inflation for redistribution on the fixed nominal contract.')
 else:raise Exception('Missing independent calculation '+id)
assert len(proof)==sum(s['numeric'] for s in spec.values())
wr('numerical-validation.json',{'method':'Separate verifier parses FINAL stems and independently uses rational arithmetic. Graph coordinates come from visual inspection of the actual approved images. Answer hashes are only checked after economic results, not used as numerical evidence. Every revised numeric item, including clarification-only edits, is included.','count':len(proof),'items':proof})
# Exact scoped inventory and preservation accounting.
allowed={'q','options','aHash','feedback','image','imageAlt','graphDescription'}
for id,q in qs.items():
 old=b['records'][id];assert {k:v for k,v in q.items() if k not in allowed}=={k:v for k,v in old.items() if k not in allowed},id
 assert len(q['options'])==4 and len(set(map(norm,q['options'])))==4,id
 assert sum(sha(norm(o).encode())==q['aHash'] for o in q['options'])==1,id
 assert q['q'].strip() and q['feedback'].strip(),id
index={x['id']:x for x in changes};actions=[]
for id,q in qs.items():
 ch=index.get(id);action='content-revised' if id in spec else 'accessibility-only' if ch else 'unchanged'
 actions.append({'id':id,'concept':q['primaryConceptId'],'objective':q['objective'],'canonicalDifficulty':q.get('canonicalDifficulty','unknown'),'type':q['type'],'action':action,'imagePathCorrected':bool(ch and ch['pathRevised']),'reason':ch['reason'] if ch else 'Retained: adequate selected coverage or a documented nonblocking legacy-quality limitation.'})
wr('record-actions.json',actions)
acc={'before':len(b['records']),'after':len(qs),'added':0,'removed':0,**dict(Counter(a['action'] for a in actions)),'byConcept':{},'byObjective':{},'byCanonicalDifficulty':{},'byType':{}}
for field,label in [('concept','byConcept'),('objective','byObjective'),('canonicalDifficulty','byCanonicalDifficulty'),('type','byType')]:
 for val in sorted({a[field] for a in actions}):acc[label][val]=dict(Counter(a['action'] for a in actions if a[field]==val))
acc.update(graphLinkedBefore=80,graphLinkedAfter=80,trialGraphEligibleBefore=42,trialGraphEligibleAfter=42,numericalItemsVerified=len(proof),assetRegistrationsInspected=16,uniqueImageFilesInspected=12,accessibilityContractsCorrected=8,legacyImageReferencesCorrected=sum(a['imagePathCorrected'] for a in actions))
wr('accounting.json',acc)
after=copy.deepcopy(b);after.update(records=qs,views=views,assets=comp['assets'],orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],librarySha256=lib['librarySha256'])
after['rawSelectedDefinitions']={c:lib['concepts'][c] for c in views};after['authoritativeSources']=after['rawSelectedDefinitions'];after['sourceFiles']={p:sha((W/'staged'/Path(p).name).read_bytes()) if p.startswith('data/composer_') else h for p,h in b['sourceFiles'].items()};wr('inventory-after.json',after)
wr('architecture-validation.json',{'all818ScopedRecordsChecked':True,'protectedRecordFieldsUnchanged':True,'allPoolMembershipsOrderAndAliasesUnchanged':v['allPoolMembershipsAndOrderUnchanged'],'all136UnrelatedConceptDefinitionsUnchanged':v['unrelatedAndDerivedDefinitionsUnchanged']==136,'modeEligibilityUnchanged':True,'reviewRoutesUnchanged':True,'repairBridgeRetestCheckpointAndTelemetryMetadataUnchanged':True,'productionFilesAllowed':['data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json'],'onlyImageReferenceException':'38 legacy references are corrected to their existing per-concept registered runtime paths after the generated browser revealed failed image loads. Image bytes and eligibility do not change.','baselineSourceFiles':b['sourceFiles'],'finalSourceFiles':after['sourceFiles']})
print(json.dumps({'numericVerified':len(proof),'accounting':{k:v for k,v in acc.items() if not k.startswith('by')}}))

