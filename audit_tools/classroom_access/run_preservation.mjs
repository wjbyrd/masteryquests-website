import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'.'),out=path.join(root,'validation_artifacts/classroom_access'),results=[];
for(const script of ['audit_tools/managerial_classroom/run_browser.mjs','audit_tools/anonymous_telemetry_poc/run_regressions.mjs','audit_tools/anonymous_telemetry_poc/run_backend_integration.mjs']){
 const r=spawnSync(process.execPath,['--require',path.join(root,'audit_tools/classroom_access/evidence-redirect.cjs'),script,root],{cwd:root,env:{...process.env,GATE_REPO:root},encoding:'utf8',maxBuffer:8*1024*1024});
 fs.writeFileSync(path.join(out,path.basename(script)+'.log'),r.stdout+'\n'+r.stderr);results.push({command:'node '+script+' .',exitCode:r.status});console.log(script+': '+(r.status===0?'PASS':'FAIL'));if(r.status!==0)console.log((r.stdout+r.stderr).slice(-2000));
}
fs.writeFileSync(path.join(out,'preservation_suites.json'),JSON.stringify(results,null,2)+'\n');if(results.some(r=>r.exitCode!==0))process.exitCode=1;
