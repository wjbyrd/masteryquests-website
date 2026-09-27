"""Manually authored, task-specific choices for construction flags in revised items.

Numbers substituted below come from each already verified keyed answer, not
from a sibling item. Choice positions and task content are otherwise retained.
"""
from author import *
import re

groups=json.loads((WORK/'choice_review_groups.json').read_text())
# Correct first. The three alternatives express distinct economic mistakes.
rows={
0: '''Both debt and rates contribute; their separate effects remain unidentified.
Only debt contributes; the doubled interest bill identifies a doubled principal.
Only rates contribute; the interest bill identifies the effective rate change.
Neither contributes; interest outlays measure new borrowing rather than debt service.''',
1: '''Shares are financial assets; equipment is GDP investment; saving can finance the latter.
Both are GDP investment; expected returns make either purchase newly produced capital.
Only shares are GDP investment; saving finances securities while equipment is current consumption.
Neither is GDP investment; financing through household saving excludes business capital purchases.''',
2: '''G: $0; C: +${v0}; M: +${v1}; GDP: +${v2}.
G: +${v0}; C: +${v0}; M: +${v1}; GDP: +${sum02}.
G: $0; C: +${v0}; M: $0; GDP: +${v0}.
G: $0; C: +${v2}; M: +${v1}; GDP: +${diff21}.''',
3: '''Include ${v0}; GDP follows production location rather than ownership.
Include ${sum02}; GDP adds domestic location and domestic ownership.
Include ${v2}; GDP follows the owners' nationality rather than location.
Include ${diff01}; GDP deducts foreign profit remittances from domestic output.''',
4: '''CPI rises; the GDP deflator is unchanged, reflecting their different coverage.
Both rise equally; household fuel belongs in both indexes at equal weight.
CPI is unchanged; the GDP deflator rises through the import-price component.
Both are unchanged; imported consumption is excluded from either price index.''',
5: '''CPI for benefits, deflator for GDP; different coverage permits different movements.
CPI for both uses; consumer prices also measure domestic capital-goods prices.
Deflator for both uses; domestic output prices measure imported household costs.
Deflator for benefits, CPI for GDP; imported food belongs to domestic output.''',
6: '''Machines add physical capital; training adds human capital; either can raise productivity.
Both add physical capital; improved maintenance counts as additional machine stock.
Machines add human capital; training adds physical capital; either can raise productivity.
Machines add physical capital; training adds labor quantity; only machines affect productivity.''',
7: '''It ignores diminishing marginal gains; total output can still rise.
It ignores declining total output; the second machine reduces production.
It ignores labor displacement; the second machine must halve employment.
It ignores technical progress; each machine raises future marginal gains.''',
8: '''Demand recovery helps recession layoffs; retraining helps the automation mismatch.
Demand recovery helps both groups; automation creates only a spending shortfall.
Retraining helps both groups; recession layoffs indicate only a skills mismatch.
Neither helps either group; retaining no job places both outside the labor force.''',
9: '''Real value rises about 1.9%; indexation exceeds estimated cost growth.
Real value falls about 2%; measured inflation exceeds estimated cost growth.
Real value rises about 8%; add measured and estimated inflation rates.
Real value is unchanged; official indexation exactly preserves the recipient's utility.''',
10: '''Hours fall; employment, unemployment and participation remain unchanged.
Employment falls by five; two half-time jobs equal one employed person.
Unemployment rises by ten; each loss of full-time hours counts as joblessness.
Participation falls by ten; paid part-time workers leave the labor force.''',
11: '''B doubles in ten years; A also grows, delaying catch-up.
B doubles in ten years; A's starting level establishes catch-up then.
A doubles in ten years; B doubles in thirty-five, preventing catch-up.
B doubles in five years; doubling its growth rate halves catch-up time.''',
12: '''Nominal pay rises 6%; real pay falls about 1.9%.
Nominal and real pay both rise 6%; prices do not enter.
Nominal pay rises 6%; real pay rises 14% after adding inflation.
Nominal pay rises 6%; real pay falls 8% after ignoring the raise.''',
13: '''Adjust for prices and population before comparing real output per person.
Use equal nominal totals to infer equal real output per person.
Adjust for population alone; nominal price differences do not affect the comparison.
Adjust for prices alone; population differences do not affect per-person output.''',
14: '''Frictional falls, structural rises; their net natural-rate effect is uncertain.
Frictional falls, structural is unchanged; their net natural-rate effect is downward.
Frictional is unchanged, structural rises; their net natural-rate effect is upward.
Both components fall; faster matching also removes the new qualification mismatch.''',
15: '''Nominal growth is 32%; real growth is 10% at fixed prices.
Nominal growth is 32%; real growth is 12% by simple subtraction.
Nominal growth is 32%; real growth is 20% from current prices.
Nominal growth is 32%; real growth is 32% including price changes.''',
16: '''Employment: unchanged; unemployment: unchanged.
Employment: falls 1; unemployment: rises 1.
Employment: rises 1; unemployment: falls 1.
Employment: falls 1; unemployment: unchanged.''',
17: '''Retained wages rise, jobs become scarcer; total earnings depend on quantities.
Retained wages rise, jobs become scarcer; total earnings rise by the wage percentage.
Retained wages rise, jobs become scarcer; total earnings fall by the employment percentage.
Retained wages rise, jobs expand; the higher wage signals a demand increase.''',
18: '''Frictional falls, cyclical rises; the net change needs relative sizes.
Frictional falls, cyclical falls; improved matching offsets the recession's lost vacancies.
Frictional rises, cyclical rises; recession makes faster searches less effective by definition.
Frictional is unchanged, cyclical rises; faster searches affect participation alone.''',
19: '''Firm incentives drive efficiency wages; bargaining drives union wages; either can exceed clearing.
Firm incentives drive efficiency wages; bargaining drives union wages; only unions can exceed clearing.
Bargaining drives efficiency wages; firm incentives drive union wages; either can exceed clearing.
Legal wage floors drive both wage types; neither depends on productivity or bargaining.''',
20: '''Longer search raises frictional costs; better retention adds benefits; welfare needs both.
Longer search raises frictional costs; better retention adds nothing; welfare necessarily falls.
Better retention adds benefits; longer search adds no cost; welfare necessarily rises.
Longer search is cyclical; better retention is structural; frictional costs remain unchanged.''',
21: '''Surplus falls from 30 to 10; twenty additional jobs leave ten unfilled requests.
Surplus falls from 30 to zero; increased demand fully removes the wage-floor constraint.
Surplus rises from 10 to 30; productivity gains displace twenty previously employed workers.
Surplus stays at 30; the unchanged wage fixes the number of available jobs.''',
22: '''Sustained growth compounds faster; the level increase leaves subsequent doubling time unchanged.
Sustained growth changes only the level; the level increase shortens subsequent doubling time.
Both shorten subsequent doubling time equally; each policy specifies the same 4% figure.
Neither changes the future path; percentage changes affect nominal measures rather than output.''',
23: '''Co-finance transferable training; compare spillover benefits with the funds' alternative uses.
Subsidize current consumption; treat the resulting spending as equivalent to transferable training.
Protect current jobs from new technology; treat lower mobility as increased skill formation.
Raise the nominal GDP target; treat its dollar increase as additional human capital.''',
24: '''Natural: 5%→4%; cyclical: 3%→1%; reform and demand recovery both contribute.
Natural: 5%→5%; cyclical: 3%→0%; demand recovery explains the entire decline.
Natural: 3%→2%; cyclical: 5%→3%; frictional unemployment belongs in the cyclical component.
Natural: 5%→2%; cyclical: 3%→3%; structural reform explains the entire decline.''',
25: '''B's productivity rises 66.7% and remains below A's.
B's productivity rises 40% and reaches A's level.
B's productivity falls 40% and remains below A's.
B's productivity rises 100% and exceeds A's level.''',
26: '''Hourly productivity rises 5%; total output falls 0.25%.
Hourly productivity rises 5%; total output rises 5%.
Hourly productivity rises 5%; total output is unchanged.
Hourly productivity falls 5%; total output falls 5%.''',
27: '''Current consumption falls; future output can rise; permanent faster growth needs more than capital deepening.
Current consumption rises; future output can rise; saving immediately releases resources for both uses.
Current consumption falls; future output must fall; diminishing returns mean negative capital contributions.
Current consumption falls; future output rises; capital deepening alone sustains permanently faster growth.''',
28: '''Improve property and contract enforcement to reduce the risk of lost investment returns.
Add spare electricity capacity to eliminate the risk of seized investment returns.
Protect existing firms from entry to substitute incumbent rents for enforceable contracts.
Raise nominal wages by decree to substitute higher money earnings for productive capacity.''',
29: '''Monetary contribution: +${v0}; net AD: −${v1}; foreign contraction outweighs easing.
Monetary contribution: +${v0}; net AD: +${v0}; foreign contraction is omitted.
Monetary contribution: +${v0}; net AD: −${twov1}; the initial investment effect is omitted.
Monetary contribution: +${v0}; net AD: −${fourv1}; the total foreign offset is multiplied again.''',
30: '''Capacity rises {v0}; actual output exceeds new potential by {v1}.
Capacity rises {twov0}; actual output equals new potential with no gap.
Capacity is unchanged; actual output exceeds potential by {twov0}.
Capacity rises {v0}; actual output falls below new potential by {v1}.''',
31: '''SRAS shifts left, SRPC up; output and unemployment return toward natural benchmarks.
SRAS shifts right, SRPC down; output and unemployment remain beyond natural benchmarks.
LRAS shifts right, LRPC left; the demand boom changes productive capacity permanently.
Both short-run curves stay fixed; wage expectations affect neither output nor unemployment.''',
32: '''Recovery removes the original gap; the supply shock adds an inflation-output tradeoff.
Recovery leaves the original gap intact; expansion therefore lowers both unemployment and inflation.
The supply shock restores the original demand gap; expansion therefore lowers inflation pressure.
The supply shock removes timing concerns; contraction therefore restores output and lowers inflation.''',
33: '''No: natural-rate inflation is 5%; reaching 3% requires unemployment of 7%.
Yes: natural-rate inflation returns to 3%; unemployment can remain at 5%.
Yes: natural-rate inflation is 5%; reaching 3% requires unemployment of 3%.
No: natural-rate inflation stays 7%; reaching 3% requires unemployment of 9%.''',
34: '''c remains the endpoint; contract lags can preserve transition costs.
b becomes the endpoint; contract lags prevent eventual inflation adjustment.
U1/I1 becomes the endpoint; credibility lowers the natural unemployment rate.
d remains the endpoint; expectations have no effect on the short-run curve.''',
35: '''First move along SRPC; later expectations shift it up, restoring natural unemployment.
First move along LRPC; later expectations rotate it down, lowering natural unemployment.
First shift SRPC down; later inflation falls further, preserving lower unemployment.
First shift SRPC up; later expectations shift LRPC left, preserving lower unemployment.''',
36: '''Inflation is 4%; this curve movement assumes fixed expectations.
Inflation is 4%; this result survives fully adjusted expectations unchanged.
Inflation is 2%; lower unemployment reduces inflation with fixed expectations.
Inflation is 3%; natural unemployment fixes inflation despite the policy.''',
37: '''Real output falls about 1.9%; this is a real contraction.
Real output falls 7%; the price-index increase is the contraction.
Real output rises 5%; nominal spending establishes real expansion.
Real output rises 12%; combining nominal growth and inflation gives expansion.''',
38: '''Disinflation; prices still rise; excess unemployment indicates temporary real costs.
Deflation; prices fall; excess unemployment indicates temporary real costs.
Disinflation; prices still rise; excess unemployment implies no real cost.
Disinflation; prices are unchanged; excess unemployment represents permanently lower potential.''',
39: '''M1: $1,600; M2: $4,000; historical narrow money falls, broad money is unchanged.
M1: $3,500; M2: $4,000; savings were already counted in historical narrow money.
M1: $1,600; M2: $3,600; the transfer removes funds from both aggregates.
M1: $2,000; M2: $4,000; the transfer changes neither historical monetary aggregate.''',
40: '''Excess reserves: ${v0}→${v1}; actual lending also depends on bank and borrower responses.
Excess reserves: ${v0}→${v1}; actual lending must fall by exactly ${v1}.
Excess reserves: ${v0}→${sum01}; the higher ratio releases ${v1} for additional lending.
Capital: ${v0}→${v1}; the higher reserve requirement writes down assets by ${v1}.''',
41: '''Banks need willing, qualified borrowers as well as reserve capacity.
Reserve creation requires prior loan applications; weak demand prevents the injection.
Reserves already represent loan applications; the injection establishes adequate credit demand.
Loans require equal reductions in existing deposits; weak demand preserves deposits.''',
42: '''Prices are unchanged; equal output growth absorbs the nominal-spending increase.
Prices rise 5%; money growth determines inflation without adjusting for output.
Prices rise 10%; money and output growth both add to inflation.
Prices fall 5%; output growth determines prices without adjusting for money.''',
43: '''Short-run output can rise; long-run output returns to potential at higher prices.
Short-run output stays at potential; long-run neutrality also rules out temporary real effects.
Short-run output rises; long-run potential rises equally despite unchanged productive resources.
Short-run output rises; long-run neutrality requires prices to return to their original level.''',
44: '''Menu and shoeleather costs, respectively; both can persist with anticipated inflation.
Shoeleather and menu costs, respectively; both can persist with anticipated inflation.
Borrower and lender redistribution, respectively; both disappear with anticipated inflation.
Pure nominal changes in both cases; neither uses real resources with anticipated inflation.''',
45: '''Real purchasing power falls 20%; nominal cash is unchanged without a tax bill.
Real purchasing power falls 25%; the price rise is the purchasing-power loss.
Nominal cash falls 25%; inflation removes currency through an implicit tax bill.
Real purchasing power is unchanged; holding the same nominal cash preserves its value.''',
46: '''Disinflation: prices still rise; fixed nominal debt continues losing real value.
Deflation: prices fall 5%; fixed nominal debt continues losing real value.
Zero inflation: prices are unchanged; fixed nominal debt keeps its real value.
Accelerating inflation: prices rise faster; fixed nominal debt gains real value.''',
47: '''Relative demand effects: income pushes rates up, lower prices pull rates down.
Income alone: higher income pushes rates up, prices do not affect money demand.
Prices alone: lower prices pull rates down, income does not affect money demand.
Neither effect: opposite demand forces imply equal offsets and an unchanged rate.''',
48: '''Rate-to-investment transmission weakens when expected sales deteriorate.
Policy-to-rate transmission failed despite the observed interest-rate decline.
Investment-to-AD transmission fails because capital spending is excluded from AD.
Reserve-to-credit transmission tightened through an unstated increase in reserve requirements.''',
49: '''Reserves rose; credit and spending responses remain limited.
Reserves stayed fixed; weak borrowing proves no injection occurred.
Reserves rose; aggregate demand rises by the same amount.
Reserves rose; the natural unemployment rate therefore falls permanently.''',
50: '''+${v0}; purchases exceed the initial tax-induced consumption reduction.
$0; equal tax and purchase changes cancel their initial demand effects.
${fivev0}; apply the spending multiplier without the tax-induced consumption reduction.
−${fourv0}; apply the tax multiplier without the government purchases increase.''',
51: '''G: $0; initial C: +${v0}; total AD: +${v1}.
G: +${transfer}; initial C: $0; total AD: +${wrongtotal}.
G: $0; initial C: −${v0}; total AD: −${v1}.
G: $0; initial C: $0; total AD: $0.''',
52: '''${v0}; divide target plus total offset by the multiplier.
${threev0}; multiply the target by two, omitting the offset.
${halfv0}; subtract the offset before reversing the multiplier.
${twov0}; add the offset without reversing the multiplier.''',
53: '''MPC: 0.75; the gross effect leaves later crowding out unresolved.
MPC: 0.25; the saving share equals the marginal consumption share.
MPC: 4; the gross spending ratio equals the marginal consumption share.
MPC: 0.75; the gross effect establishes an identical realized net effect.''',
54: '''Support: output and inflation rise; restraint: output and inflation fall.
Support: output rises, inflation falls; restraint: output falls, inflation rises.
Support: output and inflation fall; restraint: output and inflation rise.
Support: potential output rises; restraint: potential output falls by reversing the disruption.''',
55: '''Supply contraction alone raises rates; the combined transmission direction remains uncertain.
Supply contraction dominates; rates rise, investment falls and aggregate demand falls.
Demand contraction dominates; rates fall, investment rises and aggregate demand rises.
The contractions cancel; rates, investment and aggregate demand all remain unchanged.''',
56: '''Reserve capacity increases, holding incentives strengthen; the net lending response remains uncertain.
Reserve capacity increases, holding incentives strengthen; both changes encourage additional lending equally.
Reserve capacity decreases, holding incentives strengthen; both changes discourage additional lending equally.
Reserve capacity increases, holding incentives are irrelevant; a fixed multiplier determines lending.''',
57: '''Capital: −${v0}; new equity addresses insolvency, a liquidity loan alone does not.
Capital: +${twov0}; loan losses affect liquidity rather than the owners' residual claim.
Capital: +${fivev0}; writing off loans reduces deposit liabilities rather than bank assets.
Capital: $0 after borrowing ${v0}; the loan raises assets without matching liabilities.''',
58: '''System deposits contract up to ${v0}; this is not a first-bank recall amount.
System deposits expand up to ${v0}; removing reserves releases capacity for new loans.
System deposits contract ${quarterv0}; the first-bank reserve reduction is the total effect.
System deposits contract ${sixteenthv0}; multiply reserve withdrawal by the required reserve ratio.''',
59: '''Reserves rise; lending still depends on demand, risk and capital.
Reserves stay fixed; weak loan demand prevents central-bank reserve creation.
Reserves rise; bank equity rises equally through the reserve injection.
Reserves rise; each added reserve dollar becomes an immediate commercial loan.''',
60: '''A: −1%, B: 6%; only A's borrower gains from the inflation surprise.
A: −1%, B: −1%; both borrowers gain equally from the inflation surprise.
A: 6%, B: 6%; expected inflation fixes both realized real returns.
A: 6%, B: −1%; only B's borrower gains from the inflation surprise.''',
61: '''Government gains purchasing power; inflation reduces existing money holders' real balances.
Government gains real resources directly; creating money leaves existing purchasing power intact.
Government gains tax receipts; each money holder pays an equal statutory charge.
Government gains purchasing power; the burden is equal regardless of money holdings.''',
62: '''Faster money growth raises sustained inflation; a one-time increase raises the price level.
Faster money growth and a one-time increase both raise sustained inflation equally.
Faster money growth raises sustained real growth; a one-time increase raises real capacity.
Faster money growth and a one-time increase leave both nominal price measures unchanged.''',
63: '''The shifts offset at the observed rate; both schedules can have changed.
The schedules stayed fixed; an unchanged rate rules out either schedule changing.
Demand fell as supply rose; opposite quantity shifts preserve the observed rate.
Income and prices stayed fixed; an unchanged rate establishes both underlying variables.''',
64: '''Costs push SRAS right, expectations push left; the net shift is uncertain.
Both push SRAS right; higher expected wages encourage firms to supply more.
Both push SRAS left; lower production costs reduce the supply of output.
Costs push right, expectations push left; the net shift is exactly zero.''',
65: '''Ratios: gradual 1.5, rapid 2; timing constraints still matter for selection.
Ratios: gradual 0, rapid 2; spreading losses removes the gradual plan's cost.
Ratios: gradual 2, rapid 1.5; fewer calendar years establish lower cumulative cost.
Ratios: gradual 4, rapid 4; equal inflation reductions establish equal costs per point.''',
66: '''Recessionary gap: 20; unchanged resources support unchanged LRAS.
Recessionary gap: zero; reset potential output to observed output.
Expansionary gap: 20; potential output represents the demand level.
Capacity loss: 20; any actual-output shortfall shifts LRAS left.''',
67: '''SRAS shifts right through wage adjustment; fixed AD and capacity make recovery conditional.
SRAS shifts left through higher expected wages; fixed AD then raises actual output.
AD shifts right automatically; wage and expectation adjustment are irrelevant to self-correction.
LRAS shifts left to actual output; unchanged resources compel a lower potential level.''',
68: '''Above the original curve; comparison with the shock-period curve needs magnitudes.
At the original curve; removing the supply shock also removes expectation persistence.
Below the original curve; ending a temporary shock reverses both inflationary forces.
Above the shock-period curve; the expectations effect necessarily exceeds the removed shock.''',
69: '''An upward SRPC shift fits; a movement along the fixed downward curve does not.
A positive demand movement fits; both variables rise along the fixed downward curve.
A downward SRPC shift fits; higher unemployment establishes lower inflation expectations.
An upward-sloping LRPC fits; two observed outcomes establish the long-run relation.''',
70: '''Demand expansion supports output but adds inflation pressure: a supply-shock tradeoff.
Demand expansion supports output and lowers inflation: the equivalent of improved supply.
Demand restraint supports output and lowers inflation: removing the energy disruption.
Either demand policy restores capacity directly: energy availability adjusts with spending.''',
71: '''Quote: unit of account; deposit: payment medium; card: transfer instrument.
Quote: store of value; deposit: transfer instrument; card: unit of account.
Quote: payment medium; deposit: unit of account; card: money-creation instrument.
Quote: unit of account; deposit: outside money; card: commodity payment medium.''',
72: '''Investment lowers AD; exports raise it; relative contributions determine the net result.
Investment lowers AD; exports raise it; monetary policy establishes a net decline.
Investment lowers AD; exports raise it; trade demand establishes a net increase.
Investment lowers AD; exports raise it; opposing directions establish an exact offset.''',
73: '''Earlier contract adjustment can reduce the initial unemployment excursion for that restraint.
Earlier contract adjustment increases the initial unemployment excursion by shifting SRPC upward.
Earlier contract adjustment leaves the excursion unchanged because expectations do not affect wages.
Earlier contract adjustment permanently lowers natural unemployment despite unchanged labor-market structure.''',
74: '''Unemployment costs have unwound; the price level remains higher and is still rising.
Unemployment costs persist; the higher price level establishes continuing excess unemployment.
Unemployment costs have unwound; inflation of 2% makes the price index fall.
Unemployment costs cannot unwind; returning to natural requires the old price level.''',
75: '''Fixed contracts can preserve current costs; lower forecasts help later adjustment.
Fixed contracts immediately reset; credible forecasts eliminate current adjustment costs.
Fixed contracts permanently fix forecasts; lower expectations cannot aid later adjustment.
Fixed contracts lower natural unemployment; credible forecasts shift the long-run curve left.''',
76: '''Anticipated inflation loses the gain; a fresh surprise must exceed updated expectations.
Anticipated inflation preserves the gain; expectations adjustment permanently lowers natural unemployment.
Anticipated inflation loses the gain; a fresh surprise must fall below updated expectations.
Anticipated inflation preserves the gain; a fresh surprise shifts the long-run curve left.''',
77: '''Reform shifts LRPC left; inflation selects another point on that new curve.
Reform moves along LRPC; inflation shifts the entire curve to the left.
Reform shifts LRPC left; inflation shifts it right by reversing the reform.
Reform and inflation both move along the same downward-sloping long-run curve.''',
78: '''The long-run benchmark is consistent; differing transition costs remain possible.
The lower-inflation economy must have a lower long-run unemployment benchmark.
The higher-inflation economy must have lower unemployment along the long-run curve.
The shared long-run benchmark requires equal cumulative transition costs in both economies.''',
79: '''Both ratios are 2; B achieves half the disinflation at half the cost.
A's ratio is 2, B's is 1; lower total losses alone establish greater efficiency.
A's ratio is 4, B's is 8; the comparison uses only final-year output losses.
Both ratios are 1; equal efficiency follows from dividing years by inflation reductions.''',
80: '''Enforcement plus investment addresses the constraint; potential returns alone do not ensure investment.
Machine subsidies alone ensure catch-up; investors' ability to retain returns is irrelevant.
Enforcement alone reaches B immediately; additional capital and production changes are unnecessary.
Neither policy can help at A; diminishing returns eliminate the incentive to invest.''',
81: '''Productivity rises; total output depends on the accompanying employment change.
Productivity and total output rise; higher output per worker fixes both directions.
Only total output rises; the vertical axis measures aggregate rather than per-worker output.
Neither rises; diminishing returns make additional capital reduce output per worker.''',
82: '''5%; frictional and structural remain after the cyclical point disappears.
0%; removing cyclical unemployment also removes frictional and structural components.
3%; frictional unemployment disappears with the cyclical component during recovery.
6%; changes in demand leave all three unemployment components unchanged.''',
83: '''A helps demand layoffs now; B addresses skill mismatch after training takes effect.
A fixes skill mismatch now; B restores current aggregate demand before training starts.
Both eliminate both causes now; spending and training have identical immediate mechanisms.
Neither affects either cause; cyclical and structural unemployment cannot coexist in one economy.''',
84: '''Temporary output paths differ; both ultimately return to unchanged potential.
Temporary output paths coincide; neutrality rules out the effects of contract lags.
Only B's prices change; flexible wages prevent nominal adjustment in A.
Long-run potentials differ; temporary rigidity permanently alters B's productive technology.''',
85: '''Capital loss shifts LRAS; wage adjustment alone cannot rebuild capacity.
Capital loss leaves LRAS fixed; the shortfall is entirely a demand gap.
Capital loss lowers expected prices alone; productive capacity remains unchanged.
Capital loss initially shifts LRAS; lower wages automatically recreate the destroyed stock.''',
86: '''Fixed AD2: P3/Y1; quick reversal: P1/Y1.
Fixed AD2: P1/Y1; quick reversal: P3/Y1.
Fixed AD2: P2/Y2; quick reversal: P2/Y2.
Fixed AD2: P2/Y3; quick reversal: P2/Y3.''',
87: '''Delayed stimulus can overshoot after recovery despite the valid initial diagnosis.
Delayed stimulus remains beneficial at arrival solely because the initial diagnosis was valid.
Forecast recovery invalidates the initial diagnosis and proves no output gap existed.
Slow wage adjustment rules out eventual recovery and makes arrival timing irrelevant.''',
88: '''Wages support recovery; further demand loss makes the final output change uncertain.
Wages ensure recovery to Y1; the supply shift dominates the added demand loss.
Demand ensures a further output fall; the demand shift dominates falling wages.
Both changes lower potential output; combined AD and SRAS shifts move LRAS left.''',
}
review=[]
for n,ids in enumerate(groups):
    for id in ids:
        x=q(id); old=x['$correct']; vs=re.findall(r'\$([\d,]+)',old)
        if n==3:vs=re.findall(r'\$([\d,]+)',x['q'])
        if n==30:vs=re.findall(r'\d+',old)[:2]
        v=[float(z.replace(',','')) for z in vs]
        ctx={f'v{k}':f'{z:g}' for k,z in enumerate(v)}
        if v:
            for label,fac in [('two',2),('three',3),('four',4),('five',5),('half',.5),('quarter',.25),('sixteenth',.0625)]:
                for k,z in enumerate(v):ctx[f'{label}v{k}']=f'{fac*z:g}'
        if len(v)>1:ctx['sum01']=f'{v[0]+v[1]:g}';ctx['diff01']=f'{v[0]-v[1]:g}'
        if len(v)>2:ctx['sum02']=f'{v[0]+v[2]:g}';ctx['diff21']=f'{v[2]-v[1]:g}'
        if n==51:ctx.update(transfer=f'{v[0]/.6:g}',wrongtotal=f'{v[0]/.6/.4:g}')
        choices=rows[n].format(**ctx).splitlines();assert len(set(choices))==4
        # Preserve the existing correct position, with the same distractor order.
        pos=x['options'].index(old); options=choices[1:];options.insert(pos,choices[0])
        patch(id,'Reviewed construction flag against final task: four concise parallel choices with explicit, distinct economic mistakes.',options=options,**{'$correct':choices[0]})
        # Keep metadata linked to the current misconception, not removed option text.
        if id in TARGETS['C'] and 'commonError' in PATCHES[id]:
            patch(id,commonError='Incorrect inference: '+choices[1])
        review.append({'id':id,'group':n,'beforeOptions':x['options'],'afterOptions':options,'correct':choices[0]})
save()
(INPUTS/'choice_construction_review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Balanced',len(review),'revised questions across',len(groups),'review groups.')
