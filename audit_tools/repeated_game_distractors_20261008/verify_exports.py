import csv, hashlib, json, pathlib, re, unicodedata
import pypdfium2 as pdfium

root = pathlib.Path(__file__).resolve().parents[2]
out = pathlib.Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text(encoding='utf8'))
ledger = read(out / 'expectations.json')
summary = read(root / 'faculty_exports/validation_summary.json')
assert summary['status'] == 'complete' and summary['sources_unchanged']
assert summary['source_sha256'] == hashlib.sha256((root / 'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
info = summary['disciplines']['micro']
with (root / 'faculty_exports' / info['csv_file']).open(encoding='utf-8-sig', newline='') as f:
    rows = {r['Question ID']: r for r in csv.DictReader(f)}
assert len(rows) == 6297
norm = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFKC', s)).replace('−', '-')
pdf = pdfium.PdfDocument(root / 'faculty_exports' / info['pdf_file'])
pages = {}
for c in ledger['changes']:
    q, row = c['afterRecord'], rows[c['id']]
    assert row['Question'] == q['q'] and row['Feedback'] == q['feedback']
    assert [row['Choice ' + k] for k in 'ABCD'] == q['options']
    assert row['Correct Answer'].startswith('D ')
    n = info['question_pages'][c['id']] - 1
    text = ''
    for i in range(n, min(n + 2, len(pdf))):
        page = pdf[i]
        tp = page.get_textpage()
        text += tp.get_text_range()
        tp.close()
        page.close()
    for s in [q['q'], *q['options'], q['feedback']]:
        assert norm(s) in norm(text), (c['id'], s)
    page = pdf[n]
    bitmap = page.render(scale=1.25)
    bitmap.to_pil().save(out / (c['id'] + '.png'))
    bitmap.close()
    page.close()
    pages[c['id']] = n + 1
pdf.close()
result = {'status': 'PASS', 'sourceSha256': summary['source_sha256'], 'microQuestions': len(rows), 'exactQuestionOptionFeedbackParity': True, 'answerPositions': 'D for both', 'pdfPages': pages}
(out / 'export-validation.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
print(json.dumps(result))
