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
    controls.forEach(control => { control.value = choice; });
    document.querySelectorAll('video[autoplay]').forEach(video => {
      if(paused()) video.pause();
      else video.play().catch(() => {});
    });
  }
  window.MQMotionPreference = {
    createControl(id) {
      const label = document.createElement('label');
      label.className = 'mq-motion-setting';
      label.htmlFor = id;
      label.append('Decorative motion ');
      const control = document.createElement('select');
      control.id = id;
      for(const [value, text] of [['system','Use device setting'],['paused','Paused'],['playing','Playing']]) {
        const option = document.createElement('option');
        option.value = value; option.textContent = text; control.append(option);
      }
      control.value = choice;
      control.addEventListener('change', () => {
        choice = control.value;
        try {
          if(choice === 'system') localStorage.removeItem(key);
          else localStorage.setItem(key, choice);
        } catch { /* A standalone file still supports an in-memory preference. */ }
        apply();
      });
      controls.add(control); label.append(control);
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
