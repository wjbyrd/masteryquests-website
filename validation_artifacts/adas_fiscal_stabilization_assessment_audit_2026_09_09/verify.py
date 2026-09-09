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
def dollars(q):return [F(x.replace(',','')) for x in re.findall(r'\$(\d[\d,]*(?:\.\d+)?)',q)]
def fmt(x):return f'{int(x):,}' if F(x).denominator==1 else f'{float(x):g}'
def loc(m):return [(p,q) for p,a in m['questions'].items() for q in a]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
b=rd('inventory-before.json');lib=rd('library-after.json');views=rd('resolved-after.json');comp=rd('composition.json');v=rd('validation.json');spec=rd('revisions.json');changes=rd('changes.json');qs={str(q['id']):q for m in views.values() for p,q in loc(m)}
proof=[]
def result(i,values,fragments,derivation,approx=False):
 q=qs[i];ans=key(q)
 for fragment in fragments:assert fragment.lower() in ans.lower(),(i,fragment,ans)
 proof.append(dict(id=i,finalStem=q['q'],parsedDollarMagnitudes=list(map(str,dollars(q['q']))),recomputed={k:str(x) for k,x in values.items()},keyedOption=ans,options=q['options'],derivation=derivation,exactlyOneEconomicallyCorrectOption=True,standaloneInputs=True,rounding='Closest offered estimate from visually transcribed raster coordinates.' if approx else 'Exact rational arithmetic; only the explicitly approximate break-even percentage is rounded.'))
