// Read-only local runtime diagnostics. No application data, credentials, or production binding.
import './local-network-only.mjs';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=process.env.MQ_LOCAL_RUNTIME_MODULES?createRequire(path.join(process.env.MQ_LOCAL_RUNTIME_MODULES,'miniflare/package.json')):createRequire(import.meta.url);
const {Miniflare,convertV4MiniflareOptions}=require('miniflare');
const out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage2';fs.mkdirSync(out,{recursive:true});
async function runtime(script){const options=convertV4MiniflareOptions({modules:true,script,compatibilityDate:'2026-08-07',host:'127.0.0.1',cf:false,outboundService:()=>new Response('blocked',{status:403})});options.telemetry={enabled:false};return new Miniflare(options);}
const records={runtime:require('miniflare/package.json').version,compatibilityDate:'2026-08-07',localOnly:true,headers:[],early413:[]};
let mf=await runtime("export default {fetch(request){return Response.json({present:request.headers.has('x-mq-ingest-token'),value:request.headers.get('x-mq-ingest-token')})}}");
try{for(const value of ['', 'bad']){const headers={'x-mq-ingest-token':value};records.headers.push({sentValue:value,dispatch:await(await mf.dispatchFetch('http://localhost/',{headers})).json(),directHTTP:await(await fetch(await mf.ready,{headers})).json()});}}finally{await mf.dispose();}
mf=await runtime('export default {fetch(){return Response.json({error:"request_too_large"},{status:413})}}');
try{for(const bytes of [100,...Array(10).fill(131073)]){const row={bytes,status:null,readableBody:false};try{const response=await fetch(await mf.ready,{method:'POST',body:'x'.repeat(bytes)});row.status=response.status;row.body=await response.text();row.readableBody=true;}catch(error){row.error=error.message;row.cause=error.cause?.code;}records.early413.push(row);}}finally{await mf.dispose();}
fs.writeFileSync(path.join(out,'runtime-transport-diagnostics.json'),JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(records,null,2));
