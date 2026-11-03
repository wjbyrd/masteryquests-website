from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];TESTS=ROOT/'build/faculty-build-composer/tests'
(HERE/'apply.cjs').write_text((HERE.parent/'medium_revision_20261102/apply.cjs').read_text(encoding='utf8').replace("'primarySkill','secondaryConceptIds'","'primarySkill','secondaryConceptIds','commonError'"),encoding='utf8')
s=(TESTS/'medium-review-revisions.js').read_text(encoding='utf8').replace(" current=require('./repair-review-revisions.js').beforeRepairReview(current);\n",'').replace('medium_revision_20261102','review20_followup_20261103').replace('beforeMediumReview','beforeReview20').replace('mediumReviewLedger','review20Ledger').replace('seen.size,189','seen.size,changes.size')
(TESTS/'review20-revisions.js').write_text(s,encoding='utf8')
p=TESTS/'medium-fiscad-clarity-revisions.js';s=p.read_text(encoding='utf8');assert 'review20-revisions' not in s
p.write_text(s.replace('function beforeMediumFiscadClarity(current){',"function beforeMediumFiscadClarity(current){\n current=require('./review20-revisions.js').beforeReview20(current);"),encoding='utf8')
with (TESTS/'faculty-validation-revisions.js').open('a',encoding='utf8') as f:f.write("\nmodule.exports=require('./review20-revisions.js').wrap(module.exports);\n")
print('Prepared placement-aware patch and historical regression adapter.')
