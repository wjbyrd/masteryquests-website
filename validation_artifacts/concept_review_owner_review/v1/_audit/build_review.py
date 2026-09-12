"""Build audit documents only; never writes project content or PDF bytes."""
import json,html,collections
from pathlib import Path
from observations import REVIEWS
OUT=Path(__file__).resolve().parents[1]
ROOT=OUT.parents[2]
details=json.loads((OUT/'_audit/details.json').read_text(encoding='utf-8'))
manifest=json.loads((OUT/'candidate_manifest.json').read_text(encoding='utf-8'))
baseline=json.loads((OUT/'_audit/baseline.json').read_text(encoding='utf-8'))
records={r['resourceId']:r for r in manifest['records']}
assert len(REVIEWS)==151 and set(REVIEWS)==set(records)
known={
'MICRO-49':'OWNER: original matrix had multiple equilibria, too complex for intended example. Use A/X (9,9), A/Y (2,3), B/X (3,2), B/Y (1,1): A and X strictly dominant; (A,X) unique Nash equilibrium. Correct V2 packaged and verified.',
'MACRO-11':'OWNER: remove production-function graph; worked example should focus directly on productivity measurement. Current candidate has not incorporated this change.',
'MACRO-12':'OWNER: KEEP production-function graph here; capital deepening and diminishing returns belong here. Review sequence with 11 and 13.',
'MACRO-13':'OWNER: remove production-function graph; worked example should focus on evaluating long-run growth policy. Current candidate has not incorporated this change.',
'MACRO-16':'OWNER: graph should show Wage vertical, Quantity of labor horizontal, upward Labor Supply, downward Labor Demand, equilibrium, binding minimum wage above equilibrium, QD=90, QS=120, surplus=30 workers. Not implemented.',
'MACRO-20':'OWNER: genuine before/after $25 loan-loss balance sheet: reserves 120/120; loans 780/755; securities 100/100; total assets 1000/975; deposits 900/900; borrowing 40/40; total liabilities 940/940; capital 60/35. Reinforce 1000=940+60 and 975=940+35. Not implemented.',
'MICRO-09':'OWNER: DO NOT add another tax-incidence graph. Keep transfer/application role; GEN-ECON-21 and GEN-ECON-22 already provide graphical treatment.',
'GEN-ECON-21':'OWNER: provides graphical tax treatment with GEN-ECON-22; review both with MICRO-09 for redundancy. Do not duplicate graph on MICRO-09.',
'GEN-ECON-22':'OWNER: provides graphical tax treatment with GEN-ECON-21; review both with MICRO-09 for redundancy. Do not duplicate graph on MICRO-09.'}
statuses={'MICRO-49':'CORRECTED V2 VERIFIED — OWNER APPROVAL PENDING','MACRO-11':'OWNER-IDENTIFIED FIX PENDING','MACRO-13':'OWNER-IDENTIFIED FIX PENDING','MACRO-12':'OWNER DIRECTION — RETAIN GRAPH; APPROVAL PENDING','MACRO-16':'OWNER-IDENTIFIED VISUAL IMPROVEMENT PENDING','MACRO-20':'OWNER-IDENTIFIED TABLE IMPROVEMENT PENDING','MICRO-09':'OWNER-REVIEWED — GRAPH INTENTIONALLY NOT ADDED'}
columns='Resource Domain Title Outcome CandidatePath CandidateSHA256 CandidateEvidence TechnicalStatus OwnerReviewStatus ContentCorrectness CalculationCheck LevelAppropriate WorkedExampleAlignment CheckYourselfAlignment GraphPresent TablePresent VisualUtility WouldGraphOrTableHelp SuggestedVisualType VisualRecommendation RedundancyConcern RelatedResources KnownOwnerIssue CodexFinding Priority OwnerNotes OwnerDecision ApprovedForInstall'.split()
rows=[]
for d in details:
    code=d['code'];r=records[code];a=REVIEWS[code]
    visual=a['visual'] or ('KEEP_TABLE' if d['table'] else 'KEEP_GRAPH' if d['graphAlternative'] else 'NO')
    utility={'KEEP_TABLE':'EXISTING TABLE SHOULD STAY','KEEP_GRAPH':'EXISTING GRAPH SHOULD STAY','NO':'NO — current prose/calculation is appropriate','TABLE':'TABLE — table would materially improve understanding','GRAPH':'GRAPH — graph would materially improve understanding','REPLACE':'EXISTING VISUAL SHOULD BE REPLACED','REDUNDANT':'EXISTING VISUAL IS REDUNDANT','REVIEW':'REVIEW NEEDED'}[visual]
    help_={'TABLE':'TABLE','GRAPH':'GRAPH','REPLACE':'GRAPH','REVIEW':'REVIEW'}.get(visual,'NO')
    recommendation=a['recommendation'] or ({'KEEP_TABLE':'Retain payoff table for row/column best-response comparisons.','KEEP_GRAPH':'Retain existing graph: it supports the curve/point comparison in this worked example.','NO':'No additional graph or table needed: current short prose/calculation supports the target skill.'}.get(visual,''))
    assert recommendation
    evidence=r['validationEvidence']
    row=dict(zip(columns,[code,r['domain'],d['title'],d['content']['outcome'],r['reviewCopyPath'],r['reviewCopySHA256'],evidence['stagedGate']+'#'+code+'; '+evidence['rawValidatorReport'],
    'ACCEPTED — existing evidence/hash verified',statuses.get(code,'OWNER APPROVAL PENDING'),a['content'],a['calc'],a['level'],a['worked'],a['check'],'YES' if d['graphAlternative'] else 'NO','YES' if d['table'] else 'NO',utility,help_,('GRAPH' if visual in ['GRAPH','REPLACE','KEEP_GRAPH'] else 'TABLE' if visual in ['TABLE','KEEP_TABLE'] else 'NONE' if visual in ['NO','REDUNDANT'] else 'REVIEW'),recommendation,a['redundancy'],a['related'],known.get(code,''),a['note'],a['priority'],'','','']))
    assert len(row)==len(columns)
    rows.append(row)
