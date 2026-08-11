import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseMicro2-surplus-granularity-v1'
GEN='2026-08-11T00:08:00.000Z'
COMPOSER_VERSION='4.5g.0'
PARENT_ID='consumer-and-producer-surplus'
PARENT_TITLE='Consumer and Producer Surplus'

raw=LIB.read_text(encoding='utf-8')
prefix='window.MQ_COMPOSER_LIBRARY='
text=raw.strip()
assert text.startswith(prefix) and text.endswith(';')
lib=json.loads(text[len(prefix):-1])
parent=lib['concepts'][PARENT_ID]

SUBTOPICS={
 'consumer-surplus': {
  'title':'Consumer Surplus & Willingness to Pay',
  'description':'Explain willingness to pay and consumer surplus, including discrete-buyer and graph-area calculations.',
  'skills':{'willingness_to_pay','consumer_surplus_definition','consumer_surplus_discrete','consumer_surplus_graph_area'},
  'objectives':['CPS.1','CPS.2'],
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation']
 },
 'producer-surplus': {
  'title':'Producer Surplus & Willingness to Accept',
  'description':'Explain willingness to accept and producer surplus, including discrete-seller and graph-area calculations.',
  'skills':{'willingness_to_accept','producer_surplus_definition','producer_surplus_discrete','producer_surplus_graph_area'},
  'objectives':['CPS.1','CPS.2'],
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['consumer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation']
 },
 'total-surplus-gains-from-exchange': {
  'title':'Total Surplus & Gains from Exchange',
  'description':'Calculate and interpret total surplus and mutually beneficial gains from exchange without invoking later international-trade machinery.',
  'skills':{'total_surplus','gains_from_trade'},
  'objectives':['CPS.2','CPS.3'],
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['consumer-surplus','producer-surplus','efficient-quantity-allocation','gains-from-trade']
 },
 'efficient-quantity-allocation': {
  'title':'Efficient Quantity & Allocation',
  'description':'Identify marginal buyers and sellers, efficient quantity, efficient allocation, and competitive-market efficiency.',
  'skills':{'efficient_quantity','efficient_allocation','marginal_buyer_seller','market_efficiency'},
  'objectives':['CPS.3','CPS.5'],
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['total-surplus-gains-from-exchange','consumer-surplus','producer-surplus','efficiency-equity-surplus-limits']
 },
 'surplus-changes-policy-effects': {
  'title':'Changes in Surplus & Policy Effects',
  'description':'Trace how price, quantity, and bounded policy changes redistribute or reduce consumer, producer, and total surplus.',
  'skills':{'consumer_surplus_price_change','producer_surplus_price_change','surplus_policy_application'},
  'objectives':['CPS.4','CPS.6'],
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Surplus topic',
  'related':['consumer-surplus','producer-surplus','total-surplus-gains-from-exchange','efficient-quantity-allocation']
 },
 'efficiency-equity-surplus-limits': {
  'title':'Efficiency, Equity & Limits of Surplus Analysis',
  'description':'Distinguish efficiency from equity and evaluate limits of willingness-to-pay and surplus measures as welfare tools.',
  'skills':{'efficiency_equity_distinction','surplus_allocation_limits'},
  'objectives':['CPS.5'],
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Surplus topic',
  'related':['efficient-quantity-allocation','total-surplus-gains-from-exchange','surplus-changes-policy-effects']
 }
}

skill_to_sub={}
for sid,spec in SUBTOPICS.items():
 for skill in spec['skills']:
  if skill in skill_to_sub:
   raise RuntimeError(f'duplicate skill assignment {skill}')
  skill_to_sub[skill]=sid

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
 q['familyConceptId']=PARENT_ID
 q['subtopicIds']=[sid]

if unmapped:
 raise RuntimeError('Unmapped surplus records: '+repr(unmapped[:20]))

