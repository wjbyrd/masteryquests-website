// Calibrated live markings sit over the illustrated metal/glass gauge face.
import {plate} from './illustrated.js';
export function gaugeFace(value,{numeric=false,id='',labels:customLabels,caption}={}){
 const angle=numeric?(value-5)*12:value*60;
 const point=(angle,r)=>[100+Math.sin(angle*Math.PI/180)*r,120-Math.cos(angle*Math.PI/180)*r];
 const ticks=Array.from({length:21},(_,i)=>{const a=-60+i*6,p=point(a,73),q=point(a,i%5===0?62:67);return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${i%5===0?1.7:.8}"/>`;}).join('');
 const labels=(customLabels||(numeric?['0','5','10']:['DOWN','STEADY','UP'])).map((label,i)=>{const p=point(-60+i*120/((customLabels?.length||3)-1),49);return `<text x="${p[0]}" y="${p[1]+3}">${label}</text>`;}).join('');
 return `<span class="dial-face calibrated-gauge">${plate('gauge_face')}<svg viewBox="0 0 200 200" aria-hidden="true"><g class="gauge-ticks">${ticks}</g><g class="gauge-numbers">${labels}<text x="100" y="158">${caption||(numeric?'INDEX':'DIRECTION')}</text></g><g class="dial-needle" ${id?`id="${id}-needle"`:''} style="--angle:${angle}deg"><path d="M98 133 L99 44 L101 44 L102 133 Z" fill="#303435"/><path d="M99 44 L100 38 L101 44 L101 66 L99 66 Z" fill="#823c2c"/></g><circle cx="100" cy="120" r="7" fill="#303536" stroke="#a79c7e" stroke-width="2"/><circle cx="100" cy="120" r="2" fill="#b3a88a"/></svg></span>`;
}
