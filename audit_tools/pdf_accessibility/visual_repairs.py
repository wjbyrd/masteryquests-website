"""Fingerprint-bound, resource-specific retained visual-input corrections.

No shared asset writes. Raster colors are changed only inside reviewed semantic
regions and a bounded palette ray. Preserve every sample position and the
original antialias coverage; store losslessly. This is not a graph recognizer.
Wording edits use exact canonical paragraphs and existing embedded font metrics.
"""
from repo_guard import *
import numpy as np
from pypdf.generic import NameObject, DecodedStreamObject, ContentStream, ByteStringObject


def digest(data): return hashlib.sha256(data).hexdigest()


def contrast(rgb, background=(255,255,255)):
    def lum(c):
        a=np.asarray(c,dtype=float)/255
        a=np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4)
        return float(a @ np.array([.2126,.7152,.0722]))
    a,b=sorted((lum(rgb),lum(background)))
    return (b+.05)/(a+.05)


def derive(data,width,height,repair):
    if digest(data)!=repair['originalDecodedSha256']:
        raise ValueError('STALE_DERIVED_GRAPH_ORIGINAL')
    if [width,height]!=repair['dimensions']:raise ValueError('GRAPH_DIMENSIONS_CHANGED')
    original=np.frombuffer(data,dtype=np.uint8).reshape(height,width,3)
    out=original.copy(); occupied=np.zeros((height,width),bool); measurements=[]
    for rule in repair['rules']:
        x0,y0,x1,y1=rule['region'];old=np.array(rule['oldRGB'],float);new=np.array(rule['newRGB'],float)
        if not (0<=x0<x1<=width and 0<=y0<y1<=height):raise ValueError('Invalid semantic region')
        target=4.5 if rule['type']=='text' else 3.0
        if contrast(new,rule['backgroundRGB'])<target+.15:raise ValueError('CONTRAST_REGRESSION')
        pixels=original[y0:y1,x0:x1].astype(float)
        ray=255-old
        alpha=np.clip(((255-pixels)@ray)/(ray@ray),0,1)
        residual=pixels-(255-alpha[...,None]*ray)
        # Only the reviewed palette and its antialias edge; compression noise
        # is retained, and unrelated colors/gray axes remain byte-identical.
        mask=(np.linalg.norm(residual,axis=2)<=rule['paletteTolerance']*alpha+.8) & (alpha>=.025) & (np.ptp(pixels,axis=2)>=2)
        if np.any(occupied[y0:y1,x0:x1]&mask):raise ValueError('Overlapping repair masks')
        count=int(mask.sum())
        if count!=rule['sampleCount']:raise ValueError('SEMANTIC_COLOR_MASK_DRIFT')
        changed=np.clip(np.rint(pixels+alpha[...,None]*(new-old)),0,255).astype(np.uint8)
        out[y0:y1,x0:x1][mask]=changed[mask];occupied[y0:y1,x0:x1]|=mask
        core=mask & (alpha>=.9)
        if not core.any():raise ValueError('No foreground samples in reviewed region')
        ratios=[contrast(c,rule['backgroundRGB']) for c in changed[core]]
        # Antialias edge pixels are not foreground colors. Check the 10th
        # percentile of near-solid samples in addition to the authored color.
        p10=float(np.percentile(ratios,10))
        if p10<target:raise ValueError('RENDERED_CORE_CONTRAST_REGRESSION')
        measurements.append({'element':rule['element'],'type':rule['type'],
            'oldRGB':rule['oldRGB'],'newRGB':rule['newRGB'],'backgroundRGB':rule['backgroundRGB'],
            'oldRatio':contrast(old,rule['backgroundRGB']),'newRatio':contrast(new,rule['backgroundRGB']),
            'coreContrastP10':p10,'sampleCount':count,'region':rule['region']})
    result=out.tobytes()
    if repair.get('derivedDecodedSha256') and digest(result)!=repair['derivedDecodedSha256']:
        raise ValueError('STALE_DERIVED_GRAPH_FINGERPRINT')
    return result,measurements


def validate_bindings(source,meta):
    from tag_pilot import source_hash
    errors=[]
    for name in ('visualRepair','wordingCorrection','sourceFigureContext'):
        value=meta.get(name)
        if not value:continue
        if value.get('sourceRecordSha256')!=source_hash(source):errors.append('STALE_'+name.upper()+'_SOURCE')
        if value.get('originalAssetSha256')!=meta.get('assetSourceSha256'):errors.append('STALE_'+name.upper()+'_ASSET')
    decision=meta.get('sourceFigureContext')
    if decision and decision.get('status')!='owner_reviewed_accepted':errors.append('OWNER_CONTEXT_REVIEW_REQUIRED')
    if decision and decision.get('graphDecodedSha256')!=meta.get('graphDecodedSha256'):errors.append('STALE_OWNER_CONTEXT_GRAPH')
    wording=meta.get('wordingCorrection')
    if wording and (source['content'].get(wording['field'])!=wording['newText'] or wording.get('status')!='owner_authorized'):
        errors.append('WORDING_CONTEXT_REGRESSION')
    repair=meta.get('visualRepair')
    if repair:
        if repair.get('derivedDecodedSha256')!=meta.get('graphDecodedSha256'):errors.append('STALE_DERIVED_GRAPH_FINGERPRINT')
        for rule in repair['rules']:
            minimum=4.5 if rule['type']=='text' else 3
            if contrast(rule['newRGB'],rule['backgroundRGB'])<minimum+.15:errors.append('CONTRAST_REGRESSION')
    return errors


