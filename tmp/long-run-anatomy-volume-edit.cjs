const fs=require('node:fs'),file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-anatomy-volume.html';
if(fs.existsSync(backup))throw Error('Backup exists');fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,b);}
replace('const VEHICLE_WHEEL_CONTACT={compact:21,sedan:21,truck:23};','const VEHICLE_WHEEL_CONTACT={compact:27,sedan:27,truck:30};');
replace(" '        FNSSSOS','         NSSSS','          SSS'", " '        FSSSSSS','         SSSSS','          SSS'");
replace("'        FNSSSS'", "'        FSSSSS'");
s=s.replaceAll("'         NSSSOS','         NSSSS','          SSS'", "'         SSSSSS','         SSSSS','          SSS'");
replace("    r(10,7,3,2,'S');r(10,7,1,1,'N');\n    r(8,8,8,1,'U');r(9,8,6,1,'C');r(10,8,3,1,'S');\n    r(7,9,9,3,'U');r(8,9,7,3,'C');r(8,12,7,1,'C');",`    r(10,7,3,1,'S');
    r(9,8,6,1,'U');r(10,8,3,1,'C');
    // Sloped shoulders meet a short collar, with the chest directly below the head.
    r(8,9,7,1,'U');r(9,9,5,1,'C');r(7,10,9,2,'U');r(8,10,7,2,'C');r(8,12,7,1,'C');`);
replace("r(9,12+down,2,4,'A');", "r(9,12+down,1,3,'A');r(10,11,3,1,'A');");
replace("r(8,19,8,3,'P');r(8,19,8,1,'T');r(8,20,2,2,'T');", "r(9,18+down,6,1,'C');r(8,19,8,3,'P');r(9,19,6,1,'T');r(8,20,2,2,'T');r(14,20,2,2,'J');");
replace("line(hip,20,knee,kneeY,tone,3);r(hip,21,4,2,tone);", "line(hip,20,knee,kneeY,tone,3);r(hip,21,4,3,tone);");
replace("line(knee,kneeY,foot.x,foot.y-2,tone,3);r(foot.x,foot.y-1,3,1,tone);\n      r(knee,kneeY,2,1,edge);", "line(knee,kneeY,foot.x,foot.y-3,tone,3);r(foot.x,foot.y-2,2,2,tone);\n      r(knee,kneeY,1,1,edge);");
const start=s.indexOf('// New native bodywork;'),end=s.indexOf('const sprites={',start);
if(start<0||end<0)throw Error('Vehicle section missing');
s=s.slice(0,start)+`// Taller native cabins and deeper bodies; length grows only two pixels per vehicle.
function vehicleFrames(type){
  const width=type==='compact'?46:type==='sedan'?52:58,height=type==='truck'?31:28;
  const grid=Array.from({length:height},()=>Array(width).fill(' '));
  const r=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=c;};
  if(type==='truck'){
    // Upright delivery cab: headroom and a tall door, beside the enclosed cargo body.
    r(1,0,33,24,'O');r(2,1,31,21,'E');r(3,2,29,1,'H');r(3,3,1,18,'K');r(5,6,26,10,'L');r(6,7,24,1,'H');r(5,19,26,1,'K');r(30,3,1,17,'M');r(29,14,1,2,'O');
    r(36,3,11,1,'O');r(35,4,14,2,'O');r(35,6,16,11,'O');r(35,17,21,7,'O');
    r(36,4,11,1,'L');r(36,5,12,13,'B');r(37,5,9,11,'W');r(38,5,7,1,'H');r(38,6,1,5,'H');r(39,8,1,3,'H');r(37,15,9,1,'G');r(47,9,2,9,'O');r(47,12,4,1,'K');
    r(36,18,18,6,'B');r(36,18,3,1,'K');r(36,21,9,1,'L');r(48,18,1,6,'M');r(51,16,3,1,'L');r(54,18,2,3,'H');r(51,21,3,2,'O');
    r(1,23,55,3,'M');r(2,23,30,1,'K');r(1,21,2,2,'R');r(55,23,3,2,'K');r(3,26,51,1,'O');
  }else{
    const sedan=type==='sedan',roof=sedan?13:10,roofWidth=sedan?21:20;
    r(roof,0,roofWidth,1,'O');r(roof-1,1,roofWidth+2,2,'O');r(roof,1,roofWidth,1,'L');
    for(let y=3;y<=14;y++){const back=sedan?Math.floor((y-2)/5):Math.floor((y-2)/9),front=Math.floor((y-2)/5);r(roof-1-back,y,roofWidth+2+back+front,1,'O');r(roof-back,y,roofWidth+back+front,1,'B');}
    // Tall glass above the beltline leaves room for a seated person, not just a reflection strip.
    r(roof+1,3,8,11,'W');r(roof+11,3,8,11,'W');r(roof+1,3,7,1,'H');r(roof+11,3,7,1,'H');r(roof+2,4,1,5,'H');r(roof+3,7,1,3,'H');r(roof+12,4,1,5,'H');
    r(roof+1,13,8,1,'G');r(roof+11,13,8,1,'G');r(roof+9,3,2,11,'O');r(roof+19,11,3,1,'K');r(roof,14,roofWidth,1,'M');
    r(4,14,width-9,1,'O');r(2,15,width-5,1,'O');r(1,16,width-2,8,'O');r(2,16,width-4,7,'B');r(3,15,width-7,1,'L');r(2,16,width-4,1,'L');
    r(2,23,width-4,2,'M');r(3,25,width-6,1,'O');r(0,21,2,3,'K');r(width-2,21,2,3,'K');r(2,18,2,3,'R');r(width-4,17,2,3,'H');
    r(roof+9,15,1,8,'M');r(roof+11,17,3,1,'K');r(roof+1,18,6,1,'L');r(roof+12,20,5,1,'L');r(roof+1,22,7,1,'M');r(width-8,22,5,1,'O');
    if(sedan){r(roof-4,15,1,8,'M');r(roof-2,17,2,1,'K');r(4,16,5,1,'L');}
  }
  const wheels=type==='compact'?[10,36]:type==='sedan'?[11,41]:[11,47],wheelTop=height-8;
  for(const cx of wheels){r(cx-3,wheelTop-1,7,1,'M');r(cx-4,wheelTop,1,3,'O');r(cx+4,wheelTop,1,3,'O');}
  return [0,1].map(phase=>{
    const copy=grid.map(row=>[...row]);
    const wheel=['  TTTTT  ',' TTKKKTT ','TTKKHKKTT',phase?'TKKTOKKKT':'TKKKOTKKT','TTKKKKKTT','TTKKTKKTT',' TTKKKTT ','  TTTTT  '];
    for(const cx of wheels)wheel.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==' ')copy[wheelTop+y][cx-4+x]=c;}));
    return copy.map(row=>row.join(''));
  });
}
`+s.slice(end);
fs.writeFileSync(file,s.replaceAll('\n','\r\n'));
