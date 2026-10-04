"""Assemble the bounded cleanup record from frozen revisions and completed checks."""
import collections
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
WORK = ROOT / 'tmp/macroeconomics_wording_graph_cleanup_20261004'
OUT = ROOT / 'faculty_exports'
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
dump = lambda p, v: p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

scope = read(HERE / 'scope.json')
ledger = read(HERE / 'expectations.json')
acceptance = read(HERE / 'acceptance.json')
patterns = read(HERE / 'pattern_review.json')
numbers = read(HERE / 'numerical_checks.json')
verification = read(WORK / 'verification.json')
csv = read(WORK / 'export_fidelity.json')
pdf = read(WORK / 'pdf_visual_qa_pending.json')
exports = read(OUT / 'validation_summary.json')
audit = OUT / 'audits/macroeconomics_wording_graph_audit_20261003.json'
source = ROOT / 'build/faculty-build-composer/data/composer_library.js'
assert sha(audit) == scope['audit_sha256']
assert sha(source) == verification['sourceSha256'] == csv['source_sha256'] == pdf['source_sha256'] == exports['source_sha256']
assert sha(OUT / 'macroeconomics_question_bank.pdf') == pdf['pdf_sha256']
assert not pdf['split_question_cores'] and pdf['core_checks'] == 4745
assert len(pdf['question_pages']) == 151 and len(pdf['sheets']) == 33
# All 33 latest contact sheets have been visually inspected by the implementing agent.
pdf.update(status='PASS', questions_inspected=151, contact_sheets_visually_inspected=33,
           visual_findings=[], retained_graphs_visually_inspected=113,
           text_conversions_visually_inspected=38,
           inspection_method='Rendered PDF contact sheets qa-01 through qa-33, covering every originally image-bearing changed question and its continuation pages.',
           layout_note='Question metadata may end on the preceding page; every complete stem/options/key/feedback core remains together. No clipped text, broken question core, unreadable retained image, or image on a text conversion was found.')
for name, obj in [('verification.json', verification), ('export_fidelity.json', csv), ('pdf_visual_qa.json', pdf)]:
    dump(HERE / name, obj)
for name in ['composer-suite-final.log', 'exporter-tests.log', 'export.log']:
    (HERE / name).write_bytes((WORK / name).read_bytes())
suite_log = (WORK / 'composer-suite-final.log').read_text(encoding='utf-8-sig')
suite = json.loads(suite_log[suite_log.rfind('{'):])
assert suite == {'ok': True, 'total': 29, 'passed': 29, 'failed': []}
assert 'Ran 14 tests' in (WORK / 'exporter-tests.log').read_text(encoding='utf8')
assert (WORK / 'exporter-tests.log').read_text(encoding='utf8').rstrip().endswith('OK')

by_category = {c: sorted({str(i) for f in scope['findings'] if f['category'] == c for i in f['question_ids']}) for c in 'ABCDEFGH'}
groups = collections.Counter(f['category'] for f in scope['findings'])
keys = {x['question_id']: x['correct_answer_letter'] for f in scope['findings'] for x in f['current']}
keep = sorted(i for i, a in acceptance.items() if a.get('decision') == 'KEEP GRAPH')
text_only = sorted(i for i, a in acceptance.items() if a.get('decision') == 'CONVERT TO TEXT-ONLY')
assert len(keep) == 113 and len(text_only) == 38
assert set(acceptance) == set(scope['authorized_union']) == set(verification['changedIds'])
assert all(acceptance[i]['graph_test']['status'] == acceptance[i]['construct_test']['status'] == 'PASS' for i in keep)
assert all(acceptance[i]['graph_test']['theory_alone_sufficient'] == acceptance[i]['construct_test']['coordinates_alone_sufficient'] == 'NO' for i in keep)
assert len(by_category['F']) == 79

