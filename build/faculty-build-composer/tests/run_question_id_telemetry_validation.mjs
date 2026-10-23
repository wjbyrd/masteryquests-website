import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {fn, declaration, value, games} from '../../../audit_tools/economic_realm_engine/source.mjs';
import {parseCSV} from '../../../audit_tools/telemetry_contract/validate.mjs';

const require = createRequire(import.meta.url);
const core = require('../composer-core.js');
const helpers = require('./composer-test-helpers.js');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const baseline = process.argv.includes('--baseline');
const templatePath = 'build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html';
const read = path => baseline
  ? execFileSync('git', ['show', `HEAD:${path}`], {cwd: root, encoding: 'utf8'})
  : fs.readFileSync(new URL('../../../' + path, import.meta.url), 'utf8');

function harness(source){
  const storage = new Map();
  let download;
  const context = vm.createContext({
    console: {warn(...args){ throw new Error(args.join(' ')); }},
    window: {crypto: {randomUUID}}, crypto: {randomUUID}, Blob,
    localStorage: {getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v))},
    document: {body: {appendChild(){}}, createElement(){ return {click(){}, remove(){}}; }},
    URL: {createObjectURL(blob){ download=blob; return 'blob:test'; }, revokeObjectURL(){}},
    setTimeout(){}, alert(message){ throw new Error(message); },
    runID: 'id-regression', gameMode: 'trialGraph', room: 1, trialGraphQuestionTarget: 15,
    TELEMETRY_PREFIX: 'test:telemetry:', RUN_ID_KEY: 'test:run', LATEST_TELEMETRY_RUN_KEY: 'test:latest',
    TELEMETRY_VERSION: 'mq-tracker-2026.09.10-contract1', GAME_VERSION: 'id-regression',
    FACULTY_COMPOSITION_CONFIG: value(source, 'FACULTY_COMPOSITION_CONFIG'),
    currentQuestion: null, adaptiveMode: '', remediationState: null,
    scoreAttackScore: 0, scoreAttackBestScore: 0, fadingFortuneScore: 0
  });
  const functions = ['createRpgCsvContract','createTelemetryContract','createTelemetryEventID','getTelemetryKey',
    'readLocalTelemetry','sendGameData','escapeCsvValue','downloadTelemetryCsv'];
  vm.runInContext(functions.map(name => fn(source,name)).join('\n') + '\n' +
    declaration(source.replace(/^ +const MQContract/gm,'const MQContract'),'MQContract') + '\n' + declaration(source,'TELEMETRY_COLUMNS'),context);
  const run = code => vm.runInContext(code,context);
  return {
    context, run,
    show(id,room){
      context.room=room;
      context.currentQuestion={id,version:1,options:['a','b','c','d'],telemetryOptionIndices:[0,1,2,3]};
      run('MQContract.show()');
    },
    send(data){ context.sendGameData({responseTime:5000,selectedIndex:0,correct:1,...data}); },
    rows(){ return JSON.parse(JSON.stringify(context.readLocalTelemetry())); },
    async csv(){
      context.downloadTelemetryCsv();
      const [headers,...rows]=parseCSV(await download.text());
      return rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]])));
    }
  };
}

async function check(source,label){
  helpers.assertInlineScriptsCompile(source,label);
  const h=harness(source);
  // Reproduce a 15-question run with seven string IDs and eight numeric IDs.
  const ids=Array.from({length:15},(_,i)=>i<7?`ERQ-GRAPH-${String(i+1).padStart(3,'0')}`:160+i);
  h.send({event:'start'});
  for(const [index,id] of ids.entries()){
    h.show(id,index+1);
    if([4,9,13].includes(index)){
      h.send({event:'rapid_guessing',questionId:id,attempt:index});
      h.show(id,index+1);
    }
    h.send({event:'question',questionId:id,attempt:index+1});
  }
  h.send({event:'trialGraph_complete',totalAttempts:15});
  const rows=await h.csv(),answers=rows.filter(r=>r.event==='question');
  assert.deepEqual(answers.map(r=>r.questionID),ids.map(String),`${label}: CSV must retain all 15 IDs`);
  assert.equal(rows.filter(r=>r.event==='rapid_guessing').length,3);
  assert.equal(rows.find(r=>r.event==='trialGraph_complete').totalAttempts,'15');
  assert.equal(rows.find(r=>r.event==='export_manifest').deliveryQuality.includes('"storageFailures":0'),true);
  for(const answer of answers){
    assert(answer.presentationID && answer.attemptID,`${label}: answer must link to its presentation`);
    assert(rows.some(r=>r.event==='question_presented'&&r.presentationID===answer.presentationID&&r.questionID===answer.questionID));
  }
  assert.equal(answers[0].firstExposure,'1');
  assert.equal(answers[4].priorExposureCount,'1');
  assert.equal(answers[4].firstExposure,'0');
  assert.equal(h.rows().find(r=>r.event==='question'&&r.questionID===167).questionID,167,'Keep legacy numeric storage compatible');

  // Reads round-trip through JSON storage; compare repeats, legacy numbers, and leading zeros.
  const cases=[['ERQ-GRAPH-001',1],['167',1],['00167',0],['ERQ-GRAPH-002',1],['00167',1]];
  for(const [id,prior] of cases){
    h.show(id,20);
    h.send({event:'question',question:id}); // Legacy caller alias also preserves strings.
    const last=h.rows().at(-1);
    assert.equal(last.questionID,id);
    assert.equal(last.priorExposureCount,prior,`${label}: prior exposure for ${id}`);
    assert.equal(last.firstExposure,prior===0?1:0);
  }
  for(const id of [null,undefined,0,'0','']){
    h.send({event:'start',questionId:id});
    assert.equal(h.rows().at(-1).firstExposure,0,'Non-question events must not imply a first exposure');
  }
  h.show('EXAM-ID-001',30);
  h.send({event:'exam_answer_initial',questionId:'EXAM-ID-001'});
  h.send({event:'exam_answer_revision',questionId:'EXAM-ID-001'});
  h.send({event:'question',questionId:'EXAM-ID-001'});
  assert.equal(h.rows().at(-1).priorExposureCount,0,'Exam drafts must not count as accepted prior answers');
  console.log(`PASS ${label}: stored IDs, CSV, 15 answers, rapid guesses, joins and exposure counts`);
}

for(const path of [templatePath,...games.map(g=>`play/economic-realm/${g}/index.html`),
  'downloads/resources/mastery-quests-faculty-template.html','downloads/resources/mastery-quests-faculty-starter.html']){
  await check(read(path),path);
}
const built=await helpers.buildFacultyGame(core,{
  schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'ID regression',slug:'id-regression',
  supportedModes:['trialGraph'],selectedConceptIds:['demand'],
  checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
},{template:read(templatePath)});
await check(built.html,'New Composer export');
