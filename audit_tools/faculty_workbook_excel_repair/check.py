"""Read-only OOXML semantics, behavior/readback, and regression counterexamples.

Run with bundled Python (openpyxl is used only for reading). No workbook is saved.
"""
import argparse, csv, hashlib, json, posixpath
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
from openpyxl import load_workbook
from openpyxl.utils.cell import range_boundaries, get_column_letter

NS = {'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'p':'http://schemas.openxmlformats.org/package/2006/relationships',
      'c':'http://schemas.openxmlformats.org/package/2006/content-types'}
HEADERS = 'QuestionID Pool Difficulty QuestionText OptionA OptionB OptionC OptionD CorrectAnswer Feedback Tag Type Objective ObjectiveLabel PrimarySkill RepairSkill CommonError ConceptCluster SecondarySkills Hint ImageFile LegacyImageNote BossEligible AnswerVerified Notes AnswerLengthAudit DuplicateAudit IDConventionNote DraftStatus DraftMessage NextStep GraphRequired AnswerHash ImageAlt GraphDescription BossStage'.split()

def target(base, value):
    return posixpath.normpath(value.lstrip('/') if value.startswith('/') else posixpath.join(posixpath.dirname(base), value))

def package_check(parts):
    # Parse every XML part, including relationships (invalid characters fail here).
    xml = {p: ET.fromstring(data) for p, data in parts.items() if p.endswith(('.xml','.rels'))}
    sheet_record = next(s for s in xml['xl/workbook.xml'].findall('s:sheets/s:sheet',NS) if s.get('name')=='Question_Bank')
    rel = next(r for r in xml['xl/_rels/workbook.xml.rels'] if r.get('Id')==sheet_record.get('{'+NS['r']+'}id'))
    assert rel.get('Type').endswith('/worksheet') and rel.get('TargetMode') != 'External'
    sheet_path = target('xl/workbook.xml',rel.get('Target'))
    sheet = xml[sheet_path]
    strings = [''.join(s.itertext()) for s in xml['xl/sharedStrings.xml']]
    cells = {c.get('r'):c for c in sheet.findall('s:sheetData/s:row/s:c',NS)}
    def value(c):
        if c.get('t') == 's': return strings[int(c.find('s:v',NS).text)]
        if c.get('t') == 'inlineStr': return ''.join(c.find('s:is',NS).itertext())
        v=c.find('s:v',NS); return v.text if v is not None else ''
    headers = [value(cells[f'{get_column_letter(i)}1']) for i in range(1,37)]
    assert headers == HEADERS, 'Worksheet schema changed'
    assert max(range_boundaries(c)[2] for c in cells)==36, 'Unexpected worksheet column extent'
    assert max(range_boundaries(c)[3] for c in cells)==301, 'Expected 300 drafting rows'
    table_parts = sheet.find('s:tableParts',NS)
    assert table_parts is not None and table_parts.get('count')=='1' and len(table_parts)==1
    rel_path=posixpath.join(posixpath.dirname(sheet_path),'_rels',posixpath.basename(sheet_path)+'.rels')
    rels=list(xml[rel_path]); assert len({r.get('Id') for r in rels})==len(rels)
    table_rel=next(r for r in rels if r.get('Id')==table_parts[0].get('{'+NS['r']+'}id'))
    assert table_rel.get('Type').endswith('/table') and table_rel.get('TargetMode')!='External'
    table_path=target(sheet_path,table_rel.get('Target'))
    assert [p for p in xml if p.startswith('xl/tables/')]==[table_path], 'Orphan/extra table'
    assert any(c.get('PartName')=='/'+table_path and c.get('ContentType')=='application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml' for c in xml['[Content_Types].xml'])
    table=xml[table_path]
    assert int(table.get('id','0'))>0
    assert table.get('name')==table.get('displayName')=='QuestionBankTable', 'Invalid/unexpected table name'
    assert table.get('ref')=='A1:AJ301', 'Stale table range'
    assert table.get('headerRowCount','1')=='1'
    assert table.get('totalsRowCount','0')=='0' and table.get('totalsRowShown','0')=='0'
    filt=table.find('s:autoFilter',NS)
    assert filt is not None and filt.get('ref')==table.get('ref'), 'Missing/stale autoFilter'
    columns=table.find('s:tableColumns',NS)
    assert int(columns.get('count'))==len(columns)==36, 'Table column count/range mismatch'
    assert [c.get('id') for c in columns]==list(map(str,range(1,37))), 'Invalid column IDs'
    names=[c.get('name','') for c in columns]
    assert all(n.strip() for n in names) and len(set(n.casefold() for n in names))==36, 'Blank/duplicate names'
    assert names==headers, 'Table names disagree with worksheet headers'
    style=table.find('s:tableStyleInfo',NS)
    assert style.get('name')=='TableStyleMedium2' and style.get('showRowStripes')=='1'
    return table_path

