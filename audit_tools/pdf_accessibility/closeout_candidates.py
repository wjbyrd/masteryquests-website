"""Resume only the inherited 25 blocked candidates; never install or rebuild 126."""
from repo_guard import *
import batch_candidates

RUN='blocked_25_v1'
TASK_ID='PDF_ACCESSIBILITY_BLOCKED_25_V1'


def main():
    root_guard()
    inherited=read_json('validation_artifacts/pdf_accessibility/full_batch_v1/collection_results.json')
    codes=[r['code'] for r in inherited['records'] if r['status']=='BLOCKED']
    baseline=read_json(f'validation_artifacts/pdf_accessibility/{RUN}/baseline.json')
    if set(codes)!=set(baseline['blocked']) or len(codes)!=25:raise ValueError('Inherited blocked scope changed')
    # Final closeout evidence supersedes rejected intermediate wording attempts.
    # Do not regenerate validated bytes simply because this command was retried.
    final_path=contained(f'validation_artifacts/pdf_accessibility/{RUN}/targeted_final.json')
    if final_path.exists():
        from install_validated import prepare
        final=read_json(final_path)
        if {r['code'] for r in final}!=set(codes):raise ValueError('Incomplete targeted final evidence')
        prepare(final,f'validation_artifacts/pdf_accessibility/{RUN}/review_receipt.json')
        if not all(r['deterministic'] and sha(r['determinismRebuild'])==r['sha256'] for r in final):raise ValueError('Stale reproduction evidence')
        print('REUSED 25 current validated closeout candidates; zero candidates rebuilt')
        return 0
    batch_candidates.RUN=RUN;batch_candidates.TASK_ID=TASK_ID
    groups=[('general_macro',[c for c in codes if not c.startswith('MICRO')]),
            ('micro_original',[c for c in codes if c.startswith('MICRO') and int(c.split('-')[-1])<54]),
            ('micro_later',[c for c in codes if c.startswith('MICRO') and int(c.split('-')[-1])>=54])]
    records=[]
    for name,selected in groups:records.extend(batch_candidates.run(name,selected))
    validations=[]
    for row in records:
        if row.get('validation'):
            v=row['validation'].copy();v['deterministic']=row.get('deterministic',False)
            v['determinismRebuild']=row.get('rebuild',{}).get('output');validations.append(v)
    write_json(f'validation_artifacts/pdf_accessibility/{RUN}/targeted_validation.json',validations)
    return 0 if len(validations)==25 and all(v['passed'] and v['deterministic'] for v in validations) else 1


if __name__=='__main__':raise SystemExit(main())