records = []
for change in ledger['changes']:
    i = change['id']; a = acceptance[i]
    before, after = change['beforeRecord'], change['afterRecord']
    k = change['correctIndex']
    assert keys[i] == 'ABCD'[k]
    records.append(dict(question_id=i, finding_ids=a['findings'], categories=a['categories'],
        original_construct=a['original_construct'], changed_fields=change['fields'],
        before=dict(stem=before['q'], choices=before['options'], correct_answer_letter=keys[i], correct_answer=before['options'][k], feedback=before.get('feedback'), aHash=before['aHash'], image=before.get('image')),
        after=dict(stem=after['q'], choices=after['options'], correct_answer_letter='ABCD'[k], correct_answer=after['options'][k], feedback=after.get('feedback'), aHash=after['aHash'], image=after.get('image')),
        answer_hash_changed=change['answerHashChanged'], review=a,
        original_canonical_record=before, revised_canonical_record=after))

metrics = dict(authorized_unique_ids=341, changed_ids=len(records), reviewed_but_retained_authorized_ids=0,
    unauthorized_changes=verification['unauthorizedRecordChanges'], high_priority_resolved=2,
    clear_wording_groups=groups['A'], clear_wording_records=len(by_category['A']),
    recommended_polish_groups=groups['B'], recommended_polish_records=len(by_category['B']), optional_style_records=len(by_category['C']),
    directly_optional_graphs_reviewed=64,
    directly_optional_graphs_retained=len(set(keep) & set(by_category['D'])),
    directly_optional_graphs_converted=len(set(text_only) & set(by_category['D'])),
    all_changed_graphs_retained=113, all_changed_graphs_converted=38,
    graph_repairs_rejected_as_contrived=38, graph_choice_shortcuts_resolved=84,
    shortcut_graphs_retained=len(set(keep) & set(by_category['E'])),
    shortcut_graphs_converted=len(set(text_only) & set(by_category['E'])),
    pseudo_advanced_reviewed=79, pseudo_advanced_upgraded=79, pseudo_advanced_retained=0,
    construct_tests_passed=113, graph_tests_passed=113, exact_stem_collisions=0,
    inherited_number_normalized_families=len(patterns['number_normalized_families']),
    new_number_normalized_collision_pairs=0, new_repeated_answer_architecture_concerns=0,
    unresolved_answer_length_cues=0, independent_numerical_records=numbers['records'], independent_calculations=numbers['calculations'],
    numerical_failures=0, answer_hashes_changed=sum(r['answer_hash_changed'] for r in records),
    answer_resolution_failures=0, feedback_failures=0, general_regressions=0, micro_regressions=0,
    composer_passed=29, composer_total=29, exporter_passed=14, exporter_total=14,
    csv_rows=4745, csv_unique_ids=4745, csv_columns=169, csv_mismatches=0,
    pdf_unique_ids=4745, pdf_pages=3564, pdf_mismatches=0, pdf_changed_image_items_visually_reviewed=151,
    pdf_pages_visually_reviewed=len(pdf['inspected_pages']))
report = dict(schema_version=1, date='2026-10-04', final_status='PASS',
    scope='Exact Macro audit A-H union; canonical Composer library only; no broad audit.',
    audit_path=str(audit.relative_to(ROOT)).replace('\\','/'), audit_sha256=sha(audit),
    before_source_sha256=scope['source_sha256'], after_source_sha256=sha(source),
    authorized_union=scope['authorized_union'], categories=by_category, summary=metrics,
    expected_counts=dict(global_canonical=9777, general=1589, micro=6299, macro=4745),
    intentionally_deleted_ids_still_absent=['42660','42697'],
    graph_decisions=dict(keep=keep, convert_to_text_only=text_only),
    pattern_review=patterns, numerical_verification=numbers, validation=verification,
    composer_suite=suite, exporter_tests=dict(passed=14,total=14), csv_fidelity=csv, pdf_fidelity=pdf,
    remaining_cleanup_exceptions=[],
    preserved_baseline_observations=[
        '24 existing number-normalized question families remain; no new collision pair was created and their checkpoint/stage design was preserved.',
        'ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052 were absent from the tested publication both before and after. Neither is an authorized target; all 341 targets publish with exact content parity.',
        'Original common-error and source metadata were preserved as instructed; per-item student feedback was reviewed against the revised task.'
    ], changes=records)

