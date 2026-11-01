'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),tests=path.join(root,'build/faculty-build-composer/tests'),results=[];
for(const runner of ['run_saving_identity_easy_validation.cjs','run_question_bank_comprehensive_validation.mjs','run_macro_phase2_taxonomy_validation.mjs','run_faculty_outcome_validation.js','run_quiz_mode_validation.js']){
 const start=Date.now(),r=spawnSync(process.execPath,[path.join(tests,runner)],{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:4*1024*1024,env:{...process.env,MQ_COMPOSER_TEST_OUTPUT_DIR:path.join(__dirname,'test-output')}});
 fs.writeFileSync(path.join(__dirname,runner+'.log'),(r.stdout||'')+'\n'+(r.stderr||''));
 const row={runner,status:r.status===0?'PASS':'FAIL',seconds:(Date.now()-start)/1000,exitCode:r.status};results.push(row);
 fs.writeFileSync(path.join(__dirname,'test-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(row));
}
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
