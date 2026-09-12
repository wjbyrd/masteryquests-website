import sys,json,subprocess
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from pypdf import PdfReader
from tag_pilot import normalized
root_guard();run='validation_artifacts/pdf_accessibility/micro49_nash_fix_v1'
baseline=read_json(run+'/baseline.json');summary=read_json(run+'/collection_summary.json')
row=next(r for r in read_json(run+'/final_validation.json') if r['code']=='MICRO-49')
src='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
sem='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
current=read_json(src);old=json.loads(subprocess.check_output(['git','show','HEAD:'+src],text=True,encoding='utf-8'))
assert [{k:v for k,v in r.items()} for r in current['reviews'] if r['code']!='MICRO-49']==[r for r in old['reviews'] if r['code']!='MICRO-49']
oldmeta=json.loads(subprocess.check_output(['git','show','HEAD:'+sem],text=True,encoding='utf-8'));newmeta=read_json(sem)
assert {k:v for k,v in oldmeta['pilot'].items() if k!='MICRO-49'}=={k:v for k,v in newmeta['pilot'].items() if k!='MICRO-49'}
record=next(r for r in current['reviews'] if r['code']=='MICRO-49')
negative=read_json(run+'/negative_tests.json');pipeline=read_json(run+'/pipeline_tests.json');regression=read_json(run+'/regression/results.json')
assert all(t['detected'] for t in negative['tests']) and pipeline['passed'] and regression['passed']==regression['total']
changed=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()
allowed=['audit_tools/pdf_accessibility/',src,sem,'validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1/']
assert all(any(p.startswith(a) for a in allowed) for p in changed),changed
for item in baseline['candidates']:
    assert sha(item['path'])==item['sha256']
    assert contained(item['path']).stat().st_mtime_ns==item['mtimeNs']
