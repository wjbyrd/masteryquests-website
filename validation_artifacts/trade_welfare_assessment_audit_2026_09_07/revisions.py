import json,hashlib
from pathlib import Path
W=Path(__file__).resolve().parent
lib=json.loads((W/'library-baseline.json').read_text('utf-8'))
def loc(m):
 for p,qs in m['questions'].items():
  for q in qs:yield p,q
 for p in ['repairQuestions','repairSeedQuestions','bridgeQuestions']:
  for q in m.get(p,[]):yield p,q
records={str(q['id']):q for c in json.loads((W/'concepts.json').read_text()) for p,q in loc(lib['concepts'][c])}
R={}
def f(v):return f'{v:,.2f}'.rstrip('0').rstrip('.') if v%1 else f'{int(v):,}'
def proof(label,expr,value):return {'label':label,'expression':expr,'expected':value}
def add(id,q,options,feedback,reason,proofs=None):
 assert id in records and id not in R,id
 assert len(options)==4 and len(set(options))==4,id
 R[id]={'q':q,'options':options,'feedback':feedback,'reason':reason,'proof':proofs or []}
def retain_options(id,q,reason,proofs):
 b=records[id];norm=lambda s:' '.join(s.strip().lower().split());good=next(o for o in b['options'] if hashlib.sha256(norm(o).encode()).hexdigest()==b['aHash'])
 add(id,q,[good]+[o for o in b['options'] if o!=good],b['feedback'],reason,proofs)

# Small, documented additions of cognitive links inside the existing LO1.5 routes.
add('P52B-TRADE-H-001',
 'With constant tradeoffs per day, Fern can make 28 trays or 7 stools; Cove can make 18 trays or 9 stools. Which specialization and exchange can give both strict gains?',
 ['Fern makes trays, Cove makes stools; 3 trays per stool','Fern makes stools, Cove makes trays; 3 trays per stool','Fern makes trays, Cove makes stools; 5 trays per stool','Fern makes trays, Cove makes stools; 1 tray per stool'],
 'A stool costs Fern 4 trays and Cove 2. Cove has stool advantage and Fern tray advantage; a rate strictly between 2 and 4 trays per stool can benefit both.',
 'C: link comparative advantage, specialization and feasible terms in ordinary Hard.',[proof('Fern stool cost','28/7',4),proof('Cove stool cost','18/9',2),proof('strict rate','2<3<4',True)])
add('P52B-TRADE-H-002',
 'Two studios have constant daily tradeoffs. Alder can make 21 prints or 7 models; Brook can make 20 prints or 10 models. Which proposal benefits both at the margin?',
 ['Brook exports models to Alder for 2.5 prints each','Alder exports models to Brook for 2.5 prints each','Brook exports models to Alder for 3.5 prints each','Brook exports models to Alder for 1.5 prints each'],
 'Alder gives up 3 prints per model; Brook gives up 2. Brook can supply models at a rate above 2 that still saves Alder prints compared with making models itself.',
 'C: require correct export direction as well as terms bounds.',[proof('Alder cost','21/7',3),proof('Brook cost','20/10',2),proof('strict terms','2<2.5<3',True)])
add('P52B-TRADE-EL-001',
 'At constant tradeoffs, Iona makes 32 badges or 8 signs daily; Paz makes 18 badges or 9 signs. Paz offers one sign for 3 badges. Which reciprocal-rate assessment is correct?',
 ['Iona exports badges; 1/3 sign per badge lies between costs of 1/4 and 1/2','Paz exports badges; 3 signs per badge lies between the relevant costs','Iona exports signs because its badge output is greater','Both have sign advantage because 3 exceeds both sign-output ratios'],
 'Iona gives up 1/4 sign per badge and Paz 1/2. Iona exports badges and obtains 1/3 sign each, which is strictly between those costs.',
 'C: reciprocal units, specialization and proposed price in one chain.',[proof('Iona reciprocal','8/32',.25),proof('Paz reciprocal','9/18',.5),proof('price','1/4<1/3<1/2',True)])
add('P52B-TRADE-EL-004',
 'At constant tradeoffs, Slate can make 36 tiles or 12 sinks; Moss can make 24 tiles or 12 sinks. Slate doubles sink capacity without changing tile capacity. Which contract could now give both strict gains?',
 ['Slate exports sinks for 1.75 tiles each','Moss exports sinks for 2.5 tiles each','Slate exports tiles for 0.4 sink each','Moss exports sinks for exactly 2 tiles each'],
 'Slate\'s sink cost falls from 3 to 1.5 tiles while Moss\'s remains 2. Slate now exports sinks; 1.75 lies between their costs. At 2, Moss is indifferent.',
 'C: technology must change relative costs and the acceptable contract.',[proof('new Slate cost','36/24',1.5),proof('Moss cost','24/12',2),proof('mutual terms','1.5<1.75<2',True)])

# Genuine missing label/consequence connection. No new objective or routing is introduced.
add('P62D-ITP-E-028',
 'New domestic pump makers request temporary protection while they learn to match established foreign firms\' costs. Which argument are they using?',
 ['Infant-industry argument','National-security argument','Jobs argument based only on existing employment','Retaliation against a partner\'s trade barrier'],
 'The infant-industry argument claims temporary learning can make a new industry competitive. The label alone does not establish that future benefits exceed current costs.',
 'B: add concise applied argument identification before upper tiers.')
add('P62D-ITP-E-025',
 'At an importing country\'s request, a foreign government caps shipments and gives its exporters the rights free. Which restriction is this?',
 ['A voluntary export restraint (VER)','An import tariff collected by the importing treasury','An import-license auction held by the importing treasury','A subsidy paid on domestic production'],
 'A VER limits exports from the supplying country. With free rights assigned to foreign exporters, those exporters can capture the scarcity rents.',
 'A: VER identification missing despite established quota/foreign-rent scope.')
