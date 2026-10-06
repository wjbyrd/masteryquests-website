from author import *

stem('P75-TRADE-L-027','A two-good model shows that countries can gain from specialization and trade. Which claim about what happens next cannot be established from that model alone?')
stem('P75-TRADE-M-012','Two workshops each give up exactly 3 frames to produce one desk. Which workshop has a comparative advantage in desks?')
stem('P75-TRADE-H-009','Ava gives up 2 sacks to produce one crate; Ben gives up 5 sacks. If the terms of trade are exactly 2 sacks per crate, who gains from exchanging a crate?')
for id in ['P75-TRADE-H-010','P75-TRADE-L-014','P75-TRADE-L-007']:
    stem(id,re.sub(r' Exclude (?:prices at which either producer only breaks even|break-even prices)\.$','',B[id]['q']['q']),'Remove the redundant final sentence as requested; the question still requires both parties to be better off.')
stem('P75-TRADE-L-019','Alpha gives up 2 kits to make a machine, while Beta gives up 6. Both could trade at either 3 or 5 kits per machine. How would changing the terms of trade from 3 to 5 kits per machine affect their gains?')
stem('P75-TRADE-L-020','You know how much a producer makes after specializing and the rate at which it can trade. Can you calculate its consumption gain without knowing what it consumed before trade?')
stem('P75-TRADE-L-021','As producers specialize further, their opportunity costs rise. What does this imply about how much specialization is needed to gain from trade?')
for id,mapping in {'P75-TRADE-EL-005':{'A':'Arden','B':'Bellora'},'P75-TRADE-EL-006':{'C':'Caspia','D':'Demer'},'P75-TRADE-L-010':{'X':'Estara','Y':'Fenn'},'P75-TRADE-MB-004':{'A':'Arden','B':'Bellora'},'P75-TRADE-FB-005':{'A':'Arden','B':'Bellora'}}.items():
    def names(s): return re.sub(r'\b('+ '|'.join(mapping)+r')\b',lambda m:mapping[m[0]],s)
    q=B[id]['q']; edit(id,'Use fictional country names consistently in stem, choices and feedback; quantities and calculations unchanged.',q=names(q['q']),options=[names(s) for s in q['options']],feedback=names(q['feedback']))
