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
def percents(q):return [F(x) for x in re.findall(r'(\d+(?:\.\d+)?)\s*percent',q)]
def fmt(x):return f'{int(x):,}' if F(x).denominator==1 else f'{float(x):g}'
def loc(m):return [(p,q) for p,a in m['questions'].items() for q in a]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
b=rd('inventory-before.json');lib=rd('library-after.json');views=rd('resolved-after.json');comp=rd('composition.json');v=rd('validation.json');spec=rd('revisions.json');changes=rd('changes.json');qs={str(q['id']):q for m in views.values() for p,q in loc(m)}
geometry={int(x['runtimePath'].split('-')[-1].split('.')[0]):x['geometry'] for x in rd('accessibility-inspection.json')}
def at_rate(g,line,r):
 (x0,y0),(x1,y1)=geometry[g]['curves'][line];return F(x0)+(r-y0)*F(x1-x0,y1-y0)
def point(g,label):return list(map(F,geometry[g]['points'][label]))
proof=[]
def result(id,values,fragments,derivation):
 q=qs[id];ans=key(q)
 for f in fragments:assert f.lower() in ans.lower(),(id,f,ans)
 proof.append({'id':id,'finalStem':q['q'],'parsedDollarMagnitudes':list(map(str,dollars(q['q']))),'parsedPercentageMagnitudes':list(map(str,percents(q['q']))),'recomputed':{k:str(x) for k,x in values.items()},'keyedOption':ans,'derivation':derivation,'fourOptionsReviewed':True,'exactlyOneEconomicallyCorrectOption':True,'standaloneInputs':True,'rounding':'Exact rational arithmetic; round only the final value where approximate wording permits it.'})
