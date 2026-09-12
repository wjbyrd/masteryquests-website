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
from pypdf.generic import FloatObject
from semantic_runs import decoded_shows, plan_runs

N=NameObject
D=DictionaryObject
A=ArrayObject
I=NumberObject
T=TextStringObject

def normalized(text):
    return re.sub(r'\s+',' ',text).strip()

def source_hash(record):
    return hashlib.sha256(json.dumps(record,sort_keys=True,ensure_ascii=False).encode()).hexdigest()

def semantic_hash(metadata, code):
    """Bind evidence to one resource, including its resolved shared description.

    Unrelated batch additions must not invalidate an already reviewed candidate.
    """
    entry=metadata['pilot'][code].copy()
    if entry.get('descriptionKey'):
        entry['resolvedDescription']=metadata['descriptions'][entry['descriptionKey']]
    return source_hash(entry)

def card_items(card):
    """Join only explicitly reviewed continuation lines in a displayed card."""
    groups=card.get('groups',[[i] for i in range(len(card['items']))])
    if [i for group in groups for i in group]!=list(range(len(card['items']))):
        raise ValueError('Card groups must cover source items once and in order')
    return [(group[0],' '.join(card['items'][i].strip() for i in group)) for group in groups]

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
        if entry.get('instructionCard'):
            if entry.get('formulaCard'):raise ValueError('Competing card representations')
            card=entry['instructionCard']
            if card.get('heading') not in ('DIAGNOSE','KEY RELATIONSHIPS') or not card.get('items'):
                raise ValueError('Unknown instruction card')
            card_items(card)
        for formula in entry.get('inlineFormulas',[]):
            if not re.fullmatch(r'(title|workedLabel|core|worked|watch|check|outcome|recognition/[0-9]+|card/[0-9]+)',formula.get('sourceField','')):
                raise ValueError('Invalid Formula source field')
            if type(formula.get('compactStart')) is not int or formula['compactStart']<0:
                raise ValueError('Invalid Formula source offset')
            if not formula.get('text') or not formula.get('alternative') or formula['alternative'].lower().strip() in ('formula','math','placeholder'):
                raise ValueError('Missing meaningful Formula alternative')
        if entry.get('tableRequired'):
            table=entry.get('tableSource',{});regions=entry.get('tableRegions',{})
            if len(table.get('rowHeaders',[]))!=2 or len(table.get('columnHeaders',[]))!=2 or len(table.get('cells',[]))!=2 or any(len(r)!=2 for r in table['cells']):
                raise ValueError('Unproven table dimensions')
            if regions.get('xEdges')!=[0,184,450,728] or regions.get('yEdges')!=[30,90,274,471]:
                raise ValueError('Table cell regions need asset-specific review')
        for path_key,hash_key in (('assetSourcePath','assetSourceSha256'),('visualSourcePath','visualSourceSha256')):
            if entry.get(path_key) and sha(entry[path_key])!=entry.get(hash_key):
                raise ValueError('Stale canonical source: '+path_key)

