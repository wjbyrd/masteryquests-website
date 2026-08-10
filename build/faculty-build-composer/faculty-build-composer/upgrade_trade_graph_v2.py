import json, hashlib, re, unicodedata
from pathlib import Path
from PIL import Image
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
ASSET_DIR=ROOT/'data/question-assets/international-trade-and-trade-policy'
ASSET_DIR.mkdir(parents=True,exist_ok=True)
SRC_FILES={
 'TRD-01':'/mnt/data/TRD-01.png',
 'TRD-02':'/mnt/data/TRD-02.png',
 'TRD-03':'/mnt/data/TRD-03.png',
 'TRD-04':'/mnt/data/TRD-04.png',
}
PHASE='phase6.2d-international-trade-graph-expansion-v2'
GEN='2026-08-09T15:50:00.000Z'
CID='international-trade-and-trade-policy'

def sha_text(s): return hashlib.sha256(s.encode('utf-8')).hexdigest()
def normalize_answer(s): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(s)).strip()).lower()
def answer_hash(s): return sha_text(normalize_answer(s))
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

lib=load_library(); concept=lib['concepts'][CID]

# Add/replace the four faculty-approved trade assets while preserving older validated assets/questions.
# If this script is rerun, remove prior TRD-0x metadata/inventory entries first.
for name in SRC_FILES:
 old=ASSET_DIR/f'{name}.webp'
 if old.exists(): old.unlink()
concept['assetMetadata']=[a for a in concept.get('assetMetadata',[]) if a.get('filename') not in {f'{n}.webp' for n in SRC_FILES}]
concept['assets']=[a for a in concept.get('assets',[]) if not any(a.endswith(f'{n}.webp') for n in SRC_FILES)]
concept['assetPaths']=[a for a in concept.get('assetPaths',[]) if not any(a.endswith(f'{n}.webp') for n in SRC_FILES)]
lib['assetInventory']=[a for a in lib['assetInventory'] if not (a.get('conceptId')==CID and a.get('filename') in {f'{n}.webp' for n in SRC_FILES})]
new_assets=[]
for name,src in SRC_FILES.items():
 srcp=Path(src)
 if not srcp.exists(): raise FileNotFoundError(src)
 out=ASSET_DIR/f'{name}.webp'
 with Image.open(srcp) as im:
  im=im.convert('RGB')
  im.save(out,'WEBP',quality=94,method=6)
 meta={'conceptId':CID,'filename':out.name,'sourceAssetPath':f'question-assets/{CID}/{out.name}','sourceUrl':f'data/question-assets/{CID}/{out.name}','runtimePath':f'question-assets/{CID}/{out.name}','sha256':sha_file(out),'sizeBytes':out.stat().st_size}
 new_assets.append(meta)
 concept['assets'].append(meta['runtimePath'])
 concept['assetPaths'].append(meta['runtimePath'])
concept['assetMetadata'].extend(new_assets)
lib['assetInventory'].extend(new_assets)

# Remove any previous v2 questions if rerun.
old_ids=set()
qfile=ROOT/'phase6_2d_international_trade_graph_expansion_v2_questions.json'
if qfile.exists():
 try: old_ids={q['id'] for q in json.loads(qfile.read_text())}
 except Exception: old_ids=set()
if old_ids:
 for pool in list(concept['questions']):
  concept['questions'][pool]=[q for q in concept['questions'][pool] if q.get('id') not in old_ids]

specs=[]
def add(graph,pool,obj,skill,typ,stem,correct,distractors,feedback,common='misreads_trade_graph'):
 specs.append(dict(graph=graph,pool=pool,obj=obj,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,common=common))

