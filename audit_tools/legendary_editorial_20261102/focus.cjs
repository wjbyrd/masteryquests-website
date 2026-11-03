'use strict';
const a=require('../legendary_wording_audit_20261102/findings.json'),i=require('./inventory.json').items,d=new Set(require('./content-edits.json').decisions.map(x=>x.id)),audit=new Map(a.items.map(x=>[x.id,x.decision]));
const flags=new Map(a.screeningCandidates.map(x=>[x.id,x]));
const rows=i.filter(x=>!d.has(x.id)&&(process.argv.includes('--all')||flags.has(x.id)||audit.get(x.id)?.rating!=='K'&&audit.has(x.id)||audit.get(x.id)?.tags.includes('distractor_check')));
for(let j=+(process.argv[2]||1)-1;j<Math.min(+(process.argv[3]||30),rows.length);j++){const x=rows[j];console.log(`${j+1}. ${x.id} [${x.topic}]\n${x.question.q}\n${x.question.options.map((o,k)=>(k===x.correctIndex?'*':'')+'ABCD'[k]+' '+o).join(' | ')}${audit.has(x.id)?'\nAUDIT '+JSON.stringify(audit.get(x.id)):''}\n`)}console.log('Total remaining selected '+rows.length);
