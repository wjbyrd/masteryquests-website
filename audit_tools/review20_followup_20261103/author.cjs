'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),core=require('../../build/faculty-build-composer/composer-core.js'),inventory=require('./inventory.json');
const items=new Map(inventory.items.map(r=>[r.id,r])),patches=new Map(),reasons=new Map(),retained=new Map();
function edit(id,patch,reason){assert(items.has(id),id);patches.set(id,{...patches.get(id),...patch});if(reason)reasons.set(id,[...reasons.get(id)||[],reason]);}
function rewrite(id,q,right,wrong,feedback,reason){const options=[...wrong];assert.equal(options.length,3);options.splice(items.get(id).correctIndex,0,right);edit(id,{q,options,feedback},reason);}
function keep(id,reason){assert(items.has(id));assert(!patches.has(id));retained.set(id,reason);}
for(const id of ['LG-Q-170','LG-Q-176','ECON-SP-MEDIUM-151','ECON-SP-MEDIUM-152','ECON-SP-TAX-CUT-AD-6033'])edit(id,{canonicalDifficulty:'easy'},'Apply the instructor’s request for Easy difficulty.');
for(const id of ['ECON-SP-MEDIUMBOSS-3000','ECON-SP-MEDIUMBOSS-3001','ECON-SP-MOVE-ALONG-SRPC-6041','ECON-MG-HARD-284','ECON-EC-MEDIUMBOSS-18023','ECON-EC-MEDIUMBOSS-18009','ECON-EC-MEDIUMBOSS-18010','P52B-S4-UNEM-B2-002']){
 const q=items.get(id).question,p={canonicalDifficulty:'hard'};if(q.instructionalRole==='boss'&&!q.isCheckpointChallenge)p.checkpointPool=q.checkpointPool||'mediumBoss';edit(id,p,'Apply the instructor’s request for Hard difficulty while preserving its existing checkpoint role.');
}
for(const name of ['labor-surplus','duplicates','macro-policy'])require('./'+name+'.cjs')({items,edit,rewrite,keep});
const changes=[],dispositions=[];
for(const item of items.values()){
 const before=item.question,after={...structuredClone(before),...patches.get(item.id)},idx=item.correctIndex;after.aHash=crypto.createHash('sha256').update(core.normalizeAnswerText(after.options[idx])).digest('hex');
 const fields=Object.keys(after).filter(k=>core.stableStringify(before[k])!==core.stableStringify(after[k]));assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4,item.id);
 const reason=fields.length?(reasons.get(item.id)||[]).join(' '):retained.get(item.id);assert(reason,'Unaddressed '+item.id);
 if(fields.length)changes.push({id:item.id,beforeRecord:before,afterRecord:after,correctIndex:idx,fields,reason});
 dispositions.push({id:item.id,topic:item.topic,priorStatus:item.review['Review status'],note:item.review.Notes,action:fields.length?'revised':'already-addressed',targetDifficulty:fields.includes('canonicalDifficulty')?after.canonicalDifficulty:null,reason});
}
assert.equal(changes.length,49);const output={schemaVersion:1,beforeLibrarySha256:inventory.beforeLibrarySha256,audited:items.size,retained:retained.size,changes,dispositions,historicalNotes:inventory.historicalNotes};fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({reviewed:items.size,revised:changes.length,alreadyAddressed:retained.size,difficultyChanges:dispositions.filter(d=>d.targetDifficulty).length}));
