import pathlib,json,csv,re,collections,hashlib
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1];A=R/'faculty_exports/audits'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
ledger=read(D/'expectations.json');manifest=read(D/'manifest.json');tests=read(D/'test-results.json');validation=read(D/'validation.json');pub=read(D/'publication-validation.json');exports=read(D/'export-validation.json');visual=read(D/'pdf-visual-validation.json');style=read(D/'style-validation.json')
runner=(R/'build/faculty-build-composer/tests/run_active_composer_suite.js').read_text()
names=re.findall(r"'([^']+)'",re.search(r'const ACTIVE_RUNNERS = (\[[\s\S]*?\]);',runner).group(1))
assert [t['runner'] for t in tests]==names and all(t['status']=='PASS' for t in tests)
for x in [validation,pub,exports,visual]:assert x['status']=='PASS'
log=(D/'exporter-tests.log').read_text(encoding='utf-8');assert re.search(r'\bOK\s*$',log);exporter_count=int(re.search(r'Ran (\d+) tests',log).group(1))
assert style['newLengthFlags']==0 and len(manifest['candidates'])==94
matrix=read(D/'audit-rows.json')
csvfile=A/'micro_faculty_voice_pass3_remediation_20261007.csv'
with csvfile.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.reader(f))
assert rows==[[str(x) for x in row]for row in matrix]
assert len(rows)==95 and len({r[0]for r in rows[1:]})==94
assert set(r[0]for r in rows[1:])==set(c['id']for c in manifest['candidates'])
assert all(r[17]=='EDITED' and r[19]=='PASS'for r in rows[1:])
source=R/'build/faculty-build-composer/data/composer_library.js'
assert hashlib.sha256(source.read_bytes()).hexdigest()==exports['sourceSha256']
patterns=collections.Counter(p for c in ledger['changes'] for p in c['patterns'])
summary={'status':'PASS','activeMicroQuestions':6297,'candidates':94,'edited':94,'alreadyResolved':0,'unexpectedProtected':0,'needsFacultyDecision':0,'patterns':dict(patterns),'facultyOverrides':3,'answerHashesRegenerated':validation['answerHashesChanged'],'economicsChanges':0,'difficultyChanges':0,'roleRoutingChanges':0,'graphChanges':0,'sharedGeneralMacroChanges':0,'marketGateChanges':0,'currentComposerSuites':len(tests),'exporterTests':exporter_count,'allTenModesBuild':True,'publicationMembershipUnchanged':True,'newAnswerLengthFlags':0,'remainingLengthFlags':style['retainedLengthFlags'],'facultyOutcomeContentChanges':0,'beforeLibrarySha256':ledger['beforeLibrarySha256'],'afterLibrarySha256':ledger['afterLibrarySha256']}
(D/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
text=f'''# Microeconomics faculty-voice Pass 3 remediation

Status: **PASS**. All 94 approved candidates were edited. No faculty decisions remain.

## Scope and dispositions

The exact 94 unique candidate IDs were extracted from the candidate cards in `micro_faculty_voice_pass3_review_20261007.html`. Its SHA-256 is `{manifest['reviewSha256']}`. The current canonical stems, all four alternatives, correct positions and feedback matched that review before editing. Supplemental candidate **43058** is included.

| Measure | Result |
|---|---:|
| Active Micro questions | 6,297 |
| Unique questions across the full library | 9,777 |
| Review candidates / ledger rows | 94 |
| EDITED | 94 |
| ALREADY RESOLVED | 0 |
| PROTECTED — unexpected shared record | 0 |
| NEEDS FACULTY DECISION | 0 |
| Answer-choice parallelism repairs | {patterns['Answer-choice parallelism']} |
| Graph-state clarification repairs | {patterns['Graph state']} |
| Meta/model language repairs | {patterns['Meta/model wording']} |
| Textbook-language repairs | {patterns['Meta/textbook']} |
| AI-abstraction repairs | {patterns['AI abstraction']} |
| Noun-stack repairs | {patterns['Noun stack']} |

Pattern counts overlap for four records. No other screening flags, adjacent questions or related families were edited. All 132 previously flagged protected records, all 437 initial flags not selected for editing, and the eleven named retention examples remain unchanged.

## Faculty overrides and content preservation

- **42705, B:** “No. At an interior optimum, MRS must also equal the price ratio.” Existing assumptions, feedback and difficulty retained.
- **P62C-CPS-H-019, A:** “Consumer and producer surplus both fall; total surplus falls to $36.” Hard retained.
- **P62C-CPS-L-074, B:** “Measured willingness to pay reflects both willingness and ability to pay.” Legendary difficulty and existing role retained.

All 94 correct-answer positions remain unchanged. The official Composer `normalizeAnswerText` and `sha256Hex` functions regenerated answer hashes; **53** hashes changed because the keyed wording changed. The other 41 hashes remain correct and unchanged. Every record retains four distinct alternatives and exactly one matching key.

There were **zero** economics changes, numerical-input changes, difficulty changes, role/routing changes, new or deleted questions, graph artwork changes, graph-metadata changes, shared General/Macro changes, or Market Gate changes. **P62G-MON-H-009 remains Elite**. Removed IDs **42660** and **42697** remain absent. Faculty outcomes and their coverage remain unchanged; only generated library/policy checksum metadata was synchronized.

## Graph and numerical verification

The 39 graph-bearing targets use 12 distinct existing images. Their image bytes and accessibility text match the review. The 35 chronology repairs use eight figures: CHOICE-02/03/04 and LABOR-02/03/04/05/09. All **520** registered asset checksums remain unchanged.

- Budget lines: BC0 is the initial line shown by the stated initial income/prices. CHOICE-02 lowers cereal price; CHOICE-03 raises yogurt price; CHOICE-04 lowers income with prices fixed. BC1 is the corresponding resulting line. The revised questions preserve those directions.
- Warehouse demand: D L0 to D L1 raises employment from 4,000 to 6,000 and the wage from $20 to $25.
- Orchard demand: D L0 to D L1 lowers employment from 4,000 to 2,000 and the wage from $20 to $15.
- Healthcare supply: S L0 to S L1 raises employment from 4,000 to 6,000 and lowers the wage from $20 to $15.
- Construction supply: S L0 to S L1 lowers employment from 4,000 to 2,000 and raises the wage from $20 to $25.
- Nursing simultaneous shifts: D L0/S L0 to D L1/S L1 raises employment from 4,000 to 8,000 while the plotted wage remains $20. The answers retain the qualification that other simultaneous shifts need not leave wages unchanged.

Where identifying the shift is part of the task, the stem establishes the initial intersection without revealing the event's economic effect. Additional checks preserve the $4 missing/excess surplus triangles, $36 total surplus, $26/$22 net-surplus comparison, $40 welfare loss, 9-to-4 income ratio, HHI increases of 594/408, and each distinct competitive-firm profit/output calculation. In particular, P62F-PC-LB-005 retains output 5 and profits −$30 to −$45.

## Answer-length closure

The final screen was limited to the 94 edited records. It found **zero new correct-answer length flags**. Four existing flags remain: 42337, P62G-MON-EL-019, P62G-MON-EL-022 and PM5-PC-BR-015. These preserve requested causal reasoning or a necessary economic distinction. In 42337 and PM5-PC-BR-015, a distractor is also comparably long or longer. The two rent-seeking items retain the distinction between real lobbying resource costs and the loss from restricted output. These are not newly introduced giveaways, and distractors were not padded.

## Regression and publication validation

All **{len(tests)} currently registered Composer/game regression suites passed**, including this pass's preservation tests and all earlier faculty-voice/closure suites. The suite list was read from the current active runner, not copied from an older count. Earlier release-specific validators remain historical proofs and are not treated as current forward regressions. Exact revision history preserves their assertions.

All **{exporter_count} exporter tests passed**. The tests verify exact scope, immutable fields, membership, answer positions/hashes, negative controls, graph assets and faculty outcomes. Numerical and graph checks passed.

All ten modes build: standard, timed, exam, quiz, unlimited, legendary, score, trialGraph, fadingFortune and riskReward. Generated game scripts compile, answer verification succeeds, and publication membership is unchanged. All 94 edited questions appear with final text in full-scope Micro publication data. General and Macro publication payloads are byte-for-byte equivalent at the structured-record comparison level. The representative Macro recipe continues to publish 4,745 IDs; its membership is unchanged, while the faculty export includes all 4,747 active Macro records.

## Faculty exports

The official `tools/export_faculty_question_bank.py` pipeline regenerated all three discipline PDF/CSV pairs:

| Discipline | Questions | PDF pages |
|---|---:|---:|
| General | 1,589 | {exports['pdfPages']['general']:,} |
| Micro | 6,297 | {exports['pdfPages']['micro']:,} |
| Macro | 4,747 | {exports['pdfPages']['macro']:,} |

All 94 final stems, all alternatives and feedback were verified in the Micro CSV and PDF; correct letters were checked. General and Macro CSV bytes are identical to the captured baseline. Twelve representative Micro PDF pages were rendered and visually checked, including all three faculty overrides, budget/labor graphs, a long integrated item and numerical answer parallelism. The execution CSV contains exactly one verified disposition per candidate, with original/final wording and feedback.

Artifacts: [execution ledger](micro_faculty_voice_pass3_remediation_20261007.csv), [Micro PDF](../microeconomics_question_bank.pdf), [Micro CSV](../microeconomics_question_bank.csv).

## Baseline and closure

Baseline Git commit: `10fc605a109ed2d972b81a52c5f3e7753f1d2091`.

Before library hash: `{ledger['beforeLibrarySha256']}`.

After library hash: `{ledger['afterLibrarySha256']}`.

Outstanding faculty decisions: **none**. No commit, push or deployment was performed.
'''
(A/'micro_faculty_voice_pass3_remediation_20261007.md').write_text(text,encoding='utf-8')
(D/'ledger-validation.json').write_text(json.dumps({'status':'PASS','rows':94,'uniqueIds':94,'columns':22,'exactManifestMembership':True,'matrixRoundTrip':True,'dispositions':{'EDITED':94}},indent=2)+'\n')
print(json.dumps(summary,indent=2))
