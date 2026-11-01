"""Read-only XLSX/CSV parity and preservation checks, independent of the authoring library."""
from pathlib import Path
from zipfile import ZipFile
import csv,json,xml.etree.ElementTree as ET
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=ROOT/'faculty_exports'
NS={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read_book(path):
    with ZipFile(path) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            shared=[''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',NS)]
        book=ET.fromstring(z.read('xl/workbook.xml'))
        rels={e.attrib['Id']:e.attrib['Target'] for e in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        result={}
        for sheet in book.findall('s:sheets/s:sheet',NS):
            target=rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
            target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
            root=ET.fromstring(z.read(target));rows=[]
            for row in root.findall('s:sheetData/s:row',NS):
                values={}
                for c in row.findall('s:c',NS):
                    label=''.join(x for x in c.attrib['r'] if x.isalpha());index=0
                    for x in label:index=index*26+ord(x)-64
                    kind=c.attrib.get('t');v=c.find('s:v',NS)
                    value=shared[int(v.text)] if kind=='s' else ''.join(c.find('s:is',NS).itertext()) if kind=='inlineStr' else v.text if v is not None else ''
                    values[index-1]=value
                rows.append([values.get(i,'') for i in range(max(values,default=-1)+1)])
            def validations():
                return sorted((e.attrib.get('sqref'),e.attrib.get('type'),e.findtext('s:formula1','',NS),e.findtext('s:formula2','',NS)) for e in root.findall('s:dataValidations/s:dataValidation',NS))
            result[sheet.attrib['name']]={'rows':rows,'state':sheet.attrib.get('state','visible'),'validations':validations(),'tables':len(root.findall('s:tableParts/s:tablePart',NS))}
        return result

report=[]
for stem in ['general_economics','microeconomics','macroeconomics']:
    with (OUT/f'{stem}_question_bank.csv').open(encoding='utf-8-sig',newline='') as f:expected=list(csv.reader(f))
    actual=next(iter(read_book(OUT/f'{stem}_question_bank.xlsx').values()))['rows']
    assert len(actual)==len(expected),(stem,len(actual),len(expected))
    for i,(a,e) in enumerate(zip(actual,expected)):
        a=a+['']*(len(e)-len(a));assert a==e,(stem,i,a,e)
    report.append({'file':stem+'_question_bank.xlsx','rows':len(actual)-1,'allCellsMatchCsv':True})
before=read_book(HERE/'baseline/microeconomics_manual_review.xlsx')
after=read_book(OUT/'microeconomics_manual_review.xlsx')
assert list(before)==list(after)
for name in before:
    for feature in ['state','validations','tables']:assert before[name][feature]==after[name][feature],(name,feature,before[name][feature],after[name][feature])
    b,a=before[name]['rows'],after[name]['rows'];assert len(a)==len(b)
    for i,(br,ar) in enumerate(zip(b,a)):
        width=max(len(br),len(ar));br+=['']*(width-len(br));ar+=['']*(width-len(ar))
        if name=='Question Review' and i:assert br[1:]==ar[1:],(name,i,'reviewer columns')
        else:assert br==ar,(name,i)
report.append({'file':'microeconomics_manual_review.xlsx','reviewerColumnsAndDropdownsPreserved':True,'hiddenSheetPreserved':True})
pages=json.loads((OUT/'validation_summary.json').read_text(encoding='utf-8'))['disciplines']['micro']['question_pages']
for row in after['Question Review']['rows'][1:]:
    if row[2]:assert row[0]==str(pages.get(row[2],'Not in bank')),(row[2],row[0])
with (HERE/'baseline/microeconomics_manual_review.csv').open(encoding='utf-8-sig',newline='') as f:old_csv=list(csv.reader(f))
with (OUT/'microeconomics_manual_review.csv').open(encoding='utf-8-sig',newline='') as f:new_csv=list(csv.reader(f))
assert len(old_csv)==len(new_csv)
assert old_csv[0]==new_csv[0]
for old_row,new_row in zip(old_csv[1:],new_csv[1:]):
    assert old_row[1:]==new_row[1:],'Manual CSV reviewer columns'
    if new_row[2]:assert new_row[0]==str(pages.get(new_row[2],'Not in bank'))
report[-1].update(allPageReferencesVerified=True,manualCsvReviewerColumnsPreserved=True)
(HERE/'excel-parity.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report))
