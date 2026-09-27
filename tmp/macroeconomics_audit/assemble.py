"""Assemble read-only audit evidence into the four user-requested deliverables."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'tmp/macroeconomics_audit'
OUT = ROOT / 'faculty_exports/audits'
read = lambda name: json.loads((WORK / name).read_text(encoding='utf8'))
projection = read('projection.json')
questions = {qid: rec['q'] for qid, rec in projection.items()}
findings = read('findings_draft.json')
reviews = read('review_notes.json')
numeric = read('numeric_checks.json')
images = read('images.json')
graph_reviews = read('graph_review_progress.json')
exports = read('export_checks.json')
areas = read('all_area_ids.json')
shared_g = set(read('shared_general_ids.json'))
shared_m = set(read('shared_micro_ids.json'))
shared = shared_g | shared_m
initial_hashes = read('initial_hashes.json')
protection = read('protection_check.json')
assert not protection['changed'] and not protection['missing'], protection
assert len(questions) == 4745
assert len(set(areas['general']) | set(areas['micro']) | set(areas['macro'])) == 9779

CLASSES = {
    'A': 'Economic validity / ambiguity', 'B': 'Answer-choice structure',
    'C': 'Metadata / routing', 'D': 'Difficulty — reclassify',
    'E': 'Difficulty — strengthen distractors', 'F': 'Difficulty — rewrite advanced/boss',
    'G': 'Repair → bridge', 'H': 'Redundancy / checkpoint', 'I': 'Feedback',
    'J': 'Graph / image', 'K': 'Maintenance / helper data', 'L': 'Instructor review',
}
SOURCES = [
    {'title': 'Federal Reserve: H.6 technical questions and answers', 'url': 'https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm', 'use': 'M1 savings-deposit definition change beginning May 2020; MAA-0111'},
    {'title': 'Federal Reserve: policy normalization questions and answers', 'url': 'https://www.federalreserve.gov/monetarypolicy/policy-normalization-qa.htm', 'use': 'Ample-reserves framework and administered rates; MAA-0032'},
    {'title': 'New York Fed: monetary policy implementation', 'url': 'https://www.newyorkfed.org/markets/domestic-market-operations/monetary-policy-implementation', 'use': 'Modern implementation framework; MAA-0032'},
    {'title': 'CBO: The Budget and Economic Outlook, 2026 to 2036', 'url': 'https://www.cbo.gov/publication/62105', 'use': 'Preserve explicitly dated February 2026 fiscal figures; rounded figures checked in context'},
]

# Recompute aggregates after targeted additions to an existing grouped finding.
by_question = defaultdict(list)
for index, f in enumerate(findings, 1):
    assert f['findingID'] == f'MAA-{index:04d}'
    ids = f['affectedQuestionIDs']
    assert ids and len(ids) == len(set(ids)) and set(ids) <= questions.keys()
    assert f['questionID'] in ids
    f['currentDifficulty'] = dict(Counter(questions[i].get('canonicalDifficulty') for i in ids))
    f['currentType'] = dict(Counter(questions[i].get('type') for i in ids))
    f['sourcePool'] = dict(Counter(questions[i].get('sourcePool') for i in ids))
    f['sharedWithGeneral'] = sorted(set(ids) & shared_g)
    f['sharedWithMicro'] = sorted(set(ids) & shared_m)
    f['familyMemberships'] = dict(Counter(questions[i].get('primaryConceptId') for i in ids))
    f['pdfPage'] = exports['question_pages'].get(f['questionID'])
    f['sourceOrExport'] = 'SOURCE'
    f['sharedBankImplications'] = 'Macro-exclusive affected IDs; preserve all General/Micro canonical records and routing.'
    f['relatedQuestionIDs'] = list(dict.fromkeys(f['relatedQuestionIDs']))
    assert set(f['relatedQuestionIDs']) <= questions.keys()
    f['implementationPriority'] = 1 if f['category'] in ('A', 'L') else 2 if f['category'] in ('F', 'G', 'H') else 3 if f['category'] in ('B', 'D', 'E') else 4
    f['coordinatedFindingIDs'] = []
    for qid in ids:
        by_question[qid].append(f['findingID'])
for f in findings:
    f['coordinatedFindingIDs'] = sorted({other for i in f['affectedQuestionIDs'] for other in by_question[i]} - {f['findingID']})
    if f['findingID'] in ('MAA-0124', 'MAA-0125', 'MAA-0126', 'MAA-0129', 'MAA-0132'):
        f['familyID'] = 'cross-family-' + {'MAA-0124': 'role-task-types', 'MAA-0125': 'stage-task-types', 'MAA-0126': 'common-error-placeholders', 'MAA-0129': 'feedback-specificity', 'MAA-0132': 'advanced-distractors'}[f['findingID']]
        f['topic'] = 'Multiple Macro concepts; see familyMemberships and per-question evidence'

numeric_by_id = defaultdict(list)
for index, n in enumerate(numeric, 1):
    n['checkID'] = f'MAN-{index:04d}'
    ids = n.get('ids', [n.get('id')])
    assert all(i in questions for i in ids), ids
    n['questionIDs'] = ids
    n['visibleInputSource'] = 'Exact current stem, options and graph in questionEvidence; no hidden precision used.'
    for qid in ids:
        numeric_by_id[qid].append(n['checkID'])

image_by_id = defaultdict(list)
for item in images:
    item['visualReview'] = 'PASS: visually inspected in contact sheet; no demonstrated geometry/label defect'
    item['reviewEvidence'] = [i for i, r in enumerate(graph_reviews) if item['index'] in r['indices']]
    assert item['reviewEvidence']
    assert (ROOT / item['resolvedFile']).is_file()
    assert hashlib.sha256((ROOT / item['resolvedFile']).read_bytes()).hexdigest() == item['sha256']
    for qid in item['ids']:
        image_by_id[qid].append(item['index'])

review_by_id = defaultdict(list)
for index, r in enumerate(reviews, 1):
    r['reviewID'] = f'MAR-{index:03d}'
    # A direct semantic review includes compact full-family stem/key sweeps;
    # do not misrepresent it as an independent full-option proof of every row.
    r['methodLimit'] = 'Family-level semantic/assessment review; full alternatives inspected for selected representatives and candidates, not an independent full-option proof of every member.'
    for qid in r['ids']:
        review_by_id[qid].append(r['reviewID'])
assert set(questions) - shared <= review_by_id.keys()

coverage = []
for qid, q in questions.items():
    fids = by_question[qid]
    current_findings = [findings[int(fid[4:]) - 1] for fid in fids]
    methods = ['canonical projection and identity/key integrity', 'CSV field-by-field fidelity', 'PDF text/order/core/navigation checks', 'whole-projection metadata and candidate scans']
    methods.append('prior General/Micro adjudication preserved; current projection/export cross-check' if qid in shared else 'whole-family stem/key and task-demand review with targeted full-option candidate checks')
    if qid in numeric_by_id:
        methods.append('independent visible-input numerical recomputation')
    if qid in image_by_id:
        methods.append('attached asset visually inspected at family level')
    status = 'INSTRUCTOR REVIEW' if any(f['instructorReviewRequired'] for f in current_findings) else 'CONFIRMED FINDING' if fids else 'SHARED PRIOR DECISION PRESERVED' if qid in shared else 'NO IDENTIFIED ISSUE'
    coverage.append({
        'questionID': qid, 'reviewMethods': methods,
        'familyReviewed': q.get('primaryConceptId'), 'familyReviewIDs': review_by_id[qid],
        'numericalCheck': numeric_by_id[qid] or None, 'imageAssetReview': image_by_id[qid] or None,
        'sharedPriorBankAdjudication': {'general': qid in shared_g, 'micro': qid in shared_m, 'decision': 'SHARED — PRIOR DECISION PRESERVED' if qid in shared else None},
        'findingIDs': fids, 'status': status, 'pdfPage': exports['question_pages'].get(qid),
    })

affected = set(by_question) & {q for q, ids in by_question.items() if ids}
instructor_ids = {qid for f in findings if f['instructorReviewRequired'] for qid in f['affectedQuestionIDs']}
stats = {
    'globalCanonicalIDs': 9779, 'generalQuestions': 1589, 'microQuestions': 6301, 'macroQuestions': 4745,
    'macroExclusiveQuestions': len(questions) - len(shared),
    'sharedWithGeneral': len(shared_g), 'sharedWithMicro': len(shared_m), 'sharedUnion': len(shared),
    'groupedFindings': len(findings), 'findingsBySeverity': dict(Counter(f['severity'] for f in findings)),
    'findingsByClass': {c: sum(f['category'] == c for f in findings) for c in CLASSES},
    'affectedByClass': {c: len({i for f in findings if f['category'] == c for i in f['affectedQuestionIDs']}) for c in CLASSES},
    'uniqueAffectedQuestions': len(affected), 'questionsWithNoIdentifiedIssue': len(questions) - len(affected),
    'percentageWithNoIdentifiedIssue': round((len(questions) - len(affected)) / len(questions) * 100, 2),
    'instructorReviewGroups': sum(f['instructorReviewRequired'] for f in findings), 'instructorReviewQuestions': len(instructor_ids),
    'coverageStatuses': dict(Counter(c['status'] for c in coverage)), 'independentlyRecomputedQuestions': sum(bool(v) for v in numeric_by_id.values()),
    'numericalEvidenceRecords': len(numeric), 'imageQuestions': sum(bool(v) for v in image_by_id.values()), 'distinctAssetPaths': len(images),
    'distinctAssetHashes': len({i['sha256'] for i in images}), 'exportFidelity': 'PASS',
}
meta = {
    'schemaVersion': '1.0.0', 'auditDate': '2026-09-26', 'mode': 'READ-ONLY; NO CLEANUP',
    'canonicalSource': 'build/faculty-build-composer/data/composer_library.js',
    'canonicalSHA256': initial_hashes['build\\faculty-build-composer\\data\\composer_library.js'],
    'headAtAudit': '7b19cf906aec43881e811beb388f8ed923e23e3f',
    'classification': CLASSES,
    'methodLimit': 'Comprehensive category/family review plus whole-bank structural/export checks. Numerical work is a documented sample; full answer-set semantic inspection is targeted. NO IDENTIFIED ISSUE is not a mathematical proof of every unflagged item.',
}
question_evidence = {}
for qid, q in questions.items():
    rec = projection[qid]
    question_evidence[qid] = {
        'stem': q['q'], 'options': q['options'], 'correctIndexZeroBased': rec['answer'], 'correctOption': q['options'][rec['answer']],
        'feedback': q.get('feedback'), 'metadata': {k: v for k, v in q.items() if k not in ('q', 'options', 'feedback', 'sourceOccurrences')},
        'currentStoredPools': rec.get('pools'), 'sourceOccurrencesCount': len(q.get('sourceOccurrences', [])),
        'findingIDs': by_question[qid], 'pdfPage': exports['question_pages'].get(qid),
    }

family_reviews = []
for concept in sorted({q.get('primaryConceptId') for q in questions.values()}):
    ids = [i for i, q in questions.items() if q.get('primaryConceptId') == concept]
    relevant = [f for f in findings if set(f['affectedQuestionIDs']) & set(ids)]
    family_reviews.append({
        'familyID': concept, 'representativeID': ids[0], 'allQuestionIDs': ids,
        'affectedQuestionIDs': [i for i in ids if by_question[i]],
        'sharedPattern': [f['issue'] for f in relevant], 'findingIDs': [f['findingID'] for f in relevant],
        'legitimateRepetition': 'Preserve unflagged ordinary/repair reuse. Repetition is not a defect by itself; selected D/F/G/H arrays identify the operation or progression that underperforms.',
        'answerDirectionPredictability': [f['evidence'] for f in relevant if f['category'] == 'H'] or 'No separate directional-monotony finding; no blanket claim that every variant reverses direction.',
        'higherTierReasoning': [f['findingID'] for f in relevant if f['category'] in ('D', 'E', 'F')],
        'bossMasteryEvidence': [f['findingID'] for f in relevant if f['category'] in ('F', 'H')],
        'recommendedImplementationAction': [f['recommendation'] for f in relevant],
    })

auto = read('automated_candidates.json')
dispositions = []
for candidate in auto['findings']:
    qid = candidate['questionId']
    dispositions.append({**candidate, 'linkedFindingIDs': by_question[qid], 'auditDisposition': 'SHARED PRIOR DECISION PRESERVED' if qid in shared else 'See confirmed findings; heuristic itself is not a defect' if by_question[qid] else 'NOT PROMOTED: no independent confirmed defect from this heuristic'})
evidence = {
    **meta, 'statistics': stats, 'protectedFiles': protection,
    'priorCalibrationReports': ['faculty_exports/audits/general_economics_final_verification.md', 'faculty_exports/audits/general_economics_exception_closure.md', 'faculty_exports/audits/microeconomics_audit.md', 'faculty_exports/audits/microeconomics_final_verification.md', 'faculty_exports/audits/microeconomics_exception_closure.md', 'audit_tools/macro_phase4/macro_phase4_report.md', 'audit_tools/macro_open_economy/macro_open_economy_human_read_progress.json'],
    'familyReviewSessions': reviews, 'familyReviews': family_reviews, 'numericalChecks': numeric,
    'imageAssets': images, 'graphReviewSessions': graph_reviews,
    'exportChecks': exports, 'pdfVisualReviewPages': [1, 2, 489, 2414, 2454, 2455],
    'pdfVisualReviewResult': 'Cover, index, text questions, graph questions and metadata/core continuation inspected. Readable, proportional images; no clipping or split core observed. Metadata on prior page is reported separately, not a split stem/options/feedback core.',
    'helperMetadataReview': {
        'calculationMetadata': {'count': 122, 'result': 'Presence/sourceType/sourceDifficulty provenance, not a live numerical input payload; no demonstrated stale helper value.'},
        'loanableFundsScenario': {'count': 60, 'result': 'Base asset/scenario captions; a question may validly ask an undrawn counterfactual from that base.'},
        'foreignExchangeScenario': {'count': 22, 'result': 'Base graph scenario labels consistent with reviewed assets.'},
        'graphImageMetadata': {'count': 112, 'result': 'Presence and source asset/type provenance; graph bytes and references checked separately.'},
        'classKConfirmedFindings': 0,
    },
    'narrowPrefaceScan': {'pattern': 'Macro actor + reviews near start of stem; analogous artificial generated prefaces only', 'candidateIDs': ['ECON-NL-FINALBOSS-4036'], 'result': 'No separate defect promoted: the recovery/industry context remains meaningful and this isolated phrasing does not establish the empty generated family pattern. No broad prose rewrite recommended.'},
    'falsePositiveCalibration': [
        'Length alone does not prove an answer cue; elementary definitions may naturally differ in length.',
        'Absolute-language and punctuation scans are candidate generators; no mechanical rewrite of every absolute or punctuation difference.',
        'Seven graph-evidence heuristics do not establish absent curves: actual Macro graphs supply AD/AS or MD/MS labels; shared trade adjudication preserved.',
        'Approved main/repair reuse retained; Fisher lender-gain versus borrower-gain and demand versus supply policy contrasts are useful direction changes.',
        'Unknown canonicalDifficulty on support pools is allowed by current validation and is not a schema failure.',
        'Historical sourcePool/sourceType/sourceDifficulty are provenance, not current assessment labels to overwrite.',
    ],
    'automatedCandidateCounts': auto['counts'], 'automatedCandidateDispositions': dispositions,
    'primaryReferences': SOURCES, 'questionEvidence': question_evidence,
}

def ids_text(ids):
    return ', '.join(f'`{i}`' for i in ids)

def table(rows, headers):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join('---' for _ in headers) + ' |'] + ['| ' + ' | '.join(str(x).replace('|', '/') for x in row) + ' |' for row in rows])

def selected_summary(classes):
    group = [f for f in findings if f['category'] in classes]
    return table([(f['findingID'], f['severity'], len(f['affectedQuestionIDs']), f['issue']) for f in group], ['Finding', 'Severity', 'Questions', 'Issue']) if group else 'No confirmed findings in this category.'

severity = stats['findingsBySeverity']
md = [
    '# Macroeconomics comprehensive question-bank audit',
    'Audit date: 2026-09-26. **READ-ONLY — NO CLEANUP PERFORMED.** Canonical Composer content is authoritative. This report is one consolidated discovery worklist; it does not authorize changes to the bank.',
    '## 1. Executive Summary',
    f"The current Macro projection contains **4,745 unique questions**. The audit records **{len(findings)} grouped findings affecting {len(affected):,} unique questions**. There are **{stats['questionsWithNoIdentifiedIssue']:,} questions with no identified issue ({stats['percentageWithNoIdentifiedIssue']}%)**, including preserved shared-bank records. Metadata-only findings count toward affected questions; this total is not a count of wrong economic answers.",
    table([('Critical', severity.get('CRITICAL', 0)), ('Major', severity.get('MAJOR', 0)), ('Moderate', severity.get('MODERATE', 0)), ('Minor', severity.get('MINOR', 0)), ('Instructor-review groups / questions', f"{stats['instructorReviewGroups']} / {stats['instructorReviewQuestions']}"), ('Shared General / shared Micro / distinct shared IDs', '1,589 / 1,267 / 1,589'), ('Existing CSV/PDF fidelity', 'PASS')], ['Measure', 'Result']),
    '**Immediate correctness priority:** MAA-0049, `P52A-CPI-LB-002`: the next basket costs 131, so inflation from 122 is approximately **7.4%**, not the keyed 8.2%; no option supplies the correct pair. MAA-0033 needs the origin of labor-force exits; MAA-0110 needs a locally stated shock; MAA-0013 overinterprets a falling unemployment rate. Three instructor-review groups separate model choices from demonstrated errors.',
    'No existing question, image, engine, test, fixture, export, or earlier audit report was edited. The protected-file comparison checked 14,818 pre-existing files and found no changes or deletions.',
    '## 2. Scope and Method',
    'Sources: `build/faculty-build-composer/data/composer_library.js`, `course-area-model.js`, `composer-core.js`, and the current Macro faculty CSV/PDF. Polished-game files were not imported as bank content; historical source-game names remain provenance within canonical Composer records.',
    f"Source SHA-256: `{meta['canonicalSHA256']}`. HEAD: `{meta['headAtAudit']}`.",
    f"All 4,745 rows received projection, identity/key, metadata, and export checks. All 3,156 Macro-exclusive records received a whole-family stem/key and task-demand sweep across {len(reviews)} review sessions. Full alternatives were inspected for selected representatives, advanced tasks and candidate defects. Numerical evidence independently recomputes {stats['independentlyRecomputedQuestions']} unique questions across the requested numerical families. All 110 distinct resolved image paths (92 unique byte hashes), used by 591 questions, were visually inspected.",
    'This is a comprehensive category/family audit, not an independent full-option proof of every question. Numerical verification is a documented sample, expanded for correctness candidates. The coverage ledger distinguishes these methods. NO IDENTIFIED ISSUE means no issue was identified by those checks; it is not an assurance that every unflagged item has been individually proved correct.',
    'General and Micro final verification/exception closure reports supplied the calibration. All 1,589 shared IDs retain **SHARED — PRIOR DECISION PRESERVED**. Current canonical versions and current companion exports were checked; no prior settled economic or difficulty decision was reopened. The 46 previously moved Macro-only records remain in Macro; specialist-versus-integrated placement is separately addressed in MAA-0114.',
    'Raw automated output contained 14 errors, 835 warnings and 745 review candidates. These are not the finding totals. Exact-path errors resolve through export fallback; punctuation, absolute wording, length and repeated feedback were adjudicated rather than automatically promoted. The evidence ledger preserves candidate-to-finding links and limits.',
    '## 3. Bank Integrity',
    table([('Global canonical IDs', 9779), ('General projection', 1589), ('Micro projection', 6301), ('Macro projection', 4745), ('Macro-exclusive', 3156), ('Distinct shared Macro IDs', 1589)], ['Scope', 'Count']),
    'Expected counts match exactly. Macro has four distinct choices per record, a resolvable canonical answer, and nonempty required content fields. Structural/key-hash checks passed. Projection overlap is intentional, not duplicate content to remove. Support-pool unknown difficulty is allowed by current validation. No schema/build failure was demonstrated.',
    '## 4. Economic Validity', selected_summary('A'),
    'The numerical sample covers GDP expenditure and value added, deflation and real growth, labor-force rates and exits, fixed-basket CPI, real income/interest, productivity and Rule of 70, budgets/debt/saving, loanable-funds coordinates, reserves/capital/deposit creation, quantity theory, fiscal multipliers, monetary transmission, AD-AS, Phillips/sacrifice ratios, nominal/real exchange rates and NX/NCO. Formulas and current visible inputs are retained in the evidence ledger. Approximate textbook formulas were evaluated under their stated conventions.',
    'Previously corrected graph rounding and macro calculations were preserved where displayed values reproduce the keys. Dated February 2026 fiscal facts were checked against the [CBO outlook](https://www.cbo.gov/publication/62105); no silent update to a later period is recommended.',
    '## 5. Answer-Choice / Structural Cue Findings', selected_summary('BE'),
    'B findings concern unique completeness/qualification or enumeration cues. E findings concern genuinely integrative tasks weakened by alternatives that deny supplied mechanisms or make irrelevant claims. Preserve their conceptual demand. A longest answer or one conditional answer alone was not enough to establish a defect; the full alternatives were examined for the promoted sets.',
    '## 6. Difficulty Alignment', selected_summary('DF'),
    'Easy is recognition; Medium is direct application; Hard requires rule selection, linked steps or graph implications; Elite requires integrated evidence/transfer; Legendary requires synthesis, counterfactuals or competing mechanisms. Long stems and extra arithmetic alone do not earn an advanced tier. D preserves economics and reclassifies routine ordinary items. F preserves checkpoint roles and asks for stronger cumulative tasks. E preserves advanced tasks and repairs alternatives. Exact affected arrays exclude reviewed stronger cases; these are not blanket concept downgrades.',
    '## 7. Repair → Bridge Progression', selected_summary('G'),
    'Repairs should correct a focused misconception. The flagged bridges either repeat that same operation with new numbers or ask for a destination topic instead of applying the skill. Each replacement should retain the routed repair skill and add one transfer step. Paired current support records and routing are available in questionEvidence; resolve MAA-0008 before implementing its related bridge rewrite. Unflagged actual applications remain intact.',
    '## 8. Redundancy / Checkpoint Families', selected_summary('H'),
    'Checkpoint repetitions are also grouped under F, and failed support repetition under G, rather than duplicated into prose-identical H findings. MAA-0130 identifies a six-item same-direction graph/multiplier family. MAA-0131 identifies a Medium-to-Legendary numerical clone. Conversely, lender-versus-borrower gain contrasts and demand-versus-supply policy cases vary the economic inference and should remain. Approved ordinary/repair stem reuse is not automatically redundant. No deletion or ID consolidation is recommended.',
    '## 9. Metadata / Routing', selected_summary('C'),
    'Role-only task types affect 412 records; role/stage-prefixed task types affect another 252. Generic commonError templates affect 508. These are metadata findings, not claims that all underlying questions are invalid. Keep instructionalRole, challengeStage and provenance separate from actual task operation. Source-pool aliases in Phillips support families can legitimately route several related skills and were not indiscriminately removed. MAA-0008 instead identifies two specific mismatches with no matching current skill pool.',
    'Helper review found no demonstrated Class K stale numerical payload. The 122 calculationMetadata objects preserve source type/difficulty; 112 graphImageMetadata objects preserve presence/source asset/type. The 60 loanableFundsScenario and 22 foreignExchangeScenario labels describe base graphs, including valid questions about undrawn counterfactuals. Do not overwrite historical provenance to imitate current wording.',
    'The narrow generated-preface scan found one recovery-review phrasing (`ECON-NL-FINALBOSS-4036`), not a recurring empty Macro preface family. No separate cosmetic finding or general prose rewrite was promoted.',
    '## 10. Feedback Quality', selected_summary('I'),
    'Promoted findings identify truncated feedback, missing calculations/causal directions, and one explanation that refers to shifting money supply when the stem fixes it. Repeated conceptual feedback is not inherently defective. Rewrite feedback after the final question action so it explains the current misconception, visible inputs, directions and units.',
    '## 11. Graph / Image Review', selected_summary('J'),
    'All 110 resolved asset paths were visually inspected in 19 contact sheets; 92 are distinct byte hashes. Assets cover AD-AS/LRAS, money markets, Phillips curves, loanable funds, forex, growth, and shared foundational/trade diagrams. Axes, labels, intersection coordinates and shift directions were coherent. No demonstrated geometry/key contradiction was found. Graph calculations used visible coordinates and rounded labels, including GROWTH-01.',
    'Fourteen integrated questions use absent literal unqualified paths and lack record-level alternative descriptions. The exporter resolves the correct registered concept assets by filename; all images appear in the current PDF. MAA-0127 is therefore a source-reference/accessibility cleanup, not an export rendering failure. Preserve image bytes and use exact registered paths in the later cleanup.',
    '## 12. Instructor-Review Cases', selected_summary('L'),
    '**INSTRUCTOR REVIEW REQUIRED — MAA-0032:** choose explicit historical/scarce-reserves textbook scope or modern ample-reserves institutional wording. The [Federal Reserve framework](https://www.federalreserve.gov/monetarypolicy/policy-normalization-qa.htm) and [New York Fed implementation description](https://www.newyorkfed.org/markets/domestic-market-operations/monetary-policy-implementation) support the distinction. Do not rewrite every valid hypothetical multiplier question.',
    '**INSTRUCTOR REVIEW REQUIRED — MAA-0093:** choose whether stated crowding-out dollars are total AD offsets already including induced spending or autonomous investment reductions. The existing keys use the former; make that convention explicit or recompute under the latter.',
    '**INSTRUCTOR REVIEW REQUIRED — MAA-0111:** add the historical pre-May-2020 M1 convention already used in analogous `LG-Q-2002`, or update M1 to include savings. See the [Federal Reserve H.6 explanation](https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm). This choice changes M1 from 2,000 to 3,500 while M2 remains 4,000.',
    '## 13. Aggregate Statistics',
    table([(c, CLASSES[c], stats['findingsByClass'][c], stats['affectedByClass'][c]) for c in CLASSES], ['Class', 'Action', 'Groups', 'Unique affected within class']),
    'Class-level affected counts overlap; do not sum them to obtain unique affected questions.',
    table(stats['coverageStatuses'].items(), ['Coverage status', 'Questions']),
    f"The no-identified-issue headline combines NO IDENTIFIED ISSUE and SHARED PRIOR DECISION PRESERVED: {stats['questionsWithNoIdentifiedIssue']:,}/{len(questions):,} = {stats['percentageWithNoIdentifiedIssue']}%. Instructor-review status takes precedence for any question needing a convention decision, even if it also has a confirmed metadata or assessment finding.",
    '## 14. Consolidated Implementation Worklist',
    'Use this as one cleanup worklist. First resolve A correctness/ambiguity and L instructor conventions. Next coordinate F/G/H task changes, then D tier changes and B/E option changes. Finish C/I/J metadata, feedback and path alignment against final wording. K has no confirmed action. Preserve IDs, shared-bank content, image bytes, and historical provenance. Do not implement conflicting independent rewrites for an ID: JSON coordinatedFindingIDs identifies overlaps. No cleanup has been performed in this audit.',
    'The exact affected IDs below are authoritative action scope; relatedQuestionIDs supply comparison context, not permission to alter an extra record. JSON questionEvidence provides exact current wording, choices, keys, feedback, metadata and pool paths for each ID. Generated-family recommendations apply only to the enumerated members.',
]
for c, title in CLASSES.items():
    md.append(f'### Class {c}. {title}')
    selected = [f for f in findings if f['category'] == c]
    if not selected:
        md.append('No confirmed action. Preserve current content/helper data.')
    for f in selected:
        md.extend([
            f"#### {f['findingID']} — {f['issue']}",
            f"**{f['severity']}** · {len(f['affectedQuestionIDs'])} question(s) · Family: `{f['familyID']}` · Representative: `{f['questionID']}` · PDF p. {f['pdfPage']}",
            '**Evidence:** ' + f['evidence'], '**Action:** ' + f['recommendation'],
            '**Exact affected IDs:** ' + ids_text(f['affectedQuestionIDs']),
            '**Instructor decision:** ' + ('REQUIRED' if f['instructorReviewRequired'] else 'No') + '. **Shared-bank implications:** ' + f['sharedBankImplications'],
        ])
        if f['relatedQuestionIDs']:
            md.append('**Comparison context only:** ' + ids_text(f['relatedQuestionIDs']))
        if f['coordinatedFindingIDs']:
            md.append('**Coordinate with:** ' + ', '.join(f['coordinatedFindingIDs']))

md.extend([
    '## 15. Export Fidelity',
    '**PASS — the existing exports faithfully reproduce the current canonical Macro projection.** Source defects remain visible in the exports; faithful reproduction does not make an incorrect source answer valid.',
    table([('CSV rows / unique IDs', '4,745 / 4,745'), ('CSV emitted columns compared', 169), ('CSV field differences', 0), ('PDF pages rendered mechanically', 3354), ('PDF IDs and ordering', 'All 4,745 match'), ('PDF internal links / outline entries', '371 / 371'), ('Missing image questions', 0), ('Split question cores', 0), ('Text bounds / replacement characters / render errors', '0 / 0 / 0'), ('Metadata starts on preceding page', len(exports['metadata_on_prior_page'])), ('PDF pages visually sampled', '1, 2, 489, 2414, 2454, 2455')], ['Check', 'Result']),
    'CSV comparison covers every emitted value, including options, correct answer, feedback, routing, metadata and image references. Existing exporter PDF content verification passed. All PDF pages were text-checked and rasterized; bounds, answer markers, stem/options/feedback core continuity, image presence, ID ordering and internal navigation were checked. Visual samples confirmed cover/index, text, graph sizing and continuation layout. The 27 preceding-page metadata cases retain complete question cores and are not promoted as defects.',
    'Deliverables: [finding ledger](macroeconomics_audit_findings.json), [coverage ledger](macroeconomics_audit_coverage.json), [evidence ledger](macroeconomics_audit_evidence.json). Temporary analysis scripts, recalculations and rendered inspection sheets are in `tmp/macroeconomics_audit/`. Only the four new audit deliverables and temporary analysis artifacts were written.',
])

OUT.mkdir(parents=True, exist_ok=True)
outputs = {
    'macroeconomics_audit_findings.json': {**meta, 'statistics': stats, 'findings': findings},
    'macroeconomics_audit_coverage.json': {**meta, 'statistics': stats, 'coverage': coverage},
    'macroeconomics_audit_evidence.json': evidence,
}
for name, value in outputs.items():
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
(OUT / 'macroeconomics_audit.md').write_text('\n\n'.join(md) + '\n', encoding='utf8')

required = ['findingID', 'questionID', 'affectedQuestionIDs', 'familyID', 'topic', 'currentDifficulty', 'currentType', 'category', 'severity', 'issue', 'evidence', 'recommendation', 'suggestedActionClass', 'instructorReviewRequired', 'relatedQuestionIDs', 'sharedWithGeneral', 'sharedWithMicro', 'sourcePool', 'pdfPage']
assert all(set(required) <= f.keys() for f in findings)
assert all(not f['sharedWithGeneral'] and not f['sharedWithMicro'] for f in findings)
assert len(coverage) == len({c['questionID'] for c in coverage}) == 4745
assert sum(stats['coverageStatuses'].values()) == 4745
assert sum(stats['findingsByClass'].values()) == len(findings)
assert stats['independentlyRecomputedQuestions'] == len({i for n in numeric for i in n['questionIDs']}) == 156
assert stats['imageQuestions'] == sum(bool(q.get('image')) for q in questions.values()) == 591
assert all(f['severity'] in ('CRITICAL', 'MAJOR', 'MODERATE', 'MINOR') for f in findings)
assert not ({i for f in findings if f['category'] == 'D' for i in f['affectedQuestionIDs']} & {i for f in findings if f['category'] == 'F' for i in f['affectedQuestionIDs']})
for name in outputs:
    json.loads((OUT / name).read_text(encoding='utf8'))
validation = {'status': 'PASS', 'statistics': stats, 'protection': protection, 'files': {name: (OUT / name).stat().st_size for name in [*outputs, 'macroeconomics_audit.md']}}
(WORK / 'delivery_validation.json').write_text(json.dumps(validation, indent=2), encoding='utf8')
print(json.dumps(validation, indent=2))
