// Keep utility order identical to Cost Directive without adding controls.
(() => {
  const menu=document.getElementById('gameMenuOptions');
  const sound=document.getElementById('soundToggle');
  const motion=document.getElementById('mqMotionControl')?.closest('.mq-motion-setting');
  if(menu && sound && motion)menu.insertBefore(sound,motion);
})();
