import json, hashlib, unicodedata
from pathlib import Path
from collections import Counter
from PIL import Image

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseGraph3-macro-ad-as-core-v1'
GEN='2026-08-12T16:00:00.000Z'
SOURCE_ASSETS={
    'AS-01': Path('/mnt/data/ghostwriter_images/context/a5e2604b-2bc8-5c47-bec7-6bd50c1d5653.png'),
    'AD-01': Path('/mnt/data/ghostwriter_images/context/d11fcee4-48ab-5fc1-a8df-2b65da8f90aa.png'),
    'AD-02': Path('/mnt/data/ghostwriter_images/context/70240eff-ca10-5e55-b034-d8b7d77551e6.png'),
    'AS-02': Path('/mnt/data/ghostwriter_images/context/6d806d32-6c13-5d56-84d0-8c0b70a2f0df.png'),
    'ADASLRAS-01': Path('/mnt/data/ghostwriter_images/context/5ca67e0c-fa97-5b69-960f-d551ca232c16.png'),
    'ADASLRAS-02': Path('/mnt/data/ghostwriter_images/context/9443aba3-df9d-5c82-9a53-46bbea602b9b.png'),
    'ADAS-01': Path('/mnt/data/ghostwriter_images/context/f859593a-e015-50ca-9eb5-2f9a77db3d68.png'),
    'ADAS-02': Path('/mnt/data/ghostwriter_images/context/b9bde60e-feea-555c-b876-ed63bde358f2.png'),
}
ASSET_CONCEPT={
    'AS-01':'aggregate-supply',
    'AD-01':'aggregate-demand',
    'AD-02':'aggregate-demand',
    'AS-02':'aggregate-supply',
    'ADASLRAS-01':'macroeconomic-equilibrium-and-shocks',
    'ADASLRAS-02':'macroeconomic-equilibrium-and-shocks',
    'ADAS-01':'macroeconomic-equilibrium-and-shocks',
    'ADAS-02':'macroeconomic-equilibrium-and-shocks',
}
ASSET_TEXT={
    'AS-01':{
        'imageAlt':'Aggregate supply graph with AS0 and a dashed AS1 curve above it, showing a decrease in aggregate supply.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AS0 is an upward-sloping curve beginning near a price level of 75 when real GDP is 0 and reaching about 190 when real GDP is 230. A dashed curve AS1 lies above AS0 at all output levels, indicating a decrease in aggregate supply. At real GDP 150, the price level on AS0 is 150 and the price level on AS1 is 190.'},
    'AD-01':{
        'imageAlt':'Aggregate demand graph with AD0 and a dashed AD1 curve to the right, showing an increase in aggregate demand.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AD0 slopes downward from price level 100 at real GDP 0 to price level 0 at real GDP 200. A dashed curve AD1 lies to the right of AD0, running from about 125 at real GDP 0 to 0 at real GDP 250. This indicates an increase in aggregate demand. At price level 50, AD0 corresponds to real GDP 100 and AD1 corresponds to real GDP 150.'},
    'AD-02':{
        'imageAlt':'Aggregate demand graph with AD0 and a dashed AD1 curve to the left, showing a decrease in aggregate demand.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AD0 slopes downward from price level 120 at real GDP 0 to price level 0 at real GDP 240. A dashed curve AD1 lies to the left of AD0, running from about 95 at real GDP 0 to 0 at real GDP 190. This indicates a decrease in aggregate demand. At price level 45, AD0 corresponds to real GDP 150 and AD1 corresponds to real GDP 100.'},
    'AS-02':{
        'imageAlt':'Aggregate supply graph with AS0 and a dashed AS1 curve below it, showing an increase in aggregate supply.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AS0 is an upward-sloping curve beginning near a price level of 75 at real GDP 0 and reaching about 190 at real GDP 230. A dashed curve AS1 lies below AS0 at all output levels, indicating an increase in aggregate supply. At real GDP 150, the price level on AS0 is 150 and the price level on AS1 is 110.'},
    'ADASLRAS-01':{
        'imageAlt':'AD-AS-LRAS graph with AD0, AD1, SRAS0, SRAS1, LRAS0, and labeled points A, B, C, and D.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. LRAS0 is vertical at real GDP 100. AD0 intersects SRAS0 at point C, where real GDP is 100 and price level is 125. AD1 intersects SRAS0 at point D, where real GDP is 125 and price level is 150. AD0 intersects SRAS1 at point A, where real GDP is 75 and price level is 150. AD1 intersects SRAS1 and LRAS0 at point B, where real GDP is 100 and price level is 175. The graph can be used to trace an AD increase from original long-run equilibrium C to short-run point D and then to long-run point B after SRAS shifts left.'},
    'ADASLRAS-02':{
        'imageAlt':'AD-AS-LRAS graph with AD0, SRAS0, SRAS1, LRAS0, LRAS1, and labeled points A and B.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AD0 slopes downward. Point A is the original long-run equilibrium where AD0, SRAS0, and LRAS0 intersect at real GDP 100 and price level 125. A dashed SRAS1 curve lies below SRAS0, and a dashed LRAS1 line lies to the right of LRAS0 at real GDP 115. Point B is the new long-run equilibrium where AD0, SRAS1, and LRAS1 intersect at real GDP 115 and price level 110. The graph shows a positive supply-side change that raises long-run output and lowers the price level.'},
    'ADAS-01':{
        'imageAlt':'AD-AS graph with AD0, AD1, AS0, and labeled points A and B.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AD0 intersects AS0 at point A, where real GDP is 150 and the price level is 125. A dashed AD1 curve lies to the right of AD0 and intersects AS0 at point B, where real GDP is 175 and the price level is 137.5. This graph shows an increase in aggregate demand moving the economy along a fixed short-run aggregate supply curve.'},
    'ADAS-02':{
        'imageAlt':'AD-AS graph with AD0, AD1, AS0, AS1, and labeled points A, B, C, and D.',
        'graphDescription':'The horizontal axis is real GDP and the vertical axis is price level. AD0 intersects AS0 at point A, where real GDP is 75 and the price level is 100. AD1 intersects AS0 at point B, where real GDP is 100 and the price level is 125. AD0 intersects AS1 at point D, where real GDP is 50 and the price level is 125. AD1 intersects AS1 at point C, where real GDP is 75 and the price level is 150. The graph allows separate analysis of an AD increase, a decrease in aggregate supply, and the simultaneous occurrence of both.'},
}

