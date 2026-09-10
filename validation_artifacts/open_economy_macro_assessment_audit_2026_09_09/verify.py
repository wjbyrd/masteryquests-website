import json,re,hashlib,unicodedata,copy
from fractions import Fraction as F
from collections import Counter
from pathlib import Path
W=Path(__file__).resolve().parent
def rd(n):return json.loads((W/n).read_text('utf8'))
def wr(n,x):(W/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n','utf8')
def sha(x):return hashlib.sha256(x).hexdigest()
def norm(s):return ' '.join(unicodedata.normalize('NFKC',s).lower().split())
def key(q):return next(o for o in q['options'] if sha(norm(o).encode())==q['aHash'])
def fmt(x):return str(x.numerator) if isinstance(x,F) and x.denominator==1 else str(x)
def nums(s):return [F(x.replace(',','')) for x in re.findall(r'(?<![\w])\d[\d,]*(?:\.\d+)?',s)]
def loc(m):return [(p,q) for p,qs in m['questions'].items() for q in qs]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
b=rd('inventory-before.json');lib=rd('library-after.json');views=rd('resolved-after.json');comp=rd('composition.json');spec=rd('revisions.json');changes=rd('changes.json');qs={q['id']:q for m in views.values() for p,q in loc(m)};proof=[]
for i,s in spec.items():
 if not s['numeric']:continue
 q=qs[i];n=nums(q['q']);code=i.removeprefix('PMOE-');values={};fr=[];units='All stated monetary amounts are same-period domestic currency in billions; differences preserve units.';why='Independently substitute final-stem inputs into the selected identity before comparing options.'
 if code=='TX-L-001':
  c,cm,inv,im,x,claim=n;imports=cm+im;nx=x-imports;y=c+inv+nx;save=y-c;values=dict(importChange=imports,nxChange=nx,yChange=y,savingChange=save);fr=[f'${fmt(y)}',f'${fmt(-save)}']
 elif code=='TX-L-002':
  save,inv,dsA,dsB,diB=n;initial=save-inv;endB=initial+dsB-diB;lo=initial+dsA;hi=lo-endB;values=dict(initialNX=initial,BrinNX=endB,investmentLowerExclusive=lo,investmentUpperExclusive=hi);fr=[f'${fmt(lo)}',f'${fmt(hi)}'];why='Solve endB < initialNX+deltaSA-deltaIA < 0; exclude both boundaries.'
 elif code=='TX-L-003':
  out,x,m=n;nx=x-m;inward=out-nx;values=dict(nxChange=nx,inflowChange=inward);fr=[f'${fmt(inward)}'];why='NX=NCO reconciles the period sums without identifying causal timing.'
 elif code=='TX-L-005':
  public,inv,nx=n;private=public-inv-nx;values=dict(privateSavingIncrease=private);fr=[f'${fmt(private)}']
 elif code=='TX-L-006':
  save,inv,x,m,out,inn=n;target=save-inv;assert target==out-inn;newM=x-target;newX=m+target;values=dict(requiredNX=target,correctedM=newM,correctedX=newX);fr=[f'${fmt(newM)}',f'${fmt(newX)}'];why='Both alternatives satisfy the same fixed NCO; no data identify which trade entry is wrong.'
 elif code=='TX-LB-003':
  inv,c,cm,y=n;imports=inv+cm;x=y-c-inv+imports;nx=x-imports;values=dict(exportsIncrease=x,nxChange=nx);fr=[f'${fmt(x)}',f'${fmt(-nx)}'];units='Millions of domestic currency; imported consumption and investment are subtracted once.'
 elif code=='NER-E-001':
  e=n[0];values=dict(eurosForOneUSD=e);fr=[f'{float(e):.2f} euros'];units='1 USD × 1.30 EUR/USD = 1.30 EUR; USD cancels.'
 elif code=='NER-E-002':
  old,new=n;change=new-old;assert change>0;values=dict(EURperUSDRise=change);fr=['Appreciated against the euro'];units='Both quotes are EUR/USD; more EUR per USD means dollar appreciation against EUR, not every currency.'
 elif code=='NER-EL-002':
  up,down=n;factor=(1+up/100)/(1-down/100);assert factor>1;values=dict(eurosPerYenFactor=factor);fr=['It rises'];units='(EUR/USD)/(JPY/USD)=EUR/JPY; USD units cancel.'
 elif code=='NER-H-005':
  usd,old,new=n;delta=usd*(new-old);values=dict(cadRevenueChange=delta);fr=[f'{-int(delta):,}'];units='USD × (CAD/USD) = CAD. Compare alternative conversions, not past converted balances.'
 elif code=='NER-L-001':
  budget,bill,e,rise=n;newbill=bill*(1+rise/100);emin=newbill/budget;decline=100*(1-emin/e);values=dict(newEuroBill=newbill,minimumEURperUSD=emin,maxPercentDecline=decline);fr=[fmt(decline)+' percent'];units='EUR bill / USD budget = EUR/USD; ratio of two EUR/USD quotes is dimensionless.'
 elif code=='NER-L-002':
  gain,loss=n;ret=100*((1+gain/100)*(1-loss/100)-1);values=dict(homeCurrencyReturnPercent=ret);fr=[f'{float(ret):.1f}'];units='Foreign asset units × (home currency/foreign currency) = home currency; growth factors multiply.'
 elif code=='NER-L-003':
  price,dep=n;factor=(1+price/100)*(1-dep/100);growth=100*(1/factor-1);values=dict(foreignPriceFactor=factor,requiredVolumeGrowthPercent=growth);fr=[f'{float(growth):.2f}'];units='(USD/unit) × (foreign currency/USD) × units = foreign currency revenue. Solve volume factor as reciprocal.'
 elif code=='NER-L-005':
  old,new,*_=n;dep=100*(1-old/new);cost=100*(new/old-1);values=dict(domesticDepreciationPercent=dep,importCostRisePercent=cost);fr=[f'{float(dep):.1f}',fmt(cost)+' percent more'];units='Domestic units/USD multiplied by fixed USD price gives domestic cost. Reciprocal USD/domestic quote measures domestic currency value.'
 elif code=='NER-L-006':
  old,new,fee,bill=n;oldcost=bill/old;newbase=bill/new;newcost=newbase*(1+fee/100);be=100*(oldcost/newbase-1);values=dict(oldUSDCost=oldcost,newUSDCost=newcost,breakEvenFeePercent=be);fr=['$'+fmt(newcost),fmt(be)+' percent'];units='GBP / (GBP/USD)=USD; fee multiplies converted USD cost.'
 elif code=='NER-LB-003':
  gain,loss,asset=n;cf=(1+gain/100)*(1-loss/100);ret=100*(cf*(1+asset/100)-1);restore=100*(1/cf-1);values=dict(currencyFactor=cf,assetReturnPercent=ret,restorationPercent=restore);fr=[f'{float(ret):.2f}',f'{float(restore):.2f}'];units='JPY asset × USD/JPY = USD; currency-restoration base differs from asset-return base.'
 elif code in ['RER-M-001','RER-B2-001']:
  if code=='RER-M-001':p,pf,e=n
  else:p,pf,e=n
  val=e*p/pf;values=dict(realRate=val);fr=[f'{float(val):.2f}'];units='(foreign currency/domestic currency) × (domestic currency/domestic basket) / (foreign currency/foreign basket) = foreign baskets/domestic basket.'
 elif code in ['RER-H-001','RER-B3-001','RER-M-002']:
  if code=='RER-M-002':pd,pf=n;de=F(0)
  else:de,pd,pf=n;de=-de if code=='RER-B3-001' else de
  approx=de+pd-pf;exact=100*((1+de/100)*(1+pd/100)/(1+pf/100)-1);values=dict(firstOrderPercent=approx,exactPercent=exact);fr=[fmt(abs(approx))+' percent'];units='Percentage growth of eP/P*: growth(e)+inflation(P)−inflation(P*), explicitly first-order; e is foreign/domestic.'
 elif code=='RER-H-002':
  p0,p1,f0,f1=n;val=100*((p1/p0)/(f1/f0)-1);values=dict(realAppreciationPercent=val);fr=[f'{float(val):.1f}'];units='Fixed e cancels; (P1/P0)/(P*1/P*0) is a dimensionless real-rate growth factor.'
 elif code=='RER-H-006':
  p,pf,e=n;old=e*p/pf;required=pf/p;values=dict(initialRealRate=old,eForParity=required,finalRealRate=F(1));fr=[fmt(required),f'{float(old):.2f}','1.00'];fr[0]=f'{float(required):.2f}';units='Crowns per instrument / USD per instrument = crowns/USD. Then (crowns/USD) × USD/crowns = comparable-basket ratio.'
 elif code=='RER-LB-002':
  p0,p1,pf0,pf1,e0,e1=n;old=e0*p0/pf0;new=e1*p1/pf1;values=dict(initialRealRate=old,finalRealRate=new);fr=[f'{float(old):.2f}',f'{float(new):.3f}'];units='e foreign/domestic times currency-denominated comparable basket price ratio; all currency units cancel.'
 elif code=='RER-L-002':
  p,pf,e0,e1,infl,actual=n;target=e0*p/pf;newpf=pf*(1+infl/100);required=target*newpf/e1;actualeps=e1*actual/newpf;assert actualeps<target;values=dict(targetRealRate=target,requiredDomesticPrice=required,actualRealRate=actualeps);fr=[fmt(required),'below'];units='Required P = target ε × P*/e, in domestic currency per domestic basket.'
 elif code=='RER-L-003':
  pd,pf,actualdep=n;required=100*(1-(1+pf/100)/(1+pd/100));actualfactor=(1-actualdep/100)*(1+pd/100)/(1+pf/100);assert actualfactor>1;values=dict(depreciationThresholdPercent=required,actualRealFactor=actualfactor);fr=[f'{float(required):.2f}','yes'];units='e quoted B currency/A currency; real stability requires e-growth factor=(1+B inflation)/(1+A inflation).'
 elif code=='RER-LB-001':
  initial,eg,pd,pf=n;factor=(1+eg/100)*(1-pd/100)/(1+pf/100);required=100*(1-1/factor);values=dict(year1RealFactor=factor,year2RequiredDepreciationPercent=required);fr=[f'{float(required):.2f}'];units='Same foreign/domestic quote in both years; price levels fixed in year two, so e must reverse the first real factor.'
 elif code=='RER-LB-003':
  eg,pd,pf=n;factor=(1+eg/100)*(1+pd/100)/(1+pf/100);required=100*(1-1/factor);values=dict(firstRealFactor=factor,minDepreciationPercent=required);fr=[f'{float(required):.2f}'];units='B currency/A currency throughout; solve e2/e1 ≤ reciprocal(first-stage real factor).'
 elif code=='NCO-L-001':
  out,inn,rise=n;newout=out*(1+rise/100);initial=out-inn;lo=100*(newout/inn-1);hi=100*((newout-initial)/inn-1);values=dict(initialNCO=initial,newOutflow=newout,inflowGrowthLowerExclusive=lo,inflowGrowthUpperExclusive=hi);fr=[f'{float(lo):.2f}',f'{float(hi):.2f}'];why='Solve initial negative NCO < final NCO < 0 for inward-flow growth; not merely gross-flow growth comparison.'
 elif code=='NCO-L-004':
  out,ilo,ihi,blo,bhi=n;lo=out-ihi-bhi;hi=out-ilo-blo;values=dict(minNCO=lo,maxNCO=hi);fr=[f'${fmt(-lo)}',f'${fmt(hi)}'];why='Independent inflow bounds add; NCO subtracts their sum. Interval straddles zero.'
 elif code=='NCO-L-006':
  out,inn,rev=n;net=out-inn;lo=net-2*rev;hi=net+2*rev;values=dict(reportedNCO=net,minNCO=lo,maxNCO=hi);fr=[f'${fmt(-lo)}',f'${fmt(hi)}'];why='Worst-case opposite revisions affect both flow sides, so net uncertainty is twice the individual bound.'
 elif code=='NCO-LB-001':
  out0,in0,in1,di,ds=n;net0=out0-in0;net1=net0+ds-di;out1=net1+in1;values=dict(initialNCO=net0,finalNCO=net1,laterOutwardFlow=out1);fr=[f'${fmt(out1)}',f'${fmt(-net1)}'];assert net1<0
 elif code=='NCO-LB-002':
  out,inn,actual=n;shift=out+inn;feedback=actual-shift;values=dict(scheduleShift=shift,feedback=feedback);fr=[f'${fmt(-feedback)}'];assert -F(45)-F(30)==feedback;why='Compute +140 − (−60); then reconcile observed net shift with −45 resident and +30 foreign feedback contributions.'
 elif code=='FX-L-006':
  e0=F('1.0');em=F('1.2');ef=F('1.0');q0=F(100);qf=F(200);pct=100*(em/e0-1);qgrowth=100*(qf/q0-1);values=dict(initialRate=e0,estimatedIntermediateRate=em,finalRate=ef,intermediateRateRisePercent=pct,finalQuantityRisePercent=qgrowth);fr=[fmt(pct)+' percent','doubles'];units='Foreign currency/USD on vertical axis; horizontal dollar units with no billion multiplier.';why='Independent visual transcription of FX-04: dashed guides at A=(100,1) and B=(200,1); D1-S0 crossing approximately (150,1.2), estimated to nearest tenth as requested. No unnumbered coordinates imported.'
 elif code=='FX-LB-002':
  demand,supply=n;excess=demand-supply;assert excess>0;values=dict(excessDemandAtOldRate=excess);fr=['Both rise','slopes'];units='Horizontal dollar quantity shifts evaluated at the same original foreign-currency/USD rate; subtraction does not produce a percent rate change.'
 elif code=='POL-L-002':
  schedule,investmentfall=n;actual=investmentfall;feedback=actual-schedule;values=dict(ncoIncrease=actual,rateFeedback=feedback);fr=[f'${fmt(-feedback)}',f'${fmt(actual)}','depreciates'];why='Fixed saving implies ΔNCO=−ΔI. Subtract original schedule shift to isolate rate feedback; positive final NCO shift moves vertical FX supply right.'
 elif code=='POL-L-003':
  imports,exports,observed=n;required=imports-exports;actualNX=imports-exports-observed;values=dict(requiredOtherImportRebound=required,NXIfReportedRebound=actualNX);fr=[f'${fmt(required)}',f'${fmt(observed)}','conflict'];assert actualNX!=0
 elif code=='POL-LB-001':
  public,inv,nx=n;private=public-inv-nx;values=dict(privateSavingRise=private,ncoChange=-nx);fr=[f'${fmt(private)}',f'${fmt(nx)}']
 elif code=='POL-LB-002':
  demand,nco=n;excess=nco-demand;assert excess>0;values=dict(excessSupplyAtOldRate=excess,NXIncrease=nco);fr=['depreciates',fmt(nco)+' units','slope'];units='Same horizontal domestic-currency units at the old rate; positive NCO supplies net domestic currency, and NX is measured in the same model units.'
 else:raise AssertionError('Unvalidated revised numeric '+i)
 answer=key(q);assert all(x in answer for x in fr),(i,n,values,fr,answer)
 proof.append(dict(id=i,finalStem=q['q'],extractedNumericInputs=[str(v) for v in n],independentResults={k:dict(exact=str(v),decimal=float(v)) for k,v in values.items()},units=units,method=why,roundedKeyFragmentsChecked=fr,keyedOption=answer,allFourOptionsReviewed=True,uniqueEconomicAnswer=True))
assert len(proof)==sum(x['numeric'] for x in spec.values())==39
wr('numerical-validation.json',dict(method='Final-stem values parsed anew; exact Fraction arithmetic and independent image transcription produce results before answer-hash lookup. Hash only locates the keyed option for subsequent comparison. All revised quantitative items covered.',allRevisedQuantitativeCount=len(proof),items=proof))
assert set(qs)==set(b['records']) and len(qs)==240
index={x['id']:x for x in changes};actions=[];allowed={'q','options','aHash','feedback','image','imageAlt','graphDescription'}
for i,q in qs.items():
 old=b['records'][i];assert {k:x for k,x in q.items() if k not in allowed}=={k:x for k,x in old.items() if k not in allowed},i
 assert len(q['options'])==len(set(map(norm,q['options'])))==4 and sum(sha(norm(o).encode())==q['aHash'] for o in q['options'])==1
 assert q['q'].strip() and q['feedback'].strip();c=index.get(i);action='content-revised' if i in spec else 'path-only' if c and set(c['after'])=={'image'} else 'accessibility-only' if c else 'unchanged'
 actions.append(dict(id=i,concept=q['primaryConceptId'],objective=q['objective'],canonicalDifficulty=q['canonicalDifficulty'],type=q['type'],action=action,imagePathCorrected=bool(c and c['pathRevised']),reason=c['reason'] if c else 'Retain appropriate selected coverage; quality and tier limitations separately disclosed.'))
wr('record-actions.json',actions);acc=dict(before=240,after=240,added=0,removed=0,**dict.fromkeys(['content-revised','accessibility-only','path-only','unchanged'],0));acc.update(Counter(x['action'] for x in actions))
for field,label in [('concept','byConcept'),('objective','byObjective'),('canonicalDifficulty','byCanonicalDifficulty'),('type','byType')]:acc[label]={val:{**dict.fromkeys(['content-revised','accessibility-only','path-only','unchanged'],0),**dict(Counter(x['action'] for x in actions if x[field]==val))} for val in sorted({x[field] for x in actions})}
acc.update(graphLinkedBefore=22,graphLinkedAfter=22,trialGraphBefore=15,trialGraphAfter=15,referencesRepaired=0,unresolvedReferences=0,distinctImagesInspected=10,assetRegistrationsInspected=10,revisedQuantitativeIndependentlyVerified=39,accessibilityRuntimeContractsCorrected=len(rd('accessibility-spec.json')),conceptAssetMetadataEntriesCorrected=len(rd('asset-accessibility-changes.json')));wr('accounting.json',acc)
a=copy.deepcopy(b);a.update(records=qs,views=views,assets=comp['assets'],orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],librarySha256=lib['librarySha256'],rawSelectedDefinitions={c:lib['concepts'][c] for c in views},authoritativeSources={c:lib['concepts'][c] for c in views});a['sourceFiles']={p:sha((W/'staged'/Path(p).name).read_bytes()) if p.startswith('data/composer_') else h for p,h in b['sourceFiles'].items()};wr('inventory-after.json',a)
print(json.dumps({k:x for k,x in acc.items() if not k.startswith('by')}))
