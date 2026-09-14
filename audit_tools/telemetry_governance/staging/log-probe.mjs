// Capture credential field locations only, never values, in isolated staging live-tail metadata.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {api,state,save,name,out,query} from './control.mjs';
import {generateCapability} from '../../../server/anonymous-telemetry-poc/capabilities.mjs';
const marker=generateCapability(),tail=await api('/workers/scripts/'+name+'/tails','POST',{});
save({...state(),extraTailIds:[...(state().extraTailIds||[]),tail.id]});
const socket=new WebSocket(tail.url,'trace-v1');socket.binaryType='arraybuffer';const locations=new Set();let applicationMatches=0;
function walk(value,p=''){if(typeof value==='string'&&value.includes(marker))locations.add(p);else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value))walk(v,p?p+'.'+k:k);}
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Tail probe deadline')),10000);socket.addEventListener('open',()=>{clearTimeout(timer);socket.send(JSON.stringify({debug:false}));resolve();},{once:true});});
 socket.addEventListener('message',e=>{const text=typeof e.data==='string'?e.data:new TextDecoder().decode(e.data);const value=JSON.parse(text);walk(value);if(JSON.stringify({logs:value.logs,exceptions:value.exceptions}).includes(marker))applicationMatches++;});
 const before=(await query('SELECT COUNT(*) n FROM telemetry_events'))[0].results[0].n;
 const response=await fetch(state().url+'/v1/events',{method:'POST',headers:{origin:'https://masteryquests.org','content-type':'application/json','x-mq-ingest-token':marker},body:'{}',redirect:'error',signal:AbortSignal.timeout(10000)});assert.equal(response.status,403);await response.text();
 for(let i=0;i<20&&!locations.size;i++)await new Promise(r=>setTimeout(r,500));
 const after=(await query('SELECT COUNT(*) n FROM telemetry_events'))[0].results[0].n;
 // Main matrix runs concurrently, so this probe's 403 is not used as a group no-write proof.
 const result={purpose:'Identify sensitive live-tail metadata locations without retaining values',unknownCredentialResponse:403,credentialLocations:[...locations],applicationLogMatches:applicationMatches,concurrentEventCounts:{before,after},valuesPersisted:false};fs.writeFileSync(path.join(out,'log-metadata-probe.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{socket.close();await api(`/workers/scripts/${name}/tails/${tail.id}`,'DELETE');}
// Exit only after evidence and tail teardown; flag the confirmed metadata exposure.
process.exit(locations.size?1:0);
