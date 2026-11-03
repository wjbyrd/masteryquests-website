'use strict';
const fs=require('fs'),{changes}=require('./content-edits.json');
const findings=[];
for(const c of changes){for(const [field,s]of [['q',c.afterRecord.q],...c.afterRecord.options.map((s,i)=>['option'+i,s])]){
 const pattern=/undefined|NaN|\$\$|\b(the the|a a|of of|is is)\b|\. [a-z]|\bMC constant|with temporary|\b[A-Z]{2,}=\$/g;
 const matches=[...s.replaceAll('U.S. ','US ').matchAll(pattern)].map(m=>m[0]);if(matches.length)findings.push({id:c.id,field,matches,text:s});
 if(s.includes('<table>')){const rows=[...s.matchAll(/<tr>(.*?)<\/tr>/gs)].map(m=>[...m[1].matchAll(/<t[hd]>/g)].length);if(new Set(rows).size!==1)throw Error(c.id+' ragged table');}
}}
fs.writeFileSync(__dirname+'/draft-findings.json',JSON.stringify(findings,null,2));console.log(JSON.stringify(findings,null,2));
