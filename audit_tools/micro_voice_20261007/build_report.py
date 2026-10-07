import json,pathlib,collections,re,hashlib
R=pathlib.Path(__file__).resolve().parents[2];D=pathlib.Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
authority=read(D/'authority.json');ledger=read(D/'expectations.json');changes={c['id']:c for c in ledger['changes']}
tests=read(D/'test-results.json');v=read(D/'validation.json');pub=read(D/'publication-validation.json');exports=read(D/'export-validation.json')
assert len(tests)==33 and all(t['status']=='PASS' for t in tests)
assert v['changed']==140 and v['status']==pub['status']==exports['status']=='PASS'
assert pub['librarySha256']==ledger['afterLibrarySha256']
assert exports['sourceSha256']==hashlib.sha256((R/'build/faculty-build-composer/data/composer_library.js').read_bytes()).hexdigest()
fields=['Question ID','Prior PDF page','Topic','Review status','Pattern','Area membership','Shared/protected status','Structural role','Difficulty before','Difficulty after','Stem before','Stem after','Options before','Options after','Correct option before','Correct option after','Feedback changed YES/NO','Hash changed YES/NO','Action','Rationale','Validation result']
rows=[];cats=collections.Counter();connect=0
actionmap={'Answer-choice imbalance':'EDITED — answer-choice parallelism','Unnecessary actor':'EDITED — unnecessary actor removed','Curriculum-style wording':'EDITED — curriculum-style stem','Internal authoring language':'EDITED — internal authoring language'}
for r in authority:
 id=r['id'];before=r['q'];c=changes.get(id);after=c['afterRecord'] if c else before
 patterns=list(r.get('finding',{}).get('categories',[])) if r.get('finding') else []
 if c:
  if id in ['42334','42737']:patterns=['Integrated borderline task']
  elif id=='42367':patterns=['Internal authoring language']
  elif not patterns:patterns=['Curriculum-style wording']
  cats.update(patterns)
  if before.get('instructionalRole')=='bridge' and re.search('connect',before['q'],re.I) and not re.search('connect',after['q'],re.I):connect+=1
  action='EDITED — integrated borderline task' if 'Integrated borderline task' in patterns else next(actionmap[p] for p in patterns if p in actionmap)
  rationale=' '.join(r['finding']['reasons']) if r.get('finding') else 'Faculty-approved direct wording for a Micro-only bridge; economic relationship and structural role preserved.'
  if id=='42367':rationale='Faculty override removes textbook-model language. Graph establishes the setup; Hard tier and 4,000-worker surplus are unchanged.'
  if id=='42334':rationale='One scenario-to-graph consistency task retains labor demand of 4,000 versus 8,000 at $20 and the 12.5% VMP increase. Direction is supported, not the plotted magnitude.'
  if id=='42737':rationale='One claim-evaluation task retains the 18% middle-quintile share and 0.9 relative mean. Every option reports share, relative mean, and claim disposition.'
  if c['beforeRecord']['options']!=c['afterRecord']['options']:rationale+=' Alternatives checked for one defensible key at the original position; necessary explanations retained in feedback.'
  shared='Micro-only; editable';status='Confirmed editorial candidate — edited' if r['reviewStatus']=='Confirmed editorial candidate' else 'Faculty-authorized additional edit'
 elif len(r['areas'])>1:
  action='PROTECTED — shared General/Macro';shared='Protected shared General/Macro'
  status='Confirmed Micro editorial candidate — protected shared record' if r['reviewStatus']=='Confirmed editorial candidate' else 'Shared bridge — protected'
  rationale='Current authoritative course-area membership is General, Macro and Micro. Accepted canonical wording is preserved exactly; no variant architecture introduced.'
 else:
  assert id in ['P62F-PC-B3-057','P62F-PC-L-099']
  action='RETAINED — genuine linked reasoning';shared='Micro-only; faculty retention';status='Borderline — resolved by faculty retention';patterns=['Genuine linked reasoning']
  rationale='Retain all three operations: (18 − 15) × 50 = $150 loss; produce because $15 > AVC $10; persistent losses induce exit and higher market price. Existing tier, options, feedback and boss/legendary role are unchanged.'
 option=lambda q:'\n'.join(f'{letter}. {text}' for letter,text in zip('ABCD',q['options']))
 letter='ABCD'[r['key']]
 row=[id,r['page'],before['primaryConceptId'],status,'; '.join(patterns),'; '.join(r['areas']),shared,before.get('instructionalRole',''),before.get('canonicalDifficulty',before.get('difficulty','')),after.get('canonicalDifficulty',after.get('difficulty','')),before['q'],after['q'],option(before),option(after),letter+' — '+before['options'][r['key']],letter+' — '+after['options'][r['key']],'YES' if before.get('feedback')!=after.get('feedback') else 'NO','YES' if before['aHash']!=after['aHash'] else 'NO',action,rationale,'PASS — exact scope, economics/key position, hashes, roles, graph metadata and publication validated' if c else 'PASS — exact unchanged record verified']
 assert len(row)==len(fields);rows.append(row)