for sid,spec in SUBTOPICS.items():
 lib['concepts'][sid]={
  'schemaVersion': parent.get('schemaVersion','1.2.0'),
  'canonicalConceptId': sid,
  'title': spec['title'],
  'description': spec['description'],
  'derivedFromConceptId':PARENT_ID,
  'subtopicFilterId':sid,
  'familyConceptId':PARENT_ID,
  'assetConceptId':PARENT_ID,
  'standaloneRecommendation':spec['standaloneRecommendation']
 }

def filtered_records(sid):
 return [(pool,q) for pool,q in records() if sid in q.get('subtopicIds',[])]

def role_of(pool,q):
 return q.get('instructionalRole') or ('repair' if pool=='repairQuestions' else 'bridge' if pool=='bridgeQuestions' else 'repairSeed' if pool=='repairSeedQuestions' else 'main')

existing_registry=[c for c in lib['registry']['concepts'] if c.get('canonicalConceptId') not in SUBTOPICS]
parent_entry=next(c for c in existing_registry if c.get('canonicalConceptId')==PARENT_ID)
parent_entry['childConceptIds']=list(SUBTOPICS)
parent_entry['selectionRole']='family-parent'
parent_entry['coverageStatusNote']=parent_entry.get('coverageStatusNote','')+' Granular Micro selection is available through six child subtopics while the parent continues to expose the full Consumer and Producer Surplus family.'

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
  'excludedNeighboringSkills':['Other Consumer and Producer Surplus material remains in the parent family or sibling subtopics.'],
  'prerequisiteConceptIds':['demand','supply','market-equilibrium'],
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
  'notes':'Derived Micro granularity slice of the existing Consumer and Producer Surplus family. No questions were added, removed, or rewritten.',
  'instructionalClassification':'Consumer and Producer Surplus subtopic',
  'coverageStatus':spec['coverageStatus'],
  'coverageStatusLabel':spec['coverageStatusLabel'],
  'coverageStatusNote':'This selector filters the existing Consumer and Producer Surplus family by published skill metadata. Changes/policy effects and efficiency/equity/limits are intentionally treated as supporting subtopics rather than padded to artificial standalone depth.' if spec['standaloneRecommendation']=='supporting-subtopic' else 'This selector filters the existing Consumer and Producer Surplus family by published skill metadata. It is intended for focused faculty composition without duplicating or rewriting questions.',
  'coverageFloorVersion':PHASE,
  'parentConceptId':PARENT_ID,
  'selectionRole':'family-child',
  'familyTitle':PARENT_TITLE,
  'standaloneRecommendation':spec['standaloneRecommendation']
 })

out=[]
for entry in existing_registry:
 out.append(entry)
 if entry.get('canonicalConceptId')==PARENT_ID: out.extend(child_entries)
lib['registry']['concepts']=out

lib['composerVersion']=COMPOSER_VERSION
lib['libraryVersion']=lib['libraryVersion']+'-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['conceptCount']=len(lib['concepts'])
lib['canonicalQuestionCount']=7274
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Surplus granularity: preserve the 370-record Consumer and Producer Surplus parent family and expose six Micro subtopic selectors through derived filtering; no question additions, deletions, or rewrites.'
lib['registry']['libraryVersion']=lib['libraryVersion']
lib['registry']['canonicalQuestionCount']=lib['canonicalQuestionCount']
lib['registry']['composerVersion']=COMPOSER_VERSION

lib_nohash={k:v for k,v in lib.items() if k!='librarySha256'}
blob=json.dumps(lib_nohash,separators=(',',':'),ensure_ascii=False,sort_keys=True).encode()
lib['librarySha256']=hashlib.sha256(blob).hexdigest()

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

summary={}
for sid,spec in SUBTOPICS.items():
 recs=filtered_records(sid)
 counts=Counter(pool for pool,_ in recs)
 summary[sid]={'title':spec['title'],'total':len(recs),'poolCounts':dict(counts),'standaloneRecommendation':spec['standaloneRecommendation']}
(ROOT/'phaseMicro2_surplus_granularity_metadata_results.json').write_text(json.dumps({
 'phase':PHASE,'composerVersion':COMPOSER_VERSION,'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'conceptCount':lib['conceptCount'],'parentRecordCount':sum(1 for _ in records()),'subtopics':summary
},indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
