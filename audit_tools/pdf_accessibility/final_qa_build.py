"""Final faculty QA: staged generation, strict source binding, and evidence.

Run from repository root. Installation remains behind install_validated's full
independent-validation, source, semantic, byte-bound review and rollback gates.
"""
from repo_guard import *
import copy,sys,re
from PIL import Image
from pypdf import PdfReader
from tag_pilot import source_hash,normalized,tag_one,validate_metadata
from final_qa_content import revise,difficulty_rows
from canonical_components.pilot_renderer import draw,canonical_table
from canonical_components.dense_modes import validate_layout
from qa_remediation import formulas

RUN='final_qa_20260919'
TMP=f'tmp/pdf_accessibility/{RUN}'
EVIDENCE=f'validation_artifacts/pdf_accessibility/{RUN}'
BASE=f'{TMP}/baseline'
DEST='build/faculty-build-composer/data/concept-reviews'
SOURCE=f'{DEST}/concept_review_source.json'
SEMANTICS=f'{DEST}/accessibility_semantics.json'
ASSETS=f'{DEST}/authoring/final-qa-visuals'
AUTH='CONCEPT_REVIEW_FINAL_QA_20260919'
BASELINE_COMMIT='9bcbd50fde6e05f15d9ab255d2bac5f5b19db22f'

def restore_baseline():
    """Reconstruct immutable inputs on a fresh checkout without resetting git."""
    contained(BASE).mkdir(parents=True,exist_ok=True)
    for name in ['concept_review_source.json','accessibility_semantics.json','manifest.json','accessibility_releases.json']:
        p=contained(BASE+'/'+name)
        if not p.exists():p.write_bytes(subprocess.check_output(['git','show',BASELINE_COMMIT+':'+DEST+'/'+name]))
    for r in read_json(BASE+'/concept_review_source.json')['reviews']:
        name=r['code']+'.pdf';p=contained(BASE+'/'+name)
        if not p.exists():p.write_bytes(subprocess.check_output(['git','show',BASELINE_COMMIT+':'+DEST+'/'+name]))

def validate_binding(source,meta):
    b=meta['qaRemediation'];e=[]
    if b['sourceRecordSha256']!=source_hash(source):e.append('STALE_FINAL_QA_SOURCE')
    if b['auditSourceSha256']!=sha(EVIDENCE+'/source_before.json'):e.append('STALE_FINAL_QA_BASELINE')
    if b['decisionSha256']!=sha(EVIDENCE+'/decisions.json'):e.append('STALE_FINAL_QA_DECISIONS')
    if source['content'].get('renderProfile')!='final_qa_20260919':e.append('FINAL_QA_RENDER_PROFILE')
    if source['content'].get('table')!=meta.get('tableSource'):e.append('FINAL_QA_TABLE_BINDING')
    if meta.get('assetSourcePath'):
        if sha(meta['assetSourcePath'])!=meta['assetSourceSha256']:e.append('FINAL_QA_ASSET_BINDING')
        im=Image.open(contained(meta['assetSourcePath'])).convert('RGB')
        if hashlib.sha256(im.tobytes()).hexdigest()!=meta['graphDecodedSha256']:e.append('FINAL_QA_DECODED_BINDING')
        if source['content'].get('maintainedGraphPath')!=meta['assetSourcePath']:e.append('FINAL_QA_SOURCE_GRAPH_PATH')
    return e