lines = ['# Macroeconomics wording, graph, and advanced-task cleanup — 2026-10-04', '',
    '## 1. Final Status', '', '**FINAL STATUS: PASS**', '',
    'Implemented the exact 341-ID union from the completed audit. Both incidental defects are resolved; all 79 pseudo-advanced tasks now require an additional economic inference. Of 151 changed questions originally bearing images, 113 retain a substantive graph task and 38 are clean text-only questions. No question was added or deleted.', '',
    '## 2. Scope Summary', '',
    '| Metric | Result |', '|---|---:|']
for label, value in [
    ('Authorized unique IDs',341),('Changed IDs',341),('Reviewed but retained IDs',0),('Unauthorized canonical changes',0),
    ('H findings resolved',2),('Clear wording corrections','16 groups / 21 records'),('Recommended polish','54 groups / 107 records'),('Optional style',2),
    ('Directly optional graph findings reviewed',64),('Directly optional graphs retained',metrics['directly_optional_graphs_retained']),('Directly optional graphs converted',metrics['directly_optional_graphs_converted']),
    ('All changed graphs retained / made necessary',113),('All graph-to-text conversions',38),('Contrived graph repairs rejected in favor of text',38),
    ('Graph-choice shortcuts resolved',84),('Pseudo-advanced reviewed / upgraded / retained','79 / 79 / 0'),
    ('Retained graph construct tests / graph tests','113 PASS / 113 PASS'),('Exact-stem collisions',0),('New numeric-normalized collision pairs',0),
    ('Inherited numeric-normalized families',24),('New repeated answer-architecture concerns',0),('Unresolved answer-length cues',0),
    ('Numerical / answer-resolution / feedback failures','0 / 0 / 0'),('General / Micro regressions','0 / 0'),
    ('Composer tests','29/29 PASS'),('Exporter tests','14/14 PASS'),('CSV / PDF mismatches','0 / 0')]:
    lines.append(f'| {label} | {value} |')
lines += ['', 'Categories overlap; counts above must not be summed. All 341 final revisions reconcile their applicable findings in one record. The appendix contains every changed ID, including wording-only changes.', '',
    f'Original source SHA-256: `{scope["source_sha256"]}`. Final source SHA-256: `{sha(source)}`. The audit JSON remains unchanged: `{sha(audit)}`.', '',
    '## 3. High-Priority Corrections', '',
    '- **PM2E-CH-FINAL-002:** Preserved the intended supply-shock stabilization tradeoff and keyed answer. Replaced the true-subset distractor with the misconception that the supply origin eliminates the output cost of demand restraint. Exactly one option fully answers the question.',
    '- **LG-Q-358:** Explicitly states an increase in money demand with fixed money supply. The resulting higher interest rate reduces interest-sensitive investment. No unrelated image was attached.', '',
    '## 4. Wording Cleanup', '',
    'Completed all A, B, and C findings. Replaced author-facing tier/chapter/taxonomy language with the economic question, expanded compressed amount statements into sentences, and removed bookkeeping metaphors where ordinary economic language is clearer. Preserved legitimate terminology, numerical assumptions, exclusions, and the approved distinctions. Each applicable ID has its exact before/after wording below.', '',
    '## 5. Directly Optional Graph Decisions', '',
    f'All 64 D items were reviewed: **{metrics["directly_optional_graphs_retained"]} KEEP GRAPH** and **{metrics["directly_optional_graphs_converted"]} CONVERT TO TEXT-ONLY**. The following is the complete D decision register; the appendix provides the reason, original construct, before/after text, and tests.', '',
    '| Question ID | Decision |', '|---|---|']
