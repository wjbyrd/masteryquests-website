"""Preserve accepted reviews and open the existing review tool on unmarked Medium."""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess, sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PROJECT = Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
SOURCE = PROJECT / 'source'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
source_path = SOURCE / 'personal-review-list-data.json'
source_bytes = source_path.read_bytes()
data = json.loads(source_bytes.decode('utf-8-sig'))
records = data['reviewSeed']
questions = {q['id']: q for q in data['questions']}
batch = data['currentRevisionBatch']
assert batch['approval']['count'] == batch['count'] == len(batch['questionIds']) == 54
for identity in batch['questionIds']:
    assert records[identity]['status'] == 'pass'
    assert records[identity]['reviewedRevision'] == questions[identity]['revision']
pending = [q['id'] for q in data['questions'] if q.get('revision') and records[q['id']]['status'] != 'unknown' and records[q['id']].get('reviewedRevision') != q['revision']]
assert not pending
assert all(records[identity]['status'] == 'pass' for identity in data['eliteReviewApproval']['ids'])
template_path = SOURCE / 'review-template.html'
template_bytes = template_path.read_bytes()
template = template_bytes.decode('utf8').replace('\r\n', '\n')
replacements = [
    ('All 54 updates from your latest flagged reviews are approved. Your earlier approvals and notes are preserved. Use the filters to continue reviewing or revisit any question.',
     'All 54 updates from your latest flagged reviews are accepted. Continue with Medium questions not yet marked. Your earlier approvals, notes, and review history are preserved.'),
    ('<button id="verifyElite" class="primary">Review updated questions</button>',
     '<button id="continueMedium" class="primary">Continue Medium review</button><button id="verifyElite">Review updated questions</button>'),
    ("function eliteQueue(status){$('search').value='';$('course').value='';$('topic').value='';$('difficulty').value='elite';$('status').value=status;filter();}",
     "function difficultyQueue(difficulty,status){$('search').value='';$('course').value='';$('topic').value='';$('difficulty').value=difficulty;$('status').value=status;filter();}"),
    ("$('continueElite').onclick=()=>eliteQueue('');",
     "$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');\n$('continueElite').onclick=()=>difficultyQueue('elite','');"),
    ("revisionQueue();\n}\n</script>", "difficultyQueue('medium','unknown');\n}\n</script>"),
]
for old, new in replacements:
    if old in template:
        assert template.count(old) == 1
        template = template.replace(old, new)
    else:
        assert new in template, 'Unexpected template version'
baseline = HERE / 'baseline'
baseline.mkdir(exist_ok=True)
for name in ['personal-review-list-data.json', 'review-template.html', 'build-review-html.py']:
    if not (baseline / name).exists():
        shutil.copy2(SOURCE / name, baseline / name)
assert source_path.read_bytes() == source_bytes
assert template_path.read_bytes() == template_bytes
template_path.write_text(template, encoding='utf8')
(HERE / 'review-template.html').write_text(template, encoding='utf8')
subprocess.run([sys.executable, str(SOURCE / 'build-review-html.py')], check=True)
assert source_path.read_bytes() == source_bytes
# The accepted content already exists in every question-bank export.
delivery = read(ROOT / 'audit_tools/review_flags_20261102/delivery-verification.json')
bank = ROOT / 'build/faculty-build-composer/data/composer_library.js'
assert hashlib.sha256(bank.read_bytes()).hexdigest() == delivery['sourceSha256']
for artifact in delivery['artifacts']:
    p = Path(artifact['path'])
    if p.suffix in ['.pdf', '.xlsx']:
        assert hashlib.sha256(p.read_bytes()).hexdigest() == artifact['sha256']
counts = dict(Counter(records[q['id']]['status'] for q in data['questions'] if q['q'].get('canonicalDifficulty') == 'medium'))
report = {
    'preparedAt': datetime.now(timezone.utc).isoformat(),
    'defaultDifficulty': 'medium', 'defaultStatus': 'unknown',
    'mediumReviewQueue': counts,
    'acceptedRevisionBatch': batch, 'pendingRevisionVerification': len(pending),
    'allReviewRecordsPreserved': len(records), 'priorEliteApprovalsPreserved': len(data['eliteReviewApproval']['ids']),
    'questionBankAndSevenPdfExcelArtifactsAlreadyCurrent': True,
    'librarySha256': data['librarySha256'],
    'reviewDataSha256': hashlib.sha256(source_bytes).hexdigest(),
    'reviewHtmlSha256': hashlib.sha256((PROJECT / 'deliverables/MasteryQuests_Question_Review.html').read_bytes()).hexdigest(),
}
(HERE / 'handoff.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8')
print(json.dumps({'status': 'PASS', 'mediumReviewQueue': counts, 'pendingRevisionVerification': len(pending), 'allReviewRecordsPreserved': len(records)}))