def verify_derivation(meta):
    """Recompute from maintained inputs; no dependence on future active PDFs."""
    from PIL import Image
    from pypdf import PdfReader
    repair=meta.get('visualRepair')
    if not repair:return []
    data=None
    if meta.get('visualSourcePath'):
        reader=PdfReader(contained(meta['visualSourcePath']))
        for ref in reader.pages[0]['/Resources']['/XObject'].values():
            obj=ref.get_object()
            if digest(obj.get_data())==repair['originalDecodedSha256']:data=obj.get_data();break
    else:
        image=Image.open(contained(meta['assetSourcePath'])).convert('RGB')
        # Independently reproduce the existing later-layout whitespace crop.
        # No resampling: this is exactly the maintained Micro visual renderer's
        # <248 luminance bounds plus 1.2% padding. The decoded hash rejects drift.
        bounds=image.convert('L').point(lambda value:255 if value<248 else 0).getbbox()
        if bounds:
            pad=max(8,round(min(image.size)*.012))
            image=image.crop((max(0,bounds[0]-pad),max(0,bounds[1]-pad),
                              min(image.width,bounds[2]+pad),min(image.height,bounds[3]+pad)))
        data=image.tobytes()
    if data is None:raise ValueError('Maintained original graph input unavailable')
    _,measurements=derive(data,*repair['dimensions'],repair)
    return measurements


def approved_text_equal(old,new,meta):
    from tag_pilot import normalized
    edit=meta.get('wordingCorrection')
    if not edit:return False
    a=normalized(old);b=normalized(new)
    if a.count(edit['oldText'])!=1:return False
    return a.replace(edit['oldText'],edit['newText'])==b


def apply(reader,source,meta):
    from tag_pilot import text_blocks,normalized
    from semantic_runs import decoded_shows
    from pypdf._cmap import get_encoding
    errors=validate_bindings(source,meta)
    if errors:raise ValueError('; '.join(errors))
    page=reader.pages[0]; repair=meta.get('visualRepair')
    if repair:
        found=[]
        objects=page['/Resources']['/XObject']
        for key,ref in list(objects.items()):
            obj=ref.get_object()
            if obj.get('/Subtype')=='/Image' and digest(obj.get_data())==repair['originalDecodedSha256']:
                if obj.get('/ColorSpace')!='/DeviceRGB' or obj.get('/BitsPerComponent')!=8:raise ValueError('Unproven image color model')
                data,_=derive(obj.get_data(),int(obj['/Width']),int(obj['/Height']),repair)
                replacement=DecodedStreamObject()
                for k,v in obj.items():
                    if k not in ('/Filter','/DecodeParms','/Length'):replacement[k]=v
                replacement.set_data(data);objects[key]=replacement.flate_encode();found.append(key)
        if len(found)!=1:raise ValueError('Ambiguous/missing reviewed image use')
    edit=meta.get('wordingCorrection')
    if edit:
        ops,blocks=text_blocks(page,reader)
        matches=[b for b in blocks if b['text']==edit['oldText']]
        if len(matches)!=1:raise ValueError('Retained wording source drift')
        block=matches[0];shows=decoded_shows(page,ops)
        indices=[i for i in shows if block['start']<=i<=block['end']]
        fontops=[args for args,op in ops[block['start']:block['end']+1] if op==b'Tf']
        if len(fontops)!=1:raise ValueError('Unproven mixed-font wording paragraph')
        name,size=fontops[0];font=page['/Resources']['/Font'][name].get_object()
        encoding,cmap=get_encoding(font); reverse={}
        for byte in range(256):
            try:
                ch=encoding.get(byte,chr(byte)) if isinstance(encoding,dict) else bytes([byte]).decode(encoding)
                ch=cmap.get(ch,ch)
                if len(ch)==1:reverse[ch]=byte
            except UnicodeError:pass
        def encode(text):
            try:return bytes(reverse[c] for c in text)
            except KeyError:raise ValueError('Wording needs an unavailable embedded glyph')
        first=int(font['/FirstChar']);widths=font['/Widths']
        def width(text):return sum(float(widths[b-first])*float(size)/1000 for b in encode(text))
        limit=max(width(shows[i][1]) for i in indices)
        lines=[];line=''
        for word in edit['newText'].split():
            proposed=(line+' '+word).strip()
            if width(proposed)>limit and line:lines.append(line);line=word
            else:line=proposed
        lines.append(line)
        if len(lines)!=len(indices) or any(width(line)>limit+.001 for line in lines):raise ValueError('Wording does not fit existing line boxes')
        # Keep original single-byte subset-font operands throughout the page;
        # serializing decoded TextStringObjects would corrupt control-code
        # glyphs such as multiplication signs and curly quotation marks.
        for i,(raw,text) in shows.items():ops[i]=([ByteStringObject(raw)],b'Tj')
        for i,line in zip(indices,lines):ops[i]=([ByteStringObject(encode(line))],b'Tj')
        stream=ContentStream(None,reader);stream.operations=ops;page[NameObject('/Contents')]=stream
