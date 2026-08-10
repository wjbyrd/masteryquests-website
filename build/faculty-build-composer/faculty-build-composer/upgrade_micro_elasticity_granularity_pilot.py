import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseMicro1-elasticity-granularity-pilot-v1'
GEN='2026-08-10T23:41:00.000Z'
COMPOSER_VERSION='4.5f.0'

raw=LIB.read_text(encoding='utf-8')
prefix='window.MQ_COMPOSER_LIBRARY='
text=raw.strip()
assert text.startswith(prefix) and text.endswith(';')
lib=json.loads(text[len(prefix):-1])
parent=lib['concepts']['elasticity']

SUBTOPICS={
 'price-elasticity-of-demand': {
  'title':'Price Elasticity of Demand',
  'description':'Measure and interpret how quantity demanded responds to price changes, including determinants, midpoint calculations, classification, slope-versus-elasticity, and perfectly elastic or inelastic demand.',
  'skills':{
   'arc_vs_base_percent','budget_share_determinant','demand_elasticity_determinants','elasticity_classification','elasticity_definition','elasticity_unit_free','linear_demand_elasticity','market_definition_determinant','midpoint_formula','necessity_luxury_determinant','ped_calculation','ped_interpretation','perfectly_elastic_inelastic','slope_vs_elasticity','substitutes_determinant','time_horizon_demand'
  },
  'objectives':['ELAS.1','ELAS.2'],
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['price-elasticity-of-supply','elasticity-and-total-revenue','applications-of-elasticity']
 },
 'price-elasticity-of-supply': {
  'title':'Price Elasticity of Supply',
  'description':'Measure and interpret how quantity supplied responds to price changes, including time horizon, capacity, storage, determinants, and midpoint calculations.',
  'skills':{'capacity_storage_supply','pes_calculation','pes_definition','pes_interpretation','supply_elasticity_determinants','time_horizon_supply'},
  'objectives':['ELAS.4'],
  'standaloneRecommendation':'focused-assessment-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused assessment',
  'related':['price-elasticity-of-demand','applications-of-elasticity']
 },
 'income-elasticity-of-demand': {
  'title':'Income Elasticity of Demand',
  'description':'Calculate and interpret how demand responds to income changes, including normal, inferior, necessity, and luxury implications.',
  'skills':{'income_elasticity_calculation','income_elasticity_interpretation'},
  'objectives':['ELAS.5'],
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Elasticity topic',
  'related':['cross-price-elasticity-of-demand','price-elasticity-of-demand']
 },
 'cross-price-elasticity-of-demand': {
  'title':'Cross-Price Elasticity of Demand',
  'description':'Calculate and interpret how demand for one good responds to a price change in another, including substitutes and complements.',
  'skills':{'cross_price_elasticity_calculation','cross_price_elasticity_interpretation'},
  'objectives':['ELAS.5'],
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Elasticity topic',
  'related':['income-elasticity-of-demand','price-elasticity-of-demand']
 },
 'elasticity-and-total-revenue': {
  'title':'Elasticity and Total Revenue',
  'description':'Connect demand elasticity to total revenue, unit elasticity, revenue maximization, and the marginal-revenue relationship.',
  'skills':{'marginal_revenue_elasticity_link','revenue_maximization_unit_elastic','total_revenue_formula','total_revenue_test'},
  'objectives':['ELAS.3'],
  'standaloneRecommendation':'focused-assessment-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused assessment',
  'related':['price-elasticity-of-demand','applications-of-elasticity']
 },
 'applications-of-elasticity': {
  'title':'Applications of Elasticity',
  'description':'Apply elasticity to tax incidence, deadweight-loss sensitivity, business pricing, policy, trade, and factor-market decisions.',
  'skills':{'elasticity_business_pricing','elasticity_deadweight_loss','elasticity_factor_market_application','elasticity_policy_application','elasticity_trade_application','tax_incidence_elasticity'},
  'objectives':['ELAS.6'],
  'standaloneRecommendation':'focused-assessment-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused assessment',
  'related':['price-elasticity-of-demand','price-elasticity-of-supply','elasticity-and-total-revenue','tax-incidence','international-trade-and-trade-policy']
 }
}