add('P62D-ITP-M-026',
 'Under a voluntary export restraint, foreign firms receive free rights to supply 45 units. Buyers pay $27 while the unchanged world price is $23. Who receives the $180 scarcity rent?',
 ['The foreign firms holding the export rights','The importing government as tariff revenue','Domestic producers in addition to their producer surplus','Domestic consumers as a price rebate'],
 'The price wedge is $4 and 45 units cross the border: $180. The foreign holders of the free rights receive the rents; the importing treasury collects no tariff.',
 'A: connect VER terminology with explicit rent allocation.',[proof('rent','(27-23)*45',180)])
add('PMA-ITP-H-030',
 'A tariff and a voluntary export restraint each allow 45 imports at a domestic price of $27; the world price stays $23. Foreign firms get the VER rights free. How much higher is importing-country surplus under the tariff, holding quantities and other costs equal?',
 ['$180, because the price-wedge receipts stay in the importing country','$0, because identical prices imply identical national welfare','$1,215, because all spending on imports is government revenue','$180, because the tariff removes both distortion losses'],
 'Both restrictions have the same production and consumption distortions. The difference is $4 × 45 = $180: tariff receipts stay domestic while the specified VER rents go abroad.',
 'A/B: applied VER comparison, with rent transfer distinguished from distortion.',[proof('domestic difference','(27-23)*45',180)])
add('P62D-ITP-R-018',
 'A learner says a voluntary export restraint must earn revenue for the importing treasury. Foreign exporters receive the export rights free. What corrects the claim?',
 ['The foreign rights holders receive the scarcity rents; a VER is not an import tariff','Every restriction automatically sends its price wedge to the importing treasury','Domestic producers receive the foreign exporters\' rights revenue','Quota rents are destroyed surplus, so no one receives them'],
 'A VER limits foreign shipments. With the rights held free by foreign firms, the price-wedge receipts accrue abroad. Rent ownership, not the word restriction, determines the recipient.',
 'A: repair support for new VER wording within existing quota-rent route.')
add('PMS-ITP-BR-020',
 'A voluntary export restraint gives foreign firms free shipment rights. How does national-welfare accounting connect this arrangement to an equivalent tariff?',
 ['Include the same distortions, but subtract rents sent abroad instead of counting domestic tariff revenue','Count the rents as domestic tax receipts because domestic consumers pay them','Count only producer gains because no import tax is collected','Treat rents and distortion triangles as the same loss in world welfare'],
 'With the same prices and quantities, the distortions match. Foreign rents are a transfer abroad that lowers importing-country welfare relative to domestic tariff receipts; they are not themselves destroyed world surplus.',
 'A: bridge VER rent ownership to national versus global welfare.')

# Repair omitted data, retaining the already appropriate Hard calculation and answer positions.
markets=[('Arden','solar panels',80,20,30,70,8),('Bellora','coffee beans',94,26,42,76,10),('Caspia','bicycles',72,12,20,60,8),('Demer','tablets',104,24,40,90,12),('Estara','wool blankets',92,14,30,72,8),('Faron','ceramic tiles',86,22,32,70,10),('Galena','medical gloves',98,18,34,82,8),('Haven','garden tools',90,30,44,76,6),('Ilyria','paper rolls',78,16,26,66,7),('Juno','olive oil',96,28,38,82,12),('Kestrel','backpacks',88,24,34,72,10),('Lydon','steel bolts',102,20,36,88,10)]
for i,(name,good,A,B,w,ex,t) in enumerate(markets[:5]):
 id=f'P62D-ITP-H-{18+3*i:03}'
 retain_options(id,f'{name} is a small importer of {good}, with demand P = {A} - Qd and supply P = {B} + Qs. The world price is ${w}. What is the net national welfare loss from a ${t} per-unit tariff?',
  'B: supply and demand schedules were missing; restore independent solvability.',[proof('post tariff price',f'{w}+{t}',w+t),proof('tariff loss',f'(1/2)*{t}*({t}+{t})',t*t)])
for i,(name,good,A,B,w,ex,t) in enumerate(markets):
 id=f'P62D-ITP-LB-{3*i+3:03}'
 if not records[id].get('image'):
  retain_options(id,f'{name}\'s {good} market has demand P = {A} - Qd and supply P = {B} + Qs. It imports at Pw = ${w}, then adds a ${t} tariff without affecting the world price. Which complete import, revenue and distortion ledger is correct?',
   'B: checkpoint relied on a different question for its market schedules.',[proof('imports',f'{A}-{w}-{t}-({w}+{t}-{B})',A+B-2*(w+t)),proof('revenue',f'{t}*({A}+{B}-2*({w}+{t}))',t*(A+B-2*(w+t))),proof('each distortion',f'{t}*{t}/2',t*t/2)])
for n,i in [(11,3),(29,9)]:
 name,good,A,B,w,ex,t=markets[i];id=f'P62D-ITP-LB-{n:03}'
 retain_options(id,f'{name} opens its {good} market at Pw = ${ex}. Demand is P = {A} - Qd and supply P = {B} + Qs. Which complete trade-and-welfare outcome is correct?',
 'B: referenced equations were absent from this independently selected checkpoint.',[proof('exports',f'2*{ex}-{A}-{B}',2*ex-A-B),proof('gain',f'({ex}-({A}+{B})/2)**2',(ex-(A+B)/2)**2)])

