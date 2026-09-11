"""Experimental source-aware tagger. STAGING ONLY; no production installer.

Every nonempty text object must map to an exact canonical field or an explicitly
reviewed list/decorative/formula item. A missing match rejects the document.
No coordinate sorting, OCR, hidden text, or page rasterization is performed.
"""
from repo_guard import *
from pypdf import PdfReader, PdfWriter, PageObject
from pypdf.generic import (ContentStream,NameObject,DictionaryObject,ArrayObject,
    NumberObject,BooleanObject,TextStringObject,DecodedStreamObject)
import re, html

N=NameObject
D=DictionaryObject
A=ArrayObject
I=NumberObject
T=TextStringObject

def normalized(text):
    return re.sub(r'\s+',' ',text).strip()

def source_hash(record):
    return hashlib.sha256(json.dumps(record,sort_keys=True,ensure_ascii=False).encode()).hexdigest()

def text_blocks(page,reader):
    ops=ContentStream(page['/Contents'],reader).operations
    # Decode in the complete page graphics/font state. Isolated BT fragments
    # lose font states restored by Q and can misdecode quotes and list labels.
    position=-1;start=None;captured={};ends={}
    def before(op,args,cm,tm):
        nonlocal position,start
        position+=1
        if op==b'BT':start=position
        if op==b'ET' and start is not None:ends[start]=position
    def visit(text,cm,tm,font,size):
        if text.strip():
            if start is None:raise ValueError('Text outside an understood text object')
            captured[start]=captured.get(start,'')+text
    page.extract_text(visitor_operand_before=before,visitor_text=visit)
    if position+1!=len(ops):raise ValueError('Nested stream requires explicit support')
    blocks=[{'start':s,'end':ends[s],'text':normalized(t)} for s,t in captured.items()]
    return ops,blocks

def validate_metadata(metadata):
    if metadata.get('schemaVersion')!=1 or metadata.get('task')!=TASK:
        raise ValueError('Unsupported accessibility metadata schema/task')
    if not isinstance(metadata.get('pilot'),dict) or not metadata['pilot']:
        raise ValueError('Missing semantic resource records')
    for code,entry in metadata['pilot'].items():
        if not re.fullmatch(r'(GEN-ECON|MICRO|MACRO)-[0-9]{2}',code):
            raise ValueError('Invalid resource code')
        for key in ('baselineSha256','sourceRecordSha256'):
            if not re.fullmatch(r'[0-9a-f]{64}',entry.get(key,'')):
                raise ValueError('Missing or invalid semantic fingerprint: '+key)
        for value in entry.get('decorativeImageDecodedSha256',[]):
            if not re.fullmatch(r'[0-9a-f]{64}',value):raise ValueError('Invalid decorative asset fingerprint')
        if entry.get('graphDecodedSha256') and not re.fullmatch(r'[0-9a-f]{64}',entry['graphDecodedSha256']):
            raise ValueError('Invalid graph fingerprint')
        if entry.get('descriptionKey') and entry['descriptionKey'] not in metadata.get('descriptions',{}):
            raise ValueError('Unresolved canonical graph description')
        for formula in entry.get('formulaCard',[]):
            if not formula.get('text') or not formula.get('alternative'):
                raise ValueError('Incomplete formula source')

