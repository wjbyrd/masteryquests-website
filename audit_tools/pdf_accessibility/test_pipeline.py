"""Regression tests use reviewed pilot evidence and isolated install destinations."""
from repo_guard import *
from install_validated import prepare,materialize
from accessibility_gate import inspect
from tag_pilot import validate_metadata
import copy,ast,sys,argparse

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--run',choices=['pilot_blockers_v1','full_batch_v1','blocked_25_v1','micro49_nash_fix_v1','micro49_unique_nash_v2'],default='pilot_blockers_v1')
    args=parser.parse_args();run=args.run
    root_guard();out=contained('validation_artifacts/pdf_accessibility/'+run)
    scratch='tmp/pdf_accessibility/'+run
    metadata=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')
    validate_metadata(metadata)
    files=list(contained('audit_tools/pdf_accessibility').glob('*.py'))+[
        contained('build/faculty-build-composer/tools/'+n+'.py') for n in
        ('concept_review_style','concept_review_lifecycle','expand_micro_concept_reviews','complete_macro_concept_reviews','build_concept_review_manifest')]
    for file in files:ast.parse(file.read_text(encoding='utf-8-sig'))
    records=read_json(out/('fixture_validation.json' if run in ('full_batch_v1','blocked_25_v1','micro49_nash_fix_v1','micro49_unique_nash_v2') else 'validation.json'));receipt=out/'review_receipt.json'
    plan=prepare(records,receipt)
    result=materialize(plan,scratch+'/install-fixture')
    checks=[{'test':'syntax_and_metadata','passed':True,'files':len(files)},
            {'test':'equal_fixture_copies_and_manifest','passed':result['copies']==len(records)*2,'copies':result['copies']}]
    forged=copy.deepcopy(plan);forged['records'][0]['sha256']='0'*64
    try:materialize(forged,scratch+'/rejected-fixture');passed=False
    except ValueError:passed=True
    checks.append({'test':'forged_plan_rejected_before_writes','passed':passed})
    for label,key in [('stale_candidate','sha256'),('stale_source','sourceRecordSha256'),('stale_semantics','semanticsSha256'),('changed_validator_report','validatorReportSha256'),('wrong_profile','independentProfile')]:
        bad=copy.deepcopy(records)
        if key=='semanticsSha256' and bad[0].get('resourceSemanticsSha256'):key='resourceSemanticsSha256'
        bad[0][key]='0'*64
        try:prepare(bad,receipt);passed=False
        except ValueError:passed=True
        checks.append({'test':label,'passed':passed})
    sys.path.insert(0,str(contained('build/faculty-build-composer/tools')))
    from concept_review_lifecycle import visual_guard,generate_selected
    from concept_review_style import register_fonts,HEADING_COLOR,contrast
    register_fonts();checks.append({'test':'heading_contrast','passed':contrast(HEADING_COLOR,'#EAF7F7')>=4.5})
    from complete_macro_concept_reviews import draw_bullets,recognition_layout,draw_formula_card
    try:draw_bullets(None,['word '*500],0,0,492);passed=False
    except ValueError:passed=True
    checks.append({'test':'long_list_item_rejected_without_truncation','passed':passed})
    try:recognition_layout('long core '*150,['clue']*4);passed=False
    except ValueError:passed=True
    checks.append({'test':'core_recognition_overlap_rejected','passed':passed})
    try:draw_formula_card(None,{'tested':[],'formulaLines':['long formula '*100]*5});passed=False
    except ValueError:passed=True
    checks.append({'test':'formula_card_overflow_rejected','passed':passed})
    forged=copy.deepcopy(plan);forged['records'][0]['targets'].reverse()
    try:materialize(forged,scratch+'/rejected-copy-plan');passed=False
    except ValueError:passed=True
    checks.append({'test':'mismatched_active_copy_plan_rejected','passed':passed})
    from refresh_batch_evidence import changed_evidence_path
    first=records[0];second=records[1]
    checks.append({'test':'distinct_refresh_groups_keep_distinct_raw_reports',
                   'passed':changed_evidence_path(out,[first])!=changed_evidence_path(out,[second])
                   and changed_evidence_path(out,[first,second])==changed_evidence_path(out,[second,first])})
    from batch_candidates import batch_revision
    a=[{'code':'GEN-ECON-01','inputs':{'source':'first'}}]
    b=[{'code':'GEN-ECON-01','inputs':{'source':'changed'}}]
    checks.append({'test':'changed_batch_inputs_preserve_previous_candidate_paths','passed':batch_revision(a)!=batch_revision(b)})
    for name,call in [
        ('direct_untagged_write',lambda:visual_guard(contained('concept-reviews/MICRO-54.pdf'),contained('assets/images/mastery-quests-logo-standalone.png'),contained('build/faculty-build-composer/data'))),
        ('implicit_batch',lambda:generate_selected(contained('build/faculty-build-composer'),contained(scratch+'/rejected'),None)),
        ('legacy_publish',lambda:generate_selected(contained('build/faculty-build-composer'),contained(scratch+'/rejected'),['MACRO-42'],True))]:
        try:call();passed=False
        except ValueError:passed=True
        checks.append({'test':name,'passed':passed})
    fixture_manifest=read_json(scratch+'/install-fixture/manifest.json')
    for row in records:
        entry=next(r for r in fixture_manifest['reviews'] if r['code']==row['code'])
        assert entry['sha256']==row['sha256']
        for prefix in ('public','composer'):
            assert sha(scratch+'/install-fixture/'+prefix+'/'+row['code']+'.pdf')==row['sha256']
    checks.append({'test':'public_missing_range_unchanged','passed':all(not contained(f'concept-reviews/MICRO-{i}.pdf').exists() for i in range(54,69))})
    write_json(out/'pipeline_tests.json',{'checks':checks,'passed':all(c['passed'] for c in checks),'activeCopiesInstalled':0})
    for c in checks:print(c['test'],c['passed'])
    if not all(c['passed'] for c in checks):raise SystemExit(1)

if __name__=='__main__':main()