# Bring weak Hard backfill to normal-exam inference while retaining original skills.
add('PMA-ITP-H-001',
 'A small country has domestic demand P = 54 - Qd and supply P = 18 + Qs. The world price is $28. Which outcome follows when trade opens?',
 ['It imports 16 units; the price falls and domestic consumers gain','It exports 16 units; the price falls and domestic producers gain','It imports 26 units; every unit consumed must be imported','It imports 16 units; domestic consumers lose from the lower price'],
 'Autarky price is $36. At $28, demand is 26 and supply is 10, leaving 16 imports. The lower price benefits domestic consumers.',
 'C: replace direct price recognition with price, quantity and welfare links.',[proof('autarky','(54+18)/2',36),proof('imports','54-28-(28-18)',16)])
add('PMA-ITP-H-002',
 'At an unchanged world price, domestic mills supply 68 units and residents buy 44. After opening to trade, which combination is consistent with this competitive small-country market?',
 ['24 exports, a price above autarky, and a gain to domestic producers','24 imports, a price below autarky, and a gain to domestic consumers','68 exports, since all domestic output is sold abroad','24 exports, a price below autarky, and a loss to domestic producers'],
 'The excess of supply over domestic demand is 24 exports. With upward supply and downward demand, this occurs at a world price above autarky, benefiting domestic producers.',
 'C: infer price position and distribution from quantities.',[proof('exports','68-44',24)])
add('PMA-ITP-H-003',
 'Demand is P = 66 - Qd and supply is P = 18 + Qs. A world price of $42 initially produces no trade. If the world price falls to $36 with the curves unchanged, what follows?',
 ['12 imports and higher domestic consumer surplus','12 exports and higher domestic producer surplus','No trade because the original world price equaled autarky','30 imports because domestic demand becomes 30'],
 'The initial price equals autarky. At $36, Qd = 30 and Qs = 18, so 12 units are imported and consumers gain from the price reduction.',
 'C: turn no-trade recognition into a changed-world-price inference.',[proof('autarky','(66+18)/2',42),proof('imports','66-36-(36-18)',12)])

# Strengthen every repetitive one-step import/export Legendary family (60 records).
# Six distinct reasoning tasks use existing scenarios; none copies the exam's settings/data.
for i,(name,good,A,B,w,ex,t) in enumerate(markets[:10]):
 p0=(A+B)/2;q0=(A-B)/2
 for export in [False,True]:
  price=ex if export else w;gap=abs(A+B-2*price);gain=(price-p0)**2
  qd=A-price;qs=price-B;delta=2+(i%3);nextp=price+delta if export else price-delta
  nextqd=A-nextp;nextqs=nextp-B;nextgap=abs(A+B-2*nextp)
  cs0=q0*q0/2;ps0=cs0;cs=qd*qd/2;ps=qs*qs/2
  loser=cs0-cs if export else ps0-ps;winner=ps-ps0 if export else cs-cs0
  offset=30 if export else 0;id=f'P62D-ITP-L-{offset+3*i+1:03}'
  direction='exports' if export else 'imports';move='rises' if export else 'falls'
  if records[id].get('image'):
   stem=f'Use the {name} {good} graph. If the world price {move} by ${delta} from the displayed line and both straight curves remain unchanged, which new trade outcome follows?'
  else:
   stem=f'{name} has P = {A} - Qd and P = {B} + Qs. Free trade creates {f(gap)} {direction}, but the price is unreported. If that world price then {move} by ${delta}, which new outcome follows?'
  add(id,stem,[f'Price ${f(nextp)}; {f(nextgap)} {direction}; domestic consumers '+('lose' if export else 'gain'),f'Price ${f(nextp)}; {f(gap)} {direction}; domestic consumers '+('lose' if export else 'gain'),f'Price ${f(price)}; {f(gap)} {direction}; the world price cannot change',f'Price ${f(nextp)}; {f(nextgap)} '+('imports' if export else 'exports')+'; domestic consumers '+('gain' if export else 'lose')],
   f'The initial price is ${f(price)}: the signed Qs/Qd gap must equal {f(gap)}. At ${f(nextp)}, Qd = {f(nextqd)} and Qs = {f(nextqs)}; the new gap is {f(nextgap)} {direction}. Consumers '+('pay more and lose surplus.' if export else 'pay less and gain surplus.'),
   'C: reconstruct an unreported price, apply a second price change, and interpret the resulting trade direction.',[proof('initial price',f'({A}+{B}'+('+' if export else '-')+f'{gap})/2',price),proof('new price',f'{price}'+('+' if export else '-')+str(delta),nextp),proof('new gap',f'abs({A}+{B}-2*{nextp})',nextgap)])
  id=f'P62D-ITP-L-{offset+3*i+2:03}'
  add(id,f'{name}\'s {good} market has P = {A} - Qd and P = {B} + Qs. Free trade produces {f(gap)} {direction}. If a costless lump-sum transfer fully restores the losing domestic group\'s autarky surplus, what gain remains with the winners?',
   [f'${f(gain)}; compensation changes distribution without removing the trade gain',f'${f(winner)}; compensation does not reduce what the winners retain',f'${f(loser)}; the transfer is the gain created by trade','$0; restoring the losers necessarily exhausts the national gain'],
   f'Autarky has P = ${f(p0)}, Q = {f(q0)}. The trade gap implies P = ${f(price)}. Winners gain ${f(winner)}, losers lose ${f(loser)}; after the transfer the winners retain ${f(gain)}. Actual compensation is assumed here, not automatic.',
   'C: replace given-surplus subtraction with market reconstruction and compensated welfare.',[proof('trade price',f'({A}+{B}'+('+' if export else '-')+f'{gap})/2',price),proof('net gain',f'({price}-({A}+{B})/2)**2',gain),proof('remaining after compensation',f'{winner}-{loser}',gain)])
  id=f'P62D-ITP-L-{offset+3*i+3:03}';cost=10+i*2;net=gain-cost
  add(id,f'A {name} report opposes opening the {good} market because '+('consumers' if export else 'producers')+f' would lose. Domestic curves are P = {A} - Qd and P = {B} + Qs; Pw = ${price}. A proposed lump-sum compensation plan fully covers that loss and uses ${cost} of real administrative resources. Which assessment follows?',
   [f'The plan can leave winners ${f(net)} ahead while restoring losers',f'National welfare rises ${f(gain)} because administrative resources are only transfers','Compensation must make winners worse off whenever any group loses',f'The transfer itself destroys ${f(loser)} of total surplus'],
   f'Opening trade creates ${f(gain)} in aggregate gains: winner gain ${f(winner)} less loser loss ${f(loser)}. Compensation reallocates surplus, while administration consumes ${cost}. The remaining net gain is ${f(net)}.',
   'B/C: replace an answer that supplied unstated welfare facts with an independently solvable policy claim and real-cost distinction.',[proof('trade gain',f'({price}-({A}+{B})/2)**2',gain),proof('net after real costs',f'{winner}-{loser}-{cost}',net)])

