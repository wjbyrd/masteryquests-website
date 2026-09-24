const fs=require('node:fs');
const file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-footfall.html';
if(fs.existsSync(backup)){if(!fs.readFileSync(file).equals(fs.readFileSync(backup)))throw Error('Backup differs');}else fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,b);}
replace('walkSpeed:3.3','walkSpeed:4');
replace('const SPRITE_WALK={sequence:[0,1,2,3],idleFrame:4};',`// Four main poses, with a one-pixel stance correction between poses.
// Each eight-pixel stride covers two footfalls; idle remains frame 4.
const SPRITE_WALK={sequence:[0,1,2,3],pixelFrames:[0,5,1,6,2,7,3,8],phases:[0,2,4,6,null,1,3,5,7],idleFrame:4};
function walkingFeet(phase,travelY=0){
  const step=phase%4,leftPlanted=phase<4,lift=[0,3,2,1][step];
  const planted=travelY?{x:leftPlanted?8:11,y:travelY>0?26-step:23+step}:{x:12-step,y:26};
  const swinging=travelY?{x:leftPlanted?11:8,y:(travelY>0?23+step:26-step)-lift}:{x:8+step,y:26-lift};
  return {left:leftPlanted?planted:swinging,right:leftPlanted?swinging:planted,planted,leftPlanted};
}`);
replace('function humanFrames(role){','function humanFrames(role,travelY=0){');
replace('return PERSON_TORSOS.map((body,i)=>{',`return SPRITE_WALK.phases.map(phase=>{
    const i=phase===null?4:Math.floor(phase/2),body=PERSON_TORSOS[i];`);
replace("    if(role==='worker'){",`    // Neck/ear highlights and a sleeve seam retain the current compact silhouette.
    pixels[5][7+shift]='Z';pixels[6][8+shift]='N';pixels[9][7]='A';pixels[14][9]='U';
    if(phase!==null){
      for(let y=17;y<27;y++)pixels[y].fill(' ');
      const feet=walkingFeet(phase,travelY);
      const line=(x0,y0,x1,y1,color)=>{const count=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let n=0;n<=count;n++){const x=Math.round(x0+(x1-x0)*n/count),y=Math.round(y0+(y1-y0)*n/count);r(x,y,2,1,color);}};
      for(const [side,hip,tone,edge] of [['left',7,'T','P'],['right',10,'P','J']]){
        const foot=feet[side],planted=side==='left'?feet.leftPlanted:!feet.leftPlanted;
        const knee=Math.round((hip+foot.x)/2)+(planted?0:2),kneeY=planted?21:20;
        line(hip,17,knee,kneeY,tone);line(knee,kneeY,foot.x,foot.y-1,tone);
        pixels[kneeY][knee]=edge;pixels[foot.y-1][foot.x]=edge;
        r(foot.x,foot.y,3,1,'O');pixels[foot.y-1][foot.x+1]='T';
      }
    }
    if(role==='worker'){`);
// Vehicle detail stays entirely inside the existing silhouettes and dimensions.
replace("  const wheels=type==='compact'?[8,27]:type==='sedan'?[9,32]:[9,36];",`  if(type==='truck'){
    r(3,2,1,11,'H');r(6,3,16,1,'K');r(25,5,1,7,'M');r(24,9,1,2,'O');
    r(31,6,1,3,'H');r(32,7,1,2,'H');r(36,6,1,4,'G');r(38,9,3,1,'K');
    r(29,13,9,1,'L');r(39,12,1,4,'M');r(41,14,2,1,'O');r(3,14,21,1,'K');
  }else{
    const roof=type==='sedan'?11:8;
    // Glazing edges, small reflections, roof trim and a darker lower door contour.
    r(roof,2,1,7,'M');r(roof+2,4,1,3,'H');r(roof+3,5,1,2,'H');
    r(roof+9,4,1,2,'H');r(roof+13,4,1,4,'G');r(roof+15,8,2,1,'K');
    r(roof+1,9,13,1,'M');r(roof+1,12,5,1,'L');r(roof+9,12,5,1,'L');
    r(roof+1,14,5,1,'M');r(width-5,13,2,1,'K');r(3,13,1,1,'L');
  }
  const wheels=type==='compact'?[8,27]:type==='sedan'?[9,32]:[9,36];
  // Wheel arches separate the body from tires without changing lane height.
  for(const cx of wheels){r(cx-2,13,5,1,'M');r(cx-3,14,1,2,'O');r(cx+3,14,1,2,'O');}`);
replace("const wheel=[' TTTTT ','TTKKKTT',phase?'TKKTKKT':'TKTKTKT','TTKKKTT',' TTTTT ','  TTT  '];", "const wheel=[' TTTTT ','TTKKKTT',phase?'TKHTKKT':'TKKTHKT','TTKOKTT',' TTTTT ','  TTT  '];");
replace('function spriteImage(type,frame,variant=0){','function spriteImage(type,frame,variant=0,travelY=0){');
replace('`${type}/${frame}/${variant}/${visual.upgraded}`','`${type}/${frame}/${variant}/${visual.upgraded}/${travelY}`');
replace('const matrix=sprites[type].frames[frame%sprites[type].frames.length];','const frames=travelY?humanFrames(type,travelY):sprites[type].frames;\n    const matrix=frames[frame%frames.length];');
replace('function blit(type,x,y,frame=0,direction=1,variant=0){','function blit(type,x,y,frame=0,direction=1,variant=0,travelY=0){');
replace('const image=spriteImage(type,frame,variant),offset=', 'const image=spriteImage(type,frame,variant,travelY),offset=');
replace('if(dx)object.direction=dx<0?-1:1;return;', 'object.travelY=dx===0?Math.sign(dy):0;if(dx)object.direction=dx<0?-1:1;return;');
replace("locate(object);const phase=Math.floor(isVehicle(object)?time*PIXEL_POLISH.wheelFrameRate+object.index:object.distance/PIXEL_POLISH.walkStridePixels*SPRITE_WALK.sequence.length+object.index);object.frame=isVehicle(object)?phase%2:SPRITE_WALK.sequence[phase%SPRITE_WALK.sequence.length];", `locate(object);
      // Match the rendered integer position, not a free-running clock. During stance,
      // each pixel of body travel is canceled by one pixel of foot travel in the sprite.
      const phase=isVehicle(object)?Math.floor(time*PIXEL_POLISH.wheelFrameRate+object.index):Math.round(object.distance)+object.index*2;
      object.frame=isVehicle(object)?phase%2:SPRITE_WALK.pixelFrames[phase%PIXEL_POLISH.walkStridePixels];`);
replace('object.idle?SPRITE_WALK.idleFrame:object.frame,object.direction,object.index);','object.idle?SPRITE_WALK.idleFrame:object.frame,object.direction,object.index,object.travelY||0);');
// Initialize the pose at the same stride position used on subsequent motion frames.
replace('locate(object);objects.push(object);\n  }\n  function fixedPerson', 'locate(object);object.frame=SPRITE_WALK.pixelFrames[(Math.round(object.distance)+object.index*2)%PIXEL_POLISH.walkStridePixels];objects.push(object);\n  }\n  function fixedPerson');
// Preserve CRLF if this checkout uses it; replacement blocks above may contain LF.
fs.writeFileSync(file,s.replace(/\r?\n/g,'\r\n'));
