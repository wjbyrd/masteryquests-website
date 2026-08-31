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
- Answer options may test the interpretation of graph evidence, but they must not define which observations, stages, points, or coordinates the question intends.
- Feedback must explain the economic relationship or reasoning. Do not merely identify a dot, line, or keyed option.
- Assign difficulty by cognitive work, not by the presence of a graph. Hard and higher items should require genuine multi-step reasoning, synthesis, comparative statics, trap diagnosis, or deeper interpretation.
- Use plausible, conceptually diagnostic distractors. Avoid duplicates, absurd category mismatches, answer-length giveaways, and clusters of absolute wording that cue the answer.
- Maintain one defensible answer. Preserve clean units, currency, percentages, precision, capitalization, punctuation, and Unicode.
- Match concept, learning objective, skill/type, difficulty, checkpoint/support role, and graph-required metadata to the task the learner actually performs.
- Ensure every curve, point, axis, and unit named in the stem or feedback matches the registered asset and its accessibility description.
- Do not automatically rewrite semantic ambiguity, difficulty, graph necessity, or pedagogical weakness. Flag those items for a qualified human review.

## Graph-assessment contract

Every graph-required item must be renderable, necessary, sufficient, matched, accessible, non-leaking, and economically meaningful.

- **Renderable:** validate the source file, exact registered path and case, integrity metadata, generated embedding/reference, and actual generated-Quest resolution. Source existence alone is not enough.
- **Necessary:** the stem must not reproduce evidence the learner is supposed to read from the graph.
- **Sufficient:** the graph must clearly identify every required point, stage, region, value, guide, axis, and unit before the learner reads the options.
- **Matched:** graph, stem, options, key, feedback, and accessibility must describe the same curves, points, values, stages, and economic situation.
- **Accessible and non-leaking:** nonvisual learners must receive equivalent underlying evidence, such as coordinates, curve ordering, or structured relationships, without being told the assessed inference, classification, calculation, or answer.
- **Economically meaningful:** unless graph literacy is the stated objective, use the visual evidence to test economics rather than missing ticks, formatting, labels, or generic limits on exact measurement. Rich multi-curve graphs deserve correspondingly meaningful reasoning, especially at Hard, Elite, and Legendary tiers.

Necessary and sufficient are independent. A graph can be sufficient but unnecessary because the stem leaks its evidence, or necessary but insufficient because the intended observations are not identifiable. Both conditions are required. A broken image paired with answer-bearing accessibility is a severe assessment failure; validate rendering and accessibility leakage independently.

Shared assets must be evaluated question by question. An asset can be valid for one task yet insufficient, revealing, or pedagogically underused for another.

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

### `accessibility-answer-leak`

- Rationale: accessibility must provide task-equivalent evidence, not the conclusion being assessed.
- Severity: `REVIEW` by default.
- Detection: the question asks the learner to identify a shift, outcome, or classification while the accessibility text states that same economic result.
- Bad example: asking which curve shifted while the description says “supply shifts left.”
- Good example: identify the curves, labeled intersections, coordinates, or relative positions from which the learner can infer the shift.

### `graph-question-evidence-mismatch`

- Rationale: topic relevance does not make a graph sufficient for a specific task.
- Severity: `WARNING` for precise missing-point, missing-stage, option-defined-path, or missing-curve evidence; otherwise `REVIEW` is appropriate.
- Detection: the stem references evidence not identified by the graph contract, a multi-stage task omits its observation anchors, answer choices define the intended path, or a combined-equilibrium task lacks one curve family.

### `graph-task-low-economic-value`

- Rationale: economics graphs should ordinarily assess economic reasoning rather than graphical meta-properties.
- Severity: `REVIEW`.
- Detection: economics-concept items focus on absent numerical ticks, exact-magnitude limitations, label properties, or generic graph capabilities.
- Limitation: direct equilibrium, shortage/surplus, PPF classification, opportunity-cost, and economically meaningful value-reading tasks remain legitimate.

Generated graph-integrity validation is distinct from these content rules. It blocks a build when a graph-required item lacks an exact registered asset or when that asset does not survive into the generated Quest as an embedded image.

For every graph-required question, authors must identify (1) information supplied by the scenario and (2) evidence the learner must extract from the graph. Ask whether the item remains answerable if the graph is hidden. If it does, and graph reading is the intended skill, revise the item before finalization without removing its accessibility metadata.

## Graph authoring checklist

1. What information comes from the scenario?
2. What must the learner read from the graph, and does the stem accidentally provide it?
3. Does the graph clearly contain and identify every required observation without help from the answer choices?
4. If the graph were hidden, could a visual learner still answer? If yes, graph dependence may be fake.
5. With only the graph and stem, can the learner identify all necessary evidence? If no, the task may be insufficient.
6. Do graph, stem, options, key, feedback, axes, units, values, curves, points, and stages agree?
7. Does accessibility provide equivalent evidence without stating the conclusion?
8. Does the generated Quest actually render and enlarge the graph?
9. What economic reasoning is required, and does it match the assigned difficulty?
10. If graph literacy is not the objective, is the item using the graph for economics rather than a graphical meta-property?
11. If the asset is shared, does it satisfy this particular question’s full contract?

## Audit commands

```powershell
node audit_tools/question_quality_auditor.mjs --concept demand
node audit_tools/question_quality_auditor.mjs --concepts demand,supply,market-equilibrium --report validation_artifacts/question_quality/report.md --json validation_artifacts/question_quality/report.json
node audit_tools/question_quality_auditor.mjs --concept demand --pools easy,medium,hard
node audit_tools/question_quality_auditor.mjs --concepts demand,supply,market-equilibrium,production-possibilities-frontier --graph-linked-only
node audit_tools/question_quality_auditor.mjs --all --fail-on error
```

The reusable remaining-Principles authoring helper invokes the same auditor during `finalizeQuestions` and exposes the result as `questions.qualityAudit`. New authoring configurations must pass `enforceQualityGate: true`; this makes deterministic `ERROR` findings block serialization while warnings and reviews remain in the manual acceptance record. Legacy authoring configurations are report-only so this infrastructure change does not silently rewrite or block unrelated historical banks.
