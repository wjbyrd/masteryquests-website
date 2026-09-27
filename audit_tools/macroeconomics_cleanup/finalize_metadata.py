from checkpoint_support import *
import re
library=json.loads((WORK/'baseline_library.json').read_text(encoding='utf8'))

# Preserve the explicitly historical comparison outside the instructor's single
# current-M1 adjudication; add checkpoint evidence under that same convention.
task('LG-Q-2002','Use U.S. monetary-aggregate definitions in effect before May2020. Currency is$900, checking$1,100, savings$1,500 and small time deposits$500. A household moves$400 from checking to savings. Which final totals and interpretation are correct?',
 ['$1,600 M1 and$4,000 M2; the transfer reduces narrow money while leaving broad money unchanged','$2,000 M1 and$4,000 M2; changing checking to savings cannot affect either historical aggregate','$3,500 M1 and$4,000 M2; savings were already included in the stated historical M1','$1,600 M1 and$3,600 M2; the transfer removes the funds from both aggregates'],
 'Under the stated pre-May2020 convention, initial M1=900+1100=2000 and M2=2000+1500+500=4000. Moving400 from checking to savings lowers M1 to1600 while remaining within M2. This historical convention differs from the current definition in the instructor-selected item.','analysis','Applies the current M1 definition to an explicitly historical monetary-aggregate comparison.',proof(('900+1100-400',1600),('900+1100+1500+500',4000)))

# Remove decorative quantities that contributed no evidence to qualitative
# tasks. All substantive quantities in computations and constraints remain.
decorative=[
 (r' in an economy with \d+ workers',''),(r' in an economy of \d+ workers',''),
 (r' in an economy of \d+(?= repeatedly)',''),
 (r' in an economy with annual output \$\d+',''),
 (r' in an economy with output \$\d+',''),
 (r', from an initial real-output level \$\d+',''),
 (r' in an economy with price index \d+',''),
 (r' of annual output \$\d+',' of annual output'),
 (r'A recession idles \d+ workers','A recession idles workers'),
 (r' and \d+ people seek work at the higher wage',' and more people seek work at the higher wage'),
 (r'A government finances \$\d+ of spending through money creation\.', 'A government finances spending through money creation.'),
 ]
for id in TARGETS['F']:
    if 'q' not in PATCHES.get(id,{}):continue
    stem=q(id)['q']
    for pattern,replacement in decorative:stem=re.sub(pattern,replacement,stem)
    if stem!=q(id)['q']:patch(id,'Removed quantities that played no role in the required reasoning.',q=stem)