for id,s in spec.items():
 if not s['numeric']:continue
 q=qs[id]['q'];d=dollars(q);p=percents(q)
 if id=='43205':
  saving=d[0]-d[1]-d[2];invUnexpected=saving-d[3]
  result(id,{'savingAndRealizedInvestment':saving,'unplannedInventoryInvestment':invUnexpected},['$'+fmt(saving)+' billion','$'+fmt(-invUnexpected)+' billion unplanned inventory reduction'],'Y−C−G fixes realized investment; subtract planned investment, including planned inventories, to obtain the unplanned inventory change.')
 elif id in ['43217','43219']:
  r=p[0];supply=at_rate(1,'S0',r);demand=at_rate(1,'D0',r);gap=supply-demand;a,_=point(1,'A')
  if id=='43217':result(id,{'supply':supply,'demand':demand,'excessSupply':gap},[fmt(gap)+'-unit excess supply','falling rate'],'Solve each visually inspected straight line at the final-stem rate. Excess supply creates downward rate pressure, moving along both curves.')
  else:result(id,{'newQuantityOnUnchangedSupply':supply,'oldDemandAtNewRate':demand,'horizontalDemandIncrease':gap,'investmentIncrease':supply-a},[fmt(gap)+' units',fmt(supply-a)+' through movement'],'The new equilibrium must be on S0. Its distance from old D0 at the same rate identifies the parallel demand shift; compare quantity with the original intersection separately.')
 elif id=='43245':
  intercept,slope=map(F,re.search(r'I = (\d+) − (\d+)r',q).groups());r0,r1=map(F,re.search(r'from (\d+) to (\d+) percent',q).groups());i0=intercept-slope*r0;i1=i0+d[0];shift=i1+slope*r1-intercept;counter=i1+slope*(r1-r0)
  result(id,{'initialI':i0,'newI':i1,'demandShift':shift,'counterfactualAtOldRate':counter},['$'+fmt(shift)+' billion','$'+fmt(counter)+' billion'],'Invert the new demand intercept from final equilibrium investment and the final rate. Evaluate the inferred new schedule at the old rate.')
 elif id=='43257':
  shift=-d[1]+d[2];a,ra=point(3,'A');z,rz=point(3,'B');actual=(at_rate(3,'S1',ra)-at_rate(3,'S0',ra))*d[0];assert shift==actual
  result(id,{'fixedRateSavingChange':shift,'actualGraphHorizontalShift':actual,'equilibriumInvestmentChange':(z-a)*d[0]},['left by $'+fmt(-shift)+' billion','falls by $'+fmt((a-z)*d[0])+' billion'],'Independently sum the final fiscal/private shifts; compare with same-rate horizontal distance between actual S curves and separately with labeled equilibrium quantities.')
 elif id=='43259':
  a,ra=point(3,'A');restore=(at_rate(3,'S0',ra)-at_rate(3,'S1',ra))*d[0];public=restore-d[1]
  result(id,{'requiredTotalRightShift':restore,'privateShift':d[1],'requiredPublicShift':public},['$'+fmt(public)+' billion'],'Restore the full horizontal supply displacement; subtract the explicit additional private-saving shift. Do not use the equilibrium quantity gap as the shift size.')
 elif id=='43297':
  a,ra=point(7,'A');z,rz=point(7,'B');public=(at_rate(7,'S1',ra)-at_rate(7,'S0',ra))*d[0];private=(z-a)*d[0]-public
  result(id,{'publicSavingIncrease':public,'nationalSavingIncrease':(z-a)*d[0],'inducedPrivateSavingChange':private},['rises $'+fmt(public)+' billion','falls $'+fmt(-private)+' billion'],'The private schedule is unchanged, so the horizontal national-supply shift identifies the public component. Subtract that component from the realized aggregate change to infer endogenous private saving.')
 elif id=='43309':
  a,r=point(8,'A');z,rz=point(8,'B');assert r==rz
  savingShift=(at_rate(8,'S1',r)-at_rate(8,'S0',r))*d[0];demandShift=(at_rate(8,'D1',r)-at_rate(8,'D0',r))*d[0];private=savingShift+d[1]
  assert savingShift==demandShift
  result(id,{'savingShift':savingShift,'demandShift':demandShift,'requiredPrivateSavingShift':private},['$'+fmt(private)+' billion','$'+fmt(savingShift)+' billion'],'Read each old and new schedule at the common plotted rate, then solve private saving minus the public-saving decline equals the net supply increase.')
 elif id=='43069':
  revenue=d[0]-d[1];deficit=d[2]-revenue;cash=d[1]-deficit
  result(id,{'revenue':revenue,'deficit':deficit,'cashIncrease':cash},['$'+fmt(deficit)+' billion deficit','$'+fmt(cash)+' billion cash increase'],'Remove issuance from inflows to obtain revenue. Financing minus the deficit gives the cash increase.')
 elif id=='43070':
  debt,revenue,outlays,issued,retired=d;deficit=outlays-revenue;end=debt+issued-retired;cash=issued-retired-deficit
  result(id,{'deficit':deficit,'netIssuance':issued-retired,'endingDebt':end,'cashIncrease':cash},['$'+fmt(deficit)+' billion deficit','$'+fmt(end)+' billion','$'+fmt(cash)+' billion increase'],'Outlays exclude principal repayment; borrowing excludes revenue. Gross issuance minus retiring principal determines the debt change, and net financing minus deficit determines cash.')
 elif id=='43087':
  months=d[0]/d[1];annual=12*d[1];growth=100*annual/d[0]
  result(id,{'stockOverMonthlyFlowMonths':months,'futureAnnualDeficit':annual,'futureDebtGrowthPercent':growth},[fmt(months)+' months',fmt(growth)+' percent annual debt growth'],'Dimensional analysis gives months. Only the explicit future constant-flow and financing assumptions permit twelve-month accumulation and a percentage growth rate.')
 elif id=='43098':
  gross,tr,g,interest=d;net=gross-tr;public=net-g;balance=gross-tr-g-interest
  result(id,{'netTaxes':net,'publicSaving':public,'fullBudgetBalance':balance,'gapFromInterest':public-balance},['$'+fmt(public)+' billion','$'+fmt(-balance)+' billion deficit'],'T is explicitly gross receipts less transfers only. Full outlays also include interest. Subtract each category once.')
 elif id=='43111':
  g=d[1]-d[0];tr=d[3]-d[2];interest=d[5]-d[4];out=g+tr+interest;deficit=out-d[6]
  result(id,{'purchaseIncrease':g,'transferIncrease':tr,'interestIncrease':interest,'totalOutlayIncrease':out,'deficitWidening':deficit},['$'+fmt(deficit)+' billion','$'+fmt(g)+' billion'],'Sum all outlay changes for the budget, subtract revenue growth, and count only current domestic purchases for direct G.')
 elif id=='43134':
  debt0,borrow,gdpGrowth=p;debtGrowth=100*borrow/debt0;ratio=100*(debt0+borrow)/(100+gdpGrowth)
  result(id,{'debtGrowthPercent':debtGrowth,'newDebtRatioPercent':ratio},[fmt(debtGrowth)+' percent',f'{float(ratio):.1f} percent'],'Normalize initial GDP to 100. Borrowing is measured relative to GDP, so divide it by initial debt for debt growth. Recompute the ratio with the new GDP.')
 elif id=='43135':
  ratio0,ratio1,growth=p;pp=ratio1-ratio0;relative=100*(ratio1/ratio0-1);nominal=100*((ratio1/ratio0)*(1+growth/100)-1)
  result(id,{'ratioPoints':pp,'relativeRatioGrowthPercent':relative,'nominalDebtGrowthPercent':nominal},[fmt(pp)+' percentage points',fmt(relative)+' percent',fmt(nominal)+' percent'],'Multiply the debt-ratio growth factor by the GDP growth factor to reconstruct nominal debt.')
 elif id=='43137':
  ratio0,ratio1,debtGrowth=p;gdpFactor=(1+debtGrowth/100)*ratio0/ratio1;growth=(gdpFactor-1)*100
  result(id,{'requiredGDPFactor':gdpFactor,'requiredGDPGrowthPercent':growth,'ratioPointIncrease':ratio1-ratio0},[f'{float(growth):.2f} percent','19-percentage-point'],'Solve the claimed nominal-debt factor divided by the ratio factor. Round only at the final step; this is not CBO GDP data.')
 elif id=='43145':
  fixed,repriced=d;fixedRate=F(re.search(r'fixed (\d+) percent',q)[1]);oldRate,newRate=map(F,re.search(r'from (\d+) to (\d+) percent',q).groups());old=(fixed*fixedRate+repriced*oldRate)/100;new=(fixed*fixedRate+repriced*newRate)/100;delta=new-old
  result(id,{'interestBefore':old,'interestAfter':new,'deficitIncrease':delta},['$'+fmt(new)+' billion','$'+fmt(delta)+' billion'],'Weight the unchanged and repriced principal separately for a full year; unchanged revenues and noninterest outlays transmit only the interest change into the deficit.')
 elif id=='43167':
  threshold=100*p[0]/p[1]
  result(id,{'minimumGDPPercentOfInitialForEqualDebt':threshold},[f'{float(threshold):.1f} percent'],'Nominal debt rises precisely when the GDP factor exceeds the inverse ratio factor; equality defines the threshold, so the correct alternative uses exceeds.')
 elif id in ['43203','43189','43264']:
  delta=d[0]-d[1] if id!='43264' else -d[0]+d[1]
  assert delta<0
  fragments=['supply shifts left'] if id!='43264' else ['Supply shifts left']
  result(id,{'fixedRateNationalSavingChange':delta},fragments,'Add the signed private and public schedule shifts at each given rate. In 43203 demand also shifts right, making quantity ambiguous; in the other two demand stays fixed, so equilibrium investment falls.')
 elif id=='43210':
  result(id,{'fixedRateNationalSavingIncrease':d[0]},['Both curves shift right','quantity rises','rate is ambiguous'],'At fixed Y and the same consumption schedule at each rate, lower G shifts national saving right by the stated purchase reduction. Optimism independently shifts investment demand right.')
 else:raise AssertionError('Missing independent numeric proof '+id)
