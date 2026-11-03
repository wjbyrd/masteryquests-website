"""Rebuild the affected course bank with the established exporter and layout."""
from pathlib import Path
from datetime import datetime
import hashlib,importlib.util,json,os,sys,tempfile
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports'
spec=importlib.util.spec_from_file_location('faculty_export',ROOT/'tools/export_faculty_question_bank.py');ex=importlib.util.module_from_spec(spec);spec.loader.exec_module(ex)
node=sys.argv[1];source=ROOT/ex.SOURCE;source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
library=ex.load_library(source);records,_=ex.collect(library);ex.audit_answers_and_routes(library,records,ROOT,node)
outcomes=ex.resolve_faculty_outcomes(records,ROOT,node,library);groups=ex.partition_disciplines(records,ex.course_area_memberships(library,ROOT,node))
datasets={area:ex.make_rows(group,ROOT,library) for area,group in groups.items()};columns=ex.faculty_columns([r for rows in datasets.values() for r in rows])
report=json.loads((OUT/'validation_summary.json').read_text(encoding='utf8'));generated=datetime.now().astimezone().isoformat(timespec='seconds')
with tempfile.TemporaryDirectory(prefix='.fiscad-',dir=OUT) as temp:
    stage=Path(temp)
    for area in ['general','micro']:
        name=report['disciplines'][area]['csv_file'];ex.csv_export(stage/name,datasets[area],columns)
        assert (stage/name).read_bytes()==(OUT/name).read_bytes(),f'Unexpected change to {area}'
    rows,group=datasets['macro'],groups['macro'];summary=ex.discipline_summary(rows,group,generated,source_hash)
    csv=stage/'macroeconomics_question_bank.csv';pdf=stage/'macroeconomics_question_bank.pdf';ex.csv_export(csv,rows,columns)
    print('Generating Macroeconomics:',len(rows),'questions',flush=True)
    anchors,pages=ex.build_pdf(pdf,rows,group,summary,Path('C:/Windows/Fonts'))
    ex.verify_pdf(pdf,rows,group)
    summary.update(status='complete',pdf_pages=pages,question_pages=anchors,faculty_outcome_resolution=ex.outcome_counts(group),faculty_columns=columns,faculty_column_count=len(columns),faculty_metadata_allowlist=[label for label,_ in ex.FACULTY_METADATA],faculty_presentation_verified=True,pdf_file=pdf.name,csv_file=csv.name,pdf_size_bytes=pdf.stat().st_size,pdf_size_mb=round(pdf.stat().st_size/1_000_000,2))
    report['disciplines']['macro']=summary;report.update(generated_at=generated,source_sha256=source_hash,faculty_outcome_policy_sha256=outcomes['policySha256'],faculty_outcome_resolution=ex.outcome_counts(records),status='complete',sources_unchanged=True)
    assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
    (stage/'validation_summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    (stage/'validation_report.md').write_text(ex.validation_report(report),encoding='utf8')
    (stage/'faculty_outcome_resolution.json').write_text(json.dumps(outcomes,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    for p in [pdf,csv,stage/'validation_summary.json',stage/'validation_report.md',stage/'faculty_outcome_resolution.json']:os.replace(p,OUT/p.name)
print('Verified Macroeconomics PDF and CSV. Other course contents unchanged.',flush=True)
