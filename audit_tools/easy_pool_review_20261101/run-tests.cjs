'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer/tests');
const source=fs.readFileSync(path.join(dir,'run_active_composer_suite.js'),'utf8');
const names=vm.runInNewContext(source.match(/const ACTIVE_RUNNERS = (\[[\s\S]*?\]);/)[1]);
// --remaining is only for resuming after these three checks have passed separately.
const completed=new Set(process.argv.includes('--remaining')?['run_question_bank_comprehensive_validation.mjs','run_faculty_outcome_validation.js','run_easy_pool_review_validation.cjs']:[]);
const results=[];fs.writeFileSync(path.join(__dirname,'suite.log'),'');
for(const name of names.filter(n=>!completed.has(n))){
 const start=Date.now(),r=spawnSync(process.execPath,[path.join(dir,name)],{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:16*1024*1024,env:{...process.env,MQ_COMPOSER_TEST_OUTPUT_DIR:path.join(__dirname,'test-output')}});
 const item={runner:name,status:r.status===0?'PASS':'FAIL',seconds:(Date.now()-start)/1000,exitCode:r.status,error:r.error?.message};
 results.push(item);fs.appendFileSync(path.join(__dirname,'suite.log'),`\n${name}\n${r.stdout||''}\n${r.stderr||''}\n`);fs.writeFileSync(path.join(__dirname,'suite-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(item));
}
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