skill_to_sub={}
for sid,spec in SUBTOPICS.items():
 for skill in spec['skills']:
  if skill in skill_to_sub:
   raise RuntimeError(f'duplicate skill assignment {skill}')
  skill_to_sub[skill]=sid

# Annotate every canonical Elasticity record. Source family identity stays intact.
def records():
 for pool,arr in parent.get('questions',{}).items():
  for q in arr: yield pool,q
 for pool in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
  for q in parent.get(pool,[]): yield pool,q

unmapped=[]
for pool,q in records():
 skill=q.get('primarySkill') or q.get('repairSkill')
 sid=skill_to_sub.get(skill)
 if not sid:
  unmapped.append((q.get('canonicalId') or q.get('id'), pool, skill))
  continue
 q['familyConceptId']='elasticity'
 q['subtopicIds']=[sid]

if unmapped:
 raise RuntimeError('Unmapped elasticity records: '+repr(unmapped[:20]))

# Add lightweight derived concept descriptors. Core materializes filtered modules at compose time.
for sid,spec in SUBTOPICS.items():
 lib['concepts'][sid]={
  'schemaVersion': parent.get('schemaVersion','1.2.0'),
  'canonicalConceptId': sid,
  'title': spec['title'],
  'description': spec['description'],
  'derivedFromConceptId':'elasticity',
  'subtopicFilterId':sid,
  'familyConceptId':'elasticity',
  'assetConceptId':'elasticity',
  'standaloneRecommendation':spec['standaloneRecommendation']
 }

# Build registry entries from the actual annotated records.
def filtered_records(sid):
 out=[]
 for pool,q in records():
  if sid in q.get('subtopicIds',[]): out.append((pool,q))
 return out

def role_of(pool,q):
 return q.get('instructionalRole') or ('repair' if pool=='repairQuestions' else 'bridge' if pool=='bridgeQuestions' else 'repairSeed' if pool=='repairSeedQuestions' else 'main')

existing_registry=[c for c in lib['registry']['concepts'] if c.get('canonicalConceptId') not in SUBTOPICS]
parent_entry=next(c for c in existing_registry if c.get('canonicalConceptId')=='elasticity')
parent_entry['childConceptIds']=list(SUBTOPICS)
parent_entry['selectionRole']='family-parent'
parent_entry['coverageStatusNote']=parent_entry.get('coverageStatusNote','')+' Granular Micro selection is available through six child subtopics while the parent continues to expose the full Elasticity family.'

