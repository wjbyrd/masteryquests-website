import json, hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parent
LIB=ROOT/'data/composer_library.js'
REG=ROOT/'data/composer_registry.json'
MAN=ROOT/'data/composer_library_manifest.json'
PHASE='phaseMicro3-trade-granularity-v1'
GEN='2026-08-11T00:24:00.000Z'
COMPOSER_VERSION='4.5h.0'
PARENT_ID='international-trade-and-trade-policy'
PARENT_TITLE='International Trade and Trade Policy'

raw=LIB.read_text(encoding='utf-8')
prefix='window.MQ_COMPOSER_LIBRARY='
text=raw.strip()
assert text.startswith(prefix) and text.endswith(';')
lib=json.loads(text[len(prefix):-1])
parent=lib['concepts'][PARENT_ID]

SUBTOPICS={
 'trade-world-price-status': {
  'title':'World Prices & Importer/Exporter Status',
  'description':'Interpret the world price and identify whether a small country imports or exports a good under free trade.',
  'objective':'ITP.1',
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Trade topic',
  'related':['trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers']
 },
 'trade-domestic-production-consumption-quantities': {
  'title':'Domestic Production, Consumption & Trade Quantities',
  'description':'Determine domestic production, domestic consumption, imports, and exports when a country trades at the world price.',
  'objective':'ITP.2',
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['trade-world-price-status','trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss','import-quotas-quota-rents']
 },
 'trade-gains-surplus-winners-losers': {
  'title':'Gains from Trade, Surplus & Winners/Losers',
  'description':'Calculate and interpret consumer, producer, and total-surplus changes from international trade and identify winners and losers.',
  'objective':'ITP.3',
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['trade-world-price-status','trade-domestic-production-consumption-quantities','consumer-and-producer-surplus','tariffs-revenue-deadweight-loss']
 },
 'tariffs-revenue-deadweight-loss': {
  'title':'Tariffs, Revenue & Deadweight Loss',
  'description':'Analyze tariff effects on domestic price, production, consumption, imports, government revenue, total surplus, and deadweight loss.',
  'objective':'ITP.4',
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers','import-quotas-quota-rents','trade-policy-efficiency-distribution']
 },
 'import-quotas-quota-rents': {
  'title':'Import Quotas, Quota Rents & Tariff–Quota Comparison',
  'description':'Analyze import quotas, quota rents, domestic price and quantity effects, welfare consequences, and tariff-versus-quota differences.',
  'objective':'ITP.5',
  'standaloneRecommendation':'standalone-ready',
  'coverageStatus':'ready-focused-subtopic',
  'coverageStatusLabel':'Ready for focused use',
  'related':['trade-domestic-production-consumption-quantities','tariffs-revenue-deadweight-loss','trade-policy-efficiency-distribution']
 },
 'trade-policy-efficiency-distribution': {
  'title':'Trade-Policy Arguments, Efficiency & Distribution',
  'description':'Evaluate trade-policy arguments using efficiency, distribution, evidence, and the tradeoffs created by protection.',
  'objective':'ITP.6',
  'standaloneRecommendation':'supporting-subtopic',
  'coverageStatus':'supporting-subtopic',
  'coverageStatusLabel':'Best paired with another Trade topic',
  'related':['trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss','import-quotas-quota-rents']
 }
}

objective_to_sub={spec['objective']:sid for sid,spec in SUBTOPICS.items()}
assert len(objective_to_sub)==len(SUBTOPICS)

def records():
 for pool,arr in parent.get('questions',{}).items():
  for q in arr: yield pool,q
 for pool in ('repairQuestions','bridgeQuestions','repairSeedQuestions'):
  for q in parent.get(pool,[]): yield pool,q

unmapped=[]
for pool,q in records():
 objective=q.get('objective') or ((q.get('outcomeIds') or [''])[0] if isinstance(q.get('outcomeIds'),list) else '')
 sid=objective_to_sub.get(objective)
 if not sid:
  unmapped.append((q.get('canonicalId') or q.get('id'), pool, objective, q.get('primarySkill') or q.get('repairSkill')))
  continue
 q['familyConceptId']=PARENT_ID
 q['subtopicIds']=[sid]

