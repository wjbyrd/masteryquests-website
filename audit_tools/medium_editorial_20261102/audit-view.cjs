'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {items}=require('./inventory.json'),screen=require('./screening.json'),flags=new Map(screen.items.map(r=>[r.id,r.flags])),args=process.argv.slice(2);
let selected=items;
if(args.includes('--flagged'))selected=selected.filter(r=>flags.get(r.id).length);
if(args.includes('--expanded'))selected=selected.filter(r=>!/[?]$/.test(r.question.q)||r.question.q.split(/\s+/).length>=35||r.question.options.some(o=>/\b[CIGPY]\s*=|\b(?:NCO|NX|MPC|AD|SRAS|LRAS|SRPC|LRPC)\b|\$-/.test(o)||o.split(/\s+/).length>16));
if(args.includes('--topics')){const by=new Map();for(const r of selected){const list=by.get(r.conceptId)||[];list.push(r);by.set(r.conceptId,list);}selected=[...by.values()].flatMap(rows=>rows.sort((a,b)=>crypto.createHash('sha256').update(a.id).digest('hex').localeCompare(crypto.createHash('sha256').update(b.id).digest('hex'))).slice(0,2));}
const topic=args.find(a=>a.startsWith('--topic='))?.slice(8);if(topic)selected=selected.filter(r=>new RegExp(topic,'i').test(r.topic));
if(args.includes('--remaining')){const p=path.join(__dirname,'content-edits.json'),done=new Set(fs.existsSync(p)?require(p).decisions.map(d=>d.id):[]);selected=selected.filter(r=>!done.has(r.id));}
const start=+(args.find(a=>a.startsWith('--start='))?.slice(8)||1),end=+(args.find(a=>a.startsWith('--end='))?.slice(6)||selected.length);
for(const [i,r]of selected.entries()){if(i+1<start||i+1>end)continue;const q=r.question;console.log(`${i+1}. ${r.id} [${r.topic}] ${flags.get(r.id).map(f=>f.code).join(',')}\n${q.q}\n${q.options.map((o,j)=>`${j===r.correctIndex?'*':''}${'ABCD'[j]} ${o}`).join(' | ')}${args.includes('--feedback')?'\n'+q.feedback:''}\n`);}
console.log(JSON.stringify({matched:selected.length,shown:[start,Math.min(end,selected.length)]}));
