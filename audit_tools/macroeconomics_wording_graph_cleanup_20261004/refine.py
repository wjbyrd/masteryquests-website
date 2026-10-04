from draft_utils import *
import re

patches['PG4-MM-M-002']['options'][3]='The central bank changes supplied balances whenever the interest rate changes.'
patches['PG3-AS-L-001']['options'][keys['PG3-AS-L-001']]='Whether productive capacity has been restored; lower wage costs alone do not replace the lost equipment.'
patches['PG3-AS-L-001']['q']=patches['PG3-AS-L-001']['q'].replace('old level of potential output','old output level')
patches['PM2B3-PROD-EB-002']['options'][0]=patches['PM2B3-PROD-EB-002']['options'][0].replace(' even on a flattening curve','')
patches['ECON-SP-LEGENDARY-9024']['options'][1]='The direct and induced effects contract demand; the interest-rate effect further reduces demand.'
patches['PG3-AD-L-001']['options'][0]='Desired spending rises by about 35 units; the equilibrium output response still requires aggregate-supply information.'
patches['P52A-CPI-LB-002']['options'][keys['P52A-CPI-LB-002']]='No. Inflation needs the preceding-period denominator; current CPI is 122 and next inflation is about 7.4%.'
draft('43151',patches['43151']['q'],[
 'Borrowing adds to the outstanding debt used to finance the deficit.',
 'Borrowing reduces outstanding debt by the amount of the deficit.',
 'Borrowing turns the budget deficit into a surplus without changing debt.',
 'Borrowing raises tax revenue, leaving the outstanding debt unchanged.'],patches['43151']['feedback'])
for i,p in list(patches.items()):
 if 'replacement costs 20% more but provides twice' in p['q']:
  draft(i,p['q'],[
   'The price per unit of service falls; counting the entire sticker-price increase as inflation ignores the quality improvement.',
   'The comparable price rises 20%; improved service should have no role in measuring a like-for-like price.',
   'The comparable price is unchanged; a new version is always treated as having the old price.',
   'The price per unit of service doubles; the quality gain should be added to rather than allowed for in the comparison.'],p['feedback'])
patches['LG-Q-355']['options'][keys['LG-Q-355']]='Incomes can rise too, so not everyone necessarily loses; inflation can still impose real costs and redistribute purchasing power.'
patches['LG-Q-355']['feedback']='Rising prices alone do not establish that everyone loses purchasing power: nominal incomes and fixed contracts matter. Inflation can still use resources, distort decisions and redistribute wealth.'
patches['P52A-FISCAD-LB-001']['q']=patches['P52A-FISCAD-LB-001']['q'].replace('Which assumption would make that cancellation plausible, and why does it fail here?','What mistaken assumption about the initial consumption response underlies this claim?')
patches['ECON-NL-LEGENDARYBOSS-9102']['q']=patches['ECON-NL-LEGENDARYBOSS-9102']['q'].replace('No inventories change.','The farm buys no intermediate inputs, and no inventories change.')
patches['ECON-NL-LEGENDARYBOSS-9101']['q']=patches['ECON-NL-LEGENDARYBOSS-9101']['q'].replace('Unrelated domestic services add $61.','The supplier buys no intermediate inputs. Unrelated domestic services add $61.')
draft('43292','Which explanation of the move from A to B illustrates the effect of saving on private investment?',[
 'Lower saving raises borrowing costs, reducing investment along the existing demand curve.',
 'Higher saving lowers borrowing costs, increasing investment along the existing demand curve.',
 'Lower saving raises borrowing costs, shifting the investment-demand curve left.',
 'Lower saving reduces borrowing costs, so firms undertake more investment projects.'],
 'S1 lies left of S0, and B has a higher real rate and less investment than A. The rate increase crowds out investment along the unchanged demand curve.',
 'KEEP GRAPH','Leftward saving-supply shift and B above/left of A; no numerical calculation required.')
text('PM2B3-PROD-H-001','With technology and other inputs fixed, capital per worker increases along a rising production function with diminishing marginal returns. What would another equal addition to capital per worker imply?',
 'Diminishing marginal returns mean that equal additional amounts of capital yield progressively smaller positive output gains. They do not imply deteriorating technology or negative total output growth.',
 reason='The original construct is diminishing marginal returns. Merely asking for a smaller gain is answerable from that principle; forcing coordinates would add a calculation rather than improve this conceptual task.')
reviews['ECON-SP-HARD-214'].update(decision='KEEP GRAPH',graph_evidence='AD2-AS2 output Y2 lies to the right of LRAS at Y1.',decision_reason='The existing wording-only revision preserves a graph-dependent output-gap classification.')

def tidy(t):
 t=re.sub(r'([a-z]{2,})(?=\d)',r'\1 ',t)
 t=re.sub(r'([A-Za-z])(?=\$)',r'\1 ',t)
 t=re.sub(r'(?<=%)(?=[A-Za-z])',' ',t)
 t=re.sub(r'\b([aA])(?=\d)',r'\1 ',t)
 t=re.sub(r'\b(CPI)(?=\d)',r'\1 ',t)
 t=re.sub(r'\b(output|point|potential|is|at|prices|rise|rate|inflation|unemployment)(?=[YPIUr]\d)',r'\1 ',t)
 t=t.replace('is+','is +').replace('is−','is −').replace('roseP','rose P').replace('riseP','rise P')
 return t
for i,p in patches.items():
 for f in ['q','feedback']:p[f]=tidy(p[f])
 p['options']=[tidy(x) for x in p['options']]
 if 'wording' not in reviews[i] and not reviews[i].get('advanced_inference') and not reviews[i].get('decision'):
  reviews[i]['wording']='Replaced author-facing phrasing with the economic task itself; retained the approved assumptions.'
save()
