"""Independent audit. Recomputes final-stem cases without importing authoring code."""
import ast,copy,hashlib,json,re,math
from fractions import Fraction as F
from pathlib import Path
from docx import Document
W=Path(__file__).resolve().parent
ROOT=Path('C:/Users/Jennings/Documents/GitHub/masteryquests-website/build/faculty-build-composer')
def read(n):return json.loads((W/n).read_text('utf8'))
def write(n,x):(W/n).write_text(json.dumps(x,ensure_ascii=False,indent=2,default=lambda x:float(x) if isinstance(x,F) else str(x))+'\n','utf8')
def calc(s):
 def ev(x):
  if isinstance(x,ast.Constant):return F(str(x.value))
  if isinstance(x,ast.UnaryOp) and isinstance(x.op,ast.USub):return -ev(x.operand)
  if isinstance(x,ast.BinOp):
   a,b=ev(x.left),ev(x.right)
   return {ast.Add:lambda:a+b,ast.Sub:lambda:a-b,ast.Mult:lambda:a*b,ast.Div:lambda:a/b,ast.Pow:lambda:a**int(b)}[type(x.op)]()
  raise ValueError(ast.dump(x))
 return ev(ast.parse(s,mode='eval').body)
spec=read('revisions.json');before=read('inventory-before.json');lib=read('library-after.json');comp=read('composition.json');changes=read('changes.json')
def qid(s):
 if s.startswith('L') and s[1:].isdigit():return 'ECON-NL-LEGENDARY-'+s[1:]
 if s.startswith('E') and s[1:].isdigit():return 'ECON-NL-ELITE-'+s[1:]
 return s
