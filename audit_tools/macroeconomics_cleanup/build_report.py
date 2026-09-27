"""Assemble the cleanup report only from the frozen baseline and final evidence."""
from author import *
import hashlib,collections,datetime,shutil

def read(name):return json.loads((WORK/name).read_text(encoding='utf8'))
baseline=load('baseline.json',{})
approved=read('expected_changes.json');summary=read('application_summary.json')
verification=read('implementation_verification.json');publication=read('publication.json')
economic=read('economic_verification.json');exports=read('export_checks.json');companions=read('companion_exports.json')
visual=read('visual_review.json')
source=ROOT/'build/faculty-build-composer/data/composer_library.js'
sourcehash=hashlib.sha256(source.read_bytes()).hexdigest()
assert sourcehash==verification['sourceSha256']==economic['sourceSHA256']==exports['sourceSHA256']
assert visual['pdfSHA256']==exports['pdfSHA256']==hashlib.sha256((ROOT/'faculty_exports/macroeconomics_question_bank.pdf').read_bytes()).hexdigest()
assert visual['status']=='PASS'
suite=(WORK/'active_suite_final.log').read_text(encoding='utf8')
assert '"passed": 29' in suite and '"failed": []' in suite
tests=(WORK/'exporter_tests.log').read_text(encoding='utf8')
assert 'Ran 14 tests' in tests and 'OK' in tests
assert not publication['newOmissions'] and all(m['ok'] for m in publication['modes'])
for k in ['csv_mismatches','structure_errors','pdf_blank_pages','pdf_replacement_characters','pdf_bounds_errors','pdf_render_errors','pdf_answer_marker_errors','pdf_split_cores','pdf_missing_image_pages','pdf_link_errors']:assert not exports[k],(k,exports[k])
assert exports['pdf_id_order_matches'] and exports['records']==exports['csv_rows']==exports['csv_unique_ids']==exports['pdf_question_ids']==4745
assert all(not c['mismatches'] and c['count']==c['rows']==c['unique'] for c in companions.values())
assert set(approved['changedQuestionIds'])<=ALLOWED and len(ALLOWED)==2179

current=json.loads(source.read_text(encoding='utf8').removeprefix('window.MQ_COMPOSER_LIBRARY=').strip().removesuffix(';'))
now={}
for concept in current['concepts'].values():
    for rows in list(concept.get('questions',{}).values())+[concept.get(k,[]) for k in ['repairQuestions','repairSeedQuestions','bridgeQuestions']]:
        for x in rows:now[str(x['id'])]=x
findings_by_id=collections.defaultdict(list)
for f in AUDIT:
    for id in f['affectedQuestionIDs']:findings_by_id[id].append(f['findingID'])
notes=load('decisions.json',{});difficulties=load('difficulty_decisions.json',{});stage=load('checkpoint_stage_contract.json',{})
routeids={r['id'] for r in approved['routing']};moves={r['id']:r for r in approved['moves']}
def differs(c,fields):return any(k in c['fields'] for k in fields)
changes=[]
for c in sorted(approved['changes'],key=lambda c:c['id']):
    id=c['id'];old=RECORDS[id]['q'];new=now[id]
    oldkey=old['options'][RECORDS[id]['answer']];newkey=PATCHES[id].get('$correct',oldkey)
    assert newkey in new['options']
    flags={
        'stemChanged':differs(c,['q']), 'optionsChanged':differs(c,['options']),
        'keyChanged':oldkey!=newkey,'answerHashChanged':differs(c,['aHash']),
        'feedbackChanged':differs(c,['feedback']),
        'difficultyChanged':differs(c,['difficulty','canonicalDifficulty']),
        'typeChanged':differs(c,['type']), 'commonErrorChanged':differs(c,['commonError']),
        'skillObjectiveChanged':differs(c,['skill','skillId','objective','objectiveId','primarySkill','primarySkillId','repairSkill','microSkill','microSkillId','learningObjectiveId']),
        'imagePathChanged':differs(c,['image']),
        'imageAccessibilityChanged':differs(c,['imageAlt','graphDescription','graphRequired']),
        'routingChanged':id in routeids or id in moves or differs(c,['primaryConceptId','conceptId','subtopicIds','familyConceptId','repairSkill'])}
    changes.append({**c,'findingIDs':findings_by_id[id],**flags,'oldKey':oldkey,'newKey':newkey,
                    'poolMove':moves.get(id),'conceptRoute':next((r for r in approved['routing'] if r['id']==id),None),
                    'decisionNotes':notes.get(id,[])})

