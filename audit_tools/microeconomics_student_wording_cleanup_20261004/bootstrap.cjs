'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),work=path.join(root,'tmp/microeconomics_student_wording_cleanup_20261004');
const review=JSON.parse(fs.readFileSync(path.join(root,'faculty_exports/audits/microeconomics_student_perspective_wording_review_20261004.json'),'utf8'));
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),source=fs.readFileSync(path.join(cdir,'data/composer_library.js'),'utf8');
fs.mkdirSync(work,{recursive:true});
const lib=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const ids=review.findings.map(f=>f.question_id).sort(),set=new Set(ids);assert.equal(set.size,148);
const originals=Object.fromEntries(contracts.questionRecords(lib).filter(r=>set.has(String(r.question.id))).map(r=>[String(r.question.id),r.question]));
assert.deepEqual(Object.keys(originals).sort(),ids);
for(const f of review.findings){const q=originals[f.question_id];assert.equal(q.q,f.current_wording.stem);assert.deepEqual(q.options,Object.values(f.current_wording.choices));}
for(const n of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']){const dest=path.join(work,n);assert(!fs.existsSync(dest),'Snapshot already exists');fs.copyFileSync(path.join(cdir,'data',n),dest);}
const protectedFiles={};function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(d.isFile())protectedFiles[path.relative(root,p).replaceAll('\\','/')]=sha(fs.readFileSync(p));}}
walk(cdir);walk(path.join(root,'faculty_exports'));
const write=(n,v)=>fs.writeFileSync(path.join(__dirname,n),JSON.stringify(v,null,2)+'\n');
write('originals.json',originals);write('scope.json',{authorized_union:ids,AUTHORIZED_MICRO_STUDENT_WORDING_SET:ids,source_sha256:sha(source),beforeLibrarySha256:lib.librarySha256});
fs.writeFileSync(path.join(work,'protected_files.json'),JSON.stringify(protectedFiles,null,2)+'\n');
write('drafts.json',Object.fromEntries(ids.map(id=>{const q=originals[id],key=q.options.findIndex(o=>sha(core.normalizeAnswerText(o))===q.aHash);assert(key>=0);return[id,{q:q.q,options:q.options,feedback:q.feedback,correct_index:key}];})));
console.log(JSON.stringify({authorized:ids.length,protectedFiles:Object.keys(protectedFiles).length,graph:ids.filter(id=>originals[id].image),advanced:ids.filter(id=>/elite|legendary/i.test(originals[id].difficulty||''))},null,2));

