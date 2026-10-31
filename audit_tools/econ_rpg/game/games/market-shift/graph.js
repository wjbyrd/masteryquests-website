import {clamp,demand,supply,market,atPrice} from './model.js';
export const plot={left:76,right:620,top:54,bottom:358,width:760,height:440};
export const X=q=>plot.left+q/100*(plot.right-plot.left);
export const Y=p=>plot.bottom-p/120*(plot.bottom-plot.top);
export const number=n=>Number(n.toFixed(1)).toLocaleString('en-US');
// Curve names occupy a dedicated gutter. Quantity labels have separate lanes.
export function graphMarkup(v,{explore=false,locked=false,policy=null}={}){
  const actual=explore||locked,e=actual?market(v.d,v.s):{q:v.q,p:v.p};
  const curve=(kind,shift,fn)=>`<path class="curve ${kind==='d'?'demand':'supply'}" d="M${X(0)} ${Y(fn(0,shift))}L${X(100)} ${Y(fn(100,shift))}"/>${(!policy||explore)&&!locked?`<path class="curve-hit dragger" data-drag="${kind}" d="M${X(0)} ${Y(fn(0,shift))}L${X(100)} ${Y(fn(100,shift))}"/>`:''}`;
  let svg=`<title id="graph-title">Linden berry market</title><desc id="graph-desc">Price in dollars per crate on the vertical axis; quantity in crates per day on the horizontal axis. Starting equilibrium: 50 crates at $60. Demand slopes down, supply slopes up. Current values appear above the graph. Use the labeled controls after the graph for keyboard or screen-reader interaction.</desc><defs><clipPath id="plotClip"><rect x="${plot.left}" y="${plot.top}" width="${plot.right-plot.left}" height="${plot.bottom-plot.top}"/></clipPath></defs><rect width="760" height="440" fill="#fff"/>`;
  for(let q=0;q<=100;q+=20)svg+=`<path class="grid" d="M${X(q)} ${plot.top}V${plot.bottom}"/><text x="${X(q)}" y="${plot.bottom+27}" text-anchor="middle">${q}</text>`;
  for(let p=0;p<=120;p+=20)svg+=`<path class="grid" d="M${plot.left} ${Y(p)}H${plot.right}"/><text x="${plot.left-15}" y="${Y(p)+5}" text-anchor="end">${p}</text>`;
  svg+=`<text class="axis-title" x="${plot.left}" y="25">Price · $ per crate</text><text class="axis-title" x="348" y="426" text-anchor="middle">Quantity · crates per day</text><g clip-path="url(#plotClip)"><path class="baseline" d="M${X(0)} ${Y(demand(0))}L${X(100)} ${Y(demand(100))}M${X(0)} ${Y(supply(0))}L${X(100)} ${Y(supply(100))}"/>${curve('d',v.d,demand)}${curve('s',v.s,supply)}<circle cx="${X(50)}" cy="${Y(60)}" r="4" fill="#718497"/>`;
  if(!policy||explore)svg+=`<path class="guide" d="M${plot.left} ${Y(e.p)}H${X(e.q)}V${plot.bottom}"/>`;
  if(policy){
    const a=atPrice(v.price,v.d,v.s,policy),qs=actual?a.qs:v.qs,qd=actual?a.qd:v.qd;
    if(!explore||a.binding)svg+=`<path class="guide" d="M${X(clamp(qs,0,100))} ${plot.bottom}V${Y(v.price)}M${X(clamp(qd,0,100))} ${plot.bottom}V${Y(v.price)}"/>${actual?`<path d="M${X(Math.min(qs,qd))} ${Y(v.price)}H${X(Math.max(qs,qd))}" stroke="#c5add5" stroke-width="10"/>`:''}`;
    svg+=`<path class="price-line" d="M${plot.left} ${Y(v.price)}H${plot.right}"/>`;
  }
  svg+=`</g><path class="axes" d="M${plot.left} ${plot.top-6}V${plot.bottom}H${plot.right+6}"/>`;
  // Endpoint names sit outside the plot and cannot collide with the E marker.
  if(!policy)for(const [kind,label,fn] of [['d','D',demand],['s','S',supply]]){
    const y=clamp(Y(fn(100,v[kind])),plot.top+18,plot.bottom-18);
    svg+=`<g class="dragger curve-label" data-drag="${kind}"><path class="${kind==='d'?'demand':'supply'} label-leader" d="M${plot.right+7} ${y}h18"/><rect class="handle ${kind==='d'?'d-handle':'s-handle'}" x="646" y="${y-18}" width="74" height="36" rx="18"/><text class="handle-label" x="683" y="${y+6}">${label} ↔</text></g>`;
  }
  if(!policy||explore)svg+=`<g class="dragger" data-drag="e"><circle class="drag-target" cx="${X(e.q)}" cy="${Y(e.p)}" r="22"/><circle class="handle e-handle" cx="${X(e.q)}" cy="${Y(e.p)}" r="${policy?6:15}"/>${policy?'':`<text class="handle-label" x="${X(e.q)}" y="${Y(e.p)+5}">${explore?'E':'E₁'}</text>`}</g>`;
  if(policy){
    const a=atPrice(v.price,v.d,v.s,policy),y=Y(v.price),py=clamp(y,plot.top+18,plot.bottom-18);
    svg+=`<g class="dragger" data-drag="price"><path class="price-leader" d="M${plot.right} ${y}L646 ${py}"/><rect class="handle c-handle" x="646" y="${py-18}" width="98" height="36" rx="8"/><text class="handle-label" x="695" y="${py+6}">${policy==='ceiling'?'Max':'Min'} $${number(v.price)}</text></g>`;
    if(!explore||a.binding)for(const [kind,label,cls,offset] of [['qs','Qs','s-handle',-32],['qd','Qd','d-handle',32]]){
      const q=actual?a[kind]:v[kind],x=X(clamp(q,0,100)),ly=offset<0?clamp(y-32,plot.top+16,plot.bottom-80):clamp(y+32,plot.top+80,plot.bottom-16),lx=clamp(x,plot.left+36,plot.right-36);
      // Separate label lanes remain distinct even when Qs and Qd coincide.
      svg+=`<g class="dragger quantity-marker" data-drag="${kind}"><path class="quantity-leader" d="M${x} ${y}L${lx} ${ly}"/>${q<=100?`<circle class="handle ${cls}" cx="${x}" cy="${y}" r="6"/>`:''}<rect class="handle ${cls}" x="${lx-34}" y="${ly-14}" width="68" height="28" rx="6"/><text class="handle-label" x="${lx}" y="${ly+5}">${label}${q>100?' >100':''}</text></g>`;
    }
  }
  return svg;
}
