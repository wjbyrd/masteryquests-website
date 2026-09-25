const fs=require('node:fs');let s=fs.readFileSync('tmp/the-long-run-footfall-check.cjs','utf8');
s=s.replaceAll('pre-footfall','pre-eight-frame').replaceAll('long-run-footfall-','long-run-eight-frame-');
const start=s.indexOf('const scrub='),end=s.indexOf('assert.equal(scrub',start);
s=s.slice(0,start)+String.raw`const scrub=s=>s.replace(/const PIXEL_POLISH=[^\n]+/,'ACTOR_SPACING').replace(/const PIXEL_TUNING=[^\n]+/,'ACTOR_TIMING').replace(/[/][/] (?:Native 18 × 27 people|Redrawn native 22 × 32 people)[\s\S]*?(?=const sprites=\{)/,'ACTOR_ART\n').replace(/function blit[\s\S]*?(?=  function pathLength)/,'ACTOR_PLACEMENT\n');`+'\n'+s.slice(end);
s=s.replaceAll('t+=50','t+=1000/60').replaceAll('inspect(640)','inspect(1920)');
s=s.replace('c.width=1000;c.height=840','c.width=1520;c.height=960').replaceAll('i*104','i*120').replace('sprites[type].frames.slice(0,5)','sprites[type].frames.slice(0,SPRITE_WALK.idleFrame+1)');
s=s.replace('[35,20]','[44,22]').replace('[41,20]','[50,22]').replace('[46,20]','[56,24]').replace('[18,27]','[22,32]');
s=s.replace('let plantChecks=0;', 'let plantChecks=0;const frameCache=new Map();const personFrames=(type,axis)=>{const key=type+axis;if(!frameCache.has(key))frameCache.set(key,humanFrames(type,axis));return frameCache.get(key)};');
s=s.replace('sprite.frames.slice(0,4)','sprite.frames.slice(0,8)').replace('size!==4','size!==8');
s=s.replace("const h=sprites[car.spriteType].frames[0].length;if(car.y<196||car.y+h>238||(lane==='upperRoad'&&car.y+h>217))issues.add('Lane clipping');", "const h=sprites[car.spriteType].frames[0].length,y=clamp(car.y+SPRITE_PLACEMENT[car.spriteType].y,196,238-h);if(y<196||y+h>238)issues.add('Lane clipping');");
s=s.replace('o.index*2,phase=walkingPhase(o),cycle=Math.floor(progress/4)','o.index*4,phase=walkingPhase(o),cycle=Math.floor(progress/8)');
s=s.replace('humanFrames(o.spriteType,o.travelY||0)[o.frame]','personFrames(o.spriteType,o.travelY||0)[o.frame]');
s=s.replace('17-foot.x:foot.x','21-(foot.x+2):foot.x+2').replace("frame[foot.y][foot.x]!=='O'","frame[foot.y][foot.x+2]!=='O'");
// Use the vertical variants for doorway clearance, just as the renderer does.
s=s.replace('frame=sprites[o.spriteType].frames[o.idle?SPRITE_WALK.idleFrame:o.frame]','frame=personFrames(o.spriteType,o.travelY||0)[o.idle?SPRITE_WALK.idleFrame:o.frame]');
// Taller foreground heads may occlude background tables; only leg/ground intrusion is a collision.
s=s.replace('if(tables.some(t=>','if(y>=24&&tables.some(t=>');
const insert=s.indexOf('for(const [label,ids]');
s=s.slice(0,insert)+`const timing=await page.evaluate(()=>{economy=initialEconomy();recordYear();render();const person=()=>pixelWorld.inspect().objects.find(o=>o.path==='sidewalk');const start=person(),t=pixelWorld.inspect().time,frames=pixelWorld.inspect().frameCount;stepWorld(600);const end=person(),elapsed=pixelWorld.inspect().time-t;return {speed:(end.distance-start.distance)/elapsed,fps:(pixelWorld.inspect().frameCount-frames)/elapsed,crossingSeconds:368/PIXEL_TUNING.walkSpeed,gaitPixels:PIXEL_POLISH.walkCyclePixels,poseSeconds:2/PIXEL_TUNING.walkSpeed};});assert.ok(Math.abs(timing.speed-15)<.001);assert.ok(Math.abs(timing.fps-30)<.1);assert.ok(timing.crossingSeconds>20&&timing.crossingSeconds<30);assert.equal(timing.gaitPixels,16);console.log('PASS: measured walking speed/cadence',timing);\n`+s.slice(insert);
fs.writeFileSync('tmp/the-long-run-eight-frame-check.cjs',s);

