const fs=require('node:fs');let s=fs.readFileSync('tmp/the-long-run-natural-actors-check.cjs','utf8');
s=s.replaceAll('tmp/the-long-run-pre-natural-actors.html','tmp/the-long-run-pre-footfall.html');
const start=s.indexOf('const scrub='),end=s.indexOf('assert.equal(scrub',start);
s=s.slice(0,start)+`const scrub=s=>s.replace(/walkSpeed:(3.3|4),/,'walkSpeed:SPEED,').replace(/\/\/ Native 18 × 27 people[\\s\\S]*?(?=const sprites=\\{)/,'ACTOR_ART\\n').replace(/function spriteImage[\\s\\S]*?(?=  function fixedPerson)/,'ACTOR_RENDER\\n').replace(/      locate\\(object\\);[\\s\\S]*?(?=\\n    }\\n  }\\n  function rect)/,'WALK_PHASE').replace(/object.idle\\?SPRITE_WALK.idleFrame:object.frame,object.direction,object.index(?:,object.travelY\\|\\|0)?\\);/,'DRAW_PERSON');\n`+s.slice(end);
s=s.replaceAll('long-run-actors-', 'long-run-footfall-actors-').replaceAll('long-run-natural-','long-run-footfall-');
s=s.replace('sprites[type].frames.forEach((frame,f)=>{','sprites[type].frames.slice(0,5).forEach((frame,f)=>{');
s=s.replace('const issues=new Set(),isCar=', 'const issues=new Set(),plants=new Map();let plantChecks=0;const isCar=');
const needle="if(!o.active||isCar(o))continue;const off=";
s=s.replace(needle,`if(!o.active||isCar(o))continue;
    if(o.path&&o.wait<=0){
      const progress=(o.travelY?Math.round(o.y)*o.travelY:Math.round(o.x)*o.direction)+o.index*2,phase=walkingPhase(o),cycle=Math.floor(progress/4),feet=walkingFeet(phase,o.travelY||0),frame=humanFrames(o.spriteType,o.travelY||0)[o.frame];
      const foot=feet.planted,offset=SPRITE_PLACEMENT[o.spriteType],x=Math.round(o.x)+offset.x+(o.direction<0?17-foot.x:foot.x),y=Math.round(o.y)+offset.y+foot.y;
      if(frame[foot.y][foot.x]!=='O')issues.add('Missing planted sole');
      const prior=plants.get(key(o));if(prior&&prior.cycle===cycle&&prior.axis===o.travelY&&prior.direction===o.direction){plantChecks++;if(x!==prior.x||y!==prior.y)issues.add('Planted foot slides');}
      plants.set(key(o),{cycle,x,y,axis:o.travelY,direction:o.direction});
    }
    const off=`);
s=s.replace('return {issues:[...issues],frames:pixelWorld.inspect().frameCount};','return {issues:[...issues],frames:pixelWorld.inspect().frameCount,plantChecks};');
s=s.replace('assert.deepEqual(check.issues,[]);','assert.deepEqual(check.issues,[]);assert.ok(check.plantChecks>10000);');
fs.writeFileSync('tmp/the-long-run-footfall-check.cjs',s.replace('replace(/// Native','replace(/[/][/] Native'));
