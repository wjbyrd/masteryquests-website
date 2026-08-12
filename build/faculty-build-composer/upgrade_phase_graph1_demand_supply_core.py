import json, hashlib, shutil
from pathlib import Path
from collections import Counter
from PIL import Image

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseGraph1-demand-supply-core-v1'
GEN='2026-08-12T13:38:00.000Z'
SOURCE_ASSETS={
    'DEMAND-01': Path('/mnt/data/DEMAND-01.png'),
    'DEMAND-02': Path('/mnt/data/DEMAND-02.png'),
    'DEMAND-03': Path('/mnt/data/DEMAND-03.png'),
    'SUPPLY-01': Path('/mnt/data/SUPPLY-01.png'),
    'SUPPLY-02': Path('/mnt/data/SUPPLY-02.png'),
    'SUPPLY-03': Path('/mnt/data/SUPPLY-03.png'),
    'DEMAND-SUPPLY-01': Path('/mnt/data/DEMAND-SUPPLY-01.png'),
    'DEMAND-SUPPLY-02': Path('/mnt/data/DEMAND-SUPPLY-02.png'),
}
ASSET_CONCEPT={
    'DEMAND-01':'demand','DEMAND-02':'demand','DEMAND-03':'demand',
    'SUPPLY-01':'supply','SUPPLY-02':'supply','SUPPLY-03':'supply',
    'DEMAND-SUPPLY-01':'market-equilibrium','DEMAND-SUPPLY-02':'market-equilibrium'
}
ASSET_TEXT={
'DEMAND-01':{
 'imageAlt':'Downward-sloping demand curve for gourmet donuts with labeled points A and B.',
 'graphDescription':'The horizontal axis is quantity of gourmet donuts in thousands and the vertical axis is price of gourmet donuts. A downward-sloping demand curve runs from about price $14 at quantity 0 to quantity 350 thousand at price $0. Point A is at quantity 100 thousand and price $10. Point B is at quantity 225 thousand and price $5.'},
'DEMAND-02':{
 'imageAlt':'Two parallel downward-sloping demand curves for coffee labeled D0 and D1.',
 'graphDescription':'The horizontal axis is quantity of coffee in thousands and the vertical axis is price of coffee. D0 is the original demand curve and D1 is a parallel curve to its right. At price $10, D0 shows quantity 50 thousand and D1 shows quantity 125 thousand. At price $6, D0 shows quantity 150 thousand and D1 shows quantity 225 thousand. D1 represents 75 thousand more units demanded than D0 at each common price shown.'},
'DEMAND-03':{
 'imageAlt':'Two parallel downward-sloping demand curves for tea labeled D0 and D1.',
 'graphDescription':'The horizontal axis is quantity of tea in thousands and the vertical axis is price of tea. D0 is the original demand curve and D1 is a parallel curve to its left. At price $4, D0 shows quantity 200 thousand and D1 shows quantity 100 thousand. At price $6, D0 shows quantity 150 thousand and D1 shows quantity 50 thousand. D1 represents 100 thousand fewer units demanded than D0 at each common price shown.'},
'SUPPLY-01':{
 'imageAlt':'Upward-sloping supply curve for coffee with labeled points A and B.',
 'graphDescription':'The horizontal axis is quantity of coffee in thousands and the vertical axis is price of coffee. A single upward-sloping supply curve is shown. Point A is at quantity 100 thousand and price $6. Point B is at quantity 225 thousand and price $11. At price $8 the curve passes through quantity 150 thousand.'},
'SUPPLY-02':{
 'imageAlt':'Two parallel upward-sloping supply curves for hamburgers labeled S0 and S1.',
 'graphDescription':'The horizontal axis is quantity of hamburgers in thousands and the vertical axis is price of hamburgers. S0 is the original supply curve and S1 is a parallel curve to its left and above. At price $9, S0 shows quantity 200 thousand and S1 shows quantity 100 thousand. At price $13, S0 shows quantity 300 thousand and S1 shows quantity 200 thousand. S1 represents 100 thousand fewer units supplied than S0 at each common price shown.'},
'SUPPLY-03':{
 'imageAlt':'Two parallel upward-sloping supply curves for tacos labeled S0 and S1, with points A and B on S0.',
 'graphDescription':'The horizontal axis is quantity of tacos in thousands and the vertical axis is price of tacos. S0 is the original upward-sloping supply curve; S1 is a parallel curve below and to the right. Point A on S0 is at quantity 100 thousand and price $3. Point B on S0 is at quantity 225 thousand and price $4. At price $3, S1 shows quantity 225 thousand, so the shift from S0 to S1 adds 125 thousand units supplied at that price.'},
'DEMAND-SUPPLY-01':{
 'imageAlt':'Gas market with one downward-sloping demand curve D0 and one upward-sloping supply curve S0.',
 'graphDescription':'The horizontal axis is quantity of gas in thousands of gallons and the vertical axis is price of gas per gallon. D0 slopes downward from price $6 at quantity 0 to quantity 300 thousand at price $0. S0 slopes upward from the origin to price $6 at quantity 300 thousand. The curves intersect at price $3 and quantity 150 thousand. At price $2, quantity demanded is 200 thousand and quantity supplied is 100 thousand. At price $4, quantity demanded is 100 thousand and quantity supplied is 200 thousand.'},
'DEMAND-SUPPLY-02':{
 'imageAlt':'Gas market with original curves D0 and S0 and shifted curves D1 and S1.',
 'graphDescription':'The horizontal axis is quantity of gas in thousands and the vertical axis is price of gas. Original demand D0 and original supply S0 intersect at price $3 and quantity 150 thousand. Demand shifts right to D1 while supply shifts left to S1. D1 and S1 intersect at price $5 and quantity 150 thousand. Holding S0 fixed, D1 intersects S0 at price $4 and quantity 200 thousand. Holding D0 fixed, S1 intersects D0 at price $4 and quantity 100 thousand.'},
}

