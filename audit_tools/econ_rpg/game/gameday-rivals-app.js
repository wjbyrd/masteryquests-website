import { createSeason, commitRival, revealRound, nextRound } from './gameday-rivals-engine.js';
import { loadSeason, saveSeason, clearSeason } from './gameday-rivals-storage.js';
import { renderGame, money, shareLabels } from './gameday-rivals-view.js';
export function mount(scenario) {
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='./gameday-rivals.css';document.head.append(stylesheet);
  document.body.classList.add('gr-game');document.title=`${scenario.title} · Mastery Quests`;document.querySelector('#scenario-title').textContent=scenario.title;
  const view=document.querySelector('#view'),dashboard=document.querySelector('#state-panel');view.className='panel gr-command';dashboard.className='panel gr-dashboard';
  const layout=document.querySelector('.layout');layout.className='gr-layout';
  const ledger=document.createElement('section');ledger.className='panel gr-history';ledger.setAttribute('aria-label','Season history');layout.append(ledger);
  let storage;try{storage=window.localStorage;}catch{storage=null;}
  const loaded=loadSeason(storage);let saved=loaded.run,run=null,commitment=null,locked=false;
  const seedParam=new URLSearchParams(window.location.search).get('seed');
  const qaSeed=seedParam!==null && /^\d+$/.test(seedParam) && Number(seedParam)<=0xffffffff ? Number(seedParam) : null;
  const notice=text=>{const box=document.querySelector('#storage-notice');box.textContent=text;box.hidden=!text;};
  if(loaded.reason) notice(loaded.reason==='version'?'This saved season uses a different version. Start a new season.':'Saved season could not be verified. Start a new season.');
  if(seedParam!==null && qaSeed===null) notice('QA seed must be an integer from 0 to 4294967295. New seasons will use an automatic seed.');
  const announcement=document.querySelector('#announcement');
  function paint(focus=true) {
    // Resolve once from pre-round history, before strategy buttons are rendered.
    commitment=run?.phase==='observe'?commitRival(run):null;
    renderGame(scenario,run,saved,{view,dashboard,ledger},actions,qaSeed);
    document.querySelector('#restart').hidden=!run&&!saved;
    if(focus){const heading=document.querySelector('#view-title');heading.focus({preventScroll:true});view.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function start() {run=createSeason(qaSeed===null?{}:{seed:qaSeed});locked=false;paint();}
  function reset() {const cleared=clearSeason(storage);notice(cleared?'':'The old season could not be cleared because browser storage is unavailable.');saved=null;run=null;start();announcement.textContent='New season started. History, profits and shares have reset.';}
  const actions={
    start,
    resume(){run=saved;paint();},
    choose(action){
      if(locked||run?.phase!=='observe') return;
      locked=true;view.querySelectorAll('[data-strategy]').forEach(b=>b.disabled=true);
      const resolved=revealRound(run,action,commitment);run=resolved;
      if(!saveSeason(storage,run)) notice('This season could not be saved. You can keep playing while this page is open.');
      saved=nextRound(run);paint();
      const h=run.history.at(-1);announcement.textContent=`Both offers revealed. You: ${h.playerAction}. Rival: ${h.rivalAction}. Your game-day profit: ${money(h.playerProfit)}. Rival profit: ${money(h.rivalProfit)}. Your game-day order share: ${h.playerRoundOrderShare} percent. Your season market share: ${shareLabels(run.history).player}.`;
    },
    next(){if(run?.phase!=='reveal')return;run=nextRound(run);locked=false;paint();},
    reset
  };
  const dialog=document.querySelector('#restart-dialog');document.querySelector('#restart').textContent='New Season';
  document.querySelector('#restart-title').textContent='Start a new season?';dialog.querySelector('p').textContent='Clear this season’s history, profits and shares. Other games’ saves will stay intact.';
  document.querySelector('#confirm-restart').textContent='Start New Season';document.querySelector('#cancel-restart').textContent='Keep This Season';
  document.querySelector('#restart').addEventListener('click',()=>dialog.showModal());
  document.querySelector('#cancel-restart').addEventListener('click',()=>dialog.close());
  document.querySelector('#confirm-restart').addEventListener('click',()=>{dialog.close();reset();});
  paint(false);
}
