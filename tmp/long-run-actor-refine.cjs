const fs=require('node:fs');
const file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-natural-actors.html';
if(fs.existsSync(backup))throw Error('Backup exists');fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8');
s=s.replace('walkFrameRate:4','walkStridePixels:8');
const start=s.indexOf('// Native 16 × 26 people.'),end=s.indexOf('const sprites={',start);
if(start<0||end<0)throw Error('Missing actor section');
const actors=`// Native 18 × 27 people: one extra row of articulation, with the same grounded foot line.
const SPRITE_PLACEMENT={compact:{x:0,y:0},sedan:{x:0,y:0},truck:{x:0,y:0},
  pedestrian:{x:-7,y:-25},shopper:{x:-7,y:-25},resident:{x:-7,y:-25},factoryWorker:{x:-7,y:-25},worker:{x:-7,y:-25}};
const SPRITE_WALK={sequence:[0,1,2,3],idleFrame:4};
const PERSON_HEAD=['       FFFF','      FQQFFF','     FQQQFFFO','     FNSSSSO','     FNSZSOSS','      NSSSN','       NS','      UCNSU'];
// Contact, passing, opposite contact, passing, relaxed standing. The far arm is shaded.
const PERSON_TORSOS=[
 ['     UCCAACU','    UCCCAAACU','    UCUCCCCACU','    SU UCCCCACS','    S  UCCCCUS','       UCCCU','       UCCCU','      UCCCCU','      TPPJPP'],
 ['      UCCAACU','     UCCCAAACU','     UCUCCCCAS','     SUCCCCCS','     S UCCCUS','       UCCCU','       UCCCU','      UCCCCU','      TPPJPP'],
 ['     UCCAACU','     UCCCAAACU','    UCCACCU US','   SCCACCU  S','   SSUCCCCU','     UCCCU','      UCCCU','      UCCCCU','      TPPJPP'],
 ['      UCCAACU','     UCCCAAACU','     UCCACCU','     SUCCCACU','     S UCCCACS','       UCCCU S','       UCCCU','      UCCCCU','      TPPJPP'],
 ['     UCCAACU','    UCCCAAACU','    UCUCCCCACU','    SUCCCCCU S','    S UCCCU  S','      UCCCU S','      UCCCU','      UCCCCU','      TPPJPP']
];
const PERSON_LEGS=[
 ['      TPPJPP','     TTP JPP','     TT  JPP','     TT   JP','    TT    JP','    TT    PP','    TT     PP','    TT     PP','   TOO     PO','   OOO     OOO'],
 ['      TPPJPP','      TT JPP','      TT  JP','      TT  JP','      TT JPP','      TTJPP','      TT PP','      TT OOO','      TO','      OOO'],
 ['      TPPJPP','      TPP JPP','      TPP  JP','     TPP   JP','     TP    JP','    TTP    PP','    TT     PP','    TT     PP','    TO     POO','    OOO    OOO'],
 ['      TPPJPP','      TT JPP','       TTJPP','        TJPP','        TJPP','       TT PP','      TT  PP','      OOO PP','          PO','          OOO'],
 ['      TPPJPP','      TT JPP','      TT JPP','      TT JPP','      TT  PP','     TT   PP','     TT   PP','     TT   PP','     TO   PO','     OOO  OOO']
];
function humanFrames(role){
  const head=role==='worker'?['       YYY','      YHYYY','     YYHYYYY','    YYYYYYYYY','     ONZSOSS','      NSSSN','       NS','      UYNSYU']:
    role==='factoryWorker'?['       OOOO','      CCCCCO','     CAAAACCO','     OCCCOOOO','      NZSOSS','      NSSSN','       NS','      UCNCO']:PERSON_HEAD;
  return PERSON_TORSOS.map((body,i)=>{
    // A small forward weight shift at passing, without bouncing the head vertically.
    const shift=i===1||i===3?1:0;
    const pixels=[...head.map(row=>' '.repeat(shift)+row),...body,...PERSON_LEGS[i]].map(row=>row.padEnd(18).split(''));
    const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels[yy][xx]=c;};
    if(role==='worker'){
      for(let y=8;y<16;y++)for(const x of [7,10])if('CAU'.includes(pixels[y][x]))pixels[y][x]='Y';
      for(const x of [7,8,9,10])if(pixels[11][x]!==' ')pixels[11][x]='H';
      // Tool belt while walking; bent elbows and a held tool in the stationary pose.
      r(7,15,4,1,'F');r(9,16,2,2,'K');
      if(i===4){r(4,11,2,4,' ');r(11,10,3,6,' ');r(5,11,2,2,'C');r(6,13,3,1,'S');r(11,11,2,2,'C');r(10,13,3,1,'S');r(8,14,6,1,'F');r(13,12,2,3,'K');}
    }
    if(role==='factoryWorker'){
      for(let y=9;y<16;y++)for(let x=7;x<=10;x++)if('CAU'.includes(pixels[y][x]))pixels[y][x]='P';
      r(8,10,1,3,'J');r(10,10,1,3,'J');
      // Carrying a small part at rest, with forearms held in front of the overalls.
      if(i===4){r(4,11,2,4,' ');r(11,11,3,5,' ');r(5,11,2,2,'P');r(6,13,2,2,'S');r(11,11,2,2,'P');r(11,13,2,2,'S');r(8,12,4,4,'K');r(9,13,2,2,'H');}
    }
    if(role==='shopper'){
      // The laden arm hangs steadily; only the free arm swings.
      r(12,12,4,5,' ');r(11,12,2,2,'C');r(12,14,1,2,'S');r(12,16,3,1,'F');
      r(12,17,1,5,'F');r(13,17,3,5,'D');r(13,17,1,4,'L');r(12,22,4,1,'F');r(14,17,1,1,'V');r(15,17,1,1,'R');
      pixels[4][5]='F';pixels[5][5]='F';pixels[6][5]='F';
    }
    if(role==='resident'){
      for(let y=8;y<16;y++)if(pixels[y][8]!==' ')pixels[y][8]='U';
      pixels[11][9]='K';pixels[14][9]='K';pixels[1][7]='K';
    }
    return pixels.map(row=>row.join(''));
  });
}
// Shorter native silhouettes give the cabin and body more vertical presence inside each 20px lane.
function vehicleFrames(type){
  const width=type==='compact'?35:type==='sedan'?41:46,height=20;
  const grid=Array.from({length:height},()=>Array(width).fill(' '));
  const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=c;};
  if(type==='truck'){
    // Tall cargo box, a separate upright cab and a short stepped hood.
    r(1,0,27,16,'O');r(2,1,25,13,'E');r(3,2,23,1,'H');r(3,3,1,10,'K');r(5,5,20,5,'L');r(5,12,20,1,'K');r(24,3,1,10,'K');
    r(29,3,10,1,'O');r(28,4,12,3,'O');r(28,7,14,4,'O');r(28,11,17,6,'O');
    r(29,4,9,1,'L');r(29,5,10,7,'B');r(30,5,7,6,'W');r(31,5,5,1,'H');r(30,10,7,1,'G');r(38,7,2,5,'O');
    r(29,12,14,4,'B');r(30,12,3,1,'K');r(41,11,3,1,'L');r(43,12,2,2,'H');r(1,15,43,2,'M');r(1,13,2,2,'R');r(43,15,3,2,'K');
  }else{
    const sedan=type==='sedan';
    // Hatchback has a tall rear; sedan has a lower roof and a distinct trunk.
    const roof=sedan?11:8,roofWidth=sedan?17:15;
    r(roof,sedan?1:0,roofWidth,1,'O');r(roof-1,sedan?2:1,roofWidth+2,2,'O');r(roof,sedan?2:1,roofWidth,1,'L');
    for(let y=3;y<=9;y++){const back=sedan?Math.floor((y-2)/3):0,front=Math.floor((y-2)/2);r(roof-1-back,y,roofWidth+2+back+front,1,'O');r(roof-back,y,roofWidth+back+front,1,'B');}
    r(roof+1,3,6,6,'W');r(roof+8,3,6,6,'W');r(roof+1,3,5,1,'H');r(roof+8,3,5,1,'H');r(roof+1,8,6,1,'G');r(roof+8,8,6,1,'G');r(roof+7,3,1,6,'O');
    r(4,9,width-8,1,'O');r(2,10,width-4,1,'O');r(1,11,width-2,6,'O');r(2,11,width-4,5,'B');
    r(3,10,width-7,1,'L');r(2,11,width-4,1,'L');r(2,15,width-4,2,'M');r(0,14,2,2,'K');r(width-2,14,2,2,'K');
    r(2,12,2,2,'R');r(width-4,11,2,2,'H');r(roof+7,10,1,5,'M');r(roof+9,11,2,1,'K');
    if(sedan){r(roof-3,10,1,5,'M');r(roof-1,11,2,1,'K');}
    r(width-7,14,4,1,'O');r(3,17,width-6,1,'O');
  }
  const wheels=type==='compact'?[8,27]:type==='sedan'?[9,32]:[9,36];
  return [0,1].map(phase=>{
    const copy=grid.map(row=>[...row]);
    const wheel=[' TTTTT ','TTKKKTT',phase?'TKKTKKT':'TKTKTKT','TTKKKTT',' TTTTT ','  TTT  '];
    for(const cx of wheels)wheel.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')copy[14+y][cx-3+x]=c;}));
    return copy.map(row=>row.join(''));
  });
}
`;
s=s.slice(0,start)+actors+s.slice(end);
const old="locate(object);const phase=Math.floor(time*(isVehicle(object)?PIXEL_POLISH.wheelFrameRate:PIXEL_POLISH.walkFrameRate)+object.index);object.frame=isVehicle(object)?phase%2:SPRITE_WALK.sequence[phase%SPRITE_WALK.sequence.length];";
const next="locate(object);const phase=Math.floor(isVehicle(object)?time*PIXEL_POLISH.wheelFrameRate+object.index:object.distance/PIXEL_POLISH.walkStridePixels*SPRITE_WALK.sequence.length+object.index);object.frame=isVehicle(object)?phase%2:SPRITE_WALK.sequence[phase%SPRITE_WALK.sequence.length];";
if(!s.includes(old))throw Error('Missing walk clock');s=s.replace(old,next);fs.writeFileSync(file,s);
