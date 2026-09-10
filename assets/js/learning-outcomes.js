(() => {
  'use strict';
  const input=document.getElementById('lo-search');
  if(!input)return;
  const entries=[...document.querySelectorAll('.lo-concept')];
  const areas=[...document.querySelectorAll('.lo-area')];
  const status=document.getElementById('lo-status');
  const originalOpen=new Map();
  let searching=false;
  function filter(){
    const query=input.value.trim().toLocaleLowerCase();
    if(query&&!searching)entries.forEach(entry=>originalOpen.set(entry,entry.open));
    entries.forEach(entry=>{
      entry.hidden=!!query&&!entry.textContent.toLocaleLowerCase().includes(query);
      if(query&&!entry.hidden)entry.open=true;
      if(!query&&searching)entry.open=originalOpen.get(entry)||false;
    });
    searching=!!query;
    areas.forEach(area=>area.hidden=![...area.querySelectorAll('.lo-concept')].some(entry=>!entry.hidden));
    const count=entries.filter(entry=>!entry.hidden).length;
    status.textContent=count?`${count} concepts shown${query?' for “'+input.value.trim()+'”':''}.`:'No matching concepts. Try another term or clear the search.';
  }
  document.getElementById('lo-search-controls').hidden=false;
  input.addEventListener('input',filter);
  document.getElementById('lo-clear').addEventListener('click',()=>{input.value='';filter();input.focus();});
  document.querySelectorAll('.lo-area-nav a').forEach(link=>link.addEventListener('click',()=>{input.value='';filter();}));
  filter();
})();