def sha_text(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()
def normalize_answer(s): return ' '.join(__import__('unicodedata').normalize('NFKC', str(s)).strip().split()).lower()
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

# Install eight approved graphs as canonical WebP assets while preserving existing assets.
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
        'sha256':sha_file(out),'sizeBytes':out.stat().st_size,
        **ASSET_TEXT[name]
    }
    new_asset_meta.append(meta)
    concept=lib['concepts'][concept_id]
    # Replace same-name asset if rerun; otherwise append.
    concept['assetMetadata']=[a for a in concept.get('assetMetadata',[]) if a.get('filename')!=out.name]
    concept['assets']=[a for a in concept.get('assets',[]) if Path(a).name!=out.name]
    concept['assetPaths']=[a for a in concept.get('assetPaths',[]) if Path(a).name!=out.name]
    concept['assetMetadata'].append(meta)
    concept['assets'].append(meta['runtimePath'])
    concept['assetPaths'].append(meta['runtimePath'])
lib['assetInventory']=[a for a in lib.get('assetInventory',[]) if a.get('filename') not in SOURCE_ASSETS and Path(a.get('filename','')).stem not in SOURCE_ASSETS]
# Safer de-dup by runtime path as well.
new_paths={a['runtimePath'] for a in new_asset_meta}
lib['assetInventory']=[a for a in lib['assetInventory'] if a.get('runtimePath') not in new_paths]
lib['assetInventory'].extend(new_asset_meta)

specs=[]
def add(concept,asset,pool,skill,typ,stem,correct,distractors,feedback,secondary=None,repair=None,common='misreads_graph_or_confuses_shift_with_movement'):
    specs.append(dict(concept=concept,asset=asset,pool=pool,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,secondary=secondary or [],repair=repair or skill,common=common))

# -------------------- DEMAND-01: movement along a single demand curve --------------------
add('demand','DEMAND-01','easy','demand_schedule_interpretation','graph',
    'On the displayed gourmet-donut demand curve, what price and quantity are shown at point A?',
    '$10 and 100 thousand donuts',['$5 and 225 thousand donuts','$10 and 225 thousand donuts','$14 and 100 thousand donuts'],
    'Point A is plotted at a price of $10 and a quantity demanded of 100 thousand donuts.')
add('demand','DEMAND-01','medium','movement_vs_demand_shift','interpretation',
    'The market moves from point A to point B on the displayed demand curve. What is the most precise description?',
    'Price falls and quantity demanded increases along the same demand curve',['Demand increases and the curve shifts right','Price falls and demand decreases','Supply increases while demand stays fixed'],
    'A and B lie on the same demand curve. The lower price is associated with a larger quantity demanded, so this is a movement along demand, not a shift.',secondary=['law_of_demand'])
add('demand','DEMAND-01','medium','demand_schedule_interpretation','calculation',
    'Moving from point A to point B on the displayed demand curve changes quantity demanded by:',
    'An increase of 125 thousand donuts',['A decrease of 125 thousand donuts','An increase of 5 thousand donuts','An increase of 225 thousand donuts'],
    'Quantity demanded rises from 100 thousand at A to 225 thousand at B, an increase of 125 thousand.')
add('demand','DEMAND-01','hard','law_of_demand','calculation',
    'Using points A and B on the displayed linear demand curve, a $1 decrease in price is associated with approximately what change in quantity demanded?',
    'An increase of 25 thousand donuts',['A decrease of 25 thousand donuts','An increase of 5 thousand donuts','An increase of 125 thousand donuts'],
    'From A to B, price falls by $5 while quantity demanded rises by 125 thousand. That is 25 thousand additional donuts per $1 decrease in price.',secondary=['demand_schedule_interpretation'])