# Tariff Legendary: reconstruct rather than being handed every answer component.
for i,(name,good,A,B,w,ex,t) in enumerate(markets[:10]):
 M=A+B-2*w;Mt=M-2*t;rev=t*Mt;loss=t*t;p=w+t;Qd=A-w;Qs=w-B;csLoss=t*(Qd-t/2);psGain=t*(Qs+t/2)
 id=f'P62D-ITP-L-{61+2*i:03}'
 add(id,f'{name} has P = {A} - Qd and P = {B} + Qs, with Pw = ${w}. A tariff is chosen to leave {Mt} imports. Which ledger follows if the world price is unchanged?',
  [f'Tariff ${t}; revenue ${rev}; deadweight loss ${loss}',f'Tariff ${2*t}; revenue ${2*rev}; deadweight loss ${4*loss}',f'Tariff ${t}; revenue ${t*(A-p)}; deadweight loss ${loss}',f'Tariff ${t}; revenue ${rev}; deadweight loss ${rev+loss}'],
  f'Imports equal {A+B} - 2P, so the target implies P = ${p} and tariff ${t}. Revenue is ${t} × {Mt} = ${rev}. Production expands {t} and consumption contracts {t}; their two triangles sum to ${loss}.',
  'B/C: infer the tariff from a quantity target, then distinguish revenue from distortions.',[proof('policy price',f'({A}+{B}-{Mt})/2',p),proof('revenue',f'({p}-{w})*{Mt}',rev),proof('distortions',f'({p}-{w})*({t}+{t})/2',loss)])
 id=f'P62D-ITP-L-{62+2*i:03}'
 add(id,f'In {name}, a small-country tariff cuts imports from {M} to {Mt}. Straight domestic supply and demand each change by one unit for every $1 price change. A report calls all ${f(csLoss)} of consumer loss deadweight loss. What is the correct correction?',
  [f'The tariff is ${t}; ${rev} is government revenue and ${f(psGain)} a producer transfer, leaving ${loss} destroyed',f'The tariff is ${t}; all ${f(csLoss)} is destroyed because consumers pay it',f'The tariff is ${2*t}; revenue uses the original {M} imports',f'The tariff is ${t}; the ${rev} revenue is the entire net welfare loss'],
  f'The import contraction of {2*t} reflects two quantity responses, so the tariff is ${t}. Receipts are ${t} × {Mt} = ${rev}; each distortion is ${f(loss/2)}. Consumer loss less revenue and the producer transfer leaves ${loss}.',
  'C: reverse-infer the tariff and reconcile consumer loss with transfers and destruction.',[proof('tariff',f'({M}-{Mt})/2',t),proof('revenue',f'{t}*{Mt}',rev),proof('welfare reconciliation',f'{csLoss}-{rev}-{psGain}',loss)])

add('P62D-ITP-EL-001',
 'Import access raises consumer surplus by $640 and reduces producer surplus by $390. A proposal uses a $390 lump-sum transfer to restore producers and consumes $35 in real adjustment resources. Which result separates efficiency from distribution?',
 ['$215 of net gain remains, and compensation occurs only because the proposal provides it','$250 remains because transfers and real adjustment costs are both ignored','$605 remains because the producer transfer creates additional national surplus','$175 is lost because both producer losses and compensation must be subtracted'],
 'The trade gain is 640 - 390 = 250. The transfer reallocates that surplus; the real resource cost reduces it to 215. Potential compensation is distinct from this stipulated actual compensation.',
 'C: add compensation implementation and resource-cost distinction to elementary subtraction.',[proof('net gain','640-390-35',215)])
add('P62D-ITP-EL-008',
 'A small importer has Qd = 100 - P and Qs = P - 20. Pw is $30. A $10 tariff and a quota initially allow 40 imports. Demand then becomes Qd = 120 - P. With all else unchanged, which comparison is correct?',
 ['Tariff: price $40 and 60 imports; quota: price $50 and 40 imports','Tariff: price $50 and 40 imports; quota: price $40 and 60 imports','Both keep price $40 and imports 40','Both raise price to $50 because a demand increase must raise the world price'],
 'The tariff keeps domestic price at 30 + 10 = 40, where imports are 80 - 20 = 60. Under the cap, 120 - P - (P - 20) = 40 implies P = 50.',
 'C: require quantity and price reconstruction after demand growth.',[proof('initial imports','100-40-(40-20)',40),proof('tariff imports','120-40-(40-20)',60),proof('quota price','(120+20-40)/2',50)])