def sha_text(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()
def normalize_answer(s): return ' '.join(unicodedata.normalize('NFKC', str(s)).strip().split()).lower()
def sha_answer(s): return hashlib.sha256(normalize_answer(s).encode('utf-8')).hexdigest()
def sha_file(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1<<20),b''): h.update(b)
    return h.hexdigest()

def load_library():
    s=LIB.read_text(encoding='utf-8')
    return json.loads(s.split('=',1)[1].strip().rstrip(';'))

def save_library(o):
    LIB.write_text('window.MQ_COMPOSER_LIBRARY='+json.dumps(o,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')

lib=load_library()

# install assets
new_asset_meta=[]
for name,src in SOURCE_ASSETS.items():
    if not src.exists(): raise FileNotFoundError(src)
    concept_id=ASSET_CONCEPT[name]
    outdir=ROOT/'data'/'question-assets'/concept_id
    outdir.mkdir(parents=True,exist_ok=True)
    out=outdir/f'{name}.webp'
    with Image.open(src) as im:
        im.convert('RGB').save(out,'WEBP',quality=94,method=6)
    meta={
        'conceptId':concept_id,
        'filename':out.name,
        'sourceAssetPath':f'question-assets/{concept_id}/{out.name}',
        'sourceUrl':f'data/question-assets/{concept_id}/{out.name}',
        'runtimePath':f'question-assets/{concept_id}/{out.name}',
        'sha256':sha_file(out), 'sizeBytes':out.stat().st_size,
        **ASSET_TEXT[name]
    }
    new_asset_meta.append(meta)
    concept=lib['concepts'][concept_id]
    concept['assetMetadata']=[a for a in concept.get('assetMetadata',[]) if a.get('filename')!=out.name]
    concept['assets']=[a for a in concept.get('assets',[]) if Path(a).name!=out.name]
    concept['assetPaths']=[a for a in concept.get('assetPaths',[]) if Path(a).name!=out.name]
    concept['assetMetadata'].append(meta)
    concept['assets'].append(meta['runtimePath'])
    concept['assetPaths'].append(meta['runtimePath'])

new_paths={a['runtimePath'] for a in new_asset_meta}
lib['assetInventory']=[a for a in lib.get('assetInventory',[]) if a.get('runtimePath') not in new_paths]
lib['assetInventory'].extend(new_asset_meta)

specs=[]
def add(concept,asset,pool,skill,typ,stem,correct,distractors,feedback,secondary=None,repair=None,common='misreads_graph_or_curve_shift'):
    specs.append(dict(concept=concept,asset=asset,pool=pool,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,secondary=secondary or [],repair=repair or skill,common=common))

# AS-01 decrease in AS
add('aggregate-supply','AS-01','easy','read_sras_shift','graph',
    'The dashed AS1 curve lies above the original AS0 curve. What change does this graph show?',
    'A decrease in aggregate supply',
    ['An increase in aggregate supply','An increase in aggregate demand','A decrease in aggregate demand'],
    'When the aggregate supply curve shifts left/up, less output is supplied at each price level, which is a decrease in aggregate supply.')
add('aggregate-supply','AS-01','medium','identify_sras_shifters','analysis',
    'If the economy moves from AS0 to AS1 in the graph, what happens to real GDP and the price level?',
    'Real GDP decreases while the price level increases',
    ['Real GDP increases while the price level decreases','Both real GDP and the price level increase','Both real GDP and the price level decrease'],
    'An inward/leftward AS shift reduces output and raises the price level.')
add('aggregate-supply','AS-01','medium','identify_sras_shifters','analysis',
    'Which event best matches the shift from AS0 to AS1?',
    'A rise in input prices that makes production more costly',
    ['Higher consumer confidence that boosts spending','A cut in income taxes that raises aggregate demand','A fall in the overall price level causing a movement along AS0'],
    'Higher production costs shift short-run aggregate supply left.')
add('aggregate-supply','AS-01','hard','read_sras_shift','calculation',
    'At real GDP of 150, the price level on AS0 is 150 and the price level on AS1 is 190. By how much does the price level rise at that output level?',
    '40',
    ['25','50','75'],
    'At the same output level, the price level increases from 150 to 190, a rise of 40.')
add('aggregate-supply','AS-01','elite','expected_price_sras_shift','analysis',
    'A student says the graph shows a recession with inflation pressure occurring at the same time. Which label best fits that combination?',
    'Stagflation caused by a negative aggregate supply shock',
    ['Demand-pull expansion caused by an AD increase','Long-run growth caused by a rise in LRAS','Deflation caused by an AD decrease'],
    'A leftward shift of AS reduces output and raises prices, the classic stagflation pattern.',secondary=['stagflation'])
add('aggregate-supply','AS-01','legendary','read_sras_shift','multi-step',
    'Which statement best interprets the shift from AS0 to AS1 without confusing it for a movement along a curve?',
    'At every real GDP level, producers now require a higher price level than before, so aggregate supply has decreased',
    ['At every price level, consumers demand more output than before, so aggregate demand has increased','The economy slides downward along AS0, so price level and output both fall','The graph shows LRAS moving right, so potential output rises while prices fall'],
    'The entire AS curve shifted up/left. That means production is less forthcoming at each price level, not that the economy merely moved to another point on AS0.',secondary=['movement_vs_shift'])

# AD-01 increase in AD
add('aggregate-demand','AD-01','easy','read_ad_shift','graph',
    'The dashed AD1 curve lies to the right of AD0. What change does the graph show?',
    'An increase in aggregate demand',
    ['A decrease in aggregate demand','An increase in aggregate supply','A decrease in aggregate supply'],
    'A rightward shift of AD means aggregate demand has increased.')
add('aggregate-demand','AD-01','medium','read_ad_shift','analysis',
    'If the economy moves from AD0 to AD1 with aggregate supply held fixed, what happens to real GDP and the price level?',
    'Both real GDP and the price level increase',
    ['Real GDP decreases while the price level increases','Real GDP increases while the price level decreases','Both real GDP and the price level decrease'],
    'A rightward shift of AD raises spending pressure, so equilibrium output and the price level both rise in the short run.')
add('aggregate-demand','AD-01','medium','identify_ad_shifters','analysis',
    'Which event is most consistent with the shift from AD0 to AD1?',
    'An increase in consumer, investment, government, or net-export spending',
    ['A rise in input costs that shifts AS left','An increase in wages that reduces aggregate supply','A fall in productivity that lowers long-run output'],
    'Aggregate demand shifts right when planned spending rises.')
add('aggregate-demand','AD-01','hard','read_ad_shift','calculation',
    'At a price level of 50, the graph shows real GDP of 100 on AD0 and 150 on AD1. By how much does quantity of real GDP demanded increase?',
    '50',
    ['25','75','100'],
    'At price level 50, the quantity of output demanded rises from 100 to 150, an increase of 50.')
add('aggregate-demand','AD-01','elite','explain_ad_slope','analysis',
    'A student says AD1 must represent aggregate supply because real GDP is larger. What is the best correction?',
    'AD is the downward-sloping spending curve, so a rightward shift from AD0 to AD1 still represents aggregate demand, not aggregate supply',
    ['Any curve farther right must always be aggregate supply','The graph is actually showing LRAS because real GDP is on the horizontal axis','Because price level is measured vertically, the curve cannot represent demand'],
    'The label and downward slope identify the curves as AD. A larger quantity demanded at each price level is an increase in aggregate demand.',secondary=['read_ad_as_axes'])
add('aggregate-demand','AD-01','legendary','identify_ad_shifters','multi-step',
    'Which statement correctly interprets the move from AD0 to AD1?',
    'At each price level, households, firms, government, and foreigners together demand more real output than before',
    ['At each real GDP level, firms are willing to produce more because input costs fell','The economy experiences a movement upward along the same AD curve due to inflation alone','Potential output rises because LRAS shifts right with no change in spending'],
    'An AD increase means spending is higher at every price level. That is a shift of the entire demand curve, not a movement along it.',secondary=['movement_vs_shift'])

# AD-02 decrease in AD
add('aggregate-demand','AD-02','easy','read_ad_shift','graph',
    'The dashed AD1 curve lies to the left of AD0. What change does the graph show?',
    'A decrease in aggregate demand',
    ['An increase in aggregate demand','An increase in aggregate supply','A decrease in aggregate supply'],
    'A leftward shift of AD means aggregate demand has decreased.')
add('aggregate-demand','AD-02','medium','read_ad_shift','analysis',
    'If the economy moves from AD0 to AD1 with aggregate supply held fixed, what happens to real GDP and the price level?',
    'Both real GDP and the price level decrease',
    ['Real GDP increases while the price level decreases','Real GDP decreases while the price level increases','Both real GDP and the price level increase'],
    'A leftward shift of AD lowers spending pressure, reducing equilibrium output and the price level in the short run.')
add('aggregate-demand','AD-02','medium','identify_ad_shifters','analysis',
    'Which event best matches the shift from AD0 to AD1?',
    'A fall in planned spending such as lower consumption or investment',
    ['A productivity improvement that shifts AS right','A fall in input costs that increases aggregate supply','A higher expected price level that moves the economy along AS'],
    'Lower overall spending shifts aggregate demand left.')
add('aggregate-demand','AD-02','hard','read_ad_shift','calculation',
    'At a price level of 45, the graph shows real GDP of 150 on AD0 and 100 on AD1. By how much does quantity of real GDP demanded fall?',
    '50',
    ['25','75','100'],
    'At price level 45, quantity demanded falls from 150 to 100, a decrease of 50.')
add('aggregate-demand','AD-02','elite','read_ad_shift','analysis',
    'A policymaker wants to reverse the move from AD0 to AD1. Which macro pattern is the policymaker trying to avoid?',
    'A drop in output accompanied by downward pressure on the price level',
    ['A rise in output accompanied by inflationary pressure from excess spending','A rise in output from improved productivity','A higher price level paired with a fall in output from a negative supply shock'],
    'A decrease in AD lowers both real GDP and the price level in the short run.',secondary=['fiscal_policy_and_aggregate_demand'])
add('aggregate-demand','AD-02','legendary','read_ad_shift','multi-step',
    'Which statement best captures the meaning of the shift from AD0 to AD1?',
    'At every price level, the total quantity of real output demanded is lower than before, so aggregate demand has decreased',
    ['At every real GDP level, firms must be paid a lower price level, so aggregate supply has increased','The graph shows a movement along AD0 caused only by a lower price level','Potential output falls because LRAS shifts left even though demand stays constant'],
    'The entire AD curve shifts left. That means spending is lower at each price level, not that the economy merely moved along AD0.',secondary=['movement_vs_shift'])

# AS-02 increase in AS
add('aggregate-supply','AS-02','easy','read_sras_shift','graph',
    'The dashed AS1 curve lies below the original AS0 curve. What change does this graph show?',
    'An increase in aggregate supply',
    ['A decrease in aggregate supply','An increase in aggregate demand','A decrease in aggregate demand'],
    'A downward/rightward shift of the AS curve means aggregate supply has increased.')
add('aggregate-supply','AS-02','medium','read_sras_shift','analysis',
    'If the economy moves from AS0 to AS1 with aggregate demand held fixed, what happens to real GDP and the price level?',
    'Real GDP increases while the price level decreases',
    ['Real GDP decreases while the price level increases','Both real GDP and the price level increase','Both real GDP and the price level decrease'],
    'A rightward shift of AS increases output and lowers the price level.')
add('aggregate-supply','AS-02','medium','identify_sras_shifters','analysis',
    'Which event best matches the shift from AS0 to AS1?',
    'A fall in input costs or an improvement in productivity',
    ['A surge in household spending','An increase in government purchases that shifts AD right','A rise in inflation expectations that shifts SRAS left'],
    'Lower costs or better productivity shift aggregate supply right.')
add('aggregate-supply','AS-02','hard','read_sras_shift','calculation',
    'At real GDP of 150, the price level on AS0 is 150 and the price level on AS1 is 110. By how much does the price level fall at that output level?',
    '40',
    ['25','50','75'],
    'At the same output level, price level falls from 150 to 110, a decrease of 40.')
add('aggregate-supply','AS-02','elite','identify_sras_shifters','analysis',
    'A student claims the graph shows demand-pull growth. What is the strongest correction?',
    'The graph shows a rightward shift of aggregate supply, which lowers the price level while raising output',
    ['The graph shows a rightward shift of aggregate demand, which raises both price level and output','The graph shows LRAS shifting left, which lowers output and raises prices','The graph shows no shift at all, only a movement along AS0'],
    'Demand-pull expansions raise both price level and output. This graph instead shows more output paired with a lower price level, which is an AS increase.',secondary=['movement_vs_shift'])
add('aggregate-supply','AS-02','legendary','read_sras_shift','multi-step',
    'Which statement best interprets the move from AS0 to AS1?',
    'At every real GDP level, producers are willing to supply output at a lower price level than before, so aggregate supply has increased',
    ['At every price level, buyers demand less output than before, so aggregate demand has fallen','The economy moves upward along AS0 because input prices increased','Potential output is unchanged because no supply-side forces are involved'],
    'A lower AS curve means firms will supply more at each price level, or the same output at a lower price level. That is an increase in aggregate supply.',secondary=['movement_vs_shift'])

# ADASLRAS-01
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','easy','identify_lras','graph',
    'In the AD-AS-LRAS graph, which labeled point represents the original long-run equilibrium before aggregate demand increases?',
    'Point C',
    ['Point A','Point B','Point D'],
    'The original long-run equilibrium is where AD0, SRAS0, and LRAS0 meet. That is point C.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','medium','read_ad_shift','graph',
    'If aggregate demand increases from AD0 to AD1 while SRAS0 is still fixed in the short run, which point shows the short-run equilibrium?',
    'Point D',
    ['Point A','Point B','Point C'],
    'With AD1 and SRAS0, the short-run equilibrium is point D.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','medium','identify_lras','graph',
    'After wages and expectations adjust, SRAS shifts from SRAS0 to SRAS1. Which point shows the new long-run equilibrium?',
    'Point B',
    ['Point A','Point C','Point D'],
    'The new long-run equilibrium occurs where AD1, SRAS1, and LRAS0 intersect: point B.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','hard','read_ad_shift','multi-step',
    'Which sequence correctly traces the economy after an increase in aggregate demand starting from the original long-run equilibrium?',
    'C to D to B',
    ['C to A to D','A to C to B','D to C to A'],
    'The economy begins at C, moves to D in the short run when AD increases, and returns to long-run output at B after SRAS shifts left.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','elite','identify_lras','analysis',
    'Comparing the original long-run equilibrium C with the new long-run equilibrium B, what is true?',
    'Real GDP returns to 100 while the price level rises from 125 to 175',
    ['Real GDP rises to 125 while the price level remains 125','Real GDP falls to 75 while the price level remains 150','Real GDP stays 100 while the price level falls from 125 to 100'],
    'LRAS stays at 100, so long-run real GDP returns to 100. The long-run price level is higher at B than at C.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-01','legendary','read_ad_shift','multi-step',
    'A student says an aggregate-demand increase permanently raises real GDP above potential in this graph. Which correction is best?',
    'It raises real GDP above potential only in the short run at D; after SRAS shifts left, the economy returns to potential output at B with a higher price level',
    ['It never changes price level, because LRAS determines only inflation','It permanently moves the economy to D because SRAS does not adjust','It lowers real GDP below potential in the short run and restores it at A'],
    'The graph shows short-run output above LRAS at D, but long-run adjustment returns output to LRAS at B while price level stays higher.',secondary=['short_run_long_run_adjustment'])

# ADASLRAS-02
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','easy','identify_lras','graph',
    'Which labeled point is the original long-run equilibrium in the graph with LRAS0 and LRAS1?',
    'Point A',
    ['Point B','LRAS1','SRAS1'],
    'Point A is where AD0, SRAS0, and LRAS0 intersect.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','medium','identify_lras','graph',
    'Which labeled point is the new long-run equilibrium after the supply-side improvement?',
    'Point B',
    ['Point A','LRAS0','SRAS0'],
    'Point B is where AD0, SRAS1, and LRAS1 intersect.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','medium','read_sras_shift','analysis',
    'From point A to point B, what happens to real GDP and the price level?',
    'Real GDP rises from 100 to 115 while the price level falls from 125 to 110',
    ['Real GDP falls from 115 to 100 while the price level rises from 110 to 125','Both real GDP and the price level rise','Both real GDP and the price level fall'],
    'The graph shows more long-run output and a lower price level at the new equilibrium.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','hard','identify_sras_shifters','analysis',
    'Which event best matches the joint shift from SRAS0/LRAS0 to SRAS1/LRAS1?',
    'A productivity improvement that raises potential output and lowers production costs',
    ['A drop in consumer confidence that reduces aggregate demand','A rise in energy prices that lowers aggregate supply','An increase in government spending that shifts AD right'],
    'A positive supply-side change can shift both SRAS right and LRAS right.')
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','elite','short_run_long_run_adjustment','analysis',
    'Which statement best describes the macro outcome shown by the move from A to B?',
    'The economy experiences long-run growth with disinflationary pressure',
    ['The economy experiences recession with accelerating inflation','The economy shows pure demand-pull inflation with no growth','The economy remains stuck at the same output and price level'],
    'Higher LRAS and SRAS support more output alongside a lower price level.',secondary=['growth_productivity'])