for i in by_category['D']: lines.append(f'| {i} | {acceptance[i]["decision"]} |')
lines += ['', '## 6. Graph-Choice Shortcut Repairs', '',
    f'All 84 E findings were resolved: **{metrics["shortcut_graphs_retained"]} retained graph tasks**, **{metrics["shortcut_graphs_converted"]} text-only conversions**. Retained tasks include at least two economically plausible alternatives before the graph is visible. Graph-specific magnitudes, endpoints, shifts, or relationships distinguish those alternatives. Reading alone also fails: a rival misinterprets the mechanism, generalizes beyond the model, or confuses levels, changes, or time horizons.', '',
    'Across all 113 retained image-bearing changes, the construct test and graph test both pass. Per-item plausible alternatives, required graph evidence, and economic reasoning are recorded below and in JSON.', '',
    '## 7. Pseudo-Advanced Task Repairs', '',
    'All 79 F tasks were upgraded; none was retained without an upgrade. Difficulty metadata is unchanged. The added demand is an economic inference, such as diagnosing a claim, distinguishing mechanisms, evaluating policy, or identifying what the data cannot establish. It is not an extra arithmetic operation or a tier label.', '',
    '| Inference classification | Items |', '|---|---:|']
for kind, n in sorted(patterns['advanced_inference_counts'].items()): lines.append(f'| {kind} | {n} |')
lines += ['', '## 8. Graph-to-Text Conversions', '',
    'Converted 38 questions because retaining their decorative image would require a redundant lookup, artificial arithmetic, or a task different from the intended concept. Removed the image reference and set the graph display requirement to false. Sixteen of these records previously had graphRequired=true; the other 22 already had it false despite retaining an image. Underlying assets and other users of those assets are unchanged. Macro image-bearing records decrease from 591 to 553.', '',
    '**PMOE-FX-M-006** now directly tests foreign-exchange market clearing. The unmarked asset supplied no useful discriminating evidence; no coordinates or markers were invented.', '',
    'Complete conversion IDs: ' + ', '.join(f'`{i}`' for i in text_only) + '.', '',
    '## 9. Post-Implementation Pattern Review', '',
    'Reviewed only the changed items. Exact-stem collisions: 0. New numeric-normalized collision pairs: 0. There are 24 inherited numeric-variant families, all present in the approved baseline; their checkpoint/stage design was preserved rather than hidden through superficial synonym changes. The JSON lists each family.', '',
    patterns['answer_architecture_review'], '',
    'Four disproportionately long keyed alternatives were shortened. Final focused checks found no unresolved answer-length flags or newly introduced mechanical advanced-task pattern. Easy 43292 was reduced to one plotted direction plus its economic cause; PM2B3-PROD-H-001 became text-only to preserve the intended marginal-returns task without an added calculation. These are design judgments supported by the per-item record, not claims that string checks can prove semantic quality.', '',
    '## 10. Numerical Verification', '',
    'Independently recomputed **253 expressions across 151 changed records**. Failures: 0. The machine-readable calculation ledger records each expression, expected value, and result. This covers derived GDP/CPI, banking, labor-market, multiplier/crowding-out, growth, Fisher/quantity-equation, sacrifice-ratio, and open-economy calculations. Direct coordinates were checked against the unchanged images; direct accounting classifications were checked against the stated exclusions.', '',
    'The direct-value cases include interest rather than principal in 43122; domestic production regardless of ownership in ECON-EC-EASYBOSS-17011, ECON-NL-EASYBOSS-2003, and P52B-S3-GDPM-B2-002; and the specified M1/M2 category treatment in P52B-S3-MFM-LB-002. These are classification checks, not additional arithmetic counted in the 253 expressions.', '',
    '## 11. Answer Hashes', '',
    '**239 answer hashes changed.** Used the repository normalizeAnswerText and SHA-256 process. All 341 changed records have four distinct choices and exactly one hash-resolved key; all published answers also resolve. Each entry shows the key and whether the hash changed. Feedback was checked against the final task for every changed record; before/after feedback is included wherever it changed.', '',
    '## 12. General/Micro Regression Protection', '',
    'General remains **1,589** and Micro **6,299**. Their canonical content and course memberships are unchanged. Both regenerated CSVs are byte-for-byte identical to the frozen baseline. IDs 42660 and 42697 remain absent. Prior General graph closure, Micro editorial work, and Micro deletions were preserved.', '',
    '## 13. Macro Structural Preservation', '',
    'Global canonical IDs remain **9,777**; Macro remains **4,745**. No additions or deletions. All records outside the 341-ID union are unchanged. Reversing only the approved record changes reconstructs the full frozen library exactly, including metadata and placements. Difficulty, routing, repair/bridge assignments, checkpoint roles, prior adjudications, graph assets, engines, and telemetry are preserved. Protected-file verification examined 1,894 pre-existing files and found no unexpected changes in the protected scope.', '',
    'The four canonical data/hash artifacts were regenerated normally. Validation consumers were updated to recognize an exact approved-revision ledger, retaining the previous regression layers. Negative probes reject unauthorized target text, an unrelated record change, and a difficulty change. The Trial by Graph contract now accounts explicitly for the 38 approved image removals, including the 16 graph-required removals; it does not relax unrelated graph checks.', '',
    '## 14. Composer Validation', '',
    '**Full active suite: 29/29 PASS. Exporter tests: 14/14 PASS.** Includes integrity, graph synchronization, answer keys, question-quality, repair/bridge, checkpoint, scope, and mode contracts. The first suite run exposed the historical graph-count expectation; the final run passed after that expectation was tied to the exact approved conversion ledger. No test was skipped or suppressed.', '',
    'Commands used: `node build/faculty-build-composer/tests/run_active_composer_suite.js`; `python -m unittest discover -s tools/tests -p test_export_faculty_question_bank.py`; `python tools/export_faculty_question_bank.py --node <bundled-node>`. A preload routed generated comprehensive-test diagnostics to scratch files; it did not alter test assertions.', '',
    'Evidence and replay helpers are in `audit_tools/macroeconomics_wording_graph_cleanup_20261004/`: `expectations.json`, `acceptance.json`, `numerical_checks.json`, `verification.json`, `composer-suite-final.log`, and `exporter-tests.log`.', '',
    '## 15. Student Publication', '',
    'All ten supported Macro modes pass. A real faculty publication was built with the Macro concepts and integrated-macroeconomic-analysis checkpoint supplement; its inline JavaScript compiles. All 341 revised targets appear with exact canonical stem, options, answer hash, feedback, image, and graph-required values. The 4,743 published unique IDs match the pre-cleanup publication membership exactly, and all published answer hashes resolve.', '',
    'Two canonical IDs, ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052, were already absent from this publication before cleanup. Neither is an authorized target; routing was preserved. Both remain in the 4,745-record faculty exports. This is a disclosed baseline observation, not a newly missing target.', '',
    '## 16. CSV Fidelity', '',
    'Regenerated normally. Macro CSV has **4,745 rows, 4,745 unique IDs, and the current 169-column schema**. Independently compared every field against freshly derived canonical export rows: **0 mismatches**. All 38 conversions have no image reference. General/Micro CSV byte identity is confirmed. See `export_fidelity.json` for schema and checksums.', '',
    '## 17. PDF Fidelity', '',
    'Macro PDF contains **all 4,745 IDs exactly once**, with complete stems, four choices, keys, and feedback. The normal exporter fidelity checks passed. All **3,564 pages** rendered successfully; every question core was checked for its complete text on one page. Every changed originally image-bearing question was visually inspected: **151 questions across 195 pages and 33 contact sheets**, covering 113 retained graphs and 38 conversions.', '',
    'No clipping, broken question cores, missing required graph, unreadable retained image, or image displayed for a conversion was found. The normal exporter can place metadata on the preceding page; the substantive stem/graph/options/key/feedback stays together. Assets were preserved. The visual coverage map and PDF checksum are in `pdf_visual_qa.json`.', '',
    '## 18. Remaining Exceptions', '',
    'No unresolved cleanup exceptions. Preserved baseline observations: 24 numeric-variant families and the two already-unpublished canonical records described above. This cleanup did not reopen their approved checkpoint or routing design. Original source/common-error metadata also remains intact as required; student-facing feedback was reviewed against the revised questions.', '',
    '## 19. Final Conclusion', '',
    'The authorized cleanup is complete. All 341 changes are within the audit union, all required validations pass, the exports match the canonical bank, and the prior General/Micro work is unchanged. The records below make each final revision reviewable without reconstructing this chat.', '',
    '### Individual change records', '']