def tag_one(record,meta,destination):
    if meta.get('tableRequired'):
        raise ValueError('UNSUPPORTED_TABLE: image-only payoff matrix requires content-linked TH/TD structure; refusing a Figure-only substitute')
    path=contained('build/faculty-build-composer/data/concept-reviews/'+record['code']+'.pdf')
    if sha(path)!=meta['baselineSha256'] or source_hash(record)!=meta['sourceRecordSha256']:
        raise ValueError('Source or PDF changed since pilot review')
    reader=PdfReader(path,strict=True)
    if len(reader.pages)!=1:raise ValueError('Unsupported page layout')
    if reader.pages[0].get('/Annots'):raise ValueError('Link/annotation support must be proven before processing')
    ops,blocks=text_blocks(reader.pages[0],reader)
    used=set();nodes=[];ranges=[];transcript=[]
    def match(text):
        target=normalized(text)
        for i,b in enumerate(blocks):
            if i in used:continue
            collected=[];joined=''
            for j in range(i,len(blocks)):
                if j in used:break
                joined=normalized(joined+' '+blocks[j]['text']);collected.append(j)
                if joined==target:
                    used.update(collected)
                    return collected
                if not target.startswith(joined):break
        raise ValueError('Unmatched canonical content: '+repr(target))
    def node(role,text=None,parent=None,alt=None,indices=None):
        idx=len(nodes)
        nodes.append({'role':role,'parent':parent,'alt':alt,'text':text,'ranges':[]})
        if text is not None:
            found=match(text) if indices is None else indices
            for bi in found:
                b=blocks[bi];ranges.append((b['start'],b['end'],idx));nodes[idx]['ranges'].append((b['start'],b['end']))
            transcript.append({'role':role,'text':text,'node':idx})
        return idx
    content=record['content']
    node('H1',record['title'])
    node('P',record['disciplineLabel'])
    node('P',record['code'])
    node('P','Time: '+content['time'])
    node('P','Outcome: '+content['outcome'])
    node('P','Difficulty: '+content['difficulty'])
    node('H2','THE CORE IDEA');node('P',content['core'])
    node('H2','HOW TO RECOGNIZE IT')
    listnode=node('L')
    for item in content['recognition']:
        li=node('LI',parent=listnode)
        indices=match(item)
        first=indices[0]
        if first==0 or first-1 in used or blocks[first-1]['text'] not in ('•','-', '\x01'):
            raise ValueError('List item lacks an unambiguous preceding label')
        used.add(first-1)
        node('Lbl',blocks[first-1]['text'],parent=li,indices=[first-1])
        node('LBody',item,parent=li,indices=indices)
    node('H2','WATCH OUT');node('P',content['watch'])
    worked_heading=node('H2','WORKED EXAMPLE: '+content['workedLabel'])
    if meta.get('formulaCard'):
        node('H3','KEY RELATIONSHIPS')
        for formula in meta['formulaCard']:
            node('Formula',formula['text'],alt=formula['alternative'])
    graphnode=None
    if content.get('graph'):
        alt=meta.get('graphAlternative')
        if meta.get('graphAlternativeFromSource'):
            alt=content['assetMetadata']['graphDescription']
        if not alt or len(alt)<50 or alt.lower().strip() in ('graph','a supply and demand graph','image','figure'):
            raise ValueError('Invalid informative graph alternative')
        graphnode=node('Figure',alt=alt)
        transcript.append({'role':'Figure','text':alt,'node':graphnode})
    worked=node('P',content['worked'])
    node('H2','CHECK YOURSELF');node('P',content['check'])
    node('H2','READY?');node('P','Return to the game and master this concept.')
    # Treat only visually reviewed, repeated section glyphs as decorative.
    unused=[(i,b) for i,b in enumerate(blocks) if i not in used]
    for i,b in unused:
        if b['text'] not in meta.get('decorativeText',[]):
            raise ValueError('Unassigned meaningful text: '+repr(b['text']))
    xobjects=reader.pages[0]['/Resources'].get('/XObject',{})
    graphops=[]
    if graphnode is not None:
        after=max(end for _,end in nodes[worked_heading]['ranges'])
        before=min(start for start,_ in nodes[worked]['ranges'])
        graphops=[(i,args) for i,(args,op) in enumerate(ops) if after<i<before and op==b'Do']
        if len(graphops)!=1:raise ValueError('Graph usage is ambiguous')
        index,args=graphops[0];obj=xobjects[args[0]].get_object()
        fingerprint=hashlib.sha256(obj.get_data()).hexdigest()
        if fingerprint!=meta['graphDecodedSha256']:
            raise ValueError('Graph description stale: displayed asset fingerprint changed')
        ranges.append((index,index,graphnode))
    # Every image outside the worked figure must match this pilot's reviewed
    # repeated branding/section-icon inventory. No unfamiliar image is hidden.
    decorative_hashes=set(meta['decorativeImageDecodedSha256'])
    for i,(args,op) in enumerate(ops):
        if op==b'Do' and not any(i==g[0] for g in graphops):
            obj=xobjects[args[0]].get_object()
            if obj.get('/Subtype')!='/Image' or hashlib.sha256(obj.get_data()).hexdigest() not in decorative_hashes:
                raise ValueError('Unreviewed non-figure image or Form XObject')
    writer=PdfWriter(clone_from=reader)
    writer.pdf_header=b'%PDF-1.7'
    page=writer.pages[0]
    root=writer._root_object
    tree=D({N('/Type'):N('/StructTreeRoot')})
    tree_ref=writer._add_object(tree)
    doc=D({N('/Type'):N('/StructElem'),N('/S'):N('/Document'),N('/P'):tree_ref,N('/K'):A()})
    doc_ref=writer._add_object(doc)
    tree[N('/K')]=A([doc_ref])
    refs=[]
    for item in nodes:
        elem=D({N('/Type'):N('/StructElem'),N('/S'):N('/'+item['role']),N('/P'):doc_ref,N('/Pg'):page.indirect_reference,N('/K'):A()})
        if item['alt']:elem[N('/Alt')]=T(item['alt'])
        refs.append(writer._add_object(elem))
    for idx,item in enumerate(nodes):
        parent=refs[item['parent']] if item['parent'] is not None else doc_ref
        refs[idx].get_object()[N('/P')]=parent
        parent.get_object()['/K'].append(refs[idx])
    by_start={start:(end,idx) for start,end,idx in ranges}
    rewritten=[];parents=[];i=0;artifact_open=False
    while i<len(ops):
        if i in by_start:
            if artifact_open:rewritten.append(([],b'EMC'));artifact_open=False
            end,idx=by_start[i];mcid=len(parents);parents.append(refs[idx])
            rewritten.append(([N('/'+nodes[idx]['role']),D({N('/MCID'):I(mcid)})],b'BDC'))
            rewritten.extend(ops[i:end+1]);rewritten.append(([],b'EMC'))
            refs[idx].get_object()['/K'].append(I(mcid));i=end+1
        else:
            if not artifact_open:rewritten.append(([N('/Artifact')],b'BMC'));artifact_open=True
            rewritten.append(ops[i]);i+=1
    if artifact_open:rewritten.append(([],b'EMC'))
    stream=ContentStream(None,writer);stream.operations=rewritten
    page[N('/Contents')]=writer._add_object(stream)
    page[N('/StructParents')]=I(0);page[N('/Tabs')]=N('/S')
    tree[N('/ParentTree')]=writer._add_object(D({N('/Nums'):A([I(0),A(parents)])}))
    tree[N('/ParentTreeNextKey')]=I(1)
    root[N('/StructTreeRoot')]=tree_ref
    root[N('/MarkInfo')]=D({N('/Marked'):BooleanObject(True)})
    root[N('/Lang')]=T('en-US')
    root[N('/ViewerPreferences')]=D({N('/DisplayDocTitle'):BooleanObject(True)})
    # UA identifier is a candidate target, never a substitute for validator and
    # semantic review. Staging outputs are explicitly experimental.
    xml=f'''<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/" pdfuaid:part="1"/>
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">{html.escape(record['title'])}</rdf:li></rdf:Alt></dc:title></rdf:Description>
</rdf:RDF></x:xmpmeta><?xpacket end="w"?>'''
    metadata=DecodedStreamObject();metadata.set_data(xml.encode('utf-8'))
    metadata[N('/Type')]=N('/Metadata');metadata[N('/Subtype')]=N('/XML')
    root[N('/Metadata')]=writer._add_object(metadata)
    writer.add_metadata({'/Title':record['title'],'/Subject':'Concept Review accessibility pilot - not approved for release'})
    destination=contained(destination)
    if not destination.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Pilot outputs must remain in task staging')
    destination.parent.mkdir(parents=True,exist_ok=True)
    writer.write(destination)
    return {'code':record['code'],'status':'EXPERIMENTAL_CANDIDATE','output':str(destination.relative_to(EXPECTED_ROOT)),'tagCount':len(nodes),'mcids':len(parents),'unassignedMeaningfulBlocks':0,'inlineFormulaSemantics':'PENDING' if content.get('calculation') else 'NOT_APPLICABLE','transcript':transcript}

if __name__=='__main__':
    root_guard()
    source=read_json('build/faculty-build-composer/data/concept-reviews/concept_review_source.json')
    metadata=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')
    validate_metadata(metadata)
    sources={r['code']:r for r in source['reviews']}
    results=[]
    for code,meta in metadata['pilot'].items():
        try:
            if meta.get('descriptionKey'):
                meta={**meta,'graphAlternative':metadata['descriptions'][meta['descriptionKey']]}
            result=tag_one(sources[code],meta,f'tmp/pdf_accessibility/repo_lock_v1/pilot/after/{code}.pdf')
        except ValueError as exc:result={'code':code,'status':'REJECTED','reason':str(exc)}
        results.append(result);print(code,result['status'],result.get('reason',''),flush=True)
    write_json('validation_artifacts/pdf_accessibility/pilot_results.json',{'task':TASK,'batchAuthorized':False,'results':results})