add('macroeconomic-equilibrium-and-shocks','ADASLRAS-02','legendary','identify_lras','multi-step',
    'A student says point B can only be explained by higher aggregate demand because real GDP is larger there. Which correction best fits the graph?',
    'Point B is created by rightward shifts of both SRAS and LRAS while AD stays at AD0, so higher output comes from stronger supply, not stronger demand',
    ['Point B is created by a rightward shift of AD with no supply changes, so the student is correct','Point B is created by a leftward shift of SRAS, which raises output and lowers prices','Point B is impossible because LRAS cannot move in macroeconomics'],
    'The graph holds AD constant and shows the supply side improving. That raises potential output and lowers the price level.',secondary=['movement_vs_shift'])

# ADAS-01 simple AD/AS
add('macroeconomic-equilibrium-and-shocks','ADAS-01','easy','read_ad_shift','graph',
    'In the AD-AS graph, which point shows the original equilibrium before aggregate demand rises?',
    'Point A',
    ['Point B','AD1','AS0'],
    'Point A is the intersection of AD0 and AS0.')
add('macroeconomic-equilibrium-and-shocks','ADAS-01','medium','read_ad_shift','graph',
    'After aggregate demand shifts from AD0 to AD1 while AS0 is fixed, which point shows the new short-run equilibrium?',
    'Point B',
    ['Point A','AD0','AS1'],
    'Point B is where AD1 intersects AS0.')
