"""Generate the final audit report from completed, retained evidence."""
from repo_guard import *
from collections import Counter
import re
from final_qa_build import EVIDENCE, SOURCE, SEMANTICS, BASELINE_COMMIT

FACULTY = '''
GEN-ECON-17|Reconciled recognition, worked quantities, graph and alternative text: equilibrium $3/150 thousand gallons; at $2, demand 200 and supply 100; shortage 100. Opposite-price surplus also checked.
GEN-ECON-22|Regenerated the tax-incidence diagram from its economic model at native display proportions, with legible line samples and economic alternative text. Beginner → Intermediate reflects two burdens plus elasticity interpretation.
MACRO-14|Preserved the numeric schedule as a tagged PDF table with header associations and selectable cell text; verified employment classifications and rate denominators.
MACRO-15|Removed repeated recession examples; retained three distinct unemployment definitions and recognition cues; normalized spacing.
MACRO-18|Verified the tagged money schedule, cells and reading order. The current M1 definition includes savings deposits; the stated post-May-2020 convention is supported by the Federal Reserve.
MACRO-20|Focused the outcome and check on a single bank's capital absorbing loan losses. Preserved its balance-sheet table. MACRO-49 covers system-wide deposit rounds; no duplicate deposit-expansion companion was added.
MACRO-21|Preserved and retagged the policy-tool table, including the distinction between ample- and limited-reserves implementation.
MACRO-23|Integrated an actual M × V = P × Y calculation and reciprocal 1/P interpretation. At fixed V=2 and Y=10,000, M=2,500 gives P=.50; M=5,000 gives P=1.00. No 23b: the current manifest/runtime architecture recognizes the established numeric IDs and 151-resource collection.
MACRO-24|Consolidated neutrality, nominal/real definitions and the real-wage implication. Preserved the semantic table and exact cells.
MACRO-25|Replaced overlapping cues with expected inflation, contract timing, and realized-return distinctions.
MACRO-26|Added arbitrary redistribution, menu/shoeleather costs, relative-price confusion and conditional tax distortions in a concise paragraph.
MACRO-28|Removed the repeated money-demand sentence from the core. Revised recognition into three distinct mechanisms and regenerated the money-market illustration.
MACRO-30|Used price level 100, Y1=100 and Y2=150 consistently. Clarified that the graph shows output demanded at fixed P, not a supply-determined new equilibrium.
MACRO-31|Consolidated multiplier and crowding-out explanations, defined MPC and stated assumptions; made recognition cues distinct. Preserved the multiplier illustration.
MACRO-33|Separated movement along AD from shifts caused by independent spending changes within the existing sheet. An additional sheet would duplicate the same distinction and disrupt the fixed catalog.
MACRO-34|Verified that the core already separates current-price movement from input-cost shifts. Retained that economics, defined SRAS and regenerated the supporting two-curve diagram; no unnecessary split.
MACRO-37|Removed LRPC from both core and diagram. Focused recognition and warning on movement along SRPC versus changes in expectations/supply conditions.
MACRO-38|Removed the redundant wrap-up and unexplained numeric recognition cues. Explained demand movement, expectations adjustment, and changes in the natural rate separately.
MACRO-41|Preserved the tagged output-gap table and clarified percentage output gaps, cumulative losses and percentage-point inflation reduction.
MACRO-42|Removed course-model language; defined Y, T, C, G, I, S, NCO and NX. Stated the simplified accounting assumptions behind NX=NCO. Preserved the semantic table.
MACRO-43|Restored the canonical template; regenerated the loanable-funds diagram with readable axis labels and consistent A=(140,8).
MACRO-44|Restored the canonical template and clear saving-supply-shift graph.
MACRO-45|Restored the canonical template and graph. Rewrote the deficit → national saving → real rate → investment chain as complete, natural cues.
MACRO-46|Restored the canonical template. Defined net taxes and purchases, distinguished the deficit from public saving, and explained why broader published outlays can differ.
MACRO-48|Preserved the tagged table and exact data; removed the unnecessary 'at a Principles level' qualifier.
MACRO-49|Preserved the semantic multiple-deposit table; defined rr. Kept its system-wide expansion focus distinct from MACRO-20's single-bank capital loss.
MACRO-50|Restored canonical formatting and regenerated the productivity/LRAS/SRAS diagram; defined abbreviations and preserved A=(100,125), B=(115,110).
MACRO-51|Restored canonical formatting and the adjustment graph; defined AD, SRAS and LRAS and distinguished short- and long-run equilibrium.
MACRO-52|Preserved the semantic table, defined NCO and removed course-specific accounting language. Clarified the trade-deficit/negative-NCO relationship under stated assumptions.
MACRO-53|Restored canonical formatting and generic quotation units. Added opposite 10% appreciation and depreciation scenarios, each measured from .90 euros per dollar.
MACRO-54|Restored canonical formatting, actual ε and × glyphs, and accessible formula speech. Added real appreciation/depreciation cases, equivalent-basket definitions and the limits of ε=1 for index-based measures.
MACRO-56|Restored canonical formatting; stated foreign currency per U.S. dollar and gross-flow supply/demand without course-specific language. Regenerated the A-to-B appreciation graph.
MACRO-57|Removed the dependency on MACRO-56. Explained fixed price levels and vertical NCO supply directly, with the loanable-funds rate determined upstream. Graph, labels and alternative text agree.
MICRO-06|Defined an inferior good as negative income elasticity and falling demand when income rises, holding prices fixed.
MICRO-07|Converted the bare Y-price fact into a task distinguishing complements from substitutes using the response of X demand.
MICRO-09|Combined elasticity 2.1 with its percentage interpretation; removed the standalone fact and made the check an explicit tax-incidence question.
MICRO-15|Preserved the comparison schedule as a tagged PDF table with meaningful headers and exact values.
MICRO-17|Added both bases (30−10 and 50−30) and the common height (50−30), showing 2 × (1/2 × 20 × 20)=$400. Regenerated and hatched the two triangles distinctly.
MICRO-20|Preserved and retagged the production schedule, including row/column associations and exact values.
MICRO-21|Preserved and retagged the cost schedule; verified arithmetic and exact cells.
MICRO-22|Rendered AVC thick dashed, ATC dash-dot, MC solid and guides thin dotted. Defined AFC/AVC/ATC/MC and verified Q=400: ATC20, AVC12, AFC8.
MICRO-23|Preserved and retagged the productivity/cost schedule with exact values.
MICRO-28|Preserved and retagged the competitive-revenue schedule with exact values.
MICRO-32|Uses the same regenerated economic graph as MICRO-31. The shutdown/supply interpretation remains correct; no inferior stretched duplicate is retained.
MICRO-33|Removed assessment numbering and awkward parenthetical cues. Explained entry and exit naturally. Rebuilt the paired market/firm graph with complete labeled MC/ATC/AVC/price samples and a correct zero-profit equilibrium, shared with MICRO-35.
MICRO-34|Removed learner/meta and 'Graph analysis 13' language. Defined the three industry-cost cases and aligned the check with constant-cost supply.
MICRO-37|Corrected lowercase mr to MR in the warning and introduced the abbreviation in the core. Regenerated the clean monopoly diagram and checked the distinction between MR and demand.
MICRO-38|Generalized the interior output rule, qualified it with shutdown, and used the cleaner MICRO-37 figure. The relevant condition is MR crossing MC from above.
MICRO-39|Made (P - ATC) × Q explicit, including the previously overlooked Unicode-minus form. Checked quantity36, price42, ATC27 and profit540.
MICRO-40|Regenerated the monopoly/competition graph without stretching; rewrote the warning to distinguish surplus transfer from deadweight loss.
MICRO-42|Normalized WTP and defined willingness to pay; clarified the perfect-information limit of first-degree discrimination.
MICRO-44|Regenerated correct demand/ATC tangency and MR/MC crossing; restored canonical formatting and consistent acronym use. The illustrative point is Q36/P27 with zero economic profit.
MICRO-45|Regenerated the same mathematically consistent long-run model; distinguished zero profit, markup and excess capacity without implying efficiency.
MICRO-47|Consolidated overlap and rewrote the check around the value-of-variety versus cost/markup tradeoff.
MICRO-48|Simplified the example to concentration shares (70% for the largest two, 91% for A–D); explained the 9% 'Other' fringe. Removed the abrupt HHI calculation, which was not needed for this objective.
MICRO-49|Preserved the current unique-equilibrium payoff matrix as a tagged table with player/strategy headers and selectable ordered payoffs. Verified the unique Nash outcome remains A,X with payoffs (9,9).
MICRO-50|Preserved and retagged the payoff table; checked conditional comparisons and the conflict between individual incentives and cooperation.
MICRO-52|Regenerated the kink, two MR branches, discontinuity and MC line at native proportions. Replaced the unsupported parallel-pricing check with a taught cost change inside the MR gap.
MICRO-54|Restored the canonical template; introduced MSC, MPC, MSB and MPB where needed; regenerated the external-cost diagram and aligned private/social quantities.
MICRO-55|Restored the canonical template, defined repeated acronyms, and rendered vertical benefit summation legibly.
MICRO-56|Restored the canonical template and retained the established regulation concepts and example.
MICRO-58|Regenerated the preference/budget diagram. Generalized the best-affordable-bundle statement, explicitly limiting tangency to a smooth interior optimum; unconditional tangency would be incorrect for corner solutions.
MICRO-59|Restored canonical banner corners, icons, time/outcome strip, spacing and compact footer; rebuilt the Lorenz diagram and verified both Gini values.
MICRO-60|Restored the same canonical banner, icons, typography, cards and compact footer.
MICRO-61|Restored the same canonical banner, icons, typography, cards and compact footer.
MICRO-62|Restored the same canonical banner, icons, typography, cards and compact footer.
MICRO-63|Restored the same canonical banner, icons, typography, cards and compact footer.
MICRO-64|Restored the same canonical banner, icons, typography, cards and compact footer.
MICRO-65|Restored the same canonical banner, icons, typography, cards and compact footer; tightened framing to economically equivalent information.
MICRO-66|Preserved and retagged the voting-preference table; verified pairwise comparisons and agenda dependence.
MICRO-67|Preserved and retagged the social-choice criteria table; kept the task conceptual rather than requiring a proof.
'''

