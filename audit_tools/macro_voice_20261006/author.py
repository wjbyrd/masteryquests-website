import json,re
from pathlib import Path
H=Path(__file__).resolve().parent
records={r['id']:r for r in json.loads((H/'records.json').read_text(encoding='utf-8'))}
patches={}
def edit(id,pattern,rationale,**fields):
 r=records[id];assert 'macro' in r['areas'] and 'micro' not in r['areas'] and not r['marketGateDerived'],id
 p=patches.setdefault(id,{'patterns':[],'rationales':[]})
 if pattern not in p['patterns']:p['patterns'].append(pattern)
 if rationale not in p['rationales']:p['rationales'].append(rationale)
 for k,v in fields.items():assert k in ('q','options','feedback');p[k]=v
def current(id,field):return patches.get(id,{}).get(field,records[id]['q'].get(field,''))
def replace(id,pattern,rationale,field,old,new):
 v=current(id,field)
 if isinstance(v,list):assert any(old in s for s in v),(id,old);v=[s.replace(old,new) for s in v]
 else:assert old in v,(id,old);v=v.replace(old,new)
 edit(id,pattern,rationale,**{field:v})

# Read in full against the existing answer alternatives; retain the stated
# quotation and the upward-sloping-supply assumption of this FX family.
fx={
'PMOE-FX-E-006':'In the market for U.S. dollars, demand increases while supply is unchanged. Demand slopes downward and supply slopes upward. With the exchange rate measured in foreign currency per dollar, the equilibrium exchange rate:',
'PMOE-FX-H-005':'In the market for U.S. dollars, demand and supply both increase. Demand slopes downward and supply slopes upward, and the exchange rate is measured in foreign currency per dollar. Without information about the relative size of the shifts, what can be determined?',
'PMOE-FX-H-006':'In the market for U.S. dollars, demand decreases while supply increases. Demand slopes downward and supply slopes upward, and the exchange rate is measured in foreign currency per dollar. What can be determined about the exchange rate and the quantity of dollars exchanged?',
'PMOE-FX-EL-001':'Demand and supply both decrease in the market for U.S. dollars, where demand slopes downward and supply slopes upward. Fewer dollars are exchanged, but the new exchange rate, measured in foreign currency per dollar, is unknown. What additional information would establish whether the dollar appreciated?',
'PMOE-FX-L-001':'Foreign demand for U.S. exports increases, while a lower U.S. real interest rate raises net capital outflow. In the market for U.S. dollars, demand slopes downward and supply slopes upward. Measuring the exchange rate in foreign currency per dollar, what happens to the exchange rate and the quantity of dollars exchanged?',
'PMOE-FX-L-004':'Foreign demand for U.S. goods increases while U.S. purchases of foreign assets decrease. In the market for dollars, demand slopes downward and supply slopes upward, with the exchange rate measured in foreign currency per dollar. Despite the decrease in supply, more dollars are exchanged. What does this imply about the dollar’s value and the relative size of the two shifts?',
'PMOE-FX-B3-002':'In the market for U.S. dollars, demand and supply both decrease. Demand slopes downward and supply slopes upward. Why is the change in the exchange rate, measured in foreign currency per dollar, uncertain?',
'PMOE-FX-LB-002':'In the market for U.S. dollars, demand slopes downward and supply slopes upward. At the original exchange rate, stronger export demand increases dollars demanded by 70 units, while greater foreign-asset purchases increase dollars supplied by 45 units. What happens to the equilibrium exchange rate, measured in foreign currency per dollar, and the quantity exchanged? Are these shift amounts enough to calculate the exact changes?'
}
for id,q in fx.items():edit(id,'implied visual','Replace an instruction to use an unattached dollar-market visual with a self-contained market scenario; preserve curve assumptions and exchange-rate direction.',q=q)
edit('PMOE-FX-L-004','model jargon','Express the comparison at the original quantity in ordinary willingness-to-pay and willingness-to-sell terms.',options=[
'The dollar depreciates; rising quantity shows that the decrease in supply was larger.',
'The dollar appreciates; rising quantity proves that the supply of dollars actually increased.',
'The dollar appreciates; at the original quantity, demanders’ willingness to pay rose more than suppliers’ required exchange rate.',
'The exchange-rate change remains uncertain; quantity information cannot help compare the shifts.'
],feedback='Higher demand and lower supply both raise the foreign-currency price of a dollar. At the original quantity, the increase in demanders’ willingness to pay must exceed the increase in the exchange rate suppliers require for the new equilibrium quantity to be higher.')
edit('PMOE-FX-B3-002','implied visual','Remove a remaining vertical-axis reference from the text-only explanation.',feedback='Lower demand reduces the exchange rate, while lower supply raises it. The relative size of these opposing effects determines the net change.')
edit('PMOE-FX-LB-002','notation-first','Use the economic variable name throughout the text-only answer choices.',options=[re.sub(r'^the','The',re.sub(r'\be\b','the exchange rate',s)) for s in current('PMOE-FX-LB-002','options')])
edit('PMOE-FX-LB-002','model jargon','Explain excess demand and the information needed for exact changes directly.',feedback='At the original exchange rate, excess demand is 70 − 45 = 25 units, so the exchange rate rises. Both increases raise the equilibrium quantity of dollars exchanged. The exact changes depend on the slopes of demand and supply.')
edit('PMOE-FX-L-006','audit wrapper','Keep the graph-reading and intermediate-equilibrium task; remove documentation about the asset from the explanation.',feedback='D1 intersects S0 at approximately 150 units and an exchange rate of 1.2, compared with 100 units and 1.0 at A. At the final equilibrium B, quantity is 200 and the exchange rate is 1.0. The exchange rate first rises about 20 percent and then returns to its initial value, while the final quantity is twice its initial level.')

