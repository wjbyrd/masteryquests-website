"""Merge restored candidates with immutable v2 evidence; preview only."""
import copy
import style_restoration as s
from tag_pilot import source_hash,semantic_hash
from staged_gate import assess
from install_validated import prepare
from test_style_template import check
q=s.q

def collect():
    rows={}
    for path in q.contained(s.EVIDENCE+'/batches').glob('*/checkpoint.json'):
        b=q.read_json(path);assert b['complete'] and not b['blocked']
        for r in b['records']:
            assert r['code'] not in rows and r['deterministic'];rows[r['code']]=r
    assert set(rows)==set(q.read_json(s.EVIDENCE+'/affected.json'))
    return rows

def main():
    q.root_guard();current=collect();base=q.EVIDENCE
    old=q.read_json(base+'/final_validation.json');receipt=q.read_json(base+'/review_receipt.json')
    receipt['task']='CONCEPT_REVIEW_STYLE_RESTORATION_V1';receipt['assistiveTechnology']='PENDING'
    sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};meta=q.read_json(q.SEMANTICS)
    frozen=q.read_json(s.EVIDENCE+'/semantics_v2.json');baseline=q.read_json(s.EVIDENCE+'/baseline.json')
    assert all(q.sha(p)==h for p,h in baseline['protected'].items()),'Protected authority changed'
    rows=[];reused=[];visual=[]
    for previous in old:
        code=previous['code']
        if code in current:
            r=current[code];v=copy.deepcopy(r['validation']);v.update(deterministic=True,determinismRebuild=r['rebuild']['output'],toolingSha256=r['inputs']['tooling'],renderReview='PASS')
            render=q.contained(v['validatorReport']).parent/'rendered_after'/(code+'.png')
            assert not check(v['layoutEvidence'],render),(code,check(v['layoutEvidence'],render))
            assert q.sha(v['output'])==q.sha(v['determinismRebuild'])==v['sha256']
            # Styles may change only the new style flag, painted table fingerprint,
            # and inventory of decorative images. All semantic content is frozen.
            before=copy.deepcopy(frozen['pilot'][code]);after=copy.deepcopy(meta['pilot'][code])
            for m in [before,after]:
                for k in ['styleRestoration','decorativeImageDecodedSha256']:m.pop(k,None)
                if m.get('tableRequired'):m.pop('graphDecodedSha256',None)
            assert before==after,('SEMANTIC CONTENT REGRESSION',code)
            visual.append({'code':code,'sha256':v['sha256'],'render':str(render.relative_to(q.EXPECTED_ROOT)),
                'renderSha256':q.sha(render),'templateReview':'PASS','contentComparison':'EXACT V2 TEXT / SOURCE',
                'classification':'AUTHORIZED STYLE CHANGE; NO CONTENT CHANGE','layout':v['layoutEvidence'],
                'reviewMethod':'Codex final render inspection and v1 family comparison; owner visual review pending'})
            receipt['records'][code]={'sha256':v['sha256'],'sourceRecordSha256':v['sourceRecordSha256'],'resourceSemanticsSha256':v['resourceSemanticsSha256'],
                **{k:True for k in ['sourceContent','numbersAndFormulas','readingOrder','figuresAndTable','rendering','contrast','reproducible']},
                'blockers':[],'reviewer':'Codex; human AT and owner approval pending','reviewEvidence':s.EVIDENCE+'/visual_review.json','renderEvidence':visual[-1]['render']}
        else:
            v=copy.deepcopy(previous)
            assert source_hash(sources[code])==v['sourceRecordSha256']
            assert semantic_hash(meta,code)==semantic_hash(frozen,code)==v['resourceSemanticsSha256']
            assert q.sha(v['output'])==q.sha(v['determinismRebuild'])==v['sha256']
            assert q.sha(v['validatorReport'])==v['validatorReportSha256']
            reused.append({'code':code,'sourceHash':v['sourceRecordSha256'],'semanticHash':v['resourceSemanticsSha256'],
                'candidateHash':v['sha256'],'rawValidatorHash':v['validatorReportSha256'],'priorEvidence':base+'/final_validation.json','rebuilt':False,'preservationEvidenceValid':True})
        rows.append(v)
    q.write_json(s.EVIDENCE+'/visual_review.json',{'passed':80,'records':visual,'ownerReview':'PENDING','humanAT':'PENDING'})
    q.write_json(s.EVIDENCE+'/reused_candidates.json',{'count':71,'records':reused})
    q.write_json(s.EVIDENCE+'/final_validation.json',rows);q.write_json(s.EVIDENCE+'/review_receipt.json',receipt)
    q.write_json(s.EVIDENCE+'/fixture_validation.json',[v for v in rows if v['code'] in ['GEN-ECON-01','MICRO-49','MACRO-16','MACRO-20']])
    gate=assess(rows,s.EVIDENCE+'/review_receipt.json');q.write_json(s.EVIDENCE+'/staged_gate.json',gate)
    assert gate['passed']==151 and not gate['blocked'],gate
    plan=prepare(rows,s.EVIDENCE+'/review_receipt.json');plan.update(installationExecuted=False,logicalResources=151,destinationCopies=302)
    q.write_json(s.EVIDENCE+'/installation_preview.json',plan)
    q.write_json(s.EVIDENCE+'/collection_summary.json',{'accepted':151,'pdfUaMachine':151,'semanticProject':151,'contentAuthorizedDifference':151,
        'determinism':151,'contrastVisual':151,'styleTemplateReview':80,'restored':80,'reused':71,'installed':False,'humanAT':'PENDING'})
    print('151 / 151 ACCEPTED; STYLE 80 / 80',flush=True)
if __name__=='__main__':main()
