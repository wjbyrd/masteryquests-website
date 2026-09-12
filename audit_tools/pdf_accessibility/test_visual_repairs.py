"""Real-image and source-bound regressions for the targeted closeout."""
from repo_guard import *
from visual_repairs import validate_bindings,verify_derivation,approved_text_equal
from accessibility_gate import inspect
from pypdf import PdfReader
import copy


def main():
    root_guard();base='build/faculty-build-composer/data/concept-reviews/'
    metadata=read_json(base+'accessibility_semantics.json')['pilot']
    sources={r['code']:r for r in read_json(base+'concept_review_source.json')['reviews']}
    rows=read_json('validation_artifacts/pdf_accessibility/blocked_25_v1/targeted_final.json')
    results=[]
    def rejected(label,code,change):
        m=copy.deepcopy(metadata[code]);s=copy.deepcopy(sources[code]);change(s,m)
        errors=validate_bindings(s,m)
        try:verify_derivation(m)
        except ValueError as exc:errors.append(str(exc))
        results.append({'test':label,'detected':bool(errors),'errors':errors,'responsibility':'project semantic/visual gate; not veraPDF'})
    for kind,code in [('label','GEN-ECON-13'),('curve','MACRO-30')]:
        rejected('contrast_regression_'+kind,code,lambda s,m:m['visualRepair']['rules'][0].update(newRGB=m['visualRepair']['rules'][0]['oldRGB']))
    rejected('stale_derived_graph_fingerprint','MICRO-54',lambda s,m:m['visualRepair'].update(derivedDecodedSha256='0'*64))
    rejected('stale_original_graph_fingerprint','MICRO-54',lambda s,m:m['visualRepair'].update(originalDecodedSha256='0'*64))
    rejected('stale_owner_context_source','MICRO-52',lambda s,m:s['content'].update(worked=s['content']['worked']+' changed'))
    rejected('stale_owner_context_asset','MICRO-52',lambda s,m:m.update(assetSourceSha256='0'*64))
    rejected('stale_owner_context_graph','MICRO-52',lambda s,m:m.update(graphDecodedSha256='0'*64))
    rejected('unreviewed_owner_context','MICRO-52',lambda s,m:m['sourceFigureContext'].update(status='pending'))
    for code in ('MICRO-16','MICRO-34'):
        rejected('reverted_wording_'+code,code,lambda s,m:s['content'].update(check=m['wordingCorrection']['oldText']))
    for row in rows:
        code=row['code'];m=metadata[code];r=inspect(row['output'],sources[code],base+code+'.pdf',m)
        assert not r['errors'],(code,r['errors'])
        if m.get('wordingCorrection'):
            old=PdfReader(contained(base+code+'.pdf')).pages[0].extract_text();new=PdfReader(contained(row['output'])).pages[0].extract_text()
            assert approved_text_equal(old,new,m)
            assert not approved_text_equal(old,new+' extra instructional text',m)
            assert sources[code]['content']['check'] in r['rawReadingSequence']
        assert row['deterministic'] and sha(row['determinismRebuild'])==row['sha256']
    write_json('validation_artifacts/pdf_accessibility/blocked_25_v1/visual_negative_tests.json',
               {'task':'PDF_ACCESSIBILITY_BLOCKED_25_V1','negativeTests':results,'positiveCandidates':len(rows),
                'allPassed':all(r['detected'] for r in results),'screenReaderTest':False})
    print(len(results),'negative detections;',len(rows),'current positive candidates PASS')
    if not all(r['detected'] for r in results):raise SystemExit(1)


if __name__=='__main__':main()
