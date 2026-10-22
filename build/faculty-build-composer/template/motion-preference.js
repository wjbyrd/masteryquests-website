/* Embedded in games and hubs: one origin-wide preference, no game-state writes. */
(() => {
  'use strict';
  const key = 'mq:accessibility:decorative-motion';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = new Set();
  let choice = 'system';
  function read() {
    try {
      const value = localStorage.getItem(key);
      choice = value === 'paused' || value === 'playing' ? value : 'system';
    } catch { /* Keep the in-memory choice when storage is unavailable. */ }
  }
  const paused = () => choice === 'system' ? preference.matches : choice === 'paused';
  function apply() {
    document.documentElement.classList.toggle('mq-motion-paused', paused());
    controls.forEach(({control,reset}) => {
      control.textContent = `DECORATIVE MOTION: ${paused() ? 'PAUSED' : 'ON'}`;
      reset.disabled=choice==='system';
      reset.textContent=choice==='system' ? 'Using device setting' : 'Use device setting';
    });
    document.querySelectorAll('video[autoplay]').forEach(video => {
      if(paused()) video.pause();
      else video.play().catch(() => {});
    });
  }
  window.MQMotionPreference = {
    createControl(id) {
      const label = document.createElement('div');
      label.className = 'mq-motion-setting';
      const control = document.createElement('button'),reset=document.createElement('button'),status=document.createElement('span');
      control.id=id;control.type='button';control.className='game-menu-option';
      reset.type='button';reset.className='mq-motion-default';
      status.className='sr-only';status.setAttribute('role','status');
      function setChoice(value){
        choice=value;
        try {
          if(choice === 'system') localStorage.removeItem(key);
          else localStorage.setItem(key, choice);
        } catch { /* A standalone file still supports an in-memory preference. */ }
        apply();
        status.textContent=`Decorative motion ${paused()?'paused':'on'}.${choice==='system'?' Using device setting.':''}`;
      }
      control.addEventListener('click',()=>setChoice(paused()?'playing':'paused'));
      reset.addEventListener('click',()=>{setChoice('system');control.focus();});
      controls.add({control,reset});label.append(control,reset,status);apply();
      return label;
    }
  };
  // Autoplay initiated by a screen transition must respect the same preference.
  document.addEventListener('play', event => {
    if(event.target.matches?.('video[autoplay]') && paused()) event.target.pause();
  }, true);
  preference.addEventListener('change', apply);
  window.addEventListener('storage', event => { if(event.key === key || event.key === null) { read(); apply(); } });
  window.addEventListener('pageshow', () => { read(); apply(); });
  read(); apply();
})();
