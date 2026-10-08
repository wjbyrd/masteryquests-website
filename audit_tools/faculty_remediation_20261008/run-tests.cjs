'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer/tests');
const text=fs.readFileSync(path.join(dir,'run_active_composer_suite.js'),'utf8');
const names=require('vm').runInNewContext(text.match(/const ACTIVE_RUNNERS = (\[[\s\S]*?\]);/)[1]);
const sourceSha256=require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library.js'))).digest('hex');
const results=[];fs.writeFileSync(path.join(__dirname,'tests.log'),'');
for(const runner of names){
 if(fs.existsSync(path.join(__dirname,'stop-tests')))break;
 const start=Date.now(),r=spawnSync(process.execPath,[path.join(dir,runner)],{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:16*1024*1024,env:{...process.env,NODE_PATH:path.resolve(path.dirname(process.execPath),'../node_modules'),MQ_COMPOSER_TEST_OUTPUT_DIR:path.join(__dirname,'test-output')}});
 const record={runner,status:r.status===0?'PASS':'FAIL',seconds:(Date.now()-start)/1000,exitCode:r.status,error:r.error?.message,sourceSha256};results.push(record);
 fs.appendFileSync(path.join(__dirname,'tests.log'),`\n${runner}\n${r.stdout||''}\n${r.stderr||''}\n`);fs.writeFileSync(path.join(__dirname,'test-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(record));
}
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
