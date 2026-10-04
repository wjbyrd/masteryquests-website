import {GAME_CONFIG as G} from './config.js';
import {createRun} from './session.js';
import {gapReport} from './model.js';

// Assignment changes the opening, not the two-city simulation or rival decision rules.
export function createAssignedRun({random = Math.random, previousDoctrine = null} = {}) {
  const index = Math.min(G.cities.length - 1, Math.max(0, Math.floor(random() * G.cities.length)));
  return createRun(G.cities[index].id, {random, previousDoctrine});
}
export const rivalRevealed = run => !!run && run.currentCycle >= G.rivalRevealRound;
export const visibleCities = run => !run ? [] : run.cities.filter(city => rivalRevealed(run) || city.id === run.playerCity);

// Presentation thresholds only, not economic coefficients or a new score.
// Gap thresholds are percentage points of Meridian's output per worker.
export const OUTCOME_RULES={meaningfulGrowth:5,significantClosure:10,nearGap:10,levelPrecision:1};
export const roleGoal=run=>{
  const player=run.cities.find(c=>c.id===run.playerCity),rival=run.cities.find(c=>c.id===run.rivalCity);
  if(run.playerCity==='meridian')return player.outputPerWorker<rival.outputPerWorker?'Regain the lead. Keep growing.':'Protect your lead. Keep growing.';
  return player.outputPerWorker>rival.outputPerWorker?'Hold your new lead.':'Close the gap. Build momentum.';
};
export function raceResult(run) {
  const scores=run.cities.map(city=>{
    const initial=run.initialCities.find(start=>start.id===city.id);
    const growth=(city.outputPerWorker/initial.outputPerWorker-1)*100;
    return {id:city.id,name:city.name,growth,score:Math.round(growth*10)/10||0,level:city.outputPerWorker,displayLevel:Number(city.outputPerWorker.toFixed(OUTCOME_RULES.levelPrecision))};
  });
  const player=scores.find(c=>c.id===run.playerCity),rival=scores.find(c=>c.id===run.rivalCity);
  const meridian=scores.find(c=>c.id==='meridian'),rivermark=scores.find(c=>c.id==='rivermark');
  const gap=gapReport(run.initialCities,run.cities),closure=(gap.start-gap.finish)*100;
  const levelTied=meridian.displayLevel===rivermark.displayLevel;
  const overtaken=rivermark.displayLevel>meridian.displayLevel;
  const near=!overtaken&&!levelTied&&gap.finish*100<=OUTCOME_RULES.nearGap;
  const significant=closure>=OUTCOME_RULES.significantClosure;
  const meaningful=player.growth>=OUTCOME_RULES.meaningfulGrowth;
  let outcome,headline,explanation;
  if(run.playerCity==='meridian'){
    if(overtaken){outcome='overtaken';headline='Your city was overtaken.';explanation='Rivermark finished ahead in output per worker. Your starting advantage did not hold.';}
    else if(levelTied){outcome='level';headline='The rival drew level.';explanation='The cities finished level at the displayed precision. Your earlier lead has disappeared.';}
    else if(near||significant){outcome='closing';headline='You held the lead, but the rival is closing in.';explanation=`Meridian still has higher output per worker, but Rivermark closed ${closure.toFixed(1)} percentage points of the starting gap.`;}
    else if(meaningful){outcome='held-growing';headline='You held the lead and kept growing.';explanation='Meridian retained higher output per worker and improved its own productivity by at least 5%.';}
    else {outcome='held-limited';headline='You held the lead, but growth needs attention.';explanation=player.growth<0?'Meridian remains ahead, but its own output per worker fell. Keeping a lead does not by itself mean the city improved.':'Meridian remains ahead, but its own productivity grew by less than 5%. The starting advantage did much of the work.';}
    if(outcome==='closing')explanation+=meaningful?' Your own productivity also grew meaningfully.':player.growth<0?' Your own productivity fell, so the closing gap is not only a rival success.':'Your own productivity grew by less than 5%.';
  }else{
    if(overtaken){outcome='overtook';headline='You overtook the rival.';explanation='Rivermark finished with higher output per worker than Meridian, overturning the starting lead.';}
    else if(levelTied){outcome='level';headline='You caught the rival.';explanation='Both cities finished level at the displayed precision. The starting productivity gap has closed.';}
    else if(near){outcome='near';headline='You nearly caught the rival.';explanation='Rivermark is now within 10% of Meridian’s output per worker. The rival still holds a narrow lead.';}
    else if(significant){outcome='narrowed';headline='You narrowed the gap.';explanation=`Rivermark closed ${closure.toFixed(1)} percentage points of the starting gap. Meridian still has higher output per worker.`;}
    else if(closure>0){outcome='modest';headline='You made progress, but the gap remains wide.';explanation='Rivermark gained relative ground, but closed less than 10 percentage points of the starting gap.';}
    else {outcome='trailing';headline='The rival kept its lead.';explanation='Rivermark did not reduce its relative productivity gap. Growth from a small base was not enough to gain ground.';}
    if(player.growth<0)explanation+=' Your own output per worker fell; relative progress can also reflect a weaker rival.';
  }
  return {scores,player,rival,outcome,headline,explanation,gap,closure,meaningful,levelTied,overtaken};
}
