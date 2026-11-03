"""Verify UI delivery and import scope without modifying questions or reviews."""
from pathlib import Path
import hashlib,json,re
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
before=read(HERE/'baseline/personal-review-list-data.json');after=read(PROJECT/'source/personal-review-list-data.json')
assert {k:v for k,v in before.items() if k!='reviewSeed'}=={k:v for k,v in after.items() if k!='reviewSeed'}
assert len(after['reviewSeed'])==7579
for identity,record in before['reviewSeed'].items():
    assert after['reviewSeed'][identity]['updated']>=record['updated']
    if 'previousReview' in record:assert after['reviewSeed'][identity]['previousReview']==record['previousReview']
html=(PROJECT/'deliverables/MasteryQuests_Question_Review.html').read_text(encoding='utf8')
payload=json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>',html,re.S).group(1))
assert payload['reviewSeed']==after['reviewSeed'] and payload['librarySha256']==after['librarySha256'] and payload['batchApprovals']==after['batchApprovals']
byid={q['id']:q for q in payload['questions']}
for row in after['questions']:
    q=byid[row['id']];assert q['stem']==row['q']['q'] and q['options']==row['q']['options'] and q['feedback']==row['q'].get('feedback','') and q['answer']==row['answer_index'] and q['revision']==row.get('revision','')
assert (HERE/'review-template.html').read_bytes()==(PROJECT/'source/review-template.html').read_bytes()
assert read(HERE/'validation.json')['status']=='PASS'
result={'status':'PASS','questionsAndRevisionHistoriesUnchanged':7579,'canonicalSourceHashUnchanged':hashlib.sha256((ROOT/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()==after['source_sha256'],'reviewRecordsPreserved':7579,'htmlSha256':hashlib.sha256(html.encode('utf8')).hexdigest(),'reviewSourceSha256':hashlib.sha256((PROJECT/'source/personal-review-list-data.json').read_bytes()).hexdigest()}
assert result['canonicalSourceHashUnchanged']
(HERE/'delivery-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
