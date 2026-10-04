import json
from pathlib import Path
p=Path(__file__).parent;n=json.loads((p/'review_notes.json').read_text())
def a(ids,why):
 for i in ids.split():n['advanced_candidates'][i]=why
def w(i,why):n['wording_candidates'][i]=why
w('43122','Recommended: Which fiscal-data comparison keeps debt service concepts distinct? describes test design; ask which payment is interest and how principal repayment affects debt.')
w('43151','Recommended: at an introductory level is assessment-author language; ask directly how a deficit affects borrowing and accumulated debt under the stated assumptions.')
w('43326','Recommended: investment-to-capital-formation relationship explains is an awkward recursive noun phrase; ask how investment affects productive capacity and what it cannot establish alone.')
w('43302','Recommended: stays within the loanable-funds mechanism rather than importing multiplier analysis sounds like instructions to an item writer; state the model and ask about saving, interest and investment.')
w('ECON-NL-EASYBOSS-2018','Recommended family: next CPI-point increase / next inflation rate and Which pair corrects it? are compressed; clearly distinguish next-year index-point change from percentage inflation.')
w('ECON-NL-EASYBOSS-2019','Recommended family: base comparison period ambiguously evokes the index base year even though the index is 125; call it the initial period and retain the 125-to-130 comparison.')
w('ECON-NL-LEGENDARY-9028','Recommended: basket agency is unnatural; statistical agency or researchers is clearer without changing the substitution-bias test.')
w('ECON-NL-EASYBOSS-2025','Recommended family: Which real-outcome comparison follows under these estimates? is assessment jargon; ask how indexation affects purchasing power under the estimates.')
w('PM2B2-BIAS-FB-005','Recommended family: quality-aware comparison is contrived; ask how the price increase should be interpreted after allowing for the improved service.')
w('ECON-NL-EASYBOSS-2028','Recommended family: Which index selection and direction are appropriate is unnatural; ask what happens to CPI and the GDP deflator.')
w('ECON-NL-EASYBOSS-2029','Recommended family: Which pairing and implication are supported? is a vague authoring ending; ask which index belongs to each use and why their movements can differ.')
a('ECON-NL-LEGENDARY-9023 ECON-NL-LEGENDARY-9025 P52A-CPI-LB-002','Apparent complexity comes from reconstructing basket costs and then performing routine index/percentage calculations. Preserve CPI versus inflation and weights; require evaluating competing explanations, a rebasing claim, or what cannot be inferred from incomplete price/weight data.')
a('P52A-CPI-LB-001 ECON-EC-LEGENDARYBOSS-20000 ECON-NL-LEGENDARYBOSS-9108','A routine nominal/real or index-point correction is repeated from an easy/medium family with only the dollar amount changed. Preserve the economic measurement distinction but require a new conditional comparison or reconcile conflicting index evidence.')
a('ECON-NL-ELITE-331 PM2B2-DEF-L-002 ECON-NL-LEGENDARYBOSS-9111 PM2B2-DEF-LB-001','Combines ordinary index selection or two direct nominal/real calculations without a substantive inference. Keep CPI versus GDP-deflator coverage but require diagnosing apparently conflicting series or testing a claim when weights/composition change.')
a('43089','Two simple debt/GDP ratios and a stock-level comparison supply all the work. Preserve stock-versus-ratio reasoning but ask what borrowing/GDP combinations would reconcile an observed ratio change or invalidate a fiscal claim.')
n['remaining_packets_reviewed']=list(range(1,8))
(p/'review_notes.json').write_text(json.dumps(n,indent=2),encoding='utf8')
