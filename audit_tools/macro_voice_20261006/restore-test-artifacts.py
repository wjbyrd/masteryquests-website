"""Restore only tracked generated artifacts produced by this task's test runs.

The worktree was clean before this task. Source edits and new evidence are not
targets. git show reads HEAD without touching the index or discarding source.
"""
import json,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parent.parent
exact={
'build/faculty-build-composer/fading_fortune_validation_results_4.5s.2m.json',
'build/faculty-build-composer/mastery_report_2_validation_results.json',
'build/faculty-build-composer/mastery_report_state_leak_hotfix_results.json',
'build/faculty-build-composer/mode_availability_fix_validation_results.json',
'build/faculty-build-composer/quiz_mode_validation_results.json',
'build/faculty-build-composer/risk_reward_validation_results_4.5s.2m.json',
'build/faculty-build-composer/trial_by_graph_validation_results_4.5s.2m.json',
'build/faculty-build-composer/unlimited_practice_validation_results.json',
'build/faculty-build-composer/tests/all-eight.html',
'build/faculty-build-composer/tests/all-nine.html',
'build/faculty-build-composer/tests/all-seven.html',
'build/faculty-build-composer/tests/all-ten.html',
'build/faculty-build-composer/tests/concept_review_integration_results.json',
'build/faculty-build-composer/tests/concept_review_runtime_manifest_sample.json',
'build/faculty-build-composer/tests/graph-assessment-integrity-smoke.html',
'build/faculty-build-composer/tests/macro-taxonomy-current-validation.json',
'build/faculty-build-composer/tests/mastery_report_concept_review_results.json',
'build/faculty-build-composer/tests/phase1_targeted_repair_validation_results.json',
'build/faculty-build-composer/tests/phase3e-market-gate-sample.html',
'build/faculty-build-composer/tests/quiz-only.html',
'build/faculty-build-composer/tests/timed-exam.html',
'build/faculty-build-composer/tests/timed-only.html',
'build/faculty-build-composer/tests/trial-by-graph-only.html',
'build/faculty-build-composer/tests/unlimited-only.html',
'validation_artifacts/macroeconomics_consolidated_cleanup/boss-payoff-table-proof.json',
'validation_artifacts/macroeconomics_consolidated_cleanup/legendary-review-index.json',
'validation_artifacts/macroeconomics_consolidated_cleanup/validation.json',
}
changed=subprocess.check_output(['git','diff','--name-only'],cwd=R).decode().splitlines()
restored=[]
for name in changed:
 if name not in exact:continue
 destination=(R/name).resolve();assert destination.is_relative_to(R.resolve())
 content=subprocess.check_output(['git','show','HEAD:'+name],cwd=R)
 destination.write_bytes(content);restored.append(name)
(H/'restored-test-artifacts.json').write_text(json.dumps(restored,indent=2)+'\n')
print('Restored generated test artifacts:',len(restored))
