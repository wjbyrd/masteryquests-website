# Mastery Quests — Mastery Report 2.0 Upgrade Report
## Composer 4.5s.0

### Scope
This release upgrades the existing Mastery Report without replacing its diagnostic structure. It also fixes the practice early-end path so Exam Drill and Unlimited Practice reliably produce the Mastery Report when a student decides to stop.

### Evidence labels
Mastery Report 2.0 adds four student-facing evidence labels:

- **Limited Evidence** — too few scored attempts to make a strong mastery claim.
- **Developing Evidence** — the sample is growing, but more repetition or broader difficulty exposure is needed.
- **Strong Evidence** — enough evidence exists to trust the diagnosis. This does **not** mean performance was strong.
- **Mastery Demonstrated** — repeated strong performance plus advanced-or-harder exposure supports a mastery claim, and no major repeated diagnostic weakness remains.

This directly fixes the old interpretation problem where a tiny perfect sample could look stronger than a much larger, more informative run. A 2/2 result is now Limited Evidence. A long run can carry Strong Evidence even when accuracy is weak, because the engine has enough information to trust the weakness diagnosis.

### Evidence inputs now retained
The adaptive record now preserves difficulty exposure alongside attempts, correctness, response time, concepts, skills, and question forms. Difficulty evidence is grouped for reporting as:

- Foundational
- Intermediate
- Advanced
- High Challenge
- Repair / Bridge

High Challenge includes Elite, Legendary, and checkpoint-level exposure. Repair/Bridge work is visible as support evidence but does not masquerade as advanced challenge evidence.

### Mastery thresholds
At the overall-report level, the evidence ladder uses scored-attempt volume plus difficulty exposure. Mastery Demonstrated additionally requires strong accuracy, advanced-or-harder evidence, stable recent performance, and no major repeated concept/question-form/skill/behavior weakness.

At the individual diagnostic-row level, evidence labels are also shown so faculty and students can distinguish a weak signal based on two questions from a weak signal supported by repeated attempts.

### Practice early-end fix
Exam Drill and Unlimited Practice now share one deliberate exit path:

**End Practice / Battle Menu → Confirm → Mastery Report**

Both fixed controls now route through the same practice-ending confirmation while a practice run is active. Once the run has already ended, Battle Menu returns normally instead of attempting to end the practice session again.

Important Exam Drill rule preserved: manually ending Exam Drill generates evidence but does **not** award the Exam Drill completion flag. Full completion still requires reaching the end of the 30-room Exam Drill path.

### Controlled screenshot review
Three controlled Mastery Report 2.0 screenshots are included under:

`evidence/mastery-report-2.0/`

Profiles:

1. Expert Student — 92%, 22/24 → **Mastery Demonstrated**
2. Average Student — 75%, 18/24 → **Strong Evidence** with targeted weaknesses
3. Weak Student — 42%, 10/24 → **Strong Evidence** of unstable command

The average/weak comparison is intentional. It demonstrates that Strong Evidence means the report has enough data to trust the diagnosis, not that the student performed strongly.

### Regression validation
Passed:

- all seven mode preflights
- mode availability behavior
- Quiz Mode regression
- Unlimited Practice regression
- Exam Drill early-end report flow
- Unlimited Practice early-end report flow
- Battle Menu practice-exit funnel
- Exam Drill early-exit completion guard
- evidence-label edge cases
- template JavaScript syntax check

### Protected content integrity
Unchanged from Composer 4.5r.0:

- canonical questions: **7,977**
- question assets: **399**
- `composer_library.js`: byte-identical
- `composer_registry.json`: byte-identical
- `composer_library_manifest.json`: byte-identical
- all 399 question assets: byte-identical

This is an engine/report upgrade. It does not reopen or rewrite the completed question library.
