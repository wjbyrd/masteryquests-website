"""Remove inert numerical context and replace repeated checkpoint inferences.

Only the already revised, exact-ID Class-F implementation targets are touched.
The first form retains its inference; subsequent forms test a different constraint,
counterfactual, causal diagnosis, or reverse inference in the same skill family.
"""
from author import *
import re
groups=json.loads((WORK/'context_groups.json').read_text())
def clean(s):
    for a,b in [
        (r' with \d+ workers',''),(r' among \d+ otherwise qualified job seekers',' among otherwise qualified job seekers'),
        (r' among \d+ workers',' among workers'),(r'Firms serving \d+ workers','Firms'),
        (r'In a workforce of \d+, ','In the labor market, '),(r' in a workforce of \d+',''),
        (r'An economy has \d+ workers\. ','In an economy, '),(r'A region of \d+ workers','A region'),
        (r' with output \$\d+',''),(r'An economy begins with money \$\d+\. ','In an economy, '),
        (r'nominal money supply \d+ fixed','nominal money supply fixed'),
        (r' from an initial supply \d+',''),(r' by an amount indexed at \d+','')]:s=re.sub(a,b,s)
    return s
for ids in groups:
    id=ids[0];patch(id,'Remove an inert numerical context; the economic comparison supplies the task demand.',q=clean(q(id)['q']))