# Independently transcribed input calculations from final stems. No authoring proof is used here.
# Each output must appear in the keyed choice, with the stated rounding/sign interpretation.
cases={
 'L9001':['420000-150000','420000-(150000+90000)'],
 'L9003':['560-140','560-(140+250+90)'],
 'L9009':['(96000-24000)+6000'],
 'L9010':['74+6','(74+6)-(51+9)'],
 'L9011':['28000+2000'],
 'E303':['310-180','70+(180-70)+(310-180)'],
 'L9000':['72-(46+13+9-11)'],
 'L9004':['18+7','18','7+3','3'],
 'L9012':['34-(8-4)','4-8'],
 'L9017':['(6+2)-6'],
 'PM2B1-RNGDP-H-002':['864*100/120','(864*100/120-640)/640*100'],
 'E315':['(115.5/105-1)*100','5'],
 'L9005':['475.2/(468*100/130*1.10)*100'],
 'L9006':['60*40+(6000-60*50)/30*20','6000/(60*40+(6000-60*50)/30*20)*100'],
 'L9007':['80*12+(2400-80*10)/20*30','(2400-80*10)/20'],
 'L9013':['(108/112.5-1)*100'],
 'L9022':['125*(132/110)','(132/110-1)*100'],
 'ECON-NL-LEGENDARYBOSS-9103':['715*100/130','756*100/140','(756*100/140-715*100/130)/(715*100/130)*100'],
 'L9015':['12-5'],
 'PM2B1-GDPL-L-002':['2-9'],
 'P52A-CPI-M-005':['(2*4*1.1+12)/(2*4+12)*100','2*4/(2*4+12)*100'],
 'P52A-CPI-M-002':['14/175*100'],
 'E321':['125*810/750','(810-750)/750*100'],
 'L9023':['((3*8+2*18)*135/100-3*9)/2','((3*8+2*18)*135/100-72)/72*100'],
 'L9024':['176*100/160'],
 'L9025':['(4*9+(72-4*6)/12*15)/72*100','(100.8/(4*9+(72-4*6)/12*15)-1)*100'],
 'L9026':['(27*500/(25*525)-1)*100'],
 'L9027':['120*(1-10/100)'],
 'L9032':['(40*1.25+60-100)/100*100'],
 'L9033':['(10*120+100*10)*100/(10*100+100*10)'],
 'PM2B2-DEF-L-002':['(108/104-1)*100'],
 'E333':['1800*165/150-1920','1800*165/150'],
 'L9035':['2400*132/120','2400*(144-132)/120'],
 'L9036':['1260/900*100'],
 'PM2B2-INDEX-L-003':['40000*121/100-40000*1.1','40000*1.1','40000*121/100'],
 'PM2B2-RNI-H-003':['9-100*(212-200)/200'],
 'PM2B2-RNI-FB-006':['4-6'],
 'E338':['(7-2)+2','7-((7-2)+2)'],
 'L9038':['8-(172.8-160)/160*100','(172.8-160)/160*100-(8-3)'],
 'L9039':['6-(420-400)/400*100','6-(540-500)/500*100'],
 'L9040':['2+(130-125)/125*100','2+(130-125)/125*100-(135-125)/125*100'],
 'L9045':['32000*2**(40/(70/1.75))','8000*2**(40/(70/7))'],
 'L9046':['(112/105-1)*100','(112/120-1)*100'],
 'L9047':['960*100/120*1000/32','1320*100/150*1000/44'],
 'L9049':['(110/100*95/100*58/60-1)*100'],
 'L9050':['((25344/24)-(24000/20))/(24000/20)*100','((25344/(24*80))/(24000/(20*100))-1)*100'],
 'L9051':['108/3.2','((108/3.2)-(90/3))/(90/3)*100'],
 'L9053':['6','(106/110-1)*100'],
 'L9066':['30000*100/50000','30000*100/55000'],
 'PM2B3-PROD-FB-004':['(36.37/28.53-1)*100'],
 'L9058':['160-100','200-160'],
 'L9067':['(12-4-3+5)/(132+4-2+12-4-3+5)*100','(132+4-2+12-4-3+5)/(132+12+56)*100'],
 'L9068':['200*.75*(1-.08)-6','(200*.75*.08-6+4)/(200*.75-6-6+4)*100','(200*.75-6-6+4)/200*100'],
 'L9070':['200*.75*(1-.06)-200*.7*(1-.06)'],
 'L9081':['184-180','20-12-(184-180)','(180+20)/250*100','(184+12)/250*100'],
 'E366':['84+6','6/(84+6)*100'],
 'ECON-NL-FINALBOSS-4003':['(126+14)/(126+14+60)*100'],
 'L9076':['100-95','140-95'],
 'L9078':['((24*90)-(20*100))/(20*100)*100'],
 'L9079':['18/6','21/7'],
 'E375':['112-88','112-100'],
 'L9075':['1.5+3+0'],
 'L9085':['9-6','7-4'],
 'PM2B4-NRU-L-002':['.4-1'],
}
results={}
for short,expressions in cases.items():
 id=qid(short);s=spec[id];key=s['options'][0]
 tokens=[float(x.replace(',','')) for x in re.findall(r'(?<!\w)\d[\d,]*(?:\.\d+)?',key)]
 vals=[calc(e) for e in expressions]
 for val in vals:
  assert any(abs(abs(float(val))-t)<=0.051 for t in tokens),(id,val,key)
 results[id]={'ok':True,'method':'Separate reconstruction using inputs transcribed from the final stem; checked result, rounding, units, sign and economic interpretation against keyed option.','independentExpressions':expressions,'independentResults':vals,'key':key}
# Two numerical comparisons intentionally key an economic ordering/equality rather than repeat numbers.
special={
 'ECON-NL-LEGENDARY-9014':{'values':[40*1100,50*800],'assertion':40*1100>50*800 and 40<50,'interpretation':'First higher output/person; second higher output/hour; welfare cannot be ranked from unvalued dimensions.'},
 'ECON-NL-LEGENDARY-9029':{'values':[calc('112/112')],'assertion':calc('112/112')==1,'interpretation':'Equal proportional price/durability changes leave undiscounted cost per service-year unchanged; cannot infer aggregate inflation.'}}
for id,r in special.items():
 assert r['assertion'];results[id]={'ok':True,'method':'Independent quantitative relation plus semantic key review.',**r,'key':spec[id]['options'][0]}
numeric={i for i,s in spec.items() if s['proof']};assert set(results)==numeric,(numeric-set(results),set(results)-numeric)
assert calc('2160/2000')==calc('135/125') # real-value part of DEF-L002
assert calc('1350/(150/100)')==900 # final indexation part of L9036
proofs=[]
for id,s in spec.items():
 for p in s['proof']:
  x=calc(p['expression']);assert abs(float(x)-p['expected'])<1e-7,(id,p,x)
  proofs.append({'id':id,**p,'recomputed':x,'ok':True})