def read_parts(file):
    with ZipFile(file) as z: return {p:z.read(p) for p in z.namelist()}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('workbook',nargs='?',default='downloads/resources/faculty-question-bank-validator.xlsx')
    parser.add_argument('--baseline')
    parser.add_argument('--out',default='validation_artifacts/faculty_workbook_excel_repair')
    args=parser.parse_args(); out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    parts=read_parts(args.workbook); table_path=package_check(parts)
    negatives=[]
    mutations={
        'stale range':lambda t:t.set('ref','A1:AE301'),
        'stale filter':lambda t:t.find('s:autoFilter',NS).set('ref','A1:AE301'),
        'wrong count':lambda t:t.find('s:tableColumns',NS).set('count','31'),
        'stale header':lambda t:t.find('s:tableColumns',NS)[21].set('name','ImageAccessibilityNote'),
        'duplicate name':lambda t:t.find('s:tableColumns',NS)[1].set('name','QuestionID'),
        'blank name':lambda t:t.find('s:tableColumns',NS)[1].set('name',''),
        'duplicate ID':lambda t:t.find('s:tableColumns',NS)[1].set('id','1'),
        'invalid table name':lambda t:t.set('name','bad name'),
    }
    for label,mutate in mutations.items():
        broken=dict(parts); t=ET.fromstring(parts[table_path]); mutate(t); broken[table_path]=ET.tostring(t)
        try: package_check(broken)
        except AssertionError: negatives.append(label)
        else: raise AssertionError('Guard missed '+label)
    wb=load_workbook(args.workbook,data_only=False); ws=wb['Question_Bank']
    assert wb.sheetnames==['Question_Bank','Lists','Validator_Summary','Examples','Instructions']
    validations={str(v.sqref):v.formula1 for v in ws.data_validations.dataValidation}
    for address,expected in {'B2:B301':'easyBoss','C2:C301':'legendary','I2:I301':'A,B,C,D','AF2:AF301':'TRUE,FALSE'}.items():
        assert expected in validations[address], address
    for row in range(2,302):
        assert 'INCOMPLETE' in ws[f'AC{row}'].value and 'CHECK ONLINE' in ws[f'AC{row}'].value and f'P{row}=""' in ws[f'AC{row}'].value
        assert 'https://masteryquests.org/tools/question-bank-validator/' in ws[f'AE{row}'].value
    cached=load_workbook(args.workbook,data_only=True)
    assert [cached['Validator_Summary'][f'B{r}'].value for r in range(3,6)]==[5,0,5]
    with (out/'sample.tsv').open('w',encoding='utf-8',newline='') as stream:
        csv.writer(stream,delimiter='\t',lineterminator='\n').writerows(cached['Question_Bank'].iter_rows(min_row=1,max_row=6,min_col=1,max_col=36,values_only=True))
    baseline_failure=None
    if args.baseline:
        before=read_parts(args.baseline)
        try: package_check(before)
        except AssertionError as e: baseline_failure=str(e)
        else: raise AssertionError('Broken baseline unexpectedly passed')
        old=load_workbook(args.baseline,data_only=False)
        for name in wb.sheetnames:
            for row in old[name]:
                for cell in row:
                    current=wb[name][cell.coordinate]
                    assert cell.value==current.value,(name,cell.coordinate,'Content changed')
                    assert cell.number_format==current.number_format,(name,cell.coordinate,'Number format changed')
        # Diagnostic copy changes ONLY the five stale names; native normal-load
        # success isolates the repair trigger from the incomplete table coverage.
        t=ET.fromstring(before[table_path]); cols=t.find('s:tableColumns',NS)
        for i,col in enumerate(cols): col.set('name',HEADERS[i])
        before[table_path]=ET.tostring(t,encoding='utf-8',xml_declaration=True)
        with ZipFile(out/'diagnostic-header-only.xlsx','w',ZIP_DEFLATED) as z:
            for p,data in before.items(): z.writestr(p,data)
    result={'status':'PASS','table':table_path,'range':'A1:AJ301','columns':36,'negativeFixturesRejected':negatives,'brokenBaselineRejected':baseline_failure,'baselineCellValuesFormulasNumberFormats':'identical' if args.baseline else 'not compared','validations':validations,'cachedSummary':[5,0,5],'sampleRows':5,'sha256':hashlib.sha256(Path(args.workbook).read_bytes()).hexdigest()}
    (out/'package-check.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8'); print(json.dumps(result,indent=2))

if __name__=='__main__': main()
