// Disposable loopback runtime only; no telemetry, credentials or D1 dependency.
import './local-network-only.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.env.MQ_LOCAL_RUNTIME_MODULES,'miniflare/package.json'));
const {Miniflare,convertV4MiniflareOptions,Log,LogLevel}=require('miniflare');
const out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage2_http_followup';
fs.mkdirSync(out,{recursive:true});
const script=`export default {async fetch(request){
 const mode=new URL(request.url).pathname.slice(1),limit=131072;
 const headers={'cache-control':'no-store','access-control-allow-origin':'https://masteryquests.org','vary':'Origin','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'content-type'};
 if(mode==='identity')headers['content-encoding']='identity';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 let count=0,ended=false;
 if(mode==='cancel'&&request.headers.has('content-length'))await request.body?.cancel();
 if(['drain','threshold','threshold-cancel'].includes(mode)||!request.headers.has('content-length')){
  const reader=request.body.getReader({mode:'byob'});
  const ceiling=mode==='drain'?1048576:limit+1;
  while(count<ceiling){const part=await reader.read(new Uint8Array(Math.min(16384,ceiling-count)));if(part.done){ended=true;break;}count+=part.value.byteLength;}
  if(['cancel','drain','threshold-cancel'].includes(mode)&&!ended)await reader.cancel();
  reader.releaseLock();
 }
 const over=Number(request.headers.get('content-length'))>limit||count>limit;
 return Response.json(over?{error:'request_too_large'}:{ok:true},{status:over?413:200,headers:{...headers,'x-fixture-read-bytes':String(count),'x-fixture-stream-ended':String(ended)}});
}}`;
const runtimeLogs=[];
class CapturedLog extends Log{logWithLevel(level,message){runtimeLogs.push({level,message:String(message)});}}
const options=convertV4MiniflareOptions({modules:true,script,compatibilityDate:'2026-08-07',host:'127.0.0.1',cf:false,log:new CapturedLog(LogLevel.DEBUG),outboundService:()=>new Response('blocked',{status:403})});options.telemetry={enabled:false};
const mf=new Miniflare(options),records=[];
async function nodeHTTP(url,payload,length){return new Promise(resolve=>{
 const row={client:'node:http',status:null,headers:null,readableBody:false,socketClosed:false};let text='';
 const req=http.request(url,{method:'POST',agent:false,headers:{connection:'close',...(length?{'content-length':Buffer.byteLength(payload)}:{})}},res=>{
 row.status=res.statusCode;row.statusLine='HTTP/'+res.httpVersion+' '+res.statusCode+' '+res.statusMessage;row.headers=res.headers;
 res.setEncoding('utf8');res.on('data',x=>text+=x);res.on('end',()=>{row.readableBody=true;row.body=text;});res.on('error',e=>{row.exception=e.code;});res.on('close',()=>{row.responseComplete=res.complete;});
 });req.on('socket',s=>s.on('close',hadError=>{row.socketClosed=true;row.socketHadError=hadError;resolve(row)}));req.on('error',e=>{row.exception=e.code;});req.setTimeout(5000,()=>req.destroy(Error('timeout')));
 // write/end separately leaves chunked framing when Content-Length is omitted.
 req.write(payload);req.end();
 });}
try{
 const base=await mf.ready;
 for(const mode of ['immediate','cancel','drain','threshold','threshold-cancel','identity'])
 for(const bytes of [100,131072,131073,524288,2097152])
 for(const multibyte of [false,true])for(const length of [true,false])for(let trial=0;trial<3;trial++){
  const payload=multibyte?'é'.repeat(Math.floor(bytes/2))+(bytes%2?'x':''):'x'.repeat(bytes);
  const row=await nodeHTTP(new URL('/'+mode,base),payload,length);
  records.push({mode,bytes,multibyte,contentLength:length,trial,...row});
  const observation={mode,bytes,multibyte,contentLength:length,trial,client:'undici',status:null,readableBody:false};
  try{
   const upload=length?payload:new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(payload));c.close();}});
   const response=await fetch(new URL('/'+mode,base),{method:'POST',body:upload,...(!length?{duplex:'half'}:{}),signal:AbortSignal.timeout(5000)});
   observation.status=response.status;observation.headers=Object.fromEntries(response.headers);observation.body=await response.text();observation.readableBody=true;
  }catch(error){observation.exception=error.message;observation.cause=error.cause?.code;}
  records.push(observation);
 }
 const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext();await context.grantPermissions(['local-network-access'],{origin:'https://masteryquests.org'});
  await context.route('**/*',r=>new URL(r.request().url()).origin==='https://masteryquests.org'?r.fulfill({contentType:'text/html',body:'<!doctype html><title>Minimal local runtime</title>'}):new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const page=await context.newPage();await page.goto('https://masteryquests.org/fixture');
  for(const mode of ['immediate','cancel','drain','threshold','threshold-cancel','identity'])for(const bytes of [100,131072,131073,524288,2097152])for(let trial=0;trial<3;trial++){
   const row=await page.evaluate(async({url,bytes})=>{const r={client:'edge',status:null,readableBody:false};try{const response=await fetch(url,{method:'POST',body:'x'.repeat(bytes)});r.status=response.status;r.headers=Object.fromEntries(response.headers);r.body=await response.text();r.readableBody=true;}catch(e){r.exception=e.message;}return r;},{url:new URL('/'+mode,base).href,bytes});
   records.push({mode,bytes,trial,...row});
  }
 }finally{await browser.close();}
}finally{await mf.dispose();}
fs.writeFileSync(path.join(out,'body-diagnostic.json'),JSON.stringify({runtime:require('miniflare/package.json').version,localOnly:true,runtimeLogs,records},null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(['immediate','cancel','drain','threshold','threshold-cancel','identity'].map(mode=>{const rows=records.filter(r=>r.mode===mode);return [mode,{trials:rows.length,unreadable:rows.filter(r=>!r.readableBody).length}]})),null,2));