# TRD-01 — importer at Pw=$5. Autarky P=$7,Q=175; Qs=125,Qd=225, imports=100 (12)
add('TRD-01','easy','ITP.1','importer_identification','graph','In TRD-01, is the domestic economy an importer or exporter when the world price is $5?','Importer',['Exporter','Neither; trade does not occur','The graph does not determine the trade direction'],'The $5 world price lies below the $7 autarky price, so domestic demand exceeds domestic supply and the country imports.')
add('TRD-01','easy','ITP.2','domestic_production_under_trade','graph','At the $5 world price in TRD-01, how many thousand avocados do domestic producers supply?','125 thousand',['175 thousand','225 thousand','100 thousand'],'The world-price line intersects domestic supply at Q = 125 thousand.')
add('TRD-01','easy','ITP.2','domestic_consumption_under_trade','graph','At the $5 world price in TRD-01, how many thousand avocados do domestic consumers demand?','225 thousand',['125 thousand','175 thousand','350 thousand'],'The world-price line intersects domestic demand at Q = 225 thousand.')
add('TRD-01','medium','ITP.2','import_quantity','calculation','Using TRD-01, how many thousand avocados are imported at the $5 world price?','100 thousand',['50 thousand','125 thousand','225 thousand'],'Imports equal domestic consumption minus domestic production: 225 − 125 = 100 thousand.')
add('TRD-01','medium','ITP.1','world_price','analysis','Why does TRD-01 show imports when trade opens at Pw = $5?','The world price is below the domestic autarky price',['The world price is above the domestic autarky price','Domestic supply exceeds domestic demand at $5','The world price equals the autarky price'],'A small country imports when the world price is below its no-trade equilibrium price.')
add('TRD-01','hard','ITP.2','import_market_graph','analysis','Relative to autarky in TRD-01, how do domestic production and consumption change when trade opens at $5?','Production falls by 50 thousand and consumption rises by 50 thousand',['Production rises by 50 thousand and consumption falls by 50 thousand','Both production and consumption rise by 100 thousand','Both production and consumption fall by 50 thousand'],'Autarky quantity is 175 thousand; at Pw = $5, Qs = 125 and Qd = 225.')
add('TRD-01','hard','ITP.3','consumer_surplus_trade','calculation','Using the demand intercept and Pw = $5 in TRD-01, consumer surplus under free trade is:','$1,012.5 thousand',['$612.5 thousand','$312.5 thousand','$1,325 thousand'],'Consumer surplus is 1/2 × (14 − 5) × 225 = 1,012.5 thousand dollars.')
add('TRD-01','elite','ITP.3','producer_surplus_trade','calculation','In TRD-01, domestic producer surplus falls from $612.5 thousand under autarky to $312.5 thousand under free trade. What is the producer loss?','$300 thousand',['$100 thousand','$400 thousand','$612.5 thousand'],'Producer surplus falls by 612.5 − 312.5 = 300 thousand dollars.')
add('TRD-01','elite','ITP.3','gains_from_trade','calculation','Using TRD-01, consumers gain $400 thousand and producers lose $300 thousand when trade opens. What is the net national gain?','$100 thousand',['$700 thousand','$300 thousand','$0'],'The consumer gain exceeds the producer loss by $100 thousand.')
add('TRD-01','legendary','ITP.3','integrated_trade_analysis','synthesis','Which package correctly summarizes TRD-01 after opening to trade at Pw = $5?','Qd = 225 thousand, Qs = 125 thousand, imports = 100 thousand',['Qd = 125 thousand, Qs = 225 thousand, exports = 100 thousand','Qd = 175 thousand, Qs = 175 thousand, imports = 0','Qd = 225 thousand, Qs = 175 thousand, imports = 50 thousand'],'At the world price, demand is 225 thousand and supply is 125 thousand, leaving 100 thousand imports.')
add('TRD-01','legendary','ITP.3','total_surplus_trade','synthesis','TRD-01 implies a $400 thousand consumer gain and a $300 thousand producer loss from opening trade. Which welfare statement is correct?','Total surplus rises by $100 thousand even though producers lose',['Total surplus falls by $100 thousand because producers lose','Total surplus is unchanged because gains equal losses','Only producer surplus matters for national welfare'],'The distribution changes, but the consumer gain exceeds the producer loss by $100 thousand.')
add('TRD-01','easyBoss','ITP.2','import_quantity','checkpoint','Checkpoint: At Pw = $5 in TRD-01, what creates the 100-thousand-unit import quantity?','Qd of 225 thousand minus Qs of 125 thousand',['Qs of 225 thousand minus Qd of 125 thousand','Autarky quantity of 175 thousand minus Qs of 125 thousand','World price of $5 multiplied by Qd of 225 thousand'],'Imports are the gap between domestic quantity demanded and domestic quantity supplied at the world price.')