strategies={
'A':'Correct the exact economic claim and all dependent text: visible basket denominator, unemployed exit origin, limited labor-market inference, M1 composition, or standalone supply shock.',
'B':'Four parallel answer choices; remove length/qualification cues without padding or replacing economics with obvious absolutes.',
'C':'Replace role/stage task types with underlying operations; replace generic misconceptions with the final wrong inference; apply the six exact specialist/support route changes.',
'D':'Review the final task operation against the existing difficulty vocabulary; retain defensible labels and move changed ordinary records to corresponding storage pools, without filling mode quotas.',
'E':'Strengthen the exact answer sets using plausible errors in index selection, nominal/real reconciliation, ratios or transmission; recompute the intended answer.',
'F':'Replace recognition-only checkpoints with competing mechanisms, constrained policy comparisons, reverse inference, mixed ledgers, or short/long-run comparisons; retain checkpoint roles and runtime stage routing.',
'G':'Keep the repair skill and add one bounded application: recompute a ledger, reverse a familiar relation, or infer an endpoint under a stated assumption.',
'H':'Keep one baseline money-supply contraction graph reading; differentiate the other five by countershocks/observed outcomes and compare fixed-nominal versus indexed lending in LG-Q-9119.',
'I':'Explain this item\'s actual inputs and requested outcomes, including both opposing channels and the instructor-approved total AD offset.',
'J':'Use the registered concept-qualified runtime image path and descriptive accessibility fields; retain every original asset byte.',
'L':'Implement the explicit instructor direction, retaining historical conventions outside the named current-framework items.'}
validation_methods={
'A':'Visible-input equations, final key and explanation review, production-normalized hash check, current export parity.',
'B':'Final answer-set review and existing construction signals scoped only to revised choices; nine semantic keyword signals reviewed and retained.',
'C':'Exact before/after fields, task-content review, taxonomy/outcome and support-reference tests; protection of every prior approved record.',
'D':'715 per-ID final-task decisions; exact ordinary-pool moves; before/after availability for 89 selections; no quota-driven inflation.',
'E':'Recomputed numeric results where applicable; four distinct options and one production-resolved answer; scoped construction review.',
'F':'Per-ID before/after tasks, family-level operation changes, additional 73-item context/differentiation pass, checkpoint/Legendary tests and publication.',
'G':'Repair-versus-bridge pairing in existing skill routes; one transfer operation and no unrelated specialist routing; support consumer tests.',
'H':'Seven exact IDs compared with their baseline; five graph comparisons/constraints and one indexed-contract comparison; keys and visuals checked.',
'I':'Final feedback compared to visible inputs, requested comparison and saved calculations; exporter content verification.',
'J':'Asset SHA256 protection, registered path match, runtime embedding, all-page PDF checks and visual inspection of every one of the 14 targets.',
'L':'Instructor values and model convention checked; Federal Reserve primary sources confirm administered-rate implementation and current M1 scope.'}
closures=[];families=[]
specialists=[r['id'] for r in approved['routing'] if r['kind']=='specialist-checkpoint']
for f in AUDIT:
    cat=f['category'];ids=f['affectedQuestionIDs']
    closure='ACCEPTED / INSTRUCTOR-ADJUDICATED' if cat=='L' else ('RESOLVED' if cat in ['A','B','E','I','J'] else 'RESOLVED BY CONSOLIDATED REVISION')
    basis=strategies[cat]
    sub=[]
    if f['findingID']=='MAA-0113':
        basis+=' The five transferred specialist scaffolds are NOT APPLICABLE AFTER ROUTING/REVISION for the integrated-content complaint; the other exact targets receive substantive integrated revisions.'
        sub=[{'affectedQuestionIDs':specialists,'closure':'NOT APPLICABLE AFTER ROUTING/REVISION','basis':'Accurate specialist placement replaces the artificial integrated placement.'}]
    if cat=='L':basis+=' RESOLVED BY INSTRUCTOR DIRECTION.'
    closures.append({'findingID':f['findingID'],'category':cat,'affectedQuestionIDs':ids,'closure':closure,'basis':basis,'validationMethod':validation_methods[cat],'subgroupClosures':sub})
    families.append({'family':f['familyID'],'findingIDs':[f['findingID']],'exactAffectedQuestionIDs':ids,'originalPattern':f['issue'],'revisionStrategy':strategies[cat],'validationMethod':validation_methods[cat],'changedIDs':[i for i in ids if i in approved['changedQuestionIds']],'reviewedRetainedIDs':[i for i in ids if i not in approved['changedQuestionIds']]})