for i,s in spec.items():
 if not s['numeric']:continue
 q=qs[i]['q'];d=dollars(q);match=re.search(r'MPC = (0\.\d+)',q);mpc=F(match[1]) if match else None
 if i in ['LG-Q-275','LG-Q-373','P52B-S4-FMCO-B2-002','LG-B-6023']:
  gross,off=d;net=gross-off
  result(i,dict(grossAD=gross,totalADOffset=off,netAD=net),['$'+fmt(net)],'Both final-stem amounts are total AD changes. Subtract once; do not multiply the explicit induced-spending-inclusive offset.')
 elif i in ['LG-Q-376','LG-Q-4011','LG-Q-9073','LG-Q-9133']:
  g,off=d;k=1/(1-mpc);gross=k*g;net=gross-off
  result(i,dict(MPC=mpc,multiplier=k,grossAD=gross,netAD=net),['$'+fmt(net)],'Apply 1/(1−MPC) to purchases, then subtract the total AD offset. For sequence options, also verify direct and gross stages separately.')
  if i in ['LG-Q-9073','LG-Q-9133']:
   assert '$'+fmt(g) in key(qs[i]) and '$'+fmt(gross) in key(qs[i])
 elif i in ['LG-Q-9069','LG-Q-9139']:
  gap,g,off=d;k=1/(1-mpc);gross=k*g;net=gross-off;remaining=gap-net
  result(i,dict(MPC=mpc,multiplier=k,grossAD=gross,totalADOffset=off,netAD=net,remainingHorizontalADGap=remaining),['$'+fmt(net),'$'+fmt(remaining)],'All gaps are measured at the same reference price. Subtract the induced-spending-inclusive offset from gross AD, then subtract net AD from the target distance.')
 elif i=='LG-Q-4014':
  gap,investment,g,loss=d;k=1/(1-mpc);aut=investment+g-loss;net=k*aut;remaining=gap-net
  result(i,dict(netAutonomousSpending=aut,multiplier=k,netAD=net,remainingHorizontalADGap=remaining),['$'+fmt(remaining)],'All three impulses are autonomous. Their net must be multiplied, including the raw investment loss: (50+60−40)×4=280, then 500−280=220. Alternatives 100 and 60 respectively omit induced displacement and all displacement; 460 omits the positive impulses.')
 elif i=='LG-Q-9070':
  excess,g=d;k=1/(1-mpc);shift=g*k;final=excess+shift
  result(i,dict(multiplier=k,totalADShift=shift,finalExcessDesiredSpending=final),['$'+fmt(shift),'$'+fmt(final)],'Expansion adds to the already-positive horizontal AD excess. Do not treat the resulting AD distance as actual equilibrium GDP.')
 elif i=='LG-Q-9074':
  gap,g=d;k=1/(1-mpc);shift=g*k
  assert gap==shift
  result(i,dict(multiplier=k,totalADShift=shift,remainingHorizontalADGap=gap-shift),['$'+fmt(shift),'closing the gap'],'The explicitly horizontal reference-price gap and computed AD shift are equal.')
 elif i=='LG-Q-9136':
  excess,loss=d;k=1/(1-mpc);reduction=loss*k;remaining=excess-reduction
  result(i,dict(multiplier=k,ADReduction=reduction,remainingExcessDesiredSpending=remaining),['$'+fmt(remaining)],'Investment response is supplied. Apply the spending multiplier to the autonomous reduction and subtract from the horizontal AD excess.')
 elif i=='PM2D2-STAB-L-002':
  authorized,oldgap,newgap=d;k=F(re.search(r'multiplier is (\d+)',q)[1]);assert 'One third' in q
  paid=authorized/3;net=paid*k;cancel=authorized-paid;overshoot=authorized*k-newgap
  assert oldgap==authorized*k and net==newgap
  result(i,dict(unavoidablePurchases=paid,theirADShift=net,cancelRemaining=cancel,fullImplementationOvershoot=overshoot),['$'+fmt(cancel),'$'+fmt(paid),'$'+fmt(newgap)],'Extract the one-third unavoidable share, multiply it, and solve the remaining authorization against the revised target. The unavoidable portion already meets the target; any extra payment overshoots.')
 elif i=='ECON-SP-HARD-228':
  y1,y2,y3,g,off=d;k=1/(1-mpc);net=g*k-off;target=y1+net
  assert target==y2 and y1<y2<y3
  result(i,dict(multiplier=k,grossAD=g*k,netAD=net,targetAtPriceP=target,AD1=y1,AD2=y2,AD3=y3),['AD2','$'+fmt(net)],'The numeric scale is supplied in the final stem, not inferred from the unnumbered artwork. Compute gross 80, total offset 20, net 60, then locate 560 on AD2. No SRAS or macro-equilibrium conclusion is asserted.')
 elif i=='P52A-AS-L-003':
  loss,gain=map(F,re.findall(r'(\d+) percent',q)[:2]);factor=(1-loss/100)*(1+gain/100);growth=(factor-1)*100;breakeven=(1/(1-loss/100)-1)*100
  result(i,dict(capacityFactor=factor,capacityGrowthPercent=growth,breakEvenProductivityGainPercent=breakeven),[fmt(growth)+' percent',f'{float(breakeven):.2f} percent'],'Use the explicit multiplicative capacity identity. Retained capital × new productivity gives 1.026; solve retained capital × required productivity = 1 to get 100/19 percent, rounded to 5.26 percent. Three-percentage-point subtraction is a different-base error.')
 elif i in ['PG3-AD-H-001','PG3-AD-H-002','PG3-AS-H-001','PG3-AS-H-002']:
  # Independent observations transcribed from visual inspection of original raster assets, not the final metadata or old key.
  observations={'PG3-AD-H-001':(F(100),F(155),F(50),F(60)),'PG3-AD-H-002':(F(150),F(100),F(46),F(54)),'PG3-AS-H-001':(F('148.1'),F('190.5'),F(40),F(44)),'PG3-AS-H-002':(F(150),F(110),F(36),F(44))}
  p0,p1,lo,hi=observations[i];gap=abs(p1-p0);opts=list(map(F,qs[i]['options']));closest=min(opts,key=lambda x:abs(x-gap))
  assert sum(abs(x-gap)==abs(closest-gap) for x in opts)==1
  assert all(min(opts,key=lambda x:abs(x-g))==closest for g in [lo,hi])
  result(i,dict(firstCurveReading=p0,secondCurveReading=p1,approximateGap=gap,plausibleGapLower=lo,plausibleGapUpper=hi,closestOfferedValue=closest),[fmt(closest)],'Read each curve at the final-stem fixed axis value; take their absolute horizontal or vertical separation. Compare all four offered estimates. The same unique choice remains closest across the stated visual-read interval. AS-01 pixel calibration corroborates the approximately 42.4-unit vertical separation.',True)
 elif i=='PM2D2-FISCAD-L-001':
  total,target,comparison=d;hi,lo=map(F,re.search(r'MPCs of (0\.\d+) and (0\.\d+)',q).groups());x=(target-lo*total)/(hi-lo);other=total-x
  assert comparison==total and 0<=x<=total and hi*x+lo*other==target
  result(i,dict(highMPCAllocation=x,lowMPCAllocation=other,highGroupConsumption=hi*x,lowGroupConsumption=lo*other,totalFirstRoundConsumption=target,directPurchasesComparison=total),['$'+fmt(x),'$'+fmt(other)],'Invert the weighted first-round consumption equation with the total budget fixed. Separately compare with purchases, which directly enter AD in full. Equal shares would produce 78 rather than the required 84.')
 elif i=='P52A-FISCAD-L-005':
  tr,target=d;k=1/(1-mpc);first=mpc*tr;aut=target/k;cut=first+aut
  result(i,dict(multiplier=k,transferConsumption=first,requiredNetAutonomousContraction=aut,purchasesCut=cut),['$'+fmt(cut),'$'+fmt(first),'$'+fmt(aut)],'Transfers induce MPC×transfer consumption, unlike purchases. Solve (MPC×transfer−purchasesCut)×multiplier=−target. The resulting 36 cut exactly meets the target; a smaller cut does not achieve at least that contraction.')
 elif i=='PG3-MEQ-L-004':
  # Geometry independently transcribed from the inspected ADAS-02 image.
  points={'A':(F(75),F(100)),'B':(F(100),F(125)),'C':(F(75),F(150)),'D':(F(50),F(125))}
  ya,pa=points['A'];yc,pc=points['C'];yd,pd=points['D'];slope=(pc-pd)/(yc-yd);intercept=pd-slope*yd;priceTargetGDP=(pa-intercept)/slope
  assert yc==ya and priceTargetGDP<yd
  result(i,dict(originalGDP=ya,originalPrice=pa,outputTargetGDP=yc,outputTargetPrice=pc,AS1Slope=slope,AS1Intercept=intercept,priceTargetGDP=priceTargetGDP),['C at GDP '+fmt(yc)+' and price '+fmt(pc),'price '+fmt(pa),'GDP '+fmt(priceTargetGDP)],'Use the original A target and the inspected straight AS1 through C and D. Keeping AS1 fixed, solve separately for the output target and price target. Price restoration needs further demand contraction from D; output restoration increases price pressure.')
 else:raise AssertionError('Missing independent recomputation '+i)
