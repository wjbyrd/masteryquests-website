import json, hashlib, os, shutil, math, re
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
ASSET_DIR=ROOT/'data/question-assets/elasticity'
ASSET_DIR.mkdir(parents=True,exist_ok=True)
SRC_FILES={
 'ELAS-01':'/mnt/data/ELAS-01(2).png',
 'ELAS-02':'/mnt/data/ELAS-02(2).png',
 'ELAS-03':'/mnt/data/ELAS-03(2).png',
 'ELAS-05':'/mnt/data/ELAS-05(2).png',
}
PHASE='phase6.2b-elasticity-graph-expansion-v2'
GEN='2026-08-09T14:05:00.000Z'

def sha_text(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()
def sha_file(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1<<20),b''): h.update(b)
 return h.hexdigest()

def load_library():
 s=LIB.read_text(encoding='utf-8')
 return json.loads(s.split('=',1)[1].strip().rstrip(';'))

def save_library(o):
 LIB.write_text('window.MQ_COMPOSER_LIBRARY = '+json.dumps(o,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')

lib=load_library(); concept=lib['concepts']['elasticity']

# Replace legacy elasticity graph assets with the four approved canonical graphs.
old_paths=list(concept.get('assets',[]))
for rp in old_paths:
 p=ROOT/'data'/rp
 if p.exists(): p.unlink()
lib['assetInventory']=[a for a in lib['assetInventory'] if a.get('conceptId')!='elasticity']
concept['assets']=[]; concept['assetMetadata']=[]; concept['assetPaths']=[]
new_assets=[]
for name,src in SRC_FILES.items():
 srcp=Path(src)
 if not srcp.exists(): raise FileNotFoundError(src)
 out=ASSET_DIR/f'{name}.webp'
 with Image.open(srcp) as im:
  im=im.convert('RGB')
  im.save(out,'WEBP',quality=94,method=6)
 meta={
   'conceptId':'elasticity','filename':out.name,
   'sourceAssetPath':f'question-assets/elasticity/{out.name}',
   'sourceUrl':f'data/question-assets/elasticity/{out.name}',
   'runtimePath':f'question-assets/elasticity/{out.name}',
   'sha256':sha_file(out),'sizeBytes':out.stat().st_size
 }
 new_assets.append(meta)
concept['assetMetadata']=new_assets
concept['assets']=[a['runtimePath'] for a in new_assets]
concept['assetPaths']=[a['runtimePath'] for a in new_assets]
lib['assetInventory'].extend(new_assets)

# Remap the eight surviving legacy graph questions to the new approved assets and fix point/curve wording.
remap={
 'P62B-ELAS-E-006':('ELAS-03.webp',None,None),
 'P62B-ELAS-E-007':('ELAS-03.webp',None,None),
 'P62B-ELAS-E-020':('ELAS-05.webp',
   'In the displayed supply graph, the long-run supply curve is flatter than the short-run supply curve. Why is supply generally more elastic over the longer time horizon?',
   'A longer time horizon gives producers more time to expand capacity, change inputs, and otherwise adjust production.'),
 'P62B-ELAS-E-028':('ELAS-02.webp',
   'In the displayed graph, D2 is steeper than D1. Why can slope alone not serve as the elasticity measure?',
   'Elasticity compares percentage changes, while slope uses changes in the original price and quantity units.'),
 'P62B-ELAS-E-029':('ELAS-01.webp',
   'On the displayed linear demand curve, as you move downward from point C through B toward point A, demand generally becomes:',
   'The slope stays constant, but the price-to-quantity ratio falls as movement continues down the linear demand curve.'),
 'P62B-ELAS-M-008':('ELAS-01.webp',
   'On the displayed linear demand curve, moving downward from point C through B toward point A generally causes price elasticity of demand to:',
   'The price-to-quantity ratio falls as movement continues down the line, so elasticity declines.'),
 'P62B-ELAS-M-028':('ELAS-01.webp',None,None),
 'P62B-ELAS-H-016':('ELAS-01.webp',
   'The displayed linear demand curve has constant slope. Why can the upper portion near C be elastic while the lower portion near A is inelastic?',
   'Elasticity compares percentage changes, so the price-quantity location matters even when slope is constant.'),
}
for pool,items in concept['questions'].items():
 for q in items:
  if q['id'] in remap:
   fn,newq,newfb=remap[q['id']]
   q['image']=f'question-assets/elasticity/{fn}'
   if newq: q['q']=newq
   if newfb: q['feedback']=newfb

# Author 48 new graph-dependent questions. Each tuple: graph,pool,objective,skill,type,stem,correct,distractors,feedback.
specs=[]
def add(graph,pool,obj,skill,typ,stem,correct,distractors,feedback,common='misreads_elasticity_graph'):
 specs.append(dict(graph=graph,pool=pool,obj=obj,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,common=common))

# ELAS-01: linear demand, elasticity by location, total revenue, midpoint calculations (18)
add('ELAS-01','easy','ELAS.2','linear_demand_elasticity','graph','At point B on the displayed linear demand curve, what price and quantity are shown?','$8 and 60 units',['$12 and 30 units','$4 and 90 units','$8 and 90 units'],'Point B is marked at P = $8 and Q = 60.')
add('ELAS-01','easy','ELAS.2','linear_demand_elasticity','graph','Which labeled point is the midpoint of the displayed linear demand curve?','Point B',['Point A','Point C','None of the labeled points'],'The line runs from P = $16, Q = 0 to P = $0, Q = 120, so its midpoint is P = $8, Q = 60 at B.')
add('ELAS-01','easy','ELAS.2','elasticity_classification','graph','Which labeled point lies in the inelastic portion of the displayed linear demand curve?','Point A',['Point B','Point C','All three points are equally elastic'],'Below the midpoint of a linear demand curve, quantity is relatively large and price relatively small, so demand is inelastic; A is in that region.')
add('ELAS-01','medium','ELAS.3','total_revenue_formula','calculation','Using point C in the displayed graph, what is total revenue?','$360',['$480','$120','$30'],'At C, P = $12 and Q = 30, so total revenue is $12 × 30 = $360.')
add('ELAS-01','medium','ELAS.3','total_revenue_formula','calculation','Using point B in the displayed graph, what is total revenue?','$480',['$360','$720','$68'],'At B, P = $8 and Q = 60, so total revenue is $480.')
add('ELAS-01','medium','ELAS.3','total_revenue_test','analysis','Moving from C to B lowers price from $12 to $8 while total revenue rises from $360 to $480. What does that imply about demand over this interval?','Demand is elastic',['Demand is inelastic','Demand is perfectly inelastic','Demand is unit elastic throughout the interval'],'When a price cut raises total revenue, demand is elastic over the interval.')
add('ELAS-01','hard','ELAS.2','midpoint_formula','calculation','Using the midpoint formula between C (P = $12, Q = 30) and B (P = $8, Q = 60), the absolute price elasticity of demand is approximately:','1.67',['0.60','1.00','3.00'],'The percentage quantity change is 30/45 ≈ 66.7% and the percentage price change is 4/10 = 40%, giving elasticity about 1.67.')
add('ELAS-01','hard','ELAS.2','midpoint_formula','calculation','Using the midpoint formula between B (P = $8, Q = 60) and A (P = $4, Q = 90), the absolute price elasticity of demand is approximately:','0.60',['1.67','1.00','0.33'],'The percentage quantity change is 30/75 = 40% and the percentage price change is 4/6 ≈ 66.7%, giving elasticity about 0.60.')
add('ELAS-01','hard','ELAS.2','midpoint_formula','calculation','Using the midpoint formula between C (P = $12, Q = 30) and A (P = $4, Q = 90), the absolute price elasticity of demand is:','1.00',['0.50','1.50','2.00'],'From C to A, quantity changes by 60 around an average of 60 and price changes by 8 around an average of 8, so both percentage changes are 100%.')
add('ELAS-01','hard','ELAS.1','slope_vs_elasticity','analysis','Why does elasticity change along the displayed linear demand curve even though the curve has constant slope?','The price-to-quantity ratio changes along the curve',['The demand curve changes slope at B','Elasticity ignores percentage changes','Quantity becomes fixed below B'],'For a linear demand curve, point elasticity depends on both the constant slope term and the changing P/Q ratio.')
add('ELAS-01','elite','ELAS.3','total_revenue_test','analysis','A seller moves from C to B on the displayed demand curve. Total revenue rises by $120 while price falls. Which conclusion follows?','Demand is elastic over C–B',['Demand is inelastic over C–B','Demand is perfectly inelastic over C–B','Demand must have elasticity of zero'],'A price decrease that raises total revenue signals elastic demand.')
add('ELAS-01','elite','ELAS.3','total_revenue_test','analysis','A seller moves from B to A on the displayed demand curve. Total revenue falls from $480 to $360 while price falls. Which conclusion follows?','Demand is inelastic over B–A',['Demand is elastic over B–A','Demand is perfectly elastic over B–A','Demand has constant unit elasticity over B–A'],'A price decrease that lowers total revenue signals inelastic demand.')
add('ELAS-01','elite','ELAS.3','revenue_maximization_unit_elastic','analysis','Point B yields the largest total revenue among A, B, and C. What elasticity condition is associated with that midpoint of a linear demand curve?','Demand is unit elastic',['Demand is perfectly elastic','Demand is perfectly inelastic','Demand has elasticity greater than 2'],'On a linear demand curve, total revenue is maximized at the midpoint, where demand is unit elastic.')
add('ELAS-01','legendary','ELAS.2','linear_demand_elasticity','synthesis','C→B and B→A each involve a $4 price change and a 30-unit quantity change. Why can the first interval be elastic while the second is inelastic?','The percentage-change bases differ across the two intervals',['The demand curve has different slopes in the two intervals','Elasticity uses only the absolute quantity change','Elasticity is determined only by the direction of price'],'Elasticity depends on percentage changes, so identical absolute changes can produce different elasticities when the average price and quantity bases differ.')
add('ELAS-01','legendary','ELAS.3','total_revenue_test','application','A seller is initially at point A and wants to increase total revenue without shifting demand. According to the displayed graph, which move works?','Raise price toward point B',['Cut price farther below point A','Raise price toward point C but skip B','Keep price fixed because revenue cannot change'],'At A, demand is inelastic. Moving toward B raises price from $4 to $8 while total revenue rises from $360 to $480.')
add('ELAS-01','legendary','ELAS.3','total_revenue_test','application','A seller is initially at point C and wants to increase total revenue without shifting demand. According to the displayed graph, which move works?','Lower price toward point B',['Raise price farther above point C','Lower price toward point A without passing B','Keep price fixed because C already maximizes revenue'],'At C, demand is elastic. Moving toward B lowers price and raises total revenue from $360 to $480.')
add('ELAS-01','easyBoss','ELAS.2','linear_demand_elasticity','checkpoint','Checkpoint: Which labeled point on the displayed linear demand curve represents unit elasticity and the maximum total revenue among A, B, and C?','Point B',['Point A','Point C','Both A and C'],'B is the midpoint of the linear demand curve and yields the highest total revenue, so demand is unit elastic there.')
add('ELAS-01','mediumBoss','ELAS.3','total_revenue_test','checkpoint','Checkpoint: The displayed graph gives total revenues of $360 at C, $480 at B, and $360 at A. Which pattern is correct as price falls from C through B to A?','Revenue rises in the elastic region, peaks at unit elasticity, then falls in the inelastic region',['Revenue falls continuously because price falls','Revenue is constant because slope is constant','Revenue peaks in the inelastic region and then rises'],'The total-revenue test tracks the shift from elastic demand above the midpoint to unit elasticity at B and inelastic demand below it.')

# ELAS-02: relative elasticity of D1 vs D2 (12)
add('ELAS-02','easy','ELAS.2','elasticity_classification','graph','At a price of $10 in the displayed graph, which curve shows the larger quantity demanded?','D1, at 45 units',['D2, at 45 units','D1, at 35 units','D2, at 55 units'],'At P = $10, point B on D1 is Q = 45 while point D on D2 is Q = 35.')
add('ELAS-02','easy','ELAS.2','elasticity_classification','graph','When price is $6, which demand curve shows the larger quantity demanded?','D1, at 95 units',['D2, at 95 units','D1, at 55 units','D2, at 45 units'],'At P = $6, D1 is at point A with Q = 95, while D2 is at point C with Q = 55.')
add('ELAS-02','medium','ELAS.2','ped_interpretation','calculation','When price falls from $10 to $6 on D1, quantity demanded rises from 45 to 95. What is the quantity change?','50 units',['20 units','40 units','60 units'],'The change is 95 − 45 = 50 units.')
add('ELAS-02','medium','ELAS.2','ped_interpretation','calculation','When price falls from $10 to $6 on D2, quantity demanded rises from 35 to 55. What is the quantity change?','20 units',['50 units','35 units','90 units'],'The change is 55 − 35 = 20 units.')
add('ELAS-02','medium','ELAS.2','elasticity_classification','comparison','For the same price decrease from $10 to $6, which curve is more price elastic over the labeled interval?','D1',['D2','They have identical elasticity','Elasticity cannot be compared from the labeled points'],'D1 has the much larger proportional quantity response to the same proportional price change.')
add('ELAS-02','hard','ELAS.2','midpoint_formula','calculation','Using B (P = $10, Q = 45) and A (P = $6, Q = 95), the midpoint price elasticity of demand on D1 is approximately:','1.43',['0.89','0.57','2.50'],'The midpoint quantity change is 50/70 ≈ 71.4% and the price change is 4/8 = 50%, so elasticity is about 1.43.')
add('ELAS-02','hard','ELAS.2','midpoint_formula','calculation','Using D (P = $10, Q = 35) and C (P = $6, Q = 55), the midpoint price elasticity of demand on D2 is approximately:','0.89',['1.43','1.80','0.44'],'The midpoint quantity change is 20/45 ≈ 44.4% and the price change is 4/8 = 50%, so elasticity is about 0.89.')
add('ELAS-02','hard','ELAS.2','elasticity_classification','analysis','Using the labeled $10-to-$6 price change, which classification is correct?','D1 is elastic and D2 is inelastic',['Both D1 and D2 are elastic','D1 is inelastic and D2 is elastic','Both D1 and D2 are unit elastic'],'The midpoint coefficients are about 1.43 for D1 and 0.89 for D2.')
add('ELAS-02','elite','ELAS.3','total_revenue_test','analysis','On D1, total revenue changes from $450 at B to $570 at A when price falls from $10 to $6. What does that confirm?','D1 is elastic over B–A',['D1 is inelastic over B–A','D1 is perfectly inelastic over B–A','D1 has zero elasticity over B–A'],'A price cut that increases total revenue indicates elastic demand.')
add('ELAS-02','elite','ELAS.3','total_revenue_test','analysis','On D2, total revenue changes from $350 at D to $330 at C when price falls from $10 to $6. What does that confirm?','D2 is inelastic over D–C',['D2 is elastic over D–C','D2 is perfectly elastic over D–C','D2 is unit elastic over D–C'],'A price cut that reduces total revenue indicates inelastic demand.')
add('ELAS-02','legendary','ELAS.2','elasticity_classification','synthesis','The midpoint elasticities over the labeled intervals are about 1.43 for D1 and 0.89 for D2. Which statement follows?','Only D1 is above the unit-elastic threshold',['Only D2 is above the unit-elastic threshold','Both are exactly unit elastic','Neither curve can be classified'],'Elasticity above one is elastic; 1.43 exceeds one while 0.89 does not.')
add('ELAS-02','legendary','ELAS.1','substitutes_determinant','application','Suppose D1 and D2 describe similar goods, but one has many close substitutes and the other has few. Which assignment is most consistent with the displayed responses?','D1 has more close substitutes than D2',['D2 has more close substitutes than D1','Both must have the same number of substitutes','Substitutes cannot affect demand elasticity'],'More close substitutes make buyers more responsive to price changes, consistent with the larger response on D1.')

# ELAS-03: perfectly elastic vs perfectly inelastic demand (8)
add('ELAS-03','easy','ELAS.1','perfectly_elastic_inelastic','graph','In the displayed graph, horizontal D1 represents:','Perfectly elastic demand',['Perfectly inelastic demand','Unit-elastic demand','A supply curve'],'A horizontal demand curve is the limiting case of perfectly elastic demand.')
add('ELAS-03','easy','ELAS.1','perfectly_elastic_inelastic','graph','In the displayed graph, vertical D2 represents:','Perfectly inelastic demand',['Perfectly elastic demand','Unit-elastic demand','A perfectly elastic supply curve'],'A vertical demand curve means quantity demanded does not change when price changes.')
add('ELAS-03','medium','ELAS.2','perfectly_elastic_inelastic','analysis','Following D2 from point A at P = $5 to point B at P = $7, what happens to quantity demanded?','It remains 50 units',['It rises to 70 units','It falls to 30 units','It becomes zero'],'D2 is vertical at Q = 50, so the price change does not alter quantity demanded.')
add('ELAS-03','hard','ELAS.2','elasticity_classification','analysis','What is the price elasticity coefficient for the vertical D2 curve?','0',['1','Infinity','−1'],'With zero percentage change in quantity despite a price change, the elasticity coefficient is zero.')
add('ELAS-03','elite','ELAS.2','perfectly_elastic_inelastic','application','On horizontal D1 at P = $5, what is the idealized implication of a seller attempting to charge a price above $5?','Quantity demanded falls to zero',['Quantity demanded remains fixed at 50','Quantity demanded rises without limit','Demand becomes perfectly inelastic'],'With perfectly elastic demand, buyers will not accept a price above the market price represented by the horizontal curve.')
add('ELAS-03','legendary','ELAS.2','perfectly_elastic_inelastic','synthesis','How do the absolute elasticity magnitudes of D1 and D2 compare?','D1 approaches infinity while D2 equals zero',['Both equal one','D1 equals zero while D2 approaches infinity','Both equal zero'],'Perfectly elastic demand is the infinite-elasticity limiting case; perfectly inelastic demand has elasticity zero.')
add('ELAS-03','easyBoss','ELAS.1','perfectly_elastic_inelastic','checkpoint','Checkpoint: Which displayed demand curve has zero price elasticity?','D2',['D1','Both D1 and D2','Neither D1 nor D2'],'D2 is vertical, so quantity does not respond to price and elasticity is zero.')
add('ELAS-03','finalBoss','ELAS.2','perfectly_elastic_inelastic','checkpoint','Checkpoint: Moving from A to B along D2 raises price from $5 to $7 while quantity stays at 50. What does that demonstrate?','Perfectly inelastic demand',['Perfectly elastic demand','Unit-elastic demand','An elastic demand response'],'A vertical demand curve allows price to change with no quantity response, the definition of perfect inelasticity.')

# ELAS-05: supply elasticity and time horizon (10)
add('ELAS-05','easy','ELAS.4','time_horizon_supply','graph','At a price of $8, what quantity is supplied on the short-run supply curve?','70 units',['60 units','100 units','40 units'],'Point A on the short-run supply curve is Q = 70 at P = $8.')
add('ELAS-05','easy','ELAS.4','time_horizon_supply','graph','At a price of $8, which supply curve shows the larger quantity response from the common starting point at P = $4, Q = 60?','Long-run supply',['Short-run supply','Both show the same response','Neither curve responds'],'Long-run supply reaches Q = 100, compared with Q = 70 in the short run.')
add('ELAS-05','medium','ELAS.4','pes_interpretation','calculation','When price rises from $4 to $8, how much does quantity supplied rise in the short run?','10 units',['40 units','30 units','70 units'],'Short-run quantity rises from 60 to 70, a 10-unit increase.')
add('ELAS-05','medium','ELAS.4','time_horizon_supply','application','Why does the displayed long-run supply curve show a larger response to the same price increase?','Producers have more time to adjust capacity and inputs',['Producers have less time to change output','Long-run quantity is fixed by definition','Price changes are smaller in the long run'],'More adjustment time usually allows firms to expand capacity, enter, switch inputs, and otherwise respond more strongly.')
add('ELAS-05','hard','ELAS.4','pes_calculation','calculation','Using the midpoint formula from (P = $4, Q = 60) to point A (P = $8, Q = 70), short-run price elasticity of supply is approximately:','0.23',['0.75','1.33','2.30'],'The midpoint quantity change is 10/65 ≈ 15.4% and the price change is 4/6 ≈ 66.7%, giving PES ≈ 0.23.')
add('ELAS-05','elite','ELAS.4','pes_calculation','calculation','Using the midpoint formula from (P = $4, Q = 60) to point B (P = $8, Q = 100), long-run price elasticity of supply is approximately:','0.75',['0.23','1.25','3.00'],'The midpoint quantity change is 40/80 = 50% and the price change is 4/6 ≈ 66.7%, giving PES ≈ 0.75.')
add('ELAS-05','elite','ELAS.4','time_horizon_supply','analysis','A persistent price increase initially moves producers toward A but, after more adjustment time, toward B. Which elasticity principle does this illustrate?','Supply tends to become more elastic over longer time horizons',['Supply must become perfectly inelastic over time','Short-run supply is always more elastic than long-run supply','Time horizon affects demand but never supply'],'The larger long-run quantity response illustrates that firms can adjust more fully when given time.')
add('ELAS-05','legendary','ELAS.4','pes_calculation','synthesis','The midpoint PES values are about 0.23 in the short run and 0.75 in the long run. Approximately how many times larger is the long-run elasticity?','3.25 times',['1.30 times','2.00 times','7.50 times'],'0.75 ÷ 0.23 is about 3.25, confirming a substantially larger long-run response.')
add('ELAS-05','mediumBoss','ELAS.4','time_horizon_supply','checkpoint','Checkpoint: Price rises from $4 to $8. Short-run quantity rises from 60 to 70 while long-run quantity rises from 60 to 100. Which curve is more elastic?','Long-run supply',['Short-run supply','Both are equally elastic','Elasticity cannot be compared from these changes'],'The long-run curve shows the larger proportional quantity response to the same proportional price change.')
add('ELAS-05','finalBoss','ELAS.4','pes_calculation','checkpoint','Checkpoint: Using the midpoint formula for the $4-to-$8 price increase, which approximate pair correctly compares supply elasticity?','Short run 0.23; long run 0.75',['Short run 0.75; long run 0.23','Short run 1.00; long run 1.00','Short run 3.25; long run 0.75'],'The short-run response is about 0.23 and the long-run response about 0.75, so long-run supply is more elastic.')

assert len(specs)==48, len(specs)
# Expected distribution audit
from collections import Counter
assert Counter(s['graph'] for s in specs)==Counter({'ELAS-01':18,'ELAS-02':12,'ELAS-03':8,'ELAS-05':10})
assert Counter(s['pool'] for s in specs)==Counter({'easy':9,'medium':9,'hard':9,'elite':8,'legendary':7,'easyBoss':2,'mediumBoss':2,'finalBoss':2})

# Assign IDs by pool and rotate correct answer position evenly across all 48.
prefix_map={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L','easyBoss':'B1','mediumBoss':'B2','finalBoss':'B3'}
start_map={'easy':31,'medium':31,'hard':31,'elite':31,'legendary':91,'easyBoss':19,'mediumBoss':19,'finalBoss':19}
counters={k:v for k,v in start_map.items()}
newqs=[]
for idx,s in enumerate(specs):
 pool=s['pool']; code=prefix_map[pool]; n=counters[pool]; counters[pool]+=1
 qid=f'P62B-ELAS-{code}-{n:03d}'
 choices=[s['correct']]+list(s['distractors'])
 pos=idx%4
 correct=choices.pop(0); choices.insert(pos,correct)
 source_id=715000+idx
 canonical_diff={'easyBoss':'easy','mediumBoss':'medium','finalBoss':'hard'}.get(pool,pool)
 role={'elite':'elite','legendary':'legendary','easyBoss':'boss','mediumBoss':'boss','finalBoss':'boss'}.get(pool,'main')
 source_hash=sha_text(json.dumps({'id':qid,'q':s['stem'],'options':choices,'image':s['graph']},sort_keys=True,ensure_ascii=False))
 q={
   'id':qid,'q':s['stem'],'options':choices,'tag':'elasticity','type':s['typ'],'objective':s['obj'],
   'difficulty':pool,'conceptCluster':'elasticity','primarySkill':s['skill'],'secondarySkills':[],
   'repairSkill':s['skill'],'commonError':s['common'],'feedback':s['feedback'],
   'image':f"question-assets/elasticity/{s['graph']}.webp",'aHash':sha_text(correct),
   'canonicalId':qid,'sourceId':source_id,'sourceGame':'micro-concept-library','sourceChapter':['elasticity'],
   'sourcePool':pool,'sourceHash':source_hash,
   'sourceOccurrences':[{'sourceGame':'micro-concept-library','sourceFile':PHASE,'sourceGlobal':'questions','sourcePool':pool,'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],
   'primaryConceptId':'elasticity','secondaryConceptIds':[],'instructionalRole':role,'canonicalDifficulty':canonical_diff,
   'originalSourcePool':pool,'originalBossTier':pool if pool.endswith('Boss') else None
 }
 newqs.append(q)
 target='boss' if pool.endswith('Boss') else pool
 concept['questions'][target].append(q)

# Save authoring payload.
(ROOT/'phase6_2b_elasticity_graph_expansion_v2_questions.json').write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Recompute elasticity registry metrics from the actual concept records.
all_main=[q for arr in concept['questions'].values() for q in arr]
all_records=all_main+concept.get('repairQuestions',[])+concept.get('bridgeQuestions',[])+concept.get('repairSeedQuestions',[])
reg_entry=next(x for x in lib['registry']['concepts'] if x['canonicalConceptId']=='elasticity')
role_counts=Counter(q.get('instructionalRole','unknown') for q in all_records)
for key in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']:
 role_counts.setdefault(key,0)
# Calculation role is a source pool/instructional role in this library; preserve from actual records.
reg_entry['questionCountByRole']={k:role_counts[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']}
diff_counts=Counter(q.get('canonicalDifficulty','unknown') or 'unknown' for q in all_records)
reg_entry['questionCountByDifficulty']={k:diff_counts.get(k,0) for k in ['easy','medium','hard','elite','legendary','unknown']}
reg_entry['repairCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in concept.get('repairQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in all_main)}
reg_entry['bridgeCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in concept.get('bridgeQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in all_main)}
reg_entry['calculationCoverage']=sum(q.get('type')=='calculation' for q in all_main)
reg_entry['graphCoverage']=sum(bool(q.get('image')) for q in all_main)
reg_entry['notes']='Fresh Principles of Microeconomics bank authored in Phase 6.2b, with the approved four-graph elasticity expansion added in August 2026. Graph items require direct use of the displayed figure and avoid tax-incidence graph material.'
reg_entry['coverageStatusNote']='Publisher-scale standalone bank with balanced foundational through mastery coverage, dedicated calculations and remediation, plus 56 graph-dependent items using the approved ELAS-01, ELAS-02, ELAS-03, and ELAS-05 assets.'

# Top-level counts/version/registry metadata.
def concept_total(c):
 return sum(len(v) for v in c['questions'].values())+len(c.get('repairQuestions',[]))+len(c.get('bridgeQuestions',[]))+len(c.get('repairSeedQuestions',[]))
lib['canonicalQuestionCount']=sum(concept_total(c) for c in lib['concepts'].values())
lib['libraryVersion']=lib['libraryVersion']+'-elasticity-graph-v2'
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Elasticity graph expansion v2: four approved canonical graph assets, 48 new graph-dependent questions, legacy graph items remapped, and tax-incidence/obsolete elasticity graph assets removed.'
# Compute a stable integrity hash over the canonical library excluding its own hash field.
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
lib['librarySha256']=sha_text(json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True))
save_library(lib)

# Sync standalone registry.
REG.write_text(json.dumps(lib['registry'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# Sync manifest.
manifest={'assetCount':len(lib['assetInventory']),'assets':lib['assetInventory'],'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN}
MAN.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Machine-readable expansion result.
result={
 'phase':PHASE,'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],
 'newQuestionCount':len(newqs),'graphCounts':dict(Counter(Path(q['image']).stem for q in newqs)),
 'poolCounts':dict(Counter(q['sourcePool'] for q in newqs)),
 'newCorrectAnswerPositions':dict(Counter(next(i for i,opt in enumerate(q['options']) if sha_text(opt)==q['aHash']) for q in newqs)),
 'elasticityCanonicalCount':concept_total(concept),'elasticityGraphCount':reg_entry['graphCoverage'],
 'elasticityAssetCount':len(concept['assets']),'globalCanonicalQuestionCount':lib['canonicalQuestionCount'],'globalAssetCount':len(lib['assetInventory'])
}
(ROOT/'phase6_2b_elasticity_graph_expansion_v2_results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
