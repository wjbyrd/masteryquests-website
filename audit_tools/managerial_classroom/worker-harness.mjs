import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../../server/anonymous-telemetry-poc/worker.mjs';
export function createWorkerHarness(root){
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync(path.join(root,'server/anonymous-telemetry-poc/migrations')).sort())db.exec(fs.readFileSync(path.join(root,'server/anonymous-telemetry-poc/migrations',f),'utf8'));
 class Statement{constructor(sql){this.sql=sql;this.values=[];}bind(...v){this.values=v;return this;}async run(){const r=db.prepare(this.sql).run(...this.values);return{success:true,meta:{changes:Number(r.changes)}};}async all(){return{success:true,results:db.prepare(this.sql).all(...this.values)};}async first(){return db.prepare(this.sql).get(...this.values)||null;}}
 const env={TELEMETRY_DB:{prepare:sql=>new Statement(sql),async batch(statements){db.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}}},ALLOWED_ORIGINS:'http://classroom.test',MAX_EVENTS_PER_CLIENT_MINUTE:'100000',ADMIN_TOKEN:'local-test-only'};
 const received=new Map(),errors=[];let offline=false;
 async function call(url,{events,admin=false}={}){return worker.fetch(new Request('http://classroom.test'+url,{method:events?'POST':'GET',headers:{origin:env.ALLOWED_ORIGINS,...(events?{'content-type':'application/json'}:{}),...(admin?{authorization:'Bearer '+env.ADMIN_TOKEN}:{})},body:events?JSON.stringify({phase:'phaseAnonymousTelemetryPOC-v1',events}):undefined}),env);}
 async function serve(req,res){if(offline){res.writeHead(503);res.end();return;}try{let body='';for await(const c of req)body+=c;const events=JSON.parse(body).events;const response=await call('/api/anonymous-telemetry-poc/v1/events',{events});const output=await response.text();if(response.status!==202)errors.push({status:response.status,output});else for(const e of events)received.set(e.eventId,e);res.writeHead(response.status,{'content-type':'application/json'});res.end(output);}catch(e){errors.push({error:e.message});res.writeHead(500);res.end();}}
 return{db,call,serve,received,errors,setOffline:v=>{offline=v;},close:()=>db.close()};
}
