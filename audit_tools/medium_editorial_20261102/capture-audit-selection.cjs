'use strict';
const fs=require('fs'),crypto=require('crypto'),path=require('path'),{items}=require('./inventory.json');
const target=path.join(__dirname,'read-selection.json');if(fs.existsSync(target))throw Error('Selection already frozen');
const done=new Set(require('./content-edits.json').decisions.map(r=>r.id));
const expanded=items.filter(r=>!done.has(r.id)&&(!/[?]$/.test(r.question.q)||r.question.q.split(/\s+/).length>=35||r.question.options.some(o=>/\b[CIGPY]\s*=|\b(?:NCO|NX|MPC|AD|SRAS|LRAS|SRPC|LRPC)\b|\$-/.test(o)||o.split(/\s+/).length>16)));
const groups=Map.groupBy(items,r=>r.conceptId);const samples=[...groups.values()].flatMap(rows=>rows.sort((a,b)=>crypto.createHash('sha256').update(a.id).digest('hex').localeCompare(crypto.createHash('sha256').update(b.id).digest('hex'))).slice(0,2)).filter(r=>!done.has(r.id));
fs.writeFileSync(target,JSON.stringify({expandedIds:expanded.map(r=>r.id),sampleIds:samples.map(r=>r.id),alreadyDecided:done.size},null,2)+'\n');console.log({expanded:expanded.length,samples:samples.length});
