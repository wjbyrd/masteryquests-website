'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {items}=require('./inventory.json');
const rank=r=>crypto.createHash('sha256').update('legendary-wording-20261102:'+r.id).digest('hex');
const sorted=rows=>[...rows].sort((a,b)=>rank(a).localeCompare(rank(b)));
const chosen=new Map();
for(const topic of new Set(items.map(r=>r.conceptId))){const r=sorted(items.filter(q=>q.conceptId===topic))[0];chosen.set(r.id,{...r,sampleReason:'one deterministic selection per topic'});}
for(const r of sorted(items.filter(r=>!chosen.has(r.id))).slice(0,60))chosen.set(r.id,{...r,sampleReason:'additional deterministic coverage selection'});
const risk=items.filter(r=>!chosen.has(r.id)).sort((a,b)=>b.flags.length-a.flags.length||rank(a).localeCompare(rank(b))).slice(0,24);
for(const r of risk)chosen.set(r.id,{...r,sampleReason:'targeted screening follow-up'});
const rows=[...chosen.values()].sort((a,b)=>a.n-b.n).map((r,i)=>({...r,sampleN:i+1}));
fs.writeFileSync(path.join(__dirname,'sample.json'),JSON.stringify({method:'One deterministic hash-selected item per concept, 60 additional hash-selected items, then 24 highest-indicator follow-ups. This is a topic-coverage and diagnostic sample, not a representative prevalence estimate.',count:rows.length,topics:new Set(rows.map(r=>r.conceptId)).size,items:rows},null,2)+'\n');
const start=+(process.argv[2]||1),end=+(process.argv[3]||44);
console.log(rows.filter(r=>r.sampleN>=start&&r.sampleN<=end).map(r=>`${r.sampleN}. ${r.id} | ${r.topic}\n${r.stem}\n${r.options.map((o,i)=>`${i===r.correct?'*':''}${'ABCD'[i]} ${o}`).join(' | ')}`).join('\n\n'));
