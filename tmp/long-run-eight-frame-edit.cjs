const fs=require('node:fs'),file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-eight-frame.html';
if(fs.existsSync(backup))throw Error('Backup exists');fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
s=s.replace('walkStridePixels:8','walkCyclePixels:16').replace('vehicleGap:68','vehicleGap:84').replace('fps:20,vehicleSpeed:23,walkSpeed:4','fps:30,vehicleSpeed:23,walkSpeed:15');
const start=s.indexOf('// Native 18 × 27 people'),end=s.indexOf('const sprites={',start);
const actors=`// Redrawn native 22 × 32 people; bottom-row soles retain the previous path + 1 ground line.
const SPRITE_PLACEMENT={compact:{x:0,y:-2},sedan:{x:0,y:-2},truck:{x:0,y:-4},
  pedestrian:{x:-10,y:-30},shopper:{x:-10,y:-30},resident:{x:-10,y:-30},factoryWorker:{x:-10,y:-30},worker:{x:-10,y:-30}};
// Eight authored poses: contact, down, passing, up; then the opposite leg.
// Odd-pixel corrections between poses keep the supporting foot fixed to the ground.
const SPRITE_WALK={sequence:[0,1,2,3,4,5,6,7],pixelFrames:[0,9,1,10,2,11,3,12,4,13,5,14,6,15,7,16],phases:[0,2,4,6,8,10,12,14,null,1,3,5,7,9,11,13,15],idleFrame:8};
function walkingPhase(object){
  const progress=object.travelY?Math.round(object.y)*object.travelY:Math.round(object.x)*object.direction;
  return ((progress+object.index*4)%PIXEL_POLISH.walkCyclePixels+PIXEL_POLISH.walkCyclePixels)%PIXEL_POLISH.walkCyclePixels;
}
function walkingFeet(phase,travelY=0){
  const step=phase%8,leftPlanted=phase<8,lift=[0,2,3,4,4,3,2,1][step];
  const planted=travelY?{x:leftPlanted?8:13,y:travelY>0?31-step:24+step}:{x:14-step,y:31};
  const swinging=travelY?{x:leftPlanted?13:8,y:(travelY>0?24+step:31-step)-lift}:{x:6+step,y:31-lift};
  return {left:leftPlanted?planted:swinging,right:leftPlanted?swinging:planted,planted,leftPlanted};
}
const PERSON_HEAD=[
 '         FFFFF','        FQQFFFF','       FFQQQFFFO','       FQNSSSSOO','       FNSZSSOSSS',
 '        NSSZSSO','         NSSSS','         UNNS','        UCNSCU'
];
const WALK_ARMS=[
 {far:[7,14,6,18],near:[16,14,18,17]},
 {far:[7,15,7,19],near:[16,15,17,18]},
 {far:[8,15,9,18],near:[15,16,14,19]},
 {far:[9,14,12,17],near:[13,16,12,20]},
 {far:[12,14,15,17],near:[12,15,9,18]},
 {far:[11,15,13,18],near:[12,16,10,19]},
 {far:[9,16,10,19],near:[14,16,14,20]},
 {far:[8,15,7,18],near:[15,15,17,18]}
];
function humanFrames(role,travelY=0){
  const head=role==='worker'?[
    '         YYYYY','        YHYYYYY','       YYHYYYYYY','       YYYYYYYYYY','       ONNZSSOSSS',
    '        NSSZSSO','         NSSSS','         UNNS','        UYNSYU'
  ]:role==='factoryWorker'?[
    '         OOOOO','        CCCCCCO','       CCAAAACCO','       OCCCCCOOOO','        NNZSSOSSS',
    '        NSSZSSO','         NSSSS','         UNNS','        UCNCCU'
  ]:PERSON_HEAD;
  return SPRITE_WALK.phases.map(phase=>{
    const idle=phase===null,pose=idle?0:Math.floor(phase/2),down=!idle&&(pose===1||pose===5)?1:0;
    const pixels=Array.from({length:32},()=>Array(22).fill(' '));
    const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels[yy][xx]=c;};
    const line=(x0,y0,x1,y1,c,w=2)=>{const count=Math.max(1,Math.abs(x1-x0),Math.abs(y1-y0));for(let n=0;n<=count;n++)r(Math.round(x0+(x1-x0)*n/count),Math.round(y0+(y1-y0)*n/count),w,1,c);};
    head.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')pixels[y][x]=c;}));
    // Far arm is a distinct dark sleeve behind a shaped shoulder and shirt front.
    const arms=idle?{far:[7,16,8,20],near:[15,16,15,20]}:WALK_ARMS[pose];
    line(8,11+down,...arms.far.slice(0,2),'U');line(...arms.far,'N');
    r(8,9+down,7,1,'U');r(7,10+down,9,2,'U');r(8,10+down,7,2,'C');
    r(8,12+down,7,6,'C');r(8,12+down,1,6,'U');r(9,12+down,2,4,'A');r(14,12+down,1,6,'U');
    r(9,17+down,6,2,'U');r(9,17+down,4,1,'C');r(9,19,5,2,'P');r(9,19,5,1,'T');
    // The head does not sway. One pixel of knee compression supplies weight acceptance.
    line(14,11+down,...arms.near.slice(0,2),'C');line(...arms.near,'S');
    r(arms.near[0],arms.near[1],2,1,'U');r(arms.near[2],arms.near[3],2,1,'Z');
    const feet=idle?{left:{x:8,y:31},right:{x:13,y:31},leftPlanted:true}:walkingFeet(phase,travelY);
    for(const [side,hip,tone,edge] of [['left',9,'T','P'],['right',12,'P','J']]){
      const foot=feet[side],planted=idle||(side==='left'?feet.leftPlanted:!feet.leftPlanted);
      const knee=Math.round((hip+foot.x)/2)+(planted?0:2),kneeY=Math.min(planted?25+down:24,foot.y-2);
      line(hip,20,knee,kneeY,tone);line(knee,kneeY,foot.x,foot.y-1,tone);
      pixels[kneeY][knee]=edge;pixels[foot.y-1][foot.x]=edge;r(foot.x,foot.y,3,1,'O');
      // Toe remains planted while the rear heel rises during push-off.
      if(!idle&&planted&&phase%8>=6){pixels[foot.y][foot.x]=' ';pixels[foot.y-1][foot.x]='O';}
      pixels[foot.y-1][foot.x+1]='T';
    }
    if(role==='worker'){
      r(9,11+down,1,6,'Y');r(13,11+down,1,6,'Y');r(9,14+down,5,1,'H');r(9,18,5,1,'F');r(11,19,2,2,'K');
      if(idle){r(6,14,3,7,' ');r(15,14,3,7,' ');line(8,12,7,16,'C');line(7,16,10,17,'S');line(14,12,16,16,'C');line(16,16,13,17,'S');r(10,18,8,1,'F');r(17,16,2,3,'K');}
    }else if(role==='factoryWorker'){
      r(10,12+down,3,5,'P');r(9,11+down,1,6,'J');r(13,11+down,1,6,'J');r(10,14+down,3,2,'K');r(11,14+down,1,1,'H');
      if(idle){r(6,15,3,6,' ');r(15,14,3,7,' ');line(8,12,7,16,'C');line(7,16,10,18,'S');line(14,12,16,16,'C');line(16,16,14,18,'S');r(10,17,5,4,'K');r(11,18,3,2,'H');}
    }else if(role==='shopper'){
      // Loaded arm hangs close to the body; the free arm retains the gait counter-swing.
      r(15,12,5,9,' ');line(14,12,16,16,'C');line(16,16,16,20,'S');r(16,20,3,1,'F');r(16,21,1,2,'F');r(19,21,1,2,'F');
      r(16,23,5,5,'D');r(16,23,1,5,'F');r(17,23,1,4,'L');r(16,28,5,1,'F');r(18,22,1,2,'V');r(20,23,1,1,'R');
      pixels[5][7]='F';pixels[6][8]='F';
    }else if(role==='resident'){
      r(11,11+down,1,6,'U');r(12,13+down,2,2,'K');pixels[2][9]='K';
      if(idle){r(15,15,2,6,' ');line(14,12,16,16,'C');line(16,16,13,18,'S');}
    }
    return pixels.map(row=>row.join(''));
  });
}
// New native bodywork; separate glass, beltline, doors, fenders and seven-row tires.
function vehicleFrames(type){
  const width=type==='compact'?44:type==='sedan'?50:56,height=type==='truck'?24:22;
  const grid=Array.from({length:height},()=>Array(width).fill(' '));
  const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=c;};
  if(type==='truck'){
    r(1,0,32,18,'O');r(2,1,30,15,'E');r(3,2,28,1,'H');r(3,3,1,12,'K');r(5,5,25,7,'L');r(6,6,23,1,'H');r(5,14,25,1,'K');r(29,3,1,11,'M');r(28,10,1,2,'O');
    r(35,3,11,1,'O');r(34,4,14,2,'O');r(34,6,16,7,'O');r(34,13,20,5,'O');
    r(35,4,11,1,'L');r(35,5,12,8,'B');r(36,5,9,7,'W');r(37,5,7,1,'H');r(37,6,1,4,'H');r(38,8,1,2,'H');r(36,11,9,1,'G');r(46,8,2,5,'O');r(46,9,4,1,'K');
    r(35,13,17,5,'B');r(35,13,3,1,'K');r(35,15,9,1,'L');r(47,13,1,5,'M');r(50,12,3,1,'L');r(52,13,2,3,'H');r(50,16,3,1,'O');
    r(1,17,53,3,'M');r(2,17,29,1,'K');r(1,15,2,2,'R');r(53,17,3,2,'K');r(3,20,49,1,'O');
  }else{
    const sedan=type==='sedan',roof=sedan?13:10,roofWidth=sedan?20:19;
    r(roof,0,roofWidth,1,'O');r(roof-1,1,roofWidth+2,2,'O');r(roof,1,roofWidth,1,'L');
    for(let y=3;y<=10;y++){const back=sedan?Math.floor((y-2)/3):Math.floor((y-2)/5),front=Math.floor((y-2)/3);r(roof-1-back,y,roofWidth+2+back+front,1,'O');r(roof-back,y,roofWidth+back+front,1,'B');}
    r(roof+1,3,7,7,'W');r(roof+10,3,8,7,'W');r(roof+1,3,6,1,'H');r(roof+10,3,7,1,'H');r(roof+2,4,1,3,'H');r(roof+3,6,1,2,'H');r(roof+11,4,1,3,'H');
    r(roof+1,9,7,1,'G');r(roof+10,9,8,1,'G');r(roof+8,3,2,7,'O');r(roof+18,8,3,1,'K');r(roof,10,roofWidth,1,'M');
    r(4,10,width-9,1,'O');r(2,11,width-5,1,'O');r(1,12,width-2,6,'O');r(2,12,width-4,5,'B');r(3,11,width-7,1,'L');r(2,12,width-4,1,'L');
    r(2,17,width-4,2,'M');r(3,19,width-6,1,'O');r(0,15,2,3,'K');r(width-2,15,2,3,'K');r(2,13,2,2,'R');r(width-4,12,2,2,'H');
    r(roof+8,11,1,6,'M');r(roof+10,12,3,1,'K');r(roof+1,13,5,1,'L');r(roof+11,14,5,1,'L');r(roof+1,16,6,1,'M');r(width-8,16,5,1,'O');
    if(sedan){r(roof-4,11,1,6,'M');r(roof-2,12,2,1,'K');r(4,12,5,1,'L');}
  }
  const wheels=type==='compact'?[10,34]:type==='sedan'?[11,39]:[11,45],wheelTop=height-7;
  for(const cx of wheels){r(cx-3,wheelTop-1,7,1,'M');r(cx-4,wheelTop,1,3,'O');r(cx+4,wheelTop,1,3,'O');}
  return [0,1].map(phase=>{
    const copy=grid.map(row=>[...row]);
    const wheel=['  TTTTT  ',' TTKKKTT ','TTKKHKKTT',phase?'TKKTOKKKT':'TKKKOTKKT','TTKKK KTT',' TTKKKTT ','  TTTTT  '];
    for(const cx of wheels)wheel.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')copy[wheelTop+y][cx-4+x]=c;}));
    return copy.map(row=>row.join(''));
  });
}
`;
s=s.slice(0,start)+actors+s.slice(end);
// Keep vehicle pixels within the road: taller roofs project inward, never over the sidewalks.
s=s.replace('ctx.save();ctx.translate(Math.round(x)+offset.x,Math.round(y)+offset.y);',`ctx.save();const drawY=['compact','sedan','truck'].includes(type)?clamp(Math.round(y)+offset.y,196,238-image.height):Math.round(y)+offset.y;ctx.translate(Math.round(x)+offset.x,drawY);`);
fs.writeFileSync(file,s.replaceAll('\n','\r\n'));
