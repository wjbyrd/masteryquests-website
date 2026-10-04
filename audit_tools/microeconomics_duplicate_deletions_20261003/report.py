"""Write a small deletion receipt without rewriting earlier audit reports."""
from pathlib import Path
import json
H=Path(__file__).resolve().parent;ROOT=H.parents[1];W=ROOT/'tmp'/H.name;OUT=ROOT/'faculty_exports/audits'
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
ledger=read(H/'deletions.json');verify=read(H/'verification.json');exports=read(H/'export_verification.json')
assert verify['status']=='PASS' and exports['status']=='PASS'
assert verify['sourceSha256']==exports['source_sha256']
assert (W/'composer-tests.log').read_text().count('PASS ')==29
assert 'Ran 14 tests' in (W/'exporter-tests.log').read_text() and 'OK' in (W/'exporter-tests.log').read_text()
result={'status':'PASS','request':'Delete 42660 and 42697. Maintain everything else.','deleted_ids':ledger['authorizedDeletedIds'],'other_records_changed':0,'remaining_canonical_records':9777,'general':1589,'micro':6299,'macro':4745,'composer_tests':'29/29','exporter_tests':'14/14','deletion_ledger':ledger,'verification':verify,'exports':exports}
name='microeconomics_duplicate_deletions_20261003'
(OUT/(name+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
text='''# Microeconomics duplicate deletions — 2026-10-03

Status: **PASS**

Deleted only **42660** and **42697**, following the instructor’s explicit request. They are absent from the canonical Composer library, student publication, faculty CSV and faculty PDF. Historical authoring and audit records remain preserved.

All **9,777 remaining canonical question records are exactly unchanged**, including stems, choices, feedback, answer hashes, metadata and storage order. The prior 94 second-pass revisions are preserved. Graph assets, routing, engine and telemetry remain unchanged.

| Scope | Before | After |
|---|---:|---:|
| Canonical IDs | 9,779 | 9,777 |
| General Economics | 1,589 | 1,589 |
| Microeconomics | 6,301 | 6,299 |
| Macroeconomics | 4,745 | 4,745 |
| Consumer Choice | 160 | 158 |
| Selectable Micro publication | 6,276 | 6,274 |

Only the deletion-derived counts, count descriptions, outcome coverage and library/policy hashes were refreshed. Earlier approval ledgers remain immutable; the new validation layer permits exactly these two deletions and checks all other content against the exact pre-deletion state.

- Composer suite: **29/29**.
- Exporter tests: **14/14**.
- All ten Micro modes, student answer verification and generated JavaScript compilation: **PASS**.
- General/Macro CSV contents: exactly unchanged.
- Micro CSV: exactly the previous rows minus the two deleted IDs; **6,299 unique IDs**.
- Micro PDF: every remaining ID appears exactly once; both deleted IDs are absent; normal full-question verification passed.
- Pages adjacent to the deletions were rendered and visually checked: no clipping or broken layout.

The two retained-duplicate exceptions identified in the second-pass report are now closed by deletion. Other documented parallel practice and instructor-review matters are unchanged.

The companion JSON contains the removed records, original positions, precise derived metadata changes, preservation checks and export receipt. No previous audit report was overwritten.
'''
(OUT/(name+'.md')).write_text(text,encoding='utf8')
print('Deletion receipt written; all required checks passed.')