edit('PMOE-NER-E-004','reciprocal quotation','Ask the currency conversion directly, preserving 1/2 and all choices.',q='If the exchange rate is $2 per pound, how many pounds can one dollar buy?',feedback='At $2 per pound, one dollar buys 1 ÷ 2 = 0.50 pound.')
edit('PMOE-NER-B2-002','reciprocal quotation','Ask for domestic currency bought with one unit of foreign currency.',q='If 4 units of domestic currency can buy 5 units of foreign currency, how many units of domestic currency can one unit of foreign currency buy?',feedback='Divide 4 domestic currency units by 5 foreign currency units: one unit of foreign currency buys 0.80 unit of domestic currency.')
edit('PMOE-NER-B3-003','reciprocal quotation','Name the currency being valued rather than asking for reciprocal terms.',q='The dollar appreciates 25 percent, from 0.80 euro per dollar to 1.00 euro per dollar. By what percentage does the euro’s dollar value fall?',feedback='One euro initially buys $1.25 and later buys $1.00. The decrease is $0.25 ÷ $1.25 = 20 percent.')
replace('PMOE-NER-H-001','reciprocal quotation','Make the distractor’s currency units explicit.','options','The reciprocal rate also rises 10 percent','The number of euros one dollar buys also rises 10 percent')
edit('PMOE-NER-B3-002','reciprocal quotation','Preserve the three linked percentage comparisons while naming both currencies’ purchasing power.',q='The exchange rate rises from 1.60 to 1.84 units of foreign currency per unit of domestic currency. A domestic exporter keeps its domestic-currency price fixed. By what percentages do the two currencies’ values change relative to each other, and how does the exporter’s price change for foreign buyers?',options=[
'The domestic currency appreciates 15%; the foreign currency depreciates about 13.0%, and the exporter’s foreign-currency price rises 15%.',
'The domestic currency appreciates 15%; the foreign currency depreciates exactly 15%, and the exporter’s foreign-currency price falls 15%.',
'The domestic currency depreciates about 13.0%; the foreign currency appreciates 15%, and the exporter’s foreign-currency price falls 13.0%.',
'The domestic currency appreciates about 13.0%; the foreign currency depreciates 15%, and the exporter’s foreign-currency price is unchanged.'
],feedback='The domestic currency appreciates by 1.84/1.60 − 1 = 15%. The foreign currency’s domestic-currency value changes by 1.60/1.84 − 1 ≈ −13.04%. Multiplying the exporter’s fixed domestic price by the new exchange rate makes its price to foreign buyers 15% higher.')

