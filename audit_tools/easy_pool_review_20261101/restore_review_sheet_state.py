"""Restore worksheet visibility, which the spreadsheet runtime does not round-trip.

Cell authoring stays in Artifact Tool. This patches only unsupported native
worksheet visibility metadata, preserving the ZIP members and their contents.
"""
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import re, html
HERE=Path(__file__).resolve().parent
path=HERE.parents[1]/'faculty_exports/microeconomics_manual_review.xlsx'
baseline=HERE/'baseline/microeconomics_manual_review.xlsx'
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with ZipFile(baseline) as z:
    sheets=ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet',ns)
    states={s.attrib['name']:s.attrib.get('state','visible') for s in sheets}
with ZipFile(path) as z:
    entries=[(info,z.read(info.filename)) for info in z.infolist()]
text=next(data for info,data in entries if info.filename=='xl/workbook.xml').decode('utf8')
def patch(m):
    tag=m.group()
    name=html.unescape(re.search(r'\bname="([^"]*)"',tag).group(1))
    state=states[name]
    tag=re.sub(r'\sstate="[^"]*"','',tag)
    return tag[:-2]+f' state="{state}"/>'
updated,count=re.subn(r'<(?:\w+:)?sheet\s[^>]+/>',patch,text)
assert count==len(states),(count,states)
check=ET.fromstring(updated).findall('s:sheets/s:sheet',ns)
assert {s.attrib['name']:s.attrib.get('state','visible') for s in check}==states
temporary=path.with_suffix('.xlsx.tmp')
with ZipFile(temporary,'w') as z:
    for info,data in entries:z.writestr(info,updated.encode('utf8') if info.filename=='xl/workbook.xml' else data)
temporary.replace(path)
print('Restored original worksheet visibility:',states)