retained=sorted(ALLOWED-set(approved['changedQuestionIds']))
exceptions=[
 {'id':'EX-1','kind':'pre-existing publication omission','questionIDs':publication['unchangedLegacyUnpublishedIds'],'basis':'The same two support records were absent from the pre-cleanup student publication. Both remain in the canonical bank and faculty export; no new omission was introduced. Engine/publication redesign is outside this exact content cleanup.'},
 {'id':'EX-2','kind':'mode inventory after honest difficulty alignment','selections':verification['newModeShortages'],'basis':'41 concept/preset selections have 93 newly unavailable selection/mode combinations. Full Macro validates all ten modes. The existing availability checks expose the smaller selections; no question was promoted to satisfy a quota.'},
 {'id':'EX-3','kind':'checkpoint stage versus independent task demand','questionIDs':sorted(stage),'basis':'For existing checkpoint records, canonicalDifficulty also selects the encounter stage. Preserve that runtime convention and instructionalRole/challengeStage; do not interpret the label as an independently certified difficulty rating. The separate authored-demand ledger records the distinction. No adaptive or stage-selection logic was changed.'},
 {'id':'EX-4','kind':'reviewed construction signals','signals':economic['constructionFlags'],'basis':'Nine remaining keyword/semicolon signals describe the actual conditional economics. They are review signals rather than demonstrated cue defects; all length signals in the revised option sets are cleared.'}
]
status='CLEANUP STATUS: COMPLETE WITH DOCUMENTED EXCEPTIONS — READY FOR READ-ONLY VERIFICATION'
evidence_dir=ROOT/'validation_artifacts/macroeconomics_consolidated_cleanup';evidence_dir.mkdir(exist_ok=True,parents=True)
for name in ['application_summary.json','implementation_verification.json','publication.json','mode_inventory.json','economic_verification.json','export_checks.json','companion_exports.json','visual_review.json','active_suite_final.log','exporter_tests.log','export_final.log','revised_choice_flags_final.json']:
    shutil.copyfile(WORK/name,evidence_dir/name)
fieldcounts={k:sum(c[k] for c in changes) for k in changes[0] if k.endswith('Changed')}
ledger={'schemaVersion':'1.0.0','mode':'CONSOLIDATED CLEANUP IMPLEMENTATION — NOT FINAL READ-ONLY VERIFICATION','status':status,
 'baseline':baseline,'after':{'sourceSHA256':sourcehash,'libraryContentSHA256':current['librarySha256'],'counts':summary['countsAfter'],'globalCanonicalIDs':9779},
 'exactActionScope':sorted(ALLOWED),'changedCanonicalIDs':approved['changedQuestionIds'],'changedCount':len(changes),
 'reviewedRetained':[{'id':i,'findingIDs':findings_by_id[i],'difficultyDecision':difficulties.get(i),'decisionNotes':notes.get(i,[])} for i in retained],
 'fieldChangeCounts':fieldcounts,'changes':changes,'findingClosures':closures,'familyChangeLedger':families,
 'difficultyDecisions':difficulties,'checkpointStageContract':stage,'routingDecisions':approved['routing'],'outcomeMoves':approved['outcomeMoves'],
 'contextDifferentiation':load('context_differentiation.json',{}),'constructionReview':load('choice_construction_review.json',[]),
 'numericalEconomicVerification':economic,'validation':verification,'publication':publication,'exportVerification':exports,'visualReview':visual,'exceptions':exceptions}
