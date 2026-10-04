"""Bind the recorded visual review to the final export; never infer it from rendering."""
from pathlib import Path
import json, hashlib

ROOT = Path.cwd()
WORK = ROOT / 'tmp/microeconomics_wording_graph_cleanup_20261003'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
progress = read(WORK / 'visual_progress.json')
qa = read(WORK / 'pdf_visual_qa_pending.json')
assert progress['inspected_sheets'] == list(range(1, 64))
assert len(qa['question_pages']) == 356
assert qa['all_pages_rendered'] == qa['total_pdf_pages']
assert qa['core_checks'] == 6301 and not qa['split_question_cores']
unchanged, changed = [], []
for sheet in qa['sheets']:
    name = sheet['file']
    (unchanged if sha(WORK / name) == progress['sheet_hashes_before_final_correction'][name] else changed).append(name)
print(json.dumps({'pixel_identical_sheets': len(unchanged), 'changed_sheets_requiring_review': changed}))
assert set(changed) == set(progress['final_changed_sheets_visually_inspected'])
assert progress['final_poppler_702_pdf_sha256'] == qa['pdf_sha256']
assert qa['pdf_sha256'] == sha(ROOT / 'faculty_exports/microeconomics_question_bank.pdf')
qa.update({
    'status': 'PASS',
    'questions_inspected': 356,
    'visual_review_method': 'All 63 contact sheets inspected; final regeneration compared by image SHA-256, with every changed sheet re-inspected. Page 702 independently inspected with Poppler.',
    'pixel_identical_previously_inspected_sheets': unchanged,
    'changed_sheets_reinspected': changed,
    'renderer_anomalies': progress['renderer_anomalies'],
    'content_corrections_completed': progress['required_content_corrections'],
    'pre_correction_pdf_sha256': progress['pdf_sha256_before_final_correction'],
    'clipping_failures': 0,
    'unreadable_target_graphs': 0,
})
(WORK / 'pdf_visual_qa.json').write_text(json.dumps(qa, indent=2) + '\n', encoding='utf-8')