add('macroeconomic-equilibrium-and-shocks','ADAS-01','medium','read_ad_shift','calculation',
    'From point A to point B, by how much does real GDP increase?',
    '25',
    ['12.5','37.5','50'],
    'Real GDP rises from 150 to 175, an increase of 25.')
add('macroeconomic-equilibrium-and-shocks','ADAS-01','hard','read_ad_shift','calculation',
    'From point A to point B, by how much does the price level increase?',
    '12.5',
    ['10','25','37.5'],
    'The price level rises from 125 to 137.5, an increase of 12.5.')
add('macroeconomic-equilibrium-and-shocks','ADAS-01','elite','movement_vs_shift','analysis',
    'Which description best matches the move from A to B?',
    'The economy moves upward along a fixed AS0 curve because aggregate demand increases',
    ['The AS curve shifts right while aggregate demand stays constant','The economy moves downward along AD0 because aggregate supply decreases','Both AD and AS shift so the economy returns to its original output'],
    'With AS0 unchanged, the AD increase causes a movement along the AS curve to a new short-run equilibrium.',secondary=['movement_vs_shift'])
add('macroeconomic-equilibrium-and-shocks','ADAS-01','legendary','read_ad_shift','multi-step',
    'A student sees higher output and a higher price level at point B and concludes the graph must show an aggregate-supply increase. What is the best correction?',
    'An aggregate-supply increase would raise output but lower the price level; this graph shows both rising, which is the short-run signature of an aggregate-demand increase',
    ['An aggregate-supply increase always raises both output and the price level, so the student is correct','A demand increase would lower output and raise the price level, so this cannot be AD','Because the graph lacks LRAS, no conclusion about demand or supply is possible'],
    'In a standard AD-AS model, a rightward AD shift raises both output and prices in the short run, unlike a rightward AS shift.',secondary=['read_sras_shift'])

