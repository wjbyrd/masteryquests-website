/* Presentation callbacks only. Answer verification, scoring and selection remain in each engine. */
(() => {
  'use strict';
  let pending = null;
  const manual = () => ['standard','unlimited','quiz','trialGraph','legendary','score','fadingFortune','riskReward'].includes(gameMode);
  const plain = value => {
    const template=document.createElement('template');template.innerHTML=String(value || '');
    return template.content.textContent.trim();
  };
  const snapshot = question => ({id:question?.id ?? '',q:plain(question?.q),feedback:plain(question?.feedback)});
  function cancel() {
    pending?.button.remove();pending=null;
    const hallway=document.getElementById('hallwayTransition');
    hallway?.removeAttribute('role');hallway?.removeAttribute('aria-modal');
    hallway?.removeAttribute('aria-label');hallway?.classList.remove('mq-feedback-held','active');
  }
  function holdHallway(advance, instructional = true) {
    if(!manual() || !instructional)return false;
    const hallway=document.getElementById('hallwayTransition'),text=document.getElementById('hallwayText');
    // Cancel only a stale control, without dismissing this newly painted scene.
    pending?.button.remove();
    const button=document.createElement('button');button.type='button';button.id='mqFeedbackContinue';
    button.className='continue-btn';button.textContent='Continue';
    const token={button,session:runSessionId};pending=token;
    hallway.classList.add('mq-feedback-held');hallway.setAttribute('role','dialog');
    hallway.setAttribute('aria-hidden','false');
    hallway.setAttribute('aria-modal','true');hallway.setAttribute('aria-label','Question feedback');
    text.tabIndex=-1;text.append(button);
    // Dialog focus delivers this readable content; avoid a competing live announcement.
    const live=document.getElementById('srAnnouncements');if(live)live.textContent='';
    button.addEventListener('click',()=>{
      if(pending!==token || token.session!==runSessionId || button.disabled)return;
      button.disabled=true;pending=null;button.remove();
      hallway.classList.remove('mq-feedback-held');hallway.removeAttribute('role');
      hallway.removeAttribute('aria-modal');hallway.removeAttribute('aria-label');
      advance();
      // The callback may open a boss reveal or results. Respect that focus owner.
      queueMicrotask(()=>{
        window.MQAccessibility?.sync();
        const q=document.getElementById('question');
        if(!document.querySelector('[aria-modal="true"]:not([aria-hidden="true"]):not([hidden])') && q)q.focus({preventScroll:true});
      });
    });
    window.MQAccessibility?.sync();
    text.focus({preventScroll:true});
    return true;
  }
  window.MQFeedbackProgression={
    cancel,holdHallway,
    wrongTurn(narrative,question,withheld=false){
      const feedback=manual() && !withheld ? plain(question?.feedback) : '';
      return feedback ? `${narrative}\n\n${feedback}` : narrative;
    },
    rememberRecoveryOrigin(state,question){
      // Optional compatible member of the already-saved remediation state; no bank lookup.
      if(manual() && state?.active)state.mqOriginFeedback=snapshot(question);
    },
    finishRecovery(origin,outcome,advance,delay){
      if(!manual() || !origin?.feedback){scheduleForCurrentRun(advance,delay);return;}
      showGameModal({title:'Recovery Complete',text:`${outcome}\n\n${origin.q}\n\n${origin.feedback}`,confirmText:'Continue',onConfirm:advance});
    }
  };
})();