out=ROOT/'faculty_exports/audits';out.mkdir(exist_ok=True,parents=True)
(out/'macroeconomics_consolidated_cleanup_changes.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

lines=['# Macroeconomics Consolidated Cleanup','',status,'',
 'This is the implementation and validation of the existing 134-finding audit. It is not the subsequent independent final read-only verification. No FINAL PASS is declared.','',
 '## 1. Starting Baseline','',
 f"The immutable audit matches Git `{baseline['ref']}` and source SHA256 `{baseline['sourceSHA256']}`. The final source-file SHA256 is `{sourcehash}`; the Composer content fingerprint is `{current['librarySha256']}`. These are different hash domains.",'',
 'The exact affected-ID union is 2,179. This pass changed 2,123 canonical records and reviewed/retained 56. Related/comparison IDs did not expand scope. All 6,623 records in the General/Micro union are exactly unchanged, including prior keys, text, metadata and placement. The four original Macro audit files and 502 distinct asset files (506 protected files in total) match their saved hashes. No image bytes were altered.','',
 'All exact before/after field values, keys, route changes, per-field flags, finding arrays and family strategies are in [the machine-readable change ledger](macroeconomics_consolidated_cleanup_changes.json). Supporting evidence is in [the validation directory](../../validation_artifacts/macroeconomics_consolidated_cleanup/).','',
 '## 2. Instructor Adjudications','',
 '| Finding | Exact action | Closure |','|---|---|---|',
 '| MAA-0032 | LG-Q-9 and LG-Q-2004 now use ample reserves, administered rates and the FOMC target range; distinguish the Board’s IORB implementation role. | ACCEPTED / INSTRUCTOR-ADJUDICATED |',
 '| MAA-0093 | PM2D2-MULT-L-001, PM2D2-MULT-L-002 and ECON-SP-HARD-230 explicitly define crowding out as a total AD reduction after induced effects; subtract it once after multiplying purchases. | ACCEPTED / INSTRUCTOR-ADJUDICATED |',
 '| MAA-0111 | ECON-SP-EASYBOSS-2002 uses current M1 = 900+1,100+1,500 = 3,500 and M2 = 4,000, with refreshed options/key/feedback/hash and specialist routing. | ACCEPTED / INSTRUCTOR-ADJUDICATED |','',
 'The two institutional conventions agree with the Federal Reserve’s [IORB explanation](https://www.federalreserve.gov/monetarypolicy/iorb-faqs.htm) and [H.6 technical definitions](https://www.federalreserve.gov/releases/h6/h6_technical_qa.htm). The selected current-framework changes do not globally convert historical/simplified monetary questions. LG-Q-2002 explicitly retains the pre-May-2020 convention.','',
 '## 3. Economic Validity / Ambiguity','',
 '- P52A-CPI-LB-002 retains every visible basket price: costs 100, 122, 131; current CPI 122; next-year inflation (131−122)/122×100 = 7.377…%, approximately 7.4%.',
 '- ECON-NL-LEGENDARYBOSS-9124 explicitly takes all six million labor-force exits from the remaining unemployed. Final employment is 154 million, unemployment 2 million, LF 156 million, UR approximately 1.28%.',
 '- P52B-S4-IEA-L-001 separates approximate real growth from a lower measured unemployment rate; employment/participation evidence is insufficient for an unconditional labor-market-strengthening claim.',
 '- ECON-SP-DISTINGUISH-M1-M2-6001 distinguishes unchanged initial M1 total from changed currency/checking composition before subsequent lending.',
 '- ECON-SP-FINALBOSS-4004 identifies its own adverse supply shock and no longer depends on another randomly selected question.','',
 '## 4. Advanced / Boss Revisions','',
 'All 654 exact Class-F targets in 42 families were handled coherently with overlapping findings. Checkpoint roles remain intact. Operations now include mixed GDP ledgers, index/denominator diagnosis, employment-component reconciliation, liquidity versus solvency, target/reverse multiplier inference, competing monetary channels, policy lags, expectations adjustment, and open-economy identities versus behavioral responses.','',
 'The final implementation review removed inert numerical context from 73 checkpoints and changed 48 repeated forms into different counterfactuals, reverse inferences or causal diagnoses. For example, productivity forms distinguish complementary skills, skilled emigration, organizational improvements and hours versus output; Phillips forms distinguish anticipated demand, persistent expectations and changed natural-rate estimates. The exact 73 IDs and 48 substantive variants are recorded in `contextDifferentiation`. There are no exactly repeated revised Class-F stems. The five specialist scaffolds have the permitted routing-based disposition for the integrated-content complaint.','',
 '## 5. Repair → Bridge Revisions','',
 'All 84 Class-G bridges retain their repair skill and add one bounded transfer operation. The GDP route mismatch is fixed first: ECON-NL-INVENTORY-INVESTMENT-5011 moves to budget-accounting-and-public-saving / distinguish_purchase_transfer. ECON-NL-IMPORTS-EXPORTS-NX-6004 remains in the imports skill and now applies imported spending with its NX offset. Consumer-reference checks confirm the exact repaired routes.','',
 '## 6. Redundancy Revisions','',
 'The seven Class-H IDs are covered. One original money-supply contraction graph reading remains as the baseline; five affected companions add a countershock, reversal, observed-rate inference or constrained transmission comparison. LG-Q-9119 compares fixed-nominal and fully indexed loans: approximately −1% versus 6% real return with 11% realized inflation, identifying the different exposure to the surprise.','',
 '## 7. Difficulty Reclassification','',
 f"The 715 Class-D records have per-ID final-task decisions; {len(approved['moves'])} ordinary storage moves align the changed labels with their pools. Checkpoint-challenge supplemental records retain their publication-eligible storage while their reviewed canonical tier can change. Labels were not raised to protect mode quotas.",'',
 'The existing checkpoint contract uses canonicalDifficulty to select opening/middle/final/Legendary encounters. Its stage-coded labels were preserved rather than changing engine behavior. The separate checkpoint-demand ledger records this distinction; these labels are not a claim of independent difficulty certification. See EX-3.','',
 '## 8. Answer-Choice Revisions','',
 'The 12 Class-B and 11 Class-E target sets use four distinct, parallel options with plausible errors. Construction review was also applied to all 767 revised answer sets. A focused 206-record choice revision removed the demonstrated length/structure problems in 89 groups; subsequent task differentiation received the same check. No revised-key length flag remains. Nine conditional-language/semicolon signals were manually retained because they express the tested economics, with concise substantive alternatives; their exact IDs and rationale are in EX-4.','',
 '## 9. Metadata / Routing','',
 'The 1,153 Class-C targets were reviewed against final content. Role/stage-like task types map to underlying operations, instructional roles/stages/provenance remain separate, the 508 generic misconception targets identify actual wrong inferences, and interpretation/application labels track what students do. No Class-K maintenance sweep was performed.','',
 '| ID | Final specialist concept |','|---|---|']
for r in approved['routing']:lines.append(f"| {r['id']} | {r['to']} |")
lines += ['', 'Taxonomy, objective coverage and micro-skill references are refreshed consistently. The frozen original sourceType and source provenance are retained.','',
 '## 10. Feedback','',
 'All 29 exact Class-I targets explain the final item. Truncated GDP explanations are completed; real/nominal values and sacrifice ratios use actual inputs; opposing mechanisms both appear; fixed-money-supply feedback describes money-demand shifts; crowding-out feedback subtracts the instructor-defined total offset once. Other feedback changes are confined to authorized substantive revisions.','',
 '## 11. Image Path / Accessibility','',
 'All 14 MAA-0127 IDs use registered concept-qualified runtime paths with imageAlt, graphDescription and graphRequired where appropriate. Accessibility text describes visible axes, curves and labels without adding the answer. All 14 embed in the generated student publication and were visually inspected in the regenerated PDF. The graph files are byte-identical to baseline.','',
 '## 12. Numerical / Economic Verification','',
 f"Recomputed {economic['expressionsRecomputed']} equations for {economic['calculationCases']} revised tasks, plus {economic['additionalNumericLookingKeyChecks']} additional visible-value, accounting-scope or labeled-model checks. Per-ID equations, actual results and interpretation are in `numericalEconomicVerification`. Numeric-looking labels such as M1 and Y1 are distinguished from arithmetic inputs.",'',
 'Checks cover GDP entries/value added/import offsets, nominal-real ratios and deflators, CPI baskets/indexation, employment/LF/UR, productivity and growth, saving/debt identities, bank capital/reserves/deposits, M1/M2, quantity theory/Fisher relations, multiplier targets/total offsets, Phillips expectations and sacrifice ratios, NX/NCO and exchange quotations. Saved equations replay arithmetic and are paired with visible-input/model review; this is implementation evidence, not a formal proof or the reserved independent final verification.','',
 '## 13. Validation Results','',
 '| Check | Result |','|---|---|',
 '| Existing active Composer suite | 29 / 29 pass |',
 '| Exporter tests | 14 / 14 pass |',
 '| Canonical identity, aliases and one normalized answer | 9,779 IDs pass; 149 concepts |',
 '| Prior General/Micro approved state | All 6,623 union records unchanged |',
 '| Protected original audit/assets | 506 hashes unchanged |',
 '| Exact changed-ID adapter | Frozen baseline + 2,123-ID whitelist + exact current fields/placements pass |',
 '| Modes | 89 selections compared; full Macro all 10 supported modes pass |',
 '| Publication JS | Generated inline JavaScript compiles |','',
 'Historical fixtures use the established approved-state adapter pattern. The prior General/Micro adapter still validates the immutable pre-Macro source; the Macro layer applies only recorded before/after fields and exact placements. No failure is suppressed, and no regression assertion is replaced with live-source expectations.','',
 '## 14. Projection Counts','',
 '| Projection | Before | After |','|---|---:|---:|',
 '| General | 1,589 | 1,589 |','| Micro | 6,301 | 6,301 |','| Macro | 4,745 | 4,745 |','| Global canonical union | 9,779 | 9,779 |','',
 'Specialist moves occur within Macro. Membership sets, not just totals, match baseline.','',
 '## 15. Student Publication','',
 'Macro membership is 4,745. The current and prior student publications each contain 4,743 unique IDs, including 2,121 revised IDs. The same two support IDs remain omitted; there are zero new omissions. All production answer hashes resolve, all 14 corrected graph records embed, and standard/timed/exam/quiz/unlimited/legendary/score/trialGraph/fadingFortune/riskReward validate. The two retained omissions are listed in EX-1.','',
 '## 16. Export Verification','',
 f"The normal exporter regenerated all three CSV/PDF pairs. Macro CSV has 4,745 unique rows, {exports['csv_columns']} schema columns and zero canonical field mismatches. General and Micro companion CSVs also match their current canonical projections with zero mismatches.",'',
 f"Macro PDF contains all 4,745 IDs once and in exporter order across {exports['pdf_pages']:,} pages. Existing exporter verification matches every stem, option, key and feedback. Every page renders; there are zero blank pages, out-of-page text bounds, replacement characters, split question cores, answer-marker errors or missing-image question pages. All {exports['pdf_links']:,} navigation links resolve and the document has {exports['pdf_outline_entries']} outline entries.",'',
 f"Visual review covered {len(visual['reviewedPages'])} final PDF pages, including the CPI correction, both Fed items, current M1, all three adjudicated crowding-out items, checkpoint/bridge representatives and all 14 corrected image-path records. The reviewed page list, screenshots and current PDF hash are bound in `visualReview`. General/Micro companions were regenerated normally; their question content is unchanged.",'',
 'Pagination detail: 43 metadata blocks begin on the page before their intact question core. Required samples include the following page when applicable. This normal exporter behavior is retained; it does not split the stem/graph/options/key core.','',
 '## 17. Remaining Exceptions','',
 '**EX-1 — Pre-existing publication omissions.** ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052 remain in the canonical bank and faculty exports but absent from student publication, exactly as before. There is no new omission.','',
 '**EX-2 — Small-selection mode inventory.** Honest difficulty alignment exposes 93 newly unavailable selection/mode combinations across 41 selections. This is distinct from full Macro, which passes all modes. The existing availability checks identify the shortages; no quota-based promotion or engine change was made. Exact before/after counts and validation messages are in `mode_inventory.json`.','',
 '| Selection | Newly unavailable modes |','|---|---|']
for s in verification['newModeShortages']:lines.append(f"| {s['id']} | {', '.join(s['modes'])} |")
lines += ['', '**EX-3 — Checkpoint stage contract.** Runtime checkpoint labels double as encounter selectors. Preserve that existing contract; independent task-demand estimates are recorded separately. Reworking that coupling would require an explicitly scoped Composer change.','',
 '**EX-4 — Reviewed editorial signals.** Nine keyword/semicolon flags remain because conditional reasoning is central to the question. None is a remaining length flag; the exact signal, answer and review basis are preserved for independent verification.','',
 'These are disclosed limitations, not suppressed failures. All 134 original findings receive an explicit disposition below. No new instructor approval is needed for the three already-adjudicated groups.','',
 '## 18. Complete Finding Closure Table','',
 'The exact arrays below are the authoritative affected IDs, not related comparison records. The machine ledger also supplies each family’s original pattern, revision strategy and validation method.','',
 '| Finding | Category | Affected IDs | Closure | Basis |','|---|---|---|---|---|']
for c in closures:lines.append('| '+' | '.join([c['findingID'],c['category'],', '.join(c['affectedQuestionIDs']),c['closure'],c['basis'].replace('|','/').replace('\n',' ')])+' |')
lines += ['', '## 19. Final Cleanup Status','',
 'Canonical changes, metadata refresh, implementation validation, student publication, normal faculty exports and complete finding/per-ID/family ledgers are finished. The next workflow step is the separate independent read-only Macro verification; it has not been started here.','',status,'']
(out/'macroeconomics_consolidated_cleanup.md').write_text('\n'.join(lines),encoding='utf8')
print(json.dumps({'status':status,'changed':len(changes),'reviewedRetained':len(retained),'closures':len(closures),'families':len(families),'fieldCounts':fieldcounts,'sourceSHA256':sourcehash},indent=2))
