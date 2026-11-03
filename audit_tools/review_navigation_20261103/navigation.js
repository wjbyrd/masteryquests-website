function savedReview(card,r){
 const leavesQueue=r.status!=='unknown'&&(['unknown','needsVerification'].includes($('status').value)||$('status').value.endsWith('Pending'));
 card.querySelector('.review-saved').textContent='Saved: '+statuses[r.status]+(leavesQueue?' · This question will leave this queue when you continue.':'.');
 card.querySelector('.review legend').textContent='My review status';
}
function snapshotView(){
 return {...Object.fromEntries(viewFields.map(id=>[id,$(id).value])),cursor,anchor:document.querySelector('.card')?.dataset.id||''};
}
function rememberView(replace=false){
 const view=snapshotView();
 try{
  if(replace)history.replaceState({reviewView:view},'',location.href);
  else if(JSON.stringify(history.state?.reviewView)!==JSON.stringify(view))history.pushState({reviewView:view},'',location.href);
 }catch(e){}
 try{localStorage.setItem(VIEW_KEY,JSON.stringify(view));}catch(e){}
}
function restoreView(view){
 clearTimeout(searchTimer);
 for(const id of viewFields){
  const input=$(id),value=typeof view[id]==='string'?view[id]:'';
  if(id==='search'||[...input.options].some(o=>o.value===value))input.value=value;
 }
 refreshSelection();
 const order=questionOrder.get(view.anchor),anchor=order===undefined?-1:filtered.findIndex(q=>questionOrder.get(q.id)>=order);
 cursor=anchor>=0?anchor:Math.max(0,Number(view.cursor)||0);
 render();rememberView(true);
}
function move(delta){
 clearTimeout(searchTimer);
 const cards=[...document.querySelectorAll('.card')],first=cards[0]?.dataset.id,last=cards.at(-1)?.dataset.id;
 refreshSelection();
 if(delta>0){
  const next=last?filtered.findIndex(q=>questionOrder.get(q.id)>questionOrder.get(last)):0;
  if(next<0){notify('You reached the end of this selection.');cursor=Math.max(0,filtered.length-pageSize());}
  else cursor=next;
 }else{
  const firstIndex=first?filtered.findIndex(q=>questionOrder.get(q.id)>=questionOrder.get(first)):0;
  cursor=Math.max(0,(firstIndex<0?filtered.length:firstIndex)-pageSize());
 }
 render();rememberView();document.querySelector('.pagination').scrollIntoView({block:'start'});
}
function nextQuestion(id){
 clearTimeout(searchTimer);refreshSelection();
 const next=filtered.findIndex(q=>questionOrder.get(q.id)>questionOrder.get(id));
 if(next<0){cursor=Math.max(0,filtered.length-pageSize());render();rememberView();notify(filtered.length?'You reached the end of this selection. Earlier unreviewed questions remain in this queue.':'This queue is complete. Choose another filter to continue.');return;}
 cursor=next;render();rememberView();
 document.querySelector('.card')?.scrollIntoView({behavior:'smooth',block:'start'});
}
for(const id of ['next','bottomnext'])$(id).onclick=()=>move(1);
for(const id of ['prev','bottomprev'])$(id).onclick=()=>move(-1);
$('page').onchange=()=>{
 const requested=Number($('page').value)||1;refreshSelection();cursor=Math.max(0,requested-1);render();rememberView();document.querySelector('.pagination').scrollIntoView();
};
