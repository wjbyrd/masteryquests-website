"""Resumable owner-QA remediation orchestrator. Never installs active resources."""
from repo_guard import *
import csv,copy
import re
from pypdf import PdfReader
from tag_pilot import source_hash,normalized
RUN='owner_qa_remediation_v1'
EVIDENCE=f'validation_artifacts/pdf_accessibility/{RUN}'
SOURCE='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
SEMANTICS='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
QA='validation_artifacts/concept_review_owner_review/v1'
def initialize():
    root_guard()
    if contained(EVIDENCE+'/baseline.json').exists():return
    rows=list(csv.DictReader(contained(QA+'/REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig')))
    old=read_json(QA+'/candidate_manifest.json')
    protected={}
    for r in old['records']:
        p=r['sourceStagedCandidatePath'];assert sha(p)==r['sourceStagedCandidateSHA256'];protected[p]=sha(p)
        for prefix in ['concept-reviews/','build/faculty-build-composer/data/concept-reviews/']:
            p=prefix+r['resourceId']+'.pdf'
            if contained(p).exists():protected[p]=sha(p)
    m='build/faculty-build-composer/data/concept-reviews/manifest.json';protected[m]=sha(m)
    write_json(EVIDENCE+'/baseline.json',{'task':'CONCEPT_REVIEW_QA_REMEDIATION_V1','root':str(root_guard()),'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'branch':'main','status':'clean','writeProbe':'PASS','protected':protected,'qaManifestSha256':sha(QA+'/candidate_manifest.json')})
    write_json(EVIDENCE+'/source_before.json',read_json(SOURCE));write_json(EVIDENCE+'/semantics_before.json',read_json(SEMANTICS))
    write_json(EVIDENCE+'/queue.json',rows)
    print('Checkpoint initialized:',len(rows),'resources;',sum(r['Priority']!='NONE' for r in rows),'flagged')
def validate_source_binding(source,meta):
    b=meta['qaRemediation'];errors=[]
    if b.get('authorization')!='CONCEPT_REVIEW_QA_REMEDIATION_V1' or b.get('sourceRecordSha256')!=source_hash(source):errors.append('STALE_QA_AUTHORIZED_SOURCE')
    if sha(QA+'/REVIEW_CHECKLIST.csv')!=b.get('qaChecklistSha256'):errors.append('STALE_QA_QUEUE')
    if source['content'].get('table')!=meta.get('tableSource'):errors.append('QA_TABLE_SOURCE_MISMATCH')
    if source['content'].get('renderProfile')!='owner_qa_v1':errors.append('QA_RENDERER_SOURCE_MISMATCH')
    if source['content'].get('graphSpec'):
        from qa_renderer import graph_image
        im,alt=graph_image(source['content']['graphSpec']['kind'])
        if hashlib.sha256(im.tobytes()).hexdigest()!=meta.get('graphDecodedSha256') or alt!=meta.get('graphAlternative'):errors.append('QA_GRAPH_SOURCE_MISMATCH')
    return errors

def formulas(source,meta,prior,old):
    from formula_coverage import fields,uncovered
    from semantic_runs import compact
    result=[]
    current=fields(source,meta);previous=fields(old,prior)
    def spoken(t):
        return t.replace('$',' dollars ').replace('%',' percent ').replace('^2',' squared ').replace(' x ',' times ').replace('/',' divided by ').replace('=',' equals ').replace('+',' plus ').replace(' - ',' minus ').replace('−',' minus ').replace('>',' greater than ').replace('<',' less than ').strip()
    for field,text in current.items():
        if text==previous.get(field):
            result.extend(f for f in prior.get('inlineFormulas',[]) if f['sourceField']==field);continue
        # Complete numerical expressions or amounts, not isolated math tags.
        operand=r'(?:\$?[-−]?\d[\d,]*(?:\.\d+)?%?|\b(?:Q|P|C|I|G|S|T|Y|V|M|TC|TFC|TVC|ATC|AVC|AFC|MR|MC|AR|NCO|NX|CPI|VMP|MPL)\b)'
        unit=r'\(?'+operand+r'\)?'
        pattern=unit+r'(?:\s*(?:[=+*/^<>−-]|\bx\b)\s*'+unit+r')*'
        for m in re.finditer(pattern,text):
            t=m.group()
            if not re.search(r'[$%=+*/^<>−]|(?<!\w)-|\bx\b',t):continue
            result.append({'sourceField':field,'compactStart':len(compact(text[:m.start()])),'text':t,'alternative':spoken(t)})
    meta['inlineFormulas']=result;meta['formulaCoverageReviewed']=True
    exceptions=[]
    for missing in uncovered(source,meta):
        field=missing['sourceField'];text=current[field];op=missing['symbol']
        if op=='/' and field in ['title','outcome','workedLabel']:
            exceptions.append({**missing,'reason':'Reviewed prose separator, not a mathematical operator'});continue
        # Preserve any established source-prose exceptions at unchanged offsets.
        oldexception=next((x for x in prior.get('nonMathSymbols',[]) if all(x[k]==missing[k] for k in missing)),None)
        if text==previous.get(field) and oldexception:exceptions.append(oldexception);continue
        raise ValueError('Needs authored mathematical coverage: '+str(missing)+' in '+text)
    meta['nonMathSymbols']=exceptions

def prepare_sources():
    initialize()
    from qa_content import changes
    from qa_renderer import draw,table_image,graph_image
    from PIL import Image
    old_source=read_json(EVIDENCE+'/source_before.json');old_sem=read_json(EVIDENCE+'/semantics_before.json')
    originals={r['code']:r for r in old_source['reviews']};edits=changes(originals)
    queue={r['Resource']:r for r in read_json(EVIDENCE+'/queue.json')}
    assert all(queue[c]['Priority']!='NONE' for c in edits)
    assert not set(edits)&{'MICRO-49','MACRO-12','MACRO-31','MACRO-40'}
    current=read_json(SOURCE);sem=read_json(SEMANTICS)
    records={r['code']:r for r in current['reviews']}
    # Canonical narrative and visualization specification are written first.
    for code,fields_ in edits.items():
        records[code]=copy.deepcopy(originals[code]);c=records[code]['content'];c.update(fields_);c['renderProfile']='owner_qa_v1'
        if not c.get('graph') or c.get('graphSpec'):
            for key in ['assetPath','assetMetadata','graphAssetPath','graphDescription']:c.pop(key,None)
        c.pop('maintainedGraphPath',None)
    current['reviews']=[records[r['code']] for r in current['reviews']];write_json(SOURCE,current)
    accepted={r['resourceId']:r for r in read_json(QA+'/candidate_manifest.json')['records']}
    assets=contained('build/faculty-build-composer/data/concept-reviews/authoring/qa-visuals');assets.mkdir(parents=True,exist_ok=True)
    dispositions=[]
    for code in sorted(queue):
        if code not in edits:
            dispositions.append({'code':code,'priority':queue[code]['Priority'],'status':'NOT_APPLICABLE' if queue[code]['Priority']=='NONE' else 'PRESERVED_BY_OWNER_DECISION','changed':False,'summary':'No QA finding; reuse accepted candidate.' if queue[code]['Priority']=='NONE' else 'Retain current graph: distinct instructional role confirmed after adjacent resources were differentiated.'});continue
        source=records[code];c=source['content'];prior=old_sem['pilot'][code]
        meta={k:copy.deepcopy(v) for k,v in prior.items() if k in ['baselineSha256','decorativeText']}
        meta['decorativeImageDecodedSha256']=[];meta['decorativeText']=[]
        if c.get('table'):
            im,regions=table_image(c['table']);meta.update(tableRequired=True,tableSource=c['table'],tableRegions=regions,tableSourceSha256=hashlib.sha256(json.dumps(c['table'],sort_keys=True).encode()).hexdigest(),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest())
        elif c.get('graph'):
            if c.get('graphSpec'):im,alt=graph_image(c['graphSpec']['kind'])
            else:
                reader=PdfReader(contained(accepted[code]['sourceStagedCandidatePath']))
                images=[r.get_object() for r in reader.pages[0]['/Resources']['/XObject'].values() if hashlib.sha256(r.get_object().get_data()).hexdigest()==prior['graphDecodedSha256']]
                if len(images)!=1:raise ValueError('Retained reviewed graph missing: '+code)
                obj=images[0];assert obj['/ColorSpace']=='/DeviceRGB';im=Image.frombytes('RGB',(int(obj['/Width']),int(obj['/Height'])),obj.get_data())
                alt=old_sem['descriptions'][prior['descriptionKey']] if prior.get('descriptionKey') else prior.get('graphAlternative') or c['assetMetadata']['graphDescription']
            asset=assets/(code+'.png');im.save(asset)
            c['maintainedGraphPath']=str(asset.relative_to(EXPECTED_ROOT)).replace('\\','/')
            meta.update(assetSourcePath=c['maintainedGraphPath'],assetSourceSha256=sha(asset),graphDecodedSha256=hashlib.sha256(im.tobytes()).hexdigest(),graphAlternative=alt)
        meta['sourceRecordSha256']=source_hash(source)
        baseline=contained('build/faculty-build-composer/data/concept-reviews/'+code+'.pdf')
        meta['qaRemediation']={'authorization':'CONCEPT_REVIEW_QA_REMEDIATION_V1','sourceRecordSha256':source_hash(source),'qaChecklistSha256':sha(QA+'/REVIEW_CHECKLIST.csv'),'baselineTextSha256':hashlib.sha256(normalized(PdfReader(baseline).pages[0].extract_text()).encode()).hexdigest(),'originalSourceRecordSha256':source_hash(originals[code]),'changedFields':sorted(edits[code]),'reviewStatus':'PENDING'}
        formulas(source,meta,prior,originals[code])
        visual=contained(f'tmp/pdf_accessibility/{RUN}/prepared/{code}.pdf');layout=draw(source,visual,meta)
        reader=PdfReader(visual);meta['qaRemediation']['authorizedTextSha256']=hashlib.sha256(normalized(reader.pages[0].extract_text()).encode()).hexdigest()
        for ref in reader.pages[0]['/Resources'].get('/XObject',{}).values():
            obj=ref.get_object();h=hashlib.sha256(obj.get_data()).hexdigest()
            if h!=meta.get('graphDecodedSha256'):meta['decorativeImageDecodedSha256'].append(h)
        sem['pilot'][code]=meta
        dispositions.append({'code':code,'priority':queue[code]['Priority'],'status':'PENDING_VALIDATION','changed':True,'summary':queue[code]['CodexFinding'],'changedFields':sorted(edits[code]),'sourceBefore':source_hash(originals[code]),'sourceAfter':source_hash(source),'layout':layout})
        print(code,'SOURCE/PREPARED',flush=True)
        write_json(SOURCE,{**current,'reviews':[records[r['code']] for r in current['reviews']]});write_json(SEMANTICS,sem)
        write_json(EVIDENCE+'/dispositions.json',dispositions)
    write_json(EVIDENCE+'/dispositions.json',dispositions)
    print('Affected',len(edits),'reused',151-len(edits))

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--prepare',action='store_true');a=p.parse_args()
    prepare_sources() if a.prepare else initialize()