# Ambiguous nominal/real rate expressions occur in exchange-rate families.
# Explicit ID lists restrict the terminology repair to reviewed records.
rate_ids=['PMOE-NER-BR-001','PMOE-RER-M-002','PMOE-RER-M-005','PMOE-RER-H-001','PMOE-RER-H-002','PMOE-RER-L-005','PMOE-RER-EL-001','PMOE-RER-L-001','PMOE-RER-B1-002','PMOE-RER-B3-001','PMOE-RER-B3-002','PMOE-RER-LB-001','PMOE-RER-LB-002','PMOE-RER-M-004']
for id in rate_ids:
 for field in ['q','options','feedback']:
  v=current(id,field)
  def expand(s):
   s=re.sub(r'\bnominal and real rates\b','nominal and real exchange rates',s)
   s=re.sub(r'\b(nominal|real) rate\b',r'\1 exchange rate',s)
   return re.sub(r'\breal-rate growth\b','real exchange-rate growth',s)
  new=[expand(s) for s in v] if isinstance(v,list) else expand(v)
  if new!=v:edit(id,'ambiguous exchange rate','Specify exchange rate rather than the potentially ambiguous nominal or real rate.',**{field:new})
edit('PMOE-RER-B3-001','audit wrapper','Follow the direct approximate-change family structure; preserve the competitiveness interpretation and arithmetic.',q='Use ε = eP/P*, where e is foreign currency per domestic currency, P is the domestic price level and P* is the foreign price level. The nominal exchange rate falls 4%, domestic inflation is 7%, and foreign inflation is 2%. Approximately how does the real exchange rate change, and what happens to the relative price of domestic goods?')
edit('PMOE-RER-B2-001','notation-first','Introduce the currency conversion in ordinary language before the formula.',q='A domestic basket costs 160 units of domestic currency, and a comparable foreign basket costs 100 units of foreign currency. One unit of domestic currency buys 0.5 unit of foreign currency. Using ε = eP/P*, where e is foreign currency per domestic currency and P and P* are the two basket prices, what is the real exchange rate?')
edit('PMOE-RER-B3-002','ambiguous exchange rate','State the quotation convention explicitly so the direction of the nominal exchange-rate change is clear.',q='Quote the exchange rate as foreign currency per unit of domestic currency. The real exchange rate is unchanged while domestic inflation is 6 percent and foreign inflation is 2 percent. What does relative PPP imply for the nominal exchange rate?')
edit('PMOE-RER-LB-001','notation-first','Retain the intentional exact two-period calculation but name the economic variables.',q='The real exchange rate is initially 1. Use ε = eP/P*, where e is foreign currency per domestic currency, P is the domestic price level and P* is the foreign price level. In year one, the nominal exchange rate rises 12 percent, domestic prices fall 3 percent and foreign prices rise 4 percent. In year two, both price levels are fixed. What year-two change in the nominal exchange rate restores the initial real exchange rate?')

for id in ['PMOE-POL-H-002','PMOE-POL-B2-002']:
 field='q';v=current(id,field)
 v=v.replace('the textbook open-economy model','the standard long-run open-economy model').replace('the textbook model','the standard long-run open-economy model')
 edit(id,'textbook model','Name the long-run open-economy framework used by the saving-investment and exchange-rate argument.',q=v)
edit('PMOE-POL-B2-002','textbook model','Use the faculty-supplied direct construction for the quota task.',q='In the standard long-run open-economy model, why doesn’t an import quota necessarily increase net exports?')
edit('PMOE-POL-M-001','textbook model','Name the applicable model instead of attributing the mechanism to a textbook.',q='In the standard long-run open-economy model, which change follows first from a larger budget deficit?')
for id in ['PMOE-NCO-BR-001','PMOE-POL-H-001','PMOE-POL-L-002','PMOE-POL-B3-001','PMOE-POL-B3-002']:
 for field in ['q','options','feedback']:
  v=current(id,field)
  def expand(s):return s.replace('Final vertical FX supply','The final supply of domestic currency').replace('FX supply','the supply of domestic currency').replace('the supply of domestic currency shifts','the supply of domestic currency in the foreign-exchange market shifts')
  new=[expand(s) for s in v] if isinstance(v,list) else expand(v)
  if new!=v:edit(id,'model jargon','Spell out the foreign-exchange supply mechanism in ordinary economic language.',**{field:new})
