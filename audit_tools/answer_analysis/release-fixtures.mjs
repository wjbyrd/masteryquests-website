import {contractHash} from '../telemetry_contract/hash.mjs';
export function releaseRows(){
 const questions=[
  {id:'S1',prompt:'With demand unchanged, what happens to equilibrium quantity when supply increases?',options:['It decreases','It increases','It stays unchanged'],tag:'supply',objective:'LO1',label:'Supply and market equilibrium'},
  {id:'E1',prompt:'At a price below equilibrium, which market condition occurs?',options:['A surplus','A shortage','Neither a surplus nor a shortage'],tag:'equilibrium',objective:'LO2',label:'Market equilibrium and price adjustment'},
  {id:'T1',prompt:'Who bears more of a tax when demand is less elastic than supply?',options:['Producers','Consumers','Both sides always bear equal shares'],tag:'tax_wedge_incidence',objective:'LO3',label:'Tax incidence'},
  {id:'T2',prompt:'Which side of a market generally bears more of a tax?',options:['The more elastic side','The less elastic side','The side legally required to remit the tax'],tag:'tax_incidence_less_elastic_side',objective:'LO3',label:'Tax incidence'}
 ];
 const rows=[];
 for(let run=0;run<6;run++)for(let i=0;i<8;i++){
  const q=questions[i%4],correct=i%4===0||i%4===1&&run<3||i%4===2&&run<1,selected=correct?1:0;
  const content={gameID:'synthetic-market',questionID:q.id,questionVersion:'1',prompt:q.prompt,options:q.options,optionOrder:'canonical',assetRevision:'a'.repeat(64)};
  rows.push({event:'question',eventID:`event-${run}-${i}`,attemptID:`attempt-${run}-${i}`,runID:`run-${run}`,game:'Synthetic Market Practice',mode:run%2?'trialGraph':'quiz',tag:q.tag,objective:q.objective,correct:correct?1:0,
   supportJSON:JSON.stringify({artifactApplied:run===5,artifactRemovedCanonical:run===5?[2]:[],modeRemovedCanonical:[]}),
   answerSnapshotJSON:JSON.stringify({schema:'mq-answer-snapshot/2',...content,questionRevision:contractHash(content),contentRevision:'b'.repeat(64),selectedIndex:selected,selectedAnswer:q.options[selected],priorExposureCount:i>=4?1:0,correctOptionIndices:[1],objectiveID:q.objective,objectiveLabel:q.label})});
 }
 return rows;
}
export function csv(rows){const keys=Array.from(new Set(rows.flatMap(Object.keys)));return [keys,...rows.map(r=>keys.map(k=>r[k]??''))].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');}
