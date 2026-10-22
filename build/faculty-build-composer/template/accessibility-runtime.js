/* Embedded in standalone games by audit_tools/accessibility_cleanup/sync.mjs.
 * Presentation only: never reads answer keys, changes timers, or writes run data. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const visible = node => Boolean(node && !node.hidden && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const controls = node => [...new Set([...node.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex]'),...document.querySelectorAll('#mqMotionControl')])]
    .filter(el => visible(el) && !el.disabled && el.tabIndex >= 0 && !el.closest('[inert]'));
  const dialogs = ['graphLightbox','gameModal','quizSetupModal','trialGraphSetupModal','fadingFortuneSetupModal','riskRewardSetupModal','guideIntroScreen','bossRevealScreen'].map(byId).filter(Boolean);
  const screens = ['startScreen','modeSelectScreen'].map(byId).filter(Boolean);
  const ownedInert = new Set();
  const openers = new Map();
  let active = null, lastControl = null;
  document.documentElement.lang ||= 'en';
  const game = document.querySelector('.dungeon-container');
  if(game) { game.setAttribute('role','main'); game.setAttribute('aria-label','Current game'); }
  screens.forEach(el => el.setAttribute('role','main'));
  document.querySelectorAll('.mode-card[aria-label]').forEach(el=>el.removeAttribute('aria-label'));
  document.querySelectorAll('#artifactVault img:not([alt])').forEach(el=>el.alt='');
  // The adjacent guide name already identifies this repeated portrait.
  if(byId('wizardName')?.textContent.trim())document.querySelector('#wizardImage:not([alt])')?.setAttribute('alt','');
  const gameTitle=byId('facultyTopTitle') || document.querySelector('.top-title');
  if(gameTitle){gameTitle.setAttribute('role','heading');gameTitle.setAttribute('aria-level','1');}
  const question=byId('question');
  if(question){question.setAttribute('role','heading');question.setAttribute('aria-level','2');question.tabIndex=-1;}
  const hallway=byId('hallwayTransition');
  if(hallway){
    const syncHallway=()=>{const shown=hallway.classList.contains('active');hallway.setAttribute('aria-hidden',String(!shown));if(shown)window.MQAccessibility?.recordReleasedFeedback(byId('srAnnouncements')?.innerText);};
    new MutationObserver(syncHallway).observe(hallway,{attributes:true,attributeFilter:['class']});syncHallway();
  }
  const live = byId('srAnnouncements');
  if(live) { live.setAttribute('aria-live','polite'); live.setAttribute('role','status'); }
  // These values are already included in the dedicated event announcement.
  ['fadingFortuneHud','riskRewardHud'].forEach(id => byId(id)?.removeAttribute('aria-live'));
  const focus = el => { if(!visible(el) || el.closest('[inert]')) return false; el.focus({preventScroll:true}); return document.activeElement === el; };
  function sync() {
    const previouslyFocused=document.activeElement;
    observeFeedback();
    const next = dialogs.filter(visible).sort((a,b) => (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0))[0]
      || screens.find(visible) || null;
    for(const el of ownedInert) el.inert = false;
    ownedInert.clear();
    const motionControl=byId('mqMotionControl');
    if(motionControl){
      const inDialog=dialogs.includes(next);
      const host=inDialog?(next.querySelector('.game-modal-card,.quiz-setup-card,.guide-intro-copy')||next):next?(next.querySelector('.start-content,.mode-select-panel')||next):(game||document.body);
      motionControl.classList.toggle('mq-in-dialog',inDialog);
      if(motionControl.parentElement!==host)host.append(motionControl);
    }
    if(next) {
      // Inert siblings at every level, supporting a dialog nested in a game shell.
      for(let branch=next; branch && branch!==document.body; branch=branch.parentElement) {
        for(const sibling of branch.parentElement.children) {
          if(sibling===branch || ['SCRIPT','STYLE','LINK'].includes(sibling.tagName) || sibling===live || sibling.id==='mqMotionControl') continue;
          if(!sibling.inert) { sibling.inert=true; ownedInert.add(sibling); }
        }
      }
    }
    if(next!==active) {
      const previous=active, previousOpener=openers.get(previous);
      active=next;
      if(next && !openers.has(next)){
        const candidate=previouslyFocused!==document.body && visible(previouslyFocused) && !next.contains(previouslyFocused)
          ? previouslyFocused : lastControl && visible(lastControl) && !next.contains(lastControl) ? lastControl : null;
        openers.set(next,candidate);
      }
      if(previous && !visible(previous))openers.delete(previous);
      if(previous && dialogs.includes(previous) && (!next || next.contains(previousOpener)) && focus(previousOpener)) {
        // Return to the triggering control, including a setup dialog over mode selection.
      } else if(next && !next.contains(document.activeElement)) {
        const first=next.querySelector('h1,h2') || controls(next)[0] || next;
        if(!first.hasAttribute('tabindex') && !first.matches('button,input,select,a,summary')) first.tabIndex=-1;
        focus(first);
      } else if(!next && previous && (previous.contains(document.activeElement) || document.activeElement===document.body)) {
        if(!focus(previousOpener)) focus(byId('question')) || focus(byId('returnMenuBtn'));
      }
    }
  }
  document.addEventListener('click',event => {lastControl=event.target.closest('button,a,input,select,summary,[tabindex]');},true);
  document.addEventListener('keydown',event => {
    if(event.key==='Enter' || event.key===' ') lastControl=document.activeElement;
    if((event.key==='Enter' || event.key===' ') && event.target.matches('#questionImageBox img[role="button"]')){
      event.preventDefault();event.stopImmediatePropagation();event.target.click();return;
    }
    if(!active || !dialogs.includes(active)) return;
    if(event.key==='Tab') {
      const items=controls(active), index=items.indexOf(document.activeElement);
      if(!items.length) {event.preventDefault();active.tabIndex=-1;focus(active);}
      else if(event.shiftKey && index<=0) {event.preventDefault();focus(items.at(-1));}
      else if(!event.shiftKey && (index<0 || index===items.length-1)) {event.preventDefault();focus(items[0]);}
    }
    if(event.key==='Escape') {
      const closers={graphLightbox:()=>closeGraphLightbox(),quizSetupModal:()=>closeQuizSetup(),trialGraphSetupModal:()=>closeTrialGraphSetup(),fadingFortuneSetupModal:()=>closeFadingFortuneSetup(),riskRewardSetupModal:()=>closeRiskRewardSetup()};
      const cancel=byId('gameModalCancel');
      const close=closers[active.id] || (active.id==='gameModal' && visible(cancel) ? ()=>cancel.click() : null);
      if(close) {event.preventDefault();event.stopImmediatePropagation();close();}
    }
  },true);
  const observer=new MutationObserver(sync);
  [...dialogs,...screens].forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['style','class','hidden']}));
  // Store only feedback that the presentation has already released. No answer-key lookup.
  const history=document.createElement('details');history.id='mqReleasedFeedback';history.hidden=true;
  const summary=document.createElement('summary');summary.textContent='Released feedback from this run';
  const entries=document.createElement('ol');history.append(summary,entries);game?.append(history);
  let lastFeedback='';
  // Independent legacy runtimes predate the capability helper; their Exam mode also withholds feedback.
  const permitsReleasedHistory=()=>typeof modeAllowsImmediateCorrectnessFeedback==='function'
    ? modeAllowsImmediateCorrectnessFeedback() : typeof gameMode==='string' && gameMode!=='exam';
  function record(text) {
    if(!permitsReleasedHistory())return;
    text=String(text||'').trim();if(!text || text===lastFeedback) return;
    lastFeedback=text;const li=document.createElement('li');li.textContent=text;entries.append(li);history.hidden=false;
  }
  window.MQAccessibility={
    recordReleasedFeedback:record,
    resetFeedback(){entries.replaceChildren();history.hidden=true;lastFeedback='';},
    sync
  };
  let observedMessage=null;
  const feedbackObserver=new MutationObserver(()=>{
    if(!visible(observedMessage))return;
    const text=observedMessage.innerText.trim();record(text);
    // Read only released presentation text. Dialog entry announces its own feedback.
    if(text && live && permitsReleasedHistory()
      && !dialogs.some(visible) && !hallway?.classList.contains('active') && !live.innerText.includes(text))live.innerText=text;
  });
  function observeFeedback(){
    const message=byId('message');if(message===observedMessage)return;
    feedbackObserver.disconnect();observedMessage=message;
    if(message)feedbackObserver.observe(message,{childList:true,subtree:true,characterData:true});
  }
  const gameBox=byId('gameBox');
  if(gameBox)new MutationObserver(()=>{
    observeFeedback();
    const heading=gameBox.querySelector('#masteryReportScreen h1,h1,h2');
    if(heading && (document.activeElement===document.body || lastControl&&!lastControl.isConnected)){
      heading.tabIndex=-1;focus(heading);
    }
  }).observe(gameBox,{childList:true});
  const motion=document.createElement('button');motion.type='button';motion.id='mqMotionControl';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=preference.matches;
  try { const saved=localStorage.getItem('mq:accessibility:decorative-motion');if(saved!==null)paused=saved==='paused'||preference.matches; } catch {}
  function applyMotion(){
    const effective=paused||preference.matches;
    document.documentElement.classList.toggle('mq-motion-paused',effective);
    motion.textContent=preference.matches?'Reduced motion enabled':paused?'Resume decorative motion':'Pause decorative motion';
    motion.disabled=preference.matches;
    motion.setAttribute('aria-pressed',String(effective));
    document.querySelectorAll('video[autoplay]').forEach(video=>{if(effective)video.pause();else video.play().catch(()=>{});});
  }
  motion.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('mq:accessibility:decorative-motion',paused?'paused':'playing');}catch{}applyMotion();});
  preference.addEventListener('change',event=>{paused=event.matches;applyMotion();});
  document.body.append(motion);applyMotion();sync();
})();
