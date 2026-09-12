"""Exact source-bound runs for the proven single-byte ReportLab PDF layouts.

Split existing text-show operands without changing bytes, font, advances, or
painting order. Unsupported encodings/operators fail closed. No OCR or added text.
"""
from pypdf._cmap import get_encoding
from pypdf.generic import ByteStringObject
import re

def compact(text):
    return re.sub(r'\s+', '', text)

def decoded_shows(page, ops):
    fonts=page['/Resources']['/Font']; font=None; stack=[]; result={}
    for i,(args,op) in enumerate(ops):
        if op==b'q': stack.append(font)
        elif op==b'Q': font=stack.pop()
        elif op==b'Tf': font=fonts[args[0]].get_object()
        elif op in (b'TJ',b"'",b'"'):
            raise ValueError('Unsupported text-show operator requires reviewed implementation')
        elif op==b'Tj':
            raw=args[0].original_bytes if hasattr(args[0],'original_bytes') else bytes(args[0])
            encoding,cmap=get_encoding(font)
            characters=[]
            for byte in raw:
                encoded=encoding.get(byte,chr(byte)) if isinstance(encoding,dict) else bytes([byte]).decode(encoding)
                value=cmap.get(encoded,encoded)
                if len(value)!=1: raise ValueError('Multibyte/ligature run needs explicit support')
                characters.append(value)
            result[i]=(raw,''.join(characters))
    return result

def plan_runs(nodes, ranges, shows, formulas):
    """Return each text-show's byte slices and semantic owner in source order."""
    plans={}; matched=set()
    for ni,item in enumerate(list(nodes)):
        if item['role'] not in ('P','LBody','H1','H2','H3') or not item['text']: continue
        relevant=[(j,raw,text) for start,end,owner in ranges if owner==ni
                  for j,(raw,text) in shows.items() if start<=j<=end]
        relevant.sort()
        flat=''.join(compact(text) for _,_,text in relevant)
        if flat!=compact(item['text']): raise ValueError('Run decoding differs from canonical paragraph')
        selected=[]
        for fi,formula in enumerate(formulas):
            if formula.get('sourceField') and item.get('sourceField')!=formula['sourceField']:continue
            if formula['paragraph']!=item['text']: continue
            target=compact(formula['text']); start=formula['compactStart']; end=start+len(target)
            if flat[start:end]!=target: raise ValueError('Stale inline Formula selector')
            if any(start<b and end>a for a,b,_ in selected): raise ValueError('Overlapping Formula selectors')
            idx=len(nodes)
            nodes.append({'role':'Formula','parent':ni,'alt':formula['alternative'],
                          'text':None,'ranges':[],'inline':True,'formulaText':formula['text']})
            selected.append((start,end,idx)); matched.add(fi)
        if not selected: continue
        offset=0
        for op_index,raw,text in relevant:
            owners=[]
            for ch in text:
                owner=next((idx for a,b,idx in selected if a<=offset<b),ni)
                owners.append(owner)
                if not ch.isspace(): offset+=1
            pieces=[];start=0
            while start<len(raw):
                end=start+1
                while end<len(raw) and owners[end]==owners[start]:end+=1
                pieces.append((owners[start],ByteStringObject(raw[start:end])));start=end
            plans[op_index]=pieces
    if len(matched)!=len(formulas): raise ValueError('Unmatched source Formula run')
    return plans