# stem | correct | three distinct alternatives | feedback
variants={
(0,1): '''A plant purchases new machines, but lacks workers trained to operate them. Compare a machine subsidy alone with a subsidy paired with training. What limits the first proposal's productivity claim?
Physical capital needs complementary skills; pairing training can make the machines more productive.
Physical capital replaces all skills; training cannot alter the machines' contribution to output.
Training replaces all machines; purchasing equipment cannot contribute to output after training.
The two proposals are identical; both add only to the physical capital stock.
New machines add physical capital, while training adds human capital. Complementarity means a shortage of operational skills can prevent machines from realizing their productive potential; the combined proposal addresses that constraint.''',
(0,2): '''A firm licenses a better production method and separately trains staff to use it. An analyst calls both investments an increase in worker headcount. Which correction separates the two productivity channels?
The method improves technology; training improves human capital; neither requires more workers.
The method improves human capital; training adds physical machines; both require more workers.
Both add physical capital; worker knowledge matters only through a larger headcount.
Both add labor quantity; output per worker is unchanged by either investment.
A usable production method changes how inputs are combined, while training changes workers' productive skills. Both can raise output per worker without increasing the number employed.''',
(0,3): '''A country imports identical machines while its most skilled operators emigrate. Output per remaining worker fails to rise. Which diagnosis challenges the claim that more equipment guarantees higher productivity?
Physical capital increased, but lost human capital can offset its productivity contribution.
Physical capital decreased, since imported equipment is excluded from productive capital.
Human capital increased, since a smaller workforce automatically has more skill per worker.
Technology necessarily deteriorated, since capital and skills cannot affect output per worker.
Imported machines are productive physical capital even though their purchase is offset in expenditure-account GDP. Losing skilled operators can reduce effective human capital and offset the machinery's contribution; the net outcome needs both channels.''',
(0,4): '''Two plants use identical equipment and workforce sizes. One adopts a more effective workflow; its output per worker rises. Which inference is supported, and which remains unproved?
Organization can improve productivity; the observation does not establish additional physical capital.
Physical capital must have risen; organization cannot change output with fixed equipment.
Labor quantity must have risen; output per worker measures only employment changes.
Human capital must have fallen; higher output at fixed inputs implies less worker skill.
Using the same equipment and workers more effectively can raise output per worker. The comparison rules out an increase in the stated machine stock and headcount; it does not require either to have grown.''',
(0,5): '''Training raises output per hour at a factory, but a reduction in operating hours leaves total output unchanged. A report says the training had no productivity benefit. Which correction follows?
Hourly productivity improved; fewer hours offset the gain in total output.
Hourly productivity was unchanged; total output alone measures output per hour.
Hourly productivity fell; a reduction in hours directly lowers output per hour.
Physical capital must have increased; training cannot change productivity with fixed output.
Productivity and output are different measures. When output is unchanged and hours fall, output per hour rises. Lower hours can offset the total-output effect of improved skills.''',
(1,1): '''A skills survey finds qualified applicants but slow vacancy matching. A separate industry has vacancies requiring qualifications its displaced workers lack. Which allocation addresses both frictions directly?
Improve matching for qualified applicants; retrain workers facing the qualification gap.
Retrain all qualified applicants; improve matching alone for the qualification gap.
Expand aggregate demand for both groups; matching and skills are already adequate.
Classify both groups as outside the labor force; neither can affect unemployment.
Slow matching of otherwise qualified workers is frictional. A mismatch between workers' skills and vacancies is structural. Matching assistance and retraining address different barriers rather than substituting automatically for one another.''',
(1,2): '''A job-search platform improves matching, but firms simultaneously require a new certification that many applicants lack. The unemployment rate is unchanged. Does that result prove the platform failed?
No; a frictional reduction can be offset by a new structural barrier.
Yes; unchanged total unemployment proves every component remained unchanged.
No; certification changes cyclical unemployment while matching changes only participation.
Yes; improved matching should immediately supply every missing certification.
An unchanged total can conceal offsetting component changes. Faster matching may lower frictional unemployment while the new qualification barrier raises structural unemployment. The aggregate outcome does not isolate the platform's effect.''',
(1,3): '''A recession ends and firms restore spending, but displaced workers still lack the qualifications for available jobs. Which inference limits the claim that demand recovery eliminates the remaining unemployment?
Recovery can remove cyclical weakness; the qualification mismatch can remain structural.
Recovery removes structural mismatch; remaining joblessness must be entirely cyclical.
Recovery turns qualified job seekers into nonparticipants; unemployment therefore disappears.
Recovery eliminates frictional search; remaining vacancies prove no skill mismatch exists.
Demand recovery can restore jobs lost through weak spending. It does not by itself change workers' qualifications, so a structural mismatch can remain after the cyclical component shrinks.''',
(1,4): '''Successful retraining reduces a qualification mismatch, but workers spend longer comparing offers before accepting jobs. What evidence is needed to determine the change in natural unemployment?
The structural reduction and frictional increase; their relative sizes determine the net change.
The structural reduction alone; longer search is excluded from natural unemployment.
The frictional increase alone; retraining affects only cyclical unemployment.
Neither component; natural unemployment is fixed regardless of matching and skills.
Retraining reduces structural unemployment while longer job search can increase frictional unemployment. Both belong to the natural rate; without their sizes, the net natural-rate change is ambiguous.''',
(2,1): '''A nonunion firm pays above the clearing wage to reduce quits. Turnover falls but hiring also falls. Which evaluation separates the intended mechanism from the employment tradeoff?
Retention benefits can coexist with fewer jobs; above-clearing efficiency pay can ration employment.
Lower turnover proves employment increased; retention and hiring measure the same margin.
Fewer jobs prove the wage was union-imposed; a firm cannot choose efficiency pay.
Lower turnover eliminates rationing; an efficiency wage necessarily clears the labor market.
An efficiency wage is chosen for productivity or retention incentives. Those benefits do not establish that all willing workers obtain jobs at the higher wage; lower hiring is a separate margin in the policy evaluation.''',
(2,2): '''Better monitoring lets a firm obtain the same effort at a lower wage. A proposal instead keeps its old above-market wage solely to deter shirking. Which inference follows from the changed constraint?
The efficiency-wage premium may become less valuable; monitoring substitutes for part of its incentive role.
The efficiency-wage premium must rise; monitoring raises the minimum wage set by law.
The union wage must rise; monitoring automatically creates collective bargaining coverage.
The market-clearing wage becomes irrelevant; a lower effort cost fixes employment mechanically.
If monitoring delivers the same effort at lower pay, part of the original anti-shirking reason for a wage premium weakens. The observation does not establish a legal or union wage requirement or a mechanical employment change.''',
(2,3): '''A union negotiates an above-market wage, while a nonunion firm voluntarily offers the same premium to reduce turnover. Does equal observed pay establish the same wage-setting mechanism?
No; collective bargaining and employer retention incentives can produce the same observed wage.
Yes; any above-market wage establishes collective bargaining in both workplaces.
Yes; equal wages establish identical productivity and turnover effects in both workplaces.
No; the union wage is a price ceiling while voluntary pay is a price floor.
The same wage can arise through different mechanisms. A union bargains on behalf of members; an employer may independently choose efficiency pay to improve retention. The wage level alone does not identify the mechanism or all outcomes.''',
(2,4): '''A firm claims higher pay is profitable because it cuts turnover costs. What comparison tests that claim rather than assuming any wage premium pays for itself?
Compare added wage expense with reduced turnover costs and any productivity gain.
Compare the wage with the legal minimum alone; retention costs cannot affect profit.
Compare headcounts alone; wage expense and worker productivity do not affect profit.
Compare posted wages across firms alone; a higher wage establishes higher profit.
The efficiency-wage claim is behavioral, not an accounting identity. The firm must weigh the extra wage bill against lower hiring/training costs from quits and any productivity benefit; a premium alone does not prove profitability.''',
(3,1): '''Demand returns to normal and actual unemployment equals the estimated natural rate. A proposal calls for more demand stimulus to eliminate the remaining frictional and structural unemployment. Which limitation matters?
Further demand cannot reliably remove matching and skill frictions; it may instead raise inflation pressure.
Further demand directly supplies missing skills; the natural rate falls with every spending increase.
Equality with natural unemployment means nobody is searching; all remaining unemployment is a data error.
Further demand removes frictional search by definition; inflation remains fixed after expectations adjust.
At the natural rate the cyclical gap has closed, but job search and skill mismatches remain. Sustained demand stimulus does not by itself repair those real labor-market mechanisms and can generate inflationary pressure.''',
(3,2): '''Actual unemployment and the estimated natural rate both fall after demand recovery and a matching reform. What information separates the two contributions?
Changes in the natural rate and in actual minus natural unemployment.
The final actual rate alone; it identifies both reform and demand contributions.
The inflation rate alone; it directly measures each unemployment component.
The initial labor force alone; unchanged population fixes both contributions.
The natural-rate change captures changed frictional/structural conditions. The change in actual unemployment minus the natural rate captures the cyclical component. Both are needed when reform and recovery occur together.''',
(4,1): '''Actual unemployment remains 4% while new evidence lowers the estimated natural rate from 5% to 4%. Holding other influences fixed, what changes in the diagnosis of demand pressure?
The negative unemployment gap closes; the earlier excess-demand diagnosis is no longer implied.
The negative unemployment gap doubles; a lower natural rate intensifies the measured demand boom.
The actual rate rises to 5%; revising an estimate changes the count of unemployed people.
The natural rate stays 5%; observations of actual unemployment cannot inform its estimation.
The gap is actual minus natural: initially 4−5=−1 point, then 4−4=0. Revised evidence about the natural benchmark changes the demand-pressure interpretation without changing measured actual unemployment.''',
(5,1): '''A research subsidy raises future productive capacity, but private spending is too weak to use existing capacity today. Which claim confuses the policy's time horizon?
That better research incentives alone necessarily close today's demand gap.
That research can affect future production methods and productive capacity.
That weak current spending can coexist with useful long-run investment opportunities.
That current stabilization and future productivity policy address different constraints.
Research incentives can improve the long-run production frontier, but that does not establish an immediate increase in spending sufficient to close an existing recessionary gap. Demand utilization and productive capacity require separate diagnoses.''',
(5,2): '''An economy is already at potential output but has weak incentives for innovation. Officials propose sustained demand stimulus as their only growth strategy. Which comparison is appropriate?
Stronger demand mainly pressures current prices; better innovation incentives can expand future capacity.
Stronger demand permanently raises capacity; innovation incentives affect only current prices.
Both policies affect only current prices; productive capacity cannot respond to innovation.
Both policies permanently raise capacity equally; higher nominal spending is real growth.
At potential, sustained demand expansion does not by itself supply more technology or resources. Innovation policy addresses a real source of future productive capacity, subject to its costs and effectiveness.''',
(5,3): '''A government must choose between accelerating a useful research program and temporary purchases during a demand slump. Does the slump prove the research program has no value?
No; current stabilization and future capacity benefits are different margins in allocating scarce resources.
Yes; idle capacity makes every investment in future technology economically worthless.
No; research spending automatically eliminates the current output gap without a demand calculation.
Yes; temporary government purchases permanently determine the economy's research productivity.
A slump creates a demand-management concern, but does not eliminate future benefits from research. Budget allocation should compare timing, expected benefits and opportunity costs; neither policy's value follows mechanically from the other's objective.''',
(6,1): '''A training subsidy is justified by skills that benefit future employers. Evidence shows the subsidized course teaches only a proprietary process unusable elsewhere. Which part of the original case weakens?
The external-benefit rationale weakens; most benefits may remain with the current employer.
The private-benefit rationale disappears; proprietary skills cannot improve any firm's output.
The resource cost disappears; training limited to one employer uses no scarce inputs.
The external-benefit rationale strengthens automatically; less transferability means larger spillovers.
The original subsidy rationale concerned benefits firms could not capture because skills were transferable. Firm-specific training weakens that particular externality argument, even though training can still have private value and resource costs.''',
(6,2): '''Workers can borrow affordably for transferable training and keep its full future earnings benefit. No spillover to others is identified. Does transferability alone establish a subsidy case?
No; the stated financing and benefit assumptions remove the proposed market-failure rationale.
Yes; every transferable skill creates an external benefit equal to its private return.
Yes; affordable borrowing means training has no opportunity cost for society.
No; privately financed skills cannot contribute to workers' productivity or earnings.
Transferability alone is not an externality. If trainees can finance training and capture its benefits, the stated case supplies neither a credit constraint nor an unpriced benefit; another justification would need evidence.''',
(7,1): '''Retraining lowers structural unemployment, but actual unemployment stays unchanged during a slump. Frictional unemployment is unchanged. What follows for the cyclical unemployment gap?
It widens by the natural-rate decline; unchanged actual unemployment conceals offsetting changes.
It narrows by the natural-rate decline; retraining directly removes the demand shortfall.
It stays unchanged; actual unemployment fixes every component separately.
It disappears; lower structural unemployment establishes full recovery despite unchanged actual unemployment.
Natural unemployment falls when structural unemployment falls and frictional unemployment is fixed. Actual minus natural therefore rises by the same amount if actual unemployment is unchanged.''',
(8,1): '''Output per hour rises 5% and average hours per worker falls 5%. What employment change would keep total output exactly unchanged, rather than merely approximately unchanged?
Employment rises about 0.251%; it offsets the factor 1.05×0.95.
Employment is unchanged; equal opposite percentage changes cancel exactly.
Employment rises 5%; it must match the full decline in hours.
Employment falls about 0.251%; productivity growth requires fewer workers at the stated hours.
Output equals output per hour times hours per worker times employment. The first two factors multiply to 0.9975. Employment must grow by 1/0.9975−1≈0.2506%, or about 0.251%, to restore the original total.''',
(9,1): '''Saving rises and capital per worker grows, but each extra unit of capital adds less output under unchanged technology. A forecast extends the initial output-growth increase forever. Which correction is warranted?
Transition growth can slow as marginal returns diminish; permanently faster growth needs another sustained source.
Transition growth must accelerate; diminishing returns make each later unit more productive.
Total output must decline immediately; diminishing marginal returns mean negative capital productivity.
Current consumption must rise immediately; higher saving creates resources without an opportunity cost.
Capital deepening can increase the output level and speed growth during transition, while diminishing marginal returns reduce successive gains. It does not alone establish a permanently higher growth rate under unchanged technology.''',
(9,2): '''A saving policy sacrifices current consumption for a higher future output level. A second proposal achieves the same future output with less current sacrifice. Which comparison bears on choosing between them?
The second has a lower stated transition cost; timing and other costs still need comparison.
Both have identical welfare effects; equal future output rules out any importance of current consumption.
The first is superior by definition; a larger saving sacrifice proves a larger future benefit.
Neither can raise future output; consuming less rules out producing additional capital.
Equal future output does not make transition costs irrelevant. Less current consumption sacrifice is an advantage on the stated margin, while a complete choice also considers timing, risk and any omitted costs or benefits.''',
(10,1): '''Reliable contract enforcement is established, but frequent electricity outages leave equipment idle. A proposal spends the entire growth budget on duplicating the legal reform. Which diagnosis challenges its priority?
Power reliability is now the stated constraint; another legal reform does not directly operate idle equipment.
Contract enforcement is still necessarily the sole constraint; physical infrastructure cannot affect output.
Idle equipment proves labor skills are irrelevant; no policy can raise its productive use.
More nominal spending alone supplies power; identifying the infrastructure bottleneck is unnecessary.
The binding constraint is context-dependent. With enforcement already reliable and outages idling machines, improving electricity availability addresses the specified barrier more directly than duplicating the legal reform.''',
(10,2): '''A property-rights reform improves investors' expected returns, but a shortage of trained workers prevents new machines from operating. Which inference limits a forecast of immediate catch-up?
Better incentives can induce investment, but complementary skills still constrain realized production.
Better incentives automatically supply skilled workers; the stated shortage cannot affect output.
The shortage proves enforcement did not improve; incentives and skills measure the same thing.
The reform lowers productive capacity; higher expected returns reduce the use of machinery.
Secure returns can encourage investment without providing every complementary input. A skill bottleneck can delay production benefits even when the institutional reform works on its intended incentive margin.''',
(11,1): '''An expected demand expansion raises actual and expected inflation together, with no supply shock or labor-market reform. Can the initial surprise-inflation unemployment gain be inferred?
No; equal actual and expected inflation supplies no inflation surprise to push unemployment below natural.
Yes; any higher actual inflation implies the same unemployment gain regardless of expectations.
Yes; expected inflation shifts the long-run curve left and lowers natural unemployment.
No; expected demand expansion necessarily reduces actual inflation below its initial rate.
In the expectations-augmented Phillips model, the temporary unemployment deviation depends on inflation relative to expectations. Equal increases in the two do not supply the surprise that generated the original short-run gain.''',
(11,2): '''After a demand surprise lowers unemployment, expectations fully catch up while productive capacity is unchanged. A report describes the return to natural unemployment as a reversal of the original demand increase. Which correction is needed?
Expectations adjustment can reverse the real gain even if higher demand and inflation persist.
Return to natural unemployment proves nominal demand returned to its old level.
Expectations adjustment permanently lowers natural unemployment below the initial benchmark.
Return to natural unemployment requires prices to fall back to their original level.
The upward adjustment of inflation expectations removes the initial surprise. Unemployment can return to natural at a higher sustained inflation rate without reversal of the nominal demand expansion or the price-level increase.''',
(12,1): '''Use π=πe−0.5(u−5), with rates in percent. Actual inflation is 4% and unemployment is 3%. What expectation is consistent, and does that outcome locate the economy on LRPC?
Expected inflation is 3%; unemployment below 5% places the outcome off LRPC.
Expected inflation is 5%; unemployment below 5% places the outcome on LRPC.
Expected inflation is 4%; actual inflation alone identifies expectations and the long run.
Expected inflation is 2%; lower unemployment must reduce inflation below expectations.
Rearrange to πe=π+0.5(u−5)=4+0.5(3−5)=3%. The natural benchmark is 5%; observed unemployment of 3% is a short-run deviation, not a point on the vertical LRPC.''',
(12,2): '''Use π=πe−0.5(u−5). Expectations rise from 3% to 4% after a demand surprise. If actual inflation is held at 4%, what happens to unemployment, and what inflation would retain u=3%?
Unemployment returns to 5%; retaining 3% would require inflation of 5%.
Unemployment remains 3%; retaining 3% requires no inflation increase beyond 4%.
Unemployment rises to 7%; retaining 3% would require inflation of 3%.
Unemployment returns to 5%; retaining 3% would require inflation of 4%.
With π=πe=4%, the equation gives u=5%. To retain u=3% when πe=4%, actual inflation must be 4−0.5(3−5)=5%. Updated expectations change the inflation required for the same short-run unemployment target.''',
(13,1): '''Officials promise a constant inflation rate above the public's former expectation and permanently lower unemployment. Expectations eventually equal the promised rate. Which component of the promise fails under unchanged labor-market structure?
The permanent unemployment gain fails; fully anticipated inflation leaves unemployment at natural.
The constant inflation rate is impossible; natural unemployment requires zero inflation.
The natural unemployment benchmark disappears; anticipated inflation determines productive capacity.
The unemployment gain strengthens; correctly anticipated inflation creates a larger surprise.
Once expected inflation equals actual inflation, the original surprise disappears. Under unchanged labor-market structure, the long-run benchmark remains natural unemployment; positive steady inflation is compatible with it.''',
(13,2): '''A labor-market reform lowers natural unemployment while a monetary expansion raises inflation. How could a report mistakenly credit monetary expansion for a permanent unemployment gain?
By attributing the reform's change in the natural benchmark to the simultaneous demand expansion.
By distinguishing the reform's benchmark change from the monetary policy's nominal effect.
By checking whether expectations have caught up before interpreting the unemployment observation.
By comparing labor-market structure before and after the reform rather than using inflation alone.
Simultaneous events do not identify a single cause. A real matching or skill reform can lower natural unemployment; demand expansion alone does not establish that structural change. The comparison must separate the two mechanisms.''',
(14,1): '''Inflation falls from 8% to 3%, and later to −1%. A report calls both transitions identical disinflation outcomes for the price level. Which distinction is needed?
At 3% prices still rise; at −1% they fall, so only the latter is deflation.
At 3% prices fall; at −1% they rise, so only the former is deflation.
Prices fall in both periods; any reduction in inflation establishes deflation.
Prices rise in both periods; the sign of the inflation rate affects only unemployment.
Disinflation is a reduction in inflation. A still-positive rate means a rising price level; a negative rate means a falling price level. Crossing zero therefore changes the direction of prices even though inflation fell in both transitions.''',
(14,2): '''Two disinflation plans reach the same inflation target. One has faster expectation adjustment and less cumulative excess unemployment. Does reaching the same target imply the same real transition cost?
No; the path of excess unemployment can differ even with an identical final inflation rate.
Yes; final inflation alone determines all unemployment experienced during the transition.
No; lower excess unemployment proves the final natural unemployment rate changed.
Yes; any positive final inflation rate rules out real disinflation costs.
An endpoint does not describe the transition path. Faster expectation adjustment can reduce excess unemployment incurred on the way to the same inflation target without requiring a different natural unemployment rate.''',
(15,1): '''Money rises 5% and real output is unchanged. Nominal spending is also unchanged. Using MV=PY, what must happen to velocity, and why is money growth alone an insufficient inflation forecast?
Velocity falls by the reciprocal factor; it offsets money growth in nominal spending.
Velocity is unchanged; money growth can leave nominal spending fixed at fixed output.
Velocity rises proportionally; two increases offset each other in the product MV.
Velocity falls to zero; unchanged nominal spending means all money ceases circulating.
If M rises by a factor of 1.05 while MV is fixed, V must be divided by 1.05, a fall of about 4.76%. With Y also fixed, P is unchanged. A money-growth-only forecast omitted the velocity response.''',
(15,2): '''Nominal spending rises 10% while real output rises 10%. A proposal treats the spending increase as a 10% rise in prices. Which quantity-equation comparison corrects it?
The price level is unchanged; nominal spending and real output rose by the same factor.
The price level rises 20%; add the spending and output growth rates.
The price level rises 10%; output growth does not enter the spending identity.
The price level falls 10%; output growth alone determines the price-level change.
P=MV/Y. When nominal spending MV and real output Y both rise by 1.10, their ratio and therefore P are unchanged. Nominal spending growth is not itself the inflation rate.''',
(16,1): '''Nominal wages and the price level both rise 6%. A report concludes that every real variable was unchanged. Which inference is supported and which is too broad?
Real wages are unchanged; that alone does not establish unchanged employment or output.
Real wages rise 6%; that establishes unchanged employment and output.
Real wages fall 6%; that establishes lower productive capacity in the long run.
Real wages rise 12%; that proves complete monetary neutrality across real variables.
The real-wage factor is 1.06/1.06=1. This verifies the wage comparison only. Complete monetary neutrality concerns real variables more broadly; employment and output require their own evidence.''',
(17,1): '''With nominal money supply fixed, real income rises and the price level falls. The interest rate nevertheless rises. What does that outcome reveal about the two money-demand effects at the old rate?
The income-driven increase exceeds the price-driven decrease in nominal money demand.
The price-driven decrease exceeds the income-driven increase in nominal money demand.
The two demand effects cancel exactly, leaving money demand unchanged.
The nominal money supply must have fallen despite the stated fixed supply.
Higher income raises transaction demand, while a lower price level reduces nominal balances needed. At fixed nominal supply, a higher equilibrium rate indicates that the net demand effect was an increase, not an exact cancellation or decrease.''',
(17,2): '''Real income rises and the price level falls while nominal money supply is fixed. Interest rates stay unchanged. A report says neither change affected money demand. Which correction follows?
Opposing demand effects can offset; an unchanged rate does not prove each effect was zero.
Both effects must be zero; an unchanged rate identifies each separate demand response.
Nominal supply must have risen; offsetting money-demand effects are impossible.
Both effects reduced demand; an unchanged rate proves the supply curve slopes downward.
Income and prices affect nominal money demand in opposing directions here. Their effects may balance at the unchanged rate even though each has a nonzero effect; one observed equilibrium does not identify both separate contributions.''',
(18,1): '''Money supply expands, but the interest rate rises rather than falls. With an upward interest effect from money demand, what additional shift could reconcile those observations?
Money demand increased enough to outweigh the rate-lowering supply expansion.
Money demand decreased, reinforcing the supply expansion's rate-lowering effect.
Money demand stayed fixed, making the supply expansion raise the rate by itself.
Money demand vanished, making the interest rate independent of supply and demand.
A supply increase alone lowers the rate in the standard diagram. A sufficiently large outward money-demand shift can dominate that effect and produce a higher observed rate despite monetary expansion.''',
(18,2): '''The interest rate stays fixed while both money demand and supply contract. A report describes unchanged monetary conditions because the rate did not move. Which observation challenges that conclusion?
The equilibrium quantity of money can fall even though opposing rate effects balance.
The equilibrium quantity must be unchanged whenever the observed interest rate is unchanged.
The money-supply contraction raises the equilibrium quantity while demand contraction lowers rates.
The money-demand contraction raises rates while the supply contraction lowers rates.
Inward supply and demand shifts exert opposing rate pressures. If they offset at the observed rate, the quantity can still fall; the unchanged price of liquidity does not establish an unchanged money-market allocation.''',
(19,1): '''Lower input costs shift SRAS right, but expected wages rise enough to offset that shift at every price level. An observer sees the original curve and says neither force mattered. Which correction is supported?
The unchanged net curve can hide two nonzero, opposing supply effects.
The unchanged net curve proves both individual effects were zero.
Both forces shifted AD instead, since supply curves cannot have offsetting changes.
Both forces shifted LRAS equally, even without any change in real resources.
The stem explicitly supplies an exact offset. Lower input costs and higher expected wages affect short-run supply in opposite directions; their cancellation does not mean either individual channel was absent.''',
(21,1): '''An adverse oil shock ends. Expected inflation also returns fully to its original level, with natural unemployment unchanged. How does this differ from a case where expectations remain elevated?
SRPC returns to its original position; persistent expectations would leave it above that position.
SRPC stays above its original position in both cases; temporary oil shocks permanently fix the curve.
LRPC shifts left only when expectations normalize; expected inflation determines natural unemployment.
SRPC falls below its original position; removing the shock reverses it into a permanent subsidy.
Both the supply offset and expectations contributed to the short-run curve. Removing the shock and restoring original expectations removes both shifts; if expectations stay high, their upward shift remains.''',
(22,1): '''Inflation and unemployment rise together. Analysts disagree between an adverse supply shock and higher inflation expectations. Do the two outcomes alone identify which mechanism caused the shift?
No; either can worsen the short-run relation, so additional evidence must distinguish the cause.
Yes; rising unemployment proves a pure favorable demand shock along an unchanged curve.
Yes; rising inflation proves expectations were unchanged during the observation.
No; neither mechanism can shift the short-run Phillips curve at all.
Both adverse supply conditions and higher expected inflation can shift the SRPC upward. Observing higher inflation with higher unemployment rejects a pure movement along one fixed downward curve, but does not by itself distinguish the two shift causes.''',
(22,2): '''After an adverse supply shock, policymakers hold unemployment at its former natural rate by supporting demand. Inflation rises. Does unchanged unemployment prove the short-run Phillips relation stayed fixed?
No; policy can offset the unemployment effect while inflation reveals a worse short-run relation.
Yes; any SRPC shift must change unemployment even when policymakers adjust demand.
No; unchanged unemployment proves natural unemployment permanently fell.
Yes; demand support eliminates the supply shock rather than changing the chosen outcome.
An outcome reflects both the shock and the response. Supporting demand can hold unemployment at the previous benchmark while accepting higher inflation; that observation is compatible with an upward SRPC shift.''',
(23,1): '''Unemployment is below the original natural rate during a demand boom. Later it stays low after expectations adjust, but matching institutions have improved. Which comparison prevents misattributing the persistent gain?
A lower natural rate can sustain gains that surprise demand alone cannot.
Use the original natural rate forever; reforms cannot affect a long-run unemployment benchmark.
Credit demand alone; expectations adjustment preserves any original surprise unemployment gain.
Infer permanently lower inflation; improved matching forces all nominal prices to fall.
If real labor-market structure changes, the natural benchmark can change. Persistence of lower unemployment then need not refute the expectations-adjusted Phillips model; the reform's effect must be separated from the temporary demand surprise.''',
(24,1): '''Two economies finish disinflation with identical inflation and natural unemployment rates. Their records show different cumulative output losses. Is that combination inconsistent with a vertical LRPC?
No; identical long-run endpoints can be reached through different costly transition paths.
Yes; a vertical LRPC requires identical output losses at every point in both transitions.
No; different losses prove their final natural unemployment rates were actually different.
Yes; positive output losses imply that the long-run curve slopes downward.
LRPC describes the fully adjusted unemployment-inflation relation, not a unique transition path. Credibility, contracts and policy timing can produce different cumulative losses even when both economies reach the same endpoint.''',
}
revisions=[]
for (g,n),text in variants.items():
    id=groups[g][n];parts=text.splitlines();assert len(parts)==6,(g,n)
    task(id,parts[0],parts[1:5],parts[5],error='Incorrect inference: '+parts[2],operation='analysis')
    PROOFS.pop(id,None)
    revisions.append({'id':id,'group':g,'operation':'Different condition, counterfactual, reverse inference or causal diagnosis; no decorative numerical variant.'})
assert len(variants)==sum(len(g)-1 for g in groups)
extra={
 (4,1):[('4-5',-1),('4-4',0)],
 (8,1):[('(1/(1.05*.95)-1)*100',.2506265664)],
 (12,1):[('4+.5*(3-5)',3)],
 (12,2):[('5+(4-4)/.5',5),('4-.5*(3-5)',5)],
 (15,1):[('(1/1.05-1)*100',-4.761904762)],
 (15,2):[('1.1/1.1',1)],
 (16,1):[('1.06/1.06',1)],
}
for (g,n),expr in extra.items():PROOFS[groups[g][n]]={'expressions':expr,'basis':'Fresh visible-value recomputation for the differentiated checkpoint operation.'}
for g,n in [(8,1),(12,1),(12,2)]:patch(groups[g][n],type='multi-step')
save()
(INPUTS/'context_differentiation.json').write_text(json.dumps({'affectedIDs':[i for g in groups for i in g],'contextRemovedRetainedInference':[g[0] for g in groups],'substantiveVariants':revisions},indent=2)+'\n',encoding='utf8')
print('Removed inert context from',sum(map(len,groups)),'tasks; differentiated',len(revisions),'repeated operations.')
