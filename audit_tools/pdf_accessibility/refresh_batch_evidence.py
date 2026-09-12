"""Recheck changed semantics/tooling without rerunning valid byte-identical PDF jobs.

Independent reports remain attached to their original candidate path and hash.
Only changed bytes get new veraPDF and render evidence. No installation.
"""
from repo_guard import *
from rebuild_pilot import build
from validate_candidates import validate,SEMANTICS,SOURCE
from tag_pilot import source_hash,semantic_hash
from accessibility_gate import inspect
from batch_candidates import tooling_hash


def changed_evidence_path(evidence, rows):
    """Different candidate groups must never overwrite each other's raw reports."""
    identity=source_hash(sorted((r['code'],r['sha256'],r['output']) for r in rows))
    return contained(evidence/'final_changes'/identity)

def main():
    root=root_guard();evidence=contained('validation_artifacts/pdf_accessibility/full_batch_v1')
    names=['general_01','general_02','micro_01','micro_02','micro_03','micro_later','macro_01','macro_02','macro_03','macro_52_repair']
    previous={}
    for name in names:
        checkpoint=read_json(evidence/'batches'/name/'checkpoint.json')
        if not checkpoint['complete']:raise ValueError('Incomplete batch: '+name)
        for row in checkpoint['records']:
            if row.get('validation'):previous[row['code']]=row['validation']
    prior_final=evidence/'final_validation.json'
    if prior_final.exists():
        previous.update({r['code']:r for r in read_json(prior_final)})
    manifest=read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')
    codes=[r['code'] for r in manifest['reviews']]
    metadata=read_json(SEMANTICS);sources={r['code']:r for r in read_json(SOURCE)['reviews']}
    refreshed=[];generations=[]
    for start in range(0,len(codes),20):
        selected=codes[start:start+20]
        revision=source_hash({'tooling':tooling_hash(),'records':[(c,source_hash(sources[c]),semantic_hash(metadata,c)) for c in selected]})
        stage=contained('tmp/pdf_accessibility/full_batch_v1/final_rebuild')/str(start//20+1)/revision
        built=build(stage,selected);generations.extend(built);changed=[];reused=[]
        for row in built:
            code=row['code'];old=previous.get(code)
            if row['status']=='REJECTED':continue
            if old and row['sha256']==old['sha256'] and sha(old['output'])==old['sha256'] and sha(old['validatorReport'])==old['validatorReportSha256']:
                checked=inspect(contained(old['output']),sources[code],contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf'),metadata['pilot'][code])
                current={**old,'resourceSemanticsSha256':semantic_hash(metadata,code),'semanticsSha256':sha(SEMANTICS),
                         'sourceRecordSha256':source_hash(sources[code]),'projectErrors':checked['errors'],
                         'passed':old['independentPass'] and not checked['errors'],'deterministic':True,
                         'determinismRebuild':row['output'],'toolingSha256':tooling_hash(),
                         'evidenceReuse':'Identical original candidate bytes; current source/semantic gate and fresh deterministic rebuild checked.'}
                write_json(evidence/'transcripts'/(code+'.json'),checked);reused.append(current)
            else:changed.append(row)
        fresh=validate(changed,changed_evidence_path(evidence,changed)) if changed else []
        if fresh:
            repeats={r['code']:r for r in build(stage/'repeat',[r['code'] for r in fresh])}
            for row in fresh:
                row.update(deterministic=repeats[row['code']].get('sha256')==row['sha256'],determinismRebuild=repeats[row['code']].get('output'),toolingSha256=tooling_hash())
                if not row['deterministic']:row['passed']=False;row['projectErrors'].append('NONDETERMINISTIC_OUTPUT')
                checked=inspect(row['output'],sources[row['code']],metadata=metadata['pilot'][row['code']])
                write_json(evidence/'transcripts'/(row['code']+'.json'),checked)
        refreshed.extend(reused+fresh)
        write_json(evidence/'final_validation.json',refreshed)
        write_json(evidence/'final_generation.json',generations)
        print('FINAL CHECKPOINT',start//20+1,len(refreshed),flush=True)
    bycode={r['code']:r for r in refreshed}
    write_json(evidence/'final_validation.json',[bycode[c] for c in codes if c in bycode])
    if set(bycode)!=set(codes):raise ValueError('Some active resources lack a final candidate; see final_generation.json')

if __name__=='__main__':main()
