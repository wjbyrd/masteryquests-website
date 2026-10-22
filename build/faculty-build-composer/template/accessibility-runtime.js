/* Embedded in standalone games by audit_tools/accessibility_cleanup/sync.mjs.
 * Presentation only: never reads answer keys, changes timers, or writes run data. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const visible = node => Boolean(node && !node.hidden && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const controls = node => [...node.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex]')]
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
    const syncHallway=()=>{const shown=hallway.classList.contains('active');hallway.setAttribute('aria-hidden',String(!shown));if(shown)window.MQAccessibility?.recordReleasedFeedback();};
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
    if(next) {
      // Inert siblings at every level, supporting a dialog nested in a game shell.
      for(let branch=next; branch && branch!==document.body; branch=branch.parentElement) {
        for(const sibling of branch.parentElement.children) {
          if(sibling===branch || ['SCRIPT','STYLE','LINK'].includes(sibling.tagName) || sibling===live) continue;
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
  // Keep utilities inside the existing menu, never inside released-feedback views.
  let menu=byId('gameMenuOptions');
  if(!menu && byId('returnMenuBtn') && byId('gameModalText')) {
    // The older Labyrinth engine has only an Operation Menu return confirmation.
    // Add utilities to that entry point, retaining its original return action.
    menu=document.createElement('div');menu.id='mqUtilityMenu';menu.hidden=true;
    byId('gameModalText').after(menu);
    const returnButton=byId('returnMenuBtn'), originalAction=returnButton.onclick;
    returnButton.onclick=()=>{
      showGameModal({title:'Operation Menu',text:'Choose a utility or return to mode selection.',confirmText:'Mode Selection',cancelText:'Close',
        onConfirm:()=>{menu.hidden=true;originalAction?.call(returnButton);},onCancel:()=>{menu.hidden=true;}});
      menu.hidden=false;
    };
    new MutationObserver(()=>{
      if(!visible(byId('gameModal')) || byId('gameModalTitle')?.textContent!=='Operation Menu')menu.hidden=true;
    }).observe(byId('gameModal'),{attributes:true,attributeFilter:['style'],childList:true,subtree:true});
  }
  const history=document.createElement('details');history.id='mqExplanationReview';
  const summary=document.createElement('summary');summary.textContent='Review Explanations';
  const entries=document.createElement('ol'),empty=document.createElement('p');
  empty.textContent='No question explanations have been released in this run.';
  history.append(summary,empty,entries);
  menu?.append(window.MQMotionPreference.createControl('mqMotionControl'),history);
  const released=new Map();
  // Independent legacy runtimes predate the capability helper; their Exam mode also withholds feedback.
  const permitsReleasedHistory=()=>typeof modeAllowsImmediateCorrectnessFeedback==='function'
    ? modeAllowsImmediateCorrectnessFeedback() : typeof gameMode==='string' && gameMode!=='exam';
  const normalize=text=>String(text||'').replace(/\s+/g,' ').trim();
  function record() {
    if(!permitsReleasedHistory() || typeof currentQuestion==='undefined' || !currentQuestion)return;
    // Match only the current question's feedback field against actual released text.
    // Never read answer keys, banks, guide lines, reports or unreleased feedback.
    const fragment=document.createElement('template');fragment.innerHTML=String(currentQuestion.feedback||'');
    const explanation=normalize(fragment.content.textContent);
    if(!explanation)return;
    const hallwayFeedback=hallway?.classList.contains('active') ? byId('hallwayText')?.children[1] : null;
    const modalFeedback=visible(byId('gameModal')) && menu?.hidden ? byId('gameModalText') : null;
    const releasedInHallway=visible(hallwayFeedback) && normalize(hallwayFeedback.innerText)===explanation;
    const releasedInModal=visible(modalFeedback) && ['Incorrect. '+explanation,'Incorrect! '+explanation,explanation].includes(normalize(modalFeedback.innerText));
    if(!releasedInHallway && !releasedInModal)return;
    const questionText=normalize(currentQuestion.q || byId('question')?.innerText);
    const id=String(currentQuestion.id ?? '');
    released.set(JSON.stringify([id,questionText,explanation]),{id,questionText,explanation});
    if(history.open)renderReview();
  }
  function renderReview() {
    entries.replaceChildren();
    if(!permitsReleasedHistory()){history.open=false;history.hidden=true;return;}
    empty.hidden=released.size>0;
    for(const {id,questionText,explanation} of released.values()) {
      const li=document.createElement('li'),questionLabel=document.createElement('p'),text=document.createElement('p');
      questionLabel.className='mq-review-question';
      questionLabel.textContent=questionText || (id ? 'Question '+id : 'Question');
      text.textContent=explanation;li.append(questionLabel,text);entries.append(li);
    }
  }
  history.addEventListener('toggle',()=>{if(history.open)renderReview();});
  function syncReview() {
    history.hidden=!permitsReleasedHistory();
    if(history.hidden || !visible(menu)){history.open=false;entries.replaceChildren();}
    record();
  }
  window.MQAccessibility={
    recordReleasedFeedback:record,
    resetFeedback(){released.clear();entries.replaceChildren();empty.hidden=false;history.open=false;},
    sync
  };
  const reviewObserver=new MutationObserver(syncReview);
  if(menu)reviewObserver.observe(menu,{attributes:true,attributeFilter:['hidden']});
  if(byId('gameModal'))reviewObserver.observe(byId('gameModal'),{attributes:true,attributeFilter:['style']});
  if(byId('gameModalText'))reviewObserver.observe(byId('gameModalText'),{childList:true,subtree:true,characterData:true});
  let observedMessage=null;
  const feedbackObserver=new MutationObserver(()=>{
    if(!visible(observedMessage))return;
    const text=observedMessage.innerText.trim();
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
  syncReview();sync();
})();
