// Local fixtures only. No HTTP issuance, static token, remote DB, or outbound provider call.
import './local-network-only.mjs';
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {createRequire} from 'node:module';import {DatabaseSync} from 'node:sqlite';import {createHash} from 'node:crypto';
import worker from '../../server/anonymous-telemetry-poc/worker.mjs';
import {approvedEnvironment} from '../../server/anonymous-telemetry-poc/governance-policy.mjs';
import {generateCapability,hashCapability} from '../../server/anonymous-telemetry-poc/capabilities.mjs';
import {PHASE} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
import {contractHash} from '../telemetry_contract/hash.mjs';
import {LEGACY_BUILDS} from '../../server/anonymous-telemetry-poc/legacy-builds.mjs';
const root=path.resolve(import.meta.dirname,'../..');
export const origin='https://masteryquests.org';
export const tuple={gameId:'faculty-composer',buildId:'composer-'+'a'.repeat(64),buildVersion:'b'.repeat(64),schemaVersion:3};
export function event(patch={}){return {...tuple,eventId:crypto.randomUUID(),runId:crypto.randomUUID(),anonymousClientId:crypto.randomUUID(),phase:PHASE,mode:'standard',eventType:'run_started',sequenceNumber:1,eventTimestamp:new Date().toISOString(),synthetic:true,contractID:'mq-measurement/1',manifestID:null,provenanceStatus:'unresolved',...patch};}
export function body(events){return JSON.stringify({phase:PHASE,events});}
export function graceInventory(seconds=86400){return LEGACY_BUILDS.map(e=>({...e,sunset_at:new Date((Math.floor(Date.now()/1000)+seconds)*1000).toISOString()}));}
export const legacyTuple={gameId:LEGACY_BUILDS[0].game_id,buildId:LEGACY_BUILDS[0].build_id,buildVersion:LEGACY_BUILDS[0].build_version,schemaVersion:3};
export function barrier(n=2){let arrived=0,release;const p=new Promise(r=>release=r);return async()=>{if(++arrived<=n){if(arrived===n)release();await p;}};}
export function manifests(){const configuration={recipeSchema:null,selectedConceptIds:[],contentScopes:{},policyFingerprint:null,samplingStrategies:{},supportedModes:['standard','exam'],dailyChallengesEnabled:null,checkpoints:{},fadingIntervals:{},startingBankroll:null,wagerRatios:[]};const base={manifestSchema:'mq-run-manifest/1',contractID:'mq-measurement/1',measurementRevision:'mq-tracker-2026.09.10-contract1',engineRevision:'a'.repeat(64),trackerSourceRevision:'b'.repeat(64),assetRevision:'c'.repeat(64),contentRevision:'d'.repeat(64),configuration,configurationRevision:contractHash(configuration)};return ['standard','exam'].map(mode=>({...base,buildRevision:contractHash(base),mode,modeParameters:{quizTarget:null}}));}
export function betaArtifact(){
 const p='beta-testing/composer-telemetry-live-test/index.html',s=fs.readFileSync(path.join(root,p),'utf8'),values={};
 for(const name of ['FACULTY_COMPOSITION_CONFIG','questionBanks','challengeQuestionBanks','repairQuestions','bridgeQuestions','microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools']){
   const expression=s.match(new RegExp('const '+name+'\\s*=\\s*([\\s\\S]*?);\\r?\\n'))?.[1];if(!expression)throw Error('Missing artifact declaration');values[name]=vm.runInNewContext('('+expression+')',{}, {timeout:5000});
 }
 values.RISK_REWARD_STARTING_BANKROLL=Math.max(1,Math.round(Number(values.FACULTY_COMPOSITION_CONFIG.riskReward?.startingBankroll)||1000));
 const registry=JSON.parse(s.match(/\/\* RELEASE REGISTRY \*\/ (\{[^\n]+\})\);/)[1]);
 const code=s.slice(s.indexOf('function createTelemetryContract('),s.indexOf('  const MQContract=createTelemetryContract('));
 const context=vm.createContext({get:(k,f)=>k in values?values[k]:f,registry});vm.runInContext(code+';result=createTelemetryContract(get,registry).build();',context,{timeout:10000});
 return {source:p,sha256:createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),tuple:{gameId:'faculty-composer',buildId:'composer-'+values.FACULTY_COMPOSITION_CONFIG.compositionFingerprint,buildVersion:context.result.buildRevision,schemaVersion:3},collectionEnabled:values.FACULTY_COMPOSITION_CONFIG.allowAnonymousDataCollection===true};
}
function config(overrides){return {...approvedEnvironment(),CAPABILITY_ISSUANCE_ENABLED:'false',CAPABILITY_INGEST_ENABLED:'true',CAPABILITY_LEGACY_GRACE_ENABLED:'false',ADMIN_TOKEN:crypto.randomUUID(),MAINTENANCE_TOKEN:crypto.randomUUID(),ALLOWED_ORIGINS:origin+',https://www.masteryquests.org',...overrides};}
const migrationDir=path.join(root,'server/anonymous-telemetry-poc/migrations');
async function migrate(db){for(const p of fs.readdirSync(migrationDir).sort()){
 const sql=fs.readFileSync(path.join(migrationDir,p),'utf8').replace(/--[^\n]*/g,'');
 // Existing migrations have no triggers or semicolons in literals. One prepared statement per DDL.
 for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();
}}
async function finish(h){
 await migrate(h.db);
 h.seed=async(patch={})=>{const scope={...tuple,...patch},raw=generateCapability(),hash=await hashCapability(raw),id=crypto.randomUUID();const now=(await h.db.prepare('SELECT unixepoch() now').first()).now;
 await h.db.batch([h.db.prepare('INSERT INTO telemetry_build_policies(game_id,build_id,created_at) VALUES(?,?,?) ON CONFLICT(game_id,build_id) DO NOTHING').bind(scope.gameId,scope.buildId,now),h.db.prepare('INSERT INTO telemetry_build_capabilities(capability_id,capability_hash,game_id,build_id,build_version,schema_version,issued_at,expires_at,issuance_request_id,activation_digest) VALUES(?,?,?,?,?,3,?,?,?,?)').bind(id,hash,scope.gameId,scope.buildId,scope.buildVersion,now,now+365*86400,crypto.randomUUID(),'0'.repeat(64))]);h.secrets.push(raw,hash);return {capability:raw,capabilityId:id,...scope};};
 h.post=async(events,cap,options={})=>h.call('/v1/events',{...options,method:'POST',headers:{'content-type':'application/json',origin,...(cap?{'x-mq-ingest-token':cap.capability}:{}),...options.headers},body:options.body??body(events)});
 h.snapshot=async()=>{const tables=['telemetry_events','telemetry_runs','telemetry_ingest_batches','telemetry_rate_limits','telemetry_build_policies','telemetry_build_capabilities','telemetry_scope_windows'];const rows=[];for(const t of tables)rows.push([t,(await h.db.prepare('SELECT * FROM '+t+' ORDER BY rowid').all()).results]);return JSON.stringify(rows);};
 return h;
}
export async function sqliteHarness(overrides={},clock=null){
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');const env=config(overrides),h={env,secrets:[env.ADMIN_TOKEN,env.MAINTENANCE_TOKEN],metrics:[],beforeBatch:null,throwPrepare:null};
 if(clock)db.function('unixepoch',()=>Math.floor(clock.now/1000));
 class Statement{constructor(sql,metric){this.sql=sql;this.values=[];this.metric=metric;}bind(...v){if(v.length>100)throw Error('D1 binding ceiling exceeded');this.values=v;return this;}execute(){const stmt=db.prepare(this.sql);if(/^\s*(SELECT|PRAGMA)/i.test(this.sql))return {success:true,results:stmt.all(...this.values)};return {success:true,results:[],meta:{changes:Number(stmt.run(...this.values).changes)}};}async first(){return db.prepare(this.sql).get(...this.values)||null;}async all(){return this.execute();}async run(){return this.execute();}}
 h.db={prepare:s=>new Statement(s),async batch(ss){db.exec('BEGIN IMMEDIATE');try{const r=ss.map(s=>s.execute());db.exec('COMMIT');return r;}catch(error){db.exec('ROLLBACK');throw error;}}};
 h.call=async(url,options={})=>{const metric={statements:0,queries:0},start=performance.now();const instrumented={prepare(sql){metric.queries++;if(h.throwPrepare)throw Error(h.throwPrepare);return h.db.prepare(sql);},async batch(ss){metric.statements+=ss.length;if(h.beforeBatch)await h.beforeBatch();return h.db.batch(ss);}};const r=await worker.fetch(new Request('http://local.test'+url,options),{...env,TELEMETRY_DB:instrumented});metric.latencyMs=performance.now()-start;metric.status=r.status;h.metrics.push(metric);return r;};h.close=async()=>db.close();return finish(h);
}
let runtimeCode;
export async function miniflareHarness(overrides={}){
 const require=process.env.MQ_LOCAL_RUNTIME_MODULES?createRequire(path.join(process.env.MQ_LOCAL_RUNTIME_MODULES,'miniflare/package.json')):createRequire(import.meta.url);
 const {Miniflare,convertV4MiniflareOptions,Log,LogLevel}=require('miniflare'),{build}=require('esbuild');
 const env=config(overrides),h={env,secrets:[env.ADMIN_TOKEN,env.MAINTENANCE_TOKEN],metrics:[],beforeBatch:null,throwPrepare:null,runtimeVersion:require('miniflare/package.json').version,logs:[]};
 if(!runtimeCode){const source=`import worker from './server/anonymous-telemetry-poc/worker.mjs';
 const capturedLogs=[];for(const key of ['log','warn','error','info','debug'])console[key]=(...args)=>capturedLogs.push(args.map(String).join(' '));
 export default {async fetch(request,env,ctx){
 const logOffset=capturedLogs.length;const stats={queries:0,statements:0,rowsRead:0,rowsWritten:0};
 const probe=await env.LOCAL_TEST_HOOK.fetch('http://fixture/control');const control=await probe.json();
 const db={prepare(sql){stats.queries++;if(control.throwPrepare)throw Error(control.throwPrepare);return env.TELEMETRY_DB.prepare(sql);},async batch(ss){stats.statements+=ss.length;await env.LOCAL_TEST_HOOK.fetch('http://fixture/before-batch');const r=await env.TELEMETRY_DB.batch(ss);for(const x of r){stats.rowsRead+=x.meta?.rows_read||0;stats.rowsWritten+=x.meta?.rows_written||0;}return r;}};
 const response=await worker.fetch(request,{...env,TELEMETRY_DB:db},ctx);await env.LOCAL_TEST_HOOK.fetch('http://fixture/metrics',{method:'POST',body:JSON.stringify({...stats,logs:capturedLogs.slice(logOffset)})});return response;}};`;
 const result=await build({stdin:{contents:source,resolveDir:root,sourcefile:'local-runtime-fixture.mjs'},bundle:true,write:false,format:'esm',platform:'browser'});runtimeCode=result.outputFiles[0].text;}
 const v4={name:'portable-stage2-local',modules:true,script:runtimeCode,compatibilityDate:JSON.parse(fs.readFileSync(path.join(root,'server/anonymous-telemetry-poc/wrangler.jsonc'),'utf8')).compatibility_date,host:'127.0.0.1',cf:false,d1Databases:['TELEMETRY_DB'],bindings:env,log:new Log(LogLevel.NONE),outboundService:()=>new Response('external network blocked',{status:403}),serviceBindings:{LOCAL_TEST_HOOK:async request=>{
  const p=new URL(request.url).pathname;if(p==='/control')return Response.json({throwPrepare:h.throwPrepare});
  if(p==='/before-batch'&&h.beforeBatch)await h.beforeBatch();if(p==='/metrics'){const metric=await request.json();h.logs.push(...metric.logs);delete metric.logs;h.metrics.push(metric);}return new Response('ok');
 }}};
 const opts=convertV4MiniflareOptions?convertV4MiniflareOptions(v4):v4;if(convertV4MiniflareOptions)opts.telemetry={enabled:false};const mf=new Miniflare(opts);h.db=await mf.getD1Database('TELEMETRY_DB');
 h.baseURL=String(await mf.ready);
 h.call=async(url,options={})=>{const start=performance.now();// dispatchFetch drops empty header values in Miniflare 5; real loopback HTTP preserves them.
 const r=await fetch(new URL(url,await mf.ready),options);h.metrics.at(-1).latencyMs=performance.now()-start;h.metrics.at(-1).status=r.status;return r;};h.close=()=>mf.dispose();return finish(h);
}