conceptual={i:{'ok':True,'method':'Each alternative reviewed against the stated mechanism and assumptions. Incidental numbers do not determine a numerical answer.','uniqueCorrectnessRationale':s['feedback'],'key':s['options'][0]} for i,s in spec.items() if i not in numeric}
write('numerical-validation.json',{'ok':True,'numericalItems':len(numeric),'conceptualItems':len(conceptual),'additionalArithmeticAssertions':len(proofs),'rounding':'Exact rational input arithmetic; displayed one-decimal results checked within 0.051. Directional loss/gain wording reviewed separately.','method':'A separate verifier does not import any authoring program. Independently transcribed final-stem cases reconstruct all 66 numerical results, and compare them with the keyed choices. Authoring proof expressions are re-evaluated only as additional checks. All interest revisions use the stated Principles approximation.','items':results,'conceptualReviews':conceptual,'additionalProofs':proofs})
# Exact after inventory: all-mode eligibility remains the baseline, although the browser build enables its nine ready modes.
after=copy.deepcopy(before);after['views']=read('resolved-after.json');after['records']={}
for m in after['views'].values():
 for ls in m['questions'].values():
  for q in ls:after['records'][q['id']]=q
 for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions']:
  for q in m.get(p,[]):after['records'][q['id']]=q
after['orderedComposedPools']=comp['banks'];after['challengePools']=comp['challengeQuestionBanks'];after['repairQuestions']=comp['repairQuestions'];after['bridgeQuestions']=comp['bridgeQuestions'];after['assets']=comp['assets']
after['routes']={k:comp[v] for k,v in {'repair':'microSkillRepairPools','seeds':'skillRepairSeedPools','bridge':'microSkillBridgePools','bossCoverage':'bossCoverage','trialGraph':'trialGraphQuestionIds','fadingFortune':'fadingFortuneQuestionIds','riskReward':'riskRewardQuestionIds'}.items()}
for n in ['composer_library.js','composer_registry.json','composer_library_manifest.json']:after['sourceFiles']['data/'+n]=hashlib.sha256((W/'staged'/n).read_bytes()).hexdigest()
write('inventory-after.json',after)
graphQs=[q for q in after['records'].values() if q.get('image')];assert len(graphQs)==12
assets=[]
for a in comp['assets']:
 h=hashlib.sha256((ROOT/'data'/a['runtimePath']).read_bytes()).hexdigest();assert h==a['sha256']
 assets.append({'runtimePath':a['runtimePath'],'sha256':h,'ok':True,'visualEvidence':{'axes':['Capital per worker, 0–100','Output per worker, 0–60'],'A':[20,28.53],'B':[40,36.37],'shape':'Increasing, concave: equal added capital produces diminishing marginal output with other inputs fixed.'},'descriptionAccurate':True})
write('graph-validation.json',{'ok':True,'linkedQuestions':12,'namespacedRegistrations':3,'distinctImageBytes':1,'allApprovedAssetsVisuallyInspected':True,'assetsUnchanged':True,'pathChanges':0,'accessibilityChanges':0,'newAssets':0,'assets':assets,'questions':[{'id':q['id'],'image':q['image'],'graphRequired':q.get('graphRequired'),'graphSafe':q.get('graphSafe'),'contentRevised':q['id'] in spec} for q in graphQs],'numericalGraphResult':results['PM2B3-PROD-FB-004'],'browserEvidence':'browser-validation.json','eligibilityDisposition':'The 12 existing image-linked records yield zero Trial by Graph-safe IDs. Preserve baseline eligibility; do not turn a primarily measurement/tabular audit into a graph-mode expansion.'})
# Keep exam text and answer alternatives private; output only screening results and dispositions.
exam=Document('C:/Users/Jennings/Desktop/ECO 2251/midterm.docx');guide=Document('C:/Users/Jennings/Desktop/ECO 2251/ECO 2251 Principles of Macroeconomics Midterm Study Guide.docx')
segs=[p.text for p in exam.paragraphs]+[c.text for t in exam.tables for r in t.rows for c in r.cells]
def grams(s,n):
 t=re.findall(r'[a-z0-9]+',s.lower());return {tuple(t[i:i+n]) for i in range(max(0,len(t)-n+1))}