add('demand','DEMAND-01','elite','movement_vs_demand_shift','analysis',
    'Suppose the only change in the gourmet-donut market is that the good\'s own price falls from $10 to $5. The displayed graph shows the market moving from A to B. Which conclusion is correct?',
    'Quantity demanded rises by 125 thousand, but demand itself does not shift',['Demand rises by 125 thousand because buyers move to B','Demand shifts right because the price is lower','Quantity demanded falls because movement is down the curve'],
    'A change in the good\'s own price causes a movement along a fixed demand curve. Quantity demanded rises from 100 thousand to 225 thousand, but demand does not shift.',secondary=['law_of_demand'])
add('demand','DEMAND-01','legendary','movement_vs_shift','multi-step',
    'A student claims that the move from A to B on the displayed graph proves that demand increased by 125 thousand donuts. What is wrong with that claim?',
    'The 125-thousand change is an increase in quantity demanded caused by the lower price; the demand curve did not shift',['The student is correct because any quantity increase is a demand increase','The curve shifted left even though A and B lie on the same line','The change should be called an increase in supply because quantity rose'],
    'The points lie on one demand curve. A lower own price changes quantity demanded, whereas an increase in demand would require the entire demand curve to shift right.',secondary=['law_of_demand'])

# -------------------- DEMAND-02: increase in demand --------------------
add('demand','DEMAND-02','easy','demand_shift_direction','graph',
    'In the displayed coffee market, the move from D0 to D1 represents:',
    'An increase in demand',['A decrease in demand','An increase in quantity demanded caused only by a lower price','A decrease in supply'],
    'D1 lies to the right of D0, showing that consumers demand more coffee at each common price.')
add('demand','DEMAND-02','medium','demand_schedule_interpretation','calculation',
    'At a price of $10 on the displayed coffee graph, how does quantity demanded change when demand shifts from D0 to D1?',
    'It increases from 50 thousand to 125 thousand',['It decreases from 125 thousand to 50 thousand','It increases from 100 thousand to 175 thousand','It stays at 125 thousand'],
    'At $10, D0 shows 50 thousand units and D1 shows 125 thousand, so quantity demanded at that price rises by 75 thousand.',secondary=['demand_shift_direction'])
add('demand','DEMAND-02','medium','demand_shifters_income','application',
    'If coffee is a normal good, which event is consistent with the shift from D0 to D1 shown in the graph?',
    'Consumer income rises',['The price of coffee falls while all demand shifters stay unchanged','Coffee producers adopt cheaper technology','The price of coffee rises and buyers move up D0'],
    'For a normal good, higher income increases demand, shifting the entire demand curve to the right.',secondary=['demand_shifters'])
add('demand','DEMAND-02','hard','demand_shift_analysis','calculation',
    'Across the common price range shown, D1 places quantity demanded how far to the right of D0?',
    '75 thousand units',['25 thousand units','100 thousand units','125 thousand units'],
    'For example, at $10 quantity rises from 50 thousand to 125 thousand, and at $6 it rises from 150 thousand to 225 thousand. The horizontal shift is 75 thousand units.')
add('demand','DEMAND-02','elite','movement_vs_demand_shift','multi-step',
    'Start on D0 at a price of $6, where quantity demanded is 150 thousand. Demand then shifts to D1, but the price rises to $10. What final quantity demanded does the graph show, and how does it compare with the starting quantity?',
    '125 thousand; 25 thousand lower than the starting quantity',['225 thousand; 75 thousand higher than the starting quantity','50 thousand; 100 thousand lower than the starting quantity','150 thousand; unchanged'],
    'The final point is on D1 at $10, which is 125 thousand. Demand increased, but the higher price produces a movement up D1 large enough that final quantity demanded is 25 thousand below the original 150 thousand.',secondary=['demand_shift_direction'])
add('demand','DEMAND-02','legendary','multiple_demand_shifters','multi-step',
    'The market begins on D0 at a price of $10 and quantity 50 thousand. Demand shifts to D1 and the price then falls to $6. Which accounting correctly describes the total quantity change?',
    'Quantity rises to 225 thousand: 75 thousand from the demand shift at $10, then another 100 thousand from moving down D1',['Quantity rises to 125 thousand because only the shift matters','Quantity rises to 150 thousand because only the price change matters','Quantity falls to 25 thousand because the two changes work in opposite directions'],
    'At $10 the shift from D0 to D1 raises quantity demanded from 50 to 125 thousand. Moving down D1 from $10 to $6 raises it again from 125 to 225 thousand, for a total increase of 175 thousand.',secondary=['movement_vs_demand_shift','demand_shift_direction'])

