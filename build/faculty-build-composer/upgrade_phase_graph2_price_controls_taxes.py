import json, hashlib
from pathlib import Path
from collections import Counter
from PIL import Image
import unicodedata

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseGraph2-price-controls-taxes-v1'
GEN='2026-08-12T14:30:00.000Z'
SOURCE_ASSETS={
    'CEILING-01': Path('/mnt/data/CEILING-01.png'),
    'FLOOR-01': Path('/mnt/data/FLOOR-01.png'),
    'TAX-01': Path('/mnt/data/TAX-01.png'),
    'TAX-02': Path('/mnt/data/TAX-02.png'),
}
ASSET_CONCEPT={
    'CEILING-01':'binding-price-ceilings',
    'FLOOR-01':'binding-price-floors',
    'TAX-01':'tax-wedges-and-revenue',
    'TAX-02':'statutory-versus-economic-tax-incidence',
}
ASSET_TEXT={
'CEILING-01':{
 'imageAlt':'Apartment rental market with demand D0, supply S0, equilibrium point A, and a horizontal price ceiling at $1,000 per month.',
 'graphDescription':'The horizontal axis is quantity of apartments and the vertical axis is rental rate per month. Demand D0 and supply S0 intersect at point A, quantity 150 and rent $2,000. A horizontal legal price ceiling is shown at $1,000. At the ceiling, quantity supplied is 50 apartments and quantity demanded is 250 apartments, creating a shortage of 200 apartments.'},
'FLOOR-01':{
 'imageAlt':'Labor market with demand D0, supply S0, equilibrium point A, and a horizontal wage floor at $10 per hour.',
 'graphDescription':'The horizontal axis is quantity of workers in thousands and the vertical axis is wage rate per hour. Labor demand D0 and labor supply S0 intersect at point A, 175 thousand workers and a $7 wage. A horizontal wage floor is shown at $10. At the floor, labor demanded is 100 thousand workers and labor supplied is 250 thousand workers, creating a labor surplus of 150 thousand workers.'},
'TAX-01':{
 'imageAlt':'Movie market with demand D0, original supply S0, and a parallel supply-with-tax curve above S0.',
 'graphDescription':'The horizontal axis is quantity of movies in thousands and the vertical axis is price of movies. Demand D0 and original supply S0 intersect at point e, price $12 and quantity 140 thousand. A parallel curve labeled Supply with tax is $4 above S0. After the tax, demand intersects the shifted supply curve at quantity 100 thousand and buyer price $14. At that quantity the original supply curve is at $10, so sellers receive $10, the per-unit tax wedge is $4, and quantity falls by 40 thousand.'},
'TAX-02':{
 'imageAlt':'Movie market with original demand D0, supply S0, and a parallel demand-with-tax curve below D0.',
 'graphDescription':'The horizontal axis is quantity of movies in thousands and the vertical axis is price of movies. Original demand D0 and supply S0 intersect at point e, quantity 100 thousand and price $10.50. A parallel curve labeled Demand with tax lies $6 below D0. After the buyer-side tax, quantity is 60 thousand. Sellers receive $7.50 at the intersection of supply and demand with tax, while buyers pay $13.50 on the original demand curve at that same quantity. The $6 wedge is split equally relative to the original $10.50 equilibrium price, and quantity falls by 40 thousand.'},
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

# Install four approved graphs as canonical WebP assets.
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
def add(concept,asset,pool,skill,typ,stem,correct,distractors,feedback,secondary=None,repair=None,common='misreads_graph_or_policy_effect'):
    specs.append(dict(concept=concept,asset=asset,pool=pool,skill=skill,typ=typ,stem=stem,correct=correct,distractors=distractors,feedback=feedback,secondary=secondary or [],repair=repair or skill,common=common))

# -------------------- CEILING-01 --------------------
add('binding-price-ceilings','CEILING-01','easy','binding_price_ceiling','graph',
    'The apartment market shown has an equilibrium rent of $2,000 per month. How should the legal maximum rent of $1,000 be classified?',
    'A binding price ceiling because it is below the equilibrium rent',
    ['A nonbinding price ceiling because it is below the equilibrium rent','A binding price floor because it is below equilibrium','A nonbinding price floor because quantity demanded exceeds quantity supplied'],
    'A price ceiling is binding when it is set below the market equilibrium price. The graph places the ceiling at $1,000, below the $2,000 equilibrium rent.')
add('binding-price-ceilings','CEILING-01','medium','ceiling_shortage_calculation','calculation',
    'At the $1,000 rent ceiling shown, landlords offer 50 apartments while renters demand 250. What shortage does the graph imply?',
    '200 apartments',
    ['50 apartments','150 apartments','300 apartments'],
    'The shortage is quantity demanded minus quantity supplied: 250 - 50 = 200 apartments.')
add('binding-price-ceilings','CEILING-01','medium','ceiling_quantity_reading','graph',
    'At the binding $1,000 rent ceiling, what is the maximum number of apartments that can be rented if transactions cannot exceed the number landlords offer?',
    '50 apartments',
    ['150 apartments','200 apartments','250 apartments'],
    'At $1,000, quantity supplied is only 50 apartments. Even though 250 are demanded, actual transactions cannot exceed the 50 units offered.')
add('binding-price-ceilings','CEILING-01','hard','binding_ceiling_shortage_calculation','multi-step',
    'Compare the $2,000 equilibrium with the $1,000 ceiling. Which decomposition correctly explains the 200-apartment shortage?',
    'Quantity demanded rises by 100 and quantity supplied falls by 100, creating a 200-apartment gap',
    ['Quantity demanded falls by 100 and quantity supplied rises by 100, creating a 200-apartment gap','Quantity demanded rises by 200 while quantity supplied stays at 150','Quantity supplied falls by 200 while quantity demanded stays at 150'],
    'At equilibrium both quantities are 150. At $1,000, quantity demanded is 250 and quantity supplied is 50. Demand therefore rises by 100 while supply falls by 100, opening a 200-unit shortage.',secondary=['ceiling_shortage_calculation'])
add('binding-price-ceilings','CEILING-01','elite','ceiling_shortage_rationing','analysis',
    'A student looks at the $1,000 ceiling and says, “Because 250 apartments are demanded, 250 apartments will be rented.” What is the graph-based correction?',
    'Only 50 apartments are supplied, so at most 50 can be rented and 200 apartments of demand go unsatisfied',
    ['All 250 apartments will be rented because quantity demanded determines transactions under a ceiling','Exactly 150 apartments will be rented because the old equilibrium quantity cannot change','The ceiling creates a 200-apartment surplus, so landlords must rent all 250 units'],
    'Quantity demanded is not the same thing as quantity traded. At the ceiling, landlords supply only 50 apartments, so the market is short by 200 units.',secondary=['nonprice_rationing'])
add('binding-price-ceilings','CEILING-01','legendary','ceiling_nonmoney_costs_and_misallocation','multi-step',
    'The $1,000 ceiling leaves 250 renters seeking apartments but only 50 apartments offered. Which conclusion follows most directly from the graph and the logic of a binding ceiling?',
    'Two hundred apartments of excess demand must be rationed somehow, and the graph alone cannot determine which renters obtain the 50 available units',
    ['The 200-unit shortage guarantees that the legal rent will immediately rise to $2,000 despite the ceiling','All 250 renters can obtain apartments because the ceiling makes housing more affordable','The graph proves landlords will build 200 additional apartments to eliminate the shortage'],
    'The graph establishes a 200-apartment shortage. A binding ceiling blocks price from doing the full rationing job, so other allocation mechanisms can matter; the graph does not identify which renters receive the limited units.',secondary=['ceiling_shortage_rationing'])

# -------------------- FLOOR-01 --------------------
add('binding-price-floors','FLOOR-01','easy','binding_price_floor','graph',
    'The labor market shown has an equilibrium wage of $7 per hour. How should the $10 legal minimum wage be classified?',
    'A binding price floor because it is above the equilibrium wage',
    ['A nonbinding price floor because it is above the equilibrium wage','A binding price ceiling because it is above equilibrium','A nonbinding price ceiling because labor supply exceeds labor demand'],
    'A price floor is binding when it is set above equilibrium. The $10 wage floor sits above the $7 market-clearing wage.')
add('binding-price-floors','FLOOR-01','medium','minimum_wage_surplus_calculation','calculation',
    'At the $10 wage floor shown, 250 thousand workers want jobs while firms demand 100 thousand workers. What labor surplus results?',
    '150 thousand workers',
    ['75 thousand workers','100 thousand workers','350 thousand workers'],
    'Labor surplus equals labor supplied minus labor demanded: 250 thousand - 100 thousand = 150 thousand workers.')
add('binding-price-floors','FLOOR-01','medium','floor_quantity_demanded','graph',
    'At the binding $10 minimum wage, how many workers can be employed if employment cannot exceed firms’ quantity of labor demanded?',
    '100 thousand workers',
    ['150 thousand workers','175 thousand workers','250 thousand workers'],
    'At $10, firms demand 100 thousand workers. The larger 250-thousand labor supply does not force firms to hire beyond their quantity demanded.')
add('binding-price-floors','FLOOR-01','hard','binding_floor_surplus_calculation','multi-step',
    'Compare the $7 labor-market equilibrium with the $10 wage floor. Which decomposition correctly explains the 150-thousand-worker labor surplus?',
    'Labor supplied rises by 75 thousand while labor demanded falls by 75 thousand, creating a 150-thousand-worker gap',
    ['Labor supplied falls by 75 thousand while labor demanded rises by 75 thousand','Labor supplied rises by 150 thousand while labor demand remains at 175 thousand','Labor demanded falls by 150 thousand while labor supply remains at 175 thousand'],
    'At equilibrium, both labor supplied and demanded equal 175 thousand. At $10, labor supplied is 250 thousand and labor demanded is 100 thousand, so the two 75-thousand movements create the 150-thousand surplus.',secondary=['minimum_wage_surplus_calculation'])
add('binding-price-floors','FLOOR-01','elite','floor_surplus_rationing','analysis',
    'A student says the $10 minimum wage raises employment to 250 thousand because 250 thousand workers are willing to work. What is the strongest correction using the graph?',
    'Firms demand only 100 thousand workers at $10, so employment is limited to 100 thousand and 150 thousand workers are left in surplus',
    ['Employment must equal labor supply, so all 250 thousand workers are hired','Employment remains fixed at the old equilibrium of 175 thousand regardless of the wage floor','The 150-thousand gap is a labor shortage, so firms compete for workers'],
    'A binding minimum wage creates excess labor supply, not automatic jobs. At $10, firms demand 100 thousand workers while 250 thousand seek work.',secondary=['minimum_wage_tradeoff'])
add('binding-price-floors','FLOOR-01','legendary','minimum_wage_tradeoff','multi-step',
    'Using the graph, compare the $10 binding minimum wage with the $7 competitive equilibrium. Which transition is correct if the floor is reduced from $10 to $7?',
    'Employment rises from 100 thousand to 175 thousand and the 150-thousand-worker labor surplus disappears',
    ['Employment falls from 250 thousand to 175 thousand and a labor shortage appears','Employment stays at 100 thousand because the old wage floor permanently fixes hiring','Labor supplied and labor demanded both rise to 250 thousand at $7'],
    'At $10, labor demand is 100 thousand and labor supply is 250 thousand. At $7, both equal 175 thousand, so employment rises to the equilibrium quantity and the labor surplus vanishes.',secondary=['binding_price_floor','floor_surplus_effect'])

# -------------------- TAX-01: seller-side tax shown as upward supply shift --------------------
add('tax-wedges-and-revenue','TAX-01','easy','tax_wedge_calculation','graph',
    'In the displayed movie market, how large is the vertical gap between S0 and the parallel “Supply with tax” curve at a given quantity?',
    '$4 per movie',
    ['$2 per movie','$10 per movie','$14 per movie'],
    'At quantity 100 thousand, S0 is at $10 while Supply with tax is at $14. The parallel vertical gap is therefore $4 per movie.')
add('tax-wedges-and-revenue','TAX-01','medium','tax_wedge_identification','graph',
    'After the seller-side tax shown, quantity falls to 100 thousand movies. What prices do buyers pay and sellers receive?',
    'Buyers pay $14 and sellers receive $10',
    ['Buyers pay $12 and sellers receive $12','Buyers pay $10 and sellers receive $14','Buyers pay $14 and sellers receive $12'],
    'At the post-tax quantity of 100 thousand, demand gives the buyer price of $14 while the original supply curve gives the seller receipt of $10.')
add('tax-wedges-and-revenue','TAX-01','medium','tax_quantity_reduction_calculation','calculation',
    'The graph shows quantity falling from 140 thousand movies before the tax to 100 thousand after the tax. By how much does market quantity fall?',
    '40 thousand movies',
    ['20 thousand movies','100 thousand movies','240 thousand movies'],
    'The reduction in quantity traded is 140 thousand - 100 thousand = 40 thousand movies.')
add('tax-wedges-and-revenue','TAX-01','hard','tax_revenue_calculation','multi-step',
    'The graph implies a $4 tax per movie and a post-tax quantity of 100 thousand movies. How much tax revenue is collected?',
    '$400,000',
    ['$40,000','$100,000','$4,000,000'],
    'Tax revenue equals the $4 per-unit tax times 100 thousand units sold: $4 × 100,000 = $400,000.')
add('tax-wedges-and-revenue','TAX-01','elite','tax_revenue_from_burden_split','analysis',
    'Before the tax, the movie market is at $12. After the tax, buyers pay $14 and sellers receive $10. Which burden calculation matches the graph?',
    'Buyers bear $2 per movie and sellers bear $2 per movie',
    ['Buyers bear all $4 because the market price rises','Sellers bear all $4 because the tax is placed on supply','Buyers bear $4 and sellers bear $2, for a $6 total burden'],
    'Relative to the original $12 price, buyers pay $2 more and sellers receive $2 less. Those two pieces add to the $4 tax wedge.',secondary=['tax_incidence'])
add('tax-wedges-and-revenue','TAX-01','legendary','tax_wedge_market_shrinkage_synthesis','multi-step',
    'The tax is drawn as an upward shift of supply, yet the graph shows buyers paying $2 more, sellers receiving $2 less, and quantity falling by 40 thousand. What is the best synthesis?',
    'Legal placement on sellers does not force sellers to bear the entire economic burden; the tax creates a $4 wedge shared by both sides and reduces trade',
    ['Because supply shifts, sellers necessarily bear the full $4 tax while buyers are unaffected','The tax raises both buyer and seller prices by $2, so neither side bears a burden','The 40-thousand quantity decline means the tax wedge must be $40 rather than $4'],
    'The graph separates statutory placement from market incidence. Buyers pay more, sellers net less, and fewer units are traded; the $4 wedge is split $2/$2 here.',secondary=['legal_vs_economic_tax_incidence','tax_quantity_effect'])

# -------------------- TAX-02: buyer-side tax shown as downward demand shift --------------------
add('statutory-versus-economic-tax-incidence','TAX-02','easy','legal_vs_economic_tax_burden','graph',
    'At the post-tax quantity of 60 thousand movies, what price do sellers receive according to the supply curve?',
    '$7.50 per movie',
    ['$10.50 per movie','$13.50 per movie','$6.00 per movie'],
    'At quantity 60 thousand, the shifted demand curve intersects supply at $7.50. That is the amount sellers receive before the buyer remits the tax.')
add('statutory-versus-economic-tax-incidence','TAX-02','medium','buyer_seller_tax_equivalence','calculation',
    'At 60 thousand movies, buyers pay $13.50 while sellers receive $7.50. What per-unit tax wedge separates those prices?',
    '$6 per movie',
    ['$3 per movie','$7.50 per movie','$21 per movie'],
    'The tax wedge is the buyer price minus the seller receipt: $13.50 - $7.50 = $6.')
add('statutory-versus-economic-tax-incidence','TAX-02','medium','statutory_vs_economic_incidence','analysis',
    'The original equilibrium price is $10.50. After the buyer-side tax, buyers pay $13.50 and sellers receive $7.50. How is the $6 economic burden split?',
    '$3 on buyers and $3 on sellers',
    ['$6 on buyers and $0 on sellers','$0 on buyers and $6 on sellers','$1.50 on buyers and $4.50 on sellers'],
    'Buyers pay $3 more than the original $10.50 price, while sellers receive $3 less. The legal placement on buyers does not make buyers bear the entire tax.')
add('statutory-versus-economic-tax-incidence','TAX-02','hard','tax_equivalence_application','calculation',
    'The graph shows the original quantity at 100 thousand movies and the post-tax quantity at 60 thousand. What market effect accompanies the buyer-side tax?',
    'Quantity traded falls by 40 thousand movies',
    ['Quantity traded rises by 40 thousand movies','Quantity traded stays at 100 thousand movies','Quantity traded falls by 60 thousand movies'],
    'Quantity falls from 100 thousand to 60 thousand, a decline of 40 thousand movies. Sellers are therefore affected even though buyers legally remit the tax.')
add('statutory-versus-economic-tax-incidence','TAX-02','elite','buyer_seller_tax_equivalence','multi-step',
    'Suppose the same $6 per-movie tax were legally collected from sellers instead of buyers, with the same supply and demand curves. What standard supply-and-demand result should be expected?',
    'The same 60-thousand quantity, $13.50 buyer price, and $7.50 seller receipt',
    ['Buyers would return to $10.50 while sellers alone would lose $6','Quantity would return to 100 thousand because seller taxes do not affect demand','The buyer price would fall to $7.50 and the seller receipt would rise to $13.50'],
    'With unchanged market elasticities and the same per-unit tax, shifting the legal remittance side changes how the tax is drawn, not the competitive equilibrium wedge or economic incidence.',secondary=['tax_equivalence_application'])
add('statutory-versus-economic-tax-incidence','TAX-02','legendary','tax_incidence_misconception_detection','multi-step',
    'A student sees “Demand with tax” and concludes, “Buyers must bear the full $6 because the tax is legally placed on them.” Which graph-based accounting defeats that claim?',
    'Buyers pay $3 more than the original price, sellers receive $3 less, and the $6 wedge is therefore shared equally in this market',
    ['Buyers pay $6 more while sellers still receive the original $10.50, so the claim is correct','Sellers receive $6 less while buyers still pay $10.50, so buyers bear none of the tax','The quantity drop from 100 thousand to 60 thousand proves incidence cannot be measured from prices'],
    'Economic incidence is measured by changes from the original equilibrium price, not by who sends the tax payment to government. Here the buyer increase and seller decrease are both $3.',secondary=['legal_vs_economic_tax_incidence','buyer_seller_tax_equivalence'])

# Build question records with balanced answer positions.
existing_ids=set()
for c in lib['concepts'].values():
    for arr in c.get('questions',{}).values():
        existing_ids.update(q.get('id') for q in arr)
    existing_ids.update(q.get('id') for q in c.get('repairQuestions',[]))
    existing_ids.update(q.get('id') for q in c.get('bridgeQuestions',[]))

code_map={'binding-price-ceilings':'CEIL','binding-price-floors':'FLR','tax-wedges-and-revenue':'TAX','statutory-versus-economic-tax-incidence':'STX'}
pool_code={'easy':'E','medium':'M','hard':'H','elite':'EL','legendary':'L'}
objective_map={'binding-price-ceilings':'LO6.1','binding-price-floors':'LO6.2','tax-wedges-and-revenue':'LO6.3','statutory-versus-economic-tax-incidence':'LO6.4'}
tag_map={'binding-price-ceilings':'price_ceiling','binding-price-floors':'price_floor','tax-wedges-and-revenue':'taxes','statutory-versus-economic-tax-incidence':'tax_incidence'}
cluster_map={'binding-price-ceilings':'market_policy','binding-price-floors':'market_policy','tax-wedges-and-revenue':'tax_policy','statutory-versus-economic-tax-incidence':'tax_policy'}
counts=Counter(); newqs=[]
for idx,s in enumerate(specs):
    counts[(s['concept'],s['pool'])]+=1
    serial=counts[(s['concept'],s['pool'])]
    qid=f"PG2-{code_map[s['concept']]}-{pool_code[s['pool']]}-{serial:03d}"
    if qid in existing_ids: raise RuntimeError(f'duplicate id {qid}')
    pos=idx % 4
    opts=list(s['distractors']); opts.insert(pos,s['correct'])
    image=f"question-assets/{s['concept']}/{s['asset']}.webp"
    source_id=861000+idx
    source_hash=sha_text(json.dumps({'q':s['stem'],'options':opts,'image':image,'skill':s['skill']},sort_keys=True,ensure_ascii=False))
    role='elite' if s['pool']=='elite' else ('legendary' if s['pool']=='legendary' else 'main')
    secondary_ids=[]
    if s['concept']=='tax-wedges-and-revenue' and any(x in s['secondary'] for x in ['tax_incidence','legal_vs_economic_tax_incidence']):
        secondary_ids=['tax-incidence']
    if s['concept']=='statutory-versus-economic-tax-incidence':
        secondary_ids=['tax-incidence']
    q={
        'id':qid,'q':s['stem'],'options':opts,'tag':tag_map[s['concept']],'type':s['typ'],'objective':objective_map[s['concept']],
        'difficulty':s['pool'],'conceptCluster':cluster_map[s['concept']],'primarySkill':s['skill'],
        'secondarySkills':s['secondary'],'repairSkill':s['repair'],'commonError':s['common'],
        'feedback':s['feedback'],'image':image,'aHash':sha_answer(s['correct']),'canonicalId':qid,
        'sourceId':source_id,'sourceGame':'micro-concept-library','sourceChapter':[s['concept']],
        'sourcePool':s['pool'],'sourceHash':source_hash,'sourceOccurrences':[{
            'sourceGame':'micro-concept-library','sourceFile':PHASE,'sourceGlobal':'questions','sourcePool':s['pool'],
            'routeKey':s['skill'],'sourceRecordOrder':idx,'sourceId':source_id,'sourceHash':source_hash}],
        'primaryConceptId':s['concept'],'secondaryConceptIds':secondary_ids,'instructionalRole':role,
        'canonicalDifficulty':s['pool'],'originalSourcePool':s['pool'],'originalBossTier':None
    }
    lib['concepts'][s['concept']]['questions'][s['pool']].append(q)
    newqs.append(q)

(ROOT/f'{PHASE}_questions.json').write_text(json.dumps(newqs,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Refresh registry metrics for touched concepts.
def concept_records(c):
    main=[q for arr in c['questions'].values() for q in arr]
    return main + c.get('repairQuestions',[]) + c.get('bridgeQuestions',[]) + c.get('repairSeedQuestions',[]), main

for cid in ASSET_CONCEPT.values():
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
    if cid=='binding-price-ceilings':
        re['coverageStatusNote']='Phase Graph 2 adds a dedicated apartment-rent ceiling graph with equilibrium, shortage, transaction-limit, decomposition, and rationing questions from easy through Legendary.'
    elif cid=='binding-price-floors':
        re['coverageStatusNote']='Phase Graph 2 adds a dedicated labor-market minimum-wage graph with equilibrium, labor-surplus, employment-limit, decomposition, and adjustment questions from easy through Legendary.'
    elif cid=='tax-wedges-and-revenue':
        re['coverageStatusNote']='Phase Graph 2 adds a clean seller-side per-unit tax graph for wedge, buyer/seller prices, quantity reduction, revenue, burden split, and market-shrinkage reasoning.'
    elif cid=='statutory-versus-economic-tax-incidence':
        re['coverageStatusNote']='Phase Graph 2 adds a buyer-side tax graph that separates statutory remittance from economic incidence and tests buyer/seller tax equivalence through Legendary.'

# Canonical count is unique canonical question IDs.
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
lib['registry']['curationSummary']='Phase Graph 2: four approved price-control and tax assets plus 24 graph-dependent questions. Coverage emphasizes binding ceilings/floors, shortage/surplus mechanics, transaction limits, tax wedges and revenue, and statutory-versus-economic incidence.'
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
