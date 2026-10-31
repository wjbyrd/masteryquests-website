import {quantity,observation,isShift,fmt,money,midpoint,category,limits} from './model.js';
export const BOX={left:66,right:690,top:38,bottom:352,width:760,height:430};
export function scales(r){const p=r.anchorP||r.p0,q=r.anchorQ||r.q0;return {pMax:2*p,qMax:r.model==='linear'?2*q:isShift(r)?3*q:r.model==='demand'?3.2*q:2.2*q};}
export function coords(r,q,p){const {pMax,qMax}=scales(r);return {x:BOX.left+q/qMax*(BOX.right-BOX.left),y:BOX.bottom-p/pMax*(BOX.bottom-BOX.top)};}
export function valueAt(r,x,y){const {pMax,qMax}=scales(r),l=limits(r);return l.key==='q'?(x-BOX.left)/(BOX.right-BOX.left)*qMax:(BOX.bottom-y)/(BOX.bottom-BOX.top)*pMax;}
const line=(x1,y1,x2,y2,cls)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
function pathFor(r,value,baseline=false){
  const points=[],{pMax}=scales(r);
  for(let i=1;i<=200;i++){
    const p=pMax*i/200;let q;
    if(isShift(r))q=(baseline?r.q0:value)+(r.p0-p)*r.q0/r.p0;
    else q=quantity(r,p);
    if(Number.isFinite(q)){const xy=coords(r,q,p);points.push(`${points.length?'L':'M'}${xy.x.toFixed(2)},${xy.y.toFixed(2)}`);}
  }
  return points.join(' ');
}
export function graphMarkup(r,value,{mini=false,showRevenue=true,id='main'}={}){
  const a=coords(r,r.q0,r.p0),o=observation(r,value),b=Number.isFinite(o.q)?coords(r,o.q,o.p):null,{pMax,qMax}=scales(r);
  const horizontal=r.model.startsWith('horizontal'),supply=r.chapter==='supply',demand=r.chapter==='demand',clip='clip-'+id;
  const axisText=(n,max)=>fmt(max*n/4),ticks=[0,1,2,3,4];
  const grid=ticks.map(i=>{const x=BOX.left+i*(BOX.right-BOX.left)/4,y=BOX.bottom-i*(BOX.bottom-BOX.top)/4;return line(x,BOX.top,x,BOX.bottom,'grid')+line(BOX.left,y,BOX.right,y,'grid')+`<text x="${x}" y="${BOX.bottom+25}" text-anchor="middle">${axisText(i,qMax)}</text><text x="${BOX.left-12}" y="${y+5}" text-anchor="end">${axisText(i,pMax)}</text>`;}).join('');
  const rectangle=(q,p,cls)=>{const pt=coords(r,q,p);return `<rect x="${BOX.left}" y="${pt.y}" width="${Math.max(0,pt.x-BOX.left)}" height="${Math.max(0,BOX.bottom-pt.y)}" class="${cls}"/>`;};
  const revenue=demand&&showRevenue&&!horizontal?rectangle(r.q0,r.p0,'revenue-before')+rectangle(o.q,o.p,'revenue-now'):'';
  const curves=horizontal?line(BOX.left,a.y,BOX.right,a.y,supply?'curve supply':'curve demand'):(isShift(r)?`<path d="${pathFor(r,value,true)}" class="curve before"/>`:'')+`<path d="${pathFor(r,value)}" class="curve ${supply?'supply':'demand'}"/>`;
  const same=b&&Math.abs(a.x-b.x)<44&&Math.abs(a.y-b.y)<32;
  const marker=(pt,label,cls)=>`<circle cx="${pt.x}" cy="${pt.y}" r="7" class="${cls}"/><text x="${pt.x>BOX.right-60?pt.x-14:pt.x+12}" y="${pt.y<BOX.top+40?pt.y+32:pt.y-13}" text-anchor="${pt.x>BOX.right-60?'end':'start'}" class="point-label">${label}</text>`;
  const guides=b?line(BOX.left,b.y,b.x,b.y,'guide')+line(b.x,b.y,b.x,BOX.bottom,'guide'):line(BOX.left,coords(r,0,o.p).y,BOX.right,coords(r,0,o.p).y,'guide');
  const description= r.model==='horizontal-demand'?`Horizontal demand facing a seller at ${money(r.p0)}. ${o.q===0?'Above that price, quantity demanded is zero.':'At or below that price, this model provides no unique finite quantity.'}`:`${supply?'Supply':'Demand'} graph. Before: ${money(r.p0)}, ${fmt(r.q0)} ${r.unit}. ${Number.isFinite(o.q)?`Current: ${money(o.p)}, ${fmt(o.q)} ${r.unit}.`:'At the going price, quantity is not determined by this demand curve alone.'}`;
  return `<title id="${id}-title">${supply?'Supply':'Demand'} and ${demand?'revenue':'quantity response'}</title><desc id="${id}-desc">${description} Use the labeled slider or number field to adjust the point.</desc><defs><clipPath id="${clip}"><rect x="${BOX.left}" y="${BOX.top-10}" width="${BOX.right-BOX.left}" height="${BOX.bottom-BOX.top+10}"/></clipPath></defs>
    <text x="${BOX.left}" y="21" class="axis-label">${isShift(r)?'Own price':'Price'} ($)</text>${grid}${line(BOX.left,BOX.top,BOX.left,BOX.bottom,'axis')}${line(BOX.left,BOX.bottom,BOX.right,BOX.bottom,'axis')}
    <g clip-path="url(#${clip})">${revenue}${curves}${guides}${!horizontal||supply?marker(a,same?'A / B':'A','point-before'):''}${b&&!same?marker(b,'B','point-now'):''}</g>
    ${horizontal?`<text x="${BOX.right+10}" y="${a.y+6}" class="curve-label">${supply?'S':'D'}</text>`:''}
    <text x="${BOX.right}" y="${BOX.bottom+62}" text-anchor="end" class="axis-label">Quantity · ${r.unit}</text>${mini?'':`<rect x="${BOX.left}" y="${BOX.top}" width="${BOX.right-BOX.left}" height="${BOX.bottom-BOX.top}" class="drag-surface" data-drag="true"/>`}`;
}
export function revenueGraph(r,value){
  const maxQ=2*r.anchorQ,maxR=r.anchorP*r.anchorQ,left=66,right=690,top=27,bottom=145;
  const x=q=>left+q/maxQ*(right-left),y=rev=>bottom-rev/(maxR*1.15)*(bottom-top),o=observation(r,value);
  const pts=Array.from({length:101},(_,i)=>{const q=maxQ*i/100,p=2*r.anchorP-(r.anchorP/r.anchorQ)*q;return `${i?'L':'M'}${x(q)},${y(p*q)}`;}).join('');
  return `<svg viewBox="0 0 760 195" role="img" aria-label="Total revenue against quantity. Current revenue ${money(o.revenue)}."><text x="${left}" y="18" class="axis-label">Total revenue ($)</text>${line(left,bottom,right,bottom,'axis')}${line(left,top,left,bottom,'axis')}<text x="${left-10}" y="${y(maxR)+5}" text-anchor="end">${fmt(maxR)}</text><path d="${pts}" class="curve revenue-curve"/><circle cx="${x(o.q)}" cy="${y(o.revenue)}" r="7" class="point-now"/><text x="${left}" y="${bottom+24}">0</text><text x="${right}" y="${bottom+24}" text-anchor="end">${fmt(maxQ)}</text><text x="${right}" y="188" text-anchor="end" class="axis-label">Quantity</text></svg>`;
}
export function calculation(r,value){
  const o=observation(r,value),shift=isShift(r),x0=shift?r.x0:r.p0,x1=shift?r.x1:o.p;
  if(!Number.isFinite(o.q))return 'At this price, the demand curve does not provide a unique quantity. An elasticity calculation needs a specified comparison; there is no invented quantity or receipt total.';
  const dx=midpoint(x0,x1)*100,dq=midpoint(r.q0,o.q)*100;
  const coefficient=o.e===null?'No change to compare':o.e===Infinity?'∞':fmt(o.e);
  return `<div class="calc-row"><span>${shift?(r.kind==='income'?'Income index':'Related price'):'Price'}</span><strong>${fmt(x0)} → ${fmt(x1)}</strong></div><div class="calc-row"><span>Quantity</span><strong>${fmt(r.q0)} → ${fmt(o.q)}</strong></div><p>Midpoint change: ${fmt(dx)}% in ${shift?(r.kind==='income'?'income':'the related price'):'price'}; ${fmt(dq)}% in quantity.</p><p><strong>${shift?'Signed elasticity':'Elasticity magnitude'}: ${coefficient}</strong>${!shift&&o.e!==null?' · '+category(o.e):''}</p><p class="fine">Each change is divided by the average of its before and after values. ${shift?'Keep the sign: it identifies the relationship.':'Own-price demand is reported as a magnitude.'}${r.model==='linear'?' This measures the interval from A to B. The point elasticity at B is '+fmt(o.point)+'.':''}</p>`;
}
