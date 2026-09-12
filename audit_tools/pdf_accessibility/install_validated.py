"""Prepare and transactionally install reviewed bytes. No installation on import.

The default CLI is a read-only plan. Actual installation requires --install and
separate owner authorization. This pilot task exercises only fixture destinations.
"""
from repo_guard import *
from accessibility_gate import inspect,check_copies
from tag_pilot import source_hash,semantic_hash
from validate_candidates import SEMANTICS,SOURCE
import argparse,uuid

MANIFEST='build/faculty-build-composer/data/concept-reviews/manifest.json'
RELEASES='build/faculty-build-composer/data/concept-reviews/accessibility_releases.json'

def prepare(records,review_path):
    root_guard();review_path=contained(review_path);review=read_json(review_path)
    sources={r['code']:r for r in read_json(SOURCE)['reviews']};metadata=read_json(SEMANTICS)
    manifest=read_json(MANIFEST);known={r['code']:r for r in manifest['reviews']};plan=[]
    if len({r['code'] for r in records})!=len(records):raise ValueError('Duplicate install record')
    for row in records:
        code=row['code'];candidate=contained(row['output']);meta=metadata['pilot'].get(code)
        if code not in known or not meta:raise ValueError('New/unreviewed active resource')
        if not candidate.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Candidate must be staged')
        semantic_matches=(row['resourceSemanticsSha256']==semantic_hash(metadata,code)) if row.get('resourceSemanticsSha256') else row['semanticsSha256']==sha(SEMANTICS)
        if sha(candidate)!=row['sha256'] or not semantic_matches:raise ValueError('Stale candidate/semantic evidence')
        if source_hash(sources[code])!=row['sourceRecordSha256']:raise ValueError('Stale instructional source')
        report=contained(row['validatorReport'])
        if not report.is_relative_to(contained('validation_artifacts/pdf_accessibility')):raise ValueError('Retain validator evidence before installation')
        if sha(report)!=row['validatorReportSha256']:raise ValueError('Validator report changed')
        jobs=read_json(report)['report']['jobs']
        passed=[j for j in jobs if Path(j['itemDetails']['name']).resolve()==candidate and
                any(v.get('compliant') is True and 'PDF/UA-1' in v.get('profileName','') for v in j.get('validationResult',[]))]
        if len(passed)!=1 or row['independentProfile']!='ISO 14289-1:2014':raise ValueError('Independent PDF/UA-1 profile not passed')
        if inspect(candidate,sources[code],metadata=meta)['errors']:raise ValueError('Current semantic/font/graph gate failed')
        approved=review.get('records',{}).get(code,{})
        required=('sourceContent','numbersAndFormulas','readingOrder','figuresAndTable','rendering','contrast','reproducible')
        if approved.get('sha256')!=sha(candidate) or any(approved.get(k) is not True for k in required):raise ValueError('Missing byte-bound semantic/visual review')
        if not row.get('textWhitespaceOnlyEqual') or not row.get('geometryEqual') or row['pageCounts']!=[1,1]:raise ValueError('Unreviewed content/layout change')
        pdfname=known[code]['pdfPath']
        if Path(pdfname).name!=pdfname or pdfname!=code+'.pdf':raise ValueError('Unexpected manifest path')
        targets=[contained(prefix+'/'+pdfname) for prefix in ('concept-reviews','build/faculty-build-composer/data/concept-reviews')]
        existing=[sha(p) for p in targets if p.exists()]
        if len(set(existing))>1:raise ValueError('Active copies already disagree')
        if any(h!=known[code]['sha256'] for h in existing):raise ValueError('Active copy differs from manifest')
        plan.append({'code':code,'candidate':str(candidate),'targets':[str(p) for p in targets],
                     'expected':[sha(p) if p.exists() else None for p in targets],'sha256':sha(candidate),'sizeBytes':candidate.stat().st_size,
                     'evidence':{**row,'profile':'ISO 14289-1:2014','independentValidator':'veraPDF',
                         'independentValidationPassed':True,'semanticReviewPassed':True,'contentPreservationPassed':True,
                         'graphIdentityPassed':True,'renderComparisonPassed':True,'reviewReport':str(review_path.relative_to(EXPECTED_ROOT)),
                         'reviewReportSha256':sha(review_path)}})
    return {'manifestSha256':sha(MANIFEST),'records':plan}

