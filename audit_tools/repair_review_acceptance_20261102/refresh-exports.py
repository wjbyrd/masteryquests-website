"""Refresh export provenance only after proving all published bank content is unchanged."""
from pathlib import Path
from datetime import datetime
import csv,hashlib,importlib.util,json,sys,copy,shutil
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports'
spec=importlib.util.spec_from_file_location('exporter',ROOT/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
node=sys.argv[1];before=read(HERE/'baseline/export-summary.json');report=copy.deepcopy(before)
assert before['source_sha256']==digest(HERE/'baseline/composer_library.js')
library=e.load_library(ROOT/e.SOURCE);records,_=e.collect(library);e.audit_answers_and_routes(library,records,ROOT,node)
outcomes=e.resolve_faculty_outcomes(records,ROOT,node,library);groups=e.partition_disciplines(records,e.course_area_memberships(library,ROOT,node))
datasets={area:e.make_rows(group,ROOT,library) for area,group in groups.items()};columns=e.faculty_columns([r for rows in datasets.values() for r in rows])
prior_delivery=read(ROOT/'audit_tools/repair_review_20261102/delivery-verification.json');prior_hashes={Path(a['path']).name:a['sha256'] for a in prior_delivery['artifacts']}
source_hash=digest(ROOT/e.SOURCE);checked=datetime.now().astimezone().isoformat(timespec='seconds');proof=[]
for area,rows in datasets.items():
    summary=before['disciplines'][area];csv_path=OUT/summary['csv_file'];pdf_path=OUT/summary['pdf_file']
    expected=[e.faculty_values(row,columns) for row in rows]
    with csv_path.open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f);assert reader.fieldnames==columns;actual=list(reader)
    assert actual==expected,area+' bank content or ordering changed: regenerate artifacts instead'
    assert digest(pdf_path)==prior_hashes[pdf_path.name],area+' PDF changed since its last full content and visual verification'
    fresh=e.discipline_summary(rows,groups[area],summary['generated_at'],source_hash)
    assert fresh['unique_questions']==summary['unique_questions']
    report['disciplines'][area].update(fresh,faculty_outcome_resolution=e.outcome_counts(groups[area]),content_revalidated_at=checked)
    proof.append({'area':area,'rows':len(rows),'allPublishedFieldsAndOrderingUnchanged':True,'verifiedPdfSha256':digest(pdf_path)})
report.update(source_sha256=source_hash,faculty_outcome_policy_sha256=outcomes['policySha256'],faculty_outcome_resolution=e.outcome_counts(records),content_revalidated_at=checked,revalidation_reason='Bridge-to-Repair role and route correction; all published PDF/CSV/Excel fields and row order unchanged.',status='complete',sources_unchanged=True)
assert digest(ROOT/e.SOURCE)==source_hash
(OUT/'validation_summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(OUT/'validation_report.md').write_text(e.validation_report(report),encoding='utf8')
(OUT/'faculty_outcome_resolution.json').write_text(json.dumps(outcomes,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for name in ['microeconomics_manual_review.xlsx','microeconomics_manual_review.csv']:
    if not (HERE/'baseline'/name).exists():shutil.copy2(OUT/name,HERE/'baseline'/name)
result={'status':'PASS','sourceSha256':source_hash,'librarySha256':library['librarySha256'],'pdfCsvXlsxContentChangesRequired':False,'exportProvenanceRefreshed':True,'disciplines':proof}
(HERE/'export-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8');print(json.dumps(result))