# TRD-02 — exporter at Pw=$10. Autarky P=$7,Q=175; Qd=100,Qs=250,exports=150 (12)
add('TRD-02','easy','ITP.1','exporter_identification','graph','In TRD-02, is the domestic economy an importer or exporter when the world price is $10?','Exporter',['Importer','Neither; trade does not occur','The graph does not determine the trade direction'],'The $10 world price lies above the $7 autarky price, so domestic production exceeds domestic consumption and the country exports.')
add('TRD-02','easy','ITP.2','domestic_consumption_under_trade','graph','At Pw = $10 in TRD-02, domestic consumers demand:','100 thousand avocados',['175 thousand avocados','250 thousand avocados','150 thousand avocados'],'The world-price line intersects demand at Q = 100 thousand.')
add('TRD-02','easy','ITP.2','domestic_production_under_trade','graph','At Pw = $10 in TRD-02, domestic producers supply:','250 thousand avocados',['100 thousand avocados','175 thousand avocados','150 thousand avocados'],'The world-price line intersects supply at Q = 250 thousand.')
add('TRD-02','medium','ITP.2','export_quantity','calculation','Using TRD-02, how many thousand avocados are exported at Pw = $10?','150 thousand',['75 thousand','100 thousand','250 thousand'],'Exports equal domestic production minus domestic consumption: 250 − 100 = 150 thousand.')
add('TRD-02','medium','ITP.1','world_price','analysis','Why does TRD-02 show exports when trade opens at Pw = $10?','The world price is above the domestic autarky price',['The world price is below the domestic autarky price','Domestic demand exceeds domestic supply at $10','The world price is fixed at the autarky price'],'A world price above the no-trade equilibrium price creates excess domestic supply for export.')
add('TRD-02','hard','ITP.2','export_market_graph','analysis','Relative to autarky in TRD-02, how do domestic production and consumption change after trade opens at $10?','Production rises by 75 thousand and consumption falls by 75 thousand',['Production falls by 75 thousand and consumption rises by 75 thousand','Both production and consumption rise by 150 thousand','Both remain at 175 thousand'],'Autarky quantity is 175 thousand; with trade, Qs = 250 and Qd = 100.')
add('TRD-02','hard','ITP.3','producer_surplus_trade','calculation','Using TRD-02, producer surplus at Pw = $10 is:','$1,250 thousand',['$612.5 thousand','$200 thousand','$1,450 thousand'],'With a supply curve through the origin, producer surplus is 1/2 × $10 × 250 = $1,250 thousand.')
add('TRD-02','elite','ITP.3','consumer_surplus_trade','calculation','In TRD-02, consumer surplus falls from $612.5 thousand under autarky to $200 thousand under free trade. What is the consumer loss?','$412.5 thousand',['$225 thousand','$637.5 thousand','$1,012.5 thousand'],'The loss is 612.5 − 200 = 412.5 thousand dollars.')
add('TRD-02','elite','ITP.3','gains_from_trade','calculation','Using TRD-02, producers gain $637.5 thousand while consumers lose $412.5 thousand. What is the net national gain from trade?','$225 thousand',['$1,050 thousand','$412.5 thousand','$0'],'The producer gain exceeds the consumer loss by $225 thousand.')
add('TRD-02','legendary','ITP.3','integrated_trade_analysis','synthesis','Which package correctly summarizes TRD-02 at Pw = $10?','Qs = 250 thousand, Qd = 100 thousand, exports = 150 thousand',['Qs = 100 thousand, Qd = 250 thousand, imports = 150 thousand','Qs = Qd = 175 thousand, so exports are zero','Qs = 250 thousand, Qd = 175 thousand, exports = 75 thousand'],'At Pw = $10, domestic supply is 250 thousand and demand is 100 thousand, producing 150 thousand exports.')
add('TRD-02','legendary','ITP.3','trade_winners_losers','synthesis','What distributional pattern does TRD-02 illustrate when an exporting market opens to trade?','Domestic producers gain while domestic consumers lose, with a positive net gain',['Domestic consumers gain while producers lose, with a positive net gain','Both consumers and producers lose because domestic price rises','Only foreign buyers gain because exports leave the country'],'The higher world price benefits domestic sellers and hurts domestic buyers, while aggregate surplus rises.')
add('TRD-02','easyBoss','ITP.2','export_quantity','checkpoint','Checkpoint: At Pw = $10 in TRD-02, how is the 150-thousand-unit export quantity calculated?','Qs of 250 thousand minus Qd of 100 thousand',['Qd of 250 thousand minus Qs of 100 thousand','Autarky quantity of 175 thousand minus Qd of 100 thousand','Pw of $10 multiplied by Qs of 250 thousand'],'Exports are the excess of domestic quantity supplied over domestic quantity demanded at the world price.')

