import json, re, hashlib
from pathlib import Path
from pypdf import PdfReader
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[2]
pdf = root / 'faculty_exports/microeconomics_question_bank.pdf'
out = Path(__file__).parent
reader = PdfReader(pdf)
independent = pdfium.PdfDocument(pdf)
appearances, exceptions, page_counts = [], [], []
def parse(text, page):
    records = []
    starts = list(re.finditer(r'Question ID:\s*([^\n\r]+)', text))
    if text.count('Question ID:') != len(starts):
        raise ValueError(f'Unparsed ID marker on page {page}')
    for i, m in enumerate(starts):
        qid = m.group(1).strip()
        if not re.fullmatch(r'[A-Za-z0-9_-]+', qid):
            raise ValueError(f'Unreadable ID page {page}: {qid!r}')
        block = text[m.end(): starts[i+1].start() if i+1 < len(starts) else len(text)]
        topic = re.search(r'Topic:\s*(.*?)\s*(?=Learning Objectives?:|Difficulty:|Question Type:)', block, re.S)
        if not topic:
            raise ValueError(f'Uncertain topic page {page}, {qid}')
        records.append({'id': qid, 'topic': ' '.join(topic.group(1).split()), 'page': page})
    return records
for index, page in enumerate(reader.pages):
    text = page.extract_text()
    a = parse(text, index+1)
    ipage = independent[index]
    textpage = ipage.get_textpage()
    b = parse(textpage.get_text_range(), index+1)
    textpage.close()
    ipage.close()
    if a != b:
        exceptions.append({'page': index+1, 'pypdf': a, 'pymupdf': b})
    if not text.strip():
        exceptions.append({'page': index+1, 'issue': 'Empty page'})
    appearances.extend(a)
    page_counts.append(len(a))
    if (index+1) % 500 == 0:
        print(f'Scanned {index+1} pages', flush=True)
rows, by_id = [], {}
for a in appearances:
    if a['id'] in by_id:
        by_id[a['id']]['pages'].append(a['page'])
    else:
        row = {'id': a['id'], 'topic': a['topic'], 'pages': [a['page']]}
        rows.append(row)
        by_id[a['id']] = row
summary = {'pdf_pages': len(reader.pages), 'appearances': len(appearances), 'unique_ids': len(rows),
           'repeats_removed': len(appearances)-len(rows), 'ids_appearing_more_than_once': sum(len(r['pages'])>1 for r in rows),
           'first_id': rows[0]['id'], 'last_id': rows[-1]['id'], 'exceptions': exceptions,
           'source_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'extractors_agree': not exceptions}
(out/'extraction.json').write_text(json.dumps({'summary':summary,'rows':rows,'appearances':appearances,'page_counts':page_counts},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False, indent=2))
assert not exceptions, 'Extraction differences require review'
