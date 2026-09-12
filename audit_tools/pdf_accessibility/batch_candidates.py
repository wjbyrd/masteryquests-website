"""Resumable active-manifest candidate generation. This module cannot install.

Checkpoint machine results independently of the later byte-bound visual and
semantic review receipt. Never call a machine pass a completed review.
"""
from repo_guard import *
from tag_pilot import source_hash,semantic_hash
from rebuild_pilot import build
from validate_candidates import validate,SEMANTICS,SOURCE
import argparse

RUN='full_batch_v1'
TASK_ID='PDF_ACCESSIBILITY_FULL_BATCH_V1'

def tooling_hash():
    names=['tag_pilot.py','semantic_runs.py','formula_coverage.py','accessibility_gate.py','rebuild_pilot.py','validate_candidates.py','repo_guard.py','batch_candidates.py','visual_repairs.py']
    paths=['audit_tools/pdf_accessibility/'+n for n in names]
    paths.append('audit_tools/pdf_accessibility/micro49_wording.py')
    paths.append('audit_tools/pdf_accessibility/micro49_matrix.py')
    paths+=['build/faculty-build-composer/tools/'+n for n in ['concept_review_style.py','concept_review_lifecycle.py','expand_micro_concept_reviews.py','complete_macro_concept_reviews.py']]
    return source_hash({p:sha(p) for p in paths})


def batch_revision(records):
    """A changed input set gets new candidate and evidence paths."""
    return source_hash(sorted((r['code'],r['inputs']) for r in records))

def run(name,codes):
    root=root_guard()
    if not __import__('re').fullmatch('[a-z0-9_-]+',name):raise ValueError('Invalid batch name')
    manifest=read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')
    active={r['code'] for r in manifest['reviews']}
    if not codes or len(codes)!=len(set(codes)) or not set(codes)<=active:raise ValueError('Select unique active resources')
    metadata=read_json(SEMANTICS);sources={r['code']:r for r in read_json(SOURCE)['reviews']}
    stage=contained(f'tmp/pdf_accessibility/{RUN}/batches/{name}')
    evidence=contained(f'validation_artifacts/pdf_accessibility/{RUN}/batches/{name}')
    checkpoint=evidence/'checkpoint.json'
    saved=read_json(checkpoint) if checkpoint.exists() else None
    if saved and set(saved['documentIds'])!=set(codes):
        raise ValueError('Batch name belongs to another resource set; use a new batch name')
    previous=saved['records'] if saved else []
    old={r['code']:r for r in previous};rows=[];tool_hash=tooling_hash()
    for code in codes:
        if code not in metadata['pilot']:
            rows.append({'code':code,'result':'BLOCKED','blocker':'Canonical semantic review has not been completed'});continue
        fingerprint={'source':source_hash(sources[code]),'semantics':semantic_hash(metadata,code),'tooling':tool_hash,
                     'active':sha('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf')}
        prior=old.get(code)
        if prior and prior.get('inputs')==fingerprint:
            if prior.get('validation'):
                v=prior['validation']
                if contained(v['output']).exists() and sha(v['output'])==v['sha256'] and sha(v['validatorReport'])==v['validatorReportSha256']:
                    rows.append(prior);print(code,'REUSED',flush=True);continue
            elif prior.get('result')=='BLOCKED':rows.append(prior);continue
        rows.append({'code':code,'inputs':fingerprint,'result':'QUEUED'})
    queued=[r for r in rows if r['result']=='QUEUED']
    if queued:
        revision=batch_revision(queued)
        stage=contained(stage/'revisions'/revision)
        evidence=contained(evidence/'revisions'/revision)
    if queued:
        generated=build(stage,[r['code'] for r in queued])
        by_code={r['code']:r for r in generated}
        for row in queued:
            row['generation']=by_code[row['code']]
            if row['generation']['status']=='REJECTED':
                row.update(result='BLOCKED',blocker=row['generation']['reason'])
        write_json(checkpoint,{'task':TASK_ID,'batch':name,'documentIds':codes,'installed':False,'records':rows,'complete':False})
        good=[r['generation'] for r in queued if r['result']!='BLOCKED']
        validations=validate(good,evidence/'validation') if good else []
        by_code={v['code']:v for v in validations}
        repeat_codes=[v['code'] for v in validations if v['passed']]
        repeats={r['code']:r for r in build(stage/'determinism',repeat_codes)} if repeat_codes else {}
        for row in queued:
            if row['result']=='BLOCKED':continue
            v=by_code[row['code']];row['validation']=v
            if v['passed']:
                repeat=repeats[row['code']]
                row['deterministic']=repeat.get('sha256')==v['sha256'];row['rebuild']=repeat
                row['result']='MACHINE_PASS_REVIEW_PENDING' if row['deterministic'] else 'BLOCKED'
                if not row['deterministic']:row['blocker']='Independent rebuild changed candidate bytes'
            else:row.update(result='BLOCKED',blocker='; '.join(v['projectErrors']) or 'Independent PDF/UA-1 profile failed')

    write_json(checkpoint,{'task':TASK_ID,'batch':name,'documentIds':codes,'installed':False,'records':rows,
                          'machinePass':sum(r.get('result')=='MACHINE_PASS_REVIEW_PENDING' for r in rows),
                          'blocked':sum(r.get('result')=='BLOCKED' for r in rows),'complete':True})
    return rows

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--name',required=True);parser.add_argument('--codes',nargs='+',required=True)
    args=parser.parse_args();run(args.name,args.codes)
