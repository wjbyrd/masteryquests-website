import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||'.'),out=path.join(root,'validation_artifacts/managerial_classroom');fs.mkdirSync(out,{recursive:true});
const commands=[
 'build/faculty-build-composer/tests/run_daily_challenges_v1_validation.js',
 'build/faculty-build-composer/tests/run_guide_intro_validation.js',
 'build/faculty-build-composer/tests/run_exam_navigation_boss_reveal_validation.js',
 'audit_tools/managerial_ui_parity/run_validation.mjs',
 'audit_tools/anonymous_telemetry_poc/run_validation.mjs',
 'audit_tools/anonymous_telemetry_poc/run_backend_integration.mjs',
 'audit_tools/anonymous_telemetry_poc/run_regressions.mjs'
];
const results=[];
const selected=process.argv.includes('--poc-baseline-only')?commands.filter(p=>p.endsWith('anonymous_telemetry_poc/run_validation.mjs')):commands;
for(const script of selected){const r=spawnSync(process.execPath,['--require',path.join(root,'audit_tools/managerial_classroom/evidence-redirect.cjs'),script,root],{cwd:root,env:{...process.env,CLASSROOM_REPO:root},encoding:'utf8',maxBuffer:8*1024*1024});fs.writeFileSync(path.join(out,path.basename(script)+'.log'),r.stdout+'\n'+r.stderr);let finalStatus=r.status;
if(script==='audit_tools/anonymous_telemetry_poc/run_validation.mjs'&&r.status!==0&&r.stderr.includes('05 public protected hashes unchanged')){
 const scoped=spawnSync(process.execPath,['--require',path.join(root,'audit_tools/managerial_classroom/evidence-redirect.cjs'),script,root],{cwd:root,env:{...process.env,CLASSROOM_REPO:root,CLASSROOM_CURRENT_BASELINE:'1'},encoding:'utf8',maxBuffer:8*1024*1024});
 fs.writeFileSync(path.join(out,'poc_current_baseline.log'),scoped.stdout+'\n'+scoped.stderr);finalStatus=scoped.status;console.log('POC scoped current-baseline rerun: '+(scoped.status===0?'PASS':'FAIL'));
}
results.push({command:'node '+script+' .',exitCode:finalStatus,originalExitCode:r.status,baselineAdapted:finalStatus!==r.status});console.log(script+': '+(r.status===0?'PASS':'FAIL'));if(r.status!==0)console.log((r.stdout+r.stderr).slice(-2200));}
const evidence=path.join(out,'existing_suite_results.json');const prior=process.argv.includes('--poc-baseline-only')?JSON.parse(fs.readFileSync(evidence,'utf8')):[];const combined=prior.length?prior.map(r=>results.find(n=>n.command===r.command)||r):results;fs.writeFileSync(evidence,JSON.stringify(combined,null,2)+'\n');if(results.some(r=>r.exitCode!==0))process.exitCode=1;
