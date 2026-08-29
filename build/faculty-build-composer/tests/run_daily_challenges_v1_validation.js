const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const core = require('../composer-core.js');

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'template', 'mastery-quests-faculty-template-composer-ready.html');
const template = fs.readFileSync(templatePath, 'utf8');

function markedSource(start, end){
  const startIndex = template.indexOf(start);
  const endIndex = template.indexOf(end, startIndex);
  assert(startIndex >= 0, `Missing source marker: ${start}`);
  assert(endIndex > startIndex, `Missing source boundary: ${end}`);
  return template.slice(startIndex, endIndex);
}

function makeElement(id = ''){
  const element = {
    id,
    hidden:false,
    dataset:{},
    style:{},
    textContent:'',
    innerText:'',
    children:[],
    attributes:{},
    isConnected:true,
    className:'',
    classList:{add(){},remove(){},toggle(){}},
    setAttribute(name,value){this.attributes[name] = String(value);},
    addEventListener(){},
    append(...items){this.children.push(...items);},
    appendChild(item){this.children.push(item);return item;},
    querySelector(selector){return selector === '.daily-toast' ? this.children.find(item => /daily-toast/.test(item.className)) || null : null;},
    focus(){},
    remove(){this.isConnected=false;}
  };
  Object.defineProperty(element, 'innerHTML', {
    get(){return this._innerHTML || '';},
    set(value){this._innerHTML=String(value);this.children=[];}
  });
  return element;
}

function storage(){
  const values = new Map();
  return {
    getItem:key => values.has(String(key)) ? values.get(String(key)) : null,
    setItem:(key,value) => values.set(String(key),String(value)),
    removeItem:key => values.delete(String(key)),
    clear:() => values.clear(),
    key:index => [...values.keys()][index] || null,
    get length(){return values.size;}
  };
}

const elements = Object.fromEntries([
  'dailyTaskDock','dailyTaskPill','dailyDetailsPanel','dailyDetailsTitle','dailyDetailsMeta',
  'dailyDetailsProgress','dailyLifetimeValue','dailyMilestoneValue','dailyMilestoneMeta','dailyToastRegion'
].map(id => [id, makeElement(id)]));
const context = vm.createContext({
  console,
  Date,
  Math,
  JSON,
  Set,
  globalThis:null,
  localStorage:storage(),
  sessionStorage:storage(),
  setTimeout:() => 1,
  clearTimeout:() => {},
  document:{
    body:{dataset:{}},
    getElementById:id => elements[id] || null,
    createElement:() => makeElement(),
    addEventListener(){}
  }
});
context.globalThis = context;

const coreSource = markedSource('const DailyChallengesCore = (() => {', '// =============================================\n// DAILY CHALLENGES V1 — BROWSER ADAPTER');
vm.runInContext(coreSource, context, {filename:'daily-core.js'});
const daily = context.MQDailyChallengesCore;
assert(daily, 'Daily core must be exposed for validation and diagnostics.');

const allFamilies = [...daily.FAMILY_ORDER];
const eligibility = {accessibleQuestionCount:40,graphQuestionCount:12,conceptCount:4};
const first = daily.resolveDaily({identity:'quest-a',date:'2026-08-29',eligibleFamilies:allFamilies,history:[],context:eligibility});
const firstAgain = daily.resolveDaily({identity:'quest-a',date:'2026-08-29',eligibleFamilies:allFamilies,history:[],context:eligibility});
assert.deepStrictEqual(first, firstAgain, 'Same quest/date/opportunity set must resolve identically.');
const firstWithDifferentHistory = daily.resolveDaily({
  identity:'quest-a',date:'2026-08-29',eligibleFamilies:allFamilies,
  history:[{date:'2026-08-28',family:'graph_questions'},{date:'2026-08-27',family:'streak'}],context:eligibility
});
assert.deepStrictEqual(first, firstWithDifferentHistory, 'Persisted history must not make a locked Quest/date vary across browsers.');

