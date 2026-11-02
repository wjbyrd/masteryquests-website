'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const core=require('../../build/faculty-build-composer/composer-core.js');
const inventory=require('./inventory.json'),items=new Map(inventory.items.map(r=>[r.id,r])),patches=new Map(),reasons=new Map();
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const correctIndex=q=>q.options.findIndex(o=>sha(core.normalizeAnswerText(o))===q.aHash);
function edit(id,patch,reason){assert(items.has(id),'Outside review scope: '+id);patches.set(id,{...patches.get(id),...patch});if(reason)reasons.set(id,[...reasons.get(id)||[],reason]);}
function choices(id,correct,wrong){assert.equal(wrong.length,3);const n=correctIndex(items.get(id).question),options=[...wrong];options.splice(n,0,correct);edit(id,{options});}
for(const r of inventory.items){const n=r.review.Notes.trim().toLowerCase();let tier=null;
 if(n==='easy'||n.startsWith('move to easy'))tier='easy';
 else if(n==='hard'||n.startsWith('hard because')||n.includes('move it to hard')||r.id==='P62B-ELAS-EL-038')tier='hard';
 else if(n.startsWith('legendary.'))tier='legendary';else if(n.startsWith('elite.'))tier='elite';
 if(tier){const p={canonicalDifficulty:tier},q=r.question;if(q.instructionalRole==='boss'&&!q.isCheckpointChallenge)p.checkpointPool=q.checkpointPool||({easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss',legendary:'legendaryBoss'}[q.canonicalDifficulty]);edit(r.id,p,'Apply the instructor’s requested difficulty; retain established ordinary checkpoint placement.');}
}
const api={edit,choices,items};
for(const name of ['macro-and-surplus','production','graphs-and-policy','elasticity'])require('./'+name+'.cjs')(api);
const changes=[];
for(const item of inventory.items){const before=item.question,after={...structuredClone(before),...patches.get(item.id)};
 const idx=correctIndex(before);assert(idx>=0,item.id);after.aHash=sha(core.normalizeAnswerText(after.options[idx]));
 const fields=Object.keys(after).filter(k=>core.stableStringify(after[k])!==core.stableStringify(before[k]));
 assert(fields.length,'Unaddressed flag: '+item.id);assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4,item.id);
 changes.push({id:item.id,beforeRecord:before,afterRecord:after,correctIndex:idx,fields,reason:(reasons.get(item.id)||['Address the instructor’s recorded content request.']).join(' ')});
}
const dispositions=changes.map(c=>({id:c.id,topic:items.get(c.id).topic,note:items.get(c.id).review.Notes,targetDifficulty:c.fields.includes('canonicalDifficulty')?c.afterRecord.canonicalDifficulty:null,targetConcept:c.fields.includes('primaryConceptId')?c.afterRecord.primaryConceptId:null,reason:c.reason}));
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify({schemaVersion:1,beforeLibrarySha256:inventory.beforeLibrarySha256,dispositions,changes},null,2)+'\n');
console.log(JSON.stringify({changes:changes.length,difficultyChanges:dispositions.filter(x=>x.targetDifficulty).length,topicChanges:dispositions.filter(x=>x.targetConcept).length}));
