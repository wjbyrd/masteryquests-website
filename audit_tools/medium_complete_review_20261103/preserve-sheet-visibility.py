"""Restore existing hidden-sheet state unsupported by the Artifact Tool export API.

All cells are authored by Artifact Tool. This narrow OOXML preservation step only
restores baseline sheet visibility, leaving every other exported byte untouched.
"""
from pathlib import Path
from zipfile import ZipFile
import re, xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
target = HERE.parents[1] / 'faculty_exports/microeconomics_manual_review.xlsx'
baseline = HERE / 'baseline/microeconomics_manual_review.xlsx'
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with ZipFile(baseline) as z:
    sheets = ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet', ns)
states = {s.attrib['name']: s.attrib.get('state', 'visible') for s in sheets}
with ZipFile(target) as z:
    entries = [(item, z.read(item.filename)) for item in z.infolist()]
def restore(match):
    tag = match.group()
    name = re.search(r'\bname="([^"]*)"', tag).group(1)
    state = states[name]
    tag = re.sub(r'\sstate="[^"]*"', '', tag)
    return tag.replace('/>', f' state="{state}"/>') if state != 'visible' else tag
temporary = target.with_suffix('.visibility.tmp')
with ZipFile(temporary, 'w') as z:
    for item, data in entries:
        if item.filename == 'xl/workbook.xml':
            data, count = re.subn(r'<(?:\w+:)?sheet\b[^>]*/>', restore, data.decode('utf8'))
            assert count == len(states), 'Every sheet visibility restored'
            data = data.encode('utf8')
        z.writestr(item, data)
temporary.replace(target)
with ZipFile(target) as z:
    final = ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet', ns)
assert {s.attrib['name']: s.attrib.get('state', 'visible') for s in final} == states
print('Preserved original sheet visibility:', states)