edit('PMOE-POL-LB-001','model jargon','Ask for the saving change and supply of dollars directly, retaining both linked tasks.',q='A fiscal change reduces U.S. public saving by $80 billion. Private saving rises by an unknown amount, real interest rates rise, domestic investment falls $30 billion, and net exports fall $35 billion. How much must private saving have increased, and what happens to the supply of dollars in the foreign-exchange market?',options=[
'Private saving rises $45 billion; the supply of dollars falls $80 billion.',
'Private saving falls $15 billion; the supply of dollars rises $35 billion.',
'Private saving rises $15 billion; the supply of dollars falls $35 billion.',
'Private saving rises $115 billion; the supply of dollars is unchanged.'
],feedback='Let p be the increase in private saving. Since NX = NCO = S − I, −35 = (p − 80) − (−30) = p − 50, so p = 15. National saving falls $65 billion while investment falls $30 billion. NCO therefore falls $35 billion, reducing the supply of dollars by that amount.')
edit('PMOE-TX-L-005','model jargon','Replace reconciliation terminology with the actual private-saving and trade-balance questions.',q='A deficit lowers public saving $74 billion. Private saving rises by an unknown amount, domestic investment falls $22 billion, and net exports fall $31 billion. How much does private saving rise, and why is the decline in net exports smaller than the increase in the deficit?')
replace('PMOE-NCO-LB-001','model jargon','Ask for the asset-purchase amount directly.','q','What later outward purchases reconcile the accounts, and does the country still receive a net inflow?','What is the later value of outward asset purchases, and does the country still receive a net capital inflow?')
replace('PMOE-POL-L-003','model jargon','Retain the intentional consistency test while simplifying its calculation clause.','q','What rebound in other imports reconciles the accounts,','How much must other imports rise to leave net exports unchanged,')
edit('PMOE-TX-L-001','audit wrapper','Ask directly for GDP and saving changes; imported components still require separate accounting.',q='In one period, consumption rises $96 billion, including $72 billion of imports. Measured investment rises $35 billion, including $11 billion of imported equipment. Exports rise $18 billion, while government purchases and other imports are unchanged. How do GDP and national saving change?')
edit('PMOE-NCO-B3-001','audit wrapper','Remove the redundant incorrect report from an asset-flow calculation.',q='A country has net capital outflow of −$120 billion, and residents purchase $200 billion of foreign assets. How much do foreigners purchase in domestic assets, and does NX = NCO imply a trade surplus or deficit?')

# Straight calculation and interpretation families, individually reviewed.
for id in ['ECON-NL-EASYBOSS-2018','ECON-NL-EASYBOSS-2022','P52A-CPI-B2-002','ECON-EC-FINALBOSS-19000']:
 replace(id,'audit wrapper','The question asks for CPI and inflation; the invented report contributes no needed data.','q',' A report treats the increase in CPI index points as the inflation rate.','')
for id in ['ECON-NL-EASYBOSS-2021','P52A-CPI-B2-001','P52A-CPI-B3-002','ECON-EC-MEDIUMBOSS-18003']:
 replace(id,'audit wrapper','Ask directly about nominal pay and purchasing power.','q','A report says higher pay alone establishes a real gain. Which correction follows?','By what percentages do nominal pay and real pay change?')
edit('P52A-CPI-M-002','audit wrapper','Ask for the inflation calculation and its correct base directly.',q='A price index rises from 175 to 189. What is the inflation rate, and how is it calculated?')
edit('43072','audit wrapper','Ask for budget components without an invented accounting error.',q='The government receives $180 in taxes, pays $30 in transfers and purchases $150 of current output. Define net taxes as taxes minus transfers. What are net taxes, government purchases and public saving?')
for id in ['ECON-NL-EASYBOSS-2029','PM2B2-DEF-FB-006','PM2B2-DEF-MB-003','ECON-EC-FINALBOSS-19007']:
 replace(id,'audit wrapper','Remove the unnecessary analyst from the two-index application.','q','while an analyst must convert nominal domestic GDP into real output','while nominal domestic GDP must be converted into real output')
edit('43118','audit wrapper','Ask directly about the difference between the two debt measures.',q='Debt held by the public is $25 trillion, and total public debt outstanding is $32 trillion. What accounts for the difference?')
edit('43139','audit wrapper','Name the requested ratio directly instead of describing a report.',q='GDP is $30 trillion, debt held by the public is $30.3 trillion, and gross federal debt is $36 trillion. What is the ratio of debt held by the public to GDP?')
edit('43082','audit wrapper','Ask the stock-flow distinction directly.',q='Government debt is $25 trillion, while the year’s deficit is $1 trillion. Why are these figures not contradictory?')
replace('43088','audit wrapper','Keep the two-year stock-flow calculation and ask it directly.','q','An analyst calls the $260 ending debt the second-year deficit. What second-year deficit and correction follow?','What is the second-year deficit, and how is it calculated?')
replace('43157','audit wrapper','Use an ordinary interpretation question for the primary budget balance.','q','Which diagnosis follows?','What is the primary balance?')
edit('ECON-SP-FINALBOSS-4023','audit wrapper','Remove an unnecessary incorrect forecast while preserving the quantity-equation and Fisher calculations.',q='Use the growth-rate approximation to MV = PY. Money grows 10%, real output grows 3%, inflation is 4%, and the real interest rate is 2%. If expected inflation equals actual inflation, what are velocity growth and the nominal interest rate?')
replace('ECON-SP-MEDIUMBOSS-3005','audit wrapper','Ask directly for real output after the nominal and price changes.','q','A report calls this a real expansion because total dollar spending increased. What actually happened to real GDP?','What happened to real GDP?')
replace('ECON-SP-FINALBOSS-4016','textbook model','Name the simplified banking framework while preserving its reserve-retention assumptions.','q','In a textbook banking model','In the simple deposit-expansion model')