def tag_one(record,meta,destination,visual_source=None):
    path=contained(meta.get('visualSourcePath','build/faculty-build-composer/data/concept-reviews/'+record['code']+'.pdf'))
    if source_hash(record)!=meta['sourceRecordSha256'] or (visual_source is None and sha(path)!=meta.get('visualSourceSha256',meta['baselineSha256'])):
        raise ValueError('Source or PDF changed since pilot review')
    if visual_source is not None:
        visual_source=contained(visual_source)
        if not visual_source.is_relative_to(contained('tmp/pdf_accessibility')): raise ValueError('Visual input must be staged')
        path=visual_source
    if meta.get('assetSourcePath') and sha(meta['assetSourcePath'])!=meta['assetSourceSha256']:raise ValueError('Stale source asset description')
    reader=PdfReader(path,strict=True)
    if len(reader.pages)!=1:raise ValueError('Unsupported page layout')
    if reader.pages[0].get('/Annots'):raise ValueError('Link/annotation support must be proven before processing')
    if any(meta.get(k) for k in ('visualRepair','wordingCorrection','sourceFigureContext')):
        from visual_repairs import apply
        apply(reader,record,meta)
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
    def node(role,text=None,parent=None,alt=None,indices=None,source_field=None):
        idx=len(nodes)
        nodes.append({'role':role,'parent':parent,'alt':alt,'text':text,'ranges':[],'sourceField':source_field})
        if text is not None:
            found=match(text) if indices is None else indices
            for bi in found:
                b=blocks[bi];ranges.append((b['start'],b['end'],idx));nodes[idx]['ranges'].append((b['start'],b['end']))
            transcript.append({'role':role,'text':text,'node':idx})
        return idx
    content=record['content']
    node('H1',record['title'],source_field='title')
    node('P',record['disciplineLabel'])
    node('P',record['code'])
    node('P','Time: '+content['time'])
    node('P','Outcome: '+content['outcome'],source_field='outcome')
    node('P','Difficulty: '+content['difficulty'])
    node('H2','THE CORE IDEA');node('P',content['core'],source_field='core')
    node('H2','HOW TO RECOGNIZE IT')
    listnode=node('L')
    for item_index,item in enumerate(content['recognition']):
        li=node('LI',parent=listnode)
        indices=match(item)
        first=indices[0]
        if first==0 or first-1 in used or blocks[first-1]['text'] not in ('•','-', '\x01'):
            raise ValueError('List item lacks an unambiguous preceding label')
        used.add(first-1)
        node('Lbl',blocks[first-1]['text'],parent=li,indices=[first-1])
        node('LBody',item,parent=li,indices=indices,source_field='recognition/'+str(item_index))
    node('H2','WATCH OUT');node('P',content['watch'],source_field='watch')
    worked_heading=node('H2','WORKED EXAMPLE: '+content['workedLabel'],source_field='workedLabel')
    if meta.get('formulaCard'):
        node('H3','KEY RELATIONSHIPS')
        for formula in meta['formulaCard']:
            node('Formula',formula['text'],alt=formula['alternative'])
    if meta.get('instructionCard'):
        card=meta['instructionCard'];node('H3',card['heading'])
        card_list=node('L')
        for card_index,text in card_items(card):
            li=node('LI',parent=card_list)
            node('LBody',text,parent=li,source_field='card/'+str(card_index))
    graphnode=None; table_regions=[]
    if meta.get('tableRequired'):
        table=meta['tableSource']; region=meta['tableRegions']
        if hashlib.sha256(json.dumps(table,sort_keys=True).encode()).hexdigest()!=meta['tableSourceSha256']:
            raise ValueError('Stale canonical table values')
        graphnode=node('Table')
        caption=node('Caption',parent=graphnode)
        nodes[caption]['actual']=table['caption']
        table_regions.append((caption,(0,0,region['imageWidth'],region['captionBottom'])))
        xs=region['xEdges'];ys=region['yEdges']
        for ri in range(3):
            tr=node('TR',parent=graphnode)
            for ci in range(3):
                header=(ri==0 and ci>0) or (ci==0 and ri>0)
                cell=node('TH' if header else 'TD',parent=tr)
                value=table['columnHeaders'][ci-1] if ri==0 and ci else table['rowHeaders'][ri-1] if ci==0 and ri else table['cells'][ri-1][ci-1] if ri and ci else ''
                nodes[cell]['actual']=value
                if header:
                    nodes[cell]['scope']='Column' if ri==0 else 'Row'
                    nodes[cell]['id']=('col-' if ri==0 else 'row-')+value
                elif ri and ci:
                    nodes[cell]['headers']=['row-'+table['rowHeaders'][ri-1],'col-'+table['columnHeaders'][ci-1]]
                table_regions.append((cell,(xs[ci],ys[ri],xs[ci+1],ys[ri+1])))
    elif content.get('graph'):
        alt=meta.get('graphAlternative')
        if meta.get('graphAlternativeFromSource'):
            alt=content['assetMetadata']['graphDescription']
        if not alt or len(alt)<50 or alt.lower().strip() in ('graph','a supply and demand graph','image','figure'):
            raise ValueError('Invalid informative graph alternative')
        graphnode=node('Figure',alt=alt)
        transcript.append({'role':'Figure','text':alt,'node':graphnode})
    worked=node('P',content['worked'],source_field='worked')
    node('H2','CHECK YOURSELF');node('P',content['check'],source_field='check')
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
        if not table_regions:ranges.append((index,index,graphnode))
    # Every image outside the worked figure must match this pilot's reviewed
    # repeated branding/section-icon inventory. No unfamiliar image is hidden.
    decorative_hashes=set(meta['decorativeImageDecodedSha256'])
    for i,(args,op) in enumerate(ops):
        if op==b'Do' and not any(i==g[0] for g in graphops):
            obj=xobjects[args[0]].get_object()
            if obj.get('/Subtype')!='/Image' or hashlib.sha256(obj.get_data()).hexdigest() not in decorative_hashes:
                raise ValueError('Unreviewed non-figure image or Form XObject')
    formulas=[]
    for formula in meta.get('inlineFormulas',[]):
        field=formula['sourceField'].split('/')
        paragraph=record['title'] if field[0]=='title' else dict(card_items(meta['instructionCard']))[int(field[1])] if field[0]=='card' else content[field[0]] if len(field)==1 else content[field[0]][int(field[1])]
        prefix={'outcome':'Outcome: ','workedLabel':'WORKED EXAMPLE: '}.get(field[0],'')
        formulas.append({**formula,'paragraph':prefix+paragraph,'compactStart':formula['compactStart']+len(re.sub(r'\s+','',prefix))})
    inline_plans=plan_runs(nodes,ranges,decoded_shows(reader.pages[0],ops),formulas)
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
        if 'actual' in item:elem[N('/ActualText')]=T(item['actual'])
        if item.get('id'):elem[N('/ID')]=T(item['id'])
        if item.get('scope'):elem[N('/A')]=D({N('/O'):N('/Table'),N('/Scope'):N('/'+item['scope'])})
        if item.get('headers'):elem[N('/A')]=D({N('/O'):N('/Table'),N('/Headers'):A([T(h) for h in item['headers']])})
        refs.append(writer._add_object(elem))
    for idx,item in enumerate(nodes):
        parent=refs[item['parent']] if item['parent'] is not None else doc_ref
        refs[idx].get_object()[N('/P')]=parent
        if not item.get('inline'):parent.get_object()['/K'].append(refs[idx])
    ids=[(item['id'],refs[i]) for i,item in enumerate(nodes) if item.get('id')]
    if ids:tree[N('/IDTree')]=writer._add_object(D({N('/Names'):A([v for key,ref in sorted(ids) for v in (T(key),ref)])}))
    by_start={start:(end,idx) for start,end,idx in ranges}
    rewritten=[];parents=[];i=0;artifact_open=False;inline_attached=set()
    def emit(owner,painting):
        mcid=len(parents);parents.append(refs[owner])
        item=nodes[owner]
        if item.get('inline') and owner not in inline_attached:
            refs[item['parent']].get_object()['/K'].append(refs[owner]);inline_attached.add(owner)
        rewritten.append(([N('/'+item['role']),D({N('/MCID'):I(mcid)})],b'BDC'))
        rewritten.extend(painting);rewritten.append(([],b'EMC'))
        refs[owner].get_object()['/K'].append(I(mcid))
    while i<len(ops):
        if table_regions and i==graphops[0][0]:
            if artifact_open:rewritten.append(([],b'EMC'));artifact_open=False
            width=meta['tableRegions']['imageWidth'];height=meta['tableRegions']['imageHeight']
            for owner,(x0,y0,x1,y1) in table_regions:
                # The original image already paints in unit-square coordinates.
                # Partition it once by reviewed asset pixels. Every pixel remains
                # visible exactly once; each cell owns its actual painted region.
                clip=[FloatObject(x0/width),FloatObject(1-y1/height),FloatObject((x1-x0)/width),FloatObject((y1-y0)/height)]
                emit(owner,[([],b'q'),(clip,b're'),([],b'W'),([],b'n'),ops[i],([],b'Q')])
            i+=1
        elif i in by_start:
            if artifact_open:rewritten.append(([],b'EMC'));artifact_open=False
            end,idx=by_start[i]
            if any(j in inline_plans for j in range(i,end+1)):
                for j in range(i,end+1):
                    if j in inline_plans:
                        for owner,raw in inline_plans[j]:emit(owner,[([raw],b'Tj')])
                    elif ops[j][1]==b'Tj':emit(idx,[ops[j]])
                    else:rewritten.append(ops[j])
            else:emit(idx,ops[i:end+1])
            i=end+1
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
    return {'code':record['code'],'status':'EXPERIMENTAL_CANDIDATE','output':str(destination.relative_to(EXPECTED_ROOT)),'tagCount':len(nodes),'mcids':len(parents),'unassignedMeaningfulBlocks':0,'inlineFormulaSemantics':'SOURCE_BOUND_RUNS' if formulas else 'NO_INLINE_EXPRESSIONS_SELECTED','transcript':transcript}

if __name__=='__main__':
    import runpy
    runpy.run_path(str(contained('audit_tools/pdf_accessibility/rebuild_pilot.py')),run_name='__main__')
