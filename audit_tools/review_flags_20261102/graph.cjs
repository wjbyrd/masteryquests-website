'use strict';
// Draw a mathematical SVG from the benefit functions; rasterize it for the existing bank.
const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const root=path.resolve(__dirname,'../..');
const bundled=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs'));
const sharp=bundled('sharp');
const W=1600,H=1080,L=150,R=70,T=95,B=125,pw=W-L-R,ph=H-T-B;
const X=x=>L+x/10*pw,Y=y=>T+(100-y)/100*ph;
const text=(x,y,t,more='')=>`<text x="${x}" y="${y}" ${more}>${t}</text>`;
const line=(x1,y1,x2,y2,color,width=2,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="white"/><g font-family="Arial, sans-serif" font-size="28" fill="#172c3d">`;
s+=text(W/2,45,'Baseline benefits: North and South neighborhoods','text-anchor="middle" font-size="32" font-weight="bold"');
for(let x=0;x<=10;x++){s+=line(X(x),T,X(x),Y(0),'#dde4e8',1.5);s+=line(X(x),Y(0),X(x),Y(0)+10,'#172c3d',2);s+=text(X(x),Y(0)+45,x,'text-anchor="middle"');}
for(let y=0;y<=100;y+=10){s+=line(L,Y(y),X(10),Y(y),'#dde4e8',1.5);s+=line(L-10,Y(y),L,Y(y),'#172c3d',2);s+=text(L-20,Y(y)+10,y,'text-anchor="end"');}
s+=line(L,T,L,Y(0),'#172c3d',3)+line(L,Y(0),X(10),Y(0),'#172c3d',3);
const curve=(fn,color,dash='')=>`<polyline fill="none" stroke="${color}" stroke-width="6" ${dash?`stroke-dasharray="${dash}"`:''} points="${Array.from({length:101},(_,i)=>`${X(i/10)},${Y(fn(i/10))}`).join(' ')}"/>`;
const north=x=>Math.max(0,50-5*x),south=x=>Math.max(0,40-5*x);
s+=curve(north,'#165b8c')+curve(south,'#ac3a27','18 10')+curve(x=>north(x)+south(x),'#286b45','26 9 5 9')+curve(()=>50,'#73448a','4 9');
const label=(x,y,t,color)=>text(X(x),Y(y),t,`font-weight="bold" font-size="30" fill="${color}" stroke="white" stroke-width="7" paint-order="stroke" stroke-linejoin="round"`);
s+=label(1.5,79,'MSB = North MB + South MB','#286b45')+label(2.2,43,'North MB','#165b8c')+label(2.4,22,'South MB','#ac3a27')+label(8.3,54,'MC = 50','#73448a');
s+=text((L+X(10))/2,H-30,'Community fireworks displays per summer','text-anchor="middle" font-size="30"');
s+=`<text transform="translate(45 ${(T+Y(0))/2}) rotate(-90)" text-anchor="middle" font-size="30">Marginal benefit and cost ($1,000 per display)</text></g></svg>`;
const svg=path.join(__dirname,'PUBLIC-04-readable.svg'),target=path.join(root,'build/faculty-build-composer/data/question-assets/market-failures/PUBLIC-04-ELITE-20261102.webp');
fs.writeFileSync(svg,s+'\n');fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});
(async()=>{await sharp(Buffer.from(s)).webp({lossless:true}).toFile(target);await sharp(Buffer.from(s)).png().toFile(path.join(__dirname,'qa/public-good-graph.png'));console.log(JSON.stringify({target,width:W,height:H}));})().catch(e=>{console.error(e);process.exit(1)});
