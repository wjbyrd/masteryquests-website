'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const templatePath = process.argv[2] || path.join(__dirname, '..', 'template', 'mastery-quests-faculty-template-composer-ready.html');
const template = fs.readFileSync(templatePath, 'utf8');

function extractFunction(source, name){
  const start = source.indexOf(`function ${name}(`);
  if(start < 0) throw new Error(`Missing function ${name}`);
  const parameterStart = source.indexOf('(', start);
  let parameterDepth = 0;
  let parameterEnd = -1;
  for(let index = parameterStart; index < source.length; index++){
    if(source[index] === '(') parameterDepth++;
    else if(source[index] === ')' && --parameterDepth === 0){ parameterEnd = index; break; }
  }
  const bodyStart = source.indexOf('{', parameterEnd);
  let bodyDepth = 0;
  for(let index = bodyStart; index < source.length; index++){
    if(source[index] === '{') bodyDepth++;
    else if(source[index] === '}' && --bodyDepth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unterminated function ${name}`);
}

const names = [
  'createQuestionVisibilityTimingState',
  'resetQuestionVisibilityTiming',
  'markQuestionVisibilityHidden',
  'markQuestionVisibilityVisible',
  'getQuestionVisibilityTiming',
  'completeQuestionVisibilityTiming',
  'handleQuestionVisibilityChange',
  'getMasteryResponseTime'
];
const context = {document:{hidden:false}, Number, Math};
vm.createContext(context);
vm.runInContext(
  `${names.map(name => extractFunction(template, name)).join('\n')}
   let questionStartTime = 0;
   let questionVisibilityTiming = createQuestionVisibilityTimingState();`,
  context
);

function run(code){ return vm.runInContext(code, context); }
function assertEqual(actual, expected, label){
  if(actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}
function assertTiming(actual, expected, label){
  for(const [key, value] of Object.entries(expected)) assertEqual(actual[key], value, `${label}.${key}`);
  if(actual.activeResponseTimeMs > actual.responseTimeMs) throw new Error(`${label}: active exceeds raw`);
  if(actual.hiddenTimeMs < 0 || actual.activeResponseTimeMs < 0) throw new Error(`${label}: negative time`);
}

const cases = {};

run('document.hidden=false; resetQuestionVisibilityTiming(1000)');
cases.normal = run('getQuestionVisibilityTiming(11000)');
assertTiming(cases.normal, {responseTimeMs:10000,activeResponseTimeMs:10000,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:null}, 'normal');

run('document.hidden=false; resetQuestionVisibilityTiming(1000)');
run('document.hidden=true; handleQuestionVisibilityChange(6000); handleQuestionVisibilityChange(6500)');
run('document.hidden=false; handleQuestionVisibilityChange(11000)');
cases.oneSwitch = run('getQuestionVisibilityTiming(14000)');
assertTiming(cases.oneSwitch, {responseTimeMs:13000,activeResponseTimeMs:8000,hiddenTimeMs:5000,tabSwitchCount:1,timeAfterReturnMs:3000}, 'oneSwitch');

run('document.hidden=false; resetQuestionVisibilityTiming(2000)');
run('document.hidden=true; handleQuestionVisibilityChange(4000)');
run('document.hidden=false; handleQuestionVisibilityChange(7000)');
run('document.hidden=true; handleQuestionVisibilityChange(9000)');
run('document.hidden=false; handleQuestionVisibilityChange(13000)');
cases.multipleSwitches = run('getQuestionVisibilityTiming(14000)');
assertTiming(cases.multipleSwitches, {responseTimeMs:12000,activeResponseTimeMs:5000,hiddenTimeMs:7000,tabSwitchCount:2,timeAfterReturnMs:1000}, 'multipleSwitches');

run('document.hidden=false; resetQuestionVisibilityTiming(5000)');
cases.fastAnswer = run('getQuestionVisibilityTiming(6200)');
assertTiming(cases.fastAnswer, {responseTimeMs:1200,activeResponseTimeMs:1200,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:null}, 'fastAnswer');

run('document.hidden=false; resetQuestionVisibilityTiming(10000)');
cases.slowCalculation = run('getQuestionVisibilityTiming(70000)');
assertTiming(cases.slowCalculation, {responseTimeMs:60000,activeResponseTimeMs:60000,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:null}, 'slowCalculation');

run('document.hidden=false; resetQuestionVisibilityTiming(1000)');
run('document.hidden=true; handleQuestionVisibilityChange(3000)');
cases.hiddenSubmission = run('getQuestionVisibilityTiming(8000)');
assertTiming(cases.hiddenSubmission, {responseTimeMs:7000,activeResponseTimeMs:2000,hiddenTimeMs:5000,tabSwitchCount:1,timeAfterReturnMs:null}, 'hiddenSubmission');

const runClockContext = {Number, Math, now:1000};
runClockContext.Date = {now:() => runClockContext.now};
vm.createContext(runClockContext);
vm.runInContext(`
  let accumulatedElapsedMs = 0;
  let startTime = 1000;
  let finalElapsedTimeMs = null;
  let phase15ResumeClockOnVisible = false;
  function getElapsedTimeMs(){
    if(Number.isFinite(finalElapsedTimeMs)) return finalElapsedTimeMs;
    const priorSessionsMs = Math.max(0, Number(accumulatedElapsedMs) || 0);
    const currentSessionMs = startTime ? Math.max(0, Date.now() - startTime) : 0;
    return priorSessionsMs + currentSessionMs;
  }
  ${extractFunction(template, 'phase15PauseActiveClock')}
  ${extractFunction(template, 'phase15ResumeActiveClock')}
`, runClockContext);
runClockContext.now = 6000;
vm.runInContext('phase15PauseActiveClock()', runClockContext);
runClockContext.now = 11000;
vm.runInContext('phase15ResumeActiveClock()', runClockContext);
runClockContext.now = 14000;
cases.pauseResume = vm.runInContext('({elapsed:getElapsedTimeMs(), accumulatedElapsedMs, clockRunning:Boolean(startTime), resumePending:phase15ResumeClockOnVisible})', runClockContext);
assertEqual(cases.pauseResume.elapsed, 8000, 'pause/resume active elapsed');
assertEqual(cases.pauseResume.accumulatedElapsedMs, 5000, 'pause accumulated elapsed');
assertEqual(cases.pauseResume.clockRunning, true, 'resume restarts active clock');
assertEqual(cases.pauseResume.resumePending, false, 'resume flag clears');

run('document.hidden=false; resetQuestionVisibilityTiming(1000); document.hidden=true; handleQuestionVisibilityChange(3000)');
run('document.hidden=false; resetQuestionVisibilityTiming(50000)');
cases.restoredQuestion = run('getQuestionVisibilityTiming(53000)');
assertTiming(cases.restoredQuestion, {responseTimeMs:3000,activeResponseTimeMs:3000,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:null}, 'restoredQuestion');

cases.backwardCompatibility = {
  oldRecentRecord:run('getMasteryResponseTime({responseTime:7000})'),
  oldTelemetryRecord:run('getMasteryResponseTime({responseTimeMs:8000})'),
  newRecordPreferred:run('getMasteryResponseTime({responseTime:9000,activeResponseTime:4000})')
};
assertEqual(cases.backwardCompatibility.oldRecentRecord, 7000, 'legacy recent fallback');
assertEqual(cases.backwardCompatibility.oldTelemetryRecord, 8000, 'legacy telemetry fallback');
assertEqual(cases.backwardCompatibility.newRecordPreferred, 4000, 'active preference');

const examCompatibilityContext = {Number, Math};
vm.createContext(examCompatibilityContext);
vm.runInContext(extractFunction(template, 'addExamRoomVisibilityTiming'), examCompatibilityContext);
cases.restoredExamRoom = vm.runInContext(`
  const state = {totalViewMs:9000};
  addExamRoomVisibilityTiming(state, {activeResponseTimeMs:3000,hiddenTimeMs:2000,tabSwitchCount:1});
  state;
`, examCompatibilityContext);
assertEqual(cases.restoredExamRoom.totalActiveViewMs, 12000, 'legacy exam active-time fallback');
assertEqual(cases.restoredExamRoom.totalHiddenViewMs, 2000, 'legacy exam hidden-time fallback');
assertEqual(cases.restoredExamRoom.totalTabSwitchCount, 1, 'legacy exam switch-count fallback');

const rapidConfigSource = template.match(/const RAPID_GUESS_CONFIG = (\{[\s\S]*?\n\});/);
if(!rapidConfigSource) throw new Error('Missing RAPID_GUESS_CONFIG');
const rapidContext = {Number, Math};
vm.createContext(rapidContext);
vm.runInContext(`
  const RAPID_GUESS_CONFIG = ${rapidConfigSource[1]};
  let rapidGuessHistory = [];
  ${extractFunction(template, 'checkRapidGuessing')}
`, rapidContext);
cases.rapidGuess = [];
for(let attempt = 0; attempt < 5; attempt++){
  cases.rapidGuess.push(vm.runInContext('checkRapidGuessing(false, 1200)', rapidContext));
}
assertEqual(cases.rapidGuess[3].triggered, false, 'rapid guess minimum attempts');
assertEqual(cases.rapidGuess[4].triggered, true, 'rapid guess threshold behavior');
assertEqual(cases.rapidGuess[4].avgTime, 1200, 'rapid guess raw timing input');

const columnSource = template.match(/const TELEMETRY_COLUMNS = \[([\s\S]*?)\n\];/);
if(!columnSource) throw new Error('Missing TELEMETRY_COLUMNS');
const columns = vm.runInNewContext(`[${columnSource[1]}]`);
const responseIndex = columns.indexOf('responseTimeMs');
const expectedTimingColumns = ['responseTimeMs','activeResponseTimeMs','hiddenTimeMs','tabSwitchCount','timeAfterReturnMs'];
assertEqual(JSON.stringify(columns.slice(responseIndex, responseIndex + 5)), JSON.stringify(expectedTimingColumns), 'CSV timing column order');

const storage = new Map();
const telemetryContext = {
  window:{crypto:{randomUUID(){ return 'event-id'; }}},
  localStorage:{getItem(key){ return storage.has(key) ? storage.get(key) : null; },setItem(key,value){ storage.set(key,String(value)); }},
  console, Date, Math, Number, String, JSON,
  runID:'run-1', RUN_ID_KEY:'run-id', gameMode:'standard', room:1,
  currentQuestion:{version:1,difficulty:'hard'}, adaptiveMode:'support', remediationState:null,
  fadingFortuneScore:0, scoreAttackScore:0, scoreAttackBestScore:0,
  FACULTY_COMPOSITION_CONFIG:{title:'Telemetry Test',slug:'telemetry-test'}
};
vm.createContext(telemetryContext);
vm.runInContext(`
  const TELEMETRY_PREFIX='test:';
  const LATEST_TELEMETRY_RUN_KEY='test:latest';
  const TELEMETRY_VERSION='faculty-local-v3';
  const GAME_VERSION='test';
  ${extractFunction(template, 'createTelemetryEventID')}
  ${extractFunction(template, 'getTelemetryKey')}
  ${extractFunction(template, 'readLocalTelemetry')}
  ${extractFunction(template, 'sendGameData')}
`, telemetryContext);
runTelemetry(`sendGameData({event:'question',questionId:7,responseTime:13000,activeResponseTime:8000,hiddenTime:5000,tabSwitchCount:1,timeAfterReturn:3000,correct:1})`);
runTelemetry(`sendGameData({event:'start',responseTime:999,activeResponseTime:999,hiddenTime:999,tabSwitchCount:9,timeAfterReturn:999})`);
runTelemetry(`sendGameData({event:'question',questionId:8,responseTime:9000,correct:1})`);
function runTelemetry(code){ return vm.runInContext(code, telemetryContext); }
const telemetryRows = JSON.parse(storage.get('test:run-1'));
cases.telemetryRows = telemetryRows.map(row => ({
  event:row.event,responseTimeMs:row.responseTimeMs,activeResponseTimeMs:row.activeResponseTimeMs,
  hiddenTimeMs:row.hiddenTimeMs,tabSwitchCount:row.tabSwitchCount,timeAfterReturnMs:row.timeAfterReturnMs
}));
assertTiming(cases.telemetryRows[0], {responseTimeMs:13000,activeResponseTimeMs:8000,hiddenTimeMs:5000,tabSwitchCount:1,timeAfterReturnMs:3000}, 'question telemetry');
assertTiming(cases.telemetryRows[1], {responseTimeMs:0,activeResponseTimeMs:0,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:''}, 'non-question telemetry');
assertTiming(cases.telemetryRows[2], {responseTimeMs:9000,activeResponseTimeMs:9000,hiddenTimeMs:0,tabSwitchCount:0,timeAfterReturnMs:''}, 'legacy call fallback');

const sourceChecks = {
  rawResponsePreserved:template.includes('const responseTime = responseTiming.responseTimeMs;'),
  masteryUsesActive:template.includes('recordAdaptiveAttempt(currentQuestion, isCorrect, activeResponseTime);'),
  legacyFallback:template.includes('record?.activeResponseTime ?? record?.activeResponseTimeMs ?? record?.responseTime ?? record?.responseTimeMs'),
  rapidGuessUsesRaw:template.includes('checkRapidGuessing(isCorrect, responseTime);'),
  scoreUsesRaw:template.includes('applyScoreAttackForAnswer(isCorrect, responseTime);'),
  fadingPauseDoesNotShiftRawClock:!template.includes('questionStartTime += pausedFor;'),
  visibilityListener:template.includes('handleQuestionVisibilityChange();'),
  nonQuestionDefaults:template.includes('const responseTimeMs = isResponseEvent ?') && template.includes(': 0;'),
  saveResumeResetsViaPresentation:template.includes('phase15BaseDisplayQuestion();') && template.includes('resetQuestionVisibilityTiming();')
};
for(const [name, passed] of Object.entries(sourceChecks)) if(!passed) throw new Error(`Source check failed: ${name}`);

const result = {
  schema:'visibility-aware-question-timing-v1',
  ok:true,
  cases,
  csvTimingColumns:expectedTimingColumns,
  convention:{timeAfterReturnMs:'Blank/null when no hidden interval returned to visibility, and when submitted while still hidden; otherwise milliseconds since the most recent visible return.'},
  sourceChecks
};
console.log(JSON.stringify(result, null, 2));
