from review_tools import *
d=load()
for g in range(83,106):review(d,g,'Read every current stem/options/feedback. Retain monopoly marginal choice, profit, regulatory cost recovery, cartel incentive and Nash constructs. Legacy coordinate ranges and colliding labels need repair or remapping. Complex cartel deviations and policy/game changes retain higher-tier synthesis.')
visual(d,range(83,103),'Viewed contact sheets. New MON prices/quantities are readable except crowded MON-04 ticks. Legacy mon_core and mon_loss/welfare/zero labels collide with axes or float away from curves; repair or replace. Kinked curves have explicit kink and MR-gap values.')
for g in [86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]:
    d['assets'][INDEX[g]['asset']]['repairRequired']=True
    d['assets'][INDEX[g]['asset']]['issue']=('Replace legacy graph reference with a clean question-appropriate MON-family asset, preserving the skill; document numerical changes.' if 87<=g<=90 else 'Separate curve labels and guides; label values needed for arithmetic. Inspect every shared user before modifying the common asset.')
for id in ['P62G-MON-EL-032','P62G-MON-EL-034','P62G-MON-EL-037','P62G-MON-EL-039','P62G-MON-EL-040']:
    patch(d,id,tier='hard')
patch(d,'P62G-MON-EL-031','Fixed cost rises by $360 while demand, MR and MC stay unchanged. The firm remains active. What is its new profit, and should it change its output or price?')
patch(d,'P62G-MON-H-032','A manager proposes expanding to the demand–MC intersection. What output maximizes monopoly profit, and would the proposed expansion raise or lower profit?')
patch(d,'P62G-MON-H-034','Find the monopoly price and quantity, then the allocatively efficient price and quantity. Which marginal comparisons determine these two outcomes?')
patch(d,'P62G-MON-EL-033','A fixed-cost reduction lowers ATC at the current profit-maximizing output to $35. Demand, MR and MC stay unchanged. What is the new profit, and should the firm change output?',tier='hard')
patch(d,'P62G-MON-H-036','A manager proposes expanding to the demand–MC intersection. What output maximizes monopoly profit, and would the proposed expansion raise or lower profit?')
patch(d,'P62G-MON-L-093','Assume variable costs are covered at the firm\u2019s optimum. Find the profit-maximizing output and economic profit or loss. Explain how to choose output and price, and how the efficient-output benchmark differs.',tier='elite')
patch(d,'P62G-MON-M-037','At the profit-maximizing output, what price does the monopolist charge? Why is this price different from marginal revenue?',options=[
'$27; the price is read from demand, and extra sales require a lower price on earlier units.',
'$40; the price is read from demand, and extra sales require a lower price on earlier units.',
'$20; the MR = MC intersection gives both the selling price and the revenue from an extra unit.',
'$45; the firm sets price equal to ATC to recover its cost per unit.'],correct_index=1,
feedback='MR = MC selects Q = 40. Demand at that quantity gives a price of $40, while MR is $20. Selling an additional unit at a single price requires lowering the price on earlier units, so the extra revenue is less than the selling price.',reason='Replaced a common-value lookup with monopoly output selection, price from demand and the price effect on marginal revenue; Medium application now requires the graph and economic reasoning.')
patch(d,'P62G-MON-B3-057','Find the unregulated monopoly price and quantity, then the allocatively efficient price and quantity. Which marginal comparisons determine them?')
patch(d,'P62G-MON-EL-036','Under marginal-cost pricing, what price would the regulator set? At that price and quantity, would the firm cover total cost?',tier='hard')
patch(d,'P62G-MON-EL-037','A regulator proposes moving from the monopoly outcome to the demand–MC intersection. What are the price and quantity before and after the change, and how do the two decision rules differ?')
patch(d,'P62G-MON-H-041','Compare serving the quantity at the demand–MC intersection with one firm versus two identical firms that each serve half. Given the long-run average cost curve shown, which arrangement has the lower total cost, and why?',options=[
'One firm; average cost falls as output rises from half of market demand to the full amount.',
'Two firms; average cost rises as each firm expands from half of market demand to the full amount.',
'One firm; average cost rises as output expands, so concentrating production lowers cost.',
'Two firms; splitting production lowers average cost along the declining portion of LRAC.'],
image='question-assets/monopoly/MON-03-long-run.webp',
feedback='Demand meets MC at Q = 90. One firm can supply 90 at a lower average cost than either of two firms supplying 45 each. In the stated long-run model, each active firm incurs the same setup cost; splitting output duplicates it. This falling LRAC over the relevant market range supports natural monopoly. A short-run ATC curve alone would not establish that conclusion.',
reason='Use an explicit long-run variant generated from TC = 180 + 20Q for each active firm. Compare one firm with two at the market quantity; no $24-versus-$22 precision test, and no silent conversion of the shared short-run ATC asset.')
d['questions']['P62G-MON-H-041']['pending']='Generate and validate explicit long-run variant; original MON-03 remains unchanged.'
patch(d,'P62G-MON-B3-058','Compare the quantities under average-cost (fair-return) regulation and marginal-cost pricing. Which policy covers total cost, and which leaves a loss?')
patch(d,'P62G-MON-EL-038','Read the prices under monopoly, average-cost regulation and marginal-cost regulation. Explain the difference between the two regulatory rules.')
patch(d,'P62G-MON-EL-039','How many more units would be sold under marginal-cost pricing than under average-cost regulation? Why do the additional units create gains from trade?')
patch(d,'P62G-MON-H-043',tier='medium')
for id in ['P62G-MON-EL-038','P62G-MON-EL-039','P62G-MON-EL-040']:
    fb=ORIGINALS[id]['feedback'].replace('Q1 = 16','Q = 116').replace('Q1 = 40','Q = 140')
    patch(d,id,feedback=fb,reason='Corrected malformed output references (16/40 instead of 116/140) while retaining the keyed arithmetic and regulatory construct.')
