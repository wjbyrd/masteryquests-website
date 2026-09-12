import sys,json,subprocess
sys.path.insert(0,'audit_tools/pdf_accessibility')
from repo_guard import *
from pypdf import PdfReader
from tag_pilot import normalized
from micro49_matrix import validate
root_guard();run='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'
baseline=read_json(run+'/baseline.json');summary=read_json(run+'/collection_summary.json')
row=next(r for r in read_json(run+'/final_validation.json') if r['code']=='MICRO-49')
src='build/faculty-build-composer/data/concept-reviews/concept_review_source.json';sem='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
source=read_json(src);metadata=read_json(sem);meta=metadata['pilot']['MICRO-49']
old=json.loads(subprocess.check_output(['git','show','HEAD:'+src],text=True,encoding='utf-8'))
assert [r for r in source['reviews'] if r['code']!='MICRO-49']==[r for r in old['reviews'] if r['code']!='MICRO-49']
oldmeta=json.loads(subprocess.check_output(['git','show','HEAD:'+sem],text=True,encoding='utf-8'))
assert {k:v for k,v in oldmeta['pilot'].items() if k!='MICRO-49'}=={k:v for k,v in metadata['pilot'].items() if k!='MICRO-49'}
record=next(r for r in source['reviews'] if r['code']=='MICRO-49')
assert all('(7, 7)' not in record['content']['assetMetadata'][k] for k in ('imageAlt','graphDescription'))
for item in baseline['candidates']:
    assert sha(item['path'])==item['sha256'] and contained(item['path']).stat().st_mtime_ns==item['mtimeNs']
