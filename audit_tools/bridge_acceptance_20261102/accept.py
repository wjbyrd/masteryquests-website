"""Record approval of the 336 revised Bridge questions, preserving browser edits."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import copy, hashlib, json, shutil, subprocess, sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PROJECT = Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
SOURCE = PROJECT / 'source'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
source = SOURCE / 'personal-review-list-data.json'
raw = source.read_bytes()
data = json.loads(raw.decode('utf-8-sig'))
before = copy.deepcopy(data)
batch = data['currentRevisionBatch']
ledger = read(ROOT / 'audit_tools/bridge_pool_revision_20261102/expectations.json')
delivery = read(ROOT / 'audit_tools/bridge_pool_revision_20261102/delivery-verification.json')
assert batch['id'] == 'bridge-pool-revision-20261102' and batch['count'] == 336
assert not batch.get('accepted') and not batch.get('approval')
ids = set(batch['questionIds'])
assert ids == {r['id'] for r in ledger['changes']}
assert data['librarySha256'] == delivery['librarySha256']
assert sha(ROOT / 'build/faculty-build-composer/data/composer_library.js') == delivery['sourceSha256']
unchanged_artifacts = []
for artifact in delivery['artifacts']:
    p = Path(artifact['path'])
    if p.suffix.lower() in ('.pdf', '.xlsx'):
        assert sha(p) == artifact['sha256'], p
        unchanged_artifacts.append(artifact)

approved_at = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
questions = {q['id']: q for q in data['questions']}
approval = {
    'id': 'bridge-acceptance-20261102',
    'approvedAt': approved_at,
    'count': len(ids),
    'statement': 'I have done a heavy sampling of the bridge questions. based on what we’ve discussed I’m confident that you were thorough with all the bridge questions. go ahead and commit the bridge batch.',
    'questionRevisions': {id: questions[id]['revision'] for id in sorted(ids)},
}
prior = {}
for id in sorted(ids):
    q, r = questions[id], data['reviewSeed'][id]
    assert q['revision'].startswith('bridge-20261102-')
    assert not r['updated'] or r['updated'] < approved_at
    prior[id] = copy.deepcopy(r)
    if not r.get('previousReview') and (r['status'] != 'unknown' or r['answer'] is not None or r['notes'] or r.get('reasons')):
        r['previousReview'] = copy.deepcopy(r)
    # Keep the individual edit timestamp so newer browser-only notes/answers win
    # the existing merge. The approval has its own timestamp and exact revisions.
    r.update(status='pass', reviewedRevision=q['revision'])
batch['accepted'] = True
batch['approval'] = approval
data.setdefault('batchApprovals', []).append(approval)
for id, r in data['reviewSeed'].items():
    old = before['reviewSeed'][id]
    if id not in ids:
        assert r == old
    else:
        for field in ('notes', 'reasons', 'answer', 'answerRevision', 'updated'):
            assert r.get(field) == old.get(field)
        if old.get('previousReview'):
            assert r['previousReview'] == old['previousReview']
assert data['questions'] == before['questions']

template_path = SOURCE / 'review-template.html'
builder_path = SOURCE / 'build-review-html.py'
template_raw, builder_raw = template_path.read_bytes(), builder_path.read_bytes()
template = template_raw.decode('utf8').replace('\r\n', '\n')
builder = builder_raw.decode('utf8').replace('\r\n', '\n')
accept_js = '''// Batch approval follows the saved-progress merge. It changes status/version only;
// individual edit timestamps still select the newest notes and answer. Subsequent
// user actions and later question versions always take precedence.
function applyBatchApprovals(records){
 for(const approval of DATA.batchApprovals||[]){
  const approvedAt=Date.parse(approval.approvedAt);
  if(!Number.isFinite(approvedAt))continue;
  for(const [id,revision]of Object.entries(approval.questionRevisions||{})){
   const q=byId.get(id),r=records[id];
   if(!q||!r||q.revision!==revision||Date.parse(r.updated)>approvedAt)continue;
   if(r.status==='pass'&&r.reviewedRevision===revision)continue;
   if(!r.previousReview&&(r.status!=='unknown'||r.answer!==null||r.notes||r.reasons?.length))r.previousReview=JSON.parse(JSON.stringify(r));
   r.status='pass';r.reviewedRevision=revision;
  }
 }
 return records;
}
'''
replacements = [
    ('Review Bridge revisions opens the 336 updated questions, including previously excluded questions that changed.',
     'Bridge revisions awaiting review shows updated Bridge versions that still need review.'),
    ('The Bridge pool has been checked: 336 questions are updated and ready to review. Each revision focuses on a manageable application of the concept. Your earlier approvals, answers, and notes are preserved; review the new versions before accepting them.',
     'All 336 Bridge revisions are accepted following your sampling review. Continue with Medium questions not yet marked, or revisit the Bridge pool. Your earlier reviews, answers, and notes are preserved.'),
    ('<button id="reviewBridgeRevisions" class="primary">Review Bridge revisions</button><button id="reviewBridge">All Bridge questions</button><button id="continueMedium">Continue Medium review</button>',
     '<button id="continueMedium" class="primary">Continue Medium review</button><button id="reviewBridge">All Bridge questions</button><button id="reviewBridgeRevisions">Bridge revisions awaiting review</button>'),
    ("state=validRecords(DATA.reviewSeed||{});", accept_js + "state=applyBatchApprovals(validRecords(DATA.reviewSeed||{}));"),
    (" localStorage.setItem(KEY,JSON.stringify({version:1,records:state}));", " applyBatchApprovals(state);\n localStorage.setItem(KEY,JSON.stringify({version:1,records:state}));"),
    ("{state[id]=r;count++}}persist();filter();notify(`Restored", "{state[id]=r;count++}}applyBatchApprovals(state);persist();filter();notify(`Restored"),
    ("bridgeQueue(true);\n}\n</script>", "difficultyQueue('medium','unknown');\n}\n</script>"),
]
for old, new in replacements:
    assert template.count(old) == 1, old
    template = template.replace(old, new)
old = "reviewSeed=data.get('reviewSeed',{}),librarySha256="
assert builder.count(old) == 1
builder = builder.replace(old, "reviewSeed=data.get('reviewSeed',{}),batchApprovals=data.get('batchApprovals',[]),librarySha256=")
baseline = HERE / 'baseline'
assert not baseline.exists(), 'Already applied; use verification instead of accepting twice'
baseline.mkdir()
for name in ('personal-review-list-data.json', 'review-template.html', 'build-review-html.py'):
    shutil.copy2(SOURCE / name, baseline / name)
assert source.read_bytes() == raw and template_path.read_bytes() == template_raw and builder_path.read_bytes() == builder_raw
source.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
template_path.write_text(template, encoding='utf8')
builder_path.write_text(builder, encoding='utf8')
for name in ('review-template.html', 'build-review-html.py'):
    shutil.copy2(SOURCE / name, HERE / name)
subprocess.run([sys.executable, str(builder_path)], check=True)
medium = Counter(data['reviewSeed'][q['id']]['status'] for q in data['questions'] if q['q'].get('canonicalDifficulty') == 'medium')
report = {
    'status': 'PASS', 'approval': approval, 'priorReviewRecords': prior,
    'reviewStatusCounts': dict(Counter(r['status'] for r in data['reviewSeed'].values())),
    'mediumReviewQueue': dict(medium), 'defaultDifficulty': 'medium', 'defaultStatus': 'unknown',
    'otherReviewRecordsPreserved': len(data['reviewSeed']) - len(ids),
    'notesAnswersAndPriorHistoryPreserved': True,
    'librarySha256': data['librarySha256'], 'canonicalFileSha256': delivery['sourceSha256'],
    'unchangedPdfExcelArtifacts': unchanged_artifacts,
    'reviewDataSha256': sha(source), 'reviewHtmlSha256': sha(PROJECT / 'deliverables/MasteryQuests_Question_Review.html'),
}
(HERE / 'acceptance.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps({k: v for k, v in report.items() if k in ('status', 'reviewStatusCounts', 'mediumReviewQueue', 'otherReviewRecordsPreserved')}))