const next = daily.resolveDaily({
  identity:'quest-a',
  date:'2026-08-30',
  eligibleFamilies:allFamilies,
  history:[{date:'2026-08-29',family:first.family}],
  context:eligibility
});
assert.notStrictEqual(next.id, first.id, 'Next local date must receive a new date-specific Daily ID.');
assert.notStrictEqual(next.family, first.family, 'Immediate family repeats must be excluded when alternatives exist.');
assert.strictEqual(
  daily.selectFamily(['correct_answers'], 'limited', [{date:'2026-08-28',family:'correct_answers'}], '2026-08-29'),
  'correct_answers',
  'Cooldown must relax safely for a one-family Quest.'
);

const narrowBanks = {easy:[{id:1,q:'One',options:['A','B'],primaryConceptId:'only'}]};
const narrowContext = daily.getEligibilityContext(narrowBanks,['exam'],{exam:['easy','repair','bridge']});
const narrowFamilies = daily.getEligibleFamilies(narrowContext);
assert(!narrowFamilies.includes('graph_questions'), 'Graph Daily must be unavailable without enough accessible graph questions.');
assert(!narrowFamilies.includes('concept_variety'), 'Concept variety must be unavailable with fewer than two accessible concepts.');
assert(narrowFamilies.length >= 4, 'A narrow Quest must retain universal Daily families.');
assert(daily.resolveDaily({identity:'narrow',date:'2026-08-29',eligibleFamilies:narrowFamilies,history:[],context:narrowContext}).target > 0);

function run(family,target,events,extra = {}){
  const definition = {family,target,windowSize:extra.windowSize || 0};
  let progress = daily.createProgress();
  let result;
  for(const event of events){
    result = daily.applyProgress(definition,progress,{timestamp:'2026-08-29T12:00:00.000Z',...event});
    progress = result.progress;
  }
  return {progress,result};
}

assert.strictEqual(run('correct_answers',3,[{correct:true},{correct:false},{correct:true},{correct:true}]).progress.completed,true);
assert.strictEqual(run('streak',5,[{streak:2},{streak:5}]).progress.completed,true);
const stretch = run('perfect_stretch',3,[{correct:true},{correct:true},{correct:false},{correct:true}]);
assert.strictEqual(stretch.progress.value,1,'Perfect stretch must reset only its Daily counter on a miss.');
const graph = run('graph_questions',2,[{correct:true,isGraph:false},{correct:false,isGraph:true},{correct:true,isGraph:true},{correct:true,isGraph:true}]);
assert.strictEqual(graph.progress.value,2,'Only correct graph questions may count.');
const concepts = run('concept_variety',2,[{correct:true,concept:'a'},{correct:true,concept:'a'},{correct:false,concept:'b'},{correct:true,concept:'b'}]);
assert.strictEqual(concepts.progress.value,2,'Concept variety must count unique correctly answered concepts.');

let accuracyProgress = daily.createProgress();
let last;
for(const correct of [true,false,false,false,false]){
  last = daily.applyProgress({family:'accuracy_window',target:4,windowSize:5},accuracyProgress,{correct,timestamp:'2026-08-29T12:00:00.000Z'});
  accuracyProgress = last.progress;
}
assert.strictEqual(last.windowFailed,true,'A failed fixed window must be observable.');
assert.strictEqual(last.windowAttemptBefore,1,'Window telemetry must identify the window that received the event.');
assert.strictEqual(accuracyProgress.windowNumber,2,'A failed fixed window must start a new attempt.');
assert.strictEqual(accuracyProgress.value,0,'A retry must begin with a clean Daily-window score.');
for(const correct of [true,true,true,true,false]){
  last = daily.applyProgress({family:'accuracy_window',target:4,windowSize:5},accuracyProgress,{correct,timestamp:'2026-08-29T12:01:00.000Z'});
  accuracyProgress = last.progress;
}
assert.strictEqual(accuracyProgress.completed,true,'A later successful fixed window must complete the Daily.');