# ADAS-02 simultaneous AD increase and AS decrease
add('macroeconomic-equilibrium-and-shocks','ADAS-02','easy','read_ad_shift','graph',
    'Which point marks the original equilibrium where AD0 and AS0 intersect?',
    'Point A',
    ['Point B','Point C','Point D'],
    'Point A is the initial intersection of AD0 and AS0.')
add('macroeconomic-equilibrium-and-shocks','ADAS-02','medium','read_ad_shift','graph',
    'If only aggregate demand increases from AD0 to AD1 while AS0 stays in place, which point shows the new equilibrium?',
    'Point B',
    ['Point A','Point C','Point D'],
    'With AD1 and AS0, the equilibrium is point B.')
add('macroeconomic-equilibrium-and-shocks','ADAS-02','medium','read_sras_shift','graph',
    'If only aggregate supply decreases from AS0 to AS1 while AD0 stays in place, which point shows the new equilibrium?',
    'Point D',
    ['Point A','Point B','Point C'],
    'With AD0 and AS1, the equilibrium is point D.')
add('macroeconomic-equilibrium-and-shocks','ADAS-02','hard','read_ad_shift','multi-step',
    'If aggregate demand increases from AD0 to AD1 at the same time aggregate supply decreases from AS0 to AS1, which point shows the resulting equilibrium?',
    'Point C',
    ['Point A','Point B','Point D'],
    'The simultaneous changes place the economy at the intersection of AD1 and AS1, which is point C.')
