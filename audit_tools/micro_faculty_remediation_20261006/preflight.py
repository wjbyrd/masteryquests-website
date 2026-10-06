"""Read-only faculty evidence ingestion and current canonical baseline."""
import collections, csv, hashlib, json, sys, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent
sys.path.insert(0, str(ROOT / 'tools'))
import export_faculty_question_bank as exporter
NODE = r'C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
WORKBOOK = Path(r'C:\Users\Jennings\Desktop\microeconomics_manual_review.xlsx')
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

with zipfile.ZipFile(WORKBOOK) as z:
    strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
    sheets = ET.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS)
    rels = {x.attrib['Id']: x.attrib['Target'] for x in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    sheet = next(x for x in sheets if x.attrib['name'] == 'Question Review')
    target = rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
    path = target.lstrip('/') if target.startswith('/') else 'xl/' + target
    rows = []
    for row in ET.fromstring(z.read(path)).findall('m:sheetData/m:row', NS):
        cells = {}
        for c in row.findall('m:c', NS):
            column = ''.join(x for x in c.attrib['r'] if x.isalpha())
            v = c.find('m:v', NS)
            value = v.text if v is not None else ''
            if c.attrib.get('t') == 's': value = strings[int(value)]
            elif c.attrib.get('t') == 'inlineStr': value = ''.join(c.find('m:is', NS).itertext())
            cells[column] = value or ''
        rows.append((int(row.attrib['r']), cells))
header = next(n for n, c in rows if c.get('C') == 'Question ID')
manifest = []
for n,c in rows:
    if n <= header or not c.get('C'): continue
    r = dict(zip(['pages','topic','id','issue','fix','pass','note'], [c.get(k,'').strip() for k in 'ABCDEFG']))
    r['workbook_row'] = n
    r['state'] = 'FACULTY PASS' if r['pass'].lower() == 'pass' else 'FACULTY FLAG' if r['issue'] or r['fix'] else 'UNREVIEWED'
    manifest.append(r)
lib = exporter.load_library(ROOT / exporter.SOURCE)
records, occurrences = exporter.collect(lib)
answer_audit = exporter.audit_answers_and_routes(lib, records, ROOT, NODE)
areas = exporter.partition_disciplines(records, exporter.course_area_memberships(lib, ROOT, NODE))
micro = areas['micro']
ids = [r['id'] for r in manifest]
graphs = collections.defaultdict(list)
for qid,r in micro.items():
    if r['q'].get('image'):
        resolved = exporter.resolve_image(r['q'], ROOT/'build/faculty-build-composer/data',lib)
        graphs[str(resolved)].append(qid)
summary = {
    'workbook':str(WORKBOOK), 'workbook_sha256':sha(WORKBOOK),
    'counts':dict(collections.Counter(r['state'] for r in manifest)), 'rows':len(manifest),
    'duplicate_workbook_ids':[k for k,v in collections.Counter(ids).items() if v>1],
    'workbook_ids_not_in_micro':sorted(set(ids)-micro.keys()),
    'micro_ids_missing_from_workbook':sorted(micro.keys()-set(ids)),
    'pass_flag_conflicts':[r['id'] for r in manifest if r['state']=='FACULTY PASS' and (r['issue'] or r['fix'])],
    'note_only_unreviewed':[r['id'] for r in manifest if r['state']=='UNREVIEWED' and r['note']],
    'canonical_distinct':len(records), 'canonical_occurrences':occurrences,
    'area_counts':{k:len(v) for k,v in areas.items()},
    'micro_topics':len({exporter.display_topic(r['q'].get('tag','')) for r in micro.values()}),
    'graph_questions':sum(map(len,graphs.values())), 'unique_graph_assets':len(graphs),
    'deleted_ids_present':sorted(set(records)&{'42660','42697'}),
    'flag_categories':dict(collections.Counter(r['issue'] for r in manifest if r['state']=='FACULTY FLAG')),
}
OUT.mkdir(exist_ok=True)
def write(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2,default=lambda o:sorted(o) if isinstance(o,set) else str(o))+'\n',encoding='utf-8')
write('faculty_decisions.json',manifest)
write('preflight.json',summary)
write('baseline_records.json',{qid:{**r,'areas':[a for a,g in areas.items() if qid in g]} for qid,r in records.items()})
write('graph_references.json',graphs)
protected = [p for base in ['build/faculty-build-composer','tools','audit_tools'] for p in (ROOT/base).rglob('*') if p.is_file() and p.suffix in {'.js','.mjs','.cjs','.py','.json'} and OUT not in p.parents]
write('baseline_hashes.json',{p.relative_to(ROOT).as_posix():sha(p) for p in protected})
baseline = OUT/'baseline_composer_library.js'
if not baseline.exists(): baseline.write_bytes((ROOT/exporter.SOURCE).read_bytes())
write('flags_with_context.json',[{**r,'canonical':records.get(r['id'])} for r in manifest if r['state']=='FACULTY FLAG'])
print(json.dumps(summary,ensure_ascii=False,indent=2))
