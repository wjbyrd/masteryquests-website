'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),core=require('../../build/faculty-build-composer/composer-core.js');
const inventory=require('./inventory.json'),edits=require('./content-edits.json'),decisions=require('./decisions.json');
const arg=n=>process.argv.find(x=>x.startsWith('--'+n+'='))?.slice(n.length+3);
let rows=inventory.items;
if(arg('group'))rows=rows.filter(r=>arg('group').split(',').includes(r.group));
if(arg('concept'))rows=rows.filter(r=>arg('concept').split(',').includes(r.question.primaryConceptId));
if(arg('ids'))rows=rows.filter(r=>arg('ids').split(',').includes(r.id));
if(process.argv.includes('--pending'))rows=rows.filter(r=>!decisions[r.id]);
if(process.argv.includes('--summary')){console.log(JSON.stringify(rows.map(r=>({id:r.id,group:r.group,concept:r.question.primaryConceptId,flags:r.review?.['Flag reasons'],note:r.review?.Notes})),null,2));process.exit(0);}
rows=rows.slice(Number(arg('start')||0),Number(arg('start')||0)+Number(arg('limit')||20));
for(const row of rows){const q=edits[row.id]?{...row.question,...edits[row.id]}:row.question;const ci=edits[row.id]?.correctIndex??q.options.findIndex(o=>crypto.createHash('sha256').update(core.normalizeAnswerText(o)).digest('hex')===q.aHash);console.log(JSON.stringify({id:row.id,group:row.group,concept:q.primaryConceptId,skill:q.primarySkill,note:row.review?.Notes,flags:row.review?.['Flag reasons'],q:q.q,options:q.options,correct:ci,feedback:q.feedback,image:q.image,imageAlt:q.imageAlt}));}