child_entries=[]
for sid,spec in SUBTOPICS.items():
 recs=filtered_records(sid)
 qs=[q for _,q in recs]
 role_counts=Counter(role_of(pool,q) for pool,q in recs)
 for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']:
  role_counts.setdefault(k,0)
 diff_counts=Counter((q.get('canonicalDifficulty') or q.get('difficulty') or 'unknown') for q in qs)
 for k in ['easy','medium','hard','elite','legendary','unknown']:
  diff_counts.setdefault(k,0)
 skills=sorted({q.get('primarySkill') or q.get('repairSkill') for q in qs if q.get('primarySkill') or q.get('repairSkill')})
 source_games=sorted({q.get('sourceGame') for q in qs if q.get('sourceGame')})
 graph_count=sum(bool(q.get('image')) for q in qs)
 calc_count=sum(q.get('type')=='calculation' for q in qs)
 child_entries.append({
  'canonicalConceptId':sid,
  'title':spec['title'],
  'description':spec['description'],
  'includedSkills':skills,
  'excludedNeighboringSkills':[f'Other Elasticity material remains in the parent family or sibling subtopics.'],
  'prerequisiteConceptIds':['elasticity'],
  'relatedConceptIds':spec['related'],
  'sourceChapters':parent_entry.get('sourceChapters',[]),
  'sourceObjectives':spec['objectives'],
  'sourceGames':source_games or parent_entry.get('sourceGames',[]),
  'questionCountByRole':{k:role_counts[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']},
  'questionCountByDifficulty':{k:diff_counts[k] for k in ['easy','medium','hard','elite','legendary','unknown']},
  'repairCoverage':{'directSkillMatches':sum(1 for pool,q in recs if pool=='repairQuestions' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for pool,q in recs if pool not in ('repairQuestions','bridgeQuestions','repairSeedQuestions') and q.get('primarySkill'))},
  'bridgeCoverage':{'directSkillMatches':sum(1 for pool,q in recs if pool=='bridgeQuestions' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for pool,q in recs if pool not in ('repairQuestions','bridgeQuestions','repairSeedQuestions') and q.get('primarySkill'))},
  'calculationCoverage':calc_count,
  'graphCoverage':graph_count,
  'status':'active',
  'notes':'Derived Micro granularity slice of the existing Elasticity family. No questions were added, removed, or rewritten.',
  'instructionalClassification':'Elasticity subtopic',
  'coverageStatus':spec['coverageStatus'],
  'coverageStatusLabel':spec['coverageStatusLabel'],
  'coverageStatusNote':'This selector filters the existing Elasticity family by published skill metadata. Income and cross-price elasticity are intentionally treated as supporting subtopics rather than forced into artificial standalone depth.' if spec['standaloneRecommendation']=='supporting-subtopic' else 'This selector filters the existing Elasticity family by published skill metadata. It is intended for focused faculty composition without duplicating or rewriting questions.',
  'coverageFloorVersion':PHASE,
  'parentConceptId':'elasticity',
  'selectionRole':'family-child',
  'familyTitle':'Elasticity',
  'standaloneRecommendation':spec['standaloneRecommendation']
 })

# Keep global registry stable/alphabetical, but children directly follow parent for hierarchy-aware clients.
out=[]
for entry in existing_registry:
 out.append(entry)
 if entry.get('canonicalConceptId')=='elasticity': out.extend(child_entries)
lib['registry']['concepts']=out

lib['composerVersion']=COMPOSER_VERSION
lib['libraryVersion']=lib['libraryVersion']+'-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['conceptCount']=len(lib['concepts'])
# Canonical question count is physical unique source questions, not derived selectors.
lib['canonicalQuestionCount']=7274
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Elasticity granularity pilot: preserve the 418-record parent family and expose six Micro subtopic selectors through derived filtering; no question additions, deletions, or rewrites.'
lib['registry']['libraryVersion']=lib['libraryVersion']
lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']
lib['registry']['composerVersion']=COMPOSER_VERSION

# New hash reflects taxonomy metadata and derived descriptors while canonical question count stays frozen.
lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
blob=json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True).encode()
lib['librarySha256']=hashlib.sha256(blob).hexdigest()
# Keep the embedded registry hash value non-self-referential. The standalone registry
# receives the final top-level library hash below.

LIB.write_text('window.MQ_COMPOSER_LIBRARY='+json.dumps(lib,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
standalone_registry=json.loads(json.dumps(lib['registry']))
standalone_registry['librarySha256']=lib['librarySha256']
REG.write_text(json.dumps(standalone_registry,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
manifest={
 'assetCount':len(lib.get('assetInventory',[])),
 'assets':lib.get('assetInventory',[]),
 'conceptCount':lib['conceptCount'],
 'canonicalQuestionCount':lib['canonicalQuestionCount'],
 'libraryVersion':lib['libraryVersion'],
 'librarySha256':lib['librarySha256'],
 'generatedAt':GEN
}
MAN.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

# Summary for validation/reporting.
summary={}
for sid,spec in SUBTOPICS.items():
 recs=filtered_records(sid)
 counts=Counter(pool if pool in ('repairQuestions','bridgeQuestions','repairSeedQuestions') else pool for pool,_ in recs)
 summary[sid]={'title':spec['title'],'total':len(recs),'poolCounts':dict(counts),'standaloneRecommendation':spec['standaloneRecommendation']}
(ROOT/'phaseMicro1_elasticity_granularity_metadata_results.json').write_text(json.dumps({
 'phase':PHASE,'composerVersion':COMPOSER_VERSION,'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'conceptCount':lib['conceptCount'],'parentRecordCount':sum(1 for _ in records()),'subtopics':summary
},indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
