'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const core=require('../../build/faculty-build-composer/composer-core.js'),inventory=require('./inventory.json');
const decisions=new Map(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function K(numbers,reason){for(const n of numbers){assert(!decisions.has(n));decisions.set(n,{n,id:inventory.items[n-1].id,action:'retain',reason});}}
function R(n,q,correct,w1,w2,w3,feedback){assert(!decisions.has(n));const item=inventory.items[n-1],options=[w1,w2,w3];options.splice(item.correctIndex,0,correct);decisions.set(n,{n,id:item.id,action:'revise',reason:'Apply the concept to a short situation through a manageable decision, comparison, or calculation that prepares the student to return to the learning outcome.',patch:{q,options,feedback,type:'application',aHash:sha(core.normalizeAnswerText(correct))}});}
function S(n,q){assert(!decisions.has(n));const item=inventory.items[n-1];decisions.set(n,{n,id:item.id,action:'revise',reason:'Preserve the bounded application and explicitly identify its market structure so it stands alone in a mixed-topic quest.',patch:{q}});}
for(const name of fs.readdirSync(__dirname).filter(n=>/^batch-\d+\.cjs$/.test(n)).sort())require('./'+name)({K,R,S});
if(!process.argv.includes('--partial'))assert.equal(decisions.size,inventory.count,'Every Bridge question must have an editorial decision');
const changes=[];
for(const d of [...decisions.values()].sort((a,b)=>a.n-b.n)){
 const item=inventory.items[d.n-1],before=item.question;if(d.action==='retain')continue;
 const after={...structuredClone(before),...d.patch};
 // A revised stem needs an explanation and hint aligned with the new situation.
 if(Object.hasOwn(before,'hint'))after.hint='Apply '+item.question.primarySkill.replaceAll('_',' ')+' to the information given; focus on the change or decision being asked about.';
 assert.equal(after.options.length,4);assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4,item.id);
 assert.equal(sha(core.normalizeAnswerText(after.options[item.correctIndex])),after.aHash);
 assert.equal(after.instructionalRole,'bridge');
 const fields=Object.keys(after).filter(k=>core.stableStringify(after[k])!==core.stableStringify(before[k]));assert(fields.length,item.id);
 changes.push({id:item.id,beforeRecord:before,afterRecord:after,correctIndex:item.correctIndex,fields,reason:d.reason,outcomeIds:item.outcomes.map(o=>o.id),repairIds:item.repairIds});
}
const report={schemaVersion:1,beforeLibrarySha256:inventory.beforeLibrarySha256,audited:decisions.size,retained:decisions.size-changes.length,changes,decisions:[...decisions.values()].sort((a,b)=>a.n-b.n).map(({patch,...d})=>d)};
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({audited:report.audited,revised:changes.length,retained:report.retained,remaining:inventory.count-decisions.size}));
