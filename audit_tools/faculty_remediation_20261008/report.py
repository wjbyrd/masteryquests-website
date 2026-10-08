from pathlib import Path
import json,csv,hashlib,collections
D=Path(__file__).resolve().parent;R=D.parents[1];O=R/'faculty_exports/audits'
read=lambda n:json.loads((D/n).read_text(encoding='utf8'))
items=read('dispositions.json');ledger=read('expectations.json');tests=read('test-results.json');validation=read('validation.json');pub=read('publication-validation.json');exports=read('export-validation.json')
sourcehash=hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert len(tests)==36 and all(t['status']=='PASS' and t['sourceSha256']==sourcehash for t in tests)
assert validation['status']==pub['status']==exports['status']=='PASS';assert exports['sourceSha256']==sourcehash
assert read('scope-validation.json')['status']=='PASS' and len(read('scope-validation.json')['checks'])==44
assert read('exporter-test-results.json')['status']=='PASS' and read('exporter-test-results.json')['tests']==25
for p,h in read('frozen_evidence.json').items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h
with (O/'faculty_validation_remediation_20261008.csv').open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
assert len(rows)==184 and {r['Question ID'] for r in rows}=={c['id'] for c in items}
assert sum(r['Original wording flag']=='Yes' for r in rows)==55
assert sum(r['Original difficulty flag']=='Yes' for r in rows)==13
assert sum(bool(c.get('facultyResponse',{}).get('notes','').strip()) for c in items)==68
for c,row in zip(items,rows):
 assert row['Original stem']==c['before']['q'] and row['Revised stem']==c['after']['q']
 assert row['Direct faculty note or related pattern']==(c.get('facultyResponse',{}).get('notes') or c.get('patternSeed') or '')
