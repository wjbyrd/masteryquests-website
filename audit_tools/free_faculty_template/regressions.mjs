import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const base=path.resolve('validation_artifacts/free_faculty_template_parity');
const jobs=[
 ['governance','audit_tools/telemetry_governance/check.mjs'],
 ['readiness','audit_tools/telemetry_governance/readiness-remediation.mjs'],
 ['scheduled','audit_tools/telemetry_governance/scheduled-check.mjs'],
 ['contract','audit_tools/telemetry_contract/check.mjs'],
 ['contract-browser','audit_tools/telemetry_contract/browser.mjs'],
 ['governance-browser','audit_tools/telemetry_governance/browser.mjs'],
 ['managerial-parity','audit_tools/managerial_telemetry_parity/run-parity.mjs'],
 ['managerial-browser','audit_tools/managerial_telemetry_parity/run-browser.mjs'],
 ['published-browser','audit_tools/published_managerial_parity/browser.mjs'],
 ['private-refresh','audit_tools/telemetry_governance/private-refresh-check.mjs'],
 ['classroom','audit_tools/classroom_access/run_validation.mjs'],
 ['public-links','audit_tools/public_documentation/check.cjs']
];
const paths=['audit_tools/telemetry_contract/schema.json','audit_tools/telemetry_contract/release.json','audit_tools/telemetry_contract/runtime.js','server/anonymous-telemetry-poc/measurement-contract.mjs','server/anonymous-telemetry-poc/telemetry-core.mjs','server/anonymous-telemetry-poc/governance-policy.mjs','server/anonymous-telemetry-poc/governance.mjs','server/anonymous-telemetry-poc/scheduled-retention.mjs','server/anonymous-telemetry-poc/wrangler.jsonc'];
fs.mkdirSync(path.join(base,'readiness'),{recursive:true});fs.writeFileSync(path.join(base,'readiness/preflight.json'),JSON.stringify({hashes:Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
const results=[];
async function worker(){while(jobs.length){const [name,file]=jobs.shift(),out=path.join(base,name);fs.mkdirSync(out,{recursive:true});const log=fs.openSync(path.join(base,name+'.log'),'w');const env={...process.env,MQ_EVIDENCE_DIR:out,PLAYWRIGHT_MODULE:'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'};const args=name==='classroom'?['--require','./audit_tools/free_faculty_template/evidence-redirect.cjs',file]:[file];const child=spawn(process.execPath,args,{env,stdio:['ignore',log,log],windowsHide:true});const code=await new Promise(r=>child.on('exit',r));fs.closeSync(log);results.push({name,code,status:code===0?'PASS':'FAIL',log:name+'.log'});console.log(name+': '+results.at(-1).status);fs.writeFileSync(path.join(base,'regressions.json'),JSON.stringify(results,null,2));}}
await Promise.all([worker(),worker()]);if(results.some(r=>r.code!==0))process.exitCode=1;
