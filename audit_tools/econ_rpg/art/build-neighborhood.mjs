// Original 2D vector artwork. Run with Node to regenerate the local SVG sheet.
// All views reuse the same neighborhood geometry; only small overlays differ.
import { mkdirSync, writeFileSync } from 'node:fs';
// Illustration strokes, not CSS filters: silhouettes > frames > surface details.
const edge = '#20364c';
const point = (x, y, z = 0) => [480 + (x - y) * 1.05, 128 + (x + y) * .5 - z];
const pts = values => values.map(v => point(...v).map(n => +n.toFixed(2)).join(',')).join(' ');
const poly = (values, fill, stroke = edge, width = 1.5) => `<polygon points="${pts(values)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
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
  const [cx,cy]=point(x,y,39*size);
  return flat(x-9,y-9,18,18,1,'#a9b296')+box(x-7,y-7,14,14,5,['#c38b64','#8e6550','#efc994'])+
    line([x,y,5],[x,y,37*size],'#624c3b',4.5)+line([x,y,23*size],[x-8,y,33*size],'#624c3b',2)+
    `<g transform="translate(${cx} ${cy}) scale(${size})"><path d="M-18 12C-27 6-27-4-20-8C-25-18-15-25-8-22C-5-33 8-32 12-23C23-27 30-16 24-9C34-4 31 8 23 11C24 21 11 25 5 21C-4 30-16 23-15 18Z" fill="#4a8639" stroke="#284e3f" stroke-width="1.8"/><path d="M-20-8C-25-18-15-25-8-22C-5-33 8-32 12-23C23-27 30-16 24-9L15-5 11 5 1 1-8 8-17 2Z" fill="#83ba42"/><path d="M-15-13l8-5 4 7-8 4ZM4-20l8-1 4 6-8 4ZM-4-4l8-2 3 6-8 3Z" fill="#b6d967"/></g>`;
}
function person(x,y,shirt='#df9a6f',scale=1) {
  return dot(x+2,y+1,1,4*scale,'#334a4c40')+line([x-2,y,1],[x,y,8*scale],edge,2.4*scale)+line([x+3,y,1],[x+1,y,8*scale],edge,2.4*scale)+
    line([x,y,8*scale],[x,y,15*scale],edge,7*scale)+line([x,y,8*scale],[x,y,15*scale],shirt,5*scale)+
    line([x-3,y,13*scale],[x-5,y,8*scale],'#b78160',1.8*scale)+dot(x,y,19*scale,3*scale,'#dba879')+dot(x,y,21*scale,2.3*scale,'#4e493e');
}
function lamp(x,y) {
  return box(x-2,y-2,4,4,2,['#56636b','#384e5a','#70828a'])+line([x,y,2],[x,y,38],'#455e66',2.3)+
    line([x,y,38],[x+8,y,40],'#455e66',2)+flat(x+5,y-3,9,6,40,'#e8d6a4')+dot(x+9,y,38,2,'#fbdfa3');
}
function car(x,y,color='#d6ad58',axis='x') {
  const art = flat(x-2,y-1,36,18,0,'#293e4b50','none')+
    dot(x+6,y+16,4,4,edge)+dot(x+27,y+16,4,4,edge)+
    box(x,y,34,16,8,[color,'#355b70',color],4)+
    poly([[x+8,y+1,12],[x+13,y+1,20],[x+26,y+1,20],[x+30,y+1,12],[x+30,y+15,12],[x+26,y+15,20],[x+13,y+15,20],[x+8,y+15,12]],color)+
    poly([[x+14,y+15.4,19],[x+25,y+15.4,19],[x+28,y+15.4,13],[x+10,y+15.4,13]],'#b1dbe2')+
    line([x+20,y+16,13],[x+20,y+16,19],edge,1.2)+
    poly([[x+8,y+1,13],[x+12,y+1,19],[x+12,y+14,19],[x+8,y+14,13]],'#5a95b3')+
    front(x,y+16,4,8,3,'#f5ddb0')+front(x+30,y+16,3,8,3,'#e0ab75')+
    front(x,y+16,34,4,1.8,'#bbc4bd')+dot(x+6,y+17,4,2,'#8d9c9f')+dot(x+27,y+17,4,2,'#8d9c9f');
  // Reflection swaps the two street axes without changing vertical height.
  return axis === 'y' ? `<g transform="translate(${2*point(x,y)[0]} 0) scale(-1 1)">${art}</g>` : art;
}
function bench(x,y) {
  return line([x+2,y,0],[x+2,y,8],edge,2)+line([x+22,y,0],[x+22,y,8],edge,2)+
    flat(x,y-4,25,8,7,'#b38d66')+front(x,y-4,25,10,6,'#b38d66');
}
function windowFront(x,y,z,w=10,h=14,lit=false) {
  return front(x-1.5,y,w+3,z-1.5,h+3,'#fff0d5')+front(x,y+.2,w,z,h,lit?'#e9b565':'#23567f')+
    poly([[x+1,y+.4,z+h-1],[x+w-1,y+.4,z+h-1],[x+1,y+.4,z+4]],lit?'#f6d891':'#85cde3','none')+
    line([x+w/2,y+.6,z],[x+w/2,y+.6,z+h],edge,1.1)+line([x,y+.6,z+h/2],[x+w,y+.6,z+h/2],edge,1.1)+
    flat(x-2,y, w+4,3,z-2,'#e4c59b');
}
function planting(x,y,w=16,z=0){
  let a=box(x,y,w,6,5,['#b26d45','#785541','#dda66f'],z);
  for(let i=2;i<w;i+=4)a+=dot(x+i,y+3,z+7,4,'#447447')+dot(x+i-1,y+3,z+10,2.6,'#9dbd4f');
  return a;
}
function building(x,y,w,d,h,colors,{shop='',roof='flat',balcony=false,style='masonry',awning='#b55542'}={}) {
  let art = flat(x+8,y+9,w+16,d+8,0,'#31465540','none')+box(x,y,w,d,h,colors);
  // Plinth, floor bands and facade windows retain a consistent human scale.
  art+=front(x,y+d,w,0,5,'#b29b7c')+side(x+w,y,d,0,5,'#8c826e');
  if(style==='brick'){
    for(let z=10;z<h-3;z+=7){
      for(let wx=x+3+(z%2)*6;wx<x+w-4;wx+=15){
        art+=line([wx,y+d+.2,z],[Math.min(wx+10,x+w-2),y+d+.2,z],'#824f42',.65);
        art+=line([wx,y+d+.2,z],[wx,y+d+.2,z+3],'#824f42',.65);
      }
    }
  }
  if(style!=='modern'){
    for(let z=6;z<h-5;z+=9)for(const wx of [x,x+w-5])art+=front(wx,y+d+.3,5,z,6,'#efcf9d');
  }else{
    art+=front(x+3,y+d+.3,5,6,h-8,'#f5ead4')+front(x+w-8,y+d+.3,5,6,h-8,'#f5ead4');
    art+=side(x+w+.3,y+3,6,6,h-8,'#d1d7c7');
  }
  for(let z=28;z<h-8;z+=25){
    art+=front(x-1,y+d+1,w+2,z-6,2,'#ecd4ac')+side(x+w+1,y-1,d+2,z-6,2,'#b8b097');
    for(let wx=x+9;wx<x+w-9;wx+=18) art+=windowFront(wx,y+d+.5,z,10,15,((wx-x)/18+z)%3<1);
    for(let wy=y+8;wy<y+d-9;wy+=19){
      art+=side(x+w+.5,wy,10,z,15,'#d9cca7')+side(x+w+1,wy+1,8,z+1,13,'#284f71');
      art+=poly([[x+w+1.1,wy+1,z+13],[x+w+1.1,wy+7,z+13],[x+w+1.1,wy+1,z+3]],'#669bb3','none');
      art+=line([x+w+1.2,wy+5,z+1],[x+w+1.2,wy+5,z+14],edge,1);
    }
  }
  if(shop){
    art+=front(x+5,y+d+.5,w-10,4,19,'#264354');
    for(let wx=x+8;wx<x+w-8;wx+=14)art+=front(wx,y+d+1,10,6,15,'#d5a562')+poly([[wx,y+d+1.2,21],[wx+10,y+d+1.2,21],[wx,y+d+1.2,12]],'#71a7b8','none');
    for(let wx=x+7;wx<x+w-6;wx+=13) art+=line([wx,y+d+1,5],[wx,y+d+1,21],'#e6ccaa',2);
    art+=front(x+2,y+d+1,w-4,25,11,'#233e51')+text(x+7,y+d+1.2,28,shop,6.7);
    for(let a=0;a<w-6;a+=8){
      const col=Math.floor(a/8)%2?'#f4e3be':awning;
      art+=poly([[x+3+a,y+d,24],[x+Math.min(w-3,a+11),y+d,24],[x+Math.min(w-3,a+11),y+d+10,20],[x+3+a,y+d+10,20]],col,'#966d54',.4);
      art+=front(x+3+a,y+d+10,Math.min(8,w-6-a),16,4,col);
    }
  }else{
    art+=front(x+6,y+d+.5,16,2,23,'#263e51')+front(x+9,y+d+1,10,10,12,'#81b5ca')+dot(x+18,y+d+1,9,1,'#edc979');
    art+=flat(x+3,y+d,21,6,2,'#dfceb0');
    for(let wx=x+28;wx<x+w-10;wx+=18)art+=windowFront(wx,y+d+.5,8,10,12);
  }
  if(balcony){
    for(const z of [48,73].filter(z=>z<h-20)){
      art+=flat(x+6,y+d,w-12,9,z,'#d4c6a6')+front(x+6,y+d+9,w-12,z-2,2,'#677575');
      for(let wx=x+6;wx<=x+w-6;wx+=6)art+=line([wx,y+d+9,z],[wx,y+d+9,z+10],edge,1.5);
      art+=line([x+6,y+d+9,z+10],[x+w-6,y+d+9,z+10],edge,1.8)+planting(x+11,y+d+3,13,z+1);
    }
  }
  if(roof==='gable'){
    art+=poly([[x-3,y-3,h],[x+w+3,y-3,h],[x+w+3,y+d/2,h+17],[x-3,y+d/2,h+17]],'#75483e');
    art+=poly([[x-3,y+d/2,h+17],[x+w+3,y+d/2,h+17],[x+w+3,y+d+3,h],[x-3,y+d+3,h]],'#be704e');
    for(let t=8;t<w;t+=9)art+=line([x+t,y+d/2,h+17],[x+t,y+d+3,h],'#814c3e',.85);
    for(let r=0;r<3;r++)art+=line([x-3,y+d/2+(d/2+3)*(r+1)/4,h+17-17*(r+1)/4],[x+w+3,y+d/2+(d/2+3)*(r+1)/4,h+17-17*(r+1)/4],'#e29860',.8);
    art+=box(x+9,y+10,8,8,12,['#a67864','#785d50','#bf9b7c'],h+6);
  }else{
    art+=flat(x+3,y+3,w-6,d-6,h+.1,'#3b536c')+front(x-2,y+d+2,w+4,h,5,'#fff0d5')+side(x+w+2,y-2,d+4,h,5,'#bdc5b8');
    art+=line([x-2,y+d+2,h+5],[x+w+2,y+d+2,h+5],'#fcf0d2',1.2);
    art+=box(x+10,y+10,15,11,8,['#d1d8d2','#819aa4','#eef0dc'],h+1);
    for(let a=0;a<4;a++)art+=line([x+12,y+12+a*2,h+9],[x+23,y+12+a*2,h+9],'#536d80',1);
    if(w>60)art+=box(x+w-23,y+12,13,10,3,['#557186','#334b66','#3a719a'],h+1);
    art+=line([x+27,y+16,h+1],[x+w-24,y+16,h+1],'#d1cbbc',2);
    if(style==='modern')art+=planting(x+7,y+d-10,w-16,h+1);
  }
  // Downpipes and entrance rails give the buildings a useful architectural scale.
  art+=line([x+w-2,y+d+2,5],[x+w-2,y+d+2,h-2],'#4a666a',1.7);
  if(!shop)art+=line([x+4,y+d+6,2],[x+4,y+d+6,12],edge,1.3)+line([x+24,y+d+6,2],[x+24,y+d+6,12],edge,1.3);
  return art;
}

let ground = `<rect x="-100" y="-100" width="1200" height="850" fill="#eef4f8"/>`;
ground+=poly([[-25,-5,-7],[444,-5,-7],[444,428,-7],[-25,428,-7]],'#476b73','none');
ground+=flat(-25,-5,469,433,0,'#d6dedf','none');
ground+=flat(-25,353,469,75,1,'#178fb4','none');
// Curved, staggered ripples break the road-like rows of straight water marks.
for(let row=0;row<4;row++)for(let col=0;col<12;col++){
  const [rx,ry]=point(-12+col*38+(row%2)*17,362+row*19,1.3);
  ground+=`<path d="M${rx} ${ry}q5-3 10 0t10 0m-7 6q4-2 8 0" fill="none" stroke="${(row+col)%3?'#73d7e9':'#d1f7fa'}" stroke-width="1.6" stroke-linecap="round"/>`;
}
ground+=flat(-10,1,438,338,1,'#f3e5cd','none');
ground+=flat(-10,157,438,49,2,'#465c72','none')+flat(190,1,48,338,2,'#465c72','none');
for(const y of [156,207])ground+=line([-10,y,3],[428,y,3],'#f7e5c9',3);
for(const x of [188,240])ground+=line([x,1,3],[x,339,3],'#f7e5c9',3);
for(let x=3;x<425;x+=30)if(x<170||x>245)ground+=flat(x,180,13,1.2,2.2,'#e1d9ad','none');
for(let y=10;y<330;y+=28)if(y<140||y>215)ground+=flat(213,y,1.5,13,2.2,'#e1d9ad','none');
for(let i=0;i<5;i++){ground+=flat(193+i*8,144,4,10,2.4,'#ece6cf','none');ground+=flat(176,163+i*8,10,4,2.4,'#ece6cf','none');}
for(let x=0;x<425;x+=20){ground+=line([x,209,2],[x,219,2],'#c7bea2',.6);ground+=line([x,147,2],[x,155,2],'#c7bea2',.6);}
ground+=flat(-9,329,438,18,3,'#c4b395','none');
for(let x=-5;x<425;x+=12)ground+=line([x,330,3],[x,347,3],'#9d9680',.8);
ground+=front(-10,353,440,-9,12,'#8c9c9c');
for(let x=-10;x<425;x+=22)ground+=line([x,353,-8],[x,353,3],'#596f7b',1);
ground+=line([-10,348,3],[430,348,3],'#405965',2);
for(let x=0;x<430;x+=22)ground+=line([x,348,3],[x,348,13],'#405965',1.2);
ground+=line([-10,348,13],[430,348,13],'#405965',1.5);
// A short timber landing and moored launch make the water unmistakable.
ground+=flat(119,350,27,40,5,'#bf8959');
for(let y=353;y<390;y+=5)ground+=line([119,y,5.2],[146,y,5.2],'#78513c',1);
for(const x of [120,146])for(const y of [352,387])ground+=box(x-1,y-1,3,3,12,['#97704b','#624b3c','#efcf97']);
ground+=poly([[154,364,2],[174,364,2],[174,389,2],[164,404,2],[154,389,2]],'#124c73','none');
ground+=poly([[153,363,6],[173,363,6],[173,388,6],[163,402,6],[153,388,6]],'#f8f3df');
ground+=poly([[156,367,7],[170,367,7],[170,388,7],[163,397,7],[156,388,7]],'#367b9f');
ground+=box(156,368,14,13,12,['#f7eed5','#b4d9e0','#fff9e8'],7);
ground+=front(158,381.2,10,10,7,'#225676')+side(170.2,370,8,10,7,'#357d9f');
ground+=line([153,370,6],[145,365,9],'#685645',1.1);

let back = tree(24,18,.8)+tree(180,13,.9)+tree(248,12,.9)+tree(413,40,.9);
back+=building(34,15,63,47,93,['#f0b76a','#b87548','#e6be82'],{roof:'gable',style:'brick'});
back+=building(105,17,63,57,125,['#e77f60','#ae513f','#dcc0a3'],{balcony:true,style:'brick'});
back+=building(263,20,58,49,105,['#f9dc94','#c79355','#f0dab0']);
back+=building(331,24,63,52,79,['#f0f3e7','#94babc','#d8d6b8'],{style:'modern'});
// Side-street traffic follows its lane and sits behind the nearer shop row.
back+=car(195,105,'#c5684a','y');
back+=building(28,85,66,52,76,['#f4cd91','#b0875c','#e9c49a'],{shop:'GROCER',awning:'#53836b'});
back+=building(110,91,63,46,100,['#55a5c1','#326b92','#ccd9cb'],{shop:'LINDEN CAFE',balcony:true,style:'modern',awning:'#b6783d'});
back+=building(270,92,58,42,65,['#f1b363','#b57543','#e6c98f'],{shop:'REPAIRS',roof:'gable',style:'brick'});
back+=building(341,94,61,43,85,['#b7d4bc','#6b9e90','#ddd7b5'],{balcony:true,style:'modern'});
back+=tree(16,131,.78)+tree(250,120,.75)+tree(409,121,.9)+tree(181,75,.75);
// Grocer's produce tables, cafe chairs, and the mechanic's narrow service alley.
for(const x of [34,52,70]){
  back+=box(x,146,12,7,7,['#a57347','#75563d','#d8ab6c']);
  for(let a=2;a<12;a+=4)back+=dot(x+a,149,10,2.3,x===52?'#d98e43':'#89a945');
}
back+=planting(103,141,12)+planting(154,144,14)+planting(388,145,17);
back+=box(166,140,7,5,10,['#7b9881','#5e7c70','#a5b69a']);
back+=bench(114,147)+person(134,148,'#e2b968');

let frontBlock = building(25,230,64,60,81,['#dc795d','#a45342','#d1ac86'],{roof:'gable',style:'brick',shop:'QUAY BOOKS',awning:'#3f7990'});
// Original landmark: the small square clock turret on the converted quay building.
frontBlock+=box(46,248,23,19,26,['#e4c491','#ba9b6c','#f4ddaa'],95);
frontBlock+=flat(43,245,29,25,123,'#3a6573');
const [clockX,clockY]=point(58,267.5,109);
frontBlock+=`<g transform="matrix(1 .476 0 1 ${clockX} ${clockY})"><circle r="8" fill="#f4e4bd" stroke="${edge}" stroke-width="1.6"/><path d="M0-5V0L4 2" fill="none" stroke="${edge}" stroke-width="1.6"/></g>`;
frontBlock+=building(101,232,69,56,107,['#ffe1a5','#c59a64','#ddd1a8'],{balcony:false});
// A projecting stone bay gives this older apartment block a different silhouette.
frontBlock+=box(125,285,23,11,71,['#f9e4ba','#c7ab7e','#f4e3bb'],27);
for(const z of [33,58,83])frontBlock+=windowFront(129,296.5,z,14,17)+flat(123,285,27,14,z-5,'#dbbf90');
frontBlock+=front(108,289,52,24,12,'#315869')+text(112,289.4,28,'LETTINGS',7.2);
frontBlock+=planting(104,294,14)+planting(153,294,13);
frontBlock+=tree(13,310,1)+tree(182,285,.85)+bench(59,324)+lamp(185,221)+lamp(12,149)+lamp(406,218);
frontBlock+=person(92,308,'#7c99b3')+person(83,322,'#b37961')+person(39,310,'#dbb153');

// Road objects are painted behind the foreground buildings, never over their facades.
let traffic=car(164,172,'#dea536')+car(321,186,'#5c96b0');
// Bus shelter, route sign, shop tables and ordinary street activity.
traffic+=box(248,211,41,14,2,['#9aa8a1','#728b8e','#ccd0b4']);
for(const x of [249,287])traffic+=line([x,212,2],[x,212,32],edge,2.8);
traffic+=front(250,211,35,6,25,'#8cc5d0')+flat(245,208,47,20,33,'#2b6685')+text(253,211,18,'BUS',7,'#233e51');
traffic+=bench(254,216)+line([296,224,1],[296,224,33],edge,2)+front(291,224,10,27,11,'#2d6b94');
traffic+=person(252,228,'#bc795b')+person(267,229,'#456e84')+person(174,140,'#bd9761');
traffic+=person(15,170,'#527e88')+person(361,147,'#c4755c');
traffic+=flat(112,143,10,7,9,'#b68c63')+flat(138,143,10,7,9,'#b68c63');
traffic+=lamp(244,33)+lamp(181,118);
let life=tree(413,301,1)+bench(317,325)+person(304,329,'#7b9aab');
for(const x of [24,157,247,380])life+=planting(x,335,15);

function lot(state) {
  let a=flat(271,246,115,65,2,'#b9b298');
  if(state==='construction'){
    a+=flat(274,249,109,59,3,'#ac9577')+box(278,251,94,49,9,['#b0b3a7','#7a8e8d','#dcd7be']);
    // Open floors and columns deliberately have no glazing, doors or occupied balconies.
    for(const z of [10,43,76]){
      for(const x of [280,322,368])for(const y of [254,295])a+=box(x,y,4,4,31,['#cfb891','#88918a','#e4d2ad'],z);
      a+=box(276,249,98,53,4,['#d2c4a6','#849697','#e6d6b5'],z+30);
    }
    for(const x of [278,326,374])a+=line([x,306,3],[x,306,112],'#435e69',2.3);
    for(const z of [29,63,96]){
      a+=flat(276,301,100,8,z,'#b58d57');
      a+=line([278,306,z],[326,306,z+29],'#658083',1.5)+line([326,306,z],[374,306,z+29],'#658083',1.5);
    }
    // A lattice crane has a readable silhouette even when the scene is only 264px wide.
    for(const x of [388,398])a+=line([x,278,2],[x,278,188],'#925a25',3.5);
    for(let z=8;z<180;z+=16){
      a+=line([388,278,z],[398,278,z+15],'#e7ad37',2.3)+line([398,278,z],[388,278,z+15],'#e7ad37',2.3);
      a+=line([388,278,z],[398,278,z],'#ffcd56',2.3);
    }
    a+=line([282,278,181],[434,278,181],'#93602a',4)+line([282,278,190],[434,278,190],'#d99a26',4);
    for(let x=282;x<428;x+=14)a+=line([x,278,181],[x+14,278,190],'#e7b63f',2);
    a+=line([393,278,208],[282,278,190],edge,1.2)+line([393,278,208],[434,278,190],edge,1.2);
    a+=box(388,272,15,9,10,['#e7b450','#a17736','#f2d585'],185);
    a+=line([310,278,183],[310,278,119],edge,1.5)+line([310,278,119],[316,278,117],edge,3);
    a+=front(269,316,116,2,22,'#287ea5');
    for(let x=274;x<384;x+=7)a+=line([x,316.4,3],[x,316.4,23],'#8db8c0',.9);
    a+=front(294,317,65,8,10,'#e0d4b6')+text(300,317.2,11,'HOUSING WORKS',6,'#2d4a60');
    a+=person(264,321,'#f2b642',1.2);
    for(const x of [275,382])a+=poly([[x-4,322,1],[x+4,322,1],[x,322,14]],'#e28b35')+front(x-3,322.2,6,4,2,'#fff1d8');
    for(let z=0;z<9;z+=3)a+=box(376,296,17,8,2,['#cb9a5f','#977342','#edbc7c'],z);
    a+=box(271,239,15,12,10,['#74898d','#466975','#a8b8b4']);
  }else if(state==='homes'){
    a+=building(278,251,94,49,115,['#f2f0df','#73aeb9','#fff0d0'],{balcony:true,style:'modern'});
    // Two warm entrance bays distinguish the finished building from the open frame.
    a+=front(315,301,26,3,25,'#356880')+front(319,301.5,18,5,20,'#98ccdf');
    a+=flat(311,299,36,9,28,'#b9804a')+front(311,308,36,26,3,'#83583c');
    a+=front(339,301,28,28,9,'#315569')+text(341,301.3,31,'HOMES',5.8);
    a+=planting(280,310,24)+planting(344,310,28)+tree(380,311,.7);
    a+=flat(312,310,26,18,2,'#fff0d7')+planting(276,323,25)+planting(345,323,26);
    a+=person(324,316,'#df9d66',1.05)+person(334,312,'#557e9a',1.05)+person(351,324,'#b77969');
  }else{
    // Existing single-storey service yard, deliberately not an empty placeholder.
    a+=building(310,261,59,33,30,['#69949b','#466e80','#c2c7a9'],{shop:'CYCLE SHOP',awning:'#396d81'});
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
    let a=front(108,289,52,24,12,'#234c65')+text(112,289.4,28,'LETTINGS',7.2);
    // Occupied-window panels and a fuller queue stay readable at phone scale.
    for(const [x,z] of [[108,55],[151,55],[108,80],[151,80]]){
      a+=front(x,290,17,z,13,'#f5d08b')+front(x+2,290.3,5,z+2,9,'#b85f45')+front(x+10,290.3,5,z+2,9,'#b85f45');
    }
    a+=flat(111,304,70,25,1.5,'#ecdfc7','none');
    for(const x of [112,140,169])a+=line([x,327,2],[x,327,11],edge,1.5);
    a+=line([112,327,10],[169,327,10],'#5a7476',1.5);
    const people=[[115,306],[129,307],[143,308],[157,309],[171,310],[174,321],[160,323],[146,323],[132,323],[118,322]];
    people.forEach(([x,y],i)=>{a+=person(x,y,['#d57143','#3c739e','#d7ae41','#54816b'][i%4],1.35);});
    a+=front(97,303,15,4,21,'#f1dfb6')+text(98,303.5,17,'VIEW',4.4,'#294854');
    a+=line([99,303,0],[99,303,4],edge,2)+line([110,303,0],[110,303,4],edge,2);
    return a;
  }
  if(state==='maintenance'){
    let a='';
    // Broad areas of exposed masonry read before the finer cracks and scaffolding.
    a+=poly([[105,290,97],[121,290,97],[118,290,78],[123,290,65],[117,290,42],[103,290,47]],'#a77960');
    a+=poly([[148,298,95],[147,298,72],[151,298,56],[147,298,31],[141,298,29],[141,298,97]],'#a77960');
    for(let z=46;z<93;z+=7)a+=line([106,290.3,z],[117,290.3,z],'#614a40',1.1);
    for(const [x,z] of [[34,29],[52,29],[34,54],[52,54],[70,54],[128,34],[128,59]]){
      const y=x<100?291:297;
      a+=front(x,y+1,13,z,17,'#333e42')+front(x-1,y+2,15,z+2,5,'#b99665')+
        line([x-1,y+2.5,z+3],[x+14,y+2.5,z+14],'#d2b07b',4)+line([x+14,y+2.6,z+3],[x-1,y+2.6,z+14],'#967553',2);
    }
    a+=poly([[154,290,96],[147,290,85],[154,290,77],[149,290,63],[158,290,53]],'none','#624f43',2.7);
    a+=poly([[157,290,21],[157,290,44],[168,290,53],[170,290,36],[170,290,20]],'#a87751','#a87751');
    for(let z=25;z<44;z+=5)a+=line([159,290.3,z],[168,290.3,z],'#754d3a',.9);
    // Large repairs read as material changes, not a red failure tint.
    a+=flat(118,242,26,16,108,'#35464e')+flat(146,246,17,19,108,'#50646a');
    a+=poly([[36,281,94],[59,281,94],[59,292,81],[36,292,81]],'#59616a');
    a+=front(23,292,70,0,5,'#977455')+box(34,305,19,10,12,['#b79563','#826846','#d9b885']);
    for(const x of [23,57,92])a+=line([x,302,1],[x,302,92],'#314e5f',2.8);
    for(const z of [23,48,73]){
      a+=flat(21,294,73,10,z,'#d0aa70')+line([23,302,z],[57,302,z+22],'#648b94',2)+line([57,302,z],[92,302,z+22],'#648b94',2);
      a+=line([23,304,z+8],[92,304,z+8],'#3b6575',1.6);
    }
    a+=front(32,311,55,2,12,'#cfb481')+text(36,311.3,6,'REPAIRS DUE',6.2,'#374b51');
    for(const x of [22,93])a+=line([x,310,1],[x,310,17],'#ba8651',3);
    return a;
  }
  return front(153,290,12,43,15,'#f1dfb6')+text(154,290.3,50,'LET',4.1,'#294854')+
    front(34,139,12,7,14,'#e7d7b4')+text(35,139.3,13,'LET',4.1,'#294854');
}
const states=['baseline','pressure','maintenance','construction','homes'];
// Tight editorial framing. The shared roads and both changing foreground sites stay in view.
const viewBox = offset => `115 ${offset+8} 795 505`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="610" viewBox="${viewBox(0)}">
<title>Linden waterfront neighborhood — original 2D vector diorama</title>
<desc>Apartment blocks, independent shops and a bus stop around a crossing, with a tree-lined waterfront. Five named views share the same neighborhood.</desc>
<defs><g id="ground">${ground}</g><g id="back">${back}</g><g id="traffic">${traffic}</g><g id="front">${frontBlock}</g><g id="life">${life}</g><g id="existing-lot">${lot('baseline')}</g></defs>
${states.map((s,i)=>`<view id="${s}" viewBox="${viewBox(i*610)}"/><g transform="translate(0 ${i*610})"><use href="#ground"/><use href="#back"/><use href="#traffic"/><use href="#front"/>${s==='construction'||s==='homes'?lot(s):'<use href="#existing-lot"/>'}<use href="#life"/>${overlay(s)}</g>`).join('\n')}
</svg>\n`;
const output=new URL('../game/art/neighborhood.svg',import.meta.url);
mkdirSync(new URL('../game/art/',import.meta.url),{recursive:true});writeFileSync(output,svg);
console.log(`Wrote ${states.length} shared views (${Math.round(Buffer.byteLength(svg)/1024)} KB).`);
