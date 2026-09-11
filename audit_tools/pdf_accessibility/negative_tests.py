"""Isolated negative probes against actual staged pilot PDFs; production is read-only."""
from repo_guard import *
from accessibility_gate import inspect,check_copies,active_gate
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,TextStringObject,NumberObject,ContentStream,DecodedStreamObject
import copy
root=root_guard();out=contained('tmp/pdf_accessibility/repo_lock_v1/negative');out.mkdir(parents=True,exist_ok=True)
meta=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')['pilot']
sources={r['code']:r for r in read_json('build/faculty-build-composer/data/concept-reviews/concept_review_source.json')['reviews']}
N=NameObject

def elements(obj):
    obj=obj.get_object() if hasattr(obj,'get_object') else obj
    if isinstance(obj,list):
        for child in obj:yield from elements(child)
    elif hasattr(obj,'get'):
        if obj.get('/S'):yield obj
        yield from elements(obj.get('/K',[]))

def mutate(name,code,fn):
    baseline=contained(f'tmp/pdf_accessibility/repo_lock_v1/pilot/after/{code}.pdf')
    writer=PdfWriter(clone_from=baseline)
    fn(writer)
    destination=contained(out/(name+'.pdf'));writer.write(destination)
    result=inspect(destination,sources[code],baseline,meta[code])
    return {'test':name,'file':str(destination.relative_to(root)),'detected':bool(result['errors']),'projectErrors':result['errors']}

def first_role(w,role):return next(e for e in elements(w._root_object['/StructTreeRoot']) if e['/S']=='/'+role)
def modify_stream(w,fn):
    p=w.pages[0];stream=ContentStream(p['/Contents'],w);fn(stream.operations)
    p[N('/Contents')]=w._add_object(stream)
def artifact(w):
    def patch(ops):
        for args,op in ops:
            if op==b'BDC' and args[0]=='/P':args[0]=N('/Artifact');return
        raise ValueError('No paragraph')
    modify_stream(w,patch)
def broken(w):
    def patch(ops):
        for args,op in ops:
            if op==b'BDC':args[1][N('/MCID')]=NumberObject(9999);return
    modify_stream(w,patch)
def replace_text(w,old,new):
    def patch(ops):
        for args,op in ops:
            if op==b'Tj' and old in str(args[0]):args[0]=TextStringObject(str(args[0]).replace(old,new,1));return
        raise ValueError('Target string not found')
    modify_stream(w,patch)
def duplicate(w):
    def patch(ops):
        for i,(args,op) in enumerate(ops):
            if op==b'Tj' and 'Scarcity means' in str(args[0]):ops.insert(i+1,copy.deepcopy((args,op)));return
        raise ValueError('Target text not found')
    modify_stream(w,patch)
def reorder(w):
    d=w._root_object['/StructTreeRoot']['/K'][0].get_object()
    d['/K'][0],d['/K'][1]=d['/K'][1],d['/K'][0]
def change_graph(w):
    xobjects=w.pages[0]['/Resources']['/XObject'];expected=meta['MACRO-23']['graphDecodedSha256']
    for key,ref in xobjects.items():
        obj=ref.get_object();raw=obj.get_data()
        if hashlib.sha256(raw).hexdigest()==expected:
            stream=DecodedStreamObject()
            for k,v in obj.items():
                if k not in ('/Filter','/DecodeParms','/Length'):stream[k]=v
            stream.set_data(bytes([raw[0]^255])+raw[1:]);xobjects[key]=w._add_object(stream);return
    raise ValueError('Graph not found')