replace('ECON-SP-EASYBOSS-2011','textbook model','Name the simple deposit-expansion model and retain all of its stated assumptions.','q','In a textbook system with multiplier 5','In a simple deposit-expansion model with multiplier 5')
edit('PM2A-DIS-EB-014','audit wrapper','Ask directly how the two inflation rates affect the price level.',q='Inflation falls from 8% to 3%, and later to −1%. How does the price level change at 3% inflation and at −1% inflation?')
edit('ECON-NL-LEGENDARY-9000','audit wrapper','Ask for investment and the treatment of inventories without a report or reconciliation wrapper.',q='An economy has consumption of $46 billion, government purchases of $13 billion, exports of $9 billion, imports of $11 billion and GDP of $72 billion. Inventories increase by $4 billion because of newly produced unsold goods. What is total investment, and how are inventories included?',feedback='The expenditure identity gives I = 72 − 46 − 13 − 9 + 11 = 15. Inventory investment is included in this $15 billion total, leaving $11 billion in other investment.')
for id in ['ECON-EC-EASYBOSS-17020','ECON-NL-EASYBOSS-2010','PM2B1-GDPC-FB-005']:
 edit(id,'audit wrapper','Ask for investment and net exports directly, preserving all data and choices.',q=current(id,'q').split(' An analyst')[0]+' What are investment and net exports?')
replace('ECON-NL-LEGENDARY-9011','audit wrapper','Ask directly for the contribution of the resale service and new inventory to GDP.','q','An analyst counts only the $40,000 resale as this year’s GDP. What is the corrected contribution?','How much do these activities contribute to this year’s GDP?')
for id in ['ECON-EC-EASYBOSS-17004','ECON-NL-EASYBOSS-2000','P52B-S3-GDPM-B3-003']:
 replace(id,'audit wrapper','Ask for GDP and its relationship to value added directly.','q','An accountant adds all three sales to GDP. Which correction reconciles expenditure with value added?','What is the contribution to GDP, and how does it compare with the sum of value added?')
for id in ['ECON-EC-EASYBOSS-17010','ECON-NL-EASYBOSS-2002','P52B-S3-GDPM-B2-001']:
 replace(id,'audit wrapper','Ask directly about current production and the later inventory sale.','q','A report uses sales alone and says GDP will rise when the inventory is sold next year without new production. Which correction is valid?','How much is counted in current GDP, and what happens to GDP when the remaining inventory is sold next year without new production?')
for id in ['ECON-EC-EASYBOSS-17017','PM2B1-GDPL-FB-004','PM2B1-GDPL-MB-001']:
 replace(id,'audit wrapper','Ask directly what the output and omitted welfare evidence establish.','q','An analyst calls the GDP increase a complete measure of the welfare gain. Which assessment is justified?','What can be concluded about output per person and well-being?')
replace('ECON-SP-LEGENDARY-9016','textbook model','Refer directly to the liquidity-preference model.','q','the textbook liquidity-preference model','the liquidity-preference model')
for id in ['LG-Q-2012','PM2C1-MCL-FB-006','LG-Q-9106']:
 replace(id,'notation-first','Spell out the reserve ratio before asking about the shortfall from the model’s maximum.','q','A simplified rr=10% model','A simple deposit-expansion model with a 10% required reserve ratio')
replace('ECON-SP-LIMITS-OF-MONETARY-CONTROL-6008','audit wrapper','Ask about the expected deposit creation without introducing an analyst.','q','what should an analyst forecast?','how much deposit creation would you expect?')
for id in ['ECON-SP-LEGENDARY-9052','ECON-SP-MONETARY-POLICY-TRANSMISSION-6031','LG-B-6019','LG-B-6020']:
 replace(id,'textbook model','Name the scarce-reserves framework itself.','q','scarce-reserves textbook model','scarce-reserves model')