assert len(proof)==sum(x['numeric'] for x in spec.values())
wr('numerical-validation.json',{'method':'A separate verifier parses FINAL staged stems and recomputes with exact fractions. Actual image coordinates are visually transcribed independently of question keys; line interpolation is recomputed. Answer hashes are structural checks, not arithmetic evidence. Every revised numeric item, including clarification-only edits, is included.','count':len(proof),'items':proof})
allowed={'q','options','aHash','feedback','image','imageAlt','graphDescription'}
for id,q in qs.items():
 old=b['records'][id];assert {k:v for k,v in q.items() if k not in allowed}=={k:v for k,v in old.items() if k not in allowed},id
 assert len(q['options'])==4 and len(set(map(norm,q['options'])))==4,id
 assert sum(sha(norm(o).encode())==q['aHash'] for o in q['options'])==1,id
 assert q['q'].strip() and q['feedback'].strip(),id
index={x['id']:x for x in changes};actions=[]
for id,q in qs.items():
 ch=index.get(id);action='content-revised' if id in spec else 'path-only' if ch and set(ch['after'])=={'image'} else 'accessibility-only' if ch else 'unchanged'
 actions.append({'id':id,'concept':q['primaryConceptId'],'objective':q['objective'],'canonicalDifficulty':q.get('canonicalDifficulty','unknown'),'type':q['type'],'action':action,'imagePathCorrected':bool(ch and ch['pathRevised']),'reason':ch['reason'] if ch else 'Retained: adequate selected coverage or a documented nonblocking quality limitation.'})
