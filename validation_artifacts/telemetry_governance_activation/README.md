# Governance activation evidence

Only synthetic local fixtures are included. No Worker deployment, remote cron registration, production D1 access/deletion, secret rotation or learner-data inspection occurred. Baseline was clean, with mq-governance/1, mq-disclosure/1 and mq-measurement/1. Baseline governance and contract tests passed 14/14 and 16/16. Inventory contains 4,949 tracked-file hashes.

Current source: mq-governance/2, mq-disclosure/2; measurement remains mq-measurement/1. Scheduled fixture time is fixed for reproducibility. Existing migrations run only in memory. The local D1 wrapper serializes atomic batches to model D1 concurrency; scheduled overlap tests exercise actual shared eligibility with no global Worker lock. Failure reports are bounded and contain no event payload or credential value.

Final gates: governance 14/14; scheduled/equivalence/negative checks 11/11; Contract 1 16/16; backend/timing 16/16; actual download/opt-out 17/17; private browser 29/29; public browser 103/103; disclosure/browser 8 checks plus no-JavaScript; Composer 27/27. final-checks.json records generation, synchronization, dictionary/schema and whitespace checks. protected-files.json records all-file comparison and unchanged gameplay/retention-SQL proof.

synthetic-scheduled-operations.json illustrates aggregate success/failure and idempotence reports. synthetic-admin.csv plus its governance sidecar illustrates current export context without changing CSV columns. These synthetic rows may carry historical/unmeasured event limitations; a sidecar does not restamp them. Provider registration/log retention remains unverified outside this repository.