# Every feedback-only finding uses its own visible inputs. Rewritten items
# already carry their final-task explanation and are not overwritten here.
feedback={
 'PM2B1-GDPC-H-003':('Domestic buses contribute3 million to G. Transfers themselves are excluded. Recipients’ imported services add1.5 million to C and subtract1.5 million through imports, leaving zero domestic contribution. Total domestic GDP rises3 million.',('3+1.5-1.5',3)),
 'PM2B1-GDPC-FB-006':('Imported equipment adds5 million to G and subtracts5 million through imports. Domestic road repairs add4 million to G. The3 million transfer itself is excluded; recipients’2 million domestic service purchases enter C. Domestic GDP rises4+2=6 million.',('5-5+4+2',6)),
 'PM2B1-RNGDP-FB-005':('First real GDP=840/(120/100)=700 billion. Next real GDP=990/(132/100)=750 billion. Real output therefore rises50 billion, or about7.1%.',('840/1.2',700),('990/1.32',750)),
 'PM2B1-RNGDP-H-001':('Exact real growth=(1.18/1.10−1)×100≈7.2727%, which rounds to7.3%. Subtracting18−10 gives the approximate8%, not the exact ratio requested.',('(1.18/1.1-1)*100',7.272727273)),
 'PM2B1-RNGDP-M-001':('Nominal GDP values current20 units at the current$9 price:20×9=$180. Real GDP values the same20 units at the base-year$6 price:20×6=$120.',('20*9',180),('20*6',120)),
 'PM2B2-INDEX-H-001':('Real wage growth=(1.08/1.05−1)×100≈2.8571%, or2.9%. Subtracting rates gives only the3% approximation.',('(1.08/1.05-1)*100',2.857142857)),
 'PM2B2-INDEX-L-001':('Real scholarship growth=(1.15/1.10−1)×100≈4.5455%, or4.5%. The nominal15% gain is partly offset by the10% price increase.',('(1.15/1.1-1)*100',4.545454545)),
 'PM2B4-LMI-H-001':('More generous benefits can lengthen search by reducing urgency, putting upward pressure on frictional unemployment. Faster and better referrals shorten matching time, putting downward pressure on it. Without their relative magnitudes the net effect is ambiguous.',),
 'PM2B4-NRU-H-005':('Retraining reduces skill mismatch and can lower structural unemployment. Longer voluntary search can raise frictional unemployment. Because the natural rate includes both components, the net effect is ambiguous without their sizes.',),
 'PM2C3-MPTX-R-001':('In the stated standard short-run money-market model, increased money supply lowers the equilibrium interest rate. Cheaper finance raises interest-sensitive spending, including investment, and that extra spending shifts aggregate demand right. Government purchases and natural unemployment do not change mechanically.',),
 'PM2A-DIS-L-010':('The sacrifice ratio is6/3=2 percent of annual output per percentage-point inflation reduction. The given return to natural unemployment means the unemployment cost is temporary in this model; disinflation alone need not make the price level fall.',('6/3',2)),
 'PM2A-SAC-H-011':('Sacrifice ratio=loss/inflation reduction. Rearranging gives reduction=9/3=3 percentage points; multiplying would reverse the requested operation.',('9/3',3)),
 'PM2A-SAC-H-013':('The ratio is6.5/3=2.1666…; to two decimals it is2.17 percent of one year’s output per percentage-point inflation reduction.',('6.5/3',2.166666667)),
 'PM2A-SAC-L-014':('Both paths cut inflation6.5−4.5=2 points. Gradual cumulative loss is2+1+0=3%, giving3/2=1.5. Fast loss is4%, giving4/2=2. The gradual path has the lower ratio in the supplied data.',('(2+1+0)/(6.5-4.5)',1.5),('4/(6.5-4.5)',2)),
 'PM2A-SAC-L-015':('A’s inflation reduction is9−5=4 points, so its ratio is8/4=2. B’s reduction is5−2=3 points, so6/3=2. Different total losses and disinflation sizes can give equal cost per inflation point.',('8/(9-5)',2),('6/(5-2)',2)),
 'PM2A-SAC-M-005':('Ratio=12/3=4 percent of one year’s output per percentage-point inflation reduction.',('12/3',4)),
 'PM2A-SAC-M-006':('Cumulative output loss=ratio×inflation reduction=3×2.5=7.5% of one year’s output. The question asks for total loss, not the ratio.',('3*2.5',7.5)),
 'PM2A-SAC-M-007':('Cumulative output loss is1.5+2.5=4% of one year’s output. Divide by the2-point inflation decline:4/2=2 percent of annual output per inflation point.',('(1.5+2.5)/2',2)),
}
for id,data in feedback.items():
    if 'q' in PATCHES.get(id,{}):continue
    patch(id,'Item-specific feedback uses final student-visible inputs and requested outputs.',feedback=data[0])
    if len(data)>1:PROOFS[id]=proof(*data[1:])

# Use already registered, byte-identical concept-qualified assets. Descriptions
# report the visible diagram, not a policy answer or the keyed choice.
for id in TARGETS['J']:
    v=q(id);filename=Path(v['image']).name
    asset=next(a for a in library['assetInventory'] if a['filename']==filename and a['conceptId']==v['primaryConceptId'])
    assert asset.get('imageAlt') and asset.get('graphDescription'),id
    patch(id,'Exact registered asset path and existing visually verified description; image bytes preserved.',image=asset['runtimePath'],imageAlt=asset['imageAlt'],graphDescription=asset['graphDescription'],graphRequired=True)

