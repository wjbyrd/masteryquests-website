import json
from pathlib import Path
p=Path(__file__).parent;n=json.loads((p/'review_notes.json').read_text())
def w(i,t):n['wording_candidates'][i]=t
def a(ids,t):
 for i in ids.split():n['advanced_candidates'][i]=t
w('LG-Q-4001','Recommended: sign the rate change is compressed mathematical jargon; ask what information determines whether the rate rises or falls.')
w('PM2C3-LPMM-BR-001','Clear: if the student is bridging from the money market to monetary-policy transmission describes the assessment design. Ask how the higher rate affects investment and aggregate demand.')
w('ECON-NL-RULE-OF-70-5032','Recommended: Which doubling-time question can be answered with the Rule of 70? gives away the requested function and leaves the alternatives grammatically mismatched. Ask what the rule estimates, without announcing doubling time.')
w('ECON-SP-IDENTIFY-LRAS-6021','Clear: A110-unit and A10-unit in choices lack spaces; restore ordinary articles and spacing without changing magnitudes or gap classifications.')
w('LG-Q-9024','Clear: Chapter 30 is an unsupported course-text reference; name the banking/money-creation model directly.')
w('ECON-SP-LEGENDARY-9027','Recommended: What correction survives? is an artificial metaphor; ask how inflation changes the conclusion about real wages.')
w('LG-Q-2011','Recommended family: deposits $1400 and reserves $280 omits prepositions; use deposits of / reserves of and keep the hypothetical reserve-ratio scope.')
w('P52B-S3-MPT-B2-001','Recommended family: avoids assigning a mechanical loan-growth result is authoring language, and holding incentives strengthen is compressed. Ask what can be concluded about lending, retaining reserve capacity versus incentives.')
w('LG-Q-4005','Clear family: supplies 40 of reserves omits a unit; express the amount as reserves measured in stated dollars/units consistent with the source, without altering transmission.')
n.setdefault('incidental_candidates',{})['LG-Q-358']='No image is attached, and MD1 to MD2 does not state whether money demand shifts right or left. Both rising rates/falling investment and falling rates/rising investment are possible. Supply a direction or a verified figure in a later authorized repair; the label number alone is not economic evidence.'
a('ECON-NL-LEGENDARY-9047','Two routine deflations and per-person calculations create the apparent difficulty. Preserve nominal versus real and population normalization but require evaluating incompatible rankings or identifying when base-price comparability is missing.')
a('LG-Q-9107','The calculation divides the target contraction by the supplied actual multiplier, repeating an easy family at a new dollar amount. Retain the actual-versus-maximum distinction; require diagnosing an observed miss or comparing uncertain multiplier scenarios.')
a('LG-Q-9113','Computes before/after required reserves and appends the generic statement that actual lending depends on behavior. Preserve the reserve-versus-credit distinction; require identifying which constraint binds or reconciling two banks with different actual outcomes.')
n['remaining_packets_reviewed']=list(range(1,34));(p/'review_notes.json').write_text(json.dumps(n,indent=2),encoding='utf8')