add('P62D-ITP-EL-009',
 'A quota allows 36 imports at $29 while Pw remains $24. Consumers lose $310 and domestic producers gain $94. Foreign exporters receive the rights free. Relative to free trade, what are the national loss and the global distortion loss, ignoring other effects?',
 ['$216 national loss; $36 distortion loss','$36 national loss; $216 distortion loss','$180 for both because the rents are the only loss','$310 for both because every dollar lost by consumers disappears'],
 'Rents are (29 - 24) × 36 = 180. Domestic surplus falls 310 - 94 = 216. Of this, 180 is transferred abroad; the remaining 36 is destroyed surplus.',
 'C: separate national rent outflow from global efficiency loss.',[proof('rents','(29-24)*36',180),proof('national loss','310-94',216),proof('distortion','310-94-(29-24)*36',36)])
add('P62D-ITP-EL-010',
 'Two quota systems have the same price and import quantity. Rents total $240. System A auctions rights competitively and spends $20 of real resources administering them; system B gives rights free to domestic importers at no resource cost. Ignoring other effects, which comparison is correct?',
 ['A raises $240 for government, but national surplus is $20 lower than under B','A raises national surplus by $240 because auction receipts are new gains','B loses $240 nationally because private domestic rents leave the country','Both have identical national surplus because administrative costs are transfers'],
 'Both keep the $240 rent inside the country; auctioning changes its recipient. The stated real administrative cost makes A $20 worse nationally than B.',
 'C: test the assumptions behind auction equivalence rather than merely name the institution.',[proof('national difference','0-20',-20)])
add('P62D-ITP-EL-012',
 'A protected pump industry reports falling average costs. The same decline occurred in unprotected firms using a newly available machine. Which additional evidence is most needed before crediting protection to infant-industry learning?',
 ['Evidence that protection generated additional learning whose future benefits exceed its costs','Evidence that protected firms still employ workers, regardless of the source of cost reductions','Evidence that import prices exceed zero, proving domestic learning is valuable','Evidence that production increased, proving the tariff caused every cost reduction'],
 'A common technology improvement weakens the claim that protection caused the learning. The case needs an additional benefit attributable to the policy and comparison with its costs.',
 'C: causal evidence and cost-benefit logic for a selected infant-industry argument.')
add('P62D-ITP-EL-016',
 'A small economy has Qd = 78 - P and Qs = P - 18. The world price initially equals its autarky price. Demand then rises by 12 units at every price while Pw stays fixed. What happens?',
 ['It imports 12 units at $48; its new autarky price would be $54','It imports 6 units at $54 because domestic autarky still sets the trading price','It exports 12 units at $48 because demand has shifted right','It has no trade because Pw equaled the old autarky price'],
 'Initially Pw = (78 + 18)/2 = 48. New demand is 90 - P, giving a closed-economy price of 54, but trade holds price at 48: Qd = 42 and Qs = 30.',
 'C: infer the initial world price, update autarky, and distinguish it from the trading price.',[proof('initial price','(78+18)/2',48),proof('new autarky','(90+18)/2',54),proof('imports','90-48-(48-18)',12)])
add('P62D-ITP-EL-024',
 'A tariff raises price from $16 to $21. Domestic output rises from 14 to 24 units and domestic purchases fall from 74 to 59. Which revenue calculation and interpretation is correct?',
 ['$175; the tariff taxes the 35 units still imported','$295; every domestic purchase pays the import tariff','$300; the original import volume remains the tax base','$120; tariff revenue is the value of all domestic production at the tariff rate'],
 'The tariff is $5 and the remaining import gap is 59 - 24 = 35. Revenue is $175. Neither total purchases nor pre-tariff imports is the correct tax base.',
 'C: reconstruct both wedge and post-tariff import tax base.',[proof('tariff','21-16',5),proof('post imports','59-24',35),proof('revenue','(21-16)*(59-24)',175)])
add('P62D-ITP-EL-025',
 'At Pw = $18, Qd = 54 and Qs = 20. A quota is set at 34 imports, with no initial price premium. Demand then increases by 10 at every price. If Qd falls by 2 and Qs rises by 3 for each $1 price increase, what does the unchanged quota do?',
 ['Price rises to $20; the initially zero-rent cap now creates $68 in rents','Price remains $18 and imports rise to 44 because the quota was initially harmless','Price rises to $23 because only the demand response matters','$34 of rents appears because rent always equals the quota quantity'],
 'At the old price the new import gap is 44, ten above the cap. Each $1 rise closes the gap by 5, so price rises $2. Rents are $2 × 34 = $68.',
 'B/C: avoid ambiguous binding-at-equality language; analyze the initially zero-premium boundary under a shift.',[proof('price rise','10/(2+3)',2),proof('rent','2*34',68)])
add('P62D-ITP-EL-029',
 'Demand is P = 68 - Qd and supply is P = 20 + Qs. Pw is $30. A proposed tariff is $18 per imported unit. What is the competitive domestic outcome?',
 ['Price $44, no imports and no tariff revenue','Price $48, positive imports and revenue on all purchases','Price $44, but the government collects $18 on every domestic unit','Price $30, because a tariff cannot eliminate imports'],
 'Autarky price is (68 + 20)/2 = 44. The proposed import cost is 48, above autarky. Domestic trade clears at 44 without imports, so the treasury receives zero tariff revenue.',
 'C: distinguish the prohibitive threshold from mechanically adding the tariff to Pw.',[proof('autarky','(68+20)/2',44),proof('landed price','30+18',48),proof('imports at autarky','68-44-(44-20)',0)])
add('P62D-ITP-EL-030',
 'A country imports 24 units when Pw is $20 and exports 16 when Pw is $30. Domestic supply and demand are unchanged and straight. At what world price would net trade be zero?',
 ['$26, between the two observations','$25, because it must be the midpoint of the quoted prices','$24, equal to the initial imports','$30, because exports determine autarky'],
 'Net imports fall from +24 to -16, a 40-unit decline over $10. At 4 units per dollar, eliminating the initial 24-unit import gap requires a $6 rise, to $26.',
 'C: infer autarky from two signed trade observations rather than name a broad interval.',[proof('gap slope','(24+16)/(30-20)',4),proof('zero trade price','20+24/4',26)])