text=normalized(PdfReader(contained(row['output'])).pages[0].extract_text())
assert record['content']['worked'] in text and 'FINDING PURE-STRATEGY NASH EQUILIBRIA' in text
safety={'root':str(root_guard()),'forbiddenWorkspaceUsed':False,'candidateReopened':True,'bothPureStrategyEquilibria':True,'mixedStrategyDerivationAdded':False,'matrixAndSemanticTableUnchanged':True,'other150CandidateBytesAndMtimesUnchanged':True,'otherInstructionalAndSemanticRecordsUnchanged':True,'protectedTrackedSystemsUnchanged':True,'activePdfsReplaced':False,'activeManifestsChanged':False,'installationPerformed':False,'deploymentPerformed':False,'commitOrPushPerformed':False,'stagedAccepted':151,'humanAT':'PENDING'}
write_json(run+'/final_safety_check.json',safety)
write_json(run+'/focused_content_tests.json',{'testFile':'audit_tools/pdf_accessibility/test_micro49_content.py','tests':9,'passed':9,'result':'PASS'})
report=f'''# MICRO-49 Nash equilibrium content correction

## Task Identity
MICRO49_PURE_STRATEGY_NASH_FIX_V1

## Repository
- Verified working directory and Git root: `{root_guard()}`.
- Baseline commit: `{baseline['head']}`.
- Branch: `main`.
- Preflight: clean Git status; write probe succeeded; task identity verified. No reset, staging, commit or push. The forbidden workspace was never accessed.

## Problem
The previous worked example identified only (A, X), although the displayed payoff matrix contains two pure-strategy Nash equilibria: (A, X) and (B, Y).

## Economics Verification
Payoff order is (Row firm, Column firm).

| Candidate | Row player's comparison | Column player's comparison | Result |
|---|---|---|---|
| (A, X) | Given X: A = 9 > B = 3 | Given A: X = 9 > Y = 3 | Mutual best responses; Nash equilibrium |
| (B, Y) | Given Y: B = 7 > A = 2 | Given B: Y = 7 > X = 2 | Mutual best responses; Nash equilibrium |

All four comparisons appear in the corrected explanation. No mixed-strategy derivation or dominant-strategy equilibrium claim was added.

## Authorized Content Change
Old heading: **WORKED EXAMPLE: FINDING A NASH EQUILIBRIUM**.

New heading: **WORKED EXAMPLE: FINDING PURE-STRATEGY NASH EQUILIBRIA**.

Old explanation: identified row A and column X as mutual best responses using 9 versus 3, then stopped after identifying (A, X).

Final corrected explanation:

> {record['content']['worked']}

The wording was tightened for the existing right-hand explanation area while preserving all four comparisons and both conclusions.

## Canonical Source
Changed only MICRO-49's `content.worked` and `content.workedLabel` in `{src}` before generating any PDF.

The sole semantics file remains `{sem}`. Its MICRO-49 `wordingCorrection` binds the source hash, exact old/new explanation and heading, original asset hash and reviewed layout. The retained visual input at `build/faculty-build-composer/data/concept-reviews/authoring/visual-sources/MICRO-49.pdf` remains unchanged. Maintained `audit_tools/pdf_accessibility/micro49_wording.py` transforms only the two text objects inside the existing source-aware tagging lifecycle. It reuses the embedded fonts, enforces width/line limits and rejects drift. This is regenerated from maintained inputs, not a manual staged-PDF patch.

## Semantic Table
Unchanged caption: **Payoff order: (Row firm, Column firm)**. Column headers X/Y; row headers A/B. Cells remain A/X (9, 9), A/Y (2, 3), B/X (3, 2), B/Y (7, 7).

The final Table → TR → TH/TD subtree was compared with the previously accepted candidate: roles, header scopes, IDs, TD Headers associations and replacement text are unchanged. Bitmap fingerprint, image geometry and nonoverlapping table-region mapping are unchanged. Table header, scope, cell-value and association negative tests all detected their injected faults.

## Accessibility Update
The source-aware H2 now carries the complete plural pure-strategy heading. Logical sequence remains worked heading → payoff table → complete worked explanation → self-check. There are no unassigned meaningful blocks, hidden duplicate old explanation or stale old conclusion in candidate text. The general resource title remains appropriate and unchanged; only the worked heading needed correction.

Explicit veraPDF 1.28.2 `--flavour ua1`, ISO 14289-1:2014: **PASS**. Independent source, reading-order, font, structure and semantic checks: **PASS**, no project errors.

## Visual Review
One US Letter page, 612 × 792 points; original page geometry, matrix placement and surrounding sections preserved. Before/after PNGs were opened and visually inspected. Heading wraps onto two lines at its original approximately 16-point size. Body remains 10.45 points; leading changes modestly from 12.54 to 11.7 points, and the paragraph uses available vertical space. No clipping, overflow or overlap was observed; the explanation remains comfortably readable to the right of the matrix.

Byte-bound evidence: `{run}/visual_review.json`. Before/after renders are beside the raw validator report under its `rendered_before` and `rendered_after` directories.

## Candidate Result
- SHA-256: `{row['sha256']}`.
- Final staged candidate: `{row['output']}`.
- veraPDF explicit PDF/UA-1: **PASS**.
- Semantic/project and font checks: **PASS**.
- Preservation: **PASS — AUTHORIZED TEXT CHANGE** for exactly the heading and explanation; **UNEXPECTED CONTENT CHANGE: none**. Exact normalized replacement matching rejects extra content changes.
- Determinism: **PASS**, independent MICRO-49 rebuild produced identical SHA-256.
- Raw validator evidence: `{row['validatorReport']}`.

## Reused Candidates
The other **150 candidates were not rebuilt**. Candidate bytes and modification times, source hashes, per-resource semantic hashes, raw validator-report hashes and determinism hashes remain valid. Their accepted preservation/visual receipts and raw reports are retained. The aggregate gate rechecked current evidence without regenerating resources or rerunning their external validators. Existing historical MICRO-49 candidates also remain untouched.

## Full Staged Gate
**151 / 151 ACCEPTED**, zero blocked.

| Required gate | Result |
|---|---|
| PDF/UA machine | 151 / 151 |
| Semantic/project | 151 / 151 |
| Preservation | 151 / 151 |
| Determinism | 151 / 151 |
| Contrast/visual | 151 / 151 |

Current aggregate evidence: `{run}/staged_gate.json` and `collection_summary.json`. No gate was weakened.

## Owner Test Pack
Replaced only the current owner pack's MICRO-49 candidate at `validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1/pdfs/MICRO-49.pdf`. Updated its manifest hash, result-template hash and worked-example reading instructions. It remains the representative payoff-table navigation resource. Other pack PDFs are unchanged.

## Installation Preview
Updated PREVIEW ONLY: `{run}/installation_preview.json`. Reused the other 150 planned records and refreshed MICRO-49's candidate/hash/evidence. It contains **151 validated logical resources**, **302 planned public/Composer copies**, including creation of **15 missing public MICRO-54 through MICRO-68 PDFs**. Installation was **NOT executed**.

## Regression
- Focused MICRO-49 content regression: **9 / 9 PASS**, including old/one-equilibrium text, omitted (B, Y), false exclusivity, changed semantic/source payoffs, wrong comparison, punctuation/wrapping tolerance and unauthorized extra-text rejection.
- Accessibility negative tests: **{len(negative['tests'])} / {len(negative['tests'])} detected**, including semantic table negatives; raw negative veraPDF results retained.
- Accessibility pipeline tests: **{len(pipeline['checks'])} / {len(pipeline['checks'])} PASS**. Installation transactions were exercised only in isolated scratch fixtures, with zero active copies installed.
- Current Composer suite: **{regression['passed']} / {regression['total']} PASS**.
- Concept Review integration, generated package/resource checks, Mastery Report routing, report-state checks: **PASS** within that current suite. Concept Review integration exercised six generated-package cases and checked the 151-resource active manifest.
- Complete staged aggregate gate: **151 / 151 ACCEPTED**.

No unrelated instructional record or semantic record changed. Protected tracked systems remain unchanged. Evidence resides under `{run}`.

## Active Production State
**Active production PDFs were not replaced. Active manifests were not changed.** Graph assets, other Concept Review content, games/hubs, question banks, LO mappings, telemetry/governance, Workers/D1 and paper/manuscript files remain unchanged. No installation, deployment, commit or push occurred.

## Human AT Verification
**PENDING**. No human screen-reader verification is claimed.

## Final Status
MICRO-49 CORRECTED — FULL STAGED COLLECTION REMAINS 151/151 ACCEPTED
'''
contained('FINAL_REPORT_micro49_nash_fix.md').write_text(report,encoding='utf-8')
print('Final report written; protected systems and final candidate verified')
