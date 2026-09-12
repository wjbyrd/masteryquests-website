"""Resumable canonical completion; stage and validate before any installation."""
import copy,hashlib,json,sys
from pathlib import Path
import qa_remediation as q
from pypdf import PdfReader
from tag_pilot import normalized
from canonical_components.pilot_renderer import draw,canonical_table
from canonical_components.dense_modes import graph_image_dense,validate_layout
from canonical_components.retained_diagrams import DATA,render as render_diagram
from canonical_components.retained_models import CODES

OUT='validation_artifacts/pdf_accessibility/canonical_completion_v1'
STAGE='tmp/pdf_accessibility/canonical_completion_v1'

def prepare(only=None):
    q.root_guard()
    original=q.contained(OUT+'/semantics_before.json')
    if not original.exists():q.write_json(original,q.read_json(q.SEMANTICS))
    sem=q.read_json(original);sources={s['code']:s for s in q.read_json(q.SOURCE)['reviews']}
    prior=q.read_json('validation_artifacts/pdf_accessibility/canonical_dense_v1/batch_dispositions.json')
    results=[];saved={r['code']:r for r in q.read_json(OUT+'/dispositions.json')} if only else {}
    for p in prior:
        code=p['code'];source=sources[code];con=source['content'];base=copy.deepcopy(sem['pilot'][code]);row={'code':code,'priorFit':p['fit'],'priorAccepted':p.get('candidateAccepted',False),'attempts':[]}
        if only and code not in only:results.append(saved[code]);continue
        if row['priorAccepted']:
            row['status']='PRIOR_ACCEPTED';results.append(row);continue
        base['canonicalTemplate']={'reference':'GEN-ECON-01','specificationSHA256':q.sha('audit_tools/pdf_accessibility/canonical_components/specification.json'),'task':'CONCEPT_REVIEW_CANONICAL_COMPLETION_COMPOSER_INSTALL_V1'}
        modes=['STANDARD','FLOW','DENSE']
        if con.get('graphSpec') or code in DATA or code in CODES:modes=['DENSE','TIGHT']
        elif con.get('graph'):modes=['WIDE'+str(w) for w in range(360,219,-5)]
        for mode in modes:
            m=copy.deepcopy(base)
            try:
                if mode!='STANDARD':m['canonicalFlow']='CANONICAL_COMPACT_FLOW'
                if mode=='TIGHT':m['canonicalFlow']='CANONICAL_COMPACT_FLOW_TIGHT'
                if m.get('tableRequired'):
                    im,regions=canonical_table(con['table'],dense=mode=='DENSE');m.update(tableRegions=regions,graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
                    if mode=='DENSE':m['canonicalDense']={'mode':'CANONICAL_TABLE_DENSE','tableTextFloor':9.5}
                elif code in DATA:
                    im,e=render_diagram(code);e.update(originalAssetSourcePath=m['assetSourcePath'],originalAssetSha256=m['assetSourceSha256'])
                    asset=f'audit_tools/pdf_accessibility/canonical_components/figures/{code}.png';im.save(q.contained(asset))
                    m.update(canonicalDense=e,assetSourcePath=asset,assetSourceSha256=q.sha(asset),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
                elif con.get('graphSpec') or code in CODES:
                    im,alt,e=graph_image_dense(con['graphSpec']['kind'] if con.get('graphSpec') else code);assert alt==m['graphAlternative']
                    if code in CODES:e.update(originalAssetSourcePath=m['assetSourcePath'],originalAssetSha256=m['assetSourceSha256'])
                    asset=f'audit_tools/pdf_accessibility/canonical_components/figures/{code}.png';q.contained(asset).parent.mkdir(parents=True,exist_ok=True);im.save(q.contained(asset))
                    m.update(canonicalDense=e,assetSourcePath=asset,assetSourceSha256=q.sha(asset),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
                elif con.get('graph') and mode.startswith('WIDE'):
                    from PIL import Image
                    im=Image.open(q.contained(m['assetSourcePath']))
                    width=int(mode[4:]);m['canonicalDense']={'mode':'CANONICAL_RETAINED_GRAPH_WIDE','width':width,'height':width*im.height/im.width}
                visual=STAGE+'/prepared/'+code+'.pdf';layout=draw(source,visual,m)
                errors=validate_layout(layout)
                if errors:raise ValueError(str(errors))
                reader=PdfReader(q.contained(visual));assert hashlib.sha256(normalized(reader.pages[0].extract_text()).encode()).hexdigest()==m['qaRemediation']['authorizedTextSha256'],'CONTENT_REGRESSION'
                m['decorativeImageDecodedSha256']=[]
                for ref in reader.pages[0]['/Resources'].get('/XObject',{}).values():
                    h=hashlib.sha256(ref.get_object().get_data()).hexdigest()
                    if h!=m.get('graphDecodedSha256'):m['decorativeImageDecodedSha256'].append(h)
                row.update(status='FIT_REVIEW_PENDING',mode=mode,layout=layout,visual=visual)
                # Retained bitmaps require separate label-size review before promotion.
                if con.get('graph') and not con.get('graphSpec') and code not in DATA and code not in CODES:row['retainedGraphReviewRequired']=True
                q.write_json(OUT+'/metadata/'+code+'.json',m);break
            except (ValueError,AssertionError,KeyError) as e:row['attempts'].append({'mode':mode,'reason':str(e)})
        else:row['status']='BLOCKED'
        results.append(row);q.write_json(OUT+'/dispositions.json',results)
        print(code,row['status'],row.get('mode'),flush=True)
    q.write_json(OUT+'/dispositions.json',results)
    return results

def validate_prepared(only=None):
    from tag_pilot import tag_one
    from validate_candidates import validate
    from test_canonical_template import observe,check,REFERENCE
    sem=q.read_json(OUT+'/semantics_before.json');sources={s['code']:s for s in q.read_json(q.SOURCE)['reviews']}
    dispositions=q.read_json(OUT+'/dispositions.json');generated=[]
    reference=observe(REFERENCE)
    for row in dispositions:
        if row['status']!='FIT_REVIEW_PENDING':continue
        code=row['code'];m=q.read_json(OUT+'/metadata/'+code+'.json');sem['pilot'][code]=m
        if only and code not in only:continue
        output=STAGE+'/candidates/'+code+'.pdf';result=tag_one(sources[code],m,output,row['visual'])
        repeatVisual=STAGE+'/rebuild/visual/'+code+'.pdf';repeat=STAGE+'/rebuild/'+code+'.pdf'
        draw(sources[code],repeatVisual,m);tag_one(sources[code],m,repeat,repeatVisual)
        result.update(layoutEvidence=row['layout'],deterministic=q.sha(output)==q.sha(repeat),determinismRebuild=repeat,
                      fidelityErrors=check(observe(output),reference))
        generated.append(result);print(code,'TAGGED',result['deterministic'],result['fidelityErrors'],flush=True)
    q.write_json(OUT+'/candidate_semantics_snapshot.json',sem)
    q.write_json(OUT+'/generation.json',generated)
    revision=hashlib.sha256(json.dumps([(r['code'],q.sha(r['output'])) for r in generated],sort_keys=True).encode()).hexdigest()[:16]
    for domain in ['GEN-ECON','MICRO','MACRO']:
        selected=[r for r in generated if r['code'].rsplit('-',1)[0]==domain]
        if selected:validate(selected,OUT+'/validation_revisions/'+revision+'/'+domain,OUT+'/candidate_semantics_snapshot.json')

if __name__=='__main__':
    only=sys.argv[sys.argv.index('--only')+1:] if '--only' in sys.argv else None
    validate_prepared(only) if '--validate' in sys.argv else prepare(only)
