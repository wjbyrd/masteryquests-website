'use strict';
const fs=require('fs'),path=require('path'),{items}=require('./inventory.json');
const args=process.argv.slice(2),topic=args[0]||'',start=+(args[1]||1),end=+(args[2]||9999),draftPath=path.join(__dirname,'content-edits.json'),draft=fs.existsSync(draftPath)?require(draftPath):{decisions:[],changes:[]},decisions=new Map(draft.decisions.map(r=>[r.id,r])),changes=new Map(draft.changes.map(r=>[r.id,r]));
const rows=items.filter(r=>r.conceptId.includes(topic)||r.id===topic).filter(r=>!args.includes('--remaining')||!decisions.has(r.id));
for(const [i,r]of rows.entries()){if(i+1<start||i+1>end)continue;const q=args.includes('--after')?(changes.get(r.id)?.afterRecord||r.question):r.question;console.log(`${i+1}. ${r.id} [${r.topic}]\n${q.q}\n${q.options.map((o,j)=>`${j===r.correctIndex?'*':''}${'ABCD'[j]} ${o}`).join(' | ')}${args.includes('--feedback')?'\nExplanation: '+q.feedback:''}\n`);}
console.log(JSON.stringify({matched:rows.length,shown:[start,Math.min(end,rows.length)]}));
