"""Refresh after proofreading, reusing only byte-verified PDFs with identical CSVs.

The authoritative exporter still validates every PDF and publishes atomically.
This avoids laying out thousands of unchanged questions a second time.
"""
from pathlib import Path
import importlib.util,sys,json,hashlib,shutil
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'faculty_exports'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
previous=read(OUT/'validation_summary.json');certificate=read(HERE/'delivery-verification.json')
assert certificate['status']=='PASS' and certificate['sourceSha256']==previous['source_sha256']
hashes={Path(p['path']).name:p['sha256'] for p in certificate['artifacts']}
spec=importlib.util.spec_from_file_location('faculty_export',ROOT/'tools/export_faculty_question_bank.py');module=importlib.util.module_from_spec(spec);sys.modules[spec.name]=module;spec.loader.exec_module(module)
original=module.build_pdf
def build(pdf,rows,records,summary,fontdir):
    oldpdf=OUT/pdf.name;oldcsv=oldpdf.with_suffix('.csv');newcsv=pdf.with_suffix('.csv')
    prior=next(s for s in previous['disciplines'].values() if s['pdf_file']==pdf.name)
    if oldcsv.read_bytes()==newcsv.read_bytes() and summary['generated_at'][:10]==previous['generated_at'][:10]:
        assert hashlib.sha256(oldpdf.read_bytes()).hexdigest()==hashes[pdf.name]
        assert set(prior['question_pages'])=={str(r['question_id']) for r in rows}
        shutil.copyfile(oldpdf,pdf);print('Reused byte-verified PDF with identical current content: '+pdf.name,flush=True)
        return prior['question_pages'],prior['pdf_pages']
    return original(pdf,rows,records,summary,fontdir)
module.build_pdf=build
sys.exit(module.main())
