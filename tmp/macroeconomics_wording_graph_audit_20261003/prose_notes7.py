import json
from pathlib import Path
p=Path(__file__).parent;n=json.loads((p/'review_notes.json').read_text())
def w(i,t):n['wording_candidates'][i]=t
def a(ids,t):
 for i in ids.split():n['advanced_candidates'][i]=t
w('ECON-SP-MEDIUMBOSS-3012','Clear family: percentages of one year\'s output $100 lacks of and supplies an unused benchmark dollar value. State the common annual-output benchmark in a complete phrase; preserve the cumulative-loss calculation.')
w('PM2A-SAC-LB-024','Clear: A3-point lacks a space. Also replace which claim ... survives with a direct question about the feasible remaining disinflation and total loss.')
w('43192','Clear: Using the same economy has no preceding case in a standalone item. Remove that reference; the necessary private/public saving figures are already supplied.')
w('43168','Recommended family: Which national-accounts distinction and financing inference are correct? sounds like a rubric. Ask which purchases count as investment in GDP and how saving can finance investment.')
w('P52A-AS-B2-003','Recommended: identifies the axis-variable error is assessment jargon. Ask why the analyst should show a movement along SRAS rather than a curve shift.')
w('LG-R-5056','Recommended: What problem should the student diagnose? speaks about the test taker rather than the economy. Ask what risk the delayed stimulus creates.')
w('LG-R-5058','Recommended: what tradeoff should the student remember is assessment language. Ask what tradeoff policymakers face.')
w('ECON-NL-LEGENDARY-9067','Recommended: outsiders for people outside the labor force is not standard labor-statistics language and can suggest nonresidents. Use adults previously outside the labor force.')
w('ECON-NL-LEGENDARY-9068','Recommended: outsiders for people outside the labor force is not standard labor-statistics language and can suggest nonresidents. Use adults previously outside the labor force.')
w('ECON-NL-FINALBOSS-4039','Recommended: An economist synthesizes this evidence and What is the combined lesson announce integration instead of asking the economics. Ask what the observations reveal about labor-market conditions, retaining all three distinctions.')
a('PM2A-SAC-LB-023','The same summation and denominator correction appears in an easy checkpoint; the advanced version changes only an unused annual-output dollar amount. Preserve cumulative loss versus final-year loss and inflation reduction versus level; require reconstructing an unobserved stage or revising a policy after an unexpected loss under a remaining budget.')
a('43177','The advanced item repeats the easy financial-asset-versus-new-equipment classification with different unused dollar amounts. Preserve the financing versus GDP-investment distinction; require tracing financing and production across periods or reconciling a mix of new assets, existing assets and inventory changes.')
a('43191','The task consists of three direct saving-identity differences with initial levels that are unnecessary for those differences. Preserve private/public/national saving; require inferring a household-consumption response from an observed saving outcome or evaluating whether fiscal offsets neutralize a loanable-funds effect.')
a('P52A-AS-EL-004','The abstract correction asks only the familiar movement-versus-shift rule, with three swaps of that rule. Preserve actual versus expected prices; require reconciling an observed output change with contract timing or separating two mechanisms that can produce the same observed price level.')
a('P52A-AS-LB-002','A two-stage sequence is recalled directly; three alternatives conflate curves or reverse the standard adjustment. Preserve sticky-wage short-run movement versus later expectation-driven shift; require a counterfactual with different contract timing or infer which stage a set of observations represents.')
a('ECON-EC-LEGENDARYBOSS-20020','The item repeats an easier catch-up caveat with only worker count changed; the correct answer is the sole qualified claim while alternatives assert guarantees or irrelevancies. Preserve diminishing returns and conditional catch-up; require evaluating two countries with different investment or complementary-input constraints.')
a('LG-Q-9135','The advanced item repeats easy automatic-versus-discretionary policy classification with a different unused tax amount. Preserve the institutional distinction; require separating automatic and discretionary portions of an observed budget change or evaluating timing under a reversal.')
a('LG-Q-9140','The task subtracts two supplied total AD effects and states that the smaller partly offsets the larger, duplicating an easy-family item. Preserve fiscal-monetary coordination; require choosing an adjustable policy response after one channel or the target changes.')
a('ECON-NL-LEGENDARY-9067 ECON-NL-LEGENDARY-9068','Several supplied worker flows are booked into standard categories and two ratios are calculated. The burden is accounting volume rather than economic inference. Preserve labor-force classification and participation versus unemployment; require inferring unobserved flows or testing whether the same headline-rate change can arise from hiring and discouraged exits.')
n['remaining_packets_reviewed']=list(range(1,51));n['all_remaining_choices_reviewed']=True
(p/'review_notes.json').write_text(json.dumps(n,indent=2),encoding='utf8')
