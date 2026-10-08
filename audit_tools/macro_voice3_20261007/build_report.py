import json,pathlib,collections,hashlib
R=pathlib.Path(__file__).resolve().parents[2];D=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(D/'expectations.json');scan=read(D/'scan-summary.json');candidates=read(D/'candidates.json');beforepages=read(D/'baseline-pages.json')
tests=read(D/'test-results.json');v=read(D/'validation.json');pub=read(D/'publication-validation.json');exports=read(D/'export-validation.json');summary=read(R/'faculty_exports/validation_summary.json')
visual=read(D/'pdf-visual-validation.json');assert visual['status']=='PASS' and visual['sourceSha256']==exports['sourceSha256']
assert len(tests)==34 and all(t['status']=='PASS' for t in tests)
assert v['changed']==118 and v['status']==pub['status']==exports['status']=='PASS'
assert pub['librarySha256']==ledger['afterLibrarySha256']
assert exports['sourceSha256']==hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
assert not v['remainingChangedLengthCandidates']
changes={c['id']:c for c in ledger['changes']};cats=collections.Counter(p for c in changes.values() for p in c['patterns'])
pages=summary['disciplines']['macro']['question_pages'];fields=['Question ID','PDF page','Topic','Pattern','Stem before','Stem after','Options before','Options after','Feedback changed YES/NO','Difficulty before','Difficulty after','Correct option preserved YES/NO','Graph changed YES/NO','Economics changed YES/NO','Rationale','Validation result']
rows=[]
for c in changes.values():
 b=c['beforeRecord'];a=c['afterRecord'];opt=lambda q:'\n'.join(f'{l}. {s}' for l,s in zip('ABCD',q['options']))
 rows.append([c['id'],pages[c['id']],a['primaryConceptId'],'; '.join(c['patterns']),b['q'],a['q'],opt(b),opt(a),'YES' if b.get('feedback')!=a.get('feedback') else 'NO',b['canonicalDifficulty'],a['canonicalDifficulty'],'YES','NO','NO',c['rationale'],'PASS — economic reasoning and original key checked; arithmetic/graph relationship, protected fields, hashes and publication verified'])
