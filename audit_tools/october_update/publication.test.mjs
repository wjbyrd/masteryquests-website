import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8'),root=process.cwd();
test('older Updates entries remain byte-for-byte intact',()=>{const before=execFileSync('git',['show','HEAD:about/updates/index.html'],{encoding:'utf8'}),after=read('about/updates/index.html');const section=s=>s.slice(s.indexOf('<section class="updates-month" aria-labelledby="september-2026">'),s.indexOf('</main>')).replaceAll('\r\n','\n');assert.equal(section(after),section(before))});
test('all four pedagogy applications, acknowledgement, disclaimer and actual controls',()=>{const h=read('how-to/pedagogy/index.html');for(const text of ['1. Practice for Assessments','2. Low-Stakes Completion Assignments','3. Low-Stakes Quizzes and Assessments','4. Class-Level Feedback and Instructional Adjustment','Dr. Dan Settlage','using outside assistance to raise a game score provides no grading advantage','Copy Report','Download Game Data','Neither action automatically transfers scores'])assert(h.includes(text),text)});
test('historical quantities are qualified and no current validation is fabricated',()=>{const h=read('about/updates/index.html');for(const number of ['2,447','9,777','8,410','6,271','2,139','2,634','300-question','245 PASS','53 minor','2 substantive','175 unique'])assert(h.includes(number),number);assert(h.includes('two questions later retired'));assert(h.includes('before remediation'));assert(h.includes('not independently verifiable'))});
const publicPages=['how-to/pedagogy/index.html','how-to/question-banks/index.html','about/subscribe/index.html','about/subscribe/confirmation/index.html'];
test('new public pages have no private paths, credentials, or confidential review references',()=>{for(const p of publicPages){const h=read(p);assert(!/[A-Z]:[\\/]|BREVO_API_KEY|ADMIN_TOKEN|reviewer correspondence|submitted manuscript|JET review|faculty_exports/i.test(h),p);assert(fs.existsSync('dist/'+p),p)}});
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
test('restricted export directories and filenames are absent from dist and excluded from Pages',()=>{
 for(const f of walk('dist'))assert(!/faculty_exports|_private_course_sources|(?:general_economics|microeconomics|macroeconomics)_question_bank\.(pdf|csv)/i.test(f),f);
 const config=read('_config.yml');assert(config.includes('  - faculty_exports'));assert(config.includes('  - _private_course_sources'));assert(read('.assetsignore').includes('/faculty_exports/**'));
});
test('renamed private export byte copies are absent when private files are readable',t=>{
 let restricted;
 try{restricted=fs.readdirSync('faculty_exports').filter(n=>/^(general_economics|microeconomics|macroeconomics)_question_bank\.(pdf|csv)$/.test(n)).map(n=>{const b=fs.readFileSync(path.join('faculty_exports',n));return {size:b.length,hash:crypto.createHash('sha256').update(b).digest('hex')}})}catch(e){if(['EPERM','EACCES'].includes(e.code)){t.skip('Existing private export permissions prevent byte-hash inspection; no ACLs changed.');return}throw e}
 assert.equal(restricted.length,6);
 for(const f of walk('dist')){assert(!/faculty_exports|_private_course_sources|(?:general_economics|microeconomics|macroeconomics)_question_bank\.(pdf|csv)/i.test(f),f);if(/\.(pdf|csv)$/i.test(f)){const size=fs.statSync(f).size;if(restricted.some(r=>r.size===size)){const hash=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');assert(!restricted.some(r=>r.hash===hash),f)}}}
});
test('student library, game files and engines are unchanged from the starting checkout',()=>{const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split(/\r?\n/);assert.deepEqual(changed.filter(p=>p!=='games/index.html'&&/^(build\/faculty-build-composer|play|games|concept-reviews|server\/econnections-classroom|server\/anonymous-telemetry-poc)\//.test(p)),[]);const withoutNavigation=s=>s.replace(/<nav\b[^>]*class="(?:primary-navigation|footer-navigation)"[^>]*>[\s\S]*?<\/nav>/g,'').replaceAll('\r\n','\n');assert.equal(withoutNavigation(read('games/index.html')),withoutNavigation(execFileSync('git',['show','HEAD:games/index.html'],{encoding:'utf8'})))});
