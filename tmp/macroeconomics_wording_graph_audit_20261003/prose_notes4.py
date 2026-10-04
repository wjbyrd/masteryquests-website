import json
from pathlib import Path
p=Path(__file__).parent;n=json.loads((p/'review_notes.json').read_text())
def w(i,t):n['wording_candidates'][i]=t
def a(ids,t):
 for i in ids.split():n['advanced_candidates'][i]=t
w('ECON-EC-EASYBOSS-17011','Recommended family: For domestic GDP, which ledger is correct? uses a bookkeeping metaphor for a production-location classification; ask which output counts in domestic GDP.')
w('ECON-NL-INCOME-EXPENDITURE-IDENTITY-6000','Recommended: compressed wages $140 and rent/interest $30, and income ledger; use wages of / rent and interest of, and income account.')
w('LG-Q-355','Clear: best elite-level correction is assessment-author language; remove the tier announcement and ask the economic correction.')
w('LG-Q-254','Recommended: shoe-leather, menu, tax, signal, and redistribution costs is a compressed catalog; use ordinary names for tax distortions and distorted relative-price signals, keeping the cost distinctions.')
w('ECON-SP-HARD-269','Clear: Which answer best connects Chapters 34 and 36 depends on textbook chapter numbers instead of identifying AD-AS and Phillips curves; name the models directly.')
w('ECON-SP-FINALBOSS-4023','Recommended: approximate growth accounting conventionally evokes factor contributions to real-output growth, while this item uses growth rates in MV=PY. Name the quantity-equation growth approximation, preserving the existing equations.')
w('PMOE-TX-B3-001','Recommended: trade ledger / reconciles the ledgers are unnecessarily bookkeeping-like; use reported trade figures / reconcile the accounts.')
w('ECON-NL-FINALBOSS-4022','Recommended family: Longer search raises frictional costs; better retention adds benefits; welfare needs both reads as compressed notes. Use complete parallel alternatives comparing search costs with improved job matches.')
w('ECON-NL-FINALBOSS-4026','Recommended: ten unfilled requests is unnatural language for workers unable to find jobs; name the remaining labor surplus or jobseekers.')
w('PM2B4-LMI-BR-001','Clear: What family-level implication follows? is internal assessment taxonomy. Ask how faster matching affects frictional unemployment and the natural rate.')
a('ECON-NL-LEGENDARYBOSS-9102 ECON-NL-LEGENDARYBOSS-9107 ECON-NL-LEGENDARYBOSS-9101','An ordinary GDP inclusion/exclusion task repeats an easier family with altered values. The advanced demand is mainly an extra subtraction or amount. Require reconciliation of incomplete production/income records or diagnosis of a non-obvious double-counting claim.')
a('ECON-NL-LEGENDARY-9035 ECON-NL-LEGENDARY-9036 PM2B2-INDEX-L-003','Sequential index adjustments or recovery of a missing index provide arithmetic volume. Preserve purchasing-power/indexation reasoning; require evaluating a lagged contract against a counterfactual household basket or identifying a missing assumption.')
a('ECON-NL-LEGENDARYBOSS-9113 PM2B2-INDEX-LB-001','Repeats the easy indexation-lag family with only benefit dollars changed. Require diagnosing which of adjustment timing and basket mismatch accounts for an observed real loss, instead of another direct percentage-ratio calculation.')
a('LG-Q-9120 LG-Q-9125','Bundles two familiar inflation-cost classifications, repeating an easy/medium family with a different unused dollar amount. Require evaluating a contract-indexation proposal against residual resource costs or distinguishing private transfers from a measured social cost.')
a('LG-Q-9124 PM2C2-ITAX-LB-001 LG-Q-9121','Routine inverse-price arithmetic or a familiar inflation-tax classification repeats lower-tier variants with changed dollar amounts. Require diagnosing the erosion of the real-money tax base or a counterfactual financing comparison.')
a('ECON-SP-FINALBOSS-4015 ECON-SP-MEDIUMBOSS-3008 ECON-SP-LEGENDARYBOSS-9106','Potential and actual output changes are explicitly supplied; two subtractions do almost all the work despite the policy-diagnosis wording. Require inferring capacity versus demand contributions from independent evidence or testing an output-target counterfactual.')
n.setdefault('incidental_candidates',{})['PM2E-CH-FINAL-002']='A is keyed, but C also correctly states that restraining AD reduces inflation while potentially lowering output further before the supply problem is resolved. The question asks why stabilization is harder; C supplies a valid part of exactly that tradeoff. Make the rival economically distinct rather than a true subset of A; do not change the key in this read-only audit.'
n['remaining_packets_reviewed']=list(range(1,25));n['shared_stem_only_packets']=[22,23]
(p/'review_notes.json').write_text(json.dumps(n,indent=2),encoding='utf8')