add('macroeconomic-equilibrium-and-shocks','ADAS-02','elite','read_ad_shift','analysis',
    'Compare point A with point C. Which statement is correct?',
    'Real GDP is unchanged at 75, but the price level rises from 100 to 150',
    ['Real GDP rises from 75 to 100 while the price level stays at 100','Real GDP falls from 75 to 50 while the price level stays at 125','Real GDP is unchanged at 75 and the price level falls from 150 to 100'],
    'The AD increase and AS decrease offset each other in output but reinforce each other on the price level.',secondary=['simultaneous_shifts'])
add('macroeconomic-equilibrium-and-shocks','ADAS-02','legendary','simultaneous_shifts','multi-step',
    'A student says the graph proves output must rise whenever aggregate demand increases. Which graph-based rebuttal is strongest?',
    'Not if aggregate supply falls at the same time: moving from A to C leaves real GDP unchanged at 75 while the price level rises sharply to 150',
    ['Yes, because point B shows that every AD increase always raises output no matter what happens to supply','No, because an AD increase always lowers the price level when supply shifts left','Yes, because simultaneous shifts cannot be analyzed with AD-AS graphs'],
    'Point B isolates the AD increase and point D isolates the AS decrease. Point C shows their combination, where the output effect is offset but inflation is amplified.',secondary=['movement_vs_shift'])

