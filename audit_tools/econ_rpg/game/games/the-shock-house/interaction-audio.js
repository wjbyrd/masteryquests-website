// Short, gesture-triggered material sounds. They never carry essential clues.
let context;
export function interactionMaterial(action,id='') {
 if(/rent|receipt|tags|pay|utility-bill|mail|postcard|book|ledger|files|ticket|paper|dispatch|fragment|evidence/.test(id)||['discover','reorder'].includes(action))return 'paper';
 if(/desk|drawer|chair|coat|plant|tools|shelf/.test(id)||['pan','back','ambient'].includes(action))return 'wood';
 return 'metal';
}
export function playInteraction(material='metal') {
 try {
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
  context??=new Audio();if(context.state==='suspended')void context.resume().catch(()=>{});
  const now=context.currentTime,duration=material==='paper'?.11:.075;
  const gain=context.createGain();gain.connect(context.destination);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(material==='paper'?.025:.035,now+.006);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  if(material==='paper') {
   const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1800;filter.Q.value=.6;
   source.connect(filter);filter.connect(gain);source.start(now);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  } else {
   const source=context.createOscillator();source.type='sine';source.frequency.setValueAtTime(material==='wood'?210:880,now);source.frequency.exponentialRampToValueAtTime(material==='wood'?90:540,now+duration);source.connect(gain);source.start(now);source.stop(now+duration);source.onended=()=>{source.disconnect();gain.disconnect();};
  }
 } catch { /* Muted or unavailable audio leaves all visual feedback intact. */ }
}
