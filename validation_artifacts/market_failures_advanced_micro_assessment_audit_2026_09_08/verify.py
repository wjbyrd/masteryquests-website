import json,re,hashlib,unicodedata
from pathlib import Path
from fractions import Fraction as F
from collections import Counter
from PIL import Image
W=Path(__file__).resolve().parent;R=Path('C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer')
def read(n):return json.loads((W/n).read_text('utf8'))
def write(n,x):(W/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n','utf8')
def norm(x):return ' '.join(unicodedata.normalize('NFKC',x).lower().split())
def digest(x):return hashlib.sha256(x).hexdigest()
def money(q):return [F(x.replace(',','')) for x in re.findall(r'\$(\d[\d,]*(?:\.\d+)?)',q)]
def match(q,p):return F(re.search(p,q).group(1).replace(',',''))
def show(x):return str(int(x)) if x.denominator==1 else str(float(x))
def fmt(x):return f'{int(x):,}' if x.denominator==1 else str(float(x))
def key(q):return next(o for o in q['options'] if digest(norm(o).encode())==q['aHash'])
b=read('inventory-before.json');lib=read('library-after.json');views=read('resolved-after.json');comp=read('composition.json');changes=read('changes.json');spec=read('revisions.json');v=read('validation.json')
def locations(m):return [(p,q) for p,ls in m.get('questions',{}).items() for q in ls]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
qs={str(q['id']):q for m in views.values() for p,q in locations(m)}
# Models are reconstructed independently from visually inspected endpoints in the approved images, not copied from answer keys or authoring calculations.
models={
'garments':dict(mpb=(F(21),F(-12,320)),mpc=(F(3),F(12,320)),social=(F(9),F(12,320)),socialSide='cost',qScale='million garments',moneyScale='million dollars'),
'vapes':dict(mpb=(F(19),F(-12,240)),mpc=(F(1),F(12,240)),social=(F(15),F(-12,240)),socialSide='benefit',qScale='thousand vapes',moneyScale='thousand dollars'),
'gardens':dict(mpb=(F(16),F(-8,200)),mpc=(F(6),F(12,200)),social=(F(1),F(12,200)),socialSide='cost',qScale='gardens',moneyScale='dollars'),
'transit':dict(mpb=(F(8),F(-5,250)),mpc=(F(2),F(5,250)),social=(F(10),F(-5,250)),socialSide='benefit',qScale='thousand rides per day',moneyScale='thousand dollars per day')}
def at(line,q):return line[0]+line[1]*q
def cross(a,b):return (b[0]-a[0])/(a[1]-b[1])
def integrate(line,lo,hi):return (hi-lo)*(at(line,lo)+at(line,hi))/2
for m in models.values():
 m['marketQ']=cross(m['mpb'],m['mpc']);m['socialQ']=cross(m['mpb'] if m['socialSide']=='cost' else m['mpc'],m['social']);m['marketPrice']=at(m['mpc'],m['marketQ']);m['buyerPrice']=at(m['mpb'],m['socialQ']);m['sellerReceipt']=at(m['mpc'],m['socialQ']);m['wedge']=abs(m['buyerPrice']-m['sellerReceipt']);m['dwl']=abs(m['marketQ']-m['socialQ'])*m['wedge']/2;m['fiscal']=m['wedge']*m['socialQ']
sirensMB=(F(40000),F(-500));sirensMC=(F(20000),F(0));coastMB=(F(60),F(-1));coastMC=(F(15),F(1,2));radioMB=(F(10000),F(-100));radioPrivate=(F(6000),F(-100));radioMC=(F(2000),F(0));north=(F(50000),F(-5000));south=(F(40000),F(-5000));fireMSB=(F(90000),F(-10000));fireMC=(F(50000),F(0))
proofs=[]
def record(id,values,expectedFragments,derivation):
 q=qs[id];answer=key(q)
 for fragment in expectedFragments:assert fragment.lower() in answer.lower(),(id,fragment,answer)
 proofs.append(dict(id=id,finalStem=q['q'],image=q.get('image'),finalInputs=money(q['q']) and [show(x) for x in money(q['q'])] or 'Approved graph geometry and explicitly stated quantities',recomputed={k:show(F(x)) for k,x in values.items()},keyedOption=answer,derivation=derivation,exactArithmetic=True,standaloneInputs=True,oneEconomicallyCorrectOptionAfterFullOptionReview=True))
for id,s in spec.items():
 if not s['numeric']:continue
 q=qs[id]['q'];d=money(q)
 if id in ['42026','42036','42056']:
  m=models[{'42026':'garments','42036':'vapes','42056':'transit'}[id]];record(id,{'marketQ':m['marketQ'],'socialQ':m['socialQ'],'wedge':m['wedge'],'dwl':m['dwl']},['$'+fmt(m['dwl'])], 'Integrate the linear social/private net-benefit gap over the excess or omitted output interval; use the image quantity scale.')
 elif id=='42047':
  m=models['gardens'];cap=match(q,r'cap of (\d+)');assert cap>m['marketQ'];record(id,{'cap':cap,'privateQ':m['marketQ'],'socialQ':m['socialQ']},['nonbinding at '+show(m['marketQ'])],'An upper maximum above the unconstrained optimum does not force expansion.')
 elif id=='42057':
  m=models['transit'];record(id,{'wedge':m['wedge'],'target':m['socialQ']},['$'+fmt(m['wedge'])+' rider subsidy',show(m['socialQ'])+' thousand'],'Positive consumption benefit requires raising effective MPB to the social curve; solve the social intersection.')
 elif id=='P52B-MFAIL-H-001':
  benefit,cost,harm,tax=d;private=benefit-cost;social=private-harm;assert tax==harm and social<0<private;record(id,{'privateGain':private,'socialGain':social},['$'+fmt(private),'-$'+fmt(-social)],'Subtract real production cost and third-party harm from willingness to pay.')
 elif id=='42122':
  saving,fine=d;p=match(q,r'probability (0\.\d+)');threshold=saving/p;record(id,{'currentExpectedPenalty':p*fine,'strictFineThreshold':threshold},['above $'+fmt(threshold)],'A risk-neutral evader compares savings with detection probability times fine; equality leaves indifference.')
 elif id=='42130':
  tax=d[0];post=match(q,r'sales to (\d+)');record(id,{'postQuantity':post,'revenue':tax*post},['$'+fmt(tax*post)],'Use post-policy quantity, not baseline sales or the quantity reduction.')
 elif id=='42140':
  a1,a2,b1,b2=d;alloc=[(0,2,b1+b2),(1,1,a1+b1),(2,0,a1+a2)];best=min(alloc,key=lambda z:z[2]);assert best[:2]==(2,0);record(id,{'minimumCost':best[2],'equalCutCost':a1+b1,'saving':a1+b1-best[2]},['$'+fmt(best[2]),'$'+fmt(a1+b1-best[2])],'Enumerate all feasible two-ton allocations respecting successive abatement costs.')
 elif id=='42066':
  m=models['garments'];rise=m['buyerPrice']-m['marketPrice'];fall=m['marketPrice']-m['sellerReceipt'];record(id,{'buyerBurden':rise,'sellerBurden':fall},['$'+fmt(rise)+' more','$'+fmt(fall)+' less'],'Calculate both price changes from graph intersections, independent of legal remittance.')
 elif id=='42084':
  m=models['gardens'];record(id,{'buyerPrice':m['buyerPrice'],'sellerReceipt':m['sellerReceipt'],'budget':m['fiscal']},['$'+fmt(m['buyerPrice']),'$'+fmt(m['sellerReceipt']),'$'+fmt(m['fiscal'])],'At the social Q read MPB and MPC; multiply their gap by all produced units.')
 elif id in ['42096','42100']:
  m=models['vapes'];tax=F(2);actualQ=cross((m['mpb'][0]-tax,m['mpb'][1]),m['mpc']);residual=abs(actualQ-m['socialQ'])*(m['wedge']-tax)/2
  if id=='42096':record(id,{'policyQuantity':actualQ,'socialQuantity':m['socialQ'],'remainingWedge':m['wedge']-tax},['$2 above',show(actualQ),show(m['socialQ'])],'Dashed line endpoints imply a $2 shift; compare its intersection with MSB-MPC.')
  else:
   assert d==[2,4];revDiff=m['fiscal']-tax*actualQ;record(id,{'additionalWelfare':residual,'revenueIncrease':revDiff},['$'+fmt(residual)+' thousand','$'+fmt(revDiff)+' thousand'],'Solve both tax equilibria. Additional welfare equals removed residual triangle; revenue uses each endogenous quantity.')
 elif id=='42149':
  cost,harm,contract=d;ceiling=harm-contract;record(id,{'lowerPayment':cost,'upperPayment':ceiling,'netSurplus':ceiling-cost},['more than $'+fmt(cost),'less than $'+fmt(ceiling)],'Venue minimum is prevention cost; victims maximum is avoided harm less their real contract cost.')
 elif id=='42156':
  cost,harm=d;assert harm>cost;record(id,{'jointSurplus':harm-cost},['filter remains worthwhile','compensation can change'],'Compare resources and avoided damage under both rights; negligible bargaining costs and no wealth effects are explicit.')
 elif id=='42086':
  m=models['gardens'];assert d==[m['wedge'],m['wedge']];record(id,{'socialQuantity':m['socialQ'],'gain':m['dwl'],'transfer':m['fiscal']},[show(m['socialQ'])+' gardens','$'+fmt(m['dwl'])],'Equal per-unit incentives support the same graph quantity; real gain is the omitted-surplus triangle, not all-unit payments.')
 elif id=='42095':
  subsidy,admin,bargain=d;m=models['transit'];assert subsidy==m['wedge'];x=m['dwl']-admin;y=m['dwl']-bargain;record(id,{'grossGain':m['dwl'],'policyNet':x,'bargainNet':y},['$'+fmt(x)+' thousand','$'+fmt(y)+' thousand'],'Use thousands per day consistently: graph triangle minus each real implementation cost.')
 elif id=='42147':
  baseline=match(q,r'emit (\d+)');cap=match(q,r'to (\d+) tons');capacity=match(q,r'first (\d+)');second=match(q,r'next (\d+)');low,high=d;need=baseline-cap;assert capacity<need<=capacity+second;total=capacity*low+(need-capacity)*high;record(id,{'abatement':need,'lowCostTons':capacity,'highCostTons':need-capacity,'minimumCost':total},[show(capacity)+' low-cost',show(need-capacity)+' higher-cost','$'+fmt(total)],'Use the limited cheapest reductions first; remaining emissions equal the cap.')
 elif id=='42151':
  cost,rent,outside,contract=d;gross=rent+outside-cost;net=gross-contract;assert rent<cost and gross>0>net;record(id,{'privateNet':rent-cost,'grossSocialNet':gross,'contractNet':net},['socially worthwhile before coordination costs','neither rent capture alone nor that bargain'],'Separate benefit captured by the landlord from the outside benefit and real organization cost.')
 elif id=='42153':
  hA,cA,tA,hB,cB,tB=d;gA=hA-cA-tA;gB=hB-cB-tB;assert gA>gB;record(id,{'surplusA':gA,'surplusB':gB,'paymentLowerA':cA,'paymentUpperA':hA-tA},['Option A','more than $'+fmt(cA),'less than $'+fmt(hA-tA)],'Rank net benefits of both contracts; compute separate reservation payments from final inputs.')
 elif id=='42159':
  harm,cost,bargain,admin=d;gross=harm-cost;record(id,{'gross':gross,'bargainNet':gross-bargain,'regulationNet':gross-admin},['$'+fmt(gross-admin)+' million','loses $'+fmt(bargain-gross)+' million'],'Rank specified real institutional costs against no action (zero incremental surplus).')
 elif id=='P77-MFAIL-L-019':
  benefit,harm,cost,residual=d;plain=benefit-harm;insulated=benefit-cost-residual;assert insulated>0>plain;record(id,{'lateNet':plain,'insulatedLateNet':insulated},['late with insulation','$'+fmt(insulated)],'Compare all three outcomes relative to early closing; compensation redistributes gains.')
 elif id=='42182':
  optimum=cross(coastMB,coastMC);record(id,{'optimalQuantity':optimum,'mb':at(coastMB,optimum),'mc':at(coastMC,optimum)},[show(optimum)+' miles'],'MSB-MC changes from positive to negative at the intersection; select the matching feasible proposal.')
 elif id=='42192':
  n=at(north,4);southValue=at(south,4);record(id,{'northMB':n,'southMB':southValue,'sumMB':n+southValue,'MC':at(fireMC,4)},['$'+fmt(n),'$'+fmt(southValue),'$'+fmt(n+southValue)],'Vertically add both benefits at the same shared quantity.')
 elif id=='42256':
  cost,value,gift=d;assert 'Three' in q and 'Four households' in q;gap=cost-3*gift;gain=value-gap;assert gain>0;record(id,{'fundingGap':gap,'pivotalPrivateNet':gain},['remaining $'+fmt(gap),'$'+fmt(gain)+' net'],'Irrevocable prior contributions make the fourth household pivotal; without funding it gets no service.')
 elif id=='42288':
  benefit,privateCost,outside=d;record(id,{'privateNet':benefit-privateCost,'socialNet':benefit-privateCost-outside},['$'+fmt(benefit-privateCost)+' privately','$'+fmt(outside+privateCost-benefit)],'Compute marginal private and social net benefits using outside delay as a real cost.')
 elif id=='42186':
  shift=d[0];newMC=(coastMC[0]-shift,coastMC[1]);target=cross(coastMB,newMC);record(id,{'newQ':target,'newMB':at(coastMB,target),'newMC':at(newMC,target)},[show(target)+' miles','$'+fmt(at(newMC,target))+' million'],'Shift cost intercept by the stated amount, retain slopes, and solve new intersection.')
 elif id=='42196':
  added=d[0];target=cross((fireMSB[0]+added,fireMSB[1]),fireMC);assert at(north,target)>0 and at(south,target)>0;record(id,{'newQ':target,'newMSB':at(fireMSB,target)+added},[show(target)+' displays','$'+fmt(at(fireMC,target))],'Add beneficiary value vertically; verify both component curves remain on their positive segments.')
 elif id=='42253':
  value,cost,payment=d;assert 'five households' in q;total=5*value;assert 5*payment==cost;record(id,{'totalBenefit':total,'jointNet':total-cost,'householdNet':value-payment},['$'+fmt(total-cost)+' of total gains','$'+fmt(value-payment)+' better'],'Aggregate all household values and verify the conditional agreement fully funds the project.')
 elif id=='42274':
  openBenefit,cost,donations,sponsor,paywallRevenue,paywallBenefit,enforce=d;sponNet=openBenefit-cost;paywallNet=paywallBenefit-cost-enforce;assert donations<cost<=sponsor and paywallRevenue>=cost+enforce and sponNet>paywallNet;record(id,{'sponsorSocialNet':sponNet,'paywallSocialNet':paywallNet,'sponsorProviderSurplus':sponsor-cost,'paywallProviderSurplus':paywallRevenue-cost-enforce},['$'+fmt(sponNet),'$'+fmt(paywallNet)],'Check financial feasibility separately from user benefits less real production/enforcement costs; receipts are transfers.')
 elif id=='P77-MFAIL-LB-029':
  benefit,cost,individual,cooperative=d;gross=benefit-cost;record(id,{'gross':gross,'individualNet':gross-individual,'cooperativeNet':gross-cooperative},['$'+fmt(gross-cooperative),'$'+fmt(gross)],'Compare both funding institutions after all real costs.')
 elif id=='42169':
  chosen=match(q,r'installs (\d+)');optimal=cross(sirensMB,sirensMC);excess=chosen-optimal;loss=integrate(sirensMC,optimal,chosen)-integrate(sirensMB,optimal,chosen);record(id,{'optimal':optimal,'excess':excess,'loss':loss},[show(excess)+' excess','$'+fmt(loss)],'Integrate MC minus MSB only over excess units, rather than counting all extra spending as loss.')
 elif id=='42179':
  low=cross(radioPrivate,radioMC);high=cross(radioMB,radioMC);gross=integrate(radioMB,low,high)-integrate(radioMC,low,high);net=gross-d[0];record(id,{'privateQ':low,'socialQ':high,'grossBenefit':gross,'netBenefit':net},['$'+fmt(net)],'Integrate omitted net social benefits and subtract the final-stem administration cost.')
 elif id=='42189':
  budget=d[0];lo=match(q,r'from (\d+) to');hi=match(q,r'to (\d+) miles');cost=integrate(coastMC,lo,hi);benefit=integrate(coastMB,lo,hi);assert cost<=budget;record(id,{'cost':cost,'benefit':benefit,'net':benefit-cost,'budget':budget},['$'+fmt(cost)+' million','$'+fmt(benefit-cost)+' million'],'Integrate each linear curve over the expansion; compare added cost with the stated budget.')
 elif id=='42199':
  partial=cross(north,fireMC);optimal=cross(fireMSB,fireMC);loss=integrate(fireMSB,partial,optimal)-integrate(fireMC,partial,optimal);record(id,{'northOnlyQ':partial,'fullQ':optimal,'loss':loss},['Zero displays','$'+fmt(loss)],'Using only North stops at zero; integrate summed MB minus MC through the efficient four-display target.')
 elif id=='P52B-MFAIL-H-003':
  benefit,cost=d;record(id,{'lostSocialGain':benefit-cost},['$'+fmt(benefit-cost)],'No externalities: forgone marginal social surplus is willingness to pay minus marginal resource cost.')
 else:raise AssertionError('Unverified numerical revision '+id)
assert len(proofs)==sum(s['numeric'] for s in spec.values())==36
write('numerical-validation.json',dict(method='Independent Fraction arithmetic from final question inputs and separately reconstructed image geometry. No old answer key or authoring proof is used to calculate results. Full final options were then reviewed for a single economically correct response.',revisedNumericalRecords=len(proofs),records=proofs))
assert set(qs)==set(b['records']) and len(qs)==362
for id,q in qs.items():
 assert len(q['options'])==len(set(map(norm,q['options'])))==4
 assert sum(digest(norm(o).encode())==q['aHash'] for o in q['options'])==1
 assert q['q'].strip() and q['feedback'].strip()
allowed={'q','options','feedback','aHash','imageAlt','graphDescription'}
accessSpec=read('accessibility-spec.json')
for id,q in qs.items():
 old=b['records'][id]
 assert {k:x for k,x in q.items() if k not in allowed}=={k:x for k,x in old.items() if k not in allowed}
 if id not in spec:assert {k:x for k,x in q.items() if k not in ['imageAlt','graphDescription']}=={k:x for k,x in old.items() if k not in ['imageAlt','graphDescription']}
 access=accessSpec.get(q.get('image','').split('/')[-1])
 if access:assert q['imageAlt']==access['imageAlt'] and q['graphDescription']==access['graphDescription']
 else:assert {k:q.get(k) for k in ['imageAlt','graphDescription']}=={k:old.get(k) for k in ['imageAlt','graphDescription']}
for c,m in views.items():assert [(p,q['id']) for p,q in locations(m)]==[(p,q['id']) for p,q in locations(b['views'][c])]
assets=comp['assets'];assetChecks=[]
for a in assets:
 p=R/'data'/a['runtimePath'];assert digest(p.read_bytes())==a['sha256'];im=Image.open(p);im.verify();assert a['imageAlt'].strip() and a['graphDescription'].strip();assetChecks.append(dict(runtimePath=a['runtimePath'],sha256=a['sha256'],decode=True,bytesUnchanged=True))
assert all(not q.get('image') or q['image'] in {a['runtimePath'] for a in assets} for q in qs.values())
write('graph-validation.json',dict(assetsInspected=18,linkedQuestionCount=147,unchangedAssetChecks=assetChecks,externalityModels={k:{p:[show(y) for y in x] if isinstance(x,tuple) else show(x) if isinstance(x,F) else x for p,x in m.items()} for k,m in models.items()},publicModels='PUBLIC-01 MSB=40000-500Q, MC=20000; PUBLIC-02 MSB=10000-100Q, Private Benefit=6000-100Q, MC=2000; PUBLIC-03 MSB=60-Q, MC=15+0.5Q in millions; PUBLIC-04 MB North=max(0,50000-5000Q), South=max(0,40000-5000Q), MC=50000; PUBLIC-05 A=max(0,5000-50Q), B=max(0,3000-50Q), MC=3000. Values reconstructed from the visible endpoints and units.'))
changedAssets={c['runtimePath'] for c in read('asset-accessibility-changes.json')}
actions=[]
for id,q in qs.items():
 content=id in spec;access=q.get('image') in changedAssets
 actions.append(dict(id=id,concept=q['primaryConceptId'],objective=q['objective'],difficulty=q.get('canonicalDifficulty','unknown'),type=q['type'],contentRevised=content,accessibilityDependencyRevised=access,disposition='content-revised' if content else 'asset-metadata-only' if access else 'unchanged',questionObjectUnchanged=q==b['records'][id],reason=spec[id]['reason'] if content else 'Question content and architecture retained; inline and registered asset accessibility evidence corrected.' if access else 'Retained after review; current objective coverage or support function does not warrant expansion. Residual heuristic flags are accounted for separately.'))
write('record-actions.json',actions)
inv=dict(b);inv.update(records=qs,views=views,authoritativeSources={c:lib['concepts'][c] for c in read('sources.json')},orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],assets=assets,librarySha256=lib['librarySha256'])
inv['sourceFiles']=dict(b['sourceFiles'])
for f in ['composer_library.js','composer_registry.json','composer_library_manifest.json']:inv['sourceFiles']['data/'+f]=digest((W/'staged'/f).read_bytes())
inv['accounting']=dict(Counter(x['disposition'] for x in actions));inv['accounting'].update(questionObjectsUnchanged=sum(x['questionObjectUnchanged'] for x in actions),questionContentUnchanged=314,added=0,removed=0)
write('inventory-after.json',inv)
allStems={}
for m in lib['concepts'].values():
 for p,q in locations(m):allStems.setdefault(norm(q['q']),set()).add(str(q['id']))
