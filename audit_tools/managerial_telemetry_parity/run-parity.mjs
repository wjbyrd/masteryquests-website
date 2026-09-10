import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';
import {BEHAVIOR_FIELDS,PHASE,validateEnvelope,reconstructRun} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
import worker from '../../server/anonymous-telemetry-poc/worker.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=process.env.MQ_EVIDENCE_DIR||path.join(root,'validation_artifacts/managerial_telemetry_parity');
fs.mkdirSync(out,{recursive:true});
const results=[],fixtures=[];
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}console.log(name+': '+results.at(-1).status);}
function client(){
 const storage=new Map(),listeners={},timers=new Map(),nodes=new Map();let seq=0,selection=null;
 const context=vm.createContext({URLSearchParams,AbortController,crypto:webcrypto,location:{search:'?telemetrySynthetic=1'},now:1000,
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
  setTimeout:(fn,delay)=>{timers.set(++seq,{fn,delay});return seq;},clearTimeout:id=>timers.delete(id),
  document:{currentScript:{dataset:{gameId:'cost-directive'}},documentElement:{dataset:{}},hidden:false,visibilityState:'visible',
   addEventListener:(type,fn)=>{(listeners[type]||=[]).push(fn);},querySelector:()=>null,
   getElementById:id=>nodes.get(id),createElement:()=>({style:{},addEventListener(){}}),body:{appendChild(){}},
   createRange:()=>({selectNodeContents(){},startContainer:0,endContainer:0,startOffset:0,endOffset:10})},
  Range:{START_TO_START:0,END_TO_END:2},getSelection:()=>selection,
  addEventListener:(type,fn)=>{(listeners[type]||=[]).push(fn);},fetch:async(url,opts)=>({ok:true,status:202,json:async()=>({acknowledgedEventIds:JSON.parse(opts.body).events.map(e=>e.eventId)})})});
 for(const id of ['question','answers'])nodes.set(id,{id});
 vm.runInContext(`window=globalThis; const RealDate=Date; Date=class extends RealDate{constructor(...args){super(...(args.length?args:[RealDate.now()+now]));}static now(){return now;}};
 let room=1,currentQuestion={id:'Q1',type:'calculation',tag:'costs',difficulty:'easy'},questionStartTime=0,answerSubmissionPending=false,rapidGuessLocked=false,gameMode='standard',streak=0,totalAttempts=0,correctAnswers=0;
 let remediationState={},masteryState={};function getElapsedTimeMs(){return 0;}function sendGameData(){}
 function displayQuestion(){questionStartTime=Date.now();answerSubmissionPending=false;}
 async function answer(){answerSubmissionPending=true;sendGameData({event:'question',questionId:currentQuestion.id,room,correct:1,responseTime:Date.now()-questionStartTime});}
 function returnToModeSelectFromRun(){};`,context);
 vm.runInContext(fs.readFileSync(path.join(root,'play/managerial-directorate-telemetry-poc/telemetry-client.js'),'utf8'),context);
 const run=code=>vm.runInContext(code,context),events=()=>JSON.parse(JSON.stringify(context.AnonymousTelemetryPOC.getQueue()));
 function dispatch(type){for(const f of listeners[type]||[])f({persisted:true});}
 return {context,run,events,timers,api:context.AnonymousTelemetryPOC,
  at:n=>{context.now=n;},dispatch,
  hide(n){context.now=n;context.document.hidden=true;context.document.visibilityState='hidden';dispatch('visibilitychange');},
  show(n){context.now=n;context.document.hidden=false;context.document.visibilityState='visible';dispatch('visibilitychange');},
  select(){selection={isCollapsed:false,rangeCount:1,getRangeAt:()=>({intersectsNode:node=>node.id==='question',cloneRange(){return this;},compareBoundaryPoints:()=>0,toString:()=> 'PRIVATE_SENTINEL_QUESTION_CONTENT'})};dispatch('selectionchange');},
  deselect(){selection=null;},
  tick(delay){for(const [id,t]of [...timers])if(t.delay===delay){timers.delete(id);t.fn();}},
  start(){run(`sendGameData({event:'start',runID:'synthetic-source'});displayQuestion()`);},
  async answer(n){context.now=n;await run('answer()');return events().findLast(e=>e.eventType==='answer_evaluated');}
 };
}
const timing=(e,expected)=>{for(const [k,v]of Object.entries(expected))assert.equal(e[k],v,k);};
const base={hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:null,selectionCount:0,copyCount:0};
await check('Late classroom initialization does not wrap lifecycle hooks twice',()=>{const c=client();c.run(`const adapterSend=sendGameData;sendGameData=function(data){return adapterSend(data);};const adapterDisplay=displayQuestion;displayQuestion=function(){return adapterDisplay();};`);c.dispatch('DOMContentLoaded');c.start();assert.equal(c.events().filter(e=>e.eventType==='run_started').length,1);assert.equal(new Set(c.events().map(e=>e.runId)).size,1);assert.equal(c.events().filter(e=>e.eventType==='question_shown').length,1);});
for(const [name,ms]of [['A fast visible',1200],['B slow visible',60000]])await check(name,async()=>{const c=client();c.start();const e=await c.answer(1000+ms);timing(e,{...base,responseTimeMs:ms,activeResponseTimeMs:ms});fixtures.push(...c.events());});
await check('C one tab switch and return',async()=>{const c=client();c.start();c.hide(4000);c.show(9000);timing(await c.answer(12000),{responseTimeMs:11000,activeResponseTimeMs:6000,hiddenTimeMs:5000,tabSwitchCount:1,timeAfterReturnMs:3000});fixtures.push(...c.events());});
await check('D multiple switches; duplicate browser signals do not inflate counts',async()=>{const c=client();c.start();c.hide(2000);c.hide(2200);c.dispatch('blur');c.dispatch('blur');c.dispatch('pagehide');c.show(4000);c.dispatch('focus');c.hide(5000);c.show(7000);timing(await c.answer(8000),{responseTimeMs:7000,hiddenTimeMs:4000,activeResponseTimeMs:3000,tabSwitchCount:2,focusLossCount:1,timeAfterReturnMs:1000});fixtures.push(...c.events());});
await check('E selection only is debounced',async()=>{const c=client();c.start();c.select();c.select();c.tick(250);timing(await c.answer(3000),{selectionCount:1,copyCount:0,questionSelected:1,answersSelected:0});});
await check('F copy while visible has no invented hidden interval',async()=>{const c=client();c.start();c.select();c.at(2000);c.dispatch('copy');timing(await c.answer(3000),{copyCount:1,questionCopied:1,hiddenTimeMs:0,timeCopyToHideMs:null,timeCopyToBlurMs:null,lastCopyElapsedMs:1000});fixtures.push(...c.events());});
await check('G copy to blur/hide captures independent relationships without content',async()=>{const c=client();c.start();c.select();c.at(2000);c.dispatch('copy');c.at(2300);c.dispatch('blur');c.hide(2500);c.show(5500);c.at(5700);c.dispatch('focus');timing(await c.answer(7000),{copyCount:1,timeCopyToBlurMs:300,timeCopyToHideMs:500,timeAfterReturnMs:1500,timeAfterFocusMs:1300});assert(!JSON.stringify(c.events()).includes('PRIVATE_SENTINEL'));fixtures.push(...c.events());});
await check('H menu pause and resume reset; paused tab activity is ignored',async()=>{const c=client();c.start();c.at(3000);c.run('returnToModeSelectFromRun()');const interruption=c.events().findLast(e=>e.eventType==='question_interrupted');assert.equal(interruption.responseTimeMs,2000);c.hide(4000);c.show(20000);c.at(30000);c.run(`sendGameData({event:'resume',runID:'synthetic-source'});displayQuestion()`);timing(await c.answer(32000),{...base,responseTimeMs:2000,activeResponseTimeMs:2000});assert.equal(new Set(c.events().map(e=>e.runId)).size,1);fixtures.push(...c.events());});
await check('I next question resets counts, pending selection and timing',async()=>{const c=client();c.start();c.select();c.at(1800);c.dispatch('copy');await c.answer(2000);c.at(3000);c.run(`room=2;currentQuestion={id:'Q2'};displayQuestion()`);c.deselect();c.tick(250);timing(await c.answer(4000),{...base,responseTimeMs:1000,questionCopied:0,lastCopyElapsedMs:null});fixtures.push(...c.events());});
await check('J incomplete question stays reconstructable on page exit',()=>{const c=client();c.start();c.at(3000);c.dispatch('pagehide');const r=reconstructRun(c.events());assert.equal(r.completionStatus,'incomplete');assert.equal(r.answerCount,0);assert.equal(r.questionResponses.at(-1).eventType,'question_interrupted');fixtures.push(...c.events());});
await check('K completion durable; later visibility cannot resume ended run',async()=>{const c=client();c.start();await c.answer(3000);c.run(`sendGameData({event:'complete'})`);const count=c.events().length;c.hide(4000);c.show(5000);assert.equal(c.events().length,count);assert.equal(reconstructRun(c.events()).completionStatus,'complete');fixtures.push(...c.events());});
await check('L unavailable, timeout, rejected, rate-limited and offline posts retain exact IDs',async()=>{
 for(const status of [0,400,429,503,'timeout']){const c=client();c.start();const ids=c.events().map(e=>e.eventId);c.context.fetch=async(_,o)=>{if(status==='timeout')return new Promise((_,reject)=>o.signal.addEventListener('abort',()=>reject(Error('aborted'))));if(!status)throw Error('offline');return {ok:false,status};};const request=c.api.flush();if(status==='timeout')c.tick(10000);const r=await request;assert.equal(r.ok,false);assert.deepEqual(c.events().map(e=>e.eventId),ids);const e=await c.answer(5000);assert.equal(Boolean(e.correct),true);}
});
await check('Exam commit accumulates only this room’s views',async()=>{const c=client();c.start();c.at(2000);c.run(`gameMode='exam';displayQuestion()`);c.hide(3000);c.show(4000);c.at(5000);c.run(`sendGameData({event:'exam_answer_initial',room:1,questionId:'Q1',responseTime:3000})`);c.at(6000);c.run('displayQuestion()');c.at(7000);c.run(`room=2;currentQuestion={id:'Q2'};displayQuestion()`);c.at(9000);c.run(`sendGameData({event:'question',adaptiveMode:'exam-commit',room:1,questionId:'Q1',responseTime:4000})`);timing(c.events().findLast(e=>e.eventType==='answer_evaluated'),{responseTimeMs:4000,hiddenTimeMs:1000,activeResponseTimeMs:3000,tabSwitchCount:1});});
// Execute the real Worker against SQLite through the existing D1 interface.
const db=new DatabaseSync(':memory:');for(const name of fs.readdirSync(path.join(root,'server/anonymous-telemetry-poc/migrations')).sort())db.exec(fs.readFileSync(path.join(root,'server/anonymous-telemetry-poc/migrations',name),'utf8'));
class Statement{constructor(sql){this.sql=sql;this.values=[];}bind(...v){this.values=v;return this;}async run(){const r=db.prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(r.changes)}};}async all(){return {results:db.prepare(this.sql).all(...this.values)}}async first(){return db.prepare(this.sql).get(...this.values)||null;}}
const env={TELEMETRY_DB:{prepare:s=>new Statement(s),async batch(a){db.exec('BEGIN');try{const r=[];for(const s of a)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}},ALLOWED_ORIGINS:'https://private.example.test',MAX_EVENTS_PER_CLIENT_MINUTE:'100000',ADMIN_TOKEN:webcrypto.randomUUID()};
const call=(pathname,{method='GET',body,admin=false,origin='https://private.example.test'}={})=>worker.fetch(new Request('https://telemetry.test'+pathname,{method,headers:{origin,...(admin?{authorization:'Bearer '+env.ADMIN_TOKEN}:{}),'content-type':'application/json'},body:body?JSON.stringify(body):undefined}),env);
await check('M/N Worker ingestion, idempotency, legacy and CSV export',async()=>{
 for(const clientId of new Set(fixtures.map(e=>e.anonymousClientId))){const events=fixtures.filter(e=>e.anonymousClientId===clientId);for(let i=0;i<events.length;i+=25){const body={phase:PHASE,events:events.slice(i,i+25)};const response=await call('/v1/events',{method:'POST',body});assert.equal(response.status,202,await response.text());const dup=await call('/v1/events',{method:'POST',body});assert.equal((await dup.json()).accepted,0);}}
 const legacy={...fixtures[0],eventId:webcrypto.randomUUID(),runId:webcrypto.randomUUID(),sequenceNumber:1,schemaVersion:1};for(const k of BEHAVIOR_FIELDS)delete legacy[k];assert.equal((await call('/v1/events',{method:'POST',body:{phase:PHASE,events:[legacy]}})).status,202);
 const response=await call('/v1/admin/export.csv?includeSynthetic=1',{admin:true});assert.equal(response.status,200);const csv=await response.text();for(const key of [...BEHAVIOR_FIELDS,'responseTimeMs'])assert(csv.split('\r\n')[0].includes('"'+key+'"'));const header=csv.split('\r\n')[0].split(',');const row=csv.split('\r\n').find(r=>r.includes(legacy.eventId)).split(',');for(const key of BEHAVIOR_FIELDS)assert.equal(row[header.indexOf('"'+key+'"')],'""');
 const run=fixtures.find(e=>e.copyCount===1&&e.timeCopyToHideMs!=null).runId;const reconstruction=await(await call('/v1/admin/runs/'+run+'/reconstruct',{admin:true})).json();assert(JSON.stringify(reconstruction).includes('timeCopyToHideMs'));fs.writeFileSync(path.join(out,'reconstruction.json'),JSON.stringify(reconstruction,null,2));fs.writeFileSync(path.join(out,'synthetic-export.csv'),csv);
 assert.equal((await call('/v1/admin/summary')).status,401);assert.equal((await call('/v1/events',{method:'POST',origin:'https://unrelated.test',body:{phase:PHASE,events:[legacy]}})).status,403);assert.equal((await call('/v1/health')).status,200);
 const emptyCsv=await(await call('/v1/admin/export.csv?buildId=no-such-build',{admin:true})).text();assert.equal(emptyCsv.split('\r\n')[0],csv.split('\r\n')[0]);
 env.MAX_EVENTS_PER_CLIENT_MINUTE='50';db.prepare('UPDATE telemetry_rate_limits SET event_count=50 WHERE anonymous_client_id=?').run(legacy.anonymousClientId);assert.equal((await call('/v1/events',{method:'POST',body:{phase:PHASE,events:[legacy]}})).status,429);env.MAX_EVENTS_PER_CLIENT_MINUTE='100000';
});
await check('O privacy allowlist and numeric validation reject content/invalid measurements',()=>{
 const e=fixtures.find(e=>e.eventType==='answer_evaluated');
 for(const key of ['selectedText','copiedText','clipboardContents','questionText','answerChoiceText','keystrokes','email','ipAddress','canvasUserId','userAgent','browserHistory','applicationName'])assert.throws(()=>validateEnvelope({phase:PHASE,events:[{...e,[key]:'FORBIDDEN_CONTENT'}]}));
 for(const value of [-1,Infinity,'12',{},1.5])assert.throws(()=>validateEnvelope({phase:PHASE,events:[{...e,copyCount:value}]}));
 assert.throws(()=>validateEnvelope({phase:PHASE,events:[{...e,activeResponseTimeMs:e.responseTimeMs+500}]}));
 assert(!JSON.stringify(fixtures).includes('PRIVATE_SENTINEL'));
});
const report={passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results};
fs.writeFileSync(path.join(out,'parity-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));db.close();if(report.failed)process.exitCode=1;
