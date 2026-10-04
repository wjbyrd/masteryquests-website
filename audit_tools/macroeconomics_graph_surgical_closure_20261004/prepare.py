from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
OLD=ROOT/'audit_tools/macroeconomics_student_wording_cleanup_20261004'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
write=lambda p,x:p.write_text(json.dumps(x,indent=2)+'\n',encoding='utf-8')
originals=read(HERE/'originals.json')
patches={i:{k:q[k] for k in ('q','options','feedback')}|{'correct_index':0} for i,q in originals.items()}
patches['ECON-SP-ELITE-320'].update(
 q='An increase in government purchases raises aggregate demand through direct spending and additional spending induced by it. The curves show demand before the policy, after the direct effect only, and after both effects, excluding crowding out. Use the horizontal distances as drawn at price P. A positive amount of crowding out then reduces the total demand increase. Which bound on that reduction keeps final demand strictly between AD2 and AD3, and why?',
 options=[
  'Less than about one-half of the total demand increase before crowding out; this leaves some of the induced-spending gain beyond the direct effect.',
  'Less than about one-half of the total demand increase before crowding out; this leaves the entire induced-spending gain intact.',
  'Less than about three-quarters of the total demand increase before crowding out; this leaves some of the induced-spending gain beyond the direct effect.',
  'Less than the entire demand increase before crowding out; any positive net stimulus leaves demand in the required region.'
 ],
 feedback='The expansion places initial demand at AD1, the direct effect at AD2, and the direct plus induced effects at AD3. At price P, the induced-spending distance Y2 to Y3 is about half of the full increase Y1 to Y3. Crowding out moves final demand left from AD3. Its reduction must be positive but smaller than Y3 minus Y2 to leave demand strictly between AD2 and AD3. Some induced-spending gain remains, but it is not entirely intact. A reduction smaller than the full Y1-to-Y3 increase guarantees only a positive net stimulus, not demand beyond AD2.'
)
patches['P62D-ITP-L-095'].update(
 options=[originals['P62D-ITP-L-095']['options'][0],
  'Consumers lose $500k; producers gain $150k; government gets $200k; net welfare falls $150k',
  'Consumers lose $450k; producers gain $150k; government gets $100k; net welfare falls $200k',
  'Consumers lose $450k; producers gain $100k; government gets $200k; net welfare falls $150k'],
 feedback='The tariff raises price from $4 to $6. Quantities are in thousands: consumption falls from 250 to 200, while domestic production rises from 50 to 100. Consumer surplus falls by $2 x (250 + 200) / 2 = $450k; producer surplus rises by $2 x (50 + 100) / 2 = $150k. Post-tariff imports are 200 - 100 = 100 thousand, so revenue is $2 x 100 = $200k. Net welfare changes by -$450k + $150k + $200k = -$100k, the sum of the two $50k distortion triangles.'
)
patches['P62D-ITP-L-098'].update(
 options=[originals['P62D-ITP-L-098']['options'][0],
  'Consumers lose $825k; producers gain $337.5k; quota rents are $150k; net welfare falls $337.5k',
  'Consumers lose $712.5k; producers gain $337.5k; quota rents are $225k; net welfare falls $150k',
  'Consumers lose $712.5k; producers gain $225k; quota rents are $150k; net welfare falls $337.5k'],
 feedback='The quota raises price from $3 to $6. Quantities are in thousands: consumption falls from 275 to 200, while domestic production rises from 75 to 150. Consumer surplus falls by $3 x (275 + 200) / 2 = $712.5k; producer surplus rises by $3 x (75 + 150) / 2 = $337.5k. Imports under the quota are 200 - 150 = 50 thousand, so rents are $3 x 50 = $150k. Domestic license holders receive those rents, making the net welfare change -$712.5k + $337.5k + $150k = -$225k, the sum of the two $112.5k distortion triangles.'
)
reviews={
 'ECON-SP-ELITE-320':{
  'reason':'The original stem supplied the curve roles and bound, allowing a purely verbal answer.',
  'graph_information':'AD1, AD2 and AD3 intersections with price P; Y2-to-Y3 is approximately one-half of Y1-to-Y3. The graph supplies the relative spacing, not an assumed numerical multiplier.',
  'economic_reasoning':'Identify the rightward direct and induced demand effects, subtract crowding out from the full increase, and require 0 < C < Y3 - Y2. Distinguish preserving some induced-spending gain from preserving all of it or merely preserving a positive net stimulus.',
  'bypass_prevention':'A and C make the same economic claim but use different graph-dependent bounds; A and B use the same plotted share but differ in whether crowding out offsets some induced spending. Thus neither graph reading alone nor theory alone selects A.',
  'graph_checks':{'hidden_graph_key_identifiable':'NO','coordinates_alone_sufficient':'NO','graph_test':'PASS','construct_test':'PASS','plausible_without_graph':['A','C']},
  'numerical_verification':'PASS: no absolute GDP values supplied by the graph. The drawn induced distance is approximately half the full shift; the exact condition remains 0 < C < Y3 - Y2. Endpoints C=0 and C=Y3-Y2 are excluded.',
  'distractor_sources':{'B':'Same plotted bound but incorrectly treats induced spending as wholly unaffected by positive crowding out.','C':'Allows a reduction up to three-quarters of the full shift, exceeding the plotted induced-spending distance.','D':'Uses the total expansion as the bound, confusing positive net stimulus with remaining to the right of AD2.'}
 },
 'P62D-ITP-L-095':{
  'reason':'Positive-welfare and inconsistent-accounting alternatives allowed tariff theory to select A without graph magnitudes.',
  'graph_information':'Prices 4 and 6; domestic supply 50 then 100 thousand; domestic demand 250 then 200 thousand; post-tariff imports 100 thousand.',
  'economic_reasoning':'Use consumer-loss and producer-gain trapezoids, tariff times post-tariff imports for revenue, and sum the domestic welfare changes; the loss equals both distortion triangles.',
  'bypass_prevention':'All four alternatives have consumer losses, producer gains, positive tariff revenue, negative net welfare, and exact welfare identities. Each incorrect component comes from a plausible area/width mistake and is carried into net welfare.',
  'graph_checks':{'hidden_graph_key_identifiable':'NO','coordinates_alone_sufficient':'NO','graph_test':'PASS','construct_test':'PASS','plausible_without_graph':['A','B','C','D']},
  'numerical_verification':'PASS: consumer loss 2*(250+200)/2=450; producer gain 2*(50+100)/2=150; revenue 2*(200-100)=200; loss 450-150-200=100. All amounts in $thousands. Two distortion triangles each equal 2*50/2=50.',
  'distractor_sources':{'B':'Use the original consumption rectangle 2*250=500 rather than the 450 trapezoid; carry the extra 50 into welfare loss.','C':'Use pre-tariff domestic production 50 as the revenue width instead of post-tariff imports 100; revenue 100 and welfare loss 200.','D':'Use the original production rectangle 2*50=100, omitting the 50 producer-gain triangle; welfare loss 150.'}
 },
 'P62D-ITP-L-098':{
  'reason':'Positive-welfare or zero-loss alternatives let standard quota theory isolate A without using the graph.',
  'graph_information':'Prices 3 and 6; domestic supply 75 then 150 thousand; domestic demand 275 then 200 thousand; quota imports 50 thousand.',
  'economic_reasoning':'Calculate surplus changes as trapezoids and quota rents as the price gap times remaining imports; include domestic rents as a benefit and compute the residual deadweight loss.',
  'bypass_prevention':'Every alternative satisfies the welfare identity and shows losses to consumers, gains to producers, positive domestic rents and a positive deadweight loss. Graph magnitudes distinguish realistic component errors.',
  'graph_checks':{'hidden_graph_key_identifiable':'NO','coordinates_alone_sufficient':'NO','graph_test':'PASS','construct_test':'PASS','plausible_without_graph':['A','B','C','D']},
  'numerical_verification':'PASS: consumer loss 3*(275+200)/2=712.5; producer gain 3*(75+150)/2=337.5; rents 3*(200-150)=150; loss 712.5-337.5-150=225. All amounts in $thousands. Two distortion triangles each equal 3*75/2=112.5.',
  'distractor_sources':{'B':'Use the original consumption rectangle 3*275=825 instead of the 712.5 trapezoid; carry the extra 112.5 into welfare loss.','C':'Use pre-quota domestic production 75 as the rent width instead of remaining imports 50; rents 225 and welfare loss 150.','D':'Use the original production rectangle 3*75=225, omitting the 112.5 producer-gain triangle; welfare loss 337.5.'}
 }
}
write(HERE/'patches.json',patches);write(HERE/'reviews.json',reviews)
for name in ['apply.cjs','verify.cjs','export_fidelity.py','pdf_qa.py']:
 text=(OLD/name).read_text(encoding='utf-8').replace(OLD.name,HERE.name)
 if name=='verify.cjs':text=text.replace('macroeconomics-student-wording-approved-revisions.js','macroeconomics-graph-closure-approved-revisions.js')
 (HERE/name).write_text(text,encoding='utf-8')
