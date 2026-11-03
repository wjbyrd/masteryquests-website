"""Independently verify all editorial text in CSV/PDF, then render final PDF samples."""
from pathlib import Path
from datetime import datetime, timezone
import csv, hashlib, html, json, re, subprocess, unicodedata
import pypdfium2 as pdfium
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'faculty_exports'
QA = HERE / 'qa'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
ledger = read(HERE / 'expectations.json')
report = read(OUT / 'validation_summary.json')
assert report['status'] == 'complete' and report['sources_unchanged']
assert report['source_sha256'] == hashlib.sha256((ROOT / 'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
norm = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFKC', html.unescape(re.sub(r'</?(?:table|caption|thead|tbody|tr|th|td|b|strong|em|i|span|br)\b[^>]*>', '', str(s))))).replace('−', '-').replace('\u00ad', '')
poppler = Path('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1026-487-0_26.1026.487.0_x64__3k8sg7r9htsxt/dependencies/native/poppler/Library/bin/pdftoppm.exe')
assert poppler.is_file()
samples = {'general':['P52A-MARG-M-003','P52A-SCAR-B2-002'], 'micro':['42459','PM5-PC-M-041','P62G-MON-M-021','P62G-MON-B2-028'], 'macro':['ECON-EC-MEDIUMBOSS-18010','P52B-S4-STAB-B2-003','P52A-FISCAD-B2-003']}

result = {'status': 'PASS', 'sourceSha256': report['source_sha256'], 'verifiedAt': datetime.now(timezone.utc).isoformat(), 'disciplines': {}}
covered = set()
for area, info in report['disciplines'].items():
    with (OUT / info['csv_file']).open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    by_id = {r['Question ID']: r for r in rows}
    assert len(by_id) == len(rows)
    pdf = pdfium.PdfDocument(OUT / info['pdf_file'])
    pages, cache = info['question_pages'], {}
    def text_at(p):
        if p not in cache:
            page = pdf[p]
            text = page.get_textpage()
            cache[p] = text.get_text_range()
            text.close()
            page.close()
        return cache[p]
    changed = []
    for change in ledger['changes']:
        identity = change['id']
        if identity not in by_id:
            continue
        row, q = by_id[identity], change['afterRecord']
        assert row['Question'] == q['q'] and row['Feedback'] == q.get('feedback', '')
        assert [row['Choice ' + x] for x in 'ABCD'] == q['options']
        assert row['Difficulty'].lower() == 'medium'
        assert row['Correct Answer'].startswith('ABCD'[change['correctIndex']] + ' ')
        start = pages[identity] - 1
        hay = norm(''.join(text_at(p) for p in range(start, min(start + 3, len(pdf)))))
        for value in [q['q'], *q['options'], q.get('feedback', '')]:
            assert norm(value) in hay, (area, identity, 'PDF content missing', value)
        changed.append(identity)
        covered.add(identity)
    cards = []
    for identity in samples[area]:
        page_number = pages[identity]
        prefix = QA / f'{area}-{identity}'
        subprocess.run([str(poppler), '-f', str(page_number), '-l', str(page_number), '-singlefile', '-scale-to', '1400', '-png', str(OUT / info['pdf_file']), str(prefix)], check=True, capture_output=True)
        with Image.open(prefix.with_suffix('.png')) as im:
            thumb = im.convert('RGB')
            thumb.thumbnail((510, 710))
        card = Image.new('RGB', (530, 745), '#dddddd')
        card.paste(thumb, ((530 - thumb.width) // 2, 25))
        ImageDraw.Draw(card).text((12, 8), f'{identity} / page {page_number}', fill='black')
        cards.append(card)
    contact = Image.new('RGB', (530 * min(3, len(cards)), 745 * ((len(cards) + 2) // 3)), 'white')
    for i, card in enumerate(cards):
        contact.paste(card, ((i % 3) * 530, (i // 3) * 745))
    contact.save(QA / f'{area}-pdf-contact.png')
    result['disciplines'][area] = {'rows': len(rows), 'pdfPages': len(pdf), 'changedQuestionsVerified': len(changed), 'visuallySampledQuestions': samples[area]}
    pdf.close()
assert covered == {c['id'] for c in ledger['changes']} and len(covered) == len(ledger['changes'])
result['distinctRevisionsVerified'] = len(covered)
(HERE / 'export-validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
print(json.dumps(result))
