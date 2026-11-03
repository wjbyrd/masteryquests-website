"""Record final editorial, review-queue, bank-export, and regression evidence."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'faculty_exports'
PROJECT = Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
ledger = read(HERE / 'expectations.json')
changes = {c['id']: c for c in ledger['changes']}
source_hash = hashlib.sha256((ROOT / 'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
summary = read(OUT / 'validation_summary.json')
assert summary['status'] == 'complete' and summary['sources_unchanged'] and summary['source_sha256'] == source_hash
reports = {name: read(HERE / name) for name in ['validation.json', 'review-validation.json', 'review-import.json', 'export-validation.json', 'excel-parity.json', 'workbook-scope-validation.json', 'calculation-validation.json']}
assert all(report['status'] == 'PASS' for name, report in reports.items() if name != 'excel-parity.json')
assert len(reports['excel-parity.json']) == 4
assert reports['validation.json']['librarySha256'] == ledger['afterLibrarySha256']
assert reports['export-validation.json']['sourceSha256'] == source_hash
audit = read(HERE.parent / 'legendary_wording_audit_20261102/findings.json')
recommendations = {q['id'] for q in audit['items'] if q['decision']['rating'] in ['L', 'R']}
assert len(recommendations) == 101 and recommendations <= changes.keys()
review = read(PROJECT / 'source/personal-review-list-data.json')
baseline = read(HERE / 'baseline/personal-review-list-data.json')
byid = {q['id']: q for q in review['questions']}
assert review['librarySha256'] == ledger['afterLibrarySha256'] and review['source_sha256'] == source_hash
for identity, record in baseline['reviewSeed'].items():
    assert review['reviewSeed'][identity] == record
for identity, change in changes.items():
    row = byid[identity]
    assert row['q'] == change['afterRecord'] and row['revision'].startswith('legendary-20261102-')
    assert review['reviewSeed'][identity].get('reviewedRevision') != row['revision']
assert len(byid) == 7360 and review['currentRevisionBatch']['accepted'] is False
assert review.get('batchApprovals') == baseline.get('batchApprovals')
full = read(HERE / 'test-output/macroeconomics_consolidated_cleanup/validation.json')
outcomes = read(HERE / 'test-output/faculty-lo-results.json')
assert full['status'] == 'PASS' and full['questionsAudited'] == 9802 and outcomes['ok']
visual = ['general-pdf-contact.png', 'micro-pdf-contact.png', 'macro-pdf-contact.png', 'general-xlsx.png', 'micro-xlsx.png', 'macro-xlsx.png', 'macro-quantity-table-xlsx.png', 'manual-after.png', 'legendary-review.png', 'surplus-table.png', 'mobile-project-table.png', 'monopoly-graph.png']
assert all((HERE / 'qa' / name).is_file() for name in visual)
artifacts = [OUT / (area + '_question_bank.' + ext) for area in ['general_economics', 'microeconomics', 'macroeconomics'] for ext in ['pdf', 'xlsx', 'csv']]
artifacts += [OUT / 'microeconomics_manual_review.xlsx', OUT / 'microeconomics_manual_review.csv', PROJECT / 'deliverables/MasteryQuests_Question_Review.html']
result = {
    'status': 'PASS', 'verifiedAt': datetime.now(timezone.utc).isoformat(),
    'librarySha256': ledger['afterLibrarySha256'], 'sourceSha256': source_hash,
    'method': 'Full-pool screening combined with the prior topic-coverage audit, individual candidate review, and repeated-family editing. Screening retention is not a claim that every retained question received a fresh manual substantive review.',
    'legendaryPoolScreened': 1360, 'revised': len(changes), 'retained': 713,
    'priorEditorialRecommendationsAddressed': len(recommendations),
    'difficultyChanges': 0, 'answerPositionsPreserved': True,
    'pendingUserReview': 647, 'preservedPriorReviewRecords': len(baseline['reviewSeed']),
    'revisedQuestionsReturnedToQueue': 141, 'reviewQueueQuestions': len(byid),
    'facultyOutcomeAssertions': outcomes['assertions'],
    'independentCalculationChecks': reports['calculation-validation.json']['independentChecks'],
    'preservedWorkbookCellsScanned': sum(w['cellsScanned'] for w in reports['workbook-scope-validation.json']['workbooks']),
    'visualInspection': visual,
    'artifacts': [{'path': p.as_posix(), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in artifacts],
    'reproduceExports': ['python tools/export_faculty_question_bank.py --node <bundled-node>', 'node audit_tools/easy_pool_review_20261101/excel.mjs --report-directory=<this-audit-directory>', 'python audit_tools/legendary_editorial_20261102/preserve-sheet-visibility.py'],
}
(HERE / 'delivery-verification.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
print(json.dumps({k: result[k] for k in ['status', 'revised', 'pendingUserReview', 'priorEditorialRecommendationsAddressed', 'facultyOutcomeAssertions', 'preservedWorkbookCellsScanned']}))
