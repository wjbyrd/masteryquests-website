
const cards=[...document.querySelectorAll('article')];
const search=document.getElementById('search'),pattern=document.getElementById('pattern'),topic=document.getElementById('topic');
function filter(){let n=0;const query=search.value.toLowerCase().trim();for(const card of cards){const show=(!query||card.textContent.toLowerCase().includes(query))&&(!pattern.value||card.dataset.patterns.split('|').includes(pattern.value))&&(!topic.value||card.dataset.topic===topic.value);card.classList.toggle('hidden',!show);if(show)n++;}document.getElementById('visible').textContent=n+' of '+cards.length+' candidates shown';}
search.addEventListener('input',filter);pattern.addEventListener('change',filter);topic.addEventListener('change',filter);document.getElementById('clear').addEventListener('click',()=>{search.value='';pattern.value='';topic.value='';filter();});filter();
