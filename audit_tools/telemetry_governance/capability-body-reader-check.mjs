import './local-network-only.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {readBoundedJSON} from '../../server/anonymous-telemetry-poc/capabilities.mjs';
const out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage2_http_followup';
const results=[],limit=131072;
for(const declared of [null,'1'])for(const multibyte of [false,true])for(const extra of [0,1]){
 const text=JSON.stringify({value:multibyte?'é':'x'}),bytes=new TextEncoder().encode(text+' '.repeat(limit-Buffer.byteLength(text)+extra));
 let offset=0,cancelled=false,pulls=0;
 const stream=new ReadableStream({pull(c){pulls++;if(offset>=bytes.length){c.close();return;}const next=Math.min(bytes.length,offset+4096);c.enqueue(bytes.slice(offset,next));offset=next;},cancel(){cancelled=true;}},{highWaterMark:0});
 const request=new Request('http://localhost/',{method:'POST',headers:{'content-type':'application/json',...(declared===null?{}:{'content-length':declared})},body:stream,duplex:'half'});
 if(extra)await assert.rejects(readBoundedJSON(request,limit),e=>e.code==='request_too_large'&&e.status===413);
 else assert.deepEqual(await readBoundedJSON(request,limit),{value:multibyte?'é':'x'});
 if(extra)assert(cancelled);
 results.push({declared,multibyte,actualBytes:bytes.length,pulls,cancelled,status:'PASS'});
}
// Infinite producer: no full-body buffering or draining after the first excess byte.
let pulls=0,cancelled=false;
const stream=new ReadableStream({pull(c){pulls++;assert(pulls<=33);c.enqueue(new Uint8Array(4096));},cancel(){cancelled=true;}},{highWaterMark:0});
await assert.rejects(readBoundedJSON(new Request('http://localhost/',{method:'POST',headers:{'content-type':'application/json'},body:stream,duplex:'half'}),limit),e=>e.code==='request_too_large');
assert.equal(pulls,33);assert(cancelled);results.push({case:'infinite producer cancelled on first excess chunk',pulls,cancelled,status:'PASS'});
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'body-reader-results.json'),JSON.stringify({passed:results.length,failed:0,limitBytes:limit,results},null,2)+'\n');console.log('Bounded reader: '+results.length+'/'+results.length+' PASS');
