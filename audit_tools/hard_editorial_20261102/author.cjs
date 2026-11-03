'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const core=require('../../build/faculty-build-composer/composer-core.js'),inventory=require('./inventory.json');
const byId=new Map(inventory.items.map(r=>[r.id,r])),decisions=new Map(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function keep(ids,reason){for(const id of ids){assert(byId.has(id),id);assert(!decisions.has(id),'Duplicate decision '+id);decisions.set(id,{id,action:'retain',reason});}}
function edit(id,patch,reason){assert(byId.has(id),id);assert(!decisions.has(id),'Duplicate decision '+id);assert(Object.keys(patch).every(k=>['q','options','feedback','hint'].includes(k)),id);decisions.set(id,{id,action:'revise',patch,reason});}
function optionEdit(id,q,correct,wrong,feedback,reason){const item=byId.get(id),options=[...wrong];assert.equal(options.length,3);options.splice(item.correctIndex,0,correct);const patch={options};if(q!==null)patch.q=q;if(feedback!==undefined)patch.feedback=feedback;edit(id,patch,reason);}
for(const name of fs.readdirSync(__dirname).filter(n=>/^batch-.*\.cjs$/.test(n)).sort())require('./'+name)({keep,edit,optionEdit,byId,items:inventory.items});
if(!process.argv.includes('--partial'))assert.equal(decisions.size,inventory.count,'Every Hard item needs a retained or revised decision');
const changes=[];
for(const item of inventory.items){const d=decisions.get(item.id);if(!d||d.action==='retain')continue;const before=item.question,after={...structuredClone(before),...d.patch};
 // Expansion of a sentence-initial acronym must retain its initial capital.
 const capital=s=>s.replace(/(?<!\b[A-Z])\. ([a-z])/g,(m,c)=>'. '+c.toUpperCase());
 after.q=capital(after.q);after.options=after.options.map(capital);
 assert.equal(after.options.length,4,item.id);assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4,item.id);
 if(d.patch.options)after.aHash=sha(core.normalizeAnswerText(after.options[item.correctIndex]));
 assert.equal(sha(core.normalizeAnswerText(after.options[item.correctIndex])),after.aHash);
 assert(!/\blearners?\b/i.test([after.q,...after.options].join(' ')),item.id);
 const fields=Object.keys(after).filter(k=>core.stableStringify(after[k])!==core.stableStringify(before[k]));assert(fields.length,'No actual change '+item.id);
 changes.push({id:item.id,beforeRecord:before,afterRecord:after,correctIndex:item.correctIndex,fields,reason:d.reason});
}
const report={schemaVersion:1,beforeLibrarySha256:inventory.beforeLibrarySha256,audited:decisions.size,retained:decisions.size-changes.length,changes,decisions:inventory.items.filter(i=>decisions.has(i.id)).map(i=>{const {patch,...d}=decisions.get(i.id);return d;})};
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({audited:report.audited,revised:changes.length,retained:report.retained,remaining:inventory.count-decisions.size}));
