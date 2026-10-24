import {releaseRows} from './release-fixtures.mjs';
import {contractHash} from '../telemetry_contract/hash.mjs';
// Constructed arithmetic fixture, not a substitute for the private Cost Directive data.
export function referenceShapeRows(){
  const base=releaseRows()[0],saved=JSON.parse(base.answerSnapshotJSON),seen=new Map();
  return Array.from({length:881},(_,i)=>{
    const questionID='synthetic-cost-'+i%354,runID='synthetic-run-'+i%18,correct=i<787,selectedIndex=correct?1:0;
    const content={gameID:'synthetic-cost',questionID,questionVersion:'1',prompt:`Synthetic cost reasoning item ${i%354+1}`,options:saved.options,optionOrder:'canonical',assetRevision:'a'.repeat(64)};
    const prior=seen.get(runID+'|'+questionID)||0;seen.set(runID+'|'+questionID,prior+1);
    return {...base,game:'Synthetic Cost Reference',runID,eventID:'reference-'+i,attemptID:'reference-'+i,localSequence:Math.floor(i/18)+1,correct:Number(correct),
      responseTimeMs:i<441?33000:i<880?155000:216000,
      answerSnapshotJSON:JSON.stringify({...saved,...content,questionRevision:contractHash(content),selectedIndex,selectedAnswer:saved.options[selectedIndex],priorExposureCount:prior})};
  });
}
export function dashboardRows(){
  const source=releaseRows(),rows=[];
  for(let run=0;run<6;run++){
    rows.push({event:'start',eventID:`start-${run}`,runID:`run-${run}`,game:'Synthetic Market Practice',localSequence:1});
    for(let i=0;i<8;i++){
      const row=source[run*8+i];
      rows.push({...row,localSequence:i+2,responseTimeMs:[10000,15000,30000,33000,59000,60000,120000,425000][i],elapsedTimeMs:(i+1)*94000,
        difficulty:['easy','medium','hard','legendary'][i%4],type:i%2?'calculation':'concept',
        remediationStage:i===4?'repair':i===5?'bridge':i===6?'retest':'',originAttemptID:i>=4&&i<=6?`attempt-${run}-3`:'',streak:i%3});
    }
    const ending=['complete','quiz_complete','legendary_complete','timed_ended_early','riskReward_bust',null][run];
    if(ending)rows.push({event:ending,eventID:`end-${run}`,runID:`run-${run}`,game:'Synthetic Market Practice',localSequence:10,totalTimeMs:(run+10)*60000,totalAttempts:8,maxStreak:3});
  }
  return rows;
}