replace('ECON-SP-LEGENDARY-9052','textbook model','Keep the short-run model qualification in the feedback.','feedback','In this textbook model','In this scarce-reserves model')
for id in ['P52B-S3-MFM-B2-002','P52B-S3-MFM-B3-003']:
 q=current(id,'q').replace('A report lists','An economy has').split(' It adds savings')[0]
 edit(id,'audit wrapper','Ask for the monetary aggregates directly; retain the current-definition convention and all component values.',q=q+' Using current U.S. definitions, what are M1 and M2?')
replace('PM2B3-PROD-EB-002','audit wrapper','Ask directly for output growth when employment is fixed.','q','A report says total output must also have doubled. Which correction is appropriate?','By approximately what percentage does total output rise?')
replace('LG-R-5040','implied visual','Ask conceptually about the money-demand curve without referring to an unattached diagram.','q','What happens to money demand in the standard diagram?','What happens to the money-demand curve?')
for id in ['LG-Q-3001','P52B-S4-QTM-B1-003']:
 edit(id,'audit wrapper','Ask directly for real output and the meaning of nominal spending.',q=current(id,'q').split(' A report')[0]+' Using MV = PY, what is real output, and how does it differ from nominal spending?')
edit('P52B-S4-QTM-B3-001','audit wrapper','Ask the implied price-level change directly.',q='Nominal spending rises 10% while real output rises 10%. According to MV = PY, how does the price level change?')
replace('ECON-NL-ELITE-315','audit wrapper','Ask directly for the price change and real production change.','q','A report calls the full nominal increase output growth. What price change and correction follow?','What happens to the GDP deflator, and by how much does real production rise?')
replace('ECON-NL-LEGENDARY-9007','audit wrapper','Retain the inverse quantity calculation and ask for nominal GDP directly.','q','A report calls $2,400 current nominal GDP. What is the correct nominal total and source of the difference?','What is current nominal GDP, and why does it differ from real GDP?')
for id in ['ECON-NL-EASYBOSS-2012','PM2B1-RNGDP-FB-004','PM2B1-RNGDP-MB-002']:
 replace(id,'audit wrapper','Ask for real GDP and its valuation directly.','q','A report values current output at current prices and calls the result real GDP. Which correction and interpretation are right?','What is real GDP, and how does its valuation differ from nominal GDP?')
for id in ['ECON-SP-MEDIUMBOSS-3012','PM2A-SAC-EB-018']:
 replace(id,'audit wrapper','Ask for the sacrifice ratio and correct denominator directly.','q','An analyst divides by final inflation. Which correction is right?','What is the sacrifice ratio, and which inflation change belongs in the denominator?')
replace('ECON-NL-MEDIUMBOSS-3019','audit wrapper','Remove the unnecessary analyst attribution before the causal and productivity comparison.','q',' An analyst attributes A’s gain to capital deepening.','')
replace('ECON-NL-MEDIUMBOSS-3024','audit wrapper','Ask directly for the productivity change.','q','A report calls this a 20% productivity improvement. What correction follows?','By what percentage does output per hour change?')
replace('PM2B3-SRC-FB-005','audit wrapper','Ask directly for the output comparison after productivity and hours change.','q','A report predicts A must have the larger total output because its productivity gain is larger. Which comparison is correct?','How does total output compare between the two plants?')
replace('ECON-NL-LEGENDARY-9081','audit wrapper','Present the labor-market observations directly.','q','A report says unemployment fell','Unemployment fell')
for id in ['ECON-NL-FINALBOSS-4004','P52B-S4-UNEM-B1-001','ECON-EC-FINALBOSS-19022','ECON-EC-MEDIUMBOSS-18010']:
 replace(id,'audit wrapper','Ask for the two official labor-market rates directly, retaining the active-search distinction.','q','A report counts all jobless people as unemployed. How should the unemployment rate and labor-force participation rate be calculated instead?','What are the unemployment rate and labor-force participation rate?')

def finish():
 for id,p in patches.items():
  for f in ['q','options','feedback']:
   if f in p and p[f]==records[id]['q'].get(f):del p[f]
  assert any(f in p for f in ['q','options','feedback']),id
 (H/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Reviewed editorial patches:',len(patches))
if __name__=='__main__':finish()
