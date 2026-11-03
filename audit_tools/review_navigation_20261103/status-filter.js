function matchesStatus(q){
 const selected=$('status').value,r=state[q.id],status=r?.status||'unknown';
 const prefixes={mediumPending:['medium-editorial-20261102-','medium-complete-20261103-'],hardPending:['hard-20261102-'],legendaryPending:['legendary-20261102-'],bridgePending:['bridge-20261102-']};
 if(prefixes[selected])return status==='unknown'&&prefixes[selected].some(prefix=>(q.revision||'').startsWith(prefix));
 if(selected==='needsVerification')return needsVerification(q,r);
 return !selected||status===selected;
}
function matches(q,skip=''){
 const term=$('search').value.trim().toLowerCase();
 return (!$('course').value||q.areas.includes($('course').value))
  &&(skip==='topic'||!$('topic').value||q.topic===$('topic').value)
  &&(skip==='difficulty'||!$('difficulty').value||q.difficulty===$('difficulty').value)
  &&(skip==='role'||!$('role').value||q.role===$('role').value)
  &&matchesStatus(q)
  &&(!term||[q.id,q.topic,q.stem,...q.options].join(' ').toLowerCase().includes(term));
}