if unmapped:
 raise RuntimeError('Unmapped trade records: '+repr(unmapped[:20]))

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
parent_note=parent_entry.get('coverageStatusNote','').rstrip()
addition=' Granular Micro selection is available through six child subtopics while the parent continues to expose the full International Trade and Trade Policy family.'
if addition.strip() not in parent_note:
 parent_entry['coverageStatusNote']=parent_note+addition

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
 supporting=spec['standaloneRecommendation']=='supporting-subtopic'
 child_entries.append({
  'canonicalConceptId':sid,
  'title':spec['title'],
  'description':spec['description'],
  'includedSkills':skills,
  'excludedNeighboringSkills':['Other International Trade and Trade Policy material remains in the parent family or sibling subtopics.'],
  'prerequisiteConceptIds':['consumer-and-producer-surplus','demand','supply','market-equilibrium'],
  'relatedConceptIds':spec['related'],
  'sourceChapters':parent_entry.get('sourceChapters',[]),
  'sourceObjectives':[spec['objective']],
  'sourceGames':source_games or parent_entry.get('sourceGames',[]),
  'questionCountByRole':{k:role_counts[k] for k in ['main','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','integration','repairSeed']},
  'questionCountByDifficulty':{k:diff_counts[k] for k in ['easy','medium','hard','elite','legendary','unknown']},
  'repairCoverage':{'directSkillMatches':sum(1 for pool,q in recs if pool=='repairQuestions' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for pool,q in recs if pool not in ('repairQuestions','bridgeQuestions','repairSeedQuestions') and q.get('primarySkill'))},
  'bridgeCoverage':{'directSkillMatches':sum(1 for pool,q in recs if pool=='bridgeQuestions' and q.get('repairSkill')),'mainWithUsableSkill':sum(1 for pool,q in recs if pool not in ('repairQuestions','bridgeQuestions','repairSeedQuestions') and q.get('primarySkill'))},
  'calculationCoverage':calc_count,
  'graphCoverage':graph_count,
  'status':'active',
  'notes':'Derived Micro granularity slice of the existing International Trade and Trade Policy family. No questions were added, removed, or rewritten.',
  'instructionalClassification':'International Trade and Trade Policy subtopic',
  'coverageStatus':spec['coverageStatus'],
  'coverageStatusLabel':spec['coverageStatusLabel'],
  'coverageStatusNote':'This selector filters the existing International Trade and Trade Policy family by published objective metadata. World-price/status and trade-policy arguments are intentionally treated as targeted/supporting subtopics rather than padded to artificial full-campaign depth.' if supporting else 'This selector filters the existing International Trade and Trade Policy family by published objective metadata. It is intended for focused faculty composition without duplicating or rewriting questions.',
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
if not lib['libraryVersion'].endswith('-'+PHASE):
 lib['libraryVersion']=lib['libraryVersion']+'-'+PHASE
lib['sourceCurationPhase']=PHASE
lib['sourceGeneratedAt']=GEN
lib['conceptCount']=len(lib['concepts'])
lib['canonicalQuestionCount']=7274
lib['registry']['generatedAt']=GEN
lib['registry']['curationPhase']=PHASE
lib['registry']['curationSummary']='Trade granularity: preserve the 426-record International Trade and Trade Policy parent family and expose six Micro subtopic selectors through objective-based derived filtering; no question additions, deletions, or rewrites.'
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
 summary[sid]={'title':spec['title'],'objective':spec['objective'],'total':len(recs),'poolCounts':dict(counts),'standaloneRecommendation':spec['standaloneRecommendation']}
(ROOT/'phaseMicro3_trade_granularity_metadata_results.json').write_text(json.dumps({
 'phase':PHASE,'composerVersion':COMPOSER_VERSION,'libraryVersion':lib['libraryVersion'],'librarySha256':lib['librarySha256'],'canonicalQuestionCount':lib['canonicalQuestionCount'],'conceptCount':lib['conceptCount'],'parentRecordCount':sum(1 for _ in records()),'subtopics':summary
},indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