# Legacy core skills are kept; cleaner graph replaces the unreadable coordinate task.
mono='question-assets/monopoly/MON-01.webp'
patch(d,'P62G-MON-H-001','A manager uses MR = MC to choose output, then treats marginal revenue as the selling price. Which output and price actually maximize this monopolist\u2019s profit?',tier='medium',image=mono,
options=['36 units at $42.','36 units at $24.','60 units at $30.','60 units at $42.'],correct_index=0,
feedback='MR and MC meet at 36 units. At that output the demand curve gives $42; the $24 marginal revenue is not the selling price. The demand–MC intersection at 60 units is the efficient benchmark rather than the monopoly optimum.')
patch(d,'P62G-MON-H-002','At the profit-maximizing output, calculate economic profit. Which cost comparison is appropriate?',image=mono,
options=['$648, using price minus MC for each unit.','$540, using price minus ATC for each unit.','$540, using price minus AVC for each unit.','$648, using price minus ATC for each unit.'],correct_index=1,
feedback='MR = MC gives 36 units, demand gives price $42 and ATC is $27. Profit is (42−27) × 36 = $540. The price–MC gap is not profit per unit.')
patch(d,'P62G-MON-H-003','Find the monopoly output and price. Why is marginal revenue lower than this price?',image=mono,
options=['36 units at $42; additional sales require lowering the single price on earlier units.',
'60 units at $30; additional sales require lowering the single price on earlier units.',
'36 units at $24; the marginal-revenue curve gives the price consumers pay.',
'60 units at $30; the demand–MC intersection maximizes private profit.'],correct_index=0,
feedback='MR = MC selects 36 units and demand gives price $42. MR is only $24: an extra sale adds revenue, but the lower single price also reduces revenue on earlier units. The efficient quantity of 60 is a different benchmark.')
patch(d,'P62G-MON-H-004','Fixed cost rises by $360 while demand, MR and MC remain unchanged. The firm stays active. What happens to its price and economic profit?',image=mono,
options=['Price stays $30 and profit falls to $180.','Price stays $42 and profit remains $540.',
'Price stays $30 and profit remains $540.','Price stays $42 and profit falls to $180.'],correct_index=3,
feedback='The firm still chooses 36 units at MR = MC and charges $42 from demand. Initial profit is (42−27) × 36 = $540; the $360 fixed-cost increase lowers it to $180 without changing the marginal output rule.')
for id in ['P62G-MON-H-001','P62G-MON-H-002','P62G-MON-H-003','P62G-MON-H-004']:
    d['questions'][id]['review']='Remap to the clean MON-01 asset rather than retire the record. Preserve its existing price/profit/MR/fixed-cost skill and routing; explicitly replace legacy numerical examples with MON-01 values. Do not automatically add these four records to Trial by Graph.'
for id in ['P62G-MON-H-006','P62G-MON-H-007','P62G-MON-H-008','P62G-MON-H-009','P62G-MON-H-010','P62G-MON-H-011','P62G-MON-H-012','P62G-MON-H-005']:
    d['questions'][id]['pending']='Resolve legacy graph legibility and replace approximate-range appendage with substantive decision before final acceptance.'
patch(d,'P62I-OLI-L-004','Find every pure-strategy Nash equilibrium in the matrix, with payoffs ordered (Row, Column). Compare their joint profits. Does a larger joint profit rule out another Nash equilibrium?',tier='elite')
patch(d,'P62I-OLI-L-010','Each cell lists (Row, Column) payoffs. Calculate the joint payoff in each cell and check each firm\u2019s incentive to deviate. Does any cell form a pure-strategy Nash equilibrium?',tier='elite')
save(d)
