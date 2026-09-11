// Explicit operator tool. Never loads credentials from files or prints request headers.
import fs from 'node:fs';import {createHash} from 'node:crypto';
const [operation,...args]=process.argv.slice(2);const option=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
try{
 if(!['policy','retention','delete-run','export'].includes(operation))throw Error('Usage: admin.mjs policy|retention|delete-run|export [--execute --cutoff ISO --confirm TEXT] [--run-id UUID] [--output FILE] [--build-id ID]');
 const endpoint=new URL(process.env.MQ_ADMIN_ENDPOINT||'');if(endpoint.username||endpoint.password||endpoint.search||endpoint.hash||!['https:','http:'].includes(endpoint.protocol)||(endpoint.protocol==='http:'&&!['127.0.0.1','localhost'].includes(endpoint.hostname)))throw Error('Use HTTPS or a local test endpoint without credentials/query');
 const token=process.env.MQ_ADMIN_TOKEN;if(!token)throw Error('Set MQ_ADMIN_TOKEN in the operator environment; never place it in game files');
 const headers={authorization:'Bearer '+token};if(process.env.MQ_MAINTENANCE_TOKEN)headers['x-telemetry-maintenance']=process.env.MQ_MAINTENANCE_TOKEN;
 const call=async(route,body)=>{const r=await fetch(endpoint.href.replace(/\/$/,'')+route,{method:body?'POST':'GET',redirect:'error',headers:{...headers,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error('Administrative request failed with HTTP '+r.status);return r;};
 if(operation==='export'){
  const output=option('--output');if(!output)throw Error('Export requires --output');if(fs.existsSync(output)||fs.existsSync(output+'.governance.json'))throw Error('Export destination already exists');
  const policy=(await(await call('/v1/admin/governance')).json()).governance;const params=new URLSearchParams();if(option('--build-id'))params.set('buildId',option('--build-id'));if(args.includes('--include-synthetic'))params.set('includeSynthetic','1');
  const response=await call('/v1/admin/export.csv?'+params),text=await response.text();
  if(response.headers.get('x-mq-governance-policy')!==policy.version||response.headers.get('x-mq-retention-days')!==(policy.days===null?'unconfigured':String(policy.days))||response.headers.get('x-mq-retention-mode')!==policy.mode)throw Error('Policy changed during export; retry into a fresh destination');
  const sidecar={format:'mq-export-governance/1',governancePolicyVersion:policy.version,measurementContract:policy.measurementContract,exportSha256:createHash('sha256').update(text).digest('hex'),exportedAt:new Date().toISOString(),scope:{buildId:params.get('buildId')||'managerial-directorate-telemetry-poc',includeSynthetic:params.get('includeSynthetic')==='1',rowLimit:50000},retention:{days:policy.days,mode:policy.mode,unit:policy.unit,clock:policy.clock},applicability:'Current server policy at export; historical event policy is unknown. Downloaded copies are outside server retention.'};
  fs.writeFileSync(output,text,{flag:'wx'});fs.writeFileSync(output+'.governance.json',JSON.stringify(sidecar,null,2)+'\n',{flag:'wx'});console.log('Saved CSV and its hash-bound governance sidecar.');
 }else{
  const action=args.includes('--execute')?'execute':'dry-run';if(action==='execute'&&!option('--confirm'))throw Error('Execution requires an explicit --confirm; review a dry-run first');
  const result=await(await call(operation==='policy'?'/v1/admin/governance':'/v1/admin/'+operation,operation==='policy'?undefined:{action,cutoff:option('--cutoff'),confirm:option('--confirm'),runId:option('--run-id')})).json();console.log(JSON.stringify(result,null,2));
 }
}catch(error){console.error(error.message);process.exitCode=1;}
