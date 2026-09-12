"""Resumable isolated pilot. Never promotes metadata, candidates or a review pack."""
import copy,importlib.util
import qa_remediation as q
from pypdf import PdfReader
from tag_pilot import tag_one,normalized
from accessibility_gate import inspect

RUN='canonical_template_v1'
EVIDENCE='validation_artifacts/pdf_accessibility/'+RUN
PILOT=['MACRO-11','MACRO-13','MACRO-16','MACRO-20','MICRO-52','GEN-ECON-09']

def main():
    q.root_guard()
    spec=importlib.util.spec_from_file_location('canonical_pilot_renderer',q.contained('audit_tools/pdf_accessibility/canonical_components/pilot_renderer.py'))
    renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
    sources={r['code']:r for r in q.read_json(q.SOURCE)['reviews']};sem=q.read_json(q.SEMANTICS)
    before={p:q.sha(p) for p in [q.SOURCE,q.SEMANTICS]};results=[]
    for code in PILOT:
        meta=copy.deepcopy(sem['pilot'][code]);entry={'code':code,'accepted':False}
        visual=f'tmp/pdf_accessibility/{RUN}/pilot/{code}.pdf'
        try:
            if meta.get('tableRequired'):
                im,regions=renderer.canonical_table(meta['tableSource'])
                meta['tableRegions']=regions;meta['graphDecodedSha256']=q.hashlib.sha256(im.tobytes()).hexdigest()
            entry['layout']=renderer.draw(sources[code],visual,meta)
            pdf=PdfReader(q.contained(visual))
            assert q.hashlib.sha256(normalized(pdf.pages[0].extract_text()).encode()).hexdigest()==meta['qaRemediation']['authorizedTextSha256']
            meta['decorativeImageDecodedSha256']=[]
            for ref in pdf.pages[0]['/Resources'].get('/XObject',{}).values():
                h=q.hashlib.sha256(ref.get_object().get_data()).hexdigest()
                if h!=meta.get('graphDecodedSha256'):meta['decorativeImageDecodedSha256'].append(h)
            output=f'tmp/pdf_accessibility/{RUN}/tagged/{code}.pdf';q.contained(output).parent.mkdir(parents=True,exist_ok=True)
            entry.update(tag_one(sources[code],meta,output,visual))
            entry['semanticCheck']=inspect(q.contained(output),sources[code],q.contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf'),meta)
            repeat=f'tmp/pdf_accessibility/{RUN}/rebuild/{code}.pdf';rv=f'tmp/pdf_accessibility/{RUN}/rebuild/visual/{code}.pdf'
            renderer.draw(sources[code],rv,meta);tag_one(sources[code],meta,repeat,rv)
            entry.update(sha256=q.sha(output),rebuildSHA256=q.sha(repeat),deterministic=q.sha(output)==q.sha(repeat),contentComparison='EXACT V2/V3 NORMALIZED TEXT')
        except (ValueError,AssertionError) as exc:entry.update(status='BLOCKED',reason=str(exc))
        results.append(entry);print(code,entry['status'],entry.get('reason',''),flush=True)
    paths=[q.contained(r['output']) for r in results if r.get('output')]
    if paths:
        tools=q.contained('tmp/pdf_accessibility/repo_lock_v1/tools');scratch=q.contained('tmp/pdf_accessibility/'+RUN+'/validator');scratch.mkdir(exist_ok=True)
        command=[str(tools/'java/jdk-17.0.16+8-jre/bin/java.exe'),'-Djava.awt.headless=true',f'-Djava.io.tmpdir={scratch}',f'-Dapp.home={tools / "verapdf"}',
                 '-cp',str(tools/'verapdf/bin/greenfield-apps-1.28.2.jar'),'org.verapdf.apps.GreenfieldCliWrapper','--flavour','ua1','--format','json',*map(str,paths)]
        result=q.subprocess.run(command,capture_output=True,text=True,encoding='utf-8')
        q.contained(EVIDENCE+'/verapdf.json').write_text(result.stdout,encoding='utf-8')
    assert all(q.sha(p)==h for p,h in before.items()),'Canonical source/semantics were modified'
    q.write_json(EVIDENCE+'/pilot_results.json',{'task':'CONCEPT_REVIEW_GEN_ECON_01_TEMPLATE_ALIGNMENT_V1','accepted':False,'batchAuthorizedByPilot':False,'records':results})
    # A machine pass alone cannot approve this pilot. Render review is mandatory.
    return 1 if any(r['status']=='BLOCKED' for r in results) else 0

if __name__=='__main__':raise SystemExit(main())