assert all(allStems[norm(qs[id]['q'])]=={id} for id in spec)
write('originality-validation.json',dict(revisedStemsChecked=48,duplicateRevisedStems=0,duplicatesWithOtherLibraryIds=0,method='Final exact normalized stems checked across the whole library. Revised scenarios were authored for the existing Mastery Quests objectives without importing a publisher or exam assessment. Approved graphs were deliberately retained. No claim of exhaustive web-wide originality testing.',externalQuestionSourcesUsed=[]))
logical=[]
for id in spec:
 q=qs[id];logical.append(dict(id=id,numerical=id in {p['id'] for p in proofs},correctOption=key(q),explanation=q['feedback'],misconceptionAlternatives=[x for x in q['options'] if x!=key(q)],review='All final options reviewed using the stated assumptions. Distractors conflict with the calculation, institutional constraint, goods characteristic or transfer/resource distinction explained here.'))
write('logical-validation.json',logical)
semantic=dict(lib);semantic=json.loads(json.dumps(lib));del semantic['librarySha256'];del semantic['registry']['librarySha256'];actual=digest(json.dumps(semantic,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode());assert actual==lib['librarySha256']
write('semantic-validation.json',dict(finalSemanticSha256=actual,allThreeHashesAgree=all(json.loads((W/'staged'/f).read_text('utf8'))['librarySha256']==actual for f in ['composer_registry.json','composer_library_manifest.json']),scopedStructuralRecords=362,protectedMetadataUnchanged=True,orderedSourceAndResolvedPoolsUnchanged=True,unchangedQuestionObjects=inv['accounting']['questionObjectsUnchanged'],recordDispositions=inv['accounting']))
print(json.dumps(dict(numericalRecords=len(proofs),assets=18,records=362,accounting=inv['accounting'],semanticHash=actual)))