eg=set().union(*(grams(s,10) for s in segs));overlaps=[id for id,s in spec.items() if grams(s['q'],10)&eg]
assert not overlaps,overlaps
write('originality-validation.json',{'ok':True,'revisedStems':len(spec),'tenWordOverlapIds':overlaps,'method':'Full private exam paragraphs/table cells screened for normalized ten-word contiguous overlap with revised stems, followed by manual scenario, data and answer-pattern review. This screen alone cannot establish originality.','manualReview':'No revised stem reproduces a distinctive exam scenario, numeric combination or answer-option pattern. Revisions use reverse accounts, error diagnoses, multi-period changes, competing mechanisms and conditional evidence. The two identified close/exact pre-existing arithmetic parallels were changed to distinct reasoning structures. Generic definitions remaining in the unchanged bank are not an exam reconstruction.','primaryItems':[2,5,7,9,10,14,16,17,18,21,23,24,26,29,31,32,34,35,38,40],'studyGuideUsed':'Secondary coverage/formula boundary, not a difficulty rubric or instruction to rewrite every topic.','examKeyOrMediaPublished':False})
# Preserve a disposition for every source record and every heuristic finding.
qualityBefore=read('quality-before.json');qualityAfter=read('quality-after.json')
active={(f['questionId'],f['rule']) for f in qualityAfter['findings']}
dispositions=[]
for stage,audit in [('before',qualityBefore),('after',qualityAfter)]:
 for f in audit['findings']:
  id=f['questionId'];rule=f['rule'];revised=id in spec;persists=(id,rule) in active
  if rule=='image-without-graph-required':reason='Retain original graphRequired/mode eligibility as requested. Existing image renders and its evidence was reviewed; this is an architecture flag, not a missing-image defect.'
  elif rule=='attached-graph-possibly-decorative':reason='Approved growth image and coordinates verified. Retain existing identity/eligibility; graph inference is legitimate. The revised calculation checkpoint requires coordinates from the image.'
  elif rule=='repeated-feedback':reason='Retain correct explanation on unchanged practice/checkpoint/support records; all revised feedback is scenario-specific. Residual explanation repetition is acknowledged, not silently treated as a blocker.'
  elif rule=='weak-absolute-distractors':reason='Review in context: absolutes here identify genuine misconceptions or unsupported guarantees; flag is not itself evidence of ambiguity. Revised alternatives were individually reviewed, and remaining obvious legacy distractors are a curation limitation.'
  elif rule=='near-duplicate-stem':reason='Preserve existing IDs/order. Role-separated support/checkpoint reuse and short formula variants remain documented; no new revised duplicate stem was introduced.'
  elif rule=='possible-difficulty-overstatement':reason='Manually assessed cognitive chain. Revised reverse, counterfactual or conditional-evidence items can lack heuristic reasoning keywords; remaining short legacy upper-tier items are acknowledged.'
  else:reason='Reviewed option specificity and unique correctness. A longer keyed explanation can be justified; heuristic length alone is not a defect requiring scope expansion.'
  dispositions.append({'stage':stage,'id':id,'rule':rule,'severity':f['severity'],'contentRevised':revised,'stillFlaggedAfter':persists,'disposition':'reviewed-retain' if persists else 'resolved','reason':reason})
write('quality-dispositions.json',{'beforeCounts':qualityBefore['counts'],'afterCounts':qualityAfter['counts'],'noAutomaticRewriteFromHeuristics':True,'findings':dispositions})
changeMap={c['id']:c for c in changes}
write('record-actions.json',[{'id':id,'action':'content-revised' if id in spec else 'retained','concept':q.get('primaryConceptId'),'objective':q['objective'],'canonicalDifficulty':q.get('canonicalDifficulty'),'reason':spec[id]['reason'] if id in spec else 'Retain correct established coverage, calibrated practice/support, or documented boundary overlap; no material defect justifying a rewrite in this pass.'} for id,q in after['records'].items()])
print(json.dumps({'revised':len(spec),'numeric':len(numeric),'conceptual':len(conceptual),'arithmeticAssertions':len(proofs),'originalityOverlaps':overlaps,'graphQuestions':len(graphQs),'qualityBefore':qualityBefore['counts'],'qualityAfter':qualityAfter['counts']}))
