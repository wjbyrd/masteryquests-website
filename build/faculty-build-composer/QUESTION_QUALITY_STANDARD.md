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
- When visual evidence is required, do not reproduce graph-derived values, relationships, classifications, or other evidence in the stem. Scenario inputs may be supplied, but the evidence the learner is expected to read must remain in the graph.
- Feedback must explain the economic relationship or reasoning. Do not merely identify a dot, line, or keyed option.
- Assign difficulty by cognitive work, not by the presence of a graph. Hard and higher items should require genuine multi-step reasoning, synthesis, comparative statics, trap diagnosis, or deeper interpretation.
- Use plausible, conceptually diagnostic distractors. Avoid duplicates, absurd category mismatches, answer-length giveaways, and clusters of absolute wording that cue the answer.
- Maintain one defensible answer. Preserve clean units, currency, percentages, precision, capitalization, punctuation, and Unicode.
- Match concept, learning objective, skill/type, difficulty, checkpoint/support role, and graph-required metadata to the task the learner actually performs.
- Ensure every curve, point, axis, and unit named in the stem or feedback matches the registered asset and its accessibility description.
- Do not automatically rewrite semantic ambiguity, difficulty, graph necessity, or pedagogical weakness. Flag those items for a qualified human review.

## Auditor rule notes

### `image-without-graph-required`

- Rationale: a stem that explicitly directs the learner to visual evidence is graph-dependent, so omitted `graphRequired` metadata can allow the question to run without required evidence.
- Severity: `WARNING` because the language is a strong, machine-detectable signal, while a human must still confirm the intended asset.
- Detection: an image is attached, `graphRequired` is not true, and the stem contains a recognized graph/figure/table/point cue.
- Example: “Refer to the graph. Which point is productively inefficient?” with `graphRequired: false`.
- Limitation: a cue can occasionally be incidental, so the auditor recommends confirming the asset before changing metadata.

### `attached-graph-possibly-decorative`

- Rationale: an attached graph can be pedagogically unnecessary without being a metadata defect.
- Severity: `REVIEW` because necessity depends on the economics task and cannot be decided from attachment alone.
- Detection: an image is attached, `graphRequired` is not true, and the stem has no recognized direction to use visual evidence.
- Example: a pure scarcity-definition item carrying an unrelated PPF image.
- Limitation: implicit visual tasks may lack an explicit cue; reviewers must inspect the actual asset and question before retaining, requiring, or removing it.

### `near-duplicate-stem` comparison note

- Rationale: highly similar stems may be intentional mirrors or role-specific variants rather than redundant questions.
- Severity: `REVIEW`.
- Detection: the existing token-similarity threshold is retained; the finding now reports heuristic differences in numerical values, graph points, direction, pool/role, or scenario/wording.
- Example: two PPF tradeoff calculations that use different movements and quantities.
- Limitation: the difference labels are review aids, not a semantic-equivalence judgment; a human still decides whether the pair tests meaningfully different reasoning.

### `graph-evidence-redundant-in-stem`

- Rationale: a graph-reading question does not test graph use when its stem has already translated the relevant visual evidence into numbers or prose.
- Severity: `REVIEW`, because distinguishing graph-derived evidence from legitimate external scenario information can require semantic judgment.
- Detection: a graph-directed item asks for a graph result while also supplying both endpoint coordinates, both changes in a labeled movement, repeated point-to-point tradeoffs, or an already stated shortage/surplus result.
- Bad example: “Refer to the graph. Moving from D to E increases X by 4 and reduces Y by 20. What is the opportunity cost per X?”
- Good example: “Refer to the graph. What is the opportunity cost per X when production moves from D to E?”
- Limitation: numbers such as a new tax, income change, technology shock, or other external scenario input are not necessarily graph-derived. The rule uses narrow patterns and leaves the final necessity judgment to a reviewer.

For every graph-required question, authors must identify (1) information supplied by the scenario and (2) evidence the learner must extract from the graph. Ask whether the item remains answerable if the graph is hidden. If it does, and graph reading is the intended skill, revise the item before finalization without removing its accessibility metadata.

## Audit commands

```powershell
node audit_tools/question_quality_auditor.mjs --concept demand
node audit_tools/question_quality_auditor.mjs --concepts demand,supply,market-equilibrium --report validation_artifacts/question_quality/report.md --json validation_artifacts/question_quality/report.json
node audit_tools/question_quality_auditor.mjs --concept demand --pools easy,medium,hard
node audit_tools/question_quality_auditor.mjs --all --fail-on error
```

The reusable remaining-Principles authoring helper invokes the same auditor during `finalizeQuestions` and exposes the result as `questions.qualityAudit`. New authoring configurations must pass `enforceQualityGate: true`; this makes deterministic `ERROR` findings block serialization while warnings and reviews remain in the manual acceptance record. Legacy authoring configurations are report-only so this infrastructure change does not silently rewrite or block unrelated historical banks.
