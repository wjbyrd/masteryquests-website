"""Read-only comparison of workbook content, formatting, and native controls."""
from pathlib import Path
from copy import copy
import json
from openpyxl import load_workbook

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / 'faculty_exports'
changes = {c['id'] for c in json.loads((HERE / 'expectations.json').read_text(encoding='utf8'))['changes']}
results = []
def signature(cell):
    return tuple(str(copy(getattr(cell, p))) for p in ('font', 'fill', 'border', 'alignment', 'number_format', 'protection'))
for filename in ['general_economics_question_bank.xlsx', 'microeconomics_question_bank.xlsx', 'macroeconomics_question_bank.xlsx', 'microeconomics_manual_review.xlsx']:
    before = load_workbook(HERE / 'baseline' / filename)
    after = load_workbook(OUT / filename)
    assert before.sheetnames == after.sheetnames
    manual = 'manual' in filename
    scanned = 0
    for bs, sheet in zip(before, after):
        assert (bs.max_row, bs.max_column) == (sheet.max_row, sheet.max_column)
        assert bs.sheet_state == sheet.sheet_state
        assert bs.freeze_panes == sheet.freeze_panes
        assert list(bs.merged_cells.ranges) == list(sheet.merged_cells.ranges)
        assert bs.data_validations == sheet.data_validations
        assert list(bs.tables) == list(sheet.tables)
        for name in bs.tables:
            b, a = bs.tables[name], sheet.tables[name]
            assert b.ref == a.ref and b.tableStyleInfo == a.tableStyleInfo
            assert [c.name for c in b.tableColumns] == [c.name for c in a.tableColumns]
        assert {k: (v.width, v.hidden) for k,v in bs.column_dimensions.items()} == {k: (v.width, v.hidden) for k,v in sheet.column_dimensions.items()}
        bstyles, astyles = {}, {}
        for brow, row in zip(bs.iter_rows(), sheet.iter_rows()):
            revised = not manual and str(row[0].value) in changes
            if not revised:
                assert bs.row_dimensions[row[0].row].height == sheet.row_dimensions[row[0].row].height, (filename, row[0].row, 'Row height')
            for b, a in zip(brow, row):
                assert a.data_type != 'e', (filename, a.coordinate, a.value)
                assert (b.data_type == 'f') == (a.data_type == 'f'), (filename, a.coordinate, 'Formula changed')
                editable = (revised and (a.column in [4,6] or 7 <= a.column <= 13)) or (manual and sheet.title == 'Question Review' and a.column == 1 and a.row > 1)
                if not editable:
                    assert b.value == a.value, (filename, a.coordinate, 'Unrelated content changed')
                if not revised:
                    if b.style_id not in bstyles: bstyles[b.style_id] = signature(b)
                    if a.style_id not in astyles: astyles[a.style_id] = signature(a)
                    assert bstyles[b.style_id] == astyles[a.style_id], (filename, a.coordinate, 'Unrelated style changed')
                scanned += 1
    results.append({'file': filename, 'cellsScanned': scanned, 'unrelatedContentAndFormattingPreserved': True, 'nativeControlsPreserved': True, 'formulaErrors': 0})
    before.close()
    after.close()
result = {'status': 'PASS', 'workbooks': results}
(HERE / 'workbook-scope-validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