def prepare(only=None):
    root_guard();contained(EVIDENCE).mkdir(parents=True,exist_ok=True);contained(ASSETS).mkdir(parents=True,exist_ok=True)
    restore_baseline()
    old=read_json(BASE+'/concept_review_source.json');oldsem=read_json(BASE+'/accessibility_semantics.json')
    original={r['code']:r for r in old['reviews']};records=revise(original);decisions=difficulty_rows(original)
    for d in decisions:records[d['code']]['content']['difficulty']=d['after']
    write_json(EVIDENCE+'/source_before.json',old);write_json(EVIDENCE+'/decisions.json',decisions)
    write_json(EVIDENCE+'/baseline_hashes.json',{code:sha(BASE+'/'+code+'.pdf') for code in records})
    semantics=read_json(SEMANTICS) if only else {k:v for k,v in oldsem.items() if k!='pilot'}
    semantics.setdefault('pilot',{});layouts=[];results=[];failures=[];diffs=[]
    for code,source in records.items():
        c=source['content'];prior=oldsem['pilot'][code]
        if prior.get('tableRequired'):c['table']=copy.deepcopy(prior['tableSource'])
        c['renderProfile']='final_qa_20260919'
        if only and code not in only:
            # Keep source/metadata from an already completed staged build.
            active={r['code']:r for r in read_json(SOURCE)['reviews']};records[code]=active[code];continue
        meta={'baselineSha256':sha(BASE+'/'+code+'.pdf'),'decorativeText':[],'decorativeImageDecodedSha256':[],
              'canonicalTemplate':{'reference':'GEN-ECON-01','task':AUTH},'canonicalFlow':'CANONICAL_COMPACT_FLOW_TIGHT'}
        try:
            if prior.get('tableRequired'):
                meta['canonicalDense']={'mode':'CANONICAL_TABLE_DENSE','tableTextFloor':9.5}
                im,regions=canonical_table(c['table'],dense=True)
                meta.update(tableRequired=True,tableSource=c['table'],tableRegions=regions,tableSourceSha256=hashlib.sha256(json.dumps(c['table'],sort_keys=True).encode()).hexdigest(),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
            elif c.get('graph'):
                from canonical_components.retained_models import CODES
                from final_qa_graphs import ORIGINAL_CODES
                kind=c.get('graphSpec',{}).get('kind') or (code if (code in CODES and code!='MACRO-39') or code in ORIGINAL_CODES else None)
                # Reuse the clean original graph already used by the paired sheet.
                shared={'MICRO-32':'MICRO-31','MICRO-38':'MICRO-37'}
                if code in ['MICRO-30','MICRO-33','MICRO-35']:
                    from final_qa_graphs import paired
                    im,alt,recipe=paired(code);meta['canonicalDense']=recipe
                    if code=='MICRO-33':meta['graphProvenance']={'reusedFrom':'MICRO-35','recipe':'paired-zero-profit'}
                elif code in shared:
                    other=oldsem['pilot'][shared[code]];path=other['assetSourcePath'];im=Image.open(contained(path)).convert('RGB')
                    from final_qa_graphs import render
                    im,alt,recipe=render(shared[code],shared[code]);meta['canonicalDense']=recipe
                    meta['graphProvenance']={'reusedFrom':shared[code],'path':path,'sha256':sha(path)}
                elif code=='MACRO-40':
                    other=oldsem['pilot']['MACRO-39'];path=other['assetSourcePath'];im=Image.open(contained(path)).convert('RGB')
                    alt=other['graphAlternative'];meta['canonicalDense']={k:other['canonicalDense'][k] for k in ['width','height','minimumLabelPt']}
                    meta['graphProvenance']={'reusedFrom':'MACRO-39','path':path,'sha256':sha(path)}
                elif kind:
                    from final_qa_graphs import render
                    im,alt,recipe=render(code,kind);meta['canonicalDense']=recipe
                    write_json(ASSETS+'/'+code+'.model.json',recipe)
                else:
                    path=prior['assetSourcePath'];im=Image.open(contained(path)).convert('RGB')
                    alt=prior.get('graphAlternative') or oldsem['descriptions'][prior['descriptionKey']]
                    if prior.get('canonicalDense'):
                        d=prior['canonicalDense'];meta['canonicalDense']={k:d[k] for k in ['width','height','minimumLabelPt','stacked'] if k in d}
                    meta['graphProvenance']={'preservedAsset':path,'sha256':sha(path)}
                asset=ASSETS+'/'+code+'.png';im.save(contained(asset));c['maintainedGraphPath']=asset
                meta.update(assetSourcePath=asset,assetSourceSha256=sha(asset),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest(),graphAlternative=alt)
                c['graphDescription']=alt
            meta['sourceRecordSha256']=source_hash(source)
            fields=sorted(k for k in set(c)|set(original[code]['content']) if c.get(k)!=original[code]['content'].get(k))
            meta['qaRemediation']={'authorization':AUTH,'sourceRecordSha256':source_hash(source),'originalSourceRecordSha256':source_hash(original[code]),'auditSourceSha256':sha(EVIDENCE+'/source_before.json'),'decisionSha256':sha(EVIDENCE+'/decisions.json'),'changedFields':fields,'baselineTextSha256':hashlib.sha256(normalized(PdfReader(contained(BASE+'/'+code+'.pdf')).pages[0].extract_text()).encode()).hexdigest()}
            formulas(source,meta,prior,original[code])
            visual=TMP+'/visual/'+code+'.pdf';layout=draw(source,visual,meta)
            errors=validate_layout(layout)
            if errors:raise ValueError('LAYOUT '+str(errors))
            pdf=PdfReader(contained(visual));meta['qaRemediation']['authorizedTextSha256']=hashlib.sha256(normalized(pdf.pages[0].extract_text()).encode()).hexdigest()
            for ref in pdf.pages[0]['/Resources'].get('/XObject',{}).values():
                h=hashlib.sha256(ref.get_object().get_data()).hexdigest()
                if h!=meta.get('graphDecodedSha256'):meta['decorativeImageDecodedSha256'].append(h)
            semantics['pilot'][code]=meta
            result=tag_one(source,meta,TMP+'/candidates/'+code+'.pdf',visual_source=visual)
            results.append(result);layouts.append({'code':code,**layout});diffs.append({'code':code,'changedFields':fields})
            print(code,'STAGED',layout['bodyFontSize'],layout['layoutMode'],flush=True)
        except Exception as exc:
            failures.append({'code':code,'error':str(exc)});print(code,'FAILED',str(exc),flush=True)
    write_json(SOURCE,{**old,'reviews':[records[r['code']] for r in old['reviews']]});write_json(SEMANTICS,semantics)
    for name,value in [('staged',results),('layouts',layouts),('failures',failures),('changes',diffs)]:
        path=EVIDENCE+'/'+name+'.json'
        if only and contained(path).exists():value=[r for r in read_json(path) if r['code'] not in only]+value
        write_json(path,value)
    if not failures:validate_metadata(semantics)
    print('Staged',len(results),'Failures',len(failures),flush=True)

if __name__=='__main__':
    # Optional task-local dependencies; normal validation does not need them.
    sys.path.insert(0,str(contained(TMP+'/python-lib')))
    prepare(set(sys.argv[1:]) or None)