# Upper-tier institutional and evidence synthesis within the existing policy skills.
add('P62D-ITP-L-081',
 'With Qd = 110 - P, Qs = P - 10 and Pw = $30, a quota is auctioned to allow 40 imports. A $10 tariff is proposed instead. Demand then rises by 20 at every price. With competitive licensing and no administration costs, which post-shift outcome is correct?',
 ['Quota: price $50 and receipts $800; tariff: price $40 and receipts $600','Both: price $40 and receipts $400','Quota: price $40 and receipts $600; tariff: price $50 and receipts $800','Both: price $50 and receipts $800'],
 'After the shift, Qd = 130 - P. A 40-unit cap requires 140 - 2P = 40, so P = 50 and auction rents are 20 × 40 = 800. The tariff keeps P = 40, allows 60 imports and raises 600.',
 'C: reconstruct both initially equivalent regimes after demand changes.',[proof('initial quota price','(110+10-40)/2',40),proof('new quota price','(130+10-40)/2',50),proof('quota receipts','(50-30)*40',800),proof('tariff receipts','10*(130-40-(40-10))',600)])
add('P62D-ITP-L-082',
 'An importing market has Qd = 96 - P, Qs = P - 16 and Pw = $28. A voluntary export restraint gives foreign firms free rights to ship 32 units. Compared with free trade, what are the importing-country welfare loss and the part transferred abroad?',
 ['$528 lost nationally, including $384 in foreign rents','$144 lost nationally, with no foreign transfer','$384 lost nationally, all of it destroyed surplus','$912 lost nationally, including a second deduction for the same rents'],
 'The cap implies P = (96 + 16 - 32)/2 = 40, a $12 wedge. Rents are 12 × 32 = 384. Straight curves each change quantity by 12, creating total distortion of 144. National loss is 384 + 144 = 528.',
 'A/C: VER, endogenous price, national versus global accounting.',[proof('quota price','(96+16-32)/2',40),proof('rents','(40-28)*32',384),proof('distortion','(40-28)**2',144),proof('national loss','384+144',528)])
add('P62D-ITP-L-083',
 'An importer initially has Qd = 92 - P, Qs = P - 12 and Pw = $26. A $10 tariff and a 32-unit quota initially match. Demand then falls by 28 at every price. Which outcome follows?',
 ['The quota becomes nonrestrictive at $26 with 24 imports; the tariff still raises price to $36 with 4 imports','Both keep price $36 because initially equivalent restrictions remain equivalent','The quota keeps imports at 32 even when buyers want only 24 at the world price','The tariff becomes nonrestrictive while the quota raises price above $36'],
 'New demand is 64 - P. At Pw = 26 the desired import gap is 38 - 14 = 24, below the cap. Under the tariff P = 36 and imports are 28 - 24 = 4. A cap is a maximum, not a required shipment.',
 'C: use a demand fall and nonbinding boundary rather than repeat the usual demand-growth result.',[proof('initial imports','92-36-(36-12)',32),proof('free imports after shift','64-26-(26-12)',24),proof('tariff imports after shift','64-36-(36-12)',4)])
add('P62D-ITP-L-084',
 'A quota causes a $520 consumer loss, a $170 domestic producer gain and $280 of rents. Domestic firms hold the rights and spend $60 of real resources competing for them. A competitive auction would yield the same rents and use $15 of real resources. How much would switching to the auction improve national welfare?',
 ['$45; it saves resources while changing who receives an existing transfer','$280; all auction proceeds are newly created surplus','$325; add auction proceeds to the resource saving','$60; auctions have no resource cost regardless of the stated data'],
 'Distortion before rent-seeking is 520 - 170 - 280 = 70. The present system loses 70 + 60 = 130; the auction loses 70 + 15 = 85. National welfare improves by 45, not by the rent amount.',
 'C: combine rent dissipation, fiscal transfers and policy comparison.',[proof('distortion','520-170-280',70),proof('improvement','(70+60)-(70+15)',45)])
add('P62D-ITP-L-085',
 'Demand is P = 86 - Qd, supply is P = 14 + Qs and Pw is $30. A ministry compares tariffs of $6 and $14. Which comparison correctly distinguishes government revenue from national welfare?',
 ['Both raise $168, but the $14 tariff destroys $160 more surplus','Both raise $168 and therefore have equal national welfare','The $14 tariff raises more revenue because its rate is larger','The $6 tariff destroys more surplus because it permits more imports'],
 'Imports are 40 - 2t. At t = 6, revenue is 6 × 28 = 168 and DWL = 36. At t = 14, revenue is 14 × 12 = 168 and DWL = 196. The difference is 160.',
 'C: compare multiple rates with identical receipts but different distortions.',[proof('low revenue','6*(86+14-2*(30+6))',168),proof('high revenue','14*(86+14-2*(30+14))',168),proof('extra loss','14**2-6**2',160)])
add('P62D-ITP-L-086',
 'Officials propose a tariff on emergency valves because a foreign supply outage could halt hospitals. Domestic firms cannot expand within five years; audited reserves and two independent allied suppliers could cover an outage sooner at lower resource cost. Which assessment is best?',
 ['The security concern can be real, but the evidence favors reserves and diversified supply over this tariff','The security label alone establishes that any tariff improves resilience','The tariff must solve the outage risk because it raises domestic producer surplus','All resilience spending is wasteful because the small-country trade model has gains from trade'],
 'Evaluate whether the instrument actually reduces the stated risk and whether another instrument does so at lower cost. A legitimate objective does not make an ineffective tariff the preferred response.',
 'C: test policy effectiveness and alternatives simultaneously, without introducing new arguments.')
