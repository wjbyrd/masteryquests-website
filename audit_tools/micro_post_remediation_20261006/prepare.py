import json
from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parent.parent;P=H.parent/'micro_faculty_remediation_20261006'
U={r['id']:r for r in json.loads((H/'review-universe.json').read_text())}
patches={}
def tier(id,to,why,explicit=False):
 patches[id]={'difficulty':to,'canonicalDifficulty':to,'rationale':[why],'category':'EXPLICIT FACULTY TIER' if explicit else 'POST-REMEDIATION DIFFICULTY DRIFT'}
tier('42876','easy','Direct faculty decision resolves the previous Medium classification; one subtraction, $100 minus $600.',True)
tier('P62G-MON-H-009','elite','Direct faculty decision: infer the highest possible price from the inverse-demand intercept, compare demand and AVC functions over positive output, then apply shutdown. Equations retained.',True)
for id in ['42424','42436']:tier(id,'medium','Remediation replaced a supplied marginal product with two total-output observations. First derive marginal product, then multiply by product price; two linked operations replace one.')
tier('42780','medium','Remediation added total income and asks for dollars: sum the four shares, complement to obtain the remaining share, then multiply by total income.')
tier('42928','medium','Replacement adds a selection alternative to the deductible story. Distinguish changes in pool membership from changed behavior before identifying supporting evidence.')
tier('42932','medium','Replacement adds reimbursement by a second party: infer that the deductible is neutralized, then apply the precaution-incentive mechanism.')
tier('42936','medium','Replacement adds numerical insurance alternatives: determine the customer-borne loss under each contract, then compare the $20 avoided deductible with $10 care.')
for id in ['P62B-ELAS-L-076','P62B-ELAS-L-077','P62B-ELAS-L-078']:tier(id,'hard','Midpoint replacement requires evaluating the supply function at prices, finding average bases and percentage changes, then comparing their ratio (two intervals for L-078). Several linked steps exceed the retained Medium tier; calculus remains absent.')
tier('P62G-MON-L-033','elite','Qualitative cost-shift task became two algebraic monopoly equilibria: adjust marginal cost for tax, solve MR=MC, substitute into demand and compare prices/output. Retained equations add substantial mathematical and economic integration.')
tier('P62F-PC-E-042','medium','Remediation removed the supplied $40 price and MR=MC cue. The student must now find market price, transfer it to the firm and select rising MC output rather than read a supplied-price crossing.')
def content(id,why,**fields):patches[id]={**fields,'rationale':[why],'category':'POST-REMEDIATION CONTENT REGRESSION'}
content('42926','Replacement inferred adverse selection without specifying that risk is privately known. Supply that missing informational condition.',q='Drivers privately know their preexisting accident risk, which the insurer cannot observe. High-risk drivers are more likely to buy insurance, but no driver changes behavior after buying it. Which conclusion follows?')
q=U['P62E-COP-R-014']['current'];opts=q['options'].copy();opts[3]='The same fixed cost is spread over more units.'
content('P62E-COP-R-014','Revised stem asks why AFC falls, but the retained key refers to an undefined gap and restates the result. Answer the revised causal question while preserving repair routing.',options=opts,feedback='Total fixed cost stays constant while it is divided among more units of output.')
for id in ['P62F-PC-H-004','P62F-PC-H-006','P62F-PC-H-009']:
 opts=[s.replace('1 units','1 unit') for s in U[id]['current']['options']]
 assert opts!=U[id]['current']['options']
 content(id,'Revised numerical variant introduced singular output with plural units. Correct only the unit agreement.',options=opts)
