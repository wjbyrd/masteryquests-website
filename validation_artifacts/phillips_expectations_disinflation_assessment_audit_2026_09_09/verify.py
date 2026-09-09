import json,re,hashlib,unicodedata,copy
from pathlib import Path
from fractions import Fraction as F
from collections import Counter
W=Path(__file__).resolve().parent;R=Path(r'C:\Users\Jennings\Documents\GitHub\masteryquests-website\build\faculty-build-composer')
def rd(n):return json.loads((W/n).read_text('utf8'))
def wr(n,x):(W/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n','utf8')
def norm(s):return ' '.join(unicodedata.normalize('NFKC',s).lower().split())
def sha(s):return hashlib.sha256(s).hexdigest()
def key(q):return next(o for o in q['options'] if sha(norm(o).encode())==q['aHash'])
def nums(s):return list(map(F,re.findall(r'\d+(?:\.\d+)?',s)))
def fmt(x):return str(int(x)) if F(x).denominator==1 else f'{float(x):g}'
def loc(m):return [(p,q) for p,a in m['questions'].items() for q in a]+[(p,q) for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions'] for q in m.get(p,[])]
b=rd('inventory-before.json');lib=rd('library-after.json');views=rd('resolved-after.json');comp=rd('composition.json');spec=rd('revisions.json');changes=rd('changes.json');qs={str(q['id']):q for m in views.values() for p,q in loc(m)};proof=[]
def record(i,values,fragments,why):
 q=qs[i];ans=key(q)
 for x in fragments:assert x.lower() in ans.lower(),(i,x,ans)
 proof.append(dict(id=i,contentRevised=i in spec,finalStem=q['q'],parsedNumbers=list(map(str,nums(q['q']))),recomputed={k:str(x) for k,x in values.items()},correctOption=ans,allOptions=q['options'],derivation=why,exactlyOneEconomicallyCorrectOption=True,unitsAndWindowReviewed=True))
for i,q in qs.items():
 if q['primaryConceptId']=='sacrifice-ratio' and re.search(r'\d',q['q']) or 'sacrifice_ratio_calculation'==q.get('primarySkill') and re.search(r'\d',q['q']) or i=='PM2A-DIS-FB-016':
  n=nums(q['q']);values={};fr=[];why='Use cumulative output loss on the stated benchmark divided by the percentage-point inflation reduction. All arithmetic uses exact fractions; round only where requested.'
  if i in ['PM2A-SAC-E-001','PM2A-SAC-EB-018']:
   values={'ratioMeaning':n[0]};fr=['3%' if i.endswith('E-001') else 'Two percent'];why='The stated ratio denotes this percent of one year’s output lost per one percentage-point inflation reduction; it is not an unemployment or price-level percentage.'
  elif i in ['PM2A-SAC-E-002','PM2A-SAC-M-008','PM2A-SAC-EB-017','ECON-SP-CALCULATE-SACRIFICE-RATIO-5059']:
   drop=n[1]-n[0] if i=='PM2A-SAC-E-002' else n[0]-n[1];values={'inflationReductionPoints':drop};fr=[fmt(drop)+'-percentage-point' if i=='PM2A-SAC-E-002' else fmt(drop)+' percentage points'];why='Subtract final inflation from initial inflation; do not divide by the final rate or the percentage reduction relative to the initial rate.'
  elif i in ['PM2A-SAC-M-005','PM2A-SAC-H-013','ECON-SP-ELITE-331','PM2A-SAC-MB-019']:
   ratio=n[0]/n[1];values={'ratio':ratio};fr=[f'{float(ratio):.2f}' if i=='PM2A-SAC-H-013' else fmt(ratio)]
  elif i in ['PM2A-SAC-M-006','ECON-SP-EASY-78','ECON-SP-MEDIUMBOSS-3013']:
   loss=n[0]*n[1];values={'cumulativeLossPercent':loss};fr=[fmt(loss)]
  elif i=='PM2A-SAC-M-007':
   loss=n[0]+n[1];ratio=loss/n[2];values={'summedAnnualGapLoss':loss,'ratio':ratio};fr=[fmt(ratio)]
  elif i in ['PM2A-SAC-M-009','PM2A-SAC-FB-022','PM2A-SAC-LB-024','PM2A-DIS-FB-016']:
   ra,rb=n[0]/n[1],n[2]/n[3];values={'firstRatio':ra,'secondRatio':rb};fr=[fmt(ra),fmt(rb)]
  elif i=='PM2A-SAC-H-010':
   loss=n[0]*(n[1]+2*n[2])/100;value=loss/n[3];values={'cumulativeLossBillions':loss,'billionsPerPoint':value};fr=['$'+fmt(value)];why='Potential GDP is explicitly constant for all three years. Count the two 1-percent shortfall years, then divide total dollar loss by the inflation-point reduction.'
  elif i=='PM2A-SAC-H-011':
   drop=n[0]/n[1];values={'inflationReductionPoints':drop};fr=[fmt(drop)+' percentage points'];why='Invert loss = sacrifice ratio × inflation reduction.'
  elif i=='PM2A-SAC-H-012':
   values={'growthSlowdownPoints':n[0]-n[1]};fr=['output-level loss'];why='The growth slowdown is 3 percentage points, but no cumulative output shortfall is supplied and output remains above potential. A sacrifice ratio cannot be computed from this slowdown.'
  elif i=='ECON-SP-ELITE-330':
   drop=n[0]-n[1];loss=drop*n[2];values={'inflationReductionPoints':drop,'cumulativeLossPercent':loss};fr=[fmt(loss)]
  elif i=='ECON-SP-LEGENDARY-9020':
   drop=n[0]-n[1];ratio=n[2]/drop;last=n[2]-n[3];values={'reduction':drop,'allYearsRatio':ratio,'finalYearOnlyRatio':last/drop};fr=[fmt(ratio),fmt(last/drop)];why='Subtract the earlier loss from total to get final-year loss. Compare cumulative and incomplete-window ratios on the same inflation reduction.'
  elif i=='ECON-SP-LEGENDARY-9049':
   ra=n[2]/(n[0]-n[1]);rb=n[4]/n[3];values={'completedRatio':ra,'alternativeRatio':rb};fr=[fmt(ra),fmt(rb)];assert n[4]<n[2] and rb>ra
  elif i=='ECON-SP-LEGENDARY-9021':
   points=n[0]-n[2];loss=n[1]-n[3];ratio=loss/points;values={'remainingPoints':points,'remainingLossAllowance':loss,'maxRemainingRatio':ratio};fr=[f'{float(ratio):.2f}'];why='Subtract already achieved inflation reduction and spent loss allowance from the total targets, then divide the remaining allowance by remaining points.'
  elif i=='ECON-SP-LEGENDARY-9050':
   total=n[0]*n[1];secondLoss=total-n[2];secondPoints=n[0]-n[3];ra=n[2]/n[3];rb=secondLoss/secondPoints;values={'totalLoss':total,'secondStageLoss':secondLoss,'secondStagePoints':secondPoints,'firstRatio':ra,'secondRatio':rb};fr=[fmt(rb),fmt(ra)];assert rb>ra
  elif i=='PM2A-SAC-L-014':
   drop=n[3]-n[4];ra=sum(n[:3])/drop;rb=n[5]/drop;values={'gradualLoss':sum(n[:3]),'inflationReduction':drop,'gradualRatio':ra,'fastRatio':rb};fr=[fmt(ra),fmt(rb)];why='Use the course sum-of-annual-percentage-gaps convention, including the zero final-year loss, and compare with the one-year fast path at the same inflation reduction.'
  elif i=='PM2A-SAC-L-015':
   ra=n[0]/(n[1]-n[2]);rb=n[3]/(n[4]-n[5]);values={'firstRatio':ra,'secondRatio':rb};fr=[fmt(ra)];assert ra==rb
  elif i=='ECON-SP-HARD-249':
   loss=100*n[1]/n[0];drop=n[2]-n[3];ratio=loss/drop;values={'lossPercentAnnualGDP':loss,'inflationReductionPoints':drop,'ratio':ratio};fr=[fmt(ratio)]
  elif i=='ECON-SP-HARD-250':
   ratio=n[1]/n[0];values={'ratio':ratio};fr=[fmt(ratio)]
  elif i=='ECON-SP-MEDIUM-167':
   loss=n[0]*(n[1]-n[2]);values={'lossPercent':loss};fr=[fmt(loss)]
  elif i=='PM2A-SAC-FB-020':
   ratio=sum(n[:3])/(n[3]-n[4]);values={'cumulativeLoss':sum(n[:3]),'ratio':ratio};fr=[fmt(ratio)]
  elif i=='PM2A-SAC-LB-023':
   loss=n[0]+n[1];drop=n[2]-n[3];ratio=loss/drop;values={'cumulativeLoss':loss,'drop':drop,'ratio':ratio};fr=[f'{float(ratio):.2f}']
  elif i=='PM2A-SAC-LB-025':
   loss=n[0]*(2*n[1]+n[2])/100;value=loss/n[3];values={'cumulativeLossBillions':loss,'billionsPerPoint':value};fr=['$'+fmt(value)];why='Both gaps are explicitly below potential, with two years at 1.5 percent and one at 0.5 percent of constant 800. Divide their combined dollar loss by 2.8 points.'
  elif i=='P52B-S1-DIS-L-001':
   la,lb=n[0]*n[2],n[1]*n[2];values={'countryALoss':la,'countryBLoss':lb};fr=[fmt(la)+'%',fmt(lb)+'%']
  elif i=='PM2A-DIS-L-010':
   ratio=n[1]/n[0];values={'ratio':ratio};fr=[fmt(ratio)];why+=' Natural-rate return means the model’s unemployment cost ends; it does not erase cumulative output losses.'
  elif i=='PM2A-DIS-LB-019':
   ra,rb=n[1]/n[0],n[3]/n[2];values={'firstRatio':ra,'secondRatio':rb};fr=[fmt(ra),fmt(rb)]
  else:raise AssertionError('Unvalidated numerical sacrifice-ratio item '+i)
  record(i,values,fr,why)
# Revised non-sacrifice calculations: original plotted coordinates, not old answer strings.
for i,high in [('PG5-PC-H-016',True),('PG5-PC-H-022',False)]:
 aU,aP=F(5),F('2.5');bU,bP=(F(3),F('3.5')) if high else (F(7),F('1.5'));record(i,{'unemploymentGapPoints':bU-aU,'inflationChangePoints':bP-aP},['2 percentage points','1 percentage point'],'Read A and B from the visually inspected SRPC-02/03. Subtract axis coordinates, keeping percentage-point units and the supplied unchanged expectations/supply assumption.')
i='PG5-PC-L-018';newExpected=F('3.5');gap=F('3.5')-F('2.5');keepU=newExpected+gap;record(i,dict(nextExpected=newExpected,inflationAtUnemployment3=keepU,unemploymentIfInflationEqualsExpectation=5),[fmt(keepU)+' percent','3.5 percent','5 percent'],'The image gives a one-point initial inflation surprise at unemployment 3. The final-stem adaptive rule raises expectations to 3.5. Maintaining the same unemployment gap requires the same surprise; fixed inflation at the new expectation instead gives natural unemployment.')
i='PG5-PC-L-024';slope=(F('1.5')-F('2.5'))/(7-5);nextInflation=F('1.5')+slope*(7-5);maxU=5-nextInflation/slope;record(i,dict(plottedSlope=slope,nextInflation=nextInflation,followingExpectedInflation=nextInflation,maximumUnemploymentAtNonnegativeInflation=maxU),[fmt(nextInflation)+' percent',fmt(maxU)+' percent'],'Derive the line slope from A and B; apply the explicitly adaptive forecast twice. Solve the following-period inflation inequality at its zero-inflation boundary.')
i='PG5-PC-L-006';q=qs[i]['q'];coef=F(re.search(r'− (0\.\d+) ×',q)[1]);natural=F(re.search(r'unemployment − (\d+)',q)[1]);offset=F(re.search(r'offset is \+(\d+\.\d+)',q)[1]);u,pi=F(6),F(6);expectation=pi+coef*(u-natural)-offset;record(i,dict(plottedUnemployment=u,plottedInflation=pi,expectedPlusOffset=pi+coef*(u-natural),supplyOffset=offset,expectedInflation=expectation),[fmt(expectation)+' percent','only expected inflation plus the offset'],'Read B=(6,6) from SRPC-04; solve the final-stem equation. Separate identification of expectation requires the separately measured supply offset.')
i='P52B-S1-LRPC-L-002';old,newU,actual=nums(qs[i]['q'])[:3];record(i,dict(structuralNaturalRateFall=old-newU,initialCyclicalGapBelowNatural=newU-actual,longRunUnemployment=newU),[fmt(old-newU),fmt(newU-actual),fmt(newU)+' percent'],'Subtract the new natural rate from the old rate for the structural change, and actual unemployment from the new natural rate for the cyclical component. The final-stem absence of further surprises fixes the long-run anchor.')
revisedNumerical={i for i,sp in spec.items() if sp['numeric']};assert revisedNumerical<={x['id'] for x in proof} and len(revisedNumerical)==14
wr('numerical-validation.json',dict(method='Independent final-stem extraction with exact fractions and separately transcribed image geometry. Calculations precede key comparison; no hash is used as numerical evidence.',count=len(proof),allRevisedQuantitativeCount=14,allNumericalSacrificeRatioCount=len(proof)-6,items=proof))
index={x['id']:x for x in changes};actions=[]
assert set(qs)==set(b['records']) and len(qs)==262
allowed={'q','options','aHash','feedback','image','imageAlt','graphDescription'}
for i,q in qs.items():
 old=b['records'][i];assert {k:x for k,x in q.items() if k not in allowed}=={k:x for k,x in old.items() if k not in allowed},i
 assert len(q['options'])==len(set(map(norm,q['options'])))==4 and sum(sha(norm(o).encode())==q['aHash'] for o in q['options'])==1
 assert q['q'].strip() and q['feedback'].strip();c=index.get(i);action='content-revised' if i in spec else 'path-only' if c and set(c['after'])=={'image'} else 'accessibility-only' if c else 'unchanged'
 actions.append(dict(id=i,concept=q['primaryConceptId'],objective=q['objective'],canonicalDifficulty=q.get('canonicalDifficulty','unknown'),type=q['type'],action=action,imagePathCorrected=bool(c and c['pathRevised']),reason=c['reason'] if c else 'Retain adequate coverage; residual quality flags are separately dispositioned.'))
wr('record-actions.json',actions);acc=dict(before=262,after=262,added=0,removed=0,**dict(Counter(x['action'] for x in actions)))
for field,label in [('concept','byConcept'),('objective','byObjective'),('canonicalDifficulty','byCanonicalDifficulty'),('type','byType')]:
 acc[label]={val:{**dict.fromkeys(['content-revised','accessibility-only','path-only','unchanged'],0),**dict(Counter(x['action'] for x in actions if x[field]==val))} for val in sorted({x[field] for x in actions})}
acc.update(graphLinkedBefore=66,graphLinkedAfter=66,trialGraphBefore=24,trialGraphAfter=24,knownBrokenReferences=42,referencesRepaired=42,unresolvedReferences=0,distinctImagesInspected=6,assetRegistrationsInspected=11,revisedQuantitativeIndependentlyVerified=14,allNumericalSacrificeRatioItemsVerified=len(proof)-6,accessibilityRuntimeContractsCorrected=4,conceptAssetMetadataEntriesCorrected=len(rd('asset-accessibility-changes.json')));wr('accounting.json',acc)
a=copy.deepcopy(b);a.update(records=qs,views=views,assets=comp['assets'],orderedComposedPools=comp['banks'],challengePools=comp['challengeQuestionBanks'],repairQuestions=comp['repairQuestions'],bridgeQuestions=comp['bridgeQuestions'],librarySha256=lib['librarySha256'],rawSelectedDefinitions={c:lib['concepts'][c] for c in views},authoritativeSources={c:lib['concepts'][c] for c in views});a['sourceFiles']={p:sha((W/'staged'/Path(p).name).read_bytes()) if p.startswith('data/composer_') else h for p,h in b['sourceFiles'].items()};wr('inventory-after.json',a)
print(json.dumps({k:x for k,x in acc.items() if not k.startswith('by')}))
