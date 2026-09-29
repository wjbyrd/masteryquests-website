export function elapsedTime(start,end){
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return 'Not recorded';
  const seconds=Math.floor((end-start)/1000);
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
export function statCards(entries){return `<div class="stats" aria-label="Investigation statistics">${entries.map(([label,value])=>`<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>`;}
