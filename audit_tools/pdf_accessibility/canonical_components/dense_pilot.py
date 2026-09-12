"""Isolated eight-resource dense pilot; no promotion or active metadata writes."""
import sys,copy,importlib.util,hashlib,json,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import qa_remediation as q
from pypdf import PdfReader
from tag_pilot import tag_one,normalized
from accessibility_gate import inspect
from canonical_components.dense_modes import graph_image_dense,validate_layout
from test_canonical_template import observe,check,REFERENCE

OUT='validation_artifacts/pdf_accessibility/canonical_dense_v1'
STAGE='tmp/pdf_accessibility/canonical_dense_v1'
CHANGED=['MACRO-11','MACRO-13','MACRO-16','MACRO-20','MICRO-52','GEN-ECON-09']
CONTROLS=['GEN-ECON-01','MICRO-49']

def main():
    q.root_guard();spec=importlib.util.spec_from_file_location('dense_renderer',q.contained('audit_tools/pdf_accessibility/canonical_components/pilot_renderer.py'))
    renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
    sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};sem=q.read_json(q.SEMANTICS)
    old={r['code']:r for r in q.read_json('validation_artifacts/pdf_accessibility/style_restoration_v1/final_validation.json')}
    frozen={p:q.sha(p) for p in [q.SOURCE,q.SEMANTICS,'audit_tools/pdf_accessibility/canonical_components/specification.json','audit_tools/pdf_accessibility/qa_template.py']}
    reference=observe(REFERENCE);results=[]
    original_binding=q.validate_source_binding
    def binding(source,meta):
        errors=original_binding(source,meta)
        if meta.get('canonicalDense',{}).get('sourceKind'):
            im,alt,e=graph_image_dense(source['content']['graphSpec']['kind'])
            valid=hashlib.sha256(im.tobytes()).hexdigest()==meta['graphDecodedSha256'] and alt==meta['graphAlternative'] and e['modelSha256']==meta['canonicalDense']['modelSha256']
            errors=[x for x in errors if x!='QA_GRAPH_SOURCE_MISMATCH']
            if not valid:errors.append('CANONICAL_DENSE_GRAPH_SOURCE_MISMATCH')
        return errors
    for code in CHANGED+CONTROLS:
        row={'code':code,'accepted':False};m=copy.deepcopy(sem['pilot'][code])
        try:
            if code in CHANGED:
                if code in ['MACRO-16','MICRO-52']:
                    im,alt,e=graph_image_dense(sources[code]['content']['graphSpec']['kind']);assert alt==m['graphAlternative']
                    asset=q.contained(STAGE+'/assets/'+code+'.png');asset.parent.mkdir(parents=True,exist_ok=True);im.save(asset)
                    m.update(canonicalDense=e,assetSourcePath=str(asset.relative_to(q.EXPECTED_ROOT)),assetSourceSha256=q.sha(asset),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
                if m.get('tableRequired'):
                    im,regions=renderer.canonical_table(m['tableSource'],dense=code=='MACRO-20');m.update(tableRegions=regions,graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
                    if code=='MACRO-20':m['canonicalDense']={'mode':'CANONICAL_TABLE_DENSE','tableTextFloor':9.5}
                visual=STAGE+'/visual/'+code+'.pdf';row['layout']=renderer.draw(sources[code],visual,m)
                reader=PdfReader(q.contained(visual));assert hashlib.sha256(normalized(reader.pages[0].extract_text()).encode()).hexdigest()==m['qaRemediation']['authorizedTextSha256']
                m['decorativeImageDecodedSha256']=[]
                for ref in reader.pages[0]['/Resources'].get('/XObject',{}).values():
                    h=hashlib.sha256(ref.get_object().get_data()).hexdigest()
                    if h!=m.get('graphDecodedSha256'):m['decorativeImageDecodedSha256'].append(h)
                output=STAGE+'/tagged/'+code+'.pdf';q.contained(output).parent.mkdir(parents=True,exist_ok=True)
                row.update(tag_one(sources[code],m,output,visual));row['layoutErrors']=validate_layout(row['layout'])
                rv=STAGE+'/rebuild/visual/'+code+'.pdf';repeat=STAGE+'/rebuild/'+code+'.pdf'
                renderer.draw(sources[code],rv,m);tag_one(sources[code],m,repeat,rv);row['deterministic']=q.sha(output)==q.sha(repeat);row['rebuildSHA256']=q.sha(repeat)
            else:
                output=old[code]['output'];row.update(output=output,reused=True,deterministic=q.sha(old[code]['determinismRebuild'])==q.sha(output),layoutErrors=[])
            try:
                q.validate_source_binding=binding
                row['semanticCheck']=inspect(q.contained(output),sources[code],q.contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf'),m)
            finally:q.validate_source_binding=original_binding
            row['fidelityErrors']=check(observe(output),reference);row['sha256']=q.sha(output)
            row['status']='MACHINE_REVIEW_PENDING';q.write_json(OUT+'/metadata/'+code+'.json',m)
        except (ValueError,AssertionError,KeyError) as e:row.update(status='BLOCKED',reason=str(e))
        results.append(row);print(code,row['status'],row.get('reason'),row.get('layoutErrors'),row.get('fidelityErrors'),row.get('semanticCheck',{}).get('errors'),flush=True)
    paths=[q.contained(r['output']) for r in results if r.get('output')]
    if paths:
        tools=q.contained('tmp/pdf_accessibility/repo_lock_v1/tools');scratch=q.contained(STAGE+'/validator');scratch.mkdir(exist_ok=True)
        cmd=[str(tools/'java/jdk-17.0.16+8-jre/bin/java.exe'),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={scratch}',f'-Dapp.home={tools / "verapdf"}','-cp',str(tools/'verapdf/bin/greenfield-apps-1.28.2.jar'),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json',*map(str,paths)]
        result=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8');q.contained(OUT+'/verapdf.json').write_text(result.stdout,encoding='utf-8')
        jobs=json.loads(result.stdout)['report']['jobs']
        bypath={str(Path(j['itemDetails']['name']).resolve()):j for j in jobs}
        for r in results:
            if r.get('output'):
                vals=bypath[str(q.contained(r['output']))].get('validationResult',[]);r['pdfUaPass']=len(vals)==1 and vals[0]['compliant'] is True
    assert all(q.sha(p)==h for p,h in frozen.items()),'Frozen operational authority changed'
    q.write_json(OUT+'/pilot_results.json',{'task':'CONCEPT_REVIEW_CANONICAL_DENSE_LAYOUTS_V1','records':results,'humanAT':'PENDING','pilotDecision':'RENDER_REVIEW_REQUIRED'})
if __name__=='__main__':main()