# -------------------- DEMAND-03: decrease in demand --------------------
add('demand','DEMAND-03','easy','demand_shift_direction','graph',
    'In the displayed tea market, the move from D0 to D1 represents:',
    'A decrease in demand',['An increase in demand','A decrease in quantity demanded caused only by a higher price','An increase in supply'],
    'D1 lies to the left of D0, showing that consumers demand less tea at each common price.')
add('demand','DEMAND-03','medium','demand_schedule_interpretation','calculation',
    'At a price of $4 on the displayed tea graph, how does quantity demanded change when demand shifts from D0 to D1?',
    'It decreases from 200 thousand to 100 thousand',['It increases from 100 thousand to 200 thousand','It decreases from 300 thousand to 200 thousand','It stays at 100 thousand'],
    'At $4, D0 shows 200 thousand units while D1 shows 100 thousand, a decrease of 100 thousand at the same price.',secondary=['demand_shift_direction'])
add('demand','DEMAND-03','medium','demand_shifters_income','application',
    'If tea is a normal good, which event is consistent with the shift from D0 to D1 shown in the graph?',
    'Consumer income falls',['The price of tea rises while all demand shifters stay unchanged','Tea producers receive a subsidy','The price of tea falls and buyers move down D0'],
    'For a normal good, lower income decreases demand and shifts the entire demand curve left.',secondary=['demand_shifters'])
add('demand','DEMAND-03','hard','demand_shift_analysis','calculation',
    'Across the common price range shown, D1 places quantity demanded how far to the left of D0?',
    '100 thousand units',['25 thousand units','75 thousand units','200 thousand units'],
    'At $4, quantity falls from 200 thousand on D0 to 100 thousand on D1; at $6 it falls from 150 thousand to 50 thousand. The horizontal decrease is 100 thousand units.')
add('demand','DEMAND-03','elite','movement_vs_demand_shift','multi-step',
    'Start on D0 at a price of $6, where quantity demanded is 150 thousand. Demand then shifts to D1 and the price falls to $4. What final quantity demanded does the graph show?',
    '100 thousand',['50 thousand','150 thousand','200 thousand'],
    'The final point lies on D1 at $4, where quantity demanded is 100 thousand. The price decrease raises quantity demanded along D1, but it does not fully offset the earlier decrease in demand.',secondary=['demand_shift_direction'])
add('demand','DEMAND-03','legendary','movement_vs_shift','multi-step',
    'The market begins on D0 at $6 and 150 thousand units. Demand shifts to D1 while price is still $6, and then price falls to $4. Which decomposition matches the graph?',
    'The shift reduces quantity demanded by 100 thousand to 50 thousand, then the lower price raises quantity demanded by 50 thousand to 100 thousand',['The shift raises quantity demanded by 100 thousand, then the lower price reverses it','The shift has no quantity effect until the price changes','The price change raises demand itself by 50 thousand and restores the original quantity'],
    'At $6, D0 shows 150 thousand and D1 shows 50 thousand. Moving down D1 to $4 raises quantity demanded to 100 thousand. Final quantity remains 50 thousand below the starting level.',secondary=['movement_vs_demand_shift','demand_shift_direction'])

# -------------------- SUPPLY-01: movement along a single supply curve --------------------
add('supply','SUPPLY-01','easy','supply_shift_analysis','graph',
    'On the displayed coffee supply curve, what price and quantity are shown at point A?',
    '$6 and 100 thousand units',['$11 and 225 thousand units','$6 and 225 thousand units','$2 and 100 thousand units'],
    'Point A is plotted at a price of $6 and a quantity supplied of 100 thousand.')
add('supply','SUPPLY-01','medium','movement_vs_supply_shift','interpretation',
    'The market moves from point A to point B on the displayed supply curve. What is the most precise description?',
    'Price rises and quantity supplied increases along the same supply curve',['Supply increases and the curve shifts right','Price rises and supply decreases','Demand increases while supply stays fixed'],
    'A and B lie on the same supply curve. The higher price is associated with a larger quantity supplied, so this is a movement along supply, not a shift.',secondary=['law_of_supply'])
add('supply','SUPPLY-01','medium','supply_shift_analysis','calculation',
    'Moving from point A to point B on the displayed supply curve changes quantity supplied by:',
    'An increase of 125 thousand units',['A decrease of 125 thousand units','An increase of 5 thousand units','An increase of 225 thousand units'],
    'Quantity supplied rises from 100 thousand at A to 225 thousand at B, an increase of 125 thousand.')
add('supply','SUPPLY-01','hard','law_of_supply','calculation',
    'Using points A and B on the displayed linear supply curve, a $1 increase in price is associated with approximately what change in quantity supplied?',
    'An increase of 25 thousand units',['A decrease of 25 thousand units','An increase of 5 thousand units','An increase of 125 thousand units'],
    'From A to B, price rises by $5 while quantity supplied rises by 125 thousand, or 25 thousand additional units per $1 increase.',secondary=['movement_vs_supply_shift'])
