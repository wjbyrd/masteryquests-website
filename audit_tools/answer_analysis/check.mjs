import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {fn} from '../economic_realm_engine/source.mjs';
import {validateContractField} from '../../server/anonymous-telemetry-poc/measurement-contract.mjs';
import {normalizeEvent,PHASE} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const require=createRequire(import.meta.url),analysis=require('../../tools/answer-analysis/analysis.js');
const runtime=fs.readFileSync('audit_tools/telemetry_contract/runtime.js','utf8');
const registry=JSON.parse(fs.readFileSync('audit_tools/telemetry_contract/registry.json','utf8'));
const storage=new Map(),values={FACULTY_COMPOSITION_CONFIG:{slug:'market-gate'},runID:'test-run',gameMode:'trialGraph',room:1,questionBanks:{},TELEMETRY_PREFIX:'answer-test:'};
const context=vm.createContext({localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},crypto:{randomUUID},window:{},document:{},console});
vm.runInContext(runtime,context);
const contract=context.createTelemetryContract((k,f)=>k in values?values[k]:f,registry);
const rows=[];
values.sendGameData=data=>{const row={...data,eventID:randomUUID(),runID:values.runID,mode:values.gameMode,room:values.room,questionID:data.questionId,selectedIndex:-1};contract.stamp(row,data);rows.push(row);};
function show(q){values.currentQuestion=q;contract.show();}
function answer(event='question',selectedIndex=0,extra={}){
 const row={event,eventID:randomUUID(),runID:values.runID,mode:values.gameMode,room:values.room,questionID:values.currentQuestion.id,selectedIndex,correct:1,priorExposureCount:0,...extra};
 contract.stamp(row,extra);rows.push(row);return row;
}
const q={id:'ERQ-001',q:'Which value? "quoted",\nsecond line',options:['same','third','same','fourth'],telemetryOptionIndices:[2,1,0,3],telemetryContentRevision:contract.build().contentRevision};
show(q);const a=answer('question',0),s=JSON.parse(a.answerSnapshotJSON);
assert.equal(s.selectedAnswer,'same');assert.equal(s.selectedIndex,2);assert.equal(s.optionOrder,'canonical');
assert.deepEqual(s.options,['same','third','same','fourth']);
validateContractField('answerSnapshotJSON',a.answerSnapshotJSON,{});
assert(!Object.hasOwn(s,'a')&&!Object.hasOwn(s,'aHash')&&!Object.hasOwn(s,'correct'));
const changed={...q,q:'Revised question',telemetryOptionIndices:[0,1,2,3]};values.room=2;show(changed);
const b=answer('question',1,{priorExposureCount:1});assert.notEqual(JSON.parse(b.answerSnapshotJSON).questionRevision,s.questionRevision);
assert.equal(JSON.parse(a.answerSnapshotJSON).prompt,q.q,'Old rows must keep their wording');
values.room=3;show({...q,id:'OLD-SAVE',telemetryOptionIndices:undefined,telemetryContentRevision:undefined});
assert.equal(JSON.parse(answer().answerSnapshotJSON).optionOrder,'displayed');
values.room=4;show({...q,id:'TOO-LONG',q:'x'.repeat(12001)});assert.equal(answer().answerSnapshotJSON,null);
values.room=44;show({...q,id:'UNICODE-LIMIT',q:'漢'.repeat(12000),options:Array.from({length:4},()=> '字'.repeat(4000))});assert.equal(answer().answerSnapshotJSON,null,'UTF-8 envelope must fit transport limits');
values.gameMode='exam';values.room=5;show(q);answer('exam_answer_initial',0);const draft=answer('exam_answer_revision',1);
show(q); // Revisiting an answered exam question must preserve the last response.
const committed=answer('question',1,{adaptiveMode:'exam-commit',priorExposureCount:99});assert.equal(committed.answerSnapshotJSON,draft.answerSnapshotJSON);
assert.equal(JSON.parse(committed.answerSnapshotJSON).selectedAnswer,'third');
const legacy={event:'question',questionID:1,selectedIndex:0};assert.equal(contract.exportRows([legacy],values.runID)[0].answerSnapshotJSON,undefined);
// The snapshot survives the actual server envelope and extras export path.
const remote=normalizeEvent({schemaVersion:3,phase:PHASE,buildId:'answer-test',gameId:'market-gate',buildVersion:contract.build().buildRevision,eventId:randomUUID(),runId:randomUUID(),anonymousClientId:randomUUID(),eventType:'answer_evaluated',sequenceNumber:1,eventTimestamp:new Date().toISOString(),contractID:'mq-measurement/1',questionId:q.id,answerSnapshotJSON:a.answerSnapshotJSON,acceptedAttempt:true,correct:true});
assert.equal(remote.extras.answerSnapshotJSON,a.answerSnapshotJSON);
for(const malicious of [{...s,selectedAnswer:'wrong'},{...s,questionRevision:'0'.repeat(64)},{...s,email:'not-allowed'},{...s,options:['a']}])assert.throws(()=>validateContractField('answerSnapshotJSON',JSON.stringify(malicious),{}));
const source=[a,{...a},b,{...a,eventID:'legacy',attemptID:'legacy',answerSnapshotJSON:''},
 {...a,event:'rapid_guessing',eventID:'rapid'},draft,committed];
const result=analysis.analyze(source);
assert.equal(result.stats.accepted,4);assert.equal(result.stats.duplicates,1);assert.equal(result.stats.unresolved,1);assert.equal(result.stats.rapidGuesses,1);assert.equal(result.stats.drafts,1);
assert.equal(result.groups.length,2);assert.equal(result.groups[0].count,2);assert.equal(result.groups[0].options[2].count,1);
assert.equal(analysis.analyze(source,{exposure:'repeat'}).stats.included,1);
const assisted={...a,eventID:randomUUID(),attemptID:randomUUID(),supportJSON:JSON.stringify({artifactApplied:true})};
assert.equal(analysis.analyze([assisted],{assistance:'assisted'}).stats.included,1);
const fields=Object.keys(a),csv=[fields,...[a].map(r=>fields.map(k=>r[k]??''))].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
assert.equal(analysis.analyze(analysis.parseCSV(csv)).groups[0].prompt,q.q);
assert.throws(()=>analysis.parseCSV('event,event\nquestion,question'));
// Verify every maintained engine embeds the same snapshot implementation.
const targets=['build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html',
 'build/faculty-build-composer/measurement-build.js','play/managerial-intelligence-directorate/local-telemetry.js',
 'play/managerial-directorate-classroom/telemetry-client.js','play/managerial-directorate-telemetry-poc/telemetry-client.js',
 'downloads/resources/mastery-quests-faculty-template.html','downloads/resources/mastery-quests-faculty-starter.html'];
for(const family of ['economic-realm','macro-command-system','micro-domains'])for(const entry of fs.readdirSync('play/'+family,{withFileTypes:true})){
 const file=`play/${family}/${entry.name}/index.html`;if(entry.isDirectory()&&fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes('function sendGameData('))targets.push(file);
}
for(const file of targets){const text=fs.readFileSync(file,'utf8');assert.equal(fn(text,'createTelemetryContract').replace(/\r/g,'').replaceAll('safeStorageGet(key(run))','localStorage.getItem(key(run))'),fn(runtime,'createTelemetryContract'),file+': stale answer recorder');}
console.log(`PASS: answer snapshots, duplicate-text shuffle, revisions, legacy saves, exam changes, server validation, report counts/filters, quoted CSV and ${targets.length} engine integrations.`);

