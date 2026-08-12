import json, hashlib, unicodedata
from pathlib import Path
from collections import Counter
from PIL import Image

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseGraph4-money-market-ad-transmission-v1'
GEN='2026-08-12T17:45:00.000Z'
SOURCE_ASSETS={
    'MONEY-01': Path('/mnt/data/MONEY-01.png'),
    'MONEY-02': Path('/mnt/data/MONEY-02.png'),
    'MONEY-03': Path('/mnt/data/MONEY-03.png'),
    'MONEY-04': Path('/mnt/data/MONEY-04.png'),
    'MONEY-AD-01': Path('/mnt/data/MONEY-AD-01.png'),
    'MONEY-AD-02': Path('/mnt/data/MONEY-AD-02.png'),
    'MONEY-AD-03': Path('/mnt/data/MONEY-AD-03.png'),
}
ASSET_CONCEPT={
    'MONEY-01':'liquidity-preference-and-money-market',
    'MONEY-02':'liquidity-preference-and-money-market',
    'MONEY-03':'liquidity-preference-and-money-market',
    'MONEY-04':'liquidity-preference-and-money-market',
    'MONEY-AD-03':'liquidity-preference-and-money-market',
    'MONEY-AD-01':'monetary-policy-transmission',
    'MONEY-AD-02':'monetary-policy-transmission',
}
ASSET_TEXT={
'MONEY-01':{
'imageAlt':'Money market with downward-sloping money demand MD0 and vertical money supply MS0 intersecting at point A.',
'graphDescription':'The horizontal axis is quantity of money and the vertical axis is nominal interest rate. Money demand MD0 slopes downward from an interest rate of 12 at quantity 0 to 0 at quantity 200. Money supply MS0 is vertical at quantity 100. The curves intersect at point A, quantity of money 100 and nominal interest rate 6.'},
'MONEY-02':{
'imageAlt':'Money market showing an increase in money supply from MS0 at quantity 100 to MS1 at quantity 125, lowering the interest rate.',
'graphDescription':'The horizontal axis is quantity of money and the vertical axis is nominal interest rate. Money demand MD0 slopes downward from 12 at quantity 0 to 0 at quantity 150. Original money supply MS0 is vertical at quantity 100, where the equilibrium interest rate is 4. Dashed money supply MS1 is vertical at quantity 125, where the equilibrium interest rate is 2. The graph shows an increase in money supply lowering the equilibrium nominal interest rate by 2 percentage points.'},
'MONEY-03':{
'imageAlt':'Money market showing a decrease in money supply from MS0 at quantity 100 to MS1 at quantity 75, raising the interest rate.',
'graphDescription':'The horizontal axis is quantity of money and the vertical axis is nominal interest rate. Money demand MD0 slopes downward from 12 at quantity 0 to 0 at quantity 150. Original money supply MS0 is vertical at quantity 100, where the equilibrium interest rate is 4. Dashed money supply MS1 is vertical at quantity 75, where the equilibrium interest rate is 6. The graph shows a decrease in money supply raising the equilibrium nominal interest rate by 2 percentage points.'},
'MONEY-04':{
'imageAlt':'Money market with MD0 and MD1 plus MS0 and MS1, and labeled points A, B, C, and D showing separate and simultaneous money-demand and money-supply shifts.',
'graphDescription':'The horizontal axis is quantity of money and the vertical axis is nominal interest rate. Original money supply MS0 is vertical at quantity 75 and new money supply MS1 is vertical at quantity 100. Original money demand MD0 is the lower solid curve; new money demand MD1 is the upper dashed curve. Point B is the original equilibrium at quantity 75 and interest rate 3. With only money demand increasing, equilibrium moves to A at quantity 75 and interest rate 6. With only money supply increasing, equilibrium moves to D at quantity 100 and interest rate 1. With both shifts occurring, equilibrium is C at quantity 100 and interest rate 4.'},
'MONEY-AD-01':{
'imageAlt':'Two-panel expansionary monetary-policy graph linking an increase in money supply and lower interest rate to a rightward shift of aggregate demand.',
'graphDescription':'Left panel: money supply rises from MS0 at quantity 100 to MS1 at quantity 150 along fixed money demand MD0, moving equilibrium from point A at interest rate 6 to point B at interest rate 4. Right panel: aggregate demand shifts right from AD0 to AD1 along fixed SRAS, moving equilibrium from point A at real GDP 100 and price level 50 to point B at real GDP 125 and price level 56.25. The graph represents the expansionary monetary-policy transmission chain.'},
'MONEY-AD-02':{
'imageAlt':'Two-panel contractionary monetary-policy graph linking a decrease in money supply and higher interest rate to a leftward shift of aggregate demand.',
'graphDescription':'Left panel: original money supply MS0 is vertical at quantity 125, with equilibrium point A at nominal interest rate 2.75. Money supply decreases to dashed MS1 at quantity 100, moving equilibrium to point B at interest rate 4. Right panel: aggregate demand shifts left from AD0 to AD1 along fixed SRAS, moving equilibrium from point A at real GDP 125 and price level 50 to point B at real GDP 100 and price level 45. The graph represents the contractionary monetary-policy transmission chain.'},
'MONEY-AD-03':{
'imageAlt':'Two-panel graph linking an increase in money demand at fixed money supply to a higher interest rate and a leftward shift of aggregate demand.',
'graphDescription':'Left panel: money supply MS0 is fixed at quantity 75. Money demand increases from solid MD0 to dashed MD1, raising the equilibrium nominal interest rate from point A at 2 percent to point B at 4 percent. Right panel: aggregate demand shifts left from AD0 to AD1 along fixed SRAS, moving equilibrium from point A at real GDP 150 and price level 55 to point B at real GDP 105 and price level 45. The graph illustrates how higher money demand can raise interest rates, reduce interest-sensitive spending, and reduce aggregate demand when money supply is fixed.'},
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
new_asset_meta=[]
for name,src in SOURCE_ASSETS.items():
    if not src.exists(): raise FileNotFoundError(src)
    concept_id=ASSET_CONCEPT[name]
    outdir=ROOT/'data'/'question-assets'/concept_id
    outdir.mkdir(parents=True,exist_ok=True)
    out=outdir/f'{name}.webp'
    with Image.open(src) as im: im.convert('RGB').save(out,'WEBP',quality=94,method=6)
    meta={'conceptId':concept_id,'filename':out.name,
          'sourceAssetPath':f'question-assets/{concept_id}/{out.name}',
          'sourceUrl':f'data/question-assets/{concept_id}/{out.name}',
          'runtimePath':f'question-assets/{concept_id}/{out.name}',
          'sha256':sha_file(out),'sizeBytes':out.stat().st_size,**ASSET_TEXT[name]}
    new_asset_meta.append(meta)
    c=lib['concepts'][concept_id]
    c['assetMetadata']=[a for a in c.get('assetMetadata',[]) if a.get('filename')!=out.name]
    c['assets']=[a for a in c.get('assets',[]) if Path(a).name!=out.name]
    c['assetPaths']=[a for a in c.get('assetPaths',[]) if Path(a).name!=out.name]
    c['assetMetadata'].append(meta); c['assets'].append(meta['runtimePath']); c['assetPaths'].append(meta['runtimePath'])
new_paths={a['runtimePath'] for a in new_asset_meta}
lib['assetInventory']=[a for a in lib.get('assetInventory',[]) if a.get('runtimePath') not in new_paths]
lib['assetInventory'].extend(new_asset_meta)

specs=[]
def add(concept,asset,pool,skill,typ,stem,correct,distractors,feedback,secondary=None,repair=None,common='misreads_money_market_or_transmission'):
    specs.append(dict(concept=concept,asset=asset,pool=pool,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,secondary=secondary or [],repair=repair or skill,common=common))

# MONEY-01 baseline equilibrium
add('liquidity-preference-and-money-market','MONEY-01','easy','read_money_market_equilibrium','graph',
    'At point A in the money market, what is the equilibrium nominal interest rate?',
    '6 percent',['4 percent','8 percent','12 percent'],
    'Point A is where MD0 intersects MS0, at a nominal interest rate of 6 percent.')
add('liquidity-preference-and-money-market','MONEY-01','medium','read_money_market_equilibrium','graph',
    'At point A, what quantity of money clears the market?',
    '100',['50','150','200'],
    'The vertical money-supply curve MS0 is fixed at quantity 100, and MD0 intersects it at point A.')
add('liquidity-preference-and-money-market','MONEY-01','medium','identify_core_model','analysis',
    'Why is MS0 drawn as a vertical line in this standard money-market graph?',
    'The model treats the nominal money supply as fixed by the central bank at that moment',
    ['The interest rate is fixed by households rather than markets','Money demand does not respond to the interest rate','Real GDP is fixed at the full-employment level'],
    'In the standard liquidity-preference model, the central bank fixes the nominal quantity of money, so MS is vertical.')
add('liquidity-preference-and-money-market','MONEY-01','hard','money_demand_interest_rate','analysis',
    'The downward slope of MD0 means that, other things equal, a lower nominal interest rate is associated with what?',
    'A larger quantity of money demanded',['A smaller quantity of money demanded','A lower fixed money supply','A rightward shift of the money-supply curve'],
    'Holding other determinants fixed, lower interest rates reduce the opportunity cost of holding money, so quantity of money demanded rises.')
add('liquidity-preference-and-money-market','MONEY-01','elite','money_demand_shift_vs_movement','analysis',
    'A student says a fall in the interest rate from 8 percent to 6 percent would shift MD0 to the right. What is the best correction?',
    'A change in the interest rate causes a movement along MD0; it does not by itself shift the money-demand curve',
    ['Any interest-rate change shifts money demand because interest is on the vertical axis','The change shifts money supply, not money demand','The graph cannot distinguish movements from shifts'],
    'The interest rate is the price variable on the money-demand curve. Changing it moves the economy along MD0.')
add('liquidity-preference-and-money-market','MONEY-01','legendary','money_market_disequilibrium','analysis',
    'Suppose the nominal interest rate were temporarily above the 6-percent equilibrium while MS0 remained fixed. What adjustment pressure would the model predict?',
    'An excess supply of money would push the interest rate downward toward 6 percent',
    ['An excess demand for money would push the interest rate higher','Money supply would automatically shift right until the interest rate rose','Real GDP would fall until the money-supply curve became horizontal'],
    'Above equilibrium, the quantity of money demanded is less than the fixed money supply. Portfolio adjustment pushes the interest rate back down toward equilibrium.')

# MONEY-02 expansionary MS
add('liquidity-preference-and-money-market','MONEY-02','easy','read_money_market_shift','graph',
    'The money-supply curve moves from MS0 at 100 to MS1 at 125. What happens to the equilibrium nominal interest rate?',
    'It falls from 4 percent to 2 percent',['It rises from 2 percent to 4 percent','It stays at 4 percent','It falls from 6 percent to 4 percent'],
    'With money demand fixed, the larger money supply moves equilibrium down MD0 from 4 percent to 2 percent.')
add('liquidity-preference-and-money-market','MONEY-02','medium','predict_money_market_equilibrium','graph',
    'By how much does the quantity of money supplied increase when MS0 shifts to MS1?',
    '25',['2','50','125'],
    'Money supply increases from 100 to 125, a rise of 25 units.')
add('liquidity-preference-and-money-market','MONEY-02','medium','identify_shift_result','analysis',
    'Which central-bank action is most consistent with the shift from MS0 to MS1?',
    'An expansionary action that increases the money supply',['A contractionary action that decreases the money supply','A rise in real income that shifts money demand right','A higher price level that shifts money demand right'],
    'The graph shows a rightward shift of the vertical money-supply curve, which is expansionary.')
add('liquidity-preference-and-money-market','MONEY-02','hard','predict_money_market_equilibrium','calculation',
    'What is the change in the equilibrium nominal interest rate when money supply rises from 100 to 125?',
    'A decrease of 2 percentage points',['An increase of 2 percentage points','A decrease of 25 percentage points','No change'],
    'The equilibrium interest rate falls from 4 percent to 2 percent, a 2-percentage-point decrease.')
add('liquidity-preference-and-money-market','MONEY-02','elite','money_demand_shift_vs_movement','analysis',
    'A student says the fall in the interest rate from 4 percent to 2 percent proves money demand shifted left. What does the graph actually show?',
    'Money demand stays at MD0; the economy moves along MD0 because money supply shifts right',
    ['Money demand shifts left while money supply stays fixed','Both money demand and money supply shift right','The interest-rate decline occurs with no change in either curve'],
    'MD0 is unchanged. The new equilibrium is reached by moving along the same money-demand curve after MS shifts right.')
add('liquidity-preference-and-money-market','MONEY-02','legendary','bridge_money_market_transmission','analysis',
    'If this money-market shift were the first step of expansionary monetary policy, which downstream effect would normally come next?',
    'Lower interest rates would tend to increase interest-sensitive spending and push aggregate demand to the right',
    ['Lower interest rates would reduce investment and shift aggregate demand left','Higher interest rates would increase saving and shift aggregate demand right','The money-market change would have no possible link to aggregate demand'],
    'The standard transmission channel runs from more money to lower interest rates to more interest-sensitive spending and higher aggregate demand.',secondary=['monetary_policy_transmission'])

# MONEY-03 contractionary MS
add('liquidity-preference-and-money-market','MONEY-03','easy','read_money_market_shift','graph',
    'The money-supply curve moves from MS0 at 100 to MS1 at 75. What happens to the equilibrium nominal interest rate?',
    'It rises from 4 percent to 6 percent',['It falls from 6 percent to 4 percent','It stays at 4 percent','It rises from 2 percent to 4 percent'],
    'With money demand fixed, the smaller money supply moves equilibrium up MD0 from 4 percent to 6 percent.')
add('liquidity-preference-and-money-market','MONEY-03','medium','predict_money_market_equilibrium','graph',
    'By how much does the quantity of money supplied decrease when MS0 shifts to MS1?',
    '25',['2','50','75'],
    'Money supply falls from 100 to 75, a decrease of 25 units.')
add('liquidity-preference-and-money-market','MONEY-03','medium','identify_shift_result','analysis',
    'Which central-bank action is most consistent with the shift from MS0 to MS1?',
    'A contractionary action that decreases the money supply',['An expansionary action that increases the money supply','A fall in real income that shifts money demand left','A lower price level that shifts money demand left'],
    'The graph shows a leftward shift of the vertical money-supply curve, which is contractionary.')
add('liquidity-preference-and-money-market','MONEY-03','hard','predict_money_market_equilibrium','calculation',
    'What is the change in the equilibrium nominal interest rate when money supply falls from 100 to 75?',
    'An increase of 2 percentage points',['A decrease of 2 percentage points','An increase of 25 percentage points','No change'],
    'The equilibrium interest rate rises from 4 percent to 6 percent, a 2-percentage-point increase.')
add('liquidity-preference-and-money-market','MONEY-03','elite','money_demand_shift_vs_movement','analysis',
    'A student says the rise in the interest rate from 4 percent to 6 percent proves money demand shifted right. What does the graph actually show?',
    'Money demand stays at MD0; the economy moves along MD0 because money supply shifts left',
    ['Money demand shifts right while money supply stays fixed','Both money demand and money supply shift left','The interest-rate increase occurs with no curve movement'],
    'MD0 is unchanged. The higher interest rate comes from the smaller money supply, causing a movement along MD0.')
add('liquidity-preference-and-money-market','MONEY-03','legendary','bridge_money_market_transmission','analysis',
    'If this money-market shift were the first step of contractionary monetary policy, which downstream effect would normally follow?',
    'Higher interest rates would tend to reduce interest-sensitive spending and push aggregate demand to the left',
    ['Higher interest rates would increase investment and shift aggregate demand right','Lower interest rates would reduce saving and shift aggregate demand left','The money-market change could not affect aggregate demand'],
    'The standard contractionary chain runs from less money to higher interest rates to less interest-sensitive spending and lower aggregate demand.',secondary=['monetary_policy_transmission'])

# MONEY-04 simultaneous shifts
add('liquidity-preference-and-money-market','MONEY-04','easy','simultaneous_money_shifts','graph',
    'Which labeled point is the original equilibrium where MD0 intersects MS0?',
    'Point B',['Point A','Point C','Point D'],
    'The original curves MD0 and MS0 intersect at point B, quantity 75 and interest rate 3.')
add('liquidity-preference-and-money-market','MONEY-04','medium','read_money_market_shift','graph',
    'If only money demand increases from MD0 to MD1 while MS0 stays fixed, which point becomes the new equilibrium?',
    'Point A',['Point B','Point C','Point D'],
    'Holding MS0 at 75, the higher MD1 curve intersects it at point A, interest rate 6.')
add('liquidity-preference-and-money-market','MONEY-04','medium','read_money_market_shift','graph',
    'If only money supply increases from MS0 to MS1 while MD0 stays fixed, which point becomes the new equilibrium?',
    'Point D',['Point A','Point B','Point C'],
    'Holding MD0 fixed, the larger MS1 intersects it at point D, quantity 100 and interest rate 1.')
add('liquidity-preference-and-money-market','MONEY-04','hard','simultaneous_money_shifts','graph',
    'If money demand increases from MD0 to MD1 at the same time money supply increases from MS0 to MS1, which point is the resulting equilibrium?',
    'Point C',['Point A','Point B','Point D'],
    'The simultaneous shifts produce the intersection of MD1 and MS1, point C.')
add('liquidity-preference-and-money-market','MONEY-04','elite','money_market_offsetting_shifts','analysis',
    'Compare original point B with simultaneous-shift point C. What happens to quantity of money and the nominal interest rate?',
    'Quantity rises from 75 to 100 while the interest rate rises from 3 percent to 4 percent',
    ['Quantity rises from 75 to 100 while the interest rate falls from 3 percent to 1 percent','Quantity stays at 75 while the interest rate rises from 3 percent to 6 percent','Quantity falls from 100 to 75 while the interest rate falls from 4 percent to 3 percent'],
    'The increase in money supply raises equilibrium quantity, while the simultaneous increase in money demand is strong enough to leave the interest rate one point higher than at B.')
add('liquidity-preference-and-money-market','MONEY-04','legendary','infer_money_supply_offset','multi-step',
    'Money demand rises from MD0 to MD1. Which central-bank response shown partially offsets the interest-rate increase without restoring the original 3-percent rate?',
    'Increase money supply from MS0 to MS1, moving the outcome from A at 6 percent to C at 4 percent',
    ['Decrease money supply from MS1 to MS0, moving the outcome from C to A','Keep money supply at MS0, which moves the outcome from B to D','Shift money demand back to MD0 while reducing money supply, moving from A to C'],
    'The demand increase alone raises the rate from B to A. Expanding money supply then lowers it from 6 to 4 percent at C, partially but not fully offsetting the increase.')

# MONEY-AD-03 demand-side money-market shock linked to AD
add('liquidity-preference-and-money-market','MONEY-AD-03','easy','trace_money_demand_shift_to_investment','graph',
    'In the left panel, money demand rises from MD0 to MD1 while MS0 stays fixed. What happens to the nominal interest rate?',
    'It rises from 2 percent to 4 percent',['It falls from 4 percent to 2 percent','It stays at 2 percent','It rises from 4 percent to 6 percent'],
    'With fixed money supply, the higher money-demand curve raises the equilibrium interest rate from point A to point B.')
add('liquidity-preference-and-money-market','MONEY-AD-03','medium','connect_money_market_to_ad_slope','graph',
    'Which change in the right panel accompanies the higher interest rate shown in the money market?',
    'Aggregate demand shifts left from AD0 to AD1',['Aggregate demand shifts right from AD1 to AD0','SRAS shifts left while aggregate demand stays fixed','LRAS shifts right'],
    'The graph links the higher interest rate to lower interest-sensitive spending and a leftward shift of aggregate demand.')
add('liquidity-preference-and-money-market','MONEY-AD-03','medium','trace_money_demand_shift_to_investment','analysis',
    'What transmission link connects the left-panel rise in the interest rate to the right-panel fall in aggregate demand?',
    'Higher interest rates reduce interest-sensitive spending such as investment',
    ['Higher interest rates directly increase the money supply','Higher interest rates raise potential output and shift LRAS right','Higher interest rates reduce SRAS by raising all input prices one-for-one'],
    'The standard link is through interest-sensitive components of spending, especially investment.')
add('liquidity-preference-and-money-market','MONEY-AD-03','hard','trace_money_demand_shift_to_investment','calculation',
    'Across the two panels, real GDP falls from 150 to 105. By how much does real GDP decrease?',
    '45',['20','35','55'],
    'Real GDP falls by 150 - 105 = 45.')
add('liquidity-preference-and-money-market','MONEY-AD-03','elite','connect_money_market_to_ad_slope','analysis',
    'A student says the money-demand increase should shift aggregate demand right because people want to hold more money. What is the strongest correction using the graph?',
    'With money supply fixed, greater money demand raises the interest rate; the higher rate discourages interest-sensitive spending, so AD shifts left',
    ['Greater money demand automatically creates more money and lowers the interest rate','Money demand and aggregate demand are the same curve, so both must shift in the same direction','The money market has no connection to spending or aggregate demand'],
    'Money demand is demand for liquid balances, not aggregate expenditure. With fixed supply, more money demand raises the interest rate and can reduce spending.')
add('liquidity-preference-and-money-market','MONEY-AD-03','legendary','connect_money_market_to_ad_slope','multi-step',
    'Which complete chain is consistent with the two-panel graph?',
    'MD rises with MS fixed → interest rate rises from 2% to 4% → interest-sensitive spending falls → AD shifts left → real GDP and price level fall',
    ['MD rises → interest rate falls → investment rises → AD shifts right → real GDP falls','MS rises → interest rate rises → investment falls → AD shifts left → price level rises','MD falls → interest rate rises → investment rises → AD shifts right → real GDP rises'],
    'The panels show the full liquidity-preference transmission from a money-demand increase to a higher rate and lower aggregate demand.')

# MONEY-AD-01 expansionary monetary policy
add('monetary-policy-transmission','MONEY-AD-01','easy','trace_expansionary_monetary_policy_graph','graph',
    'The left panel shows money supply increasing from MS0 to MS1. What happens to the nominal interest rate?',
    'It falls from 6 percent to 4 percent',['It rises from 4 percent to 6 percent','It stays at 6 percent','It falls from 6 percent to 2 percent'],
    'The increase in money supply moves the money-market equilibrium from A at 6 percent to B at 4 percent.')
add('monetary-policy-transmission','MONEY-AD-01','medium','monetary_policy_ad_shift','graph',
    'Which aggregate-demand change accompanies the lower interest rate in the right panel?',
    'AD shifts right from AD0 to AD1',['AD shifts left from AD1 to AD0','SRAS shifts right while AD stays fixed','LRAS shifts left'],
    'The lower interest rate stimulates interest-sensitive spending, shifting aggregate demand right.')
add('monetary-policy-transmission','MONEY-AD-01','medium','read_output_change_from_ad_shift','calculation',
    'Real GDP rises from 100 at point A to 125 at point B. By how much does real GDP increase?',
    '25',['6.25','50','125'],
    'The change in real GDP is 125 - 100 = 25.')
add('monetary-policy-transmission','MONEY-AD-01','hard','trace_expansionary_monetary_policy_graph','multi-step',
    'Which sequence correctly describes the expansionary policy shown?',
    'Money supply rises → interest rate falls → interest-sensitive spending rises → AD shifts right → output and price level rise',
    ['Money supply rises → interest rate rises → spending falls → AD shifts left','Money supply falls → interest rate falls → spending rises → AD shifts right','Money demand rises → interest rate falls → SRAS shifts right'],
    'That is the standard expansionary monetary-policy transmission chain represented by the two panels.')
add('monetary-policy-transmission','MONEY-AD-01','elite','distinguish_money_market_and_ad_model','analysis',
    'Which statement correctly distinguishes what changes in the two panels?',
    'The left panel shows a shift of money supply and a movement along money demand; the right panel shows a shift of aggregate demand along a fixed SRAS',
    ['Both panels show movements along unchanged demand curves','The left panel shows AD shifting right while the right panel shows money demand shifting left','Both panels show SRAS shifting because interest rates changed'],
    'Different markets are being linked. Money supply shifts first; the resulting rate change affects spending and shifts AD.')
add('monetary-policy-transmission','MONEY-AD-01','legendary','read_graph_and_evaluate_transmission_size','multi-step',
    'The policy lowers the interest rate by 2 percentage points and moves real GDP from 100 to 125. What does the graph establish without claiming more than it shows?',
    'In this illustrated transmission, expansionary monetary policy is associated with a 25-unit rise in real GDP and a higher price level',
    ['Every 1-point interest-rate cut always raises real GDP by exactly 12.5 in every economy','The graph proves LRAS increased by 25 because real GDP rose','The money-supply increase raises output without affecting the price level'],
    'The graph supports the specific illustrated changes. It does not establish a universal fixed coefficient between interest rates and GDP.')

# MONEY-AD-02 contractionary monetary policy
add('monetary-policy-transmission','MONEY-AD-02','easy','trace_contractionary_monetary_policy_graph','graph',
    'The left panel shows money supply decreasing from MS0 to MS1. What happens to the nominal interest rate?',
    'It rises from 2.75 percent to 4 percent',['It falls from 4 percent to 2.75 percent','It stays at 2.75 percent','It rises from 4 percent to 6 percent'],
    'The smaller money supply moves equilibrium from A at 2.75 percent to B at 4 percent.')
add('monetary-policy-transmission','MONEY-AD-02','medium','monetary_policy_ad_shift','graph',
    'Which aggregate-demand change accompanies the higher interest rate in the right panel?',
    'AD shifts left from AD0 to AD1',['AD shifts right from AD1 to AD0','SRAS shifts left while AD stays fixed','LRAS shifts right'],
    'The higher interest rate reduces interest-sensitive spending, shifting aggregate demand left.')
add('monetary-policy-transmission','MONEY-AD-02','medium','read_output_change_from_ad_shift','calculation',
    'Real GDP falls from 125 at point A to 100 at point B. By how much does real GDP decrease?',
    '25',['5','45','125'],
    'The change in real GDP is 125 - 100 = 25.')
add('monetary-policy-transmission','MONEY-AD-02','hard','trace_contractionary_monetary_policy_graph','multi-step',
    'Which sequence correctly describes the contractionary policy shown?',
    'Money supply falls → interest rate rises → interest-sensitive spending falls → AD shifts left → output and price level fall',
    ['Money supply falls → interest rate falls → spending rises → AD shifts right','Money supply rises → interest rate rises → spending falls → AD shifts left','Money demand falls → interest rate rises → SRAS shifts left'],
    'That is the standard contractionary monetary-policy transmission chain shown across the two panels.')
add('monetary-policy-transmission','MONEY-AD-02','elite','distinguish_money_market_and_ad_model','analysis',
    'A student says AD1 is lower because the central bank directly reduced real GDP. What is the better interpretation?',
    'The central bank reduces money supply, the interest rate rises, interest-sensitive spending falls, and that spending change shifts AD left',
    ['The central bank directly sets real GDP at 100 by moving the AD curve','The central bank shifts SRAS left first, which then lowers money demand','The interest-rate increase is caused by a rightward shift of money demand, not by money supply'],
    'Monetary policy works through a transmission mechanism. The central bank acts on money/financial conditions, which influence spending and AD.')
add('monetary-policy-transmission','MONEY-AD-02','legendary','read_graph_and_evaluate_transmission_size','multi-step',
    'The policy raises the interest rate from 2.75 percent to 4 percent and moves real GDP from 125 to 100. What is the strongest conclusion supported by the graph?',
    'In this illustrated contractionary transmission, higher interest rates are associated with a 25-unit fall in real GDP and a lower price level',
    ['Every 1.25-point interest-rate increase always lowers GDP by exactly 25 in all economies','The graph proves LRAS fell from 125 to 100','The contraction lowers output but necessarily raises the price level'],
    'The graph supports the specific policy chain and depicted outcomes, not a universal mechanical coefficient.')

existing_ids=set()
for c in lib['concepts'].values():
    for arr in c.get('questions',{}).values(): existing_ids.update(q.get('id') for q in arr)
    existing_ids.update(q.get('id') for q in c.get('repairQuestions',[])); existing_ids.update(q.get('id') for q in c.get('bridgeQuestions',[]))
code_map={'liquidity-preference-and-money-market':'MM','monetary-policy-transmission':'MPT'}
pool_code={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L'}
objective_map={'liquidity-preference-and-money-market':'LO35.1','monetary-policy-transmission':'LO35.2'}
tag_map={'liquidity-preference-and-money-market':'money_market','monetary-policy-transmission':'monetary_policy_transmission'}
cluster_map={'liquidity-preference-and-money-market':'money_market','monetary-policy-transmission':'monetary_policy'}
counts=Counter(); newqs=[]
for idx,s in enumerate(specs):
    counts[(s['concept'],s['pool'])]+=1; serial=counts[(s['concept'],s['pool'])]
    qid=f"PG4-{code_map[s['concept']]}-{pool_code[s['pool']]}-{serial:03d}"
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')
    pos=idx%4; opts=list(s['distractors']); opts.insert(pos,s['correct'])
    image=f"question-assets/{s['concept']}/{s['asset']}.webp"
    source_id=863000+idx
    source_hash=sha_text(json.dumps({'q':s['stem'],'options':opts,'image':image,'skill':s['skill']},sort_keys=True,ensure_ascii=False))
    role='elite' if s['pool']=='elite' else ('legendary' if s['pool']=='legendary' else 'main')
    secondary_ids=[]
    if s['concept']=='monetary-policy-transmission': secondary_ids=['liquidity-preference-and-money-market','aggregate-demand','macroeconomic-equilibrium-and-shocks']
    elif s['asset']=='MONEY-AD-03': secondary_ids=['aggregate-demand','macroeconomic-equilibrium-and-shocks']
    q={'id':qid,'q':s['stem'],'options':opts,'tag':tag_map[s['concept']],'type':s['typ'],'objective':objective_map[s['concept']],
       'difficulty':s['pool'],'conceptCluster':cluster_map[s['concept']],'primarySkill':s['skill'],'secondarySkills':s['secondary'],
       'repairSkill':s['repair'],'commonError':s['common'],'feedback':s['feedback'],'image':image,'aHash':sha_answer(s['correct']),
       'canonicalId':qid,'sourceId':source_id,'sourceGame':'macro-concept-library','sourceChapter':[s['concept']],
       'sourcePool':s['pool'],'sourceHash':source_hash,'sourceOccurrences':[{'sourceGame':'macro-concept-library','sourceFile':PHASE,
       'sourceGlobal':'questions','sourcePool':s['pool'],'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],
       'primaryConceptId':s['concept'],'secondaryConceptIds':secondary_ids,'instructionalRole':role,'canonicalDifficulty':s['pool'],
       'originalSourcePool':s['pool'],'originalBossTier':None}
    lib['concepts'][s['concept']]['questions'][s['pool']].append(q); newqs.append(q)

(ROOT/f'{PHASE}_questions.json').write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

def concept_records(c):
    main=[q for arr in c['questions'].values() for q in arr]
    return main+c.get('repairQuestions',[])+c.get('bridgeQuestions',[])+c.get('repairSeedQuestions',[]),main
for cid in ['liquidity-preference-and-money-market','monetary-policy-transmission']:
    c=lib['concepts'][cid]; records,main=concept_records(c)
    re=next(x for x in lib['registry']['concepts'] if x['canonicalConceptId']==cid)
    role_counts=Counter(q.get('instructionalRole','unknown') for q in records)
    for k in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']: role_counts.setdefault(k,0)
    re['questionCountByRole']={k:role_counts[k] for k in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']}
    dc=Counter(q.get('canonicalDifficulty','unknown') or 'unknown' for q in records)
    re['questionCountByDifficulty']={k:dc.get(k,0) for k in ['easy','medium','hard','elite','legendary','unknown']}
    re['repairCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in c.get('repairQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in main)}
    re['bridgeCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in c.get('bridgeQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in main)}
    re['calculationCoverage']=sum(q.get('type')=='calculation' for q in main); re['graphCoverage']=sum(bool(q.get('image')) for q in main)
    re['coverageFloorVersion']=PHASE
    if cid=='liquidity-preference-and-money-market':
        re['coverageStatusNote']='Phase Graph 4 adds four dedicated money-market graphs plus a linked money-demand/AD graph, covering equilibrium, expansionary and contractionary money-supply shifts, simultaneous money shifts, and liquidity-preference transmission to aggregate demand.'
    else:
        re['coverageStatusNote']='Phase Graph 4 adds linked expansionary and contractionary money-market/AD panels that trace the full monetary-policy transmission sequence from money supply through interest rates to aggregate demand, output, and the price level.'
_all=[]
for c in lib['concepts'].values():
    if 'questions' not in c: continue
    for arr in c['questions'].values(): _all.extend((q.get('canonicalId') or q.get('id')) for q in arr)
    _all.extend((q.get('canonicalId') or q.get('id')) for q in c.get('repairQuestions',[])); _all.extend((q.get('canonicalId') or q.get('id')) for q in c.get('bridgeQuestions',[])); _all.extend((q.get('canonicalId') or q.get('id')) for q in c.get('repairSeedQuestions',[]))
lib['canonicalQuestionCount']=len(set(_all)); lib['libraryVersion']=lib['libraryVersion']+'-'+PHASE
lib['sourceCurationPhase']=PHASE; lib['sourceGeneratedAt']=GEN; lib['generatedAt']=GEN
lib['registry']['generatedAt']=GEN; lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Phase Graph 4: seven approved money-market and money-market-to-AD assets plus 42 graph-dependent questions. Coverage emphasizes money-market equilibrium, money-supply expansion/contraction, simultaneous money shifts, and monetary transmission to aggregate demand.'
lib['registry']['libraryVersion']=lib['libraryVersion']; lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']; lib['registry']['composerVersion']=lib.get('composerVersion',lib['registry'].get('composerVersion'))
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}; lib['librarySha256']=sha_text(json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True)); lib['registry']['librarySha256']=lib['librarySha256']
save_library(lib); REG.write_text(json.dumps(lib['registry'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
MAN.write_text(json.dumps({'assetCount':len(lib['assetInventory']),'assets':lib['assetInventory'],'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
result={'phase':PHASE,'generatedAt':GEN,'newQuestionCount':len(newqs),'questionsByAsset':dict(Counter(Path(q['image']).stem for q in newqs)),'questionsByConcept':dict(Counter(q['primaryConceptId'] for q in newqs)),'questionsByDifficulty':dict(Counter(q['canonicalDifficulty'] for q in newqs)),'correctAnswerPositions':dict(Counter(next(i for i,opt in enumerate(q['options']) if sha_answer(opt)==q['aHash']) for q in newqs)),'newAssetCount':len(new_asset_meta),'globalAssetCount':len(lib['assetInventory']),'globalCanonicalQuestionCount':lib['canonicalQuestionCount'],'librarySha256':lib['librarySha256']}
(ROOT/f'{PHASE}_results.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8'); print(json.dumps(result,indent=2))