add('supply','SUPPLY-01','elite','supply_shift_analysis','graph',
    'At a market price of $8, approximately how many units does the displayed coffee supply curve show producers are willing to sell?',
    '150 thousand units',['100 thousand units','175 thousand units','225 thousand units'],
    'The supply line passes through quantity 150 thousand at a price of $8.')
add('supply','SUPPLY-01','legendary','movement_vs_supply_shift','multi-step',
    'A producer says the move from A to B proves that supply increased by 125 thousand units. What is the correct diagnosis?',
    'Quantity supplied increased by 125 thousand because price rose; the supply curve itself did not shift',['Supply increased because any movement to a larger quantity is a supply shift','Supply decreased because the market moved upward along the curve','Demand increased and pulled the supply curve to B'],
    'A change in the good\'s own price changes quantity supplied along a fixed supply curve. A supply increase would require a rightward shift of the entire curve.',secondary=['law_of_supply'])

# -------------------- SUPPLY-02: decrease in supply --------------------
add('supply','SUPPLY-02','easy','supply_shift_direction','graph',
    'In the displayed hamburger market, the move from S0 to S1 represents:',
    'A decrease in supply',['An increase in supply','An increase in quantity supplied caused only by a higher price','A decrease in demand'],
    'S1 lies to the left and above S0, showing less quantity supplied at each common price.')
add('supply','SUPPLY-02','medium','supply_shift_analysis','calculation',
    'At a price of $9 on the displayed hamburger graph, how does quantity supplied change when supply shifts from S0 to S1?',
    'It decreases from 200 thousand to 100 thousand',['It increases from 100 thousand to 200 thousand','It decreases from 300 thousand to 200 thousand','It stays at 200 thousand'],
    'At $9, S0 shows 200 thousand units while S1 shows 100 thousand, a decrease of 100 thousand at the same price.',secondary=['supply_shift_direction'])
add('supply','SUPPLY-02','medium','supply_shifters_input_costs','application',
    'Which event is consistent with the shift from S0 to S1 shown in the hamburger market?',
    'The price of a major meat input rises',['The price of hamburgers rises and firms move up S0','A new cost-saving grill technology is adopted','More hamburger restaurants enter the market'],
    'Higher input costs reduce supply, shifting the supply curve left.',secondary=['supply_shifters'])
add('supply','SUPPLY-02','hard','supply_shift_analysis','calculation',
    'Across the common price range shown, S1 places quantity supplied how far to the left of S0?',
    '100 thousand units',['25 thousand units','75 thousand units','200 thousand units'],
    'At $9, quantity supplied falls from 200 thousand to 100 thousand; at $13, it falls from 300 thousand to 200 thousand. The horizontal decrease is 100 thousand units.')
add('supply','SUPPLY-02','elite','movement_vs_supply_shift','multi-step',
    'Start on S0 at a price of $9, where quantity supplied is 200 thousand. Supply then shifts to S1 and the price rises to $13. What final quantity supplied does the graph show?',
    '200 thousand',['100 thousand','300 thousand','400 thousand'],
    'At $13, S1 shows 200 thousand units. The decrease in supply initially lowers quantity supplied at a given price, but the subsequent higher price moves quantity supplied up along S1 until it returns to 200 thousand.',secondary=['supply_shift_direction'])
add('supply','SUPPLY-02','legendary','supply_shift_and_movement','multi-step',
    'The market begins on S0 at $9 and 200 thousand units. Supply shifts to S1 while price is still $9, and then price rises to $13. Which decomposition matches the graph?',
    'The shift cuts quantity supplied by 100 thousand to 100 thousand, then the higher price raises quantity supplied by 100 thousand back to 200 thousand',['The shift raises quantity supplied by 100 thousand and the price increase reverses it','The supply shift has no quantity effect until price changes','The higher price shifts supply right by 100 thousand and restores the original curve'],
    'At $9 the shift from S0 to S1 lowers quantity supplied from 200 to 100 thousand. Moving up S1 to $13 raises it back to 200 thousand.',secondary=['movement_vs_supply_shift','supply_shift_direction'])

# -------------------- SUPPLY-03: increase in supply + movement/shift contrast --------------------
add('supply','SUPPLY-03','easy','supply_shift_direction','graph',
    'In the displayed taco market, the move from S0 to S1 represents:',
    'An increase in supply',['A decrease in supply','An increase in quantity supplied caused only by a higher price','A decrease in demand'],
    'S1 lies below and to the right of S0, showing more quantity supplied at each common price.')
add('supply','SUPPLY-03','medium','movement_vs_supply_shift','interpretation',
    'What does the movement from point A to point B on S0 represent?',
    'An increase in quantity supplied caused by a higher price',['An increase in supply caused by the shift to S1','A decrease in supply because production costs rose','A decrease in quantity supplied caused by a lower price'],
    'A and B lie on the same S0 curve. Price rises from $3 to $4 and quantity supplied rises from 100 thousand to 225 thousand, so this is a movement along supply.',secondary=['law_of_supply'])
