const fs=require('node:fs'),file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-final-art.html';
if(fs.existsSync(backup))throw Error('Backup exists');fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,b);}
const palStart=s.indexOf('const TOWN_PALETTE='),palEnd=s.indexOf('const PIXEL_POLISH=',palStart);
s=s.slice(0,palStart)+`const TOWN_PALETTE={
  ink:'#233b4a',deep:'#192e40',slate:'#344d68',road:'#465d70',steel:'#b4cad6',
  sky:'#86cef4',far:'#92bbdb',cloud:'#ffffff',cloudShade:'#cde7fa',leaf:'#3e8a46',grass:'#76b65a',
  shade:'#285b46',lightGrass:'#b9dc78',paving:'#d9cfb2',cream:'#fff0c8',
  paper:'#eff5eb',sand:'#eab66c',ochre:'#a57042',sun:'#ffdc8c',gold:'#f3c543',
  brick:'#df7851',brickDark:'#a24a45',wood:'#504039',skin:'#e2ab80',
  teal:'#2aa6b4',sea:'#669cab',purple:'#9d7bbf',
  coral:'#ee7955',blue:'#328fce',violet:'#a277c9',jade:'#299c78',amber:'#f0bc42',
  skyline:'#7da5cd',skylineShade:'#668ab8',skylineWindow:'#c1def3'
};
`+s.slice(palEnd);
replace("r(x,y+6,36,5,'cloud');r(x+7,y+2,22,7,'cloud');r(x+14,y,9,4,'paper');", "r(x,y+6,36,5,'cloudShade');r(x+7,y+2,22,7,'cloud');r(x+14,y,9,4,'cloud');");
replace('// Redrawn native 22 × 32 people; bottom-row soles retain the previous path + 1 ground line.','// Redrawn 20 × 30 people: 6.25% shorter and 9% narrower, with unchanged ground contact.');
replace('pedestrian:{x:-10,y:-30},shopper:{x:-10,y:-30},resident:{x:-10,y:-30},factoryWorker:{x:-10,y:-30},worker:{x:-10,y:-30}', 'pedestrian:{x:-9,y:-28},shopper:{x:-9,y:-28},resident:{x:-9,y:-28},factoryWorker:{x:-9,y:-28},worker:{x:-9,y:-28}');
replace('const VEHICLE_WHEEL_CONTACT={compact:27,sedan:27,truck:30};','const VEHICLE_WHEEL_CONTACT={compact:29,sedan:29,truck:30};');
replace('y:travelY>0?31-step:24+step','y:travelY>0?29-step:22+step');
replace('y:31};','y:29};');
replace('y:(travelY>0?24+step:31-step)-lift','y:(travelY>0?22+step:29-step)-lift');
replace('y:31-lift','y:29-lift');
const humanStart=s.indexOf('const PERSON_HEAD='),humanEnd=s.indexOf('// Taller native cabins',humanStart);
s=s.slice(0,humanStart)+`const PERSON_HEAD=[
 '         FFFF','        FFFFFF','        FFFFFF','        FSSSS','         SSSSS','         SSSS'
];
// Eight shoulder/arm silhouettes counter the step; there is no lateral head toggle.
const WALK_ARMS=[
 {far:[6,13,5,17],near:[14,13,16,16]}, {far:[6,14,6,18],near:[14,14,15,17]},
 {far:[7,14,8,17],near:[13,15,12,18]}, {far:[8,13,10,16],near:[12,15,11,18]},
 {far:[10,13,13,16],near:[11,14,8,17]}, {far:[9,14,11,17],near:[11,15,9,18]},
 {far:[8,15,9,18],near:[12,15,12,18]}, {far:[7,14,6,17],near:[14,14,15,17]}
];
function humanFrames(role,travelY=0){
  const head=role==='worker'?['         YYYY','        YHYYYY','       YYYYYYYY','       YYYYYYYYY','         SSSSS','         SSSS']:
    role==='factoryWorker'?['         CCCC','        CCCCCO','        CCAACCO','        CCCCOOO','         SSSSS','         SSSS']:PERSON_HEAD;
  return SPRITE_WALK.phases.map(phase=>{
    const idle=phase===null,pose=idle?0:Math.floor(phase/2),down=!idle&&(pose===1||pose===5)?1:0;
    const pixels=Array.from({length:30},()=>Array(20).fill(' '));
    const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels[yy][xx]=c;};
    const line=(x0,y0,x1,y1,c,w=2)=>{const count=Math.max(1,Math.abs(x1-x0),Math.abs(y1-y0));for(let n=0;n<=count;n++)r(Math.round(x0+(x1-x0)*n/count),Math.round(y0+(y1-y0)*n/count),w,1,c);};
    head.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')pixels[y][x]=c;}));
    const arms=idle?{far:[6,14,7,18],near:[14,14,14,18]}:WALK_ARMS[pose];
    line(7,10+down,...arms.far.slice(0,2),'U');line(...arms.far,'S');
    // A short neck enters sloped shoulders; the shirt tapers into the pelvis.
    r(10,6,2,1,'S');r(9,7,4,1,'U');r(10,7,2,1,'C');
    r(8,8,6,1,'U');r(9,8,4,1,'C');r(7,9,8,2,'U');r(8,9,6,3,'C');
    r(8,12,6,3+down,'C');r(8,11,1,4+down,'U');r(9,10,2,1,'A');
    r(9,15+down,5,2,'C');r(8,17,6,2,'P');r(8,17,2,2,'T');
    line(13,10+down,...arms.near.slice(0,2),'C');line(...arms.near,'S');
    const feet=idle?{left:{x:8,y:29},right:{x:12,y:29},leftPlanted:true}:walkingFeet(phase,travelY);
    for(const [side,hip,tone] of [['left',8,'T'],['right',11,'P']]){
      const foot=feet[side],planted=idle||(side==='left'?feet.leftPlanted:!feet.leftPlanted);
      const bend=(hip+foot.x)/2+(planted?(down?.7:0):2.8);
      // Scan-convert a tapered, curved trouser silhouette. There is no drawn knee joint.
      for(let y=18;y<foot.y;y++){
        const t=(y-18)/Math.max(1,foot.y-19),center=(1-t)*(1-t)*(hip+1)+2*(1-t)*t*(bend+1)+t*t*(foot.x+1);
        const width=t<.3?4-t*2:t<.55?3.4-(t-.3)*3.6:t<.76?2.5+(t-.55)*2:2.92-(t-.76)*4;
        const left=Math.round(center-width/2),right=Math.max(left+1,Math.round(center+width/2)-1);
        r(left,y,right-left+1,1,tone);
      }
      r(foot.x,foot.y-1,2,1,tone);r(foot.x,foot.y,4,1,'O');
      if(!idle&&planted&&phase%8>=6){pixels[foot.y][foot.x]=' ';pixels[foot.y-1][foot.x]='O';}
    }
    if(role==='worker'){
      r(9,10,1,6,'Y');r(12,10,1,6,'Y');r(9,13,4,1,'H');r(9,16,4,1,'F');r(11,17,2,1,'K');
      if(idle){r(5,13,3,6,' ');r(14,13,3,6,' ');line(7,11,6,14,'C');line(6,14,9,16,'S');line(13,11,15,14,'C');line(15,14,12,16,'S');r(9,17,8,1,'F');r(16,15,2,3,'K');}
    }else if(role==='factoryWorker'){
      r(9,11,4,5,'P');r(9,10,1,5,'C');r(12,10,1,5,'C');r(10,12,2,2,'K');
      if(idle){r(5,13,3,6,' ');r(14,13,3,6,' ');line(7,11,6,14,'C');line(6,14,9,16,'S');line(13,11,15,14,'C');line(15,14,12,16,'S');r(9,15,5,4,'K');r(10,16,3,2,'H');}
    }else if(role==='shopper'){
      // Tied-back hair and a short-sleeve top distinguish the casual, bag-carrying figure.
      r(6,2,2,3,'F');r(7,4,1,2,'F');r(14,11,4,8,' ');line(13,11,15,14,'C');line(15,14,15,18,'S');
      r(15,19,4,1,'F');r(15,20,1,2,'F');r(18,20,1,2,'F');r(15,22,4,4,'D');r(15,22,1,4,'F');r(16,22,1,3,'L');r(15,26,4,1,'F');r(17,21,1,2,'V');
    }else if(role==='resident'){
      // A fuller open jacket and swept gray hair, rather than a recolored pedestrian shirt.
      r(9,0,3,1,'K');r(8,1,4,1,'K');r(7,11,2,5,'U');r(13,11,2,5,'U');r(10,9,2,5,'A');r(9,15,5,1,'U');
      if(idle){r(14,13,2,6,' ');line(13,11,15,14,'C');line(15,14,12,16,'S');}
    }
    return pixels.map(row=>row.join(''));
  });
}
`+s.slice(humanEnd);
// Increase passenger height two pixels and length two; redraw the taller glazing/beltline.
replace("width=type==='compact'?46:type==='sedan'?52:58,height=type==='truck'?31:28", "width=type==='compact'?48:type==='sedan'?54:58,height=type==='truck'?31:30");
const passengerStart=s.indexOf("    const sedan=type==='sedan',roof="),passengerEnd=s.indexOf('  const wheels=',passengerStart);
let passenger=s.slice(passengerStart,passengerEnd);
passenger=passenger.replace('y<=14','y<=16').replaceAll(",3,8,11,'W'",",3,8,13,'W'").replaceAll(",3,2,11,'O'",",3,2,13,'O'");
// Shift body coordinates, not the bitmap; keep cabin tops and roof in place.
passenger=passenger.replace(/r\(([^,]+),(\d+),/g,(match,x,y)=>Number(y)>=13?`r(${x},${Number(y)+2},`:match);
passenger=passenger.replace(",17,1,8,'M'",",17,1,8,'M'");
s=s.slice(0,passengerStart)+passenger+s.slice(passengerEnd);
replace("[10,36]:type==='sedan'?[11,41]", "[10,38]:type==='sedan'?[11,43]");
// Commercial sprites share the 31px contact row while having different body lengths/roof heights.
const insert=s.indexOf('const sprites={');
s=s.slice(0,insert)+`const COMMERCIAL_STYLES=['box','van','work'];
function commercialVariant(index,deliveryEvery){return COMMERCIAL_STYLES[Math.floor(index/deliveryEvery)%COMMERCIAL_STYLES.length];}
function commercialFrames(style){
  if(style==='box')return vehicleFrames('truck');
  const width=style==='van'?52:56,grid=Array.from({length:31},()=>Array(width).fill(' '));
  const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=c;};
  if(style==='van'){
    // One continuous high-roof body, sliding cargo door and a raked front screen.
    r(4,1,31,1,'O');r(2,2,36,2,'O');r(1,4,39,19,'O');r(2,4,37,18,'B');r(4,3,32,1,'L');
    r(38,6,4,5,'O');r(38,11,7,7,'O');r(39,18,11,6,'O');r(39,18,10,5,'B');
    r(5,6,17,8,'M');r(6,6,15,7,'B');r(25,5,12,11,'W');r(26,5,10,1,'H');r(26,6,1,5,'H');r(25,15,12,1,'G');r(37,10,4,1,'K');
    r(22,5,1,17,'M');r(34,17,3,1,'K');r(18,16,3,1,'K');r(5,18,15,1,'L');r(3,22,46,3,'M');r(47,19,3,3,'H');r(1,18,2,3,'R');r(49,23,3,2,'K');
  }else{
    // A low open bed with rails and a separate raised cab; no repeated cargo box.
    r(1,17,28,8,'O');r(2,18,26,5,'B');r(2,17,27,1,'L');r(4,19,22,2,'M');r(4,21,22,1,'K');
    for(const x of [3,11,19,27])r(x,15,1,5,'K');r(3,15,25,1,'K');
    r(31,5,12,1,'O');r(30,6,15,2,'O');r(30,8,17,11,'O');r(30,19,24,6,'O');r(31,7,13,12,'B');r(31,7,11,10,'W');r(32,7,9,1,'H');r(32,8,1,4,'H');r(31,16,11,1,'G');
    r(43,11,4,1,'K');r(31,19,21,5,'B');r(32,19,3,1,'K');r(31,22,11,1,'L');r(50,20,3,2,'H');r(1,23,52,3,'M');r(53,23,3,2,'K');r(1,21,2,2,'R');
  }
  const wheels=style==='van'?[10,41]:[10,45];
  return [0,1].map(phase=>{const copy=grid.map(row=>[...row]);const tire=['  TTTTT  ',' TTKKKTT ','TTKKHKKTT',phase?'TKKTOKKKT':'TKKKOTKKT','TTKKKKKTT','TTKKTKKTT',' TTKKKTT ','  TTTTT  '];for(const cx of wheels)tire.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')copy[23+y][cx-4+x]=c;}));return copy.map(row=>row.join(''));});
}
const commercialSprites=Object.fromEntries(COMMERCIAL_STYLES.map(style=>[style,{frames:commercialFrames(style)}]));
`+s.slice(insert);
replace('const key=`${type}/${frame}/${variant}/${visual.upgraded}/${travelY}`;', "const style=type==='truck'?commercialVariant(variant,visual.deliveryEvery):'';\n    const key=`${type}/${frame}/${variant}/${visual.upgraded}/${travelY}/${style}`;");
replace('const frames=travelY?humanFrames(type,travelY):sprites[type].frames;', "const frames=type==='truck'?commercialSprites[style].frames:travelY?humanFrames(type,travelY):sprites[type].frames;");
fs.writeFileSync(file,s.replaceAll('\n','\r\n'));
