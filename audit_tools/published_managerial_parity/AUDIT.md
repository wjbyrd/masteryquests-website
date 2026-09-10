# Pre-implementation parity audit

Baseline: c75c4c8651ffbca3b56abf963515dd38b9ff0ce3. Completed before public changes.

Source chain: public /games/managerial-intelligence-directorate/ links to /play/managerial-intelligence-directorate/ hub and its four game directories. Those game index.html files are maintained engine + bank sources. Their shared managerial-parity.js/.css own current presentation, dailies and exam wrappers. No separate current public game generator was found in tracked scripts; historical migration/audit scripts are not a replacement authoring source. audit_tools/managerial_classroom/build.mjs instrumentHTML reads each public page and adds only private award instrumentation, access/indexing/base/storage and anonymous client. Its base URL resolves the same public assets/UI adapter. The telemetry POC is a historical private clone and canonical telemetry-client source, not the public content source. No current dist deployment copy is maintained here; root Wrangler supports an explicit --assets . workflow documented in server/classroom-access/README.md.

A = already equivalent; B = intentional difference; C = stale; D = missing; NA = unsupported by bank. No unresolved gameplay difference justifies replacing an engine.

| Feature | Classification | Evidence | Planned action |
|---|---|---|---|
|Daily challenges / completion / achievements|A|Same public managerial-parity.js loaded by classroom through its public base URL. Existing deterministic core and accepted-answer hooks.|Preserve|
|Utility menu / cleanup / guide intro / boss intro / boss reveal|A|Same public HTML and shared UI adapter; classroom builder makes no presentation replacements.|Preserve|
|Save/resume / run ownership / return/restart|A|Classroom instrumentHTML starts from public engine, adding instrumentation rather than changing gameplay save logic.|Preserve gameplay; add tracker lifecycle hooks|
|Artifacts / duplicate ownership / consumable powers|A/B|Game award and consumption logic shared. Private clone adds award telemetry metadata for aggregate research only. Local schema has no artifact metadata column.|Preserve gameplay and existing local artifact event; do not port private-only metadata|
|Standard / Timed / Legendary / Score / Unlimited / Quiz|A|Public engines and supported-mode configuration are classroom inputs.|Preserve|
|Exam navigation / drafts / revision / commit / boss|A|Same shared finalizeExamRoomView, navigateExamRoom, commitExamSection and scoring wrappers.|Preserve; add late telemetry finalize wrapper|
|Fading Fortune / Risk & Reward readiness|A|Same public engine; validated private telemetry waits for readiness/reveal.|Preserve mechanic; derive tracker hooks|
|Trial by Graph|A/NA|Supported only by Market Signal and Strategy Desk, as public collection page states.|No new mode|
|Adaptive repair / bridge / retest / streak / boss / pools / fluency|A|Public inline engine is copied into classroom, not replaced.|Preserve|
|Mastery Report / completion / interrupted runs|A/C|Gameplay/report flow shared; public lacks richer response snapshots and tracking close/reset lifecycle.|Preserve flow; derive telemetry lifecycle only|
|Response / visibility / focus / selection / copy telemetry|D|Public TELEMETRY_COLUMNS has 57 fields and no behavioral adapter. Private adapter derives Composer helper.|Generate local-only adapter from validated functions|
|Download Game Data|C|Public existing serializer has 57 columns and original gameplay responseTimeMs; private wraps to 75 with UTF-8 BOM and legacy semantics.|Derive exact local CSV enrichment/export functions|
|Anonymous ingestion / access gate / storage isolation|B|Public code has no fetch, beacon, XHR or anonymous client script; public collection expressly promises browser-local gameplay data.|Keep local-only; omit identity, queue, endpoints, private gate/isolation/disclosure|
|Mobile / keyboard / modals / focus|A|Shared UI/CSS; verify with existing public browser suite before and after.|Preserve|

Regeneration plan: generate a transport-free public local adapter from exact maintained private/Composer tracker, interval, snapshot and CSV functions. Insert one script before the shared UI adapter. Adjust the classroom builder to remove that public-only include before installing its anonymous adapter, preventing duplicate tracking on future private regeneration. Add a repeatable public sync/check and extend dictionary schema coverage to public targets. No question/answer/pool edits.

Further source tracing: the four *_question_bank_student.js headers explicitly identify generated student-facing artifacts from Gauntlet Question Bank Publisher and private faculty sources. Those external authoring sources are not tracked here; bank headers are historical, not a reliable current question count. Byte-identity checks protect the actual entire banks. No bank regeneration was performed. Browser asset auditing additionally found Strategy Desk's existing space-named background referenced by an underscore filename; the sync generates a byte-identical alias, without changing any artwork or question reference.

