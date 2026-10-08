import csv,json,pathlib
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1]
matrix=json.loads((D/'audit-rows.json').read_text(encoding='utf-8'))
file=R/'faculty_exports/audits/macro_faculty_voice_cleanup_pass3_20261007.csv'
with file.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.reader(f))
assert rows==[[str(v) for v in row] for row in matrix]
assert len(rows)==119 and all(len(row)==16 for row in rows)
assert len({row[0] for row in rows[1:]})==118
report=(R/'faculty_exports/audits/macro_faculty_voice_cleanup_pass3_20261007.md').read_text(encoding='utf-8')
assert '**PASS.**' in report and '34/34' in report and '25/25' in report
result={'status':'PASS','csvRows':118,'columns':16,'fullMultilineRoundTrip':True,'previewInspected':True}
(D/'ledger-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result))
