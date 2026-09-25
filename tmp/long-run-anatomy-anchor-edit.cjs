const fs=require('node:fs'),file='audit_tools/econ_rpg/game/games/the-long-run/index.html',backup='tmp/the-long-run-pre-anatomy-anchor.html';
if(fs.existsSync(backup))throw Error('Backup exists');fs.copyFileSync(file,backup);
let s=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,b);}
replace('const SPRITE_PLACEMENT={compact:{x:0,y:-2},sedan:{x:0,y:-2},truck:{x:0,y:-4},','const SPRITE_PLACEMENT={compact:{x:0,y:0},sedan:{x:0,y:0},truck:{x:0,y:0},');
replace('// Eight authored poses:',`// Tires share a road-contact baseline; roofs project above it without road-band clipping.
const VEHICLE_ROAD_BASELINES={upperRoad:212,lowerRoad:233};
const VEHICLE_WHEEL_CONTACT={compact:21,sedan:21,truck:23};
function vehicleDrawY(type,path){return VEHICLE_ROAD_BASELINES[path]-VEHICLE_WHEEL_CONTACT[type];}
// Eight authored poses:`);
const h=s.indexOf('const PERSON_HEAD=['),end=s.indexOf('const WALK_ARMS=',h);
s=s.slice(0,h)+`const PERSON_HEAD=[
 '         FFFFF','        FFFFFFF','        FFFFFFF','        FNSSSS',
 '        FNSSSOS','         NSSSS','          SSS'
];
`+s.slice(end);
replace("    '         YYYYY','        YHYYYYY','       YYHYYYYYY','       YYYYYYYYYY','       ONNZSSOSSS',\n    '        NSSZSSO','         NSSSS','         UNNS','        UYNSYU'", "    '         YYYYY','        YHYYYYY','       YYHYYYYYY','       YYYYYYYYYY',\n    '         NSSSOS','         NSSSS','          SSS'");
replace("    '         OOOOO','        CCCCCCO','       CCAAAACCO','       OCCCCCOOOO','        NNZSSOSSS',\n    '        NSSZSSO','         NSSSS','         UNNS','        UCNCCU'", "    '         OOOOO','        CCCCCCO','        CCAACCO','        OCCCCOOO',\n    '         NSSSOS','         NSSSS','          SSS'");
replace("    r(8,9+down,7,1,'U');r(7,10+down,9,2,'U');r(8,10+down,7,2,'C');", `    // A continuous neck and fixed shoulder line support the head even on down poses.
    r(10,7,3,3,'S');r(10,7,1,2,'N');
    r(8,9,8,1,'U');r(9,9,6,1,'C');r(10,9,3,1,'S');
    r(7,10,9,2,'U');r(8,10,7,2,'C');r(8,12,7,1,'C');`);
replace("r(9,19,5,2,'P');r(9,19,5,1,'T');", "r(8,19,8,3,'P');r(8,19,8,1,'T');r(8,20,2,2,'T');");
replace("      line(hip,20,knee,kneeY,tone);line(knee,kneeY,foot.x,foot.y-1,tone);\n      pixels[kneeY][knee]=edge;pixels[foot.y-1][foot.x]=edge;r(foot.x,foot.y,3,1,'O');", `      // Broad thighs taper into bent knees and calves instead of single-width sticks.
      line(hip,20,knee,kneeY,tone,3);r(hip,21,4,2,tone);
      line(knee,kneeY,foot.x,foot.y-2,tone,3);r(foot.x,foot.y-1,3,1,tone);
      r(knee,kneeY,2,1,edge);pixels[foot.y-1][foot.x]=edge;r(foot.x,foot.y,4,1,'O');`);
replace("ctx.save();const drawY=['compact','sedan','truck'].includes(type)?clamp(Math.round(y)+offset.y,196,238-image.height):Math.round(y)+offset.y;ctx.translate(Math.round(x)+offset.x,drawY);", "ctx.save();ctx.translate(Math.round(x)+offset.x,Math.round(y)+offset.y);");
const d=s.indexOf('    const vehicles=objects.filter('),de=s.indexOf('    // Small produce and pump accents',d);
if(d<0||de<0)throw Error('Missing actor draw block');
s=s.slice(0,d)+`    // Sort actors by ground contact: sidewalk people behind top-lane traffic,
    // top-lane traffic behind lower-lane traffic, and foreground people in front.
    const groundY=object=>isVehicle(object)?VEHICLE_ROAD_BASELINES[object.path]:object.y+1;
    for(const object of objects.filter(o=>o.active).sort((a,b)=>groundY(a)-groundY(b))){
      if(isVehicle(object))blit(object.spriteType,object.x,vehicleDrawY(object.spriteType,object.path),object.frame,object.direction,object.index);
      else blit(object.spriteType,object.x,object.y,object.idle?SPRITE_WALK.idleFrame:object.frame,object.direction,object.index,object.travelY||0);
    }
`+s.slice(de);
fs.writeFileSync(file,s.replaceAll('\n','\r\n'));