# TRD-03 — tariff. Autarky P8,Q150; Pw4: Qs50,Qd250,imports200. tariff price6: Qs100,Qd200,imports100; tariff=$2; revenue=200k; DWL=100k (16)
add('TRD-03','easy','ITP.4','tariff_price_effect','graph','In TRD-03, what domestic price results from the $4 world price plus the tariff?','$6',['$4','$8','$10'],'The graph marks the tariff-inclusive domestic price at $6.')
add('TRD-03','easy','ITP.4','tariff_price_effect','calculation','What is the per-unit tariff shown in TRD-03?','$2',['$4','$6','$8'],'The domestic price rises from the $4 world price to $6, so the tariff is $2 per unit.')
add('TRD-03','medium','ITP.4','tariff_quantity_effect','graph','At the tariff-inclusive price of $6 in TRD-03, domestic production is:','100 thousand',['50 thousand','150 thousand','200 thousand'],'The $6 line intersects domestic supply at Q = 100 thousand.')
add('TRD-03','medium','ITP.4','tariff_quantity_effect','graph','At the tariff-inclusive price of $6 in TRD-03, domestic consumption is:','200 thousand',['100 thousand','150 thousand','250 thousand'],'The $6 line intersects demand at Q = 200 thousand.')
add('TRD-03','medium','ITP.4','import_quantity','calculation','After the tariff in TRD-03, imports equal:','100 thousand',['50 thousand','150 thousand','200 thousand'],'At $6, Qd = 200 thousand and Qs = 100 thousand, so imports are 100 thousand.')
add('TRD-03','medium','ITP.4','tariff_quantity_effect','calculation','Compared with free trade at Pw = $4, the tariff in TRD-03 reduces imports by:','100 thousand',['50 thousand','150 thousand','200 thousand'],'Free-trade imports are 250 − 50 = 200 thousand; after the tariff they are 100 thousand.')
add('TRD-03','hard','ITP.4','tariff_revenue','calculation','Because quantities are measured in thousands, government tariff revenue in TRD-03 is:','$200 thousand',['$100 thousand','$300 thousand','$400 thousand'],'The tariff is $2 on 100 thousand imports, so revenue is $200 thousand.')
add('TRD-03','hard','ITP.4','production_distortion','calculation','The tariff raises domestic production from 50 thousand to 100 thousand. What is the production-distortion loss in TRD-03?','$50 thousand',['$100 thousand','$150 thousand','$200 thousand'],'The production triangle is 1/2 × $2 × 50 thousand = $50 thousand.')
add('TRD-03','hard','ITP.4','consumption_distortion','calculation','The tariff reduces domestic consumption from 250 thousand to 200 thousand. What is the consumption-distortion loss in TRD-03?','$50 thousand',['$25 thousand','$100 thousand','$200 thousand'],'The consumption triangle is 1/2 × $2 × 50 thousand = $50 thousand.')
add('TRD-03','hard','ITP.4','tariff_welfare_effect','calculation','What is the total deadweight loss created by the tariff in TRD-03?','$100 thousand',['$50 thousand','$200 thousand','$300 thousand'],'The two $50-thousand distortion triangles sum to $100 thousand.')
add('TRD-03','elite','ITP.4','consumer_surplus_trade','calculation','In TRD-03, consumer surplus falls from $1,250 thousand under free trade to $800 thousand after the tariff. The consumer loss is:','$450 thousand',['$150 thousand','$200 thousand','$550 thousand'],'Consumer surplus falls by 1,250 − 800 = 450 thousand dollars.')
add('TRD-03','elite','ITP.4','producer_surplus_trade','calculation','In TRD-03, producer surplus rises from $50 thousand under free trade to $200 thousand after the tariff. The producer gain is:','$150 thousand',['$50 thousand','$200 thousand','$450 thousand'],'Producer surplus rises by 200 − 50 = 150 thousand dollars.')
add('TRD-03','legendary','ITP.4','integrated_trade_analysis','synthesis','Which welfare package correctly describes the tariff in TRD-03 relative to free trade?','Consumers lose $450k; producers gain $150k; government gets $200k; net welfare falls $100k',['Consumers lose $200k; producers gain $200k; government gets $100k; net welfare rises $100k','Consumers lose $450k; producers gain $450k; government gets $200k; net welfare is unchanged','Consumers lose $100k; producers gain $150k; government gets $200k; net welfare rises $250k'],'The $450k consumer loss is only partly offset by the $150k producer gain and $200k tariff revenue, leaving $100k deadweight loss.')
add('TRD-03','legendary','ITP.4','tariff_welfare_effect','analysis','TRD-03 shows domestic production rising by 50 thousand and domestic consumption falling by 50 thousand after the tariff. What do those two changes represent?','They are the two deadweight-loss distortions',['Two transfers that exactly become government revenue','A rise in comparative advantage and a fall in opportunity cost','Changes that leave total surplus unchanged'],'The tariff induces too much high-cost domestic production and too little domestic consumption relative to free trade.')
add('TRD-03','legendary','ITP.4','trade_policy_evaluation','synthesis','Imports in TRD-03 fall from 200 thousand under free trade to 100 thousand after the tariff. Which statement is economically accurate?','The tariff protects domestic producers but reduces total national surplus',['The tariff raises both consumer surplus and total national surplus','The tariff eliminates imports without creating any distortion','The tariff benefits consumers because domestic price rises'],'Protection increases domestic output, but the higher domestic price creates production and consumption distortions.')
add('TRD-03','mediumBoss','ITP.4','integrated_trade_analysis','checkpoint','Checkpoint: Which complete quantity package is correct after the tariff in TRD-03?','Qs = 100 thousand; Qd = 200 thousand; imports = 100 thousand',['Qs = 50 thousand; Qd = 250 thousand; imports = 200 thousand','Qs = 200 thousand; Qd = 100 thousand; exports = 100 thousand','Qs = Qd = 150 thousand; imports = 0'],'At the tariff-inclusive price of $6, supply is 100 thousand and demand is 200 thousand, leaving 100 thousand imports.')