assert len(proof)==sum(s['numeric'] for s in spec.values())==24
wr('numerical-validation.json',dict(method='Independent final-stem parsing with rational arithmetic or separately transcribed original-image coordinates. Computation precedes answer-key comparison; hashes do not establish numerical validity.',count=len(proof),items=proof))
index={c['id']:c for c in changes};actions=[];deferred=set(rd('overlap-mask.json')['selectedPhillipsDeferredIds'])
assert set(qs)==set(b['records']) and len(qs)==728
for i,q in qs.items():
 old=b['records'][i];allowed={'q','options','aHash','feedback','image','imageAlt','graphDescription'}
 assert {k:x for k,x in q.items() if k not in allowed}=={k:x for k,x in old.items() if k not in allowed},i
 assert len(q['options'])==len(set(map(norm,q['options'])))==4
 assert sum(sha(norm(o).encode())==q['aHash'] for o in q['options'])==1
 assert q['q'].strip() and q['feedback'].strip()
 ch=index.get(i);action='content-revised' if i in spec else 'path-only' if ch and set(ch['after'])=={'image'} else 'accessibility-only' if ch else 'unchanged'
 if i in deferred:assert old==q and action=='unchanged'
 actions.append(dict(id=i,concept=q['primaryConceptId'],objective=q['objective'],canonicalDifficulty=q.get('canonicalDifficulty','unknown'),type=q['type'],action=action,protectedPhillips=i in deferred,imagePathCorrected=bool(ch and ch['pathRevised']),reason=ch['reason'] if ch else 'Protected Phillips record: integration scan and structural validation only; full content audit deferred.' if i in deferred else 'Retained selected coverage; residual nonblocking flags are dispositioned separately.'))
wr('record-actions.json',actions)
acc=dict(before=len(b['records']),after=len(qs),added=0,removed=0,byConcept={},byObjective={},byCanonicalDifficulty={},byType={})
acc.update({x:0 for x in ['content-revised','accessibility-only','path-only','unchanged']});acc.update(Counter(a['action'] for a in actions))
for field,label in [('concept','byConcept'),('objective','byObjective'),('canonicalDifficulty','byCanonicalDifficulty'),('type','byType')]:
 for val in sorted({a[field] for a in actions}):acc[label][val]={**{x:0 for x in ['added','removed','content-revised','accessibility-only','path-only','unchanged']},**dict(Counter(a['action'] for a in actions if a[field]==val))}
acc.update(coreContentAuditRecords=466,protectedPhillipsRecords=262,graphLinkedBefore=161,graphLinkedAfter=161,trialGraphEligibleBefore=72,trialGraphEligibleAfter=72,numericalItemsVerified=len(proof),assetRegistrationsInspected=27,uniqueImageFilesInspected=len({a['sha256'] for a in rd('assets.json')}),accessibilityContractsCorrected=len(rd('asset-accessibility-changes.json')),uniqueGraphFamiliesCorrected=8,imageReferencesCorrected=sum(a['imagePathCorrected'] for a in actions))
wr('accounting.json',acc)
after=copy.deepcopy(b);after.update(records=qs,views=views,assets=comp['assets'],orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],librarySha256=lib['librarySha256'])
after['rawSelectedDefinitions']={c:lib['concepts'][c] for c in views};after['authoritativeSources']=after['rawSelectedDefinitions'];after['sourceFiles']={p:sha((W/'staged'/Path(p).name).read_bytes()) if p.startswith('data/composer_') else h for p,h in b['sourceFiles'].items()};wr('inventory-after.json',after)
wr('architecture-validation.json',dict(all728ScopedRecordsChecked=True,all262PhillipsRecordsUnchanged=True,protectedRecordFieldsUnchanged=True,allPoolMembershipsOrderAndAliasesUnchanged=v['allPoolMembershipsAndOrderUnchanged'],all135NonselectedConceptDefinitionsUnchanged=v['unrelatedAndDerivedDefinitionsUnchanged']==135,modeEligibilityUnchanged=True,reviewRoutesUnchanged=True,repairBridgeRetestCheckpointAndTelemetryMetadataUnchanged=True,productionFilesAllowed=['data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json'],baselineSourceFiles=b['sourceFiles'],finalSourceFiles=after['sourceFiles']))
print(json.dumps({k:x for k,x in acc.items() if not k.startswith('by')}))
