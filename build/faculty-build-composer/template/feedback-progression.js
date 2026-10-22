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
    // Active repair/bridge/retest retains its original automatic transitions.
    if(!manual() || !instructional || remediationState.active)return false;
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
      const campaign=['standard','unlimited','legendary'].includes(gameMode);
      const feedback=manual() && !campaign && !withheld ? plain(question?.feedback) : '';
      return feedback ? `${narrative}\n\n${feedback}` : narrative;
    },
    rememberRecoveryOrigin(state,question){
      // Optional compatible member of the already-saved remediation state; no bank lookup.
      if(manual() && state?.active)state.mqOriginFeedback=snapshot(question);
    },
    finishRecovery(origin,outcome,advance,delay){
      if(!manual() || !origin?.feedback){scheduleForCurrentRun(advance,delay);return;}
      const destination=plain(typeof FACULTY_COMPOSITION_CONFIG==='object' ? FACULTY_COMPOSITION_CONFIG.title : document.title) || 'the game';
      const session=runSessionId;let continued=false;
      showGameModal({title:'Recovery Complete',text:'',confirmText:`Continue to ${destination}`,onConfirm:()=>{
        if(continued || session!==runSessionId)return;
        continued=true;advance();
      }});
      const text=document.getElementById('gameModalText');
      const part=(className,content,heading=false)=>{
        const span=document.createElement('span');span.className=className;span.textContent=content;
        if(heading){span.setAttribute('role','heading');span.setAttribute('aria-level','3');}
        return span;
      };
      // Phrasing elements keep the existing modal paragraph valid; content is never parsed as markup.
      text.replaceChildren(
        part('mq-recovery-intro',`${plain(outcome) || "You've completed the recovery challenge."} Before continuing, revisit the question that sent you here.`),
        part('mq-recovery-label','The original question',true),part('mq-recovery-copy',origin.q),
        part('mq-recovery-label','The economic connection',true),part('mq-recovery-copy',origin.feedback)
      );
      window.MQAccessibility?.sync();
    }
  };
})();
