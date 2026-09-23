import { CONFIG } from './config.js';
export const STAGES = ['Build the labor force','Who counts where?','Unemployment rate','Labor-force participation','Direct change','New participants','Discouraged workers','Mixed flows','Headline audit'];
export const QUESTIONS = [
  {id:'base',stage:0}, ...CONFIG.people.map((p,person)=>({id:`classify-${p.id}`,stage:1,person})),
  {id:'ur',stage:2},{id:'lfpr',stage:3},{id:'direct-predict',stage:4},{id:'direct-calc',stage:4},
  {id:'expansion-predict',stage:5},{id:'expansion-calc',stage:5},{id:'expansion-interpret',stage:5},
  {id:'discouraged-calc',stage:6},{id:'discouraged-interpret',stage:6},
  {id:'mixed-calc',stage:7},{id:'mixed-interpret',stage:7},{id:'headline',stage:8},
];
export const POOLS = {baselineID:CONFIG.baselines,directID:CONFIG.direct,expansionID:CONFIG.expansions,discouragedID:CONFIG.discouraged,mixedID:CONFIG.mixed,headlineID:CONFIG.headlines};
export const question = run => QUESTIONS[run.step];
export function labor({adultPopulation,employed,unemployed}) {
  if (![adultPopulation,employed,unemployed].every(Number.isSafeInteger) || adultPopulation<=0 || employed<0 || unemployed<0 || employed+unemployed>adultPopulation || employed+unemployed===0) throw Error('Invalid labor population');
  const laborForce=employed+unemployed, nilf=adultPopulation-laborForce;
  return {adultPopulation,employed,unemployed,laborForce,nilf,ur:unemployed/laborForce*100,lfpr:laborForce/adultPopulation*100};
}
// Flows use the before-period pools. An entrant is not counted twice.
export function move(before,{hired=0,lost=0,toEmployed=0,toUnemployed=0,discouraged=0}={}) {
  if (![hired,lost,toEmployed,toUnemployed,discouraged].every(n=>Number.isSafeInteger(n)&&n>=0) || hired+discouraged>before.unemployed || lost>before.employed || toEmployed+toUnemployed>before.nilf) throw Error('Invalid population flow');
  return labor({adultPopulation:before.adultPopulation,employed:before.employed+hired-lost+toEmployed,unemployed:before.unemployed-hired+lost+toUnemployed-discouraged});
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
export const proportional = b => {const d=gcd(b.employed,b.unemployed);return {toEmployed:b.employed/d,toUnemployed:b.unemployed/d};};
export const direction=(a,b)=>Math.abs(a-b)<1e-9?'unchanged':b>a?'rises':'falls';
export function selections(seed,previous={}) {
  let x=seed>>>0;
  return Object.fromEntries(Object.entries(POOLS).map(([key,pool])=>{const choices=pool.filter(p=>p.id!==previous[key]);x=(Math.imul(1664525,x)+1013904223)>>>0;return [key,choices[Math.floor(x/2**32*choices.length)].id];}));
}
export function newRun(seed,runID=crypto.randomUUID(),startedAt=Date.now(),previous={}) {
  const prior=Object.fromEntries(Object.keys(POOLS).filter(k=>POOLS[k].some(p=>p.id===previous[k])).map(k=>[k,previous[k]]));
  return {version:1,seed:seed>>>0,runID,startedAt,previous:prior,...selections(seed,prior),step:-1,solved:false,attempts:{},first:{},hints:{},answer:null,feedback:'',history:[]};
}
export function model(run) {
  const pick=key=>POOLS[key].find(p=>p.id===run[key]);
  const base=labor(pick('baselineID')),d=pick('directID'),e=pick('expansionID'),c=pick('discouragedID'),x=pick('mixedID');
  const directFlow=d.kind==='hiring'?{hired:d.count}:{lost:d.count};
  const expansionFlow=e.proportional?proportional(base):{toEmployed:e.toEmployed,toUnemployed:e.toUnemployed};
  const discouragedFlow={discouraged:c.count};
  const mixedFlow={hired:x.hired,toEmployed:x.toEmployed,toUnemployed:x.toUnemployed};
  const headlineFlow={hiring:{hired:3},discouraged:{discouraged:2},losses:{lost:5},'search-entry':{toEmployed:3,toUnemployed:12},'same-share':proportional(base),'job-entry':{toEmployed:12}}[run.headlineID];
  const stage=question(run)?.stage??(run.step===QUESTIONS.length?8:0);
  const group={4:'direct',5:'expansion',6:'discouraged',7:'mixed',8:'headline'}[stage];
  const flows={direct:directFlow,expansion:expansionFlow,discouraged:discouragedFlow,mixed:mixedFlow,headline:headlineFlow};
  const cases=Object.fromEntries(Object.entries(flows).map(([key,flow])=>[key,move(base,flow)]));
  const scene=stage===4?(d.kind==='hiring'?2:3):stage===5?4:stage===6?5:stage>=7?6:1;
  return {base,...cases,flows,group,current:group?cases[group]:base,flow:flows[group]||{},scene:CONFIG.scenes[scene-1]};
}
export const headlineLabels = {
  hiring:'Unemployed people found jobs; participation stayed unchanged.',
  discouraged:'Employment stayed unchanged; unemployed people stopped searching and left the labor force.',
  losses:'People lost jobs and began searching; participation stayed unchanged.',
  'search-entry':'Employment rose, but enough entrants were still searching to raise the unemployed share of the labor force.',
  'same-share':'Employment and unemployment grew in the same proportion; participation rose while UR stayed unchanged.',
  'job-entry':'Adults outside the labor force found jobs; employment and participation rose while unemployment counts stayed unchanged.',
};
export function options(run) {
  const q=question(run),m=model(run);if(!q)return [];
  if(q.person!==undefined)return [['employed','Employed'],['unemployed','Unemployed'],['nilf','Not in the labor force']];
  if(q.id.endsWith('-predict'))return [['rises','Rises'],['falls','Falls'],['unchanged','Stays unchanged']];
  if(q.id==='expansion-interpret')return [['share','Entrants who are still searching can increase the unemployed share of the labor force, even when employment grows.'],['jobs','Any increase in employment must lower UR.'],['population','UR divides unemployed people by the whole adult population.']];
  if(q.id==='discouraged-interpret')return [['exit','No employment gain occurred. People stopped searching, left the labor force and lowered both UR and LFPR.'],['jobs','The lower UR proves that people found jobs.'],['counted','People who want work are always counted as unemployed, even after they stop searching.']];
  if(q.id==='mixed-interpret')return [['flows',`Employment rises; UR ${direction(m.base.ur,m.mixed.ur)}; LFPR rises. Job finding and new entrants both matter.`],['only','Only existing unemployed workers found jobs; participation stayed unchanged.'],['exit','Participation fell because unemployed workers stopped searching.']];
  if(q.id==='headline')return CONFIG.headlines.map(h=>[h.id,headlineLabels[h.id]]);
  return [];
}
export function expected(run) {
  const q=question(run),m=model(run);if(!q)return null;
  if(q.person!==undefined)return CONFIG.people[q.person].answer;
  return {base:{laborForce:m.base.laborForce},ur:{ur:m.base.ur},lfpr:{lfpr:m.base.lfpr},
    'direct-predict':direction(m.base.ur,m.direct.ur),'direct-calc':{ur:m.direct.ur,participation:'unchanged'},
    'expansion-predict':'rises','expansion-calc':{ur:m.expansion.ur,lfpr:m.expansion.lfpr},'expansion-interpret':'share',
    'discouraged-calc':{ur:m.discouraged.ur,lfpr:m.discouraged.lfpr},'discouraged-interpret':'exit',
    'mixed-calc':{laborForce:m.mixed.laborForce,ur:m.mixed.ur,lfpr:m.mixed.lfpr},'mixed-interpret':'flows',headline:run.headlineID}[q.id];
}
export function parseNumber(raw) {
  const text=String(raw??'').trim().replace(/\s*%$/,'');
  if(!/^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(text))return null;
  const n=Number(text.replaceAll(',',''));return Number.isFinite(n)&&n<=Number.MAX_SAFE_INTEGER?n:null;
}
export const accepts=(raw,target,key)=>key==='participation'?raw===target:parseNumber(raw)!==null&&!(key==='laborForce'&&String(raw).includes('%'))&&Math.abs(parseNumber(raw)-target)<=(key==='laborForce'?0:CONFIG.rateTolerance+1e-9);
const record=(run,after,action,value=null)=>({...after,history:[...run.history,{action,value}]});
export const start=run=>run.step===-1?record(run,{...run,step:0},'start'):run;
export function submit(run,answer) {
  const q=question(run);if(!q||run.solved)return run;
  const target=expected(run),numeric=typeof target==='object';
  if(!numeric&&!options(run).some(([id])=>id===answer))return run;
  const correct=numeric?Object.entries(target).every(([key,value])=>accepts(answer?.[key],value,key)):answer===target;
  const normalized=numeric?Object.fromEntries(Object.keys(target).map(k=>[k,k==='participation'?(['rises','falls','unchanged'].includes(answer?.[k])?answer[k]:null):parseNumber(answer?.[k])])):answer;
  // Percent signs are invalid on population counts; preserve rejection on save replay.
  if(numeric&&'laborForce' in target&&String(answer?.laborForce).includes('%'))normalized.laborForce=null;
  const attempts=(run.attempts[q.id]||0)+1;
  const guidance=q.person!==undefined?CONFIG.people[q.person].why:q.id==='base'?'Include people with jobs and jobless people who are available and actively searching. Exclude people not in the labor force.':q.id==='ur'?'Use the labor force as the denominator, not the adult population.':q.id==='lfpr'?'Compare the labor force with the adult population.':q.id==='direct-predict'?'People move between employment and unemployment. The size of the labor force does not change.':q.id==='expansion-predict'?'Adults move into the labor force while the adult population stays fixed.':q.id.endsWith('-calc')?'Trace the after-period groups. UR uses the labor force; LFPR uses the adult population. Check each field and round rates to one decimal.':q.id==='headline'?'Compare employment, unemployment and participation in both columns. A rate alone does not identify the population flow.':'Trace who found a job, who is actively searching, and who is outside the labor force. A lower UR alone does not establish why it fell.';
  return record(run,{...run,answer:normalized,solved:correct,feedback:correct?'Verified.':guidance,attempts:{...run.attempts,[q.id]:attempts},first:{...run.first,...(correct?{[q.id]:attempts===1}:{})}},'answer',normalized);
}
export function next(run) {
  if(!question(run)||!run.solved)return run;
  return record(run,{...run,step:run.step+1,solved:false,answer:null,feedback:''},'next');
}
export function hint(run,part) {
  const q=question(run),target=expected(run);
  if(!q||run.solved||typeof target!=='object'||!('ur' in target||'lfpr' in target)||!['concept','formula'].includes(part))return run;
  const current=run.hints[q.id]||{concept:false,formula:false};if(part==='formula'&&!current.concept)return run;
  return record(run,{...run,hints:{...run.hints,[q.id]:{...current,[part]:!current[part]}}},'hint',part);
}
