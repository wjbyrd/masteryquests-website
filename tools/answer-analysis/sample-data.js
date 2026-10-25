'use strict';
// Fictional economics class. This walkthrough never uses student records.
function MQSampleData(){
  const questions=[
  {
    "snapshot": {
      "schema": "mq-answer-snapshot/2",
      "gameID": "synthetic-market",
      "questionID": "S1",
      "questionVersion": "1",
      "prompt": "With demand unchanged, what happens to equilibrium quantity when supply increases?",
      "options": [
        "It decreases",
        "It increases",
        "It stays unchanged"
      ],
      "optionOrder": "canonical",
      "assetRevision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "questionRevision": "d6899dda2f3f15a225b6b6efa625f4cee75e365a20cabb43196d4707025e92a7",
      "contentRevision": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "correctOptionIndices": [
        1
      ],
      "objectiveID": "LO1",
      "objectiveLabel": "Supply and market equilibrium"
    },
    "tag": "supply",
    "objective": "LO1"
  },
  {
    "snapshot": {
      "schema": "mq-answer-snapshot/2",
      "gameID": "synthetic-market",
      "questionID": "E1",
      "questionVersion": "1",
      "prompt": "At a price below equilibrium, which market condition occurs?",
      "options": [
        "A surplus",
        "A shortage",
        "Neither a surplus nor a shortage"
      ],
      "optionOrder": "canonical",
      "assetRevision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "questionRevision": "14bd8204e84768866fde018233677cddad851df00e24b07d9868ef99ed7517a6",
      "contentRevision": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "correctOptionIndices": [
        1
      ],
      "objectiveID": "LO2",
      "objectiveLabel": "Market equilibrium and price adjustment"
    },
    "tag": "equilibrium",
    "objective": "LO2"
  },
  {
    "snapshot": {
      "schema": "mq-answer-snapshot/2",
      "gameID": "synthetic-market",
      "questionID": "T1",
      "questionVersion": "1",
      "prompt": "Who bears more of a tax when demand is less elastic than supply?",
      "options": [
        "Producers",
        "Consumers",
        "Both sides always bear equal shares"
      ],
      "optionOrder": "canonical",
      "assetRevision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "questionRevision": "cc2a3e03336e8f70d7220bc88c310b4fa87b039c1a48cd1fcbd2f0fa246a203b",
      "contentRevision": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "correctOptionIndices": [
        1
      ],
      "objectiveID": "LO3",
      "objectiveLabel": "Tax incidence"
    },
    "tag": "tax_wedge_incidence",
    "objective": "LO3"
  },
  {
    "snapshot": {
      "schema": "mq-answer-snapshot/2",
      "gameID": "synthetic-market",
      "questionID": "T2",
      "questionVersion": "1",
      "prompt": "Which side of a market generally bears more of a tax?",
      "options": [
        "The more elastic side",
        "The less elastic side",
        "The side legally required to remit the tax"
      ],
      "optionOrder": "canonical",
      "assetRevision": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "questionRevision": "a71763d549c0bd7ee3ec95f2b7603ec452b603d5ef2720e0908fdc3550bbcc21",
      "contentRevision": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "correctOptionIndices": [
        1
      ],
      "objectiveID": "LO3",
      "objectiveLabel": "Tax incidence"
    },
    "tag": "tax_incidence_less_elastic_side",
    "objective": "LO3"
  }
];
  const rows=[],game='Sample economics class (fictional)';
  const endings=['complete','quiz_complete','legendary_complete','timed_ended_early','riskReward_bust',null];
  for(let run=0;run<6;run++){
    const runID='run-'+run;
    rows.push({event:'start',eventID:'start-'+run,runID,game,localSequence:1});
    for(let i=0;i<8;i++){
      const q=questions[i%4],correct=i%4===0||(i%4===1&&run<3)||(i%4===2&&run<1),selectedIndex=correct?1:0;
      rows.push({event:'question',eventID:'event-'+run+'-'+i,attemptID:'attempt-'+run+'-'+i,runID,game,
        mode:run%2?'trialGraph':'quiz',tag:q.tag,objective:q.objective,correct:Number(correct),localSequence:i+2,
        responseTimeMs:[10000,15000,30000,33000,59000,60000,120000,425000][i],elapsedTimeMs:(i+1)*94000,
        difficulty:['easy','medium','hard','legendary'][i%4],type:i%2?'calculation':'concept',streak:i%3,
        remediationStage:i===4?'repair':i===5?'bridge':i===6?'retest':'',originAttemptID:i>=4&&i<=6?'attempt-'+run+'-3':'',
        supportJSON:JSON.stringify({artifactApplied:run===5,artifactRemovedCanonical:run===5?[2]:[],modeRemovedCanonical:[]}),
        answerSnapshotJSON:JSON.stringify({...q.snapshot,selectedIndex,selectedAnswer:q.snapshot.options[selectedIndex],priorExposureCount:i>=4?1:0})});
    }
    if(endings[run])rows.push({event:endings[run],eventID:'end-'+run,runID,game,localSequence:10,totalTimeMs:(run+10)*60000,totalAttempts:8,maxStreak:3});
  }
  return rows;
}
