# Question Quality Standard

Apply this standard to new banks, expansions, and audits before a pool is accepted.

## Required workflow

1. Create questions from the approved blueprint and concept boundary.
2. Run schema and structural validation.
3. Run `audit_tools/question_quality_auditor.mjs` on the affected concept(s) or pool(s).
4. Run the relevant graph and asset validators.
5. Manually review every `WARNING` and `REVIEW` finding; document intentional exceptions.
6. Accept the pool only after every `ERROR` is resolved and answer-key/generation checks pass.

`ERROR` is a deterministic defect and blocks acceptance. `WARNING` is a strong machine-detectable reason to inspect. `REVIEW` requires economic or pedagogical judgment and must not be mechanically rewritten.

## Authoring rules

- Use natural faculty/student economics language. Make the tested decision explicit without giving away the answer.
- When visual evidence is required, use a natural direction such as “Refer to the graph…” and make the graph materially necessary.
- Feedback must explain the economic relationship or reasoning. Do not merely identify a dot, line, or keyed option.
- Assign difficulty by cognitive work, not by the presence of a graph. Hard and higher items should require genuine multi-step reasoning, synthesis, comparative statics, trap diagnosis, or deeper interpretation.
- Use plausible, conceptually diagnostic distractors. Avoid duplicates, absurd category mismatches, answer-length giveaways, and clusters of absolute wording that cue the answer.
- Maintain one defensible answer. Preserve clean units, currency, percentages, precision, capitalization, punctuation, and Unicode.
- Match concept, learning objective, skill/type, difficulty, checkpoint/support role, and graph-required metadata to the task the learner actually performs.
- Ensure every curve, point, axis, and unit named in the stem or feedback matches the registered asset and its accessibility description.
- Do not automatically rewrite semantic ambiguity, difficulty, graph necessity, or pedagogical weakness. Flag those items for a qualified human review.

## Audit commands

```powershell
node audit_tools/question_quality_auditor.mjs --concept demand
node audit_tools/question_quality_auditor.mjs --concepts demand,supply,market-equilibrium --report validation_artifacts/question_quality/report.md --json validation_artifacts/question_quality/report.json
node audit_tools/question_quality_auditor.mjs --concept demand --pools easy,medium,hard
node audit_tools/question_quality_auditor.mjs --all --fail-on error
```

The reusable remaining-Principles authoring helper invokes the same auditor during `finalizeQuestions` and exposes the result as `questions.qualityAudit`. New authoring configurations must pass `enforceQualityGate: true`; this makes deterministic `ERROR` findings block serialization while warnings and reviews remain in the manual acceptance record. Legacy authoring configurations are report-only so this infrastructure change does not silently rewrite or block unrelated historical banks.
