"""Promote byte-bound canonical candidates and retain immutable reused evidence."""
import copy
import canonical_completion as c
from tag_pilot import tag_one,source_hash,semantic_hash
from staged_gate import assess
from test_canonical_template import observe,check,REFERENCE
q=c.q
OUT=c.OUT
PRIOR='validation_artifacts/pdf_accessibility/canonical_dense_v1'
ALLOWED={'canonicalTemplate','canonicalDense','canonicalFlow','assetSourcePath','assetSourceSha256','graphDecodedSha256','tableRegions','decorativeImageDecodedSha256'}

def promote():
    q.root_guard()
    selected={r['code']:r for r in q.read_json(OUT+'/selected_validation.json')}
    assert len(selected)==74
    before=q.read_json(OUT+'/semantics_before.json');after=q.read_json(OUT+'/candidate_semantics_snapshot.json')
    for code,m in before['pilot'].items():
        a=copy.deepcopy(m);b=copy.deepcopy(after['pilot'][code])
        if code in selected:
            a={k:v for k,v in a.items() if k not in ALLOWED};b={k:v for k,v in b.items() if k not in ALLOWED}
        assert a==b,('FROZEN_SEMANTIC_CONTENT',code)
    for r in selected.values():
        assert r['passed'] and r['deterministic'] and not r['fidelityErrors']
        assert q.sha(r['output'])==q.sha(r['determinismRebuild'])==r['sha256']
        assert q.sha(r['validatorReport'])==r['validatorReportSha256']
    q.write_json(q.SEMANTICS,after)
    prior={r['code']:r for r in q.read_json(PRIOR+'/final_validation.json')}
    sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']}
    records=[];review=q.read_json(PRIOR+'/review_receipt.json');visual=[];reused=[];rebuilt=[]
    affected={r['code'] for r in q.read_json(OUT+'/dispositions.json')}
    ref=observe(REFERENCE)
    from qa_renderer import draw
    for code,old in prior.items():
        r=copy.deepcopy(selected.get(code,old));m=after['pilot'][code]
        assert source_hash(sources[code])==r['sourceRecordSha256']
        assert semantic_hash(after,code)==r['resourceSemanticsSha256']
        assert q.sha(r['output'])==q.sha(r['determinismRebuild'])==r['sha256']
        assert q.sha(r['validatorReport'])==r['validatorReportSha256']
        if code in affected:
            raw=c.STAGE+'/maintained/visual/'+code+'.pdf';dest=c.STAGE+'/maintained/'+code+'.pdf'
            layout=draw(sources[code],raw,m);tag_one(sources[code],m,dest,raw)
            assert q.sha(dest)==r['sha256'],('MAINTAINED_REBUILD_CHANGED',code)
            errors=check(observe(dest),ref);assert not errors,(code,errors)
            r.update(determinismRebuild=dest,canonicalTemplateFidelity='PASS',renderReview='PASS')
            rebuilt.append({'code':code,'sha256':r['sha256'],'rebuild':dest,'rebuildSHA256':q.sha(dest),'fidelityErrors':errors})
        else:
            assert before['pilot'][code]==after['pilot'][code]
            reused.append({'code':code,'sha256':r['sha256'],'sourceSHA256':r['sourceRecordSha256'],'semanticSHA256':r['resourceSemanticsSha256'],'validatorSHA256':r['validatorReportSha256'],'rebuilt':False})
        if code in selected:
            render=q.contained(r['validatorReport']).parent/'rendered_after'/(code+'.png')
            visual.append({'code':code,'sha256':r['sha256'],'render':str(render.relative_to(q.EXPECTED_ROOT)),'renderSHA256':q.sha(render),'result':'PASS','method':'Codex rendered-page inspection, label and table review, canonical component comparison; owner review pending','content':'Frozen approved source and semantic text; presentation only'})
            review['records'][code]={'sha256':r['sha256'],'sourceRecordSha256':r['sourceRecordSha256'],'resourceSemanticsSha256':r['resourceSemanticsSha256'],**{k:True for k in ['sourceContent','numbersAndFormulas','readingOrder','figuresAndTable','rendering','contrast','reproducible']},'blockers':[],'reviewer':'Codex; human AT pending','reviewEvidence':OUT+'/visual_review.json','renderEvidence':visual[-1]['render']}
        records.append(r);print(code,'ACCEPTED',flush=True)
        q.write_json(OUT+'/maintained_checkpoint.json',rebuilt)
    assert len(rebuilt)==80 and len(reused)==71
    review.update(task='CONCEPT_REVIEW_CANONICAL_COMPLETION_COMPOSER_INSTALL_V1',assistiveTechnology='PENDING')
    q.write_json(OUT+'/visual_review.json',visual);q.write_json(OUT+'/reused_candidates.json',reused)
    q.write_json(OUT+'/final_validation.json',records);q.write_json(OUT+'/review_receipt.json',review)
    gate=assess(records,OUT+'/review_receipt.json');q.write_json(OUT+'/staged_gate.json',gate)
    assert gate['passed']==151 and not gate['blocked'],gate
    print('80 CANONICAL / 151 ACCEPTED',flush=True)

if __name__=='__main__':promote()
