const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const raw=fs.readFileSync(path.join(dir,'data/composer_library.js'),'utf8');
const lib=JSON.parse(raw.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const core=require(path.join(dir,'composer-core.js')),area=require(path.join(dir,'course-area-model.js')).create(lib.registry.concepts);
const canonical=new Map();
function walk(x){if(!x||typeof x!=='object')return;if(x.q&&x.options){canonical.set(String(x.id),x);return;}for(const v of Object.values(x))walk(v);}
walk(lib);
const ids=new Set();for(const cid of Object.keys(lib.concepts))if(area.areasFor(cid).includes('micro'))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(lib,cid)))ids.add(String(q.id));
const rows=[...ids].sort().map(id=>{const q=canonical.get(id);return {id,stem:q.q,choices:q.options};});
const work=path.join(root,'tmp/micro_student_wording_review_20261004');fs.mkdirSync(work,{recursive:true});
fs.writeFileSync(path.join(work,'current_questions.json'),JSON.stringify(rows,null,2));
const families=new Map();
function normalize(s){return s.replace(/\d+(?:[.,]\d+)*/g,'#');}
for(const q of rows){const text=[q.stem,...q.choices].join('\n'),key=normalize(text);if(!families.has(key))families.set(key,[]);families.get(key).push(q);}
const grouped=[...families.values()].map((rows,i)=>({group:i+1,ids:rows.map(q=>q.id),stem:rows[0].stem,choices:rows[0].choices}));
fs.writeFileSync(path.join(work,'reading_groups.json'),JSON.stringify(grouped,null,2));
console.log(JSON.stringify({questions:rows.length,wordingGroups:grouped.length,words:rows.reduce((s,q)=>s+[q.stem,...q.choices].join(' ').split(/\s+/).length,0),groupWords:grouped.reduce((s,q)=>s+[q.stem,...q.choices].join(' ').split(/\s+/).length,0)}));