add('P62D-ITP-L-087',
 'A new sensor industry predicts learning gains worth $18 million in present value. Protection would cost $24 million in present-value consumer surplus, transfer $9 million to domestic producers and yield $5 million of tariff revenue. Suppose learning is additional and there are no other effects. Which evaluation is correct?',
 ['The modeled net gain is $8 million, but the case depends on the learning forecast being credible','The modeled net loss is $6 million because all consumer loss is destroyed','The modeled net gain is $32 million because producer gains and revenue are additional to learning','The policy is proven desirable regardless of whether learning occurs'],
 'Static national loss is 24 - 9 - 5 = 10 million. Additional learning of 18 gives a modeled gain of 8. If the learning is not caused by protection or does not materialize, the conclusion can reverse.',
 'C: conditional infant-industry welfare test using stated present values.',[proof('static loss','24-9-5',10),proof('conditional net gain','18-(24-9-5)',8)])
add('P62D-ITP-L-088',
 'A tariff preserves 240 jobs in an input industry but eliminates 160 downstream jobs. Retaliation would eliminate another 120 export jobs if it occurs; its probability is one-half. What follows from these employment estimates alone?',
 ['Expected employment rises by 20, but this alone does not establish a national welfare gain','Expected employment rises by 80, so the tariff necessarily raises welfare','Expected employment falls by 40 because retaliation is certain','Expected employment rises by 240 because losses outside the protected industry are irrelevant'],
 'Expected job change is 240 - 160 - 0.5 × 120 = 20. Employment counts alone do not measure consumer surplus, resource costs or other welfare effects.',
 'C: evaluate the selected jobs argument with cross-sector and conditional effects.',[proof('expected employment','240-160-0.5*120',20)])
add('P62D-ITP-L-089',
 'A minister defends a tariff by citing $12 million of domestic producer gains. It also raises $8 million in revenue and costs consumers $17 million. Retaliation causes a separate $7 million net loss to domestic exporters. Ignoring other effects, which conclusion follows?',
 ['National surplus falls $4 million; the protected industry does not capture the whole policy effect','National surplus rises $3 million because retaliation affects only foreigners','National surplus rises $12 million because the protected producers are the relevant group','National surplus falls $24 million because producer gains and revenue cannot offset consumer losses'],
 'Include all the stated domestic effects once: 12 + 8 - 17 - 7 = -4 million. Retaliation transmits costs beyond the original protected industry; producer gains alone do not establish a national gain.',
 'C: evaluate cross-industry retaliation consequences already in the selected curriculum.',[proof('net package','12+8-17-7',-4)])
add('P62D-ITP-L-090',
 'Opening trade gives consumers $720 and costs producers $420. A plan transfers $420 from consumers to producers but uses $75 of real resources delivering assistance. Compared with autarky, which statement is correct?',
 ['Producers can be restored and consumers retain $225; compensation and efficiency must both be evaluated','Consumers retain $300 because assistance resources are just transfers','National surplus rises $720 because producer compensation cancels the original loss without cost','National surplus falls $195 because compensation must be subtracted twice'],
 'The initial national gain is 720 - 420 = 300. The transfer restores producers but changes no total; resource use reduces the gain to 225. The result presumes the assistance is actually delivered.',
 'C: replace broad equity recognition with an implemented distribution and resource-cost calculation.',[proof('retained gain','720-420-75',225)])

# Existing graph identities are unchanged; the graph must supply the relevant evidence.
add('P62D-ITP-L-091',
 'Use the displayed avocado import graph. Suppose a policy raises domestic price $1 above the shown world price, with world price and both straight curves unchanged. What tariff revenue and remaining national gain relative to autarky follow? Quantities are in thousands.',
 ['$50 thousand revenue and $75 thousand remaining gain','$50 thousand revenue and $25 thousand remaining gain','$200 thousand revenue and $75 thousand remaining gain','$100 thousand revenue and $100 thousand remaining gain'],
 'The graph gives Pw = 5 and autarky price 7. At price 6, Qs = 150 and Qd = 200, so revenue is 1 × 50 = 50 thousand. Free-trade gains are 100 thousand; the tariff destroys 0.5 × 1 × (25 + 25) = 25 thousand, leaving 75.',
 'D/C: replace a direct graph quantity package with a hypothetical tariff and retained-gains reconstruction.',[proof('imports','200-150',50),proof('revenue','1*50',50),proof('free gains','(7-5)*(225-125)/2',100),proof('remaining gains','100-1*(25+25)/2',75)])
add('P62D-ITP-L-092',
 'From the displayed avocado import graph, a program would restore the domestic producers\' autarky surplus using a lump-sum transfer from consumers. Administration uses $30 thousand of real resources. How much of the opening-to-trade gain would consumers retain after both payments?',
 ['$70 thousand','$100 thousand','$300 thousand','$370 thousand'],
 'At the two graph prices, producer loss is 0.5 × (7 - 5) × (175 + 125) = 300 thousand. Consumer gain is 0.5 × 2 × (175 + 225) = 400 thousand. Paying 300 compensation plus 30 resource cost leaves 70 thousand.',
 'D/C: require both surplus areas and actual compensation rather than a generic net-gain statement.',[proof('producer loss','(7-5)*(175+125)/2',300),proof('consumer gain','(7-5)*(175+225)/2',400),proof('remaining gain','400-300-30',70)])