stem('P75-TRADE-L-008','After specializing, a workshop produces 30 panels and no motors. Before specializing, it consumed 16 panels and 3 motors. It can exchange 3 panels for one motor. Which trade would leave it with more panels and more motors than before?')
id='P75-TRADE-L-013'; q=B[id]['q']; edit(id,'Clarify the claim and italicize the unknown consistently.',q='With constant opportunity costs, Ridge can produce 24 maps or 12 models. Vale can produce 18 maps or <i>m</i> models. Ridge exports models for 1.5 maps each. Is there a positive value of <i>m</i> that would allow both producers to gain from this trade?',options=[re.sub(r'\bm\b','<i>m</i>',s) for s in q['options']])
replace('P75-TRADE-LB-007','Orchid produces 36 flowers and Reed produces 18 baskets after specializing. Before trade, Orchid consumed 18 flowers and 4 baskets; Reed consumed 9 flowers and 9 baskets. They exchange 12 flowers for 6 baskets. Shipping by road uses 1 of Orchid’s received baskets; shipping by air uses 3. No flowers are lost, and Reed pays no shipping cost. Which method leaves each producer with more of both goods than before trade?', ['Both methods; Orchid keeps 5 baskets by road and 7 by air.','Air only; Orchid keeps 3 baskets by road and 5 by air.','Road only; Orchid keeps 5 baskets by road and 3 by air.','Neither method; Orchid keeps 3 baskets by road and 1 by air.'],2,'Before shipping costs, Orchid has 24 flowers and 6 baskets, and Reed has 12 flowers and 12 baskets. Road shipping leaves Orchid 5 baskets, above its original 4; air shipping leaves only 3. Reed gains in both goods under either method.','Replace anonymous carrier labels with two clear shipping methods and retain the full before/after comparison.')
for id,text in {'P52B-TRADE-R-003':'Specialization creates gains that exchange can share.','P52B-TRADE-H-004':'Transport costs can outweigh the production gains.','P52B-TRADE-L-005':'Gross gains of 20 become a net loss of 5.','P52B-TRADE-L-006':'Imports save 2 units of wheat per ton of steel.','P52B-TRADE-M-002':'Eli; his cost is 2 pages per graphic, versus Nora’s 4.','P52B-TRADE-L-002':'Typing displaces more valuable surgical work.'}.items(): key(id,text)
stem('P52B-TRADE-BR-001','A project lead completes every task faster than an assistant but delegates data entry to focus on other work. Which economic principle can explain that decision?')
difficulty('P52B-TRADE-BR-001','medium')
stem('P52B-TRADE-BR-002','A city can buy snowplow service from a neighboring county for less than the resources required to provide it internally. How could the city benefit from contracting for the service?')
stem('P52B-TRADE-EL-002','Two producers have identical opportunity costs for both goods. Can specialization based on comparative advantage alone increase their combined output?')
stem('P52B-TRADE-EL-003','A trading price exactly equals the exporter’s opportunity cost and is below the importer’s opportunity cost. How are the gains from this trade divided?')
stem('42796','Distribution A’s Lorenz curve lies everywhere above distribution B’s and below the line of equality. Which distribution has less relative inequality?')
stem('42797','Two distributions are compared using Lorenz curves. Curve A lies everywhere closer to the line of equality than curve B. What does this show about relative inequality?')
edit('42795','Remove the answer-length cue while preserving the distinction between relative inequality and income levels.',options=['A has less inequality, so every household in A must be richer.','B has less inequality because its mean income is higher.','Both have equal inequality because both curves end at 100%.','A has less inequality; the curves alone do not establish higher incomes.'])
stem('42328','Refer to the graph. Which wage and number of workers describe equilibrium in the warehouse labor market?')
replace('42383','Refer to the graph. What is the equilibrium wage after labor demand and supply both increase, and what can be concluded about other markets with these two shifts?', ['$25; the wage effects offset here, but need not offset in other markets.','$20; the wage must be unchanged whenever both curves shift right.','$25; the wage must be unchanged whenever both curves shift right.','$20; the wage effects offset here, but need not offset in other markets.'],3,B['42383']['q']['feedback'],'Ask directly for the wage and limit the generalization to the evidence in the graph.')
stem('42702','A consumer spends all income on X and Y. At the current bundle, the consumer is willing to give up fewer units of Y for another unit of X than the market requires. With smooth preferences, which small change along the budget line would raise utility?')
stem('42707','A consumer has income $12, Px = $2 and Py = $1. Preferences are U = XY for positive quantities, so MRS = Y/X. Which affordable bundle maximizes utility?')
key('42706','The same bundle remains optimal; the budget set and preferences are unchanged.')
stem('P62C-CPS-R-006','Why is the area below the market price not part of consumer surplus?')
stem('P62C-CPS-EL-014','Why can’t consumer surplus for a step-shaped demand curve generally be calculated as one-half × base × height?')
for id,text in {
'P62C-CPS-M-011':'Refer to the graph. What is total surplus at equilibrium?',
'P62C-CPS-M-012':'Refer to the graph. What is consumer surplus at equilibrium?',
'P62C-CPS-M-013':'Refer to the graph. What is producer surplus at equilibrium?',
'P62C-CPS-M-014':'Refer to the graph. What is total surplus at equilibrium?',
'P62C-CPS-H-006':'Refer to the graph. Which expression correctly calculates producer surplus?',
'P62C-CPS-L-019':'Refer to the graph. What share of total surplus goes to consumers at equilibrium?',
'P62C-CPS-L-023':'Refer to the graph. What is total surplus at equilibrium?',
'P62C-CPS-C-019':'Refer to the graph. What amount represents consumer spending?',
'P62C-CPS-C-020':'Refer to the graph. What is the height of the triangle used to calculate consumer surplus?',
'P62C-CPS-C-026':'Refer to the graph. What fraction of total surplus is consumer surplus?',
'P62C-CPS-B1-015':'Refer to the graph. What is the height of the triangle used to calculate consumer surplus?',
'P62C-CPS-B1-016':'Refer to the graph. What is the height of the triangle used to calculate producer surplus?',
}.items(): stem(id,text)
for id in ['PMA-CPS-M-026','PMA-CPS-M-027']:
    stem(id,re.sub(r'\bWTA\b','willingness to accept',re.sub(r'\bWTP\b','willingness to pay',B[id]['q']['q'])),'Spell out the faculty-identified abbreviations.')
key('P62C-CPS-M-015','The $16 buyer')
key('P62C-CPS-M-016','The $13 seller')
id='P62C-CPS-L-029'; edit(id,'Retain the economic cost comparison and replace the awkward restriction reference with the displayed output.',options=[s.replace(' at the restriction',' at the displayed output') for s in B[id]['q']['options']])

if __name__=='__main__': save()
