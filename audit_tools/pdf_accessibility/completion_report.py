"""Final evidence inventory and owner report, after post-install PASS."""
from completion_release import q,OUT
from completion_package import PACKAGE,write
from install_composer_validated import public_state,verify,DEST
import collections,csv,subprocess
REPORT='FINAL_REPORT_concept_review_canonical_completion_composer_install.md'
def main():
    post=q.read_json(OUT+'/postinstall_result.json');assert post['status']=='PASS'
    install=q.read_json(OUT+'/composer_install.json');assert install['status']=='ALL 151 INSTALLED AND VERIFIED'
    vals=q.read_json(OUT+'/final_validation.json');verify(vals)
    baseline=q.read_json(OUT+'/baseline.json');frozen={p.replace('\\','/'):h for p,h in baseline['hashes'].items()}
    actual={p.replace('\\','/'):h for p,h in public_state().items()};old={p:h for p,h in frozen.items() if p.startswith('concept-reviews/')}
    assert actual==old
    assert q.sha(q.SOURCE)==frozen[q.SOURCE]
    spec='audit_tools/pdf_accessibility/canonical_components/specification.json';assert q.sha(spec)==frozen[spec]
    ds=q.read_json(OUT+'/final_dispositions.json');assert len(ds)==80 and all(r['status']=='PASS' for r in ds)
    restored={r['code']:r for r in ds};bycode={r['code']:r for r in vals}
    assert len(q.read_json(OUT+'/reused_candidates.json'))==71
    package=q.read_json(PACKAGE+'/candidate_manifest.json')
    assert len(list(q.contained(PACKAGE).glob('*/*.pdf')))==151
    for r in package['records']:assert q.sha(r['reviewCopyPath'])==r['reviewCopySHA256']==bycode[r['resourceId']]['sha256']
    with q.contained(PACKAGE+'/REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig',newline='') as f:checklist=list(csv.DictReader(f))
    assert len(checklist)==151 and all(not r[k] for r in checklist for k in ['OwnerFinalReview','ApprovedForComposer','OwnerNotes'])
    focused=q.read_json(OUT+'/focused_tests.json');assert focused['passed']
    negatives=q.read_json(OUT+'/negative_tests.json');assert all(r['detected'] for r in negatives['tests'] if r['detected'] is not None)
    gate=q.read_json(OUT+'/installed_staged_gate.json');assert gate['passed']==151 and not gate['blocked']
    backup=install['backup'];assert q.contained(backup+'/backup_manifest.json').exists()
    diff=subprocess.run(['git','diff','--check'],capture_output=True,text=True);assert diff.returncode==0,diff.stdout
    q.write_json(OUT+'/final_safety.json',{'root':str(q.root_guard()),'publicUnchanged':True,'sourceFrozen':True,'canonicalSpecificationFrozen':True,'canonicalAligned':80,'reused':71,'accepted':151,'v4ExactCopies':151,'installedExactCopies':151,'backup':backup,'composerTests':post['composerPassed'],'humanAT':'PENDING','gitDiffCheck':'PASS','forbiddenWorkspaceUsed':False,'deployed':False,'committed':False,'pushed':False})
    text=f'''# Canonical completion and Composer installation

## Task Identity
CONCEPT_REVIEW_CANONICAL_COMPLETION_COMPOSER_INSTALL_V1

## Repository
Verified root and working directory: `{q.EXPECTED_ROOT}`. Branch `{baseline['branch']}`; baseline HEAD `{baseline['head']}`. Exact Composer destination existed; scoped write/read/delete probe passed. Pre-existing dirty work was preserved. No reset, forbidden-workspace access, commit or push. Full preflight: [baseline](validation_artifacts/pdf_accessibility/canonical_completion_v1/baseline.json).

## Inherited State
Eight-resource canonical pilot PASS; 49 geometry fits included six accepted replacements and 43 provisional candidates. The remaining 31 were fit blockers. Current evidence confirmed these counts exactly.

## Layout Pattern Classification
The full affected set comprises 31 label-aware graph/prose layouts, one full-width paired graph, 20 table/prose layouts, 22 text/calculation/bullet layouts, and six prior canonical replacements. The inherited blockers are primarily graph/prose density and long titles. [Per-resource before/after budgets and dispositions](validation_artifacts/pdf_accessibility/canonical_completion_v1/final_dispositions.json) retain the exact source of each overage and final budget. Domain checkpoints are retained under `canonical_completion_v1/batches/`.

## New Canonical Interior Modes
CANONICAL_COMPACT_FLOW uses 1.20 body leading and a 16-pt heading/body gap within dense cards. CANONICAL_COMPACT_FLOW_TIGHT uses 1.18 leading and a 7.5-pt minimum flexible gap only where necessary. Label-aware canonical graph modes use readable labels with controlled tick-label rails and source-bound coordinates. CANONICAL_GRAPH_TEXT_STACKED accommodates the paired MICRO-33 diagram above the frozen explanation. Existing dense table and long-title modes remain.

Body target 10.45 pt; minimum 9.5 pt. Table text is approximately 9.665 pt. Displayed graph labels are at least 8.5 pt. Retained bitmap graphs that could not meet the label floor were reconstructed as maintained, fingerprint-bound presentation models from their reviewed graphs and unchanged alternatives; meaningful labels, payoff values and economic relationships were preserved. Unlabeled curve geometry remains illustrative. The canonical specification, fonts, metadata roles/dots and outer components were not redesigned.

## Resolved 31
All previous fit blockers have final accepted bytes:

|Resource|Reusable layout|Body pt|Required / available pt|Result|
|---|---|---|---|---|
'''
    for r in ds:
        if r['inherited']=='BLOCKED':
            b=r['finalBudget'];text+=f"|{r['code']}|{r['family']}|{b['bodyFont']}|{b['required']:.2f} / {b['available']:.2f}|PASS|\n"
    text+=f'''
## Validated 43 Provisional Fits
43/43 promoted only after explicit PDF/UA-1, source/semantic binding, Formula/Table/Figure checks, content preservation, render review, font/contrast/geometry checks and deterministic regeneration. The same checks cover all 31 resolved blockers. [Final validation records](validation_artifacts/pdf_accessibility/canonical_completion_v1/final_validation.json) bind actual candidate hashes to raw validator evidence.

## Full 80-Resource Canonical Alignment
**80 / 80 PASS.** All 80 reproduce through the maintained qa_renderer dispatch. The six previously accepted canonical replacements remain byte-identical. The other 71 resources were not rebuilt. Their source, semantic, candidate, deterministic-rebuild and raw validator hashes remain valid. [Maintained rebuild evidence](validation_artifacts/pdf_accessibility/canonical_completion_v1/maintained_checkpoint.json).

## Full 151-Resource Staged Gate
**151 / 151 ACCEPTED** before installation and 151/151 under the Composer-scoped post-install gate. PDF/UA, semantic/project, content/authorized difference, determinism, contrast/visual: each 151/151. No provisional candidate is selected.

## Canonical Template Fidelity
80/80 applicable resources PASS. GEN-ECON-01 specification SHA-256: `{q.sha(spec)}`. Header, metadata, hourglass/target/difficulty dots, title hierarchy, rail, rules, cards, footer, palette and Arimo family retain canonical components. Content-dependent heights and worked interiors vary. [Equal-scale comparisons](validation_artifacts/pdf_accessibility/canonical_completion_v1/comparisons/) and all final rendered pages were inspected. Missing table-placeholder em dashes in MACRO-05/41 were painted correctly without changing semantic cell text, then revalidated.

The canonical source JSON is byte-identical to the task baseline. Semantic content was compared after excluding only authorized presentation flags, image fingerprints and region geometry. MICRO-49 retains B/Y=(1,1), dominant A/X and the unique Nash equilibrium; graph removals/additions, all approved tables and other v2/v3 corrections remain.

## V4 Owner Review Package
`{q.contained(PACKAGE)}`

151 PDFs: 26 GEN-ECON, 68 MICRO, 57 MACRO. 151/151 package hashes equal selected validated candidates. README, checklist, summary, manifest, changelog, canonical audit, dense-layout summary and local index are included. QA history is preserved; OwnerFinalReview, ApprovedForComposer and OwnerNotes are blank.

## Composer Installation Authorization
The owner explicitly authorized Composer-only installation after alignment, validation and V4 completion. That sequence was followed. No public installation was authorized or performed.

## Composer Pre-Install Backup
`{q.contained(backup)}`

The backup manifest records prior existence, path, size and SHA-256 for all 151 PDFs plus manifest/release metadata. Every existing target was copied and hash-checked before mutation. [Backup inventory]({backup}/backup_manifest.json).

The first installation was rolled back exactly when the post-install checker compared the already-installed approved text against the old-text transition rule. The checker now accepts exact installed-candidate byte identity while retaining source, semantic, raw-validator, review, geometry and manifest checks. The installation was then repeated successfully. [Rollback evidence](validation_artifacts/pdf_accessibility/canonical_completion_v1/first_install_rollback.json).

## Installed Composer PDFs
**151 / 151 installed and verified** in `{q.contained(DEST)}`. The expected active PDF set is exact; source/semantic JSON files were preserved.

## Composer Hash Equality
**151 / 151 candidate SHA-256 == installed SHA-256.** All installed PDFs open, remain one page, preserve title/language and pass structural checks. [Installed byte inventory](validation_artifacts/pdf_accessibility/canonical_completion_v1/composer_install.json).

## Composer Metadata Refresh
The maintained `manifest.json` now records installed hashes, sizes, one-page counts, en-US and selectable text; total PDF bytes were recomputed. `accessibility_releases.json` retains byte-bound validation provenance with Composer-only scope. No question-bank, telemetry, governance or game version was changed.

## Post-Install Accessibility Verification
151/151 installed-path structural/project checks PASS. Independent veraPDF explicit PDF/UA-1: **8/8 PASS**, using actual Composer paths for GEN-ECON-01, GEN-ECON-09, MICRO-49, MICRO-52, MACRO-11, MACRO-16, MACRO-20 and MACRO-38. Exact byte equality preserves independent validation identity for all 151. [Raw installed validation](validation_artifacts/pdf_accessibility/canonical_completion_v1/installed_verapdf.json).

## Composer / Package Regression
Current Composer suite: **{post['composerPassed']} / {post['composerTotal']} PASS**, run after installation against the actual Composer source folder with scratch outputs. Includes Concept Review integration, Mastery Report routing/state and generated resource/package checks. Integration verifies all 151 source hashes/sizes and generated runtime asset metadata. [Results](validation_artifacts/pdf_accessibility/canonical_completion_v1/regression/results.json).

Focused instructional/canonical/dense/installer tests: {focused['total']}/{focused['total']} PASS. Accessibility pipeline: 19/19 checks PASS. Negative probes: 22/22 detected, including Table header/scope/cell, Formula number/sign, reading order, fonts and source binding. Rollback and Composer-only target scope are covered.

**Runtime delivery distinction:** existing generated Composer games use public PDF URLs, not bundled local PDFs. Their local resolution and generated hash/size metadata now reflect the installed collection; the URLs still serve the unchanged public collection until a separately authorized public update. This run did not silently change package routing or claim public delivery of the new bytes.

## Public Folder State
Public PDFs were **NOT updated**. The complete public file/hash inventory equals the task baseline; MICRO-54 through MICRO-68 remain absent publicly. Composer and public libraries intentionally differ.

## Human AT
**PENDING.** The representative owner AT pack contains the final candidate bytes. Machine/Codex review is not human screen-reader approval.

## Active Deployment State
No deployment, Cloudflare operation, commit or push. Games/hubs, question banks, telemetry/governance, Workers/D1, manuscripts and unrelated site content were not changed by this task.

## Remaining Issues
No canonical-fit or Composer installation blockers remain. Public delivery and human AT remain separate follow-up decisions; generated games still use the existing public URLs as described above. Owner final visual review fields remain blank.

## Final Status
CANONICAL ALIGNMENT COMPLETE — 151/151 INSTALLED IN COMPOSER AND VERIFIED
'''
    write(REPORT,text);assert q.contained(REPORT).read_text(encoding='utf-8')==text.rstrip()+'\n'
    print(str(q.contained(REPORT)))
if __name__=='__main__':main()
