/* Collection-hub presentation: preserves mission, unlock and audio logic. */
(() => {
 const byId=id=>document.getElementById(id);
 const setting=window.MQMotionPreference.createControl('hubMotionControl');
 const menu=document.querySelector('#realmMenuModal,#macroMenuModal,#directorateMenuModal,#microMenuModal');
 if(menu)(menu.querySelector('[class$="-menu-actions"]')||menu.firstElementChild||menu).append(setting);
 else {
  const settings=document.createElement('details'),label=document.createElement('summary');
  label.textContent='Settings';settings.append(label,setting);
  (document.querySelector('main')||document.body).append(settings);
 }
 const splash=byId('splashScreen'),main=byId('mainMenu');
 const dialogs=['realmMenuModal','macroMenuModal','directorateMenuModal','microMenuModal','helpModal','artifactModal','achievementModal'].map(byId).filter(Boolean);
 dialogs.forEach(el=>{el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');});
 const visible=el=>el && !el.hidden && !el.classList.contains('hidden') && el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
 const owned=new Set(),openers=new Map();let active=null,lastControl=null;
 function release(){for(const el of owned)el.inert=false;owned.clear();}
 function focus(el){if(!visible(el)||el.closest('[inert]'))return false;if(!el.matches('button,input,select,a,summary,[tabindex]'))el.tabIndex=-1;el.focus({preventScroll:true});return document.activeElement===el;}
 function sync(){
  const next=dialogs.filter(el=>el.classList.contains('active')&&visible(el)).sort((a,b)=>(+getComputedStyle(b).zIndex||0)-(+getComputedStyle(a).zIndex||0))[0] || (visible(splash)?splash:null);
  release();
  if(next)for(let branch=next;branch&&branch!==document.body;branch=branch.parentElement)for(const el of branch.parentElement.children){if(el!==branch&&!['SCRIPT','STYLE'].includes(el.tagName)&&!el.inert){el.inert=true;owned.add(el);}}
  for(const dialog of dialogs)dialog.setAttribute('aria-hidden',String(!dialog.classList.contains('active')));
  if(next!==active){
   const previous=active;active=next;
   if(next&&!openers.has(next))openers.set(next,lastControl||document.activeElement);
   if(previous&&!visible(previous)||previous&&!previous.classList.contains('active')&&previous!==splash){const opener=openers.get(previous);openers.delete(previous);if(focus(opener))return;}
   if(next&&!next.contains(document.activeElement))focus(next.querySelector('h1,h2,h3,button')||next);
   else if(!next&&previous===splash)focus(main?.querySelector('h1')||main);
  }
 }
 document.addEventListener('click',e=>{lastControl=e.target.closest('button,a,[tabindex]');},true);
 document.addEventListener('keydown',e=>{
  if(['Enter',' '].includes(e.key))lastControl=document.activeElement;
  if(!active||active===splash)return;
  if(e.key==='Tab'){const items=[...active.querySelectorAll('button,input,select,a[href],summary,[tabindex]')].filter(el=>visible(el)&&!el.disabled&&el.tabIndex>=0&&!el.closest('[inert]'));const index=items.indexOf(document.activeElement);if(e.shiftKey&&index<=0){e.preventDefault();focus(items.at(-1));}else if(!e.shiftKey&&(index<0||index===items.length-1)){e.preventDefault();focus(items[0]);}}
  if(e.key==='Escape'){const close=active.querySelector('button[onclick^="close"]');if(close){e.preventDefault();e.stopImmediatePropagation();close.click();}}
 },true);
 const observer=new MutationObserver(sync);[splash,...dialogs].filter(Boolean).forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['class','style','hidden']}));
 document.querySelectorAll('#soundToggle').forEach(el=>el.removeAttribute('aria-label'));
 const recoveryMessage=byId('recoveryMessage'),recoveryCode=byId('recoveryCode');
 if(recoveryMessage){
  recoveryMessage.setAttribute('role','status');
  if(recoveryCode){
   recoveryCode.setAttribute('aria-describedby','recoveryMessage');
   const errorState=()=>{if(recoveryMessage.classList.contains('error'))recoveryCode.setAttribute('aria-invalid','true');else recoveryCode.removeAttribute('aria-invalid');};
   new MutationObserver(errorState).observe(recoveryMessage,{attributes:true,attributeFilter:['class'],childList:true});errorState();
  }
 }
 sync();
})();