vm.runInContext(`
const STORAGE_PREFIX = 'daily-test';
const FACULTY_COMPOSITION_CONFIG = {
  compositionFingerprint:'quest-fingerprint', compositionId:'quest', slug:'quest', title:'Quest',
  supportedModes:['exam'], dailyChallengesEnabled:true
};
const FACULTY_MODE_REQUIREMENTS = {exam:['easy','medium','hard','repair','bridge']};
const questionBanks = {
  easy:[
    {id:'q1',q:'Graph A',options:['A','B'],image:'graph-a.webp',primaryConceptId:'concept-a'},
    {id:'q2',q:'Graph B',options:['A','B'],image:'graph-b.webp',primaryConceptId:'concept-b'},
    {id:'q3',q:'Graph C',options:['A','B'],image:'graph-c.webp',primaryConceptId:'concept-c'},
    {id:'q4',q:'Graph D',options:['A','B'],image:'graph-d.webp',primaryConceptId:'concept-d'}
  ], medium:[], hard:[]
};
`, context);
const adapterSource = markedSource('// DAILY CHALLENGES V1 — BROWSER ADAPTER', '\nfunction getFacultyPool(poolName)');
vm.runInContext(adapterSource, context, {filename:'daily-adapter.js'});
const persistedBefore = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
const lockedID = persistedBefore.today.id;
context.initializeDailyChallenges();
const persistedAfter = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
assert.strictEqual(persistedAfter.today.id,lockedID,'Refresh-style initialization must not reroll today.');

context.toastCount = 0;
vm.runInContext('showDailyToast = () => { toastCount += 1; };', context);
for(let index=1;index<=16;index++){
  context.recordDailyGameplayEvent({
    correct:true,
    streak:index,
    question:{id:`event-${index}`,image:'graph.webp',primaryConceptId:`concept-${index}`},
    timestamp:`2026-08-29T12:00:${String(index).padStart(2,'0')}.000Z`
  });
  const current = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
  if(current.today.progress.completed) break;
}
const completed = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
assert.strictEqual(completed.today.progress.completed,true,'Qualifying gameplay must complete the selected Daily.');
assert.strictEqual(completed.totalCompleted,1,'Completion must credit exactly one lifetime Daily.');
assert.strictEqual(context.toastCount,1,'Completion toast must fire once at the completion transition.');
context.recordDailyGameplayEvent({correct:true,streak:20,question:{id:'after',image:'graph.webp',primaryConceptId:'after'}});
const afterExtraPlay = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
assert.strictEqual(afterExtraPlay.totalCompleted,1,'A completed date must not be double-credited.');
assert.strictEqual(afterExtraPlay.today.progress.postCompletionQuestions,1,'Gameplay after completion must be retained for continuation analysis.');
assert.strictEqual(context.toastCount,1,'Later gameplay must not repeat the completion toast.');
context.initializeDailyChallenges(new Date(2026,7,31));
context.initializeDailyChallenges(new Date(2026,8,2));
const afterMissedDays = JSON.parse(context.localStorage.getItem('daily-test:daily:v1'));
assert.strictEqual(afterMissedDays.totalCompleted,1,'Missing calendar days must not reset lifetime Daily progression.');

(async()=>{
  const library = {libraryVersion:'test',librarySha256:'abc',registry:{concepts:[]}};
  const recipe = {schemaVersion:'1.2.0',title:'Daily Test',slug:'daily-test',supportedModes:['exam'],selectedConceptIds:[],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const config = await core.createConfig(recipe,library,'template-sha');
  assert.strictEqual(config.dailyChallengesEnabled,true,'Composer output must enable Dailies through configuration.');
  assert(template.includes('"dailyChallengesEnabled": true'));
  assert(template.includes('event:"daily_complete"'));
  assert(template.includes('"dailyEligibleFamilies"'));
  console.log(JSON.stringify({ok:true,tests:26,selectedFamily:first.family,nextFamily:next.family,adapterFamily:completed.today.family},null,2));
})().catch(error => { console.error(error); process.exit(1); });
