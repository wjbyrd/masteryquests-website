'use strict';
const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const sharp=createRequire(path.resolve(__dirname,'../elite_pool_revision_20261101/resolve.cjs'))('sharp');
const W=1600,H=1100,L=150,R=1450,T=160,B=900,x=q=>L+q/80*(R-L),y=c=>B-c/64*(B-T);
const avc=q=>18+(q-32)**2/72,afc=q=>240/q,atc=q=>avc(q)+afc(q);
const line=f=>Array.from({length:761},(_,i)=>4+i/10).filter(q=>f(q)<=64).map((q,i)=>(i?'L':'M')+x(q).toFixed(2)+','+y(f(q)).toFixed(2)).join(' ');
const text=(a,b,s,size=25,extra='')=>`<text x="${a}" y="${b}" font-size="${size}" ${extra}>${s}</text>`;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="white"/><g font-family="Arial, sans-serif" fill="#172b40">`;
svg+=text(800,65,'A firm’s average costs',42,'text-anchor="middle"');
svg+=text(150,125,'Cost per unit ($)',28);
for(let c=0;c<=64;c+=4){svg+=`<path d="M${L},${y(c)}H${R}" stroke="#e1e6eb" stroke-width="1.5"/>`+text(L-22,y(c)+8,c,24,'text-anchor="end"');}
for(let q=0;q<=80;q+=10){svg+=`<path d="M${x(q)},${B}v10" stroke="#172b40" stroke-width="2"/>`+text(x(q),B+42,q,26,'text-anchor="middle"');}
svg+=`<path d="M${L},${T}V${B}H${R}" fill="none" stroke="#172b40" stroke-width="3"/>`;
for(const c of [20,32])svg+=`<path d="M${L},${y(c)}H${x(20)}" stroke="#607487" stroke-width="2.5" stroke-dasharray="9 7"/>`;
svg+=`<path d="M${x(20)},${B}V${y(32)} M${x(70)},${B}V${y(atc(70))}" fill="none" stroke="#607487" stroke-width="2.5" stroke-dasharray="9 7"/>`;
for(const [f,color]of [[atc,'#173f7a'],[avc,'#a94800'],[afc,'#24714a']])svg+=`<path d="${line(f)}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
for(const c of [20,32])svg+=`<circle cx="${x(20)}" cy="${y(c)}" r="7" fill="#172b40"/>`;
svg+=text(800,990,'Quantity of output',29,'text-anchor="middle"');
for(const [j,label,col]of [[0,'Average total cost','#173f7a'],[1,'Average variable cost','#a94800'],[2,'Average fixed cost','#24714a']]){const a=150+j*460;svg+=`<path d="M${a},1040h55" stroke="${col}" stroke-width="6"/>`+text(a+70,1048,label,24);}
svg+='</g></svg>';
fs.writeFileSync(path.join(__dirname,'average-costs.svg'),svg);
sharp(Buffer.from(svg)).webp({quality:95}).toFile(path.resolve(__dirname,'../../build/faculty-build-composer/data/question-assets/costs-of-production/cop_average_costs_review_20261102.webp')).then(()=>console.log('Rendered dedicated average-cost graph: 1600 × 1100.'));