def materialize(plan,fixture_directory=None):
    """All gates precede mutation. Roll back on a partial write or equality failure."""
    root=root_guard()
    # A caller cannot bypass prepare by constructing a plan dictionary. Recheck
    # its evidence and current semantic structure immediately before any write.
    for row in plan['records']:
        evidence=row['evidence']
        fresh=prepare([evidence],evidence['reviewReport'])['records'][0]
        for key in ('code','candidate','targets','expected','sha256','sizeBytes'):
            if row[key]!=fresh[key]:raise ValueError('Install plan does not match validated evidence')
    if sha(MANIFEST)!=plan['manifestSha256']:raise ValueError('Manifest changed since preflight')
    manifest=read_json(MANIFEST);releases=read_json(RELEASES) if contained(RELEASES).exists() else {}
    fixture=contained(fixture_directory) if fixture_directory else None
    if fixture and not fixture.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Fixtures must stay in scratch')
    writes=[]
    for row in plan['records']:
        candidate=contained(row['candidate'])
        if sha(candidate)!=row['sha256']:raise ValueError('Candidate changed after preflight')
        for index,(name,expected) in enumerate(zip(row['targets'],row['expected'])):
            target=contained(name)
            if (sha(target) if target.exists() else None)!=expected:raise ValueError('Active copy changed after preflight')
            if fixture:target=contained(fixture/('public' if index==0 else 'composer')/target.name)
            writes.append((target,candidate.read_bytes()))
        record=next(r for r in manifest['reviews'] if r['code']==row['code'])
        record.update(sha256=row['sha256'],sizeBytes=row['sizeBytes'],pageCount=1,documentLanguage='en-US',hasSelectableText=True)
        releases[row['code']]=row['evidence']
    manifest['summary']['totalPdfSizeBytes']=sum(r['sizeBytes'] for r in manifest['reviews'])
    for name,value in ((MANIFEST,manifest),(RELEASES,releases)):
        target=contained(fixture/Path(name).name) if fixture else contained(name)
        writes.append((target,(json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode('utf-8')))
    transaction_root=fixture.parent if fixture else contained('tmp/pdf_accessibility/install')
    scratch=contained(transaction_root/'install-transactions')/uuid.uuid4().hex;scratch.mkdir(parents=True)
    originals={str(p):p.read_bytes() if p.exists() else None for p,_ in writes}
    for i,(target,_) in enumerate(writes):
        if originals[str(target)] is not None:(scratch/f'backup-{i}').write_bytes(originals[str(target)])
    changed=[]
    try:
        for i,(target,data) in enumerate(writes):
            root_guard();target=contained(target);target.parent.mkdir(parents=True,exist_ok=True)
            staged=contained(scratch/f'new-{i}');staged.write_bytes(data);os.replace(staged,target);changed.append(target)
        for row in plan['records']:
            targets=[contained(fixture/sub/(row['code']+'.pdf')) for sub in ('public','composer')] if fixture else row['targets']
            errors,_=check_copies(targets,row['sha256'],row['sizeBytes'])
            if errors:raise ValueError('Installed copy mismatch: '+str(errors))
    except BaseException:
        for target in reversed(changed):
            old=originals[str(target)]
            if old is None:contained(target).unlink()
            else:contained(target).write_bytes(old)
        raise
    return {'fixtureOnly':bool(fixture),'records':len(plan['records']),'copies':len(plan['records'])*2,'backupDirectory':str(scratch)}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--validation',required=True);parser.add_argument('--review',required=True)
    parser.add_argument('--install',action='store_true',help='Requires separate owner authorization; not authorized during the pilot task')
    args=parser.parse_args();plan=prepare(read_json(args.validation),args.review)
    print(json.dumps(materialize(plan) if args.install else plan,indent=2))