# Role and checkpoint stage stay in their dedicated fields. Only actual task
# operation changes here; sourceType/questionType and provenance stay frozen.
typeids=set(next(f for f in AUDIT if f['findingID']=='MAA-0124')['affectedQuestionIDs']+next(f for f in AUDIT if f['findingID']=='MAA-0125')['affectedQuestionIDs'])
type_decisions={}
patch('ECON-NL-ELITE-331','MAA-0003: actual two-index application; preserve content, key, feedback and difficulty.',type='application')
for id in sorted(typeids):
    v=q(id);old=RECORDS[id]['q']['type'];stem=v['q'].lower();t=v['type'].lower()
    if 'q' in PATCHES.get(id,{}):operation=v['type']
    elif re.search(r'calculat|formula|real.wage|balance.sheet|reverse.multiplier',t):operation='calculation'
    elif re.search(r'misconception|diagnos',t):operation='diagnostic'
    elif 'classification' in t:operation='classification'
    elif re.search(r'graph.*(reading|identification)',t):operation='interpretation'
    elif re.search(r'graph|synthesis|fiscal|policy|chain|leakage|fisher|measurement|leverage',t):operation='analysis'
    elif re.search(r'\d',stem) and re.search(r'what|how much|how many|calculate|equals|rate|ratio|index|percent',stem):operation='calculation'
    elif re.search(r'what is (?:the |a )?(?:definition|meaning)|defined as|means:|stands for|what does .* mean|which formula',stem):operation='definition'
    elif re.search(r'classif|which type|which category|counted as|included in|excluded from|which function',stem):operation='classification'
    elif re.search(r'refer to|graph|curve|axes|point',stem):operation='interpretation'
    elif re.search(r'if |suppose|when |a bank|a worker|a country|a household|the economy',stem):operation='application'
    else:operation='interpretation'
    patch(id,type=operation)
    type_decisions[id]={'old':old,'new':operation,'finalTask':v['q']}
(INPUTS/'type_decisions.json').write_text(json.dumps(type_decisions,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

# Concrete wrong answers provide item-specific misconception evidence. Use a
# complete substantive distractor where possible instead of an isolated number.
errorids=set(next(f for f in AUDIT if f['findingID']=='MAA-0126')['affectedQuestionIDs'])
errorids.update(i for i,p in PATCHES.items() if 'q' in p and i in TARGETS['F'])
misconceptions={}
for id in sorted(errorids):
    v=q(id);correct=PATCHES.get(id,{}).get('$correct',v['options'][RECORDS[id]['answer']])
    wrong=[o for o in v['options'] if o!=correct]
    chosen=next((o for o in wrong if len(o.split())>=7),wrong[0])
    value='Incorrectly concludes “'+chosen.rstrip('.')+'” in this '+v.get('primaryConceptId','').replace('-',' ')+' task.'
    # A quoted misconception is explicitly marked incorrect, so feedback and
    # metadata consumers cannot mistake it for an endorsed economic statement.
    patch(id,commonError=value)
    misconceptions[id]={'incorrectChoice':chosen,'correctChoice':correct,'finalCommonError':value}
(INPUTS/'misconception_decisions.json').write_text(json.dumps(misconceptions,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

special={
 'ECON-SP-EASYBOSS-2002':'money-functions-and-measures',
 'ECON-SP-EASYBOSS-2005':'central-bank-and-federal-reserve',
 'ECON-SP-EASYBOSS-2008':'deposit-creation-and-money-multiplier',
 'ECON-SP-EASYBOSS-2011':'deposit-creation-and-money-multiplier',
 'ECON-SP-EASYBOSS-2014':'monetary-control-limits'}
routes=[]
for id,cid in special.items():
    patch(id,primaryConceptId=cid,requiredConceptIds=[cid],challengeFocusConceptIds=[cid],remediationConceptId=cid,challengePathway='specialist-checkpoint')
    routes.append({'id':id,'from':'integrated-macroeconomic-analysis','to':cid,'kind':'specialist-checkpoint','findingIDs':['MAA-0113','MAA-0114']})
reference=RECORDS['43112']['q']
patch('ECON-NL-INVENTORY-INVESTMENT-5011',primaryConceptId='budget-accounting-and-public-saving',primarySkill='distinguish_purchase_transfer',repairSkill='distinguish_purchase_transfer',objective=reference['objective'],type='classification')
routes.append({'id':'ECON-NL-INVENTORY-INVESTMENT-5011','from':'gdp-components','to':'budget-accounting-and-public-saving','kind':'repair','routeKey':'distinguish_purchase_transfer','findingIDs':['MAA-0008']})
patch('ECON-NL-IMPORTS-EXPORTS-NX-6004',primarySkill='imports_exports_nx',repairSkill='imports_exports_nx')
(INPUTS/'routing_decisions.json').write_text(json.dumps(routes,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
save()
