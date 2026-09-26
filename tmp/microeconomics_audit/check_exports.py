import csv, importlib.util, json, re, sys
from pathlib import Path
import pypdfium2 as pdfium
from pypdf import PdfReader

root = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('exporter', root/'tools/export_faculty_question_bank.py')
e = importlib.util.module_from_spec(spec); spec.loader.exec_module(e)
library = e.load_library(root/e.SOURCE)
records, occurrences = e.collect(library)
e.audit_answers_and_routes(library, records, root, sys.argv[1])
groups = e.partition_disciplines(records, e.course_area_memberships(library, root, sys.argv[1]))
group = groups['micro']; expected = e.make_rows(group, root, library)
with (root/'faculty_exports/microeconomics_question_bank.csv').open(encoding='utf-8-sig', newline='') as f:
    actual = list(csv.DictReader(f))
csv_errors = []
for i, (want, got) in enumerate(zip(expected, actual)):
    for k in set(want) | set(got):
        if want.get(k, '') != got.get(k, ''):
            csv_errors.append({'id':want['question_id'], 'field':k})
structure_errors = []
for qid, r in group.items():
    q = r['q']
    for field in ['q', 'feedback', 'tag', 'objective', 'type', 'difficulty']:
        if not str(q.get(field, '')).strip(): structure_errors.append([qid, field])
    if not isinstance(q['options'], list) or len(q['options']) != 4:
        structure_errors.append([qid, 'four options'])
    if len(set(q['options'])) != 4: structure_errors.append([qid, 'distinct options'])
    if not q['options'][r['answer']].strip(): structure_errors.append([qid, 'empty key'])
pdfpath = root/'faculty_exports/microeconomics_question_bank.pdf'
e.verify_pdf(pdfpath, expected, group)
pdf = pdfium.PdfDocument(str(pdfpath)); texts = []; page_images = []; bounds_errors = []; render_errors = []; replacement = []; id_pages = {}
for i in range(len(pdf)):
    page = pdf[i]; tp = page.get_textpage(); text = tp.get_text_bounded(); texts.append(text)
    ids = re.findall(r'Question ID:\s*([^\s]+)', text)
    for qid in ids: id_pages[qid] = i+1
    if '\ufffd' in text or '\x00' in text: replacement.append(i+1)
    w,h = page.get_size()
    for j in range(tp.count_rects()):
        l,b,r,t = tp.get_rect(j)
        if l < -1 or b < -1 or r > w+1 or t > h+1:
            bounds_errors.append([i+1,[l,b,r,t]])
    page_images.append(sum(1 for ob in page.get_objects() if ob.type == pdfium.raw.FPDF_PAGEOBJ_IMAGE))
    try:
        bitmap = page.render(scale=0.5); bitmap.close()
    except Exception as ex: render_errors.append([i+1,str(ex)])
    tp.close(); page.close()
pdf.close()
# Check answer marker and that the question core stays on its starting page.
marked_errors = []; core_split = []; missing_images = []; metadata_on_prior_page=[]
joined='\n'.join(texts)
norm=lambda x: re.sub(r'\s+', ' ', x).strip()
for row in expected:
    qid=row['question_id']; page_no=id_pages[qid]
    full=re.split(r'Question ID:\s*'+re.escape(qid)+r'\s',joined,maxsplit=1)[1].split('Question ID:',1)[0]
    match=re.search(r'Correct Answer:\s*([A-D])',full)
    if not match or match[1]!=row['correct_answer_letter']: marked_errors.append(qid)
    stem=norm(group[qid]['q']['q'])
    candidates=[j for j in range(page_no-1,min(page_no+2,len(texts))) if stem[:60] in norm(texts[j])]
    if not candidates or not any('Correct Answer:' in texts[j] and 'D.' in texts[j] for j in candidates): core_split.append(qid)
    if candidates and candidates[0]>page_no-1: metadata_on_prior_page.append(qid)
    if group[qid]['q'].get('image') and not any(page_images[j] for j in candidates): missing_images.append(qid)
reader = PdfReader(str(pdfpath)); link_errors=[]; links=0
for i,page in enumerate(reader.pages):
    for ref in page.get('/Annots', []):
        a=ref.get_object()
        if a.get('/Subtype') != '/Link': continue
        links+=1
        dest=a.get('/Dest') or (a.get('/A') or {}).get('/D')
        if isinstance(dest,list):
            target=dest[0].get_object()
            if target.get('/Type')!='/Page': link_errors.append([i+1,str(dest)])
        elif isinstance(dest,str):
            if dest not in reader.named_destinations: link_errors.append([i+1,dest])
        else: link_errors.append([i+1,str(dest)])
outline=reader.outline
result={'records':len(group),'ids':list(group),'csv_rows':len(actual),'csv_unique_ids':len(set(r['question_id'] for r in actual)),
 'csv_columns':len(actual[0]),'csv_mismatches':csv_errors,'structure_errors':structure_errors,'pdf_pages':len(texts),
 'pdf_content_verification':'passed existing exporter verify_pdf on final file','pdf_question_ids':len(id_pages),
 'pdf_replacement_characters':replacement,'pdf_bounds_errors':bounds_errors,'pdf_render_errors':render_errors,
 'pdf_answer_marker_errors':marked_errors,'pdf_split_cores':core_split,'metadata_on_prior_page':metadata_on_prior_page,'pdf_missing_image_pages':missing_images,
 'pdf_links':links,'pdf_link_errors':link_errors,'pdf_outline_entries':len(outline), 'question_pages':id_pages,
 'images':sum(bool(r['q'].get('image')) for r in group.values()),'all_source_occurrences':occurrences}
(root/'tmp/microeconomics_audit/export_checks.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k not in ['ids','question_pages']},indent=2))