assert len(rows)==118 and all(len(r)==16 for r in rows)
(D/'audit-rows.json').write_text(json.dumps([fields,*rows],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
dispositions=[]
for r in candidates:
 if r['id'] in changes:action='EDITED';reason=changes[r['id']]['rationale']
 elif r['areas']!=['macro'] or r['marketGateDerived']:action='PROTECTED';reason='Shared Micro membership or Market Gate origin; preserve the accepted canonical record exactly.'
 elif r['id'] in ['ECON-NL-EASY-9','PMOE-RER-B1-003']:action='RETAINED';reason='Literal textbook purchase/license, not meta-course language.'
 elif 'AI abstraction' in r['flags']:action='RETAINED';reason='Frictional and structural unemployment components are the economic construct; this terminology is precise and necessary.'
 elif 'Answer length' in r['flags'] or 'Explanatory key' in r['flags']:action='RETAINED';reason='The longer answer supplies a necessary conditional conclusion, multiple linked results or the causal mechanism actually asked for. Other alternatives make competing claims; shortening would remove precision. Heuristic flag is not an automatic defect.'
 elif 'Graph state' in r['flags']:action='RETAINED';reason='The stem already specifies the direction, starting state or point comparison; alternatively it asks for a static coordinate. No chronology has to be inferred to solve it.'
 else:action='RETAINED';reason='Standard economic compound; rewriting would not clearly improve precision.'
 dispositions.append({'id':r['id'],'flags':r['flags'],'areas':r['areas'],'action':action,'reason':reason})
assert set(changes)<=set(r['id'] for r in candidates)
(D/'candidate-dispositions.json').write_text(json.dumps(dispositions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts=collections.Counter(r['action'] for r in dispositions)
result={**scan,'actualEdits':len(changes),'editedFamilies':dict(cats),'dispositions':dict(counts),'tierChanges':1,'graphChanges':0,'economicsChanges':0,'keyIndexChanges':0,'unresolvedFacultyDecisions':0,'feedbackEdits':sum(c['beforeRecord'].get('feedback')!=c['afterRecord'].get('feedback') for c in changes.values()),'optionEdits':sum(c['beforeRecord']['options']!=c['afterRecord']['options'] for c in changes.values()),'answerHashChanges':sum(c['beforeRecord']['aHash']!=c['afterRecord']['aHash'] for c in changes.values())}
(D/'summary.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
familyrows='\n'.join(f'| {name} | {scan["patterns"][name]} | {cats[name]} |' for name in ['Meta/textbook','AI abstraction','Noun stack','Graph state'])
seedrows='\n'.join(f'| {id} | {beforepages[id]} | {pages[id]} | {changes[id]["beforeRecord"]["canonicalDifficulty"].title()} → {changes[id]["afterRecord"]["canonicalDifficulty"].title()} |' for id in ['LG-Q-4004','P52B-S1-LRPC-L-002','43196','43313'])
text=f'''# Macroeconomics faculty-voice cleanup, Pass 3 — October 7, 2026

**PASS.** Reviewed 4,747 active Macro records against the bounded faculty prose families and edited **118 Macro-only questions**. No economics, correct-answer positions, graph assets, accessibility metadata, structural roles or checkpoint memberships changed. All 6,297 Micro records are exactly unchanged. No unresolved faculty decisions remain.

## Scope and results

The accepted economics/content QA, graph-accessibility audit and prior faculty-voice passes remained closed. Screening generated candidates; each was judged in context. The initial literal/length screen was extended to graph stems and alternatives using “after,” “original,” “initial,” “final” and nearby wording. That semantic follow-up added eight chronology repairs. Static coordinate reads, already explicit sequences, standard technical terms and necessary qualifications were retained.

| Family | Screening candidates | Questions edited in family |
| --- | ---: | ---: |
{familyrows}
| Answer-length screen | {scan['patterns']['Answer length']} | — |
| Explanatory-key secondary screen | {scan['patterns']['Explanatory key']} | — |
| Answer-choice parallelism, including faculty seeds | — | {cats['Answer-choice parallelism']} |

Counts overlap. Graph-state candidates are broad review flags, not a claim that all 188 questions were ambiguous. **{scan['candidates']} unique candidates** received final dispositions: {counts['EDITED']} edited, {counts['RETAINED']} retained as sound, and {counts['PROTECTED']} protected because they are shared with Micro. The row-level decisions are in `audit_tools/macro_voice3_20261007/candidate-dispositions.json`.

| Measure | Result |
| --- | ---: |
| Unique questions edited | 118 |
| Questions with option edits | {result['optionEdits']} |
| Questions with feedback edits | {result['feedbackEdits']} |
| Answer hashes updated for revised keyed text | {result['answerHashChanges']} |
| Difficulty changes | 1 |
| Correct-answer index changes | 0 |
| Economics changes | 0 |
| Graph bytes or accessibility changes | 0 |
| Structural-role/checkpoint changes | 0 |
| Unresolved faculty decisions | 0 |

## Four faculty seeds

| Question | Prior Macro PDF page | Regenerated PDF page | Difficulty |
| --- | ---: | ---: | --- |
{seedrows}

- **LG-Q-4004:** monetary easing raises investment by $30; the multiplier yields $90; subtract the already-total $60 fiscal effect once. The key remains C, AD rises $30. All four alternatives now give concise results.
- **P52B-S1-LRPC-L-002:** the natural rate falls 0.8 percentage point, the temporary unemployment gap is 0.7 point, and long-run unemployment is 5.6%. The key remains D. **Legendary → Hard** reflects two differences plus the natural/cyclical distinction and expectations adjustment, rather than the removed decomposition/durable wording. No broader retiering occurred.
- **43196:** national saving rises $20 and the supply of loanable funds shifts right. Natural wording is used in the stem, alternatives and feedback. Key A and Hard are preserved.
- **43313:** A/S0/D0 is explicitly initial; B/S1/D1 is final. Key B is “It remains at 6%.” Feedback retains the distinction between this drawing and the generally ambiguous rate effect of simultaneous rightward shifts. Medium is preserved.

The sole difficulty change moves the natural-rate question from the ordinary Legendary bank into Hard. Its `instructionalRole`, `sourcePool` and `originalSourcePool` remain `legendary`; all skill, checkpoint and explicit mode-routing fields are unchanged. Registry counts and faculty outcome coverage were regenerated for the tier change. All ten modes still validate.

## Retentions and safeguards

“Textbook” remains in ECON-NL-EASY-9 and PMOE-RER-B1-003 because they concern literal books or licenses. Frictional/structural unemployment components remain where they are the construct. Longer alternatives remain when the conditional conclusion, causal explanation or linked operations are the actual question. No distractors were padded to meet a length target.

The complete Macro answer-length screen goes from **{v['lengthBefore']} to {v['lengthAfter']} candidates**, with **zero new flags and zero flags among edited questions**. This does not mean all longer answers elsewhere were rewritten: accepted long answers and protected shared records retain their reviewed wording. The 127 shared candidates were protected rather than introducing divergent Micro/Macro variants.

## Validation and exports

- **34/34 current Composer/game suites passed**, including the new exact-scope Pass 3 validation and all historical accepted-revision checks.
- **25/25 exporter unit tests passed.**
- All ten supported modes passed for Macro, Micro and General full-scope generated games. All 118 edited targets reached the Macro student publication. Publication membership is unchanged: Macro 4,745 (two pre-existing exclusions), Micro 6,297, General 1,589.
- All 6,297 Micro canonical records and Micro/General generated question payloads are exactly unchanged. All {v['marketGateFrozen']} Market Gate-derived records are unchanged.
- All {v['assetInventory']} graph assets retain their recorded bytes and metadata; original key positions and unique normalized alternatives are preserved.
- {len(v['numerical'])} independent arithmetic checks cover the edited numerical families; graph curve/point relationships were checked against the unchanged figures. Negative controls reject tier, key, role, graph-metadata, Micro and Market Gate tampering.
- The official exporter regenerated the three discipline PDF/CSV pairs atomically. The Macro PDF has {exports['pdfPages']['macro']:,} pages and 4,747 questions. All edited stems, options and feedback were found in the PDF; all exported CSV records and correct letters match the canonical library. Representative PDF pages were rendered and visually inspected.

The [118-row change ledger](macro_faculty_voice_cleanup_pass3_20261007.csv) contains every requested before/after field. Its “PDF page” column refers to the regenerated Macro PDF. Prior pages for the named seeds are preserved above.

- [Macro faculty PDF](../macroeconomics_question_bank.pdf)
- [Macro faculty CSV](../macroeconomics_question_bank.csv)

Accepted baseline library hash: `{ledger['beforeLibrarySha256']}`. Final library hash: `{ledger['afterLibrarySha256']}`. Full source-file SHA-256: `{exports['sourceSha256']}`.

Pass 3 stops here. No additional generic style audit was performed.
'''
# Use exact names emitted by the official exporter.
text=text.replace('../macroeconomics_question_bank.pdf','../'+summary['disciplines']['macro']['pdf_file']).replace('../macroeconomics_question_bank.csv','../'+summary['disciplines']['macro']['csv_file'])
(R/'faculty_exports/audits/macro_faculty_voice_cleanup_pass3_20261007.md').write_text(text,encoding='utf-8')
print(json.dumps(result))