(OUT/'_audit/checklist_rows.json').write_text(json.dumps({'columns':columns,'rows':rows},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
counts=collections.Counter(r['VisualUtility'] for r in rows)
priority=collections.Counter(r['Priority'] for r in rows)
high=[r for r in rows if r['Priority'] in ['HIGH','CRITICAL']]
def links(rs):return ', '.join('['+r['Resource']+']('+r['CandidatePath']+')' for r in rs) or 'None'
def bullet(rs,field='CodexFinding'):return '\n'.join('- **['+r['Resource']+']('+r['CandidatePath']+')** — '+r[field] for r in rs) or 'None.'
def select(field,values):return [r for r in rows if r[field] in values]
clusters='''| Comparison group | First-pass sequence finding |
| --- | --- |
| GEN-ECON-21 / GEN-ECON-22 / MICRO-09 (also MICRO-02) | Preserve graphical tax treatment on GEN sheets and transfer/application on MICRO-09. GEN-22 equal-split example does not demonstrate unequal elasticity; its graph also repeats MICRO-02. Owner decision against another MICRO-09 graph remains in force. |
| MACRO-11 / MACRO-12 / MACRO-13 | Owner-directed differentiation remains pending: measurement / retained capital-deepening graph / growth-policy evaluation. All three currently share the same K=20 to K=40 example. |
| GEN-ECON-12–18 / MICRO-01 | Separate curve shifts, movements and equilibrium; GEN-16 uses the same simultaneous-shift visual as GEN-18 before that complexity is needed. |
| GEN-ECON-19–25 / MICRO-02–16 | Distinguish controls, elasticity, welfare and trade. Review inconsistent Watch Out numbers on MICRO-02/12/13/15/16 and worked headings on 07/14/16. |
| MICRO-19–28 | Production schedules, marginal/average costs and scale deserve distinct tasks. Tables help 20–23; 22/23 and 26/27 currently repeat visual/example roles. |
| MICRO-29–35 | Supply, shutdown, entry/exit and efficiency are distinct. Resolve MICRO-32 coordinate reading and heading that promises a shift while showing a movement. |
| MICRO-36–43 | Separate entry barriers, revenue, output choice, welfare, natural-monopoly regulation and discrimination. MICRO-36 imports the natural-monopoly funding example used later; 40 does not actually measure DWL despite its heading. |
| MICRO-44 / MICRO-45 / MICRO-47 | Same Q=36, P=27 zero-profit graphic is reused for differentiation, equilibrium and variety. Retain the equilibrium role; owner should consider a distinct example for variety benefits. |
| MICRO-48–53 | Concentration, mutual best responses, cartel incentives, sequential credibility and nonprice competition should be distinct. MICRO-49 is corrected. MICRO-48 HHI aggregation, 51 unexplained PV figures and 52 MC/MR geometry require review. |
| MICRO-54–56 / GEN-ECON-23–24 | Public-good demand aggregation and externality diagrams serve different economic operations; vertical summation on MICRO-55 is useful, not automatically redundant. |
| MICRO-57–62 / MACRO-14–17 | Firm labor demand, leisure choice, inequality and labor-force measurement differ. Retain the labor-demand graph; owner graph for MACRO-16 should teach a wage floor, not repeat a firm demand reading. |
| MICRO-63–68 | Behavioral comparisons and collective choice have distinct roles. Voting rankings and median-policy position merit table/axis support; Arrow and indifference-curve material require syllabus-level judgment. |
| MACRO-01–09 / MACRO-25–27 | Separate national accounting, price-index construction, purchasing-power conversion and expected/realized interest. Tables are useful where students must reconstruct multiple basket/year categories. |
| MACRO-18–22 / MACRO-49 | Separate money measures, institutions, bank balance sheets, policy tools, leakage and deposit rounds. Keep owner balance-sheet table proposal on 20; tools table on 21 and rounds table on 49 serve different tasks. |
| MACRO-23 / MACRO-24 | Same 2500-to-5000 money graph and price doubling. Keep graphical quantity theory on 23; nominal-versus-real before/after table could make 24 distinctive. |
| MACRO-28–32 / MACRO-43–45 | Money-market transmission, fiscal shifts and loanable-funds crowding out are distinct. Three-AD-curve graph on 30/31 repeats; it does more work on 31. |
| MACRO-33–36 / MACRO-50–51 | AD-only and SRAS-only shifts lead into joint shocks, self-adjustment and capacity/output-gap analysis. Shared model family is purposeful; active curves and path labels generally agree. |
| MACRO-37–41 | Movement, long-run return, expectations shift, disinflation path and sacrifice ratio form a useful sequence. 37 only reads one point; 38 lacks a labeled final natural-rate point. Shared 39/40 graph supports different paths. |
| MACRO-42–49 | Saving identities, equilibrium, fiscal stocks/flows and banking are distinguishable. Component tables on 42 and before/after ratios on 48 would improve comparison; no extra graph on simple budget-sign or debt arithmetic. |
| MACRO-52–57 | Keep transaction accounting, currency quotation, real purchasing power, asset flows, basic FX and multi-market policy distinct. 55 repeats some 52 accounting. 56/57 explicitly change gross-flow versus NCO supply assumptions; advanced chain on 57 needs prerequisite review. |
'''
known_md='\n'.join('- **'+k+'** — '+v+' **Status:** '+statuses.get(k,'OWNER APPROVAL PENDING')+'.' for k,v in known.items())
visual_summary='\n'.join('- '+k+': **'+str(v)+'**' for k,v in counts.items())
new_high=[r for r in high if r['Resource'] not in ['MACRO-11','MACRO-13','MACRO-16','MACRO-20']]
summary=f'''# Concept Review faculty review summary

## Scope

151 current Concept Review candidates: 26 GEN-ECON, 68 MICRO, 57 MACRO. All 151 received a first-pass review of outcome, core explanation, recognition cues, Watch Out, worked example, self-check, and graph/table utility. Review combined extracted candidate text, current canonical text, semantic descriptions, and visual inspection of existing validation page renders, assembled into contact sheets. Selected concern figures were inspected at full-page resolution. No PDFs were generated or re-rendered. No OCR was used.

PASS means no specific concern found in this first pass, not proof of correctness or owner approval. QUESTION records an ambiguity or issue needing faculty judgment; FAIL records a specific contradiction. Technical acceptance is separate from instructional approval. A key-relationships bullet card is not counted as a table. All 151 existing candidates are one page; this audit does not replace full-size owner reading or human AT testing. Several maintained-layout macro sheets use visibly smaller type than older layouts; owner should judge comfort at normal viewing/print size even where technical evidence passes.

## Candidate Resolution

Selected by active resource ID and accepted SHA-256 using `{manifest['resolutionAuthority']}/final_validation.json`, `staged_gate.json`, `installation_preview.json` and `review_receipt.json`. Per-resource source/semantic hashes, raw PDF/UA-1 validator evidence and deterministic-rebuild hashes were checked against current files. This reuses maintained evidence, not a new 151-resource audit or rebuild. Latest applicable report is recorded per manifest row. No timestamp/alphabetical selection or production fallback was used.

151/151 review hashes equal staged source hashes. MICRO-49 is the V2 unique-Nash candidate, SHA-256 `{records['MICRO-49']['reviewCopySHA256']}`. Visible and semantic matrices show (9,9), (2,3), (3,2), (1,1); prose establishes A and X as strictly dominant and (A,X) unique. The prior (7,7) candidate was not copied.

## Known Owner Findings

{known_md}

These are owner decisions/findings, not new Codex proposals. No pending fix was applied. MICRO-52 also carries a prior owner-adjudicated graph context in existing evidence; the new visual discrepancy below is recorded for review, not automatically corrected.

## New Codex Findings

### Content and calculation concerns

{bullet(select('ContentCorrectness',['FAIL','QUESTION']))}

MICRO-48: the four named firms contribute 2693 HHI points. The aggregate 9% fringe contributes the sum of its individual squared shares, not necessarily 81. Thus 2774 is only the one-firm-fringe upper bound. The printed addition itself is correct; its input aggregation is the problem.

MICRO-52: enlarged visual inspection places the two MR branch endpoints around 10 and 32 at quantity 20, with MC around 36 above both. The displayed geometry does not substantiate the prose's within-gap claim. This is an owner-review question despite previous technical/context acceptance.

### Level and scope concerns

{bullet(select('LevelAppropriate',['QUESTION','NO']))}

These are syllabus-fit questions, not recommendations to automatically remove advanced content.

### Worked-example and self-check concerns

Worked-example questions/failures: {links(select('WorkedExampleAlignment',['QUESTION','FAIL']))}.

Self-check questions/failures: {links(select('CheckYourselfAlignment',['QUESTION','FAIL']))}.

Specific examples include complements under a substitutes heading (MICRO-07), exports under an imports heading (MICRO-16), movement under a shifting-supply heading (MICRO-32), one-point reading under movement-along-SRPC (MACRO-37), unchanged self-check calculation on MACRO-10, and option-like prompts without options on MICRO-08/13. The CSV supplies the row-specific reason for every flag.

## Visual Opportunity Summary

The following mutually exclusive primary recommendations sum to 151:

{visual_summary}

GRAPH recommended (new graph): {links([r for r in rows if r['VisualUtility'].startswith('GRAPH —')])}.

TABLE recommended: {links([r for r in rows if r['WouldGraphOrTableHelp']=='TABLE'])}.

Existing visual replacement: {links(select('VisualUtility',['EXISTING VISUAL SHOULD BE REPLACED']))}.

Existing visual redundant: {links(select('VisualUtility',['EXISTING VISUAL IS REDUNDANT']))}.

Review needed: {links(select('VisualUtility',['REVIEW NEEDED']))}.

Graph/table recommendations are justified by comparison, accounting, causal reasoning or spatial intuition, not decoration. Retention is not endorsement of every label: content/graph concerns remain visible in the same row. MICRO-09 remains NO for another graphic. MACRO-12 is explicitly retained.

## Redundancy / Sequence Findings

{clusters}

## High-Priority Review List

Only HIGH/CRITICAL rows follow; no CRITICAL issues were assigned. HIGH means resolve before instructional approval, not that every row contains a proven arithmetic error.

{bullet(high)}

Priority totals: {', '.join(k+' '+str(v) for k,v in priority.items())}.

## Installation Readiness

Owner content/visual approval is PENDING for the collection. Technical 151/151 acceptance does not establish instructional approval. All OwnerDecision and ApprovedForInstall cells are blank. Human AT remains PENDING. Review all 151 sheets, decide targeted corrections, then perform a human AT sample, then seek separate installation authorization. No installation, content correction, deployment, commit or push occurred.
'''
(OUT/'REVIEW_SUMMARY.md').write_text(summary,encoding='utf-8')
readme=f'''# Concept Review owner review package

Open [index.html](index.html) to browse 151 sheets. Record decisions in [REVIEW_CHECKLIST.csv](REVIEW_CHECKLIST.csv). Read [REVIEW_SUMMARY.md](REVIEW_SUMMARY.md) for known owner findings and new first-pass concerns.

These are REVIEW COPIES of current accepted staged candidates, not the active production PDFs. Every copy is byte-identical to its selected staged candidate. Technical acceptance does not imply instructional approval. Nothing is pre-approved for installation.

Do not use PDFs in `concept-reviews/` or `build/faculty-build-composer/data/concept-reviews/` as evidence of current staged content unless hash-based candidate resolution explicitly establishes a match. Production still includes older bytes. The review package includes the corrected MICRO-49 with B/Y = (1,1).

Review order: GEN-ECON-01 → GEN-ECON-26; MICRO-01 → MICRO-68; MACRO-01 → MACRO-57. Also use the sequence comparisons in the summary, especially GEN-ECON-21/22 with MICRO-09 and MACRO-11/12/13.

For each sheet consider:

1. Is the economics correct?
2. Is the level appropriate?
3. Does the worked example match the outcome?
4. Does the self-check make sense?
5. Is the visual useful?
6. Would a graph or table materially improve this?
7. Is the same graph or example already used elsewhere?
8. Does anything feel wrong or unnecessarily complicated?

## Recording decisions

Filter the CSV by Priority, KnownOwnerIssue, ContentCorrectness or WouldGraphOrTableHelp. Each of 151 rows answers the visual-utility question and contains a specific first-pass observation. PASS means no issue found in that pass; it is not owner approval. QUESTION invites faculty judgment; FAIL identifies a specific contradiction. CalculationCheck QUESTION also covers unsupported inputs/graph readings even where arithmetic is correct. Blank OwnerNotes, OwnerDecision and ApprovedForInstall are for the owner. OwnerReviewStatus can carry an existing design decision without approving the whole sheet.

The local HTML only filters and links to PDFs; it does not save approval. Use your spreadsheet application to edit the CSV and preserve all resource IDs and candidate hashes. Review at comfortable full-size zoom or print size; contact sheets are audit aids, not substitutes for owner inspection.

OWNER approval must precede installation. Pending changes to MACRO-11/13/16/20 were deliberately not made. MICRO-09's no-additional-graph decision and MACRO-12's retained-graph decision remain in force. Human AT is PENDING.

## Provenance and safety

`candidate_manifest.json` records every source candidate, copy, SHA-256, raw validation evidence and applicable report. Review paths are relative to this folder; source/evidence/report paths are relative to repository root `{ROOT}`. `_audit/` contains read-only inspection scripts, per-sheet transcripts/observations, existing-render contact sheets and integrity evidence; it contains no additional review PDFs.

Selection authority: `{manifest['resolutionAuthority']}`. No production fallback, source editing, semantic alteration, PDF regeneration/re-tagging, installation, deployment, commit or push occurred. The forbidden workspace was not used.
'''
(OUT/'README.md').write_text(readme,encoding='utf-8')
esc=html.escape
sections=[]
for domain,label in [('GEN-ECON','General Economics'),('MICRO','Microeconomics'),('MACRO','Macroeconomics')]:
    items=[]
    for r in rows:
        if r['Domain']!=domain:continue
        marker=' <strong class="owner">Known owner issue / decision</strong>' if r['KnownOwnerIssue'] else ''
        items.append('<li class="resource"><a href="'+esc(r['CandidatePath'],quote=True)+'">'+esc(r['Resource']+' — '+r['Title'])+'</a><span class="priority">Priority: '+r['Priority']+'</span>'+marker+'<p>'+esc(r['VisualUtility']+' — '+r['VisualRecommendation'])+'</p></li>')
    sections.append('<section><h2>'+label+'</h2><ul>'+''.join(items)+'</ul></section>')
script="""const input=document.getElementById('search');const entries=Array.from(document.querySelectorAll('.resource'));function filter(){const terms=input.value.toLowerCase().trim().split(/\\s+/).filter(Boolean);let visible=0;for(const item of entries){item.hidden=!terms.every(t=>item.textContent.toLowerCase().includes(t));if(!item.hidden)visible++;}for(const section of document.querySelectorAll('section'))section.hidden=!Array.from(section.querySelectorAll('.resource')).some(x=>!x.hidden);document.getElementById('count').textContent=visible+' of '+entries.length+' resources shown';}input.addEventListener('input',filter);filter();"""
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Concept Review — Owner QA</title><style>body{font:17px/1.5 system-ui,sans-serif;color:#172538;background:#f6f8fa;max-width:1100px;margin:2rem auto;padding:0 1.2rem}a{color:#124d8d}h1,h2{color:#102e55}header{background:white;border-top:5px solid #007d83;padding:1.4rem}label{font-weight:700;display:block}input{box-sizing:border-box;width:100%;font:inherit;padding:.65rem;border:2px solid #64748b;border-radius:5px}li{background:white;list-style:none;margin:.8rem 0;padding:1rem;border:1px solid #ccd4df;border-radius:6px}ul{padding:0}li>a{font-weight:700}li p{margin:.5rem 0 0}.priority,.owner{display:inline-block;margin-left:.8rem;font-size:.85em}.owner{color:#733c00}a:focus-visible,input:focus-visible{outline:3px solid #007d83;outline-offset:3px}[hidden]{display:none!important}</style></head><body><header><h1>Concept Review owner QA</h1><p>151 review copies: 26 General Economics · 68 Microeconomics · 57 Macroeconomics.</p><p><strong>Owner approval is pending.</strong> Technical acceptance does not establish instructional approval. Record approval in <a href="REVIEW_CHECKLIST.csv">REVIEW_CHECKLIST.csv</a>, not this HTML.</p><p><a href="README.md">Instructions</a> · <a href="REVIEW_SUMMARY.md">Audit summary</a> · <a href="candidate_manifest.json">Candidate provenance</a></p><label for="search">Filter by resource, title, priority or visual recommendation</label><input id="search" type="search" placeholder="For example: MICRO-49 or TABLE" autocomplete="off"><p id="count" role="status" aria-live="polite">151 resources shown</p></header><main>'''+''.join(sections)+'</main><script>'+script+'</script></body></html>\n'
(OUT/'index.html').write_text(page,encoding='utf-8')
(OUT/'_audit/index-script.js').write_text(script,encoding='utf-8')
report=f'''# Concept Review owner QA final report

## Task Identity

CONCEPT_REVIEW_OWNER_QA_V1

## Repository

Verified working directory and Git top-level: `{ROOT}`. Branch `{baseline['branch']}`; baseline HEAD `{baseline['head']}`. Preflight status was clean. Write access was verified with a temporary probe within the authorized package, then the probe was removed. No repository reset. Forbidden workspace unused.

## Package Location

`{OUT}`

Open `index.html`; decisions belong in `REVIEW_CHECKLIST.csv`. Detailed observations and cross-resource comparisons are in `REVIEW_SUMMARY.md`.

## Candidate Resolution Method

Matched 151 active resource IDs to the latest maintained accepted hashes in `{manifest['resolutionAuthority']}` final validation, staged gate, review receipt and installation preview. Checked current per-resource source/semantic hashes, raw validator report hashes/PDF-UA-1 compliant entries, candidate hashes and deterministic rebuild hashes. Selected applicable correction reports are recorded in the candidate manifest. No timestamp-based choice or production fallback. Existing acceptance evidence was reused; no full validation rerun or regeneration.

## Package Counts

151 PDFs: 26 GEN-ECON, 68 MICRO, 57 MACRO. Exactly one per active ID, no missing/duplicate IDs, no rejected/intermediate PDFs in review folders. 151 checklist rows; every row explicitly answers graph/table usefulness. OwnerDecision and ApprovedForInstall remain blank.

## Known Owner Findings

{known_md}

## New Audit Findings

All 151 candidates received first-pass instructional and visual review. Findings are independent of technical acceptance; no content was corrected. The CSV separates KnownOwnerIssue from CodexFinding. Priority totals: {', '.join(k+' '+str(v) for k,v in priority.items())}. See package summary for all low/medium concerns and 20 explicit cross-resource comparison groups.

## Graph Recommendations

New graphs: {', '.join(r['Resource'] for r in rows if r['VisualUtility'].startswith('GRAPH —')) or 'None'}. Replacement graphs: {', '.join(r['Resource'] for r in rows if r['VisualUtility']=='EXISTING VISUAL SHOULD BE REPLACED') or 'None'}. MICRO-52 requires visual/content review. MICRO-09 has no additional graph recommendation; MACRO-12 is retained.

## Table Recommendations

{', '.join(r['Resource'] for r in rows if r['WouldGraphOrTableHelp']=='TABLE')}.

Each row explains the instructional benefit. MACRO-20 is the owner's before/after balance-sheet direction, not a new Codex suggestion.

## Redundant Visuals

Primary remove/redundant recommendations: {', '.join(r['Resource'] for r in rows if r['VisualUtility']=='EXISTING VISUAL IS REDUNDANT')}. Other overlap needing differentiation: GEN-16/18, GEN-22/MICRO-02, MICRO-22/23, MICRO-26/27, MICRO-44/45/47, MACRO-23/24, MACRO-30/31. Some shared model families are purposeful; no automatic removal is proposed for them.

## Content / Calculation Concerns

{bullet(new_high).replace('](', ']('+str(OUT.relative_to(ROOT)).replace(chr(92),'/')+'/')}

MICRO-48's four named firms contribute 2693 HHI points. Treating an aggregate 9% fringe as one firm supplies the maximum additional 81, so exact 2774 is unsupported without individual shares. MICRO-52's enlarged plotted MR endpoints near 10 and 32 do not bracket MC near 36. Neither issue was changed. Additional medium/low wording and prompt concerns are enumerated in the CSV and summary.

## Level / Scope Concerns

{', '.join(r['Resource'] for r in rows if r['LevelAppropriate'] in ['QUESTION','NO']) or 'None'}. These are curriculum-fit questions; advanced material was not deleted or rewritten.

## High-Priority Owner Review

{', '.join(r['Resource'] for r in high)}. No CRITICAL classification. Detailed reasons are in the package summary and checklist; owner-directed pending fixes remain distinguished from new concerns.

## Package Integrity

151/151 source-to-copy SHA-256 equality. MICRO-49 hash `{records['MICRO-49']['reviewCopySHA256']}`; corrected visible/semantic values (9,9), (2,3), (3,2), (1,1), strict dominant A/X and unique (A,X) verified. No PDF was regenerated, transformed or retagged. Final integrity evidence is `_audit/integrity.json` in the package.

## Production State

No active installation. No active production PDF, staged source candidate, canonical source, accessibility semantics or active manifest was changed. No deployment, commit or push. No protected system was modified. Git diff --check and protected-hash checks are recorded in final integrity evidence.

## Human AT Status

PENDING. No screen-reader verification is claimed.

## Next Step

Owner manually reviews all 151 sheets and records decisions in REVIEW_CHECKLIST.csv. After owner review: targeted corrections only. Then: human AT sample. Then: separately authorized installation. The collection is not declared install-ready.
'''
(ROOT/'FINAL_REPORT_concept_review_owner_qa.md').write_text(report,encoding='utf-8')
print(json.dumps({'rows':len(rows),'visual':dict(counts),'priority':dict(priority),'high':[r['Resource'] for r in high]},indent=2))