add('supply','SUPPLY-03','medium','supply_shift_analysis','calculation',
    'At a price of $3, the shift from S0 to S1 changes quantity supplied from 100 thousand to approximately:',
    '225 thousand',['125 thousand','200 thousand','325 thousand'],
    'At $3, point A on S0 is 100 thousand, while S1 crosses the $3 line at about 225 thousand. Supply therefore increases by about 125 thousand units at that price.',secondary=['supply_shift_direction'])
add('supply','SUPPLY-03','hard','supply_shift_and_movement','analysis',
    'Which comparison correctly distinguishes the two changes visible in the taco graph?',
    'A to B is movement along S0; S0 to S1 is an increase in supply',['A to B is an increase in supply; S0 to S1 is movement along supply','Both A to B and S0 to S1 are movements caused only by price','Both changes are decreases in supply'],
    'A and B are points on one curve, so their difference is quantity supplied. Moving from S0 to S1 shifts the entire curve and changes supply.',secondary=['movement_vs_supply_shift'])
add('supply','SUPPLY-03','elite','supply_shift_and_movement','multi-step',
    'The market begins at point A on S0: $3 and 100 thousand tacos. Supply shifts to S1, and the market price then falls to $2. Approximately what final quantity supplied is shown?',
    '100 thousand',['0','225 thousand','350 thousand'],
    'After the supply increase, moving down S1 to $2 brings quantity supplied to about 100 thousand. The rightward supply shift and the lower-price movement along S1 offset in this particular comparison.',secondary=['supply_shift_direction'])
add('supply','SUPPLY-03','legendary','supply_shift_and_movement','multi-step',
    'Start at A on S0: $3 and 100 thousand tacos. At the same $3 price, supply shifts to S1, and then price falls to $2. Which accounting best explains why final quantity supplied returns to about 100 thousand?',
    'The shift raises quantity supplied by about 125 thousand to 225 thousand, then the price decline moves down S1 and reduces quantity supplied by about 125 thousand',['The supply shift has no effect on quantity, so only the price matters','The price decline shifts supply left by 125 thousand','The market moves from A to B before the supply curve shifts'],
    'At $3 the rightward shift moves quantity supplied from 100 to about 225 thousand. The subsequent fall to $2 moves down S1 by about 125 thousand, returning quantity supplied to about 100 thousand.',secondary=['movement_vs_supply_shift','supply_shift_direction'])

# -------------------- DEMAND-SUPPLY-01: equilibrium, shortage, surplus --------------------
add('market-equilibrium','DEMAND-SUPPLY-01','easy','equilibrium_identification','graph',
    'What equilibrium price and quantity are shown in the displayed gas market?',
    '$3 per gallon and 150 thousand gallons',['$2 per gallon and 200 thousand gallons','$4 per gallon and 100 thousand gallons','$3 per gallon and 300 thousand gallons'],
    'D0 and S0 intersect at a price of $3 per gallon and a quantity of 150 thousand gallons.')
add('market-equilibrium','DEMAND-SUPPLY-01','medium','shortage_identification','calculation',
    'At a price of $2 per gallon in the displayed gas market, what imbalance exists?',
    'A shortage of 100 thousand gallons',['A surplus of 100 thousand gallons','A shortage of 200 thousand gallons','No shortage or surplus'],
    'At $2, quantity demanded is 200 thousand and quantity supplied is 100 thousand, so the shortage is 100 thousand gallons.',secondary=['shortage_price_pressure'])
add('market-equilibrium','DEMAND-SUPPLY-01','medium','surplus_identification','calculation',
    'At a price of $4 per gallon in the displayed gas market, what imbalance exists?',
    'A surplus of 100 thousand gallons',['A shortage of 100 thousand gallons','A surplus of 200 thousand gallons','No shortage or surplus'],
    'At $4, quantity supplied is 200 thousand and quantity demanded is 100 thousand, so the surplus is 100 thousand gallons.',secondary=['surplus_price_pressure'])
add('market-equilibrium','DEMAND-SUPPLY-01','hard','shortage_price_pressure','multi-step',
    'If the gas price is $1 per gallon, the graph shows quantity demanded of 250 thousand and quantity supplied of 50 thousand. What follows in a freely adjusting market?',
    'A 200-thousand-gallon shortage creates upward pressure on price',['A 200-thousand-gallon surplus creates downward pressure on price','A 50-thousand-gallon shortage leaves price unchanged','A 250-thousand-gallon surplus creates upward pressure on price'],
    'Quantity demanded exceeds quantity supplied by 200 thousand gallons. A shortage gives buyers an incentive to bid price upward toward equilibrium.',secondary=['surplus_shortage_calculation'])