def main():
    out=contained(EVIDENCE)
    old={r['code']:r for r in read_json(out/'source_before.json')['reviews']}
    rows=read_json(SOURCE)['reviews'];current={r['code']:r for r in rows}
    sem=read_json(SEMANTICS)['pilot'];decisions=read_json(out/'decisions.json')
    validation=read_json(out/'validation/validation.json');active=read_json(out/'active_gate.json')
    regression=read_json(out/'regression/results.json');routing=read_json(out/'routing.json')
    review=read_json(out/'review.json');install=read_json(out/'installation.json')
    assert len(validation)==151 and all(r['passed'] for r in validation)
    assert len(active['records'])==151 and all(r['status']=='PASS' for r in active['records'])
    assert regression['passed']==regression['total']==27 and routing['count']==151
    assert len(review['records'])==151 and install['copies']==302
    fields=['core','recognition','watch','worked','check','outcome','workedLabel']
    changes={r['code']:[f for f in fields if r['content'].get(f)!=old[r['code']]['content'].get(f)] for r in rows}
    changes={k:v for k,v in changes.items() if v}
    field_count=sum(map(len,changes.values()));dc=sum(r['before']!=r['after'] for r in decisions)
    words=lambda records:sum(len(re.findall(r'\S+',str(r['content'].get(f,'')))) for r in records for f in fields)
    before,after=words(old.values()),words(rows)
    graphs=[r['code'] for r in rows if sem[r['code']].get('graphAlternative')]
    tables=[r['code'] for r in rows if sem[r['code']].get('tableRequired')]
    preserved=[c for c in graphs if sem[c].get('graphProvenance',{}).get('preservedAsset')]
    restored=['MACRO-'+n for n in ['43','44','45','46','50','51','53','54','56']]+['MICRO-'+n for n in ['54','55','56','59','60','61','62','63','64','65']]
    # One correction unit is one edited instructional field, changed difficulty,
    # regenerated graph, or specifically flagged template restoration.
    corrections=field_count+dc+len(graphs)-len(preserved)+len(restored)
    paths=sorted(set(subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()))
    write_json(out/'changed_files.json',paths)
    text=f'''# Final comprehensive concept-review QA and alignment report

Audit date: 2026-09-19. Baseline: `{BASELINE_COMMIT}`. Scope: **GEN-ECON 26, MACRO 57, MICRO 68 — 151 sheets**.

## 1. Executive summary

All 151 active concept-review sheets were inspected and rebuilt in the established template. Both repository delivery locations now contain the same validated bytes: **151 Composer PDFs and 151 public PDFs**. All **151 pass independent veraPDF PDF/UA-1 validation**, the source/semantic/font/asset gate, and the installed-release gate. All **27 active Composer regression runners pass**. Nothing was deployed or committed by this pass.

Inspection covered every source record and its core, recognition, warning, worked example, check, outcome and difficulty; both PDF copies; all **75 instructional graphs/diagrams and 23 tables**; semantic metadata, manifests, release evidence, renderer, font coverage, runtime paths and existing early template references. MICRO-49's legacy graph flag describes a table; it is counted once among the 23 tables, not as a 76th graph.

**{corrections} correction units** were completed: {field_count} edited instructional fields across **{len(changes)} sheets**, {dc} changed difficulty labels, {len(graphs)-len(preserved)} regenerated or repaired graph placements, and {len(restored)} explicitly flagged template restorations. These are reproducible work units, not a claim of {corrections} independent economic errors; one faculty finding can affect several fields. Existing sound/accessibly tagged material is recorded as verified, not falsely counted as a new correction. The other **{151-len(changes)} sheets retain their instructional fields**. The measured instructional text declined from {before:,} to {after:,} whitespace-delimited words ({(before-after)/before:.1%} shorter); local additions supply missing definitions, assumptions or scaffolding.

Changed paths are enumerated in [changed_files.json](changed_files.json) ({len(paths)} paths when this report was generated). Principal changes are the 302 PDFs, live source/semantics/manifest/releases, maintained review-graph assets, the canonical renderer's guarded final-pass path, Unicode font additions, build/economics checks, and this audit evidence. Historical question-bank assets and earlier audit snapshots were preserved. Econ-nections files were not changed.

## 2. Faculty audit corrections

All named items are accounted for below. A tagged, selectable PDF table is the practical semantic equivalent for this library's PDF delivery; replacing those tables with HTML inside the PDFs would not be a valid implementation.

| Sheet | Disposition |
| --- | --- |
'''
    for line in FACULTY.strip().splitlines():
        code,disposition=line.split('|',1);text+=f'| {code} | {disposition} |\n'
    text+='''
## 3. Additional issues found by the systematic review

- **Economic graph consistency:** GEN-ECON-21's rebuilt tax curves now pass through the existing worked values (100/$10.50 before; 60/$13.50 buyer/$7.50 seller after). MICRO-33's old illustration did not consistently put ATC at its claimed zero-profit price; the shared MICRO-35 model does. MICRO-44/45 now use cost functions whose marginal cost is the derivative of total cost, so demand/ATC tangency and MR=MC hold together at Q36. MICRO-59's Lorenz points produce the displayed Gini values .380 and .252. MACRO-12's production-function points match 28.53 and 36.37.
- **Unflagged rendering:** rebuilt additional demand, supply, PPF, trade, cost, welfare, externality, macro and exchange-rate figures whose labels became too small in old placements. The final graph review caught and repaired clipped paired-figure legends, crowded tick values and an overly long exchange-rate axis title. Main kinked-demand/MR branches now retain the same weight across their discontinuity.
- **Notation and definitions:** corrected an additional Unicode-minus profit expression in MICRO-39; defined repeated abbreviations in MACRO-19/32/36/49/50/51/52/55 and MICRO-4/22/28/29/30/32/35/42/44/54/55/57. Mathematical ε and × have real glyphs and Unicode mappings, plus spoken formula alternatives where tagged as Formula.
- **Scope and assumptions:** MACRO-29 specifies the limited-reserves model; MACRO-32 states multiplier assumptions; MACRO-41 separates percentages from percentage points; MACRO-42/46/52/55 state accounting conventions explicitly. MICRO-35 qualifies competitive efficiency, MICRO-38 uses the correct marginal-crossing condition, MICRO-58 allows corner solutions, and MICRO-65 requires equivalent information for framing.
- **Cognitive load:** removed overlapping cues in additional early and middle sheets; clarified GEN-ECON-08's point movement versus frontier shift; aligned MICRO-14 with consumer rather than unsupported total-surplus inference; removed an irrelevant tariff-revenue warning from MICRO-16's free-trade example; clarified MICRO-57's labor-market task. GEN-ECON-25 now supplies the quantities and rent calculation needed for its quota interpretation. Correct worked examples were otherwise retained.

The exact affected fields for every textual revision are recorded below and in [changes.json](changes.json). That JSON also records non-prose source changes such as difficulty and graph paths. [source_before.json](source_before.json) preserves the entire baseline for direct comparison.

| Sheet | Instructional fields revised |
| --- | --- |
'''
    for code,fs in sorted(changes.items()):text+=f'| {code} | {", ".join(fs)} |\n'
    text+=f'''
## 4. Complete graph audit

**{len(graphs)} graphs/diagrams inspected; {len(graphs)-len(preserved)} regenerated or repaired placements, {len(preserved)} sound assets retained.** MICRO-32 shares MICRO-31's clean graph; MICRO-38 shares MICRO-37's; MICRO-33 shares the zero-profit paired recipe with MICRO-35; MACRO-40 shares MACRO-39's clear symbolic diagram. Shared figures count as separate placements, not unique designs.

Poor source/render combinations were regenerated from explicit curve coordinates or economic functions. Native Matplotlib plots are exported at 216 dpi and placed proportionally at 320 points wide (or approximately 479.57 points for paired panels); graph text is 8.8 points at the native intended size. The layout gate rejects reduction below 8.5 points and rejects non-proportional dimensions for these rebuilt plots. Axis titles, ticks, legend samples, model intersections and economically meaningful shading were reviewed. Main curves use labels plus differing line styles where practical; welfare regions use hatching. No browser alt-text overlay was reproduced as graph content. There were no concept-sheet HTML/CSS graph containers to fix: the defects were in PDF graph generation/placement.

Every graph's active PNG path, decoded hash and alternative text are bound to its sheet's source/semantics. Regenerated model recipes are retained alongside the assets or in `final_qa_graphs.py` for shared/paired models. Existing question-bank illustrations were not overwritten. [layouts.json](layouts.json) records final placements; [validation/rendered_after](validation/rendered_after) contains every final page render.

| Sheet | Graph disposition | Alignment checked |
| --- | --- | --- |
'''
    for code in graphs:
        m=sem[code];p=m.get('graphProvenance',{})
        status=('Retained sound source asset' if code in preserved else 'Shared clean graph from '+p['reusedFrom'] if p.get('reusedFrom') else 'Regenerated from explicit model')
        text+=f'| {code} | {status} | Axes/curves, worked values, alternative text, proportions and final-page legibility |\n'
    text+=f'''
## 5. Accessibility audit

- **Semantic HTML tables created: 0.** These resources are downloadable single-page PDFs, not HTML worksheets. **All {len(tables)} tables use real PDF Table/TR/TH/TD structure**, row/column header associations and selectable cell text; they are not left as unexplained image-only tables. The visible table artwork is accompanied by semantically ordered text, with duplicate decorative artwork excluded from the reading sequence. Every prior table cell was preserved exactly.
- Tables checked: {', '.join(tables)}.
- **75 meaningful graph/diagram alternatives** checked; regenerated alternatives describe units, relationships and the worked result rather than merely naming an image. Retained alternatives were checked against their figures. The semantic tree exposes the instructional Figure and excludes decorative icons/banner/footer artwork as artifacts.
- MICRO-49's matrix retains both players' strategies and ordered payoffs; the unique Nash result A,X=(9,9) is unchanged. Other game/voting tables retain their exact cells and headers.
- All 151 documents have real structure, document language, headings, paragraph/list order, Unicode text, embedded fonts and source-bound semantic evidence. Formula speech covers notation that would be unclear as unpronounceable glyph sequences. ε and × were checked in extraction, font coverage and visible renders.
- Canonical colors/contrast were retained. Line styles, labeling and hatching supplement color in the rebuilt plots. Every page was rendered and visually reviewed; programmatic layout and reading-sequence checks supplement that review.
- **No human screen-reader or keyboard session was performed.** Independent PDF/UA validation and structural/visual review are strong evidence, but do not substitute for user testing with a particular assistive-technology/viewer combination. This limitation is recorded in the review receipt rather than represented as a completed AT test.

## 6. Difficulty-level audit — all 151 sheets

The existing dominant vocabulary is Beginner / Intermediate / Advanced; two legacy Foundational values were normalized to Beginner. The levels are based on the work demanded by the sheet, including the worked example and check: Beginner is direct recognition or a simple operation; Intermediate involves a structured application or linked distinction; Advanced integrates mechanisms, competing effects, multi-stage welfare or strategic reasoning. Levels are not quotas or topic rankings. Final distribution: {dict(Counter(r['after'] for r in decisions))}. GEN-ECON-22's applied burden interpretation is Intermediate; MICRO-36's barrier recognition is Beginner.

| Sheet ID | Original Difficulty | Final Difficulty | Changed? | Rationale |
| --- | --- | --- | --- | --- |
'''
    for r in decisions:text+=f"| {r['code']} | {r['before']} | {r['after']} | {'Yes' if r['before']!=r['after'] else 'No'} | {r['rationale']} |\n"
    text+=f'''
## 7. Formatting alignment

Canonical references were the clean early GEN-ECON-01, MACRO-01 and MICRO-03 sheets, with GEN-ECON-01 as the renderer reference. The restored design retains the navy hero, established rounded top treatment, title typography, time/hourglass and outcome/target icons, difficulty dots, teal section rules, section icons, rounded cards and compact footer. It does not introduce a new visual identity. The actual established reading order is Core Idea → How to Recognize It → Watch Out → Worked Example → Check Yourself.

Explicit faculty template restorations: **{', '.join(restored)}**. All other sheets were checked and rendered using the same component family; MICRO-44/45 also received consistent canonical treatment. MICRO-59–65 now use the same icons, hero corners, spacing and footer as the early sheets.

Body text remains 10.45 points on {sum(x["bodyFontSize"]==10.45 for x in read_json(out/"layouts.json"))} sheets, with controlled fitting on the remainder and a 9.5-point floor. Tables retain a 9.5-point floor. Slightly tighter internal title/body gaps support the one-page design; graph geometry is never stretched. All 151 final outputs remain one Letter-size page. The extra DIAGNOSE cards on MICRO-56/60–65 repeated concepts already taught in the canonical sections, so they were removed. The extra KEY RELATIONSHIPS cards on MACRO-46/53 repeated accounting and conversion rules retained in the main sections. MACRO-54's old card also included an approximate percentage-growth decomposition; that optional extension was deliberately omitted to keep the sheet focused on the level equation, basket comparison and opposite-direction applications requested by faculty. Its directional implications remain in recognition, and no current check requires that approximation. These are explicit scope/template choices, not silent deletions after a fit failure. No table cells or required instructional source fields were dropped to make a page fit.

## 8. Pedagogical and editorial alignment

The faculty table and field inventory document the specific edits. Redundancy was removed selectively rather than by a generic rewrite. Numeric recognition cues now require interpretation; checks use concepts taught by the sheet. Added prose supplies missing triangle dimensions, equation assumptions, acronym definitions, quotation units or the opposite direction of a change. MACRO-20/49 remain complementary, and MACRO-23 includes application without adding a catalog entry. Simplified open-economy relationships state their assumptions instead of invoking an unnamed course model.

All active source fields and extracted PDF text were scanned for course-specific/internal authoring debris, including 'this course', 'course model', 'course convention', 'course graphs', 'A learner', 'Graph analysis' and assessment numbering. The recursive directory scan found four source-file paths: three historical production snapshots, plus one non-rendered MACRO-55 instructionalEvidence.observedMisconceptions entry in the live source. The active rendered content and graph alternatives contain no such strings. See directory_language_scan.json and student_language_scan.json. Earlier immutable authoring/audit snapshots can still contain old strings; they are historical inputs, not active student content. Their preservation supports provenance and does not reintroduce those strings into delivered PDFs.

Institutional details checked against primary sources: employment status and the four-week search/temporary-layoff rules follow [BLS definitions](https://www.bls.gov/cps/definitions.htm); the May-2020 savings-deposit reclassification follows [Federal Reserve H.6 technical notes](https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm); ample-reserves implementation follows the [Federal Reserve's implementation explanation](https://www.federalreserve.gov/econres/notes/feds-notes/implementing-monetary-policy-in-an-ample-reserves-regime-the-basics-note-1-of-3-20200701.html). These checks supported retaining correct current material rather than inventing changes.

## 9. Validation results and reproducibility

| Check | Result | Evidence |
| --- | --- | --- |
| Catalog count, distinct IDs and collection partitions | 151; 26/57/68; no new or duplicate IDs | tests.log; source and manifest |
| Independent PDF/UA-1, ISO 14289-1:2014 | 151/151 PASS, veraPDF 1.28.2 | validation/verapdf.json; final_recheck/verapdf.json; symbolic_recheck/verapdf.json; validation/validation.json |
| Source text, semantic reading order, formulas, fonts, graph identity | 151/151 PASS; no project errors | validation/transcripts/ |
| One-page dimensions, content regions and placement | 151/151 PASS | layouts.json; validation/validation.json |
| Final page renders and graph review | All 151 pages and 75 graphics reviewed, including repaired versions | review.json; validation/rendered_after/ |
| Economics and negative guard tests | 13/13 PASS | tests.log |
| Installed copies and evidence binding | 151/151 PASS; 302 synchronized PDFs | active_gate.json; installation.json |
| Local public routing/assets and unsafe-path rejection | 151/151 PASS | routing.json |
| Active Composer regression runners | 27/27 PASS | regression/results.json and individual logs |

No broken local PDF routes, missing active images, duplicate IDs, missing graph associations, overflowing document regions, missing required alternatives, or unresolved PDF/UA failures were found in the final outputs. No HTML worksheet files were changed. Existing Composer web behavior is covered by its active regression suite. These fixed-page PDFs preserve their proportions under viewer zoom; this audit does **not** claim that Letter-size PDFs reflow like responsive HTML. No live-site deployment or network link crawl was performed.

The install was transactional and required exact candidate hashes, current source/semantic hashes, the independent report and a byte-bound visual/semantic review receipt before either copy was replaced. The release field `contentPreservationPassed` means that content matches the explicitly authorized final-pass changes and preserved tables; it does not claim every word is unchanged from the old PDFs. The aggregate validation file references the original full-batch report plus targeted final rechecks for changed candidates; each installed release points to its own exact report and hash. A rationale-only metadata correction for MACRO-03 was followed by a fresh semantic inspection of all 151 unchanged candidate bytes (rationale_metadata_refresh.json). The raw validation records' PENDING review placeholders are superseded by the hash-bound `review.json` receipt referenced by installed release evidence; assistive-technology testing remains not performed.

Rebuild from the repository root with the existing bundled Python, Pillow, ReportLab, pypdf and NumPy, plus **matplotlib 3.11.2 and fonttools 4.65.0**. `final_qa_build.py` restores immutable baseline inputs from the commit named above if scratch inputs are absent, applies explicit guarded edits, regenerates assets, writes staged PDFs and validates source/layout/tag coverage. `final_qa_fonts.py` builds the small missing-symbol extension using the retained font license and canonical font metrics. `test_final_qa.py` verifies the economic models and rejects stale source, stale assets, graph shrinkage and stretching. The independent validation is `validate_candidates.validate(staged_rows, evidence_directory)`. Installation remains `install_validated.prepare(..., scope='both')` followed by `materialize(...)`, with a freshly completed byte-bound review required after any rebuild. Do not reuse a review receipt for changed PDF bytes.

The new economics tests include the gas imbalance, tax wedge, both trade triangles, average/marginal-cost identities, monopoly profit, tangency/total-cost derivative consistency, Lorenz/Gini calculations, quantity-equation and exchange-rate arithmetic, exact table preservation, unique Nash outcome, notation/portability scans and negative source/layout guards. Historical tests pinned to earlier immutable content snapshots were not rewritten to bless the new content; the forward active suite and final-pass checks were used.

## 10. Remaining concerns

No unresolved economics, graph or formatting defect is known from this pass. The difficulty labels remain pedagogical judgments: the report supplies a task-specific rationale for every sheet so faculty can adjust intended transfer demands explicitly. The meaningful implementation differences from the faculty wording are documented: semantic PDF tables instead of HTML, no added/split IDs, a single-bank capital focus for MACRO-20, conditional interior tangency in MICRO-58, and retention of the already-correct AS distinction.

Human assistive-technology testing and live deployment verification remain outside the completed checks. Native-page and enlarged-view PDF inspection passed; a particular screen-reader/browser/mobile PDF viewer can still merit user testing. No unresolved ambiguity was concealed by inventing a new instructional objective.
'''
    (out/'FINAL_REPORT.md').write_text(text,encoding='utf-8')
    print('Report written:',out/'FINAL_REPORT.md')

if __name__=='__main__':main()