# TRD-04 — quota. Autarky P7,Q175; Pw3: Qs75,Qd275,imports200. Quota price6: Qs150,Qd200,imports50; rent wedge3; rents150k; DWL225k (16)
add('TRD-04','easy','ITP.5','quota_quantity_effect','graph','In TRD-04, what domestic price results under the import quota?','$6',['$3','$7','$9'],'The graph marks the domestic price under the quota at $6.')
add('TRD-04','easy','ITP.5','world_price','graph','What world price is shown in TRD-04?','$3',['$6','$7','$14'],'The green world-price line is drawn at $3.')
add('TRD-04','medium','ITP.5','domestic_production_under_trade','graph','At the quota-induced domestic price of $6 in TRD-04, domestic producers supply:','150 thousand',['75 thousand','175 thousand','200 thousand'],'The $6 line intersects supply at Q = 150 thousand.')
add('TRD-04','medium','ITP.5','domestic_consumption_under_trade','graph','At the quota-induced domestic price of $6 in TRD-04, domestic consumers demand:','200 thousand',['150 thousand','175 thousand','275 thousand'],'The $6 line intersects demand at Q = 200 thousand.')
add('TRD-04','medium','ITP.5','quota_quantity_effect','calculation','What import quantity is permitted by the quota shown in TRD-04?','50 thousand',['75 thousand','125 thousand','200 thousand'],'At $6, imports equal Qd − Qs = 200 − 150 = 50 thousand.')
add('TRD-04','medium','ITP.5','quota_rent','calculation','What is the per-unit quota rent implied by TRD-04?','$3 per unit',['$1 per unit','$6 per unit','$9 per unit'],'The domestic price is $6 while the world price is $3, creating a $3 price wedge per imported unit.')
add('TRD-04','hard','ITP.5','quota_rent','calculation','If domestic license holders receive the quota rents in TRD-04, total quota rents equal:','$150 thousand',['$50 thousand','$225 thousand','$300 thousand'],'The $3 price wedge times 50 thousand imports produces $150 thousand in quota rents.')
add('TRD-04','hard','ITP.5','quota_quantity_effect','calculation','Free-trade imports at Pw = $3 would be 200 thousand. The quota cuts imports to 50 thousand. By how much do imports fall?','150 thousand',['50 thousand','125 thousand','200 thousand'],'Imports fall from 275 − 75 = 200 thousand to 50 thousand, a decline of 150 thousand.')
add('TRD-04','hard','ITP.5','production_distortion','calculation','The quota raises domestic production from 75 thousand to 150 thousand. What is the production-distortion loss in TRD-04?','$112.5 thousand',['$75 thousand','$150 thousand','$225 thousand'],'The production triangle is 1/2 × $3 × 75 thousand = $112.5 thousand.')
add('TRD-04','hard','ITP.5','consumption_distortion','calculation','The quota reduces domestic consumption from 275 thousand to 200 thousand. What is the consumption-distortion loss in TRD-04?','$112.5 thousand',['$50 thousand','$150 thousand','$225 thousand'],'The consumption triangle is 1/2 × $3 × 75 thousand = $112.5 thousand.')
add('TRD-04','elite','ITP.5','tariff_welfare_effect','calculation','Assuming quota rents remain domestic, what total deadweight loss is shown by TRD-04?','$225 thousand',['$112.5 thousand','$150 thousand','$450 thousand'],'The two $112.5-thousand distortion triangles sum to $225 thousand.')
add('TRD-04','elite','ITP.5','consumer_surplus_trade','calculation','In TRD-04, consumer surplus falls from $1,512.5 thousand under free trade to $800 thousand under the quota. The consumer loss is:','$712.5 thousand',['$337.5 thousand','$562.5 thousand','$1,400 thousand'],'Consumer surplus falls by 1,512.5 − 800 = 712.5 thousand dollars.')
add('TRD-04','legendary','ITP.5','integrated_trade_analysis','synthesis','Assuming domestic license holders receive the rents, which welfare package correctly describes TRD-04 relative to free trade?','Consumers lose $712.5k; producers gain $337.5k; quota rents are $150k; net welfare falls $225k',['Consumers lose $337.5k; producers gain $712.5k; quota rents are $150k; net welfare rises $525k','Consumers lose $712.5k; producers gain $337.5k; quota rents are $375k; net welfare is unchanged','Consumers lose $225k; producers gain $150k; quota rents are $75k; net welfare is unchanged'],'The consumer loss exceeds the producer gain plus domestic quota rents by $225 thousand.')
add('TRD-04','legendary','ITP.5','quota_rent','analysis','If the $150 thousand of quota rents in TRD-04 went to foreign exporters instead of domestic license holders, what would happen to domestic national welfare?','The national loss would be $150 thousand larger',['The national loss would be $150 thousand smaller','Domestic national welfare would be unchanged','The quota would become a subsidy to consumers'],'Foreign capture of quota rents removes a transfer that otherwise remains inside the domestic economy.')
add('TRD-04','legendary','ITP.5','trade_policy_evaluation','synthesis','TRD-04 raises domestic price from $3 to $6, expands domestic production, and reduces domestic consumption. Which interpretation is correct?','It protects producers but creates production and consumption distortions',['The quota raises efficiency because imports fall','The quota benefits consumers because domestic price rises','The quota eliminates all welfare losses if rents are domestic'],'The quota moves production and consumption away from their free-trade levels, creating deadweight loss.')
add('TRD-04','finalBoss','ITP.5','integrated_trade_analysis','checkpoint','Checkpoint: Which complete quantity package is correct under the quota in TRD-04?','Qs = 150 thousand; Qd = 200 thousand; imports = 50 thousand',['Qs = 75 thousand; Qd = 275 thousand; imports = 200 thousand','Qs = 200 thousand; Qd = 150 thousand; exports = 50 thousand','Qs = Qd = 175 thousand; imports = 0'],'At the quota-induced price of $6, domestic supply is 150 thousand and demand is 200 thousand, leaving 50 thousand imports.')