changed=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()
allowed=['audit_tools/pdf_accessibility/',src,sem,'validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1/']
assert all(any(p.startswith(a) for a in allowed) for p in changed)
pdf=PdfReader(contained(row['output']));text=normalized(pdf.pages[0].extract_text())
assert 'WORKED EXAMPLE: FINDING A NASH EQUILIBRIUM' in text and record['content']['worked'] in text
assert '(B, Y)' not in text and 'mixed' not in text.lower()
assert hashlib.sha256(validate(meta)).hexdigest()==meta['graphDecodedSha256']
assert meta['graphDecodedSha256'] in [hashlib.sha256(o.get_object().get_data()).hexdigest() for o in pdf.pages[0]['/Resources']['/XObject'].values()]
assert sha(row['output'])==sha(row['determinismRebuild'])==row['sha256']
negative=read_json(run+'/negative_tests.json');pipeline=read_json(run+'/pipeline_tests.json');regression=read_json(run+'/regression/results.json')
assert all(t['detected'] for t in negative['tests']) and pipeline['passed'] and regression['passed']==regression['total']
safety={'task':'MICRO49_UNIQUE_NASH_FIX_V2','root':str(root_guard()),'forbiddenWorkspaceUsed':False,'candidateReopened':True,'visibleAndSemanticMatrixAgree':True,'onlyUniqueAXEquilibrium':True,'dominantStrategiesAandX':True,'mixedStrategyDiscussion':False,'other150CandidateBytesAndMtimesUnchanged':True,'other150InstructionalAndSemanticRecordsUnchanged':True,'protectedTrackedSystemsUnchanged':True,'activePdfsReplaced':False,'activeManifestsChanged':False,'installationPerformed':False,'deploymentPerformed':False,'commitOrPushPerformed':False,'stagedAccepted':151,'humanAT':'PENDING'}
write_json(run+'/final_safety_check.json',safety)
write_json(run+'/focused_content_tests.json',{'testFile':'audit_tools/pdf_accessibility/test_micro49_content.py','tests':10,'passed':10,'result':'PASS'})
report=f'''# MICRO-49 unique Nash equilibrium correction

## Task Identity

MICRO49_UNIQUE_NASH_FIX_V2

## Repository and Preflight

- Verified working directory and Git top-level: `{root_guard()}`.
- Branch: `main`; HEAD: `{baseline['head']}`.
- Write probe succeeded in the exact authorized repository.
- Prior V1 changes were already uncommitted; their historical evidence and report were preserved. Baseline Git status is recorded in `{run}/baseline.json`.
- The forbidden workspace was never accessed. No repository reset, Git staging, commit or push occurred.

## Problem

The original matrix contained two pure-strategy equilibria, (A, X) and (B, Y). The owner determined this was too complex for the intended introductory worked example and authorized changing B/Y to create a simple dominant-strategy example with one unique Nash equilibrium.

## Authorized Matrix Change

**(B,Y): (7,7) → (1,1)**. No other payoff, label, payoff order or matrix geometry changed.

| Row / Column | X | Y |
|---|---|---|
| A | (9, 9) | (2, 3) |
| B | (3, 2) | (1, 1) |

Payoff order remains **(Row firm, Column firm)**.

## Economics Verification

| Player and rival action | Comparison | Best response |
|---|---|---|
| Row player, given X | A = 9 > B = 3 | A |
| Row player, given Y | A = 2 > B = 1 | A |
| Column player, given A | X = 9 > Y = 3 | X |
| Column player, given B | X = 2 > Y = 1 | X |

**A is the row player's strictly dominant strategy. X is the column player's strictly dominant strategy. (A, X) is the unique Nash equilibrium.** The focused regression computes best responses directly from the payoff values and finds exactly that equilibrium. No mixed-strategy discussion, probabilities or multiple-equilibrium claim appears in the final sheet.

## Canonical Source

In `{src}`, changed only MICRO-49's `content.worked`, `content.workedLabel`, `content.assetMetadata.imageAlt` and `content.assetMetadata.graphDescription`. Both current instructional matrix descriptions now contain (1, 1). Source changes preceded candidate generation.

The sole semantics system remains `{sem}`. Updated only MICRO-49's worked-text binding, table B/Y cell, source/table/derived-image fingerprints and review evidence. A resource-specific `matrixCorrection` record binds the exact original and derived image hashes, authorized cell change and deterministic digit rendering.

Maintained implementation: `audit_tools/pdf_accessibility/micro49_matrix.py`, invoked by the existing `visual_repairs.py` lifecycle, replaces exactly two reviewed digit boxes inside the original image. It uses the already pinned Vera font at the existing glyph height, preserves every pixel outside those boxes, and embeds the result losslessly. `micro49_wording.py` regenerates the explanation using its original embedded font and restores the original singular heading.

The retained authoring PDF (`build/faculty-build-composer/data/concept-reviews/authoring/visual-sources/MICRO-49.pdf`) and shared `matrix_multi_ne_1.webp` asset remain immutable original transformation inputs. Their original fingerprints remain valid; the derived displayed-image fingerprint is new. Their old digits, the correction's old-value provenance, archived sources and V1 evidence are intentionally retained as historical/input data, not current displayed or accessible content. No shared graph asset or unrelated resource was edited.

## Visible Matrix

Opened the derived matrix image and final rendered PDF. B/Y visibly reads **(1, 1)**; A/X (9, 9), A/Y (2, 3), B/X (3, 2), labels and punctuation remain unchanged. Digit replacement is part of deterministic regeneration, not an overlay on a staged PDF. No OCR was used.

Derived decoded-image SHA-256: `{meta['graphDecodedSha256']}`. The final candidate's image resource matches this fingerprint. A pixel comparison confirms changes are confined to the two B/Y digit boxes.

## Semantic Table

B/Y now has ActualText **(1, 1)**. Table → TR → TH/TD structure, caption, A/B and X/Y headers, Scope, IDs, TD Headers associations and navigation remain valid. The table subtree was compared with V1 and differs only in that cell's replacement text. Region mapping and matrix dimensions remain unchanged. Visible and semantic matrices agree exactly.

## Worked Example

Heading: **WORKED EXAMPLE: FINDING A NASH EQUILIBRIUM**.

> {record['content']['worked']}

The canonical paragraph appears once and completely in the candidate; the V1 explanation is absent.

## Accessibility Validation

- veraPDF 1.28.2, explicit `--flavour ua1`, ISO 14289-1:2014: **PASS**.
- Independent semantic, source-content, font and reading-order checks: **PASS**, zero project errors.
- Logical sequence: worked heading → payoff table → complete worked explanation → self-check.
- All meaningful blocks are assigned; the semantic table has no hidden duplicate bitmap alternative.
- Raw validator report: `{row['validatorReport']}`.

## Visual Review

**PASS**. Final page remains one US Letter page, 612 × 792 points. Matrix size and alignment, body font size (10.45 points), heading size (approximately 16 points), surrounding sections and design are preserved. Body leading remains 11.7 points from V1. The restored heading fits on one line. No clipping, overflow, overlap or page growth was observed in the opened final render.

Authorized differences are the B/Y digits, revised worked prose and restored singular heading. No unrelated visual changes were found. The source-aware text comparison permits exactly the authorized replacement, while derived-image checks bind the surgical digit change. See `{run}/visual_review.json` and the before/after renders beside the validator report.

## Determinism

- Candidate SHA-256: `{row['sha256']}`.
- Independent rebuild SHA-256: `{sha(row['determinismRebuild'])}`.
- Result: **PASS — identical bytes**.
- Candidate: `{row['output']}`.
- Rebuild: `{row['determinismRebuild']}`.

## Reused Candidates

**Other 150 candidates rebuilt: 0.** Their candidate bytes and modification times, source hashes, per-resource semantic hashes, raw validator-report hashes and determinism hashes remain valid. Existing preservation and visual receipts were retained and rechecked by the aggregate gate. Their external validators were not rerun. Prior staged MICRO-49 candidates also remain as historical evidence.

## Full Staged Gate

**151 / 151 ACCEPTED**, zero blocked.

| Required category | Result |
|---|---|
| PDF/UA machine | 151 / 151 |
| Semantic/project | 151 / 151 |
| Preservation | 151 / 151 |
| Determinism | 151 / 151 |
| Contrast/visual | 151 / 151 |

Evidence: `{run}/staged_gate.json` and `collection_summary.json`. No gate was weakened.

## Regression

- MICRO-49 economics and visible/semantic agreement: **10 / 10 PASS**. Rejects B/Y = (7,7), changed payoffs, altered equilibrium/dominance, multiple-equilibrium prose, wrong comparisons, stale visible fingerprints and source/semantic disagreement; permits harmless punctuation and wrapping.
- Accessibility negative tests, including table header/scope/value/association tests: **27 / 27 detected**; raw validator results retained.
- Accessibility pipeline tests: **19 / 19 PASS**. Installation logic ran only in isolated scratch fixtures; no active files were installed.
- Current Composer suite: **{regression['passed']} / {regression['total']} PASS**.
- Concept Review integration, generated package/resource verification and Mastery Report routing/state tests: **PASS**, included in that current suite. The integration runner exercises six generated-package cases and the 151-resource active manifest.
- Complete staged gate: **151 / 151 ACCEPTED**.

## Owner Test Pack

Replaced only `validation_artifacts/pdf_accessibility/owner_test_pack/blocked_25_v1/pdfs/MICRO-49.pdf` with the final candidate. Updated its manifest hash, result-template hash and instructions to cover the (1,1) cell, best responses, strict dominance and unique equilibrium. Other owner-pack PDFs are unchanged. Human AT remains PENDING.

## Installation Preview

Updated only: `{run}/installation_preview.json`. Refreshed MICRO-49's candidate hash, size and metadata; retained the other 150 plan records. The preview contains **151 logical resources and 302 planned destination copies**, including creation of **15 missing public MICRO-54 through MICRO-68 files**. Installation was **NOT executed**.

## Active Production State

**Active PDFs and active manifests remain untouched.** Other Concept Review instructional resources, shared graph assets, games/hubs, question banks, LO mappings, telemetry/governance, Workers/D1 and paper/manuscript files remain unchanged. No installation, deployment, commit or push occurred.

## Human AT Verification

**PENDING**. Machine and visual checks do not constitute human screen-reader verification.

## Final Safety Check

Authorized Git root reverified; forbidden workspace unused; final candidate reopened; visible/semantic values and unique-equilibrium explanation confirmed; other 150 candidates unchanged; no installation/deployment. `git diff --check` passed. Final report reopened for verification.

## Final Status

MICRO-49 UNIQUE NASH FIX COMPLETE — FULL STAGED COLLECTION REMAINS 151/151 ACCEPTED
'''
contained('FINAL_REPORT_micro49_unique_nash_fix.md').write_text(report,encoding='utf-8')
print('Final report and safety evidence written')
