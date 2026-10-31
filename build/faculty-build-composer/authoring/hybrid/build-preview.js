(function(){
'use strict';
const form=document.querySelector('[data-goal-filter]');
if(!form)return;
const game=form.querySelector('[value="economics"]'),quiz=form.querySelector('[value="quiz"]');
function updateOwnLink(){document.querySelector('[data-own-composer]').href='/build/faculty-build-composer/authoring/hybrid/'+(quiz.checked?'quiz.html?source=own':'?source=own');}
// Run before the shared site's bubbling change listener updates resource panels.
form.addEventListener('change',event=>{
  if(event.target===quiz&&quiz.checked)game.checked=false;
  if(event.target===game&&game.checked)quiz.checked=false;
  updateOwnLink();
},true);
// The shared script applies ?goal= links after this deferred script is loaded.
document.addEventListener('DOMContentLoaded',()=>{
  if(quiz.checked){game.checked=false;quiz.dispatchEvent(new Event('change',{bubbles:true}));}
  updateOwnLink();
  form.querySelector('[data-goal-clear]').addEventListener('click',updateOwnLink);
});
})();