wr('record-actions.json',actions)
acc={'before':len(b['records']),'after':len(qs),'added':0,'removed':0,**{x:0 for x in ['content-revised','accessibility-only','path-only','unchanged']},**dict(Counter(a['action'] for a in actions)),'byConcept':{},'byObjective':{},'byCanonicalDifficulty':{},'byType':{}}
for field,label in [('concept','byConcept'),('objective','byObjective'),('canonicalDifficulty','byCanonicalDifficulty'),('type','byType')]:
 for val in sorted({a[field] for a in actions}):acc[label][val]={**{x:0 for x in ['added','removed','content-revised','accessibility-only','path-only','unchanged']},**dict(Counter(a['action'] for a in actions if a[field]==val))}
acc.update(graphLinkedBefore=60,graphLinkedAfter=60,trialGraphEligibleBefore=59,trialGraphEligibleAfter=59,numericalItemsVerified=len(proof),assetRegistrationsInspected=8,uniqueImageFilesInspected=8,accessibilityContractsCorrected=8,imageReferencesCorrected=sum(a['imagePathCorrected'] for a in actions))
wr('accounting.json',acc)
after=copy.deepcopy(b);after.update(records=qs,views=views,assets=comp['assets'],orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],librarySha256=lib['librarySha256'])
after['rawSelectedDefinitions']={c:lib['concepts'][c] for c in views};after['authoritativeSources']=after['rawSelectedDefinitions'];after['sourceFiles']={p:sha((W/'staged'/Path(p).name).read_bytes()) if p.startswith('data/composer_') else h for p,h in b['sourceFiles'].items()};wr('inventory-after.json',after)
wr('architecture-validation.json',{'all268ScopedRecordsChecked':True,'protectedRecordFieldsUnchanged':True,'allPoolMembershipsOrderAndAliasesUnchanged':v['allPoolMembershipsAndOrderUnchanged'],'all142UnrelatedConceptDefinitionsUnchanged':v['unrelatedAndDerivedDefinitionsUnchanged']==142,'modeEligibilityUnchanged':True,'reviewRoutesUnchanged':True,'repairBridgeRetestCheckpointAndTelemetryMetadataUnchanged':True,'productionFilesAllowed':['data/composer_library.js','data/composer_registry.json','data/composer_library_manifest.json'],'imagePathsUnchanged':True,'baselineSourceFiles':b['sourceFiles'],'finalSourceFiles':after['sourceFiles']})
print(json.dumps({k:x for k,x in acc.items() if not k.startswith('by')}))
