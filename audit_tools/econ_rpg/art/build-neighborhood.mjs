// Original 2D vector artwork. Run with Node to regenerate the local SVG sheet.
// All views reuse the same neighborhood geometry; only small overlays differ.
import { mkdirSync, writeFileSync } from 'node:fs';
const edge = '#354955';
const point = (x, y, z = 0) => [480 + (x - y) * 1.05, 128 + (x + y) * .5 - z];
const pts = values => values.map(v => point(...v).map(n => +n.toFixed(2)).join(',')).join(' ');
const poly = (values, fill, stroke = edge, width = .8) => `<polygon points="${pts(values)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const line = (a, b, color = edge, width = 1) => `<polyline points="${pts([a,b])}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const flat = (x,y,w,d,z,color,stroke = edge) => poly([[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z]],color,stroke);
const front = (x,y,w,z,h,color) => poly([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],color);
const side = (x,y,d,z,h,color) => poly([[x,y,z],[x,y+d,z],[x,y+d,z+h],[x,y,z+h]],color);
const dot = (x,y,z,r,fill) => { const [cx,cy] = point(x,y,z); return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`; };
const text = (x,y,z,label,size=7,fill='#f7f0d5',face='front') => {
  const [px,py]=point(x,y,z);
  return `<text transform="matrix(1 .476 ${face === 'front' ? 0 : -1} ${face === 'front' ? 1 : .476} ${px} ${py})" fill="${fill}" font-family="sans-serif" font-weight="700" font-size="${size}" letter-spacing=".6">${label}</text>`;
};
function box(x,y,w,d,h,palette,z=0) {
  return side(x+w,y,d,z,h,palette[1])+front(x,y+d,w,z,h,palette[0])+flat(x,y,w,d,z+h,palette[2]);
}
function tree(x,y,size=1) {
  return flat(x-8,y-8,16,16,1,'#b7ba96')+box(x-6,y-6,12,12,6,['#c49574','#a47560','#ded0a5'])+
    line([x,y,5],[x,y,31*size],'#625347',4)+
    poly([[x-15*size,y,27*size],[x-10*size,y,43*size],[x,y,52*size],[x+12*size,y,42*size],[x+16*size,y,25*size],[x,y,20*size]],'#619e80','#477e6b',1)+
    poly([[x-10*size,y,43*size],[x,y,52*size],[x+12*size,y,42*size],[x+2*size,y,33*size],[x-13*size,y,31*size]],'#84b889','none');
}
function person(x,y,shirt='#df9a6f') {
  return dot(x+2,y+1,1,3,'#44545a55')+line([x-1,y,1],[x,y,7],'#364657',2)+line([x+3,y,1],[x+1,y,7],'#364657',2)+
    line([x,y,7],[x,y,13],shirt,5)+dot(x,y,17,2.5,'#dba879');
}
function lamp(x,y) {
  return box(x-2,y-2,4,4,2,['#56636b','#384e5a','#70828a'])+line([x,y,2],[x,y,38],'#455e66',2.3)+
    line([x,y,38],[x+8,y,40],'#455e66',2)+flat(x+5,y-3,9,6,40,'#e8d6a4')+dot(x+9,y,38,2,'#fbdfa3');
}
function car(x,y,color='#d6ad58') {
  return flat(x-2,y-1,31,16,0,'#2d424655','none')+
    dot(x+4,y+13,3,3,'#33464a')+dot(x+24,y+13,3,3,'#33464a')+
    box(x,y,29,13,8,[color,'#ad715e',color],3)+box(x+6,y+2,15,9,6,['#91bcb9','#466875','#d4e2d7'],11)+
    front(x+8,y+11,10,12,4,'#4e747e')+front(x+1,y+13,3,7,2,'#f3deb1');
}
function bench(x,y) {
  return line([x+2,y,0],[x+2,y,8],edge,2)+line([x+22,y,0],[x+22,y,8],edge,2)+
    flat(x,y-4,25,8,7,'#b38d66')+front(x,y-4,25,10,6,'#b38d66');
}
function windowFront(x,y,z,w=10,h=14,lit=false) {
  return front(x-1,y,w+2,z-1,h+2,'#f0dec0')+front(x,y+.2,w,z,h,lit?'#ebc483':'#426a7a')+
    line([x+w/2,y+.3,z],[x+w/2,y+.3,z+h],'#d3d7c0',.8)+line([x,y+.3,z+h/2],[x+w,y+.3,z+h/2],'#d3d7c0',.7)+
    flat(x-2,y, w+4,3,z-2,'#c9b697');
}
function building(x,y,w,d,h,colors,{shop='',roof='flat',balcony=false}={}) {
  let art = flat(x+7,y+7,w+13,d+9,0,'#40545e28','none')+box(x,y,w,d,h,colors);
  // Plinth, floor bands and facade windows retain a consistent human scale.
  art+=front(x,y+d,w,0,5,'#aaa18d')+side(x+w,y,d,0,5,'#858c83');
  for(let z=28;z<h-8;z+=25){
    art+=front(x,y+d,w,z-6,1.5,'#e5ceaa')+side(x+w,y,d,z-6,1.5,'#b6ac96');
    for(let wx=x+9;wx<x+w-9;wx+=18) art+=windowFront(wx,y+d+.5,z,10,15,((wx-x)/18+z)%3<1);
    for(let wy=y+8;wy<y+d-9;wy+=19){
      art+=side(x+w+.5,wy,10,z,15,'#cfbd9e')+side(x+w+1,wy+1,8,z+1,13,'#3d6574');
      art+=line([x+w+1.2,wy+5,z+1],[x+w+1.2,wy+5,z+14],'#b8cfbf',.7);
    }
  }
  if(shop){
    art+=front(x+7,y+d+.5,w-14,5,16,'#3c6370');
    for(let wx=x+7;wx<x+w-6;wx+=13) art+=line([wx,y+d+1,5],[wx,y+d+1,21],'#e6ccaa',2);
    art+=front(x+4,y+d+1,w-8,24,10,'#355c63')+text(x+9,y+d+1,26,shop,6.5);
    for(let a=0;a<w-6;a+=8){
      const col=Math.floor(a/8)%2?'#f0ddbc':'#cc7658';
      art+=poly([[x+3+a,y+d,24],[x+Math.min(w-3,a+11),y+d,24],[x+Math.min(w-3,a+11),y+d+10,20],[x+3+a,y+d+10,20]],col,'#966d54',.4);
      art+=front(x+3+a,y+d+10,Math.min(8,w-6-a),17,3,col);
    }
  }else{
    art+=front(x+7,y+d+.5,12,3,20,'#385767')+front(x+9,y+d+1,8,11,9,'#9bbdb8')+dot(x+17,y+d+1,10,1,'#ead6a7');
    art+=flat(x+3,y+d,21,6,2,'#dfceb0');
    for(let wx=x+28;wx<x+w-10;wx+=18)art+=windowFront(wx,y+d+.5,8,10,12);
  }
  if(balcony){
    art+=flat(x+6,y+d,w-12,8,48,'#b3b0a0')+front(x+6,y+d+8,w-12,49,1,'#435964');
    for(let wx=x+6;wx<=x+w-6;wx+=6)art+=line([wx,y+d+8,49],[wx,y+d+8,58],'#435964',1);
    art+=line([x+6,y+d+8,58],[x+w-6,y+d+8,58],'#435964',1.5);
    art+=box(x+10,y+d+3,12,5,5,['#a96e57','#825c4a','#6c9b76'],49);
  }
  if(roof==='gable'){
    art+=poly([[x-3,y-3,h],[x+w+3,y-3,h],[x+w+3,y+d/2,h+17],[x-3,y+d/2,h+17]],'#b17760');
    art+=poly([[x-3,y+d/2,h+17],[x+w+3,y+d/2,h+17],[x+w+3,y+d+3,h],[x-3,y+d+3,h]],'#d58e68');
    for(let t=8;t<w;t+=10)art+=line([x+t,y+d/2,h+17],[x+t,y+d+3,h],'#b37357',.7);
    art+=box(x+9,y+10,8,8,12,['#a67864','#785d50','#bf9b7c'],h+6);
  }else{
    art+=flat(x+4,y+4,w-8,d-8,h+.1,'#91a39e')+front(x-1,y+d+1,w+2,h,4,'#e8d3ad')+side(x+w+1,y-1,d+2,h,4,'#beb49b');
    art+=box(x+10,y+10,15,11,6,['#adbab5','#849797','#dce0c9'],h+1);
    for(let a=0;a<3;a++)art+=line([x+12,y+12+a*2,h+7],[x+23,y+12+a*2,h+7],'#6e8d91',.7);
    if(w>60)art+=flat(x+w-25,y+10,16,14,h+1,'#527587');
  }
  return art;
}

let ground = `<rect width="1000" height="610" fill="#e1e6cf"/>`;
ground+=poly([[-25,-5,-7],[444,-5,-7],[444,428,-7],[-25,428,-7]],'#476b73','none');
ground+=flat(-25,-5,469,433,0,'#c9c9ac','none');
ground+=flat(-25,353,469,75,1,'#71afb0','none');
for(let x=-10;x<430;x+=28)for(let y=368;y<425;y+=19)ground+=line([x,y,1.2],[x+12,y,1.2],'#a5cdbe',1.5);
ground+=flat(-10,1,438,338,1,'#e4d9ba','none');
ground+=flat(-10,157,438,49,2,'#718489','none')+flat(190,1,48,338,2,'#718489','none');
for(let x=3;x<425;x+=30)if(x<170||x>245)ground+=flat(x,180,13,1.2,2.2,'#e1d9ad','none');
for(let y=10;y<330;y+=28)if(y<140||y>215)ground+=flat(213,y,1.5,13,2.2,'#e1d9ad','none');
for(let i=0;i<5;i++){ground+=flat(193+i*8,144,4,10,2.4,'#ece6cf','none');ground+=flat(176,163+i*8,10,4,2.4,'#ece6cf','none');}
for(let x=0;x<425;x+=20){ground+=line([x,209,2],[x,219,2],'#c7bea2',.6);ground+=line([x,147,2],[x,155,2],'#c7bea2',.6);}
ground+=flat(-9,329,438,18,3,'#b3a88e','none');
for(let x=-5;x<425;x+=8)ground+=line([x,330,3],[x,347,3],'#998f7e',.7);
ground+=line([-10,348,3],[430,348,3],'#405965',2);
for(let x=0;x<430;x+=22)ground+=line([x,348,3],[x,348,13],'#405965',1.2);
ground+=line([-10,348,13],[430,348,13],'#405965',1.5);

let back = '';
back+=building(34,15,63,47,93,['#d6a176','#a97d64','#dcc39a'],{roof:'gable'});
back+=building(105,17,63,57,125,['#cf7967','#ad6158','#d6b291'],{balcony:true});
back+=building(263,20,58,49,105,['#e3c484','#b5a174','#e1d3a1']);
back+=building(331,24,63,52,79,['#87aca4','#648d88','#b5c6ad'],{roof:'gable'});
back+=building(28,85,66,52,76,['#ddc5a0','#aea38a','#d5c29e'],{shop:'GROCER'});
back+=building(110,91,63,46,100,['#729da0','#527c84','#a7b7a6'],{shop:'LINDEN CAFE',balcony:true});
back+=building(270,92,58,42,65,['#e5ae72','#b1845f','#e8cf9e'],{shop:'REPAIRS'});
back+=building(341,94,61,43,85,['#b1b596','#849887','#d6c8a7'],{balcony:true});
back+=tree(16,131,.65)+tree(250,120,.6)+tree(409,121,.75)+tree(181,38,.65);
back+=box(166,140,7,5,10,['#7b9881','#5e7c70','#a5b69a']);
back+=bench(114,147)+person(134,148,'#e2b968');

let frontBlock = building(25,230,64,60,81,['#c98470','#a36861','#d1b297'],{roof:'gable'});
frontBlock+=building(101,232,69,56,107,['#e2c18b','#b59970','#ddd1a8'],{balcony:true});
frontBlock+=tree(17,309,.9)+tree(182,285,.7)+bench(63,321)+lamp(185,221)+lamp(12,149)+lamp(406,218);
frontBlock+=person(92,304,'#7c99b3')+person(83,316,'#b37961')+person(39,304,'#dbb153');

let life=car(61,169,'#e4be67')+car(323,188,'#a6c8be')+car(200,82,'#c6826b');
// Bus shelter, route sign, shop tables and ordinary street activity.
life+=box(248,211,39,11,2,['#94a6a0','#728b8e','#b7c6b6']);
for(const x of [249,284])life+=line([x,212,2],[x,212,28],'#54727b',1.7);
life+=front(250,211,33,7,19,'#aec9bd')+flat(245,208,43,16,29,'#638c8f')+text(253,211,18,'BUS',7,'#35565f');
life+=person(252,228,'#bc795b')+person(267,229,'#456e84')+person(174,140,'#bd9761');
life+=person(15,170,'#527e88')+person(361,147,'#c4755c');
life+=flat(112,143,10,7,9,'#b68c63')+flat(138,143,10,7,9,'#b68c63');
life+=lamp(244,33)+lamp(181,118);
life+=tree(413,301,.9)+bench(317,325)+person(304,329,'#7b9aab');

function lot(state) {
  let a=flat(271,246,115,65,2,'#b9b298');
  if(state==='construction'){
    a+=flat(274,249,109,59,3,'#ac9c7c')+box(280,253,88,43,10,['#adada1','#858f8b','#d7d2b9']);
    for(const x of [283,320,363])for(const y of [257,290])a+=box(x,y,4,4,47,['#bbad83','#8f8d76','#dbd0aa']);
    a+=flat(280,253,88,43,57,'#c4b99b');
    for(const x of [281,323,365])a+=line([x,252,60],[x,252,85],'#78897f',1.5);
    // A small tower crane and an open structure, not completed housing.
    a+=line([381,270,4],[381,270,136],'#be8f40',5)+line([312,270,132],[415,270,132],'#be8f40',4);
    a+=line([381,270,151],[312,270,132],'#786c4d',1)+line([381,270,151],[415,270,132],'#786c4d',1);
    a+=line([334,270,132],[334,270,83],'#56645d',1)+line([334,270,83],[338,270,83],'#56645d',2);
    for(let z=8;z<126;z+=13)a+=line([378,270,z],[384,270,z+12],'#efe0a8',1);
    a+=front(269,313,119,2,12,'#699395')+text(285,313,5,'HOUSING WORKS',6.5);
    a+=person(267,309,'#e9b64b')+box(375,299,9,7,8,['#b68255','#8b694e','#dab989']);
  }else if(state==='homes'){
    a+=building(278,251,88,45,88,['#b1bd98','#879d89','#d5d5b3'],{balcony:true});
    a+=front(310,297,47,24,9,'#3e6c70')+text(314,297,26,'APARTMENTS',5.8);
    a+=tree(375,302,.6)+person(296,313,'#df9d66')+person(335,310,'#557e9a');
  }else{
    // Existing single-storey service yard, deliberately not an empty placeholder.
    a+=building(310,261,59,33,26,['#a6af9b','#839586','#c2c7a9'],{shop:'CYCLE SHOP'});
    a+=front(272,313,108,1,11,'#a99776');
    for(let x=276;x<380;x+=9)a+=line([x,313,1],[x,313,12],'#766e5c',.8);
    a+=box(278,254,12,9,8,['#ac8762','#8a7158','#d3b285'])+tree(289,289,.65);
    a+=dot(303,302,5,4,'none')+dot(316,302,5,4,'none');
    for(const x of [303,316]){const [cx,cy]=point(x,302,5);a+=`<circle cx="${cx}" cy="${cy}" r="4" fill="none" stroke="#3c6269" stroke-width="1.4"/>`;}
    a+=line([303,302,5],[310,302,13],'#915b49',1.5)+line([310,302,13],[316,302,5],'#915b49',1.5)+line([303,302,5],[316,302,5],'#915b49',1.5);
  }
  return a;
}
function overlay(state){
  if(state==='pressure'){
    let a=front(111,289,47,24,10,'#ece0bd')+text(116,289,27,'LETTINGS',6.3,'#5e695e');
    for(let i=0;i<6;i++)a+=person(123+i*9,304+(i%2)*3,['#d28d65','#55778c','#b9a569'][i%3]);
    a+=front(36,138,37,5,16,'#e5d5ad')+text(40,138,10,'VIEWING',5.3,'#3b606b');
    return a;
  }
  if(state==='maintenance'){
    let a='';
    for(const [x,z] of [[40,36],[59,59],[124,63]]){
      const y=x<100?290:288;
      a+=front(x,y+1,11,z,14,'#766d60')+line([x-1,y+2,z+4],[x+12,y+2,z+12],'#b99b78',3);
    }
    a+=poly([[149,289,93],[146,289,80],[153,289,72],[149,289,60]],'none','#8c7560',1.8);
    a+=front(23,292,70,0,5,'#a28b75')+box(34,300,16,9,9,['#aa916e','#837861','#c6b590']);
    // Scaffolding makes deferred repairs visible without depicting an abandoned city.
    for(const x of [25,56,89])a+=line([x,298,1],[x,298,85],'#747f7a',1.4);
    for(const z of [19,43,68]){a+=flat(23,293,69,8,z,'#c0af89');a+=line([25,298,z],[56,298,z+21],'#788680',1);}
    a+=front(37,302,42,7,11,'#dfc68c')+text(40,302,10,'REPAIRS DUE',5.4,'#56615d');
    return a;
  }
  return '';
}
const states=['baseline','pressure','maintenance','construction','homes'];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="610" viewBox="0 0 1000 610">
<title>Linden waterfront neighborhood — original 2D vector diorama</title>
<desc>Apartment blocks, independent shops and a bus stop around a crossing, with a tree-lined waterfront. Five named views share the same neighborhood.</desc>
<defs><g id="ground">${ground}</g><g id="back">${back}</g><g id="front">${frontBlock}</g><g id="life">${life}</g></defs>
${states.map((s,i)=>`<view id="${s}" viewBox="0 ${i*610} 1000 610"/><g transform="translate(0 ${i*610})"><use href="#ground"/><use href="#back"/><use href="#front"/>${lot(s)}<use href="#life"/>${overlay(s)}</g>`).join('\n')}
</svg>\n`;
const output=new URL('../game/art/neighborhood.svg',import.meta.url);
mkdirSync(new URL('../game/art/',import.meta.url),{recursive:true});writeFileSync(output,svg);
console.log(`Wrote ${states.length} shared views (${Math.round(Buffer.byteLength(svg)/1024)} KB).`);
