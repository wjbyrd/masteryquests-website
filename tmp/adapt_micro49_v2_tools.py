from pathlib import Path
for filename in ('test_pipeline.py','negative_tests.py','run_regression.py'):
    p=Path('audit_tools/pdf_accessibility')/filename;s=p.read_text(encoding='utf-8')
    # Extend run selectors; keep the earlier run names available as history.
    s=s.replace("'blocked_25_v1','micro49_nash_fix_v1'", "'blocked_25_v1','micro49_nash_fix_v1','micro49_unique_nash_v2'")
    s=s.replace('"blocked_25_v1","micro49_nash_fix_v1"','"blocked_25_v1","micro49_nash_fix_v1","micro49_unique_nash_v2"')
    if filename=='run_regression.py':
        s=s.replace("if phase=='micro49_nash_fix_v1':scratch=contained('tmp/pdf_accessibility/micro49_nash_fix_v1/regression')", "if phase in ('micro49_nash_fix_v1','micro49_unique_nash_v2'):scratch=contained(f'tmp/pdf_accessibility/{phase}/regression')")
        s=s.replace("if phase=='micro49_nash_fix_v1':out=contained('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/regression')", "if phase in ('micro49_nash_fix_v1','micro49_unique_nash_v2'):out=contained(f'validation_artifacts/pdf_accessibility/{phase}/regression')")
    p.write_text(s,encoding='utf-8')
p=Path('audit_tools/pdf_accessibility/review_micro49.py');s=p.read_text(encoding='utf-8')
s=s.replace("RUN='validation_artifacts/pdf_accessibility/micro49_nash_fix_v1'", "RUN='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'")
s=s.replace('validation_artifacts/pdf_accessibility/blocked_25_v1/final_validation.json','validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/final_validation.json')
s=s.replace('validation_artifacts/pdf_accessibility/blocked_25_v1/review_receipt.json','validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/review_receipt.json')
s=s.replace("('tableSource','tableRegions','tableSourceSha256','graphDecodedSha256','assetSourceSha256')", "('tableRegions','assetSourceSha256','visualSourceSha256')")
s=s.replace("assert tables(pdf)==tables(PdfReader(contained(old_row['output'])))", "old_table=json.dumps(tables(PdfReader(contained(old_row['output']))),sort_keys=True)\n    assert old_table.count('(7, 7)')==1\n    assert json.dumps(tables(pdf),sort_keys=True)==old_table.replace('(7, 7)','(1, 1)')")
s=s.replace("'matrixRegionsAndDecodedImageUnchanged':True", "'matrixRegionsUnchanged':True,'matrixPixelChangesOnlyInReviewedDigitBoxes':True,'authorizedCellChange':'B/Y (7, 7) to (1, 1)'")
s=s.replace('AUTHORIZED TEXT CHANGE: worked heading and explanation only','AUTHORIZED CONTENT CHANGE: B/Y digits and worked heading/explanation only')
s=s.replace('MICRO49_PURE_STRATEGY_NASH_FIX_V1','MICRO49_UNIQUE_NASH_FIX_V2')
s=s.replace('Owner-authorized pure-strategy heading and both-equilibria explanation; table unchanged.','Owner-authorized B/Y (1, 1), singular heading and unique-equilibrium explanation; table structure unchanged.')
s=s.replace("    evidence={'candidateSha256'", "    from micro49_matrix import validate,BOXES,ORIGINAL\n    import numpy as np\n    original_reader=PdfReader(contained(meta['visualSourcePath']))\n    original=next(o.get_object().get_data() for o in original_reader.pages[0]['/Resources']['/XObject'].values() if hashlib.sha256(o.get_object().get_data()).hexdigest()==ORIGINAL)\n    changed=np.any(np.frombuffer(original,dtype=np.uint8).reshape(471,728,3)!=np.frombuffer(validate(meta),dtype=np.uint8).reshape(471,728,3),axis=2)\n    allowed=np.zeros((471,728),dtype=bool)\n    for x0,y0,x1,y1 in BOXES:allowed[y0:y1,x0:x1]=True\n    assert changed.any() and not changed[~allowed].any()\n    evidence={'candidateSha256'")
p.write_text(s,encoding='utf-8')