assert len(specs)==56, len(specs)
assert Counter(s['graph'] for s in specs)==Counter({'TRD-01':12,'TRD-02':12,'TRD-03':16,'TRD-04':16})
assert Counter(s['pool'] for s in specs)==Counter({'easy':10,'medium':12,'hard':12,'elite':8,'legendary':10,'easyBoss':2,'mediumBoss':1,'finalBoss':1})

prefix_map={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L','easyBoss':'B1','mediumBoss':'B2','finalBoss':'B3'}
start_map={'easy':31,'medium':31,'hard':31,'elite':31,'legendary':91,'easyBoss':19,'mediumBoss':37,'finalBoss':55}
counters=start_map.copy(); newqs=[]
for idx,s in enumerate(specs):
 pool=s['pool']; code=prefix_map[pool]; n=counters[pool]; counters[pool]+=1
 qid=f'P62D-ITP-{code}-{n:03d}'
 choices=[s['correct']]+list(s['distractors']); pos=idx%4; correct=choices.pop(0); choices.insert(pos,correct)
 source_id=716000+idx
 canonical_diff={'easyBoss':'easy','mediumBoss':'medium','finalBoss':'hard'}.get(pool,pool)
 role={'elite':'elite','legendary':'legendary','easyBoss':'boss','mediumBoss':'boss','finalBoss':'boss'}.get(pool,'main')
 source_hash=sha_text(json.dumps({'id':qid,'q':s['stem'],'options':choices,'image':s['graph']},sort_keys=True,ensure_ascii=False))
 q={'id':qid,'q':s['stem'],'options':choices,'tag':'international_trade_and_trade_policy','type':s['typ'],'objective':s['obj'],'difficulty':pool,'conceptCluster':'micro_international_trade','primarySkill':s['skill'],'secondarySkills':[],'repairSkill':s['skill'],'commonError':s['common'],'feedback':s['feedback'],'image':f'question-assets/{CID}/{s["graph"]}.webp','aHash':answer_hash(correct),'canonicalId':qid,'sourceId':source_id,'sourceGame':'micro-concept-library','sourceChapter':[CID],'sourcePool':pool,'sourceHash':source_hash,'sourceOccurrences':[{'sourceGame':'micro-concept-library','sourceFile':PHASE,'sourceGlobal':'questions','sourcePool':pool,'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],'primaryConceptId':CID,'secondaryConceptIds':[],'instructionalRole':role,'canonicalDifficulty':canonical_diff,'originalSourcePool':pool,'originalBossTier':pool if pool.endswith('Boss') else None}
 newqs.append(q)
 target='boss' if pool.endswith('Boss') else pool
 concept['questions'][target].append(q)

qfile.write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Recompute registry metrics.
all_main=[q for arr in concept['questions'].values() for q in arr]
all_records=all_main+concept.get('repairQuestions',[])+concept.get('bridgeQuestions',[])+concept.get('repairSeedQuestions',[])
reg_entry=next(x for x in lib['registry']['concepts'] if x['canonicalConceptId']==CID)
role_counts=Counter(q.get('instructionalRole','unknown') for q in all_records)
for key in ['boss','bridge','calculation','elite','integration','legendary','legendaryBoss','main','repair','repairSeed']: role_counts.setdefault(key,0)
reg_entry['questionCountByRole']={k:role_counts[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']}
diff_counts=Counter(q.get('canonicalDifficulty','unknown') or 'unknown' for q in all_records)
reg_entry['questionCountByDifficulty']={k:diff_counts.get(k,0) for k in ['easy','medium','hard','elite','legendary','unknown']}
reg_entry['repairCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in concept.get('repairQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in all_main)}
reg_entry['bridgeCoverage']={'directSkillMatches':sum(bool(q.get('repairSkill')) for q in concept.get('bridgeQuestions',[])),'mainWithUsableSkill':sum(bool(q.get('primarySkill')) for q in all_main)}
reg_entry['calculationCoverage']=sum(q.get('type')=='calculation' for q in all_main)
reg_entry['graphCoverage']=sum(bool(q.get('image')) for q in all_main)
reg_entry['notes']='Fresh Principles of Microeconomics trade bank with four faculty-approved graph assets added in August 2026. New graph questions require direct use of import, export, tariff, or quota figures and state thousand-unit/thousand-dollar units explicitly where needed.'
reg_entry['coverageStatusNote']='Publisher-scale standalone bank with new graph-dependent import, export, tariff, quota, welfare, tariff-revenue, quota-rent, and deadweight-loss analysis.'

def concept_total(c):
 return sum(len(v) for v in c['questions'].values())+len(c.get('repairQuestions',[]))+len(c.get('bridgeQuestions',[]))+len(c.get('repairSeedQuestions',[]))

# Canonical count is unique canonical IDs across the library (some legacy records are intentionally shared).
all_canonical_ids=[]
for c in lib['concepts'].values():
 for arr in c['questions'].values(): all_canonical_ids.extend(q.get('canonicalId',q.get('id')) for q in arr)
 for key in ['repairQuestions','bridgeQuestions','repairSeedQuestions']: all_canonical_ids.extend(q.get('canonicalId',q.get('id')) for q in c.get(key,[]))
lib['canonicalQuestionCount']=len(set(all_canonical_ids))
lib['libraryVersion']=lib['libraryVersion'] if '-trade-graph-v2' in lib['libraryVersion'] else lib['libraryVersion']+'-trade-graph-v2'
lib['sourceCurationPhase']=PHASE; lib['sourceGeneratedAt']=GEN
lib['registry']['generatedAt']=GEN; lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='International Trade graph expansion v2: four approved graph assets and 56 new graph-dependent questions covering imports, exports, tariffs, quotas, welfare, revenue, rents, and deadweight loss.'
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
lib['librarySha256']=sha_text(json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True))
save_library(lib)
REG.write_text(json.dumps(lib['registry'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
manifest={'assetCount':len(lib['assetInventory']),'assets':lib['assetInventory'],'conceptCount':lib['conceptCount'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'generatedAt':GEN}
MAN.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Quality audit.
def normalize(s): return re.sub(r'[^a-z0-9 ]+',' ',s.lower())
def toks(s): return set(normalize(s).split())
exact_dups=[]; seen={}
for q in newqs:
 k=normalize(q['q'])
 if k in seen: exact_dups.append((seen[k],q['id']))
 else: seen[k]=q['id']
near=[]
for i,a in enumerate(newqs):
 ta=toks(a['q'])
 for b in newqs[i+1:]:
  tb=toks(b['q']); union=ta|tb
  if union:
   j=len(ta&tb)/len(union)
   if j>=0.86: near.append({'a':a['id'],'b':b['id'],'jaccard':round(j,3)})
correct_lens=[]; distract_lens=[]; pos_counts=Counter()
for q in newqs:
 correct_idx=next(i for i,opt in enumerate(q['options']) if answer_hash(opt)==q['aHash']); pos_counts[correct_idx]+=1
 correct_lens.append(len(q['options'][correct_idx])); distract_lens += [len(x) for i,x in enumerate(q['options']) if i!=correct_idx]
quality={'newQuestionCount':len(newqs),'graphCounts':dict(Counter(Path(q['image']).stem for q in newqs)),'poolCounts':dict(Counter(q['sourcePool'] for q in newqs)),'correctAnswerPositions':dict(pos_counts),'exactDuplicateCount':len(exact_dups),'exactDuplicates':exact_dups,'nearDuplicateCount':len(near),'nearDuplicates':near,'meanCorrectLength':sum(correct_lens)/len(correct_lens),'meanDistractorLength':sum(distract_lens)/len(distract_lens),'correctDistractorLengthRatio':(sum(correct_lens)/len(correct_lens))/(sum(distract_lens)/len(distract_lens))}
(ROOT/'phase6_2d_international_trade_graph_expansion_v2_quality_audit.json').write_text(json.dumps(quality,indent=2)+'\n')
result={'phase':PHASE,'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'newQuestionCount':len(newqs),'graphCounts':quality['graphCounts'],'poolCounts':quality['poolCounts'],'tradeCanonicalCount':concept_total(concept),'tradeGraphCount':reg_entry['graphCoverage'],'tradeAssetCount':len(concept['assets']),'globalCanonicalQuestionCount':lib['canonicalQuestionCount'],'globalAssetCount':len(lib['assetInventory']),'quality':quality}
(ROOT/'phase6_2d_international_trade_graph_expansion_v2_results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