assert len(rows)==154
(D/'audit-rows.json').write_text(json.dumps([fields,*rows],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts={'activeMicro':6297,'confirmed':125,'confirmedEdited':120,'confirmedSharedProtected':5,'additionalBridgeEdits':17,'namedRewrites':3,'totalEdited':140,'unnecessaryActorsRemoved':cats['Unnecessary actor'],'answerChoiceRepairs':cats['Answer-choice imbalance'],'curriculumStemRepairs':cats['Curriculum-style wording'],'directConnectBridgeRepairs':connect,'internalLanguageRepairs':cats['Internal authoring language'],'hashesChanged':sum(c['beforeRecord']['aHash']!=c['afterRecord']['aHash'] for c in changes.values()),'feedbackChanged':sum(c['beforeRecord'].get('feedback')!=c['afterRecord'].get('feedback') for c in changes.values())}
(D/'summary.json').write_text(json.dumps(counts,indent=2)+'\n',encoding='utf-8')
text=f'''# Microeconomics faculty-voice remediation — October 7, 2026

Completed the bounded faculty-approved remediation. All 125 confirmed candidates have final dispositions: **120 Micro-only records edited and five shared records protected**. An additional 17 Micro-only bridge stems and three named rewrites bring the total to **140 edited questions**. The two perfect-competition borderline questions retain their original linked reasoning. No unresolved faculty decisions remain.

## Scope and counts

The authoritative review is `micro_faculty_voice_review_20261007.html`. Its full-context findings, original records and prior PDF pages are preserved in the execution ledger. The 1,051 screening candidates and 514 length flags were not treated as edit authority. No new economics or difficulty audit was performed.

| Measure | Result |
| --- | ---: |
| Active Micro questions | 6,297 |
| Confirmed candidates / final dispositions | 125 / 125 |
| Confirmed Micro-only candidates edited | 120 |
| Confirmed shared records protected | 5 |
| Additional Micro-only bridge wording edits | 17 |
| Total edited questions | 140 |
| Unnecessary actors removed | {counts['unnecessaryActorsRemoved']} |
| Answer-choice balance/parallelism repairs | {counts['answerChoiceRepairs']} |
| Curriculum-style stem repairs | {counts['curriculumStemRepairs']} |
| Direct “connect/connected” bridge rewrites, including confirmed items | {connect} |
| Feedback revised | {counts['feedbackChanged']} |
| Answer hashes whose values changed | {counts['hashesChanged']} |
| Difficulty changes | 0 |
| Correct option index changes | 0 |
| Economics changes | 0 |
| Graph/asset/accessibility changes | 0 |
| Market Gate changes | 0 |
| Runtime/adaptive-engine changes | 0 |
| Unresolved faculty decisions | 0 |

Pattern counts overlap. The CSV contains 154 dispositions: 140 edited records, five protected confirmed candidates, seven additional protected shared bridges, and two retained borderline cases. Canonical `unknown` difficulties remain unknown; structural roles were not used to infer cognitive tiers.

## Named faculty decisions

- **42367:** “At a $20 minimum wage, what labor surplus does the graph show?” The graph, Hard tier, 6,000 − 2,000 = 4,000 answer and feedback calculation are unchanged.
- **42334:** One derived-demand consistency question retains the graph reading at $20 (4,000 to 8,000 workers) and 1.25 × 0.90 = 1.125. VMP rises 12.5%, supporting the shift’s direction without implying its exact magnitude. Hard is preserved.
- **42737:** One claim-evaluation question uses parallel share/mean/claim alternatives. The middle-quintile share remains 40 − 22 = 18%; 18/20 = 0.9 of the overall mean, rejecting “twice the average.” Hard is preserved.
- **P62F-PC-B3-057:** Retained exactly. Loss = (18 − 15) × 50 = $150; P > AVC supports short-run operation; persistent losses lead to exit and higher market price. Boss/checkpoint role and Hard remain.
- **P62F-PC-L-099:** Retained exactly with the same linked operations, legendary structural role and Elite cognitive tier.
- **P62G-MON-H-009:** Remains Elite and unchanged.

## Shared and structural protection

The five protected confirmed candidates are **P52B-COMP-L-002, P52B-COMP-R-001, P62D-ITP-EL-017, PMS-ITP-BR-020 and PMS-ITP-BR-021**. Their current authoritative membership is General, Macro and Micro. The internal-language finding in P62D-ITP-EL-017 is therefore protected; the one internal-language edit made in this pass is the explicit 42367 override.

Seven additional shared bridge stems remain unchanged: P75-TRADE-BR-006, PMS-ITP-BR-012, PMS-ITP-BR-013, PMS-ITP-BR-016, PMS-ITP-BR-017, PMS-ITP-BR-022 and P73-MARG-BR-003. All 4,747 canonical records with General or Macro membership are frozen. All 613 Market Gate-derived canonical records are frozen. Other unedited records are also compared exactly with the baseline.

IDs, course-area membership, source pools, original pools, roles, checkpoint stages, skills, prerequisites, graph associations and accessibility metadata are unchanged. Deleted historical IDs 42660 and 42697 remain absent. All 520 asset inventory entries and their file hashes pass integrity checks. Genuine claim-diagnosis questions remain, including collusion, loss-making production, fixed-cost supply shifts, and the analyst’s inequality claim.

## Answers and validation

All 140 edited records retain their correct option position. Hashes are generated with the official `normalizeAnswerText` pipeline; unchanged correct text naturally retains its existing hash. Library, registry, manifest and faculty outcome policy hashes are regenerated together. Exact before/after records authorize only q/options/feedback/aHash changes; historical validation is preserved through the revision chain.

**33 of 33 Composer/game suites pass**, including the new Micro regression suite; **25 of 25 exporter tests pass**. The targeted numerical review covers all 33 digit-bearing changed questions plus four spelled-out voting-cycle tasks (37 entries), and independently verifies both retained loss/shutdown/exit sequences. Negative controls reject unauthorized shared edits, Market Gate edits, tier changes, graph metadata changes, and bridge-role changes.

All ten modes pass: standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune, riskReward. Student publication verifies current text, all options, key hashes, feedback and graph fields. The Micro test includes the existing `market-failures` legacy recipe route and publishes all 6,297 Micro records, including all 140 edits. P77-MFAIL-FINALB-025/026/027 are reached through that compatibility route; selector/routing behavior is unchanged. General publishes 1,589 records and Macro 4,745 in the broad recipe, matching the baseline (the two existing Macro recipe exclusions are unchanged).

The official exporter atomically regenerates PDF and CSV files for General (1,589 records), Micro (6,297), and Macro (4,747). Every exported CSV record is compared with current canonical content, and every edited Micro stem, choice and feedback is verified in the PDF. Twelve representative Micro pages are rendered and visually inspected, including the named graph decisions, both retained perfect-competition cases, numeric answer fields, an actor repair, a checkpoint family and direct bridges.

## Files and provenance

- Execution ledger: [micro_faculty_voice_remediation_20261007.csv](micro_faculty_voice_remediation_20261007.csv)
- Faculty exports: [Micro PDF](../microeconomics_question_bank.pdf), [Micro CSV](../microeconomics_question_bank.csv), [Macro PDF](../macroeconomics_question_bank.pdf), [Macro CSV](../macroeconomics_question_bank.csv), [General PDF](../general_economics_question_bank.pdf), [General CSV](../general_economics_question_bank.csv)
- Baseline library SHA-256: `{ledger['beforeLibrarySha256']}`
- Remediated library SHA-256: `{ledger['afterLibrarySha256']}`
- Audit evidence and reproducible patch decisions: `audit_tools/micro_voice_20261007/`

The CSV’s prior-page field points to the October 7 review’s original PDF, not the regenerated PDF. No commit, push, deployment, new variant architecture or runtime change was performed.
'''
(R/'faculty_exports/audits/micro_faculty_voice_remediation_20261007.md').write_text(text,encoding='utf-8')
print(json.dumps(counts))