existing_ids=set()
for c in lib['concepts'].values():
    for arr in c.get('questions',{}).values():
        existing_ids.update(q.get('id') for q in arr)
    existing_ids.update(q.get('id') for q in c.get('repairQuestions',[]))
    existing_ids.update(q.get('id') for q in c.get('bridgeQuestions',[]))

code_map={'aggregate-demand':'AD','aggregate-supply':'AS','macroeconomic-equilibrium-and-shocks':'MEQ'}
pool_code={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L'}
objective_map={'aggregate-demand':'LO34.1','aggregate-supply':'LO34.2','macroeconomic-equilibrium-and-shocks':'LO34.3'}
tag_map={'aggregate-demand':'aggregate_demand','aggregate-supply':'aggregate_supply','macroeconomic-equilibrium-and-shocks':'ad_as_macro_equilibrium'}
cluster_map={'aggregate-demand':'macro_aggregate_demand','aggregate-supply':'macro_aggregate_supply','macroeconomic-equilibrium-and-shocks':'macro_equilibrium'}
counts=Counter(); newqs=[]
for idx,s in enumerate(specs):
    counts[(s['concept'],s['pool'])]+=1
    serial=counts[(s['concept'],s['pool'])]
    qid=f"PG3-{code_map[s['concept']]}-{pool_code[s['pool']]}-{serial:03d}"
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')
    pos=idx % 4
    opts=list(s['distractors']); opts.insert(pos,s['correct'])
    image=f"question-assets/{s['concept']}/{s['asset']}.webp"
    source_id=862000+idx
    source_hash=sha_text(json.dumps({'q':s['stem'],'options':opts,'image':image,'skill':s['skill']},sort_keys=True,ensure_ascii=False))
    role='elite' if s['pool']=='elite' else ('legendary' if s['pool']=='legendary' else 'main')
    secondary_ids=[]
    if s['concept']=='macroeconomic-equilibrium-and-shocks':
        secondary_ids=['aggregate-demand','aggregate-supply']
    q={
        'id':qid,'q':s['stem'],'options':opts,'tag':tag_map[s['concept']],'type':s['typ'],'objective':objective_map[s['concept']],
        'difficulty':s['pool'],'conceptCluster':cluster_map[s['concept']],'primarySkill':s['skill'],
        'secondarySkills':s['secondary'],'repairSkill':s['repair'],'commonError':s['common'],
        'feedback':s['feedback'],'image':image,'aHash':sha_answer(s['correct']),'canonicalId':qid,
        'sourceId':source_id,'sourceGame':'macro-concept-library','sourceChapter':[s['concept']],
        'sourcePool':s['pool'],'sourceHash':source_hash,'sourceOccurrences':[{
            'sourceGame':'macro-concept-library','sourceFile':PHASE,'sourceGlobal':'questions','sourcePool':s['pool'],
            'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],
        'primaryConceptId':s['concept'],'secondaryConceptIds':secondary_ids,'instructionalRole':role,
        'canonicalDifficulty':s['pool'],'originalSourcePool':s['pool'],'originalBossTier':None
    }
    lib['concepts'][s['concept']]['questions'][s['pool']].append(q)
    newqs.append(q)

(ROOT/f'{PHASE}_questions.json').write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

def concept_records(c):
    main=[q for arr in c['questions'].values() for q in arr]
    return main + c.get('repairQuestions',[]) + c.get('bridgeQuestions',[]) + c.get('repairSeedQuestions',[]), main

for cid in ['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks']:
    c=lib['concepts'][cid]
    records,main=concept_records(c)
    re=next(x for x in lib['registry']['concepts'] if x['canonicalConceptId']==cid)
    role_counts=Counter(q.get('instructionalRole','unknown') for q in records)
    for key in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']:
        role_counts.setdefault(key,0)
    re['questionCountByRole']={k:role_counts[k] for k in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']}
    diff_counts=Counter(q.get('canonicalDifficulty','unknown') or 'unknown' for q in records)
    re['questionCountByDifficulty']={k:diff_counts.get(k,0) for k in ['easy','medium','hard','elite','legendary','unknown']}
    re['repairCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in c.get('repairQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in main)}
    re['bridgeCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in c.get('bridgeQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in main)}
    re['calculationCoverage']=sum(q.get('type')=='calculation' for q in main)
    re['graphCoverage']=sum(bool(q.get('image')) for q in main)
    re['coverageFloorVersion']=PHASE
    if cid=='aggregate-demand':
        re['coverageStatusNote']='Phase Graph 3 adds two dedicated AD shift graphs that cover increase and decrease cases, direct quantity readings, shifter identification, and movement-versus-shift reasoning through Legendary.'
    elif cid=='aggregate-supply':
        re['coverageStatusNote']='Phase Graph 3 adds two dedicated AS shift graphs that cover increase and decrease cases, output/price effects, shifter identification, stagflation, and movement-versus-shift reasoning through Legendary.'
    else:
        re['coverageStatusNote']='Phase Graph 3 adds four AD-AS / AD-AS-LRAS graphs covering short-run equilibrium, long-run adjustment after AD shocks, positive supply-side growth, and simultaneous demand/supply shifts.'

_all_ids=[]
for _c in lib['concepts'].values():
    if 'questions' not in _c: continue
    for _arr in _c['questions'].values(): _all_ids.extend((q.get('canonicalId') or q.get('id')) for q in _arr)
    _all_ids.extend((q.get('canonicalId') or q.get('id')) for q in _c.get('repairQuestions',[]))
    _all_ids.extend((q.get('canonicalId') or q.get('id')) for q in _c.get('bridgeQuestions',[]))
    _all_ids.extend((q.get('canonicalId') or q.get('id')) for q in _c.get('repairSeedQuestions',[]))
lib['canonicalQuestionCount']=len(set(_all_ids))
lib['libraryVersion']=lib['libraryVersion']+'-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['generatedAt']=GEN
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Phase Graph 3: eight approved macro AD/AS assets plus 48 graph-dependent questions. Coverage emphasizes AD shifts, AS shifts, AD-AS short-run equilibrium, AD-AS-LRAS long-run adjustment, and simultaneous demand/supply shocks.'
lib['registry']['libraryVersion']=lib['libraryVersion']
lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']
lib['registry']['composerVersion']=lib.get('composerVersion',lib['registry'].get('composerVersion'))
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
lib['librarySha256']=sha_text(json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True))
lib['registry']['librarySha256']=lib['librarySha256']
save_library(lib)
REG.write_text(json.dumps(lib['registry'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
manifest={
 'assetCount':len(lib['assetInventory']),'assets':lib['assetInventory'],'conceptCount':lib['conceptCount'],
 'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],
 'librarySha256':lib['librarySha256'],'generatedAt':GEN
}
MAN.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
result={
 'phase':PHASE,'generatedAt':GEN,'newQuestionCount':len(newqs),
 'questionsByAsset':dict(Counter(Path(q['image']).stem for q in newqs)),
 'questionsByConcept':dict(Counter(q['primaryConceptId'] for q in newqs)),
 'questionsByDifficulty':dict(Counter(q['canonicalDifficulty'] for q in newqs)),
 'correctAnswerPositions':dict(Counter(next(i for i,opt in enumerate(q['options']) if sha_answer(opt)==q['aHash']) for q in newqs)),
 'newAssetCount':len(new_asset_meta),'globalAssetCount':len(lib['assetInventory']),
 'globalCanonicalQuestionCount':lib['canonicalQuestionCount'],'librarySha256':lib['librarySha256']
}
(ROOT/f'{PHASE}_results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
