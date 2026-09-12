"""Collect MICRO-49 review evidence and reuse the other 150 accepted records.

Run only after inspecting the current rendered candidate. Never installs.
"""
from repo_guard import *
from pypdf import PdfReader
from tag_pilot import source_hash, semantic_hash, normalized
from test_micro49_content import check_content, SOURCE, SEMANTICS
import pdfplumber

RUN='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'

def main():
    root_guard()
    baseline=read_json(RUN+'/baseline.json')
    checkpoint=read_json(RUN+'/batches/micro49/checkpoint.json')['records'][0]
    row=checkpoint['validation'].copy()
    assert row['passed'] and checkpoint['deterministic']
    row.update(deterministic=True,determinismRebuild=checkpoint['rebuild']['output'],renderReview='PASS')
    source=next(r for r in read_json(SOURCE)['reviews'] if r['code']=='MICRO-49')
    metadata=read_json(SEMANTICS);meta=metadata['pilot']['MICRO-49']
    assert not check_content(source,meta)
    for field in ('tableRegions','assetSourceSha256','visualSourceSha256'):
        assert meta[field]==baseline['semantics'][field]
    pdf=PdfReader(contained(row['output']));text=normalized(pdf.pages[0].extract_text())
    assert text.count(source['content']['worked'])==1
    assert 'WORKED EXAMPLE: '+source['content']['workedLabel'] in text
    assert meta['wordingCorrection']['oldText'] not in text and 'mixed-strategy' not in text
    old_row=next(r for r in read_json('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/final_validation.json') if r['code']=='MICRO-49')
    def tables(reader):
        def walk(obj):
            obj=obj.get_object() if hasattr(obj,'get_object') else obj
            if isinstance(obj,list):
                for child in obj:yield from walk(child)
            elif hasattr(obj,'get'):
                if obj.get('/S')=='/Table':yield obj
                yield from walk(obj.get('/K',[]))
        def signature(obj):
            obj=obj.get_object() if hasattr(obj,'get_object') else obj
            if isinstance(obj,list):return [signature(x) for x in obj if not isinstance(x,int)]
            if hasattr(obj,'get'):
                return {k:signature(v) for k,v in obj.items() if k in ('/S','/K','/A','/ID','/ActualText','/Scope','/Headers','/O')}
            return str(obj)
        return [signature(t) for t in walk(reader.trailer['/Root']['/StructTreeRoot'])]
    old_table=json.dumps(tables(PdfReader(contained(old_row['output']))),sort_keys=True)
    assert old_table.count('(7, 7)')==1
    assert json.dumps(tables(pdf),sort_keys=True)==old_table.replace('(7, 7)','(1, 1)')
    words=pdfplumber.open(contained(row['output'])).pages[0].extract_words(extra_attrs=['size'])
    body=[w for w in words if w['x0']>=321 and 500<w['top']<654]
    assert body and all(abs(w['size']-10.45)<.001 for w in body)
    assert max(w['bottom'] for w in body)<646 and max(w['x1'] for w in body)<568
    from micro49_matrix import validate,BOXES,ORIGINAL
    import numpy as np
    original_reader=PdfReader(contained(meta['visualSourcePath']))
    original=next(o.get_object().get_data() for o in original_reader.pages[0]['/Resources']['/XObject'].values() if hashlib.sha256(o.get_object().get_data()).hexdigest()==ORIGINAL)
    changed=np.any(np.frombuffer(original,dtype=np.uint8).reshape(471,728,3)!=np.frombuffer(validate(meta),dtype=np.uint8).reshape(471,728,3),axis=2)
    allowed=np.zeros((471,728),dtype=bool)
    for x0,y0,x1,y1 in BOXES:allowed[y0:y1,x0:x1]=True
    assert changed.any() and not changed[~allowed].any()
    evidence={'candidateSha256':row['sha256'],'visualReview':'PASS: before/after PNGs inspected; readable, no overlap or clipping',
              'bodyFontPoints':10.45,'bodyLeadingPoints':11.7,'headingFontPoints':15.99975,
              'pageCounts':row['pageCounts'],'geometryEqual':row['geometryEqual'],'bodyBounds':[min(w['top'] for w in body),max(w['bottom'] for w in body)],
              'tableStructureHeadersIdsAssociationsUnchanged':True,'matrixRegionsUnchanged':True,'matrixPixelChangesOnlyInReviewedDigitBoxes':True,'authorizedCellChange':'B/Y (7, 7) to (1, 1)',
              'authorizedDifference':'AUTHORIZED CONTENT CHANGE: B/Y digits and worked heading/explanation only',
              'unexpectedContentChange':False,'preservation':row['ownerApprovedWordingOnly'],
              'renderDirectory':str(Path(row['validatorReport']).parent),'assistiveTechnology':'PENDING'}
    write_json(RUN+'/visual_review.json',evidence)
    records=read_json('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/final_validation.json')
    sources={r['code']:r for r in read_json(SOURCE)['reviews']}
    reused=[]
    for prior in records:
        if prior['code']=='MICRO-49':continue
        snapshot=next(r for r in baseline['candidates'] if r['code']==prior['code'])
        assert sha(prior['output'])==prior['sha256']==snapshot['sha256']
        assert contained(prior['output']).stat().st_mtime_ns==snapshot['mtimeNs']
        assert source_hash(sources[prior['code']])==prior['sourceRecordSha256']
        assert semantic_hash(metadata,prior['code'])==prior['resourceSemanticsSha256']
        assert sha(prior['validatorReport'])==prior['validatorReportSha256']
        assert prior['deterministic'] and sha(prior['determinismRebuild'])==prior['sha256']
        reused.append({'code':prior['code'],'candidateUnchanged':True,'mtimeUnchanged':True,'sourceHashValid':True,'semanticHashValid':True,'rawValidatorHashValid':True,'determinismHashValid':True})
    records=[row if r['code']=='MICRO-49' else r for r in records]
    write_json(RUN+'/reused_candidates.json',{'count':len(reused),'rebuilt':0,'records':reused})
    write_json(RUN+'/final_validation.json',records)
    review=read_json('validation_artifacts/pdf_accessibility/micro49_nash_fix_v1/review_receipt.json')
    review['task']='MICRO49_UNIQUE_NASH_FIX_V2'
    review['records']['MICRO-49']={**review['records']['MICRO-49'],'sha256':row['sha256'],
        'sourceRecordSha256':row['sourceRecordSha256'],'resourceSemanticsSha256':row['resourceSemanticsSha256'],
        'reviewEvidence':RUN+'/visual_review.json','renderEvidence':str(Path(row['validatorReport']).parent/'rendered_after/MICRO-49.png'),
        'visualChanges':'Owner-authorized B/Y (1, 1), singular heading and unique-equilibrium explanation; table structure unchanged.'}
    write_json(RUN+'/review_receipt.json',review)
    fixture_codes={'MICRO-49','MICRO-54','MACRO-23','GEN-ECON-01'}
    write_json(RUN+'/fixture_validation.json',[r for r in records if r['code'] in fixture_codes])
    print('MICRO-49 review bound to final bytes; 150 candidates unchanged')

if __name__=='__main__':main()