id='P75-TRADE-L-013';q=U[id]['current']
content(id,'Remediation inserted literal italic tags around m; the faculty PDF escapes non-table HTML. Use plain m so the retained variable is legible in every output.',q=q['q'].replace('<i>m</i>','m'),options=[s.replace('<i>m</i>','m') for s in q['options']])
(H/'patches.json').write_text(json.dumps(patches,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
old=(P/'apply.cjs').read_text()
start="""'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),data=path.join(cdir,'data');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=structuredClone,stable=core.stableStringify;
const base=path.join(__dirname,'baseline/build/faculty-build-composer/data');
const patches=read(path.join(__dirname,'patches.json')),universe=read(path.join(__dirname,'review-universe.json'));
const source=fs.readFileSync(path.join(base,'composer_library.js'),'utf8'),before=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)),lib=clone(before);
assert.equal(before.librarySha256,'c651fbb3a908b1fc27fd8bc9e23c415430d934ef0a52299442736d757c47b210');
const bRows=contracts.questionRecords(before),beforeMap=new Map(bRows.map(r=>[String(r.question.id),r.question])),newMap=new Map(),changes=[];
for(const [id,p]of Object.entries(patches)){
 const row=universe.find(r=>r.id===id);assert(row&&(row.originalRemediationRecordChanged||id==='42876'));assert.notEqual(row.state,'FACULTY PASS');
 const old=beforeMap.get(id);assert.deepEqual(old,row.current);const q=clone(old),key=row.key;
 for(const [f,v]of Object.entries(p)){if(['category','rationale'].includes(f))continue;assert(['q','options','feedback','difficulty','canonicalDifficulty'].includes(f));q[f]=clone(v);}
 q.aHash=sha(core.normalizeAnswerText(q.options[key]));assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);
 const fields=Object.keys(q).filter(f=>stable(q[f])!==stable(old[f]));assert(fields.length);
 changes.push({id,fields,beforeRecord:old,afterRecord:q,correctIndex:key,rationale:p.rationale,category:p.category});newMap.set(id,q);
}
"""
replace=old[old.index('for(const r of contracts.questionRecords(lib))'):old.index('for(const [id,p]of Object.entries(patches).filter')]
derive="const afterMap=new Map(contracts.questionRecords(lib).map(r=>[String(r.question.id),r.question]));\n"+old[old.index('const changedConcepts='):old.index('for(const [id,p]of Object.entries(patches).filter',old.index('const changedConcepts='))]
derive=derive.replace("path.join(__dirname,'baseline_composer_library_manifest.json')","path.join(base,'composer_library_manifest.json')").replace("path.join(__dirname,'baseline_faculty-outcomes.js')","path.join(base,'faculty-outcomes.js')")
tail=old[old.index('for(const [cid,record]of Object.entries(policy.concepts))'):old.index('const result={schemaVersion:1')]
tail=tail.replace('graphBytes.get(a.runtimePath)||','')
end="""const result={schemaVersion:1,beforeLibrarySha256:before.librarySha256,afterLibrarySha256:lib.librarySha256,changes,moves,metadataChanges,placementsBefore:placements(before),placementsAfter:placements(lib),assets:[]};
"""+old[old.index("const outputs={'composer_library.js'"):old.index("if(process.argv.includes('--write'))")]+"""
if(process.argv.includes('--write'))for(const [n,s]of Object.entries(outputs)){
 const actual=fs.readFileSync(path.join(data,n),'utf8');assert(actual===fs.readFileSync(path.join(base,n),'utf8')||actual===s,'Intervening change '+n);fs.writeFileSync(path.join(data,n),s);
}
console.log(JSON.stringify({changes:changes.length,moves:moves.length,hash:lib.librarySha256}));
"""
(H/'apply.cjs').write_text(start+replace+derive+tail+end,encoding='utf-8')
# Extend the exact approved-revision chain; its previous assertions remain intact.
helper=(R/'build/faculty-build-composer/tests/faculty-micro-remediation-approved-revisions.js').read_text()
prefix="""'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const prior=require('./faculty-micro-remediation-approved-revisions.js'),core=require('../composer-core.js');
const {questionRecords}=require('./composer-integrity-contracts.js');
const dir=path.resolve(__dirname,'../../../audit_tools/micro_post_remediation_20261006');
const ledger=JSON.parse(fs.readFileSync(path.join(dir,'expectations.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),stable=core.stableStringify;
const source=fs.readFileSync(path.join(dir,'baseline/build/faculty-build-composer/data/composer_library.js'),'utf8');
const baseline=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
assert.equal(baseline.librarySha256,'c651fbb3a908b1fc27fd8bc9e23c415430d934ef0a52299442736d757c47b210');
const changes=new Map(ledger.changes.map(c=>[c.id,c]));
assert.equal(changes.size,19);
for(const c of changes.values()){
 for(const f of ['primarySkill','repairSkill','objective','secondaryConceptIds','instructionalRole','sourcePool','originalSourcePool','originalBossTier','sourceHash','sourceOccurrences','checkpointPool','modeAllowlist','requiredConceptIds'])assert.deepEqual(c.afterRecord[f],c.beforeRecord[f],'Protected '+c.id+'.'+f);
 assert.equal(sha(core.normalizeAnswerText(c.afterRecord.options[c.correctIndex])),c.afterRecord.aHash);
 assert.equal(new Set(c.afterRecord.options.map(core.normalizeAnswerText)).size,4);
}
"""
body=helper[helper.index('function assertCurrentLibrary(current)'):helper.index('module.exports=')]
(R/'build/faculty-build-composer/tests/post-remediation-approved-revisions.js').write_text(prefix+body+"module.exports={...prior,approvedIds:new Set([...prior.approvedIds,...changes.keys()]),assertCurrentLibrary,applyApprovedRevisions,approvedQuestion,beforeApprovedRevisions,postRemediationLedger:ledger};\n",encoding='utf-8')
for p in (R/'build/faculty-build-composer/tests').iterdir():
 if p.suffix not in ['.js','.mjs'] or p.name in ['post-remediation-approved-revisions.js','faculty-micro-remediation-approved-revisions.js']:continue
 s=p.read_text();t=s.replace("require('./faculty-micro-remediation-approved-revisions.js')","require('./post-remediation-approved-revisions.js')")
 if p.name=='run_phase3e_graph_question_sync_validation.mjs':t=t.replace('micro.facultyMicroLedger])','micro.facultyMicroLedger, micro.postRemediationLedger])')
 if t!=s:p.write_text(t,encoding='utf-8')
s=(P/'run_tests.cjs').read_text().replace("path.join(__dirname,'baseline_tests.log')","path.join(__dirname,'../micro_faculty_remediation_20261006/baseline_tests.log')")
(H/'run_tests.cjs').write_text(s)
s=(P/'verify_publication.cjs').read_text().replace('tests/faculty-micro-remediation-approved-revisions.js','tests/post-remediation-approved-revisions.js').replace("path.join(__dirname,'baseline_composer_library.js')","path.join(__dirname,'baseline/build/faculty-build-composer/data/composer_library.js')").replace('const moved=approved.facultyMacroTransfers.map(m=>m.id)','const moved=[]')
s=s.replace("const comp=core.compose(current,recipe),oldComp=core.compose(prior,recipe);","const comp=core.compose(current,recipe),oldComp=core.compose(prior,recipe); if(a==='micro'){for(const [id,tier]of [['42876','easy'],['P62G-MON-H-009','elite']]){assert(comp.banks[tier].some(q=>core.idOf(q)===id));for(const [pool,qs]of Object.entries(comp.banks))if(pool!==tier)assert(!qs.some(q=>core.idOf(q)===id),id+' wrongly in '+pool);}}")
s=s.replace("if(a==='micro')fs.writeFileSync(path.join(__dirname,'micro-validation-game.html'),game.html);", "fs.writeFileSync(path.join(__dirname,a+'-validation-game.html'),game.html);")
(H/'verify_publication.cjs').write_text(s)
print('Prepared',len(patches),'narrow corrections')