changes=ledger['changes'];direct=[c for c in changes if c['source']=='direct sample'];pattern=[c for c in changes if c['source']=='cross-bank pattern']
feedback=sum('feedback'in c['fields'] for c in changes);economic=sum(c['economicContentChanged'] for c in changes)
tiers=[c for c in changes if 'canonicalDifficulty'in c['fields']]
dispositions=collections.Counter(c['disposition'] for c in items)
assert not dispositions['NEEDS FACULTY DECISION'];assert len(direct)==65
summary={'status':'PASS','directCorrections':len(direct),'microOnlyPatternCorrections':sum(c['areas']==['micro'] for c in pattern),'macroOnlyPatternCorrections':sum(c['areas']==['macro'] for c in pattern),'sharedPatternCorrections':sum(len(c['areas'])>1 for c in pattern),'sharedCorrectionsAllSources':sum(len(c['areas'])>1 for c in changes),'difficultyChanges':len(tiers),'facultyClassifiedSubstantiveRepairs':2,'additionalMissingCaseRepairs':6,'approvedContentEnhancements':1,'economicContentOrAssumptionsTouched':economic,'feedbackCorrections':feedback,'unresolvedDecisions':0,'totalEdited':len(changes),'reviewedLedgerRows':len(items),'dispositions':dict(dispositions),'composerRunners':len(tests),'exporterTests':25,'graphAssetsUnchanged':520,'librarySha256':ledger['afterLibrarySha256'],'sourceSha256':sourcehash}
(D/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
lines=['# Faculty validation remediation — 8 October 2026','',
'**PASS.** The 300-question faculty review has been reconciled with the canonical banks. This pass changed 175 distinct questions: 65 direct corrections and 110 closely related pattern corrections. Both faculty-classified substantive defects have been repaired. No faculty decision remains open.','',
'The execution CSV contains 184 reviewed records, including every one of the 69 sample records with a non-PASS assessment, flag, or note. Its before/after text, exact original notes and flags, dispositions, answer positions, course memberships, and reasons provide the item-level record. The other 231 sample records were PASS without flags or notes and were not changed in Phase A. Two of them also matched the targeted Phase B search: 42349 received only compact labor notation, and P62D-ITP-L-087 was retained. Their original PASS assessments remain recorded.','',
'[Execution CSV](faculty_validation_remediation_20261008.csv) · [Reusable faculty-voice guide](faculty_voice_crossbank_guide_20261008.md)','',
'## Counts','',
'| Measure | Count |','|---|---:|',
f'| Direct faculty-note corrections | {len(direct)} |',
f'| Additional Micro-only pattern corrections | {summary["microOnlyPatternCorrections"]} |',
f'| Additional Macro-only pattern corrections | {summary["macroOnlyPatternCorrections"]} |',
f'| Additional shared pattern corrections | {summary["sharedPatternCorrections"]} |',
f'| Shared corrections across both phases (included above) | {summary["sharedCorrectionsAllSources"]} |',
f'| Difficulty changes (included above) | {len(tiers)} |',
'| Faculty-classified substantive defects repaired | 2 |',
'| Additional missing-case context repairs | 6 |',
'| Explicitly approved content enhancement | 1 |',
f'| Feedback corrections | {feedback} |',
f'| Records with restored/explicit assumptions or an approved construct enhancement | {economic} |',
'| Unresolved decisions | 0 |','',
'The course totals overlap: revised records reach 154 Micro entries, 40 Macro entries, and 21 General entries. Registry membership determined these counts; ID prefixes were not used. Three changed Market Gate records are shared: the two explicitly annotated items and one clear answer-length match. No General-only question changed.','',
'## Faculty decisions and substantive repairs','',
'- **P62B-ELAS-C-026:** implemented the explicit follow-up decision to add elasticity classification and preserve **Hard**. Revenue rises from $12,000 to $12,800 as price falls. Demand is elastic; midpoint elasticity is about 1.35. Correct position B is preserved. This is a documented content enhancement.','- **ECON-NL-HARD-236:** remains **Medium**. Only the separate derived adjudication changes UNCERTAIN to PASS; the faculty’s original note and assessment remain in the frozen backup.','- **P62H-MCMP-B3-053:** restores Lotus Fitness’s specialized-program facts from its companion record and identifies monopolistic competition. The correct answer states that customers can value variety while markups and excess capacity remain; it does not assert that every benefit exceeds every cost. Six closely related welfare questions now contain their own named-case facts.','- **P62F-PC-EL-030:** distinguishes possible price-taking from efficient purchases when buyers misjudge benefits. Buyers know prices, while the benefit information problem remains. All four alternatives were rewritten; B remains the sole defensible answer.','- **P62I-OLI-EL-022 / P62I-OLI-L-052:** the intended mathematics uses indefinite streams, not ten rounds. Cooperation begins now; cheating occurs now; permanent punishment starts next period. Present values are 150 versus 83, and 65 versus 33, respectively. The same issue was corrected in matching repeated-game items and checked with independent discounted summation.','',
'Two further flagged questions required explicit assumptions supporting their existing conclusions: **42145** states that permits can trade under both allocation systems; **P62G-MON-L-065** states constant marginal cost, which supports the conclusion that price equal to marginal cost leaves no contribution toward fixed cost. These are marked as economic-content/assumption changes in the ledger. Together with the two faculty-classified repairs, six restored named cases, and one approved enhancement, 11 records carry that flag.','',
'Conceptual checks for the two substantive repairs were supported by OpenStax’s [perfect-competition discussion](https://openstax.org/books/principles-economics-2e/pages/8-1-perfect-competition-and-why-it-matters) and [monopolistic-competition discussion](https://openstax.org/books/principles-economics-2e/pages/10-1-monopolistic-competition). The faculty review governed the edits.','',
'## Difficulty and routing','',
'| Question | Before | After |','|---|---|---|']
for c in tiers:lines.append(f'| {c["id"]} | {c["beforeRecord"]["canonicalDifficulty"].title()} | {c["afterRecord"]["canonicalDifficulty"].title()} |')
lines+=['','Seven ordinary runtime placements were moved to their revised difficulty pools because Composer rejects mismatched pool/difficulty pairs. Source-pool provenance, IDs, instructional roles, skill mappings, checkpoint stages, and course membership remain unchanged. Three boss questions retain their boss pools. PG4-MM-EL-003 retains its Elite instructional role while its cognitive difficulty and ordinary placement become Medium. No engine or mode-selection logic changed.','',
'| Question | Runtime pool movement |','|---|---|']
for m in ledger['moves']:lines.append(f'| {m["id"]} | {m["from"]} → {m["to"]} |')
lines+=['','Registry difficulty/role totals and affected outcome coverage were regenerated. Outcome definitions and skill partitions were preserved. All ten modes passed composition readiness checks for each full-scope discipline publication. Forty-four affected outcome scopes also preserve their actual supported modes and checkpoint membership. The refreshed metadata corrects one pre-existing stale availability summary: the next-best-alternative outcome in Opportunity Cost already had only two middle-checkpoint questions, so its cached claim of Exam support was incorrect before this pass. Actual support for that scope did not change.','',
'## Targeted pattern review and retained cases','',
'The search screened all active Micro/Macro records for the faculty’s demonstrated patterns: long explanatory keys, internal case labels and task wording, missing named-case context, long-run firm wording, repeated-game horizons, labor-curve notation, and ambiguous initial graph states. It produced 103 additional screen hits. Exact Macro sibling searches added six, and the missing-case search added six. Each of the 115 candidates has a disposition; 110 were changed and five were retained. This is a bounded pattern pass, not a claim that every question received a new general economics audit.','',
'Answer choices were reviewed together. Detailed explanations were shortened or moved to feedback, and tariff alternatives now give parallel numerical decompositions. No new answer-length flag was introduced. The remaining heuristic flag on **42337** is retained because A and B contain equally developed causal explanations; length does not uniquely identify the key. Removing administrative labels exposed existing near-duplicate scenarios without authorizing deletion or consolidation of IDs.','',
'Labor notation uses compact, accessible plain text such as SL0, SL1, and DL. Original graph bytes and accessibility metadata were preserved. For **P62F-PC-M-044**, the firm panel is necessary to calculate the loss, so the stem directs students to it; the composite image is retained. Fourteen directly implicated graph questions and four additional graph assets were visually reviewed.','',
'| Unchanged reviewed item | Disposition and reason |','|---|---|']
for c in items:
 if c['disposition']!='IMPLEMENTED':lines.append(f'| {c["id"]} | {c["disposition"]}: {c["reason"]} |')
lines+=['','## Frozen evidence and adjudication','',
'The complete original response backup, frozen sample manifest, instrument, 300 original question snapshots, and original sample hash were not edited. The two substantive defects retain their original historical classifications even though their canonical questions are now repaired.','',
'| Evidence | SHA-256 |','|---|---|',
'| Frozen sample | `5442b88493c7a22a420a44102811560ee5b3fac1e6e654e0db1322b8ce05cf5d` |',
f'| Original response backup | `{read("adjudication.json")["originalBackupSha256"]}` |',
f'| Revised library semantic hash | `{ledger["afterLibrarySha256"]}` |',
f'| Revised library file hash | `{sourcehash}` |','',
'The separate derived adjudication records **245 PASS, 53 MINOR EDITORIAL ISSUE, 2 SUBSTANTIVE DEFECT, and 0 UNCERTAIN**. These counts describe the original evaluation after the one faculty adjudication; they are not a new faculty assessment of the remediated bank. Machine-readable adjudication and evidence hashes are retained in `audit_tools/faculty_remediation_20261008/`.','',
'## Verification and official outputs','',
'- 36/36 current Composer/game regression runners passed against the final source hash; 25/25 exporter tests passed. Earlier failures identified missing runtime difficulty moves and were resolved before this final run. Historical revision assertions reconstruct the prior versions rather than weakening their expected content.','- 9,777 distinct canonical IDs are preserved. Deleted questions 42660 and 42697 remain absent. Every changed answer hash was generated with the official Composer normalization and SHA-256 functions; each resolves to exactly one choice at its original position.','- All 520 graph assets and all frozen validation-evidence hashes match their originals. No unapproved question changes were detected.','- Full-scope publication membership is unchanged: General 1,589, Micro 6,297, Macro 4,745. Every changed item appears with exact canonical text, choices, feedback, tier, and answer key. Macro’s two pre-existing omissions, ECON-SP-MAP-AD-AS-TO-PC-5061 and ECON-SP-MAP-AD-AS-TO-PC-6052, are preserved; none was added.','- Official exports contain General 1,589, Micro 6,297, and Macro 4,747 records. The exporter checked all PDF records and CSV rows. Additional targeted checks verified every edited record in every affected PDF/CSV, and ten representative PDF pages were visually inspected.','- Existing export warnings remain: 24 Micro and 21 Macro records have no mapped objective; Macro merges 21 consistent duplicate occurrences. These are pre-existing scope characteristics, not missing questions introduced by this pass.','',
'[Micro PDF](../microeconomics_question_bank.pdf) · [Micro CSV](../microeconomics_question_bank.csv)  ',
'[Macro PDF](../macroeconomics_question_bank.pdf) · [Macro CSV](../macroeconomics_question_bank.csv)  ',
'[General PDF](../general_economics_question_bank.pdf) · [General CSV](../general_economics_question_bank.csv)','',
'No commit, push, or deployment was performed.']
(O/'faculty_validation_remediation_20261008.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
print(json.dumps(summary,indent=2))