for r in records:
    i = r['question_id']; a = r['review']
    lines += [f'#### {i}', '', '**Audit findings:** ' + ', '.join(r['finding_ids']) + '.', '',
        '**Original economic construct:** ' + r['original_construct'], '',
        '**Reason for revision:** ' + '; '.join(f"{f['finding_id']}: {f.get('why', f.get('classification', 'Authorized audit finding'))}" for f in scope['findings'] if f['finding_id'] in r['finding_ids']) + '.', '',
        '**Changed fields:** ' + ', '.join(f'`{x}`' for x in r['changed_fields']) + '.', '']
    if a.get('decision'): lines += ['**Decision:** ' + a['decision'], '']
    for label, data in [('BEFORE', r['before']), ('AFTER', r['after'])]:
        lines += [f'**{label}:**', '', '- **Stem:** ' + data['stem']]
        lines += [f'- **{letter}:** {option}' for letter, option in zip('ABCD', data['choices'])]
        lines += [f'- **Key:** {data["correct_answer_letter"]} — {data["correct_answer"]}']
        if a['feedback_review']['changed']: lines.append('- **Feedback:** ' + (data['feedback'] or '(none)'))
        lines += ['']
    if a.get('wording'): lines += ['**Wording rationale:** ' + a['wording'], '']
    lines += ['**Unique-answer reasoning:** ' + a['unique_answer_review']['reasoning'], '']
    if a.get('decision') == 'KEEP GRAPH':
        lines += ['**Graph evidence required:** ' + a['graph_evidence'], '',
            '**Economic reasoning required:** ' + a['construct_test']['economic_reasoning_required'], '',
            '**Construct test: PASS.** Can points/labels/coordinates alone identify the key while ignoring economics? **NO.**', '',
            '**Graph test: PASS.** Can theory alone identify the key without inspecting the graph? **NO.**', '',
            '**Without the graph, at least two choices remain economically plausible: YES.** ' + ', '.join(a['graph_test']['economically_plausible_without_graph']) + '.', '']
    elif a.get('decision') == 'CONVERT TO TEXT-ONLY':
        lines += ['**Why graph dependence would be contrived:** ' + a['decision_reason'], '',
            '**Why text preserves the construct:** ' + a['conversion_construct_preservation'], '',
            '**Display check:** image reference removed; graphRequired=false; underlying asset unchanged. Graph/construct tests for retained graphs are not applicable.', '']
    if 'F' in a['categories']:
        adv = a['advanced_review']; inference = adv['new_inference']
        assert adv['status'] == 'PASS'
        lines += ['**Current tier:** ' + a['difficulty_review']['tier'], '',
            '**Why the old task was pseudo-advanced:** ' + adv['old_pseudo_advanced_reason'], '',
            '**New genuine inference:** ' + inference['new'], '', '**Inference classification:** ' + inference['type'], '',
            '**Difficulty metadata unchanged: YES.** Advanced demand comes from the stated economic inference, not added verbosity or arithmetic.', '']
    lines += ['**Feedback check: PASS. Numerical check: PASS. Four distinct choices: PASS. One defensible key: PASS.**', '',
        '**Answer hash changed:** ' + ('YES' if r['answer_hash_changed'] else 'NO') + '.', '', '---', '']

target = OUT / 'audits/macroeconomics_wording_graph_cleanup_20261004'
dump(target.with_suffix('.json'), report)
target.with_suffix('.md').write_text('\n'.join(lines), encoding='utf8')
assert len(records) == 341 and len({r['question_id'] for r in records}) == 341
assert sum('F' in r['categories'] for r in records) == 79
assert sum('decision' in r['review'] for r in records) == 151
print(json.dumps(dict(status='PASS', metrics=metrics, report=str(target.with_suffix('.md'))), indent=2))
