"""Reconcile final local deliverables against this exact review revision batch."""
from pathlib import Path
import csv, hashlib, json
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
EXPORTS = ROOT / 'faculty_exports'
PROJECT = Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
ledger = read(HERE / 'expectations.json')
changes = {c['id']: c for c in ledger['changes']}
summary = read(EXPORTS / 'validation_summary.json')
source_hash = hashlib.sha256((ROOT / 'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert summary['status'] == 'complete' and summary['sources_unchanged']
assert summary['source_sha256'] == source_hash
covered = set()
for area, info in summary['disciplines'].items():
    with (EXPORTS / info['csv_file']).open(encoding='utf-8-sig', newline='') as stream:
        for row in csv.DictReader(stream):
            if row['Question ID'] not in changes:
                continue
            change = changes[row['Question ID']]
            q = change['afterRecord']
            assert row['Question'] == q['q']
            assert row['Difficulty'].lower() == q['canonicalDifficulty']
            assert row['Feedback'] == q.get('feedback', '')
            assert [row['Choice ' + k] for k in 'ABCD'] == q['options']
            assert row['Correct Answer'].startswith('ABCD'[change['correctIndex']] + ' ')
            covered.add(row['Question ID'])
assert covered == set(changes)
review = read(PROJECT / 'source/personal-review-list-data.json')
baseline = read(HERE / 'baseline/personal-review-list-data.json')
assert review['reviewSeed'] == baseline['reviewSeed']
assert review['librarySha256'] == ledger['afterLibrarySha256']
assert set(review['currentRevisionBatch']['questionIds']) == set(changes)
assert all(review['reviewSeed'][identity]['status'] == 'flag' for identity in changes)
assert all(review['reviewSeed'][identity]['status'] == 'pass' for identity in review['eliteReviewApproval']['ids'])
assert len(review['eliteReviewApproval']['ids']) == 65
reports = {name: read(HERE / name) for name in ['validation.json', 'review-validation.json', 'export-validation.json', 'excel-parity.json']}
for name in ['validation.json', 'review-validation.json', 'export-validation.json']:
    assert reports[name]['status'] == 'PASS'
assert len(reports['excel-parity.json']) == 4
logs = {name: read(HERE / (name + '.log')) for name in ['comprehensive', 'outcomes', 'easy-regression']}
assert logs['comprehensive']['status'] == logs['easy-regression']['status'] == 'PASS'
assert logs['outcomes']['ok']
artifacts = [EXPORTS / (area + '_question_bank.' + ext)
             for area in ['general_economics', 'microeconomics', 'macroeconomics'] for ext in ['pdf', 'xlsx']]
artifacts += [EXPORTS / 'microeconomics_manual_review.xlsx', PROJECT / 'deliverables/MasteryQuests_Question_Review.html']
result = {
    'status': 'PASS', 'verifiedAt': datetime.now(timezone.utc).isoformat(),
    'librarySha256': ledger['afterLibrarySha256'], 'sourceSha256': source_hash,
    'currentChangesVerifiedInExports': len(covered), 'reviewQuestions': len(review['questions']),
    'pendingUserVerification': 54, 'priorEliteApprovalsPreserved': 65,
    'allReviewSeedRecordsPreserved': True, 'testResults': logs,
    'visualInspection': {
        'pdf': ['general-P77-MVM-EL-015.png', 'micro-pdf-contact.png', 'macro-pdf-contact.png'],
        'xlsx': ['general-xlsx.png', 'micro-xlsx.png', 'macro-xlsx.png', 'manual-after.png'],
        'review': ['review-reclassification.png', 'review-graph.png', 'review-mobile.png'],
    },
    'artifacts': [{'path': p.as_posix(), 'bytes': p.stat().st_size,
                   'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts],
}
for group in result['visualInspection'].values():
    assert all((HERE / 'qa' / name).is_file() for name in group)
(HERE / 'delivery-verification.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
print(json.dumps({'status': 'PASS', 'questions': len(covered), 'artifacts': len(artifacts)}))
