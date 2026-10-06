import csv, json, hashlib, zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
from collections import Counter
from openpyxl import load_workbook

here=Path(__file__).parent
root=here.resolve().parents[1]
xlsx=root/'faculty_exports/microeconomics_manual_review.xlsx'
data=json.loads((here/'extraction.json').read_text(encoding='utf-8'))
lists=json.loads((here/'expected-lists.json').read_text(encoding='utf-8'))
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
# Artifact tool has no documented sheet-visibility surface. Set only the native
# OOXML visibility flag; all workbook content is authored with artifact tool.
with zipfile.ZipFile(xlsx) as z:
    parts={n:z.read(n) for n in z.namelist()}
tree=ET.fromstring(parts['xl/workbook.xml'])
for node in tree.findall('m:sheets/m:sheet',ns):
    if node.attrib['name']=='Dropdown Lists': node.set('state','hidden')
parts['xl/workbook.xml']=ET.tostring(tree,encoding='utf-8',xml_declaration=True)
# Preserve explicit blank allowance that artifact-tool omits in this export.
sheetxml=ET.fromstring(parts['xl/worksheets/sheet1.xml'])
for dv in sheetxml.findall('m:dataValidations/m:dataValidation',ns):
    dv.set('allowBlank','1')
parts['xl/worksheets/sheet1.xml']=ET.tostring(sheetxml,encoding='utf-8',xml_declaration=True)
with zipfile.ZipFile(xlsx,'w',zipfile.ZIP_DEFLATED) as z:
    for name, content in parts.items(): z.writestr(name,content)

w=load_workbook(xlsx)
s=w['Question Review']
assert [sh.title for sh in w if sh.sheet_state=='visible']==['Question Review']
assert w['Dropdown Lists'].sheet_state=='hidden'
headers=['Page(s)','Topic','Question ID',"What's Wrong?",'How to Fix','Pass']
assert list(next(s.values))==headers
expected=[[', '.join(map(str,r['pages'])),r['topic'],r['id'],None,None,None] for r in data['rows']]
actual=[list(r) for r in list(s.values)[1:]]
assert actual==expected
assert s.max_column==6 and s.max_row==len(expected)+1
assert all(s.cell(i,3).data_type=='s' and s.cell(i,3).number_format=='@' for i in range(2,s.max_row+1))
assert all(s.cell(i,j).value is None for i in range(2,s.max_row+1) for j in (4,5,6))
assert s.freeze_panes=='A2'
assert len(s.tables)==1
assert list(s.tables.values())[0].autoFilter.ref==f'A1:F{s.max_row}'
vals=list(s.data_validations.dataValidation)
assert len(vals)==3
for col,name,key in [('D','IssueChoices','issues'),('E','FixChoices','fixes'),('F','PassChoices','passes')]:
    dv=next(v for v in vals if str(v.sqref)==f'{col}2:{col}{s.max_row}')
    assert dv.type=='list' and dv.allowBlank and not dv.showDropDown
    assert dv.formula1.lstrip('=')==name
    dests=list(w.defined_names[name].destinations)
    assert w.defined_names[name].attr_text.count('$')==4
    assert len(dests)==1
    sh,ref=dests[0]
    choices=[c[0].value or '' for c in w[sh][ref]]
    assert choices==lists[key], (name,choices)
with (root/'faculty_exports/microeconomics_manual_review.csv').open(encoding='utf-8-sig',newline='') as f:
    csvrows=list(csv.reader(f))
assert csvrows[0]==headers
assert csvrows[1:]==[[v or '' for v in r] for r in expected]
assert len(set(r[2] for r in expected))==len(expected)
firsts={}
pages={}
for a in data['appearances']:
    firsts.setdefault(a['id'],a['topic'])
    pages.setdefault(a['id'],[]).append(a['page'])
assert list(firsts)==[r['id'] for r in data['rows']]
assert all(r['pages']==pages[r['id']] and r['topic']==firsts[r['id']] for r in data['rows'])
assert len(data['page_counts'])==data['summary']['pdf_pages']
assert hashlib.sha256((root/'faculty_exports/microeconomics_question_bank.pdf').read_bytes()).hexdigest()==data['summary']['source_sha256']
assert not any(c.data_type in ('e','f') for row in s for c in row)
result={**data['summary'],'status':'PASS','validation':'All PDF records, exact first-order rows/topics/page lists, text IDs, CSV parity, blank decisions, native dropdown ranges/options/blank allowance, hidden helper sheet, filters and freeze pane verified.'}
(here/'validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
