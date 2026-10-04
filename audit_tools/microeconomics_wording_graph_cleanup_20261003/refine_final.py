"""Final editorial review corrections, restricted to the frozen worklist."""
from common import *
import re

for i,old,new in [('P62F-PC-L-072',42,44),('P62F-PC-L-073',38,36)]:
    for f in ['q','feedback','options']:
        x=P[i][f]
        P[i][f]=[s.replace(str(old),str(new)) for s in x] if isinstance(x,list) else x.replace(str(old),str(new))
    R[i]['graph_evidence_required']=f'LRS at industry quantity 80 is approximately ${new} (read from the existing axis).'
    R[i]['numerical_reasoning']=('18 + 0.32*80 = 43.6, approximately $44' if i.endswith('072') else '58 - 0.28*80 = 35.6, approximately $36')

edit('42084',q='Refer to the gardens graph. A producer subsidy supports the socially efficient quantity and is paid on every garden produced. What do buyers pay, what do sellers receive, and how much does the government spend?')
q=draft('42111');opts=q['options'][:]
opts[P['42111']['correct_index']]='Harm or benefit describes the effect on others; production or consumption identifies the activity causing it'
edit('42111',options=opts)

# Require the marginal-average mechanism, not simply matching the drawn slopes.
for i in ['P62E-COP-L-091','P62E-COP-H-035','P62E-COP-L-046','P62E-COP-L-047','P62E-COP-L-048','P62E-COP-H-013','P62E-COP-L-045']:
    x=P[i]
    for n,s in enumerate(x['options']):
        s=s.replace('AVC rises while AC falls','the next units cost more than AVC but less than AC, raising AVC and lowering AC')
        s=s.replace('AVC rises while ATC falls','the next units cost more than AVC but less than ATC, raising AVC and lowering ATC')
        s=s.replace('so AC rises','so the next units cost more than the existing average and raise AC')
        s=s.replace('both AVC and ATC rise','the next units cost more than either average and raise both AVC and ATC')
        s=s.replace('both AVC and ATC fall','the next units cost less than either average and lower both AVC and ATC') if i.endswith('L-045') else s
        x['options'][n]=s
for i in ['P62E-COP-H-017','P62E-COP-L-049','P62E-COP-M-026','P62E-COP-B2-036']:
    P[i]['options']=[s.replace('each crossed average is at its minimum','the next units switch from lowering to raising the relevant average because MC crosses it from below').replace('each crossed average is at its maximum','the next units switch from raising to lowering the relevant average because MC crosses it from below') for s in P[i]['options']]

# Only prose newly authored for graph repairs is normalized here.
terms='LRATC|SRATC[123]?|ATC|AVC|AFC|TVC|TFC|TC|MC[12]?|MRP|MFC|MPC|MSC|MPB|MSB|MR|AR|MP|AP|TP|LRS|TR|CS|PS|DWL|IC[123]?|BC[01]?|Q[012]?|P[012]?|L'
def prose(s):
    s=re.sub(r'(?<=[a-z’])(?=\$|\d)', ' ',s)
    s=re.sub(r'(?<=[a-z’])('+terms+r')(?=\b|\d|[=<>≈])',r' \1',s)
    # Single-letter symbols must not split words such as Price or Lorenz.
    multi_terms=terms.split('|Q')[0]
    s=re.sub(r'\b('+multi_terms+r')(?=[a-z])',r'\1 ',s)
    s=re.sub(r'\b('+terms+r')(?=\d{2,})',r'\1 = ',s)
    s=re.sub(r'(?<=\d)(?=[A-Za-z])',' ',s)
    s=re.sub(r'(?<=\d) (st|nd|rd|th)\b',r'\1',s)
    s=re.sub(r'(?<=[,;])(?=\S)', ' ',s)
    s=re.sub(r'(?<=\d), (?=\d{3}\b)',',',s)
    s=re.sub(r'\s*([=<>≈×])\s*',r' \1 ',s)
    s=s.replace('with fixed costs curves','with unchanged cost curves').replace('P 1','P1').replace('P 2','P2').replace('Q 1','Q1').replace('Q 2','Q2')
    return re.sub(r' +',' ',s).strip()
for i in G:
    for f in ['q','feedback']:P[i][f]=prose(P[i][f])
    P[i]['options']=[prose(s) for s in P[i]['options']]
save()
print('Refined final proposals; review remains pending.')