add('market-equilibrium','DEMAND-SUPPLY-01','elite','surplus_shortage_adjustment','multi-step',
    'The gas market starts at $2, where the graph shows a 100-thousand-gallon shortage. As price rises to the $3 equilibrium, which pair of quantity changes eliminates that shortage?',
    'Quantity demanded falls by 50 thousand and quantity supplied rises by 50 thousand',['Quantity demanded rises by 50 thousand and quantity supplied falls by 50 thousand','Both quantity demanded and quantity supplied rise by 100 thousand','Both quantities fall by 50 thousand'],
    'From $2 to $3, quantity demanded falls from 200 to 150 thousand while quantity supplied rises from 100 to 150 thousand. Together those changes eliminate the 100-thousand shortage.',secondary=['market_change_prediction'])
add('market-equilibrium','DEMAND-SUPPLY-01','legendary','surplus_shortage_adjustment','analysis',
    'The graph shows a 100-thousand-gallon shortage at $2 and a 100-thousand-gallon surplus at $4. Why can neither price persist in an otherwise competitive market?',
    'The shortage pushes price up and the surplus pushes price down, directing the market toward $3',['Equal-sized imbalances cancel even when they occur at different prices','Both prices produce the same quantity traded, so either is an equilibrium','Shortages push price down while surpluses push price up'],
    'A shortage creates upward price pressure and a surplus creates downward pressure. Both adjustment forces point toward the $3 equilibrium.',secondary=['shortage_price_pressure','surplus_price_pressure'])

# -------------------- DEMAND-SUPPLY-02: simultaneous demand increase + supply decrease --------------------
add('market-equilibrium','DEMAND-SUPPLY-02','easy','equilibrium_identification','graph',
    'Before either curve shifts, what equilibrium is formed by D0 and S0 in the displayed gas market?',
    '$3 and 150 thousand units',['$4 and 100 thousand units','$4 and 200 thousand units','$5 and 150 thousand units'],
    'The original curves D0 and S0 intersect at price $3 and quantity 150 thousand.')
add('market-equilibrium','DEMAND-SUPPLY-02','medium','simultaneous_shifts','interpretation',
    'Which pair of market changes is shown when the graph moves from D0/S0 to D1/S1?',
    'Demand increases while supply decreases',['Demand decreases while supply increases','Both demand and supply increase','Both demand and supply decrease'],
    'D1 is to the right of D0, indicating increased demand. S1 is to the left of S0, indicating decreased supply.')
add('market-equilibrium','DEMAND-SUPPLY-02','medium','simultaneous_shift_comparison','graph',
    'After both shifts shown in the graph, what equilibrium is formed by D1 and S1?',
    '$5 and 150 thousand units',['$3 and 150 thousand units','$4 and 100 thousand units','$4 and 200 thousand units'],
    'The new curves D1 and S1 intersect at price $5 and quantity 150 thousand.')
add('market-equilibrium','DEMAND-SUPPLY-02','hard','demand_shift_equilibrium_prediction','multi-step',
    'Starting from D0/S0, suppose demand shifts to D1 while supply remains at S0. What intermediate equilibrium does the graph show?',
    '$4 and 200 thousand units',['$4 and 100 thousand units','$5 and 150 thousand units','$3 and 150 thousand units'],
    'D1 intersects the unchanged S0 curve at price $4 and quantity 200 thousand. A demand increase alone raises both equilibrium price and quantity.',secondary=['market_shift_analysis'])
add('market-equilibrium','DEMAND-SUPPLY-02','elite','simultaneous_shift_comparison','analysis',
    'Comparing the original D0/S0 equilibrium with the final D1/S1 equilibrium, what happened in this particular graph?',
    'Price rose by $2 while equilibrium quantity stayed at 150 thousand',['Price stayed at $3 while quantity rose by 100 thousand','Price rose by $1 while quantity fell by 50 thousand','Price fell by $2 while quantity stayed at 150 thousand'],
    'The original equilibrium is $3 and 150 thousand; the final equilibrium is $5 and 150 thousand. Both shifts push price upward, while their opposing quantity effects exactly offset in this graph.',secondary=['double_shift_ambiguous_quantity'])
add('market-equilibrium','DEMAND-SUPPLY-02','legendary','simultaneous_shift_sequence','multi-step',
    'Begin at D0/S0: $3 and 150 thousand. Demand first increases to D1 with S0 fixed, then supply decreases to S1 with D1 fixed. Which sequence matches the graph?',
    'First price and quantity rise to $4 and 200 thousand; then price rises to $5 while quantity falls back to 150 thousand',['First price falls to $2 and quantity rises; then both return to the original equilibrium','First price rises to $4 and quantity falls to 100 thousand; then price falls to $3','First quantity stays fixed at 150 thousand; then price and quantity both fall'],
    'D1/S0 intersects at $4 and 200 thousand. Moving from S0 to S1 with D1 fixed then raises price to $5 and lowers quantity to 150 thousand. The final quantity matches the original even though the path does not.',secondary=['simultaneous_shifts','market_shift_analysis'])

