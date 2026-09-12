"""Freeze v2 authorities and prepare only explicitly selected style candidates."""
import copy
import qa_remediation as q
from pypdf import PdfReader
RUN='style_restoration_v1';EVIDENCE='validation_artifacts/pdf_accessibility/'+RUN
PILOT=['MACRO-11','MACRO-13','MACRO-16','MACRO-20','GEN-ECON-09','MICRO-52','MICRO-51']
def initialize():
    q.root_guard()
    if q.contained(EVIDENCE+'/baseline.json').exists():return
    root=q.root_guard();probe=q.contained('tmp/pdf_accessibility/style-restoration-write-probe');probe.parent.mkdir(parents=True,exist_ok=True);probe.write_text('probe');probe.unlink()
    protected={p:h for p,h in q.read_json(q.EVIDENCE+'/baseline.json')['protected'].items()}
    for v in ['v1','v2']:
        for p in q.contained('validation_artifacts/concept_review_owner_review/'+v).rglob('*'):
            if p.is_file():protected[str(p.relative_to(root))]=q.sha(p)
    accepted=q.read_json(q.EVIDENCE+'/final_validation.json')
    for r in accepted:protected[r['output']]=q.sha(r['output']);protected[r['validatorReport']]=q.sha(r['validatorReport'])
    protected[q.SOURCE]=q.sha(q.SOURCE)
    q.write_json(EVIDENCE+'/baseline.json',{'task':'CONCEPT_REVIEW_STYLE_RESTORATION_V1','root':str(root),'branch':'main',
        'head':q.subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'status':'clean','writeAccess':'PASS','protected':protected})
    q.write_json(EVIDENCE+'/source_v2.json',q.read_json(q.SOURCE));q.write_json(EVIDENCE+'/semantics_v2.json',q.read_json(q.SEMANTICS))
    q.write_json(EVIDENCE+'/affected.json',[r['code'] for r in q.read_json(q.EVIDENCE+'/dispositions.json') if r['changed']])
def prepare(codes):
    initialize()
    from qa_renderer import draw,table_image
    from tag_pilot import normalized
    sem=q.read_json(q.SEMANTICS);old=q.read_json(EVIDENCE+'/semantics_v2.json');sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']}
    assert set(codes)<=set(q.read_json(EVIDENCE+'/affected.json'))
    for code in codes:
        meta=copy.deepcopy(old['pilot'][code]);meta['styleRestoration']={'task':'CONCEPT_REVIEW_STYLE_RESTORATION_V1','contentAuthority':'v2','visualAuthority':'v1'}
        if meta.get('tableRequired'):
            im,regions=table_image(meta['tableSource'],styled=True);meta['graphDecodedSha256']=q.hashlib.sha256(im.tobytes()).hexdigest();meta['tableRegions']=regions
        visual=q.contained(f'tmp/pdf_accessibility/{RUN}/prepared/{code}.pdf');layout=draw(sources[code],visual,meta)
        reader=PdfReader(visual);text=normalized(reader.pages[0].extract_text())
        # Exact v2 text remains authoritative; layout may change wrapping only.
        assert q.hashlib.sha256(text.encode()).hexdigest()==old['pilot'][code]['qaRemediation']['authorizedTextSha256'],('CONTENT REGRESSION',code)
        meta['decorativeImageDecodedSha256']=[]
        for ref in reader.pages[0]['/Resources'].get('/XObject',{}).values():
            obj=ref.get_object();h=q.hashlib.sha256(obj.get_data()).hexdigest()
            if h!=meta.get('graphDecodedSha256'):meta['decorativeImageDecodedSha256'].append(h)
        sem['pilot'][code]=meta;q.write_json(EVIDENCE+'/layouts/'+code+'.json',layout)
        print(code,'PREPARED content identical',flush=True)
    q.write_json(q.SEMANTICS,sem)
if __name__=='__main__':
    import sys
    prepare(sys.argv[1:]) if len(sys.argv)>1 else initialize()