add('P62D-ITP-L-093',
 'In the displayed avocado export graph, suppose Pw falls by $1 while both straight domestic curves stay fixed. What are the new exports and the decrease in gains from trade relative to the displayed free-trade outcome? Quantities are in thousands.',
 ['100 thousand exports; gains from trade fall $125 thousand','100 thousand exports; gains from trade fall $50 thousand','150 thousand exports; gains from trade fall $125 thousand','100 thousand imports; gains from trade rise $125 thousand'],
 'Price falls from 10 to 9. The graph\'s slopes give Qs = 225 and Qd = 125, hence 100 exports. Gains over autarky fall from 0.5 × 3 × 150 = 225 to 0.5 × 2 × 100 = 100 thousand: a 125-thousand decline.',
 'D/C: graph-based counterfactual quantities and welfare comparison.',[proof('exports','225-125',100),proof('gain decline','(10-7)*150/2-(9-7)*100/2',125)])
add('P62D-ITP-L-094',
 'Read the displayed avocado export graph. A producer-funded lump-sum transfer exactly compensates domestic consumers for opening to trade, with no resource costs. Which pair gives the required transfer and the producers\' remaining gain?',
 ['$412.5 thousand transfer; $225 thousand remaining producer gain','$225 thousand transfer; $412.5 thousand remaining producer gain','$637.5 thousand transfer; no producer gain','$412.5 thousand transfer; no national gain because compensation cancels trade'],
 'The price rise is $3. Consumer loss is 0.5 × 3 × (175 + 100) = 412.5 thousand; producer gain is 0.5 × 3 × (175 + 250) = 637.5 thousand. Their difference, 225 thousand, remains after compensation.',
 'D/C: require graph-derived distribution and the residual gain.',[proof('consumer loss','3*(175+100)/2',412.5),proof('producer gain','3*(175+250)/2',637.5),proof('remaining','637.5-412.5',225)])
add('P62D-ITP-L-096',
 'Use the phone-case tariff graph. If the tariff is reduced halfway from its displayed level to zero, with straight curves and world price unchanged, what happens to tariff revenue and total distortion loss?',
 ['Revenue becomes $150 thousand and distortion loss $25 thousand','Revenue becomes $100 thousand and distortion loss $50 thousand','Revenue becomes $200 thousand and distortion loss $50 thousand','Revenue becomes $250 thousand and distortion loss $25 thousand'],
 'The displayed wedge is 2; halving it gives price 5. Qs becomes 75 and Qd 225, so 150 imports pay 1 each. Each quantity distortion is 25 relative to free trade; total DWL is 0.5 × 1 × 50 = 25 thousand.',
 'D/C: compare tariff rates using the graph instead of naming distortions.',[proof('new imports','225-75',150),proof('revenue','1*(225-75)',150),proof('distortion','1*(25+25)/2',25)])
add('P62D-ITP-L-097',
 'Use the phone-case tariff graph. A minister proposes keeping the tariff but returning all its revenue to consumers as lump-sum payments, with no administrative cost. Relative to free trade, what happens to consumers and total national surplus?',
 ['Consumers still lose $250 thousand; national surplus still falls $100 thousand','Consumers lose nothing; national surplus returns to free-trade level','Consumers still lose $450 thousand; national surplus falls $300 thousand','Consumers gain $200 thousand; national surplus rises by the revenue'],
 'The graph implies consumer loss 0.5 × 2 × (250 + 200) = 450 thousand and revenue 2 × (200 - 100) = 200 thousand. The rebate leaves a 250-thousand consumer loss and does not undo either distortion triangle, totaling 100 thousand.',
 'D/C: graph-based rebate, transfers and remaining distortions.',[proof('consumer loss after rebate','2*(250+200)/2-2*(200-100)',250),proof('national loss','2*(50+50)/2',100)])
add('P62D-ITP-L-099',
 'Using the phone-case quota graph, compare free domestic license allocation with a VER giving foreign firms the same rights free. With the same price and quantity and no extra costs, what is the national loss under the VER relative to free trade, and how much is a transfer abroad?',
 ['$375 thousand national loss, including $150 thousand transferred abroad','$225 thousand national loss, including no foreign transfer','$150 thousand national loss, all of it destroyed world surplus','$525 thousand national loss, including two copies of the rent transfer'],
 'The wedge is 6 - 3 = 3; permitted imports are 200 - 150 = 50 thousand. Foreign rent is 150 thousand. Two 75-thousand quantity distortions create 225 thousand of DWL, so the national loss is 375 thousand.',
 'A/D/C: graph-dependent VER accounting with an explicit national/global distinction.',[proof('rents','(6-3)*(200-150)',150),proof('distortion','3*(75+75)/2',225),proof('national loss','150+225',375)])
add('P62D-ITP-L-100',
 'The phone-case quota graph shows free trade and a quota with domestic rights holders. If the import cap is raised from the displayed amount to 100 thousand, with both straight curves and Pw unchanged, which result follows?',
 ['Domestic price $5; rents $200 thousand; distortion loss $100 thousand','Domestic price $6; rents $300 thousand; distortion loss $225 thousand','Domestic price $4; rents $100 thousand; distortion loss $25 thousand','Domestic price $5; rents $100 thousand; distortion loss $200 thousand'],
 'The curves imply Qd = 350 - 25P and Qs = 25P. A gap of 100 requires 350 - 50P = 100, so P = 5. The wedge is 2 and rents 200 thousand. Production rises 50 and consumption falls 50 relative to Pw = 3, giving DWL 100 thousand.',
 'D/C: reconstruct the new quota price and distinguish rent from distortion.',[proof('new price','(350-100)/50',5),proof('rent','(5-3)*100',200),proof('loss','(5-3)*(50+50)/2',100)])

(W/'revisions.json').write_text(json.dumps(R,ensure_ascii=False,indent=2)+'\n','utf-8')
print('Revisions:',len(R))
