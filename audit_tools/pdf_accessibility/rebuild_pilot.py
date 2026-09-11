"""Rebuild only the eight approved pilot experiments; never installs or batches."""
from repo_guard import *
from tag_pilot import tag_one, validate_metadata, normalized
from pypdf import PdfReader
import sys, importlib

RUN='pilot_blockers_v1'
PILOT=('GEN-ECON-01','MICRO-04','MICRO-49','MICRO-54','MACRO-23','MACRO-24','MACRO-29','MACRO-42')

def build(output_directory=None,codes=None):
    root=root_guard()
    stage=contained(output_directory or f'tmp/pdf_accessibility/{RUN}/pilot')
    if not stage.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Staging required')
    (stage/'visual').mkdir(parents=True,exist_ok=True)
    sys.path.insert(0,str(contained('build/faculty-build-composer/tools')))
    sources={r['code']:r for r in read_json('build/faculty-build-composer/data/concept-reviews/concept_review_source.json')['reviews']}
    semantics=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')
    validate_metadata(semantics)
    selected=list(codes or PILOT)
    if len(selected)!=len(set(selected)) or any(code not in semantics['pilot'] for code in selected):raise ValueError('Unreviewed or duplicate resource selection')
    results=[]
    for code in selected:
        meta=semantics['pilot'][code].copy();source=sources[code];visual=None
        try:
            if code.startswith('MICRO-') and int(code.split('-')[-1])>=54 or code in {r['code'] for r in importlib.import_module('complete_macro_concept_reviews').REVIEWS}:
                module=importlib.import_module('expand_micro_concept_reviews' if code.startswith('MICRO') else 'complete_macro_concept_reviews')
                definition=next(r for r in module.REVIEWS if r['code']==code)
                # Current corrected instructional source remains authoritative.
                for key in ('outcome','core','recognition','watch','worked','check','time','difficulty','workedLabel'):
                    if definition[key]!=source['content'][key]:raise ValueError('Generator/source drift: '+key)
                if meta.get('formulaCard') and definition.get('formulaLines')!=[f['text'] for f in meta['formulaCard']]:
                    raise ValueError('Formula card/source drift')
                visual=stage/'visual'/(code+'.pdf')
                module.draw_review(definition,visual,contained('assets/images/mastery-quests-logo-standalone.png'),contained('build/faculty-build-composer/data'))
                old=PdfReader(contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf')).pages[0].extract_text()
                new=PdfReader(visual).pages[0].extract_text()
                if normalized(old)!=normalized(new):raise ValueError('Regeneration changed text, signs or numbers')
            if meta.get('descriptionKey'):meta['graphAlternative']=semantics['descriptions'][meta['descriptionKey']]
            row=tag_one(source,meta,stage/'after'/(code+'.pdf'),visual)
            row['visualSource']=str(visual.relative_to(root)) if visual else None
            row['sha256']=sha(contained(row['output']))
        except (ValueError,KeyError) as exc:
            row={'code':code,'status':'REJECTED','reason':str(exc)}
        results.append(row);print(code,row['status'],row.get('reason',''),flush=True)
    return results

if __name__=='__main__':
    rows=build()
    write_json(f'validation_artifacts/pdf_accessibility/{RUN}/pilot_results.json',{'task':'PDF_ACCESSIBILITY_PILOT_BLOCKERS_V1','installed':False,'batchRun':False,'results':rows})
    raise SystemExit(1 if any(r['status']=='REJECTED' for r in rows) else 0)