tests=ROOT/'build/faculty-build-composer/tests'
helper=(tests/'macroeconomics-student-wording-approved-revisions.js').read_text(encoding='utf-8')
helper=helper.replace('Bounded 128-ID student wording approval','Bounded 3-ID graph-assessment closure approval').replace("require('./macroeconomics-editorial-approved-revisions.js')","require('./macroeconomics-student-wording-approved-revisions.js')").replace(OLD.name,HERE.name).replace('ids.size,128','ids.size,3').replace('macroStudentWordingLedger:ledger','macroGraphClosureLedger:ledger')
(tests/'macroeconomics-graph-closure-approved-revisions.js').write_text(helper,encoding='utf-8')
for name in ['composer-audit-contracts.js','run_macro_phase2_taxonomy_validation.mjs','run_fading_fortune_validation.js','run_content_scope_validation.js','run_phase3e_graph_question_sync_validation.mjs','run_risk_reward_validation.js','run_question_bank_comprehensive_validation.mjs','run_trial_by_graph_validation.js']:
 p=tests/name;text=p.read_text(encoding='utf-8');assert 'macroeconomics-student-wording-approved-revisions.js' in text
 p.write_text(text.replace('macroeconomics-student-wording-approved-revisions.js','macroeconomics-graph-closure-approved-revisions.js'),encoding='utf-8')
print('Prepared exact three-ID patches and appended approval layer; canonical write remains separate.')