# Build question records with balanced answer positions.
existing_ids=set()
for c in lib['concepts'].values():
    for arr in c.get('questions',{}).values():
        existing_ids.update(q.get('id') for q in arr)
    existing_ids.update(q.get('id') for q in c.get('repairQuestions',[]))
    existing_ids.update(q.get('id') for q in c.get('bridgeQuestions',[]))

code_map={'demand':'DMD','supply':'SUP','market-equilibrium':'EQ'}
pool_code={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L'}
counts=Counter()
newqs=[]
for idx,s in enumerate(specs):
    counts[(s['concept'],s['pool'])]+=1
    serial=counts[(s['concept'],s['pool'])]
    qid=f"PG1-{code_map[s['concept']]}-{pool_code[s['pool']]}-{serial:03d}"
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')
    # Rotate correct answer positions evenly across the full set.
    pos=idx % 4
    opts=list(s['distractors'])
    opts.insert(pos,s['correct'])
    objective={'demand':'LO4.2','supply':'LO4.3','market-equilibrium':'LO4.4'}[s['concept']]
    tag={'demand':'demand','supply':'supply','market-equilibrium':'equilibrium'}[s['concept']]
    image=f"question-assets/{s['concept']}/{s['asset']}.webp"
    source_id=860000+idx
    source_hash=sha_text(json.dumps({'q':s['stem'],'options':opts,'image':image,'skill':s['skill']},sort_keys=True,ensure_ascii=False))
    role='elite' if s['pool']=='elite' else ('legendary' if s['pool']=='legendary' else 'main')
    q={
        'id':qid,'q':s['stem'],'options':opts,'tag':tag,'type':s['typ'],'objective':objective,
        'difficulty':s['pool'],'conceptCluster':'supply_demand','primarySkill':s['skill'],
        'secondarySkills':s['secondary'],'repairSkill':s['repair'],'commonError':s['common'],
        'feedback':s['feedback'],'image':image,'aHash':sha_answer(s['correct']),'canonicalId':qid,
        'sourceId':source_id,'sourceGame':'micro-concept-library','sourceChapter':[s['concept']],
        'sourcePool':s['pool'],'sourceHash':source_hash,'sourceOccurrences':[{
            'sourceGame':'micro-concept-library','sourceFile':PHASE,'sourceGlobal':'questions','sourcePool':s['pool'],
            'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],
        'primaryConceptId':s['concept'],'secondaryConceptIds':[],'instructionalRole':role,
        'canonicalDifficulty':s['pool'],'originalSourcePool':s['pool'],'originalBossTier':None
    }
    lib['concepts'][s['concept']]['questions'][s['pool']].append(q)
    newqs.append(q)

(ROOT/f'{PHASE}_questions.json').write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Refresh registry metrics for the three touched concepts.
def concept_records(c):
    main=[q for arr in c['questions'].values() for q in arr]
    return main + c.get('repairQuestions',[]) + c.get('bridgeQuestions',[]) + c.get('repairSeedQuestions',[]), main

def concept_total(c):
    recs,_=concept_records(c); return len(recs)

for cid in ['demand','supply','market-equilibrium']:
    c=lib['concepts'][cid]
    records,main=concept_records(c)
    re=next(x for x in lib['registry']['concepts'] if x['canonicalConceptId']==cid)
    role_counts=Counter(q.get('instructionalRole','unknown') for q in records)
    # Preserve calculation as a role count based on instructionalRole if present in this library.
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
    if cid=='demand':
        re['coverageStatusNote']='Phase Graph 1 adds three dedicated demand visuals for movement along demand, rightward demand shifts, and leftward demand shifts, with graph-dependent questions from easy through Legendary.'
    elif cid=='supply':
        re['coverageStatusNote']='Phase Graph 1 adds three dedicated supply visuals for movement along supply, supply decreases, and supply increases, with explicit movement-versus-shift comparisons from easy through Legendary.'
    else:
        re['coverageStatusNote']='Phase Graph 1 adds a clean equilibrium/shortage/surplus graph and a simultaneous demand-increase/supply-decrease graph, extending equilibrium graph reasoning through Legendary.'


# Canonical count is unique canonical question IDs; some records intentionally appear under multiple concepts.
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
lib['registry']['curationSummary']='Phase Graph 1: eight approved demand/supply/equilibrium assets and 48 graph-dependent questions. Emphasis is movement versus shift, direct graph reading, shortage/surplus adjustment, and simultaneous shifts; no elasticity, price-control, or tax content was added.'
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
