// Keep utility order identical to Cost Directive without adding controls.
(() => {
  const menu=document.getElementById('gameMenuOptions');
  const sound=document.getElementById('soundToggle');
  const motion=document.getElementById('mqMotionControl')?.closest('.mq-motion-setting');
  if(menu && sound && motion)menu.insertBefore(sound,motion);
})();

// Assessment privacy is a presentation boundary. Keep scoring, canonical Daily
// state, telemetry rows and the 117-column export contract unchanged.
(() => {
  const examActive=()=>gameMode==='exam' && !runEnding;
  const challenge=getBossChallengeLine;
  getBossChallengeLine=function(...args){
    return gameMode==='exam'
      ? 'Respond to all three checkpoint questions. Results are shown together after the checkpoint.'
      : challenge.apply(this,args);
  };
  const track=updateMazeTrack;
  updateMazeTrack=function(...args){
    document.body.dataset.macroMode=gameMode;
    return track.apply(this,args);
  };
  const menuDaily=updateGameMenuDailyAction;
  updateGameMenuDailyAction=function(...args){
    const result=menuDaily.apply(this,args);
    if(examActive())document.getElementById('gameMenuDaily').textContent='Daily Task';
    return result;
  };
  const dailyUI=updateDailyUI;
  updateDailyUI=function(...args){
    if(!examActive())return dailyUI.apply(this,args);
    document.getElementById('dailyTaskDock').hidden=true;
    updateGameMenuDailyAction();
  };
  const toast=showDailyToast;
  showDailyToast=function(...args){if(!examActive())return toast.apply(this,args);};
  const dailyDetails=openDailyFromGameMenu;
  openDailyFromGameMenu=function(...args){
    if(!examActive())return dailyDetails.apply(this,args);
    closeGameModal();
    showGameModal({title:'Daily Task',text:'Daily Task progress is saved. Progress and completion details are available after you finish Exam Drill.',confirmText:'Return to Exam'});
  };
  const start=startGame;
  startGame=function(...args){
    const result=start.apply(this,args);
    if(examActive()){
      document.getElementById('dailyToastRegion').replaceChildren();
      updateDailyUI();
    }
    return result;
  };
  const download=downloadTelemetryCsv;
  downloadTelemetryCsv=function(activeRunID=runID){
    if(examActive() && (!activeRunID || activeRunID===runID)){
      showGameModal({title:'Game Data',text:'Game data are available after you finish Exam Drill.',confirmText:'Return to Exam'});
      return;
    }
    return download.apply(this,arguments);
  };
})();
