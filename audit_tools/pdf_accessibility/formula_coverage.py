"""Source-bound coverage of mathematical operators, with reviewed prose exceptions.

This catches an omitted authored Formula selector, not just a removed PDF tag.
It does not infer arbitrary mathematics or certify spoken meaning.
"""
import re
from tag_pilot import card_items

def fields(source,metadata):
    c=source['content'];result={k:c[k] for k in ('core','worked','watch','check','outcome','workedLabel')}
    result['title']=source['title']
    result.update({'recognition/'+str(i):t for i,t in enumerate(c['recognition'])})
    if metadata.get('instructionCard'):
        result.update({'card/'+str(i):t for i,t in card_items(metadata['instructionCard'])})
    return result

def uncovered(source,metadata):
    missing=[]
    for field,text in fields(source,metadata).items():
        covered=set()
        for formula in metadata.get('inlineFormulas',[]):
            if formula['sourceField']==field:
                covered.update(range(formula['compactStart'],formula['compactStart']+len(re.sub(r'\s+','',formula['text']))))
        for op in re.finditer(r'[=+/%$^<>×−]|(?<![\w\d])-(?=\d)|(?<=\s)-(?=\s)|(?<=\d)\s*x\s*(?=[$\d])',text):
            offset=len(re.sub(r'\s+','',text[:op.start()]))
            if offset not in covered:missing.append({'sourceField':field,'compactStart':offset,'symbol':op.group()})
    return missing

def check(source,metadata):
    if not metadata.get('formulaCoverageReviewed'):return [] # Backward-compatible pilot evidence.
    remaining=uncovered(source,metadata)
    exceptions=metadata.get('nonMathSymbols',[])
    expected=[{k:e[k] for k in ('sourceField','compactStart','symbol')} for e in exceptions]
    if any(e.get('reason')!='Reviewed prose separator, not a mathematical operator' for e in exceptions):
        return ['UNREVIEWED_NONMATH_EXCEPTION']
    return [] if remaining==expected else ['SOURCE_FORMULA_COVERAGE_CHANGED']
