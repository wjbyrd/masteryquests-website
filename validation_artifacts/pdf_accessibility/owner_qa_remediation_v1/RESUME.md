# Owner-QA remediation checkpoint

Task: CONCEPT_REVIEW_QA_REMEDIATION_V1. Repository boundary is enforced by repo_guard.py. Production installation is not authorized.

The canonical instructional source and single accessibility_semantics.json contain the reviewed corrections. Eighty records select renderProfile owner_qa_v1. The normal maintained rebuild_pilot.build / concept_review_lifecycle.generate_selected path reads those records and qa_renderer.py. It does not patch existing staged PDF bytes.

qa_remediation.py --prepare is the initial editorial migration from the immutable source_before snapshot. Do not use it as an ordinary regeneration command after subsequent editing. Normal regeneration reads the current canonical records. Update source-bound metadata when authoring a later change.

run_qa_batches.py resumes the six explicit affected-resource batches (HIGH, General, two Micro, two Macro). Each checkpoint records input hashes, candidate/rebuild hashes, raw validator paths and reviewed remediation results. Matching validated inputs are reused. Unaffected resources are never selected by this runner.

qa_release.py combines the 80 accepted checkpoints with 71 hash-verified existing candidates and prepares an aggregate gate and installation PREVIEW. Its visual receipt assembly is permitted only after actual review of the final rendered bytes; machine validation alone is insufficient. The retained contact sheets document the reviewed final pages.

run_qa_tests.py executes economics and new semantic-table regressions. negative_tests.py and test_pipeline.py accept --run owner_qa_remediation_v1. run_regression.py owner_qa_remediation_v1 executes the current Composer suite with task-local outputs.

qa_package.py creates exact v2/AT review copies after passing gates. checklist.mjs writes the v2 CSV using the runtime Artifact Tool; no final owner approvals are authored. verify_qa_package.py reopens documents, checks package equality and confirms protected hashes.

Current state: 80 corrected, 71 reused, staged gate 151/151. Human AT and owner final approval are PENDING. Installation preview has not been executed.
