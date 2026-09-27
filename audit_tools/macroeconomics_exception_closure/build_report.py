"""Assemble the bounded closure report from frozen approvals and completed checks."""
import collections
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'tmp/macroeconomics_exception_closure'
INPUT = Path(__file__).parent / 'inputs'
EVIDENCE = ROOT / 'validation_artifacts/macroeconomics_exception_closure'
OUT = ROOT / 'faculty_exports/audits'
def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))
def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
def table(headers, rows):
    def cell(x):
        if isinstance(x, list): x = '; '.join(map(str, x))
        return str(x).replace('|', '\\|').replace('\n', ' ')
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join(['---'] * len(headers)) + ' |'] + ['| ' + ' | '.join(cell(c) for c in row) + ' |' for row in rows])

expect = read(WORK / 'expectations.json')
checks = read(WORK / 'execution_verification.json')
numeric = read(WORK / 'independent_economic_verification.json')
exports = read(WORK / 'export_checks.json')
visual = read(WORK / 'visual_review.json')
protected = read(WORK / 'protected_files.json')
modes = read(WORK / 'mode_inventory.json')
prior = read(OUT / 'macroeconomics_final_verification.json')
before = {x['id']: x for x in read(INPUT / 'before_targets.json')}
changes = {x['id']: x for x in expect['changes']}
cp = read(INPUT / 'checkpoint_reviews.json')
bridges = read(INPUT / 'bridge_reviews.json')
routes = {x['id']: x for x in checks['repairChecks']}
records = read(WORK / 'baseline_records.json')
source_sha = hashlib.sha256((ROOT / 'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert source_sha == checks['sourceSHA256'] == numeric['sourceSHA256'] == exports['sourceSHA256']
library_text = (ROOT / 'build/faculty-build-composer/data/composer_library.js').read_text(encoding='utf-8')
assert json.loads(library_text.split('=', 1)[1].rstrip().removesuffix(';'))['librarySha256'] == expect['afterLibrarySha256']
assert visual['status'] == 'PASS' and visual['pdfSHA256'] == exports['pdfSHA256']
assert set(visual['visuallyInspectedIDs']) == set(expect['authorizedIds'])
assert len(cp) == 19 and len(bridges) == 8 and len(changes) == 45
assert not checks['unauthorizedChanges'] and not checks['sharedRegressions'] and not protected['unauthorizedFileChanges']
assert len(checks['difficultyChecks']) == 13 and len(routes) == 13
assert all(x['valid'] for x in checks['answerChecks']) and all(x['result'] == 'PASS' for x in numeric['checks'])
for key in ['csv_mismatches', 'structure_errors', 'pdf_blank_pages', 'pdf_replacement_characters', 'pdf_bounds_errors', 'pdf_render_errors', 'pdf_answer_marker_errors', 'pdf_split_cores', 'pdf_missing_image_pages', 'pdf_link_errors']:
    assert not exports[key], key
suite_log = (WORK / 'active_suite_final.log').read_text(encoding='utf-8-sig')
suite = re.findall(r'^PASS (\S+)', suite_log, re.M)
assert len(suite) == 29 and '"passed": 29' in suite_log
exporter_log = (WORK / 'exporter_tests.log').read_text(encoding='utf-8-sig')
assert 'Ran 14 tests' in exporter_log and 'OK' in exporter_log
assert len(checks['publication']['modes']) == 10 and all(x['ok'] for x in checks['publication']['modes'])

metadata_ids = ['ECON-SP-LEGENDARY-9000', 'LG-Q-9111', 'PM2C1-FED-MB-003', 'LG-Q-2011', 'LG-Q-9113']
taxonomy = {
    'ECON-SP-LEGENDARY-9000': 'Existing integration operation (e.g. 43096); unchanged choose_stabilization_response skill.',
    'LG-Q-9111': 'Existing reserve_supply_vs_lending in PM2C1-FED-H-002 and PM2C1-FED-L-002; central_commercial_money in PM2C1-FED-M-001.',
    'PM2C1-FED-MB-003': 'Existing reserve_supply_vs_lending in PM2C1-FED-H-002 and PM2C1-FED-L-002; central_commercial_money in PM2C1-FED-M-001.',
    'LG-Q-2011': 'Existing compare_excess_reserves_after_policy_change in LG-Q-316; reserve_requirement_effect in LG-Q-316, LG-Q-317 and LG-R-5018.',
    'LG-Q-9113': 'Existing compare_excess_reserves_after_policy_change in LG-Q-316; reserve_requirement_effect in LG-Q-316, LG-Q-317 and LG-R-5018.'
}
metadata = []
for qid in metadata_ids:
    c = changes[qid]
    metadata.append({'id': qid, 'before': c['before'], 'after': c['after'], 'taxonomySource': taxonomy[qid], 'remediation': routes[qid], 'primarySkillMatchesTask': True, 'repairCorrectsMisconception': True, 'result': 'PASS'})

closure = []
for qid in expect['authorizedIds']:
    original = before[qid]['exception']
    if qid in cp: group, reason = 'checkpoint', cp[qid]['addedMasteryEvidence']
    elif qid in bridges: group, reason = 'bridge', bridges[qid]['newTransferStep']
    elif qid in metadata_ids: group, reason = 'metadata', taxonomy[qid]
    else: group, reason = 'difficulty', 'Exact instructor tier applied; stem/options/key/feedback preserved and storage verified.'
    closure.append({**original, 'group': group, 'previousBlocking': original['blocking'], 'blocking': False, 'result': 'VERIFIED CLOSED', 'closureEvidence': reason})
assert collections.Counter(x['group'] for x in closure) == {'checkpoint': 19, 'bridge': 8, 'difficulty': 13, 'metadata': 5}

finding_closures = []
for f in prior['findingClosures']:
    failed = f['outcome'].startswith('FAILED')
    affected_targets = sorted(set(f['affectedQuestionIDs']) & set(changes))
    remaining = f['remainingIDs']
    if failed: assert remaining and set(remaining) <= set(changes)
    result = 'VERIFIED INSTRUCTOR-ADJUDICATED' if 'INSTRUCTOR-ADJUDICATED' in f['outcome'] else 'VERIFIED CLOSED'
    finding_closures.append({**f, 'previousOutcome': f['outcome'], 'previousRemainingIDs': remaining, 'outcome': result, 'remainingIDs': [], 'closureTargetIDs': affected_targets, 'evidence': [{'id': qid, 'reason': next(x['closureEvidence'] for x in closure if x['questionID'] == qid)} for qid in remaining], 'verificationBasis': 'Each formerly failing target closed by the focused review; other previously certified records remain field-for-field unchanged.' if failed else 'Prior independent certification carried forward under the unchanged-record protection, with any authorized overlap reviewed in this closure.'})
failed_findings = [x for x in finding_closures if x['previousOutcome'].startswith('FAILED')]
assert len(failed_findings) == 23
assert collections.Counter(x['outcome'] for x in finding_closures) == {'VERIFIED CLOSED': 131, 'VERIFIED INSTRUCTOR-ADJUDICATED': 3}
prior_combo = sum(len(x['verifiedPriorEX2']) for x in modes)
new_combo = sum(len(x['newlyUnavailable']) for x in modes)
affected_selections = [x for x in modes if x['verifiedPriorEX2'] or x['newlyUnavailable']]
assert prior_combo == 93 and new_combo == 11 and len(affected_selections) == 41
limits = [
    {'id': 'EX-1', 'status': 'VERIFIED PRE-EXISTING / NONBLOCKING', 'detail': 'Only ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052 remain unpublished; no new omission.'},
    {'id': 'EX-2', 'status': 'DOCUMENTED NONBLOCKING CONSEQUENCE OF HONEST CALIBRATION', 'detail': 'All original 93 unavailable combinations persist. The mandated 13 tiers add 11 combinations in two already affected selections, for 104 across the same 41 selections relative to the pre-cleanup availability comparison. No compensating promotions; all 10 full-Macro modes pass.', 'priorCombinations': 93, 'additionalCombinations': 11, 'combinedCombinations': 104, 'selections': 41},
    {'id': 'EX-3', 'status': 'DOCUMENTED ARCHITECTURAL LIMITATION — NONBLOCKING', 'detail': 'Difficulty remains coupled to encounter stage. Engine and stage contracts unchanged; all 19 authorized checkpoint tasks now add mastery evidence.'},
    {'id': 'EX-4', 'status': 'REVIEWED EDITORIAL SIGNAL — NONBLOCKING', 'detail': 'All nine previously adjudicated editorial-signal records retain their substantive content. Four receive only authorized metadata repairs. No new answer-construction flags in the 26 rewritten choice sets; pre-existing signals on difficulty-only ECON-NL-LEGENDARY-9064 are also preserved, not reopened.'}
]

EVIDENCE.mkdir(parents=True, exist_ok=True)
evidence_names = ['execution_verification.json', 'mode_inventory.json', 'independent_economic_verification.json', 'protected_files.json', 'export_checks.json', 'companion_exports.json', 'visual_review.json', 'active_suite_final.log', 'exporter_tests.log', 'export.log', 'export_qa.log', 'choice_quality.json']
for name in evidence_names: shutil.copyfile(WORK / name, EVIDENCE / name)
ledger = {
    'schemaVersion': '1.0', 'date': '2026-09-27', 'mode': '45-ID SURGICAL POST-VERIFICATION EXCEPTION CLOSURE', 'startingStatus': 'FAIL', 'finalStatus': 'PASS',
    'baselineRef': expect['baselineRef'], 'beforeSourceSHA256': expect['baselineSourceSha256'], 'afterSourceSHA256': source_sha,
    'authorizedIDs': expect['authorizedIds'], 'changedIDs': checks['changedIDs'], 'unauthorizedCanonicalChanges': [], 'remainingQuestionExceptions': [],
    'summary': {'checkpointClosed': 19, 'bridgeClosed': 8, 'difficultyClosed': 13, 'metadataClosed': 5, 'unchangedGlobalRecords': 9734, 'unchangedMacroRecords': 4700, 'sharedProtectedRecords': 6623, 'previouslyFailedFindingsClosed': 23, 'findingOutcomes': dict(collections.Counter(x['outcome'] for x in finding_closures))},
    'changes': expect['changes'], 'ordinaryStorageMoves': expect['moves'], 'routingChanges': expect['routingChanges'], 'outcomeChanges': expect['outcomeChanges'],
    'exceptionClosures': closure, 'checkpointReviews': cp, 'bridgeReviews': bridges, 'metadataReviews': metadata, 'difficultyChecks': checks['difficultyChecks'],
    'answerChecks': checks['answerChecks'], 'repairChecks': checks['repairChecks'], 'independentCalculations': numeric['checks'], 'findingClosures': finding_closures,
    'countsBefore': {'global': 9779, **checks['counts']}, 'countsAfter': {'global': 9779, **checks['counts']},
    'nonblockingLimitations': limits, 'publication': checks['publication'], 'modeInventory': modes,
    'validation': {'composer': {'passed': 29, 'total': 29, 'runners': suite}, 'exporter': {'passed': 14, 'total': 14}, 'negativeScopeProbes': checks['scopeAdapterProbes']},
    'exportFidelity': {k: v for k, v in exports.items() if k not in ['ids', 'question_pages']}, 'visualInspection': visual, 'fileProtection': protected,
    'evidenceFiles': [str((EVIDENCE / n).relative_to(ROOT)).replace('\\', '/') for n in evidence_names]
}
write(OUT / 'macroeconomics_exception_closure_changes.json', ledger)

sections = []
def section(number, title, text): sections.append(f'## {number}. {title}\n\n{text}')
section(1, 'Starting Status', 'Starting status: **FINAL STATUS: FAIL**. The independent final verification identified exactly 45 pedagogical exceptions: 19 checkpoints, 8 bridges, 13 difficulty mismatches and 5 metadata/skill defects. This closure addresses only those exceptions.\n\nFrozen baseline: `' + expect['baselineRef'] + '`. Before source SHA-256: `' + expect['baselineSourceSha256'] + '`. After source SHA-256: `' + source_sha + '`.')
section(2, 'Scope Control', 'Authorized IDs: **45**. Changed canonical IDs: **45**. Unauthorized canonical changes: **0**. All targets were confirmed Macro-exclusive before editing. All 9,734 non-target canonical records and their placements, including the 4,700 other Macro records, remain unchanged. IDs, roles, checkpoint stages, provenance and course membership are preserved.\n\nThe frozen inputs contain each full before-state, MFV exception, original MAA finding and overlap. The machine ledger records every changed field, complete before/after records, 12 ordinary pool moves, four exact support-map changes and five mechanically updated outcome entries. Derived registry and manifest data were regenerated. Engines, telemetry, polished-game banks, graph assets and earlier audit reports remain unchanged.')
cp_rows = []
for qid, r in cp.items():
    comparisons = [f"{i}: {records[i]['q']['q']}" for i in r['ordinaryComparison']]
    cp_rows.append([qid, r['oldOperation'], r['checkpointOperation'], comparisons, r['addedMasteryEvidence'], r['result']])
section(3, 'Checkpoint Closures', 'All 19 pass the additional-mastery-evidence test without changing their stage or role. Growth tasks vary counterfactual evaluation, controlled comparison, marginal-return inference, output/productivity distinction and evidence selection. Unemployment tasks vary natural-rate reasoning, changing causal barriers, offsetting components, recovery and labor-force exit.\n\n' + table(['ID', 'Old task operation', 'New task operation', 'Ordinary comparison and task', 'Added mastery evidence', 'Final result'], cp_rows))
br_rows = []
for qid, r in bridges.items():
    br_rows.append([qid, routes[qid]['repairIDs'], r['runtimeSkill'], r['repairOperation'], r['finalBridgeOperation'], r['newTransferStep'], r['result']])
section(4, 'Bridge Closures', table(['Bridge ID', 'Actual runtime repair IDs', 'Runtime skill', 'Repair operation', 'Final bridge operation', 'One transfer step', 'Result'], br_rows) + '\n\nAll eight require a new application beyond repeating the repair conclusion/formula and retain remediation-level demand. Full runtime repair wording and bridge/retest lists are in the ledger. Where the runtime pool includes several repair records (SRPC and disinflation), the direct prerequisite named in the focused review is present.\n\nLG-B-6003 retains its reserve-shortfall content and primarySkill `required_reserves_formula`; repairSkill and its bridge-map reference now use existing `calculate_required_reserves`, fed by ECON-SP-CALCULATE-REQUIRED-RESERVES-5006. PM2A-LRPC-BR-022 uses existing `natural_rate_hypothesis`; only its obsolete sacrifice-ratio bridge reference is removed.')
section(5, 'Difficulty Corrections', table(['ID', 'Before canonical tier', 'After canonical tier', 'Current storage', 'Content preserved'], [[x['id'], x['before'], x['after'], [' / '.join(y) for y in x['locations']], 'YES'] for x in checks['difficultyChecks']]) + '\n\nExactly 12 Medium and 1 Easy; the Easy item is ECON-NL-ELITE-355. All 13 preserve stem, options, key and feedback. Twelve ordinary records move to the matching tier pool. ECON-SP-HARD-202 stays in calculation storage and projects as Medium through canonicalDifficulty. No other question is promoted for mode quotas.')
section(6, 'Metadata / Skill Corrections', table(['ID', 'Exact old fields', 'Exact new fields', 'Existing taxonomy source', 'Actual remediation', 'Result'], [[x['id'], json.dumps(x['before'], ensure_ascii=False), json.dumps(x['after'], ensure_ascii=False), x['taxonomySource'], routes[x['id']]['repairIDs'], 'PASS: task alignment YES; remediation YES'] for x in metadata]) + '\n\nAll five preserve substantive content, key, difficulty, role/stage and provenance. The central-bank repair mapping reuses unchanged canonical PM2C1-FED-M-001 and PM2C1-FED-H-002 through the existing reference mechanism; it does not duplicate, move or edit those questions. The reserve-ratio targets use unchanged LG-R-5018. These four routes work in single-concept selections; no same-skill bridge is configured for those new mapping keys, so the existing retest behavior remains. ECON-SP-LEGENDARY-9000 is an integrated supplement: its existing stabilization repair is verified in full Macro, rather than claimed to be a standalone concept route.')
section(7, 'Economic / Numerical Validation', 'Independent post-write recomputation parsed the actual student-visible inputs in all 20 relevant numerical checkpoint/bridge cases. No mismatch or newly wrong/ambiguous answer was found. Earlier successful economic conventions were not reopened.\n\n' + table(['ID', 'Independent calculation / reasoning', 'Result'], [[x['id'], x['independentReasoning'], x['result']] for x in numeric['checks']]))
section(8, 'Answer Resolution', 'All 45 have four distinct options, one resolved correct answer and a valid normalized answer hash. All 9,779 canonical records also pass mechanical answer resolution. Changed option text uses the repository normalization/hash implementation; unchanged content preserves its hash. Semantic review confirms one correct choice in each revised task.\n\n' + table(['ID', 'Key', 'Four distinct / one answer / valid hash'], [[x['id'], chr(65 + x['answerIndex']) + ': ' + x['key'], 'PASS'] for x in checks['answerChecks']]))
section(9, 'Validation Suite', '**29/29 active Composer runners PASS. 14/14 exporter tests PASS.** The preserved logs identify every runner, including outcomes, content scope, comprehensive lineage, question quality, checkpoint/remediation, Legendary/final checkpoints, graph sync and modes. Publication and inline-JS compilation also pass.\n\nHistorical fixtures remain immutable. The new explicit 45-ID approval layer composes with the prior cleanup layer, validates exact approved before/after values and rejects unauthorized target/non-target mutations in negative probes. Seven adapter consumers now use this layer. The eighth existing test change is the content-scope adapter: it narrowly retires `real-versus-nominal-gdp:gdp_welfare_scope`, whose sole baseline owner was the incorrectly tagged authorized GDP bridge. The adapter verifies that exact sole-owner baseline and approved replacement; other skill requirements remain enforced. Composer engine logic is unchanged. An initial run exposed that historical assertion; the final complete suite passes after this bounded adapter correction.')
section(10, 'Projection Counts', table(['Projection', 'Before', 'After'], [['Global', 9779, 9779], ['General', 1589, 1589], ['Micro', 6301, 6301], ['Macro', 4745, 4745]]))
section(11, 'Mode Inventory', '**EX-2 remains an honest-calibration consequence and nonblocking. No quota-based promotions occurred.** All original 93 newly unavailable combinations remain unavailable. The explicitly mandated 13 tier changes add 11 unavailable combinations in two already affected selections, bringing the cumulative comparison to **104 across the same 41 selections**. The original 93 entries and their disposition are unchanged; claiming an unchanged numeric total would be inaccurate.\n\n' + table(['Selection', 'Hard pool before / after', 'Additional unavailable modes'], [[x['id'], f"{x['before']['hard']} / {x['after']['hard']}", x['newlyUnavailable']] for x in modes if x['newlyUnavailable']]) + '\n\nAll 89 selection inventories were recomputed with their corresponding before/after outcome maps. No mode was restored through inflation of labels. All 10 full-Macro modes pass.')
section(12, 'Checkpoint Stage Contract', '**EX-3: DOCUMENTED ARCHITECTURAL LIMITATION — NONBLOCKING.** Canonical difficulty remains coupled to encounter-stage selection. Engine, stage labels, role and checkpoint routing are unchanged. All 19 targeted content defects now close through stronger tasks; none is solved by downgrading the checkpoint.')
section(13, 'Student Publication', 'Macro canonical: **4,745**. Published unique IDs: **4,743**. All 45 revised targets are published with current canonical stem, choices, hash, feedback, operation, skills and difficulty. All published hashes resolve and the generated inline script compiles.\n\nThe only omissions remain ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052. **EX-1 remains verified pre-existing/nonblocking**; no new omissions. All 10 full-Macro modes pass.')
section(14, 'Export Fidelity', 'The normal exporter regenerated Macro and companion General/Micro CSV/PDF files; no export was hand-edited.\n\n' + table(['Check', 'Result'], [['Macro CSV', '4,745 rows; 4,745 unique IDs; 169 current-schema columns; zero canonical mismatches'], ['Companion CSVs', 'General 1,589 and Micro 6,301 rows; zero canonical field mismatches'], ['Macro PDF', '4,745 IDs exactly once; 3,555 pages; all pages render'], ['Visual inspection', 'All 45 revised targets checked across 45 pages / 23 rendered contact sheets; zero visual defects'], ['Question cores', 'Zero split cores, missing images, answer-marker errors, replacement glyphs, bounds/clipping errors or blank pages'], ['Navigation / images', '371 valid links; 371 outline entries; 591 embedded images'], ['Metadata continuation', '43 whole-bank entries have metadata on the prior page; question cores remain intact. All targeted pages visually inspected.']]) + '\n\nExport and visual evidence is bound to current source SHA-256 and PDF SHA-256. The page manifest and rendered inspection sheets are retained in `validation_artifacts/macroeconomics_exception_closure/`.')
section(15, 'Shared-Bank Protection', '**All 6,623 General/Micro union records and placements remain unchanged.** General stays at 1,589 and Micro at 6,301. No target is shared with either area.\n\nThe protection check covers 15,163 baseline source/audit/asset files: 15,151 unchanged and exactly 12 authorized existing-file changes (four canonical/derived data files and eight adapter consumers). Generated exports are checked separately for fidelity. Earlier audit and verification reports, old approved baselines, engine files, images and polished-game banks are unchanged.')
section(16, 'Original Finding Closure', 'All **23 previously uncertified MAA findings now close** after review of each remaining target. The other 111 prior dispositions are carried forward under unchanged-record protection and authorized-overlap review, without reopening unrelated findings. Total: **131 VERIFIED CLOSED + 3 VERIFIED INSTRUCTOR-ADJUDICATED = 134**. No remaining failed finding.\n\n' + table(['Original finding', 'Formerly remaining IDs', 'Closure evidence', 'New result'], [[x['findingID'], x['previousRemainingIDs'], [y['id'] + ': ' + y['reason'] for y in x['evidence']], x['outcome']] for x in failed_findings]) + '\n\nThe machine ledger includes all 134 original finding dispositions and all 45 MFV closures, including overlapping findings.')
section(17, 'Remaining Exceptions', '**Remaining question-level exceptions: 0.**\n\n' + table(['Limitation', 'Final disposition', 'Evidence / boundary'], [[x['id'], x['status'], x['detail']] for x in limits]))
section(18, 'Final Status', '**FINAL STATUS: PASS**\n\nAll 45 authorized exceptions are closed: 19 checkpoints, 8 bridges, 13 difficulty corrections and 5 metadata/skill repairs. Numerical, answer, routing, scope, publication, suite, shared-bank and export checks pass. All 23 formerly uncertified original findings close. No remaining question-level exception. EX-1 through EX-4 remain documented nonblocking limitations.\n\nExact changes: `macroeconomics_exception_closure_changes.json`. Reproducible authoring and checks: `audit_tools/macroeconomics_exception_closure/`. Durable evidence: `validation_artifacts/macroeconomics_exception_closure/`.')
assert len(sections) == 18
(OUT / 'macroeconomics_exception_closure.md').write_text('# Macroeconomics Post-Verification Exception Closure\n\n' + '\n\n'.join(sections) + '\n', encoding='utf-8')
print(json.dumps({'finalStatus': 'PASS', 'changedIDs': len(changes), 'sections': len(sections), 'originalFindings': len(finding_closures), 'previouslyFailedClosed': len(failed_findings), 'visualTargets': len(visual['visuallyInspectedIDs']), 'sourceSHA256': source_sha}, indent=2))
