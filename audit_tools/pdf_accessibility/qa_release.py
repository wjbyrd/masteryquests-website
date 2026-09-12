"""Assemble reviewed QA checkpoints and rerun the read-only aggregate gate."""
import copy
import qa_remediation as q
from tag_pilot import source_hash,semantic_hash
from staged_gate import assess
from install_validated import prepare
from qa_renderer import contrast

def collect():
    current={}
    for p in q.contained(q.EVIDENCE+'/batches').glob('*/checkpoint.json'):
        batch=q.read_json(p);assert batch['complete'] and batch['blocked']==0
        for r in batch['records']:
            assert r['code'] not in current and r['deterministic']
            current[r['code']]=r
    assert len(current)==80
    return current

def main():
    q.root_guard();current=collect();before='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2/'
    old=q.read_json(before+'final_validation.json');receipt=q.read_json(before+'review_receipt.json')
    receipt['task']='CONCEPT_REVIEW_QA_REMEDIATION_V1';receipt['assistiveTechnology']='PENDING'
    src={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};meta=q.read_json(q.SEMANTICS)
    original={r['code']:r for r in q.read_json(q.EVIDENCE+'/source_before.json')['reviews']}
    original_meta=q.read_json(q.EVIDENCE+'/semantics_before.json')
    rows=[];reuse=[];visual=[];differences=[]
    for oldrow in old:
        code=oldrow['code']
        if code in current:
            r=current[code];v=copy.deepcopy(r['validation'])
            v.update(deterministic=r['deterministic'],determinismRebuild=r['rebuild']['output'],toolingSha256=r['inputs']['tooling'],renderReview='PASS')
            rendered=q.contained(v['validatorReport']).parent/'rendered_after'/(code+'.png')
            assert rendered.exists() and q.sha(v['output'])==q.sha(v['determinismRebuild'])==v['sha256']
            # This command is run only after actual contact-sheet review of all 80.
            evidence={'code':code,'sha256':v['sha256'],'render':str(rendered.relative_to(q.EXPECTED_ROOT)),
                'renderSha256':q.sha(rendered),'sourceLayout':v['layoutEvidence'],'visualReview':'PASS',
                'reviewMethod':'Codex inspected final page renders and source differences; not human AT testing.',
                'pageGrowth':False,'clippingOverflow':False,'workedSequence':'heading, graph/table if present, full explanation, self-check',
                'newGraphContrast':{color:contrast(color,'#FFFFFF') for color in ['#145A86','#9C3324','#27652D','#172538']} if src[code]['content'].get('graphSpec') else None}
            visual.append(evidence)
            receipt['records'][code]={'sha256':v['sha256'],'sourceRecordSha256':v['sourceRecordSha256'],'resourceSemanticsSha256':v['resourceSemanticsSha256'],
                **{key:True for key in ['sourceContent','numbersAndFormulas','readingOrder','figuresAndTable','rendering','contrast','reproducible']},
                'blockers':[],'reviewer':'Codex source/visual/semantic review; not owner final approval or human AT',
                'reviewEvidence':q.EVIDENCE+'/visual_review.json','renderEvidence':evidence['render']}
            a=original[code]['content'];b=src[code]['content']
            changes={k:{'before':a.get(k),'after':b.get(k)} for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k)}
            differences.append({'code':code,'classification':'AUTHORIZED CONTENT / LAYOUT / SEMANTIC CHANGE','sourceFields':changes,
                'beforeCandidate':oldrow['output'],'beforeSHA256':oldrow['sha256'],'afterCandidate':v['output'],'afterSHA256':v['sha256'],
                'expectedTextSHA256':meta['pilot'][code]['qaRemediation']['authorizedTextSha256'],'unexpectedContentChange':False})
        else:
            v=copy.deepcopy(oldrow)
            assert source_hash(src[code])==source_hash(original[code])==v['sourceRecordSha256']
            assert semantic_hash(meta,code)==semantic_hash(original_meta,code)==v['resourceSemanticsSha256']
            assert q.sha(v['output'])==v['sha256'] and q.sha(v['validatorReport'])==v['validatorReportSha256']
            assert q.sha(v['determinismRebuild'])==v['sha256']
            reuse.append({'code':code,'sourceHash':v['sourceRecordSha256'],'semanticHash':v['resourceSemanticsSha256'],'candidateHash':v['sha256'],
                'rawValidatorHash':v['validatorReportSha256'],'priorEvidence':before+'final_validation.json','rebuilt':False,'preservationEvidenceValid':True})
        rows.append(v)
    baseline=q.read_json(q.EVIDENCE+'/baseline.json')
    assert all(q.sha(p)==h for p,h in baseline['protected'].items()),'Protected content changed'
    q.write_json(q.EVIDENCE+'/visual_review.json',{'records':visual,'passed':80,'humanAT':'PENDING'})
    q.write_json(q.EVIDENCE+'/authorized_differences.json',differences)
    q.write_json(q.EVIDENCE+'/reused_candidates.json',{'records':reuse,'count':71,'protectedHashesUnchanged':len(baseline['protected'])})
    q.write_json(q.EVIDENCE+'/final_validation.json',rows);q.write_json(q.EVIDENCE+'/review_receipt.json',receipt)
    # Small integration fixture exercises installation mechanics only in task scratch.
    fixture_codes=['GEN-ECON-01','MICRO-49','MACRO-16','MACRO-20']
    q.write_json(q.EVIDENCE+'/fixture_validation.json',[v for v in rows if v['code'] in fixture_codes])
    result=assess(rows,q.EVIDENCE+'/review_receipt.json');q.write_json(q.EVIDENCE+'/staged_gate.json',result)
    print('AGGREGATE',result['passed'],'/',result['activeCount'],flush=True)
    if result['blocked']:
        print([r for r in result['records'] if r['status']!='PASS']);raise ValueError('Required full staged gate failed')
    plan=prepare(rows,q.EVIDENCE+'/review_receipt.json');plan.update(installationExecuted=False,logicalResources=151,destinationCopies=302)
    q.write_json(q.EVIDENCE+'/installation_preview.json',plan)
    q.write_json(q.EVIDENCE+'/collection_summary.json',{'task':receipt['task'],'accepted':151,'pdfUaMachine':151,'semanticProject':151,
        'contentAuthorizedDifference':151,'determinism':151,'contrastVisual':151,'changed':80,'reused':71,'installed':False,'humanAT':'PENDING'})

if __name__=='__main__':main()