rows=[]
rows.append(mutate('missing_real_structure','GEN-ECON-01',lambda w:w._root_object.pop(N('/StructTreeRoot'))))
rows.append(mutate('meaningful_block_artifacted','GEN-ECON-01',artifact))
rows.append(mutate('figure_missing_alternative','MACRO-23',lambda w:first_role(w,'Figure').pop(N('/Alt'))))
rows.append(mutate('figure_placeholder_alternative','MACRO-23',lambda w:first_role(w,'Figure').__setitem__(N('/Alt'),TextStringObject('A supply and demand graph'))))
rows.append(mutate('broken_content_association','GEN-ECON-01',broken))
rows.append(mutate('missing_language','GEN-ECON-01',lambda w:w._root_object.pop(N('/Lang'))))
rows.append(mutate('changed_formula','MACRO-23',lambda w:replace_text(w,'MV = PY','MV = PX')))
rows.append(mutate('changed_number','MACRO-23',lambda w:replace_text(w,'2,500','2,600')))
rows.append(mutate('duplicated_source_text','GEN-ECON-01',duplicate))
rows.append(mutate('stale_graph_description','MACRO-23',change_graph))
rows.append(mutate('wrong_reading_order','GEN-ECON-01',reorder))
a=contained('tmp/pdf_accessibility/repo_lock_v1/pilot/after/GEN-ECON-01.pdf');b=contained(out/'duplicated_source_text.pdf')
copy_errors,_=check_copies([a,b],sha(a),a.stat().st_size)
rows.append({'test':'mismatched_copy_bytes','detected':'ACTIVE_COPY_MISMATCH' in copy_errors,'projectErrors':copy_errors})
rows.append({'test':'missing_table_headers','detected':None,'status':'NOT_RUN','reason':'Pilot has no valid content-linked table fixture; cannot claim isolated header-removal coverage.'})
manifest=read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')
fixture=copy.deepcopy(manifest['reviews'][0]);fixture.update({'code':'UNVALIDATED-99','pdfPath':'UNVALIDATED-99.pdf'})
probe=active_gate({'reviews':[fixture]})[0]
rows.extend([
    {'test':'new_unvalidated_document','detected':'NO_VALIDATED_RELEASE_EVIDENCE' in probe['errors'],'projectErrors':probe['errors']},
    {'test':'missing_output','detected':'MISSING_OUTPUT' in probe['errors'],'projectErrors':probe['errors']}])
# Root rejection tests exercise actual resolved paths and boundary logic.
root_tests=[]
for value in ('tmp/pdf_accessibility/../escape',str(root.parent/(root.name+'-sibling')/'probe.tmp')):
    try:contained(value);passed=False
    except ValueError:passed=True
    root_tests.append({'case':'traversal' if '..' in Path(value).parts else 'sibling_prefix_collision','passed':passed})
junction=EXPECTED_ROOT/'tmp/pdf_accessibility/repo_lock_v1/guard-junction'
if junction.is_junction():
    try:contained(junction/'probe.tmp');passed=False
    except ValueError:passed=True
    root_tests.append({'case':'actual_windows_junction','passed':passed})
else:
    root_tests.append({'case':'actual_windows_junction','passed':None,'status':'NOT_RUN: create a task-local junction fixture first'})
write_json('validation_artifacts/pdf_accessibility/negative_tests.json',{'tests':rows,'rootTests':root_tests})
print([(r['test'],r['detected']) for r in rows],flush=True)
base=contained('tmp/pdf_accessibility/repo_lock_v1/tools')
command=[str(base/'java/jdk-17.0.16+8-jre/bin/java.exe'),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={out}',f'-Dapp.home={base / "verapdf"}', '-cp',str(base/'verapdf/bin/greenfield-apps-1.28.2.jar'),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json']+[str(contained(r['file'])) for r in rows if r.get('file')]
result=subprocess.run(command,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/negative_verapdf.json').write_text(result.stdout,encoding='utf-8')
contained('validation_artifacts/pdf_accessibility/negative_verapdf.stderr.log').write_text(result.stderr,encoding='utf-8')
byname={Path(j['itemDetails']['name']).stem:j['validationResult'][0] for j in json.loads(result.stdout)['report']['jobs']}
for row in rows:
    v=byname.get(row['test'])
    row['independentValidatorDetected']=not v['compliant'] if v else None
    if v:row['independentFailedRules']=[f"{rule['clause']}-{rule['testNumber']}" for rule in v['details']['ruleSummaries']]
write_json('validation_artifacts/pdf_accessibility/negative_tests.json',{'tests':rows,'rootTests':root_tests})
if not all(r['detected'] for r in rows if r['detected'] is not None):raise RuntimeError('Negative test failed')