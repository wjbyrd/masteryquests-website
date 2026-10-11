import {BASE,CHARACTERS,NODES,RULES} from './data.js';
import {hashSeed,random,clamp} from './random.js';
import {eventContent} from './events.js';
import {resolve} from './consequences.js';
import {carPool} from './markets.js';
import {CHAPTERS,activityOptions,resolveActivity} from './chapters.js';
export const VERSION=3;
const copy=x=>JSON.parse(JSON.stringify(x));
export function createRun(character,seed='road-ahead',runID='local-run',startedAt=0){
  seed=String(seed).slice(0,80);const spec=CHARACTERS.find(c=>c.id===character);if(!spec)throw Error('Unknown character');
  const s={version:VERSION,character,seed,runID,startedAt,rng:hashSeed(seed),position:0,zone:0,turn:0,phase:'ready',attributes:{...BASE},observable:{gpa:3,credential:0,reference:8,sample:0,internship:0,record:0},flags:{route:'portfolio',chanceMilestones:true},history:[],seen:[],draws:[],journal:[],telemetry:[],movement:[],checkpoints:[],activeMilestone:null,visit:null,event:null,result:null,die:null};
  s.attributes[spec.attribute]+=spec.bonus;
  s.observable.gpa=Math.round(clamp(2.1+s.attributes.aptitude*.013+s.attributes.discipline*.01+(random(s)-.5)*.35,0,4)*100)/100;
  const cars=carPool(false);
  s.market={downturn:random(s)<.35,wage:random(s)<.5?48:54,beaconSupport:random(s)<.5,bargainSound:random(s)<cars.sound/cars.count,certifiedSound:random(s)<.9,risk:random(s)<.5?.1:.35,housing:random(s)<.5?'rental':'loan',defect:random(s)<.35};
  emit(s,'game_started',startedAt);emit(s,'character_selected',startedAt);return s;
}
function emit(s,type,at,extra={}){s.telemetry.push({type,runID:s.runID,character:s.character,zone:s.zone,turn:s.turn,eventID:s.event,elapsedMs:Math.max(0,at-s.startedAt),...extra});}
function record(s,choice,resolver,at){
  const before=copy(s.attributes),signalsBefore=copy(s.observable),flagsBefore=copy(s.flags),rngBefore=s.rng;
  s.result=resolver();
  const diff=(a,b)=>Object.fromEntries(Object.keys(a).filter(k=>a[k]!==b[k]).map(k=>[k,b[k]-a[k]]));
  const changes=diff(before,s.attributes),signalChanges=diff(signalsBefore,s.observable);
  s.history.push({eventID:s.event,position:s.position,zone:s.zone,turn:s.turn,character:s.character,circumstance:s.event.startsWith('activity-')?s.die:null,choiceID:choice.id,label:choice.label,tradeoff:choice.detail,immediate:s.result.text,changes,signalChanges,before,after:copy(s.attributes),observableBefore:signalsBefore,observableAfter:copy(s.observable),flagsBefore,flags:copy(s.flags),random:copy(s.draws),rngBefore,rngAfter:s.rng,delayed:s.result.delayed,alternatives:s.result.alternatives||[]});
  s.phase='result';emit(s,'decision_made',at,{choiceID:choice.id,changes,signalChanges});
  for(const delayed of s.result.delayed)emit(s,'delayed_consequence_resolved',at,delayed);
}
function arrive(s,at){
  if(s.visit){const choice=activityOptions(s).find(a=>a.id===s.visit);s.event=`activity-${s.zone}-${choice.id}`;s.seen.push(s.event);emit(s,'activity_started',at,{location:s.position});record(s,choice,()=>resolveActivity(s,choice),at);s.turn++;s.visit=null;}
  else {s.event=s.activeMilestone.event;s.seen.push(s.event);s.phase='event';emit(s,'milestone_reached',at,{location:s.position});}
}
function walkTo(s,target,at){
  const fromZone=NODES[s.position].zone,toZone=NODES[target].zone;
  const stops=fromZone===toZone?[toZone*6,target]:[fromZone*6,fromZone*6+5,toZone*6,target];
  let previous=s.position;s.movement=stops.filter(id=>{if(id===previous)return false;previous=id;return true;});
  // A destination at the current location still consumes a turn, without a lap.
  if(target===s.position)s.movement=[];
  s.destination=target;s.phase='moving';if(!s.movement.length)arrive(s,at);
}
function schedule(s,at){
  s.result=null;s.event=null;s.die=null;
  const chapter=CHAPTERS[s.zone];
  const due=chapter.checkpoints.find(m=>m.after===s.turn&&!s.checkpoints.includes(`${s.zone}:${m.event}`));
  if(due){s.activeMilestone={...due};walkTo(s,due.node,at);return;}
  if(s.turn<RULES.turnsPerChapter){s.phase='ready';return;}
  emit(s,'zone_completed',at);s.zone++;s.turn=0;schedule(s,at);
}
export function transition(state,action,at=state.startedAt){
  const s=copy(state);s.draws=[];
  if(action.type==='roll'){
    if(s.phase!=='ready'||s.turn>=RULES.turnsPerChapter)throw Error('No activity turn available');
    s.die=1+Math.floor(random(s)*6);s.phase='plan';emit(s,'circumstance_rolled',at,{result:s.die});
  }else if(action.type==='visit'){
    if(s.phase!=='plan')throw Error('Roll this turn’s circumstances first');
    const choice=activityOptions(s).find(a=>a.id===action.choice);if(!choice)throw Error('Destination unavailable');
    s.visit=choice.id;walkTo(s,choice.node,at);
  }else if(action.type==='step'){
    if(s.phase!=='moving'||!s.movement.length)throw Error('No movement pending');
    s.position=s.movement.shift();emit(s,'location_entered',at,{location:s.position});if(!s.movement.length)arrive(s,at);
  }else if(action.type==='choose'){
    if(s.phase!=='event')throw Error('No decision open');
    const choice=eventContent(s).choices.find(c=>c.id===action.choice);if(!choice)throw Error('Choice unavailable');
    record(s,choice,()=>resolve(s,action.choice),at);
  }else if(action.type==='continue'){
    if(s.phase!=='result')throw Error('No result open');
    if(s.result.next){s.event=s.result.next;s.phase='event';emit(s,'followup_opened',at);}
    else if(s.event==='final'){s.phase='complete';emit(s,'zone_completed',at);emit(s,'game_completed',at);}
    else {if(s.activeMilestone){s.checkpoints.push(`${s.zone}:${s.activeMilestone.event}`);s.activeMilestone=null;}schedule(s,at);}
  }else throw Error('Unknown action');
  s.journal.push({...action,at});return s;
}
export function restore(raw){
  const saved=JSON.parse(raw);
  if(saved.version!==VERSION||typeof saved.seed!=='string'||typeof saved.runID!=='string'||!Number.isFinite(saved.startedAt)||!Array.isArray(saved.journal)||saved.journal.length>500)throw Error('Unsupported or damaged save');
  let s=createRun(saved.character,saved.seed,saved.runID,saved.startedAt);
  for(const action of saved.journal){if(!Number.isFinite(action.at))throw Error('Invalid action time');s=transition(s,action,action.at);}
  if(JSON.stringify(s)!==JSON.stringify(saved))throw Error('Save does not match its decision history');return s;
}
